<script setup lang="ts">
defineProps<{
    isHome: boolean;
}>();
</script>

<template>
    <header class="xiaobai-os-system-bar" :class="{ 'is-home': isHome }" aria-label="系统栏">
        <span class="xiaobai-os-system-mark">小白 OS</span>
    </header>
</template>
