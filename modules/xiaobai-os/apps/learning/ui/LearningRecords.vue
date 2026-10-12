<script setup lang="ts">
import type { LearningClientState } from '../types.js';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import AttemptFeedback from './AttemptFeedback.vue';
import { learningSeeAgainLabel } from './workbench.js';
import { LEARNING_MASTERY_LABELS as labels, LEARNING_EVIDENCE_LABEL } from './learning-copy.js';
import { LEARNING_WORK_COPY } from '../../../domains/learning/work.js';
const props = defineProps<{ state: LearningClientState; disabled: boolean; embedded?: boolean }>();
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>]; remove: [name: string, input: Record<string, unknown>, message: string] }>();
useAppBack(() => {
    if (!props.state.record) { return false; }
    emit('action', 'records', { offset: props.state.records.offset }); return true;
});
const copy = {
    deleteAnswer: '删除这次作答', deleteRecord: '删除记录',
    answerWarning: '这次作答和对应的反馈会删除，相关知识点的掌握情况会更新。已到账奖励保留。',
    recordWarning: '这条学习记录会删除，仅属于它的历史作答也会删除。当前练习不受影响。',
    hidden: '听力原文暂未显示，下面是你的作答和点评。',
};
</script>

<template>
    <section class="learning-records-page">
        <div v-if="!embedded || state.record" class="learning-page-heading"><h1>学习记录</h1><span v-if="state.records.total" class="learning-muted">{{ state.records.total }} 项</span></div>
        <template v-if="state.record">
            <button type="button" @click="$emit('action', 'records', { offset: state.records.offset })">‹ 返回记录</button>
            <h2>{{ state.record.label }}</h2>
            <article v-for="evidence in state.record.evidence" :key="evidence.attempt.id" class="learning-record-evidence">
                <p class="learning-muted">{{ new Date(evidence.attempt.submittedAt).toLocaleDateString() }}</p><h3>{{ evidence.exercise.prompt }}</h3>
                <details v-for="material in evidence.materials" :key="material.id">
                    <summary>{{ material.title }}</summary>
                    <p v-if="material.hidden" class="learning-muted">{{ copy.hidden }}</p>
                    <p v-for="paragraph in material.paragraphs" v-else :key="paragraph.id">{{ paragraph.text }}</p>
                </details>
                <AttemptFeedback
                    :attempt="evidence.attempt" :feedback="evidence.assessment" :response="evidence.exercise.response" :paragraphs="evidence.materials.flatMap(material => material.paragraphs)" :disabled="disabled"
                    :reviewable="evidence.actions.review"
                    @action="(name, input) => $emit('action', name, input)"
                />
                <button type="button" :disabled="disabled || !evidence.actions.remove" @click="$emit('remove', 'delete-attempt', { id: evidence.attempt.id }, copy.answerWarning)">{{ copy.deleteAnswer }}</button>
                <p v-if="!evidence.actions.remove" class="learning-muted">{{ LEARNING_WORK_COPY.hiddenRevisions }}</p>
            </article>
            <button type="button" :disabled="disabled" @click="$emit('remove', 'delete-item', { id: state.record.id }, copy.recordWarning)">{{ copy.deleteRecord }}</button>
        </template>
        <template v-else>
            <p v-if="!state.records.total" class="learning-empty-note">暂无学习记录</p>
            <button
                v-for="item in state.records.items" :key="item.id" class="learning-record-row" type="button" :disabled="!item.readable"
                @click="$emit('action', 'records', { id: item.id, offset: state.records.offset })"
            >
                <span><strong>{{ item.label }}</strong><small>{{ LEARNING_EVIDENCE_LABEL(item.evidenceCount) }}<span v-if="item.nextReviewAt" :title="item.scheduleReason ?? undefined"> · {{ learningSeeAgainLabel(item.nextReviewAt) }}（{{ new Date(item.nextReviewAt).toLocaleDateString() }}）</span></small></span><em>{{ labels[item.state] }}</em>
            </button>
            <div v-if="state.records.total > 30" class="learning-row">
                <button type="button" :disabled="state.records.offset === 0" @click="$emit('action', 'records', { offset: Math.max(0, state.records.offset - 30) })">上一页</button>
                <span class="learning-muted">{{ state.records.total }} 项</span><button type="button" :disabled="state.records.offset + 30 >= state.records.total" @click="$emit('action', 'records', { offset: state.records.offset + 30 })">下一页</button>
            </div>
        </template>
    </section>
</template>
