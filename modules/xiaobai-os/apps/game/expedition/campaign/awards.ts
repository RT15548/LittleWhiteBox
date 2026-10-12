import { BOSSES, BOSS_SPECS, OATHS, RULES, WEAPONS } from '../content.js';
import type { CourtyardFact } from '../content/world-types.js';
import { SUPPLIES_HANDOFF } from '../content/supplies.js';

/** Account-wide receipts retain their existing amounts and identities across journeys. */
export const CHAPTER_AWARDS = [
    { fact: 'captives_released', key: 'cells-opened', amount: 200 },
    { fact: 'captives_arrived', key: 'rescue-returned', amount: 300 },
    { fact: SUPPLIES_HANDOFF.fact, key: 'supplies-received', amount: 300 },
    { fact: 'chapter_completed', key: 'chapter-one', amount: RULES.firstVictoryAward },
    { fact: 'warden_defeated', key: BOSS_SPECS.warden.awardKey, amount: RULES.firstBossAward },
    { fact: 'roots_cleared', key: BOSS_SPECS.thornheart.awardKey, amount: RULES.firstBossAward },
] as const satisfies readonly { fact: CourtyardFact; key: string; amount: number }[];
const amounts: Readonly<Record<string, number>> = Object.fromEntries([
    ...BOSSES.map(id => [BOSS_SPECS[id].awardKey, RULES.firstBossAward]),
    ['victory', RULES.firstVictoryAward],
    ...Object.keys(WEAPONS).map(id => [`mastery-${id}`, RULES.masteryAward]),
    ...OATHS.map(id => [`oath-${id}`, RULES.oathAward]),
    ...CHAPTER_AWARDS.map(a => [a.key, a.amount]),
]);
export const awardKeys = () => Object.keys(amounts);
export const awardAmount = (key: string) => amounts[key];
