// ============================================================================
// atom-extraction.js - L0 场景锚点提取（v2 - 场景摘要 + 图结构）
//
// 设计依据：
// - BGE-M3 (BAAI, 2024): 自然语言段落检索精度最高 → semantic = 纯自然语言
// - TransE (Bordes, 2013): s/t/r 三元组方向性 → edges 格式
//
// 每楼层 1-2 个场景锚点（非碎片原子），60-100 字场景摘要
// ============================================================================

import { callLLM, parseJson } from './llm-service.js';
import { xbLog } from '../../../../core/debug-core.js';
import { filterText } from '../utils/text-filter.js';

const MODULE_ID = 'atom-extraction';

const CONCURRENCY = 10;
const RETRY_COUNT = 2;
const RETRY_DELAY = 500;
const DEFAULT_TIMEOUT = 20000;
const STAGGER_DELAY = 80;

let batchCancelled = false;

export function cancelBatchExtraction() {
    batchCancelled = true;
}

export function isBatchCancelled() {
    return batchCancelled;
}

// ============================================================================
// L0 提取 Prompt
// ============================================================================

const SYSTEM_PROMPT = `你是场景摘要器。从一轮对话中提取1-2个场景锚点，用于语义检索和关系追踪。

输入格式：
<round>
  <user name="用户名">...</user>
  <assistant>...</assistant>
</round>

只输出严格JSON：
{"anchors":[
  {
    "scene": "60-100字完整场景描述",
    "edges": [{"s":"施事方","t":"受事方","r":"互动行为"}],
    "where": "地点"
  }
]}

## scene 写法
- 纯自然语言，像旁白或日记，不要任何标签/标记/枚举值
- 必须包含：角色名、动作、情感氛围、关键细节
- 读者只看 scene 就能复原这一幕
- 60-100字，信息密集但流畅

## edges（关系三元组）
- s=施事方 t=受事方 r=互动行为（建议 6-12 字，最多 20 字）
- s/t 必须是参与互动的角色正式名称，不用代词或别称
- 只从正文内容中识别角色名，不要把标签名（如 user、assistant）当作角色
- r 使用动作模板短语：“动作+对象/结果”（例：“提出交易条件”、“拒绝对方请求”、“当众揭露秘密”、“安抚对方情绪”）
- r 不要写人名，不要复述整句，不要写心理描写或评价词
- r 正例（合格）：提出交易条件、拒绝对方请求、当众揭露秘密、安抚对方情绪、强行打断发言、转移谈话焦点
- r 反例（不合格）：我觉得她现在很害怕、他突然非常生气地大喊起来、user开始说话、assistant解释了很多细节
- 每个锚点 1-3 条

## where
- 场景地点，无明确地点时空字符串

## 数量规则
- 最多2个。1个够时不凑2个
- 明显场景切换（地点/时间/对象变化）时才2个
- 同一场景不拆分
- 无角色互动时返回 {"anchors":[]}

## 示例
输入：艾拉在火山口举起圣剑刺穿古龙心脏，龙血溅满她的铠甲，她跪倒在地痛哭
输出：
{"anchors":[{"scene":"火山口上艾拉举起圣剑刺穿古龙的心脏，龙血溅满铠甲，古龙轰然倒地，艾拉跪倒在滚烫的岩石上痛哭，完成了她不得不做的弑杀","edges":[{"s":"艾拉","t":"古龙","r":"以圣剑刺穿心脏"}],"where":"火山口"}]}`;

const JSON_PREFILL = '{"anchors":[';

