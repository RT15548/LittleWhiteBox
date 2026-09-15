import type { ChatSaveResult } from '../../../host/sillytavern-chat-save.js';
import { candidateMatchesDisk, isDiceTargetCurrent, readDiceRecords, stageDiceCandidate, type DiceCandidate, type DiceChat, type DiceTarget, type DiceHostMessage } from './message-records.js';
import { jsonValuesEqual } from '../../../host/json-values-equal.js';
import type { DiceSaveResult } from '../application/action-check-session.js';

export interface DiceSavePort {
    capture(): DiceChat | null;
    save(guard: () => boolean, signal?: AbortSignal): Promise<ChatSaveResult>;
    read(source: DiceChat): Promise<unknown[]>;
}

export function createDiceMessageSave(port: DiceSavePort) {
    let staged: DiceTarget | null = null;
    let writing: Promise<DiceSaveResult> | null = null;
    async function commit(target: DiceTarget, candidate: DiceCandidate, signal: AbortSignal, retry = false): Promise<DiceSaveResult> {
        const current = () => !signal.aborted && isDiceTargetCurrent(port.capture(), target)
            && jsonValuesEqual(readDiceRecords(target.message), target.records);
        if (staged || !current()) {
            return { status: 'conflict', error: '聊天或回复已变化，未保存这次骰点。' };
        }
        if (retry) {
            try {
                const messages = await port.read(target.source);
                if (!current()) { return { status: 'conflict', error: '聊天或回复已变化。' }; }
                if (messages.length !== target.index + 1) { return { status: 'conflict', error: '已保存的消息与当前不同，请重新加载聊天。' }; }
                if (candidateMatchesDisk(messages[target.index], target, candidate)) {
                    stageDiceCandidate(target, candidate);
                    return { status: 'confirmed' };
                }
                if (!candidateMatchesDisk(messages[target.index], target, target)) {
                    return { status: 'conflict', error: '已保存的回复有变化，请重新加载聊天。' };
                }
            } catch (error) { return { status: 'unconfirmed', error: String(error) }; }
        }
        staged = target;
        let rollback = () => {};
        let confirmed = false;
        try {
            rollback = stageDiceCandidate(target, candidate);
            const result = await port.save(() => isDiceTargetCurrent(port.capture(), target, candidate.body)
                && jsonValuesEqual(readDiceRecords(target.message), candidate.records), signal);
            if (result.status === 'confirmed') { confirmed = true; return result; }
            if (result.status === 'failed') { return { status: 'failed', error: result.error.message }; }
            // A lost acknowledgement is not a failed write. Read the captured chat, never the current one.
            const messages = await port.read(target.source);
            if (messages.length !== target.index + 1) { return { status: 'conflict', error: '已保存的消息与当前不同，请重新加载聊天。' }; }
            if (candidateMatchesDisk(messages[target.index], target, candidate)) {
                confirmed = true;
                return { status: 'confirmed' };
            }
            if (candidateMatchesDisk(messages[target.index], target, target)) {
                return { status: 'unconfirmed', error: '还不确定骰点是否保存成功，请检查保存。' };
            }
            return { status: 'conflict', error: '已保存的回复有变化，请重新加载聊天。' };
        } catch (error) {
            return { status: 'unconfirmed', error: error instanceof Error ? error.message : String(error) };
        } finally {
            if (!confirmed) { rollback(); }
            staged = null;
        }
    }
    return {
        commit(target: DiceTarget, candidate: DiceCandidate, signal: AbortSignal, retry = false): Promise<DiceSaveResult> {
            if (writing) { return Promise.resolve({ status: 'failed', error: '上一次骰点仍在保存。' }); }
            const operation = commit(target, candidate, signal, retry).finally(() => { writing = null; });
            writing = operation;
            return operation;
        },
        async settled() { await writing; },
        readConfirmed(message: DiceHostMessage): unknown {
            return staged?.message === message && (message.swipe_id ?? 0) === staged.swipe
                ? staged.records : readDiceRecords(message);
        },
    };
}
