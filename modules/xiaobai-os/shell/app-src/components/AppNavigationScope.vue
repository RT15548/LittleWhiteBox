<script setup lang="ts">
import { provide, ref, shallowRef, watchEffect } from 'vue';
import { appNavigationKey } from '../navigation/app-navigation.js';
import { createBackStack } from '../navigation/back-stack.js';

const props = defineProps<{ owner: string }>();
const root = ref<HTMLElement | null>(null);
const layers = shallowRef<HTMLElement[]>([]);
const stack = createBackStack();
provide(appNavigationKey, { root, layers, stack });
watchEffect(cleanup => {
    const layer = layers.value.at(-1);
    if (!layer || !root.value?.contains(layer)) { return; }
    const changed = new Set<HTMLElement>();
    function protectBackground() {
        let child: HTMLElement = layer!;
        while (child.parentElement && child !== root.value) {
            for (const sibling of child.parentElement.children) {
                if (sibling !== child && sibling instanceof HTMLElement && !sibling.inert) { sibling.inert = true; changed.add(sibling); }
            }
            child = child.parentElement;
        }
    }
    protectBackground();
    // Status notices may be inserted while a dialog is open. Observe only the
    // ancestor child lists, never message contents or the host document.
    const observer = new MutationObserver(protectBackground);
    let child: HTMLElement = layer;
    while (child.parentElement && child !== root.value) {
        observer.observe(child.parentElement, { childList: true });
        child = child.parentElement;
    }
    cleanup(() => { observer.disconnect(); for (const entry of changed) { entry.inert = false; } });
}, { flush: 'post' });
defineExpose({ back: stack.back, get owner() { return props.owner; } });
</script>
<template><div ref="root" class="xiaobai-os-app-route" tabindex="-1"><slot /></div></template>
<style>
.xiaobai-os-app-route { position: relative; isolation: isolate; }
</style>
