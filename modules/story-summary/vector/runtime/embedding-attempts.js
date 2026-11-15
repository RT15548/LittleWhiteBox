import { inputDigest } from '../utils/vector-input-digest.js';
import {
    createEmbeddingFailureError,
    getEmbeddingFailureDetails,
    readEmbeddingFailure,
} from '../llm/embedding-failure.js';

const ATTEMPT_PREFIX = 'LittleWhiteBox.embedding-attempt.v1:';

// Tab-lifetime paid-request receipts only. Neither source text, credentials,
// vector payloads nor raw chat identities are written to browser storage.
// Only the central failure classification and bounded HTTP status survive reload.
function safeFailure(error) {
    const failure = readEmbeddingFailure(error);
    const { code, httpStatus } = getEmbeddingFailureDetails(error);
    if (typeof failure?.kind !== 'string' || (failure.kind !== 'unknown' && code === 'embedding_failed')) return null;
    return {
        kind: failure.kind,
        ...(httpStatus >= 100 && httpStatus <= 599 ? { status: httpStatus } : {}),
        ...(failure.uncertain === true ? { uncertain: true } : {}),
    };
}

function errorForReceipt(receipt) {
    let failure = null;
    try { failure = safeFailure({ embeddingFailure: JSON.parse(receipt) }); }
    catch (error) { if (!(error instanceof SyntaxError)) throw error; }
    return createEmbeddingFailureError('A previous embedding request has not been stored',
        failure || { kind: 'unknown_outcome', uncertain: true });
}

export function createEmbeddingAttempts({ getStorage = () => globalThis.sessionStorage } = {}) {
    const chatPrefix = chatId => `${ATTEMPT_PREFIX}${inputDigest('embedding-chat', chatId)}:`;
    const keyFor = (chatId, service, text) => `${chatPrefix(chatId)}${inputDigest('embedding-attempt', JSON.stringify([chatId, service, text]))}`;

    function access(operation) {
        try {
            const storage = getStorage();
            if (!storage) throw new Error('Session storage is unavailable');
            return operation(storage);
        } catch (cause) {
            if (cause?.embeddingFailure) throw cause;
            throw createEmbeddingFailureError('Embedding request receipts could not be read or saved', { kind: 'receipt_storage' }, cause);
        }
    }

    function failureForKeys(storage, keys) {
        for (const key of keys) {
            const receipt = storage.getItem(key);
            if (receipt !== null) return errorForReceipt(receipt);
        }
        return null;
    }

    function readFailure(chatId, service, texts) {
        return access(storage => failureForKeys(storage, texts.map(text => keyFor(chatId, service, text))));
    }

    function hasChat(chatId) {
        return access(storage => {
            const prefix = chatPrefix(chatId);
            for (let index = 0; index < storage.length; index++) {
                if (storage.key(index)?.startsWith(prefix)) return true;
            }
            return false;
        });
    }

    function recordFailure(chatId, service, texts, error) {
        const failure = safeFailure(error) || { kind: 'unknown' };
        return access(storage => {
            const receipt = JSON.stringify(failure);
            for (const text of texts) {
                const key = keyFor(chatId, service, text);
                // Explicit deletion may have removed a dispatched request's marker.
                if (storage.getItem(key) !== null) storage.setItem(key, receipt);
            }
        });
    }

    function reserve(chatId, service, texts, { retryFailed = false } = {}) {
        return access(storage => {
            const keys = texts.map(text => keyFor(chatId, service, text));
            const previous = new Map(keys.map(key => [key, storage.getItem(key)]));
            if (!retryFailed) {
                const receipt = [...previous.values()].find(value => value !== null);
                if (receipt !== undefined) throw errorForReceipt(receipt);
            }
            const reserved = [];
            const rollback = storage => {
                for (const key of reserved) {
                    const receipt = previous.get(key);
                    if (receipt === null) storage.removeItem(key);
                    else storage.setItem(key, receipt);
                }
            };
            try {
                for (const key of keys) {
                    storage.setItem(key, '1');
                    reserved.push(key);
                }
            } catch (cause) {
                // No API request has been made. Restore only this reservation,
                // including old paid failures selected by an explicit retry.
                try { rollback(storage); }
                catch (cleanup) { throw new AggregateError([cause, cleanup], 'Embedding receipt reservation rollback failed'); }
                throw cause;
            }
            return () => access(rollback);
        });
    }

    function release(chatId, service, texts) {
        return access(storage => {
            for (const text of texts) storage.removeItem(keyFor(chatId, service, text));
        });
    }

    function clearChat(chatId, { keep = [] } = {}) {
        return access(storage => {
            const prefix = chatPrefix(chatId);
            const preserved = new Set(keep);
            const remove = [];
            for (let index = 0; index < storage.length; index++) {
                const key = storage.key(index);
                if (key?.startsWith(prefix) && !preserved.has(key)) remove.push(key);
            }
            for (const key of remove) storage.removeItem(key);
        });
    }

    return { reserve, readFailure, recordFailure, release, clearChat, keyFor, hasChat };
}
