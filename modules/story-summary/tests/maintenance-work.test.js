// Observable contracts: one continuous conversation, confirmed atomic edits and bounded reading.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createMemorySession } from '../maintenance/session.js';
import { runMemoryAgent } from '../maintenance/runner.js';
import { createMemoryScheduler } from '../maintenance/scheduler.js';
import { commitMemorySession } from '../maintenance/commit.js';
import { createSummaryBaseline, createSummaryBatch } from '../data/summary-history.js';
import { buildSummaryUndo, applyExactSummaryHistoryUndo } from '../data/summary-undo.js';
import { restoreMaintenance } from '../maintenance/domain.js';
import { maintenanceFixture, joinedEventPatch } from './fixtures/memory-maintenance.js';
import { maintenanceRanges } from '../maintenance/ranges.js';
import { estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { memoryPolicy } from '../data/memory-policy.js';
import { OPENING_TOKENS } from '../maintenance/limits.js';

const tool = (name, args, id = name) => ({ id, name, arguments: JSON.stringify(args) });
const edit = edits => ({ toolCalls: [tool('EditMemory', { edits })] });
const correction = { kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: '夏实听说可能与看到机密有关，未经证实' } };
function setup(fixture = maintenanceFixture()) {
    let state = structuredClone({ ...fixture, store: fixture.store || { json: fixture.json, lastSummarizedMesId: fixture.cutoff,
        summaryHistory: [createSummaryBaseline(fixture.cutoff)] } });
    const ports = {
        read: () => ({ ...state, cutoff: state.store.lastSummarizedMesId, json: state.store.json }),
        commit: async (next, _previous, _impact, validate) => {
            validate();
            state = { ...state, store: next.storySummary, atoms: next.stateAtoms, l0Index: next.l0Index };
        },
    };
    const save = async result => {
        const saved = await commitMemorySession(result.session, result, ports);
        return saved ? { ...saved, current: structuredClone(ports.read()) } : null;
    };
    return { ports, save, session: createMemorySession(ports.read()) };
}
async function run(env, chat, options = {}) {
    return runMemoryAgent(env.session, { config: {}, adapter: { chat }, readCurrent: env.ports.read, onSave: env.save, onFinish: env.save, ...options });
}

test('a deletion and its reference repair succeed on the first attempt in either order and remain reversible', async () => {
    const remove = { kind: 'delete', collection: 'events', key: 'evt-2' };
    const repair = { collection: 'events', key: 'evt-4', patch: { causedBy: ['evt-1'] } };
    for (const edits of [[remove, repair], [repair, remove]]) {
        const env = setup(), before = structuredClone(env.ports.read());
        let requests = 0;
        const result = await run(env, async request => {
            if (++requests === 1) return edit(edits);
            assert.equal(JSON.parse(request.messages.at(-1).content).status, 'saved');
            return { text: '完成修正。' };
        });
        assert.equal(requests, 2);
        assert.equal(result.saved, 2);
        const after = env.ports.read();
        assert.equal(after.json.events.some(item => item.id === 'evt-2'), false);
        assert.deepEqual(after.json.events.find(item => item.id === 'evt-4').causedBy, ['evt-1']);
        const receipts = after.store.summaryHistory.flatMap(item => item.maintenance || []);
        assert.deepEqual(restoreMaintenance({ json: after.json, atoms: after.atoms }, receipts), { json: before.json, atoms: before.atoms });
    }
});

test('one memory failure reports independent fields and one corrected retry saves without partial writes', async () => {
    for (const supportsSessionToolLoop of [false, true]) {
        const env = setup(), before = structuredClone(env.ports.read().json);
        let requests = 0;
        const chat = async request => {
            if (++requests === 1) return edit([
                { collection: 'facts', key: 'f-1', patch: { o: 3, isState: 'maybe' } },
                { collection: 'events', key: 'evt-3', patch: { title: false } },
            ]);
            const response = supportsSessionToolLoop ? request.toolResponses.at(-1).response : JSON.parse(request.messages.at(-1).content);
            if (requests === 2) {
                assert.equal(response.status, 'needs_fix');
                assert.deepEqual(new Set(response.rejected.map(item => item.field)), new Set(['edits[0].patch.o', 'edits[0].patch.isState', 'edits[1].patch.title']));
                assert.deepEqual(env.ports.read().json, before);
                return edit([correction, { collection: 'events', key: 'evt-3', patch: { title: '青山的船票争吵' } }]);
            }
            assert.equal(response.status, 'saved');
            return { text: '已修正。' };
        };
        const result = await run(env, chat, { adapter: { supportsSessionToolLoop, chat } });
        assert.equal(requests, 3);
        assert.equal(result.saved, 2);
    }
});

function batchFixture(ends, completed = []) {
    const floors = ends.at(-1), history = [];
    const json = { events: [], facts: [], characters: { main: [] }, arcs: [], keywords: [], characterAliases: [] };
    let previous = -1;
    for (const end of ends) {
        const before = structuredClone(json), id = String(end).padStart(5, '0');
        json.events.push({ id: `event-${id}`, title: `Episode ${end}`, summary: `Episode ${end}. (#${end})`,
            timeLabel: '', participants: [], causedBy: [], memoryRole: '具体经历', _addedAt: end - 1 });
        json.facts.push({ id: `fact-${id}`, s: `Person ${end}`, p: '住所', o: `City ${end}`, _addedAt: end - 1 });
        history.push(createSummaryBatch(previous, end - 1, buildSummaryUndo(before, json), memoryPolicy()));
        previous = end - 1;
    }
    history.at(-1).maintenance = completed.map((range, i) => ({ version: 2, id: `completion-${i}`, runId: 'earlier-run',
        policy: memoryPolicy(), cutoff: floors, operations: [], completion: range, coverage: { supplied: [], missingAnchors: [] } }));
    return { chatId: 'batch-selection', cutoff: floors - 1, start: ends.length > 1 ? ends.at(-2) : 0,
        chat: Array.from({ length: floors }, (_, i) => ({ is_user: false, mes: `Story ${i + 1}`, name: 'Narrator' })),
        json, atoms: Array.from({ length: floors }, (_, floor) => ({ atomId: `anchor-${String(floor + 1).padStart(5, '0')}`,
            floor, semantic: `Scene ${floor + 1}`, edges: [], where: '', source: 'ai', quality: 0.8 })), l0Index: {},
        store: { json, lastSummarizedMesId: floors - 1, summaryHistory: history } };
}

function readAllMemory(session, args) {
    const items = [];
    let text = '', next = args;
    do {
        const page = session.runTool('ReadMemory', next);
        for (const item of page.items) {
            if (item.excerpt === undefined) items.push(item);
            else {
                text += item.excerpt;
                if (item.nextTextOffset === null) { items.push(JSON.parse(text)); text = ''; }
            }
        }
        session.inputProvided(); next = page.next;
    } while (next);
    assert.equal(text, '');
    return items;
}

