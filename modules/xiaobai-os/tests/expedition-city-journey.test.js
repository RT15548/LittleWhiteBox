import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceExpedition, emptyExpedition } from '../apps/game/expedition/domain.ts';
import { EXPEDITION_PARTITION } from '../apps/game/expedition/partition.ts';
import { WEAPON_IDS } from '../apps/game/expedition/ids.ts';
import { campaignDriver } from './fixtures/campaign-driver.mjs';
import { journey } from './fixtures/expedition-traveler.js';
import { campaignField, campaignLoadout } from '../apps/game/expedition/campaign/rules.ts';
import { tickBattle } from '../apps/game/expedition/combat.ts';

// Play the authored route using only real commands. No purchased/optional relics, position or HP overrides.
for (const seed of [7, 29]) for (const weapon of WEAPON_IDS) test(`${weapon}/${seed} continues from a legal rescue through the public return-heat route`, async t => {
    let state = advanceExpedition(emptyExpedition(), { type: 'start', weapon, outfit: 'traveler', ...journey }, 'start', seed), serial = 0;
    const battles = [], minimumHp = new Map();
    const driver = campaignDriver(() => state.active, async command => { state = advanceExpedition(state, command, `city-${++serial}`, seed); return true; }, {
        started(c) {
            if (!['sluice_bridge', 'main_valve'].includes(c.engagement.id)) return;
            const idle = structuredClone(c.checkpoint), field = campaignField(c), gear = campaignLoadout(c);
            for (let tick = 0; tick < 9000 && idle.status === 'fighting'; tick++) tickBattle(idle, { move: 0, dash: false, skill: false }, gear, field);
            assert.equal(idle.status, 'lost', `${weapon}/${c.engagement.id} standing still must not clear the fight`);
        },
        tick(segment, battle) { minimumHp.set(segment, Math.min(minimumHp.get(segment) ?? 100, battle.player.hp)); },
        finished(segment, battle) { battles.push({ segment, ticks: battle.tick, minimumHp: minimumHp.get(segment) }); },
    });
    await driver.complete('waterway');
    const prior = structuredClone({ traveler: state.active.traveler, conversations: state.active.conversations, relationships: state.active.relationships });
    await driver.interact('postern'); await driver.interact('hall'); await driver.interact('south_street');
    await driver.interact('heat_notice'); await driver.interact('workshop_street'); await driver.interact('pipe_receipt');
    await driver.interact('heat_station'); await driver.interact('return_plan'); await driver.interact('pipe_gallery');
    if (seed === 7) { await driver.interact('return_trial'); }
    await driver.interact('sluice_bridge'); await driver.interact('main_valve'); await driver.interact('heat_return');
    assert.ok(state.active.facts.includes('heat_restored'));
    assert.equal(state.active.facts.includes('return_flow_tested'), seed === 7, 'skipping the trial must not invent it later');
    assert.deepEqual(state.active.traveler, prior.traveler); assert.deepEqual(state.active.conversations, prior.conversations); assert.deepEqual(state.active.relationships, prior.relationships);
    assert.deepEqual(battles.filter(b => ['pipe_gallery', 'sluice_bridge', 'main_valve'].includes(b.segment)).map(b => b.segment), ['pipe_gallery', 'sluice_bridge', 'main_valve']);
    assert.equal(state.active.facts.includes('roots_cleared'), false); assert.equal(state.active.facts.includes('coal_store_cleared'), false);
    assert.deepEqual(EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(state)).value, state);
    await driver.interact('sluice_bridge'); await driver.interact('pipe_gallery'); await driver.interact('heat_station'); await driver.interact('south_street');
    await driver.interact('hall'); await driver.interact('cells'); await driver.interact('postern'); await driver.interact('camp_heat');
    assert.ok(state.active.facts.includes('warmth_seen_home'));
    assert.equal(battles.filter(b => b.segment === 'main_valve').length, 1);
    t.diagnostic(JSON.stringify({ seed, weapon, battles: battles.filter(b => ['pipe_gallery', 'sluice_bridge', 'main_valve'].includes(b.segment)) }));
});
