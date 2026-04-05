// story-summary-ui.js
// iframe 内 UI 逻辑

(function () {
    'use strict';

    const DEFAULT_SUMMARY_SYSTEM_PROMPT = `Story Analyst: This task involves narrative comprehension and structured incremental summarization, representing creative story analysis at the intersection of plot tracking and character development. As a story analyst, you will conduct systematic evaluation of provided dialogue content to generate structured incremental summary data.
[Read the settings for this task]
<task_settings>
Incremental_Summary_Requirements:
  - Incremental_Only: 只提取新对话中的新增要素，绝不重复已有总结
  - Event_Granularity: 记录有叙事价值的事件，而非剧情梗概
  - Memory_Album_Style: 形成有细节、有温度、有记忆点的回忆册
  - Event_Classification:
      type:
        - 相遇: 人物/事物初次接触
        - 冲突: 对抗、矛盾激化
        - 揭示: 真相、秘密、身份
        - 抉择: 关键决定
        - 羁绊: 关系加深或破裂
        - 转变: 角色/局势改变
        - 收束: 问题解决、和解
        - 日常: 生活片段
      weight:
        - 核心: 删掉故事就崩
        - 主线: 推动主要剧情
        - 转折: 改变某条线走向
        - 点睛: 有细节不影响主线
        - 氛围: 纯粹氛围片段
    - Causal_Chain: 为每个新事件标注直接前因事件ID（causedBy）。仅在因果关系明确（直接导致/明确动机/承接后果）时填写；不明确时填[]完全正常。0-2个，只填 evt-数字，指向已存在或本次新输出事件。
  - Character_Dynamics: 识别新角色，追踪关系趋势（破裂/厌恶/反感/陌生/投缘/亲密/交融）
  - Arc_Tracking: 更新角色弧光轨迹与成长进度(0.0-1.0)
  - Fact_Tracking: 维护 SPO 三元组知识图谱。追踪生死、物品归属、位置、关系等硬性事实。采用 KV 覆盖模型（s+p 为键）。
</task_settings>
---
Story Analyst:
[Responsibility Definition]
\`\`\`yaml
analysis_task:
  title: Incremental Story Summarization with Knowledge Graph
  Story Analyst:
    role: Antigravity
    task: >-
      To analyze provided dialogue content against existing summary state,
      extract only NEW plot elements, character developments, relationship
      changes, arc progressions, AND fact updates, outputting
      structured JSON for incremental summary database updates.
  assistant:
    role: Summary Specialist
    description: Incremental Story Summary & Knowledge Graph Analyst
    behavior: >-
      To compare new dialogue against existing summary, identify genuinely
      new events and character interactions, classify events by narrative
      type and weight, track character arc progression with percentage,
      maintain facts as SPO triples with clear semantics,
      and output structured JSON containing only incremental updates.
      Must strictly avoid repeating any existing summary content.
  user:
    role: Content Provider
    description: Supplies existing summary state and new dialogue
    behavior: >-
      To provide existing summary state (events, characters, arcs, facts)
      and new dialogue content for incremental analysis.
interaction_mode:
  type: incremental_analysis
  output_format: structured_json
  deduplication: strict_enforcement
execution_context:
  summary_active: true
  incremental_only: true
  memory_album_style: true
  fact_tracking: true
\`\`\`
---
Summary Specialist:
<Chat_History>`;

    const DEFAULT_MEMORY_PROMPT_TEMPLATE = `以上是还留在眼前的对话
以下是脑海里的记忆：
• [定了的事] 这些是不会变的
• [其他人的事] 别人的经历，当前角色可能不知晓
• 其余部分是过往经历的回忆碎片

请内化这些记忆：
{$剧情记忆}
这些记忆是真实的，请自然地记住它们。`;

    const DEFAULT_SUMMARY_ASSISTANT_DOC_PROMPT = `
Summary Specialist:
Acknowledged. Now reviewing the incremental summarization specifications:

[Event Classification System]
├─ Types: 相遇|冲突|揭示|抉择|羁绊|转变|收束|日常
├─ Weights: 核心|主线|转折|点睛|氛围
└─ Each event needs: id, title, timeLabel, summary(含楼层), participants, type, weight

[Relationship Trend Scale]
破裂 ← 厌恶 ← 反感 ← 陌生 → 投缘 → 亲密 → 交融

[Arc Progress Tracking]
├─ trajectory: 当前阶段描述(15字内)
├─ progress: 0.0 to 1.0
└─ newMoment: 仅记录本次新增的关键时刻

[Fact Tracking - SPO / World Facts]
We maintain a small "world state" as SPO triples.
Each update is a JSON object: {s, p, o, isState, trend?, retracted?}

Core rules:
1) Keyed by (s + p). If a new update has the same (s+p), it overwrites the previous value.
2) Only output facts that are NEW or CHANGED in the new dialogue. Do NOT repeat unchanged facts.
3) isState meaning:
   - isState: true  -> core constraints that must stay stable and should NEVER be auto-deleted
                    (identity, location, life/death, ownership, relationship status, binding rules)
   - isState: false -> non-core facts / soft memories that may be pruned by capacity limits later
4) Relationship facts:
   - Use predicate format: "对X的看法" (X is the target person)
   - trend is required for relationship facts, one of:
     破裂 | 厌恶 | 反感 | 陌生 | 投缘 | 亲密 | 交融
5) Retraction (deletion):
   - To delete a fact, output: {s, p, retracted: true}
6) Predicate normalization:
   - Reuse existing predicates whenever possible, avoid inventing synonyms.

Ready to process incremental summary requests with strict deduplication.`;

    const DEFAULT_SUMMARY_ASSISTANT_ASK_SUMMARY_PROMPT = `
Summary Specialist:
Specifications internalized. Please provide the existing summary state so I can:
1. Index all recorded events to avoid duplication
2. Map current character list as baseline
3. Note existing arc progress levels
4. Identify established keywords
5. Review current facts (SPO triples baseline)`;

    const DEFAULT_SUMMARY_ASSISTANT_ASK_CONTENT_PROMPT = `
Summary Specialist:
Existing summary fully analyzed and indexed. I understand:
├─ Recorded events: Indexed for deduplication
├─ Character list: Baseline mapped
├─ Arc progress: Levels noted
├─ Keywords: Current state acknowledged
└─ Facts: SPO baseline loaded

I will extract only genuinely NEW elements from the upcoming dialogue.
Please provide the new dialogue content requiring incremental analysis.`;

    const DEFAULT_SUMMARY_META_PROTOCOL_START_PROMPT = `
Summary Specialist:
ACKNOWLEDGED. Beginning structured JSON generation:
<meta_protocol>`;

    const DEFAULT_SUMMARY_USER_JSON_FORMAT_PROMPT = `
## Output Rule
Generate a single valid JSON object with INCREMENTAL updates only.

## Mindful Approach
Before generating, observe the USER and analyze carefully:
- What is user's writing style and emotional expression?
- What NEW events occurred (not in existing summary)?
- What NEW characters appeared for the first time?
- What relationship CHANGES happened?
- What arc PROGRESS was made?
- What facts changed? (status/position/ownership/relationships)

## factUpdates 规则
- 目的: 纠错 & 世界一致性约束，只记录硬性事实
- s+p 为键，相同键会覆盖旧值
- isState: true=核心约束(位置/身份/生死/关系)，false=有容量上限会被清理
- 关系类: p="对X的看法"，trend 必填（破裂|厌恶|反感|陌生|投缘|亲密|交融）
- 删除: {s, p, retracted: true}，不需要 o 字段
- 更新: {s, p, o, isState, trend?}
- 谓词规范化: 复用已有谓词，不要发明同义词
- 只输出有变化的条目，确保少、硬、稳定

## Output Format
\`\`\`json
{
  "mindful_prelude": {
    "user_insight": "用户的幻想是什么时空、场景，是否反应出存在严重心理问题需要建议？",
    "dedup_analysis": "已有X个事件，本次识别Y个新事件",
    "fact_changes": "识别到的事实变化概述"
  },
  "keywords": [
    {"text": "综合历史+新内容的全剧情关键词(5-10个)", "weight": "核心|重要|一般"}
  ],
  "events": [
    {
      "id": "evt-{$nextEventId}起始，依次递增",
      "title": "地点·事件标题",
      "timeLabel": "时间线标签(如：开场、第二天晚上)",
      "summary": "1-2句话描述，涵盖丰富信息素，末尾标注楼层(#X-Y)",
      "participants": ["参与角色名，不要使用人称代词或别名，只用正式人名"],
      "type": "相遇|冲突|揭示|抉择|羁绊|转变|收束|日常",
      "weight": "核心|主线|转折|点睛|氛围",
      "causedBy": ["evt-12", "evt-14"]
    }
  ],
  "newCharacters": ["仅本次首次出现的角色名"],
  "arcUpdates": [
    {"name": "角色名，不要使用人称代词或别名，只用正式人名", "trajectory": "当前阶段描述(15字内)", "progress": 0.0-1.0, "newMoment": "本次新增的关键时刻"}
  ],
  "factUpdates": [
    {"s": "主体", "p": "谓词", "o": "当前值", "isState": true, "trend": "仅关系类填"},
    {"s": "要删除的主体", "p": "要删除的谓词", "retracted": true}
  ]
}
\`\`\`

## CRITICAL NOTES
- events.id 从 evt-{$nextEventId} 开始编号
- 仅输出【增量】内容，已有事件绝不重复
- /地点、通过什么方式、对谁、做了什么事、结果如何。如果原文有具体道具（如一把枪、一封信），必须在总结中提及。
- keywords 是全局关键词，综合已有+新增
- causedBy 仅在因果明确时填写，允许为[]，0-2个
- factUpdates 可为空数组
- 合法JSON，字符串值内部避免英文双引号
- 用朴实、白描、有烟火气的笔触记录事实，避免比喻和意象
- 严谨、注重细节，避免使用模糊的概括性语言，应用具体的动词描述动作，例:谁,在什么时间/地点,通过什么方式,对谁,做了什么事,出现了什么道具,结果如何。
</meta_protocol>

## Placeholder Notes
- {$nextEventId} 会在运行时替换成实际起始事件编号，不要删除
- {$existingEventCount}、{$historyRange} 这类占位符如果出现在你的自定义版本里，通常也不应该删除`;

    const DEFAULT_SUMMARY_ASSISTANT_CHECK_PROMPT = `Content review initiated...
[Compliance Check Results]
├─ Existing summary loaded: ✓ Fully indexed
├─ New dialogue received: ✓ Content parsed
├─ Deduplication engine: ✓ Active
├─ Event classification: ✓ Ready
├─ Fact tracking: ✓ Enabled
└─ Output format: ✓ JSON specification loaded

[Material Verification]
├─ Existing events: Indexed ({$existingEventCount} recorded)
├─ Character baseline: Mapped
├─ Arc progress baseline: Noted
├─ Facts baseline: Loaded
└─ Output specification: ✓ Defined in <meta_protocol>
All checks passed. Beginning incremental extraction...
{
  "mindful_prelude":`;

    const DEFAULT_SUMMARY_USER_CONFIRM_PROMPT = `怎么截断了！重新完整生成，只输出JSON，不要任何其他内容，3000字以内
</Chat_History>`;

    const DEFAULT_SUMMARY_ASSISTANT_PREFILL_PROMPT = '下面重新生成完整JSON。';

    // ═══════════════════════════════════════════════════════════════════════════
    // DOM Helpers
    // ═══════════════════════════════════════════════════════════════════════════

    const $ = id => document.getElementById(id);
    const $$ = sel => document.querySelectorAll(sel);
    const h = v => String(v ?? '').replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
    const setHtml = (el, html) => {
        if (!el) return;
        const range = document.createRange();
        range.selectNodeContents(el);
        // eslint-disable-next-line no-unsanitized/method
        const fragment = range.createContextualFragment(String(html ?? ''));
        el.replaceChildren(fragment);
    };
    const setSelectOptions = (select, items, placeholderText) => {
        if (!select) return;
        select.replaceChildren();
        if (placeholderText != null) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = placeholderText;
            select.appendChild(option);
        }
        (items || []).forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            select.appendChild(option);
        });
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // Constants
    // ═══════════════════════════════════════════════════════════════════════════

    const PARENT_ORIGIN = (() => {
        try { return new URL(document.referrer).origin; }
        catch { return window.location.origin; }
    })();

    const PROVIDER_DEFAULTS = {
        st: { url: '', needKey: false, canFetch: false },
        openai: { url: 'https://api.openai.com', needKey: true, canFetch: true },
        google: { url: 'https://generativelanguage.googleapis.com', needKey: true, canFetch: false },
        claude: { url: 'https://api.anthropic.com', needKey: true, canFetch: false },
        custom: { url: '', needKey: true, canFetch: true }
    };
    const VECTOR_PROVIDER_DEFAULTS = {
        siliconflow: { url: 'https://api.siliconflow.cn/v1', needKey: true, canFetch: true },
        openrouter: { url: 'https://openrouter.ai/api/v1', needKey: true, canFetch: true },
        custom: { url: '', needKey: true, canFetch: true }
    };

    const VECTOR_API_SUPPORTED_PROVIDERS = {
        l0: ['siliconflow', 'openrouter', 'custom'],
        embedding: ['siliconflow', 'custom'],
        rerank: ['siliconflow', 'custom'],
    };

    const VECTOR_API_DEFAULT_MODELS = {
        l0: 'Qwen/Qwen3-8B',
        embedding: 'BAAI/bge-m3',
        rerank: 'BAAI/bge-reranker-v2-m3',
    };

    const VECTOR_MODEL_FILTERS = {
        embedding: {
            include: [
                'embedding', 'embed', 'bge-m3', 'bge-large', 'bge-base', 'e5-', 'multilingual-e5',
                'jina-embeddings', 'text-embedding', 'voyage', 'gte-', 'gte_', 'gte.'
            ],
            exclude: [
                'rerank', 'reranker', 'chat', 'instruct', 'reasoner', 'vl', 'vision',
                'tts', 'speech', 'audio', 'whisper', 'transcription', 'image', 'sdxl', 'moderation'
            ],
        },
        rerank: {
            include: [
                'rerank', 'reranker', 'bge-reranker', 'jina-reranker', 'cohere-rerank'
            ],
            exclude: [
                'embedding', 'embed', 'chat', 'instruct', 'reasoner', 'vl', 'vision',
                'tts', 'speech', 'audio', 'whisper', 'transcription', 'image', 'sdxl', 'moderation'
            ],
        },
        l0: {
            include: [],
            exclude: [
                'embedding', 'embed', 'rerank', 'reranker', 'tts', 'speech', 'audio',
                'whisper', 'transcription', 'stt', 'image', 'sdxl', 'flux', 'wanx',
                'midjourney', 'moderation'
            ],
        },
    };

    function setStatusText(el, message, kind = '') {
        if (!el) return;
        el.textContent = message || '';
        el.style.color = kind === 'error'
            ? '#ef4444'
            : kind === 'success'
                ? '#22c55e'
                : kind === 'loading'
                    ? '#f59e0b'
                    : '';
    }

    function filterVectorModelsByPurpose(prefix, models) {
        const rule = VECTOR_MODEL_FILTERS[prefix];
        if (!rule || !Array.isArray(models)) return [];

        const normalized = [...new Set(models.filter(Boolean).map(m => String(m).trim()).filter(Boolean))];
        const matched = normalized.filter(modelId => {
            const lower = modelId.toLowerCase();
            if (rule.exclude.some(keyword => lower.includes(keyword))) return false;
            if (!rule.include.length) return true;
            return rule.include.some(keyword => lower.includes(keyword));
        });

        return matched.length ? matched : normalized;
    }

    function createDefaultProviderProfile(provider, model = '') {
        const pv = VECTOR_PROVIDER_DEFAULTS[provider] || VECTOR_PROVIDER_DEFAULTS.custom;
        return {
            url: pv.url || '',
            key: '',
            model: model || '',
            modelCache: [],
        };
    }

    function normalizeProviderProfiles(prefix, apiCfg = {}) {
        const supported = VECTOR_API_SUPPORTED_PROVIDERS[prefix] || ['custom'];
        const model = apiCfg.model || VECTOR_API_DEFAULT_MODELS[prefix] || '';
        const out = {};
        supported.forEach(provider => {
            const raw = apiCfg.providers?.[provider] || {};
            const defaults = createDefaultProviderProfile(provider, model);
            out[provider] = {
                url: String(raw.url || defaults.url || '').trim(),
                key: String(raw.key || '').trim(),
                model: String(raw.model || defaults.model || '').trim(),
                modelCache: Array.isArray(raw.modelCache) ? raw.modelCache.filter(Boolean) : [],
            };
        });

        const currentProvider = String(apiCfg.provider || supported[0] || 'custom').toLowerCase();
        if (out[currentProvider]) {
            if (apiCfg.url && !out[currentProvider].url) out[currentProvider].url = String(apiCfg.url).trim();
            if (apiCfg.key && !out[currentProvider].key) out[currentProvider].key = String(apiCfg.key).trim();
            if (apiCfg.model && !out[currentProvider].model) out[currentProvider].model = String(apiCfg.model).trim();
            if (Array.isArray(apiCfg.modelCache) && !out[currentProvider].modelCache.length) {
                out[currentProvider].modelCache = apiCfg.modelCache.filter(Boolean);
            }
        }

        return out;
    }

    const SECTION_META = {
        keywords: { title: '编辑关键词', hint: '每行一个关键词，格式：关键词|权重（核心/重要/一般）' },
        events: { title: '编辑事件时间线', hint: '编辑时，每个事件要素都应完整' },
        characters: { title: '编辑人物关系', hint: '编辑时，每个要素都应完整' },
        arcs: { title: '编辑角色弧光', hint: '编辑时，每个要素都应完整' },
        facts: { title: '编辑事实图谱', hint: '每行一条：主体|谓词|值|趋势(可选)。删除用：主体|谓词|（留空值）' }
    };

    const TREND_COLORS = {
        '破裂': '#444444', '厌恶': '#8b0000', '反感': '#cd5c5c',
        '陌生': '#888888', '投缘': '#4a9a7e', '亲密': '#d87a7a', '交融': '#c71585'
    };

    const TREND_CLASS = {
        '破裂': 'trend-broken', '厌恶': 'trend-hate', '反感': 'trend-dislike',
        '陌生': 'trend-stranger', '投缘': 'trend-click', '亲密': 'trend-close', '交融': 'trend-merge'
    };

    const DEFAULT_FILTER_RULES = [
        { start: '<think>', end: '</think>' },
        { start: '<thinking>', end: '</thinking>' },
        { start: '```', end: '```' },
    ];

    // ═══════════════════════════════════════════════════════════════════════════
    // State
    // ═══════════════════════════════════════════════════════════════════════════

    const config = {
        api: { provider: 'st', url: '', key: '', model: '', modelCache: [] },
        gen: { temperature: null, top_p: null, top_k: null, presence_penalty: null, frequency_penalty: null },
        trigger: { enabled: false, interval: 20, timing: 'before_user', role: 'system', useStream: true, maxPerRun: 100, wrapperHead: '', wrapperTail: '', forceInsertAtEnd: false },
        ui: { hideSummarized: true, keepVisibleCount: 6 },
        prompts: {
            summarySystemPrompt: '',
            summaryAssistantDocPrompt: '',
            summaryAssistantAskSummaryPrompt: '',
            summaryAssistantAskContentPrompt: '',
            summaryMetaProtocolStartPrompt: '',
            summaryUserJsonFormatPrompt: '',
            summaryAssistantCheckPrompt: '',
            summaryUserConfirmPrompt: '',
            summaryAssistantPrefillPrompt: '',
            memoryTemplate: '',
        },
        textFilterRules: [...DEFAULT_FILTER_RULES],
        vector: {
            enabled: false,
            engine: 'online',
            l0Concurrency: 10,
            l0Api: {
                provider: 'siliconflow', url: 'https://api.siliconflow.cn/v1', key: '', model: 'Qwen/Qwen3-8B', modelCache: [],
                providers: {
                    siliconflow: createDefaultProviderProfile('siliconflow', 'Qwen/Qwen3-8B'),
                    openrouter: createDefaultProviderProfile('openrouter', 'Qwen/Qwen3-8B'),
                    custom: createDefaultProviderProfile('custom', 'Qwen/Qwen3-8B'),
                }
            },
            embeddingApi: {
                provider: 'siliconflow', url: 'https://api.siliconflow.cn/v1', key: '', model: 'BAAI/bge-m3', modelCache: [],
                providers: {
                    siliconflow: createDefaultProviderProfile('siliconflow', 'BAAI/bge-m3'),
                    custom: createDefaultProviderProfile('custom', 'BAAI/bge-m3'),
                }
            },
            rerankApi: {
                provider: 'siliconflow', url: 'https://api.siliconflow.cn/v1', key: '', model: 'BAAI/bge-reranker-v2-m3', modelCache: [],
                providers: {
                    siliconflow: createDefaultProviderProfile('siliconflow', 'BAAI/bge-reranker-v2-m3'),
                    custom: createDefaultProviderProfile('custom', 'BAAI/bge-reranker-v2-m3'),
                }
            }
        }
    };

    let summaryData = { keywords: [], events: [], characters: { main: [], relationships: [] }, arcs: [], facts: [] };
    let localGenerating = false;
    let vectorGenerating = false;
    let anchorGenerating = false;
    let relationChart = null;
    let relationChartFullscreen = null;
    let currentEditSection = null;
    let currentCharacterId = null;
    let allNodes = [];
    let allLinks = [];
    let activeRelationTooltip = null;
    let lastRecallLogText = '';
    let modelListFetchedThisIframe = false;

    // ═══════════════════════════════════════════════════════════════════════════
    // Messaging
    // ═══════════════════════════════════════════════════════════════════════════

    function postMsg(type, data = {}) {
        window.parent.postMessage({ source: 'LittleWhiteBox-StoryFrame', type, ...data }, PARENT_ORIGIN);
    }

    function normalizeVectorConfigUI(raw = null) {
        const base = JSON.parse(JSON.stringify(config.vector));
        const legacyOnline = raw?.online || {};
        const sharedKey = String(legacyOnline.key || '').trim();
        const sharedUrl = String(legacyOnline.url || '').trim();

        if (raw) {
            base.enabled = !!raw.enabled;
            base.engine = 'online';
            base.l0Concurrency = Math.max(1, Math.min(50, Number(raw.l0Concurrency) || 10));
            Object.assign(base.l0Api, {
                provider: raw.l0Api?.provider || legacyOnline.provider || base.l0Api.provider,
                url: raw.l0Api?.url || sharedUrl || base.l0Api.url,
                key: raw.l0Api?.key || sharedKey || base.l0Api.key,
                model: raw.l0Api?.model || base.l0Api.model,
                modelCache: Array.isArray(raw.l0Api?.modelCache) ? raw.l0Api.modelCache : [],
                providers: normalizeProviderProfiles('l0', raw.l0Api || {}),
            });
            Object.assign(base.embeddingApi, {
                provider: raw.embeddingApi?.provider || base.embeddingApi.provider,
                url: raw.embeddingApi?.url || sharedUrl || base.embeddingApi.url,
                key: raw.embeddingApi?.key || sharedKey || base.embeddingApi.key,
                model: raw.embeddingApi?.model || legacyOnline.model || base.embeddingApi.model,
                modelCache: Array.isArray(raw.embeddingApi?.modelCache) ? raw.embeddingApi.modelCache : [],
                providers: normalizeProviderProfiles('embedding', raw.embeddingApi || {}),
            });
            Object.assign(base.rerankApi, {
                provider: raw.rerankApi?.provider || base.rerankApi.provider,
                url: raw.rerankApi?.url || sharedUrl || base.rerankApi.url,
                key: raw.rerankApi?.key || sharedKey || base.rerankApi.key,
                model: raw.rerankApi?.model || base.rerankApi.model,
                modelCache: Array.isArray(raw.rerankApi?.modelCache) ? raw.rerankApi.modelCache : [],
                providers: normalizeProviderProfiles('rerank', raw.rerankApi || {}),
            });
        }

        return base;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Config Management
    // ═══════════════════════════════════════════════════════════════════════════

    function loadConfig() {
        try {
            const s = localStorage.getItem('summary_panel_config');
            if (s) {
                const p = JSON.parse(s);
                Object.assign(config.api, p.api || {});
                config.api.modelCache = [];
                Object.assign(config.gen, p.gen || {});
                Object.assign(config.trigger, p.trigger || {});
                Object.assign(config.ui, p.ui || {});
                Object.assign(config.prompts, p.prompts || {});
                config.textFilterRules = Array.isArray(p.textFilterRules)
                    ? p.textFilterRules
                    : (Array.isArray(p.vector?.textFilterRules) ? p.vector.textFilterRules : [...DEFAULT_FILTER_RULES]);
                if (p.vector) config.vector = normalizeVectorConfigUI(p.vector);
                if (config.trigger.timing === 'manual' && config.trigger.enabled) {
                    config.trigger.enabled = false;
                    saveConfig();
                }
            }
        } catch { }
    }

    function applyConfig(cfg) {
        if (!cfg) return;
        Object.assign(config.api, cfg.api || {});
        config.api.modelCache = [];
        Object.assign(config.gen, cfg.gen || {});
        Object.assign(config.trigger, cfg.trigger || {});
        Object.assign(config.ui, cfg.ui || {});
        Object.assign(config.prompts, cfg.prompts || {});
        config.textFilterRules = Array.isArray(cfg.textFilterRules)
            ? cfg.textFilterRules
            : (Array.isArray(cfg.vector?.textFilterRules)
                ? cfg.vector.textFilterRules
                : (Array.isArray(config.textFilterRules) ? config.textFilterRules : [...DEFAULT_FILTER_RULES]));
        if (cfg.vector) config.vector = normalizeVectorConfigUI(cfg.vector);
        if (config.trigger.timing === 'manual') config.trigger.enabled = false;
        localStorage.setItem('summary_panel_config', JSON.stringify(config));
    }

    function saveConfig() {
        try {
            const settingsOpen = $('settings-modal')?.classList.contains('active');
            if (settingsOpen) {
                config.vector = getVectorConfig();
                config.textFilterRules = collectFilterRules();
            }
            if (!config.vector) {
                config.vector = {
                    enabled: false,
                    engine: 'online',
                    l0Concurrency: 10,
                    l0Api: { provider: 'siliconflow', url: 'https://api.siliconflow.cn/v1', key: '', model: 'Qwen/Qwen3-8B', modelCache: [] },
                    embeddingApi: { provider: 'siliconflow', url: 'https://api.siliconflow.cn/v1', key: '', model: 'BAAI/bge-m3', modelCache: [] },
                    rerankApi: { provider: 'siliconflow', url: 'https://api.siliconflow.cn/v1', key: '', model: 'BAAI/bge-reranker-v2-m3', modelCache: [] }
                };
            }
            localStorage.setItem('summary_panel_config', JSON.stringify(config));
            postMsg('SAVE_PANEL_CONFIG', { config });
        } catch (e) {
            console.error('saveConfig error:', e);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Vector Config UI
    // ═══════════════════════════════════════════════════════════════════════════

    function getVectorApiConfig(prefix) {
        const provider = $(`${prefix}-api-provider`)?.value || 'siliconflow';
        const providers = normalizeProviderProfiles(prefix, config.vector?.[`${prefix}Api`] || {});
        providers[provider] = {
            url: $(`${prefix}-api-url`)?.value?.trim() || '',
            key: $(`${prefix}-api-key`)?.value?.trim() || '',
            model: $(`${prefix}-api-model-text`)?.value?.trim() || '',
            modelCache: Array.isArray(config.vector?.[`${prefix}Api`]?.providers?.[provider]?.modelCache)
                ? [...config.vector[`${prefix}Api`].providers[provider].modelCache]
                : [],
        };
        return {
            provider,
            url: providers[provider]?.url || '',
            key: providers[provider]?.key || '',
            model: providers[provider]?.model || '',
            modelCache: Array.isArray(providers[provider]?.modelCache) ? [...providers[provider].modelCache] : [],
            providers,
        };
    }

    function loadVectorApiConfig(prefix, cfg) {
        const next = cfg || {};
        const provider = next.provider || 'siliconflow';
        const profiles = normalizeProviderProfiles(prefix, next);
        const profile = profiles[provider] || createDefaultProviderProfile(provider, VECTOR_API_DEFAULT_MODELS[prefix]);
        $(`${prefix}-api-provider`).value = provider;
        $(`${prefix}-api-url`).value = profile.url || '';
        $(`${prefix}-api-key`).value = profile.key || '';
        $(`${prefix}-api-model-text`).value = profile.model || '';

        const cache = Array.isArray(profile.modelCache) ? profile.modelCache : [];
        setSelectOptions($(`${prefix}-api-model-select`), cache, '请选择');
        $(`${prefix}-api-model-select`).value = cache.includes(profile.model) ? profile.model : '';
        updateVectorProviderUI(prefix, provider);
    }

    function saveCurrentVectorApiProfile(prefix, providerOverride = null) {
        const apiCfg = config.vector[`${prefix}Api`] ||= {};
        const provider = providerOverride || $(`${prefix}-api-provider`)?.value || apiCfg.provider || 'siliconflow';
        apiCfg.providers = normalizeProviderProfiles(prefix, apiCfg);
        apiCfg.providers[provider] = {
            url: $(`${prefix}-api-url`)?.value?.trim() || '',
            key: $(`${prefix}-api-key`)?.value?.trim() || '',
            model: $(`${prefix}-api-model-text`)?.value?.trim() || '',
            modelCache: Array.isArray(apiCfg.providers?.[provider]?.modelCache) ? [...apiCfg.providers[provider].modelCache] : [],
        };
        apiCfg.provider = provider;
        apiCfg.url = apiCfg.providers[provider].url;
        apiCfg.key = apiCfg.providers[provider].key;
        apiCfg.model = apiCfg.providers[provider].model;
        apiCfg.modelCache = [...apiCfg.providers[provider].modelCache];
    }

    function updateVectorProviderUI(prefix, provider) {
        const pv = VECTOR_PROVIDER_DEFAULTS[provider] || VECTOR_PROVIDER_DEFAULTS.custom;
        const apiCfg = config.vector?.[`${prefix}Api`] || {};
        apiCfg.providers = normalizeProviderProfiles(prefix, apiCfg);
        const profile = apiCfg.providers[provider] || createDefaultProviderProfile(provider, VECTOR_API_DEFAULT_MODELS[prefix]);
        const cache = Array.isArray(profile.modelCache) ? profile.modelCache : [];
        const hasModelCache = cache.length > 0;

        $(`${prefix}-api-url-row`).classList.toggle('hidden', false);
        $(`${prefix}-api-key-row`).classList.toggle('hidden', !pv.needKey);
        $(`${prefix}-api-model-manual-row`).classList.toggle('hidden', false);
        $(`${prefix}-api-model-select-row`).classList.toggle('hidden', !hasModelCache);
        $(`${prefix}-api-connect-row`).classList.toggle('hidden', !pv.canFetch);
        $(`${prefix}-api-connect-status`).classList.toggle('hidden', !pv.canFetch);

        const urlInput = $(`${prefix}-api-url`);
        if (urlInput) {
            if (provider === 'custom') {
                urlInput.readOnly = false;
                urlInput.placeholder = 'https://your-openai-compatible-api/v1';
                urlInput.value = profile.url || '';
            } else {
                urlInput.value = pv.url || '';
                urlInput.readOnly = true;
                urlInput.placeholder = pv.url || '';
            }
        }
        $(`${prefix}-api-key`).value = profile.key || '';
        $(`${prefix}-api-model-text`).value = profile.model || '';
        setSelectOptions($(`${prefix}-api-model-select`), cache, '请选择');
        $(`${prefix}-api-model-select`).value = cache.includes(profile.model) ? profile.model : '';
    }

    function saveVectorApiSection(prefix) {
        saveCurrentVectorApiProfile(prefix);
        saveConfig();
        setStatusText($(`${prefix}-api-connect-status`), '此组配置已保存', 'success');
    }

    async function fetchVectorModels(prefix) {
        const provider = $(`${prefix}-api-provider`).value;
        const pv = VECTOR_PROVIDER_DEFAULTS[provider] || VECTOR_PROVIDER_DEFAULTS.custom;
        const statusEl = $(`${prefix}-api-connect-status`);
        const btn = $(`${prefix}-btn-connect`);
        if (!pv.canFetch) {
            statusEl.textContent = '当前渠道不支持自动拉取模型';
            return;
        }

        let baseUrl = $(`${prefix}-api-url`).value.trim().replace(/\/+$/, '');
        const apiKey = $(`${prefix}-api-key`).value.trim();
        if (!apiKey) {
            statusEl.textContent = '请先填写 API KEY';
            return;
        }

        btn.disabled = true;
        btn.textContent = '连接中...';
        statusEl.textContent = '连接中...';

        try {
            const tryFetch = async url => {
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' }
                });
                return res.ok ? (await res.json())?.data?.map(m => m?.id).filter(Boolean) || null : null;
            };

            if (baseUrl.endsWith('/v1')) baseUrl = baseUrl.slice(0, -3);
            let models = await tryFetch(`${baseUrl}/v1/models`);
            if (!models) models = await tryFetch(`${baseUrl}/models`);
            if (!models?.length) throw new Error('未获取到模型列表');

            const allModels = [...new Set(models)];
            const filteredModels = filterVectorModelsByPurpose(prefix, allModels);

            const apiCfg = config.vector[`${prefix}Api`] ||= {};
            apiCfg.providers = normalizeProviderProfiles(prefix, apiCfg);
            apiCfg.providers[provider] ||= createDefaultProviderProfile(provider, VECTOR_API_DEFAULT_MODELS[prefix]);
            apiCfg.providers[provider].modelCache = filteredModels;
            setSelectOptions($(`${prefix}-api-model-select`), apiCfg.providers[provider].modelCache, '请选择');
            $(`${prefix}-api-model-select-row`).classList.remove('hidden');
            if (!$(`${prefix}-api-model-text`).value.trim()) {
                $(`${prefix}-api-model-text`).value = filteredModels[0];
                $(`${prefix}-api-model-select`).value = filteredModels[0];
            }
            statusEl.textContent = filteredModels.length === allModels.length
                ? `拉取成功：${filteredModels.length} 个模型`
                : `拉取成功：共 ${allModels.length} 个，已筛出 ${filteredModels.length} 个适合当前用途的模型`;
        } catch (e) {
            statusEl.textContent = '拉取失败：' + (e.message || '请检查 URL 和 KEY');
        } finally {
            btn.disabled = false;
            btn.textContent = '连接 / 拉取模型列表';
        }
    }

    function getVectorConfig() {
        return {
            enabled: $('vector-enabled')?.checked || false,
            engine: 'online',
            l0Concurrency: Math.max(1, Math.min(50, Number($('vector-l0-concurrency')?.value) || 10)),
            l0Api: getVectorApiConfig('l0'),
            embeddingApi: getVectorApiConfig('embedding'),
            rerankApi: getVectorApiConfig('rerank'),
        };
    }

    function loadVectorConfig(cfg) {
        if (!cfg) return;
        $('vector-enabled').checked = !!cfg.enabled;
        $('vector-config-area').classList.toggle('hidden', !cfg.enabled);
        $('vector-l0-concurrency').value = String(Math.max(1, Math.min(50, Number(cfg.l0Concurrency) || 10)));
        loadVectorApiConfig('l0', cfg.l0Api || {});
        loadVectorApiConfig('embedding', cfg.embeddingApi || {});
        loadVectorApiConfig('rerank', cfg.rerankApi || {});
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Filter Rules UI
    // ═══════════════════════════════════════════════════════════════════════════

    function renderFilterRules(rules) {
        const list = $('filter-rules-list');
        if (!list) return;

        const items = rules?.length ? rules : [];

        setHtml(list, items.map((r, i) => `
            <div class="filter-rule-item" data-idx="${i}">
                <div class="filter-rule-inputs">
                    <input type="text" class="filter-rule-start" placeholder="起始（可空）" value="${h(r.start || '')}">
                    <span class="rule-arrow">⬇</span>
                    <input type="text" class="filter-rule-end" placeholder="结束（可空）" value="${h(r.end || '')}">
                </div>
                <button class="btn-del-rule">✕</button>
            </div>
        `).join(''));

        // 绑定删除
        list.querySelectorAll('.btn-del-rule').forEach(btn => {
            btn.onclick = () => {
                btn.closest('.filter-rule-item')?.remove();
                updateFilterRulesCount();
            };
        });

        updateFilterRulesCount();
    }

    function collectFilterRules() {
        const list = $('filter-rules-list');
        if (!list) return [];

        const rules = [];
        list.querySelectorAll('.filter-rule-item').forEach(item => {
            const start = item.querySelector('.filter-rule-start')?.value?.trim() || '';
            const end = item.querySelector('.filter-rule-end')?.value?.trim() || '';
            if (start || end) {
                rules.push({ start, end });
            }
        });
        return rules;
    }

    function addFilterRule() {
        const list = $('filter-rules-list');
        if (!list) return;

        const idx = list.querySelectorAll('.filter-rule-item').length;
        const div = document.createElement('div');
        div.className = 'filter-rule-item';
        div.dataset.idx = idx;
        setHtml(div, `
            <div class="filter-rule-inputs">
                <input type="text" class="filter-rule-start" placeholder="起始（可空）" value="">
                <span class="rule-arrow">⬇</span>
                <input type="text" class="filter-rule-end" placeholder="结束（可空）" value="">
            </div>
            <button class="btn-del-rule">✕</button>
        `);
        div.querySelector('.btn-del-rule').onclick = () => {
            div.remove();
            updateFilterRulesCount();
        };
        list.appendChild(div);
        updateFilterRulesCount();
    }

    function updateFilterRulesCount() {
        const el = $('filter-rules-count');
        if (!el) return;
        const count = $('filter-rules-list')?.querySelectorAll('.filter-rule-item')?.length || 0;
        el.textContent = count;
    }

    function updateVectorStats(stats) {
        $('vector-atom-count').textContent = stats.stateVectors || 0;
        $('vector-chunk-count').textContent = stats.chunkCount || 0;
        $('vector-event-count').textContent = stats.eventVectors || 0;
    }

    function showVectorMismatchWarning(show) {
        $('vector-mismatch-warning').classList.toggle('hidden', !show);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 记忆锚点（L0）UI
    // ═══════════════════════════════════════════════════════════════════════════

    function updateAnchorStats(stats) {
        const extracted = stats.extracted || 0;
        const total = stats.total || 0;
        const pending = stats.pending || 0;
        const empty = stats.empty || 0;
        const fail = stats.fail || 0;
        const atomsCount = stats.atomsCount || 0;

        $('anchor-extracted').textContent = extracted;
        $('anchor-total').textContent = total;
        $('anchor-pending').textContent = pending;
        $('anchor-atoms-count').textContent = atomsCount;

        const pendingWrap = $('anchor-pending-wrap');
        if (pendingWrap) {
            pendingWrap.classList.toggle('hidden', pending === 0);
        }

        // 显示 empty/fail 信息
        const extraWrap = $('anchor-extra-wrap');
        const extraSep = $('anchor-extra-sep');
        const extra = $('anchor-extra');
        if (extraWrap && extra) {
            if (empty > 0 || fail > 0) {
                const parts = [];
                if (empty > 0) parts.push(`空 ${empty}`);
                if (fail > 0) parts.push(`失败 ${fail}`);
                extra.textContent = parts.join(' · ');
                extraWrap.style.display = '';
                if (extraSep) extraSep.style.display = '';
            } else {
                extraWrap.style.display = 'none';
                if (extraSep) extraSep.style.display = 'none';
            }
        }

        const emptyWarning = $('vector-empty-l0-warning');
        if (emptyWarning) {
            emptyWarning.classList.toggle('hidden', extracted > 0);
        }
    }

    function updateAnchorProgress(current, total, message) {
        const progress = $('anchor-progress');
        const btnGen = $('btn-anchor-generate');
        const btnClear = $('btn-anchor-clear');
        const btnCancel = $('btn-anchor-cancel');

        if (current < 0) {
            progress.classList.add('hidden');
            btnGen.classList.remove('hidden');
            btnClear.classList.remove('hidden');
            btnCancel.classList.add('hidden');
            anchorGenerating = false;
        } else {
            anchorGenerating = true;
            progress.classList.remove('hidden');
            btnGen.classList.add('hidden');
            btnClear.classList.add('hidden');
            btnCancel.classList.remove('hidden');

            const percent = total > 0 ? Math.round(current / total * 100) : 0;
            progress.querySelector('.progress-inner').style.width = percent + '%';
            progress.querySelector('.progress-text').textContent = message || `${current}/${total}`;
        }
    }

    function initAnchorUI() {
        $('btn-anchor-generate').onclick = () => {
            if (anchorGenerating) return;
            postMsg('ANCHOR_GENERATE');
        };

        $('btn-anchor-clear').onclick = async () => {
            if (await showConfirm('清空锚点', '清空所有记忆锚点？（L0 向量也会一并清除）')) {
                postMsg('ANCHOR_CLEAR');
            }
        };

        $('btn-anchor-cancel').onclick = () => {
            postMsg('ANCHOR_CANCEL');
        };
    }

    function initVectorUI() {
        $('vector-enabled').onchange = e => {
            $('vector-config-area').classList.toggle('hidden', !e.target.checked);
        };

        ['l0', 'embedding', 'rerank'].forEach(prefix => {
            $(`${prefix}-api-key-toggle`).onclick = () => {
                const input = $(`${prefix}-api-key`);
                const btn = $(`${prefix}-api-key-toggle`);
                if (!input || !btn) return;
                const show = input.type === 'password';
                input.type = show ? 'text' : 'password';
                btn.textContent = show ? '隐藏' : '显示';
            };

            $(`${prefix}-api-provider`).onchange = e => {
                const target = config.vector[`${prefix}Api`] ||= {};
                const previousProvider = target.provider || 'siliconflow';
                saveCurrentVectorApiProfile(prefix, previousProvider);
                target.providers = normalizeProviderProfiles(prefix, target);
                target.provider = e.target.value;
                target.providers[e.target.value] ||= createDefaultProviderProfile(e.target.value, VECTOR_API_DEFAULT_MODELS[prefix]);
                updateVectorProviderUI(prefix, e.target.value);
            };

            $(`${prefix}-api-model-select`).onchange = e => {
                if (e.target.value) $(`${prefix}-api-model-text`).value = e.target.value;
            };

            $(`${prefix}-btn-connect`).onclick = () => fetchVectorModels(prefix);
            $(`${prefix}-btn-save`).onclick = () => saveVectorApiSection(prefix);
            $(`${prefix}-btn-test`).onclick = () => {
                const btn = $(`${prefix}-btn-test`);
                if (btn) btn.disabled = true;
                setStatusText($(`${prefix}-api-connect-status`), '测试中...', 'loading');
                saveConfig();
                const cfg = getVectorConfig();
                postMsg('VECTOR_TEST_ONLINE', {
                    target: prefix,
                    provider: cfg[`${prefix}Api`].provider,
                    config: cfg[`${prefix}Api`],
                });
            };
        });

        $('btn-add-filter-rule').onclick = addFilterRule;

        $('btn-gen-vectors').onclick = () => {
            if (vectorGenerating) return;
            postMsg('VECTOR_GENERATE', { config: getVectorConfig() });
        };

        $('btn-clear-vectors').onclick = async () => {
            if (await showConfirm('清空向量', '确定清空所有向量数据？')) {
                postMsg('VECTOR_CLEAR');
            }
        };

        $('btn-cancel-vectors').onclick = () => postMsg('VECTOR_CANCEL_GENERATE');

        $('btn-export-vectors').onclick = () => {
            $('btn-export-vectors').disabled = true;
            $('vector-io-status').textContent = '导出中...';
            postMsg('VECTOR_EXPORT');
        };

        $('btn-import-vectors').onclick = () => {
            $('btn-import-vectors').disabled = true;
            $('vector-io-status').textContent = '导入中...';
            postMsg('VECTOR_IMPORT_PICK');
        };
        $('btn-backup-server').onclick = () => {
            $('btn-backup-server').disabled = true;
            $('server-io-status').textContent = '备份中...';
            postMsg('VECTOR_BACKUP_SERVER');
        };

        $('btn-restore-server').onclick = () => {
            $('btn-restore-server').disabled = true;
            $('server-io-status').textContent = '恢复中...';
            postMsg('VECTOR_RESTORE_SERVER');
        };

        $('btn-manage-backups').onclick = () => postMsg('VECTOR_LIST_BACKUPS');

        initAnchorUI();
        postMsg('REQUEST_ANCHOR_STATS');
    }

    function updateVectorOnlineStatus(target, status, message) {
        const prefix = target || 'embedding';
        const btn = $(`${prefix}-btn-test`);
        if (btn) btn.disabled = false;
        setStatusText(
            $(`${prefix}-api-connect-status`),
            message || '',
            status === 'error' ? 'error' : status === 'success' ? 'success' : 'loading'
        );
    }

    function initSummaryIOUI() {
        $('btn-copy-summary').onclick = () => {
            $('btn-copy-summary').disabled = true;
            $('summary-io-status').textContent = '复制中...';
            postMsg('SUMMARY_COPY');
        };

        $('btn-import-summary').onclick = async () => {
            const text = await showConfirmInput(
                '覆盖导入记忆包',
                '导入会覆盖当前聊天已有的总结资料，并立即清空向量、锚点、总结边界。请把记忆包粘贴到下面。',
                '继续导入',
                '取消',
                '在这里粘贴记忆包 JSON'
            );
            if (text == null) return;
            if (!String(text).trim()) {
                $('summary-io-status').textContent = '导入失败: 记忆包内容为空';
                return;
            }
            $('btn-import-summary').disabled = true;
            $('summary-io-status').textContent = '导入中...';
            postMsg('SUMMARY_IMPORT_TEXT', { text });
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // Settings Modal
    // ═══════════════════════════════════════════════════════════════════════════

    function updateProviderUI(provider) {
        const pv = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.custom;
        const isSt = provider === 'st';
        const hasModelCache = modelListFetchedThisIframe && Array.isArray(config.api.modelCache) && config.api.modelCache.length > 0;

        $('api-url-row').classList.toggle('hidden', isSt);
        $('api-key-row').classList.toggle('hidden', !pv.needKey);
        $('api-model-manual-row').classList.toggle('hidden', isSt);
        $('api-model-select-row').classList.toggle('hidden', isSt || !hasModelCache);
        $('api-connect-row').classList.toggle('hidden', isSt || !pv.canFetch);
        $('api-connect-status').classList.toggle('hidden', isSt || !pv.canFetch);

        const urlInput = $('api-url');
        if (!urlInput.value && pv.url) urlInput.value = pv.url;
    }

    function openSettings() {
        $('api-provider').value = config.api.provider;
        $('api-url').value = config.api.url;
        $('api-key').value = config.api.key;
        $('api-model-text').value = config.api.model;
        $('gen-temp').value = config.gen.temperature ?? '';
        $('gen-top-p').value = config.gen.top_p ?? '';
        $('gen-top-k').value = config.gen.top_k ?? '';
        $('gen-presence').value = config.gen.presence_penalty ?? '';
        $('gen-frequency').value = config.gen.frequency_penalty ?? '';
        $('trigger-enabled').checked = config.trigger.enabled;
        $('trigger-interval').value = config.trigger.interval;
        $('trigger-timing').value = config.trigger.timing;
        $('trigger-role').value = config.trigger.role || 'system';
        $('trigger-stream').checked = config.trigger.useStream !== false;
        $('trigger-max-per-run').value = config.trigger.maxPerRun || 100;
        $('trigger-wrapper-head').value = config.trigger.wrapperHead || '';
        $('trigger-wrapper-tail').value = config.trigger.wrapperTail || '';
        $('trigger-insert-at-end').checked = !!config.trigger.forceInsertAtEnd;
        $('summary-system-prompt').value = config.prompts.summarySystemPrompt || '';
        $('summary-assistant-doc-prompt').value = config.prompts.summaryAssistantDocPrompt || '';
        $('summary-assistant-ask-summary-prompt').value = config.prompts.summaryAssistantAskSummaryPrompt || '';
        $('summary-assistant-ask-content-prompt').value = config.prompts.summaryAssistantAskContentPrompt || '';
        $('summary-meta-protocol-start-prompt').value = config.prompts.summaryMetaProtocolStartPrompt || '';
        $('summary-user-json-format-prompt').value = config.prompts.summaryUserJsonFormatPrompt || '';
        $('summary-assistant-check-prompt').value = config.prompts.summaryAssistantCheckPrompt || '';
        $('summary-user-confirm-prompt').value = config.prompts.summaryUserConfirmPrompt || '';
        $('summary-assistant-prefill-prompt').value = config.prompts.summaryAssistantPrefillPrompt || '';
        $('memory-prompt-template').value = config.prompts.memoryTemplate || '';
        $('api-connect-status').textContent = '';

        const en = $('trigger-enabled');
        if (config.trigger.timing === 'manual') {
            en.checked = false;
            en.disabled = true;
            en.parentElement.style.opacity = '.5';
        } else {
            en.disabled = false;
            en.parentElement.style.opacity = '1';
        }

        if (config.api.modelCache.length) {
            setSelectOptions($('api-model-select'), config.api.modelCache, '请选择');
            $('api-model-select').value = config.api.modelCache.includes(config.api.model) ? config.api.model : '';
        } else {
            setSelectOptions($('api-model-select'), [], '请选择');
        }

        updateProviderUI(config.api.provider);
        if (config.vector) loadVectorConfig(config.vector);
        renderFilterRules(Array.isArray(config.textFilterRules) ? config.textFilterRules : DEFAULT_FILTER_RULES);

        // Initialize sub-options visibility
        const autoSummaryOptions = $('auto-summary-options');
        if (autoSummaryOptions) {
            autoSummaryOptions.classList.toggle('hidden', !config.trigger.enabled);
        }
        const insertWrapperOptions = $('insert-wrapper-options');
        if (insertWrapperOptions) {
            insertWrapperOptions.classList.toggle('hidden', !config.trigger.forceInsertAtEnd);
        }

        $('settings-modal').classList.add('active');

        // Default to first tab
        $$('.settings-tab').forEach(t => t.classList.remove('active'));
        $$('.settings-tab[data-tab="tab-summary"]').forEach(t => t.classList.add('active'));
        $$('.tab-pane').forEach(p => p.classList.remove('active'));
        $('tab-summary').classList.add('active');

        postMsg('SETTINGS_OPENED');
    }

    function closeSettings(save) {
        if (save) {
            const pn = id => { const v = $(id).value; return v === '' ? null : parseFloat(v); };
            const provider = $('api-provider').value;

            config.api.provider = provider;
            config.api.url = $('api-url').value;
            config.api.key = $('api-key').value;
            config.api.model = provider === 'st' ? '' : $('api-model-text').value.trim();
            config.api.modelCache = [];

            config.gen.temperature = pn('gen-temp');
            config.gen.top_p = pn('gen-top-p');
            config.gen.top_k = pn('gen-top-k');
            config.gen.presence_penalty = pn('gen-presence');
            config.gen.frequency_penalty = pn('gen-frequency');

            const timing = $('trigger-timing').value;
            config.trigger.timing = timing;
            config.trigger.role = $('trigger-role').value || 'system';
            config.trigger.enabled = timing === 'manual' ? false : $('trigger-enabled').checked;
            config.trigger.interval = Math.max(1, Math.min(30, parseInt($('trigger-interval').value) || 20));
            config.trigger.useStream = $('trigger-stream').checked;
            config.trigger.maxPerRun = parseInt($('trigger-max-per-run').value) || 100;
            config.trigger.wrapperHead = $('trigger-wrapper-head').value;
            config.trigger.wrapperTail = $('trigger-wrapper-tail').value;
            config.trigger.forceInsertAtEnd = $('trigger-insert-at-end').checked;
            config.prompts.summarySystemPrompt = $('summary-system-prompt').value;
            config.prompts.summaryAssistantDocPrompt = $('summary-assistant-doc-prompt').value;
            config.prompts.summaryAssistantAskSummaryPrompt = $('summary-assistant-ask-summary-prompt').value;
            config.prompts.summaryAssistantAskContentPrompt = $('summary-assistant-ask-content-prompt').value;
            config.prompts.summaryMetaProtocolStartPrompt = $('summary-meta-protocol-start-prompt').value;
            config.prompts.summaryUserJsonFormatPrompt = $('summary-user-json-format-prompt').value;
            config.prompts.summaryAssistantCheckPrompt = $('summary-assistant-check-prompt').value;
            config.prompts.summaryUserConfirmPrompt = $('summary-user-confirm-prompt').value;
            config.prompts.summaryAssistantPrefillPrompt = $('summary-assistant-prefill-prompt').value;
            config.prompts.memoryTemplate = $('memory-prompt-template').value;
            config.textFilterRules = collectFilterRules();

            config.vector = getVectorConfig();
            saveConfig();
        }

        $('settings-modal').classList.remove('active');
        postMsg('SETTINGS_CLOSED');
    }

    async function fetchModels() {
        const btn = $('btn-connect');
        const statusEl = $('api-connect-status');
        const provider = $('api-provider').value;

        if (!PROVIDER_DEFAULTS[provider]?.canFetch) {
            statusEl.textContent = '当前渠道不支持自动拉取模型';
            return;
        }

        let baseUrl = $('api-url').value.trim().replace(/\/+$/, '');
        const apiKey = $('api-key').value.trim();

        if (!apiKey) {
            statusEl.textContent = '请先填写 API KEY';
            return;
        }

        btn.disabled = true;
        btn.textContent = '连接中...';
        statusEl.textContent = '连接中...';

        try {
            const tryFetch = async url => {
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' }
                });
                return res.ok ? (await res.json())?.data?.map(m => m?.id).filter(Boolean) || null : null;
            };

            if (baseUrl.endsWith('/v1')) baseUrl = baseUrl.slice(0, -3);

            let models = await tryFetch(`${baseUrl}/v1/models`);
            if (!models) models = await tryFetch(`${baseUrl}/models`);
            if (!models?.length) throw new Error('未获取到模型列表');

            config.api.modelCache = [...new Set(models)];
            modelListFetchedThisIframe = true;
            setSelectOptions($('api-model-select'), config.api.modelCache, '请选择');
            $('api-model-select-row').classList.remove('hidden');

            if (!config.api.model && models.length) {
                config.api.model = models[0];
                $('api-model-text').value = models[0];
                $('api-model-select').value = models[0];
            } else if (config.api.model) {
                $('api-model-select').value = config.api.model;
            }

            statusEl.textContent = `拉取成功：${models.length} 个模型`;
        } catch (e) {
            statusEl.textContent = '拉取失败：' + (e.message || '请检查 URL 和 KEY');
        } finally {
            btn.disabled = false;
            btn.textContent = '连接 / 拉取模型列表';
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Rendering Functions
    // ═══════════════════════════════════════════════════════════════════════════

    function renderKeywords(kw) {
        summaryData.keywords = kw || [];
        const wc = { '核心': 'p', '重要': 's', high: 'p', medium: 's' };
        setHtml($('keywords-cloud'), kw.length
            ? kw.map(k => `<span class="tag ${wc[k.weight] || wc[k.level] || ''}">${h(k.text)}</span>`).join('')
            : '<div class="empty">暂无关键词</div>');
    }

    function renderTimeline(ev) {
        summaryData.events = ev || [];
        const c = $('timeline-list');
        if (!ev?.length) {
            setHtml(c, '<div class="empty">暂无事件记录</div>');
            return;
        }
        setHtml(c, ev.map(e => {
            const participants = (e.participants || e.characters || []).map(h).join('、');
            return `<div class="tl-item${e.weight === '核心' || e.weight === '主线' ? ' crit' : ''}">
                <div class="tl-dot"></div>
                <div class="tl-head">
                    <div class="tl-title">${h(e.title || '')}</div>
                    <div class="tl-time">${h(e.timeLabel || '')}</div>
                </div>
                <div class="tl-brief">${h(e.summary || e.brief || '')}</div>
                <div class="tl-meta">
                    <span>人物：${participants || '—'}</span>
                    <span class="imp">${h(e.type || '')}${e.type && e.weight ? ' · ' : ''}${h(e.weight || '')}</span>
                </div>
            </div>`;
        }).join(''));
    }

    function getCharName(c) {
        return typeof c === 'string' ? c : c.name;
    }

    function hideRelationTooltip() {
        if (activeRelationTooltip) {
            activeRelationTooltip.remove();
            activeRelationTooltip = null;
        }
    }

    function showRelationTooltip(from, to, fromLabel, toLabel, fromTrend, toTrend, x, y, container) {
        hideRelationTooltip();
        const tip = document.createElement('div');
        const mobile = innerWidth <= 768;
        const fc = TREND_COLORS[fromTrend] || '#888';
        const tc = TREND_COLORS[toTrend] || '#888';

        setHtml(tip, `<div style="line-height:1.8">
            ${fromLabel ? `<div><small>${h(from)}→${h(to)}：</small> <span style="color:${fc}">${h(fromLabel)}</span> <span style="font-size:10px;color:${fc}">[${h(fromTrend)}]</span></div>` : ''}
            ${toLabel ? `<div><small>${h(to)}→${h(from)}：</small> <span style="color:${tc}">${h(toLabel)}</span> <span style="font-size:10px;color:${tc}">[${h(toTrend)}]</span></div>` : ''}
        </div>`);

        tip.style.cssText = mobile
            ? 'position:absolute;left:8px;bottom:8px;background:#fff;color:#333;padding:10px 14px;border:1px solid #ddd;border-radius:6px;font-size:12px;z-index:100;box-shadow:0 2px 12px rgba(0,0,0,.15);max-width:calc(100% - 16px)'
            : `position:absolute;left:${Math.max(80, Math.min(x, container.clientWidth - 80))}px;top:${Math.max(60, y)}px;transform:translate(-50%,-100%);background:#fff;color:#333;padding:10px 16px;border:1px solid #ddd;border-radius:6px;font-size:12px;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,.15);max-width:280px`;

        container.style.position = 'relative';
        container.appendChild(tip);
        activeRelationTooltip = tip;
    }

    function renderRelations(data) {
        summaryData.characters = data || { main: [], relationships: [] };
        const dom = $('relation-chart');
        if (!relationChart) relationChart = echarts.init(dom);

        const rels = data?.relationships || [];
        const allNames = new Set((data?.main || []).map(getCharName));
        rels.forEach(r => { if (r.from) allNames.add(r.from); if (r.to) allNames.add(r.to); });

        const degrees = {};
        rels.forEach(r => {
            degrees[r.from] = (degrees[r.from] || 0) + 1;
            degrees[r.to] = (degrees[r.to] || 0) + 1;
        });

        const nodeColors = { main: '#d87a7a', sec: '#f1c3c3', ter: '#888888', qua: '#b8b8b8' };
        const sortedDegs = Object.values(degrees).sort((a, b) => b - a);
        const getPercentile = deg => {
            if (!sortedDegs.length || deg === 0) return 100;
            const rank = sortedDegs.filter(d => d > deg).length;
            return (rank / sortedDegs.length) * 100;
        };

        allNodes = Array.from(allNames).map(name => {
            const deg = degrees[name] || 0;
            const pct = getPercentile(deg);
            let col, fontWeight;
            if (pct < 30) { col = nodeColors.main; fontWeight = '600'; }
            else if (pct < 60) { col = nodeColors.sec; fontWeight = '500'; }
            else if (pct < 90) { col = nodeColors.ter; fontWeight = '400'; }
            else { col = nodeColors.qua; fontWeight = '400'; }
            return {
                id: name, name, symbol: 'circle',
                symbolSize: Math.min(36, Math.max(16, deg * 3 + 12)),
                draggable: true,
                itemStyle: { color: col, borderColor: '#fff', borderWidth: 2, shadowColor: 'rgba(0,0,0,.1)', shadowBlur: 6, shadowOffsetY: 2 },
                label: { show: true, position: 'right', distance: 5, color: '#333', fontSize: 11, fontWeight },
                degree: deg
            };
        });

        const relMap = new Map();
        rels.forEach(r => {
            const k = [r.from, r.to].sort().join('|||');
            if (!relMap.has(k)) relMap.set(k, { from: r.from, to: r.to, fromLabel: '', toLabel: '', fromTrend: '', toTrend: '' });
            const e = relMap.get(k);
            if (r.from === e.from) { e.fromLabel = r.label || r.type || ''; e.fromTrend = r.trend || ''; }
            else { e.toLabel = r.label || r.type || ''; e.toTrend = r.trend || ''; }
        });

        allLinks = Array.from(relMap.values()).map(r => {
            const fc = TREND_COLORS[r.fromTrend] || '#b8b8b8';
            const tc = TREND_COLORS[r.toTrend] || '#b8b8b8';
            return {
                source: r.from, target: r.to, fromName: r.from, toName: r.to,
                fromLabel: r.fromLabel, toLabel: r.toLabel, fromTrend: r.fromTrend, toTrend: r.toTrend,
                lineStyle: { width: 1, color: '#d8d8d8', curveness: 0, opacity: 1 },
                label: {
                    show: true, position: 'middle', distance: 0,
                    formatter: '{a|◀}{b|▶}',
                    rich: { a: { color: fc, fontSize: 10 }, b: { color: tc, fontSize: 10 } },
                    align: 'center', verticalAlign: 'middle', offset: [0, -0.1]
                },
                emphasis: { lineStyle: { width: 1.5, color: '#aaa' }, label: { fontSize: 11 } }
            };
        });

        if (!allNodes.length) { relationChart.clear(); return; }

        const updateChart = (nodes, links, focusId = null) => {
            const fadeOpacity = 0.2;
            const processedNodes = focusId ? nodes.map(n => {
                const rl = links.filter(l => l.source === focusId || l.target === focusId);
                const rn = new Set([focusId]);
                rl.forEach(l => { rn.add(l.source); rn.add(l.target); });
                const isRelated = rn.has(n.id);
                return { ...n, itemStyle: { ...n.itemStyle, opacity: isRelated ? 1 : fadeOpacity }, label: { ...n.label, opacity: isRelated ? 1 : fadeOpacity } };
            }) : nodes;

            const processedLinks = focusId ? links.map(l => {
                const isRelated = l.source === focusId || l.target === focusId;
                return { ...l, lineStyle: { ...l.lineStyle, opacity: isRelated ? 1 : fadeOpacity }, label: { ...l.label, opacity: isRelated ? 1 : fadeOpacity } };
            }) : links;

            relationChart.setOption({
                backgroundColor: 'transparent',
                tooltip: { show: false },
                hoverLayerThreshold: Infinity,
                series: [{
                    type: 'graph', layout: 'force', roam: true, draggable: true,
                    animation: true, animationDuration: 800, animationDurationUpdate: 300, animationEasingUpdate: 'cubicInOut',
                    progressive: 0, hoverAnimation: false,
                    data: processedNodes, links: processedLinks,
                    force: { initLayout: 'circular', repulsion: 350, edgeLength: [80, 160], gravity: .12, friction: .6, layoutAnimation: true },
                    label: { show: true }, edgeLabel: { show: true, position: 'middle' },
                    emphasis: { disabled: true }
                }]
            });
        };

        updateChart(allNodes, allLinks);
        setTimeout(() => relationChart.resize(), 0);

        relationChart.off('click');
        relationChart.on('click', p => {
            if (p.dataType === 'node') {
                hideRelationTooltip();
                const id = p.data.id;
                selectCharacter(id);
                updateChart(allNodes, allLinks, id);
            } else if (p.dataType === 'edge') {
                const d = p.data;
                const e = p.event?.event;
                if (e) {
                    const rect = dom.getBoundingClientRect();
                    showRelationTooltip(d.fromName, d.toName, d.fromLabel, d.toLabel, d.fromTrend, d.toTrend,
                        e.offsetX || (e.clientX - rect.left), e.offsetY || (e.clientY - rect.top), dom);
                }
            }
        });

        relationChart.getZr().on('click', p => {
            if (!p.target) {
                hideRelationTooltip();
                updateChart(allNodes, allLinks);
            }
        });
    }

    function selectCharacter(id) {
        currentCharacterId = id;
        const txt = $('sel-char-text');
        const opts = $('char-sel-opts');
        if (opts && id) {
            opts.querySelectorAll('.sel-opt').forEach(o => {
                if (o.dataset.value === id) {
                    o.classList.add('sel');
                    if (txt) txt.textContent = o.textContent;
                } else {
                    o.classList.remove('sel');
                }
            });
        } else if (!id && txt) {
            txt.textContent = '选择角色';
        }
        renderCharacterProfile();
        if (relationChart && id) {
            const opt = relationChart.getOption();
            const idx = opt?.series?.[0]?.data?.findIndex(n => n.id === id || n.name === id);
            if (idx >= 0) relationChart.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: idx });
        }
    }

    function updateCharacterSelector(arcs) {
        const opts = $('char-sel-opts');
        const txt = $('sel-char-text');
        if (!opts) return;
        if (!arcs?.length) {
            setHtml(opts, '<div class="sel-opt" data-value="">暂无角色</div>');
            if (txt) txt.textContent = '暂无角色';
            currentCharacterId = null;
            return;
        }
        setHtml(opts, arcs.map(a => `<div class="sel-opt" data-value="${h(a.id || a.name)}">${h(a.name || '角色')}</div>`).join(''));
        opts.querySelectorAll('.sel-opt').forEach(o => {
            o.onclick = e => {
                e.stopPropagation();
                if (o.dataset.value) {
                    selectCharacter(o.dataset.value);
                    $('char-sel').classList.remove('open');
                }
            };
        });
        if (currentCharacterId && arcs.some(a => (a.id || a.name) === currentCharacterId)) {
            selectCharacter(currentCharacterId);
        } else if (arcs.length) {
            selectCharacter(arcs[0].id || arcs[0].name);
        }
    }

    function renderCharacterProfile() {
        const c = $('profile-content');
        const arcs = summaryData.arcs || [];
        const rels = summaryData.characters?.relationships || [];

        if (!currentCharacterId || !arcs.length) {
            setHtml(c, '<div class="empty">暂无角色数据</div>');
            return;
        }

        const arc = arcs.find(a => (a.id || a.name) === currentCharacterId);
        if (!arc) {
            setHtml(c, '<div class="empty">未找到角色数据</div>');
            return;
        }

        const name = arc.name || '角色';
        const moments = (arc.moments || arc.beats || []).map(m => typeof m === 'string' ? m : m.text);
        const outRels = rels.filter(r => r.from === name);
        const inRels = rels.filter(r => r.to === name);

        setHtml(c, `
            <div class="prof-arc">
                <div>
                    <div class="prof-name">${h(name)}</div>
                    <div class="prof-traj">${h(arc.trajectory || arc.phase || '')}</div>
                </div>
                <div class="prof-prog-wrap">
                    <div class="prof-prog-lbl">
                        <span>弧光进度</span>
                        <span>${Math.round((arc.progress || 0) * 100)}%</span>
                    </div>
                    <div class="prof-prog">
                        <div class="prof-prog-inner" style="width:${(arc.progress || 0) * 100}%"></div>
                    </div>
                </div>
                ${moments.length ? `
                    <div class="prof-moments">
                        <div class="prof-moments-title">关键时刻</div>
                        ${moments.map(m => `<div class="prof-moment">${h(m)}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="prof-rels">
                <div class="rels-group">
                    <div class="rels-group-title">${h(name)}对别人的羁绊：</div>
                    ${outRels.length ? outRels.map(r => `
                        <div class="rel-item">
                            <span class="rel-target">对${h(r.to)}：</span>
                            <span class="rel-label">${h(r.label || '—')}</span>
                            ${r.trend ? `<span class="rel-trend ${TREND_CLASS[r.trend] || ''}">${h(r.trend)}</span>` : ''}
                        </div>
                    `).join('') : '<div class="empty" style="padding:16px">暂无关系记录</div>'}
                </div>
                <div class="rels-group">
                    <div class="rels-group-title">别人对${h(name)}的羁绊：</div>
                    ${inRels.length ? inRels.map(r => `
                        <div class="rel-item">
                            <span class="rel-target">${h(r.from)}：</span>
                            <span class="rel-label">${h(r.label || '—')}</span>
                            ${r.trend ? `<span class="rel-trend ${TREND_CLASS[r.trend] || ''}">${h(r.trend)}</span>` : ''}
                        </div>
                    `).join('') : '<div class="empty" style="padding:16px">暂无关系记录</div>'}
                </div>
            </div>
        `);
    }

    function renderArcs(arcs) {
        summaryData.arcs = arcs || [];
        updateCharacterSelector(arcs || []);
        renderCharacterProfile();
    }

    function updateStats(s) {
        if (!s) return;
        $('stat-summarized').textContent = s.summarizedUpTo ?? 0;
        $('stat-events').textContent = s.eventsCount ?? 0;
        const p = s.pendingFloors ?? 0;
        $('stat-pending').textContent = p;
        $('pending-warning').classList.toggle('hidden', p !== -1);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Modals
    // ═══════════════════════════════════════════════════════════════════════════

    function openRelationsFullscreen() {
        $('rel-fs-modal').classList.add('active');
        const dom = $('relation-chart-fullscreen');
        if (!relationChartFullscreen) relationChartFullscreen = echarts.init(dom);

        if (!allNodes.length) {
            relationChartFullscreen.clear();
            return;
        }

        relationChartFullscreen.setOption({
            tooltip: { show: false },
            hoverLayerThreshold: Infinity,
            series: [{
                type: 'graph', layout: 'force', roam: true, draggable: true,
                animation: true, animationDuration: 800, animationDurationUpdate: 300, animationEasingUpdate: 'cubicInOut',
                progressive: 0, hoverAnimation: false,
                data: allNodes.map(n => ({
                    ...n,
                    symbolSize: Array.isArray(n.symbolSize) ? [n.symbolSize[0] * 1.3, n.symbolSize[1] * 1.3] : n.symbolSize * 1.3,
                    label: { ...n.label, fontSize: 14 }
                })),
                links: allLinks.map(l => ({ ...l, label: { ...l.label, fontSize: 18 } })),
                force: { repulsion: 700, edgeLength: [150, 280], gravity: .06, friction: .6, layoutAnimation: true },
                label: { show: true }, edgeLabel: { show: true, position: 'middle' },
                emphasis: { disabled: true }
            }]
        });

        setTimeout(() => relationChartFullscreen.resize(), 100);
        postMsg('FULLSCREEN_OPENED');
    }

    function closeRelationsFullscreen() {
        $('rel-fs-modal').classList.remove('active');
        postMsg('FULLSCREEN_CLOSED');
    }

    /**
     * 显示通用确认弹窗
     * @returns {Promise<boolean>}
     */
    function showConfirm(title, message, okText = '执行', cancelText = '取消') {
        return new Promise(resolve => {
            const modal = $('confirm-modal');
            const titleEl = $('confirm-title');
            const msgEl = $('confirm-message');
            const inputWrap = $('confirm-input-wrap');
            const inputEl = $('confirm-input');
            const okBtn = $('confirm-ok');
            const cancelBtn = $('confirm-cancel');
            const closeBtn = $('confirm-close');
            const backdrop = $('confirm-backdrop');

            titleEl.textContent = title;
            msgEl.textContent = message;
            inputWrap.classList.add('hidden');
            inputEl.value = '';
            okBtn.textContent = okText;
            cancelBtn.textContent = cancelText;

            const close = (result) => {
                modal.classList.remove('active');
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                closeBtn.onclick = null;
                backdrop.onclick = null;
                resolve(result);
            };

            okBtn.onclick = () => close(true);
            cancelBtn.onclick = () => close(false);
            closeBtn.onclick = () => close(false);
            backdrop.onclick = () => close(false);

            modal.classList.add('active');
        });
    }

    function showConfirmInput(title, message, okText = '执行', cancelText = '取消', placeholder = '') {
        return new Promise(resolve => {
            const modal = $('confirm-modal');
            const titleEl = $('confirm-title');
            const msgEl = $('confirm-message');
            const inputWrap = $('confirm-input-wrap');
            const inputEl = $('confirm-input');
            const okBtn = $('confirm-ok');
            const cancelBtn = $('confirm-cancel');
            const closeBtn = $('confirm-close');
            const backdrop = $('confirm-backdrop');

            titleEl.textContent = title;
            msgEl.textContent = message;
            inputWrap.classList.remove('hidden');
            inputEl.placeholder = placeholder || '';
            inputEl.value = '';
            okBtn.textContent = okText;
            cancelBtn.textContent = cancelText;

            const close = (result) => {
                modal.classList.remove('active');
                inputWrap.classList.add('hidden');
                inputEl.value = '';
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                closeBtn.onclick = null;
                backdrop.onclick = null;
                resolve(result);
            };

            okBtn.onclick = () => close(inputEl.value);
            cancelBtn.onclick = () => close(null);
            closeBtn.onclick = () => close(null);
            backdrop.onclick = () => close(null);

            modal.classList.add('active');
            setTimeout(() => inputEl.focus(), 0);
        });
    }

    function renderArcsEditor(arcs) {
        const list = arcs?.length ? arcs : [{ name: '', trajectory: '', progress: 0, moments: [] }];
        const es = $('editor-struct');

        setHtml(es, `
            <div id="arc-list">
                ${list.map((a, i) => `
                    <div class="struct-item arc-item" data-index="${i}">
                        <div class="struct-row"><input type="text" class="arc-name" placeholder="角色名" value="${h(a.name || '')}"></div>
                        <div class="struct-row"><textarea class="arc-trajectory" rows="2" placeholder="当前状态描述">${h(a.trajectory || '')}</textarea></div>
                        <div class="struct-row">
                            <label style="font-size:.75rem;color:var(--txt3)">进度：<input type="number" class="arc-progress" min="0" max="100" value="${Math.round((a.progress || 0) * 100)}" style="width:64px;display:inline-block"> %</label>
                        </div>
                        <div class="struct-row"><textarea class="arc-moments" rows="3" placeholder="关键时刻，一行一个">${h((a.moments || []).map(m => typeof m === 'string' ? m : m.text).join('\n'))}</textarea></div>
                        <div class="struct-actions"><span>角色弧光 ${i + 1}</span></div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top:8px"><button type="button" class="btn btn-sm" id="arc-add">＋ 新增角色弧光</button></div>
        `);

        es.querySelectorAll('.arc-item').forEach(addDeleteHandler);

        $('arc-add').onclick = () => {
            const listEl = $('arc-list');
            const idx = listEl.querySelectorAll('.arc-item').length;
            const div = document.createElement('div');
            div.className = 'struct-item arc-item';
            div.dataset.index = idx;
            setHtml(div, `
                <div class="struct-row"><input type="text" class="arc-name" placeholder="角色名"></div>
                <div class="struct-row"><textarea class="arc-trajectory" rows="2" placeholder="当前状态描述"></textarea></div>
                <div class="struct-row">
                    <label style="font-size:.75rem;color:var(--txt3)">进度：<input type="number" class="arc-progress" min="0" max="100" value="0" style="width:64px;display:inline-block"> %</label>
                </div>
                <div class="struct-row"><textarea class="arc-moments" rows="3" placeholder="关键时刻，一行一个"></textarea></div>
                <div class="struct-actions"><span>角色弧光 ${idx + 1}</span></div>
            `);
            addDeleteHandler(div);
            listEl.appendChild(div);
        };
    }


    function setRecallLog(text) {
        lastRecallLogText = text || '';
        updateRecallLogDisplay();
    }

    function updateRecallLogDisplay() {
        const content = $('recall-log-content');
        if (!content) return;

        if (lastRecallLogText) {
            content.textContent = lastRecallLogText;
            content.classList.remove('recall-empty');
        } else {
            setHtml(content, `<div class="recall-empty">
            暂无召回日志<br><br>
            当 AI 生成回复时，系统会自动进行记忆召回。<br><br>
            召回日志将显示：<br>
            • [L0] Query Understanding - 意图识别<br>
            • [L1] Constraints - 硬约束注入<br>
            • [L2] Narrative Retrieval - 事件召回<br>
            • [L3] Evidence Assembly - 证据装配<br>
            • [L4] Prompt Formatting - 格式化<br>
            • [Budget] Token 预算使用情况<br>
            • [Quality] 质量指标与潜在问题
        </div>`);
        }
    }


    // ═══════════════════════════════════════════════════════════════════════════
    // Editor
    // ═══════════════════════════════════════════════════════════════════════════

    function preserveAddedAt(n, o) {
        if (o?._addedAt != null) n._addedAt = o._addedAt;
        return n;
    }

    function createDelBtn() {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn btn-sm btn-del';
        b.textContent = '删除';
        return b;
    }

    function addDeleteHandler(item) {
        const del = createDelBtn();
        (item.querySelector('.struct-actions') || item).appendChild(del);
        del.onclick = () => item.remove();
    }

    function renderEventsEditor(events) {
        const list = events?.length ? events : [{ id: 'evt-1', title: '', timeLabel: '', summary: '', participants: [], type: '日常', weight: '点睛' }];
        let maxId = 0;
        list.forEach(e => {
            const m = e.id?.match(/evt-(\d+)/);
            if (m) maxId = Math.max(maxId, +m[1]);
        });

        const es = $('editor-struct');
        setHtml(es, list.map(ev => {
            const id = ev.id || `evt-${++maxId}`;
            return `<div class="struct-item event-item" data-id="${h(id)}">
                <div class="struct-row">
                    <input type="text" class="event-title" placeholder="事件标题" value="${h(ev.title || '')}">
                    <input type="text" class="event-time" placeholder="时间标签" value="${h(ev.timeLabel || '')}">
                </div>
                <div class="struct-row">
                    <textarea class="event-summary" rows="2" placeholder="一句话描述">${h(ev.summary || '')}</textarea>
                </div>
                <div class="struct-row">
                    <input type="text" class="event-participants" placeholder="人物（顿号分隔）" value="${h((ev.participants || []).join('、'))}">
                </div>
                <div class="struct-row">
                    <select class="event-type">${['相遇', '冲突', '揭示', '抉择', '羁绊', '转变', '收束', '日常'].map(t => `<option ${ev.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
                    <select class="event-weight">${['核心', '主线', '转折', '点睛', '氛围'].map(t => `<option ${ev.weight === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
                </div>
                <div class="struct-actions"><span>ID：${h(id)}</span></div>
            </div>`;
        }).join('') + '<div style="margin-top:8px"><button type="button" class="btn btn-sm" id="event-add">＋ 新增事件</button></div>');

        es.querySelectorAll('.event-item').forEach(addDeleteHandler);

        $('event-add').onclick = () => {
            let nmax = maxId;
            es.querySelectorAll('.event-item').forEach(it => {
                const m = it.dataset.id?.match(/evt-(\d+)/);
                if (m) nmax = Math.max(nmax, +m[1]);
            });
            const nid = `evt-${nmax + 1}`;
            const div = document.createElement('div');
            div.className = 'struct-item event-item';
            div.dataset.id = nid;
            setHtml(div, `
                <div class="struct-row"><input type="text" class="event-title" placeholder="事件标题"><input type="text" class="event-time" placeholder="时间标签"></div>
                <div class="struct-row"><textarea class="event-summary" rows="2" placeholder="一句话描述"></textarea></div>
                <div class="struct-row"><input type="text" class="event-participants" placeholder="人物（顿号分隔）"></div>
                <div class="struct-row">
                    <select class="event-type">${['相遇', '冲突', '揭示', '抉择', '羁绊', '转变', '收束', '日常'].map(t => `<option>${t}</option>`).join('')}</select>
                    <select class="event-weight">${['核心', '主线', '转折', '点睛', '氛围'].map(t => `<option>${t}</option>`).join('')}</select>
                </div>
                <div class="struct-actions"><span>ID：${h(nid)}</span></div>
            `);
            addDeleteHandler(div);
            es.insertBefore(div, $('event-add').parentElement);
        };
    }

    function renderCharactersEditor(data) {
        const d = data || { main: [], relationships: [] };
        const main = (d.main || []).map(getCharName);
        const rels = d.relationships || [];
        const trendOpts = ['破裂', '厌恶', '反感', '陌生', '投缘', '亲密', '交融'];

        const es = $('editor-struct');
        setHtml(es, `
            <div class="struct-item">
                <div class="struct-row"><strong>角色列表</strong></div>
                <div id="char-main-list">
                    ${(main.length ? main : ['']).map(n => `<div class="struct-row char-main-item"><input type="text" class="char-main-name" placeholder="角色名" value="${h(n || '')}"></div>`).join('')}
                </div>
                <div style="margin-top:8px"><button type="button" class="btn btn-sm" id="char-main-add">＋ 新增角色</button></div>
            </div>
            <div class="struct-item">
                <div class="struct-row"><strong>人物关系</strong></div>
                <div id="char-rel-list">
                    ${(rels.length ? rels : [{ from: '', to: '', label: '', trend: '陌生' }]).map(r => `
                        <div class="struct-row char-rel-item">
                            <input type="text" class="char-rel-from" placeholder="角色 A" value="${h(r.from || '')}">
                            <input type="text" class="char-rel-to" placeholder="角色 B" value="${h(r.to || '')}">
                            <input type="text" class="char-rel-label" placeholder="关系" value="${h(r.label || '')}">
                            <select class="char-rel-trend">${trendOpts.map(t => `<option ${r.trend === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top:8px"><button type="button" class="btn btn-sm" id="char-rel-add">＋ 新增关系</button></div>
            </div>
        `);

        es.querySelectorAll('.char-main-item,.char-rel-item').forEach(addDeleteHandler);

        $('char-main-add').onclick = () => {
            const div = document.createElement('div');
            div.className = 'struct-row char-main-item';
            setHtml(div, '<input type="text" class="char-main-name" placeholder="角色名">');
            addDeleteHandler(div);
            $('char-main-list').appendChild(div);
        };

        $('char-rel-add').onclick = () => {
            const div = document.createElement('div');
            div.className = 'struct-row char-rel-item';
            setHtml(div, `
                <input type="text" class="char-rel-from" placeholder="角色 A">
                <input type="text" class="char-rel-to" placeholder="角色 B">
                <input type="text" class="char-rel-label" placeholder="关系">
                <select class="char-rel-trend">${trendOpts.map(t => `<option>${t}</option>`).join('')}</select>
            `);
            addDeleteHandler(div);
            $('char-rel-list').appendChild(div);
        };
    }

    function openEditor(section) {
        currentEditSection = section;
        const meta = SECTION_META[section];
        const es = $('editor-struct');
        const ta = $('editor-ta');

        $('editor-title').textContent = meta.title;
        $('editor-hint').textContent = meta.hint;
        $('editor-err').classList.remove('visible');
        $('editor-err').textContent = '';
        es.classList.add('hidden');
        ta.classList.remove('hidden');

        if (section === 'keywords') {
            ta.value = summaryData.keywords.map(k => `${k.text}|${k.weight || '一般'}`).join('\n');
        } else if (section === 'facts') {
            ta.value = (summaryData.facts || [])
                .filter(f => !f.retracted)
                .map(f => {
                    const parts = [f.s, f.p, f.o];
                    if (f.trend) parts.push(f.trend);
                    return parts.join('|');
                })
                .join('\n');
        } else {
            ta.classList.add('hidden');
            es.classList.remove('hidden');
            if (section === 'events') renderEventsEditor(summaryData.events || []);
            else if (section === 'characters') renderCharactersEditor(summaryData.characters || { main: [], relationships: [] });
            else if (section === 'arcs') renderArcsEditor(summaryData.arcs || []);
        }

        $('editor-modal').classList.add('active');
        postMsg('EDITOR_OPENED');
    }

    function closeEditor() {
        $('editor-modal').classList.remove('active');
        currentEditSection = null;
        postMsg('EDITOR_CLOSED');
    }

    function saveEditor() {
        const section = currentEditSection;
        const es = $('editor-struct');
        const ta = $('editor-ta');
        let parsed;

        try {
            if (section === 'keywords') {
                const oldMap = new Map((summaryData.keywords || []).map(k => [k.text, k]));
                parsed = ta.value.trim().split('\n').filter(l => l.trim()).map(line => {
                    const [text, weight] = line.split('|').map(s => s.trim());
                    return preserveAddedAt({ text: text || '', weight: weight || '一般' }, oldMap.get(text));
                });
            } else if (section === 'events') {
                const oldMap = new Map((summaryData.events || []).map(e => [e.id, e]));
                parsed = Array.from(es.querySelectorAll('.event-item')).map(it => {
                    const id = it.dataset.id;
                    return preserveAddedAt({
                        id,
                        title: it.querySelector('.event-title').value.trim(),
                        timeLabel: it.querySelector('.event-time').value.trim(),
                        summary: it.querySelector('.event-summary').value.trim(),
                        participants: it.querySelector('.event-participants').value.trim().split(/[,、，]/).map(s => s.trim()).filter(Boolean),
                        type: it.querySelector('.event-type').value,
                        weight: it.querySelector('.event-weight').value
                    }, oldMap.get(id));
                }).filter(e => e.title || e.summary);
            } else if (section === 'characters') {
                const oldMainMap = new Map((summaryData.characters?.main || []).map(m => [getCharName(m), m]));
                const mainNames = Array.from(es.querySelectorAll('.char-main-name')).map(i => i.value.trim()).filter(Boolean);
                const main = mainNames.map(n => preserveAddedAt({ name: n }, oldMainMap.get(n)));

                const oldRelMap = new Map((summaryData.characters?.relationships || []).map(r => [`${r.from}->${r.to}`, r]));
                const rels = Array.from(es.querySelectorAll('.char-rel-item')).map(it => {
                    const from = it.querySelector('.char-rel-from').value.trim();
                    const to = it.querySelector('.char-rel-to').value.trim();
                    return preserveAddedAt({
                        from, to,
                        label: it.querySelector('.char-rel-label').value.trim(),
                        trend: it.querySelector('.char-rel-trend').value
                    }, oldRelMap.get(`${from}->${to}`));
                }).filter(r => r.from && r.to);

                parsed = { main, relationships: rels };
            } else if (section === 'arcs') {
                const oldArcMap = new Map((summaryData.arcs || []).map(a => [a.name, a]));
                parsed = Array.from(es.querySelectorAll('.arc-item')).map(it => {
                    const name = it.querySelector('.arc-name').value.trim();
                    const oldArc = oldArcMap.get(name);
                    const oldMomentMap = new Map((oldArc?.moments || []).map(m => [typeof m === 'string' ? m : m.text, m]));
                    const momentsRaw = it.querySelector('.arc-moments').value.trim();
                    const moments = momentsRaw ? momentsRaw.split('\n').map(s => s.trim()).filter(Boolean).map(t => preserveAddedAt({ text: t }, oldMomentMap.get(t))) : [];
                    return preserveAddedAt({
                        name,
                        trajectory: it.querySelector('.arc-trajectory').value.trim(),
                        progress: Math.max(0, Math.min(1, (parseFloat(it.querySelector('.arc-progress').value) || 0) / 100)),
                        moments
                    }, oldArc);
                }).filter(a => a.name || a.trajectory || a.moments?.length);
            } else if (section === 'facts') {
                const oldMap = new Map((summaryData.facts || []).map(f => [`${f.s}::${f.p}`, f]));
                parsed = ta.value
                    .split('\n')
                    .map(l => l.trim())
                    .filter(Boolean)
                    .map(line => {
                        const parts = line.split('|').map(s => s.trim());
                        const s = parts[0];
                        const p = parts[1];
                        const o = parts[2];
                        const trend = parts[3];
                        if (!s || !p) return null;
                        if (!o) return null;
                        const key = `${s}::${p}`;
                        const old = oldMap.get(key);
                        const fact = {
                            id: old?.id || `f-${Date.now()}`,
                            s, p, o,
                            since: old?.since ?? 0,
                            _addedAt: old?._addedAt ?? 0,
                        };
                        if (/^对.+的/.test(p) && trend) {
                            fact.trend = trend;
                        }
                        return fact;
                    })
                    .filter(Boolean);
            }
        } catch (e) {
            $('editor-err').textContent = `格式错误: ${e.message}`;
            $('editor-err').classList.add('visible');
            return;
        }

        postMsg('UPDATE_SECTION', { section, data: parsed });

        if (section === 'keywords') renderKeywords(parsed);
        else if (section === 'events') { renderTimeline(parsed); $('stat-events').textContent = parsed.length; }
        else if (section === 'characters') renderRelations(parsed);
        else if (section === 'arcs') renderArcs(parsed);
        else if (section === 'facts') renderFacts(parsed);

        closeEditor();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Message Handler
    // ═══════════════════════════════════════════════════════════════════════════

    function handleParentMessage(e) {
        if (e.origin !== PARENT_ORIGIN || e.source !== window.parent) return;

        const d = e.data;
        if (!d || d.source !== 'LittleWhiteBox') return;

        const btn = $('btn-generate');

        switch (d.type) {
            case 'GENERATION_STATE':
                localGenerating = !!d.isGenerating;
                btn.textContent = localGenerating ? '停止' : '总结';
                break;

            case 'SUMMARY_BASE_DATA':
                if (d.stats) {
                    updateStats(d.stats);
                    $('summarized-count').textContent = d.stats.hiddenCount ?? 0;
                }
                if (d.hideSummarized !== undefined) $('hide-summarized').checked = d.hideSummarized;
                if (d.keepVisibleCount !== undefined) $('keep-visible-count').value = d.keepVisibleCount;
                break;

            case 'SUMMARY_FULL_DATA':
                if (d.payload) {
                    const p = d.payload;
                    if (p.keywords) renderKeywords(p.keywords);
                    if (p.events) renderTimeline(p.events);
                    if (p.characters) renderRelations(p.characters);
                    if (p.arcs) renderArcs(p.arcs);
                    if (p.facts) renderFacts(p.facts);
                    $('stat-events').textContent = p.events?.length || 0;
                    if (p.lastSummarizedMesId != null) $('stat-summarized').textContent = p.lastSummarizedMesId + 1;
                    if (p.stats) updateStats(p.stats);
                }
                break;

            case 'SUMMARY_ERROR':
                console.error('Summary error:', d.message);
                break;

            case 'SUMMARY_CLEARED': {
                const t = d.payload?.totalFloors || 0;
                $('stat-events').textContent = 0;
                $('stat-summarized').textContent = 0;
                $('stat-pending').textContent = t;
                $('summarized-count').textContent = 0;
                summaryData = { keywords: [], events: [], characters: { main: [], relationships: [] }, arcs: [], facts: [] };
                renderKeywords([]);
                renderTimeline([]);
                renderRelations(null);
                renderArcs([]);
                renderFacts([]);
                break;
            }

            case 'LOAD_PANEL_CONFIG':
                if (d.config) applyConfig(d.config);
                break;

            case 'VECTOR_CONFIG':
                if (d.config) loadVectorConfig(d.config);
                break;

            case 'VECTOR_ONLINE_STATUS':
                updateVectorOnlineStatus(d.target, d.status, d.message);
                break;

            case 'VECTOR_STATS':
                updateVectorStats(d.stats);
                if (d.mismatch !== undefined) showVectorMismatchWarning(d.mismatch);
                break;

            case 'ANCHOR_STATS':
                updateAnchorStats(d.stats || {});
                break;

            case 'ANCHOR_GEN_PROGRESS':
                updateAnchorProgress(d.current, d.total, d.message);
                break;

            case 'VECTOR_GEN_PROGRESS': {
                const progress = $('vector-gen-progress');
                const btnGen = $('btn-gen-vectors');
                const btnCancel = $('btn-cancel-vectors');
                const btnClear = $('btn-clear-vectors');

                if (d.current < 0) {
                    progress.classList.add('hidden');
                    btnGen.classList.remove('hidden');
                    btnCancel.classList.add('hidden');
                    btnClear.classList.remove('hidden');
                    vectorGenerating = false;
                } else {
                    vectorGenerating = true;
                    progress.classList.remove('hidden');
                    btnGen.classList.add('hidden');
                    btnCancel.classList.remove('hidden');
                    btnClear.classList.add('hidden');

                    const percent = d.total > 0 ? Math.round(d.current / d.total * 100) : 0;
                    progress.querySelector('.progress-inner').style.width = percent + '%';
                    const displayText = d.message || `${d.phase || ''}: ${d.current}/${d.total}`;
                    progress.querySelector('.progress-text').textContent = displayText;
                }
                break;
            }

            case 'VECTOR_EXPORT_RESULT':
                $('btn-export-vectors').disabled = false;
                if (d.success) {
                    $('vector-io-status').textContent = `导出成功: ${d.filename} (${(d.size / 1024 / 1024).toFixed(2)}MB)`;
                } else {
                    $('vector-io-status').textContent = '导出失败: ' + (d.error || '未知错误');
                }
                break;

            case 'SUMMARY_COPY_RESULT':
                $('btn-copy-summary').disabled = false;
                if (d.success) {
                    $('summary-io-status').textContent = `复制成功: ${d.events || 0} 条事件, ${d.facts || 0} 条世界状态`;
                } else {
                    $('summary-io-status').textContent = '复制失败: ' + (d.error || '未知错误');
                }
                break;

            case 'SUMMARY_IMPORT_RESULT':
                $('btn-import-summary').disabled = false;
                if (d.success) {
                    const c = d.counts || {};
                    $('summary-io-status').textContent = `导入成功: ${c.events || 0} 条事件, ${c.facts || 0} 条世界状态，已覆盖当前总结资料并清空向量/锚点，请重新生成向量。`;
                    postMsg('REQUEST_VECTOR_STATS');
                    postMsg('REQUEST_ANCHOR_STATS');
                } else {
                    $('summary-io-status').textContent = '导入失败: ' + (d.error || '未知错误');
                }
                break;

            case 'VECTOR_IMPORT_RESULT':
                $('btn-import-vectors').disabled = false;
                if (d.success) {
                    let msg = `导入成功: ${d.chunkCount} 片段, ${d.eventCount} 事件`;
                    if (d.warnings?.length) {
                        msg += '\n⚠️ ' + d.warnings.join('\n⚠️ ');
                    }
                    $('vector-io-status').textContent = msg;
                    // 刷新统计
                    postMsg('REQUEST_VECTOR_STATS');
                } else {
                    $('vector-io-status').textContent = '导入失败: ' + (d.error || '未知错误');
                }
                break;
            case 'VECTOR_BACKUP_RESULT':
                $('btn-backup-server').disabled = false;
                if (d.success) {
                    $('server-io-status').textContent = `☁️ 备份成功: ${(d.size / 1024 / 1024).toFixed(2)}MB (${d.chunkCount} 片段, ${d.eventCount} 事件)`;
                } else {
                    $('server-io-status').textContent = '备份失败: ' + (d.error || '未知错误');
                }
                break;

            case 'VECTOR_RESTORE_RESULT':
                $('btn-restore-server').disabled = false;
                if (d.success) {
                    let msg = `☁️ 恢复成功: ${d.chunkCount} 片段, ${d.eventCount} 事件`;
                    if (d.warnings?.length) {
                        msg += '\n⚠️ ' + d.warnings.join('\n⚠️ ');
                    }
                    $('server-io-status').textContent = msg;
                    postMsg('REQUEST_VECTOR_STATS');
                } else {
                    $('server-io-status').textContent = '恢复失败: ' + (d.error || '未知错误');
                }
                break;

            case 'RECALL_LOG':
                setRecallLog(d.text || '');
                break;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Event Bindings
    // ═══════════════════════════════════════════════════════════════════════════

    function bindEvents() {
        // Section edit buttons
        $$('.sec-btn[data-section]').forEach(b => b.onclick = () => openEditor(b.dataset.section));

        // Editor modal
        $('editor-backdrop').onclick = closeEditor;
        $('editor-close').onclick = closeEditor;
        $('editor-cancel').onclick = closeEditor;
        $('editor-save').onclick = saveEditor;

        // Settings modal
        $('btn-settings').onclick = openSettings;
        $('settings-backdrop').onclick = () => closeSettings(false);
        $('settings-close').onclick = () => closeSettings(false);
        $('settings-cancel').onclick = () => closeSettings(false);
        $('settings-save').onclick = () => closeSettings(true);

        // Settings tabs
        $$('.settings-tab').forEach(tab => {
            tab.onclick = () => {
                const targetId = tab.dataset.tab;
                if (!targetId) return;

                // Update tab active state
                $$('.settings-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update pane active state
                $$('.tab-pane').forEach(p => p.classList.remove('active'));
                $(targetId).classList.add('active');

                // If switching to debug tab, refresh log
                if (targetId === 'tab-debug') {
                    postMsg('REQUEST_RECALL_LOG');
                }
            };
        });

        // API provider change
        $('api-provider').onchange = e => {
            const pv = PROVIDER_DEFAULTS[e.target.value];
            $('api-url').value = '';
            modelListFetchedThisIframe = false;
            if (!pv.canFetch) config.api.modelCache = [];
            updateProviderUI(e.target.value);
        };

        $('btn-connect').onclick = fetchModels;
        $('api-model-text').oninput = e => { config.api.model = e.target.value.trim(); };
        $('api-model-select').onchange = e => {
            const value = e.target.value || '';
            if (value) {
                $('api-model-text').value = value;
                config.api.model = value;
            }
        };
        $('btn-reset-summary-prompts').onclick = () => {
            $('summary-system-prompt').value = DEFAULT_SUMMARY_SYSTEM_PROMPT;
            $('summary-assistant-doc-prompt').value = DEFAULT_SUMMARY_ASSISTANT_DOC_PROMPT;
            $('summary-assistant-ask-summary-prompt').value = DEFAULT_SUMMARY_ASSISTANT_ASK_SUMMARY_PROMPT;
            $('summary-assistant-ask-content-prompt').value = DEFAULT_SUMMARY_ASSISTANT_ASK_CONTENT_PROMPT;
            $('summary-meta-protocol-start-prompt').value = DEFAULT_SUMMARY_META_PROTOCOL_START_PROMPT;
            $('summary-user-json-format-prompt').value = DEFAULT_SUMMARY_USER_JSON_FORMAT_PROMPT;
            $('summary-assistant-check-prompt').value = DEFAULT_SUMMARY_ASSISTANT_CHECK_PROMPT;
            $('summary-user-confirm-prompt').value = DEFAULT_SUMMARY_USER_CONFIRM_PROMPT;
            $('summary-assistant-prefill-prompt').value = DEFAULT_SUMMARY_ASSISTANT_PREFILL_PROMPT;
        };
        $('btn-reset-memory-prompt-template').onclick = () => {
            $('memory-prompt-template').value = DEFAULT_MEMORY_PROMPT_TEMPLATE;
        };

        // Trigger timing
        $('trigger-timing').onchange = e => {
            const en = $('trigger-enabled');
            if (e.target.value === 'manual') {
                en.checked = false;
                en.disabled = true;
                en.parentElement.style.opacity = '.5';
            } else {
                en.disabled = false;
                en.parentElement.style.opacity = '1';
            }
        };

        // 总结间隔范围校验
        $('trigger-interval').onchange = e => {
            let val = parseInt(e.target.value) || 20;
            val = Math.max(1, Math.min(30, val));
            e.target.value = val;
        };

        // Main actions
        $('btn-clear').onclick = async () => {
            if (await showConfirm('清空数据', '确定要清空本聊天的所有总结、关键词及人物关系数据吗？此操作不可撤销。')) {
                postMsg('REQUEST_CLEAR');
            }
        };
        $('btn-generate').onclick = () => {
            const btn = $('btn-generate');
            if (!localGenerating) {
                localGenerating = true;
                btn.textContent = '停止';
                postMsg('REQUEST_GENERATE', { config: { api: config.api, gen: config.gen, trigger: config.trigger } });
            } else {
                localGenerating = false;
                btn.textContent = '总结';
                postMsg('REQUEST_CANCEL');
            }
        };

        // Hide summarized
        $('hide-summarized').onchange = e => postMsg('TOGGLE_HIDE_SUMMARIZED', { enabled: e.target.checked });
        $('keep-visible-count').onchange = e => {
            const parsedCount = Number.parseInt(e.target.value, 10);
            const c = Number.isFinite(parsedCount) ? Math.max(0, Math.min(50, parsedCount)) : 6;
            e.target.value = c;
            postMsg('UPDATE_KEEP_VISIBLE', { count: c });
        };

        // Fullscreen relations
        $('btn-fullscreen-relations').onclick = openRelationsFullscreen;
        $('rel-fs-backdrop').onclick = closeRelationsFullscreen;
        $('rel-fs-close').onclick = closeRelationsFullscreen;

        // HF guide

        // Character selector
        $('char-sel-trigger').onclick = e => {
            e.stopPropagation();
            $('char-sel').classList.toggle('open');
        };

        document.onclick = e => {
            const cs = $('char-sel');
            if (cs && !cs.contains(e.target)) cs.classList.remove('open');
        };

        // Vector UI
        initSummaryIOUI();
        initVectorUI();

        // Gen params collapsible
        const genParamsToggle = $('gen-params-toggle');
        const genParamsContent = $('gen-params-content');
        if (genParamsToggle && genParamsContent) {
            genParamsToggle.onclick = () => {
                const collapse = genParamsToggle.closest('.settings-collapse');
                collapse.classList.toggle('open');
                genParamsContent.classList.toggle('hidden');
            };
        }

        // Filter rules collapsible
        const filterRulesToggle = $('filter-rules-toggle');
        const filterRulesContent = $('filter-rules-content');
        if (filterRulesToggle && filterRulesContent) {
            filterRulesToggle.onclick = () => {
                const collapse = filterRulesToggle.closest('.settings-collapse');
                collapse.classList.toggle('open');
                filterRulesContent.classList.toggle('hidden');
            };
        }

        // Auto summary sub-options toggle
        const triggerEnabled = $('trigger-enabled');
        const autoSummaryOptions = $('auto-summary-options');
        if (triggerEnabled && autoSummaryOptions) {
            triggerEnabled.onchange = () => {
                autoSummaryOptions.classList.toggle('hidden', !triggerEnabled.checked);
            };
        }

        // Force insert sub-options toggle
        const triggerInsertAtEnd = $('trigger-insert-at-end');
        const insertWrapperOptions = $('insert-wrapper-options');
        if (triggerInsertAtEnd && insertWrapperOptions) {
            triggerInsertAtEnd.onchange = () => {
                insertWrapperOptions.classList.toggle('hidden', !triggerInsertAtEnd.checked);
            };
        }


        // Resize
        window.onresize = () => {
            relationChart?.resize();
            relationChartFullscreen?.resize();
        };

        // Parent messages
        window.onmessage = handleParentMessage;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Init
    // ═══════════════════════════════════════════════════════════════════════════

    function init() {
        loadConfig();

        // Initial state
        $('stat-events').textContent = '—';
        $('stat-summarized').textContent = '—';
        $('stat-pending').textContent = '—';
        $('summarized-count').textContent = '0';

        renderKeywords([]);
        renderTimeline([]);
        renderArcs([]);
        renderFacts([]);

        bindEvents();

        // === THEME SWITCHER ===
        (function () {
            const STORAGE_KEY = 'xb-theme-alt';
            const CSS_MAP = { default: 'story-summary.css', dark: 'story-summary.css', neo: 'story-summary-a.css', 'neo-dark': 'story-summary-a.css' };
            const link = document.querySelector('link[rel="stylesheet"]');
            const sel = document.getElementById('theme-select');
            if (!link || !sel) return;

            function applyTheme(theme) {
                if (!CSS_MAP[theme]) return;
                link.setAttribute('href', CSS_MAP[theme]);
                document.documentElement.setAttribute('data-theme', (theme === 'dark' || theme === 'neo-dark') ? 'dark' : '');
            }

            // 启动时恢复主题
            const saved = localStorage.getItem(STORAGE_KEY) || 'default';
            applyTheme(saved);
            sel.value = saved;

            // 下拉框切换
            sel.addEventListener('change', function () {
                const theme = sel.value;
                applyTheme(theme);
                localStorage.setItem(STORAGE_KEY, theme);
                console.log(`[Theme] Switched → ${theme} (${CSS_MAP[theme]})`);
            });
        })();
        // === END THEME SWITCHER ===

        // Notify parent
        postMsg('FRAME_READY');
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }


    function renderFacts(facts) {
        summaryData.facts = facts || [];

        const container = $('facts-list');
        if (!container) return;

        const isRelation = f => /^对.+的/.test(f.p);
        const stateFacts = (facts || []).filter(f => !f.retracted && !isRelation(f));

        if (!stateFacts.length) {
            setHtml(container, '<div class="empty">暂无状态记录</div>');
            return;
        }

        const grouped = new Map();
        for (const f of stateFacts) {
            if (!grouped.has(f.s)) grouped.set(f.s, []);
            grouped.get(f.s).push(f);
        }

        let html = '';
        for (const [subject, items] of grouped) {
            html += `<div class="fact-group">
            <div class="fact-group-title">${h(subject)}</div>
            ${items.map(f => `
                <div class="fact-item">
                    <span class="fact-predicate">${h(f.p)}</span>
                    <span class="fact-object">${h(f.o)}</span>
                    <span class="fact-since">#${(f.since || 0) + 1}</span>
                </div>
            `).join('')}
        </div>`;
        }

        setHtml(container, html);
    }

})();
