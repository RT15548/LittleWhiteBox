<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
    createStatusFieldKey,
    normalizeStatusDocument,
    type TavernStatusBlock,
    type TavernStatusDocument,
    type TavernStatusField,
    type TavernStatusFieldDeltaMap,
    type TavernStatusGaugeField,
    type TavernStatusItemField,
    type TavernStatusSubject,
    type TavernStatusTab,
    type TavernStatusTagField,
    type TavernStatusTextField,
} from '../../shared/status-state';
import { resolveStatusIconName, type StatusMaterialSymbolFallbackKind } from '../../shared/status-material-symbols';
import type { TavernStructuredStateDocumentRecord } from '../../shared/session-db';

const props = withDefaults(defineProps<{
    document: TavernStructuredStateDocumentRecord | null;
    fieldDeltas?: TavernStatusFieldDeltaMap;
    enabled?: boolean;
    materialSymbolsReady?: boolean;
    materialSymbolsStatus?: 'idle' | 'loading' | 'ready' | 'failed';
    userAvatarUrl?: string;
}>(), {
    fieldDeltas: () => ({}),
    enabled: true,
    materialSymbolsReady: false,
    materialSymbolsStatus: 'idle',
    userAvatarUrl: '',
});
const emit = defineEmits<{
    (event: 'user-avatar-error', url: string): void;
}>();

const selectedSubjectId = ref('');
const selectedTabBySubject = ref<Record<string, string>>({});
const selectedItem = ref<{
    subjectId: string;
    tabId: string;
    blockId: string;
    blockTitle: string;
    field: TavernStatusItemField;
} | null>(null);

const statusDocument = computed<TavernStatusDocument>(() => normalizeStatusDocument(props.document?.data).document);
const activeSubject = computed<TavernStatusSubject | null>(() => (
    statusDocument.value.subjects.find((subject) => subject.id === selectedSubjectId.value)
    || statusDocument.value.subjects[0]
    || null
));
const activeTabId = computed({
    get() {
        const subject = activeSubject.value;
        if (!subject) {return '';}
        const cached = selectedTabBySubject.value[subject.id];
        if (cached && subject.tabs.some((tab) => tab.id === cached)) {return cached;}
        return subject.tabs[0]?.id || '';
    },
    set(value: string) {
        const subject = activeSubject.value;
        if (!subject) {return;}
        selectedTabBySubject.value = {
            ...selectedTabBySubject.value,
            [subject.id]: value,
        };
    },
});
const activeTab = computed<TavernStatusTab | null>(() => (
    activeSubject.value?.tabs.find((tab) => tab.id === activeTabId.value)
    || activeSubject.value?.tabs[0]
    || null
));
const revisionLabel = computed(() => {
    const revision = Number(props.document?.revision || statusDocument.value.meta.revision || 0);
    return `REV ${Math.max(0, Math.floor(revision))}`;
});
const normalizedUserAvatarUrl = computed(() => String(props.userAvatarUrl || '').trim());

watch(statusDocument, (document) => {
    const preferredSubject = document.meta.activeSubject || document.subjects[0]?.id || '';
    if (!document.subjects.some((subject) => subject.id === selectedSubjectId.value)) {
        selectedSubjectId.value = preferredSubject;
    }
    const subject = document.subjects.find((item) => item.id === selectedSubjectId.value) || document.subjects[0];
    if (subject && !subject.tabs.some((tab) => tab.id === selectedTabBySubject.value[subject.id])) {
        selectedTabBySubject.value = {
            ...selectedTabBySubject.value,
            [subject.id]: subject.tabs[0]?.id || '',
        };
    }
    selectedItem.value = null;
}, { immediate: true });

function iconText(value: unknown, fallbackKind: StatusMaterialSymbolFallbackKind = 'item'): string {
    if (!props.materialSymbolsReady) {return props.materialSymbolsStatus === 'failed' ? '!' : '';}
    return resolveStatusIconName(value, fallbackKind);
}

function handleUserAvatarError() {
    if (!normalizedUserAvatarUrl.value) {return;}
    emit('user-avatar-error', normalizedUserAvatarUrl.value);
}

function selectSubject(subject: TavernStatusSubject) {
    selectedSubjectId.value = subject.id;
    selectedItem.value = null;
}

function selectTab(tab: TavernStatusTab) {
    activeTabId.value = tab.id;
    selectedItem.value = null;
}

