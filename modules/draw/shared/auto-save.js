// 编辑区自动保存：改动后等一小会儿（防抖）再落盘，失焦 / 收起 / 切换 / 关页时立刻落盘；校验不过就不存并说明原因。
// 只管“什么时候存、不要重叠地存”，读表单、校验、真正的存盘都由调用方给：
//   read() → { error }（不合法，error 是原因）或 { key, value }（key 是内容指纹：与上次落盘的相同就不重复保存）。
//   save(value) → 可以返回 Promise；保存永远一个接一个：保存期间又有改动，等这一次结束后再按最新内容补存一次（多次改动合并）。
// 没有重绘、不碰表单节点，所以输入过程中焦点和光标都不受影响。纯逻辑，不依赖 DOM / 酒馆宿主。

export const AUTO_SAVE_DELAY_MS = 600;

export const AUTO_SAVE_COPY = Object.freeze({
    saved: '已保存',
    saving: '保存中…',
    unsaved: reason => `未保存：${reason || '保存失败'}`,
});

/**
 * @param {object} options
 * @param {function(): ({error: string}|{key: string, value: *})} options.read
 * @param {function(*): (void|boolean|{ok?: boolean, error?: string}|Promise<*>)} options.save 返回 false / { ok: false, error } / 抛错都算保存失败
 * @param {function(string, string): void} [options.onStatus] (state: 'saved'|'saving'|'invalid'|'error', 状态栏文字)
 * @param {number} [options.delay]
 * @param {Function} [options.setTimer] (callback, 毫秒) → 计时器句柄
 * @param {function(*): void} [options.clearTimer]
 */
export function createAutoSave({ read, save, onStatus = () => {}, delay = AUTO_SAVE_DELAY_MS, setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
    let savedKey = null; // 上次落盘（或打开时）的内容指纹；null = 还从没存过（新建的角色）
    let timer = null;
    let running = null;
    let again = false; // 保存进行中又来了新的请求
    let disposed = false;

    const status = (state, text) => { if (!disposed) onStatus(state, text); };
    const stopTimer = () => {
        if (timer !== null) clearTimer(timer);
        timer = null;
    };

    // 注意：没有保存在进行时，第一次 save 在这个函数里同步发出（关页时要靠这一点赶在页面销毁前发出去）。
    async function runOnce() {
        const snapshot = read();
        if (snapshot.error) {
            status('invalid', AUTO_SAVE_COPY.unsaved(snapshot.error));
            return { ok: false, error: snapshot.error };
        }
        if (snapshot.key === savedKey) {
            status('saved', AUTO_SAVE_COPY.saved);
            return { ok: true, saved: false };
        }
        status('saving', AUTO_SAVE_COPY.saving);
        let failure = '';
        try {
            const result = await save(snapshot.value);
            if (result === false) failure = '保存失败';
            else if (result && typeof result === 'object' && result.ok === false) failure = String(result.error || '保存失败');
        } catch (error) {
            failure = error instanceof Error ? error.message : String(error || '保存失败');
        }
        if (failure) {
            status('error', AUTO_SAVE_COPY.unsaved(failure));
            return { ok: false, error: failure };
        }
        savedKey = snapshot.key;
        return { ok: true, saved: true };
    }

    async function drain() {
        let result;
        do {
            again = false;
            result = await runOnce();
            if (!result.ok) break;
        } while (again);
        running = null;
        if (result.ok) status('saved', AUTO_SAVE_COPY.saved);
        return result;
    }

    function flush() {
        stopTimer();
        if (disposed) return Promise.resolve({ ok: true, saved: false });
        if (running) {
            again = true;
            return running;
        }
        running = drain();
        return running;
    }

    return {
        /** 表单可能变了：不合法立刻提示；合法且内容有变就开始 / 重新开始倒计时。 */
        touch() {
            if (disposed) return;
            stopTimer();
            const snapshot = read();
            if (running) again = true;
            if (snapshot.error) { status('invalid', AUTO_SAVE_COPY.unsaved(snapshot.error)); return; }
            if (snapshot.key === savedKey && !running) { status('saved', AUTO_SAVE_COPY.saved); return; }
            status('saving', AUTO_SAVE_COPY.saving);
            if (running) { again = true; return; }
            timer = setTimer(() => { timer = null; flush(); }, delay);
        },
        /** 立刻保存（失焦、收起、切换、关页）；返回 Promise<{ ok, error?, saved? }>。内容没变时不会重复保存。 */
        flush,
        /** 以当前表单为“已保存”的基线（打开已有角色的编辑区时）；不传表示新建的角色，还没存过。 */
        setBaseline(key = null) {
            savedKey = key;
        },
        /** 当前是否有尚未落盘的改动（倒计时中或保存中）。 */
        get pending() { return timer !== null || running !== null; },
        get dirty() {
            const snapshot = read();
            return !!snapshot.error || snapshot.key !== savedKey;
        },
        dispose() {
            stopTimer();
            disposed = true;
        },
    };
}
