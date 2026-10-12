<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { copyText } from '../../../../agent-core/ui/message-markdown.js';
import type { AdministratorLive, AdministratorProcessRound, AdministratorRow } from '../domain/types.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import { ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';
import { ADMINISTRATOR_COPY as C, administratorError } from './copy.js';
import MessageMarkdown from '../../../shell/app-src/components/MessageMarkdown.vue';
import AdministratorProcess from './AdministratorProcess.vue';
import AdministratorStatus from './AdministratorStatus.vue';
import { readAdministratorText } from './message-text.js';
const props = withDefaults(defineProps<{ row: AdministratorRow; live?: AdministratorLive | null; unsavedProcess?: AdministratorProcessRound[] | null; bridge: XiaobaiOsAppProps['bridge']; chatIdentity: string; disabled: boolean; saveEdit: (row: AdministratorRow, text: string) => Promise<void> }>(), { live: null, unsavedProcess: null });
const emit = defineEmits<{ delete: [AdministratorRow]; regenerate: [AdministratorRow]; details: [AdministratorRow] }>();
const menu = ref(false), content = ref(props.row.text), loading = ref(false), error = ref('');
const fullText = ref<string | null>(null), preparing = ref(false), copying = ref(false), copied = ref(false), actionError = ref('');
const editing = ref<{ row: AdministratorRow; text: string } | null>(null), saving = ref(false), editor = ref<HTMLTextAreaElement | null>(null);
let actionRequest = 0;
let pageRequest = 0;
let expandedLength = content.value.length;
const displayedText = computed(() => props.live ? props.live.text : content.value);
const processCount = computed(() => props.unsavedProcess?.length ?? props.row.processCount);
function toggleMenu(event: Event) {
    if ((event.target as Element).closest('a, button, input, textarea, select')) { return; }
    if (event instanceof KeyboardEvent) { event.preventDefault(); }
    menu.value = !menu.value;
}
watch(() => [props.chatIdentity, props.row.id, props.row.revision], (next, previous) => {
    pageRequest++; loading.value = false; error.value = '';
    if (next[0] !== previous[0] || next[1] !== previous[1]) { expandedLength = props.row.text.length; editing.value = null; menu.value = false; }
    if (expandedLength <= props.row.text.length) { content.value = props.row.text; }
    else { void loadThrough(expandedLength, true); }
});
watch([menu, () => props.chatIdentity, () => props.row.id, () => props.row.revision, () => !!props.live], () => { void prepareActions(); });
watch(fullText, text => {
    if (editing.value && editing.value.row.revision !== props.row.revision && text === editing.value.text.trim()) { editing.value = null; actionError.value = ''; }
});
onBeforeUnmount(() => { pageRequest++; actionRequest++; });
async function prepareActions() {
    const request = ++actionRequest;
    fullText.value = null; preparing.value = false; copied.value = false;
    if (!editing.value) { actionError.value = ''; }
    if (!menu.value || props.live) { return; }
    const row = props.row, chatIdentity = props.chatIdentity;
    const current = () => request === actionRequest;
    preparing.value = true;
    try {
        const text = await readAdministratorText(props.bridge, { row, chatIdentity, text: row.text, through: row.totalChars, current });
        if (current()) { fullText.value = text; }
    }
    catch (cause) { if (current()) { actionError.value = administratorError(cause); } }
    finally { if (current()) { preparing.value = false; } }
}
async function copy() {
    if (fullText.value === null || copying.value) { return; }
    const request = actionRequest;
    const focus = document.activeElement;
    copying.value = true; copied.value = false; actionError.value = '';
    try {
        if (!await copyText(fullText.value)) { throw new Error('administrator_copy_failed'); }
        if (request === actionRequest) { copied.value = true; }
    } catch (cause) { if (request === actionRequest) { actionError.value = administratorError(cause); } }
    finally {
        copying.value = false;
        if (focus instanceof HTMLElement && focus.isConnected && document.activeElement === document.body) { focus.focus({ preventScroll: true }); }
    }
}
async function edit() {
    if (props.disabled || fullText.value === null) { return; }
    editing.value = { row: { ...props.row }, text: fullText.value }; actionError.value = '';
    await nextTick(); editor.value?.focus();
}
async function save() {
    const draft = editing.value;
    if (!draft || props.disabled || saving.value) { return; }
    saving.value = true; actionError.value = '';
    try { await props.saveEdit(draft.row, draft.text); if (editing.value === draft) { editing.value = null; } }
    catch (cause) { if (editing.value === draft) { actionError.value = administratorError(cause); } }
    finally { saving.value = false; }
}
async function loadThrough(end: number, refresh = false) {
    if (loading.value) { return; }
    expandedLength = Math.min(Math.max(expandedLength, end), props.row.totalChars);
    const request = ++pageRequest;
    const { turnId, revision } = props.row, chatIdentity = props.chatIdentity;
    const current = () => request === pageRequest && chatIdentity === props.chatIdentity && revision === props.row.revision && turnId === props.row.turnId;
    loading.value = true; error.value = '';
    try {
        const text = await readAdministratorText(props.bridge, { chatIdentity, row: props.row, text: refresh ? props.row.text : content.value, through: expandedLength, current });
        if (current()) { content.value = text; }
    } catch (cause) {
        if (current()) {
            if (refresh) { content.value = props.row.text; }
            error.value = administratorError(cause);
        }
    }
    finally { if (current()) { loading.value = false; } }
}
</script>

