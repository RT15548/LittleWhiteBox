<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue';
import type { LearningActor } from '../domain/conversation.js';
import { LEARNING_DIALOGUE_COPY as dialogueCopy } from './learning-copy.js';
import { learningTurnNotice } from './learning-notice.js';
import type { LearningClientState } from '../types.js';
import type { LearningPresentation } from '../application/presentation.js';
import type { LearningDialogueView } from '../application/message-view.js';
import type { LearningSelection } from '../../../domains/learning/notes.js';
import { LEARNING_OPENING_MESSAGES } from '../agent/opening-prompts.js';
import LearningIcon from './LearningIcon.vue';
import LearningMessages from './LearningMessages.vue';
import { isLearningConversation, isLearningPreparation } from '../agent/access.js';
import { useLearningUiSession } from './learning-session.js';
import { rememberLearningEditor as vRememberEditor } from './learning-editor.js';
import { LEARNING_CONVERSATION_COPY as conversationCopy } from '../application/conversation-copy.js';
import { learningReplyNote } from '../application/reply-note.js';

const props = defineProps<{ target: LearningActor; state: LearningClientState; disabled: boolean; pending: boolean }>();
const dialogue = computed(() => props.target === 'workbench' ? props.state.workbenchConversation : props.state.conversation);
const busy = computed(() => props.target === 'workbench' ? props.state.workbenchBusy : props.state.chatBusy);
const notice = computed(() => props.target === 'workbench' ? props.state.workbenchMessage : props.state.chatMessage);
const failedNotifications = computed(() => props.target === 'companion' ? props.state.delegatedTasks.filter(task => task.notification === 'failed') : []);
const storage = computed(() => props.target === 'workbench' ? props.state.workbenchStorage : props.state.chatStorage);
const reply = computed(() => props.target === 'workbench' ? props.state.reply : props.state.companionReply);
const title = computed(() => props.target === 'workbench' ? dialogueCopy.assistant : props.state.teacher?.name ?? '语伴');
// Preparation is workbench activity, not a succession of empty chat messages.
const conversationTurns = computed(() => dialogue.value.turns.map((turn, index) => ({ turn, index }))
    .filter(({ turn }) => !isLearningPreparation({ kind: turn.purpose ?? 'talk' }) || turn.status === 'running'));
const copy = { conversation: '和语伴聊天', history: '更早的聊天已收起', empty: '今天想聊什么？', select: '先选一位语伴', opening: '打个招呼' };
// Workbench instructions are not words the learner typed. Keep replies and failures, not synthetic user bubbles.
const internalRequests = new Set<LearningDialogueView['purpose']>(['prepare', 'complete', 'grade', 'revision-review', 'model-essay', 'review-prepare', 'review-assess', 'companion']);
const emit = defineEmits<{ action: [name: string, input?: Record<string, unknown>]; present: [target: LearningPresentation]; profile: []; close: [] }>();
const local = useLearningUiSession();
const session = props.target === 'workbench' ? local.workbenchChat : local.chat;
const action = (name: string, input: Record<string, unknown> = {}) => emit('action', name, { ...input, target: props.target });
const message = toRef(session, 'text');
const composer = ref<HTMLTextAreaElement | null>(null);
const heading = ref<HTMLElement | null>(null);
const scroller = ref<HTMLElement | null>(null);
const focus = toRef(session, 'focus');
let resizeObserver: ResizeObserver | null = null;
let resizeFrame = 0;
function trackScroll() {
    const area = scroller.value;
    if (area) { session.scroll = area.scrollTop; session.following = area.scrollHeight - area.scrollTop - area.clientHeight < 70; }
}
async function follow() {
    await nextTick();
    if (session.following && scroller.value) { scroller.value.scrollTop = scroller.value.scrollHeight; }
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
onMounted(() => { if (scroller.value) { scroller.value.scrollTop = session.scroll; } void follow(); });
onBeforeUnmount(() => { if (scroller.value) { session.scroll = scroller.value.scrollTop; } resizeObserver?.disconnect(); cancelAnimationFrame(resizeFrame); });
function send() {
    if (props.disabled || !message.value.trim()) { return; }
    const sent = message.value.trim();
    session.sent = { text: message.value, user: focus.value?.selection ? `${sent}\n\n${focus.value.selection.quote}` : sent,
        after: dialogue.value.turns.length + dialogue.value.removedTurns };
    session.following = true;
    action('talk', { message: sent, ...(focus.value ?? session.study ?? {}) });
}
function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing || event.keyCode === 229) { return; }
    event.preventDefault(); send();
}
watch([() => dialogue.value.turns, () => busy.value], follow);
function available(target: LearningPresentation) {
    const unit = [props.state.unit, props.state.review].find(entry => entry?.id === target.unitId);
    return !!unit && (target.kind === 'exercise' ? unit.exercises : unit.materials).some(entry => entry.id === target.id);
}
// Notes are read back in the lesson workspace; a review reply must not be saved into that lesson.
const replyUnit = computed(() => props.state.unit?.id === reply.value?.unitId ? props.state.unit : null);
const replyNote = computed(() => learningReplyNote(replyUnit.value, reply.value));
defineExpose({ async ask(exerciseId?: string, selection?: LearningSelection, unitId = props.state.unit?.id) {
    focus.value = { unitId, exerciseId, selection, help: !!exerciseId && !selection };
    session.study = unitId ? { unitId, exerciseId } : null;
    await nextTick(); composer.value?.focus();
},
    focusHeading: () => heading.value?.focus({ preventScroll: true }) });
</script>

