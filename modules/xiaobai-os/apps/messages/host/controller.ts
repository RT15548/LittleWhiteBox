import type { XiaobaiOsAppActivationContext, XiaobaiOsAppRuntime } from '../../../types.js';
import type { XiaobaiOsHostFrameMessage } from '../../../host/frame-bridge.js';
import { addContact, deleteContact, deleteImageMessage } from '../../../domains/messages/commands.js';
import { messageString, record } from '../../../domains/messages/invariants.js';
import { parseOutgoingMessage } from '../application/image-upload.js';
import { payloadText } from '../../../domains/messages/types.js';
import { unsyncedIds } from '../application/projection.js';
import type { MessagesService } from '../application/service.js';
import type { MessagesTimeline } from '../application/timeline.js';
import type { MessagesContext } from './context-adapter.js';
import type { MessagesMedia } from './media-adapter.js';
import { syncCurrentMessages, type createMessagesRuntime } from './runtime.js';
import type { MessagesClientState, ThreadPage } from '../types.js';

export interface MessagesControllerDependencies {
    service: MessagesService; timeline: MessagesTimeline; context: MessagesContext; media: MessagesMedia;
    runtime: ReturnType<typeof createMessagesRuntime>;
    identity(): string; isGenerating(): boolean;
    subscribeGeneration(listener: (active: boolean) => void): () => void;
    subscribeChat(listener: () => void): () => void;
}

