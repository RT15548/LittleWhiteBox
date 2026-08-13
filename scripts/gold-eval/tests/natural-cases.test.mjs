import test from 'node:test';
import assert from 'node:assert/strict';

import {
    parseNaturalCasesJsonl,
    selectAgedNaturalCases,
    validateNaturalCaseV2,
} from '../lib/natural-cases.mjs';
import { sha256Text } from '../lib/run-store.mjs';

function naturalCase(overrides = {}) {
    const queryText = overrides.query?.text || '还记得那把钥匙吗？';
    return {
        schemaVersion: 2,
        id: 'natural-001',
        corpusId: 'chat-a',
        split: 'dev',
        track: 'natural',
        category: 'unclassified',
        query: {
            kind: 'verbatim-user',
            floor: 50,
            text: queryText,
            sha256: sha256Text(queryText),
            ...(overrides.query || {}),
        },
        historyThroughFloor: 49,
        expectedAnswer: { type: 'evidence-only' },
        evidence: {
            requiredAll: [10],
            requiredAny: [],
            requiredAnyGroups: [],
            supporting: [],
            forbiddenAsCurrent: [],
        },
        provenance: {
            queryOrigin: 'verbatim-user-message',
            goldMethod: 'source-evidence-verified',
            verifier: 'independent',
            status: 'accepted',
        },
        ...overrides,
    };
}

test('schema-v2 natural case 保留真实 query floor 与多组任一证据', () => {
    const raw = naturalCase({
        evidence: {
            requiredAll: [10],
            requiredAny: [12, 14],
            requiredAnyGroups: [[20, 22], [24, 26]],
            supporting: [8],
            forbiddenAsCurrent: [4],
        },
    });
    const checked = validateNaturalCaseV2(raw);
    assert.equal(checked.ok, true, checked.errors.join('\n'));
    assert.equal(checked.case.atFloor, 50);
    assert.equal(checked.case.queryText, raw.query.text);
    assert.deepEqual(checked.case.evidence.requiredAnyGroups, [[20, 22], [24, 26]]);
});

test('schema-v2 natural case 从结构上拒绝未来证据', () => {
    const raw = naturalCase({
        evidence: {
            requiredAll: [50],
            requiredAny: [],
            requiredAnyGroups: [],
            supporting: [],
            forbiddenAsCurrent: [],
        },
    });
    const checked = validateNaturalCaseV2(raw);
    assert.equal(checked.ok, false);
    assert.match(checked.errors.join('\n'), /未来楼层 50/);
});

test('aged natural 选择只看冻结证据距离，不按题目内容筛选', () => {
    const near = naturalCase({ id: 'near', evidence: { requiredAll: [40], requiredAny: [], requiredAnyGroups: [], supporting: [], forbiddenAsCurrent: [] } });
    const aged = naturalCase({ id: 'aged', evidence: { requiredAll: [10], requiredAny: [], requiredAnyGroups: [], supporting: [], forbiddenAsCurrent: [] } });
    const parsed = parseNaturalCasesJsonl(`${JSON.stringify(near)}\n${JSON.stringify(aged)}\n`);
    assert.deepEqual(parsed.errors, []);
    assert.deepEqual(selectAgedNaturalCases(parsed.cases, { split: 'dev', minDistanceFloors: 20 }).map(item => item.id), ['aged']);
});
