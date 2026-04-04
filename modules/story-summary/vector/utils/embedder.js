// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - Embedder
// ═══════════════════════════════════════════════════════════════════════════

import { embed as sfEmbed } from '../llm/siliconflow.js';
// ═══════════════════════════════════════════════════════════════════════════
// 统一 embed 接口
// ═══════════════════════════════════════════════════════════════════════════

export async function embed(texts, config, options = {}) {
    return await sfEmbed(texts, options);
}

// ═══════════════════════════════════════════════════════════════════════════
// 指纹（简化版）
// ═══════════════════════════════════════════════════════════════════════════

export function getEngineFingerprint(config) {
    const api = config?.embeddingApi || {};
    const provider = String(api.provider || 'siliconflow').toLowerCase();
    const model = String(api.model || 'BAAI/bge-m3').trim() || 'BAAI/bge-m3';
    return `${provider}:${model}:1024`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 状态检查（简化版）
// ═══════════════════════════════════════════════════════════════════════════

export async function checkLocalModelStatus() {
    // 不再支持本地模型
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

// ═══════════════════════════════════════════════════════════════════════════
// 兼容旧接口
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_LOCAL_MODEL = 'bge-m3';

export const LOCAL_MODELS = {};

export const ONLINE_PROVIDERS = {
    siliconflow: {
        id: 'siliconflow',
        name: '硅基流动',
        baseUrl: 'https://api.siliconflow.cn/v1',
    },
};
