<script setup lang="ts">
import type { MapIconToken } from '../../../domains/map/types.js';
import { organicSymbol } from './scene-organic-symbols.js';
defineProps<{ icon?: MapIconToken }>();
</script>
<template>
    <svg viewBox="0 0 24 24" aria-hidden="true" class="scene-organic-symbol">
        <path :d="organicSymbol(icon)?.path" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
</template>
<style scoped>
.scene-organic-symbol { overflow: visible; }
</style>
