import { TavernEconomyError } from '../../../../../shared/economy/economy-errors';
import { TavernPhoneBoundaryError } from '../../../../../shared/phone-boundary';
import {
    TavernPetError,
    TAVERN_PET_INSUFFICIENT_FUNDS_REASON,
} from '../../../../../shared/pet/pet-types';

export type TavernPetUiErrorKind =
    | 'conflict'
    | 'wallet'
    | 'chat'
    | 'provider'
    | 'abort'
    | 'generic';

export interface TavernPetUiError {
    kind: TavernPetUiErrorKind;
    message: string;
}

export function isTavernPetAbortError(error: unknown): boolean {
    if (error instanceof DOMException && error.name === 'AbortError') {return true;}
    const value = error as { name?: unknown; code?: unknown; message?: unknown } | null;
    return value?.name === 'AbortError'
        || value?.code === 'ABORT_ERR'
        || /aborted|aborterror/iu.test(String(value?.message || ''));
}

export function isTavernPetProviderUnavailable(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error || '');
    return /请先在 API 配置|provider.*(?:missing|unavailable|not ready)|api[_ -]?key|missing.*model/iu.test(message);
}

export function tavernPetUiError(error: unknown, context: 'action' | 'chat' = 'action'): TavernPetUiError {
    if (isTavernPetAbortError(error)) {return { kind: 'abort', message: '' };}
    if (error instanceof TavernPhoneBoundaryError) {
        return { kind: 'conflict', message: '情况变了。已经替你刷新住户和钱包。' };
    }
    if (error instanceof TavernEconomyError) {
        if (error.code === 'economy_balance_insufficient') {
            return { kind: 'wallet', message: '小白币不够。' };
        }
        return { kind: 'wallet', message: '情况变了。已经替你刷新住户和钱包。' };
    }
    if (error instanceof TavernPetError) {
        if (error.code === 'pet_revision_conflict'
            || error.code === 'pet_version_conflict'
            || error.code === 'pet_action_conflict'
            || error.code === 'pet_evolution_stale'
        ) {
            return {
                kind: 'conflict',
                message: context === 'chat'
                    ? '它在你等回复的时候变了主意。'
                    : '情况变了。已经替你刷新住户和钱包。',
            };
        }
        if (error.code === 'pet_interaction_unavailable'
            && error.reason === TAVERN_PET_INSUFFICIENT_FUNDS_REASON
        ) {
            return { kind: 'wallet', message: '小白币不够。' };
        }
        if (error.code === 'pet_chat_invalid' || error.code === 'pet_chat_unavailable') {
            return { kind: 'chat', message: '它不想理你。' };
        }
    }
    if (context === 'chat' && isTavernPetProviderUnavailable(error)) {
        return { kind: 'provider', message: '它今天不肯开口。' };
    }
    return {
        kind: 'generic',
        message: context === 'chat' ? '它不想理你。' : '这次没有碰到它。请再试一次。',
    };
}
