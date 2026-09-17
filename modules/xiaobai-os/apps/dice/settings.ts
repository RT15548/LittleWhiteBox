import type { ActionCheckFrequency, DiceSettings } from './types.js';

export function isActionCheckFrequency(value: unknown): value is ActionCheckFrequency {
    return value === 'light' || value === 'standard' || value === 'active';
}

export function normalizeDiceSettings(value: unknown): DiceSettings {
    const input = value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown> : {};
    return {
        actionChecksEnabled: typeof input.actionChecksEnabled === 'boolean' ? input.actionChecksEnabled : false,
        actionCheckFrequency: isActionCheckFrequency(input.actionCheckFrequency) ? input.actionCheckFrequency : 'standard',
        encountersEnabled: typeof input.encountersEnabled === 'boolean' ? input.encountersEnabled : false,
    };
}
