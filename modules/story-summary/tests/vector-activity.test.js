import assert from 'node:assert/strict';
import test from 'node:test';
import { observeVectorActivity, trackVectorActivity } from '../vector/runtime/vector-activity.js';
import { runVectorWriteTask, VECTOR_WRITE_SCOPES } from '../vector/runtime/maintenance-coordinator.js';
import { summarizeL0Floors } from '../vector/pipeline/l0-floor-status.js';

const api = { url: 'https://user:secret@embedding.invalid/v1?api_key=private', key: 'credential' };

test('a fully idle query window records positive empty evidence without retaining credentials', () => {
    const trace = observeVectorActivity(api).finish();
    assert.equal(trace.queryOrigin, 'https://embedding.invalid');
    assert.equal(trace.timeline.length, 2);
    assert.ok(trace.timeline.every(entry => entry.writer === null && entry.queuedWrites === 0 && entry.activities.length === 0));
    // Credential exclusion is a security contract, not a copy/source snapshot.
    for (const secret of ['secret', 'api_key', 'private', 'credential']) assert.equal(JSON.stringify(trace).includes(secret), false);
});

test('work that ended before a timeout remains visible with its original progress and failure outcome', async () => {
    const observation = observeVectorActivity(api);
    await runVectorWriteTask({ chatId: 'fixture', kind: 'delayed-maintenance', scope: VECTOR_WRITE_SCOPES.EMBEDDING },
        () => trackVectorActivity({ chatId: 'fixture', phase: 'l0-extraction', api, unit: 'floors' }, async activity => {
            activity.update({ total: 20, completed: 2, activeUnits: 1, activeFloors: [30], state: 'extracting' });
            return { failed: 1, cancelled: false };
        }));
    const trace = observation.finish();
    const active = trace.timeline.flatMap(entry => entry.activities).find(item => item.activeFloors.includes(30));
    assert.equal(active.remaining, 18);
    assert.equal(active.sameOrigin, true);
    assert.equal(active.activeUnits, 1);
    const finished = trace.timeline.flatMap(entry => entry.activities).find(item => item.state === 'finished');
    assert.equal(finished.outcome.failed, 1);
    assert.deepEqual(trace.timeline.at(-1).activities, []);
    assert.equal(trace.timeline.at(-1).writer, null);
    assert.ok(trace.timeline.some(entry => entry.writer?.kind === 'delayed-maintenance'));
    const frozen = structuredClone(trace);
    await trackVectorActivity({ phase: 'later', unit: 'floors' }, async () => {});
    assert.deepEqual(trace, frozen);
});

test('local index work and other origins are not mislabeled as shared provider work', async () => {
    const observation = observeVectorActivity(api);
    await trackVectorActivity({ phase: 'lexical-index', unit: 'batches' }, async () => {});
    await trackVectorActivity({ phase: 'l0-extraction', api: { url: 'https://other.invalid/v1' }, unit: 'floors' }, async () => {});
    const states = observation.finish().timeline.flatMap(entry => entry.activities);
    assert.equal(states.find(state => state.phase === 'lexical-index').sameOrigin, null);
    assert.equal(states.find(state => state.phase === 'l0-extraction').sameOrigin, false);
});

test('unknown queued write kinds are visible and not incorrectly reported as idle', async () => {
    const observation = observeVectorActivity(api);
    await runVectorWriteTask({ chatId: 'fixture', kind: 'config-reload', scope: VECTOR_WRITE_SCOPES.CONFIG }, async () => {});
    const trace = observation.finish();
    assert.ok(trace.timeline.some(entry => entry.queuedWrites > 0));
    assert.ok(trace.timeline.some(entry => entry.writer?.kind === 'config-reload'));
});

test('exceptions release live activity and truncation is explicit while retaining window boundaries', async () => {
    const observation = observeVectorActivity(api);
    const failure = new Error('fixture');
    await assert.rejects(trackVectorActivity({ phase: 'l1-vectorization', api, unit: 'chunks' }, async activity => {
        for (let completed = 0; completed < 150; completed++) activity.update({ completed, total: 150 });
        throw failure;
    }), error => error === failure);
    const trace = observation.finish();
    assert.ok(trace.dropped > 0);
    assert.deepEqual(trace.timeline[0].activities, []);
    assert.deepEqual(trace.timeline.at(-1).activities, []);
    assert.equal(trace.timeline.flatMap(entry => entry.activities).find(state => state.state === 'finished').outcome.errorName, 'Error');
    assert.ok(observeVectorActivity(api).finish().timeline.every(entry => entry.activities.length === 0));
});

test('floor 30 becomes terminal at the scheduling limit without hiding the incomplete floor', () => {
    const chat = Array.from({ length: 31 }, () => ({ is_user: true }));
    chat[30] = { is_user: false };
    const retriable = summarizeL0Floors(chat, { 30: { status: 'fail', attempts: 2 } });
    assert.equal(retriable.pending, 1);
    assert.equal(retriable.terminalFail, 0);
    const terminal = summarizeL0Floors(chat, { 30: { status: 'fail', attempts: 3 } });
    assert.equal(terminal.pending, 0);
    assert.equal(terminal.incomplete, 1);
    assert.deepEqual(terminal.failedFloors, [{ floor: 30, attempts: 3, terminal: true }]);
});
