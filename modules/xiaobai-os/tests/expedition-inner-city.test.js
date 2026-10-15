import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createCampaign, advanceCampaign, tickCampaign } from '../apps/game/expedition/campaign/rules.ts';
import { applyReply } from '../apps/game/expedition/narrative/apply-reply.ts';
import { prepareRegeneration, pendingEnding } from '../apps/game/expedition/campaign/reply-checkpoint.ts';
import { availableChoices } from '../apps/game/expedition/content/campaign-actions.ts';
import { CITY_THREADS, cityThreads, cityProgress } from '../apps/game/expedition/content/inner-city/progress.ts';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { CITY_SCENES } from '../apps/game/expedition/content/inner-city/scenes.ts';
import { CITY_ROOMS } from '../apps/game/expedition/content/inner-city/rooms.ts';
import { INTERACTION_REACH, sceneSpace } from '../apps/game/expedition/world/exploration.ts';
import { canStandInWorld } from '../apps/game/expedition/world/geometry.ts';
import { RULES } from '../apps/game/expedition/content.ts';
import { findWorldPath } from '../apps/game/expedition/world/navigation.ts';
import { districtScene } from '../apps/game/expedition/content/living-spaces.ts';
import { FACT_COPY } from '../apps/game/expedition/content/campaign-copy.ts';
import { emptyExpedition } from '../apps/game/expedition/domain.ts';
import { validateExpedition, EXPEDITION_PARTITION } from '../apps/game/expedition/partition.ts';
import { personAt } from '../apps/game/expedition/world/people.ts';
import { traveler } from './fixtures/expedition-traveler.js';
import { CITY_PASSAGES } from '../apps/game/expedition/content/inner-city/passages.ts';
import { cityPassage } from '../apps/game/expedition/campaign/city-passages.ts';
import { citySituation } from '../apps/game/expedition/narrative/city-situation.ts';
import { STORY_PEOPLE } from '../apps/game/expedition/content/inner-city/people.ts';
import { conversationContext } from '../apps/game/expedition/narrative/prompt.ts';
import { conversationScene } from '../apps/game/expedition/narrative/scene.ts';

function rescued() {
    const campaign = createCampaign('city-test', 71, 'blade', 'traveler', traveler);
    campaign.facts.push('briefed', 'crossroads_cleared', 'captives_released', 'anian_returned', 'kouzi_returned', 'captives_arrived', 'warden_defeated', 'supplies_secured');
    campaign.people.anian = personAt({ scene: 'camp', anchor: 'anian' });
    campaign.people.kouzi = personAt({ scene: 'camp', anchor: 'kouzi' });
    return campaign;
}
function at(campaign, scene, anchor) {
    campaign.location.scene = scene; campaign.location.position = { ...COURTYARD[scene].anchors[anchor] };
    if (!campaign.location.visited.includes(scene)) { campaign.location.visited.push(scene); }
}
function valid(campaign) { validateExpedition({ ...emptyExpedition(), active: campaign }); }

test('public entry continues the same journey without affection or a required final conversation', () => {
    const c = rescued(); const identity = structuredClone(c.traveler), relations = structuredClone(c.relationships);
    at(c, 'hall', 'south_street');
    advanceCampaign(c, { type: 'interact', id: 'south_street' });
    assert.equal(c.location.scene, 'south_street'); assert.equal(c.chapter, 'inner_city');
    assert.deepEqual(c.traveler, identity); assert.deepEqual(c.relationships, relations);
    assert.ok(c.rewards.city_arrival); assert.ok(c.facts.includes('chapter_completed')); valid(c);
    const reward = structuredClone(c.rewards.city_arrival);
    at(c, 'south_street', 'hall'); advanceCampaign(c, { type: 'interact', id: 'hall' });
    at(c, 'hall', 'south_street'); advanceCampaign(c, { type: 'interact', id: 'south_street' });
    assert.deepEqual(c.rewards.city_arrival, reward); valid(c);
});