test('one conversation reads, sees results, saves, continues reading and editing, then replies normally', async () => {
    for (const supportsSessionToolLoop of [false, true]) {
        const env = setup(), before = structuredClone(env.ports.read());
        let count = 0, previousMessages = 0;
        const chat = async request => {
            count++;
            assert.equal(request.toolChoice, 'auto');
            assert.ok(request.messages.length > previousMessages);
            previousMessages = request.messages.length;
            if (count === 1) {
                const opening = JSON.parse(request.messages[0].content);
                assert.deepEqual(opening.task.pending, [{ from: 1, to: 24 }]);
                return { toolCalls: [tool('ReadSource', { floor: 2 })] };
            }
            const result = supportsSessionToolLoop ? request.toolResponses.at(-1).response
                : JSON.parse(request.messages.filter(message => message.role === 'tool').at(-1).content);
            if (count === 2) { assert.equal(result.items[0].floor, 2); return edit([correction]); }
            if (count === 3) {
                assert.equal(result.status, 'saved');
                assert.equal(env.ports.read().json.facts[0].o, correction.patch.o);
                return { toolCalls: [tool('ReadMemory', { collection: 'events' })] };
            }
            if (count === 4) {
                assert.equal(result.items.length, 4);
                return edit([{ kind: 'merge', collection: 'events', key: 'evt-2', removeIds: ['evt-1'], patch: joinedEventPatch }]);
            }
            assert.equal(result.status, 'saved');
            return count === 5 ? { toolCalls: [tool('CompleteMaintenance', { from: 1, to: 24 })] }
                : { text: '已修正传闻并续接同一事件。' };
        };
        const result = await runMemoryAgent(env.session, { config: {}, adapter: { supportsSessionToolLoop, chat }, onSave: env.save, onFinish: env.save });
        assert.equal(result.status, 'completed', result.error?.stack);
        assert.equal(result.saved, 2);
        const receipts = env.ports.read().store.summaryHistory[0].maintenance;
        assert.equal(new Set(receipts.map(item => item.runId)).size, 1);
        assert.equal(receipts.at(-1).outcome.status, 'completed');
        assert.deepEqual(restoreMaintenance({ json: env.ports.read().json, atoms: env.ports.read().atoms }, receipts), { json: before.json, atoms: before.atoms });
        assert.deepEqual(env.ports.read().chat, before.chat);
    }
});

test('normal reply needs no edit, while empty edits are non-terminal', async () => {
    for (const emptyFirst of [false, true]) {
        const env = setup();
        let count = 0;
        const result = await run(env, async () => ++count === 1 && emptyFirst ? edit([]) : { text: '没有可确认的错误。' });
        assert.equal(result.status, 'partial');
        assert.equal(result.saved, 0);
        assert.equal(count, emptyFirst ? 2 : 1);
        assert.equal(env.ports.read().store.summaryHistory[0].maintenance.length, 1);
    }
});

test('mixed read and edit execute in order without an extra decision turn', async () => {
    const env = setup(); let count = 0;
    const result = await run(env, async request => {
        if (++count === 1) return { toolCalls: [tool('EditMemory', { edits: [correction] }), tool('ReadSource', { floor: 2 })] };
        if (count === 2) {
            const responses = request.messages.filter(item => item.role === 'tool').map(item => JSON.parse(item.content));
            assert.equal(responses[0].status, 'saved');
            assert.equal(responses[1].items[0].floor, 2);
            assert.equal(env.ports.read().json.facts[0].o, correction.patch.o);
        }
        return { text: '已修正。' };
    });
    assert.equal(result.saved, 1);
});

test('invalid field rejects the entire edit list and is correctable in the same conversation', async () => {
    const env = setup(); let count = 0;
    const result = await run(env, async request => {
        if (++count === 1) return edit([correction, { ...correction, key: 'f-2', patch: { retracted: true } }]);
        if (count === 2) {
            const response = JSON.parse(request.messages.filter(item => item.role === 'tool').at(-1).content);
            assert.equal(response.status, 'needs_fix');
            assert.equal(response.rejected[0].code, 'invalid_field');
            assert.equal(env.ports.read().json.facts[0].o, '看到了机密');
            return edit([correction]);
        }
        return { text: '已修正。' };
    });
    assert.equal(result.saved, 1);
});

test('cancel, transport failure and run limit keep confirmed edits and final status', async () => {
    for (const ending of ['cancelled', 'failed', 'turn_limit']) {
        const env = setup(), controller = new AbortController(); let count = 0;
        const save = async item => { const saved = await env.save(item); if (ending === 'cancelled') controller.abort(); return saved; };
        const result = await run(env, async () => {
            if (++count === 1) return edit([correction]);
            throw new Error('transport failure');
        }, { signal: controller.signal, onSave: save, limits: { turns: ending === 'turn_limit' ? 1 : 256 } });
        assert.equal(result.status, ending);
        assert.equal(result.saved, 1);
        assert.equal(env.ports.read().json.facts[0].o, correction.patch.o);
        assert.equal(env.ports.read().store.summaryHistory[0].maintenance.at(-1).outcome.status, ending);
    }
});

test('uncertain persistence stops immediately without another request or final write', async () => {
    const env = setup(); let calls = 0, finish = 0;
    const result = await run(env, async () => { calls++; return edit([correction]); }, {
        onSave: async () => { throw Object.assign(new Error('uncertain'), { uncertain: true, receiptId: 'unknown' }); },
        onFinish: () => { finish++; },
    });
    assert.equal(result.status, 'unconfirmed');
    assert.equal(calls, 1); assert.equal(finish, 0); assert.equal(result.saved, 0);
});

test('read results count as supplied only if another request receives them; full input limit is enforced', async () => {
    const env = setup(); const initialRanges = 0;
    const result = await run(env, async () => ({ toolCalls: [tool('ReadSource', { floor: 2, view: 'raw' })] }),
        { limits: { turns: 1 } });
    assert.equal(result.status, 'turn_limit');
    assert.equal(env.session.coverage().supplied.length, initialRanges);
    const limited = setup();
    const overflow = await run(limited, () => assert.fail('overflow made API request'), { limits: { turns: 48, inputTokens: 1 } });
    assert.equal(overflow.status, 'input_limit');
    assert.deepEqual(limited.session.coverage().supplied, []);
});

test('1000-floor chat maintenance injects latest state once; old dialogue is paged in the same run', async () => {
    const fixture = maintenanceFixture();
    fixture.chat = Array.from({ length: 1000 }, (_, i) => ({ mes: (i < 900 ? '长沙' : '北京') + '文'.repeat(1498), is_user: i % 2 === 0 }));
    fixture.cutoff = 999; fixture.start = 980; fixture.atoms = [];
    fixture.json.facts = Array.from({ length: 150 }, (_, i) => ({ id: 'f' + i, s: '人物' + i, p: '现居城市', o: '北京', _addedAt: 999 }));
    fixture.json.events = Array.from({ length: 200 }, (_, i) => ({ ...fixture.json.events[0], id: 'e' + i, summary: '旧事 (#1-2)', causedBy: [] }));
    fixture.store = { json: fixture.json, lastSummarizedMesId: 999, summaryHistory: [createSummaryBaseline(979),
        createSummaryBatch(979, 999, buildSummaryUndo(fixture.json, fixture.json))] };
    const env = setup(fixture), opening = env.session.initial();
    assert.equal(opening.task.from, 1);
    assert.deepEqual(opening.task.pending, [{ from: 1, to: 1000 }]);
    assert.equal(opening.memory.filter(item => item.collection === 'facts').length, 150);
    assert.ok(opening.memory.filter(item => item.collection === 'facts').every(item => item.value.o === '北京'));
    let calls = 0;
    const result = await run(env, async request => {
        calls++;
        assert.equal(request.messages.filter(item => item.role === 'user' && JSON.parse(item.content).memory).length, 1);
        return calls === 1 ? { toolCalls: [tool('ReadSource', { floor: 1, to: 20 })] } : { text: '早期住长沙，不据此改回当前城市。' };
    });
    assert.equal(result.status, 'partial'); assert.equal(calls, 2);
    assert.equal(env.ports.read().json.facts[0].o, '北京');
});