function fieldDelta(subject: TavernStatusSubject, tab: TavernStatusTab, block: TavernStatusBlock, field: TavernStatusField): number {
    return Number(props.fieldDeltas[createStatusFieldKey(subject.id, tab.id, block.id, field.id)] || 0);
}

function isGaugeField(field: TavernStatusField): field is TavernStatusGaugeField {
    return 'value' in field && 'name' in field;
}

function isTagField(field: TavernStatusField): field is TavernStatusTagField {
    return 'label' in field;
}

function isItemField(field: TavernStatusField): field is TavernStatusItemField {
    return 'name' in field && !('value' in field);
}

function isTextField(field: TavernStatusField): field is TavernStatusTextField {
    return 'value' in field && !('max' in field) && !('label' in field);
}

function numericLabel(value: unknown): string {
    const number = Number(value);
    if (!Number.isFinite(number)) {return '0';}
    return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, '');
}

function gaugeMax(field: TavernStatusGaugeField): number | null {
    const max = Number(field.max);
    return Number.isFinite(max) && max > 0 ? max : null;
}

function gaugePercent(field: TavernStatusGaugeField): number {
    const max = gaugeMax(field);
    if (!max) {return 0;}
    const min = Number.isFinite(Number(field.min)) ? Number(field.min) : 0;
    const span = Math.max(1, max - min);
    return Math.max(0, Math.min(100, ((Number(field.value) - min) / span) * 100));
}

function dotCount(field: TavernStatusGaugeField): number {
    return Math.max(1, Math.min(10, Math.floor(gaugeMax(field) || 5)));
}

function filledDots(field: TavernStatusGaugeField): number {
    return Math.max(0, Math.min(dotCount(field), Math.round(Number(field.value) || 0)));
}

function gaugeMode(field: TavernStatusGaugeField): 'bar' | 'percent' | 'dots' | 'num' {
    if (field.display === 'percent') {return 'percent';}
    if (field.display === 'dots') {return 'dots';}
    if (field.display === 'num' || !gaugeMax(field)) {return 'num';}
    return 'bar';
}

function openItem(subject: TavernStatusSubject, tab: TavernStatusTab, block: TavernStatusBlock, field: TavernStatusItemField) {
    if (field.empty) {return;}
    selectedItem.value = {
        subjectId: subject.id,
        tabId: tab.id,
        blockId: block.id,
        blockTitle: block.title,
        field,
    };
}

function closeItem() {
    selectedItem.value = null;
}
</script>

