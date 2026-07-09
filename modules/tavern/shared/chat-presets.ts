import type { TavernChatPromptPresetBundle, TavernChatPromptSection } from './message-assembler';

export const FALLBACK_TAVERN_CHAT_PRESET_ID = 'sillytavern-current-chat-prompt';

export function createFallbackTavernChatPromptPresetBundle(): TavernChatPromptPresetBundle {
    return {
        id: FALLBACK_TAVERN_CHAT_PRESET_ID,
        name: '酒馆当前聊天预设',
        source: 'sillytavern',
        selected: true,
        sections: [],
    };
}

export function normalizeTavernChatPromptSection(section: Partial<TavernChatPromptSection> = {}): TavernChatPromptSection {
    return {
        id: String(section.id || '').trim(),
        label: String(section.label || '').trim(),
        enabled: section.enabled !== false,
        marker: section.marker === true,
        role: section.role || 'system',
        content: String(section.content || '').trim(),
        placement: section.placement || 'beforeHistory',
        source: String(section.source || 'manual').trim(),
    };
}

export function normalizeTavernChatPromptPresetBundle(
    input: Partial<TavernChatPromptPresetBundle> = {},
): TavernChatPromptPresetBundle {
    const fallback = createFallbackTavernChatPromptPresetBundle();
    return {
        id: String(input.id || fallback.id).trim() || fallback.id,
        name: String(input.name || fallback.name).trim() || fallback.name,
        description: String(input.description || ''),
        version: String(input.version || ''),
        source: String(input.source || fallback.source || 'sillytavern'),
        selected: input.selected !== false,
        promptManager: input.promptManager,
        systemPrompt: input.systemPrompt,
        contextTemplate: input.contextTemplate,
        instructTemplate: input.instructTemplate,
        historySeparator: String(input.historySeparator || ''),
        sections: Array.isArray(input.sections)
            ? input.sections.map(normalizeTavernChatPromptSection).filter((section) => section.content || section.marker)
            : [],
        updatedAt: Number(input.updatedAt) || undefined,
    };
}
