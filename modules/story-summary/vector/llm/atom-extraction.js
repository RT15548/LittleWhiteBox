// ============================================================================
// atom-extraction.js - L0 场景锚点提取（v2 - 场景摘要 + 图结构）
//
// 设计依据：
// - BGE-M3 (BAAI, 2024): 自然语言段落检索精度最高 → semantic = 纯自然语言
// - TransE (Bordes, 2013): s/t/r 三元组方向性 → edges 格式
//
// 场景写作与数量规则由 ANCHOR_GENERATION_RULES 提供。
// ============================================================================

import { callLLM } from './llm-service.js';
import {
    createL0FailureError,
    getL0RetryDelayMs,
    getL0ResponseSchemaFailure,
    isRetryableL0Failure,
    L0_MAX_ATTEMPTS,
    L0_MIN_SCENE_LENGTH,
} from './l0-retry-policy.js';
import { parseJsonResponse } from './json-response.js';
import { xbLog } from '../../../../core/debug-core.js';
import { filterText } from '../utils/text-filter.js';
import { ANCHOR_GENERATION_RULES } from '../../data/generation-rules.js';

const MODULE_ID = 'atom-extraction';

const DEFAULT_TIMEOUT = 60000;
const DEBUG_RAW_PREVIEW_LEN = 800;

// ============================================================================
// L0 提取 Prompt
// ============================================================================

const SYSTEM_PROMPT = `你是场景摘要器。从一轮对话中提取1-2个场景锚点，用于语义检索和关系追踪。

输入格式：
<round>
  <user name="用户名">...</user>
  <assistant>...</assistant>
</round>

${ANCHOR_GENERATION_RULES}`;

const OUTPUT_FORMAT = `## Output format
Return only one valid JSON object in this form:
{"anchors":[
  {
    "scene": "A self-contained scene narrative, understandable without edges or where; follow the scene writing rules",
    "edges": [{"s":"施事方","t":"受事方","r":"互动行为"}],
    "where": "地点"
  }
]}`;

// ============================================================================
// 睡眠工具
// ============================================================================

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function waitBeforeL0Retry(attempt, failure) {
    const delayMs = getL0RetryDelayMs(attempt);
    if (delayMs == null || !isRetryableL0Failure(failure)) return false;
    await sleep(delayMs);
    return true;
}

function previewText(text, maxLen = DEBUG_RAW_PREVIEW_LEN) {
    const raw = String(text ?? '').replace(/\s+/g, ' ').trim();
    if (!raw) return '(empty)';
    return raw.length > maxLen ? `${raw.slice(0, maxLen)} ...(truncated)` : raw;
}

