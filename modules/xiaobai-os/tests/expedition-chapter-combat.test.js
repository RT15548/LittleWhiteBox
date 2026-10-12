import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { traveler } from './fixtures/expedition-traveler.js';
import { createCampaign, advanceCampaign, campaignField, campaignLoadout, tickCampaign } from '../apps/game/expedition/campaign/rules.ts';
import { grantRewardNode, rewardOffers } from '../apps/game/expedition/campaign/rewards.ts';
import { campaignWorldInteractions } from '../apps/game/expedition/campaign/interactions.ts';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { courtyardBattle, COURTYARD_ENCOUNTERS } from '../apps/game/expedition/content/courtyard-encounters.ts';
import { COMBAT_POLICY } from '../apps/game/expedition/content/combat-policy.ts';
import { CHAPTER_GROWTH, REWARD_NODES } from '../apps/game/expedition/content/campaign-rewards.ts';
import { startWorld } from '../apps/game/expedition/world/exploration.ts';
import { createBattle, tickBattle, replayInputs } from '../apps/game/expedition/combat.ts';
import { chapterEncounterTick, signalActorTick } from '../apps/game/expedition/combat/chapter-encounter.ts';
import { encounterWon } from '../apps/game/expedition/combat/encounters.ts';
import { worldBossAttack } from '../apps/game/expedition/combat/world-bosses.ts';
import { insideHazard, projectilesTick } from '../apps/game/expedition/combat/projectiles.ts';
import { fan, hazard } from '../apps/game/expedition/combat/events.ts';
import { EXPEDITION_PARTITION } from '../apps/game/expedition/partition.ts';
import { emptyExpedition } from '../apps/game/expedition/domain.ts';
import { WEAPON_IDS } from '../apps/game/expedition/ids.ts';
import { relicReady } from '../apps/game/expedition/relics.ts';

const idle = { move: 0, dash: false, skill: false };
const campaign = (weapon = 'blade') => createCampaign('combat-fixture', 7, weapon, 'traveler', traveler);
function battle(id, reinforcement = false) {
    const spec = COURTYARD_ENCOUNTERS[id], plan = courtyardBattle(id, new Set(), COURTYARD[spec.scene].anchors[spec.trigger], 7, 100, reinforcement);
    const loadout = { weapon: 'blade', relics: [], oaths: [] };
    return { b: createBattle(plan.setup, loadout, plan.field), field: plan.field, loadout };
}
function roundTrip(c) {
    const data = { ...emptyExpedition(), active: c }, result = EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(data));
    assert.equal(result.ok, true); return result.value.active;
}

test('all six professions receive usable starter and follow-up choices within the chapter growth cap', () => {
    for (const weapon of WEAPON_IDS) {
        const c = campaign(weapon);
        for (const node of REWARD_NODES) {
            const id = Object.keys(COURTYARD_ENCOUNTERS).find(id => COURTYARD_ENCOUNTERS[id].reward === node);
            c.location = startWorld(COURTYARD[id ? COURTYARD_ENCOUNTERS[id].scene : 'cells'], id ? COURTYARD_ENCOUNTERS[id].trigger : 'reward');
            grantRewardNode(c, node); c.rewardNode = node; c.phase = 'reward';
            assert.equal(rewardOffers(c).length, CHAPTER_GROWTH.choices);
            for (const offer of rewardOffers(c)) {
                assert.ok(offer.rank <= CHAPTER_GROWTH.rankCap);
                assert.ok(relicReady(campaignLoadout(c), offer.id));
            }
            advanceCampaign(c, { type: 'relic', id: rewardOffers(c)[0].id });
        }
        assert.ok(c.equipped.length <= 6);
    }
});

