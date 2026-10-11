import assert from 'node:assert/strict';
import test from 'node:test';
import { journey } from './fixtures/expedition-traveler.js';
import { createExpeditionClient } from '../apps/game/expedition/client.ts';
import { createCampaignPlayback } from '../apps/game/expedition/presentation/playback.ts';
import { advanceExpedition, emptyExpedition } from '../apps/game/expedition/domain.ts';
import { tickCampaign } from '../apps/game/expedition/campaign/rules.ts';

// Prediction/confirmation is a separate failure boundary from the reducer or file transaction.
async function fixture() {
    let state = advanceExpedition(emptyExpedition(), { type: 'start', weapon: 'blade', outfit: 'traveler', ...journey }, 'start', 7);
    let release, delay = false, unknown = false;
    const writes = [];
    const view = () => ({ data: structuredClone(state), fileRevision: state.revision, balance: 100, ready: true, pending: false, writeState: 'ready', memories: {} });
    const client = createExpeditionClient({ subscribe: () => () => {}, async request(type, payload) {
        if (type.endsWith('/act')) {
            writes.push(structuredClone(payload));
            if (delay) { await new Promise(resolve => { release = resolve; }); delay = false; }
            state = advanceExpedition(state, payload.command, payload.actionId, 0);
            if (unknown) { unknown = false; throw Object.assign(new Error('timeout'), { code: 'host_request_timeout' }); }
        }
        return { result: view() };
    } }, 'chat-a');
    await client.read(); const playback = createCampaignPlayback(client);
    return { client, playback, writes, get: () => state.active, hold() { delay = true; }, unknown() { unknown = true; }, release: () => release(),
        dispose() { playback.dispose(); client.dispose(); } };
}
const move = { move: 5, dash: false, skill: false };
test('movement arriving during a save is replayed exactly once over its confirmed prefix', async () => {
    const h = await fixture(), expected = structuredClone(h.get());
    for (let i = 0; i < 10; i++) { h.playback.input(move); tickCampaign(expected, move); }
    h.hold(); const pending = h.playback.flush();
    for (let i = 0; i < 7; i++) { h.playback.input(move); tickCampaign(expected, move); }
    h.release(); assert.equal(await pending, true);
    assert.deepEqual(h.playback.current.value, expected); assert.equal(h.playback.dirty.value, true);
    assert.equal(await h.playback.flush(), true); assert.deepEqual(h.get(), expected);
    assert.deepEqual(h.writes.map(w => w.command.spans.reduce((n, s) => n + s.ticks, 0)), [10, 7]); h.dispose();
});
test('unknown committed input recovers before the unsent tail and never duplicates the prefix', async () => {
    const h = await fixture(), expected = structuredClone(h.get());
    for (let i = 0; i < 10; i++) { h.playback.input(move); tickCampaign(expected, move); }
    h.hold(); h.unknown(); const pending = h.playback.flush();
    for (let i = 0; i < 7; i++) { h.playback.input(move); tickCampaign(expected, move); }
    h.release(); assert.equal(await pending, false);
    h.playback.input(move); // A failure must stop new prediction immediately.
    assert.deepEqual(h.playback.current.value, expected);
    assert.equal(await h.playback.recover(), true); assert.deepEqual(h.get(), expected);
    assert.equal(h.writes.length, 2); assert.equal(h.playback.dirty.value, false); h.dispose();
});
test('idle exploration and a disposed room produce no synthetic input or saves', async () => {
    const h = await fixture(), original = structuredClone(h.get());
    for (let i = 0; i < 300; i++) { h.playback.input({ move: 0, dash: false, skill: false }); }
    assert.equal(await h.playback.flush(), true); assert.equal(h.writes.length, 0);
    h.dispose(); h.playback.input(move); assert.deepEqual(h.playback.current.value, original);
});
