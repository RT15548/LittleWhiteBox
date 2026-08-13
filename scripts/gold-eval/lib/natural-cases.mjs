// Gold Eval - schema-v2 natural case parser.
// This copy is intentionally self-contained so every archived run carries the
// exact input contract it executed; it does not import the mutable eval workspace.

import { sha256Text } from './run-store.mjs';

const SPLITS = new Set(['dev', 'validation', 'holdout', 'disputed']);
const STATUSES = new Set(['accepted', 'disputed', 'rejected']);

function floorList(value, field, historyThroughFloor, errors) {
    if (value == null) return [];
    if (!Array.isArray(value)) {
        errors.push(`${field} 必须是数组`);
        return [];
    }
    const floors = [];
    for (const item of value) {
        if (!Number.isInteger(item) || item < 0) {
            errors.push(`${field} 含非法楼层: ${JSON.stringify(item)}`);
        } else if (item > historyThroughFloor) {
            errors.push(`${field} 含未来楼层 ${item}，历史截止 ${historyThroughFloor}`);
        } else {
            floors.push(item);
        }
    }
    return [...new Set(floors)].sort((a, b) => a - b);
}

export function validateNaturalCaseV2(raw, lineNo = 0) {
    const where = lineNo > 0 ? `第 ${lineNo} 行` : '用例';
    const errors = [];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return { ok: false, errors: [`${where}: case 必须是对象`], case: null };
    }
    if (raw.schemaVersion !== 2) errors.push(`${where}: schemaVersion 必须是 2`);
    if (raw.track !== 'natural') errors.push(`${where}: track 必须是 natural`);

    const id = String(raw.id || '').trim();
    const corpusId = String(raw.corpusId || '').trim();
    const split = String(raw.split || '').trim();
    const category = String(raw.category || '').trim() || 'unclassified';
    if (!id) errors.push(`${where}: id 不能为空`);
    if (!corpusId) errors.push(`${where} (${id}): corpusId 不能为空`);
    if (!SPLITS.has(split)) errors.push(`${where} (${id}): split 非法: ${split}`);

    const queryRaw = raw.query && typeof raw.query === 'object' ? raw.query : {};
    const query = {
        kind: String(queryRaw.kind || '').trim(),
        floor: queryRaw.floor,
        text: String(queryRaw.text ?? ''),
        sha256: String(queryRaw.sha256 || '').toLowerCase(),
    };
    if (query.kind !== 'verbatim-user') errors.push(`${where} (${id}): query.kind 必须是 verbatim-user`);
    if (!Number.isInteger(query.floor) || query.floor < 0) errors.push(`${where} (${id}): query.floor 必须是非负整数`);
    if (!query.text.trim()) errors.push(`${where} (${id}): query.text 不能为空`);
    if (!/^[a-f0-9]{64}$/.test(query.sha256)) errors.push(`${where} (${id}): query.sha256 非法`);
    if (query.sha256 !== sha256Text(query.text)) errors.push(`${where} (${id}): query.sha256 与 query.text 不匹配`);

    const historyThroughFloor = raw.historyThroughFloor;
    if (!Number.isInteger(historyThroughFloor) || historyThroughFloor < -1) {
        errors.push(`${where} (${id}): historyThroughFloor 必须是 >= -1 的整数`);
    }
    if (Number.isInteger(query.floor) && historyThroughFloor !== query.floor - 1) {
        errors.push(`${where} (${id}): historyThroughFloor 必须等于 query.floor - 1`);
    }

    const evidenceRaw = raw.evidence && typeof raw.evidence === 'object' ? raw.evidence : {};
    const evidence = {
        requiredAll: floorList(evidenceRaw.requiredAll, 'evidence.requiredAll', historyThroughFloor, errors),
        requiredAny: floorList(evidenceRaw.requiredAny, 'evidence.requiredAny', historyThroughFloor, errors),
        supporting: floorList(evidenceRaw.supporting, 'evidence.supporting', historyThroughFloor, errors),
        forbiddenAsCurrent: floorList(evidenceRaw.forbiddenAsCurrent, 'evidence.forbiddenAsCurrent', historyThroughFloor, errors),
        requiredAnyGroups: [],
    };
    if (evidenceRaw.requiredAnyGroups != null && !Array.isArray(evidenceRaw.requiredAnyGroups)) {
        errors.push(`${where} (${id}): evidence.requiredAnyGroups 必须是数组`);
    } else {
        evidence.requiredAnyGroups = (evidenceRaw.requiredAnyGroups || []).map((group, index) => (
            floorList(group, `evidence.requiredAnyGroups[${index}]`, historyThroughFloor, errors)
        ));
        if (evidence.requiredAnyGroups.some(group => !group.length)) {
            errors.push(`${where} (${id}): evidence.requiredAnyGroups 不能含空组`);
        }
    }
    if (!evidence.requiredAll.length && !evidence.requiredAny.length && !evidence.requiredAnyGroups.length) {
        errors.push(`${where} (${id}): natural case 必须有 required evidence`);
    }

    const expectedAnswer = raw.expectedAnswer && typeof raw.expectedAnswer === 'object'
        ? { ...raw.expectedAnswer, type: String(raw.expectedAnswer.type || '') }
        : null;
    if (!expectedAnswer || expectedAnswer.type !== 'evidence-only') {
        errors.push(`${where} (${id}): natural capture 当前只接受 evidence-only`);
    }

    const provenanceRaw = raw.provenance && typeof raw.provenance === 'object' ? raw.provenance : {};
    const provenance = {
        queryOrigin: String(provenanceRaw.queryOrigin || ''),
        goldMethod: String(provenanceRaw.goldMethod || ''),
        verifier: String(provenanceRaw.verifier || ''),
        status: String(provenanceRaw.status || ''),
    };
    if (provenance.queryOrigin !== 'verbatim-user-message') errors.push(`${where} (${id}): queryOrigin 非法`);
    if (!provenance.goldMethod) errors.push(`${where} (${id}): goldMethod 不能为空`);
    if (!provenance.verifier) errors.push(`${where} (${id}): verifier 不能为空`);
    if (!STATUSES.has(provenance.status)) errors.push(`${where} (${id}): provenance.status 非法`);

    if (errors.length) return { ok: false, errors, case: null };
    return {
        ok: true,
        errors: [],
        case: {
            schemaVersion: 2,
            id,
            corpusId,
            dataset: corpusId,
            split,
            track: 'natural',
            category,
            query,
            queryText: query.text,
            atFloor: query.floor,
            historyThroughFloor,
            expectedAnswer,
            evidence,
            provenance,
            notes: typeof raw.notes === 'string' ? raw.notes : '',
        },
    };
}

