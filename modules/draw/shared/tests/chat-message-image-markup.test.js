import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { parseChatImageTags, findRenderedChatImageTags, normalizeChatMessageImageTags } from '../chat-message-image-markup.js';

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

test('existing tag cards and raw tags share occurrence matching without removing the cards', () => {
    const source = '[img: same] [img: same]';
    const candidates = parseChatImageTags(source);
    const { document } = parseHTML('<div><div class="xb-nd-img"><button>action</button></div> [img: same]</div>');
    const root = document.querySelector('div');
    const card = root.firstElementChild;
    const rendered = new Map([[card, { candidate: candidates[0] }]]);
    const result = findRenderedChatImageTags(root, candidates, rendered);
    assert.deepEqual(result.matched.map(item => item.candidate.start), candidates.map(item => item.start));
    assert.ok(result.matched[0].node === card);
    assert.ok(root.firstElementChild === card);
    assert.equal(findRenderedChatImageTags(root, candidates.slice(0, 1), rendered).matched.length, 0);
});