test('a node remains at its first scene, keeps its candidates on leaving and reload, and pays only once across routes', () => {
    let c = campaign(); c.location = startWorld(COURTYARD.gate, 'reward'); c.facts.push('patrol_cleared');
    grantRewardNode(c, 'approach'); const reward = structuredClone(c.rewards.approach), seed = c.seed;
    advanceCampaign(c, { type: 'interact', id: 'relic_cache' });
    advanceCampaign(c, { type: 'leave' }); c = roundTrip(c);
    assert.deepEqual(c.rewards.approach, reward); assert.equal(c.seed, seed);
    c.location = startWorld(COURTYARD.waterway, 'approach_reward'); grantRewardNode(c, 'approach');
    assert.deepEqual(c.rewards.approach, reward);
    assert.equal(campaignWorldInteractions(c).some(i => i.target.id === 'approach_cache'), false);
    c.location = startWorld(COURTYARD.gate, 'reward'); advanceCampaign(c, { type: 'interact', id: 'relic_cache' });
    advanceCampaign(c, { type: 'relic', id: reward.offers[0].id });
    grantRewardNode(c, 'approach'); assert.equal(c.rewards.approach.offers.length, 0); assert.equal(c.collection.length, 1);
    assert.throws(() => advanceCampaign(c, { type: 'interact', id: 'relic_cache' }));
});

test('persuasion grants the same node only after acknowledgement, not a separate or early reward', () => {
    for (const [enemy, scene, fact, node] of [['bajin', 'gate', 'patrol_cleared', 'approach'], ['changyounian', 'beacon', 'alarm_silenced', 'passage']]) {
        const c = campaign(); c.location = startWorld(COURTYARD[scene], 'parley');
        c.pendingParley = { enemy, decision: 'pass' }; assert.deepEqual(c.rewards, {});
        advanceCampaign(c, { type: 'resolve_parley' });
        assert.ok(c.facts.includes(fact)); assert.equal(c.rewards[node].offers.length, 3);
        const rewards = structuredClone(c.rewards); grantRewardNode(c, node); assert.deepEqual(c.rewards, rewards);
    }
});

test('a full loadout can replace one item at the cache without deleting the displaced collection item', () => {
    const c = campaign(); c.location = startWorld(COURTYARD.cells, 'reward');
    c.collection = ['cinder', 'frost', 'echo', 'orbit', 'aegis', 'siphon'].map(id => ({ id, rank: 1 })); c.equipped = c.collection.map(r => r.id);
    grantRewardNode(c, 'cells'); c.rewardNode = 'cells'; c.phase = 'reward';
    const offer = rewardOffers(c).find(o => !c.equipped.includes(o.id)); assert.ok(offer);
    advanceCampaign(c, { type: 'relic', id: offer.id, replace: 'cinder' });
    assert.equal(c.equipped.length, 6); assert.ok(c.equipped.includes(offer.id)); assert.ok(c.collection.some(r => r.id === 'cinder'));
    roundTrip(c);
});

test('retry restores full health and the same start, seed and resources without reviving the completed waterway front', () => {
    let c = campaign(); c.location = startWorld(COURTYARD.waterway, 'encounter'); c.hp = 12; c.completedSegments.push('waterway_approach');
    tickCampaign(c, idle); assert.equal(c.engagement.id, 'waterway'); const checkpoint = structuredClone(c.checkpoint);
    for (let t = 0; t < 6000 && c.phase === 'battle'; t++) tickCampaign(c, idle);
    assert.equal(c.phase, 'lost'); c = roundTrip(c); advanceCampaign(c, { type: 'retry' });
    checkpoint.player.hp = 100; assert.deepEqual(c.battle, checkpoint); assert.deepEqual(c.completedSegments, ['waterway_approach']);
    const loadout = campaignLoadout(c), field = campaignField(c);
    const a = replayInputs(c.battle, [{ ...idle, ticks: 90 }], loadout, field);
    const b = structuredClone(c.battle); for (let t = 0; t < 90; t++) tickBattle(b, idle, loadout, field);
    assert.deepEqual(a, b);
});

