import { saveSettingsDebounced } from '../../../../../../../script.js';
import { getPresetManager } from '../../../../../../preset-manager.js';
import { promptManager } from '../../../../../../openai.js';

type XbTavernRole = 'system' | 'user' | 'assistant' | 'tool';
type TavernChatPromptPlacement =
    | 'top'
    | 'beforeCharacter'
    | 'afterCharacter'
    | 'beforeHistory'
    | 'afterHistory'
    | 'assistantPrefill';

interface TavernChatPromptSection {
    id?: string;
    label?: string;
    enabled?: boolean;
    marker?: boolean;
    role?: XbTavernRole | string;
    content?: string;
    placement?: TavernChatPromptPlacement;
    source?: string;
}

interface TavernChatPromptPresetBundle {
    id?: string;
    name?: string;
    source?: string;
    selected?: boolean;
    promptManager?: {
        name?: string;
        prompts?: unknown[];
        promptOrder?: unknown;
        rawPreset?: Record<string, unknown>;
        activeCharacterId?: string | number;
        activeOrder?: unknown[];
    };
    systemPrompt?: { name?: string; enabled?: boolean; content?: string; postHistory?: string };
    contextTemplate?: { name?: string; storyString?: string; chatStart?: string; exampleSeparator?: string };
    instructTemplate?: Record<string, unknown>;
    sections?: TavernChatPromptSection[];
    updatedAt?: number;
}

