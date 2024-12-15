import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';
import { appendFile } from 'fs/promises';

const LOG_DIR = 'logs';

async function ensureLogDir() {
  const logPath = path.join(process.cwd(), LOG_DIR);
  try {
    await fs.access(logPath);
  } catch {
    await fs.mkdir(logPath, { recursive: true });
  }
  return logPath;
}

async function writeLog(filename: string, content: string) {
  const logPath = await ensureLogDir();
  const date = format(new Date(), 'yyyy-MM-dd');
  const time = format(new Date(), 'HH:mm:ss');
  const logFile = path.join(logPath, `${filename}-${date}.log`);
  await fs.appendFile(logFile, `[${time}] ${content}\n`, 'utf-8');
}

export async function logError(module: string, message: string, error: any) {
  const errorMessage = error?.message || error?.toString() || '未知错误';
  const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const logEntry = `[${timestamp}] ${module}: ${message} ${errorMessage}`;
  
  console.error(logEntry);
  await appendFile('logs/error-2024-12-15.log', logEntry + '\n');
}

export async function logInfo(context: string, message: string, data?: any) {
  const content = data 
    ? `${context}: ${message} ${JSON.stringify(data)}`
    : `${context}: ${message}`;
  await writeLog('info', content);
} 