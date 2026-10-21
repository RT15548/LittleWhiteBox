import { EXT_ID } from '../../../core/constants.js';
import { sameMemory } from '../maintenance/domain.js';
import { runWithAbortDeadline, throwIfSignalAborted, waitForAbortableDelay } from '../../../shared/common/abort-utils.js';

export const METADATA_CONFIRMATION_TIMEOUT_MS = 60_000;
const READ_RETRY_DELAY_MS = 2000;
const READ_RETRY_MAX_DELAY_MS = 10_000;

export class MetadataConfirmationError extends Error {
    constructor(code, uncertain = false, cause) {
        super(code, { cause });
        this.code = code;
        this.uncertain = uncertain;
    }
}

/** SillyTavern's saveMetadata can swallow a failed save. Read only the captured chat target. */
export function createMetadataConfirmation(context, headers, fetcher = fetch) {
    const character = context.characters?.[context.characterId];
    const group = context.groupId != null;
    const endpoint = group ? '/api/chats/group/get' : '/api/chats/get';
    const body = group ? { id: context.chatId } : {
        ch_name: character?.name, file_name: character?.chat, avatar_url: character?.avatar,
    };
    if (!context.chatId || (!group && (!body.file_name || !body.avatar_url))) {
        throw new MetadataConfirmationError('metadata_target_unavailable');
    }
    return async function confirm(expected, previous = null, loadedPrevious = null, { timeoutMs = METADATA_CONFIRMATION_TIMEOUT_MS, savePending = () => false, normalize = value => value } = {}) {
        let lastError;
        const readBack = async signal => {
            let delay = READ_RETRY_DELAY_MS;
            for (;;) {
                throwIfSignalAborted(signal);
                try {
                    lastError = undefined;
                    const response = await fetcher(endpoint, { method: 'POST', headers: headers(), cache: 'no-store', body: JSON.stringify(body), signal });
                    throwIfSignalAborted(signal);
                    if (!response.ok) throw Object.assign(new Error('metadata_read_http'), { code: 'metadata_read_http', status: response.status });
                    const data = await response.json();
                    throwIfSignalAborted(signal);
                    if (!Array.isArray(data) || !data[0]?.chat_metadata) throw Object.assign(new Error('metadata_read_invalid'), { code: 'metadata_read_invalid' });
                    const extension = data[0].chat_metadata.extensions?.[EXT_ID] || {};
                    const persisted = Object.fromEntries(Object.keys(expected).map(key => [key, extension[key]]));
                    const actual = normalize(persisted);
                    const matches = projection => projection && Object.entries(normalize(projection)).every(([key, value]) => sameMemory(actual[key], value));
                    if (matches(expected)) return persisted;
                    if (matches(previous) || matches(loadedPrevious)) {
                        if (!savePending()) throw new MetadataConfirmationError('metadata_not_saved');
                        throw Object.assign(new Error('metadata_save_pending'), { code: 'metadata_save_pending' });
                    }
                    throw new MetadataConfirmationError('metadata_save_conflict', true);
                } catch (error) {
                    if (signal.aborted) throw error;
                    lastError = error;
                }
                // One read at a time. Backoff bounds full-chat transfers on a weak connection.
                await waitForAbortableDelay(delay, signal);
                delay = Math.min(READ_RETRY_MAX_DELAY_MS, delay * 2);
            }
        };
        try { return await runWithAbortDeadline(readBack, { timeoutMs }); }
        catch (error) {
            if (lastError instanceof MetadataConfirmationError) throw lastError;
            throw new MetadataConfirmationError('metadata_save_unconfirmed', true, lastError || error);
        }
    };
}
