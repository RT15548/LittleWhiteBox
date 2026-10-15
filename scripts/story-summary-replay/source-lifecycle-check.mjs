import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createMessageSourceTracker } from '../../modules/story-summary/data/message-sources.js';
import { synchronizeSourceCaches } from '../../modules/story-summary/data/source-sync.js';
import { readSummaryMemory, commitSummaryMemory } from '../../modules/story-summary/data/memory-commit.js';
import { shutdownRecallRuntime } from '../../modules/story-summary/vector/runtime/runtime.js';
import { __setChatMetadata } from './shims/script.js';
import { __setReplayContext } from './shims/extensions.js';
import { applyReplayConfig } from './config.mjs';
import { parseReplaySample } from './sample.mjs';

// Read-only source replay, no credentials, no network passthrough and no quality grades.
// Production extraction/storage/retrieval/packing run unchanged; only HTTP is a fixture.
export async function runSourceLifecycleCheck({ modules, samplePaths }) {
    const originalFetch = globalThis.fetch;
    let fixtureRequests = 0;
    globalThis.fetch = async (url, init) => {
        assert.equal(new URL(String(url)).host, 'source-lifecycle.invalid');
        fixtureRequests++;
        const body = JSON.parse(init.body);
        if (String(url).endsWith('/embeddings')) return Response.json({ data: body.input.map((_, index) => ({ index, embedding: [1, 0] })) });
        if (String(url).endsWith('/rerank')) return Response.json({ results: body.documents.map((_, index) => ({ index, relevance_score: 0.9 })) });
        assert.ok(String(url).endsWith('/chat/completions'));
        const digest = createHash('sha256').update(JSON.stringify(body.messages)).digest('hex');
        return Response.json({ choices: [{ message: { content: JSON.stringify({ anchors: [{
            scene: `离线来源凭据${digest}。这是传输替身用于追踪原文归属的记录，不是模型对聊天的语义判定。角色保管了一份记录并约定以后再核对，用户确认已经收好这份记录。`,
            edges: [], where: '离线夹具',
        }] }) } }] });
    };
    const results = [];
    try {
        for (const samplePath of samplePaths) {
            const bytes = await fs.readFile(samplePath, 'utf8');
            const sample = parseReplaySample(bytes);
            const messages = sample.messages;
            const focusFloor = messages.findLastIndex(message => message.is_user);
            assert.ok(focusFloor > 10);
            const chat = structuredClone(messages.slice(0, focusFloor));
            const chatId = `source-check-${results.length}`;
            __setChatMetadata({});
            __setReplayContext({ chatId, chat, name1: '用户', name2: '角色', saveMetadata: async () => {} });
            const api = { provider: 'custom', url: 'https://source-lifecycle.invalid/v1', key: 'offline-fixture', model: 'fixture' };
            const { panel } = applyReplayConfig({ vectorConfig: { enabled: true, l0Concurrency: 50,
                l0Api: api, embeddingApi: api, rerankApi: api }, panelConfig: { trigger: { delayFloors: 0 } } }, modules);
            const tracker = createMessageSourceTracker(); tracker.reset(modules.getContext());
            const initial = readSummaryMemory();
            initial.storySummary.lastSummarizedMesId = 14;
            initial.storySummary.json = { events: [{ id: 'offline-source-range', title: '离线来源范围',
                summary: '离线传输夹具引用这些楼层，仅用于检查真实证据装配，不判定聊天事实。 (#1-15)',
                _addedAt: 14, participants: [], causedBy: [], memoryRole: '具体经历' }],
            facts: [], arcs: [], characters: { main: [] }, keywords: [], characterAliases: [] };
            await commitSummaryMemory(chatId, initial);
            await modules.saveEventVectors(chatId, [{ eventId: 'offline-source-range', vector: [1, 0] }], modules.getEngineFingerprint(panel.vector));
            const maintain = async () => {
                await modules.maintainChunks({ targetChatId: chatId, chatSnapshot: chat, vectorConfig: panel.vector });
                await modules.incrementalExtractAtoms(chatId, chat, null, { retryFailedFloors: true });
                await modules.vectorizeMissingStateAtoms(chatId, null, { vectorConfig: panel.vector });
                modules.invalidateLexicalIndex();
                // Query building intentionally uses TF while the corpus is cold.
                // Compare unchanged input under the same ready-index conditions.
                await modules.getLexicalIndex();
            };
            const prompt = async () => {
                chat.push(structuredClone(messages[focusFloor]));
                try { return await modules.buildVectorPromptText(); }
                finally { chat.pop(); }
            };
            await maintain();
            const control = await prompt();
            assert.ok(control.text.length > 0, JSON.stringify({ reason: control.diagnostics.reason,
                anchors: await modules.getAnchorStats(), vectors: await modules.getStateVectorsCount(chatId),
                lastChunkFloor: (await modules.getMeta(chatId)).lastChunkFloor }));
            const beforeRequests = fixtureRequests;
            assert.equal((await synchronizeSourceCaches(tracker, modules.getContext())).status, 'unchanged');
            assert.equal(fixtureRequests, beforeRequests);
            assert.equal(createHash('sha256').update((await prompt()).text).digest('hex'),
                createHash('sha256').update(control.text).digest('hex'), 'unchanged source must preserve injected evidence');
            const firstAi = chat.findIndex(message => !message.is_user);
            const scenarios = [
                { kind: 'edit', floor: firstAi, mutate: () => { chat[firstAi].mes += '\n离线回归：原文已经修改。'; } },
                { kind: 'edit', floor: 2, mutate: () => { [chat[1], chat[2]] = [chat[2], chat[1]]; } },
                { kind: 'delete', mutate: () => { chat.splice(Math.floor(chat.length / 2), 1); } },
            ];
            for (const scenario of scenarios) {
                const previous = readSummaryMemory();
                scenario.mutate();
                tracker.observeCompletion(modules.getContext(), chat.length - 1); // quiet must not confirm the diff
                const change = tracker.inspect(modules.getContext());
                assert.ok(change);
                const old = previous.stateAtoms.filter(atom => change.fromFloor === null
                    ? change.anchorFloors.includes(atom.floor) : atom.floor >= change.fromFloor);
                const result = await synchronizeSourceCaches(tracker, modules.getContext(), scenario);
                assert.equal(result.status, 'synced');
                const retained = modules.getStateAtoms();
                assert.ok(old.every(atom => !retained.some(item => item.atomId === atom.atomId)));
                await maintain();
                const stored = await modules.getAllChunks(chatId);
                const expected = new Map(chat.flatMap((message, floor) => modules.chunkMessage(floor, message)).map(chunk => [chunk.chunkId, chunk]));
                for (const chunk of stored) assert.ok(chunk.text === expected.get(chunk.chunkId)?.text, `chunk source mismatch: ${chunk.chunkId}`);
                const built = await prompt();
                assert.ok(built.text.length > 0);
                const currentSemantics = new Set(modules.getStateAtoms().map(atom => atom.semantic));
                for (const atom of old) if (!currentSemantics.has(atom.semantic)) assert.equal(built.text.includes(atom.semantic), false);
            }
            // Saved state remains a valid confirmed snapshot, not merely an in-memory projection.
            await commitSummaryMemory(chatId, readSummaryMemory());
            results.push({ messages: messages.length, historyFloors: focusFloor, mutations: scenarios.length,
                promptChecked: true, sampleSha256: createHash('sha256').update(bytes).digest('hex') });
            await shutdownRecallRuntime();
        }
        return { results, fixtureRequests, networkRequests: 0, qualityMeasured: false };
    } finally { globalThis.fetch = originalFetch; await shutdownRecallRuntime(); }
}
