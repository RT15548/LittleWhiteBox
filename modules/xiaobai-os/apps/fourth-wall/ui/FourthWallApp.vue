<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, toRaw } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import FourthWallConversation from './FourthWallConversation.vue';
import FourthWallPromptEditor from './FourthWallPromptEditor.vue';
import FourthWallSettings from './FourthWallSettings.vue';
import type {
    FourthWallChatState,
    FourthWallClientState,
    FourthWallGenerationState,
    FourthWallGlobalSettings,
} from '../types.js';
import './fourth-wall.css';

const PERSISTENT_REQUEST_TIMEOUT_MS = 35_000;

const props = defineProps<XiaobaiOsAppProps>();
const state = ref(structuredClone(toRaw(props.initialState as FourthWallClientState)));
const draft = ref('');
const settingsOpen = ref(false);
const promptOpen = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const composing = ref(false);
const generation = ref<FourthWallGenerationState>({
    status: 'idle',
    sessionId: '',
    text: '',
    thinking: '',
    message: '',
    unsaved: false,
});
let unsubscribe = () => {};

const activeSession = computed(() => state.value.chat.sessions.find(session => session.id === state.value.chat.activeSessionId)!);
const isGenerating = computed(() => generation.value.status === 'started' || generation.value.status === 'progress');

function binding(sessionId = activeSession.value.id): { chatIdentity: string; sessionId: string } {
    return { chatIdentity: state.value.chatIdentity, sessionId };
}

function unwrapState(response: unknown): FourthWallClientState {
    return structuredClone((response as { result: FourthWallClientState }).result);
}

async function requestState(type: string, payload: object): Promise<void> {
    saving.value = true;
    errorMessage.value = '';
    try {
        state.value = unwrapState(await props.bridge.request(type, payload, PERSISTENT_REQUEST_TIMEOUT_MS));
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : String(error);
    } finally {
        saving.value = false;
    }
}

async function send(): Promise<void> {
    const content = draft.value.trim();
    if (!content || isGenerating.value || saving.value) {
        return;
    }
    draft.value = '';
    generation.value = { status: 'started', sessionId: activeSession.value.id, text: '', thinking: '', message: '', unsaved: false };
    await requestState('fourth-wall/send', { ...binding(), content });
    if (errorMessage.value) {
        generation.value.status = 'idle';
    }
}

async function regenerate(): Promise<void> {
    if (isGenerating.value || saving.value) {
        return;
    }
    generation.value = { status: 'started', sessionId: activeSession.value.id, text: '', thinking: '', message: '', unsaved: false };
    await requestState('fourth-wall/regenerate', binding());
    if (errorMessage.value) {
        generation.value.status = 'idle';
    }
}

function cancel(): void {
    props.bridge.post('fourth-wall/cancel', binding());
}

function handleComposerKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.shiftKey || composing.value) {
        return;
    }
    event.preventDefault();
    if (isGenerating.value) {
        cancel();
    } else {
        void send();
    }
}

function confirmDelete(index: number): void {
    if (window.confirm('确定删除这条消息吗？')) {
        void requestState('fourth-wall/delete-message', { ...binding(), messageIndex: index });
    }
}

function confirmClear(): void {
    if (window.confirm('确定清空当前记录吗？')) {
        void requestState('fourth-wall/clear-history', binding());
    }
}

function updateChat(patch: FourthWallChatState['settings']): void {
    void requestState('fourth-wall/update-chat-settings', { ...binding(), patch });
}

function updateGlobal(patch: Partial<FourthWallGlobalSettings>): void {
    void requestState('fourth-wall/update-global-settings', { ...binding(), patch });
}