test('new streets and rooms have reachable doors, correctly resolved districts, and matching return anchors', () => {
    const facts = new Set(Object.keys(FACT_COPY));
    for (const id of [...Object.keys(CITY_SCENES), ...Object.keys(CITY_ROOMS)]) {
        const scene = COURTYARD[id], space = sceneSpace(scene, facts), from = scene.anchors[scene.exits[0].anchor];
        for (const exit of scene.exits) {
            assert.ok(COURTYARD[exit.to].anchors[exit.arrival], `${id}/${exit.id} arrival`);
            assert.notEqual(findWorldPath(space, from, scene.anchors[exit.anchor], .34), null, `${id}/${exit.id} route`);
        }
        for (const item of scene.objects) { assert.notEqual(findWorldPath(space, from, scene.anchors[item.anchor], .34), null, `${id}/${item.id} route`); }
    }
    assert.equal(districtScene('wen_house'), 'south_street');
    assert.equal(districtScene('transfer_office'), 'workshop_street');
    assert.equal(districtScene('sanniang_room'), 'camp');
});

test('all four invitations remain independent, wait for acknowledgement, and can be regenerated without effects', () => {
    const choices = ['visit_wen', 'explore_deep_route', 'trace_missing_name', 'review_gate_book'];
    const c = rescued();
    for (const [index, thread] of CITY_THREADS.entries()) {
        c.relationships[thread.person] = { affection: 81, highestBand: 4 };
        c.location.position = { ...c.people[thread.person].position };
        assert.ok(availableChoices(c, thread.person).includes(choices[index]));
        const input = { actionId: `invite-${index}`, person: thread.person, text: '好，一起去。' };
        const reply = { kind: 'dialogue', reply: '我收起桌上的纸。「一起走吧。」', action: choices[index], affection: 0 };
        applyReply(c, input, reply);
        assert.equal(c.facts.includes(thread.accepted), false); assert.equal(pendingEnding(c), thread.person); valid(c);
        const rewind = prepareRegeneration(c, thread.person, input.actionId);
        assert.equal(pendingEnding(rewind), null); assert.equal(rewind.facts.includes(thread.accepted), false); valid(rewind);
        advanceCampaign(c, { type: 'accept_reply' });
        assert.ok(c.facts.includes(thread.accepted)); assert.equal(c.people[thread.person].mode, 'follow'); valid(c);
        c.relationships[thread.person].affection = 10;
    }
    assert.equal(cityThreads(c).length, 4); assert.ok(cityThreads(c).every(t => t.accepted));
});

test('investigation changes only through real nearby objects and grants one plan cache', () => {
    const c = rescued(); at(c, 'hall', 'south_street'); advanceCampaign(c, { type: 'interact', id: 'south_street' });
    assert.throws(() => advanceCampaign(c, { type: 'interact', id: 'heat_notice' }));
    at(c, 'south_street', 'notice'); advanceCampaign(c, { type: 'interact', id: 'heat_notice' });
    assert.equal(cityProgress(c).phase, 'investigate');
    at(c, 'workshop_street', 'pipes'); advanceCampaign(c, { type: 'interact', id: 'pipe_receipt' });
    at(c, 'heat_station', 'plan'); advanceCampaign(c, { type: 'interact', id: 'return_plan' });
    const reward = structuredClone(c.rewards.return_plan); assert.ok(reward);
    advanceCampaign(c, { type: 'interact', id: 'return_plan' }); assert.deepEqual(c.rewards.return_plan, reward); valid(c);
    assert.equal(cityProgress(c).phase, 'gallery');
});

test('each new encounter starts with a serializable checkpoint and a stable full-health retry', () => {
    for (const scene of ['pipe_gallery', 'sluice_bridge', 'main_valve', 'coal_store']) {
        const c = rescued(); c.chapter = 'inner_city'; at(c, scene, 'encounter');
        tickCampaign(c, { move: 0, dash: false, skill: false });
        assert.equal(c.phase, 'battle'); assert.equal(c.engagement.id, scene); valid(c);
        const enemies = structuredClone(c.battle.enemies);
        c.battle.player.hp = 0; c.hp = 0; c.phase = 'lost'; c.battle.status = 'lost';
        advanceCampaign(c, { type: 'retry' });
        assert.equal(c.hp, 100); assert.deepEqual(c.battle.enemies, enemies); valid(c);
    }
});

