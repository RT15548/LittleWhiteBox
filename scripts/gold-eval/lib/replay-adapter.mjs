// Gold Eval - story-summary-replay 观测适配（纯函数/临时运行态）

import { parseCasesJsonl, selectScoredCases } from './cases.mjs';

const RECALL_STAGE_KEYS = Object.freeze([
    'r1Dense',
    'r2Dense',
    'lexical',
    'fusion',
    'rerank',
    'graph',
    'final',
    'prompt',
]);
const DIAGNOSTIC_STAGE_KEYS = Object.freeze([
    'lexicalPreDenseGate',
    'fusionPreCap',
]);
const DIAGNOSTIC_VALUE_STAGE_KEYS = Object.freeze([
    'queryFocusOwnership',
]);

function normalizeRanked(items = []) {
    const seen = new Set();
    const unitRanks = new Map();
    const out = [];
    let maxRank = 0;
    for (const [index, raw] of (items || []).entries()) {
        const floor = Number(raw?.floor);
        if (!Number.isInteger(floor) || floor < 0) continue;
        const unitId = String(raw?.unitId || '').trim();
        const seenKey = unitId ? `${unitId}\u0000${floor}` : `floor:${floor}`;
        if (seen.has(seenKey)) continue;
        seen.add(seenKey);

        const rawRank = Number(raw?.rank);
        let rank = Number.isInteger(rawRank) && rawRank > 0 ? rawRank : null;
        if (unitId && unitRanks.has(unitId)) rank = unitRanks.get(unitId);
        if (rank == null) rank = maxRank + 1;
        if (unitId) unitRanks.set(unitId, rank);
        maxRank = Math.max(maxRank, rank);

        out.push({
            floor,
            rank,
            score: Number.isFinite(raw?.score) ? raw.score : null,
            ...(unitId ? { unitId } : {}),
            ...(raw?.source ? { source: String(raw.source) } : {}),
            _order: index,
        });
    }
    return out
        .sort((a, b) => (a.rank - b.rank) || (a._order - b._order))
        .map(({ _order, ...item }) => item);
}

function normalizeDiagnosticRanked(items = []) {
    const diagnosticByFloor = new Map();
    for (const raw of items || []) {
        const floor = Number(raw?.floor);
        if (!Number.isInteger(floor) || floor < 0 || diagnosticByFloor.has(floor)) continue;
        diagnosticByFloor.set(floor, raw);
    }
    return normalizeRanked(items).map(item => {
        const raw = diagnosticByFloor.get(item.floor) || {};
        const hasDenseGate = Object.hasOwn(raw, 'denseScore') || Object.hasOwn(raw, 'passedDenseGate');
        return {
            ...item,
            ...(hasDenseGate ? {
                denseScore: Number.isFinite(raw?.denseScore) ? raw.denseScore : null,
                passedDenseGate: raw?.passedDenseGate === true,
            } : {}),
        };
    });
}

export function createReplayObservationCollector(clock = () => Date.now()) {
    const stages = Object.fromEntries(RECALL_STAGE_KEYS.map(key => [key, []]));
    const diagnostics = Object.fromEntries(DIAGNOSTIC_STAGE_KEYS.map(key => [key, []]));
    const diagnosticValues = Object.fromEntries(DIAGNOSTIC_VALUE_STAGE_KEYS.map(key => [key, null]));
    const timeline = [];

    return {
        observe(event) {
            const stage = String(event?.stage || '');
            if (RECALL_STAGE_KEYS.includes(stage)) {
                stages[stage] = normalizeRanked(event.ranked);
                timeline.push({ stage, at: Number.isFinite(event?.at) ? event.at : clock() });
            } else if (DIAGNOSTIC_STAGE_KEYS.includes(stage)) {
                diagnostics[stage] = normalizeDiagnosticRanked(event.ranked);
            } else if (DIAGNOSTIC_VALUE_STAGE_KEYS.includes(stage)) {
                diagnosticValues[stage] = event?.value == null ? null : JSON.parse(JSON.stringify(event.value));
            }
        },
        build(extra = {}) {
            return {
                ...extra,
                stages: Object.fromEntries(
                    RECALL_STAGE_KEYS.map(key => [key, stages[key].map(item => ({ ...item }))]),
                ),
                diagnostics: Object.fromEntries(
                    DIAGNOSTIC_STAGE_KEYS.map(key => [key, diagnostics[key].map(item => ({ ...item }))]),
                ),
                diagnosticValues: Object.fromEntries(
                    DIAGNOSTIC_VALUE_STAGE_KEYS.map(key => [key, diagnosticValues[key] == null ? null : JSON.parse(JSON.stringify(diagnosticValues[key]))]),
                ),
                timeline: timeline.map(item => ({ ...item })),
            };
        },
    };
}

