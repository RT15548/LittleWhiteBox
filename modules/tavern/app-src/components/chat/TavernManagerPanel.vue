<script setup lang="ts">
import { computed, nextTick, shallowRef, watch } from 'vue';
import TavernAssistantContextButton from './TavernAssistantContextButton.vue';
import TavernAssistantToolRun from './TavernAssistantToolRun.vue';
import { loadTavernAssistantToolTurnDetail } from '../../features/assistant-chat/assistant-chat-projection';
import TavernScrollControls from '../TavernScrollControls.vue';
import { useTavernChatContext, useTavernManagerContext, useTavernSessionContext, useTavernShellContext } from '../tavern-app-context';
import { useTavernEphemeralDisclosureScope } from '../useTavernEphemeralDisclosureScope';
import { getTavernManagerRun, type TavernManagerRunRecord } from '../../../shared/session-db';

const emit = defineEmits<{
    (event: 'open-contract'): void;
}>();

const shell = useTavernShellContext();
const chat = useTavernChatContext();
const manager = useTavernManagerContext();
const session = useTavernSessionContext();
const {
    activeView,
    homeThemeDark,
    shortText,
} = shell;
const {
    chatFocus,
    cancelEditMessage,
    formatMessageTime,
    htmlRenderEnabled,
    markdownSignature,
    renderChatMarkdown,
    roleLabel,
    thoughtSummaryLabel,
} = chat;
const {
    assistantChatContextLabel,
    assistantChatContextUsage,
    archivedManagerRuns,
    canClearAssistantChat,
    canEditManagerMessage,
    canRerunManagerMessage,
    canSendManagerMessage,
    clearAssistantChatHistory,
    copyManagerMessage,
    currentManagerWorkRun: currentManagerWorkRunSummary,
    deleteManagerMessageTurn,
    editingMessageDraft,
    enhanceManagerMarkdown,
    formatRunActivityLine,
    formatRunIssueLine,
    formatRunInputLine,
    formatRunMapLine,
    formatRunMemoryLine,
    formatRunModelLine,
    handleEditInput,
    handleManagerComposeKeydown,
    handleManagerComposeInput,
    handleManagerEditKeydown,
    handleManagerScroll,
    handleManagerSubmit,
    handleManagerTouchMove,
    handleManagerTouchStart,
    handleManagerWheel,
    hiddenManagerRunCount,
    isEditingManagerMessage,
    isEditingManagerMessageDirty,
    isManagerAssistantCancelling,
    isManagerAssistantRunning,
    isManagerRunRetrying,
    liveManagerAssistantDraft,
    liveManagerToolRound,
    loadManagerMessageThoughts,
    managerActionFeedback,
    managerBusy,
    managerCompactionOverlay,
    managerComposeTextareaRef,
    managerChatHasMore,
    managerInputDraft,
    managerPendingUserMessage,
    managerRunDisplayStatus,
    managerRunTone,
    managerScrollControlsActive,
    managerScrollRef,
    managerWorkRef,
    managerStatusLabel,
    managerToolStatusLabel,
    managerToolTone,
    managerToolTraceItems,
    retryManagerRun,
    revealOlderManagerMessages,
    rerunFromManagerMessage,
    saveEditManagerMessage,
    scrollManagerToBottom,
    scrollManagerToTop,
    showManagerScrollBottom,
    showManagerScrollTop,
    startEditManagerMessage,
    toolTraceSummary,
    updateManagerScrollButtons,
    visibleManagerChatItems,
} = manager;

function setManagerScrollRef(element: Element | null) {
    managerScrollRef.value = element instanceof HTMLElement ? element : null;
}

function setManagerWorkRef(element: Element | null) {
    managerWorkRef.value = element instanceof HTMLElement ? element : null;
}

function setManagerComposeTextareaRef(element: Element | null) {
    managerComposeTextareaRef.value = element instanceof HTMLTextAreaElement ? element : null;
}

function handleManagerWorkBandToggle(event: Event) {
    managerWorkDisclosure.setOpenFromEvent(managerWorkDisclosureId(), event);
    if ((event.currentTarget as HTMLDetailsElement | null)?.open) {
        void loadCurrentManagerWorkRunDetail();
    } else {
        managerWorkRunDetailRequest += 1;
        managerWorkRunDetail.value = null;
    }
    void nextTick(() => {
        enhanceManagerMarkdown();
        updateManagerScrollButtons();
    });
}

