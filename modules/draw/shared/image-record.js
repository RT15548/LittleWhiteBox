// A preview is also the durable input of an image attempt. Progress is not a
// record state: only a live operation/backend job may claim to be generating.
export const PreviewStatus = Object.freeze({ PENDING: 'pending', UNKNOWN: 'unknown', SUCCESS: 'success', FAILED: 'failed' });

export function hasPreviewImage(record) {
    return record?.status !== PreviewStatus.FAILED && record?.status !== PreviewStatus.PENDING && record?.status !== PreviewStatus.UNKNOWN
        && Boolean(record?.base64 || record?.savedUrl);
}

export const DRAW_SLOT_COPY = Object.freeze({
    waiting: '回复完成后绘图',
    preparing: '准备绘图',
    loading: '加载图片',
    generate: '生成',
    retry: '重试',
    unclaimed: '尚未绘图',
    saving: '保存图位',
    queued: '等待绘图',
    generating: '生成中',
    unavailable: '绘图模块尚未就绪',
    floorBusy: '该楼层已有任务进行中',
    slotBusy: '这张图片已有任务进行中',
    sourceChanged: '原文或分支已变化，未提交绘图。',
    missingRecord: '图片记录不存在，请重新打开图位。',
    emptyTags: 'TAG 不能为空',
    emptyResult: '绘图结果为空',
    storageFailed: '图片尚未保存成功，请勿刷新页面。',
    storageWriteFailed: '图库写入未完成。',
    renderFailed: '图位已保存，但界面刷新失败。',
    imageReadFailed: '图片记录读取失败，未重新绘图。',
    imageLoadFailed: '图片加载失败，未重新绘图。',
    reloadImage: '重新加载',
    editTargetChanged: '图片版本已变化，草稿已保留，请重新打开编辑后保存。',
    tagSaved: 'TAG 已保存',
    tagSaveFailed: 'TAG 保存失败',
    tagReadFailed: 'TAG 读取失败',
    tagAdoptionFailed: '图片标签接管失败',
    redrawFailed: '图片重绘失败',
    cancelFailed: '部分绘图任务取消未完成，请稍后重试。已保存的取消意图会继续保留。',
    restoreImage: '返回已有图片',
    restoreFailed: '图片版本恢复失败',
    removeConfirm: '确定移除此图位及所属图片记录？',
    removeFailed: '图位移除失败',
    editTags: '编辑 TAG（场景描述）',
    saveTags: '保存 TAG',
    saveAndRetry: '保存并重试',
    cancelEdit: '取消',
    sourceUnresolved: '此图片标签无法定位到聊天原文，未自动绘图。',
    formatReadFailed: '无法确认聊天图片格式已保存。',
    cacheReadFailed: '旧图片缓存读取失败，未重新绘图。',
});

export const DRAW_SLOT_ERRORS = Object.freeze({
    placement: { code: 'image_placement_unconfirmed', label: '图位保存未确认', desc: '聊天保存未确认，本次未提交绘图。TAG 已保留，请稍后重试。' },
    interrupted: { code: 'image_interrupted', label: '绘图已中断', desc: '未找到可接回的任务，可编辑 TAG 后重新生成。' },
    unknown: { code: 'image_submission_unknown', label: '绘图结果未知', desc: '直连请求可能已提交，但无法确认结果。重新生成可能再次计费，请先检查供应商记录。' },
    legacy: { code: 'legacy_image_unresolved', label: '旧图无法恢复', desc: '未找到可确认的旧图片，保留了原 TAG；重新生成将发起绘图请求。' },
});
