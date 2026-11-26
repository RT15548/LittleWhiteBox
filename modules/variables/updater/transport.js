import { COPY } from './copy.js';
import { HANDOFF, HANDOFF_CALL_LIMIT, handoffReceipt } from './handoff.js';

export class SubmissionError extends Error {
    constructor() { super(COPY.invalid); }
}

export function parseSubmission(response) {
    // Agent API owns protocol-specific finish reasons, including Responses.
    if (response.truncated || response.completion !== 'complete') throw new SubmissionError();
    const calls = response.toolCalls || [];
    if (calls.length !== 1 || calls[0].name !== HANDOFF.write) throw new SubmissionError();
    let args;
    try { args = JSON.parse(calls[0].arguments); } catch { throw new SubmissionError(); }
    if (!args || typeof args !== 'object' || !Object.hasOwn(args, 'state')) throw new SubmissionError();
    return args.state;
}

// A complete reply that only repeats handoff tools receives their receipts in the same session.
function repeatedHandoff(response) {
    const calls = response.toolCalls || [];
    return !response.truncated && response.completion === 'complete' && calls.length > 0
        && calls.every(call => handoffReceipt(call.name));
}

export async function requestUpdate(task, source, signal, onResponse) {
    if (!globalThis.xiaobaixAgent?.openSession) throw new Error(COPY.unavailable);
    const session = await globalThis.xiaobaixAgent.openSession({ api: source, signal });
    try {
        let messages = task.messages, calls = 0;
        for (;;) {
            const response = await session.chat({ ...task, messages, signal });
            onResponse?.({ text: response.text, toolCalls: response.toolCalls, completion: response.completion, truncated: response.truncated });
            if (!repeatedHandoff(response) || calls + response.toolCalls.length > HANDOFF_CALL_LIMIT) return parseSubmission(response);
            calls += response.toolCalls.length;
            messages = [...messages, response.reply, ...response.toolCalls.map(call => session.toolResult(call, handoffReceipt(call.name)))];
        }
    }
    finally { session.dispose(); }
}