test('long memory paginates losslessly, queries use business values, old anchors have unknown standards', () => {
    const fixture = maintenanceFixture(); fixture.json.facts[0].o = '文'.repeat(40000);
    const env = setup(fixture); env.session.initial();
    const pieces = []; let args = { collection: 'facts', key: 'f-1' };
    do {
        const page = env.session.runTool('ReadMemory', args);
        pieces.push(page.items[0].excerpt); args = page.next;
    } while (args);
    assert.equal(JSON.parse(pieces.join('')).value.o, fixture.json.facts[0].o);
    assert.equal(env.session.runTool('ReadMemory', { query: 'f-1' }).total, 0);
    assert.equal(env.session.runTool('ReadMemory', { collection: 'anchors' }).items[0].generatedBy.standard, 'unknown');
});

test('a reply does not claim earlier floors were maintained; dialogue remains readable', async () => {
    const env = setup();
    await run(env, async () => ({ text: '本次没有修改。' }));
    const second = createMemorySession({ ...env.ports.read(), start: 20 });
    assert.ok(second.initial().memory.length);
    assert.deepEqual(second.task().pending, [{ from: 1, to: 24 }]);
    assert.equal(second.runTool('ReadSource', { floor: 21 }).items[0].floor, 21);
});

test('a prior run outcome follows the latest batch without overwriting its state', async () => {
    const env = setup(); env.session.initial();
    const current = env.ports.read();
    current.chat.push({ mes: '又有新剧情' }, { mes: '后来搬到了成都' });
    current.store.summaryHistory.push(createSummaryBatch(23, 25, buildSummaryUndo(current.json, current.json)));
    current.store.lastSummarizedMesId = 25;
    env.session.conclude({ status: 'cancelled', summary: '' });
    const saved = await env.save({ session: env.session, runId: 'old', calls: [] });
    assert.ok(saved);
    assert.equal(env.ports.read().store.lastSummarizedMesId, 25);
    assert.equal(env.ports.read().store.summaryHistory[1].maintenance[0].outcome.status, 'cancelled');
    assert.equal(env.ports.read().store.summaryHistory[0].maintenance.length, 0);
});

test('filtered and hidden source obey the same one-based cutoff, without exposing excluded story as evidence', () => {
    const fixture = maintenanceFixture();
    fixture.chat[1].is_system = true;
    fixture.chat[1].mes = '<think>不是剧情</think>夏实说这是传闻。';
    const session = createMemorySession({ ...fixture, filterRules: [{ start: '<think>', end: '</think>' }] });
    session.initial();
    assert.equal(session.runTool('ReadSource', { floor: 2 }).items[0].text, '夏实说这是传闻。');
    assert.equal(session.runTool('ReadSource', { floor: 2, view: 'raw' }).items[0].text, fixture.chat[1].mes);
    assert.throws(() => session.runTool('ReadSource', { floor: 25 }), { code: 'source_boundary' });
    assert.deepEqual(session.runTool('SearchSource', { query: '不是剧情' }).hits, []);
    assert.throws(() => session.runTool('ReadMemory', { targetsOnly: true }), { code: 'invalid_field' });
});

test('multiple edits save independently, repeated edits are unchanged and unknown tools remain errors', async () => {
    const env = setup(); let turn = 0;
    const result = await run(env, async request => {
        if (++turn === 1) return { toolCalls: [tool('EditMemory', { edits: [correction] }, 'one'),
            tool('EditMemory', { edits: [correction] }, 'two'), tool('MissingTool', {})] };
        const responses = request.messages.filter(item => item.role === 'tool').map(item => JSON.parse(item.content));
        assert.deepEqual(responses.map(item => item.status), ['saved', 'unchanged', 'error']);
        assert.equal(responses[2].code, 'unknown_tool');
        assert.equal(env.ports.read().json.facts[0].o, correction.patch.o);
        return { text: '没有修改。' };
    });
    assert.equal(result.saved, 1);
});

test('an updated old fact belongs to the latest generation, without sending generation diffs', () => {
    const fixture = maintenanceFixture(), before = structuredClone(fixture.json);
    fixture.json.facts[2].o = '北京';
    fixture.store = { json: fixture.json, lastSummarizedMesId: 23,
        summaryHistory: [createSummaryBaseline(19), createSummaryBatch(19, 23, buildSummaryUndo(before, fixture.json))] };
    const env = setup(fixture);
    const opening = env.session.initial();
    const fact = opening.memory.find(item => item.key === 'f-3');
    assert.equal(fact.value.o, '北京');
    assert.deepEqual(fact.maintenanceRange, { from: 21, to: 24 });
    assert.equal(Object.hasOwn(fact.value, '_addedAt'), false);
    assert.throws(() => env.session.runTool('ReadMemory', { view: 'batchChanges' }), { code: 'invalid_field' });
});

test('no-change completion saves once, survives reload, and leaves the remaining range for the next run', async () => {
    const env = setup(); let calls = 0;
    const result = await run(env, async () => ++calls <= 2
        ? { toolCalls: [tool('CompleteMaintenance', { from: 1, to: 12 })] } : { text: '前半已完成。' });
    assert.equal(result.status, 'partial');
    assert.deepEqual(result.ranges.completed, [{ from: 1, to: 12 }]);
    assert.deepEqual(result.ranges.pending, [{ from: 13, to: 24 }]);
    const history = env.ports.read().store.summaryHistory;
    assert.equal(history[0].maintenance.filter(receipt => receipt.completion).length, 1);
    const restarted = createMemorySession(structuredClone(env.ports.read()));
    assert.deepEqual(restarted.initial().task, { ...result.ranges, contextRanges: [] });
    assert.deepEqual(restoreMaintenance(env.session.memory, history[0].maintenance), env.session.memory);
});

test('completion is the agent declaration, not a per-record reading gate', () => {
    const fixture = maintenanceFixture(); fixture.json.facts[0].o = '文'.repeat(50000);
    const env = setup(fixture), session = env.session;
    session.initial(1); session.inputProvided();
    const result = session.runTool('CompleteMaintenance', { from: 1, to: 24 });
    assert.equal(result.status, 'staged');
});

test('stable cursors do not skip memory after deletion', async () => {
    const env = setup(); env.session.initial(1); env.session.inputProvided();
    const page = env.session.runTool('ReadMemory', { collection: 'facts', limit: 1 }); env.session.inputProvided();
    assert.equal(page.items[0].key, 'f-1');
    env.session.runTool('EditMemory', { edits: [{ kind: 'delete', collection: 'facts', key: 'f-1' }] });
    const saved = await env.save({ session: env.session, calls: [], runId: 'cursor' }); env.session.acknowledge(saved.current);
    assert.equal(env.session.runTool('ReadMemory', page.next).items[0].key, 'f-2');
});

