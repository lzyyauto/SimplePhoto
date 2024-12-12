<script setup lang="ts">
import { ref } from 'vue';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import type { ImageInfo } from '../types/image';

const props = defineProps<{
  images: ImageInfo[]
}>();

let lightbox: any = null;

const openGallery = (index: number) => {
  if (lightbox) {
    lightbox.destroy();
    lightbox = null;
  }

  lightbox = new PhotoSwipeLightbox({
    dataSource: props.images.map(image => ({
      src: image.path,
      width: image.width,
      height: image.height,
      alt: image.path.split('/').pop()
    })),
    pswpModule: () => import('photoswipe'),
    showHideAnimationType: 'fade',
    zoom: false
  });

  lightbox.init();
  lightbox.loadAndOpen(index);
};

const closeGallery = () => {
  if (lightbox) {
    lightbox.destroy();
    lightbox = null;
  }
};

defineExpose({ openGallery, closeGallery });
</script>

<template>
  <div class="pswp-gallery">
    <!-- PhotoSwipe 将在这里创建必要的元素 -->
  </div>
</template>

<style>
.pswp {
  --pswp-bg: rgba(0, 0, 0, 0.85);
}

.pswp__img {
  object-fit: contain;
}
</style>