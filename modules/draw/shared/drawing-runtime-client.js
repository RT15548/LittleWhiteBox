import { SERVER_PLUGIN_BASE } from '../../../shared/server-plugin/identity.js';
import { DRAWING_RUNTIME_ID, DRAWING_RUNTIME_ABI } from '../../../shared/server-plugin/runtime-build.js';
export { DRAWING_RUNTIME_ABI };

export function drawingRuntimeHeaders() {
    const match = new URL(import.meta.url).pathname.match(/\/scripts\/extensions\/third-party\/([^/]+)\//);
    if (!match) throw new Error('无法确定小白盒安装目录');
    return { 'X-LWB-Extension': decodeURIComponent(match[1]), 'X-LWB-Runtime': DRAWING_RUNTIME_ID };
}

export async function prepareDrawingRuntime({ getHeaders, signal, fetchImpl = globalThis.fetch }) {
    const routing = drawingRuntimeHeaders();
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    const timer = setTimeout(abort, 15000);
    try {
        const response = await fetchImpl(`${SERVER_PLUGIN_BASE}/v1/runtime/prepare`, {
            method: 'POST', headers: { ...getHeaders(), 'Content-Type': 'application/json' }, signal: controller.signal,
            body: JSON.stringify({ extensionId: routing['X-LWB-Extension'], runtimeId: routing['X-LWB-Runtime'] }),
        });
        const body = await response.json();
        if (!response.ok || body?.ok !== true || body.abi !== DRAWING_RUNTIME_ABI || body.runtimeId !== DRAWING_RUNTIME_ID) {
            throw Object.assign(new Error('绘图组件未能加载，请等待扩展更新完成后刷新重试。'), { code: body?.code || 'runtime_unavailable' });
        }
        return routing;
    } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
    }
}
