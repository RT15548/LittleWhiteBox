import assert from 'node:assert/strict';
import test from 'node:test';

import { readCapturedSemanticQuery } from '../event-rerank-gate.mjs';

test('event rerank gate reads the exact semantic queries captured by production recall', () => {
    const value = readCapturedSemanticQuery({
        observationBase: {
            diagnosticValues: {
                semanticQuery: {
                    query: '  三消息语义查询  ',
                    temporalQuery: '  当前 USER 时间规则  ',
                },
            },
        },
    }, 'case-current');

    assert.deepEqual(value, {
        query: '三消息语义查询',
        temporalQuery: '当前 USER 时间规则',
    });
});

test('event rerank gate rejects legacy captures instead of reconstructing removed inputs', () => {
    assert.throws(() => readCapturedSemanticQuery({
        enrichmentContext: { focusVector: [1, 2, 3] },
    }, 'case-legacy'), /缺少 semanticQuery.*case-legacy/);
});

test('event rerank gate accepts a captured semantic query with an empty temporal arm', () => {
    const value = readCapturedSemanticQuery({
        observationBase: {
            diagnosticValues: {
                semanticQuery: { query: '三消息语义查询', temporalQuery: '' },
            },
        },
    }, 'case-empty-temporal');

    assert.deepEqual(value, { query: '三消息语义查询', temporalQuery: '' });
});

test('event rerank gate diagnoses an empty semantic ranking query separately', () => {
    assert.throws(() => readCapturedSemanticQuery({
        observationBase: {
            diagnosticValues: {
                semanticQuery: { query: '  ', temporalQuery: '' },
            },
        },
    }, 'case-empty-query'), /semanticQuery\.query 为空.*case-empty-query/);
});
