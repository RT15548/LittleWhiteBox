import assert from 'node:assert/strict';
import test from 'node:test';
import { createEmptyWorld, WORLD_LIMITS, WORLD_WRITE_LIMITS } from '../domains/world/types.js';
import { parseWorld } from '../domains/world/invariants.js';
import { worldContent } from '../domains/world/projection.js';
import { buildWorldStoryPrompt, MAX_WORLD_STORY_MESSAGE_CHARS } from '../apps/world/host/story-projection.js';
import { buildWorldDataMessage, MAX_WORLD_DATA_MESSAGE_CHARS } from '../apps/world/prompt-data.js';
import { escapePromptData } from '../capabilities/maintenance/prompt-safety.js';
import { copyWorldBranch } from '../apps/world/host/branch-copy.js';
import { createWorldManagementTools } from '../apps/world/management/tool-contract.js';
import { article, worldHarness } from './world-harness.js';

test('news reports independent input errors together and one corrected batch saves without changing prior content', async t => {
    const h = await worldHarness(); t.after(h.dispose);
    const session = await h.session();
    const invalid = { overview: 4, upsert: [{ ...article('one'), title: '' }, { ...article('two'), body: false }] };
    const failed = await session.executeTool('WorldEdit', invalid);
    assert.deepEqual(failed.errors.map(issue => issue.path), ['WorldEdit.overview', 'WorldEdit.upsert[0].title', 'WorldEdit.upsert[1].body']);
    assert.deepEqual(await session.executeTool('WorldRead', {}), { overview: '', news: [] });
    const fixed = { overview: '初夏港城。', upsert: [article('one'), article('two')] };
    assert.equal((await session.executeTool('WorldEdit', fixed)).ok, true);
    await session.commit(() => true);
    assert.deepEqual(h.state.persisted.partitions.world.news, fixed.upsert);
});

test('administrator document fields cannot leak into the maintenance news contract', async t => {
    const h = await worldHarness(); t.after(h.dispose);
    createWorldManagementTools();
    const session = await h.session();
    const schema = session.tools.find(tool => tool.function.name === 'WorldEdit').function.parameters;
    assert.equal(Object.hasOwn(schema.properties, 'patches'), false);
    assert.equal((await session.executeTool('WorldEdit', { patches: [] })).ok, false);
    assert.equal((await session.executeTool('WorldEdit', { upsert: [article()] })).ok, true);
});

test('world tools create, continue, retain and retire articles through the real partition store', async t => {
    const h = await worldHarness(); t.after(h.dispose);
    const session = await h.session();
    const schema = session.tools.find(tool => tool.function.name === 'WorldEdit').function.parameters.properties.upsert.items;
    assert.deepEqual(Object.keys(schema.properties).sort(), Object.keys(article()).sort());
    assert.deepEqual([...schema.required].sort(), Object.keys(article()).sort());
    assert.equal(schema.additionalProperties, false);
    assert.equal(schema.properties.body.maxLength, WORLD_WRITE_LIMITS.body);
    assert.deepEqual(await session.executeTool('WorldRead', {}), { overview: '', news: [] });
    const first = { overview: '港城在初夏恢复热闹。', upsert: [article(), article('market')] };
    assert.equal((await session.executeTool('WorldEdit', first)).status, 'updated');
    assert.equal(h.world.readCurrent().world.news.length, 0);
    await session.commit(() => true);
    assert.deepEqual(h.state.persisted.partitions.world.news, first.upsert);

    const next = await h.session('rebuild');
    const read = await next.executeTool('WorldRead', {});
    assert.deepEqual(JSON.parse(next.dataMessages[0].content.split('\n')[2]), read);
    assert.equal(read.news.length, 2); // Explicit refresh does not clear the edition.
    const continued = { ...article(), body: '周末市集如期开放。' };
    assert.equal((await next.executeTool('WorldEdit', { upsert: [continued, article('ferry')] })).status, 'updated');
    assert.deepEqual((await next.executeTool('WorldRead', {})).news.map(item => item.id), ['ferry', 'canal', 'market']);
    assert.equal((await next.executeTool('WorldEdit', { remove: ['market'] })).status, 'updated');
    await next.commit(() => true);
    const stored = (await h.world.refreshCurrent()).world;
    assert.deepEqual(stored.news, [article('ferry'), continued]);
    assert.equal(stored.overview, first.overview);
    const unchanged = await h.session();
    assert.equal((await unchanged.executeTool('WorldEdit', { remove: ['missing'] })).status, 'unchanged');
    assert.equal(unchanged.canCommit(), false);
});

