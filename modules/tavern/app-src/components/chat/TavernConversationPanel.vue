<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import TavernScrollControls from '../TavernScrollControls.vue';
import TavernMessageEditPanel from './TavernMessageEditPanel.vue';
import TavernDrawCapsule from './TavernDrawCapsule.vue';
import TavernStreamMarkdown from './TavernStreamMarkdown.vue';
import { useTavernChatContext, useTavernDrawContext, useTavernSessionContext, useTavernShellContext } from '../tavern-app-context';
import { useTavernEphemeralDisclosureScope } from '../useTavernEphemeralDisclosureScope';
import { useTavernMediaQuery } from '../useTavernMediaQuery';
import {
    hasRenderableLiveAssistantContent,
    hasRenderableLiveAssistantMarkdown,
} from './live-assistant-state';
import {
    type getActionCheckEvents,
    injectActionCheckRenderMarkers,
} from '../../../shared/runtime-events';
import type { TavernMessageRecord } from '../../../shared/session-db';

const emit = defineEmits<{
    (event: 'open-contract'): void;
    (event: 'open-author-note'): void;
}>();

const shell = useTavernShellContext();
const chat = useTavernChatContext();
const session = useTavernSessionContext();
const draw = useTavernDrawContext();
const {
    activeView,
    homeThemeDark,
    openPromptInspector,
    rememberBrokenAvatar,
} = shell;
const {
    actionFeedback,
    cancelEditMessage,
    canEditMessage,
    canRerunMessage,
    canSendMessage,
    chatComposeTextareaRef,
    chatFocus,
    chatLayout,
    chatScrollControlsActive,
    chatScrollContentRef,
    chatScrollRef,
    copyMessage,
    currentUserMessage,
    deleteMessageTurn,
    displayMessageContent,
    displayMessageRenderProjection,
    displayMessageThoughtBlocks,
    displayRuntimeRenderProjection,
    displayRuntimeThoughtBlocks,
    formatMessageTime,
    handleChatScroll,
    handleChatSubmit,
    handleChatTouchMove,
    handleChatTouchStart,
    handleChatWheel,
    handleComposeInput,
    handleComposeKeydown,
    isEditingMessage,
    isCancellingRun,
    isRunning,
    markdownSignature,
    htmlRenderEnabled,
    messageKey,
    renderChatMarkdown,
    rerunFromMessage,
    revealOlderChatMessages,
    roleLabel,
    runtimeActionCheckEvents,
    runtimePendingUserMessage,
    runtimeStatusElapsedSeconds,
    runtimeStatusLabel,
    runtimeText,
    runtimeThoughts,
    runtimeFinalizedAssistantMessageKey,
    runtimeUserMessageVisible,
    saveEditMessage,
    jumpChatToBottom,
    scrollChatToTop,
    showChatScrollBottom,
    showChatScrollTop,
    startEditMessage,
    thoughtBlocks,
    thoughtSummaryLabel,
    visibleCharacterAvatar,
    visibleUserAvatar,
} = chat;
const {
    branchCurrentChatSession,
    chatMessages,
    chatMessageWindow,
    createNewChatSession,
    currentChatCharacterSessions,
    removeSession,
    selectedSessionId,
    selectSession,
    sessionDisplayTitle,
    sessionFloorLabel,
    visibleChatMessages,
} = session;
const {
    canDrawMessage,
    drawMessage,
    drawMessageStatusClass,
    drawMessageStatusText,
    drawMessageTitle,
    isDrawingMessage,
} = draw;
function setChatScrollRef(element: Element | null) {
    chatScrollRef.value = element instanceof HTMLElement ? element : null;
}

function setChatScrollContentRef(element: Element | null) {
    chatScrollContentRef.value = element instanceof HTMLElement ? element : null;
}

function setChatComposeTextareaRef(element: Element | null) {
    chatComposeTextareaRef.value = element instanceof HTMLTextAreaElement ? element : null;
}

function openContractModal() {
    emit('open-contract');
}

function roleplayMarkdownOptions() {
    return {
        roleplay: true,
        userName: roleLabel('user'),
        characterName: roleLabel('assistant'),
    };
}

