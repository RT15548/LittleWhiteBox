import assert from 'node:assert/strict';
import test from 'node:test';
import { createWorldController } from '../apps/world/host/controller.js';
import { createWorldPromptRuntime } from '../apps/world/host/prompt-runtime.js';
import { createEmptyWorld } from '../domains/world/types.js';
import { worldContent } from '../domains/world/projection.js';
import { buildWorldStoryPrompt } from '../apps/world/host/story-projection.js';
import { article, deferred, tick, worldHarness } from './world-harness.js';

function controller(h, checkAgent = async () => true) {
    const pushes = [];
    const runtime = createWorldController({ world: h.world, maintenance: h.runner,
        getChatIdentity: h.getChatIdentity, checkAgent });
    runtime.startBackground();
    const activate = () => runtime.activate({ activationToken: 'world', isCurrent: () => true,
        post(type, payload) { pushes.push({ type, payload }); return true; } });
    const request = (type, extra = {}) => runtime.handleMessage({ type: `world/${type}`, payload: { chatIdentity: h.getChatIdentity(), ...extra } });
    return { runtime, pushes, activate, request };
}

test('opening and reading are read-only; subscription without a scene saves intent without calling the model', async t => {
    const h = await worldHarness(); t.after(h.dispose);
    h.state.messages = [];
    const c = controller(h); t.after(() => c.runtime.stopBackground());
    assert.equal(c.activate().world.subscribed, false);
    await c.request('read');
    assert.equal(h.state.writes.length, 0);
    assert.equal(h.state.requests.length, 0);
    const result = await c.request('subscribe', { enabled: true });
    assert.equal(result.state.world.subscribed, true);
    c.runtime.deactivate(); c.activate();
    await tick();
    assert.equal(h.state.requests.length, 0);
    assert.equal(h.state.writes.length, 1);
});

test('World opens, subscribes and publishes when runtime and sidecar chat keys differ', async t => {
    const h = await worldHarness(null, { chatIdentity: 'character:0:test-world' }); t.after(h.dispose);
    h.state.capture.identityKey = 'character:world.png:test-world';
    await h.world.refreshCurrent();
    const c = controller(h); t.after(() => c.runtime.stopBackground());
    const opened = c.activate();
    assert.equal(opened.chatIdentity, 'character:0:test-world');
    assert.equal(opened.world.subscribed, false);
    await c.request('read');
    assert.equal(h.state.writes.length, 0);
    assert.equal(h.state.requests.length, 0);

    let round = 0;
    h.state.generate = async () => ++round === 1
        ? { toolCalls: [{ id: 'news', name: 'WorldEdit', arguments: JSON.stringify({ upsert: [article()] }) }] }
        : { text: 'Updated.' };
    const done = deferred();
    const off = h.runner.subscribeStatus((id, identity, status) => {
        if (id === 'world' && identity === h.getChatIdentity() && status.state !== 'running') { done.resolve(status); }
    }); t.after(off);
    assert.equal((await c.request('subscribe', { enabled: true })).state.world.subscribed, true);
    assert.equal((await done.promise).message, 'updated');
    assert.deepEqual(h.state.persisted.partitions.world.news, [article()]);
    assert.equal(h.state.persisted.binding.ownerLocator, 'world.png');
    assert.ok(c.pushes.some(push => push.type === 'world/state'
        && push.payload.state.chatIdentity === h.getChatIdentity() && push.payload.state.world.news.length === 1));
    await c.request('background', { enabled: false });
    assert.equal(h.state.persisted.partitions.world.injectToStory, false);
    const requests = h.state.requests.length;
    c.runtime.deactivate();
    assert.deepEqual(c.activate().world.news, [article()]);
    await c.request('read');
    assert.equal(h.state.requests.length, requests);
    await assert.rejects(c.request('background', { chatIdentity: h.state.capture.identityKey, enabled: true }));
});

