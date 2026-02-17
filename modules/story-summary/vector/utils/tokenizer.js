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

/** @type {Promise<void>|null} 当前加载 Promise（防重入） */
let loadingPromise = null;

/** @type {typeof import('../../../../libs/jieba-wasm/jieba_rs_wasm.js')|null} */
let jiebaModule = null;

/** @type {Function|null} jieba cut 函数引用 */
let jiebaCut = null;

/** @type {Function|null} jieba add_word 函数引用 */
let jiebaAddWord = null;

/** @type {object|null} TinySegmenter 实例 */
let tinySegmenter = null;

// ═══════════════════════════════════════════════════════════════════════════
// 实体词典
// ═══════════════════════════════════════════════════════════════════════════

/** @type {string[]} 按长度降序排列的实体列表（用于最长匹配） */
let entityList = [];

/** @type {Set<string>} 已注入结巴的实体（避免重复 add_word） */
let injectedEntities = new Set();
let entityKeepSet = new Set();

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

function shouldKeepTokenByWhitelist(token) {
    const t = String(token || '').trim().toLowerCase();
    if (!t) return false;
    if (STATIC_KEEP_WORDS.has(t)) return true;
    if (entityKeepSet.has(t)) return true;
    return false;
}

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
// 实体保护（最长匹配占位符替换）
// ═══════════════════════════════════════════════════════════════════════════

// 使用纯 PUA 字符序列作为占位符，避免拉丁字母泄漏到分词结果
const PLACEHOLDER_PREFIX = '\uE000\uE010';
const PLACEHOLDER_SUFFIX = '\uE001';

/**
 * 在文本中执行实体最长匹配，替换为占位符
 *
 * @param {string} text - 原始文本
 * @returns {{masked: string, entities: Map<string, string>}} masked 文本 + 占位符→原文映射
 */
function maskEntities(text) {
    const entities = new Map();

    if (!entityList.length || !text) {
        return { masked: text, entities };
    }

    let masked = text;
    let idx = 0;

    // entityList 已按长度降序排列，保证最长匹配优先
    for (const entity of entityList) {
        // 大小写不敏感搜索
        const lowerMasked = masked.toLowerCase();
        const lowerEntity = entity.toLowerCase();
        let searchFrom = 0;

        while (true) {
            const pos = lowerMasked.indexOf(lowerEntity, searchFrom);
            if (pos === -1) break;

            // 已被占位符覆盖则跳过（检查前后是否存在 PUA 边界字符）
            const aroundStart = Math.max(0, pos - 4);
            const aroundEnd = Math.min(masked.length, pos + entity.length + 4);
            const around = masked.slice(aroundStart, aroundEnd);
            if (around.includes('\uE000') || around.includes('\uE001')) {
                searchFrom = pos + 1;
                continue;
            }

            const placeholder = `${PLACEHOLDER_PREFIX}${idx}${PLACEHOLDER_SUFFIX}`;
            const originalText = masked.slice(pos, pos + entity.length);
            entities.set(placeholder, originalText);

            masked = masked.slice(0, pos) + placeholder + masked.slice(pos + entity.length);
            idx++;

            // 更新搜索位置（跳过占位符）
            searchFrom = pos + placeholder.length;
        }
    }

    return { masked, entities };
}

/**
 * 将 token 数组中的占位符还原为原始实体
 *
 * @param {string[]} tokens
 * @param {Map<string, string>} entities - 占位符→原文映射
 * @returns {string[]}
 */
