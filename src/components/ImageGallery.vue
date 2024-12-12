<template>
  <div class="container mx-auto px-4">
    <h1 class="text-2xl font-bold mb-4">Image Gallery</h1>
    
    <!-- 面包屑导航 -->
    <div class="flex items-center gap-2 mb-4">
      <button 
        class="text-blue-600 hover:underline"
        @click="navigateTo('')"
      >
        Home
      </button>
      <template v-for="(segment, index) in currentPath.split('/').filter(Boolean)" :key="index">
        <span>/</span>
        <button 
          class="text-blue-600 hover:underline"
          @click="navigateTo(currentPath.split('/').slice(0, index + 1).join('/'))"
        >
          {{ segment }}
        </button>
      </template>
    </div>

    <!-- 内容网格 -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <!-- 文件夹 -->
      <div 
        v-for="item in items.filter(i => i.type === 'folder')" 
        :key="item.path"
        class="cursor-pointer p-4 rounded-lg border hover:shadow-lg transition-shadow"
        @click="navigateTo(item.path)"
      >
        <div class="flex flex-col items-center">
          <div class="text-4xl mb-2">📁</div>
          <div class="text-center truncate w-full">{{ item.name }}</div>
        </div>
      </div>

      <!-- 图片 -->
      <div 
        v-for="(item, index) in items.filter(i => i.type === 'image')" 
        :key="item.info.path"
        class="cursor-pointer rounded-lg border hover:shadow-lg transition-shadow overflow-hidden"
        @click="handleImageClick(index)"
      >
        <img 
          :src="item.info.thumbnailPath || item.info.path" 
          :alt="item.info.originalName"
          class="w-full h-40 object-cover"
        />
      </div>
    </div>

    <!-- 图片查看器 -->
    <ImageViewer 
      ref="imageViewer"
      :images="items
        .filter(i => i.type === 'image')
        .map(i => ({
          src: i.info.path,
          thumbnail: i.info.thumbnailPath,
          width: i.info.width,
          height: i.info.height,
          alt: i.info.originalName
        }))"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ImageViewer from './ImageViewer.vue'
import { logError } from '../utils/logger'

const currentPath = ref('')
const items = ref([])
const imageViewer = ref<typeof ImageViewer | null>(null)

async function loadContent(path: string) {
  try {
    console.log('加载路径:', path)
    const url = `/api/images${path ? `?path=${encodeURIComponent(path)}` : ''}`
    console.log('请求 URL:', url)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log('获取到的数据:', data)
    items.value = data
  } catch (error) {
    console.error('加载内容失败:', error)
    items.value = []
  }
}

function handleImageClick(index: number) {
  const images = items.value
    .filter(i => i.type === 'image')
    .map(i => ({
      src: i.info.path,          // 使用原始图片路径
      thumbnail: i.info.thumbnailPath, // 缩略图路径
      width: i.info.width,
      height: i.info.height,
      alt: i.info.originalName
    }))
  
  console.log('打开图片预览:', { index, images })
  imageViewer.value?.openGallery(index)
}

async function navigateTo(path: string) {
  console.log('导航到新路径:', path)
  currentPath.value = path
}

// 使用 onMounted 确保在客户端执行
import { onMounted } from 'vue'

onMounted(() => {
  watch(currentPath, async (newPath) => {
    console.log('路径变化，重新加载:', newPath)
    await loadContent(newPath)
  }, { immediate: true })
})
</script>

<style scoped>
.container {
  max-width: 1400px;
}
</style>