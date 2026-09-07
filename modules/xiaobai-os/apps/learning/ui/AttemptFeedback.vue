<script setup lang="ts">
import type { LearningAssessment, LearningAttempt, LearningResponse } from '../../../domains/learning/types.js';
import { learningAnswerText } from '../application/answer-text.js';
defineProps<{ attempt: LearningAttempt; feedback?: LearningAssessment; response: LearningResponse; paragraphs?: { id: string; text: string }[]; disabled: boolean }>();
defineEmits<{ action: [name: string, input: Record<string, unknown>] }>();
const verdicts = { correct: '答对了', partial: '已经掌握一部分', incorrect: '一起把这里弄懂', disputed: '这处还需复核' };
</script>

<template>
    <section class="learning-feedback">
        <p class="learning-eyebrow">已保存的原答</p><blockquote>{{ learningAnswerText(attempt.answer, response, paragraphs) }}</blockquote>
        <small class="learning-muted">{{ attempt.help.feedback ? '得到反馈后的再练' : attempt.help.answer || attempt.help.hint || attempt.help.transcript ? '这次有辅助' : '未使用答案或提示' }}<span v-if="attempt.help.replays"> · 重听 {{ attempt.help.replays }} 次</span><span v-if="attempt.help.slowPlayback"> · 慢放</span></small>
        <template v-if="feedback">
            <h3>{{ verdicts[feedback.verdict] }}</h3>
            <p v-if="feedback.understanding"><b>理解</b>{{ feedback.understanding }}</p>
            <p v-if="feedback.expression"><b>表达</b>{{ feedback.expression }}</p>
            <p v-if="feedback.guidance"><b>批注</b>{{ feedback.guidance }}</p>
            <button type="button" :disabled="disabled" @click="$emit('action', 'assess', { attemptId: attempt.id, review: true, message: '请重新审视我的原答与题目。也请考虑其他有效表达，不只对照原来的答案键。' })">{{ feedback.verdict === 'disputed' ? '请老师复核' : '有疑问，请复核' }}</button>
        </template>
        <template v-else>
            <p>原答已保存，等待老师评估。</p>
            <button type="button" :disabled="disabled" @click="$emit('action', 'assess', { attemptId: attempt.id, review: false, message: '请评估这条已经保存的原答。' })">重试评估</button>
        </template>
    </section>
</template>
