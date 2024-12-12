# 图片浏览网站

基于 Astro 构建的现代图片浏览网站，支持文件夹结构浏览、缩略图生成及响应式设计。

[English Documentation](README.md)

## ✨ 主要特性

- 📁 根据文件夹结构自动生成图片浏览界面
- 🖼️ 自动生成缩略图
- 📱 响应式设计，适配所有设备
- 🚀 优化的缩略图加载性能
- 📝 文件系统实时监控
- 🔒 错误日志记录和处理

## 🛠️ 技术栈

- **框架：** Astro + Vue 3
- **图片处理：** Sharp
- **文件监控：** Chokidar
- **UI组件：** PhotoSwipe
- **样式：** Tailwind CSS
- **构建工具：** Vite
- **容器化：** Docker

## 📁 项目结构

```
/
├── public/
│   ├── images/      # 图片资源目录
│   └── thumbnails/  # 生成的缩略图
├── src/
│   ├── components/  # Vue 和 Astro 组件
│   ├── services/    # 核心服务
│   │   ├── fileWatcher.ts    # 文件系统监控
│   │   ├── imageService.ts   # 图片处理
│   │   └── watcherService.ts # 监控管理
│   ├── utils/      # 工具函数
│   │   ├── logger.ts    # 错误日志
│   │   └── constants.ts # 系统常量
│   └── pages/      # Astro 页面
├── logs/           # 应用日志
└── docker/         # Docker 配置
```

## 🚀 快速开始

1. **安装依赖**
```bash
npm install
```

2. **开发环境**
```bash
npm run dev
```

3. **生产构建**
```bash
npm run build
npm run preview
```

4. **Docker 部署**
```bash
./scripts/docker-build.sh
./scripts/docker-run.sh
```

## 💻 配置说明

主要配置在 `src/utils/constants.ts`：
```typescript
export const IMAGES_DIR = 'public/images';
export const THUMBNAILS_DIR = 'public/thumbnails';
export const THUMBNAIL_SIZE = 300;
export const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'];
```

## 📝 开发说明

- 使用 Sharp 进行图片处理以获得最佳性能
- 实时监控文件系统变化
- 错误日志记录到 `logs/error-YYYY-MM-DD.log`
- 首次访问时生成缩略图

## 🔜 开发计划

- [ ] 图片元数据提取
- [ ] 自定义主题支持
- [ ] 高级搜索功能
- [ ] 图片优化改进
- [ ] 增强移动端手势

## 📄 许可证

MIT License 