test('finite reinforcements have an entrance warning and cannot be farmed or skip gate completion', () => {
    for (const [id, reinforcement, count] of [['gate', false, 1], ['waterway', false, 2], ['hall', true, 2], ['roots', false, 2]]) {
        const { b, field } = battle(id, reinforcement);
        if (id === 'gate') b.enemies = []; else b.enemies[0].hp = b.enemies[0].maxHp * .4;
        const original = b.enemies.length;
        chapterEncounterTick(b, field); assert.equal(b.script.reinforcements, 'warning'); assert.equal(b.enemies.length, original);
        if (id === 'gate') assert.equal(encounterWon(b, field), false);
        for (let t = 0; t < COMBAT_POLICY.reinforcementWarning; t++) chapterEncounterTick(b, field);
        assert.equal(b.enemies.length, original + count); assert.equal(b.script.reinforcements, 'done');
        for (let t = 0; t < 1000; t++) chapterEncounterTick(b, field);
        assert.equal(b.enemies.length, original + count);
    }
});

test('signal is attempted once, damage interrupts it, and successful ignition brings exactly one pair', () => {
    for (const interrupted of [true, false]) {
        const { b, field } = battle('beacon'); b.enemies = b.enemies.filter(e => e.kind !== 'guard');
        const caller = b.enemies.find(e => e.kind === 'archer'); chapterEncounterTick(b, field);
        assert.equal(b.script.signal, 'approach'); Object.assign(caller, field.signalPoint); signalActorTick(b, caller, field);
        assert.equal(b.script.signal, 'lighting'); if (interrupted) caller.hp--;
        for (let t = 0; t < COMBAT_POLICY.signalTicks + 100; t++) chapterEncounterTick(b, field);
        assert.equal(b.script.signal, interrupted ? 'stopped' : 'lit');
        assert.equal(b.enemies.filter(e => e.kind === 'soldier').length, interrupted ? 0 : 2);
        assert.equal(b.objective.hp === 0, !interrupted);
    }
});

test('single aimed arrows are on their sightline, annulus openings are safe, and one strike cannot hit a player twice', () => {
    const { b, field, loadout } = battle('roots'); fan(b, b.player, .7, 1, .36, 10);
    assert.equal(b.shots[0].angle, .7); b.shots = [];
    const e = b.enemies[0]; e.pattern = 2; e.angle = 0; worldBossAttack(b, e, field);
    const ring = b.hazards.find(h => h.kind === 'ring');
    assert.equal(insideHazard(ring, { x: e.x, y: e.y + 5 }, .34), false);
    assert.equal(insideHazard(ring, { x: e.x + 5, y: e.y }, .34), true);
    b.hazards = []; b.player.invulnerable = 0; hazard(b, b.player, 'slam', 2, 0, 90, 10);
    for (let t = 0; t < 90; t++) { b.tick++; b.player.invulnerable = 0; projectilesTick(b, loadout, field); }
    assert.equal(b.player.hp, 92);
});

test('the genuine V6 fixture upgrades once, retaining identity, records and ownership; corrupt old combat is not erased into validity', () => {
    const raw = JSON.parse(readFileSync(new URL('./fixtures/expedition-v6.json', import.meta.url), 'utf8')), before = structuredClone(raw);
    const result = EXPEDITION_PARTITION.parse(raw); assert.equal(result.ok, true, JSON.stringify(result));
    for (const key of ['traveler', 'facts', 'conversations', 'memories', 'relationships', 'knowledge', 'collection', 'equipped']) assert.deepEqual(result.value.active[key], before.active[key], key);
    assert.equal(result.value.active.phase, 'exploration'); assert.equal(result.value.active.hp, 100);
    assert.deepEqual(EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(result.value)).value, result.value);
    assert.deepEqual(raw, before);
    raw.active.battle.player.hp = 987; assert.equal(EXPEDITION_PARTITION.parse(raw).ok, false);
});