function openContractModal() {
    emit('open-contract');
}

const managerWorkDisclosure = useTavernEphemeralDisclosureScope();
const assistantChatDisclosure = useTavernEphemeralDisclosureScope();
const managerWorkRunDetail = shallowRef<TavernManagerRunRecord | null>(null);
let managerWorkRunDetailRequest = 0;

const currentManagerWorkRun = computed(() => {
    const summary = currentManagerWorkRunSummary.value;
    const detail = managerWorkRunDetail.value;
    if (!summary || !detail || detail.id !== summary.id || Number(detail.updatedAt) !== Number(summary.updatedAt)) {
        return summary;
    }
    return detail;
});

async function loadCurrentManagerWorkRunDetail(): Promise<void> {
    const summary = currentManagerWorkRunSummary.value;
    if (!summary) {
        managerWorkRunDetail.value = null;
        return;
    }
    const request = ++managerWorkRunDetailRequest;
    const detail = await getTavernManagerRun(summary.id);
    if (request !== managerWorkRunDetailRequest
        || !managerWorkDisclosure.isOpen(managerWorkDisclosureId())
        || currentManagerWorkRunSummary.value?.id !== summary.id
    ) {return;}
    managerWorkRunDetail.value = detail;
    await nextTick();
    enhanceManagerMarkdown();
    updateManagerScrollButtons();
}

function releaseManagerWorkRunDetail(): void {
    managerWorkRunDetailRequest += 1;
    managerWorkRunDetail.value = null;
}

function managerMarkdownSignature(text = '') {
    return markdownSignature([
        text,
        htmlRenderEnabled.value ? 'html-render:on' : 'html-render:off',
        homeThemeDark.value ? 'theme:dark' : 'theme:light',
    ].join('\u0000'));
}

function managerDisclosureId(kind: string, ...parts: Array<string | number | undefined>) {
    return `manager:${kind}:${parts.map((part) => String(part ?? '')).join(':')}`;
}

function managerWorkDisclosureId() {
    return managerDisclosureId('work-band', currentManagerWorkRunSummary.value?.id || '');
}

const managerChatMessageItems = computed(() => visibleManagerChatItems.value);
const visibleManagerLiveToolCalls = computed(() => liveManagerToolRound.value?.calls.slice(-8) || []);
const managerMessageThoughts = shallowRef<Record<string, Array<{ label?: string; text: string }>>>({});
const managerMessageThoughtsLoading = shallowRef<Record<string, true>>({});
const managerMessageThoughtErrors = shallowRef<Record<string, string>>({});

function releaseManagerMessageThoughts() {
    managerMessageThoughts.value = {};
    managerMessageThoughtsLoading.value = {};
    managerMessageThoughtErrors.value = {};
}

async function handleManagerMessageThoughtToggle(item: Extract<(typeof managerChatMessageItems.value)[number], { kind: 'message' }>, event: Event) {
    const disclosureId = managerDisclosureId('chat-thoughts', item.key);
    const open = Boolean((event.currentTarget as HTMLDetailsElement | null)?.open);
    assistantChatDisclosure.setOpen(disclosureId, open);
    if (!open) {
        const nextThoughts = { ...managerMessageThoughts.value };
        const nextLoading = { ...managerMessageThoughtsLoading.value };
        const nextErrors = { ...managerMessageThoughtErrors.value };
        delete nextThoughts[item.key];
        delete nextLoading[item.key];
        delete nextErrors[item.key];
        managerMessageThoughts.value = nextThoughts;
        managerMessageThoughtsLoading.value = nextLoading;
        managerMessageThoughtErrors.value = nextErrors;
        return;
    }
    if (managerMessageThoughts.value[item.key] || managerMessageThoughtsLoading.value[item.key]) {return;}
    const nextErrors = { ...managerMessageThoughtErrors.value };
    delete nextErrors[item.key];
    managerMessageThoughtErrors.value = nextErrors;
    managerMessageThoughtsLoading.value = { ...managerMessageThoughtsLoading.value, [item.key]: true };
    try {
        const thoughts = await loadManagerMessageThoughts(item);
        if (!assistantChatDisclosure.isOpen(disclosureId)) {return;}
        managerMessageThoughts.value = { ...managerMessageThoughts.value, [item.key]: thoughts };
    } catch (error) {
        if (!assistantChatDisclosure.isOpen(disclosureId)) {return;}
        console.warn('[小白酒馆] 读取助手思考过程失败', error);
        managerMessageThoughtErrors.value = {
            ...managerMessageThoughtErrors.value,
            [item.key]: '思考过程读取失败。',
        };
    } finally {
        const next = { ...managerMessageThoughtsLoading.value };
        delete next[item.key];
        managerMessageThoughtsLoading.value = next;
    }
}
const pendingManagerUserRenderState = computed(() => {
    const text = String(managerPendingUserMessage.value?.content || '').trim();
    return {
        text,
        signature: managerMarkdownSignature(`${text}\u0000pending-user`),
    };
});
const currentManagerTraceItems = computed(() => (
    currentManagerWorkRun.value ? managerToolTraceItems(currentManagerWorkRun.value.toolTrace) : []
));
const managerWorkVisible = computed(() => Boolean(
    currentManagerWorkRun.value
));
const managerWorkHistoryTotal = computed(() => archivedManagerRuns.value.length + hiddenManagerRunCount.value);

