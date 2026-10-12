import assert from 'node:assert/strict';
import test from 'node:test';
import { createClassroomFixture } from './fixtures/learning-classroom.js';
import { createLearningResearch, createLearningResearchCache } from '../apps/learning/materials/research.js';
import { createLearningSourceRegistry } from '../apps/learning/materials/lesson-sources.js';
import { createLearningSession } from '../apps/learning/agent/session.js';
import { learningMessageView } from '../apps/learning/application/message-view.js';

const config = { tavilyApiKey: 'offline-fixture', tavilyBaseUrl: 'https://fixture.invalid' };

test('extraction returns actual short text for teacher judgement and reuses the same retrieved source', async t => {
    const sources = createLearningSourceRegistry(); let requests = 0;
    const text = 'A tree gives shade.';
    t.mock.method(globalThis, 'fetch', async url => {
        requests++;
        return Response.json(url.endsWith('/search')
            ? { results: [{ url: 'https://example.com/article', title: 'Trees', content: 'A search summary' }] }
            : { results: [{ url: 'https://example.com/article', raw_content: text }] });
    });
    const research = createLearningResearch(config, { sources, cache: createLearningResearchCache(), signal: new AbortController().signal });
    const found = await research.executeTool('LearningSearch', { query: 'trees' });
    const args = { candidateIds: [found.results[0].id] };
    const extracted = await research.executeTool('LearningExtract', args);
    assert.equal(extracted.ok, true);
    assert.equal(extracted.results[0].paragraphs[0].text, text);
    assert.deepEqual(await research.executeTool('LearningExtract', args), extracted);
    assert.equal(requests, 2); assert.equal(sources.list().length, 1);
});

test('a short reading article is valid while an invented source reference still fails', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.command('settings', { value: {} });
    const sources = createLearningSourceRegistry();
    sources.add({ id: 'source', url: 'https://example.com/article', title: 'Trees', retrievedAt: '2026-10-02T00:00:00.000Z',
        paragraphs: [{ id: 'p1', text: 'Trees make summer streets cooler.' }] });
    const run = createLearningSession(h.repository, { language: 'en', osId: 'reading-fixture', inputScope: { kind: 'public' },
        action: { kind: 'prepare', unit: 'reading-writing', replaceCurrent: false }, sources });
    const proposal = { title: 'Trees', goal: 'Describe shade.', tier: 'short', kind: 'adapted', text: 'Trees give shade.' };
    assert.equal(run.executeTool('LearningArticle', { ...proposal, sourceId: 'invented' }).ok, false);
    assert.equal(h.profile().unit, null);
    assert.equal(run.executeTool('LearningArticle', { ...proposal, sourceId: 'source' }).ok, true);
    assert.equal((await run.commit(() => true)).status, 'confirmed');
    assert.equal(h.profile().unit.materials[0].paragraphs[0].text, proposal.text);
    assert.equal(h.profile().unit.materials[0].provenance.url, 'https://example.com/article');
});

test('a refused search preserves its status without exposing diagnostics or automatically retrying', async t => {
    let requests = 0;
    t.mock.method(globalThis, 'fetch', async () => { requests++; return new Response('private provider details', { status: 429 }); });
    const research = createLearningResearch(config, { sources: createLearningSourceRegistry(), signal: new AbortController().signal });
    const result = await research.executeTool('LearningSearch', { query: 'trees' });
    assert.deepEqual(result, { ok: false, error: 'learning_search_failed', httpStatus: 429 });
    assert.equal(requests, 1);
    const view = learningMessageView({ role: 'tool', toolName: 'LearningSearch', content: JSON.stringify(result) });
    assert.deepEqual(JSON.parse(view.content), { ok: false, error: 'learning_search_failed', httpStatus: 429 });
});