<template>
    <section class="learning-conversation">
        <header class="learning-conversation-heading"><span class="learning-person-initial" aria-hidden="true">{{ target === 'workbench' ? 'a' : [...title][0] }}</span><h1 ref="heading" tabindex="-1">{{ title }}</h1><button v-if="target === 'companion'" type="button" :disabled="disabled" aria-label="更换学习语言和语伴" @click="emit('profile')">{{ new Intl.DisplayNames(['zh-CN'], { type: 'language' }).of(state.language) }}</button><button v-else type="button" :aria-label="dialogueCopy.closeAssistant" @click="emit('close')"><LearningIcon name="close" /></button></header>
        <div ref="scroller" class="learning-conversation-turns" :aria-label="target === 'workbench' ? dialogueCopy.assistant : copy.conversation" @scroll="trackScroll">
            <p v-if="dialogue.removedTurns" class="learning-history-notice">{{ copy.history }}</p>
            <div v-for="({ turn, index }, position) in conversationTurns" :key="dialogue.removedTurns + index" class="learning-conversation-turn">
                <p v-if="turn.user && !internalRequests.has(turn.purpose) && !isLearningPreparation({ kind: turn.purpose ?? 'talk' })" class="learning-conversation-user">{{ turn.user }}</p>
                <LearningMessages :turn="turn" :disabled="pending" @stop="action(isLearningConversation({ kind: turn.purpose ?? 'talk' }) ? 'cancel-chat' : isLearningPreparation({ kind: turn.purpose ?? 'talk' }) ? 'cancel-preparation' : 'cancel')" />
                <div v-if="turn.purpose !== 'task-result' && (learningTurnNotice(turn, storage, state.storage) || turn.retryable)" class="learning-turn-recovery">
                    <p v-if="learningTurnNotice(turn, storage, state.storage)" class="learning-turn-notice" :class="{ 'is-error': turn.status === 'failed' }" role="status">{{ learningTurnNotice(turn, storage, state.storage) }}</p>
                    <button v-if="turn.retryable" type="button" :disabled="disabled || pending" @click="action('retry-chat', { id: turn.id })">{{ dialogueCopy.retry }}</button>
                </div>
                <button v-if="turn.presentation" type="button" class="learning-activity-link" :disabled="!available(turn.presentation)" @click="emit('present', turn.presentation)"><LearningIcon :name="turn.presentation.kind === 'material' ? 'book' : 'records'" /><span>{{ turn.presentation.title }}</span><LearningIcon name="arrow" /></button>
                <div v-if="position === conversationTurns.length - 1 && reply && reply.id === turn.id" class="learning-conversation-tools"><button v-if="[...turn.teacher].length <= 1000" type="button" :disabled="disabled" @click="action('say-reply', { id: turn.id })"><LearningIcon name="sound" />{{ dialogueCopy.listen }}</button><button v-if="replyNote && replyUnit && [...turn.teacher].length <= 4000" type="button" :disabled="disabled || replyNote.saved" @click="action('save-note', { id: turn.id, unitId: replyUnit.id })">{{ dialogueCopy.saveNote }}</button></div>
            </div>
            <div v-if="busy && !dialogue.turns.some(turn => turn.status === 'running' && isLearningConversation({ kind: turn.purpose ?? 'talk' }))" class="learning-working" role="status"><span class="learning-working-dot" aria-hidden="true" /><span>{{ notice }}</span></div>
            <p v-else-if="!busy && notice && storage === 'ready'" class="learning-turn-notice is-error" role="status">{{ notice }}</p>
            <div v-for="task in failedNotifications" :key="task.taskId" class="learning-turn-recovery">
                <p class="learning-turn-notice is-error" role="status">{{ task.notificationError }}</p>
                <button type="button" :disabled="pending || state.chatBusy || !['ready', 'unconfirmed'].includes(storage)" @click="action('retry-notification', { id: task.taskId })">{{ conversationCopy.notificationRetry }}</button>
            </div>
            <div v-if="!conversationTurns.length && !busy" class="learning-conversation-empty"><LearningIcon name="chat" /><p>{{ target === 'workbench' ? dialogueCopy.assistantEmpty : state.teacher ? copy.empty : copy.select }}</p><button v-if="target === 'companion' && !state.teacher" class="learning-primary" type="button" @click="emit('profile')">{{ copy.select }}</button><button v-else-if="target === 'companion'" type="button" :disabled="disabled" @click="action('talk', { message: state.profile ? LEARNING_OPENING_MESSAGES.returning : LEARNING_OPENING_MESSAGES.initial })">{{ copy.opening }}</button></div>
        </div>
        <form v-if="target === 'workbench' || state.teacher" class="learning-conversation-compose" @submit.prevent="send">
            <div class="learning-composer-surface">
                <div v-if="focus" class="learning-composer-quote"><span>{{ focus.selection?.quote ?? '请教这道题' }}</span><button type="button" aria-label="取消引用" @click="focus = null">×</button></div>
                <div class="learning-composer-row">
                    <textarea ref="composer" v-model="message" v-remember-editor="session" rows="1" :disabled="storage !== 'ready'" :maxlength="focus?.selection ? 1800 : focus?.exerciseId ? 2000 : 4000" :aria-label="target === 'workbench' ? dialogueCopy.assistantPlaceholder : '和语伴说'" :placeholder="target === 'workbench' ? dialogueCopy.assistantPlaceholder : '和语伴说…'" @keydown="onKeydown" />
                    <button :type="busy ? 'button' : 'submit'" :class="busy ? 'learning-composer-stop' : 'learning-primary'" :disabled="busy ? pending : disabled || !message.trim()" :aria-label="busy ? dialogueCopy.stop : dialogueCopy.send" :title="busy ? dialogueCopy.stop : dialogueCopy.send" @click.prevent="busy ? action('cancel-chat') : send()"><LearningIcon :name="busy ? 'stop' : 'send'" /></button>
                </div>
            </div>
        </form>
    </section>
</template>
