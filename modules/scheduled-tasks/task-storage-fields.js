export const PRESET_TASK_FIELD = 'scheduledTasks';
export const PRESET_PROMPT_ORDER_CHARACTER_ID = 100000;

export function readPresetTaskField(preset) {
    return preset?.prompt_order?.find(entry => Number(entry?.character_id) === PRESET_PROMPT_ORDER_CHARACTER_ID)
        ?.xiaobai_ext?.[PRESET_TASK_FIELD] || [];
}
