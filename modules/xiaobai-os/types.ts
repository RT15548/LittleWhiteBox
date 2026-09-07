import type { XiaobaiOsHostFrameMessage } from './host/frame-bridge.js';

export interface XiaobaiOsSettings<TApps extends object = Record<string, unknown>> {
    enabled: boolean;
    appOrder: string[];
    apps: TApps;
}

export interface XiaobaiOsChatIdentity {
    key: string;
    kind: 'group' | 'character';
    ownerId: string;
    chatId: string;
}

export type XiaobaiOsChatIdentityInput = XiaobaiOsChatIdentity | string;

export interface XiaobaiOsAppDescriptor {
    id: string;
    name: string;
    accent: string;
}

export interface XiaobaiOsAppActivationContext {
    activationToken: string;
    isCurrent: () => boolean;
    post: (type: string, payload?: unknown, responseId?: string) => boolean;
}

export interface XiaobaiOsAppRuntime {
    activate?: (context: XiaobaiOsAppActivationContext) => unknown | Promise<unknown>;
    deactivate?: (reason: string) => void | Promise<void>;
    handleMessage?: (message: XiaobaiOsHostFrameMessage) => unknown | Promise<unknown>;
    cancelForeground?: (reason: string) => void | Promise<void>;
    cancelAll?: (reason: string) => void | Promise<void>;
    handleWindowOpened?: () => void | Promise<void>;
    handleWindowClosed?: (reason: string) => void | Promise<void>;
    handleChatChanged?: () => void | Promise<void>;
    startBackground?: () => void | Promise<void>;
    stopBackground?: () => void | Promise<void>;
}

export interface XiaobaiOsAppRuntimeRegistration {
    descriptor: Readonly<XiaobaiOsAppDescriptor>;
    runtime: XiaobaiOsAppRuntime;
}

export interface XiaobaiOsAppRuntimeRouter {
    getDescriptors: () => readonly Readonly<XiaobaiOsAppDescriptor>[];
    activate: (appId: string, context: XiaobaiOsAppActivationContext) => unknown | Promise<unknown>;
    deactivate: (appId: string, reason: string) => void | Promise<void>;
    handleMessage: (appId: string, message: XiaobaiOsHostFrameMessage) => unknown | Promise<unknown>;
    retry?: (appId: string) => void | Promise<void>;
    cancelForeground: (reason: string) => void | Promise<void>;
    cancelAll: (reason: string) => void | Promise<void>;
    handleWindowOpened: () => void | Promise<void>;
    handleWindowClosed: (reason: string) => void | Promise<void>;
    handleChatChanged: () => void | Promise<void>;
    startBackground: () => void | Promise<void>;
    stopBackground: () => void | Promise<void>;
}
