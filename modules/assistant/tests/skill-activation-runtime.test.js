import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequestImageProjection, imageDataUrl } from '../app-src/runtime/request-images.js';
import { createAssistantRuntime } from '../app-src/runtime.js';
import { createAttachmentsManager } from '../app-src/attachments.js';
import { TOOL_DEFINITIONS, TOOL_NAMES, buildToolDefinitions, formatToolResultDisplay } from '../app-src/tooling.js';

// Contracts: only confirmed skill receipts unlock tools; request snapshots reject premature calls.
// Compacted activation belongs to the parent conversation; delegates learn only from their own receipts.
// Session providers retain initial tools, so changed availability requires a complete replay.
const done = { text: 'Verified.', toolCalls: [] };
let callId = 0;
const call = (name, args = {}) => ({ id: `skill-call-${++callId}`, name, arguments: JSON.stringify(args) });
const step = (...toolCalls) => ({ text: '', toolCalls });
const readSkill = id => call(TOOL_NAMES.READ_SKILL, { id });
const names = task => new Set(task.tools.map(definition => definition.function.name));

function harness(t, { steps, delegates = [], archivedSkillIds = [], results = {}, session = false, user = 'Inspect the fixture.', skills = [], imageInput = { main: true, delegate: true }, toolDefinitions, waitForRetry = async () => {} }) {
    t.mock.method(console, 'info', () => {});
    const run = { id: 'skill-runtime', controller: new AbortController(), toolRequestIds: new Set(), workspaceBaseline: [] };
    // Runtime tests isolate request policy; real browser normalization has its own boundary test.
    const createProjection = () => createRequestImageProjection({
        encode: async blob => ({ url: await imageDataUrl(blob) }),
        readBlob: async () => assert.fail('Unexpected workspace image read'),
    });
    run.imageProjection = createProjection();
    const state = { messages: [{ role: 'user', content: user }], archivedTurnCount: 0, archivedSkillIds,
        activeRun: run, runtime: { skillsCatalog: { skills } } };
    const pendingToolCalls = new Map(), requests = [], dispatched = [];
    let requestId = 0, delegateIndex = 0;
    const attachments = createAttachmentsManager({ acceptedImageMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] });
    const runtime = createAssistantRuntime({
        waitForModelRetry: waitForRetry,
        state, TOOL_NAMES, TOOL_DEFINITIONS, pendingToolCalls, pendingApprovals: new Map(),
        render() {}, persistSession() {}, showToast() {}, createRequestId: () => `skill-request-${++requestId}`,
        safeJsonParse: JSON.parse, describeError: error => error.message, formatToolResultDisplay,
        normalizeAttachments: attachments.normalizeAttachments, normalizeThoughtBlocks: () => [],
        buildUserContentParts: attachments.buildUserContentParts, buildTextWithAttachmentSummary: attachments.buildTextWithAttachmentSummary,
        normalizeSlashSkillTrigger: value => value.startsWith('/') ? value.trim() : '',
        getActiveProviderConfig: () => ({ provider: 'openai-compatible' }),
        getDelegateProviderConfig: () => ({ provider: 'openai-compatible', model: 'delegate-fixture' }),
        getToolDefinitions: ({ role, imageInput: enabled } = {}) => toolDefinitions || buildToolDefinitions({ imageInput: enabled ?? imageInput[role] }),
        getSystemPrompt: ({ imageInput: enabled } = {}) => `Fixture image input: ${enabled}`,
        isImageInputEnabled: ({ role }) => imageInput[role],
        SYSTEM_PROMPT: '', MAX_CONTEXT_TOKENS: 100000, SUMMARY_TRIGGER_TOKENS: 90000,
        REQUEST_TIMEOUT_MS: 1000,
        isAbortError: error => error.name === 'AbortError',
        createAdapter: config => {
            const role = config.model === 'delegate-fixture' ? `delegate-${delegateIndex++}` : 'main';
            const queue = role === 'main' ? steps : delegates[delegateIndex - 1];
            return { supportsSessionToolLoop: session, async chat(task) {
                requests.push({ role, ...structuredClone({ tools: task.tools, messages: task.messages, toolResponses: task.toolResponses, finalAnswerReminderText: task.finalAnswerReminderText }) });
                assert.ok(queue?.length, 'No unplanned model retries');
                const next = queue.shift();
                if (next instanceof Error) throw next;
                return typeof next === 'function' ? next(task) : next;
            } };
        },
        post(type, payload) {
            if (type !== 'xb-assistant:tool-call') return;
            dispatched.push(payload);
            const result = payload.name === TOOL_NAMES.READ_SKILL
                ? results[payload.arguments.id] || { ok: true, builtin: true, id: payload.arguments.id, content: 'Fixture skill.' }
                : typeof results[payload.name] === 'function' ? results[payload.name](payload.arguments) : results[payload.name] || { ok: true };
            queueMicrotask(() => pendingToolCalls.get(payload.requestId).resolve(result));
        },
    });
    return { state, run, runtime, requests, dispatched, start: () => {
        run.imageProjection ??= createProjection();
        return runtime.runAssistantLoop(run);
    } };
}