test('World preserves safe API failure categories through maintenance and reopening does not retry', async t => {
    const h = await worldHarness({ ...createEmptyWorld(), news: [article()] }); t.after(h.dispose);
    const c = controller(h); t.after(() => c.runtime.stopBackground()); c.activate();
    for (const [status, reason] of [[401, 'provider-auth'], [429, 'provider-rate-limit'], [400, 'provider-request']]) {
        h.state.generate = async () => { throw Object.assign(new Error('secret-key-provider-body'), { status }); };
        const run = h.runner.startRebuild('world');
        assert.equal((await run.completion).status, 'failed');
        assert.equal(h.runner.getStatus('world', h.getChatIdentity()).reason, reason);
        const count = h.state.requests.length;
        c.runtime.deactivate();
        const reopened = c.activate();
        assert.equal(reopened.maintenance, 'error');
        assert.doesNotMatch(reopened.message, /secret-key|provider-body/);
        assert.equal(reopened.world.news[0].id, article().id);
        await c.request('read');
        assert.equal(h.state.requests.length, count);
    }
});

test('configuration and unconfirmed preference saves do not start generation', async t => {
    const h = await worldHarness(); t.after(h.dispose);
    const unavailable = controller(h, async () => false);
    unavailable.activate();
    await assert.rejects(unavailable.request('subscribe', { enabled: true }));
    assert.equal(h.state.writes.length, 0);
    unavailable.runtime.stopBackground();
    const c = controller(h); t.after(() => c.runtime.stopBackground()); c.activate();
    h.state.replace = () => ({ status: 'unconfirmed', observed: null });
    await assert.rejects(c.request('subscribe', { enabled: true }));
    assert.equal(h.state.requests.length, 0);
    assert.equal(h.world.readCurrent().world.subscribed, false);
});

test('switching chat during the subscription preflight cannot save or generate for another chat', async t => {
    const h = await worldHarness(null, { chatIdentity: 'character:0:test-world' }); t.after(h.dispose);
    const config = deferred();
    const c = controller(h, () => config.promise); t.after(() => c.runtime.stopBackground()); c.activate();
    const waiting = c.request('subscribe', { enabled: true });
    h.state.capture.identityKey = 'world:two';
    h.state.chatIdentity = 'character:1:other-world';
    c.runtime.handleChatChanged();
    await h.world.refreshCurrent();
    config.resolve(true);
    await assert.rejects(waiting);
    assert.equal(h.state.writes.length, 0);
    assert.equal(h.state.requests.length, 0);
});

test('automatic accepted turns maintain subscribed worlds; explicit refresh also works while unsubscribed', async t => {
    const h = await worldHarness(); t.after(h.dispose);
    let calls = 0;
    h.state.generate = async () => ++calls % 2 === 1
        ? { toolCalls: [{ id: `call-${calls}`, name: 'WorldEdit', arguments: JSON.stringify({ upsert: [article()] }) }] }
        : { text: 'Updated.' };
    h.state.messages.push({ is_user: true, mes: '我推开门。' });
    assert.equal(h.runner.handleMessageSent(1), false);
    const started = h.runner.startRebuild('world');
    assert.equal(started.status, 'started');
    assert.equal((await started.completion).status, 'updated');
    assert.equal(h.world.readCurrent().world.news.length, 1);
    assert.equal(h.world.readCurrent().world.subscribed, false);
    await h.world.setPreference('world:one', 'subscribed', true, () => true);
    h.state.messages.push({ is_user: false, mes: '三天后的清晨，港口恢复通航。' }, { is_user: true, mes: '去码头看看。' });
    h.state.generate = async () => ({ text: 'Still current.' });
    const done = deferred();
    const off = h.runner.subscribeStatus((id, identity, status) => {
        if (id === 'world' && identity === 'world:one' && status.message === 'unchanged') { done.resolve(); }
    });
    t.after(off);
    assert.equal(h.runner.handleMessageSent(3), true);
    await done.promise;
    assert.equal(h.runner.getStatus('world', 'world:one').message, 'unchanged');
});

test('unsubscribe/re-subscribe invalidates the old candidate, including its delayed provider response', async t => {
    const h = await worldHarness({ ...createEmptyWorld(), subscribed: true }); t.after(h.dispose);
    const c = controller(h); t.after(() => c.runtime.stopBackground()); c.activate();
    const staged = deferred();
    const final = deferred();
    let round = 0;
    h.state.generate = async () => {
        if (++round === 1) { return { toolCalls: [{ id: 'old', name: 'WorldEdit', arguments: JSON.stringify({ upsert: [article('old-run')] }) }] }; }
        staged.resolve();
        return final.promise;
    };
    const run = h.runner.startRebuild('world');
    await staged.promise;
    await c.request('subscribe', { enabled: false });
    // Re-enable before the stale response arrives. Tokens, not the boolean, enforce invalidation.
    await h.world.setPreference('world:one', 'subscribed', true, () => true);
    final.resolve({ text: 'Done.' });
    assert.equal((await run.completion).status, 'cancelled');
    assert.equal(h.world.readCurrent().world.news.length, 0);
});