test('failed edits block completion even with reads or when completion is listed first', async () => {
    for (const withReads of [true, false]) {
        const env = setup(); let turn = 0;
        const result = await run(env, async request => {
            if (++turn === 1) return { toolCalls: [tool('CompleteMaintenance', { from: 1, to: 24 }),
                tool('EditMemory', { edits: [{ ...correction, patch: { nonexistent: true } }] }),
                ...(withReads ? [tool('ReadMemory', { collection: 'facts' })] : [])] };
            const results = request.messages.filter(item => item.role === 'tool').map(item => JSON.parse(item.content));
            assert.equal(results.at(-1).code, 'edit_failed');
            assert.deepEqual(env.session.task().completed, []);
            return { text: '未完成。' };
        });
        assert.equal(result.status, 'partial'); assert.equal(result.saved, 0);
    }
});

test('completion cannot overwrite changed memory, unread source, new anchors or a different chat', async () => {
    for (const mutation of ['source', 'anchor', 'chat', 'memory']) {
        const env = setup(); env.session.initial(); env.session.inputProvided();
        env.session.runTool('CompleteMaintenance', { from: 1, to: 24 });
        const current = env.ports.read();
        if (mutation === 'source') current.chat[10].mes += ' changed';
        if (mutation === 'anchor') current.atoms.push({ atomId: 'late', floor: 15 });
        if (mutation === 'memory') current.json.facts[0].o = 'manual';
        if (mutation === 'chat') env.ports.read = () => ({ ...current, chatId: 'different' });
        await assert.rejects(env.save({ session: env.session, calls: [], runId: 'conflict' }),
            { code: ['memory', 'anchor'].includes(mutation) ? 'memory_updated' : 'conflict',
                ...(mutation === 'memory' ? { records: [{ collection: 'facts', key: 'f-1' }] } : {}),
                ...(mutation === 'anchor' ? { records: [{ collection: 'anchors', key: 'late' }] } : {}) });
        assert.deepEqual(maintenanceRanges(current.store.summaryHistory, 23).completed, []);
    }
});

test('completion persistence uncertainty never publishes completion or schedules another model call', async () => {
    const env = setup(); let count = 0;
    const result = await run(env, async () => { count++; return { toolCalls: [tool('CompleteMaintenance', { from: 1, to: 24 })] }; }, {
        onSave: async () => { throw Object.assign(new Error('unconfirmed'), { uncertain: true }); },
        onFinish: () => assert.fail('unconfirmed run attempted another save'),
    });
    assert.equal(result.status, 'unconfirmed'); assert.equal(count, 1);
    assert.deepEqual(result.ranges.completed, []);
});

test('more than 48 interactions retain one run and finish with confirmed ranges', async () => {
    const env = setup(); let count = 0;
    const result = await run(env, async () => ++count < 52 ? edit([]) : count === 52
        ? { toolCalls: [tool('CompleteMaintenance', { from: 1, to: 24 })] } : { text: '完成。' });
    assert.equal(count, 53); assert.equal(result.status, 'completed');
    assert.deepEqual(result.ranges.pending, []);
});

test('1000 and 5000-floor openings contain only range task and current memory, not historic conversation or receipts', () => {
    for (const floors of [1000, 5000]) {
        const fixture = maintenanceFixture();
        fixture.chat = Array.from({ length: floors }, () => ({ mes: '正文'.repeat(750) })); fixture.cutoff = floors - 1;
        fixture.json.events = Array.from({ length: 200 }, (_, index) => ({ ...fixture.json.events[0], id: `e${index}` }));
        fixture.json.facts = Array.from({ length: 150 }, (_, index) => ({ ...fixture.json.facts[0], id: `f${index}`, s: `人${index}` }));
        const env = setup(fixture), opening = env.session.initial();
        assert.deepEqual(Object.keys(opening).sort(), ['memory', 'memoryDirectory', 'task']);
        assert.equal(opening.memory.filter(item => item.collection === 'events').length, 200);
        assert.equal(opening.memory.filter(item => item.collection === 'facts').length, 150);
        assert.deepEqual(opening.task.pending, [{ from: 1, to: floors }]);
    }
});

test('multiple token-triggered compactions preserve tool pairs, saved ranges and provider session restarts', async () => {
    for (const native of [false, true]) {
        const env = setup(batchFixture([12, 24])); let count = 0, summaries = 0, restarts = 0;
        const requests = [], summaryRequests = [];
        const result = await runMemoryAgent(env.session, { config: { maxTokens: 1000 },
            limits: { turns: 30, inputTokens: 19800, compactTokens: 17800, summaryTokens: 1000 },
            countTokens: async args => ({ tokens: estimateConversationTokens(args), source: 'estimated' }),
            adapter: { supportsSessionToolLoop: native, async chat(request) {
                count++; requests.push(structuredClone(request));
                const opening = JSON.parse(request.messages[0].content);
                if (opening.workingNotes) {
                    assert.deepEqual(opening.task.completed, [{ from: 1, to: 12 }]);
                    assert.deepEqual(opening.task.contextRanges, [{ from: 1, to: 12 }]);
                    if (!request.toolResponses) restarts++;
                }
                for (let i = 1; i < request.messages.length; i++) if (request.messages[i].role === 'assistant') {
                    const toolIds = request.messages[i].tool_calls.map(item => item.id);
                    assert.deepEqual(request.messages.slice(i + 1, i + 1 + toolIds.length).map(item => item.tool_call_id), toolIds);
                }
                if (count === 1) return { toolCalls: [tool('CompleteMaintenance', { from: 1, to: 12 })] };
                if (count < 10) return { text: '调查'.repeat(4000), toolCalls: [tool('ReadSource', { floor: 2 })] };
                return { text: '余下尚待处理。' };
            } },
            createSummaryAdapter: () => ({ async chat(request) {
                summaries++; summaryRequests.push(request);
                assert.equal(request.toolResponses, undefined); assert.deepEqual(request.tools, []);
                return { text: '正在查证夏实的回收传闻；记录 f-1。后半范围仍待处理。' };
            } }),
            onSave: env.save, onFinish: env.save,
        });
        assert.equal(result.status, 'partial', result.error?.stack);
        assert.ok(summaries >= 2); assert.ok(restarts >= 2);
        assert.equal(result.calls.length, count + summaries);
        assert.ok(result.calls.every(call => call.inputTokens <= 19800 && call.tokenSource === 'estimated'));
        assert.ok(requests.length && summaryRequests.length);
        assert.deepEqual(result.ranges.completed, [{ from: 1, to: 12 }]);
    }
});

