import path from 'node:path';
import fs from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

import { indexedDB, IDBKeyRange } from 'fake-indexeddb';
import { GoogleGenAI } from '@google/genai';

import { getDefaultApiPrefix, resolveApiBaseUrl } from '../../shared/common/openai-url-utils.js';
import {
    __setReplayContext,
    __setExtensionSettings,
    __resetMetadataSaveCount,
    __saveMetadataCallCount,
} from './shims/extensions.js';
import { __setChatMetadata, chat_metadata } from './shims/script.js';

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

function normalizeProvider(provider) {
    const value = String(provider || 'custom').trim().toLowerCase();
    if (['anthropic', 'claude'].includes(value)) return 'anthropic';
    if (['google', 'gemini'].includes(value)) return 'google';
    if (['openai', 'custom', 'deepseek', 'cohere'].includes(value)) return 'openai';
    return value;
}

function buildChatMessagesFromArgs(args) {
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
            role: 'assistant',
            content: String(args.bottomassistant),
        });
    }

    return messages;
}

function applyGenerationParams(body, args) {
    const numericFields = [
        ['temperature', 'temperature'],
        ['top_p', 'top_p'],
        ['top_k', 'top_k'],
        ['presence_penalty', 'presence_penalty'],
        ['frequency_penalty', 'frequency_penalty'],
    ];

    for (const [argKey, bodyKey] of numericFields) {
        const raw = args?.[argKey];
        if (raw == null || raw === '') continue;
        const value = Number(raw);
        if (!Number.isFinite(value)) continue;
        body[bodyKey] = value;
    }
}

function extractOpenAiText(payload) {
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content === 'string') {
        return content;
    }
    if (Array.isArray(content)) {
        return content
            .map((part) => {
                if (typeof part === 'string') return part;
                if (part?.type === 'text' && typeof part?.text === 'string') return part.text;
                return '';
            })
            .join('');
    }
    return '';
}

async function callOpenAiCompatibleSummary(apiConfig, messages, args) {
    const baseUrl = resolveApiBaseUrl(
        String(apiConfig.url || ''),
        getDefaultApiPrefix(apiConfig.provider || 'custom')
    );

    const body = {
        model: String(apiConfig.model || '').trim(),
        messages,
        stream: false,
    };
    applyGenerationParams(body, args);

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiConfig.key || ''}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Summary API ${response.status}: ${errorText.slice(0, 300)}`);
    }

    const data = await response.json();
    return String(extractOpenAiText(data) || '').trim();
}

function splitAnthropicMessages(messages) {
    const systemLines = [];
    const chatMessages = [];

    for (const message of messages) {
        if (message.role === 'system') {
            systemLines.push(message.content);
            continue;
        }
        const role = message.role === 'assistant' ? 'assistant' : 'user';
        chatMessages.push({
            role,
            content: [{ type: 'text', text: message.content }],
        });
    }

    return {
        system: systemLines.join('\n\n').trim(),
        messages: chatMessages,
    };
}

function extractAnthropicText(payload) {
    if (!Array.isArray(payload?.content)) return '';
    return payload.content
        .map((part) => (part?.type === 'text' ? String(part?.text || '') : ''))
        .join('');
}

async function callAnthropicSummary(apiConfig, messages, args) {
    const { system, messages: anthropicMessages } = splitAnthropicMessages(messages);
    const baseUrl = String(apiConfig.url || 'https://api.anthropic.com').replace(/\/+$/, '');
    const body = {
        model: String(apiConfig.model || '').trim(),
        max_tokens: Math.max(32000, Number(args?.max_tokens) || 32000),
        messages: anthropicMessages,
    };
    if (system) body.system = system;
    applyGenerationParams(body, args);

    const response = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
            'x-api-key': apiConfig.key || '',
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Anthropic API ${response.status}: ${errorText.slice(0, 300)}`);
    }

    const data = await response.json();
    return String(extractAnthropicText(data) || '').trim();
}

function toGoogleContents(messages) {
    const systemLines = [];
    const contents = [];

    for (const message of messages) {
        if (message.role === 'system') {
            systemLines.push(message.content);
            continue;
        }
        contents.push({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.content }],
        });
    }

    return {
        contents,
        systemInstruction: systemLines.join('\n\n').trim(),
    };
}

