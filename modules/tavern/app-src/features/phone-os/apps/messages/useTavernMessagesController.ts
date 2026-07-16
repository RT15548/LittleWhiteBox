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
import {
    tavernCommunicationMessageSearchText,
} from '../../../../../shared/communication-message';
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
import type {
    TavernHostMessageHandler,
    TavernHostRequest,
} from '../../../host-bridge/useTavernHostBridge';
import {
    idleTavernMessageVoiceState,
    releasedTavernMessageImageState,
    shouldEnsureTavernMessageImage,
    tavernCommunicationMediaKey,
    type TavernMessageImageState,
    type TavernMessageVoiceState,
} from './tavern-message-media';

export interface TavernPhoneControllerOptions {
    selectedSessionId: Ref<string>;
    effectiveContext: ComputedRef<XbTavernContext>;
    memoryFiles: Ref<TavernMemoryIndexFileEntry[]>;
    agentConfig: Ref<Record<string, unknown>>;
    chatRunning: Ref<boolean>;
    chatCancelling: Ref<boolean>;
    memoryEditorMode: Ref<'preview' | 'edit'>;
    characterArchiveBusy: ComputedRef<boolean>;
    requestHost: TavernHostRequest;
    addHostMessageHandler: (handler: TavernHostMessageHandler) => () => void;
    isThreadVisible?: (sessionId: string, threadId: string) => boolean;
}

