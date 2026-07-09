import {
    chat_metadata,
    characters,
    eventSource,
    getOneCharacter,
    name2,
    select_selected_character,
    setCharacterId,
    setCharacterName,
    extension_prompts,
    setExtensionPrompt,
    extension_prompt_types,
    this_chid,
    unshallowCharacter,
} from '../../../../../../../script.js';
import * as stScript from '../../../../../../../script.js';
import { NOTE_MODULE_NAME } from '../../../../../../authors-note.js';
import { getContext } from '../../../../../../extensions.js';
import { power_user } from '../../../../../../power-user.js';
import { getCharaFilename } from '../../../../../../utils.js';
import * as nativeWorldInfo from '../../../../../../world-info.js';
import {
    charUpdatePrimaryWorld,
    checkWorldInfo,
    convertCharacterBook,
    getWorldInfoSettings,
    loadWorldInfo,
    METADATA_KEY,
    saveWorldInfo,
    selected_world_info,
    updateWorldInfoList,
    world_names,
} from '../../../../../../world-info.js';
import {
    resolveXbTavernAuthorNoteState,
    type XbTavernContext,
    type XbTavernHistoryMessage,
    type XbTavernNativeWorldInfoRuntime,
    type XbTavernNativeWorldInfoSource,
    type XbTavernNativeWorldInfoTimedEffect,
    type XbTavernNativeWorldInfoTimedState,
    type XbTavernWorldEntry,
} from '../shared/message-assembler.js';

type TavernWorldbookSourceType = 'chat' | 'persona' | 'character' | 'global' | string;

interface TavernWorldbookSourceRow {
    name: string;
    globalActive: boolean;
}

interface TavernWorldbookSourceListResult {
    books: TavernWorldbookSourceRow[];
}