const uploadedImage = name => ({ kind: 'image', name, type: 'image/png', size: 7, dataUrl: 'data:image/png;base64,Zml4dHVyZQ==' });
const requestImages = request => request.messages?.flatMap(message => Array.isArray(message.content) ? message.content : []).filter(part => part.type === 'image_url') || [];

// Regression: switching to a text-only preset must not keep resending old uploads;
// toggling back on must recover the same originals without another upload.
for (const session of [false, true]) test(`uploaded attachments obey the current preset across runs and tool continuation (${session})`, async t => {
    const imageInput = { main: false, delegate: true };
    const steps = [step(call(TOOL_NAMES.READ, { filePath: 'local/note.txt' })), done];
    const h = harness(t, { session, imageInput, steps });
    const originalUsers = [
        { role: 'user', content: 'Earlier image.', attachments: [uploadedImage('earlier.png')] },
        { role: 'user', content: '', attachments: [uploadedImage('current.png')] },
    ];
    h.state.messages = [structuredClone(originalUsers[0]), { role: 'assistant', content: 'Earlier reply.' }, structuredClone(originalUsers[1])];
    for (const enabled of [false, true, false]) {
        imageInput.main = enabled;
        const start = h.requests.length;
        if (start) steps.push(done);
        await h.start();
        const requests = h.requests.slice(start);
        assert.equal(requestImages(requests[0]).length, enabled ? 2 : 0);
        if (!enabled) {
            for (const request of requests) {
                // Data-safety boundary: uploaded bytes cannot leak via any request field.
                assert.equal(JSON.stringify(request).includes(originalUsers[0].attachments[0].dataUrl), false);
            }
            const users = requests[0].messages.filter(message => message.role === 'user');
            for (const [index, user] of users.entries()) {
                assert.ok(user.content.some(part => part.type === 'text' && part.text.includes(originalUsers[index].attachments[0].name)));
            }
        }
        assert.deepEqual(h.state.messages.filter(message => message.role === 'user'), originalUsers);
    }
    if (session) assert.equal(h.requests[1].toolResponses.length, 1);
});

for (const role of ['main', 'delegate']) test(`disabling images during ${role} normalization rebuilds before dispatch`, async t => {
    const delegate = role === 'delegate';
    const imageInput = { main: !delegate, delegate };
    const file = { path: 'local/fixture.png', name: 'fixture.png', kind: 'image', mimeType: 'image/png', sizeBytes: 7, blobId: 'fixture' };
    const h = harness(t, { session: true, imageInput, archivedSkillIds: delegate ? ['builtin-planning'] : [],
        steps: delegate ? [step(call(TOOL_NAMES.DELEGATE_RUN, { task: 'Inspect the image' })), done] : [done],
        delegates: delegate ? [[step(call(TOOL_NAMES.READ_IMAGE, { path: file.path })), done]] : [],
        results: { [TOOL_NAMES.READ_IMAGE]: { ok: true, images: [file] } },
    });
    if (!delegate) h.state.messages[0].attachments = [uploadedImage('fixture.png')];
    const originals = structuredClone(h.state.messages[0]);
    h.state.activeRun.imageProjection = createRequestImageProjection({
        readBlob: async () => new Blob(['fixture'], { type: 'image/png' }),
        encode: async blob => {
            await Promise.resolve();
            imageInput[role] = false;
            return { url: await imageDataUrl(blob) };
        },
    });
    await h.start();
    const requests = h.requests.filter(item => item.role === (delegate ? 'delegate-0' : 'main'));
    assert.equal(requests.length, delegate ? 2 : 1, 'Preparation retries do not call the model');
    const next = requests.at(-1);
    assert.equal(next.toolResponses, undefined);
    assert.equal(requestImages(next).length, 0);
    assert.equal(JSON.stringify(next).includes('data:image/'), false);
    assert.equal(names(next).has(TOOL_NAMES.READ_IMAGE), false);
    assert.deepEqual(h.state.messages[0], originals);
    if (delegate) assert.equal(h.dispatched.filter(item => item.name === TOOL_NAMES.READ_IMAGE).length, 1);
});

