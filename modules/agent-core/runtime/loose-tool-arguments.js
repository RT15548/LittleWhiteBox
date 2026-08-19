function isEscapedBackslash(text = '', index = 0) {
    let count = 0;
    for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor -= 1) {
        count += 1;
    }
    return count % 2 === 1;
}

function isHex4(value = '') {
    return /^[0-9a-fA-F]{4}$/.test(value);
}

function isHighSurrogateHex(value = '') {
    return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(value);
}

function isLowSurrogateHex(value = '') {
    return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(value);
}

function decodeLooseUnicodeEscapes(value = '') {
    const text = String(value ?? '');
    let decoded = '';
    let index = 0;
    while (index < text.length) {
        const marker = text.slice(index, index + 2);
        const hex = text.slice(index + 2, index + 6);
        if (marker !== '\\u' || isEscapedBackslash(text, index) || !isHex4(hex)) {
            decoded += text[index] || '';
            index += 1;
            continue;
        }

        const nextMarkerIndex = index + 6;
        const lowHex = text.slice(nextMarkerIndex + 2, nextMarkerIndex + 6);
        if (
            isHighSurrogateHex(hex)
            && text.slice(nextMarkerIndex, nextMarkerIndex + 2) === '\\u'
            && !isEscapedBackslash(text, nextMarkerIndex)
            && isLowSurrogateHex(lowHex)
        ) {
            const highCode = Number.parseInt(hex, 16);
            const lowCode = Number.parseInt(lowHex, 16);
            const codePoint = 0x10000 + ((highCode - 0xD800) << 10) + (lowCode - 0xDC00);
            decoded += String.fromCodePoint(codePoint);
            index += 12;
            continue;
        }

        decoded += String.fromCharCode(Number.parseInt(hex, 16));
        index += 6;
    }
    return decoded;
}

