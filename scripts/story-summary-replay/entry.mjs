/* global Buffer, process */

import path from 'node:path';
import fs from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

import { indexedDB, IDBKeyRange } from 'fake-indexeddb';
import {
    __setReplayContext,
    __setExtensionSettings,
    __resetMetadataSaveCount,
    __saveMetadataCallCount,
    __immediateMetadataSaveCallCount,
    __debouncedMetadataSaveCallCount,
} from './shims/extensions.js';
import { __setChatMetadata, chat_metadata } from './shims/script.js';
import { callSummaryApi } from './api-client.mjs';
import {
    assertNaturalHistoryHealthy,
    maintainNaturalHistoryAfterAi,
    mergeCountedExternal,
    throwNaturalStageFailure,
} from './natural-runtime.mjs';
import {
    prepareGoldEvalPlan,
    runGoldEvalCases,
} from '../gold-eval/replay-session.mjs';
import {
    prepareNaturalCapturePlan,
    runNaturalCaptureCases,
} from '../gold-eval/natural-replay-session.mjs';
import {
    prepareNaturalRecallPlan,
    runNaturalRecallCases,
} from '../gold-eval/natural-recall-session.mjs';
import {
    prepareNaturalResumePlan,
    runNaturalResumeCases,
} from '../gold-eval/natural-resume-session.mjs';
import { runGoldPromptOnly } from '../gold-eval/prompt-session.mjs';
import {
    prepareEventRerankGate,
    runEventRerankGate,
} from '../gold-eval/event-rerank-gate.mjs';
import { withExternalCallTrace } from '../gold-eval/lib/transport-cassette.mjs';
import { assertBootstrapHealthy } from '../gold-eval/baseline/bootstrap-health.mjs';

class MemoryStorage {
    #map = new Map();

    getItem(key) {
        return this.#map.has(key) ? this.#map.get(key) : null;
    }

    setItem(key, value) {
        this.#map.set(String(key), String(value));
    }

    removeItem(key) {
        this.#map.delete(String(key));
    }

    clear() {
        this.#map.clear();
    }
}

function defineGlobal(name, value) {
    Object.defineProperty(globalThis, name, {
        value,
        configurable: true,
        writable: true,
    });
}

function ensureNodeReplayGlobals() {
    if (!globalThis.performance) {
        defineGlobal('performance', performance);
    }
    if (!globalThis.window) {
        defineGlobal('window', globalThis);
    }
    if (!globalThis.self) {
        defineGlobal('self', globalThis);
    }
    if (!globalThis.localStorage) {
        defineGlobal('localStorage', new MemoryStorage());
    }
    if (!globalThis.sessionStorage) {
        defineGlobal('sessionStorage', new MemoryStorage());
    }
    if (!globalThis.indexedDB) {
        defineGlobal('indexedDB', indexedDB);
    }
    if (!globalThis.IDBKeyRange) {
        defineGlobal('IDBKeyRange', IDBKeyRange);
    }
    if (!globalThis.navigator) {
        defineGlobal('navigator', { userAgent: 'story-summary-replay/node' });
    }
    if (!globalThis.btoa) {
        defineGlobal('btoa', (input) => Buffer.from(String(input), 'binary').toString('base64'));
    }
    if (!globalThis.atob) {
        defineGlobal('atob', (input) => Buffer.from(String(input), 'base64').toString('binary'));
    }
}

function toPosixPath(inputPath) {
    return String(inputPath || '').replace(/\\/g, '/');
}

function resolveFromRoot(rootDir, maybeRelativePath) {
    if (!maybeRelativePath) return '';
    return path.isAbsolute(maybeRelativePath)
        ? maybeRelativePath
        : path.resolve(rootDir, maybeRelativePath);
}

function decodeBase64Url(input) {
    const normalized = String(input || '')
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(String(input || '').length / 4) * 4, '=');
    return Buffer.from(normalized, 'base64').toString('utf8');
}

function buildChatMessagesFromArgs(args, prefillMode = 'assistant') {
    const topMessages = JSON.parse(decodeBase64Url(args.top64 || 'W10='));
    const bottomMessages = JSON.parse(decodeBase64Url(args.bottom64 || 'W10='));
    const messages = [...topMessages, ...bottomMessages]
        .map((message) => ({
            role: String(message?.role || '').trim().toLowerCase(),
            content: typeof message?.content === 'string' ? message.content : String(message?.content || ''),
        }))
        .filter((message) => message.role && message.content.trim().length > 0);

    if (args.bottomassistant && String(args.bottomassistant).trim()) {
        messages.push({
            role: prefillMode === 'user-instruction' ? 'user' : 'assistant',
            content: String(args.bottomassistant),
        });
    }

    return messages;
}

