'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { bundle } = require('./runtime-fixture.js');

// Contract: switching delivery to the backend must preserve the actual model
// request and tool continuation, without running initialization twice (wrong
// generations, extra requests or tool side effects).
test('browser source and signed package send identical sampling and tool-history requests', async t => {
    const http = require('node:http');
    const { prepareScenePlannerInput } = await import('../../../modules/draw/shared/scene-planner.js');
    const { executePreparedScenePlanner } = await import('../../../modules/draw/shared/scene-planner-executor.js');
    const sourceAgent = await import('../../../modules/agent-core/node-entry.js');
    const { addBlock, createCustomBlock, createDefaultLayout } = await import('../../../modules/draw/shared/scene-planner-layout.js');
    const requests = [];
    const server = http.createServer((request, response) => {
        const receive = async () => {
            const chunks = [];
            for await (const chunk of request) chunks.push(chunk);
            const body = JSON.parse(Buffer.concat(chunks));
            requests.push(body);
            const continued = body.messages.some(message => message.tool_call_id === 'live-counter');
            const call = continued
                ? { id: 'live-plan', type: 'function', function: { name: 'submit_scene_plan', arguments: JSON.stringify({ images: [{ insert_after: 1, scene: 'rain', characters: [] }] }) } }
                : { id: 'live-counter', type: 'function', function: { name: 'counter', arguments: '{}' } };
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ choices: [{ finish_reason: 'tool_calls', message: { role: 'assistant', content: null, tool_calls: [call] } }] }));
        };
        receive().catch(error => response.destroy(error));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); });
    const block = createCustomBlock();
    block.tool = { enabled: true, code: "let calls=0; return {name:'counter',action:()=>({calls:++calls})};" };
    const config = { provider: 'openai-compatible', model: 'offline-model', apiKey: 'isolated-test',
        baseUrl: `http://127.0.0.1:${server.address().port}`, maxTokens: 1000, timeoutMs: 5000,
        temperature: 0.37, sendTemperature: true, toolMode: 'native', reasoning: { mode: 'off', output: 'hide' },
        sampling: { topP: { enabled: true, value: 0.71 }, presencePenalty: { enabled: true, value: 0.23 } } };
    const prepared = await prepareScenePlannerInput({
        messageText: 'Rain falls.', maxImages: 1, executionTarget: 'server',
        customPrompts: { layout: addBlock(createDefaultLayout(), block) },
        customToolHost: { define() { throw new Error('Browser must not initialize a backend tool'); }, dispose() {} },
        agentOptions: { providerConfig: config }, expansionOptions: { runtime: { substituteParams: value => value } },
    });
    assert.equal(prepared.planner.customToolSources.length, 1);
    const host = bundle.createNodeToolHost();
    try {
        const customTools = [await host.define(block.id, block.tool.code)];
        const browser = { ...prepared, planner: { ...prepared.planner, customTools } };
        await executePreparedScenePlanner(browser, { agentCore: sourceAgent, customToolHost: host });
    } finally { host.dispose(); }
    const runtime = bundle.createRuntime();
    await runtime.runtime.executePreparedScenePlanner(prepared, { agentCore: runtime.agentCore });
    assert.equal(requests.length, 4);
    assert.deepEqual(requests.slice(0, 2), requests.slice(2));
    for (const request of requests) {
        assert.equal(request.temperature, 0.37);
        assert.equal(request.top_p, 0.71);
        assert.equal(request.presence_penalty, 0.23);
        assert.equal(Object.hasOwn(request, 'modelListAuth'), false);
        assert.ok(request.messages.some(message => message.role === 'tool'));
    }
    assert.deepEqual(JSON.parse(requests[3].messages.find(message => message.tool_call_id === 'live-counter').content), { calls: 1 });
});

test('built backend tools preserve async actions and state without Node privileges', async t => {
    const host = bundle.createNodeToolHost();
    t.after(() => host.dispose());
    const definition = await host.define('counter', `let count=0; return {name:'counter', action:async args=>({
        count:++count, value:args.value, node:typeof process, files:typeof require, dom:typeof document,
        escaped:typeof ({}).constructor.constructor('return globalThis')().process
    })};`);
    assert.equal(definition.name, 'counter');
    assert.deepEqual(JSON.parse(await host.invoke('counter', { value: 42 })), {
        count: 1, value: 42, node: 'undefined', files: 'undefined', dom: 'undefined', escaped: 'undefined',
    });
    assert.equal(JSON.parse(await host.invoke('counter', {})).count, 2);
});

test('tool cancellation terminates a synchronous infinite loop without blocking the server', async t => {
    const host = bundle.createNodeToolHost();
    t.after(() => host.dispose());
    await host.define('loop', "return {name:'loop',action:()=>{while(true){}}}");
    const controller = new AbortController();
    const pending = host.invoke('loop', {}, { signal: controller.signal });
    setTimeout(() => controller.abort(), 20);
    await assert.rejects(pending, { name: 'AbortError' });
});

test('tool public fetch rejects direct private addresses and private DNS answers', async t => {
    const { isPublicAddress, publicFetch } = await import('../../../modules/draw/server/tools/public-fetch.mjs');
    for (const address of ['127.0.0.1', '10.2.3.4', '169.254.169.254', '::1', '::ffff:127.0.0.1', 'fd00::1', '2002:7f00:1::']) {
        assert.equal(isPublicAddress(address), false, address);
    }
    assert.equal(isPublicAddress('8.8.8.8'), true);
    assert.equal(isPublicAddress('2606:4700:4700::1111'), true);
    await assert.rejects(publicFetch('https://public.example', {}, {
        resolve: async () => [{ address: '127.0.0.1', family: 4 }],
    }), /private/);
    const host = bundle.createNodeToolHost();
    t.after(() => host.dispose());
    await host.define('network', "return {name:'network',action:async()=>await fetch('http://127.0.0.1/')}");
    await assert.rejects(host.invoke('network', {}), /private/);
});
