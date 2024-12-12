<script setup lang="ts">
import { ref, computed } from 'vue';
import { ImageInfo } from '../types/image';
import { groupImagesByFolder } from '../utils/imageUtils';

const props = defineProps<{
  images: ImageInfo[]
}>();

const groupedImages = computed(() => groupImagesByFolder(props.images));
const selectedFolder = ref<string | null>(null);

function selectFolder(folder: string) {
  selectedFolder.value = folder;
}
</script>

<template>
  <div class="p-4">
    <div v-if="!selectedFolder" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(images, folder) in groupedImages"
        :key="folder"
        class="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300"
        @click="selectFolder(folder)"
      >
        <div class="aspect-video relative">
          <img
            v-if="images[0]"
            :src="'/' + images[0].thumbnail"
            :alt="folder"
            class="w-full h-full object-cover"
          />
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
            <h3 class="text-white text-lg font-semibold">{{ folder.split('/').pop() }}</h3>
            <p class="text-white/80 text-sm">{{ images.length }} images</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <button
        @click="selectedFolder = null"
        class="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-300"
      >
        ← Back to folders
      </button>
      <ImageGrid
        :images="groupedImages[selectedFolder]"
        :onImageClick="(index) => $emit('imageClick', index)"
      />
    </div>
  </div>
</template>