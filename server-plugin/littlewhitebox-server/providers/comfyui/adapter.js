'use strict';

const {
    basicAuthHeader,
    createUpstreamError,
    detectImageMime,
    endpoint,
    readErrorText,
    readJsonResponse,
    readResponseBuffer,
} = require('../upstream.js');

const SUCCESS_WITHOUT_IMAGE_GRACE_MS = 15_000;
const CANCEL_REQUEST_TIMEOUT_MS = 5_000;

function createAbortError() {
    return Object.assign(new Error('Request aborted'), { name: 'AbortError' });
}

function waitForPoll(signal, duration = 100) {
    return new Promise((resolve, reject) => {
        if (signal.aborted) {
            reject(createAbortError());
            return;
        }
        const finish = () => {
            signal.removeEventListener('abort', abort);
            resolve();
        };
        const timer = setTimeout(finish, duration);
        const abort = () => {
            clearTimeout(timer);
            reject(createAbortError());
        };
        signal.addEventListener('abort', abort, { once: true });
    });
}

function normalizeClassType(value) {
    return String(value || '').replace(/\s+/g, '').toLowerCase();
}

function outputTitleScore(node) {
    const title = String(node?._meta?.title || node?.title || '').trim();
    if (/final|最终/i.test(title)) return 50;
    if (/output|result|输出|结果/i.test(title)) return 40;
    if (/save|保存/i.test(title)) return 35;
    return 0;
}

function getSaveImageNodeIds(workflow) {
    return Object.entries(workflow || {})
        .filter(([, node]) => normalizeClassType(node?.class_type) === 'saveimage')
        .map(([id, node]) => ({ id: String(id), score: outputTitleScore(node) }))
        .sort((a, b) => b.score - a.score || Number(b.id) - Number(a.id))
        .map(entry => entry.id);
}

function selectOutput(item, preferredSaveImageNodeId, saveImageNodeIds) {
    const outputs = item?.outputs || {};
    const pick = (output) => output?.images?.[0] || output?.gifs?.[0] || null;
    if (preferredSaveImageNodeId && saveImageNodeIds.includes(String(preferredSaveImageNodeId))) {
        const preferred = pick(outputs[String(preferredSaveImageNodeId)]);
        if (preferred) return preferred;
    }
    for (const nodeId of saveImageNodeIds) {
        const output = pick(outputs[nodeId]);
        if (output) return output;
    }
    return null;
}

function describeExecutionError(status) {
    const details = Array.isArray(status?.messages)
        ? status.messages
            .filter(message => Array.isArray(message) && message[0] === 'execution_error')
            .map(message => message[1] || {})
            .map(detail => `${detail.node_type || 'Unknown'} [${detail.node_id || '?'}] ${detail.exception_type || 'Error'}: ${detail.exception_message || ''}`)
            .join('\n')
        : '';
    return `ComfyUI generation failed${details ? `\n\n${details}` : ''}`;
}

/**
 * ComfyUI history entries report completion differently across versions:
 * current builds expose `status.status_str`, some expose only `status.completed`,
 * and legacy builds omit `status` entirely (an entry only appears once the prompt
 * finished). Treat all three as finished so "finished but no image" hits the grace
 * path instead of polling until the item times out.
 */
function isFinishedHistoryItem(historyItem) {
    const status = historyItem?.status;
    if (!status) return true;
    return status.status_str === 'success' || status.completed === true;
}

