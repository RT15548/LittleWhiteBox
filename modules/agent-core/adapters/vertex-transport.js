// Native GenerateContent transport: preserve protocol errors and response fields
// before any SDK projection. No retries, global fetch hooks or ambient credentials.
const COPY = Object.freeze({ failed: 'Vertex 请求失败', missingBody: 'Vertex 流式响应为空。' });

export function vertexInputContent(message) {
    return Array.isArray(message) ? { role: 'user', parts: message } : message;
}

export function buildVertexBody(history, message, config) {
    const { systemInstruction, tools, toolConfig, safetySettings } = config;
    const generationConfig = { ...config };
    for (const key of ['systemInstruction', 'tools', 'toolConfig', 'safetySettings', 'httpOptions', 'abortSignal']) delete generationConfig[key];
    return {
        contents: [...history, vertexInputContent(message)],
        ...(systemInstruction ? { systemInstruction: typeof systemInstruction === 'string'
            ? { parts: [{ text: systemInstruction }] } : systemInstruction } : {}),
        ...(tools ? { tools } : {}),
        ...(toolConfig ? { toolConfig } : {}),
        ...(safetySettings ? { safetySettings } : {}),
        generationConfig,
    };
}

function checkError(data, httpStatus) {
    if (!data?.error && !httpStatus) return;
    const source = data?.error;
    const error = new Error(source?.message || (typeof source === 'string' ? source : `${COPY.failed}${httpStatus ? `（HTTP ${httpStatus}）` : ''}`));
    error.code = source?.code ?? 'VERTEX_REQUEST_FAILED';
    if (source?.status) error.reason = source.status;
    if (httpStatus) error.status = httpStatus;
    throw error;
}

async function* readEvents(response) {
    if (!response.body) throw new Error(COPY.missingBody);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let ended = false;
    function event(raw) {
        const text = raw.split(/\r\n|\r|\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
        if (!text || text.trim() === '[DONE]') return null;
        const value = JSON.parse(text);
        checkError(value);
        return value;
    }
    try {
        while (true) {
            const { done, value } = await reader.read();
            buffer += decoder.decode(value, { stream: !done });
            let boundary;
            while ((boundary = /\r\n\r\n|\n\n|\r\r/.exec(buffer))) {
                const data = event(buffer.slice(0, boundary.index));
                buffer = buffer.slice(boundary.index + boundary[0].length);
                if (data) yield data;
            }
            if (done) {
                ended = true;
                if (buffer.trim()) {
                    const data = event(buffer);
                    if (data) yield data;
                }
                break;
            }
        }
    } finally {
        try { if (!ended) await reader.cancel(); }
        finally { reader.releaseLock(); }
    }
}

export function createVertexClient({ url, timeoutMs }) {
    return { chats: { create({ history = [], config: initialConfig = {} }) {
        let messages = structuredClone(history);

        async function* request({ message, config = initialConfig }, streaming) {
            const controller = new AbortController();
            const signal = config.abortSignal;
            signal?.throwIfAborted();
            const abort = () => controller.abort(signal.reason);
            signal?.addEventListener('abort', abort, { once: true });
            const deadline = setTimeout(() => controller.abort(new DOMException('Vertex request timed out.', 'TimeoutError')), timeoutMs);
            try {
                const response = await fetch(streaming ? url.replace(/:generateContent$/, ':streamGenerateContent?alt=sse') : url, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', ...config.httpOptions?.headers },
                    body: JSON.stringify(buildVertexBody(messages, message, config)), signal: controller.signal,
                });
                if (!response.ok) {
                    const raw = await response.text();
                    let data;
                    try { data = JSON.parse(raw); } catch { data = null; }
                    checkError(data, response.status);
                }
                const output = [];
                if (streaming && response.headers.get('content-type')?.includes('text/event-stream')) {
                    for await (const data of readEvents(response)) {
                        controller.signal.throwIfAborted();
                        // The adapter owns the assembled model turn, not raw fragments.
                        yield data;
                    }
                } else {
                    const data = await response.json();
                    checkError(data);
                    if (data.candidates?.[0]?.content) output.push(data.candidates[0].content);
                    yield data;
                }
                controller.signal.throwIfAborted();
                messages = [...messages, structuredClone(vertexInputContent(message)), ...structuredClone(output)];
            } finally {
                clearTimeout(deadline);
                signal?.removeEventListener('abort', abort);
            }
        }

        return {
            getHistory: () => structuredClone(messages),
            sendMessageStream: options => request(options, true),
            async sendMessage(options) {
                let result;
                for await (const data of request(options, false)) result = data;
                return result;
            },
        };
    } } };
}
