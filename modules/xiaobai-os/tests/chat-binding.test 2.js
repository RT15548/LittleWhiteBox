import assert from 'node:assert/strict';
import test from 'node:test';

import { createChatBindingManager } from '../storage/chat-binding.js';
import { createChatReferencePort } from '../storage/chat-reference.js';
import { createSidecarIndex } from '../storage/sidecar-index.js';

const owner = 'avatar.png';
const currentBinding = () => ({ kind: 'character', ownerLocator: owner, chatId: 'chat-child' });
const refMetadata = osId => ({ extensions: { LittleWhiteBox: { xiaobaiOsRef: { formatVersion: 1, osId } } } });
const sidecar = (osId, binding, partitions = { map: { schemaVersion: 1, value: 'parent' } }) => ({
    formatVersion: 1,
    osId,
    binding,
    revision: 7,
    commitId: 'old_commit',
    partitions,
});

function harness({ metadata = {}, mainChatId, headers = new Map(), files = new Map() } = {}) {
    const state = {
        current: { identityKey: 'character:avatar.png:chat-child', binding: currentBinding(), metadata, mainChatId },
        headers,
        files,
        writes: [],
        deletes: [],
        indexFile: null,
        indexReplace: null,
        replace: null,
    };
    const metadataAdapter = {
        capture: () => state.current,
        async save(capture) {
            state.headers.set(`${capture.binding.ownerLocator}:${capture.binding.chatId}`, structuredClone(capture.metadata));
        },
        async read(binding) {
            const key = `${binding.ownerLocator}:${binding.chatId}`;
            return state.headers.has(key) ? structuredClone(state.headers.get(key)) : null;
        },
    };
    const storage = {
        async read(osId) { return state.files.has(osId) ? structuredClone(state.files.get(osId)) : null; },
        async replace(input) {
            state.writes.push(structuredClone(input));
            if (state.replace) { return await state.replace(input); }
            state.files.set(input.candidate.osId, structuredClone(input.candidate));
            return { status: 'confirmed' };
        },
        async delete(osId) {
            state.deletes.push(osId);
            return state.files.delete(osId) ? 'deleted' : 'missing';
        },
    };
    const index = createSidecarIndex({
        async read() { return structuredClone(state.indexFile); },
        async replace(_name, value) {
            if (state.indexReplace) { return await state.indexReplace(value); }
            state.indexFile = structuredClone(value);
        },
    }, { warn() { } });
    const references = createChatReferencePort(metadataAdapter);
    const ids = ['new_os', 'new_commit', 'next_id'];
    const manager = createChatBindingManager({
        metadata: metadataAdapter,
        references,
        storage,
        index,
        createId: () => ids.shift(),
    });
    return { state, metadataAdapter, storage, index, references, manager };
}

test('opening an internal branch copies parent partitions to an independent revision-zero sidecar', async () => {
    const headers = new Map([[`${owner}:chat-parent`, refMetadata('parent_os')]]);
    const files = new Map([['parent_os', sidecar('parent_os', {
        kind: 'character', ownerLocator: owner, chatId: 'chat-parent',
    })]]);
    const testHarness = harness({ mainChatId: 'chat-parent', headers, files });

    const result = await testHarness.manager.resolveCurrent();
    assert.equal(result.status, 'ready');
    assert.equal(result.created, true);
    assert.equal(result.envelope.osId, 'new_os');
    assert.equal(result.envelope.revision, 0);
    assert.equal(result.envelope.commitId, 'new_commit');
    assert.deepEqual(result.envelope.partitions, files.get('parent_os').partitions);
    assert.equal(files.get('parent_os').revision, 7);
    assert.deepEqual(testHarness.references.capture().reference, { formatVersion: 1, osId: 'new_os' });
});

test('sidecar index merges each write with the latest server copy', async () => {
    const testHarness = harness();
    await testHarness.index.remember('local_os', currentBinding());
    testHarness.state.indexFile.entries.remote_os = {
        kind: 'character',
        ownerLocator: owner,
        chatId: 'chat-from-phone',
    };

    await testHarness.index.remember('second_local_os', currentBinding());

    assert.deepEqual(Object.keys(testHarness.state.indexFile.entries).sort(), [
        'local_os',
        'remote_os',
        'second_local_os',
    ]);
});

test('opening a referenced chat does not wait for best-effort index persistence', async () => {
    const binding = currentBinding();
    const files = new Map([['os_1', sidecar('os_1', binding)]]);
    const testHarness = harness({ metadata: refMetadata('os_1'), files });
    testHarness.state.indexReplace = () => new Promise(() => undefined);

    const result = await Promise.race([
        testHarness.manager.resolveCurrent(),
        new Promise(resolve => setTimeout(() => resolve({ status: 'index-blocked-resolution' }), 100)),
    ]);

    assert.equal(result.status, 'ready');
    assert.equal(result.envelope.osId, 'os_1');
});

