<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { applyStreamFadeMarkdown } from './stream-fade-markdown';

const props = defineProps<{
    html: string;
    signature: string;
    actionCheckGroups?: string;
    animated?: boolean;
}>();

const markdownRoot = ref<HTMLElement | null>(null);

function renderStreamMarkdown() {
    const root = markdownRoot.value;
    if (!root) {return;}
    applyStreamFadeMarkdown(root, props.html || '');
}

onMounted(renderStreamMarkdown);

watch(
    () => props.html,
    renderStreamMarkdown,
    { flush: 'post' },
);
</script>

<template>
  <div
    ref="markdownRoot"
    class="xb-tavern-markdown"
    :class="{ 'xb-tavern-stream-fade': animated !== false }"
    :data-action-check-groups="actionCheckGroups || undefined"
    :data-markdown-signature="signature"
  />
</template>
