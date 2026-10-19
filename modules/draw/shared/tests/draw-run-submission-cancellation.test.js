import assert from 'node:assert/strict';
import test from 'node:test';
import { submitDrawRun } from '../draw-run-coordinator.js';
import { findDrawRunMarker } from '../draw-run-markers.js';
import { hashSceneSource } from '../scene-source.js';
import { acquireFloorImageJob, failFloorImageJob, getFloorImageState, observeFloorImageJob } from '../floor-image-job.js';
import { subscribeDrawRunActivity } from '../draw-run-activity.js';

function setup(runId) {
    const message = { mes: 'A character stands beside the sea.', swipe_id: 0 };
    const ctx = { chatId: runId, chat: [message], getRequestHeaders: () => ({}) };
    const sourceHash = hashSceneSource(message.mes);
    const controller = new AbortController();
    const phases = [];
    let persisted = structuredClone(ctx.chat);
    const options = {
        ctx, message, messageId: 0, targetSwipeIndex: 0, targetHash: sourceHash, runId,
        getCurrentContext: () => ctx, isMessageBeingEdited: () => false,
        signal: controller.signal, imageProvider: 'novelai', generationRecipe: {},
        prepared: { version: 1, planner: { validationContext: { sceneSource: { sourceHash } } },
            agent: { providerConfig: { provider: 'openai-compatible', model: 'offline-model' } } },
        saveAndConfirm: async ({ precondition, verify }) => {
            if (precondition) assert.equal(precondition(persisted), true);
            persisted = structuredClone(ctx.chat);
            assert.equal(verify(persisted), true);
        },
        onStateChange: phase => phases.push(phase),
    };
    return { options, controller, phases, persisted: () => persisted };
}

test('cancelling while the marker is saved clears it without sending a Draw Run POST', async t => {
    const fixture = setup('run-cancel-during-save');
    const jobs = new Map(), states = [], reconciled = [];
    const job = acquireFloorImageJob(jobs, fixture.options.ctx, 0, () => ({ controller: fixture.controller }));
    fixture.options.onStateChange = observeFloorImageJob(job, {
        getCurrentContext: () => fixture.options.ctx,
        onStateChange: state => states.push(state),
    });
    t.after(subscribeDrawRunActivity(detail => {
        if (detail.runId === fixture.options.runId && detail.phase === 'reconciled') reconciled.push(detail);
    }));
    const saveAndConfirm = fixture.options.saveAndConfirm;
    let saves = 0;
    fixture.options.saveAndConfirm = async options => {
        await saveAndConfirm(options);
        if (++saves === 1) fixture.controller.abort();
    };
    const requests = [];
    fixture.options.fetchImpl = async (url, options) => {
        requests.push({ url, method: options.method });
        options.signal.throwIfAborted();
        return Response.json({});
    };
    await assert.rejects(submitDrawRun(fixture.options), error => {
        assert.equal(error.code, 'DRAW_RUN_CANCELLED');
        assert.equal(error.uncertain, false);
        failFloorImageJob(job, error);
        return true;
    });
    assert.equal(states.at(-1), 'idle');
    assert.equal(getFloorImageState(jobs, fixture.options.ctx, 0), null);
    assert.equal(reconciled.length, 1);
    assert.deepEqual(requests, []);
    assert.equal(saves, 2);
    assert.equal(findDrawRunMarker(fixture.options.ctx.chat, fixture.options.runId), null);
    assert.equal(findDrawRunMarker(fixture.persisted(), fixture.options.runId), null);
    assert.equal(states.includes('uncertain'), false);
});

test('an aborted POST still confirms the backend task using an independent bounded GET', async () => {
    const fixture = setup('run-cancel-during-post');
    const requests = [];
    fixture.options.fetchImpl = async (_url, options) => {
        requests.push(options.method);
        if (options.method === 'POST') {
            fixture.controller.abort();
            options.signal.throwIfAborted();
        }
        assert.equal(options.signal.aborted, false);
        return Response.json({ run: { id: fixture.options.runId, state: 'cancelling', cancelRequestedAt: 1 } });
    };
    const result = await submitDrawRun(fixture.options);
    assert.deepEqual(requests, ['POST', 'GET']);
    assert.equal(result.status, 'accepted');
    assert.equal(result.run.state, 'cancelling');
    assert.equal(result.recovered, true);
    assert.equal(fixture.phases.includes('uncertain'), false);
});

test('cancelling locally without a backend receipt does not pretend an in-flight POST was stopped', async t => {
    const fixture = setup('run-cancel-unconfirmed');
    t.mock.method(console, 'error', () => {});
    fixture.options.fetchImpl = async (_url, options) => {
        if (options.method === 'POST') {
            fixture.controller.abort();
            options.signal.throwIfAborted();
        }
        assert.equal(options.signal.aborted, false);
        return Response.json({ code: 'run_not_found' }, { status: 404 });
    };
    const result = await submitDrawRun(fixture.options);
    assert.equal(result.status, 'uncertain');
    assert.ok(findDrawRunMarker(fixture.options.ctx.chat, fixture.options.runId));
});
