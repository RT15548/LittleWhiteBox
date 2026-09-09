<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue';
import { estimateTokenCount } from '../../../../agent-core/runtime/context-tokens.js';
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';
import FourthWallContextButton from './FourthWallContextButton.vue';
import FourthWallMemory from './FourthWallMemory.vue';
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
const clearOpen = ref(false);
const clearMemory = ref(false);
const memoryOpen = ref(false);
const memoryContent = ref('');
const memoryRevision = ref(0);
const retryAvailable = ref(false);
const previewTokens = ref(0);
let previewTimer: ReturnType<typeof setTimeout> | undefined;
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
const contextStats = computed(() => ({ ...state.value.context,
    usedTokens: state.value.context.usedTokens + previewTokens.value,
    promptTokens: state.value.context.promptTokens + previewTokens.value,
}));
watch(() => [draft.value, generation.value.text], () => {
    if (previewTimer) { return; }
    previewTimer = setTimeout(() => {
        previewTokens.value = estimateTokenCount(draft.value) + estimateTokenCount(generation.value.text);
        previewTimer = undefined;
    }, 200);
});
watch(() => activeSession.value.id, () => {
    memoryOpen.value = false; clearOpen.value = false; retryAvailable.value = false;
    draft.value = ''; generation.value = { status: 'idle', sessionId: '', text: '', thinking: '', message: '', unsaved: false };
});

function binding(sessionId = activeSession.value.id): { chatIdentity: string; sessionId: string } {
    return { chatIdentity: state.value.chatIdentity, sessionId };
}

function unwrapState(response: unknown): FourthWallClientState {
    return structuredClone((response as { result: FourthWallClientState }).result);
}

async function requestState(type: string, payload: object): Promise<boolean> {
    saving.value = true;
    errorMessage.value = '';
    try {
        state.value = unwrapState(await props.bridge.request(type, payload, PERSISTENT_REQUEST_TIMEOUT_MS));
        return true;
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : String(error);
        return false;
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
    errorMessage.value = '';
    retryAvailable.value = false;
    generation.value = { status: 'started', sessionId: activeSession.value.id, text: '', thinking: '', message: '', unsaved: false };
    try { await props.bridge.request('fourth-wall/send', { ...binding(), content }, PERSISTENT_REQUEST_TIMEOUT_MS); }
    catch (error) {
        errorMessage.value = `发送请求未确认：${error instanceof Error ? error.message : String(error)}。请核对聊天记录后再发送。原输入：${content}`;
        generation.value.status = 'idle';
    }
}

async function regenerate(): Promise<void> {
    if (isGenerating.value || saving.value) {
        return;
    }
    errorMessage.value = '';
    retryAvailable.value = false;
    generation.value = { status: 'started', sessionId: activeSession.value.id, text: '', thinking: '', message: '', unsaved: false };
    try { await props.bridge.request('fourth-wall/regenerate', binding(), PERSISTENT_REQUEST_TIMEOUT_MS); }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : String(error);
        generation.value.status = 'idle';
    }
}

function cancel(): void {
    props.bridge.post('fourth-wall/cancel', binding());
}

function recoverInput(content?: string): void {
    if (!content) { return; }
    if (!draft.value) { draft.value = content; }
    else { errorMessage.value += `\n未保存的原输入：${content}`; }
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
    const hint = index < activeSession.value.archivedCount ? '这条消息已经归档；删除原文不会修改记忆，需要遗忘的内容请在记忆中删除。\n' : '';
    if (window.confirm(`${hint}确定删除这条消息吗？`)) {
        void requestState('fourth-wall/delete-message', { ...binding(), revision: state.value.history.revision, messageIndex: index });
    }
}

function confirmClear(): void {
    clearMemory.value = false;
    clearOpen.value = true;
}

async function clearHistory(): Promise<void> {
    if (await requestState('fourth-wall/clear-history', { ...binding(), clearMemory: clearMemory.value })) { clearOpen.value = false; }
}

async function editMessage(index: number, content: string, revision: number): Promise<void> {
    if (index < activeSession.value.archivedCount && !window.confirm('这条消息已经归档，修改原文不会改写记忆；需要同步更正时请编辑记忆。继续修改？')) { return; }
    await requestState('fourth-wall/edit-message', { ...binding(), revision, messageIndex: index, content });
}

async function startTask(action: 'summarize' | 'retry'): Promise<void> {
    if (isGenerating.value || saving.value) { return; }
    errorMessage.value = '';
    retryAvailable.value = false;
    generation.value = { status: 'started', sessionId: activeSession.value.id, text: '', thinking: '', message: '', unsaved: false,
        phase: 'counting', manual: action === 'summarize' };
    try { await props.bridge.request(`fourth-wall/${action}`, binding(), PERSISTENT_REQUEST_TIMEOUT_MS); }
    catch (error) { generation.value.status = 'idle'; errorMessage.value = String(error instanceof Error ? error.message : error); }
}