interface TavernWorldbookPreviewEntry {
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

interface TavernWorldbookPreviewResult {
    name: string;
    entryCount: number;
    enabledCount: number;
    constantCount: number;
    disabledCount: number;
    keywordCount: number;
    totalChars: number;
    entries: TavernWorldbookPreviewEntry[];
}

interface TavernWorldbookEntrySlot {
    key: string;
    index: number;
    entry: Record<string, unknown>;
}

interface TavernWorldbookEntryDraft {
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

interface TavernCharacterWorldbookState {
    nativeCharacterId: string;
    characterName: string;
    boundWorldbookName: string;
    boundExists: boolean;
    hasEmbeddedBook: boolean;
    embeddedBookName: string;
    worldbookOptions: string[];
}

interface TavernCharacterWorldbookActionResult {
    action: 'selected' | 'imported' | 'needs_selection' | 'needs_import_confirmation';
    name?: string;
    worldbookOptions?: string[];
    state: TavernCharacterWorldbookState;
}

interface TavernGlobalWorldbooksState {
    options: string[];
    selected: string[];
}

type TavernCharacterEditorControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface TavernJQueryCollection {
    data(key: string): unknown;
    data(key: string, value: unknown): TavernJQueryCollection;
    removeData(key: string): TavernJQueryCollection;
    each(callback: (this: Element, index: number, element: Element) => void): TavernJQueryCollection;
}

type TavernJQuery = (target: string | Element) => TavernJQueryCollection;

interface TavernCharacterEditorControlSnapshot {
    control: TavernCharacterEditorControl;
    value: string;
    checked?: boolean;
    selectedValues?: string[];
}

interface TavernCharacterEditorDataSnapshot {
    element: Element;
    key: string;
    value: unknown;
    hadValue: boolean;
}

interface TavernCharacterEditorSnapshot {
    actionType: string | null;
    controls: TavernCharacterEditorControlSnapshot[];
    jqueryData: TavernCharacterEditorDataSnapshot[];
}

type ExtensionPromptSnapshot = Record<string, Record<string, unknown>>;

interface TavernWorldbookRuntimeInput {
    context?: XbTavernContext;
    currentUserMessage?: string;
    trigger?: string;
    timedState?: XbTavernNativeWorldInfoTimedState;
    maxContext?: number;
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function getNativeMaxPromptTokens(): number {
    return Number(stScript.getMaxPromptTokens?.())
        || Number(stScript.getMaxContextSize?.())
        || Number(asRecord(getContext?.() || {}).maxContext)
        || 4096;
}

function applyGlobalWorldbookSelection(selected: string[]): void {
    const settings = nativeWorldInfo.getWorldInfoSettings();

    if (typeof nativeWorldInfo.updateWorldInfoSettings === 'function') {
        nativeWorldInfo.updateWorldInfoSettings(settings, selected);
        const worldInfo = asRecord(nativeWorldInfo.world_info);
        worldInfo.globalSelect = [...selected];
        stScript.saveSettingsDebounced?.();
        return;
    }

    replaceSelectedWorldInfo(selected);

    const worldInfo = asRecord(nativeWorldInfo.world_info);
    worldInfo.globalSelect = [...selected];

    stScript.saveSettingsDebounced?.();
}

function normalizeText(value: unknown = ''): string {
    return String(value || '').trim();
}

function normalizeIdText(value: unknown = ''): string {
    return value === null || value === undefined ? '' : String(value).trim();
}

function asEditableText(value: unknown = ''): string {
    return String(value ?? '');
}

function setValueByPath(target: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split('.').map((part) => part.trim()).filter(Boolean);
    if (!parts.length) {return;}
    let cursor = target;
    parts.slice(0, -1).forEach((part) => {
        const current = cursor[part];
        if (!current || typeof current !== 'object' || Array.isArray(current)) {
            cursor[part] = {};
        }
        cursor = cursor[part] as Record<string, unknown>;
    });
    cursor[parts[parts.length - 1]] = cloneJson(value);
}

function normalizeStringList(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.map((item) => normalizeText(item)).filter(Boolean);
    }
    const text = normalizeText(value);
    return text ? [text] : [];
}

function asRecordList(value: unknown): Record<string, unknown>[] {
    return Array.isArray(value)
        ? value.map((item) => asRecord(item)).filter((item) => Object.keys(item).length > 0)
        : [];
}

function addUniqueWorldbookName(names: string[], value: unknown): void {
    normalizeStringList(value).forEach((name) => {
        if (!names.includes(name)) {
            names.push(name);
        }
    });
}

function normalizeFiniteNumber(value: unknown, fallback: number): number {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
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

function entryExtensionValue(entry: Record<string, unknown>, extensionKey: string, entryKey: string): unknown {
    const extensions = asRecord(entry.extensions);
    return Object.prototype.hasOwnProperty.call(extensions, extensionKey) ? extensions[extensionKey] : entry[entryKey];
}

function normalizeWorldbookPosition(value: unknown): number {
    if (normalizeText(value) === 'after_char') {return 1;}
    if (normalizeText(value) === 'before_char') {return 0;}
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeWorldbookDepth(position: unknown, depth: unknown): number | null {
    return normalizeWorldbookPosition(position) === 4 ? normalizeNullableNumber(depth) ?? 4 : null;
}

function cloneJson<T>(value: T): T {
    try {
        return JSON.parse(JSON.stringify(value)) as T;
    } catch {
        return value;
    }
}

function captureExtensionPrompts(): ExtensionPromptSnapshot {
    return Object.fromEntries(
        Object.entries(extension_prompts || {}).map(([key, value]) => [key, { ...asRecord(value) }]),
    );
}

function restoreExtensionPrompts(snapshot: ExtensionPromptSnapshot): void {
    Object.keys(extension_prompts || {}).forEach((key) => {
        delete extension_prompts[key];
    });
    Object.entries(snapshot).forEach(([key, value]) => {
        extension_prompts[key] = { ...value };
    });
}

function readWorldbookEntries(data: unknown): Record<string, unknown>[] {
    const entries = asRecord(data).entries;
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {return [];}
    return Object.values(entries as Record<string, unknown>)
        .map((entry) => asRecord(entry))
        .filter((entry) => Object.keys(entry).length > 0);
}

function readWorldbookEntrySlots(data: unknown): TavernWorldbookEntrySlot[] {
    const entries = asRecord(data).entries;
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {return [];}
    return Object.entries(entries as Record<string, unknown>)
        .map(([key, entry], index) => ({
            key,
            index,
            entry: asRecord(entry),
        }))
        .filter((slot) => Object.keys(slot.entry).length > 0);
}

function stableStringify(value: unknown): string {
    if (value === undefined) {
        return 'undefined';
    }
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value) ?? String(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(',')}]`;
    }
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
        .join(',')}}`;
}

function hashString(value: string): string {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

function buildWorldbookEntryHash(entry: Record<string, unknown>): string {
    return hashString(stableStringify(entry));
}

function findWorldbookEntrySlot(data: unknown, uid: string): TavernWorldbookEntrySlot | null {
    const targetUid = normalizeIdText(uid);
    if (!targetUid) {return null;}
    return readWorldbookEntrySlots(data).find((slot) => (
        normalizeIdText(slot.entry.uid ?? slot.entry.id ?? slot.index) === targetUid
        || normalizeIdText(slot.key) === targetUid
    )) || null;
}

function buildWorldbookEntryDraft(name: string, slot: TavernWorldbookEntrySlot): TavernWorldbookEntryDraft {
    const entry = slot.entry;
    const entryHash = buildWorldbookEntryHash(entry);
    const keysecondary = normalizeStringList(entry.keysecondary).length
        ? normalizeStringList(entry.keysecondary)
        : normalizeStringList(entry.secondary_keys);
    const position = normalizeWorldbookPosition(entryExtensionValue(entry, 'position', 'position'));
    const vectorized = entryExtensionValue(entry, 'vectorized', 'vectorized') === true;
    const probability = normalizeNullableNumber(entryExtensionValue(entry, 'probability', 'probability'));
    return {
        worldbookName: name,
        uid: normalizeIdText(entry.uid ?? entry.id ?? slot.index),
        comment: asEditableText(entry.comment),
        key: normalizeStringList(entry.key),
        keysecondary,
        secondary_keys: keysecondary,
        content: asEditableText(entry.content),
        disable: entry.disable === true,
        enabled: entry.disable !== true,
        constant: entry.constant === true,
        vectorized,
        order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : 100,
        position,
        role: Math.floor(normalizeFiniteNumber(entryExtensionValue(entry, 'role', 'role'), 0)),
        depth: normalizeWorldbookDepth(position, entryExtensionValue(entry, 'depth', 'depth')),
        probability: probability ?? 100,
        useProbability: entryExtensionValue(entry, 'useProbability', 'useProbability') !== false && probability !== null,
        selective: entry.selective === true,
        selectiveLogic: Math.floor(normalizeFiniteNumber(entry.selectiveLogic, 0)),
        scanDepth: normalizeNullableNumber(entryExtensionValue(entry, 'scan_depth', 'scanDepth')),
        caseSensitive: normalizeTriStateBoolean(entryExtensionValue(entry, 'case_sensitive', 'caseSensitive')),
        matchWholeWords: normalizeTriStateBoolean(entryExtensionValue(entry, 'match_whole_words', 'matchWholeWords')),
        useGroupScoring: normalizeTriStateBoolean(entryExtensionValue(entry, 'use_group_scoring', 'useGroupScoring')),
        outletName: asEditableText(entryExtensionValue(entry, 'outlet_name', 'outletName')),
        automationId: asEditableText(entryExtensionValue(entry, 'automation_id', 'automationId')),
        ignoreBudget: entryExtensionValue(entry, 'ignore_budget', 'ignoreBudget') === true,
        excludeRecursion: entryExtensionValue(entry, 'exclude_recursion', 'excludeRecursion') === true,
        preventRecursion: entryExtensionValue(entry, 'prevent_recursion', 'preventRecursion') === true,
        delayUntilRecursion: normalizeDelayUntilRecursion(entryExtensionValue(entry, 'delay_until_recursion', 'delayUntilRecursion')),
        group: asEditableText(entryExtensionValue(entry, 'group', 'group')),
        groupOverride: entryExtensionValue(entry, 'group_override', 'groupOverride') === true,
        groupWeight: normalizeNullableNumber(entryExtensionValue(entry, 'group_weight', 'groupWeight')),
        sticky: normalizeNullableNumber(entryExtensionValue(entry, 'sticky', 'sticky')),
        cooldown: normalizeNullableNumber(entryExtensionValue(entry, 'cooldown', 'cooldown')),
        delay: normalizeNullableNumber(entryExtensionValue(entry, 'delay', 'delay')),
        triggers: normalizeStringList(entryExtensionValue(entry, 'triggers', 'triggers')),
        matchPersonaDescription: entryExtensionValue(entry, 'match_persona_description', 'matchPersonaDescription') === true,
        matchCharacterDescription: entryExtensionValue(entry, 'match_character_description', 'matchCharacterDescription') === true,
        matchCharacterPersonality: entryExtensionValue(entry, 'match_character_personality', 'matchCharacterPersonality') === true,
        matchCharacterDepthPrompt: entryExtensionValue(entry, 'match_character_depth_prompt', 'matchCharacterDepthPrompt') === true,
        matchScenario: entryExtensionValue(entry, 'match_scenario', 'matchScenario') === true,
        matchCreatorNotes: entryExtensionValue(entry, 'match_creator_notes', 'matchCreatorNotes') === true,
        entryHash,
        revision: entryHash,
    };
}

function patchWorldbookEntry(entry: Record<string, unknown>, draft: Record<string, unknown>): void {
    if ('comment' in draft) {entry.comment = asEditableText(draft.comment);}
    if ('key' in draft || 'keys' in draft) {
        entry.key = normalizeStringList(draft.key ?? draft.keys);
    }
    if ('keysecondary' in draft || 'secondaryKeys' in draft) {
        const keysecondary = normalizeStringList(draft.keysecondary);
        entry.keysecondary = keysecondary.length ? keysecondary : normalizeStringList(draft.secondary_keys ?? draft.secondaryKeys);
    }
    if ('secondary_keys' in entry && ('secondary_keys' in draft || 'secondaryKeys' in draft)) {
        const keysecondary = normalizeStringList(draft.keysecondary);
        entry.secondary_keys = keysecondary.length ? keysecondary : normalizeStringList(draft.secondary_keys ?? draft.secondaryKeys);
    }
    if ('content' in draft) {entry.content = asEditableText(draft.content);}
    if ('disable' in draft) {entry.disable = draft.disable === true;}
    if ('enabled' in draft && !('disable' in draft)) {entry.disable = draft.enabled === false;}
    if ('constant' in draft) {entry.constant = draft.constant === true;}
    if ('vectorized' in draft) {entry.vectorized = draft.vectorized === true;}
    if (entry.constant === true) {entry.vectorized = false;}
    if (entry.vectorized === true) {entry.constant = false;}
    if ('order' in draft) {
        const order = Number(draft.order);
        if (Number.isFinite(order)) {entry.order = order;}
    }
    if ('position' in draft) {entry.position = normalizeWorldbookPosition(draft.position);}
    if ('role' in draft) {entry.role = Math.floor(normalizeFiniteNumber(draft.role, 0));}
    if ('depth' in draft) {entry.depth = normalizeNullableNumber(draft.depth);}
    entry.depth = normalizeWorldbookDepth(entry.position, entry.depth);
    if ('probability' in draft) {entry.probability = normalizeNullableNumber(draft.probability);}
    if ('useProbability' in draft) {
        entry.useProbability = draft.useProbability === true;
        if (entry.useProbability === false) {
            entry.probability = null;
        } else if (normalizeNullableNumber(entry.probability) === null) {
            entry.probability = 100;
        }
    }
    if ('selective' in draft) {entry.selective = draft.selective === true;}
    if ('selectiveLogic' in draft) {entry.selectiveLogic = Math.floor(normalizeFiniteNumber(draft.selectiveLogic, 0));}
    if ('scanDepth' in draft) {entry.scanDepth = normalizeNullableNumber(draft.scanDepth);}
    if ('caseSensitive' in draft) {entry.caseSensitive = normalizeTriStateBoolean(draft.caseSensitive);}
    if ('matchWholeWords' in draft) {entry.matchWholeWords = normalizeTriStateBoolean(draft.matchWholeWords);}
    if ('useGroupScoring' in draft) {entry.useGroupScoring = normalizeTriStateBoolean(draft.useGroupScoring);}
    if ('outletName' in draft) {entry.outletName = asEditableText(draft.outletName);}
    if ('automationId' in draft) {entry.automationId = asEditableText(draft.automationId);}
    if ('ignoreBudget' in draft) {entry.ignoreBudget = draft.ignoreBudget === true;}
    if ('excludeRecursion' in draft) {entry.excludeRecursion = draft.excludeRecursion === true;}
    if ('preventRecursion' in draft) {entry.preventRecursion = draft.preventRecursion === true;}
    if ('delayUntilRecursion' in draft) {entry.delayUntilRecursion = normalizeDelayUntilRecursion(draft.delayUntilRecursion);}
    if ('group' in draft) {entry.group = asEditableText(draft.group);}
    if ('groupOverride' in draft) {entry.groupOverride = draft.groupOverride === true;}
    if ('groupWeight' in draft) {entry.groupWeight = normalizeNullableNumber(draft.groupWeight);}
    if ('sticky' in draft) {entry.sticky = normalizeNullableNumber(draft.sticky);}
    if ('cooldown' in draft) {entry.cooldown = normalizeNullableNumber(draft.cooldown);}
    if ('delay' in draft) {entry.delay = normalizeNullableNumber(draft.delay);}
    if ('triggers' in draft) {entry.triggers = normalizeStringList(draft.triggers);}
    if ('matchPersonaDescription' in draft) {entry.matchPersonaDescription = draft.matchPersonaDescription === true;}
    if ('matchCharacterDescription' in draft) {entry.matchCharacterDescription = draft.matchCharacterDescription === true;}
    if ('matchCharacterPersonality' in draft) {entry.matchCharacterPersonality = draft.matchCharacterPersonality === true;}
    if ('matchCharacterDepthPrompt' in draft) {entry.matchCharacterDepthPrompt = draft.matchCharacterDepthPrompt === true;}
    if ('matchScenario' in draft) {entry.matchScenario = draft.matchScenario === true;}
    if ('matchCreatorNotes' in draft) {entry.matchCreatorNotes = draft.matchCreatorNotes === true;}
}

function syncWorldbookOriginalDataEntry(
    data: Record<string, unknown>,
    uid: string,
    entry: Record<string, unknown>,
): void {
    const originalData = asRecord(data.originalData);
    const originalEntries = Array.isArray(originalData.entries) ? originalData.entries : [];
    if (!originalEntries.length) {return;}
    const originalEntry = originalEntries
        .map((item) => asRecord(item))
        .find((item) => normalizeIdText(item.uid) === uid || normalizeIdText(item.id) === uid);
    if (!originalEntry) {return;}
    const mappings: Array<[string, unknown]> = [
        ['comment', entry.comment],
        ['content', entry.content],
        ['keys', normalizeStringList(entry.key)],
        ['secondary_keys', normalizeStringList(entry.keysecondary)],
        ['insertion_order', Number.isFinite(Number(entry.order)) ? Number(entry.order) : 100],
        ['constant', entry.constant === true],
        ['enabled', entry.disable !== true],
        ['selective', entry.selective === true],
        ['selectiveLogic', Math.floor(normalizeFiniteNumber(entry.selectiveLogic, 0))],
        ['position', normalizeWorldbookPosition(entry.position) === 0 ? 'before_char' : 'after_char'],
        ['extensions.position', normalizeWorldbookPosition(entry.position)],
        ['extensions.role', Math.floor(normalizeFiniteNumber(entry.role, 0))],
        ['extensions.depth', normalizeWorldbookDepth(entry.position, entry.depth)],
        ['extensions.probability', entry.useProbability === false ? null : normalizeNullableNumber(entry.probability) ?? 100],
        ['extensions.useProbability', entry.useProbability !== false],
        ['extensions.vectorized', entry.vectorized === true],
        ['extensions.scan_depth', normalizeNullableNumber(entry.scanDepth)],
        ['extensions.case_sensitive', normalizeTriStateBoolean(entry.caseSensitive)],
        ['extensions.match_whole_words', normalizeTriStateBoolean(entry.matchWholeWords)],
        ['extensions.use_group_scoring', normalizeTriStateBoolean(entry.useGroupScoring)],
        ['extensions.outlet_name', asEditableText(entry.outletName)],
        ['extensions.automation_id', asEditableText(entry.automationId)],
        ['extensions.ignore_budget', entry.ignoreBudget === true],
        ['extensions.exclude_recursion', entry.excludeRecursion === true],
        ['extensions.prevent_recursion', entry.preventRecursion === true],
        ['extensions.delay_until_recursion', normalizeDelayUntilRecursion(entry.delayUntilRecursion)],
        ['extensions.group', asEditableText(entry.group)],
        ['extensions.group_override', entry.groupOverride === true],
        ['extensions.group_weight', normalizeNullableNumber(entry.groupWeight)],
        ['extensions.sticky', normalizeNullableNumber(entry.sticky)],
        ['extensions.cooldown', normalizeNullableNumber(entry.cooldown)],
        ['extensions.delay', normalizeNullableNumber(entry.delay)],
        ['extensions.triggers', normalizeStringList(entry.triggers)],
        ['extensions.match_persona_description', entry.matchPersonaDescription === true],
        ['extensions.match_character_description', entry.matchCharacterDescription === true],
        ['extensions.match_character_personality', entry.matchCharacterPersonality === true],
        ['extensions.match_character_depth_prompt', entry.matchCharacterDepthPrompt === true],
        ['extensions.match_scenario', entry.matchScenario === true],
        ['extensions.match_creator_notes', entry.matchCreatorNotes === true],
    ];
    mappings.forEach(([path, value]) => setValueByPath(originalEntry, path, value));
}

function previewEntryName(entry: Record<string, unknown>, index: number): string {
    return normalizeText(entry.comment)
        || `条目 ${index + 1}`;
}

function readHistoryMessages(context: XbTavernContext = {}): XbTavernHistoryMessage[] {
    return Array.isArray(context.history) ? context.history : [];
}

function ensureTimedBucket(value: unknown): Record<string, XbTavernNativeWorldInfoTimedEffect> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {return {};}
    const result: Record<string, XbTavernNativeWorldInfoTimedEffect> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
        if (!key || !item || typeof item !== 'object' || Array.isArray(item)) {return;}
        const source = item as Record<string, unknown>;
        const normalized: XbTavernNativeWorldInfoTimedEffect = {};
        const hash = Number(source.hash);
        const start = Number(source.start);
        const end = Number(source.end);
        if (Number.isFinite(hash)) {normalized.hash = hash;}
        if (Number.isFinite(start)) {normalized.start = start;}
        if (Number.isFinite(end)) {normalized.end = end;}
        if (source.protected === true) {normalized.protected = true;}
        if (Object.keys(normalized).length) {
            result[key] = normalized;
        }
    });
    return result;
}

