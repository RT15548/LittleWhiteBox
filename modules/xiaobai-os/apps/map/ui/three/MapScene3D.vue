<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { MapScene } from '../../../../domains/map/types.js';
import type { createThreeRuntime } from './three-runtime.js';
import { loadMapSymbols } from '../map-symbols.js';
import { sceneLightingStyle } from '../scene-lighting.js';
import './scene3d.css';

const props = defineProps<{ scene: MapScene; lowWalls: boolean; showLabels: boolean }>();
const emit = defineEmits<{ fallback: [reason: string] }>();
const host = ref<HTMLElement | null>(null);
const labelHost = ref<HTMLElement | null>(null);
const loading = ref(true);
let runtime: ReturnType<typeof createThreeRuntime> | undefined;
let createRuntime: typeof createThreeRuntime | undefined;
let pendingResize: ResizeObserver | undefined;
let mounted = false;
function stopWaiting(): void {
    pendingResize?.disconnect(); pendingResize = undefined;
    document.removeEventListener('visibilitychange', initialize);
}
function unavailable(): void {
    stopWaiting();
    if (mounted) {emit('fallback', '当前设备无法打开三维，已切换二维。');}
}
function initialize(): void {
    const element = host.value;
    if (!mounted || !createRuntime || runtime || document.hidden || !element?.isConnected) {return;}
    const bounds = element.getBoundingClientRect();
    if (!bounds.width || !bounds.height) {return;}
    stopWaiting();
    try {
        runtime = createRuntime(element, labelHost.value!, { fallback: reason => emit('fallback', reason) });
        runtime.setScene(props.scene);
        runtime.walls(props.lowWalls); runtime.labels(props.showLabels);
        loading.value = false;
        void loadMapSymbols().then(() => {if (mounted) {runtime?.symbols(true);}}).catch(() => {});
    } catch {unavailable();}
}
onMounted(async () => {
    mounted = true;
    try {
        createRuntime = (await import('./three-runtime.js')).createThreeRuntime;
        if (!mounted) {return;}
        // Observe after loading: even a detach/reattach within one frame gets an
        // initial size notification instead of waiting for a different size.
        pendingResize = new ResizeObserver(initialize);
        pendingResize.observe(host.value!);
        document.addEventListener('visibilitychange', initialize);
        initialize();
    } catch {unavailable();}
});
watch(() => props.scene, value => runtime?.setScene(value));
watch(() => props.lowWalls, value => runtime?.walls(value));
watch(() => props.showLabels, value => runtime?.labels(value));
onBeforeUnmount(() => {mounted = false; stopWaiting(); runtime?.dispose(); runtime = undefined;});
</script>
<template>
    <div ref="host" class="map-scene-three" :style="sceneLightingStyle(scene)">
        <div ref="labelHost" class="map-3d-labels" />
        <div v-if="loading" class="map-3d-loading" role="status">正在打开三维…</div>
        <div class="map-viewport-controls" aria-label="三维视角">
            <button type="button" aria-label="放大三维" @click="runtime?.zoom(1.2)">+</button>
            <button type="button" aria-label="缩小三维" @click="runtime?.zoom(1 / 1.2)">−</button>
            <button type="button" class="map-fit" aria-label="重置三维视角" @click="runtime?.fit()">全图</button>
        </div>
    </div>
</template>
