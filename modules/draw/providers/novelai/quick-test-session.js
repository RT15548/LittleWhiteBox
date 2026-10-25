export const QUICK_TEST_SLOT_ID = 'novelai-quick-test';
export const QUICK_TEST_PAGE_SIZE = 24;
export const QUICK_TEST_COPY = Object.freeze({
    generating: '生成中…',
    generated: '生成完成',
    saved: '图片已保存',
    saving: '正在保存图片…',
    saveFailed: '缓存保存失败，图片已保留',
    unsaved: '图片已生成，但缓存保存失败。请下载或重试保存，刷新页面会丢失未保存图片。',
    retry: '重试保存',
    download: '下载图片',
    previous: '上一页',
    next: '下一页',
    historyFailed: '历史图片读取失败，可重试加载；本次生成的图片仍可下载。',
    reload: '重新加载历史',
    image: number => `图片 ${number}`,
});

export class QuickTestSaveError extends Error {
    constructor(cause) {
        super(QUICK_TEST_COPY.saveFailed, { cause });
        this.name = 'QuickTestSaveError';
    }
}

// Provider-session only: retain paid output before any storage await. Closing
// the settings iframe does not own or discard these records. Successful writes
// remove them; browser unload is the only remaining loss boundary.
export function createQuickTestSession({ store, notify, stateChanged }) {
    const pending = new Map();
    const writes = new Map();
    let generation = null;
    const session = {
        get busy() { return Boolean(generation); },
        get records() { return [...pending.values()].reverse(); },
        get hasUnsaved() { return pending.size > 0; },
        save(imgId) {
            if (writes.has(imgId)) return writes.get(imgId);
            const record = pending.get(imgId);
            if (!record) return Promise.resolve();
            record.persistence = 'saving';
            notify({ ...record });
            const operation = Promise.resolve().then(() => store(record)).then(() => {
                pending.delete(imgId);
                notify({ ...record, persistence: 'saved' });
            }, error => {
                record.persistence = 'unsaved';
                notify({ ...record });
                throw new QuickTestSaveError(error);
            }).finally(() => writes.delete(imgId));
            writes.set(imgId, operation);
            return operation;
        },
        generate(produce) {
            if (generation) return generation;
            generation = Promise.resolve().then(produce).then(async record => {
                pending.set(record.imgId, { ...record, persistence: 'saving' });
                await session.save(record.imgId);
                return record.imgId;
            }).finally(() => {
                generation = null;
                stateChanged(false);
            });
            stateChanged(true);
            return generation;
        },
    };
    return session;
}
