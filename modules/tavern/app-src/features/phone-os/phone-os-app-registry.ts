import {
    TAVERN_PHONE_MESSAGES_APP_ID,
    type TavernPhoneAppManifest,
} from './phone-os-types';

export const TAVERN_PHONE_OS_APPS: readonly TavernPhoneAppManifest[] = Object.freeze([
    Object.freeze({
        id: TAVERN_PHONE_MESSAGES_APP_ID,
        name: '信息',
        shortName: '信息',
        icon: 'forum',
        accent: '#4b78ff',
        rootPath: '/threads',
        order: 10,
    }),
]);

export function listTavernPhoneApps(): TavernPhoneAppManifest[] {
    return [...TAVERN_PHONE_OS_APPS].sort((left, right) => left.order - right.order);
}
export function getTavernPhoneApp(appId = ''): TavernPhoneAppManifest | null {
    const id = String(appId || '').trim();
    return TAVERN_PHONE_OS_APPS.find((app) => app.id === id) || null;
}
