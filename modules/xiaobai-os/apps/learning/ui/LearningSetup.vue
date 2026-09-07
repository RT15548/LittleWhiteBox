<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import type { LearningClientState } from '../types.js';
import LearningIcon from './LearningIcon.vue';
defineProps<{ state: LearningClientState; disabled: boolean }>();
const emit = defineEmits<{ action: [name: string, input: Record<string, unknown>]; done: [] }>();
const step = ref(0);
const heading = ref<HTMLElement | null>(null);
const name = ref('');
const languages = [['en', '英语', 'Aa'], ['ja', '日语', 'あ'], ['ko', '韩语', '한'], ['fr', '法语', 'Ç'], ['de', '德语', 'ß'], ['es', '西班牙语', 'Ñ'], ['zh-CN', '中文', '文']];
async function go(value: number) { step.value = value; await nextTick(); heading.value?.focus(); }
useAppBack(() => { if (!step.value) { return false; } void go(0); return true; });
</script>

<template>
    <section class="learning-profile-page">
        <div class="learning-setup-heading"><h1 ref="heading" tabindex="-1">{{ step === 0 ? '选择要学习的语言' : '选择老师' }}</h1></div>
        <template v-if="step === 0">
            <div class="learning-language-options"><button v-for="[code, label, glyph] in languages" :key="code" type="button" :disabled="disabled" :aria-pressed="state.language === code" @click="emit('action', 'language', { language: code })"><span aria-hidden="true">{{ glyph }}</span><strong>{{ label }}</strong><LearningIcon v-if="state.language === code" name="check" /></button></div>
            <button type="button" class="learning-primary learning-setup-next" :disabled="disabled" @click="go(1)">继续<LearningIcon name="arrow" /></button>
        </template>
        <template v-else>
            <div class="learning-teacher-options"><button v-for="person in state.candidates" :key="person.name" type="button" :disabled="disabled" :aria-pressed="state.teacher?.name === person.name" @click="emit('action', 'teacher', { teacher: { name: person.name, note: '' } })"><span class="learning-person-initial">{{ [...person.name][0] }}</span><strong>{{ person.name }}</strong><LearningIcon v-if="state.teacher?.name === person.name" name="check" /></button></div>
            <p v-if="state.teacher && !state.candidates.some(person => person.name === state.teacher?.name)" class="learning-selected-teacher"><span class="learning-person-initial">{{ [...state.teacher.name][0] }}</span>{{ state.teacher.name }}<LearningIcon name="check" /></p>
            <details class="learning-other-teacher" :open="!state.candidates.length && !state.teacher"><summary>选择其他人物</summary><form class="learning-row" @submit.prevent="emit('action', 'teacher', { teacher: { name: name.trim(), note: '' } })"><input v-model="name" type="text" aria-label="其他人物名字" maxlength="80" placeholder="输入人物名字" :disabled="disabled"><button type="submit" :disabled="disabled || !name.trim()">选这位</button></form></details>
            <div class="learning-setup-actions"><button type="button" :disabled="disabled" @click="go(0)">上一步</button><button type="button" class="learning-primary" :disabled="disabled || !state.teacher" @click="emit('done')">和老师聊聊<LearningIcon name="arrow" /></button></div>
        </template>
    </section>
</template>
