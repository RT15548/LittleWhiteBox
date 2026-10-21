import assert from 'node:assert/strict';
import test from 'node:test';
import { createMemorySession } from '../maintenance/session.js';
import { commitMemorySession } from '../maintenance/commit.js';
import { editMemoryBatch, restoreMaintenance } from '../maintenance/domain.js';
import { validateMaintenanceReceipt } from '../maintenance/history.js';
import { createSummaryBaseline, createSummaryBatch } from '../data/summary-history.js';
import { maintenanceFixture } from './fixtures/memory-maintenance.js';

function fixture() {
    const current = maintenanceFixture();
    current.store = { json: current.json, lastSummarizedMesId: current.cutoff,
        summaryHistory: [createSummaryBaseline(current.cutoff)] };
    const session = createMemorySession(current);
    let writes = 0;
    const ports = { read: () => current, async commit(next, _previous, _impact, validate) {
        validate(); writes++;
        current.store = next.storySummary; current.json = next.storySummary.json;
        current.atoms = next.stateAtoms; current.l0Index = next.l0Index;
        return next;
    } };
    return { current, session, ports, get writes() { return writes; } };
}
const edit = (key, o) => ({ kind: 'edit', collection: 'facts', key, patch: { o } });
const readFact = (session, key, current) => session.runTool('ReadMemory', { collection: 'facts', key }, current).items[0].value;
const save = h => commitMemorySession(h.session, { runId: 'staged-task', calls: [], mode: 'auto' }, h.ports);

test('a task stages multiple edits and completions, reads its draft, then commits once with reversible receipts', async () => {
    const h = fixture(), before = structuredClone({ json: h.current.json, atoms: h.current.atoms });
    h.session.initial();
    assert.equal(h.session.runTool('EditMemory', { edits: [edit('f-1', 'first revision')] }, h.current).status, 'staged');
    assert.equal(readFact(h.session, 'f-1', h.current).o, 'first revision');
    h.session.runTool('EditMemory', { edits: [edit('f-1', 'final revision'), edit('f-2', 'independent edit')] }, h.current);
    const completion = h.session.runTool('CompleteMaintenance', { from: 1, to: 12 }, h.current);
    assert.deepEqual(completion.task.completed, [{ from: 1, to: 12 }]);
    h.session.runTool('CompleteMaintenance', { from: 13, to: 24 }, h.current);
    h.session.conclude({ status: 'completed', summary: 'done' });
    assert.equal(h.writes, 0);
    assert.deepEqual({ json: h.current.json, atoms: h.current.atoms }, before);
    assert.equal(h.session.savedCount, 0);
    assert.equal(h.session.stagedCount, 3);
    assert.deepEqual(h.session.task().completed, []);
    assert.deepEqual(h.session.task({ includeStaged: true }).pending, []);
    const saved = await save(h);
    assert.equal(h.writes, 1);
    saved.receipts.forEach(validateMaintenanceReceipt);
    assert.equal(saved.receipt.outcome.status, 'completed');
    assert.deepEqual(saved.ranges.pending, []);
    assert.equal(h.current.json.facts[0].o, 'final revision');
    assert.equal(h.current.json.facts[1].o, 'independent edit');
    assert.deepEqual(restoreMaintenance({ json: h.current.json, atoms: h.current.atoms }, saved.receipts), before);
    h.session.acknowledge(saved); h.session.acknowledge(saved);
    assert.equal(h.session.savedCount, 3);
    assert.equal(h.session.hasPending, false);
});

test('an invalid later edit batch cannot mutate published memory or erase earlier staged work', () => {
    const h = fixture(), before = structuredClone(h.current.json);
    h.session.runTool('EditMemory', { edits: [edit('f-1', 'retained')] }, h.current);
    const result = h.session.runTool('EditMemory', { edits: [edit('f-2', 'must not survive'), edit('missing', 'invalid')] }, h.current);
    assert.equal(result.status, 'needs_fix');
    assert.equal(readFact(h.session, 'f-1').o, 'retained');
    assert.equal(readFact(h.session, 'f-2').o, before.facts[1].o);
    assert.equal(h.session.stagedCount, 1);
    assert.deepEqual(h.current.json, before);
});

test('the final commit rebases unrelated current changes and preserves later anchors', async () => {
    const h = fixture();
    h.session.runTool('EditMemory', { edits: [edit('f-1', 'draft')] }, h.current);
    h.current.json = { ...h.current.json, facts: h.current.json.facts.map(fact => fact.id === 'f-2' ? { ...fact, o: 'external' } : fact) };
    h.current.store = { ...h.current.store, json: h.current.json };
    h.current.atoms = [...h.current.atoms, { ...h.current.atoms[0], atomId: 'later-anchor', floor: h.current.cutoff + 1 }];
    const saved = await save(h);
    assert.equal(saved.current.json.facts[0].o, 'draft');
    assert.equal(saved.current.json.facts[1].o, 'external');
    assert.equal(saved.current.atoms.at(-1).atomId, 'later-anchor');
});

