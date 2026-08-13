/* global process */

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';

import { callSummaryApi } from '../../story-summary-replay/api-client.mjs';
import { describeApi } from '../replay-session.mjs';
import { CASE_CATEGORIES, parseCasesJsonl } from '../lib/cases.mjs';
import {
    buildGoldCase,
    parseDiscoveryResponse,
    parseSynthesisResponse,
    parseVerifierResponse,
} from './schema.mjs';
import {
    AUTHORING_PROMPT_VERSION,
    SYNTHESIS_PROMPT_VERSION,
    SUPPLEMENT_PROMPT_VERSION,
    VERIFIER_PROMPT_VERSION,
    buildDiscoveryMessages,
    buildSupplementMessages,
    buildSynthesisMessages,
    buildVerifierMessages,
} from './prompts.mjs';
import { loadSourceChat, planSourceWindows, renderSourceRange } from './source.mjs';
import {
    pathExists,
    readJson,
    readJsonl,
    writeJson,
    writeJsonl,
    writeText,
} from './storage.mjs';

const MANIFEST_FILE = 'manifest.json';
const DISCOVERY_TASKS_FILE = 'discovery-tasks.jsonl';
const PLAN_FILE = 'PLAN.md';

function sha256Text(text) {
    return createHash('sha256').update(String(text || ''), 'utf8').digest('hex');
}

function serializeJsonl(rows) {
    const content = (rows || []).map(row => JSON.stringify(row)).join('\n');
    return content ? `${content}\n` : '';
}

function positiveInteger(value, name) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${name} 必须是正整数`);
    return parsed;
}

function resultPath(runDir, stage, taskId) {
    return path.join(runDir, 'results', stage, `${taskId}.json`);
}

async function loadSummaryApi(configPath, override = {}) {
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    if (!config.summaryApi || typeof config.summaryApi !== 'object') {
        throw new Error(`配置 ${configPath} 缺少 summaryApi`);
    }
    const keyEnv = String(override.keyEnv || '').trim();
    const environmentKey = keyEnv ? String(process.env[keyEnv] || '') : '';
    if (keyEnv && !environmentKey) throw new Error(`环境变量 ${keyEnv} 不存在或为空`);
    return {
        ...config.summaryApi,
        ...(override.provider ? { provider: String(override.provider) } : {}),
        ...(override.url ? { url: String(override.url) } : {}),
        ...(override.model ? { model: String(override.model) } : {}),
        ...(keyEnv ? { key: environmentKey } : {}),
    };
}

function describeAuthoringApi(apiConfig) {
    const described = describeApi(apiConfig);
    let endpointBase = '';
    try {
        const parsed = new URL(String(apiConfig?.url || ''));
        endpointBase = `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
    } catch {}
    return { ...described, endpointBase };
}

function apiOverrideFromManifest(manifest) {
    return {
        provider: manifest.api.provider,
        url: manifest.api.endpointBase,
        model: manifest.api.model,
        ...(manifest.credential?.type === 'environment'
            ? { keyEnv: manifest.credential.name }
            : {}),
    };
}

async function assertSourceMatches(manifest) {
    const chat = await loadSourceChat(manifest.source.path);
    if (chat.sha256 !== manifest.source.sha256) {
        throw new Error('原始聊天哈希与 manifest 不一致，拒绝继续');
    }
    if (chat.lastFloor !== manifest.source.atFloor) {
        throw new Error('原始聊天最后楼层与 manifest 不一致，拒绝继续');
    }
    return chat;
}

function assertApiMatches(manifest, apiConfig) {
    const actual = describeAuthoringApi(apiConfig);
    if (JSON.stringify(actual) !== JSON.stringify(manifest.api)) {
        throw new Error('当前 summaryApi 的 provider/host/model 与 authoring manifest 不一致，拒绝调用 API');
    }
}

async function readSuccessfulResult(filePath) {
    if (!await pathExists(filePath)) return null;
    const result = await readJson(filePath);
    return result.status === 'ok' ? result : null;
}

