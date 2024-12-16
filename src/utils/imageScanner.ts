import { readdir, stat } from 'fs/promises';
import path from 'path';
import { PUBLIC_DIR, IMAGES_DIR, IMAGES_PATH } from './constants';
import { processImage } from '../services/imageService';
import { logInfo, logError } from './logger';

export async function scanAllImages() {
  try {
    const fullPath = path.resolve(IMAGES_PATH);
    logInfo('ImageScanner', `开始扫描图片目录: ${fullPath}`);
    await scanDirectory(fullPath);
    logInfo('ImageScanner', '图片扫描完成');
  } catch (error) {
    await logError('ImageScanner', '扫描过程出错:', error);
  }
}

async function scanDirectory(dirPath: string) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(IMAGES_PATH, fullPath);
      
      if (entry.isDirectory()) {
        logInfo('ImageScanner', `扫描子目录: ${relativePath}`);
        await scanDirectory(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
          logInfo('ImageScanner', `处理图片: ${relativePath}`);
          await processImage(path.join('images', relativePath));
        }
      }
    }
  } catch (error) {
    await logError('ImageScanner', `扫描目录失败 ${dirPath}:`, error);
    throw error;
  }
}