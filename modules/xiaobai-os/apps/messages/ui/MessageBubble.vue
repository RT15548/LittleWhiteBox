<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import type { PrivateMessage } from '../../../domains/messages/types.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import MessageIcon from './MessageIcon.vue';
import MessageImage from './MessageImage.vue';
import type { MessagesClientState } from '../types.js';
import type { MessagePermission } from '../application/modifications.js';
const props = defineProps<{ message: PrivateMessage; bridge: XiaobaiOsAppProps['bridge']; chatIdentity: string; media: MessagesClientState['media']; disabled: boolean; selected: boolean; permission?: MessagePermission }>();
const emit = defineEmits<{ resize: []; select: [messageId: string]; deleteMessage: [messageId: string]; regenerate: [messageId: string] }>();
function select(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('button, a, dialog') || window.getSelection()?.toString()) {return;}
    emit('select', props.message.id);
}
const error = ref(''); const voiceState = ref(''); const showText = ref(false);
const voiceActive = computed(() => ['playing', 'loading', 'generating', 'queued'].includes(voiceState.value));
const stopping = ref(false);
let alive = true;
const request = (type: string) => props.bridge.request(type, { chatIdentity: props.chatIdentity, messageId: props.message.id }, 180000);
async function voice() {
    if (stopping.value) {return;}
    error.value = '';
    const stop = voiceActive.value;
    if (!stop && !props.media.voice) {return;}
    try {
        if (stop) {
            stopping.value = true;
            await request('messages/voice/stop');
            if (alive) {voiceState.value = '';}
        } else {
            voiceState.value = 'loading';
            await request('messages/voice/play');
        }
    } catch {
        if (alive) {
            if (!stop) {voiceState.value = '';}
            error.value = stop ? '未能确认停止，请再点一次停止。' : '语音暂时无法播放，原文仍可查看。';
        }
    } finally {if (alive) {stopping.value = false;}}
}
const unsubscribe = props.bridge.subscribe(event => {
    if (event.type !== 'messages/voice-state') {return;}
    const payload = event.payload as { messageId: string; status: string };
    if (payload.messageId === props.message.id) {voiceState.value = payload.status;}
    else if (payload.status === 'playing') {voiceState.value = '';}
    if (payload.messageId === props.message.id && payload.status === 'error') {error.value = '播放失败，点击可以重试。';}
});
onUnmounted(() => {alive = false; unsubscribe(); if (voiceActive.value) {void request('messages/voice/stop').catch(() => {});}});
</script>
<template>
    <article class="messages-bubble-row" :class="{ outgoing: message.sender === 'user', 'actions-selected': selected }" :data-message-id="message.id" tabindex="0" aria-label="消息操作" @click="select" @focus="emit('select', message.id)">
        <div class="messages-bubble-actions" role="group" aria-label="消息操作">
            <button :disabled="disabled" :title="permission?.reason" :class="{ 'is-unavailable': permission?.reason }" aria-haspopup="dialog" @click="$emit('deleteMessage', message.id)">删除</button>
            <button v-if="permission?.regenerate" :disabled="disabled" @click="$emit('regenerate', message.id)">重新回复</button>
        </div>
        <div class="messages-bubble" :class="`messages-bubble-${message.payload.type}`">
            <p v-if="message.payload.type === 'text'">{{ message.payload.text }}</p>
            <MessageImage v-else-if="message.payload.type === 'image'" :message="message" :bridge="bridge" :chat-identity="chatIdentity" :available="media.image" @resize="$emit('resize')" />
            <template v-else>
                <button class="messages-voice-button" :disabled="stopping || (!media.voice && !voiceActive)" :aria-label="voiceActive ? '停止播放' : '播放语音'" @click="voice"><MessageIcon :name="voiceActive ? 'stop' : 'play'" /><span class="messages-wave" :class="{ playing: voiceState === 'playing' }"><i v-for="n in 16" :key="n" :style="{ height: `${8 + (n * 7 % 17)}px`, animationDelay: `${n * 45}ms` }" /></span><small>{{ stopping ? '停止中' : ['loading', 'generating', 'queued'].includes(voiceState) ? '准备中' : '语音' }}</small></button>
                <small v-if="!media.voice" class="messages-media-unavailable-note">开启 TTS 后可播放</small>
                <button v-if="media.voice" class="messages-transcript-toggle" @click="showText = !showText">{{ showText ? '收起原文' : '查看原文' }}</button>
                <p v-if="showText || !media.voice" class="messages-transcript">{{ message.payload.transcript }}</p>
            </template>
            <small v-if="error" class="messages-media-error" role="status">{{ error }}</small>
        </div>
    </article>
</template>
