<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useAppLayer } from '../../../shell/app-src/navigation/app-navigation.js';
import type { LearningClientState } from '../types.js';
import type { LearningPresentation } from '../application/presentation.js';
import type { LearningSelection } from '../../../domains/learning/notes.js';
import type { LearningAnswer } from '../../../domains/learning/types.js';
import AnswerInput from './AnswerInput.vue';
import MaterialReader from './MaterialReader.vue';
import AttemptFeedback from './AttemptFeedback.vue';
import LearningIcon from './LearningIcon.vue';
import LearningPlayer from './LearningPlayer.vue';
import LearningSelectionActions from './LearningSelectionActions.vue';
import { learningAnswerText } from '../application/answer-text.js';
import { createLearningAnswerDraft, type LearningAnswerDraft } from './answer-draft.js';
import { useLearningUnitSession } from './learning-session.js';

const props = defineProps<{ state: LearningClientState; target: LearningPresentation; active: boolean; disabled: boolean }>();
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>]; close: []; ask: [exerciseId: string | undefined, selection?: LearningSelection] }>();
const body = ref<HTMLElement | null>(null);
const session = useLearningUnitSession(() => props.target.unitId);
const activityKey = computed(() => `${props.target.kind}:${props.target.id}`);
watch([session, activityKey], () => { session.value.activities[activityKey.value] ??= { scroll: 0, selected: null, retry: false, materialsOpen: false }; }, { immediate: true });
const local = computed(() => session.value.activities[activityKey.value]);
const closeButton = ref<HTMLButtonElement | null>(null);
const retry = computed({ get: () => local.value.retry, set: value => { local.value.retry = value; } });
const selected = computed({ get: () => local.value.selected, set: value => { local.value.selected = value; } });
const layer = ref<HTMLElement | null>(null);
function back() {
    if (selected.value) { selected.value = null; }
    else if (retry.value) { retry.value = false; }
    else { emit('close'); }
}
// This sheet belongs to the workbench, not to the whole app. Hidden panes must not consume Back.
useAppLayer(computed(() => props.active ? layer.value : null), back, () => false);
const drafts = computed(() => session.value.activityDrafts);
let submitting: { id: string; before: string | undefined } | null = null;
const question = computed(() => props.target?.kind === 'exercise' ? props.state.unit?.exercises.find(entry => entry.id === props.target?.id) : undefined);
const materials = computed(() => props.state.unit?.materials.filter(entry => props.target?.kind === 'material' ? entry.id === props.target.id : question.value?.materialIds.includes(entry.id)) ?? []);
const exerciseId = computed(() => question.value?.id ?? props.state.unit?.exercises.find(entry => entry.skill === 'listening' && entry.materialIds.includes(props.target?.id ?? ''))?.id
    ?? props.state.unit?.exercises.find(entry => entry.materialIds.includes(props.target?.id ?? ''))?.id);
const paragraphs = computed(() => materials.value.filter(entry => question.value?.response.kind !== 'evidence' || entry.id === question.value.response.materialId).flatMap(entry => entry.paragraphs));
const attempt = computed(() => props.state.unit?.attempts.filter(entry => entry.exerciseId === question.value?.id).at(-1));
const feedback = computed(() => props.state.unit?.assessments.find(entry => entry.attemptId === attempt.value?.id));
watch(() => question.value, value => {
    if (!value) { return; }
    const response = JSON.stringify(value.response);
    if (drafts.value[value.id]?.response !== response) { drafts.value[value.id] = { response, value: createLearningAnswerDraft(value.response) }; }
}, { immediate: true });
const draft = computed({ get: () => drafts.value[question.value!.id].value,
    set: (value: LearningAnswerDraft) => { drafts.value[question.value!.id].value = value; } });
watch([() => props.active, closeButton], ([active, button]) => { if (active) { button?.focus({ preventScroll: true }); } }, { flush: 'post' });
onMounted(() => { if (body.value) { body.value.scrollTop = local.value.scroll; } });
onBeforeUnmount(() => { if (body.value) { local.value.scroll = body.value.scrollTop; } });
watch(() => props.state.unit?.attempts, attempts => {
    if (!submitting) { return; }
    const saved = attempts?.filter(entry => entry.exerciseId === submitting!.id).at(-1);
    if (saved && saved.id !== submitting.before) {
        const stillReading = props.target?.kind === 'exercise' && props.target.id === submitting.id;
        delete drafts.value[submitting.id]; submitting = null;
        if (stillReading) { emit('close'); }
    }
});
function submit(answer: LearningAnswer) {
    submitting = { id: question.value!.id, before: attempt.value?.id };
    drafts.value[question.value!.id].submitted = { before: attempt.value?.id };
    emit('action', 'submit', { unitId: props.state.unit!.id, exerciseId: question.value!.id, answer });
}
</script>

