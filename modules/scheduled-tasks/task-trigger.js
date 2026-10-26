// Only the UI/runtime use this synthetic timing. Persist the established timing
// plus an extension marker so released readers have a deliberate fallback.
export const PRESET_START_TIMING = 'preset_enter';
export const PRESET_START_LABEL = '随预设启用';

export function getTaskTriggerTiming(task, scope) {
    const timing = task?.triggerTiming;
    if (scope === 'preset' && timing === 'chat_changed' && task?.x?.presetStart === true) {
        return PRESET_START_TIMING;
    }
    return String(timing || '').toLowerCase() === 'initialization' ? 'character_init' : timing;
}

export function setTaskTriggerTiming(task, timing, scope) {
    const result = { ...task, triggerTiming: timing === PRESET_START_TIMING ? 'chat_changed' : timing };
    const isRecord = task?.x !== null && typeof task?.x === 'object' && !Array.isArray(task.x);
    const extra = isRecord ? { ...task.x } : {};
    delete extra.presetStart;
    if (scope === 'preset' && timing === PRESET_START_TIMING) {
        if (task?.x !== undefined && task.x !== null && !isRecord) {
            throw new Error('此任务的扩展字段 x 不是对象，无法添加随预设启用标记；原内容未修改。');
        }
        // Released editors label interval=0 as manual even for chat_changed.
        // The interval is unused by both event timings; keep their UI truthful.
        result.interval = 1;
        result.x = { ...extra, presetStart: true };
    } else if (isRecord && Object.prototype.hasOwnProperty.call(task.x, 'presetStart')) {
        result.x = extra;
    }
    return result;
}
