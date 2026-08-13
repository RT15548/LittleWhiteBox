// ═══════════════════════════════════════════════════════════════════════════
// Gold Eval - 金标准用例解析与校验（纯函数，不依赖 LittleWhiteBox 内部模块）
//
// 用例格式遵循 总结测试/CASE_SCHEMA.md v1：
//   { id, dataset, split, category, atFloor, query,
//     expectedAnswer: { type, ... },
//     evidence: { requiredAll, requiredAny, supporting, forbiddenAsCurrent },
//     provenance: { method, verifier, status }, notes }
//
// 规则：
// - provenance.status !== 'accepted' 的用例保留解析但不进入主评分（split='disputed' 同理）。
// - split 只能是 dev / holdout / disputed。
// - category 使用 EVALUATION_PROTOCOL.md §2 定义的能力类别。
// ═══════════════════════════════════════════════════════════════════════════

export const CASE_CATEGORIES = Object.freeze([
    'fact',
    'update',
    'temporal',
    'causal',
    'associative',
    'alias',
    'global',
    'abstention',
]);

export const CASE_SPLITS = Object.freeze(['dev', 'holdout', 'disputed']);

export const ANSWER_TYPES = Object.freeze([
    'exact',
    'contains',
    'regex',
    'abstain',
    'llm-judge',
]);

const FLOOR_FIELDS = ['requiredAll', 'requiredAny', 'supporting', 'forbiddenAsCurrent'];

function isNonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
}

function normalizeFloorList(value, fieldName, errors) {
    if (value == null) return [];
    if (!Array.isArray(value)) {
        errors.push(`evidence.${fieldName} 必须是数组`);
        return [];
    }
    const out = [];
    for (const item of value) {
        if (!isNonNegativeInteger(item)) {
            errors.push(`evidence.${fieldName} 含非法楼层: ${JSON.stringify(item)}`);
            continue;
        }
        out.push(item);
    }
    return [...new Set(out)].sort((a, b) => a - b);
}

/**
 * 校验并规范化单个用例对象。
 * @param {object} raw 原始 JSON 对象
 * @param {number} lineNo 在 JSONL 中的行号（1-based），用于报错定位
 * @returns {{ ok: boolean, errors: string[], case: object|null }}
 */