test('compaction failure and cancellation preserve previous completion; summary requests count toward the run cap', async () => {
    for (const ending of ['failure', 'cancel', 'limit']) {
        const env = setup(), controller = new AbortController(); let count = 0;
        const result = await runMemoryAgent(env.session, { config: { maxTokens: 1000 }, signal: controller.signal,
            limits: { turns: ending === 'limit' ? 4 : 10, compactTokens: 17800, inputTokens: 19800 },
            adapter: { async chat() {
                if (++count === 1) return { toolCalls: [tool('CompleteMaintenance', { from: 1, to: 12 })] };
                return { text: '调查'.repeat(5000), toolCalls: [tool('ReadSource', { floor: 2 })] };
            } },
            createSummaryAdapter: () => ({ async chat() {
                if (ending === 'cancel') controller.abort();
                if (ending === 'failure') throw new Error('summary offline');
                return { text: '工作笔记。' };
            } }), onSave: env.save, onFinish: env.save,
        });
        assert.equal(result.status, ending === 'failure' ? 'failed' : ending === 'cancel' ? 'cancelled' : 'turn_limit');
        assert.deepEqual(result.ranges.completed, [{ from: 1, to: 12 }]);
        assert.ok(result.calls.length <= (ending === 'limit' ? 4 : 10));
    }
});

test('floors 10-30 select current records from both summary batches, but only anchors within those floors', () => {
    const env = setup(batchFixture([20, 40])), session = env.session;
    session.initial();
    const args = { ranges: [{ from: 10, to: 30 }, { from: 15, to: 25 }] };
    const items = readAllMemory(session, args);
    assert.deepEqual(items.filter(item => item.collection === 'events').map(item => item.key), ['event-00020', 'event-00040']);
    assert.deepEqual(items.filter(item => item.collection === 'facts').map(item => item.key), ['fact-00020', 'fact-00040']);
    assert.deepEqual(items.filter(item => item.collection === 'anchors').map(item => item.value.floor),
        Array.from({ length: 21 }, (_, i) => i + 10));
    assert.equal(new Set(items.map(item => `${item.collection}:${item.key}`)).size, items.length);
    assert.equal(session.runTool('ReadMemory', { ...args, collection: 'facts', query: 'city 40' }).total, 1);
    assert.equal(session.runTool('ReadMemory', { ranges: [], collection: 'facts' }).total, 0);
    assert.equal(session.runTool('ReadMemory', { collection: 'facts' }).total, 2);
    assert.equal(session.runTool('ReadMemory', { ranges: [{ from: 1, to: 20 }], collection: 'facts', key: 'fact-00040' }).total, 0);
    for (const [ranges, code, field] of [
        [[{ from: 30, to: 10 }], 'invalid_arguments', 'ranges[0].to'],
        [[{ from: 10, to: 41 }], 'source_boundary', 'ranges[0].to'],
        [[{ from: 41, to: 41 }], 'source_boundary', 'ranges[0].from'],
        [[{ from: 0, to: 20 }], 'invalid_arguments', 'ranges[0].from'],
        [[{ from: 'ten', to: 20 }], 'invalid_arguments', 'ranges[0].from'],
        [null, 'invalid_arguments', 'ranges'],
    ]) assert.throws(() => session.runTool('ReadMemory', { ranges }), { code, field });
});

test('opening selects pending responsibility and actual predecessor batches, without filling completed gaps', () => {
    const fixture = batchFixture([8, 17, 31, 50, 70, 91, 110], [{ from: 1, to: 109 }]);
    // Late/rebuilt floor 20 and floor 32 reopen small subranges, not the entire suffix.
    fixture.store.summaryHistory.at(-1).maintenance[0].invalidated = [{ from: 20, to: 20 }, { from: 32, to: 32 }];
    const env = setup(fixture), opening = env.session.initial();
    assert.deepEqual(opening.task.pending, [{ from: 20, to: 20 }, { from: 32, to: 32 }, { from: 110, to: 110 }]);
    assert.deepEqual(opening.task.contextRanges, [{ from: 9, to: 19 }, { from: 21, to: 31 }, { from: 71, to: 91 }]);
    assert.deepEqual(opening.memory.filter(item => item.collection === 'facts').map(item => item.key),
        ['fact-00017', 'fact-00031', 'fact-00050', 'fact-00091', 'fact-00110']);
    assert.equal(opening.memory.some(item => item.key === 'fact-00070'), false);
    assert.equal(env.session.runTool('ReadMemory', { collection: 'facts', key: 'fact-00070' }).items[0].value.o, 'City 70');
    assert.deepEqual(opening.memory.filter(item => item.collection === 'anchors').map(item => item.value.floor),
        [...Array.from({ length: 24 }, (_, i) => i + 9), ...Array.from({ length: 21 }, (_, i) => i + 71), 110]);
});

test('an old fact updated by the newest batch enters selection once with its current value', () => {
    const fixture = batchFixture([20, 40, 60], [{ from: 1, to: 40 }]);
    const old = structuredClone(fixture.json);
    old.events.pop(); old.facts.pop();
    fixture.json.facts[0].o = 'Beijing';
    fixture.store.summaryHistory[2].undo = buildSummaryUndo(old, fixture.json);
    const env = setup(fixture), opening = env.session.initial();
    const changed = opening.memory.filter(item => item.key === 'fact-00020');
    assert.equal(changed.length, 1); assert.equal(changed[0].value.o, 'Beijing');
    assert.deepEqual(changed[0].maintenanceRange, { from: 41, to: 60 });
    assert.equal(env.session.runTool('ReadMemory', { collection: 'facts', key: 'fact-00020', ranges: [{ from: 1, to: 20 }] }).total, 0);
});

test('1000 and 5000-floor completed histories do not inflate the opening; imported history stays one fixed baseline', () => {
    const selectedCounts = [];
    for (const floors of [1000, 5000]) {
        const ends = Array.from({ length: floors / 20 }, (_, i) => (i + 1) * 20);
        const fixture = batchFixture(ends, [{ from: 1, to: floors - 20 }]);
        const opening = setup(fixture).session.initial();
        selectedCounts.push(opening.memory.length);
        assert.deepEqual(opening.task.contextRanges, [{ from: floors - 39, to: floors - 20 }]);
        assert.equal(opening.memory.filter(item => item.collection === 'events').length, 2);
        assert.equal(opening.memory.filter(item => item.collection === 'facts').length, 2);
        assert.equal(opening.memory.filter(item => item.collection === 'anchors').length, 40);
        assert.equal(opening.memoryDirectory.every(item => item.next === null), true);
    }
    assert.equal(selectedCounts[0], selectedCounts[1]);
    const fixture = batchFixture([20, 40]);
    fixture.store.summaryHistory = [createSummaryBaseline(19), fixture.store.summaryHistory[1]];
    const session = setup(fixture).session;
    assert.deepEqual(session.initial().task.pending, [{ from: 1, to: 40 }]);
    assert.deepEqual(session.runTool('ReadMemory', { collection: 'facts', key: 'fact-00020' }).items[0].maintenanceRange, { from: 1, to: 20 });
});

test('bounded openings provide scoped lossless continuations', () => {
    const fixture = batchFixture([20, 40, 60], [{ from: 1, to: 40 }]);
    fixture.json.facts[2].o = '北京'.repeat(50000);
    const session = setup(fixture).session, opening = session.initial();
    assert.ok(estimateConversationTokens({ messages: [{ role: 'user', content: JSON.stringify(opening) }] }) <= OPENING_TOKENS);
    session.inputProvided();
    const read = [...opening.memory];
    for (const directory of opening.memoryDirectory) if (directory.next) {
        assert.deepEqual(directory.next.ranges, [{ from: 21, to: 60 }]);
        read.push(...readAllMemory(session, directory.next));
    }
    assert.equal(read.some(item => item.key === 'fact-00020'), false);
    assert.equal(new Set(read.map(item => `${item.collection}:${item.key}`)).size, read.length);
    assert.equal(read.find(item => item.key === 'fact-00060').value.o, fixture.json.facts[2].o);
    assert.equal(session.runTool('CompleteMaintenance', { from: 41, to: 60 }).status, 'staged');
});

