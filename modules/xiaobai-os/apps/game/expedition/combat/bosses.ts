import { BOSS_SPECS } from '../content.js';
import type { Battle, BossKind, Enemy, Loadout } from '../types.js';
import { beam, effect, fan, hazard, ringShots, slam, spawn } from './events.js';
import { angleTo, atAngle, TAU } from './geometry.js';
import type { CombatField } from './field.js';

type Pattern = (b: Battle, e: Enemy, field?: CombatField) => void;
const charge = (e: Enemy, ticks: number) => { e.motion = ticks; e.motionAngle = angleTo(e, e.target); e.stun = 18; };
const patterns: Record<BossKind, Pattern> = {
    warden(b, e, field) {
        const n = e.pattern % 3, damage = BOSS_SPECS.warden.damage;
        if (n === 0) { charge(e, 24); beam(b, e, e.motionAngle, 13, 1.1, 18, damage); }
        else if (n === 1) { for (let i = -1; i <= 1; i++) { slam(b, atAngle(e, e.angle + i * .55, 3.5), 1.8, 12 + Math.abs(i) * 8, damage); } e.exposed = Math.max(e.exposed, 65); }
        else { fan(b, e, e.angle, 5 + e.phase * 2, 1.5, damage * .65); if (e.phase > 1) { spawn(b, 'guard', { x: -7, y: -7 }, field); } }
    },
    thornheart(b, e, field) {
        const n = e.pattern % 4;
        if (n === 0) { for (let i = 0; i < 5; i++) { const p = atAngle(e.target, i * TAU / 5, 3.6); hazard(b, p, 'poison', 1.4, 26, 110, 12); } }
        else if (n === 1) { hazard(b, e, 'ring', 7.5, 25, 14, 22, false, { inner: 3 }); e.exposed = Math.max(e.exposed, 80); }
        else if (n === 2) { for (const x of [-7, 7]) { spawn(b, 'stalker', { x, y: -6 }, field); } }
        else { for (let i = 0; i < 3 + e.phase; i++) { beam(b, e, e.angle + i * TAU / (3 + e.phase), 15, .55, 25, 18); } }
    },
    weaver(b, e) {
        const n = e.pattern % 4;
        if (n === 0) { e.x = e.target.x > 0 ? -7 : 7; e.y = -5; effect(b, e, 'burst', 2); beam(b, { x: -10, y: e.target.y }, 0, 20, .7, 30, 21); beam(b, { x: e.target.x, y: -10 }, Math.PI / 2, 20, .7, 42, 21); }
        else if (n === 1) { fan(b, e, angleTo(e, b.player), 7 + e.phase, 1.8, 13, .2); }
        else if (n === 2) { for (let i = 0; i < 4; i++) { const p = atAngle({ x: 0, y: 0 }, i * Math.PI / 2 + Math.PI / 4, 7); beam(b, p, angleTo(p, { x: 0, y: 0 }), 11, .6, 25 + i * 8, 18); } e.exposed = Math.max(e.exposed, 75); }
        else { spawn(b, 'wisp', { x: -7, y: 5 }); spawn(b, 'wisp', { x: 7, y: 5 }); }
    },
    astrologer(b, e) {
        const n = e.pattern % 3, offset = e.pattern * .53;
        if (n === 0) { for (let i = 0; i < 7; i++) { if (i === e.phase) { continue; } beam(b, e, offset + i * TAU / 7, 18, .6, 32, 23); } }
        else if (n === 1) { for (let i = 0; i < 6; i++) { const p = atAngle({ x: 0, y: 0 }, i * TAU / 6, 9); fan(b, p, angleTo(p, e.target), 2 + e.phase, .45, 12, .16); } }
        else { slam(b, e.target, 2, 18, 24); hazard(b, { x: 0, y: 0 }, 'ring', 10.5, 38, 12, 22, false, { inner: 5.5 }); e.exposed = Math.max(e.exposed, 90); }
    },
    king(b, e) {
        const n = e.pattern % 4;
        if (n === 0) { charge(e, 18); beam(b, e, e.motionAngle, 10, .9, 18, 24); }
        else if (n === 1) { for (let i = 0; i < 2 + e.phase; i++) { const a = e.angle + (i % 2 ? .65 : -.65); slam(b, atAngle(e, a, 3), 2, 7 + i * 10, 23); } }
        else if (n === 2) { beam(b, { x: -10, y: 0 }, 0, 20, .8, 22, 26); beam(b, { x: 0, y: -10 }, Math.PI / 2, 20, .8, 35, 26); e.exposed = Math.max(e.exposed, 65); }
        else { fan(b, e, e.angle, 3, .55, 18, .29); if (e.phase > 1) { spawn(b, 'stalker', { x: -8, y: 3 }); spawn(b, 'archer', { x: 8, y: -3 }); } }
    },
    phoenix(b, e) {
        const n = e.pattern % 4;
        if (n === 0) { charge(e, 28); for (let i = 0; i < 6; i++) { hazard(b, atAngle(e, e.motionAngle, i * 2), 'fire', 1.2, 20 + i * 4, 95, 13); } }
        else if (n === 1) { ringShots(b, e, 10 + e.phase * 2, e.pattern * .32, 13, .17); }
        else if (n === 2) { e.x = 0; e.y = 0; hazard(b, e, 'ring', 9, 30, 15, 25, false, { inner: 3.5 }); e.exposed = Math.max(e.exposed, 85); }
        else { for (const p of [{ x: -6, y: -5 }, { x: 6, y: 5 }]) { spawn(b, 'bomber', p); } }
    },
    forgemaster(b, e) {
        const n = e.pattern % 4;
        if (n === 0) { for (const x of [-7, 0, 7]) { beam(b, { x, y: -10 }, Math.PI / 2, 20, 1.1, 26, 24); } }
        else if (n === 1) { for (let i = -1; i <= 1; i++) { hazard(b, { x: e.target.x + i * 2.5, y: e.target.y }, 'fire', 1.6, 28 + Math.abs(i) * 7, 100, 14); } }
        else if (n === 2) { slam(b, e, 4, 18, 26); e.exposed = Math.max(e.exposed, 100); }
        else { spawn(b, 'bomber', { x: -8, y: 5 }); if (e.phase > 1) { spawn(b, 'guard', { x: 8, y: 5 }); } }
    },
    colossus(b, e) {
        const n = e.pattern % 3;
        if (n === 0) { for (let i = 0; i < 3; i++) { hazard(b, e, 'ring', 3 + i * 3, 20 + i * 19, 9, 23, false, { inner: 1.4 + i * 3 }); } }
        else if (n === 1) { charge(e, 30); beam(b, e, e.motionAngle, 18, 1.4, 18, 27); }
        else { for (const side of [-1, 1]) { slam(b, { x: e.target.x + side * 2, y: e.target.y }, 2.7, 30, 25); } e.exposed = Math.max(e.exposed, 110); }
    },
    frostqueen(b, e) {
        const n = e.pattern % 4;
        if (n === 0) { for (let i = 0; i < 4; i++) { hazard(b, atAngle(e.target, i * Math.PI / 2, 3), 'frost', 1.8, 24, 100, 10); } }
        else if (n === 1) { fan(b, e, e.angle, 9, 2.2, 14, .21); }
        else if (n === 2) { e.x = -e.x; e.y = -e.y; beam(b, e, angleTo(e, e.target), 20, 1.2, 32, 24); e.exposed = Math.max(e.exposed, 85); }
        else { hazard(b, { x: 0, y: 0 }, 'ring', 10.5, 32, 18, 22, false, { inner: 5 }); spawn(b, 'stalker', { x: 0, y: -8 }); }
    },
    leviathan(b, e) {
        const n = e.pattern % 4;
        if (n === 0) { e.x = -9; e.y = e.target.y; e.target = { x: 9, y: e.y }; charge(e, 40); beam(b, e, 0, 19, 1.4, 14, 25); }
        else if (n === 1) { for (let i = 0; i < 4; i++) { beam(b, { x: -10, y: -8 + i * 5 }, 0, 20, .7, 20 + i * 13, 20); } }
        else if (n === 2) { slam(b, e.target, 3.8, 28, 26); e.exposed = Math.max(e.exposed, 95); }
        else { hazard(b, { x: 0, y: 0 }, 'ring', 10, 26, 14, 23, false, { inner: e.phase > 1 ? 4 : 6 }); fan(b, e, e.angle, 5, 1.3, 14); }
    },
    archivist(b, e) {
        const n = e.pattern % 4;
        if (n === 0) { e.memory.push({ ...e.target }); e.memory = e.memory.slice(-4); slam(b, e.target, 2.3, 24, 21); }
        else if (n === 1) { for (let i = 0; i < e.memory.length; i++) { slam(b, e.memory[i], 2.6, 22 + i * 8, 24); } }
        else if (n === 2) { for (const p of e.memory) { beam(b, p, angleTo(p, e.target), 18, .65, 32, 22); } spawn(b, 'wisp', { x: -7, y: -7 }); spawn(b, 'wisp', { x: 7, y: 7 }); }
        else { ringShots(b, e, 12, e.pattern * .2, 14); e.exposed = Math.max(e.exposed, 100); }
    },
    voidknight(b, e) {
        const n = e.pattern % 4;
        if (n === 0) { e.x = Math.max(-8, Math.min(8, -e.target.x)); e.y = Math.max(-8, Math.min(8, -e.target.y)); effect(b, e, 'burst', 2); beam(b, e, angleTo(e, e.target), 20, .8, 24, 26); }
        else if (n === 1) { charge(e, 20); fan(b, e, e.angle, 3 + e.phase, .9, 15, .26); }
        else if (n === 2) { slam(b, e, 3, 12, 26); hazard(b, e, 'ring', 7, 30, 10, 22, false, { inner: 3.5 }); e.exposed = Math.max(e.exposed, 65); }
        else { for (const p of [{ x: e.target.x, y: -9 }, { x: -9, y: e.target.y }]) { beam(b, p, angleTo(p, e.target), 20, .6, 22, 23); } }
    },
};
export function bossAttack(b: Battle, e: Enemy, loadout: Loadout, field?: CombatField) {
    const kind = e.kind as BossKind;
    // Enter phases in order so burst damage cannot skip phase-entry effects.
    while (e.phase < (e.hp / e.maxHp < .3 ? 3 : e.hp / e.maxHp < .65 ? 2 : 1)) {
        const nextPhase = e.phase + 1;
        e.phase = nextPhase; effect(b, e, 'burst', 4);
        if (kind === 'phoenix' && nextPhase === 2) { e.hp = Math.min(e.maxHp, e.hp + e.maxHp * .12); hazard(b, e, 'fire', 3, 25, 100, 14); }
        if (kind === 'archivist') { e.memory.push({ x: b.player.x, y: b.player.y }); e.memory = e.memory.slice(-4); }
        if (loadout.oaths.includes('legion')) { spawn(b, 'stalker', { x: e.x > 0 ? -8 : 8, y: 6 }, field); }
    }
    patterns[kind](b, e, field); e.pattern++;
}
