import assert from 'node:assert/strict';
import test from 'node:test';
import { generateMessageReply } from '../apps/messages/application/generate-reply.js';
import { archivePrefix, CONTEXT_LIMIT, SUMMARY_TRIGGER } from '../apps/messages/application/context-policy.js';
import { countContext as countPrompt, estimateContext, meteringImages } from '../apps/messages/application/context-budget.js';
import { estimateConversationTokens, resolveConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { buildReplyPrompt } from '../apps/messages/prompt/reply-prompt.js';
import { normalizePromptContext } from '../host/prompt-context/normalize.js';
import { uploadedImageReference } from '../apps/messages/application/image-upload.js';
import { harness, controllerHarness, photo } from './helpers/messages-harness.js';

const settings = { imagePrompt: true, voicePrompt: true };
const fixtureCount = async options => ({ tokens: estimateConversationTokens(options), source: 'tokenizer' });
const countContext = (prompt, config, signal) => countPrompt(prompt, config, signal, fixtureCount);
function fixture(count = 100, text = '约定'.repeat(2000)) {
    const contact = { id: '甲', name: '甲', note: '', summary: null, createdAt: 0 };
    const history = Array.from({ length: count }, (_, index) => ({ id: `m${index}`, seq: index + 1, contactId: '甲',
        sender: index % 2 ? 'contact' : 'user', from: index % 2 ? '甲' : '我', to: index % 2 ? '我' : '甲',
        replyTo: index % 2 ? `m${index - 1}` : null, createdAt: 0, payload: { type: 'text', text } }));
    const incoming = { ...history[0], id: 'input', seq: count + 1, payload: { type: 'text', text: '还记得吗？' } };
    const background = { ...normalizePromptContext({}), people: [] };
    const calls = []; const summaries = []; const loaded = [];
    const h = { contact, history, incoming, background, calls, summaries, loaded, respond: null };
    const deps = { getSettings: () => settings, context: { capture: async () => background },
        countTokens: options => h.countTokens(options),
        images: { load: async attachment => {loaded.push(attachment.path); return 'data:image/png;base64,AQID';} },
        agent: { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async request => {
            calls.push(request);
            return h.respond ? h.respond(request) : { text: JSON.stringify(request.messages.length === 1 ? { summary: '双方的约定仍然有效。' } : { replies: [{ type: 'text', text: '记得。' }] }) };
        } }) },
    };
    h.countTokens = fixtureCount;
    h.run = () => generateMessageReply(deps, { contact, history, incoming, signal: new AbortController().signal, guard: () => true, stage() {},
        saveSummary: async (summary, previous) => {summaries.push({ summary, previous });} });
    h.prompt = () => buildReplyPrompt({ contact, history, incoming, context: background, images: meteringImages([...history, incoming]), settings });
    return h;
}

test('the complete request, not the old 18k character allowance, controls compaction', async () => {
    const h = fixture(20); const original = structuredClone(h.history);
    const used = await countContext(h.prompt(), {}, new AbortController().signal);
    assert.ok(used > 18000 && used < SUMMARY_TRIGGER);
    await h.run();
    assert.equal(h.calls.length, 1); assert.equal(h.summaries.length, 0);
    assert.deepEqual(h.history, original);
    const thread = h.calls[0].messages[2].content;
    for (const message of original) {assert.ok(thread.includes(message.payload.text));}
});

test('provider tokenization sees every prompt block and image tokens are added to, not replaced by, its count', async t => {
    const h = fixture(10, '旧通讯');
    h.history[0].payload = { type: 'image', description: '门口', attachment: uploadedImageReference(photo.upload) };
    h.contact.summary = { throughSeq: 0, text: '通讯摘要' };
    h.background.storyEvents = '搬家经过';
    let payload; let url;
    t.mock.method(globalThis, 'fetch', async (target, options) => {
        url = target; payload = JSON.parse(options.body);
        assert.equal(options.headers['X-CSRF-Token'], 'test-csrf');
        return Response.json({ count: 12345, ids: Array(12345).fill(1) });
    });
    const used = await countPrompt(h.prompt(), { provider: 'openai-compatible', model: 'test/model' }, new AbortController().signal,
        options => resolveConversationTokens({ ...options, requestHeaders: () => ({ 'X-CSRF-Token': 'test-csrf' }) }));
    assert.equal(used, 12345 + 6000);
    assert.equal(url, '/api/tokenizers/openai/encode?model=test%2Fmodel');
    const text = JSON.stringify(payload);
    for (const value of ['搬家经过', '通讯摘要', '旧通讯', '还记得吗？']) {assert.ok(text.includes(value));}
    assert.ok(!text.includes(photo.upload.dataUrl));
});

