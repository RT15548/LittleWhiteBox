import assert from 'node:assert/strict';
import test from 'node:test';
import { newJourney } from '../apps/game/island/world.ts';
import { operate } from '../apps/game/island/operations.ts';
import { openScene } from '../apps/game/island/scene.ts';
import { LANDSCAPE } from '../apps/game/island/content.ts';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { chunks, readChunk, readExperience, browse, recall, memoryScope } from '../apps/game/island/memory.ts';

function source() {
    let w = newJourney('memory-run');
    for (const [i, id] of PERSON_IDS.entries()) w.people[id].position = { x: -700 + i * 100, y: 0 };
    w.people.lin.position = { x: -699, y: 0 };
    w = operate(w, { kind: 'player' }, 'player', { kind: 'say', text: '私人的第一句🌴' }, LANDSCAPE);
    w.people.lin.position = { x: -400, y: 0 }; w.people.zhou.position = { x: -699, y: 0 };
    w = operate(w, { kind: 'player' }, 'player', { kind: 'say', text: '给另一人的第二句' }, LANDSCAPE);
    return w;
}

test('source chunks preserve original boundaries, do not split a surrogate pair and cannot grant knowledge with altered metadata', () => {
    const w = source(), parts = chunks(w, 1);
    for (const sequence of [1, 2]) {
        const relevant = parts.filter(c => c.sequence === sequence), readers = sequence === 1 ? ['lin'] : ['zhou'];
        assert.equal(relevant.map(c => readChunk(w, readers, c).text).join(''), w.experiences[sequence - 1].payload.text);
        assert.ok(relevant.every(c => c.audience.length === 2));
    }
    const hidden = { ...parts[0], audience: ['zhou'] };
    assert.throws(() => readChunk(w, ['zhou'], hidden), { code: 'island_memory_unavailable' });
});

test('semantic ranking filters knowledge before taking top hits and includes old places', () => {
    const w = source(), parts = chunks(w, 100);
    const index = { space: 'model-a', dimensions: 2, entries: parts.map((c, i) => ({ chunk: c.id, digest: c.digest, vector: i ? [0.5, 0.5] : [1, 0] })) };
    const result = recall(w, ['zhou'], parts, index, { space: 'model-a', vector: [1, 0] }, 1);
    assert.equal(result.complete, true); assert.equal(result.hits.length, 1);
    assert.equal(result.hits[0].source, 2);
    const elsewhere = recall(w, ['lin'], parts, index, { space: 'model-a', vector: [1, 0] }, 1);
    assert.equal(elsewhere.hits[0].source, 1);
});

test('index coverage and source changes are explicit; neither missing embeddings nor changed space become an empty successful recall', () => {
    const w = source(), parts = chunks(w, 100);
    const index = { space: 'model-a', dimensions: 2, entries: [{ chunk: parts[0].id, digest: parts[0].digest, vector: [1, 0] }] };
    const gap = recall(w, ['zhou'], parts, index, { space: 'model-a', vector: [1, 0] }, 10);
    assert.equal(gap.complete, false); assert.deepEqual(gap.missing, [parts[1].id]);
    w.experiences[0].payload.text = '来源有变';
    const changed = recall(w, ['lin'], parts, index, { space: 'model-a', vector: [1, 0] }, 10);
    assert.equal(changed.complete, false); assert.equal(changed.hits.length, 0);
    assert.throws(() => recall(w, ['lin'], parts, index, { space: 'model-b', vector: [1, 0] }, 10), { code: 'island_vector_space' });
    assert.throws(() => recall(w, ['lin'], parts, index, { space: 'model-a', vector: [1] }, 10), { code: 'island_vector_space' });
});

test('direct source IDs and pagination use the same knowledge boundary, and the player is not in the GM union', () => {
    const w = source(), scope = openScene(w, 'player', LANDSCAPE);
    assert.deepEqual(memoryScope(scope), ['zhou']);
    assert.throws(() => readExperience(w, memoryScope(scope), 1), { code: 'island_memory_unavailable' });
    assert.deepEqual(browse(w, ['zhou'], 0, 1).entries.map(e => e.sequence), [2]);
    assert.equal(browse(w, ['zhou'], 0, 1).next, null);
    const page = browse(w, ['player'], 0, 1);
    assert.equal(page.next, 1);
    assert.deepEqual(browse(w, ['player'], page.next, 1).entries.map(e => e.sequence), [2]);
});
