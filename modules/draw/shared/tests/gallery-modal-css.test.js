import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parseHTML } from 'linkedom';

// 图片管理的大图查看器与图组卡片的样式 / 结构契约（事故：浅色主题下 .btn 的深色文字压在固定的深色遮罩上，“使用此图 / 保存到服务器 / 删除”几乎看不见；
// 卡片的悬停层盖住了底部日期，露出一块没有文字的深色圆角矩形）：
// - 查看器自带固定的深色表面，里面的文字 / 按钮 / 图标颜色都用 .gallery-modal 上的固定色，不引用随主题变化的令牌；每对前景 / 背景对比度 ≥ 4.5:1（最坏情况：下面垫着白色页面 / 白色图片）。
// - 三个动作是真按钮：主要（实心）/ 次要（描边）/ 危险（红字描边）；不可用时用清晰的虚线样式并带原因（已保存），而不是半透明；触控目标 ≥ 40px；有焦点环。
// - 卡片：悬停层只在图片区域内；已保存徽标有说明；徽标文字在两种主题下 ≥ 4.5:1。

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const html = read('../../providers/novelai/novel-draw.html');
const page = read('../../providers/novelai/novel-draw-page.js');
const shell = read('../settings-shell.css');
const theme = read('../draw-theme.css');

const parseColor = text => {
    const short = text.trim().match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    const hex = short ? [0, `${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`] : text.trim().match(/^#([0-9a-f]{6})$/i);
    if (hex) return { rgb: [0, 2, 4].map(i => parseInt(hex[1].slice(i, i + 2), 16)), a: 1 };
    const rgba = text.trim().match(/^rgba?\(([^)]+)\)$/);
    assert.ok(rgba, `color: ${text}`);
    const [r, g, b, a = 1] = rgba[1].split(',').map(Number);
    return { rgb: [r, g, b], a };
};
const over = (top, under) => ({ rgb: top.rgb.map((v, i) => v * top.a + under.rgb[i] * (1 - top.a)), a: 1 });
const luminance = ({ rgb }) => {
    const [r, g, b] = rgb.map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (fg, bg) => { const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a); return (hi + 0.05) / (lo + 0.05); };

const WHITE = { rgb: [255, 255, 255], a: 1 };
const rules = [...html.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({ selector: selector.trim(), body }));
const rule = (selector, css = rules) => {
    const found = css.find(item => item.selector === selector);
    assert.ok(found, `rule ${selector}`);
    return found.body;
};
const prop = (body, name) => body.match(new RegExp(`(?:^|[;\\s])${name}:\\s*([^;]+);`))?.[1].trim();
const tokens = Object.fromEntries([...rule('.gallery-modal').matchAll(/--(gm-[a-z-]+):\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()]));
const color = name => parseColor(tokens[name]);
// 最坏情况的表面：遮罩 / 顶底栏下面是白色
const overlay = over(color('gm-bg'), WHITE);
const bar = over(color('gm-bar'), overlay);

test('viewer colours: every text / icon pair on the viewer surface is at least 4.5:1', () => {
    const pairs = {
        '标题与计数': [color('gm-text'), bar], '日期 / 辅助文字': [color('gm-muted'), bar],
        '主要按钮（实心）': [color('gm-primary-ink'), color('gm-primary')],
        '次要按钮': [color('gm-text'), over({ rgb: [255, 255, 255], a: 0.06 }, bar)],
        '危险按钮': [color('gm-danger'), bar], '已保存': [color('gm-ok'), bar], '不可用（虚线）': [color('gm-off'), bar],
        '箭头（压在白色图片上）': [color('gm-text'), over(parseColor('rgba(16,18,24,0.78)'), WHITE)],
        '缩略图已保存角标': [WHITE, parseColor('#2f7d68')],
    };
    for (const [name, [fg, bg]] of Object.entries(pairs)) assert.ok(ratio(fg, bg) >= 4.5, `${name}: ${ratio(fg, bg).toFixed(2)}`);
    assert.ok(ratio(color('gm-ring'), bar) >= 3, '焦点环与深色表面可区分');
});

