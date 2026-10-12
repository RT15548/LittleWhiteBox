import { fetchWebContents, publicWebUrl } from '../../../../agent-core/web/retrieval.js';
import { isWebConfigured } from '../../../../agent-core/web/settings.js';
import { WebRequestError } from '../../../../agent-core/web/transport.js';

export class LearningMaterialError extends Error {
    constructor(readonly code: string, readonly httpStatus?: number) { super(code); }
}

export interface ExtractedSources {
    results: { url: string; text: string }[];
    failedUrls: string[];
}

export function learningPublicUrl(value: string): string {
    try { return publicWebUrl(value); }
    catch { throw new LearningMaterialError('learning_source_url_invalid'); }
}

const EXTRACTION_ERRORS: Readonly<Record<string, string>> = {
    web_search_not_configured: 'learning_search_not_configured',
    web_url_invalid: 'learning_source_url_invalid',
    web_url_limit: 'learning_extract_url_limit',
    web_response_too_large: 'learning_source_too_large',
    web_invalid_response: 'learning_extract_invalid_response',
    web_http_failed: 'learning_extract_http_failed',
    web_timeout: 'learning_extract_timeout',
};

/** The lesson supplies URLs from its current search candidates; provider transport belongs to agent-core. */
export async function extractLearningSources(
    config: Record<string, unknown>,
    inputUrls: readonly string[],
    options: { signal?: AbortSignal; fetch?: typeof globalThis.fetch; timeoutMs?: number } = {},
): Promise<ExtractedSources> {
    if (!isWebConfigured(config)) { throw new LearningMaterialError('learning_search_not_configured'); }
    try {
        const received = await fetchWebContents(config, inputUrls, options);
        return { results: received.results.map(({ url, text }: { url: string; text: string }) => ({ url, text })), failedUrls: received.failedUrls };
    } catch (error) {
        if (options.signal?.aborted || (error as Error)?.name === 'AbortError') { throw new LearningMaterialError('learning_extract_cancelled'); }
        throw new LearningMaterialError(error instanceof WebRequestError
            ? EXTRACTION_ERRORS[error.code] ?? 'learning_extract_failed' : 'learning_extract_failed',
        error instanceof WebRequestError ? error.httpStatus : undefined);
    }
}