function managerRunKindLabel(run: TavernManagerRunRecord | null | undefined) {
    if (!run) {return '工作记录';}
    if (['accepted_turn', 'after_turn'].includes(run.trigger)) {return '已接受回合维护';}
    return '自动维护';
}

function managerToolActionLabel(name = '') {
    const toolName = String(name || '').trim();
    if (/^(read|list)/i.test(toolName)) {return '正在读取资料';}
    if (/^(write|edit)/i.test(toolName)) {return '正在更新记忆';}
    if (/status/i.test(toolName)) {return '正在更新状态栏';}
    if (/map|atlas|scene/i.test(toolName)) {return '正在更新场景地图';}
    if (/search|tavily/i.test(toolName)) {return '正在搜索资料';}
    return toolName ? `正在运行 ${toolName}` : '正在处理工具任务';
}

function managerWorkTitle(run: TavernManagerRunRecord) {
    if (isManagerRunRetrying(run)) {return '正在重新维护';}
    const labels: Record<string, string> = {
        queued: '等待后台维护',
        running: '正在维护上一轮剧情',
        interrupted: '后台维护已中断',
        completed: '后台维护完成',
        failed: '后台维护失败',
        cancelled: '后台维护已停止',
        superseded: '本次维护已作废',
    };
    return labels[managerRunDisplayStatus(run)] || '后台维护';
}

function managerWorkSummaryLine(run: TavernManagerRunRecord) {
    if (isManagerRunRetrying(run)) {return '正在重新连接后台模型，等待新的处理结果。';}
    const status = managerRunDisplayStatus(run);
    if (status === 'queued') {return '上一轮剧情已经确认，正在等待后台开始。';}
    if (status === 'running') {
        const activeTool = [...currentManagerTraceItems.value]
            .reverse()
            .find((tool) => tool.status === 'running');
        if (activeTool) {
            return [
                managerToolActionLabel(activeTool.name),
                activeTool.path ? shortText(activeTool.path, 68) : '',
            ].filter(Boolean).join(' · ');
        }
        if (currentManagerTraceItems.value.length) {return '工具处理完成，正在整理本轮结果。';}
        return '正在阅读上一轮剧情，判断需要更新哪些内容。';
    }
    if (status === 'completed') {
        const changedFiles = Array.isArray(run.changedFiles) ? run.changedFiles.length : 0;
        const changedStates = Array.isArray(run.changedStates) ? run.changedStates.length : 0;
        if (changedFiles && changedStates) {return `已更新 ${changedFiles} 项记忆与 ${changedStates} 项世界状态。`;}
        if (changedFiles) {return `已更新 ${changedFiles} 项记忆。`;}
        if (changedStates) {return `已更新 ${changedStates} 项世界状态。`;}
        return '检查完成，没有需要更新的内容。';
    }
    if (status === 'failed') {
        return shortText(formatRunIssueLine(run).replace(/^原因：/, ''), 100) || '运行失败，展开可查看原因并重试。';
    }
    if (status === 'cancelled') {return '后台工作已停止，没有采用未完成的结果。';}
    if (status === 'superseded') {return '剧情内容已经变化，这次旧结果没有采用。';}
    return formatRunActivityLine(run) || '暂无更多信息。';
}

