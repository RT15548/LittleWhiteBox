import assert from 'node:assert/strict';
import test from 'node:test';

import { estimateJobCost, sanitizeExecutionProfile } from '../baseline/plan.mjs';

test('baseline 成本按真实 Summary/L0/Embedding/Rerank 批次边界估算', () => {
    const messages = Array.from({ length: 21 }, (_, index) => ({
        is_user: index % 2 === 0,
        name: index % 2 === 0 ? 'User' : 'Assistant',
        mes: `message ${index}`,
    }));
    const cost = estimateJobCost(messages, [{}, {}], { summaryMaxPerRun: 20 });
    assert.equal(cost.summary.requests, 2);
    assert.equal(cost.l0.nominalGenerationRequests, 10);
    assert.equal(cost.l0.generationRequestCeilingWithRetry, 20);
    assert.equal(cost.l0.embeddingRequestsAtOneAtomPerRound, 1);
    assert.equal(cost.l1.embeddingRequests, 2);
    assert.deepEqual(cost.recall, {
        cases: 2,
        embeddingRequestsMin: 2,
        embeddingRequestsMax: 4,
        rerankRequestsMin: 0,
        rerankRequestsMax: 6,
    });
    assert.deepEqual(cost.reader, { requestsNominal: 2, requestCeilingWithRetry: 6 });
});

test('baseline execution profile 不保存任何 API key', () => {
    const profile = sanitizeExecutionProfile({
        summaryApi: { provider: 'custom', url: 'https://summary/v1', model: 'summary', key: 'secret', maxPerRun: 20 },
        vectorConfig: {
            enabled: true,
            l0Concurrency: 10,
            l0Api: { provider: 'custom', url: 'https://l0/v1', model: 'l0', key: 'secret' },
            embeddingApi: { provider: 'custom', url: 'https://embed/v1', model: 'embed', key: 'secret' },
            rerankApi: { provider: 'custom', url: 'https://rerank/v1', model: 'rerank', key: 'secret' },
        },
    }, {
        api: { provider: 'custom', url: 'https://reader/v1', model: 'reader', key: 'secret' },
        maxTokens: 30000,
    });
    assert.equal(JSON.stringify(profile).includes('secret'), false);
    assert.match(profile.fingerprint, /^[a-f0-9]{64}$/);
});
