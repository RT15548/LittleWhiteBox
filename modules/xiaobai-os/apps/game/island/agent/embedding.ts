import { sha256 } from 'js-sha256';
import { fail } from '../fault.js';

export interface EmbeddingConnection { space: string; embed(texts: string[], signal: AbortSignal): Promise<number[][]> }
export async function islandEmbedding(): Promise<EmbeddingConnection> {
    const { getVectorConfig } = await import('../../../../../story-summary/data/config.js');
    const { embed } = await import('../../../../../story-summary/vector/llm/siliconflow.js');
    const { resolveApiBaseUrl, getDefaultApiPrefix } = await import('../../../../../../shared/common/openai-url-utils.js');
    const api = getVectorConfig().embeddingApi;
    if (!api?.key || !api.url || !api.model) { fail('embedding_config'); }
    const space = sha256(JSON.stringify([resolveApiBaseUrl(api.url, getDefaultApiPrefix(api.provider)), api.model]));
    return { space, async embed(texts, signal) {
        // One request; the transport neither retries nor changes the selected model.
        return await embed(texts, { apiConfig: api, signal }) as number[][];
    } };
}
