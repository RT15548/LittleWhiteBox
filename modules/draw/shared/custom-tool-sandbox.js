// 自定义工具代码的执行环境：每个带工具的消息块一个沙盒 iframe（sandbox="allow-scripts"，没有 allow-same-origin）。
// 代码拿不到酒馆页面的 DOM、存储和 Cookie，也不在页面的 JS 环境里运行；只能经 postMessage 收发可序列化的数据。
// 注意沙盒挡不住联网：代码里的 fetch 仍然能发请求，所以只启用你信任的代码。
// 等待超时或取消时移除 iframe；仅运行可信代码，iframe 不保证隔离同步死循环。
//
// 宿主接口（规划流程只依赖这个接口，测试可以换成不起 iframe 的实现）：
//   define(blockId, code, { signal }) → Promise<{ name, description, parameters, stealth }>
//   invoke(name, args, { signal })    → Promise<string>   工具返回值（字符串原样，其余 JSON 化）
//   dispose()
import { TOOL_ACTION_TIMEOUT_MS, TOOL_DEFINE_TIMEOUT_MS, formatToolResult } from './custom-tools.js';
import { assertToolCodeLength } from './scene-planner-layout.js';

const MESSAGE_KEY = 'xbCustomTool';

/** 沙盒 iframe 里跑的脚本。token 只用来区分消息来源，不是安全边界（安全靠 sandbox 属性）。 */
export function buildSandboxBootstrap(token) {
    return `(() => {
    const KEY = ${JSON.stringify(MESSAGE_KEY)};
    const TOKEN = ${JSON.stringify(String(token))};
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    let definition = null;
    const reply = (payload) => parent.postMessage({ [KEY]: TOKEN, ...payload }, '*');
    addEventListener('message', async (event) => {
        const message = event.data;
        if (!message || message[KEY] !== TOKEN) return;
        try {
            if (message.type === 'define') {
                const produced = await new AsyncFunction(message.code)();
                if (!produced || typeof produced !== 'object') throw new Error('代码必须 return 一个对象：{ name, description, parameters, action }');
                if (typeof produced.action !== 'function') throw new Error('代码返回的对象里缺少 action 函数');
                definition = produced;
                reply({ id: message.id, ok: true, value: JSON.parse(JSON.stringify({
                    name: produced.name,
                    description: produced.description,
                    parameters: produced.parameters,
                    stealth: produced.stealth === true,
                })) });
            } else if (message.type === 'invoke') {
                if (!definition) throw new Error('工具尚未定义');
                const result = await definition.action(message.args);
                reply({ id: message.id, ok: true, value: typeof result === 'string' || result === undefined ? result : JSON.stringify(result) });
            }
        } catch (error) {
            reply({ id: message.id, ok: false, error: String((error && error.message) || error) });
        }
    });
    reply({ type: 'ready' });
})();`;
}

function randomToken(random = Math.random) {
    return Array.from({ length: 4 }, () => Math.floor(random() * 0xffffffff).toString(36)).join('');
}

function abortError() {
    const error = new Error('已取消');
    error.name = 'AbortError';
    return error;
}

/** 默认的 iframe 工厂：返回 { post(message), onMessage(handler), dispose() }。 */
export function createIframeSandboxFactory(document) {
    return function createFrame(srcdoc) {
        const view = document.defaultView;
        const frame = document.createElement('iframe');
        frame.setAttribute('sandbox', 'allow-scripts');
        frame.setAttribute('aria-hidden', 'true');
        frame.setAttribute('tabindex', '-1');
        frame.style.display = 'none';
        frame.srcdoc = srcdoc;
        let handler = null;
        const listener = (event) => {
            if (event.source === frame.contentWindow) handler?.(event.data);
        };
        // 沙盒 iframe 没有 allow-same-origin，origin 是 "null"，没法按 origin 校验；这里用 event.source 精确比对这一个 iframe 的窗口。
        // eslint-disable-next-line no-restricted-syntax -- Opaque-origin sandbox messages are authenticated by event.source above.
        view.addEventListener('message', listener);
        (document.body || document.documentElement).appendChild(frame);
        return {
            // 不透明 origin 的 iframe 只能用 '*' 作为目标；消息里只有工具参数，发给的就是我们自己刚建的那个 iframe。
            // eslint-disable-next-line no-restricted-syntax -- The sandbox has an opaque origin; target the owned iframe window directly.
            post: message => frame.contentWindow?.postMessage(message, '*'),
            onMessage(next) { handler = next; },
            dispose() {
                view.removeEventListener('message', listener);
                handler = null;
                frame.remove();
            },
        };
    };
}