test('turning off uploads resets a retained session even when tool names do not change', async t => {
    const imageInput = { main: true, delegate: true };
    const read = () => step(call(TOOL_NAMES.READ, { filePath: 'local/note.txt' }));
    const h = harness(t, { session: true, imageInput, steps: [read(), read(), done],
        toolDefinitions: TOOL_DEFINITIONS.filter(tool => tool.function.name === TOOL_NAMES.READ),
        results: { [TOOL_NAMES.READ]: () => { imageInput.main = false; return { ok: true, content: 'fixture' }; } },
    });
    h.state.messages[0].attachments = [uploadedImage('fixture.png')];
    await h.start();
    assert.equal(requestImages(h.requests[0]).length, 1);
    assert.equal(h.requests[1].toolResponses, undefined, 'The old image-bearing provider session must be discarded');
    assert.ok(h.requests[1].messages?.length);
    assert.equal(JSON.stringify(h.requests[1]).includes('data:image/'), false);
    assert.equal(h.requests[2].toolResponses.length, 1, 'Subsequent text-only requests can continue efficiently');
});

test('a delegate model failure still returns partial artwork and the unsaved batch to its parent', async t => {
    const file = { path: 'local/images/partial.png', name: 'partial.png', kind: 'image', mimeType: 'image/png', sizeBytes: 4, blobId: 'partial' };
    const h = harness(t, { archivedSkillIds: ['builtin-planning'], imageInput: { main: false, delegate: false },
        steps: [step(call(TOOL_NAMES.DELEGATE_RUN, { task: 'Make two illustrations' })), done],
        delegates: [[step(call(TOOL_NAMES.DRAW_IMAGE, { prompt: 'first' })), step(call(TOOL_NAMES.DRAW_IMAGE, { prompt: 'second' })), new Error('offline_model')]],
        results: { [TOOL_NAMES.DRAW_IMAGE]: ({ prompt }) => prompt === 'first' ? { ok: false, images: [file], error: 'provider_error' }
            : { ok: false, images: [], receiptId: 'already-paid', receivedCount: 1, error: 'workspace_image_save_failed', cause: 'disk_full' } } });
    await h.start();
    const result = JSON.parse(h.state.messages.find(message => message.toolName === TOOL_NAMES.DELEGATE_RUN).content);
    assert.equal(result.status, 'failed');
    assert.equal(result.error, 'offline_model');
    assert.deepEqual(result.images, [file]);
    assert.equal(result.drawingFailures.length, 2);
    assert.equal(result.drawingFailures[1].cause, 'disk_full');
    assert.equal(result.drawingFailures[1].receiptId, 'already-paid');
    assert.equal(h.dispatched.filter(item => item.name === TOOL_NAMES.DRAW_IMAGE).length, 2);
    assert.equal(h.dispatched.some(item => item.name === TOOL_NAMES.SAVE_DRAW_IMAGES), false);
});

