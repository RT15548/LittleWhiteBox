function normalizePatchText(value = '') {
    return String(value ?? '').replace(/\r\n?/g, '\n');
}

function splitTextForPatchApplication(normalizedText = '') {
    const normalized = String(normalizedText ?? '');
    if (normalized === '') {
        return {
            lines: [],
            hadTerminalNewline: false,
        };
    }

    const hadTerminalNewline = normalized.endsWith('\n');
    const body = hadTerminalNewline ? normalized.slice(0, -1) : normalized;
    return {
        lines: body === '' ? [''] : body.split('\n'),
        hadTerminalNewline,
    };
}

function joinPatchedLines(lines = [], hadTerminalNewline = false) {
    const content = Array.isArray(lines) ? lines.join('\n') : '';
    return hadTerminalNewline ? `${content}\n` : content;
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

function parseNonNegativeInteger(value) {
    const parsed = Number.parseInt(String(value || ''), 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseHunkMarker(marker = '') {
    if (!marker.startsWith('@@')) createParseError('expected hunk marker');
    const body = marker.slice(2).trim();
    if (!body) {
        return { header: '' };
    }

    const unifiedMatch = body.match(/^-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s*@@(?:\s*(.*))?$/);
    if (unifiedMatch) {
        return {
            header: String(unifiedMatch[5] || '').trim(),
            oldStartLine: parseNonNegativeInteger(unifiedMatch[1]),
            oldLineCount: unifiedMatch[2] === undefined ? 1 : Math.max(0, Number.parseInt(unifiedMatch[2], 10) || 0),
            newStartLine: parseNonNegativeInteger(unifiedMatch[3]),
            newLineCount: unifiedMatch[4] === undefined ? 1 : Math.max(0, Number.parseInt(unifiedMatch[4], 10) || 0),
        };
    }

    return {
        header: body,
    };
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
        const hunkMarker = parseHunkMarker(marker);
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
            header: hunkMarker.header,
            oldStartLine: hunkMarker.oldStartLine,
            oldLineCount: hunkMarker.oldLineCount,
            newStartLine: hunkMarker.newStartLine,
            newLineCount: hunkMarker.newLineCount,
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

const LINE_ALIGNMENT_PROFILES = [
    { key: 'verbatim' },
    { key: 'rstrip_aware' },
    { key: 'edge_trimmed' },
    { key: 'punctuation_folded' },
];
const GLYPH_FOLDING_PATTERN = /[\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u2010\u2011\u2012\u2013\u2014\u2015\u2026\u00A0]/;

function foldPatchGlyphVariants(value = '') {
    return String(value ?? '')
        .replace(/[\u2018\u2019\u201A\u201B]/g, '\'')
        .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
        .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-')
        .replace(/\u2026/g, '...')
        .replace(/\u00A0/g, ' ');
}

function hasGlyphFoldingCandidate(value = '') {
    return GLYPH_FOLDING_PATTERN.test(String(value ?? ''));
}

function prepareLineForAlignment(line = '', profileKey = 'verbatim') {
    const text = String(line ?? '');
    if (profileKey === 'rstrip_aware') {
        return text.trimEnd();
    }
    if (profileKey === 'edge_trimmed' || profileKey === 'punctuation_folded') {
        return text.trim();
    }
    return text;
}

function compareLineUnderProfile(leftLine = '', rightLine = '', profileKey = 'verbatim') {
    if (profileKey !== 'punctuation_folded') {
        return {
            equal: prepareLineForAlignment(leftLine, profileKey) === prepareLineForAlignment(rightLine, profileKey),
            usedGlyphFolding: false,
        };
    }

    const alignedLeft = prepareLineForAlignment(leftLine, 'edge_trimmed');
    const alignedRight = prepareLineForAlignment(rightLine, 'edge_trimmed');
    if (alignedLeft === alignedRight) {
        return { equal: true, usedGlyphFolding: false };
    }

    const canFoldGlyphs = hasGlyphFoldingCandidate(leftLine) || hasGlyphFoldingCandidate(rightLine);
    if (!canFoldGlyphs) {
        return { equal: false, usedGlyphFolding: false };
    }

    return {
        equal: foldPatchGlyphVariants(alignedLeft) === foldPatchGlyphVariants(alignedRight),
        usedGlyphFolding: true,
    };
}

function blockMatchesAtWithProfile(fileLines = [], targetLines = [], startIndex = 0, profileKey = 'verbatim') {
    if (startIndex < 0 || startIndex + targetLines.length > fileLines.length) return false;
    let usedGlyphFolding = false;
    for (let index = 0; index < targetLines.length; index += 1) {
        const comparison = compareLineUnderProfile(fileLines[startIndex + index], targetLines[index], profileKey);
        if (!comparison.equal) {
            return false;
        }
        usedGlyphFolding = usedGlyphFolding || comparison.usedGlyphFolding;
    }
    if (profileKey === 'punctuation_folded') {
        return usedGlyphFolding;
    }
    return true;
}

function findAnchorLineIndexes(fileLines = [], targetLine = '', startIndex = 0, profileKey = 'verbatim') {
    const matches = [];
    for (let index = Math.max(0, startIndex); index < fileLines.length; index += 1) {
        const comparison = compareLineUnderProfile(fileLines[index], targetLine, profileKey);
        if (comparison.equal && (profileKey !== 'punctuation_folded' || comparison.usedGlyphFolding)) {
            matches.push(index);
        }
    }
    return matches;
}

function findContiguousBlockMatches(fileLines = [], targetLines = [], startIndex = 0, profileKey = 'verbatim') {
    if (!targetLines.length) return [];
    const matches = [];
    const maxStart = fileLines.length - targetLines.length;
    if (maxStart < 0) return matches;

    for (let index = Math.max(0, startIndex); index <= maxStart; index += 1) {
        if (blockMatchesAtWithProfile(fileLines, targetLines, index, profileKey)) {
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
    if (Object.prototype.hasOwnProperty.call(details, 'comparisonProfile')) {
        extras.push(`comparisonProfile=${details.comparisonProfile}`);
    }
    if (Object.prototype.hasOwnProperty.call(details, 'failureKind')) {
        extras.push(`failureKind=${details.failureKind}`);
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
        for (const profile of LINE_ALIGNMENT_PROFILES) {
            const preferredMatches = findContiguousBlockMatches(fileLines, oldLines, preferredStart, profile.key);
            if (preferredMatches.length === 1) {
                return { index: preferredMatches[0], comparisonProfile: profile.key };
            }
            if (preferredMatches.length > 1) {
                createApplyError(buildHunkFailureMessage(hunk.index, pathText, 'old block matched multiple locations', {
                    usesHeader: false,
                    comparisonProfile: profile.key,
                    failureKind: 'ambiguous_block_match',
                    oldBlockMatchCount: preferredMatches.length,
                }));
            }

            if (preferredStart > 0) {
                const allMatches = findContiguousBlockMatches(fileLines, oldLines, 0, profile.key);
                if (allMatches.length === 1) {
                    return { index: allMatches[0], comparisonProfile: profile.key };
                }
                if (allMatches.length > 1) {
                    createApplyError(buildHunkFailureMessage(hunk.index, pathText, 'old block matched multiple locations', {
                        usesHeader: false,
                        comparisonProfile: profile.key,
                        failureKind: 'ambiguous_block_match',
                        oldBlockMatchCount: allMatches.length,
                    }));
                }
            }
        }

        createApplyError(buildHunkFailureMessage(hunk.index, pathText, 'old block did not match the current file', {
            usesHeader: false,
            comparisonProfile: 'all_profiles',
            failureKind: 'missing_block_match',
            oldBlockMatchCount: 0,
        }));
    }

    for (const profile of LINE_ALIGNMENT_PROFILES) {
        const preferredHeaderMatches = findAnchorLineIndexes(fileLines, headerText, preferredStart, profile.key);
        const allHeaderMatches = preferredStart > 0
            ? findAnchorLineIndexes(fileLines, headerText, 0, profile.key)
            : preferredHeaderMatches;
        const headerMatches = preferredHeaderMatches.length ? preferredHeaderMatches : allHeaderMatches;
        const headerMatchCount = headerMatches.length;

        if (!headerMatchCount) {
            continue;
        }

        const matchedIndexes = new Set();
        let totalBlockMatches = 0;
        headerMatches.forEach((headerIndex) => {
            const blockMatches = findContiguousBlockMatches(fileLines, oldLines, Math.max(preferredStart, headerIndex), profile.key);
            totalBlockMatches += blockMatches.length;
            blockMatches.forEach((matchIndex) => matchedIndexes.add(matchIndex));
        });

        if (matchedIndexes.size === 1) {
            return { index: Array.from(matchedIndexes)[0], comparisonProfile: profile.key };
        }

        if (!matchedIndexes.size) {
            deferredHeaderFailure = buildHunkFailureMessage(hunk.index, pathText, 'header matched but old block did not match under that header', {
                usesHeader: true,
                comparisonProfile: profile.key,
                failureKind: 'header_anchor_without_block',
                headerMatchCount,
                oldBlockMatchCount: totalBlockMatches,
            });
            continue;
        }

        createApplyError(buildHunkFailureMessage(hunk.index, pathText, 'matched multiple locations under header', {
            usesHeader: true,
            comparisonProfile: profile.key,
            failureKind: 'ambiguous_header_scoped_match',
            headerMatchCount,
            oldBlockMatchCount: matchedIndexes.size,
        }));
    }

    if (deferredHeaderFailure) {
        createApplyError(deferredHeaderFailure);
    }

    createApplyError(buildHunkFailureMessage(hunk.index, pathText, 'header did not match the current file', {
        usesHeader: true,
        comparisonProfile: 'all_profiles',
        failureKind: 'missing_header_anchor',
        headerMatchCount: 0,
        oldBlockMatchCount: 0,
    }));
}

export function applyPatchUpdateToText(originalText = '', hunks = [], options = {}) {
    const normalized = normalizePatchText(originalText);
    const {
        lines: fileLines,
        hadTerminalNewline,
    } = splitTextForPatchApplication(normalized);
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

        const hunkStartHint = Number.isFinite(hunk.oldStartLine)
            ? Math.max(searchStart, hunk.oldStartLine - 1)
            : searchStart;
        const match = resolveHunkMatch(fileLines, { ...hunk, index: hunkIndex }, oldLines, hunkStartHint, options);
        fileLines.splice(match.index, oldLines.length, ...newLines);
        searchStart = match.index + newLines.length;
    });

    return {
        content: joinPatchedLines(fileLines, hadTerminalNewline),
        hunksApplied: hunks.length,
    };
}
