import { BOSS_IDS, OATH_IDS, RELIC_IDS, WEAPON_IDS } from './ids.js';
import type { BossKind, EncounterKind, EnemyKind, MobKind, Weapon } from './types.js';

export const RULES = Object.freeze({ hz: 30, arena: 11, playerRadius: .34, speed: .115, maxHp: 100,
    dashTicks: 8, dashCooldown: 42, relicSlots: 6, relicPoolSize: 30, zoneSteps: 5, zones: 3,
    maxInputTicks: 900, checkpointTicks: 240, shopCost: 60, supplyCost: 35, supplyHeal: 25, maxRelicRank: 3, maxEnemies: 22,
    battleShards: 28, eliteShards: 52, bossShards: 80, restHeal: 35, sacrificeHp: 20,
    firstBossAward: 80, firstVictoryAward: 200, masteryAward: 120, oathAward: 100, recordLimit: 20 });
export interface WeaponSpec { damage: number; period: number; range: number; skill: number; skillCooldown: number; moveFire: number; unlock: number; guard: number }
export const CONTRACT = Object.freeze({ resonanceTicks: 90, maxPower: 100, familiarHp: 38,
    damage: 10, empoweredDamage: 17, attackTicks: 32, empoweredAttackTicks: 20 });
export const WEAPONS: Record<Weapon, WeaponSpec> = {
    blade: { damage: 24, period: 20, range: 2.45, skill: 48, skillCooldown: 105, moveFire: 1, unlock: 0, guard: .8 },
    bow: { damage: 15, period: 25, range: 8.2, skill: 24, skillCooldown: 165, moveFire: .65, unlock: 0, guard: 1 },
    staff: { damage: 21, period: 38, range: 6.8, skill: 30, skillCooldown: 180, moveFire: .5, unlock: 0, guard: 1 },
    daggers: { damage: 13, period: 11, range: 1.7, skill: 65, skillCooldown: 120, moveFire: 1, unlock: 1, guard: .85 },
    grimoire: { damage: 10, period: 36, range: 5.5, skill: 22, skillCooldown: 150, moveFire: .85, unlock: 2, guard: 1 },
    cannon: { damage: 35, period: 52, range: 7.5, skill: 18, skillCooldown: 210, moveFire: .42, unlock: 3, guard: .9 },
};
export const RELICS = RELIC_IDS;
export const OATHS = OATH_IDS;
export const WEAPON_LIST = WEAPON_IDS;
export const RELIC_RULES = Object.freeze({ bloodDamage: 1.3, bloodHurt: 1.25, hunterRange: 5, hunterDamage: 1.3,
    executeThreshold: .3, executeDamage: 1.35, echoEvery: 4, extraPierce: 1, orbitTicks: 75,
    siphonEvery: 6, siphonHeal: 3, siphonBossHeal: 6, focusSkill: .82, focusAttack: 1.12,
    renewalHeal: 6, renewalZoneHeal: 8 });
export interface EnemySpec { hp: number; speed: number; radius: number; damage: number; reach: number; windup: number; cooldown: number }
const mob = (hp: number, speed: number, radius: number, damage: number, reach: number, windup: number, cooldown: number): EnemySpec => ({ hp, speed, radius, damage, reach, windup, cooldown });
export const MOB_SPECS: Record<MobKind, EnemySpec> = {
    soldier: mob(48, .083, .4, 11, 1.45, 19, 35),
    archer: mob(36, .058, .36, 10, 11, 26, 55),
    guard: mob(95, .057, .58, 18, 2, 32, 65),
    priest: mob(58, .035, .42, 8, 12, 35, 110),
    charger: mob(65, .076, .48, 16, 12, 32, 80),
    stalker: mob(46, .12, .35, 10, 1.25, 16, 44),
    bomber: mob(55, .047, .42, 15, 13, 28, 82),
    wisp: mob(30, .062, .3, 8, 10, 22, 60),
};
export const BOSS_SPECS: Record<BossKind, EnemySpec & { region: number; awardKey: string }> = {
    warden: { ...mob(1050, .055, 1.25, 21, 20, 34, 32), region: 0, awardKey: 'boss-0' },
    thornheart: { ...mob(1000, .043, 1.3, 18, 20, 30, 35), region: 0, awardKey: 'boss-thornheart' },
    weaver: { ...mob(1450, .07, 1.1, 19, 20, 30, 31), region: 1, awardKey: 'boss-1' },
    astrologer: { ...mob(1400, .035, 1.1, 22, 20, 36, 32), region: 1, awardKey: 'boss-astrologer' },
    king: { ...mob(2050, .09, 1.4, 25, 20, 25, 23), region: 2, awardKey: 'boss-2' },
    phoenix: { ...mob(1750, .075, 1.2, 22, 20, 30, 28), region: 2, awardKey: 'boss-phoenix' },
    forgemaster: { ...mob(1100, .048, 1.25, 23, 20, 38, 35), region: 3, awardKey: 'boss-forgemaster' },
    colossus: { ...mob(1250, .036, 1.5, 25, 20, 42, 38), region: 3, awardKey: 'boss-colossus' },
    frostqueen: { ...mob(1450, .062, 1.05, 19, 20, 32, 28), region: 4, awardKey: 'boss-frostqueen' },
    leviathan: { ...mob(1550, .072, 1.4, 23, 20, 34, 32), region: 4, awardKey: 'boss-leviathan' },
    archivist: { ...mob(1900, .04, 1.15, 21, 20, 34, 25), region: 5, awardKey: 'boss-archivist' },
    voidknight: { ...mob(1850, .1, 1.05, 24, 20, 26, 25), region: 5, awardKey: 'boss-voidknight' },
};
export const ENEMIES: Record<EnemyKind, EnemySpec> = { ...MOB_SPECS, ...BOSS_SPECS };
export const BOSSES = BOSS_IDS;
export function isBoss(kind: EnemyKind): kind is BossKind { return Object.hasOwn(BOSS_SPECS, kind); }
export const REGION_TIERS: readonly (readonly number[])[] = [[0, 3], [1, 4], [2, 5]];
export const REGIONS: readonly { bosses: readonly BossKind[]; encounters: readonly EncounterKind[]; mobs: readonly MobKind[] }[] = [
    { bosses: ['warden', 'thornheart'], encounters: ['skirmish', 'pursuit', 'ritual'], mobs: ['soldier', 'archer', 'guard', 'stalker'] },
    { bosses: ['weaver', 'astrologer'], encounters: ['ritual', 'crossfire', 'survival'], mobs: ['archer', 'priest', 'wisp', 'stalker'] },
    { bosses: ['king', 'phoenix'], encounters: ['siege', 'pursuit', 'crossfire'], mobs: ['guard', 'charger', 'archer', 'priest'] },
    { bosses: ['forgemaster', 'colossus'], encounters: ['siege', 'survival', 'crossfire'], mobs: ['guard', 'bomber', 'soldier', 'charger'] },
    { bosses: ['frostqueen', 'leviathan'], encounters: ['pursuit', 'survival', 'skirmish'], mobs: ['charger', 'stalker', 'wisp', 'archer'] },
    { bosses: ['archivist', 'voidknight'], encounters: ['ritual', 'siege', 'crossfire'], mobs: ['priest', 'stalker', 'bomber', 'wisp'] },
];
