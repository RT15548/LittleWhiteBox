import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { createMetadataConfirmation, METADATA_CONFIRMATION_TIMEOUT_MS } from '../data/metadata-confirmation.js';

// Real confirmation protocol with a virtual clock: long mobile saves have one
// full minute, bounded sequential readback, and never replay a host write.
const context = () => ({ chatId: 'original', characterId: 0,
    characters: [{ name: 'character', chat: 'original', avatar: 'character.png' }] });
const expected = { storySummary: { value: 'new' } };
const previous = { storySummary: { value: 'old' } };
const response = extension => ({ ok: true, json: async () => [{ chat_metadata: { extensions: { LittleWhiteBox: extension } } }] });

async function advance(t, milliseconds) {
    t.mock.timers.tick(milliseconds);
    await nextTurn();
}

test('confirmation remains pending beyond five seconds and succeeds before sixty', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let finish, settled = false, requestCount = 0;
    const confirm = createMetadataConfirmation(context(), () => ({}), async () => {
        requestCount++;
        return new Promise(resolve => { finish = resolve; });
    });
    const saving = confirm(expected, previous).then(() => { settled = true; });
    await nextTurn();
    await advance(t, 6000);
    assert.equal(settled, false);
    finish(response(expected));
    await saving;
    assert.equal(requestCount, 1);
});

test('temporary read failures back off and recover without concurrent full-chat reads', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let requests = 0, active = 0, peak = 0;
    const confirm = createMetadataConfirmation(context(), () => ({}), async () => {
        active++; peak = Math.max(peak, active); requests++;
        await nextTurn(); active--;
        if (requests < 3) throw new Error('offline');
        return response(expected);
    });
    const saving = confirm(expected, previous);
    await nextTurn(); await nextTurn();
    assert.equal(requests, 1);
    await advance(t, 2000); await nextTurn();
    await advance(t, 4000); await nextTurn();
    await saving;
    assert.equal(requests, 3);
    assert.equal(peak, 1);
});

for (const kind of ['http', 'shape', 'stalled', 'old', 'conflict']) {
    test(`unconfirmed ${kind} read waits the full window and preserves the failure category`, async t => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        let signal, settled = false, requests = 0;
        const confirm = createMetadataConfirmation(context(), () => ({}), async (_url, options) => {
            requests++; signal = options.signal;
            if (kind === 'http') return { ok: false, status: 503 };
            if (kind === 'shape') return { ok: true, json: async () => ({}) };
            if (kind === 'old') return response(previous);
            if (kind === 'conflict') return response({ storySummary: { value: 'external' } });
            return new Promise(() => {});
        });
        const result = confirm(expected, previous).then(() => assert.fail('Save was not confirmed'), error => { settled = true; return error; });
        await nextTurn();
        await advance(t, 5999);
        assert.equal(settled, false);
        await advance(t, METADATA_CONFIRMATION_TIMEOUT_MS - 5999);
        const error = await result;
        assert.equal(error.code, kind === 'old' ? 'metadata_not_saved' : kind === 'conflict' ? 'metadata_save_conflict' : 'metadata_save_unconfirmed');
        assert.equal(error.uncertain, kind !== 'old');
        if (kind === 'http') assert.equal(error.cause.status, 503);
        if (kind === 'shape') assert.equal(error.cause.code, 'metadata_read_invalid');
        assert.equal(signal.aborted, true);
        assert.ok(requests <= 8);
    });
}

test('an unfinished host save cannot turn old readback into permission to retry', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const confirm = createMetadataConfirmation(context(), () => ({}), async () => response(previous));
    const result = confirm(expected, previous, null, { savePending: () => true }).catch(error => error);
    await nextTurn(); await advance(t, METADATA_CONFIRMATION_TIMEOUT_MS);
    assert.equal((await result).code, 'metadata_save_unconfirmed');
});

for (const group of [false, true]) test(`readback retains the original ${group ? 'group' : 'character'} target after navigation`, async () => {
    const owner = context();
    if (group) owner.groupId = 'group';
    const reads = [];
    const confirm = createMetadataConfirmation(owner, () => ({}), async (url, options) => {
        reads.push({ url, body: JSON.parse(options.body) }); return response(expected);
    });
    owner.chatId = 'another'; owner.characters[0].chat = 'another';
    await confirm(expected);
    assert.equal(reads[0].url, group ? '/api/chats/group/get' : '/api/chats/get');
    assert.equal(group ? reads[0].body.id : reads[0].body.file_name, 'original');
});
