import assert from 'node:assert/strict';
import test from 'node:test';
import { appendInput, createBattle as initializeBattle, replayInputs, tickBattle } from '../apps/game/expedition/combat.ts';
import { parseCommand } from '../apps/game/expedition/partition.ts';
import { RULES, REGIONS, WEAPONS } from '../apps/game/expedition/content.ts';
import { hazard, shot } from '../apps/game/expedition/combat/events.ts';
import { RELIC_RULES } from '../apps/game/expedition/content.ts';
import { pilot } from './fixtures/expedition-pilot.mjs';
const idle = { move: 0, dash: false, skill: false };
const loadout = (relics = [], weapon = 'blade', oaths = []) => ({ weapon, relics: relics.map(id => ({ id, rank: 1 })), oaths });
const createBattle = (seed, zone, elite, boss, hp, gear) => initializeBattle({ seed, zone, chapter: zone, elite, boss, hp, bossKind: REGIONS[zone].bosses[0], encounter: 'skirmish' }, gear);

test('fixed-step local combat and compressed Host replay are identical across checkpoints', () => {
    const gear = loadout(['storm-step', 'conductor', 'momentum', 'cinder']), initial = createBattle(18, 1, false, false, 100, gear), local = structuredClone(initial), tape = [];
    for (let i = 0; i < 600 && local.status === 'fighting'; i++) { const input = pilot(local, gear.weapon); appendInput(tape, input); tickBattle(local, input, gear); }
    const host = replayInputs(initial, tape, gear); assert.deepEqual(host, local); assert.ok(host.kills > 0);
    const next = structuredClone(host), more = [];
    for (let i = 0; i < 200; i++) { const input = pilot(next, gear.weapon); appendInput(more, input); tickBattle(next, input, gear); }
    assert.deepEqual(replayInputs(host, more, gear), next);
});

test('dashing avoids an active strike; standing in the same hazard takes damage', () => {
    const gear = loadout(), b = createBattle(1, 0, false, false, 100, gear);
    b.player.invulnerable = 0; hazard(b, b.player, 'slam', 2, 0, 5, 18);
    const still = replayInputs(b, [{ ...idle, ticks: 1 }], gear), dash = replayInputs(b, [{ ...idle, move: 3, dash: true, ticks: 1 }], gear);
    assert.equal(still.player.hp, 100 - 18 * WEAPONS.blade.guard); assert.equal(dash.player.hp, 100); assert.ok(dash.player.dash > 0);
});

test('blade skill blocks and reflects enemy projectiles without granting permanent invulnerability', () => {
    const gear = loadout(), b = createBattle(1, 0, false, false, 100, gear);
    b.player.invulnerable = 0; shot(b, { x: 0, y: 4.5 }, Math.PI / 2, 10, false, { speed: .15 });
    tickBattle(b, { ...idle, skill: true }, gear); assert.equal(b.player.hp, 100); assert.equal(b.shots[0].friendly, true);
    for (let i = 0; i < 40; i++) tickBattle(b, idle, gear);
    assert.equal(b.player.shield, 0);
});

test('lightning combination changes dash economy and affects more enemies than the base relic', () => {
    const initial = createBattle(3, 0, false, false, 100, loadout());
    initial.player.attack = 100; initial.player.dash = 35; initial.tick = 29;
    initial.enemies.forEach((e, i) => { e.x = i * 1.3; e.y = 5; e.hp = 1000; e.maxHp = 1000; e.cooldown = 100; });
    hazard(initial, { x: 0, y: 5 }, 'storm', .6, 0, 60, 9, true);
    const base = replayInputs(initial, [{ ...idle, ticks: 1 }], loadout(['storm-step']));
    const combo = replayInputs(initial, [{ ...idle, ticks: 1 }], loadout(['storm-step', 'conductor', 'momentum']));
    assert.ok(combo.enemies.filter(e => e.hp < 1000).length > base.enemies.filter(e => e.hp < 1000).length);
    assert.ok(combo.player.dash < base.player.dash);
});

test('boss thresholds change phases and summon an encounter mechanic', () => {
    const gear = loadout([], 'bow', ['legion']), b = createBattle(3, 2, false, true, 100, gear);
    const boss = b.enemies[0]; boss.hp = boss.maxHp * .25; boss.windup = 1;
    tickBattle(b, idle, gear); assert.equal(boss.phase, 3); assert.ok(b.enemies.length > 1); assert.ok(b.hazards.length > 0);
});

test('lifesteal cannot resurrect a player killed earlier in the same simulation tick', () => {
    const gear = loadout(['siphon']), b = createBattle(3, 0, false, false, 1, gear);
    b.player.invulnerable = 0; b.player.attack = 100; b.kills = RELIC_RULES.siphonEvery - 1;
    const e = b.enemies[0]; e.x = 4; e.y = 5; e.hp = 1; e.cooldown = 100;
    shot(b, b.player, 0, 100, false, { speed: 0 }); shot(b, e, 0, 100, true, { speed: 0 });
    tickBattle(b, idle, gear); assert.equal(b.status, 'lost'); assert.equal(b.player.hp, 0); assert.equal(b.kills, RELIC_RULES.siphonEvery);
});

test('input protocol rejects forged results, unbounded work and illegal controls', () => {
    for (const command of [{ type: 'win' }, { type: 'input', spans: [] }, { type: 'input', spans: [{ ...idle, move: 9, ticks: 1 }] },
        { type: 'input', spans: [{ ...idle, ticks: RULES.maxInputTicks + 1 }] }, { type: 'input', spans: [{ ...idle, dash: 'yes', ticks: 1 }] }]) {
        assert.throws(() => parseCommand(command), { code: 'expedition_invalid' });
    }
});
