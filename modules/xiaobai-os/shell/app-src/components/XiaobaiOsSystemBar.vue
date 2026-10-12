<script setup lang="ts">
import { MASCOT_MARK_URL } from '../../../brand/mascot/assets.js';
defineProps<{
    isHome: boolean;
}>();
</script>

<template>
    <header class="xiaobai-os-system-bar" :class="{ 'is-home': isHome }" aria-label="系统栏">
        <span class="xiaobai-os-system-mark"><img :src="MASCOT_MARK_URL" alt="" aria-hidden="true">小白 OS</span>
    </header>
</template>
