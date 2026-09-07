<script setup lang="ts">
defineProps<{
    isHome: boolean;
    canBack: boolean;
}>();

defineEmits<{
    back: [];
    home: [];
    close: [];
}>();
</script>

<template>
    <nav class="xiaobai-os-navigation" :class="{ 'is-home': isHome }" aria-label="系统导航">
        <button type="button" class="xiaobai-os-nav-button" :disabled="!canBack" aria-label="返回" @pointerdown.prevent @click="$emit('back')">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 6-6 6 6 6" /></svg>
        </button>
        <button type="button" class="xiaobai-os-nav-button xiaobai-os-home-button" aria-label="主页" @click="$emit('home')">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4.5 11 7.5-6 7.5 6v8h-5v-5h-5v5h-5z" /></svg>
            <i v-if="isHome" aria-hidden="true" />
        </button>
        <button type="button" class="xiaobai-os-nav-button xiaobai-os-close-button" aria-label="关闭" @click="$emit('close')">
            <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9.5 5 5 5-5" /></svg></span>
        </button>
    </nav>
</template>
