import assert from 'node:assert/strict';
import test from 'node:test';
import { createImageCardRedrawProvider } from '../image-card-redraw-provider.js';
import { acquireFloorImageJob, getFloorImageJobs, getFloorImageJob, getFloorImagePhase,
    releaseFloorImageJob, observeFloorImageJob, getFloorImageState } from '../floor-image-job.js';
import { publishDrawRunActivity } from '../draw-run-activity.js';

function setup(execute) {
    const message = { mes: '[image:slot]', swipe_id: 0 };
    const ctx = { chatId: 'original', chat: [{ mes: 'earlier' }, message] };
    const input = { ctx, message, messageId: 1, swipeIndex: 0,
        tasks: [{ scene: 'retained tags', placement: { mode: 'existing', slotId: 'slot' } }] };
    const jobs = new Map(), states = [];
    let current = ctx;
    const report = (state, data, messageId) => states.push({ state, data, messageId });
    const options = {
        execute,
        createJob: (id, options) => acquireFloorImageJob(jobs, current, id,
            () => ({ controller: new AbortController(), backendCancel: new AbortController() }), options),
        releaseJob: job => releaseFloorImageJob(jobs, job),
        getCurrentContext: () => current,
        setStateForMessage: (id, state, data) => report(state, data, id),
        classifyError: error => ({ code: error.code }),
    };
    return { input, jobs, states, options, report,
        observe: job => observeFloorImageJob(job, { getCurrentContext: () => current, onStateChange: report,
            classifyError: options.classifyError }),
        switchContext: value => { current = value; },
        run: () => createImageCardRedrawProvider(options)(input) };
}

test('redraw uses a registered cancellable floor batch and publishes its result', async () => {
    const result = { success: 1, total: 1, aborted: false };
    const h = setup(async input => {
        assert.equal(getFloorImageJob(h.jobs, h.input.ctx, 1), input.job);
        input.onStateChange('progress', { current: 1, total: 1 });
        input.onStateChange('success', result);
        return result;
    });
    assert.equal(await h.run(), result);
    assert.equal(h.states.at(-1).state, 'success');
    assert.equal(h.states.at(-1).data.success, 1);
    assert.equal(h.jobs.size, 0);
});

test('backend handoff is not completion and stays in the aggregate until its delivered results settle', async () => {
    const h = setup(async input => input.onStateChange('success', { success: 1, total: 1 }));
    const capsule = h.options.createJob(1);
    const progress = h.observe(capsule);
    progress('accepted', { runId: 'run-capsule', total: 2 });
    h.options.releaseJob(capsule);
    assert.equal(getFloorImagePhase(capsule), 'accepted');
    h.input.nativeMessage = true;
    await h.run();
    assert.equal(h.states.at(-1).state, 'accepted');
    assert.equal(h.states.at(-1).data.total, 3);
    publishDrawRunActivity({ chatId: 'original', runId: 'run-capsule', phase: 'completed', total: 2, success: 2 });
    assert.equal(h.states.at(-1).state, 'success');
    assert.equal(h.states.at(-1).data.success, 3);
    assert.equal(h.jobs.size, 0);
});

test('an occupied floor rejects manual redraw without releasing or resetting the active batch', async () => {
    const h = setup(() => assert.fail('must not submit'));
    const active = h.options.createJob(1);
    await assert.rejects(h.run());
    assert.equal(getFloorImageJob(h.jobs, h.input.ctx, 1), active);
    assert.equal(h.states.length, 0);
});

test('a settled direct request with an unknown result is not an active confirmation spinner', async () => {
    const h = setup(async input => input.onStateChange('success', { success: 0, total: 1, unknown: 1, aborted: true }));
    await h.run();
    assert.equal(h.states.at(-1).state, 'error');
    assert.equal(h.states.at(-1).data.unknown, 1);
    assert.equal(h.jobs.size, 0);
});

test('a late-mounted display reads the same current branch aggregate as live observers', async () => {
    const h = setup(async input => input.onStateChange('success', { success: 1, total: 1 }));
    const capsule = h.options.createJob(1);
    const progress = h.observe(capsule);
    progress('gen', { current: 1, total: 2 });
    h.input.nativeMessage = true;
    await h.run();
    const expected = h.states.at(-1);
    assert.deepEqual(getFloorImageState(h.jobs, h.input.ctx, 1), { state: expected.state, data: expected.data });
    h.input.ctx.chat.shift();
    assert.deepEqual(getFloorImageState(h.jobs, h.input.ctx, 0), { state: expected.state, data: expected.data });
    h.input.message.swipe_id = 1;
    assert.equal(getFloorImageState(h.jobs, h.input.ctx, 0), null);
    h.input.message.swipe_id = 0;
    progress('success', { success: 2, total: 2 });
    releaseFloorImageJob(h.jobs, capsule);
    assert.equal(getFloorImageState(h.jobs, h.input.ctx, 0), null);
});

