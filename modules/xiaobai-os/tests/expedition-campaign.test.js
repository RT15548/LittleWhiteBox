import assert from 'node:assert/strict';
import test from 'node:test';
import { journey } from './fixtures/expedition-traveler.js';
import { advanceExpedition, emptyExpedition } from '../apps/game/expedition/domain.ts';
import { EXPEDITION_PARTITION, validateExpedition, parseCommand } from '../apps/game/expedition/partition.ts';
import { campaignLoadout, tickCampaign } from '../apps/game/expedition/campaign/rules.ts';
import { campaignDriver } from './fixtures/campaign-driver.mjs';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { startWorld } from '../apps/game/expedition/world/exploration.ts';
import { TRAVELER_AGE_IDS } from '../apps/game/expedition/content/traveler-ages.ts';
import { applyReply } from '../apps/game/expedition/narrative/apply-reply.ts';
const start = { type: 'start', weapon: 'blade', outfit: 'traveler', ...journey };
test('a journey requires the chosen identity and chapter; the saved profile survives a round trip', () => {
    for (const gender of ['male', 'female']) for (const appearanceAge of TRAVELER_AGE_IDS) {
        const command = parseCommand({ ...start, traveler: { name: '  江雪  ', gender, appearanceAge } });
        const state = advanceExpedition(emptyExpedition(), command, 'identity', 7);
        assert.deepEqual(state.active.traveler, { name: '江雪', gender, appearanceAge });
        assert.equal(state.active.chapter, journey.chapter);
        assert.deepEqual(EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(state)).value, state);
    }
    for (const traveler of [null, {}, { name: ' ' }, { name: '江雪' }, { name: '江雪', gender: 'unknown' }, { name: 'a\nb', gender: 'male' }]) {
        assert.throws(() => parseCommand({ ...start, traveler }), { code: 'expedition_invalid' });
    }
    assert.throws(() => parseCommand({ ...start, chapter: 'future' }), { code: 'expedition_invalid' });
});
test('new journeys require a listed adult age without replacing a save on invalid input', () => {
    const current = advanceExpedition(emptyExpedition(), start, 'current', 7), before = structuredClone(current);
    for (const appearanceAge of [undefined, null, '', 17, 'minor', 'seventeen', 'adult', '看起来20上下']) {
        const traveler = { ...journey.traveler, appearanceAge };
        if (appearanceAge !== undefined) {
            assert.throws(() => parseCommand({ ...start, traveler }), { code: 'expedition_invalid' });
        }
        assert.throws(() => advanceExpedition(emptyExpedition(), { ...start, traveler }, 'new', 7), { code: 'expedition_invalid' });
        assert.throws(() => advanceExpedition(current, { ...start, type: 'restart', traveler }, 'replacement', 7), { code: 'expedition_invalid' });
        assert.deepEqual(current, before);
    }
});
test('an unselected age remains unselected through saving and continued play', () => {
    const state = advanceExpedition(emptyExpedition(), start, 'current', 7);
    delete state.active.traveler.appearanceAge;
    delete state.last.command.traveler.appearanceAge;
    state.active.location.position = { ...state.active.people.sanniang.position };
    const restored = EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(state)).value;
    assert.deepEqual(restored, state);
    const continued = advanceExpedition(restored, { type: 'greet', person: 'sanniang' }, 'greeting', 0);
    assert.deepEqual(continued.active.traveler, state.active.traveler);
    assert.equal(continued.active.id, state.active.id);
    assert.deepEqual(EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(continued)).value, continued);
});
function fixture(seed = 7) {
    let state = advanceExpedition(emptyExpedition(), start, 'start', seed), serial = 0;
    const act = command => { state = advanceExpedition(state, command, `act-${++serial}`, 0); validateExpedition(state); };
    return { get: () => state, act, driver: campaignDriver(() => state.active, act) };
}
for (const route of ['gate', 'waterway']) {
    test(`chapter one is completable through ${route} using only legal movement, combat and interactions`, async () => {
        const h = fixture(); await h.driver.complete(route);
        const data = h.get(), c = data.active;
        for (const fact of ['captives_released', 'postern_opened', 'receiving_arranged', 'captives_arrived', 'warden_defeated', 'supplies_secured', 'chapter_completed']) { assert.ok(c.facts.includes(fact), fact); }
        assert.equal(c.location.scene, 'camp'); assert.ok(c.conversations.sanniang); assert.equal(c.phase, 'exploration');
        assert.equal(c.facts.includes('alarm_silenced'), route === 'gate');
        assert.ok(c.collection.length > 0); assert.ok(c.equipped.length <= 6);
        const saved = EXPEDITION_PARTITION.serialize(data); assert.deepEqual(EXPEDITION_PARTITION.parse(saved).value, data);
        assert.equal(data.awards.filter(a => a.key === 'chapter-one').length, 1);
        assert.throws(() => h.act({ type: 'choice', id: 'finish', person: 'sanniang' })); assert.deepEqual(h.get().awards, data.awards);
    });
}
test('escort rescue reaches chapter completion through real movement without reception or using the postern', async () => {
    const h = fixture();
    await h.driver.walk('clinic'); h.act({ type: 'choice', id: 'briefing', person: 'sanniang' });
    await h.driver.interact('road'); await h.driver.interact('waterway');
    await h.driver.interact('sluice'); await h.driver.interact('cells'); await h.driver.interact('release');
    for (const person of ['anian', 'kouzi']) {
        await h.driver.walk(person);
        applyReply(h.get().active, { actionId: `escort-${person}`, person, text: 'Follow me' },
            { kind: 'dialogue', reply: 'Agreed', action: 'follow', affection: null });
        validateExpedition(h.get());
    }
    for (const exit of ['waterway', 'crossroads', 'camp']) await h.driver.interact(exit);
    assert.ok(h.get().active.facts.includes('captives_arrived'));
    assert.equal(h.get().active.facts.includes('postern_opened'), false);
    assert.equal(h.get().active.facts.includes('receiving_arranged'), false);
    for (const person of ['anian', 'kouzi']) {
        assert.equal(h.get().active.people[person].scene, 'camp'); assert.equal(h.get().active.people[person].mode, 'follow');
    }
    await h.driver.interact('rest');
    for (const exit of ['road', 'waterway', 'cells', 'hall']) await h.driver.interact(exit);
    await h.driver.walk('encounter'); await h.driver.battle();
    for (const exit of ['cells', 'waterway', 'crossroads', 'camp']) await h.driver.interact(exit);
    await h.driver.interact('cargo'); await h.driver.walk('clinic'); h.act({ type: 'choice', id: 'finish', person: 'sanniang' });
    assert.ok(h.get().active.facts.includes('chapter_completed'));
    assert.equal(h.get().awards.filter(award => award.key === 'chapter-one').length, 1);
    assert.deepEqual(EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(h.get())).value, h.get());
});