function extractGoogleText(response) {
    if (typeof response?.text === 'string' && response.text.trim()) {
        return response.text.trim();
    }
    if (typeof response?.text === 'function') {
        const maybeText = response.text();
        if (typeof maybeText === 'string' && maybeText.trim()) {
            return maybeText.trim();
        }
    }

    const parts = response?.candidates?.[0]?.content?.parts || [];
    return parts
        .map((part) => String(part?.text || ''))
        .join('')
        .trim();
}

async function callGoogleSummary(apiConfig, messages, args) {
    const { contents, systemInstruction } = toGoogleContents(messages);
    const baseUrl = String(apiConfig.url || '').trim();
    const provider = String(apiConfig.provider || 'google').toLowerCase();
    const isVertex = provider.includes('vertex') || /vertex/i.test(baseUrl);
    const httpOptions = baseUrl
        ? {
            baseUrl,
            apiVersion: '',
        }
        : undefined;

    const ai = new GoogleGenAI({
        apiKey: apiConfig.key || undefined,
        vertexai: isVertex,
        httpOptions,
    });

    const config = {};
    if (systemInstruction) {
        config.systemInstruction = systemInstruction;
    }
    applyGenerationParams(config, args);

    const response = await ai.models.generateContent({
        model: String(apiConfig.model || '').trim(),
        contents,
        config,
    });

    return extractGoogleText(response);
}

async function callSummaryApi(apiConfig, messages, args) {
    const normalizedProvider = normalizeProvider(apiConfig.provider);
    if (normalizedProvider === 'anthropic') {
        return await callAnthropicSummary(apiConfig, messages, args);
    }
    if (normalizedProvider === 'google') {
        return await callGoogleSummary(apiConfig, messages, args);
    }
    if (normalizedProvider === 'st') {
        throw new Error('Replay runner does not support provider "st"; please provide a direct summary API config.');
    }
    return await callOpenAiCompatibleSummary(apiConfig, messages, args);
}

