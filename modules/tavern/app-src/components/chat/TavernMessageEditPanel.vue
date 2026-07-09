<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import type { TavernMessageRecord } from '../../../shared/session-db';

const props = defineProps<{
    message: TavernMessageRecord;
    messageKey: string;
}>();

const emit = defineEmits<{
    (event: 'cancel'): void;
    (event: 'save', options: { content: string; rollbackState?: boolean }): void;
}>();

const draft = ref(String(props.message.content || ''));
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const sizerRef = ref<HTMLDivElement | null>(null);
let restoreScrollFrame = 0;

const dirty = computed(() => draft.value.trim() !== String(props.message.content || '').trim());

function scrollContainerFor(textarea: HTMLTextAreaElement): HTMLElement | null {
    return textarea.closest<HTMLElement>('.chat-scroll');
}

function autoSizeEditor() {
    const textarea = textareaRef.value;
    const sizer = sizerRef.value;
    if (!textarea || !sizer) {return;}
    const scrollContainer = scrollContainerFor(textarea);
    const previousScrollTop = scrollContainer?.scrollTop ?? 0;
    const previousHeight = textarea.offsetHeight;
    const minHeight = 144;
    const maxHeight = 420;
    const style = window.getComputedStyle(textarea);

    sizer.textContent = textarea.value || ' ';
    sizer.style.width = `${textarea.clientWidth}px`;
    sizer.style.font = style.font;
    sizer.style.lineHeight = style.lineHeight;
    sizer.style.letterSpacing = style.letterSpacing;
    sizer.style.padding = style.padding;
    sizer.style.border = style.border;
    sizer.style.boxSizing = style.boxSizing;
    const nextHeight = Math.min(Math.max(sizer.scrollHeight, minHeight), maxHeight);
    if (Math.abs(previousHeight - nextHeight) >= 1) {
        textarea.style.height = `${nextHeight}px`;
        if (scrollContainer) {
            scrollContainer.scrollTop = previousScrollTop;
        }
    }

    if (scrollContainer) {
        if (restoreScrollFrame) {
            cancelAnimationFrame(restoreScrollFrame);
        }
        restoreScrollFrame = requestAnimationFrame(() => {
            restoreScrollFrame = 0;
            scrollContainer.scrollTop = previousScrollTop;
        });
    }
}

function focusEditor() {
    void nextTick(() => {
        const textarea = textareaRef.value;
        if (!textarea) {return;}
        autoSizeEditor();
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    });
}

function save(options: { rollbackState?: boolean } = {}) {
    if (!dirty.value) {return;}
    emit('save', { content: draft.value, ...options });
}

function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.preventDefault();
        emit('cancel');
        return;
    }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        save();
    }
}

watch(() => props.messageKey, () => {
    draft.value = String(props.message.content || '');
    focusEditor();
}, { immediate: true });

onBeforeUnmount(() => {
    if (restoreScrollFrame) {
        cancelAnimationFrame(restoreScrollFrame);
        restoreScrollFrame = 0;
    }
});
</script>

<template>
  <div class="message-edit-panel">
    <textarea
      ref="textareaRef"
      v-model="draft"
      class="message-edit-box"
      rows="6"
      :data-message-editor="messageKey"
      @input="autoSizeEditor"
      @keydown="handleKeydown"
    />
    <div
      ref="sizerRef"
      class="message-edit-sizer"
      aria-hidden="true"
    />
    <div class="message-edit-actions">
      <button
        type="button"
        :disabled="!dirty"
        @click="save()"
      >
        仅保存
      </button>
      <button
        type="button"
        :disabled="!dirty"
        @click="save({ rollbackState: true })"
      >
        回滚保存
      </button>
      <button
        type="button"
        @click="$emit('cancel')"
      >
        取消
      </button>
    </div>
  </div>
</template>
