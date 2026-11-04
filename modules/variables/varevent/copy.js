export const VAREVENT_COPY = Object.freeze({
    rawCondition: '条件源码',
    conditionError: '条件有误',
    scriptError: '事件脚本执行失败',
    invalidRun: '当前生成已结束，不能继续操作聊天。',
    saveError: '请先修正标出的条件，已填写的内容会保留。',
    invalidName: '事件名称不能包含换行或右方括号。',
    eventName: '事件',
});

export function eventErrorText(kind, event, error) {
    return `${kind}（${event?.id || VAREVENT_COPY.eventName}）：${error.message || error}`;
}
