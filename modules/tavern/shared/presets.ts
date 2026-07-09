import type { TavernChatPromptPresetBundle } from './message-assembler';
import {
    createFallbackTavernChatPromptPresetBundle,
    FALLBACK_TAVERN_CHAT_PRESET_ID,
} from './chat-presets';

export const DEFAULT_XB_TAVERN_PRESET_ID = FALLBACK_TAVERN_CHAT_PRESET_ID;

export function createDefaultXbTavernPreset(): TavernChatPromptPresetBundle {
    return createFallbackTavernChatPromptPresetBundle();
}

export function listBuiltInXbTavernPresets(): TavernChatPromptPresetBundle[] {
    return [createDefaultXbTavernPreset()];
}
