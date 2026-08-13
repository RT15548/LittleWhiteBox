import test from 'node:test';
import assert from 'node:assert/strict';

import { planSourceWindows } from '../authoring/source.mjs';
import { buildVerifierMessages } from '../authoring/prompts.mjs';
import {
    buildGoldCase,
    parseDiscoveryResponse,
    parseSynthesisResponse,
    parseVerifierResponse,
} from '../authoring/schema.mjs';

test('source window 以重叠窗口完整覆盖首尾且不产生重复尾窗', () => {
    const windows = planSourceWindows(855, { windowSize: 80, overlap: 20 });
    assert.equal(windows.length, 14);
    assert.deepEqual(windows[0], { startFloor: 0, endFloor: 79 });
    assert.deepEqual(windows.at(-1), { startFloor: 775, endFloor: 854 });
    for (let floor = 0; floor < 855; floor++) {
        assert.equal(windows.some(item => item.startFloor <= floor && item.endFloor >= floor), true);
    }
});

test('abstention 必须引用明确未知证据，update 必须冻结旧状态', () => {
    const base = {
        claims: [],
        candidates: [{
            category: 'abstention',
            query: '密码是什么？',
            expectedAnswer: { type: 'abstain' },
            evidence: { requiredAll: [], requiredAny: [], supporting: [], forbiddenAsCurrent: [] },
        }],
    };
    assert.throws(() => parseDiscoveryResponse(JSON.stringify(base), {
        taskId: 'window-001', minFloor: 0, maxFloor: 20, maxCandidates: 5, maxClaims: 10,
    }), /必须引用/);

    base.candidates[0] = {
        category: 'update',
        query: '钥匙现在在哪里？',
        expectedAnswer: { type: 'exact', values: ['红盒'] },
        evidence: { requiredAll: [12], requiredAny: [], supporting: [], forbiddenAsCurrent: [3] },
    };
    assert.throws(() => parseDiscoveryResponse(JSON.stringify(base), {
        taskId: 'window-001', minFloor: 0, maxFloor: 20, maxCandidates: 5, maxClaims: 10,
    }), /oldFactValues/);
});

test('discovery 响应只接受窗口内证据和可自动判定答案', () => {
    const response = JSON.stringify({
        claims: [{ statement: '钥匙后来放进红盒', floors: [12], entities: ['钥匙'] }],
        candidates: [{
            category: 'update',
            query: '钥匙现在在哪里？',
            expectedAnswer: { type: 'exact', values: ['红盒'], oldFactValues: ['蓝盒'] },
            evidence: { requiredAll: [12], requiredAny: [], supporting: [], forbiddenAsCurrent: [3] },
        }],
    });
    const parsed = parseDiscoveryResponse(response, {
        taskId: 'window-001', minFloor: 0, maxFloor: 20, maxCandidates: 5, maxClaims: 10,
    });
    assert.equal(parsed.candidates[0].candidateId, 'window-001-c01');
    assert.throws(() => parseDiscoveryResponse(response.replace('[12]', '[99]'), {
        taskId: 'window-001', minFloor: 0, maxFloor: 20, maxCandidates: 5, maxClaims: 10,
    }), /越界楼层/);
});

test('verifier packet 只含候选问题、答案和引用楼层原文', () => {
    const chat = {
        lastFloor: 2,
        messages: [
            { floor: 0, role: 'user', name: 'A', text: '未引用秘密' },
            { floor: 1, role: 'assistant', name: 'B', text: '钥匙在红盒' },
            { floor: 2, role: 'user', name: 'A', text: '另一个未引用秘密' },
        ],
    };
    const messages = buildVerifierMessages({
        chat,
        candidates: [{
            candidateId: 'window-001-c01',
            query: '钥匙在哪里？',
            expectedAnswer: { type: 'exact', values: ['红盒'] },
            evidence: { requiredAll: [1], requiredAny: [], supporting: [], forbiddenAsCurrent: [] },
        }],
    });
    const packet = messages.map(item => item.content).join('\n');
    assert.match(packet, /钥匙在红盒/);
    assert.doesNotMatch(packet, /未引用秘密/);
    assert.throws(() => buildVerifierMessages({
        chat,
        candidates: [
            { candidateId: 'a', query: 'a', expectedAnswer: { type: 'abstain' }, evidence: {} },
            { candidateId: 'b', query: 'b', expectedAnswer: { type: 'abstain' }, evidence: {} },
        ],
    }), /只能包含一个候选/);
});

test('verifier 必须逐一返回 verdict，accepted 可转换为现行 case 契约', () => {
    const parsed = parseVerifierResponse(JSON.stringify({
        verdicts: [{ candidateId: 'window-001-c01', verdict: 'accepted', reason: '引用直接支持' }],
    }), ['window-001-c01']);
    const goldCase = buildGoldCase({
        candidateId: 'window-001-c01',
        category: 'fact',
        query: '钥匙在哪里？',
        expectedAnswer: { type: 'exact', values: ['红盒'] },
        evidence: { requiredAll: [1], requiredAny: [], supporting: [], forbiddenAsCurrent: [] },
    }, parsed.verdicts[0], {
        runId: 'real-800-dev-v1',
        dataset: 'real-800',
        split: 'dev',
        source: { atFloor: 854 },
        api: { provider: 'google', model: 'test-model' },
        authoring: { promptVersion: 'v1' },
    });
    assert.equal(goldCase.provenance.status, 'accepted');
    assert.equal(goldCase.split, 'dev');
    assert.match(goldCase.id, /^real-800-[a-f0-9]{12}$/);
    assert.throws(() => parseVerifierResponse('{"verdicts":[]}', ['window-001-c01']), /缺少 verdict/);
});

test('synthesis 逐题拒绝非法候选，不让一题污染整批合法候选', () => {
    const parsed = parseSynthesisResponse(JSON.stringify({ candidates: [
        {
            category: 'causal', query: '为什么？',
            expectedAnswer: { type: 'contains', substrings: ['前因'] },
            evidence: { requiredAll: [1, 9], requiredAny: [], supporting: [], forbiddenAsCurrent: [] },
        },
        {
            category: 'update', query: '现在如何？',
            expectedAnswer: { type: 'exact', values: ['新状态'], oldFactValues: ['旧状态'] },
            evidence: { requiredAll: [9], requiredAny: [], supporting: [], forbiddenAsCurrent: [] },
        },
    ] }), { minFloor: 0, maxFloor: 20, maxCandidates: 12 });
    assert.equal(parsed.candidates.length, 1);
    assert.equal(parsed.rejectedCandidates.length, 1);
    assert.match(parsed.rejectedCandidates[0].reason, /forbiddenAsCurrent/);
});
