import type { MessagesService } from '../application/service.js';
import type { MessagesTimeline } from '../application/timeline.js';
import { MessageSendError, sendPrivateMessage, type SendDependencies } from '../application/send.js';
import type { OutgoingMessage } from '../application/image-upload.js';
import { unsyncedIds } from '../application/projection.js';
import type { MessageReplyPreview, MessageSendFailure, PendingOutgoingMessage } from '../types.js';
import type { MessagesModifications, ModificationTarget } from '../application/modifications.js';
import { regenerateMessageReply } from '../application/regenerate.js';
import { previewMessageContext } from '../application/context-preview.js';
import type { MessageContact, PrivateMessage } from '../../../domains/messages/types.js';
import { messageSyncCopy } from '../sync-copy.js';

function contextFailure(cause: unknown): string {
    const code = cause instanceof Error ? cause.message : '';
    return code === 'messages_context_capacity' ? '上下文超过 158k，近期原文已保留。请减少背景材料或附图后重试。'
        : code === 'messages_summary_not_reduced' ? '这次总结没能缩短聊天记录，摘要没有保存，请重试。'
            : code === 'prompt_context_character_fields_unavailable' || code === 'prompt_context_character_fields_failed'
                ? '当前人物资料暂时无法读取，消息已保留，请重试。'
                : code === 'prompt_context_world_info_unavailable' || code === 'prompt_context_world_info_failed'
                    ? '当前世界书暂时无法读取，消息已保留，请重试。'
                    : code === 'prompt_context_story_events_failed'
                        ? '剧情记忆暂时无法读取，消息已保留，请重试。' : '';
}

