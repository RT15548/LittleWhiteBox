<script setup lang="ts">
import { ref, watch } from 'vue';
import { enhanceMarkdownCodeBlocks, renderMarkdownToHtml } from '../../../../agent-core/ui/message-markdown.js';

const props = defineProps<{ text: string }>();
const surface = ref<HTMLElement | null>(null);
const tags = new Set(['p', 'br', 'em', 'i', 'strong', 'b', 'del', 's', 'u', 'code', 'pre', 'blockquote',
    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a']);
const omitted = new Set(['script', 'style', 'custom-style', 'iframe', 'object', 'embed', 'svg', 'math']);

watch([surface, () => props.text], () => {
    if (!surface.value) { return; }
    const template = document.createElement('template');
    // Parse the shared Markdown output inertly; classroom replies allow text markup, not generated apps or remote media.
    // eslint-disable-next-line no-unsanitized/property -- mounted elements/attributes are allowlisted below
    template.innerHTML = renderMarkdownToHtml(props.text, { htmlFenceMode: 'code' });
    for (const element of template.content.querySelectorAll('*')) {
        const tag = element.localName;
        if (omitted.has(tag)) { element.remove(); continue; }
        if (tag === 'img') { element.replaceWith(document.createTextNode(element.getAttribute('alt') ?? '')); continue; }
        if (!tags.has(tag)) { element.replaceWith(...element.childNodes); continue; }
        const href = element.getAttribute('href') ?? '';
        const start = element.getAttribute('start') ?? '';
        for (const attribute of [...element.attributes]) { element.removeAttribute(attribute.name); }
        if (tag === 'a' && /^(?:https?:\/\/|mailto:)/i.test(href)) {
            element.setAttribute('href', href); element.setAttribute('target', '_blank'); element.setAttribute('rel', 'noopener noreferrer');
        }
        if (tag === 'ol' && /^\d+$/.test(start)) { element.setAttribute('start', start); }
    }
    enhanceMarkdownCodeBlocks(template.content, { codeBlockClassName: 'learning-codeblock', codeCopyClassName: 'learning-code-copy' });
    surface.value.replaceChildren(template.content);
}, { flush: 'post' });
</script>

<template><div ref="surface" class="learning-markdown" /></template>
