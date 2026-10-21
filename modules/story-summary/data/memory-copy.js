export const MEMORY_DATA_COPY = Object.freeze({
    unsupportedImport: '仅支持通过“导出记忆包”生成的文件；不支持内部 JSON、裸数据或其他版本的格式。',
    unconfirmed: '还无法确认修改是否保存；召回仍可使用现有记忆。可重试操作以重新确认；若仍提示冲突，请重新加载当前聊天后核对。',
    saving: '正在确认上一项修改，请稍后重试。',
    sourceInvalid: '原文已变化，总结回退尚未完成；召回仍可使用现有记忆。请重试回退，或重新导入／清空总结。',
    historyInvalid: '这份总结的回退记录不完整，已暂停修改；召回仍可使用现有记忆。请先导出留存，再重新导入或清空总结。',
    failed: '记忆修改未能保存，请重试本次操作；仍失败时请查看日志。',
    notSaved: '本次记忆修改未能保存，请重试本次操作。',
    sourceChanged: '原文已变化，本次锚点结果不再适用；请针对当前正文重新补齐。',
    conflict: '记忆内容已发生变化，本次修改未保存；请重新打开面板，核对后再修改。',
    cacheFailed: '原文对应的旧锚点已停用，但本地检索缓存未清理完成；请重试“补齐缺漏”。',
    anchorsFailed: '本次锚点补齐未能保存，请在“记忆锚点”中重试；详情见日志。',
});

export function memorySaveError(error, operation = 'memory') {
    if (error?.uncertain || error?.code === 'metadata_unconfirmed') return MEMORY_DATA_COPY.unconfirmed;
    if (error?.code === 'metadata_saving') return MEMORY_DATA_COPY.saving;
    if (error?.code === 'source_boundary_invalid') return MEMORY_DATA_COPY.sourceInvalid;
    if (['history_discontinuous', 'summary_history_invalid'].includes(error?.code)) return MEMORY_DATA_COPY.historyInvalid;
    if (error?.code === 'metadata_source_changed') return MEMORY_DATA_COPY.sourceChanged;
    if (error?.code === 'memory_cache_invalidation_failed') return MEMORY_DATA_COPY.cacheFailed;
    if (['metadata_draft_conflict', 'summary_chat_changed_before_save'].includes(error?.code)) return MEMORY_DATA_COPY.conflict;
    if (operation === 'anchors') return MEMORY_DATA_COPY.anchorsFailed;
    if (error?.code === 'metadata_not_saved') return MEMORY_DATA_COPY.notSaved;
    return MEMORY_DATA_COPY.failed;
}
