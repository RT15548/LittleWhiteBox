import { COMBAT_POLICY } from './combat-policy.js';
import { boundedFieldSpace, type CombatField, type FieldBounds } from '../combat/field.js';
import type { BattleSetup } from '../combat.js';
import type { BossKind, EnemyKind, Point } from '../types.js';
import { sceneSpace } from '../world/exploration.js';
import { COURTYARD } from './courtyard.js';
import type { CourtyardFact, CourtyardScene } from './world-types.js';
import type { RewardNode } from './campaign-rewards.js';

export const ENCOUNTER_SEGMENTS = ['crossroads', 'gate', 'beacon', 'waterway_approach', 'waterway', 'hall', 'roots'] as const;
export type EncounterSegment = typeof ENCOUNTER_SEGMENTS[number];
interface EncounterDefinition {
    scene: CourtyardScene; complete: CourtyardFact | null; reward: RewardNode;
    trigger: string; triggerRadius: number; prerequisite?: EncounterSegment;
    boss: BossKind | null; bounds: FieldBounds;
    waves: readonly (readonly { kind: EnemyKind; anchor: string }[])[];
    summons: readonly string[];
}
const enemy = (kind: EnemyKind, anchor: string) => ({ kind, anchor });
export const COURTYARD_ENCOUNTERS: Record<EncounterSegment, EncounterDefinition> = {
    crossroads: { scene: 'crossroads', complete: 'crossroads_cleared', reward: 'crossroads', trigger: 'encounter', triggerRadius: 22,
        boss: null, bounds: { left: -26, right: 26, top: -23, bottom: 35 }, summons: [],
        waves: [[enemy('soldier', 'front_left'), enemy('soldier', 'front_right'), enemy('archer', 'front_archer')],
            [enemy('guard', 'patrol'), enemy('soldier', 'lookout'), enemy('bomber', 'flank')]] },
    gate: { scene: 'gate', complete: 'patrol_cleared', reward: 'approach', trigger: 'encounter', triggerRadius: 14,
        boss: null, bounds: { left: -18, right: 18, top: -21, bottom: 25 }, summons: ['reinforcement'],
        waves: [[enemy('guard', 'guard'), enemy('soldier', 'flank'), enemy('archer', 'archer'), enemy('archer', 'archer_left')]] },
    beacon: { scene: 'beacon', complete: 'alarm_silenced', reward: 'passage', trigger: 'encounter', triggerRadius: 14,
        boss: null, bounds: { left: -18, right: 18, top: -25, bottom: 33 }, summons: ['reinforcementLeft', 'reinforcementRight'],
        waves: [[enemy('guard', 'guard'), enemy('archer', 'archer'), enemy('bomber', 'bomber')]] },
    waterway_approach: { scene: 'waterway', complete: null, reward: 'approach', trigger: 'approach', triggerRadius: 8,
        boss: null, bounds: { left: -18, right: 14, top: -35, bottom: -7 }, summons: [],
        waves: [[enemy('soldier', 'front_left'), enemy('soldier', 'front_right'), enemy('archer', 'front_archer')],
            [enemy('guard', 'front_guard'), enemy('bomber', 'front_bomber'), enemy('soldier', 'front_flank')]] },
    waterway: { scene: 'waterway', complete: 'waterway_cleared', reward: 'passage', prerequisite: 'waterway_approach', trigger: 'encounter', triggerRadius: 10,
        boss: 'keeper', bounds: { left: -11, right: 11, top: -6, bottom: 13 }, summons: ['reinforcementLeft', 'reinforcementRight'],
        waves: [[enemy('keeper', 'guard')]] },
    hall: { scene: 'hall', complete: 'warden_defeated', reward: 'warden', trigger: 'encounter', triggerRadius: 10,
        boss: 'warden', bounds: { left: -25, right: 25, top: -32, bottom: 17 }, summons: ['reinforcementLeft', 'reinforcementRight'],
        waves: [[enemy('warden', 'warden')]] },
    roots: { scene: 'roots', complete: 'roots_cleared', reward: 'roots', trigger: 'encounter', triggerRadius: 12,
        boss: 'thornheart', bounds: { left: -20, right: 20, top: -22, bottom: 26 }, summons: ['rootLeft', 'rootRight'],
        waves: [[enemy('thornheart', 'tree')]] },
};
export const sceneEncounters = (scene: CourtyardScene) => ENCOUNTER_SEGMENTS.filter(id => COURTYARD_ENCOUNTERS[id].scene === scene);
export const segmentComplete = (id: EncounterSegment, facts: ReadonlySet<CourtyardFact>, completed: readonly EncounterSegment[]) => {
    const spec = COURTYARD_ENCOUNTERS[id];
    return spec.complete ? facts.has(spec.complete) : completed.includes(id) || sceneEncounters(spec.scene).some(other => {
        const final = COURTYARD_ENCOUNTERS[other]; return final.prerequisite === id && final.complete && facts.has(final.complete);
    });
};
export function nextEncounter(scene: CourtyardScene, facts: ReadonlySet<CourtyardFact>, completed: readonly EncounterSegment[]) {
    return sceneEncounters(scene).find(id => !segmentComplete(id, facts, completed)
        && (!COURTYARD_ENCOUNTERS[id].prerequisite || segmentComplete(COURTYARD_ENCOUNTERS[id].prerequisite!, facts, completed)));
}
export function courtyardBattle(id: EncounterSegment, facts: ReadonlySet<CourtyardFact>, entry: Point, seed: number, hp: number,
    reinforcement: boolean): { setup: BattleSetup; field: CombatField } | null {
    const spec = COURTYARD_ENCOUNTERS[id];
    if (spec.complete && facts.has(spec.complete)) { return null; }
    const scene = COURTYARD[spec.scene];
    return {
        setup: { seed, zone: 0, chapter: 0, elite: false, boss: spec.boss !== null, bossKind: spec.boss ?? 'warden', encounter: 'skirmish', hp },
        field: { space: boundedFieldSpace(sceneSpace(scene, facts), spec.bounds), entry, objective: scene.anchors[spec.trigger],
            waves: spec.waves.map(wave => wave.map(e => ({ kind: e.kind, position: scene.anchors[e.anchor] }))),
            summonPoints: spec.summons.map(anchor => scene.anchors[anchor]),
            bounds: spec.bounds, segment: id, reinforcement, enemyLimit: spec.boss ? COMBAT_POLICY.bossEnemyLimit : COMBAT_POLICY.enemyLimit,
            ...(id === 'beacon' ? { signalPoint: scene.anchors.signal } : {}) },
    };
}
