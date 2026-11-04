import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { enhanceHtmlBlocks, renderMarkdownToHtml } from '../ui/message-markdown.js';

// Acceptance (missing or misread chat content): existing underline, image sizes,
// emoji, code and mixed HTML remain readable, including repeated/partial renders.
// Acceptance (script execution / credential exposure): message HTML stays sanitized;
// runnable HTML previews stay isolated from the host in a sandboxed iframe.
function content(source, options) {
    return parseHTML(`<html><body>${renderMarkdownToHtml(source, options)}</body></html>`).document.body;
}

test('chat formatting preserves content, underline syntax and literal code', () => {
    const body = content('__下划线__ ___另一处___ **粗体** *斜体* ~~删除~~ foo_bar_baz _原样_ :smile: :)\n下一行\n\n`__代码__ :smile:`\n\n- 父项\n  - 子项\n\n| 名称 | 内容 |\n| --- | --- |\n| A | B |');
    assert.deepEqual([...body.querySelectorAll('u')].map(node => node.textContent), ['下划线', '另一处']);
    assert.equal(body.querySelector('strong').textContent, '粗体');
    assert.equal(body.querySelector('em').textContent, '斜体');
    assert.equal(body.querySelector('del, s').textContent, '删除');
    assert.ok(body.textContent.includes('foo_bar_baz _原样_ 😄 :)'));
    assert.ok(body.querySelector('br'));
    assert.equal(body.querySelector('code').textContent, '__代码__ :smile:');
    assert.equal(body.querySelector('li li').textContent, '子项');
    assert.equal(body.querySelector('td').textContent, 'A');
    assert.ok(content('\\__原样__').textContent.includes('__原样__'));
});

test('inline and reference images preserve dimensions without leaking between renders', () => {
    for (let repeat = 0; repeat < 2; repeat += 1) {
        const body = content('![图](image.png =100x200 "标题")\n\n![自动](auto.png =*x200)\n\n![百分比](ratio.png =50%x20%)\n\n![引用][p]\n\n[p]: reference.png =120x80 "引用标题"');
        const images = [...body.querySelectorAll('img')];
        assert.deepEqual(images.map(node => [node.getAttribute('src'), node.getAttribute('width'), node.getAttribute('height')]), [
            ['image.png', '100', '200'], ['auto.png', 'auto', '200'], ['ratio.png', '50%', '20%'], ['reference.png', '120', '80'],
        ]);
        assert.equal(images[0].getAttribute('title'), '标题');
        assert.equal(images[3].getAttribute('title'), '引用标题');
        assert.equal(content('![普通](image.png)').querySelector('img').getAttribute('width'), null);
    }
    assert.equal(content('`![代码](image.png =100x200)`').querySelector('img'), null);
    const duplicate = content('![图][p]\n\n[p]: first.png\n[p]: second.png =100x200').querySelector('img');
    assert.equal(duplicate.getAttribute('src'), 'first.png');
    assert.equal(duplicate.getAttribute('width'), null);
    const nested = content('[__链接__](https://example.com) ![__图片__](image.png =100x200)');
    assert.equal(nested.querySelector('a u').textContent, '链接');
    assert.equal(nested.querySelector('img').getAttribute('alt'), '图片');
});

test('mixed HTML retains surrounding prose, collapsible text and scoped styles', () => {
    const source = '前文\n<details><summary>展开</summary>\n    __状态__\n    **内容**\n</details>\n后文\n\n<style>.status { color: red; }</style>\n<div class="status">状态栏</div>';
    for (let repeat = 0; repeat < 2; repeat += 1) {
        const body = content(source);
        for (const text of ['前文', '展开', '状态', '内容', '后文', '状态栏']) assert.ok(body.textContent.includes(text), text);
        assert.equal(body.querySelector('details u').textContent, '状态');
        assert.equal(body.querySelector('details strong').textContent, '内容');
        assert.ok(body.querySelector('style').textContent.includes('.xb-tavern-markdown .custom-status'));
        assert.equal(body.querySelector('div').className, 'custom-status');
        assert.ok(!body.innerHTML.includes('@@XB'));
    }
});

test('partial streaming renders never lose literal content to a previous render', () => {
    const parts = ['开头 __尚未', '开头 __尚未结束__', '正文\n<details><summary>展开</summary>\n未闭合', '正文\n<details><summary>展开</summary>\n未闭合\n</details>\n结尾'];
    for (const part of [...parts, ...parts.reverse()]) {
        const body = content(part);
        assert.ok(body.textContent.includes(part.startsWith('开头') ? '尚未' : '未闭合'));
        assert.ok(!body.innerHTML.includes('@@XB'));
    }
});

test('HTML fences stay code or isolated previews without executing in the message', () => {
    const source = '之前\n\n```html\n<div>预览</div><script>window.secret = 1;</script>\n```\n\n之后';
    const codeBody = content(source, { htmlFenceMode: 'code' });
    assert.equal(codeBody.querySelector('script'), null);
    assert.ok(codeBody.querySelector('code').textContent.includes('<script>'));
    const body = content(source);
    assert.equal(body.querySelector('script'), null);
    enhanceHtmlBlocks(body, { htmlBlockMode: 'preview' });
    const iframe = body.querySelector('iframe');
    assert.equal(iframe.getAttribute('sandbox'), 'allow-scripts');
    assert.ok(iframe.srcdoc.includes('<script>'));
    assert.ok(body.textContent.includes('之前'));
    assert.ok(body.textContent.includes('之后'));
});

test('untrusted Markdown and raw HTML cannot emit active message content', () => {
    const source = '[危险](javascript:alert%281%29)\n\n![危险](javascript:alert%281%29 =100x200)\n\n<img src="x" onerror="alert(1)"><a href="&#106;avascript:alert(1)">链接</a>\n\n<script>alert(1)</script>\n\n| 表头 | 内容 |\n| --- | --- |\n| A | B |';
    const body = content(source);
    assert.equal(body.querySelector('script'), null);
    for (const node of body.querySelectorAll('*')) {
        for (const attr of [...node.attributes]) {
            assert.ok(!/^on/i.test(attr.name));
            if (['href', 'src'].includes(attr.name)) assert.ok(!/^javascript:/i.test(attr.value));
        }
    }
    assert.equal(body.querySelector('th').textContent, '表头');
});
