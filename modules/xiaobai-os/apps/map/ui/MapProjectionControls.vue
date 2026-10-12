<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import MapIcon from './MapIcon.vue';
import MapLegend from './MapLegend.vue';
import { MAP_NAV_COPY, MAP_PROJECTION_COPY, MAP_SCENE_COPY, MAP_VIEW_LABELS } from './map-copy.js';

const props = defineProps<{ view: 'world' | 'region' | 'scene'; sceneAvailable: boolean; threeUnavailable: boolean; located: boolean }>();
const emit = defineEmits<{ navigate: [view: 'world' | 'region' | 'scene']; locate: [] }>();
const mode = defineModel<'2d' | '3d'>('mode', { required: true });
const lowWalls = defineModel<boolean>('lowWalls', { required: true });
const showLabels = defineModel<boolean>('showLabels', { required: true });
const open = ref(false);
const legend = ref(false);
const root = ref<HTMLElement | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);
const panelId = `map-projection-options-${useId()}`;
function close(): void { open.value = false; legend.value = false; }
function dismiss(event: PointerEvent): void { if (!root.value || !event.composedPath().includes(root.value)) { close(); } }
function escape(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !open.value) { return; }
    event.preventDefault(); event.stopPropagation(); close(); trigger.value?.focus({ preventScroll: true });
}
watch(() => props.view, close);
// Capture sees local map clicks before the projection stops input bubbling to ST.
onMounted(() => document.addEventListener('pointerdown', dismiss, true));
onBeforeUnmount(() => document.removeEventListener('pointerdown', dismiss, true));
</script>
<template>
    <div ref="root" class="map-projection-controls" @keydown="escape">
        <nav class="map-projection-tabs" :aria-label="MAP_NAV_COPY.viewLabel">
            <button v-for="(label, key) in MAP_PROJECTION_COPY.views" :key="key" type="button" :aria-label="MAP_VIEW_LABELS[key]" :aria-pressed="view === key" @click="close(); emit('navigate', key)">{{ label }}</button>
        </nav>
        <button ref="trigger" type="button" class="map-projection-options-button" :aria-label="MAP_PROJECTION_COPY.options" :aria-expanded="open" :aria-controls="panelId" @click="open ? close() : open = true"><MapIcon name="more" /></button>
        <section v-if="open" :id="panelId" class="map-projection-options" :aria-label="MAP_PROJECTION_COPY.options">
            <div v-if="view === 'scene' && sceneAvailable" class="map-projection-scene-options">
                <div class="map-render-switch" role="group" :aria-label="MAP_SCENE_COPY.mode">
                    <button type="button" :aria-pressed="mode === '2d'" @click="mode = '2d'">{{ MAP_SCENE_COPY.two }}</button>
                    <button type="button" :aria-pressed="mode === '3d'" :disabled="threeUnavailable" @click="mode = '3d'">{{ MAP_SCENE_COPY.three }}</button>
                </div>
                <div v-if="mode === '3d'" class="map-projection-toggles">
                    <button type="button" :aria-pressed="lowWalls" @click="lowWalls = !lowWalls">{{ MAP_SCENE_COPY.lowWalls }}</button>
                    <button type="button" :aria-pressed="showLabels" @click="showLabels = !showLabels">{{ MAP_SCENE_COPY.labels }}</button>
                </div>
            </div>
            <button type="button" :disabled="!located" @click="emit('locate'); close()"><MapIcon name="locate" />{{ MAP_PROJECTION_COPY.location }}</button>
            <button type="button" :aria-expanded="legend" @click="legend = !legend"><MapIcon name="layers" />{{ MAP_NAV_COPY.legendLabel }}</button>
            <MapLegend v-if="legend" />
        </section>
    </div>
</template>
