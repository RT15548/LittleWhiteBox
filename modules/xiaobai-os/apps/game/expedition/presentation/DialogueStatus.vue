<script setup lang="ts">
import { computed, onActivated, onDeactivated, ref, watch } from 'vue';
import type { ConversationPhase } from '../narrative/conversation.js';
import { DIALOGUE_COPY as c } from '../content/dialogue-copy.js';

const props = defineProps<{ phase: ConversationPhase; startedAt: number }>();
const now = ref(Date.now());
const active = ref(true);
onActivated(() => { active.value = true; });
onDeactivated(() => { active.value = false; });
const elapsed = computed(() => Math.max(0, Math.floor((now.value - props.startedAt) / 1000)));
watch(() => [props.startedAt, active.value], (_, __, cleanup) => {
    now.value = Date.now();
    if (!active.value) { return; }
    const timer = setInterval(() => { now.value = Date.now(); }, 1000);
    cleanup(() => clearInterval(timer));
}, { immediate: true });
</script>

<template>
    <div class="ember-dialogue-status" :data-phase="phase">
        <span class="ember-working-dot" aria-hidden="true" />
        <span role="status" aria-live="polite">{{ c.phases[phase] }}</span>
        <time :datetime="`PT${elapsed}S`">{{ c.elapsed(elapsed) }}</time>
    </div>
</template>

<style scoped>
.ember-dialogue-status { display:flex; align-items:center; gap:8px; flex-shrink:0; height:24px; margin:0 24px; color:var(--ember-muted); font-size:12px; line-height:20px; }
.ember-working-dot { width:5px; height:5px; border-radius:50%; background:currentColor; animation:ember-working 1.8s ease-in-out infinite; }
time { margin-left:auto; font-variant-numeric:tabular-nums; white-space:nowrap; }
@keyframes ember-working { 50% { opacity:.35; } }
@container (max-width:720px) { .ember-dialogue-status { margin-inline:16px; } }
@media (max-height:450px) { .ember-dialogue-status { height:20px; margin-inline:12px; } }
@media (prefers-reduced-motion:reduce) { .ember-working-dot { animation:none; } }
</style>
