<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useTavernChatContext } from '../tavern-app-context';
import { patchTavernMarkdownRoot } from './patch-markdown-root';

const props = defineProps<{
    html?: string;
    text?: string;
    render?: (text: string) => string;
    signature: string;
    actionCheckGroups?: string;
    phase: 'live' | 'settled';
}>();

const chat = useTavernChatContext();
const markdownRoot = ref<HTMLElement | null>(null);
let renderedHtml = '';
let renderedSignature = '';
let renderedPhase = '';

function enhanceRenderedMarkdown() {
    const root = markdownRoot.value;
    if (!root) {return;}
    chat.enhanceMarkdownRoot(root, { live: props.phase === 'live' });
}

function renderMarkdown() {
    const root = markdownRoot.value;
    if (!root) {return;}
    const html = props.render ? props.render(props.text || '') : props.html || '';
    if (html !== renderedHtml || props.signature !== renderedSignature || props.phase !== renderedPhase) {
        chat.releaseMarkdownRootResources(root);
        patchTavernMarkdownRoot(root, html);
        renderedHtml = html;
        renderedSignature = props.signature;
        renderedPhase = props.phase;
    }
    void nextTick(enhanceRenderedMarkdown);
}

onMounted(renderMarkdown);

watch(
    () => [props.html, props.text, props.render, props.signature, props.phase] as const,
    renderMarkdown,
    { flush: 'post' },
);

onBeforeUnmount(() => {
    const root = markdownRoot.value;
    if (root) {
        chat.releaseMarkdownRootResources(root);
    }
});
</script>

<template>
  <div
    ref="markdownRoot"
    class="xb-tavern-markdown"
    :class="{ 'is-live-markdown': phase === 'live' }"
    :data-action-check-groups="actionCheckGroups || undefined"
    data-markdown-managed="true"
    :data-markdown-signature="signature"
  />
</template>
