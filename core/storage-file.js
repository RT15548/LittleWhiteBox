// ═══════════════════════════════════════════════════════════════════════════
// 服务器文件存储工具
// ═══════════════════════════════════════════════════════════════════════════

const toBase64 = (text) => btoa(unescape(encodeURIComponent(text)));
const STORAGE_UPLOAD_TIMEOUT_MS = 5000;
const defaultDebounce = (func, timeout) => {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), timeout);
    };
};

const isPlainRecord = value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};

const canonicalizeRecord = value => {
    if (!isPlainRecord(value)) throw new TypeError('存储文件内容必须是对象');

    let json;
    try {
        json = JSON.stringify(value);
    } catch (error) {
        throw new TypeError(`存储文件内容无法序列化：${error?.message || error}`);
    }

    const parsed = JSON.parse(json);
    if (!isPlainRecord(parsed)) throw new TypeError('存储文件内容必须是对象');
    return {
        data: Object.assign(Object.create(null), parsed),
        json,
    };
};

const cloneJsonValue = value => JSON.parse(JSON.stringify(value));

export class StorageFile {
    constructor(filename, opts = {}) {
        this.filename = filename;
        this._cache = null;
        this._loading = null;
        this._dirtyVersion = 0;
        this._savedVersion = 0;
        this._saving = false;
        this._retryCount = 0;
        this._retryTimer = null;
        this._writeQueue = Promise.resolve();
        this._maxRetries = Number.isFinite(opts.maxRetries) ? opts.maxRetries : 5;
        this._fetch = typeof opts.fetch === 'function' ? opts.fetch : (...args) => globalThis.fetch(...args);
        this._getRequestHeaders = typeof opts.getRequestHeaders === 'function' ? opts.getRequestHeaders : () => ({});
        const debounce = typeof opts.debounce === 'function' ? opts.debounce : defaultDebounce;
        const debounceMs = Number.isFinite(opts.debounceMs) ? opts.debounceMs : 2000;
        this._saveDebounced = debounce(() => this.saveNow({ silent: true }), debounceMs);
    }

    async _loadInternal() {
        if (this._cache !== null) return this._cache;

        if (!this._loading) {
            const loading = (async () => {
                const res = await this._fetch(`/user/files/${this.filename}`, {
                    headers: this._getRequestHeaders(),
                    cache: 'no-cache',
                });
                if (res.status === 404) {
                    this._cache = Object.create(null);
                    return this._cache;
                }
                if (!res.ok) {
                    throw new Error(`存储文件读取失败（HTTP ${res.status}）`);
                }
                const text = await res.text();
                const parsed = text ? JSON.parse(text) : {};
                if (!isPlainRecord(parsed)) throw new Error('存储文件格式无效');
                this._cache = canonicalizeRecord(parsed).data;
                return this._cache;
            })();
            this._loading = loading;
            loading.finally(() => {
                if (this._loading === loading) this._loading = null;
            }).catch(() => {});
        }

        return await this._loading;
    }

    async load({ strict = false } = {}) {
        try {
            return cloneJsonValue(await this._loadInternal());
        } catch (error) {
            if (strict) throw error;
            return {};
        }
    }

    async get(key, defaultValue = null) {
        try {
            return await this._getValue(key, defaultValue);
        } catch {
            return defaultValue;
        }
    }

    async getStrict(key, defaultValue = null) {
        return await this._getValue(key, defaultValue);
    }

    async _getValue(key, defaultValue) {
        const data = await this._loadInternal();
        if (!Object.prototype.hasOwnProperty.call(data, key) || data[key] == null) return defaultValue;
        return cloneJsonValue(data[key]);
    }

    async set(key, value) {
        const valueSnapshot = structuredClone(value);
        return this._enqueueWrite(async () => {
            const current = await this._loadInternal();
            const draft = canonicalizeRecord(current).data;
            Object.defineProperty(draft, key, {
                value: valueSnapshot,
                enumerable: true,
                configurable: true,
                writable: true,
            });
            this._cache = canonicalizeRecord(draft).data;
            this._dirtyVersion++;
            this._saveDebounced();
        });
    }

    async delete(key) {
        return this._enqueueWrite(async () => {
            const current = await this._loadInternal();
            if (!Object.prototype.hasOwnProperty.call(current, key)) return;
            const draft = canonicalizeRecord(current).data;
            delete draft[key];
            this._cache = draft;
            this._dirtyVersion++;
            this._saveDebounced();
        });
    }

    async setAndSave(key, value, { silent = true } = {}) {
        const valueSnapshot = structuredClone(value);
        return this.updateAndSave(draft => {
            Object.defineProperty(draft, key, {
                value: valueSnapshot,
                enumerable: true,
                configurable: true,
                writable: true,
            });
        }, { silent });
    }

