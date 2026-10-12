import { ENEMIES, RELIC_RULES as R, RULES } from '../content.js';
import { relicRank as rank } from '../relics.js';
import type { Battle, Hazard, Loadout, Point } from '../types.js';
import { block, hurtEnemy, hurtPlayer, lightning, stagger } from './damage.js';
import { effect } from './events.js';
import { angleTo, distance, lineDistance } from './geometry.js';
import { type CombatField, fieldVisible } from './field.js';

export function insideHazard(h: Hazard, point: Point, radius: number) {
    if (h.kind === 'beam') { return lineDistance(point, h, h.angle, h.length) < h.width + radius; }
    const d = distance(h, point);
    return d < h.radius + radius && (h.kind !== 'ring' || d > h.inner - radius);
}
function shotsTick(b: Battle, loadout: Loadout, field?: CombatField) {
    for (const s of b.shots) {
        if (s.life <= 0) { continue; }
        const before = { x: s.x, y: s.y };
        s.x += Math.cos(s.angle) * s.speed; s.y += Math.sin(s.angle) * s.speed; s.life--;
        const blocked = field ? !fieldVisible(field, before, s, s.radius)
            : Math.abs(s.x) > RULES.arena || Math.abs(s.y) > RULES.arena || b.obstacles.some(o => distance(o, s) < o.radius + s.radius);
        if (blocked) { s.life = 0; continue; }
        if (!s.friendly) {
            if (distance(s, b.player) < RULES.playerRadius + s.radius && fieldVisible(field, s, b.player)) {
                if (b.player.shield > 0) { block(b, loadout, field); s.friendly = true; s.source = 'skill'; s.angle += Math.PI; s.damage *= 1.8; s.hits = []; }
                else { hurtPlayer(b, s.damage, loadout, field); s.life = 0; }
            } else {
                const ally = b.companions.find(c => c.hp > 0 && distance(s, c) < .3 + s.radius && fieldVisible(field, s, c));
                if (ally) { ally.hp -= s.damage * (1 - rank(loadout, 'covenant') * .12); s.life = 0; }
            }
            continue;
        }
        for (const e of b.enemies) {
            if (e.hp <= 0 || s.hits.includes(e.id) || distance(e, s) > ENEMIES[e.kind].radius + s.radius || !fieldVisible(field, s, e)) { continue; }
            s.hits.push(e.id);
            const damage = s.damage * (rank(loadout, 'hunter') && distance(e, b.player) > R.hunterRange ? R.hunterDamage + (rank(loadout, 'hunter') - 1) * .15 : 1);
            hurtEnemy(b, e, damage, loadout, s.source, s, field);
            if (rank(loadout, 'pinning') && s.source === 'attack') { e.chill = 50 + rank(loadout, 'pinning') * 20; if (b.player.combo % 3 === 0) { stagger(b, e, 8 * rank(loadout, 'pinning')); } }
            if (s.splash > 0) {
                effect(b, e, 'burst', s.splash);
                for (const other of b.enemies) { if (other.id !== e.id && distance(other, e) < s.splash + ENEMIES[other.kind].radius) { hurtEnemy(b, other, damage * .55, loadout, s.source, e, field); } }
            }
            if (s.bounce > 0) {
                const next = b.enemies.filter(other => other.hp > 0 && !s.hits.includes(other.id) && distance(other, e) < 6 && fieldVisible(field, s, other, s.radius)).sort((a, c) => distance(e, a) - distance(e, c))[0];
                if (next) { s.bounce--; s.angle = angleTo(s, next); s.damage *= .8; break; }
            }
            if (s.pierce-- <= 0) { s.life = 0; break; }
        }
    }
    b.shots = b.shots.filter(s => s.life > 0);
}
function hazardsTick(b: Battle, loadout: Loadout, field?: CombatField) {
    for (const h of [...b.hazards]) {
        if (h.wait > 0) { h.wait--; continue; }
        h.life--;
        if (!h.friendly) {
            if (insideHazard(h, b.player, RULES.playerRadius) && fieldVisible(field, h, b.player)) { hurtPlayer(b, h.damage, loadout, field); }
            if (!b.boss && b.encounter === 'siege' && b.tick % 15 === 0 && insideHazard(h, b.objective, .6) && fieldVisible(field, h, b.objective)) { b.objective.hp = Math.max(0, b.objective.hp - h.damage * .35); }
            const impact = h.kind === 'slam' || h.kind === 'beam' || h.kind === 'ring';
            if (impact || b.tick % 15 === 0) {
                for (const ally of b.companions) {
                    if (ally.hp > 0 && (!impact || !h.hits.includes(ally.id)) && insideHazard(h, ally, .3) && fieldVisible(field, h, ally)) {
                        ally.hp -= h.damage * .25;
                        if (impact) { h.hits.push(ally.id); }
                    }
                }
            }
            continue;
        }
        if (h.kind !== 'slam' && h.kind !== 'mine' && b.tick % 15 !== 0) { continue; }
        const targets = b.enemies.filter(e => e.hp > 0 && insideHazard(h, e, ENEMIES[e.kind].radius) && fieldVisible(field, h, e));
        if (h.kind === 'mine' && targets.length) { h.life = 0; effect(b, h, 'burst', h.radius); }
        for (const e of targets) {
            if (h.kind === 'storm') { lightning(b, e, loadout, h.damage, field, h); }
            else {
                if (h.kind === 'fire') { e.burn = Math.max(e.burn, 45); }
                if (h.kind === 'frost') { e.chill = Math.max(e.chill, 60); }
                if (h.kind === 'mine') { stagger(b, e, 25); }
                hurtEnemy(b, e, h.damage, loadout, h.source, h, field);
            }
        }
    }
    b.hazards = b.hazards.filter(h => h.life > 0);
}
export function projectilesTick(b: Battle, loadout: Loadout, field?: CombatField) { shotsTick(b, loadout, field); hazardsTick(b, loadout, field); }
