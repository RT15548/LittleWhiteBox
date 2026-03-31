// Story Summary - Embedder
// All embedding requests go through siliconflow.js.

import { embed as sfEmbed, getApiKey } from '../llm/siliconflow.js';

export const DEFAULT_VECTOR_MODEL = 'BAAI/bge-m3';
export const QWEN_VECTOR_MODEL = 'Qwen/Qwen3-Embedding-8B';
export const QWEN_VECTOR_DIMENSIONS = 4096;

const MODEL_METADATA = {
    [DEFAULT_VECTOR_MODEL]: {
        fingerprint: 'siliconflow:bge-m3:1024',
        dimensions: null,
    },
    [QWEN_VECTOR_MODEL]: {
        fingerprint: 'siliconflow:qwen3-embedding-8b:4096',
        dimensions: QWEN_VECTOR_DIMENSIONS,
    },
};

function normalizeModel(model) {
    return MODEL_METADATA[model] ? model : DEFAULT_VECTOR_MODEL;
}

function normalizeConfig(config) {
    const vectorCfg = config?.online ? config : { online: config || {} };
    const model = normalizeModel(vectorCfg?.online?.model);
    return {
        model,
        dimensions: MODEL_METADATA[model]?.dimensions ?? null,
    };
}

export async function embed(texts, config, options = {}) {
    const { model, dimensions } = normalizeConfig(config);
    return await sfEmbed(texts, { ...options, model, dimensions });
}

export function getEngineFingerprint(config) {
    const { model } = normalizeConfig(config);
    return MODEL_METADATA[model].fingerprint;
}

export function getModelLabel(config) {
    return normalizeConfig(config).model;
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

export async function testOnlineService(config) {
    const key = getApiKey();
    if (!key) {
        throw new Error('请配置硅基 API Key');
    }

    const { model, dimensions } = normalizeConfig(config);

    try {
        const [vec] = await sfEmbed(['测试连接'], { model, dimensions });
        return {
            success: true,
            model,
            dims: vec?.length || getModelDimensions(config),
        };
    } catch (e) {
        throw new Error(`连接失败: ${e.message}`);
    }
}

export async function fetchOnlineModels() {
    return [DEFAULT_VECTOR_MODEL, QWEN_VECTOR_MODEL];
}

export const DEFAULT_LOCAL_MODEL = 'bge-m3';

export const LOCAL_MODELS = {};

export const ONLINE_PROVIDERS = {
    siliconflow: {
        id: 'siliconflow',
        name: '硅基流动',
        baseUrl: 'https://api.siliconflow.cn',
    },
};
