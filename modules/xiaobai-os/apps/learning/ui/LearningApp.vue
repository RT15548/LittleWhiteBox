<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useAppBack, useAppLayer } from '../../../shell/app-src/navigation/app-navigation.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import LearningActivity from './LearningActivity.vue';
import LearningApproval from './LearningApproval.vue';
import LearningBooks from './LearningBooks.vue';
import LearningPlayer from './LearningPlayer.vue';
import LearningSetup from './LearningSetup.vue';
import LearningSettingsCard from './LearningSettingsCard.vue';
import LearningCompanionControl from './LearningCompanionControl.vue';
import { LEARNING_DIALOGUE_COPY as dialogueCopy, LEARNING_CONFIRM_COPY, LEARNING_DISCARD_COPY, LEARNING_VOICE_COPY, LEARNING_REQUEST_COPY, LEARNING_TEACHER_STORAGE_COPY as teacherStorageCopy } from './learning-copy.js';
import { LEARNING_REWARD_COPY, LEARNING_STORAGE_COPY } from '../application/feedback.js';
import LearningWorkbench from './LearningWorkbench.vue';
import LearningPreparation from './LearningPreparation.vue';
import type { LearningPresentation } from '../application/presentation.js';
import type { LearningSelection } from '../../../domains/learning/notes.js';
import LearningIcon from './LearningIcon.vue';
import LearningProcess from './LearningProcess.vue';
import { learningTurnNotice } from './learning-notice.js';
import { isLearningConversation, isLearningPreparation } from '../agent/access.js';
import LearningConversation from './LearningConversation.vue';
import { useLearningState } from './use-learning-state.js';
import { learningContextNeedsConfirmation, provideLearningUiSession } from './learning-session.js';
import { LEARNING_PANE_MIN_WIDTH, LEARNING_PANE_TRANSITION_MS } from './layout.js';
import { useLearningCompanion } from './use-learning-companion.js';
import './learning.css';

const props = defineProps<XiaobaiOsAppProps>();
const copy = {
    cancel: '取消', working: '正在准备学习内容…',
    verify: '查看保存结果', retry: '重新保存', adopt: '使用已保存记录',
    adoptWarning: '这次尚未保存成功的修改将被放弃，改用已保存的学习记录。',
    replaceWarning: '新练习准备好后，会替换这次的材料、作答和笔记。学习本中的记录和已获得的奖励会保留。',
    verifyWallet: '查看钱包状态', adoptWallet: '使用已保存钱包', adoptWalletWarning: '这次尚未保存成功的钱包修改将被放弃，改用已保存的钱包。',
    voiceDisabled: '还没有开启语音，文字学习不受影响。',
};
const { state, pending, writable, canChat, canRequest, localMessage, needsRefresh, request: sendRequest } = useLearningState(props);
const uiSession = provideLearningUiSession(state);
const restarting = ref(false);
async function request(name: string, input: Record<string, unknown> = {}, discardConfirmed = false) {
    if (!discardConfirmed && learningContextNeedsConfirmation(uiSession, state.value, name, input)) {
        askConfirm(name, input, name === 'teacher' ? LEARNING_DISCARD_COPY.companion : LEARNING_DISCARD_COPY.context); return;
    }
    if (name === 'reset-learning') { restarting.value = true; }
    else if (name === 'cancel') { restarting.value = false; }
    return sendRequest(name, input);
}
type Page = 'home' | 'books' | 'materials' | 'harvest' | 'settings' | 'profile';
const page = ref<Page>(state.value.profile ? 'home' : 'profile');
const trail: Page[] = [];
const menu = ref<HTMLDetailsElement | null>(null);
const menuOpen = ref(false);
useAppBack(() => { if (!menu.value?.open) { return false; } menu.value.open = false; return true; }, () => menuOpen.value);
const conversation = ref<InstanceType<typeof LearningConversation> | null>(null);
const assistant = ref<InstanceType<typeof LearningConversation> | null>(null);
const assistantOpen = ref(false);
const assistantButton = ref<HTMLButtonElement | null>(null);
const activity = ref<LearningPresentation | null>(null);
const scroller = ref<HTMLElement | null>(null);
const scrolls: Partial<Record<Page, number>> = {};

