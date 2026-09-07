import type { MessagesService } from '../application/service.js';
import type { MessagesTimeline } from '../application/timeline.js';
import { MessageSendError, sendPrivateMessage, type SendDependencies } from '../application/send.js';
import type { OutgoingMessage } from '../application/image-upload.js';
import { unsyncedIds } from '../application/projection.js';
import type { MessageSendFailure, PendingOutgoingMessage } from '../types.js';

export function createMessagesRuntime(deps: SendDependencies & {
    identity(): string; isGenerating(): boolean; changed(): void;
}) {
    let epoch = 0;
    let active: { controller: AbortController; contactId: string; messageId: string; stage: string; identity: string } | null = null;
    let error = '';
    let outgoing: (PendingOutgoingMessage & { identity: string }) | null = null;
    let failure: MessageSendFailure | null = null;
    let task: Promise<void> | null = null;
    function cancel() {epoch++; active?.controller.abort();}
    function guard() {
        const captured = epoch; const identity = deps.identity();
        return () => !!identity && captured === epoch && identity === deps.identity() && !deps.isGenerating();
    }
    function pendingOutgoing(): PendingOutgoingMessage | null {
        if (outgoing) {
            const state = deps.service.current();
            if (outgoing.identity !== deps.identity() || !state.contacts.some(contact => contact.id === outgoing?.contactId)
                || state.messages.some(message => message.id === outgoing?.messageId)) {outgoing = null;}
        }
        if (!outgoing) {return null;}
        const { identity: _identity, ...view } = outgoing;
        return view;
    }
    function start(contactId: string, messageId: string, payload?: OutgoingMessage): void {
        if (active) {
            if (active.messageId === messageId && active.identity === deps.identity()) {return;}
            throw new Error('messages_busy');
        }
        if (deps.isGenerating() || deps.service.pending() || deps.service.fileState() !== 'ready') {throw new Error('messages_not_ready');}
        const pending = pendingOutgoing();
        if (pending && (pending.messageId !== messageId || pending.contactId !== contactId)) {throw new Error('messages_busy');}
        if (!deps.service.current().contacts.some(contact => contact.id === contactId)) {throw new Error('messages_contact_missing');}
        if (pending && payload && JSON.stringify(pending.payload) !== JSON.stringify(payload)) {throw new Error('messages_action_conflict');}
        payload ??= pending?.payload;
        if (payload && !pending) {outgoing = { identity: deps.identity(), contactId, messageId, payload, createdAt: Date.now() };}
        error = ''; failure = null;
        const run = { contactId, messageId, stage: 'saving', controller: new AbortController(), identity: deps.identity() };
        active = run;
        const current = guard();
        deps.changed();
        task = sendPrivateMessage(deps, {
            contactId, messageId, payload, signal: run.controller.signal, guard: current,
            stage(stage) {run.stage = stage; deps.changed();},
        }).catch(cause => {
            const stage = cause instanceof MessageSendError ? cause.stage : run.stage;
            console.warn('[LittleWhiteBox] 私人信息未完成', { stage, messageId, cause });
            if (deps.identity() === run.identity) {
                const domain = deps.service.current();
                const sent = domain.messages.some(message => message.id === messageId);
                const hasImages = domain.messages.some(message => message.contactId === contactId
                    && message.payload.type === 'image' && message.payload.attachment);
                const message = run.controller.signal.aborted ? (sent ? '这次回复已停止，可以重试。' : '发送已停止，可以重试。')
                    : deps.service.pending() ? (sent ? '回复尚待保存确认，请先检查保存。' : '发送尚未确认，请先检查保存。')
                        : stage === 'uploading' ? '图片发送失败，可以重试。'
                            : cause instanceof Error && cause.message === 'messages_image_missing' ? '消息里的原图暂时无法读取，可恢复图片后重试，或删除这条图片消息后继续。'
                                : stage === 'syncing' ? '消息已保留，尚未写入主聊天。点上方「查看」继续处理。'
                                    : !sent ? '发送失败，可以重试。'
                                        : '暂时没有收到回复。请检查 API 配置或网络，再重试这条消息。'
                                            + (hasImages ? '若模型不支持图片，可更换模型，或点图片下方「删除图片消息」后继续。' : '');
                if (stage === 'syncing') {error = message;}
                else {failure = { contactId, messageId, message };}
            }
        }).finally(() => {pendingOutgoing(); if (active === run) {active = null;} deps.changed();});
    }
    return {
        start, cancel, guard,
        get active() {return active;}, get error() {return error;},
        get outgoing() {return pendingOutgoing();}, get failure() {return failure;},
        clearError() {error = ''; failure = null;},
        discard(messageId: string) {
            if (active || deps.service.pending()) {throw new Error('messages_busy');}
            if (outgoing?.messageId === messageId) {outgoing = null;}
            if (failure?.messageId === messageId) {failure = null;}
        },
        reset() {cancel(); outgoing = null; failure = null; error = '';},
        async stop() {cancel(); await task; outgoing = null; failure = null;},
    };
}

export async function syncCurrentMessages(service: MessagesService, timeline: MessagesTimeline, guard: () => boolean): Promise<void> {
    await service.refresh();
    const state = service.current();
    for (const segment of [...state.segments].reverse()) {
        const missing = new Set(unsyncedIds(service.current()));
        if (segment.messageIds.some(id => missing.has(id))) {await timeline.sync(segment.id, guard);}
    }
}
