import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HTML_PREVIEW_SANDBOX, renderMarkdownToHtml } from '../../agent-core/ui/message-markdown.js';

function assertBalancedParagraphs(html: string) {
    const opens = html.match(/<p(?:\s[^>]*)?>/g)?.length || 0;
    const closes = html.match(/<\/p>/g)?.length || 0;
    assert.equal(closes, opens, html);
    assert.doesNotMatch(html, /<br\s*\/?>[^<]*<\/p>/i);
}

function withParentDomPurify(
    sanitize: (html: string, config: Record<string, unknown>) => string,
    run: () => void,
) {
    const host = globalThis as Record<string, unknown>;
    const previousParent = host.parent;
    host.parent = {
        DOMPurify: { sanitize },
    };
    try {
        run();
    } finally {
        if (previousParent === undefined) {
            delete host.parent;
        } else {
            host.parent = previousParent;
        }
    }
}

test('tavern markdown renders emphasis from the bundled parser without global libraries', () => {
    const html = renderMarkdownToHtml('*文字*');

    assert.match(html, /<em>文字<\/em>/);
});

test('tavern markdown collapses blank-like spacer lines instead of rendering empty paragraphs', () => {
    const html = renderMarkdownToHtml([
        '你好',
        '',
        '&nbsp;',
        '',
        '\u200b',
        '',
        '我好',
    ].join('\n'));

    assert.match(html, /^<p>你好<\/p>\s*<p>我好<\/p>$/);
    assert.doesNotMatch(html, /<p>(?:&nbsp;|\u200b|\s)*<\/p>/);
});

test('tavern markdown lets ordinary message HTML reach the ST message sanitizer', () => {
    const calls: Array<{ html: string; config: Record<string, unknown> }> = [];

    withParentDomPurify((html, config) => {
        calls.push({ html, config });
        return html.replace(/<script[\s\S]*?<\/script>/gi, '');
    }, () => {
        const html = renderMarkdownToHtml([
            '<details><summary>abc</summary>',
            '<div class="panel"><span>$1 内容</span></div>',
            '<table><tbody><tr><td>Seraphina</td></tr></tbody></table>',
            '<script>alert(1)</script>',
            '</details>',
            '',
            '正文在折叠后',
        ].join('\n'));

        assert.match(html, /<details><summary>abc<\/summary>/);
        assert.match(html, /<div class="panel"><span>\$1 内容<\/span><\/div>/);
        assert.match(html, /<table><tbody><tr><td>Seraphina<\/td><\/tr><\/tbody><\/table>/);
        assert.match(html, /正文在折叠后/);
        assert.doesNotMatch(html, /<script/i);
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].config.MESSAGE_SANITIZE, true);
    assert.deepEqual(calls[0].config.ADD_TAGS, ['custom-style']);
});

test('tavern markdown keeps guidance details boundaries around markdown content', () => {
    const html = renderMarkdownToHtml([
        '<details><summary><div>状态</div></summary><div>',
        '## 指引标题',
        '',
        '- 第一条',
        '- 第二条',
        '</div></details>',
        '正文在折叠后',
    ].join('\n'));

    assert.match(html, /<details><summary><div>状态<\/div><\/summary><div>/);
    assert.match(html, /<h2 id="">指引标题<\/h2>/);
    assert.match(html, /<ul>\s*<li>第一条<\/li>\s*<li>第二条<\/li>\s*<\/ul>\s*<\/div><\/details>/);
    assert.match(html, /<\/details>\s*<p>正文在折叠后<\/p>/);
    assert.doesNotMatch(html, /<\/details>\s*<\/li>/);
    assert.doesNotMatch(html, /<\/details>\s*<\/p>/);
    assertBalancedParagraphs(html);
});

test('tavern markdown protects nested inline HTML structure lines without breaking markdown ownership', () => {
    const html = renderMarkdownToHtml([
        '<details>',
        '  <summary>',
        '    <span class="guide-title">状态</span>',
        '  </summary>',
        '  <div>',
        '## 指引标题',
        '',
        '- 第一条',
        '- 第二条',
        '  </div>',
        '</details>',
        '',
        '正文在折叠后',
    ].join('\n'));

    assert.match(html, /<details>\s*<summary>\s*<span class="custom-guide-title">状态<\/span>\s*<\/summary>\s*<div>/);
    assert.match(html, /<h2 id="">指引标题<\/h2>/);
    assert.match(html, /<ul>\s*<li>第一条<\/li>\s*<li>第二条<\/li>\s*<\/ul>\s*<\/div>\s*<\/details>/);
    assert.match(html, /<\/details>\s*<p>正文在折叠后<\/p>/);
    assert.doesNotMatch(html, /<\/details>\s*<\/li>/);
    assert.doesNotMatch(html, /<\/summary>\s*<\/p>/);
    assertBalancedParagraphs(html);
});

