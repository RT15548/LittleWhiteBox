<script setup lang="ts">
import { nextTick, ref, toRef } from 'vue';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import type { LearningClientState } from '../types.js';
import LearningIcon from './LearningIcon.vue';
import LearningSettingsCard from './LearningSettingsCard.vue';
import { LEARNING_FLOW_COPY as copy, LEARNING_DIALOGUE_COPY as dialogueCopy } from './learning-copy.js';
import { useLearningUiSession } from './learning-session.js';
defineProps<{ state: LearningClientState; disabled: boolean }>();
const emit = defineEmits<{ action: [name: string, input: Record<string, unknown>] }>();
const session = useLearningUiSession().setup;
const step = toRef(session, 'step');
const heading = ref<HTMLElement | null>(null);
const name = toRef(session, 'name');
const note = toRef(session, 'note');
const languages = [['en', '英语', 'Aa'], ['ja', '日语', 'あ'], ['ko', '韩语', '한'], ['fr', '法语', 'Ç'], ['de', '德语', 'ß'], ['es', '西班牙语', 'Ñ'], ['zh-CN', '中文', '文']];
async function go(value: number) { step.value = value; await nextTick(); heading.value?.focus(); }
useAppBack(() => { if (!step.value) { return false; } void go(step.value - 1); return true; });
</script>

<template>
    <section class="learning-profile-page">
        <div class="learning-setup-heading"><p class="learning-eyebrow">{{ step + 1 }} / {{ copy.setupSteps }}</p><h1 ref="heading" tabindex="-1">{{ step === 0 ? '选择要学习的语言' : step === 1 ? '选择语伴' : copy.setupTitle }}</h1></div>
        <template v-if="step === 0">
            <div class="learning-language-options"><button v-for="[code, label, glyph] in languages" :key="code" type="button" :disabled="disabled" :aria-pressed="state.language === code" @click="emit('action', 'language', { language: code })"><span aria-hidden="true">{{ glyph }}</span><strong>{{ label }}</strong><LearningIcon v-if="state.language === code" name="check" /></button></div>
            <button type="button" class="learning-primary learning-setup-next" :disabled="disabled" @click="go(1)">继续<LearningIcon name="arrow" /></button>
        </template>
        <template v-else-if="step === 1">
            <p v-if="!state.candidates.length" class="learning-setup-empty">当前故事里还没有认识的人物，所以没有可选的语伴。可以在下面手动填一位：名字加一句身份说明。</p>
            <div class="learning-teacher-options"><button v-for="person in state.candidates" :key="person.name" type="button" :disabled="disabled" :aria-pressed="state.teacher?.name === person.name" @click="emit('action', 'teacher', { teacher: { name: person.name, note: '' } })"><span class="learning-person-initial">{{ [...person.name][0] }}</span><strong>{{ person.name }}</strong><LearningIcon v-if="state.teacher?.name === person.name" name="check" /></button></div>
            <p v-if="state.teacher && !state.candidates.some(person => person.name === state.teacher?.name)" class="learning-selected-teacher"><span class="learning-person-initial">{{ [...state.teacher.name][0] }}</span><span>{{ state.teacher.name }}<small v-if="state.teacher.note">{{ state.teacher.note }}</small></span><LearningIcon name="check" /></p>
            <details class="learning-other-teacher" :open="!state.candidates.length">
                <summary>{{ state.candidates.length ? '手动填写其他人物' : '手动填写' }}</summary>
                <form class="learning-fields" @submit.prevent="emit('action', 'teacher', { teacher: { name: name.trim(), note: note.trim() } })">
                    <label>名字<input v-model="name" type="text" maxlength="80" placeholder="例如 林老师" :disabled="disabled"></label>
                    <label>一句身份说明<input v-model="note" type="text" maxlength="200" placeholder="例如 在东京长大的邻居，说话直爽" :disabled="disabled"></label>
                    <button type="submit" :disabled="disabled || !name.trim()">选这位</button>
                </form>
            </details>
            <div class="learning-setup-actions"><button type="button" :disabled="disabled" @click="go(0)">上一步</button><button type="button" class="learning-primary" :disabled="disabled" @click="go(2)">{{ state.teacher ? copy.setupContinue : dialogueCopy.skipCompanion }}<LearningIcon name="arrow" /></button></div>
        </template>
        <LearningSettingsCard v-else onboarding :state="state" :disabled="disabled" @action="(name, input) => emit('action', name, input ?? {})" />
    </section>
</template>
