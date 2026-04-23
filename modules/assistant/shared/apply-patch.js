function normalizePatchText(value = '') {
    return String(value ?? '').replace(/\r\n?/g, '\n');
}

function isFileOperationHeader(line = '') {
    return line.startsWith('*** Add File: ')
        || line.startsWith('*** Delete File: ')
        || line.startsWith('*** Update File: ');
}

function createParseError(message) {
    throw new Error(`apply_patch_parse_error:${message}`);
}

function createApplyError(message) {
    throw new Error(`apply_patch_apply_error:${message}`);
}

function parseAddFile(lines, startIndex) {
    const header = lines[startIndex];
    const path = header.slice('*** Add File: '.length).trim();
    if (!path) createParseError('missing add-file path');

    const contentLines = [];
    let index = startIndex + 1;
    while (index < lines.length && !isFileOperationHeader(lines[index]) && lines[index] !== '*** End Patch') {
        const line = lines[index];
        if (!line.startsWith('+')) createParseError(`invalid add-file line for ${path}`);
        contentLines.push(line.slice(1));
        index += 1;
    }

    if (!contentLines.length) createParseError(`add-file ${path} has no content`);

    return {
        operation: {
            type: 'add',
            path,
            content: contentLines.join('\n'),
        },
        nextIndex: index,
    };
}

function parseDeleteFile(lines, startIndex) {
    const header = lines[startIndex];
    const path = header.slice('*** Delete File: '.length).trim();
    if (!path) createParseError('missing delete-file path');
    return {
        operation: {
            type: 'delete',
            path,
        },
        nextIndex: startIndex + 1,
    };
}

function parseUpdateFile(lines, startIndex) {
    const header = lines[startIndex];
    const path = header.slice('*** Update File: '.length).trim();
    if (!path) createParseError('missing update-file path');

    let index = startIndex + 1;
    let moveTo = '';
    if (index < lines.length && lines[index].startsWith('*** Move to: ')) {
        moveTo = lines[index].slice('*** Move to: '.length).trim();
        if (!moveTo) createParseError(`missing move target for ${path}`);
        index += 1;
    }

    const hunks = [];
    while (index < lines.length && !isFileOperationHeader(lines[index]) && lines[index] !== '*** End Patch') {
        const marker = lines[index];
        if (!marker.startsWith('@@')) createParseError(`expected hunk marker for ${path}`);
        const headerText = marker === '@@' ? '' : marker.startsWith('@@ ') ? marker.slice(3) : marker.slice(2).trim();
        index += 1;

        const hunkLines = [];
        let endOfFile = false;
        while (index < lines.length && !lines[index].startsWith('@@') && !isFileOperationHeader(lines[index]) && lines[index] !== '*** End Patch') {
            const line = lines[index];
            if (line === '*** End of File') {
                endOfFile = true;
                index += 1;
                break;
            }
            const prefix = line[0] || '';
            if (![' ', '+', '-'].includes(prefix)) createParseError(`invalid hunk line for ${path}`);
            hunkLines.push({
                type: prefix === ' ' ? 'context' : prefix === '+' ? 'add' : 'remove',
                text: line.slice(1),
            });
            index += 1;
        }

        if (!hunkLines.length) createParseError(`empty hunk for ${path}`);
        hunks.push({
            header: headerText,
            lines: hunkLines,
            endOfFile,
        });
    }

    if (!hunks.length && !moveTo) createParseError(`update-file ${path} has no hunks`);

    return {
        operation: {
            type: 'update',
            path,
            moveTo,
            hunks,
        },
        nextIndex: index,
    };
}

export function parseApplyPatch(patchText = '') {
    const normalized = normalizePatchText(patchText);
    const lines = normalized.split('\n');
    if (lines[0] !== '*** Begin Patch') createParseError('missing *** Begin Patch header');

    const operations = [];
    let index = 1;
    while (index < lines.length) {
        const line = lines[index];
        if (line === '*** End Patch') {
            index += 1;
            while (index < lines.length && lines[index] === '') {
                index += 1;
            }
            if (!operations.length) createParseError('patch has no file operations');
            if (index < lines.length) createParseError('unexpected content after *** End Patch');
            return { operations };
        }

        if (line.startsWith('*** Add File: ')) {
            const parsed = parseAddFile(lines, index);
            operations.push(parsed.operation);
            index = parsed.nextIndex;
            continue;
        }
        if (line.startsWith('*** Delete File: ')) {
            const parsed = parseDeleteFile(lines, index);
            operations.push(parsed.operation);
            index = parsed.nextIndex;
            continue;
        }
        if (line.startsWith('*** Update File: ')) {
            const parsed = parseUpdateFile(lines, index);
            operations.push(parsed.operation);
            index = parsed.nextIndex;
            continue;
        }

        createParseError(`unexpected line: ${line}`);
    }

    createParseError('missing *** End Patch footer');
}

