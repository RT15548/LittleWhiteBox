<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import TavernMessageEditPanel from './TavernMessageEditPanel.vue';
import TavernMessageMarkdown from './TavernMessageMarkdown.vue';
import { useTavernChatContext, useTavernDrawContext, useTavernShellContext } from '../tavern-app-context';
import { useTavernEphemeralDisclosureScope } from '../useTavernEphemeralDisclosureScope';
import { injectActionCheckRenderMarkers } from '../../../shared/runtime-events';
import type { TavernMessageRecord } from '../../../shared/session-db';

interface AssistantRenderState {
    text: string;
    signature: string;
    actionCheckGroups: string;
}

const props = defineProps<{
    message: TavernMessageRecord | null;
    streaming: boolean;
    anchorKey: string;
    actionTrayOpen?: boolean;
}>();

const emit = defineEmits<{
    (event: 'toggle-actions', mouseEvent: MouseEvent): void;
}>();

const shell = useTavernShellContext();
const chat = useTavernChatContext();
const draw = useTavernDrawContext();
const thoughtDisclosure = useTavernEphemeralDisclosureScope();
const visibleCharacterAvatar = chat.visibleCharacterAvatar;
const isRunning = chat.isRunning;
const thoughtDefaultOpen = ref(props.streaming);

const isEditing = computed(() => !!props.message && chat.isEditingMessage(props.message));
const messageKey = computed(() => props.message ? chat.messageKey(props.message) : props.anchorKey);
const bubbleRoleLabel = computed(() => chat.roleLabel('assistant'));
const useRuntimePresentation = computed(() => props.streaming || !props.message);
const renderState = computed<AssistantRenderState>(() => {
    const message = props.message;
    const projection = useRuntimePresentation.value || !message
        ? chat.displayRuntimeRenderProjection()
        : chat.displayMessageRenderProjection(message);
    const payload = injectActionCheckRenderMarkers(projection.text, projection.actionCheckEvents);
    const actionCheckGroups = payload.groups.length ? JSON.stringify(payload.groups) : '';
    const options = roleplayMarkdownOptions();
    return {
        text: payload.text,
        signature: chat.markdownSignature([
            payload.text,
            actionCheckGroups,
            options.userName,
            options.characterName,
            chat.htmlRenderEnabled.value ? 'html-render:on' : 'html-render:off',
            shell.homeThemeDark.value ? 'theme:dark' : 'theme:light',
        ].join('\u0000')),
        actionCheckGroups,
    };
});
const renderHtml = computed(() => chat.renderChatMarkdown(renderState.value.text, roleplayMarkdownOptions()));
const displayThoughts = computed(() => {
    const message = props.message;
    return useRuntimePresentation.value || !message
        ? chat.displayRuntimeThoughtBlocks()
        : chat.displayMessageThoughtBlocks(message);
});
const contentVisible = computed(() => !!String(renderState.value.text || '').trim());
const statusLabel = computed(() => {
    const label = chat.runtimeStatusLabel.value || '同步状态';
    const elapsedSeconds = Math.max(0, Math.floor(Number(chat.runtimeStatusElapsedSeconds.value) || 0));
    return `${label} ${elapsedSeconds}s`;
});
const bubbleTimeLabel = computed(() => props.streaming
    ? statusLabel.value
    : props.message ? chat.formatMessageTime(props.message.createdAt) : '');
const drawStatusText = computed(() => props.message ? draw.drawMessageStatusText(props.message) : '');

function roleplayMarkdownOptions() {
    return {
        roleplay: true,
        userName: chat.roleLabel('user'),
        characterName: chat.roleLabel('assistant'),
    };
}

watch(() => props.streaming, (streaming) => {
    if (!streaming) {return;}
    thoughtDefaultOpen.value = true;
});

function thoughtDisclosureId() {
    return `chat:thought:${props.anchorKey}`;
}

function isThoughtOpen() {
    return thoughtDisclosure.isOpen(thoughtDisclosureId(), thoughtDefaultOpen.value);
}

function setThoughtOpen(event: Event) {
    thoughtDisclosure.setOpenFromEvent(thoughtDisclosureId(), event);
}

function actionFeedback(action: string) {
    return props.message ? chat.actionFeedback(props.message, action) : '';
}

function canDraw() {
    return !!props.message && draw.canDrawMessage(props.message);
}

function canEdit() {
    return !!props.message && chat.canEditMessage(props.message);
}

function canRerun() {
    return !!props.message && chat.canRerunMessage(props.message);
}

function isDrawing() {
    return !!props.message && draw.isDrawingMessage(props.message);
}

function drawTitle() {
    return props.message ? draw.drawMessageTitle(props.message) : '';
}

function drawMessage() {
    if (props.message) {
        void draw.drawMessage(props.message);
    }
}

