<script setup lang="ts">
import { computed, nextTick, onActivated, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { createIslandClient } from '../client.js';
import type { Operation } from '../model.js';
import { RULES } from '../content.js';
import { COPY as c } from '../copy.js';
import { actionPreview } from './action-preview.js';
import IslandIcon from './IslandIcon.vue';

const props = defineProps<{ client: ReturnType<typeof createIslandClient>; disabled: boolean }>();
const emit = defineEmits<{ accepted: [operation: Operation]; submitted: [] }>();
const mode = ref<'speech' | 'action'>('speech'), speech = ref(''), action = ref('');
const input = ref<HTMLTextAreaElement | null>(null), sending = ref(false), continuing = ref(false);
let inputResize: ResizeObserver | null = null, inputWidth = 0;
const draft = computed({ get: () => mode.value === 'speech' ? speech.value : action.value,
    set: value => { if (mode.value === 'speech') { speech.value = value; } else { action.value = value; } } });
const intent = computed(() => {
    const value = props.client.view.value?.intent;
    return mode.value === 'action' && value && (value.result.kind === 'question' || value.text === action.value.trim()) ? value : null;
});
const preview = computed(() => intent.value?.result.kind === 'action' ? actionPreview(intent.value.result, props.client.view.value!.player!) : null);
const sendDisabled = computed(() => props.disabled || sending.value || !draft.value.trim() || mode.value === 'action' && (!!preview.value || !!props.client.view.value?.interpreting));
const continueDisabled = computed(() => props.disabled || continuing.value || !!props.client.view.value?.thinking || props.client.view.value?.scene === 'alone' && !props.client.view.value?.needsDecision);
function sizeInput() {
    const el = input.value; if (!el) { return; }
    el.style.height = '42px'; el.style.height = `${Math.min(112, el.scrollHeight)}px`;
}
watch(draft, async () => { await nextTick(); sizeInput(); });
onActivated(() => { void nextTick(sizeInput); });
onMounted(() => {
    sizeInput();
    inputResize = new ResizeObserver(([entry]) => {
        const width = entry.contentRect.width;
        if (width > 0 && width !== inputWidth) { inputWidth = width; sizeInput(); }
    });
    if (input.value) { inputResize.observe(input.value); }
});
onBeforeUnmount(() => inputResize?.disconnect());
watch(() => props.client.view.value?.intent?.id, () => {
    const pending = props.client.view.value?.intent;
    if (pending?.result.kind === 'question') { action.value = ''; mode.value = 'action'; return; }
    if (pending && !action.value) { action.value = pending.text; mode.value = 'action'; }
}, { immediate: true });
async function send() {
    if (sendDisabled.value) { return; }
    const text = draft.value.trim(); if (!text) { return; }
    sending.value = true;
    try {
        if (mode.value === 'action') { await props.client.interpret(text); }
        else {
            await props.client.speak(text, () => {
                if (speech.value.trim() === text) { speech.value = ''; }
                emit('submitted');
            });
        }
    } finally { sending.value = false; }
}
async function continueTalk() {
    if (continueDisabled.value) { return; }
    continuing.value = true;
    try { await props.client.think(); } finally { continuing.value = false; }
}
async function confirm() {
    if (sending.value || props.disabled || !preview.value?.available) { return; }
    const text = action.value.trim();
    sending.value = true;
    try {
        const operation = await props.client.acceptIntent(() => { if (action.value.trim() === text) { action.value = ''; } });
        if (operation) { emit('accepted', operation); }
    } finally { sending.value = false; }
}
</script>

<template>
    <div class="island-composer">
        <div class="island-composer-tools">
            <div class="island-input-mode" role="group" :aria-label="c.composeMode">
                <button type="button" :aria-pressed="mode === 'speech'" @click="mode = 'speech'">{{ c.speak }}</button>
                <button type="button" :aria-pressed="mode === 'action'" @click="mode = 'action'">{{ c.action }}</button>
            </div>
            <button v-if="mode === 'speech'" type="button" class="island-continue" :aria-label="c.requestResponse" :disabled="continueDisabled" @click="continueTalk"><IslandIcon name="play" />{{ c.conversationNext }}</button>
        </div>
        <section v-if="intent" class="island-action-preview" aria-live="polite" :aria-label="c.proposedAction">
            <template v-if="preview">
                <h3>{{ preview.title }}</h3>
                <dl><template v-for="(field, index) in preview.fields" :key="index"><dt>{{ field.label }}</dt><dd>{{ field.value }}</dd></template></dl>
                <p v-for="(warning, index) in preview.warnings" :key="index" class="island-action-warning">{{ warning }}</p>
                <div class="island-item-actions"><button class="island-primary" :disabled="disabled || sending || !preview.available" @click="confirm">{{ c.confirmAction }}</button><button :disabled="disabled || sending" @click="client.dismissIntent()">{{ c.dismissAction }}</button></div>
            </template>
            <template v-else-if="intent.result.kind === 'question'"><h3>{{ c.actionQuestion }}</h3><p>{{ intent.result.text }}</p><button :disabled="disabled" @click="client.dismissIntent()">{{ c.dismissAction }}</button></template>
        </section>
        <form @submit.prevent="send">
            <textarea ref="input" v-model="draft" rows="1" :maxlength="RULES.maxSpeechCharacters" :placeholder="mode === 'speech' ? c.sayPlaceholder : c.actionPlaceholder" :aria-label="mode === 'speech' ? c.speak : c.action" :disabled="disabled" @input="sizeInput" @keydown.ctrl.enter.prevent="send" @keydown.meta.enter.prevent="send" />
            <button type="submit" class="island-primary" :disabled="sendDisabled"><span>{{ mode === 'speech' ? c.send : c.interpretAction }}</span><IslandIcon name="arrow" /></button>
        </form>
        <small v-if="mode === 'action' && !intent" class="island-action-cost">{{ c.actionCost }}</small>
    </div>
</template>

<style scoped>
.island-composer{display:flex;flex-direction:column;min-height:112px;max-height:56%;flex-shrink:1;border-top:1px solid var(--island-line);padding:4px 18px max(14px,env(safe-area-inset-bottom));background:var(--island-paper)}
.island-composer-tools{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:38px;flex-shrink:0;margin-bottom:4px}
.island-input-mode{display:flex;gap:2px}
.island-input-mode button{border:0;background:transparent;min-height:36px;font-size:12px;padding:4px 10px;color:var(--island-muted)}
.island-input-mode button[aria-pressed=true]{color:var(--island-accent);background:var(--island-soft);font-weight:600}
.island-composer .island-continue{display:flex;align-items:center;gap:5px;border:0;background:none;min-height:36px;padding:4px 8px;font-size:12px;color:var(--island-muted)}
.island-continue .island-icon{width:14px;height:14px}
.island-composer form{display:flex;gap:6px;align-items:flex-end;flex-shrink:0;border:1px solid var(--island-line);border-radius:8px;background:#fff;padding:4px}
.island-composer form:focus-within{border-color:var(--island-accent)}
.island-composer textarea{display:block;min-width:0;flex:1;resize:none;min-height:42px;max-height:112px;padding:9px 8px;border:0;background:transparent;line-height:24px;font-size:16px;scrollbar-width:thin}
.island-composer textarea:focus-visible{outline:none}.island-composer textarea::placeholder{color:#8a9ca5}
.island-composer form button{display:flex;align-items:center;justify-content:center;gap:5px;font-size:12px;white-space:nowrap;padding:8px 11px;min-height:42px}
.island-composer form button .island-icon{width:16px;height:16px}
.island-action-cost{display:block;flex-shrink:0;padding:7px 2px 0;font-size:10px}
.island-action-preview{min-height:0;flex-shrink:1;padding:14px;margin-bottom:10px;max-height:260px;overflow:auto;overscroll-behavior:contain;background:var(--island-soft);border-radius:5px;font-size:12px}
.island-action-preview h3{font-size:14px;margin:0 0 10px}.island-action-preview dl{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 12px;margin:0}
.island-action-preview dt{color:var(--island-muted)}.island-action-preview dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}
.island-action-preview p{white-space:pre-wrap;overflow-wrap:anywhere}.island-action-preview .island-action-warning{margin-top:8px;color:#9b6543;font-size:11px}
@container island (max-height:500px){.island-composer{min-height:98px;padding:2px 12px 8px}.island-composer-tools{min-height:32px;margin-bottom:2px}.island-input-mode button,.island-composer .island-continue{min-height:32px}.island-action-preview{max-height:120px;padding:10px;margin-bottom:6px}}
</style>
