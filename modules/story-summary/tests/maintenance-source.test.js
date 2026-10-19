import assert from 'node:assert/strict';
import test from 'node:test';
import { createMemorySession } from '../maintenance/session.js';
import { runMemoryAgent } from '../maintenance/runner.js';
import { createSummaryBaseline } from '../data/summary-history.js';
import { maintenanceFixture } from './fixtures/memory-maintenance.js';

// The Agent repairs stale L2 against live source. Source changes must neither stop
// the run nor expand its boundary; memory ownership still protects actual writes.
function fixture() {
    const current = maintenanceFixture();
    current.store = { json: current.json, lastSummarizedMesId: current.cutoff,
        summaryHistory: [createSummaryBaseline(current.cutoff)] };
    const session = createMemorySession(current);
    session.initial();
    return { current, session };
}
const edit = { collection: 'facts', key: 'f-1', patch: { o: '只是传闻，未查证' } };

for (const replacement of [false, true]) test(`source tools read edits without requiring unchanged source (array replaced: ${replacement})`, () => {
    const { session, current } = fixture();
    const old = session.runTool('ReadSource', { floor: 2 }, current).items[0].text;
    if (replacement) current.chat = structuredClone(current.chat);
    current.chat[1].mes = '目前已确认是另一原因。';
    current.chat.push({ mes: '目前已确认但这是边界以后的剧情。', is_user: false });
    assert.notEqual(session.runTool('ReadSource', { floor: 2 }, current).items[0].text, old);
    assert.equal(session.runTool('ReadSource', { floor: 2 }, current).items[0].text, current.chat[1].mes);
    assert.deepEqual(session.runTool('SearchSource', { query: '目前已确认' }, current).hits.map(hit => hit.floor), [2]);
    assert.throws(() => session.runTool('ReadSource', { floor: 25 }, current), { code: 'source_boundary' });
    assert.equal(session.runTool('ReadMemory', { collection: 'facts', key: 'f-1' }, current).items.length, 1);
    assert.equal(session.task().cutoff, 24);
    assert.deepEqual(session.task().completed, []);
});

test('deleted source is a tool-level missing floor, not a refusal to maintain unchanged L2', () => {
    const current = maintenanceFixture();
    current.chat.length = 2;
    const session = createMemorySession(current); session.initial();
    assert.equal(session.runTool('ReadSource', { floor: 2 }, current).items.length, 1);
    assert.throws(() => session.runTool('ReadSource', { floor: 3 }, current), { code: 'source_missing' });
    assert.equal(session.runTool('SearchSource', { query: '夏实' }, current).next, null);
    assert.equal(session.runTool('ReadMemory', { collection: 'facts' }, current).items.length, 5);
});

test('a failed source range does not claim earlier pages were supplied to the Agent', () => {
    const { session, current } = fixture();
    current.chat = current.chat.slice(0, 2);
    assert.throws(() => session.runTool('ReadSource', { floor: 1, to: 3 }, current), { code: 'source_missing' });
    session.inputProvided();
    assert.deepEqual(session.coverage().supplied, []);
    const result = session.runTool('ReadSource', { floor: 1, to: 2 }, current);
    session.inputProvided();
    assert.deepEqual(session.coverage().supplied.map(range => range.floor), result.items.map(item => item.floor));
});

test('source range pagination preserves its fixed boundary and filtering', () => {
    const current = maintenanceFixture();
    current.chat[1].mes = 'a'.repeat(11000);
    const session = createMemorySession(current); session.initial();
    const first = session.runTool('ReadSource', { floor: 2, to: 3 });
    assert.equal(first.items.length, 1);
    assert.equal(first.items[0].text.length, 10000);
    const second = session.runTool('ReadSource', first.next);
    assert.equal(second.items.length, 2);
    assert.equal(first.items[0].text + second.items[0].text, current.chat[1].mes);
    assert.equal(second.items[1].text, current.chat[2].mes);
    assert.equal(second.next, null);
    session.inputProvided();
    assert.deepEqual(session.coverage().supplied.map(range => [range.floor, range.start, range.end]), [
        [2, 0, 10000], [2, 10000, 11000], [3, 0, current.chat[2].mes.length],
    ]);
});