    async replaceAndSave(value, { silent = true } = {}) {
        const candidate = canonicalizeRecord(value);
        return this._enqueueWrite(() => this._replaceAndSave(candidate, silent));
    }

    async updateAndSave(updater, { silent = true } = {}) {
        if (typeof updater !== 'function') {
            throw new TypeError('存储更新器必须是函数');
        }

        return this._enqueueWrite(async () => {
            const current = await this._loadInternal();
            const draft = canonicalizeRecord(current).data;
            const result = await updater(draft);
            const nextData = result === undefined ? draft : result;
            return this._replaceAndSave(canonicalizeRecord(nextData), silent);
        });
    }

    async _replaceAndSave(candidate, silent) {
        await this._loadInternal();
        const nextVersion = Math.max(this._dirtyVersion, this._savedVersion) + 1;
        this._saving = true;
        try {
            await this._uploadJson(candidate.json);
            this._cache = candidate.data;
            this._dirtyVersion = nextVersion;
            this._savedVersion = nextVersion;
            this._resetRetryState();
            return true;
        } catch (err) {
            const saveError = this._normalizeSaveError(err);
            console.error('[ServerStorage] 保存失败:', saveError);
            if (!silent) throw saveError;
            return false;
        } finally {
            this._saving = false;
        }
    }

    _enqueueWrite(operation) {
        const result = this._writeQueue.then(operation, operation);
        this._writeQueue = result.catch(() => {});
        return result;
    }

    async waitForQueuedWrites() {
        while (true) {
            const pending = this._writeQueue;
            await pending;
            if (pending !== this._writeQueue) continue;
            if (this._dirtyVersion > this._savedVersion) {
                await this.saveNow({ silent: false });
                continue;
            }
            if (pending === this._writeQueue && !this._saving) return;
        }
    }

    /**
     * 立即保存
     * @param {Object} options
     * @param {boolean} options.silent - 静默模式：失败时不抛异常，返回 false
     * @returns {Promise<boolean>} 是否保存成功
     */
    async saveNow({ silent = true } = {}) {
        return this._enqueueWrite(() => this._saveNow(silent));
    }

    async _saveNow(silent) {
        if (!this._cache || this._dirtyVersion === this._savedVersion) return true;

        const candidate = canonicalizeRecord(this._cache);
        const versionToSave = this._dirtyVersion;
        this._saving = true;
        try {
            await this._uploadJson(candidate.json);
            this._cache = candidate.data;
            this._savedVersion = Math.max(this._savedVersion, versionToSave);
            this._resetRetryState();
            return true;
        } catch (err) {
            const saveError = this._normalizeSaveError(err);
            console.error('[ServerStorage] 保存失败:', saveError);
            this._retryCount++;
            this._scheduleRetry();
            if (!silent) throw saveError;
            return false;
        } finally {
            this._saving = false;
        }
    }

    _scheduleRetry() {
        if (this._retryTimer || this._retryCount > this._maxRetries) return;
        const delay = Math.min(30000, 2000 * (2 ** Math.max(0, this._retryCount - 1)));
        this._retryTimer = setTimeout(() => {
            this._retryTimer = null;
            this.saveNow({ silent: true });
        }, delay);
    }

    _resetRetryState() {
        this._retryCount = 0;
        if (this._retryTimer) {
            clearTimeout(this._retryTimer);
            this._retryTimer = null;
        }
    }

    _normalizeSaveError(error) {
        return error?.name === 'AbortError'
            ? new Error(`保存超时（>${STORAGE_UPLOAD_TIMEOUT_MS / 1000}秒）`)
            : error;
    }

    async _uploadJson(json) {
        const base64 = toBase64(json);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), STORAGE_UPLOAD_TIMEOUT_MS);
        let res;
        try {
            res = await this._fetch('/api/files/upload', {
                method: 'POST',
                headers: this._getRequestHeaders(),
                body: JSON.stringify({ name: this.filename, data: base64 }),
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeoutId);
        }
        if (!res.ok) throw new Error(`服务器返回 ${res.status}`);
    }

    clearCache() {
        if (this._loading || this._saving || this._dirtyVersion !== this._savedVersion) return false;
        this._cache = null;
        return true;
    }

    getCacheSize() {
        if (!this._cache) return 0;
        return Object.keys(this._cache).length;
    }

    getCacheBytes() {
        if (!this._cache) return 0;
        try {
            return JSON.stringify(this._cache).length * 2;
        } catch {
            return 0;
        }
    }
}
