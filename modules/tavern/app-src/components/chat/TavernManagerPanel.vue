<script setup lang="ts">
import { computed, nextTick, watch } from 'vue';
import TavernAssistantToolRun from './TavernAssistantToolRun.vue';
import TavernScrollControls from '../TavernScrollControls.vue';
import { useTavernChatContext, useTavernManagerContext, useTavernSessionContext, useTavernShellContext } from '../tavern-app-context';
import { useTavernEphemeralDisclosureScope } from '../useTavernEphemeralDisclosureScope';
import type { TavernManagerRunRecord } from '../../../shared/session-db';

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
    handleComposeInput,
    htmlRenderEnabled,
    markdownSignature,
    renderChatMarkdown,
    roleLabel,
    thoughtSummaryLabel,
} = chat;
const {
    activeMemoryFiles,
    assistantChatContextLabel,
    archivedManagerRuns,
    canClearAssistantChat,
    canEditManagerMessage,
    canRerunManagerMessage,
    canSendManagerMessage,
    clearAssistantChatHistory,
    copyManagerMessage,
    currentManagerWorkRun,
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
    managerActionFeedback,
    managerBusy,
    managerCompactionOverlay,
    managerComposeTextareaRef,
    managerInputDraft,
    managerMessageWindow,
    managerPendingUserMessage,
    managerRuns,
    managerRunTone,
    managerScrollControlsActive,
    managerScrollRef,
    managerWorkRef,
    managerStatusLabel,
    managerToolStatusLabel,
    managerToolTone,
    managerToolTraceItems,
    memoryFileDisplayName,
    memoryFiles,
    memoryIndexStatusLine,
    retryManagerRun,
    revealOlderManagerMessages,
    rerunFromManagerMessage,
    saveEditManagerMessage,
    scrollManagerToBottom,
    scrollManagerToTop,
    selectedMemoryFile,
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
    managerWorkDisclosure.setOpenFromEvent(managerDisclosureId('work-band'), event);
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

const managerChatMessageItems = computed(() => visibleManagerChatItems.value);
const visibleManagerLiveToolCalls = computed(() => liveManagerToolRound.value?.calls.slice(-8) || []);
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
    memoryFiles.value.length
    || managerRuns.value.length
));
const managerWorkHistoryTotal = computed(() => archivedManagerRuns.value.length + hiddenManagerRunCount.value);

function managerRunKindLabel(run: TavernManagerRunRecord | null | undefined) {
    if (!run) {return '工作记录';}
    if (['accepted_turn', 'after_turn'].includes(run.trigger)) {return '已接受回合维护';}
    return '自动维护';
}

function compactManagerRunLine(line = '') {
    return String(line || '')
        .replace(/^记忆：/, '记忆')
        .replace(/^地图：/, '地图')
        .replace(/本轮没有明确空间变化，未更新/g, '无变化')
        .replace(/没有写入文件/g, '无变化')
        .replace(/份档案/g, '')
        .replace(/份状态/g, '')
        .trim();
}

function managerWorkSummaryLine(run: TavernManagerRunRecord | null | undefined) {
    if (!run) {
        return `记忆档案 ${activeMemoryFiles.value.length}/${memoryFiles.value.length} · 最近维护完成 · 当前无后台工作`;
    }
    return [
        `${managerStatusLabel(run.status)} · ${formatRunInputLine(run)}`,
        compactManagerRunLine(formatRunMemoryLine(run)),
        compactManagerRunLine(formatRunMapLine(run)),
    ].filter(Boolean).join(' · ');
}

function managerWorkMetricLine(run: TavernManagerRunRecord | null | undefined) {
    if (!run) {return memoryIndexStatusLine.value || '当前无后台工作';}
    return [
        toolTraceSummary(run.toolTrace),
        isManagerRunRetrying(run) ? '重试中' : formatRunActivityLine(run),
    ].filter(Boolean).join(' · ');
}

const managerWorkBandKindLabel = computed(() => (
    currentManagerWorkRun.value
        ? managerRunKindLabel(currentManagerWorkRun.value)
        : '工作记录'
));
const managerWorkBandSummaryLine = computed(() => (
    currentManagerWorkRun.value
        ? managerWorkSummaryLine(currentManagerWorkRun.value)
        : managerWorkSummaryLine(null)
));
const managerWorkBandMetricLine = computed(() => (
    currentManagerWorkRun.value
        ? managerWorkMetricLine(currentManagerWorkRun.value)
        : managerWorkMetricLine(null)
));

watch(
    () => `${currentManagerWorkRun.value?.id || ''}:${currentManagerWorkRun.value?.status || ''}`,
    (next, previous) => {
        if (next === previous) {return;}
        const status = String(currentManagerWorkRun.value?.status || '');
        if (['queued', 'running'].includes(status)) {
            managerWorkDisclosure.setOpen(managerDisclosureId('work-band'), true);
            return;
        }
        managerWorkDisclosure.reset();
    },
);