async function archiveExistingError(filePath) {
    if (!await pathExists(filePath)) return;
    const existing = await readJson(filePath);
    if (existing.status !== 'error') return;
    const stage = path.basename(path.dirname(filePath));
    const taskId = path.basename(filePath, '.json');
    const timestamp = String(existing.startedAt || new Date().toISOString()).replace(/[:.]/g, '-');
    const archivePath = path.join(
        path.dirname(path.dirname(path.dirname(filePath))),
        'errors',
        stage,
        `${taskId}-${timestamp}.json`,
    );
    if (!await pathExists(archivePath)) {
        await fs.mkdir(path.dirname(archivePath), { recursive: true });
        await fs.copyFile(filePath, archivePath);
    }
}

async function recoverExistingError(filePath, requestHash, parse) {
    if (!await pathExists(filePath)) return null;
    const existing = await readJson(filePath);
    if (existing.status !== 'error' || existing.requestHash !== requestHash || !existing.responseText) return null;
    let parsed;
    try {
        parsed = parse(existing.responseText);
    } catch {
        return null;
    }
    await archiveExistingError(filePath);
    const recovered = {
        ...existing,
        status: 'ok',
        recoveredAt: new Date().toISOString(),
        parsed,
    };
    delete recovered.error;
    await writeJson(filePath, recovered);
    return recovered;
}

function generationArgsFromManifest(manifest) {
    const generation = manifest.authoring.generation;
    return {
        temperature: generation.temperature,
        max_tokens: generation.maxTokens,
        reasoning_effort: generation.reasoningEffort,
    };
}

async function callAndStore({ apiConfig, messages, generationArgs, filePath, parse, metadata }) {
    const promptHash = sha256Text(JSON.stringify(messages));
    const requestHash = sha256Text(JSON.stringify({ api: metadata.api, generationArgs, messages }));
    const recovered = await recoverExistingError(filePath, requestHash, parse);
    if (recovered) return recovered;
    await archiveExistingError(filePath);
    const startedAt = new Date().toISOString();
    const started = performance.now();
    let responseText = null;
    try {
        responseText = await callSummaryApi(apiConfig, messages, generationArgs);
        const parsed = parse(responseText);
        const result = {
            ...metadata,
            status: 'ok',
            startedAt,
            durationMs: Math.round(performance.now() - started),
            promptHash,
            requestHash,
            responseText,
            parsed,
        };
        await writeJson(filePath, result);
        return result;
    } catch (error) {
        await writeJson(filePath, {
            ...metadata,
            status: 'error',
            startedAt,
            durationMs: Math.round(performance.now() - started),
            promptHash,
            requestHash,
            error: String(error?.message || error),
            ...(responseText == null ? {} : { responseText }),
        });
        throw error;
    }
}

