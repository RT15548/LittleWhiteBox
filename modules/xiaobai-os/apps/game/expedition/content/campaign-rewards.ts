import type { Relic, Weapon } from '../types.js';

export const REWARD_NODES = ['crossroads', 'approach', 'passage', 'cells', 'warden', 'roots'] as const;
export type RewardNode = typeof REWARD_NODES[number];
export const CHAPTER_GROWTH = Object.freeze({ rankCap: 2, choices: 3 });
export const NEW_RELIC_NODES: readonly RewardNode[] = ['crossroads', 'approach', 'passage'];
export const STARTER_RELICS: Record<Weapon, readonly Relic[]> = {
    blade: ['riposte', 'cinder', 'aegis'], bow: ['pinning', 'cinder', 'aegis'],
    staff: ['nova', 'cinder', 'aegis'], daggers: ['backstab', 'cinder', 'aegis'],
    grimoire: ['pack-bond', 'cinder', 'aegis'], cannon: ['shrapnel', 'cinder', 'aegis'],
};
/** Working synergies; damage and trigger definitions remain in the relic system. */
export const RELIC_PAIRINGS: Partial<Record<Relic, readonly Relic[]>> = {
    riposte: ['thorns', 'aegis'], pinning: ['shatter'], nova: ['shatter', 'fracture'],
    backstab: ['shadowstep'], 'pack-bond': ['frenzy', 'covenant'], shrapnel: ['minefield'],
    cinder: ['wildfire'], frost: ['shatter'], aegis: ['thorns', 'quicksilver'],
};
