/* global process */
// Zero-network mechanism screen. Frozen upstream, current lexical index and packing.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { buildReplayBundle } from '../../story-summary-replay/build-bundle.mjs';
import { parseReplaySample } from '../../story-summary-replay/sample.mjs';
import { summarizeExternalRequest } from '../lib/transport-cassette.mjs';
import { compareL2Admission } from './l2-admission-fusion.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = async filename => JSON.parse(await fs.readFile(filename, 'utf8'));
const write = (filename, value) => fs.writeFile(filename, JSON.stringify(value, null, 2) + '\n');
const identity = row => [row.host, row.path, row.method, row.model, row.requestHash].join('\0');
const eventIds = items => items.map(item => item.event.id);
// Reconstruct the captured floor projection ONLY to verify lexical input identity.
// Constants come from the capture, not a second production configuration.
function capturedLexicalProjection(lexical, checkpoint, chat, atomFloors) {
    const recall = checkpoint.promptInput.production.recallResult;
    const dense = new Map(checkpoint.stageTrace.stages.r2Dense.map(row => [row.floor, row.score]));
    const threshold = recall.metrics.lexical.denseGateThresholds.floor;
    const bonus = recall.metrics.fusion.lexDensityBonus;
    const floors = new Map();
    for (const { chunkId, score } of lexical.chunkScores) {
        let floor = Number(chunkId.match(/^c-(\d+)-/)[1]);
        if (chat[floor]?.is_user) floor++;
        if (!chat[floor] || chat[floor].is_user || !atomFloors.has(floor) || !(dense.get(floor) >= threshold)) continue;
        const row = floors.get(floor) || { floor, max: 0, count: 0 };
        row.max = Math.max(row.max, score);
        row.count++;
        floors.set(floor, row);
    }
    return [...floors.values()].map(row => ({ floor: row.floor, score: row.max * (1 + bonus * Math.log2(row.count)) }))
        .sort((a, b) => b.score - a.score);
}
async function verified(ref) {
    const bytes = await fs.readFile(ref.path);
    assert.equal(sha(bytes), ref.sha256, ref.path);
    return JSON.parse(bytes);
}

