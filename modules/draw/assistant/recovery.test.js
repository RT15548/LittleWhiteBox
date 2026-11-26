import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate as tick } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { createAssistantDrawing } from './service.js';
import { createDrawingRecovery, finishDrawingResult, showLateDrawingResult } from './recovery.js';
import { DRAW_IMAGE, SAVE_DRAW_IMAGES } from './contract.js';
import { createToolActivityProjection } from '../../assistant/app-src/ui/tool-activity.js';
import { createToolProcess } from '../../assistant/app-src/ui/tool-process.js';

function dom(t) {
    const previous = globalThis.document;
    const { document } = parseHTML('<html><body></body></html>');
    globalThis.document = document;
    t.after(() => { globalThis.document = previous; });
    return document;
}

async function failedSave(failures = 1) {
    let generations = 0, writes = 0;
    const service = createAssistantDrawing({
        getApi: () => ({ generate: async () => { generations++; return { images: [new Blob(['original'], { type: 'image/png' })] }; } }),
        writeImages: async files => {
            if (++writes <= failures) throw new Error('storage_failure');
            return files.map(file => ({ path: file.path, kind: 'image', blobId: 'fixture' }));
        }, observePaths: async () => [], identifier: () => 'fixture',
    });
    const result = await service.generate({ prompt: 'fixture' });
    return { service, result, generations: () => generations };
}

test('a failed tool receipt offers a direct save action, survives another save failure, and never regenerates', async t => {
    const document = dom(t), h = await failedSave(2), requests = [], notices = [];
    const messages = [{ role: 'assistant', content: '', toolCalls: [{ id: 'draw', name: DRAW_IMAGE, arguments: '{}' }] },
        { role: 'tool', toolCallId: 'draw', toolName: DRAW_IMAGE, content: JSON.stringify(h.result) }];
    const original = structuredClone(messages);
    const recovery = createDrawingRecovery({ save: args => { requests.push({ name: SAVE_DRAW_IMAGES, args }); return h.service.save(args); },
        notify: message => notices.push(message), describeError: error => error.message,
        onChange: () => view.update(messages, false) });
    const project = createToolActivityProjection(undefined, (call, result) => recovery.actions(call.name, result));
    const view = createToolProcess({ project, renderText: text => document.createTextNode(text) });
    document.body.append(view.node);
    view.update(messages, true); view.update(messages, false);
    assert.equal(view.node.querySelector('.xb-assistant-process-toggle').getAttribute('aria-expanded'), 'true', 'Recovery is visible after the run stops');
    const button = view.node.querySelector('.xb-assistant-operation-actions button');
    assert.ok(button);
    button.click(); button.click();
    assert.equal(requests.length, 1, 'Concurrent clicks share the saving state');
    await tick();
    assert.equal(button.disabled, false, 'Failed saves can be retried');
    button.click(); await tick();
    assert.equal(requests.length, 2);
    assert.ok(requests.every(request => request.name === SAVE_DRAW_IMAGES && request.args.receiptId === h.result.receiptId));
    assert.equal(h.generations(), 1);
    assert.equal(h.service.save().pending.length, 0);
    assert.equal(button.disabled, true);
    assert.equal(notices.length, 2);
    assert.deepEqual(messages, original, 'Manual saving does not rewrite model history');
    view.node.querySelector('.xb-assistant-process-toggle').click();
    assert.equal(view.node.querySelector('.xb-assistant-process-toggle').getAttribute('aria-expanded'), 'false');
});

test('late saved images notify their location without offering another generation', t => {
    dom(t);
    const notices = [], path = 'local/images/late.png';
    showLateDrawingResult({ ok: true, images: [{ path }] }, { save: () => assert.fail('No recovery needed'),
        toast: { info: (...args) => notices.push(args), warning: () => assert.fail('No pending images') } });
    assert.equal(notices.length, 1);
    assert.ok(notices[0][0].includes(path));
    assert.equal(notices[0][2].escapeHtml, true);
});

test('late unsaved images have a safe host recovery button even without an assistant run', async t => {
    dom(t);
    const h = await failedSave();
    let notice;
    showLateDrawingResult({ ...h.result, message: '<img src=x onerror=alert(1)>' }, {
        save: args => h.service.save(args), describeError: error => error.message,
        toast: { info: () => assert.fail('Not saved yet'), warning: (node, _title, options) => { notice = node; assert.equal(options.closeButton, true); } },
    });
    assert.equal(notice.querySelector('img'), null);
    const button = notice.querySelector('button');
    assert.ok(button); button.click(); await tick();
    assert.equal(h.generations(), 1);
    assert.equal(h.service.save().pending.length, 0);
    assert.equal(button.disabled, true);
    assert.ok(notice.textContent.includes('local/images/draw-fixture-1.png'));
});

test('listing pending batches targets the chosen receipt and expired saves remain explicit failures', async () => {
    const h = await failedSave(), notices = [];
    const recovery = createDrawingRecovery({ save: args => h.service.save(args), notify: message => notices.push(message), describeError: error => error.message });
    const actions = recovery.actions(SAVE_DRAW_IMAGES, h.service.save());
    assert.deepEqual(actions.map(action => action.id), [h.result.receiptId]);
    await h.service.save({ receiptId: h.result.receiptId });
    const expired = await actions[0].run();
    assert.equal(expired.error, 'draw_receipt_missing');
    assert.equal(notices.length, 1);
    assert.equal(recovery.actions(SAVE_DRAW_IMAGES, { receiptId: h.result.receiptId })[0].disabled, true);
    assert.equal(h.generations(), 1);
});

for (const close of ['stop', 'close']) test(`a ${close} during workspace refresh still gets the late result`, async () => {
    const controller = new AbortController(); let connected = true;
    const result = { ok: true, images: [{ path: 'local/late.png' }] }, notifications = [];
    const returned = await finishDrawingResult(result, {
        refresh: async () => { await Promise.resolve(); if (close === 'stop') controller.abort(); else connected = false; },
        isDetached: () => controller.signal.aborted || !connected,
        onRefreshError: () => assert.fail('Refresh succeeds'), notifyLate: value => notifications.push(value),
    });
    assert.equal(returned, result);
    assert.deepEqual(notifications, [result]);
});

for (const result of [{ ok: true, images: [{ path: 'local/saved.png' }] }, { ok: false, receiptId: 'pending', images: [] }])
    test(`workspace refresh failure cannot erase ${result.ok ? 'saved images' : 'the pending receipt'}`, async () => {
        const error = new Error('storage_read_failed'), errors = [];
        assert.equal(await finishDrawingResult(result, { refresh: async () => { throw error; }, isDetached: () => false,
            onRefreshError: error => errors.push(error), notifyLate: () => assert.fail('Recipient still active') }), result);
        assert.deepEqual(errors, [error]);
    });
