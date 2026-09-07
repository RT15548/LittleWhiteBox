<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { LearningClientState } from '../types.js';
import type { LearningPresentation } from '../application/presentation.js';
import type { LearningSelection } from '../../../domains/learning/notes.js';
import LearningIcon from './LearningIcon.vue';

const props = defineProps<{ state: LearningClientState; disabled: boolean; pending: boolean }>();
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>]; present: [target: LearningPresentation]; profile: [] }>();
const message = ref('');
const composer = ref<HTMLTextAreaElement | null>(null);
const scroller = ref<HTMLElement | null>(null);
const focus = ref<{ exerciseId?: string; selection?: LearningSelection } | null>(null);
let following = true;
let resizeObserver: ResizeObserver | null = null;
let resizeFrame = 0;
let sent = '';
let sentAfter = 0;
function trackScroll() {
    const area = scroller.value;
    if (area) { following = area.scrollHeight - area.scrollTop - area.clientHeight < 70; }
}
async function follow() {
    await nextTick();
    if (following && scroller.value) { scroller.value.scrollTop = scroller.value.scrollHeight; }
}
function resizeComposer() {
    const input = composer.value;
    if (!input?.clientWidth) { return; }
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
    void follow();
}
watch(message, resizeComposer, { flush: 'post' });
watch(composer, input => {
    resizeObserver?.disconnect();
    cancelAnimationFrame(resizeFrame);
    if (!input) { return; }
    let width = 0;
    resizeObserver = new ResizeObserver(([entry]) => {
        if (entry.contentRect.width === width) { return; }
        width = entry.contentRect.width;
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(resizeComposer);
    });
    resizeObserver.observe(input.parentElement!);
}, { flush: 'post' });
onMounted(follow);
onBeforeUnmount(() => { resizeObserver?.disconnect(); cancelAnimationFrame(resizeFrame); });
watch(() => props.state.conversation.turns.length + props.state.conversation.removedTurns, total => {
    const turn = props.state.conversation.turns.at(-1);
    const expected = focus.value?.selection ? `${sent}\n\n${focus.value.selection.quote}` : sent;
    if (total > sentAfter && turn?.user === expected && message.value.trim() === sent) { message.value = ''; sent = ''; focus.value = null; }
});
watch([() => props.state.chatIdentity, () => props.state.language, () => props.state.teacher?.name], () => { message.value = ''; sent = ''; focus.value = null; });
watch(() => props.state.unit?.id, () => { focus.value = null; });
watch(() => props.state.conversation.turns.length, (length, old) => {
    if (!length && old && !props.state.busy) { message.value = ''; sent = ''; }
});
function send() {
    if (props.disabled || !message.value.trim()) { return; }
    sent = message.value.trim();
    sentAfter = props.state.conversation.turns.length + props.state.conversation.removedTurns;
    emit('action', focus.value ? 'explain' : 'talk', { message: sent, ...(focus.value ?? {}) });
}
watch(() => props.state.conversation.pending, text => {
    if (text) { following = true; }
    void follow();
});
watch([() => props.state.conversation.turns.length, () => props.state.busy, () => props.state.message], follow);
function available(target: LearningPresentation) {
    if (target.kind === 'replacement') { return !props.disabled && props.state.currentUnitId === target.unitId; }
    return props.state.unit?.id === target.unitId && (target.kind === 'exercise' ? props.state.unit.exercises : props.state.unit.materials).some(entry => entry.id === target.id);
}
defineExpose({ async ask(exerciseId?: string, selection?: LearningSelection) { focus.value = { exerciseId, selection }; await nextTick(); composer.value?.focus(); }, focus: () => composer.value?.focus({ preventScroll: true }) });
</script>

