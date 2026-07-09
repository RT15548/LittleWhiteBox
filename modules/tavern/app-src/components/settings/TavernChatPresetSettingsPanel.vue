<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useTavernSettingsContext } from '../tavern-app-context';
import { useTavernMediaQuery } from '../useTavernMediaQuery';
import TavernSaveStatusIconButton from './TavernSaveStatusIconButton.vue';

const settings = useTavernSettingsContext();
const {
    activePromptOrderLabel,
    activeSettingsWorkspace,
    canEditPromptOrder,
    chatPresetOptions,
    discardPresetChanges,
    filteredPromptEditorRows,
    hiddenPromptCount,
    movePromptRow,
    preset,
    presetDirty,
    presetRows,
    presetSaveFeedback,
    presetStatus,
    presetTotalChars,
    PROMPT_EDITOR_BATCH_SIZE,
    promptEditorRows,
    promptRoleDisplay,
    promptRowIndex,
    promptSearchText,
    promptVisibleLimit,
    saveCurrentPreset,
    selectChatPresetFromHost,
    selectedPresetSourceId,
    selectedPromptIdentifier,
    selectedPromptRow,
    togglePromptRow,
    updatePromptByIdentifier,
    visiblePromptEditorRows,
} = settings;

const selectedChatPresetName = computed(() => String(
    selectedPresetSourceId.value
    || preset.value.promptManager?.name
    || preset.value.name
    || '',
).trim());
const mobileEditorOpen = ref(false);
const isMobileSettingsViewport = useTavernMediaQuery('(max-width: 560px)');
const shouldMountPromptEditor = computed(() => (
    activeSettingsWorkspace.value === 'chatPreset'
    && (!isMobileSettingsViewport.value || mobileEditorOpen.value)
));
const presetSaveButtonDisabled = computed(() => (
    !canEditPromptOrder.value
    || !presetDirty.value
    || presetSaveFeedback.value.status === 'saving'
));

function openPromptEditor(identifier: string) {
    selectedPromptIdentifier.value = identifier;
    mobileEditorOpen.value = true;
}

function closePromptEditor() {
    mobileEditorOpen.value = false;
}

function promptRoleLetter(role: string) {
    if (role === 'assistant') {return 'A';}
    if (role === 'user') {return 'U';}
    return 'S';
}

watch(activeSettingsWorkspace, (workspace) => {
    if (workspace !== 'chatPreset') {
        mobileEditorOpen.value = false;
    }
});
</script>

