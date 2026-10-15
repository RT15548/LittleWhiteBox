import { EXT_ID } from '../../../core/constants.js';
import { sameMemory } from '../maintenance/domain.js';
import { runWithAbortDeadline } from '../../../shared/common/abort-utils.js';

export const METADATA_CONFIRMATION_TIMEOUT_MS = 5000;

export class MetadataConfirmationError extends Error {
    constructor(code, uncertain = false, cause) {
        super(code, { cause });
        this.code = code;
        this.uncertain = uncertain;
    }
}

/** SillyTavern's saveMetadata can swallow a failed save. Confirm via its current chat-file read API. */
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
    return async function confirm(expected, previous = null, loadedPrevious = null) {
        try {
            return await runWithAbortDeadline(signal => readBack(signal, expected, previous, loadedPrevious),
                { timeoutMs: METADATA_CONFIRMATION_TIMEOUT_MS });
        } catch (error) {
            if (error instanceof MetadataConfirmationError) throw error;
            throw new MetadataConfirmationError('metadata_save_unconfirmed', true, error);
        }
    };
    async function readBack(signal, expected, previous, loadedPrevious) {
        let lastError;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const response = await fetcher(endpoint, { method: 'POST', headers: headers(), cache: 'no-store', body: JSON.stringify(body), signal });
                if (!response.ok) throw new Error(`metadata_read_http_${response.status}`);
                const data = await response.json();
                if (!Array.isArray(data) || !data[0]?.chat_metadata) throw new Error('metadata_read_invalid');
                const extension = data[0].chat_metadata.extensions?.[EXT_ID] || {};
                const matches = projection => projection && Object.entries(projection).every(([key, value]) => sameMemory(extension[key], value));
                if (matches(expected)) return;
                if (matches(previous) || matches(loadedPrevious)) throw new MetadataConfirmationError('metadata_not_saved');
                throw new MetadataConfirmationError('metadata_save_conflict', true);
            } catch (error) {
                if (error instanceof MetadataConfirmationError || signal.aborted) throw error;
                lastError = error;
            }
        }
        throw new MetadataConfirmationError('metadata_save_unconfirmed', true, lastError);
    }
}
