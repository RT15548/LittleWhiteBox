import { describeToolCall } from '../tooling.js';

const shortText = value => String(value ?? '').replace(/\s+/gu, ' ').trim().slice(0, 160);

function parseRecord(text) {
    try {
        const value = JSON.parse(text);
        return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
    } catch {
        // An unreadable receipt is not evidence of success.
        return null;
    }
}

export function toolOutcome(result) {
    if (!result) return { status: 'unconfirmed', note: '' };
    if (result.error === 'tool_timeout' || result.error === 'tool_aborted') {
        return { status: 'unconfirmed', note: '' };
    }
    if (result.skipped === true || result.approved === false) return { status: 'skipped', note: '' };
    if (result.execution?.isAborted === true) return { status: 'stopped', note: shortText(result.execution.abortReason) };
    if (result.ok === false || result.execution?.isError === true) {
        return { status: 'failed', note: shortText(result.message || result.execution?.errorMessage || result.error) };
    }
    if (result.skippedFiles > 0) return { status: 'partial', note: '' };
    // Current read/search tools return their data directly; failures use ok:false
    // or the host error channel. An absent ok field is not a legacy format.
    return { status: 'succeeded', note: '' };
}

export function createToolActivityProjection(getActivity = () => null) {
    const calls = new WeakMap(), receipts = new WeakMap();

    function label(call) {
        const cached = calls.get(call);
        if (cached?.arguments === call.arguments) return cached.label;
        const args = parseRecord(call.arguments) || {};
        // The label may describe a purpose, never the JavaScript source itself.
        const label = shortText(describeToolCall(call.name, { ...args, code: '' }));
        calls.set(call, { arguments: call.arguments, label });
        return label;
    }

    function outcome(message) {
        const cached = receipts.get(message);
        if (cached?.content === message.content) return cached.value;
        const value = toolOutcome(parseRecord(message.content));
        receipts.set(message, { content: message.content, value });
        return value;
    }

    return function project(messages) {
        const rows = [], counts = { total: 0, succeeded: 0, failed: 0, unresolved: 0 };
        for (let index = 0; index < messages.length; index++) {
            const message = messages[index];
            if (message.role !== 'assistant' || message.approvalRequest) continue;
            if (message.content?.trim()) rows.push({ key: message, type: 'text', text: message.content });
            const results = new Map();
            for (let next = index + 1; messages[next]?.role === 'tool'; next++) {
                const result = messages[next];
                results.set(result.toolCallId, result);
            }
            for (const call of message.toolCalls || []) {
                const result = results.get(call.id);
                const value = result && result.toolName === call.name ? outcome(result)
                    : { status: getActivity(call) || 'unconfirmed', note: '' };
                counts.total++;
                if (value.status === 'succeeded') counts.succeeded++;
                else if (value.status === 'failed') counts.failed++;
                else counts.unresolved++;
                rows.push({ key: call, type: 'tool', label: label(call), ...value });
            }
        }
        return { rows, counts };
    };
}
