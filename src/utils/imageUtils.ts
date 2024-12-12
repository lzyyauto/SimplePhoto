import { ImageInfo } from '../types/image';
import path from 'path';

export function sortImagesByDate(images: ImageInfo[]): ImageInfo[] {
  return [...images].sort((a, b) => {
    const dateA = extractDateFromPath(a.path);
    const dateB = extractDateFromPath(b.path);
    return dateB.getTime() - dateA.getTime();
  });
}

export function extractDateFromPath(imagePath: string): Date {
  const filename = path.basename(imagePath);
  // Try to extract date from filename or use file creation date
  const matches = filename.match(/(\d{4})[-年](\d{2})?[-月]?(\d{2})?/);
  if (matches) {
    const [_, year, month = '01', day = '01'] = matches;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  return new Date();
}

export function groupImagesByFolder(images: ImageInfo[]): Record<string, ImageInfo[]> {
  return images.reduce((acc, image) => {
    const folder = path.dirname(image.path);
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(image);
    return acc;
  }, {} as Record<string, ImageInfo[]>);
}