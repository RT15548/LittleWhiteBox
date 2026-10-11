<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, toRaw, watch } from 'vue';
import { estimateTokenCount } from '../../../../agent-core/runtime/context-tokens.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';
import MessageMarkdown from '../../../shell/app-src/components/MessageMarkdown.vue';
import type { AdministratorPage, AdministratorRow, AdministratorState } from '../domain/types.js';
import { ADMINISTRATOR_IMAGE_TYPES, ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';
import type { AdministratorUpload } from '../storage/images.js';
import { createAdministratorId } from '../application/identity.js';
import { ADMINISTRATOR_COPY as C, administratorError } from './copy.js';
import AdministratorContext from './AdministratorContext.vue';
import AdministratorMessage from './AdministratorMessage.vue';
import AdministratorStatus from './AdministratorStatus.vue';
import AdministratorDetails from './AdministratorDetails.vue';
import { shouldSendOnEnter } from '../../../shell/app-src/input/composer-keyboard.js';
import { useAdministratorWindow } from './conversation-window.js';
import './administrator.css';

const props = defineProps<XiaobaiOsAppProps>();
const state = shallowRef(structuredClone(toRaw(props.initialState as AdministratorState)));
const draft = ref(''), image = ref<AdministratorUpload | null>(null), error = ref(''), pending = ref('');
const clearOpen = ref(false), deleteRow = ref<AdministratorRow | null>(null), details = ref<string | null>(null);
const list = ref<HTMLElement | null>(null), file = ref<HTMLInputElement | null>(null), composer = ref<HTMLTextAreaElement | null>(null);
const composing = ref(false), draftTokens = ref(0);
let draftRevision = 0;
const sentInput = shallowRef<{ id: string; revision: number; text: string; image: AdministratorUpload | null } | null>(null);
let operation = 0;
watch([draft, image], () => { draftRevision++; }, { flush: 'sync' });
const busy = computed(() => !!pending.value || !!state.value.live);
const phase = computed(() => state.value.live?.phase ?? (['send', 'regenerate'].includes(pending.value) ? 'preparing' : null));
const disabled = computed(() => busy.value || state.value.unsaved || state.value.corrupted);
const { rows, hasOlder, hasNewer, expanded, pendingVisible, paging, pageError, atBottom, resetLatest, scrolled, older, newer } = useAdministratorWindow({
    state, pending: computed(() => !!sentInput.value), list,
    page: (start, revision) => request<AdministratorPage>('page', { start, revision }),
});
const liveInRows = computed(() => rows.value.some(row => row.role === 'assistant' && row.turnId === state.value.live?.turnId));
let unsubscribe = () => {};
let tokenTimer: ReturnType<typeof setTimeout> | undefined;
const binding = () => ({ chatIdentity: state.value.chatIdentity });
async function request<T>(type: string, payload: object = {}): Promise<T> {
    return (await props.bridge.request(`administrator/${type}`, { ...binding(), ...payload }, 60000) as { result: T }).result;
}
function apply(next: AdministratorState) {
    const previous = state.value;
    if (previous.chatIdentity === next.chatIdentity && next.page.revision < previous.page.revision) { return; }
    state.value = next;
    if (previous.chatIdentity !== next.chatIdentity) {
        operation++; pending.value = ''; error.value = ''; draft.value = ''; image.value = null; details.value = null; sentInput.value = null; return;
    }
    if (sentInput.value && next.submission?.id === sentInput.value.id && next.submission.accepted) { sentInput.value = null; }
}
function restoreInput() {
    const input = sentInput.value;
    if (input && input.revision === draftRevision) { draft.value = input.text; image.value = input.image; }
    sentInput.value = null;
}
function finishOperation(requestId: number) {
    if (requestId !== operation) { return; }
    pending.value = '';
    // Acceptance already removed sentInput. Only idle, settled rejections return it to the draft.
    if (!state.value.unsaved && !state.value.live) { restoreInput(); }
}
function jumpLatest() { resetLatest(); void nextTick(() => list.value?.focus({ preventScroll: true })); }
async function send() {
    if (disabled.value || !draft.value.trim() && !image.value) { return; }
    const input = { id: createAdministratorId(), revision: 0, text: draft.value, image: image.value && toRaw(image.value) };
    draft.value = ''; image.value = null; input.revision = draftRevision;
    sentInput.value = input; pending.value = 'send'; error.value = ''; resetLatest();
    const requestId = ++operation;
    try {
        const result = await request<{ turnId: string; state: AdministratorState }>('send', { submissionId: input.id, text: input.text, ...(input.image ? { image: input.image } : {}) });
        if (requestId === operation) { apply(result.state); }
    } catch (cause) { if (requestId === operation) { error.value = administratorError(cause); } }
    finally { finishOperation(requestId); }
}
async function action(type: string, payload: object = {}) {
    if (busy.value) { return; }
    pending.value = type; error.value = '';
    if (type === 'regenerate' || type === 'confirm') { resetLatest(); }
    const requestId = ++operation;
    try {
        const next = await request<AdministratorState>(type, payload);
        if (requestId !== operation) { return; }
        apply(next); clearOpen.value = false; deleteRow.value = null;
        if (type === 'clear') { draft.value = ''; image.value = null; sentInput.value = null; details.value = null; resetLatest(); }
    }
    catch (cause) { if (requestId === operation) { error.value = administratorError(cause); } }
    finally { finishOperation(requestId); }
}
async function editMessage(row: AdministratorRow, text: string) {
    if (disabled.value) { throw new Error('administrator_busy'); }
    pending.value = 'edit'; error.value = '';
    try { apply(await request<AdministratorState>('edit', { turnId: row.turnId, revision: row.revision, text })); }
    finally { pending.value = ''; }
}
async function chooseImage(event: Event) {
    const input = event.target as HTMLInputElement, selected = input.files?.[0]; input.value = '';
    if (!selected) { return; }
    error.value = '';
    if (selected.size > POLICY.maxImageBytes || !ADMINISTRATOR_IMAGE_TYPES.includes(selected.type)) { error.value = C.invalidImage; return; }
    try {
        const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error(C.invalidImage)); reader.readAsDataURL(selected); });
        const preview = new Image(); preview.src = dataUrl; await preview.decode();
        image.value = { name: selected.name.slice(0, 120), dataUrl }; composer.value?.focus();
    } catch { error.value = C.invalidImage; }
}
function keydown(event: KeyboardEvent) {
    if (!shouldSendOnEnter(event, composing.value)) { return; }
    event.preventDefault();
    if (!busy.value) { void send(); }
}
watch([draft, image], () => {
    if (tokenTimer) { clearTimeout(tokenTimer); }
    tokenTimer = setTimeout(() => { draftTokens.value = estimateTokenCount(draft.value) + (image.value ? POLICY.imageTokens : 0); }, 160);
});
onMounted(() => {
    unsubscribe = props.bridge.subscribe(message => {
        if (message.type === 'administrator/state') { apply((message.payload as { state: AdministratorState }).state); }
        if (message.type === 'administrator/live') {
            state.value = { ...state.value, ...(message.payload as Pick<AdministratorState, 'live' | 'context'>) };
        }
    });
});
onBeforeUnmount(() => { operation++; unsubscribe(); if (tokenTimer) { clearTimeout(tokenTimer); } });
</script>

