<script setup lang="ts">
import { ICON_ART, type ExpeditionIconName } from './icon-art.js';
defineProps<{ name: ExpeditionIconName }>();
</script>
<template>
    <svg class="exp-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path :d="ICON_ART[name].body" fill="currentColor" fill-opacity=".17" fill-rule="evenodd" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" />
        <path :d="ICON_ART[name].detail" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
</template>
