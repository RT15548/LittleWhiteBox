import { AssistantStorage } from '../../../core/server-storage.js';
import { normalizeTavernDisplaySettings, type TavernDisplaySettings } from '../shared/settings.js';

const SERVER_FILE_KEY = 'tavern-display-settings';

export async function loadTavernDisplaySettings(): Promise<TavernDisplaySettings> {
    try {
        return normalizeTavernDisplaySettings(await AssistantStorage.get(SERVER_FILE_KEY, null) || {});
    } catch {
        return normalizeTavernDisplaySettings({});
    }
}

export async function saveTavernDisplaySettings(patch: Record<string, unknown> = {}, options: {
    silent?: boolean;
} = {}): Promise<{ ok: boolean; displaySettings: TavernDisplaySettings; error?: string }> {
    const silent = options.silent !== false;
    const next = normalizeTavernDisplaySettings(patch);

    try {
        const data = await AssistantStorage.load();
        data[SERVER_FILE_KEY] = next;
        AssistantStorage._dirtyVersion = (AssistantStorage._dirtyVersion || 0) + 1;
        await AssistantStorage.saveNow({ silent });
        return { ok: true, displaySettings: next };
    } catch (error) {
        return {
            ok: false,
            displaySettings: next,
            error: error instanceof Error ? error.message : String(error || 'unknown_error'),
        };
    }
}