export async function prepareAuthoringRun(options) {
    const samplePath = path.resolve(String(options.samplePath || ''));
    const workspaceRoot = path.resolve(String(options.workspaceRoot || ''));
    const dataset = String(options.dataset || '').trim();
    const split = String(options.split || 'dev').trim();
    const runName = String(options.runName || `${dataset}-${split}-${AUTHORING_PROMPT_VERSION}`).trim();
    const windowSize = positiveInteger(options.windowSize ?? 80, 'windowSize');
    const overlap = Number(options.overlap ?? 20);
    const maxCandidates = positiveInteger(options.maxCandidates ?? 5, 'maxCandidates');
    const maxClaims = positiveInteger(options.maxClaims ?? 10, 'maxClaims');
    const synthesisMaxCandidates = positiveInteger(options.synthesisMaxCandidates ?? 12, 'synthesisMaxCandidates');
    const supplementMaxCandidates = 3;
    if (!dataset) throw new Error('dataset 不能为空');
    if (!['dev', 'holdout'].includes(split)) throw new Error('authoring split 只能是 dev 或 holdout');
    if (!Number.isInteger(overlap) || overlap < 0 || overlap >= windowSize) {
        throw new Error('overlap 必须是 0 到 windowSize-1 的整数');
    }

    const [chat, apiConfig] = await Promise.all([
        loadSourceChat(samplePath),
        loadSummaryApi(path.resolve(options.configPath), options.apiOverride),
    ]);
    const atFloor = options.atFloor == null ? chat.lastFloor : Number(options.atFloor);
    if (atFloor !== chat.lastFloor) {
        throw new Error(`当前 authoring 要求 atFloor 等于完整样本最后楼层 ${chat.lastFloor}`);
    }
    const windows = planSourceWindows(chat.messageCount, { windowSize, overlap });
    const baseTasks = windows.map((window, index) => ({
        taskId: `window-${String(index + 1).padStart(3, '0')}`,
        ...window,
        sourceSha256: chat.sha256,
    }));
    const api = describeAuthoringApi(apiConfig);
    const supplementMaximum = CASE_CATEGORIES.length;
    const maximumCandidateCount = baseTasks.length * maxCandidates
        + synthesisMaxCandidates
        + supplementMaximum * supplementMaxCandidates;
    const verificationMax = maximumCandidateCount;
    const runDir = path.join(workspaceRoot, 'authoring', runName);
    const manifest = {
        schemaVersion: 1,
        runId: runName,
        createdAt: new Date().toISOString(),
        dataset,
        split,
        workspaceRoot,
        source: {
            path: samplePath,
            sha256: chat.sha256,
            bytes: chat.byteLength,
            messageCount: chat.messageCount,
            atFloor,
        },
        api,
        credential: options.apiOverride?.keyEnv
            ? { type: 'environment', name: String(options.apiOverride.keyEnv) }
            : { type: 'config', field: 'summaryApi.key' },
        authoring: {
            promptVersion: AUTHORING_PROMPT_VERSION,
            synthesisPromptVersion: SYNTHESIS_PROMPT_VERSION,
            supplementPromptVersion: SUPPLEMENT_PROMPT_VERSION,
            verifierPromptVersion: VERIFIER_PROMPT_VERSION,
            windowSize,
            overlap,
            maxCandidates,
            maxClaims,
            synthesisMaxCandidates,
            supplementMaxCandidates,
            verificationIsolation: 'one-candidate-per-request',
            generation: {
                temperature: 0,
                maxTokens: 4096,
                reasoningEffort: 'none',
            },
        },
        requestBudget: {
            discovery: baseTasks.length,
            synthesis: 1,
            supplementMaximum,
            verificationMaximum: verificationMax,
            totalMaximum: baseTasks.length + 1 + supplementMaximum + verificationMax,
        },
    };
    const tasks = baseTasks.map(task => ({
        ...task,
        promptSha256: sha256Text(JSON.stringify(buildDiscoveryMessages({ chat, task, manifest }))),
    }));
    const tasksText = tasks.map(task => JSON.stringify(task)).join('\n') + '\n';
    manifest.artifacts = { discoveryTasksSha256: sha256Text(tasksText) };

    const manifestPath = path.join(runDir, MANIFEST_FILE);
    if (await pathExists(manifestPath)) {
        const existing = await readJson(manifestPath);
        const stable = value => JSON.stringify({ ...value, createdAt: null });
        if (stable(existing) !== stable(manifest)) {
            throw new Error(`authoring run 已存在且配置不同: ${runDir}`);
        }
        const existingTasks = await readJsonl(path.join(runDir, DISCOVERY_TASKS_FILE));
        if (JSON.stringify(existingTasks) !== JSON.stringify(tasks)) {
            throw new Error(`authoring run 的任务清单与当前冻结请求不同: ${runDir}`);
        }
        return { runDir, manifest: existing, tasks, alreadyPrepared: true };
    }

    await writeJson(manifestPath, manifest);
    await writeJsonl(path.join(runDir, DISCOVERY_TASKS_FILE), tasks);
    await writeText(path.join(runDir, PLAN_FILE), renderPlan(manifest, tasks));
    return { runDir, manifest, tasks, alreadyPrepared: false };
}

