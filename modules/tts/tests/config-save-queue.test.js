import test from 'node:test';
import assert from 'node:assert/strict';

import { createConfigSaveQueue } from '../config-save-queue.js';

const deferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((done, fail) => {
        resolve = done;
        reject = fail;
    });
    return { promise, resolve, reject };
};

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

function createHarness({ initial = { autoSpeak: true, volc: { speechRate: 1 } } } = {}) {
    const state = {
        config: structuredClone(initial),
        loaded: true,
        epoch: 0,
        persisted: [],
        errors: [],
        gate: null,
    };

    const queue = createConfigSaveQueue({
        readConfig: () => state.config,
        isConfigLoaded: () => state.loaded,
        commitConfig: (next) => { state.config = next; },
        currentEpoch: () => state.epoch,
        persist: async (next) => {
            state.persisted.push(structuredClone(next));
            if (state.gate) await state.gate;
        },
        mergePatch: (current, patch) => {
            const next = structuredClone(current);
            Object.assign(next, patch);
            if (patch.volc && typeof patch.volc === 'object' && !Array.isArray(patch.volc)) {
                next.volc = { ...(current.volc || {}), ...patch.volc };
            }
            return next;
        },
        onError: (error) => state.errors.push(error),
    });

    return { ...queue, state };
}

test('函数式补丁在队列内求值：连点两次得到两次翻转', async () => {
    const h = createHarness({ initial: { autoSpeak: true } });
    const gate = deferred();
    h.state.gate = gate.promise;

    const toggle = () => h.save(current => ({ autoSpeak: current?.autoSpeak === false }));
    const first = toggle();
    const second = toggle();

    gate.resolve();
    h.state.gate = null;
    assert.deepEqual(await Promise.all([first, second]), [true, true]);

    assert.deepEqual(h.state.persisted.map(c => c.autoSpeak), [false, true]);
    assert.equal(h.state.config.autoSpeak, true);
});

test('对象补丁在入队时冻结，连点两次会得到同一个值（因此翻转必须用函数）', async () => {
    const h = createHarness({ initial: { autoSpeak: true } });
    const gate = deferred();
    h.state.gate = gate.promise;

    const staleFlip = () => h.save({ autoSpeak: h.state.config.autoSpeak === false });
    const first = staleFlip();
    const second = staleFlip();

    gate.resolve();
    h.state.gate = null;
    await Promise.all([first, second]);

    assert.deepEqual(h.state.persisted.map(c => c.autoSpeak), [false, false]);
});

test('对象补丁入队后被调用方改动，不影响已排队的写入', async () => {
    const h = createHarness({ initial: { autoSpeak: true } });
    const patch = { autoSpeak: false };
    const pending = h.save(patch);
    patch.autoSpeak = true;
    await pending;

    assert.equal(h.state.persisted[0].autoSpeak, false);
});

test('写入严格串行，第二次补丁看到第一次的提交结果', async () => {
    const h = createHarness({ initial: { n: 0 } });
    const gate = deferred();
    h.state.gate = gate.promise;

    const bump = () => h.save(current => ({ n: (current?.n ?? 0) + 1 }));
    const first = bump();
    const second = bump();

    await settle();
    assert.equal(h.state.persisted.length, 1, '第二次必须等第一次提交后才求值');

    gate.resolve();
    h.state.gate = null;
    await Promise.all([first, second]);
    assert.deepEqual(h.state.persisted.map(c => c.n), [1, 2]);
    assert.equal(h.state.config.n, 2);
});

test('volc 补丁做浅合并，不会丢掉未提及的字段', async () => {
    const h = createHarness({ initial: { volc: { speechRate: 1, defaultSpeaker: 'a' } } });
    assert.equal(await h.save({ volc: { speechRate: 1.5 } }), true);
    assert.deepEqual(h.state.config.volc, { speechRate: 1.5, defaultSpeaker: 'a' });
});

test('落盘失败返回 false、上报错误且不改动运行态', async () => {
    const h = createHarness({ initial: { autoSpeak: true } });
    const gate = deferred();
    h.state.gate = gate.promise;

    const failing = h.save({ autoSpeak: false });
    gate.reject(new Error('服务器返回 500'));

    assert.equal(await failing, false);
    assert.equal(h.state.config.autoSpeak, true);
    assert.match(h.state.errors[0].message, /500/);
});

test('一次失败不会卡死队列', async () => {
    const h = createHarness({ initial: { autoSpeak: true } });
    const gate = deferred();
    h.state.gate = gate.promise;

    const failing = h.save({ autoSpeak: false });
    gate.reject(new Error('boom'));
    await failing;

    h.state.gate = null;
    assert.equal(await h.save({ autoSpeak: false }), true);
    assert.equal(h.state.config.autoSpeak, false);
});

test('配置未加载时拒绝保存', async () => {
    const h = createHarness();
    h.state.loaded = false;

    assert.equal(await h.save({ autoSpeak: false }), false);
    assert.equal(h.state.persisted.length, 0);
    assert.match(h.state.errors[0].message, /配置尚未成功加载/);
});

test('排队期间模块被清理：过期写入不提交也不报错', async () => {
    const h = createHarness({ initial: { autoSpeak: true } });
    const gate = deferred();
    h.state.gate = gate.promise;

    const stale = h.save({ autoSpeak: false });
    await settle();
    h.state.epoch++;
    gate.resolve();
    h.state.gate = null;

    assert.equal(await stale, false);
    assert.equal(h.state.config.autoSpeak, true, '过期写入不得覆盖新生命周期的配置');
    assert.deepEqual(h.state.errors, []);
});

test('清理后新发起的写入直接短路，不触碰存储', async () => {
    const h = createHarness();
    const stale = h.save({ autoSpeak: false });
    h.state.epoch++;

    assert.equal(await stale, false);
    assert.equal(h.state.persisted.length, 0);
});

test('whenIdle 等待在途写入以及等待期间新排入的写入', async () => {
    const h = createHarness({ initial: { n: 0 } });
    const firstGate = deferred();
    const secondGate = deferred();
    h.state.gate = firstGate.promise;

    const first = h.save(current => ({ n: current.n + 1 }));
    await settle();

    let idle = false;
    const waiting = h.whenIdle().then(() => { idle = true; });

    h.state.gate = secondGate.promise;
    const second = h.save(current => ({ n: current.n + 1 }));

    firstGate.resolve();
    await settle();
    assert.equal(idle, false, 'whenIdle 必须覆盖等待期间新排入的写入');

    secondGate.resolve();
    h.state.gate = null;
    await Promise.all([first, second, waiting]);
    assert.equal(idle, true);
    assert.equal(h.state.config.n, 2);
});
