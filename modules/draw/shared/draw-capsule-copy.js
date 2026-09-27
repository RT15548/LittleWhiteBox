// Capsules have room for an icon and a two-character status. Details stay
// outside; numeric progress keeps its own formatting across providers.
export const DRAW_CAPSULE_COPY = Object.freeze({
    submitting: '提交',
    uncertain: '确认',
    unknown: '未知',
    queued: '排队',
    analysis: '分析',
    correction: '纠错',
    reattaching: '接回',
    preparing: '准备',
    reconnecting: '重连',
    cooldown: '等待',
    generating: '生成',
    cancelling: '取消',
    legacy: '兼容',
    error: '失败',
});
