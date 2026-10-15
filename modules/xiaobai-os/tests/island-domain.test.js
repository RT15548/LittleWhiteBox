import assert from 'node:assert/strict';
import test from 'node:test';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { GARMENTS } from '../apps/game/island/clothing.ts';
import { LANDSCAPE, RULES } from '../apps/game/island/content.ts';
import { newJourney, isEnded } from '../apps/game/island/world.ts';
import { operate } from '../apps/game/island/operations.ts';
import { advance, awaitingDecision } from '../apps/game/island/clock.ts';
import { settleDeath } from '../apps/game/island/mortality.ts';
import { openScene, observe } from '../apps/game/island/scene.ts';
import { createSceneWork } from '../apps/game/island/scene-work.ts';
import { knownDeclarations, knownExperiences } from '../apps/game/island/experience.ts';
import { canTravel, itemPosition, perceives } from '../apps/game/island/space.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';
import { LATRINE_SCREEN } from '../apps/game/island/structure-shape.ts';
import { discover, discoveryIndex, knownPlaces } from '../apps/game/island/discovery.ts';

const square = (left, bottom, right, top) => [{ x: left, y: bottom }, { x: right, y: bottom }, { x: right, y: top }, { x: left, y: top }];
const land = { land: square(-1000, -1000, 1000, 1000), obstacles: [], sightScreens: [], soundScreens: [] };
const player = { kind: 'player' };
function world() {
    const w = newJourney('test-run');
    PERSON_IDS.forEach((id, i) => {
        w.people[id].position = { x: i * 100, y: 0 };
        if (id !== 'player') w.people[id].activity = { kind: 'rest', until: 3600 };
    });
    return w;
}
const gm = (w, actor) => ({ kind: 'gm', scene: openScene(w, actor, land) });
const op = (w, actor, operation) => operate(w, actor === 'player' ? player : gm(w, actor), actor, operation, land);
const speak = (w, actor, text) => op(w, actor, { kind: 'say', text });
const declarations = (w, observer) => knownDeclarations(w, observer).map(e => e.payload);

test('seven bodies and physical belongings start independently; the first clock waits for NPC decisions', () => {
    const w = newJourney('landing');
    assert.deepEqual(Object.keys(w.people), PERSON_IDS);
    const belongings = Object.entries(w.items), upperItems = new Map();
    for (const person of PERSON_IDS) {
        const worn = belongings.filter(([, item]) => item.location.kind === 'worn' && item.location.person === person);
        for (const slot of ['vest', 'upper', 'lower']) {
            const matches = worn.filter(([, item]) => GARMENTS[item.kind]?.slot === slot);
            assert.equal(matches.length, 1);
            assert.equal(matches[0][1].quantity, 1);
            if (slot === 'upper') upperItems.set(person, matches[0][0]);
        }
    }
    assert.equal(awaitingDecision(w).length, 6);
    const step = advance(w, 3600, LANDSCAPE);
    assert.equal(step.stop, 'decision'); assert.equal(step.elapsed, 0);
    assert.deepEqual(step.world, w);
    const changedId = upperItems.get('ye');
    const changed = operate(w, { kind: 'gm', scene: openScene(w, 'ye', LANDSCAPE) }, 'ye', { kind: 'unwear', item: changedId }, LANDSCAPE);
    assert.deepEqual(changed.items[changedId].location, { kind: 'carried', person: 'ye' });
    assert.equal(w.items[changedId].location.kind, 'worn');
    for (const [id, item] of belongings) if (id !== changedId) assert.deepEqual(changed.items[id], item);
});

