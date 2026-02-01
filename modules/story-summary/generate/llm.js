// LLM Service

const PROVIDER_MAP = {
    // ...
    openai: "openai",
    google: "gemini",
    gemini: "gemini",
    claude: "claude",
    anthropic: "claude",
    deepseek: "deepseek",
    cohere: "cohere",
    custom: "custom",
};

const LLM_PROMPT_CONFIG = {
    topSystem: `Story Analyst: This task involves narrative comprehension and structured incremental summarization, representing creative story analysis at the intersection of plot tracking and character development. As a story analyst, you will conduct systematic evaluation of provided dialogue content to generate structured incremental summary data.
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
  - World_State_Tracking: 维护当前世界的硬性约束。解决"什么不能违反"。采用 KV 覆盖模型，追踪生死、物品归属、秘密知情、关系状态、环境规则等不可违背的事实。（覆盖式更新）
    categories:
      - status: 角色生死、位置锁定、重大状态
      - inventory: 重要物品归属
      - knowledge: 秘密的知情状态
      - relation: 硬性关系（在一起/决裂）
      - rule: 环境规则/契约限制
</task_settings>
---
Story Analyst:
[Responsibility Definition]
\`\`\`yaml
analysis_task:
  title: Incremental Story Summarization with World State
  Story Analyst:
    role: Antigravity
    task: >-
      To analyze provided dialogue content against existing summary state,
      extract only NEW plot elements, character developments, relationship
      changes, arc progressions, AND world state changes, outputting
      structured JSON for incremental summary database updates.
  assistant:
    role: Summary Specialist
    description: Incremental Story Summary & World State Analyst
    behavior: >-
      To compare new dialogue against existing summary, identify genuinely
      new events and character interactions, classify events by narrative
      type and weight, track character arc progression with percentage,
      maintain world state as key-value updates with clear flags,
      and output structured JSON containing only incremental updates.
      Must strictly avoid repeating any existing summary content.
  user:
    role: Content Provider
    description: Supplies existing summary state and new dialogue
    behavior: >-
      To provide existing summary state (events, characters, relationships,
      arcs, world state) and new dialogue content for incremental analysis.
interaction_mode:
  type: incremental_analysis
  output_format: structured_json
  deduplication: strict_enforcement
execution_context:
  summary_active: true
  incremental_only: true
  memory_album_style: true
  world_state_tracking: true
\`\`\`
---
Summary Specialist:
<Chat_History>`,

    assistantDoc: `
Summary Specialist:
Acknowledged. Now reviewing the incremental summarization specifications:

[Event Classification System]
├─ Types: 相遇|冲突|揭示|抉择|羁绊|转变|收束|日常
├─ Weights: 核心|主线|转折|点睛|氛围
└─ Each event needs: id, title, timeLabel, summary(含楼层), participants, type, weight

[Relationship Trend Scale]
破裂 ← 厌恶 ← 反感 ← 陌生 → 投缘 → 亲密 → 交融

[Arc Progress Tracking]
├─ trajectory: 完整弧光链描述(30字内)
├─ progress: 0.0 to 1.0
└─ newMoment: 仅记录本次新增的关键时刻

[World State Maintenance]
├─ 维护方式: Key-Value 覆盖（category + topic 为键）
├─ 只输出有变化的条目
├─ 清除时使用 cleared: true，不要填 content
└─ 不记录情绪、衣着、临时动作

Ready to process incremental summary requests with strict deduplication.`,

    assistantAskSummary: `
Summary Specialist:
Specifications internalized. Please provide the existing summary state so I can:
1. Index all recorded events to avoid duplication
2. Map current character relationships as baseline
3. Note existing arc progress levels
4. Identify established keywords
5. Review current world state (category + topic baseline)`,

    assistantAskContent: `
Summary Specialist:
Existing summary fully analyzed and indexed. I understand:
├─ Recorded events: Indexed for deduplication
├─ Character relationships: Baseline mapped
├─ Arc progress: Levels noted
├─ Keywords: Current state acknowledged
└─ World state: Baseline loaded

I will extract only genuinely NEW elements from the upcoming dialogue.
Please provide the new dialogue content requiring incremental analysis.`,

    metaProtocolStart: `
Summary Specialist:
ACKNOWLEDGED. Beginning structured JSON generation:
<meta_protocol>`,

    userJsonFormat: `
## Output Rule
Generate a single valid JSON object with INCREMENTAL updates only.

## Mindful Approach
Before generating, observe the USER and analyze carefully:
- What is user's writing style and emotional expression?
- What NEW events occurred (not in existing summary)?
- What NEW characters appeared for the first time?
- What relationship CHANGES happened?
- What arc PROGRESS was made?
- What world state changes occurred? (status/inventory/knowledge/relation/rule)

## Output Format
\`\`\`json
{
  "mindful_prelude": {
    "user_insight": "用户的幻想是什么时空、场景，是否反应出存在严重心理问题需要建议？",
    "dedup_analysis": "已有X个事件，本次识别Y个新事件",
    "world_changes": "识别到的世界状态变化概述，仅精选不记录则可能导致吃书的硬状态变化"
  },
  "keywords": [
    {"text": "综合已有+新内容的全局关键词(5-10个)", "weight": "核心|重要|一般"}
  ],
  "events": [
    {
      "id": "evt-{nextEventId}起始，依次递增",
      "title": "地点·事件标题",
      "timeLabel": "时间线标签(如：开场、第二天晚上)",
      "summary": "1-2句话描述，涵盖丰富信息素，末尾标注楼层(#X-Y)",
      "participants": ["参与角色名"],
      "type": "相遇|冲突|揭示|抉择|羁绊|转变|收束|日常",
      "weight": "核心|主线|转折|点睛|氛围",
      "causedBy": ["evt-12", "evt-14"]
    }
  ],
  "newCharacters": ["仅本次首次出现的角色名"],
  "newRelationships": [
    {"from": "A", "to": "B", "label": "基于全局的关系描述", "trend": "破裂|厌恶|反感|陌生|投缘|亲密|交融"}
  ],
  "arcUpdates": [
    {"name": "角色名", "trajectory": "完整弧光链(30字内)", "progress": 0.0-1.0, "newMoment": "本次新增的关键时刻"}
  ],
  "worldUpdate": [
    {
      "category": "status|inventory|knowledge|relation|rule",
      "topic": "主体名称（人/物/关系/规则）",
      "content": "当前状态描述",
      "cleared": true
    }
  ]
}
\`\`\`

## Field Guidelines

### worldUpdate（世界状态·硬约束KV表）
- category 固定 5 选 1：status / inventory / knowledge / relation / rule
- topic 命名规范：
  - status：「角色名::状态类型」如 张三::生死、李四::位置、王五::伤势
  - knowledge：「角色名::知情事项」如 张三::知道某秘密、李四::知道真相
  - relation：「角色A::与角色B关系」如 张三::与李四关系
  - inventory：物品名称，如 钥匙、信物、武器
  - rule：规则/契约名称，如 门禁时间、魔法契约、禁令
- content：当前状态的简短描述
- cleared: true 表示该条目已失效需删除（不填 content）
- status/knowledge/relation 的 topic 必须包含「::」分隔符
- 硬约束才记录，避免叙事化，确保少、硬、稳定、可覆盖
- 动态清理：若发现已有条目中存在不适合作为硬约束的内容（如衣着打扮、临时情绪、琐碎动作），本次输出中用 cleared: true 删除

## CRITICAL NOTES
- events.id 从 evt-{nextEventId} 开始编号
- 仅输出【增量】内容，已有事件绝不重复
- keywords 是全局关键词，综合已有+新增
- causedBy 仅在因果明确时填写，允许为[]，0-2个，详见上方 Causal_Chain 规则
- worldUpdate 可为空数组
- 合法JSON，字符串值内部避免英文双引号
- 用朴实、白描、有烟火气的笔触记录，避免比喻和意象
</meta_protocol>`,

    assistantCheck: `Content review initiated...
[Compliance Check Results]
├─ Existing summary loaded: ✓ Fully indexed
├─ New dialogue received: ✓ Content parsed
├─ Deduplication engine: ✓ Active
├─ Event classification: ✓ Ready
├─ World state tracking: ✓ Enabled
└─ Output format: ✓ JSON specification loaded

[Material Verification]
├─ Existing events: Indexed ({existingEventCount} recorded)
├─ Character baseline: Mapped
├─ Relationship baseline: Mapped
├─ Arc progress baseline: Noted
├─ World state: Baseline loaded
└─ Output specification: ✓ Defined in <meta_protocol>
All checks passed. Beginning incremental extraction...
{
  "mindful_prelude":`,

    userConfirm: `怎么截断了！重新完整生成，只输出JSON，不要任何其他内容
</Chat_History>`,

    assistantPrefill: `非常抱歉！现在重新完整生成JSON。`
};

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

