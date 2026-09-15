import { checkMarker } from '../domain/check-marker.js';
import { isCheckContinuationPoint, type ActionCheckRecord } from '../domain/check-records.js';
import { parseActionCheck } from '../protocol/request.js';
import type { DiceHostMessage } from './message-records.js';

/**
 * Native translation may still display the request that preceded a confirmed marker.
 * Replace only that terminal request in a temporary projection; never write to the translation or prose.
 */
export function checkDisplayProjection(message: DiceHostMessage, checks: readonly ActionCheckRecord[]): string {
    const display = typeof message.extra?.display_text === 'string' ? message.extra.display_text : message.mes;
    const last = checks.at(-1);
    if (display === message.mes || !last || !isCheckContinuationPoint(message.mes, last)) { return display; }
    const request = parseActionCheck(display);
    return request.kind === 'request' ? request.body + checkMarker(last.id) + display.slice(request.end) : display;
}
