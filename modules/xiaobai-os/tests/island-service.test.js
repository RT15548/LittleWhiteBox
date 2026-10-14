import assert from 'node:assert/strict';
import test from 'node:test';
import { createCapabilityRegistry } from '../kernel/capability-registry.ts';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.ts';
import { createUserTransactions } from '../kernel/user-transactions.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';
import { createIslandService } from '../apps/game/island/service.ts';
import { LANDSCAPE } from '../apps/game/island/content.ts';
import { settleDeath } from '../apps/game/island/mortality.ts';
import { createGameModule } from '../apps/game/module.ts';
import { withIslandRuntime } from '../apps/game/island/host.ts';
import { createIslandClient } from '../apps/game/island/client.ts';

// Real user-document transaction/recovery, with only physical file I/O replaced.
async function setup(files = new Map()) {
    const state = { mode: 'confirmed', writes: 0, files };
    const partitions = new XiaobaiOsPartitionRegistry(); partitions.register(ISLAND_PARTITION);
    const binder = createCapabilityRegistry([]);
    const reference = { identityKey: 'story', reference: { formatVersion: 1, osId: 'story' },
        binding: { kind: 'character', ownerLocator: 'avatar.png', chatId: 'story' } };
    const transactions = createUserTransactions({
        partitions, binder, references: { capture: () => reference, isCurrent: () => true },
        resolveStory: async () => reference, initialPartitions: async () => ({}),
        storage: {
            read: async name => structuredClone(files.get(name) ?? null),
            replace: async (name, value) => {
                state.writes++;
                if (state.mode === 'rejected') throw Object.assign(new Error('fixture rejected'), { httpStatus: 403 });
                if (state.mode !== 'unknown') files.set(name, structuredClone(value));
                if (state.mode !== 'confirmed') throw new Error('fixture disconnected');
            },
        },
    });
    const store = transactions.createStore(ISLAND_PARTITION), service = createIslandService(store, transactions);
    await service.refresh();
    const request = () => ({ id: crypto.randomUUID(), revision: service.view().revision });
    return { state, store, service, transactions, request };
}
const allowed = () => true;
async function begin(h) { await h.service.start(h.request(), 'start', allowed); }

test('game module owns the island save separately from expedition and wagering state', () => {
    const module = createGameModule({ install: async () => ({}) });
    const registration = module.additionalPartitions.find(p => p.key === 'island');
    assert.equal(registration.ownerId, module.descriptor.id);
    assert.equal(registration.storage, 'user');
    assert.deepEqual(registration.createInitial(), { formatVersion: 1, revision: 0, active: null, last: null });
});

test('start, player statement and bounded NPC operations survive a real user-file reload without making new decisions', async () => {
    const h = await setup(); await begin(h);
    await h.service.player(h.request(), { kind: 'say', text: '我先留在岸边。' }, allowed);
    await h.service.scene(h.request(), 'player', async work => {
        for (const actor of work.scope().actors) work.act(actor, { kind: 'rest', seconds: 60 });
        work.act('lin', { kind: 'say', text: '我也缓一缓。' });
    }, allowed);
    await h.service.elapse(h.request(), 5, allowed);
    const before = h.store.peekCurrent().value;
    const loaded = await setup(h.state.files);
    assert.deepEqual(loaded.store.peekCurrent().value, before);
    assert.equal(loaded.service.view().player.clock, 5);
    assert.equal(loaded.service.view().phase, 'living');
    assert.deepEqual(loaded.service.history(0, 10).entries.filter(e => e.payload.kind === 'speech').map(e => e.payload.actor), ['player', 'lin']);
});

test('GM failure discards only the candidate and preserves the separately committed player input', async () => {
    const h = await setup(); await begin(h);
    await h.service.player(h.request(), { kind: 'say', text: '我说过的话' }, allowed);
    const before = h.store.peekCurrent().value;
    await assert.rejects(h.service.scene(h.request(), 'player', async work => {
        work.act('lin', { kind: 'drop', item: 'lin-lifejacket' });
        work.act('lin', { kind: 'say', text: '未提交的话' });
        throw Object.assign(new Error('provider failed'), { code: 'fixture_failure' });
    }, allowed), { code: 'fixture_failure' });
    assert.deepEqual(h.store.peekCurrent().value, before);
    assert.equal(h.service.history(0, 10).entries.length, 1);
    assert.equal(h.service.view().busy, false);
});

