import assert from 'node:assert/strict';
import test from 'node:test';
import { createRecallReuse, recallConfigKey } from '../generate/recall-reuse.js';

const ai = mes => ({ is_user: false, mes });
const user = mes => ({ is_user: true, mes });
const result = { text: 'adopted memory', boundary: 0, role: 0, report: 'original report' };

function fixture(chat = [ai('history'), user('query')]) {
    const cache = createRecallReuse();
    const context = { chatId: 'a', chat };
    function recall(type = 'normal', value = result) {
        const prepared = cache.prepare(context, type);
        if (!prepared.memory) assert.equal(cache.adopt(prepared.ticket, context, value), true);
        return prepared.memory;
    }
    return { cache, context, recall };
}

test('one recall covers continued growth, swipe, native regenerate deletion and normal retry', () => {
    const { cache, context, recall } = fixture();
    assert.equal(recall(), null);
    context.chat.push(ai('answer'));
    for (let i = 0; i < 5; i++) {
        context.chat[2].mes += ' continuation';
        assert.equal(recall('continue').text, result.text);
    }
    context.chat[2].mes = 'swiped answer';
    cache.historyChanged(context, 2);
    assert.equal(recall('swipe').text, result.text);
    context.chat.pop(); // host regenerate deletes before the interceptor
    cache.historyChanged(context);
    assert.equal(recall('regenerate').text, result.text);
    assert.equal(recall().text, result.text);
});

test('AI-only chats and first-operation continue use the actual source, without excluding previous AI on regenerate', () => {
    const { cache, context, recall } = fixture([ai('history'), ai('opening')]);
    assert.equal(recall('continue'), null);
    context.chat[1].mes += ' more';
    assert.equal(recall('continue').sourceRef, context.chat[1]);
    cache.historyChanged(context, 1);
    assert.equal(recall('swipe').text, result.text);
    context.chat.pop();
    cache.historyChanged(context);
    assert.equal(recall('regenerate'), null);
    assert.equal(recall('normal').sourceRef, context.chat[0]);
});

test('first swipe binds the previous message; missing source and F5 have no cached memory', () => {
    const { cache, context, recall } = fixture([user('query'), ai('answer')]);
    assert.equal(recall('swipe'), null);
    assert.equal(recall('swipe').sourceRef, context.chat[0]);
    assert.equal(createRecallReuse().prepare(context, 'swipe').memory, null);
    assert.equal(cache.prepare({ chatId: 'empty', chat: [] }).ticket, null);
    assert.equal(cache.prepare({ chatId: 'greeting', chat: [ai('opening')] }, 'swipe').ticket, null);
});

test('a normal reply to an AI first continued without cache is a new round', () => {
    const { context, recall } = fixture([ai('history'), ai('partial answer')]);
    recall('continue');
    context.chat[1].mes += ' completed';
    assert.equal(recall('continue').sourceIndex, 1);
    assert.equal(recall('normal'), null);
    assert.equal(recall('normal').replyStart, 2);
    context.chat.push(ai('another member'), ai('unrelated new message'));
    assert.equal(recall('continue'), null);
});

test('new USER or group member source replaces the only slot, even if its recall later fails', () => {
    const { cache, context, recall } = fixture();
    recall();
    for (let i = 0; i < 30; i++) {
        context.chat.push(i % 2 ? ai('group member') : user('next query'));
        assert.equal(recall(), null);
        assert.equal(cache.getStats().count, 1);
    }
    context.chat.push(ai('next member'));
    cache.prepare(context);
    assert.equal(cache.getStats().count, 0); // prepare alone cannot publish
    context.chat.splice(2); // whole-group regenerate deleted the newest source
    cache.historyChanged(context);
    assert.equal(recall(), null);
});

test('empty adopted results are hits and no retrieval runtime is retained', () => {
    const { cache, context, recall } = fixture();
    recall('normal', { ...result, text: '', metrics: { runtime: 'must not retain' } });
    context.chat.push(ai('answer'));
    const reused = recall('continue');
    assert.equal(reused.text, '');
    assert.deepEqual(Object.keys(reused).sort(), [
        'chatId', 'sourceRef', 'sourceIndex', 'replyStart', 'text', 'boundary', 'role', 'report',
    ].sort());
    assert.equal(cache.getStats().count, 1);
});

test('quiet and impersonation requests cannot consume or replace the conversational memory', () => {
    const { cache, context, recall } = fixture();
    recall();
    context.chat.push(ai('answer'));
    for (const type of ['quiet', 'impersonate']) {
        const prepared = cache.prepare(context, type);
        assert.deepEqual(prepared, { ticket: null, memory: null });
        assert.equal(cache.adopt(prepared.ticket, context, result), false);
    }
    assert.equal(recall('continue').sourceIndex, 1);
});

test('source deletion/replacement, earlier swipe, explicit edit and chat reload invalidate', () => {
    for (const change of [
        ({ context }) => context.chat.pop(),
        ({ context }) => context.chat.splice(0, 1),
        ({ context }) => { context.chat[1] = user('replacement'); },
        ({ cache, context }) => cache.historyChanged(context, 0),
        ({ cache }) => cache.invalidate(), // explicit edit, manual summary or config
        ({ context }) => { context.chatId = 'b'; },
        ({ context }) => { context.chat = structuredClone(context.chat); },
    ]) {
        const f = fixture();
        f.recall();
        change(f);
        f.cache.historyChanged(f.context);
        assert.equal(f.cache.getStats().count, 0);
    }
});

test('late completions and prepared reuse cannot publish after invalidation or a newer run', () => {
    const { cache, context, recall } = fixture();
    const late = cache.prepare(context);
    cache.invalidate();
    assert.equal(cache.adopt(late.ticket, context, result), false);
    recall();
    const reuse = cache.prepare(context);
    cache.invalidate();
    recall('normal', { ...result, text: 'new' });
    assert.equal(cache.isCurrent(reuse.ticket, context), false);
    assert.equal(cache.adopt(late.ticket, context, result), false);
    assert.equal(recall().text, 'new');
    const pending = cache.prepare(context);
    context.chat.push(user('new input during await'));
    assert.equal(cache.isCurrent(pending.ticket, context), false);
});

test('hiding and background data changes preserve the adopted text and original boundary', () => {
    const { context, recall } = fixture();
    recall();
    context.chat[0].is_system = true;
    context.summary = { text: 'new background summary', boundary: 5 };
    assert.equal(recall().text, result.text);
    assert.equal(recall().boundary, 0);
});

test('only recall and assembly config changes affect the config key', () => {
    const config = { vector: { enabled: true }, trigger: { role: 'system' }, ui: { keepVisibleCount: 6 } };
    const key = recallConfigKey(config);
    assert.equal(recallConfigKey({ ...config, ui: { ...config.ui, hideSummarized: true }, api: { model: 'other' } }), key);
    for (const changed of [
        { ...config, vector: { enabled: false } },
        { ...config, trigger: { role: 'user' } },
        { ...config, ui: { keepVisibleCount: 4 } },
        { ...config, textFilterRules: [] },
        { ...config, prompts: { memoryTemplate: 'changed' } },
    ]) assert.notEqual(recallConfigKey(changed), key);
});
