import { BOSS_SPECS, CONTRACT, ENEMIES, REGIONS, RULES } from './content.js';
import { BOSS_IDS, EFFECT_IDS, ENCOUNTER_IDS } from './ids.js';
import { fault } from './random.js';
import type { Battle } from './types.js';
import { boolean, finite, integer, list, member, object, point, unique } from './validation.js';

export function validateBattle(raw: unknown): asserts raw is Battle {
    const b = object(raw); integer(b.tick); integer(b.seed, 0, 0xffffffff); const serial = integer(b.serial);
    const zone = integer(b.zone, 0, REGIONS.length - 1); integer(b.chapter, 0, RULES.zones - 1);
    integer(b.wave, 1); integer(b.waves, 1, 3); integer(b.nextWave, 0, 45); integer(b.kills); finite(b.damageTaken, 0, 1e8);
    boolean(b.elite); boolean(b.boss); member(b.status, ['fighting', 'won', 'lost']); member(b.encounter, ENCOUNTER_IDS);
    const boss = member(b.bossKind, BOSS_IDS); if (BOSS_SPECS[boss].region !== zone) { fault('invalid'); }
    const p = point(b.player); finite(p.hp, 0, RULES.maxHp); finite(p.facing, -100, 100); finite(p.dashAngle, -100, 100);
    for (const k of ['attack', 'dash', 'skill', 'invulnerable', 'dashTime', 'swing', 'shield', 'combo', 'guard', 'lastHit', 'rescues']) { integer(p[k]); }
    finite(p.ward, 0, 100); finite(p.resource, 0, 100); finite(p.resonance, 0, CONTRACT.resonanceTicks + CONTRACT.maxPower); finite(p.travel, 0, 1e8);
    const ids: number[] = [];
    const id = (v: unknown) => { const n = integer(v, 1, serial); ids.push(n); return n; };
    list(b.enemies, 50, raw => {
        const e = point(raw); id(e.id); member(e.kind, Object.keys(ENEMIES)); finite(e.hp, 0, 1e5); const hp = finite(e.maxHp, .01, 1e5);
        if (Number(e.hp) > hp) { fault('invalid'); }
        finite(e.angle, -100, 100); finite(e.motionAngle, -100, 100); integer(e.cooldown, 0, 1000); integer(e.windup, 0, 100); integer(e.pattern); integer(e.phase, 1, 3);
        for (const k of ['chill', 'burn', 'marked', 'stun', 'bleed', 'poison', 'exposed', 'motion', 'stagger']) { integer(e[k], 0, 1000); }
        point(e.target); list(e.memory, 4, point); return e;
    });
    list(b.shots, 1000, raw => {
        const s = point(raw); id(s.id); finite(s.angle, -1e8, 1e8); finite(s.speed, 0, 2); finite(s.damage, 0, 1e5); integer(s.life, 0, 200); integer(s.pierce, -1, 10);
        member(s.source, ['attack', 'skill', 'passive', 'lightning', 'companion']); boolean(s.friendly); unique(list(s.hits, 50, n => integer(n, 1, serial)));
        finite(s.radius, 0, 3); finite(s.splash, 0, 10); integer(s.bounce, 0, 3); return s;
    });
    list(b.hazards, 1000, raw => {
        const h = point(raw); id(h.id); finite(h.radius, 0, 20); integer(h.wait, 0, 300); integer(h.life, 0, 300); finite(h.damage, 0, 1e5);
        member(h.kind, ['storm', 'fire', 'slam', 'frost', 'poison', 'beam', 'ring', 'mine']); boolean(h.friendly);
        member(h.source, ['attack', 'skill', 'passive', 'lightning', 'companion']);
        unique(list(h.hits, 65, n => integer(n, 1, serial)));
        finite(h.angle, -1e8, 1e8); finite(h.length, 0, 40); finite(h.width, 0, 10); finite(h.inner, 0, Number(h.radius)); return h;
    });
    list(b.effects, 2000, raw => { const e = point(raw); id(e.id); member(e.kind, EFFECT_IDS); integer(e.life, 0, 20); finite(e.angle, -100, 100); finite(e.size, 0, 20); return e; });
    list(b.obstacles, 10, raw => { const p = point(raw); finite(p.radius, .1, 5); return p; });
    list(b.companions, 15, raw => {
        const c = point(raw); id(c.id); member(c.kind, ['familiar', 'turret', 'shade']); finite(c.hp, -1e5, 1000); integer(c.life, 0, 36000); integer(c.cooldown, 0, 500);
        finite(c.angle, -100, 100); finite(c.empowered, 0, c.kind === 'familiar' ? 0 : 500); return c;
    });
    unique(ids);
    const o = point(b.objective); finite(o.hp, 0, 100); integer(o.progress, 0); integer(o.target, 0);
    if (Number(o.progress) > Number(o.target)) { fault('invalid'); }
}
