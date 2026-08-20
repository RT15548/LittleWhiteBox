import { hashStableValue } from './generation-fingerprint.js';

const IMAGE_MARKER_REGEX = /\[(?:image|ebook-image|tavern-image)\s*:\s*[a-z0-9_-]+\]/gi;
const SCENE_POINT_MARKER_REGEX = /【插图点\s+\d+】/g;
const USER_SCENE_POINT_MARKER_REGEX = /【插图点\s+(\d+)】/g;
const SENTENCE_END_REGEX = /[。！？!?…]/;
const SENTENCE_CLOSER_REGEX = /[”’」』】）》〉〕\]})"'*_~～]/;
const ATTRIBUTION_CLOSER_REGEX = /[”’」』】）》〉〕\]})"']/;
const COMMON_PERIOD_ABBREVIATIONS = new Set([
    'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'vs', 'etc', 'no', 'fig',
    'inc', 'ltd', 'co', 'corp', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug',
    'sep', 'sept', 'oct', 'nov', 'dec', 'e.g', 'i.e',
]);

function escapeRegex(value) {
    return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createMappedText(sourceText) {
    return Array.from({ length: sourceText.length }, (_value, offset) => ({
        char: sourceText[offset],
        offset,
    }));
}

function getMappedText(mapped) {
    return mapped.map((item) => item.char).join('');
}

function removeMappedMatches(mapped, regex) {
    const text = getMappedText(mapped);
    const ranges = [];
    for (const match of text.matchAll(regex)) {
        if (!match[0]) continue;
        ranges.push([match.index, match.index + match[0].length]);
    }
    if (!ranges.length) return mapped;

    const kept = [];
    let rangeIndex = 0;
    for (let index = 0; index < mapped.length; index += 1) {
        while (rangeIndex < ranges.length && index >= ranges[rangeIndex][1]) rangeIndex += 1;
        const range = ranges[rangeIndex];
        if (!range || index < range[0] || index >= range[1]) kept.push(mapped[index]);
    }
    return kept;
}

function applyMappedFilterRules(mapped, rules = []) {
    let result = mapped;
    for (const rule of Array.isArray(rules) ? rules : []) {
        const start = String(rule?.start || '').trim();
        const end = String(rule?.end || '').trim();
        if (!start && !end) continue;
        if (start && end) {
            result = removeMappedMatches(
                result,
                new RegExp(`${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}`, 'gi'),
            );
            continue;
        }

        const text = getMappedText(result);
        if (start) {
            const index = text.toLocaleLowerCase().indexOf(start.toLocaleLowerCase());
            if (index >= 0) result = result.slice(0, index);
        } else {
            const index = text.toLocaleLowerCase().indexOf(end.toLocaleLowerCase());
            if (index >= 0) result = result.slice(index + end.length);
        }
    }
    return result;
}

function trimMappedText(mapped) {
    const text = getMappedText(mapped);
    if (!text) return [];
    const start = text.length - text.trimStart().length;
    const end = text.trimEnd().length;
    return mapped.slice(start, end);
}

function isAsciiLetterOrDigit(char = '') {
    return /[A-Za-z0-9]/.test(char);
}

function isSentencePeriod(mapped, index) {
    if (mapped[index]?.char !== '.') return false;
    const previous = mapped[index - 1]?.char || '';
    const next = mapped[index + 1]?.char || '';
    if (isAsciiLetterOrDigit(previous) && isAsciiLetterOrDigit(next)) return false;

    let token = '';
    for (let cursor = index - 1; cursor >= 0 && token.length < 24; cursor -= 1) {
        const char = mapped[cursor]?.char || '';
        if (/\s/.test(char)) break;
        token = char + token;
    }
    const normalizedWord = token.replace(/^[^A-Za-z]+|[^A-Za-z.]+$/g, '').toLowerCase();
    if (COMMON_PERIOD_ABBREVIATIONS.has(normalizedWord) || /^[A-Za-z]$/.test(normalizedWord)) return false;
    return true;
}

function isSentenceEnd(mapped, index) {
    const char = mapped[index]?.char || '';
    return char === '.' ? isSentencePeriod(mapped, index) : SENTENCE_END_REGEX.test(char);
}

function hasSameLineQuoteContinuation(mapped, closerEnd) {
    let cursor = closerEnd;
    while (cursor < mapped.length && /[ \t\u00a0]/.test(mapped[cursor].char)) cursor += 1;
    if (cursor >= mapped.length || /[\r\n]/.test(mapped[cursor].char)) return false;

    // A new quoted or Markdown-emphasized span is a separate narrative beat,
    // not an attribution such as `”她问。` that belongs to the quotation.
    return !/[*_~“‘「『《〈（(【[]/.test(mapped[cursor].char);
}

function skipHorizontalWhitespace(mapped, start) {
    let cursor = start;
    while (cursor < mapped.length && /[ \t\u00a0]/.test(mapped[cursor].char)) cursor += 1;
    return cursor;
}

function collectScenePoints(mapped) {
    const points = [];
    let hasContent = false;
    const addPoint = (contentOffset) => {
        const previous = mapped[contentOffset - 1];
        if (!previous || points.at(-1)?.contentOffset === contentOffset) return;
        points.push({
            number: points.length + 1,
            contentOffset,
            offset: previous.offset + 1,
        });
        hasContent = false;
    };

    for (let index = 0; index < mapped.length; index += 1) {
        const char = mapped[index].char;
        if (char === '\r' || char === '\n') {
            let end = index + 1;
            while (end < mapped.length && (mapped[end].char === '\r' || mapped[end].char === '\n')) end += 1;
            if (hasContent) addPoint(end);
            index = end - 1;
            continue;
        }
        if (isSentenceEnd(mapped, index)) {
            let end = index + 1;
            while (end < mapped.length && isSentenceEnd(mapped, end)) end += 1;
            const punctuationEnd = end;
            let hasAttributionCloser = false;
            while (end < mapped.length && SENTENCE_CLOSER_REGEX.test(mapped[end].char)) {
                if (ATTRIBUTION_CLOSER_REGEX.test(mapped[end].char)) hasAttributionCloser = true;
                end += 1;
            }
            const pointEnd = skipHorizontalWhitespace(mapped, end);
            const closedQuotedSentence = end > punctuationEnd && hasAttributionCloser;
            if (hasContent && !(closedQuotedSentence && hasSameLineQuoteContinuation(mapped, end))) {
                addPoint(pointEnd);
            }
            index = (closedQuotedSentence ? end : pointEnd) - 1;
            continue;
        }
        if (!/\s/.test(char)) hasContent = true;
    }

    if (hasContent) addPoint(mapped.length);
    return points;
}

function escapeUserScenePointMarkers(content) {
    return String(content || '').replace(
        USER_SCENE_POINT_MARKER_REGEX,
        (_match, number) => `【原文中的“插图点 ${number}”字样】`,
    );
}

function restoreUserScenePointMarkers(content) {
    return String(content || '').replace(
        /【原文中的“插图点\s+(\d+)”字样】/g,
        (_match, number) => `【插图点 ${number}】`,
    );
}

function buildNumberedContent(content, points) {
    let cursor = 0;
    let result = '';
    for (const point of points) {
        result += escapeUserScenePointMarkers(content.slice(cursor, point.contentOffset));
        result += `【插图点 ${point.number}】`;
        cursor = point.contentOffset;
    }
    return result + escapeUserScenePointMarkers(content.slice(cursor));
}

export function hashSceneSource(sourceText) {
    return hashStableValue(String(sourceText ?? ''), 'scene-source');
}

export function stripScenePointMarkers(text) {
    return restoreUserScenePointMarkers(String(text || '').replace(SCENE_POINT_MARKER_REGEX, ''));
}

export function createSceneSource(sourceText, options = {}) {
    const original = String(sourceText ?? '');
    let mapped = createMappedText(original);
    mapped = removeMappedMatches(mapped, new RegExp(IMAGE_MARKER_REGEX.source, 'gi'));
    mapped = applyMappedFilterRules(mapped, options.filterRules);
    mapped = trimMappedText(mapped);

    const content = getMappedText(mapped);
    const internalPoints = collectScenePoints(mapped);
    return {
        sourceText: original,
        sourceHash: hashSceneSource(original),
        content,
        numberedContent: buildNumberedContent(content, internalPoints),
        points: internalPoints.map(({ number, offset }) => ({ number, offset })),
    };
}
