import {
    TAVERN_PHONE_MESSAGES_APP_ID,
} from './phone-os-types';
import { createTavernPhoneAppRegistry } from './phone-os-app-registry';
import { useTavernPhoneOsController } from './useTavernPhoneOsController';
import {
    useTavernMessagesController,
    type TavernPhoneControllerOptions,
} from './apps/messages/useTavernMessagesController';

const MESSAGES_THREADS_PATH = '/threads';

export function useTavernPhoneController(options: TavernPhoneControllerOptions) {
    let contactNavigationSequence = 0;
    let os!: ReturnType<typeof useTavernPhoneOsController>;
    const messages = useTavernMessagesController({
        ...options,
        isThreadVisible: (sessionId, threadId) => {
            const route = os.activeRoute.value;
            return os.isAppRouteVisible(sessionId, TAVERN_PHONE_MESSAGES_APP_ID, '/threads/')
                && route.kind === 'app'
                && route.params?.threadId === threadId;
        },
    });
    os = useTavernPhoneOsController({
        apps: createTavernPhoneAppRegistry({ messages }),
        selectedSessionId: options.selectedSessionId,
    });

    async function openPhone() {
        os.openPhone();
    }

    function showMessageThreads() {
        contactNavigationSequence += 1;
        messages.status.value = '';
        os.replaceAppRoute(TAVERN_PHONE_MESSAGES_APP_ID, MESSAGES_THREADS_PATH);
    }

    async function openContact(contactId: string) {
        const requestSequence = ++contactNavigationSequence;
        const opened = await messages.openContact(contactId);
        const route = os.activeRoute.value;
        if (
            requestSequence !== contactNavigationSequence
            || !opened
            || !os.isOpen.value
            || route.kind !== 'app'
            || route.appId !== TAVERN_PHONE_MESSAGES_APP_ID
            || route.path !== MESSAGES_THREADS_PATH
        ) {return;}
        const threadId = messages.activeThreadId.value;
        os.pushAppRoute(TAVERN_PHONE_MESSAGES_APP_ID, `/threads/${encodeURIComponent(contactId)}`, {
            contactId,
            threadId,
        });
        await messages.markActiveThreadRead(threadId);
    }

    function isConversationVisible(sessionId = '', threadId = ''): boolean {
        return os.isAppRouteVisible(sessionId, TAVERN_PHONE_MESSAGES_APP_ID, '/threads/')
            && messages.activeThreadId.value === threadId;
    }

    return {
        isConversationVisible,
        messages,
        openContact,
        openPhone,
        os,
        showMessageThreads,
    };
}
