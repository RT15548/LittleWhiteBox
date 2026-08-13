/* global Buffer, process */
// Materialize the frozen dev matrix into one replay job per independent chat.

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

import { parseCasesJsonl, validateCase } from '../lib/cases.mjs';

const PLAN_SCHEMA_VERSION = 1;
const SUMMARY_DEFAULT_MAX_PER_RUN = 100;
const EMBEDDING_BATCH_SIZE = 20;
const RERANK_BATCH_SIZE = 20;
const RERANK_CANDIDATE_CAP = 60;
const L0_MAX_ATTEMPTS = 2;
const READER_MAX_ATTEMPTS = 3;

function sha256(value) {
    return createHash('sha256').update(value).digest('hex');
}

async function sha256File(filePath) {
    return sha256(await fs.readFile(filePath));
}

function toPosix(filePath) {
    return path.resolve(filePath).replace(/\\/g, '/');
}

async function writeAtomic(filePath, content) {
    const temp = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(temp, content, 'utf8');
    await fs.rename(temp, filePath);
}

function jsonLine(value) {
    return JSON.stringify(value);
}

function serializeSample(metadata, messages) {
    return `${[jsonLine(metadata || {}), ...messages.map(jsonLine)].join('\n')}\n`;
}

function serializeCases(cases) {
    return `${cases.map(jsonLine).join('\n')}\n`;
}

function safeId(prefix, value) {
    return `${prefix}-${sha256(String(value)).slice(0, 16)}`;
}

function estimateTokens(text) {
    const value = String(text || '');
    const chinese = (value.match(/[\u4e00-\u9fff]/g) || []).length;
    return Math.ceil(chinese + (value.length - chinese) / 4);
}

function splitSentences(text) {
    return String(text || '').split(/(?<=[。！？\n])|(?<=[.!?]\s)/).map(item => item.trim()).filter(Boolean);
}

function estimateMessageChunks(message, maxTokens = 200) {
    const text = String(message?.mes || '')
        .replace(/\[tts:[^\]]*\]/gi, '')
        .replace(/<state>[\s\S]*?<\/state>/gi, '')
        .trim();
    if (!text) return 0;
    if (estimateTokens(text) <= maxTokens) return 1;

    let chunks = 0;
    let currentTokens = 0;
    for (const sentence of splitSentences(text)) {
        const sentenceTokens = estimateTokens(sentence);
        if (sentenceTokens > maxTokens) {
            if (currentTokens > 0) chunks++;
            currentTokens = 0;
            chunks += Math.ceil(sentence.length / (maxTokens * 2));
            continue;
        }
        if (currentTokens > 0 && currentTokens + sentenceTokens > maxTokens) {
            chunks++;
            currentTokens = 0;
        }
        currentTokens += sentenceTokens;
    }
    if (currentTokens > 0) chunks++;
    return chunks;
}

function summaryBatchChars(messages, maxPerRun) {
    const batches = [];
    for (let start = 0; start < messages.length; start += maxPerRun) {
        const slice = messages.slice(start, start + maxPerRun);
        batches.push(slice.reduce((total, message, offset) => {
            const speaker = String(message?.name || (message?.is_user ? '用户' : '角色'));
            const marker = `#${start + offset + 1} 【${speaker}】\n`;
            return total + marker.length + String(message?.mes || '').length + 2;
        }, 0));
    }
    return batches;
}

