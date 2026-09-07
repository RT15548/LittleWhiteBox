<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';
import type { PrivateMessage } from '../../../domains/messages/types.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import MessageIcon from './MessageIcon.vue';
import type { MessagesClientState } from '../types.js';
const props = defineProps<{ message: PrivateMessage; bridge: XiaobaiOsAppProps['bridge']; chatIdentity: string; media: MessagesClientState['media']; disabled: boolean }>();
defineEmits<{ resize: []; deleteImage: [messageId: string] }>();
const data = ref(''); const working = ref(false); const error = ref(''); const voiceState = ref(''); const showText = ref(false);
const attachment = computed(() => props.message.payload.type === 'image' ? props.message.payload.attachment : undefined);
const imageSource = computed(() => attachment.value?.path || data.value);
const imageFailed = ref(false);
const viewerOpen = ref(false);
const voiceActive = computed(() => ['playing', 'loading', 'generating', 'queued'].includes(voiceState.value));
const stopping = ref(false);
let alive = true;
const request = (type: string) => props.bridge.request(type, { chatIdentity: props.chatIdentity, messageId: props.message.id }, 180000);
async function image(generate: boolean) {
    if (working.value) {return;} working.value = true; error.value = '';
    try {
        const { result } = await request(generate ? 'messages/image/generate' : 'messages/image/check') as { result: { data: string | null } };
        if (alive) {data.value = result.data ?? ''; imageFailed.value = false; if (generate && !data.value) {error.value = '请开启画图后再试，画面描述已保留。';}}
    } catch {if (alive && generate) {error.value = '图片生成失败，可以再试一次。';}}
    finally {if (alive) {working.value = false;}}
}
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
onMounted(() => {if (props.message.payload.type === 'image' && !attachment.value) {void image(false);}});
watch(() => props.media.image, available => {if (available && props.message.payload.type === 'image' && !attachment.value && !data.value) {void image(false);}});
onUnmounted(() => {alive = false; unsubscribe();});
</script>
<template>
    <article class="messages-bubble-row" :class="{ outgoing: message.sender === 'user' }">
        <div class="messages-bubble" :class="`messages-bubble-${message.payload.type}`">
            <p v-if="message.payload.type === 'text'">{{ message.payload.text }}</p>
            <template v-else-if="message.payload.type === 'image'">
                <button v-if="imageSource && !imageFailed" class="messages-image-open" aria-label="放大图片" @click="viewerOpen = true"><img :src="imageSource" :alt="message.payload.description || attachment?.name || '图片'" @load="$emit('resize')" @error="imageFailed = true"></button>
                <button v-else-if="attachment" class="messages-image-placeholder" @click="imageFailed = false"><MessageIcon name="image" /><span>原图暂时无法读取</span><small>点击重试</small></button>
                <button v-else-if="media.image" class="messages-image-placeholder" :disabled="working" @click="image(true)"><MessageIcon name="image" /><span>{{ working ? '正在生成图片…' : error ? '重新生成图片' : '生成图片' }}</span></button>
                <div v-else class="messages-image-placeholder messages-media-unavailable"><MessageIcon name="image" /><span>图片描述</span><small>开启画图后可生成图片</small></div>
                <p v-if="message.payload.description" class="messages-image-caption">{{ message.payload.description }}</p>
                <button v-if="message.sender === 'user' && attachment" class="messages-image-delete" :disabled="disabled" @click="$emit('deleteImage', message.id)">删除图片消息</button>
                <AppDialog v-if="viewerOpen" class="messages-image-viewer" aria-label="查看图片" @close="viewerOpen = false"><button aria-label="关闭图片" @click="viewerOpen = false"><MessageIcon name="close" /></button><img v-if="imageSource" :src="imageSource" :alt="message.payload.description || attachment?.name || '图片'"></AppDialog>
            </template>
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
