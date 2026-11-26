import { sha256 } from '../../libs/js-sha256.mjs';
import { COPY } from './copy.js';
import { equalJson } from './comparison.js';

export const ASSET_FIELD = 'littlewhitebox-card-assets';
const NAMESPACE = 'LittleWhiteBoxCardAssets';
const READY = 'littlewhitebox-card-assets-ready';
const mimeExtensions = Object.freeze({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' });
const assetKeyPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/;
export const isAssetKey = key => typeof key === 'string' && assetKeyPattern.test(key);

function summary({ key, digest, mime, size } = {}) {
    if (!isAssetKey(key) || typeof digest !== 'string' || !/^[0-9a-f]{64}$/.test(digest)
        || typeof mime !== 'string' || !Object.hasOwn(mimeExtensions, mime) || !Number.isSafeInteger(size) || size < 1) throw new Error(COPY.assetInvalid);
    return { key, digest, mime, size };
}

export const taskHasAssets = task => Object.hasOwn(task?.x ?? {}, ASSET_FIELD);

export function projectAssetTask(task) {
    if (!taskHasAssets(task)) return task;
    const raw = task.x[ASSET_FIELD];
    const counts = new Map();
    if (Array.isArray(raw)) for (const item of raw) counts.set(item?.key, (counts.get(item?.key) || 0) + 1);
    const project = item => {
        try {
            const asset = summary(item ?? {});
            if (counts.get(asset.key) !== 1) throw new Error(COPY.assetInvalid);
            savedBytes(item, asset);
            return asset;
        } catch {
            return { ...(isAssetKey(item?.key) ? { key: item.key } : {}), damagedAsset: sha256(JSON.stringify(item)) };
        }
    };
    return { ...task, x: { ...task.x, [ASSET_FIELD]: Array.isArray(raw) ? raw.map(project) : { damagedList: sha256(JSON.stringify(raw)) } } };
}

// Only the saved card owns damaged bytes. Workspace documents carry a fingerprint
// so unrelated edits can round-trip them without exposing or rebuilding their payload.
export function inspectDraftAssets(task) {
    const entries = task.x[ASSET_FIELD], assets = [], errors = [];
    if (!Array.isArray(entries)) return { assets, errors: [{ error: COPY.assetInvalid }] };
    const keys = new Set(), duplicates = new Set();
    for (const item of entries) {
        if (keys.has(item?.key)) duplicates.add(item?.key);
        keys.add(item?.key);
    }
    entries.forEach((item, index) => {
        try {
            const asset = summary(item ?? {});
            if (duplicates.has(asset.key) || Object.keys(item).length !== Object.keys(asset).length) throw new Error(COPY.assetInvalid);
            assets.push(asset);
        } catch {
            const key = isAssetKey(item?.key) ? item.key : null;
            errors.push({ index, ...(key ? { key } : {}), error: COPY.damagedAsset(index + 1, key) });
        }
    });
    return { assets, errors };
}

export function assetRuntime(taskId) {
    return { taskId, reference: `window.${NAMESPACE}?.[${JSON.stringify(taskId)}]`, readyEvent: READY };
}

// Portable card code: captures its own saved payload synchronously, and needs
// neither the author's workspace nor the assistant to render the card.
export function assetCommands(taskId) {
    return `<<taskjs>>
const taskId = ${JSON.stringify(taskId)};
const st = SillyTavern.getContext();
const matches = st.characters[st.characterId]?.data?.extensions?.['xiaobaix-tasks']?.tasks?.filter(task => task.id === taskId);
if (matches?.length !== 1) throw new Error('Card image task must have a unique identity: ' + taskId);
const assets = new Map();
function reportDamage(location) {
    console.warn(${JSON.stringify(COPY.assetInvalid)}, { taskId, ...location });
}
for (const [index, asset] of matches[0].x[${JSON.stringify(ASSET_FIELD)}].entries()) {
    const key = asset?.key;
    if (typeof key !== 'string' || !${assetKeyPattern}.test(key)) {
        reportDamage({ position: index + 1 });
    } else if (typeof asset.base64 !== 'string') {
        reportDamage({ key });
    } else {
        assets.set(key, asset);
    }
}
const urls = new Map();
const namespaces = window.${NAMESPACE} ??= Object.create(null);
function get(key) {
    const asset = assets.get(key);
    return asset && { key: asset.key, digest: asset.digest, mime: asset.mime, size: asset.size };
}
function url(key) {
    const asset = assets.get(key);
    if (!asset) return undefined;
    if (!urls.has(key)) {
        let binary;
        try { binary = atob(asset.base64); }
        catch {
            assets.delete(key);
            reportDamage({ key });
            return undefined;
        }
        const bytes = Uint8Array.from(binary, byte => byte.charCodeAt(0));
        urls.set(key, URL.createObjectURL(new Blob([bytes], { type: asset.mime })));
    }
    return urls.get(key);
}
const api = Object.freeze({ get, url });
namespaces[taskId] = api;
onCleanup(() => {
    for (const url of urls.values()) URL.revokeObjectURL(url);
    urls.clear();
    assets.clear();
    if (namespaces[taskId] === api) delete namespaces[taskId];
    if (window.${NAMESPACE} === namespaces && !Object.keys(namespaces).length) delete window.${NAMESPACE};
});
window.dispatchEvent(new CustomEvent(${JSON.stringify(READY)}, { detail: { taskId } }));
<</taskjs>>`;
}

export function isAssetLoader(task) {
    return taskHasAssets(task) && typeof task.commands === 'string' && task.commands.replace(/\r\n/g, '\n') === assetCommands(task.id);
}

export function assetWorkspacePath(root, { digest, mime }) {
    return `${root}assets/${digest}.${mimeExtensions[mime]}`;
}

export async function summarizeAssetBlob(key, blob) {
    return summary({ key, digest: sha256(await blob.arrayBuffer()), mime: blob.type, size: blob.size });
}

export function equalAssetSummary(left, right) {
    return left.key === right.key && left.digest === right.digest && left.mime === right.mime && left.size === right.size;
}

export function findSavedAsset(task, asset) {
    const entries = task?.x?.[ASSET_FIELD];
    return Array.isArray(entries) ? entries.find(entry => entry && equalAssetSummary(entry, asset) && typeof entry.base64 === 'string') : undefined;
}

function savedBytes(entry, asset) {
    let bytes;
    try {
        if (typeof entry.base64 !== 'string') throw new Error(COPY.assetInvalid);
        bytes = Uint8Array.from(atob(entry.base64), byte => byte.charCodeAt(0));
    }
    catch { throw new Error(COPY.assetInvalid); }
    if (bytes.byteLength !== asset.size || sha256(bytes) !== asset.digest) throw new Error(COPY.assetInvalid);
    return bytes;
}

export async function blobForSavedAsset(entry) {
    return new Blob([savedBytes(entry, summary(entry))], { type: entry.mime });
}

async function encodeBlob(asset, blob) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (blob.type !== asset.mime || bytes.byteLength !== asset.size || sha256(bytes) !== asset.digest) throw new Error(COPY.assetInvalid);
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    return { ...asset, base64: btoa(binary) };
}

export async function compileAssetTask(target, previous, next, readImage, signal) {
    if (!taskHasAssets(next) && !taskHasAssets(previous)) return next;
    const original = previous?.x?.[ASSET_FIELD], raw = next.x?.[ASSET_FIELD];
    const withAssets = entries => ({ ...next, x: { ...previous?.x, ...next.x, [ASSET_FIELD]: entries } });
    const baseline = previous && projectAssetTask(previous).x?.[ASSET_FIELD];
    if (taskHasAssets(previous) && (!taskHasAssets(next) || raw === original || equalJson(raw, baseline))
        && next.commands === previous.commands) return withAssets(original);
    if (next.commands.replace(/\r\n/g, '\n') !== assetCommands(target.id)) throw new Error(COPY.assetTaskRequired);
    // Omitting reserved settings preserves saved keys. An empty list, staged
    // by removing the last key, removes the bytes but retains the loader.
    if (!Array.isArray(raw)) throw new Error(COPY.assetInvalid);
    const preserved = new Set();
    const { errors } = inspectDraftAssets(next);
    const invalid = new Set(errors.map(error => error.index));
    const entries = [];
    for (const [index, asset] of raw.entries()) {
        signal?.throwIfAborted();
        if (invalid.has(index)) {
            const match = asset?.damagedAsset && Array.isArray(baseline) ? baseline.findIndex((ref, i) =>
                !preserved.has(i) && ref.damagedAsset === asset.damagedAsset && ref.key === asset.key
                && Object.keys(ref).length === Object.keys(asset).length) : -1;
            if (match < 0) throw new Error(COPY.assetInvalid);
            preserved.add(match);
            entries.push(original[match]);
            continue;
        }
        const savedIndex = Array.isArray(baseline) ? baseline.findIndex(ref => !ref.damagedAsset && equalAssetSummary(ref, asset)) : -1;
        const saved = savedIndex < 0 ? undefined : original[savedIndex];
        if (saved) entries.push(saved);
        else {
            const path = assetWorkspacePath(target.root, asset);
            let image;
            try { image = await readImage(path); }
            catch (cause) {
                if (!['local_file_not_found', 'workspace_image_blob_not_found'].includes(cause.message)) throw cause;
                throw Object.assign(new Error(COPY.assetDraftImageMissing(asset.key, path), { cause }), {
                    code: 'CARD_ASSET_IMAGE_UNAVAILABLE', key: asset.key, path, recovery: 'reselect',
                });
            }
            entries.push(await encodeBlob(asset, image.blob));
        }
    }
    return withAssets(entries);
}
