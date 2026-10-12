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
        const entry = { owner: targets.owner, jobIds: [...new Set(targets.jobIds)], runIds: [...new Set(targets.runIds)] };
        const id = await transaction('readwrite', store => store.add(entry));
        return { ...entry, id };
    },
    list: () => transaction('readonly', store => store.getAll()),
    forget: id => transaction('readwrite', store => store.delete(id)),
});
