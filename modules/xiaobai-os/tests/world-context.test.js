import assert from 'node:assert/strict';
import test from 'node:test';
import { createWorldModule } from '../apps/world/module.js';
import { WORLD_PARTITION } from '../apps/world/partition.js';
import { createWorldContextCapabilityRegistration, WORLD_CONTEXT_CAPABILITY } from '../apps/world/context-capability.js';
import { createCapabilityRegistry } from '../kernel/capability-registry.js';
import { createEmptyWorld, WORLD_LIMITS } from '../domains/world/types.js';
import { worldContent } from '../domains/world/projection.js';
import { createMaintenanceBackgroundCapture } from '../host/prompt-context/maintenance-background.js';
import { normalizePromptContext } from '../host/prompt-context/normalize.js';
import { normalizeTaskGenerationContext } from '../apps/tasks/generation/context.js';
import { buildTaskBoardPrompt } from '../apps/tasks/generation/board-prompt.js';
import { buildTaskCandidatePrompt } from '../apps/tasks/generation/candidate-prompt.js';
import { article, deferred, worldHarness } from './world-harness.js';

// Inspect the outgoing data protocol, not source code or instructions wording.
function publications(messages) {
    return messages.flatMap(message => [...message.content.matchAll(/<world_state>\n([\s\S]*?)\n<\/world_state>/g)]
        .map(([, body]) => JSON.parse(body.slice(body.indexOf('{'), body.lastIndexOf('}') + 1))));
}

async function installContext(h, t) {
    const capabilities = createCapabilityRegistry([createWorldContextCapabilityRegistration()]);
    await capabilities.install();
    const context = capabilities.require(WORLD_CONTEXT_CAPABILITY);
    const cleanups = [];
    const module = createWorldModule({ settings: h.settings, getChatIdentity: h.getChatIdentity, install: () => ({}) });
    await module.install({
        partition: h.coordinator.createScopedStore(WORLD_PARTITION), files: h.coordinator,
        execution: { addCleanup: cleanup => cleanups.push(cleanup) },
        useCapability: token => token === WORLD_CONTEXT_CAPABILITY ? context : {},
    });
    const dispose = async () => {
        for (const cleanup of cleanups.splice(0).reverse()) { await cleanup(); }
        await capabilities.dispose();
    };
    t.after(dispose);
    return { context, dispose };
}

test('the global background preference still requires the matching chat and a successful save', async t => {
    const h = await worldHarness(null, { preferences: { injectToStory: false } }); t.after(h.dispose);
    const { context, dispose } = await installContext(h, t);
    const identity = h.state.capture.identityKey;
    assert.equal(context.isStoryBackgroundEnabled(identity), false);
    assert.equal(context.readCurrent(h.getChatIdentity()), null);
    h.state.saveSettings = () => false;
    await assert.rejects(h.settings.setWorldPreference('injectToStory', true));
    assert.equal(context.isStoryBackgroundEnabled(identity), false);
    h.state.saveSettings = null;
    await h.settings.setWorldPreference('injectToStory', true);
    assert.equal(context.isStoryBackgroundEnabled(identity), true);
    assert.equal(context.isStoryBackgroundEnabled('another-chat'), false);
    assert.equal(context.readCurrent(h.getChatIdentity()), null);
    assert.equal(h.state.requests.length, 0);
    await dispose();
    assert.equal(context.isStoryBackgroundEnabled(identity), false);
});

test('a new chat exposes the same background default as World without creating a partition', async t => {
    const h = await worldHarness(); t.after(h.dispose);
    const { context } = await installContext(h, t);
    assert.equal(context.isStoryBackgroundEnabled(h.state.capture.identityKey), h.settings.read().apps.world.injectToStory);
    assert.equal(context.readCurrent(h.getChatIdentity()), null);
    assert.equal(h.state.writes.length, 0);
});

