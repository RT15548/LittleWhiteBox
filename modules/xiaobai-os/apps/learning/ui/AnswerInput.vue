<script setup lang="ts">
import { computed } from 'vue';
import type { LearningAnswer, LearningResponse } from '../../../domains/learning/types.js';
import type { LearningAnswerDraft } from './answer-draft.js';
import { rememberLearningEditor as vRememberEditor } from './learning-editor.js';
const props = defineProps<{ response: LearningResponse; paragraphs: { id: string; text: string }[]; disabled: boolean }>();
const emit = defineEmits<{ submit: [answer: LearningAnswer] }>();
const draft = defineModel<LearningAnswerDraft>({ required: true });
function choose(id: string) {
    if (props.response.kind === 'choice' && !props.response.multiple) { draft.value.picked = [id]; }
    else { draft.value.picked = draft.value.picked.includes(id) ? draft.value.picked.filter(value => value !== id) : [...draft.value.picked, id]; }
}
function move(index: number, delta: number) {
    const next = [...draft.value.order]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; draft.value.order = next;
}
const ready = computed(() => {
    const response = props.response;
    if (response.kind === 'text') { return !!draft.value.text.trim(); }
    if (response.kind === 'gaps') { return response.slots.every(slot => draft.value.values[slot.id]?.trim()); }
    if (response.kind === 'match') { return response.left.every(option => draft.value.values[option.id]); }
    if (response.kind === 'order') { return true; }
    return draft.value.picked.length > 0;
});
function submit() {
    const response = props.response;
    if (!ready.value || props.disabled) { return; }
    if (response.kind === 'text') { emit('submit', { kind: 'text', text: draft.value.text }); }
    else if (response.kind === 'gaps') { emit('submit', { kind: 'gaps', values: response.slots.map(slot => ({ id: slot.id, text: draft.value.values[slot.id] })) }); }
    else if (response.kind === 'match') { emit('submit', { kind: 'match', pairs: response.left.map(option => ({ left: option.id, right: draft.value.values[option.id] })) }); }
    else { emit('submit', { kind: response.kind, ids: [...(response.kind === 'order' ? draft.value.order : draft.value.picked)] }); }
}
</script>

<template>
    <form class="learning-answer" @submit.prevent="submit">
        <fieldset :disabled="disabled">
            <legend class="learning-sr-only">你的回答</legend>
            <div v-if="response.kind === 'choice'" class="learning-choices">
                <label v-for="(option, index) in response.options" :key="option.id" :class="{ selected: draft.picked.includes(option.id) }">
                    <input :type="response.multiple ? 'checkbox' : 'radio'" name="answer-choice" :checked="draft.picked.includes(option.id)" @change="choose(option.id)">
                    <span class="learning-option-letter">{{ String.fromCharCode(65 + index) }}</span><span>{{ option.text }}</span>
                </label>
            </div>
            <ol v-else-if="response.kind === 'order'" class="learning-order">
                <li v-for="(id, index) in draft.order" :key="id">
                    <span>{{ response.options.find(option => option.id === id)?.text }}</span>
                    <button type="button" :disabled="index === 0" :aria-label="`上移第 ${index + 1} 项`" @click="move(index, -1)">↑</button>
                    <button type="button" :disabled="index === draft.order.length - 1" :aria-label="`下移第 ${index + 1} 项`" @click="move(index, 1)">↓</button>
                </li>
            </ol>
            <div v-else-if="response.kind === 'match'" class="learning-fields">
                <label v-for="option in response.left" :key="option.id">{{ option.text }}
                    <select v-model="draft.values[option.id]"><option value="">选择对应项</option><option v-for="right in response.right" :key="right.id" :value="right.id">{{ right.text }}</option></select>
                </label>
            </div>
            <div v-else-if="response.kind === 'evidence'" class="learning-choices">
                <label v-for="paragraph in paragraphs" :key="paragraph.id" :class="{ selected: draft.picked.includes(paragraph.id) }">
                    <input type="checkbox" :checked="draft.picked.includes(paragraph.id)" @change="choose(paragraph.id)"><span>{{ paragraph.text }}</span>
                </label>
                <p v-if="!paragraphs.length" class="learning-muted">请先展开相关文稿，再选择原文依据。</p>
            </div>
            <div v-else-if="response.kind === 'gaps'" class="learning-fields">
                <label v-for="slot in response.slots" :key="slot.id">{{ slot.text }}<input v-model="draft.values[slot.id]" type="text" maxlength="4000" autocomplete="off"></label>
            </div>
            <label v-else class="learning-writing"><span class="learning-sr-only">你的回答</span><textarea v-model="draft.text" v-remember-editor="draft" rows="6" maxlength="4000" placeholder="写下你的回答…" /></label>
            <button class="learning-primary" type="submit" :disabled="!ready">交给语伴 →</button>
        </fieldset>
    </form>
</template>
