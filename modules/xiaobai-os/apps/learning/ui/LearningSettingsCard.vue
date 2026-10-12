<script setup lang="ts">
import { computed, toRef } from 'vue';
import type { LearningClientState } from '../types.js';
import { learningSettingsInput, useLearningUiSession } from './learning-session.js';
import { LEARNING_FLOW_COPY as copy } from './learning-copy.js';

const props = defineProps<{ state: LearningClientState; disabled: boolean; onboarding?: boolean }>();
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>] }>();
const explanationLanguages = [['zh-CN', '中文'], ['en', 'English'], ['ja', '日本語'], ['ko', '한국어']] as const;
const settings = computed(() => props.state.profile?.settings ?? null);
const session = useLearningUiSession().settings;
const form = session.form;
const open = toRef(session, 'open');
function reset() {
    Object.assign(form, { exam: settings.value?.exam ?? '', level: settings.value?.level ?? '', targetLevel: settings.value?.targetLevel ?? '',
        explanationLanguage: settings.value?.explanationLanguage ?? 'zh-CN', interests: settings.value?.interests ?? '' });
}
if (props.onboarding && !session.open) { reset(); session.open = true; }
const languageName = (code: string) => explanationLanguages.find(([value]) => value === code)?.[1] ?? new Intl.DisplayNames(['zh-CN'], { type: 'language' }).of(code) ?? code;
const languageOptions = computed(() => [...new Set([...explanationLanguages.map(([code]) => code), settings.value?.explanationLanguage ?? 'zh-CN'])]);
const summary = computed(() => [
    ['考试', settings.value?.exam || '不备考'], ['水平', settings.value?.level || '不确定'], ['目标', settings.value?.targetLevel || '比现在高一级'],
    ['讲解', languageName(settings.value?.explanationLanguage ?? 'zh-CN')], ['兴趣', settings.value?.interests || '不限'],
]);
function save() {
    const value = learningSettingsInput(form);
    session.submitted = { value, form: { ...form } };
    emit('action', 'settings', { value });
}
</script>

<template>
    <section class="learning-settings-card" aria-label="训练设置">
        <dl v-if="!open"><div v-for="[label, value] in summary" :key="label"><dt>{{ label }}</dt><dd>{{ value }}</dd></div></dl>
        <button v-if="!open" type="button" :disabled="disabled" @click="reset(); open = true">调整</button>
        <form v-else class="learning-fields" @submit.prevent="save">
            <label>考试<input v-model="form.exam" type="text" maxlength="80" placeholder="不备考（例如 雅思、JLPT N2）"></label>
            <label>现在的水平<input v-model="form.level" type="text" maxlength="80" placeholder="不确定"></label>
            <label>目标<input v-model="form.targetLevel" type="text" maxlength="80" placeholder="比现在高一级"></label>
            <details class="learning-settings-optional" :open="!onboarding">
                <summary>{{ copy.optionalSettings }}</summary>
                <label>讲解语言<select v-model="form.explanationLanguage"><option v-for="code in languageOptions" :key="code" :value="code">{{ languageName(code) }}</option></select></label>
                <label>感兴趣的话题<input v-model="form.interests" type="text" maxlength="200" placeholder="不限"></label>
            </details>
            <div class="learning-row"><button v-if="!onboarding" type="button" @click="open = false; session.submitted = null">取消</button><button type="submit" class="learning-primary" :disabled="disabled">{{ onboarding ? copy.setupFinish : copy.saveSettings }}</button></div>
        </form>
    </section>
</template>
