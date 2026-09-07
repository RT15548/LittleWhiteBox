<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import type { XiaobaiOsFrameBridge } from '../../../shell/app-src/frame-bridge.js';
import type { FourthWallMessageData } from '../types.js';

interface Segment {
    kind: 'text' | 'image' | 'voice';
    raw: string;
    value: string;
    emotion?: string;
}

interface MediaState {
    status: 'idle' | 'loading' | 'ready' | 'playing' | 'error' | 'unavailable';
    source?: string;
    message?: string;
    requestId?: string;
}

const props = defineProps<{
    message: FourthWallMessageData;
    messageIndex: number;
    chatIdentity: string;
    sessionId: string;
    userAvatar: string;
    characterAvatar: string;
    imageAvailable: boolean;
    voiceAvailable: boolean;
    bridge: XiaobaiOsFrameBridge;
}>();

const emit = defineEmits<{
    edit: [messageIndex: number, content: string];
    delete: [messageIndex: number];
}>();

const editing = ref(false);
useAppBack(() => { editing.value = false; return true; }, () => editing.value);
const draft = ref('');
const media = reactive<Record<number, MediaState>>({});
const activeMediaIds = new Set<string>();
let unsubscribe = () => {};

function parseContent(content: string): Segment[] {
    const expression = /\[(?:img|图片)\s*:\s*([^\]]+)\]|\[(?:voice|语音)\s*:([^:\]]*):([^\]]+)\]|\[(?:voice|语音)\s*:\s*([^\]]+)\]/gi;
    const result: Segment[] = [];
    let cursor = 0;
    let match: RegExpExecArray | null;
    while ((match = expression.exec(content)) !== null) {
        if (match.index > cursor) {
            result.push({ kind: 'text', raw: content.slice(cursor, match.index), value: content.slice(cursor, match.index) });
        }
        if (match[1] !== undefined) {
            result.push({ kind: 'image', raw: match[0], value: match[1].trim() });
        } else {
            result.push({
                kind: 'voice',
                raw: match[0],
                value: String(match[3] ?? match[4] ?? '').trim(),
                emotion: String(match[2] || '').trim().toLowerCase(),
            });
        }
        cursor = expression.lastIndex;
    }
    if (cursor < content.length) {
        result.push({ kind: 'text', raw: content.slice(cursor), value: content.slice(cursor) });
    }
    return result.length ? result : [{ kind: 'text', raw: content, value: content }];
}

const segments = computed(() => parseContent(props.message.content));
const displayTime = computed(() => {
    if (!props.message.ts) {
        return '';
    }
    return new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(props.message.ts);
});

function createMediaId(kind: string, index: number): string {
    return `fw-${kind}-${Date.now()}-${props.messageIndex}-${index}-${Math.random().toString(36).slice(2, 7)}`;
}

function unwrap<T>(response: unknown): T {
    return (response as { result: T }).result;
}

function isCurrentMedia(index: number, requestId: string): boolean {
    return activeMediaIds.has(requestId) && media[index]?.requestId === requestId;
}

async function loadImage(segment: Segment, index: number): Promise<void> {
    if (media[index]?.status === 'loading' || media[index]?.status === 'ready') {
        return;
    }
    if (!props.imageAvailable) {
        media[index] = { status: 'unavailable', message: '画图能力未启用' };
        return;
    }
    const mediaRequestId = createMediaId('image', index);
    activeMediaIds.add(mediaRequestId);
    media[index] = { status: 'loading', message: '查询图片缓存', requestId: mediaRequestId };
    const binding = { chatIdentity: props.chatIdentity, sessionId: props.sessionId };
    try {
        const checked = unwrap<{ available: boolean; cached?: string | null }>(await props.bridge.request(
            'fourth-wall/image-check',
            { ...binding, tags: segment.value, mediaRequestId },
            30_000,
        ));
        if (!isCurrentMedia(index, mediaRequestId)) {
            return;
        }
        if (!checked.available) {
            media[index] = { status: 'unavailable', message: '画图能力未启用', requestId: mediaRequestId };
            return;
        }
        let source = checked.cached || '';
        if (!source) {
            media[index] = { status: 'loading', message: '正在生成图片', requestId: mediaRequestId };
            const generated = unwrap<{ base64: string }>(await props.bridge.request(
                'fourth-wall/image-generate',
                { ...binding, tags: segment.value, mediaRequestId },
                180_000,
            ));
            if (!isCurrentMedia(index, mediaRequestId)) {
                return;
            }
            source = generated.base64;
        }
        media[index] = {
            status: 'ready',
            source: /^(?:data:|blob:|https?:)/i.test(source) ? source : `data:image/png;base64,${source}`,
        };
    } catch (error) {
        if (isCurrentMedia(index, mediaRequestId)) {
            media[index] = {
                status: 'error',
                message: error instanceof Error ? error.message : String(error),
                requestId: mediaRequestId,
            };
        }
    } finally {
        activeMediaIds.delete(mediaRequestId);
    }
}

