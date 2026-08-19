const HTML_RAW_TEXT_TAGS = new Set(['script', 'style', 'textarea', 'title']);
const HTML_VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const HTML_INLINE_TAGS = new Set(['a', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'code', 'data', 'del', 'dfn', 'em', 'i', 'ins', 'kbd', 'label', 'mark', 'q', 'ruby', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var']);

function readHtmlTagAt(text = '', start = 0) {
    const source = String(text || '');
    if (source[start] !== '<') return null;
    let cursor = start + 1;
    while (/\s/.test(source[cursor] || '')) cursor += 1;
    const closing = source[cursor] === '/';
    if (closing) {
        cursor += 1;
        while (/\s/.test(source[cursor] || '')) cursor += 1;
    }
    if (!/[a-z]/i.test(source[cursor] || '')) return null;
    const nameStart = cursor;
    while (/[\w:.-]/.test(source[cursor] || '')) cursor += 1;
    const name = source.slice(nameStart, cursor).toLowerCase();
    let quote = '';
    for (; cursor < source.length; cursor += 1) {
        const character = source[cursor];
        if (quote) {
            if (character === quote) quote = '';
            continue;
        }
        if (character === '"' || character === "'") {
            quote = character;
            continue;
        }
        if (character !== '>') continue;
        const raw = source.slice(start, cursor + 1);
        return {
            start,
            end: cursor + 1,
            name,
            closing,
            selfClosing: !closing && (HTML_VOID_TAGS.has(name) || /\/\s*>$/.test(raw)),
        };
    }
    return null;
}

function findRawTextClosingTag(text = '', tagName = '', start = 0) {
    const source = String(text || '');
    const lower = source.toLowerCase();
    const needle = `</${String(tagName || '').toLowerCase()}`;
    let cursor = start;
    while ((cursor = lower.indexOf(needle, cursor)) >= 0) {
        const token = readHtmlTagAt(source, cursor);
        if (token?.closing && token.name === tagName) return token;
        cursor += needle.length;
    }
    return null;
}

function scanHtmlTags(text = '') {
    const source = String(text || '');
    const tags = [];
    let cursor = 0;
    let rawTextTag = '';
    while (cursor < source.length) {
        if (rawTextTag) {
            const closingTag = findRawTextClosingTag(source, rawTextTag, cursor);
            if (!closingTag) break;
            tags.push(closingTag);
            cursor = closingTag.end;
            rawTextTag = '';
            continue;
        }
        const tagStart = source.indexOf('<', cursor);
        if (tagStart < 0) break;
        if (source.startsWith('<!--', tagStart)) {
            const commentEnd = source.indexOf('-->', tagStart + 4);
            cursor = commentEnd < 0 ? source.length : commentEnd + 3;
            continue;
        }
        if (source.startsWith('<![CDATA[', tagStart)) {
            const cdataEnd = source.indexOf(']]>', tagStart + 9);
            cursor = cdataEnd < 0 ? source.length : cdataEnd + 3;
            continue;
        }
        if (/^<\s*[!?]/.test(source.slice(tagStart))) {
            const declarationEnd = source.indexOf('>', tagStart + 2);
            cursor = declarationEnd < 0 ? source.length : declarationEnd + 1;
            continue;
        }
        const tag = readHtmlTagAt(source, tagStart);
        if (!tag) {
            cursor = tagStart + 1;
            continue;
        }
        tags.push(tag);
        cursor = tag.end;
        if (!tag.closing && !tag.selfClosing && HTML_RAW_TEXT_TAGS.has(tag.name)) {
            rawTextTag = tag.name;
        }
    }
    return tags;
}

function textOutsideHtmlTags(text = '', tags = scanHtmlTags(text)) {
    const source = String(text || '');
    let result = '';
    let cursor = 0;
    tags.forEach((tag) => {
        result += source.slice(cursor, tag.start);
        cursor = tag.end;
    });
    return result + source.slice(cursor);
}

export function isHtmlStructureLine(line = '') {
    const trimmed = String(line || '').trim();
    if (!trimmed || !trimmed.startsWith('<') || !trimmed.endsWith('>')) return false;
    if (/^<!--[\s\S]*-->$/.test(trimmed) || /^<!doctype\b/i.test(trimmed) || /^<\?xml\b/i.test(trimmed)) return false;
    const tags = scanHtmlTags(trimmed);
    if (!tags.length || tags.some((tag) => HTML_RAW_TEXT_TAGS.has(tag.name))) return false;
    const outside = textOutsideHtmlTags(trimmed, tags).trim();
    return !outside || !/(^|\s)(?:#{1,6}\s|[-+*]\s|\d+\.\s|```|~~~|>\s)/.test(outside);
}

function matchHtmlContainerRanges(tags = []) {
    const stack = [];
    const ranges = [];
    let serial = 0;
    tags.forEach((tag) => {
        if (tag.selfClosing) return;
        if (!tag.closing) {
            serial += 1;
            stack.push({ id: serial, tag, depth: stack.length });
            return;
        }
        const opening = stack[stack.length - 1];
        if (!opening || opening.tag.name !== tag.name) {
            stack.length = 0;
            return;
        }
        stack.pop();
        ranges.push({
            id: opening.id,
            start: opening.tag.end,
            end: tag.start,
            depth: opening.depth,
            rawText: HTML_RAW_TEXT_TAGS.has(tag.name),
            blockContainer: !HTML_INLINE_TAGS.has(tag.name),
            openingTag: opening.tag,
            closingTag: tag,
        });
    });
    return ranges;
}

function buildLineStarts(lines = []) {
    const starts = [];
    let offset = 0;
    lines.forEach((line) => {
        starts.push(offset);
        offset += String(line || '').length + 1;
    });
    return starts;
}

function rangesContainingPosition(ranges = [], position = 0) {
    return ranges.filter((range) => range.start <= position && position < range.end);
}

function resolveHtmlOwnerForLine(line = '', lineStart = 0, tags = [], ranges = []) {
    const source = String(line || '');
    const lineEnd = lineStart + source.length;
    const lineTags = tags.filter((tag) => tag.start < lineEnd && tag.end > lineStart);
    const segments = [];
    let cursor = lineStart;
    lineTags.forEach((tag) => {
        if (tag.start > cursor) segments.push([cursor, Math.min(tag.start, lineEnd)]);
        cursor = Math.max(cursor, tag.end);
    });
    if (cursor < lineEnd) segments.push([cursor, lineEnd]);

    let commonOwners = null;
    let hasText = false;
    for (const [start, end] of segments) {
        const segment = source.slice(Math.max(0, start - lineStart), Math.max(0, end - lineStart));
        const textOffset = segment.search(/\S/);
        if (textOffset < 0) continue;
        hasText = true;
        const position = start + textOffset;
        const containing = rangesContainingPosition(ranges, position);
        if (containing.some((range) => range.rawText)) return null;
        const owners = new Set(containing.filter((range) => range.blockContainer && !range.rawText).map((range) => range.id));
        if (!owners.size) return null;
        commonOwners = commonOwners === null
            ? owners
            : new Set([...commonOwners].filter((id) => owners.has(id)));
        if (!commonOwners.size) return null;
    }
    if (!hasText || !commonOwners?.size) return null;
    return ranges
        .filter((range) => commonOwners.has(range.id))
        .sort((left, right) => right.depth - left.depth)[0] || null;
}

function commonLeadingWhitespace(lines = []) {
    const indents = lines
        .filter((line) => String(line || '').trim())
        .map((line) => (String(line || '').match(/^[ \t]*/) || [''])[0]);
    if (!indents.length) return '';
    let common = indents[0];
    for (const indent of indents.slice(1)) {
        let length = 0;
        while (length < common.length && length < indent.length && common[length] === indent[length]) length += 1;
        common = common.slice(0, length);
        if (!common) break;
    }
    return common;
}

function dedentHtmlOwnedContent(lines = []) {
    const normalized = [...lines];
    const source = normalized.join('\n');
    const tags = scanHtmlTags(source);
    const ranges = matchHtmlContainerRanges(tags);
    if (!ranges.length) return normalized;
    const starts = buildLineStarts(normalized);
    const owners = normalized.map((line, index) => (
        isHtmlStructureLine(line) ? null : resolveHtmlOwnerForLine(line, starts[index], tags, ranges)
    ));
    for (let index = 0; index < normalized.length;) {
        const owner = owners[index];
        if (!owner) {
            index += 1;
            continue;
        }
        const start = index;
        index += 1;
        while (index < normalized.length) {
            if (owners[index]?.id === owner.id) {
                index += 1;
                continue;
            }
            if (!normalized[index].trim() && !isHtmlStructureLine(normalized[index])) {
                index += 1;
                continue;
            }
            break;
        }
        const indent = commonLeadingWhitespace(normalized.slice(start, index));
        if (!indent) continue;
        for (let contentIndex = start; contentIndex < index; contentIndex += 1) {
            if (normalized[contentIndex].trim()) {
                normalized[contentIndex] = normalized[contentIndex].slice(indent.length);
            }
        }
    }
    return normalized;
}

function lineIndexAtOffset(lineStarts = [], offset = 0) {
    let low = 0;
    let high = lineStarts.length - 1;
    while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        if (lineStarts[middle] <= offset) {
            if (middle === lineStarts.length - 1 || lineStarts[middle + 1] > offset) return middle;
            low = middle + 1;
        } else {
            high = middle - 1;
        }
    }
    return 0;
}

function splitMixedHtmlBoundaryLines(lines = []) {
    const source = lines.join('\n');
    const tags = scanHtmlTags(source);
    const ranges = matchHtmlContainerRanges(tags);
    if (!ranges.length) return lines;
    const starts = buildLineStarts(lines);
    const boundaryTagStarts = new Set();
    ranges.forEach((range) => {
        const openingLine = lineIndexAtOffset(starts, range.openingTag.start);
        const closingLine = lineIndexAtOffset(starts, range.closingTag.start);
        if (!range.blockContainer || openingLine === closingLine) return;
        boundaryTagStarts.add(range.openingTag.start);
        boundaryTagStarts.add(range.closingTag.start);
    });

    const expanded = [];
    lines.forEach((line, lineIndex) => {
        if (isHtmlStructureLine(line)) {
            expanded.push(line);
            return;
        }
        const lineStart = starts[lineIndex];
        const lineEnd = lineStart + line.length;
        const lineTags = tags.filter((tag) => (
            tag.start >= lineStart
            && tag.end <= lineEnd
            && boundaryTagStarts.has(tag.start)
        ));
        let prefixEnd = 0;
        let cursor = (line.match(/^[ \t]*/) || [''])[0].length;
        for (const tag of lineTags.filter((item) => !item.closing).sort((left, right) => left.start - right.start)) {
            const localStart = tag.start - lineStart;
            if (localStart !== cursor) break;
            prefixEnd = tag.end - lineStart;
            cursor = prefixEnd;
            while (/[ \t]/.test(line[cursor] || '')) cursor += 1;
        }

        let suffixStart = line.length;
        cursor = line.length - (line.match(/[ \t]*$/) || [''])[0].length;
        for (const tag of lineTags.filter((item) => item.closing).sort((left, right) => right.end - left.end)) {
            const localEnd = tag.end - lineStart;
            if (localEnd !== cursor) break;
            suffixStart = tag.start - lineStart;
            cursor = suffixStart;
            while (cursor > 0 && /[ \t]/.test(line[cursor - 1])) cursor -= 1;
        }

        if (!prefixEnd && suffixStart === line.length) {
            expanded.push(line);
            return;
        }
        if (prefixEnd) expanded.push(line.slice(0, prefixEnd));
        const contentEnd = suffixStart === line.length ? line.length : suffixStart;
        const content = line.slice(prefixEnd, contentEnd);
        if (content.trim()) expanded.push(content);
        if (suffixStart < line.length) expanded.push(line.slice(suffixStart));
    });
    return expanded;
}

export function preprocessHtmlBoundaryLines(lines = []) {
    return splitMixedHtmlBoundaryLines(dedentHtmlOwnedContent(lines));
}
