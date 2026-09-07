import type { FourthWallGlobalSettings } from '../apps/fourth-wall/types.js';
import type { MapSettings } from '../apps/map/types.js';
import type { TasksSettings } from '../apps/tasks/types.js';
import type { XiaobaiOsSettings as XiaobaiOsSettingsRoot } from '../types.js';
import { jsonValuesEqual } from './json-values-equal.js';
import { normalizeAppOrder } from '../shell/app-order.js';
import {
    isXiaobaiOsSettings,
    LEGACY_FOURTH_WALL_SETTING_KEYS,
    migrateUpstreamFourthWallSettings,
    normalizeXiaobaiOsSettings,
    type LegacyFourthWallSettingKey,
} from './settings-normalization.js';

type XiaobaiOsSettings = XiaobaiOsSettingsRoot<{
    fourthWall: FourthWallGlobalSettings;
    map: MapSettings;
    tasks: TasksSettings;
}>;

type UnknownRecord = Record<string, unknown>;

class XiaobaiOsSettingsError extends Error {
    readonly code: string;

    constructor(code: string, message: string) {
        super(message);
        this.name = 'XiaobaiOsSettingsError';
        this.code = code;
    }
}

function cloneSettings<T>(value: T): T {
    return structuredClone(value);
}

export interface XiaobaiOsSettingsAdapter {
    getExtensionSettings: () => UnknownRecord;
    saveSettings: () => Promise<void> | void;
}

export interface XiaobaiOsSettingsRepository {
    prepare: () => Promise<XiaobaiOsSettings>;
    read: () => XiaobaiOsSettings | null;
    setEnabled: (enabled: boolean) => Promise<XiaobaiOsSettings>;
    setAppOrder: (order: readonly string[]) => Promise<XiaobaiOsSettings>;
    setMapAutoMaintenance: (enabled: boolean) => Promise<XiaobaiOsSettings>;
    setTasksAutoMaintenance: (enabled: boolean) => Promise<XiaobaiOsSettings>;
    mutateFourthWall: (
        action: (current: FourthWallGlobalSettings) => FourthWallGlobalSettings,
    ) => Promise<XiaobaiOsSettings>;
    subscribe: (listener: (settings: XiaobaiOsSettings) => void) => () => void;
    subscribeMutationInstalled: (listener: (settings: XiaobaiOsSettings) => void) => () => void;
    legacyKeys: readonly LegacyFourthWallSettingKey[];
}

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertValidSettings(value: unknown): asserts value is XiaobaiOsSettings {
    if (!isXiaobaiOsSettings(value)) {
        throw new XiaobaiOsSettingsError('INVALID_CURRENT_DATA', 'Xiaobai OS settings are invalid');
    }
}

function requireSettingsRoot(adapter: XiaobaiOsSettingsAdapter): UnknownRecord {
    const root = adapter.getExtensionSettings();
    if (!isRecord(root)) {
        throw new XiaobaiOsSettingsError('SETTINGS_UNAVAILABLE', 'LittleWhiteBox settings are unavailable');
    }
    return root;
}

function createWriteQueue() {
    let tail: Promise<unknown> = Promise.resolve();
    return <T>(task: () => Promise<T> | T): Promise<T> => {
        const result = tail.then(task);
        tail = result.catch(() => {});
        return result;
    };
}

/**
 * Creates the sole repository for persistent Xiaobai OS extension settings.
 * Settings are ordinary SillyTavern preferences: mutations install in memory
 * immediately and ask the host to persist them through its normal save path.
 */