export async function screenL2Admission({ repository, sourcePlanPath, output }) {
    const sourcePlan = await read(sourcePlanPath);
    const manifest = await verified(sourcePlan.source.manifest);
    const sampleBytes = await fs.readFile(sourcePlan.source.sample.path);
    assert.equal(sha(sampleBytes), sourcePlan.source.sample.sha256);
    const sample = parseReplaySample(sampleBytes.toString('utf8'));
    await fs.mkdir(path.join(output, 'positions'), { recursive: true });
    const bundlePath = path.join(output, 'code', 'current.mjs');
    const build = await buildReplayBundle(repository, bundlePath);
    // Replay's intentionally external SDK resolves beside an archived bundle.
    const dependencyLink = path.join(output, 'code', 'node_modules');
    try { await fs.symlink(path.join(repository, 'node_modules'), dependencyLink, 'junction'); }
    catch (error) {
        if (error.code !== 'EEXIST') throw error;
        assert.equal(await fs.realpath(dependencyLink), await fs.realpath(path.join(repository, 'node_modules')));
    }
    // eslint-disable-next-line no-unsanitized/method -- Locally built replay artifact, not remote code.
    const replay = await import(pathToFileURL(bundlePath));
    replay.ensureNodeReplayGlobals();
    const settings = {};
    replay.__setExtensionSettings(settings);
    const modules = await replay.loadReplayModules(settings);
    replay.applyReplayConfig({ panelConfig: manifest.config.effectivePanel,
        vectorConfig: { rerankApi: { key: 'offline-input-only' } } }, modules);
    const sources = await Promise.all(Object.keys(build.metafile.inputs).sort().map(async filename => ({
        path: path.resolve(repository, filename), sha256: sha(await fs.readFile(path.resolve(repository, filename))),
    })));
    const checkpoints = await Promise.all(sourcePlan.targets.map(target => verified(target.checkpoint)));
    const receipts = new Map();
    for (const checkpoint of checkpoints) {
        for (const row of checkpoint.transport.production) {
            if (row.status === 200 && row.responseBody && row.responseHash === sha(JSON.stringify(row.responseBody))) {
                receipts.set(identity(row), row);
            }
        }
    }
    const plan = {
        kind: 'l2-rerank-admission-fusion', createdAt: new Date().toISOString(),
        networkAllowed: false, roleGeneration: false, scoringDecision: sourcePlan.scoringDecision,
        scope: 'Frozen observed upstream recall; current lexical reconstruction verified against captured floor rankings; current assembly. Not fresh complete retrieval.',
        rule: { candidatePool: 'unchanged', candidateCapacity: 60, rrfK: 60,
            weights: { dense: 1, lexical: 1, floor: 1 }, rankBase: 1,
            floorOrder: 'captured normal rerank survivors then lexical must-keep; best floor only; tied best positions have competition rank',
            graphVote: false, temporalPolicy: 'unchanged dense-based winners within capacity',
            rerankDocumentOrder: 'unchanged dense order within admitted head',
            q2: 'frozen unchanged', assemblyBudgets: 'unchanged current production' },
        sourcePlan: { path: path.resolve(sourcePlanPath), sha256: sha(await fs.readFile(sourcePlanPath)) },
        source: sourcePlan.source, targets: sourcePlan.targets,
        code: { bundle: { path: bundlePath, sha256: sha(await fs.readFile(bundlePath)) }, sources },
    };
    await write(path.join(output, 'plan.json'), plan);
    const nativeFetch = globalThis.fetch;
    globalThis.fetch = () => { throw new Error('Network prohibited by admission screen'); };
    const results = [];
    const pending = new Map();
    try {
        for (const [index, target] of sourcePlan.targets.entries()) {
            const checkpoint = checkpoints[index];
            const snapshot = await verified(target.boundary);
            const input = checkpoint.promptInput.production;
            const recall = replay.deserializePromptRecallInput(input.recallResult);
            const chat = sample.messages.slice(0, target.floor); // Includes current USER; no future AI.
            const chatId = snapshot.vector.meta.chatId;
            replay.__setReplayContext({ chat, chatId, name1: 'unused', name2: 'unused' });
            await replay.restoreReplaySnapshot(modules, chatId, snapshot);
            modules.invalidateLexicalIndex();
            const terms = recall.metrics.lexical.terms;
            assert.ok(terms.length <= 10);
            const lexical = modules.searchLexicalIndex(await modules.getLexicalIndex(), terms);
            assert.equal(lexical.failures.length, 0);
            // Cannot substitute a changed lexical channel in this isolated experiment.
            const capturedLexical = checkpoint.stageTrace.stages.lexical;
            const projected = capturedLexicalProjection(lexical, checkpoint, chat, new Set(modules.getStateAtoms().map(atom => atom.floor)));
            assert.deepEqual(projected.map(row => row.floor), capturedLexical.map(row => row.floor), `lexical floors #${target.floor}`);
            for (let i = 0; i < capturedLexical.length; i++) {
                assert.ok(Math.abs(projected[i].score - capturedLexical[i].score) < 1e-8, `lexical score #${target.floor}:${i}`);
            }
            const selectedFloors = checkpoint.stageTrace.stages.rerank.map(row => row.floor);
            const semantic = checkpoint.promptInput.observationBase.diagnosticValues.semanticQuery;
            const compared = compareL2Admission(recall.events, {
                lexicalEventIds: lexical.eventIds, selectedFloors,
                chat, temporalQuery: semantic.temporalQuery, queryFloor: target.floor - 1,
            });
            assert.equal(compared.treatment.candidates.length, compared.control.candidates.length);
            const original = await verified(target.previousPair);
            const built = await modules.buildVectorPromptForReplay(modules.getSummaryStore(), recall,
                recall.focusCharacters, structuredClone(input.meta), structuredClone(recall.metrics));
            const promptText = [input.wrapperHead, built.promptText, input.wrapperTail].filter(Boolean).join('\n');
            assert.equal(sha(promptText), original.arms.current.promptHash, `current control assembly #${target.floor}`);
            const requests = {};
            for (const [arm, admission] of [['control', compared.control], ['fusion', compared.treatment]]) {
                requests[arm] = [];
                globalThis.fetch = async (url, init) => {
                    const request = summarizeExternalRequest(url, init);
                    assert.equal(request.endpoint, 'rerank');
                    const receipt = receipts.get(identity(request));
                    const record = { ...request, body: JSON.parse(init.body), reusable: !!receipt };
                    requests[arm].push(record);
                    if (!receipt) {
                        if (!pending.has(identity(request))) pending.set(identity(request), { ...record, positions: [] });
                        pending.get(identity(request)).positions.push({ floor: target.floor, arm });
                        // Input capture only. Failed planning never becomes a quality verdict.
                        throw new Error('Input captured; no authorized live request dispatched');
                    }
                    return new Response(JSON.stringify(receipt.responseBody), { status: receipt.status });
                };
                const rerank = await modules.rerankRecalledEvents(admission.candidates, { ...semantic, chat,
                    queryFloor: target.floor - 1 });
                if (arm === 'control') {
                    assert.equal(rerank.status, 'applied', `control receipts #${target.floor}`);
                    assert.deepEqual(eventIds([...rerank.events, ...admission.tail]), eventIds(recall.events), `control ordering #${target.floor}`);
                }
                requests[arm].sort((a, b) => a.requestHash.localeCompare(b.requestHash));
            }
            globalThis.fetch = () => { throw new Error('Network prohibited by admission screen'); };
            const rowById = new Map(compared.rows.map(row => [row.eventId, row]));
            const describe = row => ({ ...row, event: recall.events.find(item => item.event.id === row.eventId).event });
            const promptIds = new Set(built.evidenceTrace.prompt.map(row => row.unitId).filter(id => id?.startsWith('event:')).map(id => id.slice(6)));
            const result = {
                floor: target.floor, caseId: target.caseId, candidateCount: compared.rows.length,
                lexicalChannelVerified: true, controlPromptHash: sha(promptText),
                controlPromptText: promptText,
                controlHead: eventIds(compared.control.candidates), fusionHead: eventIds(compared.treatment.candidates),
                controlTail: eventIds(compared.control.tail), fusionTail: eventIds(compared.treatment.tail),
                promoted: compared.promoted.map(describe), displaced: compared.displaced.map(describe),
                displacedInControlPrompt: compared.displaced.filter(row => promptIds.has(row.eventId)).map(describe),
                rows: compared.rows, selectedFloors, lexicalEventIds: lexical.eventIds,
                knownMissingTarget: rowById.has('evt-61') ? describe(rowById.get('evt-61')) : null,
                requests, quality: { control: 'existing semantic review is reusable after exact prompt verification', fusion: 'unreviewed; pending exact rerank responses and assembly' },
            };
            await write(path.join(output, 'positions', `${target.floor}.json`), result);
            results.push({ floor: target.floor, candidates: result.candidateCount, promoted: result.promoted.length,
                displacedInControlPrompt: result.displacedInControlPrompt.map(row => row.eventId),
                target: result.knownMissingTarget && { denseRank: result.knownMissingTarget.denseRank,
                    fusionRank: result.knownMissingTarget.fusionRank, admitted: result.knownMissingTarget.treatmentAdmitted },
                controlReceiptHits: requests.control.filter(row => row.reusable).length,
                fusionReceiptHits: requests.fusion.filter(row => row.reusable).length,
                fusionRequests: requests.fusion.length });
            console.log(JSON.stringify(results.at(-1)));
        }
        const report = { status: 'admission-screen-complete-quality-pending', networkRequests: 0,
            positions: results, pendingUniqueRequests: pending.size,
            qualityPairsCompleted: 0,
            unchangedPairsEligibleForReviewReuse: results.filter(row => row.promoted === 0).map(row => row.floor),
            limitation: 'Admission is not information coverage. No changed fusion arm is graded before successful rerank and semantic review.' };
        await write(path.join(output, 'screen.json'), report);
        await write(path.join(output, 'pending-requests.json'), [...pending.values()]);
        return report;
    } finally { globalThis.fetch = nativeFetch; }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    const flags = Object.fromEntries(process.argv.slice(2).map(arg => arg.replace(/^--/, '').split(/=(.*)/s).slice(0, 2)));
    if (!flags['source-plan'] || !flags.output) throw new Error('Use --source-plan=<plan.json> --output=<directory>');
    console.log(JSON.stringify(await screenL2Admission({ repository: process.cwd(),
        sourcePlanPath: flags['source-plan'], output: path.resolve(flags.output) })));
}
