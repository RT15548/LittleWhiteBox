import test from 'node:test';
import assert from 'node:assert/strict';

import { createHostToolRequestController } from '../app-src/runtime/host-tool-requests.js';

test('callHostTool posts tool calls without iframe localSources snapshots', async () => {
    const posted = [];
    const pendingToolCalls = new Map();
    const state = {
        activeRun: null,
        localSources: [
            {
                sourceId: 'workspace-root',
                label: 'workspace',
                rootPath: 'local/',
                files: [
                    {
                        path: 'local/demo.txt',
                        relativePath: 'demo.txt',
                        name: 'demo.txt',
                        content: 'demo',
                        originalContent: 'demo',
                    },
                ],
            },
        ],
    };

    const controller = createHostToolRequestController({
        state,
        post: (type, payload) => {
            posted.push({ type, payload });
        },
        pendingToolCalls,
        createRequestId: () => 'tool-test',
        REQUEST_TIMEOUT_MS: 10_000,
        describeError: (error) => String(error?.message || error || 'tool_failed'),
    });

    const toolPromise = controller.callHostTool('apply_patch', {
        patchText: '*** Begin Patch\n*** End Patch',
    });

    assert.equal(posted.length, 1);
    assert.equal(posted[0].type, 'xb-assistant:tool-call');
    assert.equal(posted[0].payload.requestId, 'tool-test');
    assert.equal(posted[0].payload.name, 'apply_patch');
    assert.deepEqual(posted[0].payload.arguments, {
        patchText: '*** Begin Patch\n*** End Patch',
    });
    assert.equal(Object.prototype.hasOwnProperty.call(posted[0].payload, 'localSources'), false);

    const pending = pendingToolCalls.get('tool-test');
    assert(pending);
    pending.resolve({ ok: true });

    const result = await toolPromise;
    assert.deepEqual(result, { ok: true });
    assert.equal(pendingToolCalls.size, 0);
});

test('callHostTool waits for pending workspace flush before posting', async () => {
    const posted = [];
    const flushSteps = [];
    const pendingToolCalls = new Map();
    const state = {
        activeRun: null,
        localSources: [],
    };
    let releaseFlush = null;

    const controller = createHostToolRequestController({
        state,
        post: (type, payload) => {
            posted.push({ type, payload });
        },
        pendingToolCalls,
        createRequestId: () => 'tool-flush',
        REQUEST_TIMEOUT_MS: 10_000,
        describeError: (error) => String(error?.message || error || 'tool_failed'),
        flushBeforeToolCall: async () => {
            flushSteps.push('start');
            await new Promise((resolve) => {
                releaseFlush = resolve;
            });
            flushSteps.push('done');
        },
    });

    const toolPromise = controller.callHostTool('Read', {
        path: 'local/demo.txt',
    });

    await Promise.resolve();
    assert.deepEqual(flushSteps, ['start']);
    assert.equal(posted.length, 0);

    releaseFlush();
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.deepEqual(flushSteps, ['start', 'done']);
    assert.equal(posted.length, 1);
    assert.equal(posted[0].type, 'xb-assistant:tool-call');

    pendingToolCalls.get('tool-flush')?.resolve({ ok: true });
    const result = await toolPromise;
    assert.deepEqual(result, { ok: true });
});

test('postHostToolCallWithoutResponse reuses the normal tool-call envelope without pending state', () => {
    const posted = [];
    const pendingToolCalls = new Map();
    const state = {
        activeRun: null,
        runtime: {
            workspace: {
                version: 7,
            },
        },
    };

    const controller = createHostToolRequestController({
        state,
        post: (type, payload) => {
            posted.push({ type, payload });
        },
        pendingToolCalls,
        createRequestId: () => 'tool-fire-and-forget',
        REQUEST_TIMEOUT_MS: 10_000,
        describeError: (error) => String(error?.message || error || 'tool_failed'),
    });

    const requestId = controller.postHostToolCallWithoutResponse('BatchWriteFiles', {
        files: [{ path: 'local/demo.txt', content: 'demo\n' }],
    }, {
        workspaceMeta: {
            source: 'editor',
            path: 'local/demo.txt',
        },
    });

    assert.equal(requestId, 'tool-fire-and-forget');
    assert.equal(posted.length, 1);
    assert.equal(posted[0].type, 'xb-assistant:tool-call');
    assert.equal(posted[0].payload.requestId, 'tool-fire-and-forget');
    assert.equal(posted[0].payload.name, 'BatchWriteFiles');
    assert.deepEqual(posted[0].payload.arguments, {
        files: [{ path: 'local/demo.txt', content: 'demo\n' }],
    });
    assert.equal(posted[0].payload.workspaceMeta.source, 'editor');
    assert.equal(posted[0].payload.workspaceMeta.baseVersion, 7);
    assert.equal(pendingToolCalls.size, 0);
});