function normalizeTimedState(value: unknown): XbTavernNativeWorldInfoTimedState {
    const source = asRecord(value);
    return {
        sticky: ensureTimedBucket(source.sticky),
        cooldown: ensureTimedBucket(source.cooldown),
    };
}

function valuesToRecordList(value: unknown): Record<string, unknown>[] {
    if (!value || typeof value !== 'object') {return [];}
    const maybeValues = (value as { values?: () => Iterable<unknown> }).values;
    if (typeof maybeValues !== 'function') {return [];}
    return Array.from(maybeValues.call(value))
        .map((entry) => asRecord(entry))
        .filter((entry) => Object.keys(entry).length > 0);
}

function replaceSelectedWorldInfo(names: string[] = []): void {
    if (!Array.isArray(selected_world_info)) {return;}
    selected_world_info.splice(0, selected_world_info.length, ...names);
}

function liveSelectedGlobalWorldbookNames(): string[] {
    return Array.isArray(selected_world_info)
        ? selected_world_info.map((name) => normalizeText(name)).filter(Boolean)
        : [];
}

function liveCharacterWorldbookNames(context: XbTavernContext = {}): Set<string> | null {
    const nativeCharacterId = normalizeIdText(context.character?.nativeCharacterId);
    const character = nativeCharacterId ? getCharacterRecordById(nativeCharacterId) : {};
    if (!Object.keys(character).length) {return null;}
    if (character.shallow === true || !normalizeText(character.json_data)) {return null;}

    const data = readCharacterData(character);
    const extensions = asRecord(data.extensions);
    const characterBook = readCharacterBook(character);
    const names: string[] = [];
    addUniqueWorldbookName(names, extensions.world);
    addUniqueWorldbookName(names, character.world);
    if (!hasCharacterBookEntries(characterBook)) {
        addUniqueWorldbookName(names, characterBook.name);
    }

    const characterLoreIds: string[] = [];
    addUniqueWorldbookName(characterLoreIds, character.avatar);
    addUniqueWorldbookName(characterLoreIds, data.avatar);
    try {
        addUniqueWorldbookName(characterLoreIds, getCharaFilename(nativeCharacterId));
    } catch {}
    const characterLoreIdSet = new Set(characterLoreIds);
    asRecordList(asRecord(nativeWorldInfo.world_info).charLore).forEach((entry) => {
        if (characterLoreIdSet.has(normalizeText(entry.name))) {
            addUniqueWorldbookName(names, entry.extraBooks);
        }
    });

    return new Set(names);
}