for (const inPlace of [false, true]) test(`target conflict repair preserves independent edits after preceding no-ops (in-place: ${inPlace})`, async () => {
    const h = fixture(); h.session.initial();
    h.session.runTool('EditMemory', { edits: [edit('f-3', h.current.json.facts[2].o), edit('f-1', 'old proposal'), edit('f-2', 'keep')] }, h.current);
    const facts = h.current.json.facts.map(fact => fact.id === 'f-1' ? { ...fact, o: 'external' } : fact);
    if (inPlace) h.current.json.facts.splice(0, h.current.json.facts.length, ...facts);
    else h.current.json = { ...h.current.json, facts };
    h.current.store = { ...h.current.store, json: h.current.json };
    await assert.rejects(save(h), { code: 'memory_updated' });
    assert.equal(h.writes, 0);
    assert.equal(readFact(h.session, 'f-1', h.current).o, 'external');
    assert.throws(() => h.session.assertCurrent(h.current), { code: 'memory_updated' });
    assert.equal(h.session.runTool('EditMemory', { edits: [edit('f-1', 'reviewed correction')] }, h.current).status, 'staged');
    const saved = await save(h);
    assert.equal(saved.current.json.facts[0].o, 'reviewed correction');
    assert.equal(saved.current.json.facts[1].o, 'keep');
});

test('conflict repair removes dependent rename edits but retains independent changes', async () => {
    const h = fixture();
    const original = typeof h.current.json.characters.main[0] === 'string' ? h.current.json.characters.main[0] : h.current.json.characters.main[0].name;
    h.session.runTool('ReadMemory', { collection: 'characters', key: original }, h.current);
    h.session.runTool('EditMemory', { edits: [{ kind: 'edit', collection: 'characters', key: original, patch: { name: 'draft-name' } }, edit('f-1', 'keep')] }, h.current);
    h.session.runTool('EditMemory', { edits: [{ kind: 'edit', collection: 'characters', key: 'draft-name', patch: { name: 'second-draft-name' } }] }, h.current);
    h.current.json = { ...h.current.json, characters: { ...h.current.json.characters, main: h.current.json.characters.main.slice(1) } };
    h.current.store = { ...h.current.store, json: h.current.json };
    await assert.rejects(save(h), { code: 'memory_updated' });
    assert.throws(() => h.session.runTool('ReadMemory', { collection: 'characters', key: original }, h.current), { code: 'record_missing' });
    const removed = h.session.runTool('EditMemory', { edits: [{ kind: 'delete', collection: 'characters', key: original }] }, h.current);
    assert.equal(removed.status, 'unchanged');
    const saved = await save(h);
    assert.equal(saved.current.json.facts[0].o, 'keep');
    assert.equal(saved.current.json.characters.main.some(value => ['draft-name', 'second-draft-name', original].includes(typeof value === 'string' ? value : value.name)), false);
});

test('uncertain persistence retains one prepared result and its receipts for confirmation without another write', async () => {
    const h = fixture();
    h.session.runTool('EditMemory', { edits: [edit('f-1', 'saved but receipt delayed')] }, h.current);
    const commit = h.ports.commit;
    h.ports.commit = async (...args) => { await commit(...args); throw Object.assign(new Error('offline'), { uncertain: true }); };
    let failure;
    const calls = [{ turn: 1, stage: 'tools' }];
    try { await commitMemorySession(h.session, { runId: 'staged-task', calls }, h.ports); } catch (error) { failure = error; }
    calls[0].stage = 'recovery'; calls.push({ turn: 2, stage: 'request' });
    assert.deepEqual(failure.commitResult.receipt.calls, [{ turn: 1, stage: 'tools' }]);
    assert.ok(failure.commitResult);
    assert.deepEqual(failure.receiptIds, failure.commitResult.receipts.map(receipt => receipt.id));
    assert.equal(h.session.savedCount, 0);
    assert.equal(h.session.hasPending, true);
    h.session.acknowledge(failure.commitResult);
    assert.equal(h.session.savedCount, 1);
    assert.equal(h.writes, 1);
});

