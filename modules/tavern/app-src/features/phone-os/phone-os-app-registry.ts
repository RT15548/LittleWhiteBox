import { markRaw } from 'vue';
import TavernMessagesApp from '../../components/phone-os/apps/messages/TavernMessagesApp.vue';
import TavernMessagesIcon from '../../components/phone-os/apps/messages/TavernMessagesIcon.vue';
import TavernWalletApp from '../../components/phone-os/apps/wallet/TavernWalletApp.vue';
import TavernWalletIcon from '../../components/phone-os/apps/wallet/TavernWalletIcon.vue';
import type { useTavernMessagesController } from './apps/messages/useTavernMessagesController';
import type { useTavernWalletController } from './apps/wallet/useTavernWalletController';
import {
    defineTavernPhoneApps,
    TAVERN_PHONE_MESSAGES_APP_ID,
    TAVERN_PHONE_WALLET_APP_ID,
    type TavernPhoneAppDefinition,
} from './phone-os-types';

type TavernMessagesController = ReturnType<typeof useTavernMessagesController>;
type TavernWalletController = ReturnType<typeof useTavernWalletController>;

export function createTavernPhoneAppRegistry(input: {
    messages: Pick<TavernMessagesController, 'prepareMessages' | 'unreadTotal'>;
    wallet: Pick<TavernWalletController, 'prepareWallet'>;
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
    ]);
}
