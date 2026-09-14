import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import test from 'node:test';
import { build } from 'esbuild';

import { createTaskGenerationRequests } from '../apps/tasks/generation/request.js';
import { normalizeTaskGenerationContext } from '../apps/tasks/generation/context.js';
import { createTaskGenerationRuntime } from '../apps/tasks/generation/runtime.js';
import { createHostPromptContextAdapter } from '../host/prompt-context/capture.js';

// Exercise the real Tasks adapter; only its unused native default is substituted for Node.
const compiled = await build({
    entryPoints: ['modules/xiaobai-os/apps/tasks/host/context-adapter.ts'], absWorkingDir: process.cwd(),
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    plugins: [{ name: 'injected-prompt-context', setup(builder) {
        builder.onResolve({ filter: /host\/prompt-context\/adapter\.js$/ },
            () => ({ path: 'default', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
            contents: 'export function createPromptContextAdapter() { throw new Error("Test must inject host context"); }',
        }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Trusted repository code with a fixed, fail-fast native default substitute.
const { createTaskGenerationContextAdapter } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

function validConfig() {
    return {
        currentPresetName: 'tasks',
        presets: {
            tasks: {
                provider: 'sillytavern-openai-compatible',
                modelConfigs: {
                    'sillytavern-openai-compatible': { model: 'test-model', apiKey: '' },
                },
            },
        },
    };
}

function snapshot(persona = '谨慎的旅人') {
    return {
        player: { displayName: '玩家', persona },
        characters: [],
        recentMessages: [],
        worldInfo: { before: '', after: '', depth: [] },
    };
}

function response() {
    return JSON.stringify({
        tasks: [{
            grade: 'B',
            tags: ['禁忌'],
            posture: '易介入',
            title: '封蜡箱',
            hook: '后门刚送来一只写着陌生名字的箱子。',
            objective: '替收件人签收封蜡箱',
            requirements: '不要拆封',
            location: '教学楼后门',
            timing: '现在就行',
            risk: '签收记录会留下玩家姓名',
            reward: 180,
        }],
    });
}

function createHarness({
    changeBeforeFinalGuard = false,
    changeWhenProviderReturns = false,
    providerText = response(),
    loadConfig,
    openSession,
    beforeProviderReturns = () => {},
    beforeFinalGuard = () => {},
    contextAdapter,
    records = [],
} = {}) {
    const state = {
        capture: snapshot(),
        captureCount: 0,
        writes: 0,
        reports: [],
        requests: [],
        mainGenerationActive: false,
        openSessionCount: 0,
    };
    const view = { domain: null, records, playerBalance: 100, writeState: 'ready' };
    state.view = view;
    async function replace(_input, guard) {
        if (!await guard()) {throw new Error('tasks_commit_guard_failed');}
        if (changeBeforeFinalGuard) {state.capture = snapshot('已经变化的身份');}
        beforeFinalGuard();
        if (!await guard()) {throw new Error('tasks_commit_guard_failed');}
        state.writes += 1;
        return { changed: true, view };
    }
    const tasks = {
        readCurrent: () => structuredClone(view),
        getWriteState: () => 'ready',
        createActionId: () => 'task-action-unused',
        replaceBoard: replace,
        replaceCandidates: replace,
    };
    const context = contextAdapter ?? {
        currentChatIdentity: () => 'character:1:chat-a',
        async capture() {
            state.captureCount += 1;
            return {
                chatIdentity: 'character:1:chat-a',
                contextSnapshot: structuredClone(state.capture),
                assistantCount: 4,
            };
        },
    };
    const gateway = {
        async loadConfig() {return loadConfig ? await loadConfig() : validConfig();},
        async openSession() {
            state.openSessionCount += 1;
            if (openSession) {return await openSession();}
            return {
                async run(request) {
                    state.requests.push({ ...request, signal: undefined });
                    if (changeWhenProviderReturns) {state.capture = snapshot('请求期间变化的身份');}
                    beforeProviderReturns(state);
                    return { text: providerText };
                },
            };
        },
    };
    const requests = createTaskGenerationRequests({
        gateway,
        tasks,
        context,
        isMainGenerationActive: () => state.mainGenerationActive,
        now: () => 123,
        report: error => state.reports.push(error),
    });
    return { requests, state };
}

test('generation reports failures without leaking provider details, writing data or retrying automatically', async () => {
    const secret = 'sensitive-key-and-response-body';
    for (const scenario of [
        { loadConfig: () => ({}), errorCode: 'tasks_agent_not_configured' },
        { loadConfig: () => { throw new Error(secret); }, errorCode: 'tasks_config_load_failed' },
        ...[401, 403, 400, 404, 413, 429, 503, 504, undefined].map(status => ({ status })),
    ]) {
        let calls = 0;
        const { requests, state } = createHarness({
            loadConfig: scenario.loadConfig,
            openSession: async () => ({ run: async () => { calls++; throw Object.assign(new Error(secret), { status: scenario.status }); } }),
        });
        let done;
        const errors = [];
        const finished = new Promise(resolve => { done = resolve; });
        const runtime = createTaskGenerationRuntime({ requests, getChatIdentity: () => 'chat', report: error => errors.push(error),
            onChange() { if (runtime.getState('chat').state === 'idle') { done(); } } });
        runtime.startBoard('chat');
        await finished;
        const result = runtime.getState('chat');
        assert.equal(result.state, 'idle');
        assert.equal(errors.length, 1);
        if (scenario.errorCode) { assert.equal(errors[0].message, scenario.errorCode); }
        else { assert.equal(errors[0].status, scenario.status); }
        assert.doesNotMatch(result.message, /sensitive-key|response-body/);
        runtime.reconcileSave('chat', true);
        assert.deepEqual(runtime.getState('chat'), result, 'unrelated storage recovery must not clear an API failure');
        assert.equal(calls, scenario.loadConfig ? 0 : 1);
        assert.equal(state.writes, 0);
    }
});

test('probabilistic world info is scanned once per request while live story and CAS guards remain active', async t => {
    const candidate = { name: '船工', description: '熟悉港口', pitch: '我来送', capability: '识水路', risk: '不擅陆路' };
    for (const kind of ['board', 'candidates']) {
        for (const change of ['none', 'chat', 'message', 'swipe', 'persona', 'character', 'summary', 'map', 'cas', 'final-message']) {
            await t.test(`${kind}: ${change}`, async () => {
                let scans = 0;
                let summary = '玩家抵达港口';
                let map = '<current_map>港口</current_map>';
                const host = {
                    chatId: 'chat-a', characterId: 1, name1: '玩家', name2: '船工',
                    characters: { 1: { name: '船工', avatar: 'sailor.png', description: '熟悉港口' } },
                    powerUserSettings: { persona_description: '旅人' },
                    chat: [{ mes: '玩家抵达港口', is_user: false, swipe_id: 0 }],
                    getWorldInfoPrompt() {
                        scans++;
                        return { worldInfoBefore: scans % 2 ? '集市今日开放' : '', worldInfoAfter: '', worldInfoDepth: [] };
                    },
                };
                const record = { taskId: 'delivery', taskRevision: 1, eventId: 'posted', source: 'published', status: 'recruiting',
                    issuer: { displayName: '玩家' }, title: '送箱子', objective: '送到仓库', location: '港口', risk: '破损', reward: 100, candidates: [] };
                const adapter = createTaskGenerationContextAdapter({
                    promptContext: createHostPromptContextAdapter({ readContext: () => host, readStoryEvents: () => summary }),
                    readMapContext: () => map,
                });
                const { requests, state } = createHarness({
                    contextAdapter: adapter, records: [record],
                    providerText: kind === 'board' ? response() : JSON.stringify({ candidates: [candidate] }),
                    beforeProviderReturns(state) {
                        if (change === 'chat') { host.chatId = 'chat-b'; }
                        if (change === 'message') { host.chat[0].mes = '玩家离开港口'; }
                        if (change === 'swipe') { host.chat[0].swipe_id = 1; }
                        if (change === 'persona') { host.powerUserSettings.persona_description = '商人'; }
                        if (change === 'character') { host.characters[1].description = '不识水路'; }
                        if (change === 'summary') { summary = '港口已经封锁'; }
                        if (change === 'map') { map = '<current_map>城门</current_map>'; }
                        if (change === 'cas' && kind === 'candidates') { record.taskRevision++; }
                        if (change === 'cas' && kind === 'board') { state.view.domain = { board: { boardId: 'another-board' } }; }
                    },
                    beforeFinalGuard() {
                        if (change === 'final-message') { host.chat[0].mes = '保存前剧情变化'; }
                    },
                });
                const result = await (kind === 'board' ? requests.refreshBoard() : requests.refreshCandidates({
                    taskId: record.taskId, expectedTaskRevision: 1, expectedEventId: record.eventId,
                }));
                assert.equal(scans, 1, 'validating a result must not reroll probabilistic world info');
                assert.equal(result.changed, change === 'none');
                assert.equal(result.status === 'cancelled', change !== 'none');
                assert.equal(state.writes, change === 'none' ? 1 : 0);
                assert.deepEqual(state.reports, []);
            });
        }
    }
});

test('board generation uses one tool-free provider round and commits only after every boundary check', async () => {
    const { requests, state } = createHarness();
    const result = await requests.refreshBoard();

    assert.equal(result.status, 'partial');
    assert.equal(result.changed, true);
    assert.equal(state.writes, 1);
    assert.equal(state.requests.length, 1);
    assert.deepEqual(state.requests[0].tools, []);
    assert.deepEqual(state.requests[0].messages.map(message => message.role), ['system', 'system', 'user', 'user']);
    assert.equal(state.captureCount, 4);
    assert.deepEqual(state.reports, []);
});

test('a legacy disabled flag cannot block a configured Agent request', async () => {
    const { requests, state } = createHarness({
        loadConfig: () => ({ ...validConfig(), enabled: false }),
    });
    const result = await requests.refreshBoard();

    assert.equal(result.changed, true);
    assert.equal(state.openSessionCount, 1);
    assert.equal(state.requests.length, 1);
});

test('a context change at the final commit guard cancels the board result without a write or error report', async () => {
    const { requests, state } = createHarness({ changeBeforeFinalGuard: true });
    const result = await requests.refreshBoard();

    assert.equal(result.status, 'cancelled');
    assert.equal(result.changed, false);
    assert.equal(state.writes, 0);
    assert.equal(state.captureCount, 4);
    assert.deepEqual(state.reports, []);
});

test('a stale tool-free response is cancelled even when it would not write anything', async () => {
    const { requests, state } = createHarness({
        changeWhenProviderReturns: true,
        providerText: '{"tasks":[]}',
    });
    const result = await requests.refreshBoard();

    assert.equal(result.status, 'cancelled');
    assert.equal(result.changed, false);
    assert.equal(state.writes, 0);
    assert.equal(state.captureCount, 2);
    assert.deepEqual(state.reports, []);
});

test('main generation starting while Agent config loads cancels before opening a session or calling the provider', async () => {
    let resolveConfig;
    const config = new Promise(resolve => {resolveConfig = resolve;});
    const { requests, state } = createHarness({ loadConfig: () => config });
    const pending = requests.refreshBoard();
    while (state.captureCount === 0) {await Promise.resolve();}

    state.mainGenerationActive = true;
    resolveConfig(validConfig());
    const result = await pending;

    assert.equal(result.status, 'cancelled');
    assert.equal(state.openSessionCount, 0);
    assert.equal(state.requests.length, 0);
    assert.equal(state.writes, 0);
    assert.deepEqual(state.reports, []);
});

test('world reference updates do not cancel board or candidate generation, but story changes still do', async t => {
    const publication = { overview: '港城近况', news: [{ id: 'canal', title: '运河通航', summary: '运河恢复通航。', body: '第一艘船经过石桥。' }] };
    const candidate = { name: '船工', description: '熟悉港口，想赚运费。', pitch: '我来送。', capability: '识水路', risk: '不擅陆路' };
    const record = { taskId: 'delivery', taskRevision: 1, eventId: 'posted', source: 'published', status: 'recruiting',
        issuer: { displayName: '玩家' }, title: '送箱子', objective: '送到仓库', location: '港口', risk: '破损', reward: 100, candidates: [] };
    for (const kind of ['board', 'candidates']) {
        for (const changeStory of [false, true]) {
            await t.test(`${kind}, story changed: ${changeStory}`, async () => {
                const { requests, state } = createHarness({
                    records: [record], providerText: kind === 'board' ? response() : JSON.stringify({ candidates: [candidate] }),
                    beforeProviderReturns(state) {
                        state.capture.worldContent.news[0].body += ' 船上挂着蓝旗。';
                        if (changeStory) { state.capture.recentMessages.push({ role: 'assistant', speakerName: '旁白', text: '玩家离开港口。' }); }
                    },
                });
                state.capture = normalizeTaskGenerationContext({ ...snapshot(), worldContent: publication });
                const result = await (kind === 'board' ? requests.refreshBoard() : requests.refreshCandidates({
                    taskId: record.taskId, expectedTaskRevision: record.taskRevision, expectedEventId: record.eventId,
                }));
                assert.equal(result.status === 'cancelled', changeStory);
                assert.equal(result.changed, !changeStory);
                assert.equal(state.writes, changeStory ? 0 : 1);
                assert.equal(state.requests.length, 1);
                assert.deepEqual(state.reports, []);
            });
        }
    }
});
