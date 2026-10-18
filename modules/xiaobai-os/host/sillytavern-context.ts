import { extension_settings, getContext } from '../../../../../../extensions.js';
import { saveSettings as saveSettingsNow } from '../../../../../../../script.js';
import { EXT_ID } from '../../../core/constants.js';
import type { XiaobaiOsChatIdentity } from '../types.js';
import { countAssistantTurns } from './assistant-turn-count.js';
import { captureStoryIdentity } from './story-identity.js';
import type { XiaobaiOsSettingsAdapter } from './settings-repository.js';

type UnknownRecord = Record<string, unknown>;
const DARK_THEME_CLASSES = new Set(['dark', 'dark-theme', 'theme-dark', 'neo-dark']);
const LIGHT_THEME_CLASSES = new Set(['light', 'light-theme', 'theme-light', 'neo-light']);

interface SillyTavernMessage {
    name?: unknown;
    is_user?: boolean;
    is_system?: boolean;
    mes?: unknown;
    extra?: unknown;
}

interface SillyTavernContext {
    chatId?: unknown;
    groupId?: unknown;
    characterId?: unknown;
    characters?: Record<string, { avatar?: unknown; name?: unknown }>;
    name1?: unknown;
    name2?: unknown;
    chat?: SillyTavernMessage[];
}

export interface XiaobaiOsShellSnapshot {
    theme: 'light' | 'dark';
    chat: null | {
        identity: string;
        characterName: string;
        characterAvatar: string;
    };
}

export interface XiaobaiOsChatSurface {
    identityKey: string;
    messages: unknown[];
    playerName: string;
    assistantName: string;
}

function getSillyTavernContext(): SillyTavernContext {
    return getContext() as unknown as SillyTavernContext;
}

function captureIdentity(context: SillyTavernContext = getSillyTavernContext()): XiaobaiOsChatIdentity | null {
    return captureStoryIdentity(context);
}

function resolveCharacterAvatar(context: SillyTavernContext): string {
    const characterId =
        context.characterId === null || context.characterId === undefined ? '' : String(context.characterId);
    const character = context.characters?.[characterId];
    const avatar = typeof character?.avatar === 'string' ? character.avatar : '';
    if (!avatar) {
        return '';
    }
    if (/^(?:data:|blob:|https?:|\/)/i.test(avatar)) {
        return avatar;
    }
    return `/characters/${avatar
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/')}`;
}

function explicitDocumentTheme(): XiaobaiOsShellSnapshot['theme'] | null {
    for (const element of [document.documentElement, document.body]) {
        if (!element) {continue;}
        const dataTheme = String(element.getAttribute('data-theme') || '').trim().toLowerCase();
        if (DARK_THEME_CLASSES.has(dataTheme) || dataTheme === 'dark') {return 'dark';}
        if (LIGHT_THEME_CLASSES.has(dataTheme) || dataTheme === 'light') {return 'light';}
        const classes = Array.from(element.classList, value => value.toLowerCase());
        if (classes.some(value => DARK_THEME_CLASSES.has(value))) {return 'dark';}
        if (classes.some(value => LIGHT_THEME_CLASSES.has(value))) {return 'light';}
    }
    return null;
}

function parseRgbColor(value: string): [number, number, number] | null {
    const normalized = value.trim().toLowerCase();
    const hex = normalized.match(/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/u)?.[1];
    if (hex) {
        const expanded = hex.length <= 4
            ? Array.from(hex, character => `${character}${character}`).join('')
            : hex;
        if (expanded.length === 8 && Number.parseInt(expanded.slice(6), 16) === 0) {return null;}
        return [0, 2, 4].map(offset => Number.parseInt(expanded.slice(offset, offset + 2), 16)) as [number, number, number];
    }
    const rgb = normalized.match(/^rgba?\((.*)\)$/u)?.[1];
    if (!rgb) {return null;}
    const components = rgb.replaceAll(',', ' ').replace('/', ' / ').split(/\s+/u).filter(Boolean);
    const separator = components.indexOf('/');
    const colorComponents = separator < 0 ? components.slice(0, 3) : components.slice(0, separator);
    if (colorComponents.length !== 3) {return null;}
    if (separator >= 0) {
        const alpha = components[separator + 1] || '';
        const alphaValue = alpha.endsWith('%') ? Number.parseFloat(alpha) / 100 : Number.parseFloat(alpha);
        if (Number.isFinite(alphaValue) && alphaValue === 0) {return null;}
    } else if (components.length === 4 && Number.parseFloat(components[3]) === 0) {
        return null;
    }
    const channels = colorComponents.map(component => {
        const channel = Number.parseFloat(component);
        return component.endsWith('%') ? channel * 2.55 : channel;
    });
    return channels.every(Number.isFinite)
        ? channels.map(channel => Math.max(0, Math.min(255, channel))) as [number, number, number]
        : null;
}

function themeFromColor(value: string): XiaobaiOsShellSnapshot['theme'] | null {
    const channels = parseRgbColor(value);
    if (!channels) {return null;}
    const luminance = channels
        .map(channel => channel / 255)
        .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
        .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
    return luminance > 0.4 ? 'light' : 'dark';
}

function resolveDocumentTheme(): XiaobaiOsShellSnapshot['theme'] {
    const explicit = explicitDocumentTheme();
    if (explicit) {return explicit;}
    const rootStyle = getComputedStyle(document.documentElement);
    for (const value of [
        rootStyle.getPropertyValue('--SmartThemeChatTintColor'),
        rootStyle.getPropertyValue('--SmartThemeBlurTintColor'),
        document.body ? getComputedStyle(document.body).backgroundColor : '',
        rootStyle.backgroundColor,
    ]) {
        const theme = themeFromColor(value);
        if (theme) {return theme;}
    }
    return 'dark';
}

export function createSillyTavernSettingsAdapter(): XiaobaiOsSettingsAdapter {
    const settingsRoot = extension_settings as unknown as Record<string, UnknownRecord | undefined>;
    return {
        getExtensionSettings() {
            settingsRoot[EXT_ID] ||= {};
            return settingsRoot[EXT_ID];
        },
        saveSettings() {
            // Readback failure cannot undo a completed host write. Keep the native save boundary.
            return saveSettingsNow();
        },
    };
}

export function getSillyTavernChatSurface(): XiaobaiOsChatSurface | null {
    const context = getSillyTavernContext();
    const identity = captureIdentity(context);
    if (!identity) {return null;}
    return {
        identityKey: identity.key,
        messages: context.chat || [],
        playerName: String(context.name1 || 'User').trim() || 'User',
        assistantName: String(context.name2 || 'Assistant').trim() || 'Assistant',
    };
}

export function getSillyTavernAssistantTurnCount(expectedIdentityKey?: string): number {
    const context = getSillyTavernContext();
    const identity = captureIdentity(context);
    if (!identity || (expectedIdentityKey && identity.key !== expectedIdentityKey)) {
        throw Object.assign(new Error('读取回合数前聊天已经切换'), { code: 'CHAT_CHANGED' });
    }
    return countAssistantTurns(context.chat || []);
}

export function getSillyTavernChatIdentity(): XiaobaiOsChatIdentity | null {
    return captureIdentity();
}

export function getSillyTavernShellSnapshot(): XiaobaiOsShellSnapshot {
    const context = getSillyTavernContext();
    const identity = captureIdentity(context);
    return {
        theme: resolveDocumentTheme(),
        chat: identity
            ? {
                  identity: identity.key,
                  characterName: String(context.name2 || ''),
                  characterAvatar: resolveCharacterAvatar(context),
              }
            : null,
    };
}
