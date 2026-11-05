import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { EventEmitter } from 'node:events';
import { createHarness, readStoredValue } from './helpers/state2-harness.js';

// Execute the guide's runnable examples as inputs, not a source spelling checklist.
// This catches examples that drift from their initialization schema or public API.
const guide = readFileSync(new URL('../state2/README.md', import.meta.url), 'utf8');
const examples = [...guide.matchAll(/^```(\w*)\r?\n([\s\S]*?)^```/gm)]
    .map(([, language, body]) => ({ language, body }));
const initializer = examples.find(({ body }) => body.trimStart().startsWith('<<taskjs>>'));

async function runScript(body, api, context, globals = {}) {
    const diagnostics = [];
    const source = body.replace(/^\s*<<taskjs>>\s*/, '').replace(/\s*<<\/taskjs>>\s*$/, '');
    await runInNewContext(`(async () => { ${source}\n })()`, {
        LWB_StateV2: api,
        SillyTavern: { getContext: () => context },
        console: { log() {}, warn: (...args) => diagnostics.push(args), error: (...args) => diagnostics.push(args) },
        ...globals,
    });
    assert.deepEqual(diagnostics, []);
}

test('guide initialization and runnable examples work with the documented initial state', async () => {
    const harness = await createHarness();
    try {
        const context = harness.env.state.ctx;
        const implementation = harness.executor.createStateApi();
        const checked = result => { assert.deepEqual(result.errors, []); return result; };
        const api = {
            ...implementation,
            apply: input => checked(implementation.apply(input)),
            applyText: (...args) => checked(implementation.applyText(...args)),
            beginTurn: options => {
                const turn = implementation.beginTurn(options);
                return { ...turn, commit: input => checked(turn.commit(input)) };
            },
        };
        async function initialize() {
            harness.reset();
            context.chat.push({ mes: '开场', is_user: false, swipe_id: 0 });
            await runScript(initializer.body, api, context);
            assert.deepEqual(readStoredValue(context, '数据'), {
                角色: { 姓名: '苏晚', 生命值: 100, 魔法值: 50, 金币: 0, 技能: [], 背包: {} },
                后宫: {}, 当前地点: '新手村',
            });
            context.chat.push({ mes: '剧情', is_user: false, swipe_id: 0 });
        }
        await initialize();
        for (const { language, body } of examples) {
            if (language === 'js') {
                await initialize();
                await runScript(body, api, context);
                assert.equal(readStoredValue(context, '数据').角色.姓名, '苏晚');
                assert.equal(context.chatMetadata.variables.LWB_STATE_ERRORS, '');
                if (context.chat.at(-1).extra?.LittleWhiteBox_state2?.entries.some(entry => entry.scope === 'turn')) {
                    const stored = structuredClone(context.chatMetadata.variables);
                    await runScript(body, api, context);
                    assert.deepEqual(context.chatMetadata.variables, stored, 'rerunning the replaceable-turn example does not accumulate its increment');
                }
            } else if (body.trimStart().startsWith('<state>')) {
                await initialize();
                const result = harness.executor.applyStateForMessage(1, body);
                assert.deepEqual(result.errors, []);
                assert.ok(result.atoms.length > 0);
                const stored = structuredClone(context.chatMetadata.variables);
                harness.executor.applyStateForMessage(1, body);
                assert.deepEqual(context.chatMetadata.variables, stored, 'rendering an example again must not repeat its changes');
            }
        }
    } finally {
        harness.cleanup();
    }
});

// Acceptance: the alternate-greeting task initializes each swipe and releases
// its listener on disposal; otherwise switching greetings silently loses state.
test('guide task scripts initialize alternate greetings without duplicate records or lingering listeners', async () => {
    const harness = await createHarness();
    const cleanups = [];
    try {
        const context = harness.env.state.ctx;
        context.eventSource = new EventEmitter();
        context.eventTypes = { MESSAGE_SWIPED: 'message_swiped' };
        const message = { mes: '开场', is_user: false, swipe_id: 0,
            swipes: ['开场', '备选开场'], swipe_info: [{ extra: {} }, { extra: {} }], extra: {} };
        context.chat.push(message);
        for (const { body } of examples.filter(item => item.body.trimStart().startsWith('<<taskjs>>') && item !== initializer)) {
            await runScript(body, harness.executor.createStateApi(), context, { onCleanup: callback => cleanups.push(callback) });
        }
        assert.equal(readStoredValue(context, '数据').当前地点, '新手村');
        for (const [swipe, place] of [[1, '城镇'], [0, '新手村']]) {
            message.swipe_id = swipe;
            message.extra = structuredClone(message.swipe_info[swipe].extra);
            harness.executor.handleStateSwipe(0);
            context.eventSource.emit(context.eventTypes.MESSAGE_SWIPED, 0);
            assert.equal(readStoredValue(context, '数据').当前地点, place);
            const stored = structuredClone(message.extra);
            context.eventSource.emit(context.eventTypes.MESSAGE_SWIPED, 0);
            assert.deepEqual(message.extra, stored);
        }
        cleanups.splice(0).forEach(cleanup => cleanup());
        assert.equal(context.eventSource.listenerCount(context.eventTypes.MESSAGE_SWIPED), 0);
    } finally {
        cleanups.forEach(cleanup => cleanup());
        harness.cleanup();
    }
});
