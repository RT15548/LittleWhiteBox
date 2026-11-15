import MarkdownIt from 'markdown-it';
import { full as emoji } from 'markdown-it-emoji';
import { htmlContentRanges } from './markdown-html-boundaries.js';

// Message syntax belongs here; HTML sanitization and previews belong to message-markdown.js.
const parser = new MarkdownIt({ html: true, breaks: true, xhtmlOut: true }).use(emoji, { shortcuts: {} });
const IMAGE_DIMENSIONS = /[ \t]+=([\d]+(?:[a-z]{1,4}|%)?|\*)x([\d]+(?:[a-z]{1,4}|%)?|\*)(?=[\s)"']|$)/iy;
const UNDERLINE_MARKER = 0x5f00;

function scanMessageDelimiters(state, start, canSplitWord) {
    let scanned = state.scanDelims(start, canSplitWord);
    const before = state.src.slice(Math.max(0, start - 2), start);
    const end = start + scanned.length;
    const after = state.src.slice(end, Math.min(end + 2, state.posMax));
    const beforeHan = /\p{Script=Han}$/u.test(before), afterHan = /^\p{Script=Han}/u.test(after);
    // Chinese words have no separating spaces; ASCII identifiers retain their rules.
    if (!canSplitWord && (beforeHan || afterHan)) scanned = state.scanDelims(start, true);
    if (beforeHan && /^[\p{P}\p{S}]/u.test(after)) scanned.can_open = true;
    if (afterHan && /[\p{P}\p{S}]$/u.test(before)) scanned.can_close = true;
    return scanned;
}

parser.inline.ruler.before('emphasis', 'message_underline', (state, silent) => {
    if (silent || state.src[state.pos] !== '_') return false;
    const scanned = scanMessageDelimiters(state, state.pos, false);
    const token = state.push('text', '', 0);
    token.content = '_'.repeat(scanned.length);
    // Single underscores and identifiers remain literal; both __ and ___ mean underline.
    if (scanned.length === 2 || scanned.length === 3) {
        state.delimiters.push({
            marker: UNDERLINE_MARKER + scanned.length,
            length: 0,
            token: state.tokens.length - 1,
            end: -1,
            open: scanned.can_open,
            close: scanned.can_close,
        });
    }
    state.pos += scanned.length;
    return true;
});

parser.inline.ruler2.after('balance_pairs', 'message_underline', state => {
    function underline(delimiters) {
        for (const opening of delimiters) {
            if (opening.end < 0 || ![UNDERLINE_MARKER + 2, UNDERLINE_MARKER + 3].includes(opening.marker)) continue;
            const closing = delimiters[opening.end];
            for (const [delimiter, nesting] of [[opening, 1], [closing, -1]]) {
                const token = state.tokens[delimiter.token];
                token.type = nesting === 1 ? 'underline_open' : 'underline_close';
                token.tag = 'u';
                token.nesting = nesting;
                token.markup = token.content;
                token.content = '';
            }
        }
    }
    underline(state.delimiters);
    for (const meta of state.tokens_meta) if (meta?.delimiters) underline(meta.delimiters);
});

function standardRule(Parser, name) {
    const rules = new Parser().ruler;
    rules.enableOnly([name]);
    return rules.getRules('')[0];
}

const imageRule = standardRule(MarkdownIt.ParserInline, 'image');
const referenceRule = standardRule(MarkdownIt.ParserBlock, 'reference');
const fenceRule = standardRule(MarkdownIt.ParserBlock, 'fence');

// Pairing, escaping, code and nesting remain owned by the standard rules.
for (const name of ['emphasis', 'strikethrough']) {
    const rule = standardRule(MarkdownIt.ParserInline, name);
    parser.inline.ruler.at(name, (state, silent) => {
        const start = state.pos, firstDelimiter = state.delimiters.length;
        if (!rule(state, silent)) return false;
        const scanned = scanMessageDelimiters(state, start, state.src[start] !== '_');
        for (let index = firstDelimiter; index < state.delimiters.length; index++) {
            state.delimiters[index].open = scanned.can_open;
            state.delimiters[index].close = scanned.can_close;
        }
        return true;
    });
}

// The native block parser owns fence lengths, nesting, indentation and EOF.
// Keep incomplete streamed HTML as code until its closing fence arrives.
parser.block.ruler.at('fence', (state, startLine, endLine, silent) => {
    if (!fenceRule(state, startLine, endLine, silent)) return false;
    if (!silent) {
        const token = state.tokens.at(-1);
        // A closing line is consumed by the native rule but excluded from its
        // content. At EOF or a container boundary, every consumed line is code.
        const consumed = state.getLines(startLine + 1, state.line, state.sCount[startLine], true);
        token.meta = { closed: token.content !== consumed };
    }
    return true;
});
const renderFence = parser.renderer.rules.fence;
parser.renderer.rules.fence = (tokens, index, options, env, renderer) => (
    env.renderFence?.(tokens[index]) ?? renderFence(tokens, index, options, env, renderer)
);

// Restore only paragraphs emitted by this render's HTML-boundary pass, before
// inline parsing. Code and entity-decoded user text never enter this path.
parser.core.ruler.before('inline', 'message_html_boundaries', state => {
    for (let index = 1; index < state.tokens.length - 1; index++) {
        const token = state.tokens[index];
        if (token.type !== 'inline' || !state.env.htmlBoundaries?.has(token.content)) continue;
        token.type = 'html_block';
        token.content = state.env.htmlBoundaries.get(token.content);
        state.tokens[index - 1].hidden = true;
        state.tokens[index + 1].hidden = true;
    }
});

// Discover code ranges before mixed-HTML preprocessing. Disabling HTML here
// lets the same native fence rules protect code inside <details> containers.
const codeBoundaryParser = new MarkdownIt({ html: false });
codeBoundaryParser.core.ruler.enableOnly(['normalize', 'block', 'inline']);
const backticksRule = standardRule(MarkdownIt.ParserInline, 'backticks');
codeBoundaryParser.inline.ruler.at('backticks', (state, silent) => {
    const start = state.pos, tokenCount = state.tokens.length;
    if (!backticksRule(state, silent)) return false;
    if (!silent && state.tokens.length > tokenCount && state.tokens.at(-1)?.type === 'code_inline') {
        state.tokens.at(-1).meta = { start, end: state.pos };
    }
    return true;
});

function mapSourceRanges(source, ranges, prose, code = value => value) {
    let cursor = 0, result = '';
    for (const range of [...ranges].sort((left, right) => left.start - right.start)) {
        if (range.end <= cursor) continue;
        const start = Math.max(cursor, range.start);
        result += prose(source.slice(cursor, start)) + code(source.slice(start, range.end));
        cursor = range.end;
    }
    return result + prose(source.slice(cursor));
}

export function mapMessageMarkdownProse(source, transform) {
    const state = new MarkdownIt.StateCore(source, codeBoundaryParser, {});
    codeBoundaryParser.core.process(state);
    const starts = [0];
    for (let index = 0; index < state.src.length; index++) if (state.src[index] === '\n') starts.push(index + 1);
    const ranges = [];
    for (const token of state.tokens) {
        if (['fence', 'code_block'].includes(token.type)) {
            ranges.push({ start: starts[token.map[0]], end: starts[token.map[1]] ?? state.src.length, indented: token.type === 'code_block' });
        }
        for (const child of token.children || []) {
            if (child.type !== 'code_inline' || !token.content.slice(child.meta.start, child.meta.end).includes('\n')) continue;
            const firstLine = token.map[0] + token.content.slice(0, child.meta.start).split('\n').length - 1;
            const afterLine = token.map[0] + token.content.slice(0, child.meta.end).split('\n').length;
            ranges.push({ start: starts[firstLine], end: starts[afterLine] ?? state.src.length });
        }
    }
    // Existing mixed-HTML content deliberately dedents text owned by containers.
    // Literal fences/inline code cannot supply HTML owners for indented prose.
    const owners = ranges.some(range => range.indented)
        ? htmlContentRanges(mapSourceRanges(state.src, ranges.filter(range => !range.indented), value => value,
            value => value.replace(/[^\n]/g, ' '))) : [];
    return mapSourceRanges(state.src, ranges.filter(range => !range.indented
        || !owners.some(owner => owner.start <= range.start && range.end <= owner.end)), transform);
}

// Extend only destination reading, leaving label/title parsing, escaping and URL
// validation to markdown-it. The facade is local to this rule invocation, including
// nested images; it never changes another parser or another render's references.
function withImageDimensions(state, run) {
    const originalParser = state.md;
    const source = state.src;
    let dimensions = null;
    state.md = Object.assign(Object.create(originalParser), {
        helpers: {
            ...originalParser.helpers,
            parseLinkDestination(text, start, max) {
                const result = parser.helpers.parseLinkDestination(text, start, max);
                if (text !== source) return result;
                dimensions = null;
                if (!result.ok) return result;
                IMAGE_DIMENSIONS.lastIndex = result.pos;
                const match = IMAGE_DIMENSIONS.exec(text);
                if (match && IMAGE_DIMENSIONS.lastIndex <= max) {
                    result.pos = IMAGE_DIMENSIONS.lastIndex;
                    dimensions = [match[1], match[2]].map(value => value === '*' ? 'auto' : value);
                }
                return result;
            },
        },
    });
    try {
        return { matched: run(), dimensions };
    } finally {
        state.md = originalParser;
    }
}

parser.block.ruler.at('reference', (state, startLine, endLine, silent) => {
    if (state.src[state.bMarks[startLine] + state.tShift[startLine]] !== '[') return false;
    const { matched, dimensions } = withImageDimensions(state, () => referenceRule(state, startLine, endLine, silent));
    if (matched && !silent) {
        const label = state.tokens.at(-1).meta.label;
        const reference = state.env.references[label];
        // Like the destination/title, dimensions belong to the first definition.
        if (!Object.hasOwn(reference, 'imageDimensions')) reference.imageDimensions = dimensions;
    }
    return matched;
});

parser.inline.ruler.at('image', (state, silent) => {
    if (state.src[state.pos] !== '!' || state.src[state.pos + 1] !== '[') return false;
    const { matched, dimensions } = withImageDimensions(state, () => imageRule(state, silent));
    if (matched && !silent) {
        const token = state.tokens.at(-1);
        const size = dimensions || state.env.references?.[token.meta?.label]?.imageDimensions;
        if (size) {
            token.attrSet('width', size[0]);
            token.attrSet('height', size[1]);
        }
    }
    return matched;
});

export function parseMessageMarkdown(source, options = {}) {
    return parser.render(source, options);
}
