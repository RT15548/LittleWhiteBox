const DEFAULT_MAX_CHARACTERS = 20_000;

function normalizeText(value) {
    return String(value ?? '')
        .normalize('NFKC')
        .replace(/\r\n?/g, '\n')
        .replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/gu, ' ')
        .trim();
}

function codePointLength(value) {
    return Array.from(value).length;
}

function eventBoundary(event) {
    const raw = event?._addedAt;
    if (raw === null || raw === undefined || raw === '') {return null;}
    const value = Number(raw);
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function eventBlock(event) {
    const time = normalizeText(event?.timeLabel);
    const title = normalizeText(event?.title);
    const summary = normalizeText(event?.summary);
    const participants = Array.isArray(event?.participants)
        ? event.participants.map(normalizeText).filter(Boolean)
        : [];
    const heading = [time ? `【${time}】` : '', title].filter(Boolean).join(' ');
    return [
        heading,
        participants.length ? `参与者：${participants.join('、')}` : '',
        summary ? `摘要：${summary}` : '',
    ].filter(Boolean).join('\n');
}

/** _addedAt bounds when an event was recorded, not when it happened inside the summary batch. */
export function formatStorySummaryL2Events(events, {
    throughMessageIndex,
    maxCharacters = DEFAULT_MAX_CHARACTERS,
} = {}) {
    const through = Number(throughMessageIndex);
    if (!Number.isSafeInteger(through) || through < 0 || !Array.isArray(events)) {return '';}
    const requested = Number(maxCharacters);
    const budget = Math.min(
        DEFAULT_MAX_CHARACTERS,
        Number.isFinite(requested) ? Math.max(0, Math.trunc(requested)) : DEFAULT_MAX_CHARACTERS,
    );
    if (budget <= 0) {return '';}

    const candidates = events
        .map((event, index) => ({ event, index, boundary: eventBoundary(event), block: eventBlock(event) }))
        .filter(item => item.boundary !== null && item.boundary <= through && item.block)
        .sort((left, right) => left.boundary - right.boundary || left.index - right.index);
    const selected = [];
    let used = 0;
    for (let index = candidates.length - 1; index >= 0; index -= 1) {
        const candidate = candidates[index];
        const cost = codePointLength(candidate.block) + (selected.length ? 2 : 0);
        if (cost > budget && !selected.length) {continue;}
        if (used + cost > budget) {break;}
        selected.push(candidate);
        used += cost;
    }
    return selected.reverse().map(item => item.block).join('\n\n');
}
