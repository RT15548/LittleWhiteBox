import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceExpedition, emptyExpedition } from '../apps/game/expedition/domain.ts';
import { EXPEDITION_PARTITION } from '../apps/game/expedition/partition.ts';
import { CITY_THREADS, cityThreads } from '../apps/game/expedition/content/inner-city/progress.ts';
import { campaignDriver } from './fixtures/campaign-driver.mjs';
import { journey } from './fixtures/expedition-traveler.js';

// Relationship is scenario setup, not an affection-speed/model-quality measurement.
// Every subsequent journey, follower arrival, object and outcome uses real commands.
test('four accepted personal routes survive affection loss and interleave through real doors and followers', async () => {
    let state = advanceExpedition(emptyExpedition(), { type: 'start', weapon: 'blade', outfit: 'traveler', ...journey }, 'start', 7), serial = 0;
    const act = async command => { state = advanceExpedition(state, command, `personal-${++serial}`, 7); };
    const driver = campaignDriver(() => state.active, act);
    const choice = (person, id) => act({ type: 'choice', person, id });
    await driver.complete('waterway');
    for (const [person, anchor, id] of [['sanniang', 'clinic', 'visit_wen'], ['kouzi', 'kouzi', 'explore_deep_route'], ['anian', 'anian', 'trace_missing_name'], ['laobai', 'guard', 'review_gate_book']]) {
        state.active.relationships[person] = { affection: 81, highestBand: 4 };
        await driver.walk(anchor); await choice(person, id);
        state.active.relationships[person].affection = 20;
    }
    assert.equal(cityThreads(state.active).length, 4);
    const reload = () => { const parsed = EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(state)); assert.equal(parsed.ok, true); state = parsed.value; };
    reload();
    await driver.interact('kouzi_home'); await driver.interact('north'); await driver.interact('deep_gate'); await driver.interact('deep_receipt');
    await driver.walk('receipt'); await choice('kouzi', 'share_deep_route');
    await driver.interact('workshop_street');
    assert.equal(state.active.rewards.city_arrival.scene, 'workshop_street');
    await driver.interact('south_street');
    await driver.interact('anian_street'); await driver.interact('gate_tea');
    assert.equal(state.active.rewards.city_arrival.scene, 'workshop_street');
    assert.equal(state.active.rewards.city_arrival.offers.length, 0);
    assert.ok(state.active.knowledge.kouzi.includes('kouzi_entered_city'));
    await driver.interact('wen_house'); await driver.interact('wen_table');
    await driver.walk('host'); await choice('wenshoutong', 'offer_wen_release');
    await driver.walk('table'); await choice('sanniang', 'end_wen_marriage');
    await driver.interact('south'); await driver.interact('audit_office'); await driver.interact('gate_cases');
    await driver.interact('south'); await driver.interact('gate_allowed');
    await driver.interact('workshop_street'); await driver.interact('anian_bridge'); await driver.interact('workers_lodging');
    await driver.interact('worker_bunk'); await driver.interact('gate_refused');
    await driver.interact('south'); await driver.interact('transfer_office'); await driver.interact('transfer_record');
    await driver.walk('register'); await choice('anian', 'acknowledge_worker_error');
    await driver.walk('clerk'); await choice('qinzhi', 'correct_worker_record'); reload();
    assert.equal(cityThreads(state.active).find(t => t.person === 'anian').resolved, true);
    assert.equal(state.active.facts.includes('worker_result_delivered'), false);
    await driver.interact('south'); await driver.interact('workers_lodging'); await driver.interact('worker_result');
    await driver.interact('south'); await driver.interact('south_street'); await driver.interact('audit_office');
    await driver.walk('register'); await choice('laobai', 'request_gate_review');
    assert.ok(cityThreads(state.active).every(t => t.resolved));
    assert.ok(CITY_THREADS.every(t => state.active.people[t.person].scene === state.active.location.scene));
    assert.equal(state.active.facts.includes('heat_restored'), false);
    assert.equal(state.active.knowledge.chenhe.includes('wen_marriage_ended'), false);
    reload();
});

