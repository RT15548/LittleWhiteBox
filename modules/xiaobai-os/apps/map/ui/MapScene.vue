<script setup lang="ts">
import { computed, onMounted, ref, useId } from 'vue';
import type { MapScene } from '../../../domains/map/types.js';
import { loadMapSymbols } from './map-symbols.js';
import MapViewport from './MapViewport.vue';
import SceneMaterials from './SceneMaterials.vue';
import SceneGroundMaterials from './SceneGroundMaterials.vue';
import { isGroundSurface } from './scene-ground-surfaces.js';
import SceneObject from './SceneObject.vue';
import SceneSymbol from './SceneSymbol.vue';
import { organicSymbol } from './scene-organic-symbols.js';
import { formSurface, isGrowth } from './scene-forms.js';
import { elementPresentation, sortedSceneElements } from './map-presentation.js';
import { sceneLightingMatrix, sceneLightingStyle, sceneLightSources, sceneSurfaceMatrix, SCENE_SUN_DIRECTION } from './scene-lighting.js';
import { forestCanopies, hasSceneObjectDrawing, isAreaElement, isSceneMarker, isSceneObject, sceneElementBounds, sceneElementLabelPoint, sceneElementPath, sceneElementTransform, sceneUnitScale } from './scene-geometry.js';
import { materialBase } from './scene-materials.js';
import './scene.css';

const props = defineProps<{ scene: MapScene }>();
const symbolsReady = ref(false);
onMounted(() => {void loadMapSymbols().then(() => {symbolsReady.value = true;}).catch(() => {symbolsReady.value = false;});});
const prefix = `xiaobai-map-scene-${useId()}`;
const lightMatrix = computed(() => sceneLightingMatrix(props.scene.lighting));
const lights = computed(() => sceneLightSources(props.scene));
const sunShadow = computed(() => {
    if (props.scene.lighting?.natural !== 'sunlight') {return undefined;}
    const unit = sceneUnitScale(props.scene.viewBox[2], props.scene.viewBox[3]);
    return `translate(${-SCENE_SUN_DIRECTION[0] * unit * .45} ${-SCENE_SUN_DIRECTION[2] * unit * .45})`;
});
const crowns = computed(() => forestCanopies(props.scene.elements));
const groundMaterials = computed(() => [...new Set(props.scene.elements.filter(element => element.category === 'terrain' && isAreaElement(element) && !isSceneObject(element)).map(element => element.material).filter(isGroundSurface))]);
const items = computed(() => sortedSceneElements(props.scene.elements).map((element, index) => ({
    element,
    bounds: sceneElementBounds(element),
    path: sceneElementPath(element),
    transform: sceneElementTransform(element),
    area: isAreaElement(element),
    presentation: elementPresentation(element, prefix),
    clipId: `${prefix}-area-${index}`,
    object: isSceneObject(element) && !isSceneMarker(element),
    marker: isSceneMarker(element) && element.shape !== 'label',
    growth: isGrowth(element),
})));
</script>

