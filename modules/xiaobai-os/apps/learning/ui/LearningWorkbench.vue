<script setup lang="ts">
import { computed } from 'vue';
import type { LearningClientState } from '../types.js';
import type { LearningPresentation } from '../application/presentation.js';
import LearningIcon from './LearningIcon.vue';
import LearningReading from './LearningReading.vue';
import LearningReview from './LearningReview.vue';
import LearningPreparation from './LearningPreparation.vue';
import LearningCourseSharing from './LearningCourseSharing.vue';
import { LEARNING_DISCARD_COPY, LEARNING_DUE_LABEL } from './learning-copy.js';
import type { LearningSelection } from '../../../domains/learning/notes.js';
import { learningActionAvailable } from '../application/action-availability.js';

const props = defineProps<{ state: LearningClientState; disabled: boolean; pending: boolean; preparationInProcess?: boolean }>();
const blocked = (name: string) => props.disabled || !learningActionAvailable(name, props.state);
const emit = defineEmits<{
    action: [name: string, input?: Record<string, unknown>]; confirm: [name: string, input: Record<string, unknown>, text: string];
    present: [target: LearningPresentation]; go: [page: 'books' | 'materials' | 'profile' | 'settings'];
    ask: [exerciseId: string | undefined, selection?: LearningSelection, unitId?: string];
    assistant: [exerciseId: string, unitId: string];
    record: [id: string];
}>();
const reviewOpen = computed(() => !!props.state.review && props.state.review.stage.stage !== 'complete');
const unit = computed(() => props.state.unit);
const starting = computed(() => !unit.value || props.state.completions.some(entry => entry.unitId === unit.value?.id));
const preparing = computed(() => props.state.busy && !props.state.pending);
const copy = {
    start: '开始读写', reading: '读写练习', readingHint: '读一篇文章，写下你的看法', lesson: '专项练习', lessonHint: '练语法、词汇或听力',
    select: '选择语伴', selectFirst: '先选一位语伴', next: '接下来',
    settings: '学习设置', complete: '完成练习', notes: '笔记', review: '开始复习',
};
const settingSummary = computed(() => [
    new Intl.DisplayNames(['zh-CN'], { type: 'language' }).of(props.state.language),
    props.state.profile?.settings.exam,
    [props.state.profile?.settings.level, props.state.profile?.settings.targetLevel].filter(Boolean).join(' → '),
].filter(Boolean).join(' · '));
function prepare(kind: 'reading-writing' | 'lesson') {
    emit('action', 'prepare', { kind, message: kind === 'reading-writing' ? '请按我的训练设置准备一篇读写训练。' : '请按我现在的情况准备一节专项小课。' });
}
const forward = (name: string, input?: Record<string, unknown>) => emit('action', name, input);
const ask = (name: string, input: Record<string, unknown>, text: string) => emit('confirm', name, input, text);
</script>

