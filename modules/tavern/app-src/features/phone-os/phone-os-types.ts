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