export async function runDiscovery({ runDir, configPath, limit = Infinity }) {
    const manifest = await readJson(path.join(runDir, MANIFEST_FILE));
    const [chat, apiConfig, tasks] = await Promise.all([
        assertSourceMatches(manifest),
        loadSummaryApi(configPath, apiOverrideFromManifest(manifest)),
        readJsonl(path.join(runDir, DISCOVERY_TASKS_FILE)),
    ]);
    const selected = [];
    assertApiMatches(manifest, apiConfig);
    for (const task of tasks) {
        if (selected.length >= limit) break;
        if (!await readSuccessfulResult(resultPath(runDir, 'discovery', task.taskId))) selected.push(task);
    }
    for (const task of selected) {
        const messages = buildDiscoveryMessages({ chat, task, manifest });
        const promptHash = sha256Text(JSON.stringify(messages));
        if (promptHash !== task.promptSha256) {
            throw new Error(`${task.taskId} 请求 Prompt 与冻结哈希不一致，拒绝调用 API`);
        }
        await callAndStore({
            apiConfig,
            messages,
            generationArgs: generationArgsFromManifest(manifest),
            filePath: resultPath(runDir, 'discovery', task.taskId),
            metadata: { stage: 'discovery', taskId: task.taskId, api: manifest.api },
            parse: text => parseDiscoveryResponse(text, {
                taskId: task.taskId,
                minFloor: task.startFloor,
                maxFloor: task.endFloor,
                maxCandidates: manifest.authoring.maxCandidates,
                maxClaims: manifest.authoring.maxClaims,
            }),
        });
    }
    return await getAuthoringStatus(runDir);
}

async function loadAllDiscovery(runDir, manifest) {
    const tasks = await readJsonl(path.join(runDir, DISCOVERY_TASKS_FILE));
    const results = [];
    for (const task of tasks) {
        const result = await readSuccessfulResult(resultPath(runDir, 'discovery', task.taskId));
        if (!result) throw new Error(`discovery 尚未完成: ${task.taskId}`);
        results.push(result);
    }
    if (results.length !== manifest.requestBudget.discovery) throw new Error('discovery 结果数与 manifest 不一致');
    return results;
}

export async function runSynthesis({ runDir, configPath }) {
    const manifest = await readJson(path.join(runDir, MANIFEST_FILE));
    const [chat, apiConfig, discovery] = await Promise.all([
        assertSourceMatches(manifest),
        loadSummaryApi(configPath, apiOverrideFromManifest(manifest)),
        loadAllDiscovery(runDir, manifest),
    ]);
    void chat;
    assertApiMatches(manifest, apiConfig);
    const filePath = resultPath(runDir, 'synthesis', 'cross-window');
    const existing = await readSuccessfulResult(filePath);
    if (existing) return await getAuthoringStatus(runDir);
    const claims = discovery.flatMap(result => result.parsed.claims || []);
    const messages = buildSynthesisMessages({ claims, manifest });
    await callAndStore({
        apiConfig,
        messages,
        generationArgs: generationArgsFromManifest(manifest),
        filePath,
        metadata: { stage: 'synthesis', taskId: 'cross-window', api: manifest.api },
        parse: text => parseSynthesisResponse(text, {
            minFloor: 0,
            maxFloor: manifest.source.atFloor,
            maxCandidates: manifest.authoring.synthesisMaxCandidates,
        }),
    });
    return await getAuthoringStatus(runDir);
}

function dedupeCandidates(candidates) {
    const seen = new Set();
    const seenContent = new Set();
    const unique = [];
    for (const candidate of candidates) {
        if (seen.has(candidate.candidateId)) throw new Error(`candidateId 重复: ${candidate.candidateId}`);
        seen.add(candidate.candidateId);
        const contentKey = JSON.stringify({
            category: candidate.category,
            query: candidate.query,
            expectedAnswer: candidate.expectedAnswer,
            evidence: candidate.evidence,
        });
        if (seenContent.has(contentKey)) continue;
        seenContent.add(contentKey);
        unique.push(candidate);
    }
    return unique;
}

async function loadBaseCandidatePool(runDir, manifest) {
    const discovery = await loadAllDiscovery(runDir, manifest);
    const synthesis = await readSuccessfulResult(resultPath(runDir, 'synthesis', 'cross-window'));
    if (!synthesis) throw new Error('synthesis 尚未完成');
    return dedupeCandidates([
        ...discovery.flatMap(result => result.parsed.candidates || []),
        ...(synthesis.parsed.candidates || []),
    ]);
}

function missingCandidateCategories(candidates) {
    const present = new Set(candidates.map(candidate => candidate.category));
    return CASE_CATEGORIES.filter(category => !present.has(category));
}