function createFallbackTavernChatPromptPresetBundle(): TavernChatPromptPresetBundle {
    return {
        id: 'sillytavern-current-chat-prompt',
        name: '酒馆当前聊天预设',
        source: 'sillytavern',
        selected: true,
        sections: [],
    };
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asArray<T = unknown>(value: unknown): T[] {
    return Array.isArray(value) ? value as T[] : [];
}

function cloneJson<T>(value: T): T {
    try {
        return JSON.parse(JSON.stringify(value)) as T;
    } catch {
        return value;
    }
}

function normalizeText(value: unknown = ''): string {
    return String(value || '').trim();
}

function normalizeTavernChatPromptPresetBundle(input: TavernChatPromptPresetBundle = {}): TavernChatPromptPresetBundle {
    const fallback = createFallbackTavernChatPromptPresetBundle();
    return {
        id: normalizeText(input.id) || fallback.id,
        name: normalizeText(input.name) || fallback.name,
        source: normalizeText(input.source) || 'sillytavern',
        selected: input.selected !== false,
        promptManager: input.promptManager,
        systemPrompt: input.systemPrompt,
        contextTemplate: input.contextTemplate,
        instructTemplate: input.instructTemplate,
        sections: Array.isArray(input.sections)
            ? input.sections.filter((section) => normalizeText(section.content) || section.marker === true)
            : [],
        updatedAt: Number(input.updatedAt) || undefined,
    };
}

function normalizePromptRole(value: unknown): XbTavernRole {
    const role = normalizeText(value).toLowerCase();
    return role === 'user' || role === 'assistant' ? role : 'system';
}

function resolvePromptPlacement(prompt: Record<string, unknown>): TavernChatPromptSection['placement'] {
    const identifier = normalizeText(prompt.identifier || prompt.id).toLowerCase();
    if (identifier === 'jailbreak') {return 'afterHistory';}
    const injectionPosition = Number(prompt.injection_position);
    if (Number.isFinite(injectionPosition) && injectionPosition > 0) {return 'afterHistory';}
    const position = normalizeText(prompt.position).toLowerCase();
    if (position.includes('after')) {return 'afterHistory';}
    if (position.includes('depth') || Number.isFinite(Number(prompt.injection_depth))) {return 'beforeHistory';}
    return 'beforeHistory';
}

function buildPromptManagerSections(prompts: unknown[] = []): TavernChatPromptSection[] {
    const sections: TavernChatPromptSection[] = [];
    prompts.forEach((item, index) => {
        const prompt = asRecord(item);
        const content = normalizeText(prompt.content);
        const marker = prompt.marker === true;
        if ((!content && !marker) || prompt.enabled === false || prompt.disabled === true) {return;}
        const identifier = normalizeText(prompt.identifier || prompt.id || `prompt-${index + 1}`);
        sections.push({
            id: `prompt-manager:${identifier}`,
            label: normalizeText(prompt.name || prompt.label || identifier),
            enabled: true,
            marker,
            role: normalizePromptRole(prompt.role),
            content,
            placement: resolvePromptPlacement(prompt),
            source: 'promptManager',
        });
    });
    return sections;
}

function getSelectedPromptManagerPreset(): Record<string, unknown> {
    const manager = getRequiredPromptManager();
    const promptPresetName = normalizeText(manager?.getSelectedPresetName?.());
    if (!promptPresetName) {
        throw new Error('聊天预设未同步：酒馆当前未选择 Prompt Manager 预设。');
    }
    const preset = asRecord(manager?.getCompletionPresetByName?.(promptPresetName));
    if (!Object.keys(preset).length) {
        throw new Error(`聊天预设未同步：无法读取酒馆当前预设「${promptPresetName}」。`);
    }
    if (!Array.isArray(preset.prompts)) {
        throw new Error('聊天预设未同步：当前预设缺少 prompts。');
    }
    if (!Array.isArray(preset.prompt_order)) {
        throw new Error('聊天预设未同步：当前预设缺少 prompt_order。');
    }
    return cloneJson(preset);
}

function getActivePromptManagerCharacterId(): string {
    const runtime = promptManager as typeof promptManager & { activeCharacter?: Record<string, unknown> };
    return normalizeText(asRecord(runtime?.activeCharacter).id);
}

function replaceActivePromptOrder(
    existingPromptOrder: unknown,
    activeCharacterId: string,
    nextOrder: unknown[] = [],
): unknown[] {
    const containers = asArray<Record<string, unknown>>(existingPromptOrder)
        .map((container) => ({ ...asRecord(container) }));
    const targetIndex = containers.findIndex((container) => normalizeText(container.character_id) === activeCharacterId);
    const target = targetIndex >= 0
        ? containers[targetIndex]
        : { character_id: activeCharacterId };
    const replacement = {
        ...target,
        character_id: target?.character_id ?? activeCharacterId,
        order: cloneJson(nextOrder),
    };
    if (targetIndex >= 0) {
        containers[targetIndex] = replacement;
    } else {
        containers.push(replacement);
    }
    return containers;
}

function pickPromptManagerRuntimeFields(source: Record<string, unknown> = {}): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (Array.isArray(source.prompts)) {
        result.prompts = cloneJson(source.prompts);
    }
    if (Array.isArray(source.prompt_order)) {
        result.prompt_order = cloneJson(source.prompt_order);
    }
    return result;
}

type PromptPresetManager = {
    findPreset?: (presetName: string) => unknown;
    selectPreset?: (value: unknown) => unknown;
    select?: { val?: (value: unknown) => unknown };
    getSelectedPresetName?: () => unknown;
    getCompletionPresetByName?: (presetName: string) => unknown;
    savePreset?: (presetName: string, preset: Record<string, unknown>) => unknown | Promise<unknown>;
    getAllPresets?: () => string[];
};

function getRequiredPromptManager(): PromptPresetManager {
    const manager = getPresetManager('openai') as PromptPresetManager | null;
    if (!manager) {
        throw new Error('未读取到酒馆 Prompt Manager。');
    }
    return manager;
}

function assertPromptManagerRuntimeReady(targetName = ''): void {
    const selectedName = normalizeText(getPresetManager('openai')?.getSelectedPresetName?.());
    const expectedName = normalizeText(targetName);
    if (expectedName && selectedName !== expectedName) {
        throw new Error(`聊天预设切换失败：当前仍是「${selectedName || '未选择'}」。`);
    }
    const serviceSettings = asRecord(promptManager?.serviceSettings);
    if (!Array.isArray(serviceSettings.prompts)) {
        throw new Error('聊天预设切换失败：未同步 prompts。');
    }
    if (!Array.isArray(serviceSettings.prompt_order)) {
        throw new Error('聊天预设切换失败：未同步 prompt_order。');
    }
}