function dedupeSources(sources: XbTavernNativeWorldInfoSource[] = []): XbTavernNativeWorldInfoSource[] {
    const seen = new Set<string>();
    const result: XbTavernNativeWorldInfoSource[] = [];
    sources.forEach((source, index) => {
        const name = normalizeText(source.name);
        if (!name || seen.has(name)) {return;}
        seen.add(name);
        result.push({
            name,
            ...(source.sourceType ? { sourceType: source.sourceType } : {}),
            ...(Number.isFinite(Number(source.sourceIndex)) ? { sourceIndex: Number(source.sourceIndex) } : { sourceIndex: index }),
        });
    });
    return result;
}

function isLittleWhiteBoxRuntimeWorldbookSource(source?: XbTavernNativeWorldInfoSource): boolean {
    const sourceType = normalizeText(source?.sourceType);
    return sourceType === 'character' || sourceType === 'global';
}

function collectRuntimeSources(context: XbTavernContext = {}): XbTavernNativeWorldInfoSource[] {
    const sessionMeta = asRecord(context.sessionMeta);
    const liveGlobalNames = new Set(liveSelectedGlobalWorldbookNames());
    const liveCharacterNames = liveCharacterWorldbookNames(context);
    const liveGlobalSources = Array.from(liveGlobalNames).map((name, index) => ({
        name,
        sourceType: 'global',
        sourceIndex: index,
    } as XbTavernNativeWorldInfoSource));
    const liveCharacterSources = liveCharacterNames === null
        ? []
        : Array.from(liveCharacterNames)
            .filter((name) => !liveGlobalNames.has(name))
            .map((name, index) => ({
                name,
                sourceType: 'character',
                sourceIndex: index,
            } as XbTavernNativeWorldInfoSource));
    const keepLiveRuntimeSource = (source: XbTavernNativeWorldInfoSource): boolean => (
        (source.sourceType !== 'global' || liveGlobalNames.has(source.name))
        && (source.sourceType !== 'character' || liveCharacterNames === null || liveCharacterNames.has(source.name))
    );
    const metaSources = Array.isArray(sessionMeta.worldbookSources)
        ? sessionMeta.worldbookSources.map((source, index) => {
            const record = asRecord(source);
            return {
                name: normalizeText(record.name),
                sourceType: normalizeText(record.sourceType) as TavernWorldbookSourceType,
                sourceIndex: Number.isFinite(Number(record.sourceIndex)) ? Number(record.sourceIndex) : index,
            } as XbTavernNativeWorldInfoSource;
        })
        : [];
    const legacyMetaSources = !metaSources.length && Array.isArray(sessionMeta.worldbookNames)
        ? sessionMeta.worldbookNames.map((name, index) => ({
            name: normalizeText(name),
            sourceType: 'global',
            sourceIndex: index,
        } as XbTavernNativeWorldInfoSource))
        : [];
    const bookSources = Array.isArray(context.worldBooks)
        ? context.worldBooks.map((book, index) => ({
            name: normalizeText(book.name),
            sourceType: normalizeText(book.worldSourceType) as TavernWorldbookSourceType,
            sourceIndex: Number.isFinite(Number(book.worldSourceIndex)) ? Number(book.worldSourceIndex) : index,
        }))
        : [];
    return dedupeSources(
        [...liveGlobalSources, ...liveCharacterSources, ...metaSources, ...legacyMetaSources, ...bookSources]
            .filter(isLittleWhiteBoxRuntimeWorldbookSource)
            .filter(keepLiveRuntimeSource),
    );
}

function buildHistoryScanLines(context: XbTavernContext = {}, currentUserMessage = '', includeNames = false): string[] {
    const userName = normalizeText(context.user?.name) || 'User';
    const characterName = normalizeText(context.character?.name) || 'Assistant';
    const lines = readHistoryMessages(context)
        .filter((message) => ['user', 'assistant'].includes(normalizeText(message.role)))
        .map((message) => {
            const role = normalizeText(message.role) === 'user' || message.is_user === true ? 'user' : 'assistant';
            const content = normalizeText(message.content || message.mes || message.message);
            if (!content) {return '';}
            if (!includeNames) {return content;}
            const speaker = role === 'user'
                ? (normalizeText(message.name) || userName)
                : (normalizeText(message.name) || characterName);
            return `${speaker}: ${content}`;
        })
        .filter(Boolean);
    const current = normalizeText(currentUserMessage);
    if (current) {
        lines.push(includeNames ? `${userName}: ${current}` : current);
    }
    return lines.reverse();
}

