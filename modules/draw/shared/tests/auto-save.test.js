// 自动保存的时机：防抖、立即落盘、校验不过不存、保存串行（用手动时钟，不真等 600ms）。
import test from 'node:test';
import assert from 'node:assert/strict';

import { AUTO_SAVE_COPY, AUTO_SAVE_DELAY_MS, createAutoSave } from '../auto-save.js';

function setup({ initial = 'a', saveImpl } = {}) {
    const form = { value: initial };
    const saves = [];
    const statuses = [];
    const timers = [];
    const saver = createAutoSave({
        read: () => (form.value === '' ? { error: '请输入名称' } : { key: form.value, value: form.value }),
        save: saveImpl ?? (value => { saves.push(value); }),
        onStatus: (state, text) => statuses.push(`${state}:${text}`),
        setTimer: (fn, ms) => { timers.push({ fn, ms, live: true }); return timers.length - 1; },
        clearTimer: (id) => { if (timers[id]) timers[id].live = false; },
    });
    saver.setBaseline('a');
    const fireTimer = () => { const live = timers.filter(t => t.live); live.forEach(t => { t.live = false; t.fn(); }); return live.length; };
    return { form, saves, statuses, timers, saver, fireTimer };
}
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

test('默认等 600ms，连续改动只保存一次', async () => {
    const { form, saves, statuses, timers, saver, fireTimer } = setup();
    assert.equal(AUTO_SAVE_DELAY_MS, 600);
    form.value = 'b'; saver.touch();
    form.value = 'bc'; saver.touch();
    assert.equal(timers.filter(t => t.live).length, 1, '后一次改动重新计时');
    assert.equal(timers[0].ms, 600);
    assert.deepEqual(saves, []);
    assert.equal(statuses.at(-1), `saving:${AUTO_SAVE_COPY.saving}`);
    fireTimer();
    await tick();
    assert.deepEqual(saves, ['bc']);
    assert.equal(statuses.at(-1), `saved:${AUTO_SAVE_COPY.saved}`);
});

test('flush 立刻保存且同步发出 save（关页时来得及）', () => {
    const { form, saves, saver, timers } = setup();
    form.value = 'b'; saver.touch();
    saver.flush();
    assert.deepEqual(saves, ['b']);
    assert.equal(timers.filter(t => t.live).length, 0, '倒计时被取消');
});

test('内容与已保存的相同：不重复保存，状态是已保存', async () => {
    const { form, saves, statuses, saver } = setup();
    form.value = 'b'; saver.touch();
    await saver.flush();
    form.value = 'a'; saver.touch(); form.value = 'b'; saver.touch();
    const result = await saver.flush();
    assert.deepEqual(saves, ['b']);
    assert.equal(result.ok, true);
    assert.equal(statuses.at(-1), `saved:${AUTO_SAVE_COPY.saved}`);
});

test('校验不过：提示“未保存：原因”，不保存，flush 报告失败；改好后恢复', async () => {
    const { form, saves, statuses, saver, timers } = setup();
    form.value = ''; saver.touch();
    assert.equal(statuses.at(-1), 'invalid:未保存：请输入名称');
    assert.equal(timers.filter(t => t.live).length, 0);
    const result = await saver.flush();
    assert.deepEqual(result, { ok: false, error: '请输入名称' });
    assert.deepEqual(saves, []);
    form.value = 'c'; saver.touch();
    await saver.flush();
    assert.deepEqual(saves, ['c']);
});

test('新建的角色（没有基线）：第一个合法状态就创建', async () => {
    const { form, saves, saver } = setup({ initial: '' });
    saver.setBaseline(null);
    saver.touch();
    form.value = 'x'; saver.touch();
    await saver.flush();
    assert.deepEqual(saves, ['x']);
});

test('保存串行：进行中的保存没结束时不会再发新的，结束后按最新内容补存一次', async () => {
    const releases = [];
    const started = [];
    let concurrent = 0;
    let maxConcurrent = 0;
    const { form, saver } = setup({
        saveImpl: value => new Promise((resolve) => {
            started.push(value);
            concurrent += 1; maxConcurrent = Math.max(maxConcurrent, concurrent);
            releases.push(() => { concurrent -= 1; resolve(); });
        }),
    });
    form.value = 'b'; saver.touch();
    const first = saver.flush();
    form.value = 'c'; saver.touch();
    form.value = 'd'; saver.touch();
    const second = saver.flush();
    assert.deepEqual(started, ['b']);
    releases[0]();
    await tick();
    assert.deepEqual(started, ['b', 'd'], '中间的 c 被合并掉');
    releases[1]();
    await Promise.all([first, second]);
    assert.equal(maxConcurrent, 1);
    assert.equal(saver.pending, false);
});

test('保存失败：提示原因、保留未保存状态，之后的改动或 flush 会重试', async () => {
    let fail = true;
    const attempts = [];
    const { form, statuses, saver } = setup({
        saveImpl: (value) => { attempts.push(value); if (fail) throw new Error('网络断了'); },
    });
    form.value = 'b'; saver.touch();
    const result = await saver.flush();
    assert.equal(result.ok, false);
    assert.equal(statuses.at(-1), 'error:未保存：网络断了');
    fail = false;
    const retry = await saver.flush();
    assert.equal(retry.ok, true);
    assert.deepEqual(attempts, ['b', 'b']);
    assert.equal(statuses.at(-1), `saved:${AUTO_SAVE_COPY.saved}`);
});

test('save 返回 { ok: false, error } 也算失败', async () => {
    const { form, statuses, saver } = setup({ saveImpl: () => ({ ok: false, error: '被拒绝' }) });
    form.value = 'b'; saver.touch();
    const result = await saver.flush();
    assert.deepEqual(result, { ok: false, error: '被拒绝' });
    assert.equal(statuses.at(-1), 'error:未保存：被拒绝');
});

test('dispose 之后倒计时被取消，也不再保存或报状态', async () => {
    const { form, saves, statuses, saver, fireTimer } = setup();
    form.value = 'b'; saver.touch();
    const before = statuses.length;
    saver.dispose();
    fireTimer();
    await saver.flush();
    saver.touch();
    assert.deepEqual(saves, []);
    assert.equal(statuses.length, before);
});
