import {
    hasImageBackendJobsCapability,
    ImageBackendJobsError,
    readImageBackendResultBase64,
} from '../../shared/backend-image-jobs.js';

const IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
export const NOVELAI_V5_FINAL_IMAGE_CAPABILITY = 'novelai-v5-final-image-v1';

export function hasNovelV5FinalImageCapability(status) {
    return hasImageBackendJobsCapability(status)
        && status.capabilities.includes(NOVELAI_V5_FINAL_IMAGE_CAPABILITY);
}

async function rejectBackendResult(response, message, code) {
    try {
        await response?.body?.cancel?.();
    } catch {
        // 结果已经判定不可使用；取消失败不能覆盖真正的契约错误。
    }
    const error = new ImageBackendJobsError(message, { code });
    error.discardBackendResult = true;
    throw error;
}

export async function decodeNovelBackendJobResult({ response, kind }) {
    const mime = String(response?.headers?.get?.('content-type') || '')
        .split(';', 1)[0]
        .trim()
        .toLowerCase();
    if (kind === 'msgpack-stream' && mime !== 'image/png') {
        return await rejectBackendResult(
            response,
            'NovelAI V5 后台结果来自旧版插件。请用扩展内的 littlewhitebox-image-jobs 完整覆盖服务端插件并重启 SillyTavern。',
            'novelai_backend_result_contract_outdated',
        );
    }
    if (!IMAGE_MIME_TYPES.has(mime)) {
        return await rejectBackendResult(
            response,
            `NovelAI 后台返回了不支持的图片格式：${mime || '(empty)'}`,
            'novelai_backend_result_invalid',
        );
    }
    const base64 = await readImageBackendResultBase64(response);
    return mime === 'image/png' ? base64 : `data:${mime};base64,${base64}`;
}