test('GM cannot control the player, an absent NPC or a scene captured before an arrival', () => {
    const w = world(); w.people.lin.position = { x: 1, y: 0 };
    const scope = { kind: 'gm', scene: openScene(w, 'player', land) };
    assert.throws(() => operate(w, scope, 'player', { kind: 'say', text: 'x' }, land), { code: 'island_authority' });
    assert.throws(() => operate(w, scope, 'zhou', { kind: 'say', text: 'x' }, land), { code: 'island_authority' });
    assert.throws(() => operate(w, player, 'lin', { kind: 'say', text: 'x' }, land), { code: 'island_authority' });
    w.people.zhou.position = { x: 2, y: 0 };
    assert.throws(() => operate(w, scope, 'lin', { kind: 'say', text: 'x' }, land), { code: 'island_stale_scene' });
});

test('privacy accounts for people who can hear the NPC even when outside the player hearing radius', () => {
    const w = world(); w.people.lin.position = { x: 7, y: 0 }; w.people.zhou.position = { x: 14, y: 0 };
    const scope = openScene(w, 'player', land);
    assert.equal(scope.mode, 'group'); assert.deepEqual(scope.actors, ['lin']); assert.ok(scope.audience.includes('zhou'));
    const next = speak(w, 'player', 'first');
    assert.deepEqual(next.experiences[0].audience, ['player', 'lin']);
    const reply = speak(next, 'lin', 'second');
    assert.deepEqual(reply.experiences[1].audience, ['player', 'lin', 'zhou']);
});

test('foliage sight occlusion is not automatically a sound barrier', () => {
    const w = world(); w.people.lin.position = { x: 6, y: 0 };
    const screen = { ...land, sightScreens: [square(2, -2, 4, 2)] };
    assert.equal(perceives(w, 'player', w.people.lin.position, 'sight', screen), false);
    assert.equal(openScene(w, 'player', screen).mode, 'private');
});

test('a completed latrine screen hides the person and possessions, not its own surface or nearby speech', () => {
    const w = world();
    const site = { kind: 'latrine', position: { x: 0, y: 0 }, builder: 'player', workLeft: 1, water: null, fuelSeconds: 0, burning: false };
    w.structures.screen = site;
    w.people.lin.position = { x: 0, y: LATRINE_SCREEN.offset + 4 };
    assert.equal(observe(w, 'lin', land).people.some(p => p.id === 'player'), true);
    site.workLeft = 0;
    const view = observe(w, 'lin', land);
    assert.equal(view.people.some(p => p.id === 'player'), false);
    assert.equal(view.items.some(i => i.id === 'player-shirt'), false);
    assert.deepEqual(view.structures.map(s => s.id), ['screen']);
    assert.equal(perceives(w, 'lin', w.people.player.position, 'sound', land), true);
    discover(w, land, discoveryIndex(w));
    assert.ok(knownPlaces(w, 'lin').some(p => p.subject.id === 'screen'));
    w.people.lin.position = { x: 0, y: LATRINE_SCREEN.offset + .1 };
    assert.equal(perceives(w, 'lin', w.people.player.position, 'sight', land), false);
    w.people.lin.position = { x: LATRINE_SCREEN.halfWidth + 2, y: 0 };
    assert.equal(perceives(w, 'lin', w.people.player.position, 'sight', land), true);
    assert.equal(perceives(w, 'player', w.people.lin.position, 'sight', land), true);
});

test('the surface of a second structure does not bypass another latrine screen', () => {
    const w = world();
    w.structures.screen = { kind: 'latrine', position: { x: 0, y: 0 }, builder: 'player', workLeft: 0, water: null, fuelSeconds: 0, burning: false };
    w.structures.hearth = { kind: 'firepit', position: { x: 0, y: -2 }, builder: 'player', workLeft: 0, water: null, fuelSeconds: 0, burning: false };
    w.people.lin.position = { x: 0, y: LATRINE_SCREEN.offset + 4 };
    assert.deepEqual(observe(w, 'lin', land).structures.map(s => s.id), ['screen']);
});

