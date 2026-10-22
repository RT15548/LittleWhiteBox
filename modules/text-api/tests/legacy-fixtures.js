// Frozen pre-library records: storySummaryPanelConfig, EnaPlanner.config,
// StoryOutline.settings. Fake credentials only; no current-schema builders.
export const legacy = {
    summary: {
        api: { provider: 'google', url: 'https://gateway.test/custom/v3', key: 'summary-key', model: 'gemini-test', modelCache: ['obsolete'] },
        gen: { temperature: 0, top_p: 0.8, top_k: null, presence_penalty: null, frequency_penalty: null },
        trigger: { enabled: true, useStream: true, interval: 20 },
        ui: { hideSummarized: true }, vector: { enabled: false },
    },
    planner: {
        enabled: true, promptBlocks: [{ role: 'user', content: 'fixture' }],
        api: { channel: 'claude', baseUrl: 'https://gateway.test/custom', prefixMode: 'custom', customPrefix: '/v3',
            apiKey: 'planner-key', model: 'claude-test', stream: false, temperature: 1, top_p: 1, top_k: 0,
            presence_penalty: '', frequency_penalty: '', max_tokens: '4096' },
    },
    outline: { globalSettings: { apiUrl: 'https://gateway.test/v1', apiKey: '', model: 'outline-model', mode: 'assist' },
        commSettings: { historyCount: 50, npcPosition: 0, npcOrder: 100, stream: false } },
};

export const emptyPlanner = { api: { channel: 'openai', baseUrl: '', prefixMode: 'auto', customPrefix: '',
    apiKey: '', model: '', stream: true, temperature: 1, top_p: 1, top_k: 0,
    presence_penalty: '', frequency_penalty: '', max_tokens: '' } };
