import { computed, onScopeDispose, ref, watch, type ComputedRef, type Ref } from 'vue';
import {
    appendSentTavernCommunicationMessage,
    completeTavernCommunicationReply,
    failTavernCommunicationReplyRequest,
    getTavernCommunicationThreadForContact,
    listTavernCommunicationContacts,
    listTavernCommunicationMessages,
    listTavernCommunicationThreads,
    markTavernCommunicationThreadRead,
    reconcileTavernCommunicationContacts,
    recoverInterruptedTavernCommunicationReplyRequests,
    retryTavernCommunicationReplyRequest,
    touchTavernCommunicationReplyRequest,
} from '../../../../../shared/communications';
import {
    getTavernMemoryFile,
    listTavernMemoryFiles,
} from '../../../../../shared/memory-files';
import type { XbTavernContext } from '../../../../../shared/message-assembler';
import type {
    TavernCommunicationContactRecord,
    TavernCommunicationMessageRecord,
    TavernCommunicationThreadRecord,
    TavernMemoryIndexFileEntry,
} from '../../../../../shared/session-db';
import { runTavernOnce } from '../../../../runtime/run-once';
import { buildTavernAutomaticCommunicationContacts } from './tavern-messages-contacts';
import { buildTavernMessagesRequestMessages } from './tavern-messages-context';
import { parseTavernPhoneReply } from './tavern-messages-response';

export interface TavernPhoneControllerOptions {
    selectedSessionId: Ref<string>;
    effectiveContext: ComputedRef<XbTavernContext>;
    memoryFiles: Ref<TavernMemoryIndexFileEntry[]>;
    agentConfig: Ref<Record<string, unknown>>;
    chatRunning: Ref<boolean>;
    chatCancelling: Ref<boolean>;
    managerBusy: ComputedRef<boolean>;
    managerAssistantRunning: Ref<boolean>;
    managerAssistantCancelling: Ref<boolean>;
    memoryEditorMode: Ref<'preview' | 'edit'>;
    characterArchiveBusy: ComputedRef<boolean>;
    isThreadVisible?: (sessionId: string, threadId: string) => boolean;
}

interface TavernPhoneSendTask {
    sessionId: string;
    contextSnapshot: XbTavernContext;
    agentConfig: Record<string, unknown>;
    contact: TavernCommunicationContactRecord;
    thread: TavernCommunicationThreadRecord;
}

function normalizeText(value: unknown, limit = 4000): string {
    return String(value || '').replace(/\r\n?/g, '\n').trim().slice(0, limit);
}

function phoneReplyErrorText(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error || 'communication_reply_failed');
    if (message === 'communication_reply_request_pending') {return '对方仍在回复上一条消息。';}
    if (message === 'communication_reply_completion_not_applied') {return '这次回复请求已失效，请重新获取。';}
    return message;
}

function cloneSerializable<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

