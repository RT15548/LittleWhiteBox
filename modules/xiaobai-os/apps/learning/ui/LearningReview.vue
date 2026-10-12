<script setup lang="ts">
import { computed, watch } from 'vue';
import type { LearningClientState } from '../types.js';
import type { LearningAnswer } from '../../../domains/learning/types.js';
import { learningAnswerText } from '../application/answer-text.js';
import AnswerInput from './AnswerInput.vue';
import LearningCompletion from './LearningCompletion.vue';
import { createLearningAnswerDraft } from './answer-draft.js';
import { learningSeeAgainLabel, learningSeenUnits } from './workbench.js';
import { useLearningUnitSession } from './learning-session.js';
import { LEARNING_DISCARD_COPY, LEARNING_REVIEW_COPY as copy } from './learning-copy.js';
import { learningActionAvailable } from '../application/action-availability.js';

type Unit = NonNullable<LearningClientState['review']>;
const props = defineProps<{ state: LearningClientState; review: Unit; disabled: boolean; pending: boolean }>();
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>]; confirm: [name: string, input: Record<string, unknown>, text: string]; ask: [exerciseId: string, unitId: string] }>();
const verdicts = copy.verdicts;
const stage = computed(() => props.review.stage.stage);
const attemptOf = (id: string) => props.review.attempts.filter(entry => entry.exerciseId === id).at(-1);
const firstOpen = () => Math.max(0, props.review.exercises.findIndex(entry => !attemptOf(entry.id)));
const session = useLearningUnitSession(() => props.review.id);
const local = computed(() => session.value.review);
const index = computed({ get: () => local.value.index ?? firstOpen(), set: value => { local.value.index = value; } });
const exercise = computed(() => props.review.exercises[index.value]);
const attempt = computed(() => exercise.value && attemptOf(exercise.value.id));
const assessment = computed(() => props.review.assessments.find(entry => entry.attemptId === attempt.value?.id));
const paragraphs = computed(() => props.review.materials.flatMap(material => material.paragraphs));
const drafts = computed(() => local.value.drafts);
watch([exercise, () => exercise.value && drafts.value[exercise.value.id]], ([value]) => {
    if (value && !drafts.value[value.id]) { drafts.value[value.id] = { value: createLearningAnswerDraft(value.response), retry: false }; }
}, { immediate: true });
const draft = computed({ get: () => drafts.value[exercise.value!.id].value, set: value => { drafts.value[exercise.value!.id].value = value; } });
const retrying = computed(() => !!exercise.value && !!drafts.value[exercise.value.id]?.retry);
const answered = computed(() => props.review.exercises.filter(entry => attemptOf(entry.id)).length);
const openReason = computed({ get: () => local.value.openReason, set: value => { local.value.openReason = value; } });

function submit(answer: LearningAnswer) {
    drafts.value[exercise.value!.id].submitted = { before: attempt.value?.id };
    emit('action', 'submit', { unitId: props.review.id, exerciseId: exercise.value!.id, answer });
}
function retry() {
    const value = exercise.value!;
    drafts.value[value.id] = { value: createLearningAnswerDraft(value.response), retry: !retrying.value };
}
function next() { const open = props.review.exercises.findIndex(entry => !attemptOf(entry.id)); if (open >= 0) { index.value = open; } }
function select(position: number) { index.value = position; expanded.value = true; }

// A finished group the learner already saw folds into one line and does not celebrate again; an unpaid reward stays open.
const completion = computed(() => props.state.completions.find(entry => entry.unitId === props.review.id));
const settled = computed(() => completion.value?.rewardStatus === 'paid' || completion.value?.rewardStatus === 'retired');
watch(local, value => { value.seenBefore ??= stage.value === 'complete' && learningSeenUnits.has(props.review.id); }, { immediate: true });
const seenBefore = computed(() => local.value.seenBefore ?? false);
const expanded = computed({ get: () => local.value.expanded, set: value => { local.value.expanded = value; } });
watch([stage, () => props.review.id], ([value, id]) => { if (value === 'complete') { learningSeenUnits.mark(id); } }, { immediate: true });
const folded = computed(() => seenBefore.value && settled.value && !expanded.value);
const item = (id?: string) => [...props.state.books.grammar, ...props.state.books.vocabulary].find(entry => entry.id === id);
</script>

