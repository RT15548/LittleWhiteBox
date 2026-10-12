<script setup lang="ts">
import { computed, toRef } from 'vue';
import type { LearningClientState } from '../types.js';
import LearningRecords from './LearningRecords.vue';
import { learningSeeAgainLabel } from './workbench.js';
import { useLearningUiSession } from './learning-session.js';
import { LEARNING_MASTERY_LABELS as labels, LEARNING_EVIDENCE_LABEL, LEARNING_DUE_LABEL, LEARNING_FLOW_COPY as flow } from './learning-copy.js';

const props = defineProps<{ state: LearningClientState; disabled: boolean }>();
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>]; review: []; remove: [name: string, input: Record<string, unknown>, message: string] }>();
type Tab = 'grammar' | 'vocabulary' | 'growth' | 'all';
const session = useLearningUiSession().books;
const tab = toRef(session, 'tab');
const tabs: [Tab, string][] = [['grammar', '语法本'], ['vocabulary', '生词本'], ['growth', '成长'], ['all', '全部记录']];
const copy = { title: '学习本' };
const reason = toRef(session, 'reason');
const items = computed(() => tab.value === 'grammar' || tab.value === 'vocabulary' ? props.state.books[tab.value] : []);
const growth = computed(() => props.state.growth);
const reviewOpen = computed(() => !!props.state.review && props.state.review.stage.stage !== 'complete');
</script>

<template>
    <section class="learning-books-page">
        <LearningRecords v-if="state.record" :state="state" :disabled="disabled" @action="(name, input) => emit('action', name, input)" @remove="(name, input, message) => emit('remove', name, input, message)" />
        <template v-else>
            <div class="learning-page-heading"><h1>{{ copy.title }}</h1></div>
            <div v-if="state.dueCount || reviewOpen" class="learning-due">
                <span v-if="state.dueCount">{{ LEARNING_DUE_LABEL(state.dueCount) }}</span>
                <small v-if="state.blockedReview">有一组复习在另一个故事中进行，回到学习页可以放下它</small>
                <button v-else-if="!reviewOpen" type="button" class="learning-primary" :disabled="disabled" @click="emit('action', 'start-review')">{{ flow.review }}</button>
                <button v-else type="button" class="learning-primary" @click="emit('review')">{{ flow.resumeReview }}</button>
            </div>
            <div class="learning-tabs" role="tablist" aria-label="学习记录视图">
                <button v-for="[id, label] in tabs" :key="id" type="button" role="tab" :aria-selected="tab === id" @click="tab = id; reason = ''">{{ label }}</button>
            </div>
            <template v-if="tab === 'grammar' || tab === 'vocabulary'">
                <p v-if="!items.length" class="learning-empty-note">{{ tab === 'grammar' ? '批改里出现的语法问题会记到这里。' : '批改里的词汇问题、读文章时收藏的词语会记到这里。' }}</p>
                <ul class="learning-book-list">
                    <li v-for="item in items" :key="item.id">
                        <button type="button" class="learning-book-item" :disabled="!item.readable" @click="emit('action', 'records', { id: item.id, offset: state.records.offset })">
                            <strong>{{ item.label }}</strong>
                            <small>{{ labels[item.state] }} · {{ LEARNING_EVIDENCE_LABEL(item.evidenceCount) }}</small>
                        </button>
                        <button v-if="item.nextReviewAt" type="button" class="learning-chip" :aria-expanded="reason === item.id" @click="reason = reason === item.id ? '' : item.id">{{ learningSeeAgainLabel(item.nextReviewAt) }}</button>
                        <small v-if="reason === item.id" class="learning-chip-reason">{{ item.scheduleReason }}</small>
                    </li>
                </ul>
            </template>
            <section v-else-if="tab === 'growth'" class="learning-growth">
                <p v-if="!growth.enough" class="learning-empty-note">还需要几次练习才看得出</p>
                <template v-else>
                    <p class="learning-muted">来自 {{ growth.evidence }} 份作答<span v-if="growth.completed">、{{ growth.completed }} 次完成</span></p>
                    <div v-if="growth.steady.length"><h2>已经稳定</h2><p>{{ growth.steady.join('、') }}</p></div>
                    <div v-if="growth.practising.length"><h2>最近独立做对</h2><p>{{ growth.practising.join('、') }}</p></div>
                    <div v-if="growth.struggling.length"><h2>还要再练</h2><p>{{ growth.struggling.join('、') }}</p></div>
                </template>
            </section>
            <LearningRecords v-else embedded :state="state" :disabled="disabled" @action="(name, input) => emit('action', name, input)" @remove="(name, input, message) => emit('remove', name, input, message)" />
        </template>
    </section>
</template>
