<script setup lang="ts">
import { computed } from 'vue';
import type { ImageInfo } from '../types/image';

const props = defineProps<{
  images: ImageInfo[];
  onImageClick: (index: number) => void;
}>();

const sortedImages = computed(() => {
  return [...props.images].sort((a, b) => {
    const pathA = a.path.toLowerCase();
    const pathB = b.path.toLowerCase();
    return pathA.localeCompare(pathB);
  });
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4">
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
      <div
        v-for="(image, index) in sortedImages"
        :key="image.path"
        class="aspect-square overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
        @click="onImageClick(index)"
      >
        <div class="relative h-full">
          <img
            :src="image.thumbnail"
            :alt="image.path.split('/').pop()"
            class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </div>
      </div>
    </div>
  </div>
</template>