function stripLooseJsonValue(value = '') {
    let text = String(value ?? '').trim();
    if (text.endsWith(',')) text = text.slice(0, -1).trimEnd();
    if (text.startsWith('\\"')) text = text.slice(2);
    if (text.endsWith('\\"')) text = text.slice(0, -2);
    if (text.startsWith('"')) text = text.slice(1);
    if (text.endsWith('"')) text = text.slice(0, -1);
    const decodedText = text
        .replace(/\r\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"');
    return decodeLooseUnicodeEscapes(decodedText).replace(/\\\\/g, '\\');
}

function escapeRegExp(value = '') {
    return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function findLooseKeyMatch(text = '', key = '', fromIndex = 0) {
    const pattern = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${escapeRegExp(key)}(?:\\\\?")?\\s*:`, 'i');
    const slice = String(text || '').slice(Math.max(0, fromIndex));
    const match = slice.match(pattern);
    if (!match || match.index === undefined) return null;
    const prefixLength = match[1]?.length || 0;
    const index = Math.max(0, fromIndex) + match.index + prefixLength;
    return {
        key,
        index,
        end: Math.max(0, fromIndex) + match.index + match[0].length,
    };
}

function findNextLooseKeyMatch(text = '', keys = [], fromIndex = 0) {
    return keys
        .map((key) => findLooseKeyMatch(text, key, fromIndex))
        .filter(Boolean)
        .sort((left, right) => left.index - right.index)[0] || null;
}

export function extractLooseField(text = '', key = '', nextKeys = []) {
    const source = String(text || '');
    const match = findLooseKeyMatch(source, key);
    if (!match) return undefined;
    let valueStart = match.end;
    while (/\s/.test(source[valueStart] || '')) valueStart += 1;
    const quoted = source[valueStart] === '"';
    if (quoted) valueStart += 1;
    const nextMatch = findNextLooseKeyMatch(source, nextKeys.filter((item) => item !== key), valueStart);
    let valueEnd = nextMatch ? nextMatch.index : source.length;
    if (nextMatch) {
        const commaBeforeNextKey = source.lastIndexOf(',', nextMatch.index);
        if (commaBeforeNextKey >= valueStart) valueEnd = commaBeforeNextKey;
    }
    let rawValue = source.slice(valueStart, valueEnd).trim();
    if (!nextMatch) {
        rawValue = rawValue.replace(/\}\s*$/, '').trimEnd();
    }
    return stripLooseJsonValue(rawValue);
}

function parseLoosePrimitive(value = '') {
    const text = String(value ?? '').trim();
    if (/^-?\d+(?:\.\d+)?$/.test(text)) return Number(text);
    if (/^true$/i.test(text)) return true;
    if (/^false$/i.test(text)) return false;
    if (/^null$/i.test(text)) return null;
    return text;
}

const LOOSE_ARGUMENT_KEYS_BY_TOOL = {
    Read: ['filePath', 'path', 'scope', 'fromLine', 'toLine', 'tail', 'offset', 'limit', 'outputMode', 'contentFormat'],
    Write: ['filePath', 'path', 'content'],
    Edit: ['filePath', 'path', 'edits'],
    Delete: ['filePath', 'path'],
    Move: ['fromPath', 'toPath', 'filePath', 'path'],
    RenameBook: ['title', 'name'],
    ImportMaterial: ['title', 'content', 'source'],
    Glob: ['pattern', 'path', 'scope'],
    Grep: ['pattern', 'query', 'path', 'scope', 'include', 'outputMode', 'limit', 'offset', 'contextLines', 'useRegex'],
    MapDocs: ['docType', 'docId', 'limit', 'offset'],
    MapInspect: ['docType', 'docId', 'mode', 'elementId', 'locationKey', 'actorKey', 'from', 'to', 'kind', 'status', 'query', 'parent', 'limit', 'offset'],
    MapPatch: ['docType', 'docId', 'expectedRevision', 'activate', 'dryRun', 'ops'],
    MemoryRead: ['filePath', 'path', 'offset', 'limit', 'tail'],
    MemoryWrite: ['filePath', 'path', 'content'],
    MemoryEdit: ['filePath', 'path', 'edits'],
    MemoryGrep: ['pattern', 'query', 'filePath', 'path', 'scope', 'outputMode', 'limit', 'offset', 'contextLines', 'regex', 'useRegex'],
    ChatHistory: ['mode', 'limit', 'offset', 'startOrder', 'endOrder', 'pattern', 'query', 'regex', 'useRegex', 'full'],
    WebSearch: ['query', 'maxResults'],
    DelegateRun: ['task'],
    PlanCreate: ['title', 'details', 'priority', 'owner', 'blockedBy'],
    PlanUpdate: ['id', 'status', 'details', 'priority', 'owner', 'blockedBy'],
    PlanList: ['status'],
    apply_patch: ['patchText'],
};

const GENERIC_LOOSE_ARGUMENT_KEYS = [
    'filePath',
    'path',
    'fromPath',
    'toPath',
    'content',
    'edits',
    'patchText',
    'query',
    'task',
    'title',
    'details',
    'pattern',
    'scope',
    'include',
    'status',
    'priority',
    'owner',
    'blockedBy',
    'fromLine',
    'toLine',
    'tail',
    'maxResults',
    'outputMode',
    'contentFormat',
    'limit',
    'offset',
    'contextLines',
    'useRegex',
    'regex',
    'mode',
    'docType',
    'docId',
    'expectedRevision',
    'activate',
    'dryRun',
    'ops',
    'op',
    'eventId',
    'fingerprint',
    'vision',
    'doneWhen',
    'hookForModel',
    'startOrder',
    'endOrder',
    'full',
];

function extractFirstLooseField(source = '', keys = [], nextKeys = []) {
    for (const key of keys) {
        const value = extractLooseField(source, key, nextKeys);
        if (value !== undefined) return value;
    }
    return undefined;
}

function parseKnownLooseArgumentsObject(source = '', toolName = '') {
    if (toolName === 'Read') {
        const keys = LOOSE_ARGUMENT_KEYS_BY_TOOL.Read;
        const args = {};
        keys.forEach((key, index) => {
            const value = extractLooseField(source, key, keys.slice(index + 1));
            if (value === undefined) return;
            args[key] = parseLoosePrimitive(value);
        });
        if (args.filePath === undefined && args.path !== undefined) {
            args.filePath = args.path;
            delete args.path;
        }
        if (args.filePath === undefined && args.scope !== undefined) {
            args.filePath = args.scope;
            delete args.scope;
        }
        return Object.keys(args).length ? args : null;
    }

    if (toolName === 'Write') {
        const args = {};
        const filePath = extractFirstLooseField(source, ['filePath', 'path'], ['content']);
        const content = extractLooseField(source, 'content', []);
        if (filePath !== undefined) args.filePath = parseLoosePrimitive(filePath);
        if (content !== undefined) args.content = parseLoosePrimitive(content);
        return Object.keys(args).length ? args : null;
    }

    if (toolName === 'Edit') {
        const args = {};
        const filePath = extractFirstLooseField(source, ['filePath', 'path'], ['edits']);
        const edits = extractLooseField(source, 'edits', []);
        if (filePath !== undefined) args.filePath = parseLoosePrimitive(filePath);
        if (edits !== undefined) args.edits = parseLoosePrimitive(edits);
        return Object.keys(args).length ? args : null;
    }

    if (toolName === 'Grep') {
        const keys = LOOSE_ARGUMENT_KEYS_BY_TOOL.Grep;
        const args = {};
        keys.forEach((key) => {
            const value = extractLooseField(source, key, keys.filter((item) => item !== key));
            if (value === undefined) return;
            args[key] = parseLoosePrimitive(value);
        });
        if (args.pattern === undefined && args.query !== undefined) {
            args.pattern = args.query;
        }
        if (args.path === undefined && args.scope !== undefined) {
            args.path = args.scope;
        }
        return Object.keys(args).length ? args : null;
    }

    if (toolName === 'MemoryGrep') {
        const keys = LOOSE_ARGUMENT_KEYS_BY_TOOL.MemoryGrep;
        const args = {};
        keys.forEach((key) => {
            const value = extractLooseField(source, key, keys.filter((item) => item !== key));
            if (value === undefined) return;
            args[key] = parseLoosePrimitive(value);
        });
        if (args.pattern === undefined && args.query !== undefined) {
            args.pattern = args.query;
        }
        if (args.path === undefined && args.scope !== undefined) {
            args.path = args.scope;
        }
        if (args.regex === undefined && args.useRegex !== undefined) {
            args.regex = args.useRegex;
        }
        return Object.keys(args).length ? args : null;
    }

    if (toolName === 'ChatHistory') {
        const keys = LOOSE_ARGUMENT_KEYS_BY_TOOL.ChatHistory;
        const args = {};
        keys.forEach((key) => {
            const value = extractLooseField(source, key, keys.filter((item) => item !== key));
            if (value === undefined) return;
            args[key] = parseLoosePrimitive(value);
        });
        if (args.pattern === undefined && args.query !== undefined) {
            args.pattern = args.query;
        }
        if (args.regex === undefined && args.useRegex !== undefined) {
            args.regex = args.useRegex;
        }
        return Object.keys(args).length ? args : null;
    }

    return null;
}

export function parseLooseArgumentsObject(text = '', toolName = '') {
    const source = String(text || '').trim();
    if (!source) return null;
    try {
        const parsed = JSON.parse(source);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {
        // Fall through to key-based recovery.
    }
    const knownParsed = parseKnownLooseArgumentsObject(source, toolName);
    if (knownParsed) return knownParsed;
    const keys = LOOSE_ARGUMENT_KEYS_BY_TOOL[toolName] || GENERIC_LOOSE_ARGUMENT_KEYS;
    const args = {};
    keys.forEach((key, index) => {
        const value = extractLooseField(source, key, keys.slice(index + 1));
        if (value === undefined) return;
        args[key] = parseLoosePrimitive(value);
    });
    return Object.keys(args).length ? args : null;
}

export function repairLooseToolArguments(text = '', toolName = '') {
    const parsed = parseLooseArgumentsObject(text, toolName);
    return parsed ? JSON.stringify(parsed) : '';
}
