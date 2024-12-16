# SimplePhoto 项目代码结构概览

本项目主要用于本地图片浏览，包含文件夹扫描、HEIC 转换、缩略图生成、数据库存储和图片预览等功能。

## 核心文件及方法

以下是项目中与核心业务逻辑相关的文件和方法：

### 1. `src/main/preload.ts`

该文件定义了主进程和渲染进程之间通信的桥梁。

*   `contextBridge.exposeInMainWorld('electronAPI', { ... })`: 将主进程的一些方法暴露给渲染进程，使其可以在浏览器环境中使用。
    *   `openDirectory()`: 打开文件夹选择对话框，并返回选择的文件夹路径。
    *   `scanDirectory(dirPath)`: 扫描指定文件夹下的图片文件，并返回文件信息。
    *   `readImage(imagePath)`: 读取指定路径的图片文件。
    *   `generateThumbnail(imagePath)`: 生成指定图片的缩略图。
    *   `getImagesFromDb(dirPath)`: 从数据库中读取指定文件夹的图片信息。
    *   `getImageDetail(imagePath)`: 从数据库中读取指定图片的详细信息。
    *   `deleteImageFromDb(imagePath)`: 从数据库中删除指定图片的信息。

### 2. `src/main/main.ts`

该文件是 Electron 主进程的入口。

*   `createWindow()`: 创建主窗口。
*   `ipcMain.handle('open-directory', ...)`: 响应渲染进程的 `openDirectory` 请求，打开文件夹选择对话框。
*   `ipcMain.handle('scan-directory', ...)`: 响应渲染进程的 `scanDirectory` 请求，调用 `imageService` 进行文件夹扫描。
* `ipcMain.handle('read-image', ...)`:响应渲染进程的 `readImage` 请求,读取图片信息.
* `ipcMain.handle('generate-thumbnail', ...)`: 响应渲染进程的`generateThumbnail`请求,生成缩略图.
* `ipcMain.handle('get-images-from-db', ...)`:响应渲染进程的`getImagesFromDb`请求,从数据库获取图片信息
* `ipcMain.handle('get-image-detail', ...)`:响应渲染进程的`getImageDetail`请求,从数据库获取图片详细信息
* `ipcMain.handle('delete-image-from-db', ...)`:响应渲染进程的`deleteImageFromDb`请求,从数据库删除图片信息

### 3. `src/services/imageService.ts`

该文件包含图片处理的核心逻辑。

*   `scanDirectory(dirPath: string)`: 扫描指定文件夹下的图片文件，并进行 HEIC 转换、缩略图生成和数据库存储。
*   `generateThumbnail(filePath: string)`: 生成指定图片的缩略图。
*   `handleHeic(filePath:string)`:将heic图片转码成jpg图片
*   `getImagesFromDb(dirPath: string)`:从数据库读取图片信息
*   `getImageDetail(imagePath: string)`:从数据库读取指定图片详细信息
*   `deleteImageFromDb(imagePath: string)`:从数据库删除图片信息

### 4. `src/utils/db.ts`

该文件负责数据库的初始化和操作。

*   `createDatabase()`: 创建数据库连接。
*   `insertImageInfo(imageInfo: ImageInfo)`: 将图片信息插入数据库。
*   `getImagesByDirectory(dirPath: string)`: 从数据库中查询指定目录下的图片信息。
* `getImageDetail(imagePath:string)`:从数据库中查询指定图片的详细信息
* `deleteImage(imagePath:string)`:从数据库删除指定图片信息

### 5. `src/renderer/src/App.tsx`

该文件是 React 应用的入口。

* 页面展示,图片预览等UI功能.

### 6.types文件

* `src/types/imageInfo.ts`: 定义了图片信息的类型 `ImageInfo`。

## 流程图与代码关联

结合你提供的 Mermaid 流程图，可以更好地理解代码的执行流程：

*   **首次启动：**
    *   `App.tsx` 加载后，检查数据库文件是否存在（在 `db.ts` 中）。
    *   如果不存在，调用 `electronAPI.scanDirectory()` (在 `preload.ts` 中)。
    *   `main.ts` 接收到请求后，调用 `imageService.scanDirectory()`。
    *   `imageService.scanDirectory()` 遍历文件夹、处理 HEIC 文件（`handleHeic`），生成缩略图 (`generateThumbnail`)，并将数据写入数据库 (`db.ts` 的 `insertImageInfo`)。
*   **打开文件夹：**
    *   `App.tsx` 调用 `electronAPI.openDirectory()` (在 `preload.ts` 中)。
    *   `main.ts` 接收到请求后，打开文件夹选择对话框，并将结果返回给渲染进程。
    *   `App.tsx` 接收到文件夹路径后，调用 `electronAPI.getImagesFromDb()`获取数据库中图片信息,进行展示
* **点击大图:**
    * `App.tsx` 调用 `electronAPI.getImageDetail()`获取图片详细信息,判断是否为heic,进行展示.

## 总结

通过以上梳理，可以清晰地看到各个文件和方法的作用，以及它们之间的调用关系。这有助于你理解项目的整体架构和流程，并进行后续的优化和改进。

希望这个 Markdown 文件对你有所帮助！