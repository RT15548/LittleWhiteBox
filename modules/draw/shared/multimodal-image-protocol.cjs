'use strict';

const { MIME_EXTENSIONS } = require('./reference-image-contract.cjs');

const OPENAI_IMAGE_CODES = Object.freeze({
    invalidApi: 'invalid_image_api', missingModel: 'missing_responses_model',
    imagesNotFound: 'images_not_found', responsesNotFound: 'responses_not_found',
    noImage: 'responses_no_image', failed: 'responses_image_failed', interrupted: 'responses_stream_interrupted',
    timedOut: 'responses_timeout', connectionLost: 'image_connection_lost', invalidPrompt: 'invalid_image_prompt',
    invalidOutputFormat: 'invalid_image_output_format', transparentFormat: 'image_transparency_requires_alpha',
});
const OPENAI_IMAGE_PROMPT_LIMIT = 32000;
const OPENAI_IMAGE_OUTPUT_FORMATS = Object.freeze(['jpeg', 'png', 'webp']);
const OPENAI_ERROR_REASONS = new Set([
    'not_found', 'model_not_found', 'invalid_api_key', 'invalid_request_error', 'invalid_value',
    'invalid_image', 'invalid_image_format', 'invalid_image_url', 'unsupported_image', 'unsupported_value',
    'unsupported_parameter', 'missing_required_parameter', 'image_too_large', 'invalid_base64_image',
    'content_policy_violation', 'image_generation_failed', 'insufficient_quota', 'rate_limit_exceeded',
    'server_error', 'internal_error', 'max_output_tokens', 'content_filter',
]);
const MAX_STREAM_BYTES = 128 * 1024 * 1024;

function protocolError(code, status, reason) {
    return Object.assign(new Error(code), { code, status, reason });
}

function readOpenAiImageApi({ imageApi = 'images', responsesModel } = {}) {
    if (imageApi === 'images') return { imageApi, responsesModel: '' };
    if (imageApi !== 'responses') throw protocolError(OPENAI_IMAGE_CODES.invalidApi);
    if (typeof responsesModel !== 'string' || !responsesModel.trim()) throw protocolError(OPENAI_IMAGE_CODES.missingModel);
    return { imageApi, responsesModel: responsesModel.trim() };
}

function validateOpenAiImagePrompt(prompt) {
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > OPENAI_IMAGE_PROMPT_LIMIT) {
        throw protocolError(OPENAI_IMAGE_CODES.invalidPrompt);
    }
}

function readOpenAiImageOutputFormat(format, background) {
    // A preset without a format can still explicitly request a transparent background.
    const value = format === undefined ? (background === 'transparent' ? 'png' : 'jpeg') : format;
    if (!OPENAI_IMAGE_OUTPUT_FORMATS.includes(value)) throw protocolError(OPENAI_IMAGE_CODES.invalidOutputFormat);
    if (background === 'transparent' && value === 'jpeg') throw protocolError(OPENAI_IMAGE_CODES.transparentFormat);
    return value;
}

function openaiErrorReason(error) {
    return [error?.code, error?.type].find(reason => OPENAI_ERROR_REASONS.has(reason));
}

async function openaiHttpError(response, context, readJson = value => value.json()) {
    const { status } = response;
    if (status === 404) {
        return protocolError(context.imageApi === 'responses' ? OPENAI_IMAGE_CODES.responsesNotFound : OPENAI_IMAGE_CODES.imagesNotFound, status);
    }
    // Only recognized machine codes may cross the boundary, never echoed upstream text.
    let reason;
    try { reason = openaiErrorReason((await readJson(response))?.error); }
    catch (error) { if (!(error instanceof SyntaxError || error instanceof TypeError)) throw error; }
    return protocolError('upstream_error', status, reason);
}

function upstreamReason(value) {
    return typeof value === 'string' && /^[a-z][a-z0-9_]{0,79}$/i.test(value) ? value : '';
}

