import type {
    TavernCharacterArchivePartManifest,
    TavernCharacterArchiveRecord,
} from './character-archive-types';

const DEFAULT_TARGET_PART_RAW_BYTES = 64 * 1024 * 1024;
const DEFAULT_FORCE_PART_RAW_BYTES = 128 * 1024 * 1024;
const DEFAULT_PARSE_CHUNK_BYTES = 1024 * 1024;
const DEFAULT_SHA256_YIELD_BLOCKS = 65536;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const SHA256_INITIAL_HASH = [
    0x6a09e667,
    0xbb67ae85,
    0x3c6ef372,
    0xa54ff53a,
    0x510e527f,
    0x9b05688c,
    0x1f83d9ab,
    0x5be0cd19,
];
const SHA256_ROUND_CONSTANTS = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

export interface TavernCharacterArchiveJsonlCodec {
    gzip(bytes: Uint8Array): Promise<Uint8Array>;
    ungzip(bytes: Uint8Array): Promise<Uint8Array>;
}

export interface TavernCharacterArchiveWriterOptions {
    archiveId: string;
    targetRawBytes?: number;
    forceRawBytes?: number;
    codec?: TavernCharacterArchiveJsonlCodec;
    filenameForPart: (index: number) => string;
    uploadPart: (input: {
        index: number;
        filename: string;
        bytes: Uint8Array;
        rawBytes: number;
        rowCount: number;
        sha256: string;
    }) => Promise<void>;
    onPartFlushed?: (part: TavernCharacterArchivePartManifest) => void;
}

export interface TavernCharacterArchiveWriterResult {
    parts: TavernCharacterArchivePartManifest[];
    rawBytes: number;
    rowCount: number;
}

export function encodeTavernCharacterArchiveRecord(record: TavernCharacterArchiveRecord): Uint8Array {
    return textEncoder.encode(`${JSON.stringify(record)}\n`);
}

function parseTavernCharacterArchiveJsonlLine(line = ''): TavernCharacterArchiveRecord | null {
    const trimmed = line.trim();
    if (!trimmed) {return null;}
    const parsed = JSON.parse(trimmed) as TavernCharacterArchiveRecord;
    if (!parsed || typeof parsed !== 'object' || typeof parsed.table !== 'string' || !('record' in parsed)) {
        throw new Error('archive_jsonl_record_invalid');
    }
    return parsed;
}

export function* parseTavernCharacterArchiveJsonlBatches(
    bytes: Uint8Array,
    batchSize = 500,
    chunkBytes = DEFAULT_PARSE_CHUNK_BYTES,
): Iterable<TavernCharacterArchiveRecord[]> {
    const size = Math.max(1, Math.floor(Number(batchSize) || 500));
    const chunkSize = Math.max(1, Math.floor(Number(chunkBytes) || DEFAULT_PARSE_CHUNK_BYTES));
    let batch: TavernCharacterArchiveRecord[] = [];
    let pendingLine = '';
    const decoder = new TextDecoder();
    const pushLine = function* (line: string): Iterable<TavernCharacterArchiveRecord[]> {
        const parsed = parseTavernCharacterArchiveJsonlLine(line);
        if (!parsed) {return;}
        batch.push(parsed);
        if (batch.length >= size) {
            yield batch;
            batch = [];
        }
    };
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        const text = decoder.decode(bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)), { stream: true });
        let start = 0;
        while (start <= text.length) {
            const newlineIndex = text.indexOf('\n', start);
            if (newlineIndex === -1) {
                pendingLine += text.slice(start);
                break;
            }
            const line = pendingLine + text.slice(start, newlineIndex);
            pendingLine = '';
            for (const readyBatch of pushLine(line)) {
                yield readyBatch;
            }
            start = newlineIndex + 1;
        }
    }
    const tail = decoder.decode();
    if (tail) {
        pendingLine += tail;
    }
    if (pendingLine) {
        for (const readyBatch of pushLine(pendingLine)) {
            yield readyBatch;
        }
    }
    if (batch.length) {
        yield batch;
    }
}

export function parseTavernCharacterArchiveJsonl(bytes: Uint8Array): TavernCharacterArchiveRecord[] {
    const rows: TavernCharacterArchiveRecord[] = [];
    for (const batch of parseTavernCharacterArchiveJsonlBatches(bytes)) {
        rows.push(...batch);
    }
    return rows;
}