export function createMessagesController(deps: MessagesControllerDependencies): XiaobaiOsAppRuntime & { emit(): void } {
    const { service, timeline, context, media, runtime } = deps;
    let activation: XiaobaiOsAppActivationContext | null = null;
    let pageIdentity = '';
    let localBusy = false;
    let localError = '';
    let chatBoundary = 0;
    let cleanups: (() => void)[] = [];
    function state(): MessagesClientState {
        const domain = service.current();
        const latest = new Map(domain.messages.map(message => [message.contactId, message]));
        return {
            chatIdentity: deps.identity(),
            contacts: domain.contacts.map(({ summary: _summary, ...contact }) => {
                const last = latest.get(contact.id);
                return { ...contact, preview: last ? (last.sender === 'user' ? '我：' : '') + (last.payload.type === 'image' ? '［图片］' : last.payload.type === 'voice' ? '［语音］' : '') + payloadText(last.payload).slice(0, 100) : '还没有消息', lastSeq: last?.seq ?? 0, lastAt: last?.createdAt ?? null, lastMessageId: last?.id ?? null };
            }).sort((left, right) => right.lastSeq - left.lastSeq || left.createdAt - right.createdAt),
            knownPeople: context.knownPeople().map(({ name, aliases }) => ({ name, aliases })),
            fileState: service.fileState(), pendingSave: service.pending(),
            busy: runtime.active?.identity === deps.identity() ? { contactId: runtime.active.contactId, messageId: runtime.active.messageId, stage: runtime.active.stage } : null,
            outgoing: runtime.outgoing, sendFailure: runtime.failure,
            generationActive: deps.isGenerating(), unsynced: unsyncedIds(domain).length,
            error: localError || runtime.error, media: media.capabilities(),
        };
    }
    function emit() {
        if (!activation?.isCurrent() || pageIdentity !== deps.identity()) {return;}
        try {activation.post('messages/state', { state: state() });}
        catch (cause) {console.warn('[LittleWhiteBox] 信息状态读取失败', cause);}
    }
    function page(contactId: string, before = Infinity): ThreadPage {
        const domain = service.current();
        const all = domain.messages.filter(message => message.contactId === contactId);
        const selected = all.filter(message => message.seq < before);
        const last = all.at(-1);
        return { contactId, messages: selected.slice(-50), hasMore: selected.length > 50,
            retryMessageId: last?.sender === 'user' ? last.id : null };
    }
    async function exclusive(task: () => Promise<unknown>) {
        if (localBusy || runtime.active) {throw new Error('messages_busy');}
        localBusy = true; localError = '';
        try {return await task();}
        finally {localBusy = false; emit();}
    }
    async function handleMessage(message: XiaobaiOsHostFrameMessage): Promise<unknown> {
        const payload = record(message.payload) ? message.payload : {};
        if (!activation?.isCurrent() || payload.chatIdentity !== deps.identity() || pageIdentity !== deps.identity()) {throw new Error('messages_chat_changed');}
        const guard = runtime.guard();
        const string = (key: string, max = 160) => messageString(payload[key], max).trim();
        try {
            switch (message.type) {
                case 'messages/refresh':
                    await service.refresh(); return state();
                case 'messages/thread': {
                    const before = payload.before === undefined ? Infinity : Number(payload.before);
                    if (before !== Infinity && (!Number.isSafeInteger(before) || before < 1)) {throw new Error('messages_invalid_page');}
                    return page(string('contactId'), before);
                }
                case 'messages/contact/add':
                    return await exclusive(async () => {
                        const id = `contact:${string('actionId', 100)}`;
                        const name = string('name', 120); const note = messageString(payload.note ?? '', 600, true).trim();
                        await service.change(domain => addContact(domain, { id, name, note, createdAt: Date.now(), summary: null }), guard);
                        return { contactId: id, state: state() };
                    });
                case 'messages/contact/note':
                    return await exclusive(async () => {
                        const contactId = string('contactId'); const note = messageString(payload.note, 600, true).trim();
                        await service.change(domain => {
                            const contact = domain.contacts.find(item => item.id === contactId);
                            if (!contact) {throw new Error('messages_contact_missing');} contact.note = note;
                        }, guard);
                        return state();
                    });
                case 'messages/contact/delete':
                    return await exclusive(async () => {
                        const contactId = string('contactId');
                        await service.change(domain => deleteContact(domain, contactId), guard);
                        return state();
                    });
                case 'messages/send':
                    if (localBusy) {throw new Error('messages_busy');}
                    runtime.start(string('contactId'), `input:${string('actionId', 100)}`, parseOutgoingMessage(payload.payload));
                    return state();
                case 'messages/message/delete-image':
                    return await exclusive(async () => {
                        const contactId = string('contactId'); const messageId = string('messageId');
                        await service.change(domain => deleteImageMessage(domain, contactId, messageId), guard);
                        runtime.clearError();
                        return { state: state(), retryMessageId: page(contactId).retryMessageId };
                    });
                case 'messages/retry':
                    if (localBusy) {throw new Error('messages_busy');}
                    runtime.start(string('contactId'), string('messageId'));
                    return state();
                case 'messages/discard-send':
                    runtime.discard(string('messageId')); return state();
                case 'messages/confirm':
                    return await exclusive(async () => {await service.confirm(); runtime.clearError(); return state();});
                case 'messages/adopt-server-state':
                    return await exclusive(async () => {
                        if (!guard()) {throw new Error('messages_chat_changed');}
                        const result = await service.adoptServerState();
                        if (!guard()) {throw new Error('messages_chat_changed');}
                        if (result.status === 'adopted') {timeline.reset(); runtime.reset();}
                        return state();
                    });
                case 'messages/sync':
                    return await exclusive(async () => {await syncCurrentMessages(service, timeline, guard); runtime.clearError(); return state();});
                case 'messages/recover':
                    return await exclusive(async () => {await service.refresh(); await timeline.recover(guard); runtime.clearError(); return state();});
                case 'messages/image/check':
                case 'messages/image/generate':
                case 'messages/voice/play': {
                    const id = string('messageId'); const current = activation;
                    const selected = service.current().messages.find(item => item.id === id);
                    if (!selected) {throw new Error('messages_message_missing');}
                    if (message.type === 'messages/voice/play') {
                        media.play(selected, status => current?.post('messages/voice-state', { messageId: id, status }));
                        return { started: true };
                    }
                    return { data: await media.image(selected, message.type === 'messages/image/generate') };
                }
                case 'messages/voice/stop': media.stop(); return {};
                default: throw new Error('messages_unknown_action');
            }
        } catch (cause) {
            console.warn('[LittleWhiteBox] 信息操作失败', cause);
            if (message.type.startsWith('messages/image/') || message.type.startsWith('messages/voice/')) {
                throw new Error('媒体暂不可用，消息原文已保留。');
            }
            const code = cause instanceof Error ? cause.message : '';
            const userMessage = code === 'messages_contact_exists' ? '通讯录里已经有这个人了。'
                : code === 'messages_busy' ? '上一项操作还没完成，请稍候。'
                    : code.startsWith('messages_invalid') ? '请检查输入内容和长度。'
                        : code === 'messages_projection_closed' ? '原记录已被修改、删除，或故事已继续。可以展开下方说明，在当前位置补记。'
                            : '操作未完成，已保存的消息会保留，请稍后重试。';
            localError = userMessage; emit(); throw new Error(userMessage);
        }
    }
    function deactivate() {activation = null; pageIdentity = ''; media.cancelAll();}
    return {
        emit, handleMessage,
        activate(current) {
            activation = current; pageIdentity = deps.identity();
            void service.refresh().then(emit).catch(cause => {console.warn('[LittleWhiteBox] 信息读取失败', cause); localError = '通讯记录暂时无法读取，请重试。'; emit();});
            return state();
        },
        deactivate, cancelForeground: deactivate, handleWindowClosed: deactivate,
        cancelAll() {chatBoundary++; runtime.cancel(); deactivate();},
        handleChatChanged() {chatBoundary++; runtime.reset(); timeline.reset(); localError = ''; deactivate();},
        startBackground() {
            if (cleanups.length) {return;}
            cleanups = [service.subscribe(emit), service.subscribeFile(emit),
                deps.subscribeGeneration(active => {if (active) {runtime.cancel();} emit();}),
                deps.subscribeChat(() => {
                    runtime.cancel();
                    const closed = timeline.observe();
                    const boundary = chatBoundary; const identity = deps.identity();
                    // Sealing records an already observed fact. Subsequent edit/render
                    // events or generation must not cancel it like an unfinished reply.
                    const guard = () => !!identity && chatBoundary === boundary && deps.identity() === identity;
                    if (closed.length) {void timeline.seal(closed, guard).catch(cause => console.warn('[LittleWhiteBox] 通讯时点封存待确认', cause));}
                    emit();
                })];
        },
        async stopBackground() {chatBoundary++; cleanups.forEach(cleanup => cleanup()); cleanups = []; deactivate(); await runtime.stop();},
    };
}
