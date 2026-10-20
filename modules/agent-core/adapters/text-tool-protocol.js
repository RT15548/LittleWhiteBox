import { DEEPSEEK_TOOL_MODE_GUIDANCE, DSML_TOOL_CALL_INVALID } from '../runtime/error-guidance.js';

// Compatibility: DeepSeek V3.2 DSML leaked into assistant text by compatible endpoints.
// Reference: https://huggingface.co/deepseek-ai/DeepSeek-V3.2/blob/main/encoding/encoding_dsv32.py
// Also accepts the repeated bars / spaces / `calls` spelling in reported relay output.
// Remove DSML support when supported endpoints no longer leak it into assistant text.
const TOOL_START = /<tool_call\b|<\/?[｜|]+DSML[｜|]+\s*/gi;
const INVOKE_OPEN = /<[｜|]+DSML[｜|]+\s*invoke\s+name="([^"]+)"\s*>/iy;
const INVOKE_CLOSE = /<\/[｜|]+DSML[｜|]+\s*invoke\s*>/iy;
const GROUP_OPEN = /<[｜|]+DSML[｜|]+\s*(function_calls|calls)\s*>/iy;
const GROUP_CLOSE = /<\/[｜|]+DSML[｜|]+\s*(function_calls|calls)\s*>/iy;
const PARAMETER_OPEN = /<[｜|]+DSML[｜|]+\s*parameter\s+name="([^"]+)"\s+string="(true|false)"\s*>/iy;
const PARAMETER_BOUNDARY = /<(\/?)[｜|]+DSML[｜|]+\s*parameter\b/gi;
const PARAMETER_CLOSE = /<\/[｜|]+DSML[｜|]+\s*parameter\s*>/iy;
const DECORATION_TAG = /<[^<>"']*(?:"[^"]*"[^<>"']*|'[^']*'[^<>"']*)*>/y;

function matchAt(pattern, text, index) {
    pattern.lastIndex = index;
    return pattern.exec(text);
}

export function findTextToolStart(text, fromIndex = 0) {
    return matchAt(TOOL_START, text, fromIndex);
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

function failTaggedJson(index, reason) {
    const error = new SyntaxError(`JSON 工具调用格式无效：${reason}（位置 ${index}）。本轮工具未执行。`);
    error.code = 'TAGGED_TOOL_CALL_INVALID';
    error.offset = index;
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
function findJsonEnvelope(text, start) {
    let cursor = start;
    let token;
    while ((token = matchAt(/["<{[]/g, text, cursor))) {
        cursor = token.index;
        if (token[0] === '"') {
            const end = findQuotedTextEnd(text, cursor);
            if (end < 0) failTaggedJson(start, 'JSON 前的说明文字引号未闭合');
            cursor = end;
            continue;
        }
        if (token[0] === '<') {
            if (matchAt(/<\/tool_call>/iy, text, cursor)) return null;
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

function findQuotedTextEnd(text, start) {
    for (let index = start + 1; index < text.length; index += 1) {
        if (text[index] === '\\') index += 1;
        else if (text[index] === '"') return index + 1;
    }
    return -1;
}

function assertJsonDecoration(text, toolStart) {
    for (let cursor = 0; cursor < text.length;) {
        const char = text[cursor];
        // Tags and quoted annotations are opaque; brackets in their text are not JSON roots.
        const tag = char === '<' ? matchAt(DECORATION_TAG, text, cursor) : null;
        if (tag) {
            cursor += tag[0].length;
        } else if (char === '"') {
            const end = findQuotedTextEnd(text, cursor);
            if (end < 0) failTaggedJson(toolStart, 'JSON 外的说明文字引号未闭合');
            const next = skipWhitespace(text, end);
            if (text[next] === ':') failTaggedJson(toolStart, '完整 JSON 外出现字段，不能作为杂文剥离');
            cursor = end;
        } else if (char === '{' || char === '[') {
            const structure = scanJsonStructure(text, cursor);
            if (!isBracketedAnnotation(text, cursor, structure)) {
                failTaggedJson(toolStart, '同一工具块中存在多个 JSON 结构');
            }
            cursor = structure.end;
        } else {
            // Extra closers are outside an already complete envelope; they cannot change its fields.
            cursor += 1;
        }
    }
}

function findJsonToolClosing(text, start, toolStart) {
    let cursor = start;
    let token;
    while ((token = matchAt(/["<]/g, text, cursor))) {
        cursor = token.index;
        if (token[0] === '"') {
            const end = findQuotedTextEnd(text, cursor);
            if (end < 0) failTaggedJson(toolStart, 'JSON 外的说明文字引号未闭合');
            cursor = end;
        } else {
            const closing = matchAt(/<\/tool_call>/iy, text, cursor);
            if (closing) return closing;
            const tag = matchAt(DECORATION_TAG, text, cursor);
            cursor += tag?.[0].length || 1;
        }
    }
    return null;
}

function assertJsonToolEnvelope(payload, toolStart) {
    let parsed;
    try {
        parsed = JSON.parse(payload);
    } catch {
        return; // Existing argument repair owns malformed JSON inside the envelope.
    }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        && Object.keys(parsed).some(key => !['id', 'name', 'arguments'].includes(key))) {
        // An early arguments closer can move real parameters to the envelope root.
        // Stripping its extra final closer must never silently discard those fields.
        failTaggedJson(toolStart, '工具封装中存在 id、name、arguments 之外的字段，无法确定参数边界');
    }
}

function readJsonBlock(text, start) {
    const opening = matchAt(/<tool_call>/iy, text, start);
    if (!opening) return null;
    const payloadStart = start + opening[0].length;
    const envelope = findJsonEnvelope(text, payloadStart);
    if (envelope?.mismatched) failTaggedJson(start, 'JSON 括号不匹配，无法确定调用边界');
    // Even malformed JSON shields literal tool tags inside strings. An unfinished string cannot
    // fall back to its first literal closing tag and release embedded examples as real calls.
    const closing = findJsonToolClosing(text, envelope?.boundary ?? payloadStart, start);
    if (!closing) {
        if (envelope && matchAt(/<\/tool_call>/gi, text, envelope.start)) {
            failTaggedJson(start, '未找到 JSON 字符串之外的 tool_call 结束标签');
        }
        if (/<\/[｜|]+DSML[｜|]+/i.test(text.slice(payloadStart))) {
            failDsml(start, 'tool_call 开头与 DSML 结尾混用，无法确定调用边界');
        }
        return null;
    }
    let payload = text.slice(payloadStart, closing.index);
    const prefix = text.slice(payloadStart, envelope?.start ?? payloadStart);
    const suffix = text.slice(envelope?.boundary ?? payloadStart, closing.index);
    const nestedTool = /<tool_call\b|<[｜|]+DSML[｜|]+\s*(?:invoke|function_calls|calls)\b/i;
    if (nestedTool.test(prefix) || nestedTool.test(suffix)) {
        failTaggedJson(start, '同一工具块中出现另一条工具调用，不能作为杂文剥离');
    }
    if (envelope?.end >= 0) {
        assertJsonDecoration(prefix, start);
        assertJsonDecoration(suffix, start);
        payload = text.slice(envelope.start, envelope.end);
        assertJsonToolEnvelope(payload, start);
    }
    return { end: closing.index + closing[0].length, payload };
}

// Consume each block before looking for the next one: values cannot create extra calls.
// Nothing is returned until every DSML block has passed structural validation.
export function scanTextToolBlocks(text) {
    const blocks = [];
    let cursor = 0;
    let start;
    while ((start = findTextToolStart(text, cursor))) {
        if (/^<tool_call/i.test(start[0])) {
            const block = readJsonBlock(text, start.index);
            if (!block) break;
            blocks.push(block);
            cursor = block.end;
        } else {
            const block = readDsmlBlock(text, start.index);
            blocks.push(block);
            cursor = block.end;
        }
    }
    const partial = findPartialTextToolStart(text);
    if (partial >= cursor && /^<\/?[｜|]/.test(text.slice(partial))) {
        failDsml(partial, 'DSML 标记未输出完整');
    }
    return blocks;
}

export function findPartialTextToolStart(text) {
    const index = text.lastIndexOf('<');
    if (index < 0) return -1;
    const tail = text.slice(index).replace(/[｜|]+/g, '|').toLowerCase();
    return ['<tool_call', '<|dsml|', '</|dsml|'].some(prefix => prefix.startsWith(tail)) ? index : -1;
}
