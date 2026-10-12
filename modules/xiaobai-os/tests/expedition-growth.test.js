import assert from 'node:assert/strict';
import test from 'node:test';
import { createBattle, tickBattle, replayInputs } from '../apps/game/expedition/combat.ts';
import { BOSS_SPECS, RULES, WEAPON_LIST } from '../apps/game/expedition/content.ts';
import { BOSS_IDS } from '../apps/game/expedition/ids.ts';
import { compatibleRelics, eligibleRelics } from '../apps/game/expedition/relics.ts';
import { validateBattle } from '../apps/game/expedition/battle-validation.ts';
import { encounterTick, ENCOUNTER_RULES } from '../apps/game/expedition/combat/encounters.ts';
import { insideHazard } from '../apps/game/expedition/combat/projectiles.ts';
import { hazard, spawn } from '../apps/game/expedition/combat/events.ts';
import { hurtEnemy, hurtPlayer, lightning } from '../apps/game/expedition/combat/damage.ts';

const idle = { move: 0, dash: false, skill: false };
const gear = (weapon = 'blade', relics = []) => ({ weapon, relics, oaths: [] });
const setup = (options = {}, loadout = gear()) => createBattle({ seed: 7, zone: 0, chapter: 0, elite: false, boss: false, bossKind: 'warden', encounter: 'skirmish', hp: 100, ...options }, loadout);
const stack = (id, rank = 1) => ({ id, rank });

test('offers respect weapon affinity, actual prerequisites and chapter rank caps', () => {
    for (const weapon of WEAPON_LIST) {
        const pool = compatibleRelics(weapon), loadout = gear(weapon);
        assert.ok(pool.length >= RULES.relicSlots * 4);
        assert.ok(eligibleRelics(loadout, pool, 0).every(r => r.rank === 1));
        assert.equal(pool.includes('backstab'), weapon === 'daggers');
        assert.equal(pool.includes('riposte'), weapon === 'blade');
    }
    assert.equal(compatibleRelics('blade').includes('hunter'), false);
    assert.equal(eligibleRelics(gear(), ['wildfire'], 0).length, 0);
    assert.deepEqual(eligibleRelics(gear('blade', [stack('cinder')]), ['cinder', 'wildfire'], 0), [stack('wildfire')]);
    assert.deepEqual(eligibleRelics(gear('blade', [stack('cinder')]), ['cinder'], 1), [stack('cinder', 2)]);
    assert.deepEqual(eligibleRelics(gear('blade', [stack('cinder', 2)]), ['cinder'], 2), [stack('cinder', 3)]);
    assert.equal(eligibleRelics(gear('blade', [stack('cinder', 3)]), ['cinder'], 2).length, 0);
    assert.equal(eligibleRelics(gear('staff', [stack('cinder')]), ['overload'], 1).length, 0);
    assert.equal(eligibleRelics(gear('staff', [stack('frost')]), ['overload'], 1).length, 0);
    for (const cold of ['frost', 'nova', 'orbitals']) {
        assert.deepEqual(eligibleRelics(gear('staff', [stack('cinder'), stack(cold)]), ['overload'], 1), [stack('overload')]);
    }
});


test('the six professions have distinct basic skill outcomes without needing relics', () => {
    const states = Object.fromEntries(WEAPON_LIST.map(weapon => {
        const b = setup({}, gear(weapon)); b.player.x = 0; b.player.y = 0; b.enemies[0].x = 0; b.enemies[0].y = -2; b.enemies[0].hp = 500; b.enemies[0].maxHp = 500;
        tickBattle(b, { ...idle, skill: true }, gear(weapon)); return [weapon, b];
    }));
    assert.ok(states.blade.player.shield > 0); assert.ok(states.blade.enemies.some(e => e.stun > 0));
    assert.ok(states.bow.shots.filter(s => s.source === 'skill').length >= 5);
    assert.equal(states.staff.hazards.filter(h => h.source === 'skill').length, 3);
    assert.notEqual(states.daggers.player.y, 0); assert.ok(states.daggers.player.invulnerable > 0);
    assert.ok(states.grimoire.companions.some(c => c.kind === 'familiar'));
    assert.ok(states.cannon.companions.some(c => c.kind === 'turret'));
});