export async function gzipTavernArchiveBytes(bytes: Uint8Array): Promise<Uint8Array> {
    const CompressionStreamConstructor = globalThis.CompressionStream;
    if (typeof CompressionStreamConstructor !== 'function') {
        throw new Error('compression_stream_unavailable');
    }
    const stream = new Blob([bytesToArrayBuffer(bytes)]).stream().pipeThrough(new CompressionStreamConstructor('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function ungzipTavernArchiveBytes(bytes: Uint8Array): Promise<Uint8Array> {
    const DecompressionStreamConstructor = globalThis.DecompressionStream;
    if (typeof DecompressionStreamConstructor !== 'function') {
        throw new Error('decompression_stream_unavailable');
    }
    const stream = new Blob([bytesToArrayBuffer(bytes)]).stream().pipeThrough(new DecompressionStreamConstructor('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

export const browserTavernCharacterArchiveJsonlCodec: TavernCharacterArchiveJsonlCodec = {
    gzip: gzipTavernArchiveBytes,
    ungzip: ungzipTavernArchiveBytes,
};

export function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function rightRotate32(value: number, shift: number): number {
    return (value >>> shift) | (value << (32 - shift));
}

function sha256CompressBlock(hash: number[], block: Uint8Array, offset: number, words: number[]) {
    for (let index = 0; index < 16; index += 1) {
        const wordOffset = offset + index * 4;
        words[index] = (
            (block[wordOffset] << 24)
            | (block[wordOffset + 1] << 16)
            | (block[wordOffset + 2] << 8)
            | block[wordOffset + 3]
        ) >>> 0;
    }
    for (let index = 16; index < 64; index += 1) {
        const s0 = (rightRotate32(words[index - 15], 7) ^ rightRotate32(words[index - 15], 18) ^ (words[index - 15] >>> 3)) >>> 0;
        const s1 = (rightRotate32(words[index - 2], 17) ^ rightRotate32(words[index - 2], 19) ^ (words[index - 2] >>> 10)) >>> 0;
        words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = hash;
    for (let index = 0; index < 64; index += 1) {
        const sum1 = (rightRotate32(e, 6) ^ rightRotate32(e, 11) ^ rightRotate32(e, 25)) >>> 0;
        const choice = ((e & f) ^ (~e & g)) >>> 0;
        const temp1 = (h + sum1 + choice + SHA256_ROUND_CONSTANTS[index] + words[index]) >>> 0;
        const sum0 = (rightRotate32(a, 2) ^ rightRotate32(a, 13) ^ rightRotate32(a, 22)) >>> 0;
        const majority = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
        const temp2 = (sum0 + majority) >>> 0;
        h = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
    }

    hash[0] = (hash[0] + a) >>> 0;
    hash[1] = (hash[1] + b) >>> 0;
    hash[2] = (hash[2] + c) >>> 0;
    hash[3] = (hash[3] + d) >>> 0;
    hash[4] = (hash[4] + e) >>> 0;
    hash[5] = (hash[5] + f) >>> 0;
    hash[6] = (hash[6] + g) >>> 0;
    hash[7] = (hash[7] + h) >>> 0;
}

async function yieldMainThread(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
    const input = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const hash = [...SHA256_INITIAL_HASH];
    const words = new Array<number>(64).fill(0);
    const fullBlockBytes = input.length - (input.length % 64);
    let processedBlocks = 0;
    for (let offset = 0; offset < fullBlockBytes; offset += 64) {
        sha256CompressBlock(hash, input, offset, words);
        processedBlocks += 1;
        if (processedBlocks % DEFAULT_SHA256_YIELD_BLOCKS === 0) {
            await yieldMainThread();
        }
    }

    const tailLength = input.length - fullBlockBytes;
    const finalBlocks = new Uint8Array(tailLength >= 56 ? 128 : 64);
    finalBlocks.set(input.subarray(fullBlockBytes));
    finalBlocks[tailLength] = 0x80;
    const bitLength = input.length * 8;
    const bitLengthHigh = Math.floor(bitLength / 0x100000000);
    const bitLengthLow = bitLength >>> 0;
    const lengthOffset = finalBlocks.length - 8;
    finalBlocks[lengthOffset] = (bitLengthHigh >>> 24) & 0xff;
    finalBlocks[lengthOffset + 1] = (bitLengthHigh >>> 16) & 0xff;
    finalBlocks[lengthOffset + 2] = (bitLengthHigh >>> 8) & 0xff;
    finalBlocks[lengthOffset + 3] = bitLengthHigh & 0xff;
    finalBlocks[lengthOffset + 4] = (bitLengthLow >>> 24) & 0xff;
    finalBlocks[lengthOffset + 5] = (bitLengthLow >>> 16) & 0xff;
    finalBlocks[lengthOffset + 6] = (bitLengthLow >>> 8) & 0xff;
    finalBlocks[lengthOffset + 7] = bitLengthLow & 0xff;
    for (let offset = 0; offset < finalBlocks.length; offset += 64) {
        sha256CompressBlock(hash, finalBlocks, offset, words);
    }

    return hash.map((word) => word.toString(16).padStart(8, '0')).join('');
}

export function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
        const chunk = bytes.subarray(index, Math.min(index + chunkSize, bytes.length));
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
}

export function base64ToBytes(value = ''): Uint8Array {
    const binary = atob(String(value || ''));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
}

export function textToBytes(value = ''): Uint8Array {
    return textEncoder.encode(String(value || ''));
}

export function bytesToText(bytes: Uint8Array): string {
    return textDecoder.decode(bytes);
}

function concatByteChunks(chunks: Uint8Array[], totalBytes: number): Uint8Array {
    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
    }
    return bytes;
}

export class TavernCharacterArchiveWriter {
    private readonly targetRawBytes: number;
    private readonly forceRawBytes: number;
    private readonly codec: TavernCharacterArchiveJsonlCodec;
    private readonly filenameForPart: TavernCharacterArchiveWriterOptions['filenameForPart'];
    private readonly uploadPart: TavernCharacterArchiveWriterOptions['uploadPart'];
    private readonly onPartFlushed?: TavernCharacterArchiveWriterOptions['onPartFlushed'];
    private chunks: Uint8Array[] = [];
    private currentRawBytes = 0;
    private currentRowCount = 0;
    private nextPartIndex = 1;
    private totalRawBytes = 0;
    private totalRowCount = 0;
    private closed = false;
    readonly archiveId: string;
    readonly parts: TavernCharacterArchivePartManifest[] = [];

    constructor(options: TavernCharacterArchiveWriterOptions) {
        this.archiveId = String(options.archiveId || '').trim();
        this.targetRawBytes = Math.max(1, Math.floor(Number(options.targetRawBytes) || DEFAULT_TARGET_PART_RAW_BYTES));
        this.forceRawBytes = Math.max(this.targetRawBytes, Math.floor(Number(options.forceRawBytes) || DEFAULT_FORCE_PART_RAW_BYTES));
        this.codec = options.codec || browserTavernCharacterArchiveJsonlCodec;
        this.filenameForPart = options.filenameForPart;
        this.uploadPart = options.uploadPart;
        this.onPartFlushed = options.onPartFlushed;
    }

    async write(record: TavernCharacterArchiveRecord): Promise<void> {
        if (this.closed) {throw new Error('archive_writer_closed');}
        const row = encodeTavernCharacterArchiveRecord(record);
        if (this.currentRowCount > 0 && this.currentRawBytes >= this.targetRawBytes) {
            await this.flush();
        }
        this.chunks.push(row);
        this.currentRawBytes += row.length;
        this.currentRowCount += 1;
        this.totalRawBytes += row.length;
        this.totalRowCount += 1;
        if (this.currentRawBytes >= this.forceRawBytes) {
            await this.flush();
        }
    }

    async flush(): Promise<TavernCharacterArchivePartManifest | null> {
        if (!this.currentRowCount) {return null;}
        const index = this.nextPartIndex;
        const filename = this.filenameForPart(index);
        const rawBytes = concatByteChunks(this.chunks, this.currentRawBytes);
        const compressed = await this.codec.gzip(rawBytes);
        const sha256 = await sha256Hex(compressed);
        const part = {
            index,
            filename,
            rowCount: this.currentRowCount,
            rawBytes: rawBytes.length,
            compressedBytes: compressed.length,
            sha256,
        };
        await this.uploadPart({
            index,
            filename,
            bytes: compressed,
            rawBytes: rawBytes.length,
            rowCount: this.currentRowCount,
            sha256,
        });
        this.parts.push(part);
        this.onPartFlushed?.(part);
        this.nextPartIndex += 1;
        this.chunks = [];
        this.currentRawBytes = 0;
        this.currentRowCount = 0;
        return part;
    }

    async close(): Promise<TavernCharacterArchiveWriterResult> {
        if (!this.closed) {
            await this.flush();
            this.closed = true;
        }
        return {
            parts: [...this.parts],
            rawBytes: this.totalRawBytes,
            rowCount: this.totalRowCount,
        };
    }
}
