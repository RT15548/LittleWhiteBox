import { apiFieldsFor, createDefaultSettings, normalizeSettings, validateConnection } from './settings-model.js';

export function createSettingsRepository(getStorage) {
    const cache = new Map(), queues = new Map(), listeners = new Map();
    const get = provider => structuredClone(cache.get(provider) || createDefaultSettings(provider));
    async function load(provider) {
        if (!cache.has(provider)) {
            const loaded = normalizeSettings(provider, await getStorage(provider).getStrict('settings', null));
            if (!cache.has(provider)) cache.set(provider, loaded);
        }
        return get(provider);
    }
    function update(provider, mutator) {
        const before = queues.get(provider) || Promise.resolve();
        const task = before.then(async () => {
            const draft = await load(provider);
            await mutator(draft);
            const selected = draft.apiPresets.find(item => item.id === draft.activeApiPresetId);
            if (selected) selected.config = validateConnection(provider, draft);
            const normalized = normalizeSettings(provider, draft);
            const persisted = structuredClone(normalized);
            // Active connection is a projection, not a second persisted copy.
            for (const field of apiFieldsFor(provider)) delete persisted[field];
            await getStorage(provider).setAndSave('settings', persisted);
            cache.set(provider, normalized);
            for (const listener of listeners.get(provider) || []) {
                try { listener(get(provider)); }
                catch (error) { console.error({ source: import.meta.url, operation: 'settingsChanged' }, error); }
            }
            return get(provider);
        });
        // A failed write rejects its caller but does not poison later writes.
        queues.set(provider, task.then(() => undefined, () => undefined));
        return task;
    }
    return { get, load, update,
        save: (provider, value) => {
            const snapshot = structuredClone(value);
            return update(provider, draft => {
                for (const key of Object.keys(draft)) delete draft[key];
                Object.assign(draft, snapshot);
            });
        },
        subscribe(provider, listener) {
            if (!listeners.has(provider)) listeners.set(provider, new Set());
            listeners.get(provider).add(listener);
            return () => listeners.get(provider)?.delete(listener);
        },
    };
}