function endpoint(base, path) {
    const url = new URL(base);
    url.pathname = url.pathname.replace(/\/+$/, '') + path;
    return url;
}

function geminiRequest(context, { payload: { model, contents, generationConfig }, referenceImages = [] }) {
    const [turn] = contents;
    return {
        url: endpoint(context.url, `/models/${encodeURIComponent(model)}:generateContent`),
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': context.key },
        body: JSON.stringify({ contents: [{ ...turn, parts: [...turn.parts, ...referenceImages.map(inlineData => ({ inlineData }))] }], generationConfig }),
    };
}

function geminiResult(data) {
    const blockReason = upstreamReason(data?.promptFeedback?.blockReason);
    const values = [];
    const failures = [];
    for (const candidate of Array.isArray(data?.candidates) ? data.candidates : []) {
        const finishReason = upstreamReason(candidate?.finishReason);
        if (finishReason && finishReason !== 'STOP' && finishReason !== 'FINISH_REASON_UNSPECIFIED') failures.push(finishReason);
        for (const part of Array.isArray(candidate?.content?.parts) ? candidate.content.parts : []) {
            if (part?.thought === true || !Object.hasOwn(part ?? {}, 'inlineData')) continue;
            values.push({ data: part.inlineData?.data, mimeType: part.inlineData?.mimeType ?? null });
        }
    }
    const blocked = (blockReason && blockReason !== 'BLOCK_REASON_UNSPECIFIED' ? blockReason : '')
        || failures.find(reason => /SAFETY|PROHIBITED|BLOCKLIST|RECITATION|SPII/.test(reason));
    const reason = blocked || failures[0];
    return { values, incomplete: Boolean(reason), reason, code: blocked ? 'image_blocked' : 'no_image' };
}

function openaiRequest(context, { payload: input, referenceImages = [] }) {
    const payload = { ...input, moderation: 'low' };
    validateOpenAiImagePrompt(payload.prompt);
    const headers = { Authorization: `Bearer ${context.key}` };
    const { imageApi, responsesModel } = readOpenAiImageApi(context);
    if (imageApi === 'responses') {
        const { model, prompt, size, quality, background, output_format, moderation } = payload;
        return { url: endpoint(context.url, '/responses'), headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: responsesModel,
                input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }, ...referenceImages.map(({ mimeType, data }) => ({
                    type: 'input_image', image_url: `data:${mimeType};base64,${data}`,
                }))] }],
                tools: [{ type: 'image_generation', model, size, quality, background, output_format, moderation,
                    action: referenceImages.length ? 'edit' : 'generate' }],
                tool_choice: 'required', stream: true,
            }),
        };
    }
    const url = endpoint(context.url, `/images/${referenceImages.length ? 'edits' : 'generations'}`);
    if (!referenceImages.length) {
        headers['Content-Type'] = 'application/json';
        return { url, headers, body: JSON.stringify(payload) };
    }
    const body = new FormData();
    for (const [key, value] of Object.entries(payload)) body.set(key, String(value));
    referenceImages.forEach(({ data, mimeType }, index) => {
        const bytes = Uint8Array.from(atob(data), byte => byte.charCodeAt(0));
        body.append('image[]', new Blob([bytes], { type: mimeType }), `reference-${index + 1}.${MIME_EXTENSIONS[mimeType]}`);
    });
    return { url, headers, body };
}