const managerWorkBandTone = computed(() => currentManagerWorkRun.value
    ? managerRunTone(currentManagerWorkRun.value)
    : 'neutral');
const managerWorkBandTitle = computed(() => currentManagerWorkRun.value
    ? managerWorkTitle(currentManagerWorkRun.value)
    : '后台维护');
const managerWorkBandSummaryLine = computed(() => (
    currentManagerWorkRun.value
        ? managerWorkSummaryLine(currentManagerWorkRun.value)
        : '当前没有后台工作。'
));

watch(
    () => [
        currentManagerWorkRunSummary.value?.id || '',
        currentManagerWorkRunSummary.value?.status || '',
        Number(currentManagerWorkRunSummary.value?.updatedAt) || 0,
    ] as const,
    (next, previous) => {
        if (next.every((value, index) => value === previous?.[index])) {return;}
        managerWorkRunDetailRequest += 1;
        managerWorkRunDetail.value = null;
        if (managerWorkDisclosure.isOpen(managerWorkDisclosureId())) {
            void loadCurrentManagerWorkRunDetail();
        }
    },
);

watch(
    [activeView, chatFocus],
    ([view, focus]) => {
        if (view !== 'chat' || focus !== 'manager') {
            managerWorkDisclosure.reset();
            releaseManagerWorkRunDetail();
            assistantChatDisclosure.reset();
            releaseManagerMessageThoughts();
        }
    },
);

let previousManagerChatItemKeys = new Set<string>();
watch(
    () => managerChatMessageItems.value.map((item) => item.key),
    (itemKeys) => {
        const currentKeys = new Set(itemKeys);
        if ([...previousManagerChatItemKeys].some((key) => !currentKeys.has(key))) {
            assistantChatDisclosure.reset();
        }
        managerMessageThoughts.value = Object.fromEntries(
            Object.entries(managerMessageThoughts.value).filter(([key]) => currentKeys.has(key)),
        );
        managerMessageThoughtsLoading.value = Object.fromEntries(
            Object.entries(managerMessageThoughtsLoading.value).filter(([key]) => currentKeys.has(key)),
        );
        managerMessageThoughtErrors.value = Object.fromEntries(
            Object.entries(managerMessageThoughtErrors.value).filter(([key]) => currentKeys.has(key)),
        );
        previousManagerChatItemKeys = currentKeys;
    },
    { immediate: true },
);

watch(session.selectedSessionId, () => {
    releaseManagerWorkRunDetail();
    managerWorkDisclosure.reset();
    assistantChatDisclosure.reset();
    releaseManagerMessageThoughts();
});
</script>

