<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTavernSettingsContext, useTavernShellContext } from '../tavern-app-context';
import { DEFAULT_TAVERN_ASSISTANT_PRESET_ID } from '../../../shared/assistant-presets';
import type { TavernAssistantPresetRecord } from '../../../shared/session-db';
import TavernSaveStatusIconButton from './TavernSaveStatusIconButton.vue';

const settings = useTavernSettingsContext();
const shell = useTavernShellContext();
const {
    activeAssistantPresetId,
    activeSettingsWorkspace,
    assistantPreset,
    assistantPresetDirty,
    assistantPresetItems,
    assistantPresets,
    assistantPresetSaveFeedback,
    assistantPresetStatus,
    createAssistantPreset,
    deleteCurrentAssistantPreset,
    importAssistantPreset,
    saveCurrentAssistantPreset,
    selectAssistantPreset,
    selectAssistantPresetItem,
    selectedAssistantPresetItem,
    shortText,
    updateAssistantPresetPatch,
    updateSelectedAssistantPresetItem,
} = settings;

const selectedAssistantPresetId = computed(() => String(activeAssistantPresetId.value || assistantPreset.value.id || '').trim());
const currentAssistantPresetRecord = computed(() => assistantPresets.value.find((item: TavernAssistantPresetRecord) => item.id === selectedAssistantPresetId.value) || null);
const importInputRef = ref<HTMLInputElement | null>(null);
const statusPanelHelpOpen = ref(false);
const showStatusPanelHelpButton = computed(() => selectedAssistantPresetItem.value?.id === 'statusPrompt');
const assistantPresetSaveButtonDisabled = computed(() => (
    !assistantPresetDirty.value
    || assistantPresetSaveFeedback.value.status === 'saving'
));

async function renameCurrentPreset() {
    const currentName = String(assistantPreset.value.name || '').trim() || '助手预设';
    const nextName = await shell.promptTavernDialog({
        title: '重命名助手预设',
        message: '输入预设名称：',
        defaultValue: currentName,
        confirmText: '保存',
    });
    if (nextName === null) {return;}
    const normalized = String(nextName || '').trim();
    if (!normalized || normalized === currentName) {return;}
    updateAssistantPresetPatch({ name: normalized });
}

function triggerImportPreset() {
    importInputRef.value?.click();
}

function openStatusPanelHelp() {
    statusPanelHelpOpen.value = true;
}

function closeStatusPanelHelp() {
    statusPanelHelpOpen.value = false;
}

async function handleImportPreset(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {return;}
    try {
        const text = await file.text();
        await importAssistantPreset(JSON.parse(text));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error || '导入失败');
        await shell.alertTavernDialog({
            title: '导入失败',
            message: message || '导入失败',
        });
    } finally {
        if (input) {
            input.value = '';
        }
    }
}

