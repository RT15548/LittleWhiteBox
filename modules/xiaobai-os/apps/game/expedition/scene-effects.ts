import type { Group, Mesh } from 'three';
import { ENEMIES, isBoss } from './content.js';
import type { Battle } from './types.js';
import type { SceneKit } from './scene-kit.js';
import { CONTRACT_COLORS as C, DEFENSE_COLORS } from './visuals.js';

const FX = { danger: '#c34740', warning: '#ec8754', magic: '#8bd9f2', frost: '#addffc', gold: '#fff0bb', heal: '#75dbb0', fire: '#f0ad55' };
/** Reusable effect meshes: no geometry allocation in the combat frame loop. */
export function createBattleEffects(k: SceneKit, root: Group) {
    const pools = new Map<string, { list: Mesh[]; used: number }>();
    function draw(kind: keyof SceneKit['geometries'], color: string, opacity = 1, lit = false) {
        const alpha = Math.max(.1, Math.min(1, Math.round(opacity * 10) / 10)), key = `${kind}/${color}/${alpha}/${lit}`;
        let pool = pools.get(key); if (!pool) { pool = { list: [], used: 0 }; pools.set(key, pool); }
        let mesh = pool.list[pool.used++];
        if (!mesh) { mesh = k.mesh(root, kind, color, [1, 1, 1], [0, 0, 0], !lit, alpha); pool.list.push(mesh); }
        mesh.visible = true; mesh.rotation.set(0, 0, 0); mesh.scale.set(1, 1, 1); return mesh;
    }
    function ground(kind: 'ring' | 'disc' | 'arc' | 'stroke', color: string, radius: number, x: number, z: number, opacity = 1, y = .09) {
        const mesh = draw(kind, color, opacity); mesh.position.set(x, y, z); mesh.scale.set(radius, radius, 1); mesh.rotation.x = -Math.PI / 2; return mesh;
    }
    return { update(b: Battle | null, reduced: boolean) {
        for (const pool of pools.values()) { pool.used = 0; pool.list.forEach(m => m.visible = false); }
        if (!b) { return; }
        const p = b.player;
        ground('ring', '#f2f6e2', .64, p.x, p.y, .8);
        if (p.dashTime && !reduced) {
            for (let i = 1; i <= 3; i++) {
                const streak = draw('cone', FX.gold, .7 - i * .15);
                streak.position.set(p.x - Math.cos(p.dashAngle) * i * .43, .45, p.y - Math.sin(p.dashAngle) * i * .43);
                streak.scale.set(.13, p.dashTime / 8 * 1.7, .13); streak.rotation.set(0, -p.dashAngle, -Math.PI / 2);
            }
        }
        if (!b.boss && (b.encounter === 'siege' || b.encounter === 'ritual')) {
            const o = b.objective;
            if (b.encounter === 'ritual') {
                ground('disc', FX.magic, 2.5, o.x, o.y, .12); ground('ring', FX.magic, 2.5, o.x, o.y);
                ground('ring', FX.gold, 2.2, o.x, o.y, .8);
            }
            const plinth = draw('cylinder', '#526b79'); plinth.position.set(o.x, .3, o.y); plinth.scale.set(.5, .6, .5);
            const core = draw('rock', b.encounter === 'siege' ? FX.fire : FX.magic); core.position.set(o.x, 1, o.y); core.scale.set(.23, .5, .23);
            if (b.encounter === 'siege') {
                core.position.y = 1.35; core.scale.set(.4, .85, .4);
                const flame = draw('cone', FX.gold, .8); flame.position.set(o.x, 1.4, o.y); flame.scale.set(.2, .85, .2);
                ground('ring', FX.fire, .9, o.x, o.y, .8);
            }
            if (!reduced) { core.rotation.y = b.tick * .025; }
        }
        for (const ally of b.companions) {
            if (ally.hp <= 0 || ally.life <= 0) { continue; }
            ground('ring', FX.heal, .4, ally.x, ally.y, .8);
            if (ally.kind === 'turret') {
                const base = draw('cylinder', '#687c81'); base.position.set(ally.x, .25, ally.y); base.scale.set(.4, .5, .4);
                const cannon = draw('box', '#bd9a68'); cannon.position.set(ally.x, .65, ally.y); cannon.scale.set(.9, .2, .25); cannon.rotation.y = -ally.angle;
                const glow = draw('sphere', FX.magic); glow.position.set(ally.x + Math.cos(ally.angle) * .45, .65, ally.y + Math.sin(ally.angle) * .45); glow.scale.setScalar(.11);
            } else {
                const empowered = ally.kind === 'familiar' && p.resonance > 0, size = empowered ? 1.5 : 1;
                const color = ally.kind === 'shade' ? '#a6acd8' : empowered ? C.empowered : C.familiar;
                const bob = reduced ? 0 : Math.sin(b.tick * .1 + ally.id) * .08;
                const glow = draw('sphere', color, 1, true);
                glow.position.set(ally.x, .55 * size + bob, ally.y); glow.scale.set(.3 * size, .36 * size, .3 * size);
                for (const side of [-1, 1]) { const ear = draw('cone', color, 1, true); ear.position.set(ally.x + side * .2 * size, .93 * size + bob, ally.y); ear.scale.set(.08 * size, .22 * size, .08 * size); }
                const eye = draw('sphere', '#35475b'); eye.position.set(ally.x + Math.cos(ally.angle) * .28 * size, .63 * size + bob, ally.y + Math.sin(ally.angle) * .28 * size); eye.scale.setScalar(.07 * size);
                if (empowered) {
                    const crown = draw('torus', C.crest, 1, true); crown.position.set(ally.x, 1.45 + bob, ally.y); crown.rotation.x = Math.PI / 2; crown.scale.setScalar(.32);
                    for (let i = 0; i < 3; i++) {
                        const a = i * Math.PI * 2 / 3, jewel = draw('rock', C.crest, 1, true);
                        jewel.position.set(ally.x + Math.cos(a) * .32, 1.55 + bob, ally.y + Math.sin(a) * .32); jewel.scale.set(.08, .17, .08);
                    }
                }
            }
        }
        for (const e of b.enemies) {
            if (isBoss(e.kind) && e.phase > 1) {
                const radius = ENEMIES[e.kind].radius + .55;
                ground('ring', e.kind === 'king' ? FX.fire : FX.magic, radius, e.x, e.y, .65);
                if (!reduced) { for (let i = 0; i < e.phase + 2; i++) {
                    const t = b.tick * .025 + i * Math.PI * 2 / (e.phase + 2), mote = draw('rock', e.kind === 'king' ? FX.fire : FX.magic, .8);
                    mote.position.set(e.x + Math.cos(t) * radius, .55 + Math.sin(t * 2) * .2, e.y + Math.sin(t) * radius); mote.scale.set(.08, .19, .08);
                } }
            }
            if (e.windup) {
                const progress = 1 - e.windup / ENEMIES[e.kind].windup;
                ground('ring', FX.warning, ENEMIES[e.kind].radius + .35, e.x, e.y, .8);
                if (e.kind === 'charger') {
                    const length = Math.min(9, Math.hypot(e.target.x - e.x, e.target.y - e.y));
                    const line = draw('box', FX.danger, .3); line.scale.set(.75, .035, length);
                    line.position.set(e.x + Math.cos(e.angle) * length / 2, .09, e.y + Math.sin(e.angle) * length / 2); line.rotation.y = Math.PI / 2 - e.angle;
                    ground('ring', FX.danger, .5, e.target.x, e.target.y, .9);
                } else if (e.kind === 'archer') {
                    const length = Math.hypot(e.target.x - e.x, e.target.y - e.y), sight = draw('box', FX.warning, .6);
                    sight.position.set((e.x + e.target.x) / 2, .11, (e.y + e.target.y) / 2); sight.scale.set(length, .03, .09); sight.rotation.y = -e.angle;
                } else if (e.kind === 'bomber') { ground('ring', FX.warning, 1.9, e.target.x, e.target.y); }
                else if (e.kind === 'soldier' || e.kind === 'guard' || e.kind === 'stalker') {
                    ground('disc', FX.danger, ENEMIES[e.kind].reach, e.target.x, e.target.y, .15 + progress * .2);
                    ground('ring', FX.danger, ENEMIES[e.kind].reach, e.target.x, e.target.y);
                }
            }
            if (e.chill) { ground('ring', FX.frost, ENEMIES[e.kind].radius + .13, e.x, e.y); }
            if (e.exposed) { ground('arc', FX.gold, ENEMIES[e.kind].radius + .3, e.x, e.y, .9); }
            if (e.burn && !reduced) {
                for (let i = 0; i < 3; i++) { const flame = draw('rock', FX.fire, .8); flame.position.set(e.x + Math.sin(i * 2) * .3, .35 + ((b.tick + i * 7) % 20) / 18, e.y + Math.cos(i * 2) * .3); flame.scale.set(.08, .2, .08); }
            }
            if (e.kind === 'priest') { ground('ring', '#a39aca', 3.5, e.x, e.y, .4); }
        }
        for (const h of b.hazards) {
            const color = h.friendly ? h.kind === 'fire' ? FX.fire : FX.magic : FX.danger;
            if (h.kind === 'beam') {
                const beam = draw('box', color, h.wait ? .3 : .75); beam.position.set(h.x + Math.cos(h.angle) * h.length / 2, .11, h.y + Math.sin(h.angle) * h.length / 2);
                beam.scale.set(h.length, .04, h.width * 2); beam.rotation.y = -h.angle;
                for (const offset of [0, h.length]) { ground('disc', color, h.width, h.x + Math.cos(h.angle) * offset, h.y + Math.sin(h.angle) * offset, h.wait ? .3 : .75); }
                continue;
            }
            if (h.kind === 'ring') {
                ground('ring', color, h.inner, h.x, h.y); ground('ring', color, h.radius, h.x, h.y);
                for (let i = 1; i <= 4; i++) { ground('ring', color, h.inner + (h.radius - h.inner) * i / 5, h.x, h.y, h.wait ? .35 : .8); }
                continue;
            }
            ground('disc', color, h.radius, h.x, h.y, h.wait ? .2 : .4); ground('ring', color, h.radius, h.x, h.y);
            if (h.wait) {
                ground('ring', color, h.radius * (1 - Math.min(1, h.wait / 45)), h.x, h.y, .7);
                const cross = draw('box', color, .7); cross.position.set(h.x, .12, h.y); cross.scale.set(.08, .02, .6);
                const cross2 = draw('box', color, .7); cross2.position.copy(cross.position); cross2.scale.set(.6, .02, .08);
            } else if (!reduced) {
                ground('ring', FX.gold, h.radius * (.7 + Math.sin(b.tick * .1) * .1), h.x, h.y, .7, .25);
                for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, shard = draw('cone', color, .7); shard.position.set(h.x + Math.cos(a) * h.radius * .65, .45, h.y + Math.sin(a) * h.radius * .65); shard.scale.set(.15, .9, .15); }
            }
        }
        for (const s of b.shots) {
            const color = s.friendly ? FX.gold : FX.danger;
            const core = draw('sphere', s.friendly ? '#fffbea' : '#fff1c9'); core.position.set(s.x, .6, s.y); core.scale.set(.11, .11, .11);
            const head = draw('sphere', color, .8); head.position.copy(core.position); head.scale.set(.21, .18, .21);
            const tail = draw('cone', color, .5); tail.position.set(s.x - Math.cos(s.angle) * .38, .6, s.y - Math.sin(s.angle) * .38); tail.scale.set(.14, .75, .14); tail.rotation.set(0, -s.angle, -Math.PI / 2);
        }
        for (const e of b.effects) {
            const t = 1 - e.life / (e.kind === 'slash' ? 9 : 15);
            if (e.kind === 'slash') {
                const arc = ground('arc', FX.gold, e.size, e.x, e.y, .3 * (1 - t), .42); arc.rotation.z = -e.angle - .9 + t * .4;
                const edge = ground('stroke', '#fff4d2', e.size, e.x, e.y, .9 * (1 - t), .43); edge.rotation.z = arc.rotation.z;
            } else if (e.kind === 'resonance') {
                ground('ring', C.crest, e.size * (reduced ? 1 : .6 + t * (2 - t)), e.x, e.y, .8 - t * .6, .16);
                for (const ally of b.companions) {
                    if (ally.kind !== 'familiar' || ally.hp <= 0 || ally.life <= 0) { continue; }
                    const dx = ally.x - p.x, dy = ally.y - p.y;
                    const link = draw('box', C.empowered, 1 - t * .7);
                    link.position.set((p.x + ally.x) / 2, 1.1, (p.y + ally.y) / 2); link.scale.set(Math.hypot(dx, dy), .045, .045); link.rotation.y = -Math.atan2(dy, dx);
                }
                for (let i = 0; i < 4; i++) {
                    const a = i * Math.PI / 2 + (reduced ? 0 : t), rune = draw('rock', C.empowered, 1 - t * .4);
                    rune.position.set(p.x + Math.cos(a) * .95, 1.7 + (reduced ? 0 : t * .5), p.y + Math.sin(a) * .95); rune.scale.set(.08, .18, .08);
                }
            } else if (e.kind === 'lightning') {
                for (let i = 0; i < 4; i++) {
                    const bolt = draw('box', i % 2 ? '#ffffff' : FX.magic, 1 - t * .6); bolt.scale.set(.09 + (1 - t) * .09, 1.05, .08);
                    bolt.position.set(e.x + (i % 2 ? .14 : -.14), .5 + i * .85, e.y); bolt.rotation.z = i % 2 ? -.35 : .35;
                }
                ground('ring', FX.magic, .4 + t, e.x, e.y, 1 - t);
            } else if (e.kind === 'block' || e.kind === 'parry' || e.kind === 'ward-hit' || e.kind === 'ward-break') {
                const blocking = e.kind === 'block' || e.kind === 'parry', broken = e.kind === 'ward-break';
                const color = blocking ? e.kind === 'parry' ? DEFENSE_COLORS.parry : DEFENSE_COLORS.block : DEFENSE_COLORS.ward;
                if (blocking) {
                    const impact = draw('ring', color, 1 - t);
                    impact.position.set(e.x + Math.cos(e.angle) * .7, 1.3, e.y + Math.sin(e.angle) * .7);
                    impact.rotation.y = Math.PI / 2 - e.angle; impact.scale.setScalar(.6 + t * (e.kind === 'parry' ? 1.3 : .6));
                }
                for (let i = 0; i < (broken ? 6 : 4); i++) {
                    const a = i * 2.4 + e.id, shard = draw(broken ? 'rock' : 'box', color, 1 - t);
                    const spread = reduced ? 1.1 : .7 + t * (broken ? 1.5 : .6);
                    shard.position.set(e.x + Math.cos(a) * spread, .7 + (i % 3) * .55, e.y + Math.sin(a) * spread);
                    shard.scale.set(.07 * (1 - t), (broken ? .3 : .16) * (1 - t), .04); shard.rotation.set(a, a, a);
                }
            } else if (e.kind === 'heal') { ground('ring', FX.heal, .4 + t, e.x, e.y, 1 - t); }
            else {
                const color = e.kind === 'hit' ? FX.danger : FX.gold;
                ground('ring', color, e.size * (.4 + t), e.x, e.y, 1 - t);
                if (!reduced) { for (let i = 0; i < 7; i++) {
                    const a = i * 2.4 + e.id, spark = draw('rock', color, 1 - t * .8);
                    spark.position.set(e.x + Math.cos(a) * t * e.size, .4 + Math.sin(t * Math.PI) * .8, e.y + Math.sin(a) * t * e.size);
                    spark.scale.set(.1 * (1 - t), .28 * (1 - t), .1 * (1 - t)); spark.rotation.z = a;
                } }
            }
        }
    } };
}