for (const action of ['edit', 'completion']) test(`source edits after reads do not reject ${action} against unchanged memories`, () => {
    const { session, current } = fixture();
    session.runTool('ReadSource', { floor: 2 }, current);
    current.chat[1].mes += ' 后来修改的原文。';
    current.chat[20].mes += ' 尚未读取的原文也有修改。';
    current.chat.push({ mes: '新的尾楼', is_user: false });
    if (action === 'edit') session.runTool('EditMemory', { edits: [edit] });
    else session.runTool('CompleteMaintenance', { from: 1, to: 24 });
    const result = session.assertCurrent(current);
    assert.equal(result.json.facts[0].o, action === 'edit' ? edit.patch.o : current.json.facts[0].o);
    assert.deepEqual(session.task().completed, []); // Staging is not confirmed completion.
});

for (const action of ['edit', 'completion']) test(`actual target memory removal still rejects ${action} without terminating the whole run`, () => {
    const { session, current } = fixture();
    current.json = structuredClone(current.json);
    current.json.facts = current.json.facts.filter(fact => fact.id !== edit.key);
    if (action === 'edit') session.runTool('EditMemory', { edits: [edit] });
    else session.runTool('CompleteMaintenance', { from: 1, to: 24 });
    assert.throws(() => session.assertCurrent(current), error => {
        assert.equal(error.code, 'memory_updated');
        assert.ok(error.records.some(record => record.collection === 'facts' && record.key === edit.key));
        return true;
    });
    session.discard();
    assert.equal(session.runTool('ReadSource', { floor: 2 }, current).items.length, 1);
});

test('completion cannot silently include an anchor removed during maintenance', () => {
    const { session, current } = fixture();
    current.atoms = current.atoms.slice(1);
    session.runTool('CompleteMaintenance', { from: 1, to: 24 });
    assert.throws(() => session.assertCurrent(current), error => {
        assert.equal(error.code, 'memory_updated');
        assert.deepEqual(error.records, [{ collection: 'anchors', key: 'atom-1-0' }]);
        return true;
    });
});

for (const change of ['chat', 'history']) test(`source refresh cannot cross a changed ${change}`, () => {
    const { session, current } = fixture();
    if (change === 'chat') current.chatId = 'another-chat';
    else current.store.summaryHistory = [createSummaryBaseline(19)];
    assert.throws(() => session.runTool('ReadSource', { floor: 2 }, current), { code: 'conflict' });
    assert.throws(() => session.runTool('SearchSource', { query: '夏实' }, current), { code: 'conflict' });
});

const toolCall = (id, name, args) => ({ id, name, arguments: JSON.stringify(args) });
const config = { provider: 'openai-compatible', model: 'offline-fixture', maxTokens: 32000 };
const countTokens = async () => ({ tokens: 100, source: 'fixture' });

test('continuous runner refreshes source for each tool and a normal reply ends without inventing completion', async () => {
    const { session, current } = fixture();
    let calls = 0, reads = 0;
    const seen = [];
    const result = await runMemoryAgent(session, { config, countTokens,
        readCurrent: async () => {
            reads++;
            current.chat = structuredClone(current.chat);
            current.chat[1].mes = `新的原文 ${reads}`;
            return current;
        },
        onCall: ({ tools }) => seen.push(...tools),
        adapter: { chat: async () => {
            calls++;
            if (calls === 1) return { toolCalls: [toolCall('read', 'ReadSource', { floor: 2 })] };
            if (calls === 2) return { toolCalls: [toolCall('search', 'SearchSource', { query: '新的原文' })] };
            return { text: '尚有未解决内容。' };
        } },
    });
    assert.equal(result.status, 'partial');
    assert.equal(calls, 3);
    assert.equal(reads, 2);
    assert.equal(seen[0].response.items[0].text, '新的原文 1');
    assert.equal(seen[1].response.hits[0].excerpt, '新的原文 2');
    assert.deepEqual(result.ranges.pending, [{ from: 1, to: 24 }]);
    assert.deepEqual(result.ranges.completed, []);
});

test('a missing source floor is returned to the Agent and other source reads can continue', async () => {
    const { session, current } = fixture();
    let calls = 0;
    const seen = [];
    const result = await runMemoryAgent(session, { config, countTokens,
        readCurrent: async () => { current.chat = current.chat.slice(0, 2); return current; },
        onCall: ({ tools }) => seen.push(...tools),
        adapter: { chat: async () => ++calls === 1 ? { toolCalls: [
            toolCall('missing', 'ReadSource', { floor: 3 }), toolCall('available', 'ReadSource', { floor: 2 }),
        ] } : { text: '缺失的原文无法核对。' } },
    });
    assert.equal(result.status, 'partial');
    assert.equal(seen[0].response.code, 'source_missing');
    assert.equal(seen[1].response.items[0].floor, 2);
    assert.equal(calls, 2);
});
