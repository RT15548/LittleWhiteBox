export const DSML_TOOL_CALL_INVALID = 'DSML_TOOL_CALL_INVALID';
export const DEEPSEEK_TOOL_MODE_GUIDANCE = 'DeepSeek 不建议使用 JSON 兼容模式。请在 Agent API 设置中，将工具模式改为「原生 Tool Calling」，保存后重试。';

/**
 * User guidance is separate from parser diagnostics, including serialized run errors.
 * @param {unknown} error
 */
export function agentErrorGuidance(error) {
    return error && typeof error === 'object' && 'code' in error && error.code === DSML_TOOL_CALL_INVALID
        ? DEEPSEEK_TOOL_MODE_GUIDANCE : '';
}
