<script setup lang="ts">
import { computed } from 'vue';
import { houseParts } from './house.js';
import { PARTS, partKey, type Blueprint, type Room } from './policy.js';
const props = defineProps<{ brief: Blueprint; rooms: Room[] }>();
const parts = computed(() => houseParts(props.brief, props.rooms).sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x));
</script>
<template>
    <svg :viewBox="`-8 -8 ${brief.width * 24 + brief.depth * 10 + 16} ${(brief.floors + 1) * 23 + brief.depth * 12 + 15}`" fill="none" aria-hidden="true" class="build-house-portrait">
        <path :d="`M-3 ${(brief.floors + 1) * 23 + 2}h${brief.width * 24 + 6}`" stroke="#bdcfbe" stroke-width="5" stroke-linecap="round" />
        <g v-for="part in parts" :key="partKey(part)" :transform="`translate(${part.x * 24 + part.z * 10} ${(brief.floors - part.y) * 23 + part.z * 12})`">
            <template v-if="part.kind === 'roof'"><path d="M0 22 12 10 24 22Z" fill="#a8cbb9" /></template>
            <template v-else-if="part.kind === 'path'"><path d="M3 22h18" stroke="#fffdf3" stroke-width="4" /></template>
            <template v-else-if="part.kind === 'garden'"><path d="M12 23V8" stroke="#ba997a" stroke-width="2" /><ellipse cx="12" cy="8" rx="8" ry="9" fill="#a8cbb9" /></template>
            <template v-else-if="part.kind === 'terrace'"><path d="M1 22h22M2 22V12m6 10V12m8 10V12m6 10V12M1 12h22" stroke="#bdaa90" stroke-width="1.5" /></template>
            <template v-else><rect :width="PARTS[part.kind].width * 24" height="23" fill="#fffdf3" stroke="#cfbda3" /><path v-if="part.kind === 'entry'" d="M8 23V9h9v14" fill="#b1cebd" /><path v-else-if="part.kind === 'study'" d="M4 9q4-2 8 0 4-2 8 0v10q-4-2-8 0-4-2-8 0Z" fill="#b1cebd" stroke="#789b8c" /><template v-else><rect v-for="n in PARTS[part.kind].width" :key="n" :x="(n - 1) * 24 + 7" y="5" width="10" height="12" fill="#f6d99b" /></template></template>
        </g>
    </svg>
</template>
