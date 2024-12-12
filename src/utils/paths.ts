import { join } from 'path';

export function getPublicPath(path: string): string {
  return path.replace('public/', '');
}

export function getThumbnailPath(imagePath: string): string {
  const relativePath = getPublicPath(imagePath);
  return join('thumbnails', relativePath);
}

export function getFullPath(relativePath: string): string {
  return join(process.cwd(), 'public', relativePath);
}