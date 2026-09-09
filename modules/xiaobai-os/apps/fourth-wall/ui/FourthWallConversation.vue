<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import type { XiaobaiOsFrameBridge } from '../../../shell/app-src/frame-bridge.js';
import FourthWallMessage from './FourthWallMessage.vue';
import type { FourthWallGenerationState, FourthWallHistoryPage, FourthWallTaskPhase } from '../types.js';
import { HISTORY_WINDOW_LIMIT } from '../domain/context-policy.js';

const props = defineProps<{
    page: FourthWallHistoryPage;
    busy: boolean;
    sessionId: string;
    chatIdentity: string;
    userAvatar: string;
    characterAvatar: string;
    imageAvailable: boolean;
    voiceAvailable: boolean;
    generation: FourthWallGenerationState;
    bridge: XiaobaiOsFrameBridge;
}>();
const emit = defineEmits<{
    edit: [messageIndex: number, content: string, revision: number];
    delete: [messageIndex: number];
    error: [message: string];
}>();
const viewport = ref<HTMLElement | null>(null);
const page = ref(props.page);
const loading = ref(false);
const followLatest = ref(true);
const editing = ref<{ index: number; content: string; original: string; ts: number; revision: number } | null>(null);
let pageSequence = 0;
const phaseLabels: Record<FourthWallTaskPhase, string> = {
    counting: '正在计算上下文…', summarizing: '正在整理皮下记忆…', saving: '正在保存…', replying: '等待回应…',
};

function anchor() {
    const root = viewport.value;
    if (!root) { return null; }
    const top = root.getBoundingClientRect().top;
    const row = Array.from(root.querySelectorAll<HTMLElement>('[data-message-index]'))
        .find(item => item.getBoundingClientRect().bottom > top);
    return row ? { index: row.dataset.messageIndex, offset: row.getBoundingClientRect().top - top } : null;
}
async function install(next: FourthWallHistoryPage, latest = false) {
    const saved = anchor();
    if (editing.value && next.sessionId === page.value.sessionId) {
        const message = next.messages[editing.value.index - next.start];
        if (message?.ts === editing.value.ts && message.content === editing.value.content.trim()) { editing.value = null; }
        else if (message?.ts === editing.value.ts && message.content === editing.value.original) { editing.value.revision = next.revision; }
        else if (message) {
            emit('error', `正在编辑的消息已变化，未保存的草稿：${editing.value.content}`);
            editing.value = null;
        }
    }
    page.value = next;
    await nextTick();
    const root = viewport.value;
    if (!root) { return; }
    if (latest) { root.scrollTop = root.scrollHeight; followLatest.value = true; return; }
    if (saved) {
        const row = root.querySelector<HTMLElement>('[data-message-index="' + saved.index + '"]');
        if (row) { root.scrollTop += row.getBoundingClientRect().top - root.getBoundingClientRect().top - saved.offset; }
    }
}
function onScroll() {
    const root = viewport.value;
    if (root) { followLatest.value = page.value.start + page.value.messages.length === page.value.total
        && root.scrollHeight - root.clientHeight - root.scrollTop < 48; }
}
async function load(direction: 'earlier' | 'later' | 'latest') {
    if (loading.value) { return; }
    const sequence = ++pageSequence;
    loading.value = true;
    const owner = props.sessionId;
    try {
        const response = await props.bridge.request('fourth-wall/history-page', {
            chatIdentity: props.chatIdentity, sessionId: owner, direction, revision: page.value.revision,
        });
        if (sequence !== pageSequence || owner !== props.sessionId) { return; }
        if (direction !== 'latest') { followLatest.value = false; }
        const next = (response as { result: FourthWallHistoryPage }).result;
        if (direction === 'earlier') {
            next.messages = [...next.messages, ...page.value.messages].slice(0, HISTORY_WINDOW_LIMIT);
        } else if (direction === 'later') {
            const combined = [...page.value.messages, ...next.messages];
            next.start = page.value.start + Math.max(0, combined.length - HISTORY_WINDOW_LIMIT);
            next.messages = combined.slice(-HISTORY_WINDOW_LIMIT);
        }
        await install(next, direction === 'latest');
    } catch (error) {
        if (sequence === pageSequence) { emit('error', error instanceof Error ? error.message : String(error)); }
    } finally { if (sequence === pageSequence) { loading.value = false; } }
}
function setDraft(index: number, content: string) {
    const message = page.value.messages[index - page.value.start];
    if (!message) { return; }
    if (editing.value?.index === index) { editing.value.content = content; }
    else { editing.value = { index, content, original: message.content, ts: message.ts, revision: page.value.revision }; }
}
watch(() => props.page, next => {
    pageSequence++;
    loading.value = false;
    void install(next, next.sessionId !== page.value.sessionId || followLatest.value);
}, { immediate: true });
watch(() => props.sessionId, () => { editing.value = null; followLatest.value = true; });
watch(() => props.generation.text, async () => {
    if (!followLatest.value) { return; }
    await nextTick();
    if (viewport.value) { viewport.value.scrollTop = viewport.value.scrollHeight; }
});
</script>

<template>
    <section ref="viewport" class="fourth-wall-conversation" aria-live="polite" @scroll.passive="onScroll">
        <button v-if="page.start > 0" type="button" class="fourth-wall-earlier" :disabled="loading" @click="load('earlier')">
            {{ loading ? '读取中…' : '查看更早的记录' }}
        </button>
        <div v-if="page.total === 0 && generation.status === 'idle'" class="fourth-wall-empty">
            <span>IV</span><strong>越过故事边界</strong><p>这里是你与角色扮演者的皮下私聊。</p>
        </div>
        <FourthWallMessage
            v-for="(message, offset) in page.messages"
            :key="message.ts + '-' + (page.start + offset)"
            :message="message" :message-index="page.start + offset"
            :chat-identity="chatIdentity" :session-id="sessionId"
            :user-avatar="userAvatar" :character-avatar="characterAvatar"
            :image-available="imageAvailable" :voice-available="voiceAvailable"
            :bridge="bridge" :editable="!busy"
            :edit-draft="editing?.index === page.start + offset && editing.ts === message.ts ? editing.content : undefined"
            @draft="content => setDraft(page.start + offset, content)"
            @edit-cancel="editing = null"
            @edit="(index, content) => emit('edit', index, content, editing?.revision ?? page.revision)"
            @delete="index => emit('delete', index)"
        />
        <button v-if="page.start + page.messages.length < page.total" type="button" class="fourth-wall-earlier" :disabled="loading" @click="load('later')">
            查看后面的记录
        </button>
        <article v-if="generation.status !== 'idle' && followLatest" class="fourth-wall-message is-ai is-streaming" role="status">
            <img v-if="characterAvatar" class="fourth-wall-avatar" :src="characterAvatar" alt="">
            <span v-else class="fourth-wall-avatar is-placeholder" />
            <div class="fourth-wall-message-stack">
                <details v-if="generation.thinking" class="fourth-wall-thinking" open>
                    <summary>思考中</summary><div>{{ generation.thinking }}</div>
                </details>
                <div class="fourth-wall-bubble">
                    {{ generation.text || (generation.status === 'error' ? generation.message : phaseLabels[generation.phase || 'replying']) }}
                    <small v-if="generation.unsaved" class="fourth-wall-unsaved">未保存</small>
                </div>
            </div>
        </article>
        <button v-if="!followLatest" type="button" class="fourth-wall-latest" :disabled="loading" @click="load('latest')">回到最新 ↓</button>
    </section>
</template>
