import {
    characters,
    eventSource,
    event_types,
    getCurrentChatId,
    getOneCharacter,
    name2,
    saveSettingsDebounced,
    setCharacterId,
    setCharacterName,
    this_chid,
    unshallowCharacter,
} from '../../../../../../../script.js';
import {
    extension_settings,
    writeExtensionField,
} from '../../../../../../extensions.js';
import * as nativeRegexEngine from '../../../../../../extensions/regex/engine.js';
import type { TavernApplyRegexItem, TavernApplyRegexResult, TavernRegexPlacementKey } from '../shared/regex';

const {
    allowPresetScripts,
    allowScopedScripts,
    getCurrentPresetAPI,
    getCurrentPresetName,
    getScriptsByType,
    isPresetScriptsAllowed,
    isScopedScriptsAllowed,
    regex_placement,
    runRegexScript,
    saveScriptsByType,
    SCRIPT_TYPES,
    substitute_find_regex,
} = nativeRegexEngine;

interface TavernRegexScript {
    id?: string;
    scriptName?: string;
    findRegex?: string;
    replaceString?: string;
    trimStrings?: string[];
    placement?: number[];
    disabled?: boolean;
    markdownOnly?: boolean;
    promptOnly?: boolean;
    runOnEdit?: boolean;
    substituteRegex?: number;
    minDepth?: number | null;
    maxDepth?: number | null;
    [key: string]: unknown;
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function cloneJson<T>(value: T): T {
    try {
        return JSON.parse(JSON.stringify(value)) as T;
    } catch {
        return value;
    }
}

function text(value: unknown): string {
    return String(value || '').trim();
}

function normalizedNativeCharacterId(nativeCharacterId: unknown): string {
    const normalized = text(nativeCharacterId);
    const index = Number(normalized);
    return normalized && Number.isInteger(index) && index >= 0 ? normalized : '';
}

function normalizeScriptType(value: unknown): number {
    const parsed = Number(value);
    if (parsed === SCRIPT_TYPES.GLOBAL || parsed === SCRIPT_TYPES.SCOPED || parsed === SCRIPT_TYPES.PRESET) {
        return parsed;
    }
    const label = text(value).toLowerCase();
    if (label === 'global') {return SCRIPT_TYPES.GLOBAL;}
    if (label === 'scoped' || label === 'character') {return SCRIPT_TYPES.SCOPED;}
    if (label === 'preset') {return SCRIPT_TYPES.PRESET;}
    throw new Error('未知正则类型。');
}

function createId(): string {
    return `regex-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.map((item) => text(item)).filter(Boolean);
    }
    return String(value || '')
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function normalizeNumberArray(value: unknown): number[] {
    if (!Array.isArray(value)) {return [];}
    return value
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item));
}

function nullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {return null;}
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function normalizePlacementKey(value: unknown): TavernRegexPlacementKey {
    const key = text(value);
    if (key === 'userInput' || key === 'aiOutput' || key === 'worldInfo' || key === 'reasoning') {
        return key;
    }
    throw new Error('未知正则应用位置。');
}

function placementToNative(value: TavernRegexPlacementKey): number {
    switch (value) {
        case 'userInput':
            return regex_placement.USER_INPUT;
        case 'aiOutput':
            return regex_placement.AI_OUTPUT;
        case 'worldInfo':
            return regex_placement.WORLD_INFO;
        case 'reasoning':
            return regex_placement.REASONING;
        default:
            throw new Error('未知正则应用位置。');
    }
}

function normalizeRegexOptions(value: unknown): Record<string, unknown> {
    const source = asRecord(value);
    const options: Record<string, unknown> = {};
    if (source.characterOverride !== undefined) {options.characterOverride = String(source.characterOverride || '');}
    if (source.isMarkdown !== undefined) {options.isMarkdown = source.isMarkdown === true;}
    if (source.isPrompt !== undefined) {options.isPrompt = source.isPrompt === true;}
    if (source.isEdit !== undefined) {options.isEdit = source.isEdit === true;}
    const depth = nullableNumber(source.depth);
    if (depth !== null) {options.depth = depth;}
    return options;
}

function fallbackScriptId(scriptType: number | null | undefined, index: number | null | undefined): string {
    if (Number.isFinite(Number(scriptType)) && Number.isInteger(Number(index)) && Number(index) >= 0) {
        return `native-${Number(scriptType)}-${Number(index)}`;
    }
    return createId();
}

function normalizeRegexScript(input: unknown, scriptType?: number, index?: number): TavernRegexScript {
    const source = asRecord(input);
    return {
        ...cloneJson(source),
        id: text(source.id) || fallbackScriptId(scriptType, index),
        scriptName: text(source.scriptName),
        findRegex: String(source.findRegex || ''),
        replaceString: String(source.replaceString || ''),
        trimStrings: normalizeStringArray(source.trimStrings),
        placement: normalizeNumberArray(source.placement),
        disabled: source.disabled === true,
        markdownOnly: source.markdownOnly === true,
        promptOnly: source.promptOnly === true,
        runOnEdit: source.runOnEdit === true,
        substituteRegex: Number.isFinite(Number(source.substituteRegex)) ? Number(source.substituteRegex) : substitute_find_regex.NONE,
        minDepth: nullableNumber(source.minDepth),
        maxDepth: nullableNumber(source.maxDepth),
    };
}

function currentCharacter(nativeCharacterId: unknown): Record<string, unknown> {
    const normalizedId = normalizedNativeCharacterId(nativeCharacterId);
    if (!normalizedId) {return {};}
    return asRecord(characters?.[Number(normalizedId)]);
}

function hasCharacterExtensionContainer(character: Record<string, unknown>): boolean {
    const data = asRecord(character.data);
    return Object.prototype.hasOwnProperty.call(data, 'extensions');
}

function characterJsonData(character: Record<string, unknown>): Record<string, unknown> {
    const raw = text(character.json_data);
    if (!raw) {return {};}
    try {
        return asRecord(JSON.parse(raw));
    } catch {
        return {};
    }
}

function hasScopedRegexScripts(value: Record<string, unknown>): boolean {
    const data = asRecord(value.data);
    const extensions = asRecord(data.extensions);
    const rootExtensions = asRecord(value.extensions);
    return Array.isArray(extensions.regex_scripts) || Array.isArray(rootExtensions.regex_scripts);
}

function shouldHydrateCharacterForRegex(character: Record<string, unknown>): boolean {
    return character.shallow === true
        || !text(character.json_data)
        || !hasCharacterExtensionContainer(character)
        || (hasScopedRegexScripts(characterJsonData(character)) && !hasScopedRegexScripts(character));
}

async function hydrateCharacter(nativeCharacterId: unknown): Promise<Record<string, unknown>> {
    const normalizedId = normalizedNativeCharacterId(nativeCharacterId);
    if (!normalizedId) {return {};}
    const character = currentCharacter(normalizedId);
    const avatar = text(character.avatar);
    if (avatar && avatar !== 'none' && shouldHydrateCharacterForRegex(character)) {
        if (character.shallow === true) {
            await unshallowCharacter(String(normalizedId));
        } else {
            await getOneCharacter(avatar);
        }
    }
    return currentCharacter(normalizedId);
}

function readScopedScripts(character: Record<string, unknown>): TavernRegexScript[] {
    const data = asRecord(character.data);
    const extensions = asRecord(data.extensions);
    const scripts = Array.isArray(extensions.regex_scripts) ? extensions.regex_scripts : [];
    return scripts.map((script, index) => normalizeRegexScript(script, SCRIPT_TYPES.SCOPED, index));
}

function readScriptsByType(scriptType: number, nativeCharacter: Record<string, unknown>): TavernRegexScript[] {
    if (scriptType === SCRIPT_TYPES.SCOPED) {
        return readScopedScripts(nativeCharacter);
    }
    return getScriptsByType(scriptType).map((script, index) => normalizeRegexScript(script, scriptType, index));
}

function buildGroup(scriptType: number, key: string, label: string, nativeCharacterId: unknown, nativeCharacter: Record<string, unknown>): Record<string, unknown> {
    const scripts = readScriptsByType(scriptType, nativeCharacter);
    const presetApi = getCurrentPresetAPI();
    const presetName = getCurrentPresetName();
    return {
        key,
        label,
        scriptType,
        scripts,
        allowed: scriptType === SCRIPT_TYPES.SCOPED
            ? !!normalizedNativeCharacterId(nativeCharacterId) && isScopedScriptsAllowed(nativeCharacter)
            : scriptType === SCRIPT_TYPES.PRESET
                ? isPresetScriptsAllowed(presetApi, presetName)
                : true,
    };
}

async function syncNativeRegexUiAfterWrite(): Promise<void> {
    try {
        nativeRegexEngine.RegexProvider?.instance?.clear?.();
        saveSettingsDebounced?.();
        const chatId = getCurrentChatId?.();
        const chatChangedEvent = event_types?.CHAT_CHANGED;
        if (chatChangedEvent && typeof eventSource?.emit === 'function') {
            await eventSource.emit(chatChangedEvent, chatId);
        }
    } catch (error) {
        console.warn('[LittleWhiteBox] Failed to refresh native regex UI after write.', error);
    }
}

export async function listTavernRegexScripts(input: unknown = {}): Promise<Record<string, unknown>> {
    const source = asRecord(input);
    const nativeCharacterId = normalizedNativeCharacterId(source.nativeCharacterId);
    const nativeCharacter = nativeCharacterId ? await hydrateCharacter(nativeCharacterId) : {};
    return {
        groups: [
            buildGroup(SCRIPT_TYPES.GLOBAL, 'global', '全局', nativeCharacterId, nativeCharacter),
            buildGroup(SCRIPT_TYPES.SCOPED, 'scoped', '当前角色', nativeCharacterId, nativeCharacter),
            buildGroup(SCRIPT_TYPES.PRESET, 'preset', '预设正则', nativeCharacterId, nativeCharacter),
        ],
        placements: {
            userInput: regex_placement.USER_INPUT,
            aiOutput: regex_placement.AI_OUTPUT,
            slashCommand: regex_placement.SLASH_COMMAND,
            worldInfo: regex_placement.WORLD_INFO,
            reasoning: regex_placement.REASONING,
        },
    };
}

export async function saveTavernRegexScript(input: unknown): Promise<Record<string, unknown>> {
    const source = asRecord(input);
    const nativeCharacterId = normalizedNativeCharacterId(source.nativeCharacterId);
    const scriptType = normalizeScriptType(source.scriptType);
    const script = normalizeRegexScript(source.script);
    if (scriptType === SCRIPT_TYPES.SCOPED && !nativeCharacterId) {
        throw new Error('缺少角色身份，无法保存当前角色正则。');
    }
    if (!script.scriptName) {
        throw new Error('正则名称不能为空。');
    }
    const nativeCharacter = scriptType === SCRIPT_TYPES.SCOPED ? await hydrateCharacter(nativeCharacterId) : {};
    if (scriptType === SCRIPT_TYPES.SCOPED && !Object.keys(nativeCharacter).length) {
        throw new Error('角色卡已不存在，无法保存当前角色正则。');
    }
    const scripts = readScriptsByType(scriptType, nativeCharacter);
    const index = scripts.findIndex((item) => item.id === script.id);
    if (index >= 0) {
        scripts[index] = script;
    } else {
        scripts.push(script);
    }
    if (scriptType === SCRIPT_TYPES.SCOPED) {
        await writeExtensionField(nativeCharacterId, 'regex_scripts', scripts);
    } else {
        await saveScriptsByType(scripts, scriptType);
    }
    if (scriptType === SCRIPT_TYPES.SCOPED) {
        allowScopedScripts(nativeCharacter);
    } else if (scriptType === SCRIPT_TYPES.PRESET) {
        allowPresetScripts(getCurrentPresetAPI(), getCurrentPresetName());
    }
    await syncNativeRegexUiAfterWrite();
    return {
        ...await listTavernRegexScripts({ nativeCharacterId }),
        savedScriptId: script.id,
        savedScriptType: scriptType,
    };
}

export async function deleteTavernRegexScript(input: unknown): Promise<Record<string, unknown>> {
    const source = asRecord(input);
    const nativeCharacterId = normalizedNativeCharacterId(source.nativeCharacterId);
    const scriptType = normalizeScriptType(source.scriptType);
    if (scriptType === SCRIPT_TYPES.SCOPED && !nativeCharacterId) {
        throw new Error('缺少角色身份，无法删除当前角色正则。');
    }
    const id = text(source.id);
    if (!id) {
        throw new Error('缺少正则 ID。');
    }
    const nativeCharacter = scriptType === SCRIPT_TYPES.SCOPED ? await hydrateCharacter(nativeCharacterId) : {};
    if (scriptType === SCRIPT_TYPES.SCOPED && !Object.keys(nativeCharacter).length) {
        throw new Error('角色卡已不存在，无法删除当前角色正则。');
    }
    const scripts = readScriptsByType(scriptType, nativeCharacter).filter((item) => item.id !== id);
    if (scriptType === SCRIPT_TYPES.SCOPED) {
        await writeExtensionField(nativeCharacterId, 'regex_scripts', scripts);
    } else {
        await saveScriptsByType(scripts, scriptType);
    }
    await syncNativeRegexUiAfterWrite();
    return await listTavernRegexScripts({ nativeCharacterId });
}

function shouldUseRegexScript(script: TavernRegexScript, placement: number, options: Record<string, unknown>): boolean {
    if (!Array.isArray(script.placement) || !script.placement.includes(placement)) {return false;}
    const isMarkdown = options.isMarkdown === true;
    const isPrompt = options.isPrompt === true;
    const isEdit = options.isEdit === true;
    const matchesSurface = (script.markdownOnly && isMarkdown)
        || (script.promptOnly && isPrompt)
        || (!script.markdownOnly && !script.promptOnly && !isMarkdown && !isPrompt);
    if (!matchesSurface) {return false;}
    if (isEdit && !script.runOnEdit) {return false;}
    const depth = Number(options.depth);
    if (Number.isFinite(depth)) {
        const minDepth = Number(script.minDepth);
        if (Number.isFinite(minDepth) && script.minDepth !== null && minDepth >= -1 && depth < minDepth) {return false;}
        const maxDepth = Number(script.maxDepth);
        if (Number.isFinite(maxDepth) && script.maxDepth !== null && maxDepth >= 0 && depth > maxDepth) {return false;}
    }
    return true;
}

function buildApplicableRegexScripts(nativeCharacterId: string): TavernRegexScript[] {
    const settings = extension_settings as Record<string, unknown>;
    const disabledExtensions = Array.isArray(settings.disabledExtensions) ? settings.disabledExtensions : [];
    const disabled = disabledExtensions.includes('regex');
    if (disabled) {return [];}
    const nativeCharacter = currentCharacter(nativeCharacterId);
    const globalScripts = getScriptsByType(SCRIPT_TYPES.GLOBAL, { allowedOnly: true })
        .map((script, index) => normalizeRegexScript(script, SCRIPT_TYPES.GLOBAL, index));
    const scopedScripts = nativeCharacterId && isScopedScriptsAllowed(nativeCharacter)
        ? readScopedScripts(nativeCharacter)
        : [];
    const presetScripts = getScriptsByType(SCRIPT_TYPES.PRESET, { allowedOnly: true })
        .map((script, index) => normalizeRegexScript(script, SCRIPT_TYPES.PRESET, index));
    return [...globalScripts, ...presetScripts, ...scopedScripts];
}

function runWithRegexCharacterContext<T>(nativeCharacterId: string, task: () => T): T {
    if (!nativeCharacterId) {return task();}
    const originalCharacterId = this_chid;
    const originalName = name2;
    const character = currentCharacter(nativeCharacterId);
    try {
        setCharacterId(nativeCharacterId);
        setCharacterName(text(character.name));
        return task();
    } finally {
        setCharacterId(originalCharacterId ?? undefined);
        setCharacterName(originalName || '');
    }
}

export async function applyTavernRegex(input: unknown): Promise<TavernApplyRegexResult> {
    const source = asRecord(input);
    const nativeCharacterId = normalizedNativeCharacterId(source.nativeCharacterId);
    if (nativeCharacterId) {
        await hydrateCharacter(nativeCharacterId);
    }
    const regexScripts = buildApplicableRegexScripts(nativeCharacterId);
    const rawItems = Array.isArray(source.items) ? source.items : [];
    let changedCount = 0;
    const items = runWithRegexCharacterContext(nativeCharacterId, () => rawItems.map((rawItem, index) => {
        const item = asRecord(rawItem) as unknown as TavernApplyRegexItem;
        const id = text((item as TavernApplyRegexItem).id) || `item-${index}`;
        const placement = normalizePlacementKey((item as TavernApplyRegexItem).placement);
        const original = String((item as TavernApplyRegexItem).text || '');
        const nativePlacement = placementToNative(placement);
        const options = normalizeRegexOptions((item as TavernApplyRegexItem).options);
        const textValue = regexScripts.reduce((current, script) => (
            shouldUseRegexScript(script, nativePlacement, options)
                ? String(runRegexScript(script, current, { characterOverride: text(options.characterOverride) }) || '')
                : current
        ), original);
        const changed = textValue !== original;
        if (changed) {changedCount += 1;}
        return {
            id,
            text: textValue,
            changed,
        };
    }));
    return {
        items,
        changedCount,
    };
}