test('the retained V7 journey keeps its real history, memory, clothing delta, affection and relics', async () => {
    const raw = JSON.parse(await readFile(new URL('./fixtures/expedition-v7.json', import.meta.url), 'utf8'));
    const parsed = EXPEDITION_PARTITION.parse(raw);
    assert.equal(parsed.ok, true);
    for (const key of ['relationships', 'collection', 'equipped']) { assert.deepEqual(parsed.value.active[key], raw.active[key]); }
    for (const key of ['conversations', 'memories', 'knowledge']) {
        for (const [person, value] of Object.entries(raw.active[key])) { assert.deepEqual(parsed.value.active[key][person], value); }
        for (const person of ['wenshoutong', 'chenhe', 'qinzhi', 'liangyoufang', 'chengtiesheng']) { assert.deepEqual(parsed.value.active[key][person], key === 'memories' ? null : []); }
    }
    assert.equal(raw.formatVersion, 7); assert.deepEqual(EXPEDITION_PARTITION.parse(parsed.value).value, parsed.value);
});

test('private scenes wait for their actual parties without hiding the object or inventing witnesses', () => {
    for (const [scene, anchor, id, person, prerequisites] of [
        ['wen_house', 'table', 'wen_table', 'sanniang', ['wen_visit_agreed']],
        ['deep_waterway', 'receipt', 'deep_receipt', 'kouzi', ['deep_route_agreed']],
        ['workers_lodging', 'bunk', 'worker_bunk', 'anian', ['missing_name_agreed']],
        ['transfer_office', 'register', 'transfer_record', 'anian', ['worker_found']],
        ['audit_office', 'register', 'gate_cases', 'laobai', ['gate_book_agreed']],
    ]) {
        const c = rescued(); c.chapter = 'inner_city'; c.facts.push(...prerequisites); at(c, scene, anchor);
        const spec = CITY_PASSAGES[id];
        assert.equal(cityPassage(c, id).ready, false);
        advanceCampaign(c, { type: 'interact', id }); assert.equal(c.facts.includes(spec.fact), false);
        c.people[person] = personAt({ scene, anchor: COURTYARD[scene].exits[0].anchor });
        const waiting = structuredClone(c.people[person]);
        assert.equal(cityPassage(c, id).ready, false);
        advanceCampaign(c, { type: 'interact', id });
        assert.equal(c.facts.includes(spec.fact), false);
        assert.equal(c.knowledge[person].includes(spec.fact), false);
        assert.deepEqual(c.people[person], waiting);
        c.people[person] = personAt({ scene, anchor });
        assert.equal(cityPassage(c, id).ready, true);
        advanceCampaign(c, { type: 'interact', id }); assert.ok(c.facts.includes(spec.fact));
        for (const [witness, known] of Object.entries(c.knowledge)) { assert.equal(known.includes(spec.fact), spec.witnesses.includes(witness)); }
        c.people[person] = personAt({ scene: 'camp', anchor: person === 'sanniang' ? 'clinic' : person === 'laobai' ? 'guard' : person });
        assert.equal(cityPassage(c, id).ready, true); valid(c);
    }
});

function choose(c, person, id) {
    assert.ok(availableChoices(c, person).includes(id), `${person}/${id}`);
    applyReply(c, { actionId: `choice-${id}`, person, text: '就按我们谈妥的办。' }, { kind: 'dialogue', reply: '我点头，将纸推向桌前。', action: id, affection: null });
    assert.equal(pendingEnding(c), person); valid(c);
    advanceCampaign(c, { type: 'accept_reply' }); valid(c);
}