<template>
    <div class="learning-workbench">
        <LearningPreparation v-if="!preparationInProcess && (!state.sourceChoice || !starting)" :state="state" :disabled="disabled" :pending="pending" @action="forward" />
        <div v-if="state.dueCount && !reviewOpen" class="learning-due">
            <span>{{ LEARNING_DUE_LABEL(state.dueCount) }}</span>
            <span v-if="state.pending?.purpose === 'review-prepare'" class="learning-working" role="status">
                <span class="learning-working-dot" aria-hidden="true" /><span>正在出题…</span><button type="button" :disabled="pending" @click="emit('action', 'cancel')">停止</button>
            </span>
            <button v-else-if="!state.blockedReview" type="button" class="learning-primary" :disabled="blocked('start-review')" @click="emit('action', 'start-review')">{{ copy.review }}</button>
        </div>
        <div v-if="state.blockedReview" class="learning-row">
            <p class="learning-muted">有一组复习在另一个故事中进行。回到那个故事可以接着做；也可以放下它，在这里重新出题。</p>
            <button type="button" :disabled="blocked('abandon-review')" @click="ask('abandon-review', {}, LEARNING_DISCARD_COPY.review)">放下</button>
        </div>
        <LearningCourseSharing v-if="state.review" :state="state" :unit="state.review" :disabled="disabled" @confirm="ask" />
        <LearningReview v-if="state.review" :state="state" :review="state.review" :disabled="disabled" :pending="pending" @action="forward" @confirm="ask" @ask="(id, unitId) => emit('ask', id, undefined, unitId)" />

        <LearningCourseSharing v-if="unit" :state="state" :unit="unit" :disabled="disabled" @confirm="ask" />
        <LearningReading v-if="unit?.kind === 'reading-writing'" :data-learning-unit-id="unit.id" :state="state" :unit="unit" :disabled="disabled" :pending="pending" @action="forward" @confirm="ask" @ask="(id, selection) => emit('ask', id, selection, unit!.id)" @assistant="id => emit('assistant', id, unit!.id)" @record="id => emit('record', id)" />
        <section v-else-if="unit" class="learning-lesson" :data-learning-unit-id="unit.id">
            <p class="learning-eyebrow">专项小课 · 完成可得 {{ unit.reward.amount }} 小白币</p>
            <h1 tabindex="-1">{{ unit.title }}</h1>
            <p v-if="unit.goal" class="learning-muted">{{ unit.goal }}</p>
            <button v-for="material in unit.materials" :key="material.id" type="button" class="learning-activity-link" @click="emit('present', { unitId: unit.id, kind: 'material', id: material.id, title: material.title })"><LearningIcon name="book" /><span>{{ material.title }}</span><LearningIcon name="arrow" /></button>
            <button v-for="exercise in unit.exercises" :key="exercise.id" type="button" class="learning-activity-link" @click="emit('present', { unitId: unit.id, kind: 'exercise', id: exercise.id, title: exercise.prompt })">
                <LearningIcon :name="unit.stage.exercises.find(row => row.exerciseId === exercise.id)?.status === 'done' ? 'check' : 'records'" /><span>{{ exercise.prompt }}</span><LearningIcon name="arrow" />
            </button>
            <div class="learning-row"><button type="button" :disabled="blocked('complete')" @click="emit('action', 'complete')">{{ copy.complete }}</button><button type="button" @click="emit('go', 'materials')">{{ copy.notes }}</button></div>
        </section>

        <section v-if="starting" class="learning-start">
            <template v-if="state.blockedUnit">
                <h1 tabindex="-1">当前课件在另一个故事中</h1>
                <p class="learning-muted">回到那个故事可以继续；也可以放下它，在这里重新开始。</p>
                <button type="button" :disabled="blocked('abandon')" @click="ask('abandon', {}, LEARNING_DISCARD_COPY.lesson)">放下并重新开始</button>
            </template>
            <template v-else>
                <h1 v-if="!unit" tabindex="-1">{{ copy.reading }}</h1>
                <h2 v-else>{{ copy.next }}</h2>
                <button v-if="!unit" type="button" class="learning-start-preference" :aria-label="`${copy.settings}：${settingSummary}`" @click="emit('go', 'settings')"><span><strong>{{ copy.settings }}</strong><small>{{ settingSummary }}</small></span><LearningIcon name="arrow" /></button>
                <LearningPreparation v-if="state.sourceChoice && !preparationInProcess" :state="state" :disabled="disabled" :pending="pending" @action="forward" />
                <template v-if="!preparing && !state.sourceChoice">
                    <section class="learning-start-reading">
                        <LearningIcon name="workbook" />
                        <p>{{ copy.readingHint }}</p>
                        <button type="button" class="learning-primary" :disabled="blocked('prepare')" @click="prepare('reading-writing')">{{ copy.start }}<LearningIcon name="arrow" /></button>
                    </section>
                    <button type="button" class="learning-start-secondary" :disabled="blocked('prepare')" @click="prepare('lesson')"><LearningIcon name="records" /><span><strong>{{ copy.lesson }}</strong><small>{{ copy.lessonHint }}</small></span><LearningIcon name="arrow" /></button>
                </template>
            </template>
        </section>
    </div>
</template>