test('mirror shield adds protection even to the sword; last stand cannot rescue twice in one room', () => {
    const unarmored = setup(), enhanced = structuredClone(unarmored);
    tickBattle(unarmored, { ...idle, skill: true }, gear()); tickBattle(enhanced, { ...idle, skill: true }, gear('blade', [stack('aegis')]));
    assert.ok(enhanced.player.shield > unarmored.player.shield); assert.ok(enhanced.player.ward > 0);
    const b = setup(), loadout = gear('blade', [stack('last-stand')]); b.player.hp = 1; b.player.invulnerable = 0;
    hurtPlayer(b, 100, loadout); assert.ok(b.player.hp > 0); assert.equal(b.player.rescues, 1);
    b.player.invulnerable = 0; hurtPlayer(b, 100, loadout); assert.equal(b.player.hp, 0);
});

test('passive ward generation preserves a larger skill ward while retaining its own capacity', () => {
    for (const id of ['wardstone', 'pilgrim']) {
        const loadout = gear('blade', [stack('valor', 3), stack(id)]), b = setup({}, loadout);
        b.enemies = []; b.player.resource = 100;
        tickBattle(b, { ...idle, skill: true }, loadout);
        const skillWard = b.player.ward;
        assert.ok(skillWard > 35);
        b.tick = 179; b.player.travel = 28;
        tickBattle(b, idle, loadout);
        assert.equal(b.player.ward, skillWard, id);

        b.player.ward = 0; b.player.travel = 28; b.tick = 209;
        tickBattle(b, idle, loadout);
        const generated = b.player.ward;
        assert.ok(generated > 0 && generated < skillWard, id);
    }
    const loadout = gear('blade', [stack('wardstone')]), b = setup({}, loadout);
    b.enemies = []; b.tick = 179; b.player.ward = 9;
    tickBattle(b, idle, loadout); assert.equal(b.player.ward, 10);
    b.tick = 209; tickBattle(b, idle, loadout); assert.equal(b.player.ward, 10);
});

test('lightning cooldown refunds never delay a ready or nearly ready dash', () => {
    for (const rank of [1, 3]) {
        const loadout = gear('blade', [stack('momentum', rank)]);
        for (const cooldown of [0, 1, 3, 8, 15]) {
            const b = setup({}, loadout); b.tick = 30; b.player.dash = cooldown;
            lightning(b, b.enemies[0], loadout, 1);
            if (cooldown === 0) { assert.equal(b.player.dash, 0); }
            else { assert.ok(b.player.dash >= 0 && b.player.dash < cooldown); }
        }
    }
});

test('a cannon build offered shatter can trigger its burst with a deployed turret', () => {
    const base = gear('cannon', [stack('frost')]), enhanced = gear('cannon', [stack('frost'), stack('shatter')]);
    assert.ok(eligibleRelics(base, compatibleRelics('cannon'), 0).some(r => r.id === 'shatter'));
    function shoot(loadout) {
        const b = setup({}, loadout); b.enemies = [];
        const target = spawn(b, 'soldier', { x: 0, y: 0 }), nearby = spawn(b, 'soldier', { x: 1, y: 0 });
        for (const e of b.enemies) { e.hp = e.maxHp = 1000; e.stun = 100; }
        tickBattle(b, { ...idle, skill: true }, loadout);
        for (let i = 0; i < 39; i++) { tickBattle(b, idle, loadout); }
        return { b, target, nearby };
    }
    const ordinary = shoot(base), burst = shoot(enhanced);
    assert.ok(ordinary.target.chill > 0); assert.equal(burst.target.chill, 0);
    assert.ok(burst.target.hp < ordinary.target.hp); assert.ok(burst.nearby.hp < ordinary.nearby.hp);
    const before = burst.b.player.skill;
    hurtEnemy(burst.b, burst.target, burst.target.hp, gear('cannon', [...enhanced.relics, stack('salvage')]), 'companion');
    assert.ok(burst.b.player.skill < before);
});

test('priest healing restores living allies without reviving or recounting a settled kill', () => {
    const loadout = gear(), b = setup({}, loadout); b.enemies = [];
    const fallen = spawn(b, 'soldier', { x: 0, y: 0 }), wounded = spawn(b, 'soldier', { x: 2, y: 0 });
    const priest = spawn(b, 'priest', { x: 1, y: 0 }); priest.windup = 1;
    wounded.hp -= 20; const before = wounded.hp;
    hurtEnemy(b, fallen, fallen.maxHp * 2, loadout, 'attack');
    assert.equal(b.kills, 1);
    tickBattle(b, idle, loadout);
    assert.equal(fallen.hp, 0); assert.equal(b.enemies.some(e => e.id === fallen.id), false);
    assert.ok(wounded.hp > before);
    hurtEnemy(b, fallen, fallen.maxHp, loadout, 'attack'); assert.equal(b.kills, 1);
});


