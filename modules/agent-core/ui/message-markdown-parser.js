import MarkdownIt from 'markdown-it';
import { full as emoji } from 'markdown-it-emoji';

// Message syntax belongs here; HTML sanitization and previews belong to message-markdown.js.
const parser = new MarkdownIt({ html: true, breaks: true, xhtmlOut: true }).use(emoji, { shortcuts: {} });
const IMAGE_DIMENSIONS = /[ \t]+=([\d]+(?:[a-z]{1,4}|%)?|\*)x([\d]+(?:[a-z]{1,4}|%)?|\*)(?=[\s)"']|$)/iy;
const UNDERLINE_MARKER = 0x5f00;

parser.inline.ruler.before('emphasis', 'message_underline', (state, silent) => {
    if (silent || state.src[state.pos] !== '_') return false;
    const scanned = state.scanDelims(state.pos, false);
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

export function parseMessageMarkdown(source) {
    return parser.render(source);
}
