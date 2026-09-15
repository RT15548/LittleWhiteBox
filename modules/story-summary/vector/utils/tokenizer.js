// ═══════════════════════════════════════════════════════════════════════════
// tokenizer.js - 统一分词器
//
// 职责：
// 1. 管理结巴 WASM 生命周期（预加载 / 就绪检测 / 降级）
// 2. 实体词典注入（分词前最长匹配保护）
// 3. 亚洲文字（CJK + 假名）走结巴，拉丁文字走空格分割
// 4. 提供 tokenize(text): string[] 统一接口
//
// 加载时机：
// - 插件初始化时 storySummary.enabled && vectorConfig.enabled → preload()
// - 向量开关从 off→on 时 → preload()
// - CHAT_CHANGED 时 → injectEntities() + warmup 索引（不负责加载 WASM）
//
// 降级策略：
// - WASM 未就绪时 → 实体保护 + 标点分割（不用 bigram）
// ═══════════════════════════════════════════════════════════════════════════

import { extensionFolderPath } from '../../../../core/constants.js';
import { xbLog } from '../../../../core/debug-core.js';
import { BASE_STOP_WORDS } from './stopwords-base.js';
import { DOMAIN_STOP_WORDS, KEEP_WORDS } from './stopwords-patch.js';
import { createEntityMatcher, normalizeEntityTerm } from '../retrieval/entity-matcher.js';

const MODULE_ID = 'tokenizer';

// ═══════════════════════════════════════════════════════════════════════════
// WASM 状态机
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @enum {string}
 */
const WasmState = {
    IDLE: 'IDLE',
    LOADING: 'LOADING',
    READY: 'READY',
    FAILED: 'FAILED',
};

let wasmState = WasmState.IDLE;

/** @type {Promise<true>|null} 当前加载 Promise（防重入） */
let loadingPromise = null;

/** @type {typeof import('../../../../libs/jieba-wasm/jieba_rs_wasm.js')|null} */
let jiebaModule = null;

/** @type {Function|null} jieba cut 函数引用 */
let jiebaCut = null;


/** @type {object|null} TinySegmenter 实例 */
let tinySegmenter = null;

// ═══════════════════════════════════════════════════════════════════════════
// 实体词典
// ═══════════════════════════════════════════════════════════════════════════

let entityMatcher = createEntityMatcher();
let tokenizerSnapshot = null;

// ═══════════════════════════════════════════════════════════════════════════
// 停用词
// ═══════════════════════════════════════════════════════════════════════════

const STATIC_KEEP_WORDS = new Set((KEEP_WORDS || [])
    .map(w => String(w || '').trim().toLowerCase())
    .filter(Boolean));

// Standard source only: stopwords-iso snapshot + small domain patch.
const EFFECTIVE_STOP_WORDS = new Set(
    [...BASE_STOP_WORDS, ...DOMAIN_STOP_WORDS]
        .map(w => String(w || '').trim().toLowerCase())
        .filter(Boolean),
);



// ═══════════════════════════════════════════════════════════════════════════
// Unicode 分类
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 判断字符是否为假名（平假名 + 片假名）
 * @param {number} code - charCode
 * @returns {boolean}
 */
function isKana(code) {
    return (
        (code >= 0x3040 && code <= 0x309F) ||   // Hiragana
        (code >= 0x30A0 && code <= 0x30FF) ||   // Katakana
        (code >= 0x31F0 && code <= 0x31FF) ||   // Katakana Extensions
        (code >= 0xFF65 && code <= 0xFF9F)       // Halfwidth Katakana
    );
}

/**
 * 判断字符是否为 CJK 汉字（不含假名）
 * @param {number} code - charCode
 * @returns {boolean}
 */
function isCJK(code) {
    return (
        (code >= 0x4E00 && code <= 0x9FFF) ||
        (code >= 0x3400 && code <= 0x4DBF) ||
        (code >= 0xF900 && code <= 0xFAFF) ||
        (code >= 0x20000 && code <= 0x2A6DF)
    );
}

/**
 * 判断字符是否为亚洲文字（CJK + 假名）
 * @param {number} code - charCode
 * @returns {boolean}
 */
