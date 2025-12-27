// ═══════════════════════════════════════════════════════════════════════════
// 服务器文件存储工具
// ═══════════════════════════════════════════════════════════════════════════

import { getRequestHeaders } from '../../../../../script.js';
import { debounce } from '../../../../utils.js';

const toBase64 = (text) => btoa(unescape(encodeURIComponent(text)));

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
        this._saveDebounced = debounce(() => this.saveNow(), debounceMs);
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

    async saveNow() {
        if (this._saving) {
            this._pendingSave = true;
            return;
        }
        if (!this.cache || this._dirtyVersion === this._savedVersion) return;

        this._saving = true;
        this._pendingSave = false;
        const versionToSave = this._dirtyVersion;

        try {
            const json = JSON.stringify(this.cache);
            const base64 = toBase64(json);
            const res = await fetch('/api/files/upload', {
                method: 'POST',
                headers: getRequestHeaders(),
                body: JSON.stringify({ name: this.filename, data: base64 }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            this._savedVersion = Math.max(this._savedVersion, versionToSave);
            this._retryCount = 0;
            if (this._retryTimer) {
                clearTimeout(this._retryTimer);
                this._retryTimer = null;
            }
        } catch (err) {
            console.error('[ServerStorage] 保存失败:', err);
            this._retryCount++;
            const delay = Math.min(30000, 2000 * (2 ** Math.max(0, this._retryCount - 1)));
            if (!this._retryTimer && this._retryCount <= this._maxRetries) {
                this._retryTimer = setTimeout(() => {
                    this._retryTimer = null;
                    this.saveNow();
                }, delay);
            }
        } finally {
            this._saving = false;
            if (this._pendingSave || this._dirtyVersion > this._savedVersion) {
                this._saveDebounced();
            }
        }
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