function roleplayMarkdownSignature(text = '', extra = '') {
    const options = roleplayMarkdownOptions();
    return markdownSignature([
        text,
        extra,
        options.userName,
        options.characterName,
        htmlRenderEnabled.value ? 'html-render:on' : 'html-render:off',
        homeThemeDark.value ? 'theme:dark' : 'theme:light',
    ].join('\u0000'));
}

function renderRoleplayMarkdown(text = '') {
    return renderChatMarkdown(text, roleplayMarkdownOptions());
}

function messageFloorLabel(message: TavernMessageRecord) {
    return `#${Math.max(1, Number(message.order) + 1)}`;
}

function buildAssistantRenderState(text: string, events: ReturnType<typeof getActionCheckEvents> = []) {
    const payload = injectActionCheckRenderMarkers(text, events);
    const actionCheckGroups = payload.groups.length ? JSON.stringify(payload.groups) : '';
    return {
        text: payload.text,
        signature: roleplayMarkdownSignature(payload.text, actionCheckGroups),
        actionCheckGroups,
    };
}

function assistantMessageRenderState(message: TavernMessageRecord) {
    if (message.role !== 'assistant') {
        const text = displayMessageContent(message);
        return {
            text,
            signature: roleplayMarkdownSignature(text),
            actionCheckGroups: '',
        };
    }
    const projection = displayMessageRenderProjection(message);
    return buildAssistantRenderState(projection.text, projection.actionCheckEvents);
}

const liveAssistantRenderState = computed(() => {
    const projection = displayRuntimeRenderProjection(
        runtimeText.value,
        Array.isArray(runtimeActionCheckEvents.value) ? runtimeActionCheckEvents.value : [],
    );
    return buildAssistantRenderState(projection.text, projection.actionCheckEvents);
});
const liveAssistantVisible = computed(() => hasRenderableLiveAssistantContent({
    text: liveAssistantRenderState.value.text,
    thoughts: runtimeThoughts.value,
    actionCheckEvents: runtimeActionCheckEvents.value,
}));
const liveAssistantCanRender = computed(() => (
    isRunning.value && runtimeUserMessageVisible.value
));
const liveAssistantMarkdownVisible = computed(() => hasRenderableLiveAssistantMarkdown({
    text: liveAssistantRenderState.value.text,
    actionCheckEvents: runtimeActionCheckEvents.value,
}));
const liveAssistantThoughtBlocks = computed(() => displayRuntimeThoughtBlocks(thoughtBlocks(runtimeThoughts.value)));
const liveAssistantStatusLabel = computed(() => {
    const label = runtimeStatusLabel.value || '同步状态';
    const elapsedSeconds = Math.max(0, Math.floor(Number(runtimeStatusElapsedSeconds.value) || 0));
    return `${label} ${elapsedSeconds}s`;
});
const pendingUserVisible = computed(() => isRunning.value && !runtimeUserMessageVisible.value && !!runtimePendingUserMessage.value.trim());
const pendingUserRenderState = computed(() => {
    const text = runtimePendingUserMessage.value.trim();
    return {
        text,
        signature: roleplayMarkdownSignature(text, 'pending-user'),
    };
});
const thoughtDisclosure = useTavernEphemeralDisclosureScope();
const runtimeThoughtDisclosureId = 'chat:runtime-thoughts';
const runtimeAssistantMessageItemDomKey = 'runtime-assistant-message-item';
const isMobileActionTrayViewport = useTavernMediaQuery('(max-width: 760px)');
const activeMessageActionsKey = ref('');
const composeMenuOpen = ref(false);
const sessionArchiveOpen = ref(false);

function chatMessageItemDomKey(message: TavernMessageRecord) {
    return message.role === 'assistant' && messageKey(message) === runtimeFinalizedAssistantMessageKey.value
        ? runtimeAssistantMessageItemDomKey
        : `${message.sessionId}-${message.order}`;
}

function isRuntimeFinalizedAssistantMessage(message: TavernMessageRecord) {
    return message.role === 'assistant' && messageKey(message) === runtimeFinalizedAssistantMessageKey.value;
}

function messageThoughtDisclosureId(message: TavernMessageRecord) {
    return `chat:thought:${messageKey(message)}`;
}