test('scoped cursors retain filters after deletions and event merges', async () => {
    const env = setup(batchFixture([20, 40, 60])), session = env.session;
    session.initial(); session.inputProvided();
    const args = { collection: 'events', ranges: [{ from: 21, to: 60 }], query: 'Episode', limit: 1 };
    const first = session.runTool('ReadMemory', args); session.inputProvided();
    assert.equal(first.items[0].key, 'event-00040');
    assert.equal(session.runTool('EditMemory', { edits: [{ kind: 'merge', collection: 'events', key: 'event-00020',
        removeIds: ['event-00040'], patch: { summary: 'Episode continued. (#20-40)' } }] }).status, 'staged');
    const saved = await env.save({ session, calls: [], runId: 'merge-pagination' }); session.acknowledge(saved.current);
    assert.deepEqual(first.next, { ...args, cursor: 'events:event-00040' });
    assert.equal(session.runTool('ReadMemory', first.next).items[0].key, 'event-00060');
    const facts = session.runTool('ReadMemory', { collection: 'facts', ranges: args.ranges, limit: 1 }); session.inputProvided();
    session.runTool('EditMemory', { edits: [{ kind: 'delete', collection: 'facts', key: 'fact-00040' }] });
    const deleted = await env.save({ session, calls: [], runId: 'merge-pagination' }); session.acknowledge(deleted.current);
    assert.equal(session.runTool('ReadMemory', facts.next).items[0].key, 'fact-00060');
});

test('completion returns fresh context ranges and does not require reading the preceding background', async () => {
    const env = setup(batchFixture([20, 40, 60, 80], [{ from: 1, to: 40 }])), session = env.session;
    session.initial(1); session.inputProvided();
    assert.deepEqual(session.task().contextRanges, [{ from: 21, to: 40 }]);
    readAllMemory(session, { ranges: [{ from: 41, to: 60 }] });
    assert.equal(session.runTool('CompleteMaintenance', { from: 41, to: 60 }).status, 'staged');
    const saved = await env.save({ session, calls: [], runId: 'completion' }); session.acknowledge(saved.current);
    const repeat = session.runTool('CompleteMaintenance', { from: 41, to: 60 });
    assert.equal(repeat.status, 'unchanged');
    assert.deepEqual(repeat.task.pending, [{ from: 61, to: 80 }]);
    assert.deepEqual(repeat.task.contextRanges, [{ from: 41, to: 60 }]);
    assert.deepEqual(createMemorySession(saved.current).initial().task, repeat.task);
});

test('shared counting shrinks over-budget opening and keeps completion agent-directed', async () => {
    const fixture = batchFixture([20, 40, 60], [{ from: 1, to: 40 }]);
    fixture.json.facts[2].o = '北京'.repeat(16000);
    const env = setup(fixture);
    let calls = 0;
    // Deterministic tokenizer stand-in: prove that measured counts override the packing estimate.
    const countTokens = async args => ({ tokens: estimateConversationTokens(args) * 2, source: 'tokenizer' });
    const original = env.session.initial();
    assert.ok((await countTokens({ messages: [{ role: 'user', content: JSON.stringify(original) }] })).tokens > OPENING_TOKENS);
    const result = await run(env, async request => {
        calls++;
        const opening = JSON.parse(request.messages[0].content);
        assert.ok((await countTokens({ messages: [request.messages[0]] })).tokens <= OPENING_TOKENS);
        if (calls === 1) {
            assert.equal(opening.memory.some(item => item.key === 'fact-00060'), false);
            return { toolCalls: [tool('CompleteMaintenance', { from: 41, to: 60 })] };
        }
        const response = JSON.parse(request.messages.at(-1).content);
        assert.equal(response.status, 'saved');
        return { text: '仍需续读。' };
    }, { countTokens });
    assert.equal(result.status, 'completed');
    assert.deepEqual(result.ranges.pending, []);
});

test('unambiguous argument formats work without rewriting text; bad fields return accepted fields', async () => {
    const env = setup(), session = env.session;
    session.initial();
    assert.equal(session.runTool('ReadSource', { floor: ' 2 ' }).items[0].floor, 2);
    const normalized = session.runTool('EditMemory', { edits: { collection: ' FACTS ', key: 'f-1',
        patch: { o: '  保留原样的文字  ', isState: 'false' } } });
    assert.equal(normalized.status, 'staged');
    const saved = await env.save({ session, calls: [], runId: 'format' }); session.acknowledge(saved.current);
    assert.equal(env.ports.read().json.facts[0].o, '  保留原样的文字  ');
    assert.equal(env.ports.read().json.facts[0]._isState, false);
    assert.equal(session.runTool('EditMemory', { edits: [{ collection: 'facts', key: 'f-1', patch: {} }] }).status, 'unchanged');
    const bad = session.runTool('EditMemory', { edits: [correction, { ...correction, patch: { value: '北京' } }] });
    assert.equal(bad.status, 'needs_fix');
    assert.equal(bad.rejected[0].field, 'edits[1].patch.value');
    assert.ok(bad.rejected[0].expected.fields.includes('o'));
    assert.equal(session.memory.json.facts[0].o, '  保留原样的文字  ');
    assert.equal(session.runTool('EditMemory', { edits: [{ ...correction, patch: { isState: 'maybe' } }] }).status, 'needs_fix');
});

async function nextSummary(env, value = '北京') {
    const current = env.ports.read(), before = structuredClone(current.json);
    const json = structuredClone(before); json.facts[0].o = value;
    current.chat.push({ is_user: true, mes: '后来搬到北京。' }, { is_user: false, mes: '现在住在北京。' });
    const cutoff = current.cutoff + 2;
    // mergeFacts updates since even when retaining an existing fact ID.
    json.facts[0].since = cutoff;
    const store = structuredClone(current.store);
    store.json = json; store.lastSummarizedMesId = cutoff;
    store.summaryHistory.push(createSummaryBatch(current.cutoff, cutoff, buildSummaryUndo(before, json)));
    await env.ports.commit({ storySummary: store, stateAtoms: current.atoms, l0Index: current.l0Index }, null, null, () => {});
}

