<script setup lang="ts">
import { ref } from 'vue';
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';

const props = defineProps<{ content: string; busy: boolean; error: string }>();
const emit = defineEmits<{ close: []; save: [content: string] }>();
const draft = ref(props.content);
function close() {
    if (draft.value === props.content || window.confirm('放弃尚未保存的记忆修改？')) { emit('close'); }
}
function clear() {
    if (window.confirm('清空皮下记忆？聊天原文仍保留，已归档的内容不会自动重新送入上下文。')) {
        draft.value = '';
        emit('save', '');
    }
}
</script>

<template>
    <AppDialog class="fourth-wall-memory fourth-wall-dialog" aria-label="皮下记忆" :busy="busy" @close="close">
        <header><strong>皮下记忆</strong><button type="button" :disabled="busy" @click="close">关闭</button></header>
        <textarea v-model="draft" aria-label="皮下记忆正文" :disabled="busy" placeholder="总结后的皮下人设与长期记忆，也可以直接填写。" />
        <p v-if="error" class="fourth-wall-dialog-error" role="alert">{{ error }}</p>
        <footer>
            <button type="button" class="is-danger" :disabled="busy || !content" @click="clear">清空记忆</button>
            <button type="button" class="is-primary" :disabled="busy" @click="emit('save', draft)">保存</button>
        </footer>
    </AppDialog>
</template>
