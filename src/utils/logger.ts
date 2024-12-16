const isServer = typeof window === 'undefined';

let appendFile: Function;
if (isServer) {
  // 使用动态 import 替代 require
  import('fs/promises').then(fs => {
    appendFile = fs.appendFile;
  });
}

export async function logError(module: string, message: string, error: any) {
  const errorMessage = error?.message || error?.toString() || '未知错误';
  const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const logEntry = `[${timestamp}] ${module}: ${message} ${errorMessage}`;
  
  console.error(logEntry);
  
  if (isServer && appendFile) {
    await appendFile('logs/error-2024-12-15.log', logEntry + '\n');
  }
}

export async function logInfo(context: string, message: string, data?: any) {
  const content = data 
    ? `${context}: ${message} ${JSON.stringify(data)}`
    : `${context}: ${message}`;
    
  console.log(content);
  
  if (isServer && appendFile) {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    const logEntry = `[${time}] ${content}\n`;
    await appendFile('logs/info-2024-12-15.log', logEntry);
  }
} 