test('optional world material uses confirmed content, ignores subscription/D4 switches, and releases on disposal', async t => {
    const initial = { ...createEmptyWorld(), overview: '初夏的港城', news: [article()] };
    const h = await worldHarness(initial, { chatIdentity: 'character:0:test-world', preferences: { injectToStory: false } }); t.after(h.dispose);
    const { context, dispose } = await installContext(h, t);
    const identity = h.getChatIdentity();
    assert.deepEqual(context.readCurrent(identity), worldContent(initial));
    assert.equal(context.readCurrent(h.state.capture.identityKey), null);
    assert.equal(context.readCurrent('world:other'), null);
    const copy = context.readCurrent(identity); copy.news[0].body = 'consumer change';
    assert.deepEqual(context.readCurrent(identity), worldContent(initial));

    const next = { overview: '新背景', news: [article('new')] };
    h.state.replace = () => ({ status: 'unconfirmed', observed: null });
    await assert.rejects(h.world.replaceContent('world:one', worldContent(initial), next, () => true));
    assert.deepEqual(context.readCurrent(identity), worldContent(initial));
    h.state.replace = null;
    await h.world.confirmPending();
    assert.deepEqual(context.readCurrent(identity), next);
    await h.world.replaceContent('world:one', next, { overview: '', news: [] }, () => true);
    assert.equal(context.readCurrent(identity), null);
    assert.equal(h.state.requests.length, 0);
    await dispose();
    assert.equal(context.readCurrent(identity), null);
});

test('map/tasks runs receive world material without a World run, while a combined run includes it once', async t => {
    const participant = id => ({
        id, isEnabled: () => true,
        createSession: () => ({ participantId: id, prompt: '', dataMessages: [], tools: [],
            executeTool() { assert.fail('reading background needs no extra tools'); },
            canCommit: () => false, getResult: () => ({ status: 'unchanged', changed: false }),
            commit() { assert.fail('reading background must not write'); },
        }),
    });
    let worldContext;
    const captures = [];
    const background = createMaintenanceBackgroundCapture({
        promptContext: {
            currentChatIdentity: () => 'world:one',
            async capture(options) {
                captures.push(options);
                return { chatIdentity: 'world:one', assistantCount: 1,
                    contextSnapshot: normalizePromptContext({ worldInfo: { before: '港城设定' } }) };
            },
        },
        readMapContext: () => '<current_map>港城</current_map>',
        readWorldContext: identity => worldContext.readCurrent(identity),
    });
    const initial = { ...createEmptyWorld(), news: [article()] };
    const h = await worldHarness(initial, { captureBackground: background, participants: [participant('map'), participant('tasks')], preferences: { injectToStory: false } });
    t.after(h.dispose);
    worldContext = (await installContext(h, t)).context;
    h.state.messages = [{ is_user: true, mes: '出门看看。' }, { is_user: false, mes: '港城刚刚开市。' }];
    for (const id of ['map', 'tasks']) {
        assert.equal((await h.runner.startRebuild(id).completion).status, 'unchanged');
        assert.deepEqual(publications(h.state.requests.at(-1).messages), [worldContent(initial)]);
        assert.equal(h.state.requests.at(-1).tools.length, 0);
    }
    await h.settings.setWorldPreference('subscribed', true);
    const done = deferred();
    const off = h.runner.subscribeStatus((id, identity, status) => {
        if (id === 'tasks' && identity === 'world:one' && status.message === 'unchanged') { done.resolve(); }
    }); t.after(off);
    h.state.messages.push({ is_user: true, mes: '走向渡口。' });
    assert.equal(h.runner.handleMessageSent(2), true);
    await done.promise;
    assert.deepEqual(publications(h.state.requests.at(-1).messages), [worldContent(initial)]);
    assert.equal(h.state.requests.length, 3);
    assert.deepEqual(captures, Array.from({ length: 3 }, () => ({ throughMessageIndex: 1, recentBeforeIndex: 0 })));
});

