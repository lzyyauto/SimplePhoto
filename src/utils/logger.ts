import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';

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

export async function logError(context: string, error: any) {
  const content = `${context}: ${error.message}\n${error.stack}\n`;
  await writeLog('error', content);
}

export async function logInfo(context: string, message: string, data?: any) {
  const content = data 
    ? `${context}: ${message} ${JSON.stringify(data)}`
    : `${context}: ${message}`;
  await writeLog('info', content);
} 