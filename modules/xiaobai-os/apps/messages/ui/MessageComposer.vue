<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import type { OutgoingMessage } from '../application/image-upload.js';
import MessageIcon from './MessageIcon.vue';
import type { MessageDraft } from './draft.js';
import { readMessageImage } from './image-file.js';
import { shouldSendOnEnter } from '../../../shell/app-src/input/composer-keyboard.js';
const props = defineProps<{ disabled: boolean; sending: boolean; waitingFor: string }>();
const emit = defineEmits<{ send: [payload: OutgoingMessage] }>();
const draft = defineModel<MessageDraft>('draft', { required: true });
const text = computed({ get: () => draft.value.text, set: value => {draft.value = { ...draft.value, text: value };} });
const fileInput = ref<HTMLInputElement | null>(null);
const reading = ref(false); const error = ref('');
const composing = ref(false);
let alive = true;
async function choose(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; input.value = '';
    if (!file || props.sending || reading.value) {return;}
    reading.value = true; error.value = '';
    try {const image = await readMessageImage(file); if (alive) {draft.value = { ...draft.value, image };}}
    catch (cause) {if (alive) {error.value = cause instanceof Error ? cause.message : '图片读取失败，请重新选择。';}}
    finally {if (alive) {reading.value = false;}}
}
function remove() {draft.value = { ...draft.value, image: null }; error.value = '';}
function send() {
    const value = text.value.trim(); if ((!value && !draft.value.image) || props.disabled || reading.value) {return;}
    emit('send', draft.value.image ? { type: 'image', description: value, upload: { ...draft.value.image } } : { type: 'text', text: value });
}
onUnmounted(() => {alive = false;});
function keydown(event: KeyboardEvent) {
    if (!shouldSendOnEnter(event, composing.value)) {return;}
    event.preventDefault(); send();
}
</script>
<template>
    <form class="messages-composer" @submit.prevent="send">
        <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden aria-label="选择图片文件" @change="choose">
        <div v-if="draft.image" class="messages-attachment-preview">
            <img :src="draft.image.dataUrl" :alt="draft.image.name">
            <span><strong>待发送的图片</strong><small>{{ draft.image.name }}</small></span>
            <button type="button" class="messages-icon-button" aria-label="移除图片" :disabled="sending || reading" @click="remove"><MessageIcon name="close" /></button>
        </div>
        <p v-if="draft.image" class="messages-composer-hint">图片将随消息发送，需要当前模型支持看图。</p>
        <p v-if="reading || error" class="messages-composer-hint" role="status">{{ reading ? '正在读取图片…' : error }}</p>
        <p v-if="waitingFor" class="messages-composer-wait" role="status">正在等待 {{ waitingFor }} 的回复。可以先写好，稍后发送。</p>
        <div class="messages-composer-line">
            <button type="button" class="messages-icon-button messages-attach" aria-label="选择图片" :disabled="sending || reading" @click="fileInput?.click()"><MessageIcon name="plus" /></button>
            <textarea v-model="text" rows="1" maxlength="4000" enterkeyhint="enter" :placeholder="draft.image ? '给图片配句话…' : '说点什么…'" aria-label="消息内容" :disabled="sending" @keydown="keydown" @compositionstart="composing = true" @compositionend="composing = false" />
            <button class="messages-send" type="submit" :disabled="disabled || reading || (!text.trim() && !draft.image)" aria-label="发送"><MessageIcon name="send" /></button>
        </div>
    </form>
</template>
