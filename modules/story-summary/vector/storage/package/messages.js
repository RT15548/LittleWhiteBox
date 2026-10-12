import { VECTOR_REBUILD_ADVICE } from '../../../feedback-copy.js';

const ERRORS = {
    invalid_package: '向量包格式或数值无效，未修改现有数据',
    unsupported_version: '不支持此向量包版本，请从原设备重新导出',
    source_mismatch: '向量来源与当前聊天内容不一致，请使用匹配的备份或重新生成向量',
    incomplete_cache: `现有向量缓存不完整或与当前内容不一致。${VECTOR_REBUILD_ADVICE}完成后再上传或导出。校验详情见监控日志或浏览器控制台。`,
    no_chat: '未打开聊天',
    chat_changed: '聊天已切换，已取消向量数据操作',
    source_changed: '操作期间聊天内容或文本过滤规则已变化，已取消',
    cancelled: '向量数据操作已取消',
    empty_cache: '没有可导出或恢复的向量数据',
    legacy_unverifiable: '旧包只有无法校验来源的向量，请在当前聊天重新生成',
    backup_missing: '服务器上没有找到此聊天的备份',
    server_failed: '服务器文件操作失败',
    backup_manifest_read_failed: '备份清单读取失败，请检查服务器连接或清单内容后重试',
    backup_manifest_failed: '备份文件已上传，但备份清单更新失败；可按当前聊天恢复，请检查服务器连接',
};

export const CACHE_DIAGNOSTIC_LOG = '[Vector Cache] 缓存校验记录';

export const PACKAGE_PROGRESS = Object.freeze({
    read: '读取向量缓存...',
    validate: '校验向量与当前聊天...',
    pack: '打包向量缓存...',
    write: '恢复向量缓存...',
    download: '下载文件...',
    upload: '上传到服务器...',
    fetch: '从服务器下载...',
});

const WARNINGS = {
    legacy_events_omitted: '旧包的事件向量没有来源校验信息，未恢复；请使用“补齐缺漏”重新生成。聊天记忆未修改。',
};

export function packageError(code, details = {}, cause) {
    const error = new Error(ERRORS[code], cause ? { cause } : undefined);
    error.code = code;
    error.details = details;
    if (code === 'cancelled') error.name = 'AbortError';
    return error;
}

export function packageWarning(code) {
    return WARNINGS[code];
}
