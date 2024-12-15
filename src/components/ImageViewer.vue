<script setup lang="ts">
import { ref, watch } from 'vue'

interface ImageInfo {
  src: string
  thumbnail?: string
  width?: number
  height?: number
  alt?: string
  size?: number
  format?: string
  exif?: any
}

const props = defineProps<{
  images: ImageInfo[]
}>()

const isOpen = ref(false)
const currentIndex = ref(0)
const scale = ref(1)
const isDragging = ref(false)
const startPos = ref({ x: 0, y: 0 })
const translate = ref({ x: 0, y: 0 })
const isZoomed = ref(false)
const showInfo = ref(false)

function openGallery(index: number) {
  currentIndex.value = index
  isOpen.value = true
  resetZoom()
  console.log('打开图片查看器:', { index, image: props.images[index] })
}

function closeGallery() {
  isOpen.value = false
  resetZoom()
}

function resetZoom() {
  scale.value = 1
  translate.value = { x: 0, y: 0 }
  isZoomed.value = false
}

function nextImage() {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
  resetZoom()
}

function prevImage() {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
  resetZoom()
}

function handleWheel(e: WheelEvent) {
  if (!isOpen.value) return
  e.preventDefault()

  const delta = e.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.max(1, Math.min(5, scale.value * delta))
  
  if (newScale !== scale.value) {
    // 计算缩放中心点
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // 调整位移以保持鼠标位置不变
    translate.value.x = (translate.value.x - x) * (newScale / scale.value) + x
    translate.value.y = (translate.value.y - y) * (newScale / scale.value) + y
    
    scale.value = newScale
  }
}

function startDrag(e: MouseEvent) {
  if (isZoomed.value) {
    isDragging.value = true
    startPos.value = {
      x: e.clientX - translate.value.x,
      y: e.clientY - translate.value.y
    }
  }
}

function doDrag(e: MouseEvent) {
  if (isDragging.value) {
    translate.value = {
      x: e.clientX - startPos.value.x,
      y: e.clientY - startPos.value.y
    }
  }
}

function stopDrag() {
  isDragging.value = false
}

function toggleZoom() {
  if (isZoomed.value) {
    // 重置到原始大小
    scale.value = 1
    translate.value = { x: 0, y: 0 }
    isZoomed.value = false
  } else {
    // 放大到指定比例
    scale.value = 2
    translate.value = { x: 0, y: 0 }
    isZoomed.value = true
  }
}

// 添加点击图片放大的功能
function handleImageClick() {
  if (!isZoomed.value) {
    toggleZoom()
  }
}

function toggleInfo() {
  showInfo.value = !showInfo.value
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString()
}

// 暴露方法给父组件
defineExpose({
  openGallery
})
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
    @mousemove="doDrag"
    @mouseup="stopDrag"
    @mouseleave="stopDrag"
  >
    <!-- 控制按钮组 -->
    <div class="absolute top-4 right-4 flex items-center gap-4 z-50">
      <!-- 信息按钮 -->
      <button 
        class="text-white hover:text-gray-300 w-8 h-8 flex items-center justify-center"
        @click="toggleInfo"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      <!-- 放大按钮 -->
      <button 
        class="text-white hover:text-gray-300 w-8 h-8 flex items-center justify-center"
        @click="toggleZoom"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            v-if="!isZoomed" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
          />
          <path 
            v-else 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
          />
        </svg>
      </button>

      <!-- 关闭按钮 -->
      <button 
        class="text-white hover:text-gray-300 w-8 h-8 flex items-center justify-center text-2xl"
        @click="closeGallery"
      >
        ×
      </button>
    </div>

    <!-- 图片信息面板 -->
    <div 
      v-if="showInfo"
      class="absolute right-4 top-16 bg-black bg-opacity-75 text-white p-4 rounded-lg max-w-sm z-50"
    >
      <h3 class="text-lg font-semibold mb-2">图片信息</h3>
      <dl class="space-y-1">
        <template v-if="props.images[currentIndex]">
          <div class="grid grid-cols-3 gap-2">
            <dt class="text-gray-400">文件名:</dt>
            <dd class="col-span-2">{{ props.images[currentIndex].alt }}</dd>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <dt class="text-gray-400">尺寸:</dt>
            <dd class="col-span-2">{{ props.images[currentIndex].width }} × {{ props.images[currentIndex].height }}</dd>
          </div>
          <div class="grid grid-cols-3 gap-2" v-if="props.images[currentIndex].size">
            <dt class="text-gray-400">大小:</dt>
            <dd class="col-span-2">{{ formatFileSize(props.images[currentIndex].size) }}</dd>
          </div>
          <div class="grid grid-cols-3 gap-2" v-if="props.images[currentIndex].format">
            <dt class="text-gray-400">格式:</dt>
            <dd class="col-span-2">{{ props.images[currentIndex].format.toUpperCase() }}</dd>
          </div>
          <!-- EXIF 信息 -->
          <template v-if="props.images[currentIndex].exif">
            <div class="border-t border-gray-600 my-2"></div>
            <div class="grid grid-cols-3 gap-2" v-for="(value, key) in props.images[currentIndex].exif" :key="key">
              <dt class="text-gray-400">{{ key }}:</dt>
              <dd class="col-span-2">{{ value }}</dd>
            </div>
          </template>
        </template>
      </dl>
    </div>

    <!-- 上一张/下一张按钮保持不变 -->
    <button v-if="props.images.length > 1" class="absolute left-4 text-white text-4xl hover:text-gray-300 z-50" @click="prevImage">‹</button>

    <!-- 图片容器 -->
    <div 
      class="max-w-[90vw] max-h-[90vh] relative overflow-hidden"
      @mousedown="startDrag"
    >
      <img 
        :src="props.images[currentIndex].src"
        :alt="props.images[currentIndex].alt"
        class="max-w-full max-h-[90vh] object-contain"
        :class="{ 'cursor-move': isZoomed, 'cursor-zoom-in': !isZoomed }"
        :style="{
          transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }"
        @click="handleImageClick"
      />
    </div>

    <!-- 下一张按钮保持不变 -->
    <button v-if="props.images.length > 1" class="absolute right-4 text-white text-4xl hover:text-gray-300 z-50" @click="nextImage">›</button>
  </div>
</template>

<style scoped>
.fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

img {
  user-select: none;
  -webkit-user-drag: none;
}
</style>