import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { ImageMetadata } from '../types/image';
import { logError, logInfo } from '../utils/logger';
import path from 'path';
import fs from 'fs/promises';

const DB_DIR = 'data';
const DB_FILE = 'gallery.db';

export class DatabaseService {
  private db: any;

  async init() {
    try {
      // 确保数据目录存在
      const dbDir = path.join(process.cwd(), DB_DIR);
      try {
        await fs.access(dbDir);
      } catch {
        logInfo('DatabaseService', `创建数据库目录: ${dbDir}`);
        await fs.mkdir(dbDir, { recursive: true });
      }

      const dbPath = path.join(dbDir, DB_FILE);
      logInfo('DatabaseService', `初始化数据库: ${dbPath}`);

      this.db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      await this.createTables();
      logInfo('DatabaseService', '数据库初始化完成');
      return true;
    } catch (error) {
      await logError('DatabaseService', '数据库初始化失败:', error);
      throw error;
    }
  }

  private async createTables() {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE,
        thumbnail_path TEXT,
        width INTEGER,
        height INTEGER,
        size INTEGER,
        format TEXT,
        last_modified INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);
    logInfo('DatabaseService', '数据表创建/确认完成');
  }

  async getImage(path: string) {
    return await this.db.get('SELECT * FROM images WHERE path = ?', [path]);
  }

  async saveImage(path: string, metadata: ImageMetadata & { thumbnailPath: string }) {
    const lastModified = Math.floor(Date.now() / 1000);
    await this.db.run(`
      INSERT OR REPLACE INTO images 
      (path, thumbnail_path, width, height, size, format, last_modified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [path, metadata.thumbnailPath, metadata.width, metadata.height, 
        metadata.size, metadata.format, lastModified]);
  }

  async removeImage(path: string) {
    await this.db.run('DELETE FROM images WHERE path = ?', [path]);
  }
}

export const db = new DatabaseService(); 