async function playVoice(segment: Segment, index: number): Promise<void> {
    if (!props.voiceAvailable) {
        media[index] = { status: 'unavailable', message: 'TTS 能力未启用' };
        return;
    }
    const current = media[index];
    if (current?.status === 'loading') {
        return;
    }
    if (current?.status === 'playing' && current.requestId) {
        props.bridge.post('fourth-wall/voice-stop', {
            chatIdentity: props.chatIdentity,
            mediaRequestId: current.requestId,
        });
        media[index] = { status: 'idle' };
        return;
    }
    const mediaRequestId = createMediaId('voice', index);
    activeMediaIds.add(mediaRequestId);
    media[index] = { status: 'loading', message: '正在准备语音', requestId: mediaRequestId };
    try {
        await props.bridge.request('fourth-wall/voice-play', {
            chatIdentity: props.chatIdentity,
            sessionId: props.sessionId,
            mediaRequestId,
            text: segment.value,
            emotion: segment.emotion,
        });
    } catch (error) {
        if (isCurrentMedia(index, mediaRequestId)) {
            media[index] = {
                status: 'error',
                message: error instanceof Error ? error.message : String(error),
                requestId: mediaRequestId,
            };
        }
        activeMediaIds.delete(mediaRequestId);
    }
}

function beginEdit(): void {
    draft.value = props.message.content;
    editing.value = true;
}

function saveEdit(): void {
    const content = draft.value.trim();
    if (!content) {
        return;
    }
    emit('edit', props.messageIndex, content);
    editing.value = false;
}

function cancelMedia(): void {
    activeMediaIds.forEach((mediaRequestId) => {
        props.bridge.post('fourth-wall/image-cancel', { chatIdentity: props.chatIdentity, mediaRequestId });
        props.bridge.post('fourth-wall/voice-stop', { chatIdentity: props.chatIdentity, mediaRequestId });
    });
    activeMediaIds.clear();
}

function hydrateImages(): void {
    segments.value.forEach((segment, index) => {
        if (segment.kind === 'image') {
            void loadImage(segment, index);
        }
    });
}

onMounted(() => {
    unsubscribe = props.bridge.subscribe((message) => {
        if (message.type === 'fourth-wall/image-progress') {
            const payload = message.payload as { mediaRequestId?: string; status?: string; position?: number };
            const index = Object.keys(media).map(Number).find(key => media[key]?.requestId === payload.mediaRequestId);
            if (index !== undefined) {
                media[index].message = payload.status === 'queued'
                    ? `图片队列第 ${payload.position || 1} 位`
                    : '正在生成图片';
            }
        }
        if (message.type === 'fourth-wall/voice-state') {
            const payload = message.payload as { requestId?: string; state?: string; message?: string };
            const index = Object.keys(media).map(Number).find(key => media[key]?.requestId === payload.requestId);
            if (index === undefined) {
                return;
            }
            if (payload.state === 'playing') {
                media[index].status = 'playing';
            }
            if (payload.state === 'ended' || payload.state === 'stopped') {
                activeMediaIds.delete(String(payload.requestId || ''));
                media[index] = { status: 'idle' };
            }
            if (payload.state === 'error') {
                activeMediaIds.delete(String(payload.requestId || ''));
                media[index] = { status: 'error', message: payload.message || '语音播放失败' };
            }
        }
    });
    hydrateImages();
});

watch(() => props.message.content, () => {
    cancelMedia();
    Object.keys(media).forEach(key => delete media[Number(key)]);
    hydrateImages();
});

onBeforeUnmount(() => {
    unsubscribe();
    cancelMedia();
});
</script>

<template>
    <article class="fourth-wall-message" :class="message.role === 'user' ? 'is-user' : 'is-ai'">
        <img
            v-if="message.role === 'user' ? userAvatar : characterAvatar"
            class="fourth-wall-avatar"
            :src="message.role === 'user' ? userAvatar : characterAvatar"
            alt=""
        >
        <span v-else class="fourth-wall-avatar is-placeholder" aria-hidden="true" />
        <div class="fourth-wall-message-stack">
            <details v-if="message.thinking" class="fourth-wall-thinking">
                <summary>思考过程</summary>
                <div>{{ message.thinking }}</div>
            </details>
            <div class="fourth-wall-bubble">
                <textarea v-if="editing" v-model="draft" class="fourth-wall-edit" rows="3" />
                <template v-else>
                    <template v-for="(segment, index) in segments" :key="`${segment.kind}-${index}`">
                        <span v-if="segment.kind === 'text'" class="fourth-wall-message-text">{{ segment.value }}</span>
                        <figure v-else-if="segment.kind === 'image'" class="fourth-wall-image-card">
                            <img v-if="media[index]?.status === 'ready'" :src="media[index].source" :alt="segment.value">
                            <button v-else-if="media[index]?.status === 'error'" type="button" @click="loadImage(segment, index)">
                                {{ segment.raw }}<small>{{ media[index].message }}，点此重试</small>
                            </button>
                            <div v-else-if="media[index]?.status === 'unavailable'">
                                {{ segment.raw }}<small>{{ media[index].message }}</small>
                            </div>
                            <div v-else>{{ segment.raw }}<small>{{ media[index]?.message || '准备图片' }}</small></div>
                        </figure>
                        <button v-else class="fourth-wall-voice" type="button" @click="playVoice(segment, index)">
                            <span aria-hidden="true">{{ media[index]?.status === 'playing' ? '■' : '▶' }}</span>
                            <span>{{ segment.value }}</span>
                            <small v-if="media[index]?.message">{{ media[index].message }}</small>
                        </button>
                    </template>
                </template>
                <div class="fourth-wall-message-actions">
                    <template v-if="editing">
                        <button type="button" @click="saveEdit">保存</button>
                        <button type="button" @click="editing = false">取消</button>
                    </template>
                    <template v-else>
                        <button type="button" @click="beginEdit">编辑</button>
                        <button type="button" @click="emit('delete', messageIndex)">删除</button>
                    </template>
                </div>
            </div>
            <time v-if="displayTime">{{ displayTime }}</time>
        </div>
    </article>
</template>
