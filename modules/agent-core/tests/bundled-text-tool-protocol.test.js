import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { boundaryCases, invalidBoundaryCases } from './fixtures/text-tool-boundaries.js';

// Acceptance contract: shipped browser and backend adapters match the source boundary
// contract, with one request and no example execution (cost: unintended writes / paid retries).
const require = createRequire(import.meta.url);
const task = {
    messages: [{ role: 'user', content: 'Offline boundary sample.' }],
    tools: ['Read', 'Write', 'Delete'].map(name => ({ type: 'function', function: { name, parameters: { type: 'object' } } })),
    captureRawAssistantMessage: true,
};

for (const target of ['browser', 'backend']) {
    test(`${target} bundle preserves text-tool boundaries and request count`, async () => {
        const manifest = JSON.parse(await readFile(new URL('../../../dist/manifest.json', import.meta.url), 'utf8'));
        const entry = new URL(`../../../dist/${manifest.entries['runtime/agent-core'].file}`, import.meta.url);
        // eslint-disable-next-line no-unsanitized/method -- Entry comes only from this repository's generated build manifest.
        const bundle = target === 'browser' ? await import(entry.href)
            : require('../../../server-plugin/littlewhitebox-server/draw-runs/vendor/agent-core-node.cjs');
        let content;
        let streaming;
        let requests = 0;
        const adapter = bundle.createAgentAdapter({ provider: 'openai-compatible', apiKey: 'unused',
            baseUrl: 'https://example.invalid/v1', model: 'compat-test', toolMode: 'tagged-json' });
        adapter.client.chat.completions.create = async () => {
            requests += 1;
            if (!streaming) return { choices: [{ message: { role: 'assistant', content }, finish_reason: 'stop' }] };
            return { async *[Symbol.asyncIterator]() {
                for (const char of content) yield { choices: [{ delta: { content: char } }] };
            } };
        };
        for (streaming of [false, true]) {
            const progress = [];
            const request = { ...task, ...(streaming ? { onStreamProgress: value => progress.push(value) } : {}) };
            for (const sample of boundaryCases) {
                content = sample.content;
                progress.length = 0;
                const before = requests;
                const result = await adapter.chat(request);
                assert.equal(requests, before + 1);
                assert.equal(result.text, sample.text, sample.label);
                assert.deepEqual(result.thoughts.map(thought => thought.text), sample.thoughts, sample.label);
                assert.deepEqual(result.toolCalls.map(call => ({ name: call.name, arguments: JSON.parse(call.arguments) })), sample.calls, sample.label);
                assert.ok(progress.every(snapshot => (snapshot.toolCalls || []).every(call => call.name !== 'Delete')), sample.label);
            }
            for (content of invalidBoundaryCases) {
                const before = requests;
                await assert.rejects(adapter.chat(request), error => {
                    assert.equal(error.code, 'TAGGED_TOOL_CALL_INVALID');
                    assert.equal(error.rawAssistantMessage.content, content);
                    return true;
                });
                assert.equal(requests, before + 1);
            }
        }
    });
}