test('related edits are atomic and an unrelated successful edit cannot hide an unresolved failure', async t => {
    const h = await worldHarness({ ...createEmptyWorld(), news: [article()] }); t.after(h.dispose);
    const session = await h.session();
    const result = await session.executeTool('WorldEdit', { remove: ['canal'], upsert: [{ ...article('new'), body: '' }] });
    assert.equal(result.ok, false);
    assert.equal(result.errors[0].path, 'WorldEdit.upsert[0].body');
    assert.deepEqual(result.data.news, [article()]);
    const unrelated = await session.executeTool('WorldEdit', { overview: '港城新貌' });
    assert.equal(unrelated.ok, true);
    assert.equal(unrelated.errors.length, 2); // The model can see why saving is still blocked.
    await session.executeTool('WorldRead', {});
    await session.executeTool('WorldEdit', {});
    assert.equal(session.canCommit(), false);
    await assert.rejects(session.commit(() => true));
    await session.executeTool('WorldEdit', { remove: ['canal'], upsert: [article('new')] });
    assert.equal(session.canCommit(), true);
    await session.commit(() => true);
    assert.deepEqual(h.world.readCurrent().world.news, [article('new')]);
});

test('empty IDs and malformed calls remain correctable without trapping the session', async t => {
    const h = await worldHarness(); t.after(h.dispose);
    const session = await h.session();
    assert.equal((await session.executeTool('WorldEdit', { upsert: [article('')] })).ok, false);
    assert.equal((await session.executeTool('WorldEdit', { upsert: [article()] })).ok, true);
    assert.equal(session.canCommit(), true);
});

test('world validates code-point limits, duplicate IDs and user-owned preferences', async t => {
    const h = await worldHarness(); t.after(h.dispose);
    for (const input of [
        { subscribed: true }, { overview: null }, { upsert: [article(), article()] },
        { upsert: [article()], remove: ['canal'] },
        { upsert: Array.from({ length: 9 }, (_, i) => article(String(i))) },
        { upsert: [{ ...article(), title: '😀'.repeat(65) }] },
        { upsert: [{ ...article(), body: '😀'.repeat(WORLD_WRITE_LIMITS.body + 1) }] },
        { upsert: [{ ...article(), summary: 'redundant content' }] },
        { upsert: [{ ...article(), arbitrary: 'field' }] },
    ]) {
        const session = await h.session();
        const result = await session.executeTool('WorldEdit', input);
        assert.equal(result.ok, false, JSON.stringify(input));
        assert.equal(session.canCommit(), false);
        assert.equal(h.state.writes.length, 0);
    }
    const session = await h.session();
    const result = await session.executeTool('WorldEdit', { upsert: Array.from({ length: 8 }, (_, i) => ({
        ...article(String(i)), title: '😀'.repeat(64), body: '文'.repeat(WORLD_WRITE_LIMITS.body),
    })), overview: '世'.repeat(320) });
    assert.equal(result.ok, true);
    await session.commit(() => true);
    assert.ok([...buildWorldDataMessage(h.world.readCurrent().world)].length <= MAX_WORLD_DATA_MESSAGE_CHARS);
    assert.ok([...buildWorldStoryPrompt(h.world.readCurrent().world)].length <= MAX_WORLD_STORY_MESSAGE_CHARS);
});

test('maximally escaped publication survives tool edits, persistence and reopening; only the initial data omits bodies', async t => {
    const content = { overview: '<'.repeat(WORLD_LIMITS.overview),
        news: Array.from({ length: WORLD_LIMITS.news }, (_, i) => ({
            id: '&'.repeat(WORLD_LIMITS.id - 1) + i, title: '{'.repeat(WORLD_LIMITS.title),
            body: '<'.repeat(WORLD_WRITE_LIMITS.body),
        })),
    };
    const h = await worldHarness(); t.after(h.dispose);
    const session = await h.session();
    assert.equal((await session.executeTool('WorldEdit', { overview: content.overview, upsert: content.news })).ok, true);
    await session.commit(() => true);
    assert.deepEqual(worldContent(h.state.persisted.partitions.world), content);
    const reopened = await worldHarness(h.state.persisted.partitions.world); t.after(reopened.dispose);
    assert.deepEqual(worldContent(reopened.world.readCurrent().world), content);
    const reader = await reopened.session();
    const message = reader.dataMessages[0].content;
    assert.ok([...message].length <= MAX_WORLD_DATA_MESSAGE_CHARS);
    assert.deepEqual(JSON.parse(message.split('\n')[2]), { ...content, news: content.news.map(item => ({ ...item, body: '' })) });
    assert.deepEqual(await reader.executeTool('WorldRead', {}), content);
});

