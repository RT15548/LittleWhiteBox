import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
    adaptLongMemEvalItem,
    buildLocomoCatalog,
    selectLocomoQuestions,
    selectLongMemEvalIds,
    streamJsonArray,
} from '../dev-matrix/public-datasets.mjs';

test('顶层 JSON 数组流式解析处理嵌套对象与字符串括号', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'json-array-'));
    try {
        const file = path.join(root, 'items.json');
        await fs.writeFile(file, JSON.stringify([{ a: '}' }, { nested: { value: 2 } }]));
        const rows = [];
        for await (const row of streamJsonArray(file)) rows.push(row);
        assert.deepEqual(rows, [{ a: '}' }, { nested: { value: 2 } }]);
    } finally {
        await fs.rm(root, { recursive: true, force: true });
    }
});

test('LongMemEval 固定 hash 分层选择且 oracle/stress 不重叠', () => {
    const types = [
        ['single-session-user', 'fact'],
        ['multi-session', 'multi'],
        ['knowledge-update', 'update'],
        ['temporal-reasoning', 'time'],
    ];
    const metadata = [];
    for (const [type, prefix] of types) {
        for (let i = 0; i < 30; i++) metadata.push({ question_id: `${prefix}-${i}`, question_type: type });
    }
    for (let i = 0; i < 30; i++) metadata.push({ question_id: `abs-${i}_abs`, question_type: 'single-session-user' });
    const oracle = selectLongMemEvalIds(metadata, { perStratum: 20, offset: 0 });
    const stress = selectLongMemEvalIds(metadata, { perStratum: 5, offset: 20 });
    assert.equal(oracle.selected.size, 100);
    assert.equal(stress.selected.size, 25);
    assert.equal([...stress.selected].some(id => oracle.selected.has(id)), false);
});

test('LongMemEval 适配保留 has_answer 楼层与多证据 required-all', () => {
    const adapted = adaptLongMemEvalItem({
        question_id: 'q1', question_type: 'multi-session', question: '什么口令？', answer: '青鹭',
        haystack_session_ids: ['s2', 's1'], haystack_dates: ['2026-02-02', '2026-01-01'],
        haystack_sessions: [
            [{ role: 'assistant', content: '后半鹭', has_answer: true }],
            [{ role: 'user', content: '前半青', has_answer: true }],
        ],
        answer_session_ids: ['s1', 's2'],
    }, 'long-test');
    assert.equal(adapted.messages[0].mes.includes('前半青'), true);
    assert.deepEqual(adapted.case.evidence.requiredAll, [0, 1]);
    assert.equal(adapted.case.category, 'associative');
});

function locomoFixture() {
    const qa = [];
    for (const category of [1, 2, 3, 5]) {
        for (let i = 0; i < 4; i++) qa.push({
            question: `q-${category}-${i}`, answer: `a-${category}-${i}`,
            evidence: category === 5 ? [] : ['D1:1'], category,
        });
    }
    return [0, 1].map(index => ({
        sample_id: `c${index}`,
        qa,
        conversation: {
            speaker_a: 'A', speaker_b: 'B', session_1_date_time: '1 Jan 2026',
            session_1: [{ speaker: 'A', dia_id: 'D1:1', text: 'evidence' }, { speaker: 'B', dia_id: 'D1:2', text: 'reply' }],
        },
    }));
}

test('LoCoMo 选择排除外部常识类并保持 conversation cluster', () => {
    const fixture = locomoFixture();
    fixture[0].qa.push({
        question: '缺少官方证据的可回答题', answer: '不可采纳', evidence: [], category: 3,
    });
    const selected = selectLocomoQuestions(fixture, 4);
    assert.equal(selected.length, 16);
    assert.equal(selected.some(item => item.question.question === '缺少官方证据的可回答题'), false);
    assert.deepEqual(new Set(selected.map(item => item.category)), new Set(['fact', 'temporal', 'associative', 'abstention']));
    const catalog = buildLocomoCatalog(fixture, 4);
    assert.equal(catalog.clusters.length, 2);
    assert.equal(catalog.cases.length, 16);
    assert.equal(catalog.cases.filter(item => item.case.category === 'abstention').every(item => item.case.evidence.requiredAll.length === 0), true);
});