// Workbench on the left, companion on the right. Narrow screens show one pane at a time and slide between them.
const root = ref<HTMLElement | null>(null);
const width = ref(0);
const wide = computed(() => width.value >= 760 && !!state.value.teacher);
const view = ref<'work' | 'chat'>('work');
const workMounted = ref(true);
const chatMounted = ref(false);
const preferredWorkShare = ref(62);
const shareMin = computed(() => Math.max(42, Math.ceil(LEARNING_PANE_MIN_WIDTH / Math.max(width.value, 1) * 100)));
const shareMax = computed(() => Math.min(68, Math.floor((1 - LEARNING_PANE_MIN_WIDTH / Math.max(width.value, 1)) * 100)));
const workShare = computed({ get: () => wide.value ? Math.min(shareMax.value, Math.max(shareMin.value, preferredWorkShare.value)) : preferredWorkShare.value,
    set: (value: number) => { preferredWorkShare.value = value; } });
const reducedMotion = ref(false);
let observer: ResizeObserver | undefined;
let motion: MediaQueryList | undefined;
const updateMotion = () => { reducedMotion.value = motion?.matches ?? false; };
onMounted(() => {
    motion = matchMedia('(prefers-reduced-motion: reduce)'); updateMotion();
    motion.addEventListener('change', updateMotion);
    if (!root.value || typeof ResizeObserver === 'undefined') { return; }
    observer = new ResizeObserver(([entry]) => { width.value = entry?.contentRect.width ?? 0; });
    observer.observe(root.value);
});
onBeforeUnmount(() => { observer?.disconnect(); motion?.removeEventListener('change', updateMotion); });
const workVisible = computed(() => wide.value || view.value === 'work');
const chatVisible = computed(() => !!state.value.teacher && (wide.value || view.value === 'chat'));
// Both surfaces exist only for the lateral transition. Their drafts live in the lightweight session.
watch([workVisible, chatVisible, reducedMotion], async ([work, chat, reduced], _previous, cleanup) => {
    let current = true;
    let retirement: ReturnType<typeof setTimeout> | undefined;
    cleanup(() => { current = false; clearTimeout(retirement); });
    if (work) { workMounted.value = true; }
    if (chat) { chatMounted.value = true; }
    await nextTick();
    if (!current) { return; }
    if (work && scroller.value) { scroller.value.scrollTop = scrolls[page.value] ?? 0; }
    const retire = () => { workMounted.value = work; chatMounted.value = chat; };
    if (wide.value || reduced) { retire(); }
    else { retirement = setTimeout(retire, LEARNING_PANE_TRANSITION_MS); }
}, { immediate: true });
function rememberWorkScroll() {
    if (workVisible.value && scroller.value && !assistantOpen.value) { scrolls[page.value] = scroller.value.scrollTop; }
    void rememberStudy();
}
async function rememberStudy(event?: Event) {
    const target = event?.target instanceof Element ? event.target : null;
    await nextTick();
    if (workVisible.value && activity.value) {
        uiSession.chat.study = { unitId: activity.value.unitId, exerciseId: activity.value.kind === 'exercise' ? activity.value.id : undefined };
        return;
    }
    if (!workVisible.value || page.value !== 'home' || !scroller.value) { return; }
    const bounds = scroller.value.getBoundingClientRect();
    const current = target?.closest<HTMLElement>('[data-learning-unit-id]')
        ?? [...scroller.value.querySelectorAll<HTMLElement>('[data-learning-unit-id]')].find(element => {
            const rect = element.getBoundingClientRect();
            return rect.bottom > bounds.top + 48 && rect.top < bounds.bottom;
        });
    if (current?.dataset.learningUnitId) {
        uiSession.chat.study = { unitId: current.dataset.learningUnitId, exerciseId: current.dataset.exerciseId };
    }
}
watch([scroller, page, workVisible], () => { void rememberStudy(); }, { flush: 'post' });
const turnCount = computed(() => {
    const { turns, removedTurns } = state.value.conversation;
    let index = turns.length - 1;
    while (index >= 0 && isLearningPreparation({ kind: turns[index].purpose ?? 'talk' })) { index--; }
    return index < 0 ? 0 : removedTurns + index + 1;
});
const seenTurns = ref(turnCount.value);
watch([turnCount, chatVisible], ([count, visible]) => { if (visible || count < seenTurns.value) { seenTurns.value = count; } }, { immediate: true });
const unread = computed(() => turnCount.value > seenTurns.value);
const workProcess = computed(() => {
    const turns = state.value.workbenchConversation.turns;
    let index = turns.length - 1;
    while (index >= 0 && isLearningConversation({ kind: turns[index].purpose ?? 'talk' })) { index--; }
    let running = turns.length - 1;
    while (running >= 0 && (turns[running].status !== 'running' || isLearningConversation({ kind: turns[running].purpose ?? 'talk' }))) { running--; }
    if (running >= 0) { index = running; }
    return index < 0 ? null : { turn: state.value.workbenchConversation.turns[index],
        key: `${state.value.chatIdentity}:${state.value.language}:${state.value.workbenchConversation.removedTurns + index}` };
});
async function showChat() {
    if (!state.value.teacher) { return; }
    await rememberStudy();
    rememberWorkScroll(); view.value = 'chat'; chatMounted.value = true;
    await nextTick();
    if (view.value === 'chat') { conversation.value?.focusHeading(); }
}
async function showWork() {
    workMounted.value = true; view.value = 'work';
    await nextTick();
    if (scroller.value) { scroller.value.scrollTop = scrolls[page.value] ?? 0; }
    if (activity.value) { return; }
    const heading = scroller.value?.querySelector<HTMLElement>('h1, h2');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
}

