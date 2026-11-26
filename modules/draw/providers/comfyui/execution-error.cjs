'use strict';

const COMFY_EXECUTION_FAILED = 'comfy_execution_failed';
const COMFY_EXECUTION_FAILURE_COPY = 'ComfyUI 节点执行失败。请在 ComfyUI 查看工作流错误。';

function comfyExecutionError(status) {
    const failure = Array.isArray(status?.messages) && status.messages.find(event => Array.isArray(event) && event[0] === 'execution_error');
    const id = String(failure?.[1]?.node_id ?? '');
    return Object.assign(new Error(/^\d{1,12}$/.test(id) ? `#${id} · ${COMFY_EXECUTION_FAILURE_COPY}` : COMFY_EXECUTION_FAILURE_COPY),
        { code: COMFY_EXECUTION_FAILED });
}

module.exports = { comfyExecutionError, COMFY_EXECUTION_FAILED, COMFY_EXECUTION_FAILURE_COPY };
