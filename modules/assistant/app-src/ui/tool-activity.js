import { describeToolCall, isWebTool, TOOL_NAMES } from '../tooling.js';
import { deliveryActivityLabels } from '../../plugins/delivery/history.js';
import { ACTIVITY_COPY } from './activity-copy.js';
import { COPY as CARD_COPY } from '../../../card-workspace/copy.js';

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

export function toolOutcome(result, toolName = result?.toolName) {
    if (!result) return { status: 'unconfirmed', note: '' };
    if (result.error === 'tool_timeout' || result.error === 'tool_aborted') {
        if (isWebTool(toolName) || toolName === TOOL_NAMES.INSPECT_PAGE || toolName === TOOL_NAMES.READ_LOGS) {
            return { status: result.error === 'tool_aborted' ? 'stopped' : 'failed', note: shortText(result.message) };
        }
        if (toolName === TOOL_NAMES.GREP) {
            return result.error === 'tool_timeout'
                ? { status: 'failed', note: ACTIVITY_COPY.searchTimeout }
                : { status: 'stopped', note: '' };
        }
        return { status: 'unconfirmed', note: [TOOL_NAMES.RUN_JAVASCRIPT_API, TOOL_NAMES.DRAW_IMAGE].includes(toolName) ? shortText(result.message) : '' };
    }
    if (result.skipped === true || result.approved === false) return { status: 'skipped', note: '' };
    if (result.execution?.isAborted === true) return {
        status: toolName === TOOL_NAMES.RUN_JAVASCRIPT_API ? 'unconfirmed' : 'stopped',
        note: shortText(result.execution.abortReason),
    };
    if (toolName === TOOL_NAMES.WEB_FETCH && result.ok === false && (result.results?.length > 0 || result.status === 'partial')) {
        return { status: 'partial', note: shortText(result.message) };
    }
    if ([TOOL_NAMES.DRAW_IMAGE, TOOL_NAMES.SAVE_DRAW_IMAGES].includes(toolName) && result.ok === false && result.images?.length) {
        return { status: 'partial', note: shortText(result.message) };
    }
    if (result.status === 'partial') return { status: 'partial', note: shortText(result.message) };
    if (result.ok === false || result.execution?.isError === true) {
        return { status: 'failed', note: shortText(result.message || result.execution?.errorMessage || result.error) };
    }
    if (result.skippedFiles > 0) return { status: 'partial', note: '' };
    if (toolName === TOOL_NAMES.CARD_FILES && result.ok === true && result.previewRefreshFailed === true) {
        return { status: 'succeeded', note: CARD_COPY.avatarRefreshFailed };
    }
    // Current read/search tools return their data directly; failures use ok:false
    // or the host error channel. An absent ok field is not a legacy format.
    return { status: 'succeeded', note: toolName === TOOL_NAMES.CARD_ASSETS && result.draft && result.requiresWriteback
        ? result.unchanged ? CARD_COPY.assetDraftUnchanged : CARD_COPY.assetDraftNote : '' };
}

export function createToolActivityProjection(getActivity = () => null, getActions = () => []) {
    const calls = new WeakMap(), receipts = new WeakMap();

    function label(call) {
        if (deliveryActivityLabels.has(call.name)) return deliveryActivityLabels.get(call.name);
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
        const value = toolOutcome(parseRecord(message.content), message.toolName);
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
                rows.push({ key: call, type: 'tool', label: label(call), ...value,
                    actions: result && result.toolName === call.name ? getActions(call, parseRecord(result.content)) : [] });
            }
        }
        return { rows, counts };
    };
}