test('large contexts compact in bounded batches, retain recent complete turns, and never delete stored history', async () => {
    const h = fixture(); const original = structuredClone(h.history);
    assert.ok(await countContext(h.prompt(), {}, new AbortController().signal) > CONTEXT_LIMIT);
    const result = await h.run();
    assert.ok(h.summaries.length >= 2);
    for (let index = 0; index < h.summaries.length; index++) {
        assert.equal(h.summaries[index].previous, h.summaries[index - 1]?.summary.throughSeq ?? 0);
        assert.ok(await countContext(h.calls[index], {}, new AbortController().signal) <= SUMMARY_TRIGGER);
    }
    assert.equal(result.summary.throughSeq, 90);
    assert.ok(await countContext(h.calls.at(-1), {}, new AbortController().signal) <= CONTEXT_LIMIT);
    assert.deepEqual(h.history, original); assert.equal(h.contact.summary, null);
    // A ten-bubble boundary falling inside a multi-bubble reply retains the whole turn.
    const varied = fixture(15, '短消息').history;
    varied[4].sender = 'contact';
    assert.equal(archivePrefix(varied).at(-1).seq, 2);
});

test('403 allows replies using estimates; restored authentication uses token counts for compaction', async t => {
    const h = fixture(20, '短通讯');
    let csrf = ''; const requests = [];
    h.countTokens = options => resolveConversationTokens({ ...options, requestHeaders: () => ({ 'X-CSRF-Token': csrf }) });
    t.mock.method(globalThis, 'fetch', async (_url, options) => {
        if (options.headers['X-CSRF-Token'] !== 'valid') {return new Response('', { status: 403 });}
        requests.push(JSON.parse(options.body).text);
        // Correct tokenization crosses the trigger despite the small local preview.
        const count = requests.length === 1 ? 194088 : 16671;
        return Response.json({ count, ids: Array(count).fill(1) });
    });
    assert.ok(estimateContext(h.prompt(), h.contact, h.history).usedTokens < SUMMARY_TRIGGER);
    await h.run();
    assert.equal(h.calls.length, 1); assert.equal(h.summaries.length, 0);
    csrf = 'valid';
    await h.run();
    assert.equal(h.summaries.length, 1); assert.equal(h.calls.length, 3);
});

test('image-only context reserves visual tokens, compacts with real pixels, and does not use filenames as vision', async () => {
    const h = fixture(60, '');
    const attachment = uploadedImageReference(photo.upload);
    for (const message of h.history) {if (message.sender === 'user') {message.payload = { type: 'image', description: '', attachment };}}
    const stats = estimateContext(h.prompt(), h.contact, h.history);
    assert.equal(stats.imageTokens, 30 * 6000); assert.ok(stats.usedTokens > CONTEXT_LIMIT);
    await h.run();
    assert.ok(h.summaries.length > 0); assert.equal(h.loaded.length, 30);
    const images = h.calls.flatMap(call => call.messages.flatMap(message => Array.isArray(message.content) ? message.content.filter(part => part.type === 'image_url') : []));
    assert.equal(images.length, 30);
    assert.ok(images.every(image => image.image_url.url.startsWith('data:image/')));
});

test('uncompressible context above 158k is rejected before calling the reply model; 128k alone is not a hard cap', async () => {
    const h = fixture(10);
    h.background.storyEvents = '剧情'.repeat(80000);
    await assert.rejects(h.run(), /messages_context_capacity/);
    assert.equal(h.calls.length, 0); assert.equal(h.summaries.length, 0);
    h.background.storyEvents = '剧情'.repeat(55000);
    const used = await countContext(h.prompt(), {}, new AbortController().signal);
    assert.ok(used >= SUMMARY_TRIGGER && used <= CONTEXT_LIMIT);
    await h.run(); assert.equal(h.calls.length, 1); assert.equal(h.summaries.length, 0);
});

test('failed, truncated or expanding summaries never advance the saved cutoff', async t => {
    for (const mode of ['failed', 'truncated', 'expanding']) {await t.test(mode, async () => {
        const h = mode === 'expanding' ? fixture(12, '短消息') : fixture();
        if (mode === 'expanding') {h.background.storyEvents = '剧情'.repeat(73000);}
        h.respond = () => {
            if (mode === 'failed') {throw Error('offline');}
            return { text: JSON.stringify({ summary: '摘要'.repeat(mode === 'expanding' ? 3000 : 2) }), finishReason: mode === 'truncated' ? 'length' : 'stop' };
        };
        await assert.rejects(h.run(), mode === 'failed' ? /offline/ : mode === 'truncated' ? /summary_incomplete/ : /summary_not_reduced/);
        assert.equal(h.summaries.length, 0); assert.equal(h.contact.summary, null); assert.equal(h.calls.length, 1);
    });}
});

test('Host context preview includes the entire contact history, ignores pagination and does no writes or generation', async () => {
    const h = await harness(); await h.send('甲', 'a'); await h.send('乙', 'b');
    const c = await controllerHarness(h); const before = structuredClone(h.service.current()); const writes = h.writes; const calls = h.apiCalls;
    const preview = await c.command('context', { contactId: '甲' });
    assert.equal(preview.stats.limit, CONTEXT_LIMIT); assert.equal(preview.stats.trigger, SUMMARY_TRIGGER);
    assert.ok(preview.stats.historyTokens > 0);
    assert.equal(preview.revision, (await c.command('thread', { contactId: '甲' })).revision);
    assert.deepEqual(h.service.current(), before); assert.equal(h.writes, writes); assert.equal(h.apiCalls, calls);
    await c.runtime.stop(); c.controller.deactivate();
});