test('delegate can choose to save a received batch to a different folder without paying for another drawing', async t => {
    const file = { path: 'local/art/final.png', name: 'final.png', kind: 'image', mimeType: 'image/png', sizeBytes: 4, blobId: 'saved' };
    const h = harness(t, { archivedSkillIds: ['builtin-planning'], imageInput: { main: false, delegate: false },
        steps: [step(call(TOOL_NAMES.DELEGATE_RUN, { task: 'Draw and save' })), done],
        delegates: [[step(call(TOOL_NAMES.DRAW_IMAGE, { prompt: 'draw' })), step(call(TOOL_NAMES.SAVE_DRAW_IMAGES, { receiptId: 'paid', outputDir: 'local/art' })), done]],
        results: { [TOOL_NAMES.DRAW_IMAGE]: { ok: false, error: 'workspace_image_save_failed', receiptId: 'paid', receivedCount: 1 },
            [TOOL_NAMES.SAVE_DRAW_IMAGES]: { ok: true, images: [file] } } });
    await h.start();
    const result = JSON.parse(h.state.messages.find(message => message.toolName === TOOL_NAMES.DELEGATE_RUN).content);
    assert.deepEqual(result.images, [file]);
    assert.equal(result.drawingFailures, undefined);
    assert.equal(h.dispatched.filter(item => item.name === TOOL_NAMES.DRAW_IMAGE).length, 1);
});

test('idle usage follows enabled, deleted and draft images without reading workspace bytes', t => {
    const imageInput = { main: true, delegate: false }, h = harness(t, { steps: [], imageInput });
    h.state.activeRun = null;
    const file = { kind: 'image', path: 'local/images/usage.png', blobId: 'usage', name: 'usage.png', mimeType: 'image/png', sizeBytes: 4 };
    h.state.messages.push({ role: 'tool', toolName: TOOL_NAMES.DRAW_IMAGE, toolCallId: 'photo', content: JSON.stringify({ images: [file] }) });
    h.state.localSources = [{ files: [file] }];
    const count = () => h.runtime.updateDisplayContextStats();
    const one = count();
    h.state.draftAttachments = [uploadedImage('draft.png')];
    assert.ok(count() >= one + 1600);
    h.state.draftAttachments = [];
    assert.equal(count(), one);
    h.state.localSources = [];
    assert.ok(count() < one - 1500);
    h.state.localSources = [{ files: [file] }];
    imageInput.main = false;
    assert.ok(count() < one - 1500);
});

test('cancelling upload normalization prevents dispatch and preserves the attachment', async t => {
    const h = harness(t, { steps: [done] });
    const image = uploadedImage('fixture.png');
    h.state.messages[0].attachments = [image];
    h.state.activeRun.imageProjection = createRequestImageProjection({ encode: async blob => {
        h.state.activeRun.controller.abort();
        return { url: await imageDataUrl(blob) };
    } });
    await assert.rejects(h.start(), { name: 'AbortError' });
    assert.equal(h.requests.length, 0);
    assert.deepEqual(h.state.messages[0].attachments, [image]);
});

for (const main of [false, true]) test(`delegates do not inherit parent uploads regardless of their own image setting (${main})`, async t => {
    const h = harness(t, { imageInput: { main, delegate: !main }, archivedSkillIds: ['builtin-planning'],
        steps: [step(call(TOOL_NAMES.DELEGATE_RUN, { task: 'Review the provided text.', context: 'Text only.' })), done],
        delegates: [[done]] });
    h.state.messages[0].attachments = [uploadedImage('parent.png')];
    await h.start();
    assert.equal(requestImages(h.requests[0]).length, main ? 1 : 0);
    const delegate = h.requests.find(request => request.role === 'delegate-0');
    assert.equal(requestImages(delegate).length, 0);
    assert.equal(names(delegate).has(TOOL_NAMES.READ_IMAGE), !main);
    assert.equal(JSON.stringify(delegate).includes('data:image/'), false);
});

