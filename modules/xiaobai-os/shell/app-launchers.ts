import appIds from './app-catalog.json';
import { AGENT_API_APP_DESCRIPTOR } from '../apps/agent-api/descriptor.js';
import { BANK_APP_DESCRIPTOR } from '../apps/bank/descriptor.js';
import { FOURTH_WALL_APP_DESCRIPTOR } from '../apps/fourth-wall/descriptor.js';
import { GAME_APP_DESCRIPTOR } from '../apps/game/descriptor.js';
import { MAP_APP_DESCRIPTOR } from '../apps/map/descriptor.js';
import { MESSAGES_APP_DESCRIPTOR } from '../apps/messages/descriptor.js';
import { SHOP_APP_DESCRIPTOR } from '../apps/shop/descriptor.js';
import { TASKS_APP_DESCRIPTOR } from '../apps/tasks/descriptor.js';
import { WALLET_APP_DESCRIPTOR } from '../apps/wallet/descriptor.js';
import { WORLD_APP_DESCRIPTOR } from '../apps/world/descriptor.js';
import { LEARNING_APP_DESCRIPTOR } from '../apps/learning/descriptor.js';

export interface XiaobaiOsAppLauncher {
    id: string;
    name: string;
    accent: string;
    icon: string;
}

// Presentation only: both the host shortcut panel and desktop can read this
// catalog without importing Vue, APP components, or APP runtimes.
const launchers: readonly XiaobaiOsAppLauncher[] = [
    { ...AGENT_API_APP_DESCRIPTOR, icon: new URL('../apps/agent-api/ui/icon.svg', import.meta.url).href },
    { ...FOURTH_WALL_APP_DESCRIPTOR, icon: new URL('../apps/fourth-wall/ui/icon.svg', import.meta.url).href },
    { ...MESSAGES_APP_DESCRIPTOR, icon: new URL('../apps/messages/ui/icon.svg', import.meta.url).href },
    { ...WALLET_APP_DESCRIPTOR, icon: new URL('../apps/wallet/ui/icon.svg', import.meta.url).href },
    { ...SHOP_APP_DESCRIPTOR, icon: new URL('../apps/shop/ui/icon.svg', import.meta.url).href },
    { ...BANK_APP_DESCRIPTOR, icon: new URL('../apps/bank/ui/icon.svg', import.meta.url).href },
    { ...GAME_APP_DESCRIPTOR, icon: new URL('../apps/game/ui/icon.svg', import.meta.url).href },
    { ...MAP_APP_DESCRIPTOR, icon: new URL('../apps/map/ui/icon.svg', import.meta.url).href },
    { ...WORLD_APP_DESCRIPTOR, icon: new URL('../apps/world/ui/icon.svg', import.meta.url).href },
    { ...TASKS_APP_DESCRIPTOR, icon: new URL('../apps/tasks/ui/icon.svg', import.meta.url).href },
    { ...LEARNING_APP_DESCRIPTOR, icon: new URL('../apps/learning/ui/icon.svg', import.meta.url).href },
];

export const xiaobaiOsLaunchers: readonly XiaobaiOsAppLauncher[] = Object.freeze(appIds.map(id => {
    const app = launchers.find(item => item.id === id);
    if (!app) { throw new Error(`missing_shell_app:${id}`); }
    return Object.freeze(app);
}));