function buildExplicitScanLines(scanText = ''): string[] {
    return String(scanText || '')
        .split(/\r?\n/)
        .map((line) => normalizeText(line))
        .filter(Boolean)
        .reverse();
}

function buildGlobalScanData(input: TavernWorldbookRuntimeInput = {}): Record<string, unknown> {
    const context = input.context || {};
    const character = context.character || {};
    const characterRecord = asRecord(character);
    const user = context.user || {};
    const data = asRecord(character.data);
    const extensions = asRecord(data.extensions);
    const depthPrompt = asRecord(extensions.depth_prompt);
    const legacyDepthPrompt = asRecord(data.depth_prompt);
    return {
        personaDescription: normalizeText(user.persona || user.description),
        characterDescription: normalizeText(character.description || data.description),
        characterPersonality: normalizeText(character.personality || data.personality),
        characterDepthPrompt: normalizeText(
            characterRecord.characterDepthPrompt
            || characterRecord.character_depth_prompt
            || depthPrompt.prompt
            || data.character_depth_prompt
            || legacyDepthPrompt.prompt
            || data.depth_prompt,
        ),
        scenario: normalizeText(character.scenario || data.scenario),
        creatorNotes: normalizeText(character.creatorNotes || character.creator_notes || data.creator_notes),
        trigger: normalizeText(input.trigger || context.worldSettings?.trigger) || 'normal',
    };
}

function describeActivationReason(entry: Record<string, unknown>): string {
    if (entry.constant === true) {return 'constant';}
    return 'native';
}

function normalizePromptEntryRole(value: unknown): number {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {return numeric;}
    return 0;
}

function buildActivatedPromptEntries(
    entries: Record<string, unknown>[],
    sources: XbTavernNativeWorldInfoSource[],
): XbTavernWorldEntry[] {
    const sourceByName = new Map(sources.map((source) => [normalizeText(source.name), source]));
    return entries.map((entry, index) => {
        const sourceWorldBook = normalizeText(entry.world || entry.sourceWorldBook);
        const source = sourceByName.get(sourceWorldBook);
        const uid = entry.uid ?? entry.id ?? index;
        return {
            uid,
            id: uid,
            key: normalizeStringList(entry.key),
            keysecondary: normalizeStringList(entry.keysecondary),
            secondary_keys: normalizeStringList(entry.secondary_keys),
            comment: normalizeText(entry.comment),
            title: normalizeText(entry.title),
            name: normalizeText(entry.name),
            content: normalizeText(entry.content),
            order: Number(entry.order ?? 100),
            position: Number(entry.position ?? 0),
            role: normalizePromptEntryRole(entry.role),
            depth: Number.isFinite(Number(entry.depth)) ? Number(entry.depth) : 0,
            constant: entry.constant === true,
            disable: entry.disable === true,
            enabled: entry.disable !== true,
            vectorized: entry.vectorized === true,
            decorators: Array.isArray(entry.decorators) ? cloneJson(entry.decorators) : [],
            selective: entry.selective === true,
            selectiveLogic: Number.isFinite(Number(entry.selectiveLogic)) ? Number(entry.selectiveLogic) : 0,
            scanDepth: Number.isFinite(Number(entry.scanDepth)) ? Number(entry.scanDepth) : null,
            caseSensitive: normalizeTriStateBoolean(entry.caseSensitive) ?? undefined,
            matchWholeWords: normalizeTriStateBoolean(entry.matchWholeWords) ?? undefined,
            ignoreBudget: entry.ignoreBudget === true,
            excludeRecursion: entry.excludeRecursion === true,
            preventRecursion: entry.preventRecursion === true,
            delayUntilRecursion: entry.delayUntilRecursion as boolean | number,
            characterFilter: cloneJson(entry.characterFilter),
            group: normalizeText(entry.group),
            groupOverride: entry.groupOverride === true,
            groupWeight: Number.isFinite(Number(entry.groupWeight)) ? Number(entry.groupWeight) : undefined,
            useGroupScoring: typeof entry.useGroupScoring === 'boolean' ? entry.useGroupScoring : null,
            matchPersonaDescription: entry.matchPersonaDescription === true,
            matchCharacterDescription: entry.matchCharacterDescription === true,
            matchCharacterPersonality: entry.matchCharacterPersonality === true,
            matchCharacterDepthPrompt: entry.matchCharacterDepthPrompt === true,
            matchScenario: entry.matchScenario === true,
            matchCreatorNotes: entry.matchCreatorNotes === true,
            probability: Number.isFinite(Number(entry.probability)) ? Number(entry.probability) : undefined,
            useProbability: entry.useProbability !== false,
            sticky: entry.sticky as boolean | number,
            cooldown: Number.isFinite(Number(entry.cooldown)) ? Number(entry.cooldown) : undefined,
            delay: Number.isFinite(Number(entry.delay)) ? Number(entry.delay) : undefined,
            triggers: normalizeStringList(entry.triggers),
            outletName: normalizeText(entry.outletName),
            sourceWorldBook,
            worldSourceType: source?.sourceType,
            worldSourceIndex: source?.sourceIndex,
            extensions: {
                nativeActivationReason: describeActivationReason(entry),
            },
            activationReason: describeActivationReason(entry),
        } as XbTavernWorldEntry;
    }).filter((entry) => !!normalizeText(entry.content));
}

function captureRuntimeState(): {
    selectedWorldInfo: string[];
    chatLore: string;
    personaLore: string;
    nativeCharacterId: string;
    characterName: string;
    timedState: XbTavernNativeWorldInfoTimedState;
    extensionPrompts: ExtensionPromptSnapshot;
    emit: unknown;
} {
    return {
        selectedWorldInfo: Array.isArray(selected_world_info) ? [...selected_world_info] : [],
        chatLore: normalizeText(chat_metadata?.[METADATA_KEY]),
        personaLore: normalizeText(power_user?.persona_description_lorebook),
        // Only capture ST's current native character pointer so temporary native switches can be restored.
        nativeCharacterId: normalizeText(this_chid),
        characterName: normalizeText(name2),
        timedState: normalizeTimedState(chat_metadata?.timedWorldInfo),
        extensionPrompts: captureExtensionPrompts(),
        emit: eventSource?.emit,
    };
}

function applyRuntimeState(input: {
    context: XbTavernContext;
    sources: XbTavernNativeWorldInfoSource[];
    timedState: XbTavernNativeWorldInfoTimedState;
}): void {
    const globalNames = input.sources
        .filter((source) => source.sourceType === 'global')
        .map((source) => normalizeText(source.name))
        .filter(Boolean);
    replaceSelectedWorldInfo(globalNames);
    const chatLore = input.sources.find((source) => source.sourceType === 'chat')?.name || '';
    const personaLore = input.sources.find((source) => source.sourceType === 'persona')?.name || '';
    if (chatLore) {
        chat_metadata[METADATA_KEY] = chatLore;
    } else {
        delete chat_metadata[METADATA_KEY];
    }
    power_user.persona_description_lorebook = personaLore || '';
    setCharacterId(normalizeText(input.context.character?.nativeCharacterId) || undefined);
    if (normalizeText(input.context.character?.name)) {
        setCharacterName(normalizeText(input.context.character?.name));
    }
    chat_metadata.timedWorldInfo = cloneJson(normalizeTimedState(input.timedState));
    if (eventSource && typeof eventSource.emit === 'function') {
        eventSource.emit = async () => undefined;
    }
}