test('statements do not create objects; entering a group does not change old audiences', () => {
    let w = world(); w.people.lin.position = { x: 1, y: 0 };
    const before = structuredClone(w.items);
    w = speak(w, 'player', '我有一把刀。');
    w.people.zhou.position = { x: 2, y: 0 };
    w = speak(w, 'lin', '我们再谈一谈。');
    assert.deepEqual(w.items, before);
    assert.deepEqual(w.experiences[0].audience, ['player', 'lin']);
    assert.deepEqual(knownExperiences(w, ['zhou']).map(e => e.sequence), [2]);
});

test('the scene memory excludes player-only knowledge and permits an NPC old experience from another location', () => {
    let w = world(); w.people.lin.position = { x: 1, y: 0 };
    w = speak(w, 'player', '只告诉林遥');
    w.people.lin.position = { x: 100, y: 0 }; w.people.zhou.position = { x: 1, y: 0 };
    const work = createSceneWork(w, 'player', land);
    assert.throws(() => work.read(1), { code: 'island_memory_unavailable' });
    assert.throws(() => work.read(999), { code: 'island_memory_unavailable' });
    assert.deepEqual(work.browse(0, 10).entries, []);
    const elsewhere = createSceneWork(w, 'lin', land);
    assert.equal(elsewhere.read(1).payload.actor, 'player');
});

test('retelling adds one attributed statement without granting the original private conversation', () => {
    let w = world(); w.people.lin.position = { x: 1, y: 0 };
    w = speak(w, 'player', '藏身地点和另一个秘密');
    w.people.player.position = { x: -100, y: 0 }; w.people.zhou.position = { x: 2, y: 0 };
    w = speak(w, 'lin', '他说自己另找了住处。');
    const known = knownExperiences(w, ['zhou']);
    assert.deepEqual(known.map(e => e.sequence), [2]); assert.equal(known[0].payload.actor, 'lin');
});

test('a private change of allegiance is not a relocation or a global rewrite of expectations', () => {
    let w = world(); w.people.lin.position = { x: 1, y: 0 }; w.people.zhou.position = { x: 2, y: 0 };
    w = op(w, 'lin', { kind: 'declare', text: '我支持周岑。', choice: { kind: 'support', person: 'zhou', stance: 'with' } });
    w.people.zhou.position = { x: 100, y: 0 };
    const position = structuredClone(w.people.lin.position);
    w = op(w, 'lin', { kind: 'declare', text: '我不再参与他的安排。', choice: { kind: 'support', person: 'zhou', stance: 'neutral' } });
    w = op(w, 'lin', { kind: 'declare', text: '我准备住到里面。', choice: { kind: 'residence', position: { x: 50, y: 20 } } });
    assert.equal(declarations(w, 'zhou')[0].choice.stance, 'with');
    assert.equal(declarations(w, 'lin')[0].choice.stance, 'neutral');
    assert.deepEqual(w.people.lin.position, position);
    assert.equal(declarations(w, 'lin').length, 2);
    assert.equal(declarations(w, 'lin').some(p => p.actor === 'player'), false);
});

test('separate locations advance together and interrupt at the earliest completed NPC activity', () => {
    let w = world(); w.people.lin.activity = null;
    w = op(w, 'lin', { kind: 'travel', route: [{ x: 105, y: 0 }] });
    w = op(w, 'player', { kind: 'travel', route: [{ x: 50, y: 0 }] });
    const next = advance(w, 60, land);
    assert.equal(next.elapsed, 5); assert.equal(next.stop, 'decision'); assert.deepEqual(next.due, ['lin']);
    assert.deepEqual(next.world.people.player.position, { x: 5, y: 0 });
    assert.deepEqual(next.world.people.lin.position, { x: 105, y: 0 });
    assert.deepEqual(w.people.player.position, { x: 0, y: 0 });
});

