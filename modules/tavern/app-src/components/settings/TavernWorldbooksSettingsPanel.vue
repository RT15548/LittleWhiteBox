<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useTavernSettingsContext, type TavernWorldbookEntryDraft } from '../tavern-app-context';
import { useTavernEphemeralDisclosureScope } from '../useTavernEphemeralDisclosureScope';
import TavernSaveStatusIconButton from './TavernSaveStatusIconButton.vue';

const settings = useTavernSettingsContext();
const {
    activeSettingsWorkspace,
    cancelWorldbookEntryEdit,
    globalWorldbookOptions,
    globalWorldbookSelected,
    globalWorldbookSaving,
    globalWorldbookStatus,
    hiddenWorldbookPreviewEntryCount,
    isEditingWorldbookEntry,
    saveWorldbookEntryDraft,
    selectedWorldbook,
    selectedWorldbookName,
    showMoreWorldbookPreviewEntries,
    startWorldbookEntryEdit,
    toggleGlobalWorldbook,
    updateWorldbookEntryDraftPatch,
    WORLDBOOK_PREVIEW_BATCH_SIZE,
    worldbookEntryDirty,
    worldbookEntryDraft,
    worldbookEntryEditingKey,
    worldbookEntrySaveFeedback,
    worldbookEntrySaving,
    worldbookEntryStatus,
    worldbookOptions,
    worldbookPreview,
    worldbookPreviewStatus,
    worldbookStatus,
} = settings;

const worldbookDisclosure = useTavernEphemeralDisclosureScope();
const globalWorldbookPickerOpen = ref(false);
const worldbookEntryKeywordText = ref('');
const worldbookEntrySecondaryKeywordText = ref('');

const worldbookPositionOptions = [
    { value: '0:', label: '↑Char', title: '角色定义前' },
    { value: '1:', label: '↓Char', title: '角色定义后' },
    { value: '5:', label: '↑EM', title: '示例消息前' },
    { value: '6:', label: '↓EM', title: '示例消息后' },
    { value: '2:', label: '↑AN', title: '作者注释前' },
    { value: '3:', label: '↓AN', title: '作者注释后' },
    { value: '4:0', label: '@D ⚙️', title: '按深度注入：系统' },
    { value: '4:1', label: '@D 👤', title: '按深度注入：用户' },
    { value: '4:2', label: '@D 🤖', title: '按深度注入：助手' },
    { value: '7:', label: 'Outlet', title: 'Outlet' },
];

const worldbookLogicOptions = [
    { value: 0, label: '满足任一' },
    { value: 3, label: '全部满足' },
    { value: 1, label: '不全满足' },
    { value: 2, label: '全部不满足' },
];

const worldbookMatchSourceOptions: Array<{ key: keyof TavernWorldbookEntryDraft; label: string }> = [
    { key: 'matchPersonaDescription', label: '用户设定' },
    { key: 'matchCharacterDescription', label: '角色描述' },
    { key: 'matchCharacterPersonality', label: '角色人格' },
    { key: 'matchCharacterDepthPrompt', label: '角色深度提示' },
    { key: 'matchScenario', label: '场景' },
    { key: 'matchCreatorNotes', label: '作者备注' },
];

const globalWorldbookSummary = computed(() => {
    const count = globalWorldbookSelected.value.length;
    if (!count) {return '未启用';}
    if (count === 1) {return globalWorldbookSelected.value[0] || '1 本';}
    return `${count} 本`;
});

const globalWorldbookSelectedText = computed(() => (
    globalWorldbookSelected.value.length
        ? globalWorldbookSelected.value.join(' / ')
        : '没有全局生效的世界书'
));

function worldbookEntryDisclosureId(entry: { uid?: string | number; name: string; order?: number }) {
    const entryId = entry.uid !== undefined && entry.uid !== null && String(entry.uid).trim()
        ? String(entry.uid).trim()
        : entry.order !== undefined && entry.order !== null && String(entry.order).trim()
            ? String(entry.order).trim()
            : entry.name;
    return `worldbook:${selectedWorldbookName.value}:${entryId}`;
}

function worldbookAdvancedDisclosureId(draft: TavernWorldbookEntryDraft) {
    return `worldbook-advanced:${selectedWorldbookName.value}:${draft.uid}`;
}

