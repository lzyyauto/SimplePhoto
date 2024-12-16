import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import heicConvert from 'heic-convert'
import { IMAGES_DIR, THUMBNAILS_DIR, PUBLIC_PATH, IMAGES_PATH } from '../utils/constants'
import { db } from './dbService'
import { logInfo, logError } from '../utils/logger'
import { readdir } from 'fs/promises';
import { generateThumbnail } from '../utils/imageProcessor';
import type { ImageInfo } from '../types/image';

const THUMBNAIL_SIZE_THRESHOLD = 1024 * 1024; // 1MB

// 支持的 HEIC/HEIF 扩展名
const HEIC_EXTENSIONS = ['.heic', '.heif', '.HEIC', '.HEIF'];

async function convertHeicToJpeg(inputPath: string): Promise<Buffer> {
  try {
    const inputBuffer = await fs.readFile(inputPath);
    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.9
    });
    logInfo('ImageService', 'HEIC 转换成功');
    return outputBuffer;
  } catch (error) {
    logError('ImageService', 'HEIC 转换失败:', error);
    throw error;
  }
}

async function extractHeicExif(inputPath: string) {
  try {
    const inputBuffer = await fs.readFile(inputPath);
    const { metadata } = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG', // 仍然需要转换以获取元数据
      quality: 0.1    // 使用低质量以加快速度
    });
    return metadata;
  } catch (error) {
    logError('ImageService', '提取 HEIC EXIF 失败:', error);
    return null;
  }
}

export async function processImage(filePath: string) {
  try {
    const normalizedPath = filePath.replace(/^.*public\//, '');
    const absolutePath = path.join(process.cwd(), 'public', normalizedPath);
    
    logInfo('ImageService', `处理图片，完整路径: ${absolutePath}`);
    
    // 检查文件是否存在
    try {
      await fs.access(absolutePath);
    } catch (error) {
      logError('ImageService', `文件不存在: ${absolutePath}`);
      return null;
    }

    // 获取图片信息
    const metadata = await sharp(absolutePath).metadata();
    const stats = await fs.stat(absolutePath);
    
    // 生成缩略图
    const thumbnailPath = await generateThumbnail(normalizedPath);
    
    // 保存到数据库
    await db.saveImage(normalizedPath, {
      originalPath: normalizedPath,
      thumbnailPath,
      width: metadata.width,
      height: metadata.height,
      size: stats.size,
      format: metadata.format,
      isAnimated: metadata.pages && metadata.pages > 1,
      last_modified: stats.mtimeMs,
      created_at: Date.now(),
      exif: metadata.exif
    });

    return thumbnailPath;
  } catch (error) {
    logError('ImageService', `处理图片失败: ${filePath}`, error);
    return null;
  }
}

export async function rescanAllImages() {
  try {
    logInfo('ImageService', '开始全局重新扫描');
    
    // 重置数据库
    await db.init(true); // 添加一个参数来指示是否重建表
    
    // 开始递归扫描
    await scanDirectory(IMAGES_PATH);
    
    logInfo('ImageService', '全局扫描完成');
  } catch (error) {
    logError('ImageService', '全局扫描失败:', error);
    throw error;
  }
}

async function scanDirectory(dirPath: string) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await scanDirectory(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.HEIC'].includes(ext)) {
          logInfo('ImageScanner', `处理图片: ${fullPath}`);
          try {
            await processImage(fullPath);
          } catch (error) {
            await logError('ImageScanner', `处理图片失败 ${fullPath}:`, error);
            // 可以选择继续处理其他图片而不中断
            continue;
          }
        }
      }
    }
  } catch (error) {
    await logError('ImageScanner', `扫描目录失败 ${dirPath}:`, error);
    throw error;
  } finally {
    // 清理工作
  }
}

export async function initImageService() {
  try {
    logInfo('ImageService', '初始化图片服务...');
    
    // 初始化数据库
    await db.init();
    
    // 确保缩略图目录存在
    await fs.mkdir(path.join('public', THUMBNAILS_DIR), { recursive: true });
    
    // 执行全局扫描
    await rescanAllImages();
    
    logInfo('ImageService', '图片服务初始化完成');
    return true;
  } catch (error) {
    logError('ImageService', '初始化图片服务失败:', error);
    return false;
  } finally {
    // 清理工作
  }
}

export async function scanAllImages() {
  try {
    const fullPath = path.join(process.cwd(), IMAGES_DIR);
    logInfo('ImageScanner', `实际扫描路径: ${fullPath}`);
    // ... 其余代码
  } catch (error) {
    logError('ImageService', '初始化图片服务失败:', error);
    return false;
  } finally {
    // 清理工作
  }
}