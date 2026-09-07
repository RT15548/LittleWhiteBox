import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
    createChatReferencePort,
    readChatMetadataHeader,
    readXiaobaiOsReference,
} from '../storage/chat-reference.js';

const binding = { kind: 'character', ownerLocator: 'avatar.png', chatId: 'chat-a' };

function harness() {
    const state = {
        metadata: {},
        persisted: {},
        save: null,
        reads: 0,
    };
    const adapter = {
        capture: () => ({
            identityKey: 'character:avatar.png:chat-a',
            binding,
            metadata: state.metadata,
        }),
        async save() {
            if (state.save) { return await state.save(); }
            state.persisted = structuredClone(state.metadata);
        },
        async read() {
            state.reads++;
            return structuredClone(state.persisted);
        },
    };
    return { state, port: createChatReferencePort(adapter) };
}

test('chat reference install persists only formatVersion and osId without inspecting unrelated metadata', async () => {
    const { state, port } = harness();
    state.metadata.extensions = {
        LittleWhiteBox: {
            unrelatedRoot: { keep: true },
            unrelated: { keep: true },
        },
    };
    const capture = port.capture();
    const result = await port.install(capture, { formatVersion: 1, osId: 'os_1' });
    assert.deepEqual(result, { status: 'confirmed' });
    assert.equal(state.reads, 0);
    assert.deepEqual(readXiaobaiOsReference(state.persisted), { formatVersion: 1, osId: 'os_1' });
    assert.deepEqual(state.persisted.extensions.LittleWhiteBox.unrelatedRoot, { keep: true });
    assert.deepEqual(state.persisted.extensions.LittleWhiteBox.unrelated, { keep: true });
});

test('an explicitly rejected metadata save rolls local metadata back', async () => {
    const { state, port } = harness();
    state.metadata.extensions = { LittleWhiteBox: { unrelated: true } };
    state.persisted = structuredClone(state.metadata);
    state.save = async () => {
        throw Object.assign(new Error('host rejected save'), { code: 'SAVE_UNAVAILABLE', uncertain: false });
    };
    const result = await port.install(port.capture(), { formatVersion: 1, osId: 'os_1' });
    assert.equal(result.status, 'failed');
    assert.equal(state.reads, 0);
    assert.deepEqual(state.metadata, { extensions: { LittleWhiteBox: { unrelated: true } } });
});

test('an unknown metadata result is confirmed only by persisted header read-back', async () => {
    const confirmed = harness();
    confirmed.state.save = async () => {
        confirmed.state.persisted = structuredClone(confirmed.state.metadata);
        throw Object.assign(new Error('timeout'), { uncertain: true });
    };
    assert.equal(
        (await confirmed.port.install(confirmed.port.capture(), { formatVersion: 1, osId: 'os_1' })).status,
        'confirmed',
    );

    const unknown = harness();
    unknown.state.save = async () => { throw Object.assign(new Error('timeout'), { uncertain: true }); };
    const result = await unknown.port.install(unknown.port.capture(), { formatVersion: 1, osId: 'os_1' });
    assert.equal(result.status, 'unconfirmed');
    assert.deepEqual(readXiaobaiOsReference(unknown.state.metadata), { formatVersion: 1, osId: 'os_1' });
});

test('retrying an unknown reference save never mistakes the local mutation for persisted data', async () => {
    const { state, port } = harness();
    const capture = port.capture();
    state.save = async () => { throw Object.assign(new Error('timeout'), { uncertain: true }); };

    assert.equal((await port.install(capture, { formatVersion: 1, osId: 'os_1' })).status, 'unconfirmed');
    assert.equal(port.isCurrent(capture), true);
    assert.deepEqual(state.persisted, {});

    state.save = async () => { state.persisted = structuredClone(state.metadata); };
    assert.equal((await port.install(capture, { formatVersion: 1, osId: 'os_1' })).status, 'confirmed');
    assert.deepEqual(readXiaobaiOsReference(state.persisted), { formatVersion: 1, osId: 'os_1' });
});

test('invalid existing references are rejected instead of treated as absent', () => {
    assert.throws(() => readXiaobaiOsReference({
        extensions: { LittleWhiteBox: { xiaobaiOsRef: { formatVersion: 2, osId: 'os_1' } } },
    }), /formatVersion/);
});

test('SillyTavern 1.18 chat header fixtures preserve single, group and branch metadata', async () => {
    const fixture = JSON.parse(await readFile(new URL('./fixtures/sillytavern-1.18-chat-lifecycle.json', import.meta.url), 'utf8'));
    assert.deepEqual(readXiaobaiOsReference(readChatMetadataHeader(fixture.singleHeader)), {
        formatVersion: 1,
        osId: 'single_os',
    });
    assert.deepEqual(readXiaobaiOsReference(readChatMetadataHeader(fixture.groupHeader)), {
        formatVersion: 1,
        osId: 'group_os',
    });
    assert.equal(readChatMetadataHeader(fixture.branchHeader).main_chat, 'parent-chat');
    assert.equal(readChatMetadataHeader([]), null);
    assert.equal(readChatMetadataHeader({}), null);
});
