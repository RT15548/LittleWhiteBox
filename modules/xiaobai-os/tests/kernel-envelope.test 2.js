import assert from 'node:assert/strict';
import test from 'node:test';

import {
    assertJsonValue,
    parseXiaobaiOsEnvelope,
    serializeXiaobaiOsEnvelope,
} from '../kernel/envelope.js';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';

function envelope(overrides = {}) {
    return {
        formatVersion: 1,
        osId: 'os_1',
        binding: { kind: 'character', ownerLocator: 'avatar.png', chatId: 'chat-a' },
        revision: 0,
        commitId: 'commit_1',
        partitions: { unknown: { untouched: true } },
        ...overrides,
    };
}

test('envelope parser is strict at the envelope and binding boundaries', () => {
    assert.deepEqual(parseXiaobaiOsEnvelope(envelope()), envelope());
    assert.throws(() => parseXiaobaiOsEnvelope({ ...envelope(), extra: true }), /fields are invalid/);
    assert.throws(() => parseXiaobaiOsEnvelope(envelope({ revision: -1 })), /revision/);
    assert.throws(() => parseXiaobaiOsEnvelope(envelope({ osId: '../unsafe' })), /osId/);
    assert.throws(() => parseXiaobaiOsEnvelope(envelope({
        binding: { kind: 'character', ownerLocator: 'avatar.png', chatId: 'chat-a', extra: true },
    })), /binding fields/);
});

test('envelope serialization rejects values that JSON.stringify would silently erase', () => {
    assert.throws(() => serializeXiaobaiOsEnvelope(envelope({ partitions: { bad: undefined } })), /JSON value/);
    assert.throws(() => serializeXiaobaiOsEnvelope(envelope({ partitions: { bad: Number.NaN } })), /non-finite/);
    assert.throws(() => assertJsonValue({ bad: new Date() }), /plain JSON objects/);
    const circular = {};
    circular.self = circular;
    assert.throws(() => assertJsonValue(circular), /circular/);
});

test('partition registry keeps parsing local to the requested owner', () => {
    const registry = new XiaobaiOsPartitionRegistry();
    let parsedA = 0;
    let parsedB = 0;
    const a = {
        key: 'appA', ownerId: 'appA', schemaVersion: 1,
        parse(value) { parsedA++; return { ok: true, value }; },
        serialize: value => value,
        createInitial: () => ({ schemaVersion: 1 }),
    };
    const b = {
        key: 'appB', ownerId: 'appB', schemaVersion: 1,
        parse(value) { parsedB++; return { ok: false, error: { code: 'partition_invalid', message: String(value) } }; },
        serialize: value => value,
        createInitial: () => ({ schemaVersion: 1 }),
    };
    registry.register(a);
    registry.register(b);
    assert.equal(registry.require('appA'), a);
    assert.equal(parsedA, 0);
    assert.equal(parsedB, 0);
    assert.throws(() => registry.register({ ...a }), /duplicate/);
});