test('time stops on a new encounter rather than finishing a long path through the conversation', () => {
    let w = world(); w.people.lin.position = { x: 50, y: 0 };
    w = op(w, 'player', { kind: 'travel', route: [{ x: 60, y: 0 }] });
    const next = advance(w, 60, land);
    assert.equal(next.stop, 'contact'); assert.equal(next.elapsed, 15);
    assert.equal(next.world.people.player.activity.kind, 'travel');
});

test('approaching a gathering pauses once, preserves individual sightings, and still pauses for a separate person', () => {
    let w = world();
    for (const [i, id] of ['lin', 'zhou', 'xu'].entries()) w.people[id].position = { x: 50 + i * 2, y: 0 };
    w.people.chen.position = { x: 120, y: 0 };
    w = op(w, 'player', { kind: 'travel', route: [{ x: 130, y: 0 }] });
    const pauses = [];
    for (let boundary = 0; boundary < 20 && w.people.player.activity; boundary++) {
        for (const id of awaitingDecision(w)) w = op(w, id, { kind: 'intend', text: '继续手头的事。' });
        const step = advance(w, 200, land); w = step.world;
        if (step.stop === 'contact') pauses.push(w.people.player.position.x);
    }
    assert.deepEqual(pauses, [15, 85]); assert.equal(w.people.player.activity, null);
    const sightings = knownExperiences(w, ['player']).filter(e => e.payload.kind === 'encounter' && e.payload.actor === 'player');
    assert.deepEqual(sightings.map(e => e.payload.subject), ['lin', 'zhou', 'xu', 'chen']);
    assert.ok(sightings[0].at < sightings[1].at && sightings[1].at < sightings[2].at);
});

test('cancelling keeps the distance already travelled and does not move other people into a party', () => {
    let w = world(); const lin = structuredClone(w.people.lin.position);
    w = op(w, 'player', { kind: 'travel', route: [{ x: 10, y: 0 }] });
    w = advance(w, 3, land).world;
    w = op(w, 'player', { kind: 'cancel' });
    assert.equal(w.clock, 3); assert.deepEqual(w.people.player.position, { x: 3, y: 0 });
    assert.deepEqual(w.people.lin.position, lin); assert.equal(w.people.player.activity, null);
});

test('a route cannot cross water in a concave shoreline or jump through a physical obstacle', () => {
    const concave = { ...land, land: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 },
        { x: 6, y: 10 }, { x: 6, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 10 }, { x: 0, y: 10 }] };
    assert.equal(canTravel({ x: 2, y: 8 }, { x: 8, y: 8 }, concave), false);
    assert.equal(canTravel({ x: 2, y: 10 }, { x: 8, y: 10 }, concave), false);
    assert.equal(canTravel({ x: 2, y: 4 }, { x: 8, y: 4 }, concave), true);
    const blocked = { ...land, obstacles: [square(2, -2, 4, 2)] };
    assert.equal(canTravel({ x: 0, y: 0 }, { x: 6, y: 0 }, blocked), false);
    const w = world(), before = structuredClone(w);
    assert.throws(() => operate(w, player, 'player', { kind: 'travel', route: [{ x: 6, y: 0 }] }, blocked), { code: 'island_blocked' });
    assert.deepEqual(w, before);
});

test('ground objects can change hands without faction permission and cannot be taken remotely', () => {
    let w = world(); w.people.lin.position = { x: 1, y: 0 }; w.people.lin.activity = null;
    w = op(w, 'player', { kind: 'drop', item: 'player-lifejacket' });
    w = op(w, 'lin', { kind: 'take', item: 'player-lifejacket' });
    assert.equal(w.items['player-lifejacket'].location.kind, 'ground');
    w = advance(w, RULES.takeSeconds, land).world;
    assert.deepEqual(w.items['player-lifejacket'].location, { kind: 'carried', person: 'lin' });
    assert.throws(() => op(w, 'zhou', { kind: 'take', item: 'player-lifejacket' }), { code: 'island_occupied' });
    w.people.zhou.activity = null;
    assert.throws(() => op(w, 'zhou', { kind: 'take', item: 'player-lifejacket' }), { code: 'island_unavailable' });
    assert.throws(() => op(w, 'zhou', { kind: 'take', item: 'constructor' }), { code: 'island_unavailable' });
});