function patchWorldbookEntryField<K extends keyof TavernWorldbookEntryDraft>(key: K, value: TavernWorldbookEntryDraft[K]) {
    updateWorldbookEntryDraftPatch({ [key]: value } as Partial<TavernWorldbookEntryDraft>);
}

function commaTextFromList(value: unknown) {
    return Array.isArray(value) ? value.map((item) => String(item || '').trim()).filter(Boolean).join(', ') : '';
}

function listFromCommaText(value = '') {
    return String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function syncWorldbookEntryKeywordText() {
    const draft = worldbookEntryDraft.value;
    worldbookEntryKeywordText.value = draft ? commaTextFromList(draft.key) : '';
    worldbookEntrySecondaryKeywordText.value = draft
        ? commaTextFromList(draft.keysecondary.length ? draft.keysecondary : draft.secondary_keys)
        : '';
}

function updateWorldbookEntryKeywordText(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    worldbookEntryKeywordText.value = text;
    updateWorldbookEntryDraftPatch({ key: listFromCommaText(text) });
}

function updateWorldbookEntrySecondaryKeywordText(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    const values = listFromCommaText(text);
    worldbookEntrySecondaryKeywordText.value = text;
    updateWorldbookEntryDraftPatch({
        keysecondary: values,
        secondary_keys: values,
    });
}

function numberInputValue(value: number | null | undefined) {
    return value === null || value === undefined ? '' : String(value);
}

function nullableNumberFromEvent(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value === '') {return null;}
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
}

function triStateValue(value: boolean | null | undefined) {
    if (value === true) {return 'true';}
    if (value === false) {return 'false';}
    return 'null';
}

function triStateFromEvent(event: Event): boolean | null {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'true') {return true;}
    if (value === 'false') {return false;}
    return null;
}

function worldbookEntryStateValue(draft: TavernWorldbookEntryDraft) {
    if (draft.constant) {return 'constant';}
    if (draft.vectorized) {return 'vectorized';}
    return 'normal';
}

function updateWorldbookEntryState(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    updateWorldbookEntryDraftPatch({
        constant: value === 'constant',
        vectorized: value === 'vectorized',
    });
}

function worldbookFilterLogicValue(draft: TavernWorldbookEntryDraft) {
    return draft.selective ? String(Number(draft.selectiveLogic) || 0) : 'off';
}

function updateWorldbookFilterLogic(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'off') {
        updateWorldbookEntryDraftPatch({ selective: false });
        return;
    }
    const selectiveLogic = Number(value);
    updateWorldbookEntryDraftPatch({
        selective: true,
        selectiveLogic: Number.isFinite(selectiveLogic) ? selectiveLogic : 0,
    });
}

function worldbookEntryStateLabel(entry: { enabled?: boolean; constant?: boolean; vectorized?: boolean }) {
    if (entry.enabled === false) {return '×';}
    if (entry.constant) {return '🔵';}
    if (entry.vectorized) {return '🔗';}
    return '🟢';
}

function worldbookEntryStateTitle(entry: { enabled?: boolean; constant?: boolean; vectorized?: boolean }) {
    if (entry.enabled === false) {return '关闭';}
    if (entry.constant) {return '常驻';}
    if (entry.vectorized) {return '向量化';}
    return '普通';
}

function worldbookPositionValue(draft: TavernWorldbookEntryDraft) {
    return `${Number(draft.position) || 0}:${Number(draft.position) === 4 ? Number(draft.role) || 0 : ''}`;
}

function updateWorldbookPosition(event: Event) {
    const [positionText, roleText = ''] = (event.target as HTMLSelectElement).value.split(':');
    const position = Number(positionText);
    const role = Number(roleText);
    const nextPosition = Number.isFinite(position) ? position : 0;
    updateWorldbookEntryDraftPatch({
        position: nextPosition,
        role: Number.isFinite(role) ? role : 0,
        depth: nextPosition === 4 ? worldbookEntryDraft.value?.depth ?? 4 : null,
    });
}

function worldbookPositionLabel(entry: { position?: number; role?: number; depth?: number | null }) {
    const position = Number(entry.position ?? 0);
    const option = worldbookPositionOptions.find((item) => item.value === `${position}:${position === 4 ? Number(entry.role || 0) : ''}`);
    if (position === 4) {
        return `${option?.label || '@D'} ${numberInputValue(entry.depth) || 4}`;
    }
    return option?.label || '↑Char';
}