for (const kind of ['failure', 'cancel', 'uncertain', 'detached', 'lease-lost']) {
    test(`redraw ${kind} retains the actual failure and releases its batch`, async () => {
        const error = new Error(kind);
        if (kind === 'uncertain') error.uncertain = true;
        if (kind === 'detached') error.detached = true;
        if (kind === 'lease-lost') error.code = 'PENDING_JOB_LEASE_LOST';
        const h = setup(async input => {
            if (kind === 'cancel') input.job.controller.abort();
            throw error;
        });
        await assert.rejects(h.run(), caught => caught === error);
        assert.equal(h.states.at(-1).state, kind === 'failure' ? 'error' : kind === 'cancel' ? 'idle' : 'uncertain');
        assert.equal(h.jobs.size, 0);
    });
}

for (const change of ['chat', 'message', 'swipe']) test(`late results cannot repaint a changed ${change}`, async () => {
    const h = setup(async input => {
        if (change === 'chat') h.switchContext({ chatId: 'next', chat: h.input.ctx.chat });
        if (change === 'message') h.input.ctx.chat[1] = { ...h.input.message };
        if (change === 'swipe') h.input.message.swipe_id = 1;
        const count = h.states.length;
        input.onStateChange('success', { success: 1, total: 1 });
        assert.equal(h.states.length, count);
    });
    await h.run();
    assert.equal(h.jobs.size, 0);
});

test('a stale branch rejects before acquiring or repainting', async () => {
    const h = setup(() => assert.fail('stale branch'));
    h.input.message.swipe_id = 1;
    await assert.rejects(h.run());
    assert.equal(h.jobs.size, 0);
    assert.equal(h.states.length, 0);
});

test('capsule and native batches share totals but not cancellation signals', async () => {
    for (let round = 0; round < 100; round++) {
        const h = setup(async input => { input.onStateChange('success', { success: 1, total: 1 }); });
        const capsule = h.options.createJob(1);
        const progress = h.observe(capsule);
        progress('gen', { current: 1, total: 2 });
        h.input.nativeMessage = true;
        await h.run();
        assert.equal(h.states.at(-1).state, 'gen');
        assert.equal(h.states.at(-1).data.total, 3);
        assert.equal(getFloorImagePhase(capsule), 'gen');
        progress('success', { success: 2, total: 2 });
        releaseFloorImageJob(h.jobs, capsule);
        assert.equal(h.states.at(-1).state, 'success');
        assert.equal(h.states.at(-1).data.success, 3);
        assert.equal(h.states.at(-1).data.total, 3);
        assert.equal(h.jobs.size, 0);
    }
});

test('out-of-order swipes project the visible branch and cancel only captured batches', async () => {
    for (let round = 0; round < 100; round++) {
        const completions = [];
        const h = setup(input => new Promise(resolve => completions.push(() => {
            input.onStateChange('success', { success: 1, total: 1 }); resolve();
        })));
        h.input.nativeMessage = true;
        const first = h.run();
        const original = getFloorImageJobs(h.jobs, h.input.ctx, 1);
        h.input.message.swipe_id = 1; h.input.swipeIndex = 1;
        const second = h.run();
        const next = getFloorImageJobs(h.jobs, h.input.ctx, 1);
        original[0].controller.abort();
        assert.equal(next[0].controller.signal.aborted, false);
        completions[1](); await second;
        completions[0](); await first;
        assert.equal(h.states.at(-1).state, 'success');
        assert.equal(h.states.at(-1).data.total, 1);
        assert.equal(h.jobs.size, 0);
    }
});

test('different chats and moved floors retain their own task identity', () => {
    const jobs = new Map();
    const a = { chatId: 'a', chat: [{}] }, b = { chatId: 'b', chat: [{}] };
    const create = () => ({ controller: new AbortController() });
    const first = acquireFloorImageJob(jobs, a, 0, create);
    const second = acquireFloorImageJob(jobs, b, 0, create);
    a.chat.unshift({});
    assert.equal(getFloorImageJob(jobs, a, 1), first);
    getFloorImageJobs(jobs, a, 1).forEach(job => job.controller.abort());
    assert.equal(second.controller.signal.aborted, false);
    releaseFloorImageJob(jobs, first); releaseFloorImageJob(jobs, second);
    assert.equal(jobs.size, 0);
});

test('text-source work has no synthetic chat floor and cannot be cancelled by a floor button', () => {
    const jobs = new Map(), ctx = { chatId: 'a', chat: [{}] };
    const job = acquireFloorImageJob(jobs, ctx, 'ebook:chapter', () => ({ controller: new AbortController() }), { scope: 'text' });
    assert.equal(getFloorImageJobs(jobs, ctx, 0).length, 0);
    assert.equal(job.controller.signal.aborted, false);
    releaseFloorImageJob(jobs, job);
    assert.equal(jobs.size, 0);
});
