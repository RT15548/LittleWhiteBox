import { computed, type ComputedRef } from 'vue';
import {
    TAVERN_PHONE_MESSAGES_APP_ID,
    TAVERN_PHONE_WALLET_APP_ID,
} from './phone-os-types';
import { createTavernPhoneAppRegistry } from './phone-os-app-registry';
import { useTavernPhoneOsController } from './useTavernPhoneOsController';
import {
    useTavernMessagesController,
    type TavernPhoneControllerOptions,
} from './apps/messages/useTavernMessagesController';
import { useTavernWalletController } from './apps/wallet/useTavernWalletController';
import { useTavernTasksController } from './apps/tasks/useTavernTasksController';
import { useTavernPhoneDomainSync } from './useTavernPhoneDomainSync';
import { useTavernShopController } from './apps/shop/useTavernShopController';
import { useTavernBankController } from './apps/bank/useTavernBankController';

const MESSAGES_THREADS_PATH = '/threads';
const WALLET_LEDGER_PATH = '/ledger';

export interface TavernPhoneControllerInput extends TavernPhoneControllerOptions {
    acceptedRollbackBusy: ComputedRef<boolean>;
    showToast?: (message: string, options?: { tone?: 'info' | 'warning'; durationMs?: number }) => void;
}

export function useTavernPhoneController(options: TavernPhoneControllerInput) {
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
    const wallet = useTavernWalletController({
        selectedSessionId: options.selectedSessionId,
        isLedgerVisible: (sessionId) => os?.isAppRouteVisible(sessionId, TAVERN_PHONE_WALLET_APP_ID, WALLET_LEDGER_PATH) === true,
    });
    const tasks = useTavernTasksController({
        selectedSessionId: options.selectedSessionId,
        effectiveContext: options.effectiveContext,
        agentConfig: options.agentConfig,
        chatRunning: options.chatRunning,
        chatCancelling: options.chatCancelling,
        memoryEditorMode: options.memoryEditorMode,
        characterArchiveBusy: options.characterArchiveBusy,
        getNativeWorldInfoRuntime: options.getNativeWorldInfoRuntime,
        onEconomyChanged: wallet.refreshAfterEconomyDomainChange,
    });
    const shop = useTavernShopController({
        selectedSessionId: options.selectedSessionId,
        chatRunning: options.chatRunning,
        chatCancelling: options.chatCancelling,
        phoneSending: computed(() => (
            messages.isSending.value
            || messages.threads.value.some((thread) => thread.replyRequest?.status === 'pending')
        )),
        memoryEditorMode: options.memoryEditorMode,
        characterArchiveBusy: options.characterArchiveBusy,
        wallet,
        knownTargetNames: computed(() => messages.contacts.value.map((contact) => contact.name)),
        showToast: options.showToast,
    });
    const bank = useTavernBankController({
        selectedSessionId: options.selectedSessionId,
        memoryEditorMode: options.memoryEditorMode,
        characterArchiveBusy: options.characterArchiveBusy,
        acceptedRollbackBusy: options.acceptedRollbackBusy,
        wallet,
        showToast: options.showToast,
    });
    os = useTavernPhoneOsController({
        apps: createTavernPhoneAppRegistry({ messages, wallet, tasks, shop, bank }),
        selectedSessionId: options.selectedSessionId,
    });
    useTavernPhoneDomainSync({
        selectedSessionId: options.selectedSessionId,
        onTasksChanged: tasks.refreshAfterTaskDomainChange,
        onEconomyChanged: wallet.refreshAfterEconomyDomainChange,
        onShopChanged: shop.refreshAfterShopDomainChange,
        onBankChanged: (change) => bank.refreshAfterBankDomainChange(
            change.sessionId,
            change.settledPositionIds,
        ),
    });

    async function openPhone() {
        os.openPhone();
        if (os.isOpen.value) {await wallet.refreshBalance();}
    }

    function showMessageThreads() {
        contactNavigationSequence += 1;
        messages.status.value = '';
        os.replaceAppRoute(TAVERN_PHONE_MESSAGES_APP_ID, MESSAGES_THREADS_PATH);
    }

    function openWallet() {
        os.replaceAppRoute(TAVERN_PHONE_WALLET_APP_ID, WALLET_LEDGER_PATH);
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
        bank,
        isConversationVisible,
        messages,
        openContact,
        openPhone,
        openWallet,
        os,
        showMessageThreads,
        shop,
        tasks,
        wallet,
    };
}