function worldbookDepthEnabled(draft: TavernWorldbookEntryDraft) {
    return Number(draft.position) === 4;
}

function updateWorldbookProbability(event: Event) {
    const probability = nullableNumberFromEvent(event);
    updateWorldbookEntryDraftPatch({
        probability,
        useProbability: probability !== null,
    });
}

function updateWorldbookUseProbability(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    updateWorldbookEntryDraftPatch({
        useProbability: checked,
        probability: checked ? worldbookEntryDraft.value?.probability ?? 100 : null,
    });
}

function delayUntilRecursionChecked(value: boolean | number) {
    return value !== false && value !== 0;
}

function delayUntilRecursionLevel(value: boolean | number) {
    return typeof value === 'number' ? String(value) : '';
}

function updateDelayUntilRecursionEnabled(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    updateWorldbookEntryDraftPatch({ delayUntilRecursion: checked ? true : false });
}

function updateDelayUntilRecursionLevel(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (!value) {
        updateWorldbookEntryDraftPatch({ delayUntilRecursion: true });
        return;
    }
    const numberValue = Number(value);
    updateWorldbookEntryDraftPatch({ delayUntilRecursion: Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : false });
}

watch(
    [activeSettingsWorkspace, selectedWorldbookName, () => worldbookPreview.value?.name],
    () => worldbookDisclosure.reset(),
);

watch(() => {
    const draft = worldbookEntryDraft.value;
    return draft ? `${worldbookEntryEditingKey.value}:${draft.uid}:${draft.entryHash}:${draft.revision}` : '';
}, () => {
    syncWorldbookEntryKeywordText();
}, { immediate: true });
</script>

