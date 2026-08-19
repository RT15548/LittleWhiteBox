import { hashStableValue } from './generation-fingerprint.js';

const IMAGE_MARKER_REGEX = /\[(?:image|ebook-image|tavern-image)\s*:\s*[a-z0-9_-]+\]/gi;
const SCENE_POINT_MARKER_REGEX = /【插图点\s+\d+】/g;
const SENTENCE_END_REGEX = /[。！？.!?…]/;
const SENTENCE_CLOSER_REGEX = /[”’」』】）》〉〕\]})"'*_~～]/;

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
        if (SENTENCE_END_REGEX.test(char)) {
            let end = index + 1;
            while (end < mapped.length && SENTENCE_END_REGEX.test(mapped[end].char)) end += 1;
            while (end < mapped.length && SENTENCE_CLOSER_REGEX.test(mapped[end].char)) end += 1;
            addPoint(end);
            index = end - 1;
            continue;
        }
        if (!/\s/.test(char)) hasContent = true;
    }

    if (hasContent) addPoint(mapped.length);
    return points;
}

function buildNumberedContent(content, points) {
    let cursor = 0;
    let result = '';
    for (const point of points) {
        result += content.slice(cursor, point.contentOffset);
        result += `【插图点 ${point.number}】`;
        cursor = point.contentOffset;
    }
    return result + content.slice(cursor);
}

export function hashSceneSource(sourceText) {
    return hashStableValue(String(sourceText ?? ''), 'scene-source');
}

export function stripScenePointMarkers(text) {
    return String(text || '').replace(SCENE_POINT_MARKER_REGEX, '');
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