const MATCH_MODES = ['exact', 'trim_end', 'trim', 'unicode_trim'];
const UNICODE_NORMALIZATION_PATTERN = /[\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u2010\u2011\u2012\u2013\u2014\u2015\u2026\u00A0]/;

function normalizeUnicodePunctuation(value = '') {
    return String(value ?? '')
        .replace(/[\u2018\u2019\u201A\u201B]/g, '\'')
        .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
        .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-')
        .replace(/\u2026/g, '...')
        .replace(/\u00A0/g, ' ');
}

function hasUnicodeNormalizationCandidate(value = '') {
    return UNICODE_NORMALIZATION_PATTERN.test(String(value ?? ''));
}

function normalizeComparisonText(line = '', mode = 'exact') {
    const text = String(line ?? '');
    if (mode === 'trim_end') {
        return text.trimEnd();
    }
    if (mode === 'trim') {
        return text.trim();
    }
    if (mode === 'unicode_trim') {
        return normalizeUnicodePunctuation(text.trim());
    }
    return text;
}

function compareLineWithMode(leftLine = '', rightLine = '', mode = 'exact') {
    if (mode !== 'unicode_trim') {
        return {
            equal: normalizeComparisonText(leftLine, mode) === normalizeComparisonText(rightLine, mode),
            usedUnicodeNormalization: false,
        };
    }

    const trimmedLeft = normalizeComparisonText(leftLine, 'trim');
    const trimmedRight = normalizeComparisonText(rightLine, 'trim');
    if (trimmedLeft === trimmedRight) {
        return { equal: true, usedUnicodeNormalization: false };
    }

    const canNormalize = hasUnicodeNormalizationCandidate(leftLine) || hasUnicodeNormalizationCandidate(rightLine);
    if (!canNormalize) {
        return { equal: false, usedUnicodeNormalization: false };
    }

    return {
        equal: normalizeUnicodePunctuation(trimmedLeft) === normalizeUnicodePunctuation(trimmedRight),
        usedUnicodeNormalization: true,
    };
}

function blockMatchesAtWithMode(fileLines = [], targetLines = [], startIndex = 0, mode = 'exact') {
    if (startIndex < 0 || startIndex + targetLines.length > fileLines.length) return false;
    let usedUnicodeNormalization = false;
    for (let index = 0; index < targetLines.length; index += 1) {
        const comparison = compareLineWithMode(fileLines[startIndex + index], targetLines[index], mode);
        if (!comparison.equal) {
            return false;
        }
        usedUnicodeNormalization = usedUnicodeNormalization || comparison.usedUnicodeNormalization;
    }
    if (mode === 'unicode_trim') {
        return usedUnicodeNormalization;
    }
    return true;
}

function findMatchingLineIndexesWithMode(fileLines = [], targetLine = '', startIndex = 0, mode = 'exact') {
    const matches = [];
    for (let index = Math.max(0, startIndex); index < fileLines.length; index += 1) {
        const comparison = compareLineWithMode(fileLines[index], targetLine, mode);
        if (comparison.equal && (mode !== 'unicode_trim' || comparison.usedUnicodeNormalization)) {
            matches.push(index);
        }
    }
    return matches;
}

function findBlockMatchesFromWithMode(fileLines = [], targetLines = [], startIndex = 0, mode = 'exact') {
    if (!targetLines.length) return [];
    const matches = [];
    const maxStart = fileLines.length - targetLines.length;
    if (maxStart < 0) return matches;

    for (let index = Math.max(0, startIndex); index <= maxStart; index += 1) {
        if (blockMatchesAtWithMode(fileLines, targetLines, index, mode)) {
            matches.push(index);
        }
    }
    return matches;
}

function buildHunkFailureMessage(hunkIndex, pathText, kind, details = {}) {
    const parts = [`hunk ${hunkIndex + 1} for ${pathText || 'file'} ${kind}`];
    const extras = [];

    if (Object.prototype.hasOwnProperty.call(details, 'usesHeader')) {
        extras.push(`usesHeader=${details.usesHeader ? 'yes' : 'no'}`);
    }
    if (Object.prototype.hasOwnProperty.call(details, 'matchMode')) {
        extras.push(`matchMode=${details.matchMode}`);
    }
    if (Object.prototype.hasOwnProperty.call(details, 'failureStage')) {
        extras.push(`failureStage=${details.failureStage}`);
    }
    if (Object.prototype.hasOwnProperty.call(details, 'headerMatchCount')) {
        extras.push(`headerMatchCount=${details.headerMatchCount}`);
    }
    if (Object.prototype.hasOwnProperty.call(details, 'oldBlockMatchCount')) {
        extras.push(`oldBlockMatchCount=${details.oldBlockMatchCount}`);
    }

    if (extras.length) {
        parts.push(`(${extras.join(', ')})`);
    }

    return parts.join(' ');
}