function copyMessage() {
    if (props.message) {
        void chat.copyMessage(props.message);
    }
}

function startEdit() {
    if (props.message) {
        chat.startEditMessage(props.message);
    }
}

function rerunMessage() {
    if (props.message) {
        void chat.rerunFromMessage(props.message);
    }
}

function deleteMessage() {
    if (props.message) {
        void chat.deleteMessageTurn(props.message);
    }
}
</script>

<template>
  <div
    :data-chat-anchor-key="anchorKey"
    :data-chat-streaming="streaming ? 'true' : undefined"
    class="chat-bubble chat-bubble-stable from-assistant"
    :class="{
      'is-action-tray-open': actionTrayOpen,
      'is-error': !!message?.error,
      thinking: streaming && !contentVisible,
    }"
    @click.stop="message && emit('toggle-actions', $event)"
  >
    <div class="bubble-meta">
      <div class="bubble-identity">
        <span class="bubble-nameplate">
          <span class="bubble-avatar-stamp">
            <img
              v-if="visibleCharacterAvatar"
              :src="visibleCharacterAvatar"
              alt=""
              @error="shell.rememberBrokenAvatar(visibleCharacterAvatar)"
            >
            <span v-else>{{ String(bubbleRoleLabel).slice(0, 1) }}</span>
          </span>
          <span class="bubble-role-name">{{ message?.error ? '错误' : bubbleRoleLabel }}</span>
          <span class="bubble-meta-line">
            <span
              v-show="!!message"
              class="message-floor-label"
              :title="message ? `第 ${String(Number(message.order) + 1)} 楼` : ''"
            >
              {{ message ? `#${Math.max(1, Number(message.order) + 1)}` : '' }}
            </span>
            <small class="bubble-time-tag">{{ bubbleTimeLabel }}</small>
          </span>
        </span>
      </div>
    </div>

    <div
      v-show="!!message && !isEditing"
      class="message-actions"
      :class="{ 'has-status': !!drawStatusText }"
      @click.stop
    >
      <span
        v-show="!!drawStatusText"
        class="message-draw-status"
        :class="message ? draw.drawMessageStatusClass(message) : ''"
      >
        {{ drawStatusText }}
      </span>
      <button
        type="button"
        :disabled="!canDraw()"
        :class="[message ? actionFeedback('draw') : '', { 'is-running': isDrawing() }]"
        :title="drawTitle()"
        :aria-label="drawTitle()"
        @click="drawMessage"
      >
        {{ isDrawing() ? '■' : '🎨' }}
      </button>
      <button
        type="button"
        :class="message ? actionFeedback('copy') : ''"
        title="复制"
        aria-label="复制"
        @click="copyMessage"
      >
        {{ message && actionFeedback('copy') === 'success' ? '✓' : message && actionFeedback('copy') === 'error' ? '!' : '⧉' }}
      </button>
      <button
        type="button"
        :disabled="!canEdit()"
        :class="message ? actionFeedback('edit') : ''"
        title="编辑"
        aria-label="编辑"
        @click="startEdit"
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
        :disabled="!canRerun()"
        :class="message ? actionFeedback('rerun') : ''"
        title="重 roll 最后一轮"
        aria-label="重 roll 最后一轮"
        @click="rerunMessage"
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
        :class="message ? actionFeedback('delete') : ''"
        title="从这里删除后续剧情"
        aria-label="从这里删除后续剧情"
        @click="deleteMessage"
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
      v-if="message && isEditing"
      :message="message"
      :message-key="messageKey"
      @cancel="chat.cancelEditMessage"
      @save="chat.saveEditMessage(message, $event)"
    />

    <details
      v-show="!isEditing && displayThoughts.length"
      class="tavern-thought-details"
      :open="isThoughtOpen()"
      @toggle="setThoughtOpen"
    >
      <summary>{{ chat.thoughtSummaryLabel(displayThoughts, streaming) }}</summary>
      <template v-if="isThoughtOpen()">
        <div
          v-for="(thought, thoughtIndex) in displayThoughts"
          :key="`${messageKey}-thought-${thoughtIndex}`"
          class="tavern-thought-block"
        >
          <div class="tavern-thought-label">
            {{ thought.label }}
          </div>
          <pre>{{ thought.text }}</pre>
        </div>
      </template>
    </details>

    <TavernMessageMarkdown
      v-show="!isEditing && contentVisible"
      :action-check-groups="renderState.actionCheckGroups || undefined"
      :html="renderHtml"
      :phase="streaming ? 'live' : 'settled'"
      :signature="renderState.signature"
    />
    <p
      v-show="!isEditing && !contentVisible"
      class="assistant-thinking-placeholder"
    >
      {{ streaming ? '正在组织回复...' : '' }}
    </p>
  </div>
</template>
