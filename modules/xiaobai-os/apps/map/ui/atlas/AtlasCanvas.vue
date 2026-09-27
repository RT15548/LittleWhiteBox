<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, toRaw, useId, watch } from 'vue';
import type { AtlasRenderView, createAtlasRuntime } from './gpu-runtime.js';
import { MAP_ATLAS_GRAPHICS_COPY } from '../map-copy.js';
import { atlasPaintOrder } from '../../../../domains/map/space/composition.js';
import { geometryClosed } from '../../../../domains/map/space/geometry.js';
import { atlasGeometryPath, atlasLineWidth } from './geometry.js';
import { ATLAS_MATERIALS } from './materials.js';

const props = defineProps<AtlasRenderView>();
const host = ref<HTMLElement | null>(null), error = ref(false), painted = ref(false);
const clip = `atlas-preview-${useId()}`;
// A cheap flat base while the shared Three module loads; no texture generation or masks.
const preview = computed(() => atlasPaintOrder(props.projection.features).filter(f => !f.source.support && (['environment', 'surface'].includes(f.source.role) || f.source.material === 'water')));
let runtime: ReturnType<typeof createAtlasRuntime> | undefined, disposed = false;
function failed(reason: unknown) { error.value = true; console.error('[Map Atlas]', reason); }
function update() {
    // The renderer owns no reactive state. Sampling source contours must not incur
    // thousands of proxy reads, and pointer updates do not traverse the whole atlas.
    const raw = toRaw(props.projection);
    const features = (values: typeof raw.features) => values.map(f => ({ ...toRaw(f), source: toRaw(f.source) }));
    runtime?.update({ projection: { ...raw, features: features(raw.features), carriers: features(raw.carriers) }, viewport: [...props.viewport], size: [...props.size], unitScale: props.unitScale });
}
onMounted(async () => {
    try {
        const { createAtlasRuntime } = await import('./gpu-runtime.js');
        if (disposed) { return; }
        runtime = createAtlasRuntime(host.value!, failed, () => { painted.value = true; }); update();
    } catch (reason) { if (!disposed) { failed(reason); } }
});
watch(() => [props.projection, ...props.viewport, ...props.size, props.unitScale], update);
onBeforeUnmount(() => { disposed = true; runtime?.dispose(); });
</script>
<template>
    <div ref="host" class="map-atlas-canvas">
        <svg v-if="!painted && !error" class="map-atlas-preview" :viewBox="viewport.join(' ')" aria-hidden="true">
            <defs><clipPath :id="clip"><path v-if="projection.clip" :d="atlasGeometryPath(projection.clip)" /></clipPath></defs>
            <g :clip-path="projection.clip ? `url(#${clip})` : undefined"><path v-for="feature in preview" :key="feature.source.id" :d="atlasGeometryPath(feature.geometry)" :fill="geometryClosed(feature.geometry) ? ATLAS_MATERIALS[feature.source.material].base : 'none'" :stroke="ATLAS_MATERIALS[feature.source.material].base" :stroke-width="atlasLineWidth(feature.geometry)" stroke-linecap="round" /></g>
        </svg>
        <p v-if="error" class="map-atlas-graphics-error" role="alert">{{ MAP_ATLAS_GRAPHICS_COPY.failed }}</p>
    </div>
</template>
<style scoped>
.map-atlas-canvas { position: absolute; inset: 0; pointer-events: none; background: var(--atlas-paper); }
.map-atlas-canvas :deep(canvas) { width: 100%; height: 100%; display: block; }
.map-atlas-preview { position: absolute; inset: 0; width: 100%; height: 100%; }
.map-atlas-graphics-error { position: absolute; top: 40%; left: 12%; right: 12%; padding: 12px; color: var(--map-ink); background: var(--atlas-paper); }
</style>