function setPromptManagerSelectedPresetName(name = ''): void {
    const manager = getRequiredPromptManager();
    const presetName = normalizeText(name);
    if (!presetName) {
        throw new Error('聊天预设名称为空。');
    }
    const value = manager.findPreset?.(presetName);
    if (value === undefined || value === null) {
        throw new Error(`聊天预设不存在：${presetName}`);
    }
    if (typeof manager.selectPreset === 'function') {
        manager.selectPreset(value);
    } else {
        manager.select?.val?.(value);
    }
    assertPromptManagerRuntimeReady(presetName);
}

function buildCurrentBundle(): TavernChatPromptPresetBundle {
    const promptPresetName = normalizeText(getPresetManager('openai')?.getSelectedPresetName?.());
    const rawPreset = getSelectedPromptManagerPreset();
    const promptManagerRuntime = promptManager as typeof promptManager & {
        activeCharacter?: Record<string, unknown>;
        getPromptOrderForCharacter?: (character: unknown) => unknown[];
    };
    const activeCharacter = asRecord(promptManagerRuntime?.activeCharacter);
    const activeCharacterId = activeCharacter.id as string | number | undefined;
    const activeOrder = Array.isArray(promptManagerRuntime?.getPromptOrderForCharacter?.(promptManagerRuntime.activeCharacter))
        ? promptManagerRuntime.getPromptOrderForCharacter(promptManagerRuntime.activeCharacter)
        : [];
    const sections: TavernChatPromptSection[] = [
        ...buildPromptManagerSections(asArray(rawPreset.prompts)),
    ];
    return normalizeTavernChatPromptPresetBundle({
        id: promptPresetName || createFallbackTavernChatPromptPresetBundle().id,
        name: promptPresetName || createFallbackTavernChatPromptPresetBundle().name,
        source: 'sillytavern',
        selected: true,
        promptManager: {
            name: promptPresetName,
            prompts: cloneJson(asArray(rawPreset.prompts)),
            promptOrder: cloneJson(rawPreset.prompt_order),
            rawPreset,
            activeCharacterId,
            activeOrder: cloneJson(activeOrder),
        },
        sections,
        updatedAt: Date.now(),
    });
}

function getComponentNames(): Record<string, string[]> {
    return {
        promptManager: getPresetManager('openai')?.getAllPresets?.() || [],
    };
}

export function listTavernChatPresetBundles(): Record<string, unknown> {
    const active = buildCurrentBundle();
    return {
        active,
        bundles: [active],
        components: getComponentNames(),
    };
}

export function getTavernChatPresetBundle(): TavernChatPromptPresetBundle {
    return buildCurrentBundle();
}

function stableJson(value: unknown): string {
    return JSON.stringify(value ?? null);
}

function promptOrderForCharacter(promptOrder: unknown, characterId = ''): unknown[] {
    const targetId = normalizeText(characterId);
    if (!targetId) {return [];}
    const container = asArray<Record<string, unknown>>(promptOrder)
        .find((item) => normalizeText(asRecord(item).character_id) === targetId);
    return asArray(asRecord(container).order);
}

function assertSavedPromptManagerPreset(
    manager: PromptPresetManager,
    name: string,
    patch: Record<string, unknown>,
    activeCharacterId: string,
    activeOrder: unknown[],
): void {
    const saved = asRecord(manager.getCompletionPresetByName?.(name));
    if (!Object.keys(saved).length) {
        throw new Error(`聊天预设保存后无法读取：${name}`);
    }
    if (Array.isArray(patch.prompts) && stableJson(saved.prompts) !== stableJson(patch.prompts)) {
        throw new Error('聊天预设保存失败：prompts 未写回酒馆。');
    }
    if (
        Array.isArray(patch.prompt_order)
        && activeCharacterId
        && stableJson(promptOrderForCharacter(saved.prompt_order, activeCharacterId)) !== stableJson(activeOrder)
    ) {
        throw new Error('聊天预设保存失败：当前角色 prompt_order 未写回酒馆。');
    }
}

