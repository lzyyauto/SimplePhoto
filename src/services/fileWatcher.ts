import chokidar from 'chokidar';
import path from 'path';
import { IMAGES_DIR } from '../utils/constants';
import { processImage } from './imageService';
import { db } from './dbService';
import { logInfo, logError } from '../utils/logger';

export async function startFileWatcher() {
  const watchPath = path.join(process.cwd(), 'public', IMAGES_DIR);
  logInfo('FileWatcher', `开始监控目录: ${watchPath}`);

  const watcher = chokidar.watch(watchPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: false // 启动时触发 add 事件
  });

  watcher
    .on('add', async (filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        logInfo('FileWatcher', `发现新文件: ${filePath}`);
        await processImage(filePath);
      }
    })
    .on('change', async (filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        logInfo('FileWatcher', `文件变更: ${filePath}`);
        await processImage(filePath);
      }
    })
    .on('unlink', async (filePath) => {
      logInfo('FileWatcher', `文件删除: ${filePath}`);
      const relativePath = path.relative(path.join(process.cwd(), 'public'), filePath);
      const publicPath = `/${relativePath}`;
      await db.removeImage(publicPath);
    });

  logInfo('FileWatcher', '文件监控服务已启动');
}