export function estimateJobCost(messages, cases, { summaryMaxPerRun = SUMMARY_DEFAULT_MAX_PER_RUN } = {}) {
    const maxPerRun = Math.max(1, Math.trunc(Number(summaryMaxPerRun) || SUMMARY_DEFAULT_MAX_PER_RUN));
    const assistantRounds = messages.filter(message => !message?.is_user).length;
    const estimatedChunks = messages.reduce((sum, message) => sum + estimateMessageChunks(message), 0);
    const summaryChars = summaryBatchChars(messages, maxPerRun);
    const caseCount = cases.length;
    const rerankRequestsPerCase = Math.ceil(RERANK_CANDIDATE_CAP / RERANK_BATCH_SIZE);

    return {
        messages: messages.length,
        assistantRounds,
        sourceChars: messages.reduce((sum, message) => sum + String(message?.mes || '').length, 0),
        summary: {
            maxPerRun,
            requests: summaryChars.length,
            newHistoryChars: summaryChars.reduce((sum, count) => sum + count, 0),
            maxNewHistoryCharsPerRequest: Math.max(0, ...summaryChars),
            note: '不含随批次增长的 existing summary 与固定系统 Prompt；Summary 失败不自动重试。',
        },
        l0: {
            nominalGenerationRequests: assistantRounds,
            generationRequestCeilingWithRetry: assistantRounds * L0_MAX_ATTEMPTS,
            embeddingRequestsAtOneAtomPerRound: Math.ceil(assistantRounds / EMBEDDING_BATCH_SIZE),
            embeddingRequestCeilingAtTwoAtomsPerRound: Math.ceil((assistantRounds * 2) / EMBEDDING_BATCH_SIZE),
        },
        l1: {
            estimatedChunks,
            embeddingRequests: Math.ceil(estimatedChunks / EMBEDDING_BATCH_SIZE),
            note: '按正式 200-token chunk 规则估算；自定义过滤规则可能使实际值更低。',
        },
        l2: {
            embeddingRequests: null,
            note: '事件数量由真实 Summary 输出决定；bootstrap 后审计，不在 API 前凭空假定。',
        },
        recall: {
            cases: caseCount,
            embeddingRequestsMin: caseCount,
            embeddingRequestsMax: caseCount * 2,
            rerankRequestsMin: 0,
            rerankRequestsMax: caseCount * rerankRequestsPerCase,
        },
        reader: {
            requestsNominal: caseCount,
            requestCeilingWithRetry: caseCount * READER_MAX_ATTEMPTS,
        },
    };
}

function countByCategory(cases) {
    const counts = {};
    for (const item of cases) counts[item.category] = (counts[item.category] || 0) + 1;
    return counts;
}

function validateCluster(messages, cases, label) {
    if (!Array.isArray(messages) || messages.length === 0) throw new Error(`${label} 没有消息`);
    if (!Array.isArray(cases) || cases.length === 0) throw new Error(`${label} 没有 cases`);
    const seen = new Set();
    for (const [index, rawCase] of cases.entries()) {
        const validated = validateCase(rawCase, index + 1);
        if (!validated.ok) throw new Error(`${label}: ${validated.errors.join('; ')}`);
        if (seen.has(validated.case.id)) throw new Error(`${label}: case id 重复 ${validated.case.id}`);
        seen.add(validated.case.id);
        if (validated.case.atFloor !== messages.length - 1) {
            throw new Error(`${label}: ${validated.case.id} atFloor=${validated.case.atFloor} boundary=${messages.length - 1}`);
        }
        for (const floors of Object.values(validated.case.evidence)) {
            if (floors.some(floor => floor >= messages.length)) {
                throw new Error(`${label}: ${validated.case.id} evidence 越界`);
            }
        }
    }
}