function isAsian(code) {
    return (
        isCJK(code) || isKana(code)
    );
}

/**
 * 判断字符是否为拉丁字母或数字
 * @param {number} code - charCode
 * @returns {boolean}
 */
function isLatin(code) {
    return (
        (code >= 0x41 && code <= 0x5A) ||       // A-Z
        (code >= 0x61 && code <= 0x7A) ||       // a-z
        (code >= 0x30 && code <= 0x39) ||       // 0-9
        (code >= 0xC0 && code <= 0x024F)        // Latin Extended (àáâ 等)
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// 文本分段（亚洲 vs 拉丁 vs 其他）
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @typedef {'asian'|'latin'|'other'} SegmentType
 */

/**
 * @typedef {object} TextSegment
 * @property {SegmentType} type - 段类型
 * @property {string} text - 段文本
 */

/**
 * 将文本按 Unicode 脚本分段
 * 连续的同类字符归为一段
 *
 * @param {string} text
 * @returns {TextSegment[]}
 */
function segmentByScript(text) {
    if (!text) return [];

    const segments = [];
    let currentType = null;
    let currentStart = 0;

    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        let type;

        if (isAsian(code)) {
            type = 'asian';
        } else if (isLatin(code)) {
            type = 'latin';
        } else {
            type = 'other';
        }

        if (type !== currentType) {
            if (currentType !== null && currentStart < i) {
                const seg = text.slice(currentStart, i);
                if (currentType !== 'other' || seg.trim()) {
                    segments.push({ type: currentType, text: seg });
                }
            }
            currentType = type;
            currentStart = i;
        }
    }

    // 最后一段
    if (currentStart < text.length) {
        const seg = text.slice(currentStart);
        if (currentType !== 'other' || seg.trim()) {
            segments.push({ type: currentType, text: seg });
        }
    }

    return segments;
}

// ═══════════════════════════════════════════════════════════════════════════
// 亚洲文字语言检测（中文 vs 日语）
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 检测亚洲文字段的语言
 *
 * 假名占比 > 30% 判定为日语（日语文本中假名通常占 40-60%）
 *
 * @param {string} text - 亚洲文字段
 * @returns {'zh'|'ja'|'other'}
 */
function detectAsianLanguage(text) {
    let kanaCount = 0;
    let cjkCount = 0;
    for (const ch of text) {
        const code = ch.codePointAt(0);
        if (isKana(code)) kanaCount++;
        else if (isCJK(code)) cjkCount++;
    }
    const total = kanaCount + cjkCount;
    if (total === 0) return 'other';
    return (kanaCount / total) > 0.3 ? 'ja' : 'zh';
}

// ═══════════════════════════════════════════════════════════════════════════
// 分词：亚洲文字（结巴 / 降级）
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 用结巴分词处理亚洲文字段
 * @param {string} text
 * @returns {string[]}
 */
function tokenizeAsianJieba(text, cut = jiebaCut) {
    if (!text || !cut) return [];

    try {
        const words = cut(text, true); // hmm=true
        return Array.from(words)
            .map(w => String(w || '').trim())
            .filter(w => w.length >= 2);
    } catch (e) {
        xbLog.warn(MODULE_ID, '结巴分词异常，降级处理', e);
        return tokenizeAsianFallback(text);
    }
}

/**
 * 降级分词：标点/空格分割 + 保留 2-6 字 CJK 片段
 * 不使用 bigram，避免索引膨胀
 *
 * @param {string} text
 * @returns {string[]}
 */
function tokenizeAsianFallback(text) {
    if (!text) return [];

    const tokens = [];

    // 按标点和空格分割
    const parts = text.split(/[\s，。！？、；：""''（）【】《》…—\-,.!?;:'"()[\]{}<>/\\|@#$%^&*+=~`]+/);

    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        if (trimmed.length >= 2 && trimmed.length <= 6) {
            tokens.push(trimmed);
        } else if (trimmed.length > 6) {
            // 长片段按 4 字滑窗切分（比 bigram 稀疏得多）
            for (let i = 0; i <= trimmed.length - 4; i += 2) {
                tokens.push(trimmed.slice(i, i + 4));
            }
            // 保留完整片段的前 6 字
            tokens.push(trimmed.slice(0, 6));
        }
    }

    return tokens;
}

/**
 * 用 TinySegmenter 处理日语文字段
 * @param {string} text
 * @returns {string[]}
 */
function tokenizeJapanese(text, segmenter = tinySegmenter) {
    if (segmenter) {
        try {
            const words = segmenter.segment(text);
            return words
                .map(w => String(w || '').trim())
                .filter(w => w.length >= 2);
        } catch (e) {
            xbLog.warn(MODULE_ID, 'TinySegmenter 分词异常，降级处理', e);
            return tokenizeAsianFallback(text);
        }
    }
    return tokenizeAsianFallback(text);
}

// ═══════════════════════════════════════════════════════════════════════════
// 分词：拉丁文字
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 拉丁文字分词：空格/标点分割
 * @param {string} text
 * @returns {string[]}
 */
function tokenizeLatin(text) {
    if (!text) return [];

    return text
        .split(/[\s\-_.,;:!?'"()[\]{}<>/\\|@#$%^&*+=~`]+/)
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length >= 3);
}

// ═══════════════════════════════════════════════════════════════════════════
// 公开接口：preload
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 预加载结巴 WASM
 *
 * 可多次调用，内部防重入。
 * FAILED 状态下再次调用会重试。
 *
 * @returns {Promise<true>} 加载成功
 * @throws {Error} 原始加载异常；调用方负责记录并决定是否降级。
 */
export async function preload() {
    // TinySegmenter 独立于结巴状态（内部有防重入）
    loadTinySegmenter();

    // 已就绪
    if (wasmState === WasmState.READY) return true;

    // 正在加载，等待结果
    if (wasmState === WasmState.LOADING && loadingPromise) {
        return loadingPromise;
    }

    // IDLE 或 FAILED → 开始加载
    wasmState = WasmState.LOADING;

    const T0 = performance.now();

    loadingPromise = (async () => {
        try {
            // ★ 使用绝对路径（开头加 /）
            const wasmPath = `/${extensionFolderPath}/libs/jieba-wasm/jieba_rs_wasm_bg.wasm`;

            // eslint-disable-next-line no-unsanitized/method
            jiebaModule = await import(
                `/${extensionFolderPath}/libs/jieba-wasm/jieba_rs_wasm.js`
            );

            // 初始化 WASM（新版 API 用对象形式）
            if (typeof jiebaModule.default === 'function') {
                await jiebaModule.default({ module_or_path: wasmPath });
            }

            // 缓存函数引用
            jiebaCut = jiebaModule.cut;

            if (typeof jiebaCut !== 'function') {
                throw new Error('jieba cut 函数不存在');
            }

            wasmState = WasmState.READY;

            const elapsed = Math.round(performance.now() - T0);
            xbLog.info(MODULE_ID, `结巴 WASM 加载完成 (${elapsed}ms)`);


            return true;
        } catch (e) {
            wasmState = WasmState.FAILED;
            xbLog.error(MODULE_ID, '结巴 WASM 加载失败', e);
            throw e;
        }
    })();

    try {
        return await loadingPromise;
    } finally {
        loadingPromise = null;
    }
}

/**
 * 加载 TinySegmenter（懒加载，不阻塞）
 */
async function loadTinySegmenter() {
    if (tinySegmenter) return;

    try {
        // eslint-disable-next-line no-unsanitized/method
        const mod = await import(
            `/${extensionFolderPath}/libs/tiny-segmenter.js`
        );
        // Concurrent preload calls share one engine identity after import.
        if (tinySegmenter) return;
        const Ctor = mod.TinySegmenter || mod.default;
        tinySegmenter = new Ctor();
        xbLog.info(MODULE_ID, 'TinySegmenter 加载完成');
    } catch (e) {
        xbLog.warn(MODULE_ID, 'TinySegmenter 加载失败，日语将使用降级分词', e);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 公开接口：isReady
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 检查结巴是否已就绪
 * @returns {boolean}
 */
export function isReady() {
    return wasmState === WasmState.READY;
}

/**
 * 获取当前 WASM 状态
 * @returns {string}
 */
export function getState() {
    return wasmState;
}

// A snapshot owns both the entity vocabulary and the actual segmentation engines.
// No add_word mutation: a new name must not silently change unrelated documents
// (or leak a previous chat's dictionary into the next chat).
export function injectEntities(lexicon, displayMap, blockedTerms = []) {
    const terms = new Map();
    for (const raw of lexicon || []) {
        const term = normalizeEntityTerm(raw);
        if (term.length >= 2 && !terms.has(term)) terms.set(term, displayMap?.get(term) || String(raw));
    }
    const blocked = [...new Set(blockedTerms.map(normalizeEntityTerm).filter(Boolean))].sort();
    const sameTerms = terms.size === entityMatcher.terms.size
        && [...terms].every(([term, display]) => entityMatcher.terms.get(term) === display);
    if (sameTerms && blocked.length === entityMatcher.blockedTerms.length
        && blocked.every((term, i) => term === entityMatcher.blockedTerms[i])) return false;
    // Build/sort matching candidates only when the vocabulary actually changes.
    entityMatcher = createEntityMatcher(
        new Set([...(lexicon || [])].filter(term => normalizeEntityTerm(term).length >= 2)), displayMap, blocked,
    );
    tokenizerSnapshot = null;
    return true;
}

function tokenizePlain(text, cut, segmenter) {
    const result = [];
    for (const segment of segmentByScript(text)) {
        if (segment.type === 'asian') {
            if (detectAsianLanguage(segment.text) === 'ja') {
                result.push(...tokenizeJapanese(segment.text, segmenter));
            } else {
                result.push(...(cut
                    ? tokenizeAsianJieba(segment.text, cut)
                    : tokenizeAsianFallback(segment.text)));
            }
        } else if (segment.type === 'latin') {
            result.push(...tokenizeLatin(segment.text));
        }
    }
    return result;
}

export function getTokenizerSnapshot() {
    const cut = wasmState === WasmState.READY ? jiebaCut : null;
    const segmenter = tinySegmenter;
    if (tokenizerSnapshot?.cut === cut && tokenizerSnapshot?.segmenter === segmenter) {
        return tokenizerSnapshot;
    }
    const matcher = entityMatcher;
    const keep = new Set(matcher.terms.keys());
    const core = input => {
        const { text, spans } = matcher.match(input);
        const tokens = [];
        let cursor = 0;
        for (const span of spans) {
            tokens.push(...tokenizePlain(text.slice(cursor, span.start), cut, segmenter));
            if (span.blocked) {
                tokens.push(...tokenizePlain(text.slice(span.start, span.end), cut, segmenter));
            } else {
                tokens.push(span.surface);
            }
            cursor = span.end;
        }
        tokens.push(...tokenizePlain(text.slice(cursor), cut, segmenter));
        return tokens.filter(token => {
            const normalized = normalizeEntityTerm(token);
            return normalized.length >= 2
                && (!EFFECTIVE_STOP_WORDS.has(normalized) || STATIC_KEEP_WORDS.has(normalized) || keep.has(normalized))
                && !/^[\s\x00-\x1F\p{P}\p{S}]+$/u.test(normalized);
        });
    };
    tokenizerSnapshot = Object.freeze({
        cut, segmenter,
        entities: matcher.terms,
        blockedTerms: matcher.blockedTerms,
        extractEntities: text => matcher.extractEntities(text),
        tokenize: text => [...new Map(core(text).map(token => [normalizeEntityTerm(token), token])).values()],
        tokenizeForIndex: text => core(text).map(normalizeEntityTerm),
    });
    return tokenizerSnapshot;
}

export function tokenize(text) {
    return getTokenizerSnapshot().tokenize(text);
}

export function tokenizeForIndex(text) {
    return getTokenizerSnapshot().tokenizeForIndex(text);
}

// Test/unload vocabulary reset; loading WASM again is unnecessary.
export function reset() {
    entityMatcher = createEntityMatcher();
    tokenizerSnapshot = null;
}
