import assert from 'node:assert/strict';
import test from 'node:test';
import {
    createRecallDiagnostics, recordRecallObservation, recordRecallIndexProgress,
    recordRecallRuntimeProgress, recallProgressStage,
} from '../recall-diagnostics.js';

// The UI identifies the actual vector backend, not every task on the main thread.
test('backend observation distinguishes cold/warm worker and fallback without changing recall stages', () => {
    for (const backend of ['worker', 'main-fallback']) {
        const d = createRecallDiagnostics();
        recordRecallRuntimeProgress(d, { phase: 'worker-start', backend: 'worker', reused: false });
        assert.equal(recallProgressStage(d), 'worker-start');
        recordRecallRuntimeProgress(d, { phase: 'backend-ready', backend, reused: false, error: backend === 'main-fallback' ? 'fixture' : undefined });
        recordRecallRuntimeProgress(d, { phase: 'load-start', backend });
        assert.equal(recallProgressStage(d), backend === 'worker' ? 'worker-load' : 'main-load');
        d.stage = 'round1-retrieval';
        assert.equal(recallProgressStage(d), backend === 'worker' ? 'worker-retrieval' : 'main-retrieval');
        assert.equal(d.stage, 'round1-retrieval');
        d.stage = 'lexical-search';
        assert.equal(recallProgressStage(d), 'lexical-search');
        recordRecallRuntimeProgress(d, { phase: 'backend-ready', backend, reused: true, error: 'fixture' });
        recordRecallRuntimeProgress(d, { phase: 'release-start', backend });
        recordRecallRuntimeProgress(d, { phase: 'release-end', backend });
        assert.equal(d.stage, 'lexical-search');
        assert.equal(d.fallbacks.length, backend === 'main-fallback' ? 1 : 0);
        assert.equal(d.observations.filter(e => e.phase === 'backend-ready').at(-1).reused, true);
    }
});

test('parallel indexing never steals foreground progress; actual waiting exposes acquisition mode', () => {
    const d = createRecallDiagnostics();
    d.stage = 'round1-embed';
    recordRecallIndexProgress(d, { phase: 'build', mode: 'build' });
    assert.equal(recallProgressStage(d), 'round1-embed');
    d.stage = 'index-wait';
    assert.equal(recallProgressStage(d), 'index-build');
    recordRecallIndexProgress(d, { phase: 'update', mode: 'update' });
    assert.equal(recallProgressStage(d), 'index-update');
    recordRecallIndexProgress(d, { phase: 'wait', mode: 'update' });
    assert.equal(recallProgressStage(d), 'index-wait');
    recordRecallIndexProgress(d, { phase: 'ready', mode: 'update', documentCount: 400 });
    d.stage = 'lexical-search';
    assert.equal(recallProgressStage(d), 'lexical-search');
    recordRecallIndexProgress(d, { phase: 'hit', documentCount: 400 });
    assert.equal(d.observations.at(-1).documentCount, 400);
    assert.equal(d.stage, 'lexical-search');
});

test('completed run ignores late producer results but records the later host rendezvous', () => {
    const d = createRecallDiagnostics();
    d.stage = 'round1-embed';
    d.finishedAt = performance.now();
    const count = d.observations.length;
    recordRecallIndexProgress(d, { phase: 'failed', error: new Error('late') });
    recordRecallRuntimeProgress(d, { phase: 'load-start', backend: 'main-fallback' });
    d.stage = 'lexical-search';
    assert.equal(d.observations.length, count);
    assert.equal(d.backend, null);
    assert.equal(d.stage, 'round1-embed');
    recordRecallObservation(d, 'host', { phase: 'interceptor-start' });
    assert.equal(d.observations.at(-1).phase, 'interceptor-start');
    recordRecallRuntimeProgress(d, { phase: 'release-start', backend: 'worker' });
    recordRecallRuntimeProgress(d, { phase: 'release-end', backend: 'worker' });
    assert.deepEqual(d.observations.slice(-2).map(e => e.phase), ['release-start', 'release-end']);
    assert.equal(d.stage, 'round1-embed');
});

test('trace retains bounded timing receipts, never arbitrary producer payloads', () => {
    const d = createRecallDiagnostics();
    for (let i = 0; i < 300; i++) {
        recordRecallObservation(d, 'index', { phase: 'wait', mode: 'update', documentCount: i, text: 'private', vector: [1], apiKey: 'secret' });
    }
    assert.equal(d.observations.length, 256);
    assert.equal(d.observations.at(-1).documentCount, 299);
    assert.ok(d.observations.every(e => Number.isFinite(e.at) && e.at >= 0));
    assert.ok(d.observations.every(e => !('text' in e) && !('vector' in e) && !('apiKey' in e)));
    const serialized = JSON.parse(JSON.stringify(d));
    assert.equal(serialized.stage, 'prepare');
    assert.equal(serialized.observations.length, 256);
});
