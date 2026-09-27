<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, toRaw, watch } from 'vue';
import { estimateTokenCount } from '../../../../agent-core/runtime/context-tokens.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';
import type { AdministratorPage, AdministratorRow, AdministratorState } from '../domain/types.js';
import { ADMINISTRATOR_IMAGE_TYPES, ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';
import type { AdministratorUpload } from '../storage/images.js';
import { createAdministratorId } from '../application/identity.js';
import { ADMINISTRATOR_COPY as C, administratorError } from './copy.js';
import AdministratorContext from './AdministratorContext.vue';
import AdministratorMessage from './AdministratorMessage.vue';
import AdministratorDetails from './AdministratorDetails.vue';
import './administrator.css';

const props = defineProps<XiaobaiOsAppProps>();
const state = shallowRef(structuredClone(toRaw(props.initialState as AdministratorState)));
const rows = shallowRef(state.value.page.rows), start = ref(state.value.page.start), total = ref(state.value.page.total);
const draft = ref(''), image = ref<AdministratorUpload | null>(null), error = ref(''), pending = ref(''), paging = ref(false);
const clearOpen = ref(false), deleteRow = ref<AdministratorRow | null>(null), details = ref<string | null>(null);
const list = ref<HTMLElement | null>(null), file = ref<HTMLInputElement | null>(null), composer = ref<HTMLTextAreaElement | null>(null);
const atBottom = ref(true), composing = ref(false), draftTokens = ref(0);
let draftRevision = 0;
let sentInput: { id: string; revision: number } | null = null;
watch([draft, image], () => { draftRevision++; }, { flush: 'sync' });
const busy = computed(() => !!pending.value || !!state.value.live);
const phase = computed(() => state.value.live?.phase ?? (['send', 'regenerate'].includes(pending.value) ? 'preparing' : null));
const disabled = computed(() => busy.value || state.value.unsaved || state.value.corrupted);
const liveInRows = computed(() => rows.value.some(row => row.role === 'assistant' && row.turnId === state.value.live?.turnId));
const latest = computed(() => start.value + rows.value.length >= total.value);
let unsubscribe = () => {};
let tokenTimer: ReturnType<typeof setTimeout> | undefined;
let windowRequest = 0;
const binding = () => ({ chatIdentity: state.value.chatIdentity });
async function request<T>(type: string, payload: object = {}): Promise<T> {
    return (await props.bridge.request(`administrator/${type}`, { ...binding(), ...payload }, 60000) as { result: T }).result;
}
function anchor() {
    const container = list.value;
    const element = container && [...container.querySelectorAll<HTMLElement>('[data-row-id]')].find(el => el.getBoundingClientRect().bottom > container.getBoundingClientRect().top);
    return element ? { id: element.dataset.rowId, top: element.getBoundingClientRect().top } : null;
}
async function restore(saved: ReturnType<typeof anchor>) {
    await nextTick();
    const element = list.value && [...list.value.querySelectorAll<HTMLElement>('[data-row-id]')].find(el => el.dataset.rowId === saved?.id);
    if (saved && element && list.value) { list.value.scrollTop += element.getBoundingClientRect().top - saved.top; }
}
async function scrollEnd() { await nextTick(); if (list.value) { list.value.scrollTop = list.value.scrollHeight; } }
function apply(next: AdministratorState) {
    const saved = anchor();
    const wasLatest = latest.value;
    const previous = state.value; state.value = next; total.value = next.page.total;
    if (previous.chatIdentity !== next.chatIdentity) { windowRequest++; rows.value = next.page.rows; start.value = next.page.start; draft.value = ''; image.value = null; details.value = null; sentInput = null; return; }
    if (next.page.revision !== previous.page.revision) {
        const count = Math.max(POLICY.pageSize, rows.value.length);
        const position = wasLatest && atBottom.value ? Math.max(0, next.page.total - count) : Math.min(start.value, Math.max(0, next.page.total - count));
        if (position === next.page.start && count === POLICY.pageSize) {
            rows.value = next.page.rows; start.value = position;
            if (!atBottom.value) { void restore(saved); }
        } else { void refreshWindow(position, count, saved); }
    }
    if (sentInput && next.submission?.id === sentInput.id && next.submission.accepted) {
        if (sentInput.revision === draftRevision) { draft.value = ''; image.value = null; }
        sentInput = null;
    }
    if (atBottom.value && latest.value) { void scrollEnd(); }
}
async function refreshWindow(position: number, count: number, saved: ReturnType<typeof anchor>) {
    const requestId = ++windowRequest;
    const identity = state.value.chatIdentity, revision = state.value.page.revision;
    const current = () => requestId === windowRequest && identity === state.value.chatIdentity && revision === state.value.page.revision;
    try {
        const fresh: AdministratorRow[] = [];
        for (let cursor = position; cursor < Math.min(total.value, position + count); cursor += POLICY.pageSize) {
            const page = await request<AdministratorPage>('page', { start: cursor, revision });
            if (!current()) { return; }
            fresh.push(...page.rows);
        }
        if (!current()) { return; }
        rows.value = fresh; start.value = position;
        if (atBottom.value && latest.value) { await scrollEnd(); } else { await restore(saved); }
    } catch (cause) { if (current()) { error.value = administratorError(cause); } }
}
async function loadPage(position: number, direction: 'earlier' | 'later' | 'replace') {
    if (paging.value) { return; }
    const requestId = ++windowRequest;
    paging.value = true; error.value = '';
    const saved = anchor();
    const identity = state.value.chatIdentity, revision = state.value.page.revision;
    try {
        const page = await request<AdministratorPage>('page', { start: position, revision: state.value.page.revision });
        if (requestId !== windowRequest || identity !== state.value.chatIdentity || revision !== state.value.page.revision) { return; }
        const retained = rows.value.filter(row => row.revision === revision);
        if (direction === 'earlier') {
            rows.value = [...page.rows, ...retained.filter(row => !page.rows.some(item => item.id === row.id))].slice(0, POLICY.windowSize);
            start.value = page.start;
        } else if (direction === 'later') {
            rows.value = [...retained.filter(row => !page.rows.some(item => item.id === row.id)), ...page.rows].slice(-POLICY.windowSize);
            start.value = page.start + page.rows.length - rows.value.length;
        } else { rows.value = page.rows; start.value = page.start; }
        total.value = page.total; await restore(saved);
    } catch (cause) { if (requestId === windowRequest && identity === state.value.chatIdentity && revision === state.value.page.revision) { error.value = administratorError(cause); } }
    finally { paging.value = false; }
}
async function jumpLatest() { await loadPage(Math.max(0, total.value - POLICY.pageSize), 'replace'); atBottom.value = true; await scrollEnd(); }
async function send() {
    if (disabled.value || !draft.value.trim() && !image.value) { return; }
    pending.value = 'send'; error.value = ''; atBottom.value = true;
    try {
        sentInput = { id: createAdministratorId(), revision: draftRevision };
        const result = await request<{ turnId: string; state: AdministratorState }>('send', { submissionId: sentInput.id, text: draft.value, ...(image.value ? { image: toRaw(image.value) } : {}) });
        apply(result.state); await jumpLatest();
    } catch (cause) { error.value = administratorError(cause); }
    finally { pending.value = ''; }
}
async function action(type: string, payload: object = {}) {
    if (busy.value) { return; }
    pending.value = type; error.value = '';
    try {
        apply(await request<AdministratorState>(type, payload)); clearOpen.value = false; deleteRow.value = null;
        if (type === 'adopt') { sentInput = null; }
        if (type === 'clear') { draft.value = ''; image.value = null; sentInput = null; details.value = null; }
    }
    catch (cause) { error.value = administratorError(cause); }
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
    if (event.key === 'Enter' && !event.shiftKey && !composing.value && !event.isComposing) { event.preventDefault(); if (!busy.value) { void send(); } }
}
function scrolled() { if (list.value) { atBottom.value = list.value.scrollHeight - list.value.scrollTop - list.value.clientHeight < 48; } }
watch([draft, image], () => {
    if (tokenTimer) { clearTimeout(tokenTimer); }
    tokenTimer = setTimeout(() => { draftTokens.value = estimateTokenCount(draft.value) + (image.value ? POLICY.imageTokens : 0); }, 160);
});
onMounted(() => {
    unsubscribe = props.bridge.subscribe(message => {
        if (message.type === 'administrator/state') { apply((message.payload as { state: AdministratorState }).state); }
        if (message.type === 'administrator/live') {
            state.value = { ...state.value, ...(message.payload as Pick<AdministratorState, 'live' | 'context'>) };
            if (atBottom.value && latest.value) { void scrollEnd(); }
        }
    });
    void scrollEnd();
});
onBeforeUnmount(() => { windowRequest++; unsubscribe(); if (tokenTimer) { clearTimeout(tokenTimer); } });
</script>

<template>
    <div class="administrator-app">
        <header class="admin-header"><h1>{{ C.title }}</h1><AdministratorContext :usage="state.context" :draft-tokens="state.live ? 0 : draftTokens" /><button type="button" class="admin-icon-button" :title="C.clear" :aria-label="C.clear" :disabled="busy || state.unsaved" @click="clearOpen = true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7" /></svg></button></header>
        <div v-if="state.corrupted" class="admin-notice" role="alert">{{ C.corrupted }}<button type="button" :disabled="busy" @click="clearOpen = true">{{ C.clear }}</button></div>
        <div ref="list" class="admin-conversation" @scroll.passive="scrolled">
            <button v-if="start > 0" type="button" class="admin-history-button" :disabled="paging" @click="loadPage(Math.max(0, start - POLICY.pageSize), 'earlier')">{{ C.earlier }}</button>
            <p v-if="!rows.length && !phase && !state.corrupted" class="admin-empty">{{ C.empty }}</p>
            <AdministratorMessage
                v-for="row in rows" :key="row.id" :row="row" :live="row.role === 'assistant' && row.turnId === state.live?.turnId ? state.live : null" :bridge="bridge" :chat-identity="state.chatIdentity" :disabled="disabled"
                :unsaved-process="row.role === 'assistant' && row.turnId === state.unsavedProcess?.turnId ? state.unsavedProcess.rounds : null"
                @delete="deleteRow = $event" @regenerate="action('regenerate', { turnId: $event.turnId })" @details="details = $event.turnId"
            />
            <div v-if="phase && latest && !liveInRows" class="admin-live">
                <div class="admin-live-status" role="status" aria-live="polite"><span class="admin-working-dot" />{{ C.phases[phase] }}</div>
            </div>
            <button v-if="!latest" type="button" class="admin-history-button" :disabled="paging" @click="loadPage(start + rows.length, 'later')">{{ C.later }}</button>
        </div>
        <button v-if="!latest || !atBottom" type="button" class="admin-latest" @click="jumpLatest">↓ {{ C.latest }}</button>
        <div v-if="error || state.error || state.unsaved" class="admin-notice" role="status">
            <span>{{ error || (state.unsaved ? C.unsaved : state.error) }}</span>
            <button v-if="state.unsaved" type="button" :disabled="busy" @click="action('check')">{{ C.check }}</button>
            <button v-if="state.unsaved" type="button" :disabled="busy" @click="action('confirm')">{{ C.confirm }}</button>
            <button v-if="state.conflict || state.unsaved" type="button" :disabled="busy" @click="action('adopt')">{{ C.adopt }}</button>
        </div>
        <div v-if="image" class="admin-attachment"><img :src="image.dataUrl" :alt="image.name"><span>{{ image.name }}</span><button type="button" :aria-label="C.removeImage" :disabled="busy" @click="image = null">×</button></div>
        <form class="admin-composer" @submit.prevent="send">
            <input ref="file" type="file" :accept="ADMINISTRATOR_IMAGE_TYPES.join(',')" hidden @change="chooseImage">
            <button type="button" class="admin-icon-button" :disabled="disabled" :aria-label="C.attach" :title="C.attach" @click="file?.click()"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.5" /><path d="m3 17 5-5 4 4 4-7 5 8" /></svg></button>
            <textarea ref="composer" v-model="draft" rows="1" maxlength="16000" :placeholder="C.placeholder" :aria-label="C.placeholder" :disabled="state.corrupted || busy" @keydown="keydown" @compositionstart="composing = true" @compositionend="composing = false" />
            <button v-if="phase" type="button" class="admin-send" :disabled="phase === 'stopping'" :aria-label="C.stop" :title="C.stop" @click="props.bridge.post('administrator/stop', binding())"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg></button>
            <button v-else type="submit" class="admin-send" :disabled="disabled || !draft.trim() && !image" :aria-label="C.send" :title="C.send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg></button>
        </form>
        <AdministratorDetails v-if="details" :key="details" :bridge="bridge" :chat-identity="state.chatIdentity" :turn-id="details" @close="details = null" />
        <AppDialog v-if="clearOpen" class="admin-dialog" :aria-label="C.clearTitle" :busy="busy" @close="clearOpen = false"><h2>{{ C.clearTitle }}</h2><p>{{ C.clearWarning }}</p><div class="admin-dialog-actions"><button type="button" @click="clearOpen = false">{{ C.cancel }}</button><button type="button" :disabled="busy" @click="action('clear')">{{ C.clear }}</button></div></AppDialog>
        <AppDialog v-if="deleteRow" class="admin-dialog" :aria-label="C.delete" :busy="busy" @close="deleteRow = null"><h2>{{ C.delete }}</h2><p>{{ C.deleteWarning }}</p><div class="admin-dialog-actions"><button type="button" @click="deleteRow = null">{{ C.cancel }}</button><button type="button" :disabled="disabled" @click="action('delete', { turnId: deleteRow!.turnId, role: deleteRow!.role, revision: state.page.revision })">{{ C.delete }}</button></div></AppDialog>
    </div>
</template>
