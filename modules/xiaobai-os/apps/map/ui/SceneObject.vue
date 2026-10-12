<script setup lang="ts">
import { computed, useId } from 'vue';
import type { MapElement } from '../../../domains/map/types.js';
import { sceneElementBounds } from './scene-geometry.js';
import { materialFace, materialPaint } from './scene-materials.js';
import { formSurface } from './scene-forms.js';
import { organicSymbol } from './scene-organic-symbols.js';
import SceneSymbol from './SceneSymbol.vue';

const props = defineProps<{ element: MapElement; prefix: string; unitScale: number }>();
const bounds = computed(() => sceneElementBounds(props.element));
const detailed = computed(() => Math.min(bounds.value.width, bounds.value.height) / props.unitScale >= 12);
const round = computed(() => props.element.shape === 'circle');
const material = computed(() => formSurface(props.element));
const face = computed(() => materialFace(material.value, props.prefix));
const texture = computed(() => materialPaint(material.value, props.prefix));
const clipId = `scene-object-${useId()}`;
</script>

<template>
    <svg :x="bounds.x" :y="bounds.y" :width="bounds.width" :height="bounds.height" viewBox="0 0 100 100" preserveAspectRatio="none" class="scene-object">
        <defs><clipPath :id="clipId"><circle v-if="round" cx="50" cy="50" r="50" /><rect v-else width="100" height="100" /></clipPath></defs>
        <g :clip-path="`url(#${clipId})`" :fill="face">
            <circle v-if="round" cx="50" cy="50" r="49" class="scene-object-edge" />
            <rect v-else x="1" y="1" width="98" height="98" rx="2" class="scene-object-edge" />
            <template v-if="detailed">
                <circle v-if="round" cx="50" cy="50" r="44" :fill="texture" class="scene-object-inset" />
                <rect v-else x="5" y="5" width="90" height="90" rx="2" :fill="texture" class="scene-object-inset" />
                <SceneSymbol v-if="organicSymbol(element.icon)" :icon="element.icon" x="12" y="12" width="76" height="76" style="color: var(--scene-edge)" />
                <template v-else-if="element.icon === 'table' || element.icon === 'counter'">
                    <path :d="round ? 'M18 36A35 35 0 0 1 72 22' : 'M8 13V8H92'" class="scene-object-shine" />
                    <path v-if="element.icon === 'counter'" d="M9 78H91" class="scene-object-seam" />
                </template>
                <template v-else-if="element.icon === 'chair'">
                    <rect x="12" y="29" width="76" height="61" rx="9" class="scene-object-inset" />
                    <rect x="7" y="5" width="86" height="23" rx="6" class="scene-object-edge" />
                    <path d="M16 12H84" class="scene-object-shine" />
                </template>
                <template v-else-if="element.icon === 'bed'">
                    <rect x="10" y="12" width="80" height="79" rx="5" class="scene-object-inset" />
                    <rect x="20" y="17" width="60" height="20" rx="7" class="scene-object-inset" />
                    <path d="M12 45H88M17 82H83" class="scene-object-seam" />
                    <path d="M18 49H82" class="scene-object-shine" />
                </template>
                <template v-else-if="element.icon === 'shelf'">
                    <path d="M8 32H92M8 66H92M40 8V32M65 32V66M35 66V92" class="scene-object-seam" />
                    <path d="M8 34H92M8 68H92" class="scene-object-shine" />
                </template>
                <template v-else-if="element.icon === 'sofa'">
                    <rect x="8" y="5" width="84" height="25" rx="7" class="scene-object-inset" />
                    <rect v-for="i in 3" :key="i" :x="15 + (i - 1) * 24" y="32" width="22" height="57" rx="5" class="scene-object-inset" />
                    <rect x="3" y="23" width="11" height="70" rx="4" class="scene-object-inset" />
                    <rect x="86" y="23" width="11" height="70" rx="4" class="scene-object-inset" />
                </template>
                <template v-else-if="element.icon === 'bridge'">
                    <path d="M7 7V93M93 7V93M9 20H91M9 35H91M9 50H91M9 65H91M9 80H91" class="scene-object-seam" />
                    <path d="M11 7V93M89 7V93" class="scene-object-shine" />
                </template>
                <template v-else-if="element.icon === 'tree'">
                    <circle cx="34" cy="32" r="24" class="scene-object-inset" /><circle cx="69" cy="36" r="24" class="scene-object-inset" />
                    <circle cx="30" cy="62" r="23" class="scene-object-inset" /><circle cx="64" cy="67" r="25" class="scene-object-inset" /><circle cx="49" cy="48" r="26" class="scene-object-inset" />
                    <path d="M21 24q10-10 22-4M36 41q8-9 22-6M64 56q8-1 13 5" class="scene-object-shine" />
                </template>
                <template v-else-if="element.icon === 'rock'">
                    <path d="M8 38 33 12 76 18 93 57 71 88 25 86ZM33 12 41 44 8 38M41 44 76 18M41 44 71 88M41 44 93 57" class="scene-object-seam" />
                    <path d="M12 38 33 17 72 22" class="scene-object-shine" />
                </template>
            </template>
        </g>
    </svg>
</template>