const TAVERN_MESSAGE_VOICE_TIMEOUT_MS = 120_000;
const TAVERN_MESSAGE_IMAGE_TIMEOUT_MS = 300_000;

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
    const imageStates = ref<Record<string, TavernMessageImageState>>({});
    const voiceStates = ref<Record<string, TavernMessageVoiceState>>({});
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
    const imageRequests = new Map<string, { key: string; controller: AbortController }>();
    let activeVoiceRequest: { key: string; requestId: string; controller: AbortController } | null = null;

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
                searchText: threadMessages.map(tavernCommunicationMessageSearchText).join('\n').toLocaleLowerCase('zh-CN'),
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
        if (!sessionId) {throw new Error('当前私人消息会话不存在。');}
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
            payload: { type: 'text', text: content },
        }));
    }

    function updateImageState(key: string, patch: TavernMessageImageState) {
        imageStates.value = { ...imageStates.value, [key]: patch };
    }

    function removeImageState(key: string) {
        if (!(key in imageStates.value)) {return;}
        const next = { ...imageStates.value };
        delete next[key];
        imageStates.value = next;
    }

    function updateVoiceState(key: string, patch: TavernMessageVoiceState) {
        voiceStates.value = { ...voiceStates.value, [key]: patch };
    }

    function stopVoicePlayback() {
        const active = activeVoiceRequest;
        if (!active) {return;}
        activeVoiceRequest = null;
        active.controller.abort();
        updateVoiceState(active.key, idleTavernMessageVoiceState());
    }

    async function toggleVoicePlayback(message: TavernCommunicationMessageRecord) {
        if (message.payload.type !== 'voice') {return;}
        const key = tavernCommunicationMediaKey(message);
        if (activeVoiceRequest?.key === key) {
            stopVoicePlayback();
            return;
        }
        stopVoicePlayback();
        const controller = new AbortController();
        const requestId = `phone-voice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        activeVoiceRequest = { key, requestId, controller };
        updateVoiceState(key, { status: 'loading' });
        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, TAVERN_MESSAGE_VOICE_TIMEOUT_MS);
        try {
            const response = await options.requestHost('xb-tavern:voice-play', {
                text: message.payload.transcript,
                emotion: message.payload.emotion || '',
            }, { requestId, signal: controller.signal });
            if (activeVoiceRequest?.key === key) {
                activeVoiceRequest = null;
                updateVoiceState(key, String(response.state || '') === 'stopped'
                    ? idleTavernMessageVoiceState()
                    : { ...voiceStates.value[key], status: 'ended' });
            }
        } catch (error) {
            if (controller.signal.aborted && !timedOut) {return;}
            if (activeVoiceRequest?.key === key) {activeVoiceRequest = null;}
            updateVoiceState(key, {
                status: 'error',
                error: timedOut
                    ? '语音准备超时，请重新播放'
                    : error instanceof Error ? error.message.replace(/^xb-tavern:voice-play:\s*/, '') : '语音播放失败',
            });
        } finally {
            clearTimeout(timeoutId);
        }
    }

    function abortImageRequestsForKey(key: string) {
        for (const [requestId, request] of imageRequests) {
            if (request.key !== key) {continue;}
            imageRequests.delete(requestId);
            request.controller.abort();
        }
    }

    function releaseImageAsset(message: TavernCommunicationMessageRecord) {
        if (message.payload.type !== 'image') {return;}
        const key = tavernCommunicationMediaKey(message);
        const current = imageStates.value[key];
        abortImageRequestsForKey(key);
        const released = releasedTavernMessageImageState(current);
        if (!released) {
            removeImageState(key);
            return;
        }
        updateImageState(key, released);
    }

    function cancelImageAsset(message: TavernCommunicationMessageRecord) {
        if (message.payload.type !== 'image') {return;}
        const key = tavernCommunicationMediaKey(message);
        abortImageRequestsForKey(key);
        updateImageState(key, { status: 'error', error: '已取消图片生成' });
    }

    async function ensureImageAsset(message: TavernCommunicationMessageRecord, force = false) {
        if (message.payload.type !== 'image') {return;}
        const key = tavernCommunicationMediaKey(message);
        const current = imageStates.value[key];
        if (!shouldEnsureTavernMessageImage(current, force)) {return;}
        abortImageRequestsForKey(key);
        const requestId = `phone-image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const controller = new AbortController();
        imageRequests.set(requestId, { key, controller });
        updateImageState(key, { status: 'generating' });
        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, TAVERN_MESSAGE_IMAGE_TIMEOUT_MS);
        try {
            const response = await options.requestHost('xb-tavern:inline-image-generate', {
                tags: message.payload.generationPrompt || message.payload.description,
            }, { requestId, signal: controller.signal });
            const result = response.result && typeof response.result === 'object'
                ? response.result as Record<string, unknown>
                : {};
            const base64 = String(result.base64 || '').trim();
            if (!base64) {throw new Error('图片生成结果为空');}
            const url = /^data:image\//i.test(base64) ? base64 : `data:image/png;base64,${base64}`;
            updateImageState(key, { status: 'ready', url });
        } catch (error) {
            if (controller.signal.aborted && !timedOut) {return;}
            if (!imageRequests.has(requestId)) {return;}
            updateImageState(key, {
                status: 'error',
                error: timedOut
                    ? '图片生成超时，请重试'
                    : error instanceof Error
                    ? error.message.replace(/^xb-tavern:inline-image-generate:\s*/, '')
                    : '图片生成失败',
            });
        } finally {
            clearTimeout(timeoutId);
            imageRequests.delete(requestId);
        }
    }

    function retryImageAsset(message: TavernCommunicationMessageRecord) {
        return ensureImageAsset(message, true);
    }

    const removeMediaHostHandler = options.addHostMessageHandler((data) => {
        const payload = data.payload && typeof data.payload === 'object' ? data.payload : {};
        const requestId = String(payload.requestId || '');
        if (data.type === 'xb-tavern:inline-image-progress') {
            const request = imageRequests.get(requestId);
            if (!request) {return false;}
            const rawStatus = String(payload.status || 'generating');
            const status = ['queued', 'waiting', 'generating'].includes(rawStatus)
                ? rawStatus as TavernMessageImageState['status']
                : 'generating';
            updateImageState(request.key, {
                status,
                queueAhead: Math.max(0, Number(payload.ahead) || 0) || undefined,
                waitSeconds: Math.max(0, Number(payload.delay) || 0) || undefined,
            });
            return true;
        }
        if (data.type === 'xb-tavern:voice-progress') {
            if (!activeVoiceRequest || requestId !== activeVoiceRequest.requestId) {return false;}
            const rawStatus = String(payload.status || 'loading');
            if (rawStatus === 'loading') {
                updateVoiceState(activeVoiceRequest.key, { status: 'loading' });
            } else if (rawStatus === 'playing') {
                updateVoiceState(activeVoiceRequest.key, {
                    status: 'playing',
                    duration: Math.max(0, Number(payload.duration) || 0) || undefined,
                });
            }
            return true;
        }
        return false;
    });

    async function retryReplyRequest() {
        const blocked = sendBlockedReason.value;
        const contact = activeContact.value;
        const thread = activeThread.value;
        if (blocked || !contact || !thread || thread.replyRequest?.status !== 'failed') {
            status.value = blocked || '当前消息线程已经变化，无法重试。';
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
        stopVoicePlayback();
        imageRequests.forEach((request) => request.controller.abort());
        imageRequests.clear();
        imageStates.value = {};
        voiceStates.value = {};
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
        removeMediaHostHandler();
        stopVoicePlayback();
        imageRequests.forEach((request) => request.controller.abort());
        imageRequests.clear();
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
        imageStates,
        isSending,
        sendingSessionId,
        messages,
        markActiveThreadRead,
        openContact,
        prepareMessages,
        refreshPhone,
        retryReplyRequest,
        retryImageAsset,
        cancelImageAsset,
        releaseImageAsset,
        searchQuery,
        sendBlockedReason,
        sendMessage,
        status,
        threadPreviews,
        threadSearchText,
        threads,
        unreadTotal,
        ensureImageAsset,
        toggleVoicePlayback,
        voiceStates,
    };
}
