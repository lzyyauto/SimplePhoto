import type { APIRoute } from 'astro';
import { IMAGES_PATH, IMAGES_URL } from '../../utils/constants';
import { readdir } from 'fs/promises';
import path from 'path';
import { processImage } from '../../services/imageService';
import { logInfo, logError } from '../../utils/logger';

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
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
          const imageInfo = await processImage(path.join(fullPath, entry.name));
          if (imageInfo) {
            items.push({
              type: 'image',
              info: {
                ...imageInfo,
                path: path.join(IMAGES_URL, relativePath),
                originalName: entry.name
              }
            });
          }
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