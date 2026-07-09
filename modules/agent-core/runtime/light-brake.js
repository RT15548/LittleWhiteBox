export function createLightBrakeController(options = {}) {
    let streakKey = '';
    let streakCount = 0;
    let lastLightBrakeKey = '';
    let currentMessage = '';

    const {
        getMessageText = defaultGetMessageText,
        threshold = 3,
    } = options;

    function defaultGetMessageText(name, code, count) {
        return [
            `[工具失败提示] ${name} 已连续 ${count} 次因为 ${code} 失败。`,
            '不要继续原样重复同一个工具调用；先换路径、换参数、用 LS / Grep / Read 重新定位，或直接告诉用户当前阻塞点。',
        ].join('\n');
    }

    function record(toolName = '', errorCode = '') {
        const name = String(toolName || '').trim();
        const code = String(errorCode || 'tool_failed').trim() || 'tool_failed';
        if (!name) return;
        const nextKey = `${name}::${code}`;
        if (streakKey === nextKey) {
            streakCount += 1;
        } else {
            streakKey = nextKey;
            streakCount = 1;
        }
        if (streakCount >= threshold && lastLightBrakeKey !== nextKey) {
            currentMessage = getMessageText(name, code, streakCount);
            lastLightBrakeKey = nextKey;
        }
    }

    function reset() {
        streakKey = '';
        streakCount = 0;
        lastLightBrakeKey = '';
        currentMessage = '';
    }

    function getMessage() {
        return currentMessage;
    }

    return {
        record,
        reset,
        getMessage,
    };
}