test('new-summary records are skipped while other edits and the original range finish in the same run', async () => {
    for (const native of [false, true]) {
        const env = setup(); let calls = 0, beforeUpdateLength;
        const chat = async request => {
            calls++;
            if (calls === 1) return edit([correction]);
            if (calls === 2) {
                beforeUpdateLength = request.messages.length;
                await nextSummary(env);
                return { toolCalls: [tool('ReadSource', { floor: 2 }), tool('EditMemory', { edits: [
                    { ...correction, key: 'f-2', patch: { o: '药箱属于药君' } }, { ...correction, patch: { o: '旧回复的另一项修正' } },
                ] }),
                    tool('CompleteMaintenance', { from: 1, to: 24 })] };
            }
            if (calls === 3) {
                assert.ok(request.messages.length > beforeUpdateLength);
                assert.equal(request.messages.filter(message => message.role === 'user').length, 1);
                assert.equal(JSON.parse(request.messages[0].content).task.cutoff, 24);
                if (native) assert.equal(request.toolResponses.length, 3);
                const rejected = request.messages.filter(item => item.role === 'tool').slice(-3).map(item => JSON.parse(item.content));
                assert.equal(rejected[0].items[0].floor, 2);
                assert.equal(rejected[1].code, 'memory_updated');
                assert.deepEqual(rejected[1].records, [{ collection: 'facts', key: 'f-1' }]);
                assert.equal(rejected[2].code, 'edit_failed');
                assert.equal(env.ports.read().json.facts[1].o, maintenanceFixture().json.facts[1].o);
                return { toolCalls: [tool('EditMemory', { edits: [{ ...correction, key: 'f-2', patch: { o: '药箱属于药君' } }] }),
                    tool('CompleteMaintenance', { from: 1, to: 24 })] };
            }
            return { text: '维护完成。' };
        };
        const result = await runMemoryAgent(env.session, { adapter: { supportsSessionToolLoop: native, chat }, config: {},
            readCurrent: env.ports.read, onSave: env.save, onFinish: env.save });
        assert.equal(result.status, 'completed', result.error?.stack);
        assert.equal(result.saved, 2);
        assert.equal(result.calls.length, 4);
        assert.equal(result.ranges.cutoff, 24);
        const history = env.ports.read().store.summaryHistory;
        assert.equal(history[0].maintenance[0].runId, history[1].maintenance[0].runId);
        assert.equal(history[0].maintenance[0].operations[0].changes[0].after.o, correction.patch.o);
        assert.equal(env.ports.read().json.facts[0].o, '北京');
        assert.equal(env.ports.read().json.facts[0].since, 25);
        assert.deepEqual(maintenanceRanges(history, 25).pending, [{ from: 25, to: 26 }]);
        const restored = applyExactSummaryHistoryUndo(env.ports.read().json, history, 23, 25, env.ports.read().atoms);
        assert.equal(restored.historyDiscontinuous, false);
        assert.equal(restored.json.facts[0].o, correction.patch.o);
        assert.deepEqual(restoreMaintenance({ json: restored.json, atoms: restored.atoms }, history[0].maintenance),
            { json: maintenanceFixture().json, atoms: maintenanceFixture().atoms });
        const next = createMemorySession(env.ports.read());
        assert.equal(next.initial().memory.find(record => record.key === 'f-1').value.o, '北京');
        assert.equal(next.runTool('EditMemory', { edits: [{ ...correction, patch: { o: '现居北京' } }] }).status, 'staged');
        await env.save({ session: next, calls: [], runId: 'next-run' });
        assert.equal(env.ports.read().json.facts[0].o, '现居北京');
    }
});

test('rereading a later batch cannot turn its records into editable old-run targets', async () => {
    const env = setup(); env.session.initial();
    await nextSummary(env);
    env.session.runTool('ReadMemory', { collection: 'facts', key: 'f-1' }, env.ports.read());
    for (const operation of [correction, { kind: 'delete', collection: 'facts', key: 'f-1' }]) {
        const result = env.session.runTool('EditMemory', { edits: [operation] });
        assert.equal(result.status, 'error');
        assert.equal(result.code, 'memory_updated');
        assert.deepEqual(result.records, [{ collection: 'facts', key: 'f-1' }]);
        assert.equal(env.session.pending, null);
    }
    assert.equal(env.ports.read().json.facts[0].since, 25);
    assert.equal(env.ports.read().json.facts[0].o, '北京');
});

test('a summary or manual edit racing a save rejects only the draft and retains the normal conclusion', async () => {
    for (const summary of [true, false]) {
        const env = setup(); let calls = 0, saves = 0;
        const result = await run(env, async () => ++calls === 1 ? edit([correction]) : { text: '继续查证。' }, {
            onSave: async edit => {
                if (++saves === 1) {
                    if (summary) await nextSummary(env);
                    else env.ports.read().json.facts[0].o = '人工修改';
                }
                return env.save(edit);
            },
        });
        assert.equal(result.status, 'partial');
        assert.equal(calls, 2);
        assert.equal(result.saved, 0);
        assert.equal(env.ports.read().json.facts[0].o, summary ? '北京' : '人工修改');
    }
});

test('a normal reply racing a summary is persisted without another model call or an expanded cutoff', async () => {
    const env = setup(); let calls = 0;
    const result = await run(env, async () => {
        if (++calls === 1) await nextSummary(env);
        return { text: '暂未发现问题。' };
    });
    assert.equal(calls, 1);
    assert.equal(result.ranges.cutoff, 24);
    const final = env.ports.read().store.summaryHistory.at(-1).maintenance.at(-1);
    assert.equal(final.summary, result.summary);
    assert.equal(final.cutoff, 24);
    assert.equal(final.outcome.status, 'partial');
});

test('queued generation starts a distinct run only after the previous conclusion is confirmed', async () => {
    const env = setup(), results = [];
    let runs = 0;
    const scheduler = createMemoryScheduler({ enabled: () => true, run: async task => {
        const ordinal = ++runs;
        let calls = 0;
        const session = createMemorySession({ ...env.ports.read(), ...task });
        const result = await runMemoryAgent(session, { config: {}, readCurrent: env.ports.read, onSave: env.save, onFinish: env.save,
            adapter: { chat: async request => {
                calls++;
                if (ordinal === 1 && calls === 1) return { toolCalls: [tool('CompleteMaintenance', { from: 1, to: 24 })] };
                if (ordinal === 1) {
                    await nextSummary(env);
                    scheduler.submitted({ chatId: task.chatId, start: 24, cutoff: 25 });
                    assert.equal(runs, 1);
                    return { text: '本轮已完成。' };
                }
                const opening = JSON.parse(request.messages[0].content);
                assert.equal(opening.task.cutoff, 26);
                assert.deepEqual(opening.task.pending, [{ from: 25, to: 26 }]);
                assert.equal(opening.memory.find(record => record.key === 'f-1').value.o, '北京');
                assert.equal(env.ports.read().store.summaryHistory.at(-1).maintenance.at(-1).summary, results[0].summary);
                return { text: '新批次待查。' };
            } },
        });
        results.push(result);
        return result;
    } });
    scheduler.submitted({ chatId: env.ports.read().chatId, start: 0, cutoff: 23 });
    await scheduler.settled();
    assert.equal(runs, 2);
    assert.notEqual(results[0].runId, results[1].runId);
    assert.equal(results[0].status, 'completed');
    assert.equal(results[0].calls.length, 2);
    assert.equal(results[1].calls.length, 1);
    assert.equal(results[0].ranges.cutoff, 24);
});