<template>
  <section
    class="chat-face chat-face-back chat-manager"
    :aria-hidden="chatFocus === 'chat'"
  >
    <header class="manager-head">
      <div class="manager-head-actions">
        <TavernAssistantContextButton
          :label="assistantChatContextLabel"
          :usage="assistantChatContextUsage"
          :can-clear="canClearAssistantChat"
          :busy="isManagerAssistantRunning"
          @clear="clearAssistantChatHistory"
        />
        <button
          type="button"
          class="contract-trigger"
          title="契约"
          aria-label="契约"
          @click="openContractModal"
        >
          契约
        </button>
        <button
          type="button"
          class="chat-flip-trigger"
          title="角色聊天"
          aria-label="角色聊天"
          @click="chatFocus = 'chat'"
        >
          角色
        </button>
      </div>
    </header>

    <details
      v-if="managerWorkVisible"
      :ref="setManagerWorkRef"
      class="manager-work-band"
      :class="`tone-${managerWorkBandTone}`"
      :open="managerWorkDisclosure.isOpen(managerWorkDisclosureId())"
      @toggle="handleManagerWorkBandToggle"
    >
      <summary>
        <span
          class="manager-work-status-dot"
          aria-hidden="true"
        />
        <span class="manager-work-summary-copy">
          <strong>{{ managerWorkBandTitle }}</strong>
          <span>{{ managerWorkBandSummaryLine }}</span>
        </span>
      </summary>
      <div
        v-if="managerWorkDisclosure.isOpen(managerWorkDisclosureId())"
        class="manager-work-band-body"
      >
        <section
          v-if="currentManagerWorkRun"
          class="manager-work-section manager-work-current"
          :class="[`is-${managerRunDisplayStatus(currentManagerWorkRun)}`, `tone-${managerRunTone(currentManagerWorkRun)}`, { 'is-retrying': isManagerRunRetrying(currentManagerWorkRun) }]"
          :aria-busy="isManagerRunRetrying(currentManagerWorkRun) ? 'true' : 'false'"
        >
          <div class="manager-work-section-head">
            <strong>本次运行</strong>
            <small>{{ managerRunKindLabel(currentManagerWorkRun) }} · {{ isManagerRunRetrying(currentManagerWorkRun) ? '重试中' : managerStatusLabel(currentManagerWorkRun) }}</small>
          </div>
          <p class="manager-work-source">
            {{ formatRunInputLine(currentManagerWorkRun) }}
          </p>
          <p>{{ formatRunModelLine(currentManagerWorkRun) }}</p>
          <p class="manager-run-activity">
            {{ isManagerRunRetrying(currentManagerWorkRun) ? '重试已开始 · 正在等 API/工具返回' : formatRunActivityLine(currentManagerWorkRun) }}
          </p>
          <div class="manager-work-status-grid">
            <p>{{ formatRunMemoryLine(currentManagerWorkRun) }}</p>
            <p>{{ formatRunMapLine(currentManagerWorkRun) }}</p>
          </div>
          <p v-if="currentManagerWorkRun.outputText">
            结果：{{ shortText(currentManagerWorkRun.outputText, 180) }}
          </p>
          <p
            v-if="formatRunIssueLine(currentManagerWorkRun)"
            class="manager-work-issue-line"
          >
            {{ formatRunIssueLine(currentManagerWorkRun) }}
          </p>
          <button
            v-if="currentManagerWorkRun.status === 'failed'"
            type="button"
            class="manager-run-retry-button"
            :disabled="managerBusy || isManagerRunRetrying(currentManagerWorkRun)"
            @click="retryManagerRun(currentManagerWorkRun)"
          >
            {{ isManagerRunRetrying(currentManagerWorkRun) ? '重试中' : '重试' }}
          </button>
        </section>
        <section
          v-if="currentManagerWorkRun && currentManagerTraceItems.length"
          class="manager-work-section manager-work-tools"
        >
          <div class="manager-work-section-head">
            <strong>工具调用</strong>
            <small>{{ toolTraceSummary(currentManagerWorkRun.toolTrace, currentManagerWorkRun) }}</small>
          </div>
          <div class="manager-tool-list">
            <div
              v-for="tool in currentManagerTraceItems"
              :key="tool.displayKey"
              class="manager-tool-item"
              :class="managerToolTone(tool, currentManagerWorkRun)"
            >
              <div class="manager-tool-head">
                <span>{{ tool.name }}</span>
                <em>{{ managerToolStatusLabel(tool, currentManagerWorkRun) }}<template v-if="tool.elapsedLabel"> · {{ tool.elapsedLabel }}</template></em>
              </div>
              <details
                v-if="tool.thoughts.length"
                class="manager-tool-thoughts"
                :open="managerWorkDisclosure.isOpen(managerDisclosureId('work-tool-thoughts', currentManagerWorkRun.id, tool.displayKey))"
                @toggle="managerWorkDisclosure.setOpenFromEvent(managerDisclosureId('work-tool-thoughts', currentManagerWorkRun.id, tool.displayKey), $event)"
              >
                <summary>{{ thoughtSummaryLabel(tool.thoughts, false) }}</summary>
                <template
                  v-if="managerWorkDisclosure.isOpen(managerDisclosureId('work-tool-thoughts', currentManagerWorkRun.id, tool.displayKey))"
                >
                  <div
                    v-for="(thought, thoughtIndex) in tool.thoughts"
                    :key="`${tool.displayKey}-stored-thought-${thoughtIndex}`"
                    class="chat-thought-block"
                  >
                    <strong>{{ thought.label }}</strong>
                    <pre>{{ thought.text }}</pre>
                  </div>
                </template>
              </details>
              <div
                v-if="tool.preface"
                :key="`work-tool-preface:${currentManagerWorkRun.id}:${tool.displayKey}:${managerMarkdownSignature(tool.preface)}`"
                class="manager-tool-preface xb-tavern-markdown"
                :data-markdown-signature="managerMarkdownSignature(tool.preface)"
                v-html="renderChatMarkdown(tool.preface)"
              />
              <small v-if="tool.args">{{ tool.args }}</small>
              <p v-if="tool.summary">
                {{ tool.summary }}
              </p>
              <p v-if="tool.path">
                {{ tool.path }}
              </p>
            </div>
          </div>
        </section>

        <details
          v-if="managerWorkHistoryTotal"
          class="manager-work-history"
          :open="managerWorkDisclosure.isOpen(managerDisclosureId('work-history'))"
          @toggle="managerWorkDisclosure.setOpenFromEvent(managerDisclosureId('work-history'), $event)"
        >
          <summary>
            <strong>历史记录</strong>
            <span>{{ managerWorkHistoryTotal }} 条</span>
          </summary>
          <template v-if="managerWorkDisclosure.isOpen(managerDisclosureId('work-history'))">
            <div
              v-for="run in archivedManagerRuns"
              :key="run.id"
              class="manager-history-row"
              :class="[`tone-${managerRunTone(run)}`]"
            >
              <div>
                <strong>{{ managerRunKindLabel(run) }} · {{ managerStatusLabel(run) }}</strong>
                <small>{{ formatRunInputLine(run) }}</small>
              </div>
              <span>{{ toolTraceSummary(run.toolTrace, run) || formatRunActivityLine(run) }}</span>
            </div>
            <p v-if="hiddenManagerRunCount">
              更早 {{ hiddenManagerRunCount }} 条已收起。
            </p>
          </template>
        </details>
      </div>
    </details>

    <div class="chat-scroll-shell manager-scroll-shell">
      <div
        :ref="setManagerScrollRef"
        class="manager-chat-scroll"
        @scroll="handleManagerScroll"
        @wheel.passive="handleManagerWheel"
        @touchstart.passive="handleManagerTouchStart"
        @touchmove.passive="handleManagerTouchMove"
      >
        <div class="manager-chat-log">
          <div
            v-if="managerCompactionOverlay?.active"
            class="manager-compaction-overlay"
            :class="{ resolved: managerCompactionOverlay.resolved }"
            role="status"
            aria-live="polite"
          >
            <strong>{{ managerCompactionOverlay.status }}</strong>
            <small>
              {{ managerCompactionOverlay.currentTokens }} / {{ managerCompactionOverlay.triggerTokens || '...' }}
              <span v-if="managerCompactionOverlay.yieldTokens"> → {{ managerCompactionOverlay.yieldTokens }}</span>
              <span v-if="managerCompactionOverlay.fixedTokens">
                · 固定 {{ managerCompactionOverlay.fixedTokens }} + 对话 {{ managerCompactionOverlay.historyTokens || 0 }}
              </span>
            </small>
          </div>
          <div
            v-if="managerChatHasMore"
            class="chat-history-gate manager-history-gate"
            role="button"
            tabindex="0"
            @click="revealOlderManagerMessages()"
            @keydown.enter.prevent="revealOlderManagerMessages()"
            @keydown.space.prevent="revealOlderManagerMessages()"
          >
            展开较早记录
          </div>
          <template
            v-for="item in managerChatMessageItems"
            :key="item.key"
          >
            <article
              v-if="item.kind === 'message'"
              :data-manager-anchor-key="item.anchorKey"
              class="manager-card manager-message"
              :class="item.role === 'user' ? 'manager-message-user' : 'manager-message-assistant'"
            >
              <div class="manager-run-title">
                <strong>{{ item.role === 'user' ? roleLabel('user') : '助手' }}</strong>
                <small>{{ formatMessageTime(item.createdAt) }}</small>
              </div>
              <div
                v-if="isEditingManagerMessage(item)"
                class="message-edit-panel manager-message-edit-panel"
              >
                <textarea
                  v-model="editingMessageDraft"
                  class="message-edit-box"
                  rows="6"
                  :data-manager-message-editor="`manager:${item.sessionId}:${item.order}`"
                  @input="handleEditInput"
                  @keydown="handleManagerEditKeydown($event, item)"
                />
                <div class="message-edit-actions">
                  <button
                    type="button"
                    :disabled="!isEditingManagerMessageDirty(item)"
                    @click="saveEditManagerMessage(item)"
                  >
                    {{ item.role === 'user' ? '保存' : '保存修改' }}
                  </button>
                  <button
                    v-if="item.role === 'user'"
                    type="button"
                    :disabled="!isEditingManagerMessageDirty(item)"
                    @click="saveEditManagerMessage(item, { rerun: true })"
                  >
                    保存并重发
                  </button>
                  <button
                    type="button"
                    @click="cancelEditMessage"
                  >
                    取消
                  </button>
                </div>
              </div>
              <div
                v-if="!isEditingManagerMessage(item)"
                class="manager-message-thoughts"
              >
                <details
                  v-if="item.thoughtCount"
                  :open="assistantChatDisclosure.isOpen(managerDisclosureId('chat-thoughts', item.key))"
                  @toggle="handleManagerMessageThoughtToggle(item, $event)"
                >
                  <summary>思考过程 · {{ item.thoughtCount }} 段</summary>
                  <div v-if="assistantChatDisclosure.isOpen(managerDisclosureId('chat-thoughts', item.key))">
                    <small v-if="managerMessageThoughtsLoading[item.key]">正在读取...</small>
                    <small v-else-if="managerMessageThoughtErrors[item.key]">{{ managerMessageThoughtErrors[item.key] }}</small>
                    <div
                      v-for="(thought, thoughtIndex) in managerMessageThoughts[item.key] || []"
                      :key="`${item.key}:thought:${thoughtIndex}`"
                      class="chat-thought-block"
                    >
                      <strong>{{ thought.label || `思考 ${thoughtIndex + 1}` }}</strong>
                      <pre>{{ thought.text }}</pre>
                    </div>
                  </div>
                </details>
              </div>
              <div
                v-if="!isEditingManagerMessage(item)"
                :key="`history-message:${item.key}:${managerMarkdownSignature(item.content)}`"
                class="xb-tavern-markdown"
                :data-markdown-signature="managerMarkdownSignature(item.content)"
                v-html="renderChatMarkdown(item.content)"
              />
              <div
                v-if="!isEditingManagerMessage(item)"
                class="message-actions manager-message-actions"
              >
                <button
                  type="button"
                  :class="managerActionFeedback(item, 'copy')"
                  title="复制"
                  aria-label="复制"
                  @click="copyManagerMessage(item)"
                >
                  {{ managerActionFeedback(item, 'copy') === 'success' ? '✓' : managerActionFeedback(item, 'copy') === 'error' ? '!' : '⧉' }}
                </button>
                <button
                  type="button"
                  :disabled="!canEditManagerMessage(item)"
                  :class="managerActionFeedback(item, 'edit')"
                  title="编辑"
                  aria-label="编辑"
                  @click="startEditManagerMessage(item)"
                >
                  ✎
                </button>
                <button
                  type="button"
                  :disabled="!canRerunManagerMessage(item)"
                  :class="managerActionFeedback(item, 'rerun')"
                  title="重 roll 最后一轮"
                  aria-label="重 roll 最后一轮"
                  @click="rerunFromManagerMessage(item)"
                >
                  ↻
                </button>
                <button
                  type="button"
                  :disabled="isManagerAssistantRunning"
                  :class="managerActionFeedback(item, 'delete')"
                  title="删除"
                  aria-label="删除"
                  @click="deleteManagerMessageTurn(item)"
                >
                  ⌫
                </button>
              </div>
            </article>
            <TavernAssistantToolRun
              v-else
              :item="item"
              :open="assistantChatDisclosure.isOpen(managerDisclosureId('chat-tool-turn', item.key))"
              :load-detail="loadTavernAssistantToolTurnDetail"
              :render-markdown="renderChatMarkdown"
              :markdown-signature="managerMarkdownSignature"
              @toggle="assistantChatDisclosure.setOpen(managerDisclosureId('chat-tool-turn', item.key), $event)"
            />
          </template>

          <article
            v-if="managerPendingUserMessage"
            data-manager-anchor-key="pending:user"
            class="manager-card manager-message manager-message-user manager-message-live pending-user"
          >
            <div class="manager-run-title">
              <strong>{{ roleLabel('user') }}</strong>
              <small>发送中</small>
            </div>
            <div
              :key="`pending-user:${pendingManagerUserRenderState.signature}`"
              class="xb-tavern-markdown"
              :data-markdown-signature="pendingManagerUserRenderState.signature"
              v-html="renderChatMarkdown(pendingManagerUserRenderState.text)"
            />
          </article>

          <section
            v-if="liveManagerToolRound"
            :key="liveManagerToolRound.key"
            :data-manager-anchor-key="`live:${liveManagerToolRound.key}`"
            class="assistant-tool-run assistant-tool-run-live"
          >
            <header><span>正在处理工具</span><small>{{ liveManagerToolRound.calls.length }} 个工具</small></header>
            <p v-if="liveManagerToolRound.preface">
              {{ shortText(liveManagerToolRound.preface, 180) }}
            </p>
            <div
              v-for="call in visibleManagerLiveToolCalls"
              :key="call.displayKey"
              class="assistant-tool-run-live-call"
              :class="`is-${call.status}`"
            >
              <span>{{ call.name }}</span>
              <small>{{ call.status === 'running' ? '运行中' : call.status === 'error' ? '失败' : '已返回' }} · {{ shortText(call.summary, 220) }}</small>
            </div>
          </section>

          <article
            v-if="liveManagerAssistantDraft"
            :key="`live-assistant:${liveManagerAssistantDraft.sessionId}`"
            data-manager-anchor-key="live:assistant"
            class="manager-card manager-message manager-message-assistant manager-message-live"
          >
            <div class="manager-run-title">
              <strong>助手</strong><small>正在处理</small>
            </div>
            <div
              v-if="liveManagerAssistantDraft.thoughtCount"
              class="manager-message-thoughts"
            >
              <small>正在思考 · {{ liveManagerAssistantDraft.thoughtCount }} 段</small>
            </div>
            <div class="xb-tavern-markdown live-manager-draft">
              {{ liveManagerAssistantDraft.content }}
            </div>
          </article>

          <article
            v-if="isManagerAssistantRunning && !managerPendingUserMessage && !liveManagerToolRound && !liveManagerAssistantDraft"
            class="manager-card manager-message manager-message-assistant manager-message-live"
            data-manager-anchor-key="live:manager-thinking"
          >
            <div class="manager-run-title">
              <strong>助手</strong>
              <small>正在处理</small>
            </div>
            <p>正在思考...</p>
          </article>

          <p
            v-if="!managerChatMessageItems.length && !managerPendingUserMessage && !liveManagerToolRound && !liveManagerAssistantDraft && !isManagerAssistantRunning"
            data-manager-anchor-key="empty"
            class="chat-empty"
          >
            还没有和助手对话。
          </p>
        </div>
      </div>
      <TavernScrollControls
        extra-class="manager-scroll-helpers"
        :active="managerScrollControlsActive"
        :show-top="showManagerScrollTop"
        :show-bottom="showManagerScrollBottom"
        @top="scrollManagerToTop"
        @bottom="scrollManagerToBottom(true, { collapseWindow: true, revealHelpers: true })"
      />
    </div>

    <div class="chat-compose-dock manager-compose-dock">
      <div
        class="chat-compose-shell manager-compose-shell"
        :class="{ 'has-text': !!managerInputDraft.trim() }"
      >
        <form
          class="manager-compose chat-compose"
          @submit.prevent="handleManagerSubmit"
        >
          <textarea
            :ref="setManagerComposeTextareaRef"
            v-model="managerInputDraft"
            rows="1"
            placeholder="和助手说一句话..."
            @input="handleManagerComposeInput"
            @keydown="handleManagerComposeKeydown"
          />
          <button
            type="submit"
            class="primary-action"
            :disabled="!canSendManagerMessage"
            :aria-label="isManagerAssistantCancelling ? '正在停止' : isManagerAssistantRunning ? '停止' : '发送'"
          >
            <span
              class="compose-send-icon"
              aria-hidden="true"
            >
              {{ isManagerAssistantCancelling ? '...' : isManagerAssistantRunning ? '■' : '➤' }}
            </span>
            <span class="compose-send-label">
              {{ isManagerAssistantCancelling ? '正在停止' : isManagerAssistantRunning ? '停止' : '发送' }}
            </span>
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
