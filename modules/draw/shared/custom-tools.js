// 请求结构里消息块的“附带工具”：纯函数契约（不执行任何代码）。
// 工具代码（block.tool.code）沿用 Reborn 的写法：`return { name, description, parameters, action: async (args) => ..., stealth };`
// 代码只在浏览器的沙盒 iframe 里执行（custom-tool-sandbox.js），本模块只负责校验沙盒回传的定义、
// 把它变成 Agent 的工具说明，以及把工具返回值整理成给模型的文本。
import { SUBMIT_SCENE_PLAN_TOOL_NAME, ScenePlannerError } from './scene-plan-contract.js';
import { MAX_TOOLS, MAX_TOOL_CODE_CHARS, hasTool, assertToolCodeLength } from './scene-planner-layout.js';

export { MAX_TOOLS, MAX_TOOL_CODE_CHARS };
// 一次规划里，模型最多能调用自定义工具的总次数（含被判定为同批未执行的）。
export const MAX_CUSTOM_TOOL_CALLS = 5;
export const TOOL_ACTION_TIMEOUT_MS = 10000;
export const TOOL_DEFINE_TIMEOUT_MS = 3000;
// 回给模型的工具结果、记录里保留的结果各自的字数上限。
export const TOOL_RESULT_MAX_CHARS = 20000;
export const TOOL_RECORD_MAX_CHARS = 4000;

const TOOL_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
const DESCRIPTION_MAX_CHARS = 2000;

/** 勾选“附带工具”时的代码模板：与 Reborn 的 game_content 同款（把整段输出放进 content 参数）。 */
export const DEFAULT_TOOL_CODE = `return {
    name: "note",
    description: "记下一段分析，之后再调用 submit_scene_plan 提交结果。",
    parameters: {
        type: "object",
        properties: {
            content: { type: "string" },
        },
        required: ["content"],
    },
    action: async (args) => {
        return JSON.stringify({ ok: true });
    },
    stealth: false,
};`;

/** 编辑器里的“从代码读取工具名”：只做文本匹配，绝不执行代码；真正的定义以沙盒运行结果为准。 */
export function extractToolName(code) {
    const match = /\bname\s*:\s*(["'`])([^"'`\r\n]{1,80})\1/.exec(String(code ?? ''));
    return match ? match[2].trim() : '';
}

/** 启用、且附带了代码的消息块（按布局顺序）。工具跟着消息：消息关掉，工具就不注册。 */
export function collectToolBlocks(layout) {
    const blocks = Array.isArray(layout?.blocks) ? layout.blocks : [];
    return blocks.filter(block => hasTool(block) && block.enabled !== false && String(block.tool.code).trim());
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 校验沙盒返回的工具定义。通过时返回规范化后的 { name, description, parameters, stealth }，否则抛 Error（消息给用户看）。
 * @param {unknown} raw
 * @param {{ usedNames?: string[] }} [options]
 */
export function normalizeToolDefinition(raw, { usedNames = [] } = {}) {
    if (!isPlainObject(raw)) throw new Error('代码必须 return 一个对象：{ name, description, parameters, action }');
    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    if (!TOOL_NAME_PATTERN.test(name)) {
        throw new Error(`工具名无效：“${name}”。只能用字母、数字、下划线，不能以数字开头，最长 64 字符`);
    }
    if (name === SUBMIT_SCENE_PLAN_TOOL_NAME) throw new Error(`工具名不能叫 ${SUBMIT_SCENE_PLAN_TOOL_NAME}（它是场景规划的提交工具）`);
    if (new Set(usedNames).has(name)) throw new Error(`工具名重复：${name}`);
    if (raw.description !== undefined && typeof raw.description !== 'string') throw new Error('description 必须是字符串');
    const parameters = raw.parameters === undefined ? { type: 'object', properties: {} } : raw.parameters;
    if (!isPlainObject(parameters) || parameters.type !== 'object') {
        throw new Error('parameters 必须是 JSON Schema 对象，且 type 为 "object"');
    }
    if (parameters.properties !== undefined && !isPlainObject(parameters.properties)) throw new Error('parameters.properties 必须是对象');
    if (parameters.required !== undefined && !Array.isArray(parameters.required)) throw new Error('parameters.required 必须是数组');
    let cloned;
    try {
        cloned = JSON.parse(JSON.stringify(parameters));
    } catch {
        throw new Error('parameters 必须能序列化成 JSON');
    }
    return {
        name,
        description: String(raw.description ?? '').slice(0, DESCRIPTION_MAX_CHARS),
        parameters: cloned,
        stealth: raw.stealth === true,
    };
}

/** 快照里的定义（已规范化）→ Agent 的工具说明。 */
export function toFunctionTool(definition) {
    return {
        type: 'function',
        function: {
            name: definition.name,
            description: definition.description,
            parameters: definition.parameters,
        },
    };
}

/** 校验一组定义（来自快照或沙盒）：名字互不相同、不占用 submit_scene_plan。 */
export function normalizeToolDefinitions(rawList) {
    const list = Array.isArray(rawList) ? rawList : [];
    const used = [];
    return list.map((raw) => {
        const definition = normalizeToolDefinition(raw, { usedNames: used });
        used.push(definition.name);
        return definition;
    });
}

export function clipText(text, limit) {
    const value = String(text ?? '');
    return value.length > limit ? `${value.slice(0, limit)}…（已截断，共 ${value.length} 字）` : value;
}

/** 工具返回值 → 给模型的文本：字符串原样，其余 JSON 化；undefined 视作空对象。 */
export function formatToolResult(value) {
    let text;
    if (typeof value === 'string') text = value;
    else if (value === undefined) text = '{}';
    else {
        try {
            text = JSON.stringify(value) ?? String(value);
        } catch {
            text = String(value);
        }
    }
    return clipText(text, TOOL_RESULT_MAX_CHARS);
}

/** Google 之类要求 functionResponse 是对象：能解析成对象就用它，否则包一层 { result }。 */
export function toToolResponseObject(text) {
    try {
        const parsed = JSON.parse(text);
        if (isPlainObject(parsed)) return parsed;
    } catch {
        return { result: text };
    }
    return { result: text };
}

/**
 * 请求组装时：让宿主（浏览器沙盒）读出每个启用且附带工具的消息块的定义，并校验。
 * 没有宿主（后台任务、Node）却启用了带工具的消息时直接拒绝，绝不在没有沙盒的环境里运行用户代码。
 * @returns {Promise<Array<{name: string, description: string, parameters: object, stealth: boolean}>>}
 */
export async function resolveCustomToolDefinitions(layout, host, { signal } = {}) {
    const blocks = collectToolBlocks(layout);
    if (!blocks.length) return [];
    if (!host || typeof host.define !== 'function') {
        throw new ScenePlannerError(
            '请求结构里有启用的“附带工具”，需要在浏览器里运行；后台任务不会执行自定义代码。',
            'CUSTOM_TOOL_HOST_MISSING',
        );
    }
    const definitions = [];
    for (const block of blocks) {
        const label = String(block.name || '').trim() || '附带工具';
        try {
            assertToolCodeLength(block.tool.code);
            const raw = await host.define(block.id, block.tool.code, { signal });
            definitions.push(normalizeToolDefinition(raw, { usedNames: definitions.map(item => item.name) }));
        } catch (error) {
            if (error?.name === 'AbortError') throw error;
            throw new ScenePlannerError(
                `消息“${label}”的附带工具无法使用：${error?.message || '未知错误'}`,
                'CUSTOM_TOOL_INVALID',
                { blockId: block.id },
                { cause: error },
            );
        }
    }
    return definitions;
}