test('story context includes every title and complete body at ordinary-text capacity', () => {
    const world = parseWorld({ ...createEmptyWorld(), overview: '世'.repeat(WORLD_LIMITS.overview),
        news: Array.from({ length: WORLD_LIMITS.news }, (_, i) => ({ id: String(i),
            title: `${i}` + '题'.repeat(WORLD_LIMITS.title - 1), body: '🌲'.repeat(WORLD_LIMITS.body),
        })),
    });
    const prompt = buildWorldStoryPrompt(world);
    assert.ok([...prompt].length <= MAX_WORLD_STORY_MESSAGE_CHARS);
    assert.ok(prompt.includes(world.overview));
    for (const item of world.news) { assert.ok(prompt.includes(`• ${item.title}\n${item.body}`)); }
});

test('body writing limits reject whole batches, count code points and leave stored long articles intact', async t => {
    const saved = { ...article(), body: '文'.repeat(WORLD_LIMITS.body) };
    const initial = { ...createEmptyWorld(), news: [saved] };
    const h = await worldHarness(initial); t.after(h.dispose);
    const first = await h.session();
    const brief = { ...article('new'), body: '😀'.repeat(WORLD_WRITE_LIMITS.body - 2) + '。\n' };
    assert.equal((await first.executeTool('WorldEdit', { overview: '港城的新概况', upsert: [brief] })).ok, true);
    await first.commit(() => true);
    const reopened = await worldHarness(h.state.persisted.partitions.world); t.after(reopened.dispose);
    assert.deepEqual(reopened.world.readCurrent().world.news, [brief, saved]);

    const session = await reopened.session();
    const rejected = await session.executeTool('WorldEdit', { remove: ['new'], upsert: [{ ...saved, body: brief.body + '文' }] });
    assert.equal(rejected.ok, false);
    assert.equal(rejected.errors[0].path, 'WorldEdit.upsert[0].body');
    assert.deepEqual(rejected.data.news, [brief, saved]);
    assert.equal(session.canCommit(), false);
    assert.deepEqual((await session.executeTool('WorldRead', {})).news, [brief, saved]);
    const replacement = { ...saved, body: brief.body };
    assert.equal((await session.executeTool('WorldEdit', { remove: ['new'], upsert: [replacement] })).ok, true);
    await session.commit(() => true);
    assert.deepEqual(reopened.state.persisted.partitions.world.news, [replacement]);
});

test('story budget selects complete safely escaped articles without altering the publication', () => {
    const world = { ...createEmptyWorld(), overview: '"'.repeat(WORLD_LIMITS.overview),
        news: Array.from({ length: WORLD_LIMITS.news }, (_, i) => ({ ...article(String(i)),
            title: `${i}:` + '<'.repeat(WORLD_LIMITS.title - 2), body: '&'.repeat(WORLD_LIMITS.body),
        })),
    };
    const original = structuredClone(world);
    const prompt = buildWorldStoryPrompt(world);
    assert.ok([...prompt].length <= MAX_WORLD_STORY_MESSAGE_CHARS);
    const articles = world.news.map(item => `• ${escapePromptData(item.title)}\n${escapePromptData(item.body)}`);
    const included = prompt.split('\n').filter(line => line.startsWith('• '));
    assert.ok(included.length > 0 && included.length < articles.length);
    assert.deepEqual(included, articles.filter(item => prompt.includes(item)).map(item => item.split('\n')[0]));
    assert.deepEqual(world, original);
});

test('failed batches can abandon new articles or keep existing ones by resubmitting their current values', async t => {
    for (const existing of [false, true]) {
        const initial = { ...createEmptyWorld(), overview: '原概况', news: existing ? [article('b')] : [] };
        const h = await worldHarness(initial); t.after(h.dispose);
        const session = await h.session();
        assert.equal((await session.executeTool('WorldEdit', {
            overview: '不想保留的概况', upsert: [article('a'), { ...article('b'), title: '' }],
        })).ok, false);
        assert.deepEqual(await session.executeTool('WorldRead', {}), worldContent(initial));
        const partial = await session.executeTool('WorldEdit', { upsert: [article('a')] });
        assert.equal(partial.errors.length, 2);
        assert.equal(session.canCommit(), false);
        const current = await session.executeTool('WorldRead', {});
        const corrected = await session.executeTool('WorldEdit', { overview: current.overview,
            ...(existing ? { upsert: [current.news.find(item => item.id === 'b')] } : { remove: ['b'] }),
        });
        assert.equal(corrected.status, 'unchanged');
        assert.deepEqual(corrected.errors, []);
        assert.equal(session.canCommit(), true);
        await session.commit(() => true);
        assert.deepEqual(worldContent(h.state.persisted.partitions.world), {
            overview: initial.overview, news: [article('a'), ...initial.news],
        });
    }
});

