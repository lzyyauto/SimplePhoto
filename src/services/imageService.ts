import sharp from 'sharp'
import path from 'path'
import { stat, mkdir } from 'fs/promises'
import { THUMBNAIL_SIZE, THUMBNAILS_DIR, IMAGES_DIR } from '../utils/constants'
import { logError, logInfo } from '../utils/logger'
import { db } from './dbService'
import { watch } from 'chokidar'

async function getImageMetadata(imagePath: string) {
  const metadata = await sharp(imagePath).metadata()
  const stats = await stat(imagePath)
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    size: stats.size
  }
}

async function generateThumbnail(imagePath: string): Promise<string> {
  const relativePath = path.relative(IMAGES_DIR, imagePath)
  const thumbnailPath = path.join(THUMBNAILS_DIR, relativePath)
  
  try {
    await mkdir(path.dirname(thumbnailPath), { recursive: true })
    await sharp(imagePath)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(thumbnailPath)
    
    return thumbnailPath.replace('public', '')
  } catch (error) {
    await logError('generateThumbnail', error)
    throw error
  }
}

async function processImage(imagePath: string) {
  try {
    // 尝试从数据库获取，如果数据库未初始化或查询失败则跳过
    try {
      const cached = await db.getImage(imagePath);
      if (cached) {
        return {
          path: cached.path,
          thumbnail: cached.thumbnail_path,
          width: cached.width,
          height: cached.height,
          size: cached.size
        };
      }
    } catch (error) {
      await logError('processImage', 'Database query failed, falling back to file processing');
    }

    const metadata = await getImageMetadata(imagePath);
    const relativePath = path.relative(IMAGES_DIR, imagePath);
    const publicPath = `/images/${relativePath.replace(/\\/g, '/')}`;
    const thumbnailPath = await generateThumbnail(imagePath);
    
    // 尝试保存到数据库，如果失败则继续
    try {
      await db.saveImage(imagePath, {
        ...metadata,
        thumbnailPath,
        format: path.extname(imagePath).slice(1)
      });
    } catch (error) {
      await logError('processImage', 'Failed to save to database');
    }
    
    return {
      path: publicPath,
      thumbnail: thumbnailPath,
      width: metadata.width,
      height: metadata.height,
      size: metadata.size
    };
  } catch (error) {
    await logError('processImage', error);
    throw error;
  }
}

// 修改初始化函数
export async function initImageService() {
  try {
    const dbInitialized = await db.init();
    if (!dbInitialized) {
      await logError('ImageService', 'Database initialization failed, continuing without database');
    }

    const watcher = watch(IMAGES_DIR, {
      ignored: /(^|[\/\\])\../,
      persistent: true
    })

    watcher
      .on('add', async (filePath) => {
        if (path.extname(filePath).toLowerCase() in ['.jpg', '.jpeg', '.png', '.gif', '.webp']) {
          await processImage(filePath)
        }
      })
      .on('unlink', async (filePath) => {
        await db.removeImage(filePath)
      })

    logInfo('ImageService', 'File watcher started')
  } catch (error) {
    await logError('ImageService', error);
    // 即使初始化失败也不抛出错误，让服务继续运行
  }
}

export { processImage, getImageMetadata }