for (const role of ['main', 'delegate']) test(`a ${role} preset without image input offers no ReadImage, sends no image and keeps the session (${role})`, async t => {
    const file = { path: 'local/images/drawn.png', name: 'drawn.png', kind: 'image', mimeType: 'image/png', sizeBytes: 4, blobId: 'drawn' };
    const drawSteps = [step(call(TOOL_NAMES.DRAW_IMAGE, { prompt: 'cat' })), done];
    const delegate = role === 'delegate';
    const h = harness(t, { session: true, archivedSkillIds: delegate ? ['builtin-planning'] : [],
        imageInput: { main: delegate, delegate: !delegate },
        steps: delegate ? [step(call(TOOL_NAMES.DELEGATE_RUN, { task: 'Draw a cat' })), done] : drawSteps,
        delegates: delegate ? [drawSteps] : [],
        results: { [TOOL_NAMES.DRAW_IMAGE]: { ok: true, images: [file] } } });
    let reads = 0;
    h.state.activeRun.imageProjection = createRequestImageProjection({ readBlob: async () => {
        reads++;
        return new Blob(['test'], { type: 'image/png' });
    }, encode: async blob => ({ url: await imageDataUrl(blob) }) });
    await h.start();
    const requests = h.requests.filter(item => item.role === (delegate ? 'delegate-0' : 'main'));
    assert.equal(requests.length, 2);
    for (const request of requests) {
        assert.equal(names(request).has(TOOL_NAMES.READ_IMAGE), false);
        assert.equal(names(request).has(TOOL_NAMES.DRAW_IMAGE), true);
    }
    assert.equal(requests[1].toolResponses?.length, 1, 'Unprojected image history continues the provider session');
    assert.equal(reads, delegate ? 1 : 0, 'Only the enabled parent reads the returned image');
    if (delegate) assert.equal(requestImages(h.requests.at(-1)).length, 1);
});

for (const delegate of [false, true]) test(`image context forces complete session replay, including deletion (${delegate ? 'delegate' : 'main'})`, async t => {
    let deleted = false;
    const file = { path: 'local/images/view.png', name: 'view.png', kind: 'image', mimeType: 'image/png', sizeBytes: 4, blobId: 'image-result' };
    const imageSteps = [step(call(TOOL_NAMES.READ_IMAGE, { path: file.path })), step(call(TOOL_NAMES.DELETE, { path: file.path })), { text: '', toolCalls: [] }, done];
    const h = harness(t, { session: true, archivedSkillIds: delegate ? ['builtin-planning'] : [],
        steps: delegate ? [step(call(TOOL_NAMES.DELEGATE_RUN, { task: 'Inspect and delete the test image' })), done] : imageSteps,
        delegates: delegate ? [imageSteps] : [],
        results: { [TOOL_NAMES.READ_IMAGE]: { ok: true, images: [file] }, [TOOL_NAMES.DELETE]: () => { deleted = true; return { ok: true }; } } });
    h.state.activeRun.imageProjection = createRequestImageProjection({ encode: async blob => ({ url: await imageDataUrl(blob) }), readBlob: async id => {
        assert.equal(id, file.blobId);
        if (deleted) throw new Error('workspace_image_blob_not_found');
        return new Blob(['test'], { type: 'image/png' });
    } });
    await h.start();
    const requests = h.requests.filter(item => item.role === (delegate ? 'delegate-0' : 'main'));
    const images = request => request.messages?.flatMap(message => Array.isArray(message.content) ? message.content : []).filter(part => part.type === 'image_url');
    assert.equal(requests.length, 4);
    const systemParts = request => request.messages.filter(message => message.role === 'system').length;
    assert.equal(systemParts(requests[3]), systemParts(requests[2]) + 1);
    assert.equal(requests[1].toolResponses, undefined); assert.equal(images(requests[1]).length, 1);
    assert.equal(requests[2].toolResponses, undefined); assert.equal(images(requests[2]).length, 0);
    // Security/storage boundary: model-only image bytes must not enter persisted chat JSON.
    assert.equal(JSON.stringify(h.state.messages).includes('data:image/'), false);
});

