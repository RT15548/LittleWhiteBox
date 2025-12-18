/**
 * @file core/variable-path.js
 * @description 变量路径解析与深层操作工具
 * @description 零依赖的纯函数模块，供多个变量相关模块使用
 */

/* ============= 路径解析 ============= */

/**
 * 解析带中括号的路径
 * @param {string} path - 路径字符串，如 "a.b[0].c" 或 "a['key'].b"
 * @returns {Array<string|number>} 路径段数组，如 ["a", "b", 0, "c"]
 * @example
 * lwbSplitPathWithBrackets("a.b[0].c")     // ["a", "b", 0, "c"]
 * lwbSplitPathWithBrackets("a['key'].b")  // ["a", "key", "b"]
 * lwbSplitPathWithBrackets("a[\"0\"].b")  // ["a", "0", "b"] (字符串"0")
 */
export function lwbSplitPathWithBrackets(path) {
    const s = String(path || '');
    const segs = [];
    let i = 0;
    let buf = '';

    const flushBuf = () => {
        if (buf.length) {
            const pushed = /^\d+$/.test(buf) ? Number(buf) : buf;
            segs.push(pushed);
            buf = '';
        }
    };

    while (i < s.length) {
        const ch = s[i];

        if (ch === '.') {
            flushBuf();
            i++;
            continue;
        }

        if (ch === '[') {
            flushBuf();
            i++;
            // 跳过空白
            while (i < s.length && /\s/.test(s[i])) i++;

            let val;
            if (s[i] === '"' || s[i] === "'") {
                // 引号包裹的字符串键
                const quote = s[i++];
                let str = '';
                let esc = false;
                while (i < s.length) {
                    const c = s[i++];
                    if (esc) {
                        str += c;
                        esc = false;
                        continue;
                    }
                    if (c === '\\') {
                        esc = true;
                        continue;
                    }
                    if (c === quote) break;
                    str += c;
                }
                val = str;
                while (i < s.length && /\s/.test(s[i])) i++;
                if (s[i] === ']') i++;
            } else {
                // 无引号，可能是数字索引或普通键
                let raw = '';
                while (i < s.length && s[i] !== ']') raw += s[i++];
                if (s[i] === ']') i++;
                const trimmed = String(raw).trim();
                val = /^-?\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
            }
            segs.push(val);
            continue;
        }

        buf += ch;
        i++;
    }

    flushBuf();
    return segs;
}

/**
 * 分离路径和值（用于命令解析）
 * @param {string} raw - 原始字符串，如 "a.b[0] some value"
 * @returns {{path: string, value: string}} 路径和值
 * @example
 * lwbSplitPathAndValue("a.b[0] hello")  // { path: "a.b[0]", value: "hello" }
 * lwbSplitPathAndValue("a.b")           // { path: "a.b", value: "" }
 */
export function lwbSplitPathAndValue(raw) {
    const s = String(raw || '');
    let i = 0;
    let depth = 0;      // 中括号深度
    let inQ = false;    // 是否在引号内
    let qch = '';       // 当前引号字符

    for (; i < s.length; i++) {
        const ch = s[i];

        if (inQ) {
            if (ch === '\\') {
                i++;
                continue;
            }
            if (ch === qch) {
                inQ = false;
                qch = '';
            }
            continue;
        }

        if (ch === '"' || ch === "'") {
            inQ = true;
            qch = ch;
            continue;
        }

        if (ch === '[') {
            depth++;
            continue;
        }

        if (ch === ']') {
            depth = Math.max(0, depth - 1);
            continue;
        }

        // 在顶层遇到空白，分割
        if (depth === 0 && /\s/.test(ch)) {
            const path = s.slice(0, i).trim();
            const value = s.slice(i + 1).trim();
            return { path, value };
        }
    }

    return { path: s.trim(), value: '' };
}

/**
 * 简单分割路径段（仅支持点号分隔）
 * @param {string} path - 路径字符串
 * @returns {Array<string|number>} 路径段数组
 */
export function splitPathSegments(path) {
    return String(path || '')
        .split('.')
        .map(s => s.trim())
        .filter(Boolean)
        .map(seg => /^\d+$/.test(seg) ? Number(seg) : seg);
}

/**
 * 规范化路径（统一为点号分隔格式）
 * @param {string} path - 路径字符串
 * @returns {string} 规范化后的路径
 * @example
 * normalizePath("a[0].b['c']")  // "a.0.b.c"
 */
export function normalizePath(path) {
    try {
        const segs = lwbSplitPathWithBrackets(path);
        return segs.map(s => String(s)).join('.');
    } catch {
        return String(path || '').trim();
    }
}

/**
 * 获取根变量名和子路径
 * @param {string} name - 完整路径
 * @returns {{root: string, subPath: string}}
 * @example
 * getRootAndPath("a.b.c")  // { root: "a", subPath: "b.c" }
 * getRootAndPath("a")      // { root: "a", subPath: "" }
 */
export function getRootAndPath(name) {
    const segs = String(name || '').split('.').map(s => s.trim()).filter(Boolean);
    if (segs.length <= 1) {
        return { root: String(name || '').trim(), subPath: '' };
    }
    return { root: segs[0], subPath: segs.slice(1).join('.') };
}

