<script setup lang="ts">
defineProps<{
    documentAvailable: boolean;
    readOnly: boolean;
    dirty: boolean;
    mode: 'edit' | 'preview';
    draft: string;
    previewHtml: string;
    previewSignature: string;
    status: string;
    hasSelectedFile: boolean;
    loadedPath: string;
    fileMeta: string;
}>();

const emit = defineEmits<{
    (event: 'update:draft', value: string): void;
    (event: 'enter-edit'): void;
    (event: 'preview'): void;
    (event: 'discard'): void;
    (event: 'save'): void;
}>();

function handleDraftInput(event: Event) {
    emit('update:draft', (event.target as HTMLTextAreaElement).value);
}
</script>

<template>
  <aside class="tavern-memory-editor xb-editor">
    <header class="tavern-editor-head xb-editor-head">
      <div class="tavern-editor-actions xb-editor-actions">
        <button
          type="button"
          class="tavern-editor-mode-button"
          :class="{ active: mode === 'edit' }"
          :disabled="!documentAvailable || readOnly"
          @click="$emit('enter-edit')"
        >
          编辑
        </button>
        <button
          type="button"
          class="tavern-editor-mode-button"
          :class="{ active: mode === 'preview' }"
          :disabled="!documentAvailable"
          @click="$emit('preview')"
        >
          阅读
        </button>
        <button
          v-if="dirty"
          type="button"
          class="tavern-editor-discard-button"
          :disabled="!documentAvailable"
          @click="$emit('discard')"
        >
          放弃
        </button>
        <button
          v-if="dirty"
          type="button"
          class="tavern-editor-save-button"
          :disabled="!hasSelectedFile || !dirty || readOnly"
          @click="$emit('save')"
        >
          保存
        </button>
      </div>
    </header>
    <div class="tavern-editor-body xb-editor-body">
      <div
        v-if="documentAvailable && mode === 'preview'"
        class="tavern-editor-preview xb-tavern-markdown"
        :data-markdown-signature="previewSignature"
        v-html="previewHtml"
      />
      <textarea
        v-else-if="documentAvailable"
        :value="draft"
        :readonly="readOnly"
        spellcheck="false"
        data-memory-editor-textarea="true"
        @input="handleDraftInput"
      />
      <div
        v-else
        class="tavern-editor-empty"
      >
        选择一份记忆档案。
      </div>
    </div>
    <footer class="tavern-editor-foot xb-editor-foot">
      <span v-if="readOnly || dirty">{{ readOnly ? '只读' : '有未保存修改' }}</span>
      <span v-if="status">{{ status }}</span>
      <span v-if="!hasSelectedFile && loadedPath">原档案暂不可用</span>
      <span v-if="hasSelectedFile">{{ fileMeta }}</span>
    </footer>
  </aside>
</template>