async function openMemory(): Promise<void> {
    if (saving.value || isGenerating.value) { return; }
    saving.value = true;
    errorMessage.value = '';
    const owner = binding();
    const revision = state.value.history.revision;
    try {
        const response = await props.bridge.request('fourth-wall/read-memory', { ...owner, revision });
        if (owner.sessionId !== activeSession.value.id || owner.chatIdentity !== state.value.chatIdentity) { return; }
        memoryContent.value = (response as { result: { content: string } }).result.content;
        memoryRevision.value = revision;
        memoryOpen.value = true;
    } catch (error) { errorMessage.value = error instanceof Error ? error.message : String(error); }
    finally { saving.value = false; }
}

async function saveMemory(content: string): Promise<void> {
    if (await requestState('fourth-wall/save-memory', { ...binding(), revision: memoryRevision.value, expectedContent: memoryContent.value, content })) { memoryOpen.value = false; }
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
            inputDraft?: string;
            draft?: { text?: string; thinking?: string };
            phase?: FourthWallGenerationState['phase'];
            manual?: boolean;
        };
        if (payload.sessionId && payload.sessionId !== activeSession.value.id) {
            return;
        }
        if (payload.status === 'complete' || payload.status === 'cancelled') {
            if (payload.status === 'cancelled') {
                if (payload.message) { errorMessage.value = payload.message; }
                recoverInput(payload.inputDraft);
            }
            previewTokens.value = estimateTokenCount(draft.value);
            generation.value = { status: 'idle', sessionId: '', text: '', thinking: '', message: '', unsaved: false };
            return;
        }
        if (payload.status === 'error') {
            errorMessage.value = payload.message || '生成失败';
            retryAvailable.value = !payload.manual && payload.kind !== 'save' && payload.kind !== 'input-save';
            recoverInput(payload.inputDraft);
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
            phase: payload.phase || generation.value.phase,
            manual: payload.manual ?? generation.value.manual,
        };
    });
});

onBeforeUnmount(() => { unsubscribe(); clearTimeout(previewTimer); });
</script>

<template>
    <main class="fourth-wall-app">
        <header class="fourth-wall-header">
            <div class="fourth-wall-heading"><span>IV</span><div><strong>四次元壁</strong><small>{{ activeSession.name }}</small></div></div>
            <div class="fourth-wall-header-actions">
                <FourthWallContextButton
                    :stats="contextStats" :busy="isGenerating" :phase="generation.phase"
                    @summarize="startTask('summarize')" @cancel="cancel"
                />
                <button type="button" title="皮下记忆" aria-label="皮下记忆" :disabled="saving || isGenerating" @click="openMemory">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c-3-2-7-2-9-1v15c3-1 6-1 9 1m0-15c3-2 7-2 9-1v15c-3-1-6-1-9 1V5Z" /></svg>
                </button>
                <button type="button" title="清空当前记录" aria-label="清空当前记录" :disabled="saving" @click="confirmClear">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" />
                    </svg>
                </button>
                <button type="button" title="设置" @click="settingsOpen = true">⚙</button>
            </div>
        </header>
        <div v-if="errorMessage" class="fourth-wall-error" role="alert">
            <span>{{ errorMessage }}</span><button v-if="retryAvailable" type="button" :disabled="isGenerating || saving" @click="startTask('retry')">重试回复</button>
            <button type="button" aria-label="关闭错误提示" @click="errorMessage = ''">×</button>
        </div>
        <FourthWallConversation
            :page="state.history"
            :busy="saving || isGenerating"
            :session-id="activeSession.id"
            :chat-identity="state.chatIdentity"
            :user-avatar="state.userAvatar"
            :character-avatar="state.characterAvatar"
            :image-available="state.capabilities.image.available"
            :voice-available="state.capabilities.voice.available"
            :generation="generation"
            :bridge="bridge"
            @edit="editMessage"
            @delete="confirmDelete"
            @error="message => errorMessage = message"
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
        <FourthWallMemory
            v-if="memoryOpen" :content="memoryContent" :busy="saving" :error="errorMessage"
            @close="memoryOpen = false" @save="saveMemory"
        />
        <AppDialog v-if="clearOpen" class="fourth-wall-dialog" aria-label="清空皮下聊天" :busy="saving" @close="clearOpen = false">
            <header><strong>清空皮下聊天？</strong></header>
            <p>当前聊天原文将被删除，默认保留皮下记忆。</p>
            <label class="fourth-wall-clear-choice"><input v-model="clearMemory" type="checkbox">同时清空皮下记忆</label>
            <p v-if="errorMessage" class="fourth-wall-dialog-error" role="alert">{{ errorMessage }}</p>
            <footer>
                <button type="button" :disabled="saving" @click="clearOpen = false">取消</button>
                <button type="button" class="is-danger" :disabled="saving" @click="clearHistory">清空聊天</button>
            </footer>
        </AppDialog>
    </main>
</template>