onMounted(() => {
    unsubscribe = props.bridge.subscribe((message) => {
        if (message.type === 'fourth-wall/state') {
            state.value = structuredClone((message.payload as { state: FourthWallClientState }).state);
        }
        if (message.type !== 'fourth-wall/generation') {
            return;
        }
        const payload = message.payload as {
            status?: FourthWallGenerationState['status'] | 'complete' | 'cancelled';
            sessionId?: string;
            text?: string;
            thinking?: string;
            message?: string;
            kind?: string;
            draft?: { text?: string; thinking?: string };
        };
        if (payload.sessionId && payload.sessionId !== activeSession.value.id) {
            return;
        }
        if (payload.status === 'complete' || payload.status === 'cancelled') {
            generation.value = { status: 'idle', sessionId: '', text: '', thinking: '', message: '', unsaved: false };
            return;
        }
        if (payload.status === 'error') {
            errorMessage.value = payload.message || '生成失败';
            const hasUnsavedDraft = payload.kind === 'save'
                && !!(payload.draft?.text || payload.draft?.thinking);
            generation.value = hasUnsavedDraft
                ? {
                    status: 'error',
                    sessionId: payload.sessionId || activeSession.value.id,
                    text: payload.draft?.text || '',
                    thinking: payload.draft?.thinking || '',
                    message: '',
                    unsaved: true,
                }
                : { status: 'idle', sessionId: '', text: '', thinking: '', message: '', unsaved: false };
            return;
        }
        generation.value = {
            status: payload.status || 'progress',
            sessionId: payload.sessionId || activeSession.value.id,
            text: payload.text || generation.value.text,
            thinking: payload.thinking || generation.value.thinking,
            message: '',
            unsaved: false,
        };
    });
});

onBeforeUnmount(() => unsubscribe());
</script>

<template>
    <main class="fourth-wall-app">
        <header class="fourth-wall-header">
            <div class="fourth-wall-heading"><span>IV</span><div><strong>四次元壁</strong><small>{{ activeSession.name }}</small></div></div>
            <div class="fourth-wall-header-actions">
                <button type="button" title="清空当前记录" aria-label="清空当前记录" :disabled="saving" @click="confirmClear">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" />
                    </svg>
                </button>
                <button type="button" title="设置" @click="settingsOpen = true">⚙</button>
            </div>
        </header>
        <div v-if="errorMessage" class="fourth-wall-error" role="alert">
            <span>{{ errorMessage }}</span><button type="button" @click="errorMessage = ''">×</button>
        </div>
        <FourthWallConversation
            :history="activeSession.history"
            :session-id="activeSession.id"
            :chat-identity="state.chatIdentity"
            :user-avatar="state.userAvatar"
            :character-avatar="state.characterAvatar"
            :image-available="state.capabilities.image.available"
            :voice-available="state.capabilities.voice.available"
            :generation="generation"
            :bridge="bridge"
            @edit="(index, content) => requestState('fourth-wall/edit-message', { ...binding(), messageIndex: index, content })"
            @delete="confirmDelete"
        />
        <footer class="fourth-wall-composer">
            <button
                type="button"
                class="fourth-wall-regenerate"
                title="重答"
                aria-label="重答"
                :disabled="saving || isGenerating"
                @click="regenerate"
            >
                ↻
            </button>
            <textarea
                v-model="draft"
                rows="1"
                placeholder="聊点什么..."
                :disabled="saving"
                @compositionstart="composing = true"
                @compositionend="composing = false"
                @keydown="handleComposerKeydown"
            />
            <button type="button" :class="{ 'is-stop': isGenerating }" :disabled="saving" @click="isGenerating ? cancel() : send()">
                {{ isGenerating ? '■' : '↑' }}
            </button>
        </footer>
        <FourthWallSettings
            v-if="settingsOpen"
            :chat="state.chat"
            :global="state.global"
            :busy="saving || isGenerating"
            @close="settingsOpen = false"
            @update-chat="updateChat"
            @update-global="updateGlobal"
            @switch-session="sessionId => requestState('fourth-wall/switch-session', { ...binding(), targetSessionId: sessionId })"
            @add-session="name => requestState('fourth-wall/add-session', { ...binding(), name })"
            @rename-session="(sessionId, name) => requestState('fourth-wall/rename-session', { ...binding(sessionId), name })"
            @delete-session="sessionId => requestState('fourth-wall/delete-session', binding(sessionId))"
            @open-prompts="promptOpen = true"
        />
        <FourthWallPromptEditor
            v-if="promptOpen"
            :templates="state.global.promptTemplates"
            @close="promptOpen = false"
            @save="templates => { updateGlobal({ promptTemplates: templates }); promptOpen = false; }"
            @restore="() => { requestState('fourth-wall/restore-prompts', binding()); promptOpen = false; }"
        />
    </main>
</template>
