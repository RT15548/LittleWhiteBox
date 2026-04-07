// danbooru-local-db.js — Danbooru 本地角色数据库（离线搜索 + 自动修正）

// ── 模块状态 ────────────────────────────────────────────────────
let localDanbooruDB = null;     // null | Array<[tagName, appearanceTags[]]>
let localDanbooruIndex = null;  // null | Map<token, Set<index>>
let _loadDBPromise = null;
let _loadDBGeneration = 0;      // 用于取消过期的 in-flight 加载

// ── 加载 ────────────────────────────────────────────────────────

/**
 * 加载本地 Danbooru 角色数据库（promise-lock + generation guard）
 * @param {string} datUrl - danbooru-chars.dat 的 URL
 * @returns {Promise<Array|null>} 加载成功返回 DB 数组，被取消返回 null
 */
export async function loadLocalDanbooruDB(datUrl) {
    if (localDanbooruDB) return localDanbooruDB;
    if (_loadDBPromise) return _loadDBPromise;
    const p = _doLoad(datUrl);
    _loadDBPromise = p;
    try { return await p; }
    finally { if (_loadDBPromise === p) _loadDBPromise = null; }
}

async function _doLoad(datUrl) {
    const gen = ++_loadDBGeneration;

    const { decompressSync, strFromU8 } = await import('../../libs/fflate.mjs');
    if (gen !== _loadDBGeneration) return null;

    const res = await fetch(datUrl);
    if (!res.ok) throw new Error(`Failed to load danbooru DB: ${res.status}`);
    if (gen !== _loadDBGeneration) return null;

    const compressed = new Uint8Array(await res.arrayBuffer());
    if (gen !== _loadDBGeneration) return null;

    let db;
    try {
        const decompressed = decompressSync(compressed);
        const json = strFromU8(decompressed);
        db = JSON.parse(json);
    } catch (e) {
        throw new Error(`Failed to parse Danbooru DB: ${e.message}`);
    }

    if (!Array.isArray(db) || !db.length || !Array.isArray(db[0])) {
        throw new Error('Danbooru DB format invalid: expected array of [name, tags[]] tuples');
    }

    // 构建倒排索引: token → Set<arrayIndex>
    const index = new Map();
    for (let i = 0; i < db.length; i++) {
        const name = db[i][0];
        for (const token of name.split('_')) {
            if (token.length < 2) continue;
            const t = token.toLowerCase();
            if (!index.has(t)) index.set(t, new Set());
            index.get(t).add(i);
        }
    }

    if (gen !== _loadDBGeneration) return null;

    localDanbooruDB = db;
    localDanbooruIndex = index;
    console.log(`[NovelDraw] Local Danbooru DB loaded: ${db.length} entries, index: ${index.size} tokens`);
    return db;
}

// ── 卸载 ────────────────────────────────────────────────────────

export function unloadLocalDanbooruDB() {
    _loadDBGeneration++;
    localDanbooruDB = null;
    localDanbooruIndex = null;
    _loadDBPromise = null;
    console.log('[NovelDraw] Local Danbooru DB unloaded');
}

// ── 搜索 ────────────────────────────────────────────────────────

/**
 * 本地搜索 Danbooru 角色数据库
 * @param {string} query - 搜索词（下划线、空格均可）
 * @param {number} limit - 最大返回数
 * @returns {Array<{name: string, tags: string[]}>}
 */
export function searchLocalDanbooru(query, limit = 10) {
    if (!localDanbooruDB || !localDanbooruIndex) return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const qUnder = q.replace(/\s+/g, '_');
    const scored = new Map();

    for (let i = 0; i < localDanbooruDB.length; i++) {
        const name = localDanbooruDB[i][0].toLowerCase();
        let score = 0;

        if (name === qUnder) score = 1000000;
        else if (name.startsWith(qUnder)) score = 100000;
        else if (name.includes(qUnder)) score = 10000;

        if (score > 0) {
            score -= i * 0.001;
            scored.set(i, score);
        }
    }

    // 子串无结果时，尝试 token 交叉匹配（跳过过短查询避免全索引遍历）
    if (scored.size === 0) {
        const tokens = qUnder.split('_').filter(t => t.length >= 2);
        if (tokens.length === 0) return [];
        for (const token of tokens) {
            const exact = localDanbooruIndex.get(token);
            if (exact) for (const idx of exact) scored.set(idx, (scored.get(idx) || 0) + 1000);
            // 短 token（<3字符）跳过子串扫描，避免 O(n*m) 遍历
            if (token.length < 3) continue;
            let partialCount = 0;
            for (const [key, indices] of localDanbooruIndex) {
                if (key !== token && key.includes(token)) {
                    for (const idx of indices) scored.set(idx, (scored.get(idx) || 0) + 100);
                    if (++partialCount >= 50) break; // 限制子串匹配数量
                }
            }
        }
        for (const [idx, s] of scored) scored.set(idx, s - idx * 0.001);
    }

    return Array.from(scored.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([idx]) => ({
            name: localDanbooruDB[idx][0],
            tags: localDanbooruDB[idx][1] || [],
        }));
}

// ── 状态查询 ────────────────────────────────────────────────────

/** @returns {boolean} DB 是否已加载 */
export function isDanbooruDBLoaded() {
    return localDanbooruDB !== null;
}
