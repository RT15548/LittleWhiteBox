<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useAppBack, useAppLayer } from '../../../shell/app-src/navigation/app-navigation.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import LearningActivity from './LearningActivity.vue';
import LearningPlayer from './LearningPlayer.vue';
import LearningSetup from './LearningSetup.vue';
import LearningRecords from './LearningRecords.vue';
import type { LearningPresentation, LearningActivityPresentation } from '../application/presentation.js';
import type { LearningSelection } from '../../../domains/learning/notes.js';
import LearningIcon from './LearningIcon.vue';
import LearningConversation from './LearningConversation.vue';
import { useLearningState } from './use-learning-state.js';
import './learning.css';

const props = defineProps<XiaobaiOsAppProps>();
const { state, pending, writable, localMessage, request } = useLearningState(props);
type Page = 'teacher' | 'materials' | 'records' | 'harvest' | 'settings' | 'profile' | 'goals';
const page = ref<Page>(state.value.teacher ? 'teacher' : 'profile');
const trail: Page[] = [];
const menu = ref<HTMLDetailsElement | null>(null);
const menuOpen = ref(false);
useAppBack(() => { if (!menu.value?.open) { return false; } menu.value.open = false; return true; }, () => menuOpen.value);
const conversation = ref<InstanceType<typeof LearningConversation> | null>(null);
const activity = ref<LearningActivityPresentation | null>(null);
const scroller = ref<HTMLElement | null>(null);
const scrolls: Partial<Record<Page, number>> = {};
let recordListScroll = 0;
watch(() => !!state.value.record, async (reading, previous) => {
    if (page.value !== 'records' || reading === previous) { return; }
    if (reading) { recordListScroll = scroller.value?.scrollTop ?? 0; }
    await nextTick();
    if (page.value === 'records' && scroller.value) { scroller.value.scrollTop = reading ? 0 : recordListScroll; }
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
watch(() => state.value.currentUnitId, id => {
    if (confirm.value?.action === 'replace-lesson' && confirm.value.input.unitId !== id) { confirm.value = null; }
});
watch(() => state.value.unit, unit => {
    const target = activity.value;
    if (target && (unit?.id !== target.unitId || !(target.kind === 'exercise' ? unit.exercises : unit.materials).some(entry => entry.id === target.id))) { closeActivity(); }
});
watch(() => state.value.conversation.turns.length + state.value.conversation.removedTurns, (total, old) => {
    const target = state.value.conversation.turns.at(-1)?.presentation;
    if (total > old && target) { void present(target); }
});
function present(target: LearningPresentation) {
    if (target.kind === 'replacement') {
        if (state.value.currentUnitId !== target.unitId || state.value.storage !== 'ready') { return; }
        askConfirm('replace-lesson', { unitId: target.unitId, message: target.message }, '换一课？新课保存成功后会替换当前课件、原答和笔记；学习记录和已获得的奖励资格保留。');
        return;
    }
    if (state.value.unit?.id !== target.unitId) { return; }
    activity.value = target;
}
function closeActivity() { activity.value = null; void request('stop'); }
async function askTeacher(exerciseId?: string, selection?: LearningSelection) {
    closeActivity(); await go('teacher'); await conversation.value?.ask(exerciseId, selection);
}
async function go(next: Page, returning = false) {
    if (next !== page.value && !returning) {
        if (next === 'teacher') { trail.length = 0; }
        else {
            const existing = trail.indexOf(next);
            if (existing >= 0) { trail.splice(existing); }
            else { trail.push(page.value); }
        }
    }
    if (scroller.value) { scrolls[page.value] = scroller.value.scrollTop; }
    if (menu.value) { menu.value.open = false; }
    page.value = next;
    await nextTick();
    if (scroller.value) {
        scroller.value.scrollTop = scrolls[next] ?? 0;
        const heading = [...scroller.value.querySelectorAll<HTMLElement>('h1')].find(element => element.offsetParent !== null);
        if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
}
const back = useAppBack(() => {
    if (menu.value?.open) { menu.value.open = false; return true; }
    if (page.value === 'teacher' || !trail.length && page.value === 'profile' && !state.value.teacher) { return false; }
    void go(trail.pop() ?? 'teacher', true); return true;
});
function askConfirm(action: string, input: Record<string, unknown>, text: string) {
    confirm.value = { action, input, text };
}
async function exportData() {
    const result = await request('export');
    if (!result?.document) { return; }
    const url = URL.createObjectURL(new Blob([JSON.stringify(result.document, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'LittleWhiteBox_Learning.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
</script>

<template>
    <section class="learning-app" aria-label="语伴语言学习">
        <header class="learning-toolbar">
            <button v-if="page !== 'teacher' && (state.teacher || trail.length)" type="button" class="learning-toolbar-back" aria-label="返回上一页" @click="back"><LearningIcon name="back" /></button>
            <button type="button" class="learning-wordmark" @click="go('teacher')"><span class="learning-brand-mark" aria-hidden="true">a<span>あ</span></span>语伴</button>
            <details ref="menu" class="learning-menu" @toggle="menuOpen = !!menu?.open" @keydown.esc.stop.prevent="menu!.open = false"><summary aria-label="学习资料与设置"><LearningIcon name="more" /></summary><nav aria-label="学习资料与设置"><button v-for="[id, label] in ([['materials', '课件与笔记'], ['records', '学习记录'], ['goals', '学习目标'], ['harvest', '我的收获'], ['settings', '设置']] as const)" :key="id" type="button" @click="go(id)">{{ label }}</button></nav></details>
        </header>
        <div v-if="!state.busy && (state.message || localMessage || state.storage !== 'ready')" class="learning-notice" role="status" aria-live="polite">
            {{ localMessage || state.message || (state.storage === 'unconfirmed' ? '上次保存尚未确认，请先核实。' : state.storage === 'conflict' ? '学习文件出现另一版本，请先核实。' : '暂时无法读取学习文件。') }}
            <div class="learning-row">
                <button v-if="state.storage === 'unconfirmed' || state.storage === 'conflict'" type="button" :disabled="pending" @click="request('verify')">核实保存</button>
                <button v-if="state.storage === 'unconfirmed'" type="button" :disabled="pending" @click="request('retry-save')">重试原保存</button>
                <button v-if="state.storage === 'conflict'" type="button" :disabled="pending" @click="askConfirm('adopt-server', {}, '采用服务器上的学习文件？未确认的本次修改将不再作为候选保留。')">采用服务器版本</button>
                <button v-if="state.storage === 'unloaded' || localMessage" type="button" :disabled="pending" @click="request('read')">重试读取</button>
            </div>
        </div>
        <LearningConversation v-show="page === 'teacher'" ref="conversation" :state="state" :disabled="!writable" :pending="pending" @action="request" @present="present" @profile="go('profile')" />
        <div v-show="page !== 'teacher'" ref="scroller" class="learning-scroll">
            <div v-if="state.busy" class="learning-working" role="status"><span class="learning-working-dot" aria-hidden="true" /><span>{{ state.message || '正在处理学习操作…' }}</span><button type="button" :disabled="pending" @click="request('cancel')">停止</button></div>
            <LearningSetup v-if="page === 'profile'" :state="state" :disabled="!writable" @action="request" @done="go('teacher')" />
            <section v-if="page === 'materials'" class="learning-materials-page"><h1>课件与笔记</h1><p v-if="!state.unit" class="learning-empty-note">{{ state.blockedUnit ? '当前课件在另一个故事中' : '还没有课件' }}</p><template v-if="state.unit"><p class="learning-materials-title">{{ state.unit.title }}</p><button v-for="material in state.unit.materials" :key="material.id" type="button" class="learning-activity-link" @click="present({ unitId: state.unit.id, kind: 'material', id: material.id, title: material.title })"><LearningIcon name="book" /><span>{{ material.title }}</span><LearningIcon name="arrow" /></button><button v-for="exercise in state.unit.exercises" :key="exercise.id" type="button" class="learning-activity-link" @click="present({ unitId: state.unit.id, kind: 'exercise', id: exercise.id, title: exercise.prompt })"><LearningIcon name="records" /><span>{{ exercise.prompt }}</span><LearningIcon name="arrow" /></button><section v-if="state.unit.notes.length" class="learning-notes"><article v-for="note in state.unit.notes" :key="note.id"><blockquote v-if="note.selection">{{ note.selection.quote }}</blockquote><p>{{ note.text }}</p><button type="button" :disabled="!writable" @click="request('delete-note', { id: note.id })">删除笔记</button></article></section></template></section>
            <section v-if="page === 'goals'" class="learning-goals-page"><h1>学习目标</h1><template v-if="state.profile"><p>{{ state.profile.goal.description }}</p><p v-if="state.profile.goal.exam">{{ state.profile.goal.exam }}</p><p v-if="state.profile.goal.targetLevel">{{ state.profile.goal.targetLevel }}</p><p v-if="state.profile.goal.targetDate">{{ state.profile.goal.targetDate }}</p><h2>自评水平</h2><p>{{ state.profile.selfAssessment }}</p></template><p v-else class="learning-empty-note">还没有记录目标</p><button type="button" class="learning-primary" @click="go('teacher'); conversation?.focus()">和老师聊聊</button></section>
            <LearningRecords v-if="page === 'records'" :state="state" :disabled="!writable" @action="request" @remove="askConfirm" />
            <section v-if="page === 'harvest'" class="learning-harvest-page">
                <div class="learning-page-heading"><h1>我的收获</h1></div>
                <p v-if="!state.completions.length" class="learning-empty-note">还没有完成的课程</p>
                <article v-for="completion in harvest" :key="completion.unitId" class="learning-harvest-entry">
                    <small>{{ new Date(completion.completedAt).toLocaleDateString() }}</small>
                    <h2>+{{ completion.amount }}<span>小白币</span></h2><p>{{ completion.summary }}</p>
                    <p class="learning-muted">{{ completion.paid ? '已到账' : !completion.originHere ? '请回到开课的原聊天领取' : '学习已完成，等待到账' }}</p>
                    <button v-if="!completion.paid && completion.originHere" type="button" :disabled="!writable" @click="request('reward', { unitId: completion.unitId, openWallet: !state.walletOpen })">{{ state.walletOpen ? '核实并补领' : '开通钱包并领取' }}</button>
                </article>
                <button v-if="state.chatStorage === 'unconfirmed' || state.chatStorage === 'conflict' || state.chatStorage === 'failed'" type="button" :disabled="pending || state.busy" @click="request('verify-wallet')">核实账本保存</button>
                <button v-if="state.chatStorage === 'conflict'" type="button" :disabled="pending || state.busy" @click="askConfirm('adopt-wallet', {}, '采用服务器上的聊天账本？本次未确认的候选将被放下，之后可凭已保存的学习完成记录核实并补领。')">采用服务器账本</button>
                <div v-if="state.completions.length > 20" class="learning-row"><button type="button" :disabled="harvestPage === 0" @click="harvestPage--">上一页</button><button type="button" :disabled="(harvestPage + 1) * 20 >= state.completions.length" @click="harvestPage++">下一页</button></div>
            </section>
            <section v-if="page === 'settings'" class="learning-settings-page">
                <h1>学习设置</h1>
                <label>当前语言<select :value="state.language" :disabled="!writable" @change="request('language', { language: ($event.target as HTMLSelectElement).value })"><option v-for="code in [...new Set([state.language, ...state.languages])]" :key="code" :value="code">{{ new Intl.DisplayNames(['zh-CN'], { type: 'language' }).of(code) }}</option></select></label>
                <button type="button" @click="go('profile')">更换语言和老师 →</button>
                <section>
                    <h2>老师的声音</h2><p v-if="!state.voices.enabled" class="learning-muted">使用语音前，请先开启 TTS 模块。文字学习不受影响。</p>
                    <form v-else @submit.prevent="request('voice', { voice: { voiceId: voice, language: voiceLanguage, speed: Number(speed) } })">
                        <label>音色<select v-model="voice"><option v-for="item in state.voices.voices" :key="item.id" :value="item.id" :disabled="!item.available">{{ item.name }}{{ item.available ? '' : '（暂不可用）' }}</option></select></label>
                        <label>发音语言<input v-model="voiceLanguage" type="text" maxlength="80" placeholder="en / ja"></label>
                        <label>合成语速<select v-model="speed"><option :value="0.75">0.75×</option><option :value="1">1×</option><option :value="1.25">1.25×</option></select></label>
                        <button type="submit" :disabled="!writable || !state.profile">保存声音偏好</button>
                    </form><button type="button" @click="request('tts-settings')">{{ state.voices.enabled ? '打开 TTS 设置' : '如何开启 TTS' }}</button><small>已听过的题保留原声音，新偏好用于之后的题目。</small>
                </section>
                <section>
                    <h2>学习数据</h2>
                    <button type="button" :disabled="pending || state.busy" @click="askConfirm('forget-conversation', {}, '清空和当前老师的临时对话？目标、课件、学习记录和奖励都会保留。')">清空师生对话</button>
                    <button type="button" :disabled="!writable" @click="exportData">导出学习数据</button><button type="button" :disabled="pending || state.busy" @click="request('read')">重新读取保存内容</button>
                    <button v-if="state.unit || state.blockedUnit" type="button" :disabled="!writable" @click="askConfirm('abandon', {}, '放下当前这一课？本课课件、原答和笔记会移除；已被学习项保留的证据和完成奖励资格仍保留。')">放下当前课件</button>
                    <button type="button" class="learning-danger" :disabled="!writable || !state.profile" @click="askConfirm('delete-language', {}, '删除当前语言的全部学习数据？未领取奖励也将放弃，已到账流水保留。')">删除当前语言</button>
                    <button type="button" class="learning-danger" :disabled="!writable" @click="askConfirm('clear', {}, '清空所有语言的目标、课程和记录？未领取奖励也将放弃。已到账流水不撤销。')">清空全部学习数据</button>
                </section>
            </section>
        </div>
        <LearningPlayer v-if="!activity" :state="state" @action="request" />
        <LearningActivity v-if="state.unit" :key="`${state.chatIdentity}:${state.language}:${state.unit.id}`" :state="state" :target="activity" :disabled="!writable" @action="request" @close="closeActivity" @ask="askTeacher" />
        <div v-if="confirm" ref="confirmLayer" class="learning-confirm-shade" @keydown.esc.stop.prevent="confirm = null">
            <section role="alertdialog" aria-labelledby="learning-confirm-title" class="learning-confirm">
                <h2 id="learning-confirm-title">确认这次操作</h2><p>{{ confirm.text }}</p>
                <div class="learning-row"><button autofocus type="button" @click="confirm = null">先不改</button><button type="button" class="learning-primary" :disabled="pending || state.busy" @click="request(confirm.action, confirm.input); confirm = null">确认</button></div>
            </section>
        </div>
    </section>
</template>
