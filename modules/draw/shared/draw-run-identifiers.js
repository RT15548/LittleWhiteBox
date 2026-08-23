const DRAW_RUN_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{7,79}$/;

export function assertDrawRunId(value) {
    const runId = String(value || '').trim();
    if (!DRAW_RUN_ID_PATTERN.test(runId)) {
        throw new TypeError('Draw Run id 必须是 8～80 位安全标识符');
    }
    return runId;
}

export function createDrawRunId(cryptoImpl = globalThis.crypto) {
    if (typeof cryptoImpl?.randomUUID === 'function') {
        return assertDrawRunId(cryptoImpl.randomUUID());
    }
    if (typeof cryptoImpl?.getRandomValues !== 'function') {
        throw new Error('当前环境无法生成 Draw Run 标识符');
    }
    const bytes = cryptoImpl.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0F) | 0x40;
    bytes[8] = (bytes[8] & 0x3F) | 0x80;
    const hex = Array.from(bytes, value => value.toString(16).padStart(2, '0'));
    return assertDrawRunId([
        hex.slice(0, 4).join(''),
        hex.slice(4, 6).join(''),
        hex.slice(6, 8).join(''),
        hex.slice(8, 10).join(''),
        hex.slice(10).join(''),
    ].join('-'));
}

export function deriveDrawRunChildJobId(runId) {
    return `draw-run:${assertDrawRunId(runId)}`;
}

export function deriveDrawRunItemIds(runId, index) {
    const safeRunId = assertDrawRunId(runId);
    const itemIndex = Number(index);
    if (!Number.isSafeInteger(itemIndex) || itemIndex < 0 || itemIndex >= 20) {
        throw new TypeError('Draw Run 图片索引必须是 0～19 的整数');
    }
    const ordinal = itemIndex + 1;
    return Object.freeze({
        slotId: `slot-draw-${safeRunId}-${ordinal}`,
        imgId: `img-draw-${safeRunId}-${ordinal}`,
    });
}
