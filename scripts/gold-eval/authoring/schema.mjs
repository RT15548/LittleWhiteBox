import { createHash } from 'node:crypto';

import { CASE_CATEGORIES, validateCase } from '../lib/cases.mjs';

const CANDIDATE_ANSWER_TYPES = new Set(['exact', 'contains', 'abstain']);
const EVIDENCE_FIELDS = ['requiredAll', 'requiredAny', 'supporting', 'forbiddenAsCurrent'];
const VERDICTS = new Set(['accepted', 'disputed', 'rejected']);

function parseJsonObject(text) {
    const stripped = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const start = stripped.indexOf('{');
    const end = stripped.lastIndexOf('}');
    if (start < 0 || end < start) throw new Error('响应中没有 JSON 对象');
    try {
        return JSON.parse(stripped.slice(start, end + 1));
    } catch (error) {
        throw new Error(`响应 JSON 解析失败: ${error?.message || error}`);
    }
}

function strings(value, field) {
    if (!Array.isArray(value) || !value.length) throw new Error(`${field} 必须是非空字符串数组`);
    const out = value.map(item => String(item || '').trim()).filter(Boolean);
    if (out.length !== value.length) throw new Error(`${field} 含空值`);
    return [...new Set(out)];
}

function floors(value, field, { minFloor, maxFloor }) {
    if (value == null) return [];
    if (!Array.isArray(value)) throw new Error(`${field} 必须是数组`);
    const out = [];
    for (const floor of value) {
        if (!Number.isInteger(floor) || floor < minFloor || floor > maxFloor) {
            throw new Error(`${field} 含越界楼层 ${JSON.stringify(floor)}，允许 ${minFloor}-${maxFloor}`);
        }
        out.push(floor);
    }
    return [...new Set(out)].sort((a, b) => a - b);
}

function normalizeExpectedAnswer(raw, where) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error(`${where}.expectedAnswer 必须是对象`);
    }
    const type = String(raw.type || '').trim();
    if (!CANDIDATE_ANSWER_TYPES.has(type)) {
        throw new Error(`${where}.expectedAnswer.type 只能是 exact/contains/abstain`);
    }
    if (type === 'exact') {
        return {
            type,
            values: strings(raw.values, `${where}.expectedAnswer.values`),
            ...(raw.oldFactValues == null
                ? {}
                : { oldFactValues: strings(raw.oldFactValues, `${where}.expectedAnswer.oldFactValues`) }),
        };
    }
    if (type === 'contains') {
        return {
            type,
            substrings: strings(raw.substrings, `${where}.expectedAnswer.substrings`),
            ...(raw.oldFactValues == null
                ? {}
                : { oldFactValues: strings(raw.oldFactValues, `${where}.expectedAnswer.oldFactValues`) }),
        };
    }
    return { type: 'abstain' };
}

function normalizeCandidate(raw, index, bounds, idPrefix) {
    const where = `candidates[${index}]`;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(`${where} 必须是对象`);
    const category = String(raw.category || '').trim();
    if (!CASE_CATEGORIES.includes(category)) throw new Error(`${where}.category 非法: ${category}`);
    const query = String(raw.query || '').trim();
    if (!query) throw new Error(`${where}.query 不能为空`);
    const expectedAnswer = normalizeExpectedAnswer(raw.expectedAnswer, where);
    const rawEvidence = raw.evidence && typeof raw.evidence === 'object' ? raw.evidence : {};
    const evidence = {};
    for (const field of EVIDENCE_FIELDS) {
        evidence[field] = floors(rawEvidence[field], `${where}.evidence.${field}`, bounds);
    }
    if (category !== 'abstention' && !evidence.requiredAll.length && !evidence.requiredAny.length) {
        throw new Error(`${where} 非 abstention 题必须有 requiredAll 或 requiredAny`);
    }
    if (category === 'abstention' && expectedAnswer.type !== 'abstain') {
        throw new Error(`${where} abstention 题必须使用 abstain 答案`);
    }
    if (category !== 'abstention' && expectedAnswer.type === 'abstain') {
        throw new Error(`${where} 非 abstention 题不能使用 abstain 答案`);
    }
    const citedFloors = EVIDENCE_FIELDS.flatMap(field => evidence[field]);
    if (category === 'abstention' && citedFloors.length === 0) {
        throw new Error(`${where} abstention 题必须引用原文明示未知状态的楼层`);
    }
    if (category === 'update') {
        if (!evidence.forbiddenAsCurrent.length) {
            throw new Error(`${where} update 题必须提供 forbiddenAsCurrent 旧状态楼层`);
        }
        if (!Array.isArray(expectedAnswer.oldFactValues) || !expectedAnswer.oldFactValues.length) {
            throw new Error(`${where} update 题必须提供 expectedAnswer.oldFactValues`);
        }
    }

    return {
        candidateId: `${idPrefix}-c${String(index + 1).padStart(2, '0')}`,
        category,
        query,
        expectedAnswer,
        evidence,
    };
}

