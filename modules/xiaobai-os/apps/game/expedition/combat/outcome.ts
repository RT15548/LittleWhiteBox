import type { Battle } from '../types.js';

/** The same cause drives simulation termination and the player's result screen. */
export function defeatReason(b: Pick<Battle, 'player' | 'boss' | 'encounter' | 'objective'>): 'fallen' | 'beacon' | null {
    if (b.player.hp <= 0) { return 'fallen'; }
    if (!b.boss && b.encounter === 'siege' && b.objective.hp <= 0) { return 'beacon'; }
    return null;
}
