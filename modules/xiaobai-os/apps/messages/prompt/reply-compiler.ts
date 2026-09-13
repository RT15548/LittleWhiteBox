import { MESSAGE_LIMITS, type MessagePayload } from '../../../domains/messages/types.js';
import { parsePayload, record, messageString } from '../../../domains/messages/invariants.js';

export function parseResponseObject(text: string): Record<string, unknown> {
    if (text.length > 100_000) {throw new Error('messages_response_capacity');}
    const clean = text.replace(/<think>[\s\S]*?<\/think>/giu, '').trim();
    if (/<\/?think\b/iu.test(clean)) {throw new Error('messages_response_incomplete');}
    const first = clean.indexOf('{');
    if (first < 0) {throw new Error('messages_response_invalid');}
    let depth = 0; let quoted = false; let escaped = false;
    for (let index = first; index < clean.length; index++) {
        const char = clean[index];
        if (quoted) {
            if (escaped) {escaped = false;}
            else if (char === '\\') {escaped = true;}
            else if (char === '"') {quoted = false;}
        } else if (char === '"') {quoted = true;}
        else if (char === '{') {depth++;}
        else if (char === '}' && --depth === 0) {
            let parsed: unknown;
            try {parsed = JSON.parse(clean.slice(first, index + 1));} catch {throw new Error('messages_response_invalid');}
            if (!record(parsed)) {throw new Error('messages_response_invalid');}
            return parsed;
        }
    }
    throw new Error('messages_response_incomplete');
}

export function compileReplies(response: { text?: unknown; truncated?: unknown; finishReason?: unknown }): MessagePayload[] {
    if (response.truncated === true || response.finishReason === 'length' || response.finishReason === 'max_tokens') {
        throw new Error('messages_response_incomplete');
    }
    const object = parseResponseObject(String(response.text ?? ''));
    if (!Array.isArray(object.replies) || object.replies.length > MESSAGE_LIMITS.replies) {throw new Error('messages_response_capacity');}
    const replies: MessagePayload[] = [];
    for (const item of object.replies) {
        if (record(item) && 'attachment' in item) {continue;}
        try {replies.push(parsePayload(item));} catch { /* Invalid siblings never become visible protocol text. */ }
    }
    if (!replies.length) {throw new Error('messages_response_empty');}
    return replies;
}

export function compileSummary(response: { text?: unknown; truncated?: unknown; finishReason?: unknown }): string {
    if (response.truncated === true || response.finishReason === 'length' || response.finishReason === 'max_tokens') {throw new Error('messages_summary_incomplete');}
    return messageString(parseResponseObject(String(response.text ?? '')).summary, MESSAGE_LIMITS.summary);
}
