import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import {
    appendPendingTavernCommunicationMessage,
    completeTavernCommunicationExchange,
    createTavernCommunicationContact,
    failTavernCommunicationMessage,
    getTavernCommunicationThreadForContact,
    listTavernCommunicationContacts,
    listTavernCommunicationMessages,
    listTavernCommunicationThreads,
    markTavernCommunicationThreadRead,
    recoverInterruptedTavernCommunicationMessages,
    retryFailedTavernCommunicationMessage,
} from '../../../../../shared/communications';
import { getTavernMemoryFile } from '../../../../../shared/memory-files';
import type { XbTavernContext } from '../../../../../shared/message-assembler';
import type {
    TavernCommunicationContactRecord,
    TavernCommunicationMessageRecord,
    TavernCommunicationThreadRecord,
    TavernMemoryIndexFileEntry,
} from '../../../../../shared/session-db';
import { runTavernOnce } from '../../../../runtime/run-once';
import { buildTavernMessagesRequestMessages } from './tavern-messages-context';

export interface TavernPhoneContactCandidate {
    key: string;
    name: string;
    avatar: string;
    memoryPath: string;
    source: 'character' | 'memory';
}

export interface TavernPhoneControllerOptions {
    selectedSessionId: Ref<string>;
    effectiveContext: ComputedRef<XbTavernContext>;
    visibleCharacterAvatar: ComputedRef<string>;
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

interface TavernPhoneReplyPayload {
    result: 'reply' | 'silent' | 'unavailable';
    messages: string[];
    summary?: string;
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

function cloneSerializable<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function memoryCharacterName(path = ''): string {
    const normalized = String(path || '').trim();
    if (!normalized.startsWith('memory/characters/') || !normalized.endsWith('.md')) {return '';}
    const encoded = normalized.slice('memory/characters/'.length, -'.md'.length);
    try {
        return decodeURIComponent(encoded).trim();
    } catch {
        return encoded.trim();
    }
}

function extractJsonObject(value = ''): Record<string, unknown> | null {
    const text = String(value || '').trim();
    const direct = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const candidates = [direct];
    const start = direct.indexOf('{');
    const end = direct.lastIndexOf('}');
    if (start >= 0 && end > start) {candidates.push(direct.slice(start, end + 1));}
    for (const candidate of candidates) {
        try {
            const parsed = JSON.parse(candidate);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return parsed as Record<string, unknown>;
            }
        } catch {
            // Try the next bounded JSON candidate.
        }
    }
    return null;
}

function parsePhoneReply(value = ''): TavernPhoneReplyPayload {
    const parsed = extractJsonObject(value);
    if (!parsed) {
        const fallback = normalizeText(value, 500);
        if (!fallback) {throw new Error('对方没有返回可读消息。');}
        return { result: 'reply', messages: [fallback] };
    }
    const result = parsed.result === 'silent' || parsed.result === 'unavailable' ? parsed.result : 'reply';
    const sourceMessages = Array.isArray(parsed.messages)
        ? parsed.messages
        : typeof parsed.reply === 'string'
            ? [parsed.reply]
            : [];
    const messages = result === 'reply'
        ? sourceMessages.map((item) => normalizeText(item, 500)).filter(Boolean).slice(0, 3)
        : [];
    if (result === 'reply' && !messages.length) {
        throw new Error('对方没有返回可读消息。');
    }
    const normalizedSummary = typeof parsed.summary === 'string' ? normalizeText(parsed.summary, 1200) : '';
    const summary = normalizedSummary || undefined;
    return { result, messages, summary };
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
    const activePending = ref<{ sessionId: string; threadId: string; sequence: number } | null>(null);
    let refreshSequence = 0;
    let openContactSequence = 0;
    let sessionChangeSequence = 0;

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
        isSending.value
        && sendingSessionId.value === String(options.selectedSessionId.value || '').trim()
        && activePending.value?.threadId === activeThreadId.value
    ));
    const contactCandidates = computed<TavernPhoneContactCandidate[]>(() => {
        const existingPaths = new Set(contacts.value.map((contact) => String(contact.memoryPath || '')).filter(Boolean));
        const existingNames = new Set(contacts.value.map((contact) => contact.name.trim().toLocaleLowerCase('zh-CN')));
        const result: TavernPhoneContactCandidate[] = [];
        const character = options.effectiveContext.value.character || {};
        const characterName = normalizeText(character.name, 120);
        if (characterName && !existingNames.has(characterName.toLocaleLowerCase('zh-CN'))) {
            result.push({
                key: `character:${character.characterKey || characterName}`,
                name: characterName,
                avatar: options.visibleCharacterAvatar.value,
                memoryPath: '',
                source: 'character',
            });
        }
        for (const file of options.memoryFiles.value) {
            const path = String(file.path || '').trim();
            const name = memoryCharacterName(path);
            if (!name || existingPaths.has(path) || existingNames.has(name.toLocaleLowerCase('zh-CN'))) {continue;}
            result.push({
                key: `memory:${path}`,
                name,
                avatar: '',
                memoryPath: path,
                source: 'memory',
            });
        }
        return result.sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'));
    });

    const sendBlockedReason = computed(() => {
        if (!options.selectedSessionId.value) {return '请先进入一个会话。';}
        if (options.chatRunning.value || options.chatCancelling.value) {return '角色正在回复，暂时不能发送手机消息。';}
        if (options.managerBusy.value || options.managerAssistantRunning.value || options.managerAssistantCancelling.value) {
            return '助手正在维护档案，暂时不能发送手机消息。';
        }
        if (options.memoryEditorMode.value === 'edit') {return '请先退出记忆编辑，再发送手机消息。';}
        if (options.characterArchiveBusy.value) {return '角色档案正在同步，暂时不能发送手机消息。';}
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

    async function refreshPhone() {
        const requestSequence = ++refreshSequence;
        const sessionId = String(options.selectedSessionId.value || '').trim();
        if (!sessionId) {
            contacts.value = [];
            threads.value = [];
            messages.value = [];
            threadPreviews.value = {};
            threadSearchText.value = {};
            return;
        }
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
    }

    async function recoverInterruptedMessages(sessionId: string) {
        const active = activePending.value;
        if (isSending.value && sendingSessionId.value === sessionId && !active) {return;}
        await recoverInterruptedTavernCommunicationMessages(
            sessionId,
            active?.sessionId === sessionId ? { threadId: active.threadId, sequence: active.sequence } : undefined,
        );
    }

    async function prepareMessages() {
        status.value = '';
        const sessionId = String(options.selectedSessionId.value || '').trim();
        if (sessionId) {await recoverInterruptedMessages(sessionId);}
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

    async function addContact(candidate: TavernPhoneContactCandidate) {
        const sessionId = String(options.selectedSessionId.value || '').trim();
        if (!sessionId) {return;}
        const created = await createTavernCommunicationContact({
            sessionId,
            name: candidate.name,
            avatar: candidate.avatar,
            memoryPath: candidate.memoryPath,
            source: candidate.source,
        });
        await refreshPhone();
        await openContact(created.contact.id);
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
        pendingMessage: TavernCommunicationMessageRecord,
    ) {
        const history = await listTavernCommunicationMessages(task.sessionId, task.thread.id);
        const contactMemory = task.contact.memoryPath
            ? await getTavernMemoryFile(task.sessionId, task.contact.memoryPath)
            : null;
        const character = task.contextSnapshot.character || {};
        const fallbackProfile = task.contact.source === 'character'
            ? [character.description, character.personality, character.scenario].filter(Boolean).join('\n\n')
            : '';
        return buildTavernMessagesRequestMessages({
            sessionId: task.sessionId,
            contextSnapshot: task.contextSnapshot,
            contact: task.contact,
            contactProfile: normalizeText(contactMemory?.content || fallbackProfile, 12000),
            thread: task.thread,
            communicationMessages: history,
            pendingMessage,
        });
    }

    function isTaskVisible(task: TavernPhoneSendTask, threadId = task.thread.id): boolean {
        return task.sessionId === String(options.selectedSessionId.value || '').trim()
            && threadId === activeThreadId.value;
    }

    async function runPendingMessage(
        task: TavernPhoneSendTask,
        preparePending: () => Promise<TavernCommunicationMessageRecord>,
    ) {
        isSending.value = true;
        sendingSessionId.value = task.sessionId;
        status.value = `${task.contact.name}正在输入…`;
        let pending: TavernCommunicationMessageRecord | null = null;
        try {
            pending = await preparePending();
            if (pending.sessionId !== task.sessionId || pending.threadId !== task.thread.id) {
                throw new Error('communication_send_task_mismatch');
            }
            activePending.value = {
                sessionId: pending.sessionId,
                threadId: pending.threadId,
                sequence: pending.sequence,
            };
            await refreshPhone();
            const result = await runTavernOnce({
                agentConfig: task.agentConfig,
                messages: await buildPhoneMessages(task, pending),
                tools: [],
                toolChoice: 'none',
            });
            const payload = parsePhoneReply(result.text);
            await completeTavernCommunicationExchange({
                pendingMessage: pending,
                replies: payload.messages,
                result: payload.result,
                summary: payload.summary,
                provider: result.provider,
                model: result.model,
                unreadCountDelta: payload.result === 'reply'
                    && !options.isThreadVisible?.(task.sessionId, pending.threadId)
                    ? payload.messages.length
                    : 0,
            });
            if (isTaskVisible(task, pending.threadId)) {
                status.value = payload.result === 'unavailable'
                    ? '暂时无法联系到对方'
                    : payload.result === 'silent'
                        ? '对方暂时没有回复'
                        : '';
            }
        } catch (error) {
            if (pending) {await failTavernCommunicationMessage(pending, error);}
            if (isTaskVisible(task, pending?.threadId || task.thread.id)) {
                status.value = error instanceof Error ? error.message : String(error || '发送失败');
            }
        } finally {
            isSending.value = false;
            sendingSessionId.value = '';
            activePending.value = null;
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
        await runPendingMessage(task, () => appendPendingTavernCommunicationMessage({
            sessionId: task.sessionId,
            threadId: task.thread.id,
            content,
        }));
    }

    async function retryMessage(message: TavernCommunicationMessageRecord) {
        if (message.status !== 'failed') {return;}
        const blocked = sendBlockedReason.value;
        const contact = activeContact.value;
        const thread = activeThread.value;
        if (blocked || !contact || !thread || message.threadId !== thread.id) {
            status.value = blocked || '当前短信线程已经变化，无法重试。';
            return;
        }
        const task = createSendTask(contact, thread);
        await runPendingMessage(task, () => retryFailedTavernCommunicationMessage(message));
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
            if (sessionId) {await recoverInterruptedMessages(sessionId);}
            if (requestSequence !== sessionChangeSequence || sessionId !== String(options.selectedSessionId.value || '').trim()) {return;}
            await refreshPhone();
        })();
    }, { immediate: true });

    return {
        activeContact,
        activeContactId,
        activeThread,
        activeThreadId,
        addContact,
        canSend,
        contactCandidates,
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
        retryMessage,
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