for (const session of [false, true]) test(`skill availability updates on the next request and restarts retained tool sessions (${session})`, async t => {
    const h = harness(t, { session, steps: [
        step(readSkill('builtin-live-page'), call(TOOL_NAMES.INSPECT_PAGE)),
        step(call(TOOL_NAMES.INSPECT_PAGE)),
        done,
    ] });
    await h.start();
    assert.equal(names(h.requests[0]).has(TOOL_NAMES.INSPECT_PAGE), false);
    assert.equal(names(h.requests[0]).has(TOOL_NAMES.DRAW_IMAGE), true);
    assert.equal(names(h.requests[0]).has(TOOL_NAMES.DRAW_PRESETS), true);
    assert.equal(names(h.requests[0]).has(TOOL_NAMES.SAVE_DRAW_IMAGES), true);
    assert.equal(names(h.requests[0]).has(TOOL_NAMES.READ_LOGS), true);
    assert.equal(names(h.requests[1]).has(TOOL_NAMES.INSPECT_PAGE), true);
    assert.equal(names(h.requests[1]).has(TOOL_NAMES.CARD_FILES), true);
    assert.ok(h.requests[1].messages?.length, 'Changed tools require cold replay, including the receipt');
    assert.equal(h.requests[1].toolResponses, undefined);
    if (session) assert.equal(h.requests[2].toolResponses.length, 1, 'Unchanged tools retain the efficient session continuation');
    assert.equal(h.dispatched.filter(item => item.name === TOOL_NAMES.INSPECT_PAGE).length, 1);
    const denied = h.state.messages.filter(message => message.role === 'tool').map(message => JSON.parse(message.content))
        .find(result => result.error === 'skill_tool_not_available');
    assert.equal(denied.toolName, TOOL_NAMES.INSPECT_PAGE);
});

for (const receipt of [{ ok: false, id: 'builtin-live-page', builtin: true }, { ok: true, id: 'builtin-live-page' }]) {
    test(`failed or nonbuiltin receipt cannot unlock tools (${JSON.stringify(receipt)})`, async t => {
        const h = harness(t, { results: { 'builtin-live-page': receipt },
            steps: [step(readSkill('builtin-live-page')), step(call(TOOL_NAMES.INSPECT_PAGE)), done] });
        await h.start();
        assert.equal(h.requests.every(request => !names(request).has(TOOL_NAMES.INSPECT_PAGE)), true);
        assert.equal(h.dispatched.some(item => item.name === TOOL_NAMES.INSPECT_PAGE), false);
    });
}

test('slash-triggered successful ReadSkill activates tools before the first model request', async t => {
    const h = harness(t, { user: '/card', skills: [{ id: 'builtin-card-files', slashTriggers: ['/card'] }],
        steps: [step(call(TOOL_NAMES.CARD_FILES)), done] });
    await h.start();
    assert.equal(names(h.requests[0]).has(TOOL_NAMES.CARD_FILES), true);
    assert.deepEqual(h.dispatched.map(item => item.name), [TOOL_NAMES.READ_SKILL, TOOL_NAMES.CARD_FILES]);
});

test('discarded future receipts stop enabling tools without a mutable activation flag', async t => {
    const steps = [step(readSkill('builtin-card-files')), done];
    const h = harness(t, { steps });
    await h.start();
    h.state.messages = h.state.messages.slice(0, 1);
    steps.push(step(call(TOOL_NAMES.CARD_FILES)), done);
    await h.start();
    assert.equal(names(h.requests[2]).has(TOOL_NAMES.CARD_FILES), false);
    assert.equal(h.dispatched.some(item => item.name === TOOL_NAMES.CARD_FILES), false);
});

test('parent and sibling delegates have isolated receipt-derived activation and coordination remains main-only', async t => {
    const h = harness(t, { session: true, archivedSkillIds: ['builtin-planning', 'builtin-card-files'],
        steps: [step(call(TOOL_NAMES.DELEGATE_RUN, { task: 'First bounded task' })),
            step(call(TOOL_NAMES.DELEGATE_RUN, { task: 'Second bounded task' })),
            step(call(TOOL_NAMES.INSPECT_PAGE)), done],
        delegates: [
            [step(call(TOOL_NAMES.CARD_FILES)), step(readSkill('builtin-live-page')), step(call(TOOL_NAMES.INSPECT_PAGE)), done],
            [step(call(TOOL_NAMES.INSPECT_PAGE), readSkill('builtin-planning')), done],
        ],
    });
    await h.start();
    const first = h.requests.filter(item => item.role === 'delegate-0');
    const second = h.requests.filter(item => item.role === 'delegate-1');
    assert.equal(names(first[0]).has(TOOL_NAMES.CARD_FILES), false, 'Parent activation is not inherited');
    assert.equal(names(first[2]).has(TOOL_NAMES.INSPECT_PAGE), true);
    assert.ok(first[2].messages?.length, 'Delegate session replays after activation');
    assert.equal(first[2].toolResponses, undefined);
    assert.equal(names(second[0]).has(TOOL_NAMES.INSPECT_PAGE), false, 'Sibling activation is not inherited');
    assert.equal(h.requests.filter(item => item.role === 'main').every(item => !names(item).has(TOOL_NAMES.INSPECT_PAGE)), true);
    for (const request of [...first, ...second]) {
        assert.equal(names(request).has(TOOL_NAMES.DELEGATE_RUN), false);
        assert.equal(names(request).has(TOOL_NAMES.PLAN_CREATE), false);
    }
    assert.equal(h.dispatched.filter(item => item.name === TOOL_NAMES.INSPECT_PAGE).length, 1);
    assert.equal(h.dispatched.some(item => item.name === TOOL_NAMES.CARD_FILES), false);
    assert.equal(h.state.messages.some(message => message.toolName === TOOL_NAMES.READ_SKILL), false, 'Delegate receipts stay outside parent history');
});