function applyAuthorNoteInjectScanPrompt(context: XbTavernContext = {}, currentUserMessage = ''): void {
    const state = resolveXbTavernAuthorNoteState(context, currentUserMessage);
    setExtensionPrompt(
        NOTE_MODULE_NAME,
        state.shouldAddPrompt ? state.prompt : '',
        state.shouldAddPrompt ? state.position : Number(extension_prompt_types.NONE),
        state.depth,
        state.shouldAddPrompt && state.scan,
        state.role,
    );
}

function restoreRuntimeState(snapshot: ReturnType<typeof captureRuntimeState>): void {
    replaceSelectedWorldInfo(snapshot.selectedWorldInfo);
    if (snapshot.chatLore) {
        chat_metadata[METADATA_KEY] = snapshot.chatLore;
    } else {
        delete chat_metadata[METADATA_KEY];
    }
    power_user.persona_description_lorebook = snapshot.personaLore || '';
    setCharacterId(snapshot.nativeCharacterId || undefined);
    setCharacterName(snapshot.characterName || '');
    chat_metadata.timedWorldInfo = cloneJson(snapshot.timedState);
    restoreExtensionPrompts(snapshot.extensionPrompts);
    if (eventSource) {
        eventSource.emit = snapshot.emit as typeof eventSource.emit;
    }
}

let tavernWorldbookStateQueue: Promise<void> = Promise.resolve();

async function runTavernWorldbookStateExclusive<T>(task: () => Promise<T>): Promise<T> {
    const previous = tavernWorldbookStateQueue;
    let release = () => {};
    tavernWorldbookStateQueue = new Promise<void>((resolve) => {
        release = resolve;
    });
    await previous;
    try {
        return await task();
    } finally {
        release();
    }
}

function getCharacterRecordById(nativeCharacterId: string): Record<string, unknown> {
    const normalizedId = normalizeIdText(nativeCharacterId);
    const numericId = Number(normalizedId);
    if (!normalizedId || !Number.isInteger(numericId) || numericId < 0) {return {};}
    const list = Array.isArray(characters) ? characters : [];
    return asRecord(list[numericId]);
}

async function hydrateCharacterRecordById(nativeCharacterId: string): Promise<Record<string, unknown>> {
    const normalizedId = normalizeIdText(nativeCharacterId);
    const numericId = Number(normalizedId);
    if (!Number.isInteger(numericId) || numericId < 0) {return {};}
    const character = getCharacterRecordById(normalizedId);
    const avatar = normalizeText(character.avatar);
    if (avatar && avatar !== 'none' && (character.shallow === true || !normalizeText(character.json_data))) {
        if (character.shallow === true) {
            await unshallowCharacter(String(numericId));
        } else {
            await getOneCharacter(avatar);
        }
    }
    return getCharacterRecordById(normalizedId);
}

async function prepareCharacterEditorForWorldbookBinding(nativeCharacterId: string): Promise<void> {
    const normalizedId = normalizeIdText(nativeCharacterId);
    const numericId = Number(normalizedId);
    if (!Number.isInteger(numericId) || numericId < 0 || !Object.keys(getCharacterRecordById(normalizedId)).length) {
        throw new Error('当前角色未找到，无法绑定世界书。');
    }
    select_selected_character(numericId, { switchMenu: false });
    await Promise.resolve();
}

function getJQuery(): TavernJQuery | null {
    const candidate = (globalThis as typeof globalThis & { $?: unknown }).$;
    return typeof candidate === 'function' ? candidate as TavernJQuery : null;
}

function readJQueryData(selector: string, key: string): unknown {
    return getJQuery()?.(selector).data(key);
}

function captureCharacterEditorJQueryData(): TavernCharacterEditorDataSnapshot[] {
    const jq = getJQuery();
    if (!jq) {return [];}
    const slots = [
        { selector: '.open_alternate_greetings', key: 'chid' },
        { selector: '#set_character_world', key: 'chid' },
    ];
    return slots.flatMap((slot) => {
        const items: TavernCharacterEditorDataSnapshot[] = [];
        jq(slot.selector).each(function captureDataSlot() {
            const value = jq(this).data(slot.key);
            items.push({
                element: this,
                key: slot.key,
                value,
                hadValue: value !== undefined,
            });
        });
        return items;
    });
}

function captureCharacterEditorSnapshot(): TavernCharacterEditorSnapshot {
    const form = document.querySelector('#form_create');
    const controls = Array.from(document.querySelectorAll<TavernCharacterEditorControl>(
        '#form_create input, #form_create select, #form_create textarea',
    ))
        .filter((control) => !(control instanceof HTMLInputElement && control.type === 'file'))
        .map((control) => ({
            control,
            value: control.value,
            ...(control instanceof HTMLInputElement && ['checkbox', 'radio'].includes(control.type)
                ? { checked: control.checked }
                : {}),
            ...(control instanceof HTMLSelectElement && control.multiple
                ? { selectedValues: Array.from(control.selectedOptions).map((option) => option.value) }
                : {}),
        }));
    return {
        actionType: form instanceof HTMLFormElement ? form.getAttribute('actiontype') : null,
        controls,
        jqueryData: captureCharacterEditorJQueryData(),
    };
}

function restoreCharacterEditorSnapshot(snapshot: TavernCharacterEditorSnapshot | null): void {
    if (!snapshot) {return;}
    const form = document.querySelector('#form_create');
    if (form instanceof HTMLFormElement) {
        if (snapshot.actionType === null) {
            form.removeAttribute('actiontype');
        } else {
            form.setAttribute('actiontype', snapshot.actionType);
        }
    }
    snapshot.controls.forEach((item) => {
        const control = item.control;
        if (!control.isConnected) {return;}
        if (control instanceof HTMLSelectElement && control.multiple && item.selectedValues) {
            Array.from(control.options).forEach((option) => {
                option.selected = item.selectedValues?.includes(option.value) === true;
            });
            return;
        }
        control.value = item.value;
        if (control instanceof HTMLInputElement && item.checked !== undefined) {
            control.checked = item.checked;
        }
    });
    const jq = getJQuery();
    if (!jq) {return;}
    snapshot.jqueryData.forEach((item) => {
        if (!item.element.isConnected) {return;}
        if (item.hadValue) {
            jq(item.element).data(item.key, item.value);
        } else {
            jq(item.element).removeData(item.key);
        }
    });
}

function isCharacterEditorFocusedOn(nativeCharacterId: string): boolean {
    const targetId = normalizeIdText(nativeCharacterId);
    if (!targetId) {return false;}
    const form = document.querySelector('#form_create');
    if (form instanceof HTMLFormElement && form.getAttribute('actiontype') === 'createcharacter') {return false;}
    const worldEditorId = normalizeIdText(readJQueryData('#set_character_world', 'chid'));
    const greetingsEditorId = normalizeIdText(readJQueryData('.open_alternate_greetings', 'chid'));
    return worldEditorId === targetId && greetingsEditorId === targetId;
}

async function bindCharacterWorldbookThroughEditor(nativeCharacterId: string, name: string): Promise<TavernCharacterWorldbookState> {
    const shouldPrepareEditor = !isCharacterEditorFocusedOn(nativeCharacterId);
    const snapshot = shouldPrepareEditor ? captureCharacterEditorSnapshot() : null;
    try {
        if (shouldPrepareEditor) {
            await prepareCharacterEditorForWorldbookBinding(nativeCharacterId);
        }
        await charUpdatePrimaryWorld(name);
    } finally {
        restoreCharacterEditorSnapshot(snapshot);
    }
    const state = await readCharacterWorldbookState(nativeCharacterId);
    if (state.boundWorldbookName !== name || state.boundExists !== true) {
        throw new Error(`角色世界书绑定未保存成功：${name}`);
    }
    return state;
}

