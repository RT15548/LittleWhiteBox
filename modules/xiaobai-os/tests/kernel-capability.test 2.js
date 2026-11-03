import assert from 'node:assert/strict';
import test from 'node:test';

import { createCapabilityRegistry, createCapabilityToken } from '../kernel/capability-registry.js';
import { XiaobaiOsExecutionScope } from '../kernel/execution-scope.js';

const token = id => createCapabilityToken(id);

test('capability registry rejects duplicates, missing dependencies and cycles before installation', () => {
    const a = token('a');
    const b = token('b');
    assert.throws(() => createCapabilityRegistry([
        { token: a, ownerId: 'a', dependencies: [], install: () => ({}) },
        { token: a, ownerId: 'a2', dependencies: [], install: () => ({}) },
    ]), /duplicate/);
    assert.throws(() => createCapabilityRegistry([
        { token: a, ownerId: 'a', dependencies: [b], install: () => ({}) },
    ]), /missing/);
    assert.throws(() => createCapabilityRegistry([
        { token: a, ownerId: 'a', dependencies: [b], install: () => ({}) },
        { token: b, ownerId: 'b', dependencies: [a], install: () => ({}) },
    ]), /cycle/);
});

test('capabilities install in dependency order and undeclared access is rejected at runtime', async () => {
    const a = token('a');
    const b = token('b');
    const c = token('c');
    const order = [];
    const registry = createCapabilityRegistry([
        {
            token: b, ownerId: 'b', dependencies: [a], install: context => {
                order.push(`b:${context.require(a).value}`);
                assert.throws(() => context.require(c), /did not declare/);
                return { value: 2 };
            }
        },
        { token: a, ownerId: 'a', dependencies: [], install: () => { order.push('a'); return { value: 1 }; } },
    ]);
    await registry.install();
    assert.deepEqual(order, ['a', 'b:1']);
    assert.equal(registry.require(b).value, 2);
});

test('execution scope reports background rejection and aborts owned work on dispose', async () => {
    const failures = [];
    const scope = new XiaobaiOsExecutionScope(error => failures.push(error.message));
    void scope.run(async () => { throw new Error('background failed'); });
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.deepEqual(failures, ['background failed']);
    await scope.dispose();
    assert.equal(scope.signal.aborted, true);
});

test('execution scope owns listener rejections, timers and in-flight work', async () => {
    const failures = [];
    const scope = new XiaobaiOsExecutionScope(error => failures.push(error.message));
    const target = new EventTarget();
    scope.listen(target, 'sync-failure', () => { throw new Error('listener failed'); });
    scope.listen(target, 'async-failure', async () => { throw new Error('async listener failed'); });
    scope.setTimeout(async () => { throw new Error('timer failed'); }, 0);

    let taskSettled = false;
    void scope.run(signal => new Promise(resolve => {
        signal.addEventListener('abort', () => {
            taskSettled = true;
            resolve();
        }, { once: true });
    }));
    target.dispatchEvent(new Event('sync-failure'));
    target.dispatchEvent(new Event('async-failure'));
    await new Promise(resolve => setTimeout(resolve, 5));

    assert.deepEqual(new Set(failures), new Set(['listener failed', 'async listener failed', 'timer failed']));
    await scope.dispose();
    assert.equal(taskSettled, true);
    assert.throws(() => scope.listen(target, 'late', () => undefined), /execution_scope_disposed/);
    assert.throws(() => scope.setTimeout(() => undefined, 0), /execution_scope_disposed/);
});