// Retry contracts: committed effects survive, abandoned streams never enter replay,
// retained sessions restart from canonical receipts, and policy changes do not renew the budget.
for (const session of [false, true]) for (const exhaust of [false, true]) test(`refusal retry needs no deleted message or added continue turn (session=${session}, exhaust=${exhaust})`, async t => {
    t.mock.method(console, 'error', () => {});
    const refusal = Object.assign(new Error('fixture refused'), { code: 'AGENT_RESPONSE_REFUSED', reason: 'PROHIBITED_CONTENT' });
    const refuse = task => { task.onStreamProgress({ text: 'unusable refusal', thoughts: [{ text: 'discarded', label: 'fixture' }] }); throw refusal; };
    let waits = 0;
    const h = harness(t, { session, waitForRetry: async () => { waits++; }, steps: [
        step(call(TOOL_NAMES.WRITE, { filePath: 'local/once.txt', content: 'once' })), refuse, refuse, exhaust ? refuse : done,
    ] });
    if (exhaust) await assert.rejects(h.start(), error => error === refusal);
    else await h.start();
    assert.equal(waits, 2);
    assert.equal(h.requests.length, 4);
    assert.equal(h.dispatched.length, 1);
    assert.equal(h.state.currentRound, 2);
    assert.deepEqual(h.requests[2].messages, h.requests[3].messages, 'No hidden continuation prompt or failed prose is appended');
    assert.equal(h.requests[3].toolResponses, undefined);
    assert.equal(h.requests[3].finalAnswerReminderText, undefined);
    assert.equal(h.requests[3].messages.filter(message => message.role === 'tool').length, 1);
    assert.equal(h.state.messages.filter(message => message.role === 'user').length, 1);
    assert.deepEqual(h.state.messages.filter(message => message.role === 'assistant' && !message.toolCalls?.length).map(message => message.content), exhaust ? [] : [done.text]);
    assert.equal(h.state.messages.some(message => message.streaming), false);
});

test('delegate refusals use the same two-retry policy without repeating its committed tools', async t => {
    const refusal = Object.assign(new Error('fixture refused'), { code: 'AGENT_RESPONSE_REFUSED' });
    const h = harness(t, { session: true, archivedSkillIds: ['builtin-planning'],
        steps: [step(call(TOOL_NAMES.DELEGATE_RUN, { task: 'Read the fixture' })), done],
        delegates: [[step(call(TOOL_NAMES.READ, { filePath: 'local/once.txt' })), refusal, refusal, done]],
    });
    await h.start();
    const requests = h.requests.filter(request => request.role === 'delegate-0');
    assert.equal(requests.length, 4);
    assert.deepEqual(requests[2].messages, requests[3].messages);
    assert.equal(h.dispatched.filter(item => item.name === TOOL_NAMES.READ).length, 1);
    assert.equal(h.requests.filter(request => request.role === 'main').length, 2);
});

