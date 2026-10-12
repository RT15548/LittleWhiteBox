import type { Battle, BossKind, EncounterKind, InputFrame, InputSpan, Loadout } from './types.js';
import { companionsTick, playerTick } from './combat/actions.js';
import { encounterTick, encounterWon, initializeObjective, spawnWave } from './combat/encounters.js';
import { enemiesTick } from './combat/enemies.js';
import { projectilesTick } from './combat/projectiles.js';
import { defeatReason } from './combat/outcome.js';
import { type CombatField, supportsFieldEnemy } from './combat/field.js';
import { canStandInWorld } from './world/geometry.js';
import { findWorldPath } from './world/navigation.js';
import { worldFault } from './world/types.js';
import { ENEMIES, RULES } from './content.js';
export { distance, moveBody } from './combat/geometry.js';

export interface BattleSetup { seed: number; zone: number; chapter: number; elite: boolean; boss: boolean; bossKind: BossKind; encounter: EncounterKind; hp: number }
export function createBattle(setup: BattleSetup, loadout: Loadout, field?: CombatField): Battle {
    const { seed, zone, chapter, elite, boss, bossKind, encounter, hp } = setup;
    const b: Battle = { tick: 0, seed, serial: 0,
        player: { x: 0, y: 5, hp, facing: -Math.PI / 2, attack: 0, dash: 0, skill: 0, invulnerable: 30,
            dashTime: 0, dashAngle: 0, swing: 0, shield: 0, combo: 0, guard: 0, resource: 0, resonance: 0, ward: 0, lastHit: 0, travel: 0, rescues: 0 },
        enemies: [], shots: [], hazards: [], effects: [], companions: [],
        obstacles: boss ? (bossKind === 'warden' || bossKind === 'colossus' ? [{ x: -5, y: 0, radius: .85 }, { x: 5, y: 0, radius: .85 }] : [])
            : [{ x: -5, y: -4, radius: .9 }, { x: 5, y: 3, radius: .9 }],
        wave: 0, waves: boss ? 1 : elite ? 3 : 2, nextWave: 0, kills: 0, damageTaken: 0, status: 'fighting', zone, chapter, elite, boss,
        bossKind, encounter, objective: { x: 0, y: 0, hp: 100, progress: 0, target: 0 } };
    if (field) {
        if (boss && !supportsFieldEnemy(bossKind) || field.waves.some(wave => wave.some(enemy => !supportsFieldEnemy(enemy.kind)))) { worldFault('encounter_unsupported'); }
        if (encounter !== 'skirmish' || !field.waves.length
            || !canStandInWorld(field.space, field.entry, RULES.playerRadius)
            || field.waves.some(wave => !wave.length || wave.some(enemy => !canStandInWorld(field.space, enemy.position, ENEMIES[enemy.kind].radius)
                || !findWorldPath(field.space, field.entry, enemy.position, RULES.playerRadius)))) { worldFault('map_invalid'); }
        Object.assign(b.player, field.entry); Object.assign(b.objective, field.objective);
        b.obstacles = []; b.waves = field.waves.length;
    }
    initializeObjective(b); spawnWave(b, loadout, field); return b;
}
/** Mutates only this battle. Fixed input replay has no clock, DOM, storage or network. */
export function tickBattle(b: Battle, input: InputFrame, loadout: Loadout, field?: CombatField): void {
    if (b.status !== 'fighting') { return; }
    b.tick++; b.effects = b.effects.filter(e => --e.life > 0).slice(-80);
    const velocity = playerTick(b, input, loadout, field);
    companionsTick(b, loadout, field); enemiesTick(b, loadout, velocity, field); projectilesTick(b, loadout, field);
    b.enemies = b.enemies.filter(e => e.hp > 0);
    if (defeatReason(b)) { b.status = 'lost'; }
    else { encounterTick(b, loadout, field); if (encounterWon(b)) { b.status = 'won'; b.shots = []; b.hazards = []; } }
}
export function replayInputs(battle: Battle, spans: readonly InputSpan[], loadout: Loadout, field?: CombatField): Battle {
    const next = structuredClone(battle);
    for (const span of spans) { for (let i = 0; i < span.ticks; i++) { tickBattle(next, span, loadout, field); } }
    return next;
}
export function appendInput(spans: InputSpan[], frame: InputFrame) {
    const last = spans.at(-1);
    if (last && last.move === frame.move && last.dash === frame.dash && last.skill === frame.skill) { last.ticks++; }
    else { spans.push({ ...frame, ticks: 1 }); }
}
