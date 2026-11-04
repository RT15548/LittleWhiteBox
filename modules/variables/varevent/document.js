const FIELD_NAMES = { condition: 'condition', display: 'display', js_execute: 'js' };
const FIELD_KEYS = Object.fromEntries(Object.entries(FIELD_NAMES).map(([key, value]) => [value, key]));
const HEADER = /^\s*\[\s*event\.([^\]]+)]\s*$/i;
const FIELD = /^([ \t]*)(condition|display|js_execute)([ \t]*:[ \t]*)(.*)$/i;

function quotedEnd(source, start, limit = source.length) {
    const quote = source[start];
    for (let i = start + 1; i < limit; i++) {
        if (source[i] === '\\') { i++; continue; }
        if (source[i] === quote) return i + 1;
    }
    return -1;
}

function decodeQuoted(source) {
    // The editor writes JSON double-quoted strings. Historical single-quoted and
    // physical multiline fields only escape quotes; their JS backslashes are data.
    if (source[0] === '"' && !/[\r\n]/.test(source)) {
        try { return JSON.parse(source); } catch { return decodeLegacyQuoted(source); }
    }
    return decodeLegacyQuoted(source);
}

const decodeLegacyQuoted = source => source.slice(1, -1).replace(/\\(["'])/g, '$1');

export function parseEventBlock(source) {
    source = String(source);
    const lines = [...source.matchAll(/[^\n]*(?:\n|$)/g)].filter(match => match[0].length)
        .map(match => ({ text: match[0].replace(/\r?\n$/, ''), start: match.index, end: match.index + match[0].length }));
    const events = [];
    let current = null, prefixEnd = source.length;
    const open = (start, id, headerEnd = start) => {
        if (current) current.end = start;
        else prefixEnd = start;
        current = { values: { id }, original: null, start, end: source.length, headerEnd, fields: {} };
        events.push(current);
    };
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index], header = HEADER.exec(line.text);
        if (header) { open(line.start, header[1].trim(), line.end); continue; }
        const field = FIELD.exec(line.text);
        if (!field) continue;
        if (!current) open(line.start, '');
        const key = FIELD_NAMES[field[2].toLowerCase()];
        const valueStart = line.start + field[1].length + field[2].length + field[3].length;
        let next = index + 1;
        while (next < lines.length && !HEADER.test(lines[next].text) && !FIELD.test(lines[next].text)) next++;
        const fieldEnd = next < lines.length ? lines[next].start : source.length;
        let end, value;
        if (source[valueStart] === '"' || source[valueStart] === "'") {
            // A bad condition cannot consume the next event/field's quote. Keep
            // its source intact so evaluation reports that event and editing works.
            const close = quotedEnd(source, valueStart, key === 'condition' ? fieldEnd : source.length);
            const lineEnd = source.indexOf('\n', close);
            const rest = source.slice(close, lineEnd < 0 ? source.length : lineEnd).trim();
            // An expression beginning with a string literal is not a quoted whole field.
            if (close !== -1 && (key !== 'condition' || !rest)) {
                value = decodeQuoted(source.slice(valueStart, close));
                end = lineEnd < 0 ? source.length : lineEnd + 1;
            }
        }
        if (end === undefined) {
            end = fieldEnd;
            value = source.slice(valueStart, end).replace(/\r?\n$/, '');
        }
        current.values[key] = value;
        (current.fields[key] ||= []).push({ start: line.start, end, indent: field[1] });
        while (index + 1 < lines.length && lines[index + 1].start < end) index++;
    }
    for (const event of events) {
        event.source = source.slice(event.start, event.end);
        event.headerEnd -= event.start;
        for (const field of Object.values(event.fields).flat()) { field.start -= event.start; field.end -= event.start; }
        event.original = { ...event.values };
    }
    return { prefix: source.slice(0, prefixEnd), events };
}

export function parseVareventEvents(source) {
    return parseEventBlock(source).events.map(event => event.values);
}

export function newEvent(id) {
    return { values: { id: String(id), condition: '', display: '', js: '' }, original: null, source: '', fields: {} };
}

export function serializeEvent(event) {
    const eol = event.source.includes('\r\n') ? '\r\n' : '\n';
    const encode = (key, value, indent = '') => `${indent}${FIELD_KEYS[key]}: ${key === 'condition' ? value : JSON.stringify(value)}${eol}`;
    if (!event.original) {
        return `[event.${event.values.id}]${eol}` + Object.keys(FIELD_KEYS)
            .filter(key => event.values[key]).map(key => encode(key, event.values[key])).join('');
    }
    const edits = [];
    if (event.values.id !== event.original.id) edits.push({ start: 0, end: event.headerEnd, text: `[event.${event.values.id}]${eol}` });
    for (const key of Object.keys(FIELD_KEYS)) {
        const value = event.values[key] ?? '';
        if (value === (event.original[key] ?? '')) continue;
        const fields = event.fields[key];
        if (fields) fields.forEach((field, index) => edits.push({ ...field, text: value && index === fields.length - 1 ? encode(key, value, field.indent) : '' }));
        else if (value) edits.push({ start: event.source.length, end: event.source.length, text: encode(key, value) });
    }
    let source = event.source;
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
        const prefix = edit.start === event.source.length && source && !source.endsWith('\n') ? eol : '';
        source = source.slice(0, edit.start) + prefix + edit.text + source.slice(edit.end);
    }
    return source;
}

export function findVareventBlocks(text) {
    return [...String(text).matchAll(/(<\s*varevent\b[^>]*>)([\s\S]*?)(<\s*\/\s*varevent\s*>)/gi)]
        .map(match => ({ start: match.index, end: match.index + match[0].length, raw: match[0], open: match[1], inner: match[2], close: match[3] }));
}

export function createEventDocument(text) {
    const originals = findVareventBlocks(text);
    return { text, originals, groups: originals.map(original => ({ original, ...parseEventBlock(original.inner) })) };
}

export function newEventGroup() {
    return { original: null, prefix: '\n', events: [newEvent(1)] };
}

function serializeGroup(group) {
    let inner = group.prefix;
    for (const event of group.events) {
        const text = serializeEvent(event);
        if (inner && text && !inner.endsWith('\n')) inner += '\n';
        inner += text;
    }
    return `${group.original?.open || '<varevent>'}${inner}${group.original?.close || '</varevent>'}`;
}

export function serializeEventDocument(document) {
    let result = '', cursor = 0;
    for (const original of document.originals) {
        const group = document.groups.find(item => item.original === original);
        result += document.text.slice(cursor, original.start) + (group ? serializeGroup(group) : '');
        cursor = original.end;
    }
    result += document.text.slice(cursor);
    for (const group of document.groups.filter(item => !item.original)) {
        if (!group.events.some(event => ['condition', 'display', 'js'].some(key => event.values[key]))) continue;
        if (result && !result.endsWith('\n')) result += '\n';
        result += serializeGroup(group);
    }
    return result;
}
