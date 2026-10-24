// 角色卡 / 列表行里的小图标按钮（启用 / 停用 / 编辑 / 删除）的线性 SVG 图标，NovelAI 角色卡与请求结构编辑器共用同一份图形。
// 样式（描边、大小、悬停）来自 preset-list-view.css 的 .char-action-button svg，这里只出图形：
// renderCharacterActionIcon 给 HTML 字符串（NovelAI 页面，插入前由调用方 sanitize），createCharacterActionIcon 直接建 DOM 节点（请求结构编辑器不拼 HTML）。
// 纯文本与 DOM 工厂，不依赖酒馆宿主模块。

const SVG_NS = 'http://www.w3.org/2000/svg';

// [标签, 属性] 列表；属性顺序即输出顺序。
const ICON_SHAPES = Object.freeze({
    enabled: [['rect', { x: 3, y: 3, width: 18, height: 18, rx: 4 }], ['path', { d: 'm8 12 3 3 5-6' }]],
    disabled: [['rect', { x: 3, y: 3, width: 18, height: 18, rx: 4 }]],
    edit: [['path', { d: 'M12 20h9' }], ['path', { d: 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z' }]],
    delete: [
        ['path', { d: 'M3 6h18' }],
        ['path', { d: 'M8 6V4h8v2' }],
        ['path', { d: 'M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6' }],
        ['path', { d: 'M10 11v6' }],
        ['path', { d: 'M14 11v6' }],
    ],
});

/** 图标的 HTML 字符串（未知名称得到空图形）。 */
export function renderCharacterActionIcon(name) {
    const shapes = (ICON_SHAPES[name] || [])
        .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([key, value]) => `${key}="${value}"`).join(' ')} />`)
        .join('');
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${shapes}</svg>`;
}

/** 图标的 DOM 节点（同一份图形）。 */
export function createCharacterActionIcon(document, name) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    for (const [tag, attrs] of ICON_SHAPES[name] || []) {
        const shape = document.createElementNS(SVG_NS, tag);
        for (const [key, value] of Object.entries(attrs)) shape.setAttribute(key, String(value));
        svg.appendChild(shape);
    }
    return svg;
}
