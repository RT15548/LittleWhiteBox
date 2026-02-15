import { getContext } from '../../../../../../extensions.js';

const LWB_RULES_V2_KEY = 'LWB_RULES_V2';

let rulesTable = {};

export function loadRulesFromMeta() {
    try {
        const meta = getContext()?.chatMetadata || {};
        rulesTable = meta[LWB_RULES_V2_KEY] || {};
    } catch {
        rulesTable = {};
    }
}

export function saveRulesToMeta() {
    try {
        const meta = getContext()?.chatMetadata || {};
        meta[LWB_RULES_V2_KEY] = { ...rulesTable };
        getContext()?.saveMetadataDebounced?.();
    } catch {}
}

export function getRuleNode(absPath) {
    return matchRuleWithWildcard(absPath);
}

export function setRule(path, rule) {
    rulesTable[path] = { ...(rulesTable[path] || {}), ...rule };
}

export function clearRule(path) {
    delete rulesTable[path];
    saveRulesToMeta();
}

export function clearAllRules() {
    rulesTable = {};
    saveRulesToMeta();
}

export function getParentPath(absPath) {
    const parts = String(absPath).split('.').filter(Boolean);
    if (parts.length <= 1) return '';
    return parts.slice(0, -1).join('.');
}

/**
 * 通配符路径匹配
 * 例如：data.同行者.张三.HP 可以匹配 data.同行者.*.HP
 */
function matchRuleWithWildcard(absPath) {
    // 1. 精确匹配
    if (rulesTable[absPath]) return rulesTable[absPath];

    const segs = String(absPath).split('.').filter(Boolean);
    const n = segs.length;

    // 2. 尝试各种 * 替换组合（从少到多）
    for (let starCount = 1; starCount <= n; starCount++) {
        const patterns = generateStarPatterns(segs, starCount);
        for (const pattern of patterns) {
            if (rulesTable[pattern]) return rulesTable[pattern];
        }
    }

    // 3. 尝试 [*] 匹配（数组元素模板）
    for (let i = 0; i < n; i++) {
        if (/^\d+$/.test(segs[i])) {
            const trySegs = [...segs];
            trySegs[i] = '[*]';
            const tryPath = trySegs.join('.');
            if (rulesTable[tryPath]) return rulesTable[tryPath];
        }
    }

    return null;
}

/**
 * 生成恰好有 starCount 个 * 的所有模式
 */
function generateStarPatterns(segs, starCount) {
    const n = segs.length;
    const results = [];

    function backtrack(idx, stars, path) {
        if (idx === n) {
            if (stars === starCount) results.push(path.join('.'));
            return;
        }
        // 用原值
        if (n - idx > starCount - stars) {
            backtrack(idx + 1, stars, [...path, segs[idx]]);
        }
        // 用 *
        if (stars < starCount) {
            backtrack(idx + 1, stars + 1, [...path, '*']);
        }
    }

    backtrack(0, 0, []);
    return results;
}

function getValueType(v) {
    if (Array.isArray(v)) return 'array';
    if (v === null) return 'null';
    return typeof v;
}

/**
 * 验证操作
 * @returns {{ allow: boolean, value?: any, reason?: string, note?: string }}
 */
export function validate(op, absPath, payload, currentValue) {
    const node = getRuleNode(absPath);
    const parentPath = getParentPath(absPath);
    const parentNode = parentPath ? getRuleNode(parentPath) : null;
    const isNewKey = currentValue === undefined;

    const lastSeg = String(absPath).split('.').pop() || '';

    // ===== 1. $schema 白名单检查 =====
    if (parentNode?.allowedKeys && Array.isArray(parentNode.allowedKeys)) {
        if (isNewKey && (op === 'set' || op === 'push')) {
            if (!parentNode.allowedKeys.includes(lastSeg)) {
                return { allow: false, reason: `字段不在结构模板中` };
            }
        }
        if (op === 'del') {
            if (parentNode.allowedKeys.includes(lastSeg)) {
                return { allow: false, reason: `模板定义的字段不能删除` };
            }
        }
    }

    // ===== 2. 父层结构锁定（无 objectExt / 无 allowedKeys / 无 hasWildcard） =====
    if (parentNode && parentNode.typeLock === 'object') {
        if (!parentNode.objectExt && !parentNode.allowedKeys && !parentNode.hasWildcard) {
            if (isNewKey && (op === 'set' || op === 'push')) {
                return { allow: false, reason: '父层结构已锁定，不允许新增字段' };
            }
        }
    }

    // ===== 3. 类型锁定 =====
    if (node?.typeLock && op === 'set') {
        let finalPayload = payload;

        // 宽松：数字字符串 => 数字
        if (node.typeLock === 'number' && typeof payload === 'string') {
            if (/^-?\d+(?:\.\d+)?$/.test(payload.trim())) {
                finalPayload = Number(payload);
            }
        }

        const finalType = getValueType(finalPayload);
        if (node.typeLock !== finalType) {
            return { allow: false, reason: `类型不匹配，期望 ${node.typeLock}，实际 ${finalType}` };
        }

        payload = finalPayload;
    }

    // ===== 4. 数组扩展检查 =====
    if (op === 'push') {
        if (node && node.typeLock === 'array' && !node.arrayGrow) {
            return { allow: false, reason: '数组不允许扩展' };
        }
    }

    // ===== 5. $ro 只读 =====
    if (node?.ro && (op === 'set' || op === 'inc')) {
        return { allow: false, reason: '只读字段' };
    }

    // ===== 6. set 操作：数值约束 =====
    if (op === 'set') {
        const num = Number(payload);

        // range 限制
        if (Number.isFinite(num) && (node?.min !== undefined || node?.max !== undefined)) {
            let v = num;
            const min = node?.min;
            const max = node?.max;

            if (min !== undefined) v = Math.max(v, min);
            if (max !== undefined) v = Math.min(v, max);

            const clamped = v !== num;
            return {
                allow: true,
                value: v,
                note: clamped ? `超出范围，已限制到 ${v}` : undefined,
            };
        }

        // enum 枚举（不自动修正，直接拒绝）
        if (node?.enum?.length) {
            const s = String(payload ?? '');
            if (!node.enum.includes(s)) {
                return { allow: false, reason: `枚举不匹配，允许：${node.enum.join(' / ')}` };
            }
        }

        return { allow: true, value: payload };
    }

    // ===== 7. inc 操作：step / range 限制 =====
    if (op === 'inc') {
        const delta = Number(payload);
        if (!Number.isFinite(delta)) return { allow: false, reason: 'delta 不是数字' };

        const cur = Number(currentValue) || 0;
        let d = delta;
        const noteParts = [];

        // step 限制
        if (node?.step !== undefined && node.step >= 0) {
            const before = d;
            if (d > node.step) d = node.step;
            if (d < -node.step) d = -node.step;
            if (d !== before) {
                noteParts.push(`超出步长限制，已限制到 ${d >= 0 ? '+' : ''}${d}`);
            }
        }

        let next = cur + d;

        // range 限制
        const beforeClamp = next;
        if (node?.min !== undefined) next = Math.max(next, node.min);
        if (node?.max !== undefined) next = Math.min(next, node.max);
        if (next !== beforeClamp) {
            noteParts.push(`超出范围，已限制到 ${next}`);
        }

        return {
            allow: true,
            value: next,
            note: noteParts.length ? noteParts.join('，') : undefined,
        };
    }

    return { allow: true, value: payload };
}


