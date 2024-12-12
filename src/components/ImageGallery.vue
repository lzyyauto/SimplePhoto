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
      <template v-for="(segment, index) in pathSegments" :key="index">
        <span>/</span>
        <button 
          class="text-blue-600 hover:underline"
          @click="navigateTo(pathSegments.slice(0, index + 1).join('/'))"
        >
          {{ segment }}
        </button>
      </template>
    </div>

    <!-- 文件夹网格 -->
    <div v-if="folders.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
      <div
        v-for="folder in folders"
        :key="folder.path"
        class="aspect-square bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center"
        @click="navigateTo(folder.path)"
      >
        <div class="text-center">
          <div class="text-4xl mb-2">📁</div>
          <div class="text-sm truncate px-2">{{ folder.name }}</div>
        </div>
      </div>
    </div>

    <!-- 图片网格 -->
    <ImageGrid 
      v-if="images.length > 0"
      :images="images" 
      :onImageClick="handleImageClick"
    />
    <ImageViewer ref="imageViewer" :images="images" />

    <!-- 无内容提示 -->
    <div v-if="!folders.length && !images.length" class="text-center text-gray-500 py-8">
      此文件夹为空
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ImageGrid from './ImageGrid.vue'
import ImageViewer from './ImageViewer.vue'
import type { ImageInfo } from '../types/image'

const currentPath = ref('')
const items = ref<any[]>([])
const imageViewer = ref()

const folders = computed(() => 
  items.value
    .filter(item => item.type === 'folder')
    .filter(folder => folder.path !== currentPath.value)
)

const images = computed(() => 
  items.value
    .filter(item => item.type === 'image')
    .map(item => item.info)
)

const pathSegments = computed(() => 
  currentPath.value ? currentPath.value.split('/').filter(Boolean) : []
)

async function loadContent(path: string) {
  try {
    console.log('加载路径:', path)
    const baseUrl = import.meta.env.DEV 
      ? 'http://localhost:4321' 
      : window.location.origin
    
    const url = new URL('/api/images', baseUrl)
    if (path) {
      url.searchParams.set('path', path)
    }
    
    console.log('请求 URL:', url.toString())
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch content')
    const data = await response.json()
    console.log('获取到的数据:', data)
    items.value = data
  } catch (error) {
    console.error('加载内容失败:', error)
    items.value = []
  }
}

function handleImageClick(index: number) {
  imageViewer.value?.openGallery(index)
}

async function navigateTo(path: string) {
  console.log('导航到新路径:', path)
  currentPath.value = path
}

// 监听路径变化
watch(currentPath, async (newPath) => {
  console.log('路径变化，重新加载:', newPath)
  await loadContent(newPath)
}, { immediate: true })
</script>

<style scoped>
.container {
  max-width: 1400px;
}
</style>