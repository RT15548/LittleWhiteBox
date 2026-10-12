import type { CombatField } from '../combat/field.js';
import type { BattleSetup } from '../combat.js';
import type { EnemyKind, Point } from '../types.js';
import { sceneSpace } from '../world/exploration.js';
import { COURTYARD } from './courtyard.js';
import type { CourtyardFact, CourtyardScene } from './world-types.js';

interface EncounterDefinition {
    complete: CourtyardFact;
    triggerRadius?: number;
    boss: 'warden' | 'thornheart' | null;
    waves: readonly (readonly { kind: EnemyKind; anchor: string }[])[];
    summons: readonly string[];
}
export const COURTYARD_ENCOUNTERS: Partial<Record<CourtyardScene, EncounterDefinition>> = {
    crossroads: { complete: 'crossroads_cleared', triggerRadius: 26, boss: null, summons: [], waves: [[{ kind: 'soldier', anchor: 'patrol' }, { kind: 'soldier', anchor: 'lookout' }]] },
    gate: { complete: 'patrol_cleared', boss: null, summons: [], waves: [[{ kind: 'guard', anchor: 'guard' }, { kind: 'archer', anchor: 'archer' }]] },
    beacon: { complete: 'alarm_silenced', boss: null, summons: [], waves: [[{ kind: 'guard', anchor: 'guard' }, { kind: 'archer', anchor: 'archer' }], [{ kind: 'charger', anchor: 'guard' }]] },
    waterway: { complete: 'waterway_cleared', boss: null, summons: [], waves: [[{ kind: 'guard', anchor: 'guard' }]] },
    hall: { complete: 'warden_defeated', boss: 'warden', summons: ['reinforcementLeft', 'reinforcementRight'], waves: [[{ kind: 'warden', anchor: 'warden' }]] },
    roots: { complete: 'roots_cleared', boss: 'thornheart', summons: ['rootLeft', 'rootRight'], waves: [[{ kind: 'thornheart', anchor: 'tree' }]] },
};

/** This factory places authored encounters; it does not award story facts or accept client outcomes. */
export function courtyardBattle(sceneId: CourtyardScene, facts: ReadonlySet<CourtyardFact>, entry: Point, seed: number, hp: number,
    reinforcement: boolean): { setup: BattleSetup; field: CombatField } | null {
    const spec = COURTYARD_ENCOUNTERS[sceneId];
    if (!spec || facts.has(spec.complete)) { return null; }
    const scene = COURTYARD[sceneId];
    const waves = spec.waves.map(wave => wave.map(enemy => ({ kind: enemy.kind, position: scene.anchors[enemy.anchor] })));
    if (sceneId === 'hall' && reinforcement) {
        waves[0].push({ kind: 'guard', position: scene.anchors.reinforcementLeft }, { kind: 'archer', position: scene.anchors.reinforcementRight });
    }
    return {
        setup: { seed, zone: 0, chapter: 0, elite: false, boss: spec.boss !== null, bossKind: spec.boss ?? 'warden', encounter: 'skirmish', hp },
        field: { space: sceneSpace(scene, facts), entry, objective: scene.anchors.encounter, waves, summonPoints: spec.summons.map(id => scene.anchors[id]) },
    };
}
