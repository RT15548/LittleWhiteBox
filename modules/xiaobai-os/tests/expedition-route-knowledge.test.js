import assert from 'node:assert/strict';
import test from 'node:test';
import { createCampaign, advanceCampaign, recordFact } from '../apps/game/expedition/campaign/rules.ts';
import { emptyExpedition } from '../apps/game/expedition/domain.ts';
import { validateExpedition } from '../apps/game/expedition/partition.ts';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { startWorld } from '../apps/game/expedition/world/exploration.ts';
import { movePerson, tickPeople } from '../apps/game/expedition/world/people.ts';
import { conversationContext } from '../apps/game/expedition/narrative/prompt.ts';

// Contracts: unknown private routes never cross the model/action boundary (hidden story disclosure);
// sharing the city branch leaves the home branch private (hidden story disclosure);
// actual followers learn the route across save/reload, bystanders do not (lost or invented knowledge).
function campaign() {
    const c = createCampaign('route-knowledge', 7, 'blade', 'traveler', { name: '旅人', gender: 'male', appearanceAge: 'twenties' });
    for (const fact of ['briefed', 'crossroads_cleared', 'patrol_cleared', 'alarm_silenced', 'waterway_cleared',
        'sluice_opened', 'captives_released', 'postern_opened', 'captives_arrived', 'supplies_secured', 'warden_defeated',
        'deep_route_agreed', 'deep_gate_opened', 'deep_trade_found']) { recordFact(c, fact, ['kouzi']); }
    return c;
}
function at(c, person, scene, anchor) {
    Object.assign(c.people[person], { scene, position: { ...COURTYARD[scene].anchors[anchor] }, mode: 'idle', destination: null });
}
function privateStep(step) {
    return step.from === 'kouzi_home' && step.to === 'deep_waterway' || step.from === 'deep_waterway' && step.to === 'kouzi_home';
}

test('private agreement never reveals a route, local exit or movement action to an uninformed NPC', () => {
    const c = campaign();
    recordFact(c, 'deep_route_private', ['kouzi']);
    at(c, 'sanniang', 'kouzi_home', 'settle');
    const context = conversationContext(c, 'sanniang');
    assert.equal(context.map.some(place => place.id === 'deep_waterway'), false);
    assert.equal(context.map.some(place => place.route?.some(step => step.from === 'deep_waterway' || step.to === 'deep_waterway')), false);
    assert.equal(context.exits.some(exit => exit.to === 'deep_waterway'), false);
    assert.equal(context.room.exits.length, 1);
    assert.equal(context.actions.includes('go:deep_waterway'), false);
    assert.throws(() => movePerson(c, 'sanniang', 'go:deep_waterway'));
    assert.equal(conversationContext(c, 'kouzi').actions.includes('go:deep_waterway'), true);

    movePerson(c, 'sanniang', 'go:south_street');
    let passedDeep = false;
    for (let tick = 0; tick < 5000 && c.people.sanniang.mode === 'travel'; tick++) {
        tickPeople(c); passedDeep ||= c.people.sanniang.scene === 'deep_waterway';
    }
    assert.equal(c.people.sanniang.scene, 'south_street');
    assert.equal(c.people.sanniang.mode, 'idle');
    assert.equal(passedDeep, false);
});

test('public city branch permits travel without revealing or using the private home shortcut', () => {
    const c = campaign();
    recordFact(c, 'deep_route_shared', ['kouzi']);
    at(c, 'sanniang', 'kouzi_home', 'settle');
    let context = conversationContext(c, 'sanniang');
    const waterway = context.map.find(place => place.id === 'deep_waterway');
    assert.equal(waterway.solo, true);
    assert.ok(waterway.route.length > 1);
    assert.equal(waterway.route.some(privateStep), false);
    assert.equal(context.exits.some(exit => exit.to === 'deep_waterway'), false);
    assert.equal(context.actions.includes('go:deep_waterway'), true);

    movePerson(c, 'sanniang', 'go:deep_waterway');
    let prior = c.people.sanniang.scene, usedPrivate = false;
    for (let tick = 0; tick < 5000 && c.people.sanniang.mode === 'travel'; tick++) {
        tickPeople(c); usedPrivate ||= privateStep({ from: prior, to: c.people.sanniang.scene }); prior = c.people.sanniang.scene;
    }
    assert.equal(c.people.sanniang.scene, 'deep_waterway');
    assert.equal(c.people.sanniang.mode, 'idle');
    assert.equal(usedPrivate, false);
    context = conversationContext(c, 'sanniang');
    assert.equal(context.exits.some(exit => exit.to === 'kouzi_home'), false);
    assert.equal(context.map.some(place => place.route?.some(privateStep)), false);
    assert.equal(c.knowledge.sanniang.includes('deep_route_walked'), false);
});

test('following through the private entrance records firsthand knowledge for travellers only and survives reload', () => {
    const c = campaign();
    c.location = startWorld(COURTYARD.kouzi_home, 'north');
    at(c, 'sanniang', 'kouzi_home', 'north');
    at(c, 'anian', 'kouzi_home', 'settle');
    movePerson(c, 'sanniang', 'follow');
    advanceCampaign(c, { type: 'interact', id: 'north' });
    assert.equal(c.people.sanniang.scene, 'deep_waterway');
    assert.equal(c.knowledge.sanniang.includes('deep_route_walked'), true);
    assert.equal(c.knowledge.anian.includes('deep_route_walked'), false);
    assert.equal(c.knowledge.laobai.includes('deep_route_walked'), false);
    advanceCampaign(c, { type: 'interact', id: 'kouzi_home' });
    const restored = JSON.parse(JSON.stringify({ ...emptyExpedition(), active: c }));
    validateExpedition(restored);
    const context = conversationContext(restored.active, 'sanniang');
    assert.equal(context.map.find(place => place.id === 'deep_waterway').route.some(privateStep), true);
    assert.equal(context.actions.includes('go:deep_waterway'), true);
    assert.equal(conversationContext(restored.active, 'anian').actions.includes('go:deep_waterway'), false);
    assert.equal(restored.active.facts.filter(fact => fact === 'deep_route_walked').length, 1);
});
