import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import FourthWallContent from '../apps/fourth-wall/ui/FourthWallContent.js';
import { parseFourthWallContent } from '../apps/fourth-wall/ui/message-content.js';

// Protect the display/media boundary, not Showdown internals: code must never
// become a media action, payloads must stay intact, and model HTML must stay inert.
async function render(source, withMedia = true) {
    const { document } = parseHTML('<html><body></body></html>');
    const content = parseFourthWallContent(source, document);
    const calls = [];
    const html = await renderToString(createSSRApp({
        render: () => h(FourthWallContent, { content }, withMedia ? {
            media: ({ segment }) => {
                calls.push(segment);
                return h('button', { 'data-media': segment.kind }, segment.value);
            },
        } : {}),
    }));
    const result = parseHTML(`<html><body>${html}</body></html>`).document;
    return { root: result.querySelector('.fourth-wall-markdown'), calls };
}

test('fourth-wall renders emphasis and block markdown while preserving media placement and payloads', async () => {
    const voice = '[voice:Happy:别忘了 *原话* 和 `符号`！]';
    const image = '[图片: 1girl, blue_eyes, (smile:1.2)]';
    const { root, calls } = await render(`*斜体* **粗体**\n第二行\n\n> 引用 ${voice}\n\n- 第一项\n- ${image}\n\n\`<标签>\`\n\n| 人物 | 状态 |\n| --- | --- |\n| 甲 | 在线 |`);
    assert.equal(root.querySelector('em').textContent, '斜体');
    assert.equal(root.querySelector('strong').textContent, '粗体');
    assert.ok(root.querySelector('p br'));
    assert.equal(root.querySelector('blockquote button').getAttribute('data-media'), 'voice');
    assert.equal(root.querySelector('li button').getAttribute('data-media'), 'image');
    assert.equal(root.querySelector('code').textContent, '<标签>');
    assert.equal(root.querySelector('table td').textContent, '甲');
    assert.deepEqual(calls, [
        { kind: 'voice', raw: voice, value: '别忘了 *原话* 和 `符号`！', emotion: 'happy' },
        { kind: 'image', raw: image, value: '1girl, blue_eyes, (smile:1.2)' },
    ]);
});

test('code, escaped tokens and link labels cannot activate media', async () => {
    const source = [
        '`[img: inline]`', '',
        '```html', '[voice:happy:fenced]', '<script>alert(1)</script>', '```', '',
        '~~~', '[图片: tilde]', '~~~', '',
        '    [img: indented]', '',
        '\\[img: escaped]', '',
        '[[voice: linked]](https://example.com)', '',
        '[img: actual]',
    ].join('\n');
    const { root, calls } = await render(source);
    assert.deepEqual(calls.map(item => item.value), ['actual']);
    assert.equal(root.querySelector('code').textContent, '[img: inline]');
    assert.match(root.querySelector('pre code').textContent, /\[voice:happy:fenced\]/);
    assert.match(root.querySelector('pre code').textContent, /<script>alert\(1\)<\/script>/);
    assert.equal(root.querySelector('a').textContent, '[voice: linked]');
    assert.equal(root.querySelector('script'), null);
    assert.match(root.textContent, /\[img: escaped\]/);
});

test('streaming renders markdown but leaves media inert until a committed message supplies media controls', async () => {
    const source = '**正在回复**\n[img: cat]\n[voice:你好]';
    const { root, calls } = await render(source, false);
    assert.equal(root.querySelector('strong').textContent, '正在回复');
    assert.equal(root.querySelector('button'), null);
    assert.equal(root.querySelector('img'), null);
    assert.match(root.textContent, /\[img: cat\]/);
    assert.match(root.textContent, /\[voice:你好\]/);
    assert.deepEqual(calls, []);
    const partial = await render('*还没结束', false);
    assert.equal(partial.root.textContent, '*还没结束');
});

test('model HTML cannot mount active content, arbitrary attributes or unsafe links even without host sanitizer', async () => {
    const { root } = await render([
        '<style>body{display:none}</style>',
        '<script>alert(1)</script>',
        '<iframe src="https://example.com"></iframe>',
        '<svg><a href="javascript:alert(1)">svg</a></svg>',
        '<img src="https://example.com/tracker" onerror="alert(1)" alt="图片说明">',
        '<p id="app" class="overlay" style="position:fixed" onclick="alert(1)">正文</p>',
        '<a href="jav&#x61;script:alert(1)">坏链接</a>',
        '[安全链接](https://example.com "标题")',
    ].join('\n\n'));
    assert.equal(root.querySelector('script, style, iframe, svg, img, input, object, embed'), null);
    assert.equal(root.querySelector('[style], [onclick], [onerror], #app, .overlay'), null);
    const links = [...root.querySelectorAll('a')];
    assert.equal(links.length, 1);
    assert.equal(links[0].getAttribute('href'), 'https://example.com');
    assert.equal(links[0].getAttribute('target'), '_blank');
    assert.equal(links[0].getAttribute('rel'), 'noopener noreferrer');
    assert.match(root.textContent, /正文/);
    assert.match(root.textContent, /图片说明/);
});