test('tavern markdown protects generic HTML container boundaries around markdown lists', () => {
    const html = renderMarkdownToHtml([
        '<section class="panel"><div>',
        '### 面板标题',
        '',
        '1. 第一项',
        '2. 第二项',
        '</div></section>',
        '',
        '外部正文',
    ].join('\n'));

    assert.match(html, /<section class="custom-panel"><div>/);
    assert.match(html, /<h3 id="">面板标题<\/h3>/);
    assert.match(html, /<ol>\s*<li>第一项<\/li>\s*<li>第二项<\/li>\s*<\/ol>\s*<\/div><\/section>/);
    assert.match(html, /<\/section>\s*<p>外部正文<\/p>/);
    assert.doesNotMatch(html, /<\/section>\s*<\/li>/);
    assert.doesNotMatch(html, /<\/section>\s*<\/p>/);
    assertBalancedParagraphs(html);
});

test('tavern markdown keeps protected html boundaries out of mixed paragraphs', () => {
    const cases = [
        {
            name: 'opening container before plain text',
            markdown: ['<div>', 'plain text', '</div>'].join('\n'),
            expected: /<div>\s*<p>plain text<\/p>\s*<\/div>/,
        },
        {
            name: 'custom roleplay container before outside text',
            markdown: ['<fictional_scenarios>', '“谢谢”', '</fictional_scenarios>', '正文'].join('\n'),
            expected: /<fictional_scenarios>\s*<p>“谢谢”<\/p>\s*<\/fictional_scenarios>\s*<p>正文<\/p>/,
        },
        {
            name: 'single line inline html before plain text',
            markdown: ['<span>状态</span>', '正文'].join('\n'),
            expected: /<span>状态<\/span>\s*<p>正文<\/p>/,
        },
        {
            name: 'nested containers around markdown list before outside text',
            markdown: ['<section><div>', '- item', '</div></section>', '正文'].join('\n'),
            expected: /<section><div>\s*<ul>\s*<li>item<\/li>\s*<\/ul>\s*<\/div><\/section>\s*<p>正文<\/p>/,
        },
    ];

    for (const item of cases) {
        const html = renderMarkdownToHtml(item.markdown);
        assert.match(html, item.expected, item.name);
        assert.doesNotMatch(html, /@@XBHTMLRAW/, item.name);
        assertBalancedParagraphs(html);
    }
});

test('tavern markdown keeps original guidance template ownership stable without spacer lines', () => {
    const html = renderMarkdownToHtml([
        '<details><summary><div>深层思考中</div></summary><div>',
        '## Guidance',
        '',
        '- 第一条',
        '- 第二条',
        '</div></details>',
        '<fictional_scenarios>',
        '正文',
        '</fictional_scenarios>',
    ].join('\n'));

    assert.doesNotMatch(html, /<pre/i);
    assert.match(html, /<summary><div>深层思考中<\/div><\/summary>/);
    assert.match(html, /<details>[\s\S]*<h2 id="[^"]*">Guidance<\/h2>[\s\S]*<ul>\s*<li>第一条<\/li>\s*<li>第二条<\/li>\s*<\/ul>[\s\S]*<\/details>/);
    assert.match(html, /<\/details>\s*<fictional_scenarios>\s*<p>正文<\/p>\s*<\/fictional_scenarios>/);
    assert.doesNotMatch(html, /<details>[\s\S]*<fictional_scenarios>[\s\S]*<\/details>/);
    assert.doesNotMatch(html, /<\/details>\s*<\/p>/);
    assertBalancedParagraphs(html);
});

test('tavern markdown sanitizes ordinary chat HTML without disabling html code block previews', () => {
    const html = renderMarkdownToHtml([
        '<script>alert(1)</script>',
        '[bad](javascript:alert(2))',
        '<details ontoggle=alert(3) open><summary onclick=alert(4)>abc</summary>正文</details>',
    ].join('\n'));

    assert.doesNotMatch(html, /<script/i);
    assert.doesNotMatch(html, /javascript:/i);
    assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
    assert.match(html, /<details open><summary>abc<\/summary>/);
});

