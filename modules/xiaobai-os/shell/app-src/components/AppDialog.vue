<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { appNavigationKey, useAppLayer } from '../navigation/app-navigation.js';
defineOptions({ inheritAttrs: false });
const props = defineProps<{ busy?: boolean }>();
const emit = defineEmits<{ close: [] }>();
const navigation = inject(appNavigationKey, null);
const host = computed(() => navigation?.root.value?.firstElementChild ?? null);
const shade = ref<HTMLElement | null>(null);
function close() { if (!props.busy) { emit('close'); } }
useAppLayer(shade, close);
</script>
<template>
    <Teleport :to="host ?? 'body'" :disabled="!host">
        <div ref="shade" class="os-app-dialog-shade" @click.self="close" @keydown.esc.stop.prevent="close">
            <section v-bind="$attrs" role="dialog" tabindex="-1"><slot /></section>
        </div>
    </Teleport>
</template>
<style>
.os-app-dialog-shade { position: absolute; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 12px; background: rgb(12 17 27 / 40%); backdrop-filter: blur(4px); }
.os-app-dialog-shade > [role="dialog"] { position: relative; inset: auto; display: block; margin: auto; max-width: 100%; max-height: 100%; box-sizing: border-box; overflow: auto; }
</style>
