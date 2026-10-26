// 拖拽落点指示的样式契约：所有可排序列表共用 settings-shell.css 里的这一份（三个页面都引入它）。
// 事故（落点线消失）：角色标签页的灰度层次给 #nd_char_list .char-card / .char-group 写了更高优先级的 box-shadow，
// 把 .drop-before / .drop-after 的线盖掉了；所以共用规则必须用 !important，且各表面不得再自带一份（否则又会各改各的）。
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const shell = read('../settings-shell.css');

test('settings-shell.css owns the drop markers: a line before / after the row in the theme-aware focus colour, and a dashed box for dropping into a group', () => {
    assert.match(shell, /\.drop-before\s*\{[^}]*box-shadow:[^;}]*var\(--border-focus\)[^;}]*!important/);
    assert.match(shell, /\.drop-after\s*\{[^}]*box-shadow:[^;}]*var\(--border-focus\)[^;}]*!important/);
    assert.match(shell, /\.drop-into\s*\{[^}]*outline:[^;}]*dashed[^;}]*var\(--border-focus\)/);
    // --border-focus 在深色 / 浅色（含强制 data-draw-theme）里都有定义
    assert.match(shell, /:root\s*\{[^}]*--border-focus:/);
    assert.match(shell, /--border-focus:\s*var\(--draw-border-focus\)/);
    const theme = read('../draw-theme.css');
    assert.match(theme, /:root\[data-draw-theme="light"\]\s*\{[^}]*--draw-border-focus:/);
});

test('no other stylesheet or page redefines the markers, and every settings page loads settings-shell.css', () => {
    const files = [
        ...readdirSync(new URL('..', import.meta.url)).filter(name => name.endsWith('.css') && name !== 'settings-shell.css').map(name => `../${name}`),
        '../../providers/novelai/novel-draw.html', '../../providers/sd-webui/sd-draw.html', '../../providers/comfyui/comfy-draw.html',
    ];
    for (const file of files) {
        assert.doesNotMatch(read(file), /\.(?:lwb-cl-)?drop-(?:before|after|into)\s*[{,]/, `${file} 不应再定义落点样式`);
    }
    for (const page of files.filter(file => file.endsWith('.html'))) {
        assert.match(read(page), /href="\.\.\/\.\.\/shared\/settings-shell\.css"/, `${page} 引入共用外壳`);
    }
});