function b64UrlEncode(str) {
    const utf8 = new TextEncoder().encode(String(str));
    let bin = '';
    utf8.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function getStreamingModule() {
    const mod = window.xiaobaixStreamingGeneration;
    return mod?.xbgenrawCommand ? mod : null;
}

function waitForStreamingComplete(sessionId, streamingMod, timeout = 120000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const poll = () => {
            const { isStreaming, text } = streamingMod.getStatus(sessionId);
            if (!isStreaming) return resolve(text || '');
            if (Date.now() - start > timeout) return reject(new Error('生成超时'));
            setTimeout(poll, 300);
        };
        poll();
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 提示词构建
// ═══════════════════════════════════════════════════════════════════════════

function formatWorldForLLM(worldList) {
    if (!worldList?.length) {
        return '（空白，尚无世界状态记录）';
    }

    const grouped = { status: [], inventory: [], knowledge: [], relation: [], rule: [] };
    const labels = {
        status: '状态（生死/位置锁定）',
        inventory: '物品归属',
        knowledge: '秘密/认知',
        relation: '关系状态',
        rule: '规则/约束'
    };

    worldList.forEach(w => {
        if (grouped[w.category]) {
            grouped[w.category].push(w);
        }
    });

    const parts = [];
    for (const [cat, items] of Object.entries(grouped)) {
        if (items.length > 0) {
            const lines = items.map(w => `  - ${w.topic}: ${w.content}`).join('\n');
            parts.push(`【${labels[cat]}】\n${lines}`);
        }
    }

    return parts.join('\n\n') || '（空白，尚无世界状态记录）';
}

function buildSummaryMessages(existingSummary, existingWorld, newHistoryText, historyRange, nextEventId, existingEventCount) {
    const worldStateText = formatWorldForLLM(existingWorld);

    const jsonFormat = LLM_PROMPT_CONFIG.userJsonFormat
        .replace(/\{nextEventId\}/g, String(nextEventId));

    const checkContent = LLM_PROMPT_CONFIG.assistantCheck
        .replace(/\{existingEventCount\}/g, String(existingEventCount));

    const topMessages = [
        { role: 'system', content: LLM_PROMPT_CONFIG.topSystem },
        { role: 'assistant', content: LLM_PROMPT_CONFIG.assistantDoc },
        { role: 'assistant', content: LLM_PROMPT_CONFIG.assistantAskSummary },
        { role: 'user', content: `<已有总结状态>\n${existingSummary}\n</已有总结状态>\n\n<当前世界状态>\n${worldStateText}\n</当前世界状态>` },
        { role: 'assistant', content: LLM_PROMPT_CONFIG.assistantAskContent },
        { role: 'user', content: `<新对话内容>（${historyRange}）\n${newHistoryText}\n</新对话内容>` }
    ];

    const bottomMessages = [
        { role: 'user', content: LLM_PROMPT_CONFIG.metaProtocolStart + '\n' + jsonFormat },
        { role: 'assistant', content: checkContent },
        { role: 'user', content: LLM_PROMPT_CONFIG.userConfirm }
    ];

    return {
        top64: b64UrlEncode(JSON.stringify(topMessages)),
        bottom64: b64UrlEncode(JSON.stringify(bottomMessages)),
        assistantPrefill: LLM_PROMPT_CONFIG.assistantPrefill
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// JSON 解析
// ═══════════════════════════════════════════════════════════════════════════

export function parseSummaryJson(raw) {
    if (!raw) return null;

    let cleaned = String(raw).trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch { }

    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
        let jsonStr = cleaned.slice(start, end + 1)
            .replace(/,(\s*[}\]])/g, '$1');
        try {
            return JSON.parse(jsonStr);
        } catch { }
    }

    return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// 主生成函数
// ═══════════════════════════════════════════════════════════════════════════

export async function generateSummary(options) {
    const {
        existingSummary,
        existingWorld,
        newHistoryText,
        historyRange,
        nextEventId,
        existingEventCount = 0,
        llmApi = {},
        genParams = {},
        useStream = true,
        timeout = 120000,
        sessionId = 'xb_summary'
    } = options;

    if (!newHistoryText?.trim()) {
        throw new Error('新对话内容为空');
    }

    const streamingMod = getStreamingModule();
    if (!streamingMod) {
        throw new Error('生成模块未加载');
    }

    const promptData = buildSummaryMessages(
        existingSummary,
        existingWorld,
        newHistoryText,
        historyRange,
        nextEventId,
        existingEventCount
    );

    const args = {
        as: 'user',
        nonstream: useStream ? 'false' : 'true',
        top64: promptData.top64,
        bottom64: promptData.bottom64,
        bottomassistant: promptData.assistantPrefill,
        id: sessionId,
    };

    if (llmApi.provider && llmApi.provider !== 'st') {
        const mappedApi = PROVIDER_MAP[String(llmApi.provider).toLowerCase()];
        if (mappedApi) {
            args.api = mappedApi;
            if (llmApi.url) args.apiurl = llmApi.url;
            if (llmApi.key) args.apipassword = llmApi.key;
            if (llmApi.model) args.model = llmApi.model;
        }
    }

    if (genParams.temperature != null) args.temperature = genParams.temperature;
    if (genParams.top_p != null) args.top_p = genParams.top_p;
    if (genParams.top_k != null) args.top_k = genParams.top_k;
    if (genParams.presence_penalty != null) args.presence_penalty = genParams.presence_penalty;
    if (genParams.frequency_penalty != null) args.frequency_penalty = genParams.frequency_penalty;

    let rawOutput;
    if (useStream) {
        const sid = await streamingMod.xbgenrawCommand(args, '');
        rawOutput = await waitForStreamingComplete(sid, streamingMod, timeout);
    } else {
        rawOutput = await streamingMod.xbgenrawCommand(args, '');
    }

    console.group('%c[Story-Summary] LLM输出', 'color: #7c3aed; font-weight: bold');
    console.log(rawOutput);
    console.groupEnd();

    return rawOutput;
}
