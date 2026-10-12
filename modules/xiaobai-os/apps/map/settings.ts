import type { MapSettings } from './types.js';

export function normalizeMapSettings(value: unknown): MapSettings {
    const settings = value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown> : {};
    return { autoMaintenance: settings.autoMaintenance === true, projectToChat: settings.projectToChat === true };
}