export function createSettingsRepository(adapter: XiaobaiOsSettingsAdapter): XiaobaiOsSettingsRepository {
    if (typeof adapter?.getExtensionSettings !== 'function' || typeof adapter?.saveSettings !== 'function') {
        throw new TypeError('settings repository requires getExtensionSettings and saveSettings');
    }
    const enqueueWrite = createWriteQueue();
    const listeners = new Set<(settings: XiaobaiOsSettings) => void>();
    const mutationInstalledListeners = new Set<(settings: XiaobaiOsSettings) => void>();

    function publish(settings: XiaobaiOsSettings): void {
        for (const listener of listeners) {
            try {
                listener(cloneSettings(settings));
            } catch (error) {
                console.error('[LittleWhiteBox] 小白 OS 设置监听失败', error);
            }
        }
    }

    function publishMutationInstalled(settings: XiaobaiOsSettings): void {
        for (const listener of mutationInstalledListeners) {
            try {
                listener(cloneSettings(settings));
            } catch (error) {
                console.error('[LittleWhiteBox] 小白 OS 设置写入监听失败', error);
            }
        }
    }

    async function saveInstalled(installed: XiaobaiOsSettings): Promise<XiaobaiOsSettings> {
        publishMutationInstalled(installed);
        publish(installed);
        await adapter.saveSettings();
        return cloneSettings(installed);
    }

    function read(): XiaobaiOsSettings | null {
        const root = requireSettingsRoot(adapter);
        if (!Object.hasOwn(root, 'xiaobaiOs')) {
            return null;
        }
        assertValidSettings(root.xiaobaiOs);
        return cloneSettings(root.xiaobaiOs);
    }

    async function prepare(): Promise<XiaobaiOsSettings> {
        return enqueueWrite(async () => {
            const root = requireSettingsRoot(adapter);
            const hadSettings = Object.hasOwn(root, 'xiaobaiOs');
            const previous = root.xiaobaiOs;
            const migration = hadSettings
                ? {
                    value: normalizeXiaobaiOsSettings(previous),
                    legacyKeys: LEGACY_FOURTH_WALL_SETTING_KEYS.filter((key) => Object.hasOwn(root, key)),
                }
                : migrateUpstreamFourthWallSettings(root);
            const installed = cloneSettings(migration.value);
            const changed = !hadSettings
                || !jsonValuesEqual(previous, installed)
                || migration.legacyKeys.length > 0;
            root.xiaobaiOs = installed;
            migration.legacyKeys.forEach((key) => delete root[key]);
            if (changed) {
                await adapter.saveSettings();
            }
            return cloneSettings(installed);
        });
    }

    async function mutate(action: (current: XiaobaiOsSettings) => XiaobaiOsSettings): Promise<XiaobaiOsSettings> {
        if (typeof action !== 'function') {
            throw new TypeError('settings mutation action must be a function');
        }
        return enqueueWrite(async () => {
            const root = requireSettingsRoot(adapter);
            if (!Object.hasOwn(root, 'xiaobaiOs')) {
                throw new XiaobaiOsSettingsError('SETTINGS_NOT_PREPARED', 'Xiaobai OS settings have not been prepared');
            }
            assertValidSettings(root.xiaobaiOs);
            const previous = cloneSettings(root.xiaobaiOs);
            const next = action(cloneSettings(previous));
            if (!isRecord(next)) {
                throw new TypeError('settings mutation action must return the complete next state');
            }
            assertValidSettings(next);
            const installed = cloneSettings(next);
            root.xiaobaiOs = installed;
            return saveInstalled(installed);
        });
    }

    function setEnabled(enabled: boolean): Promise<XiaobaiOsSettings> {
        if (typeof enabled !== 'boolean') {
            throw new TypeError('enabled must be a boolean');
        }
        return mutate((next) => {
            next.enabled = enabled;
            return next;
        });
    }

    function setMapAutoMaintenance(enabled: boolean): Promise<XiaobaiOsSettings> {
        if (typeof enabled !== 'boolean') {
            throw new TypeError('map auto-maintenance must be a boolean');
        }
        return mutate((next) => {
            next.apps.map.autoMaintenance = enabled;
            return next;
        });
    }

    function setAppOrder(order: readonly string[]): Promise<XiaobaiOsSettings> {
        const normalized = normalizeAppOrder(order);
        if (!Array.isArray(order) || normalized.length !== order.length) {
            return Promise.reject(new TypeError('invalid_app_order'));
        }
        return mutate(next => ({ ...next, appOrder: normalized }));
    }

    function setTasksAutoMaintenance(enabled: boolean): Promise<XiaobaiOsSettings> {
        if (typeof enabled !== 'boolean') {
            throw new TypeError('tasks auto-maintenance must be a boolean');
        }
        return mutate((next) => {
            next.apps.tasks.autoMaintenance = enabled;
            return next;
        });
    }

    function mutateFourthWall(
        action: (current: FourthWallGlobalSettings) => FourthWallGlobalSettings,
    ): Promise<XiaobaiOsSettings> {
        if (typeof action !== 'function') {
            throw new TypeError('fourth-wall settings action must be a function');
        }
        return mutate((next) => {
            const result = action(cloneSettings(next.apps.fourthWall));
            if (!isRecord(result)) {
                throw new TypeError('fourth-wall settings action must return the complete next state');
            }
            next.apps.fourthWall = result;
            return next;
        });
    }

    function subscribe(listener: (settings: XiaobaiOsSettings) => void): () => void {
        if (typeof listener !== 'function') {
            throw new TypeError('settings listener must be a function');
        }
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    function subscribeMutationInstalled(listener: (settings: XiaobaiOsSettings) => void): () => void {
        if (typeof listener !== 'function') {
            throw new TypeError('settings mutation listener must be a function');
        }
        mutationInstalledListeners.add(listener);
        return () => mutationInstalledListeners.delete(listener);
    }

    return Object.freeze({
        prepare,
        read,
        setEnabled,
        setAppOrder,
        setMapAutoMaintenance,
        setTasksAutoMaintenance,
        mutateFourthWall,
        subscribe,
        subscribeMutationInstalled,
        legacyKeys: LEGACY_FOURTH_WALL_SETTING_KEYS,
    });
}
