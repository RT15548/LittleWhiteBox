export interface TavernUserOption {
    id: string;
    name: string;
    avatarUrl: string;
    description?: string;
    active: boolean;
}

export type TavernChatFontSize = 'small' | 'medium' | 'large';

export const TAVERN_CHAT_FONT_SIZES: readonly TavernChatFontSize[] = ['small', 'medium', 'large'];

export interface TavernDisplaySettings {
    hiddenOutsideCount: number;
    loadBatchSize: number;
    chatFontSize: TavernChatFontSize;
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function clampInteger(value: unknown, fallback: number, min: number, max: number) {
    const number = Number(value);
    if (!Number.isFinite(number)) {return fallback;}
    return Math.min(max, Math.max(min, Math.floor(number)));
}

function normalizeLoadBatchSize(value: unknown, fallback = 20) {
    return clampInteger(value, fallback, 1, 50);
}

function normalizeChatFontSize(value: unknown): TavernChatFontSize {
    return value === 'small' || value === 'medium' || value === 'large' ? value : 'large';
}

export function normalizeTavernDisplaySettings(value: unknown = {}): TavernDisplaySettings {
    const settings = asRecord(value);
    return {
        hiddenOutsideCount: clampInteger(settings.hiddenOutsideCount, 5, 1, 20),
        loadBatchSize: normalizeLoadBatchSize(settings.loadBatchSize, 20),
        chatFontSize: normalizeChatFontSize(settings.chatFontSize),
    };
}