function readWorldbookBindingState(
    character: Record<string, unknown>,
    names: string[],
): Pick<TavernCharacterWorldbookState, 'boundWorldbookName' | 'boundExists'> {
    const characterData = readCharacterData(character);
    const extensions = asRecord(characterData.extensions);
    const boundWorldbookName = normalizeText(extensions.world);
    return {
        boundWorldbookName,
        boundExists: !!boundWorldbookName && names.includes(boundWorldbookName),
    };
}

function readEmbeddedWorldbookState(
    character: Record<string, unknown>,
): Pick<TavernCharacterWorldbookState, 'hasEmbeddedBook' | 'embeddedBookName'> {
    const book = readCharacterBook(character);
    return {
        hasEmbeddedBook: hasCharacterBookEntries(book),
        embeddedBookName: characterBookName(character, book),
    };
}

function buildCharacterWorldbookState(
    requestedId: string,
    character: Record<string, unknown>,
    names: string[],
    options?: {
        includeBinding?: boolean;
        includeEmbedded?: boolean;
    },
): TavernCharacterWorldbookState {
    const includeBinding = options?.includeBinding !== false;
    const includeEmbedded = options?.includeEmbedded !== false;
    const bindingState = includeBinding
        ? readWorldbookBindingState(character, names)
        : { boundWorldbookName: '', boundExists: false };
    const embeddedState = includeEmbedded
        ? readEmbeddedWorldbookState(character)
        : { hasEmbeddedBook: false, embeddedBookName: '' };
    const characterData = readCharacterData(character);
    return {
        nativeCharacterId: requestedId,
        characterName: normalizeText(character.name) || normalizeText(characterData.name),
        ...bindingState,
        ...embeddedState,
        worldbookOptions: names,
    };
}

function readCharacterData(character: Record<string, unknown>): Record<string, unknown> {
    return asRecord(character.data);
}

function readCharacterBook(character: Record<string, unknown>): Record<string, unknown> {
    return asRecord(readCharacterData(character).character_book);
}

function hasCharacterBookEntries(book: Record<string, unknown>): boolean {
    return Array.isArray(book.entries) && book.entries.length > 0;
}

function characterBookName(character: Record<string, unknown>, book: Record<string, unknown>): string {
    const characterName = normalizeText(character.name) || normalizeText(readCharacterData(character).name) || 'Character';
    return normalizeText(book.name) || `${characterName}'s Lorebook`;
}

async function readCharacterWorldbookState(nativeCharacterId: string): Promise<TavernCharacterWorldbookState> {
    const requestedId = normalizeIdText(nativeCharacterId);
    const names = await ensureWorldbookNames();
    const character = await hydrateCharacterRecordById(requestedId);
    return buildCharacterWorldbookState(requestedId, character, names, {
        includeBinding: true,
        includeEmbedded: true,
    });
}

async function readGlobalWorldbooksState(): Promise<TavernGlobalWorldbooksState> {
    const options = await ensureWorldbookNames();
    const selected = liveSelectedGlobalWorldbookNames().filter((name) => options.includes(name));
    return { options, selected };
}

async function ensureWorldbookNames(): Promise<string[]> {
    if (!Array.isArray(world_names) || !world_names.length) {
        await updateWorldInfoList();
    }
    return Array.isArray(world_names) ? [...world_names] : [];
}

export async function listTavernWorldbookSources(_input: unknown = {}): Promise<TavernWorldbookSourceListResult> {
    return runTavernWorldbookStateExclusive(async () => {
        const names = await ensureWorldbookNames();
        const globalNameSet = new Set(liveSelectedGlobalWorldbookNames());
        return {
            books: names.map((name) => ({
                name,
                globalActive: globalNameSet.has(name),
            })),
        };
    });
}

export async function getTavernWorldbookPreview(input: unknown = {}): Promise<TavernWorldbookPreviewResult> {
    return runTavernWorldbookStateExclusive(async () => {
        const payload = asRecord(input);
        const name = normalizeText(payload.name);
        if (!name) {
            throw new Error('缺少世界书名称。');
        }
        const names = await ensureWorldbookNames();
        if (!names.includes(name)) {
            throw new Error(`找不到世界书：${name}`);
        }
        const data = await loadWorldInfo(name);
        const entries = readWorldbookEntries(data);
        const limit = Math.max(1, Math.floor(Number(payload.limit) || 24));
        const previewEntries = entries
            .map((entry, index) => {
                const keys = normalizeStringList(entry.key);
                const secondaryKeys = normalizeStringList(entry.keysecondary || entry.secondary_keys);
                const content = normalizeText(entry.content);
                return {
                    uid: normalizeIdText(entry.uid ?? entry.id ?? index),
                    name: previewEntryName(entry, index),
                    keys,
                    secondaryKeys,
                    contentPreview: content,
                    enabled: entry.disable !== true,
                    constant: entry.constant === true,
                    vectorized: entryExtensionValue(entry, 'vectorized', 'vectorized') === true,
                    order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : 100,
                    position: normalizeWorldbookPosition(entryExtensionValue(entry, 'position', 'position')),
                    role: Math.floor(normalizeFiniteNumber(entryExtensionValue(entry, 'role', 'role'), 0)),
                    depth: normalizeNullableNumber(entryExtensionValue(entry, 'depth', 'depth')),
                    probability: normalizeNullableNumber(entryExtensionValue(entry, 'probability', 'probability')),
                };
            })
            .sort((a, b) => Number(b.order) - Number(a.order))
            .slice(0, limit);
        return {
            name,
            entryCount: entries.length,
            enabledCount: entries.filter((entry) => entry.disable !== true).length,
            constantCount: entries.filter((entry) => entry.constant === true).length,
            disabledCount: entries.filter((entry) => entry.disable === true).length,
            keywordCount: entries.reduce((sum, entry) => (
                sum
                + normalizeStringList(entry.key).length
                + normalizeStringList(entry.keysecondary || entry.secondary_keys).length
            ), 0),
            totalChars: entries.reduce((sum, entry) => sum + normalizeText(entry.content).length, 0),
            entries: previewEntries,
        };
    });
}

export async function getTavernWorldbookEntry(input: unknown = {}): Promise<TavernWorldbookEntryDraft> {
    return runTavernWorldbookStateExclusive(async () => {
        const payload = asRecord(input);
        const name = normalizeText(payload.name || payload.worldbookName);
        const uid = normalizeIdText(payload.uid);
        if (!name) {
            throw new Error('缺少世界书名称。');
        }
        if (!uid) {
            throw new Error('缺少世界书条目 UID。');
        }
        const names = await ensureWorldbookNames();
        if (!names.includes(name)) {
            throw new Error(`找不到世界书：${name}`);
        }
        const data = await loadWorldInfo(name);
        const slot = findWorldbookEntrySlot(data, uid);
        if (!slot) {
            throw new Error(`找不到世界书条目：${uid}`);
        }
        return buildWorldbookEntryDraft(name, slot);
    });
}

