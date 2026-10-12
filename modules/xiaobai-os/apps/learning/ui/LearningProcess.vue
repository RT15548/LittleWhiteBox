<script setup lang="ts">
import { computed, nextTick, ref, useSlots, watch } from 'vue';
import type { LearningDialogueView } from '../application/message-view.js';
import { learningProgressMessage } from '../application/feedback.js';
import MessageMarkdown from '../../../shell/app-src/components/MessageMarkdown.vue';
import { learningProcessRounds, type LearningProcessTool } from './learning-process.js';
import { LEARNING_PROCESS_COPY as copy } from './learning-copy.js';
import { LEARNING_PREPARATION_COPY } from '../application/preparation-copy.js';
import { learningResearchFailure } from '../application/research-feedback.js';

const props = withDefaults(defineProps<{ turn: LearningDialogueView; stoppable?: boolean; disabled?: boolean }>(), { stoppable: false, disabled: false });
const emit = defineEmits<{ stop: [] }>();
const rounds = computed(() => learningProcessRounds(props.turn));
const tools = computed(() => rounds.value.flatMap(round => round.tools));
const running = computed(() => props.turn.status === 'running');
const preparationTitle = computed(() => LEARNING_PREPARATION_COPY.taskTitles[props.turn.purpose as keyof typeof LEARNING_PREPARATION_COPY.taskTitles]);
const opened = ref<boolean | null>(null);
const slots = useSlots();
const expanded = computed(() => opened.value ?? (running.value || props.turn.status === 'failed' || !!slots.default));
const body = ref<HTMLElement | null>(null);
const currentRound = computed(() => props.turn.progress?.round ?? rounds.value.at(-1)?.index);
const status = computed(() => {
    if (!running.value) { return copy.outcomes[props.turn.status as keyof typeof copy.outcomes]; }
    const last = rounds.value.at(-1);
    const active = last?.tools.find(tool => tool.status === 'running' || tool.status === 'preparing');
    if (active) { return `${copy.tools[active.name] ?? copy.unknownTool} · ${copy[active.status]}`; }
    if (props.turn.progress?.stage === 'provider' && last?.streaming) {
        if (last.receivedChars) { return copy.received(last.receivedChars); }
        if (last.thinking) { return copy.thinking; }
    }
    return learningProgressMessage(props.turn.progress ?? { stage: 'provider' });
});
function details(tool: LearningProcessTool) {
    const items: string[] = [];
    if (tool.result.error) { items.push(learningResearchFailure(tool.result.error, tool.result.httpStatus)); }
    const section = tool.result.section ?? tool.input.section;
    if (section && copy.sections[section]) { items.push(copy.sections[section]); }
    if (tool.result.resultsCount !== undefined && (!tool.result.error || tool.result.resultsCount > 0)) {
        items.push(tool.name === 'LearningExtract' ? copy.extracted(tool.result.resultsCount) : copy.results(tool.result.resultsCount));
    }
    if (tool.result.paragraphCount !== undefined) { items.push(copy.paragraphs(tool.result.paragraphCount)); }
    if (tool.result.dataCount !== undefined) { items.push(copy.entries(tool.result.dataCount)); }
    if (tool.result.failedCount && (!tool.result.error || tool.result.failedCount > 1)) { items.push(copy.sourcesFailed(tool.result.failedCount)); }
    if (tool.name === 'LearningLessonEdit') {
        if (tool.input.materialsCount) { items.push(copy.proposedMaterials(tool.input.materialsCount)); }
        if (tool.input.exercisesCount) { items.push(copy.proposedExercises(tool.input.exercisesCount)); }
    }
    return items.join(' · ');
}
watch(running, () => { opened.value = null; });
watch(() => props.turn.messages, async () => {
    const area = body.value;
    const following = !area || area.scrollHeight - area.scrollTop - area.clientHeight < 48;
    await nextTick();
    if (following && body.value) { body.value.scrollTop = body.value.scrollHeight; }
});
</script>

<template>
    <section v-if="running || tools.length || $slots.default" class="learning-process" :class="{ 'is-running': running }" :aria-label="copy.title">
        <header class="learning-process-header">
            <button type="button" class="learning-process-toggle" :aria-expanded="expanded" @click="opened = !expanded">
                <span aria-hidden="true">{{ expanded ? '⌄' : '›' }}</span><strong>{{ preparationTitle ?? copy.title }}</strong>
                <small>{{ running && currentRound ? copy.round(currentRound) : copy.history(tools.length) }}</small>
            </button>
            <button v-if="running && stoppable" type="button" class="learning-process-stop" :disabled="disabled" :aria-label="copy.stop" @click="emit('stop')">■</button>
        </header>
        <div v-if="expanded" ref="body" class="learning-process-body">
            <template v-for="round in rounds" :key="round.index">
                <MessageMarkdown v-if="round.text" class="learning-markdown learning-process-narration" :text="round.text" />
                <ol v-if="round.tools.length" class="learning-process-steps" :aria-label="copy.round(round.index)">
                    <li v-for="tool in round.tools" :key="tool.id" :data-status="tool.status">
                        <span class="learning-process-dot" aria-hidden="true">{{ tool.status === 'done' ? '✓' : tool.status === 'failed' ? '!' : '·' }}</span>
                        <div>
                            <span>{{ copy.tools[tool.name] ?? copy.unknownTool }}</span><small v-if="details(tool)">{{ details(tool) }}</small>
                            <small v-for="(error, index) in tool.result.errors" :key="index" class="learning-process-error">{{ error.message }}</small>
                        </div>
                        <small class="learning-process-result">{{ copy[tool.status] }}</small>
                    </li>
                </ol>
            </template>
        </div>
        <p v-if="running || (!$slots.default && turn.status === 'finished' && (!preparationTitle || expanded))" class="learning-process-status" role="status" aria-live="polite"><span v-if="running" class="learning-working-dot" aria-hidden="true" />{{ status }}</p>
        <div v-if="$slots.default" class="learning-process-recovery"><slot /></div>
    </section>
</template>