function createStreamingGenerationShim(summaryApiConfig) {
    const sessions = new Map();
    let lastResponseDiagnostic = null;

    const analyzeOutput = (text, responseMeta = {}) => {
        const output = String(text || '').trim();
        const start = output.indexOf('{');
        const end = output.lastIndexOf('}');
        let fullJson = false;
        let boundedJson = false;
        try {
            JSON.parse(output);
            fullJson = true;
        } catch {}
        if (start >= 0 && end > start) {
            try {
                JSON.parse(output.slice(start, end + 1));
                boundedJson = true;
            } catch {}
        }
        return {
            ...responseMeta,
            outputChars: output.length,
            startsWithFence: /^```/.test(output),
            endsWithBrace: output.endsWith('}'),
            hasObjectBounds: start >= 0 && end > start,
            fullJson,
            boundedJson,
        };
    };

    const getSession = (sessionId) => sessions.get(sessionId) || { isStreaming: false, text: '', error: null };

    const runRequest = async (args) => {
        const messages = buildChatMessagesFromArgs(args, summaryApiConfig.prefillMode);
        let responseMeta = {};
        const text = await callSummaryApi(summaryApiConfig, messages, {
            ...args,
            ...(summaryApiConfig.maxTokens ? { max_tokens: summaryApiConfig.maxTokens } : {}),
            ...(summaryApiConfig.reasoningEffort
                ? { reasoning_effort: summaryApiConfig.reasoningEffort }
                : {}),
            onResponse(payload) {
                const message = payload?.choices?.[0]?.message || {};
                responseMeta = {
                    finishReason: payload?.choices?.[0]?.finish_reason ?? null,
                    contentChars: typeof message.content === 'string' ? message.content.length : null,
                    reasoningChars: typeof message.reasoning_content === 'string'
                        ? message.reasoning_content.length
                        : null,
                    completionTokens: payload?.usage?.completion_tokens ?? null,
                    reasoningTokens: payload?.usage?.completion_tokens_details?.reasoning_tokens ?? null,
                };
            },
        });
        lastResponseDiagnostic = analyzeOutput(text, responseMeta);
        return text;
    };

    return {
        async xbgenrawCommand(args) {
            const wantsStream = String(args?.nonstream || 'false') !== 'true';
            const sessionId = String(args?.id || `story-summary-replay-${Date.now()}`);

            if (!wantsStream) {
                return await runRequest(args);
            }

            sessions.set(sessionId, { isStreaming: true, text: '', error: null });
            const text = await runRequest(args);
            sessions.set(sessionId, { isStreaming: false, text, error: null });
            return sessionId;
        },
        getStatus(sessionId) {
            return getSession(String(sessionId || ''));
        },
        cancel(sessionId) {
            const snapshot = getSession(String(sessionId || ''));
            sessions.set(String(sessionId || ''), { ...snapshot, isStreaming: false });
        },
        getLastResponseDiagnostic() {
            return lastResponseDiagnostic ? { ...lastResponseDiagnostic } : null;
        },
    };
}

function normalizeMessage(rawMessage, index, defaults) {
    const role = String(rawMessage?.role || '').trim().toLowerCase();
    const isUser = rawMessage?.is_user != null
        ? !!rawMessage.is_user
        : rawMessage?.isUser != null
            ? !!rawMessage.isUser
            : role === 'user';
    const messageText = rawMessage?.mes
        ?? rawMessage?.message
        ?? rawMessage?.content
        ?? rawMessage?.text
        ?? '';
    const mes = String(messageText || '').replace(/\r\n/g, '\n');
    const name = String(rawMessage?.name || (isUser ? defaults.name1 : defaults.name2) || '').trim()
        || (isUser ? defaults.name1 : defaults.name2);

    return {
        mes,
        name,
        is_user: isUser,
        extra: rawMessage?.extra || {},
        swipes: Array.isArray(rawMessage?.swipes) ? rawMessage.swipes : [],
        replayIndex: index,
    };
}

function extractRawChatMessages(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.chat)) return payload.chat;
    if (Array.isArray(payload?.messages)) return payload.messages;
    if (Array.isArray(payload?.data?.chat)) return payload.data.chat;
    if (Array.isArray(payload?.data?.messages)) return payload.data.messages;
    return [];
}

function parseJsonlPayload(rawText) {
    const lines = String(rawText || '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (!lines.length) {
        return null;
    }

    const records = lines.map((line, index) => {
        try {
            return JSON.parse(line);
        } catch (error) {
            throw new Error(`JSONL parse failed at line ${index + 1}: ${error?.message || error}`);
        }
    });

    const header = records[0];
    const hasHeaderOnlyMeta = !!header
        && typeof header === 'object'
        && !Array.isArray(header)
        && !('mes' in header)
        && !('message' in header)
        && (
            'chat_metadata' in header
            || 'user_name' in header
            || 'character_name' in header
        );

    if (hasHeaderOnlyMeta) {
        return {
            ...header,
            chat: records.slice(1),
        };
    }

    return {
        chat: records,
    };
}

function detectNames(payload, config) {
    const name1 = String(
        config?.name1
        || payload?.name1
        || payload?.user_name
        || payload?.userName
        || payload?.metadata?.name1
        || '用户'
    ).trim() || '用户';

    const name2 = String(
        config?.name2
        || payload?.name2
        || payload?.character_name
        || payload?.characterName
        || payload?.metadata?.name2
        || '角色'
    ).trim() || '角色';

    return { name1, name2 };
}

async function loadSampleChat(samplePath, config) {
    const raw = await fs.readFile(samplePath, 'utf8');
    let payload;
    try {
        payload = JSON.parse(raw);
    } catch {
        payload = parseJsonlPayload(raw);
    }
    if (!payload) {
        throw new Error(`Unable to parse sample file: ${samplePath}`);
    }
    const names = detectNames(payload, config);
    const allMessages = extractRawChatMessages(payload)
        .map((message, index) => normalizeMessage(message, index, names))
        .filter((message) => message.mes.trim().length > 0);

    const maxFloors = Number.isFinite(Number(config?.maxFloors))
        ? Math.max(1, Math.trunc(Number(config.maxFloors)))
        : allMessages.length;
    const messages = allMessages.slice(0, maxFloors);

    return {
        payload,
        messages,
        names,
        totalSampleMessages: allMessages.length,
    };
}

function buildReplayPanelConfig(config) {
    const naturalCapture = normalizeReplayMode(config?.mode) === 'natural-capture';
    return {
        api: {
            provider: config?.summaryApi?.provider || 'custom',
            url: config?.summaryApi?.url || '',
            key: config?.summaryApi?.key || '',
            model: config?.summaryApi?.model || '',
            modelCache: [],
            maxTokens: config?.summaryApi?.maxTokens ?? null,
            reasoningEffort: config?.summaryApi?.reasoningEffort ?? '',
            prefillMode: config?.summaryApi?.prefillMode ?? 'assistant',
        },
        gen: {
            temperature: config?.summaryApi?.temperature ?? null,
            top_p: config?.summaryApi?.top_p ?? null,
            top_k: config?.summaryApi?.top_k ?? null,
            presence_penalty: config?.summaryApi?.presence_penalty ?? null,
            frequency_penalty: config?.summaryApi?.frequency_penalty ?? null,
        },
        trigger: {
            enabled: naturalCapture,
            interval: Math.max(1, Math.trunc(Number(config?.summaryTriggerInterval) || 20)),
            timing: naturalCapture ? 'before_user' : 'manual',
            role: 'system',
            useStream: config?.summaryApi?.useStream !== false,
            maxPerRun: Math.max(1, Math.trunc(Number(config?.summaryApi?.maxPerRun) || 100)),
            wrapperHead: String(config?.wrapperHead || ''),
            wrapperTail: String(config?.wrapperTail || ''),
            forceInsertAtEnd: false,
        },
        ui: {
            hideSummarized: true,
            keepVisibleCount: 6,
        },
        textFilterRules: [
            { start: '<think>', end: '</think>' },
            { start: '<thinking>', end: '</thinking>' },
            { start: '```', end: '```' },
        ],
        prompts: {},
        vector: {
            ...config?.vectorConfig,
            enabled: !!config?.vectorConfig?.enabled,
        },
    };
}

function hashString(input) {
    let hash = 0;
    const text = String(input || '');
    for (let index = 0; index < text.length; index += 1) {
        hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
    }
    return (hash >>> 0).toString(36);
}

function normalizeReplayMode(value) {
    const mode = String(value || 'full').trim().toLowerCase();
    if (mode === 'recall') return 'recall-only';
    if (mode === 'bootstrap-only') return 'bootstrap';
    return mode || 'full';
}

function buildReplayIdentity(samplePath, config) {
    const identitySource = JSON.stringify({
        samplePath: toPosixPath(samplePath),
        maxFloors: Number.isFinite(Number(config?.maxFloors))
            ? Math.max(1, Math.trunc(Number(config.maxFloors)))
            : null,
    });
    const replayKey = hashString(identitySource);
    return {
        replayKey,
        chatId: String(config?.replayChatId || `story-summary-replay:${replayKey}`),
    };
}

function buildReplayDataFingerprint(samplePath, config) {
    return hashString(JSON.stringify({
        samplePath: toPosixPath(samplePath),
        maxFloors: Number.isFinite(Number(config?.maxFloors))
            ? Math.max(1, Math.trunc(Number(config.maxFloors)))
            : null,
        summaryApi: {
            provider: config?.summaryApi?.provider || 'custom',
            url: config?.summaryApi?.url || '',
            model: config?.summaryApi?.model || '',
            temperature: config?.summaryApi?.temperature ?? null,
            useStream: config?.summaryApi?.useStream !== false,
            maxPerRun: Math.max(1, Math.trunc(Number(config?.summaryApi?.maxPerRun) || 100)),
        },
        vectorConfig: {
            enabled: !!config?.vectorConfig?.enabled,
            l0Api: {
                provider: config?.vectorConfig?.l0Api?.provider || 'custom',
                url: config?.vectorConfig?.l0Api?.url || '',
                model: config?.vectorConfig?.l0Api?.model || '',
            },
            embeddingApi: {
                provider: config?.vectorConfig?.embeddingApi?.provider || 'custom',
                url: config?.vectorConfig?.embeddingApi?.url || '',
                model: config?.vectorConfig?.embeddingApi?.model || '',
            },
            rerankApi: {
                provider: config?.vectorConfig?.rerankApi?.provider || 'custom',
                url: config?.vectorConfig?.rerankApi?.url || '',
                model: config?.vectorConfig?.rerankApi?.model || '',
            },
        },
    }));
}

function resolveSnapshotPath(rootDir, config, outputDir) {
    if (config?.snapshotPath) {
        return resolveFromRoot(rootDir, config.snapshotPath);
    }
    return path.join(outputDir, 'story-summary-replay-snapshot.json');
}

function withTiming(stageTimings, key, elapsedMs) {
    stageTimings[key] = Math.max(0, Math.round(elapsedMs));
}

function cloneJsonSafe(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
}

function buildStoreSummary(store) {
    const json = store?.json || {};
    return {
        lastSummarizedMesId: Number(store?.lastSummarizedMesId ?? -1),
        summaryHistoryLength: Array.isArray(store?.summaryHistory) ? store.summaryHistory.length : 0,
        keywordsCount: Array.isArray(json?.keywords) ? json.keywords.length : 0,
        eventsCount: Array.isArray(json?.events) ? json.events.length : 0,
        charactersCount: Array.isArray(json?.characters?.main) ? json.characters.main.length : 0,
        arcsCount: Array.isArray(json?.arcs) ? json.arcs.length : 0,
        factsCount: Array.isArray(json?.facts) ? json.facts.length : 0,
    };
}

function previewText(value, max = 160) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length > max ? `${text.slice(0, max)}...` : text;
}

async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}

async function readSnapshotFile(snapshotPath) {
    const raw = await fs.readFile(snapshotPath, 'utf8');
    return JSON.parse(raw);
}

function toPlainVectorItems(items = []) {
    return items.map((item) => ({
        ...item,
        vector: Array.from(item?.vector || []),
        rVector: item?.rVector ? Array.from(item.rVector) : null,
    }));
}

async function resetReplayStores(modules, chatId) {
    await modules.clearChatData(chatId);
    await modules.clearStateVectors(chatId);
    modules.clearStateAtoms();
    modules.clearL0Index();
    await modules.clearEventVectors(chatId);
    modules.initStateIntegration?.();
}

async function createReplaySnapshot(modules, chatId, sample, samplePath, config, snapshotPath, options = {}) {
    const snapshotMessages = options.messages || sample.messages;
    const snapshotKind = options.kind || null;
    const boundary = options.boundary || null;
    const [meta, chunks, chunkVectors, eventVectors, stateVectors, storageStats, stateVectorsCount] = await Promise.all([
        modules.getMeta(chatId),
        modules.getAllChunks(chatId),
        modules.getAllChunkVectors(chatId),
        modules.getAllEventVectors(chatId),
        modules.getAllStateVectors(chatId),
        modules.getStorageStats(chatId),
        modules.getStateVectorsCount(chatId),
    ]);

    return {
        version: snapshotKind ? 2 : 1,
        ...(snapshotKind ? { kind: snapshotKind } : {}),
        generatedAt: new Date().toISOString(),
        snapshotPath: toPosixPath(snapshotPath),
        dataFingerprint: buildReplayDataFingerprint(samplePath, config),
        sample: {
            samplePath: toPosixPath(samplePath),
            messageCount: snapshotMessages.length,
            totalSampleMessages: sample.totalSampleMessages,
            names: sample.names,
        },
        replay: {
            chatId,
        },
        ...(boundary ? { boundary: cloneJsonSafe(boundary) } : {}),
        ...(options.recovery ? { recovery: cloneJsonSafe(options.recovery) } : {}),
        summary: {
            store: cloneJsonSafe(modules.getSummaryStore()),
            chatMetadata: cloneJsonSafe(chat_metadata),
        },
        vector: {
            meta: cloneJsonSafe(meta),
            chunks: cloneJsonSafe(chunks),
            chunkVectors: toPlainVectorItems(chunkVectors),
            eventVectors: toPlainVectorItems(eventVectors),
            stateVectors: toPlainVectorItems(stateVectors),
            storageStats: cloneJsonSafe(storageStats),
            stateAtomsCount: modules.getStateAtomsCount(),
            stateVectorsCount,
        },
    };
}

async function writeNaturalBoundarySnapshot(
    modules,
    chatId,
    sample,
    samplePath,
    config,
    snapshotPath,
    visibleMessages,
    goldCase,
) {
    const snapshot = await createReplaySnapshot(
        modules,
        chatId,
        sample,
        samplePath,
        config,
        snapshotPath,
        {
            messages: visibleMessages,
            kind: 'natural-query-boundary',
            boundary: {
                queryFloor: goldCase.atFloor,
                historyThroughFloor: goldCase.historyThroughFloor,
            },
        },
    );
    await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf8');
    return snapshot;
}

async function writeNaturalRecoverySnapshot(
    modules,
    chatId,
    sample,
    samplePath,
    config,
    snapshotPath,
    visibleMessages,
    resumeFloor,
    preparation,
) {
    const snapshot = await createReplaySnapshot(
        modules,
        chatId,
        sample,
        samplePath,
        config,
        snapshotPath,
        {
            messages: visibleMessages,
            kind: 'natural-operational-recovery',
            boundary: {
                resumeFloor,
                historyThroughFloor: resumeFloor,
            },
            recovery: {
                preparation: cloneJsonSafe(preparation),
            },
        },
    );
    const tempPath = `${snapshotPath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(snapshot, null, 2), 'utf8');
    await fs.rename(tempPath, snapshotPath);
    return snapshot;
}

async function writeReplaySnapshot(modules, chatId, sample, samplePath, config, snapshotPath) {
    const snapshot = await createReplaySnapshot(modules, chatId, sample, samplePath, config, snapshotPath);
    await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf8');
    return snapshot;
}

function validateReplaySnapshot(snapshot, samplePath, sample, config) {
    if (!snapshot || typeof snapshot !== 'object') {
        throw new Error('Snapshot 文件无效。');
    }
    const expectedFingerprint = buildReplayDataFingerprint(samplePath, config);
    if (snapshot.dataFingerprint !== expectedFingerprint) {
        throw new Error(
            'Snapshot 与当前样本或配置不匹配，请先重新执行 bootstrap。'
        );
    }
    if (Number(snapshot?.sample?.messageCount || 0) !== sample.messages.length) {
        throw new Error(
            `Snapshot 消息数不匹配（snapshot=${snapshot?.sample?.messageCount || 0}, current=${sample.messages.length}），请先重新执行 bootstrap。`
        );
    }
}

async function restoreReplaySnapshot(modules, chatId, snapshot) {
    await resetReplayStores(modules, chatId);
    __setChatMetadata(cloneJsonSafe(snapshot?.summary?.chatMetadata) || {});

    const meta = snapshot?.vector?.meta;
    await modules.getMeta(chatId);
    if (meta) {
        await modules.updateMeta(chatId, {
            fingerprint: meta.fingerprint ?? null,
            lastChunkFloor: Number.isFinite(Number(meta.lastChunkFloor))
                ? Math.trunc(Number(meta.lastChunkFloor))
                : -1,
        });
    }

    const chunks = Array.isArray(snapshot?.vector?.chunks) ? snapshot.vector.chunks : [];
    if (chunks.length) {
        await modules.saveChunks(chatId, chunks);
    }

    const chunkVectors = Array.isArray(snapshot?.vector?.chunkVectors) ? snapshot.vector.chunkVectors : [];
    if (chunkVectors.length) {
        await modules.saveChunkVectors(chatId, chunkVectors, meta?.fingerprint || null);
    }

    const eventVectors = Array.isArray(snapshot?.vector?.eventVectors) ? snapshot.vector.eventVectors : [];
    if (eventVectors.length) {
        await modules.saveEventVectors(chatId, eventVectors, meta?.fingerprint || null);
    }

    const stateVectors = Array.isArray(snapshot?.vector?.stateVectors) ? snapshot.vector.stateVectors : [];
    if (stateVectors.length) {
        await modules.saveStateVectors(chatId, stateVectors, meta?.fingerprint || null);
    }

    modules.initStateIntegration?.();
}

async function runSummaryBatches(modules, targetMesId, summaryConfig) {
    const batches = [];

    while (true) {
        const storeBefore = modules.getSummaryStore();
        const beforeEnd = Number(storeBefore?.lastSummarizedMesId ?? -1);
        const startedAt = performance.now();

        const callbacks = {
            onStatus(statusText) {
                batches.push({
                    kind: 'status',
                    statusText,
                });
            },
        };

        const result = await modules.runSummaryGeneration(targetMesId, summaryConfig, callbacks);
        const elapsedMs = Math.round(performance.now() - startedAt);

        if (!result?.success) {
            const diagnostic = globalThis.window?.xiaobaixStreamingGeneration?.getLastResponseDiagnostic?.();
            const suffix = diagnostic ? `:diagnostic=${JSON.stringify(diagnostic)}` : '';
            throw new Error(`summary_generation_failed:${result?.error?.message || result?.error || 'unknown'}${suffix}`);
        }

        const storeAfter = modules.getSummaryStore();
        const currentBatch = {
            endMesId: Number(result?.endMesId ?? storeAfter?.lastSummarizedMesId ?? -1),
            newEventIds: Array.isArray(result?.newEventIds) ? result.newEventIds : [],
            elapsedMs,
            beforeEndMesId: beforeEnd,
            afterSummary: buildStoreSummary(storeAfter),
        };
        batches.push(currentBatch);

        if (result?.noContent || Number(storeAfter?.lastSummarizedMesId ?? -1) >= targetMesId) {
            break;
        }
    }

    return batches.filter((item) => item?.kind !== 'status');
}

async function vectorizeEventSummaries(modules, chatId, vectorConfig, events) {
    if (!chatId || !vectorConfig?.enabled || !Array.isArray(events) || events.length === 0) {
        return { built: 0 };
    }

    const pairs = events
        .map((event) => ({
            eventId: event?.id,
            text: `${event?.title || ''} ${event?.summary || ''}`.trim(),
        }))
        .filter((item) => item.eventId && item.text);

    if (!pairs.length) {
        return { built: 0 };
    }

    const fingerprint = modules.getEngineFingerprint(vectorConfig);
    const batchSize = 20;
    let built = 0;

    for (let index = 0; index < pairs.length; index += batchSize) {
        const batch = pairs.slice(index, index + batchSize);
        const vectors = await modules.embed(batch.map((item) => item.text), vectorConfig);
        const items = batch.map((item, batchIndex) => ({
            eventId: item.eventId,
            vector: vectors[batchIndex],
        }));
        await modules.saveEventVectors(chatId, items, fingerprint);
        built += items.length;
    }

    return { built };
}

async function summarizeNaturalHistoryBeforeUser({
    modules,
    chatId,
    panelConfig,
    floor,
    historyThroughFloor,
    visibleMessages,
    nextCaseId,
}) {
    const store = modules.getSummaryStore();
    const lastSummarized = Number(store?.lastSummarizedMesId ?? -1);
    const pending = visibleMessages.length - lastSummarized - 1;
    const interval = Math.max(1, Number(panelConfig?.trigger?.interval) || 20);
    if (pending < interval || historyThroughFloor < 0) {
        return {
            floor,
            externalCalls: 0,
            externalRequests: 0,
            transportTrace: [],
            result: { triggered: false, pending, interval },
        };
    }

    const summaryAttempts = [];
    let countedSummary = null;
    let summaryResult = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
        let countedAttempt;
        try {
            countedAttempt = await withExternalCallTrace(() => modules.runSummaryGeneration(
                historyThroughFloor,
                panelConfig,
                {},
                { targetChatId: chatId },
            ));
        } catch (error) {
            const attemptTrace = error.externalTrace || [];
            summaryAttempts.push({
                calls: Number(error.externalCalls || attemptTrace.length),
                requestCount: Number(error.externalRequests || attemptTrace.length),
                trace: attemptTrace,
            });
            if (attempt >= 3) {
                const countedAll = mergeCountedExternal(...summaryAttempts);
                error.externalTrace = countedAll.transportTrace;
                error.externalCalls = countedAll.externalCalls;
                error.externalRequests = countedAll.externalRequests;
                error.goldFailure = error.goldFailure || {
                    stage: 'summary',
                    kind: 'request',
                    status: null,
                    caseId: nextCaseId || null,
                    message: String(error?.message || error),
                };
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
        }
        summaryAttempts.push(countedAttempt);
        summaryResult = countedAttempt.value;
        if (summaryResult?.success && !summaryResult?.cancelled && !summaryResult?.stale) {
            countedSummary = mergeCountedExternal(...summaryAttempts);
            break;
        }
        if (summaryResult?.cancelled || summaryResult?.stale || attempt >= 3) {
            const countedAll = mergeCountedExternal(...summaryAttempts);
            throwNaturalStageFailure(
                'summary',
                nextCaseId,
                `natural summary 失败: floor=${floor} ${summaryResult?.error?.message || summaryResult?.error || (summaryResult?.stale ? 'stale' : 'unknown')}`,
                {
                    calls: countedAll.externalCalls,
                    requestCount: countedAll.externalRequests,
                    trace: countedAll.transportTrace,
                },
            );
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (!countedSummary || !summaryResult?.success) {
        throwNaturalStageFailure('summary', nextCaseId, `natural summary 重试状态异常: floor=${floor}`);
    }

    const updatedStore = modules.getSummaryStore();
    const newEventIds = Array.isArray(summaryResult.newEventIds) ? summaryResult.newEventIds : [];
    const newEventIdSet = new Set(newEventIds);
    const newEvents = (updatedStore?.json?.events || []).filter(event => newEventIdSet.has(event?.id));
    if (summaryResult.aliasChanged) {
        modules.invalidateLexicalIndex();
    } else if (newEvents.length) {
        modules.addEventDocuments(newEvents);
    }

    let countedEvents = { calls: 0, requestCount: 0, trace: [], value: { built: 0 } };
    if (newEvents.length) {
        try {
            countedEvents = await withExternalCallTrace(() => vectorizeEventSummaries(
                modules,
                chatId,
                panelConfig.vector,
                newEvents,
            ));
        } catch (error) {
            error.goldFailure = error.goldFailure || {
                stage: 'event-embedding',
                kind: 'request',
                status: null,
                caseId: nextCaseId || null,
                message: String(error?.message || error),
            };
            throw error;
        }
    }

    return {
        floor,
        externalCalls: countedSummary.externalCalls + Number(countedEvents.calls || 0),
        externalRequests: countedSummary.externalRequests + Number(countedEvents.requestCount || 0),
        transportTrace: [...countedSummary.transportTrace, ...(countedEvents.trace || [])],
        result: {
            triggered: true,
            pending,
            interval,
            endMesId: summaryResult.endMesId,
            newEvents: newEvents.length,
            eventVectors: countedEvents.value?.built || 0,
        },
    };
}

function serializePromptRecallInput(normalizedRecall) {
    const { l1ByFloor, ...rest } = normalizedRecall || {};
    return {
        ...cloneJsonSafe(rest),
        l1ByFloorEntries: l1ByFloor instanceof Map
            ? [...l1ByFloor.entries()].map(([floor, value]) => [floor, cloneJsonSafe(value)])
            : Object.entries(l1ByFloor || {}).map(([floor, value]) => [Number(floor), cloneJsonSafe(value)]),
    };
}

function deserializePromptRecallInput(value = {}) {
    const { l1ByFloorEntries, ...rest } = value;
    return {
        ...cloneJsonSafe(rest),
        l1ByFloor: new Map((l1ByFloorEntries || []).map(([floor, item]) => [Number(floor), cloneJsonSafe(item)])),
    };
}

async function executeRecallCase(
    modules,
    vectorConfig,
    summaryConfig,
    recallCase,
    stageObserver = null,
    transportCassette = null,
) {
    const store = modules.getSummaryStore();
    const allEvents = store?.json?.events || [];
    const label = String(recallCase?.label || 'recall-case');
    const pendingUserMessage = recallCase?.pendingUserMessage ? String(recallCase.pendingUserMessage) : null;
    const excludeLastAi = !!recallCase?.excludeLastAi;
    const recallStartedAt = performance.now();
    const meta = await modules.getMeta(modules.getContext().chatId);
    const countedExecution = await withExternalCallTrace(
        async () => {
            let recallResult = null;
            try {
                recallResult = await modules.recallMemory(allEvents, vectorConfig, {
                    pendingUserMessage,
                    excludeLastAi,
                    stageObserver,
                    deferRuntimeRelease: true,
                });

                const normalizedRecall = {
                    ...recallResult,
                    events: recallResult?.events || [],
                    l0Selected: recallResult?.l0Selected || [],
                    l1ByFloor: recallResult?.l1ByFloor || new Map(),
                    causalChain: recallResult?.causalChain || [],
                    focusTerms: recallResult?.focusTerms || recallResult?.focusEntities || [],
                    focusCharacters: recallResult?.focusCharacters || [],
                    metrics: recallResult?.metrics || null,
                };

                const causalById = new Map(
                    (normalizedRecall.causalChain || [])
                        .map((item) => [item?.event?.id, item])
                        .filter((item) => item[0])
                );

                const builtPrompt = await modules.buildVectorPromptForReplay(
                    store,
                    normalizedRecall,
                    causalById,
                    normalizedRecall.focusCharacters || [],
                    meta,
                    normalizedRecall.metrics || null
                );

                return { normalizedRecall, builtPrompt };
            } finally {
                if (recallResult?.directEvidenceContext) {
                    await modules.releaseDirectEvidenceContext(
                        recallResult.directEvidenceContext,
                        recallResult.metrics,
                    );
                    recallResult.directEvidenceContext = null;
                }
            }
        },
        { cassette: transportCassette },
    );
    const recallMs = Math.round(performance.now() - recallStartedAt);
    const { normalizedRecall, builtPrompt } = countedExecution.value;

    let promptText = String(builtPrompt?.promptText || '');
    if (summaryConfig?.trigger?.wrapperHead) {
        promptText = `${summaryConfig.trigger.wrapperHead}\n${promptText}`;
    }
    if (summaryConfig?.trigger?.wrapperTail) {
        promptText = `${promptText}\n${summaryConfig.trigger.wrapperTail}`;
    }

    return {
        normalizedRecall,
        promptText,
        promptInput: {
            schemaVersion: 1,
            recallResult: serializePromptRecallInput(normalizedRecall),
            meta: cloneJsonSafe(meta),
            wrapperHead: String(summaryConfig?.trigger?.wrapperHead || ''),
            wrapperTail: String(summaryConfig?.trigger?.wrapperTail || ''),
        },
        evidenceTrace: builtPrompt?.evidenceTrace || { final: [], prompt: [] },
        recallMs,
        externalCalls: countedExecution.calls,
        externalRequests: countedExecution.requestCount ?? countedExecution.calls,
        transportTrace: countedExecution.trace,
        reportCase: {
            label,
            excludeLastAi,
            pendingUserMessagePreview: previewText(pendingUserMessage, 100),
            promptChars: promptText.length,
            externalCalls: countedExecution.calls,
            externalRequests: countedExecution.requestCount ?? countedExecution.calls,
            promptPreview: previewText(promptText, 300),
            metrics: cloneJsonSafe(builtPrompt?.metrics || normalizedRecall.metrics || null),
            injectionStats: cloneJsonSafe(builtPrompt?.injectionStats || null),
            resultCounts: {
                events: normalizedRecall.events.length,
                l0Selected: normalizedRecall.l0Selected.length,
                l1Floors: normalizedRecall.l1ByFloor instanceof Map ? normalizedRecall.l1ByFloor.size : 0,
                causalChain: normalizedRecall.causalChain.length,
                mustKeepFloors: Array.isArray(normalizedRecall.mustKeepFloors) ? normalizedRecall.mustKeepFloors.length : 0,
            },
            logText: modules.formatMetricsLog(
                builtPrompt?.metrics || normalizedRecall.metrics || modules.createMetrics()
            ),
        },
    };
}

async function runRecallCases(modules, vectorConfig, summaryConfig) {
    const recallCases = Array.isArray(summaryConfig.recallCases) && summaryConfig.recallCases.length
        ? summaryConfig.recallCases
        : [{ label: 'latest-context', excludeLastAi: false }];

    const results = [];
    for (const recallCase of recallCases) {
        const execution = await executeRecallCase(modules, vectorConfig, summaryConfig, {
            ...recallCase,
            label: recallCase?.label || `case-${results.length + 1}`,
        });
        results.push(execution.reportCase);
    }

    return results;
}

function buildBaselineComparison(report, baseline) {
    if (!baseline) return { available: false, warnings: [] };

    const warnings = [];
    const byLabel = new Map((baseline?.recall?.cases || []).map((item) => [item.label, item]));

    for (const currentCase of (report?.recall?.cases || [])) {
        const baselineCase = byLabel.get(currentCase.label);
        if (!baselineCase) continue;

        const currentL1Cosine = Number(currentCase?.metrics?.evidence?.l1CosineTime || 0);
        const baselineL1Cosine = Number(baselineCase?.metrics?.evidence?.l1CosineTime || 0);
        if (baselineL1Cosine > 0 && currentL1Cosine > Math.max(baselineL1Cosine * 1.5, baselineL1Cosine + 1000)) {
            warnings.push(`[${currentCase.label}] l1_cosine ${currentL1Cosine}ms > baseline ${baselineL1Cosine}ms`);
        }

        const currentRerank = Number(currentCase?.metrics?.evidence?.rerankTime || 0);
        const baselineRerank = Number(baselineCase?.metrics?.evidence?.rerankTime || 0);
        if (baselineRerank > 0 && currentRerank > Math.max(baselineRerank * 1.5, baselineRerank + 800)) {
            warnings.push(`[${currentCase.label}] floor_rerank ${currentRerank}ms > baseline ${baselineRerank}ms`);
        }

        const currentAttach = Number(currentCase?.metrics?.quality?.l1AttachRate || 0);
        const baselineAttach = Number(baselineCase?.metrics?.quality?.l1AttachRate || 0);
        if (baselineAttach > 0 && currentAttach < baselineAttach - 15) {
            warnings.push(`[${currentCase.label}] l1_attach_rate ${currentAttach}% < baseline ${baselineAttach}%`);
        }

        const currentRetention = Number(currentCase?.metrics?.quality?.rerankRetentionRate || 0);
        const baselineRetention = Number(baselineCase?.metrics?.quality?.rerankRetentionRate || 0);
        if (baselineRetention > 0 && currentRetention < baselineRetention - 15) {
            warnings.push(`[${currentCase.label}] rerank_retention_rate ${currentRetention}% < baseline ${baselineRetention}%`);
        }
    }

    return {
        available: true,
        baselineGeneratedAt: baseline?.meta?.generatedAt || null,
        warnings,
    };
}

function renderMarkdownReport(report) {
    const lines = [];
    lines.push('# Story Summary Replay Report');
    lines.push('');
    lines.push(`- 生成时间: ${report.meta.generatedAt}`);
    lines.push(`- 模式: ${report.meta.mode}`);
    lines.push(`- 样本: ${report.meta.samplePath}`);
    lines.push(`- chatId: ${report.meta.chatId}`);
    lines.push(`- snapshot: ${report.meta.snapshotPath}`);
    lines.push(`- 消息数: ${report.sample.messageCount}/${report.sample.totalSampleMessages}`);
    lines.push(`- 名称: ${report.sample.name1} / ${report.sample.name2}`);
    lines.push('');
    lines.push('## 总结阶段');
    lines.push('');
    lines.push(`- 批次数: ${report.summary.totalBatches}`);
    lines.push(`- lastSummarizedMesId: ${report.summary.store.lastSummarizedMesId}`);
    lines.push(`- events: ${report.summary.store.eventsCount}`);
    lines.push(`- facts: ${report.summary.store.factsCount}`);
    lines.push(`- arcs: ${report.summary.store.arcsCount}`);
    lines.push(`- characters.main: ${report.summary.store.charactersCount}`);
    lines.push('');
    lines.push('## 向量阶段');
    lines.push('');
    lines.push(`- enabled: ${report.vector.enabled}`);
    lines.push(`- L0 built: ${report.vector.l0?.built ?? 0}`);
    lines.push(`- L1 built: ${report.vector.l1?.built ?? 0}`);
    lines.push(`- L2 built: ${report.vector.l2?.built ?? 0}`);
    lines.push(`- stateAtoms: ${report.vector.stateAtomsCount}`);
    lines.push(`- stateVectors: ${report.vector.stateVectorsCount}`);
    lines.push(`- chunks: ${report.vector.storageStats?.chunks ?? 0}`);
    lines.push(`- chunkVectors: ${report.vector.storageStats?.chunkVectors ?? 0}`);
    lines.push(`- eventVectors: ${report.vector.storageStats?.eventVectors ?? 0}`);
    lines.push('');
    lines.push('## 计时');
    lines.push('');
    for (const [key, value] of Object.entries(report.timings || {})) {
        lines.push(`- ${key}: ${value}ms`);
    }
    lines.push('');
    lines.push('## Recall Cases');
    lines.push('');
    for (const recallCase of (report.recall.cases || [])) {
        lines.push(`### ${recallCase.label}`);
        lines.push('');
        lines.push(`- promptChars: ${recallCase.promptChars}`);
        lines.push(`- events: ${recallCase.resultCounts.events}`);
        lines.push(`- l0Selected: ${recallCase.resultCounts.l0Selected}`);
        lines.push(`- l1Floors: ${recallCase.resultCounts.l1Floors}`);
        lines.push(`- l1_cosine: ${recallCase.metrics?.evidence?.l1CosineTime ?? 0}ms`);
        lines.push(`- l1_chunk_db: ${recallCase.metrics?.evidence?.l1ChunkFetchTime ?? 0}ms`);
        lines.push(`- l1_vector_db: ${recallCase.metrics?.evidence?.l1VectorFetchTime ?? 0}ms`);
        lines.push(`- l1_cache_warm: ${!!recallCase.metrics?.evidence?.l1CacheWarm}`);
        lines.push(`- l1_cache_hits: chunks ${recallCase.metrics?.evidence?.l1ChunkCacheHits ?? 0}/${recallCase.metrics?.evidence?.l1ChunkCacheMisses ?? 0}, vectors ${recallCase.metrics?.evidence?.l1VectorCacheHits ?? 0}/${recallCase.metrics?.evidence?.l1VectorCacheMisses ?? 0}`);
        lines.push(`- l1_cache_fallback_db: ${recallCase.metrics?.evidence?.l1CacheFallbackDbTime ?? 0}ms`);
        lines.push(`- floor_rerank: ${recallCase.metrics?.evidence?.rerankTime ?? 0}ms`);
        lines.push(`- round1_embed: ${recallCase.metrics?.timing?.round1Embed ?? 0}ms`);
        lines.push(`- round2_embed: ${recallCase.metrics?.timing?.round2Embed ?? 0}ms`);
        lines.push(`- external_total: ${recallCase.metrics?.timing?.externalTotal ?? 0}ms`);
        lines.push(`- local_known_total: ${recallCase.metrics?.timing?.localKnownTotal ?? 0}ms`);
        lines.push(`- unattributed: ${recallCase.metrics?.timing?.unattributed ?? 0}ms`);
        lines.push(`- diffusion_breakdown: graph ${recallCase.metrics?.diffusion?.buildTime ?? 0}ms, ppr ${recallCase.metrics?.diffusion?.pprTime ?? 0}ms, post ${recallCase.metrics?.diffusion?.postVerifyTime ?? 0}ms, vector_map ${recallCase.metrics?.diffusion?.vectorMapTime ?? 0}ms, yield ${recallCase.metrics?.diffusion?.yieldCount ?? 0}/${recallCase.metrics?.diffusion?.yieldTime ?? 0}ms`);
        lines.push(`- l1_attach_rate: ${recallCase.metrics?.quality?.l1AttachRate ?? 0}%`);
        lines.push(`- rerank_retention_rate: ${recallCase.metrics?.quality?.rerankRetentionRate ?? 0}%`);
        if (recallCase.pendingUserMessagePreview) {
            lines.push(`- pendingUserMessage: ${recallCase.pendingUserMessagePreview}`);
        }
        const potentialIssues = recallCase.metrics?.quality?.potentialIssues || [];
        if (potentialIssues.length) {
            lines.push('- issues:');
            for (const issue of potentialIssues) {
                lines.push(`  - ${issue}`);
            }
        }
        lines.push('');
    }

    if (report.eventRerankGate) {
        lines.push('## Event Rerank Gate');
        lines.push('');
        lines.push(`- status: ${report.eventRerankGate.status}`);
        lines.push(`- source: ${report.eventRerankGate.sourceRunId}`);
        lines.push(`- cases: ${report.eventRerankGate.totals?.cases ?? 0}`);
        lines.push(`- externalCalls: ${report.eventRerankGate.totals?.externalCalls ?? 0}`);
        lines.push(`- targetsInPrompt: ${report.eventRerankGate.totals?.targetsInPrompt ?? 0}/${report.eventRerankGate.totals?.targets ?? 0}`);
        for (const item of (report.eventRerankGate.cases || [])) {
            lines.push(`- ${item.caseId}: batches=${item.rerankBatches}, calls=${item.externalCalls}, targets=${item.targets.map(target => `${target.eventId} ${target.beforeRank}->${target.rerankRank} prompt=${target.inPrompt}`).join('; ')}`);
        }
        lines.push('');
    }

    if (report.baselineComparison?.available) {
        lines.push('## Baseline Compare');
        lines.push('');
        lines.push(`- baselineGeneratedAt: ${report.baselineComparison.baselineGeneratedAt || 'unknown'}`);
        if (report.baselineComparison.warnings.length) {
            for (const warning of report.baselineComparison.warnings) {
                lines.push(`- WARNING: ${warning}`);
            }
        } else {
            lines.push('- 无明显退化');
        }
        lines.push('');
    }

    if (report.anomalies.length) {
        lines.push('## Anomalies');
        lines.push('');
        for (const anomaly of report.anomalies) {
            lines.push(`- ${anomaly}`);
        }
        lines.push('');
    }

    return lines.join('\n');
}

export async function runStorySummaryCancellationCheck() {
    ensureNodeReplayGlobals();
    const { generateSummary, isSummaryGenerationCancelledError } = await import(
        '../../modules/story-summary/generate/llm.js'
    );
    const previousStreamingModule = globalThis.window.xiaobaixStreamingGeneration;
    const cancelledSessions = [];
    globalThis.window.xiaobaixStreamingGeneration = {
        async xbgenrawCommand() {
            return 'summary-cancel-check';
        },
        getStatus(sessionId) {
            return { sessionId, isStreaming: true, text: '' };
        },
        cancel(sessionId) {
            cancelledSessions.push(sessionId);
        },
    };

    const controller = new AbortController();
    try {
        const pending = generateSummary({
            existingSummary: '',
            existingFacts: [],
            newHistoryText: '#1 【用户】\n测试取消',
            historyRange: '1-1楼',
            nextEventId: 1,
            existingEventCount: 0,
            llmApi: { provider: 'st' },
            useStream: true,
            signal: controller.signal,
        });
        setTimeout(() => controller.abort(), 0);
        await pending;
        return { cancelled: false, cancelledSessions };
    } catch (error) {
        return {
            cancelled: isSummaryGenerationCancelledError(error),
            cancelledSessions,
        };
    } finally {
        globalThis.window.xiaobaixStreamingGeneration = previousStreamingModule;
    }
}

export async function runStorySummaryPromptAssemblyCheck() {
    ensureNodeReplayGlobals();
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();
    globalThis.localStorage.setItem('summary_panel_config', JSON.stringify({
        prompts: { memoryTemplate: '{$剧情记忆}' },
        trigger: { wrapperHead: '', wrapperTail: '' },
        ui: { keepVisibleCount: 0 },
        vector: { enabled: true, summarizedEvidenceBudget: 3000 },
    }));

    const [{ EXT_ID }, { buildVectorPromptForReplay }, { createMetrics }] = await Promise.all([
        import('../../core/constants.js'),
        import('../../modules/story-summary/generate/prompt.js'),
        import('../../modules/story-summary/vector/retrieval/metrics.js'),
    ]);

    const store = {
        lastSummarizedMesId: -1,
        json: {
            keywords: [],
            events: [],
            characters: { main: [] },
            arcs: [],
            facts: [],
            characterAliases: [],
        },
    };
    __setExtensionSettings({ [EXT_ID]: { storySummary: { enabled: true } } });
    __setChatMetadata({ extensions: { [EXT_ID]: { storySummary: store } } });
    __setReplayContext({
        chatId: 'story-summary-prompt-assembly-check',
        chat: [],
        name1: '用户',
        name2: '角色',
        groupId: null,
        characterId: 'story-summary-prompt-assembly-check',
        saveMetadata: async () => {},
    });

    const temporalFloors = [0, 10, 20, 30, 40, 50, 60];
    const temporalEvents = temporalFloors.map((floor, index) => ({
        event: {
            id: `temporal-event-${index + 1}`,
            title: `TEMPORAL_EVENT_${index + 1}`,
            summary: `时间事件 ${index + 1} (#${floor + 1})`,
            participants: ['角色'],
        },
        _recallType: 'DIRECT',
        similarity: 1 - index / 100,
    }));
    const evidenceOwner = {
        event: {
            id: 'evidence-owner',
            title: 'EVIDENCE_OWNER',
            summary: '证据归属事件 (#101-110)',
            participants: ['角色'],
        },
        _recallType: 'DIRECT',
        _evidenceEligible: true,
        similarity: 0.5,
    };
    const events = [
        ...temporalEvents.slice(0, 5),
        evidenceOwner,
        ...temporalEvents.slice(5),
    ];

    const evidenceMarkers = {
        protected: 'PROTECTED_EVIDENCE',
        ordinaryHigh: 'ORDINARY_HIGH_EVIDENCE',
        temporalOverflow: 'TEMPORAL_OVERFLOW_EVIDENCE',
        ordinaryLow: 'ORDINARY_LOW_EVIDENCE',
    };
    const directEvidenceL1 = [
        {
            chunkId: 'protected-evidence',
            floor: 109,
            isUser: false,
            speaker: '角色',
            text: `${evidenceMarkers.protected} ${'P'.repeat(4000)}`,
            _directEvidenceTemporalCarrier: true,
            _directEvidencePassedMinScore: true,
        },
        {
            chunkId: 'ordinary-high-evidence',
            floor: 105,
            isUser: false,
            speaker: '角色',
            text: `${evidenceMarkers.ordinaryHigh} ${'H'.repeat(3000)}`,
            _directEvidencePassedMinScore: true,
        },
        {
            chunkId: 'temporal-overflow-evidence',
            floor: 101,
            isUser: false,
            speaker: '角色',
            text: `${evidenceMarkers.temporalOverflow} ${'O'.repeat(3000)}`,
            _directEvidenceTemporalCarrier: true,
            _directEvidencePassedMinScore: true,
        },
        {
            chunkId: 'ordinary-low-evidence',
            floor: 103,
            isUser: false,
            speaker: '角色',
            text: `${evidenceMarkers.ordinaryLow} ${'L'.repeat(3000)}`,
            _directEvidencePassedMinScore: true,
        },
    ];

    const externalCalls = [];
    const previousFetch = globalThis.fetch;
    const previousStreamingModule = globalThis.window.xiaobaixStreamingGeneration;
    globalThis.fetch = async () => {
        externalCalls.push('fetch');
        throw new Error('Prompt assembly check forbids network access');
    };
    globalThis.window.xiaobaixStreamingGeneration = {
        async xbgenrawCommand() {
            externalCalls.push('streaming-generation');
            throw new Error('Prompt assembly check forbids generation');
        },
    };

    try {
        const metrics = createMetrics();
        const built = await buildVectorPromptForReplay(
            store,
            {
                events,
                eventTemporalFloors: temporalFloors,
                l0Selected: [],
                l1ByFloor: new Map(),
                directEvidenceStatus: 'applied',
                directEvidenceL1,
                directEvidenceContext: null,
            },
            new Map(),
            [],
            { lastChunkFloor: -1 },
            metrics,
        );
        const promptText = String(built?.promptText || '');
        const renderedEvidenceFloors = [...promptText.matchAll(/^\s*[┌›]\s+#(\d+)\s+\[[^\]]+\]/gm)]
            .map(match => Number(match[1]));

        return {
            externalCalls,
            event: {
                temporalWinners: metrics.event.temporalWinners,
                temporalProtectionCap: metrics.event.temporalProtectionCap,
                temporalProtected: metrics.event.temporalProtected,
                temporalOverflow: metrics.event.temporalOverflow,
                overflowRendered: temporalEvents.slice(5).map(item => promptText.includes(item.event.title)),
            },
            evidence: {
                summarizedBudgetMax: metrics.evidence.summarizedBudgetMax,
                temporalProtectionBudgetMax: metrics.evidence.directEvidenceTemporalProtectionBudgetMax,
                temporalProtectedItems: metrics.evidence.directEvidenceTemporalProtectedItems,
                temporalProtectedTokens: metrics.evidence.directEvidenceTemporalProtectedTokens,
                enumerated: metrics.evidence.directEvidenceEnumerated,
                admitted: metrics.evidence.directEvidenceAdmitted,
                skippedByBudget: metrics.evidence.directEvidenceSkippedByBudget,
                renderedEvidenceFloors,
                markerRendered: Object.fromEntries(
                    Object.entries(evidenceMarkers).map(([name, marker]) => [name, promptText.includes(marker)]),
                ),
            },
        };
    } finally {
        if (previousFetch === undefined) delete globalThis.fetch;
        else globalThis.fetch = previousFetch;
        globalThis.window.xiaobaixStreamingGeneration = previousStreamingModule;
    }
}

export async function runStorySummaryPostCommitCancellationCheck() {
    ensureNodeReplayGlobals();
    const [{ EXT_ID }, { runSummaryGeneration }] = await Promise.all([
        import('../../core/constants.js'),
        import('../../modules/story-summary/generate/generator.js'),
    ]);
    const chatId = 'summary-post-commit-cancel-check';
    __setExtensionSettings({ [EXT_ID]: { storySummary: { enabled: true } } });
    __setChatMetadata({});
    __resetMetadataSaveCount();
    __setReplayContext({
        chatId,
        chat: [{ is_user: true, name: '用户', mes: '测试提交后的取消' }],
        name1: '用户',
        name2: '角色',
    });

    const previousStreamingModule = globalThis.window.xiaobaixStreamingGeneration;
    globalThis.window.xiaobaixStreamingGeneration = {
        async xbgenrawCommand() {
            return JSON.stringify({
                mindful_prelude: {},
                keywords: [],
                events: [],
                newCharacters: [],
                arcUpdates: [],
                factUpdates: [],
            });
        },
        cancel() {},
    };

    const controller = new AbortController();
    let onCompleteCalled = false;
    try {
        const result = await runSummaryGeneration(0, {
            api: { provider: 'st' },
            gen: {},
            trigger: { useStream: false, maxPerRun: 100 },
        }, {
            onComplete: async () => {
                onCompleteCalled = true;
                controller.abort();
            },
        }, {
            signal: controller.signal,
            targetChatId: chatId,
        });
        return {
            result,
            onCompleteCalled,
            immediateMetadataSaveCalls: __immediateMetadataSaveCallCount,
            debouncedMetadataSaveCalls: __debouncedMetadataSaveCallCount,
        };
    } finally {
        globalThis.window.xiaobaixStreamingGeneration = previousStreamingModule;
    }
}

export async function runStorySummaryOwnershipCheck() {
    ensureNodeReplayGlobals();
    const [{ EXT_ID }, { runSummaryGeneration }] = await Promise.all([
        import('../../core/constants.js'),
        import('../../modules/story-summary/generate/generator.js'),
    ]);
    const ownerChatId = 'summary-owner-a';
    const chat = [{ is_user: true, name: '用户', mes: '测试聊天所有权' }];
    __setExtensionSettings({ [EXT_ID]: { storySummary: { enabled: true } } });
    __setChatMetadata({});
    __resetMetadataSaveCount();
    __setReplayContext({ chatId: ownerChatId, chat, name1: '用户', name2: '角色' });

    const previousStreamingModule = globalThis.window.xiaobaixStreamingGeneration;
    globalThis.window.xiaobaixStreamingGeneration = {
        async xbgenrawCommand() {
            __setReplayContext({ chatId: 'summary-owner-b' });
            return JSON.stringify({
                mindful_prelude: {},
                keywords: [],
                events: [],
                newCharacters: [],
                arcUpdates: [],
                factUpdates: [],
            });
        },
        cancel() {},
    };

    try {
        const result = await runSummaryGeneration(0, {
            api: { provider: 'st' },
            gen: {},
            trigger: { useStream: false, maxPerRun: 100 },
        }, {}, { targetChatId: ownerChatId });
        return {
            result,
            metadataSaveCalls: __saveMetadataCallCount,
            lastSummarizedMesId: chat_metadata?.extensions?.[EXT_ID]?.storySummary?.lastSummarizedMesId,
        };
    } finally {
        globalThis.window.xiaobaixStreamingGeneration = previousStreamingModule;
    }
}

export async function runStorySummarySourceMutationCheck() {
    ensureNodeReplayGlobals();
    const [{ EXT_ID }, { runSummaryGeneration }] = await Promise.all([
        import('../../core/constants.js'),
        import('../../modules/story-summary/generate/generator.js'),
    ]);
    const chatId = 'summary-source-mutation-check';
    const chat = [{ is_user: true, name: '用户', mes: '原始内容' }];
    __setExtensionSettings({ [EXT_ID]: { storySummary: { enabled: true } } });
    __setChatMetadata({});
    __resetMetadataSaveCount();
    __setReplayContext({ chatId, chat, name1: '用户', name2: '角色' });

    const previousStreamingModule = globalThis.window.xiaobaixStreamingGeneration;
    globalThis.window.xiaobaixStreamingGeneration = {
        async xbgenrawCommand() {
            chat[0].mes = '生成期间已修改';
            return JSON.stringify({
                mindful_prelude: {},
                keywords: [],
                events: [],
                newCharacters: [],
                arcUpdates: [],
                factUpdates: [],
            });
        },
        cancel() {},
    };

    try {
        const result = await runSummaryGeneration(0, {
            api: { provider: 'st' },
            gen: {},
            trigger: { useStream: false, maxPerRun: 100 },
        }, {}, { targetChatId: chatId });
        return {
            result,
            metadataSaveCalls: __saveMetadataCallCount,
            lastSummarizedMesId: chat_metadata?.extensions?.[EXT_ID]?.storySummary?.lastSummarizedMesId,
        };
    } finally {
        globalThis.window.xiaobaixStreamingGeneration = previousStreamingModule;
    }
}

export async function runStorySummaryRollbackIntegrityCheck() {
    ensureNodeReplayGlobals();
    const [{ EXT_ID }, { buildSummaryUndo }, storeModule] = await Promise.all([
        import('../../core/constants.js'),
        import('../../modules/story-summary/data/summary-undo.js'),
        import('../../modules/story-summary/data/store.js'),
    ]);
    const {
        executeRollback,
        isSummaryConsumable,
        rollbackSummaryIfNeeded,
    } = storeModule;
    __setExtensionSettings({ [EXT_ID]: { storySummary: { enabled: true } } });

    const empty = {
        keywords: [],
        events: [],
        characters: { main: [] },
        arcs: [],
        facts: [],
        characterAliases: [],
    };
    const generated = structuredClone(empty);
    generated.events.push({ id: 'evt-ai', summary: '首批生成事件', participants: [], _addedAt: 10 });
    const current = structuredClone(generated);
    current.events.push({ id: 'evt-manual', summary: '人工新增事件', participants: [], _addedAt: 11 });
    const firstStore = {
        lastSummarizedMesId: 10,
        json: current,
        summaryHistory: [{
            format: 1,
            previousEndMesId: -1,
            endMesId: 10,
            undo: buildSummaryUndo(empty, generated),
        }],
    };
    const firstMetadata = { extensions: { [EXT_ID]: { storySummary: firstStore } } };
    __setChatMetadata(firstMetadata);
    __setReplayContext({
        chatId: 'summary-first-rollback-check',
        chat: [],
        name1: '用户',
        name2: '角色',
    });
    const firstResult = await executeRollback('summary-first-rollback-check', firstStore, -1);

    const touchedJson = structuredClone(generated);
    touchedJson.events[0].summary = '人工改写生成事件';
    const touchedStore = {
        lastSummarizedMesId: 10,
        json: touchedJson,
        summaryHistory: [{
            format: 1,
            previousEndMesId: -1,
            endMesId: 10,
            undo: buildSummaryUndo(empty, generated),
        }],
    };
    __setChatMetadata({ extensions: { [EXT_ID]: { storySummary: touchedStore } } });
    __setReplayContext({ chatId: 'summary-first-rollback-touched-check', chat: [] });
    const touchedResult = await executeRollback('summary-first-rollback-touched-check', touchedStore, -1);

    const invalidStore = {
        lastSummarizedMesId: 10,
        json: structuredClone(generated),
        summaryHistory: [{ format: 1, endMesId: 10 }],
    };
    const invalidMetadata = {
        ena_cached_story_summary: '旧的 Ena 派生缓存',
        extensions: { [EXT_ID]: { storySummary: invalidStore } },
    };
    const shortenedChat = Array.from({ length: 5 }, (_, index) => ({
        is_user: index % 2 === 0,
        mes: `消息 ${index + 1}`,
    }));
    __setChatMetadata(invalidMetadata);
    __setReplayContext({
        chatId: 'summary-invalid-rollback-check',
        chat: shortenedChat,
        name1: '用户',
        name2: '角色',
    });
    const invalidResult = await rollbackSummaryIfNeeded();
    shortenedChat.push(...Array.from({ length: 7 }, (_, index) => ({
        is_user: index % 2 === 0,
        mes: `重新增长 ${index + 1}`,
    })));

    return {
        firstResult,
        firstEventIds: (firstStore.json?.events || []).map(event => event.id),
        firstBoundary: firstStore.lastSummarizedMesId,
        firstPendingBoundary: firstStore.pendingImportBoundary === true,
        touchedResult,
        touchedSummary: touchedStore.json?.events?.[0]?.summary || '',
        invalidResult,
        summaryInvalid: invalidStore.summaryInvalid === true,
        consumableAfterRegrowth: isSummaryConsumable(invalidStore, shortenedChat.length),
        legacyEnaCacheRemoved: !Object.hasOwn(invalidMetadata, 'ena_cached_story_summary'),
    };
}

export async function runStorySummaryReplay({ rootDir, config, configPath }) {
    ensureNodeReplayGlobals();
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();

    const mode = normalizeReplayMode(config?.mode);
    const outputDir = resolveFromRoot(rootDir, config?.outputPath || 'scripts/story-summary-replay-output');
    const samplePath = resolveFromRoot(rootDir, config?.samplePath);
    if (!samplePath) {
        throw new Error('Missing config.samplePath');
    }

    await ensureDir(outputDir);
    const snapshotPath = resolveSnapshotPath(rootDir, config, outputDir);

    const stageTimings = {};
    const anomalies = [];

    const sampleStartedAt = performance.now();
    const sample = await loadSampleChat(
        samplePath,
        mode === 'event-rerank-gate' ? { ...config, maxFloors: undefined } : config,
    );
    withTiming(stageTimings, 'sample_load', performance.now() - sampleStartedAt);
    let replayMessages = sample.messages;

    const { chatId, replayKey } = buildReplayIdentity(samplePath, config);

    const extSettings = {};
    const panelConfig = buildReplayPanelConfig(config || {});

    __setExtensionSettings(extSettings);
    __setChatMetadata({});
    __setReplayContext({
        chatId,
        chat: replayMessages,
        name1: sample.names.name1,
        name2: sample.names.name2,
        groupId: null,
        characterId: 'story-summary-replay',
        saveMetadata: async () => {},
    });
    __resetMetadataSaveCount();

    globalThis.localStorage.setItem('summary_panel_config', JSON.stringify(panelConfig));
    globalThis.window.xiaobaixStreamingGeneration = createStreamingGenerationShim(panelConfig.api);

    const modules = await (async () => {
        const [{ EXT_ID }, configModule, storeModule, generatorModule, promptModule, chunkStoreModule, chunkBuilderModule, stateStoreModule, stateIntegrationModule, recallModule, eventRerankModule, metricsModule, embedderModule, lexicalIndexModule] = await Promise.all([
            import('../../core/constants.js'),
            import('../../modules/story-summary/data/config.js'),
            import('../../modules/story-summary/data/store.js'),
            import('../../modules/story-summary/generate/generator.js'),
            import('../../modules/story-summary/generate/prompt.js'),
            import('../../modules/story-summary/vector/storage/chunk-store.js'),
            import('../../modules/story-summary/vector/pipeline/chunk-builder.js'),
            import('../../modules/story-summary/vector/storage/state-store.js'),
            import('../../modules/story-summary/vector/pipeline/state-integration.js'),
            import('../../modules/story-summary/vector/retrieval/recall.js'),
            import('../../modules/story-summary/vector/retrieval/event-rerank.js'),
            import('../../modules/story-summary/vector/retrieval/metrics.js'),
            import('../../modules/story-summary/vector/utils/embedder.js'),
            import('../../modules/story-summary/vector/retrieval/lexical-index.js'),
        ]);

        extSettings[EXT_ID] = { storySummary: { enabled: true } };

        return {
            ...configModule,
            ...storeModule,
            ...generatorModule,
            ...promptModule,
            ...chunkStoreModule,
            ...chunkBuilderModule,
            ...stateStoreModule,
            ...stateIntegrationModule,
            ...recallModule,
            ...eventRerankModule,
            ...metricsModule,
            ...embedderModule,
            ...lexicalIndexModule,
            getContext: () => ({
                chatId,
                chat: replayMessages,
                name1: sample.names.name1,
                name2: sample.names.name2,
            }),
        };
    })();

    const targetMesId = sample.messages.length - 1;
    if (targetMesId < 0) {
        throw new Error('Sample contains no usable chat messages.');
    }

    const shouldBootstrap = mode === 'full' || mode === 'bootstrap';
    const shouldRunRecall = mode === 'full' || mode === 'recall-only' || mode === 'recall-cassette';
    const shouldRunPromptOnly = mode === 'prompt-only';
    const shouldRunNaturalCapture = mode === 'natural-capture';
    const shouldRunNaturalResume = mode === 'natural-resume';
    const shouldRunNaturalRecall = mode === 'natural-recall';
    const shouldRunEventRerankGate = mode === 'event-rerank-gate';
    const goldPlan = shouldRunPromptOnly
        || shouldRunNaturalCapture
        || shouldRunNaturalResume
        || shouldRunNaturalRecall
        || shouldRunEventRerankGate
        ? null
        : await prepareGoldEvalPlan({ rootDir, config, boundaryFloor: targetMesId });
    const naturalPlan = shouldRunNaturalCapture
        ? await prepareNaturalCapturePlan({ rootDir, config, sample })
        : null;
    const naturalRecallPlan = shouldRunNaturalRecall
        ? await prepareNaturalRecallPlan({ rootDir, config, sample, samplePath })
        : null;
    const naturalResumePlan = shouldRunNaturalResume
        ? await prepareNaturalResumePlan({ rootDir, config, sample, samplePath })
        : null;
    const eventRerankGatePlan = shouldRunEventRerankGate
        ? await prepareEventRerankGate({ rootDir, config, samplePath })
        : null;
    if (goldPlan && !shouldRunRecall) {
        throw new Error('Gold Eval 需要 full 或 recall-only 模式');
    }
    if (goldPlan && !panelConfig.vector?.enabled) {
        throw new Error('Gold Eval 需要启用 vectorConfig.enabled');
    }
    if (naturalPlan && !panelConfig.vector?.enabled) {
        throw new Error('natural-capture 需要启用 vectorConfig.enabled');
    }
    if (naturalRecallPlan && !panelConfig.vector?.enabled) {
        throw new Error('natural-recall 需要启用 vectorConfig.enabled');
    }
    if (naturalResumePlan && !panelConfig.vector?.enabled) {
        throw new Error('natural-resume 需要启用 vectorConfig.enabled');
    }
    if (eventRerankGatePlan && panelConfig.vector?.eventRerankEnabled !== true) {
        throw new Error('event-rerank-gate 需要 --event-rerank=true');
    }
    if (shouldRunPromptOnly && !config?.goldEval?.captureRunDir) {
        throw new Error('prompt-only 需要 goldEval.captureRunDir');
    }
    if (mode === 'recall-cassette' && !config?.goldEval?.captureRunDir) {
        throw new Error('recall-cassette 需要 goldEval.captureRunDir');
    }

    let snapshot = null;
    let snapshotUsed = false;
    let snapshotWritten = false;
    let summaryBatches = [];
    let summaryStoreSnapshot = buildStoreSummary(modules.getSummaryStore());

    let vectorReport = {
        enabled: !!panelConfig.vector?.enabled,
        l0: { built: 0 },
        l1: { built: 0 },
        l2: { built: 0 },
        stateAtomsCount: 0,
        stateVectorsCount: 0,
        storageStats: null,
        source: shouldRunNaturalCapture
            ? 'natural-incremental'
            : (shouldRunNaturalResume
                ? 'natural-boundary-resume'
                : (shouldRunNaturalRecall
                    ? 'natural-boundary-replay'
                    : (shouldRunEventRerankGate
                        ? 'frozen-event-rerank-gate'
                        : (shouldBootstrap ? 'bootstrap' : 'snapshot')))),
    };

    let recallCases = [];
    let goldEvalResult = null;
    let eventRerankGateResult = null;

    if (shouldRunNaturalCapture) {
        await resetReplayStores(modules, chatId);
        replayMessages = [];
        __setReplayContext({ chat: replayMessages });
        const naturalStartedAt = performance.now();
        goldEvalResult = await runNaturalCaptureCases({
            modules,
            plan: naturalPlan,
            sample,
            samplePath,
            config,
            setVisibleHistory: async (messages) => {
                replayMessages = messages;
                __setReplayContext({ chat: replayMessages });
            },
            summarizeBeforeUser: args => summarizeNaturalHistoryBeforeUser({
                modules,
                chatId,
                panelConfig,
                ...args,
            }),
            maintainAfterAi: args => maintainNaturalHistoryAfterAi({
                modules,
                chatId,
                panelConfig,
                ...args,
            }),
            assertHistoryHealthy: args => assertNaturalHistoryHealthy({
                modules,
                chatId,
                ...args,
            }),
            writeBoundarySnapshot: ({ snapshotPath: destination, goldCase, visibleMessages }) => (
                writeNaturalBoundarySnapshot(
                    modules,
                    chatId,
                    sample,
                    samplePath,
                    config,
                    destination,
                    visibleMessages,
                    goldCase,
                )
            ),
            writeRecoverySnapshot: ({ snapshotPath: destination, visibleMessages, resumeFloor, preparation }) => (
                writeNaturalRecoverySnapshot(
                    modules,
                    chatId,
                    sample,
                    samplePath,
                    config,
                    destination,
                    visibleMessages,
                    resumeFloor,
                    preparation,
                )
            ),
            executeRecallCase: (recallCase, stageObserver, transportCassette) => executeRecallCase(
                modules,
                panelConfig.vector,
                panelConfig,
                recallCase,
                stageObserver,
                transportCassette,
            ),
        });
        withTiming(stageTimings, 'natural_capture', performance.now() - naturalStartedAt);
        recallCases = goldEvalResult.replayCases;
        summaryStoreSnapshot = buildStoreSummary(modules.getSummaryStore());
        summaryBatches = recallCases
            .flatMap(item => item.preparation || [])
            .filter(item => item.stage?.startsWith('summary-before-user:') && item.result?.triggered);
    } else if (shouldRunNaturalResume) {
        replayMessages = [];
        __setReplayContext({ chat: replayMessages });
        const naturalResumeStartedAt = performance.now();
        goldEvalResult = await runNaturalResumeCases({
            modules,
            plan: naturalResumePlan,
            sample,
            samplePath,
            config,
            restoreResumeBoundary: async ({ snapshot, visibleMessages }) => {
                replayMessages = visibleMessages;
                __setReplayContext({ chat: replayMessages });
                await restoreReplaySnapshot(modules, chatId, snapshot);
            },
            setVisibleHistory: async (messages) => {
                replayMessages = messages;
                __setReplayContext({ chat: replayMessages });
            },
            summarizeBeforeUser: args => summarizeNaturalHistoryBeforeUser({
                modules,
                chatId,
                panelConfig,
                ...args,
            }),
            maintainAfterAi: args => maintainNaturalHistoryAfterAi({
                modules,
                chatId,
                panelConfig,
                ...args,
            }),
            assertHistoryHealthy: args => assertNaturalHistoryHealthy({
                modules,
                chatId,
                ...args,
            }),
            writeBoundarySnapshot: ({ snapshotPath: destination, goldCase, visibleMessages }) => (
                writeNaturalBoundarySnapshot(
                    modules,
                    chatId,
                    sample,
                    samplePath,
                    config,
                    destination,
                    visibleMessages,
                    goldCase,
                )
            ),
            writeRecoverySnapshot: ({ snapshotPath: destination, visibleMessages, resumeFloor, preparation }) => (
                writeNaturalRecoverySnapshot(
                    modules,
                    chatId,
                    sample,
                    samplePath,
                    config,
                    destination,
                    visibleMessages,
                    resumeFloor,
                    preparation,
                )
            ),
            executeRecallCase: (recallCase, stageObserver, transportCassette) => executeRecallCase(
                modules,
                panelConfig.vector,
                panelConfig,
                recallCase,
                stageObserver,
                transportCassette,
            ),
        });
        withTiming(stageTimings, 'natural_resume', performance.now() - naturalResumeStartedAt);
        recallCases = goldEvalResult.replayCases;
        summaryStoreSnapshot = buildStoreSummary(modules.getSummaryStore());
        summaryBatches = recallCases
            .flatMap(item => item.preparation || [])
            .filter(item => item.stage?.startsWith('summary-before-user:') && item.result?.triggered);
    } else if (shouldRunNaturalRecall) {
        replayMessages = [];
        __setReplayContext({ chat: replayMessages });
        const naturalRecallStartedAt = performance.now();
        goldEvalResult = await runNaturalRecallCases({
            modules,
            plan: naturalRecallPlan,
            sample,
            samplePath,
            config,
            restoreBoundarySnapshot: async ({ snapshot, visibleMessages }) => {
                replayMessages = visibleMessages;
                __setReplayContext({ chat: replayMessages });
                await restoreReplaySnapshot(modules, chatId, snapshot);
            },
            executeRecallCase: (recallCase, stageObserver, transportCassette) => executeRecallCase(
                modules,
                panelConfig.vector,
                panelConfig,
                recallCase,
                stageObserver,
                transportCassette,
            ),
        });
        withTiming(stageTimings, 'natural_recall', performance.now() - naturalRecallStartedAt);
        recallCases = goldEvalResult.replayCases;
        summaryStoreSnapshot = buildStoreSummary(modules.getSummaryStore());
    } else if (shouldRunEventRerankGate) {
        replayMessages = [];
        __setReplayContext({ chat: replayMessages });
        const gateStartedAt = performance.now();
        eventRerankGateResult = await runEventRerankGate({
            plan: eventRerankGatePlan,
            executeCase: async ({ goldCase, promptInput, snapshot }) => {
                replayMessages = sample.messages.slice(0, goldCase.atFloor);
                __setReplayContext({ chat: replayMessages });
                await restoreReplaySnapshot(modules, chatId, snapshot);

                const recallResult = deserializePromptRecallInput(promptInput?.production?.recallResult || {});
                const enrichment = recallResult.enrichmentContext || {};
                if (!Array.isArray(enrichment.focusVector) || !enrichment.focusVector.length) {
                    throw new Error(`冻结输入缺少 focusVector: ${goldCase.id}`);
                }
                const beforeEvents = recallResult.events || [];
                const counted = await withExternalCallTrace(() => modules.rerankEventsForPrompt(
                    beforeEvents,
                    {
                        query: String(goldCase?.query?.text || goldCase?.queryText || ''),
                        focusVector: enrichment.focusVector,
                        chatId,
                        chat: replayMessages,
                    },
                ));
                const rerank = counted.value;
                const afterEvents = rerank?.events || beforeEvents;
                const rerankedRecall = { ...recallResult, events: afterEvents };
                const causalById = new Map(
                    (rerankedRecall.causalChain || [])
                        .map(item => [item?.event?.id, item])
                        .filter(item => item[0]),
                );
                const built = await modules.buildVectorPromptForReplay(
                    modules.getSummaryStore(),
                    rerankedRecall,
                    causalById,
                    rerankedRecall.focusCharacters || [],
                    cloneJsonSafe(promptInput?.production?.meta || {}),
                    cloneJsonSafe(rerankedRecall.metrics || null),
                );
                let promptText = String(built?.promptText || '');
                if (promptInput?.production?.wrapperHead) {
                    promptText = `${promptInput.production.wrapperHead}\n${promptText}`;
                }
                if (promptInput?.production?.wrapperTail) {
                    promptText = `${promptText}\n${promptInput.production.wrapperTail}`;
                }
                return {
                    beforeEvents,
                    afterEvents,
                    rerank,
                    promptText,
                    evidenceTrace: built?.evidenceTrace || { final: [], prompt: [] },
                    transportTrace: counted.trace || [],
                };
            },
        });
        withTiming(stageTimings, 'event_rerank_gate', performance.now() - gateStartedAt);
        summaryStoreSnapshot = buildStoreSummary(modules.getSummaryStore());
    } else if (shouldBootstrap) {
        await resetReplayStores(modules, chatId);

        const summaryStartedAt = performance.now();
        summaryBatches = await runSummaryBatches(modules, targetMesId, panelConfig);
        withTiming(stageTimings, 'summary_generation', performance.now() - summaryStartedAt);

        const summaryStore = modules.getSummaryStore();
        summaryStoreSnapshot = buildStoreSummary(summaryStore);

        if (summaryStoreSnapshot.eventsCount === 0) {
            anomalies.push('总结完成后 events 为空。');
        }
        if (summaryStoreSnapshot.lastSummarizedMesId !== targetMesId) {
            anomalies.push(`lastSummarizedMesId=${summaryStoreSnapshot.lastSummarizedMesId}，未到目标 ${targetMesId}`);
        }
    } else {
        const snapshotStartedAt = performance.now();
        snapshot = await readSnapshotFile(snapshotPath);
        validateReplaySnapshot(snapshot, samplePath, sample, config);
        await restoreReplaySnapshot(modules, chatId, snapshot);
        snapshotUsed = true;
        withTiming(stageTimings, 'snapshot_restore', performance.now() - snapshotStartedAt);
        summaryStoreSnapshot = buildStoreSummary(modules.getSummaryStore());
    }

    if (panelConfig.vector?.enabled && (shouldRunNaturalCapture || shouldRunNaturalResume || shouldRunNaturalRecall)) {
        const stats = await modules.getStorageStats(chatId);
        vectorReport = {
            enabled: true,
            l0: { built: modules.getStateAtomsCount() },
            l1: { built: stats?.chunks || 0 },
            l2: { built: stats?.eventVectors || 0 },
            stateAtomsCount: modules.getStateAtomsCount(),
            stateVectorsCount: await modules.getStateVectorsCount(chatId),
            storageStats: stats,
            source: shouldRunNaturalCapture
                ? 'natural-incremental'
                : (shouldRunNaturalResume ? 'natural-boundary-resume' : 'natural-boundary-replay'),
        };
    } else if (panelConfig.vector?.enabled && shouldBootstrap) {
        const summaryStore = modules.getSummaryStore();
        const vectorStartedAt = performance.now();
        await modules.getMeta(chatId);
        const l0Result = await modules.incrementalExtractAtoms(chatId, sample.messages, null, { maxFloors: Infinity });
        const l0Stats = await modules.getAnchorStats();
        const l1Result = await modules.buildAllChunks({ vectorConfig: panelConfig.vector });
        const l2Result = await vectorizeEventSummaries(modules, chatId, panelConfig.vector, summaryStore?.json?.events || []);
        withTiming(stageTimings, 'vector_pipeline', performance.now() - vectorStartedAt);

        const stats = await modules.getStorageStats(chatId);
        const stateAtomsCount = modules.getStateAtomsCount();
        const stateVectorsCount = await modules.getStateVectorsCount(chatId);
        const bootstrapHealth = assertBootstrapHealthy({
            targetFloor: targetMesId,
            summaryStore,
            l0Result,
            l0Stats,
            l1Result,
            l2Result,
            stateAtomsCount,
            stateVectorsCount,
            storageStats: stats,
        });
        vectorReport = {
            enabled: true,
            l0: l0Result,
            health: bootstrapHealth,
            l1: l1Result,
            l2: l2Result,
            stateAtomsCount,
            stateVectorsCount,
            storageStats: stats,
        };

        if ((stats?.chunks || 0) === 0) {
            anomalies.push('向量启用，但 chunks 为 0。');
        }
        if ((stats?.eventVectors || 0) === 0) {
            anomalies.push('向量启用，但 eventVectors 为 0。');
        }
    } else if (panelConfig.vector?.enabled) {
        const stats = await modules.getStorageStats(chatId);
        vectorReport = {
            enabled: true,
            l0: { built: modules.getStateAtomsCount() },
            l1: { built: stats?.chunks || 0 },
            l2: { built: stats?.eventVectors || 0 },
            stateAtomsCount: modules.getStateAtomsCount(),
            stateVectorsCount: await modules.getStateVectorsCount(chatId),
            storageStats: stats,
            source: 'snapshot',
        };
    }

    if (shouldBootstrap) {
        snapshot = await writeReplaySnapshot(modules, chatId, sample, samplePath, config, snapshotPath);
        snapshotWritten = true;
    }

    if (panelConfig.vector?.enabled && shouldRunRecall) {
        const recallStartedAt = performance.now();
        if (goldPlan) {
            goldEvalResult = await runGoldEvalCases({
                modules,
                goldPlan,
                sample,
                samplePath,
                snapshotPath,
                config,
                executeRecallCase: (recallCase, stageObserver, transportCassette) => executeRecallCase(
                    modules,
                    panelConfig.vector,
                    panelConfig,
                    recallCase,
                    stageObserver,
                    transportCassette,
                ),
            });
            recallCases = goldEvalResult.replayCases;
        } else {
            recallCases = await runRecallCases(modules, panelConfig.vector, {
                ...panelConfig,
                recallCases: config?.recallCases,
            });
        }
        withTiming(stageTimings, 'recall_and_prompt', performance.now() - recallStartedAt);
    }

    if (shouldRunPromptOnly) {
        const promptStartedAt = performance.now();
        const captureRunDir = resolveFromRoot(rootDir, config.goldEval.captureRunDir);
        const runsRoot = resolveFromRoot(rootDir, config.goldEval.runsRoot);
        if (!runsRoot) throw new Error('prompt-only 需要 goldEval.runsRoot');
        goldEvalResult = await runGoldPromptOnly({
            captureRunDir,
            runsRoot,
            runName: String(config.goldEval.runName || 'gold-prompt-only'),
            config,
            samplePath,
            snapshotPath,
            buildPrompt: async (productionInput) => {
                const recallResult = deserializePromptRecallInput(productionInput?.recallResult || {});
                const causalById = new Map(
                    (recallResult.causalChain || [])
                        .map(item => [item?.event?.id, item])
                        .filter(item => item[0]),
                );
                const counted = await withExternalCallTrace(() => modules.buildVectorPromptForReplay(
                    modules.getSummaryStore(),
                    recallResult,
                    causalById,
                    recallResult.focusCharacters || [],
                    cloneJsonSafe(productionInput?.meta || {}),
                    cloneJsonSafe(recallResult.metrics || null),
                ));
                const built = counted.value || {};
                let promptText = String(built.promptText || '');
                if (productionInput?.wrapperHead) promptText = `${productionInput.wrapperHead}\n${promptText}`;
                if (productionInput?.wrapperTail) promptText = `${promptText}\n${productionInput.wrapperTail}`;
                return {
                    promptText,
                    evidenceTrace: built.evidenceTrace || { final: [], prompt: [] },
                    externalCalls: counted.calls,
                };
            },
        });
        withTiming(stageTimings, 'prompt_only', performance.now() - promptStartedAt);
    }

    const rollbackReport = {
        attempted: !!config?.verifyRollbackOnce && shouldBootstrap,
        skipped: !config?.verifyRollbackOnce || !shouldBootstrap,
    };
    if (config?.verifyRollbackOnce && shouldBootstrap) {
        const rollbackStartedAt = performance.now();
        const rollbackTarget = modules.getRollbackOnceTargetEndMesId(modules.getSummaryStore());
        await modules.rollbackSummaryOnce(chatId);
        rollbackReport.targetEndMesId = rollbackTarget;
        rollbackReport.afterRollback = buildStoreSummary(modules.getSummaryStore());
        const replayBatches = await runSummaryBatches(modules, targetMesId, panelConfig);
        rollbackReport.replayedBatches = replayBatches.length;
        rollbackReport.finalStore = buildStoreSummary(modules.getSummaryStore());
        withTiming(stageTimings, 'rollback_verify', performance.now() - rollbackStartedAt);

        if (rollbackReport.finalStore.lastSummarizedMesId !== targetMesId) {
            anomalies.push('回退一次后再次总结，没有回到目标楼层。');
        }
    }

    const report = {
        meta: {
            generatedAt: new Date().toISOString(),
            mode,
            configPath: toPosixPath(path.relative(rootDir, configPath)),
            samplePath: toPosixPath(path.relative(rootDir, samplePath)),
            chatId,
            replayKey,
            outputPath: toPosixPath(path.relative(rootDir, outputDir)),
            snapshotPath: shouldRunNaturalCapture || shouldRunNaturalResume || shouldRunNaturalRecall || shouldRunEventRerankGate
                ? null
                : toPosixPath(path.relative(rootDir, snapshotPath)),
            snapshotUsed,
            snapshotWritten,
            metadataSaveCalls: __saveMetadataCallCount,
        },
        sample: {
            messageCount: sample.messages.length,
            totalSampleMessages: sample.totalSampleMessages,
            name1: sample.names.name1,
            name2: sample.names.name2,
        },
        summary: {
            totalBatches: summaryBatches.length,
            batches: summaryBatches,
            store: summaryStoreSnapshot,
            rollbackVerification: rollbackReport,
        },
        vector: vectorReport,
        recall: {
            cases: recallCases,
        },
        goldEval: goldEvalResult
            ? {
                runId: goldEvalResult.manifest.runId,
                runDir: goldEvalResult.artifacts.runDir,
                metrics: goldEvalResult.aggregated,
            }
            : null,
        eventRerankGate: eventRerankGateResult,
        timings: stageTimings,
        anomalies,
    };

    let baselineReport = null;
    const baselinePath = config?.baselinePath
        ? resolveFromRoot(rootDir, config.baselinePath)
        : path.join(outputDir, 'story-summary-replay-baseline.json');
    const hasNaturalPlan = !!(naturalPlan || naturalResumePlan || naturalRecallPlan || eventRerankGatePlan);
    if (!goldPlan && !hasNaturalPlan && config?.compareWithBaseline !== false && recallCases.length > 0) {
        try {
            const baselineRaw = await fs.readFile(baselinePath, 'utf8');
            baselineReport = JSON.parse(baselineRaw);
        } catch {}
    }
    report.baselineComparison = buildBaselineComparison(report, baselineReport);

    const reportJsonPath = path.join(outputDir, 'story-summary-replay-report.json');
    const reportMdPath = path.join(outputDir, 'story-summary-replay-report.md');
    await fs.writeFile(reportJsonPath, JSON.stringify(report, null, 2), 'utf8');
    await fs.writeFile(reportMdPath, renderMarkdownReport(report), 'utf8');

    if (!goldPlan && !hasNaturalPlan && !baselineReport && config?.writeBaselineOnMissing && recallCases.length > 0) {
        await fs.writeFile(baselinePath, JSON.stringify(report, null, 2), 'utf8');
    }

    return {
        report,
        reportJsonPath,
        reportMdPath,
        snapshotPath: shouldRunNaturalCapture || shouldRunNaturalResume || shouldRunNaturalRecall || shouldRunEventRerankGate
            ? null
            : snapshotPath,
        baselinePath,
        baselineWritten: !goldPlan && !hasNaturalPlan && !baselineReport && !!config?.writeBaselineOnMissing && recallCases.length > 0,
        goldEval: goldEvalResult,
    };
}