/**
 * @param {object} options
 * @param {Document} [options.document] 用默认 iframe 工厂时需要
 * @param {function(string): object} [options.createFrame] 自定义工厂（测试用），默认按 document 建 iframe
 * @param {number} [options.timeoutMs] 单次工具调用的超时
 * @param {number} [options.defineTimeoutMs] 读取工具定义的超时
 * @param {function(): number} [options.random] 生成沙盒消息令牌用的随机源
 */
export function createSandboxToolHost({
    document,
    createFrame = document ? createIframeSandboxFactory(document) : null,
    timeoutMs = TOOL_ACTION_TIMEOUT_MS,
    defineTimeoutMs = TOOL_DEFINE_TIMEOUT_MS,
    random = Math.random,
} = {}) {
    if (typeof createFrame !== 'function') throw new TypeError('createSandboxToolHost 需要 document 或 createFrame');
    const sandboxes = new Map(); // blockId → { frame, pending, ready }
    const byName = new Map(); // 工具名 → blockId
    let sequence = 0;

    function drop(blockId) {
        const sandbox = sandboxes.get(blockId);
        if (!sandbox) return;
        sandboxes.delete(blockId);
        sandbox.frame.dispose();
        for (const entry of sandbox.pending.values()) entry.reject(entry.failure || new Error('沙盒已关闭'));
        sandbox.pending.clear();
        for (const [name, id] of Array.from(byName)) if (id === blockId) byName.delete(name);
    }

    function open(blockId) {
        drop(blockId);
        const token = randomToken(random);
        const pending = new Map();
        let markReady;
        const ready = new Promise((resolve) => { markReady = resolve; });
        const frame = createFrame(`<!doctype html><meta charset="utf-8"><script>${buildSandboxBootstrap(token)}</script>`);
        const sandbox = { frame, pending, ready, token };
        frame.onMessage((data) => {
            if (!data || data[MESSAGE_KEY] !== token) return;
            if (data.type === 'ready') {
                markReady();
                return;
            }
            const entry = pending.get(data.id);
            if (!entry) return;
            pending.delete(data.id);
            if (data.ok) entry.resolve(data.value);
            else entry.reject(new Error(String(data.error || '工具执行失败')));
        });
        sandboxes.set(blockId, sandbox);
        return sandbox;
    }

    // 向沙盒发一条请求并等回复；超时 / 取消时关掉整个沙盒。
    async function request(blockId, message, { limitMs, signal, label }) {
        const sandbox = sandboxes.get(blockId);
        if (!sandbox) throw new Error('沙盒不存在');
        if (signal?.aborted) {
            drop(blockId);
            throw abortError();
        }
        const id = ++sequence;
        let timer = null;
        let onAbort = null;
        try {
            return await new Promise((resolve, reject) => {
                const entry = { resolve, reject };
                sandbox.pending.set(id, entry);
                timer = setTimeout(() => {
                    entry.failure = new Error(`${label}超时（${Math.round(limitMs / 1000)} 秒），已终止这段代码`);
                    drop(blockId);
                }, limitMs);
                onAbort = () => {
                    entry.failure = abortError();
                    drop(blockId);
                };
                signal?.addEventListener?.('abort', onAbort, { once: true });
                sandbox.ready.then(() => {
                    if (sandbox.pending.has(id)) sandbox.frame.post({ [MESSAGE_KEY]: sandbox.token, id, ...message });
                });
            });
        } finally {
            clearTimeout(timer);
            signal?.removeEventListener?.('abort', onAbort);
            sandbox.pending.delete(id);
        }
    }

    return {
        async define(blockId, code, { signal } = {}) {
            assertToolCodeLength(code);
            const key = String(blockId);
            open(key);
            let raw;
            try {
                raw = await request(key, { type: 'define', code: String(code ?? '') }, { limitMs: defineTimeoutMs, signal, label: '读取工具定义' });
            } catch (error) {
                drop(key);
                throw error;
            }
            if (typeof raw?.name === 'string' && raw.name.trim()) byName.set(raw.name.trim(), key);
            return raw;
        },
        async invoke(name, args, { signal } = {}) {
            const blockId = byName.get(String(name));
            if (blockId === undefined) throw new Error(`没有名为 ${name} 的自定义工具`);
            const value = await request(blockId, { type: 'invoke', args }, { limitMs: timeoutMs, signal, label: `工具 ${name} 执行` });
            return formatToolResult(value);
        },
        dispose() {
            for (const blockId of Array.from(sandboxes.keys())) drop(blockId);
        },
    };
}