async function execute({ context, item, signal }) {
    const headers = context.auth ? { Authorization: basicAuthHeader(context.auth) } : {};
    // ComfyUI 始终保留地址里的反代基础路径，与浏览器直连链路 createComfyUrl 的行为一致。
    const endpointOptions = { appendPath: true };
    const promptUrl = endpoint(context.url, '/prompt', endpointOptions);
    const queueUrl = endpoint(context.url, '/queue', endpointOptions);
    const saveImageNodeIds = getSaveImageNodeIds(item.request.workflow);
    let promptId = '';
    let dropSent = false;
    // ComfyUI 只提供 /queue delete（删除排队中的 prompt）和全局 /interrupt。/interrupt 会打断
    // 同一实例上别人正在跑的任务，绝不能用。所以取消 = 停止跟踪本次执行 + 尽力删除还在排队的 prompt；
    // 已经开始执行的 prompt 会继续跑完并占用 GPU，只是结果不再被收取。
    const dropQueuedPrompt = () => {
        if (!promptId || dropSent) return;
        dropSent = true;
        void fetch(queueUrl, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ delete: [promptId] }),
            signal: AbortSignal.timeout(CANCEL_REQUEST_TIMEOUT_MS),
        }).catch(() => {});
    };
    signal.addEventListener('abort', dropQueuedPrompt, { once: true });
    try {
        const promptResponse = await fetch(promptUrl, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: item.request.workflow }),
            signal,
        });
        if (!promptResponse.ok) throw createUpstreamError(promptResponse, await readErrorText(promptResponse));
        promptId = (await readJsonResponse(promptResponse))?.prompt_id;
        if (!promptId) throw new Error('ComfyUI did not return a prompt ID');
        if (signal.aborted) {
            dropQueuedPrompt();
            throw createAbortError();
        }
        const historyUrl = endpoint(context.url, `/history/${encodeURIComponent(promptId)}`, endpointOptions);

        let historyItem = null;
        let output = null;
        let successfulWithoutImageSince = null;
        while (!signal.aborted) {
            const historyResponse = await fetch(historyUrl, { headers, signal });
            if (!historyResponse.ok) throw createUpstreamError(historyResponse, await readErrorText(historyResponse));
            historyItem = (await readJsonResponse(historyResponse))?.[promptId] || null;
            if (!historyItem) {
                await waitForPoll(signal);
                continue;
            }
            if (historyItem.status?.status_str === 'error') {
                throw new Error(describeExecutionError(historyItem.status));
            }
            output = selectOutput(historyItem, item.request.preferredSaveImageNodeId, saveImageNodeIds);
            if (output) break;
            if (isFinishedHistoryItem(historyItem)) {
                successfulWithoutImageSince ??= Date.now();
                if (Date.now() - successfulWithoutImageSince >= SUCCESS_WITHOUT_IMAGE_GRACE_MS) {
                    throw new Error('ComfyUI may have generated an image but did not return it. Check the ComfyUI output directory.');
                }
            }
            await waitForPoll(signal);
        }
        if (signal.aborted) throw createAbortError();
        if (!output) throw new Error('ComfyUI did not return an image');

        const viewUrl = endpoint(context.url, '/view', endpointOptions);
        viewUrl.searchParams.set('filename', String(output.filename || ''));
        viewUrl.searchParams.set('subfolder', String(output.subfolder || ''));
        viewUrl.searchParams.set('type', String(output.type || 'output'));
        const imageResponse = await fetch(viewUrl, { headers, signal });
        if (!imageResponse.ok) throw createUpstreamError(imageResponse, await readErrorText(imageResponse));
        const buffer = await readResponseBuffer(imageResponse);
        const mime = detectImageMime(buffer);
        if (!mime) throw new Error('ComfyUI returned an unsupported image format');
        return { buffer, mime };
    } finally {
        signal.removeEventListener('abort', dropQueuedPrompt);
    }
}

function normalize(context, items, { parseTimeout, parseUrl }) {
    const url = parseUrl(context?.url);
    if (!url) return { error: 'ComfyUI URL must be a complete HTTP(S) URL' };
    const normalized = [];
    for (let index = 0; index < items.length; index++) {
        const source = items[index];
        const request = source?.request;
        if (!source || typeof source !== 'object' || !request || typeof request.workflow !== 'object' || Array.isArray(request.workflow)) {
            return { error: `items[${index}].request.workflow is required` };
        }
        const saveImageNodeIds = getSaveImageNodeIds(request.workflow);
        if (saveImageNodeIds.length === 0) return { error: `items[${index}].request.workflow must contain a SaveImage node` };
        const preferredSaveImageNodeId = String(request.preferredSaveImageNodeId || '');
        if (preferredSaveImageNodeId && !saveImageNodeIds.includes(preferredSaveImageNodeId)) {
            return { error: `items[${index}].request.preferredSaveImageNodeId must identify a SaveImage node` };
        }
        const timeout = parseTimeout(source.timeout);
        if (timeout === null) return { error: `items[${index}].timeout must be a positive number` };
        normalized.push({
            kind: 'image',
            request: {
                workflow: request.workflow,
                preferredSaveImageNodeId,
            },
            timeout,
        });
    }
    return {
        context: {
            url,
            auth: String(context?.auth || ''),
        },
        items: normalized,
    };
}

module.exports = { execute, normalize };