test('main story projection escapes titles and bodies and excludes internal IDs', () => {
    const world = { ...createEmptyWorld(), overview: '<setting>{{user}}</setting>',
        news: [{ ...article(), title: '</world_background>', body: '<script>{{char}}&\n\n' + article().body }] };
    const prompt = buildWorldStoryPrompt(world);
    assert.ok(prompt.includes('&lt;script&gt;&#123;&#123;char&#125;&#125;&amp;'));
    assert.ok(prompt.includes('&lt;/world_background&gt;'));
    assert.ok(prompt.includes(article().body));
    assert.ok(!prompt.includes(article().id));
    assert.throws(() => parseWorld({ ...world, version: 2 }));
    assert.throws(() => parseWorld({ ...world, news: [{ ...article(), summary: 'obsolete field' }] }));
    assert.throws(() => parseWorld({ ...world, news: null }));
    assert.equal(buildWorldStoryPrompt(createEmptyWorld()), '');
    assert.equal(buildWorldStoryPrompt(null), '');
});

test('content CAS preserves concurrent preference changes but rejects a stale publication', async t => {
    const h = await worldHarness(); t.after(h.dispose);
    const one = await h.session();
    const stale = await h.session();
    await one.executeTool('WorldEdit', { upsert: [article()] });
    await stale.executeTool('WorldEdit', { upsert: [article('stale')] });
    await h.settings.setWorldPreference('injectToStory', false);
    await one.commit(() => true);
    assert.equal(h.settings.read().apps.world.injectToStory, false);
    await assert.rejects(stale.commit(() => true));
    assert.equal(h.world.readCurrent().world.news[0].id, 'canal');
});

test('failed and unconfirmed saves keep confirmed content; confirmation retries the same candidate', async t => {
    const initial = { ...createEmptyWorld(), news: [article()] };
    const h = await worldHarness(initial); t.after(h.dispose);
    const failed = await h.session();
    await failed.executeTool('WorldEdit', { upsert: [article('later')] });
    h.state.replace = () => ({ status: 'failed', error: { code: 'offline', message: 'offline', retryable: true } });
    await assert.rejects(failed.commit(() => true));
    assert.deepEqual(h.world.readCurrent().world, initial);
    const uncertain = await h.session();
    await uncertain.executeTool('WorldEdit', { upsert: [article('later')] });
    h.state.replace = () => ({ status: 'unconfirmed', observed: null });
    await assert.rejects(uncertain.commit(() => true), error => error.uncertain === true);
    assert.equal(h.world.readCurrent().writeState, 'unconfirmed');
    assert.deepEqual(h.world.readCurrent().world, initial);
    const candidate = h.state.writes.at(-1).candidate;
    h.state.replace = () => ({ status: 'failed', error: { code: 'offline', message: 'offline', retryable: true } });
    assert.equal((await h.world.confirmPending()).status, 'failed');
    assert.equal(h.world.readCurrent().pendingSave, true);
    h.state.replace = null;
    assert.equal((await h.world.confirmPending()).status, 'confirmed');
    assert.equal(h.state.writes.at(-1).candidate.commitId, candidate.commitId);
    assert.deepEqual(worldContent(h.world.readCurrent().world), worldContent(candidate.partitions.world));
});

test('invalidation and chat switches block staged world writes', async t => {
    const h = await worldHarness(); t.after(h.dispose);
    const session = await h.session();
    await session.executeTool('WorldEdit', { upsert: [article()] });
    session.invalidate('unsubscribed');
    assert.equal(session.canCommit(), false);
    await assert.rejects(session.commit(() => true));
    const next = await h.session();
    await next.executeTool('WorldEdit', { upsert: [article()] });
    h.state.capture.identityKey = 'world:other';
    await h.world.refreshCurrent();
    await assert.rejects(next.commit(() => true));
    assert.equal(h.state.writes.length, 0);
});

test('historical branches start without future news; full copies and other partitions remain intact', () => {
    const original = { ...createEmptyWorld(), overview: 'future', news: [article()] };
    const source = { kind: 'group', ownerLocator: 'team', chatId: 'parent' };
    const capture = { identityKey: 'child', binding: { ...source, chatId: 'child' }, mainChatId: 'parent' };
    const partitions = { world: structuredClone(original), map: { untouched: true } };
    copyWorldBranch(capture, source, partitions);
    assert.deepEqual(partitions.world, createEmptyWorld());
    assert.deepEqual(partitions.map, { untouched: true });
    const copy = { world: structuredClone(original) };
    copyWorldBranch({ ...capture, mainChatId: null }, source, copy);
    assert.deepEqual(copy.world, original);
});
