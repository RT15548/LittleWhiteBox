import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { MESSAGES_PARTITION } from '../apps/messages/partition.js';
import { validateMessages as validateV1 } from '../domains/messages/migrations/v1/invariants.js';
import { projectionText as v1Text } from '../domains/messages/migrations/v1/transcript.js';
import { projectionText } from '../domains/messages/transcript.js';

// Actual 2026-09-05 native-host acceptance sidecar, produced by the v1 writer
// shipped on upstream (e236360). Extracted without changing fields or receipts
// from messages-st-data/.../LittleWhiteBox_OS_aa0c5010-...json. Fixed test dialogue,
// not a user's chat; no v2 fields are backfilled into this frozen fixture.
const fixture = JSON.parse(await readFile(new URL('./fixtures/messages-v1-production.json', import.meta.url), 'utf8'));

test('official v1 sidecar loads once into v2 without changing messages, contacts, segments or projection evidence', () => {
    validateV1(fixture);
    assert.equal(Object.hasOwn(fixture, 'pendingMutation'), false);
    const result = MESSAGES_PARTITION.parse(fixture);
    assert.equal(result.ok, true);
    const expected = { ...fixture, version: 2, pendingMutation: null };
    assert.deepEqual(result.value, expected);
    assert.deepEqual(MESSAGES_PARTITION.parse(MESSAGES_PARTITION.serialize(result.value)).value, expected);
    for (const segment of fixture.segments) {assert.equal(projectionText(result.value, segment), v1Text(fixture, segment));}
    assert.throws(() => MESSAGES_PARTITION.serialize(fixture), /invalid_domain/);
    assert.equal(fixture.version, 1);
});

test('migration refuses damaged legacy evidence rather than repairing or blessing it', () => {
    const damaged = structuredClone(fixture); damaged.messages[0].payload.text = 'different';
    assert.equal(MESSAGES_PARTITION.parse(damaged).ok, false);
    const future = { ...fixture, version: 3 };
    assert.equal(MESSAGES_PARTITION.parse(future).ok, false);
});