function isMessageActionTrayOpen(message: TavernMessageRecord) {
    return activeMessageActionsKey.value === messageKey(message);
}

function shouldIgnoreMessageActionTrayClick(event: MouseEvent) {
    const target = event.target instanceof Element ? event.target : null;
    return !!target?.closest('summary, details, a, button, input, textarea, select, label, .xb-tavern-html-wrapper');
}

function toggleMessageActionTray(message: TavernMessageRecord, event?: MouseEvent) {
    if (!isMobileActionTrayViewport.value || isEditingMessage(message)) {return;}
    if (event && shouldIgnoreMessageActionTrayClick(event)) {return;}
    const key = messageKey(message);
    activeMessageActionsKey.value = activeMessageActionsKey.value === key ? '' : key;
}

function clearMessageActionTray() {
    activeMessageActionsKey.value = '';
}

function closeComposeMenu() {
    composeMenuOpen.value = false;
}

function handleChatMainClick() {
    clearMessageActionTray();
    closeComposeMenu();
}

function toggleComposeMenu() {
    composeMenuOpen.value = !composeMenuOpen.value;
}

async function createSessionFromComposeMenu() {
    closeComposeMenu();
    await createNewChatSession();
}

function openSessionArchiveFromComposeMenu() {
    closeComposeMenu();
    sessionArchiveOpen.value = true;
}

async function branchSessionFromComposeMenu() {
    closeComposeMenu();
    await branchCurrentChatSession();
}

function openAuthorNoteFromComposeMenu() {
    closeComposeMenu();
    emit('open-author-note');
}

function openRequestLogFromComposeMenu() {
    closeComposeMenu();
    openPromptInspector('history');
}

function closeSessionArchive() {
    sessionArchiveOpen.value = false;
}

async function openArchivedSession(sessionId: string) {
    await selectSession(sessionId);
    closeSessionArchive();
}

async function deleteArchivedSession(sessionId: string, event: Event) {
    await removeSession(sessionId, event);
}

watch(
    [activeView, chatFocus, selectedSessionId],
    ([view, focus]) => {
        if (view !== 'chat' || focus !== 'chat') {
            thoughtDisclosure.reset();
            clearMessageActionTray();
            closeComposeMenu();
            closeSessionArchive();
        }
    },
);

watch(
    () => `${selectedSessionId.value}:${chatMessageWindow.value.startIndex}:${chatMessageWindow.value.visibleCount}`,
    () => {
        thoughtDisclosure.reset();
        clearMessageActionTray();
        closeComposeMenu();
    },
);

watch(isMobileActionTrayViewport, (isMobile) => {
    if (!isMobile) {
        clearMessageActionTray();
    }
});
</script>

