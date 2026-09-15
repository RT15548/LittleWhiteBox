/** The message body owns placement; the record with this ID owns the result. */
export const CHECK_MARKER_PATTERN = String.raw`\[dice:([a-zA-Z0-9_-]+)\]`;

export function checkMarker(id: string): string {
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) { throw new TypeError('dice_record_id_invalid'); }
    return `[dice:${id}]`;
}

export function checkMarkerIds(body: string): Set<string> {
    return new Set(Array.from(body.matchAll(new RegExp(CHECK_MARKER_PATTERN, 'g')), match => match[1]));
}

export function stripCheckMarkers(body: string, ownedIds: ReadonlySet<string>): string {
    return body.replace(new RegExp(CHECK_MARKER_PATTERN, 'g'), (marker, id: string) => ownedIds.has(id) ? '' : marker);
}
