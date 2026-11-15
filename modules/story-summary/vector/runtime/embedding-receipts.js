import { embed as requestEmbeddings } from '../utils/embedder.js';
import { createEmbeddingFailureError, readEmbeddingVectors } from '../llm/embedding-failure.js';
import { throwIfSignalAborted } from '../../../../shared/common/abort-utils.js';
import { createEmbeddingAttempts } from './embedding-attempts.js';

// Responses stay in memory until their storage commit is confirmed. The live
// instance also records opaque tab-lifetime attempt markers so reload cannot
// turn a lost response into permission to purchase that input automatically.
export function createEmbeddingReceipts({ embed, attempts = null }) {
    const chats = new Map();
    const serviceFor = vectorConfig => {
        const api = vectorConfig?.embeddingApi || {};
        return JSON.stringify([api.provider, api.url, api.model, api.key]);
    };

    function scopeFor(chatId, vectorConfig, create = true) {
        if (typeof chatId !== 'string' || !chatId) throw new TypeError('Embedding storage requests require a chat identity');
        // Private in-memory identity only: credentials never appear in stored
        // markers, diagnostics or errors. Different service settings are isolated.
        const key = serviceFor(vectorConfig);
        let configurations = chats.get(chatId);
        if (!configurations && create) chats.set(chatId, configurations = new Map());
        let scope = configurations?.get(key);
        if (!scope && create) configurations.set(key, scope = new Map());
        return scope;
    }

    function readStoredEmbeddingFailure(texts, vectorConfig, { chatId } = {}) {
        if (!texts?.length) return null;
        const scope = scopeFor(chatId, vectorConfig, false);
        for (const text of texts) {
            const entry = scope?.get(text);
            if (entry?.error) return entry.error;
        }
        const absent = texts.filter(text => !scope?.has(text));
        return absent.length ? attempts?.readFailure(chatId, serviceFor(vectorConfig), absent) || null : null;
    }

    async function embedForStorage(texts, vectorConfig, { chatId, signal, retryFailed = false } = {}) {
        throwIfSignalAborted(signal);
        if (!texts?.length) return [];
        const scope = scopeFor(chatId, vectorConfig);
        // Inspect every input before dispatch: rebatching an old failed input
        // together with new material must not purchase a disguised retry.
        for (const text of texts) {
            const entry = scope.get(text);
            if (entry?.error && !retryFailed) throw entry.error;
        }
        const missing = [...new Set(texts)].filter(text => !scope.has(text) || (retryFailed && scope.get(text).error));
        if (missing.length) {
            // Only this selected batch can retry. Preserve ready/pending entries,
            // and restore failed entries if reservation or dispatch is cancelled.
            const previous = new Map(missing.map(text => [text, scope.get(text)]));
            const config = vectorConfig?.embeddingApi
                ? { ...vectorConfig, embeddingApi: { ...vectorConfig.embeddingApi } }
                : vectorConfig;
            const service = serviceFor(config);
            let dispatched = false;
            let rollbackReservation;
            const request = Promise.resolve().then(async () => {
                throwIfSignalAborted(signal);
                rollbackReservation = attempts?.reserve(chatId, service, missing, { retryFailed });
                throwIfSignalAborted(signal);
                dispatched = true;
                const result = await embed(missing, config, { signal });
                return readEmbeddingVectors({ data: Array.isArray(result)
                    ? result.map((embedding, index) => ({ index, embedding })) : null }, missing.length);
            }).then(vectors => {
                for (const [index, text] of missing.entries()) scope.set(text, { value: vectors[index] });
                return vectors;
            }, error => {
                let failure = error;
                if (!dispatched) {
                    try { rollbackReservation?.(); }
                    catch (cleanup) { failure = cleanup; }
                }
                const retainedError = failure?.name === 'AbortError'
                    ? createEmbeddingFailureError('Embedding request outcome is unknown after cancellation',
                        { kind: 'unknown_outcome', uncertain: true }, failure)
                    : failure;
                if (dispatched) {
                    // A failed metadata write cannot undo the paid attempt or
                    // replace its error in memory with permission to redispatch.
                    for (const text of missing) scope.set(text, { error: retainedError });
                    try { attempts?.recordFailure(chatId, service, missing, retainedError); }
                    catch (storageError) {
                        failure = new AggregateError([failure, storageError],
                            'Embedding request failure could not be saved', { cause: retainedError });
                    }
                } else {
                    for (const text of missing) {
                        const entry = previous.get(text);
                        if (entry) scope.set(text, entry);
                        else scope.delete(text);
                    }
                }
                throw failure;
            });
            for (const [index, text] of missing.entries()) {
                scope.set(text, { pending: request.then(vectors => vectors[index]) });
            }
        }

        const vectors = await Promise.all(texts.map(text => {
            const entry = scope.get(text);
            return entry.pending || entry.value;
        }));
        // A late valid provider response is retained, but cancellation still
        // belongs to this caller and cannot grant permission for a stale write.
        throwIfSignalAborted(signal);
        return vectors;
    }

    function acknowledgeStoredEmbeddings(texts, vectorConfig, { chatId } = {}) {
        const scope = scopeFor(chatId, vectorConfig, false);
        if (!scope) return;
        const confirmed = texts.filter(text => scope.get(text)?.value);
        attempts?.release(chatId, serviceFor(vectorConfig), confirmed);
        for (const text of confirmed) scope.delete(text);
    }

    function retryStoredEmbeddings(chatId) {
        const keep = [];
        if (attempts) {
            for (const [service, scope] of chats.get(chatId) || []) {
                for (const [text, entry] of scope) {
                    if (!entry.error) keep.push(attempts.keyFor(chatId, service, text));
                }
            }
            attempts.clearChat(chatId, { keep });
        }
        for (const scope of chats.get(chatId)?.values() || []) {
            for (const [text, entry] of scope) if (entry.error) scope.delete(text);
        }
    }

    function forgetStoredEmbeddings(chatId) {
        attempts?.clearChat(chatId);
        chats.delete(chatId);
    }

    function hasStoredEmbeddings(chatId) {
        return [...chats.get(chatId)?.values() || []].some(scope => scope.size > 0)
            || attempts?.hasChat(chatId) || false;
    }

    return { embedForStorage, readStoredEmbeddingFailure, acknowledgeStoredEmbeddings, retryStoredEmbeddings, forgetStoredEmbeddings, hasStoredEmbeddings };
}

const receipts = createEmbeddingReceipts({ embed: requestEmbeddings, attempts: createEmbeddingAttempts() });
export const { embedForStorage, readStoredEmbeddingFailure, acknowledgeStoredEmbeddings, retryStoredEmbeddings, forgetStoredEmbeddings, hasStoredEmbeddings } = receipts;
