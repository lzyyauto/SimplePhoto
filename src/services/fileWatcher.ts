import { watch } from 'chokidar';
import { IMAGES_DIR, SUPPORTED_FORMATS } from '../utils/constants';
import { ImageInfo } from '../types/image';
import { processImage } from './imageService';
import { logError, logInfo } from '../utils/logger';
import path from 'path';

const isImage = (filePath: string): boolean => {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_FORMATS.includes(ext);
};

export function createWatcher(
  onAdd: (image: ImageInfo) => void,
  onRemove: (path: string) => void
): void {
  logInfo('FileWatcher', `开始监听目录: ${path.resolve(IMAGES_DIR)}`);

  const watcher = watch(IMAGES_DIR, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: false,
    recursive: true,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100
    }
  });

  let initialized = false;
  const processedFiles = new Set<string>();

  watcher
    .on('ready', () => {
      initialized = true;
      logInfo('FileWatcher', '初始扫描完成');
    })
    .on('add', async (filePath) => {
      if (processedFiles.has(filePath) || !isImage(filePath)) return;
      
      try {
        const imageInfo = await processImage(filePath);
        processedFiles.add(filePath);
        onAdd(imageInfo);
      } catch (error) {
        await logError('FileWatcher', error);
      }
    })
    .on('change', async (filePath) => {
      if (!isImage(filePath)) return;
      
      try {
        const imageInfo = await processImage(filePath);
        onAdd(imageInfo);
      } catch (error) {
        await logError('FileWatcher', error);
      }
    })
    .on('unlink', (filePath) => {
      processedFiles.delete(filePath);
      if (isImage(filePath)) {
        onRemove(filePath);
      }
    })
    .on('error', (error) => {
      logError('FileWatcher', error);
    });

  setTimeout(() => {
    if (!initialized) {
      logInfo('FileWatcher', '强制重新扫描目录');
      watcher.close().then(() => createWatcher(onAdd, onRemove));
    }
  }, 5000);
}