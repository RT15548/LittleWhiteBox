import assert from 'node:assert/strict';
import test from 'node:test';

import { createEnaPlannerInterceptor } from '../ena-planner-interceptor.js';

function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, reject, resolve };
}

function createFixture(plan, settings = { enabled: true, skipIfPlotPresent: true }, overrides = {}) {
    const message = {
        is_user: true,
        is_system: false,
        mes: '原始用户消息',
        extra: { display_text: '楼层显示文本' },
    };
    const chat = [
        { is_system: true, is_user: false, mes: '被 coreChat 过滤的系统楼层' },
        { is_user: false, mes: '上一条回复' },
        message,
    ];
    const coreChat = [
        { is_user: false, index: 0, mes: '宿主处理后的上一条回复' },
        { is_user: true, is_system: false, index: 1, mes: '宿主正则与附件后的用户消息' },
    ];
    let context = {
        chatId: 'chat-a',
        chat,
        chatMetadata: { scenario: 'old-chat' },
        characterId: 0,
        characters: [{ name: '旧角色', avatar: 'old.png' }],
        groupId: null,
    };
    const updates = [];
    const errors = [];
    const aborts = [];
    const notices = [];
    const noticeCancellations = [];
    const dispatchController = new AbortController();
    const interceptor = createEnaPlannerInterceptor({
        getContext: () => context,
        getSettings: () => settings,
        plan,
        updateMessageBlock: (...args) => updates.push(args),
        scheduleNotice: () => {
            notices.push(true);
            overrides.scheduleNotice?.();
            return () => noticeCancellations.push(true);
        },
        onError: error => errors.push(error),
    });
    const runContext = {
        abort: immediately => aborts.push(immediately),
        results: new Map([['story-summary', {
            text: '本轮共享召回',
            recallLogText: '本轮召回日志',
        }]]),
        signal: dispatchController.signal,
    };

    return {
        aborts,
        abortDispatch: () => dispatchController.abort(),
        chat,
        coreChat,
        errors,
        interceptor,
        message,
        noticeCancellations,
        notices,
        runContext,
        setContext: value => { context = value; },
        updates,
    };
}

test('normal generation reuses Story Summary and appends one plan to coreChat and the real floor', async () => {
    let request = null;
    const fixture = createFixture(async (raw, options) => {
        request = { raw, options };
        return { filtered: '<plot>同一份规划</plot>' };
    });

    const result = await fixture.interceptor.run(
        fixture.coreChat,
        0,
        () => {},
        'normal',
        fixture.runContext,
    );

    assert.equal(request.raw, '原始用户消息');
    assert.equal(request.options.storyMemoryText, '本轮共享召回');
    assert.equal(request.options.recallLogText, '本轮召回日志');
    assert.equal(fixture.coreChat[1].mes, '宿主正则与附件后的用户消息\n\n<plot>同一份规划</plot>');
    assert.equal(fixture.message.mes, '原始用户消息\n\n<plot>同一份规划</plot>');
    assert.equal(fixture.message.extra.display_text, '楼层显示文本\n\n<plot>同一份规划</plot>');
    assert.deepEqual(result, { messageId: 2, text: '<plot>同一份规划</plot>' });
    assert.equal(fixture.updates.length, 1);
    assert.deepEqual(fixture.updates[0], [2, fixture.message]);
    assert.equal(fixture.noticeCancellations.length, 1);
    assert.deepEqual(fixture.errors, []);
});

test('eligible normal generation schedules and cancels its slow notice around planning', async () => {
    const order = [];
    const fixture = createFixture(
        async () => {
            order.push('plan');
            return { filtered: '<plot>提示后规划</plot>' };
        },
        { enabled: true, skipIfPlotPresent: true },
        { scheduleNotice: () => order.push('notice') },
    );

    await fixture.interceptor.run(fixture.coreChat, 0, () => {}, 'normal', fixture.runContext);

    assert.deepEqual(order, ['notice', 'plan']);
    assert.equal(fixture.notices.length, 1);
    assert.equal(fixture.noticeCancellations.length, 1);
});

