/* global process */

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
    getDefaultApiPrefix,
    resolveApiBaseUrl,
} from '../../shared/common/openai-url-utils.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function readFlag(name, fallback = '') {
    const prefix = `--${name}=`;
    const raw = process.argv.find(arg => arg.startsWith(prefix));
    return raw ? raw.slice(prefix.length) : fallback;
}

function positiveInteger(name, fallback) {
    const value = Number(readFlag(name, fallback));
    if (!Number.isInteger(value) || value < 1) throw new Error(`--${name} 必须是正整数`);
    return value;
}

function splitKeys(raw) {
    return String(raw || '')
        .split(/[,;|\n]+/)
        .map(value => value.trim())
        .filter(Boolean);
}

function sha256(bytes) {
    return createHash('sha256').update(bytes).digest('hex');
}

function parseFirstCase(text) {
    for (const line of String(text || '').split(/\r?\n/)) {
        if (!line.trim()) continue;
        const item = JSON.parse(line);
        if (String(item?.query || '').trim()) return item;
    }
    throw new Error('cases 中没有可用 query');
}

function buildProductionShapedDocuments(snapshot, targetCount) {
    const chunks = Array.isArray(snapshot?.vector?.chunks) ? snapshot.vector.chunks : [];
    const byFloor = new Map();
    for (const chunk of chunks) {
        const floor = Number(chunk?.floor);
        if (!Number.isInteger(floor) || floor < 0) continue;
        if (!byFloor.has(floor)) byFloor.set(floor, []);
        byFloor.get(floor).push(chunk);
    }

    const pool = [];
    for (const floor of [...byFloor.keys()].sort((a, b) => a - b)) {
        const aiChunks = (byFloor.get(floor) || []).filter(chunk => !chunk?.isUser);
        if (!aiChunks.length) continue;
        const userChunks = (byFloor.get(floor - 1) || []).filter(chunk => chunk?.isUser);
        const parts = [];
        if (userChunks.length) {
            const speaker = String(userChunks[0]?.speaker || '用户');
            parts.push(`${speaker}：${userChunks.map(chunk => chunk?.text || '').join(' ')}`);
        }
        const speaker = String(aiChunks[0]?.speaker || '角色');
        parts.push(`${speaker}：${aiChunks.map(chunk => chunk?.text || '').join(' ')}`);
        const text = parts.join('\n').trim();
        if (text) pool.push(text);
    }
    if (pool.length < targetCount) {
        throw new Error(`snapshot 只有 ${pool.length} 个可用 Rerank 文档，少于 ${targetCount}`);
    }

    const selected = [];
    const used = new Set();
    for (let index = 0; index < targetCount; index++) {
        const poolIndex = Math.min(pool.length - 1, Math.floor(index * pool.length / targetCount));
        if (used.has(poolIndex)) continue;
        used.add(poolIndex);
        selected.push(pool[poolIndex]);
    }
    if (selected.length !== targetCount) throw new Error('无法构造确定性的 Rerank 文档样本');
    return selected;
}

function partition(items, size) {
    const batches = [];
    for (let index = 0; index < items.length; index += size) {
        batches.push(items.slice(index, index + size));
    }
    return batches;
}

function percentile(values, ratio) {
    const nums = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!nums.length) return null;
    const index = Math.min(nums.length - 1, Math.max(0, Math.ceil(nums.length * ratio) - 1));
    return nums[index];
}

function summarize(results) {
    const statusCounts = {};
    const failureKinds = {};
    for (const result of results) {
        const status = result.status == null ? 'no-status' : String(result.status);
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        if (!result.ok) {
            const kind = result.failureKind || 'unknown';
            failureKinds[kind] = (failureKinds[kind] || 0) + 1;
        }
    }
    return {
        requests: results.length,
        succeeded: results.filter(result => result.ok).length,
        failed: results.filter(result => !result.ok).length,
        statusCounts,
        failureKinds,
        retryAfterSeen: results.filter(result => result.retryAfter != null).length,
        latencyMs: {
            p50: percentile(results.map(result => result.elapsedMs), 0.5),
            p95: percentile(results.map(result => result.elapsedMs), 0.95),
            max: percentile(results.map(result => result.elapsedMs), 1),
        },
    };
}

