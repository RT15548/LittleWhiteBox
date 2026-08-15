export function normalizeTimeText(value) {
    return String(value || '').replace(/\s+/g, '').replace(/：/g, ':');
}

export function parseEventRange(summary) {
    const match = String(summary || '').match(/\(#(\d+)(?:-(\d+))?\)/);
    if (!match) return null;
    return {
        start: Number(match[1]) - 1,
        end: Number(match[2] || match[1]) - 1,
    };
}

export function extractFullTimeMarker(value) {
    return normalizeTimeText(value)
        .match(/(?:\d{2,4}年)?\d{1,2}月\d{1,2}日\d{1,2}:\d{2}/)?.[0] || null;
}

export function findExactTimeFloors(chat, marker) {
    if (!marker) return [];
    const normalizedMarker = normalizeTimeText(marker);
    const floors = [];
    for (let floor = 0; floor < (chat || []).length; floor++) {
        if (normalizeTimeText(chat[floor]?.mes).includes(normalizedMarker)) floors.push(floor);
    }
    return floors;
}

export function eventMatchesTemporalFloors(event, floors) {
    if (!(floors || []).length) return false;
    const range = parseEventRange(event?.summary);
    if (!range) return false;
    return floors.some(floor => (
        (floor >= range.start && floor <= range.end) || floor === range.end + 1
    ));
}

function normalizeUserNames(userNames) {
    const values = Array.isArray(userNames) ? userNames : [userNames];
    return [...new Set(values.map(normalizeTimeText).filter(Boolean))];
}

function inferTemporalQuerySpeaker(query, userNames) {
    const text = String(query || '');
    const normalizedUserNames = normalizeUserNames(userNames);
    if (!text || !normalizedUserNames.length) return null;

    const normalized = normalizeTimeText(text);
    const towardsIndex = normalized.indexOf('对');
    if (towardsIndex < 0) return null;
    const speech = normalized.slice(towardsIndex + 1);
    const speechVerb = speech.search(/(?:说|问|告诉|回复|回答|表示)/);
    if (speechVerb < 0) return null;

    const subject = normalized.slice(0, towardsIndex);
    const object = speech.slice(0, speechVerb);
    if (normalizedUserNames.some(name => subject.includes(name))) return 'user';
    if (normalizedUserNames.some(name => object.includes(name))) return 'assistant';
    return null;
}

export function buildTemporalTurnCarrier({ chat, query, userName, timeMarker = null } = {}) {
    const marker = timeMarker ?? extractFullTimeMarker(query);
    const exactFloors = findExactTimeFloors(chat, marker);
    const userFloors = new Set();
    const assistantFloors = new Set();

    for (const floor of exactFloors) {
        if (chat?.[floor]?.is_user) {
            userFloors.add(floor);
            if (chat?.[floor + 1] && !chat[floor + 1].is_user) assistantFloors.add(floor + 1);
            continue;
        }

        assistantFloors.add(floor);
        if (floor > 0 && chat?.[floor - 1]?.is_user) userFloors.add(floor - 1);
    }

    const userNames = [
        userName,
        ...(chat || []).filter(message => message?.is_user).map(message => message?.name),
    ];

    return {
        marker,
        exactFloors,
        userFloors: [...userFloors].sort((left, right) => left - right),
        assistantFloors: [...assistantFloors].sort((left, right) => left - right),
        querySpeaker: inferTemporalQuerySpeaker(query, userNames),
    };
}

export function chunkMatchesTemporalCarrier(chunk, carrier) {
    if (!carrier?.marker) return false;
    if (carrier.querySpeaker === 'user') {
        return chunk?.isUser === true && (carrier.userFloors || []).includes(chunk.floor);
    }
    if (carrier.querySpeaker === 'assistant') {
        return chunk?.isUser !== true && (carrier.assistantFloors || []).includes(chunk.floor);
    }
    return normalizeTimeText(chunk?.text).includes(normalizeTimeText(carrier.marker));
}
