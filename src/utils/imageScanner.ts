import { watch } from 'chokidar';
import { join } from 'path';
import sharp from 'sharp';
import fs from 'fs/promises';

export interface ImageInfo {
  path: string;
  thumbnail: string;
  width: number;
  height: number;
  size: number;
}

const THUMBNAIL_SIZE = 300;
const IMAGES_DIR = 'public/images';
const THUMBNAILS_DIR = 'public/thumbnails';

export async function createThumbnail(imagePath: string): Promise<string> {
  const relativePath = imagePath.replace('public/', '');
  const thumbnailPath = join(THUMBNAILS_DIR, relativePath);
  
  await fs.mkdir(join(process.cwd(), thumbnailPath, '..'), { recursive: true });
  
  await sharp(imagePath)
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
      fit: 'cover',
      position: 'center'
    })
    .toFile(join(process.cwd(), thumbnailPath));
    
  return thumbnailPath;
}

export async function scanImages(): Promise<ImageInfo[]> {
  const images: ImageInfo[] = [];
  
  const processImage = async (path: string) => {
    const metadata = await sharp(path).metadata();
    const stats = await fs.stat(path);
    const thumbnailPath = await createThumbnail(path);
    
    images.push({
      path: path.replace('public/', ''),
      thumbnail: thumbnailPath.replace('public/', ''),
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: stats.size
    });
  };
  
  const watcher = watch(IMAGES_DIR, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });
  
  watcher
    .on('add', processImage)
    .on('change', processImage)
    .on('unlink', (path) => {
      const index = images.findIndex(img => img.path === path);
      if (index > -1) {
        images.splice(index, 1);
      }
    });
    
  return images;
}