test('swipe, regenerate, and continue never run or append planning', async () => {
    for (const type of ['swipe', 'regenerate', 'continue']) {
        let calls = 0;
        const fixture = createFixture(async () => {
            calls++;
            return { filtered: '<plot>不应出现</plot>' };
        });

        await fixture.interceptor.run(fixture.coreChat, 0, () => {}, type, fixture.runContext);

        assert.equal(calls, 0, type);
        assert.equal(fixture.message.mes, '原始用户消息', type);
        assert.equal(fixture.updates.length, 0, type);
        assert.equal(fixture.notices.length, 0, type);
        assert.equal(fixture.noticeCancellations.length, 0, type);
    }
});

test('planning failure is fail-open and leaves both message copies unchanged', async () => {
    const expected = new Error('planner unavailable');
    const fixture = createFixture(async () => { throw expected; });

    await fixture.interceptor.run(fixture.coreChat, 0, () => {}, 'normal', fixture.runContext);

    assert.equal(fixture.coreChat[1].mes, '宿主正则与附件后的用户消息');
    assert.equal(fixture.message.mes, '原始用户消息');
    assert.equal(fixture.updates.length, 0);
    assert.equal(fixture.noticeCancellations.length, 1);
    assert.deepEqual(fixture.errors, [expected]);
});

test('generation stop aborts the request and a late result cannot modify the floor', async () => {
    const gate = deferred();
    let requestSignal = null;
    const fixture = createFixture(async (_raw, options) => {
        requestSignal = options.signal;
        return await gate.promise;
    });

    const pending = fixture.interceptor.run(
        fixture.coreChat,
        0,
        () => {},
        'normal',
        fixture.runContext,
    );
    await Promise.resolve();
    fixture.interceptor.cancel('generation-stopped');
    assert.equal(fixture.noticeCancellations.length, 1);
    gate.resolve({ filtered: '<plot>迟到规划</plot>' });
    await pending;

    assert.equal(requestSignal.aborted, true);
    assert.deepEqual(fixture.aborts, [true]);
    assert.equal(fixture.coreChat[1].mes, '宿主正则与附件后的用户消息');
    assert.equal(fixture.message.mes, '原始用户消息');
    assert.equal(fixture.updates.length, 0);
    assert.equal(fixture.noticeCancellations.length, 1);
    assert.deepEqual(fixture.errors, []);
});

test('dispatcher abort cancels the notice even when planning ignores its signal', async () => {
    const gate = deferred();
    const fixture = createFixture(async () => await gate.promise);
    const pending = fixture.interceptor.run(
        fixture.coreChat,
        0,
        () => {},
        'normal',
        fixture.runContext,
    );
    await Promise.resolve();

    fixture.abortDispatch();
    assert.equal(fixture.noticeCancellations.length, 1);

    gate.resolve({ filtered: '<plot>迟到规划</plot>' });
    await pending;
    assert.equal(fixture.message.mes, '原始用户消息');
    assert.equal(fixture.noticeCancellations.length, 1);
});

test('a chat switch invalidates an otherwise successful late result', async () => {
    const gate = deferred();
    const fixture = createFixture(async () => await gate.promise);
    const pending = fixture.interceptor.run(
        fixture.coreChat,
        0,
        () => {},
        'normal',
        fixture.runContext,
    );
    await Promise.resolve();
    fixture.setContext({ chatId: 'chat-b', chat: [] });
    gate.resolve({ filtered: '<plot>旧聊天规划</plot>' });
    await pending;

    assert.equal(fixture.message.mes, '原始用户消息');
    assert.equal(fixture.updates.length, 0);
    assert.equal(fixture.noticeCancellations.length, 1);
});
