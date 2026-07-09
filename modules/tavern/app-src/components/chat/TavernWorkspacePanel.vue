<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import TavernAtlasPanel from '../TavernAtlasPanel.vue';
import TavernEventPanel from '../TavernEventPanel.vue';
import TavernMapPanel from '../TavernMapPanel.vue';
import TavernMemoryEditor from '../TavernMemoryEditor.vue';
import TavernStatusPanel from '../TavernStatusPanel.vue';
import { useTavernMemoryContext, useTavernSessionContext, useTavernShellContext, useTavernWorkspaceContext } from '../tavern-app-context';
import { useMobileSheetDrag } from './useMobileSheetDrag';
import { buildSeedLabelId, createSeedMapDocument, isSeedLabelId } from '../../../shared/map-state-seed';
import { isMapExitSemantic } from '../../../shared/map-material-symbols';
import type { TavernAtlasDocument, TavernMapDocument, TavernMapElement, TavernMapElementCategory } from '../../../shared/structured-state';

defineProps<{
    memoryDirectoryOpen: boolean;
}>();
const emit = defineEmits<{
    (event: 'close'): void;
    (event: 'close-memory-directory'): void;
    (event: 'toggle-memory-directory'): void;
}>();

const memory = useTavernMemoryContext();
const session = useTavernSessionContext();
const shell = useTavernShellContext();
const workspace = useTavernWorkspaceContext();
const {
    chatWorkspacePanel,
    displayUserName,
    visibleUserAvatar,
} = workspace;
const {
    rememberBrokenAvatar,
} = shell;
const {
    activeMemoryFiles,
    discardMemoryDraft,
    enterMemoryEditMode,
    expandMemoryFileGroup,
    formatMemoryFileMeta,
    MEMORY_FILE_BATCH_SIZE,
    MEMORY_TURN_BATCH_SIZE,
    memoryDirectoryGroups,
    memoryEditorDirty,
    memoryEditorDocumentAvailable,
    memoryEditorDraft,
    memoryEditorLoadedPath,
    memoryEditorMode,
    memoryEditorReadOnly,
    memoryEditorStatus,
    memoryFileDisplayName,
    memoryFiles,
    memoryFileSearchText,
    markdownSignature,
    previewMemoryDraft,
    renderChatMarkdown,
    saveSelectedMemoryFile,
    selectedMemoryFileEntry,
    selectedMemoryFilePath,
    selectMemoryFile,
} = memory;
const {
    activeMapDocId,
    atlasActiveLocationKey,
    atlasStateDocument,
    atlasStatePatches,
    mapStateDocuments,
    mapStateDocument,
    mapStatePatches,
    materialSymbolFontReady,
    materialSymbolFontStatus,
    sessionContract,
    statusFieldDeltas,
    statusStateDocument,
    tavernTasks,
} = workspace;
const {
    currentAssistantFloor,
} = session;

