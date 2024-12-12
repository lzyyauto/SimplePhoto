import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { IMAGES_DIR, THUMBNAILS_DIR, PUBLIC_PATH } from '../utils/constants'
import { db } from './dbService'
import { logInfo, logError } from '../utils/logger'

const THUMBNAIL_SIZE_THRESHOLD = 1024 * 1024; // 1MB

export async function processImage(imagePath: string) {
  try {
    logInfo('ImageService', `开始处理图片: ${imagePath}`);
    
    // 1. 获取图片信息
    const stats = await fs.stat(imagePath);
    const metadata = await sharp(imagePath).metadata();
    
    // 2. 生成相对路径，移除 public 前缀
    const relativePath = path.relative(path.join(process.cwd(), 'public', IMAGES_DIR), imagePath);
    const publicPath = `/${IMAGES_DIR}/${relativePath}`;

    // 3. 判断是否需要生成缩略图
    let thumbnailPath = publicPath; // 默认使用原图路径
    if (stats.size > THUMBNAIL_SIZE_THRESHOLD) {
      logInfo('ImageService', `图片大于${THUMBNAIL_SIZE_THRESHOLD}字节，生成缩略图`);
      
      // 确保使用正确的缩略图路径
      const thumbnailFullPath = path.join(PUBLIC_PATH, THUMBNAILS_DIR, relativePath);
      const thumbnailDir = path.dirname(thumbnailFullPath);
      
      // 确保缩略图目录存在
      await fs.mkdir(thumbnailDir, { recursive: true });
      
      // 生成缩略图
      await sharp(imagePath)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFile(thumbnailFullPath);
      
      thumbnailPath = `/${THUMBNAILS_DIR}/${relativePath}`;
      logInfo('ImageService', `缩略图已生成: ${thumbnailPath}`);
    }

    // 4. 保存到数据库
    const imageData = {
      path: publicPath,
      thumbnailPath,
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: stats.size,
      format: metadata.format,
      last_modified: Math.floor(stats.mtimeMs / 1000),
      created_at: Math.floor(Date.now() / 1000)
    };

    await db.saveImage(publicPath, imageData);
    logInfo('ImageService', `图片处理完成: ${publicPath}`);
    
    return imageData;
  } catch (error) {
    await logError('ImageService', `处理图片失败: ${imagePath}`, error);
    throw error;
  }
}

export async function initImageService() {
  try {
    logInfo('ImageService', 'Initializing image service...')
    
    // 初始化数据库
    await db.init()
    logInfo('ImageService', 'Database initialized')
    
    // 确保缩略图目录存在
    await fs.mkdir(path.join('public', THUMBNAILS_DIR), { recursive: true })
    logInfo('ImageService', 'Thumbnail directory created')

    return true
  } catch (error) {
    await logError('ImageService', 'Failed to initialize image service:', error)
    return false
  }
}