function readResponsesEvent(eventName, dataLines) {
    const data = dataLines.join('\n');
    const failureEvents = ['error', 'response.failed', 'response.incomplete'];
    const declaredFailure = failureEvents.includes(eventName);
    if (!declaredFailure && (!data || data === '[DONE]')) return;
    let event;
    try { event = JSON.parse(data); }
    catch (error) {
        if (!declaredFailure || !(error instanceof SyntaxError)) throw error;
    }
    const type = declaredFailure ? eventName : event?.type ?? eventName;
    if (failureEvents.includes(type)) {
        if (!event || typeof event !== 'object') throw protocolError(OPENAI_IMAGE_CODES.failed);
        const error = event.response?.error ?? event.error ?? event;
        const reason = openaiErrorReason(error) ?? openaiErrorReason({ code: event.response?.incomplete_details?.reason });
        const status = error.status ?? error.status_code;
        throw protocolError(OPENAI_IMAGE_CODES.failed, Number.isInteger(status) && status >= 400 && status <= 599 ? status : undefined, reason);
    }
    if (type !== 'response.completed') return;
    const output = event.response?.output;
    const calls = Array.isArray(output) ? output.filter(item => item?.type === 'image_generation_call') : [];
    const completed = calls.filter(item => item.status === 'completed');
    if (!completed.length) {
        if (calls.length) throw protocolError(OPENAI_IMAGE_CODES.failed, undefined, openaiErrorReason(calls.find(item => item.error)?.error));
        throw protocolError(OPENAI_IMAGE_CODES.noImage);
    }
    return { values: completed.map(item => ({ data: item.result })), incomplete: completed.length < calls.length };
}

async function readOpenAiImageResult(response, context, payload, readJson = value => value.json()) {
    if (context.imageApi !== 'responses') {
        let data;
        try { data = await readJson(response); }
        catch (error) {
            if (!(error instanceof SyntaxError)) throw error;
            throw protocolError('invalid_result');
        }
        const values = Array.isArray(data?.data) ? data.data.map(image => ({ data: image?.b64_json })) : [];
        return { values, incomplete: payload.n > values.length, code: 'no_image' };
    }
    const reader = response.body?.getReader();
    if (!reader) throw protocolError(OPENAI_IMAGE_CODES.interrupted);
    const decoder = new TextDecoder();
    let total = 0, ended = false, skipLf = false, eventName = '';
    const lineParts = [], dataLines = [];
    const lineEnd = /\r\n|\r|\n/g;
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) { ended = true; break; }
            total += value.byteLength;
            if (total > MAX_STREAM_BYTES) break;
            const chunk = decoder.decode(value, { stream: true });
            if (!chunk) continue;
            let start = skipLf && chunk.startsWith('\n') ? 1 : 0;
            skipLf = false;
            lineEnd.lastIndex = start;
            let match;
            while ((match = lineEnd.exec(chunk))) {
                const tail = chunk.slice(start, match.index);
                start = lineEnd.lastIndex;
                skipLf = match[0] === '\r' && start === chunk.length;
                if (!lineParts.length && !tail) {
                    const result = readResponsesEvent(eventName, dataLines);
                    eventName = '';
                    dataLines.length = 0;
                    if (result) return result;
                    continue;
                }
                // Long base64 lines stay in slices until their newline arrives.
                const line = lineParts.length ? lineParts.concat(tail).join('') : tail;
                lineParts.length = 0;
                if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''));
                else if (line.startsWith('event:')) eventName = line.slice(6).replace(/^ /, '');
            }
            if (start < chunk.length) lineParts.push(chunk.slice(start));
        }
    } catch (error) {
        if (error?.code === OPENAI_IMAGE_CODES.failed || error?.code === OPENAI_IMAGE_CODES.noImage || error?.name === 'AbortError') throw error;
        throw protocolError(OPENAI_IMAGE_CODES.interrupted);
    } finally {
        if (!ended) void reader.cancel().catch(() => console.debug({ operation: 'cancelResponsesStream' }));
        reader.releaseLock();
    }
    throw protocolError(OPENAI_IMAGE_CODES.interrupted);
}

const protocols = Object.freeze({
    gemini: { request: geminiRequest, result: geminiResult, errorReason: error => error?.status },
    openai: { request: openaiRequest, readResult: readOpenAiImageResult, httpError: openaiHttpError },
});

module.exports = { protocols, upstreamReason, readOpenAiImageApi, readOpenAiImageOutputFormat, validateOpenAiImagePrompt,
    OPENAI_IMAGE_CODES, OPENAI_IMAGE_OUTPUT_FORMATS, OPENAI_IMAGE_PROMPT_LIMIT };