test('simultaneous taking is contested independently of tool submission order, without a duplicate or a remote reservation', () => {
    const results = [];
    for (const order of [['lin', 'zhou'], ['zhou', 'lin']]) {
        let w = world();
        w.people.lin.position = { x: -1, y: 0 }; w.people.zhou.position = { x: 1, y: 0 };
        w.people.lin.activity = null; w.people.zhou.activity = null;
        w = op(w, 'player', { kind: 'drop', item: 'player-lifejacket' });
        for (const id of order) w = op(w, id, { kind: 'take', item: 'player-lifejacket' });
        assert.equal(w.items['player-lifejacket'].location.kind, 'ground');
        w = advance(w, RULES.takeSeconds, land).world;
        assert.equal(w.items['player-lifejacket'].location.kind, 'ground');
        assert.deepEqual(w.experiences.at(-1).payload, { kind: 'contested', actors: ['lin', 'zhou'], item: 'player-lifejacket' });
        // Submitted starts retain their actual order; physical resolution is simultaneous.
        results.push({ people: w.people, items: w.items, clock: w.clock, outcome: w.experiences.at(-1).payload });
    }
    assert.deepEqual(results[0], results[1]);
});

test('an offscreen encounter wakes active NPC judgement without cancelling work or pausing the player for their conversation', () => {
    let w = world();
    w.people.lin.position = { x: 100, y: 0 }; w.people.zhou.position = { x: 100 + RULES.sightMetres + 2, y: 0 };
    w.people.lin.activity = { kind: 'travel', route: [{ x: 140, y: 0 }] };
    const resting = structuredClone(w.people.zhou.activity);
    const step = advance(w, 100, land); w = step.world;
    assert.equal(step.stop, 'decision'); assert.ok(step.elapsed < 100);
    assert.ok(step.due.includes('lin')); assert.ok(step.due.includes('zhou'));
    assert.deepEqual(w.people.zhou.activity, resting);
    assert.equal(knownExperiences(w, ['player']).some(e => e.payload.kind === 'encounter'), false);
    assert.ok(awaitingDecision(structuredClone(w)).includes('zhou'));
    w = op(w, 'zhou', { kind: 'intend', text: '先继续休息，等他走近再询问。' });
    assert.equal(awaitingDecision(w).includes('zhou'), false);
    assert.deepEqual(w.people.zhou.activity, resting);
    assert.equal(observe(w, 'zhou', land).intention.payload.kind, 'intention');
    assert.equal(observe(w, 'lin', land).intention, null);
    assert.equal(knownExperiences(w, ['lin']).some(e => e.payload.kind === 'intention'), false);
    w = op(w, 'lin', { kind: 'intend', text: '只是路过，继续往前走。' });
    assert.equal(awaitingDecision(w).length, 0);
    assert.equal(advance(w, 1, land).elapsed, 1);
    assert.throws(() => op(w, 'player', { kind: 'intend', text: '替玩家想。' }), { code: 'island_authority' });
});

test('NPC death preserves the same body and belongings, stops work, and does not broadcast to distant people', () => {
    let w = world(); const position = structuredClone(w.people.lin.position);
    const items = structuredClone(w.items);
    w = settleDeath(w, 'lin', 'illness', land);
    assert.equal(isEnded(w), false); assert.equal(w.people.lin.activity, null);
    assert.deepEqual(w.people.lin.position, position); assert.deepEqual(w.items, items);
    assert.deepEqual(itemPosition(w, 'lin-lifejacket'), position);
    assert.equal(knownExperiences(w, ['player']).length, 0);
    assert.equal(observe(w, 'player', land).people.some(p => p.id === 'lin'), false);
    assert.deepEqual(settleDeath(w, 'lin', 'trauma', land), w);
});

