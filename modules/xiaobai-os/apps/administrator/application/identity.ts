/** getRandomValues also works on LAN HTTP origins, unlike randomUUID. */
export function createAdministratorId(): string {
    return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
}
export function administratorToolCallKey(round: number, id: string): string { return `${round}:${id}`; }
