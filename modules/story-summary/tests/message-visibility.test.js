import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parse } from 'acorn';
import { isUserHidden } from '../data/message-visibility.js';
import { selectL1Evidence } from '../vector/retrieval/l1-evidence-selection.js';
import { buildTemporalTurnCarrier } from '../vector/retrieval/temporal-turn-carrier.js';
import { summarizeL0Floors } from '../vector/pipeline/l0-floor-status.js';
import { entry } from './helpers/story-summary-entry.js';

// Execute production functions with explicit host/storage boundaries. Assertions
// concern returned evidence and model input, never the spelling of source code.
function sourceEntry(url, names, dependencies) {
    const source = readFileSync(url, 'utf8');
    const declarations = parse(source, { sourceType: 'module', ecmaVersion: 'latest' }).body
        .map(node => node.type === 'ExportNamedDeclaration' ? node.declaration : node)
        .filter(node => node?.type === 'FunctionDeclaration' && names.includes(node.id.name));
    const context = vm.createContext({ isUserHidden, performance, MODULE_ID: 'test',
        xbLog: { info() {}, warn() {} }, ...dependencies });
    vm.runInContext(declarations.map(node => source.slice(node.start, node.end)).join('\n'), context);
    return context;
}
const recallEntry = (names, dependencies) => sourceEntry(
    new URL('../vector/retrieval/recall.js', import.meta.url), names, dependencies,
);

// Hiding governs new raw input only; saved evidence must remain usable without
// rewriting it or changing its original floor, including deferred hydration.
test('saved direct evidence survives manual hide and unhide without changing storage', async () => {
    const chat = Array.from({ length: 60 }, () => ({ mes: 'visible' }));
    chat[29] = { is_system: true, xb_summary_hidden: true };
    const chunks = [29, 36, 38, 40].map(floor => ({ floor, chunkId: `c-${floor}-0`, chunkIdx: 0, text: `source-${floor}` }));
    const data = { chunksByFloor: new Map(chunks.map(chunk => [chunk.floor, [chunk]])),
        chunkVectorsById: new Map(chunks.map(chunk => [chunk.chunkId, { vector: [1, 0] }])) };
    const before = structuredClone(data);
    const direct = sourceEntry(new URL('../vector/retrieval/direct-evidence-retrieval.js', import.meta.url),
        ['selectDirectEvidence'], {
            selectRecallRuntimeL1Evidence: (_chatId, parents, options) => selectL1Evidence(parents, data, options),
        });
    const runtime = recallEntry(['hydrateDirectEvidence'], {
        getContext: () => ({ chat }), selectDirectEvidence: direct.selectDirectEvidence,
        releaseDirectEvidenceContext: async () => {}, recordRecallFallback() {},
    });
    const read = hiddenThrough => runtime.hydrateDirectEvidence({
        runtimeLease: {}, chatId: 'chat', queryVector: [1, 0],
        sourceEvents: [{ event: { id: 'old-event', summary: 'Existing summary (#1-60)' } }],
        sourceTurns: [{ floor: 38, contextFloor: 36 }],
        lexicalScores: chunks.map(chunk => ({ chunkId: chunk.chunkId, score: 1 })),
    }, null, { hiddenThrough });
    for (const hidden of [false, true, false]) {
        chat[36].is_system = chat[38].is_system = hidden;
        const result = await read(59);
        assert.equal(result.status, 'applied');
        assert.deepEqual(new Set(result.items.map(item => item.chunkId)), new Set(chunks.map(chunk => chunk.chunkId)));
    }
    assert.deepEqual(new Set((await read(37)).items.map(item => item.floor)), new Set([29, 36]));
    assert.deepEqual(data, before);
});

