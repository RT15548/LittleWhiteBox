import assert from 'node:assert/strict';
import test from 'node:test';
import { createBattle, replayInputs, tickBattle } from '../apps/game/expedition/combat.ts';
import { companionsTick, playerTick } from '../apps/game/expedition/combat/actions.ts';
import { enemiesTick } from '../apps/game/expedition/combat/enemies.ts';
import { hurtEnemy } from '../apps/game/expedition/combat/damage.ts';
import { companion, hazard, shot } from '../apps/game/expedition/combat/events.ts';
import { projectilesTick } from '../apps/game/expedition/combat/projectiles.ts';
import { canStandInWorld, cellCenter, createWorldSpace } from '../apps/game/expedition/world/geometry.ts';
import { ENEMIES, RULES } from '../apps/game/expedition/content.ts';
import { WEAPON_IDS } from '../apps/game/expedition/ids.ts';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { COURTYARD_ENCOUNTERS, courtyardBattle } from '../apps/game/expedition/content/courtyard-encounters.ts';
import { findWorldPath } from '../apps/game/expedition/world/navigation.ts';
import { conditionMet } from '../apps/game/expedition/world/exploration.ts';

const map = { origin: { x: -9, y: -7 }, cellSize: 2,
    rows: ['#########', '#...#...#', '#...#...#', '#.......#', '#...#...#', '#...#...#', '#########'], gates: [] };
const point = (column, row) => cellCenter(map, column, row);
const setup = { seed: 19, zone: 0, chapter: 0, elite: false, boss: false, bossKind: 'warden', encounter: 'skirmish', hp: 100 };
const idle = { move: 0, dash: false, skill: false };
const loadout = weapon => ({ weapon, relics: [], oaths: [] });
const field = () => ({ space: createWorldSpace(map, new Set()), entry: point(3, 1), objective: point(3, 3),
    waves: [[{ kind: 'soldier', position: point(5, 1) }]], summonPoints: [point(2, 3), point(6, 3)] });

test('every class respects walls for automatic targeting, skills and newly placed companions', () => {
    for (const weapon of WEAPON_IDS) {
        const world = field(), gear = loadout(weapon), b = createBattle(setup, gear, world), enemy = b.enemies[0], hp = enemy.hp;
        b.player.facing = 0;
        playerTick(b, idle, gear, world);
        assert.equal(b.player.attack, 0, weapon);
        assert.equal(b.player.resource, 0, weapon);
        playerTick(b, { ...idle, skill: true }, gear, world);
        for (let i = 0; i < 35; i++) { b.tick++; projectilesTick(b, gear, world); }
        assert.equal(enemy.hp, hp, weapon);
        companionsTick(b, gear, world);
        for (const ally of b.companions) { assert.equal(canStandInWorld(world.space, ally, .3), true, weapon); }
    }
});

test('fast projectiles, explosions, lightning chains and hostile beams cannot damage across a wall', () => {
    const world = field(), gear = { ...loadout('staff'), relics: [{ id: 'conductor', rank: 3 }] }, b = createBattle(setup, gear, world);
    const enemy = b.enemies[0], hp = enemy.hp;
    shot(b, b.player, 0, 40, true, { speed: 5, splash: 5 });
    hazard(b, b.player, 'slam', 7, 0, 1, 35, true, { source: 'skill' });
    hazard(b, b.player, 'storm', 7, 0, 1, 35, true);
    hazard(b, enemy, 'beam', 0, 0, 1, 30, false, { angle: Math.PI, length: 8 });
    b.player.invulnerable = 0; b.tick = 15;
    projectilesTick(b, gear, world);
    assert.equal(b.shots.length, 0); assert.equal(enemy.hp, hp); assert.equal(b.player.hp, 100);
});

test('enemies and familiars take the real opening, while turrets do not waste cooldown on invisible targets', () => {
    const world = field(), gear = loadout('blade'), b = createBattle(setup, gear, world), enemy = b.enemies[0];
    enemy.cooldown = 0;
    const turret = companion(b, 'turret', b.player, 1000); turret.cooldown = 0;
    const familiar = companion(b, 'familiar', b.player, 1000); familiar.cooldown = 0;
    companionsTick(b, gear, world);
    assert.equal(turret.cooldown, 0); assert.equal(b.shots.length, 0);
    let enemyCrossed = false, familiarCrossed = false;
    for (let i = 0; i < 500; i++) {
        b.tick++; b.player.invulnerable = 1000; enemy.hp = enemy.maxHp;
        enemiesTick(b, gear, { x: 0, y: 0 }, world); companionsTick(b, gear, world);
        assert.equal(canStandInWorld(world.space, enemy, ENEMIES[enemy.kind].radius), true);
        assert.equal(canStandInWorld(world.space, familiar, .25), true);
        if (Math.abs(enemy.x - point(4, 3).x) < .8) { assert.ok(Math.abs(enemy.y - point(4, 3).y) <= .8); enemyCrossed = true; }
        if (Math.abs(familiar.x - point(4, 3).x) < .8) { assert.ok(Math.abs(familiar.y - point(4, 3).y) <= .8); familiarCrossed = true; }
    }
    assert.ok(enemyCrossed || familiarCrossed);
});

