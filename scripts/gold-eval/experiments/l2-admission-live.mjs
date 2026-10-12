/* global process */
// Experiment-owned bounded transport and frozen-input assembly. No scoring here.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { openRequestJournal } from '../../story-summary-replay/request-journal.mjs';
import { createRequestRecovery } from '../../story-summary-replay/request-recovery.mjs';
import { parseReplaySample } from '../../story-summary-replay/sample.mjs';
import { summarizeExternalRequest } from '../lib/transport-cassette.mjs';
import { loadStudy, auditStudy } from '../study/store.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = async filename => JSON.parse(await fs.readFile(filename, 'utf8'));
const write = (filename, value) => fs.writeFile(filename, JSON.stringify(value, null, 2) + '\n');
const identity = row => [row.host, row.path, row.method, row.model, row.requestHash].join('\0');
async function verified(ref) {
    const bytes = await fs.readFile(ref.path);
    assert.equal(sha(bytes), ref.sha256, ref.path);
    return JSON.parse(bytes);
}

export function assertCompleteRerank(body, documents) {
    assert.ok(Array.isArray(body?.results));
    assert.equal(body.results.length, documents.length);
    const indices = new Set();
    for (const row of body.results) {
        assert.ok(Number.isInteger(row.index) && row.index >= 0 && row.index < documents.length);
        assert.ok(Number.isFinite(row.relevance_score));
        assert.ok(!indices.has(row.index));
        indices.add(row.index);
    }
}

async function loadInputs(output) {
    const loaded = await loadStudy(path.resolve(output, '../../STUDY.json'));
    const audit = await auditStudy(loaded.study);
    assert.equal(audit.ok, true, 'Current study dependency audit failed');
    assert.equal(loaded.study.studyId, 'story-summary-current-800-l2-admission-fusion');
    const proposal = await read(path.join(output, 'live-proposal.json'));
    assert.equal(loaded.study.policy.apiAuthorizationDecision, proposal.authorizationDecision);
    const plan = await verified(proposal.plan);
    const requests = await verified(proposal.requests);
    assert.equal(requests.length, proposal.initialNewRequests);
    assert.equal(new Set(requests.map(identity)).size, requests.length);
    for (const row of requests) {
        assert.equal(row.host, proposal.host);
        assert.equal(row.model, proposal.model);
        assert.equal(row.endpoint, 'rerank');
        assert.equal(row.path, '/v1/rerank');
        assert.equal(row.method, 'POST');
        assert.equal(sha(JSON.stringify(row.body)), row.requestHash);
        assert.equal(row.body.model, proposal.model);
    }
    return { proposal, plan, requests };
}

