const DEFAULT_MAX_FRAME_BYTES = 64 * 1024 * 1024;
const DEFAULT_MAX_TOTAL_BYTES = 128 * 1024 * 1024;
const DEFAULT_MAX_ERROR_BYTES = 1024 * 1024;
const PNG_SIGNATURE = Object.freeze([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

export class NovelV5StreamError extends Error {
    constructor(message, code = 'V5_STREAM_INVALID') {
        super(message);
        this.name = 'NovelV5StreamError';
        this.code = code;
    }
}

function eventField(event, key) {
    return event instanceof Map ? event.get(key) : event?.[key];
}

function isPng(bytes) {
    return bytes.length >= PNG_SIGNATURE.length
        && PNG_SIGNATURE.every((value, index) => bytes[index] === value);
}

function formatByteLimit(bytes) {
    const units = [
        ['GiB', 1024 ** 3],
        ['MiB', 1024 ** 2],
        ['KiB', 1024],
    ];
    for (const [unit, size] of units) {
        if (bytes >= size && bytes % size === 0) return `${bytes / size} ${unit}`;
    }
    return `${bytes} 字节`;
}

function createAbortError() {
    if (typeof DOMException === 'function') return new DOMException('Aborted', 'AbortError');
    const error = new Error('Aborted');
    error.name = 'AbortError';
    return error;
}

async function readStreamChunk(reader, signal) {
    try {
        return await reader.read();
    } catch (error) {
        if (signal?.aborted) throw createAbortError();
        throw new NovelV5StreamError(
            `NovelAI V5 响应流读取失败：${error?.message || '连接已中断'}`,
            'V5_STREAM_READ_FAILED',
        );
    }
}

export async function readNovelV5ErrorText(response, maxBytes = DEFAULT_MAX_ERROR_BYTES) {
    const limit = Number.isSafeInteger(maxBytes) && maxBytes > 0 ? maxBytes : DEFAULT_MAX_ERROR_BYTES;
    const declared = Number(response?.headers?.get?.('content-length'));
    if (Number.isSafeInteger(declared) && declared > limit) {
        await response?.body?.cancel?.().catch(() => {});
        return `HTTP ${Number(response?.status) || 0}（错误响应超过 ${limit} 字节）`;
    }
    if (!response?.body?.getReader) {
        const text = await response?.text?.().catch(() => '');
        return String(text || '').slice(0, limit);
    }

    const reader = response.body.getReader();
    const chunks = [];
    let total = 0;
    let truncated = false;
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const bytes = value instanceof Uint8Array ? value : new Uint8Array(value || 0);
            const remaining = limit - total;
            if (bytes.length > remaining) {
                if (remaining > 0) chunks.push(bytes.slice(0, remaining));
                total = limit;
                truncated = true;
                await reader.cancel().catch(() => {});
                break;
            }
            chunks.push(bytes);
            total += bytes.length;
        }
    } finally {
        reader.releaseLock?.();
    }
    const merged = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
    }
    const text = new TextDecoder().decode(merged);
    return truncated ? `${text}\n…（错误响应已截断）` : text;
}

export async function readNovelV5FinalImage(response, {
    decode,
    signal,
    maxFrameBytes = DEFAULT_MAX_FRAME_BYTES,
    maxTotalBytes = DEFAULT_MAX_TOTAL_BYTES,
} = {}) {
    if (typeof decode !== 'function') throw new TypeError('MessagePack decode function is required');
    if (!response?.body?.getReader) throw new NovelV5StreamError('NovelAI V5 响应没有可读取的数据流');
    const reader = response.body.getReader();
    const abortReader = () => {
        void reader.cancel(createAbortError()).catch(() => {});
    };
    signal?.addEventListener('abort', abortReader, { once: true });
    const header = new Uint8Array(4);
    let headerOffset = 0;
    let frame = null;
    let frameOffset = 0;
    let total = 0;

    try {
        while (true) {
            if (signal?.aborted) throw createAbortError();
            const { value, done } = await readStreamChunk(reader, signal);
            if (signal?.aborted) throw createAbortError();
            if (done) break;
            const chunk = value instanceof Uint8Array ? value : new Uint8Array(value || 0);
            total += chunk.length;
            if (total > maxTotalBytes) {
                throw new NovelV5StreamError(`NovelAI V5 响应超过 ${formatByteLimit(maxTotalBytes)} 限制`);
            }

            let chunkOffset = 0;
            while (chunkOffset < chunk.length) {
                if (frame === null) {
                    const headerBytes = Math.min(4 - headerOffset, chunk.length - chunkOffset);
                    header.set(chunk.subarray(chunkOffset, chunkOffset + headerBytes), headerOffset);
                    headerOffset += headerBytes;
                    chunkOffset += headerBytes;
                    if (headerOffset < 4) continue;

                    const frameLength = new DataView(header.buffer).getUint32(0, false);
                    headerOffset = 0;
                    if (!frameLength || frameLength > maxFrameBytes) {
                        throw new NovelV5StreamError('NovelAI V5 返回了无效的 MessagePack 帧长度');
                    }
                    frame = new Uint8Array(frameLength);
                    frameOffset = 0;
                }

                const frameBytes = Math.min(frame.length - frameOffset, chunk.length - chunkOffset);
                frame.set(chunk.subarray(chunkOffset, chunkOffset + frameBytes), frameOffset);
                frameOffset += frameBytes;
                chunkOffset += frameBytes;
                if (frameOffset < frame.length) continue;

                let event;
                try {
                    event = decode(frame, { useBigInt64: true });
                } catch (error) {
                    throw new NovelV5StreamError(`NovelAI V5 MessagePack 解析失败：${error?.message || '未知错误'}`);
                }
                frame = null;
                frameOffset = 0;
                const eventType = String(eventField(event, 'event_type') || '');
                if (eventType === 'error') {
                    throw new NovelV5StreamError(
                        String(eventField(event, 'message') || 'NovelAI V5 生成失败'),
                        'V5_PROVIDER_ERROR',
                    );
                }
                const sampleIndex = Number(eventField(event, 'samp_ix'));
                if (sampleIndex !== 0) {
                    throw new NovelV5StreamError(`NovelAI V5 返回了意外的样本编号：${sampleIndex}`);
                }
                if (eventType === 'intermediate') continue;
                if (eventType !== 'final') {
                    throw new NovelV5StreamError(`NovelAI V5 返回了未知事件：${eventType || '(empty)'}`);
                }
                const image = eventField(event, 'image');
                const bytes = image instanceof Uint8Array ? image : null;
                if (!bytes?.length || !isPng(bytes)) {
                    throw new NovelV5StreamError('NovelAI V5 final 事件没有有效的 PNG 图片');
                }
                await reader.cancel().catch(() => {});
                return bytes;
            }
        }
        if (headerOffset || frame !== null) {
            throw new NovelV5StreamError('NovelAI V5 响应在帧结束前被截断');
        }
        throw new NovelV5StreamError('NovelAI V5 响应结束，但没有 final 图片');
    } finally {
        signal?.removeEventListener('abort', abortReader);
        reader.releaseLock?.();
    }
}
