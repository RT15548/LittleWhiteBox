import type { Component, Ref } from 'vue';

export const TAVERN_PHONE_MESSAGES_APP_ID = 'messages';

export type TavernPhonePresentationMode = 'desktop-device' | 'mobile-fullscreen';

export type TavernPhoneOsRoute =
    | { kind: 'home' }
    | {
        kind: 'app';
        appId: string;
        path: string;
        params?: Record<string, string>;
    };

export interface TavernPhoneAppManifest {
    id: string;
    name: string;
    shortName: string;
    icon: string;
    accent: string;
    rootPath: string;
    order: number;
}

export interface TavernPhoneAppDefinition extends TavernPhoneAppManifest {
    component: Component;
    badge?: Readonly<Ref<number>>;
    isAvailable?: Readonly<Ref<boolean>>;
    onActivate?: () => void | Promise<void>;
    onDeactivate?: () => void | Promise<void>;
}

export function defineTavernPhoneApps(
    definitions: readonly TavernPhoneAppDefinition[],
): readonly TavernPhoneAppDefinition[] {
    const ids = new Set<string>();
    const normalized = definitions.map((definition) => {
        const id = String(definition.id || '').trim();
        const rootPath = String(definition.rootPath || '').trim();
        if (!id || !rootPath.startsWith('/') || !definition.component) {
            throw new Error('invalid_phone_app_definition');
        }
        if (ids.has(id)) {throw new Error(`duplicate_phone_app_definition:${id}`);}
        ids.add(id);
        return Object.freeze({ ...definition, id, rootPath });
    });
    return Object.freeze(normalized.sort((left, right) => left.order - right.order));
}

export function createTavernPhoneHomeRoute(): TavernPhoneOsRoute {
    return { kind: 'home' };
}

export function createTavernPhoneAppRoute(
    appId: string,
    path: string,
    params?: Record<string, string>,
): TavernPhoneOsRoute {
    return {
        kind: 'app',
        appId: String(appId || '').trim(),
        path: String(path || '').trim() || '/',
        ...(params ? { params: { ...params } } : {}),
    };
}