test('existing damage-over-time remains on its victim after they move behind cover', () => {
    const world = field(), gear = { ...loadout('staff'), relics: [{ id: 'cinder', rank: 1 }] }, b = createBattle(setup, gear, world);
    const enemy = b.enemies[0], hp = enemy.hp;
    enemy.burn = 30; b.tick = 15;
    enemiesTick(b, gear, { x: 0, y: 0 }, world);
    assert.ok(enemy.hp < hp);
});

test('map walls stop charges and create the existing stagger/exposure counterattack window', () => {
    const world = field(); world.entry = point(5, 1); world.waves = [[{ kind: 'charger', position: point(3, 1) }]];
    const b = createBattle(setup, loadout('blade'), world), enemy = b.enemies[0];
    enemy.motion = 25; enemy.motionAngle = 0;
    for (let i = 0; i < 15; i++) { enemiesTick(b, loadout('blade'), { x: 0, y: 0 }, world); }
    assert.equal(enemy.motion, 0); assert.ok(enemy.exposed > 0); assert.ok(enemy.stun > 0);
    assert.equal(canStandInWorld(world.space, enemy, ENEMIES.charger.radius), true);
});

test('world encounters are replayable and use authored waves instead of the old square arena', () => {
    const world = field(), gear = loadout('bow');
    world.entry = point(1, 5); world.waves.push([{ kind: 'archer', position: point(6, 4) }]);
    const b = createBattle(setup, gear, world), spans = [{ move: 3, dash: true, skill: true, ticks: 20 }, { ...idle, ticks: 90 }];
    assert.equal(b.waves, 2); assert.deepEqual(b.obstacles, []);
    assert.deepEqual(replayInputs(b, spans, gear, world), replayInputs(b, spans, gear, world));
    for (const enemy of b.enemies) { hurtEnemy(b, enemy, 999, gear, 'skill', enemy, world); }
    for (let i = 0; i < 45; i++) { tickBattle(b, idle, gear, world); }
    assert.equal(b.wave, 2); assert.equal(b.enemies[0].kind, 'archer');
    assert.equal(canStandInWorld(world.space, b.player, RULES.playerRadius), true);
});

test('a field refuses invalid spawns and bosses not yet authored for the explorable world', () => {
    const world = field(); world.waves[0][0].position = point(4, 1);
    assert.throws(() => createBattle(setup, loadout('blade'), world), { code: 'expedition_world_map_invalid' });
    assert.throws(() => createBattle({ ...setup, boss: true, bossKind: 'weaver' }, loadout('blade'), field()), { code: 'expedition_world_encounter_unsupported' });
});

test('all authored courtyard encounters spawn on reachable ground for every profession and every entrance', () => {
    const facts = new Set(['sluice_opened', 'postern_opened', 'captives_released']);
    for (const id of Object.keys(COURTYARD_ENCOUNTERS)) {
        const scene = COURTYARD[id];
        for (const entrance of scene.exits) {
            if (!conditionMet(entrance.condition, facts)) { continue; }
            const entry = scene.anchors[entrance.anchor], plan = courtyardBattle(id, facts, entry, 29, 80, true);
            for (const weapon of WEAPON_IDS) {
                const b = createBattle(plan.setup, loadout(weapon), plan.field);
                assert.equal(b.player.hp, 80);
                for (const enemy of b.enemies) {
                    assert.equal(canStandInWorld(plan.field.space, enemy, ENEMIES[enemy.kind].radius), true, id);
                    assert.ok(findWorldPath(plan.field.space, b.player, enemy, RULES.playerRadius), `${id}/${weapon}`);
                }
                for (let i = 0; i < 10; i++) { tickBattle(b, { ...idle, skill: i === 0 }, loadout(weapon), plan.field); }
            }
        }
        assert.equal(courtyardBattle(id, new Set([...facts, COURTYARD_ENCOUNTERS[id].complete]), scene.anchors[scene.exits[0].anchor], 29, 80, false), null);
    }
});
