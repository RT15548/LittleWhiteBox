// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - Embedder (v2 - 统一硅基)
// 所有 embedding 请求转发到 siliconflow.js
// ═══════════════════════════════════════════════════════════════════════════

import { embed as sfEmbed, getApiKey } from '../llm/siliconflow.js';
// ═══════════════════════════════════════════════════════════════════════════
// 统一 embed 接口
// ═══════════════════════════════════════════════════════════════════════════

export async function embed(texts, config, options = {}) {
    // 忽略旧的 config 参数，统一走硅基
    return await sfEmbed(texts, options);
}

// ═══════════════════════════════════════════════════════════════════════════
// 指纹（简化版）
// ═══════════════════════════════════════════════════════════════════════════

export function getEngineFingerprint(config) {
    // 统一使用硅基 bge-m3
    return 'siliconflow:bge-m3:1024';
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

export async function testOnlineService() {
    const key = getApiKey();
    if (!key) {
        throw new Error('请配置硅基 API Key');
    }

    try {
        const [vec] = await sfEmbed(['测试连接']);
        return { success: true, dims: vec?.length || 0 };
    } catch (e) {
        throw new Error(`连接失败: ${e.message}`);
    }
}

export async function fetchOnlineModels() {
    // 硅基模型固定
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
        baseUrl: 'https://api.siliconflow.cn',
    },
};
