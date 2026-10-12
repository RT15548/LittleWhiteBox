import { REGIONS } from '../content.js';
import { random } from '../random.js';
import type { Battle, Loadout, MobKind } from '../types.js';
import { beam, hazard, spawn } from './events.js';
import { distance, TAU } from './geometry.js';
import type { CombatField } from './field.js';

export const ENCOUNTER_RULES = Object.freeze({ ritualTicks: 330, survivalTicks: 1500, pursuitInterval: 390, reinforcementInterval: 270, warningAfter: 1800 });
const capturePoints = [{ x: -4, y: 0 }, { x: 4, y: -3 }, { x: 0, y: 4 }] as const;
export function spawnWave(b: Battle, loadout: Loadout, field?: CombatField) {
    b.wave++;
    if (field) {
        for (const enemy of field.waves[b.wave - 1]) { spawn(b, enemy.kind, enemy.position); }
        return;
    }
    if (b.boss) { spawn(b, b.bossKind, { x: 0, y: -5 }); return; }
    const pool = REGIONS[b.zone].mobs;
    const count = 4 + b.chapter + (b.elite ? 2 : 0) + (loadout.oaths.includes('legion') ? 2 : 0);
    for (let i = 0; i < count; i++) {
        const angle = TAU * i / count + (b.wave - 1) * .8;
        let kind: MobKind = pool[(i + b.wave - 1) % pool.length];
        if (b.wave === 1 && b.chapter === 0 && i < 2) { kind = pool[0]; }
        if (b.encounter === 'pursuit' && i === 0) { kind = 'stalker'; }
        if (b.encounter === 'siege' && i === 0) { kind = 'guard'; }
        spawn(b, kind, { x: Math.cos(angle) * 8.7, y: Math.sin(angle) * 8.7 });
    }
}
export function encounterTick(b: Battle, loadout: Loadout, field?: CombatField) {
    if (b.boss) { return; }
    const o = b.objective, live = b.enemies.some(e => e.hp > 0);
    if (b.encounter === 'ritual') {
        if (o.progress < o.target && distance(b.player, o) < 2.5 && !b.enemies.some(e => e.hp > 0 && distance(e, o) < 2.2)) { o.progress++; }
        const stage = Math.min(2, Math.floor(o.progress / ENCOUNTER_RULES.ritualTicks));
        o.x = capturePoints[stage].x; o.y = capturePoints[stage].y;
        if (b.tick % ENCOUNTER_RULES.reinforcementInterval === 0 && o.progress < o.target && b.enemies.length < 8) { spawn(b, b.chapter ? 'wisp' : 'stalker', { x: o.x > 0 ? -9 : 9, y: random(b) * 12 - 6 }); }
    } else if (b.encounter === 'survival') {
        o.progress = Math.min(o.target, o.progress + 1);
        if (b.tick % ENCOUNTER_RULES.reinforcementInterval === 0 && o.progress < o.target && b.enemies.length < 10) { spawnWave(b, loadout); }
        if (b.tick % 150 === 0) { hazard(b, { x: 0, y: 0 }, 'ring', 15, 35, 90, 12, false, { inner: Math.max(4.8, 9 - b.tick / 400) }); }
    } else if (b.encounter === 'pursuit') {
        o.progress = b.tick % ENCOUNTER_RULES.pursuitInterval;
        if (b.wave < b.waves && o.progress === 0) { spawnWave(b, loadout); }
    } else if (b.encounter === 'crossfire') {
        if (b.tick % 150 === 0) {
            const horizontal = b.tick % 300 === 0, lane = Math.round((horizontal ? b.player.y : b.player.x) / 3) * 3;
            beam(b, horizontal ? { x: -10, y: lane } : { x: lane, y: -10 }, horizontal ? 0 : Math.PI / 2, 20, .65, 36, 15);
        }
    }
    if (b.tick > ENCOUNTER_RULES.warningAfter && b.tick % 180 === 0) { hazard(b, b.player, 'fire', 2.2, 36, 90, 13); }
    if (!live && b.wave < b.waves && b.encounter !== 'survival') { if (++b.nextWave >= 40) { b.nextWave = 0; spawnWave(b, loadout, field); } }
    else if (live) { b.nextWave = 0; }
}
export function encounterWon(b: Battle) {
    if (b.enemies.some(e => e.hp > 0)) { return false; }
    // Timed reinforcements stop at the deadline, including waves delayed by crowding.
    if (!b.boss && b.encounter === 'survival') { return b.objective.progress >= b.objective.target; }
    if (!b.boss && b.encounter === 'ritual') { return b.objective.progress >= b.objective.target && b.wave >= b.waves; }
    return b.wave >= b.waves;
}
export function initializeObjective(b: Battle) {
    const o = b.objective;
    if (b.encounter === 'ritual') { Object.assign(o, capturePoints[0]); o.target = ENCOUNTER_RULES.ritualTicks * capturePoints.length; }
    if (b.encounter === 'survival') { o.target = ENCOUNTER_RULES.survivalTicks; }
    if (b.encounter === 'pursuit') { o.target = ENCOUNTER_RULES.pursuitInterval; }
}
