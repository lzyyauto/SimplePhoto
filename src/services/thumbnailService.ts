import fs from 'fs/promises';
import { join } from 'path';
import { THUMBNAIL_SIZE } from '../utils/constants';
import { getFullPath, getThumbnailPath } from '../utils/paths';
import { resizeImage } from '../utils/imageProcessor';

export async function createThumbnail(imagePath: string): Promise<string> {
  const thumbnailPath = getThumbnailPath(imagePath);
  const fullThumbnailPath = getFullPath(thumbnailPath);
  
  await fs.mkdir(join(fullThumbnailPath, '..'), { recursive: true });
  await resizeImage(imagePath, thumbnailPath, THUMBNAIL_SIZE);
  
  return thumbnailPath;
}