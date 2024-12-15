import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { logInfo, logError } from '../utils/logger';

class DatabaseService {
  private db: any = null;

  async init(rebuild: boolean = false) {
    try {
      this.db = await open({
        filename: 'data/gallery.db',
        driver: sqlite3.Database
      });

      if (rebuild) {
        // 如果需要重建，先删除表
        await this.db.exec('DROP TABLE IF EXISTS images');
      }

      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS images (
          path TEXT PRIMARY KEY,
          original_path TEXT,
          thumbnail_path TEXT,
          width INTEGER,
          height INTEGER,
          size INTEGER,
          format TEXT,
          is_animated BOOLEAN,
          last_modified INTEGER,
          created_at INTEGER,
          exif_data TEXT
        )
      `);

      logInfo('DatabaseService', rebuild ? '数据表重建完成' : '数据表确认完成');
    } catch (error) {
      logError('DatabaseService', '初始化数据库失败:', error);
      throw error;
    }
  }

  async saveImage(path: string, data: any) {
    try {
      const {
        originalPath,
        thumbnailPath,
        width,
        height,
        size,
        format,
        isAnimated,
        last_modified,
        created_at,
        exif
      } = data;

      await this.db.run(
        `INSERT OR REPLACE INTO images (
          path,
          original_path,
          thumbnail_path,
          width,
          height,
          size,
          format,
          is_animated,
          last_modified,
          created_at,
          exif_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          path,
          originalPath || path,
          thumbnailPath,
          width,
          height,
          size,
          format,
          isAnimated ? 1 : 0,
          last_modified,
          created_at,
          exif ? JSON.stringify(exif) : null
        ]
      );
    } catch (error) {
      logError('DatabaseService', '保存图片数据失败:', error);
      throw error;
    }
  }

  async getImage(path: string) {
    try {
      const row = await this.db.get('SELECT * FROM images WHERE path = ?', [path]);
      if (row) {
        return {
          ...row,
          isAnimated: Boolean(row.is_animated),
          exif: row.exif_data ? JSON.parse(row.exif_data) : null
        };
      }
      return null;
    } catch (error) {
      logError('DatabaseService', '获取图片数据失败:', error);
      throw error;
    }
  }
}

export const db = new DatabaseService(); 