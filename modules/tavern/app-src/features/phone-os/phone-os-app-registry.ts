import { markRaw } from 'vue';
import TavernMessagesApp from '../../components/phone-os/apps/messages/TavernMessagesApp.vue';
import TavernMessagesIcon from '../../components/phone-os/apps/messages/TavernMessagesIcon.vue';
import type { useTavernMessagesController } from './apps/messages/useTavernMessagesController';
import {
    defineTavernPhoneApps,
    TAVERN_PHONE_MESSAGES_APP_ID,
    type TavernPhoneAppDefinition,
} from './phone-os-types';

type TavernMessagesController = ReturnType<typeof useTavernMessagesController>;

export function createTavernPhoneAppRegistry(input: {
    messages: Pick<TavernMessagesController, 'prepareMessages' | 'unreadTotal'>;
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
    ]);
}