test('an unknown branch sidecar write keeps one candidate and never creates a second osId', async () => {
    const headers = new Map([[`${owner}:chat-parent`, refMetadata('parent_os')]]);
    const files = new Map([['parent_os', sidecar('parent_os', {
        kind: 'character', ownerLocator: owner, chatId: 'chat-parent',
    })]]);
    const testHarness = harness({ mainChatId: 'chat-parent', headers, files });
    let firstCandidate;
    testHarness.state.replace = async input => {
        firstCandidate ??= structuredClone(input.candidate);
        return { status: 'unconfirmed', observed: null };
    };

    const first = await testHarness.manager.resolveCurrent();
    assert.deepEqual(first, { status: 'unconfirmed', osId: 'new_os' });
    const observed = await testHarness.manager.resolveCurrent();
    assert.deepEqual(observed, { status: 'unconfirmed', osId: 'new_os' });
    assert.equal(testHarness.state.writes.length, 1);

    testHarness.state.files.set('new_os', structuredClone(firstCandidate));
    const confirmed = await testHarness.manager.resolveCurrent();
    assert.equal(confirmed.status, 'ready');
    assert.equal(confirmed.envelope.osId, 'new_os');
    assert.deepEqual(testHarness.references.capture().reference, { formatVersion: 1, osId: 'new_os' });
    assert.equal(testHarness.state.writes.length, 1);
});

test('explicit retry resends the same unknown branch candidate without rebuilding it', async () => {
    const headers = new Map([[`${owner}:chat-parent`, refMetadata('parent_os')]]);
    const files = new Map([['parent_os', sidecar('parent_os', {
        kind: 'character', ownerLocator: owner, chatId: 'chat-parent',
    })]]);
    const testHarness = harness({ mainChatId: 'chat-parent', headers, files });
    let attempts = 0;
    testHarness.state.replace = async input => {
        attempts++;
        if (attempts === 1) { return { status: 'unconfirmed', observed: null }; }
        testHarness.state.files.set(input.candidate.osId, structuredClone(input.candidate));
        return { status: 'confirmed' };
    };

    assert.equal((await testHarness.manager.resolveCurrent()).status, 'unconfirmed');
    const retried = await testHarness.manager.retryPendingCurrent();
    assert.equal(retried.status, 'ready');
    assert.equal(testHarness.state.writes.length, 2);
    assert.deepEqual(testHarness.state.writes[1].candidate, testHarness.state.writes[0].candidate);
});

test('a stale binding whose former chat is gone is repaired as a rename without changing osId', async () => {
    const oldBinding = { kind: 'character', ownerLocator: owner, chatId: 'old-name' };
    const files = new Map([['os_1', sidecar('os_1', oldBinding)]]);
    const testHarness = harness({ metadata: refMetadata('os_1'), files });

    const result = await testHarness.manager.resolveCurrent();
    assert.equal(result.status, 'ready');
    assert.equal(result.created, false);
    assert.equal(result.envelope.osId, 'os_1');
    assert.equal(result.envelope.revision, 8);
    assert.deepEqual(result.envelope.binding, currentBinding());
});

test('a copied reference clones when the former bound chat still exists', async () => {
    const oldBinding = { kind: 'character', ownerLocator: owner, chatId: 'source-chat' };
    const headers = new Map([[`${owner}:source-chat`, refMetadata('os_1')]]);
    const files = new Map([['os_1', sidecar('os_1', oldBinding)]]);
    const testHarness = harness({ metadata: refMetadata('os_1'), headers, files });

    const result = await testHarness.manager.resolveCurrent();
    assert.equal(result.status, 'ready');
    assert.equal(result.created, true);
    assert.notEqual(result.envelope.osId, 'os_1');
    assert.equal(files.get('os_1').revision, 7);
    assert.equal(testHarness.references.capture().reference.osId, result.envelope.osId);
});

test('ambiguous deletion keeps every sidecar while unique deletion removes one', async () => {
    const testHarness = harness();
    await testHarness.index.remember('os_1', { kind: 'character', ownerLocator: 'a.png', chatId: 'same' });
    await testHarness.index.remember('os_2', { kind: 'character', ownerLocator: 'b.png', chatId: 'same' });
    testHarness.state.files.set('os_1', {});
    testHarness.state.files.set('os_2', {});

    assert.equal(await testHarness.manager.handleChatDeleted('same'), 'retained');
    assert.deepEqual(testHarness.state.deletes, []);
    assert.equal(await testHarness.manager.handleChatDeleted('same', 'a.png'), 'deleted');
    assert.deepEqual(testHarness.state.deletes, ['os_1']);
});

test('a damaged index is reset without preventing reference and sidecar loading', async () => {
    const files = new Map([['os_1', sidecar('os_1', currentBinding())]]);
    const testHarness = harness({ metadata: refMetadata('os_1'), files });
    testHarness.state.indexFile = { formatVersion: 999, entries: [] };
    const result = await testHarness.manager.resolveCurrent();
    assert.equal(result.status, 'ready');
    assert.equal(result.envelope.osId, 'os_1');
    await testHarness.index.snapshot();
    assert.equal(testHarness.state.indexFile.formatVersion, 1);
});
