import assert from 'node:assert/strict';
import test from 'node:test';
import { createAssistantRuntime } from '../app-src/runtime.js';
import { createAttachmentsManager } from '../app-src/attachments.js';
import { createRequestImageProjection, imageDataUrl } from '../app-src/runtime/request-images.js';
import { TOOL_NAMES, TOOL_DEFINITIONS, formatToolResultDisplay } from '../app-src/tooling.js';
import { SUMMARY_TOOLS } from '../app-src/runtime/summary-request.js';
import { summaryResult, summarySource } from './helpers/summary.js';

// Contract: a single user action writes once, compacts, then reads and answers in the same run.
// Breaking this loses the user's task or re-executes an already committed write.
for (const { sessions, skip, changeImageInput } of [{sessions: false}, {sessions: true}, {sessions: true, skip: true},
    { sessions: true, changeImageInput: true }, { sessions: true, skip: true, changeImageInput: true },
    { sessions: true, changeImageInput: 'cycle' }, { sessions: true, changeImageInput: 'retry-cycle' }]) test(
    'write → ' + (skip ? 'reject longer summary' : 'compact') + ' → read → answer, session transport: ' + sessions + ', toggle images: ' + (changeImageInput || false), async t => {
    t.mock.method(console, 'info', () => {});
    const run = { id: 'island', controller: new AbortController(), toolRequestIds: new Set(), workspaceBaseline: [] };
    run.imageProjection = createRequestImageProjection({ encode: async blob => {
        if (changeImageInput === 'retry-cycle') imageInput = false;
        return { url: await imageDataUrl(blob) };
    }, readBlob: async () => assert.fail('No workspace images in this fixture') });
    const user = '开始写我的卡';
    const state = { activeRun: run, messages: [{ role: 'user', content: user }], compactions: [] };
    const image = { kind: 'image', name: 'fixture.png', type: 'image/png', size: 7, dataUrl: 'data:image/png;base64,Zml4dHVyZQ==' };
    const attachments = createAttachmentsManager({ acceptedImageMimeTypes: ['image/png'] });
    const initiallyEnabled = !['cycle', 'retry-cycle'].includes(changeImageInput);
    let imageInput = initiallyEnabled;
    if (changeImageInput) state.messages[0].attachments = [image];
    const files = new Map([['runtime/api.ts', 'API fixture']]);
    const pendingToolCalls = new Map(), operations = [], main = [], stages = new Set();
    let nextId = 0, summaries = 0;
    const call = (name, args) => ({ text: '', toolCalls: [{ id: name, name, arguments: JSON.stringify(args) }] });
    const adapter = {
        supportsSessionToolLoop: sessions,
        async chat(request) {
            if (request.tools.some(tool => tool.function.name === SUMMARY_TOOLS.submit)) {
                assert.equal(state.compactionPending, true);
                summaries++;
                assert.equal(JSON.stringify(request).includes(image.dataUrl), false, 'Summaries use attachment names, not image bytes');
                if (changeImageInput && skip) imageInput = false;
                if (['cycle', 'retry-cycle'].includes(changeImageInput)) imageInput = true;
                return summaryResult(skip && summarySource(request).includes('END-OF-WRITE') ? 'm'.repeat(changeImageInput ? 36000 : 28000) : 'The island definition has been written.');
            }
            main.push(request);
            if (main.length === 1) return call('Write', { filePath: 'local/island.json', content: 'x'.repeat(24000) + 'END-OF-WRITE' });
            if (main.length === 2) return call('Read', { filePath: 'runtime/api.ts' });
            assert.equal(main.length, 3);
            request.onStreamProgress({ text: '岛屿卡完成。' });
            return { text: '岛屿卡完成。' };
        },
    };
    const runtime = createAssistantRuntime({
        state, TOOL_NAMES, TOOL_DEFINITIONS, pendingToolCalls, pendingApprovals: new Map(),
        render() { if (state.compactionPending) stages.add('pending'); },
        persistSession() { if (changeImageInput && changeImageInput !== 'retry-cycle' && !skip && state.compactions.length) imageInput = false; }, showToast() {},
        post(type, payload) {
            if (type !== 'xb-assistant:tool-call') return;
            operations.push(payload.name);
            if (payload.name === 'Write') files.set(payload.arguments.filePath, payload.arguments.content);
            const result = { ok: true, content: payload.name === 'Read' ? files.get(payload.arguments.filePath) : 'saved' };
            queueMicrotask(() => pendingToolCalls.get(payload.requestId).resolve(result));
        },
        createRequestId: () => 'island-' + ++nextId, safeJsonParse: JSON.parse, describeError: error => error.message,
        formatToolResultDisplay, buildTextWithAttachmentSummary: attachments.buildTextWithAttachmentSummary,
        buildUserContentParts: changeImageInput ? attachments.buildUserContentParts : m => m.content,
        normalizeAttachments: attachments.normalizeAttachments, normalizeThoughtBlocks: () => [], normalizeSlashSkillTrigger: () => '',
        isImageInputEnabled: () => imageInput,
        getActiveProviderConfig: () => ({ provider: 'openai-compatible', maxTokens: 1000 }),
        getToolDefinitions: () => TOOL_DEFINITIONS.filter(tool => ['Write', 'Read', ...(changeImageInput && imageInput ? ['ReadImage'] : [])].includes(tool.function.name)),
        SYSTEM_PROMPT: 'Fixture', HISTORY_SUMMARY_PREFIX: 'Memory',
        MAX_CONTEXT_TOKENS: 15000, SUMMARY_TRIGGER_TOKENS: 5000, REQUEST_TIMEOUT_MS: 1200,
        isAbortError: error => error.name === 'AbortError', createAdapter: () => adapter,
    });
    await runtime.runAssistantLoop(run);
    assert.deepEqual(operations, ['Write', 'Read']);
    assert.ok(files.get('local/island.json').endsWith('END-OF-WRITE'));
    assert.ok(summaries > 0 && stages.has('pending'));
    assert.equal(state.compactions.length, 1);
    if (skip) {
        assert.equal(state.compactions[0].skipped, true);
        assert.ok(main[1].messages.some(m => m.tool_calls?.some(c => c.function.arguments.includes('END-OF-WRITE'))));
        assert.ok(main[2].toolResponses, 'incremental requests resume on the rebuilt main session');
    } else {
        assert.ok(main[1].messages.some(m => typeof m.content === 'string' && m.content.includes(state.compactions[0].summary)));
        if (!changeImageInput) assert.equal(main[1].messages.at(-1).content, user);
    }
    assert.equal(main[1].toolResponses, undefined, 'Do not continue the stale provider session');
    assert.deepEqual(state.messages.filter(m => m.role === 'user').map(m => m.content), [user]);
    assert.equal(state.messages.at(-1).content, '岛屿卡完成。');
    if (changeImageInput) {
        assert.equal(imageInput, false);
        assert.equal(JSON.stringify(main[0]).includes(image.dataUrl), initiallyEnabled, 'Initial request follows its own image setting');
        for (const request of main.slice(1)) {
            assert.equal(JSON.stringify(request).includes(image.dataUrl), false, 'Rebuilt requests cannot leak the old image projection');
            assert.equal(request.tools.some(tool => tool.function.name === 'ReadImage'), false);
        }
        const projectedUser = main[1].messages.find(message => message.role === 'user');
        assert.ok(projectedUser.content.some(part => part.text?.includes(image.name)));
        assert.deepEqual(state.messages.find(message => message.role === 'user').attachments, [image]);
    }
    assert.equal(state.messages.at(-1).compactionEpoch, 1);
});
