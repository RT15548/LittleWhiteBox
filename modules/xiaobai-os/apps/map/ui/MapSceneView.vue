<script setup lang="ts">
import type { MapScene as SceneData } from '../../../domains/map/types.js';
import MapScene from './MapScene.vue';
import MapScene3D from './three/MapScene3D.vue';
import './scene-view.css';
import { MAP_SCENE_COPY } from './map-copy.js';

defineProps<{ scene: SceneData; mode: '2d' | '3d'; threeUnavailable: boolean; compact?: boolean }>();
const emit = defineEmits<{ 'update:mode': [mode: '2d' | '3d']; fallback: [reason: string] }>();
const lowWalls = defineModel<boolean>('lowWalls', { default: false });
const showLabels = defineModel<boolean>('showLabels', { default: true });
</script>
<template>
    <section class="map-scene-view" :aria-label="scene.name">
        <div v-if="!compact" class="map-scene-toolbar">
            <div class="map-render-switch" role="group" :aria-label="MAP_SCENE_COPY.mode">
                <button type="button" :aria-pressed="mode === '2d'" @click="emit('update:mode', '2d')">{{ MAP_SCENE_COPY.two }}</button>
                <button type="button" :aria-pressed="mode === '3d'" :disabled="threeUnavailable" @click="emit('update:mode', '3d')">{{ MAP_SCENE_COPY.three }}</button>
            </div>
            <button v-if="mode === '3d'" type="button" :aria-pressed="lowWalls" @click="lowWalls = !lowWalls">{{ MAP_SCENE_COPY.lowWalls }}</button>
            <button v-if="mode === '3d'" type="button" :aria-pressed="showLabels" @click="showLabels = !showLabels">{{ MAP_SCENE_COPY.labels }}</button>
        </div>
        <div class="map-scene-stage">
            <MapScene v-show="mode === '2d'" :scene="scene" />
            <MapScene3D v-if="mode === '3d'" :scene="scene" :low-walls="lowWalls" :show-labels="showLabels" @fallback="emit('fallback', $event)" />
        </div>
    </section>
</template>