export function createMessagesRuntime(deps: SendDependencies & {
    modifications: MessagesModifications;
    identity(): string; isGenerating(): boolean; changed(): void;
}) {
    let epoch = 0;
    type Run = { controller: AbortController; contactId: string; messageId: string; stage: string; identity: string; preview: MessageReplyPreview | null };
    let active: Run | null = null;
    let previewShown = 0;
    let latestRun: Run | null = null;
    let error = '';
    let syncError = '';
    let outgoing: (PendingOutgoingMessage & { identity: string }) | null = null;
    let failure: MessageSendFailure | null = null;
    const tasks = new Set<Promise<void>>();
    function cancel() {epoch++; active?.controller.abort(); active = null; deps.changed();}
    function guard() {
        const captured = epoch; const identity = deps.identity();
        return () => !!identity && captured === epoch && identity === deps.identity() && !deps.isGenerating();
    }
    function showPreview(run: Run, next: MessageReplyPreview) {
        const previous = run.preview;
        run.preview = next;
        // New bubbles and completed character state show at once; partial text refreshes at a calmer pace.
        if (!previous || previous.replies.length !== next.replies.length || previous.characterStateDone !== next.characterStateDone
            || Date.now() - previewShown >= 300) {previewShown = Date.now(); deps.changed();}
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
        if (deps.isGenerating() || deps.service.pending() || deps.service.current().pendingMutation || deps.service.fileState() !== 'ready') {throw new Error('messages_not_ready');}
        const pending = pendingOutgoing();
        if (pending && (pending.messageId !== messageId || pending.contactId !== contactId)) {throw new Error('messages_busy');}
        if (!deps.service.current().contacts.some(contact => contact.id === contactId)) {throw new Error('messages_contact_missing');}
        if (pending && payload && JSON.stringify(pending.payload) !== JSON.stringify(payload)) {throw new Error('messages_action_conflict');}
        payload ??= pending?.payload;
        if (payload && !pending) {outgoing = { identity: deps.identity(), contactId, messageId, payload, createdAt: Date.now() };}
        error = ''; syncError = ''; failure = null;
        const run: Run = { contactId, messageId, stage: 'saving', controller: new AbortController(), identity: deps.identity(), preview: null };
        active = run; latestRun = run;
        const current = guard();
        deps.changed();
        const task = sendPrivateMessage(deps, {
            contactId, messageId, payload, signal: run.controller.signal, guard: current,
            recoverInput: () => run.identity === deps.identity() && !deps.isGenerating()
                && deps.service.current().contacts.some(contact => contact.id === contactId),
            stage(stage) {
                run.stage = stage;
                // Committed replies replace the provisional ones; a failure leaves none behind.
                if (stage !== 'replying' && stage !== 'saving-reply') {run.preview = null;}
                if (stage === 'syncing' && active === run) {active = null;}
                deps.changed();
            },
            preview: next => showPreview(run, next),
        }).catch(cause => {
            const stage = cause instanceof MessageSendError ? cause.stage : run.stage;
            console.warn('[LittleWhiteBox] 私人信息未完成', { stage, messageId, cause });
            if (deps.identity() === run.identity && latestRun === run) {
                const domain = deps.service.current();
                const sent = domain.messages.some(message => message.id === messageId);
                const hasImages = domain.messages.some(message => message.contactId === contactId
                    && message.payload.type === 'image' && message.payload.attachment);
                const message = contextFailure(cause) || (run.controller.signal.aborted ? (sent ? '这次回复已停止，可以重试。' : '发送已停止，可以重试。')
                    : deps.service.pending() ? (sent ? '还不确定回复是否保存成功，请先检查保存。' : '还不确定是否发送成功，请先检查保存。')
                        : stage === 'uploading' ? '图片发送失败，可以重试。'
                            : cause instanceof Error && cause.message === 'messages_image_missing' ? '消息里的原图暂时无法读取，请恢复图库中的原图后重试。'
                                : stage === 'syncing' ? messageSyncCopy.failed
                                    : !sent ? '发送失败，可以重试。'
                                        : '暂时没有收到回复。请检查 API 配置或网络，再重试这条消息。'
                                            + (hasImages ? '若模型不支持图片，可更换支持图片的模型后重试。' : ''));
                if (stage === 'syncing') {syncError = message;}
                else {failure = { contactId, messageId, message };}
            }
        }).finally(() => {pendingOutgoing(); if (active === run) {active = null;} tasks.delete(task); deps.changed();});
        tasks.add(task);
    }
    function regenerate(target: ModificationTarget) {
        if (active || pendingOutgoing()) {throw new Error('messages_busy');}
        if (deps.isGenerating()) {throw new Error('messages_not_ready');}
        deps.modifications.authorize(target, 'regenerate');
        const run: Run = { contactId: target.contactId, messageId: target.messageId!, stage: 'replying', controller: new AbortController(), identity: deps.identity(), preview: null };
        const current = guard(); active = run; latestRun = run; error = ''; failure = null; deps.changed();
        const task = regenerateMessageReply(deps, deps.modifications, target, { signal: run.controller.signal, guard: current,
            stage(stage) {
                run.stage = stage;
                if (stage !== 'replying' && stage !== 'saving-reply') {run.preview = null;}
                deps.changed();
            },
            preview: next => showPreview(run, next),
        }).catch(cause => {
            console.warn('[LittleWhiteBox] 重新回复未完成', cause);
            if (run.identity === deps.identity() && latestRun === run) {error = deps.service.pending() || deps.service.current().pendingMutation
                ? '还不确定修改是否保存成功，请点击「检查保存」。' : contextFailure(cause) || '重新回复未完成，原回复已保留。';}
        }).finally(() => {if (active === run) {active = null;} tasks.delete(task); deps.changed();});
        tasks.add(task);
    }
    return {
        start, regenerate, cancel, guard,
        contextStats: (contact: MessageContact, history: PrivateMessage[]) => previewMessageContext(deps, contact, history),
        get active() {return active;}, get error() {return error;},
        get syncError() {return syncError;},
        get outgoing() {return pendingOutgoing();}, get failure() {return failure;},
        clearError() {error = ''; syncError = ''; failure = null;},
        discard(messageId: string) {
            if (active || deps.service.pending()) {throw new Error('messages_busy');}
            if (outgoing?.messageId === messageId) {outgoing = null;}
            if (failure?.messageId === messageId) {failure = null;}
        },
        reset() {cancel(); latestRun = null; outgoing = null; failure = null; error = ''; syncError = '';},
        async stop() {cancel(); latestRun = null; await Promise.allSettled([...tasks]); outgoing = null; failure = null;},
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