let recordListScroll = 0;
watch(() => !!state.value.record, async (reading, previous) => {
    if (page.value !== 'books' || reading === previous) { return; }
    if (reading) { recordListScroll = scroller.value?.scrollTop ?? 0; }
    await nextTick();
    if (page.value === 'books' && scroller.value) { scroller.value.scrollTop = reading ? 0 : recordListScroll; }
});
const confirm = ref<{ action: string; input: Record<string, unknown>; text: string } | null>(null);
const confirmLayer = ref<HTMLElement | null>(null);
useAppLayer(confirmLayer, () => { confirm.value = null; });
const voice = ref(state.value.profile?.voice?.voiceId ?? state.value.voices.defaultVoice);
const voiceLanguage = ref(state.value.profile?.voice?.language ?? state.value.language);
const speed = ref(state.value.profile?.voice?.speed ?? 1);
const harvestPage = ref(0);
const harvest = computed(() => state.value.completions.slice(harvestPage.value * 20, (harvestPage.value + 1) * 20));
watch([() => state.value.language, () => state.value.profile?.voice], ([language, value]) => {
    voice.value = value?.voiceId ?? state.value.voices.defaultVoice;
    voiceLanguage.value = value?.language ?? language;
    speed.value = value?.speed ?? 1;
});
watch([() => state.value.chatIdentity, () => state.value.language, () => state.value.teacher?.name], () => { activity.value = null; confirm.value = null; harvestPage.value = 0; });
watch(() => !!state.value.teacher, has => { if (!has) { view.value = 'work'; } });
watch(() => state.value.currentUnitId, id => {
    if (confirm.value?.action === 'replace-lesson' && confirm.value.input.unitId !== id) { confirm.value = null; }
});
watch(() => state.value.unit, unit => {
    const target = activity.value;
    if (target && (unit?.id !== target.unitId || !(target.kind === 'exercise' ? unit.exercises : unit.materials).some(entry => entry.id === target.id))) { closeActivity(); }
});
for (const actor of ['conversation', 'workbenchConversation'] as const) { watch(() => {
    const target = state.value[actor].turns.at(-1)?.presentation;
    return target ? `${state.value[actor].turns.length + state.value[actor].removedTurns}:${target.unitId}:${target.kind}:${target.id}` : '';
}, key => {
    const target = state.value[actor].turns.at(-1)?.presentation;
    if (key && target) { void present(target, true); }
}); }
// A reading-writing piece the companion points at while the learner is elsewhere only lights a dot on the way back.
const workUnread = ref(false);
watch([workVisible, page], ([visible, current]) => { if (visible && current === 'home') { workUnread.value = false; } });
/** An explicit open goes to the workbench and brings the paragraph or exercise into view; an automatic one never moves the learner. */
async function present(target: LearningPresentation, automatic = false) {
    if (state.value.review?.id === target.unitId) {
        if (automatic) { if (!workVisible.value || page.value !== 'home') { workUnread.value = true; } return; }
        const local = uiSession.unit(target.unitId).review;
        if (target.kind === 'exercise') { local.index = state.value.review.exercises.findIndex(entry => entry.id === target.id); }
        local.expanded = true;
        await openReview(); return;
    }
    if (state.value.unit?.id !== target.unitId) { return; }
    // Reading-writing units live on the workbench itself; only lesson activities open as a sheet.
    if (state.value.unit.kind === 'reading-writing') {
        if (automatic) { if (!workVisible.value || page.value !== 'home') { workUnread.value = true; } return; }
        uiSession.unit(target.unitId).reading.view = 'reading';
        await go('home');
        const selector = target.kind === 'exercise' ? `[data-exercise-id="${CSS.escape(target.id)}"]` : `[data-material-id="${CSS.escape(target.id)}"][data-paragraph-id]`;
        scroller.value?.querySelector<HTMLElement>(selector)?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        return;
    }
    activity.value = target;
    if (!automatic) { await showWork(); }
    else if (!workVisible.value) { workUnread.value = true; }
}
function closeActivity() { activity.value = null; void request('stop'); }
async function openAssistant(exerciseId?: string, unitId?: string) {
    if (activity.value) { closeActivity(); }
    if (!assistantOpen.value) { rememberWorkScroll(); }
    assistantOpen.value = true;
    await showWork(); await nextTick();
    if (exerciseId) { await assistant.value?.ask(exerciseId, undefined, unitId); }
    else { assistant.value?.focusHeading(); }
}
async function closeAssistant() {
    assistantOpen.value = false;
    await nextTick();
    if (scroller.value) { scroller.value.scrollTop = scrolls[page.value] ?? 0; }
    assistantButton.value?.focus({ preventScroll: true });
}
async function askTeacher(exerciseId?: string, selection?: LearningSelection, unitId?: string) {
    if (!state.value.teacher) { await openAssistant(exerciseId, unitId); if (selection) { await assistant.value?.ask(exerciseId, selection, unitId); } return; }
    closeActivity(); rememberWorkScroll(); view.value = 'chat'; chatMounted.value = true;
    await nextTick(); await conversation.value?.ask(exerciseId, selection, unitId);
}
async function go(next: Page, returning = false) {
    if (activity.value) { closeActivity(); }
    assistantOpen.value = false;
    if (next !== page.value && !returning) {
        if (next === 'home') { trail.length = 0; }
        else {
            const existing = trail.indexOf(next);
            if (existing >= 0) { trail.splice(existing); }
            else { trail.push(page.value); }
        }
    }
    if (scroller.value) { scrolls[page.value] = scroller.value.scrollTop; }
    if (menu.value) { menu.value.open = false; }
    page.value = next;
    await showWork();
    await nextTick();
    if (scroller.value) {
        scroller.value.scrollTop = scrolls[next] ?? 0;
        const heading = [...scroller.value.querySelectorAll<HTMLElement>('h1, h2')].find(element => element.offsetParent !== null);
        if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
}
function openProfile() { uiSession.setup.step = 0; void go('profile'); }
// A reset may finish through receipt recovery. Navigate only after the confirmed state is usable.
watch([state, pending], ([next, sending]) => {
    if (!restarting.value || sending || next.busy || next.storage !== 'ready') { return; }
    restarting.value = false;
    if (next.profile) { return; } // The file was repaired before reset; keep its current workspace.
    uiSession.settings.submitted = null;
    uiSession.settings.open = true;
    uiSession.setup.step = next.teacher ? 2 : 0;
    trail.length = 0;
    scrolls.profile = 0;
    void go('profile', true);
});
watch([() => state.value.chatIdentity, () => state.value.language], () => { restarting.value = false; });
async function openReview() {
    await go('home');
    if (scroller.value) { scroller.value.scrollTop = 0; }
    const heading = scroller.value?.querySelector<HTMLElement>('#learning-review-title');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
}
/** Navigation follows an explicit workbench action, never an unsolicited model update. */
async function workAction(name: string, input: Record<string, unknown> = {}, discardConfirmed = false) {
    if (name === 'prepare' && !state.value.profile) {
        uiSession.setup.step = 2;
        await go('profile'); return;
    }
    if (name === 'start-review') { await openReview(); }
    const unit = state.value.unit;
    if (unit?.kind === 'reading-writing' && input.unitId === unit.id && ['grade', 'submit-revision', 'skip-revision'].includes(name)) {
        uiSession.unit(unit.id).reading.view = name === 'skip-revision' && unit.modelEssay ? 'model' : 'feedback';
        await go('home');
        if (scroller.value) { scroller.value.scrollTop = 0; }
    }
    await request(name, input, discardConfirmed);
}
// The bridge acknowledges starting a save, not finishing it. Follow the session's confirmed-save retirement.
watch(() => uiSession.settings.submitted, (next, previous) => {
    if (!next && previous && !uiSession.settings.open && page.value === 'profile' && uiSession.setup.step === 2
        && state.value.storage === 'ready' && !state.value.busy && state.value.profile
        && Object.entries(previous.value).every(([key, value]) => state.value.profile!.settings[key as keyof typeof previous.value] === value)) {
        void go('home');
    }
});
watch(() => state.value.busy, busy => {
    const unit = state.value.unit;
    if (!busy && unit?.stage.stage === 'revising' && uiSession.unit(unit.id).reading.view === 'model') {
        uiSession.unit(unit.id).reading.view = 'feedback';
    }
});
const back = useAppBack(() => {
    if (menu.value?.open) { menu.value.open = false; return true; }
    if (assistantOpen.value && workVisible.value) { void closeAssistant(); return true; }
    if (!wide.value && view.value === 'chat') { showWork(); return true; }
    if (page.value === 'home' || !trail.length && page.value === 'profile' && !state.value.teacher) { return false; }
    void go(trail.pop() ?? 'home', true); return true;
});
function askConfirm(action: string, input: Record<string, unknown>, text: string) {
    confirm.value = { action, input, text };
}
async function openRecord(id: string) {
    await request('records', { id, offset: state.value.records.offset });
    if (state.value.record?.id === id) { await go('books'); }
}
const { bubble, dismiss: dismissBubble } = useLearningCompanion({ root, state, pending, preference: uiSession.companion,
    reading: computed(() => workVisible.value && page.value === 'home' && state.value.unit?.kind === 'reading-writing'
        && ['writing', 'grading', 'complete'].includes(state.value.unit.stage.stage)),
    blocked: computed(() => assistantOpen.value || !!activity.value || !!confirm.value || menuOpen.value), request });
async function exportData() {
    const result = await request('export');
    if (!result?.document) { return; }
    const url = URL.createObjectURL(new Blob([JSON.stringify(result.document, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'LittleWhiteBox_Learning.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
</script>

<template>
    <section ref="root" class="learning-app" :style="{ '--learning-switch-ms': `${LEARNING_PANE_TRANSITION_MS}ms`, '--learning-work-share': `${workShare}%` }" aria-label="语伴语言学习">
        <header class="learning-toolbar">
            <button v-if="page !== 'home' && (state.teacher || trail.length) && (wide || view === 'work')" type="button" class="learning-toolbar-back" aria-label="返回上一页" @click="back"><LearningIcon name="back" /></button>
            <button type="button" class="learning-wordmark" @click="go('home')"><span class="learning-brand-mark" aria-hidden="true">a<span>あ</span></span>语伴<span v-if="workUnread && (wide || view === 'work')" class="learning-unread-dot" aria-hidden="true" /></button>
            <label v-if="wide && state.teacher" class="learning-layout-control"><LearningIcon name="workbook" /><input v-model.number="workShare" type="range" :min="shareMin" :max="shareMax" step="1" aria-label="阅读区宽度比例"><LearningIcon name="chat" /></label>
            <button ref="assistantButton" type="button" class="learning-assistant-button" :aria-label="dialogueCopy.assistant" :aria-expanded="assistantOpen" @click="assistantOpen ? closeAssistant() : openAssistant()"><LearningIcon name="chat" /><span>{{ dialogueCopy.assistant }}</span></button>
            <details ref="menu" class="learning-menu" @toggle="menuOpen = !!menu?.open" @keydown.esc.stop.prevent="menu!.open = false"><summary aria-label="学习资料与设置"><LearningIcon name="more" /></summary><nav aria-label="学习资料与设置"><button v-for="[id, label] in ([['books', '语法本与生词本'], ['materials', '课件与笔记'], ['harvest', '我的收获'], ['settings', '设置']] as const)" :key="id" type="button" @click="go(id)">{{ label }}</button></nav></details>
        </header>
        <div v-if="localMessage || !state.busy && (state.message || state.storage !== 'ready')" class="learning-notice" role="status" aria-live="polite">
            {{ localMessage || state.message || (state.storage === 'unconfirmed' ? LEARNING_STORAGE_COPY.unconfirmed : state.storage === 'conflict' ? LEARNING_STORAGE_COPY.conflict : state.storage === 'invalid' ? LEARNING_STORAGE_COPY.invalid : LEARNING_STORAGE_COPY.unloaded) }}
            <div class="learning-row">
                <button v-if="state.storage === 'unconfirmed' || state.storage === 'conflict'" type="button" :disabled="pending" @click="request('verify')">{{ copy.verify }}</button>
                <button v-if="state.storage === 'unconfirmed'" type="button" :disabled="pending" @click="request('retry-save')">{{ copy.retry }}</button>
                <button v-if="state.storage === 'conflict'" type="button" :disabled="pending" @click="askConfirm('adopt-server', {}, copy.adoptWarning)">{{ copy.adopt }}</button>
                <button v-if="state.storage === 'invalid'" type="button" class="learning-primary" :disabled="!canRequest('reset-learning')" @click="askConfirm('reset-learning', {}, LEARNING_DISCARD_COPY.resetLearning)">{{ LEARNING_CONFIRM_COPY['reset-learning'].accept }}</button>
                <button v-else-if="state.storage === 'unloaded' || needsRefresh" type="button" :disabled="pending" @click="request('read')">{{ LEARNING_REQUEST_COPY.refresh }}</button>
            </div>
        </div>
        <div v-if="['unconfirmed', 'conflict', 'failed'].includes(state.chatStorage)" class="learning-notice" role="status" aria-live="polite">
            {{ state.chatStorage === 'unconfirmed' ? teacherStorageCopy.unconfirmed : state.chatStorage === 'conflict' ? teacherStorageCopy.conflict : teacherStorageCopy.failed }}
            <div class="learning-row">
                <button type="button" :disabled="!canRequest('verify-teacher')" @click="request('verify-teacher')">{{ teacherStorageCopy.verify }}</button>
                <button v-if="state.chatStorage !== 'failed'" type="button" :disabled="!canRequest('adopt-teacher')" @click="askConfirm('adopt-teacher', {}, teacherStorageCopy.adoptWarning)">{{ teacherStorageCopy.adopt }}</button>
            </div>
        </div>
        <div v-if="['unconfirmed', 'conflict', 'failed'].includes(state.workbenchStorage)" class="learning-notice" role="status">
            {{ dialogueCopy.assistantStorage }}
            <button type="button" :disabled="pending" @click="request('verify-workbench')">{{ dialogueCopy.verify }}</button>
            <button v-if="state.workbenchStorage === 'conflict'" type="button" :disabled="pending" @click="askConfirm('adopt-workbench', {}, dialogueCopy.adoptConfirm)">{{ dialogueCopy.adopt }}</button>
        </div>
        <div class="learning-stage" :class="{ 'is-wide': wide, 'is-chat': !wide && view === 'chat' }">
            <div class="learning-pane is-work" :inert="!workVisible" :aria-hidden="!workVisible">
                <div class="learning-work-surface" :inert="!!activity" :aria-hidden="!!activity">
                    <LearningConversation v-if="workMounted && assistantOpen" ref="assistant" target="workbench" :state="state" :disabled="!canRequest('workbench-talk')" :pending="pending" @action="request" @present="present" @close="closeAssistant" />
                    <div v-show="!assistantOpen" ref="scroller" class="learning-scroll" @scroll.passive="rememberWorkScroll" @click="rememberStudy" @focusin="rememberStudy">
                        <template v-if="workMounted && !assistantOpen">
                            <LearningProcess v-if="workProcess" :key="workProcess.key" :turn="workProcess.turn" stoppable :disabled="pending" @stop="request(isLearningPreparation({ kind: workProcess.turn.purpose ?? 'talk' }) ? 'cancel-preparation' : 'cancel')">
                                <template v-if="state.storage === 'ready' && isLearningPreparation({ kind: workProcess.turn.purpose ?? 'talk' }) && !state.preparation?.running && (state.preparation || state.sourceChoice)" #default>
                                    <LearningPreparation :state="state" :disabled="!writable" :pending="pending" @action="workAction" />
                                </template>
                            </LearningProcess>
                            <p v-if="workProcess && !isLearningPreparation({ kind: workProcess.turn.purpose ?? 'talk' }) && learningTurnNotice(workProcess.turn, state.workbenchStorage, state.storage)" class="learning-turn-notice" :class="{ 'is-error': workProcess.turn.status === 'failed' }" role="status">{{ learningTurnNotice(workProcess.turn, state.workbenchStorage, state.storage) }}</p>
                            <div v-if="state.busy && workProcess?.turn.status !== 'running'" class="learning-working" role="status"><span class="learning-working-dot" aria-hidden="true" /><span>{{ state.message || copy.working }}</span><button type="button" :disabled="pending" @click="request('cancel')">停止</button></div>
                            <LearningWorkbench
                                v-if="page === 'home'" :state="state" :disabled="!writable" :pending="pending" :preparation-in-process="!!workProcess && isLearningPreparation({ kind: workProcess.turn.purpose ?? 'talk' })"
                                @action="workAction" @confirm="askConfirm" @present="present" @go="go" @ask="askTeacher" @assistant="openAssistant" @record="openRecord"
                            />
                            <LearningSetup v-if="page === 'profile'" :state="state" :disabled="!canRequest('language')" @action="request" />
                            <section v-if="page === 'materials'" class="learning-materials-page"><h1>课件与笔记</h1><p v-if="!state.unit" class="learning-empty-note">{{ state.blockedUnit ? '当前课件在另一个故事中' : '还没有课件' }}</p><template v-if="state.unit"><p class="learning-materials-title">{{ state.unit.title }}</p><button v-for="material in state.unit.materials" :key="material.id" type="button" class="learning-activity-link" @click="present({ unitId: state.unit.id, kind: 'material', id: material.id, title: material.title })"><LearningIcon name="book" /><span>{{ material.title }}</span><LearningIcon name="arrow" /></button><button v-for="exercise in state.unit.exercises" :key="exercise.id" type="button" class="learning-activity-link" @click="present({ unitId: state.unit.id, kind: 'exercise', id: exercise.id, title: exercise.prompt })"><LearningIcon name="records" /><span>{{ exercise.prompt }}</span><LearningIcon name="arrow" /></button><section v-if="state.unit.notes.length" class="learning-notes"><article v-for="note in state.unit.notes" :key="note.id"><blockquote v-if="note.selection">{{ note.selection.quote }}</blockquote><p>{{ note.text }}</p><button type="button" :disabled="!writable" @click="request('delete-note', { id: note.id })">删除笔记</button></article></section></template></section>
                            <LearningBooks v-if="page === 'books'" :state="state" :disabled="!canRequest('start-review')" @action="workAction" @review="openReview" @remove="askConfirm" />
                            <section v-if="page === 'harvest'" class="learning-harvest-page">
                                <div class="learning-page-heading"><h1>我的收获</h1></div>
                                <p v-if="!state.completions.length" class="learning-empty-note">还没有完成的课程</p>
                                <article v-for="completion in harvest" :key="completion.unitId" class="learning-harvest-entry">
                                    <small>{{ new Date(completion.completedAt).toLocaleDateString() }}</small>
                                    <h2 v-if="completion.rewardStatus !== 'retired'">{{ completion.rewardStatus === 'paid' ? '+' : '' }}{{ completion.amount }}<span>小白币</span></h2><p>{{ completion.summary }}</p>
                                    <p class="learning-muted">{{ completion.rewardStatus === 'paid' ? LEARNING_REWARD_COPY.paid : completion.rewardStatus === 'retired' ? LEARNING_REWARD_COPY.retired : LEARNING_REWARD_COPY.pending }}</p>
                                    <button v-if="completion.rewardStatus !== 'paid' && completion.rewardStatus !== 'retired'" type="button" :disabled="!writable || state.walletStorage !== 'ready'" @click="request('reward', { unitId: completion.unitId, openWallet: !state.walletOpen })">{{ state.walletOpen ? LEARNING_REWARD_COPY.claim : LEARNING_REWARD_COPY.openWallet }}</button>
                                </article>
                                <button v-if="state.walletStorage === 'unconfirmed' || state.walletStorage === 'conflict' || state.walletStorage === 'failed'" type="button" :disabled="pending || state.busy" @click="request('verify-wallet')">{{ copy.verifyWallet }}</button>
                                <button v-if="state.walletStorage === 'conflict'" type="button" :disabled="pending || state.busy" @click="askConfirm('adopt-wallet', {}, copy.adoptWalletWarning)">{{ copy.adoptWallet }}</button>
                                <div v-if="state.completions.length > 20" class="learning-row"><button type="button" :disabled="harvestPage === 0" @click="harvestPage--">上一页</button><button type="button" :disabled="(harvestPage + 1) * 20 >= state.completions.length" @click="harvestPage++">下一页</button></div>
                            </section>
                            <section v-if="page === 'settings'" class="learning-settings-page">
                                <h1>学习设置</h1>
                                <label>当前语言<select :value="state.language" :disabled="!canRequest('language')" @change="request('language', { language: ($event.target as HTMLSelectElement).value }); ($event.target as HTMLSelectElement).value = state.language"><option v-for="code in [...new Set([state.language, ...state.languages])]" :key="code" :value="code">{{ new Intl.DisplayNames(['zh-CN'], { type: 'language' }).of(code) }}</option></select></label>
                                <button type="button" @click="openProfile">更换语言和语伴 →</button>
                                <LearningCompanionControl />
                                <section>
                                    <h2>训练设置</h2>
                                    <p v-if="state.profile?.goal.description" class="learning-settings-goal">{{ state.profile.goal.description }}</p>
                                    <LearningSettingsCard :state="state" :disabled="!canRequest('settings')" @action="request" />
                                </section>
                                <section>
                                    <h2>语伴的声音</h2><p v-if="!state.voices.enabled" class="learning-muted">{{ copy.voiceDisabled }}</p>
                                    <form v-else @submit.prevent="request('voice', { voice: { voiceId: voice, language: voiceLanguage, speed: Number(speed) } })">
                                        <label>音色<select v-model="voice"><option v-for="item in state.voices.voices" :key="item.id" :value="item.id" :disabled="!item.available">{{ item.name }}{{ item.available ? '' : '（暂不可用）' }}</option></select></label>
                                        <label>发音语言<input v-model="voiceLanguage" type="text" maxlength="80" placeholder="en / ja"></label>
                                        <label>语速<select v-model="speed"><option :value="0.75">0.75×</option><option :value="1">1×</option><option :value="1.25">1.25×</option></select></label>
                                        <button type="submit" :disabled="!canRequest('voice') || !state.profile">保存声音设置</button>
                                    </form><button type="button" @click="request('tts-settings')">{{ state.voices.enabled ? LEARNING_VOICE_COPY.settings : LEARNING_VOICE_COPY.enable }}</button><small>已听过的题保留原声音，新偏好用于之后的题目。</small>
                                </section>
                                <section>
                                    <h2>学习数据</h2>
                                    <button type="button" :disabled="!canRequest('forget-conversation')" @click="askConfirm('forget-conversation', { target: 'companion' }, dialogueCopy.clearCompanionConfirm)">{{ dialogueCopy.clearCompanion }}</button>
                                    <button type="button" :disabled="!canRequest('forget-conversation')" @click="askConfirm('forget-conversation', { target: 'workbench' }, dialogueCopy.clearAssistantConfirm)">{{ dialogueCopy.clearAssistant }}</button>
                                    <button type="button" :disabled="!canRequest('export')" @click="exportData">导出学习数据</button><button type="button" :disabled="!canRequest('read')" @click="request('read')">重新加载</button>
                                    <button v-if="state.unit || state.blockedUnit" type="button" :disabled="!canRequest('abandon')" @click="askConfirm('abandon', {}, LEARNING_DISCARD_COPY.lesson)">放下当前练习</button>
                                    <button type="button" class="learning-danger" :disabled="!canRequest('delete-language') || !state.profile" @click="askConfirm('delete-language', {}, '删除当前语言的全部学习数据？未领取奖励也将放弃，已到账流水保留。')">删除当前语言</button>
                                    <button type="button" class="learning-danger" :disabled="!canRequest('clear')" @click="askConfirm('clear', {}, '清空所有语言的目标、课程和记录？未领取奖励也将放弃。已到账流水不撤销。')">清空全部学习数据</button>
                                </section>
                            </section>
                        </template>
                    </div>
                </div>
                <LearningActivity v-if="workMounted && state.unit && activity" :key="`${state.chatIdentity}:${state.language}:${state.unit.id}:${activity.kind}:${activity.id}`" :state="state" :target="activity" :active="workVisible" :disabled="!writable" @action="request" @close="closeActivity" @ask="askTeacher" />
            </div>
            <div v-if="state.teacher" class="learning-pane is-chat" :inert="!chatVisible" :aria-hidden="!chatVisible">
                <LearningConversation v-if="chatMounted" ref="conversation" target="companion" :state="state" :disabled="!canChat" :pending="pending" @action="request" @present="present" @profile="openProfile" />
            </div>
            <button v-if="!wide && view === 'work' && state.teacher" type="button" class="learning-float is-companion" :aria-label="unread ? `和${state.teacher.name}聊天，有新消息` : `和${state.teacher.name}聊天`" @click="showChat">
                <span class="learning-person-initial">{{ [...state.teacher.name][0] }}</span><span v-if="unread" class="learning-unread-dot" aria-hidden="true" />
            </button>
            <button v-if="!wide && view === 'chat'" type="button" class="learning-float is-workbook" :aria-label="workUnread ? '回到练习本，有新指引' : '回到练习本'" @click="showWork">
                <LearningIcon name="workbook" /><span v-if="workUnread" class="learning-unread-dot" aria-hidden="true" />
            </button>
            <aside v-if="bubble" class="learning-companion-bubble" :class="{ 'is-wide': wide }" aria-live="polite">
                <button type="button" @click="showChat(); dismissBubble()">{{ bubble }}</button>
                <button type="button" aria-label="收起这句话" @click="dismissBubble"><LearningIcon name="close" /></button>
            </aside>
        </div>
        <LearningPlayer v-if="!activity || !workVisible" :state="state" @action="request" />
        <LearningApproval v-if="state.approval" :approval="state.approval" :pending="pending" @action="request" />
        <div v-else-if="confirm" ref="confirmLayer" class="learning-confirm-shade" @keydown.esc.stop.prevent="confirm = null">
            <section role="alertdialog" aria-labelledby="learning-confirm-title" class="learning-confirm">
                <h2 id="learning-confirm-title">{{ LEARNING_CONFIRM_COPY[confirm.action].title }}</h2><p>{{ confirm.text }}</p>
                <div class="learning-row"><button autofocus type="button" @click="confirm = null">{{ ['language', 'teacher'].includes(confirm.action) ? LEARNING_DISCARD_COPY.keepEditing : copy.cancel }}</button><button type="button" class="learning-primary" :disabled="!canRequest(confirm.action)" @click="workAction(confirm.action, confirm.input, true); confirm = null">{{ LEARNING_CONFIRM_COPY[confirm.action].accept }}</button></div>
            </section>
        </div>
    </section>
</template>
