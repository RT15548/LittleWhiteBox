// 拼 HTML 字符串时转义文本与属性值（& < > " '）；null / undefined 当作空串。
export function escapeHtml(text = '') {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