export async function saveTavernWorldbookEntry(input: unknown = {}): Promise<TavernWorldbookEntryDraft> {
    return runTavernWorldbookStateExclusive(async () => {
        const payload = asRecord(input);
        const name = normalizeText(payload.name || payload.worldbookName);
        const uid = normalizeIdText(payload.uid);
        const entryHash = normalizeText(payload.entryHash || payload.revision);
        const draft = asRecord(payload.draft || payload.entry || payload);
        if (!name) {
            throw new Error('缺少世界书名称。');
        }
        if (!uid) {
            throw new Error('缺少世界书条目 UID。');
        }
        if (!entryHash) {
            throw new Error('缺少世界书条目版本，请重新读取后再保存。');
        }
        const names = await ensureWorldbookNames();
        if (!names.includes(name)) {
            throw new Error(`找不到世界书：${name}`);
        }
        const data = await loadWorldInfo(name);
        const slot = findWorldbookEntrySlot(data, uid);
        if (!slot) {
            throw new Error(`找不到世界书条目：${uid}`);
        }
        const currentHash = buildWorldbookEntryHash(slot.entry);
        if (currentHash !== entryHash) {
            throw new Error('这个世界书条目已经在酒馆里被修改，请重新读取后再保存。');
        }
        patchWorldbookEntry(slot.entry, draft);
        syncWorldbookOriginalDataEntry(asRecord(data), uid, slot.entry);
        await saveWorldInfo(name, data, true);
        void updateWorldInfoList().catch((error) => {
            console.warn('[LittleWhiteBox/tavern] Failed to refresh worldbook list after entry save', name, error);
        });
        return buildWorldbookEntryDraft(name, slot);
    });
}

export async function getTavernCharacterWorldbookState(input: unknown = {}): Promise<TavernCharacterWorldbookState> {
    return runTavernWorldbookStateExclusive(async () => {
        const payload = asRecord(input);
        return readCharacterWorldbookState(normalizeIdText(payload.nativeCharacterId));
    });
}

export async function activateTavernCharacterWorldbook(input: unknown = {}): Promise<TavernCharacterWorldbookActionResult> {
    return runTavernWorldbookStateExclusive(async () => {
        const payload = asRecord(input);
        const state = await readCharacterWorldbookState(normalizeIdText(payload.nativeCharacterId));
        if (state.boundWorldbookName && state.boundExists) {
            return { action: 'selected', name: state.boundWorldbookName, state };
        }
        const character = await hydrateCharacterRecordById(state.nativeCharacterId);
        const book = readCharacterBook(character);
        if (hasCharacterBookEntries(book)) {
            const name = characterBookName(character, book);
            if (state.worldbookOptions.includes(name) && payload.confirmed !== true) {
                return { action: 'needs_import_confirmation', name, state };
            }
            const convertedBook = convertCharacterBook(book);
            await saveWorldInfo(name, convertedBook, true);
            await updateWorldInfoList();
            const boundState = await bindCharacterWorldbookThroughEditor(state.nativeCharacterId, name);
            return {
                action: 'imported',
                name,
                state: boundState,
            };
        }
        return {
            action: 'needs_selection',
            worldbookOptions: state.worldbookOptions,
            state,
        };
    });
}

export async function bindTavernCharacterWorldbook(input: unknown = {}): Promise<TavernCharacterWorldbookState> {
    return runTavernWorldbookStateExclusive(async () => {
        const payload = asRecord(input);
        const nativeCharacterId = normalizeIdText(payload.nativeCharacterId);
        const state = await readCharacterWorldbookState(nativeCharacterId);
        const name = normalizeText(payload.name);
        if (!name) {
            throw new Error('缺少要绑定的世界书名称。');
        }
        if (!state.worldbookOptions.includes(name)) {
            throw new Error(`找不到世界书：${name}`);
        }
        return bindCharacterWorldbookThroughEditor(nativeCharacterId, name);
    });
}

export async function getTavernGlobalWorldbooks(): Promise<TavernGlobalWorldbooksState> {
    return runTavernWorldbookStateExclusive(() => readGlobalWorldbooksState());
}

export async function setTavernGlobalWorldbooks(input: unknown = {}): Promise<TavernGlobalWorldbooksState> {
    return runTavernWorldbookStateExclusive(async () => {
        const payload = asRecord(input);
        const options = await ensureWorldbookNames();
        const selected = normalizeStringList(payload.selected).filter((name) => options.includes(name));
        applyGlobalWorldbookSelection(selected);
        await updateWorldInfoList();
        return readGlobalWorldbooksState();
    });
}

export async function getTavernWorldbookRuntime(input: unknown = {}): Promise<XbTavernNativeWorldInfoRuntime> {
    const payload = asRecord(input) as TavernWorldbookRuntimeInput;
    const context = payload.context || {};
    const includeNames = context.worldSettings?.includeNames === true || getWorldInfoSettings().world_info_include_names === true;
    const chatLines = typeof context.worldSettings?.scanText === 'string'
        ? buildExplicitScanLines(context.worldSettings.scanText)
        : buildHistoryScanLines(context, payload.currentUserMessage, includeNames);
    const globalScanData = buildGlobalScanData(payload);
    const maxContext = Math.max(
        1,
        Number(payload.maxContext)
            || getNativeMaxPromptTokens(),
    );
    return runTavernWorldbookStateExclusive(async () => {
        const nativeCharacterId = normalizeIdText(context.character?.nativeCharacterId);
        if (nativeCharacterId) {
            try {
                await hydrateCharacterRecordById(nativeCharacterId);
            } catch (error) {
                console.warn('[LittleWhiteBox/tavern] Failed to hydrate character before worldbook runtime', nativeCharacterId, error);
            }
        }
        const sources = collectRuntimeSources(context);
        const snapshot = captureRuntimeState();
        applyRuntimeState({
            context,
            sources,
            timedState: normalizeTimedState(payload.timedState),
        });
        applyAuthorNoteInjectScanPrompt(context, payload.currentUserMessage || '');
        try {
            const activated = await checkWorldInfo(chatLines, maxContext, false, globalScanData);
            const activatedPromptEntries = buildActivatedPromptEntries(
                valuesToRecordList(activated.allActivatedEntries),
                sources,
            );
            return {
                trigger: normalizeText(globalScanData.trigger),
                sourceNames: sources,
                activatedEntries: activatedPromptEntries,
                worldInfoBefore: normalizeText(activated.worldInfoBefore),
                worldInfoAfter: normalizeText(activated.worldInfoAfter),
                worldInfoExamples: Array.isArray(activated.EMEntries)
                    ? activated.EMEntries.map((entry: unknown) => ({
                        position: normalizeIdText(asRecord(entry).position),
                        content: normalizeText(asRecord(entry).content),
                    })).filter((entry: { position?: string; content?: string }) => entry.content)
                    : [],
                worldInfoDepth: Array.isArray(activated.WIDepthEntries)
                    ? activated.WIDepthEntries.map((entry: unknown) => ({
                        depth: Number(asRecord(entry).depth),
                        role: Number(asRecord(entry).role),
                        entries: normalizeStringList(asRecord(entry).entries),
                    })).filter((entry: { depth?: number; role?: number; entries?: string[] }) => Array.isArray(entry.entries) && entry.entries.length)
                    : [],
                anBefore: normalizeStringList(activated.ANBeforeEntries),
                anAfter: normalizeStringList(activated.ANAfterEntries),
                outlets: Object.fromEntries(
                    Object.entries(asRecord(activated.outletEntries))
                        .map(([key, value]) => [key, normalizeStringList(value)])
                        .filter(([, value]) => value.length),
                ),
                timedState: normalizeTimedState(chat_metadata?.timedWorldInfo),
            };
        } finally {
            restoreRuntimeState(snapshot);
        }
    });
}