async function savePromptManagerPreset(bundle: TavernChatPromptPresetBundle): Promise<void> {
    const manager = getRequiredPromptManager();
    const name = normalizeText(bundle.promptManager?.name);
    if (!name) {
        throw new Error('聊天预设名称为空。');
    }
    if (typeof manager.savePreset !== 'function') {
        throw new Error('酒馆 Prompt Manager 不支持保存预设。');
    }
    const selectedName = normalizeText(manager.getSelectedPresetName?.());
    if (selectedName && selectedName !== name) {
        throw new Error('酒馆当前预设已切换，请刷新后再保存。');
    }
    const existing = cloneJson(manager.getCompletionPresetByName?.(name) || {});
    if (!Object.keys(asRecord(existing)).length) {
        throw new Error(`聊天预设不存在：${name}`);
    }
    const currentActiveCharacterId = getActivePromptManagerCharacterId();
    const submittedActiveCharacterId = normalizeText(bundle.promptManager?.activeCharacterId);
    if (!currentActiveCharacterId || !submittedActiveCharacterId || currentActiveCharacterId !== submittedActiveCharacterId) {
        throw new Error('未取得当前角色顺序，请刷新后再保存。');
    }
    const patch: Record<string, unknown> = { ...asRecord(existing) };
    if (Array.isArray(bundle.promptManager?.prompts)) {
        patch.prompts = cloneJson(bundle.promptManager.prompts);
    }
    if (Array.isArray(bundle.promptManager?.activeOrder)) {
        patch.prompt_order = replaceActivePromptOrder(
            asRecord(existing).prompt_order,
            currentActiveCharacterId,
            bundle.promptManager.activeOrder,
        );
    }
    await manager.savePreset(name, patch);
    assertSavedPromptManagerPreset(manager, name, patch, currentActiveCharacterId, bundle.promptManager?.activeOrder || []);
    if (promptManager?.serviceSettings) {
        Object.assign(promptManager.serviceSettings, pickPromptManagerRuntimeFields(patch));
    }
    setPromptManagerSelectedPresetName(name);
    promptManager?.saveServiceSettings?.();
    promptManager?.render?.(false);
}

function applyPromptManagerPromptFieldsFromPreset(name = ''): boolean {
    const manager = getRequiredPromptManager();
    const presetName = normalizeText(name);
    if (!presetName) {
        throw new Error('聊天预设名称为空。');
    }
    const preset = asRecord(manager.getCompletionPresetByName?.(presetName));
    if (!Object.keys(preset).length) {
        throw new Error(`聊天预设不存在：${presetName}`);
    }
    if (promptManager?.serviceSettings) {
        const promptFields = pickPromptManagerRuntimeFields(preset);
        if (!Array.isArray(promptFields.prompts) || !Array.isArray(promptFields.prompt_order)) {
            throw new Error(`聊天预设缺少 prompts 或 prompt_order：${presetName}`);
        }
        Object.assign(promptManager.serviceSettings, promptFields);
    }
    setPromptManagerSelectedPresetName(presetName);
    promptManager?.saveServiceSettings?.();
    promptManager?.render?.(false);
    return true;
}

export async function saveTavernChatPresetBundle(input: unknown): Promise<TavernChatPromptPresetBundle> {
    const bundle = normalizeTavernChatPromptPresetBundle(asRecord(input));
    await savePromptManagerPreset(bundle);
    saveSettingsDebounced?.();
    return buildCurrentBundle();
}

export async function selectTavernChatPresetBundle(input: unknown): Promise<TavernChatPromptPresetBundle> {
    const source = asRecord(input);
    const promptManagerName = normalizeText(source.promptManagerName || source.name);
    if (!promptManagerName) {
        throw new Error('聊天预设名称为空。');
    }
    applyPromptManagerPromptFieldsFromPreset(promptManagerName);
    saveSettingsDebounced?.();
    return buildCurrentBundle();
}