export function parseDiscoveryResponse(text, { taskId, minFloor, maxFloor, maxCandidates, maxClaims }) {
    const raw = parseJsonObject(text);
    if (!Array.isArray(raw.claims)) throw new Error('claims 必须是数组');
    if (!Array.isArray(raw.candidates)) throw new Error('candidates 必须是数组');
    if (raw.claims.length > maxClaims) throw new Error(`claims 超过上限 ${maxClaims}`);
    if (raw.candidates.length > maxCandidates) throw new Error(`candidates 超过上限 ${maxCandidates}`);

    const bounds = { minFloor, maxFloor };
    const claims = raw.claims.map((claim, index) => {
        if (!claim || typeof claim !== 'object' || Array.isArray(claim)) {
            throw new Error(`claims[${index}] 必须是对象`);
        }
        const statement = String(claim.statement || '').trim();
        if (!statement) throw new Error(`claims[${index}].statement 不能为空`);
        return {
            statement,
            floors: floors(claim.floors, `claims[${index}].floors`, bounds),
            entities: Array.isArray(claim.entities)
                ? [...new Set(claim.entities.map(item => String(item || '').trim()).filter(Boolean))]
                : [],
        };
    });
    const candidates = raw.candidates.map((candidate, index) => normalizeCandidate(
        candidate,
        index,
        bounds,
        taskId,
    ));
    return { claims, candidates };
}

export function parseSynthesisResponse(text, {
    minFloor,
    maxFloor,
    maxCandidates,
    expectedCategory = '',
    idPrefix = 'cross',
    allowEmpty = false,
}) {
    const raw = parseJsonObject(text);
    if (!Array.isArray(raw.candidates)) throw new Error('candidates 必须是数组');
    if (raw.candidates.length > maxCandidates) throw new Error(`candidates 超过上限 ${maxCandidates}`);
    const candidates = [];
    const rejectedCandidates = [];
    raw.candidates.forEach((candidate, index) => {
        try {
            const normalized = normalizeCandidate(candidate, index, { minFloor, maxFloor }, idPrefix);
            if (expectedCategory && normalized.category !== expectedCategory) {
                throw new Error(`candidates[${index}].category 必须是 ${expectedCategory}`);
            }
            candidates.push(normalized);
        } catch (error) {
            rejectedCandidates.push({
                index,
                category: String(candidate?.category || ''),
                answerType: String(candidate?.expectedAnswer?.type || ''),
                reason: String(error?.message || error),
            });
        }
    });
    if (!candidates.length && !allowEmpty) throw new Error('synthesis 没有产生任何通过 schema 的候选');
    return { candidates, rejectedCandidates };
}

export function parseVerifierResponse(text, expectedCandidateIds) {
    const raw = parseJsonObject(text);
    if (!Array.isArray(raw.verdicts)) throw new Error('verdicts 必须是数组');
    const expected = new Set(expectedCandidateIds);
    const seen = new Set();
    const verdicts = raw.verdicts.map((item, index) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
            throw new Error(`verdicts[${index}] 必须是对象`);
        }
        const candidateId = String(item.candidateId || '').trim();
        if (!expected.has(candidateId)) throw new Error(`verdicts[${index}] candidateId 未请求: ${candidateId}`);
        if (seen.has(candidateId)) throw new Error(`verdict candidateId 重复: ${candidateId}`);
        seen.add(candidateId);
        const verdict = String(item.verdict || '').trim();
        if (!VERDICTS.has(verdict)) throw new Error(`${candidateId} verdict 非法: ${verdict}`);
        const reason = String(item.reason || '').trim();
        if (!reason) throw new Error(`${candidateId} reason 不能为空`);
        return { candidateId, verdict, reason };
    });
    const missing = [...expected].filter(id => !seen.has(id));
    if (missing.length) throw new Error(`verifier 缺少 verdict: ${missing.join(', ')}`);
    return { verdicts };
}

export function buildGoldCase(candidate, verdict, manifest) {
    const digest = createHash('sha256')
        .update(JSON.stringify({
            dataset: manifest.dataset,
            query: candidate.query,
            expectedAnswer: candidate.expectedAnswer,
            evidence: candidate.evidence,
        }))
        .digest('hex')
        .slice(0, 12);
    const status = verdict.verdict;
    const split = status === 'accepted' ? manifest.split : 'disputed';
    const raw = {
        id: `${manifest.dataset}-${digest}`,
        dataset: manifest.dataset,
        split,
        category: candidate.category,
        atFloor: manifest.source.atFloor,
        query: candidate.query,
        expectedAnswer: candidate.expectedAnswer,
        evidence: candidate.evidence,
        provenance: {
            method: [
                `source-first-${manifest.authoring.promptVersion}`,
                `synthesis-${manifest.authoring.synthesisPromptVersion}`,
                `verify-${manifest.authoring.verifierPromptVersion}`,
            ].join('+'),
            verifier: `${manifest.api.provider}:${manifest.api.model}`,
            status,
        },
        notes: `authoring=${manifest.runId}; candidate=${candidate.candidateId}; verifier=${verdict.reason}`,
    };
    const checked = validateCase(raw);
    if (!checked.ok) throw new Error(`${candidate.candidateId} 无法转换成 gold case: ${checked.errors.join('; ')}`);
    return checked.case;
}
