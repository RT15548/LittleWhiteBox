<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import type { ExperienceView } from '../cooperation.js';
import { COPY as c } from '../copy.js';
import { feedbackNote, type FeedbackNote } from './feedback.js';

const props = defineProps<{ events: readonly ExperienceView[]; journey: string | null }>();
interface Toast extends Pick<FeedbackNote, 'text' | 'tone'> { id: number; count: number; timer: ReturnType<typeof setTimeout> }
const SHOWN = 3, PLAIN_MILLISECONDS = 4200, WARN_MILLISECONDS = 7000;
const toasts = ref<Toast[]>([]);
let seen = props.events.at(-1)?.sequence ?? 0, journey = props.journey, id = 0;
function remove(target: number) { toasts.value = toasts.value.filter(t => t.id !== target); }
function show(note: FeedbackNote) {
    const last = toasts.value.at(-1), life = note.tone === 'warn' ? WARN_MILLISECONDS : PLAIN_MILLISECONDS;
    // The same thing happening again (gathering several, say) grows one note instead of stacking duplicates.
    if (last && last.text === note.text) { clearTimeout(last.timer); last.count++; last.timer = setTimeout(() => remove(last.id), life); return; }
    const next: Toast = { id: ++id, text: note.text, tone: note.tone, count: 1, timer: setTimeout(() => remove(next.id), life) };
    toasts.value = [...toasts.value, next].slice(-SHOWN);
}
function clear() { for (const t of toasts.value) { clearTimeout(t.timer); } toasts.value = []; }
// Only what happens while the player is here is announced; opening the island never replays the past.
watch(() => props.events, events => {
    const latest = events.at(-1)?.sequence ?? 0;
    if (props.journey !== journey) { journey = props.journey; clear(); seen = latest; return; }
    if (latest <= seen) { return; }
    for (const event of events) {
        if (event.sequence <= seen) { continue; }
        const note = feedbackNote(event); if (note) { show(note); }
    }
    seen = latest;
});
onBeforeUnmount(clear);
</script>

<template>
    <TransitionGroup tag="div" name="island-feedback" class="island-feedback" role="status" aria-live="polite">
        <p v-for="t in toasts" :key="t.id" :class="{ 'island-feedback-warn': t.tone === 'warn' }">{{ t.text }}<small v-if="t.count > 1"> {{ c.repeated(t.count) }}</small></p>
    </TransitionGroup>
</template>
