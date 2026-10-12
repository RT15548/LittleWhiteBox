import { parseEventRange } from '../vector/retrieval/temporal-turn-carrier.js';

// These labels accompany the Chinese narrative-memory sections, not an agent tool protocol.
export const CAUSAL_EVIDENCE_NOTE = '前因与后续是各段经历的关联记录，只覆盖部分经过。当前情况需结合眼前对话和其他记忆中的明确变化判断。计划与实际完成、人物是否知情，均以剧情记载为准。';

const DIRECTION_LABELS = { cause: '前因', consequence: '后续' };

export function causalRecordLabel(number) {
    return `关联记录${number}`;
}

export function formatCausalEvidence(event, { direction, parentLabel, label, reference }) {
    const relation = `${DIRECTION_LABELS[direction]}${parentLabel ? `（承接${parentLabel}）` : ''}`;
    if (reference) return `  ├─ ${relation}：见${label}`;
    const time = event.timeLabel ? `【${event.timeLabel}】` : '';
    const people = (event.participants || []).join(' / ');
    const summary = String(event.summary || '').replace(/\s*\(#\d+(?:-\d+)?\)\s*$/, '').trim();
    const range = parseEventRange(event.summary);
    const floorHint = range
        ? ` (#${range.start + 1}${range.end !== range.start ? `-${range.end + 1}` : ''})`
        : '';
    return `  ├─ ${relation} · ${label}${time}${people ? ` ${people}` : ''}\n  │  ${summary}${floorHint}`;
}
