// 浏览器 dist 和后台 vendored 包是源码的打包产物：只测源码会漏掉“忘了重打包”。
// 这里直接用两个产物的适配器构造请求，确认工具说明占位标记在 tagged 模式被替换、在原生模式被去掉。
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';

import { TOOL_PROTOCOL_MARKER } from '../adapters/tool-protocol-marker.js';

const require = createRequire(import.meta.url);

const TOOL = {
    type: 'function',
    function: {
        name: 'submit_scene_plan',
        description: 'submit',
        parameters: { type: 'object', properties: { images: { type: 'array' } } },
    },
};

function buildTask() {
    return {
        systemPrompt: '',
        messages: [
            { role: 'system', toolProtocolMarker: true, content: `HEAD\n\n${TOOL_PROTOCOL_MARKER}` },
            { role: 'user', content: 'U' },
        ],
        tools: [TOOL],
        toolChoice: 'required',
    };
}

function buildBody(createAgentAdapter, toolMode) {
    const adapter = createAgentAdapter({
        provider: 'openai-compatible',
        baseUrl: 'https://example.invalid/v1',
        apiKey: 'k',
        model: 'gpt-4o',
        toolMode,
    });
    return adapter.buildRequestBody(buildTask());
}

function assertMarkerBehaviour(createAgentAdapter, label) {
    const tagged = buildBody(createAgentAdapter, 'tagged-json');
    assert.equal(tagged.messages[0].role, 'system', `${label}: tagged 的第一条仍是 system`);
    assert.ok(tagged.messages[0].content.startsWith('HEAD\n\n'), `${label}: 标记之前的文本保持在前`);
    assert.match(tagged.messages[0].content, /submit_scene_plan/, `${label}: 标记被替换成了工具说明`);
    assert.ok(!JSON.stringify(tagged).includes(TOOL_PROTOCOL_MARKER), `${label}: tagged 请求里不能残留标记`);

    const native = buildBody(createAgentAdapter, 'native');
    assert.ok(!JSON.stringify(native).includes(TOOL_PROTOCOL_MARKER), `${label}: 原生请求里不能残留标记`);
    assert.equal(native.messages[0].content, 'HEAD', `${label}: 原生模式只剩标记前的文本`);
    assert.ok(Array.isArray(native.tools) && native.tools.length === 1, `${label}: 原生模式仍走 tools 字段`);
}

test('the browser dist adapter resolves the tool protocol marker', async () => {
    const manifest = JSON.parse(await readFile(new URL('../../../dist/manifest.json', import.meta.url), 'utf8'));
    const entry = new URL(`../../../dist/${manifest.entries['runtime/agent-core'].file}`, import.meta.url);
    // eslint-disable-next-line no-unsanitized/method -- Entry comes only from this repository's generated build manifest.
    const { createAgentAdapter } = await import(entry.href);
    assertMarkerBehaviour(createAgentAdapter, 'browser dist');
});

test('the vendored node bundle adapter resolves the tool protocol marker', () => {
    const bundle = require('../../../server-plugin/littlewhitebox-server/draw-runs/vendor/agent-core-node.cjs');
    assertMarkerBehaviour(bundle.createAgentAdapter, 'node bundle');
});
