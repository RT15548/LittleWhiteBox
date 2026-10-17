import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as settle } from 'node:timers/promises';
import { userEconomyHarness } from './user-economy-harness.js';
import { createIslandService } from '../apps/game/island/service.js';
import { ISLAND_PARTITION } from '../apps/game/island/partition.js';
import { newJourney } from '../apps/game/island/world.js';
import { ISLAND_FORMAT_VERSION } from '../apps/game/island/model.js';
import { LANDSCAPE, RULES } from '../apps/game/island/content.js';
import { operate } from '../apps/game/island/operations.js';
import { observe, openScene } from '../apps/game/island/scene.js';
import { createIntentWork } from '../apps/game/island/intent-work.js';
import { actionPreview } from '../apps/game/island/presentation/action-preview.js';
import { withIslandRuntime } from '../apps/game/island/host.js';
import { createIslandClient } from '../apps/game/island/client.js';

const identity = { name: 'Test player', gender: 'female', appearanceAge: 'twenties' };
const guard = () => true;
function worldFixture() {
    const world = newJourney('test-journey', identity), position = world.people.player.position;
    world.people.lin.position = { x: position.x + .8, y: position.y };
    world.items.salvage_bottle.location = { kind: 'ground', position: { ...position } };
    return world;
}
async function harness({ files, world } = {}) {
    const h = await userEconomyHarness({ files, additionalPartitions: [ISLAND_PARTITION] });
    const store = h.store(ISLAND_PARTITION);
    await store.read();
    if (world) {
        await store.transact(tx => tx.replace({ formatVersion: ISLAND_FORMAT_VERSION, revision: 1,
            active: world, last: { id: world.id, fingerprint: '0'.repeat(64) } }));
    }
    const service = createIslandService(store, h.transactions);
    await service.refresh();
    return { ...h, store, service, saved: () => h.document().partitions[ISLAND_PARTITION.key] };
}
const gm = (world, operation) => operate(world, { kind: 'gm', scene: openScene(world, 'player', LANDSCAPE) }, 'lin', operation, LANDSCAPE);
const say = (service, id) => service.player({ id }, { kind: 'say', text: id }, guard);
function gateNext(storage, method) {
    const entered = Promise.withResolvers(), released = Promise.withResolvers(), original = storage[method];
    let next = true;
    storage[method] = async (...args) => {
        if (next) { next = false; entered.resolve(); await released.promise; }
        return original(...args);
    };
    return { entered: entered.promise, release: () => released.resolve() };
}

test('an old page cannot checkpoint over another page, and explicit refresh adopts the newer same journey', async () => {
    const a = await harness({ world: worldFixture() }), b = await harness({ files: a.state.files });
    say(b.service, 'saved-dialogue');
    b.service.player({ id: 'saved-item' }, { kind: 'take', item: 'salvage_bottle' }, guard);
    b.service.tick(1000);
    await b.service.checkpoint(guard);
    const saved = structuredClone(b.saved());
    assert.equal(saved.active.items.salvage_bottle.location.person, 'player');
    assert.ok(saved.active.clock > 0);
    say(a.service, 'old-page-dialogue');
    await assert.rejects(a.service.checkpoint(guard), { code: 'island_stale' });
    assert.deepEqual(a.saved(), saved);
    assert.equal(a.service.tick(1000), false);
    assert.equal(a.transactions.hasPendingCommit(), false);
    await a.service.refresh();
    assert.equal(a.service.view().player.clock, saved.active.clock);
    assert.ok(a.service.view().recent.some(e => e.payload.text === 'saved-dialogue'));
    assert.equal(a.service.view().recent.some(e => e.payload.text === 'old-page-dialogue'), false);
    say(a.service, 'after-refresh'); await a.service.checkpoint(guard);
    assert.equal(a.saved().revision, saved.revision + 1);
});

test('checkpoint rechecks the live baseline inside the transaction, not only after its preliminary read', async () => {
    const a = await harness({ world: worldFixture() }), b = await harness({ files: a.state.files });
    const transact = a.store.transact;
    a.store.transact = async (...args) => {
        say(b.service, 'between-read-and-transaction'); await b.service.checkpoint(guard);
        return transact(...args);
    };
    say(a.service, 'stale-candidate');
    await assert.rejects(a.service.checkpoint(guard), { code: 'island_stale' });
    assert.ok(a.saved().active.experiences.some(e => e.payload.text === 'between-read-and-transaction'));
    assert.equal(a.saved().active.experiences.some(e => e.payload.text === 'stale-candidate'), false);
});