function exportCurrentPreset() {
    const name = String(assistantPreset.value.name || 'assistant-preset').trim() || 'assistant-preset';
    const payload = {
        kind: 'littlewhitebox-assistant-preset',
        version: 1,
        exportedAt: new Date().toISOString(),
        preset: assistantPreset.value,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${name.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim() || 'assistant-preset'}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}
</script>

<template>
  <div
    v-show="activeSettingsWorkspace === 'assistantPreset'"
    class="panel step-panel preset-workspace"
  >
    <div class="panel-head preset-page-head">
      <div>
        <h2>助手预设</h2>
      </div>
      <div class="panel-pills">
        <span
          v-if="assistantPresetDirty"
          class="pill warning"
        >未保存</span>
      </div>
    </div>
    <div class="preset-command-bar assistant-preset-command-bar">
      <label class="assistant-preset-picker">
        <select
          :value="selectedAssistantPresetId"
          @change="selectAssistantPreset(($event.target as HTMLSelectElement).value)"
        >
          <option
            v-if="!assistantPresets.length"
            value=""
          >
            没有可用助手预设
          </option>
          <option
            v-for="item in assistantPresets"
            :key="item.id"
            :value="item.id"
          >
            {{ item.name }}{{ item.isBuiltIn ? ' · 内置' : '' }}
          </option>
        </select>
      </label>
      <div class="assistant-preset-toolstrip">
        <button
          type="button"
          class="assistant-preset-tool icon-button"
          title="改名"
          aria-label="改名"
          @click="renameCurrentPreset"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
        <TavernSaveStatusIconButton
          type="button"
          class="assistant-preset-tool icon-button"
          :status="assistantPresetSaveFeedback.status"
          :error="assistantPresetSaveFeedback.error"
          :disabled="assistantPresetSaveButtonDisabled"
          @click="saveCurrentAssistantPreset"
        />
        <button
          type="button"
          class="assistant-preset-tool icon-button"
          title="删除"
          aria-label="删除"
          :disabled="!currentAssistantPresetRecord || currentAssistantPresetRecord.id === DEFAULT_TAVERN_ASSISTANT_PRESET_ID"
          @click="deleteCurrentAssistantPreset"
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
        <button
          type="button"
          class="assistant-preset-tool icon-button"
          title="新增"
          aria-label="新增"
          @click="createAssistantPreset"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
        <button
          type="button"
          class="assistant-preset-tool icon-button"
          title="导入"
          aria-label="导入"
          @click="triggerImportPreset"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 4v11" />
            <path d="m7 11 5 5 5-5" />
            <path d="M4 20h16" />
          </svg>
        </button>
        <button
          type="button"
          class="assistant-preset-tool icon-button"
          title="导出"
          aria-label="导出"
          :disabled="!selectedAssistantPresetId"
          @click="exportCurrentPreset"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 20V9" />
            <path d="m17 13-5-5-5 5" />
            <path d="M4 20h16" />
          </svg>
        </button>
        <input
          ref="importInputRef"
          class="assistant-preset-import-input"
          type="file"
          accept="application/json,.json"
          @change="handleImportPreset"
        >
      </div>
    </div>
    <div
      v-if="assistantPresetStatus"
      class="preset-status-line"
    >
      <span>{{ assistantPresetStatus }}</span>
    </div>
    <div class="assistant-preset-studio">
      <aside class="assistant-preset-item-list archive-item-list">
        <div class="assistant-preset-nav-head">
          <strong>维护规则</strong>
        </div>
        <button
          v-for="item in assistantPresetItems"
          :key="item.id"
          type="button"
          class="assistant-preset-nav-row"
          :class="{ selected: selectedAssistantPresetItem?.id === item.id }"
          @click="selectAssistantPresetItem(item.id)"
        >
          <strong>{{ item.label }}</strong>
          <small>{{ shortText(item.content || '未填写职责。', 54) }}</small>
        </button>
      </aside>

      <section class="assistant-preset-detail-panel archive-editor-panel">
        <div class="assistant-preset-line-head">
          <div>
            <strong>{{ selectedAssistantPresetItem?.label || '维护规则' }}</strong>
          </div>
          <button
            v-if="showStatusPanelHelpButton"
            type="button"
            class="assistant-preset-help-button icon-button"
            title="状态栏写法说明"
            aria-label="状态栏写法说明"
            @click="openStatusPanelHelp"
          >
            ?
          </button>
        </div>
        <div
          v-if="selectedAssistantPresetItem"
          class="assistant-preset-detail-fields"
        >
          <label>
            <span>职责说明</span>
            <textarea
              :value="selectedAssistantPresetItem.content"
              rows="12"
              placeholder="写这条维护规则应该要求什么、保留什么、避免什么。"
              @input="updateSelectedAssistantPresetItem(($event.target as HTMLTextAreaElement).value)"
            />
          </label>
        </div>
        <button
          v-else
          type="button"
          class="assistant-preset-empty-add"
          disabled
        >
          没有可编辑规则
        </button>
      </section>
    </div>
    <div
      v-if="statusPanelHelpOpen"
      class="assistant-preset-help-backdrop"
      role="presentation"
      @click.self="closeStatusPanelHelp"
    >
      <section
        class="assistant-preset-help-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-preset-status-help-title"
        tabindex="-1"
        @keydown.esc="closeStatusPanelHelp"
      >
        <header class="assistant-preset-help-head">
          <h3 id="assistant-preset-status-help-title">
            状态栏写法说明
          </h3>
          <button
            type="button"
            class="assistant-preset-help-close icon-button"
            title="关闭"
            aria-label="关闭"
            @click="closeStatusPanelHelp"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6 6 18" />
            </svg>
          </button>
        </header>
        <div class="assistant-preset-help-body">
          <section>
            <h4>状态栏是什么</h4>
            <p>状态栏是小白自动维护的可变 UI 面板。生成后的状态栏会自动注入聊天上下文，类似酒馆变量一样给后续回复使用；但你不需要定义它每轮怎么更新，也不需要定义结构化模板，你需要在这里大白话提要求。</p>
          </section>
          <section>
            <h4>这里写什么</h4>
            <p>这里只写“你希望状态栏长什么样”：分几页、每页有哪些区块、每个区块用什么类型、哪些条目允许动态增加。</p>
          </section>
          <section>
            <h4>类型说明</h4>
            <p>文本：适合姓名、身份、当前地点、当前目标这类一句话信息。</p>
            <p>数值：适合力量、体质、好感度、理智、体力这类会变化的数。可以提出范围，也可以提出显示方式：</p>
            <ul>
              <li>进度条：适合体力、理智、好感度这类有上下限的数值。</li>
              <li>百分比：适合成功率、掌控度、污染度这类天然按百分比看的数值。</li>
              <li>点阵：适合少量格数资源，例如行动点、弹药、护盾层数。</li>
              <li>普通数字：适合金币、天数、次数这类不适合画条的数值。</li>
            </ul>
            <p>标签：适合动态增删的状态，例如受伤、疲惫、恐惧、中毒、隐匿、祝福。标签不需要固定数量。</p>
            <p>物品：适合装备、背包、线索、钥匙、消耗品。可以要求带数量、部位、用途、来历；也可以要求用列表或格子展示。</p>
          </section>
          <section>
            <h4>动态分页</h4>
            <p>如果你需要增加分页，例如每个 NPC 一页，就在这里提出：每个新 NPC 放单独的一页，每页的内容 xxx。</p>
          </section>
        </div>
      </section>
    </div>
  </div>
</template>