function createStreamingGenerationShim(summaryApiConfig) {
    const sessions = new Map();

    const getSession = (sessionId) => sessions.get(sessionId) || { isStreaming: false, text: '', error: null };

    const runRequest = async (args) => {
        const messages = buildChatMessagesFromArgs(args);
        return await callSummaryApi(summaryApiConfig, messages, args);
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
    return {
        api: {
            provider: config?.summaryApi?.provider || 'custom',
            url: config?.summaryApi?.url || '',
            key: config?.summaryApi?.key || '',
            model: config?.summaryApi?.model || '',
            modelCache: [],
        },
        gen: {
            temperature: config?.summaryApi?.temperature ?? null,
            top_p: config?.summaryApi?.top_p ?? null,
            top_k: config?.summaryApi?.top_k ?? null,
            presence_penalty: config?.summaryApi?.presence_penalty ?? null,
            frequency_penalty: config?.summaryApi?.frequency_penalty ?? null,
        },
        trigger: {
            enabled: false,
            interval: 20,
            timing: 'manual',
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

async function createReplaySnapshot(modules, chatId, sample, samplePath, config, snapshotPath) {
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
        version: 1,
        generatedAt: new Date().toISOString(),
        snapshotPath: toPosixPath(snapshotPath),
        dataFingerprint: buildReplayDataFingerprint(samplePath, config),
        sample: {
            samplePath: toPosixPath(samplePath),
            messageCount: sample.messages.length,
            totalSampleMessages: sample.totalSampleMessages,
            names: sample.names,
        },
        replay: {
            chatId,
        },
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
            throw new Error(`summary_generation_failed:${result?.error?.message || result?.error || 'unknown'}`);
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

async function runRecallCases(modules, vectorConfig, summaryConfig) {
    const store = modules.getSummaryStore();
    const allEvents = store?.json?.events || [];
    const recallCases = Array.isArray(summaryConfig.recallCases) && summaryConfig.recallCases.length
        ? summaryConfig.recallCases
        : [{ label: 'latest-context', excludeLastAi: false }];

    const results = [];
    for (const recallCase of recallCases) {
        const label = String(recallCase?.label || `case-${results.length + 1}`);
        const pendingUserMessage = recallCase?.pendingUserMessage ? String(recallCase.pendingUserMessage) : null;
        const excludeLastAi = !!recallCase?.excludeLastAi;
        const recallResult = await modules.recallMemory(allEvents, vectorConfig, {
            pendingUserMessage,
            excludeLastAi,
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

        const meta = await modules.getMeta(modules.getContext().chatId);
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

        let promptText = String(builtPrompt?.promptText || '');
        if (summaryConfig?.trigger?.wrapperHead) {
            promptText = `${summaryConfig.trigger.wrapperHead}\n${promptText}`;
        }
        if (summaryConfig?.trigger?.wrapperTail) {
            promptText = `${promptText}\n${summaryConfig.trigger.wrapperTail}`;
        }

        results.push({
            label,
            excludeLastAi,
            pendingUserMessagePreview: previewText(pendingUserMessage, 100),
            promptChars: promptText.length,
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
        });
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
    const sample = await loadSampleChat(samplePath, config);
    withTiming(stageTimings, 'sample_load', performance.now() - sampleStartedAt);

    const { chatId, replayKey } = buildReplayIdentity(samplePath, config);

    const extSettings = {};
    const panelConfig = buildReplayPanelConfig(config || {});

    __setExtensionSettings(extSettings);
    __setChatMetadata({});
    __setReplayContext({
        chatId,
        chat: sample.messages,
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
        const [{ EXT_ID }, configModule, storeModule, generatorModule, promptModule, chunkStoreModule, chunkBuilderModule, stateStoreModule, stateIntegrationModule, recallModule, metricsModule, embedderModule] = await Promise.all([
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
            import('../../modules/story-summary/vector/retrieval/metrics.js'),
            import('../../modules/story-summary/vector/utils/embedder.js'),
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
            ...metricsModule,
            ...embedderModule,
            getContext: () => ({
                chatId,
                chat: sample.messages,
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
    const shouldRunRecall = mode === 'full' || mode === 'recall-only';

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
        source: shouldBootstrap ? 'bootstrap' : 'snapshot',
    };

    let recallCases = [];

    if (shouldBootstrap) {
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

    if (panelConfig.vector?.enabled && shouldBootstrap) {
        const summaryStore = modules.getSummaryStore();
        const vectorStartedAt = performance.now();
        await modules.getMeta(chatId);
        const l0Result = await modules.incrementalExtractAtoms(chatId, sample.messages, null, { maxFloors: Infinity });
        const l1Result = await modules.buildAllChunks({ vectorConfig: panelConfig.vector });
        const l2Result = await vectorizeEventSummaries(modules, chatId, panelConfig.vector, summaryStore?.json?.events || []);
        withTiming(stageTimings, 'vector_pipeline', performance.now() - vectorStartedAt);

        const stats = await modules.getStorageStats(chatId);
        vectorReport = {
            enabled: true,
            l0: l0Result,
            l1: l1Result,
            l2: l2Result,
            stateAtomsCount: modules.getStateAtomsCount(),
            stateVectorsCount: await modules.getStateVectorsCount(chatId),
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
        recallCases = await runRecallCases(modules, panelConfig.vector, {
            ...panelConfig,
            recallCases: config?.recallCases,
        });
        withTiming(stageTimings, 'recall_and_prompt', performance.now() - recallStartedAt);
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
            snapshotPath: toPosixPath(path.relative(rootDir, snapshotPath)),
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
        timings: stageTimings,
        anomalies,
    };

    let baselineReport = null;
    const baselinePath = config?.baselinePath
        ? resolveFromRoot(rootDir, config.baselinePath)
        : path.join(outputDir, 'story-summary-replay-baseline.json');
    if (config?.compareWithBaseline !== false && recallCases.length > 0) {
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

    if (!baselineReport && config?.writeBaselineOnMissing && recallCases.length > 0) {
        await fs.writeFile(baselinePath, JSON.stringify(report, null, 2), 'utf8');
    }

    return {
        report,
        reportJsonPath,
        reportMdPath,
        snapshotPath,
        baselinePath,
        baselineWritten: !baselineReport && !!config?.writeBaselineOnMissing && recallCases.length > 0,
    };
}