for (const mode of ['rejected', 'unknown', 'written_unknown']) {
    test(`a ${mode} completed GM save recovers without rerunning the segment or duplicating its effects`, async () => {
        const h = await setup(); await begin(h);
        let calls = 0;
        const request = h.request();
        const run = async work => {
            calls++;
            work.act('lin', { kind: 'drop', item: 'lin-lifejacket' });
            work.act('lin', { kind: 'say', text: '已经放下。' });
            h.state.mode = mode;
        };
        if (mode === 'written_unknown') await h.service.scene(request, 'player', run, allowed);
        else await assert.rejects(h.service.scene(request, 'player', run, allowed), { code: `island_save_${mode === 'rejected' ? 'failed' : 'unconfirmed'}` });
        h.state.mode = 'confirmed';
        await h.service.confirm(allowed);
        await h.service.scene(request, 'player', run, allowed);
        assert.equal(calls, 1);
        assert.equal(h.service.history(0, 10).entries.length, 2);
        assert.equal(h.store.peekCurrent().value.active.items['lin-lifejacket'].location.kind, 'ground');
        assert.equal((await setup(h.state.files)).service.history(0, 10).entries.length, 2);
    });
}

test('a pending candidate blocks new operations; failed save recovery cannot be mistaken for a successful restart', async () => {
    const h = await setup(); await begin(h); const before = h.service.view().journey;
    h.state.mode = 'rejected';
    await assert.rejects(h.service.start(h.request(), 'restart', allowed), { code: 'island_save_failed' });
    assert.equal(h.service.view().journey, before);
    await assert.rejects(h.service.player(h.request(), { kind: 'say', text: 'x' }, allowed), { code: 'island_busy' });
    await assert.rejects(h.service.confirm(allowed), { code: 'island_save_failed' });
    h.state.mode = 'confirmed'; await h.service.confirm(allowed);
    assert.notEqual(h.service.view().journey, before);
});

test('stale revisions and mismatched action identities never reapply an operation', async () => {
    const h = await setup(); const start = h.request();
    await h.service.start(start, 'start', allowed);
    await h.service.start(start, 'start', allowed);
    assert.equal(h.service.view().revision, 1);
    await assert.rejects(h.service.start(start, 'restart', allowed), { code: 'island_identity' });
    await assert.rejects(h.service.player({ ...start, id: 'stale' }, { kind: 'say', text: 'x' }, allowed), { code: 'island_stale' });
});

test('input arriving during an unfinished GM segment is rejected instead of mixing world revisions', async () => {
    const h = await setup(); await begin(h);
    let release, entered;
    const ready = new Promise(resolve => { entered = resolve; });
    const held = new Promise(resolve => { release = resolve; });
    const task = h.service.scene(h.request(), 'player', async work => {
        entered(); await held; work.act('lin', { kind: 'say', text: '完成' });
    }, allowed);
    await ready;
    await assert.rejects(h.service.player(h.request(), { kind: 'say', text: '插入' }, allowed), { code: 'island_busy' });
    assert.equal(h.service.view().busy, true);
    release(); await task;
    assert.equal(h.service.history(0, 10).entries.length, 1);
});

test('a player fatality remains terminal after reload; restart creates a fresh journey, not a revived body', async () => {
    const h = await setup(); await begin(h);
    await h.service.player(h.request(), { kind: 'say', text: '旧局' }, allowed);
    await h.store.transact(tx => {
        const data = tx.currentOrInitial();
        data.active = settleDeath(data.active, 'player', 'trauma', LANDSCAPE);
        data.revision++; data.last = { id: 'fatality', fingerprint: '0'.repeat(64) }; tx.replace(data);
    });
    const loaded = await setup(h.state.files), old = loaded.service.view().journey;
    assert.equal(loaded.service.view().phase, 'ended');
    for (const act of [
        () => loaded.service.player(loaded.request(), { kind: 'say', text: '继续' }, allowed),
        () => loaded.service.elapse(loaded.request(), 1, allowed),
        () => loaded.service.scene(loaded.request(), 'lin', async () => {}, allowed),
    ]) await assert.rejects(act(), { code: 'island_ended' });
    assert.equal(loaded.service.history(0, 10).entries.length, 2);
    await loaded.service.start(loaded.request(), 'restart', allowed);
    assert.equal(loaded.service.view().phase, 'living'); assert.notEqual(loaded.service.view().journey, old);
    assert.equal(loaded.service.history(0, 10).entries.length, 0);
});

