import { createIdentifier } from '../../shared/common/identifier.js';
import { PLANNER_COPY } from './ena-planner-copy.js';

// ST 1.14/1.18 trim each message when building WorldInfoBuffer. A trailing
// whitespace token therefore survives prompt formatting but is absent from WI
// scanning (also with names enabled). No CR/LF: native newline normalization
// must not change the token. This token is removed before either model request.
const DIGITS = '\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u00a0\u1680';

export function createPlannerMarker() {
    return '\ufeff' + createIdentifier().replaceAll('-', '').split('')
        .map(hex => DIGITS[Number.parseInt(hex, 16)]).join('') + '\ufeff';
}

/** Keep restoration state alive only while the native message itself is alive. */
function createRelease(reference, snapshots) {
    return () => {
        const message = reference.deref();
        const snapshot = message && snapshots.get(message);
        if (snapshot && message.mes === snapshot.tagged) message.mes = snapshot.original;
    };
}

/** Own the native interceptor's copy, never the persistent user message. */
export function reservePlannerSlot(chat, source, marker) {
    const message = chat.at(-1);
    if (!message?.is_user || message === source || typeof message.mes !== 'string') {
        throw new Error(PLANNER_COPY.slot);
    }
    const original = message.mes;
    const tagged = `${original}\n\n${marker}`;
    message.mes = tagged;
    return createRelease(new WeakRef(message), new WeakMap([[message, { original, tagged }]]));
}
