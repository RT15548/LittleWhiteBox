const CONTEXT_RADIUS = 24;
const MIN_FLEXIBLE_WHITESPACE_CHARS = 24;
const EDIT_RESULT_PREVIEW_CHARS = 240;

const NORMALIZE_CHAR_MAP = new Map([
    ['“', '"'],
    ['”', '"'],
    ['＂', '"'],
    ['「', '"'],
    ['」', '"'],
    ['『', '"'],
    ['』', '"'],
    ['‘', "'"],
    ['’', "'"],
    ['，', ','],
    ['。', '.'],
    ['：', ':'],
    ['；', ';'],
    ['？', '?'],
    ['！', '!'],
    ['（', '('],
    ['）', ')'],
]);

function normalizeEquivalentText(text = '') {
    return Array.from(String(text ?? ''), (char) => NORMALIZE_CHAR_MAP.get(char) || char).join('');
}

function buildCompactWhitespaceIndex(text = '') {
    let compact = '';
    const positions = [];
    let offset = 0;
    for (const char of String(text ?? '')) {
        const start = offset;
        offset += char.length;
        if (/\s/u.test(char)) continue;
        compact += normalizeEquivalentText(char);
        positions.push({ start, end: offset });
    }
    return { compact, positions };
}

function findAllRanges(text = '', needle = '') {
    if (!needle) return [];
    const ranges = [];
    let index = 0;
    while (index <= text.length) {
        const found = text.indexOf(needle, index);
        if (found < 0) break;
        ranges.push({ start: found, end: found + needle.length, equivalent: false });
        index = found + Math.max(needle.length, 1);
    }
    return ranges;
}

function findEquivalentRanges(text = '', needle = '') {
    const normalizedText = normalizeEquivalentText(text);
    const normalizedNeedle = normalizeEquivalentText(needle);
    if (!normalizedNeedle || normalizedNeedle === needle && normalizedText === text) return [];
    return findAllRanges(normalizedText, normalizedNeedle).map((range) => ({
        ...range,
        equivalent: true,
    }));
}

function findFlexibleWhitespaceRanges(text = '', needle = '') {
    const haystack = buildCompactWhitespaceIndex(text);
    const target = buildCompactWhitespaceIndex(needle);
    if (target.compact.length < MIN_FLEXIBLE_WHITESPACE_CHARS) return [];
    if (!target.compact || target.compact === needle && haystack.compact === text) return [];
    return findAllRanges(haystack.compact, target.compact)
        .map((range) => {
            const first = haystack.positions[range.start];
            const last = haystack.positions[range.end - 1];
            if (!first || !last) return null;
            return {
                start: first.start,
                end: last.end,
                equivalent: true,
                flexibleWhitespace: true,
            };
        })
        .filter(Boolean);
}

function lineNumberAt(text = '', index = 0) {
    let line = 1;
    const limit = Math.max(0, Math.min(index, text.length));
    for (let cursor = 0; cursor < limit; cursor += 1) {
        if (text[cursor] === '\n') line += 1;
    }
    return line;
}

function contextForRange(text = '', range = {}) {
    const start = Math.max(0, Number(range.start) - CONTEXT_RADIUS);
    const end = Math.min(text.length, Number(range.end) + CONTEXT_RADIUS);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < text.length ? '...' : '';
    return `${prefix}${text.slice(start, end).replace(/\s+/g, ' ')}${suffix}`;
}

function numberPreviewLines(lines = [], startLine = 1, limit = 8) {
    const selected = lines.slice(0, limit);
    const suffix = lines.length > limit ? '\n...' : '';
    return `${selected.map((line, index) => `${startLine + index}: ${line}`).join('\n')}${suffix}`;
}

function textPreview(text = '', limit = EDIT_RESULT_PREVIEW_CHARS) {
    const normalized = String(text ?? '').replace(/\r\n/g, '\n');
    return normalized.length > limit ? `${normalized.slice(0, limit)}...` : normalized;
}

function buildMatches(text = '', ranges = []) {
    return ranges.slice(0, 8).map((range) => ({
        line: lineNumberAt(text, range.start),
        context: contextForRange(text, range),
    }));
}

function convertAlternatingQuotes(text = '', quotePattern = /"/g, open = '“', close = '”') {
    let nextOpen = true;
    return text.replace(quotePattern, () => {
        const replacement = nextOpen ? open : close;
        nextOpen = !nextOpen;
        return replacement;
    });
}

