import { DRAW_COPY, DRAW_IMAGE, SAVE_DRAW_IMAGES } from './contract.js';

export function drawingResultText(result) {
    return [result.images?.length ? DRAW_COPY.savedAt(result.images) : '', result.message].filter(Boolean).join('\n');
}

// UI operation state is page-local; the host remains the owner of pending image bytes.
export function createDrawingRecovery({ save, notify, onChange = () => {}, describeError }) {
    const states = new Map();
    async function recover(receiptId) {
        if (states.has(receiptId)) return;
        states.set(receiptId, 'saving');
        onChange();
        try {
            const result = await save({ receiptId });
            if (result.images?.length) states.set(receiptId, 'saved');
            else if (result.error === 'draw_receipt_missing') states.set(receiptId, 'expired');
            else states.delete(receiptId);
            notify(drawingResultText(result));
            return result;
        } catch (error) {
            states.delete(receiptId);
            notify(describeError(error));
        } finally { onChange(); }
    }
    function actions(name, result) {
        if (![DRAW_IMAGE, SAVE_DRAW_IMAGES].includes(name) || !result) return [];
        const batches = result.receiptId ? [{ receiptId: result.receiptId }] : result.pending || [];
        return batches.map(batch => {
            const state = states.get(batch.receiptId);
            return { id: batch.receiptId, label: state === 'saving' ? DRAW_COPY.savingAction : state === 'saved' ? DRAW_COPY.savedAction
                : state === 'expired' ? DRAW_COPY.expiredAction
                : batch.receivedCount ? DRAW_COPY.saveBatch(batch.receivedCount, batch.prompt) : DRAW_COPY.save,
            disabled: !!state, run: () => recover(batch.receiptId) };
        });
    }
    return { actions };
}

// Refreshing a view cannot erase a saved result or its recovery receipt.
export async function finishDrawingResult(result, { refresh, isDetached, onRefreshError, notifyLate }) {
    try { await refresh(); }
    catch (error) { onRefreshError(error); }
    if (isDetached()) notifyLate(result);
    return result;
}

// A late result needs a host notice even when the assistant iframe has closed.
export function showLateDrawingResult(result, { save, toast, describeError }) {
    if (!result.receiptId && !result.images?.length) return;
    if (!result.receiptId) {
        toast.info(drawingResultText(result), '', { escapeHtml: true });
        return;
    }
    const node = document.createElement('div');
    node.style.overflowWrap = 'anywhere';
    const text = document.createElement('p');
    text.style.whiteSpace = 'pre-wrap';
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'menu_button';
    text.textContent = drawingResultText(result);
    node.append(text, button);
    const render = () => {
        const action = recovery.actions(DRAW_IMAGE, result)[0];
        button.textContent = action.label; button.disabled = action.disabled;
        button.onclick = event => { event.stopPropagation(); void action.run(); };
    };
    const recovery = createDrawingRecovery({ save, describeError, notify: message => { text.textContent = message; }, onChange: render });
    render();
    // DOM nodes, never interpolated HTML, keep paths and error text inert.
    toast.warning(node, '', { escapeHtml: false, timeOut: 0, extendedTimeOut: 0, tapToDismiss: false, closeButton: true });
}