test('ordinary model prose resembling a refusal error is still a single successful reply', async t => {
    const reply = { text: 'Model response was refused.', toolCalls: [] };
    const h = harness(t, { steps: [reply] });
    await h.start();
    assert.equal(h.requests.length, 1);
    assert.equal(h.state.messages.at(-1).content, reply.text);
});
for (const session of [false, true]) test(`model retries preserve committed tools and discard only failed drafts (session=${session})`, async t => {
    const transient = Object.assign(new Error('fixture transient'), { status: 500 });
    let oldStream, waits = 0;
    const h = harness(t, { session, waitForRetry: async () => {
        waits++;
        assert.equal(h.state.messages.some(message => message.content === 'discarded' || message.content === 'late'), false);
    }, steps: [step(call(TOOL_NAMES.WRITE, { filePath: 'local/once.txt', content: 'once' })), task => {
        oldStream = task.onStreamProgress;
        oldStream({ text: 'discarded', thoughts: [{ label: 'fixture', text: 'discarded thought' }],
            toolCalls: [call(TOOL_NAMES.WRITE, { filePath: 'local/phantom.txt', content: 'never' })], toolCallDraft: true });
        throw transient;
    }, () => { oldStream({ text: 'late' }); throw transient; },
    step(call(TOOL_NAMES.READ, { filePath: 'local/once.txt' })), transient, done] });
    await h.start();
    assert.deepEqual(h.dispatched.map(item => item.name), [TOOL_NAMES.WRITE, TOOL_NAMES.READ]);
    assert.equal(h.requests.length, 6);
    assert.equal(waits, 3);
    assert.equal(h.state.currentRound, 3);
    for (const index of [2, 3, 5]) {
        const request = h.requests[index];
        assert.equal(request.toolResponses, undefined);
        assert.equal(request.messages.filter(message => message.role === 'tool').length, index === 5 ? 2 : 1);
        assert.equal(request.messages.some(message => ['discarded', 'late'].includes(message.content)), false);
    }
    assert.equal(h.state.messages.filter(message => message.role === 'user').length, 1);
    assert.deepEqual(h.state.messages.filter(message => message.role === 'assistant' && !message.toolCalls?.length).map(message => message.content), [done.text]);
    assert.equal(h.state.messages.some(message => message.streaming), false);
});

test('image policy is re-evaluated during retry without replenishing the three-retry allowance', async t => {
    t.mock.method(console, 'error', () => {});
    const transient = Object.assign(new Error('fixture transient'), { status: 500 });
    const imageInput = { main: true, delegate: true };
    let waits = 0;
    const h = harness(t, { imageInput, steps: [transient, transient, transient, transient],
        waitForRetry: async () => { waits++; imageInput.main = false; } });
    const image = uploadedImage('retry.png');
    h.state.messages[0].attachments = [image];
    await assert.rejects(h.start(), error => error === transient);
    assert.equal(h.requests.length, 4);
    assert.equal(waits, 3);
    assert.equal(h.state.currentRound, 1);
    assert.equal(requestImages(h.requests[0]).length, 1);
    assert.ok(h.requests.slice(1).every(request => requestImages(request).length === 0 && !names(request).has(TOOL_NAMES.READ_IMAGE)));
    assert.deepEqual(h.state.messages[0].attachments, [image]);
});

test('main session retry retains the final-answer reminder without repeating tools', async t => {
    const h = harness(t, { session: true, steps: [step(call(TOOL_NAMES.READ, { filePath: 'local/once.txt' })),
        { text: '', toolCalls: [] }, Object.assign(new Error('fixture transient'), { status: 500 }), done] });
    await h.start();
    const reminder = h.requests[2].finalAnswerReminderText;
    assert.ok(reminder);
    assert.equal(h.requests[3].finalAnswerReminderText, undefined);
    assert.equal(h.requests[3].toolResponses, undefined);
    assert.equal(h.requests[3].messages.filter(message => message.content === reminder).length, 1);
    assert.equal(h.dispatched.length, 1);
    assert.equal(h.state.currentRound, 3);
});

test('stopping during model backoff preserves committed tools and sends no further request', async t => {
    t.mock.method(console, 'error', () => {});
    const h = harness(t, { steps: [step(call(TOOL_NAMES.WRITE, { filePath: 'local/once.txt', content: 'once' })),
        Object.assign(new Error('fixture transient'), { status: 500 })], waitForRetry: async () => h.run.controller.abort() });
    await assert.rejects(h.start(), { name: 'AbortError' });
    assert.equal(h.requests.length, 2);
    assert.equal(h.dispatched.length, 1);
    assert.equal(h.state.messages.filter(message => message.role === 'tool').length, 1);
});