test('a nearby companion behind the bridge railing does not perform a shared scene through it', () => {
    const c = rescued(); c.facts.push('anian_street_shared'); at(c, 'workshop_street', 'echo');
    c.location.position = { x: 4.2, y: 30.35 };
    c.people.anian = personAt({ scene: 'workshop_street', anchor: 'echo' });
    c.people.anian.position = { x: 4.2, y: 28.65 };
    const space = sceneSpace(COURTYARD.workshop_street, new Set(c.facts));
    for (const point of [c.location.position, c.people.anian.position]) { assert.ok(canStandInWorld(space, point, RULES.playerRadius)); }
    assert.ok(Math.hypot(c.location.position.x - c.people.anian.position.x, c.location.position.y - c.people.anian.position.y) < INTERACTION_REACH);
    assert.equal(cityPassage(c, 'anian_bridge').ready, false);
    advanceCampaign(c, { type: 'interact', id: 'anian_bridge' });
    assert.equal(c.facts.includes('anian_walk_finished'), false);
    assert.equal(c.knowledge.anian.includes('anian_walk_finished'), false);
    c.people.anian.position = { ...c.location.position };
    advanceCampaign(c, { type: 'interact', id: 'anian_bridge' });
    assert.ok(c.knowledge.anian.includes('anian_walk_finished'));
});

test('Wen can offer terms without deciding Sanniang’s consent; confirmation, replacement and private knowledge stay separate', () => {
    for (const [offer, ending, rejected] of [['offer_wen_release', 'end_wen_marriage', 'agree_wen_independence'], ['offer_wen_independence', 'agree_wen_independence', 'end_wen_marriage']]) {
        const c = rescued(); c.chapter = 'inner_city'; c.facts.push('wen_visit_agreed'); at(c, 'wen_house', 'table');
        c.people.sanniang = personAt({ scene: 'wen_house', anchor: 'table' });
        advanceCampaign(c, { type: 'interact', id: 'wen_table' });
        assert.equal(availableChoices(c, 'sanniang').includes(ending), false);
        at(c, 'wen_house', 'host');
        applyReply(c, { actionId: 'offer', person: 'wenshoutong', text: '你自己的意思呢？' }, { kind: 'dialogue', reply: '我放下茶杯。', action: offer, affection: null });
        assert.equal(pendingEnding(c), 'wenshoutong'); valid(c);
        const restored = prepareRegeneration(c, 'wenshoutong', 'offer'); valid(restored);
        assert.equal(availableChoices(restored, 'sanniang').includes(ending), false);
        advanceCampaign(c, { type: 'accept_reply' });
        at(c, 'wen_house', 'table'); choose(c, 'sanniang', ending);
        assert.equal(availableChoices(c, 'sanniang').includes(rejected), false);
        const result = ending === 'end_wen_marriage' ? 'wen_marriage_ended' : 'wen_independence_agreed';
        assert.ok(c.knowledge.wenshoutong.includes(result)); assert.equal(c.knowledge.laobai.includes(result), false);
        assert.ok(citySituation(c, 'sanniang').some(entry => entry.id === result));
        assert.equal(citySituation(c, 'laobai').some(entry => entry.id === result), false);
        assert.equal(cityPassage(c, 'wen_table').ready, true);
    }
});

test('worker correction follows the evidence without requiring Anian to confess first', () => {
    const c = rescued(); c.chapter = 'inner_city'; c.facts.push('missing_name_agreed', 'worker_found'); at(c, 'transfer_office', 'register');
    c.people.anian = personAt({ scene: 'transfer_office', anchor: 'register' });
    advanceCampaign(c, { type: 'interact', id: 'transfer_record' });
    assert.ok(availableChoices(c, 'anian').includes('acknowledge_worker_error'));
    assert.equal(availableChoices(c, 'anian').includes('correct_worker_record'), false);
    at(c, 'transfer_office', 'clerk'); choose(c, 'qinzhi', 'correct_worker_record');
    assert.equal(c.facts.includes('worker_error_acknowledged'), false);
    assert.ok(c.knowledge.anian.includes('worker_record_corrected')); assert.equal(c.knowledge.chenhe.includes('worker_error_acknowledged'), false);
    assert.equal(citySituation(c, 'chenhe').some(entry => entry.id === 'worker_record_corrected'), false);
    at(c, 'workers_lodging', 'bunk'); c.people.anian = personAt({ scene: 'workers_lodging', anchor: 'bunk' });
    advanceCampaign(c, { type: 'interact', id: 'worker_result' });
    assert.ok(citySituation(c, 'chenhe').some(entry => entry.id === 'worker_record_corrected'));
    assert.equal(c.relationships.anian.affection, 0);
});

