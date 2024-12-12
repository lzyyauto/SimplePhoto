import { watch } from 'chokidar';
import { IMAGES_DIR } from '../utils/constants';
import { ImageInfo } from '../types/image';
import { processImage } from './imageService';
import { isImage } from '../utils/fileUtils';
import { logError, logInfo } from '../utils/logger';

export function createImageWatcher(
  onAdd: (image: ImageInfo) => void,
  onRemove: (path: string) => void
) {
  const watcher = watch(IMAGES_DIR, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: false
  });
  
  watcher
    .on('add', async (filePath) => {
      if (await isImage(filePath)) {
        try {
          const imageInfo = await processImage(filePath);
          onAdd(imageInfo);
        } catch (error) {
          await logError('ImageWatcher', error);
        }
      }
    })
    .on('change', async (filePath) => {
      if (await isImage(filePath)) {
        try {
          const imageInfo = await processImage(filePath);
          onAdd(imageInfo);
        } catch (error) {
          await logError('ImageWatcher', error);
        }
      }
    })
    .on('unlink', (filePath) => {
      onRemove(filePath);
    });
    
  return watcher;
}