function sanitizeActionPhrase(raw) {
    const text = String(raw || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim();
    // Persist the relation's meaning, including repetition, aspect and objects.
    // Word deletion and character clipping are not text hygiene; they can change
    // an event or erase its recipient before any retrieval policy sees it.
    const content = text.replace(/[\s，。！？、；：,.!?;:"'“”‘’()（）[\]{}<>《》]/g, '');
    return content.length < 2 ? '' : text;
}

import { calcAtomQuality } from './atom-quality.js';

// ============================================================================
// 清洗与构建
// ============================================================================

/**
 * 清洗 edges 三元组
 * @param {object[]} raw
 * @returns {object[]}
 */
function sanitizeEdges(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
        .filter(e => e && typeof e === 'object')
        .map(e => ({
            s: String(e.s || '').trim(),
            t: String(e.t || '').trim(),
            r: sanitizeActionPhrase(e.r),
        }))
        .filter(e => e.s && e.t && e.r)
        .slice(0, 3);
}

/**
 * 将解析后的 anchor 转换为 atom 存储对象
 *
 * semantic = scene（纯自然语言，直接用于 embedding）
 *
 * @param {object} anchor - LLM 输出的 anchor 对象
 * @param {number} aiFloor - AI 消息楼层号
 * @param {number} idx - 同楼层序号（0 或 1）
 * @returns {object|null} atom 对象
 */
function anchorToAtom(anchor, aiFloor, idx) {
    if (!anchor || typeof anchor !== 'object' || Array.isArray(anchor)) return null;
    const scene = String(anchor.scene || '').trim();
    if (!scene) return null;

    // scene 过短（< 15 字）可能是噪音
    if (scene.length < L0_MIN_SCENE_LENGTH) return null;
    const edges = sanitizeEdges(anchor.edges);
    const where = String(anchor.where || '').trim();
    const quality = calcAtomQuality(scene, edges, where);

    return {
        atomId: `atom-${aiFloor}-${idx}`,
        floor: aiFloor,
        source: 'ai',

        // ═══ 检索层（embedding 的唯一入口） ═══
        semantic: scene,

        // ═══ 图结构层（扩散的 key） ═══
        edges,
        where,
        quality,
    };
}

// ============================================================================
// 单轮提取（带重试）
// ============================================================================

export async function extractAtomsForRound(userMessage, aiMessage, aiFloor, options = {}) {
    const { timeout = DEFAULT_TIMEOUT, signal = null, shouldCancel = null } = options;
    const isCancelled = () => (
        signal?.aborted
        || shouldCancel?.() === true
    );

    if (!aiMessage?.mes?.trim()) return [];

    const parts = [];
    const userName = userMessage?.name || '用户';

    if (userMessage?.mes?.trim()) {
        const userText = filterText(userMessage.mes);
        parts.push(`<user name="${userName}">\n${userText}\n</user>`);
    }

    const aiText = filterText(aiMessage.mes);
    parts.push(`<assistant>\n${aiText}\n</assistant>`);

    const input = `<round>\n${parts.join('\n')}\n</round>\n\n${OUTPUT_FORMAT}`;

    for (let attempt = 0; attempt < L0_MAX_ATTEMPTS; attempt++) {
        if (isCancelled()) return [];

        try {
            const response = await callLLM([
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: input },
            ], {
                temperature: 0.3,
                max_tokens: 1200,
                timeout,
                signal,
            });
            if (isCancelled()) return [];

            const rawText = String(response || '');
            xbLog.info(MODULE_ID, `floor ${aiFloor} attempt ${attempt} rawText(len=${rawText.length}): ${previewText(rawText)}`);
            if (!rawText.trim()) {
                if (await waitBeforeL0Retry(attempt, { kind: 'empty' })) {
                    if (isCancelled()) return [];
                    continue;
                }
                throw createL0FailureError('L0 API 返回空响应', { kind: 'empty' });
            }

            xbLog.info(MODULE_ID, `floor ${aiFloor} attempt ${attempt} parseSource(len=${rawText.length}): ${previewText(rawText)}`);

            const parsedResponse = parseJsonResponse(rawText);
            if (!parsedResponse) {
                xbLog.warn(MODULE_ID, `floor ${aiFloor} JSON解析失败 (attempt ${attempt})`);
                if (await waitBeforeL0Retry(attempt, { kind: 'invalid_json' })) {
                    if (isCancelled()) return [];
                    continue;
                }
                throw createL0FailureError('L0 API 响应无法解析为 JSON', { kind: 'invalid_json' });
            }
            const parsed = parsedResponse.value;
            if (parsedResponse.repair) {
                xbLog.info(MODULE_ID, `floor ${aiFloor} attempt ${attempt} JSON syntax repaired=${parsedResponse.repair}`);
            }

            const schemaFailure = getL0ResponseSchemaFailure(parsed);
            if (schemaFailure) {
                xbLog.warn(MODULE_ID, `floor ${aiFloor} attempt ${attempt} 缺少有效 anchors，parsed=${previewText(JSON.stringify(parsed))}`);
                if (await waitBeforeL0Retry(attempt, schemaFailure)) {
                    if (isCancelled()) return [];
                    continue;
                }
                throw createL0FailureError('L0 API 响应缺少 anchors 数组', schemaFailure);
            }
            const rawAnchors = parsed.anchors;

            // 转换为 atom 存储格式（最多 2 个）
            const atoms = rawAnchors
                .slice(0, 2)
                .map((a, idx) => anchorToAtom(a, aiFloor, idx))
                .filter(Boolean);

            xbLog.info(MODULE_ID, `floor ${aiFloor} attempt ${attempt} anchors=${rawAnchors.length} atoms=${atoms.length}`);

            if (rawAnchors.length === 0) {
                return [];
            }

            return atoms;

        } catch (e) {
            if (isCancelled() || e?.name === 'AbortError') return null;

            if (await waitBeforeL0Retry(attempt, e?.l0Failure)) {
                if (isCancelled()) return null;
                continue;
            }
            xbLog.error(MODULE_ID, `floor ${aiFloor} 失败`, e);
            throw e;
        }
    }

    throw createL0FailureError('L0 extraction exhausted retries', { kind: 'unknown' });
}
