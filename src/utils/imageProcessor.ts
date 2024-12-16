import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import type { ImageInfo } from '../types/image';

const THUMBNAIL_DIR = 'thumbnails';
const THUMBNAIL_SIZE = 400; // 缩略图最大边长

export function getThumbnailPath(imagePath: string): string {
  const normalizedPath = imagePath.replace(/^\//, '');
  return '/' + path.join('thumbnails', normalizedPath).replace(/\\/g, '/');
}

export async function generateThumbnail(imagePath: string): Promise<string> {
  const thumbnailPath = getThumbnailPath(imagePath);
  const inputPath = imagePath.replace(/^public\//, '');
  const fullInputPath = path.join('public', inputPath);
  const fullOutputPath = path.join('public', thumbnailPath);
  
  await fs.mkdir(path.dirname(fullOutputPath), { recursive: true });
  
  await sharp(fullInputPath)
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toFile(fullOutputPath);
    
  return thumbnailPath;
}