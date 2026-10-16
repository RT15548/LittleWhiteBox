<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { createIslandClient } from '../client.js';
import type { Operation } from '../model.js';
import { RULES } from '../content.js';
import { COPY as c } from '../copy.js';
import { actionPreview } from './action-preview.js';

const props = defineProps<{ client: ReturnType<typeof createIslandClient>; disabled: boolean }>();
const emit = defineEmits<{ accepted: [operation: Operation] }>();
const mode = ref<'speech' | 'action'>('speech'), speech = ref(''), action = ref('');
const draft = computed({ get: () => mode.value === 'speech' ? speech.value : action.value,
    set: value => { if (mode.value === 'speech') { speech.value = value; } else { action.value = value; } } });
const intent = computed(() => {
    const value = props.client.view.value?.intent;
    return mode.value === 'action' && value && (value.result.kind === 'question' || value.text === action.value.trim()) ? value : null;
});
const preview = computed(() => intent.value?.result.kind === 'action' ? actionPreview(intent.value.result, props.client.view.value!.player!) : null);
watch(() => props.client.view.value?.intent?.id, () => {
    const pending = props.client.view.value?.intent;
    if (pending?.result.kind === 'question') { action.value = ''; mode.value = 'action'; return; }
    if (pending && !action.value) { action.value = pending.text; mode.value = 'action'; }
}, { immediate: true });
async function send() {
    if (props.disabled) { return; }
    const text = draft.value.trim(); if (!text) { return; }
    if (mode.value === 'action') { await props.client.interpret(text); }
    else { await props.client.speak(text, () => { if (speech.value.trim() === text) { speech.value = ''; } }); }
}
async function confirm() {
    const text = action.value.trim();
    const operation = await props.client.acceptIntent(() => { if (action.value.trim() === text) { action.value = ''; } });
    if (operation) { emit('accepted', operation); }
}
</script>

<template>
    <div class="island-composer">
        <div class="island-input-mode" role="group" :aria-label="c.action">
            <button type="button" :aria-pressed="mode === 'speech'" @click="mode = 'speech'">{{ c.speak }}</button>
            <button type="button" :aria-pressed="mode === 'action'" @click="mode = 'action'">{{ c.action }}</button>
        </div>
        <section v-if="intent" class="island-action-preview" aria-live="polite" :aria-label="c.proposedAction">
            <template v-if="preview">
                <h3>{{ preview.title }}</h3>
                <dl><template v-for="(field, index) in preview.fields" :key="index"><dt>{{ field.label }}</dt><dd>{{ field.value }}</dd></template></dl>
                <p v-for="(warning, index) in preview.warnings" :key="index" class="island-action-warning">{{ warning }}</p>
                <div class="island-item-actions"><button class="island-primary" :disabled="disabled" @click="confirm">{{ c.confirmAction }}</button><button :disabled="disabled" @click="client.dismissIntent()">{{ c.dismissAction }}</button></div>
            </template>
            <template v-else-if="intent.result.kind === 'question'"><h3>{{ c.actionQuestion }}</h3><p>{{ intent.result.text }}</p><button :disabled="disabled" @click="client.dismissIntent()">{{ c.dismissAction }}</button></template>
        </section>
        <form @submit.prevent="send">
            <textarea v-model="draft" rows="2" :maxlength="RULES.maxSpeechCharacters" :placeholder="mode === 'speech' ? c.sayPlaceholder : c.actionPlaceholder" :aria-label="mode === 'speech' ? c.speak : c.action" :disabled="disabled" @keydown.ctrl.enter.prevent="send" />
            <button class="island-primary" :disabled="disabled || !draft.trim() || !!preview">{{ mode === 'speech' ? c.send : c.interpretAction }}</button>
        </form>
        <small v-if="mode === 'action' && !intent" class="island-action-cost">{{ c.actionCost }}</small>
    </div>
</template>

<style scoped>
.island-composer{display:flex;flex-direction:column;min-height:0;flex-shrink:1;border-top:1px solid var(--island-line);padding:10px 16px 14px;background:var(--island-paper)}
.island-input-mode{display:flex;gap:18px;flex-shrink:0;padding:0 2px 8px}
.island-input-mode button{position:relative;border:0;border-radius:0;background:transparent;min-height:32px;font-size:12px;padding:4px 0;color:var(--island-muted)}
.island-input-mode button[aria-pressed=true]{color:var(--island-accent);font-weight:550}
.island-input-mode button[aria-pressed=true]::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;border-radius:2px;background:var(--island-accent)}
.island-composer form{display:flex;gap:10px;align-items:flex-end;flex-shrink:0;border:1px solid var(--island-line);border-radius:7px;background:#fff;padding:10px}
.island-composer form:focus-within{border-color:var(--island-accent)}
.island-composer textarea{display:block;min-width:0;flex:1;resize:none;min-height:56px;max-height:110px;padding:3px;border:0;background:transparent;line-height:1.75;font-size:14px}
.island-composer textarea:focus-visible{outline:none}.island-composer textarea::placeholder{color:#8a9ca5}
.island-composer form button{font-size:12px;white-space:nowrap;padding:7px 10px;min-height:36px}
.island-action-cost{display:block;flex-shrink:0;padding:7px 2px 0;font-size:10px}
.island-action-preview{min-height:0;flex-shrink:1;padding:14px;margin-bottom:10px;max-height:260px;overflow:auto;overscroll-behavior:contain;background:var(--island-soft);border-radius:5px;font-size:12px}
.island-action-preview h3{font-size:14px;margin:0 0 10px}.island-action-preview dl{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 12px;margin:0}
.island-action-preview dt{color:var(--island-muted)}.island-action-preview dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}
.island-action-preview p{white-space:pre-wrap;overflow-wrap:anywhere}.island-action-preview .island-action-warning{margin-top:8px;color:#9b6543;font-size:11px}
</style>
