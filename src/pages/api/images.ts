import type { APIRoute } from 'astro';
import { processImage } from '../../services/imageService';
import { IMAGES_DIR } from '../../utils/constants';
import { readdir, stat } from 'fs/promises';
import path from 'path';

export const GET: APIRoute = async ({ url }) => {
  try {
    const requestPath = decodeURIComponent(url.searchParams.get('path') || '');
    
    // 使用 path.join 而不是 resolve，确保相对路径正确
    const fullPath = path.join(process.cwd(), IMAGES_DIR, requestPath);
    
    console.log('\n=== 路径信息 ===', {
      requestPath,
      fullPath,
      IMAGES_DIR,
      cwd: process.cwd()
    });

    const stats = await stat(fullPath);
    if (!stats.isDirectory()) {
      throw new Error(`不是有效的目录: ${requestPath}`);
    }

    const entries = await readdir(fullPath, { withFileTypes: true });
    console.log('\n=== 目录内容 ===', {
      path: fullPath,
      entries: entries.map(e => ({
        name: e.name,
        isDirectory: e.isDirectory()
      }))
    });

    const items = [];

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const entryFullPath = path.join(fullPath, entry.name);
      const entryRelativePath = path.join(requestPath, entry.name);
      
      console.log('处理项目:', {
        name: entry.name,
        fullPath: entryFullPath,
        relativePath: entryRelativePath
      });

      if (entry.isDirectory()) {
        items.push({
          type: 'folder',
          name: entry.name,
          path: entryRelativePath
        });
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'].includes(ext)) {
          try {
            const imageInfo = await processImage(entryFullPath);
            items.push({
              type: 'image',
              info: {
                ...imageInfo,
                originalName: entry.name
              }
            });
          } catch (error) {
            console.error('处理图片失败:', {
              file: entry.name,
              error: error.message
            });
          }
        }
      }
    }

    console.log('\n=== 返回结果 ===');
    console.log(JSON.stringify(items, null, 2));

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('API错误:', error);
    return new Response(JSON.stringify({ 
      error: String(error),
      requestPath: url.searchParams.get('path')
    }), { 
      status: 500 
    });
  }
} 