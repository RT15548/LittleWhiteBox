export function normalizeChatMessageImageTags(value) {
    return String(value || '').trim().replace(/^(?:nsfw|sketchy)\s*:\s*/i, 'nsfw, ')
        .split(',').map(item => item.trim()).filter(Boolean).join(', ');
}

const TAG_PATTERN = /\[(?:img|图片)\s*:\s*([^\]]+)\]/gi;
const OPAQUE_TAGS = new Set(['code', 'pre', 'script', 'style', 'textarea']);

function escapeRegex(value) {
    return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 将 filterRules 转换为 excluded 区间数组（[start, end] 开区间），
// 与已有的代码块/HTML 属性排除逻辑统一处理。
export function collectFilterRuleRanges(source, filterRules = []) {
    const ranges = [];
    const text = String(source || '');
    const rules = Array.isArray(filterRules) ? filterRules : [];
    for (const rule of rules) {
        const start = String(rule?.start || '').trim();
        const end = String(rule?.end || '').trim();
        if (!start && !end) continue;
        if (start && end) {
            const regex = new RegExp(`${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}`, 'gi');
            for (const match of text.matchAll(regex)) {
                if (match[0]) ranges.push([match.index, match.index + match[0].length]);
            }
        } else if (start) {
            const idx = text.toLowerCase().indexOf(start.toLowerCase());
            if (idx >= 0) ranges.push([idx, text.length]);
        } else {
            const idx = text.toLowerCase().indexOf(end.toLowerCase());
            if (idx >= 0) ranges.push([0, idx + end.length]);
        }
    }
    // 合并重叠区间
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const range of ranges) {
        const last = merged[merged.length - 1];
        if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
        else merged.push([...range]);
    }
    return merged;
}

// Keep raw offsets; code examples, escaped tags and HTML attributes are not requests.
export function parseChatImageTags(value, filterRules = []) {
    const source = String(value || '');
    if (source.search(TAG_PATTERN) < 0) return [];
    const excluded = collectFilterRuleRanges(source, filterRules);
    let offset = 0;
    while (offset < source.length) {
        const rest = source.slice(offset);
        const lineStart = offset === 0 || source[offset - 1] === '\n';
        const fence = lineStart && /^( {0,3})(`{3,}|~{3,})[^\n]*(?:\n|$)/.exec(rest);
        if (fence) {
            const closing = new RegExp('^ {0,3}' + fence[2][0] + '{' + fence[2].length + ',}[ \\t]*(?:\\r?\\n|$)', 'm');
            const end = closing.exec(source.slice(offset + fence[0].length));
            const next = end ? offset + fence[0].length + end.index + end[0].length : source.length;
            excluded.push([offset, next]); offset = next; continue;
        }
        if (lineStart && /^(?: {4}|\t)/.test(rest)) {
            const end = source.indexOf('\n', offset);
            const next = end < 0 ? source.length : end + 1;
            excluded.push([offset, next]); offset = next; continue;
        }
        if (source[offset] === '`' && source[offset - 1] !== '\\') {
            const ticks = /^`+/.exec(rest)[0];
            const end = source.indexOf(ticks, offset + ticks.length);
            if (end >= 0) { excluded.push([offset, end + ticks.length]); offset = end + ticks.length; continue; }
        }
        if (rest.startsWith('<!--')) {
            const end = source.indexOf('-->', offset + 4);
            const next = end < 0 ? source.length : end + 3;
            excluded.push([offset, next]); offset = next; continue;
        }
        const html = /^<\/?([a-z][\w:-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*>/i.exec(rest);
        if (html) {
            let next = offset + html[0].length;
            if (OPAQUE_TAGS.has(html[1].toLowerCase()) && !html[0].startsWith('</')) {
                const end = new RegExp('</' + html[1] + '\\s*>', 'i').exec(source.slice(next));
                next = end ? next + end.index + end[0].length : source.length;
            }
            excluded.push([offset, next]); offset = next; continue;
        }
        offset++;
    }
    return [...source.matchAll(TAG_PATTERN)].filter(match => {
        let escapes = 0;
        for (let at = match.index - 1; at >= 0 && source[at] === '\\'; at--) escapes++;
        return escapes % 2 === 0 && !excluded.some(([start, end]) => match.index >= start && match.index < end);
    }).map(match => ({ marker: match[0], tags: normalizeChatMessageImageTags(match[1]),
        start: match.index, end: match.index + match[0].length })).filter(item => item.tags);
}

export function findRenderedChatImageTags(root, candidates, renderedTags = new Map()) {
    const document = root?.ownerDocument;
    if (!document) return { matched: [], unmatched: [] };
    const walker = document.createTreeWalker(root, 5);
    const visible = [];
    const SKIP_SELECTOR = 'code, pre, script, style, textarea, .xb-nd-img, think, thinking, status, status_bar, status-bar, mind, system, meta, options';
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement?.closest(SKIP_SELECTOR)) continue;
        if (node.nodeType === 1) {
            const rendered = renderedTags.get(node);
            if (rendered) visible.push({ node, offset: 0, marker: rendered.candidate.marker });
            continue;
        }
        for (const match of (node.nodeValue || '').matchAll(TAG_PATTERN)) visible.push({ node, offset: match.index, marker: match[0] });
    }
    const matched = [], unmatched = [];
    const rawGroups = group(candidates), shownGroups = group(visible);
    for (const [marker, shown] of shownGroups) {
        const raw = rawGroups.get(marker) || [];
        // A display regex can hide/duplicate occurrences: do not guess which raw
        // occurrence belongs to the remaining visible tag.
        if (raw.length !== shown.length) { unmatched.push(...shown); continue; }
        shown.forEach((item, index) => matched.push({ ...item, candidate: raw[index] }));
    }
    // Entries above contain the candidate as well; retain text traversal order.
    matched.sort((a, b) => visible.findIndex(item => item.node === a.node && item.offset === a.offset)
        - visible.findIndex(item => item.node === b.node && item.offset === b.offset));
    return { matched, unmatched };
}

function group(items) {
    const groups = new Map();
    for (const item of items) {
        const values = groups.get(item.marker) || [];
        values.push(item); groups.set(item.marker, values);
    }
    return groups;
}
