import { normalizeFourthWallGlobalSettings } from '../apps/fourth-wall/domain/defaults.js';
import type { FourthWallGlobalSettings } from '../apps/fourth-wall/types.js';
import { normalizeMapSettings } from '../apps/map/settings.js';
import type { MapSettings } from '../apps/map/types.js';
import { normalizeTasksSettings } from '../apps/tasks/settings.js';
import type { TasksSettings } from '../apps/tasks/types.js';
import type { XiaobaiOsSettings as XiaobaiOsSettingsRoot } from '../types.js';
import { jsonValuesEqual } from './json-values-equal.js';
import { normalizeAppOrder } from '../shell/app-order.js';

type UnknownRecord = Record<string, unknown>;
const DEFAULT_OS_ENABLED = true;

export type XiaobaiOsSettings = XiaobaiOsSettingsRoot<{
    fourthWall: FourthWallGlobalSettings;
    map: MapSettings;
    tasks: TasksSettings;
}>;

export const LEGACY_FOURTH_WALL_SETTING_KEYS = Object.freeze([
    'fourthWall',
    'fourthWallImage',
    'fourthWallVoice',
    'fourthWallCommentary',
    'fourthWallPromptTemplates',
    'dynamicPrompt',
] as const);

export type LegacyFourthWallSettingKey = (typeof LEGACY_FOURTH_WALL_SETTING_KEYS)[number];

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function recordOrEmpty(value: unknown): UnknownRecord {
    return isRecord(value) ? value : {};
}

function booleanOr(value: unknown, fallback: boolean): boolean {
    return typeof value === 'boolean' ? value : fallback;
}

export function createDefaultXiaobaiOsSettings(): XiaobaiOsSettings {
    return {
        enabled: DEFAULT_OS_ENABLED,
        appOrder: [],
        apps: {
            fourthWall: normalizeFourthWallGlobalSettings(undefined),
            map: normalizeMapSettings(undefined),
            tasks: normalizeTasksSettings(undefined),
        },
    };
}

/**
 * Normalizes user preferences by their current owners. Obsolete root/app version
 * markers are intentionally not copied into the installed settings object.
 */
export function normalizeXiaobaiOsSettings(value: unknown): XiaobaiOsSettings {
    const root = recordOrEmpty(value);
    const apps = recordOrEmpty(root.apps);
    return {
        enabled: booleanOr(root.enabled, DEFAULT_OS_ENABLED),
        appOrder: normalizeAppOrder(root.appOrder),
        apps: {
            fourthWall: normalizeFourthWallGlobalSettings(apps.fourthWall),
            map: normalizeMapSettings(apps.map),
            tasks: normalizeTasksSettings(apps.tasks),
        },
    };
}

export function migrateUpstreamFourthWallSettings(extensionSettings: unknown): {
    value: XiaobaiOsSettings;
    legacyKeys: LegacyFourthWallSettingKey[];
} {
    const source = recordOrEmpty(extensionSettings);
    const fourthWall = recordOrEmpty(source.fourthWall);
    const dynamicPrompt = recordOrEmpty(source.dynamicPrompt);
    const image = recordOrEmpty(source.fourthWallImage);
    const voice = recordOrEmpty(source.fourthWallVoice);
    const commentary = recordOrEmpty(source.fourthWallCommentary);
    const templates = recordOrEmpty(source.fourthWallPromptTemplates);
    return {
        value: {
            appOrder: [],
            enabled: Object.hasOwn(source, 'fourthWall')
                ? booleanOr(fourthWall.enabled, DEFAULT_OS_ENABLED)
                : booleanOr(dynamicPrompt.enabled, DEFAULT_OS_ENABLED),
            apps: {
                fourthWall: normalizeFourthWallGlobalSettings({
                    image: {
                        enablePrompt: image.enablePrompt,
                    },
                    voice: {
                        enabled: voice.enabled,
                    },
                    commentary: {
                        enabled: commentary.enabled,
                        probability: commentary.probability,
                    },
                    promptTemplates: {
                        topuser: templates.topuser,
                        confirm: templates.confirm,
                        metaProtocol: templates.metaProtocol,
                        bottom: templates.bottom,
                    },
                }),
                map: normalizeMapSettings(undefined),
                tasks: normalizeTasksSettings(undefined),
            },
        },
        legacyKeys: LEGACY_FOURTH_WALL_SETTING_KEYS.filter((key) => Object.hasOwn(source, key)),
    };
}

export function isXiaobaiOsSettings(value: unknown): value is XiaobaiOsSettings {
    if (!isRecord(value) || typeof value.enabled !== 'boolean' || !isRecord(value.apps)) {
        return false;
    }
    const normalized = normalizeXiaobaiOsSettings(value);
    return jsonValuesEqual(value, normalized);
}
