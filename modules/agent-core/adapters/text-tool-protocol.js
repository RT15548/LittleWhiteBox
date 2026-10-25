import { DEEPSEEK_TOOL_MODE_GUIDANCE, DSML_TOOL_CALL_INVALID } from '../runtime/error-guidance.js';
import { extractLooseField, findLooseKeyMatch, repairLooseToolArguments } from '../runtime/loose-tool-arguments.js';

// Compatibility: DeepSeek V3.2 DSML leaked into assistant text by compatible endpoints.
// Reference: https://huggingface.co/deepseek-ai/DeepSeek-V3.2/blob/main/encoding/encoding_dsv32.py
// Also accepts the repeated bars / spaces / `calls` spelling in reported relay output.
// Remove DSML support when supported endpoints no longer leak it into assistant text.
const TOOL_START = /<tool_call\b|<\/?[｜|]+DSML[｜|]+\s*/iy;
const INVOKE_OPEN = /<[｜|]+DSML[｜|]+\s*invoke\s+name="([^"]+)"\s*>/iy;
const INVOKE_CLOSE = /<\/[｜|]+DSML[｜|]+\s*invoke\s*>/iy;
const GROUP_OPEN = /<[｜|]+DSML[｜|]+\s*(function_calls|calls)\s*>/iy;
const GROUP_CLOSE = /<\/[｜|]+DSML[｜|]+\s*(function_calls|calls)\s*>/iy;
const PARAMETER_OPEN = /<[｜|]+DSML[｜|]+\s*parameter\s+name="([^"]+)"\s+string="(true|false)"\s*>/iy;
const PARAMETER_BOUNDARY = /<(\/?)[｜|]+DSML[｜|]+\s*parameter\b/gi;
const PARAMETER_CLOSE = /<\/[｜|]+DSML[｜|]+\s*parameter\s*>/iy;
const DECORATION_TAG = /<[^<>"']*(?:"[^"]*"[^<>"']*|'[^']*'[^<>"']*)*>/y;
const TAGGED_JSON_REASONS = {
    unclosedQuote: 'JSON 外的说明文字引号未闭合',
    incompleteBatch: '批量调用中存在不完整的 JSON，无法确定调用边界',
    ambiguousBoundary: 'JSON 未完成且包含结束标签，无法确定调用边界',
    unrepairable: '无法识别完整的工具名称和参数',
};
const PROSE_QUOTES = { '"': '"', "'": "'", '“': '”', '‘': '’', '「': '」', '『': '』' };

function matchAt(pattern, text, index) {
    pattern.lastIndex = index;
    return pattern.exec(text);
}

// Only used for strings/annotations inside a tool payload, not to interpret prose.
function readQuotedTextEnd(text, start) {
    const closing = PROSE_QUOTES[text[start]];
    if (!closing) return -1;
    for (let index = start + 1; index < text.length; index += 1) {
        if (text[index] === '\\') { index += 1; continue; }
        if (text[index] === closing) return index + 1;
    }
    return -1;
}

function isFenceLinePrefix(text, index) {
    return /^[ \t>]*$/.test(text.slice(text.lastIndexOf('\n', index - 1) + 1, index));
}

function readCodeLiteral(text, start, { inTool = false, streaming = false } = {}) {
    const run = matchAt(/`+|~{3,}/y, text, start)?.[0];
    if (!run) return -1;
    // Inside a real tool block, fences wrap the payload rather than quote an example.
    if (inTool && run.length >= 3) return start + run.length;
    const fenced = run.length >= 3 && isFenceLinePrefix(text, start)
        && (run[0] !== '`' || !matchAt(/[^\r\n]*/y, text, start + run.length)[0].includes('`'));
    for (let cursor = start + run.length; cursor < text.length;) {
        const next = matchAt(/`+|~{3,}/g, text, cursor);
        if (!next) break;
        const sameMarker = next[0][0] === run[0]
            && (fenced ? next[0].length >= run.length : next[0].length === run.length);
        const end = next.index + next[0].length;
        if (sameMarker && (!fenced || (isFenceLinePrefix(text, next.index)
            && matchAt(/[ \t]*(?:\r?\n|$)/y, text, end)))) return end;
        cursor = next.index + next[0].length;
    }
    // A lone inline backtick is text once the response ends; an open fence is still a code block.
    return run.length >= 3 || streaming ? text.length : -1;
}

function skipWhitespace(text, index) {
    while (index < text.length && /\s/.test(text[index])) index += 1;
    return index;
}

function failDsml(index, reason) {
    const cause = new SyntaxError(`DSML 工具调用格式无效：${reason}（位置 ${index}）。本轮工具未执行。`);
    const error = new SyntaxError(DEEPSEEK_TOOL_MODE_GUIDANCE, { cause });
    error.code = DSML_TOOL_CALL_INVALID;
    error.offset = index;
    throw error;
}

function failTaggedJson(index, reason, extraFields) {
    const error = new SyntaxError(`JSON 工具调用格式无效：${reason}（位置 ${index}）。本轮工具未执行。`);
    error.code = 'TAGGED_TOOL_CALL_INVALID';
    error.offset = index;
    // Diagnostic only: the keys of the already strictly parsed envelope, so a retry can name them.
    if (extraFields) error.extraFields = extraFields;
    throw error;
}

function readDsmlInvoke(text, start) {
    const opening = matchAt(INVOKE_OPEN, text, start);
    const name = opening?.[1].trim();
    if (!name) failDsml(start, '缺少完整的 invoke 标签或工具名');
    let cursor = start + opening[0].length;
    const keys = new Set();
    const fields = [];
    while (cursor < text.length) {
        cursor = skipWhitespace(text, cursor);
        const closing = matchAt(INVOKE_CLOSE, text, cursor);
        if (closing) {
            return { end: cursor + closing[0].length, calls: [{ name, arguments: `{${fields.join(',')}}` }] };
        }
        const parameter = matchAt(PARAMETER_OPEN, text, cursor);
        if (!parameter) failDsml(cursor, '缺少完整的 parameter 标签或 invoke 结束标签');
        const key = parameter[1];
        if (keys.has(key)) failDsml(cursor, '存在重复参数');
        keys.add(key);
        const valueStart = cursor + parameter[0].length;
        const boundary = matchAt(PARAMETER_BOUNDARY, text, valueStart);
        // Invokes and JSON tool examples inside a value are data, never sibling calls.
        // A nested parameter marker is ambiguous (often a missing close), so fail closed.
        if (!boundary || !boundary[1]) failDsml(valueStart, '参数未闭合或参数边界有歧义');
        const parameterClose = matchAt(PARAMETER_CLOSE, text, boundary.index);
        if (!parameterClose) failDsml(boundary.index, 'parameter 结束标签无效');
        const value = text.slice(valueStart, boundary.index);
        let jsonValue = JSON.stringify(value);
        if (parameter[2].toLowerCase() === 'false') {
            jsonValue = value.trim();
            try {
                JSON.parse(jsonValue);
            } catch {
                failDsml(valueStart, '非字符串参数不是合法 JSON');
            }
        }
        fields.push(`${JSON.stringify(key)}:${jsonValue}`);
        cursor = boundary.index + parameterClose[0].length;
    }
    failDsml(cursor, 'invoke 未闭合');
}

function readDsmlBlock(text, start) {
    const group = matchAt(GROUP_OPEN, text, start);
    if (!group) return readDsmlInvoke(text, start);
    let cursor = start + group[0].length;
    const calls = [];
    while (cursor < text.length) {
        cursor = skipWhitespace(text, cursor);
        const closing = matchAt(GROUP_CLOSE, text, cursor);
        if (closing) {
            if (closing[1].toLowerCase() !== group[1].toLowerCase()) failDsml(cursor, '调用组结束标签不匹配');
            return { end: cursor + closing[0].length, calls };
        }
        const invocation = readDsmlInvoke(text, cursor);
        calls.push(...invocation.calls);
        cursor = invocation.end;
    }
    failDsml(cursor, '调用组未闭合');
}

function scanJsonStructure(text, start) {
    const stack = [];
    let quoted = false;
    let nested = false;
    for (let index = start; index < text.length; index += 1) {
        const char = text[index];
        if (quoted) {
            if (char === '\\') index += 1;
            else if (char === '"') quoted = false;
        } else if (char === '"') quoted = true;
        else if (char === '{' || char === '[') {
            if (stack.length) nested = true;
            stack.push(char === '{' ? '}' : ']');
        }
        else if (char === '}' || char === ']') {
            if (stack.pop() !== char) return { end: -1, boundary: index, mismatched: true };
            if (!stack.length) return { end: index + 1, boundary: index + 1, nested };
        } else if (char === '<') return { end: -1, boundary: index };
    }
    return { end: -1, boundary: text.length };
}

function isBracketedAnnotation(text, start, structure) {
    if (text[start] !== '[' || structure.end < 0 || structure.nested) return false;
    try {
        JSON.parse(text.slice(start, structure.end));
        return false;
    } catch {
        // Flat bracketed prose, e.g. [2 张已完成], is padding. A JSON array or nested structure is not.
        return true;
    }
}

// Compatibility: model prose, code fences and foreign tags around a complete tagged JSON call.
// Remove when supported endpoints emit only the requested JSON inside tool_call tags.
function findJsonEnvelope(text, start, toolStart) {
    let cursor = start;
    let token;
    while ((token = matchAt(/["'“‘「『`~<{[]/g, text, cursor))) {
        cursor = token.index;
        const codeEnd = readCodeLiteral(text, cursor, { inTool: true });
        if (codeEnd >= 0) {
            cursor = codeEnd;
            continue;
        }
        const quoteEnd = readQuotedTextEnd(text, cursor);
        if (quoteEnd >= 0) {
            const end = quoteEnd;
            if (text[skipWhitespace(text, end)] === ':') {
                failTaggedJson(toolStart, '完整 JSON 外出现字段，不能作为杂文剥离');
            }
            cursor = end;
            continue;
        }
        if (token[0] === '"') failTaggedJson(toolStart, TAGGED_JSON_REASONS.unclosedQuote);
        if (token[0] !== '<' && token[0] !== '{' && token[0] !== '[') {
            cursor += 1;
            continue;
        }
        if (token[0] === '<') {
            if (matchAt(/<[｜|]+DSML[｜|]+\s*(?:invoke|function_calls|calls)\b/iy, text, cursor)) {
                failTaggedJson(toolStart, 'JSON 工具块中混入 DSML 调用，无法确定调用边界');
            }
            const tag = matchAt(DECORATION_TAG, text, cursor);
            cursor += tag?.[0].length || 1;
            continue;
        }
        const structure = scanJsonStructure(text, cursor);
        if (isBracketedAnnotation(text, cursor, structure)) {
            cursor = structure.end; // A complete annotation such as [说明], never its inner text.
            continue;
        }
        // String boundaries do not depend on JSON validity: loose Write may contain raw newlines.
        // Never search inside this structure for another envelope, even when JSON.parse rejects it.
        return { start: cursor, ...structure };
    }
    return null;
}

function assertJsonToolEnvelope(parsed, toolStart) {
    for (const call of Array.isArray(parsed) ? parsed : [parsed]) {
        if (!call || typeof call !== 'object' || Array.isArray(call)
            || typeof call.name !== 'string' || !call.name.trim()) {
            failTaggedJson(toolStart, '每条调用必须是包含工具名称 name 的 JSON 对象');
        }
        const extraFields = Object.keys(call).filter(key => !['id', 'name', 'arguments'].includes(key));
        if (extraFields.length) {
            // An early arguments closer can move real parameters to the envelope root.
            // Stripping its extra final closer must never silently discard those fields.
            failTaggedJson(toolStart, '工具封装中存在 id、name、arguments 之外的字段，无法确定参数边界', extraFields);
        }
    }
}

function readJsonPayloads(text, toolStart) {
    const envelopes = [];
    let cursor = 0;
    let next;
    while ((next = findJsonEnvelope(text, cursor, toolStart))) {
        if (next.mismatched) failTaggedJson(toolStart, 'JSON 括号不匹配，无法确定调用边界');
        if (envelopes.length && !/^\s*,?\s*$/.test(text.slice(cursor, next.start))) {
            failTaggedJson(toolStart, '调用对象之间存在非分隔内容，无法确定调用边界');
        }
        envelopes.push(next);
        cursor = next.boundary;
        if (next.end < 0) break;
    }
    const envelope = envelopes.at(-1);
    if (envelopes.length > 1 && envelope.end < 0) {
        failTaggedJson(toolStart, TAGGED_JSON_REASONS.incompleteBatch);
    }
    const payloads = envelope?.end >= 0
        ? envelopes.map(item => text.slice(item.start, item.end))
        : [text];
    return payloads;
}

function readThought(text, start) {
    const contentStart = start + '<think>'.length;
    // Thinking is opaque. Only its protocol delimiter matters, never JSON, code or tools inside it.
    const closing = matchAt(/<\/think>/gi, text, contentStart);
    return { contentStart, contentEnd: closing?.index ?? text.length,
        end: closing ? closing.index + closing[0].length : text.length };
}

function partialProtocol(text, index) {
    const tail = text.slice(index).replace(/[｜|]+/g, '|').toLowerCase();
    const candidates = ['<tool_call', '<|dsml|', '</|dsml|', '<think'].filter(prefix => prefix.startsWith(tail));
    return candidates.length > 1 ? '<' : candidates[0];
}

// DSML parameter values are opaque until their own delimiter. Validation belongs to the decoder.
function findDsmlEnd(text, start) {
    const opening = matchAt(/<[｜|]+DSML[｜|]+\s*(invoke|function_calls|calls)\b[^>]*>/iy, text, start);
    if (!opening) return text.length;
    const grouped = opening[1].toLowerCase() !== 'invoke';
    let cursor = start + opening[0].length;
    let tag;
    while ((tag = matchAt(/<(\/?)[｜|]+DSML[｜|]+\s*(parameter|invoke|function_calls|calls)\b[^>]*>/gi, text, cursor))) {
        cursor = tag.index + tag[0].length;
        const name = tag[2].toLowerCase();
        if (!tag[1] && name === 'parameter') {
            const closing = matchAt(/<\/[｜|]+DSML[｜|]+\s*parameter\s*>/gi, text, cursor);
            if (closing) cursor = closing.index + closing[0].length;
        } else if (tag[1] && (grouped ? name === 'function_calls' || name === 'calls' : name === 'invoke')) {
            return cursor;
        }
    }
    return text.length;
}

function isQuotedMarker(text, start, end) {
    return Object.hasOwn(PROSE_QUOTES, text[start - 1]) && text[end] === PROSE_QUOTES[text[start - 1]];
}

// Pair complete JSON tags backwards, like the state-block protocol. Unmatched opens are drafts,
// not errors and not candidates for repair. Calls are decoded only after the entire scan finishes.
function pairJsonTags(tags, sourceLength) {
    const blocks = [];
    const paired = new Set();
    for (let index = tags.length - 1; index > 0; index -= 1) {
        const close = tags[index];
        const open = tags[index - 1];
        if (!close.closing || open.closing) continue;
        blocks.push({ kind: 'tool', protocol: 'json', start: open.start, contentStart: open.end,
            contentEnd: close.start, end: close.end });
        paired.add(open);
        index -= 1;
    }
    tags.forEach((tag, index) => {
        if (!tag.closing && !paired.has(tag)) blocks.push({ kind: 'tool', protocol: 'json',
            start: tag.start, end: tags[index + 1]?.start ?? sourceLength, incomplete: true,
            partial: tag.partial, ambiguousBoundary: tag.ambiguousBoundary });
    });
    return blocks;
}

// This scan only partitions the response. It never parses or validates a tool payload.
// Display, streaming drafts, final decoding and replay all consume these same ranges.
export function scanAssistantText(value = '', { streaming = false } = {}) {
    const text = String(value || '');
    const ranges = [];
    let tags = [];
    let cursor = 0;
    let inJson = false;
    const flushTags = end => {
        ranges.push(...pairJsonTags(tags, end));
        tags = [];
    };
    while (cursor < text.length) {
        if (inJson && (text[cursor] === '{' || text[cursor] === '[')) {
            const structure = scanJsonStructure(text, cursor);
            // A broken JSON string may hide both a closer and later calls. Keep that
            // boundary ambiguous instead of treating the whole remainder as an absent closer.
            if (structure.end < 0 && structure.boundary === text.length
                && /<\/tool_call>/i.test(text.slice(cursor))) tags.at(-1).ambiguousBoundary = true;
            cursor = Math.max(cursor + 1, structure.boundary);
            continue;
        }
        const literalEnd = inJson
            ? Math.max(readQuotedTextEnd(text, cursor), readCodeLiteral(text, cursor, { inTool: true }))
            : readCodeLiteral(text, cursor, { streaming });
        if (literalEnd >= 0) { cursor = literalEnd; continue; }
        const marker = matchAt(/<think>|<\/?tool_call>/iy, text, cursor);
        if (marker && isQuotedMarker(text, cursor, cursor + marker[0].length)) {
            cursor += marker[0].length;
            continue;
        }
        if (marker?.[0].toLowerCase() === '<think>') {
            flushTags(cursor);
            inJson = false;
            const thought = readThought(text, cursor);
            ranges.push({ kind: 'thought', start: cursor, ...thought });
            cursor = thought.end;
            continue;
        }
        if (marker && /tool_call/i.test(marker[0])) {
            const closing = marker[0][1] === '/';
            tags.push({ start: cursor, end: cursor + marker[0].length, closing });
            inJson = !closing;
            cursor += marker[0].length;
            continue;
        }
        const tool = !inJson && matchAt(TOOL_START, text, cursor);
        const partial = text[cursor] === '<' ? partialProtocol(text, cursor) : null;
        if (tool && /DSML/i.test(tool[0])) {
            flushTags(cursor);
            const end = findDsmlEnd(text, cursor);
            ranges.push({ kind: 'tool', protocol: 'dsml', start: cursor, end });
            cursor = end;
            continue;
        }
        if (partial) {
            if (partial === '<tool_call') tags.push({ start: cursor, end: text.length, partial: true });
            else if (!inJson && /DSML/i.test(partial)) {
                flushTags(cursor);
                ranges.push({ kind: 'tool', protocol: 'dsml', start: cursor, end: text.length, partial: true });
            } else if (!inJson && streaming) ranges.push({ kind: 'pending', start: cursor, end: text.length });
            break;
        }
        const tag = text[cursor] === '<' ? matchAt(DECORATION_TAG, text, cursor) : null;
        cursor += tag?.[0].length || 1;
    }
    flushTags(text.length);
    const segments = [];
    cursor = 0;
    for (const range of ranges.sort((a, b) => a.start - b.start)) {
        if (cursor < range.start) segments.push({ kind: 'text', start: cursor, end: range.start });
        segments.push(range);
        cursor = range.end;
    }
    if (cursor < text.length) segments.push({ kind: 'text', start: cursor, end: text.length });
    return { source: text, segments };
}

function normalizeTaggedArguments(value, toolName) {
    const text = typeof value === 'string' ? value : JSON.stringify(value ?? {});
    try {
        JSON.parse(text);
        return text;
    } catch {
        // Schema validation owns irreparable arguments; never invent generic fields here.
        return repairLooseToolArguments(text, toolName) || text;
    }
}

function parseLoosePayload(source) {
    const name = extractLooseField(source, 'name', ['id', 'arguments'])
        || extractLooseField(source, 'toolName', ['id', 'arguments']);
    const id = extractLooseField(source, 'id', ['name', 'toolName', 'arguments']);
    const match = findLooseKeyMatch(source, 'arguments');
    if (!name?.trim() || !match) return null;
    const start = skipWhitespace(source, match.end);
    const argumentsText = source[start] === '"'
        ? source.slice(start + 1).replace(/"\s*\}\s*$/, '').trimEnd()
        : source.slice(start).replace(/\}\s*$/, '').trimEnd();
    if (!argumentsText) return null;
    return { id, name, arguments: normalizeTaggedArguments(argumentsText, name) };
}

export function decodeTextToolCalls(scan) {
    const results = [];
    for (const block of scan.segments.filter(segment => segment.kind === 'tool')) {
        if (block.ambiguousBoundary) failTaggedJson(block.start, TAGGED_JSON_REASONS.ambiguousBoundary);
        if (block.incomplete) continue;
        if (block.protocol === 'dsml') {
            results.push(...readDsmlBlock(scan.source.slice(0, block.end), block.start).calls);
            continue;
        }
        const payloads = readJsonPayloads(scan.source.slice(block.contentStart, block.contentEnd), block.start);
        for (const payload of payloads) {
            let parsed;
            try { parsed = JSON.parse(payload); } catch {
                if (payloads.length > 1 || payload.trimStart().startsWith('[')) {
                    failTaggedJson(block.start, TAGGED_JSON_REASONS.incompleteBatch);
                }
                const repaired = parseLoosePayload(payload);
                if (!repaired) failTaggedJson(block.start, TAGGED_JSON_REASONS.unrepairable);
                results.push(repaired);
                continue;
            }
            assertJsonToolEnvelope(parsed, block.start);
            for (const call of Array.isArray(parsed) ? parsed : [parsed]) {
                results.push({ id: call.id, name: call.name, arguments: normalizeTaggedArguments(call.arguments, call.name) });
            }
        }
    }
    const usedIds = new Set(results.filter(item => item.id).map(item => String(item.id)));
    return results.map((call, index) => {
        if (call.id) return call;
        let number = index + 1;
        while (usedIds.has(`tool-call-${number}`)) number += 1;
        const id = `tool-call-${number}`;
        usedIds.add(id);
        return { ...call, id };
    });
}
