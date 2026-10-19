// The exact set selected by one user cancellation must survive a lost response
// or reload. No credentials, prompts, leases or second job state machine.
// Each entry dies only after backend ACK and its projection into delivery journals.
const DB_NAME = 'xb_draw_cancellations';
const STORE = 'intents';
let opening;

function open() {
    opening ??= new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        request.onerror = () => { opening = null; reject(request.error); };
        request.onsuccess = () => {
            const db = request.result;
            db.onversionchange = () => { db.close(); opening = null; };
            db.onclose = () => { opening = null; };
            resolve(db);
        };
    });
    return opening;
}

async function transaction(mode, work) {
    const db = await open();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = work(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(request.result);
        tx.onabort = tx.onerror = () => reject(tx.error);
    });
}

export const drawCancellationJournal = Object.freeze({
    async record(targets) {
        if (typeof targets.owner !== 'string' || !targets.owner) throw new TypeError('CANCELLATION_OWNER_REQUIRED');
        const entry = { owner: targets.owner, jobIds: [...new Set(targets.jobIds)], runIds: [...new Set(targets.runIds)],
            ...(targets.runIds.length ? { chatTarget: structuredClone(targets.chatTarget) } : {}) };
        const id = await transaction('readwrite', store => store.add(entry));
        return { ...entry, id };
    },
    list: () => transaction('readonly', store => store.getAll()),
    forget: id => transaction('readwrite', store => store.delete(id)),
    // Retire only reconciled runs from an acknowledged group. Other chats keep
    // their intent until their marker or child delivery has been recovered.
    forgetRuns: (owner, runIds, entryIds) => transaction('readwrite', store => {
        const settled = new Set(runIds);
        const acknowledged = new Set(entryIds);
        const request = store.getAll();
        request.onsuccess = () => {
            for (const entry of request.result) {
                if (entry.owner !== owner || !acknowledged.has(entry.id)
                    || !entry.runIds.some(id => settled.has(id))) continue;
                const remaining = entry.runIds.filter(id => !settled.has(id));
                if (remaining.length) store.put({ ...entry, runIds: remaining });
                else store.delete(entry.id);
            }
        };
        return request;
    }),
});
