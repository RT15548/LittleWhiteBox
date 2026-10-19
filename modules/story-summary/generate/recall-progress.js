import { xbLog } from '../../../core/debug-core.js';
import { recordRecallObservation } from '../recall-diagnostics.js';

const observers = new Set();

// Read-only, transient preparation lifecycle. The interceptor still owns adoption.
export function observeRecallPreparation(observer) {
    observers.add(observer);
    return () => observers.delete(observer);
}

export function reportRecallPreparation(phase, slot) {
    recordRecallObservation(slot.diagnostics, 'preparation', { phase });
    const event = {
        phase, run: slot, chat: slot.chat, type: slot.type, source: slot.capturedRef,
        signal: slot.controller.signal, detail: slot.diagnostics,
        recordHost: phase => recordRecallObservation(slot.diagnostics, 'host', { phase }),
    };
    for (const observer of observers) {
        try { observer(event); }
        catch (error) { xbLog.warn('recall-progress', 'Preparation observer failed', error); }
    }
}
