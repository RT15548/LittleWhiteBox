import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createTestModuleUrl } from './helpers/bundle-module.js';
import { buildSummaryAssistantDocPrompt, resolveSummaryStyle } from '../data/generation-rules.js';
import { getMemoryChatPrompt, getMemoryMaintenancePrompt } from '../maintenance/prompt.js';
import { runMemoryAgent } from '../maintenance/runner.js';
import { createMemorySession } from '../maintenance/session.js';
import { maintenanceFixture } from './fixtures/memory-maintenance.js';

// Contracts: custom instructions survive save/reload and are used on the next
// request; reset follows built-ins; failed saves do not publish unsaved settings.
// Failures silently lose user configuration or send the wrong model protocol.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const state = globalThis.__summaryStyleTest = { disk: null, requests: [], dropStyle: false };
after(() => { delete globalThis.__summaryStyleTest; });
const shims = {
    'modules/text-api/host.js': 'export const generateFeatureText = async (_, request) => { globalThis.__summaryStyleTest.requests.push(request); return {text: "{}"}; };',
    'modules/text-api/repository.js': 'export const getTextApiRepository = async () => ({load: async () => {}});',
    'core/debug-core.js': 'export const xbLog = {info(){},warn(){},error(){}};',
    'core/server-storage.js': `const state = globalThis.__summaryStyleTest;
        export const CommonSettingStorage = {
            async setAndSave(_, value) { state.disk = structuredClone(value); if (state.dropStyle) state.disk.prompts.summaryStyle = ''; },
            clearCache() {}, async getStrict() { return structuredClone(state.disk); }
        };`,
    'modules/story-summary/data/config-local-cache.js': 'export const SUMMARY_CONFIG_LOCAL_STORAGE_KEY="isolated-summary-test"; export const writeSummaryConfigLocalCache=()=>{};',
};
const bundle = await build({
    stdin: { resolveDir: root, contents: `export * from './modules/story-summary/data/config.js';
        export { generateSummary } from './modules/story-summary/generate/llm.js';` },
    bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent',
    plugins: [{ name: 'summary-style-host-boundaries', setup(api) {
        api.onResolve({ filter: /extensions\.js$/ }, () => ({ path: 'extensions', namespace: 'stub' }));
        api.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const extension_settings = {};', loader: 'js' }));
        api.onLoad({ filter: /\.js$/ }, args => {
            const relative = path.relative(root, args.path).replaceAll('\\', '/');
            if (shims[relative]) return { contents: shims[relative], loader: 'js' };
        });
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Imports only our locally bundled test module.
const config = await import(await createTestModuleUrl(bundle.outputFiles[0].text));
const input = { existingSummary: 'Existing episode', existingFacts: [], newHistoryText: '#2 New dialogue', historyRange: '2-2', existingEventCount: 1 };

test('save, reload, new generation and reset use current style without changing the protocol', async () => {
    config.applySummaryPanelConfigSnapshot({});
    await config.generateSummary(input);
    const baseline = state.requests.at(-1).messages;
    const baselinePrompts = config.getSummaryPrompts();
    assert.equal(baseline.length, 10);
    for (const summaryStyle of ['Use two short sentences. Keep original names.', 'カードには具体的な行動を残す。', '   ', '']) {
        const next = config.getSummaryPanelConfig();
        next.prompts.summaryStyle = summaryStyle;
        await config.saveSummaryPanelConfigVerified(next);
        config.applySummaryPanelConfigSnapshot({});
        await config.loadConfigFromServer();
        assert.equal(config.getSummaryPanelConfig().prompts.summaryStyle, summaryStyle.trim());
        await config.generateSummary(input);
        const messages = state.requests.at(-1).messages;
        assert.deepEqual(messages.map(({role}) => role), baseline.map(({role}) => role));
        messages.forEach((message, i) => {
            assert.deepEqual(message, i === 1
                ? { ...baseline[i], content: buildSummaryAssistantDocPrompt(summaryStyle) } : baseline[i]);
        });
        assert.deepEqual(config.getSummaryPrompts(), {
            ...baselinePrompts, summaryAssistantDocPrompt: buildSummaryAssistantDocPrompt(summaryStyle),
        });
    }
    assert.equal(resolveSummaryStyle('  '), resolveSummaryStyle());
});

test('readback mismatch reports failure and keeps the last confirmed style active', async () => {
    config.applySummaryPanelConfigSnapshot({ prompts: { summaryStyle: 'Confirmed style' } });
    state.dropStyle = true;
    const next = config.getSummaryPanelConfig();
    next.prompts.summaryStyle = 'Unsaved style';
    try {
        await assert.rejects(config.saveSummaryPanelConfigVerified(next));
        assert.equal(config.getSummaryPanelConfig().prompts.summaryStyle, 'Confirmed style');
    } finally { state.dropStyle = false; }
});

test('maintenance and interactive requests receive the selected style for that run', async () => {
    for (const mode of ['auto', 'chat']) {
        for (const summaryStyle of ['Write concise episode cards.', 'Conservez les noms originaux.', '']) {
            const requests = [];
            const session = mode === 'auto' ? createMemorySession(maintenanceFixture()) : null;
            const result = await runMemoryAgent(session, {
                mode, summaryStyle, question: 'Describe the available task.',
                config: { provider: 'openai', model: 'offline-test', maxTokens: 1000 },
                countTokens: async () => ({ tokens: 100, source: 'test' }),
                adapter: { chat: async request => { requests.push(request); return { text: 'No changes.' }; } },
            });
            assert.equal(result.saved, 0);
            const expected = mode === 'auto' ? getMemoryMaintenancePrompt(summaryStyle) : getMemoryChatPrompt(summaryStyle);
            assert.equal(requests[0].systemPrompt.slice(0, expected.length), expected);
        }
    }
});
