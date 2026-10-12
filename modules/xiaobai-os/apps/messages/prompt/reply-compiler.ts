import { MESSAGE_LIMITS, type MessagePayload } from '../../../domains/messages/types.js';
import { parsePayload, record, messageString } from '../../../domains/messages/invariants.js';
import type { MessageReplyPreview } from '../types.js';
import { CHARACTER_STATE_TAG } from './reply-format.js';

/** Some providers include native reasoning in text. An unfinished block is never display content. */
function responseContent(text: string, partial = false): string {
    const clean = text.replace(/<think>[\s\S]*?<\/think>/giu, '');
    if (!partial && /<\/?think\b/iu.test(clean)) {throw new Error('messages_response_incomplete');}
    const open = clean.search(/<think>/iu);
    return open < 0 ? clean : clean.slice(0, open);
}

export function parseResponseObject(text: string): Record<string, unknown> {
    if (text.length > 100_000) {throw new Error('messages_response_capacity');}
    const clean = responseContent(text).trim();
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

/** Private-message pacing: the prompt asks for at most five; anything beyond eight is dropped. */
export const REPLY_LIMIT = 8;

const MSG = /<msg\b([^>]*)>([\s\S]*?)<\/msg>/giu;

function attributes(source: string): Record<string, string> {
    return Object.fromEntries([...source.matchAll(/([A-Za-z_][\w-]*)\s*=\s*"([^"]*)"/gu)].map(match => [match[1].toLowerCase(), match[2].trim()]));
}

function replyPayload(source: string, body: string): MessagePayload | null {
    const attrs = attributes(source);
    const content = body.trim();
    const type = attrs.type || 'text';
    const value = type === 'text' ? { type, text: content }
        : type === 'image' ? { type, description: content, ...(attrs.tags ? { generationPrompt: attrs.tags } : {}) }
            : type === 'voice' ? { type, transcript: content, ...(attrs.emotion ? { emotion: attrs.emotion } : {}) } : null;
    if (!value) {return null;}
    try {return parsePayload(value);} catch {return null;}
}

/** Character state is live fiction, not a message or a stored memory. */
function splitCharacterState(text: string): { characterState: string | null; characterStateDone: boolean; rest: string } {
    const opening = `<${CHARACTER_STATE_TAG}>`; const closing = `</${CHARACTER_STATE_TAG}>`;
    const open = text.search(new RegExp(opening, 'iu'));
    if (open < 0) {return { characterState: null, characterStateDone: false, rest: text };}
    const start = open + opening.length;
    const relativeClose = text.slice(start).search(new RegExp(closing, 'iu'));
    if (relativeClose < 0) {return { characterState: text.slice(start).trim(), characterStateDone: false, rest: text.slice(0, open) };}
    const close = start + relativeClose;
    return { characterState: text.slice(start, close).trim(), characterStateDone: true,
        rest: text.slice(0, open) + text.slice(close + closing.length) };
}

/** Lenient reading of a partial stream: only closed messages are shown. */
export function previewReplies(text: string): MessageReplyPreview {
    const { characterState, characterStateDone, rest } = splitCharacterState(responseContent(text, true));
    const replies = [...rest.matchAll(MSG)].map(match => replyPayload(match[1], match[2]))
        .filter((reply): reply is MessagePayload => reply !== null).slice(0, REPLY_LIMIT);
    return { characterState: characterState ?? '', characterStateDone, replies };
}

export function compileReplies(response: { text?: unknown; truncated?: unknown; finishReason?: unknown }): MessagePayload[] {
    if (response.truncated === true || response.finishReason === 'length' || response.finishReason === 'max_tokens') {
        throw new Error('messages_response_incomplete');
    }
    const text = String(response.text ?? '');
    if (text.length > 100_000) {throw new Error('messages_response_capacity');}
    const { characterState, characterStateDone, rest } = splitCharacterState(responseContent(text));
    if (characterState !== null && !characterStateDone) {throw new Error('messages_response_incomplete');}
    // An unclosed message is a cut-off stream, not a shorter reply.
    if (/<msg\b/iu.test(rest.replace(MSG, ''))) {throw new Error('messages_response_incomplete');}
    if (!/<msg\b/iu.test(rest)) {throw new Error('messages_response_invalid');}
    const replies = previewReplies(text).replies;
    if (!replies.length) {throw new Error('messages_response_empty');}
    return replies;
}

export function compileSummary(response: { text?: unknown; truncated?: unknown; finishReason?: unknown }): string {
    if (response.truncated === true || response.finishReason === 'length' || response.finishReason === 'max_tokens') {throw new Error('messages_summary_incomplete');}
    return messageString(parseResponseObject(String(response.text ?? '')).summary, MESSAGE_LIMITS.summary);
}