function buildSupplementSourceExcerpts(chat, category, claims) {
    const patterns = {
        update: /后来|现在|改为|变成|不再|原来|之前|起初|最初|重新|换成|更新/,
        abstention: /不知道|不清楚|未知|尚未|未决定|未揭示|不确定|忘记|无法确定|没有答案/,
    };
    const pattern = patterns[category];
    if (!pattern) return [];
    const hintFloors = [...new Set(
        claims
            .filter(claim => pattern.test(String(claim.statement || '')))
            .flatMap(claim => claim.floors || []),
    )].sort((a, b) => a - b);
    const ranges = [];
    for (const floor of hintFloors) {
        const startFloor = Math.max(0, floor - 40);
        const endFloor = Math.min(chat.lastFloor, floor + 40);
        const previous = ranges.at(-1);
        if (previous && startFloor <= previous.endFloor + 1) {
            previous.endFloor = Math.max(previous.endFloor, endFloor);
        } else {
            ranges.push({ startFloor, endFloor });
        }
    }
    return ranges.map(range => ({
        ...range,
        text: renderSourceRange(chat, range.startFloor, range.endFloor),
    }));
}

async function loadCandidatePool(runDir, manifest) {
    const base = await loadBaseCandidatePool(runDir, manifest);
    const supplements = [];
    for (const category of CASE_CATEGORIES) {
        const result = await readSuccessfulResult(resultPath(runDir, 'supplement', category));
        if (result) supplements.push(...(result.parsed.candidates || []));
    }
    return dedupeCandidates([...base, ...supplements]);
}

export async function runSupplements({ runDir, configPath, limit = Infinity }) {
    const manifest = await readJson(path.join(runDir, MANIFEST_FILE));
    const [chat, apiConfig, discovery, baseCandidates] = await Promise.all([
        assertSourceMatches(manifest),
        loadSummaryApi(configPath, apiOverrideFromManifest(manifest)),
        loadAllDiscovery(runDir, manifest),
        loadBaseCandidatePool(runDir, manifest),
    ]);
    void chat;
    assertApiMatches(manifest, apiConfig);
    const missing = missingCandidateCategories(baseCandidates);
    const claims = discovery.flatMap(result => result.parsed.claims || []);
    const selected = [];
    for (const category of missing) {
        if (selected.length >= limit) break;
        if (!await readSuccessfulResult(resultPath(runDir, 'supplement', category))) selected.push(category);
    }
    for (const category of selected) {
        const sourceExcerpts = buildSupplementSourceExcerpts(chat, category, claims);
        const messages = buildSupplementMessages({ category, claims, sourceExcerpts, manifest });
        await callAndStore({
            apiConfig,
            messages,
            generationArgs: generationArgsFromManifest(manifest),
            filePath: resultPath(runDir, 'supplement', category),
            metadata: { stage: 'supplement', taskId: category, api: manifest.api },
            parse: text => parseSynthesisResponse(text, {
                minFloor: 0,
                maxFloor: manifest.source.atFloor,
                maxCandidates: manifest.authoring.supplementMaxCandidates,
                expectedCategory: category,
                idPrefix: `supplement-${category}`,
                allowEmpty: true,
            }),
        });
    }
    return await getAuthoringStatus(runDir);
}

function buildVerifierTasks(candidates) {
    return candidates.map((candidate, index) => ({
        taskId: `verify-${String(index + 1).padStart(3, '0')}`,
        candidateIds: [candidate.candidateId],
    }));
}

