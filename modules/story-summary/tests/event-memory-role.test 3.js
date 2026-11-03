import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { EVENT_MEMORY_ROLES, normalizeEventMemoryRole, projectSummaryEvent } from '../data/events.js';
import { upgradeStoredEventMemoryRoles } from '../data/migrations/event-memory-role.js';
import { applySummaryUndo, buildSummaryUndo } from '../data/summary-undo.js';

// Frozen real event from the 2026-04-25 story-summary replay snapshot, without added current fields.
const historicalEvent = JSON.parse(readFileSync(new URL('./fixtures/event-before-memory-role.json', import.meta.url), 'utf8'));

test('event input keeps a single recognized memory role without guessing invalid classifications', () => {
    for (const role of EVENT_MEMORY_ROLES) {
        assert.equal(normalizeEventMemoryRole(` ${role} `), role);
        assert.equal(projectSummaryEvent({ ...historicalEvent, memoryRole: role }).memoryRole, role);
    }
    for (const value of [undefined, null, '', '核心', '相遇', ['状态变化'], '状态变化|约定承诺']) {
        assert.equal(normalizeEventMemoryRole(value), '');
    }
});

test('loading a real old event preserves its evidence without inventing a memory role', () => {
    const event = structuredClone(historicalEvent);
    const store = { json: { events: [event], keywords: [{ text: '荒岛求生', weight: '核心' }] } };
    assert.equal(upgradeStoredEventMemoryRoles(store), true);
    const evidence = structuredClone(historicalEvent);
    delete evidence.type;
    delete evidence.weight;
    assert.deepEqual(store.json.events, [{ ...evidence, memoryRole: '' }]);
    assert.deepEqual(store.json.keywords, [{ text: '荒岛求生', weight: '核心' }]);
    assert.deepEqual(event, historicalEvent);
    assert.equal(upgradeStoredEventMemoryRoles(store), false);
});

test('load-time event projection preserves keyed and full-snapshot exact undo', () => {
    for (const fullSnapshot of [false, true]) {
        const previous = { events: [structuredClone(historicalEvent)] };
        // Duplicate IDs exercise the supported full-snapshot undo representation.
        if (fullSnapshot) previous.events.push(structuredClone(historicalEvent));
        const generated = structuredClone(previous);
        generated.events[0].summary = 'Changed evidence (#20-21)';
        generated.events[0].memoryRole = '状态变化';
        const store = {
            json: generated,
            summaryHistory: [{
                format: 1, previousEndMesId: 19, endMesId: 39,
                undo: buildSummaryUndo(previous, generated),
            }],
        };
        upgradeStoredEventMemoryRoles(store);
        const restored = applySummaryUndo(store.json, store.summaryHistory[0].undo);
        assert.ok(restored, 'schema conversion must not invalidate exact rollback');
        assert.deepEqual(restored.events, previous.events.map(projectSummaryEvent));
        store.json.events[0].summary = 'Manual edit after generation';
        assert.equal(applySummaryUndo(store.json, store.summaryHistory[0].undo), null);
    }
});

test('new event projection keeps source floors and causal references while removing superseded fields', () => {
    const input = { ...historicalEvent, memoryRole: '约定承诺', causedBy: ['evt-8'] };
    const projected = projectSummaryEvent(input);
    assert.equal(projected.memoryRole, '约定承诺');
    assert.equal(projected.summary, input.summary);
    assert.equal(projected._addedAt, input._addedAt);
    assert.deepEqual(projected.causedBy, ['evt-8']);
    assert.equal(Object.hasOwn(projected, 'type'), false);
    assert.equal(Object.hasOwn(projected, 'weight'), false);
    assert.deepEqual(projectSummaryEvent(projected), projected);
});
