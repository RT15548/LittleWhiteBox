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

    if (!hunks.length) createParseError(`update-file ${path} has no hunks`);

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

function linesEqual(left = [], right = [], startIndex = 0) {
    if (startIndex < 0 || startIndex + right.length > left.length) return false;
    for (let index = 0; index < right.length; index += 1) {
        if (left[startIndex + index] !== right[index]) return false;
    }
    return true;
}

function findUniqueBlockIndex(fileLines, targetLines, preferredStart = 0) {
    if (!targetLines.length) return -1;
    const maxStart = fileLines.length - targetLines.length;
    if (maxStart < 0) return -1;

    const collectMatches = (startAt) => {
        const matches = [];
        for (let index = Math.max(0, startAt); index <= maxStart; index += 1) {
            if (linesEqual(fileLines, targetLines, index)) {
                matches.push(index);
                if (matches.length > 1) break;
            }
        }
        return matches;
    };

    const preferredMatches = collectMatches(preferredStart);
    if (preferredMatches.length === 1) return preferredMatches[0];
    if (preferredMatches.length > 1) return -2;

    if (preferredStart <= 0) return -1;
    const allMatches = collectMatches(0);
    if (allMatches.length === 1) return allMatches[0];
    if (allMatches.length > 1) return -2;
    return -1;
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

        const matchIndex = findUniqueBlockIndex(fileLines, oldLines, searchStart);
        if (matchIndex === -2) {
            createApplyError(`hunk ${hunkIndex + 1} for ${options.path || 'file'} matched multiple locations`);
        }
        if (matchIndex < 0) {
            createApplyError(`hunk ${hunkIndex + 1} for ${options.path || 'file'} did not match the current file`);
        }

        fileLines.splice(matchIndex, oldLines.length, ...newLines);
        searchStart = matchIndex + newLines.length;
    });

    return {
        content: fileLines.join('\n'),
        hunksApplied: hunks.length,
    };
}