// Protect route independence at the command boundary: a combined journey can hide a
// prerequisite accidentally supplied by another companion. Reuse legally reached
// checkpoints; only the relationship threshold is supplied as scenario data.
test('each private route completes alone, both before and after the public heat restoration', async t => {
    let state = advanceExpedition(emptyExpedition(), { type: 'start', weapon: 'blade', outfit: 'traveler', ...journey }, 'start', 7), serial = 0;
    const encounters = [];
    const act = async command => { state = advanceExpedition(state, command, `solo-${++serial}`, 7); };
    const driver = campaignDriver(() => state.active, act, { started(c) { encounters.push(c.engagement.id); } });
    const interact = async (...ids) => { for (const id of ids) { await driver.interact(id); } };
    const choice = async (person, anchor, id) => { await driver.walk(anchor); await act({ type: 'choice', person, id }); };
    await driver.complete('waterway');
    const rescue = structuredClone(state);
    await interact('postern', 'hall', 'south_street', 'heat_notice', 'workshop_street', 'pipe_receipt', 'heat_station', 'return_plan',
        'pipe_gallery', 'return_trial', 'sluice_bridge', 'main_valve', 'heat_return', 'sluice_bridge', 'pipe_gallery', 'heat_station', 'south_street',
        'hall', 'cells', 'postern', 'camp_heat');
    const home = structuredClone(state);
    assert.equal(home.active.facts.includes('warmth_seen_home'), true);
    assert.equal(encounters.filter(id => id === 'main_valve').length, 1);

    for (const restored of [false, true]) for (const [person, anchor, invitation] of [
        ['sanniang', 'clinic', 'visit_wen'], ['kouzi', 'kouzi', 'explore_deep_route'],
        ['anian', 'anian', 'trace_missing_name'], ['laobai', 'guard', 'review_gate_book'],
    ]) await t.test(`${person}/${restored ? 'after-restoration' : 'before-restoration'}`, async () => {
        state = structuredClone(restored ? home : rescue); encounters.length = 0;
        const priorRewards = structuredClone(state.active.rewards);
        const otherPeople = Object.fromEntries(CITY_THREADS.filter(thread => thread.person !== person)
            .map(thread => [thread.person, structuredClone(state.active.people[thread.person])]));
        state.active.relationships[person] = { affection: 81, highestBand: 4 };
        await choice(person, anchor, invitation);
        if (person === 'kouzi') {
            await interact('kouzi_home', 'north', 'deep_gate', 'deep_receipt');
            await choice(person, 'receipt', 'keep_deep_route');
            await interact('south_street');
            assert.equal(state.active.knowledge.kouzi.includes('kouzi_entered_city'), true);
        } else {
            await interact('postern', 'hall', 'south_street');
            if (person === 'sanniang') {
                await interact('wen_house', 'wen_table');
                await choice('wenshoutong', 'host', 'offer_wen_independence');
                await choice(person, 'table', 'agree_wen_independence');
                await interact('south', 'wen_walk');
            } else if (person === 'anian') {
                await interact('anian_street', 'workshop_street', 'anian_bridge');
                assert.equal(state.active.facts.includes('worker_found'), false);
                assert.equal(state.active.facts.includes('worker_error_acknowledged'), false);
                await interact('south_street', 'hall', 'cells', 'postern', 'anian_return');
            } else {
                await interact('gate_tea', 'audit_office', 'gate_cases');
                await choice(person, 'register', 'take_gate_responsibility');
                await interact('south', 'gate_home');
                assert.equal(state.active.facts.includes('gate_refused_seen'), false);
            }
        }
        const threads = cityThreads(state.active);
        assert.deepEqual(threads.map(thread => ({ person: thread.person, resolved: thread.resolved })), [{ person, resolved: true }]);
        assert.equal(threads[0].task, null, 'the actual shared return, not merely the choice, completes the journal thread');
        for (const [other, location] of Object.entries(otherPeople)) { assert.deepEqual(state.active.people[other], location); }
        assert.equal(state.active.people[person].scene, state.active.location.scene);
        assert.equal(state.active.facts.includes('heat_restored'), restored);
        assert.equal(state.active.facts.includes('warmth_seen_home'), restored);
        assert.deepEqual(encounters, []);
        if (restored) { assert.deepEqual(state.active.rewards, priorRewards); }
        const parsed = EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(state));
        assert.equal(parsed.ok, true); assert.deepEqual(parsed.value, state);
    });
});
