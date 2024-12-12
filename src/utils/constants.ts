import path from 'path';

// 基础路径
export const PUBLIC_DIR = 'public';
export const IMAGES_DIR = 'images';
export const THUMBNAILS_DIR = 'thumbnails';

// 完整路径
export const PUBLIC_PATH = path.join(process.cwd(), PUBLIC_DIR);
export const IMAGES_PATH = path.join(PUBLIC_PATH, IMAGES_DIR);
export const THUMBNAILS_PATH = path.join(PUBLIC_PATH, THUMBNAILS_DIR);

// URL 路径
export const IMAGES_URL = `/${IMAGES_DIR}`;
export const THUMBNAILS_URL = `/${THUMBNAILS_DIR}`;

export const THUMBNAIL_SIZE = 300;