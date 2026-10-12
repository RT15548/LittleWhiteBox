export function random(state: { seed: number }): number {
    state.seed = (Math.imul(state.seed, 1664525) + 1013904223) >>> 0;
    return state.seed / 4294967296;
}
export function sample<T>(state: { seed: number }, values: readonly T[], count: number): T[] {
    const pool = [...values], result: T[] = [];
    while (pool.length && result.length < count) { result.push(pool.splice(Math.floor(random(state) * pool.length), 1)[0]); }
    return result;
}
export function newId() { return Array.from(crypto.getRandomValues(new Uint32Array(4)), value => value.toString(16).padStart(8, '0')).join(''); }
export function fault(code: 'invalid' | 'stale' | 'identity' | 'locked' | 'unavailable' | 'funds' | 'agent_not_configured' | 'agent_auth' | 'agent_failed' | 'context_capacity' | 'reply_invalid' | 'reply_incomplete' | 'cancelled'
    | 'data_invalid' | 'narrative_unavailable' | 'memory_incomplete' | 'memory_not_reduced' | `save_${'failed' | 'unconfirmed' | 'conflict'}`, cause?: unknown): never {
    throw Object.assign(new Error(`expedition_${code}`), { code: `expedition_${code}`, ...(cause === undefined ? {} : { cause }) });
}
