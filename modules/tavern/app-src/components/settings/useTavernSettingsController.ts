import { computed, nextTick, ref, watch, type ComputedRef, type Ref } from 'vue';
import { createAgentSettingsPanel } from '../../../../agent-core/ui/settings-panel.js';
import { buildAgentSettingsPanelMarkup } from '../../../../agent-core/ui/settings-markup.js';
import { normalizeAgentConfig } from '../../../../agent-core/config.js';
import {
    createDefaultTavernAssistantPreset,
    DEFAULT_TAVERN_ASSISTANT_PRESET_ID,
    normalizeTavernAssistantPreset,
    type TavernAssistantPreset,
} from '../../../shared/assistant-presets';
import {
    createFallbackTavernChatPromptPresetBundle,
    normalizeTavernChatPromptPresetBundle,
} from '../../../shared/chat-presets';
import type { TavernChatPromptPresetBundle, XbTavernContext } from '../../../shared/message-assembler';
import {
    deleteTavernAssistantPreset,
    getActiveTavernAssistantPresetId,
    listTavernAssistantPresets,
    loadActiveTavernAssistantPreset,
    saveTavernAssistantPreset,
    setActiveTavernAssistantPresetId,
    type TavernAssistantPresetRecord,
} from '../../../shared/session-db';
import { resolveXbTavernProviderConfig } from '../../runtime/provider';
import {
    normalizeTavernDisplaySettings,
    type TavernDisplaySettings,
    type TavernUserOption,
} from '../../../shared/settings';
import type { TavernSettingsNavItem } from '../TavernSettingsSidebar.vue';
import type {
    TavernAssistantPresetItemRow,
    TavernChatPresetOptionRow,
    TavernRegexGroupDisplayRow,
    TavernRegexGroupRow,
    TavernRegexScriptDraft,
    TavernRegexScriptRow,
    TavernWorldbookEntryDraft,
    TavernWorldbookOptionRow,
    TavernWorldbookPreviewEntryRow,
    TavernWorldbookPreviewRow,
} from '../tavern-app-context';
import { useTavernSaveFeedback } from './useTavernSaveFeedback';

export type TavernSettingsWorkspaceKey = 'characters' | 'api' | 'chatPreset' | 'worldbooks' | 'regex' | 'assistantPreset' | 'base';

interface TavernWorldbookSyncOptions {
    keepSelection?: boolean;
    preferredName?: string;
    requestSerial?: number;
    selectFirst?: boolean;
}

interface TavernSettingsControllerOptions {
    activeView: Ref<string>;
    activeSettingsWorkspace: Ref<TavernSettingsWorkspaceKey>;
    agentConfig: Ref<Record<string, unknown>>;
    tavernDisplaySettings: Ref<TavernDisplaySettings>;
    effectiveContext: ComputedRef<XbTavernContext>;
    currentNativeCharacterId: ComputedRef<string>;
    regexNativeCharacterId: ComputedRef<string>;
    homeThemeDark: Ref<boolean>;
    isRunning: Ref<boolean>;
    confirmDialog: (options: { title?: string; message?: string; confirmText?: string; cancelText?: string; tone?: 'default' | 'danger' | 'warning' } | string) => Promise<boolean>;
    describeError: (error: unknown) => string;
    postToHost: (type: string, payload?: Record<string, unknown>) => void;
    requestHost: (type: string, payload?: Record<string, unknown>, options?: { signal?: AbortSignal }) => Promise<Record<string, unknown>>;
    shortText: (value?: string, limit?: number) => string;
}

interface PromptEditorRow {
    identifier: string;
    name: string;
    role: string;
    content: string;
    enabled: boolean;
    marker: boolean;
    systemPrompt: boolean;
    injectionPosition: number;
    injectionDepth: number | string;
    source: string;
    orderEntry: Record<string, unknown>;
    prompt: Record<string, unknown>;
    listed: boolean;
    searchCorpus?: string;
}

interface AssistantPresetSectionRow {
    key: 'statePrompt' | 'characterPrompt' | 'statusPrompt';
    label: string;
    summary: string;
}

interface WorldbookPreviewEntryRow {
    uid: string;
    name: string;
    keys: string[];
    secondaryKeys: string[];
    contentPreview: string;
    enabled: boolean;
    constant: boolean;
    vectorized: boolean;
    order: number;
    position: number;
    role: number;
    depth: number | null;
    probability: number | null;
}

interface WorldbookEntryDraftRow {
    worldbookName: string;
    uid: string;
    comment: string;
    key: string[];
    keysecondary: string[];
    secondary_keys: string[];
    content: string;
    disable: boolean;
    enabled: boolean;
    constant: boolean;
    vectorized: boolean;
    order: number;
    position: number;
    role: number;
    depth: number | null;
    probability: number | null;
    useProbability: boolean;
    selective: boolean;
    selectiveLogic: number;
    scanDepth: number | null;
    caseSensitive: boolean | null;
    matchWholeWords: boolean | null;
    useGroupScoring: boolean | null;
    outletName: string;
    automationId: string;
    ignoreBudget: boolean;
    excludeRecursion: boolean;
    preventRecursion: boolean;
    delayUntilRecursion: boolean | number;
    group: string;
    groupOverride: boolean;
    groupWeight: number | null;
    sticky: number | null;
    cooldown: number | null;
    delay: number | null;
    triggers: string[];
    matchPersonaDescription: boolean;
    matchCharacterDescription: boolean;
    matchCharacterPersonality: boolean;
    matchCharacterDepthPrompt: boolean;
    matchScenario: boolean;
    matchCreatorNotes: boolean;
    entryHash: string;
    revision: string;
}

const CHAT_PRESET_SOURCE_BATCH_SIZE = 48;
const ASSISTANT_PRESET_BATCH_SIZE = 48;
const PROMPT_EDITOR_BATCH_SIZE = 80;
const WORLDBOOK_PREVIEW_BATCH_SIZE = 24;
const REGEX_GROUP_BATCH_SIZE = 60;

const assistantPresetSections: AssistantPresetSectionRow[] = [
    { key: 'statePrompt', label: '全局记忆', summary: '全局状态输出规则' },
    { key: 'characterPrompt', label: '人物记忆', summary: '人物长期状态输出规则' },
    { key: 'statusPrompt', label: '状态栏', summary: '状态面板骨架与更新规则' },
];

const placementLabels: Record<string, string> = {
    top: '最前面',
    beforeCharacter: '角色卡前',
    afterCharacter: '角色卡后',
    beforeHistory: '历史前',
    afterHistory: '历史后',
    assistantPrefill: '回复开头',
};

function promptRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function clonePromptJson<T>(value: T): T {
    try {
        return JSON.parse(JSON.stringify(value)) as T;
    } catch {
        return value;
    }
}

function normalizedSearchText(value = '') {
    return String(value || '').trim().toLocaleLowerCase();
}

function includesSearch(text: string, query: string) {
    if (!query) {return true;}
    return normalizedSearchText(text).includes(query);
}

function buildSearchCorpus(parts: unknown[], perPartLimit = 1600) {
    return parts
        .map((part) => String(part ?? '').slice(0, perPartLimit))
        .filter(Boolean)
        .join('\n');
}

function snapshotNativeDraft(value: unknown) {
    return JSON.stringify(value || {});
}

function normalizeStringList(value: unknown): string[] {
    return Array.isArray(value) ? value.map((item) => String(item || '').trim()).filter(Boolean) : [];
}