<template>
    <div ref="layer" class="learning-activity-shade" @keydown.esc.stop.prevent="back">
        <section role="dialog" aria-labelledby="learning-activity-title" class="learning-activity">
            <header class="learning-activity-header"><h2 id="learning-activity-title">{{ question ? '练习' : materials[0]?.title ?? '材料' }}</h2><small v-if="state.unit" aria-label="完成本课的固定奖励">+{{ state.unit.reward.amount }} 币</small><button ref="closeButton" type="button" aria-label="收起课件" @click="emit('close')">收起<LearningIcon name="back" /></button></header>
            <p v-if="state.message && !state.busy" class="learning-margin-note" role="status">{{ state.message }}</p>
            <div ref="body" class="learning-activity-body">
                <details v-if="question && materials.length" class="learning-activity-materials" :open="local.materialsOpen" @toggle="local.materialsOpen = ($event.target as HTMLDetailsElement).open"><summary>阅读材料 · {{ materials.length }}</summary><MaterialReader v-for="material in materials" :key="material.id" :material="material" :exercise-id="exerciseId" :disabled="disabled" @action="(name, input) => emit('action', name, input)" @select="selected = $event" /></details>
                <template v-else-if="!question"><MaterialReader v-for="material in materials" :key="material.id" :material="material" :exercise-id="exerciseId" :disabled="disabled" @action="(name, input) => emit('action', name, input)" @select="selected = $event" /></template>
                <LearningSelectionActions v-if="selected" :selection="selected" :disabled="disabled" @ask="emit('ask', exerciseId, selected)" @say="emit('action', 'say', { selection: selected })" @dismiss="selected = null" />
                <section v-if="question" class="learning-question">
                    <h2>{{ question.prompt }}</h2>
                    <div class="learning-help-actions"><button type="button" :disabled="disabled || [...question.prompt].length > 1000" @click="emit('action', 'say-question', { exerciseId: question.id })">听题干</button><button v-if="question.hasHint" type="button" :disabled="disabled || question.hint !== null" @click="emit('action', 'reveal', { kind: 'hints', id: question.id })">提示</button><button type="button" :disabled="disabled || question.solution !== null" @click="emit('action', 'reveal', { kind: 'answers', id: question.id })">解答</button><button type="button" @click="emit('ask', question.id)">问语伴</button></div>
                    <p v-if="question.hint" class="learning-margin-note">{{ question.hint }}</p>
                    <div v-if="question.solution" class="learning-margin-note"><p v-if="question.solution.kind === 'exact'">{{ learningAnswerText(question.solution.answer, question.response, paragraphs) }}</p><p v-else-if="question.solution.kind === 'gaps'">{{ question.solution.accepted.map(entry => entry.forms.join(' / ')).join('\n') }}</p><p v-if="question.solution.kind !== 'semantic'">{{ question.solution.explanation }}</p><button v-else type="button" @click="emit('ask', question.id)">请语伴讲解</button></div>
                    <AnswerInput v-if="(!attempt || retry) && drafts[question.id]" :key="question.id" v-model="draft" :response="question.response" :paragraphs="paragraphs" :disabled="disabled" @submit="submit" />
                    <AttemptFeedback v-if="attempt" :attempt="attempt" :feedback="feedback" :response="question.response" :paragraphs="paragraphs" :disabled="disabled" :reviewable="state.unit!.attemptActions[attempt.id].review" @action="(name, input) => { emit('action', name, input); emit('close'); }" />
                    <button v-if="attempt" type="button" :disabled="disabled" @click="retry = !retry; drafts[question.id] ??= { response: JSON.stringify(question.response), value: createLearningAnswerDraft(question.response) }">{{ retry ? '收起再练' : '再试一次' }}</button>
                </section>
            </div>
            <LearningPlayer :state="state" @action="(name, input) => emit('action', name, input)" />
        </section>
    </div>
</template>