test('tavern markdown decodes style tags as scoped ST-style message CSS', () => {
    const html = renderMarkdownToHtml([
        '<style>.foo{color:red}</style>',
        '<span class="foo">红字</span>',
    ].join('\n'));

    assert.match(html, /<style>[\s\S]*\.xb-tavern-markdown \.custom-foo, \.xb-assistant-markdown \.custom-foo\{color:red\}[\s\S]*<\/style>/);
    assert.match(html, /<span class="custom-foo">红字<\/span>/);
    assert.doesNotMatch(html, /<p>\.foo\{color:red\}<\/p>/);
    assert.doesNotMatch(html, /<custom-style/i);
});

test('tavern markdown does not turn ordinary standalone HTML documents into iframe previews', () => {
    const html = renderMarkdownToHtml([
        '<!doctype html>',
        '<html><body><div>普通正文 HTML</div></body></html>',
    ].join('\n'));

    assert.doesNotMatch(html, /xb-markdown-html-placeholder/);
    assert.doesNotMatch(html, /@@XBHTMLBLOCK/);
    assert.match(html, /普通正文 HTML/);
});

test('tavern markdown folds fenced html code into iframe preview placeholders', () => {
    const html = renderMarkdownToHtml([
        '```html',
        '<main><script>window.__preview = true</script></main>',
        '```',
    ].join('\n'));

    assert.match(html, /xb-markdown-html-placeholder/);
    assert.doesNotMatch(html, /<script/i);
    assert.equal(HTML_PREVIEW_SANDBOX, 'allow-scripts');
});

test('tavern markdown folds unlabeled fenced html documents into iframe preview placeholders', () => {
    const html = renderMarkdownToHtml([
        '```',
        '<!DOCTYPE html>',
        '<html lang="zh-CN"><body><main>预览</main></body></html>',
        '```',
    ].join('\n'));

    assert.match(html, /xb-markdown-html-placeholder/);
    assert.doesNotMatch(html, /<pre><code/);
});

test('tavern roleplay markdown can keep fenced html as stable code anchors', () => {
    const markdown = [
        '```html',
        '<main class="status-bar"><strong>状态</strong></main>',
        '```',
        '',
        '<details><summary>角色表</summary>',
        '',
        '| 项目 | 内容 |',
        '|---|---|',
        '| 名字 | 伊曼 |',
        '',
        '</details>',
    ].join('\n');
    const first = renderMarkdownToHtml(markdown, { htmlFenceMode: 'code' });
    const second = renderMarkdownToHtml(markdown, { htmlFenceMode: 'code' });

    assert.equal(first, second);
    assert.match(first, /<pre><code/);
    assert.match(first, /status-bar/);
    assert.match(first, /<details><summary>角色表<\/summary>/);
    assert.doesNotMatch(first, /xb-markdown-html-placeholder/);
    assert.doesNotMatch(first, /@@XBHTMLBLOCK/);
});

test('tavern roleplay markdown follows ST-like raw tag boundaries around guidance templates', () => {
    const markdown = [
        '<details style="margin: 8px 0;">',
        '    <summary style="display: flex;">',
        '        <div class="xb-char-avatar"></div>',
        '        <span>深层思考中...</span>',
        '    </summary>',
        '    <div style="padding: 10px 12px;">',
        '        已完成场景认知、角色校准与避雷处理；以下仅呈现当前可见行动、对白与NPC内心，不展开隐藏推理。',
        '    </div>',
        '</details>',
        '',
        '<fictional_scenarios>',
        '“哈喽！是我！”你喊。',
        '',
        '',
        '</fictional_scenarios>',
        '',
        '```状态栏',
        '时间：未明确；当前为南昌昌北国际机场到达大厅接机瞬间',
        '',
        '```',
    ].join('\n');

    const html = renderMarkdownToHtml(markdown, {
        htmlFenceMode: 'code',
        protectRawHtmlBoundaries: false,
    });

    assert.match(html, /<details[\s\S]*<summary[\s\S]*深层思考中(?:\.\.\.|…)[\s\S]*<\/details>/);
    assert.doesNotMatch(html, /<details[\s\S]*<pre><code>[\s\S]*场景认知[\s\S]*<\/code><\/pre>[\s\S]*<\/details>/);
    assert.match(html, /<fictional_scenarios>[\s\S]*哈喽！是我！[\s\S]*<\/fictional_scenarios>/);
    assert.match(html, /<pre><code class="custom-状态栏 custom-language-状态栏">[\s\S]*南昌昌北国际机场[\s\S]*<\/code><\/pre>/);
    assert.doesNotMatch(html, /xb-markdown-html-placeholder/);
    assert.doesNotMatch(html, /@@XBHTMLRAW|@@XBHTMLBLOCK/);
    assert.doesNotMatch(html, /<details[\s\S]*<fictional_scenarios>[\s\S]*<\/details>/);
});