test('stored anchors and paired passages remain eligible across manual visibility changes', async () => {
    const chat = [{ mes: 'user', is_user: true }, { mes: 'reply' },
        { mes: 'auto-hidden reply', is_system: true, xb_summary_hidden: true }];
    const atoms = [1, 2].map(floor => ({ floor, atomId: `a-${floor}`, semantic: `scene-${floor}` }));
    const chunks = chat.map((message, floor) => ({ floor, chunkId: `c-${floor}-0`, text: message.mes,
        isUser: !!message.is_user, _cosineScore: 1 }));
    const before = structuredClone({ atoms, chunks });
    const runtime = recallEntry(['getStateAtoms', 'recallAnchors', 'mapChunkFloorToAiFloor',
        'pullAndScoreL1', 'buildL1PairsForSelectedFloors'], {
        getContext: () => ({ chatId: 'chat', chat }),
        getStateAtoms: () => atoms, readStateAtoms: () => atoms,
        CONFIG: { ANCHOR_MIN_SIMILARITY: 0.58 }, getEngineFingerprint: () => 'engine',
        getRecallRuntimeMeta: async () => ({ fingerprint: 'engine' }),
        scoreRecallRuntimeAnchors: async () => ({ scores: atoms.map(atom => ({ ...atom, similarity: 1 })) }),
        scoreRecallRuntimeL1: async (_id, floors) => new Map(floors.map(floor => [floor, [chunks[floor]]])),
    });
    for (const hidden of [false, true, false]) {
        chat[0].is_system = chat[1].is_system = hidden;
        const anchors = await runtime.recallAnchors([1, 0], {}, null);
        assert.deepEqual(new Set(anchors.hits.map(hit => hit.atomId)), new Set(atoms.map(atom => atom.atomId)));
        assert.equal(runtime.mapChunkFloorToAiFloor(0, chat), 1);
        const passages = await runtime.pullAndScoreL1('chat', [0, 1, 2], [1, 0]);
        assert.deepEqual([...passages.keys()], [0, 1, 2]);
        const pairs = await runtime.buildL1PairsForSelectedFloors(anchors.hits, [1, 0], passages, null);
        assert.equal(pairs.get(1).userTop1, chunks[0]);
        assert.equal(pairs.get(1).aiTop1, chunks[1]);
        assert.equal(pairs.get(2).aiTop1, chunks[2]);
    }
    assert.deepEqual({ atoms, chunks }, before);
});

test('new query reads exclude manual hides, retain automatic hides, and restore eligibility on unhide', () => {
    const chat = [{ mes: 'visible user', is_user: true }, { mes: 'manual reply', is_system: true },
        { mes: 'auto-hidden reply', is_system: true, xb_summary_hidden: true }, { mes: 'actual last AI' }];
    const runtime = recallEntry(['getLastMessages']);
    const captured = runtime.getLastMessages(chat, 3, true);
    assert.deepEqual(Array.from(captured), [chat[0], chat[2]]);
    chat[1].is_system = false;
    assert.deepEqual(Array.from(runtime.getLastMessages(chat, 3, true)), chat.slice(0, 3));
    delete chat[2].xb_summary_hidden;
    assert.deepEqual(Array.from(runtime.getLastMessages(chat, 3, true)), chat.slice(0, 2));
    assert.deepEqual(Array.from(captured), [chat[0], chat[2]]);
    chat[0].is_system = chat[1].is_system = true;
    assert.deepEqual(Array.from(runtime.getLastMessages(chat, 3, true)), []);
});

test('raw temporal scans skip manual timestamps but keep saved turn associations', () => {
    const chat = [{ mes: '11月3日12:00', is_user: true }, { mes: 'paired reply', is_system: true },
        { mes: 'query', is_user: true }];
    const read = () => buildTemporalTurnCarrier({ chat, query: chat[0].mes, queryFloor: 2 });
    assert.deepEqual(read().exactFloors, [0]);
    assert.deepEqual(read().assistantFloors, [1]);
    chat[0].is_system = true;
    assert.deepEqual(read().exactFloors, []);
    chat[0].xb_summary_hidden = true;
    assert.deepEqual(read().exactFloors, [0]);
    delete chat[0].xb_summary_hidden;
    chat[0].is_system = false;
    assert.deepEqual(read().exactFloors, [0]);
    assert.deepEqual(read().userFloors, [0]);
});

test('pending L0 counts skip manual raw input and restore the same floor after unhide', () => {
    const chat = [{ mes: 'user', is_user: true }, { mes: 'reply', is_system: true }];
    assert.equal(summarizeL0Floors(chat, {}).pending, 0);
    chat[1].is_system = false;
    assert.equal(summarizeL0Floors(chat, {}).pending, 1);
});

test('publishing a captured prompt after hide does not reprepare or revoke its memory', async () => {
    const chat = [{ mes: 'captured source' }];
    const prepared = { chatId: 'visibility-chat', diagnostics: { type: 'normal' },
        text: chat[0].mes, depth: 1, role: 0 };
    chat[0].is_system = true;
    const extension_prompts = {};
    const runtime = entry(['commitMemoryPrompt'], {
        getContext: () => ({ chatId: 'visibility-chat', chat }), isStorySummaryEnabledForCurrentChat: () => true,
        throwIfSignalAborted: signal => signal?.throwIfAborted(), createAbortError: () => new Error('abort'),
        performance, MODULE_ID: 'test', EXT_PROMPT_KEY: 'memory', extension_prompts,
        extension_prompt_types: { IN_CHAT: 1 }, commitIfSignalActive: (_signal, commit) => { commit(); return true; },
        formatRecallDiagnostics: () => 'report', postToFrame() {}, recallReuse: { adopt() {} },
        lastRecallLogText: '', xbLog: { info() {} },
        prepareMemoryPrompt: () => assert.fail('captured input must not be recomputed'),
    });
    await runtime.commitMemoryPrompt(prepared);
    assert.equal(extension_prompts.memory.value, prepared.text);
});