async function materializeJob({ outputDir, source, lane, clusterId, metadata, messages, cases, summaryMaxPerRun }) {
    validateCluster(messages, cases, `${source}/${clusterId}`);
    const prefix = {
        'longmemeval-oracle-v1': 'lme-oracle',
        'longmemeval-s-stress-v1': 'lme-stress',
        locomo10: 'locomo',
    }[source] || source;
    const jobId = safeId(prefix, clusterId);
    const jobDir = path.join(outputDir, 'jobs', jobId);
    const sampleText = serializeSample(metadata, messages);
    const casesText = serializeCases(cases);
    const samplePath = path.join(jobDir, 'sample.jsonl');
    const casesPath = path.join(jobDir, 'cases.jsonl');
    await writeAtomic(samplePath, sampleText);
    await writeAtomic(casesPath, casesText);
    return {
        id: jobId,
        source,
        lane,
        clusterId: String(clusterId),
        sample: { path: toPosix(samplePath), sha256: sha256(sampleText), bytes: Buffer.byteLength(sampleText) },
        cases: {
            path: toPosix(casesPath),
            sha256: sha256(casesText),
            bytes: Buffer.byteLength(casesText),
            count: cases.length,
            byCategory: countByCategory(cases),
        },
        boundaryFloor: messages.length - 1,
        estimate: estimateJobCost(messages, cases, { summaryMaxPerRun }),
    };
}

async function loadControlledJob({ outputDir, controlledDir, world, summaryMaxPerRun }) {
    const samplePath = path.join(controlledDir, `${world}.jsonl`);
    const casesPath = path.join(controlledDir, `${world}-cases.jsonl`);
    const [sampleText, casesText] = await Promise.all([
        fs.readFile(samplePath, 'utf8'),
        fs.readFile(casesPath, 'utf8'),
    ]);
    const rows = sampleText.trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
    const messages = rows.slice(1);
    const parsed = parseCasesJsonl(casesText);
    if (parsed.errors.length) throw new Error(parsed.errors.join('\n'));
    validateCluster(messages, parsed.cases, `controlled-cn-v1/${world}`);
    return {
        id: `controlled-${world}`,
        source: 'controlled-cn-v1',
        lane: 'screening',
        clusterId: world,
        sample: { path: toPosix(samplePath), sha256: sha256(sampleText), bytes: Buffer.byteLength(sampleText) },
        cases: {
            path: toPosix(casesPath),
            sha256: sha256(casesText),
            bytes: Buffer.byteLength(casesText),
            count: parsed.cases.length,
            byCategory: countByCategory(parsed.cases),
        },
        boundaryFloor: messages.length - 1,
        estimate: estimateJobCost(messages, parsed.cases, { summaryMaxPerRun }),
        materializedBy: toPosix(outputDir),
    };
}

function sumJobs(jobs) {
    const total = {
        jobs: jobs.length,
        cases: 0,
        messages: 0,
        sourceChars: 0,
        summaryRequests: 0,
        l0GenerationRequestsNominal: 0,
        l0GenerationRequestCeilingWithRetry: 0,
        l0EmbeddingRequestsAtOneAtomPerRound: 0,
        l0EmbeddingRequestCeilingAtTwoAtomsPerRound: 0,
        l1EmbeddingRequests: 0,
        recallEmbeddingRequestsMin: 0,
        recallEmbeddingRequestsMax: 0,
        recallRerankRequestsMax: 0,
        readerRequestsNominal: 0,
        readerRequestCeilingWithRetry: 0,
    };
    for (const job of jobs) {
        const cost = job.estimate;
        total.cases += job.cases.count;
        total.messages += cost.messages;
        total.sourceChars += cost.sourceChars;
        total.summaryRequests += cost.summary.requests;
        total.l0GenerationRequestsNominal += cost.l0.nominalGenerationRequests;
        total.l0GenerationRequestCeilingWithRetry += cost.l0.generationRequestCeilingWithRetry;
        total.l0EmbeddingRequestsAtOneAtomPerRound += cost.l0.embeddingRequestsAtOneAtomPerRound;
        total.l0EmbeddingRequestCeilingAtTwoAtomsPerRound += cost.l0.embeddingRequestCeilingAtTwoAtomsPerRound;
        total.l1EmbeddingRequests += cost.l1.embeddingRequests;
        total.recallEmbeddingRequestsMin += cost.recall.embeddingRequestsMin;
        total.recallEmbeddingRequestsMax += cost.recall.embeddingRequestsMax;
        total.recallRerankRequestsMax += cost.recall.rerankRequestsMax;
        total.readerRequestsNominal += cost.reader.requestsNominal;
        total.readerRequestCeilingWithRetry += cost.reader.requestCeilingWithRetry;
    }
    return total;
}