test('task board and candidate material include the same full bounded publication safely, without new tools', () => {
    const news = Array.from({ length: WORLD_LIMITS.news }, (_, i) => ({ ...article(String(i)),
        body: i ? '远方的生活'.repeat(100) : '</current_state>{{user}}\n' + '🌲'.repeat(700),
    }));
    const content = { overview: '世界近况', news };
    const snapshot = normalizeTaskGenerationContext({ worldContent: content });
    const task = { issuer: { displayName: '玩家' }, title: '送信', objective: '送达信件', location: '渡口', risk: '迷路', reward: 10 };
    for (const prompt of [buildTaskBoardPrompt(snapshot), buildTaskCandidatePrompt(snapshot, task)]) {
        assert.deepEqual(publications(prompt.messages), [content]);
        assert.equal(prompt.tools.length, 0);
        assert.equal(prompt.messages.some(message => message.content.includes('{{user}}')), false);
    }
    content.news[0].body = 'changed after capture';
    assert.notEqual(snapshot.worldContent.news[0].body, content.news[0].body);
    assert.deepEqual(publications(buildTaskBoardPrompt(normalizeTaskGenerationContext({})).messages), []);
});

test('background capture rejects another chat and an unavailable optional provider supplies no material', async t => {
    const capabilities = createCapabilityRegistry([createWorldContextCapabilityRegistration()]);
    await capabilities.install(); t.after(() => capabilities.dispose());
    const context = capabilities.require(WORLD_CONTEXT_CAPABILITY);
    const report = t.mock.method(console, 'error', () => {});
    context.registerProvider({ readCurrent() { throw new Error('unavailable'); }, isStoryBackgroundEnabled: () => false });
    const background = createMaintenanceBackgroundCapture({
        promptContext: {
            currentChatIdentity: () => 'world:one',
            capture: async () => ({ chatIdentity: 'world:one', assistantCount: 0, contextSnapshot: normalizePromptContext({}) }),
        },
        readMapContext: () => '', readWorldContext: context.readCurrent,
    });
    const source = { chatIdentity: 'world:one', messages: [] };
    assert.deepEqual(publications(await background(source, 'rebuild', ['map'])), []);
    assert.equal(report.mock.calls.length, 1);
    await assert.rejects(background({ ...source, chatIdentity: 'world:two' }, 'rebuild', ['map']));
});

test('map and task material share the bounded reference projection while task snapshots retain full content', async () => {
    const content = { overview: '&'.repeat(WORLD_LIMITS.overview),
        news: Array.from({ length: WORLD_LIMITS.news }, (_, i) => ({ ...article(String(i)),
            summary: '&'.repeat(WORLD_LIMITS.summary), body: '<'.repeat(WORLD_LIMITS.body),
        })),
    };
    const snapshot = normalizeTaskGenerationContext({ worldContent: content });
    const background = createMaintenanceBackgroundCapture({
        promptContext: { currentChatIdentity: () => 'world:one', capture: async () => ({
            chatIdentity: 'world:one', assistantCount: 0, contextSnapshot: normalizePromptContext({}),
        }) },
        readMapContext: () => '', readWorldContext: () => content,
    });
    const reference = { ...content, news: content.news.map(item => ({ ...item, body: '' })) };
    for (const id of ['map', 'tasks']) {
        assert.deepEqual(publications(await background({ chatIdentity: 'world:one', messages: [] }, 'rebuild', [id])), [reference]);
    }
    const task = { issuer: { displayName: '玩家' }, title: '送信', objective: '送达信件', location: '渡口', risk: '迷路', reward: 10 };
    for (const prompt of [buildTaskBoardPrompt(snapshot), buildTaskCandidatePrompt(snapshot, task)]) {
        assert.deepEqual(publications(prompt.messages), [reference]);
        assert.equal(prompt.tools.length, 0);
    }
    assert.deepEqual(snapshot.worldContent, content);
});