export async function runVerification({ runDir, configPath, limit = Infinity }) {
    const manifest = await readJson(path.join(runDir, MANIFEST_FILE));
    const [chat, apiConfig, candidates] = await Promise.all([
        assertSourceMatches(manifest),
        loadSummaryApi(configPath, apiOverrideFromManifest(manifest)),
        loadCandidatePool(runDir, manifest),
    ]);
    assertApiMatches(manifest, apiConfig);
    const baseCandidates = await loadBaseCandidatePool(runDir, manifest);
    const plannedSupplements = missingCandidateCategories(baseCandidates);
    const incompleteSupplements = [];
    for (const category of plannedSupplements) {
        if (!await readSuccessfulResult(resultPath(runDir, 'supplement', category))) {
            incompleteSupplements.push(category);
        }
    }
    if (incompleteSupplements.length) {
        throw new Error(`补题阶段尚未完成: ${incompleteSupplements.join(', ')}`);
    }
    const byId = new Map(candidates.map(item => [item.candidateId, item]));
    const tasks = buildVerifierTasks(candidates);
    await writeJsonl(path.join(runDir, 'verifier-tasks.jsonl'), tasks);
    const selected = [];
    for (const task of tasks) {
        if (selected.length >= limit) break;
        if (!await readSuccessfulResult(resultPath(runDir, 'verification', task.taskId))) selected.push(task);
    }
    for (const task of selected) {
        const taskCandidates = task.candidateIds.map(id => byId.get(id));
        const messages = buildVerifierMessages({ chat, candidates: taskCandidates });
        await callAndStore({
            apiConfig,
            messages,
            generationArgs: generationArgsFromManifest(manifest),
            filePath: resultPath(runDir, 'verification', task.taskId),
            metadata: { stage: 'verification', taskId: task.taskId, api: manifest.api },
            parse: text => parseVerifierResponse(text, task.candidateIds),
        });
    }
    return await getAuthoringStatus(runDir);
}

export async function finalizeAuthoringRun({ runDir }) {
    const manifest = await readJson(path.join(runDir, MANIFEST_FILE));
    await assertSourceMatches(manifest);
    const candidates = await loadCandidatePool(runDir, manifest);
    const verifierTasksPath = path.join(runDir, 'verifier-tasks.jsonl');
    if (!await pathExists(verifierTasksPath)) throw new Error('verifier tasks 尚未建立，请先运行 verify');
    const verifierTasks = await readJsonl(verifierTasksPath);
    const verdictById = new Map();
    for (const task of verifierTasks) {
        const result = await readSuccessfulResult(resultPath(runDir, 'verification', task.taskId));
        if (!result) throw new Error(`verification 尚未完成: ${task.taskId}`);
        for (const verdict of result.parsed.verdicts) verdictById.set(verdict.candidateId, verdict);
    }

    const cases = candidates.map(candidate => {
        const verdict = verdictById.get(candidate.candidateId);
        if (!verdict) throw new Error(`缺少 verdict: ${candidate.candidateId}`);
        return buildGoldCase(candidate, verdict, manifest);
    });
    const ids = new Set();
    for (const goldCase of cases) {
        if (ids.has(goldCase.id)) throw new Error(`gold case 内容重复: ${goldCase.id}`);
        ids.add(goldCase.id);
    }
    const accepted = cases.filter(item => item.provenance.status === 'accepted');
    const disputed = cases.filter(item => item.provenance.status === 'disputed');
    const rejected = cases.filter(item => item.provenance.status === 'rejected');
    const acceptedCategories = new Set(accepted.map(item => item.category));
    const missingCategories = CASE_CATEGORIES.filter(category => !acceptedCategories.has(category));
    const casesRoot = path.join(manifest.workspaceRoot, 'cases');
    const acceptedPath = path.join(casesRoot, `${manifest.dataset}-${manifest.split}.jsonl`);
    const disputedPath = path.join(casesRoot, `${manifest.dataset}-disputed.jsonl`);
    const rejectedPath = path.join(runDir, 'rejected.jsonl');
    await writeJsonl(acceptedPath, accepted);
    await writeJsonl(disputedPath, disputed);
    await writeJsonl(rejectedPath, rejected);

    const parsed = parseCasesJsonl(accepted.map(item => JSON.stringify(item)).join('\n'));
    if (parsed.errors.length || parsed.stats.scored !== accepted.length) {
        throw new Error(`accepted cases 自检失败: ${parsed.errors.join('; ')}`);
    }
    const finalization = {
        finalizedAt: new Date().toISOString(),
        counts: { total: cases.length, accepted: accepted.length, disputed: disputed.length, rejected: rejected.length },
        categoryCoverage: {
            accepted: [...acceptedCategories].sort(),
            unavailable: missingCategories,
        },
        outputs: { acceptedPath, disputedPath, rejectedPath },
        hashes: {
            accepted: sha256Text(serializeJsonl(accepted)),
            disputed: sha256Text(serializeJsonl(disputed)),
            rejected: sha256Text(serializeJsonl(rejected)),
        },
    };
    await writeJson(path.join(runDir, 'finalization.json'), finalization);
    return finalization;
}