function groupSummary(jobs) {
    const bySource = {};
    const byLane = {};
    for (const source of new Set(jobs.map(job => job.source))) {
        bySource[source] = sumJobs(jobs.filter(job => job.source === source));
    }
    for (const lane of new Set(jobs.map(job => job.lane))) {
        byLane[lane] = sumJobs(jobs.filter(job => job.lane === lane));
    }
    return { total: sumJobs(jobs), bySource, byLane };
}

function safeApi(api = {}) {
    return {
        provider: String(api.provider || 'custom'),
        url: String(api.url || ''),
        model: String(api.model || ''),
    };
}

export function sanitizeExecutionProfile(config, reader = null) {
    const profile = {
        summary: {
            ...safeApi(config?.summaryApi),
            maxPerRun: Math.max(1, Math.trunc(Number(config?.summaryApi?.maxPerRun) || SUMMARY_DEFAULT_MAX_PER_RUN)),
            maxTokens: config?.summaryApi?.maxTokens ?? null,
            reasoningEffort: String(config?.summaryApi?.reasoningEffort || ''),
            prefillMode: String(config?.summaryApi?.prefillMode || 'assistant'),
            useStream: config?.summaryApi?.useStream !== false,
            temperature: config?.summaryApi?.temperature ?? null,
        },
        vector: {
            enabled: config?.vectorConfig?.enabled === true,
            l0Concurrency: Math.max(1, Math.trunc(Number(config?.vectorConfig?.l0Concurrency) || 10)),
            l0: safeApi(config?.vectorConfig?.l0Api),
            embedding: safeApi(config?.vectorConfig?.embeddingApi),
            rerank: safeApi(config?.vectorConfig?.rerankApi),
        },
        recallPacing: {
            minMs: Math.max(1, Math.trunc(Number(config?.goldEval?.caseIntervalMinMs) || 12000)),
            maxMs: Math.max(1, Math.trunc(Number(config?.goldEval?.caseIntervalMaxMs) || 15000)),
            scope: 'global across cluster jobs and within each job',
        },
        reader: reader ? {
            api: safeApi(reader.api),
            maxTokens: Number(reader.maxTokens) || 30000,
            reasoningEffort: String(reader.reasoningEffort || 'low'),
            concurrency: Math.max(1, Math.min(8, Number(reader.concurrency) || 4)),
            maxAttempts: Math.max(1, Number(reader.maxAttempts) || READER_MAX_ATTEMPTS),
        } : null,
    };
    return { ...profile, fingerprint: sha256(JSON.stringify(profile)) };
}

