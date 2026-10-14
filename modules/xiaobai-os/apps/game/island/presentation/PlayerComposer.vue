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
.island-composer{display:flex;flex-direction:column}.island-composer .island-action-preview{min-height:0;flex-shrink:1}.island-input-mode,.island-composer form,.island-action-cost{flex-shrink:0}
.island-composer{border-top:1px solid var(--island-line);min-height:0;flex-shrink:0}.island-input-mode{display:flex;gap:4px;padding:5px 12px 0}.island-input-mode button{border:0;background:transparent;min-height:32px;font-size:12px;padding:4px 10px}.island-input-mode button[aria-pressed=true]{background:#ddece4;color:#235c57}.island-composer form{border:0;padding-top:5px}.island-action-cost{display:block;padding:0 14px 8px;font-size:10px}.island-action-preview{padding:10px 14px;max-height:260px;overflow:auto;overscroll-behavior:contain;background:#eaf3ed;font-size:12px}.island-action-preview h3{font-size:14px;margin:0 0 8px}.island-action-preview dl{display:grid;grid-template-columns:auto minmax(0,1fr);gap:5px 12px;margin:0}.island-action-preview dt{color:#5b7c72}.island-action-preview dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.island-action-preview p{white-space:pre-wrap;overflow-wrap:anywhere}.island-action-preview .island-action-warning{margin-top:8px;color:#80613d;font-size:11px}
@media(max-width:650px){.island-composer{flex-shrink:1}.island-action-preview{max-height:28vh}.island-input-mode{padding-top:2px}.island-input-mode button{min-height:30px}.island-action-cost{padding-bottom:4px}.island-composer form{padding-top:0}}
</style>