<template>
  <div
    v-show="activeSettingsWorkspace === 'worldbooks'"
    class="panel step-panel native-workspace"
  >
    <div class="panel-head preset-page-head">
      <div>
        <h2>世界书</h2>
      </div>
      <div class="panel-pills panel-head-actions">
        <span class="pill">{{ worldbookOptions.length }} 本</span>
      </div>
    </div>
    <div
      v-if="worldbookStatus"
      class="preset-status-line"
    >
      <span>{{ worldbookStatus }}</span>
    </div>
    <section class="worldbook-section worldbook-global-enable">
      <div class="worldbook-section-head worldbook-global-enable-head">
        <h3>已启用的全局世界书</h3>
      </div>
      <div class="worldbook-global-bar">
        <button
          type="button"
          class="worldbook-global-toggle"
          :aria-expanded="globalWorldbookPickerOpen"
          :disabled="globalWorldbookSaving"
          @click="globalWorldbookPickerOpen = !globalWorldbookPickerOpen"
        >
          {{ globalWorldbookSummary }}
        </button>
        <div class="worldbook-global-current">
          <span v-if="globalWorldbookStatus">{{ globalWorldbookStatus }}</span>
          <span v-else>{{ globalWorldbookSelectedText }}</span>
        </div>
      </div>
      <div
        v-if="globalWorldbookPickerOpen"
        class="worldbook-global-list"
      >
        <label
          v-for="name in globalWorldbookOptions"
          :key="name"
          class="worldbook-global-option"
        >
          <input
            type="checkbox"
            :checked="globalWorldbookSelected.includes(name)"
            :disabled="globalWorldbookSaving"
            @change="toggleGlobalWorldbook(name, ($event.target as HTMLInputElement).checked)"
          >
          <span>{{ name }}</span>
        </label>
        <span
          v-if="!globalWorldbookOptions.length"
          class="worldbook-global-empty"
        >没有世界书</span>
      </div>
    </section>
    <section class="worldbook-section worldbook-main-section">
      <div class="worldbook-section-head worldbook-main-head">
        <h3>世界书操作</h3>
      </div>
      <div class="preset-command-bar worldbook-command-bar">
        <label class="preset-source-select worldbook-source-select">
          <select
            aria-label="选择世界书"
            :value="selectedWorldbookName"
            @change="selectedWorldbookName = ($event.target as HTMLSelectElement).value"
          >
            <option value="">
              未选择
            </option>
            <option
              v-if="!worldbookOptions.length"
              value=""
              disabled
            >
              没有世界书
            </option>
            <option
              v-for="item in worldbookOptions"
              :key="item.name"
              :value="item.name"
            >
              {{ item.name }}
            </option>
          </select>
        </label>
      </div>
      <div class="native-settings-studio worldbook-overview-grid">
        <div class="native-detail-panel worldbook-overview-detail worldbook-gateway-panel">
          <div
            v-if="selectedWorldbook"
            class="worldbook-preview-surface"
          >
            <div
              v-if="worldbookPreviewStatus"
              class="worldbook-preview-status"
            >
              {{ worldbookPreviewStatus }}
            </div>
            <template v-else-if="worldbookPreview && worldbookPreview.name === selectedWorldbook.name">
              <div class="worldbook-metric-grid">
                <span>
                  <strong>{{ worldbookPreview.entryCount }}</strong>
                  <small>条目</small>
                </span>
                <span>
                  <strong>{{ worldbookPreview.enabledCount }}</strong>
                  <small>启用</small>
                </span>
                <span>
                  <strong>{{ worldbookPreview.constantCount }}</strong>
                  <small>常驻</small>
                </span>
                <span>
                  <strong>{{ worldbookPreview.keywordCount }}</strong>
                  <small>关键词</small>
                </span>
                <span>
                  <strong>{{ worldbookPreview.totalChars }}</strong>
                  <small>正文字符</small>
                </span>
              </div>
              <div
                v-if="worldbookPreview.entries.length"
                class="worldbook-entry-preview-list"
              >
                <details
                  v-for="entry in worldbookPreview.entries"
                  :key="worldbookEntryDisclosureId(entry)"
                  class="worldbook-entry-preview"
                  :class="{ disabled: !entry.enabled }"
                  :open="worldbookDisclosure.isOpen(worldbookEntryDisclosureId(entry))"
                  @toggle="worldbookDisclosure.setOpenFromEvent(worldbookEntryDisclosureId(entry), $event)"
                >
                  <summary>
                    <span class="worldbook-entry-title">
                      <strong>{{ entry.name }}</strong>
                    </span>
                    <span
                      class="worldbook-entry-state"
                      :title="worldbookEntryStateTitle(entry)"
                      :aria-label="worldbookEntryStateTitle(entry)"
                    >{{ worldbookEntryStateLabel(entry) }}</span>
                    <span class="worldbook-entry-position">{{ worldbookPositionLabel(entry) }}</span>
                  </summary>
                  <div
                    v-if="worldbookDisclosure.isOpen(worldbookEntryDisclosureId(entry))"
                    class="worldbook-entry-body"
                  >
                    <template v-if="isEditingWorldbookEntry(entry) && worldbookEntryDraft">
                      <form
                        class="worldbook-entry-editor"
                        @submit.prevent="saveWorldbookEntryDraft"
                      >
                        <div class="worldbook-entry-editor-head">
                          <span v-if="worldbookEntryStatus">{{ worldbookEntryStatus }}</span>
                          <span v-else>编辑条目</span>
                          <div class="worldbook-entry-editor-actions">
                            <button
                              type="button"
                              class="worldbook-row-open"
                              :disabled="worldbookEntrySaving"
                              @click="cancelWorldbookEntryEdit"
                            >
                              取消
                            </button>
                            <TavernSaveStatusIconButton
                              type="submit"
                              class="primary-action"
                              :status="worldbookEntrySaveFeedback.status"
                              :error="worldbookEntrySaveFeedback.error"
                              :disabled="!worldbookEntryDirty || worldbookEntrySaving"
                            />
                          </div>
                        </div>
                        <div class="worldbook-entry-core-grid">
                          <div class="worldbook-entry-title-row">
                            <label class="worldbook-entry-title-field">
                              <span>条目名</span>
                              <input
                                :value="worldbookEntryDraft.comment"
                                type="text"
                                @input="updateWorldbookEntryDraftPatch({ comment: ($event.target as HTMLInputElement).value })"
                              >
                            </label>
                            <label class="worldbook-entry-active-toggle">
                              <input
                                type="checkbox"
                                :checked="!worldbookEntryDraft.disable"
                                @change="updateWorldbookEntryDraftPatch({ disable: !($event.target as HTMLInputElement).checked, enabled: ($event.target as HTMLInputElement).checked })"
                              >
                              <span>启用</span>
                            </label>
                          </div>
                          <label class="worldbook-entry-state-field">
                            <span>状态</span>
                            <select
                              :value="worldbookEntryStateValue(worldbookEntryDraft)"
                              @change="updateWorldbookEntryState"
                            >
                              <option value="constant">
                                🔵 常驻
                              </option>
                              <option value="normal">
                                🟢 普通
                              </option>
                              <option value="vectorized">
                                🔗 向量化
                              </option>
                            </select>
                          </label>
                          <label class="worldbook-entry-position-field">
                            <span>注入位置</span>
                            <select
                              :value="worldbookPositionValue(worldbookEntryDraft)"
                              @change="updateWorldbookPosition"
                            >
                              <option
                                v-for="item in worldbookPositionOptions"
                                :key="item.value"
                                :value="item.value"
                                :title="item.title"
                              >
                                {{ item.label }}
                              </option>
                            </select>
                          </label>
                          <label class="worldbook-entry-depth-field">
                            <span>深度</span>
                            <input
                              :value="numberInputValue(worldbookEntryDraft.depth)"
                              type="number"
                              min="0"
                              max="9999"
                              step="1"
                              :disabled="!worldbookDepthEnabled(worldbookEntryDraft)"
                              @input="patchWorldbookEntryField('depth', nullableNumberFromEvent($event))"
                            >
                          </label>
                          <label class="worldbook-entry-order-field">
                            <span>排序</span>
                            <input
                              :value="worldbookEntryDraft.order"
                              type="number"
                              min="0"
                              max="9999"
                              step="1"
                              @input="patchWorldbookEntryField('order', Number(($event.target as HTMLInputElement).value))"
                            >
                          </label>
                          <label class="worldbook-entry-probability-field">
                            <span>触发概率</span>
                            <input
                              :value="numberInputValue(worldbookEntryDraft.probability)"
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              :disabled="!worldbookEntryDraft.useProbability"
                              @input="updateWorldbookProbability"
                            >
                          </label>
                          <label class="worldbook-entry-scan-depth-field">
                            <span>扫描深度</span>
                            <input
                              :value="numberInputValue(worldbookEntryDraft.scanDepth)"
                              type="number"
                              min="0"
                              max="1000"
                              @input="patchWorldbookEntryField('scanDepth', nullableNumberFromEvent($event))"
                            >
                          </label>
                        </div>
                        <div class="worldbook-entry-key-grid">
                          <label class="worldbook-entry-editor-lines worldbook-entry-keywords-field">
                            <span>关键词</span>
                            <input
                              :value="worldbookEntryKeywordText"
                              type="text"
                              @input="updateWorldbookEntryKeywordText"
                            >
                          </label>
                          <div class="worldbook-entry-filter-controls">
                            <label class="worldbook-entry-logic-field">
                              <span>过滤逻辑</span>
                              <select
                                :value="worldbookFilterLogicValue(worldbookEntryDraft)"
                                @change="updateWorldbookFilterLogic"
                              >
                                <option value="off">
                                  关闭
                                </option>
                                <option
                                  v-for="item in worldbookLogicOptions"
                                  :key="item.value"
                                  :value="item.value"
                                >
                                  {{ item.label }}
                                </option>
                              </select>
                            </label>
                          </div>
                          <label class="worldbook-entry-editor-lines worldbook-entry-keywords-field">
                            <span>可选过滤</span>
                            <input
                              :value="worldbookEntrySecondaryKeywordText"
                              type="text"
                              @input="updateWorldbookEntrySecondaryKeywordText"
                            >
                          </label>
                        </div>
                        <label class="worldbook-entry-editor-lines worldbook-entry-content-field">
                          <span>内容</span>
                          <textarea
                            :value="worldbookEntryDraft.content"
                            rows="9"
                            @input="updateWorldbookEntryDraftPatch({ content: ($event.target as HTMLTextAreaElement).value })"
                          />
                        </label>
                        <div
                          class="worldbook-entry-advanced"
                          :class="{ open: worldbookDisclosure.isOpen(worldbookAdvancedDisclosureId(worldbookEntryDraft)) }"
                        >
                          <button
                            type="button"
                            class="worldbook-entry-advanced-toggle"
                            :aria-expanded="worldbookDisclosure.isOpen(worldbookAdvancedDisclosureId(worldbookEntryDraft))"
                            @click="worldbookDisclosure.setOpen(worldbookAdvancedDisclosureId(worldbookEntryDraft), !worldbookDisclosure.isOpen(worldbookAdvancedDisclosureId(worldbookEntryDraft)))"
                          >
                            高级设置
                          </button>
                          <template v-if="worldbookDisclosure.isOpen(worldbookAdvancedDisclosureId(worldbookEntryDraft))">
                            <div class="worldbook-entry-advanced-grid">
                              <label>
                                <span>注入出口</span>
                                <input
                                  :value="worldbookEntryDraft.outletName"
                                  type="text"
                                  @input="patchWorldbookEntryField('outletName', ($event.target as HTMLInputElement).value)"
                                >
                              </label>
                              <label>
                                <span>区分大小写</span>
                                <select
                                  :value="triStateValue(worldbookEntryDraft.caseSensitive)"
                                  @change="patchWorldbookEntryField('caseSensitive', triStateFromEvent($event))"
                                >
                                  <option value="null">跟随全局</option>
                                  <option value="true">是</option>
                                  <option value="false">否</option>
                                </select>
                              </label>
                              <label>
                                <span>全词匹配</span>
                                <select
                                  :value="triStateValue(worldbookEntryDraft.matchWholeWords)"
                                  @change="patchWorldbookEntryField('matchWholeWords', triStateFromEvent($event))"
                                >
                                  <option value="null">跟随全局</option>
                                  <option value="true">是</option>
                                  <option value="false">否</option>
                                </select>
                              </label>
                              <label>
                                <span>分组评分</span>
                                <select
                                  :value="triStateValue(worldbookEntryDraft.useGroupScoring)"
                                  @change="patchWorldbookEntryField('useGroupScoring', triStateFromEvent($event))"
                                >
                                  <option value="null">跟随全局</option>
                                  <option value="true">是</option>
                                  <option value="false">否</option>
                                </select>
                              </label>
                              <label>
                                <span>自动化 ID</span>
                                <input
                                  :value="worldbookEntryDraft.automationId"
                                  type="text"
                                  @input="patchWorldbookEntryField('automationId', ($event.target as HTMLInputElement).value)"
                                >
                              </label>
                              <label>
                                <span>包含组</span>
                                <input
                                  :value="worldbookEntryDraft.group"
                                  type="text"
                                  @input="patchWorldbookEntryField('group', ($event.target as HTMLInputElement).value)"
                                >
                              </label>
                              <label>
                                <span>分组权重</span>
                                <input
                                  :value="numberInputValue(worldbookEntryDraft.groupWeight)"
                                  type="number"
                                  min="1"
                                  @input="patchWorldbookEntryField('groupWeight', nullableNumberFromEvent($event))"
                                >
                              </label>
                              <label>
                                <span>黏着轮数</span>
                                <input
                                  :value="numberInputValue(worldbookEntryDraft.sticky)"
                                  type="number"
                                  min="0"
                                  @input="patchWorldbookEntryField('sticky', nullableNumberFromEvent($event))"
                                >
                              </label>
                              <label>
                                <span>冷却轮数</span>
                                <input
                                  :value="numberInputValue(worldbookEntryDraft.cooldown)"
                                  type="number"
                                  min="0"
                                  @input="patchWorldbookEntryField('cooldown', nullableNumberFromEvent($event))"
                                >
                              </label>
                              <label>
                                <span>延迟轮数</span>
                                <input
                                  :value="numberInputValue(worldbookEntryDraft.delay)"
                                  type="number"
                                  min="0"
                                  @input="patchWorldbookEntryField('delay', nullableNumberFromEvent($event))"
                                >
                              </label>
                            </div>
                            <div class="worldbook-entry-advanced-checks">
                              <label>
                                <input
                                  type="checkbox"
                                  :checked="worldbookEntryDraft.useProbability"
                                  @change="updateWorldbookUseProbability"
                                >
                                <span>启用概率</span>
                              </label>
                              <label>
                                <input
                                  type="checkbox"
                                  :checked="worldbookEntryDraft.ignoreBudget"
                                  @change="patchWorldbookEntryField('ignoreBudget', ($event.target as HTMLInputElement).checked)"
                                >
                                <span>忽略预算</span>
                              </label>
                              <label>
                                <input
                                  type="checkbox"
                                  :checked="worldbookEntryDraft.excludeRecursion"
                                  @change="patchWorldbookEntryField('excludeRecursion', ($event.target as HTMLInputElement).checked)"
                                >
                                <span>排除递归</span>
                              </label>
                              <label>
                                <input
                                  type="checkbox"
                                  :checked="worldbookEntryDraft.preventRecursion"
                                  @change="patchWorldbookEntryField('preventRecursion', ($event.target as HTMLInputElement).checked)"
                                >
                                <span>阻止递归</span>
                              </label>
                              <label>
                                <input
                                  type="checkbox"
                                  :checked="worldbookEntryDraft.groupOverride"
                                  @change="patchWorldbookEntryField('groupOverride', ($event.target as HTMLInputElement).checked)"
                                >
                                <span>分组优先</span>
                              </label>
                              <label>
                                <input
                                  type="checkbox"
                                  :checked="delayUntilRecursionChecked(worldbookEntryDraft.delayUntilRecursion)"
                                  @change="updateDelayUntilRecursionEnabled"
                                >
                                <span>递归后延迟</span>
                              </label>
                              <label>
                                <span>递归层级</span>
                                <input
                                  :value="delayUntilRecursionLevel(worldbookEntryDraft.delayUntilRecursion)"
                                  type="number"
                                  min="1"
                                  :disabled="!delayUntilRecursionChecked(worldbookEntryDraft.delayUntilRecursion)"
                                  @input="updateDelayUntilRecursionLevel"
                                >
                              </label>
                            </div>
                            <label class="worldbook-entry-editor-lines worldbook-entry-triggers-field">
                              <span>生成触发</span>
                              <input
                                :value="commaTextFromList(worldbookEntryDraft.triggers)"
                                type="text"
                                @input="patchWorldbookEntryField('triggers', listFromCommaText(($event.target as HTMLInputElement).value))"
                              >
                            </label>
                            <div class="worldbook-entry-match-source-list">
                              <span>额外匹配源</span>
                              <label
                                v-for="item in worldbookMatchSourceOptions"
                                :key="item.key"
                              >
                                <input
                                  type="checkbox"
                                  :checked="Boolean(worldbookEntryDraft[item.key])"
                                  @change="patchWorldbookEntryField(item.key, ($event.target as HTMLInputElement).checked as never)"
                                >
                                <span>{{ item.label }}</span>
                              </label>
                            </div>
                          </template>
                        </div>
                      </form>
                    </template>
                    <template v-else>
                      <div class="worldbook-entry-actions">
                        <button
                          type="button"
                          class="worldbook-row-open"
                          @click="startWorldbookEntryEdit(entry)"
                        >
                          编辑
                        </button>
                        <span v-if="worldbookEntryStatus && isEditingWorldbookEntry(entry)">{{ worldbookEntryStatus }}</span>
                      </div>
                      <p
                        v-if="entry.keys.length || entry.secondaryKeys.length"
                        class="worldbook-entry-keys"
                      >
                        {{ [...entry.keys, ...entry.secondaryKeys].join(' / ') }}
                      </p>
                      <p
                        v-if="entry.contentPreview"
                        class="worldbook-entry-content"
                      >
                        {{ entry.contentPreview }}
                      </p>
                    </template>
                  </div>
                </details>
                <button
                  v-if="hiddenWorldbookPreviewEntryCount"
                  type="button"
                  class="native-add-row worldbook-preview-more"
                  @click="showMoreWorldbookPreviewEntries"
                >
                  再显示 {{ Math.min(hiddenWorldbookPreviewEntryCount, WORLDBOOK_PREVIEW_BATCH_SIZE) }} 条
                </button>
              </div>
              <div
                v-else
                class="empty-note"
              >
                这本世界书暂无条目。
              </div>
            </template>
          </div>
          <div
            v-else
            class="empty-note"
          >
            选择一本世界书后查看预览。
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