export async function prepareBaselinePlan({
    outputDir,
    controlledDir,
    publicDir,
    studyRef,
    executionProfile,
}) {
    if (!executionProfile?.vector?.enabled) throw new Error('baseline plan 需要启用 vector');
    const summaryMaxPerRun = executionProfile.summary.maxPerRun;
    const jobs = [];
    jobs.push(await loadControlledJob({ outputDir, controlledDir, world: 'modern', summaryMaxPerRun }));
    jobs.push(await loadControlledJob({ outputDir, controlledDir, world: 'fantasy', summaryMaxPerRun }));

    const [oracleText, stressText, locomoText] = await Promise.all([
        fs.readFile(path.join(publicDir, 'longmemeval-oracle-v1-catalog.json'), 'utf8'),
        fs.readFile(path.join(publicDir, 'longmemeval-s-stress-v1-catalog.json'), 'utf8'),
        fs.readFile(path.join(publicDir, 'locomo10-v1-catalog.json'), 'utf8'),
    ]);
    const oracle = JSON.parse(oracleText);
    const stress = JSON.parse(stressText);
    const locomo = JSON.parse(locomoText);

    for (const item of oracle.items) {
        jobs.push(await materializeJob({
            outputDir, source: 'longmemeval-oracle-v1', lane: 'full-dev', clusterId: item.clusterId,
            metadata: item.metadata, messages: item.messages, cases: [item.case], summaryMaxPerRun,
        }));
    }
    for (const item of stress.items) {
        jobs.push(await materializeJob({
            outputDir, source: 'longmemeval-s-stress-v1', lane: 'stress', clusterId: item.clusterId,
            metadata: item.metadata, messages: item.messages, cases: [item.case], summaryMaxPerRun,
        }));
    }
    const casesByCluster = new Map();
    for (const item of locomo.cases) {
        if (!casesByCluster.has(item.clusterId)) casesByCluster.set(item.clusterId, []);
        casesByCluster.get(item.clusterId).push(item.case);
    }
    for (const cluster of locomo.clusters) {
        const cases = casesByCluster.get(cluster.clusterId) || [];
        if (!cases.length) continue;
        jobs.push(await materializeJob({
            outputDir, source: 'locomo10', lane: 'full-dev', clusterId: cluster.clusterId,
            metadata: cluster.metadata, messages: cluster.messages, cases, summaryMaxPerRun,
        }));
    }

    jobs.sort((a, b) => a.id.localeCompare(b.id));
    const sourceFiles = await Promise.all([
        path.join(controlledDir, 'manifest.json'),
        path.join(publicDir, 'longmemeval-oracle-v1-manifest.json'),
        path.join(publicDir, 'longmemeval-s-stress-v1-manifest.json'),
        path.join(publicDir, 'locomo10-v1-manifest.json'),
    ].map(async filePath => ({ path: toPosix(filePath), sha256: await sha256File(filePath) })));
    const manifest = {
        schemaVersion: PLAN_SCHEMA_VERSION,
        planId: 'story-summary-baseline-v1',
        policy: {
            productionBehavior: 'frozen',
            fallbackQualityScoring: 'forbidden',
            externalError: 'stop campaign; invalidate only current attempt; retry same job later',
            laneOrder: ['screening', 'full-dev', 'stress'],
            fullDevTiming: 'only after independently screened hypotheses are combined',
            holdout: 'not included',
        },
        study: studyRef,
        executionProfile,
        sources: sourceFiles,
        existingBaseline: studyRef?.existingBaseline || null,
        jobs,
        summary: groupSummary(jobs),
    };
    const content = `${JSON.stringify(manifest, null, 2)}\n`;
    const planPath = path.join(outputDir, 'plan.json');
    await writeAtomic(planPath, content);
    return {
        plan: manifest,
        path: toPosix(planPath),
        sha256: sha256(content),
        bytes: Buffer.byteLength(content),
    };
}

export async function auditBaselinePlan(planPath) {
    const text = await fs.readFile(planPath, 'utf8');
    const plan = JSON.parse(text);
    if (plan.schemaVersion !== PLAN_SCHEMA_VERSION) throw new Error(`不支持的 baseline plan schema: ${plan.schemaVersion}`);
    const checks = [];
    for (const ref of [...(plan.sources || []), ...plan.jobs.flatMap(job => [job.sample, job.cases])]) {
        const actual = await sha256File(ref.path);
        checks.push({ path: ref.path, expected: ref.sha256, actual, ok: actual === ref.sha256 });
    }
    const ids = plan.jobs.map(job => job.id);
    const uniqueIds = new Set(ids).size === ids.length;
    const counts = groupSummary(plan.jobs);
    const summaryMatches = JSON.stringify(counts) === JSON.stringify(plan.summary);
    return {
        ok: checks.every(check => check.ok) && uniqueIds && summaryMatches,
        planHash: sha256(text),
        jobs: plan.jobs.length,
        cases: counts.total.cases,
        checks,
        invariants: { uniqueJobIds: uniqueIds, summaryRecomputed: summaryMatches },
        plan,
    };
}
