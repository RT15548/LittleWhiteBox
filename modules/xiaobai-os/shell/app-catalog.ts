import type { Component } from 'vue';
import { xiaobaiOsLaunchers, type XiaobaiOsAppLauncher } from './app-launchers.js';

interface ComponentModule {
    default: Component;
}

export interface XiaobaiOsAppDefinition extends XiaobaiOsAppLauncher {
    load(): Promise<Component>;
    resetLoader(): void;
}

export function createAppComponentLoader(importer: () => Promise<ComponentModule>): {
    load(): Promise<Component>;
    reset(): void;
} {
    let loaded: Component | null = null;
    let pending: Promise<Component> | null = null;
    return Object.freeze({
        load() {
            if (loaded) { return Promise.resolve(loaded); }
            pending ??= importer().then(module => {
                if (!module?.default) { throw new Error('app_component_missing'); }
                loaded = module.default;
                return loaded;
            }).catch(error => {
                pending = null;
                throw error;
            });
            return pending;
        },
        reset() {
            loaded = null;
            pending = null;
        },
    });
}

const importers: Readonly<Record<string, () => Promise<ComponentModule>>> = Object.freeze({
    'agent-api': () => import('../apps/agent-api/ui/AgentApiApp.vue'),
    'fourth-wall': () => import('../apps/fourth-wall/ui/FourthWallApp.vue'),
    wallet: () => import('../apps/wallet/ui/WalletApp.vue'),
    shop: () => import('../apps/shop/ui/ShopApp.vue'),
    bank: () => import('../apps/bank/ui/BankApp.vue'),
    game: () => import('../apps/game/ui/GameApp.vue'),
    map: () => import('../apps/map/ui/MapApp.vue'),
    messages: () => import('../apps/messages/ui/MessagesApp.vue'),
    tasks: () => import('../apps/tasks/ui/TasksApp.vue'),
    world: () => import('../apps/world/ui/WorldApp.vue'),
    learning: () => import('../apps/learning/ui/LearningApp.vue'),
});

export const xiaobaiOsApps: readonly XiaobaiOsAppDefinition[] = Object.freeze(xiaobaiOsLaunchers.map(app => {
    const importer = importers[app.id];
    if (!importer) { throw new Error(`missing_shell_app:${app.id}`); }
    const loader = createAppComponentLoader(importer);
    return Object.freeze({ ...app, load: loader.load, resetLoader: loader.reset });
}));

export const XIAOBAI_OS_SHELL_APP_IDS = Object.freeze(xiaobaiOsApps.map(app => app.id));