function adaptReplacementStyle(replacement = '', matchedText = '') {
    let next = String(replacement ?? '');
    if (/[“”]/.test(matchedText)) next = convertAlternatingQuotes(next, /"/g, '“', '”');
    else if (/[「」]/.test(matchedText)) next = convertAlternatingQuotes(next, /"/g, '「', '」');
    else if (/[『』]/.test(matchedText)) next = convertAlternatingQuotes(next, /"/g, '『', '』');

    if (/[‘’]/.test(matchedText)) next = convertAlternatingQuotes(next, /'/g, '‘', '’');
    if (matchedText.includes('，')) next = next.replaceAll(',', '，');
    if (matchedText.includes('。')) next = next.replaceAll('.', '。');
    if (matchedText.includes('：')) next = next.replaceAll(':', '：');
    if (matchedText.includes('；')) next = next.replaceAll(';', '；');
    if (matchedText.includes('？')) next = next.replaceAll('?', '？');
    if (matchedText.includes('！')) next = next.replaceAll('!', '！');
    if (matchedText.includes('（')) next = next.replaceAll('(', '（');
    if (matchedText.includes('）')) next = next.replaceAll(')', '）');
    return next;
}

function findReplacementRanges(content = '', oldString = '') {
    const exact = findAllRanges(content, oldString);
    if (exact.length) return exact;
    const equivalent = findEquivalentRanges(content, oldString);
    if (equivalent.length) return equivalent;
    return findFlexibleWhitespaceRanges(content, oldString);
}

function compactComparableLength(text = '') {
    return buildCompactWhitespaceIndex(text).compact.length;
}

function isSpecificEnoughForAlreadySatisfied(text = '', minimumLength = 8) {
    return compactComparableLength(text) >= minimumLength;
}

function containsEquivalentText(haystack = '', needle = '') {
    if (!needle) return false;
    return findReplacementRanges(haystack, needle).length > 0;
}

function isOldStringEditCoveredByPreviousReplacement(edit = {}, replacements = []) {
    const oldString = typeof edit.oldString === 'string' ? edit.oldString : String(edit.oldString ?? '');
    const newString = typeof edit.newString === 'string' ? edit.newString : String(edit.newString ?? '');

    return replacements.some((replacement = {}) => {
        const matchedText = String(replacement.matchedText ?? '');
        const replacementText = String(replacement.replacement ?? '');
        if (matchedText === oldString && replacementText === newString) return true;
        if (!isSpecificEnoughForAlreadySatisfied(oldString, 8)) return false;
        if (newString !== '' && !isSpecificEnoughForAlreadySatisfied(newString, 8)) return false;
        if (!containsEquivalentText(matchedText, oldString)) return false;
        if (containsEquivalentText(replacementText, oldString)) return false;
        return newString === '' || containsEquivalentText(replacementText, newString);
    });
}

function buildPossibleAlreadyAppliedDiagnostic(content = '', oldString = '', newString = '') {
    if (!newString || !isSpecificEnoughForAlreadySatisfied(newString, 16)) return {};
    const oldMatches = oldString ? findReplacementRanges(content, oldString).length : 0;
    const newMatches = findReplacementRanges(content, newString).length;
    if (oldMatches !== 0 || newMatches <= 0) return {};
    return {
        uncertain: true,
        possibleAlreadyApplied: true,
        newStringMatches: newMatches,
    };
}

function applyRanges(content = '', ranges = [], newString = '') {
    let nextContent = content;
    const replacements = [];
    const replacementDetails = [];
    ranges
        .slice()
        .sort((left, right) => right.start - left.start)
        .forEach((range) => {
            const matchedText = content.slice(range.start, range.end);
            const replacement = range.equivalent ? adaptReplacementStyle(newString, matchedText) : newString;
            replacements.push(replacement);
            replacementDetails.push({ matchedText, replacement });
            nextContent = `${nextContent.slice(0, range.start)}${replacement}${nextContent.slice(range.end)}`;
        });
    return {
        content: nextContent,
        replacements,
        replacementDetails,
        matchedBy: ranges.some((range) => range.flexibleWhitespace)
            ? 'flexible_whitespace'
            : ranges.some((range) => range.equivalent)
                ? 'punctuation_equivalent'
                : 'exact',
    };
}

function buildFailure(error = '', message = '', extra = {}) {
    return {
        ok: false,
        error,
        message,
        ...extra,
    };
}

function buildEditFailure(error = '', message = '', suggestion = '', extra = {}) {
    return buildFailure(error, message, suggestion ? { suggestion, ...extra } : extra);
}

const EDIT_ITEM_KEYS = new Set(['oldString', 'newString', 'startLine', 'endLine', 'insertAtLine', 'replaceAll']);

function lastMatchForKey(matches = [], key = '') {
    for (let index = matches.length - 1; index >= 0; index -= 1) {
        if (matches[index]?.[1] === key) return matches[index];
    }
    return null;
}

function firstLikelyModeMatchAfter(matches = [], position = 0) {
    const startLine = lastMatchForKey(matches, 'startLine');
    const endLine = lastMatchForKey(matches, 'endLine');
    const insertAtLine = lastMatchForKey(matches, 'insertAtLine');
    const oldString = lastMatchForKey(matches, 'oldString');
    const anchors = [];
    if (startLine && endLine) anchors.push(startLine, endLine);
    else if (insertAtLine) anchors.push(insertAtLine);
    else if (oldString) anchors.push(oldString);
    return anchors
        .filter((match) => match.index > position)
        .sort((left, right) => left.index - right.index)[0] || null;
}

function stripLooseValueQuotes(value = '') {
    let text = String(value ?? '').trim();
    if (text.endsWith(',')) text = text.slice(0, -1).trimEnd();
    if (text.startsWith('"')) text = text.slice(1);
    if (text.endsWith('"')) text = text.slice(0, -1);
    return text
        .replace(/\\r/g, '\r')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
}

function parseLooseEditItem(itemText = '') {
    const source = String(itemText || '').trim().replace(/^\{/, '').replace(/\}$/, '');
    const matches = [...source.matchAll(/"?([A-Za-z][A-Za-z0-9_]*)"?\s*:/g)]
        .filter((match) => EDIT_ITEM_KEYS.has(match[1]));
    if (!matches.length) return null;
    const knownModeMatches = matches.filter((match) => match[1] !== 'newString');
    const lastKnownModeMatch = knownModeMatches[knownModeMatches.length - 1] || null;

    const item = {};
    for (let index = 0; index < matches.length; index += 1) {
        const match = matches[index];
        const key = match[1];
        const valueStart = match.index + match[0].length;
        const alreadyHasMode = hasOldStringMode(item) || hasLineRange(item) || hasInsertLine(item);
        const nextMatch = key === 'newString'
            ? (!alreadyHasMode && lastKnownModeMatch && lastKnownModeMatch.index > match.index ? firstLikelyModeMatchAfter(matches, match.index) : null)
            : matches[index + 1];
        let valueEnd = nextMatch ? nextMatch.index : source.length;
        if (nextMatch) {
            const commaBeforeNextKey = source.lastIndexOf(',', nextMatch.index);
            if (commaBeforeNextKey >= valueStart) valueEnd = commaBeforeNextKey;
        }
        const rawValue = source.slice(valueStart, valueEnd).trim();
        if (key === 'startLine' || key === 'endLine' || key === 'insertAtLine') {
            const numberMatch = rawValue.match(/-?\d+/);
            if (numberMatch) item[key] = Number(numberMatch[0]);
            continue;
        }
        if (key === 'replaceAll') {
            item[key] = /^true\b/i.test(rawValue);
            continue;
        }
        item[key] = stripLooseValueQuotes(rawValue);
        if (key === 'newString' && !nextMatch) break;
    }

    const hasMode = hasOldStringMode(item) || hasLineRange(item) || hasInsertLine(item);
    return hasMode && Object.hasOwn(item, 'newString') ? item : null;
}

function isRecoverableEditItem(item) {
    return item
        && typeof item === 'object'
        && !Array.isArray(item)
        && Object.hasOwn(item, 'newString')
        && (hasOldStringMode(item) || hasLineRange(item) || hasInsertLine(item));
}

function looksLikeLooseEditSegment(text = '') {
    return /"?newString"?\s*:/i.test(text)
        && /"?(?:oldString|startLine|endLine|insertAtLine)"?\s*:/i.test(text);
}

function splitLooseEditItems(raw = '') {
    const text = String(raw || '').trim();
    if (!text.startsWith('[') || !text.endsWith(']')) return [];
    const body = text.slice(1, -1).trim();
    if (!body) return [];
    const delimiters = [...body.matchAll(/\}\s*,\s*\{(?=\s*"?(?:oldString|newString|startLine|endLine|insertAtLine|replaceAll)"?\s*:)/g)]
        .map((match) => ({
            index: match.index,
            splitEnd: match.index + 1,
            nextStart: match.index + match[0].lastIndexOf('{'),
        }));
    const chunks = [];
    let start = 0;
    delimiters.forEach((delimiter, index) => {
        const nextDelimiter = delimiters[index + 1];
        const left = body.slice(start, delimiter.splitEnd);
        const right = body.slice(delimiter.nextStart, nextDelimiter?.splitEnd ?? body.length);
        if (!looksLikeLooseEditSegment(left) || !looksLikeLooseEditSegment(right)) return;
        chunks.push(left);
        start = delimiter.nextStart;
    });
    chunks.push(body.slice(start));
    return chunks.map((chunk) => chunk.trim()).filter(Boolean);
}

function parseLooseEditsString(raw = '') {
    const chunks = splitLooseEditItems(raw);
    if (!chunks.length) return null;
    const edits = chunks.map((chunk) => {
        try {
            const parsed = JSON.parse(chunk);
            return isRecoverableEditItem(parsed) ? parsed : null;
        } catch {
            return parseLooseEditItem(chunk);
        }
    });
    return edits.every((item) => item && typeof item === 'object') ? edits : null;
}

function hasActiveModeField(edit = {}, key = '') {
    if (!Object.hasOwn(edit, key)) return false;
    const value = edit[key];
    return value !== undefined && value !== null && value !== '';
}

function hasOldStringMode(edit = {}) {
    return hasActiveModeField(edit, 'oldString');
}

function hasLineRange(edit = {}) {
    return hasActiveModeField(edit, 'startLine') || hasActiveModeField(edit, 'endLine');
}

function hasInsertLine(edit = {}) {
    return hasActiveModeField(edit, 'insertAtLine');
}

function toPositiveInteger(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : 0;
}

function getEditMode(edit = {}) {
    const startLine = toPositiveInteger(edit.startLine);
    const endLine = toPositiveInteger(edit.endLine);
    if (startLine && endLine) return 'line_range';
    if (toPositiveInteger(edit.insertAtLine)) return 'line_insert';
    if (hasOldStringMode(edit)) return 'old_string';
    if (hasLineRange(edit)) return 'line_range';
    if (hasInsertLine(edit)) return 'line_insert';
    return 'old_string';
}

function normalizeEditForMode(edit = {}, mode = '') {
    const newString = typeof edit.newString === 'string' ? edit.newString : String(edit.newString ?? '');
    if (mode === 'line_range') {
        return {
            startLine: edit.startLine,
            endLine: edit.endLine,
            newString,
        };
    }
    if (mode === 'line_insert') {
        return {
            insertAtLine: edit.insertAtLine,
            newString,
        };
    }
    return {
        oldString: typeof edit.oldString === 'string' ? edit.oldString : String(edit.oldString ?? ''),
        newString,
        replaceAll: !!edit.replaceAll,
    };
}

function describeEditForResult(edit = {}, mode = '') {
    if (mode === 'line_range') {
        return {
            mode,
            startLine: edit.startLine,
            endLine: edit.endLine,
            newPreview: textPreview(edit.newString),
        };
    }
    if (mode === 'line_insert') {
        return {
            mode,
            insertAtLine: edit.insertAtLine,
            newPreview: textPreview(edit.newString),
        };
    }
    return {
        mode,
        oldPreview: textPreview(edit.oldString),
        newPreview: textPreview(edit.newString),
        replaceAll: !!edit.replaceAll || undefined,
    };
}

function attachEditResultIdentities(results = [], editList = [], modeList = []) {
    return results.map((result, index) => {
        if (!result || typeof result !== 'object') return result;
        const mode = modeList[index] || getEditMode(editList[index] || {});
        if (result.ok) {
            return Object.hasOwn(result, 'index') ? result : { ...result, index };
        }
        const resultIndex = Object.hasOwn(result, 'index') ? result.index : index;
        return {
            ...describeEditForResult(editList[index] || {}, mode),
            ...result,
            index: resultIndex,
        };
    });
}

function splitFileLines(text = '') {
    return String(text ?? '').replace(/\r\n/g, '\n').split('\n');
}

function splitReplacementLines(text = '') {
    if (text === '') return [];
    const lines = String(text ?? '').replace(/\r\n/g, '\n').split('\n');
    if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
    const nonEmpty = lines.filter((line) => line.trim());
    const hasReadLineNumbers = nonEmpty.length > 0
        && nonEmpty.every((line) => /^\s*\d+:\s?/.test(line));
    return hasReadLineNumbers
        ? lines.map((line) => (line.trim() ? line.replace(/^\s*\d+:\s?/, '') : line))
        : lines;
}

function applyLineRangeEdits(content = '', editList = []) {
    const originalLines = splitFileLines(content);
    const results = new Array(editList.length);
    const normalized = editList.map((edit = {}, index) => {
        const startLine = toPositiveInteger(edit.startLine);
        const endLine = toPositiveInteger(edit.endLine);
        const newString = typeof edit.newString === 'string' ? edit.newString : String(edit.newString ?? '');
        const replacementLines = splitReplacementLines(newString);
        return {
            edit,
            index,
            startLine,
            endLine,
            newString,
            replacementLines,
        };
    });

    normalized.forEach((item) => {
        if (!item.startLine || !item.endLine) {
            results[item.index] = buildEditFailure(
                'invalid_line_range',
                'startLine and endLine must be positive integers',
                'Use line numbers from the latest Read result, with startLine <= endLine.',
            );
            return;
        }
        if (item.endLine < item.startLine) {
            results[item.index] = buildEditFailure(
                'invalid_line_range',
                'endLine must be greater than or equal to startLine',
                'Use an inclusive line range from the latest Read result.',
            );
            return;
        }
        if (item.endLine > originalLines.length) {
            results[item.index] = buildEditFailure(
                'line_range_out_of_bounds',
                `Line range ${item.startLine}-${item.endLine} is outside the file`,
                `Read the current file again. This file has ${originalLines.length} lines.`,
            );
        }
    });

    const sorted = normalized
        .slice()
        .sort((left, right) => left.startLine - right.startLine || left.endLine - right.endLine);
    sorted.forEach((item, sortedIndex) => {
        if (results[item.index]) return;
        const previous = sorted[sortedIndex - 1];
        if (previous && !results[previous.index] && item.startLine <= previous.endLine) {
            results[previous.index] = buildEditFailure(
                'overlapping_line_ranges',
                `Line range ${previous.startLine}-${previous.endLine} overlaps ${item.startLine}-${item.endLine}`,
                'Merge overlapping line edits into one larger startLine/endLine replacement.',
            );
            results[item.index] = buildEditFailure(
                'overlapping_line_ranges',
                `Line range ${item.startLine}-${item.endLine} overlaps ${previous.startLine}-${previous.endLine}`,
                'Merge overlapping line edits into one larger startLine/endLine replacement.',
            );
        }
    });

    const nextLines = originalLines.slice();
    normalized
        .slice()
        .sort((left, right) => right.startLine - left.startLine || right.endLine - left.endLine)
        .forEach((item) => {
            if (results[item.index]) return;
            const oldLines = originalLines.slice(item.startLine - 1, item.endLine);
            nextLines.splice(item.startLine - 1, item.endLine - item.startLine + 1, ...item.replacementLines);
            results[item.index] = {
                ok: true,
                index: item.index,
                startLine: item.startLine,
                endLine: item.endLine,
                replacements: 1,
                matchedBy: 'line_range',
                oldPreview: numberPreviewLines(oldLines, item.startLine),
                newPreview: numberPreviewLines(item.replacementLines, item.startLine),
            };
        });

    const failedCount = results.filter((result) => result && !result.ok).length;
    const appliedCount = results.filter((result) => result && result.ok).length;
    return {
        ok: failedCount === 0,
        partial: appliedCount > 0 && failedCount > 0 ? true : undefined,
        content: nextLines.join('\n'),
        results: attachEditResultIdentities(results, editList, editList.map(() => 'line_range')),
    };
}

function getInsertableLineCount(content = '') {
    return content === '' ? 0 : splitFileLines(content).length;
}

function applyLineInsertEdits(content = '', editList = []) {
    const originalLines = content === '' ? [] : splitFileLines(content);
    const lineCount = getInsertableLineCount(content);
    const results = new Array(editList.length);
    const normalized = editList.map((edit = {}, index) => {
        const insertAtLine = toPositiveInteger(edit.insertAtLine);
        const newString = typeof edit.newString === 'string' ? edit.newString : String(edit.newString ?? '');
        const insertionLines = splitReplacementLines(newString);
        return {
            edit,
            index,
            insertAtLine,
            newString,
            insertionLines,
        };
    });

    normalized.forEach((item) => {
        if (!item.insertAtLine) {
            results[item.index] = buildEditFailure(
                'invalid_insert_line',
                'insertAtLine must be a positive integer',
                'Use a line number from the latest Read result. insertAtLine inserts before that line; totalLines + 1 appends to the end.',
            );
            return;
        }
        if (item.insertAtLine > lineCount + 1) {
            results[item.index] = buildEditFailure(
                'insert_line_out_of_bounds',
                `Insert line ${item.insertAtLine} is outside the file`,
                `Read the current file again. This file has ${lineCount} lines, so valid insertAtLine values are 1-${lineCount + 1}.`,
            );
            return;
        }
        if (!item.newString) {
            results[item.index] = buildEditFailure(
                'no_changes',
                'No changes to make',
                'Provide non-empty newString text to insert.',
            );
        }
    });

    const nextLines = originalLines.slice();
    normalized
        .slice()
        .sort((left, right) => right.insertAtLine - left.insertAtLine || right.index - left.index)
        .forEach((item) => {
            if (results[item.index]) return;
            nextLines.splice(item.insertAtLine - 1, 0, ...item.insertionLines);
            results[item.index] = {
                ok: true,
                index: item.index,
                insertAtLine: item.insertAtLine,
                replacements: 0,
                matchedBy: 'line_insert',
                newPreview: numberPreviewLines(item.insertionLines, item.insertAtLine),
            };
        });

    const failedCount = results.filter((result) => result && !result.ok).length;
    const appliedCount = results.filter((result) => result && result.ok).length;
    return {
        ok: failedCount === 0,
        partial: appliedCount > 0 && failedCount > 0 ? true : undefined,
        content: nextLines.join('\n'),
        results: attachEditResultIdentities(results, editList, editList.map(() => 'line_insert')),
    };
}

function applyLinePositionEdits(content = '', editList = [], modeList = []) {
    const hasLineRange = modeList.some((mode) => mode === 'line_range');
    const originalLines = content === '' && !hasLineRange ? [] : splitFileLines(content);
    const insertableLineCount = getInsertableLineCount(content);
    const results = new Array(editList.length);
    const normalized = editList.map((edit = {}, index) => {
        const mode = modeList[index];
        if (mode === 'line_insert') {
            const insertAtLine = toPositiveInteger(edit.insertAtLine);
            const newString = typeof edit.newString === 'string' ? edit.newString : String(edit.newString ?? '');
            return {
                mode,
                edit,
                index,
                insertAtLine,
                newString,
                insertionLines: splitReplacementLines(newString),
            };
        }
        const startLine = toPositiveInteger(edit.startLine);
        const endLine = toPositiveInteger(edit.endLine);
        const newString = typeof edit.newString === 'string' ? edit.newString : String(edit.newString ?? '');
        return {
            mode,
            edit,
            index,
            startLine,
            endLine,
            newString,
            replacementLines: splitReplacementLines(newString),
        };
    });

    normalized.forEach((item) => {
        if (item.mode === 'line_insert') {
            if (!item.insertAtLine) {
                results[item.index] = buildEditFailure(
                    'invalid_insert_line',
                    'insertAtLine must be a positive integer',
                    'Use a line number from the latest Read result. insertAtLine inserts before that line; totalLines + 1 appends to the end.',
                );
                return;
            }
            if (item.insertAtLine > insertableLineCount + 1) {
                results[item.index] = buildEditFailure(
                    'insert_line_out_of_bounds',
                    `Insert line ${item.insertAtLine} is outside the file`,
                    `Read the current file again. This file has ${insertableLineCount} lines, so valid insertAtLine values are 1-${insertableLineCount + 1}.`,
                );
                return;
            }
            if (!item.newString) {
                results[item.index] = buildEditFailure(
                    'no_changes',
                    'No changes to make',
                    'Provide non-empty newString text to insert.',
                );
            }
            return;
        }

        if (!item.startLine || !item.endLine) {
            results[item.index] = buildEditFailure(
                'invalid_line_range',
                'startLine and endLine must be positive integers',
                'Use line numbers from the latest Read result, with startLine <= endLine.',
            );
            return;
        }
        if (item.endLine < item.startLine) {
            results[item.index] = buildEditFailure(
                'invalid_line_range',
                'endLine must be greater than or equal to startLine',
                'Use an inclusive line range from the latest Read result.',
            );
            return;
        }
        if (item.endLine > originalLines.length) {
            results[item.index] = buildEditFailure(
                'line_range_out_of_bounds',
                `Line range ${item.startLine}-${item.endLine} is outside the file`,
                `Read the current file again. This file has ${originalLines.length} lines.`,
            );
        }
    });

    const ranges = normalized
        .filter((item) => item.mode === 'line_range')
        .slice()
        .sort((left, right) => left.startLine - right.startLine || left.endLine - right.endLine);
    ranges.forEach((item, sortedIndex) => {
        if (results[item.index]) return;
        const previous = ranges[sortedIndex - 1];
        if (previous && !results[previous.index] && item.startLine <= previous.endLine) {
            results[previous.index] = buildEditFailure(
                'overlapping_line_ranges',
                `Line range ${previous.startLine}-${previous.endLine} overlaps ${item.startLine}-${item.endLine}`,
                'Merge overlapping line edits into one larger startLine/endLine replacement.',
            );
            results[item.index] = buildEditFailure(
                'overlapping_line_ranges',
                `Line range ${item.startLine}-${item.endLine} overlaps ${previous.startLine}-${previous.endLine}`,
                'Merge overlapping line edits into one larger startLine/endLine replacement.',
            );
        }
    });

    const inserts = normalized.filter((item) => item.mode === 'line_insert');
    inserts.forEach((insert) => {
        if (results[insert.index]) return;
        const coveringRange = ranges.find((range) => (
            !results[range.index]
            && range.startLine < insert.insertAtLine
            && insert.insertAtLine <= range.endLine
        ));
        if (!coveringRange) return;
        const failure = buildEditFailure(
            'insert_inside_line_range',
            `Insert line ${insert.insertAtLine} falls inside replaced line range ${coveringRange.startLine}-${coveringRange.endLine}`,
            'Merge the insertion into that startLine/endLine replacement, or insert at the range start/end boundary.',
        );
        results[insert.index] = failure;
        results[coveringRange.index] = failure;
    });

    const nextLines = originalLines.slice();
    normalized
        .slice()
        .sort((left, right) => {
            const leftAnchor = left.mode === 'line_insert' ? left.insertAtLine : left.startLine;
            const rightAnchor = right.mode === 'line_insert' ? right.insertAtLine : right.startLine;
            if (leftAnchor !== rightAnchor) return rightAnchor - leftAnchor;
            if (left.mode !== right.mode) return left.mode === 'line_range' ? -1 : 1;
            if (left.mode === 'line_insert') return right.index - left.index;
            return right.endLine - left.endLine || right.index - left.index;
        })
        .forEach((item) => {
            if (results[item.index]) return;
            if (item.mode === 'line_insert') {
                nextLines.splice(item.insertAtLine - 1, 0, ...item.insertionLines);
                results[item.index] = {
                    ok: true,
                    index: item.index,
                    insertAtLine: item.insertAtLine,
                    replacements: 0,
                    matchedBy: 'line_insert',
                    newPreview: numberPreviewLines(item.insertionLines, item.insertAtLine),
                };
                return;
            }
            const oldLines = originalLines.slice(item.startLine - 1, item.endLine);
            nextLines.splice(item.startLine - 1, item.endLine - item.startLine + 1, ...item.replacementLines);
            results[item.index] = {
                ok: true,
                index: item.index,
                startLine: item.startLine,
                endLine: item.endLine,
                replacements: 1,
                matchedBy: 'line_range',
                oldPreview: numberPreviewLines(oldLines, item.startLine),
                newPreview: numberPreviewLines(item.replacementLines, item.startLine),
            };
        });

    const failedCount = results.filter((result) => result && !result.ok).length;
    const appliedCount = results.filter((result) => result && result.ok).length;
    return {
        ok: failedCount === 0,
        partial: appliedCount > 0 && failedCount > 0 ? true : undefined,
        content: nextLines.join('\n'),
        results: attachEditResultIdentities(results, editList, modeList),
    };
}

function normalizeEditsInput(edits) {
    if (Array.isArray(edits)) {
        return { ok: true, edits, parsedFromString: false };
    }
    if (typeof edits === 'string') {
        const raw = edits.trim();
        if (!raw) {
            return {
                ok: false,
                error: 'edits_must_be_array',
                message: 'edits must be a JSON array, but received an empty string',
                suggestion: 'Pass edits as an array, not a quoted JSON string. Correct: "edits":[{"oldString":"old","newString":"new"}].',
            };
        }
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return {
                    ok: true,
                    edits: parsed,
                    parsedFromString: true,
                    warning: '提醒：模型把 edits 发成了字符串；插件已解析并继续执行。下次请把 edits 直接作为数组传入，不要作为字符串。',
                };
            }
            return {
                ok: false,
                error: 'edits_must_be_array',
                message: `edits must be a JSON array, but the JSON string parsed to ${Array.isArray(parsed) ? 'array' : typeof parsed}`,
                suggestion: 'Pass edits directly as an array. Correct: "edits":[{"startLine":10,"endLine":50,"newString":"..."}]. Wrong: "edits":"[{\\"startLine\\":10,...}]".',
            };
        } catch (error) {
            const looseParsed = parseLooseEditsString(raw);
            if (looseParsed) {
                return {
                    ok: true,
                    edits: looseParsed,
                    parsedFromString: true,
                    warning: '提醒：模型把 edits 发成了字符串，且内容不是标准 JSON；插件已尝试修复并继续执行。下次请把 edits 直接作为数组传入，不要作为字符串。',
                };
            }
            return {
                ok: false,
                error: 'invalid_edits_json_string',
                message: `edits must be a JSON array, but received a string that is not valid JSON: ${error?.message || 'parse failed'}`,
                suggestion: 'Do not JSON-stringify edits. Pass an array value: "edits":[{"oldString":"old","newString":"new"}].',
            };
        }
    }
    if (edits === undefined || edits === null) {
        return {
            ok: false,
            error: 'missing_edits_array',
            message: 'edits is required and must be a JSON array, but it was missing',
            suggestion: 'Include an edits array with at least one item. Correct: "edits":[{"startLine":10,"endLine":50,"newString":"..."}].',
        };
    }
    return {
        ok: false,
        error: 'edits_must_be_array',
        message: `edits must be a JSON array, but received ${typeof edits}`,
        suggestion: 'Pass edits as an array, not an object/string. Correct: "edits":[{"oldString":"old","newString":"new"}].',
    };
}

export function applyTextEdits(content = '', edits) {
    let nextContent = String(content ?? '');
    const normalizedInput = normalizeEditsInput(edits);
    if (!normalizedInput.ok) {
        return {
            ok: false,
            content: nextContent,
            results: [buildEditFailure(
                normalizedInput.error,
                normalizedInput.message,
                normalizedInput.suggestion,
            )],
        };
    }
    const editList = normalizedInput.edits;
    const results = [];
    const previousNewStrings = [];
    const previousReplacementDetails = [];
    const replacementDetailsBeforeEdit = [];
    let appliedCount = 0;

    if (!editList.length) {
        return {
            ok: false,
            content: nextContent,
            results: [buildEditFailure(
                'invalid_edits',
                'No edits provided',
                'Provide a non-empty edits array. For same-file multi-spot changes, put all replacements in this one Edit call.',
            )],
        };
    }

    const modeList = editList.map((edit) => getEditMode(edit));
    const lineRangeCount = modeList.filter((mode) => mode === 'line_range').length;
    const insertLineCount = modeList.filter((mode) => mode === 'line_insert').length;
    const oldStringCount = modeList.filter((mode) => mode === 'old_string').length;
    const positionedEditCount = lineRangeCount + insertLineCount;
    if (positionedEditCount && oldStringCount) {
        return {
            ok: false,
            content: nextContent,
            results: attachEditResultIdentities(editList.map(() => buildEditFailure(
                'mixed_edit_modes',
                'Do not mix Edit modes in one Edit call',
                'Use separate Edit calls for oldString replacements, line-range replacements, and insertAtLine insertions.',
            )), editList, modeList),
        };
    }
    if (lineRangeCount && insertLineCount) {
        const result = applyLinePositionEdits(
            nextContent,
            editList.map((edit, index) => normalizeEditForMode(edit, modeList[index])),
            modeList,
        );
        if (normalizedInput.warning) result.warning = normalizedInput.warning;
        return result;
    }
    if (lineRangeCount) {
        const result = applyLineRangeEdits(nextContent, editList.map((edit, index) => normalizeEditForMode(edit, modeList[index])));
        if (normalizedInput.warning) result.warning = normalizedInput.warning;
        return result;
    }
    if (insertLineCount) {
        const result = applyLineInsertEdits(nextContent, editList.map((edit, index) => normalizeEditForMode(edit, modeList[index])));
        if (normalizedInput.warning) result.warning = normalizedInput.warning;
        return result;
    }

    const normalizedOldStringEdits = editList.map((edit, index) => normalizeEditForMode(edit, modeList[index]));
    normalizedOldStringEdits.forEach((edit = {}, index) => {
        replacementDetailsBeforeEdit[index] = previousReplacementDetails.slice();
        const oldString = typeof edit.oldString === 'string' ? edit.oldString : String(edit.oldString ?? '');
        const newString = typeof edit.newString === 'string' ? edit.newString : String(edit.newString ?? '');
        const replaceAll = !!edit.replaceAll;

        if (oldString === newString) {
            results.push(buildEditFailure(
                'no_changes',
                'No changes to make',
                'Change newString or remove this edit item.',
            ));
            return;
        }

        const normalizedOldString = normalizeEquivalentText(oldString);
        if (oldString && previousNewStrings.some((previous) => (
            previous.includes(oldString)
            || normalizeEquivalentText(previous).includes(normalizedOldString)
        ))) {
            results.push(buildEditFailure(
                'old_string_matches_previous_new_string',
                'old_string is a substring of a new_string from a previous edit.',
                'This edit may match text inserted earlier in the same Edit call. Merge overlapping changes into one larger replacement, or read the updated file and run a later Edit.',
            ));
            return;
        }

        if (!oldString) {
            results.push(buildEditFailure(
                'empty_old_string',
                'oldString is empty; provide text to replace',
                'Use Write to create files. For Edit, provide the exact current fragment to replace, or use Write for a full rewrite.',
            ));
            return;
        }

        const ranges = findReplacementRanges(nextContent, oldString);
        if (!ranges.length) {
            const diagnostic = buildPossibleAlreadyAppliedDiagnostic(nextContent, oldString, newString);
            results.push(buildEditFailure(
                'not_found',
                diagnostic.possibleAlreadyApplied
                    ? 'String to replace not found, but the requested newString already exists in the file'
                    : 'String to replace not found in file',
                diagnostic.possibleAlreadyApplied
                    ? 'Read the current file and verify whether the intended location is already correct. Edit will not mark this as successful without a same-call replacement proof.'
                    : 'Edit already retries long oldString values with common punctuation and whitespace differences ignored. If it still fails, Read the current file and copy the exact current text into oldString. If this overlaps another same-file edit, merge them into one larger replacement; for very large rewrites, use Write.',
                diagnostic,
            ));
            return;
        }

        if (ranges.length > 1 && !replaceAll) {
            results.push(buildEditFailure(
                'multiple_matches',
                `找到 ${ranges.length} 处匹配，需要更多上下文或使用 replaceAll`,
                'Use the returned line contexts to expand oldString with unique surrounding text, or set replaceAll: true only if every match should change.',
                { matches: buildMatches(nextContent, ranges) },
            ));
            return;
        }

        const selectedRanges = replaceAll ? ranges : ranges.slice(0, 1);
        const applied = applyRanges(nextContent, selectedRanges, newString);
        nextContent = applied.content;
        previousNewStrings.push(...applied.replacements);
        previousReplacementDetails.push(...applied.replacementDetails);
        appliedCount += 1;
        results.push({
            ok: true,
            index,
            replacements: selectedRanges.length,
            matchedBy: applied.matchedBy,
        });
    });

    results.forEach((result, index) => {
        if (!result || result.ok) return;
        if (!['not_found', 'old_string_matches_previous_new_string'].includes(result.error)) return;
        if (!isOldStringEditCoveredByPreviousReplacement(normalizedOldStringEdits[index], replacementDetailsBeforeEdit[index] || [])) return;
        results[index] = {
            ok: true,
            index,
            replacements: 0,
            matchedBy: 'already_satisfied',
            satisfied: true,
            previousError: result.error,
            message: 'Desired edit is already present in the file',
        };
    });

    const failedCount = results.filter((result) => !result.ok).length;
    const satisfiedCount = results.filter((result) => result?.satisfied).length;
    return {
        ok: failedCount === 0,
        partial: (appliedCount > 0 || satisfiedCount > 0) && failedCount > 0 ? true : undefined,
        content: nextContent,
        results: attachEditResultIdentities(results, normalizedOldStringEdits, modeList),
        warning: normalizedInput.warning,
    };
}