export async function getAuthoringStatus(runDir) {
    const manifest = await readJson(path.join(runDir, MANIFEST_FILE));
    const tasks = await readJsonl(path.join(runDir, DISCOVERY_TASKS_FILE));
    let discoveryCompleted = 0;
    for (const task of tasks) {
        if (await readSuccessfulResult(resultPath(runDir, 'discovery', task.taskId))) discoveryCompleted++;
    }
    const synthesisCompleted = !!await readSuccessfulResult(resultPath(runDir, 'synthesis', 'cross-window'));
    let candidates = null;
    const supplements = { planned: [], completed: 0, pending: [] };
    let verification = { total: null, completed: 0 };
    if (synthesisCompleted && discoveryCompleted === tasks.length) {
        const basePool = await loadBaseCandidatePool(runDir, manifest);
        supplements.planned = missingCandidateCategories(basePool);
        for (const category of supplements.planned) {
            if (await readSuccessfulResult(resultPath(runDir, 'supplement', category))) supplements.completed++;
            else supplements.pending.push(category);
        }
        const pool = await loadCandidatePool(runDir, manifest);
        candidates = pool.length;
        supplements.unavailable = missingCandidateCategories(pool);
        if (!supplements.pending.length) {
            const verifierTasks = buildVerifierTasks(pool);
            verification.total = verifierTasks.length;
            for (const task of verifierTasks) {
                if (await readSuccessfulResult(resultPath(runDir, 'verification', task.taskId))) verification.completed++;
            }
        }
    }
    return {
        runDir,
        runId: manifest.runId,
        api: manifest.api,
        credential: manifest.credential,
        source: {
            sha256: manifest.source.sha256,
            messageCount: manifest.source.messageCount,
            atFloor: manifest.source.atFloor,
        },
        discovery: { total: tasks.length, completed: discoveryCompleted },
        synthesisCompleted,
        supplements,
        candidates,
        verification,
        finalized: await pathExists(path.join(runDir, 'finalization.json')),
        requestBudget: manifest.requestBudget,
        discoveryTasksSha256: manifest.artifacts.discoveryTasksSha256,
    };
}

function renderPlan(manifest, tasks) {
    const first = tasks[0];
    const last = tasks.at(-1);
    return `# ${manifest.runId} 金标准 authoring 计划

- 原始样本：${manifest.source.path}
- SHA-256：\`${manifest.source.sha256}\`
- 楼层：0-${manifest.source.atFloor}（${manifest.source.messageCount} 条）
- API：${manifest.api.provider} / ${manifest.api.endpointBase} / ${manifest.api.model}
- Key 来源：${manifest.credential.type === 'environment' ? `环境变量 ${manifest.credential.name}` : manifest.credential.field}
- Prompt：${manifest.authoring.promptVersion}
- Synthesis Prompt：${manifest.authoring.synthesisPromptVersion}
- Supplement Prompt：${manifest.authoring.supplementPromptVersion}
- Verifier Prompt：${manifest.authoring.verifierPromptVersion}
- 生成参数：temperature=${manifest.authoring.generation.temperature}，max_tokens=${manifest.authoring.generation.maxTokens}，reasoning_effort=${manifest.authoring.generation.reasoningEffort}
- 窗口：${manifest.authoring.windowSize} 楼，重叠 ${manifest.authoring.overlap} 楼，共 ${tasks.length} 个
- 覆盖：${first.startFloor}-${first.endFloor} … ${last.startFloor}-${last.endFloor}
- 任务清单 SHA-256：\`${manifest.artifacts.discoveryTasksSha256}\`

## 请求预算

- discovery：${manifest.requestBudget.discovery} 次
- cross-window synthesis：1 次
- category supplements：最多 ${manifest.requestBudget.supplementMaximum} 次
- independent verification：最多 ${manifest.requestBudget.verificationMaximum} 次
- 总计：最多 ${manifest.requestBudget.totalMaximum} 次

本文件不含 API Key，也不含聊天正文。任务只保存楼层范围；请求执行时从哈希匹配的原文件读取。
`;
}