test('private agreement, public departure and legal settlement are distinct, reversible replies with scoped knowledge', () => {
    const c = rescued(); c.chapter = 'inner_city'; c.facts.push('wen_visit_agreed', 'wen_terms_heard');
    at(c, 'south_inn', 'south'); c.people.sanniang = personAt({ scene: 'south_inn', anchor: 'south' });
    choose(c, 'sanniang', 'keep_wen_private');
    assert.ok(c.knowledge.sanniang.includes('wen_private_agreed'));
    assert.equal(c.knowledge.wenshoutong.includes('wen_private_agreed'), false);
    assert.equal(c.facts.includes('wen_marriage_ended'), false);
    assert.equal(cityThreads(c).find(t => t.person === 'sanniang').resolved, true);

    at(c, 'wen_house', 'table'); c.people.sanniang = personAt({ scene: 'wen_house', anchor: 'table' });
    applyReply(c, { actionId: 'leave-together', person: 'sanniang', text: '跟我走。' },
        { kind: 'dialogue', reply: '我站到你身边。', action: 'leave_wen_together', affection: 1 });
    assert.equal(c.facts.includes('wen_departure_declared'), false);
    const before = prepareRegeneration(c, 'sanniang', 'leave-together');
    assert.equal(before.facts.includes('wen_departure_declared'), false);
    assert.ok(before.facts.includes('wen_private_agreed'));
    advanceCampaign(c, { type: 'accept_reply' }); valid(c);
    assert.equal(c.location.scene, 'wen_house');
    assert.equal(c.people.sanniang.mode, 'follow');
    assert.equal(c.facts.includes('wen_release_offered'), false);
    assert.equal(c.facts.includes('wen_marriage_ended'), false);
    assert.ok(c.knowledge.wenshoutong.includes('wen_departure_declared'));
    assert.equal(c.knowledge.wenshoutong.includes('wen_private_agreed'), false);
    assert.deepEqual(citySituation(c, 'sanniang').filter(e => e.id.startsWith('wen_')).map(e => e.id), ['wen_departure_declared']);

    at(c, 'wen_house', 'host'); choose(c, 'wenshoutong', 'offer_wen_release');
    at(c, 'wen_house', 'table'); choose(c, 'sanniang', 'end_wen_marriage');
    assert.deepEqual(citySituation(c, 'sanniang').filter(e => e.id.startsWith('wen_')).map(e => e.id), ['wen_marriage_ended']);
    assert.equal(availableChoices(c, 'sanniang').includes('leave_wen_together'), false);
    assert.ok(c.facts.includes('wen_private_agreed'));
    assert.ok(c.facts.includes('wen_departure_declared'));
});

test('a clerk can correct proven records while Anian is elsewhere, without inventing her presence', () => {
    const c = rescued(); c.chapter = 'inner_city'; c.facts.push('missing_name_agreed', 'worker_found', 'worker_record_checked');
    at(c, 'transfer_office', 'clerk');
    choose(c, 'qinzhi', 'correct_worker_record');
    assert.ok(c.knowledge.qinzhi.includes('worker_record_corrected'));
    assert.equal(c.knowledge.anian.includes('worker_record_corrected'), false);
    assert.equal(c.knowledge.chenhe.includes('worker_record_corrected'), false);
});