export function validateCase(raw, lineNo = 0) {
    const errors = [];
    const where = lineNo > 0 ? `第 ${lineNo} 行` : '用例';

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return { ok: false, errors: [`${where}: 不是 JSON 对象`], case: null };
    }

    const id = String(raw.id || '').trim();
    if (!id) errors.push(`${where}: 缺少 id`);

    const dataset = String(raw.dataset || '').trim();
    if (!dataset) errors.push(`${where} (${id || '?'}): 缺少 dataset`);

    const split = String(raw.split || '').trim();
    if (!CASE_SPLITS.includes(split)) {
        errors.push(`${where} (${id}): split 必须是 ${CASE_SPLITS.join('/')}`);
    }

    const category = String(raw.category || '').trim();
    if (!CASE_CATEGORIES.includes(category)) {
        errors.push(`${where} (${id}): category 必须是 ${CASE_CATEGORIES.join('/')}`);
    }

    const atFloor = raw.atFloor;
    if (!isNonNegativeInteger(atFloor)) {
        errors.push(`${where} (${id}): atFloor 必须是非负整数`);
    }

    const query = String(raw.query || '').trim();
    if (!query) errors.push(`${where} (${id}): 缺少 query`);

    const expectedAnswer = raw.expectedAnswer && typeof raw.expectedAnswer === 'object'
        ? { ...raw.expectedAnswer }
        : null;
    if (!expectedAnswer) {
        errors.push(`${where} (${id}): 缺少 expectedAnswer`);
    } else {
        const type = String(expectedAnswer.type || '').trim();
        if (!ANSWER_TYPES.includes(type)) {
            errors.push(`${where} (${id}): expectedAnswer.type 必须是 ${ANSWER_TYPES.join('/')}`);
        }
        if (type === 'exact' && !Array.isArray(expectedAnswer.values)) {
            errors.push(`${where} (${id}): exact 答案需要 values 数组`);
        }
        if (type === 'contains' && !Array.isArray(expectedAnswer.substrings)) {
            errors.push(`${where} (${id}): contains 答案需要 substrings 数组`);
        }
        if (type === 'regex' && typeof expectedAnswer.pattern !== 'string') {
            errors.push(`${where} (${id}): regex 答案需要 pattern 字符串`);
        }
        if (type === 'abstain' && expectedAnswer.answeredByFloor != null && !isNonNegativeInteger(expectedAnswer.answeredByFloor)) {
            errors.push(`${where} (${id}): abstain.answeredByFloor 必须是非负整数`);
        }
        if (type === 'llm-judge' && typeof expectedAnswer.reference !== 'string') {
            errors.push(`${where} (${id}): llm-judge 答案需要 reference 字符串`);
        }
    }

    const rawEvidence = raw.evidence && typeof raw.evidence === 'object' ? raw.evidence : {};
    const evidence = {};
    for (const field of FLOOR_FIELDS) {
        evidence[field] = normalizeFloorList(rawEvidence[field], field, errors);
    }

    const hasRequired = evidence.requiredAll.length > 0 || evidence.requiredAny.length > 0;
    if (!hasRequired && category !== 'abstention') {
        errors.push(`${where} (${id}): 非 abstention 用例必须有 requiredAll 或 requiredAny 证据`);
    }

    const provenance = raw.provenance && typeof raw.provenance === 'object' ? { ...raw.provenance } : {};
    provenance.method = String(provenance.method || 'unknown');
    provenance.verifier = String(provenance.verifier || 'unknown');
    provenance.status = String(provenance.status || '').trim() || 'accepted';
    if (!['accepted', 'disputed', 'rejected'].includes(provenance.status)) {
        errors.push(`${where} (${id}): provenance.status 必须是 accepted/disputed/rejected`);
    }

    if (errors.length) {
        return { ok: false, errors, case: null };
    }

    return {
        ok: true,
        errors: [],
        case: {
            id,
            dataset,
            split,
            category,
            atFloor,
            query,
            expectedAnswer,
            evidence,
            provenance,
            notes: typeof raw.notes === 'string' ? raw.notes : '',
        },
    };
}

/**
 * 解析 CASE_SCHEMA JSONL 文本。
 * @param {string} text JSONL 全文
 * @returns {{ cases: object[], errors: string[], stats: object }}
 */
export function parseCasesJsonl(text) {
    const lines = String(text || '').split(/\r?\n/);
    const cases = [];
    const errors = [];
    const seenIds = new Set();

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        const lineNo = index + 1;

        let raw;
        try {
            raw = JSON.parse(trimmed);
        } catch (error) {
            errors.push(`第 ${lineNo} 行: JSON 解析失败: ${error?.message || error}`);
            return;
        }

        const { ok, errors: caseErrors, case: validated } = validateCase(raw, lineNo);
        if (!ok) {
            errors.push(...caseErrors);
            return;
        }
        if (seenIds.has(validated.id)) {
            errors.push(`第 ${lineNo} 行: id 重复: ${validated.id}`);
            return;
        }
        seenIds.add(validated.id);
        cases.push(validated);
    });

    const scored = cases.filter(c => c.split !== 'disputed' && c.provenance.status === 'accepted');
    const bySplit = {};
    const byCategory = {};
    for (const c of cases) {
        bySplit[c.split] = (bySplit[c.split] || 0) + 1;
        byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    }

    return {
        cases,
        errors,
        stats: {
            total: cases.length,
            scored: scored.length,
            excluded: cases.length - scored.length,
            bySplit,
            byCategory,
        },
    };
}

/**
 * 过滤出进入主评分的用例。
 * @param {object[]} cases
 * @param {{ split?: string, category?: string, ids?: string[] }} [filter]
 */
export function selectScoredCases(cases, filter = {}) {
    let out = (cases || []).filter(c => c.split !== 'disputed' && c.provenance.status === 'accepted');
    if (filter.split) out = out.filter(c => c.split === filter.split);
    if (filter.category) out = out.filter(c => c.category === filter.category);
    if (Array.isArray(filter.ids) && filter.ids.length) {
        const idSet = new Set(filter.ids);
        out = out.filter(c => idSet.has(c.id));
    }
    return out;
}
