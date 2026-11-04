// Google's documented marker for manually constructed function-call history:
// https://ai.google.dev/gemini-api/docs/generate-content/thought-signatures?hl=en
export const GOOGLE_SYNTHETIC_HISTORY_SIGNATURE = 'skip_thought_signature_validator';

/** Google replay data is derived from the standard call, never a separate history source. */
export function buildScenePlannerGoogleHistory(message) {
    return {
        role: 'model',
        parts: [
            { text: message.content },
            ...message.tool_calls.map(call => ({
                functionCall: { id: call.id, name: call.function.name, args: JSON.parse(call.function.arguments) },
                thoughtSignature: GOOGLE_SYNTHETIC_HISTORY_SIGNATURE,
            })),
        ],
    };
}

const MESSAGE_FIELDS = Object.freeze({
    system: ['role', 'content'],
    user: ['role', 'content'],
    assistant: ['role', 'content', 'tool_calls', 'providerPayload'],
    tool: ['role', 'content', 'tool_call_id'],
});

function assertObjectFields(value, allowed, required, path) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError(`${path} must be an object`);
    }
    for (const key of Object.keys(value)) {
        if (!allowed.includes(key)) throw new TypeError(`${path}.${key} is not allowed`);
    }
    for (const key of required) {
        if (!Object.hasOwn(value, key)) throw new TypeError(`${path}.${key} is required`);
    }
}

function assertNonEmptyString(value, path) {
    if (typeof value !== 'string' || !value.trim()) {
        throw new TypeError(`${path} must be a non-empty string`);
    }
}

function assertToolCall(call, path) {
    assertObjectFields(call, ['id', 'type', 'function'], ['id', 'type', 'function'], path);
    assertNonEmptyString(call.id, `${path}.id`);
    if (call.type !== 'function') throw new TypeError(`${path}.type must be function`);
    assertObjectFields(call.function, ['name', 'arguments'], ['name', 'arguments'], `${path}.function`);
    assertNonEmptyString(call.function.name, `${path}.function.name`);
    try {
        if (typeof call.function.arguments !== 'string') throw new TypeError();
        const args = JSON.parse(call.function.arguments);
        if (!args || typeof args !== 'object' || Array.isArray(args)) throw new TypeError();
    } catch {
        throw new TypeError(`${path}.function.arguments must be a JSON object string`);
    }
}

// The derived replay object defines both allowed keys and values; object key order is irrelevant.
function assertDerivedHistory(value, expected, path) {
    if (Array.isArray(expected)) {
        if (!Array.isArray(value) || value.length !== expected.length) {
            throw new TypeError(`${path} must match the standard tool-call message`);
        }
        expected.forEach((item, index) => assertDerivedHistory(value[index], item, `${path}[${index}]`));
    } else if (expected && typeof expected === 'object') {
        const keys = Object.keys(expected);
        assertObjectFields(value, keys, keys, path);
        for (const key of keys) assertDerivedHistory(value[key], expected[key], `${path}.${key}`);
    } else if (value !== expected) {
        throw new TypeError(`${path} must match the standard tool-call message`);
    }
}

/** Validate the serialized Draw prompt shared by browser execution and backend admission. */
export function assertScenePlannerMessages(messages) {
    const path = 'planner.prompt.messages';
    if (!Array.isArray(messages)) throw new TypeError(`${path} must be an array`);
    const callIds = new Set();
    const pending = new Set();
    let hasUser = false;
    for (const [index, message] of messages.entries()) {
        const messagePath = `${path}[${index}]`;
        const fields = typeof message?.role === 'string' && Object.hasOwn(MESSAGE_FIELDS, message.role)
            ? MESSAGE_FIELDS[message.role]
            : null;
        if (!fields) throw new TypeError(`${messagePath}.role must be system, user, assistant or tool`);
        assertObjectFields(message, fields, ['role', 'content'], messagePath);
        assertNonEmptyString(message.content, `${messagePath}.content`);
        if (message.role === 'tool') {
            assertNonEmptyString(message.tool_call_id, `${messagePath}.tool_call_id`);
            if (!pending.delete(message.tool_call_id)) {
                throw new TypeError(`${messagePath}.tool_call_id must match an unanswered tool call`);
            }
            continue;
        }
        if (pending.size) throw new TypeError(`${messagePath} must follow all pending tool results`);
        if (message.role === 'user') hasUser = true;
        if (message.role === 'assistant' && Object.hasOwn(message, 'tool_calls')) {
            if (!Array.isArray(message.tool_calls) || !message.tool_calls.length) {
                throw new TypeError(`${messagePath}.tool_calls must be a non-empty array`);
            }
            for (const [callIndex, call] of message.tool_calls.entries()) {
                const callPath = `${messagePath}.tool_calls[${callIndex}]`;
                assertToolCall(call, callPath);
                if (callIds.has(call.id)) throw new TypeError(`${callPath}.id must be unique`);
                callIds.add(call.id);
                pending.add(call.id);
            }
        }
        if (message.role === 'assistant' && Object.hasOwn(message, 'providerPayload')) {
            if (!message.tool_calls?.length) {
                throw new TypeError(`${messagePath}.providerPayload requires a tool-call message`);
            }
            assertDerivedHistory(
                message.providerPayload,
                { googleContent: buildScenePlannerGoogleHistory(message) },
                `${messagePath}.providerPayload`,
            );
        }
    }
    if (pending.size) throw new TypeError(`${path} must include a result for every tool call`);
    if (!hasUser) throw new TypeError(`${path} must contain at least one user message`);
    return messages;
}
