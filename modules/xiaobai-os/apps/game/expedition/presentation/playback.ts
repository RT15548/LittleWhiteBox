import { shallowRef, triggerRef, watch } from 'vue';
import type { Campaign } from '../campaign/types.js';
import { tickCampaign } from '../campaign/rules.js';
import { appendInput } from '../combat.js';
import { RULES } from '../content.js';
import type { ExpeditionClient } from '../client.js';
import type { InputFrame, InputSpan } from '../types.js';
import { peopleNeedTick } from '../world/people.js';

/** Local prediction owns only unconfirmed input. The host replays it, never accepts client positions. */
export function createCampaignPlayback(client: ExpeditionClient) {
    const current = shallowRef<Campaign | null>(null), dirty = shallowRef(false);
    let tape: InputSpan[] = [], ticks = 0, sending: Promise<boolean> | null = null, disposed = false;
    function sync() {
        const confirmed = client.view.value?.data.active;
        current.value = confirmed ? structuredClone(confirmed) : null;
        if (current.value) { for (const span of tape) { for (let i = 0; i < span.ticks; i++) { tickCampaign(current.value, span); } } }
        dirty.value = tape.length > 0;
    }
    const stop = watch(client.view, () => { if (!sending && !tape.length) { sync(); } }, { immediate: true });
    async function flush(): Promise<boolean> {
        if (sending) { if (!await sending) { return false; } return flush(); }
        if (!tape.length) { return !client.blocked.value; }
        if (client.blocked.value || disposed) { return false; }
        const spans = tape; tape = []; ticks = 0;
        sending = client.act({ type: 'input', spans });
        const ok = await sending; sending = null;
        if (ok) { sync(); }
        // A failed save's sent batch is owned by client.recover, not resubmitted with a new identity.
        else if (!client.failed.value) { tape = spans.concat(tape); ticks = tape.reduce((n, s) => n + s.ticks, 0); }
        dirty.value = tape.length > 0 || !ok;
        return ok;
    }
    function input(frame: InputFrame) {
        const c = current.value;
        if (!c || disposed || client.failed.value || client.uncertainTalk.value || client.notice.value || ticks >= RULES.maxInputTicks || !['exploration', 'battle'].includes(c.phase)) { return; }
        if (c.phase === 'exploration' && !frame.move && !peopleNeedTick(c)) { return; }
        tickCampaign(c, frame); appendInput(tape, frame); ticks++; dirty.value = true;
        triggerRef(current);
        if (ticks >= RULES.checkpointTicks || !['exploration', 'battle'].includes(c.phase)) { void flush(); }
    }
    return { current, dirty, input, flush, sync,
        async recover() { if (!await client.recover()) { return false; } sync(); return flush(); },
        dispose() { disposed = true; stop(); },
    };
}
