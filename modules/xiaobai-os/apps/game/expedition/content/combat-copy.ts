export const COMBAT_COPY = {
    cache: '拾取遗物', cacheReady: '遗物已留在现场',
    signalApproach: '守长正赶向火盆', signalLit: '烽火已点燃 · 援兵将至',
    signalCountdown: (seconds: number) => `点火 ${seconds} 秒 · 击中守长可打断`,
    dormantRelic: '触发来源未装配',
    restBuild: '在营地或休整点调整装配。',
    replace: '替换一件装配', store: '只收入收藏', back: '重新选择',
    received: (name: string, equipped: boolean) => `${name} · ${equipped ? '已装配' : '收入收藏'}`,
};