<template>
  <div
    v-show="activeSettingsWorkspace === 'chatPreset'"
    class="panel step-panel preset-workspace"
    :class="{ 'is-mobile-editor-open': mobileEditorOpen }"
  >
    <div class="panel-head preset-page-head">
      <div>
        <h2>聊天预设</h2>
      </div>
      <div class="panel-pills">
        <span
          v-if="presetDirty"
          class="pill warning"
        >未保存</span>
        <span class="pill">{{ presetRows.length }} 条 · {{ presetTotalChars }} 字</span>
      </div>
    </div>
    <div class="preset-command-bar">
      <label class="preset-source-select">
        <select
          :value="selectedChatPresetName"
          @change="selectChatPresetFromHost(($event.target as HTMLSelectElement).value)"
        >
          <option
            v-if="!chatPresetOptions.length"
            value=""
          >
            没有可用预设
          </option>
          <option
            v-for="item in chatPresetOptions"
            :key="item.name"
            :value="item.name"
          >
            {{ item.label }}
          </option>
        </select>
      </label>
      <div class="settings-toolstrip">
        <button
          type="button"
          class="settings-icon-tool"
          title="放弃修改"
          aria-label="放弃修改"
          :disabled="!presetDirty"
          @click="discardPresetChanges"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a8 8 0 0 0-13.7-5.7L3 15" />
          </svg>
        </button>
        <TavernSaveStatusIconButton
          type="button"
          class="settings-icon-tool"
          :status="presetSaveFeedback.status"
          :error="presetSaveFeedback.error"
          :disabled="presetSaveButtonDisabled"
          @click="saveCurrentPreset"
        />
      </div>
    </div>
    <div
      v-if="presetStatus"
      class="preset-status-line"
    >
      <span>{{ presetStatus }}</span>
    </div>

    <div class="preset-studio">
      <section class="preset-edit-main prompt-sequence-panel">
        <div class="preset-form-grid prompt-sequence-summary">
          <label>
            <span>当前来源</span>
            <input
              :value="preset.promptManager?.name || ''"
              readonly
            >
          </label>
          <label>
            <span>顺序</span>
            <input
              :value="activePromptOrderLabel"
              readonly
            >
          </label>
        </div>
        <div class="archive-toolbar preset-filterbar">
          <label class="archive-search">
            <span>检索条目</span>
            <input
              v-model="promptSearchText"
              type="search"
              placeholder="按名称、消息身份或内容搜索"
            >
          </label>
          <p>
            显示 {{ Math.min(filteredPromptEditorRows.length, promptVisibleLimit) }} / {{ filteredPromptEditorRows.length }}，共 {{ promptEditorRows.length }} 条
          </p>
        </div>
        <div class="prompt-manager-list">
          <div
            v-if="!visiblePromptEditorRows.length"
            class="inline-empty-note"
          >
            没有匹配的提示词条目。
          </div>
          <div
            v-for="row in visiblePromptEditorRows"
            :key="row.identifier"
            class="prompt-manager-row"
            :class="{ selected: selectedPromptIdentifier === row.identifier, disabled: !row.enabled, marker: row.marker }"
            @click="selectedPromptIdentifier = row.identifier"
          >
            <button
              type="button"
              class="prompt-row-index"
              title="选择"
              @click.stop="selectedPromptIdentifier = row.identifier"
            >
              {{ promptRowIndex(row.identifier) + 1 }}
            </button>
            <div class="prompt-row-main">
              <strong>{{ row.name }}</strong>
              <small>{{ promptRoleDisplay(row.role) }}</small>
            </div>
            <div class="prompt-row-actions">
              <span
                class="prompt-role-badge"
                :title="promptRoleDisplay(row.role)"
                :aria-label="promptRoleDisplay(row.role)"
              >
                {{ promptRoleLetter(row.role) }}
              </span>
              <button
                type="button"
                class="prompt-edit-button"
                title="编辑"
                aria-label="编辑"
                @click.stop="openPromptEditor(row.identifier)"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
              <button
                type="button"
                title="上移"
                class="prompt-move-button"
                :disabled="!canEditPromptOrder || !!promptSearchText || promptRowIndex(row.identifier) === 0"
                @click.stop="movePromptRow(row.identifier, -1)"
              >
                ↑
              </button>
              <button
                type="button"
                title="下移"
                class="prompt-move-button"
                :disabled="!canEditPromptOrder || !!promptSearchText || promptRowIndex(row.identifier) === promptEditorRows.length - 1"
                @click.stop="movePromptRow(row.identifier, 1)"
              >
                ↓
              </button>
              <label
                class="prompt-toggle"
                title="启用"
                @click.stop
              >
                <input
                  type="checkbox"
                  :checked="row.enabled"
                  :disabled="!canEditPromptOrder"
                  @change="togglePromptRow(row.identifier, ($event.target as HTMLInputElement).checked)"
                >
              </label>
            </div>
          </div>
        </div>
        <button
          v-if="hiddenPromptCount"
          type="button"
          class="archive-load-more"
          @click="promptVisibleLimit += PROMPT_EDITOR_BATCH_SIZE"
        >
          再显示 {{ Math.min(hiddenPromptCount, PROMPT_EDITOR_BATCH_SIZE) }} 条
        </button>
      </section>

      <aside
        v-if="shouldMountPromptEditor"
        class="preset-preview-panel prompt-detail-panel prompt-editor-panel"
      >
        <div class="preset-preview-head">
          <strong>{{ selectedPromptRow?.name || '提示词条目' }}</strong>
          <span>{{ promptRoleDisplay(String(selectedPromptRow?.role || 'system')) }}</span>
          <button
            v-if="isMobileSettingsViewport"
            type="button"
            class="prompt-editor-close"
            title="关闭"
            aria-label="关闭"
            @click="closePromptEditor"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div
          v-if="selectedPromptRow"
          class="prompt-detail-form prompt-editor-form"
        >
          <label>
            <span>名称</span>
            <input
              :value="selectedPromptRow.name"
              @input="updatePromptByIdentifier(selectedPromptRow.identifier, { name: ($event.target as HTMLInputElement).value })"
            >
          </label>
          <label>
            <span>消息身份</span>
            <select
              :value="selectedPromptRow.role"
              @change="updatePromptByIdentifier(selectedPromptRow.identifier, { role: ($event.target as HTMLSelectElement).value })"
            >
              <option value="system">系统</option>
              <option value="user">用户</option>
              <option value="assistant">助手</option>
            </select>
          </label>
          <label class="preset-text-field">
            <span>内容</span>
            <textarea
              :value="selectedPromptRow.content"
              rows="16"
              spellcheck="false"
              :disabled="selectedPromptRow.marker"
              @input="updatePromptByIdentifier(selectedPromptRow.identifier, { content: ($event.target as HTMLTextAreaElement).value })"
            />
          </label>
          <p
            v-if="selectedPromptRow.marker"
            class="muted compact"
          >
            这是酒馆顺序占位条目，不允许编辑。
          </p>
        </div>
        <div
          v-else
          class="empty-note"
        >
          当前预设没有可编辑条目。
        </div>
      </aside>
    </div>
  </div>
</template>
