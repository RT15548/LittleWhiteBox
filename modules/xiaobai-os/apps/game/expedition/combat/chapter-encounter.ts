import type { Battle, Enemy, MobKind } from '../types.js';
import { COMBAT_POLICY as P } from '../content/combat-policy.js';
import { fieldPursuitAngle, type CombatField } from './field.js';
import { distance, moveBody } from './geometry.js';
import { effect, spawn } from './events.js';
import { worldFault } from '../world/types.js';

export function signalActorTick(b: Battle, e: Enemy, field?: CombatField) {
    if (field?.segment !== 'beacon' || e.kind !== 'archer' || !['approach', 'lighting'].includes(b.script.signal)) { return false; }
    if (e.hp < b.script.signalHp) {
        b.script.signal = 'stopped'; e.exposed = Math.max(e.exposed, P.recoveryTicks); e.cooldown = P.recoveryTicks; return false;
    }
    e.windup = 0;
    if (b.script.signal === 'approach') {
        const target = field.signalPoint!;
        if (distance(e, target) < 1) { b.script.signal = 'lighting'; }
        else {
            const angle = fieldPursuitAngle(field, e, target, .36);
            if (angle !== null) { e.angle = angle; moveBody(b, e, angle, .1, .36, field); }
        }
    }
    return true;
}
/** One finite reinforcement event per authored segment. No escalating timers or random extra waves. */
export function chapterEncounterTick(b: Battle, field: CombatField) {
    const script = b.script, boss = b.enemies.find(e => ['keeper', 'warden', 'thornheart'].includes(e.kind));
    let kinds: MobKind[] = [];
    if (field.segment === 'gate' && !b.enemies.some(e => e.kind === 'archer')) { kinds = ['charger']; }
    if (field.segment === 'waterway' && boss && boss.hp <= boss.maxHp * .5) { kinds = ['archer', 'soldier']; }
    if (field.segment === 'hall' && field.reinforcement && boss && boss.hp <= boss.maxHp * .65) { kinds = ['guard', 'archer']; }
    if (field.segment === 'roots' && boss && boss.hp <= boss.maxHp * .5) { kinds = ['stalker', 'stalker']; }
    if (field.segment === 'beacon') {
        const caller = b.enemies.find(e => e.kind === 'archer');
        if (!caller && script.signal !== 'lit') { script.signal = 'stopped'; }
        if (caller && script.signal === 'idle' && !b.enemies.some(e => e.kind === 'guard')) {
            script.signal = 'approach'; script.signalHp = caller.hp; caller.windup = 0; b.objective.target = P.signalTicks;
        }
        if (caller && script.signal === 'lighting') {
            if (caller.hp < script.signalHp) { script.signal = 'stopped'; caller.exposed = Math.max(caller.exposed, P.recoveryTicks); }
            else if (++b.objective.progress >= P.signalTicks) { script.signal = 'lit'; b.objective.hp = 0; }
        }
        if (script.signal === 'lit') { kinds = ['soldier', 'soldier']; }
    }
    if (!kinds.length || script.reinforcements === 'done') { return; }
    if (script.reinforcements === 'idle') {
        script.reinforcements = 'warning'; script.warning = P.reinforcementWarning;
        if (boss) { boss.windup = 0; boss.cooldown = Math.max(boss.cooldown, P.reinforcementWarning + P.recoveryTicks); }
    }
    if (b.tick % 6 === 0) { for (const p of field.summonPoints) { effect(b, p, 'guard', 1.2); } }
    if (--script.warning > 0) { return; }
    kinds.forEach((kind, index) => { if (!spawn(b, kind, field.summonPoints[index], field)) { worldFault('map_invalid'); } });
    script.reinforcements = 'done';
}