test('shared city moments need the companion on site and only record a first-hand event once', () => {
    for (const [scene, anchor, passage, person, requirements] of [
        ['south_street', 'stroll', 'anian_street', 'anian', ['missing_name_agreed']],
        ['workshop_street', 'echo', 'anian_bridge', 'anian', ['missing_name_agreed', 'anian_street_shared']],
        ['south_street', 'eaves', 'wen_walk', 'sanniang', ['wen_visit_agreed', 'wen_terms_heard']],
        ['south_street', 'tea', 'gate_tea', 'laobai', ['gate_book_agreed']],
        ['deep_waterway', 'winch', 'deep_gate', 'kouzi', ['deep_route_agreed']],
    ]) {
        const c = rescued(); c.chapter = 'inner_city'; c.facts.push(...requirements); at(c, scene, anchor);
        const fact = CITY_PASSAGES[passage].fact;
        advanceCampaign(c, { type: 'interact', id: passage });
        assert.equal(c.facts.includes(fact), false);
        c.people[person] = personAt({ scene, anchor });
        advanceCampaign(c, { type: 'interact', id: passage });
        assert.ok(c.knowledge[person].includes(fact));
        assert.equal(c.relationships[person].affection, 0);
        const knowledge = structuredClone(c.knowledge);
        c.people[person] = personAt({ scene: 'camp', anchor: 'rest' });
        // A replay is a record, not another occurrence in front of new witnesses.
        if (passage !== 'gate_tea') { advanceCampaign(c, { type: 'interact', id: passage }); }
        assert.deepEqual(c.knowledge, knowledge);
        assert.equal(c.facts.filter(id => id === fact).length, 1); valid(c);
    }
});

test('the valve trial is a player operation, knows only its witnesses and does not restore heat or duplicate growth', () => {
    const c = rescued(); c.chapter = 'inner_city'; c.facts.push('gallery_cleared'); at(c, 'pipe_gallery', 'trial');
    c.people.kouzi = personAt({ scene: 'pipe_gallery', anchor: 'trial' });
    const rewards = structuredClone(c.rewards);
    const before = structuredClone(c);
    assert.ok(cityPassage(c, 'return_trial').operation);
    assert.deepEqual(c, before, 'looking at a mechanism must not operate it');
    assert.equal(conversationScene(c, 'kouzi').playerMechanisms.find(item => item.id === 'return_trial').completed, false);
    advanceCampaign(c, { type: 'interact', id: 'return_trial' });
    assert.equal(cityPassage(c, 'return_trial').operation, null);
    assert.equal(conversationScene(c, 'kouzi').playerMechanisms.find(item => item.id === 'return_trial').completed, true);
    assert.ok(c.knowledge.kouzi.includes('return_flow_tested'));
    assert.equal(c.knowledge.sanniang.includes('return_flow_tested'), false);
    assert.equal(c.facts.includes('heat_restored'), false);
    assert.deepEqual(c.rewards, rewards);
    c.people.sanniang = personAt({ scene: 'pipe_gallery', anchor: 'trial' });
    advanceCampaign(c, { type: 'interact', id: 'return_trial' });
    assert.equal(c.knowledge.sanniang.includes('return_flow_tested'), false);
    valid(c);
});

test('a private route decision retains its coda until the companion actually shares it', () => {
    for (const [person, accepted, outcome, coda, scene, anchor, object] of [
        ['sanniang', 'wen_visit_agreed', 'wen_marriage_ended', 'wen_walk_shared', 'south_street', 'eaves', 'wen_walk'],
        ['anian', 'missing_name_agreed', 'anian_walk_finished', 'anian_home_shared', 'camp', 'registry', 'anian_return'],
        ['laobai', 'gate_book_agreed', 'gate_review_agreed', 'gate_home_shared', 'south_street', 'tea', 'gate_home_review'],
    ]) {
        const c = rescued(); c.facts.push(accepted, outcome, 'wen_terms_heard'); at(c, scene, anchor);
        assert.equal(cityThreads(c).find(thread => thread.person === person).resolved, true);
        assert.notEqual(cityThreads(c).find(thread => thread.person === person).task, null);
        c.people[person] = personAt({ scene, anchor });
        advanceCampaign(c, { type: 'interact', id: object });
        assert.ok(c.knowledge[person].includes(coda));
        assert.equal(cityThreads(c).find(thread => thread.person === person).task, null);
        const knowledge = structuredClone(c.knowledge);
        advanceCampaign(c, { type: 'interact', id: object });
        assert.deepEqual(c.knowledge, knowledge); valid(c);
    }
});