test('leaving the page preserves maintenance; closing the window or disabling the OS cancels uncommitted work', async t => {
    const h = await worldHarness(); t.after(h.dispose);
    const c = controller(h); t.after(() => c.runtime.stopBackground()); c.activate();
    for (const boundary of ['window', 'disabled']) {
        const staged = deferred(); const finish = deferred();
        let round = 0;
        h.state.generate = async () => {
            if (++round === 1) {
                return { toolCalls: [{ id: boundary, name: 'WorldEdit', arguments: JSON.stringify({ upsert: [article(boundary)] }) }] };
            }
            staged.resolve();
            return finish.promise;
        };
        const run = h.runner.startRebuild('world'); await staged.promise;
        c.runtime.cancelForeground('app-changed');
        assert.equal(h.runner.getStatus('world', 'world:one').state, 'running');
        if (boundary === 'window') { c.runtime.handleWindowClosed('frame-close'); }
        else { c.runtime.cancelAll('os-disabled'); }
        finish.resolve({ text: 'Updated.' });
        assert.equal((await run.completion).status, 'cancelled');
        assert.equal(h.world.readCurrent().world.news.length, 0);
    }
});

test('world prompt captures confirmed content once and cleans generation, preference and lifecycle boundaries', async t => {
    const initial = { ...createEmptyWorld(), news: [article()] };
    const h = await worldHarness(initial, { chatIdentity: 'character:0:test-world' }); t.after(h.dispose);
    let events; let prompt = ''; let unsubscribed = 0;
    const runtime = createWorldPromptRuntime({ world: h.world, getChatIdentity: h.getChatIdentity,
        setPrompt: value => { prompt = value; }, subscribe: handlers => { events = handlers; return () => { unsubscribed++; }; } });
    runtime.startBackground(); runtime.startBackground();
    events.generationStarted(); assert.equal(prompt, '');
    events.intercept(); const snapshot = prompt;
    assert.equal(snapshot, buildWorldStoryPrompt(initial));
    const session = await h.session();
    await session.executeTool('WorldEdit', { upsert: [article('future')] });
    await session.commit(() => true);
    assert.equal(prompt, snapshot);
    events.requestBuilt(); assert.equal(prompt, '');
    events.intercept(); assert.equal(prompt, buildWorldStoryPrompt(h.world.readCurrent().world));
    await h.world.setPreference('world:one', 'injectToStory', false, () => true);
    assert.equal(prompt, '');
    await h.world.setPreference('world:one', 'injectToStory', true, () => true);
    events.intercept(); events.generationStopped(); assert.equal(prompt, '');
    events.intercept(); events.generationEnded(); assert.equal(prompt, '');
    events.intercept(); runtime.handleChatChanged(); assert.equal(prompt, '');
    const originalCapture = structuredClone(h.state.capture);
    h.state.capture = { identityKey: 'world:two', binding: { ...originalCapture.binding, chatId: 'other' }, reference: null };
    h.state.chatIdentity = 'character:0:other';
    events.intercept(); assert.equal(prompt, '');
    await h.world.refreshCurrent();
    events.intercept(); assert.equal(prompt, '');
    h.state.capture = originalCapture;
    h.state.chatIdentity = 'character:0:test-world';
    events.intercept(); runtime.cancelAll('os-disabled'); assert.equal(prompt, '');
    runtime.stopBackground(); assert.equal(unsubscribed, 1);
    assert.equal(prompt, '');
    assert.equal(h.state.requests.length, 0);
});

