import path from 'path';
import { SUPPORTED_FORMATS } from '../constants';

export async function isImage(filePath: string): Promise<boolean> {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_FORMATS.includes(ext);
}

export function getPublicPath(filePath: string): string {
  return filePath.replace('public/', '');
}

export function getThumbnailPath(imagePath: string): string {
  const relativePath = getPublicPath(imagePath);
  return path.join('thumbnails', relativePath);
}