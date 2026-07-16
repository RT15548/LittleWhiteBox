import type { TavernCommunicationMessageRecord } from '../../../../../shared/session-db';

export type TavernMessageVoiceStatus = 'idle' | 'loading' | 'playing' | 'ended' | 'error';
export type TavernMessageImageStatus = 'idle' | 'queued' | 'waiting' | 'generating' | 'ready' | 'error';

export interface TavernMessageVoiceState {
    status: TavernMessageVoiceStatus;
    duration?: number;
    error?: string;
}

export interface TavernMessageImageState {
    status: TavernMessageImageStatus;
    url?: string;
    queueAhead?: number;
    waitSeconds?: number;
    error?: string;
}

export function tavernCommunicationMediaKey(message: TavernCommunicationMessageRecord): string {
    return `${message.sessionId}:${message.threadId}:${message.sequence}`;
}

export function idleTavernMessageVoiceState(): TavernMessageVoiceState {
    return { status: 'idle' };
}

export function idleTavernMessageImageState(): TavernMessageImageState {
    return { status: 'idle' };
}

export function releasedTavernMessageImageState(
    current?: TavernMessageImageState,
): TavernMessageImageState | null {
    if (!current || current.status === 'idle' || current.status === 'ready') {return null;}
    if (current.status === 'error') {return current;}
    return { status: 'error', error: '图片生成已停止，点击重试可继续' };
}

export function shouldEnsureTavernMessageImage(
    current?: TavernMessageImageState,
    force = false,
): boolean {
    return force || !current || current.status === 'idle';
}
