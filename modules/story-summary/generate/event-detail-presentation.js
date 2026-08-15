export function formatEventDetailPromptLine(item, fallbackNames = {}) {
    const speaker = String(item?.speaker || '').trim()
        || (item?.isUser
            ? String(fallbackNames.userName || '用户').trim()
            : String(fallbackNames.characterName || '角色').trim());
    const floor = Number(item?.floor);
    const text = String(item?.text || '').trim();
    const marker = item?._detailTemporalCarrier === true
        ? String(item?._detailTemporalMarker || '').trim()
        : '';
    const temporalPrefix = marker ? `【${marker}·同一回合】 ` : '';
    return `  › ${temporalPrefix}#${floor + 1} [${speaker}] ${text}`;
}
