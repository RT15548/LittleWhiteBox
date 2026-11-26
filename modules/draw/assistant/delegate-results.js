import { DRAW_IMAGE, SAVE_DRAW_IMAGES } from './contract.js';

// Per delegation: only materialized workspace references and unresolved outcomes cross back.
export function createDelegateDrawingResults() {
    const files = new Map(), failures = new Map();
    return {
        observe(name, args, result) {
            if (name !== DRAW_IMAGE && (name !== SAVE_DRAW_IMAGES || !args.receiptId)) return;
            for (const file of result.images || []) files.set(file.blobId, file);
            const receipt = result.receiptId || args.receiptId;
            const previous = failures.get(receipt);
            if (receipt) failures.delete(receipt);
            if (result.ok === false) {
                const failure = { ...result };
                delete failure.images;
                // A bad destination can fail before save() returns a new receipt.
                // A partial generation that *was* saved has no outstanding batch.
                if (receipt && !result.images?.length && result.error !== 'draw_receipt_missing') {
                    Object.assign(failure, { ...previous, ...failure, receiptId: receipt });
                }
                failures.set(receipt || Symbol(), failure);
            }
        },
        finish(result) {
            return { ...result, ...(files.size ? { images: [...files.values()] } : {}),
                ...(failures.size ? { drawingFailures: [...failures.values()] } : {}) };
        },
    };
}
