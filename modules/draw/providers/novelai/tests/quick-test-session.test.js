import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { createQuickTestSession, QuickTestSaveError } from '../quick-test-session.js';
import { createQuickTestView } from '../quick-test-view.js';

// Acceptance: see scene-planner-design.md, paid result retention and URL ownership.
const record = { imgId: 'paid', base64: 'aGVsbG8=', slotId: 'novelai-quick-test' };

test('paid output survives a failed write, duplicate generation and duplicate save retry', async () => {
    let requests = 0, writes = 0, fail = true, release;
    const events = [], states = [];
    const session = createQuickTestSession({
        store: async () => { writes++; if (fail) throw new Error('quota'); await new Promise(resolve => { release = resolve; }); },
        notify: value => events.push(value), stateChanged: value => states.push(value),
    });
    const produce = async () => { requests++; return record; };
    const first = session.generate(produce);
    assert.equal(session.generate(produce), first);
    await assert.rejects(first, error => error instanceof QuickTestSaveError && error.cause.message === 'quota');
    assert.equal(session.records[0].base64, record.base64);
    assert.equal(session.records[0].persistence, 'unsaved');
    assert.equal(events[0].persistence, 'saving');
    assert.equal(session.hasUnsaved, true);
    fail = false;
    const retry = session.save(record.imgId);
    assert.equal(session.save(record.imgId), retry);
    await Promise.resolve();
    release();
    await retry;
    assert.equal(requests, 1);
    assert.equal(writes, 2);
    assert.equal(session.hasUnsaved, false);
    assert.deepEqual(states, [true, false]);
});

test('generation rejection does not fabricate a retained image or a cache write', async () => {
    const session = createQuickTestSession({ store: () => assert.fail(), notify: () => assert.fail(), stateChanged: () => {} });
    await assert.rejects(session.generate(async () => { throw new Error('upstream'); }), /upstream/);
    assert.equal(session.hasUnsaved, false);
    assert.equal(session.busy, false);
});

function viewFixture() {
    globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
    const { document } = parseHTML(`<html><body>
        <button id="nd_test_single"></button><div id="nd_preview"><img id="nd_preview_img"><div id="nd_test_strip"></div></div>
        <div id="nd_test_actions"><a id="nd_test_download"></a><button id="nd_test_retry"></button></div>
        <p id="nd_test_storage"></p><button id="nd_open_gallery"></button>
        <div id="nd_test_pages"><button id="nd_test_previous"></button><button id="nd_test_next"></button></div>
        <button id="nd_test_reload"></button><p id="nd_test_history_error"></p></body></html>`);
    const messages = [];
    return { document, messages, view: createQuickTestView(document, message => messages.push(message)) };
}

test('unsaved images remain downloadable across view replacement and only save retry is sent', async () => {
    const a = viewFixture(), b = viewFixture();
    const event = { type: 'TEST_RETAINED', record: { ...record, persistence: 'unsaved' } };
    a.view.handle(event); b.view.handle(event);
    await new Promise(resolve => setTimeout(resolve, 0));
    const first = a.document.getElementById('nd_test_download').href;
    const second = b.document.getElementById('nd_test_download').href;
    assert.equal(await (await fetch(first)).text(), 'hello');
    a.view.openGallery();
    assert.deepEqual(a.messages, []);
    a.document.getElementById('nd_test_retry').click();
    assert.deepEqual(a.messages, [{ type: 'TEST_RETRY_SAVE', imgId: record.imgId }]);
    a.view.dispose();
    await assert.rejects(fetch(first));
    assert.equal(await (await fetch(second)).text(), 'hello');
    b.view.handle({ type: 'TEST_RESULT', items: [] });
    await assert.rejects(fetch(second));
    b.view.dispose();
});