<template>
  <section
    class="tavern-status-panel"
    :class="{ 'is-disabled': !enabled, 'is-empty': !statusDocument.subjects.length, 'is-symbol-font-ready': materialSymbolsReady, 'is-symbol-font-failed': materialSymbolsStatus === 'failed' }"
  >
    <div
      v-if="activeSubject"
      class="tavern-status-shell"
    >
      <header class="tavern-status-head">
        <div class="tavern-status-avatar">
          <img
            v-if="normalizedUserAvatarUrl"
            :src="normalizedUserAvatarUrl"
            alt=""
            @error="handleUserAvatarError"
          >
          <span
            v-else
            class="material-symbols-rounded"
          >{{ iconText(activeSubject.icon || 'person', 'subject') }}</span>
        </div>
        <div class="tavern-status-identity">
          <strong>{{ activeSubject.name }}</strong>
          <span>{{ activeSubject.subtitle || '状态档案' }}</span>
        </div>
      </header>

      <nav
        v-if="statusDocument.subjects.length > 1"
        class="tavern-status-subjects"
        aria-label="状态档案"
      >
        <button
          v-for="subject in statusDocument.subjects"
          :key="subject.id"
          type="button"
          :class="{ active: subject.id === activeSubject.id }"
          @click="selectSubject(subject)"
        >
          {{ subject.name }}
        </button>
      </nav>

      <nav
        v-if="activeSubject.tabs.length"
        class="tavern-status-segments"
        aria-label="状态分页"
      >
        <button
          v-for="tab in activeSubject.tabs"
          :key="tab.id"
          type="button"
          :class="{ active: tab.id === activeTab?.id }"
          @click="selectTab(tab)"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="tavern-status-content">
        <template v-if="activeSubject && activeTab">
          <article
            v-for="block in activeTab.blocks"
            :key="block.id"
            class="tavern-status-block"
            :class="`is-${block.form}`"
          >
            <header class="tavern-status-block-title">
              <span>{{ block.title }}</span>
              <em v-if="block.form === 'item' || block.form === 'tag'">{{ block.fields.length }}</em>
            </header>

            <div
              v-if="block.form === 'gauge'"
              class="tavern-status-gauges"
            >
              <template v-if="block.fields.length">
                <template
                  v-for="field in block.fields"
                  :key="field.id"
                >
                  <div
                    v-if="isGaugeField(field) && gaugeMode(field) === 'bar'"
                    class="tavern-status-gauge tavern-status-gauge-bar"
                  >
                    <div class="tavern-status-gauge-head">
                      <span>
                        {{ field.name }}
                        <span
                          v-if="fieldDelta(activeSubject, activeTab, block, field)"
                          class="tavern-status-delta"
                          :class="fieldDelta(activeSubject, activeTab, block, field) > 0 ? 'up' : 'down'"
                        >
                          <span class="material-symbols-rounded">{{ iconText(fieldDelta(activeSubject, activeTab, block, field) > 0 ? 'arrow_drop_up' : 'arrow_drop_down', 'ui') }}</span>
                          {{ fieldDelta(activeSubject, activeTab, block, field) > 0 ? '+' : '' }}{{ numericLabel(fieldDelta(activeSubject, activeTab, block, field)) }}
                        </span>
                      </span>
                      <strong>{{ numericLabel(field.value) }}<em>/{{ numericLabel(field.max) }}</em></strong>
                    </div>
                    <div class="tavern-status-bar">
                      <i
                        :class="{ accent: field.accent }"
                        :style="{ width: `${gaugePercent(field)}%` }"
                      />
                    </div>
                  </div>
                  <div
                    v-else-if="isGaugeField(field) && gaugeMode(field) === 'percent'"
                    class="tavern-status-gauge tavern-status-gauge-line"
                  >
                    <span>
                      {{ field.name }}
                      <span
                        v-if="fieldDelta(activeSubject, activeTab, block, field)"
                        class="tavern-status-delta"
                        :class="fieldDelta(activeSubject, activeTab, block, field) > 0 ? 'up' : 'down'"
                      >
                        <span class="material-symbols-rounded">{{ iconText(fieldDelta(activeSubject, activeTab, block, field) > 0 ? 'arrow_drop_up' : 'arrow_drop_down', 'ui') }}</span>
                        {{ fieldDelta(activeSubject, activeTab, block, field) > 0 ? '+' : '' }}{{ numericLabel(fieldDelta(activeSubject, activeTab, block, field)) }}
                      </span>
                    </span>
                    <strong>{{ numericLabel(field.value) }}%</strong>
                  </div>
                  <div
                    v-else-if="isGaugeField(field) && gaugeMode(field) === 'dots'"
                    class="tavern-status-gauge tavern-status-gauge-line"
                  >
                    <span>{{ field.name }}</span>
                    <div
                      class="tavern-status-dots"
                      aria-hidden="true"
                    >
                      <i
                        v-for="dot in dotCount(field)"
                        :key="dot"
                        :class="{ filled: dot <= filledDots(field) }"
                      />
                    </div>
                  </div>
                  <div
                    v-else-if="isGaugeField(field)"
                    class="tavern-status-gauge tavern-status-gauge-line"
                  >
                    <span>
                      {{ field.name }}
                      <span
                        v-if="fieldDelta(activeSubject, activeTab, block, field)"
                        class="tavern-status-delta"
                        :class="fieldDelta(activeSubject, activeTab, block, field) > 0 ? 'up' : 'down'"
                      >
                        <span class="material-symbols-rounded">{{ iconText(fieldDelta(activeSubject, activeTab, block, field) > 0 ? 'arrow_drop_up' : 'arrow_drop_down', 'ui') }}</span>
                        {{ fieldDelta(activeSubject, activeTab, block, field) > 0 ? '+' : '' }}{{ numericLabel(fieldDelta(activeSubject, activeTab, block, field)) }}
                      </span>
                    </span>
                    <strong>{{ numericLabel(field.value) }}</strong>
                  </div>
                </template>
              </template>
              <p
                v-else
                class="tavern-status-empty-hint"
              >
                暂无数值
              </p>
            </div>

            <div
              v-else-if="block.form === 'tag'"
              class="tavern-status-tags"
            >
              <template v-if="block.fields.length">
                <span
                  v-for="field in block.fields"
                  :key="field.id"
                  class="tavern-status-tag"
                  :class="isTagField(field) ? field.kind : ''"
                >
                  {{ isTagField(field) ? field.label : '' }}
                </span>
              </template>
              <p
                v-else
                class="tavern-status-empty-hint"
              >
                暂无状态
              </p>
            </div>

            <div
              v-else-if="block.form === 'item' && block.layout === 'grid'"
              class="tavern-status-item-grid"
            >
              <template v-if="block.fields.length">
                <button
                  v-for="field in block.fields"
                  :key="field.id"
                  type="button"
                  class="tavern-status-item-cell"
                  :class="{ key: isItemField(field) && field.key, empty: isItemField(field) && field.empty }"
                  :disabled="!isItemField(field) || field.empty"
                  @click="isItemField(field) && openItem(activeSubject, activeTab, block, field)"
                >
                  <span
                    v-if="isItemField(field) && field.qty && field.qty > 1"
                    class="tavern-status-item-qty"
                  >{{ field.qty }}</span>
                  <span class="material-symbols-rounded">{{ iconText(isItemField(field) ? field.icon : '', 'item') }}</span>
                  <strong>{{ isItemField(field) ? field.name : '' }}</strong>
                </button>
              </template>
              <p
                v-else
                class="tavern-status-empty-hint"
              >
                背包是空的
              </p>
            </div>

            <div
              v-else-if="block.form === 'item'"
              class="tavern-status-item-list"
            >
              <template v-if="block.fields.length">
                <button
                  v-for="field in block.fields"
                  :key="field.id"
                  type="button"
                  class="tavern-status-item-row"
                  :class="{ empty: isItemField(field) && field.empty }"
                  :disabled="!isItemField(field) || field.empty"
                  @click="isItemField(field) && openItem(activeSubject, activeTab, block, field)"
                >
                  <span class="tavern-status-item-icon">
                    <span class="material-symbols-rounded">{{ iconText(isItemField(field) ? field.icon : '', 'item') }}</span>
                  </span>
                  <span class="tavern-status-item-name">
                    <strong>{{ isItemField(field) ? field.name : '' }}</strong>
                    <em>{{ isItemField(field) ? field.slot : '' }}</em>
                  </span>
                  <small v-if="isItemField(field) && field.qty && field.qty > 1">x{{ field.qty }}</small>
                </button>
              </template>
              <p
                v-else
                class="tavern-status-empty-hint"
              >
                未装备
              </p>
            </div>

            <div
              v-else
              class="tavern-status-texts"
            >
              <template v-if="block.fields.length">
                <div
                  v-for="field in block.fields"
                  :key="field.id"
                  class="tavern-status-text"
                >
                  <strong v-if="isTextField(field) && field.name">{{ field.name }}</strong>
                  <p>{{ isTextField(field) && field.value ? field.value : '——' }}</p>
                </div>
              </template>
              <p
                v-else
                class="tavern-status-empty-hint"
              >
                ——
              </p>
            </div>
          </article>
        </template>
      </div>

      <footer class="tavern-status-foot">
        <span>{{ enabled ? '状态已同步' : '角色档案未授权' }}</span>
        <strong>{{ revisionLabel }}</strong>
      </footer>

      <aside
        v-if="selectedItem"
        class="tavern-status-drawer"
        role="dialog"
        aria-modal="false"
      >
        <button
          type="button"
          class="tavern-status-drawer-close"
          title="关闭"
          aria-label="关闭"
          @click="closeItem"
        >
          <span class="material-symbols-rounded">{{ iconText('close', 'ui') }}</span>
        </button>
        <span class="tavern-status-drawer-kicker">{{ selectedItem.blockTitle }}</span>
        <div class="tavern-status-drawer-title">
          <span class="material-symbols-rounded">{{ iconText(selectedItem.field.icon, 'item') }}</span>
          <strong>{{ selectedItem.field.name }}</strong>
          <em v-if="selectedItem.field.qty && selectedItem.field.qty > 1">x{{ selectedItem.field.qty }}</em>
        </div>
        <p>{{ selectedItem.field.lore || '——' }}</p>
      </aside>
    </div>

    <div
      v-else
      class="tavern-status-empty"
    >
      <span class="material-symbols-rounded">{{ iconText('badge', 'ui') }}</span>
      <strong>状态尚未同步</strong>
      <p>等待后台助手建立角色档案。</p>
    </div>
  </section>
</template>
