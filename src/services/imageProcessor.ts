import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import chokidar from 'chokidar';
import { ImageMetadata } from '../types/image';
import { getFullPath } from '../utils/paths';
import { db } from './dbService';
import { logInfo, logError } from '../utils/logger';

const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const THUMBNAIL_SIZE = 300;

export class ImageProcessor {
  private watcher: chokidar.FSWatcher | null = null;

  async init(watchPath: string) {
    await db.init();
    this.startWatching(watchPath);
  }

  private startWatching(watchPath: string) {
    this.watcher = chokidar.watch(watchPath, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: false
    });

    this.watcher
      .on('add', async (filePath) => {
        if (await this.isImage(filePath)) {
          await this.handleNewImage(filePath);
        }
      })
      .on('change', async (filePath) => {
        if (await this.isImage(filePath)) {
          await this.handleImageChange(filePath);
        }
      })
      .on('unlink', async (filePath) => {
        await this.handleImageRemove(filePath);
      });

    logInfo('ImageProcessor', `Started watching: ${watchPath}`);
  }

  async isImage(filePath: string): Promise<boolean> {
    const ext = path.extname(filePath).toLowerCase();
    return SUPPORTED_FORMATS.includes(ext);
  }

  private async handleNewImage(filePath: string) {
    try {
      const existing = await db.getImage(filePath);
      if (!existing) {
        const metadata = await this.processImage(filePath);
        const thumbnailPath = this.getThumbnailPath(filePath);
        await this.createThumbnail(filePath, thumbnailPath, THUMBNAIL_SIZE);
        await db.saveImage(filePath, { ...metadata, thumbnailPath });
      }
    } catch (error) {
      await logError('ImageProcessor', error);
    }
  }

  private async handleImageChange(filePath: string) {
    try {
      await this.handleNewImage(filePath);
    } catch (error) {
      await logError('ImageProcessor', error);
    }
  }

  private async handleImageRemove(filePath: string) {
    try {
      await db.removeImage(filePath);
      const thumbnailPath = this.getThumbnailPath(filePath);
      await fs.unlink(thumbnailPath).catch(() => {});
    } catch (error) {
      await logError('ImageProcessor', error);
    }
  }

  async processImage(filePath: string): Promise<ImageMetadata> {
    const fullPath = getFullPath(filePath);
    const metadata = await sharp(fullPath).metadata();
    const stats = await fs.stat(fullPath);
    
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: stats.size,
      format: metadata.format || 'unknown'
    };
  }

  async createThumbnail(
    inputPath: string,
    outputPath: string,
    size: number
  ): Promise<void> {
    const fullInputPath = getFullPath(inputPath);
    const fullOutputPath = getFullPath(outputPath);
    
    await fs.mkdir(path.dirname(fullOutputPath), { recursive: true });
    
    const image = sharp(fullInputPath);
    const metadata = await image.metadata();
    
    const ratio = metadata.width! / metadata.height!;
    const width = ratio > 1 ? size : Math.round(size * ratio);
    const height = ratio > 1 ? Math.round(size / ratio) : size;
    
    await image
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(fullOutputPath);
  }
}

export const imageProcessor = new ImageProcessor();