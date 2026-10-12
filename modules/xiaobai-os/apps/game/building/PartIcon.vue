<script setup lang="ts">
import type { PartKind } from './policy.js';
defineProps<{ kind: PartKind }>();
</script>
<template>
    <svg viewBox="0 0 48 40" fill="none" aria-hidden="true" class="build-part-icon">
        <template v-if="kind === 'roof'"><path d="m4 28 20-19 20 19H4Z" fill="#bbdcd0" stroke="#668c83" stroke-width="2" /><path d="M9 30h30" stroke="#e0c6a5" stroke-width="3" /></template>
        <template v-else-if="kind === 'garden'"><path d="M5 33h38v4H5z" fill="#abcabd" /><path d="M29 17v16" stroke="#b08b61" stroke-width="3" /><path d="M17 19c-4-8 4-12 7-11 2-9 17-5 13 4 10 8-3 17-8 12-4 3-12 1-12-5Z" fill="#bbdcd0" /><path d="M9 33v-9m-4 4h9" stroke="#d4a398" stroke-width="3" /></template>
        <template v-else-if="kind === 'path'"><path d="M4 35 15 4h27L32 35Z" fill="#bbdcd0" /><path d="m12 28 19 1m-15-10 19 1m-15-10 19 1" stroke="#fffdf3" stroke-width="6" /></template>
        <template v-else-if="kind === 'terrace'"><path d="M5 33h38M7 33V20m11 13V20m11 13V20m12 13V20M5 20h38" stroke="#ab9275" stroke-width="2" /><path d="M31 18h8v-7h-8z" fill="#bcd8ca" /></template>
        <template v-else>
            <path :d="kind === 'wide' ? 'M3 5h42v30H3z' : 'M10 5h28v30H10z'" fill="#fffaf0" stroke="#baa990" stroke-width="2" />
            <path v-if="kind === 'entry'" d="M18 35V15h12v20" fill="#bcd8ca" stroke="#789b8c" stroke-width="2" />
            <template v-else-if="kind === 'study'"><path d="M15 15q5-3 9 0 5-3 10 0v14q-5-3-10 0-4-3-9 0Z" fill="#bbdcd0" stroke="#668c83" /><path d="M24 15v14m-7-10h4m6 0h4" stroke="#668c83" /></template>
            <template v-else><path :d="kind === 'wide' ? 'M9 12h10v10H9zm20 0h10v10H29z' : 'M18 12h12v12H18z'" fill="#bddde8" /><path :d="kind === 'wide' ? 'M10 29h28' : 'M16 30h16'" stroke="#e3b8ae" stroke-width="4" /></template>
        </template>
    </svg>
</template>