test('unconfirmed publication is absent from a new main-generation snapshot', async t => {
    const initial = { ...createEmptyWorld(), news: [article()] };
    const h = await worldHarness(initial); t.after(h.dispose);
    h.state.replace = () => ({ status: 'unconfirmed', observed: null });
    await assert.rejects(h.world.replaceContent('world:one', worldContent(initial), { overview: 'future', news: [] }, () => true));
    let events; let prompt = '';
    const runtime = createWorldPromptRuntime({ world: h.world, getChatIdentity: () => 'world:one', setPrompt: v => { prompt = v; },
        subscribe: handlers => { events = handlers; return () => {}; } });
    runtime.startBackground(); events.intercept();
    assert.equal(prompt, buildWorldStoryPrompt(initial));
    runtime.stopBackground();
});

test('an unfinished World run cannot publish intermediate removals', async t => {
    for (const reason of ['provider-failed', 'empty-provider-response', 'round-limit', 'tool-errors-unresolved']) {
        await t.test(reason, async t => {
            const initial = { ...createEmptyWorld(), overview: '港城近况', news: [article()] };
            const h = await worldHarness(initial); t.after(h.dispose);
            let round = 0;
            h.state.generate = async () => {
                if (++round === 1) {
                    return { toolCalls: [{ id: 'retire', name: 'WorldEdit', arguments: JSON.stringify({ overview: '', remove: ['canal'] }) }] };
                }
                if (reason === 'provider-failed') { throw new Error('connection lost'); }
                if (reason === 'empty-provider-response') { return { text: '' }; }
                if (reason === 'round-limit') { return { toolCalls: [{ id: `read-${round}`, name: 'WorldRead', arguments: '{}' }] }; }
                return round === 2
                    ? { toolCalls: [{ id: 'bad-replacement', name: 'WorldEdit', arguments: '{' }] }
                    : { text: 'Finished.' };
            };
            const outcome = await h.runner.startRebuild('world').completion;
            assert.equal(outcome.status, 'failed');
            assert.equal(h.runner.getStatus('world', 'world:one').reason, reason);
            assert.deepEqual(outcome.committedParticipantIds, []);
            assert.deepEqual(h.world.readCurrent().world, initial);
            assert.deepEqual(h.state.persisted.partitions.world, initial);
            assert.equal(h.state.writes.length, 0);
        });
    }
});

test('confirming a subscription resumes its first update once; confirming content or background does not generate', async t => {
    for (const kind of ['subscription', 'publication', 'background']) {
        await t.test(kind, async t => {
            const initial = { ...createEmptyWorld(), subscribed: kind === 'publication', news: kind === 'subscription' ? [] : [article()] };
            const h = await worldHarness(initial); t.after(h.dispose);
            const c = controller(h); t.after(() => c.runtime.stopBackground()); c.activate();
            h.state.replace = () => ({ status: 'unconfirmed', observed: null });
            if (kind === 'publication') {
                await assert.rejects(h.world.replaceContent('world:one', worldContent(initial), { overview: '新版', news: [] }, () => true));
            } else {
                await assert.rejects(c.request(kind === 'subscription' ? 'subscribe' : 'background', { enabled: kind === 'subscription' }));
            }
            // A still-unconfirmed retry must not start a provider request.
            await c.request('confirm-save');
            assert.equal(h.state.requests.length, 0);
            h.state.replace = null;
            await c.request('confirm-save'); await tick();
            assert.equal(h.world.readCurrent().writeState, 'ready');
            assert.equal(h.state.requests.length, kind === 'subscription' ? 1 : 0);
            await c.request('confirm-save'); await c.request('read'); await tick();
            assert.equal(h.state.requests.length, kind === 'subscription' ? 1 : 0);
        });
    }
});

test('subscription confirmation after a chat switch cannot start an update in the new chat', async t => {
    const h = await worldHarness(createEmptyWorld()); t.after(h.dispose);
    const c = controller(h); t.after(() => c.runtime.stopBackground()); c.activate();
    h.state.replace = () => ({ status: 'unconfirmed', observed: null });
    await assert.rejects(c.request('subscribe', { enabled: true }));
    const saving = deferred(); const finish = deferred();
    h.state.replace = async input => {
        saving.resolve(); await finish.promise;
        h.state.persisted = structuredClone(input.candidate);
        return { status: 'confirmed' };
    };
    const confirmation = assert.rejects(c.request('confirm-save'));
    await saving.promise;
    h.state.capture.identityKey = 'world:two';
    c.runtime.handleChatChanged();
    finish.resolve(); await confirmation;
    assert.equal(h.state.requests.length, 0);
});
