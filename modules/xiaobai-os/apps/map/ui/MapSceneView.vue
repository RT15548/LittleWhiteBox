<script setup lang="ts">
import { ref } from 'vue';
import type { MapScene as SceneData } from '../../../domains/map/types.js';
import MapScene from './MapScene.vue';
import MapScene3D from './three/MapScene3D.vue';
import './scene-view.css';

defineProps<{ scene: SceneData; mode: '2d' | '3d'; threeUnavailable: boolean }>();
const emit = defineEmits<{ 'update:mode': [mode: '2d' | '3d']; fallback: [reason: string] }>();
const lowWalls = ref(false);
const showLabels = ref(true);
</script>
<template>
    <section class="map-scene-view" :aria-label="scene.name">
        <div class="map-scene-toolbar">
            <div class="map-render-switch" role="group" aria-label="场景显示方式">
                <button type="button" :aria-pressed="mode === '2d'" @click="emit('update:mode', '2d')">二维</button>
                <button type="button" :aria-pressed="mode === '3d'" :disabled="threeUnavailable" @click="emit('update:mode', '3d')">三维</button>
            </div>
            <button v-if="mode === '3d'" type="button" :aria-pressed="lowWalls" @click="lowWalls = !lowWalls">低墙</button>
            <button v-if="mode === '3d'" type="button" :aria-pressed="showLabels" @click="showLabels = !showLabels">名称</button>
        </div>
        <div class="map-scene-stage">
            <MapScene v-show="mode === '2d'" :scene="scene" />
            <MapScene3D v-if="mode === '3d'" :scene="scene" :low-walls="lowWalls" :show-labels="showLabels" @fallback="emit('fallback', $event)" />
        </div>
    </section>
</template>
