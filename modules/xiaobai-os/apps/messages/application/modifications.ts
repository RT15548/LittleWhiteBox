import { sha256 } from 'js-sha256';
import { applyMessageMutation } from '../../../domains/messages/mutation.js';
import type { MessageMutation, MessagesDomainV2, PrivateMessage } from '../../../domains/messages/types.js';
import { projectionText } from '../../../domains/messages/transcript.js';
import type { MessagesService } from './service.js';
import type { MessagesChatPort, MessagesTimeline } from './timeline.js';
import { projectionMarker } from './projection.js';
import { floorDigest, prefixDigest, hasMutationBase, hasMutationResult, mutationResult } from './mutation-evidence.js';

export interface ModificationTarget { contactId: string; messageId?: string; revision: string }
export interface MessagePermission { reason: string; regenerate: boolean }

export function messagesRevision(state: MessagesDomainV2): string {return sha256(JSON.stringify(state));}

export function createMessagesModifications(service: MessagesService, timeline: MessagesTimeline, chat: MessagesChatPort, id: () => string) {
    /** One read/refresh owns this assessment. Never cache it across host changes. */
    function inspect(state: MessagesDomainV2) {
        const memberships = new Map<string, typeof state.segments>();
        for (const segment of state.segments) {for (const id of segment.messageIds) {
            const owners = memberships.get(id) ?? []; owners.push(segment); memberships.set(id, owners);
        }}
        const reasons = new Map<string, string>();
        function segmentReason(segment: MessagesDomainV2['segments'][number]): string {
            if (!reasons.has(segment.id)) {reasons.set(segment.id, checkSegment(segment));}
            return reasons.get(segment.id)!;
        }
        function reason(ids: string[]): string {
            if (state.pendingMutation || service.pending()) {return '还不确定上次修改是否保存成功，请先检查保存。';}
            if (service.fileState() !== 'ready') {return '信息记录暂时不可用，请先检查保存。';}
            const segment = memberships.get(ids[0])?.[0];
            if (!segment || ids.some(id => {
                const owners = memberships.get(id); return owners?.length !== 1 || owners[0] !== segment;
            })) {return '这些记录不在同一段可修改的通讯中。';}
            return segmentReason(segment);
        }
        function checkSegment(segment: MessagesDomainV2['segments'][number]): string {
            const matches = chat.messages().flatMap((message, index) => projectionMarker(message)?.segmentId === segment.id ? [{ message, index }] : []);
            if (!matches.length) {return '主聊天中的通讯楼层已被删除，不能再修改这条信息。';}
            if (matches.length !== 1) {return '主聊天中出现了重复的通讯记录，暂时不能修改。';}
            const { message, index } = matches[0];
            if (index <= chat.finalizedThrough()) {return '这段通讯已纳入剧情总结，不能再修改。';}
            if (message.is_user !== false || message.is_system !== false
                || message.mes !== projectionText(state, segment) || !segment.receipt
                || projectionMarker(message)!.digest !== segment.receipt.digest) {return '主聊天中的通讯楼层已被手动修改，不能再覆盖。';}
            if (index !== chat.messages().length - 1 || !timeline.intact(segment, state)) {return '主聊天已经推进到新楼层，不允许删除过往信息。';}
            return '';
        }
        function permissions(contactId: string, messages: PrivateMessage[]) {
            const last = replyGroup(state, contactId, reason).at(-1)?.id;
            return Object.fromEntries(messages.map(message => [message.id,
                { reason: reason([message.id]), regenerate: message.id === last }]));
        }
        return { reason, permissions };
    }
    function reason(state: MessagesDomainV2, ids: string[]): string {return inspect(state).reason(ids);}
    function replyGroup(state: MessagesDomainV2, contactId: string, check = (ids: string[]) => reason(state, ids)): PrivateMessage[] {
        const last = state.messages.filter(message => message.contactId === contactId).at(-1);
        if (!last || last.sender !== 'contact' || !last.replyTo) {return [];}
        const group = state.messages.filter(message => message.replyTo === last.replyTo);
        const incoming = state.messages.find(message => message.id === last.replyTo);
        if (!incoming || check([incoming.id, ...group.map(message => message.id)])) {return [];}
        return group;
    }
    function permissions(state: MessagesDomainV2, contactId: string, messages: PrivateMessage[]) {
        return inspect(state).permissions(contactId, messages);
    }
    function authorize(target: ModificationTarget, kind: MessageMutation['kind']) {
        const state = service.current();
        if (target.revision !== messagesRevision(state)) {throw new Error('记录已经变化，请重新选择这条消息。');}
        if (!state.contacts.some(contact => contact.id === target.contactId)) {throw new Error('messages_contact_missing');}
        const ids = kind === 'delete-contact' ? state.messages.filter(message => message.contactId === target.contactId).map(message => message.id)
            : kind === 'regenerate' ? replyGroup(state, target.contactId).map(message => message.id) : [target.messageId!];
        if (kind === 'regenerate' && (!ids.length || ids.at(-1) !== target.messageId)) {throw new Error('只能重新回复这位联系人最新的一轮。');}
        if (ids.some(id => !state.messages.some(message => message.id === id && message.contactId === target.contactId))) {throw new Error('messages_message_missing');}
        const blocked = ids.length ? reason(state, ids) : state.pendingMutation || service.pending() ? '还不确定上次修改是否保存成功，请先检查保存。' : '';
        if (blocked) {throw new Error(blocked);}
        return { state, ids };
    }
    async function recover(guard: () => boolean): Promise<void> {
        const state = service.current(); const mutation = state.pendingMutation;
        if (!mutation) {return;}
        const identity = chat.identity();
        const current = () => guard() && chat.identity() === identity;
        if (!current() || service.pending() || service.fileState() !== 'ready') {throw new Error('messages_not_ready');}
        const result = mutationResult(state, mutation);
        const saved = await chat.readSaved(identity);
        if (!current()) {throw new Error('messages_boundary_changed');}
        let confirmed = hasMutationResult(saved, mutation, result);
        if (!confirmed) {
            const segment = service.current().segments.find(segment => segment.id === mutation.segmentId);
            const local = chat.messages();
            const canRetry = segment && !segment.sealed && !timeline.wasClosed(segment.id) && mutation.index > chat.finalizedThrough()
                && (hasMutationBase(local, mutation) || (hasMutationResult(local, mutation, result)
                    && local.length === mutation.index + (result ? 1 : 0)))
                && hasMutationBase(saved, mutation);
            if (!canRetry) {
                // A native edit already visible in memory may still be included in
                // an in-flight main-chat save. Do not discard its cross-file intent.
                if (hasMutationResult(local, mutation, result)) {throw new Error('还不确定主聊天中的修改是否保存成功，请稍后检查保存。');}
                await service.change(next => {
                    if (next.pendingMutation?.id === mutation.id) {
                        next.pendingMutation = null;
                        const original = next.segments.find(segment => segment.id === mutation.segmentId);
                        if (original) {original.sealed = true;}
                    }
                }, current);
                return;
            }
            confirmed = await chat.rewrite({ identity, mutation, result, guard: current });
        }
        if (!confirmed) {throw new Error('还不确定修改是否保存成功，请点击「检查保存」。');}
        if (!current()) {return;}
        await service.change(next => {
            if (next.pendingMutation?.id !== mutation.id) {throw new Error('messages_action_conflict');}
            applyMessageMutation(next, mutation);
            const segment = next.segments.find(segment => segment.id === mutation.segmentId);
            if (segment && (chat.messages().length !== mutation.index + 1 || mutation.index <= chat.finalizedThrough()
                || !hasMutationResult(chat.messages(), mutation, result))) {segment.sealed = true;}
        }, current);
    }
    async function commit(target: ModificationTarget, kind: MessageMutation['kind'], guard: () => boolean,
        replacement?: { messages: PrivateMessage[]; summary: MessageMutation['summary'] }): Promise<void> {
        const { state, ids } = authorize(target, kind);
        if (!guard()) {throw new Error('messages_boundary_changed');}
        if (!ids.length) {
            await service.change(next => {
                authorize(target, kind);
                if (messagesRevision(next) !== target.revision) {throw new Error('记录已经变化，请重新选择这条消息。');}
                next.contacts = next.contacts.filter(contact => contact.id !== target.contactId);
            }, guard);
            return;
        }
        const segment = state.segments.find(segment => segment.messageIds.includes(ids[0]))!;
        const index = chat.messages().length - 1;
        const mutation: MessageMutation = { id: id(), kind, contactId: target.contactId, segmentId: segment.id, index,
            baseDigest: floorDigest(chat.messages()[index]), prefixDigest: prefixDigest(chat.messages(), index), removeIds: ids,
            replacements: replacement?.messages ?? [], summary: replacement?.summary ?? null };
        await service.change(next => {
            authorize(target, kind);
            if (messagesRevision(next) !== target.revision) {throw new Error('记录已经变化，请重新选择这条消息。');}
            next.nextSeq += mutation.replacements.length;
            next.pendingMutation = mutation;
        }, guard);
        await recover(guard);
    }
    return { inspect, reason, permissions, authorize, commit, recover };
}
export type MessagesModifications = ReturnType<typeof createMessagesModifications>;