<template>
    <div class="administrator-app" :class="{ 'has-details': !!details }">
        <header class="admin-header"><h1>{{ C.title }}</h1><AdministratorContext :usage="state.context" :draft-tokens="state.live ? 0 : draftTokens" /><button type="button" class="admin-icon-button" :title="C.clear" :aria-label="C.clear" :disabled="busy || state.unsaved" @click="clearOpen = true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7" /></svg></button></header>
        <div v-if="state.corrupted" class="admin-notice" role="alert">{{ C.corrupted }}<button type="button" :disabled="busy" @click="clearOpen = true">{{ C.clear }}</button></div>
        <div ref="list" class="admin-conversation" tabindex="-1" @scroll.passive="scrolled">
            <button v-if="hasOlder" type="button" class="admin-history-button" data-history="older" :disabled="paging" @click="older">{{ C.earlier }}</button>
            <p v-if="!rows.length && !sentInput && !phase && !state.corrupted" class="admin-empty">{{ C.empty }}</p>
            <AdministratorMessage
                v-for="row in rows" :key="row.id" :row="row" :live="row.role === 'assistant' && row.turnId === state.live?.turnId ? state.live : null" :bridge="bridge" :chat-identity="state.chatIdentity" :disabled="disabled"
                :unsaved-process="row.role === 'assistant' && row.turnId === state.unsavedProcess?.turnId ? state.unsavedProcess.rounds : null"
                :save-edit="editMessage"
                @delete="deleteRow = $event" @regenerate="action('regenerate', { turnId: $event.turnId })" @details="details = $event.turnId"
            />
            <article v-if="pendingVisible && sentInput" class="admin-message is-user admin-pending" data-row-id="pending" :aria-busy="!!pending || !!state.live">
                <div class="admin-bubble">
                    <img v-if="sentInput.image" :src="sentInput.image.dataUrl" :alt="sentInput.image.name" class="admin-message-image">
                    <MessageMarkdown v-if="sentInput.text" class="admin-markdown" :text="sentInput.text" />
                </div>
            </article>
            <div v-if="phase && !hasNewer && !liveInRows" class="admin-live">
                <AdministratorStatus :phase="phase" :started-at="state.live?.startedAt" />
            </div>
            <button v-if="hasNewer" type="button" class="admin-history-button" data-history="newer" :disabled="paging" @click="newer">{{ C.later }}</button>
        </div>
        <button v-if="expanded || !atBottom" type="button" class="admin-latest" data-history="latest" @click="jumpLatest">↓ {{ C.latest }}</button>
        <div v-if="error || pageError || state.error || state.unsaved" class="admin-notice" role="status">
            <span>{{ error || pageError || (state.unsaved ? C.unsaved : state.error) }}</span>
            <button v-if="state.unsaved" type="button" data-action="check" :disabled="busy" @click="action('check')">{{ C.check }}</button>
            <button v-if="state.unsaved" type="button" data-action="confirm" :disabled="busy" @click="action('confirm')">{{ C.confirm }}</button>
            <button v-if="state.conflict || state.unsaved" type="button" data-action="adopt" :disabled="busy" @click="action('adopt')">{{ C.adopt }}</button>
        </div>
        <div v-if="image" class="admin-attachment"><img :src="image.dataUrl" :alt="image.name"><span>{{ image.name }}</span><button type="button" :aria-label="C.removeImage" :disabled="busy" @click="image = null">×</button></div>
        <form class="admin-composer" @submit.prevent="send">
            <input ref="file" type="file" :accept="ADMINISTRATOR_IMAGE_TYPES.join(',')" hidden @change="chooseImage">
            <button type="button" class="admin-icon-button" :disabled="disabled" :aria-label="C.attach" :title="C.attach" @click="file?.click()"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.5" /><path d="m3 17 5-5 4 4 4-7 5 8" /></svg></button>
            <textarea ref="composer" v-model="draft" rows="1" :maxlength="POLICY.maxInputChars" enterkeyhint="enter" :placeholder="C.placeholder" :aria-label="C.placeholder" :disabled="state.corrupted || busy" @keydown="keydown" @compositionstart="composing = true" @compositionend="composing = false" />
            <button v-if="phase" type="button" class="admin-send" :disabled="phase === 'stopping'" :aria-label="C.stop" :title="C.stop" @click="props.bridge.post('administrator/stop', binding())"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg></button>
            <button v-else type="submit" class="admin-send" :disabled="disabled || !draft.trim() && !image" :aria-label="C.send" :title="C.send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg></button>
        </form>
        <AdministratorDetails v-if="details" :key="details" :bridge="bridge" :chat-identity="state.chatIdentity" :turn-id="details" @close="details = null" />
        <AppDialog v-if="clearOpen" class="admin-dialog" :aria-label="C.clearTitle" :busy="busy" @close="clearOpen = false"><h2>{{ C.clearTitle }}</h2><p>{{ C.clearWarning }}</p><div class="admin-dialog-actions"><button type="button" @click="clearOpen = false">{{ C.cancel }}</button><button type="button" :disabled="busy" @click="action('clear')">{{ C.clear }}</button></div></AppDialog>
        <AppDialog v-if="deleteRow" class="admin-dialog" :aria-label="C.delete" :busy="busy" @close="deleteRow = null"><h2>{{ C.delete }}</h2><p>{{ C.deleteWarning }}</p><div class="admin-dialog-actions"><button type="button" @click="deleteRow = null">{{ C.cancel }}</button><button type="button" :disabled="disabled" @click="action('delete', { turnId: deleteRow!.turnId, role: deleteRow!.role, revision: state.page.revision })">{{ C.delete }}</button></div></AppDialog>
    </div>
</template>