test('collection ownership and equipped ranks have one source; safe-point respec cannot heal or reroll', () => {
    const h = fixture(), c = h.get().active;
    c.collection = [{ id: 'cinder', rank: 2 }, { id: 'wildfire', rank: 1 }]; c.equipped = ['cinder', 'wildfire']; c.hp = 35;
    h.act({ type: 'loadout', equipped: ['wildfire'] });
    assert.deepEqual(h.get().active.equipped, ['wildfire']);
    h.act({ type: 'loadout', equipped: ['cinder'] }); assert.equal(h.get().active.hp, 35);
    assert.equal(campaignLoadout(h.get().active).relics[0].rank, 2); assert.equal(h.get().active.collection.length, 2);
    h.get().active.location = startWorld(COURTYARD.cells, 'waterway');
    assert.throws(() => h.act({ type: 'loadout', equipped: [] }));
});
test('remote interactions and client-claimed results cannot alter chapter facts', () => {
    const h = fixture(); assert.throws(() => h.act({ type: 'choice', id: 'receiving', person: 'laobai' }));
    assert.throws(() => h.act({ type: 'interact', id: 'release' })); assert.deepEqual(h.get().active.facts, []);
});
test('a plot result belongs to its selected witness without appending a second scripted dialogue', () => {
    const h = fixture(), c = h.get().active;
    c.location.position = { ...COURTYARD.camp.anchors.guard };
    c.people.sanniang.position = { ...c.location.position };
    h.act({ type: 'choice', id: 'briefing', person: 'laobai' });
    assert.ok(h.get().active.knowledge.laobai.includes('briefed'));
    assert.equal(h.get().active.knowledge.sanniang.includes('briefed'), false);
    assert.equal(h.get().active.conversations.laobai.length, 0);
    assert.equal(h.get().active.conversations.sanniang.length, 0);
    assert.throws(() => h.act({ type: 'choice', id: 'briefing', person: 'sanniang' }));
});
test('encounter checkpoints restore exact combat without rewinding confirmed chapter facts', () => {
    const h = fixture(), c = h.get().active;
    c.location = startWorld(COURTYARD.crossroads, 'encounter'); c.facts.push('briefed');
    tickCampaign(c, { move: 0, dash: false, skill: false }); const checkpoint = structuredClone(c.checkpoint);
    c.battle.player.hp = 0; c.hp = 0; c.battle.status = 'lost'; c.phase = 'lost';
    h.act({ type: 'retry' }); assert.deepEqual(h.get().active.battle, checkpoint); assert.deepEqual(h.get().active.facts, ['briefed']);
});

test('returning to camp retains progress; explicit new chapter replaces only its story and collection', async () => {
    const h = fixture(); await h.driver.complete('waterway');
    await h.driver.walk('clinic'); h.act({ type: 'choice', id: 'clinic', person: 'sanniang' });
    const completed = h.get(); assert.ok(completed.active.facts.includes('clinic_helped'));
    const receipts = structuredClone(completed.awards), priorId = completed.active.id;
    h.act({ type: 'restart', weapon: 'staff', outfit: 'traveler', ...journey });
    assert.notEqual(h.get().active.id, priorId); assert.equal(h.get().active.weapon, 'staff');
    assert.deepEqual(h.get().active.facts, []); assert.deepEqual(h.get().active.collection, []);
    assert.deepEqual(h.get().awards, receipts);
});

test('an explicit restart from outside camp replaces the traveler and leaves owned outfits intact', () => {
    const state = advanceExpedition(emptyExpedition(), start, 'old', 7);
    state.active.location = startWorld(COURTYARD.cells, 'waterway');
    state.purchases.push({ id: 'ranger', actionId: 'purchase', amount: 180 });
    const next = advanceExpedition(state, { ...start, type: 'restart', traveler: { name: '江雪', gender: 'female', appearanceAge: 'elder' } }, 'new', 9);
    validateExpedition(next);
    assert.deepEqual(next.active.traveler, { name: '江雪', gender: 'female', appearanceAge: 'elder' });
    assert.equal(next.active.location.scene, 'camp');
    assert.deepEqual(next.purchases, state.purchases);
    assert.deepEqual(state.active.traveler, journey.traveler);
});
