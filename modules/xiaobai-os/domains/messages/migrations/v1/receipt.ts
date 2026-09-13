import { sha256 } from 'js-sha256';
import { projectionText } from './transcript.js';
import type { MessageSegment, MessagesDomainV1 } from './types.js';

/** Acknowledges the retained member prefix, not the continued existence of a native floor. */
export function messageReceipt(state: Pick<MessagesDomainV1, 'messages'>, segment: MessageSegment, throughSeq: number): MessageSegment['receipt'] {
    const ids = new Set(segment.messageIds);
    const last = state.messages.filter(message => ids.has(message.id) && message.seq <= throughSeq).at(-1);
    return last ? { throughSeq: last.seq, digest: sha256(projectionText(state, segment, last.seq)) } : null;
}
