<script setup lang="ts">
import type { LearningClientState } from '../types.js';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import AttemptFeedback from './AttemptFeedback.vue';
const props = defineProps<{ state: LearningClientState; disabled: boolean }>();
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>]; remove: [name: string, input: Record<string, unknown>, message: string] }>();
useAppBack(() => {
    if (!props.state.record) { return false; }
    emit('action', 'records', { offset: props.state.records.offset }); return true;
});
const labels = { unassessed: '尚待练习', review: '待复核', independent: '已能独立使用', practised: '练过一次', strengthen: '再练练' };
</script>

<template>
    <section class="learning-records-page">
        <div class="learning-page-heading"><h1>学习记录</h1><span v-if="state.records.total" class="learning-muted">{{ state.records.total }} 项</span></div>
        <template v-if="state.record">
            <button type="button" @click="$emit('action', 'records', { offset: state.records.offset })">‹ 返回记录</button>
            <h2>{{ state.record.label }}</h2>
            <article v-for="evidence in state.record.evidence" :key="evidence.attempt.id" class="learning-record-evidence">
                <p class="learning-muted">{{ new Date(evidence.attempt.submittedAt).toLocaleDateString() }}</p><h3>{{ evidence.exercise.prompt }}</h3>
                <details v-for="material in evidence.materials" :key="material.id">
                    <summary>{{ material.title }}</summary>
                    <p v-if="material.hidden" class="learning-muted">听力文稿尚未展开；原答和反馈如下。</p>
                    <p v-for="paragraph in material.paragraphs" v-else :key="paragraph.id">{{ paragraph.text }}</p>
                </details>
                <AttemptFeedback
                    :attempt="evidence.attempt" :feedback="evidence.assessment" :response="evidence.exercise.response" :paragraphs="evidence.materials.flatMap(material => material.paragraphs)" :disabled="disabled"
                    @action="(name, input) => $emit('action', name, input)"
                />
                <button type="button" :disabled="disabled" @click="$emit('remove', 'delete-attempt', { id: evidence.attempt.id }, '删除这条原答和依赖它的反馈？相关学习项会重新计算，不撤回已到账奖励。')">删除这条原答</button>
            </article>
            <button type="button" :disabled="disabled" @click="$emit('remove', 'delete-item', { id: state.record.id }, '删除这个学习项及其不再被引用的证据？当前课程不会被删除。')">删除学习项</button>
        </template>
        <template v-else>
            <p v-if="!state.records.total" class="learning-empty-note">暂无学习记录</p>
            <button
                v-for="item in state.records.items" :key="item.id" class="learning-record-row" type="button" :disabled="!item.readable"
                @click="$emit('action', 'records', { id: item.id, offset: state.records.offset })"
            >
                <span><strong>{{ item.label }}</strong><small>{{ item.evidenceCount }} 份作答依据<span v-if="item.nextReviewAt"> · 建议 {{ new Date(item.nextReviewAt).toLocaleDateString() }} 再练</span></small></span><em>{{ labels[item.state] }}</em>
            </button>
            <div v-if="state.records.total > 30" class="learning-row">
                <button type="button" :disabled="state.records.offset === 0" @click="$emit('action', 'records', { offset: Math.max(0, state.records.offset - 30) })">上一页</button>
                <span class="learning-muted">{{ state.records.total }} 项</span><button type="button" :disabled="state.records.offset + 30 >= state.records.total" @click="$emit('action', 'records', { offset: state.records.offset + 30 })">下一页</button>
            </div>
        </template>
    </section>
</template>
