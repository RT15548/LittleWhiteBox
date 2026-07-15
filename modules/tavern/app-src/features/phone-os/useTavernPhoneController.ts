import {
    TAVERN_PHONE_MESSAGES_APP_ID,
} from './phone-os-types';
import { createTavernPhoneAppRegistry } from './phone-os-app-registry';
import { useTavernPhoneOsController } from './useTavernPhoneOsController';
import {
    useTavernMessagesController,
    type TavernPhoneControllerOptions,
    type TavernPhoneContactCandidate,
} from './apps/messages/useTavernMessagesController';

export type { TavernPhoneContactCandidate } from './apps/messages/useTavernMessagesController';

const MESSAGES_THREADS_PATH = '/threads';
const MESSAGES_ADD_CONTACT_PATH = '/contacts/add';

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

    function showAddContact() {
        contactNavigationSequence += 1;
        messages.status.value = '';
        os.pushAppRoute(TAVERN_PHONE_MESSAGES_APP_ID, MESSAGES_ADD_CONTACT_PATH);
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

    async function addContact(candidate: TavernPhoneContactCandidate) {
        const requestSequence = ++contactNavigationSequence;
        await messages.addContact(candidate);
        const contactId = messages.activeContactId.value;
        const route = os.activeRoute.value;
        if (
            requestSequence !== contactNavigationSequence
            || !contactId
            || !os.isOpen.value
            || route.kind !== 'app'
            || route.appId !== TAVERN_PHONE_MESSAGES_APP_ID
            || route.path !== MESSAGES_ADD_CONTACT_PATH
        ) {return;}
        const threadId = messages.activeThreadId.value;
        os.replaceAppRoute(TAVERN_PHONE_MESSAGES_APP_ID, `/threads/${encodeURIComponent(contactId)}`, {
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
        addContact,
        isConversationVisible,
        messages,
        openContact,
        openPhone,
        os,
        showAddContact,
        showMessageThreads,
    };
}
