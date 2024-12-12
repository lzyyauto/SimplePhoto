import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { ImageMetadata } from '../types/image';
import { logError } from '../utils/logger';
import path from 'path';

export class DatabaseService {
  private db: any;

  async init() {
    try {
      this.db = await open({
        filename: path.join(process.cwd(), 'data/gallery.db'),
        driver: sqlite3.Database
      });

      await this.createTables();
    } catch (error) {
      await logError('DatabaseService', error);
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