export interface GameSettings {
    movingSoundEnabled: boolean;
    buildingSoundEnabled: boolean;
}

export const DEFAULT_MOVING_SOUND_ENABLED = true;
export const DEFAULT_BUILDING_SOUND_ENABLED = true;

export function normalizeGameSettings(value: unknown): GameSettings {
    const input = value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown> : {};
    return { movingSoundEnabled: typeof input.movingSoundEnabled === 'boolean'
        ? input.movingSoundEnabled : DEFAULT_MOVING_SOUND_ENABLED,
    buildingSoundEnabled: typeof input.buildingSoundEnabled === 'boolean' ? input.buildingSoundEnabled : DEFAULT_BUILDING_SOUND_ENABLED };
}
