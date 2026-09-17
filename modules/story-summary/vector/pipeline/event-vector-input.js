export function buildEventVectorText(event) {
    return `${event?.title || ''} ${event?.summary || ''}`.trim();
}

export function selectMissingEventVectorPairs(events, vectors, fingerprint) {
    const existingIds = new Set(vectors.filter(item => item?.fingerprint === fingerprint)
        .map(item => item?.eventId).filter(Boolean));
    return (events || []).filter(event => event?.id && !existingIds.has(event.id))
        .map(event => ({ id: event.id, text: buildEventVectorText(event) })).filter(pair => pair.text);
}