export function parseNaturalCasesJsonl(text) {
    const cases = [];
    const errors = [];
    const ids = new Set();
    String(text || '').split(/\r?\n/).forEach((line, index) => {
        if (!line.trim()) return;
        let raw;
        try {
            raw = JSON.parse(line);
        } catch (error) {
            errors.push(`第 ${index + 1} 行: JSON 解析失败: ${error?.message || error}`);
            return;
        }
        const checked = validateNaturalCaseV2(raw, index + 1);
        if (!checked.ok) {
            errors.push(...checked.errors);
            return;
        }
        if (ids.has(checked.case.id)) {
            errors.push(`第 ${index + 1} 行: id 重复: ${checked.case.id}`);
            return;
        }
        ids.add(checked.case.id);
        cases.push(checked.case);
    });
    return { cases, errors };
}

export function selectAgedNaturalCases(cases, { split, minDistanceFloors = 20, ids = [] } = {}) {
    const idSet = new Set(ids || []);
    return (cases || []).filter(item => {
        if (item.provenance.status !== 'accepted' || item.split === 'disputed') return false;
        if (split && item.split !== split) return false;
        if (idSet.size && !idSet.has(item.id)) return false;
        const hardEvidence = [
            ...(item.evidence.requiredAll || []),
            ...(item.evidence.requiredAny || []),
            ...(item.evidence.requiredAnyGroups || []).flat(),
        ];
        if (!hardEvidence.length) return false;
        const newestEvidenceFloor = Math.max(...hardEvidence);
        return item.atFloor - newestEvidenceFloor >= minDistanceFloors;
    }).sort((a, b) => (a.atFloor - b.atFloor) || a.id.localeCompare(b.id));
}

export function validateNaturalSourceBindings(cases, messages) {
    const errors = [];
    for (const goldCase of cases || []) {
        const message = messages?.[goldCase.atFloor];
        if (!message) {
            errors.push(`${goldCase.id}: query floor ${goldCase.atFloor} 不存在`);
            continue;
        }
        if (message.is_user !== true) errors.push(`${goldCase.id}: query floor 不是 user message`);
        if (String(message.mes ?? '') !== String(goldCase?.query?.text || goldCase?.queryText || '')) {
            errors.push(`${goldCase.id}: query 不是原 user message 逐字原话`);
        }
        if (sha256Text(String(message.mes ?? '')) !== goldCase.query.sha256) {
            errors.push(`${goldCase.id}: query hash 与原消息不一致`);
        }
        if (goldCase.historyThroughFloor !== goldCase.atFloor - 1) {
            errors.push(`${goldCase.id}: history boundary 无效`);
        }
    }
    if (errors.length) throw new Error(`Natural cases 与聊天源绑定失败:\n${errors.join('\n')}`);
}