<template>
    <MapViewport class="map-scene-viewport" :style="sceneLightingStyle(scene)" :view-box="scene.viewBox" :reset-key="scene.key" :label="`${scene.name} 场景地图`">
        <template #default="{ unitScale }">
            <SceneMaterials :prefix="prefix" />
            <SceneGroundMaterials :prefix="prefix" :materials="groundMaterials" :scale="sceneUnitScale(scene.viewBox[2], scene.viewBox[3])" />
            <defs v-if="lightMatrix"><filter :id="`${prefix}-lighting`" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" :values="lightMatrix" /></filter></defs>
            <defs>
                <clipPath :id="`${prefix}-surfaces`"><template v-for="item in items" :key="item.element.id"><path v-if="item.element.category === 'terrain' && item.area" :d="item.path" :transform="item.transform" /></template></clipPath>
                <template v-for="(light, index) in lights" :key="light.id">
                    <radialGradient :id="`${prefix}-pool-${index}`" gradientUnits="userSpaceOnUse" :cx="light.x" :cy="light.y" :r="light.radius">
                        <stop offset="0" stop-color="white" /><stop offset=".18" stop-color="white" stop-opacity=".95" /><stop offset=".55" stop-color="white" stop-opacity=".48" /><stop offset="1" stop-color="white" stop-opacity="0" />
                    </radialGradient>
                    <mask :id="`${prefix}-mask-${index}`" maskUnits="userSpaceOnUse" :x="scene.viewBox[0]" :y="scene.viewBox[1]" :width="scene.viewBox[2]" :height="scene.viewBox[3]">
                        <circle :cx="light.x" :cy="light.y" :r="light.radius" :fill="`url(#${prefix}-pool-${index})`" />
                    </mask>
                    <filter :id="`${prefix}-lamp-${index}`" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" :values="sceneSurfaceMatrix(light.surface)" /></filter>
                </template>
            </defs>
            <g :filter="lightMatrix ? `url(#${prefix}-lighting)` : undefined">
                <g :id="`${prefix}-artwork`">
                    <g v-for="item in items" :key="item.element.id" class="map-scene-element" :class="[`is-${item.element.category}`, `is-${item.element.certainty || 'confirmed'}`]" :data-element="item.element.id" :opacity="item.presentation.opacity">
                        <g v-if="sunShadow && item.object && item.path" :clip-path="`url(#${prefix}-surfaces)`" aria-hidden="true"><path :d="item.path" :transform="`${sunShadow} ${item.transform || ''}`" fill="#263748" opacity=".3" /></g>
                        <g :transform="item.transform">
                            <SceneObject v-if="item.object" :element="item.element" :prefix="prefix" :unit-scale="unitScale" />
                            <template v-else-if="item.path">
                                <path v-if="item.growth" :d="item.path" fill="none" :stroke="materialBase(formSurface(item.element)!)" stroke-width="9" stroke-linecap="round" vector-effect="non-scaling-stroke" />
                                <path v-if="item.element.category === 'wall'" :d="item.path" fill="none" stroke="var(--scene-shadow)" stroke-width="9" opacity=".18" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
                                <path v-if="item.element.category === 'road' && !item.area" :d="item.path" fill="none" stroke="var(--scene-soft-edge)" :stroke-width="item.presentation.width + 2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
                                <path :d="item.path" :fill="item.presentation.fill" :stroke="item.presentation.stroke" :stroke-width="item.presentation.width" :stroke-dasharray="item.presentation.dash" stroke-linejoin="round" :stroke-linecap="item.element.category === 'wall' ? 'butt' : 'round'" fill-rule="evenodd" vector-effect="non-scaling-stroke" />
                                <path v-if="item.element.category === 'wall'" :d="item.path" fill="none" :stroke="item.element.material ? materialBase(item.element.material) : 'var(--scene-wall)'" stroke-width="3.5" :stroke-opacity="item.element.material === 'glass' ? .4 : 1" :stroke-dasharray="item.presentation.dash" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
                            </template>
                            <g v-if="item.object && !hasSceneObjectDrawing(item.element) && Math.min(item.bounds.width, item.bounds.height) / unitScale >= 12" :transform="`translate(${item.bounds.x + item.bounds.width / 2} ${item.bounds.y + item.bounds.height / 2})`" aria-hidden="true">
                                <text :class="symbolsReady ? 'map-material-symbol' : 'map-symbol-fallback'" :style="{ fontSize: `${Math.min(22 * unitScale, Math.min(item.bounds.width, item.bounds.height) * .65)}px`, fill: 'var(--scene-edge)', textAnchor: 'middle', dominantBaseline: 'central' }">{{ symbolsReady ? item.presentation.icon : item.presentation.fallback }}</text>
                            </g>
                            <template v-if="crowns.has(item.element.id)">
                                <defs><clipPath :id="item.clipId"><path :d="item.path" clip-rule="evenodd" /></clipPath></defs>
                                <g :clip-path="`url(#${item.clipId})`" class="scene-forest-decoration" aria-hidden="true">
                                    <use v-for="(crown, index) in crowns.get(item.element.id)" :key="index" :href="`#${prefix}-crown-${crown.variant}`" :x="crown.x - crown.size / 2" :y="crown.y - crown.size / 2" :width="crown.size" :height="crown.size" />
                                </g>
                            </template>
                        </g>
                    </g>
                </g>
            </g>
            <g v-for="(light, index) in lights" :key="light.id" :mask="`url(#${prefix}-mask-${index})`" aria-hidden="true">
                <use :href="`#${prefix}-artwork`" :filter="`url(#${prefix}-lamp-${index})`" />
            </g>
            <template v-for="item in items" :key="item.element.id">
                <g v-if="item.marker" class="map-scene-icon" :class="`is-${item.element.category}`" :opacity="item.presentation.opacity" :transform="`translate(${item.bounds.x + item.bounds.width / 2} ${item.bounds.y + item.bounds.height / 2}) scale(${unitScale})`">
                    <circle v-if="item.element.actorKey === 'player' || item.element.kind === 'player'" r="19" class="scene-player-halo" />
                    <circle r="11" :stroke="item.presentation.stroke" />
                    <SceneSymbol v-if="organicSymbol(item.element.icon)" :icon="item.element.icon" x="-8" y="-8" width="16" height="16" style="color: var(--map-accent)" />
                    <text v-else-if="symbolsReady" class="map-material-symbol" aria-hidden="true">{{ item.presentation.icon }}</text>
                    <text v-else class="map-symbol-fallback" aria-hidden="true">{{ item.presentation.fallback }}</text>
                </g>
            </template>
            <g class="scene-labels" :style="{ '--scene-unit-scale': unitScale }">
                <template v-for="item in items" :key="item.element.id">
                    <text v-if="item.element.label" class="map-scene-label" :class="{ 'is-primary': item.element.shape === 'label' }" :x="sceneElementLabelPoint(item.element, unitScale)[0]" :y="sceneElementLabelPoint(item.element, unitScale)[1]">{{ item.element.label }}</text>
                </template>
            </g>
        </template>
    </MapViewport>
</template>
