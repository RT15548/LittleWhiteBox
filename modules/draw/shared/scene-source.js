import { hashStableValue } from './generation-fingerprint.js';
import { stripDrawImageSlots } from './image-marker-syntax.js';

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
    return applyMappedSpans(mapped, ranges.map(range => ({ range })));
}

// Finds a run of start/end rules in a single left-to-right pass: at every
// position the block that starts earliest wins (ties go to the earlier rule),
// so a block claimed by one rule can never be cut open by another rule whose
// start tag merely appears inside it. It only locates spans; what happens to a
// span (delete it, or keep it but forbid insertion points) is decided by `keep`.
function findMappedBlockSpansInOnePass(mapped, rules) {
    const text = getMappedText(mapped);
    const candidates = rules.map(({ start, end, keep }) => ({
        regex: new RegExp(`${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}`, 'gi'),
        keep,
        range: null,
        exhausted: false,
    }));
    const spans = [];
    let position = 0;

    while (position <= text.length) {
        let best = null;
        for (const candidate of candidates) {
            if (candidate.exhausted) continue;
            // A cached match that starts before `position` was nested inside
            // a block that has just been claimed, so look for the next one.
            if (!candidate.range || candidate.range[0] < position) {
                candidate.regex.lastIndex = position;
                const match = candidate.regex.exec(text);
                if (!match) {
                    candidate.exhausted = true;
                    continue;
                }
                candidate.range = [match.index, match.index + match[0].length];
            }
            if (!best || candidate.range[0] < best.range[0]) best = candidate;
        }
        if (!best) break;
        spans.push({ range: best.range, keep: best.keep });
        position = best.range[1];
    }
    return spans;
}

// 把找到的片段落到文本上：keep 为 true 的片段文字保留（给每个字符打上 kept 标记，
// 后面生成插图点时据此跳过片段内部）；否则整段删除。spans 须按位置排序且互不重叠。
function applyMappedSpans(mapped, spans) {
    if (!spans.length) return mapped;

    const result = [];
    let cursor = 0;
    for (const { range: [from, to], keep } of spans) {
        for (; cursor < from; cursor += 1) result.push(mapped[cursor]);
        if (keep) {
            for (; cursor < to; cursor += 1) result.push({ ...mapped[cursor], kept: true });
        }
        cursor = Math.max(cursor, to);
    }
    for (; cursor < mapped.length; cursor += 1) result.push(mapped[cursor]);
    return result;
}

// Two-sided (start + end) rules are matched together in one earliest-start-wins
// pass wherever they sit in the list, so a block claimed by one rule can never
// be cut open by another rule. One-sided rules (truncate from `start`, or drop
// everything up to `end`) then run afterwards, in list order, on the text that
// remains. Spans with `keep` are still part of that text, so a one-sided rule can
// cut through a kept span just like through ordinary text. Span detection never
// depends on `keep`; the flag only decides whether the found text is deleted.
function applyMappedFilterRules(mapped, rules = []) {
    const blockRules = [];
    const oneSidedRules = [];
    for (const rule of Array.isArray(rules) ? rules : []) {
        const start = String(rule?.start || '').trim();
        const end = String(rule?.end || '').trim();
        if (!start && !end) continue;
        // keep 由设置里的“发给 AI”勾选写入（只存 keep: true）。判断刻意在这里写一份、不从 message-filter-rules.js 引入：
        // 本文件在服务器运行时的依赖图里，多 import 一个文件就会改变需要维护者签名的运行时产物。
        // message-filter-rules.js 里有同样的判断（isRuleKept），有测试保证两处一致。
        const normalized = { start, end, keep: rule?.keep === true };
        if (start && end) blockRules.push(normalized);
        else oneSidedRules.push(normalized);
    }

    let result = blockRules.length
        ? applyMappedSpans(mapped, findMappedBlockSpansInOnePass(mapped, blockRules))
        : mapped;
    for (const { start, end, keep } of oneSidedRules) {
        const text = getMappedText(result);
        let range = null;
        if (start) {
            const index = text.toLocaleLowerCase().indexOf(start.toLocaleLowerCase());
            if (index >= 0) range = [index, result.length];
        } else {
            const index = text.toLocaleLowerCase().indexOf(end.toLocaleLowerCase());
            if (index >= 0) range = [0, Math.min(result.length, index + end.length)];
        }
        if (range) result = applyMappedSpans(result, [{ range, keep }]);
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
        // 保留片段（keep）内部不允许插图：点前面的那个字符在保留片段里就不生成。
        // 片段之后换行带出的点，前一个字符是片段外的换行，照常生成；片段前面的点同理。
        // 被抑制时不重置 hasContent，片段后面的换行/句末仍可正常出点。
        // 之所以不放行"紧贴片段末尾"的点：单边规则可能把片段从中间截断，末尾字符未必是片段真正的结尾。
        if (previous.kept) return;
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

export function normalizeMessageSceneSourceText(sourceText) {
    return stripDrawImageSlots(sourceText);
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