test('time and changes continue through normal checkpoint reads and uploads, and the next checkpoint saves them', async () => {
    const h = await harness({ world: worldFixture() });
    say(h.service, 'before-save');
    const reading = gateNext(h.storage, 'read'), writing = gateNext(h.storage, 'replace');
    const checkpoint = h.service.checkpoint(guard);
    await reading.entered;
    assert.equal(h.transactions.getFileState(), 'loading');
    assert.equal(h.service.tick(1000), true);
    reading.release();
    await writing.entered;
    assert.equal(h.transactions.getFileState(), 'saving');
    assert.equal(h.transactions.hasPendingCommit(), true);
    assert.equal(h.service.tick(1000), true);
    say(h.service, 'during-upload');
    writing.release(); await checkpoint;
    assert.equal(h.saved().active.clock, 0);
    await h.service.refresh();
    assert.equal(h.service.view().player.clock, 2 * RULES.timeScale);
    await h.service.checkpoint(guard);
    assert.equal(h.saved().active.clock, 2 * RULES.timeScale);
    assert.ok(h.saved().active.experiences.some(e => e.payload.text === 'during-upload'));
    const revision = h.saved().revision;
    await h.service.checkpoint(guard);
    assert.equal(h.saved().revision, revision);
});

for (const [mode, code] of [['rejected', 'island_save_failed'], ['unknown', 'island_save_unconfirmed']]) {
    test(`${mode} checkpoint pauses time and recovery advances only the confirmed snapshot baseline`, async () => {
        const h = await harness({ world: worldFixture() });
        say(h.service, 'checkpoint-snapshot'); h.state.mode = mode;
        const writing = gateNext(h.storage, 'replace'), checkpoint = h.service.checkpoint(guard);
        await writing.entered;
        assert.equal(h.service.tick(1000), true); say(h.service, 'after-snapshot');
        writing.release(); await assert.rejects(checkpoint, { code });
        const clock = h.service.view().player.clock;
        assert.equal(h.service.tick(1000), false);
        assert.equal(h.service.view().player.clock, clock);
        h.state.mode = 'confirmed'; await h.service.confirm(guard);
        assert.equal(h.service.view().player.clock, clock);
        assert.ok(h.service.view().recent.some(e => e.payload.text === 'after-snapshot'));
        await h.service.checkpoint(guard);
        assert.equal(h.saved().revision, 3);
        assert.equal(h.saved().active.clock, clock);
        assert.ok(h.saved().active.experiences.some(e => e.payload.text === 'after-snapshot'));
    });
}

test('a conflicting upload pauses time without replacing either live or server progress', async () => {
    const a = await harness({ world: worldFixture() }), b = await harness({ files: a.state.files });
    say(a.service, 'candidate');
    const transact = a.store.transact;
    a.store.transact = (command, options) => transact(async tx => {
        const result = await command(tx);
        say(b.service, 'other-page'); await b.service.checkpoint(guard);
        return result;
    }, options);
    await assert.rejects(a.service.checkpoint(guard), { code: 'island_save_conflict' });
    assert.equal(a.service.tick(1000), false);
    assert.ok(a.saved().active.experiences.some(e => e.payload.text === 'other-page'));
});

