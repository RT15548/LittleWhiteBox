/** getRandomValues remains available on SillyTavern's HTTP/LAN origins, unlike randomUUID. */
export function newMovingId(): string {
    return [...crypto.getRandomValues(new Uint32Array(4))].map(value => value.toString(16).padStart(8, '0')).join('');
}
