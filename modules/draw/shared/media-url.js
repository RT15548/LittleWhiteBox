// 相对路径补全为绝对 URL。Tauritavern 等客户端把手机 UI 装在 about:srcdoc 跨域
// iframe 内：<img src="/user/..."> 会以 srcdoc 为基准解析成无效地址而裂图；
// document.baseURI 在 srcdoc 中继承父文档真实 URL，不受跨域限制，故以它为基准；
// parent.location 仅兜底。
export function toAbsoluteMediaUrl(path) {
    let raw = String(path || '').trim();
    if (!raw || /^[a-z][a-z0-9+.-]*:/i.test(raw)) return raw;
    // 旧数据可能存成无前导斜杠的 user/images/...，在 iframe 内会被解析成
    // 相对于扩展目录的错误地址；统一补成站点绝对路径。
    raw = raw.replace(/^(?:\.\.[\\/])*(user[\\/])/i, '/$1');
    let base = '';
    try {
        if (typeof document !== 'undefined' && document.baseURI) base = document.baseURI;
    } catch { /* srcdoc 跨域时 baseURI 仍可读，极端情况下退化到 parent */ }
    if (!base) {
        try { base = String(window.parent?.location?.href || ''); } catch { /* 跨域封锁 */ }
    }
    try {
        return base ? new URL(raw, base).href : raw;
    } catch {
        return raw;
    }
}