function normalizeNullableNumber(value: unknown): number | null {
    if (value === '' || value === null || value === undefined) {return null;}
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeTriStateBoolean(value: unknown): boolean | null {
    if (value === true || value === 'true') {return true;}
    if (value === false || value === 'false') {return false;}
    return null;
}

function normalizeDelayUntilRecursion(value: unknown): boolean | number {
    if (value === true || value === 'true') {return true;}
    if (value === false || value === 'false' || value === '' || value === null || value === undefined) {return false;}
    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : false;
}

function normalizeWorldbookPreview(value: unknown): TavernWorldbookPreviewRow {
    const record = promptRecord(value);
    const entries = Array.isArray(record.entries)
        ? record.entries.map((entry) => {
            const entryRecord = promptRecord(entry);
            return {
                uid: String(entryRecord.uid || ''),
                name: String(entryRecord.name || '未命名条目'),
                keys: Array.isArray(entryRecord.keys) ? entryRecord.keys.map((item) => String(item || '')).filter(Boolean) : [],
                secondaryKeys: Array.isArray(entryRecord.secondaryKeys) ? entryRecord.secondaryKeys.map((item) => String(item || '')).filter(Boolean) : [],
                contentPreview: String(entryRecord.contentPreview || ''),
                enabled: entryRecord.enabled !== false,
                constant: entryRecord.constant === true,
                vectorized: entryRecord.vectorized === true,
                order: Number.isFinite(Number(entryRecord.order)) ? Number(entryRecord.order) : 100,
                position: Number.isFinite(Number(entryRecord.position)) ? Number(entryRecord.position) : 0,
                role: Number.isFinite(Number(entryRecord.role)) ? Number(entryRecord.role) : 0,
                depth: normalizeNullableNumber(entryRecord.depth),
                probability: normalizeNullableNumber(entryRecord.probability),
            } as WorldbookPreviewEntryRow;
        })
        : [];
    return {
        name: String(record.name || ''),
        entryCount: Number.isFinite(Number(record.entryCount)) ? Number(record.entryCount) : entries.length,
        enabledCount: Number.isFinite(Number(record.enabledCount)) ? Number(record.enabledCount) : entries.filter((entry) => entry.enabled).length,
        constantCount: Number.isFinite(Number(record.constantCount)) ? Number(record.constantCount) : entries.filter((entry) => entry.constant).length,
        disabledCount: Number.isFinite(Number(record.disabledCount)) ? Number(record.disabledCount) : entries.filter((entry) => !entry.enabled).length,
        keywordCount: Number.isFinite(Number(record.keywordCount)) ? Number(record.keywordCount) : entries.reduce((sum, entry) => sum + entry.keys.length + entry.secondaryKeys.length, 0),
        totalChars: Number.isFinite(Number(record.totalChars)) ? Number(record.totalChars) : entries.reduce((sum, entry) => sum + entry.contentPreview.length, 0),
        entries,
    };
}

function normalizeWorldbookEntryDraft(value: unknown): TavernWorldbookEntryDraft {
    const record = promptRecord(value);
    const nativeSecondaryKeys = normalizeStringList(record.keysecondary);
    const originalSecondaryKeys = normalizeStringList(record.secondary_keys);
    const keysecondary = nativeSecondaryKeys.length ? nativeSecondaryKeys : originalSecondaryKeys;
    const secondaryKeys = keysecondary;
    const disable = record.disable === true || record.enabled === false;
    const constant = record.constant === true;
    const vectorized = !constant && record.vectorized === true;
    return {
        worldbookName: String(record.worldbookName || record.name || '').trim(),
        uid: record.uid === null || record.uid === undefined ? '' : String(record.uid).trim(),
        comment: String(record.comment ?? ''),
        key: normalizeStringList(record.key),
        keysecondary,
        secondary_keys: secondaryKeys,
        content: String(record.content ?? ''),
        disable,
        enabled: !disable,
        constant,
        vectorized,
        order: Number.isFinite(Number(record.order)) ? Number(record.order) : 100,
        position: Number.isFinite(Number(record.position)) ? Number(record.position) : 0,
        role: Number.isFinite(Number(record.role)) ? Number(record.role) : 0,
        depth: Number(record.position) === 4 ? normalizeNullableNumber(record.depth) ?? 4 : null,
        probability: normalizeNullableNumber(record.probability) ?? 100,
        useProbability: record.useProbability !== false,
        selective: record.selective === true,
        selectiveLogic: Number.isFinite(Number(record.selectiveLogic)) ? Number(record.selectiveLogic) : 0,
        scanDepth: normalizeNullableNumber(record.scanDepth),
        caseSensitive: normalizeTriStateBoolean(record.caseSensitive),
        matchWholeWords: normalizeTriStateBoolean(record.matchWholeWords),
        useGroupScoring: normalizeTriStateBoolean(record.useGroupScoring),
        outletName: String(record.outletName ?? ''),
        automationId: String(record.automationId ?? ''),
        ignoreBudget: record.ignoreBudget === true,
        excludeRecursion: record.excludeRecursion === true,
        preventRecursion: record.preventRecursion === true,
        delayUntilRecursion: normalizeDelayUntilRecursion(record.delayUntilRecursion),
        group: String(record.group ?? ''),
        groupOverride: record.groupOverride === true,
        groupWeight: normalizeNullableNumber(record.groupWeight),
        sticky: normalizeNullableNumber(record.sticky),
        cooldown: normalizeNullableNumber(record.cooldown),
        delay: normalizeNullableNumber(record.delay),
        triggers: normalizeStringList(record.triggers),
        matchPersonaDescription: record.matchPersonaDescription === true,
        matchCharacterDescription: record.matchCharacterDescription === true,
        matchCharacterPersonality: record.matchCharacterPersonality === true,
        matchCharacterDepthPrompt: record.matchCharacterDepthPrompt === true,
        matchScenario: record.matchScenario === true,
        matchCreatorNotes: record.matchCreatorNotes === true,
        entryHash: String(record.entryHash || ''),
        revision: String(record.revision || record.entryHash || ''),
    } as WorldbookEntryDraftRow;
}

function worldbookPreviewEntryFromDraft(draft: TavernWorldbookEntryDraft, fallback?: TavernWorldbookPreviewEntryRow): TavernWorldbookPreviewEntryRow {
    const comment = String(draft.comment || '').trim();
    return {
        uid: String(draft.uid || fallback?.uid || '').trim(),
        name: comment || fallback?.name || `条目 ${String(draft.uid || fallback?.uid || '').trim() || '?'}`,
        keys: normalizeStringList(draft.key),
        secondaryKeys: normalizeStringList(draft.keysecondary).length
            ? normalizeStringList(draft.keysecondary)
            : normalizeStringList(draft.secondary_keys),
        contentPreview: String(draft.content || ''),
        enabled: draft.enabled !== false && draft.disable !== true,
        constant: draft.constant === true,
        vectorized: draft.constant === true ? false : draft.vectorized === true,
        order: Number.isFinite(Number(draft.order)) ? Number(draft.order) : 100,
        position: Number.isFinite(Number(draft.position)) ? Number(draft.position) : 0,
        role: Number.isFinite(Number(draft.role)) ? Number(draft.role) : 0,
        depth: normalizeNullableNumber(draft.depth),
        probability: draft.useProbability === false ? null : normalizeNullableNumber(draft.probability),
    };
}

function normalizeGlobalWorldbookPayload(value: unknown): { options: string[]; selected: string[] } {
    const record = promptRecord(value);
    const options = Array.isArray(record.options)
        ? record.options.map((item) => String(item || '').trim()).filter(Boolean)
        : [];
    const selected = Array.isArray(record.selected)
        ? record.selected.map((item) => String(item || '').trim()).filter((name) => options.includes(name))
        : [];
    return { options, selected };
}

function normalizeRegexDraft(input: unknown = {}): TavernRegexScriptDraft {
    const source = promptRecord(input);
    return {
        ...source,
        id: String(source.id || ''),
        scriptName: String(source.scriptName || ''),
        findRegex: String(source.findRegex || ''),
        replaceString: String(source.replaceString || ''),
        trimStrings: Array.isArray(source.trimStrings) ? source.trimStrings.map((item) => String(item || '')).filter(Boolean) : [],
        placement: Array.isArray(source.placement) ? source.placement.map((item) => Number(item)).filter((item) => Number.isFinite(item)) : [],
        disabled: source.disabled === true,
        markdownOnly: source.markdownOnly === true,
        promptOnly: source.promptOnly === true,
        runOnEdit: source.runOnEdit === true,
        substituteRegex: Number.isFinite(Number(source.substituteRegex)) ? Number(source.substituteRegex) : 0,
        minDepth: source.minDepth === null || source.minDepth === '' || source.minDepth === undefined ? null : Number(source.minDepth),
        maxDepth: source.maxDepth === null || source.maxDepth === '' || source.maxDepth === undefined ? null : Number(source.maxDepth),
    };
}

function normalizeTavernUserOptionPayload(value: unknown): TavernUserOption | null {
    const record = promptRecord(value);
    const id = String(record.id || '').trim();
    if (!id) {return null;}
    return {
        id,
        name: String(record.name || id).trim() || id,
        avatarUrl: String(record.avatarUrl || '').trim(),
        description: String(record.description || '').trim(),
        active: record.active === true,
    };
}

function normalizeTavernUsersPayload(value: unknown): { users: TavernUserOption[]; currentUserId: string | null } {
    const record = promptRecord(value);
    const currentUserId = String(record.currentUserId || '').trim() || null;
    const users = Array.isArray(record.users)
        ? record.users
            .map((item) => normalizeTavernUserOptionPayload(item))
            .filter((item): item is TavernUserOption => Boolean(item))
        : [];
    if (currentUserId && !users.some((item) => item.id === currentUserId)) {
        users.unshift({
            id: currentUserId,
            name: currentUserId,
            avatarUrl: '',
            description: '',
            active: true,
        });
    }
    return {
        users: users.map((item) => ({
            ...item,
            active: currentUserId ? item.id === currentUserId : item.active,
        })),
        currentUserId,
    };
}

const API_CONFIG_SAVE_TIMEOUT_MS = 5000;
const CHAT_PRESET_SAVE_TIMEOUT_MS = 5000;

export function readInitialSettingsWorkspace(): TavernSettingsWorkspaceKey {
    const hash = String(window.location.hash || '').replace(/^#\/?/, '');
    const key = hash.split('/')[1];
    if (key === 'characters' || key === 'api' || key === 'chatPreset' || key === 'worldbooks' || key === 'regex' || key === 'assistantPreset' || key === 'base') {return key;}
    return 'api';
}

export function useTavernSettingsController(options: TavernSettingsControllerOptions) {
    const initialChatPreset = createFallbackTavernChatPromptPresetBundle();
    const initialAssistantPreset: TavernAssistantPreset = createDefaultTavernAssistantPreset();
    const apiSettingsRootRef = ref<HTMLElement | null>(null);
    const apiConfigSave = ref({ status: 'idle', requestId: '', error: '' });
    const apiConfigStatus = ref('');
    let apiConfigSaveTimeout: number | null = null;
    let apiConfigSaveResetTimer: number | null = null;
    const preset = ref<TavernChatPromptPresetBundle>(initialChatPreset);
    const activeChatPreset = ref<TavernChatPromptPresetBundle>(initialChatPreset);
    const chatPresetList = ref<Record<string, unknown>>({});
    const presetStatus = ref('');
    const {
        feedback: presetSaveFeedback,
        resetSaveFeedback: resetPresetSaveFeedback,
        beginSaveFeedback: beginPresetSaveFeedback,
        completeSaveFeedback: completePresetSaveFeedback,
    } = useTavernSaveFeedback();
    const savedPresetJson = ref(JSON.stringify(initialChatPreset));
    const selectedPromptIdentifier = ref('');
    const assistantPreset = ref<TavernAssistantPreset>(initialAssistantPreset);
    const activeAssistantPreset = ref<TavernAssistantPreset>(initialAssistantPreset);
    const assistantPresets = ref<TavernAssistantPresetRecord[]>([]);
    const activeAssistantPresetId = ref('');
    const assistantPresetStatus = ref('');
    const {
        feedback: assistantPresetSaveFeedback,
        resetSaveFeedback: resetAssistantPresetSaveFeedback,
        beginSaveFeedback: beginAssistantPresetSaveFeedback,
        completeSaveFeedback: completeAssistantPresetSaveFeedback,
    } = useTavernSaveFeedback();
    const savedAssistantPresetJson = ref(JSON.stringify(initialAssistantPreset));
    const selectedPresetSourceId = ref('');
    const selectedAssistantPresetItemId = ref('statePrompt');
    const worldbookList = ref<Record<string, unknown>>({});
    const selectedWorldbookName = ref('');
    const worldbookStatus = ref('');
    const globalWorldbookOptions = ref<string[]>([]);
    const globalWorldbookSelected = ref<string[]>([]);
    const globalWorldbookStatus = ref('');
    const globalWorldbookSaving = ref(false);
    const worldbookPreview = ref<TavernWorldbookPreviewRow | null>(null);
    const worldbookPreviewStatus = ref('');
    const worldbookEntryDraft = ref<TavernWorldbookEntryDraft | null>(null);
    const savedWorldbookEntryDraftJson = ref('');
    const worldbookEntryEditingKey = ref('');
    const worldbookEntryStatus = ref('');
    const {
        feedback: worldbookEntrySaveFeedback,
        resetSaveFeedback: resetWorldbookEntrySaveFeedback,
        beginSaveFeedback: beginWorldbookEntrySaveFeedback,
        completeSaveFeedback: completeWorldbookEntrySaveFeedback,
    } = useTavernSaveFeedback();
    const chatPresetSourceSearchText = ref('');
    const chatPresetSourceVisibleLimit = ref(CHAT_PRESET_SOURCE_BATCH_SIZE);
    const assistantPresetSearchText = ref('');
    const assistantPresetVisibleLimit = ref(ASSISTANT_PRESET_BATCH_SIZE);
    const promptSearchText = ref('');
    const promptVisibleLimit = ref(PROMPT_EDITOR_BATCH_SIZE);
    const worldbookPreviewVisibleLimit = ref(WORLDBOOK_PREVIEW_BATCH_SIZE);
    const regexSearchText = ref('');
    const regexGroupVisibleLimits = ref<Record<string, number>>({});
    const regexList = ref<Record<string, unknown>>({});
    const regexLoadedNativeCharacterId = ref('');
    const selectedRegexKey = ref('');
    const regexDraft = ref<TavernRegexScriptDraft>({});
    const activeRegexScriptJson = ref(snapshotNativeDraft(regexDraft.value));
    const regexStatus = ref('');
    const {
        feedback: regexSaveFeedback,
        resetSaveFeedback: resetRegexSaveFeedback,
        beginSaveFeedback: beginRegexSaveFeedback,
        completeSaveFeedback: completeRegexSaveFeedback,
    } = useTavernSaveFeedback();
    const tavernUsers = ref<TavernUserOption[]>([]);
    const currentTavernUserId = ref<string | null>(null);
    const baseSettingsStatus = ref('');
    const baseSettingsSaving = ref(false);
    const baseSettingsLoading = ref(false);
    const switchingTavernUserId = ref('');
    const displaySettings = ref(normalizeTavernDisplaySettings(options.tavernDisplaySettings.value));
    const committedDisplaySettings = ref(clonePromptJson(displaySettings.value) as TavernDisplaySettings);
    let baseSettingsSaveSerial = 0;
    let chatPresetSaveRequestSerial = 0;
    let chatPresetSelectRequestSerial = 0;
    let assistantPresetSaveRequestSerial = 0;
    let assistantPresetSelectRequestSerial = 0;
    let worldbookEntryLoadRequestSerial = 0;
    let worldbookEntryLoadRequestKey = '';
    let worldbookEntrySaveRequestSerial = 0;
    let worldbookSyncRequestSerial = 0;
    let worldbookPreviewRequestSerial = 0;
    let globalWorldbookRequestSerial = 0;
    let globalWorldbookSavingRequestSerial = 0;
    let regexRefreshRequestSerial = 0;
    let regexMutationRequestSerial = 0;

    const apiSettingsPanelState: Record<string, unknown> = {
        config: {},
        configDraft: null,
        configFormSyncPending: true,
        configPage: 'main',
        configSave: apiConfigSave.value,
        pullStateByProvider: {},
        modelOptionsByProvider: {},
    };
    let apiSettingsPanel: ReturnType<typeof createAgentSettingsPanel> | null = null;

    const snapshotPreset = (value = preset.value) => JSON.stringify(value || {});
    const snapshotAssistantPreset = (value = assistantPreset.value) => JSON.stringify(value || {});
    const presetDirty = computed(() => snapshotPreset(preset.value) !== savedPresetJson.value);
    const runtimeChatPreset = computed(() => normalizeTavernChatPromptPresetBundle(activeChatPreset.value));
    const assistantPresetDirty = computed(() => snapshotAssistantPreset(assistantPreset.value) !== savedAssistantPresetJson.value);
    const resolvedProviderConfig = computed(() => resolveXbTavernProviderConfig(options.agentConfig.value));
    const apiReady = computed(() => resolvedProviderConfig.value.readiness.ok);
    const apiReadyDetail = computed(() => resolvedProviderConfig.value.readiness.message);
    const apiRuntimeLine = computed(() => {
        const config = resolvedProviderConfig.value;
        return `预设「${config.currentPresetName || '默认'}」 · ${config.providerLabel} / ${config.model || '未选择模型'}`;
    });

    const chatPresetOptions = computed<TavernChatPresetOptionRow[]>(() => {
        const components = promptRecord(chatPresetList.value.components);
        const names = Array.isArray(components.promptManager) ? components.promptManager : [];
        const activeName = String(preset.value.promptManager?.name || preset.value.name || '').trim();
        const seen = new Set<string>();
        return [activeName, ...names]
            .map((item) => {
                if (typeof item === 'string') {return item.trim();}
                const record = promptRecord(item);
                return String(record.name || record.label || record.id || '').trim();
            })
            .filter((name) => {
                if (!name || seen.has(name)) {return false;}
                seen.add(name);
                return true;
            })
            .map((name) => ({ name, label: name }));
    });
    const filteredChatPresetOptions = computed<TavernChatPresetOptionRow[]>(() => {
        const query = normalizedSearchText(chatPresetSourceSearchText.value);
        if (!query) {return chatPresetOptions.value;}
        return chatPresetOptions.value.filter((item) => includesSearch(item.label || item.name, query));
    });
    const visibleChatPresetOptions = computed(() => {
        const visible = filteredChatPresetOptions.value.slice(0, chatPresetSourceVisibleLimit.value);
        const selectedName = String(selectedPresetSourceId.value || preset.value.promptManager?.name || preset.value.name || '').trim();
        if (!selectedName || visible.some((item) => item.name === selectedName)) {return visible;}
        const selected = chatPresetOptions.value.find((item) => item.name === selectedName);
        return selected ? [selected, ...visible] : visible;
    });
    const hiddenChatPresetOptionCount = computed(() => Math.max(
        0,
        filteredChatPresetOptions.value.length - Math.min(filteredChatPresetOptions.value.length, chatPresetSourceVisibleLimit.value),
    ));
    const worldbookOptions = computed<TavernWorldbookOptionRow[]>(() => {
        const books = Array.isArray(worldbookList.value.books) ? worldbookList.value.books : [];
        return books.map((item) => {
            const record = promptRecord(item);
            return {
                name: String(record.name || '').trim(),
                globalActive: record.globalActive === true,
            };
        }).filter((item) => item.name);
    });
    const selectedWorldbook = computed<TavernWorldbookOptionRow | null>(() => (
        worldbookOptions.value.find((item) => item.name === selectedWorldbookName.value) || null
    ));
    const hiddenWorldbookPreviewEntryCount = computed(() => {
        const preview = worldbookPreview.value;
        if (!preview || preview.name !== selectedWorldbookName.value) {return 0;}
        return Math.max(0, preview.entryCount - preview.entries.length);
    });
    const worldbookEntryDirty = computed(() => {
        if (!worldbookEntryDraft.value) {return false;}
        return snapshotNativeDraft(worldbookEntryDraft.value) !== savedWorldbookEntryDraftJson.value;
    });
    const worldbookEntrySaving = computed(() => worldbookEntrySaveFeedback.value.status === 'saving');
    const regexGroups = computed<TavernRegexGroupRow[]>(() => {
        const groups = Array.isArray(regexList.value.groups) ? regexList.value.groups : [];
        return groups.map((group) => {
            const record = promptRecord(group);
            const scripts = Array.isArray(record.scripts) ? record.scripts.map((script) => promptRecord(script) as TavernRegexScriptDraft) : [];
            return {
                key: String(record.key || ''),
                label: String(record.label || record.key || ''),
                scriptType: Number(record.scriptType),
                scripts,
                allowed: record.allowed === true,
            };
        }).filter((group) => group.key && Number.isFinite(group.scriptType));
    });
    const regexScriptRows = computed<TavernRegexScriptRow[]>(() => regexGroups.value.flatMap((group) => (
        group.scripts.map((script, index) => {
            const row: TavernRegexScriptRow = {
                key: `${group.scriptType}:${String(script.id || index)}`,
                groupKey: group.key,
                groupLabel: group.label,
                scriptType: group.scriptType,
                script,
            };
            row.searchCorpus = normalizedSearchText(buildSearchCorpus([
                row.groupLabel,
                row.script.scriptName,
                row.script.findRegex,
                row.script.replaceString,
                row.script.trimStrings,
                row.script.placement,
                row.key,
            ], 1200));
            return row;
        })
    )));
    function regexVisibleLimitForGroup(groupKey = '') {
        const value = Number(regexGroupVisibleLimits.value[groupKey]);
        return Number.isFinite(value) && value > 0 ? Math.floor(value) : REGEX_GROUP_BATCH_SIZE;
    }
    function expandRegexGroup(groupKey = '') {
        const current = regexVisibleLimitForGroup(groupKey);
        regexGroupVisibleLimits.value = {
            ...regexGroupVisibleLimits.value,
            [groupKey]: current + REGEX_GROUP_BATCH_SIZE,
        };
    }
    const regexGroupsForDisplay = computed<TavernRegexGroupDisplayRow[]>(() => {
        const query = normalizedSearchText(regexSearchText.value);
        const selectedKey = String(selectedRegexKey.value || '').trim();
        return regexGroups.value
            .map((group) => {
                const rows = regexScriptRows.value.filter((item) => item.groupKey === group.key);
                const filtered = query
                    ? rows.filter((row) => String(row.searchCorpus || '').includes(query))
                    : rows;
                const limit = regexVisibleLimitForGroup(group.key);
                const visibleRows = filtered.slice(0, limit);
                if (selectedKey && !visibleRows.some((row) => row.key === selectedKey)) {
                    const selected = rows.find((row) => row.key === selectedKey);
                    if (selected) {visibleRows.unshift(selected);}
                }
                return {
                    ...group,
                    visibleRows,
                    totalCount: rows.length,
                    filteredCount: filtered.length,
                    hiddenCount: Math.max(0, filtered.length - Math.min(filtered.length, limit)),
                };
            })
            .filter((group) => group.filteredCount || !query);
    });
    const selectedRegexRow = computed(() => regexScriptRows.value.find((row) => row.key === selectedRegexKey.value) || null);
    const regexDirty = computed(() => snapshotNativeDraft(regexDraft.value) !== activeRegexScriptJson.value);
    const settingsNavItems = computed<TavernSettingsNavItem[]>(() => [
        {
            key: 'characters',
            label: '角色卡',
            mobileLabel: '角色卡',
        },
        {
            key: 'worldbooks',
            label: '世界书',
            mobileLabel: '世界书',
        },
        {
            key: 'chatPreset',
            label: '聊天预设',
            mobileLabel: '聊天预设',
            badge: presetDirty.value ? '未保存' : '',
        },
        {
            key: 'assistantPreset',
            label: '助手预设',
            mobileLabel: '助手预设',
            badge: assistantPresetDirty.value ? '未保存' : '',
        },
        {
            key: 'regex',
            label: '正则',
            badge: regexDirty.value ? '未保存' : '',
        },
        {
            key: 'api',
            label: 'API 配置',
            mobileLabel: 'API',
        },
        {
            key: 'base',
            label: '基础设定',
            mobileLabel: '基础设定',
        },
    ]);
    const currentTavernUser = computed(() => tavernUsers.value.find((item) => item.id === currentTavernUserId.value) || null);
    const assistantPresetItems = computed<TavernAssistantPresetItemRow[]>(() => {
        return assistantPresetSections.map((section) => ({
            id: section.key,
            key: section.key,
            label: section.label,
            summary: section.summary,
            content: String(assistantPreset.value[section.key] || ''),
        }));
    });
    const filteredAssistantPresetRecords = computed<TavernAssistantPresetRecord[]>(() => {
        const query = normalizedSearchText(assistantPresetSearchText.value);
        if (!query) {return assistantPresets.value;}
        return assistantPresets.value.filter((item) => normalizedSearchText(buildSearchCorpus([
            item.name,
            item.description,
            item.id,
            item.preset?.name,
            item.preset?.description,
        ], 1200)).includes(query));
    });
    const visibleAssistantPresetRecords = computed(() => {
        const visible = filteredAssistantPresetRecords.value.slice(0, assistantPresetVisibleLimit.value);
        const selectedId = String(activeAssistantPresetId.value || assistantPreset.value.id || '').trim();
        if (!selectedId || visible.some((item) => item.id === selectedId)) {return visible;}
        const selected = assistantPresets.value.find((item) => item.id === selectedId);
        return selected ? [selected, ...visible] : visible;
    });
    const hiddenAssistantPresetCount = computed(() => Math.max(
        0,
        filteredAssistantPresetRecords.value.length - Math.min(filteredAssistantPresetRecords.value.length, assistantPresetVisibleLimit.value),
    ));
    const activeAssistantPresetRecord = computed(() => assistantPresets.value.find((item) => item.id === activeAssistantPresetId.value) || null);
    const selectedAssistantPresetItem = computed(() => (
        assistantPresetItems.value.find((item) => item.id === selectedAssistantPresetItemId.value)
        || assistantPresetItems.value[0]
        || null
    ));
    const canEditPromptOrder = computed(() => Boolean(getActivePromptCharacterId()));
    const promptEditorRows = computed<PromptEditorRow[]>(() => {
        const prompts = getPromptArrayDraft();
        const promptById = new Map(prompts.map((prompt, index) => [
            String(prompt.identifier || prompt.id || `prompt-${index + 1}`).trim(),
            prompt,
        ]));
        const order = getActivePromptOrderDraft();
        const seen = new Set<string>();
        const rows: PromptEditorRow[] = [];

        order.forEach((entry) => {
            const identifier = String(entry.identifier || '').trim();
            if (!identifier || seen.has(identifier)) {return;}
            const prompt = promptById.get(identifier) || { identifier, name: identifier };
            seen.add(identifier);
            rows.push({
                identifier,
                name: String(prompt.name || prompt.label || identifier),
                role: String(prompt.role || 'system'),
                content: String(prompt.content || ''),
                enabled: entry.enabled !== false,
                marker: prompt.marker === true,
                systemPrompt: prompt.system_prompt === true,
                injectionPosition: Number(prompt.injection_position ?? 0),
                injectionDepth: Number.isFinite(Number(prompt.injection_depth)) ? Number(prompt.injection_depth) : '',
                source: prompt.extension ? '扩展' : prompt.system_prompt ? '系统' : '预设',
                orderEntry: entry,
                prompt,
                listed: true,
                searchCorpus: normalizedSearchText(buildSearchCorpus([
                    prompt.name || prompt.label || identifier,
                    prompt.role || 'system',
                    prompt.extension ? '扩展' : prompt.system_prompt ? '系统' : '预设',
                    identifier,
                    prompt.content || '',
                ])),
            });
        });

        return rows;
    });
    const filteredPromptEditorRows = computed<PromptEditorRow[]>(() => {
        const query = normalizedSearchText(promptSearchText.value);
        if (!query) {return promptEditorRows.value;}
        return promptEditorRows.value.filter((row) => String(row.searchCorpus || '').includes(query));
    });
    const visiblePromptEditorRows = computed(() => {
        const visible = filteredPromptEditorRows.value.slice(0, promptVisibleLimit.value);
        const selectedId = String(selectedPromptIdentifier.value || '').trim();
        if (!selectedId || visible.some((row) => row.identifier === selectedId)) {return visible;}
        const selected = promptEditorRows.value.find((row) => row.identifier === selectedId);
        return selected ? [selected, ...visible] : visible;
    });
    const hiddenPromptCount = computed(() => Math.max(
        0,
        filteredPromptEditorRows.value.length - Math.min(filteredPromptEditorRows.value.length, promptVisibleLimit.value),
    ));
    const promptEditorRowIndexById = computed(() => new Map(promptEditorRows.value.map((row, index) => [row.identifier, index])));
    const selectedPromptRow = computed(() => promptEditorRows.value.find((row) => row.identifier === selectedPromptIdentifier.value) || promptEditorRows.value[0] || null);
    const activePromptOrderLabel = computed(() => {
        const activeCharacterId = getActivePromptCharacterId();
        return activeCharacterId ? '当前角色顺序' : '未读取到当前角色顺序';
    });
    const presetRows = computed(() => (preset.value.sections || [])
        .map((section, index) => ({
            ...section,
            previewId: section.id || `chat-preset-section-${index}`,
            previewLabel: section.label || section.source || `提示词 ${index + 1}`,
            previewPlacement: section.source === 'promptManager'
                ? (section.marker ? '酒馆标记' : '酒馆顺序')
                : (placementLabels[section.placement || 'beforeHistory'] || section.placement || '历史前'),
            sectionIndex: index,
            chars: String(section.content || '').length,
        }))
        .filter((row) => (row.content || row.marker) && row.enabled !== false));
    const presetTotalChars = computed(() => presetRows.value.reduce((sum, row) => sum + row.chars, 0));

    function worldbookEntryEditKey(entry: { uid?: string; name?: string; order?: number } | TavernWorldbookEntryDraft | null): string {
        if (!entry) {return '';}
        const entryId = entry.uid !== undefined && entry.uid !== null && String(entry.uid).trim()
            ? String(entry.uid).trim()
            : entry.order !== undefined && entry.order !== null && String(entry.order).trim()
                ? String(entry.order).trim()
                : ('name' in entry ? String(entry.name || '').trim() : '');
        return `${String(selectedWorldbookName.value || '').trim()}:${entryId}`;
    }
    function isEditingWorldbookEntry(entry: TavernWorldbookPreviewEntryRow): boolean {
        return !!worldbookEntryEditingKey.value && worldbookEntryEditingKey.value === worldbookEntryEditKey(entry);
    }
    function promptRowIndex(identifier: string) {
        return promptEditorRowIndexById.value.get(identifier) ?? -1;
    }
    function getPromptManagerDraft(): Record<string, unknown> {
        return promptRecord(preset.value.promptManager);
    }
    function getRawPresetDraft(): Record<string, unknown> {
        const manager = getPromptManagerDraft();
        return promptRecord(manager.rawPreset);
    }
    function getPromptArrayDraft(): Record<string, unknown>[] {
        const raw = getRawPresetDraft();
        const manager = getPromptManagerDraft();
        const source = Array.isArray(raw.prompts)
            ? raw.prompts
            : Array.isArray(manager.prompts)
                ? manager.prompts
                : [];
        return source.map((item) => promptRecord(item)).filter((item) => String(item.identifier || item.id || '').trim());
    }
    function getPromptOrderContainersDraft(): Record<string, unknown>[] {
        const raw = getRawPresetDraft();
        const manager = getPromptManagerDraft();
        const source = Array.isArray(raw.prompt_order)
            ? raw.prompt_order
            : Array.isArray(manager.promptOrder)
                ? manager.promptOrder
                : [];
        return source.map((item) => promptRecord(item));
    }
    function getActivePromptOrderDraft(): Record<string, unknown>[] {
        const manager = getPromptManagerDraft();
        const activeOrder = Array.isArray(manager.activeOrder) ? manager.activeOrder.map((item) => promptRecord(item)) : [];
        if (activeOrder.length) {return activeOrder;}
        const activeCharacterId = String(manager.activeCharacterId ?? '').trim();
        if (!activeCharacterId) {return [];}
        const containers = getPromptOrderContainersDraft();
        const activeContainer = containers.find((item) => String(item.character_id ?? '') === activeCharacterId);
        return Array.isArray(activeContainer?.order) ? activeContainer.order.map((item) => promptRecord(item)) : [];
    }
    function getActivePromptCharacterId(): string {
        return String(getPromptManagerDraft().activeCharacterId ?? '').trim();
    }
    function applyActiveChatPreset(next: Partial<TavernChatPromptPresetBundle> = {}, applyOptions: { replaceDraft?: boolean } = {}) {
        const normalized = normalizeTavernChatPromptPresetBundle(next);
        activeChatPreset.value = normalized;
        savedPresetJson.value = snapshotPreset(normalized);
        selectedPresetSourceId.value = String(normalized.promptManager?.name || normalized.name || '').trim();
        if (applyOptions.replaceDraft !== false) {
            preset.value = normalized;
        }
    }
    function refreshCurrentHostContext(): void {
        const nativeCharacterId = String(options.currentNativeCharacterId.value || '').trim();
        if (!nativeCharacterId) {return;}
        options.postToHost('xb-tavern:refresh-context', { nativeCharacterId, includeHistory: false });
    }
    function applyActiveRegexScript(row: TavernRegexScriptRow | null) {
        if (!row) {
            regexDraft.value = {};
            activeRegexScriptJson.value = snapshotNativeDraft({});
            selectedRegexKey.value = '';
            return;
        }
        const normalized = normalizeRegexDraft(row.script);
        regexDraft.value = normalized;
        activeRegexScriptJson.value = snapshotNativeDraft(normalized);
        selectedRegexKey.value = row.key;
    }
    function currentRegexNativeCharacterId(): string {
        return String(options.regexNativeCharacterId.value || '').trim();
    }
    function regexDraftNativeCharacterId(): string {
        return String(regexLoadedNativeCharacterId.value || currentRegexNativeCharacterId() || '').trim();
    }
    async function refreshRegexAfterStaleMutation(targetNativeCharacterId: string) {
        if (targetNativeCharacterId === currentRegexNativeCharacterId()) {return false;}
        if (String(regexLoadedNativeCharacterId.value || '').trim() !== targetNativeCharacterId) {
            regexStatus.value = '';
            return true;
        }
        regexLoadedNativeCharacterId.value = '';
        regexList.value = {};
        applyActiveRegexScript(null);
        regexStatus.value = '';
        if (options.activeView.value === 'settings' && options.activeSettingsWorkspace.value === 'regex') {
            await refreshRegexFromHost();
        }
        return true;
    }
    function applyActiveAssistantPreset(next: Partial<TavernAssistantPreset> = {}, applyOptions: { replaceDraft?: boolean } = {}) {
        const normalized = normalizeTavernAssistantPreset(next);
        activeAssistantPreset.value = normalized;
        savedAssistantPresetJson.value = snapshotAssistantPreset(normalized);
        if (applyOptions.replaceDraft !== false) {
            assistantPreset.value = normalized;
        }
    }
    function confirmDiscardDraft(label: string, action = '继续？') {
        return options.confirmDialog({
            title: '放弃未保存修改',
            message: `当前${label}有未保存修改，${action}会放弃这些草稿。继续？`,
            confirmText: action,
            tone: 'warning',
        });
    }
    async function requestChatPresetSaveFromHost(presetPayload: TavernChatPromptPresetBundle) {
        const controller = typeof AbortController === 'function' ? new AbortController() : null;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        const timeout = new Promise<never>((_resolve, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error('保存超时，请重试'));
                controller?.abort();
            }, CHAT_PRESET_SAVE_TIMEOUT_MS);
            (timeoutId as { unref?: () => void }).unref?.();
        });
        try {
            return await Promise.race([
                options.requestHost('xb-tavern:save-chat-preset', {
                    payload: presetPayload as unknown as Record<string, unknown>,
                }, controller ? { signal: controller.signal } : {}),
                timeout,
            ]);
        } finally {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
        }
    }
    function applyWorldbookEntryDraft(draft: unknown, applyOptions: { replaceDraft?: boolean } = {}) {
        const normalized = normalizeWorldbookEntryDraft(draft);
        savedWorldbookEntryDraftJson.value = snapshotNativeDraft(normalized);
        worldbookEntryEditingKey.value = worldbookEntryEditKey(normalized);
        if (applyOptions.replaceDraft !== false) {
            worldbookEntryDraft.value = normalized;
        } else if (worldbookEntryDraft.value) {
            worldbookEntryDraft.value = normalizeWorldbookEntryDraft({
                ...worldbookEntryDraft.value,
                uid: normalized.uid,
                worldbookName: normalized.worldbookName,
                entryHash: normalized.entryHash,
                revision: normalized.revision,
            });
        }
    }
    function patchWorldbookPreviewEntryFromDraft(draftInput: unknown) {
        const normalized = normalizeWorldbookEntryDraft(draftInput);
        const preview = worldbookPreview.value;
        const targetName = String(selectedWorldbookName.value || normalized.worldbookName || '').trim();
        if (!preview || preview.name !== targetName || !normalized.uid) {return;}
        const entryIndex = preview.entries.findIndex((entry) => entry.uid === normalized.uid);
        if (entryIndex < 0) {return;}
        const previousEntry = preview.entries[entryIndex];
        const nextEntry = worldbookPreviewEntryFromDraft(normalized, previousEntry);
        const entries = [...preview.entries];
        entries[entryIndex] = nextEntry;
        entries.sort((left, right) => Number(right.order) - Number(left.order));
        worldbookPreview.value = {
            ...preview,
            enabledCount: Math.max(0, preview.enabledCount + (nextEntry.enabled ? 1 : 0) - (previousEntry.enabled ? 1 : 0)),
            constantCount: Math.max(0, preview.constantCount + (nextEntry.constant ? 1 : 0) - (previousEntry.constant ? 1 : 0)),
            disabledCount: Math.max(0, preview.disabledCount + (!nextEntry.enabled ? 1 : 0) - (!previousEntry.enabled ? 1 : 0)),
            keywordCount: Math.max(0, preview.keywordCount
                + nextEntry.keys.length + nextEntry.secondaryKeys.length
                - previousEntry.keys.length - previousEntry.secondaryKeys.length),
            totalChars: Math.max(0, preview.totalChars + nextEntry.contentPreview.length - previousEntry.contentPreview.length),
            entries,
        };
    }
    async function refreshPresets() {
        if (assistantPresetDirty.value && !await confirmDiscardDraft('助手预设', '刷新')) {
            assistantPresetStatus.value = '';
            return;
        }
        const [loadedAssistantPresets, activeAssistantId, loadedAssistantPreset] = await Promise.all([
            listTavernAssistantPresets(),
            getActiveTavernAssistantPresetId(),
            loadActiveTavernAssistantPreset(),
        ]);
        assistantPresets.value = loadedAssistantPresets;
        activeAssistantPresetId.value = activeAssistantId || loadedAssistantPreset.id;
        applyActiveAssistantPreset(loadedAssistantPreset, { replaceDraft: !assistantPresetDirty.value });
    }
    async function syncChatPresetFromHost() {
        presetStatus.value = '正在同步';
        try {
            const result = await options.requestHost('xb-tavern:list-chat-presets');
            const payload = (result.result || result) as Record<string, unknown>;
            chatPresetList.value = payload;
            applyActiveChatPreset(payload.active as Partial<TavernChatPromptPresetBundle>, {
                replaceDraft: !presetDirty.value,
            });
            presetStatus.value = '';
        } catch (error) {
            presetStatus.value = error instanceof Error ? error.message : String(error || '读取失败');
        }
    }
    async function refreshRuntimeChatPresetFromHost(): Promise<TavernChatPromptPresetBundle> {
        const result = await options.requestHost('xb-tavern:get-chat-preset');
        const payload = (result.result || result) as Partial<TavernChatPromptPresetBundle>;
        applyActiveChatPreset(payload, {
            replaceDraft: !presetDirty.value,
        });
        presetStatus.value = '';
        return normalizeTavernChatPromptPresetBundle(activeChatPreset.value);
    }
    async function selectChatPresetFromHost(name = selectedPresetSourceId.value) {
        const presetName = String(name || '').trim();
        const currentName = String(preset.value.promptManager?.name || preset.value.name || '').trim();
        resetPresetSaveFeedback();
        if (!presetName) {
            selectedPresetSourceId.value = currentName;
            return;
        }
        if (presetName === currentName) {
            selectedPresetSourceId.value = currentName;
            return;
        }
        if (presetDirty.value && !await confirmDiscardDraft('聊天预设', '切换')) {
            selectedPresetSourceId.value = currentName;
            return;
        }
        chatPresetSaveRequestSerial += 1;
        const requestSerial = ++chatPresetSelectRequestSerial;
        presetStatus.value = '正在切换';
        try {
            const result = await options.requestHost('xb-tavern:select-chat-preset', {
                payload: { promptManagerName: presetName },
            });
            if (requestSerial !== chatPresetSelectRequestSerial) {return;}
            const nextPreset = (result.result || result) as Partial<TavernChatPromptPresetBundle>;
            applyActiveChatPreset(nextPreset);
            presetStatus.value = '';
            refreshCurrentHostContext();
        } catch (error) {
            if (requestSerial !== chatPresetSelectRequestSerial) {return;}
            selectedPresetSourceId.value = currentName;
            presetStatus.value = error instanceof Error ? error.message : String(error || '切换失败');
        }
    }
    async function saveCurrentPreset() {
        if (presetSaveFeedback.value.status === 'saving') {
            return;
        }
        if (!canEditPromptOrder.value) {
            completePresetSaveFeedback({ ok: false, error: '未读取到当前角色顺序，请刷新后再保存' });
            return;
        }
        if (!presetDirty.value) {
            return;
        }
        beginPresetSaveFeedback();
        const requestSerial = ++chatPresetSaveRequestSerial;
        chatPresetSelectRequestSerial += 1;
        const savedDraftJsonAtRequest = snapshotPreset(preset.value);
        const presetPayload = clonePromptJson(preset.value) as TavernChatPromptPresetBundle;
        try {
            const result = await requestChatPresetSaveFromHost(presetPayload);
            if (requestSerial !== chatPresetSaveRequestSerial) {return;}
            if (result.ok === false) {
                completePresetSaveFeedback({ ok: false, error: String(result.error || '保存失败') });
                return;
            }
            applyActiveChatPreset(result.result as Partial<TavernChatPromptPresetBundle>, {
                replaceDraft: snapshotPreset(preset.value) === savedDraftJsonAtRequest,
            });
            presetStatus.value = '';
            completePresetSaveFeedback({ ok: true });
            refreshCurrentHostContext();
        } catch (error) {
            if (requestSerial !== chatPresetSaveRequestSerial) {return;}
            completePresetSaveFeedback({
                ok: false,
                error: error instanceof Error ? error.message : String(error || '保存失败'),
            });
        }
    }
    async function syncWorldbooksFromHost(syncOptions: TavernWorldbookSyncOptions = {}) {
        const requestSerial = syncOptions.requestSerial || ++worldbookSyncRequestSerial;
        if (requestSerial !== worldbookSyncRequestSerial) {return;}
        worldbookStatus.value = '正在同步';
        try {
            const result = await options.requestHost('xb-tavern:list-worldbook-sources', {
                payload: {
                    context: options.effectiveContext.value,
                },
            });
            if (requestSerial !== worldbookSyncRequestSerial) {return;}
            const payload = (result.result || result) as Record<string, unknown>;
            worldbookList.value = payload;
            const currentName = String(selectedWorldbookName.value || '').trim();
            const selectedStillExists = !!currentName
                && worldbookOptions.value.some((item) => item.name === currentName);
            const preferredName = String(syncOptions.preferredName || '').trim();
            const preferredStillExists = !!preferredName
                && worldbookOptions.value.some((item) => item.name === preferredName);
            const fallbackName = syncOptions.selectFirst
                ? (worldbookOptions.value.find((item) => item.globalActive)?.name
                    || worldbookOptions.value[0]?.name
                    || '')
                : '';
            selectedWorldbookName.value = preferredStillExists
                ? preferredName
                : syncOptions.keepSelection && selectedStillExists
                ? selectedWorldbookName.value
                : fallbackName;
            worldbookStatus.value = '';
            void loadSelectedWorldbookPreview(selectedWorldbookName.value);
        } catch (error) {
            if (requestSerial !== worldbookSyncRequestSerial) {return;}
            worldbookStatus.value = error instanceof Error ? error.message : String(error || '读取失败');
        }
    }
    async function syncGlobalWorldbooksFromHost() {
        const requestSerial = ++globalWorldbookRequestSerial;
        globalWorldbookStatus.value = '正在同步';
        try {
            const result = await options.requestHost('xb-tavern:get-global-worldbooks');
            if (requestSerial !== globalWorldbookRequestSerial) {return;}
            const payload = normalizeGlobalWorldbookPayload(result.result || result);
            if (globalWorldbookSavingRequestSerial && globalWorldbookSavingRequestSerial <= requestSerial) {
                globalWorldbookSavingRequestSerial = 0;
                globalWorldbookSaving.value = false;
            }
            globalWorldbookOptions.value = payload.options;
            globalWorldbookSelected.value = payload.selected;
            globalWorldbookStatus.value = '';
        } catch (error) {
            if (requestSerial !== globalWorldbookRequestSerial) {return;}
            if (globalWorldbookSavingRequestSerial && globalWorldbookSavingRequestSerial <= requestSerial) {
                globalWorldbookSavingRequestSerial = 0;
                globalWorldbookSaving.value = false;
            }
            globalWorldbookStatus.value = error instanceof Error ? error.message : String(error || '读取失败');
        }
    }
    async function saveGlobalWorldbooksToHost(selected: string[] = globalWorldbookSelected.value) {
        const nextSelected = Array.from(new Set(selected.map((name) => String(name || '').trim()).filter(Boolean)));
        const requestSerial = ++globalWorldbookRequestSerial;
        globalWorldbookSavingRequestSerial = requestSerial;
        globalWorldbookSelected.value = nextSelected;
        globalWorldbookSaving.value = true;
        globalWorldbookStatus.value = '正在保存';
        try {
            const result = await options.requestHost('xb-tavern:set-global-worldbooks', {
                payload: { selected: nextSelected },
            });
            if (requestSerial !== globalWorldbookRequestSerial) {return;}
            const payload = normalizeGlobalWorldbookPayload(result.result || result);
            if (globalWorldbookSavingRequestSerial === requestSerial) {
                globalWorldbookSavingRequestSerial = 0;
                globalWorldbookSaving.value = false;
            }
            globalWorldbookOptions.value = payload.options;
            globalWorldbookSelected.value = payload.selected;
            globalWorldbookStatus.value = '';
            refreshCurrentHostContext();
            void syncWorldbooksFromHost({ keepSelection: true });
        } catch (error) {
            if (requestSerial !== globalWorldbookRequestSerial) {return;}
            if (globalWorldbookSavingRequestSerial === requestSerial) {
                globalWorldbookSavingRequestSerial = 0;
                globalWorldbookSaving.value = false;
            }
            globalWorldbookStatus.value = error instanceof Error ? error.message : String(error || '保存失败');
            void syncGlobalWorldbooksFromHost();
        }
    }
    function toggleGlobalWorldbook(name: string, selected: boolean) {
        const targetName = String(name || '').trim();
        if (!targetName || globalWorldbookSaving.value) {return;}
        const current = new Set(globalWorldbookSelected.value);
        if (selected) {
            current.add(targetName);
        } else {
            current.delete(targetName);
        }
        void saveGlobalWorldbooksToHost([...current]);
    }
    async function loadSelectedWorldbookPreview(
        name = selectedWorldbookName.value,
        loadOptions: { preserveExistingOnError?: boolean } = {},
    ) {
        const requestSerial = ++worldbookPreviewRequestSerial;
        const targetName = String(name || '').trim();
        if (!targetName) {
            worldbookPreview.value = null;
            worldbookPreviewStatus.value = '';
            return;
        }
        const requestName = targetName;
        worldbookPreviewStatus.value = '正在读取预览';
        try {
            const result = await options.requestHost('xb-tavern:get-worldbook-preview', {
                payload: {
                    name: requestName,
                    limit: worldbookPreviewVisibleLimit.value,
                },
            });
            if (requestSerial !== worldbookPreviewRequestSerial) {return;}
            if (String(selectedWorldbookName.value || '').trim() !== requestName) {return;}
            worldbookPreview.value = normalizeWorldbookPreview(result.result || result);
            worldbookPreviewStatus.value = '';
        } catch (error) {
            if (requestSerial !== worldbookPreviewRequestSerial) {return;}
            if (String(selectedWorldbookName.value || '').trim() !== requestName) {return;}
            if (!loadOptions.preserveExistingOnError) {
                worldbookPreview.value = null;
            }
            worldbookPreviewStatus.value = error instanceof Error ? error.message : String(error || '预览读取失败');
        }
    }
    function showMoreWorldbookPreviewEntries() {
        if (!selectedWorldbookName.value) {return;}
        worldbookPreviewVisibleLimit.value += WORLDBOOK_PREVIEW_BATCH_SIZE;
        void loadSelectedWorldbookPreview(selectedWorldbookName.value);
    }
    async function startWorldbookEntryEdit(entry: TavernWorldbookPreviewEntryRow) {
        const targetName = String(selectedWorldbookName.value || '').trim();
        const uid = entry?.uid === undefined || entry.uid === null ? '' : String(entry.uid).trim();
        if (!targetName || !uid) {return;}
        const requestKey = worldbookEntryEditKey(entry);
        if (worldbookEntryDirty.value && worldbookEntryEditingKey.value !== requestKey && !await confirmDiscardDraft('世界书条目', '切换')) {
            return;
        }
        if (worldbookEntryEditingKey.value !== requestKey) {
            worldbookEntrySaveRequestSerial += 1;
            resetWorldbookEntrySaveFeedback();
        }
        worldbookEntryEditingKey.value = requestKey;
        worldbookEntryLoadRequestSerial += 1;
        const requestToken = `${requestKey}:${worldbookEntryLoadRequestSerial}`;
        worldbookEntryLoadRequestKey = requestToken;
        worldbookEntryStatus.value = '正在读取条目';
        try {
            const result = await options.requestHost('xb-tavern:get-worldbook-entry', {
                payload: { name: targetName, uid },
            });
            if (String(selectedWorldbookName.value || '').trim() !== targetName) {return;}
            if (worldbookEntryEditingKey.value !== requestKey || worldbookEntryLoadRequestKey !== requestToken) {return;}
            applyWorldbookEntryDraft(result.result || result);
            worldbookEntryStatus.value = '';
        } catch (error) {
            if (worldbookEntryEditingKey.value !== requestKey || worldbookEntryLoadRequestKey !== requestToken) {return;}
            worldbookEntryStatus.value = error instanceof Error ? error.message : String(error || '条目读取失败');
        }
    }
    function cancelWorldbookEntryEdit() {
        worldbookEntrySaveRequestSerial += 1;
        worldbookEntryDraft.value = null;
        savedWorldbookEntryDraftJson.value = '';
        worldbookEntryEditingKey.value = '';
        worldbookEntryLoadRequestKey = '';
        worldbookEntryStatus.value = '';
        resetWorldbookEntrySaveFeedback();
    }
    function updateWorldbookEntryDraftPatch(patch: Partial<TavernWorldbookEntryDraft>) {
        if (!worldbookEntryDraft.value) {return;}
        const next = normalizeWorldbookEntryDraft({
            ...worldbookEntryDraft.value,
            ...patch,
        });
        worldbookEntryDraft.value = next;
        if (worldbookEntryStatus.value && worldbookEntryStatus.value !== '正在保存') {
            worldbookEntryStatus.value = '';
        }
    }
    async function saveWorldbookEntryDraft() {
        const draft = worldbookEntryDraft.value;
        const targetName = String(selectedWorldbookName.value || draft?.worldbookName || '').trim();
        if (!draft || !targetName || !draft.uid) {return;}
        if (worldbookEntrySaveFeedback.value.status === 'saving') {return;}
        if (!worldbookEntryDirty.value) {return;}
        const draftJsonAtRequest = snapshotNativeDraft(draft);
        const draftPayload = clonePromptJson(draft) as TavernWorldbookEntryDraft;
        const editingKeyAtRequest = String(worldbookEntryEditingKey.value || '').trim();
        const requestSerial = ++worldbookEntrySaveRequestSerial;
        beginWorldbookEntrySaveFeedback();
        worldbookEntryStatus.value = '';
        try {
            const result = await options.requestHost('xb-tavern:save-worldbook-entry', {
                payload: {
                    name: targetName,
                    uid: draftPayload.uid,
                    entryHash: draftPayload.entryHash,
                    draft: draftPayload,
                },
            });
            if (requestSerial !== worldbookEntrySaveRequestSerial) {return;}
            if (String(worldbookEntryEditingKey.value || '').trim() !== editingKeyAtRequest) {return;}
            const savedDraft = normalizeWorldbookEntryDraft(result.result || result);
            applyWorldbookEntryDraft(savedDraft, {
                replaceDraft: snapshotNativeDraft(worldbookEntryDraft.value) === draftJsonAtRequest,
            });
            patchWorldbookPreviewEntryFromDraft(savedDraft);
            worldbookEntryStatus.value = '';
            completeWorldbookEntrySaveFeedback({ ok: true });
            void loadSelectedWorldbookPreview(targetName, { preserveExistingOnError: true });
            refreshCurrentHostContext();
        } catch (error) {
            if (requestSerial !== worldbookEntrySaveRequestSerial) {return;}
            const message = error instanceof Error ? error.message : String(error || '保存失败');
            worldbookEntryStatus.value = message;
            completeWorldbookEntrySaveFeedback({ ok: false, error: message });
        }
    }
    async function refreshRegexFromHost() {
        if (regexDirty.value && !await confirmDiscardDraft('正则', '刷新')) {
            regexStatus.value = '';
            return;
        }
        const requestSerial = ++regexRefreshRequestSerial;
        const nativeCharacterId = String(options.regexNativeCharacterId.value || '').trim();
        regexStatus.value = '正在读取';
        try {
            const result = await options.requestHost('xb-tavern:list-regex-scripts', {
                payload: { nativeCharacterId },
            });
            if (requestSerial !== regexRefreshRequestSerial || nativeCharacterId !== String(options.regexNativeCharacterId.value || '').trim()) {return;}
            regexLoadedNativeCharacterId.value = nativeCharacterId;
            regexList.value = (result.result || result) as Record<string, unknown>;
            const current = regexScriptRows.value.find((row) => row.key === selectedRegexKey.value);
            applyActiveRegexScript(current || regexScriptRows.value[0] || null);
            regexStatus.value = '';
        } catch (error) {
            if (requestSerial !== regexRefreshRequestSerial || nativeCharacterId !== String(options.regexNativeCharacterId.value || '').trim()) {return;}
            regexStatus.value = error instanceof Error ? error.message : String(error || '读取失败');
        }
    }
    async function selectRegexScript(row: TavernRegexScriptRow) {
        if (regexDirty.value && !await confirmDiscardDraft('正则', '切换')) {
            return false;
        }
        if (selectedRegexKey.value !== row.key) {
            regexMutationRequestSerial += 1;
            resetRegexSaveFeedback();
        }
        applyActiveRegexScript(row);
        return true;
    }
    function discardRegexChanges() {
        regexMutationRequestSerial += 1;
        resetRegexSaveFeedback();
        applyActiveRegexScript(selectedRegexRow.value);
        regexStatus.value = '';
    }
    async function createRegexScript(group: TavernRegexGroupRow) {
        if (regexDirty.value && !await confirmDiscardDraft('正则', '新建')) {
            return false;
        }
        regexMutationRequestSerial += 1;
        resetRegexSaveFeedback();
        const draft = normalizeRegexDraft({
            scriptName: '新正则',
            findRegex: '',
            replaceString: '',
            trimStrings: [],
            placement: [],
            disabled: false,
            markdownOnly: false,
            promptOnly: false,
            runOnEdit: false,
            substituteRegex: 0,
            minDepth: null,
            maxDepth: null,
        });
        regexDraft.value = draft;
        activeRegexScriptJson.value = '';
        selectedRegexKey.value = `${group.scriptType}:new`;
        return true;
    }
    function updateRegexPatch(patch: Partial<TavernRegexScriptDraft>) {
        regexDraft.value = normalizeRegexDraft({
            ...regexDraft.value,
            ...patch,
        });
    }
    function toggleRegexPlacement(value: number, checked: boolean) {
        const current = new Set((regexDraft.value.placement || []).map((item) => Number(item)));
        if (checked) {
            current.add(value);
        } else {
            current.delete(value);
        }
        updateRegexPatch({ placement: [...current] });
    }
    async function saveCurrentRegexScript() {
        const scriptType = selectedRegexRow.value?.scriptType || Number(selectedRegexKey.value.split(':')[0]);
        if (!Number.isFinite(scriptType)) {return;}
        if (regexSaveFeedback.value.status === 'saving') {return;}
        if (!regexDirty.value) {
            return;
        }
        const regexDraftJsonAtRequest = snapshotNativeDraft(regexDraft.value);
        const scriptPayload = clonePromptJson(regexDraft.value) as TavernRegexScriptDraft;
        const selectedRegexKeyAtRequest = String(selectedRegexKey.value || '').trim();
        beginRegexSaveFeedback();
        regexStatus.value = '';
        const targetNativeCharacterId = regexDraftNativeCharacterId();
        const mutationSerial = ++regexMutationRequestSerial;
        try {
            const result = await options.requestHost('xb-tavern:save-regex-script', {
                payload: {
                    nativeCharacterId: targetNativeCharacterId,
                    scriptType,
                    script: scriptPayload,
                },
            });
            const payload = (result.result || result) as Record<string, unknown>;
            if (mutationSerial !== regexMutationRequestSerial) {return;}
            if (await refreshRegexAfterStaleMutation(targetNativeCharacterId)) {
                completeRegexSaveFeedback({ ok: true });
                return;
            }
            if (String(selectedRegexKey.value || '').trim() !== selectedRegexKeyAtRequest) {return;}
            regexLoadedNativeCharacterId.value = targetNativeCharacterId;
            regexList.value = payload;
            const savedId = String(payload.savedScriptId || scriptPayload.id || '');
            const savedType = Number(payload.savedScriptType ?? scriptType);
            const nextRow = regexScriptRows.value.find((row) => row.scriptType === savedType && savedId && row.script.id === savedId)
                || regexScriptRows.value.find((row) => row.script.scriptName === scriptPayload.scriptName)
                || regexScriptRows.value[0]
                || null;
            if (nextRow) {
                selectedRegexKey.value = nextRow.key;
                const normalizedSavedScript = normalizeRegexDraft(nextRow.script);
                activeRegexScriptJson.value = snapshotNativeDraft(normalizedSavedScript);
                if (snapshotNativeDraft(regexDraft.value) === regexDraftJsonAtRequest) {
                    applyActiveRegexScript(nextRow);
                } else {
                    regexDraft.value = normalizeRegexDraft({
                        ...regexDraft.value,
                        id: normalizedSavedScript.id,
                    });
                }
            }
            regexStatus.value = '';
            completeRegexSaveFeedback({ ok: true });
        } catch (error) {
            if (mutationSerial !== regexMutationRequestSerial) {return;}
            const message = error instanceof Error ? error.message : String(error || '保存失败');
            regexStatus.value = message;
            completeRegexSaveFeedback({ ok: false, error: message });
        }
    }
    async function deleteCurrentRegexScript() {
        const row = selectedRegexRow.value;
        if (row) {
            await deleteRegexScript(row);
            return;
        }
        const id = String(regexDraft.value.id || '');
        const scriptType = Number(selectedRegexKey.value.split(':')[0]);
        if (!id || !Number.isFinite(scriptType)) {return;}
        await deleteRegexScript({
            key: `${scriptType}:${id}`,
            groupKey: '',
            groupLabel: '',
            scriptType,
            script: regexDraft.value,
        });
    }
    async function deleteRegexScript(row: TavernRegexScriptRow) {
        if (regexDirty.value && selectedRegexKey.value !== row.key && !await confirmDiscardDraft('正则', '删除')) {
            return;
        }
        const id = String(row?.script.id || '');
        const scriptType = row?.scriptType;
        if (!id || !Number.isFinite(scriptType)) {return;}
        if (!await options.confirmDialog({
            title: '删除正则脚本',
            message: '删除这个正则脚本？',
            confirmText: '删除',
            tone: 'danger',
        })) {return;}
        regexStatus.value = '正在删除';
        const targetNativeCharacterId = regexDraftNativeCharacterId();
        const mutationSerial = ++regexMutationRequestSerial;
        try {
            const result = await options.requestHost('xb-tavern:delete-regex-script', {
                payload: { nativeCharacterId: targetNativeCharacterId, scriptType, id },
            });
            if (mutationSerial !== regexMutationRequestSerial) {return;}
            if (await refreshRegexAfterStaleMutation(targetNativeCharacterId)) {return;}
            regexLoadedNativeCharacterId.value = targetNativeCharacterId;
            regexList.value = (result.result || result) as Record<string, unknown>;
            applyActiveRegexScript(regexScriptRows.value[0] || null);
            regexStatus.value = '';
        } catch (error) {
            if (mutationSerial !== regexMutationRequestSerial) {return;}
            regexStatus.value = error instanceof Error ? error.message : String(error || '删除失败');
        }
    }
    function readDisplaySettingsFromHost(): TavernDisplaySettings {
        return normalizeTavernDisplaySettings(options.tavernDisplaySettings.value) as TavernDisplaySettings;
    }
    function syncDisplaySettingsFromHost(options: { updateCommitted?: boolean } = {}) {
        const normalized = readDisplaySettingsFromHost();
        displaySettings.value = normalized;
        if (options.updateCommitted !== false) {
            committedDisplaySettings.value = clonePromptJson(normalized) as TavernDisplaySettings;
        }
    }
    function applyDisplaySettingsLocally(next: TavernDisplaySettings) {
        displaySettings.value = next;
        options.tavernDisplaySettings.value = normalizeTavernDisplaySettings(next);
    }
    async function saveDisplaySettingsToHost(next: TavernDisplaySettings) {
        const requestSerial = ++baseSettingsSaveSerial;
        baseSettingsSaving.value = true;
        baseSettingsStatus.value = '正在保存显示设置';
        applyDisplaySettingsLocally(next);
        try {
            await options.requestHost('xb-tavern:save-display-settings', {
                payload: next,
            });
            if (requestSerial !== baseSettingsSaveSerial) {return;}
            committedDisplaySettings.value = clonePromptJson(readDisplaySettingsFromHost()) as TavernDisplaySettings;
            baseSettingsStatus.value = '显示设置已保存';
        } catch (error) {
            if (requestSerial !== baseSettingsSaveSerial) {return;}
            applyDisplaySettingsLocally(clonePromptJson(committedDisplaySettings.value) as TavernDisplaySettings);
            baseSettingsStatus.value = error instanceof Error ? error.message : String(error || '保存失败');
        } finally {
            if (requestSerial === baseSettingsSaveSerial) {
                baseSettingsSaving.value = false;
            }
        }
    }
    function updateDisplaySettingsPatch(patch: Partial<TavernDisplaySettings>) {
        const next = normalizeTavernDisplaySettings({
            ...displaySettings.value,
            ...patch,
        }) as TavernDisplaySettings;
        void saveDisplaySettingsToHost(next);
    }
    function stepHiddenOutsideCount(direction: -1 | 1) {
        const current = Number(displaySettings.value.hiddenOutsideCount) || 5;
        const next = Math.min(20, Math.max(1, current + direction));
        if (next === current) {return;}
        updateDisplaySettingsPatch({ hiddenOutsideCount: next });
    }
    function stepLoadBatchSize(direction: -1 | 1) {
        const current = Number(displaySettings.value.loadBatchSize) || 20;
        const next = Math.min(50, Math.max(1, current + direction));
        if (next === current) {return;}
        updateDisplaySettingsPatch({ loadBatchSize: next });
    }
    function applyTavernUsersPayload(payload: unknown) {
        const normalized = normalizeTavernUsersPayload(payload);
        tavernUsers.value = normalized.users;
        currentTavernUserId.value = normalized.currentUserId;
    }
    async function loadTavernUsers() {
        baseSettingsLoading.value = true;
        if (!switchingTavernUserId.value) {
            baseSettingsStatus.value = '正在读取 USER 列表';
        }
        try {
            const result = await options.requestHost('xb-tavern:list-users');
            applyTavernUsersPayload(result.result || result);
            if (!switchingTavernUserId.value) {
                baseSettingsStatus.value = '';
            }
        } catch (error) {
            baseSettingsStatus.value = error instanceof Error ? error.message : String(error || 'USER 列表读取失败');
        } finally {
            baseSettingsLoading.value = false;
        }
    }
    async function switchTavernUser(userId: string) {
        const targetId = String(userId || '').trim();
        if (!targetId || targetId === currentTavernUserId.value || switchingTavernUserId.value) {return;}
        switchingTavernUserId.value = targetId;
        baseSettingsStatus.value = '正在切换 USER';
        try {
            const result = await options.requestHost('xb-tavern:switch-user', {
                payload: { userId: targetId },
            });
            applyTavernUsersPayload(result.result || result);
            baseSettingsStatus.value = currentTavernUser.value
                ? `已切换到 ${currentTavernUser.value.name}`
                : 'USER 已切换';
            refreshCurrentHostContext();
        } catch (error) {
            baseSettingsStatus.value = error instanceof Error ? error.message : String(error || '切换失败');
        } finally {
            switchingTavernUserId.value = '';
        }
    }
    async function discardPresetChanges() {
        if (!presetDirty.value) {return;}
        preset.value = normalizeTavernChatPromptPresetBundle(activeChatPreset.value);
        savedPresetJson.value = snapshotPreset(activeChatPreset.value);
        presetStatus.value = '';
        resetPresetSaveFeedback();
    }
    function updateChatPresetComponent(
        key: 'promptManager' | 'systemPrompt' | 'contextTemplate' | 'instructTemplate',
        patch: Record<string, unknown>,
    ) {
        preset.value = normalizeTavernChatPromptPresetBundle({
            ...preset.value,
            [key]: {
                ...((preset.value[key] || {}) as Record<string, unknown>),
                ...patch,
            },
        });
    }
    function commitPromptManagerDraft(rawPreset: Record<string, unknown>, patch: Record<string, unknown> = {}) {
        const prompts = Array.isArray(rawPreset.prompts) ? rawPreset.prompts : [];
        const promptOrder = Array.isArray(rawPreset.prompt_order) ? rawPreset.prompt_order : [];
        updateChatPresetComponent('promptManager', {
            rawPreset,
            prompts,
            promptOrder,
            ...patch,
        });
    }
    function updatePromptByIdentifier(identifier: string, patch: Record<string, unknown>) {
        const targetId = String(identifier || '').trim();
        if (!targetId) {return;}
        const rawPreset = clonePromptJson(getRawPresetDraft());
        const prompts = getPromptArrayDraft().map((prompt) => ({ ...prompt }));
        const index = prompts.findIndex((prompt) => String(prompt.identifier || prompt.id || '').trim() === targetId);
        if (index >= 0) {
            prompts[index] = {
                ...prompts[index],
                ...patch,
                identifier: targetId,
            };
        } else {
            prompts.push({
                identifier: targetId,
                name: targetId,
                role: 'system',
                content: '',
                ...patch,
            });
        }
        rawPreset.prompts = prompts;
        commitPromptManagerDraft(rawPreset);
    }
    function setActivePromptOrder(nextOrder: Record<string, unknown>[]) {
        const rawPreset = clonePromptJson(getRawPresetDraft());
        const manager = getPromptManagerDraft();
        const containers = getPromptOrderContainersDraft().map((item) => ({ ...item }));
        const activeCharacterId = String(manager.activeCharacterId ?? '').trim();
        if (!activeCharacterId) {
            presetStatus.value = '未读取到当前角色顺序，请刷新后再保存';
            return;
        }
        let targetIndex = containers.findIndex((item) => String(item.character_id ?? '') === activeCharacterId);
        if (targetIndex < 0) {
            targetIndex = containers.length;
            containers.push({
                character_id: activeCharacterId,
                order: [],
            });
        }
        containers[targetIndex] = {
            ...containers[targetIndex],
            order: nextOrder,
        };
        rawPreset.prompt_order = containers;
        commitPromptManagerDraft(rawPreset, { activeOrder: nextOrder });
    }
    function buildCurrentPromptOrderFromRows(rows = promptEditorRows.value): Record<string, unknown>[] {
        return rows
            .filter((row) => row.listed)
            .map((row) => ({
                ...row.orderEntry,
                identifier: row.identifier,
                enabled: row.enabled,
            }));
    }
    function updatePromptOrderEntry(identifier: string, patch: Record<string, unknown>) {
        const targetId = String(identifier || '').trim();
        if (!canEditPromptOrder.value) {
            presetStatus.value = '未读取到当前角色顺序，请刷新后再保存';
            return;
        }
        if (!targetId) {return;}
        const rows = promptEditorRows.value;
        const nextOrder = buildCurrentPromptOrderFromRows(rows).map((entry) => (
            String(entry.identifier || '').trim() === targetId
                ? { ...entry, ...patch, identifier: targetId }
                : entry
        ));
        setActivePromptOrder(nextOrder);
    }
    function movePromptRow(identifier: string, direction: -1 | 1) {
        if (!canEditPromptOrder.value) {
            presetStatus.value = '未读取到当前角色顺序，请刷新后再保存';
            return;
        }
        const rows = promptEditorRows.value;
        const index = rows.findIndex((row) => row.identifier === identifier);
        const nextIndex = index + direction;
        if (index < 0 || nextIndex < 0 || nextIndex >= rows.length) {return;}
        const nextRows = rows.slice();
        const [item] = nextRows.splice(index, 1);
        if (!item) {return;}
        nextRows.splice(nextIndex, 0, item);
        setActivePromptOrder(buildCurrentPromptOrderFromRows(nextRows));
        selectedPromptIdentifier.value = identifier;
    }
    function togglePromptRow(identifier: string, enabled: boolean) {
        updatePromptOrderEntry(identifier, { enabled });
    }
    function promptRoleDisplay(role = ''): string {
        const labels: Record<string, string> = {
            system: '系统',
            user: '用户',
            assistant: '助手',
        };
        const key = String(role || 'system').trim();
        return labels[key] || key || '系统';
    }
    function linesFromList(value: unknown): string {
        if (Array.isArray(value)) {
            return value.map((item) => String(item || '').trim()).filter(Boolean).join('\n');
        }
        return String(value || '');
    }
    function listFromLines(value = ''): string[] {
        return String(value || '')
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter(Boolean);
    }
    function regexPlacementLabel(value: number): string {
        const labels: Record<number, string> = {
            1: '用户输入',
            2: 'AI 回复',
            3: '斜杠命令',
            5: '世界书',
            6: '推理内容',
        };
        return labels[value] || String(value);
    }
    function regexGroupByType(scriptType: number): TavernRegexGroupRow | undefined {
        return regexGroups.value.find((group) => group.scriptType === scriptType);
    }
    function regexDraftTypeLabel(): string {
        const scriptType = selectedRegexRow.value?.scriptType || Number(selectedRegexKey.value.split(':')[0]);
        return regexGroupByType(scriptType)?.label || '正则';
    }
    function updateAssistantPresetPatch(patch: Partial<TavernAssistantPreset>) {
        assistantPreset.value = {
            ...assistantPreset.value,
            ...patch,
        };
    }
    function selectAssistantPresetItem(itemId: string) {
        selectedAssistantPresetItemId.value = itemId;
    }
    function updateSelectedAssistantPresetItem(value = '') {
        const item = selectedAssistantPresetItem.value;
        if (!item) {return;}
        updateAssistantPresetPatch({ [item.key]: String(value || '') } as Partial<TavernAssistantPreset>);
    }
    async function selectAssistantPreset(presetId: string) {
        const targetId = String(presetId || '').trim();
        if (!targetId || targetId === activeAssistantPresetId.value) {return;}
        resetAssistantPresetSaveFeedback();
        if (assistantPresetDirty.value && !await confirmDiscardDraft('助手预设', '切换')) {
            return;
        }
        assistantPresetSaveRequestSerial += 1;
        const requestSerial = ++assistantPresetSelectRequestSerial;
        await setActiveTavernAssistantPresetId(targetId);
        if (requestSerial !== assistantPresetSelectRequestSerial) {return;}
        activeAssistantPresetId.value = targetId;
        const loadedPreset = await loadActiveTavernAssistantPreset();
        if (requestSerial !== assistantPresetSelectRequestSerial) {return;}
        applyActiveAssistantPreset(loadedPreset);
        assistantPresetStatus.value = '';
    }
    async function saveCurrentAssistantPreset() {
        if (assistantPresetSaveFeedback.value.status === 'saving') {
            return;
        }
        if (!assistantPresetDirty.value) {
            return;
        }
        beginAssistantPresetSaveFeedback();
        const requestSerial = ++assistantPresetSaveRequestSerial;
        assistantPresetSelectRequestSerial += 1;
        const savedDraftJsonAtRequest = snapshotAssistantPreset(assistantPreset.value);
        try {
            const savingBuiltIn = String(activeAssistantPresetRecord.value?.id || '') === DEFAULT_TAVERN_ASSISTANT_PRESET_ID;
            const presetForSave = savingBuiltIn
                ? {
                    ...assistantPreset.value,
                    id: `assistant-preset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    name: `${assistantPreset.value.name || '助手预设'} 自定义`,
                }
                : { ...assistantPreset.value };
            const record = await saveTavernAssistantPreset(presetForSave);
            if (requestSerial !== assistantPresetSaveRequestSerial) {return;}
            await setActiveTavernAssistantPresetId(record.id);
            if (requestSerial !== assistantPresetSaveRequestSerial) {return;}
            activeAssistantPresetId.value = record.id;
            const assistantDraftUnchanged = snapshotAssistantPreset(assistantPreset.value) === savedDraftJsonAtRequest;
            applyActiveAssistantPreset(record.preset, {
                replaceDraft: assistantDraftUnchanged,
            });
            if (!assistantDraftUnchanged && savingBuiltIn) {
                assistantPreset.value = normalizeTavernAssistantPreset({
                    ...assistantPreset.value,
                    id: record.id,
                });
            }
            assistantPresets.value = await listTavernAssistantPresets();
            if (requestSerial !== assistantPresetSaveRequestSerial) {return;}
            assistantPresetStatus.value = '';
            completeAssistantPresetSaveFeedback({ ok: true });
        } catch (error) {
            if (requestSerial !== assistantPresetSaveRequestSerial) {return;}
            completeAssistantPresetSaveFeedback({
                ok: false,
                error: error instanceof Error ? error.message : String(error || '保存失败'),
            });
        }
    }
    async function deriveAssistantPreset() {
        const record = await saveTavernAssistantPreset({
            ...assistantPreset.value,
            id: `assistant-preset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: `${assistantPreset.value.name || '助手预设'} 副本`,
        });
        await setActiveTavernAssistantPresetId(record.id);
        activeAssistantPresetId.value = record.id;
        applyActiveAssistantPreset(record.preset);
        assistantPresets.value = await listTavernAssistantPresets();
        assistantPresetStatus.value = '';
    }
    async function createAssistantPreset() {
        if (assistantPresetDirty.value && !await confirmDiscardDraft('助手预设', '新建')) {
            return;
        }
        const record = await saveTavernAssistantPreset({
            ...createDefaultTavernAssistantPreset(),
            id: `assistant-preset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: '新助手预设',
            description: '',
        });
        await setActiveTavernAssistantPresetId(record.id);
        activeAssistantPresetId.value = record.id;
        applyActiveAssistantPreset(record.preset);
        assistantPresets.value = await listTavernAssistantPresets();
        assistantPresetStatus.value = '';
    }
    async function importAssistantPreset(payload: unknown) {
        if (assistantPresetDirty.value && !await confirmDiscardDraft('助手预设', '导入')) {
            return false;
        }
        const source = payload && typeof payload === 'object'
            ? payload as Record<string, unknown>
            : {};
        const presetSource = source.preset && typeof source.preset === 'object'
            ? source.preset as Record<string, unknown>
            : source;
        const record = await saveTavernAssistantPreset({
            ...presetSource,
            id: `assistant-preset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: String(presetSource.name || source.name || '导入助手预设').trim() || '导入助手预设',
            description: String(presetSource.description || source.description || '').trim(),
        });
        await setActiveTavernAssistantPresetId(record.id);
        activeAssistantPresetId.value = record.id;
        applyActiveAssistantPreset(record.preset);
        assistantPresets.value = await listTavernAssistantPresets();
        assistantPresetStatus.value = '';
        return true;
    }
    async function deleteCurrentAssistantPreset() {
        const targetId = String(activeAssistantPresetId.value || assistantPreset.value.id || '').trim();
        const record = assistantPresets.value.find((item) => item.id === targetId) || null;
        if (!record || record.id === DEFAULT_TAVERN_ASSISTANT_PRESET_ID) {return;}
        if (assistantPresetDirty.value && !await confirmDiscardDraft('助手预设', '删除')) {
            return;
        }
        if (!await options.confirmDialog({
            title: '删除助手预设',
            message: `删除「${record.name || '当前助手预设'}」？`,
            confirmText: '删除',
            tone: 'danger',
        })) {return;}
        await deleteTavernAssistantPreset(record.id);
        assistantPresets.value = await listTavernAssistantPresets();
        activeAssistantPresetId.value = await getActiveTavernAssistantPresetId();
        applyActiveAssistantPreset(await loadActiveTavernAssistantPreset());
        assistantPresetStatus.value = '';
    }
    async function discardAssistantPresetChanges() {
        if (!assistantPresetDirty.value) {return;}
        assistantPreset.value = { ...activeAssistantPreset.value };
        savedAssistantPresetJson.value = snapshotAssistantPreset(activeAssistantPreset.value);
        assistantPresetStatus.value = '';
        resetAssistantPresetSaveFeedback();
    }
    function syncApiSettingsConfigFromAgentConfig() {
        apiSettingsPanelState.config = normalizeAgentConfig(options.agentConfig.value || {});
        apiSettingsPanelState.configDraft = null;
        apiSettingsPanelState.configFormSyncPending = true;
    }
    function beginApiConfigSave(requestId = '') {
        if (apiConfigSaveTimeout !== null) {
            window.clearTimeout(apiConfigSaveTimeout);
            apiConfigSaveTimeout = null;
        }
        if (apiConfigSaveResetTimer !== null) {
            window.clearTimeout(apiConfigSaveResetTimer);
            apiConfigSaveResetTimer = null;
        }
        apiConfigSave.value = { status: 'saving', requestId, error: '' };
        apiSettingsPanelState.configSave = apiConfigSave.value;
        apiConfigStatus.value = '正在保存共享 API 配置...';
        apiConfigSaveTimeout = window.setTimeout(() => {
            apiConfigSaveTimeout = null;
            if (apiConfigSave.value.requestId !== requestId || apiConfigSave.value.status !== 'saving') {return;}
            apiConfigSave.value = { status: 'error', requestId, error: '保存超时，请重试' };
            apiSettingsPanelState.configSave = apiConfigSave.value;
            apiConfigStatus.value = '保存失败：保存超时，请重试';
            apiConfigSaveResetTimer = window.setTimeout(() => {
                if (apiConfigSave.value.requestId !== requestId || apiConfigSave.value.status !== 'error') {return;}
                apiConfigSave.value = { status: 'idle', requestId: '', error: '' };
                apiSettingsPanelState.configSave = apiConfigSave.value;
                apiConfigStatus.value = '';
                void nextTick(renderApiSettingsPanel);
            }, 1800);
            void nextTick(renderApiSettingsPanel);
        }, API_CONFIG_SAVE_TIMEOUT_MS);
        void nextTick(renderApiSettingsPanel);
    }
    function completeApiConfigSave(requestId = '', result: { ok?: boolean; error?: string } = {}) {
        if (requestId && apiConfigSave.value.requestId && requestId !== apiConfigSave.value.requestId) {return;}
        if (apiConfigSaveTimeout !== null) {
            window.clearTimeout(apiConfigSaveTimeout);
            apiConfigSaveTimeout = null;
        }
        if (apiConfigSaveResetTimer !== null) {
            window.clearTimeout(apiConfigSaveResetTimer);
            apiConfigSaveResetTimer = null;
        }
        apiConfigSave.value = {
            status: result.ok ? 'success' : 'error',
            requestId,
            error: result.error || '',
        };
        apiSettingsPanelState.configSave = apiConfigSave.value;
        apiConfigStatus.value = result.ok ? '' : `保存失败：${result.error || 'unknown_error'}`;
        const completedStatus = apiConfigSave.value.status;
        apiConfigSaveResetTimer = window.setTimeout(() => {
            if (apiConfigSave.value.requestId !== requestId || apiConfigSave.value.status !== completedStatus) {return;}
            apiConfigSave.value = { status: 'idle', requestId: '', error: '' };
            apiSettingsPanelState.configSave = apiConfigSave.value;
            apiConfigStatus.value = '';
            void nextTick(renderApiSettingsPanel);
        }, 1800);
        void nextTick(renderApiSettingsPanel);
    }
    function handleApiConfigSave(payload: { requestId?: string; payload?: Record<string, unknown> }) {
        const requestId = String(payload.requestId || `save-config-${Date.now()}`);
        beginApiConfigSave(requestId);
        options.postToHost('xb-tavern:save-config', {
            requestId,
            payload: payload.payload || {},
        });
    }
    function renderApiSettingsPanel() {
        const root = apiSettingsRootRef.value;
        if (!root) {return;}
        if (!apiSettingsPanel) {
            apiSettingsPanel = createAgentSettingsPanel({
                state: apiSettingsPanelState,
                render: renderApiSettingsPanel,
                describeError: options.describeError,
                showToast: (message: string) => {
                    apiConfigStatus.value = String(message || '');
                },
                saveConfig: handleApiConfigSave,
                getRuntimeSummaryText: () => apiRuntimeLine.value,
            });
        }
        apiSettingsPanelState.configSave = apiConfigSave.value;
        // The settings panel markup is generated by our first-party shared config renderer.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = buildAgentSettingsPanelMarkup({
            configSave: apiConfigSave.value,
            runtimeText: apiRuntimeLine.value,
            inlineToastText: apiConfigStatus.value,
            showAssistantPermissions: false,
            showDelegateSettings: true,
            activePage: String(apiSettingsPanelState.configPage || 'main'),
            delegatePresetHint: '记忆整理会复用这里的分身 API；当前聊天仍使用主 API。',
            isBusy: options.isRunning.value,
            canDeletePreset: Object.keys((apiSettingsPanelState.config as Record<string, unknown>)?.presets || {}).length > 1,
        });
        apiSettingsPanel.syncConfigToForm(root);
        apiSettingsPanel.bindSettingsPanelEvents(root);
    }
    function handleApiConfigSaved(payload: Record<string, unknown>) {
        const ok = payload.ok === true;
        if (ok) {
            options.agentConfig.value = payload.config as Record<string, unknown> || options.agentConfig.value;
            syncApiSettingsConfigFromAgentConfig();
            completeApiConfigSave(String(payload.requestId || ''), { ok: true });
            return;
        }
        syncApiSettingsConfigFromAgentConfig();
        completeApiConfigSave(String(payload.requestId || ''), {
            ok: false,
            error: String(payload.error || '保存失败'),
        });
    }
    function applyHostChatPreset(payload: Record<string, unknown>) {
        if ('chatPreset' in payload) {
            applyActiveChatPreset(payload.chatPreset as Partial<TavernChatPromptPresetBundle>, {
                replaceDraft: !presetDirty.value,
            });
        }
        if ('chatPresetList' in payload) {
            chatPresetList.value = payload.chatPresetList as Record<string, unknown> || {};
        }
    }
    function openSettingsWorkspace(workspace: TavernSettingsWorkspaceKey) {
        options.activeSettingsWorkspace.value = workspace;
        options.activeView.value = 'settings';
    }
    function openWorldbookWorkspace(name = '') {
        const targetName = String(name || '').trim();
        selectedWorldbookName.value = targetName;
        openSettingsWorkspace('worldbooks');
    }
    async function syncWorldbooksForCurrentCharacter() {
        const requestSerial = ++worldbookSyncRequestSerial;
        const nativeCharacterId = String(options.currentNativeCharacterId.value || '').trim();
        let bindingStatus = '';
        selectedWorldbookName.value = '';
        if (!nativeCharacterId) {
            await syncWorldbooksFromHost({ requestSerial });
            return;
        }
        try {
            const result = await options.requestHost('xb-tavern:get-character-worldbook-state', {
                payload: { nativeCharacterId },
            });
            if (requestSerial !== worldbookSyncRequestSerial) {return;}
            const payload = (result.result || result) as Record<string, unknown>;
            const boundName = String(payload.boundWorldbookName || '').trim();
            if (boundName && payload.boundExists === true) {
                await syncWorldbooksFromHost({ preferredName: boundName, requestSerial });
                return;
            }
        } catch (error) {
            if (requestSerial !== worldbookSyncRequestSerial) {return;}
            bindingStatus = error instanceof Error ? error.message : String(error || '绑定状态读取失败');
        }
        await syncWorldbooksFromHost({ requestSerial });
        if (bindingStatus && requestSerial === worldbookSyncRequestSerial) {
            worldbookStatus.value = bindingStatus;
        }
    }
    function selectSettingsWorkspace(workspace: string) {
        const normalized = workspace as TavernSettingsWorkspaceKey;
        if (normalized === 'api'
            || normalized === 'characters'
            || normalized === 'chatPreset'
            || normalized === 'worldbooks'
            || normalized === 'regex'
            || normalized === 'assistantPreset'
            || normalized === 'base') {
            openSettingsWorkspace(normalized);
        }
    }

    watch(promptEditorRows, (rows) => {
        if (!rows.length) {
            selectedPromptIdentifier.value = '';
            return;
        }
        if (!rows.some((row) => row.identifier === selectedPromptIdentifier.value)) {
            selectedPromptIdentifier.value = rows[0]?.identifier || '';
        }
    }, { immediate: true });
    watch(chatPresetSourceSearchText, () => {
        chatPresetSourceVisibleLimit.value = CHAT_PRESET_SOURCE_BATCH_SIZE;
    });
    watch(assistantPresetSearchText, () => {
        assistantPresetVisibleLimit.value = ASSISTANT_PRESET_BATCH_SIZE;
    });
    watch(promptSearchText, () => {
        promptVisibleLimit.value = PROMPT_EDITOR_BATCH_SIZE;
    });
    watch(regexSearchText, () => {
        regexGroupVisibleLimits.value = {};
    });
    watch(() => options.tavernDisplaySettings.value, () => {
        syncDisplaySettingsFromHost({ updateCommitted: !baseSettingsSaving.value });
    }, { immediate: true });
    watch(assistantPresetItems, (items) => {
        if (!items.length) {
            selectedAssistantPresetItemId.value = '';
            return;
        }
        if (!items.some((item) => item.id === selectedAssistantPresetItemId.value)) {
            selectedAssistantPresetItemId.value = items[0]?.id || '';
        }
    }, { immediate: true });
    watch([
        () => options.activeSettingsWorkspace.value,
        () => options.activeView.value,
        () => String(options.regexNativeCharacterId.value || '').trim(),
        () => apiConfigSave.value.status,
        () => options.agentConfig.value,
        () => apiSettingsRootRef.value,
    ], ([workspace, view, nativeCharacterId], [previousWorkspace, previousView, previousNativeCharacterId]) => {
        if (apiSettingsRootRef.value) {
            void nextTick(renderApiSettingsPanel);
        }
        const regexWorkspaceActive = view === 'settings' && workspace === 'regex';
        const enteredRegexWorkspace = regexWorkspaceActive && (previousView !== view || previousWorkspace !== workspace);
        const regexCharacterChanged = regexWorkspaceActive && nativeCharacterId !== previousNativeCharacterId;
        if (regexWorkspaceActive && (enteredRegexWorkspace || regexCharacterChanged || !regexGroups.value.length)) {
            void refreshRegexFromHost();
        }
    });
    watch([options.activeView, options.activeSettingsWorkspace], ([view, workspace], [previousView, previousWorkspace]) => {
        if (
            view === 'settings'
            && workspace === 'chatPreset'
            && (previousView !== view || previousWorkspace !== workspace)
        ) {
            void syncChatPresetFromHost();
        }
        if (
            view === 'settings'
            && workspace === 'worldbooks'
            && (previousView !== view || previousWorkspace !== workspace)
        ) {
            void syncWorldbooksFromHost({ keepSelection: true });
            void syncGlobalWorldbooksFromHost();
        }
        if (
            view === 'settings'
            && workspace === 'assistantPreset'
            && (previousView !== view || previousWorkspace !== workspace)
        ) {
            void refreshPresets();
        }
        if (
            view === 'settings'
            && workspace === 'base'
            && (previousView !== view || previousWorkspace !== workspace)
        ) {
            void loadTavernUsers();
        }
    });
    watch(selectedWorldbookName, (name) => {
        if (options.activeSettingsWorkspace.value !== 'worldbooks') {return;}
        cancelWorldbookEntryEdit();
        worldbookPreviewVisibleLimit.value = WORLDBOOK_PREVIEW_BATCH_SIZE;
        void loadSelectedWorldbookPreview(name);
    });

    const settingsContext = {
        activeAssistantPresetId,
        activePromptOrderLabel,
        activeSettingsWorkspace: options.activeSettingsWorkspace,
        activeView: options.activeView,
        apiReady,
        apiReadyDetail,
        apiRuntimeLine,
        apiSettingsRootRef,
        applyActiveRegexScript,
        ASSISTANT_PRESET_BATCH_SIZE,
        assistantPreset,
        assistantPresetDirty,
        assistantPresetItems,
        assistantPresets,
        assistantPresetSearchText,
        assistantPresetSaveFeedback,
        assistantPresetStatus,
        assistantPresetVisibleLimit,
        canEditPromptOrder,
        cancelWorldbookEntryEdit,
        chatPresetOptions,
        chatPresetSourceSearchText,
        chatPresetSourceVisibleLimit,
        CHAT_PRESET_SOURCE_BATCH_SIZE,
        createAssistantPreset,
        createRegexScript,
        deleteCurrentAssistantPreset,
        deleteCurrentRegexScript,
        deleteRegexScript,
        deriveAssistantPreset,
        discardRegexChanges,
        discardAssistantPresetChanges,
        discardPresetChanges,
        expandRegexGroup,
        filteredPromptEditorRows,
        globalWorldbookOptions,
        globalWorldbookSelected,
        globalWorldbookSaving,
        globalWorldbookStatus,
        hiddenAssistantPresetCount,
        hiddenChatPresetOptionCount,
        hiddenPromptCount,
        hiddenWorldbookPreviewEntryCount,
        homeThemeDark: options.homeThemeDark,
        importAssistantPreset,
        isEditingWorldbookEntry,
        loadTavernUsers,
        linesFromList,
        listFromLines,
        movePromptRow,
        postToHost: options.postToHost,
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
        refreshPresets,
        refreshRegexFromHost,
        currentTavernUser,
        currentTavernUserId,
        displaySettings,
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
        saveCurrentAssistantPreset,
        saveCurrentPreset,
        saveCurrentRegexScript,
        saveGlobalWorldbooksToHost,
        saveWorldbookEntryDraft,
        selectAssistantPreset,
        selectAssistantPresetItem,
        selectChatPresetFromHost,
        selectedAssistantPresetItem,
        selectedPresetSourceId,
        selectedPromptIdentifier,
        selectedPromptRow,
        selectedRegexKey,
        selectedRegexRow,
        selectedWorldbook,
        selectedWorldbookName,
        selectRegexScript,
        selectSettingsWorkspace,
        settingsNavItems,
        shortText: options.shortText,
        showMoreWorldbookPreviewEntries,
        stepHiddenOutsideCount,
        stepLoadBatchSize,
        startWorldbookEntryEdit,
        switchingTavernUserId,
        syncChatPresetFromHost,
        syncGlobalWorldbooksFromHost,
        syncWorldbooksForCurrentCharacter,
        syncWorldbooksFromHost,
        switchTavernUser,
        tavernUsers,
        togglePromptRow,
        toggleGlobalWorldbook,
        toggleRegexPlacement,
        updateAssistantPresetPatch,
        updateDisplaySettingsPatch,
        updatePromptByIdentifier,
        updateRegexPatch,
        updateSelectedAssistantPresetItem,
        updateWorldbookEntryDraftPatch,
        baseSettingsLoading,
        baseSettingsSaving,
        baseSettingsStatus,
        visibleAssistantPresetRecords,
        visibleChatPresetOptions,
        visiblePromptEditorRows,
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
        worldbookPreviewVisibleLimit,
        worldbookStatus,
    };

    return {
        activeAssistantPreset,
        activeChatPreset,
        apiReady,
        apiReadyDetail,
        apiRuntimeLine,
        apiSettingsRootRef,
        applyHostChatPreset,
        handleApiConfigSaved,
        openSettingsWorkspace,
        openWorldbookWorkspace,
        loadTavernUsers,
        refreshPresets,
        refreshRegexFromHost,
        refreshRuntimeChatPresetFromHost,
        renderApiSettingsPanel,
        runtimeChatPreset,
        selectSettingsWorkspace,
        settingsContext,
        syncApiSettingsConfigFromAgentConfig,
        syncChatPresetFromHost,
        syncWorldbooksFromHost,
    };
}