function unmaskTokens(tokens, entities) {
    if (!entities.size) return tokens;

    return tokens.flatMap(token => {
        // token 本身就是一个完整占位符
        if (entities.has(token)) {
            return [entities.get(token)];
        }

        // token 中包含 PUA 字符 → 检查是否包含完整占位符
        if (/[\uE000-\uE0FF]/.test(token)) {
            for (const [placeholder, original] of entities) {
                if (token.includes(placeholder)) {
                    return [original];
                }
            }
            // 纯 PUA 碎片，丢弃
            return [];
        }

        // 普通 token，原样保留
        return [token];
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 分词：亚洲文字（结巴 / 降级）
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 用结巴分词处理亚洲文字段
 * @param {string} text
 * @returns {string[]}
 */
function tokenizeAsianJieba(text) {
    if (!text || !jiebaCut) return [];

    try {
        const words = jiebaCut(text, true); // hmm=true
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
function tokenizeJapanese(text) {
    if (tinySegmenter) {
        try {
            const words = tinySegmenter.segment(text);
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
 * @returns {Promise<boolean>} 是否加载成功
 */
export async function preload() {
    // TinySegmenter 独立于结巴状态（内部有防重入）
    loadTinySegmenter();

    // 已就绪
    if (wasmState === WasmState.READY) return true;

    // 正在加载，等待结果
    if (wasmState === WasmState.LOADING && loadingPromise) {
        try {
            await loadingPromise;
            return wasmState === WasmState.READY;
        } catch {
            return false;
        }
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
            jiebaAddWord = jiebaModule.add_word;

            if (typeof jiebaCut !== 'function') {
                throw new Error('jieba cut 函数不存在');
            }

            wasmState = WasmState.READY;

            const elapsed = Math.round(performance.now() - T0);
            xbLog.info(MODULE_ID, `结巴 WASM 加载完成 (${elapsed}ms)`);

            // 如果有待注入的实体，补做
            if (entityList.length > 0 && jiebaAddWord) {
                reInjectAllEntities();
            }

            return true;
        } catch (e) {
            wasmState = WasmState.FAILED;
            xbLog.error(MODULE_ID, '结巴 WASM 加载失败', e);
            throw e;
        }
    })();

    try {
        await loadingPromise;
        return true;
    } catch {
        return false;
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

// ═══════════════════════════════════════════════════════════════════════════
// 公开接口：injectEntities
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 注入实体词典
 *
 * 更新内部实体列表（用于最长匹配保护）
 * 如果结巴已就绪，同时调用 add_word 注入
 *
 * @param {Set<string>} lexicon - 标准化后的实体集合
 * @param {Map<string, string>} [displayMap] - normalize→原词形映射
 */
export function injectEntities(lexicon, displayMap) {
    if (!lexicon?.size) {
        entityList = [];
        entityKeepSet = new Set();
        return;
    }

    // 构建实体列表：使用原词形（displayMap），按长度降序排列
    const entities = [];
    for (const normalized of lexicon) {
        const display = displayMap?.get(normalized) || normalized;
        if (display.length >= 2) {
            entities.push(display);
        }
    }

    // 按长度降序（最长匹配优先）
    entities.sort((a, b) => b.length - a.length);
    entityList = entities;
    entityKeepSet = new Set(entities.map(e => String(e || '').trim().toLowerCase()).filter(Boolean));

    // 如果结巴已就绪，注入自定义词
    if (wasmState === WasmState.READY && jiebaAddWord) {
        injectNewEntitiesToJieba(entities);
    }

    xbLog.info(MODULE_ID, `实体词典更新: ${entities.length} 个实体`);
}

/**
 * 将新实体注入结巴（增量，跳过已注入的）
 * @param {string[]} entities
 */
function injectNewEntitiesToJieba(entities) {
    let count = 0;
    for (const entity of entities) {
        if (!injectedEntities.has(entity)) {
            try {
                // freq 设高保证不被切碎
                jiebaAddWord(entity, 99999);
                injectedEntities.add(entity);
                count++;
            } catch (e) {
                xbLog.warn(MODULE_ID, `add_word 失败: ${entity}`, e);
            }
        }
    }
    if (count > 0) {
        xbLog.info(MODULE_ID, `注入 ${count} 个新实体到结巴`);
    }
}

/**
 * 重新注入所有实体（WASM 刚加载完时调用）
 */
function reInjectAllEntities() {
    injectedEntities.clear();
    injectNewEntitiesToJieba(entityList);
}

// ═══════════════════════════════════════════════════════════════════════════
// 公开接口：tokenize
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 统一分词接口
 *
 * 流程：
 * 1. 实体最长匹配 → 占位符保护
 * 2. 按 Unicode 脚本分段（亚洲 vs 拉丁）
 * 3. 亚洲段 → 结巴 cut()（或降级）
 * 4. 拉丁段 → 空格/标点分割
 * 5. 还原占位符
 * 6. 过滤停用词 + 去重
 *
 * @param {string} text - 输入文本
 * @returns {string[]} token 数组
 */
export function tokenize(text) {
    const restored = tokenizeCore(text);

    // 5. 过滤停用词 + 去重 + 清理
    const seen = new Set();
    const result = [];

    for (const token of restored) {
        const cleaned = token.trim().toLowerCase();

        if (!cleaned) continue;
        if (cleaned.length < 2) continue;
        if (EFFECTIVE_STOP_WORDS.has(cleaned) && !shouldKeepTokenByWhitelist(cleaned)) continue;
        if (seen.has(cleaned)) continue;

        // 过滤纯标点/特殊字符
        if (/^[\s\x00-\x1F\p{P}\p{S}]+$/u.test(cleaned)) continue;

        seen.add(cleaned);
        result.push(token.trim()); // 保留原始大小写
    }

    return result;
}

/**
 * 内核分词流程（不去重、不 lower、仅完成：实体保护→分段→分词→还原）
 * @param {string} text
 * @returns {string[]}
 */
function tokenizeCore(text) {
    if (!text) return [];

    const input = String(text).trim();
    if (!input) return [];

    // 1. 实体保护
    const { masked, entities } = maskEntities(input);

    // 2. 分段
    const segments = segmentByScript(masked);

    // 3. 分段分词
    const rawTokens = [];
    for (const seg of segments) {
        if (seg.type === 'asian') {
            const lang = detectAsianLanguage(seg.text);
            if (lang === 'ja') {
                rawTokens.push(...tokenizeJapanese(seg.text));
            } else if (wasmState === WasmState.READY && jiebaCut) {
                rawTokens.push(...tokenizeAsianJieba(seg.text));
            } else {
                rawTokens.push(...tokenizeAsianFallback(seg.text));
            }
        } else if (seg.type === 'latin') {
            rawTokens.push(...tokenizeLatin(seg.text));
        }
    }

    // 4. 还原占位符
    return unmaskTokens(rawTokens, entities);
}

// ═══════════════════════════════════════════════════════════════════════════
// 公开接口：tokenizeForIndex
// ═══════════════════════════════════════════════════════════════════════════

/**
 * MiniSearch 索引专用分词
 *
 * 与 tokenize() 的区别：
 * - 全部转小写（MiniSearch 内部需要一致性）
 * - 不去重（MiniSearch 自己处理词频）
 *
 * @param {string} text
 * @returns {string[]}
 */
export function tokenizeForIndex(text) {
    const restored = tokenizeCore(text);

    return restored
        .map(t => t.trim().toLowerCase())
        .filter(t => {
            if (!t || t.length < 2) return false;
            if (EFFECTIVE_STOP_WORDS.has(t) && !shouldKeepTokenByWhitelist(t)) return false;
            if (/^[\s\x00-\x1F\p{P}\p{S}]+$/u.test(t)) return false;
            return true;
        });
}

// ═══════════════════════════════════════════════════════════════════════════
// 公开接口：reset
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 重置分词器状态
 * 用于测试或模块卸载
 */
export function reset() {
    entityList = [];
    entityKeepSet = new Set();
    injectedEntities.clear();
    // 不重置 WASM 状态（避免重复加载）
}
