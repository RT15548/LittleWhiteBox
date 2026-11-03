import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { parseChatImageTags, findRenderedChatImageTags, normalizeChatMessageImageTags, collectFilterRuleRanges } from '../chat-message-image-markup.js';

test('tag aliases normalize input while retaining exact source offsets', () => {
    const source = '前文[图片: sketchy: 1girl,  smile, ]后文[img: tree]';
    const tags = parseChatImageTags(source);
    assert.equal(tags.length, 2);
    assert.equal(tags[0].tags, 'nsfw, 1girl, smile');
    for (const tag of tags) assert.equal(source.slice(tag.start, tag.end), tag.marker);
    assert.equal(normalizeChatMessageImageTags('a,, b'), 'a, b');
});

test('code, comments, escapes and HTML attributes are not image requests', () => {
    const source = [
        '`[img: inline]` [img: yes]',
        '```text\n[img: fenced]\n```',
        '    [img: indented]',
        '<div title="[img: attr]">[图片: visible]</div>',
        '<pre>[img: htmlcode]</pre><!--[img: comment]-->',
        '\\[img: escaped]',
        '<script>"[img: script]"</script>',
    ].join('\n');
    assert.deepEqual(parseChatImageTags(source).map(item => item.tags), ['yes', 'visible']);
});

test('identical tags remain distinct positions, in text traversal order', () => {
    const source = '[img: a] [img: b] [img: a]';
    const { document } = parseHTML(`<div>${source}</div>`);
    const { matched, unmatched } = findRenderedChatImageTags(document.querySelector('div'), parseChatImageTags(source));
    assert.deepEqual(matched.map(item => item.candidate.start), [0, 9, 18]);
    assert.equal(unmatched.length, 0);
});

test('display-only and ambiguous duplicate output is not assigned a raw position', () => {
    const { document } = parseHTML('<div>[img: a] [img: synthetic]<code>[img: c]</code></div>');
    const result = findRenderedChatImageTags(document.querySelector('div'), parseChatImageTags('[img: a] [img: a]'));
    assert.equal(result.matched.length, 0);
    assert.equal(result.unmatched.length, 2);
});

test('visible text can be matched without changing code or attributes', () => {
    const source = '<div title="[img: attribute]">[img: visible]<code>[img: code]</code></div>';
    const { document } = parseHTML(source);
    const root = document.querySelector('div');
    const result = findRenderedChatImageTags(root, parseChatImageTags(source));
    assert.equal(result.matched.length, 1);
    assert.equal(result.matched[0].candidate.tags, 'visible');
    assert.equal(root.getAttribute('title'), '[img: attribute]');
});

test('filterRules excludes tags inside <think>/<thinking>/<status> blocks', () => {
    const filterRules = [
        { start: '<think>', end: '</think>' },
        { start: '<thinking>', end: '</thinking>' },
        { start: '<status>', end: '</status>' },
        { start: '<mind>', end: '</mind>' },
    ];
    const source = [
        '<think>思考中[img: think-a][img: think-b]</think>',
        '正文[img: visible-a]',
        '<status>状态栏[img: status-a]</status>',
        '<thinking>隐藏推理[img: think-c]</thinking>',
        '第二段正文[img: visible-b]',
    ].join('\n');
    const tags = parseChatImageTags(source, filterRules);
    assert.deepEqual(tags.map(t => t.tags), ['visible-a', 'visible-b']);
});

test('collectFilterRuleRanges handles paired rules and merges overlaps', () => {
    const source = '<think>a</think><status>b</status>[img: ok]';
    const ranges = collectFilterRuleRanges(source, [
        { start: '<think>', end: '</think>' },
        { start: '<status>', end: '</status>' },
    ]);
    assert.deepEqual(ranges, [[0, 15], [15, 31]]);
    assert.deepEqual(parseChatImageTags(source, [
        { start: '<think>', end: '</think>' },
        { start: '<status>', end: '</status>' },
    ]).map(t => t.tags), ['ok']);
});

test('collectFilterRuleRanges handles single-end rules (start-only)', () => {
    const source = '[img: a]<think>should-be-removed[img: b]';
    const ranges = collectFilterRuleRanges(source, [{ start: '<think>', end: '' }]);
    // start-only: everything from <think> onwards is excluded
    assert.deepEqual(ranges, [[source.indexOf('<think>'), source.length]]);
});

test('collectFilterRuleRanges handles single-end rules (end-only)', () => {
    const source = '[img: a]之前</think>[img: b]之后';
    const ranges = collectFilterRuleRanges(source, [{ start: '', end: '</think>' }]);
    // end-only: everything up to and including </think> is excluded
    const idx = source.indexOf('</think>');
    assert.deepEqual(ranges, [[0, idx + '</think>'.length]]);
    assert.deepEqual(parseChatImageTags(source, [{ start: '', end: '</think>' }]).map(t => t.tags), ['b']);
});

test('filterRules with identical case-insensitive tags match', () => {
    const source = '<Status>[img: hidden]</Status>正文[img: ok]';
    const tags = parseChatImageTags(source, [{ start: '<status>', end: '</status>' }]);
    assert.deepEqual(tags.map(t => t.tags), ['ok']);
});

test('filterRules empty or missing excludes nothing (backward compatible)', () => {
    const source = '<think>[img: a]</think>[img: b]';
    assert.equal(parseChatImageTags(source).length, 2);
    assert.equal(parseChatImageTags(source, []).length, 2);
    assert.equal(parseChatImageTags(source, null).length, 2);
});

test('findRenderedChatImageTags skips think/status/mind elements in DOM', () => {
    const { document } = parseHTML(`
        <div class="mes_text">
            <think>思考[img: hidden-a]</think>
            正文[img: visible]
            <status>状态[img: hidden-b]</status>
        </div>
    `);
    const root = document.querySelector('.mes_text');
    const result = findRenderedChatImageTags(root, []);
    // DOM 层过滤不依赖 candidates 数量，visible 里不应包含 think/status 内的 tag
    assert.equal(result.unmatched.length, 1);
    assert.equal(result.unmatched[0].marker, '[img: visible]');
});