export function parseFloorReferences(text) {
    const floors = new Set();
    const pattern = /#(\d+)(?:-(\d+))?/g;
    for (const match of String(text || '').matchAll(pattern)) {
        const start = Number(match[1]);
        const end = Number(match[2] || match[1]);
        if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) continue;
        for (let value = start; value <= end; value++) floors.add(value - 1);
    }
    return [...floors].sort((a, b) => a - b);
}

function addText(textsByFloor, floor, text) {
    if (!Number.isInteger(floor) || floor < 0) return;
    const value = String(text || '').trim();
    if (!value) return;
    if (!textsByFloor.has(floor)) textsByFloor.set(floor, new Set());
    textsByFloor.get(floor).add(value);
}

/**
 * 建立 extraction 覆盖与 Prompt 文本匹配目录。
 * 原消息只提供匹配文本；只有实际存在的 atom/chunk/event/fact 才计入 extraction。
 */
export function buildEvidenceCatalog({ messages = [], stateAtoms = [], chunks = [], events = [], facts = [] } = {}) {
    const extractedFloors = new Set();
    const textsByFloor = new Map();

    for (const [floor, message] of messages.entries()) {
        addText(textsByFloor, floor, message?.mes);
    }
    for (const atom of stateAtoms || []) {
        const floor = Number(atom?.floor);
        if (!Number.isInteger(floor) || floor < 0) continue;
        extractedFloors.add(floor);
        addText(textsByFloor, floor, atom?.semantic);
    }
    for (const chunk of chunks || []) {
        const floor = Number(chunk?.floor);
        if (!Number.isInteger(floor) || floor < 0) continue;
        extractedFloors.add(floor);
        addText(textsByFloor, floor, chunk?.text);
    }
    for (const event of events || []) {
        for (const floor of parseFloorReferences(event?.summary)) {
            extractedFloors.add(floor);
            addText(textsByFloor, floor, `${event?.title || ''} ${event?.summary || ''}`);
        }
    }
    for (const fact of facts || []) {
        const rawFloor = fact?.since ?? fact?._addedAt;
        const floor = Number(rawFloor);
        if (!Number.isInteger(floor) || floor < 0) continue;
        extractedFloors.add(floor);
        addText(textsByFloor, floor, `${fact?.s || ''} ${fact?.p || ''} ${fact?.o || ''}`);
    }

    return {
        extractedFloors: [...extractedFloors].sort((a, b) => a - b),
        evidenceTextsByFloor: Object.fromEntries(
            [...textsByFloor.entries()]
                .sort((a, b) => a[0] - b[0])
                .map(([floor, texts]) => [floor, [...texts]]),
        ),
    };
}

export function loadGoldCasesFromText(text, { split, boundaryFloor } = {}) {
    const parsed = parseCasesJsonl(text);
    if (parsed.errors.length) {
        throw new Error(`Gold cases 无效:\n${parsed.errors.join('\n')}`);
    }
    const cases = selectScoredCases(parsed.cases, split ? { split } : {});
    if (!cases.length) throw new Error('Gold cases 没有可评分用例');

    if (Number.isInteger(boundaryFloor)) {
        const mismatched = cases.filter(item => item.atFloor !== boundaryFloor);
        if (mismatched.length) {
            const sample = mismatched.slice(0, 5).map(item => `${item.id}:${item.atFloor}`).join(', ');
            throw new Error(
                `Gold case atFloor 必须等于当前 replay 边界 ${boundaryFloor}；不匹配: ${sample}`,
            );
        }
    }

    return cases;
}

export function selectEvidenceCatalogForCase(catalog, goldCase) {
    const evidence = goldCase?.evidence || {};
    const floors = [...new Set([
        ...(evidence.requiredAll || []),
        ...(evidence.requiredAny || []),
        ...(evidence.requiredAnyGroups || []).flat(),
        ...(evidence.supporting || []),
        ...(evidence.forbiddenAsCurrent || []),
    ])];
    const texts = catalog?.evidenceTextsByFloor || {};
    return Object.fromEntries(floors.map(floor => [floor, texts[floor] || texts[String(floor)] || []]));
}
