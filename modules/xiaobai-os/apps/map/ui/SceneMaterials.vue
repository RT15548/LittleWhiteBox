<script setup lang="ts">
import { MAP_MATERIALS } from '../../../domains/map/semantics.js';
import { materialBase } from './scene-materials.js';
defineProps<{ prefix: string }>();
</script>
<template>
    <defs>
        <template v-for="material in MAP_MATERIALS" :key="material">
            <linearGradient :id="`${prefix}-face-${material}`" x1="0" y1="0" x2=".7" y2="1">
                <stop offset="0" :stop-color="`color-mix(in srgb, ${materialBase(material)}, var(--scene-highlight) 24%)`" :stop-opacity="material === 'glass' ? .35 : 1" />
                <stop offset=".52" :stop-color="materialBase(material)" :stop-opacity="material === 'glass' ? .16 : 1" />
                <stop offset="1" :stop-color="`color-mix(in srgb, ${materialBase(material)}, var(--scene-shadow) 16%)`" :stop-opacity="material === 'glass' ? .28 : 1" />
            </linearGradient>
            <pattern :id="`${prefix}-material-${material}`" width="48" height="32" patternUnits="userSpaceOnUse" class="scene-texture">
                <rect width="48" height="32" :fill="materialBase(material)" :fill-opacity="material === 'glass' ? .4 : 1" />
                <g fill="none" stroke="var(--scene-shadow)" stroke-width=".65" opacity=".24">
                    <template v-if="material === 'wood'">
                        <path d="M0 0H48M0 16H48M19 0V16M37 16V32" />
                        <path d="M3 7Q12 4 26 8T47 7M2 26q10-4 25 0t23-1" opacity=".5" />
                    </template>
                    <path v-else-if="material === 'stone'" d="M0 0H48V32H0ZM19 0V17M0 17H48M36 17V32M3 3h12m8 0h21" />
                    <path v-else-if="material === 'tile'" d="M0 0H48V32H0ZM24 0V32M0 16H48M12 4l5 4-5 4-5-4ZM36 20l5 4-5 4-5-4Z" />
                    <path v-else-if="material === 'marble'" d="M-3 3 8 11l17 2 9 10 18 3M27-3l-8 12 3 8-7 17" opacity=".65" />
                    <path v-else-if="material === 'water'" d="M3 8q6 3 13 0M25 25q7 2 17-1" stroke="var(--scene-highlight)" stroke-width="1.3" opacity="1" />
                    <path v-else-if="material === 'glass'" d="M5 32 37 0M12 32 44 0" stroke="var(--scene-highlight)" stroke-width="2.2" />
                    <path v-else-if="material === 'grass' || material === 'forest'" d="M8 15l-2-4m2 4 3-3M36 26l-1-4m1 4 3-3" />
                    <path v-else-if="material === 'dirt' || material === 'sand'" d="M5 8h1m20-2h2m-12 17h2m23-6h1m-5 12h2" stroke-linecap="round" />
                    <path v-else-if="material === 'metal'" d="M0 0H48V32H0M0 5H48M0 27H48M5 5v1m38-1v1m-38 20v1m38-1v1" />
                    <path v-else-if="['carpet', 'fabric', 'bed-sheet', 'tatami'].includes(material)" d="M0 5H48M0 13H48M0 21H48M0 29H48M4 0v32m8-32v32m8-32v32m8-32v32m8-32v32m8-32v32" opacity=".55" />
                    <path v-else-if="material === 'rune'" d="m24 5 8 11-8 11-8-11ZM24 10v12M20 16h8" />
                    <path v-else-if="material === 'blood'" d="M7 8q12-5 16 6t20 7M4 27l6-3" />
                    <path v-else-if="material === 'flesh'" d="M-3 4Q12 18 24 7T52 12M4 32Q18 17 34 29" />
                    <path v-else-if="material === 'slime'" d="M5 13Q10 4 19 9M28 28Q35 19 43 24" stroke="var(--scene-highlight)" stroke-width="1.5" />
                    <path v-else-if="material === 'snow'" d="M5 19q5-3 11-1M29 8q6-2 12 1" stroke="var(--scene-highlight)" stroke-width="1.4" />
                </g>
                <path v-if="material === 'wood' || material === 'stone' || material === 'metal'" d="M0 1H48" stroke="var(--scene-highlight)" stroke-width=".7" opacity=".35" />
            </pattern>
        </template>
        <radialGradient :id="`${prefix}-crown-face`" cx=".32" cy=".25" r=".8">
            <stop offset="0" stop-color="var(--scene-leaf-light)" /><stop offset=".6" stop-color="var(--scene-leaf)" /><stop offset="1" stop-color="var(--scene-leaf-dark)" />
        </radialGradient>
        <symbol v-for="variant in 3" :id="`${prefix}-crown-${variant - 1}`" :key="variant" viewBox="0 0 100 100">
            <g :transform="`rotate(${variant * 37} 50 50)`" :fill="`url(#${prefix}-crown-face)`" stroke="var(--scene-leaf-dark)" stroke-width=".6">
                <path d="M49 5Q65 2 73 16Q91 14 93 36Q99 46 90 59Q95 76 76 81Q68 96 50 91Q30 97 23 82Q5 79 9 60Q-1 45 9 34Q7 17 28 16Q33 1 49 5Z" />
                <circle cx="34" cy="32" r="21" /><circle cx="69" cy="36" r="22" /><circle cx="30" cy="62" r="20" /><circle cx="64" cy="67" r="23" /><circle cx="49" cy="48" r="24" />
                <path d="M24 25q8-10 19-5M61 21q11-3 17 8M36 45q9-11 21-8M63 59q9-2 14 6" fill="none" stroke="var(--scene-leaf-light)" stroke-width="1.4" opacity=".75" />
            </g>
        </symbol>
    </defs>
</template>
