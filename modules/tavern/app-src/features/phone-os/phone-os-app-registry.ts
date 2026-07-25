import { markRaw } from 'vue';
import TavernMessagesApp from '../../components/phone-os/apps/messages/TavernMessagesApp.vue';
import TavernMessagesIcon from '../../components/phone-os/apps/messages/TavernMessagesIcon.vue';
import TavernWalletApp from '../../components/phone-os/apps/wallet/TavernWalletApp.vue';
import TavernWalletIcon from '../../components/phone-os/apps/wallet/TavernWalletIcon.vue';
import TavernTasksApp from '../../components/phone-os/apps/tasks/TavernTasksApp.vue';
import TavernTasksIcon from '../../components/phone-os/apps/tasks/TavernTasksIcon.vue';
import TavernShopApp from '../../components/phone-os/apps/shop/TavernShopApp.vue';
import TavernShopIcon from '../../components/phone-os/apps/shop/TavernShopIcon.vue';
import type { useTavernMessagesController } from './apps/messages/useTavernMessagesController';
import type { useTavernWalletController } from './apps/wallet/useTavernWalletController';
import type { useTavernTasksController } from './apps/tasks/useTavernTasksController';
import type { useTavernShopController } from './apps/shop/useTavernShopController';
import {
    defineTavernPhoneApps,
    TAVERN_PHONE_MESSAGES_APP_ID,
    TAVERN_PHONE_SHOP_APP_ID,
    TAVERN_PHONE_TASKS_APP_ID,
    TAVERN_PHONE_WALLET_APP_ID,
    type TavernPhoneAppDefinition,
} from './phone-os-types';

type TavernMessagesController = ReturnType<typeof useTavernMessagesController>;
type TavernWalletController = ReturnType<typeof useTavernWalletController>;
type TavernTasksController = ReturnType<typeof useTavernTasksController>;
type TavernShopController = ReturnType<typeof useTavernShopController>;

export function createTavernPhoneAppRegistry(input: {
    messages: Pick<TavernMessagesController, 'prepareMessages' | 'unreadTotal'>;
    wallet: Pick<TavernWalletController, 'prepareWallet'>;
    tasks: Pick<TavernTasksController, 'prepareTasks' | 'cancelTransientRequests'>;
    shop: Pick<TavernShopController, 'prepareShop'>;
}): readonly TavernPhoneAppDefinition[] {
    return defineTavernPhoneApps([
        {
            id: TAVERN_PHONE_MESSAGES_APP_ID,
            name: '信息',
            shortName: '信息',
            iconComponent: markRaw(TavernMessagesIcon),
            accent: '#4b78ff',
            rootPath: '/threads',
            order: 10,
            component: markRaw(TavernMessagesApp),
            badge: input.messages.unreadTotal,
            onActivate: input.messages.prepareMessages,
        },
        {
            id: TAVERN_PHONE_WALLET_APP_ID,
            name: '钱包',
            shortName: '钱包',
            iconComponent: markRaw(TavernWalletIcon),
            accent: '#c68a2c',
            rootPath: '/ledger',
            order: 20,
            component: markRaw(TavernWalletApp),
            onActivate: input.wallet.prepareWallet,
        },
        {
            id: TAVERN_PHONE_TASKS_APP_ID,
            name: '任务',
            shortName: '任务',
            iconComponent: markRaw(TavernTasksIcon),
            accent: '#71834d',
            rootPath: '/board',
            order: 30,
            component: markRaw(TavernTasksApp),
            onActivate: async () => {
                await Promise.all([
                    input.tasks.prepareTasks(),
                    input.wallet.prepareWallet(),
                ]);
            },
            onDeactivate: input.tasks.cancelTransientRequests,
        },
        {
            id: TAVERN_PHONE_SHOP_APP_ID,
            name: '商店',
            shortName: '商店',
            iconComponent: markRaw(TavernShopIcon),
            accent: '#98392f',
            rootPath: '/shelf',
            order: 40,
            component: markRaw(TavernShopApp),
            onActivate: async () => {
                await Promise.all([
                    input.shop.prepareShop(),
                    input.wallet.prepareWallet(),
                ]);
            },
        },
    ]);
}