test('player projection does not expose distant NPC bodies, possessions or private activities', async () => {
    const h = await setup(); await begin(h);
    await h.store.transact(tx => {
        const data = tx.currentOrInitial(); data.active.people.lin.position = { x: 300, y: 0 };
        data.active = settleDeath(data.active, 'lin', 'illness', LANDSCAPE);
        data.revision++; data.last = { id: 'offscreen', fingerprint: '0'.repeat(64) }; tx.replace(data);
    });
    const view = h.service.view();
    assert.equal(view.phase, 'living');
    assert.equal(view.player.people.some(p => p.id === 'lin'), false);
    assert.equal(view.player.items.some(i => i.id === 'lin-lifejacket'), false);
    assert.equal(h.service.history(0, 10).entries.length, 0);
});

test('a completed Host action reply is immediately usable for the next clock request without waiting for a later push', async () => {
    const h = await setup(); await begin(h);
    await h.service.scene(h.request(), 'player', async work => { for (const actor of work.scope().actors) work.act(actor, { kind: 'rest', seconds: 600 }); }, allowed);
    const runtime = withIslandRuntime({}, h.service, { pending: () => false }, {}, () => 'story', allowed);
    await runtime.activate({ post() {} });
    const result = await runtime.handleMessage({ type: 'game/island/act', payload: { chatIdentity: 'story', actionId: 'host-act', revision: h.service.view().revision, operation: { kind: 'rest', seconds: 5 } } });
    assert.equal(result.busy, false); assert.equal(result.thinking, false);
    const next = await runtime.handleMessage({ type: 'game/island/advance', payload: { chatIdentity: 'story', actionId: 'host-clock', revision: result.revision, seconds: 5 } });
    assert.equal(next.player.clock, 5); assert.equal(next.player.self.activity, null); assert.equal(next.busy, false);
});

test('opening model settings leaves the journey and paid provider untouched and requires the active chat', async () => {
    const h = await setup(); await begin(h);
    const before = structuredClone(h.store.peekCurrent().value), events = [];
    const runtime = withIslandRuntime({}, h.service, { pending: () => false }, {}, () => 'story', allowed);
    await runtime.activate({ post: (type, payload) => { events.push({ type, payload }); } });
    const client = createIslandClient({ subscribe: () => () => {},
        request: async (type, payload) => ({ result: await runtime.handleMessage({ type, payload }) }),
    }, 'story');
    assert.equal(await client.settings(), true);
    assert.deepEqual(events.filter(e => e.type === 'os/navigate'), [{ type: 'os/navigate', payload: { appId: 'agent-api' } }]);
    assert.deepEqual(h.store.peekCurrent().value, before);
    await assert.rejects(runtime.handleMessage({ type: 'game/island/settings', payload: { chatIdentity: 'other' } }), { code: 'island_identity' });
    assert.equal(events.filter(e => e.type === 'os/navigate').length, 1);
    client.dispose();
});

for (const active of [true, false]) { for (const speaking of [true, false]) {
    test(`client ${speaking ? 'pauses' : 'continues'} ${active ? 'a player activity' : 'an explicit wait'} when an NPC decision ${speaking ? 'includes audible speech' : 'is silent'}`, async () => {
        const h = await setup(); await begin(h);
        await h.service.scene(h.request(), 'player', async work => {
            for (const actor of work.scope().actors) work.act(actor, { kind: 'rest', seconds: actor === 'lin' ? 2 : 600 });
        }, allowed);
        if (active) await h.service.player(h.request(), { kind: 'rest', seconds: 5 }, allowed);
        const bridge = {
            subscribe: () => () => {},
            async request(type, payload) {
                let result;
                const request = { id: payload.actionId, revision: payload.revision };
                if (type === 'game/island/read') result = h.service.view();
                else if (type === 'game/island/advance') result = await h.service.elapse(request, payload.seconds, allowed);
                else if (type === 'game/island/think') result = await h.service.think(request, payload.reason, async work => {
                    for (const observer of work.context()) if (!observer.self.activity) work.act(observer.observer, { kind: 'rest', seconds: 600 });
                    if (speaking) work.act('lin', { kind: 'say', text: '等一下，我有话想问你。' });
                }, allowed);
                else throw new Error(type);
                return { result: { ...result, thinking: false, memoryPending: false } };
            },
        };
        const client = createIslandClient(bridge, 'story');
        try {
            await client.read(); assert.equal(await client.advance(10), true);
            assert.equal(h.service.view().player.clock, speaking ? 2 : active ? 5 : 10);
            assert.equal(h.service.view().player.self.activity?.kind ?? null, speaking && active ? 'rest' : null);
            assert.equal(client.blocked.value, false);
        } finally { client.dispose(); }
    });
} }

