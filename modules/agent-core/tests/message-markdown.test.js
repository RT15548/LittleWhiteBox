import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { enhanceHtmlBlocks, renderMarkdownToHtml } from '../ui/message-markdown.js';

// Acceptance (missing or misread chat content): existing underline, image sizes,
// emoji, code and mixed HTML remain readable, including repeated/partial renders.
// Chinese prose next to punctuation must retain the intended emphasis spans;
// literal code and escaped markers must not become formatting (misread content).
// Acceptance (script execution / credential exposure): message HTML stays sanitized;
// runnable HTML previews stay isolated from the host in a sandboxed iframe.
// Code blocks, including partial streams, retain literal HTML for display/copy
// and never load images in the message (lost code / unintended network requests).
// Placeholder-looking source text survives every render verbatim (lost content).
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

test('Chinese punctuation keeps emphasis paired without changing literal content', () => {
    const source = '这张卡叫**《解铃会》**，是**用变量 3.0**做的经营模拟卡。';
    const cases = [
        [source, ['《解铃会》', '用变量 3.0']],
        ['这张卡叫**《解铃会》，是用变量 3.0** 做的经营模拟卡。', ['《解铃会》，是用变量 3.0']],
        ['中文**（重点）**继续，中文**"重点"**继续，𠮷**《书名》**𠮷', ['（重点）', '"重点"', '《书名》']],
        ['前文**《书名》与*斜体***后文', ['《书名》与斜体']],
        ['[查看**《书名》**详情](https://example.com)', ['《书名》']],
    ];
    for (let repeat = 0; repeat < 2; repeat++) {
        for (const [source, spans] of cases) {
            const body = content(source);
            assert.deepEqual([...body.querySelectorAll('strong')].map(node => node.textContent), spans);
            assert.equal(body.textContent.trim(), source.startsWith('[') ? '查看《书名》详情' : source.replaceAll('*', ''));
        }
        const partial = source.slice(0, source.indexOf('**，'));
        assert.equal(content(partial).textContent.trim(), partial);
    }
    const literal = content('中文`**《书名》**`继续\n\n```text\n中文**《书名》**继续\n```\n\n中文\\**《书名》\\**继续\n\nenglish**(text)**word');
    assert.equal(literal.querySelector('strong'), null);
    assert.deepEqual([...literal.querySelectorAll('code')].map(node => node.textContent), ['**《书名》**', '中文**《书名》**继续\n']);
    assert.ok(literal.textContent.includes('中文**《书名》**继续'));
    assert.ok(literal.textContent.includes('english**(text)**word'));
});

test('Chinese underline and strikethrough share emphasis boundaries without changing identifiers', () => {
    const body = content('前文__重点__后文，前文___（下划线）___后文，前文~~（已删除）~~后文，前文__《**书名**》__后文');
    assert.deepEqual([...body.querySelectorAll('u')].map(node => node.textContent), ['重点', '（下划线）', '《书名》']);
    assert.equal(body.querySelector('s').textContent, '（已删除）');
    assert.equal(body.querySelector('u strong').textContent, '书名');
    const literal = 'foo__bar__baz _中文_ foo_bar_baz';
    assert.equal(content(literal).textContent.trim(), literal);
    assert.equal(content('前文\\__重点\\__后文').textContent.trim(), '前文__重点__后文');
    assert.equal(content('前文`__重点__ ~~删除~~`后文').querySelector('code').textContent, '__重点__ ~~删除~~');
});

test('native code boundaries keep HTML literal across fences, indentation, line endings and streams', () => {
    const code = '<div>完整标签</div>\n<img src="/must-not-load" alt="图片代码">';
    const cases = [
        ['```text\n' + code + '\n````', code + '\n'],
        ['前文\n\n  ```text\n' + code.split('\n').map(line => '  ' + line).join('\n') + '\n  ```', code + '\n'],
        ['```text\r\n' + code.replaceAll('\n', '\r\n') + '\r\n```\r\n\r\n后文', code + '\n'],
        ['~~~text\n' + code + '\n~~~~', code + '\n'],
        ['> ```text\n' + code.split('\n').map(line => '> ' + line).join('\n') + '\n> ```', code + '\n'],
        ['- ```text\n' + code.split('\n').map(line => '  ' + line).join('\n') + '\n  ```', code + '\n'],
        ['    ' + code.replaceAll('\n', '\n    '), code + '\n'],
        ['```html\n' + code, code],
        ['```html\n' + code + '\n    ```', code + '\n    ```'],
        ['> ```html\n> ' + code.replaceAll('\n', '\n> ') + '\n\n后文', code + '\n'],
    ];
    for (const [source, expected] of [...cases, ...cases.toReversed()]) {
        const body = content(source);
        assert.equal(body.querySelector('code')?.textContent, expected, source);
        assert.equal(body.querySelector('img, code div, [data-xb-html-language]'), null, source);
    }
    for (const suffix of ['', '\n`', '\n``', '\n```']) {
        const body = content('```text\n' + code + suffix);
        assert.ok(body.querySelector('code').textContent.startsWith(code));
        assert.equal(body.querySelector('img'), null);
        assert.ok(!body.textContent.includes('@@XB'));
    }
    for (const suffix of ['', ' ``']) {
        assert.equal(content('`<span>\n<strong>原样</strong>\n</span>`' + suffix).querySelector('code').textContent, '<span> <strong>原样</strong> </span>');
    }
});

test('placeholder-looking text remains literal beside real HTML and previews', () => {
    const markers = ['@@XBHTMLRAW:example@@', '@@XBHTMLBLOCK:example@@', '@@XB_HTML_BLOCK_example@@', '@@XBMARKDOWN:0@@'];
    for (const marker of markers) {
        for (const wrap of [value => value, value => '`' + value + '`', value => '```text\n' + value + '\n```']) {
            const body = content(wrap(marker) + '\n\n<div>正文</div>\n\n```html\n<div>预览</div>\n```');
            enhanceHtmlBlocks(body, { htmlBlockMode: 'code' });
            assert.ok(body.textContent.includes(marker), wrap(marker));
            assert.ok(body.textContent.includes('正文'));
            assert.ok(body.textContent.includes('<div>预览</div>'));
        }
    }
    const first = content('```html\n<div>第一条</div>\n```');
    const second = content('```html\n<div>第二条</div>\n```');
    enhanceHtmlBlocks(second, { htmlBlockMode: 'code' });
    enhanceHtmlBlocks(first, { htmlBlockMode: 'code' });
    assert.equal(first.textContent.trim(), '<div>第一条</div>');
    assert.equal(second.textContent.trim(), '<div>第二条</div>');
    assert.equal(content('@@XBMARKDOWN&#58;0@@\n\n<div>正文</div>').querySelector('p').textContent, '@@XBMARKDOWN:0@@');
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
    assert.equal(content('<details>\n<summary>展开</summary>\n\n    **内容**\n\n</details>').querySelector('details strong').textContent, '内容');
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
    const code = '<div class="status" onclick="alert(1)">$&</div>';
    for (const source of ['```html\n' + code + '\n````', '> ~~~html\n> ' + code + '\n> ~~~~', '- ```html\n  ' + code + '\n  ```']) {
        const body = content(source);
        assert.equal(body.querySelector('script, div'), null);
        enhanceHtmlBlocks(body, { htmlBlockMode: 'code' });
        assert.equal(body.querySelector('pre').textContent, code + '\n');
    }
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