const mapWorkspaceView = ref<'scene' | 'world'>('scene');
const mapPreviewDocId = ref('');
const mapPreviewPinned = ref(false);
const atlasDocument = computed<TavernAtlasDocument>(() => {
    const raw = atlasStateDocument.value?.data;
    const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Partial<TavernAtlasDocument> : {};
    return {
        version: 1,
        activeLocationKey: String(source.activeLocationKey || atlasActiveLocationKey.value || '').trim() || undefined,
        locations: Array.isArray(source.locations) ? source.locations as TavernAtlasDocument['locations'] : [],
        links: Array.isArray(source.links) ? source.links as TavernAtlasDocument['links'] : [],
        actors: Array.isArray(source.actors) ? source.actors as TavernAtlasDocument['actors'] : [],
    };
});
const atlasActiveLocation = computed(() => {
    const activeKey = atlasDocument.value.activeLocationKey || atlasActiveLocationKey.value || '';
    return atlasDocument.value.locations.find((location) => location.key === activeKey) || null;
});
const atlasActiveMapDocId = computed(() => String(atlasActiveLocation.value?.mapDocId || '').trim());
const selectedMapDocId = computed({
    get() {
        if (mapPreviewPinned.value) {return String(mapPreviewDocId.value || '').trim();}
        if (atlasDocument.value.activeLocationKey) {return atlasActiveMapDocId.value;}
        return String(activeMapDocId.value || 'main').trim();
    },
    set(value: string) {
        mapPreviewDocId.value = String(value || '').trim();
        mapPreviewPinned.value = !!mapPreviewDocId.value;
    },
});
const selectedMapRecord = computed(() => {
    const docs = Array.isArray(mapStateDocuments.value) ? mapStateDocuments.value : [];
    const selectedId = String(selectedMapDocId.value || '').trim();
    return selectedId ? docs.find((document) => document.docId === selectedId) || null : null;
});
const selectedMapDocument = computed<TavernMapDocument | null>(() => {
    const data = selectedMapRecord.value?.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {return null;}
    const source = data as Partial<TavernMapDocument>;
    const fallback = createSeedMapDocument();
    return {
        meta: source.meta && typeof source.meta === 'object' && !Array.isArray(source.meta) ? { ...fallback.meta, ...source.meta } : fallback.meta,
        elements: Array.isArray(source.elements)
            ? source.elements.filter((element): element is TavernMapElement => !!element && typeof element === 'object' && !Array.isArray(element) && typeof (element as TavernMapElement).id === 'string')
            : [],
    };
});
const selectedMapElements = computed(() => selectedMapDocument.value?.elements || []);
const selectedMapTitle = computed(() => String(
    selectedMapDocument.value?.meta?.name
    || selectedMapRecord.value?.title
    || selectedMapRecord.value?.docId
    || '地图',
));
const selectedMapIsActive = computed(() => String(selectedMapRecord.value?.docId || '') === String(activeMapDocId.value || 'main'));
const selectedMapPatches = computed(() => selectedMapIsActive.value ? mapStatePatches.value : []);
const currentLocationHasNoMap = computed(() => !mapPreviewPinned.value && !!atlasDocument.value.activeLocationKey && !atlasActiveMapDocId.value);
type MapInfoLine = {
    key: string;
    label: string;
    values: string[];
};
const MAP_LABEL_PREFIX_LENGTH = buildSeedLabelId('').length;

