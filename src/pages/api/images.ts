import type { APIRoute } from 'astro';
import { IMAGES_PATH, IMAGES_URL } from '../../utils/constants';
import { readdir } from 'fs/promises';
import path from 'path';
import { processImage } from '../../services/imageService';
import { logInfo, logError } from '../../utils/logger';
import { db } from '../../services/dbService';

// 支持的图片格式
const SUPPORTED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', 
  '.heic', '.heif',  // 添加 HEIC/HEIF 支持
  '.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP', 
  '.HEIC', '.HEIF'   // 添加大写扩展名
];

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const requestPath = decodeURIComponent(url.searchParams.get('path') || '');
    logInfo('API/images', `请求路径: ${requestPath}`);
    
    const fullPath = path.join(IMAGES_PATH, requestPath);
    logInfo('API/images', `完整路径: ${fullPath}`);

    const entries = await readdir(fullPath, { withFileTypes: true });
    const items = [];

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const relativePath = path.join(requestPath, entry.name);
      
      if (entry.isDirectory()) {
        items.push({
          type: 'folder',
          name: entry.name,
          path: relativePath
        });
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.includes(ext.toLowerCase())) {
          const imagePath = '/' + path.join('images', relativePath).replace(/\\/g, '/');
          
          // 先查询数据库
          let imageInfo = await db.getImage(imagePath);
          
          // 如果数据库中没有记录，则处理图片
          if (!imageInfo) {
            logInfo('API/images', `处理新图片: ${entry.name} (${ext})`);
            try {
              imageInfo = await processImage(path.join(fullPath, entry.name));
            } catch (error) {
              logError('API/images', `处理图片失败: ${entry.name}`, error);
              continue;
            }
          }

          items.push({
            type: 'image',
            info: {
              ...imageInfo,
              originalName: entry.name
            }
          });
        }
      }
    }

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    await logError('API/images', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 