test('viewer css: fixed palette (no theme tokens), real disabled style, focus ring, touch targets', () => {
    const viewer = rules.filter(item => /\.gallery-modal/.test(item.selector) && !item.body.includes('--gm-bg'));
    assert.ok(viewer.length > 20);
    // 颜色只取查看器自己的固定色，不取随主题变化的令牌
    for (const { selector, body } of viewer) assert.doesNotMatch(body, /var\(--(?:text-|accent|danger|success|border|bg-)/, selector);

    assert.equal(prop(rule('.gallery-modal .btn:disabled'), 'opacity'), '1', '不可用不再靠半透明');
    assert.match(rule('.gallery-modal .btn:disabled'), /border-style:\s*dashed/);
    assert.match(rule('.gallery-modal .btn.is-saved:disabled'), /var\(--gm-ok\)/);
    assert.match(rule('.gallery-modal :focus-visible'), /outline:\s*2px solid var\(--gm-ring\)/);
    assert.match(rule('.gallery-modal .btn-primary'), /background:\s*var\(--gm-primary\)/);
    assert.match(rule('.gallery-modal .btn-danger'), /color:\s*var\(--gm-danger\)/);

    assert.ok(parseInt(prop(rule('.gallery-modal .btn'), 'min-height')) >= 40);
    assert.ok(parseInt(prop(rule('.gallery-modal-close'), 'height')) >= 40);
    assert.ok(parseInt(prop(rule('.gallery-modal-nav'), 'height')) >= 40);
    assert.ok(parseInt(prop(rule('.gallery-modal-thumb'), 'height')) >= 40);
});

test('viewer markup: top bar with counter + date + close, stage with arrows, bottom bar with thumbs and three typed buttons', () => {
    const { document } = parseHTML(html);
    const modal = document.getElementById('nd_gallery_modal');
    assert.equal(modal.getAttribute('role'), 'dialog');
    assert.equal(modal.getAttribute('aria-modal'), 'true');
    const top = modal.querySelector('.gallery-modal-top');
    assert.ok(top.querySelector('#nd_modal_info #nd_modal_counter'));
    assert.ok(top.querySelector('#nd_modal_info time#nd_modal_date'));
    assert.equal(top.querySelector('#nd_modal_close').getAttribute('aria-label'), '关闭');
    const stage = modal.querySelector('.gallery-modal-stage');
    assert.ok(stage.querySelector('#nd_modal_img'));
    for (const id of ['nd_modal_prev', 'nd_modal_next']) assert.ok(stage.querySelector(`#${id}[aria-label]`), id);
    const bottom = modal.querySelector('.gallery-modal-bottom');
    assert.ok(bottom.querySelector('#nd_modal_thumbs'));
    assert.ok(bottom.querySelector('#nd_modal_load_status[role="status"]'));
    const buttons = [...bottom.querySelectorAll('.gallery-modal-actions button')];
    assert.deepEqual(buttons.map(button => button.id), ['nd_modal_use', 'nd_modal_save', 'nd_modal_delete']);
    assert.deepEqual(buttons.map(button => button.className), ['btn btn-primary', 'btn', 'btn btn-danger']);
    for (const button of modal.querySelectorAll('button')) assert.equal(button.getAttribute('type'), 'button', button.id);
    // panel-escape.js 把 .gallery-modal.visible 当作“Esc 先交给它”的层，类名必须保留
    assert.ok(modal.classList.contains('gallery-modal'));
});

test('viewer script: the save button says why it is unavailable, thumbnails are buttons, Esc / backdrop close', () => {
    assert.match(page, /saveBtn\.title = '这个版本已经保存在服务器上';\s*saveBtn\.disabled = true;/);
    assert.match(page, /saveBtn\.title = '把这个版本保存成服务器上的图片文件';\s*saveBtn\.disabled = false;/);
    assert.match(page, /saveBtn\.classList\.toggle\('is-saved'/);
    assert.match(page, /<button type="button" class="\$\{cls\.join\(' '\)\}" data-index/);
    assert.match(page, /if \(e\.key === 'Escape'\) \{ closeGalleryModal\(\); return; \}/);
    assert.match(page, /classList\.contains\('gallery-modal-stage'\)\) closeGalleryModal\(\)/);
});

test('gallery cards: the hover layer stays inside the picture, the saved badge explains itself, badge text is readable in both themes', () => {
    assert.match(page, /<div class="gallery-slot-media">\s*<img class="gallery-slot-img"[^>]*>\s*<div class="gallery-slot-overlay">/);
    assert.match(rule('.gallery-slot-media'), /position:\s*relative/);
    assert.doesNotMatch(html, /@media \(hover: none\)[^{]*\{\s*\.gallery-slot-overlay/, '触屏上不再常驻一块盖在卡片上的深色层');
    assert.match(page, /gallery-slot-badge saved" title="已保存到服务器" aria-label="已保存到服务器"/);

    const overlayButton = rule('.gallery-slot-actions .btn');
    const surface = over(parseColor(prop(overlayButton, 'background')), WHITE);
    assert.ok(ratio(parseColor(prop(overlayButton, 'color')), surface) >= 4.5);

    const defaults = theme.match(/:root\s*\{([^}]*)\}/)[1];
    const aliases = shell.match(/:root\s*\{([^}]*)\}/)[1];
    const themes = { dark: defaults, light: theme.match(/:root\[data-draw-theme="light"\]\s*\{([^}]*)\}/)[1] };
    for (const [name, body] of Object.entries(themes)) {
        const resolve = value => value.replace(/var\((--[a-z-]+)\)/g, (_, key) => resolve(prop(body, key) || prop(defaults, key)));
        const token = key => parseColor(resolve(prop(aliases, `--${key}`)));
        for (const [label, fg, bg] of [
            ['日期', 'text-secondary', 'bg-tertiary'], ['版数徽标', 'accent', 'bg-tertiary'], ['已保存徽标', 'success', 'bg-secondary'],
        ]) assert.ok(ratio(token(fg), token(bg)) >= 4.5, `${name} ${label}: ${ratio(token(fg), token(bg)).toFixed(2)}`);
    }
    assert.match(rule('.gallery-slot-badge.saved'), /color:\s*var\(--success\)/);
    assert.match(rule('.gallery-slot-badge.saved'), /background:\s*var\(--bg-secondary\)/);
});
