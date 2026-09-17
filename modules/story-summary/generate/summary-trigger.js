import { getSummarySourceEnd } from './source-boundary.js';

// Automatic scheduling and chronological replay use the same stable suffix.
export function getAutoSummaryPlan(chat, lastSummarized, trigger, reason) {
    const target = getSummarySourceEnd(chat, chat.length - 1, trigger.delayFloors);
    const pending = target - lastSummarized;
    const interval = trigger.interval || 1;
    const triggered = !!trigger.enabled
        && trigger.timing === reason
        && pending >= interval;
    return { target, pending, interval, triggered };
}
