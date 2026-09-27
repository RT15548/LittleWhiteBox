<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { AdministratorLive, AdministratorProcessRound, AdministratorRow } from '../domain/types.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import { ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';
import { ADMINISTRATOR_COPY as C, administratorError } from './copy.js';
import MessageMarkdown from '../../../shell/app-src/components/MessageMarkdown.vue';
import AdministratorProcess from './AdministratorProcess.vue';
const props = withDefaults(defineProps<{ row: AdministratorRow; live?: AdministratorLive | null; unsavedProcess?: AdministratorProcessRound[] | null; bridge: XiaobaiOsAppProps['bridge']; chatIdentity: string; disabled: boolean }>(), { live: null, unsavedProcess: null });
const emit = defineEmits<{ delete: [AdministratorRow]; regenerate: [AdministratorRow]; details: [AdministratorRow] }>();
const menu = ref(false), content = ref(props.row.text), loading = ref(false), error = ref('');
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
    if (next[0] !== previous[0] || next[1] !== previous[1]) { expandedLength = props.row.text.length; }
    if (expandedLength <= props.row.text.length) { content.value = props.row.text; }
    else { void loadThrough(expandedLength, true); }
});
onBeforeUnmount(() => { pageRequest++; });
async function loadThrough(end: number, refresh = false) {
    if (loading.value) { return; }
    expandedLength = Math.min(Math.max(expandedLength, end), props.row.totalChars);
    const request = ++pageRequest;
    const { turnId, role, revision } = props.row, chatIdentity = props.chatIdentity;
    const current = () => request === pageRequest && chatIdentity === props.chatIdentity && revision === props.row.revision && turnId === props.row.turnId;
    loading.value = true; error.value = '';
    try {
        let text = refresh ? props.row.text : content.value;
        while (text.length < expandedLength) {
            const response = await props.bridge.request('administrator/text', { chatIdentity, turnId, role, revision, offset: text.length }) as { result: { text: string } };
            if (!current()) { return; }
            text += response.result.text;
        }
        content.value = text;
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
        <div v-if="displayedText || row.image || !live && !processCount" class="admin-bubble" tabindex="0" role="group" :aria-label="C.messageActions" @click="toggleMenu" @keydown.enter="toggleMenu" @keydown.space="toggleMenu" @keydown.esc.stop="menu = false">
            <img v-if="row.image" :src="row.image.path" :alt="row.image.name" loading="lazy" class="admin-message-image">
            <MessageMarkdown v-if="displayedText" class="admin-markdown" :text="displayedText" />
            <span v-if="!displayedText && !row.image" class="admin-muted">{{ row.error || C.noReply }}</span>
        </div>
        <template v-if="live">
            <div v-for="op in live.preview" :key="op.id" class="admin-operation-line"><i class="admin-operation-dot" :class="`is-${op.status}`" /><span>{{ op.name }}</span><small>{{ C.operations[op.status] }}</small></div>
            <small v-if="live.totalChars > POLICY.textBlock" class="admin-muted">{{ C.longReply }}</small>
            <div class="admin-live-status" role="status" aria-live="polite"><span class="admin-working-dot" />{{ C.phases[live.phase] }}</div>
        </template>
        <nav v-if="!live && row.totalChars > content.length" class="admin-pager" :aria-label="C.messagePages">
            <button type="button" :disabled="loading" @click="loadThrough(content.length + POLICY.textBlock)">{{ C.moreText }}</button>
        </nav>
        <p v-if="row.error || error" class="admin-error" role="status">{{ error || row.error }}</p>
        <nav v-if="menu || !live && processCount && !displayedText" class="admin-message-actions" :aria-label="C.messageActions">
            <button type="button" :disabled="disabled" @click="emit('delete', row)">{{ C.delete }}</button>
            <button v-if="row.canRegenerate" type="button" :disabled="disabled" @click="emit('regenerate', row)">{{ C.regenerate }}</button>
            <button v-if="processCount" type="button" @click="emit('details', row)">{{ C.evidence }}</button>
        </nav>
    </article>
</template>
