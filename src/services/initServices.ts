import { db } from './dbService';
import { startFileWatcher } from './fileWatcher';
import { scanAllImages } from '../utils/imageScanner';
import { logInfo, logError } from '../utils/logger';

export async function initializeServices() {
  try {
    logInfo('InitServices', '=== 开始初始化服务 ===');
    
    // 1. 初始化数据库
    logInfo('InitServices', '1. 初始化数据库');
    await db.init();
    
    // 2. 执行初始扫描
    logInfo('InitServices', '2. 开始扫描所有图片');
    await scanAllImages();
    
    // 3. 启动文件监控
    logInfo('InitServices', '3. 启动文件监控服务');
    await startFileWatcher();
    
    logInfo('InitServices', '=== 服务初始化完成 ===');
  } catch (error) {
    await logError('InitServices', '服务初始化失败:', error);
    throw error;
  }
} 