export function useTavernMessagesController(options: TavernPhoneControllerOptions) {
    const contacts = ref<TavernCommunicationContactRecord[]>([]);
    const threads = ref<TavernCommunicationThreadRecord[]>([]);
    const threadPreviews = ref<Record<string, TavernCommunicationMessageRecord | null>>({});
    const threadSearchText = ref<Record<string, string>>({});
    const activeContactId = ref('');
    const activeThreadId = ref('');
    const messages = ref<TavernCommunicationMessageRecord[]>([]);
    const draft = ref('');
    const draftsByThread = ref<Record<string, string>>({});
    const status = ref('');
    const searchQuery = ref('');
    const isSending = ref(false);
    const sendingSessionId = ref('');
    const activeReplyRequest = ref<{
        sessionId: string;
        threadId: string;
        userSequence: number;
        replyRequestId: string;
    } | null>(null);
    let refreshSequence = 0;
    let openContactSequence = 0;
    let sessionChangeSequence = 0;
    let interruptedRecoveryTimer: ReturnType<typeof setTimeout> | null = null;

    const activeContact = computed(() => contacts.value.find((contact) => contact.id === activeContactId.value) || null);
    const activeThread = computed(() => threads.value.find((thread) => thread.id === activeThreadId.value) || null);
    const unreadTotal = computed(() => threads.value.reduce((sum, thread) => sum + Math.max(0, Number(thread.unreadCount) || 0), 0));
    const filteredContactIds = computed(() => {
        const query = searchQuery.value.trim().toLocaleLowerCase('zh-CN');
        if (!query) {return contacts.value.map((contact) => contact.id);}
        return contacts.value.filter((contact) => {
            if (contact.name.toLocaleLowerCase('zh-CN').includes(query)) {return true;}
            const thread = threads.value.find((item) => item.contactId === contact.id);
            return !!thread && String(threadSearchText.value[thread.id] || '').includes(query);
        }).map((contact) => contact.id);
    });
    const conversationSending = computed(() => (
        activeThread.value?.replyRequest?.status === 'pending'
        || (
            isSending.value
            && sendingSessionId.value === String(options.selectedSessionId.value || '').trim()
            && activeReplyRequest.value?.threadId === activeThreadId.value
        )
    ));
    const sendBlockedReason = computed(() => {
        if (!options.selectedSessionId.value) {return '请先进入一个会话。';}
        if (options.chatRunning.value || options.chatCancelling.value) {return '角色正在回复，暂时不能发送手机消息。';}
        if (options.managerBusy.value || options.managerAssistantRunning.value || options.managerAssistantCancelling.value) {
            return '助手正在维护档案，暂时不能发送手机消息。';
        }
        if (options.memoryEditorMode.value === 'edit') {return '请先退出记忆编辑，再发送手机消息。';}
        if (options.characterArchiveBusy.value) {return '角色档案正在同步，暂时不能发送手机消息。';}
        if (activeThread.value?.replyRequest?.status === 'pending') {return '对方正在回复上一条消息。';}
        if (isSending.value) {return '正在等待对方回复。';}
        return '';
    });
    const canSend = computed(() => !sendBlockedReason.value && !!draft.value.trim() && !!activeThreadId.value);

    watch(activeThreadId, (nextThreadId, previousThreadId) => {
        if (previousThreadId) {
            draftsByThread.value = {
                ...draftsByThread.value,
                [previousThreadId]: draft.value,
            };
        }
        draft.value = nextThreadId ? String(draftsByThread.value[nextThreadId] || '') : '';
    });

    watch(draft, (value) => {
        if (!activeThreadId.value) {return;}
        draftsByThread.value = {
            ...draftsByThread.value,
            [activeThreadId.value]: value,
        };
    });

    function clearInterruptedRecoveryTimer() {
        if (interruptedRecoveryTimer !== null) {
            clearTimeout(interruptedRecoveryTimer);
            interruptedRecoveryTimer = null;
        }
    }

    function scheduleInterruptedRecovery(
        sessionId: string,
        sessionThreads: TavernCommunicationThreadRecord[],
    ) {
        clearInterruptedRecoveryTimer();
        const pendingLeaseExpirations = sessionThreads
            .filter((thread) => thread.replyRequest?.status === 'pending')
            .map((thread) => Number(thread.replyRequest?.leaseExpiresAt) || 0);
        if (!pendingLeaseExpirations.length) {return;}
        const nextExpiration = Math.min(...pendingLeaseExpirations);
        const delay = Math.max(0, nextExpiration - Date.now() + 50);
        interruptedRecoveryTimer = setTimeout(() => {
            interruptedRecoveryTimer = null;
            void (async () => {
                if (sessionId !== String(options.selectedSessionId.value || '').trim()) {return;}
                await recoverInterruptedReplyRequests(sessionId);
                if (sessionId === String(options.selectedSessionId.value || '').trim()) {
                    await refreshPhone();
                }
            })();
        }, delay);
    }

    async function refreshPhone() {
        const requestSequence = ++refreshSequence;
        const sessionId = String(options.selectedSessionId.value || '').trim();
        if (!sessionId) {
            clearInterruptedRecoveryTimer();
            contacts.value = [];
            threads.value = [];
            messages.value = [];
            threadPreviews.value = {};
            threadSearchText.value = {};
            return;
        }
        const contextSnapshot = options.effectiveContext.value || {};
        const memoryFiles = await listTavernMemoryFiles(sessionId);
        if (requestSequence !== refreshSequence || sessionId !== String(options.selectedSessionId.value || '').trim()) {return;}
        await reconcileTavernCommunicationContacts({
            sessionId,
            contacts: buildTavernAutomaticCommunicationContacts(memoryFiles, contextSnapshot),
        });
        const [nextContacts, nextThreads] = await Promise.all([
            listTavernCommunicationContacts(sessionId),
            listTavernCommunicationThreads(sessionId),
        ]);
        const previewEntries = await Promise.all(nextThreads.map(async (thread) => {
            const threadMessages = await listTavernCommunicationMessages(sessionId, thread.id);
            return {
                threadId: thread.id,
                preview: threadMessages.at(-1) || null,
                searchText: threadMessages.map((message) => message.content).join('\n').toLocaleLowerCase('zh-CN'),
            };
        }));
        const nextActiveThreadId = nextThreads.some((thread) => thread.id === activeThreadId.value)
            ? activeThreadId.value
            : '';
        const nextMessages = nextActiveThreadId
            ? await listTavernCommunicationMessages(sessionId, nextActiveThreadId)
            : [];
        if (requestSequence !== refreshSequence || sessionId !== String(options.selectedSessionId.value || '').trim()) {return;}
        contacts.value = nextContacts;
        threads.value = nextThreads;
        threadPreviews.value = Object.fromEntries(previewEntries.map((entry) => [entry.threadId, entry.preview]));
        threadSearchText.value = Object.fromEntries(previewEntries.map((entry) => [entry.threadId, entry.searchText]));
        activeThreadId.value = nextActiveThreadId;
        messages.value = nextMessages;
        scheduleInterruptedRecovery(sessionId, nextThreads);
    }

    async function recoverInterruptedReplyRequests(sessionId: string) {
        const active = activeReplyRequest.value;
        if (isSending.value && sendingSessionId.value === sessionId && !active) {return;}
        await recoverInterruptedTavernCommunicationReplyRequests(
            sessionId,
            active?.sessionId === sessionId ? active.replyRequestId : '',
        );
    }

    async function prepareMessages() {
        status.value = '';
        const sessionId = String(options.selectedSessionId.value || '').trim();
        if (sessionId) {await recoverInterruptedReplyRequests(sessionId);}
        await refreshPhone();
    }

    async function openContact(contactId: string) {
        const requestSequence = ++openContactSequence;
        const sessionId = String(options.selectedSessionId.value || '').trim();
        const contact = contacts.value.find((item) => item.id === contactId);
        if (!sessionId || !contact) {return;}
        const thread = await getTavernCommunicationThreadForContact(sessionId, contact.id);
        if (!thread) {return;}
        const nextMessages = await listTavernCommunicationMessages(sessionId, thread.id);
        if (
            requestSequence !== openContactSequence
            || sessionId !== String(options.selectedSessionId.value || '').trim()
        ) {return;}
        activeContactId.value = contact.id;
        activeThreadId.value = thread.id;
        messages.value = nextMessages;
        status.value = '';
        return true;
    }

    async function markActiveThreadRead(threadId = activeThreadId.value) {
        const sessionId = String(options.selectedSessionId.value || '').trim();
        const targetThreadId = String(threadId || '').trim();
        if (!sessionId || !targetThreadId) {return;}
        const openedThread = await markTavernCommunicationThreadRead(sessionId, targetThreadId);
        const nextMessages = openedThread
            ? await listTavernCommunicationMessages(sessionId, targetThreadId)
            : [];
        if (
            !openedThread
            || sessionId !== String(options.selectedSessionId.value || '').trim()
            || targetThreadId !== activeThreadId.value
        ) {return;}
        threads.value = threads.value.map((item) => item.id === targetThreadId ? openedThread : item);
        messages.value = nextMessages;
    }

    function createSendTask(
        contact: TavernCommunicationContactRecord,
        thread: TavernCommunicationThreadRecord,
    ): TavernPhoneSendTask {
        const sessionId = String(options.selectedSessionId.value || '').trim();
        if (!sessionId) {throw new Error('当前手机通讯会话不存在。');}
        return {
            sessionId,
            contextSnapshot: cloneSerializable(options.effectiveContext.value || {}),
            agentConfig: cloneSerializable(options.agentConfig.value || {}),
            contact: cloneSerializable(contact),
            thread: cloneSerializable(thread),
        };
    }

    async function buildPhoneMessages(
        task: TavernPhoneSendTask,
        userMessage: TavernCommunicationMessageRecord,
    ) {
        const history = await listTavernCommunicationMessages(task.sessionId, task.thread.id);
        const contactMemory = task.contact.memoryPath
            ? await getTavernMemoryFile(task.sessionId, task.contact.memoryPath)
            : null;
        return buildTavernMessagesRequestMessages({
            sessionId: task.sessionId,
            contextSnapshot: task.contextSnapshot,
            contact: task.contact,
            contactProfile: String(contactMemory?.content || ''),
            thread: task.thread,
            communicationMessages: history,
            userMessage,
        });
    }

    function isTaskVisible(task: TavernPhoneSendTask, threadId = task.thread.id): boolean {
        return task.sessionId === String(options.selectedSessionId.value || '').trim()
            && threadId === activeThreadId.value;
    }

    async function runReplyRequest(
        task: TavernPhoneSendTask,
        prepareRequest: () => Promise<{
            message: TavernCommunicationMessageRecord;
            replyRequest: { id: string; userSequence: number };
        }>,
    ) {
        isSending.value = true;
        sendingSessionId.value = task.sessionId;
        status.value = '';
        let userMessage: TavernCommunicationMessageRecord | null = null;
        let replyRequestId = '';
        let replyHeartbeatTimer: ReturnType<typeof setInterval> | null = null;
        try {
            const prepared = await prepareRequest();
            userMessage = prepared.message;
            replyRequestId = prepared.replyRequest.id;
            if (userMessage.sessionId !== task.sessionId || userMessage.threadId !== task.thread.id) {
                throw new Error('communication_send_task_mismatch');
            }
            activeReplyRequest.value = {
                sessionId: userMessage.sessionId,
                threadId: userMessage.threadId,
                userSequence: prepared.replyRequest.userSequence,
                replyRequestId,
            };
            replyHeartbeatTimer = setInterval(() => {
                void touchTavernCommunicationReplyRequest({
                    sessionId: userMessage!.sessionId,
                    threadId: userMessage!.threadId,
                    replyRequestId,
                }).catch((): void => {});
            }, 20_000);
            await refreshPhone();
            const result = await runTavernOnce({
                agentConfig: task.agentConfig,
                messages: await buildPhoneMessages(task, userMessage),
                tools: [],
                toolChoice: 'none',
            });
            const payload = parseTavernPhoneReply(result.text);
            const completion = await completeTavernCommunicationReply({
                userMessage,
                replyRequestId,
                replies: payload.messages,
                result: payload.result,
                summary: payload.summary,
                provider: result.provider,
                model: result.model,
                unreadCountDelta: payload.result === 'reply'
                    && !options.isThreadVisible?.(task.sessionId, userMessage.threadId)
                    ? payload.messages.length
                    : 0,
            });
            if (completion === null) {throw new Error('communication_reply_completion_not_applied');}
            if (isTaskVisible(task, userMessage.threadId)) {
                status.value = payload.result === 'unavailable'
                    ? '暂时无法联系到对方'
                    : payload.result === 'silent'
                        ? '对方暂时没有回复'
                        : '';
            }
        } catch (error) {
            const failedRequest = userMessage
                ? await failTavernCommunicationReplyRequest(userMessage, replyRequestId, error)
                : null;
            if (isTaskVisible(task, userMessage?.threadId || task.thread.id)) {
                status.value = failedRequest ? '' : phoneReplyErrorText(error);
            }
        } finally {
            if (replyHeartbeatTimer !== null) {clearInterval(replyHeartbeatTimer);}
            isSending.value = false;
            sendingSessionId.value = '';
            activeReplyRequest.value = null;
            await refreshPhone();
        }
    }

    async function sendMessage(contentOverride?: string) {
        const content = normalizeText(contentOverride ?? draft.value, 2000);
        const blocked = sendBlockedReason.value;
        const contact = activeContact.value;
        const thread = activeThread.value;
        if (blocked) {
            status.value = blocked;
            return;
        }
        if (!content || !contact || !thread) {return;}
        const task = createSendTask(contact, thread);
        draft.value = '';
        await runReplyRequest(task, () => appendSentTavernCommunicationMessage({
            sessionId: task.sessionId,
            threadId: task.thread.id,
            content,
        }));
    }

    async function retryReplyRequest() {
        const blocked = sendBlockedReason.value;
        const contact = activeContact.value;
        const thread = activeThread.value;
        if (blocked || !contact || !thread || thread.replyRequest?.status !== 'failed') {
            status.value = blocked || '当前短信线程已经变化，无法重试。';
            return;
        }
        const task = createSendTask(contact, thread);
        await runReplyRequest(task, () => retryTavernCommunicationReplyRequest(task.sessionId, task.thread.id));
    }

    watch(options.selectedSessionId, (value) => {
        const requestSequence = ++sessionChangeSequence;
        openContactSequence += 1;
        refreshSequence += 1;
        activeContactId.value = '';
        activeThreadId.value = '';
        messages.value = [];
        draft.value = '';
        draftsByThread.value = {};
        searchQuery.value = '';
        status.value = '';
        const sessionId = String(value || '').trim();
        void (async () => {
            if (sessionId) {await recoverInterruptedReplyRequests(sessionId);}
            if (requestSequence !== sessionChangeSequence || sessionId !== String(options.selectedSessionId.value || '').trim()) {return;}
            await refreshPhone();
        })();
    }, { immediate: true });

    watch(() => JSON.stringify({
        sessionId: options.selectedSessionId.value,
        characterName: options.effectiveContext.value.character?.name || '',
        userName: options.effectiveContext.value.user?.name || '',
        files: options.memoryFiles.value.map((file) => [file.path, file.status]),
    }), () => {
        if (options.selectedSessionId.value) {void refreshPhone();}
    });

    onScopeDispose(() => {
        clearInterruptedRecoveryTimer();
    });

    return {
        activeContact,
        activeContactId,
        activeThread,
        activeThreadId,
        canSend,
        contacts,
        conversationSending,
        draft,
        draftsByThread,
        filteredContactIds,
        isSending,
        sendingSessionId,
        messages,
        markActiveThreadRead,
        openContact,
        prepareMessages,
        refreshPhone,
        retryReplyRequest,
        searchQuery,
        sendBlockedReason,
        sendMessage,
        status,
        threadPreviews,
        threadSearchText,
        threads,
        unreadTotal,
    };
}
