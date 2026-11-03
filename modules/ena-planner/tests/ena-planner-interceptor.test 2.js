import assert from 'node:assert/strict';
import test from 'node:test';

import { createEnaPlannerSendInterceptor } from '../ena-planner-interceptor.js';

function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, reject, resolve };
}

function flush() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

function createClassList() {
    const values = new Set();
    return {
        add: value => values.add(value),
        contains: value => values.has(value),
        remove: value => values.delete(value),
    };
}

function createEventTarget() {
    const listeners = new Map();
    return {
        addEventListener(type, listener) {
            const entries = listeners.get(type) || [];
            entries.push(listener);
            listeners.set(type, entries);
        },
        dispatch(type, event) {
            for (const listener of [...(listeners.get(type) || [])]) {
                listener(event);
                if (event.immediatePropagationStopped) break;
            }
        },
        removeEventListener(type, listener) {
            const entries = listeners.get(type) || [];
            listeners.set(type, entries.filter(entry => entry !== listener));
        },
    };
}

function createEvent(target, overrides = {}) {
    return {
        altKey: false,
        ctrlKey: false,
        defaultPrevented: false,
        immediatePropagationStopped: false,
        isComposing: false,
        key: '',
        shiftKey: false,
        target,
        preventDefault() { this.defaultPrevented = true; },
        stopImmediatePropagation() { this.immediatePropagationStopped = true; },
        ...overrides,
    };
}

