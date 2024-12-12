# Image Gallery

A modern image gallery built with Astro, featuring folder-based browsing, thumbnail generation, and responsive design.

[中文文档](README_zh.md)

## ✨ Features

- 📁 Auto-generates gallery from folder structure
- 🖼️ Automatic thumbnail generation
- 📱 Responsive design for all devices
- 🚀 Fast image loading with optimized thumbnails
- 📝 File system monitoring for real-time updates
- 🔒 Error logging and handling

## 🛠️ Tech Stack

- **Framework:** Astro + Vue 3
- **Image Processing:** Sharp
- **File Watching:** Chokidar
- **UI Components:** PhotoSwipe
- **Styling:** Tailwind CSS
- **Build Tools:** Vite
- **Container:** Docker

## 📁 Project Structure

```
/
├── public/
│   ├── images/      # Image resources
│   └── thumbnails/  # Generated thumbnails
├── src/
│   ├── components/  # Vue & Astro components
│   ├── services/    # Core services
│   │   ├── fileWatcher.ts    # File system monitoring
│   │   ├── imageService.ts   # Image processing
│   │   └── watcherService.ts # Watcher management
│   ├── utils/      # Utility functions
│   │   ├── logger.ts    # Error logging
│   │   └── constants.ts # System constants
│   └── pages/      # Astro pages
├── logs/           # Application logs
└── docker/         # Docker configuration
```

## 🚀 Getting Started

1. **Installation**
```bash
npm install
```

2. **Development**
```bash
npm run dev
```

3. **Production Build**
```bash
npm run build
npm run preview
```

4. **Docker Deployment**
```bash
./scripts/docker-build.sh
./scripts/docker-run.sh
```

## 💻 Configuration

Key configurations in `src/utils/constants.ts`:
```typescript
export const IMAGES_DIR = 'public/images';
export const THUMBNAILS_DIR = 'public/thumbnails';
export const THUMBNAIL_SIZE = 300;
export const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'];
```

## 📝 Development Notes

- Images are processed using Sharp for optimal performance
- File system changes are monitored in real-time
- Errors are logged to `logs/error-YYYY-MM-DD.log`
- Thumbnails are generated on first access

## 🔜 Roadmap

- [ ] Image metadata extraction
- [ ] Custom theme support
- [ ] Advanced search capabilities
- [ ] Image optimization improvements
- [ ] Enhanced mobile gestures

## 📄 License

MIT License
