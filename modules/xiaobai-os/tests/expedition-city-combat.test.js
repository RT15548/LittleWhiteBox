import assert from 'node:assert/strict';
import test from 'node:test';
import { createCampaign, tickCampaign, campaignField, campaignLoadout } from '../apps/game/expedition/campaign/rules.ts';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { cityBossAttack } from '../apps/game/expedition/combat/city-bosses.ts';
import { cityEncounterTick } from '../apps/game/expedition/combat/city-encounter.ts';
import { enemiesTick } from '../apps/game/expedition/combat/enemies.ts';
import { projectilesTick, insideHazard } from '../apps/game/expedition/combat/projectiles.ts';
import { canStandInWorld, worldLineClear } from '../apps/game/expedition/world/geometry.ts';
import { traveler } from './fixtures/expedition-traveler.js';

function encounter(scene = 'main_valve') {
    const c = createCampaign('mechanics', 7, 'blade', 'traveler', traveler);
    c.chapter = 'inner_city'; c.location.scene = scene; c.location.position = { ...COURTYARD[scene].anchors.encounter };
    tickCampaign(c, { move: 0, dash: false, skill: false });
    return { b: c.battle, e: c.battle.enemies[0], field: campaignField(c), gear: campaignLoadout(c) };
}

test('a warned tether locks its aim, damages and pulls once, and cannot drag through geometry', () => {
    const { b, e, field, gear } = encounter();
    e.x = 0; e.y = 0; e.target = { x: 0, y: 8 }; b.player.x = 0; b.player.y = 8; b.player.invulnerable = 0;
    cityBossAttack(b, e, field);
    const h = b.hazards[0], locked = { angle: h.angle, length: h.length }, hp = b.player.hp;
    assert.ok(h.wait > 0); assert.ok(e.exposed > h.wait + h.life);
    e.target = { x: 8, y: 0 };
    while (h.wait > 0) projectilesTick(b, gear, field);
    assert.equal(b.player.hp, hp); assert.equal(b.player.y, 8);
    assert.deepEqual({ angle: h.angle, length: h.length }, locked);
    projectilesTick(b, gear, field);
    assert.ok(b.player.hp < hp); assert.ok(b.player.y < 8);
    assert.ok(canStandInWorld(field.space, b.player, .34));
    const position = { x: b.player.x, y: b.player.y }, after = b.player.hp;
    const saved = structuredClone(b);
    for (let tick = 0; tick < 10; tick++) projectilesTick(saved, gear, field);
    assert.equal(saved.player.hp, after); assert.equal(saved.player.x, position.x); assert.equal(saved.player.y, position.y);
});

test('side-stepping the tether and using the center of the split vent are genuinely safe', () => {
    for (const pattern of [0, 2]) {
        const { b, e, field, gear } = encounter();
        e.x = 0; e.y = 0; e.target = { x: 0, y: 8 }; e.pattern = pattern;
        b.player.x = pattern === 0 ? 3 : 0; b.player.y = 8;
        cityBossAttack(b, e, field);
        assert.ok(b.hazards.every(h => !insideHazard(h, b.player, .34)));
        const hp = b.player.hp;
        for (let tick = 0; tick < 65; tick++) projectilesTick(b, gear, field);
        assert.equal(b.player.hp, hp);
    }
});

test('health phases reach the delayed second lane with an opening after the last impact', () => {
    const { b, e, field, gear } = encounter();
    e.hp = e.maxHp * .45; e.cooldown = 100;
    enemiesTick(b, gear, { x: 0, y: 0 }, field);
    assert.equal(e.phase, 2);
    e.pattern = 3; e.target = { x: 0, y: 8 };
    cityBossAttack(b, e, field);
    assert.equal(b.hazards.length, 2); assert.notEqual(b.hazards[0].wait, b.hazards[1].wait);
    assert.ok(e.exposed > Math.max(...b.hazards.map(h => h.wait + h.life)));
});

test('gallery pressure comes from a visible fixed outlet and both warning and damage stop at masonry', () => {
    const { b, field } = encounter('pipe_gallery');
    b.tick = 75; cityEncounterTick(b, field);
    const h = b.hazards[0]; assert.ok(h.wait > 0);
    const end = { x: h.x + Math.cos(h.angle) * h.length, y: h.y + Math.sin(h.angle) * h.length };
    assert.ok(worldLineClear(field.space, h, end, h.width));
    assert.equal(insideHazard(h, { x: end.x + 3, y: end.y }, .34), false);
    b.tick++; cityEncounterTick(b, field); assert.equal(b.hazards.length, 1);
});
