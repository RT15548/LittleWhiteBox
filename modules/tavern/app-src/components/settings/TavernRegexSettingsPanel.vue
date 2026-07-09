<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useTavernSettingsContext } from '../tavern-app-context';
import { useTavernMediaQuery } from '../useTavernMediaQuery';
import TavernSaveStatusIconButton from './TavernSaveStatusIconButton.vue';

const settings = useTavernSettingsContext();
const {
    activeSettingsWorkspace,
    createRegexScript,
    deleteRegexScript,
    discardRegexChanges,
    expandRegexGroup,
    linesFromList,
    listFromLines,
    REGEX_GROUP_BATCH_SIZE,
    regexDirty,
    regexDraft,
    regexDraftTypeLabel,
    regexGroups,
    regexGroupsForDisplay,
    regexPlacementLabel,
    regexScriptRows,
    regexSearchText,
    regexSaveFeedback,
    regexStatus,
    saveCurrentRegexScript,
    selectedRegexKey,
    selectedRegexRow,
    selectRegexScript,
    toggleRegexPlacement,
    updateRegexPatch,
} = settings;

type RegexRow = (typeof regexScriptRows)['value'][number];
type RegexCreateGroup = (typeof regexGroups)['value'][number];

const mobileRegexEditorOpen = ref(false);
const isMobileSettingsViewport = useTavernMediaQuery('(max-width: 560px)');
const selectedRegexGroupKey = ref('');
const regexCreateMenuOpen = ref(false);
const activeRegexGroupsForDisplay = computed(() => {
    const key = selectedRegexGroupKey.value;
    if (!key) {return regexGroupsForDisplay.value;}
    return regexGroupsForDisplay.value.filter((group) => group.key === key);
});
const regexCreateGroups = computed(() => regexGroups.value.filter((group) => Number.isFinite(group.scriptType)));
const shouldMountRegexEditor = computed(() => (
    activeSettingsWorkspace.value === 'regex'
    && (!isMobileSettingsViewport.value || mobileRegexEditorOpen.value)
));

function openRegexEditor(row: RegexRow) {
    void selectRegexScript(row).then((selected) => {
        if (selected) {
            mobileRegexEditorOpen.value = true;
        }
    });
}

function createMobileRegexScript(group: RegexCreateGroup) {
    void createRegexScript(group).then((created) => {
        if (created) {
            regexCreateMenuOpen.value = false;
            mobileRegexEditorOpen.value = true;
        }
    });
}

function closeRegexEditor() {
    mobileRegexEditorOpen.value = false;
}

function cancelRegexEdit() {
    discardRegexChanges();
    closeRegexEditor();
}

async function saveRegexEdit() {
    const selectedKeyAtRequest = selectedRegexKey.value;
    await saveCurrentRegexScript();
    if (selectedRegexKey.value === selectedKeyAtRequest && !regexDirty.value) {
        closeRegexEditor();
    }
}

function toggleRegexCreateMenu() {
    regexCreateMenuOpen.value = !regexCreateMenuOpen.value;
}

function regexCreateOptionTitle(group: RegexCreateGroup) {
    if (group.key === 'scoped') {
        return '保存到酒馆本体当前角色';
    }
    if (group.key === 'preset') {
        return '保存到当前酒馆预设';
    }
    return '保存到全局正则';
}

function handleRegexRowKeydown(event: KeyboardEvent, row: RegexRow) {
    if (event.key !== 'Enter' && event.key !== ' ') {return;}
    event.preventDefault();
    openRegexEditor(row);
}

watch(activeSettingsWorkspace, (workspace) => {
    if (workspace !== 'regex') {
        mobileRegexEditorOpen.value = false;
        regexCreateMenuOpen.value = false;
    }
});
</script>