<template>
    <section class="learning-conversation">
        <header class="learning-conversation-heading"><span class="learning-person-initial">{{ [...(state.teacher?.name ?? '师')][0] }}</span><h1>{{ state.teacher?.name ?? '老师' }}</h1><button type="button" :disabled="disabled" aria-label="更换学习语言和老师" @click="emit('profile')">{{ new Intl.DisplayNames(['zh-CN'], { type: 'language' }).of(state.language) }}</button></header>
        <div ref="scroller" class="learning-conversation-turns" aria-label="师生对话" @scroll="trackScroll">
            <p v-if="state.conversation.removedTurns" class="learning-history-notice">较早对话已整理为课堂记忆。</p>
            <div v-for="(turn, index) in state.conversation.turns" :key="index" class="learning-conversation-turn">
                <p class="learning-conversation-user">{{ turn.user }}</p><p class="learning-conversation-teacher">{{ turn.teacher }}</p>
                <button v-if="turn.presentation" type="button" class="learning-activity-link" :disabled="!available(turn.presentation)" @click="emit('present', turn.presentation)"><LearningIcon :name="turn.presentation.kind === 'material' ? 'book' : 'records'" /><span>{{ turn.presentation.title }}</span><LearningIcon name="arrow" /></button>
                <div v-if="index === state.conversation.turns.length - 1 && state.reply?.text === turn.teacher" class="learning-conversation-tools"><button v-if="[...turn.teacher].length <= 1000" type="button" :disabled="disabled" @click="emit('action', 'say-reply')"><LearningIcon name="sound" />听老师说</button><button v-if="state.reply.exerciseId && [...turn.teacher].length <= 4000" type="button" :disabled="disabled || state.unit?.notes.some(note => note.text === turn.teacher)" @click="emit('action', 'save-note')">保存笔记</button></div>
            </div>
            <p v-if="state.conversation.pending" class="learning-conversation-user">{{ state.conversation.pending }}</p>
            <div v-if="state.busy" class="learning-working" role="status"><span class="learning-working-dot" aria-hidden="true" /><span>{{ state.message || '老师正在回复…' }}</span></div>
            <div v-if="!state.conversation.turns.length && !state.conversation.pending && !state.busy" class="learning-conversation-empty"><LearningIcon name="chat" /><p>{{ state.teacher ? '今天想学什么？' : '先选一位老师' }}</p><button v-if="!state.teacher" class="learning-primary" type="button" @click="emit('profile')">选择老师</button><button v-else type="button" :disabled="disabled" @click="emit('action', 'talk', { message: state.profile ? '请根据我的学习目标和记录，带我继续学习。' : '我想跟你学习这门语言，先聊聊我的水平和目标吧。' })">{{ state.profile ? '继续学习' : '开始交流' }}</button><small v-if="state.teacher">交流与教学会调用模型</small></div>
        </div>
        <form v-if="state.teacher" class="learning-conversation-compose" @submit.prevent="send">
            <div class="learning-composer-surface">
                <div v-if="focus" class="learning-composer-quote"><span>{{ focus.selection?.quote ?? '请教这道题' }}</span><button type="button" aria-label="取消引用" @click="focus = null">×</button></div>
                <div class="learning-composer-row">
                    <textarea ref="composer" v-model="message" rows="1" :maxlength="focus?.selection ? 1800 : focus?.exerciseId ? 2000 : 4000" aria-label="和老师说" placeholder="和老师说…" @keydown.ctrl.enter.prevent="send" @keydown.meta.enter.prevent="send" />
                    <button :type="state.busy ? 'button' : 'submit'" :class="state.busy ? 'learning-composer-stop' : 'learning-primary'" :disabled="state.busy ? pending : disabled || !message.trim()" :aria-label="state.busy ? '停止回复' : '发送给老师'" :title="state.busy ? '停止回复' : '发送给老师'" @click.prevent="state.busy ? emit('action', 'cancel') : send()"><LearningIcon :name="state.busy ? 'stop' : 'send'" /></button>
                </div>
            </div>
        </form>
    </section>
</template>
