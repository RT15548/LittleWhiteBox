<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { shouldSendOnEnter } from '../../../../shell/app-src/input/composer-keyboard.js';
import { CAMPAIGN_COPY as c } from '../content/campaign-copy.js';
import { CAMPAIGN_RULES } from '../campaign/rules.js';
import { DIALOGUE_COPY as d } from '../content/dialogue-copy.js';

const draft = defineModel<string>({ required: true });
const props = defineProps<{ blocked: boolean; talking: boolean; canRegenerate: boolean; retrying?: boolean; conclusion?: 'fight' | 'continue' }>();
const emit = defineEmits<{ send: []; cancel: []; regenerate: []; continue: [] }>();
const input = ref<HTMLTextAreaElement | null>(null), composing = ref(false);
let observer: ResizeObserver | null = null, width = 0;
function fit() {
    if (!input.value) { return; }
    input.value.style.height = '44px';
    input.value.style.height = `${Math.min(132, input.value.scrollHeight + 2)}px`;
}
function send() { if (!props.blocked && draft.value.trim()) { emit('send'); } }
function keydown(event: KeyboardEvent) {
    if (shouldSendOnEnter(event, composing.value)) { event.preventDefault(); send(); }
}
watch(draft, async () => { await nextTick(); fit(); });
watch(input, (next, previous) => { if (previous) { observer?.unobserve(previous); } if (next) { fit(); observer?.observe(next); } }, { flush: 'post' });
onMounted(() => {
    fit();
    observer = new ResizeObserver(entries => { const next = entries[0].contentRect.width; if (next !== width) { width = next; fit(); } });
    if (input.value) { observer.observe(input.value); }
});
onBeforeUnmount(() => observer?.disconnect());
</script>
<template>
    <form class="ember-composer" @submit.prevent="send">
        <button class="ember-regenerate" type="button" :aria-label="retrying ? d.retrySend : d.regenerate" :title="retrying ? d.retrySend : d.regenerate" :disabled="blocked || !canRegenerate" @click="emit('regenerate')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" /></svg></button>
        <button v-if="conclusion" class="ember-continue" type="button" :disabled="blocked" @click="emit('continue')">{{ conclusion === 'fight' ? d.fight : d.continue }}<span aria-hidden="true">→</span></button>
        <textarea v-else ref="input" v-model="draft" rows="1" :maxlength="CAMPAIGN_RULES.playerTextLimit" :aria-label="c.input" :placeholder="c.input" enterkeyhint="enter" @keydown="keydown" @compositionstart="composing = true" @compositionend="composing = false" />
        <button v-if="talking" type="button" :aria-label="c.cancel" :title="c.cancel" @click="emit('cancel')"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg></button>
        <button v-else-if="!conclusion" type="submit" :aria-label="c.send" :title="c.send" :disabled="blocked || !draft.trim()"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg></button>
    </form>
</template>
<style scoped>
.ember-composer { display:flex; align-items:flex-end; gap:8px; flex-shrink:0; padding:12px 24px 20px; }
.ember-composer textarea { display:block; box-sizing:border-box; width:0; min-width:0; flex:1; height:44px; min-height:44px; max-height:132px; padding:10px 12px; border:1px solid var(--ember-line); border-radius:10px; background:#fff; color:#244754; font:inherit; line-height:22px; resize:none; overflow-y:auto; scrollbar-width:thin; }
.ember-composer button { display:grid; place-items:center; box-sizing:border-box; flex:0 0 44px; width:44px; height:44px; min-height:44px; padding:0; border:0; border-radius:10px; background:var(--ember-action); color:#fff9e9; }
.ember-composer svg { width:22px; height:22px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
.ember-composer rect { fill:currentColor; stroke:none; }
.ember-composer .ember-regenerate { background:transparent; color:var(--ember-muted); border:1px solid var(--ember-line); }
.ember-composer .ember-continue { flex:1; width:auto; display:flex; justify-content:space-between; padding-inline:16px; }
@container (max-width:720px) { .ember-composer { padding:10px 16px 16px; }.ember-composer textarea { font-size:16px; } }
@media (max-height:450px) { .ember-composer { padding:8px 12px 10px; }.ember-composer textarea { max-height:88px; } }
</style>