<template>
  <div
    v-show="activeSettingsWorkspace === 'regex'"
    class="panel step-panel native-workspace"
    :class="{ 'is-mobile-editor-open': mobileRegexEditorOpen }"
  >
    <div class="panel-head preset-page-head">
      <div>
        <h2>正则</h2>
      </div>
      <div class="panel-pills">
        <span
          v-if="regexDirty"
          class="pill warning"
        >未保存</span>
        <span class="pill">{{ regexScriptRows.length }} 条</span>
      </div>
    </div>
    <div class="preset-command-bar regex-command-bar">
      <label class="preset-source-select regex-group-select">
        <select v-model="selectedRegexGroupKey">
          <option value="">
            全部正则
          </option>
          <option
            v-for="group in regexGroupsForDisplay"
            :key="group.key"
            :value="group.key"
          >
            {{ group.label }}
          </option>
        </select>
      </label>
      <label class="archive-search native-search regex-search-field">
        <input
          v-model="regexSearchText"
          type="search"
          aria-label="筛选正则"
          placeholder="名称、匹配式或替换文本"
        >
      </label>
      <div class="settings-toolstrip">
        <div
          class="regex-create-menu"
          :class="{ open: regexCreateMenuOpen }"
        >
          <button
            type="button"
            class="settings-icon-tool regex-create-trigger"
            title="新增正则"
            aria-label="新增正则"
            :aria-expanded="regexCreateMenuOpen ? 'true' : 'false'"
            @click="toggleRegexCreateMenu"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
          <div
            v-if="regexCreateMenuOpen"
            class="regex-create-popover"
          >
            <button
              v-for="group in regexCreateGroups"
              :key="group.key"
              type="button"
              @click="createMobileRegexScript(group)"
            >
              <strong>{{ group.label }}</strong>
              <span>{{ regexCreateOptionTitle(group) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="regexStatus"
      class="preset-status-line"
    >
      <span>{{ regexStatus }}</span>
    </div>
    <div class="native-settings-studio regex-studio">
      <aside class="native-list-panel regex-group-panel regex-library-panel">
        <div
          v-for="group in activeRegexGroupsForDisplay"
          :key="group.key"
          class="regex-group-block"
        >
          <div class="assistant-preset-nav-head">
            <strong>{{ group.label }}</strong>
            <span>{{ group.allowed === false ? '未允许' : `${group.visibleRows.length} / ${group.filteredCount} / ${group.totalCount} 条` }}</span>
          </div>
          <div
            v-for="row in group.visibleRows"
            :key="row.key"
            class="native-list-row regex-list-row"
            :class="{ selected: selectedRegexKey === row.key, disabled: row.script.disabled }"
            role="button"
            tabindex="0"
            @click="openRegexEditor(row)"
            @keydown="handleRegexRowKeydown($event, row)"
          >
            <span class="regex-row-state">{{ row.script.disabled ? '停' : '用' }}</span>
            <span class="regex-row-copy">
              <strong>{{ row.script.scriptName || '未命名正则' }}</strong>
              <small>{{ row.script.findRegex || '空匹配式' }}</small>
            </span>
            <span class="regex-row-actions">
              <button
                type="button"
                class="regex-row-icon regex-row-edit-icon"
                title="编辑"
                aria-label="编辑"
                @click.stop="openRegexEditor(row)"
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
                class="regex-row-icon regex-row-delete-icon"
                title="删除"
                aria-label="删除"
                @click.stop="deleteRegexScript(row)"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            </span>
          </div>
          <button
            v-if="group.hiddenCount"
            type="button"
            class="native-add-row"
            @click="expandRegexGroup(group.key)"
          >
            再显示 {{ Math.min(group.hiddenCount, REGEX_GROUP_BATCH_SIZE) }} 条
          </button>
        </div>
        <div
          v-if="regexSearchText && !activeRegexGroupsForDisplay.length"
          class="inline-empty-note"
        >
          没有匹配的正则。
        </div>
      </aside>

      <section
        v-if="shouldMountRegexEditor"
        class="native-detail-panel regex-detail-panel"
      >
        <template v-if="selectedRegexKey || regexDraft.scriptName">
          <div class="preset-preview-head">
            <strong>{{ regexDraft.scriptName || '新正则' }}</strong>
            <span>{{ regexDraftTypeLabel() }}</span>
            <div class="regex-editor-actions">
              <button
                type="button"
                class="regex-editor-secondary"
                :disabled="regexSaveFeedback.status === 'saving'"
                @click="cancelRegexEdit"
              >
                取消
              </button>
              <TavernSaveStatusIconButton
                type="button"
                class="regex-editor-primary"
                :status="regexSaveFeedback.status"
                :error="regexSaveFeedback.error"
                :disabled="!regexDraft.scriptName || !regexDirty || regexSaveFeedback.status === 'saving'"
                @click="saveRegexEdit"
              />
            </div>
          </div>
          <div class="regex-editor-grid">
            <section class="regex-editor-section regex-pattern-section">
              <div class="regex-section-title">
                查找与替换
              </div>
              <div class="native-form-grid regex-editor-meta">
                <label>
                  <span>名称</span>
                  <input
                    :value="regexDraft.scriptName || ''"
                    @input="updateRegexPatch({ scriptName: ($event.target as HTMLInputElement).value })"
                  >
                </label>
                <label>
                  <span>匹配</span>
                  <input
                    :value="regexDraft.findRegex || ''"
                    spellcheck="false"
                    @input="updateRegexPatch({ findRegex: ($event.target as HTMLInputElement).value })"
                  >
                </label>
              </div>
              <label class="preset-text-field regex-main-field">
                <span>替换为</span>
                <textarea
                  :value="regexDraft.replaceString || ''"
                  rows="5"
                  spellcheck="false"
                  @input="updateRegexPatch({ replaceString: ($event.target as HTMLTextAreaElement).value })"
                />
              </label>
              <label class="preset-text-field regex-support-field">
                <span>裁剪字符串</span>
                <textarea
                  :value="linesFromList(regexDraft.trimStrings)"
                  rows="3"
                  spellcheck="false"
                  @input="updateRegexPatch({ trimStrings: listFromLines(($event.target as HTMLTextAreaElement).value) })"
                />
              </label>
            </section>

            <section class="regex-editor-section regex-placement-section">
              <div class="regex-section-title">
                作用范围
              </div>
              <div class="native-check-row placement-row regex-editor-switches">
                <label
                  v-for="value in [1, 2, 3, 5, 6]"
                  :key="value"
                  class="inline-check"
                >
                  <input
                    type="checkbox"
                    :checked="(regexDraft.placement || []).includes(value)"
                    @change="toggleRegexPlacement(value, ($event.target as HTMLInputElement).checked)"
                  >
                  <span>{{ regexPlacementLabel(value) }}</span>
                </label>
              </div>
            </section>

            <section class="regex-editor-section regex-ephemeral-section">
              <div class="regex-section-title">
                表层替换
              </div>
              <div class="native-check-row regex-editor-switches">
                <label class="inline-check">
                  <input
                    type="checkbox"
                    :checked="regexDraft.markdownOnly === true"
                    @change="updateRegexPatch({ markdownOnly: ($event.target as HTMLInputElement).checked })"
                  >
                  <span>只改显示</span>
                </label>
                <label class="inline-check">
                  <input
                    type="checkbox"
                    :checked="regexDraft.promptOnly === true"
                    @change="updateRegexPatch({ promptOnly: ($event.target as HTMLInputElement).checked })"
                  >
                  <span>只改提示词</span>
                </label>
              </div>
            </section>

            <section class="regex-editor-section regex-options-section">
              <div class="regex-section-title">
                其他选项
              </div>
              <div class="native-check-row regex-editor-switches">
                <label class="inline-check">
                  <input
                    type="checkbox"
                    :checked="regexDraft.disabled === true"
                    @change="updateRegexPatch({ disabled: ($event.target as HTMLInputElement).checked })"
                  >
                  <span>停用</span>
                </label>
                <label class="inline-check">
                  <input
                    type="checkbox"
                    :checked="regexDraft.runOnEdit === true"
                    @change="updateRegexPatch({ runOnEdit: ($event.target as HTMLInputElement).checked })"
                  >
                  <span>编辑时执行</span>
                </label>
              </div>
              <div class="native-form-grid regex-advanced-grid">
                <label>
                  <span>查找宏</span>
                  <select
                    :value="regexDraft.substituteRegex ?? 0"
                    @change="updateRegexPatch({ substituteRegex: Number(($event.target as HTMLSelectElement).value) })"
                  >
                    <option :value="0">不替换</option>
                    <option :value="1">原样替换</option>
                    <option :value="2">转义替换</option>
                  </select>
                </label>
                <label>
                  <span>最小深度</span>
                  <input
                    type="number"
                    :value="regexDraft.minDepth ?? ''"
                    @input="updateRegexPatch({ minDepth: ($event.target as HTMLInputElement).value === '' ? null : Number(($event.target as HTMLInputElement).value) })"
                  >
                </label>
                <label>
                  <span>最大深度</span>
                  <input
                    type="number"
                    :value="regexDraft.maxDepth ?? ''"
                    @input="updateRegexPatch({ maxDepth: ($event.target as HTMLInputElement).value === '' ? null : Number(($event.target as HTMLInputElement).value) })"
                  >
                </label>
              </div>
            </section>
          </div>
        </template>
        <div
          v-else
          class="empty-note"
        >
          选择一条正则，或在左侧新建。
        </div>
      </section>
    </div>
  </div>
</template>
