/* global process */

import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getDefaultApiPrefix, resolveApiBaseUrl } from '../../../shared/common/openai-url-utils.js';
import { loadGoldCapture } from '../lib/run-store.mjs';

const DENSE_LIMIT = 60;
const RERANK_LIMIT = 20;
const RERANK_MIN_SCORE = 0.10;
const BATCH_SIZE = 20;
const DEFAULT_INTERVAL_MIN_MS = 12000;
const DEFAULT_INTERVAL_MAX_MS = 15000;

function sha256(value) {
    return createHash('sha256').update(String(value || ''), 'utf8').digest('hex');
}

function eventFloors(summary) {
    const match = String(summary || '').match(/\(#(\d+)(?:-(\d+))?\)/);
    if (!match) return [];
    const start = Math.max(0, Number(match[1]) - 1);
    const end = Math.max(start, Number(match[2] || match[1]) - 1);
    const floors = [];
    for (let floor = start; floor <= end; floor += 1) floors.push(floor);
    return floors;
}

function formatEventUnit(event) {
    const time = String(event?.timeLabel || '').trim();
    const title = String(event?.title || event?.id || '事件').trim();
    const people = (event?.participants || []).map(String).map(item => item.trim()).filter(Boolean);
    const summary = String(event?.summary || '').trim();
    const heading = time ? `【${time}】${title}` : title;
    return [
        `[补充事件] ${heading}`,
        people.length ? `  ${people.join(' / ')}` : '',
        summary ? `  ${summary}` : '',
    ].filter(Boolean).join('\n');
}

export function buildQueryEventCandidates({
    allEvents,
    eventScoreEntries,
    minimumSimilarity,
    excludedIds,
    limit = DENSE_LIMIT,
}) {
    const scores = new Map((eventScoreEntries || [])
        .filter(item => Array.isArray(item) && item[0] && Number.isFinite(Number(item[1])))
        .map(item => [String(item[0]), Number(item[1])]));
    const excluded = excludedIds instanceof Set ? excludedIds : new Set(excludedIds || []);
    const minimum = Number(minimumSimilarity || 0);
    return (allEvents || [])
        .map((event, sourceIndex) => ({
            event,
            sourceIndex,
            denseScore: Number(scores.get(String(event?.id || '')) || 0),
        }))
        .filter(item => item.event?.id && item.event?.summary)
        .filter(item => !excluded.has(`event:${item.event.id}`))
        .filter(item => item.denseScore >= minimum)
        .sort((left, right) => right.denseScore - left.denseScore || left.sourceIndex - right.sourceIndex)
        .slice(0, limit)
        .map((item, denseIndex) => ({
            ...item,
            denseRank: denseIndex + 1,
            text: formatEventUnit(item.event),
        }));
}

export function estimateScreenTokens(text) {
    if (!text) return 0;
    const value = String(text);
    const cjk = (value.match(/[\u4e00-\u9fff]/g) || []).length;
    return Math.ceil(cjk + (value.length - cjk) / 4);
}

function renderPacked(items) {
    if (!items.length) return '';
    return `<补充记忆>\n${items.map(item => item.text).join('\n\n')}\n</补充记忆>`;
}

export function packQueryEventCandidates(candidates, budget) {
    const limit = Math.max(0, Math.floor(Number(budget || 0)));
    const selected = [];
    let text = '';
    let tokens = 0;
    for (const candidate of candidates || []) {
        const trial = [...selected, candidate];
        const trialText = renderPacked(trial);
        const trialTokens = estimateScreenTokens(trialText);
        if (trialTokens > limit) continue;
        selected.push(candidate);
        text = trialText;
        tokens = trialTokens;
    }
    return { selected, text, tokens, budget: limit };
}

function coreEventIds(promptRow) {
    return new Set((promptRow?.evidenceTrace?.prompt || [])
        .map(item => String(item?.unitId || ''))
        .filter(id => id.startsWith('event:')));
}

function deterministicInterval(sampleHash, floor, minMs, maxMs) {
    if (minMs === maxMs) return minMs;
    const seed = Number.parseInt(String(sampleHash || '').slice(0, 8), 16) ^ Number(floor || 0);
    return minMs + ((seed >>> 0) % (maxMs - minMs + 1));
}

async function waitForCadence({ previousStartedAt, intervalMs, clock, wait }) {
    if (previousStartedAt == null) return;
    let remaining = intervalMs - (clock() - previousStartedAt);
    while (remaining > 0) {
        await wait(remaining);
        remaining = intervalMs - (clock() - previousStartedAt);
    }
}

async function rerankBatch({ api, query, candidates, batchIndex, fetchImpl }) {
    const body = JSON.stringify({
        model: api.model,
        query,
        documents: candidates.map(item => item.text),
        top_n: candidates.length,
        return_documents: false,
    });
    const startedAt = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetchImpl(`${api.baseUrl}/rerank`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${api.key}`,
                'Content-Type': 'application/json',
            },
            body,
            signal: controller.signal,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(`Rerank HTTP ${response.status}`);
        const results = payload?.results;
        if (!Array.isArray(results) || results.length !== candidates.length) {
            throw new Error(`Rerank 结果不完整: batch=${batchIndex}`);
        }
        const indexes = new Set();
        const rows = results.map(item => {
            const index = Number(item?.index);
            const score = Number(item?.relevance_score);
            if (!Number.isInteger(index) || index < 0 || index >= candidates.length
                || indexes.has(index) || !Number.isFinite(score)) {
                throw new Error(`Rerank 结果身份无效: batch=${batchIndex}`);
            }
            indexes.add(index);
            return { candidate: candidates[index], score };
        });
        return {
            rows,
            trace: {
                batchIndex,
                requestHash: sha256(body),
                documents: candidates.length,
                status: response.status,
                elapsedMs: Math.round(performance.now() - startedAt),
            },
        };
    } finally {
        clearTimeout(timeoutId);
    }
}

async function rerankCandidates({ api, query, candidates, fetchImpl }) {
    const batches = [];
    for (let offset = 0; offset < candidates.length; offset += BATCH_SIZE) {
        batches.push(candidates.slice(offset, offset + BATCH_SIZE));
    }
    const results = await Promise.all(batches.map((batch, batchIndex) => rerankBatch({
        api,
        query,
        candidates: batch,
        batchIndex,
        fetchImpl,
    })));
    const ranked = results
        .flatMap(result => result.rows)
        .sort((left, right) => right.score - left.score || left.candidate.denseRank - right.candidate.denseRank)
        .filter(item => item.score >= RERANK_MIN_SCORE)
        .slice(0, RERANK_LIMIT)
        .map((item, index) => ({
            id: `event:${item.candidate.event.id}`,
            eventId: item.candidate.event.id,
            text: item.candidate.text,
            floors: eventFloors(item.candidate.event.summary),
            denseRank: item.candidate.denseRank,
            denseScore: item.candidate.denseScore,
            rerankRank: index + 1,
            rerankScore: item.score,
        }));
    return { ranked, trace: results.map(result => result.trace) };
}

export async function runQueryEventRecoveryScreen({
    runDir,
    configPath,
    fetchImpl = globalThis.fetch,
    clock = () => Date.now(),
    wait = delayMs => new Promise(resolve => setTimeout(resolve, delayMs)),
    intervalMinMs = DEFAULT_INTERVAL_MIN_MS,
    intervalMaxMs = DEFAULT_INTERVAL_MAX_MS,
}) {
    const capture = await loadGoldCapture(path.resolve(runDir));
    if (capture.manifest.mode !== 'story-summary-replay-natural-recall') {
        throw new Error('screen 输入必须是 valid natural-recall run');
    }
    const localConfig = JSON.parse(await fs.readFile(path.resolve(configPath), 'utf8'));
    const rerankApi = localConfig?.vectorConfig?.rerankApi || {};
    if (!rerankApi.key) throw new Error('Rerank API key 缺失');
    const api = {
        baseUrl: resolveApiBaseUrl(
            String(rerankApi.url || ''),
            getDefaultApiPrefix(rerankApi.provider || 'custom'),
        ),
        model: String(rerankApi.model || ''),
        key: String(rerankApi.key),
    };
    const targetByFloor = new Map([
        [115, ['evt-34']],
        [207, ['evt-52', 'evt-68', 'evt-73']],
        [643, ['evt-195']],
    ]);
    const checkpointDir = path.join(capture.runDir, 'checkpoints');
    const checkpointNames = (await fs.readdir(checkpointDir)).sort();
    const checkpoints = new Map();
    for (const name of checkpointNames) {
        const checkpoint = JSON.parse(await fs.readFile(path.join(checkpointDir, name), 'utf8'));
        checkpoints.set(checkpoint.caseId, checkpoint);
    }

    const rows = [];
    const trace = [];
    let previousStartedAt = null;
    for (let index = 0; index < capture.cases.length; index += 1) {
        const goldCase = capture.cases[index];
        const queryFloor = Number(goldCase?.query?.floor);
        const targetEventIds = targetByFloor.get(queryFloor);
        if (!targetEventIds) continue;
        const intervalMs = deterministicInterval(
            capture.manifest.data.sampleHash,
            queryFloor,
            intervalMinMs,
            intervalMaxMs,
        );
        await waitForCadence({ previousStartedAt, intervalMs, clock, wait });
        previousStartedAt = clock();

        const promptInput = capture.promptInputs[index]?.production?.recallResult || {};
        const enrichment = promptInput.enrichmentContext || {};
        const snapshotPath = capture.promptInputs[index]?.boundarySnapshot?.path;
        const snapshot = JSON.parse(await fs.readFile(path.resolve(snapshotPath), 'utf8'));
        const checkpoint = checkpoints.get(goldCase.id);
        if (!checkpoint?.replayCase?.enrichment) throw new Error(`screen 缺少 checkpoint: ${goldCase.id}`);
        const candidates = buildQueryEventCandidates({
            allEvents: snapshot?.summary?.store?.json?.events || [],
            eventScoreEntries: enrichment.eventScoreEntries || [],
            minimumSimilarity: enrichment.eventMinimumSimilarity,
            excludedIds: coreEventIds(capture.prompts[index]),
        });
        const reranked = await rerankCandidates({
            api,
            query: String(enrichment.rerankQuery || enrichment.focusQuery || ''),
            candidates,
            fetchImpl,
        });
        trace.push(...reranked.trace.map(item => ({ caseId: goldCase.id, ...item })));
        const packed = packQueryEventCandidates(
            reranked.ranked,
            checkpoint.replayCase.enrichment.budget,
        );
        const packedIds = new Set(packed.selected.map(item => item.eventId));
        const rankedById = new Map(reranked.ranked.map(item => [item.eventId, item]));
        rows.push({
            caseId: goldCase.id,
            queryFloor,
            intervalMs,
            budget: packed.budget,
            packedTokens: packed.tokens,
            candidates: candidates.length,
            admitted: reranked.ranked.length,
            packed: packed.selected.length,
            targets: targetEventIds.map(eventId => ({
                eventId,
                denseRank: candidates.find(item => item.event.id === eventId)?.denseRank || null,
                rerankRank: rankedById.get(eventId)?.rerankRank || null,
                rerankScore: rankedById.get(eventId)?.rerankScore ?? null,
                admitted: rankedById.has(eventId),
                packed: packedIds.has(eventId),
            })),
        });
    }
    const targets = rows.flatMap(row => row.targets);
    const passed = trace.length === 9 && targets.length === 5 && targets.every(item => item.admitted && item.packed);
    return {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        experimentId: 'H-QUERY-EVENT-RECOVERY-SCREEN-v1',
        status: passed ? 'passed' : 'failed',
        sourceRunId: capture.manifest.runId,
        api: {
            host: new URL(api.baseUrl).host,
            model: api.model,
            externalCalls: trace.length,
        },
        contract: {
            denseMinimum: 0.6,
            denseLimit: DENSE_LIMIT,
            rerankLimit: RERANK_LIMIT,
            rerankMinimumScore: RERANK_MIN_SCORE,
            batchSize: BATCH_SIZE,
            intervalMinMs,
            intervalMaxMs,
        },
        rows,
        trace,
        passed,
    };
}

async function main() {
    const runDir = process.argv[2];
    const configPath = process.argv[3];
    if (!runDir || !configPath) {
        throw new Error('用法: query-event-recovery-screen.mjs <candidate-run-dir> <local-config>');
    }
    const result = await runQueryEventRecoveryScreen({ runDir, configPath });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (!result.passed) process.exitCode = 2;
}

const isMain = process.argv[1]
    && path.basename(process.argv[1]) === path.basename(fileURLToPath(import.meta.url));
if (isMain) {
    main().catch(error => {
        process.stderr.write(`${error?.stack || error}\n`);
        process.exitCode = 1;
    });
}
