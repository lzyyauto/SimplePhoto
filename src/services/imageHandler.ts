import { ImageInfo } from '../types/image';
import { processImage, createThumbnail } from './imageProcessor';
import { getPublicPath, getThumbnailPath } from '../utils/fileUtils';
import { THUMBNAIL_SIZE } from '../constants';

export async function handleImageAdd(filePath: string): Promise<ImageInfo> {
  const metadata = await processImage(filePath);
  const thumbnailPath = getThumbnailPath(filePath);
  
  await createThumbnail(filePath, thumbnailPath, THUMBNAIL_SIZE);
  
  return {
    path: getPublicPath(filePath),
    thumbnail: thumbnailPath,
    ...metadata
  };
}

export async function handleImageRemove(filePath: string): Promise<void> {
  // Handle cleanup if needed
}