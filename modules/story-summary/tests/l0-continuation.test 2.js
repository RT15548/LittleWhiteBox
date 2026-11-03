/* global Buffer */
import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
import 'fake-indexeddb/auto';

// Protect delayed admission and real L0 metadata writes. Keep the Dice parser,
// extraction pipeline, state store and timer implementation; replace host I/O.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const host = globalThis.__l0ContinuationTest = { context: {}, metadata: {}, calls: 0 };
const shims = {
    'extensions.js': 'export const getContext=()=>globalThis.__l0ContinuationTest.context; export const saveMetadataDebounced=()=>{};',
    'script.js': 'export const chat_metadata=globalThis.__l0ContinuationTest.metadata; export const isChatSaving=false; export const getRequestHeaders=()=>({});',
    'debug-core.js': 'export const xbLog={info(){},warn(){},error(){},debug(){}};',
    'config.js': 'export const getVectorConfig=()=>({enabled:true}); export const getTextFilterRules=()=>[];',
    'runtime.js': 'export const applyRecallRuntimeMutationBestEffort=()=>{}; export const clearRecallRuntime=async()=>{};',
    'siliconflow.js': 'export const embed=async()=>{throw new Error("unexpected embedding");};',
    'llm-service.js': 'export const callLLM=async()=>{globalThis.__l0ContinuationTest.calls++;return JSON.stringify({anchors:[{scene:"The traveler reaches the balcony and finds the hidden entrance.",edges:[],where:"Balcony"}]});};',
};
const bundled = await build({
    stdin: { resolveDir: root, contents: [
        "export * from './modules/story-summary/vector/pipeline/l0-eligibility.js';",
        "export * from './modules/story-summary/vector/pipeline/maintenance-scheduler.js';",
        "export { incrementalExtractAtoms, getAnchorStats } from './modules/story-summary/vector/pipeline/state-integration.js';",
        "export { getL0FloorStatus, getStateAtoms } from './modules/story-summary/vector/storage/state-store.js';",
        "export { isDiceContinuationPending } from './modules/xiaobai-os/apps/dice/application/continuation-state.ts';",
        "export { prepareActionCheck } from './modules/xiaobai-os/apps/dice/application/prepare-action-check.ts';",
        "export { DICE_MESSAGE_KEY } from './modules/xiaobai-os/apps/dice/domain/check-records.ts';",
        "export { db } from './modules/story-summary/data/db.js';",
    ].join('\n') },
    bundle: true, write: false, format: 'esm', platform: 'node',
    banner: { js: `import { createRequire } from 'node:module'; const require = createRequire(${JSON.stringify(import.meta.url)});` },
    plugins: [{ name: 'host-boundaries', setup(api) {
        api.onResolve({ filter: /.*/ }, args => {
            const name = path.basename(args.path);
            return Object.hasOwn(shims, name) ? { path: name, namespace: 'host' } : null;
        });
        api.onLoad({ filter: /.*/, namespace: 'host' }, args => ({ contents: shims[args.path], resolveDir: root }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Local test bundle, not external code.
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const originalFetch = globalThis.fetch;
after(() => { mod.db.close(); globalThis.fetch = originalFetch; delete globalThis.__l0ContinuationTest; });

const request = 'The traveler reaches for the ledge.\n<xb_action_check>{"action":"Climb the wall","stat":"Agility","difficulty":"hard"}</xb_action_check>';
const ai = mes => ({ is_user: false, mes, send_date: 'unchanged' });
const user = () => ({ is_user: true, mes: 'Continue the journey.' });
beforeEach(() => {
    for (const key of Object.keys(host.metadata)) delete host.metadata[key];
    host.context = { chatId: 'chat', chat: [user(), ai(request)], characterId: 0,
        characters: [{ name: '角色', chat: 'chat', avatar: 'fixture.png' }],
        saveMetadata: async () => { host.persisted = structuredClone(host.metadata); } };
    globalThis.fetch = async () => new Response(JSON.stringify([{ chat_metadata: host.persisted }]));
    host.calls = 0;
    mod.configureL0ContinuationCheck(mod.isDiceContinuationPending);
});

function roll(message = host.context.chat.at(-1)) {
    const candidate = mod.prepareActionCheck({ body: message.mes, generatedFrom: 0, id: 'roll1', random: () => 0.5 });
    assert.equal(candidate.kind, 'candidate');
    message.mes = candidate.body;
    message.extra = { [mod.DICE_MESSAGE_KEY]: candidate.records };
}

function timerFixture(t) {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const calls = [];
    const scheduler = mod.createVectorMaintenanceScheduler({ getContext: () => host.context,
        isStale: chatId => chatId !== host.context.chatId, getQuietWaitMs: () => 0, run: chatId => calls.push(chatId) });
    t.after(() => scheduler.clear());
    return { ...scheduler, calls };
}

test('pending request and saved roll do not arm the timer; same-floor completion arms it again', t => {
    const timer = timerFixture(t);
    timer.schedule(5000);
    t.mock.timers.tick(5000);
    assert.deepEqual(timer.calls, []);
    roll();
    timer.schedule(5000);
    t.mock.timers.tick(5000);
    assert.deepEqual(timer.calls, []);
    host.context.chat[1].mes += '\nThe traveler opens the entrance.';
    timer.schedule(5000);
    t.mock.timers.tick(4999);
    assert.deepEqual(timer.calls, []);
    t.mock.timers.tick(1);
    assert.deepEqual(timer.calls, ['chat']);
});

test('leaving an unresolved roll for a new floor re-admits ordinary automatic backfill', t => {
    const timer = timerFixture(t);
    roll();
    timer.schedule(5000);
    host.context.chat.push(user());
    timer.schedule(5000);
    t.mock.timers.tick(5000);
    assert.deepEqual(timer.calls, ['chat']);
    assert.equal(mod.isL0FloorDeferred(host.context.chat, 1), false);
});

test('a previously armed timer rechecks the body, replacement cancels it, and chat changes discard it', t => {
    const timer = timerFixture(t);
    host.context.chat[1].mes = 'Ordinary complete reply.';
    timer.schedule(5000);
    host.context.chat[1].mes = request;
    t.mock.timers.tick(5000);
    assert.deepEqual(timer.calls, []);
    host.context.chat[1].mes = 'Ordinary complete reply.';
    timer.schedule(5000);
    host.context.chat[1].mes = request;
    timer.schedule(5000);
    t.mock.timers.tick(5000);
    assert.deepEqual(timer.calls, []);
    host.context.chat.push(user());
    timer.schedule(5000);
    host.context.chatId = 'another-chat';
    t.mock.timers.tick(5000);
    assert.deepEqual(timer.calls, []);
});

test('code and quotes are not requests; a completed or unowned marker does not defer normal prose', () => {
    for (const body of ['```\n' + request + '\n```', request.split('\n').map(line => '> ' + line).join('\n'), 'An ordinary reply.', '[dice:unknown]']) {
        assert.equal(mod.isDiceContinuationPending(ai(body)), false);
    }
    assert.equal(mod.isDiceContinuationPending(ai('<xb_action_check')), true);
    roll();
    host.context.chat[1].mes += '\nThe traveler continues.';
    assert.equal(mod.isDiceContinuationPending(host.context.chat[1]), false);
});

test('postponement writes no completion status; completed continuation is extracted normally', async () => {
    const extract = () => mod.incrementalExtractAtoms('chat', host.context.chat);
    await extract();
    assert.equal(host.calls, 0);
    assert.equal(mod.getL0FloorStatus(1), null);
    assert.equal((await mod.getAnchorStats()).pending, 1);
    roll();
    await extract();
    assert.equal(host.calls, 0);
    assert.equal(mod.getL0FloorStatus(1), null);
    host.context.chat[1].mes += '\nThe traveler finds the entrance.';
    await extract();
    assert.equal(host.calls, 1);
    assert.equal(mod.getL0FloorStatus(1).status, 'ok');
    assert.deepEqual(mod.getStateAtoms().map(atom => atom.floor), [1]);
    assert.equal((await mod.getAnchorStats()).pending, 0);
});

test('an abandoned request or rolled tail is still extracted once it becomes historical, including after reload', async () => {
    for (const rolled of [false, true]) {
        for (const key of Object.keys(host.metadata)) delete host.metadata[key];
        host.context.chat = [user(), ai(request)];
        if (rolled) roll();
        await mod.incrementalExtractAtoms('chat', host.context.chat);
        assert.equal(mod.getL0FloorStatus(1), null);
        host.context.chat = structuredClone([...host.context.chat, user()]);
        const before = host.calls;
        await mod.incrementalExtractAtoms('chat', host.context.chat);
        assert.equal(host.calls, before + 1);
        assert.equal(mod.getL0FloorStatus(1).status, 'ok');
        assert.equal((await mod.getAnchorStats()).pending, 0);
        await mod.incrementalExtractAtoms('chat', host.context.chat);
        assert.equal(host.calls, before + 1);
    }
});