<template>
    <section class="learning-review" :data-learning-unit-id="review.id" :data-exercise-id="exercise?.id" aria-labelledby="learning-review-title">
        <header class="learning-review-head">
            <h2 id="learning-review-title">今日复习</h2>
            <span class="learning-muted">{{ answered }} / {{ review.exercises.length }}</span>
            <button v-if="stage === 'answering'" type="button" :disabled="disabled || !learningActionAvailable('abandon-review', state)" @click="emit('confirm', 'abandon-review', {}, LEARNING_DISCARD_COPY.review)">放下</button>
        </header>
        <nav class="learning-review-dots" aria-label="复习卡片">
            <button
                v-for="(entry, position) in review.exercises" :key="entry.id" type="button" :aria-label="`第 ${position + 1} 张`" :aria-current="position === index"
                :class="{ 'is-answered': !!attemptOf(entry.id) }" @click="select(position)"
            />
        </nav>
        <template v-if="exercise && !folded">
            <div :key="`${exercise.id}:${attempt && !retrying ? 'back' : 'front'}`" class="learning-card" :class="{ 'is-back': !!attempt && !retrying }">
                <p class="learning-eyebrow">{{ attempt ? copy.answer : `第 ${index + 1} 张` }}</p>
                <h3>{{ exercise.prompt }}</h3>
                <AnswerInput v-if="!attempt || retrying" v-model="draft" :response="exercise.response" :paragraphs="paragraphs" :disabled="disabled || !learningActionAvailable('submit', state)" @submit="submit" />
                <template v-else>
                    <blockquote>{{ learningAnswerText(attempt.answer, exercise.response, paragraphs) }}</blockquote>
                    <template v-if="assessment">
                        <p class="learning-card-verdict">{{ verdicts[assessment.verdict] }}</p>
                        <p v-if="assessment.understanding">{{ assessment.understanding }}</p>
                        <p v-if="assessment.expression">{{ assessment.expression }}</p>
                        <p v-if="assessment.guidance">{{ assessment.guidance }}</p>
                    </template>
                    <small v-else>{{ copy.saved }}</small>
                    <button v-if="answered < review.exercises.length" type="button" class="learning-primary" @click="next">下一张</button>
                </template>
                <button v-if="attempt" type="button" :disabled="disabled || !learningActionAvailable('submit', state)" @click="retry">{{ retrying ? copy.cancelRetry : copy.retry }}</button>
                <button type="button" class="learning-review-ask" data-action="ask" :disabled="pending || !learningActionAvailable('talk', state)" @click="emit('ask', exercise.id, review.id)">{{ copy.ask }}</button>
            </div>
        </template>
        <div v-if="stage === 'grading'" class="learning-working" role="status">
            <template v-if="state.pending?.purpose === 'review-assess'"><span class="learning-working-dot" aria-hidden="true" /><span>正在批改这组复习…</span><button type="button" :disabled="pending" @click="emit('action', 'cancel')">停止</button></template>
            <template v-else>
                <span>{{ copy.ready }}</span>
                <button type="button" :disabled="disabled || !learningActionAvailable('abandon-review', state)" @click="emit('confirm', 'abandon-review', {}, LEARNING_DISCARD_COPY.review)">放下</button>
                <button type="button" :disabled="disabled || !learningActionAvailable('grade', state)" @click="emit('action', 'grade', { unitId: review.id })">{{ copy.grade }}</button>
            </template>
        </div>
        <div v-if="stage === 'complete' && folded" class="learning-row">
            <span class="learning-muted">这组复习已完成</span>
            <button type="button" :aria-expanded="false" @click="expanded = true">查看结果</button>
        </div>
        <template v-else-if="stage === 'complete'">
            <ul class="learning-review-results">
                <li v-for="(entry, position) in review.exercises" :key="entry.id">
                    <button type="button" class="learning-review-result" :aria-current="position === index" @click="select(position)"><strong>{{ item(entry.itemId)?.label ?? entry.prompt }}</strong><small>{{ verdicts[review.assessments.find(value => value.attemptId === attemptOf(entry.id)?.id)?.verdict ?? 'disputed'] }}</small></button>
                    <button
                        v-if="item(entry.itemId)?.nextReviewAt" type="button" class="learning-chip" :aria-expanded="openReason === entry.id"
                        @click="openReason = openReason === entry.id ? '' : entry.id"
                    >
                        {{ learningSeeAgainLabel(item(entry.itemId)!.nextReviewAt!) }}
                    </button>
                    <small v-if="openReason === entry.id" class="learning-chip-reason">{{ item(entry.itemId)?.scheduleReason }}</small>
                </li>
            </ul>
            <LearningCompletion :state="state" :unit-id="review.id" :amount="review.reward.amount" label="复习完成" :disabled="disabled" :quiet="seenBefore" @action="(name, input) => emit('action', name, input)" />
        </template>
    </section>
</template>
