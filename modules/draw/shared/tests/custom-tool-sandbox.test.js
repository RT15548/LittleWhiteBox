import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { createIframeSandboxFactory, createSandboxToolHost } from '../custom-tool-sandbox.js';
import { MAX_TOOL_CODE_CHARS } from '../scene-planner-layout.js';

// Trial execution rejects oversize code before creating an executable frame (unintended code execution).
test('oversize code is rejected before opening a sandbox', async () => {
    const frames = [];
    const host = createSandboxToolHost({ createFrame: createVmFrameFactory(frames) });
    await assert.rejects(host.define('long', 'x'.repeat(MAX_TOOL_CODE_CHARS + 1)), { code: 'CUSTOM_TOOL_CODE_TOO_LONG' });
    assert.equal(frames.length, 0);
    host.dispose();
});

const GAME_CONTENT_CODE = `return {
    name: "game_content",
    description: "# 你的全部输出应当在此工具内。",
    parameters: { type: "object", properties: { content: { type: "string" } }, required: ["content"] },
    action: async (args) => JSON.stringify({ ok: true, echoed: args.content }),
    stealth: false,
};`;

// 不起浏览器：把 iframe 里的脚本放进独立的 vm 上下文，用同步队列模拟 postMessage。
function createVmFrameFactory(created = []) {
    return function createFrame(srcdoc) {
        const script = /<script>([\s\S]*)<\/script>/.exec(srcdoc)[1];
        let handler = null;
        let disposed = false;
        const listeners = [];
        const deliver = (data) => queueMicrotask(() => { if (!disposed) handler?.(JSON.parse(JSON.stringify(data))); });
        const context = vm.createContext({
            parent: { postMessage: deliver },
            addEventListener: (type, listener) => { if (type === 'message') listeners.push(listener); },
            setTimeout,
        });
        vm.runInContext(script, context);
        const frame = {
            srcdoc,
            post(message) {
                queueMicrotask(() => { for (const listener of listeners) listener({ data: JSON.parse(JSON.stringify(message)) }); });
            },
            onMessage(next) { handler = next; },
            dispose() { disposed = true; frame.disposed = true; },
            disposed: false,
        };
        created.push(frame);
        return frame;
    };
}

test('the sandbox host reads a Reborn style definition and runs the action', async () => {
    const host = createSandboxToolHost({ createFrame: createVmFrameFactory() });
    const definition = await host.define('b1', GAME_CONTENT_CODE);
    assert.equal(definition.name, 'game_content');
    assert.deepEqual(definition.parameters.required, ['content']);
    assert.equal(definition.stealth, false);
    assert.equal(await host.invoke('game_content', { content: '你好' }), '{"ok":true,"echoed":"你好"}');
    host.dispose();
});

test('object and undefined results are turned into text on the way out', async () => {
    const host = createSandboxToolHost({ createFrame: createVmFrameFactory() });
    await host.define('b1', 'return { name: "obj", action: async () => ({ a: 1 }) };');
    await host.define('b2', 'return { name: "none", action: async () => {} };');
    assert.equal(await host.invoke('obj', {}), '{"a":1}');
    assert.equal(await host.invoke('none', {}), '{}');
});

test('errors from the code come back as readable messages', async () => {
    const host = createSandboxToolHost({ createFrame: createVmFrameFactory() });
    await assert.rejects(host.define('b1', 'throw new Error("语法之外的错")'), /语法之外的错/);
    await assert.rejects(host.define('b2', 'return 42;'), /return 一个对象/);
    await assert.rejects(host.define('b3', 'return { name: "x" };'), /缺少 action/);
    await assert.rejects(host.define('b4', 'return {'), /./);
    await host.define('b5', 'return { name: "boom", action: async () => { throw new Error("工具炸了"); } };');
    await assert.rejects(host.invoke('boom', {}), /工具炸了/);
    await assert.rejects(host.invoke('missing', {}), /没有名为 missing/);
});

test('a hanging action times out, its sandbox is closed, and the other tools keep working', async () => {
    const frames = [];
    const host = createSandboxToolHost({ createFrame: createVmFrameFactory(frames), timeoutMs: 40 });
    await host.define('slow', 'return { name: "slow", action: () => new Promise(() => {}) };');
    await host.define('fast', 'return { name: "fast", action: async () => "ok" };');
    await assert.rejects(host.invoke('slow', {}), /工具 slow 执行超时/);
    assert.equal(frames[0].disposed, true);
    assert.equal(frames[1].disposed, false);
    await assert.rejects(host.invoke('slow', {}), /没有名为 slow/);
    assert.equal(await host.invoke('fast', {}), 'ok');
});

test('aborting stops a running call and closes the sandbox', async () => {
    const frames = [];
    const host = createSandboxToolHost({ createFrame: createVmFrameFactory(frames), timeoutMs: 5000 });
    await host.define('slow', 'return { name: "slow", action: () => new Promise(() => {}) };');
    const controller = new AbortController();
    const running = host.invoke('slow', {}, { signal: controller.signal });
    setTimeout(() => controller.abort(), 10);
    await assert.rejects(running, error => error.name === 'AbortError');
    assert.equal(frames[0].disposed, true);
    controller.abort();
    await assert.rejects(host.define('again', 'return { name: "a", action() {} };', { signal: controller.signal }), error => error.name === 'AbortError');
});

test('defining the same block again replaces its sandbox, dispose closes everything', async () => {
    const frames = [];
    const host = createSandboxToolHost({ createFrame: createVmFrameFactory(frames) });
    await host.define('b1', 'return { name: "one", action: async () => "1" };');
    await host.define('b1', 'return { name: "two", action: async () => "2" };');
    assert.equal(frames[0].disposed, true);
    await assert.rejects(host.invoke('one', {}), /没有名为 one/);
    assert.equal(await host.invoke('two', {}), '2');
    host.dispose();
    assert.ok(frames.every(frame => frame.disposed));
});

test('the real iframe factory sandboxes without same-origin and filters messages by window', () => {
    const attributes = {};
    const listeners = [];
    const appended = [];
    const win = { id: 'frame-window' };
    const iframe = {
        setAttribute: (key, value) => { attributes[key] = value; },
        style: {},
        contentWindow: win,
        remove: () => { iframe.removed = true; },
    };
    const view = {
        addEventListener: (type, listener) => listeners.push([type, listener]),
        removeEventListener: (type, listener) => { listeners.splice(listeners.findIndex(item => item[1] === listener), 1); },
    };
    const document = { defaultView: view, createElement: () => iframe, body: { appendChild: node => appended.push(node) } };
    const frame = createIframeSandboxFactory(document)('<script>1</script>');
    assert.equal(attributes.sandbox, 'allow-scripts');
    assert.ok(!/allow-same-origin/.test(attributes.sandbox));
    assert.equal(iframe.srcdoc, '<script>1</script>');
    assert.equal(appended[0], iframe);
    const received = [];
    frame.onMessage(data => received.push(data));
    const [, listener] = listeners[0];
    listener({ source: { id: 'other-window' }, data: { x: 1 } });
    listener({ source: win, data: { x: 2 } });
    assert.deepEqual(received, [{ x: 2 }]);
    frame.dispose();
    assert.equal(iframe.removed, true);
    assert.equal(listeners.length, 0);
});