function resolveHunkMatch(fileLines, hunk, oldLines, preferredStart = 0, options = {}) {
    const pathText = options.path || 'file';
    const usesHeader = Boolean(String(hunk.header || '').trim());
    const headerText = String(hunk.header || '').trim();
    let deferredHeaderFailure = null;

    if (!usesHeader) {
        for (const matchMode of MATCH_MODES) {
            const preferredMatches = findBlockMatchesFromWithMode(fileLines, oldLines, preferredStart, matchMode);
            if (preferredMatches.length === 1) {
                return { index: preferredMatches[0], matchMode };
            }
            if (preferredMatches.length > 1) {
                createApplyError(buildHunkFailureMessage(hunk.index, pathText, 'old block matched multiple locations', {
                    usesHeader: false,
                    matchMode,
                    failureStage: 'block_ambiguous',
                    oldBlockMatchCount: preferredMatches.length,
                }));
            }

            if (preferredStart > 0) {
                const allMatches = findBlockMatchesFromWithMode(fileLines, oldLines, 0, matchMode);
                if (allMatches.length === 1) {
                    return { index: allMatches[0], matchMode };
                }
                if (allMatches.length > 1) {
                    createApplyError(buildHunkFailureMessage(hunk.index, pathText, 'old block matched multiple locations', {
                        usesHeader: false,
                        matchMode,
                        failureStage: 'block_ambiguous',
                        oldBlockMatchCount: allMatches.length,
                    }));
                }
            }
        }

        createApplyError(buildHunkFailureMessage(hunk.index, pathText, 'old block did not match the current file', {
            usesHeader: false,
            matchMode: 'all',
            failureStage: 'block_not_found',
            oldBlockMatchCount: 0,
        }));
    }

    for (const matchMode of MATCH_MODES) {
        const preferredHeaderMatches = findMatchingLineIndexesWithMode(fileLines, headerText, preferredStart, matchMode);
        const allHeaderMatches = preferredStart > 0
            ? findMatchingLineIndexesWithMode(fileLines, headerText, 0, matchMode)
            : preferredHeaderMatches;
        const headerMatches = preferredHeaderMatches.length ? preferredHeaderMatches : allHeaderMatches;
        const headerMatchCount = headerMatches.length;

        if (!headerMatchCount) {
            continue;
        }

        const matchedIndexes = new Set();
        let totalBlockMatches = 0;
        headerMatches.forEach((headerIndex) => {
            const blockMatches = findBlockMatchesFromWithMode(fileLines, oldLines, Math.max(preferredStart, headerIndex), matchMode);
            totalBlockMatches += blockMatches.length;
            blockMatches.forEach((matchIndex) => matchedIndexes.add(matchIndex));
        });

        if (matchedIndexes.size === 1) {
            return { index: Array.from(matchedIndexes)[0], matchMode };
        }

        if (!matchedIndexes.size) {
            deferredHeaderFailure = buildHunkFailureMessage(hunk.index, pathText, 'header matched but old block did not match under that header', {
                usesHeader: true,
                matchMode,
                failureStage: 'header_found_block_not_found',
                headerMatchCount,
                oldBlockMatchCount: totalBlockMatches,
            });
            continue;
        }

        createApplyError(buildHunkFailureMessage(hunk.index, pathText, 'matched multiple locations under header', {
            usesHeader: true,
            matchMode,
            failureStage: 'header_ambiguous',
            headerMatchCount,
            oldBlockMatchCount: matchedIndexes.size,
        }));
    }

    if (deferredHeaderFailure) {
        createApplyError(deferredHeaderFailure);
    }

    createApplyError(buildHunkFailureMessage(hunk.index, pathText, 'header did not match the current file', {
        usesHeader: true,
        matchMode: 'all',
        failureStage: 'header_not_found',
        headerMatchCount: 0,
        oldBlockMatchCount: 0,
    }));
}

export function applyPatchUpdateToText(originalText = '', hunks = [], options = {}) {
    const normalized = normalizePatchText(originalText);
    const fileLines = normalized === '' ? [] : normalized.split('\n');
    let searchStart = 0;

    hunks.forEach((hunk, hunkIndex) => {
        const oldLines = hunk.lines
            .filter((line) => line.type !== 'add')
            .map((line) => line.text);
        const newLines = hunk.lines
            .filter((line) => line.type !== 'remove')
            .map((line) => line.text);

        if (!oldLines.length) {
            createApplyError(`hunk ${hunkIndex + 1} for ${options.path || 'file'} has no match context`);
        }

        const match = resolveHunkMatch(fileLines, { ...hunk, index: hunkIndex }, oldLines, searchStart, options);
        fileLines.splice(match.index, oldLines.length, ...newLines);
        searchStart = match.index + newLines.length;
    });

    return {
        content: fileLines.join('\n'),
        hunksApplied: hunks.length,
    };
}