test('opening the shared watergate, not merely discovering it, connects the two sides and enables its disposition', () => {
    const c = rescued(); c.facts.push('deep_route_agreed', 'deep_trade_found'); at(c, 'deep_waterway', 'winch');
    c.people.kouzi = personAt({ scene: 'deep_waterway', anchor: 'kouzi_home' });
    assert.equal(cityPassage(c, 'deep_gate').operation, null);
    advanceCampaign(c, { type: 'interact', id: 'deep_gate' });
    assert.equal(c.facts.includes('deep_gate_opened'), false);
    assert.equal(c.knowledge.kouzi.includes('deep_gate_opened'), false);
    c.people.kouzi = personAt({ scene: 'deep_waterway', anchor: 'winch' });
    assert.equal(availableChoices(c, 'kouzi').includes('share_deep_route'), false);
    assert.ok(cityPassage(c, 'deep_gate').operation);
    assert.equal(c.facts.includes('deep_gate_opened'), false);
    advanceCampaign(c, { type: 'interact', id: 'deep_gate' });
    assert.ok(availableChoices(c, 'kouzi').includes('share_deep_route'));
    assert.equal(cityPassage(c, 'deep_gate').operation, null);
    assert.ok(c.knowledge.kouzi.includes('deep_gate_opened')); valid(c);
});

test('accepted personal context carries no journal walkthrough and no unexperienced outing', () => {
    const c = rescued(); c.facts.push('missing_name_agreed');
    const context = conversationContext(c, 'anian');
    assert.equal(context.personalThread.accepted, true);
    assert.equal(context.personalThread.task, undefined);
    assert.equal(context.personalThread.invitation, undefined);
    assert.equal(c.knowledge.anian.includes('anian_walk_finished'), false);
});

test('late personal routes coexist with restored heat and do not reveal a shared quest walkthrough to bystanders', () => {
    const c = rescued(); c.chapter = 'inner_city'; c.facts.push('heat_restored');
    for (const person of ['sanniang', 'kouzi', 'anian', 'laobai']) { c.relationships[person] = { affection: 81, highestBand: 4 }; }
    assert.equal(cityThreads(c).length, 4); assert.equal(cityProgress(c).phase, 'restored');
    for (const person of Object.keys(STORY_PEOPLE)) {
        const context = conversationContext(c, person);
        assert.equal(context.chapter.task, undefined); assert.equal(context.personalThread, null);
        assert.deepEqual(context.chapter.situation.map(fact => fact.id), ['heat_restored']);
    }
    const rewards = structuredClone(c.rewards);
    at(c, 'camp', 'rest'); advanceCampaign(c, { type: 'interact', id: 'camp_heat' });
    assert.equal(cityProgress(c).phase, 'home'); assert.deepEqual(c.rewards, rewards); valid(c);
});

test('both route and gate-book endings stay exclusive and can settle after heat without repeating the public crisis', () => {
    for (const [person, scene, anchor, prerequisites, options, results] of [
        ['kouzi', 'deep_waterway', 'receipt', ['deep_route_agreed', 'deep_gate_opened', 'deep_trade_found'], ['keep_deep_route', 'share_deep_route'], ['deep_route_private', 'deep_route_shared']],
        ['laobai', 'audit_office', 'register', ['gate_book_agreed', 'gate_cases_heard', 'gate_allowed_seen', 'gate_refused_seen'], ['take_gate_responsibility', 'request_gate_review'], ['gate_responsibility_taken', 'gate_review_agreed']],
    ]) for (const index of [0, 1]) {
        const c = rescued(); c.chapter = 'inner_city'; c.facts.push('heat_restored', ...prerequisites); at(c, scene, anchor);
        c.people[person] = personAt({ scene, anchor });
        c.relationships[person] = { affection: 12, highestBand: 4 };
        const rewards = structuredClone(c.rewards);
        choose(c, person, options[index]);
        assert.ok(c.facts.includes(results[index])); assert.equal(c.facts.includes(results[1 - index]), false);
        assert.equal(availableChoices(c, person).includes(options[1 - index]), false);
        assert.ok(c.facts.includes('heat_restored')); assert.deepEqual(c.rewards, rewards);
        assert.equal(cityThreads(c).find(t => t.person === person).resolved, true); valid(c);
    }
});
