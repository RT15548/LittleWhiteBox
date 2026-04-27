// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - Embedder
// ═══════════════════════════════════════════════════════════════════════════

import { embed as sfEmbed } from '../llm/siliconflow.js';
// ═══════════════════════════════════════════════════════════════════════════
// 统一 embed 接口
// ═══════════════════════════════════════════════════════════════════════════

function looksLikeVectorConfig(value) {
    if (!value || typeof value !== 'object') return false;
    return 'embeddingApi' in value
        || 'l0Api' in value
        || 'rerankApi' in value
        || 'enabled' in value
        || 'engine' in value;
}

export async function embed(texts, configOrOptions, maybeOptions = {}) {
    const hasVectorConfig = looksLikeVectorConfig(configOrOptions);
    const vectorConfig = hasVectorConfig ? configOrOptions : null;
    const options = hasVectorConfig ? maybeOptions : (configOrOptions || {});

    return await sfEmbed(texts, {
        ...options,
        ...(vectorConfig?.embeddingApi ? { apiConfig: vectorConfig.embeddingApi } : {}),
    });
}

export async function embed(texts, config, options = {}) {
    const { model, dimensions } = normalizeConfig(config);
    return await sfEmbed(texts, { ...options, model, dimensions });
}

export function getEngineFingerprint(config) {
    const api = config?.embeddingApi || {};
    const provider = String(api.provider || 'siliconflow').toLowerCase();
    const model = String(api.model || 'BAAI/bge-m3').trim() || 'BAAI/bge-m3';
    return `${provider}:${model}:1024`;
}

export function getModelDimensions(config) {
    const { model } = normalizeConfig(config);
    return MODEL_METADATA[model]?.dimensions || 1024;
}

export async function checkLocalModelStatus() {
    return { status: 'not_supported', message: '请使用在线服务' };
}

export function isLocalModelLoaded() {
    return false;
}

export async function downloadLocalModel() {
    throw new Error('本地模型已移除，请使用在线服务');
}

export function cancelDownload() { }

export async function deleteLocalModelCache() { }

// ═══════════════════════════════════════════════════════════════════════════
// 在线服务测试
// ═══════════════════════════════════════════════════════════════════════════

export async function testOnlineService(_provider, config = {}) {
    if (!config?.key) {
        throw new Error('请配置 Embedding API Key');
    }

    const { model, dimensions } = normalizeConfig(config);

    try {
        const [vec] = await sfEmbed(['测试连接'], { apiConfig: config });
        return { success: true, dims: vec?.length || 0 };
    } catch (e) {
        throw new Error(`连接失败: ${e.message}`);
    }
}

export async function fetchOnlineModels() {
    return ['BAAI/bge-m3'];
}

export const DEFAULT_LOCAL_MODEL = 'bge-m3';

export const LOCAL_MODELS = {};

export const ONLINE_PROVIDERS = {
    siliconflow: {
        id: 'siliconflow',
        name: '硅基流动',
        baseUrl: 'https://api.siliconflow.cn/v1',
    },
};