<template>
  <section
    class="chat-face chat-face-front chat-main"
    :aria-hidden="chatFocus === 'manager'"
    @click="handleChatMainClick"
  >
    <div
      v-if="visibleCharacterAvatar"
      class="chat-ambient-standee"
      aria-hidden="true"
    >
      <img
        :src="visibleCharacterAvatar"
        alt=""
        @error="rememberBrokenAvatar(visibleCharacterAvatar)"
      >
    </div>
    <header class="chat-head">
      <div class="chat-head-main">
        <div
          class="xb-workspace-controller chat-layout-controller"
          aria-label="区域大小"
        >
          <button
            type="button"
            class="xb-layout-button"
            :class="{ 'is-active': chatLayout === 'chat' }"
            @click="chatLayout = 'chat'"
          >
            聊天
          </button>
          <button
            type="button"
            class="xb-layout-button"
            :class="{ 'is-active': chatLayout === 'balanced' }"
            @click="chatLayout = 'balanced'"
          >
            平衡
          </button>
          <button
            type="button"
            class="xb-layout-button"
            :class="{ 'is-active': chatLayout === 'editor' }"
            @click="chatLayout = 'editor'"
          >
            记忆
          </button>
        </div>
      </div>
      <div class="chat-head-actions">
        <TavernDrawCapsule />
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
          title="助手聊天"
          aria-label="助手聊天"
          @click="chatFocus = 'manager'"
        >
          助手
        </button>
      </div>
    </header>
    <div
      class="chat-scroll-shell"
    >
      <div
        :ref="setChatScrollRef"
        class="chat-scroll"
        @scroll="handleChatScroll"
        @click="clearMessageActionTray"
        @wheel.passive="handleChatWheel"
        @touchstart.passive="handleChatTouchStart"
        @touchmove.passive="handleChatTouchMove"
      >
        <div
          :ref="setChatScrollContentRef"
          class="chat-scroll-content"
        >
          <div
            v-if="chatMessageWindow.hiddenBefore"
            class="chat-history-gate"
            :data-chat-anchor-key="`gate:${chatMessageWindow.hiddenBefore}`"
            role="button"
            tabindex="0"
            @click="revealOlderChatMessages(true)"
            @keydown.enter.prevent="revealOlderChatMessages(true)"
            @keydown.space.prevent="revealOlderChatMessages(true)"
          >
            展开较早记录 {{ chatMessageWindow.hiddenBefore }} 条
          </div>
          <div
            v-for="message in visibleChatMessages"
            :key="chatMessageItemDomKey(message)"
            class="chat-message-item"
          >
            <div
              :data-chat-anchor-key="`${message.sessionId}:${message.order}`"
              class="chat-bubble"
              :class="[
                message.role === 'user' ? 'from-user' : 'from-assistant',
                { 'is-error': message.error },
                { 'is-action-tray-open': isMessageActionTrayOpen(message) },
              ]"
              @click.stop="toggleMessageActionTray(message, $event)"
            >
            <div class="bubble-meta">
              <div class="bubble-identity">
                <span class="bubble-nameplate">
                  <span class="bubble-avatar-stamp">
                    <img
                      v-if="message.role === 'user' && visibleUserAvatar"
                      :src="visibleUserAvatar"
                      alt=""
                      @error="rememberBrokenAvatar(visibleUserAvatar)"
                    >
                    <img
                      v-else-if="message.role !== 'user' && visibleCharacterAvatar"
                      :src="visibleCharacterAvatar"
                      alt=""
                      @error="rememberBrokenAvatar(visibleCharacterAvatar)"
                    >
                    <span v-else>{{ String(roleLabel(message.role)).slice(0, 1) }}</span>
                  </span>
                  <span class="bubble-role-name">{{ message.error ? '错误' : roleLabel(message.role) }}</span>
                  <span class="bubble-meta-line">
                    <span
                      class="message-floor-label"
                      :title="`第 ${messageFloorLabel(message).slice(1)} 楼`"
                      :aria-label="`第 ${messageFloorLabel(message).slice(1)} 楼`"
                    >
                      {{ messageFloorLabel(message) }}
                    </span>
                    <small class="bubble-time-tag">{{ formatMessageTime(message.createdAt) }}</small>
                  </span>
                </span>
              </div>
            </div>
            <div
              v-if="!isEditingMessage(message)"
              class="message-actions"
              :class="{ 'has-status': !!drawMessageStatusText(message) }"
              @click.stop
            >
              <span
                v-if="drawMessageStatusText(message)"
                class="message-draw-status"
                :class="drawMessageStatusClass(message)"
              >
                {{ drawMessageStatusText(message) }}
              </span>
              <button
                type="button"
                :disabled="!canDrawMessage(message)"
                :class="[actionFeedback(message, 'draw'), { 'is-running': isDrawingMessage(message) }]"
                :title="drawMessageTitle(message)"
                :aria-label="drawMessageTitle(message)"
                @click="drawMessage(message)"
              >
                {{ isDrawingMessage(message) ? '■' : '🎨' }}
              </button>
              <button
                type="button"
                :class="actionFeedback(message, 'copy')"
                title="复制"
                aria-label="复制"
                @click="copyMessage(message)"
              >
                {{ actionFeedback(message, 'copy') === 'success' ? '✓' : actionFeedback(message, 'copy') === 'error' ? '!' : '⧉' }}
              </button>
              <button
                type="button"
                :disabled="!canEditMessage(message)"
                :class="actionFeedback(message, 'edit')"
                title="编辑"
                aria-label="编辑"
                @click="startEditMessage(message)"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                type="button"
                :disabled="!canRerunMessage(message)"
                :class="actionFeedback(message, 'rerun')"
                title="重 roll 最后一轮"
                aria-label="重 roll 最后一轮"
                @click="rerunFromMessage(message)"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path d="M1 4v6h6M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
              </button>
              <span
                class="message-action-divider"
                aria-hidden="true"
              />
              <button
                type="button"
                :disabled="isRunning"
                :class="actionFeedback(message, 'delete')"
                title="从这里删除后续剧情"
                aria-label="从这里删除后续剧情"
                @click="deleteMessageTurn(message)"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
            <TavernMessageEditPanel
              v-if="isEditingMessage(message)"
              :message="message"
              :message-key="messageKey(message)"
              @cancel="cancelEditMessage"
              @save="saveEditMessage(message, $event)"
            />
            <template
              v-for="rawThoughts in [thoughtBlocks(message)]"
              :key="`${messageKey(message)}:raw-thoughts:${rawThoughts.length}`"
            >
              <details
                v-if="!isEditingMessage(message) && rawThoughts.length"
                class="tavern-thought-details"
                :open="thoughtDisclosure.isOpen(messageThoughtDisclosureId(message))"
                @toggle="thoughtDisclosure.setOpenFromEvent(messageThoughtDisclosureId(message), $event)"
              >
                <summary>{{ thoughtSummaryLabel(rawThoughts) }}</summary>
                <template
                  v-if="thoughtDisclosure.isOpen(messageThoughtDisclosureId(message))"
                >
                  <template
                    v-for="displayThoughts in [displayMessageThoughtBlocks(message)]"
                    :key="`${messageKey(message)}:display-thoughts:${displayThoughts.length}`"
                  >
                    <div
                      v-for="(thought, thoughtIndex) in displayThoughts"
                      :key="`${message.sessionId}-${message.order}-thought-${thoughtIndex}`"
                      class="tavern-thought-block"
                    >
                      <div class="tavern-thought-label">
                        {{ thought.label }}
                      </div>
                      <pre>{{ thought.text }}</pre>
                    </div>
                  </template>
                </template>
              </details>
            </template>
            <template v-if="!isEditingMessage(message)">
              <template
                v-for="render in [assistantMessageRenderState(message)]"
                :key="`${messageKey(message)}:${render.signature}`"
              >
                <TavernStreamMarkdown
                  v-if="isRuntimeFinalizedAssistantMessage(message)"
                  :action-check-groups="render.actionCheckGroups || undefined"
                  :animated="false"
                  :html="renderRoleplayMarkdown(render.text)"
                  :signature="render.signature"
                />
                <div
                  v-else
                  class="xb-tavern-markdown"
                  :data-markdown-signature="render.signature"
                  :data-action-check-groups="render.actionCheckGroups || null"
                  v-html="renderRoleplayMarkdown(render.text)"
                />
              </template>
            </template>
          </div>
          <div
            v-for="(event, eventIndex) in (message.role === 'user' ? (message.runtimeEvents || []) : [])"
            :key="`${message.sessionId}-${message.order}-runtime-event-${event.type}-${eventIndex}`"
            class="chat-runtime-event scene-narration"
            aria-hidden="true"
          >
            <div class="scene-tag">
              {{ String((event as { label?: string }).label || '') }}
            </div>
          </div>
        </div>
        <div
          v-if="pendingUserVisible"
          data-chat-anchor-key="pending:user"
          class="chat-bubble from-user pending-user"
        >
          <div class="bubble-meta">
            <div class="bubble-identity">
              <span class="bubble-nameplate">
                <span class="bubble-avatar-stamp">
                  <img
                    v-if="visibleUserAvatar"
                    :src="visibleUserAvatar"
                    alt=""
                    @error="rememberBrokenAvatar(visibleUserAvatar)"
                  >
                  <span v-else>{{ String(roleLabel('user')).slice(0, 1) }}</span>
                </span>
                <span class="bubble-role-name">{{ roleLabel('user') }}</span>
                <span class="bubble-meta-line">
                  <small class="bubble-time-tag">发送中</small>
                </span>
              </span>
            </div>
          </div>
          <div
            :key="`pending-user:${pendingUserRenderState.signature}`"
            class="xb-tavern-markdown"
            :data-markdown-signature="pendingUserRenderState.signature"
            v-html="renderRoleplayMarkdown(pendingUserRenderState.text)"
          />
        </div>
        <div
          v-if="liveAssistantCanRender && liveAssistantVisible"
          :key="runtimeAssistantMessageItemDomKey"
          class="chat-message-item"
        >
          <div
            data-chat-anchor-key="streaming:content"
            class="chat-bubble from-assistant streaming"
          >
            <div class="bubble-meta">
              <span class="bubble-nameplate">
                <span class="bubble-avatar-stamp">
                  <img
                    v-if="visibleCharacterAvatar"
                    :src="visibleCharacterAvatar"
                    alt=""
                    @error="rememberBrokenAvatar(visibleCharacterAvatar)"
                  >
                  <span v-else>{{ String(roleLabel('assistant')).slice(0, 1) }}</span>
                </span>
                <span class="bubble-role-name">{{ roleLabel('assistant') }}</span>
              </span>
              <small>{{ liveAssistantStatusLabel }}</small>
            </div>
            <template
              v-for="displayRuntimeThoughts in [liveAssistantThoughtBlocks]"
              :key="`${runtimeThoughtDisclosureId}:${displayRuntimeThoughts.length}`"
            >
              <details
                v-if="displayRuntimeThoughts.length"
                class="tavern-thought-details"
                :open="thoughtDisclosure.isOpen(runtimeThoughtDisclosureId, true)"
                @toggle="thoughtDisclosure.setOpenFromEvent(runtimeThoughtDisclosureId, $event)"
              >
                <summary>{{ thoughtSummaryLabel(displayRuntimeThoughts, true) }}</summary>
                <template
                  v-if="thoughtDisclosure.isOpen(runtimeThoughtDisclosureId, true)"
                >
                  <div
                    v-for="(thought, thoughtIndex) in displayRuntimeThoughts"
                    :key="`runtime-thought-${thoughtIndex}`"
                    class="tavern-thought-block"
                  >
                    <div class="tavern-thought-label">
                      {{ thought.label }}
                    </div>
                    <pre>{{ thought.text }}</pre>
                  </div>
                </template>
              </details>
            </template>
            <TavernStreamMarkdown
              v-if="liveAssistantMarkdownVisible"
              :action-check-groups="liveAssistantRenderState.actionCheckGroups || undefined"
              :animated="true"
              :html="renderRoleplayMarkdown(liveAssistantRenderState.text)"
              :signature="liveAssistantRenderState.signature"
            />
          </div>
        </div>
        <div
          v-if="liveAssistantCanRender && !liveAssistantVisible"
          :key="runtimeAssistantMessageItemDomKey"
          class="chat-message-item"
        >
          <div
            data-chat-anchor-key="streaming:empty"
            class="chat-bubble from-assistant streaming thinking"
          >
            <div class="bubble-meta">
              <span class="bubble-nameplate">
                <span class="bubble-avatar-stamp">
                  <img
                    v-if="visibleCharacterAvatar"
                    :src="visibleCharacterAvatar"
                    alt=""
                    @error="rememberBrokenAvatar(visibleCharacterAvatar)"
                  >
                  <span v-else>{{ String(roleLabel('assistant')).slice(0, 1) }}</span>
                </span>
                <span class="bubble-role-name">{{ roleLabel('assistant') }}</span>
              </span>
              <small>{{ liveAssistantStatusLabel }}</small>
            </div>
            <p>正在组织回复...</p>
          </div>
        </div>
        <p
          v-if="!chatMessages.length && !isRunning"
          class="chat-empty"
        >
          写一句话，开始。
        </p>
        <div
          class="chat-compose-spacer"
          aria-hidden="true"
        />
        </div>
      </div>
      <TavernScrollControls
        :active="chatScrollControlsActive"
        :show-top="showChatScrollTop"
        :show-bottom="showChatScrollBottom"
        @top="scrollChatToTop"
        @bottom="jumpChatToBottom({ collapseWindow: true, revealHelpers: true })"
      />
    </div>
    <div class="chat-compose-dock">
      <div
        class="chat-compose-shell"
        :class="{ 'has-text': !!currentUserMessage.trim() }"
      >
        <div class="compose-menu-shell">
          <button
            type="button"
            class="compose-menu-button"
            title="聊天操作"
            aria-label="聊天操作"
            :aria-expanded="composeMenuOpen ? 'true' : 'false'"
            aria-controls="xb-tavern-compose-menu"
            :disabled="isRunning || isCancellingRun"
            @click.stop="toggleComposeMenu"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>
          <div
            v-if="composeMenuOpen"
            id="xb-tavern-compose-menu"
            class="compose-menu-popover"
            role="menu"
            @keydown.esc.stop.prevent="closeComposeMenu"
            @pointerdown.stop
            @mousedown.stop
            @touchstart.stop
            @click.stop
          >
            <button
              type="button"
              role="menuitem"
              class="compose-menu-item"
              @click="createSessionFromComposeMenu"
            >
              新建会话
            </button>
            <button
              type="button"
              role="menuitem"
              class="compose-menu-item"
              @click="openSessionArchiveFromComposeMenu"
            >
              会话档案
            </button>
            <button
              type="button"
              role="menuitem"
              class="compose-menu-item"
              @click="branchSessionFromComposeMenu"
            >
              对话分支
            </button>
            <button
              type="button"
              role="menuitem"
              class="compose-menu-item"
              @click="openAuthorNoteFromComposeMenu"
            >
              玩家便签
            </button>
            <button
              type="button"
              role="menuitem"
              class="compose-menu-item"
              @click="openRequestLogFromComposeMenu"
            >
              请求日志
            </button>
          </div>
        </div>
        <form
          class="chat-compose"
          @submit.prevent="handleChatSubmit"
        >
          <textarea
            :ref="setChatComposeTextareaRef"
            v-model="currentUserMessage"
            rows="1"
            placeholder="对角色说一句话..."
            @input="handleComposeInput"
            @keydown="handleComposeKeydown"
            @focus="closeComposeMenu"
          />
          <button
            type="submit"
            class="primary-action"
            :disabled="!canSendMessage"
            :aria-label="isCancellingRun ? '正在停止' : isRunning ? '停止' : '发送'"
          >
            <span
              class="compose-send-icon"
              aria-hidden="true"
            >
              {{ isCancellingRun ? '...' : isRunning ? '■' : '➤' }}
            </span>
            <span class="compose-send-label">
              {{ isCancellingRun ? '正在停止' : isRunning ? '停止' : '发送' }}
            </span>
          </button>
        </form>
      </div>
    </div>
    <div
      v-if="sessionArchiveOpen"
      class="character-session-archive-overlay chat-session-archive-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="会话档案"
      @click.self="closeSessionArchive"
    >
      <section class="character-session-archive chat-session-archive">
        <header>
          <div>
            <strong>会话档案</strong>
            <span>{{ currentChatCharacterSessions.length }} 个会话</span>
          </div>
          <button
            type="button"
            class="session-archive-close"
            aria-label="关闭会话档案"
            @click="closeSessionArchive"
          />
        </header>
        <div
          v-if="currentChatCharacterSessions.length"
          class="session-archive-list"
        >
          <div
            v-for="archivedSession in currentChatCharacterSessions"
            :key="archivedSession.id"
            class="session-archive-item"
            :class="{ active: archivedSession.id === selectedSessionId }"
          >
            <button
              type="button"
              class="session-archive-open"
              @click="openArchivedSession(archivedSession.id)"
            >
              <span class="session-archive-item-title">{{ sessionDisplayTitle(archivedSession) || '未命名会话' }}</span>
              <span class="session-archive-item-meta">{{ sessionFloorLabel(archivedSession) }}</span>
            </button>
            <button
              type="button"
              class="session-archive-delete"
              title="删除会话"
              aria-label="删除会话"
              @click="deleteArchivedSession(archivedSession.id, $event)"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M6 6l1 15h10l1-15" />
              </svg>
            </button>
          </div>
        </div>
        <p
          v-else
          class="session-archive-empty"
        >
          当前角色还没有其他会话。
        </p>
      </section>
    </div>
  </section>
</template>