test('confirming a retained player statement acknowledges its original draft exactly once without a second statement or GM purchase', async () => {
    const h = await setup(); await begin(h); let accepted = 0;
    const bridge = {
        subscribe: () => () => {},
        async request(type, payload) {
            let result;
            if (type === 'game/island/read') result = h.service.view();
            else if (type === 'game/island/act') result = await h.service.player({ id: payload.actionId, revision: payload.revision }, payload.operation, allowed);
            else if (type === 'game/island/confirm') result = await h.service.confirm(allowed);
            else throw new Error(type);
            return { result: { ...result, thinking: false, memoryPending: false } };
        },
    };
    const client = createIslandClient(bridge, 'story');
    try {
        await client.read(); h.state.mode = 'rejected';
        assert.equal(await client.speak('我会留在这里。', () => { accepted++; }), false);
        assert.equal(accepted, 0); assert.equal(client.uncertain.value, true);
        h.state.mode = 'confirmed'; assert.equal(await client.recover(), true);
        assert.equal(accepted, 1); assert.equal(client.uncertain.value, false);
        await client.read(); assert.equal(accepted, 1);
        assert.equal(h.service.history(0, 100).entries.filter(e => e.payload.kind === 'speech').length, 1);
    } finally { client.dispose(); }
});

test('an NPC holding out an item pauses automatic travel and waits for the player acceptance', async () => {
    const h = await setup(); await begin(h);
    await h.store.transact(tx => {
        const data = tx.currentOrInitial();
        data.active.people.lin.position = { ...data.active.people.player.position };
        data.active.items['lin-lifejacket'].location.kind = 'carried';
        tx.replace(data);
    });
    await h.service.scene(h.request(), 'player', async work => {
        for (const id of work.scope().actors) work.act(id, { kind: 'rest', seconds: id === 'lin' ? 1 : 600 });
    }, allowed);
    const position = h.service.view().player.self.position;
    await h.service.player(h.request(), { kind: 'travel', route: [{ x: position.x + 10, y: position.y }] }, allowed);
    const bridge = {
        subscribe: () => () => {},
        async request(type, payload) {
            const request = { id: payload.actionId, revision: payload.revision }; let result;
            if (type === 'game/island/read') result = h.service.view();
            else if (type === 'game/island/advance') result = await h.service.elapse(request, payload.seconds, allowed);
            else if (type === 'game/island/think') result = await h.service.think(request, payload.reason, async work => {
                work.act('lin', { kind: 'offer', item: 'lin-lifejacket', units: 1, to: 'player' });
            }, allowed);
            else throw new Error(type);
            return { result: { ...result, thinking: false, memoryPending: false } };
        },
    };
    const client = createIslandClient(bridge, 'story');
    try {
        await client.read(); assert.equal(await client.advance(10), true);
        assert.equal(h.service.view().player.clock, 1);
        assert.equal(h.service.view().player.self.activity.kind, 'travel');
        assert.equal(h.service.view().player.offers[0].to, 'player');
        assert.equal(h.store.peekCurrent().value.active.items['lin-lifejacket'].location.person, 'lin');
    } finally { client.dispose(); }
});

test('retrying a failed NPC response keeps the player statement once and retries only the model step', async () => {
    const h = await setup(); await begin(h);
    let attempts = 0, accepted = 0;
    const bridge = {
        subscribe: () => () => {},
        async request(type, payload) {
            const request = { id: payload.actionId, revision: payload.revision };
            let result;
            if (type === 'game/island/read') result = h.service.view();
            else if (type === 'game/island/act') result = await h.service.player(request, payload.operation, allowed);
            else if (type === 'game/island/think') {
                attempts++;
                if (attempts === 1) throw Object.assign(new Error('provider unavailable'), { code: 'fixture_provider' });
                result = await h.service.think(request, payload.reason, async work => {
                    for (const id of work.scope().actors) work.act(id, { kind: 'rest', seconds: 600 });
                    work.act('lin', { kind: 'say', text: '知道了。' });
                }, allowed);
            } else throw new Error(type);
            return { result: { ...result, thinking: false, memoryPending: false } };
        },
    };
    const client = createIslandClient(bridge, 'story');
    try {
        await client.read();
        assert.equal(await client.speak('我去找水。', () => accepted++), false);
        assert.equal(accepted, 1); assert.equal(client.failedRequest.value, 'think');
        assert.equal(client.uncertain.value, false); assert.equal(client.blocked.value, false);
        assert.equal(await client.think(), true); assert.equal(client.failedRequest.value, null);
        const statements = h.service.history(0, 100).entries.filter(e => e.payload.kind === 'speech');
        assert.deepEqual(statements.map(e => e.payload.actor), ['player', 'lin']);
        assert.equal(attempts, 2); assert.equal(accepted, 1);
    } finally { client.dispose(); }
});
