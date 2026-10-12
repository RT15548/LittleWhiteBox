import { CONTRACT, ENEMIES, isBoss, RELIC_RULES as R, RULES, WEAPONS } from '../content.js';
import { relicRank as rank } from '../relics.js';
import type { Battle, DamageSource, Enemy, Loadout, Point } from '../types.js';
import { effect, hazard, shot, sourceIsDirect } from './events.js';
import { angleTo, distance, moveBody, TAU } from './geometry.js';
import { type CombatField, fieldVisible } from './field.js';

export function heal(b: Battle, amount: number) {
    if (b.player.hp <= 0) { return; }
    const restored = Math.min(RULES.maxHp - b.player.hp, amount); b.player.hp += restored;
    if (restored > 0) { effect(b, b.player, 'heal'); }
}
export function stagger(b: Battle, e: Enemy, ticks: number) {
    if (isBoss(e.kind)) { e.stagger += ticks; if (e.stagger < 100) { return; } e.stagger = 0; ticks = 24; }
    e.stun = Math.max(e.stun, ticks); e.windup = 0; e.motion = 0; e.cooldown = Math.max(20, e.cooldown);
    effect(b, e, 'guard', 1.4);
}
export function hurtEnemy(b: Battle, e: Enemy, amount: number, loadout: Loadout, source: DamageSource, origin: Point = b.player, field?: CombatField) {
    if (e.hp <= 0 || !fieldVisible(field, origin, e)) { return; }
    // Resolve every reaction against the same impact, then consume statuses once.
    const burning = e.burn > 0 || sourceIsDirect(source) && rank(loadout, 'cinder') > 0;
    const chilled = e.chill > 0 || sourceIsDirect(source) && rank(loadout, 'frost') > 0;
    const shatter = (source === 'skill' || source === 'companion' && loadout.weapon === 'cannon') && chilled && rank(loadout, 'shatter') > 0;
    const overload = sourceIsDirect(source) && burning && chilled && rank(loadout, 'overload') > 0;
    let damage = amount * (rank(loadout, 'blood-price') ? R.bloodDamage + (rank(loadout, 'blood-price') - 1) * .12 : 1);
    if (rank(loadout, 'execution') && e.hp / e.maxHp < R.executeThreshold) { damage *= R.executeDamage + (rank(loadout, 'execution') - 1) * .1; }
    if (e.exposed > 0) { damage *= 1.25; }
    if ((e.kind === 'guard' || field && e.kind === 'warden') && source === 'attack' && Math.cos(angleTo(e, origin) - e.angle) > .4 && e.exposed <= 0) { damage *= rank(loadout, 'shield-break') ? .8 : .35; }
    if (e.kind !== 'priest' && !isBoss(e.kind) && b.enemies.some(other => other.kind === 'priest' && other.hp > 0 && distance(e, other) < 3.5 && fieldVisible(field, e, other))) { damage *= .7; }
    if (source === 'attack' && rank(loadout, 'backstab') && Math.cos(angleTo(e, b.player) - e.angle) < -.3) { damage *= 1.6 + rank(loadout, 'backstab') * .2; e.exposed = Math.max(e.exposed, 55); }
    if (source === 'attack' && rank(loadout, 'duelist')) { stagger(b, e, 9 * rank(loadout, 'duelist')); }
    // Deployment deals its skill damage through the turret; retain companion kill credit.
    if (shatter) {
        damage += 15 * rank(loadout, 'shatter'); e.chill = 0; effect(b, e, 'burst', 2.2);
        for (const other of b.enemies) { if (other.id !== e.id && distance(e, other) < 2.2) { hurtEnemy(b, other, 9 * rank(loadout, 'shatter'), loadout, 'passive', e, field); } }
    }
    if (sourceIsDirect(source)) {
        if (rank(loadout, 'cinder')) { e.burn = Math.max(e.burn, 80 + rank(loadout, 'cinder') * 25); }
        if (rank(loadout, 'frost')) { e.chill = Math.max(e.chill, 45 + rank(loadout, 'frost') * 20); }
        if (rank(loadout, 'blood-dance') || rank(loadout, 'hemorrhage')) { e.bleed = 100 + 25 * (rank(loadout, 'blood-dance') + rank(loadout, 'hemorrhage')); }
        if (rank(loadout, 'venom')) { e.poison = 100 + rank(loadout, 'venom') * 35; }
        if (overload) { damage += 20 * rank(loadout, 'overload'); effect(b, e, 'lightning'); }
        if (source === 'skill' && rank(loadout, 'hunter-mark')) { e.exposed = Math.max(e.exposed, 100 + rank(loadout, 'hunter-mark') * 40); }
        if (rank(loadout, 'inferno') && burning && source === 'skill') { hazard(b, e, 'fire', 1.5 + rank(loadout, 'inferno') * .3, 0, 70, 4 * rank(loadout, 'inferno'), true); }
    }
    if (overload) { e.burn = 0; }
    if (overload || shatter) { e.chill = 0; }
    e.hp = Math.max(0, e.hp - damage); e.marked = 5;
    if (source === 'lightning' && rank(loadout, 'momentum') && b.tick % 6 === 0) { b.player.dash = Math.max(0, b.player.dash - rank(loadout, 'momentum') * 2); }
    if (e.hp > 0) { return; }
    b.kills++; effect(b, e, 'burst', isBoss(e.kind) ? 3 : .8);
    if (rank(loadout, 'wildfire') && burning) { hazard(b, e, 'fire', 1.8 + rank(loadout, 'wildfire') * .2, 0, 90, 3 * rank(loadout, 'wildfire'), true); }
    if (rank(loadout, 'fracture') && chilled) {
        for (let i = 0; i < 4 + rank(loadout, 'fracture'); i++) { shot(b, e, i * TAU / (4 + rank(loadout, 'fracture')), 9, true, { source: 'passive' }); }
    }
    if (rank(loadout, 'siphon') && (b.kills % R.siphonEvery === 0 || isBoss(e.kind))) { heal(b, (isBoss(e.kind) ? R.siphonBossHeal : R.siphonHeal) + rank(loadout, 'siphon') - 1); }
    if (rank(loadout, 'execution-chain')) { b.player.dash = Math.max(0, b.player.dash - 12 * rank(loadout, 'execution-chain')); b.player.skill = Math.max(0, b.player.skill - 8); }
    if (rank(loadout, 'soul-harvest')) { b.player.resource = Math.min(CONTRACT.maxPower, b.player.resource + 9 * rank(loadout, 'soul-harvest')); }
    if (source === 'companion' && rank(loadout, 'salvage')) { b.player.skill = Math.max(0, b.player.skill - 12 * rank(loadout, 'salvage')); }
    if (rank(loadout, 'magnet')) { for (const other of b.enemies) { if (other.hp > 0 && distance(e, other) < 3 + rank(loadout, 'magnet') && fieldVisible(field, e, other)) { moveBody(b, other, angleTo(other, e), .7, ENEMIES[other.kind].radius, field); } } }
}
export function lightning(b: Battle, target: Enemy, loadout: Loadout, damage: number, field?: CombatField, origin: Point = b.player) {
    const targets = [target];
    if (!fieldVisible(field, origin, target)) { return; }
    if (rank(loadout, 'conductor')) { targets.push(...b.enemies.filter(e => e.id !== target.id && e.hp > 0 && distance(e, target) < 4.5 && fieldVisible(field, target, e)).sort((a, c) => distance(a, target) - distance(c, target)).slice(0, rank(loadout, 'conductor') + 1)); }
    for (const e of targets) { effect(b, e, 'lightning'); hurtEnemy(b, e, damage, loadout, 'lightning', field ? e === target ? origin : target : b.player, field); }
}
export function block(b: Battle, loadout: Loadout, field?: CombatField) {
    const p = b.player, perfect = p.guard > 0;
    p.resource = Math.min(100, p.resource + (perfect ? 25 : 8));
    effect(b, p, perfect ? 'parry' : 'block', perfect ? 2 : 1, p.facing);
    if (perfect) { p.skill = Math.max(35, p.skill - 15); }
    const riposte = rank(loadout, 'riposte'), thorns = rank(loadout, 'thorns');
    if (riposte || thorns) { for (const e of b.enemies) { if (distance(e, p) < 3.2 + riposte * .3 && fieldVisible(field, p, e)) { hurtEnemy(b, e, (perfect ? 20 : 8) * riposte + 9 * thorns, loadout, 'passive', p, field); stagger(b, e, perfect ? 20 : 7); } } }
}
export function hurtPlayer(b: Battle, damage: number, loadout: Loadout, field?: CombatField) {
    const p = b.player;
    if (p.invulnerable > 0 || p.hp <= 0) { return; }
    if (p.shield > 0) { block(b, loadout, field); p.invulnerable = p.guard > 0 ? 8 : 4; return; }
    let amount = damage * WEAPONS[loadout.weapon].guard * (rank(loadout, 'blood-price') ? R.bloodHurt : 1) * (rank(loadout, 'gambit') ? 1.2 : 1);
    const absorbed = Math.min(p.ward, amount); p.ward -= absorbed; amount -= absorbed;
    if (p.hp <= amount && rank(loadout, 'last-stand') && !p.rescues) { p.rescues++; p.hp = 15 + rank(loadout, 'last-stand') * 8; p.invulnerable = 60; effect(b, p, absorbed > 0 ? 'ward-break' : 'guard', 3); return; }
    p.hp = Math.max(0, p.hp - amount); b.damageTaken += amount; p.invulnerable = 18; p.lastHit = b.tick;
    effect(b, p, absorbed > 0 ? p.ward > 0 ? 'ward-hit' : 'ward-break' : 'hit');
    if (rank(loadout, 'thorns')) { for (const e of b.enemies) { if (distance(e, p) < 3) { hurtEnemy(b, e, 10 * rank(loadout, 'thorns'), loadout, 'passive', p, field); } } }
}
