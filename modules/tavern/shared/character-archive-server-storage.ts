import type {
    TavernCharacterArchiveManifest,
} from './character-archive-types';
import {
    bytesToBase64,
    bytesToText,
    sha256Hex,
    textToBytes,
} from './character-archive-jsonl';

export interface TavernCharacterArchiveTransferProgress {
    loadedBytes: number;
    totalBytes: number;
    lengthComputable: boolean;
}

export type TavernCharacterArchiveHeadersProvider = () => Promise<Record<string, unknown>> | Record<string, unknown>;

export interface TavernCharacterArchiveTransferOptions {
    headers?: Record<string, unknown>;
    headersProvider?: TavernCharacterArchiveHeadersProvider;
    onProgress?: (progress: TavernCharacterArchiveTransferProgress) => void;
}

function normalizeHeaderValue(value: unknown): string {
    if (typeof value === 'string') {return value;}
    if (typeof value === 'number' || typeof value === 'boolean') {return String(value);}
    return '';
}

async function resolveHeaders(options: TavernCharacterArchiveTransferOptions = {}): Promise<Record<string, string>> {
    const source = options.headersProvider ? await options.headersProvider() : options.headers || {};
    const headers: Record<string, string> = {};
    Object.entries(source || {}).forEach(([key, value]) => {
        const headerValue = normalizeHeaderValue(value);
        if (key && headerValue) {
            headers[key] = headerValue;
        }
    });
    return headers;
}

function setXhrHeaders(xhr: XMLHttpRequest, headers: Record<string, string>) {
    Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
    });
}

function buildNoCacheUserFileUrl(filename = ''): string {
    const query = new URLSearchParams({ v: String(Date.now()) });
    return `/user/files/${encodeURIComponent(filename)}?${query.toString()}`;
}

function createArchiveStorageError(action: string, status: number, responseText = ''): Error {
    const detail = String(responseText || '').replace(/\s+/g, ' ').trim();
    return new Error(detail ? `${action}_http_${status}: ${detail}` : `${action}_http_${status}`);
}

function readArchiveXhrErrorText(xhr: XMLHttpRequest): string {
    try {
        return xhr.responseText || '';
    } catch {
        const response = xhr.response;
        if (response instanceof ArrayBuffer) {
            try {
                return bytesToText(new Uint8Array(response));
            } catch {
                return '';
            }
        }
        return '';
    }
}

function isArchiveNotFoundText(text = ''): boolean {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
    return !normalized
        || normalized === 'not found'
        || normalized === 'not found.'
        || normalized.startsWith('cannot get ')
        || normalized.includes('file not found');
}

function isArchiveNotFoundError(error: unknown): boolean {
    return error instanceof Error && /^archive_download_failed_http_404\b/.test(error.message);
}

export async function buildTavernCharacterArchiveCharacterHash(characterKey = ''): Promise<string> {
    const key = String(characterKey || '').trim();
    if (!key) {throw new Error('character_key_required');}
    return await sha256Hex(textToBytes(key));
}

export function buildTavernCharacterArchiveManifestFilename(characterHash = ''): string {
    const hash = String(characterHash || '').trim();
    if (!hash) {throw new Error('character_hash_required');}
    return `LWB_TavernCharacterArchive_${hash}_manifest.json`;
}

function normalizeArchiveFilenameToken(value = ''): string {
    return String(value || '').trim().replace(/[^a-zA-Z0-9._-]+/g, '_');
}

export function buildTavernCharacterArchivePartFilename(characterHash = '', archiveId = '', index = 1): string {
    const hash = String(characterHash || '').trim();
    const id = normalizeArchiveFilenameToken(archiveId);
    const partIndex = Math.max(1, Math.floor(Number(index) || 1));
    if (!hash) {throw new Error('character_hash_required');}
    if (!id) {throw new Error('archive_id_required');}
    return `LWB_TavernCharacterArchive_${hash}_${id}_part_${String(partIndex).padStart(4, '0')}.jsonl.gz`;
}

export async function uploadTavernCharacterArchiveFile(
    filename: string,
    bytes: Uint8Array,
    options: TavernCharacterArchiveTransferOptions = {},
): Promise<void> {
    const headers = await resolveHeaders(options);
    const body = JSON.stringify({
        name: filename,
        data: bytesToBase64(bytes),
    });
    await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/files/upload');
        setXhrHeaders(xhr, headers);
        xhr.upload.onprogress = (event) => {
            options.onProgress?.({
                loadedBytes: event.loaded,
                totalBytes: event.lengthComputable ? event.total : body.length,
                lengthComputable: event.lengthComputable,
            });
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
                return;
            }
            reject(createArchiveStorageError('archive_upload_failed', xhr.status, xhr.responseText));
        };
        xhr.onerror = () => reject(new Error('archive_upload_network_error'));
        xhr.onabort = () => reject(new Error('archive_upload_aborted'));
        xhr.send(body);
    });
}

export async function uploadTavernCharacterArchiveManifest(
    manifest: TavernCharacterArchiveManifest,
    characterHash: string,
    options: TavernCharacterArchiveTransferOptions = {},
): Promise<void> {
    await uploadTavernCharacterArchiveFile(
        buildTavernCharacterArchiveManifestFilename(characterHash),
        textToBytes(JSON.stringify(manifest, null, 2)),
        options,
    );
}

export async function downloadTavernCharacterArchiveFile(
    filename: string,
    options: TavernCharacterArchiveTransferOptions = {},
): Promise<Uint8Array> {
    const headers = await resolveHeaders(options);
    return await new Promise<Uint8Array>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', buildNoCacheUserFileUrl(filename));
        xhr.responseType = 'arraybuffer';
        setXhrHeaders(xhr, headers);
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.setRequestHeader('Pragma', 'no-cache');
        xhr.onprogress = (event) => {
            options.onProgress?.({
                loadedBytes: event.loaded,
                totalBytes: event.lengthComputable ? event.total : 0,
                lengthComputable: event.lengthComputable,
            });
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(new Uint8Array(xhr.response || new ArrayBuffer(0)));
                return;
            }
            reject(createArchiveStorageError('archive_download_failed', xhr.status, readArchiveXhrErrorText(xhr)));
        };
        xhr.onerror = () => reject(new Error('archive_download_network_error'));
        xhr.onabort = () => reject(new Error('archive_download_aborted'));
        xhr.send();
    });
}

export async function downloadTavernCharacterArchiveManifest(
    characterHash: string,
    options: TavernCharacterArchiveTransferOptions = {},
): Promise<TavernCharacterArchiveManifest> {
    let bytes: Uint8Array;
    try {
        bytes = await downloadTavernCharacterArchiveFile(
            buildTavernCharacterArchiveManifestFilename(characterHash),
            options,
        );
    } catch (error) {
        if (isArchiveNotFoundError(error)) {
            throw new Error('archive_manifest_missing');
        }
        throw error;
    }
    const text = bytesToText(bytes).trim();
    let manifest: TavernCharacterArchiveManifest;
    try {
        manifest = JSON.parse(text) as TavernCharacterArchiveManifest;
    } catch {
        if (isArchiveNotFoundText(text)) {
            throw new Error('archive_manifest_missing');
        }
        throw new Error('archive_manifest_invalid');
    }
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
        throw new Error('archive_manifest_invalid');
    }
    return manifest;
}
