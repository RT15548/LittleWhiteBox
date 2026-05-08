// ═══════════════════════════════════════════════════════════════════════════
// 服务器文件存储工具
// ═══════════════════════════════════════════════════════════════════════════

import { getRequestHeaders } from '../../../../../script.js';
import { debounce } from '../../../../utils.js';

const toBase64 = (text) => btoa(unescape(encodeURIComponent(text)));
const STORAGE_UPLOAD_TIMEOUT_MS = 5000;

class StorageFile {
    constructor(filename, opts = {}) {
        this.filename = filename;
        this.cache = null;
        this._loading = null;
        this._dirtyVersion = 0;
        this._savedVersion = 0;
        this._saving = false;
        this._pendingSave = false;
        this._retryCount = 0;
        this._retryTimer = null;
        this._maxRetries = Number.isFinite(opts.maxRetries) ? opts.maxRetries : 5;
        const debounceMs = Number.isFinite(opts.debounceMs) ? opts.debounceMs : 2000;
        this._saveDebounced = debounce(() => this.saveNow({ silent: true }), debounceMs);
    }

    async load() {
        if (this.cache !== null) return this.cache;
        if (this._loading) return this._loading;

        this._loading = (async () => {
            try {
                const res = await fetch(`/user/files/${this.filename}`, {
                    headers: getRequestHeaders(),
                    cache: 'no-cache',
                });
                if (!res.ok) {
                    this.cache = {};
                    return this.cache;
                }
                const text = await res.text();
                this.cache = text ? (JSON.parse(text) || {}) : {};
            } catch {
                this.cache = {};
            } finally {
                this._loading = null;
            }
            return this.cache;
        })();

        return this._loading;
    }

    async get(key, defaultValue = null) {
        const data = await this.load();
        return data[key] ?? defaultValue;
    }

    async set(key, value) {
        const data = await this.load();
        data[key] = value;
        this._dirtyVersion++;
        this._saveDebounced();
    }

    async delete(key) {
        const data = await this.load();
        if (key in data) {
            delete data[key];
            this._dirtyVersion++;
            this._saveDebounced();
        }
    }

    async setAndSave(key, value, { silent = true } = {}) {
        const data = await this.load();
        const hadKey = Object.prototype.hasOwnProperty.call(data, key);
        const previousValue = data[key];
        const previousDirtyVersion = this._dirtyVersion;
        const previousSavedVersion = this._savedVersion;
        const previousPendingSave = this._pendingSave;

        data[key] = value;
        this._dirtyVersion++;

        try {
            return await this.saveNow({ silent });
        } catch (err) {
            if (hadKey) data[key] = previousValue;
            else delete data[key];

            this._dirtyVersion = previousDirtyVersion;
            this._savedVersion = previousSavedVersion;
            this._pendingSave = previousPendingSave;
            this._retryCount = 0;

            if (this._retryTimer) {
                clearTimeout(this._retryTimer);
                this._retryTimer = null;
            }

            if (!silent) {
                throw err;
            }
            return false;
        }
    }

    /**
     * 立即保存
     * @param {Object} options
     * @param {boolean} options.silent - 静默模式：失败时不抛异常，返回 false
     * @returns {Promise<boolean>} 是否保存成功
     */
    async saveNow({ silent = true } = {}) {
        // 🔧 核心修复：非静默模式等待当前保存完成
        if (this._saving) {
            this._pendingSave = true;

            if (!silent) {
                const completed = await this._waitForSaveComplete(STORAGE_UPLOAD_TIMEOUT_MS);
                if (!completed) {
                    throw new Error(`保存超时（>${STORAGE_UPLOAD_TIMEOUT_MS / 1000}秒）`);
                }
                if (this._dirtyVersion > this._savedVersion) {
                    return this.saveNow({ silent });
                }
                return this._dirtyVersion === this._savedVersion;
            }

            return true;
        }

        if (!this.cache || this._dirtyVersion === this._savedVersion) {
            return true;
        }

        this._saving = true;
        this._pendingSave = false;
        const versionToSave = this._dirtyVersion;

        try {
            const json = JSON.stringify(this.cache);
            const base64 = toBase64(json);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), STORAGE_UPLOAD_TIMEOUT_MS);
            let res;
            try {
                res = await fetch('/api/files/upload', {
                    method: 'POST',
                    headers: getRequestHeaders(),
                    body: JSON.stringify({ name: this.filename, data: base64 }),
                    signal: controller.signal,
                });
            } finally {
                clearTimeout(timeoutId);
            }
            if (!res.ok) {
                throw new Error(`服务器返回 ${res.status}`);
            }

            this._savedVersion = Math.max(this._savedVersion, versionToSave);
            this._retryCount = 0;
            if (this._retryTimer) {
                clearTimeout(this._retryTimer);
                this._retryTimer = null;
            }
            return true;

        } catch (err) {
            const saveError = err?.name === 'AbortError'
                ? new Error(`保存超时（>${STORAGE_UPLOAD_TIMEOUT_MS / 1000}秒）`)
                : err;
            console.error('[ServerStorage] 保存失败:', saveError);
            this._retryCount++;

            const delay = Math.min(30000, 2000 * (2 ** Math.max(0, this._retryCount - 1)));
            if (!this._retryTimer && this._retryCount <= this._maxRetries) {
                this._retryTimer = setTimeout(() => {
                    this._retryTimer = null;
                    this.saveNow({ silent: true });
                }, delay);
            }

            if (!silent) {
                throw saveError;
            }
            return false;

        } finally {
            this._saving = false;

            if (this._pendingSave || this._dirtyVersion > this._savedVersion) {
                this._saveDebounced();
            }
        }
    }

    /** 等待保存完成 */
    _waitForSaveComplete(timeoutMs = STORAGE_UPLOAD_TIMEOUT_MS) {
        return new Promise(resolve => {
            const startedAt = Date.now();
            const check = () => {
                if (!this._saving) resolve(true);
                else if (Date.now() - startedAt >= timeoutMs) resolve(false);
                else setTimeout(check, 50);
            };
            check();
        });
    }

    clearCache() {
        this.cache = null;
        this._loading = null;
    }

    getCacheSize() {
        if (!this.cache) return 0;
        return Object.keys(this.cache).length;
    }

    getCacheBytes() {
        if (!this.cache) return 0;
        try {
            return JSON.stringify(this.cache).length * 2;
        } catch {
            return 0;
        }
    }
}

export const TasksStorage = new StorageFile('LittleWhiteBox_Tasks.json');
export const StoryOutlineStorage = new StorageFile('LittleWhiteBox_StoryOutline.json');
export const NovelDrawStorage = new StorageFile('LittleWhiteBox_NovelDraw.json', { debounceMs: 800 });
export const SdDrawStorage = new StorageFile('LittleWhiteBox_SdDraw.json', { debounceMs: 800 });
export const ComfyDrawStorage = new StorageFile('LittleWhiteBox_ComfyDraw.json', { debounceMs: 800 });
export const AssistantStorage = new StorageFile('LittleWhiteBox_Assistant.json', { debounceMs: 800 });
export const TtsStorage = new StorageFile('LittleWhiteBox_TTS.json', { debounceMs: 800 });
export const EnaPlannerStorage = new StorageFile('LittleWhiteBox_EnaPlanner.json', { debounceMs: 800 });
export const CommonSettingStorage = new StorageFile('LittleWhiteBox_CommonSettings.json', { debounceMs: 1000 });
export const VectorStorage = new StorageFile('LittleWhiteBox_Vectors.json', { debounceMs: 3000 });
