// 角色页「筛选与管理」里三个模块（筛选与概览 / 智能辅助 / 分组预设）的折叠状态：纯函数。
// 三个模块的上下顺序是固定的（不能拖动），只有折叠状态会记在本机 localStorage；
// 读不到、读坏了都回到默认：全部展开。以前版本存过的 order 字段会被忽略。

export const MGMT_MODULE_IDS = Object.freeze(['filters', 'assist', 'presets']);

function parsePossiblyJson(raw) {
    if (typeof raw !== 'string') return raw;
    try { return JSON.parse(raw); } catch { return null; }
}

function knownIds(list) {
    const seen = new Set();
    const result = [];
    for (const id of Array.isArray(list) ? list : []) {
        if (typeof id !== 'string' || !MGMT_MODULE_IDS.includes(id) || seen.has(id)) continue;
        seen.add(id);
        result.push(id);
    }
    return result;
}

/** 把保存的布局（对象或它的 JSON 文本）整理成 { collapsed }：只含认识的、不重复的模块 id。 */
export function normalizeMgmtLayout(raw) {
    const value = parsePossiblyJson(raw);
    const saved = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return { collapsed: knownIds(saved.collapsed) };
}

/** 切换某个模块的折叠；不认识的 id 原样返回。 */
export function toggleMgmtCollapsed(layout, id) {
    const current = normalizeMgmtLayout(layout);
    if (!MGMT_MODULE_IDS.includes(id)) return current;
    const collapsed = current.collapsed.includes(id)
        ? current.collapsed.filter(item => item !== id)
        : [...current.collapsed, id];
    return { collapsed };
}