// ============================================================================
// 睡眠工具
// ============================================================================

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const ACTION_STRIP_WORDS = [
    '突然', '非常', '有些', '有点', '轻轻', '悄悄', '缓缓', '立刻',
    '马上', '然后', '并且', '而且', '开始', '继续', '再次', '正在',
];

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function sanitizeActionPhrase(raw) {
    let text = String(raw || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim();
    if (!text) return '';

    text = text
        .replace(/[，。！？、；：,.!?;:"'“”‘’()（）[\]{}<>《》]/g, '')
        .replace(/\s+/g, '');

    for (const word of ACTION_STRIP_WORDS) {
        text = text.replaceAll(word, '');
    }

    text = text.replace(/(地|得|了|着|过)+$/g, '');

    if (text.length < 2) return '';
    if (text.length > 12) text = text.slice(0, 12);
    return text;
}

function calcAtomQuality(scene, edges, where) {
    const sceneLen = String(scene || '').length;
    const sceneScore = clamp(sceneLen / 80, 0, 1);
    const edgeScore = clamp((edges?.length || 0) / 3, 0, 1);
    const whereScore = where ? 1 : 0;
    const quality = 0.55 * sceneScore + 0.35 * edgeScore + 0.10 * whereScore;
    return Number(quality.toFixed(3));
}

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
    const scene = String(anchor.scene || '').trim();
    if (!scene) return null;

    // scene 过短（< 15 字）可能是噪音
    if (scene.length < 15) return null;
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

async function extractAtomsForRoundWithRetry(userMessage, aiMessage, aiFloor, options = {}) {
    const { timeout = DEFAULT_TIMEOUT } = options;

    if (!aiMessage?.mes?.trim()) return [];

    const parts = [];
    const userName = userMessage?.name || '用户';

    if (userMessage?.mes?.trim()) {
        const userText = filterText(userMessage.mes);
        parts.push(`<user name="${userName}">\n${userText}\n</user>`);
    }

    const aiText = filterText(aiMessage.mes);
    parts.push(`<assistant>\n${aiText}\n</assistant>`);

    const input = `<round>\n${parts.join('\n')}\n</round>`;

    for (let attempt = 0; attempt <= RETRY_COUNT; attempt++) {
        if (batchCancelled) return [];

        try {
            const response = await callLLM([
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: input },
                { role: 'assistant', content: JSON_PREFILL },
            ], {
                temperature: 0.3,
                max_tokens: 600,
                timeout,
            });

            const rawText = String(response || '');
            if (!rawText.trim()) {
                if (attempt < RETRY_COUNT) {
                    await sleep(RETRY_DELAY);
                    continue;
                }
                return null;
            }

            const fullJson = JSON_PREFILL + rawText;

            let parsed;
            try {
                parsed = parseJson(fullJson);
            } catch (e) {
                xbLog.warn(MODULE_ID, `floor ${aiFloor} JSON解析失败 (attempt ${attempt})`);
                if (attempt < RETRY_COUNT) {
                    await sleep(RETRY_DELAY);
                    continue;
                }
                return null;
            }

            // 兼容：优先 anchors，回退 atoms
            const rawAnchors = parsed?.anchors;
            if (!rawAnchors || !Array.isArray(rawAnchors)) {
                if (attempt < RETRY_COUNT) {
                    await sleep(RETRY_DELAY);
                    continue;
                }
                return null;
            }

            // 转换为 atom 存储格式（最多 2 个）
            const atoms = rawAnchors
                .slice(0, 2)
                .map((a, idx) => anchorToAtom(a, aiFloor, idx))
                .filter(Boolean);

            return atoms;

        } catch (e) {
            if (batchCancelled) return null;

            if (attempt < RETRY_COUNT) {
                await sleep(RETRY_DELAY * (attempt + 1));
                continue;
            }
            xbLog.error(MODULE_ID, `floor ${aiFloor} 失败`, e);
            return null;
        }
    }

    return null;
}

export async function extractAtomsForRound(userMessage, aiMessage, aiFloor, options = {}) {
    return extractAtomsForRoundWithRetry(userMessage, aiMessage, aiFloor, options);
}

// ============================================================================
// 批量提取
// ============================================================================

export async function batchExtractAtoms(chat, onProgress) {
    if (!chat?.length) return [];

    batchCancelled = false;

    const pairs = [];
    for (let i = 0; i < chat.length; i++) {
        if (!chat[i].is_user) {
            const userMsg = (i > 0 && chat[i - 1]?.is_user) ? chat[i - 1] : null;
            pairs.push({ userMsg, aiMsg: chat[i], aiFloor: i });
        }
    }

    if (!pairs.length) return [];

    const allAtoms = [];
    let completed = 0;
    let failed = 0;

    for (let i = 0; i < pairs.length; i += CONCURRENCY) {
        if (batchCancelled) break;

        const batch = pairs.slice(i, i + CONCURRENCY);

        if (i === 0) {
            const promises = batch.map((pair, idx) => (async () => {
                await sleep(idx * STAGGER_DELAY);

                if (batchCancelled) return;

                try {
                    const atoms = await extractAtomsForRoundWithRetry(
                        pair.userMsg,
                        pair.aiMsg,
                        pair.aiFloor,
                        { timeout: DEFAULT_TIMEOUT }
                    );
                    if (atoms?.length) {
                        allAtoms.push(...atoms);
                    } else if (atoms === null) {
                        failed++;
                    }
                } catch {
                    failed++;
                }
                completed++;
                onProgress?.(completed, pairs.length, failed);
            })());
            await Promise.all(promises);
        } else {
            const promises = batch.map(pair =>
                extractAtomsForRoundWithRetry(
                    pair.userMsg,
                    pair.aiMsg,
                    pair.aiFloor,
                    { timeout: DEFAULT_TIMEOUT }
                )
                    .then(atoms => {
                        if (batchCancelled) return;
                        if (atoms?.length) {
                            allAtoms.push(...atoms);
                        } else if (atoms === null) {
                            failed++;
                        }
                        completed++;
                        onProgress?.(completed, pairs.length, failed);
                    })
                    .catch(() => {
                        if (batchCancelled) return;
                        failed++;
                        completed++;
                        onProgress?.(completed, pairs.length, failed);
                    })
            );

            await Promise.all(promises);
        }

        if (i + CONCURRENCY < pairs.length && !batchCancelled) {
            await sleep(30);
        }
    }

    xbLog.info(MODULE_ID, `批量提取完成: ${allAtoms.length} atoms, ${failed} 失败`);

    return allAtoms;
}

