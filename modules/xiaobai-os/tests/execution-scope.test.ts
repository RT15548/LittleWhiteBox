import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { XiaobaiOsExecutionScope } from '../kernel/execution-scope.js';

test('background failure is logged and delivered to its owner without changing the returned rejection', async t => {
    const log = t.mock.method(console, 'error', () => undefined);
    const failures: unknown[] = [];
    const scope = new XiaobaiOsExecutionScope(error => { failures.push(error); });
    const error = new Error('task failed');
    const result = scope.run(() => { throw error; });
    await assert.rejects(result, failure => failure === error);
    assert.deepEqual(failures, [error]);
    assert.equal(log.mock.calls[0].arguments[1], error);
    await scope.dispose();
});

test('a throwing failure owner cannot create an unhandled observer rejection', async t => {
    const log = t.mock.method(console, 'error', () => undefined);
    const error = new Error('background failed');
    const reportingError = new Error('owner failed');
    const scope = new XiaobaiOsExecutionScope(() => { throw reportingError; });
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Intentionally leave the result unawaited to verify scope-owned rejection reporting.
    scope.run(async () => { throw error; });
    await setImmediate();
    assert.equal(log.mock.calls[0].arguments[1], error);
    assert.deepEqual(log.mock.calls[1].arguments[1], { error, reportingError });
    await scope.dispose();
});

test('a disposed scope does not start new work and observes even an unawaited rejection', async t => {
    const log = t.mock.method(console, 'error', () => undefined);
    const failures: unknown[] = [];
    const scope = new XiaobaiOsExecutionScope(error => { failures.push(error); });
    await scope.dispose();
    let started = false;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Intentionally leave the result unawaited to verify disposed-scope rejection ownership.
    scope.run(() => { started = true; });
    await setImmediate();
    assert.equal(started, false);
    assert.equal(log.mock.callCount(), 1);
    assert.ok(log.mock.calls[0].arguments[1] instanceof Error);
    assert.deepEqual(failures, []);
});

test('cleanup failures and throwing owners do not prevent remaining cleanup or task draining', async t => {
    const log = t.mock.method(console, 'error', () => undefined);
    const error = new Error('cleanup failed');
    const scope = new XiaobaiOsExecutionScope(() => { throw new Error('owner failed'); });
    const releases: number[] = [];
    let finishTask!: () => void;
    const task = scope.run(() => new Promise<void>(resolve => { finishTask = resolve; }));
    await Promise.resolve();
    scope.addCleanup(() => { releases.push(1); });
    scope.addCleanup(() => { releases.push(2); throw error; });
    let disposed = false;
    const disposing = scope.dispose().then(() => { disposed = true; });
    await setImmediate();
    assert.deepEqual(releases, [2, 1]);
    assert.equal(disposed, false);
    assert.equal(log.mock.calls[0].arguments[1], error);
    finishTask();
    await Promise.all([task, disposing]);
    assert.equal(disposed, true);
});

test('cleanup registered after disposal is still observed when both cleanup and owner fail', async t => {
    const log = t.mock.method(console, 'error', () => undefined);
    const error = new Error('late cleanup failed');
    const scope = new XiaobaiOsExecutionScope(() => { throw new Error('owner failed'); });
    await scope.dispose();
    scope.addCleanup(async () => { throw error; });
    await setImmediate();
    assert.equal(log.mock.calls[0].arguments[1], error);
    assert.equal(log.mock.callCount(), 2);
});