const invitations = [
    { kind: 'contact', offer: { kind: 'offer_contact', to: 'player', form: 'embrace' }, replacement: { kind: 'offer_contact', to: 'player', form: 'kiss' }, accept: 'accept_contact', decline: 'decline_contact' },
    { kind: 'item', offer: { kind: 'offer', to: 'player', item: 'salvage_bottle', units: 1 }, replacement: { kind: 'offer', to: 'player', item: 'salvage_cup', units: 1 }, accept: 'accept', decline: 'decline_offer' },
    { kind: 'care', offer: { kind: 'offer_care', to: 'player', wound: 'skin', treatment: { kind: 'dress', item: 'care-cloth' } }, replacement: { kind: 'offer_care', to: 'player', wound: 'foot', treatment: { kind: 'dress', item: 'care-cloth' } }, accept: 'accept_care', decline: 'decline_care' },
];
function offeredWorld(offer) {
    const world = worldFixture();
    world.items.salvage_bottle.location = world.items.salvage_cup.location = { kind: 'carried', person: 'lin' };
    world.items['care-cloth'] = { kind: 'cloth', location: { kind: 'carried', person: 'lin' }, quantity: 1, water: null, wetness: 0, soiling: 0, foodSince: null };
    world.people.player.body.needs.skinWound = world.people.player.body.needs.footWound = .1;
    return gm(world, offer);
}
async function interpret(service, kind) {
    const request = { id: 'player-intent', generation: service.generation };
    await service.interpret(request, 'respond to this invitation', async work => work.propose({ kind, from: 'lin' }), guard);
    return request;
}
for (const entry of invitations) {
    test(`an unchanged ${entry.kind} invitation remains confirmable despite unrelated NPC speech and time`, async () => {
        const h = await harness({ world: offeredWorld(entry.offer) }), request = await interpret(h.service, entry.accept);
        await h.service.plan('response', async work => { work.act('lin', { kind: 'say', text: 'still offering' }); }, guard);
        h.service.tick(1000);
        const state = h.service.view();
        assert.equal(actionPreview(state.intent.result, state.player).available, true);
        h.service.acceptIntent(request, guard);
        assert.equal(h.service.view().intent, null);
    });
    for (const response of [entry.accept, entry.decline]) {
        test(`${response} binds the original invitation, including an identical reoffer`, async () => {
            for (const replacement of [entry.replacement, entry.offer]) {
                const h = await harness({ world: offeredWorld(entry.offer) }), request = await interpret(h.service, response);
                await h.service.plan('response', async work => { work.act('lin', { kind: 'cancel' }); work.act('lin', replacement); }, guard);
                const state = h.service.view();
                assert.equal(actionPreview(state.intent.result, state.player).available, false);
                assert.throws(() => h.service.acceptIntent(request, guard), { code: 'island_stale' });
                assert.deepEqual(h.service.view().player, state.player);
            }
        });
    }
    test(`withdrawn ${entry.kind} invitations yield unavailable previews without a render exception`, async () => {
        const h = await harness({ world: offeredWorld(entry.offer) }), request = await interpret(h.service, entry.accept);
        await h.service.plan('response', async work => { work.act('lin', { kind: 'cancel' }); }, guard);
        const state = h.service.view();
        assert.equal(actionPreview(state.intent.result, state.player).available, false);
        assert.throws(() => h.service.acceptIntent(request, guard), { code: 'island_unavailable' });
    });
}

test('invitation identity is bound to the interpretation snapshot even when replacement arrives during model work', async () => {
    const entry = invitations[0], h = await harness({ world: offeredWorld(entry.offer) });
    const started = Promise.withResolvers(), finish = Promise.withResolvers(), request = { id: 'slow-intent', generation: h.service.generation };
    const interpreting = h.service.interpret(request, 'accept the embrace', async work => {
        started.resolve(); await finish.promise; work.propose({ kind: entry.accept, from: 'lin' });
    }, guard);
    await started.promise;
    await h.service.plan('response', async work => { work.act('lin', { kind: 'cancel' }); work.act('lin', entry.replacement); }, guard);
    finish.resolve(); await interpreting;
    assert.throws(() => h.service.acceptIntent(request, guard), { code: 'island_stale' });
});

test('a pickup preview becomes unavailable when an NPC takes the target into private inventory', async () => {
    const h = await harness({ world: worldFixture() }), request = { id: 'pickup-intent', generation: h.service.generation };
    await h.service.interpret(request, 'take the bottle', async work => work.propose({ kind: 'take', item: 'salvage_bottle' }), guard);
    await h.service.plan('response', async work => { work.act('lin', { kind: 'take', item: 'salvage_bottle' }); }, guard);
    h.service.tick(1000);
    const state = h.service.view();
    assert.equal(state.player.items.some(i => i.id === 'salvage_bottle'), false);
    assert.equal(actionPreview(state.intent.result, state.player).available, false);
    assert.throws(() => h.service.acceptIntent(request, guard), { code: 'island_unavailable' });
});

for (const operation of [
    { kind: 'construct', site: 'gone' },
    { kind: 'work', task: { kind: 'craft', recipe: 'tear_cloth', materials: [{ item: 'gone', units: 1 }] } },
    { kind: 'work', task: { kind: 'exhume_body', grave: 1, tool: 'shore_stone' } },
    { kind: 'work', task: { kind: 'cover_waste', waste: 'gone' } },
    { kind: 'work', task: { kind: 'fill', source: 'gone', container: 'salvage_bottle', millilitres: 10 } },
]) {
    test(`missing ${operation.kind === 'work' ? operation.task.kind : operation.kind} targets do not crash previews`, () => {
        const preview = actionPreview({ kind: 'action', operation, seconds: null, invitation: null }, observe(worldFixture(), 'player', LANDSCAPE));
        assert.equal(preview.available, false);
        assert.deepEqual(preview.fields, []);
    });
}