test('a ten-thousand-record session reads only requested record bodies and bounded opening content', () => {
    const reads = new Map();
    const facts = Array.from({ length: 10000 }, (_, index) => ({ id: `f-${String(index).padStart(5, '0')}`, s: `subject-${index}`, p: 'location',
        get o() { reads.set(index, (reads.get(index) || 0) + 1); return 'large content '.repeat(2000); } }));
    const current = { chatId: 'large', chat: [], json: { facts }, atoms: [], l0Index: { byFloor: {} }, cutoff: 9999,
        store: { summaryHistory: [createSummaryBaseline(9999)], lastSummarizedMesId: 9999 } };
    const session = createMemorySession(current);
    assert.equal(reads.size, 0);
    const opening = session.initial(1000);
    assert.ok(reads.size <= 1);
    assert.equal(opening.memoryDirectory.find(item => item.collection === 'facts').total, 10000);
    const page = session.runTool('ReadMemory', { collection: 'facts', key: 'f-09999' }, current);
    assert.equal(page.items.length, 1);
    assert.equal(page.items[0].key, 'f-09999');
    assert.ok(reads.size <= 2);
});

test('a narrow source read does not inspect the other ten thousand floor bodies', () => {
    let reads = 0;
    const h = fixture();
    h.current.chat = Array.from({ length: 10000 }, () => ({ is_user: false, get mes() { reads++; return 'body'; } }));
    h.session.runTool('ReadSource', { floor: 2 }, h.current);
    assert.equal(reads, 1);
});

test('automatic opening retains pending backlog and preceding continuity without cloning record bodies', () => {
    const h = fixture();
    h.current.cutoff = 8;
    h.current.json = { facts: [2, 5, 8].map(end => ({ id: `f-${end}`, s: `subject-${end}`, p: 'location', o: 'known', _addedAt: end })) };
    h.current.store = { json: h.current.json, lastSummarizedMesId: 8, summaryHistory: [
        createSummaryBatch(-1, 2, { version: 1 }), createSummaryBatch(2, 5, { version: 1 }), createSummaryBatch(5, 8, { version: 1 }),
    ] };
    h.current.store.summaryHistory[0].maintenance.push({ completion: { from: 1, to: 3 } });
    const session = createMemorySession({ ...h.current, start: 6, atoms: [] });
    const opening = session.initial();
    assert.deepEqual(opening.task.pending, [{ from: 4, to: 9 }]);
    assert.deepEqual(opening.task.contextRanges, [{ from: 1, to: 3 }]);
    assert.deepEqual(opening.memory.map(record => record.key), ['f-2', 'f-5', 'f-8']);
});

test('domain edits share untouched branches and do not inspect untouched large values', () => {
    let reads = 0;
    const input = { json: { facts: [{ id: 'target', s: 'a', p: 'location', o: 'old' },
        { id: 'unrelated', s: 'b', p: 'location', get o() { reads++; throw new Error('unrelated body read'); } }],
    events: [], characters: { main: ['a'] } }, atoms: [] };
    const result = editMemoryBatch(input, [edit('target', 'new')], 10);
    assert.equal(reads, 0);
    assert.equal(input.json.facts[0].o, 'old');
    assert.equal(result.memory.json.facts[0].o, 'new');
    assert.equal(result.memory.json.facts[1], input.json.facts[1]);
    assert.equal(result.memory.json.characters, input.json.characters);
    assert.equal(result.memory.atoms, input.atoms);
});

for (const reverse of [false, true]) test(`atomic reference repair validates the final batch (reverse order: ${reverse})`, () => {
    const sample = maintenanceFixture().json.events[0];
    const memory = { json: { events: [{ ...sample, id: 'first', causedBy: [] }, { ...sample, id: 'second', causedBy: ['first'] }] }, atoms: [] };
    const before = structuredClone(memory);
    const commands = [{ kind: 'delete', collection: 'events', key: 'first' },
        { kind: 'edit', collection: 'events', key: 'second', patch: { causedBy: [] } }];
    if (reverse) commands.reverse();
    const result = editMemoryBatch(memory, commands, 23);
    assert.deepEqual(memory, before);
    assert.deepEqual(result.memory.json.events.map(event => [event.id, event.causedBy]), [['second', []]]);
    assert.throws(() => editMemoryBatch(memory, [{ kind: 'delete', collection: 'events', key: 'first' }], 23), { code: 'invalid_reference' });
    assert.deepEqual(memory, before);
});

test('deep valid event references do not overflow the JavaScript call stack', () => {
    const events = Array.from({ length: 10000 }, (_, index) => ({ id: `e-${index}`, causedBy: index < 9999 ? [`e-${index + 1}`] : [] }));
    const memory = { json: { events, facts: [{ id: 'target', s: 'a', p: 'location', o: 'old' }] }, atoms: [] };
    const result = editMemoryBatch(memory, [edit('target', 'new')], 9999);
    assert.equal(result.memory.json.events, events);
    assert.equal(result.memory.json.facts[0].o, 'new');
});