function normalizeMapInfoText(value: unknown, limit = 48): string {
    return String(value || '').normalize('NFKC').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function isGenericActorDisplayName(value: unknown): boolean {
    const text = normalizeMapInfoText(value, 48);
    const lower = text.toLowerCase();
    return lower === 'player'
        || lower === 'user'
        || lower.startsWith('player ')
        || lower.startsWith('user ')
        || lower === 'actor'
        || lower.startsWith('actor_')
        || lower.startsWith('actor-')
        || text === '玩家'
        || text.startsWith('玩家')
        || text === '用户'
        || text.startsWith('用户')
        || text === '你'
        || text === '您';
}

function uniqueMapInfoValues(values: string[], limit = 10): string[] {
    return [...new Set(values.map((value) => normalizeMapInfoText(value)).filter(Boolean))].slice(0, limit);
}

const mapLabelsByBaseId = computed(() => {
    const labels = new Map<string, string>();
    selectedMapElements.value.forEach((element) => {
        if (element.cat !== 'label' || !isSeedLabelId(element.id)) {return;}
        const baseId = element.id.slice(MAP_LABEL_PREFIX_LENGTH);
        const text = normalizeMapInfoText(element.text);
        if (baseId && text) {labels.set(baseId, text);}
    });
    return labels;
});

function mapElementDisplayName(element: TavernMapElement, labelsByBaseId: Map<string, string>): string {
    return normalizeMapInfoText(element.text)
        || normalizeMapInfoText(labelsByBaseId.get(element.id));
}

function mapActorDisplayName(element: TavernMapElement, labelsByBaseId: Map<string, string>): string {
    const actorKey = normalizeMapInfoText(element.actorKey || element.id).toLowerCase();
    if (actorKey === 'player') {
        return String(displayUserName.value || 'User').trim() || 'User';
    }
    const text = normalizeMapInfoText(element.text);
    if (text && !isGenericActorDisplayName(text)) {return text;}
    const label = normalizeMapInfoText(labelsByBaseId.get(element.id));
    if (label && !isGenericActorDisplayName(label)) {return label;}
    const rawActorKey = normalizeMapInfoText(element.actorKey);
    return rawActorKey && !isGenericActorDisplayName(rawActorKey) ? rawActorKey : '';
}

const mapActorNames = computed(() => uniqueMapInfoValues(selectedMapElements.value
    .filter((element) => element.cat === 'actor')
    .map((element) => mapActorDisplayName(element, mapLabelsByBaseId.value)), 8));

function mapNamesForCategories(categories: TavernMapElementCategory[], limit = 10): string[] {
    const labelsByBaseId = mapLabelsByBaseId.value;
    return uniqueMapInfoValues(selectedMapElements.value
        .filter((element) => categories.includes(element.cat))
        .map((element) => mapElementDisplayName(element, labelsByBaseId)), limit);
}

const mapExitNames = computed(() => {
    const labelsByBaseId = mapLabelsByBaseId.value;
    return uniqueMapInfoValues(selectedMapElements.value
        .filter((element) => isMapExitSemantic(element.cat, element.kind))
        .map((element) => mapElementDisplayName(element, labelsByBaseId)), 8);
});
const mapInteractiveNames = computed(() => mapNamesForCategories(['furniture', 'decoration', 'danger', 'secret', 'magic', 'marker'], 12));
const mapAreaNames = computed(() => mapNamesForCategories(['wall', 'terrain', 'road', 'water'], 8));
const mapStandaloneLabelNames = computed(() => uniqueMapInfoValues(selectedMapElements.value
    .filter((element) => element.cat === 'label' && !isSeedLabelId(element.id))
    .map((element) => normalizeMapInfoText(element.text)), 8));
const mapInfoLines = computed<MapInfoLine[]>(() => [
    { key: 'actors', label: '出场人物', values: mapActorNames.value },
    { key: 'exits', label: '出入口', values: mapExitNames.value },
    { key: 'interactives', label: '设施物件', values: mapInteractiveNames.value },
    { key: 'areas', label: '空间区域', values: mapAreaNames.value },
    { key: 'notes', label: '其他标注', values: mapStandaloneLabelNames.value },
].filter((line) => line.values.length));
const mapInfoStats = computed(() => {
    const elements = selectedMapElements.value;
    const countByCat = (cat: string) => elements.filter((element) => element.cat === cat).length;
    return [
        { label: '元素', value: String(elements.length) },
        { label: '出场', value: String(countByCat('actor')) },
        { label: '出入口', value: String(elements.filter((element) => isMapExitSemantic(element.cat, element.kind)).length) },
        { label: '标注', value: String(countByCat('label') + countByCat('marker')) },
    ];
});
const memoryDirectoryButtonLabel = computed(() => (
    selectedMemoryFileEntry.value ? memoryFileDisplayName(selectedMemoryFileEntry.value) : ''
));

watch([atlasActiveMapDocId, mapStateDocuments], () => {
    const docs = Array.isArray(mapStateDocuments.value) ? mapStateDocuments.value : [];
    const selectedId = String(mapPreviewDocId.value || '').trim();
    const selectedExists = selectedId && docs.some((document) => document.docId === selectedId);
    if (selectedExists) {return;}
    if (mapPreviewPinned.value) {
        mapPreviewPinned.value = false;
        mapPreviewDocId.value = '';
    }
}, { immediate: true });

function closeMobileChatPanel() {
    emit('close');
}

const {
    dragging: sheetHandleDragging,
    handleSheetHandlePointerCancel,
    handleSheetHandlePointerDown,
    handleSheetHandlePointerMove,
    handleSheetHandlePointerUp,
} = useMobileSheetDrag(closeMobileChatPanel);

function toggleMemoryDirectory() {
    emit('toggle-memory-directory');
}

function selectDirectoryMemoryFile(path: string) {
    void selectMemoryFile(path).then((selected) => {
        if (selected) {
            emit('close-memory-directory');
        }
    });
}

</script>

<template>
  <aside class="tavern-workspace-panel">
    <button
      type="button"
      class="chat-mobile-sheet-handle"
      :class="{ 'is-dragging': sheetHandleDragging }"
      title="收起面板"
      aria-label="收起面板"
      @click="closeMobileChatPanel"
      @pointercancel="handleSheetHandlePointerCancel"
      @pointerdown="handleSheetHandlePointerDown"
      @pointermove="handleSheetHandlePointerMove"
      @pointerup="handleSheetHandlePointerUp"
    />
    <div class="tavern-workspace-tabs">
      <button
        type="button"
        :class="{ active: chatWorkspacePanel === 'map' }"
        @click="chatWorkspacePanel = 'map'"
      >
        地图
      </button>
      <button
        type="button"
        :class="{ active: chatWorkspacePanel === 'status' }"
        @click="chatWorkspacePanel = 'status'"
      >
        状态
      </button>
      <button
        type="button"
        :class="{ active: chatWorkspacePanel === 'memory' }"
        @click="chatWorkspacePanel = 'memory'"
      >
        记忆
      </button>
      <button
        type="button"
        :class="{ active: chatWorkspacePanel === 'event' }"
        @click="chatWorkspacePanel = 'event'"
      >
        事件
      </button>
    </div>
    <section
      v-if="chatWorkspacePanel === 'map'"
      class="tavern-map-workspace"
    >
      <div
        class="tavern-map-viewport"
        :class="`is-${mapWorkspaceView}`"
      >
        <div
          class="tavern-map-inline-switcher"
          role="tablist"
          aria-label="地图视图"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="mapWorkspaceView === 'scene'"
            :class="{ active: mapWorkspaceView === 'scene' }"
            @click="mapWorkspaceView = 'scene'"
          >
            场景图
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="mapWorkspaceView === 'world'"
            :class="{ active: mapWorkspaceView === 'world' }"
            @click="mapWorkspaceView = 'world'"
          >
            世界图
          </button>
        </div>
        <TavernMapPanel
          v-if="mapWorkspaceView === 'scene' && selectedMapRecord"
          v-model:selected-doc-id="selectedMapDocId"
          compact
          :documents="mapStateDocuments"
          :active-doc-id="activeMapDocId"
          :document="selectedMapRecord"
          :patches="selectedMapPatches"
          :player-display-name="displayUserName"
          :player-avatar-url="visibleUserAvatar"
          :material-symbols-ready="materialSymbolFontReady"
          :material-symbols-status="materialSymbolFontStatus"
        />
        <TavernAtlasPanel
          v-else-if="mapWorkspaceView === 'world'"
          display-mode="graph"
          :document="atlasStateDocument"
          :patches="atlasStatePatches"
          :active-location-key="atlasActiveLocationKey"
          :active-map-doc-id="activeMapDocId"
          :preview-map-doc-id="selectedMapDocId"
          :map-documents="mapStateDocuments"
          :material-symbols-ready="materialSymbolFontReady"
          :material-symbols-status="materialSymbolFontStatus"
        />
        <div
          v-else
          class="tavern-map-current-empty"
        >
          <strong>{{ atlasActiveLocation?.name || '当前地点' }}</strong>
          <p>{{ currentLocationHasNoMap ? '当前地点暂无详细地图。' : '暂无地图信息。' }}</p>
        </div>
      </div>
      <article
        class="tavern-map-info"
        :class="{ 'is-world': mapWorkspaceView === 'world' }"
      >
        <TavernAtlasPanel
          v-if="mapWorkspaceView === 'world'"
          display-mode="detail"
          :document="atlasStateDocument"
          :patches="atlasStatePatches"
          :active-location-key="atlasActiveLocationKey"
          :active-map-doc-id="activeMapDocId"
          :preview-map-doc-id="selectedMapDocId"
          :map-documents="mapStateDocuments"
          :material-symbols-ready="materialSymbolFontReady"
          :material-symbols-status="materialSymbolFontStatus"
        />
        <div
          v-else-if="selectedMapRecord"
          class="tavern-map-info-body"
        >
          <header class="tavern-map-info-head">
            <strong>{{ selectedMapTitle }}</strong>
            <em>{{ selectedMapIsActive ? '当前场景' : '地图档案' }}</em>
          </header>
          <dl class="tavern-map-info-grid">
            <div
              v-for="item in mapInfoStats"
              :key="item.label"
            >
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
          <div
            v-if="mapInfoLines.length"
            class="tavern-map-info-digest"
          >
            <div
              v-for="line in mapInfoLines"
              :key="line.key"
              class="tavern-map-info-line"
            >
              <span>{{ line.label }}</span>
              <strong>{{ line.values.join('、') }}</strong>
            </div>
          </div>
        </div>
        <div
          v-else
          class="tavern-map-info-empty"
        >
          暂无地图信息。
        </div>
      </article>
    </section>
    <section
      v-else-if="chatWorkspacePanel === 'status'"
      class="tavern-status-workspace"
    >
      <TavernStatusPanel
        :document="statusStateDocument"
        :field-deltas="statusFieldDeltas"
        :enabled="sessionContract.statusPanel"
        :material-symbols-ready="materialSymbolFontReady"
        :material-symbols-status="materialSymbolFontStatus"
        :user-avatar-url="visibleUserAvatar"
        @user-avatar-error="rememberBrokenAvatar"
      />
    </section>
    <section
      v-else-if="chatWorkspacePanel === 'memory'"
      class="tavern-memory-workspace"
      :class="{ 'is-memory-directory-open': memoryDirectoryOpen }"
    >
      <button
        type="button"
        class="tavern-memory-selector"
        :class="{ 'is-open': memoryDirectoryOpen }"
        :disabled="!memoryFiles.length"
        :aria-expanded="memoryDirectoryOpen ? 'true' : 'false'"
        aria-controls="xb-tavern-memory-directory"
        title="选择记忆文档"
        aria-label="选择记忆文档"
        @click="toggleMemoryDirectory"
      >
        <span>记忆文档</span>
        <strong>{{ memoryDirectoryButtonLabel || '选择记忆档案' }}</strong>
        <em>{{ activeMemoryFiles.length }} 个</em>
        <i aria-hidden="true" />
      </button>
      <aside
        id="xb-tavern-memory-directory"
        class="tavern-memory-directory"
      >
        <label
          v-if="memoryFiles.length"
          class="memory-search tavern-memory-search"
        >
          <input
            v-model="memoryFileSearchText"
            type="search"
            placeholder="检索档案"
          >
        </label>
        <div
          v-if="memoryFiles.length"
          class="memory-directory-list xb-files"
        >
          <div
            v-for="group in memoryDirectoryGroups"
            :key="group.key"
            class="memory-file-group"
          >
            <div class="memory-file-tree">
              <button
                v-for="file in group.files"
                :key="file.path"
                type="button"
                class="memory-file"
                :class="{ active: selectedMemoryFilePath === file.path, stale: file.status === 'stale' }"
                @click="selectDirectoryMemoryFile(file.path)"
              >
                <span class="memory-file-main">{{ memoryFileDisplayName(file) }}</span>
              </button>
              <button
                v-if="group.hiddenCount"
                type="button"
                class="memory-file memory-file-more"
                @click="expandMemoryFileGroup(group.key)"
              >
                <span class="memory-file-main">再显示 {{ Math.min(group.hiddenCount, group.key === 'turns' ? MEMORY_TURN_BATCH_SIZE : MEMORY_FILE_BATCH_SIZE) }} 个</span>
              </button>
            </div>
          </div>
          <p
            v-if="memoryFileSearchText && !memoryDirectoryGroups.length"
            class="muted compact"
          >
            没有匹配的记忆档案。
          </p>
        </div>
        <p
          v-else
          class="muted compact"
        >
          还没有记忆档案。
        </p>
      </aside>
      <TavernMemoryEditor
        v-model:draft="memoryEditorDraft"
        :document-available="memoryEditorDocumentAvailable"
        :read-only="memoryEditorReadOnly"
        :dirty="memoryEditorDirty"
        :mode="memoryEditorMode"
        :preview-html="renderChatMarkdown(memoryEditorDraft)"
        :preview-signature="markdownSignature(memoryEditorDraft)"
        :status="memoryEditorStatus"
        :has-selected-file="!!selectedMemoryFileEntry"
        :loaded-path="memoryEditorLoadedPath"
        :file-meta="selectedMemoryFileEntry ? formatMemoryFileMeta(selectedMemoryFileEntry) : ''"
        @enter-edit="enterMemoryEditMode"
        @preview="previewMemoryDraft"
        @discard="discardMemoryDraft"
        @save="saveSelectedMemoryFile"
      />
    </section>
    <TavernEventPanel
      v-else-if="chatWorkspacePanel === 'event'"
      :tasks="tavernTasks"
      :enabled="sessionContract.questOrchestration"
      :assistant-floor="currentAssistantFloor"
    />
  </aside>
</template>
