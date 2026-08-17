import { ScenePlannerError } from './scene-plan-contract.js';

let promptRuntimeModulesPromise = null;
let slotSequence = 0;

function cloneJson(value) {
    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return value;
    }
}

function normalizeText(value) {
    return String(value ?? '').replace(/\r\n/g, '\n');
}

/**
 * Only module references are memoized. Every mutable host value (`chat`, `name1`, `name2`)
 * is read through a getter at expansion time so persona/character switches never serve a
 * stale snapshot.
 */
async function loadPromptRuntimeModules() {
    promptRuntimeModulesPromise ||= Promise.all([
        import('../../../../../../../script.js'),
        import('../../variables/var-commands.js'),
    ]).then(([hostModule, variableModule]) => ({ hostModule, variableModule }));
    return promptRuntimeModulesPromise;
}

export async function loadScenePromptRuntime() {
    const { hostModule, variableModule } = await loadPromptRuntimeModules();
    return {
        get chat() {
            return hostModule.chat;
        },
        get name1() {
            return hostModule.name1;
        },
        get name2() {
            return hostModule.name2;
        },
        substituteParams: hostModule.substituteParams,
        eventSource: hostModule.eventSource,
        promptReadyEvent: hostModule.event_types?.CHAT_COMPLETION_PROMPT_READY,
        replaceXbGetVarInString: variableModule.replaceXbGetVarInString,
        replaceXbGetVarYamlInString: variableModule.replaceXbGetVarYamlInString,
    };
}

function extractTextFromHistoryMessage(message) {
    if (typeof message?.mes === 'string') return normalizeText(message.mes);
    if (typeof message?.content === 'string') return normalizeText(message.content);
    if (Array.isArray(message?.content)) {
        return message.content
            .filter((part) => part && part.type === 'text' && typeof part.text === 'string')
            .map((part) => normalizeText(part.text))
            .join('\n');
    }
    return '';
}

function resolveHistoryPlaceholder(text, runtime) {
    if (typeof text !== 'string' || !text.includes('{$history')) return text;
    const chat = Array.isArray(runtime.chat) ? runtime.chat : [];
    if (!chat.length) return text;
    const name1 = runtime.name1;
    const name2 = runtime.name2;
    return text.replace(/\{\$history(\d{1,3})\}/gi, (_match, countText) => {
        const count = Math.max(1, Math.min(200, Number(countText) || 1));
        const lines = [];
        for (const message of chat.slice(Math.max(0, chat.length - count))) {
            const speaker = message?.is_user
                ? (String(message?.name || '').trim() || name1 || 'USER')
                : (String(message?.name || '').trim() || name2 || 'ASSISTANT');
            lines.push(`${speaker}：`);
            const content = extractTextFromHistoryMessage(message).trim();
            if (content) lines.push(content);
            lines.push('');
        }
        return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    });
}

/**
 * `{{getvar::}}` / `{{getglobalvar::}}` are official SillyTavern macros and are resolved by
 * `substituteParams`; Draw no longer reaches for an undeclared `window.STscript`.
 */
export async function expandScenePromptText(text, runtime) {
    let output = normalizeText(text);
    if (typeof runtime.replaceXbGetVarInString === 'function') {
        output = runtime.replaceXbGetVarInString(output);
    }
    if (typeof runtime.replaceXbGetVarYamlInString === 'function') {
        output = runtime.replaceXbGetVarYamlInString(output);
    }
    if (typeof runtime.substituteParams === 'function') {
        output = runtime.substituteParams(output);
    }
    return resolveHistoryPlaceholder(output, runtime);
}

/**
 * Literal, non-regex splice. Dynamic narrative text is never handed to `String.replace`
 * as a replacement string, so `$&`, `` $` ``, `$'`, `$1` and `$$` survive verbatim.
 */
export function spliceLiteral(text, token, value) {
    if (!token) return String(text ?? '');
    return String(text ?? '').split(token).join(String(value ?? ''));
}

/**
 * Slot tokens are opaque sentinels that survive macro expansion, so a template placeholder
 * such as `{{lastMessage}}` can never be captured by an unrelated host macro of the same name.
 */
export function createPromptSlots(names = []) {
    slotSequence += 1;
    const salt = `${Date.now().toString(36)}${slotSequence.toString(36)}`;
    const slots = {};
    for (const name of names) {
        slots[name] = `\u2063XBDRAWSLOT_${name}_${salt}\u2063`;
    }
    return slots;
}

export function applyPromptSlots(text, slotValues = {}) {
    let output = String(text ?? '');
    for (const [token, value] of Object.entries(slotValues)) {
        output = spliceLiteral(output, token, value);
    }
    return output;
}

export function wrapPromptExpansionError(error) {
    if (error instanceof ScenePlannerError) return error;
    return new ScenePlannerError(
        `Prompt 宏展开失败：${error?.message || '未知错误'}`,
        'PROMPT_EXPANSION_FAILED',
        null,
        { cause: error },
    );
}

export async function emitScenePromptReady(runtime, promptSnapshot = []) {
    const eventSnapshot = cloneJson(promptSnapshot);
    try {
        if (runtime?.promptReadyEvent) {
            await runtime.eventSource?.emit?.(runtime.promptReadyEvent, {
                chat: eventSnapshot,
                dryRun: false,
            });
        }
    } catch {
        // Prompt preview compatibility must never block the actual request.
    }
}

export async function expandScenePlannerTask(task = {}, options = {}) {
    const runtime = options.runtime || await loadScenePromptRuntime();
    const systemPrompt = await expandScenePromptText(task.systemPrompt || '', runtime);
    const messages = [];
    for (const message of Array.isArray(task.messages) ? task.messages : []) {
        if (!message || typeof message.content !== 'string') continue;
        messages.push({
            ...message,
            content: await expandScenePromptText(message.content, runtime),
        });
    }
    const expandedTask = { ...task, systemPrompt, messages };
    await emitScenePromptReady(runtime, [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages,
    ]);
    return expandedTask;
}

export function resetScenePromptRuntimeForTests() {
    promptRuntimeModulesPromise = null;
}
