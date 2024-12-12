import { ref } from 'vue';
import type { ImageInfo } from '../types/image';
import PhotoSwipe from 'photoswipe';

export function useGallery(images: ImageInfo[]) {
  const gallery = ref<PhotoSwipe | null>(null);

  function openGallery(index: number) {
    const items = images.map(img => ({
      src: '/' + img.path,
      w: img.width,
      h: img.height
    }));

    gallery.value = new PhotoSwipe({
      dataSource: items,
      index,
      pswpModule: () => import('photoswipe')
    });

    gallery.value.init();
  }

  function closeGallery() {
    gallery.value?.close();
  }

  return {
    openGallery,
    closeGallery
  };
}