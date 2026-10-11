import assert from 'node:assert/strict';
import test from 'node:test';
import { traveler } from './fixtures/expedition-traveler.js';
import { Group, Box3 } from 'three';
import { createBattle } from '../apps/game/expedition/combat.ts';
import { hurtEnemy } from '../apps/game/expedition/combat/damage.ts';
import { bossAttack } from '../apps/game/expedition/combat/bosses.ts';
import { companion, hazard } from '../apps/game/expedition/combat/events.ts';
import { projectilesTick } from '../apps/game/expedition/combat/projectiles.ts';
import { enemiesTick, BOMBER_FUSE_TICKS } from '../apps/game/expedition/combat/enemies.ts';
import { ENEMIES } from '../apps/game/expedition/content.ts';
import { createCampaign } from '../apps/game/expedition/campaign/rules.ts';
import { discoveredRoutes, mapMarkers } from '../apps/game/expedition/presentation/map-projection.ts';
import { createSceneKit } from '../apps/game/expedition/scene-kit.ts';
import { person } from '../apps/game/expedition/presentation/world-people.ts';
import { validateBattle } from '../apps/game/expedition/battle-validation.ts';

const gear = (relics = [], weapon = 'staff') => ({ weapon, oaths: [], relics: relics.map(id => ({ id, rank: 1 })) });
const battle = (bossKind = 'warden') => createBattle({ seed: 7, zone: bossKind === 'phoenix' ? 2 : 0, chapter: 0,
    elite: false, boss: true, bossKind, encounter: 'skirmish', hp: 100 }, gear());

test('overload consumes elements after inferno, shatter and elemental death reactions observe the same hit', () => {
    const b = battle(), e = b.enemies[0]; e.hp = 30;
    hurtEnemy(b, e, 10, gear(['cinder', 'frost', 'overload', 'inferno', 'shatter', 'wildfire', 'fracture']), 'skill', e);
    assert.equal(e.hp, 0); assert.equal(e.burn, 0); assert.equal(e.chill, 0);
    assert.equal(b.hazards.filter(h => h.kind === 'fire').length, 2);
    assert.equal(b.shots.length, 5); assert.equal(b.kills, 1);
    assert.equal(b.effects.filter(e => e.kind === 'lightning').length, 1);
});

test('backstab extends a short exposure and never truncates a longer boss opening', () => {
    for (const exposure of [0, 150]) {
        const b = battle(), e = b.enemies[0]; e.angle = 0; e.exposed = exposure;
        b.player.x = e.x - 1; b.player.y = e.y;
        hurtEnemy(b, e, 1, gear(['backstab'], 'daggers'), 'attack');
        assert.equal(e.exposed, Math.max(exposure, 55));
    }
});

test('phoenix entering phase three under burst damage heals exactly once at the phase-two boundary', () => {
    const b = battle('phoenix'), e = b.enemies[0]; e.hp = e.maxHp * .1;
    bossAttack(b, e, gear()); assert.equal(e.phase, 3);
    assert.ok(Math.abs(e.hp / e.maxHp - .22) < 1e-9);
    const hp = e.hp; bossAttack(b, e, gear()); assert.equal(e.hp, hp);
});

test('each transient enemy area attack hits each companion once, even across a saved replay boundary', () => {
    for (const kind of ['slam', 'beam', 'ring']) {
        const b = battle(); b.enemies = [];
        const ally = companion(b, 'familiar', { x: 0, y: 0 }, 100), hp = ally.hp;
        hazard(b, ally, kind, 3, 0, 9, 20, false, { length: 5 });
        projectilesTick(b, gear()); validateBattle(b);
        const saved = structuredClone(b);
        for (let i = 0; i < 7; i++) { saved.tick++; projectilesTick(saved, gear()); }
        assert.equal(saved.companions[0].hp, hp - 5);
        const newcomer = companion(saved, 'turret', { x: 0, y: 0 }, 100);
        projectilesTick(saved, gear()); assert.equal(newcomer.hp, 60);
    }
});

test('bomber lead uses its fuse, not imaginary projectile flight distance', () => {
    const b = battle(); const e = b.enemies[0]; e.kind = 'bomber'; e.hp = e.maxHp = ENEMIES.bomber.hp;
    e.x = 0; e.y = 0; e.cooldown = 0; b.player.x = 10; b.player.y = 0;
    const velocity = { x: 0, y: .02 };
    enemiesTick(b, gear(), velocity);
    assert.equal(e.target.y, velocity.y * (ENEMIES.bomber.windup + BOMBER_FUSE_TICKS));
});

test('chapter map only reveals reachable frontier silhouettes, never undiscovered names or closed links', () => {
    const c = createCampaign('map', 7, 'blade', 'traveler', traveler);
    const initial = discoveredRoutes(c);
    assert.deepEqual(initial.scenes, ['camp']);
    assert.equal(initial.links.length, 0);
    c.facts.push('briefed'); assert.deepEqual(discoveredRoutes(c).scenes.sort(), ['camp', 'crossroads']);
    c.facts.push('postern_opened'); assert.ok(discoveredRoutes(c).scenes.includes('cells'));
    for (const size of [18, 40, 96]) {
        const points = mapMarkers(Array.from({ length: 25 }, () => ({ x: 99, y: -99 })), { x: 0, z: 0, width: size, depth: size });
        assert.equal(points.length, 25); assert.ok(points.every(p => Math.abs(p.x) < size / 2 && Math.abs(p.y) < size / 2));
    }
});

test('perched NPC ring stays on ground and attention motion does not move its interaction anchor', () => {
    const kit = createSceneKit(), root = new Group();
    try {
        const npc = person(kit, root, 'kouzi', 3, 5, new Set(['captives_arrived']));
        const position = { ...npc.position }, initialAngle = npc.root.rotation.y;
        npc.update({ x: 8, y: 7 }, 1000, false); root.updateMatrixWorld(true);
        assert.ok(npc.ring.getWorldPosition(root.position.clone()).y > 0);
        assert.notEqual(npc.root.rotation.y, initialAngle); assert.deepEqual(npc.position, position);
        npc.dispose();
    } finally { kit.dispose(); }
});

test('batching a transformed character preserves world geometry and releases the per-rig batch', () => {
    const kit = createSceneKit(), root = new Group(); root.position.set(4, 2, 7); root.rotation.y = .5; root.scale.setScalar(1.2);
    kit.mesh(root, 'box', '#ffffff', [1, 2, 1], [.5, 1, 0]);
    const before = new Box3().setFromObject(root), dispose = kit.bake(root), after = new Box3().setFromObject(root);
    assert.ok(before.min.distanceTo(after.min) < 1e-5); assert.ok(before.max.distanceTo(after.max) < 1e-5);
    dispose(); assert.equal(root.children.length, 0); kit.dispose();
});