test('unrelated new-summary changes survive old-run writes without acknowledging unseen records', async () => {
    const env = setup(); let calls = 0;
    const before = structuredClone(env.ports.read());
    const result = await run(env, async request => {
        calls++;
        assert.equal(request.messages.filter(message => message.role === 'user').length, 1);
        if (calls === 1) {
            await nextSummary(env);
            env.ports.read().atoms.push({ atomId: 'future-anchor', floor: 25, semantic: '北京', edges: [], where: '北京' });
            return edit([{ ...correction, key: 'f-2', patch: { o: '独立修正' } }]);
        }
        const response = JSON.parse(request.messages.at(-1).content);
        if (calls === 2) {
            assert.equal(response.status, 'saved');
            assert.equal(env.ports.read().json.facts[0].o, '北京');
            return edit([correction]);
        }
        assert.equal(response.code, 'memory_updated');
        assert.deepEqual(response.records, [{ collection: 'facts', key: 'f-1' }]);
        return { text: '独立修正已保存，后续状态留待下一轮。' };
    });
    assert.equal(result.status, 'partial', result.error?.stack);
    assert.equal(result.saved, 1);
    assert.equal(result.ranges.cutoff, 24);
    assert.equal(env.ports.read().atoms.at(-1).atomId, 'future-anchor');
    const current = env.ports.read();
    const restored = applyExactSummaryHistoryUndo(current.json, current.store.summaryHistory, 23, 25, current.atoms);
    assert.equal(restored.historyDiscontinuous, false);
    assert.deepEqual(restored.json, before.json);
});

test('concurrent reference changes are included in merge conflicts and full rereads allow exact rollback', async () => {
    const env = setup(); env.session.initial();
    await nextSummary(env);
    env.ports.read().json.events.find(item => item.id === 'evt-4').title = '人工保留的新标题';
    const edits = [{ kind: 'merge', collection: 'events', key: 'evt-1', removeIds: ['evt-2'], patch: joinedEventPatch }];
    assert.equal(env.session.runTool('EditMemory', { edits }).status, 'staged');
    await assert.rejects(env.save({ session: env.session, runId: 'merge', calls: [] }), error => {
        assert.equal(error.code, 'memory_updated');
        assert.deepEqual(error.records, [{ collection: 'events', key: 'evt-4' }]);
        return true;
    });
    assert.equal(env.ports.read().json.events.length, 4);
    env.session.discard();
    env.session.runTool('ReadMemory', { collection: 'events', key: 'evt-4' }, env.ports.read());
    const beforeMerge = structuredClone(env.ports.read().json);
    assert.equal(env.session.runTool('EditMemory', { edits }).status, 'staged');
    const saved = await env.save({ session: env.session, runId: 'merge', calls: [] });
    env.session.acknowledge(saved.current);
    const current = env.ports.read();
    assert.equal(current.json.events.find(item => item.id === 'evt-4').title, '人工保留的新标题');
    assert.deepEqual(current.json.events.find(item => item.id === 'evt-4').causedBy, ['evt-1']);
    assert.deepEqual(restoreMaintenance({ json: current.json, atoms: current.atoms }, current.store.summaryHistory.at(-1).maintenance).json, beforeMerge);
});

test('long-record continuation refuses mixed versions and can restart from the changed record', async () => {
    const fixture = maintenanceFixture(); fixture.json.facts[0].o = '旧值'.repeat(18000);
    const env = setup(fixture); env.session.initial();
    const first = env.session.runTool('ReadMemory', { collection: 'facts', key: 'f-1' }, env.ports.read());
    assert.ok(first.next.textOffset > 0);
    await nextSummary(env, '新值'.repeat(18000));
    assert.throws(() => env.session.runTool('ReadMemory', first.next, env.ports.read()), error => {
        assert.equal(error.code, 'memory_updated');
        assert.deepEqual(error.records, [{ collection: 'facts', key: 'f-1' }]);
        return true;
    });
    let next = { collection: 'facts', key: 'f-1' }, text = '';
    do {
        const page = env.session.runTool('ReadMemory', next, env.ports.read());
        text += page.items[0].excerpt; next = page.next;
    } while (next);
    assert.equal(JSON.parse(text).value.o, env.ports.read().json.facts[0].o);
});

test('a new fact conflicting with the proposed business key is correctable without partial writes', async () => {
    const env = setup(); let calls = 0;
    const proposed = { ...correction, key: 'f-2', patch: { s: '新人物', p: '职业', o: '医生' } };
    const result = await run(env, async request => {
        if (++calls === 1) {
            await nextSummary(env);
            env.ports.read().json.facts.push({ id: 'new-fact', ...proposed.patch, _addedAt: 25 });
            return edit([proposed]);
        }
        const response = JSON.parse(request.messages.at(-1).content);
        assert.equal(response.status, 'error');
        assert.equal(response.code, 'fact_conflict');
        return { text: '已存在该人物的职业，保留原记录。' };
    });
    assert.equal(result.status, 'partial', result.error?.stack);
    assert.equal(result.saved, 0);
    assert.equal(env.ports.read().json.facts[0].o, '北京');
    assert.equal(env.ports.read().json.facts.at(-1).id, 'new-fact');
});

test('multiple edit calls keep individual atomicity and completion waits for all successful edits', async () => {
    const env = setup(); let calls = 0;
    const result = await run(env, async request => {
        if (++calls === 1) return { toolCalls: [tool('CompleteMaintenance', { from: 1, to: 24 }),
            tool('EditMemory', { edits: [correction] }, 'first'),
            tool('EditMemory', { edits: [{ ...correction, key: 'f-2', patch: { o: '新值', bad: true } }] }, 'bad'),
            tool('EditMemory', { edits: [{ ...correction, key: 'f-3', patch: { o: '北京' } }] }, 'third'),
            tool('ReadMemory', { collection: 'facts', key: 'f-3' })] };
        const responses = request.messages.filter(item => item.role === 'tool').map(item => JSON.parse(item.content));
        assert.deepEqual(responses.slice(0, 3).map(item => item.status), ['saved', 'needs_fix', 'saved']);
        assert.equal(responses[3].items[0].value.o, '北京');
        assert.equal(responses[4].code, 'edit_failed');
        return { text: '两项已保存，一项待处理。' };
    });
    assert.equal(result.saved, 2);
    assert.deepEqual(result.ranges.completed, []);
    assert.deepEqual(restoreMaintenance(env.session.memory, env.ports.read().store.summaryHistory[0].maintenance),
        { json: maintenanceFixture().json, atoms: maintenanceFixture().atoms });
});

test('rereading refuses regenerated or imported history, changed source and another chat', async () => {
    const fixture = batchFixture([20, 40]);
    const env = setup(fixture), session = env.session;
    session.initial();
    const fresh = env.ports.read();
    fresh.json.facts[1].o = '上海';
    const previous = structuredClone(fresh.json); previous.facts.pop(); previous.events.pop();
    fresh.store.summaryHistory[1] = createSummaryBatch(19, 39, buildSummaryUndo(previous, fresh.json));
    assert.throws(() => session.runTool('ReadMemory', {}, fresh), { code: 'conflict' });
    fresh.store.summaryHistory = [createSummaryBaseline(39)];
    assert.throws(() => session.runTool('ReadMemory', {}, fresh), { code: 'conflict' });
    const other = setup(); other.session.initial();
    other.session.runTool('ReadSource', { floor: 1 });
    await nextSummary(other);
    other.ports.read().chat[0].mes += '已被人工改写';
    assert.throws(() => other.session.runTool('ReadMemory', {}, other.ports.read()), { code: 'conflict' });
    assert.throws(() => other.session.runTool('ReadMemory', {}, { ...other.ports.read(), chatId: 'another' }), { code: 'conflict' });
});