async function wait(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const configPath = path.resolve(readFlag(
        'config',
        path.join(rootDir, 'scripts', 'story-summary-replay.local.json'),
    ));
    const snapshotPath = path.resolve(readFlag('snapshot'));
    const casesPath = path.resolve(readFlag('cases'));
    const outputPath = path.resolve(readFlag('output'));
    const repetitions = positiveInteger('repetitions', 5);
    const cooldownMs = positiveInteger('cooldown-ms', 5000);
    const targetDocuments = positiveInteger('documents', 59);
    const batchSize = positiveInteger('batch-size', 20);
    const dryRun = ['1', 'true', 'yes'].includes(readFlag('dry-run', 'false').toLowerCase());

    if (!readFlag('snapshot') || !readFlag('cases') || !readFlag('output')) {
        throw new Error('必须提供 --snapshot、--cases、--output');
    }

    const [configBytes, snapshotBytes, casesBytes] = await Promise.all([
        fs.readFile(configPath),
        fs.readFile(snapshotPath),
        fs.readFile(casesPath),
    ]);
    const config = JSON.parse(configBytes.toString('utf8'));
    const snapshot = JSON.parse(snapshotBytes.toString('utf8'));
    const goldCase = parseFirstCase(casesBytes.toString('utf8'));
    const api = config?.vectorConfig?.rerankApi || {};
    const keys = splitKeys(api.key);
    if (!dryRun && !keys.length) throw new Error('rerankApi.key 为空');

    const documents = buildProductionShapedDocuments(snapshot, targetDocuments);
    const batches = partition(documents, batchSize);
    const query = String(goldCase.query || '');
    const baseUrl = resolveApiBaseUrl(
        String(api.url || 'https://api.siliconflow.cn/v1'),
        getDefaultApiPrefix(api.provider || 'siliconflow'),
    );
    const endpoint = `${baseUrl}/rerank`;
    let keyIndex = 0;

    const requestBatch = async (batch) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const startedAt = performance.now();
        try {
            const key = keys[keyIndex++ % keys.length];
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: String(api.model || 'BAAI/bge-reranker-v2-m3'),
                    query,
                    documents: batch,
                    top_n: batch.length,
                    return_documents: false,
                }),
                signal: controller.signal,
            });
            const retryAfter = response.headers.get('retry-after');
            let protocolOk = false;
            try {
                const payload = await response.json();
                protocolOk = Array.isArray(payload?.results);
            } catch {}
            return {
                ok: response.ok && protocolOk,
                status: response.status,
                failureKind: response.ok ? (protocolOk ? null : 'invalid-json-or-results') : 'http',
                retryAfter,
                elapsedMs: Math.round(performance.now() - startedAt),
            };
        } catch (error) {
            return {
                ok: false,
                status: null,
                failureKind: error?.name === 'AbortError' ? 'timeout' : 'network',
                retryAfter: null,
                elapsedMs: Math.round(performance.now() - startedAt),
            };
        } finally {
            clearTimeout(timeoutId);
        }
    };

    const runArm = async (mode) => {
        if (mode === 'sequential') {
            const out = [];
            for (const batch of batches) out.push(await requestBatch(batch));
            return out;
        }
        return await Promise.all(batches.map(requestBatch));
    };

    const report = {
        version: 1,
        generatedAt: new Date().toISOString(),
        mode: 'rerank-concurrency-probe',
        source: {
            snapshotHash: sha256(snapshotBytes),
            casesHash: sha256(casesBytes),
        },
        api: {
            provider: String(api.provider || ''),
            endpointHost: new URL(endpoint).host,
            model: String(api.model || ''),
            configuredKeyCount: keys.length,
        },
        input: {
            documents: documents.length,
            batchSize,
            batches: batches.map(batch => batch.length),
            averageDocumentChars: Math.round(documents.reduce((sum, text) => sum + text.length, 0) / documents.length),
            queryChars: query.length,
        },
        settings: { repetitions, cooldownMs },
        dryRun,
        trials: [],
    };

    if (!dryRun) {
        for (let repetition = 0; repetition < repetitions; repetition++) {
            const order = repetition % 2 === 0
                ? ['sequential', 'parallel-3']
                : ['parallel-3', 'sequential'];
            for (const mode of order) {
                const results = await runArm(mode);
                report.trials.push({ repetition: repetition + 1, mode, results });
                const statuses = results.map(result => result.status ?? result.failureKind).join(',');
                process.stdout.write(`[rerank-probe] repetition=${repetition + 1} mode=${mode} results=${statuses}\n`);
                await wait(cooldownMs);
            }
        }
    }

    report.summary = {
        sequential: summarize(report.trials.filter(trial => trial.mode === 'sequential').flatMap(trial => trial.results)),
        parallel3: summarize(report.trials.filter(trial => trial.mode === 'parallel-3').flatMap(trial => trial.results)),
    };
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    process.stdout.write(`[rerank-probe] report=${outputPath}\n`);
}

await main();