function createFixture(plan, overrides = {}) {
    const eventTarget = createEventTarget();
    const textarea = { disabled: false, value: overrides.input ?? '原始用户消息' };
    const attributes = new Map();
    const button = {
        classList: createClassList(),
        isConnected: true,
        contains: target => target === button,
        getAttribute: name => attributes.has(name) ? attributes.get(name) : null,
        removeAttribute: name => attributes.delete(name),
        setAttribute: (name, value) => attributes.set(name, String(value)),
    };
    const settings = overrides.settings || {
        enabled: true,
        api: { stream: true },
    };
    const errors = [];
    const notices = [];
    const noticeCancellations = [];
    const sentTexts = [];
    let chatIdentity = 'character:0:chat-a';
    let summaryReads = 0;

    const dispatchClick = () => {
        const event = createEvent(button);
        eventTarget.dispatch('click', event);
        if (!event.defaultPrevented && !event.immediatePropagationStopped) {
            sentTexts.push(textarea.value);
        }
        return event;
    };
    button.click = dispatchClick;

    const interceptor = createEnaPlannerSendInterceptor({
        eventTarget,
        getChatIdentity: () => chatIdentity,
        getSettings: () => settings,
        getTextarea: () => textarea,
        getSendButton: () => button,
        shouldSendOnEnter: () => overrides.sendOnEnter !== false,
        readStorySummary: () => {
            summaryReads++;
            return '当前规范总结';
        },
        plan,
        filterPreview: value => String(value || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim(),
        scheduleNotice: () => {
            notices.push(true);
            return () => noticeCancellations.push(true);
        },
        onError: error => errors.push(error),
    });
    interceptor.install();

    return {
        button,
        click: dispatchClick,
        errors,
        interceptor,
        keydown: overridesForEvent => {
            const event = createEvent(textarea, { key: 'Enter', ...overridesForEvent });
            eventTarget.dispatch('keydown', event);
            return event;
        },
        noticeCancellations,
        notices,
        sentTexts,
        setChatIdentity: value => { chatIdentity = value; },
        settings,
        summaryReads: () => summaryReads,
        textarea,
    };
}

test('click streams the plan into the draft and performs exactly one final SillyTavern send', async () => {
    let request = null;
    const streamedValues = [];
    const fixture = createFixture(async (raw, options) => {
        request = { raw, options };
        options.onDelta('片段', '<plot>流式规划');
        streamedValues.push(fixture.textarea.value);
        return { filtered: '<plot>最终规划</plot>' };
    });

    const event = fixture.click();
    assert.equal(event.defaultPrevented, true);
    await flush();

    assert.equal(request.raw, '原始用户消息');
    assert.equal(request.options.storyMemoryText, '当前规范总结');
    assert.equal(fixture.summaryReads(), 1);
    assert.deepEqual(streamedValues, ['原始用户消息\n\n<plot>流式规划']);
    assert.deepEqual(fixture.sentTexts, ['原始用户消息\n\n<plot>最终规划</plot>']);
    assert.equal(fixture.textarea.disabled, false);
    assert.equal(fixture.notices.length, 1);
    assert.equal(fixture.noticeCancellations.length, 1);
    assert.deepEqual(fixture.errors, []);
    fixture.interceptor.cleanup();
});

test('eligible Enter follows SillyTavern send-on-enter semantics', async () => {
    let calls = 0;
    const fixture = createFixture(async () => {
        calls++;
        return { filtered: '<plot>键盘规划</plot>' };
    });

    const event = fixture.keydown();
    assert.equal(event.defaultPrevented, true);
    await flush();
    assert.equal(calls, 1);
    assert.deepEqual(fixture.sentTexts, ['原始用户消息\n\n<plot>键盘规划</plot>']);
    fixture.interceptor.cleanup();

    for (const modifiers of [
        { isComposing: true },
        { shiftKey: true },
        { altKey: true },
        { ctrlKey: true, altKey: true },
    ]) {
        let modifiedCalls = 0;
        const modified = createFixture(async () => {
            modifiedCalls++;
            return { filtered: '<plot>不应规划</plot>' };
        });
        const modifiedEvent = modified.keydown(modifiers);
        await flush();
        assert.equal(modifiedEvent.defaultPrevented, false);
        assert.equal(modifiedCalls, 0);
        modified.interceptor.cleanup();
    }

    let controlCalls = 0;
    const control = createFixture(async () => {
        controlCalls++;
        return { filtered: '<plot>Ctrl+Enter 规划</plot>' };
    });
    assert.equal(control.keydown({ ctrlKey: true }).defaultPrevented, true);
    await flush();
    assert.equal(controlCalls, 1);
    assert.deepEqual(control.sentTexts, ['原始用户消息\n\n<plot>Ctrl+Enter 规划</plot>']);
    control.interceptor.cleanup();

    let disabledCalls = 0;
    const disabled = createFixture(async () => {
        disabledCalls++;
        return { filtered: '<plot>不应规划</plot>' };
    }, { sendOnEnter: false });
    assert.equal(disabled.keydown().defaultPrevented, false);
    await flush();
    assert.equal(disabledCalls, 0);
    disabled.interceptor.cleanup();
});

test('disabled Ena, slash commands, and existing plots pass through untouched', async () => {
    const cases = [
        {
            input: '普通输入',
            settings: { enabled: false, api: { stream: true } },
        },
        { input: '  /echo hello  ' },
        { input: '继续剧情\n<plot>已有规划</plot>' },
    ];

    for (const testCase of cases) {
        let calls = 0;
        const fixture = createFixture(async () => {
            calls++;
            return { filtered: '<plot>不应规划</plot>' };
        }, testCase);
        const event = fixture.click();
        await flush();
        assert.equal(event.defaultPrevented, false);
        assert.equal(calls, 0);
        assert.equal(fixture.summaryReads(), 0);
        assert.deepEqual(fixture.sentTexts, [testCase.input]);
        fixture.interceptor.cleanup();
    }


    let busyCalls = 0;
    const busy = createFixture(async () => {
        busyCalls++;
        return { filtered: '<plot>不应规划</plot>' };
    });
    busy.textarea.disabled = true;
    const busyEvent = busy.click();
    await flush();
    assert.equal(busyEvent.defaultPrevented, false);
    assert.equal(busyCalls, 0);
    assert.equal(busy.summaryReads(), 0);
    busy.interceptor.cleanup();
});

test('repeated sends are blocked while one planning request owns the draft', async () => {
    const gate = deferred();
    let calls = 0;
    const fixture = createFixture(async () => {
        calls++;
        return await gate.promise;
    });

    const first = fixture.click();
    const second = fixture.click();
    assert.equal(first.defaultPrevented, true);
    assert.equal(second.defaultPrevented, true);
    assert.equal(calls, 1);
    assert.equal(fixture.textarea.disabled, true);
    assert.deepEqual(fixture.sentTexts, []);

    gate.resolve({ filtered: '<plot>唯一规划</plot>' });
    await flush();
    assert.deepEqual(fixture.sentTexts, ['原始用户消息\n\n<plot>唯一规划</plot>']);
    fixture.interceptor.cleanup();
});

test('planning failure restores the exact draft and never sends it', async () => {
    const expected = new Error('planner unavailable');
    const fixture = createFixture(async (_raw, options) => {
        options.onDelta('片段', '<plot>未完成');
        throw expected;
    }, { input: '  保留两侧空格  ' });

    fixture.click();
    await flush();

    assert.equal(fixture.textarea.value, '  保留两侧空格  ');
    assert.equal(fixture.textarea.disabled, false);
    assert.deepEqual(fixture.sentTexts, []);
    assert.deepEqual(fixture.errors, [expected]);
    fixture.interceptor.cleanup();
});

test('an empty filtered plan restores the exact draft and never sends it', async () => {
    const fixture = createFixture(async (_raw, options) => {
        options.onDelta('片段', '<think>只有思考</think>');
        return { filtered: '   ' };
    }, { input: '  等待有效规划  ' });

    fixture.click();
    await flush();

    assert.equal(fixture.textarea.value, '  等待有效规划  ');
    assert.equal(fixture.textarea.disabled, false);
    assert.deepEqual(fixture.sentTexts, []);
    assert.equal(fixture.errors.length, 1);
    assert.equal(fixture.errors[0].message, 'Ena 未生成有效的剧情规划');
    fixture.interceptor.cleanup();
});

test('chat changes and explicit cancellation prevent late results from touching or sending the draft', async () => {
    const gate = deferred();
    let requestSignal = null;
    const fixture = createFixture(async (_raw, options) => {
        requestSignal = options.signal;
        options.onDelta('片段', '<plot>旧聊天规划');
        return await gate.promise;
    });

    fixture.click();
    assert.equal(fixture.textarea.value, '原始用户消息\n\n<plot>旧聊天规划');
    fixture.setChatIdentity('character:0:chat-b');
    fixture.textarea.value = '新聊天草稿';
    fixture.interceptor.cancel('chat-changed');
    assert.equal(requestSignal.aborted, true);
    assert.equal(fixture.textarea.disabled, false);

    gate.resolve({ filtered: '<plot>迟到结果</plot>' });
    await flush();
    assert.equal(fixture.textarea.value, '新聊天草稿');
    assert.deepEqual(fixture.sentTexts, []);
    assert.deepEqual(fixture.errors, []);
    fixture.interceptor.cleanup();
});

test('disabling or unloading Ena restores its owned preview and removes interception', async () => {
    const gate = deferred();
    const fixture = createFixture(async (_raw, options) => {
        options.onDelta('片段', '<plot>临时预览');
        return await gate.promise;
    });

    fixture.click();
    assert.equal(fixture.textarea.value, '原始用户消息\n\n<plot>临时预览');
    fixture.interceptor.cancel('disabled');
    assert.equal(fixture.textarea.value, '原始用户消息');
    assert.equal(fixture.textarea.disabled, false);

    gate.resolve({ filtered: '<plot>迟到结果</plot>' });
    await flush();
    assert.deepEqual(fixture.sentTexts, []);

    fixture.interceptor.cleanup();
    const event = fixture.click();
    assert.equal(event.defaultPrevented, false);
    assert.deepEqual(fixture.sentTexts, ['原始用户消息']);
});

test('a missing final send control keeps the completed text for manual sending', async () => {
    const gate = deferred();
    const fixture = createFixture(async () => await gate.promise);

    fixture.click();
    fixture.button.isConnected = false;
    gate.resolve({ filtered: '<plot>已完成规划</plot>' });
    await flush();

    assert.equal(fixture.textarea.value, '原始用户消息\n\n<plot>已完成规划</plot>');
    assert.equal(fixture.textarea.disabled, false);
    assert.deepEqual(fixture.sentTexts, []);
    assert.equal(fixture.errors.length, 1);
    fixture.interceptor.cleanup();
});
