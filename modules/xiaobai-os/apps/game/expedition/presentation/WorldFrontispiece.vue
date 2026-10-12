<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { WORLD_ART } from '../artwork.js';
const root = ref<HTMLElement | null>(null), portrait = ref<boolean | null>(null);
const observer = new ResizeObserver(entries => { const { width, height } = entries[0].contentRect; portrait.value = width <= 700 && height > width; });
onMounted(() => observer.observe(root.value!));
onBeforeUnmount(() => observer.disconnect());
</script>
<template>
    <div ref="root" class="ember-frontispiece" aria-hidden="true">
        <img v-if="portrait !== null" :src="portrait ? WORLD_ART.cityMobile : WORLD_ART.city" alt="" fetchpriority="high" decoding="async" width="1376" height="768">
    </div>
</template>
<style scoped>
.ember-frontispiece { position:absolute; inset:0; pointer-events:none; }
.ember-frontispiece img { display:block; width:100%; height:100%; object-fit:cover; object-position:62% center; }
</style>
