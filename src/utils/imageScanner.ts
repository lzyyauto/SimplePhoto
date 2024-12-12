import { readdir, stat } from 'fs/promises';
import path from 'path';
import { IMAGES_DIR } from './constants';
import { processImage } from '../services/imageService';
import { logInfo, logError } from './logger';

export async function scanAllImages() {
  try {
    logInfo('ImageScanner', '开始扫描图片目录');
    await scanDirectory(IMAGES_DIR);
    logInfo('ImageScanner', '图片扫描完成');
  } catch (error) {
    await logError('ImageScanner', '扫描过程出错:', error);
  }
}

async function scanDirectory(dirPath: string) {
  const fullPath = path.join(process.cwd(), dirPath);
  const entries = await readdir(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const entryPath = path.join(dirPath, entry.name);
    const entryFullPath = path.join(fullPath, entry.name);

    if (entry.isDirectory()) {
      logInfo('ImageScanner', `扫描子目录: ${entryPath}`);
      await scanDirectory(entryPath);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        logInfo('ImageScanner', `处理图片: ${entryPath}`);
        await processImage(entryFullPath);
      }
    }
  }
}