export async function dispatchAdmissionRequests(output, credentialsPath, resume) {
    const { proposal, requests } = await loadInputs(output);
    const recoveryPolicy = { maxAttempts: proposal.attemptsPerIdentity, baseDelayMs: 15000, maxDelayMs: 60000 };
    const supportFiles = [new URL(import.meta.url), new URL('../../story-summary-replay/request-journal.mjs', import.meta.url),
        new URL('../../story-summary-replay/request-recovery.mjs', import.meta.url)];
    const support = await Promise.all(supportFiles.map(async url => sha(await fs.readFile(url))));
    const binding = sha(JSON.stringify({ proposal, support, recoveryPolicy }));
    const journal = await openRequestJournal({ directory: path.join(output, 'live-journal'), binding,
        maxRequests: proposal.hardMaximumAttempts, resume });
    const result = { binding, proposal, recoveryPolicy, startedAt: new Date().toISOString(),
        status: 'running', requests: [], attempts: 0, failure: null };
    try {
        // Only the authorized execution path reads credentials. Nothing below logs them.
        const config = await read(credentialsPath);
        const api = config.vectorConfig?.rerankApi;
        assert.equal(api?.model, proposal.model);
        assert.equal(new URL(api.url).host, proposal.host);
        const keys = String(api.key || '').split(/[,\n]/).map(key => key.trim()).filter(Boolean);
        assert.ok(keys.length > 0, 'Registered rerank credentials unavailable');
        const recovery = createRequestRecovery(recoveryPolicy, {
            onRetry: row => console.log(JSON.stringify({ retry: row })),
        });
        for (const [index, row] of requests.entries()) {
            const url = `https://${row.host}${row.path}`;
            const body = JSON.stringify(row.body);
            const started = performance.now();
            await journal.runScope(`rerank:${row.requestHash}`, async () => {
                const response = await recovery([url, { method: row.method, body }], () => journal.dispatch(url, {
                    method: row.method, body,
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keys[index % keys.length]}` },
                    signal: AbortSignal.timeout(60000),
                }, globalThis.fetch));
                assert.equal(response.status, 200, `Rerank HTTP failure at request ${index + 1}`);
                const payload = await response.json();
                assertCompleteRerank(payload, row.body.documents);
                result.requests.push({ ...row, status: response.status, responseBody: payload,
                    responseHash: sha(JSON.stringify(payload)), receipt: response.preparedReceipt,
                    elapsedMs: Math.round(performance.now() - started) });
                result.attempts = journal.usedRequests;
                await write(path.join(output, 'live-results.json'), result);
                console.log(JSON.stringify({ completed: result.requests.length, total: requests.length, attempts: result.attempts }));
            });
        }
        result.status = 'complete';
        result.completedAt = new Date().toISOString();
        await write(path.join(output, 'live-results.json'), result);
        await journal.finish();
        return { completed: result.requests.length, attempts: journal.usedRequests };
    } catch (error) {
        result.status = 'failed';
        result.attempts = journal.usedRequests;
        result.failure = { kind: error.goldFailure?.kind || 'execution-or-protocol',
            details: error.goldFailure || null };
        await write(path.join(output, 'live-results.json'), result);
        throw error;
    } finally { await journal.close(); }
}

export async function assembleAdmissionPairs(output) {
    const { plan, requests } = await loadInputs(output);
    const live = await read(path.join(output, 'live-results.json'));
    assert.equal(live.status, 'complete');
    assert.deepEqual(live.requests.map(identity), requests.map(identity));
    const manifest = await verified(plan.source.manifest);
    const sampleBytes = await fs.readFile(plan.source.sample.path);
    assert.equal(sha(sampleBytes), plan.source.sample.sha256);
    const sample = parseReplaySample(sampleBytes.toString('utf8'));
    assert.equal(sha(await fs.readFile(plan.code.bundle.path)), plan.code.bundle.sha256);
    // eslint-disable-next-line no-unsanitized/method -- Pinned local production replay bundle.
    const replay = await import(pathToFileURL(plan.code.bundle.path));
    replay.ensureNodeReplayGlobals();
    const settings = {};
    replay.__setExtensionSettings(settings);
    const modules = await replay.loadReplayModules(settings);
    replay.applyReplayConfig({ panelConfig: manifest.config.effectivePanel,
        vectorConfig: { rerankApi: { key: 'offline-receipt-only' } } }, modules);
    const checkpoints = await Promise.all(plan.targets.map(target => verified(target.checkpoint)));
    const receipts = new Map();
    for (const checkpoint of checkpoints) for (const row of checkpoint.transport.production) {
        if (row.status === 200 && row.responseBody && row.responseHash === sha(JSON.stringify(row.responseBody))) {
            receipts.set(identity(row), row);
        }
    }
    for (const row of live.requests) {
        assert.equal(row.responseHash, sha(JSON.stringify(row.responseBody)));
        assertCompleteRerank(row.responseBody, row.body.documents);
        receipts.set(identity(row), row);
    }
    await fs.mkdir(path.join(output, 'assembly'), { recursive: true });
    const nativeFetch = globalThis.fetch;
    const results = [];
    try {
        for (const [index, target] of plan.targets.entries()) {
            const checkpoint = checkpoints[index];
            const snapshot = await verified(target.boundary);
            const admission = await read(path.join(output, 'positions', `${target.floor}.json`));
            const input = checkpoint.promptInput.production;
            const originalRecall = replay.deserializePromptRecallInput(input.recallResult);
            const chat = sample.messages.slice(0, target.floor);
            const chatId = snapshot.vector.meta.chatId;
            replay.__setReplayContext({ chat, chatId, name1: 'unused', name2: 'unused' });
            await replay.restoreReplaySnapshot(modules, chatId, snapshot);
            const source = new Map(originalRecall.events.map(item => {
                const clean = { ...item };
                delete clean._eventRerankScore;
                return [item.event.id, clean];
            }));
            const trace = [];
            globalThis.fetch = async (url, init) => {
                const request = summarizeExternalRequest(url, init);
                const receipt = receipts.get(identity(request));
                assert.ok(receipt, `Missing exact receipt: ${request.requestHash}`);
                trace.push({ ...request, responseHash: receipt.responseHash,
                    source: receipt.receipt ? 'new-frozen-rerank' : 'existing-capture' });
                return new Response(JSON.stringify(receipt.responseBody), { status: 200 });
            };
            const head = admission.fusionHead.map(id => source.get(id));
            const tail = admission.fusionTail.map(id => source.get(id));
            assert.ok([...head, ...tail].every(Boolean));
            const rerank = await modules.rerankRecalledEvents(head, {
                ...checkpoint.promptInput.observationBase.diagnosticValues.semanticQuery,
                chat, queryFloor: target.floor - 1,
            });
            assert.equal(rerank.status, 'applied');
            assert.equal(rerank.diagnostics.failedBatches, 0);
            const recall = { ...originalRecall, events: [...rerank.events, ...tail] };
            assert.equal(recall.events.length, originalRecall.events.length);
            assert.equal(new Set(recall.events.map(item => item.event.id)).size, recall.events.length);
            const built = await modules.buildVectorPromptForReplay(modules.getSummaryStore(), recall,
                recall.focusCharacters, structuredClone(input.meta), structuredClone(recall.metrics));
            const promptText = [input.wrapperHead, built.promptText, input.wrapperTail].filter(Boolean).join('\n');
            const pair = { floor: target.floor, caseId: target.caseId,
                control: { promptHash: admission.controlPromptHash, promptText: admission.controlPromptText },
                fusion: { promptHash: sha(promptText), promptText, evidenceTrace: built.evidenceTrace,
                    rerank: { ...rerank, events: rerank.events.map(item => ({ eventId: item.event.id, score: item._eventRerankScore })) },
                    transport: trace, eventOrder: recall.events.map(item => item.event.id) },
                frozenL1: originalRecall.chunks, boundary: target.boundary, checkpoint: target.checkpoint,
            };
            if (!admission.promoted.length) assert.equal(pair.fusion.promptHash, pair.control.promptHash);
            await write(path.join(output, 'assembly', `${target.floor}.json`), pair);
            const ids = new Set(built.evidenceTrace.prompt.map(row => row.unitId));
            results.push({ floor: target.floor, promptHash: pair.fusion.promptHash,
                identicalPrompt: pair.fusion.promptHash === pair.control.promptHash,
                targetRerank: pair.fusion.rerank.events.find(row => row.eventId === 'evt-61') || null,
                targetInPrompt: ids.has('event:evt-61'),
                eventIds: [...ids].filter(id => id?.startsWith('event:')).map(id => id.slice(6)) });
            console.log(JSON.stringify(results.at(-1)));
        }
        await write(path.join(output, 'assembly-results.json'), { status: 'complete-unreviewed', positions: results });
        return { assembled: results.length };
    } finally { globalThis.fetch = nativeFetch; }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    const [mode, output, credentialsPath] = process.argv.slice(2);
    assert.ok(output, 'Provide mode and experiment directory');
    if (mode === 'dispatch') {
        assert.ok(process.argv.includes('--allow-api'), 'Explicit live execution flag required');
        console.log(JSON.stringify(await dispatchAdmissionRequests(path.resolve(output), credentialsPath,
            process.argv.includes('--resume'))));
    } else if (mode === 'assemble') console.log(JSON.stringify(await assembleAdmissionPairs(path.resolve(output))));
    else throw new Error('Use dispatch or assemble');
}