/**
 * 拼接路径
 * @param {string} base - 基础路径
 * @param {string} more - 追加路径
 * @returns {string} 拼接后的路径
 */
export function joinPath(base, more) {
    return base ? (more ? base + '.' + more : base) : more;
}

/* ============= 深层对象操作 ============= */

/**
 * 确保深层容器存在
 * @param {Object|Array} root - 根对象
 * @param {Array<string|number>} segs - 路径段数组
 * @returns {{parent: Object|Array, lastKey: string|number}} 父容器和最后一个键
 */
export function ensureDeepContainer(root, segs) {
    let cur = root;

    for (let i = 0; i < segs.length - 1; i++) {
        const key = segs[i];
        const nextKey = segs[i + 1];
        const shouldBeArray = typeof nextKey === 'number';

        let val = cur?.[key];
        if (val === undefined || val === null || typeof val !== 'object') {
            cur[key] = shouldBeArray ? [] : {};
        }
        cur = cur[key];
    }

    return {
        parent: cur,
        lastKey: segs[segs.length - 1]
    };
}

/**
 * 设置深层值
 * @param {Object} root - 根对象
 * @param {string} path - 路径（点号分隔）
 * @param {*} value - 要设置的值
 * @returns {boolean} 是否有变化
 */
export function setDeepValue(root, path, value) {
    const segs = splitPathSegments(path);
    if (segs.length === 0) return false;

    const { parent, lastKey } = ensureDeepContainer(root, segs);
    const prev = parent[lastKey];

    if (prev !== value) {
        parent[lastKey] = value;
        return true;
    }
    return false;
}

/**
 * 向深层数组推入值（去重）
 * @param {Object} root - 根对象
 * @param {string} path - 路径
 * @param {*|Array} values - 要推入的值
 * @returns {boolean} 是否有变化
 */
export function pushDeepValue(root, path, values) {
    const segs = splitPathSegments(path);
    if (segs.length === 0) return false;

    const { parent, lastKey } = ensureDeepContainer(root, segs);

    let arr = parent[lastKey];
    let changed = false;

    // 确保是数组
    if (!Array.isArray(arr)) {
        arr = arr === undefined ? [] : [arr];
    }

    const incoming = Array.isArray(values) ? values : [values];
    for (const v of incoming) {
        if (!arr.includes(v)) {
            arr.push(v);
            changed = true;
        }
    }

    if (changed) {
        parent[lastKey] = arr;
    }
    return changed;
}

/**
 * 删除深层键
 * @param {Object} root - 根对象
 * @param {string} path - 路径
 * @returns {boolean} 是否成功删除
 */
export function deleteDeepKey(root, path) {
    const segs = splitPathSegments(path);
    if (segs.length === 0) return false;

    const { parent, lastKey } = ensureDeepContainer(root, segs);

    // 父级是数组
    if (Array.isArray(parent)) {
        // 数字索引：直接删除
        if (typeof lastKey === 'number' && lastKey >= 0 && lastKey < parent.length) {
            parent.splice(lastKey, 1);
            return true;
        }
        // 值匹配：删除所有匹配项
        const equal = (a, b) => a === b || a == b || String(a) === String(b);
        let changed = false;
        for (let i = parent.length - 1; i >= 0; i--) {
            if (equal(parent[i], lastKey)) {
                parent.splice(i, 1);
                changed = true;
            }
        }
        return changed;
    }

    // 父级是对象
    if (Object.prototype.hasOwnProperty.call(parent, lastKey)) {
        delete parent[lastKey];
        return true;
    }

    return false;
}

/* ============= 值处理工具 ============= */

/**
 * 安全的 JSON 序列化
 * @param {*} v - 要序列化的值
 * @returns {string} JSON 字符串，失败返回空字符串
 */
export function safeJSONStringify(v) {
    try {
        return JSON.stringify(v);
    } catch {
        return '';
    }
}

/**
 * 尝试将原始值解析为对象
 * @param {*} rootRaw - 原始值（可能是字符串或对象）
 * @returns {Object|Array|null} 解析后的对象，失败返回 null
 */
export function maybeParseObject(rootRaw) {
    if (typeof rootRaw === 'string') {
        try {
            const s = rootRaw.trim();
            return (s && (s[0] === '{' || s[0] === '[')) ? JSON.parse(s) : null;
        } catch {
            return null;
        }
    }
    return (rootRaw && typeof rootRaw === 'object') ? rootRaw : null;
}

/**
 * 将值转换为输出字符串
 * @param {*} v - 任意值
 * @returns {string} 字符串表示
 */
export function valueToString(v) {
    if (v == null) return '';
    if (typeof v === 'object') return safeJSONStringify(v) || '';
    return String(v);
}

/**
 * 深度克隆对象（使用 structuredClone 或 JSON）
 * @param {*} obj - 要克隆的对象
 * @returns {*} 克隆后的对象
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    try {
        return typeof structuredClone === 'function'
            ? structuredClone(obj)
            : JSON.parse(JSON.stringify(obj));
    } catch {
        return obj;
    }
}