test('ordinary available item previews remain confirmable', () => {
    const world = worldFixture(), work = createIntentWork(world, LANDSCAPE);
    work.propose({ kind: 'take', item: 'salvage_bottle' });
    assert.equal(actionPreview(work.finish(), observe(world, 'player', LANDSCAPE)).available, true);
});

for (const code of ['island_context_full', 'island_agent_empty', 'island_memory_save', 'island_save_unconfirmed']) {
    test(`${code} uses conversation feedback without losing explicit save recovery`, async t => {
        const h = await harness({ world: worldFixture() }), posts = [], subscribers = new Set();
        let attempts = 0;
        h.service.plan = async () => { attempts++; throw Object.assign(new Error(code), { code }); };
        const host = withIslandRuntime({}, h.service, { pending: () => false }, {}, () => 'test-chat', guard);
        t.after(() => host.stopBackground());
        await host.activate({ post(type, payload) {
            const message = { type, payload }; posts.push(message);
            for (const subscriber of subscribers) { subscriber(message); }
        } });
        const client = createIslandClient({
            subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); },
            async request(type, payload) { return { result: await host.handleMessage({ type, payload }) }; },
        }, 'test-chat');
        t.after(() => client.dispose());
        await client.read(); await client.think(); await settle();
        const saving = code === 'island_memory_save' || code.startsWith('island_save_');
        assert.equal(client.view.value.planFault, code);
        assert.equal(posts.filter(message => message.type === 'game/island/error').length, saving ? 1 : 0);
        assert.equal(client.uncertain.value, saving);
        assert.equal(Boolean(client.error.value), saving);
        assert.equal(Boolean(client.gmFailure.value), !saving);
        client.dismissGmFailure();
        await client.settings(); await host.deactivate('test'); await host.activate({ post() {} }); await client.settings();
        assert.equal(attempts, 1);
        assert.equal(client.gmFailure.value, '');
        assert.equal(client.view.value.planFault, code);
        assert.equal(client.uncertain.value, saving);
        assert.equal(Boolean(client.error.value), saving);
        if (!saving) {
            await client.think(); await settle(); await client.read();
            assert.equal(attempts, 2);
            assert.ok(client.gmFailure.value);
        }
    });
}

for (const code of ['island_stale', 'island_unavailable', 'island_cancelled']) {
    test(`${code} remains a quiet plan ending rather than a character warning`, async t => {
        const h = await harness({ world: worldFixture() }), posts = [];
        h.service.plan = async () => { throw Object.assign(new Error(code), { code }); };
        const host = withIslandRuntime({}, h.service, { pending: () => false }, {}, () => 'test-chat', guard);
        t.after(() => host.stopBackground());
        await host.activate({ post(type, payload) { posts.push({ type, payload }); } });
        await host.handleMessage({ type: 'game/island/think', payload: { chatIdentity: 'test-chat', reason: 'response' } });
        await settle();
        const state = await host.handleMessage({ type: 'game/island/read', payload: { chatIdentity: 'test-chat' } });
        assert.equal(state.planFault, null);
        assert.equal(posts.some(message => message.type === 'game/island/error'), false);
    });
}

for (const boundary of ['handleChatChanged', 'cancelAll', 'stopBackground', 'deactivate', 'cancelForeground']) {
    test(`${boundary} clears host steering before the same global journey is reused`, async t => {
        const h = await harness({ world: worldFixture() });
        let chat = 'first-chat';
        const host = withIslandRuntime({}, h.service, { pending: () => false }, {}, () => chat, guard);
        t.after(() => host.stopBackground());
        const context = { post() {} };
        await host.activate(context);
        const message = (type, payload) => host.handleMessage({ type: `game/island/${type}`, payload: { chatIdentity: chat, ...payload } });
        await message('live', { active: true }); await message('steer', { x: 1, y: 0 });
        h.service.tick(1000);
        const stopped = h.service.view().player.self.position;
        if (boundary === 'handleChatChanged') { chat = 'second-chat'; }
        await host[boundary]('test');
        await host.activate(context); await h.service.refresh();
        await message('steer', { x: 1, y: 0 }); // Delayed input while the room is still inactive.
        await message('live', { active: true }); h.service.tick(1000);
        assert.deepEqual(h.service.view().player.self.position, stopped);
        assert.equal(h.service.view().player.self.activity, null);
    });
}