watch(
    [activeView, chatFocus],
    ([view, focus]) => {
        if (view !== 'chat' || focus !== 'manager') {
            managerWorkDisclosure.reset();
            assistantChatDisclosure.reset();
        }
    },
);

watch(
    () => `${managerMessageWindow.value.startIndex}:${managerMessageWindow.value.visibleCount}`,
    () => assistantChatDisclosure.reset(),
);

watch(session.selectedSessionId, () => {
    managerWorkDisclosure.reset();
    assistantChatDisclosure.reset();
});
</script>

<template>
  <section
    class="chat-face chat-face-back chat-manager"
    :aria-hidden="chatFocus === 'chat'"
  >
    <header class="manager-head">
      <div class="manager-chat-toolbar">
        <span title="主动聊天历史估算 / 自动压缩阈值">{{ assistantChatContextLabel }}</span>
        <button
          type="button"
          :disabled="!canClearAssistantChat"
          @click="clearAssistantChatHistory"
        >
          清空对话
        </button>
      </div>
      <div class="manager-head-actions">
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
      :open="managerWorkDisclosure.isOpen(managerDisclosureId('work-band'))"
      @toggle="handleManagerWorkBandToggle"
    >
      <summary>
        <strong>{{ managerWorkBandKindLabel }}</strong>
        <span>{{ managerWorkBandSummaryLine }}</span>
        <em>{{ managerWorkBandMetricLine }}</em>
      </summary>
      <div
        v-if="managerWorkDisclosure.isOpen(managerDisclosureId('work-band'))"
        class="manager-work-band-body"
      >
        <section
          v-if="currentManagerWorkRun"
          class="manager-work-section manager-work-current"
          :class="[`is-${currentManagerWorkRun.status}`, `tone-${managerRunTone(currentManagerWorkRun)}`, { 'is-retrying': isManagerRunRetrying(currentManagerWorkRun) }]"
          :aria-busy="isManagerRunRetrying(currentManagerWorkRun) ? 'true' : 'false'"
        >
          <div class="manager-work-section-head">
            <strong>本次运行</strong>
            <small>{{ managerRunKindLabel(currentManagerWorkRun) }} · {{ isManagerRunRetrying(currentManagerWorkRun) ? '重试中' : managerStatusLabel(currentManagerWorkRun.status) }}</small>
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
          v-else
          class="manager-work-section"
        >
          <div class="manager-work-section-head">
            <strong>记忆档案</strong>
            <small>{{ activeMemoryFiles.length }}/{{ memoryFiles.length }}</small>
          </div>
          <p>{{ memoryIndexStatusLine }}</p>
          <p v-if="selectedMemoryFile">
            当前打开：{{ memoryFileDisplayName(selectedMemoryFile) }}
          </p>
        </section>

        <section
          v-if="currentManagerWorkRun && currentManagerTraceItems.length"
          class="manager-work-section manager-work-tools"
        >
          <div class="manager-work-section-head">
            <strong>工具调用</strong>
            <small>{{ toolTraceSummary(currentManagerWorkRun.toolTrace) }}</small>
          </div>
          <div class="manager-tool-list">
            <div
              v-for="tool in currentManagerTraceItems"
              :key="tool.id"
              class="manager-tool-item"
              :class="managerToolTone(tool)"
            >
              <div class="manager-tool-head">
                <span>{{ tool.name }}</span>
                <em>{{ managerToolStatusLabel(tool) }}<template v-if="tool.elapsedLabel"> · {{ tool.elapsedLabel }}</template></em>
              </div>
              <details
                v-if="tool.thoughts.length"
                class="manager-tool-thoughts"
                :open="managerWorkDisclosure.isOpen(managerDisclosureId('work-tool-thoughts', currentManagerWorkRun.id, tool.id))"
                @toggle="managerWorkDisclosure.setOpenFromEvent(managerDisclosureId('work-tool-thoughts', currentManagerWorkRun.id, tool.id), $event)"
              >
                <summary>{{ thoughtSummaryLabel(tool.thoughts, false) }}</summary>
                <template
                  v-if="managerWorkDisclosure.isOpen(managerDisclosureId('work-tool-thoughts', currentManagerWorkRun.id, tool.id))"
                >
                  <div
                    v-for="(thought, thoughtIndex) in tool.thoughts"
                    :key="`${tool.id}-stored-thought-${thoughtIndex}`"
                    class="chat-thought-block"
                  >
                    <strong>{{ thought.label }}</strong>
                    <pre>{{ thought.text }}</pre>
                  </div>
                </template>
              </details>
              <div
                v-if="tool.preface"
                :key="`work-tool-preface:${currentManagerWorkRun.id}:${tool.id}:${managerMarkdownSignature(tool.preface)}`"
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
                <strong>{{ managerRunKindLabel(run) }} · {{ managerStatusLabel(run.status) }}</strong>
                <small>{{ formatRunInputLine(run) }}</small>
              </div>
              <span>{{ toolTraceSummary(run.toolTrace) || formatRunActivityLine(run) }}</span>
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
            v-if="managerMessageWindow.hiddenBefore"
            class="chat-history-gate manager-history-gate"
            :data-manager-anchor-key="`gate:${managerMessageWindow.hiddenBefore}`"
            role="button"
            tabindex="0"
            @click="revealOlderManagerMessages(true)"
            @keydown.enter.prevent="revealOlderManagerMessages(true)"
            @keydown.space.prevent="revealOlderManagerMessages(true)"
          >
            展开较早记录 {{ managerMessageWindow.hiddenBefore }} 条
          </div>
          <template
            v-for="item in managerChatMessageItems"
            :key="item.key"
          >
            <article
              v-if="item.kind === 'message'"
              :data-manager-anchor-key="item.anchorKey"
              class="manager-card manager-message"
              :class="item.message.role === 'user' ? 'manager-message-user' : 'manager-message-assistant'"
            >
              <div class="manager-run-title">
                <strong>{{ item.message.role === 'user' ? roleLabel('user') : '助手' }}</strong>
                <small>{{ formatMessageTime(item.message.createdAt) }}</small>
              </div>
              <div
                v-if="isEditingManagerMessage(item.message)"
                class="message-edit-panel manager-message-edit-panel"
              >
                <textarea
                  v-model="editingMessageDraft"
                  class="message-edit-box"
                  rows="6"
                  :data-manager-message-editor="`manager:${item.message.sessionId}:${item.message.order}`"
                  @input="handleEditInput"
                  @keydown="handleManagerEditKeydown($event, item.message)"
                />
                <div class="message-edit-actions">
                  <button
                    type="button"
                    :disabled="!isEditingManagerMessageDirty(item.message)"
                    @click="saveEditManagerMessage(item.message)"
                  >
                    {{ item.message.role === 'user' ? '保存' : '保存修改' }}
                  </button>
                  <button
                    v-if="item.message.role === 'user'"
                    type="button"
                    :disabled="!isEditingManagerMessageDirty(item.message)"
                    @click="saveEditManagerMessage(item.message, { rerun: true })"
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
                v-if="!isEditingManagerMessage(item.message)"
                class="manager-message-thoughts"
              >
                <details
                  v-if="item.message.thoughts?.length"
                  :open="assistantChatDisclosure.isOpen(managerDisclosureId('chat-thoughts', item.key))"
                  @toggle="assistantChatDisclosure.setOpenFromEvent(managerDisclosureId('chat-thoughts', item.key), $event)"
                >
                  <summary>{{ thoughtSummaryLabel(item.message.thoughts, false) }}</summary>
                  <div v-if="assistantChatDisclosure.isOpen(managerDisclosureId('chat-thoughts', item.key))">
                    <div
                      v-for="(thought, thoughtIndex) in item.message.thoughts"
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
                v-if="!isEditingManagerMessage(item.message)"
                :key="`history-message:${item.key}:${managerMarkdownSignature(item.message.content)}`"
                class="xb-tavern-markdown"
                :data-markdown-signature="managerMarkdownSignature(item.message.content)"
                v-html="renderChatMarkdown(item.message.content)"
              />
              <div
                v-if="!isEditingManagerMessage(item.message)"
                class="message-actions manager-message-actions"
              >
                <button
                  type="button"
                  :class="managerActionFeedback(item.message, 'copy')"
                  title="复制"
                  aria-label="复制"
                  @click="copyManagerMessage(item.message)"
                >
                  {{ managerActionFeedback(item.message, 'copy') === 'success' ? '✓' : managerActionFeedback(item.message, 'copy') === 'error' ? '!' : '⧉' }}
                </button>
                <button
                  type="button"
                  :disabled="!canEditManagerMessage(item.message)"
                  :class="managerActionFeedback(item.message, 'edit')"
                  title="编辑"
                  aria-label="编辑"
                  @click="startEditManagerMessage(item.message)"
                >
                  ✎
                </button>
                <button
                  type="button"
                  :disabled="!canRerunManagerMessage(item.message)"
                  :class="managerActionFeedback(item.message, 'rerun')"
                  title="重 roll 最后一轮"
                  aria-label="重 roll 最后一轮"
                  @click="rerunFromManagerMessage(item.message)"
                >
                  ↻
                </button>
                <button
                  type="button"
                  :disabled="isManagerAssistantRunning"
                  :class="managerActionFeedback(item.message, 'delete')"
                  title="删除"
                  aria-label="删除"
                  @click="deleteManagerMessageTurn(item.message)"
                >
                  ⌫
                </button>
              </div>
            </article>
            <TavernAssistantToolRun
              v-else
              :item="item"
              :open="assistantChatDisclosure.isOpen(managerDisclosureId('chat-tool-turn', item.key))"
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
              :key="call.id"
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
              v-if="liveManagerAssistantDraft.thoughts.length"
              class="manager-message-thoughts"
            >
              <small>{{ thoughtSummaryLabel(liveManagerAssistantDraft.thoughts, true) }}</small>
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
          <div
            class="chat-compose-spacer"
            aria-hidden="true"
          />
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
            :disabled="isManagerAssistantRunning"
            @input="handleComposeInput"
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
