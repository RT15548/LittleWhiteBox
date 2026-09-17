import type { WorldSettings } from './types.js';

export function normalizeWorldSettings(value: unknown): WorldSettings {
    const input = value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown> : {};
    return {
        subscribed: typeof input.subscribed === 'boolean' ? input.subscribed : false,
        injectToStory: typeof input.injectToStory === 'boolean' ? input.injectToStory : true,
    };
}