test('finding a body records discovery, not a remote replay or a diagnosis', () => {
    let w = world(); w.people.lin.position = { x: 40, y: 0 };
    w = settleDeath(w, 'lin', 'illness', land);
    w = op(w, 'player', { kind: 'travel', route: [{ x: 40, y: 0 }] });
    w = advance(w, 60, land).world;
    assert.deepEqual(w.people.player.position, { x: 5, y: 0 });
    const known = knownExperiences(w, ['player']);
    assert.equal(known.some(e => e.payload.kind === 'died'), false);
    assert.equal(known.at(-1).payload.kind, 'noticed_body');
    assert.deepEqual(observe(w, 'player', land).people.find(p => p.id === 'lin').body, { kind: 'dead' });
});

test('dead bodies keep carried items accessible at the body rather than deleting them or granting them globally', () => {
    let w = world(); w.people.lin.position = { x: 1, y: 0 };
    w = settleDeath(w, 'lin', 'trauma', land);
    w = op(w, 'player', { kind: 'take', item: 'lin-lifejacket' });
    w = advance(w, RULES.takeSeconds, land).world;
    assert.deepEqual(w.items['lin-lifejacket'].location, { kind: 'carried', person: 'player' });
    assert.deepEqual(w.items['lin-shirt'].location, { kind: 'worn', person: 'lin' });
    assert.equal(w.people.lin.body.kind, 'dead');
});

test('player death closes all voluntary actions, NPC segments and the clock; a new run has no old history', () => {
    let w = speak(world(), 'player', '旧局经历');
    w = settleDeath(w, 'player', 'dehydration', land);
    assert.equal(isEnded(w), true);
    for (const action of [() => op(w, 'player', { kind: 'say', text: '继续' }), () => advance(w, 1, land), () => openScene(w, 'lin', land)]) {
        assert.throws(action, { code: 'island_ended' });
    }
    assert.equal(knownExperiences(w, ['player']).length, 2);
    const fresh = newJourney('new-run');
    assert.equal(isEnded(fresh), false); assert.equal(fresh.experiences.length, 0); assert.equal(fresh.clock, 0);
});

test('save validation preserves a dead body and rejects resurrection, missing people and invalid references', () => {
    let w = newJourney('save-test'); w = settleDeath(w, 'lin', 'trauma', LANDSCAPE);
    const data = { formatVersion: 1, revision: 1, active: w, last: { id: 'save-test', fingerprint: '0'.repeat(64) } };
    assert.deepEqual(ISLAND_PARTITION.parse(data), { ok: true, value: data });
    for (const corrupt of [
        next => { next.active.people.lin.body = { kind: 'living' }; },
        next => { delete next.active.people.ye; },
        next => { next.active.items['lin-shirt'].location.person = 'ghost'; },
        next => { next.active.experiences[0].sequence = 2; },
        next => { next.active.people.lin.activity = { kind: 'rest', until: 100 }; },
    ]) {
        const copy = structuredClone(data); corrupt(copy); assert.equal(ISLAND_PARTITION.parse(copy).ok, false);
    }
});

test('a discarded GM segment cannot leak partial operations into the confirmed world', () => {
    const w = world(); w.people.lin.position = { x: 1, y: 0 }; w.people.lin.activity = null;
    const before = structuredClone(w), work = createSceneWork(w, 'player', land);
    work.act('lin', { kind: 'say', text: '稍等，我去看看。' });
    work.act('lin', { kind: 'travel', route: [{ x: 20, y: 0 }] });
    assert.deepEqual(w, before);
    const result = work.finish();
    assert.equal(result.world.experiences.length, 2);
    result.world.people.player.position.x = 999;
    assert.equal(work.finish().world.people.player.position.x, 0);
});
