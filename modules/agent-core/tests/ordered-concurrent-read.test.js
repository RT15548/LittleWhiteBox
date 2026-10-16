import test from 'node:test';
import assert from 'node:assert/strict';
import { orderedConcurrentRead } from '../runtime/ordered-concurrent-read.js';

// 验收：乱序响应仍按输入顺序交付，且窗口最多三个；代价：搜索证据或分页错误。
// 验收：停止、异常或提前结束后取消未用请求；代价：后台请求泄漏及旧运行继续工作。
function deferred() {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

function reader() {
    const calls = [];
    return {
        calls,
        read(item, signal) {
            const task = deferred();
            calls.push({ item, signal, ...task });
            signal.addEventListener('abort', () => task.reject(signal.reason), { once: true });
            return task.promise;
        },
    };
}

test('window includes completed-but-unconsumed reads and preserves order', async () => {
    const mock = reader();
    const iterator = orderedConcurrentRead([0, 1, 2, 3, 4], mock.read);
    const first = iterator.next();
    await tick();
    assert.deepEqual(mock.calls.map(call => call.item), [0, 1, 2]);
    mock.calls[2].resolve('two');
    mock.calls[1].resolve('one');
    await tick();
    assert.equal(mock.calls.length, 3);
    mock.calls[0].resolve('zero');
    assert.deepEqual((await first).value, { item: 0, ok: true, value: 'zero' });
    assert.equal(mock.calls.length, 3);
    assert.equal((await iterator.next()).value.value, 'one');
    assert.equal((await iterator.next()).value.value, 'two');
    mock.calls[4].resolve('four');
    mock.calls[3].resolve('three');
    assert.equal((await iterator.next()).value.value, 'three');
    assert.equal((await iterator.next()).value.value, 'four');
    assert.equal((await iterator.next()).done, true);
    assert.ok(mock.calls.every(call => call.signal.aborted));
});

test('early break cancels prefetched reads without refilling', async () => {
    const mock = reader();
    const consume = (async () => {
        for await (const item of orderedConcurrentRead([0, 1, 2, 3], mock.read)) {
            assert.equal(item.item, 0);
            break;
        }
    })();
    await tick();
    mock.calls[0].resolve('first');
    await consume;
    assert.equal(mock.calls.length, 3);
    assert.ok(mock.calls.every(call => call.signal.aborted));
});

test('external cancellation stops the window and does not become a read failure', async () => {
    const mock = reader(), controller = new AbortController();
    const iterator = orderedConcurrentRead([0, 1, 2, 3], mock.read, controller.signal);
    const next = iterator.next();
    await tick();
    controller.abort();
    await assert.rejects(next, { name: 'AbortError' });
    assert.equal(mock.calls.length, 3);
    assert.ok(mock.calls.every(call => call.signal.aborted));
});

test('already cancelled runs start no reads', async () => {
    const mock = reader(), controller = new AbortController();
    controller.abort();
    await assert.rejects(orderedConcurrentRead([0], mock.read, controller.signal).next(), { name: 'AbortError' });
    assert.equal(mock.calls.length, 0);
});

test('out-of-order failures are observed immediately but delivered in order', async () => {
    const mock = reader(), failure = new Error('read failed');
    const iterator = orderedConcurrentRead([0, 1, 2], mock.read);
    const next = iterator.next();
    await tick();
    mock.calls[2].reject(failure);
    await tick();
    mock.calls[0].resolve('first');
    mock.calls[1].resolve('second');
    assert.equal((await next).value.item, 0);
    assert.equal((await iterator.next()).value.item, 1);
    assert.deepEqual((await iterator.next()).value, { item: 2, ok: false, error: failure });
    assert.equal((await iterator.next()).done, true);
});

test('consumer exceptions also dispose the window', async () => {
    const mock = reader(), failure = new Error('consumer failed');
    const consume = (async () => {
        for await (const item of orderedConcurrentRead([0, 1, 2, 3], mock.read)) {
            assert.equal(item.item, 0);
            throw failure;
        }
    })();
    await tick();
    mock.calls[0].resolve('first');
    await assert.rejects(consume, error => error === failure);
    assert.equal(mock.calls.length, 3);
    assert.ok(mock.calls.every(call => call.signal.aborted));
});
