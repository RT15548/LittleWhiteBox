import { applyPatchLineEdits } from './text-edit.js';

const INPUT_ERROR = 'apply_patch_invalid_input';
const PATCH_FILE_FIELDS = new Set(['path', 'content', 'delete', 'moveTo', 'edits']);
const PATCH_EDIT_FIELDS = new Set(['oldString', 'startLine', 'endLine', 'insertAtLine', 'newString']);
const isRecord = value => value && typeof value === 'object' && !Array.isArray(value);
const has = (record, key) => Object.hasOwn(record, key);
const isLine = value => Number.isSafeInteger(value) && value > 0;

export function patchError(code, message, details = {}) {
    return Object.assign(new Error(message), { patchIssue: { code, ...details, message } });
}

function invalid(message, details) {
    throw patchError(INPUT_ERROR, message, details);
}

function editMode(edit, details) {
    if (!isRecord(edit) || Object.keys(edit).some(key => !PATCH_EDIT_FIELDS.has(key)) || typeof edit.newString !== 'string') {
        invalid('Each edit needs a string newString and one valid location.', details);
    }
    const old = has(edit, 'oldString');
    const range = has(edit, 'startLine') || has(edit, 'endLine');
    const insert = has(edit, 'insertAtLine');
    if (Number(old) + Number(range) + Number(insert) !== 1) invalid('Choose oldString, startLine/endLine, or insertAtLine for this edit.', details);
    if (old && (typeof edit.oldString !== 'string' || edit.oldString === '')) invalid('oldString must be non-empty text.', details);
    if (range && (!isLine(edit.startLine) || !isLine(edit.endLine))) invalid('startLine and endLine must be positive integers.', details);
    if (insert && !isLine(edit.insertAtLine)) invalid('insertAtLine must be a positive integer.', details);
    return old ? 'text' : 'line';
}

export function parseApplyPatch(args) {
    if (!isRecord(args) || Object.keys(args).some(key => key !== 'files') || !Array.isArray(args.files) || !args.files.length) {
        invalid('Provide a non-empty files array.');
    }
    const operations = Array.from(args.files, (file, fileIndex) => {
        if (!isRecord(file) || typeof file.path !== 'string' || !file.path.trim()) invalid('Each file needs a path.', { fileIndex });
        const path = file.path.trim();
        const details = { path, fileIndex };
        if (Object.keys(file).some(key => !PATCH_FILE_FIELDS.has(key))) invalid('File entries use path with content, delete, moveTo, or edits.', details);
        const add = has(file, 'content');
        const remove = has(file, 'delete');
        const move = has(file, 'moveTo');
        const update = has(file, 'edits');
        if (add && !remove && !move && !update && typeof file.content === 'string') return { type: 'add', path, content: file.content };
        if (remove && !add && !move && !update && file.delete === true) return { type: 'delete', path };
        if (add || remove || (!move && !update)) invalid('Use content to add, delete: true to remove, or moveTo and/or edits for an existing file.', details);
        if (move && (typeof file.moveTo !== 'string' || !file.moveTo.trim())) invalid('moveTo must be a destination path.', details);
        if (update && (!Array.isArray(file.edits) || !file.edits.length)) invalid('edits must be a non-empty array.', details);
        const edits = update ? file.edits : [];
        const modes = Array.from(edits, (edit, editIndex) => editMode(edit, { ...details, editIndex }));
        if (new Set(modes).size > 1) invalid('Use either oldString or line numbers for all edits to this file.', details);
        return { type: 'update', path, moveTo: move ? file.moveTo.trim() : '', edits };
    });
    return { operations };
}

const MATCH_FALLBACKS = [
    line => line.trimEnd(),
    line => line.trim(),
    line => line.trim()
        .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
        .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
        .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-')
        .replace(/\u2026/g, '...')
        .replace(/\u00A0/g, ' '),
];

function textView(content) {
    const lineBreak = /\r\n|\r|\n/g;
    const lines = [];
    let start = 0;
    for (const match of content.matchAll(lineBreak)) {
        lines.push({ text: content.slice(start, match.index), start, end: match.index, separator: match[0] });
        start = match.index + match[0].length;
    }
    lines.push({ text: content.slice(start), start, end: content.length, separator: '' });
    return lines;
}

function exactMatches(lines, oldString) {
    const normalized = lines.map(line => line.text).join('\n');
    const matches = [];
    let index = normalized.indexOf(oldString);
    if (index < 0) return matches;
    const offsets = [];
    let offset = 0;
    let lineIndex = 0;
    for (const line of lines) {
        offsets.push(offset);
        offset += line.text.length + 1;
    }
    const originalOffset = target => {
        while (lineIndex + 1 < offsets.length && offsets[lineIndex + 1] <= target) lineIndex++;
        return lines[lineIndex].start + target - offsets[lineIndex];
    };
    while (index >= 0 && matches.length < 2) {
        const start = originalOffset(index);
        // Only the first match needs an end; a second start proves ambiguity.
        if (matches.length) matches.push({ start });
        else {
            matches.push({ start, end: originalOffset(index + oldString.length) });
            // A second match may overlap the first one.
            lineIndex = 0;
        }
        index = normalized.indexOf(oldString, index + 1);
    }
    return matches;
}

function lineMatches(lines, oldLines, project) {
    const needle = oldLines.map(project);
    const actual = lines.map(({ text }) => project(text));
    const matches = [];
    for (let index = 0; index <= lines.length - needle.length && matches.length < 2; index++) {
        if (needle.every((line, offset) => actual[index + offset] === line)) {
            matches.push({ start: lines[index].start, end: lines[index + needle.length - 1].end });
        }
    }
    return matches;
}

function applyTextReplacements(original, edits, path) {
    let content = original;
    const results = edits.map(({ oldString, newString }, editIndex) => {
        const lines = textView(content);
        const oldText = oldString.replace(/\r\n?/g, '\n');
        // A fragment can match exactly anywhere. The existing loose patch
        // profiles still apply to complete lines, never to surrounding code.
        let matches = exactMatches(lines, oldText);
        if (!matches.length) {
            const oldLines = oldText.split('\n');
            const hasTerminalMarker = lines.at(-1).start === content.length;
            const matchableLines = hasTerminalMarker && !oldText.endsWith('\n') ? lines.slice(0, -1) : lines;
            for (const project of MATCH_FALLBACKS) {
                matches = lineMatches(matchableLines, oldLines, project);
                if (matches.length) break;
            }
        }
        if (matches.length !== 1) {
            const ambiguous = matches.length > 1;
            throw patchError(ambiguous ? 'ambiguous_block_match' : 'missing_block_match',
                ambiguous ? 'oldString matches more than one location.' : 'oldString was not found in the current file.', { path, editIndex });
        }
        const [{ start, end }] = matches;
        const separator = lines.find(line => line.end >= start && line.separator)?.separator
            || lines.find(line => line.separator)?.separator || '\n';
        const replacement = newString.replace(/\r\n?|\n/g, separator);
        content = content.slice(0, start) + replacement + content.slice(end);
        return { index: editIndex, matchedBy: 'old_string' };
    });
    return { content, results };
}

export function applyPatchUpdateToText(content, edits, path) {
    if (has(edits[0], 'oldString')) return applyTextReplacements(content, edits, path);
    const result = applyPatchLineEdits(content, edits);
    if (!result.ok) {
        const failure = result.results.find(item => !item.ok);
        throw patchError(failure.error, failure.message, { path, editIndex: failure.index, suggestion: failure.suggestion });
    }
    return { content: result.content, results: result.results };
}