test('completion conflict can be reread and explicitly completed without losing other staged ranges', async () => {
    const h = fixture(); h.session.initial();
    h.session.runTool('CompleteMaintenance', { from: 1, to: 12 });
    h.session.runTool('CompleteMaintenance', { from: 13, to: 24 });
    h.current.json = { ...h.current.json, facts: h.current.json.facts.map(fact => fact.id === 'f-1' ? { ...fact, o: 'external' } : fact) };
    h.current.store = { ...h.current.store, json: h.current.json };
    await assert.rejects(save(h), { code: 'memory_updated' });
    assert.equal(readFact(h.session, 'f-1', h.current).o, 'external');
    assert.equal(h.session.runTool('CompleteMaintenance', { from: 1, to: 24 }, h.current).status, 'unchanged');
    const saved = await save(h);
    assert.deepEqual(saved.ranges.completed, [{ from: 1, to: 24 }]);
});

test('read-only calls stay clean and their returned values cannot mutate published data', () => {
    const h = fixture(), before = structuredClone(h.current.json);
    const value = readFact(h.session, 'f-1', h.current); value.o = 'caller mutation';
    h.session.runTool('ReadSource', { floor: 2 }, h.current);
    assert.equal(h.session.hasPending, false);
    assert.equal(h.session.savedCount, 0);
    assert.deepEqual(h.current.json, before);
});

for (const name of ['EditMemory', 'CompleteMaintenance']) test(`${name} rejects replaced generation history before staging`, () => {
    const h = fixture();
    h.current.store = { ...h.current.store, summaryHistory: [createSummaryBatch(-1, h.current.cutoff, { version: 1 })] };
    assert.throws(() => h.session.runTool(name, name === 'EditMemory' ? { edits: [edit('f-1', 'invalid owner')] } : { from: 1, to: 24 }, h.current), { code: 'conflict' });
    assert.equal(h.session.hasPending, false);
});

// Acceptance: losing the reviewed history cannot silently consume completion or
// outcome-only submissions (cost: false persisted progress).
for (const complete of [false, true]) test(`replaced history rejects final ${complete ? 'completion' : 'outcome-only'} submission`, async () => {
    const h = fixture();
    if (complete) h.session.runTool('CompleteMaintenance', { from: 1, to: 24 }, h.current);
    h.session.conclude({ status: 'completed', summary: 'done' });
    h.current.store = { ...h.current.store, summaryHistory: [createSummaryBatch(-1, h.current.cutoff, { version: 1 })] };
    await assert.rejects(save(h), { code: 'conflict' });
    assert.equal(h.writes, 0);
    assert.deepEqual(h.current.store.summaryHistory[0].maintenance, []);
});

test('completion detects a new record within its claimed range without copying its body at claim time', async () => {
    const h = fixture();
    h.session.runTool('CompleteMaintenance', { from: 1, to: 24 }, h.current);
    h.current.json = { ...h.current.json, facts: [...h.current.json.facts, { id: 'new-fact', s: 'new', p: 'location', o: 'new record' }] };
    h.current.store = { ...h.current.store, json: h.current.json };
    await assert.rejects(save(h), error => error.code === 'memory_updated' && error.records.some(record => record.key === 'new-fact'));
    readFact(h.session, 'new-fact', h.current);
    h.session.runTool('CompleteMaintenance', { from: 1, to: 24 }, h.current);
    const saved = await save(h);
    assert.deepEqual(saved.ranges.pending, []);
});

test('editing a reread conflict also refreshes its staged completion witness', async () => {
    const h = fixture();
    h.session.runTool('EditMemory', { edits: [edit('f-1', 'draft')] }, h.current);
    h.session.runTool('CompleteMaintenance', { from: 1, to: 24 }, h.current);
    h.current.json = { ...h.current.json, facts: h.current.json.facts.map(fact => fact.id === 'f-1' ? { ...fact, o: 'external' } : fact) };
    h.current.store = { ...h.current.store, json: h.current.json };
    await assert.rejects(save(h), { code: 'memory_updated' });
    readFact(h.session, 'f-1', h.current);
    h.session.runTool('EditMemory', { edits: [edit('f-1', 'reviewed')] }, h.current);
    const saved = await save(h);
    assert.equal(saved.current.json.facts[0].o, 'reviewed');
    assert.deepEqual(saved.ranges.pending, []);
});
