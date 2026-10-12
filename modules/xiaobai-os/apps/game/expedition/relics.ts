import { RELICS, RULES } from './content.js';
import type { Loadout, Relic, RelicStack, Weapon } from './types.js';

export type RelicFamily = 'storm' | 'fire' | 'frost' | 'guard' | 'life' | 'skill' | 'risk' | 'blade' | 'bow' | 'staff' | 'daggers' | 'grimoire' | 'cannon';
interface RelicSpec { family: RelicFamily; weapons?: readonly Weapon[]; requires?: readonly (readonly Relic[])[]; chapter: number }
const common = (family: RelicFamily, requires?: readonly Relic[], chapter = 0): RelicSpec => ({ family, chapter, ...(requires ? { requires: [requires] } : {}) });
const own = (weapon: Weapon, chapter = 0): RelicSpec => ({ family: weapon, weapons: [weapon], chapter });
export const RELIC_SPECS: Record<Relic, RelicSpec> = {
    'storm-step': common('storm'), conductor: common('storm', ['storm-step', 'orbit', 'momentum', 'command']), momentum: common('storm'),
    cinder: common('fire'), wildfire: common('fire', ['cinder', 'inferno']), 'blood-price': common('risk'),
    frost: common('frost'), shatter: common('frost', ['frost', 'nova', 'pinning', 'trapper', 'orbitals']), echo: common('skill'),
    hunter: { ...common('bow'), weapons: ['bow', 'staff', 'grimoire', 'cannon'] }, piercing: common('blade'), orbit: common('storm'),
    thorns: common('guard'), aegis: common('guard'), siphon: common('life'), focus: common('skill'), renewal: common('life'), execution: common('blade'),
    'last-stand': common('guard', undefined, 1), quicksilver: common('skill'), magnet: common('skill'), wardstone: common('guard'), pilgrim: common('life'), gambit: common('risk', undefined, 1),
    riposte: own('blade'), 'shield-break': own('blade'), 'cleave-wave': own('blade', 1), duelist: own('blade'), 'blood-dance': own('blade'), valor: own('blade', 1),
    ricochet: own('bow'), 'split-arrow': own('bow'), pinning: own('bow'), 'distance-draw': own('bow'), 'hunter-mark': own('bow', 1), trapper: own('bow'),
    nova: own('staff'), inferno: { ...own('staff'), requires: [['cinder']] }, fracture: { ...own('staff'), requires: [['frost', 'nova', 'orbitals']] }, overload: { ...own('staff', 1), requires: [['cinder'], ['frost', 'nova', 'orbitals']] }, orbitals: own('staff'), convergence: own('staff'),
    backstab: own('daggers'), shadowstep: own('daggers'), hemorrhage: own('daggers'), 'execution-chain': own('daggers', 1), smoke: own('daggers'), venom: own('daggers'),
    'pack-bond': own('grimoire'), martyr: own('grimoire'), covenant: own('grimoire'), frenzy: own('grimoire'), 'soul-harvest': own('grimoire', 1), command: own('grimoire'),
    shrapnel: own('cannon'), minefield: own('cannon'), overclock: own('cannon'), bunker: own('cannon'), salvage: own('cannon'), railgun: own('cannon', 1),
};
export const relicRank = (loadout: Pick<Loadout, 'relics'>, id: Relic) => loadout.relics.find(r => r.id === id)?.rank ?? 0;
export function compatibleRelics(weapon: Weapon) { return RELICS.filter(id => !RELIC_SPECS[id].weapons || RELIC_SPECS[id].weapons!.includes(weapon)); }
export function relicReady(loadout: Loadout, id: Relic, replace: Relic | null = null) {
    const spec = RELIC_SPECS[id];
    return (!spec.weapons || spec.weapons.includes(loadout.weapon))
        && (!spec.requires || spec.requires.every(group => group.some(required => required !== replace && relicRank(loadout, required) > 0)));
}
export function breaksRelicTrigger(loadout: Loadout, id: Relic, replace: Relic | null) {
    return replace !== null && relicReady(loadout, id) && !relicReady(loadout, id, replace);
}
export function eligibleRelics(loadout: Loadout, pool: readonly Relic[], chapter: number): RelicStack[] {
    return pool.flatMap(id => {
        const spec = RELIC_SPECS[id], rank = relicRank(loadout, id);
        if (spec.chapter > chapter || !relicReady(loadout, id)) { return []; }
        return rank < Math.min(RULES.maxRelicRank, chapter + 1) ? [{ id, rank: rank + 1 }] : [];
    });
}
export function relicPrice(offer: RelicStack) { return RULES.shopCost + (offer.rank - 1) * 35; }
