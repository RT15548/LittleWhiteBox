import { gunzipSync, strFromU8 } from '../../libs/fflate.mjs';
import { taskSaveDeadline, taskSaveRejected } from './task-save-operation.js';

async function readJsonBody(input, init) {
    const request = input instanceof Request ? input : null;
    const headers = new Headers(init?.headers ?? request?.headers);
    const body = init?.body ?? (request ? request.clone().arrayBuffer() : null);
    const value = await body;
    if (value == null) return null;
    if (typeof value === 'string') return JSON.parse(value);
    const bytes = ArrayBuffer.isView(value)
        ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
        : new Uint8Array(await new Response(value).arrayBuffer());
    return JSON.parse(strFromU8(headers.get('Content-Encoding')?.toLowerCase() === 'gzip' ? gunzipSync(bytes) : bytes));
}

// Short-lived, read-only observer. It returns the original fetch promise and
// never consumes or replaces the host's response. Only a matching payload can
// settle this receipt; unrelated autosaves (including permissions) cannot.
export async function observeHostSettingsSave(save, matches, signal) {
    const original = globalThis.fetch;
    let active = true;
    let resolveReceipt, rejectReceipt;
    const receipt = new Promise((resolve, reject) => {
        resolveReceipt = resolve; rejectReceipt = reject;
    });
    const observer = function (input, init) {
        const url = input instanceof Request ? input.url : String(input);
        const isSave = active && new URL(url, 'http://task.local').pathname === '/api/settings/save';
        // Clone a Request before fetch can consume it.
        const payload = isSave ? readJsonBody(input, init).catch(error => {
            console.warn({ source: import.meta.url, operation: 'decodeSettingsRequest' }, error);
            return null;
        }) : null;
        let result;
        try { result = original.call(this, input, init); }
        catch (error) {
            if (payload) payload.then(value => { if (active && matches(value)) rejectReceipt(error); })
                .catch(cause => console.warn({ source: import.meta.url, operation: 'observeRequest' }, cause));
            throw error;
        }
        if (payload) {
            // Own a rejection immediately even while decoding a compressed body.
            const outcome = Promise.resolve(result).then(response => ({ response }), error => ({ error }));
            payload.then(async value => {
                if (!active || !matches(value)) return;
                const { response, error } = await outcome;
                if (!active) return;
                if (error) throw error;
                if (!response.ok) throw taskSaveRejected('Settings HTTP ' + response.status);
                const body = await response.clone().json();
                if (body?.result !== 'ok') throw taskSaveRejected('Settings response did not acknowledge the save');
                if (active) resolveReceipt();
            }).catch(error => { if (active) rejectReceipt(error); });
        }
        return result;
    };
    globalThis.fetch = observer;
    try {
        await taskSaveDeadline(() => {
            Promise.resolve().then(save).catch(error => rejectReceipt(error));
            return receipt;
        }, signal);
    } finally {
        active = false;
        if (globalThis.fetch === observer) globalThis.fetch = original;
    }
}
