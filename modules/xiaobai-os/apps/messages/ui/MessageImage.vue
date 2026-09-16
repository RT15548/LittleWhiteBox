<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';
import type { PrivateMessage } from '../../../domains/messages/types.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import MessageIcon from './MessageIcon.vue';

const props = defineProps<{ message: PrivateMessage; bridge: XiaobaiOsAppProps['bridge']; chatIdentity: string; available: boolean }>();
const emit = defineEmits<{ resize: [] }>();
const root = ref<HTMLElement | null>(null);
const visible = ref(false);
const data = ref(''); const error = ref(''); const progress = ref('');
const activeRequest = ref(''); const imageFailed = ref(false); const viewerOpen = ref(false);
const attachment = computed(() => props.message.payload.type === 'image' ? props.message.payload.attachment : undefined);
const description = computed(() => props.message.payload.type === 'image' ? props.message.payload.description : '');
const source = computed(() => attachment.value?.path || data.value);
let observer: IntersectionObserver | null = null;

function cancel() {
    const mediaRequestId = activeRequest.value;
    activeRequest.value = '';
    if (mediaRequestId) {props.bridge.post('messages/image/cancel', { chatIdentity: props.chatIdentity, mediaRequestId });}
}
async function load() {
    if (activeRequest.value) {return;}
    // A decoded image already exists; a display failure only needs another load, not a paid generation.
    if (source.value) {imageFailed.value = false; return;}
    if (!props.available) {return;}
    const mediaRequestId = `image-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    activeRequest.value = mediaRequestId; error.value = ''; progress.value = '正在读取图片…';
    try {
        const { result } = await props.bridge.request('messages/image/generate', {
            chatIdentity: props.chatIdentity, messageId: props.message.id, mediaRequestId,
        }, 180_000) as { result: { data: string | null } };
        if (activeRequest.value !== mediaRequestId) {return;}
        if (!result.data) {throw new Error('画图暂不可用，请开启画图后重试。');}
        data.value = result.data; imageFailed.value = false;
    } catch (cause) {
        if (activeRequest.value !== mediaRequestId) {return;}
        const reason = cause instanceof Error ? cause.message : '';
        error.value = reason === 'host_request_timeout' ? '等待图片超过3分钟，已取消本次请求，可重试。' : reason || '图片加载失败，请重试。';
        cancel();
    } finally {if (activeRequest.value === mediaRequestId) {activeRequest.value = '';}}
}
const unsubscribe = props.bridge.subscribe(event => {
    if (event.type !== 'messages/image-progress') {return;}
    const payload = event.payload as { mediaRequestId: string; status: string; ahead?: number; delay?: number };
    if (!activeRequest.value || payload.mediaRequestId !== activeRequest.value) {return;}
    if (payload.status === 'queued') {
        const ahead = Math.max(0, Number(payload.ahead) || 0);
        progress.value = ahead ? `排队中，前方 ${ahead} 张` : '已进入图片队列';
    } else if (payload.status === 'generating') {progress.value = '正在生成图片…';}
    else if (payload.status === 'cooldown') {progress.value = payload.delay ? `等待 ${Math.ceil(payload.delay / 1000)} 秒后继续` : '等待继续生成…';}
});
onMounted(() => {
    if (attachment.value) {return;}
    if (typeof IntersectionObserver === 'undefined') {visible.value = true; return;}
    observer = new IntersectionObserver(entries => {visible.value = entries.some(entry => entry.isIntersecting);}, {
        root: root.value?.closest('.messages-thread-scroll') ?? null,
    });
    if (root.value) {observer.observe(root.value);}
});
watch([visible, () => props.available], ([inView, available]) => {
    if (inView && available && !source.value && !error.value) {void load();}
});
onBeforeUnmount(() => {observer?.disconnect(); unsubscribe(); cancel();});
</script>
<template>
    <div ref="root">
        <button v-if="source && !imageFailed" class="messages-image-open" aria-label="放大图片" @click="viewerOpen = true"><img :src="source" :alt="description || attachment?.name || '图片'" @load="emit('resize')" @error="imageFailed = true"></button>
        <button v-else-if="imageFailed" class="messages-image-placeholder" @click="load"><MessageIcon name="image" /><span>图片暂时无法显示</span><small>点击重新加载</small></button>
        <div v-else-if="activeRequest" class="messages-image-placeholder" role="status" aria-live="polite"><MessageIcon name="image" /><span>{{ progress }}</span></div>
        <button v-else-if="available" class="messages-image-placeholder" @click="load"><MessageIcon name="image" /><span>{{ error ? '重试加载图片' : '图片' }}</span></button>
        <div v-else class="messages-image-placeholder messages-media-unavailable"><MessageIcon name="image" /><span>图片描述</span><small>开启画图后自动加载</small></div>
        <p v-if="description" class="messages-image-caption">{{ description }}</p>
        <small v-if="error" class="messages-media-error" role="status">{{ error }}</small>
        <AppDialog v-if="viewerOpen" class="messages-image-viewer" aria-label="查看图片" @close="viewerOpen = false"><button aria-label="关闭图片" @click="viewerOpen = false"><MessageIcon name="close" /></button><img v-if="source" :src="source" :alt="description || attachment?.name || '图片'"></AppDialog>
    </div>
</template>
