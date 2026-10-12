<script setup lang="ts">
import { computed } from 'vue';
import { createGroundSurface, GROUND_SURFACES, type GroundSurface } from './scene-ground-surfaces.js';

const props = defineProps<{ prefix: string; materials: readonly GroundSurface[]; scale: number }>();
// Only this mounted SVG owns these data URLs; there is no cross-chat or persistent cache.
const images = new Map<GroundSurface, string>();
const patterns = computed(() => {
    for (const material of images.keys()) { if (!props.materials.includes(material)) { images.delete(material); } }
    return props.materials.map(material => {
        if (!images.has(material)) {
            const surface = createGroundSurface(material), { size, color, height } = surface;
            const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
            const context = canvas.getContext('2d')!;
            const image = context.createImageData(size, size);
            for (let y = 0; y < size; y++) { for (let x = 0; x < size; x++) {
                const index = y * size + x;
                // A small fixed relief cue for the schematic plan; 3D uses real lighting instead.
                const dx = height[y * size + (x + size - 1) % size] - height[y * size + (x + 1) % size];
                const dy = height[((y + size - 1) % size) * size + x] - height[((y + 1) % size) * size + x];
                const shade = 1 + Math.max(-.18, Math.min(.18, (dx + dy) / 255 * .65));
                for (let channel = 0; channel < 3; channel++) { image.data[index * 4 + channel] = color[index * 4 + channel] * shade; }
                image.data[index * 4 + 3] = 255;
            } }
            context.putImageData(image, 0, 0);
            images.set(material, canvas.toDataURL());
        }
        return { material, href: images.get(material), size: GROUND_SURFACES[material].size * props.scale };
    });
});
</script>

<template>
    <defs>
        <pattern v-for="pattern in patterns" :id="`${prefix}-ground-${pattern.material}`" :key="pattern.material" :width="pattern.size" :height="pattern.size" patternUnits="userSpaceOnUse">
            <image :href="pattern.href" :width="pattern.size" :height="pattern.size" preserveAspectRatio="none" />
        </pattern>
    </defs>
</template>
