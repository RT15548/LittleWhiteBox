import { MediaApiError } from '../../../shared/media-api.js';
import { createIdentifier } from '../../../shared/common/identifier.js';
import { DRAW_COPY, DRAW_ERRORS } from './contract.js';

const extensions = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
function outputDirectory(value = 'local/images') {
    const path = String(value).replaceAll('\\', '/').replace(/\/$/, '');
    if (!path.startsWith('local/') || path.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('workspace_image_directory_invalid');
    return path;
}
function publicFailure(error) {
    const code = error?.code || 'drawing_failed';
    return { error: code, message: DRAW_ERRORS[code] || new MediaApiError(error?.code || 'provider_error').message, ...(error?.field ? { field: error.field } : {}), ...(Number.isInteger(error?.status) ? { status: error.status } : {}) };
}

/** Received images outlive request cancellation; failed saves retain a local-only retry handle. */
export function createAssistantDrawing({ getApi, writeImages, observePaths, identifier = createIdentifier }) {
    const received = new Map();
    function api() {
        const value = getApi();
        if (!value?.generate) throw Object.assign(new Error(DRAW_COPY.unavailable), { code: 'drawing_unavailable' });
        return value;
    }
    async function save(receiptId, directory) {
        const receipt = received.get(receiptId);
        if (!receipt) return { ok: false, error: 'draw_receipt_missing', message: DRAW_COPY.expired };
        if (receipt.saving) return { ok: false, error: 'draw_receipt_saving', message: DRAW_COPY.saving, receiptId };
        const outputDir = directory === undefined ? receipt.outputDir : outputDirectory(directory);
        receipt.saving = true;
        try {
            const files = receipt.images.map((blob, index) => {
                const extension = extensions[blob.type];
                if (!extension) throw new Error('workspace_image_type_unsupported');
                return { path: `${outputDir}/draw-${receiptId}-${index + 1}.${extension}`, blob };
            });
            const preconditions = await observePaths(files.map(file => file.path));
            // Once images have arrived, an aborted caller cannot discard them.
            const images = await writeImages(files, { preconditions });
            received.delete(receiptId);
            return { ok: !receipt.failure, images, ...(receipt.failure || {}) };
        } catch (error) {
            return { ok: false, error: 'workspace_image_save_failed', message: DRAW_COPY.saveFailed,
                cause: String(error?.message || error), receiptId, receivedCount: receipt.images.length, images: [], ...(receipt.failure ? { generation: receipt.failure } : {}) };
        } finally { receipt.saving = false; }
    }
    return {
        async presets(args = {}) {
            try { return { ok: true, ...await api().getPresets(args) }; }
            catch (error) { return { ok: false, ...publicFailure(error) }; }
        },
        async generate({ outputDir: directory, ...request }, { signal, onProgress } = {}) {
            const outputDir = outputDirectory(directory), receiptId = identifier();
            // Resolve the destination before any billable request, including file/ancestor collisions.
            await observePaths([`${outputDir}/draw-${receiptId}-1.png`]);
            signal?.throwIfAborted();
            let images, failure;
            try { ({ images } = await api().generate({ ...request, signal, onProgress })); }
            catch (error) { images = error?.partialResult?.images; failure = publicFailure(error); }
            if (!images?.length) return { ok: false, images: [], ...(failure || { error: 'invalid_result', message: DRAW_COPY.noImages }) };
            received.set(receiptId, { outputDir, images, failure, prompt: request.prompt, receivedAt: Date.now() });
            return save(receiptId);
        },
        save: ({ receiptId, outputDir } = {}) => receiptId ? save(receiptId, outputDir)
            : { ok: true, pending: [...received].map(([receiptId, receipt]) => ({ receiptId, outputDir: receipt.outputDir, prompt: receipt.prompt, receivedAt: receipt.receivedAt, receivedCount: receipt.images.length, saving: !!receipt.saving })) },
    };
}