<template>
    <article class="admin-message" :class="`is-${row.role}`" :data-row-id="row.id">
        <AdministratorProcess v-if="row.role === 'assistant'" :row="row" :live="live" :unsaved="unsavedProcess" :bridge="bridge" :chat-identity="chatIdentity" />
        <form v-if="editing" class="admin-message-editor" :aria-label="C.editMessage" @submit.prevent="save">
            <img v-if="row.image" :src="row.image.path" :alt="row.image.name" class="admin-message-image">
            <textarea ref="editor" v-model="editing.text" rows="3" :maxlength="POLICY.maxInputChars" :aria-label="C.editMessage" enterkeyhint="enter" :disabled="saving" />
            <div class="admin-message-actions">
                <button type="button" data-action="cancel-edit" :disabled="saving" @click="editing = null; actionError = ''">{{ C.cancel }}</button>
                <button type="submit" data-action="save-edit" :disabled="disabled || saving || !editing.text.trim() && !row.image">{{ saving ? C.saving : C.save }}</button>
            </div>
        </form>
        <div v-else-if="displayedText || row.image || !live && !processCount" class="admin-bubble" tabindex="0" role="group" :aria-label="C.messageActions" @click="toggleMenu" @keydown.enter="toggleMenu" @keydown.space="toggleMenu" @keydown.esc.stop="menu = false">
            <img v-if="row.image" :src="row.image.path" :alt="row.image.name" loading="lazy" class="admin-message-image">
            <MessageMarkdown v-if="displayedText" class="admin-markdown" :text="displayedText" />
            <span v-if="!displayedText && !row.image" class="admin-muted">{{ row.error || C.noReply }}</span>
        </div>
        <template v-if="live">
            <div v-for="op in live.preview" :key="op.id" class="admin-operation-line"><i class="admin-operation-dot" :class="`is-${op.status}`" /><span>{{ op.name }}</span><small>{{ C.operations[op.status] }}</small></div>
            <small v-if="live.totalChars > POLICY.textBlock" class="admin-muted">{{ C.longReply }}</small>
            <AdministratorStatus :phase="live.phase" :started-at="live.startedAt" />
        </template>
        <nav v-if="!live && !editing && row.totalChars > content.length" class="admin-pager" :aria-label="C.messagePages">
            <button type="button" :disabled="loading" @click="loadThrough(content.length + POLICY.textBlock)">{{ C.moreText }}</button>
        </nav>
        <p v-if="row.error || error" class="admin-error" role="status">{{ error || row.error }}</p>
        <p v-if="actionError" class="admin-error" role="status">{{ actionError }}<button v-if="fullText === null && !preparing" type="button" @click="prepareActions">{{ C.retry }}</button></p>
        <nav v-if="!editing && (menu || !live && processCount && !displayedText)" class="admin-message-actions" :aria-label="C.messageActions">
            <button v-if="!live && row.totalChars" type="button" data-action="copy" :disabled="fullText === null || copying" @click="copy">{{ copied ? C.copied : C.copy }}</button>
            <button v-if="row.role === 'user'" type="button" data-action="edit" :disabled="disabled || fullText === null" @click="edit">{{ C.edit }}</button>
            <button type="button" :disabled="disabled" @click="emit('delete', row)">{{ C.delete }}</button>
            <button v-if="row.canRegenerate" type="button" data-action="regenerate" :disabled="disabled" @click="emit('regenerate', row)">{{ C.regenerate }}</button>
            <button v-if="processCount" type="button" @click="emit('details', row)">{{ C.evidence }}</button>
        </nav>
        <small v-if="preparing" class="admin-muted" role="status">{{ C.loadingText }}</small>
    </article>
</template>