test('a ritual cannot be won by clearing enemies and circling outside the objective', () => {
    const b = setup({ encounter: 'ritual' }); b.enemies = []; b.wave = b.waves;
    for (let i = 0; i < 100; i++) tickBattle(b, idle, gear());
    assert.equal(b.status, 'fighting'); assert.equal(b.objective.progress, 0);
    b.player.x = b.objective.x; b.player.y = b.objective.y;
    tickBattle(b, idle, gear()); assert.equal(b.objective.progress, 1);
    spawn(b, 'guard', b.objective); tickBattle(b, idle, gear()); assert.equal(b.objective.progress, 1);
    b.objective.progress = b.objective.target; b.enemies[0].x = -9; b.enemies[0].y = -9;
    tickBattle(b, idle, gear()); assert.equal(b.objective.progress, b.objective.target); validateBattle(b);
});

test('defending the beacon is a real loss condition and survival has a timed objective', () => {
    const siege = setup({ encounter: 'siege' }); siege.objective.hp = 0; tickBattle(siege, idle, gear());
    assert.equal(siege.status, 'lost'); assert.ok(siege.player.hp > 0);
    const b = setup({ encounter: 'survival' }); b.enemies = []; b.wave = b.waves;
    tickBattle(b, idle, gear()); assert.equal(b.status, 'fighting'); assert.equal(b.objective.progress, 1);
    b.objective.progress = ENCOUNTER_RULES.survivalTicks - 1; tickBattle(b, idle, gear()); assert.equal(b.status, 'won');
});

test('a timed elite survival clears after the last enemy even when crowding delayed a wave', () => {
    const loadout = { ...gear('bow'), oaths: ['legion'] };
    const b = setup({ zone: 3, bossKind: 'forgemaster', elite: true, encounter: 'survival' }, loadout);
    b.tick = ENCOUNTER_RULES.reinforcementInterval; encounterTick(b, loadout);
    assert.ok(b.enemies.length >= 10 && b.wave < b.waves);
    b.tick = b.objective.target - 1; b.objective.progress = b.objective.target - 1;
    tickBattle(b, idle, loadout);
    assert.equal(b.objective.progress, b.objective.target); assert.equal(b.status, 'fighting');
    for (const e of b.enemies) { hurtEnemy(b, e, e.maxHp * 2, loadout, 'skill'); }
    assert.ok(b.enemies.every(e => e.hp === 0));
    tickBattle(b, idle, loadout);
    assert.equal(b.status, 'won'); validateBattle(b);
});

test('line and annulus hazards preserve their safe side and safe center in actual damage resolution', () => {
    const loadout = gear('bow'), b = setup({}, loadout); b.enemies = []; b.player.invulnerable = 0;
    const ring = hazard(b, b.player, 'ring', 6, 0, 10, 20, false, { inner: 3 });
    assert.equal(insideHazard(ring, b.player, RULES.playerRadius), false); tickBattle(b, idle, loadout); assert.equal(b.player.hp, 100);
    b.player.x += 4; tickBattle(b, idle, loadout); assert.equal(b.player.hp, 80);
    const line = hazard(b, { x: 0, y: 0 }, 'beam', 0, 0, 8, 20, false, { angle: 0, length: 8, width: .5 });
    assert.equal(insideHazard(line, { x: 4, y: .3 }, .1), true); assert.equal(insideHazard(line, { x: 4, y: 2 }, .1), false);
});

test('all twelve bosses produce legal deterministic encounters throughout a full pattern cycle', () => {
    for (const bossKind of BOSS_IDS) {
        const zone = BOSS_SPECS[bossKind].region, loadout = gear('bow'), b = setup({ zone, chapter: zone % 3, boss: true, bossKind }, loadout);
        const boss = b.enemies[0]; boss.hp = boss.maxHp * .28; b.player.invulnerable = 2000; b.player.attack = 2000;
        const spans = [{ ...idle, ticks: 550 }], first = replayInputs(b, spans, loadout), second = replayInputs(b, spans, loadout);
        assert.deepEqual(first, second); validateBattle(first); assert.equal(first.enemies[0].phase, bossKind === 'phoenix' ? 2 : 3);
        assert.ok(first.enemies[0].pattern >= 3); assert.equal(first.bossKind, bossKind);
    }
});
