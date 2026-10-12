import { extension_settings } from "../../../../../../extensions.js";
import { EXT_ID } from "../../../core/constants.js";
import { xbLog } from "../../../core/debug-core.js";
import { CommonSettingStorage } from "../../../core/server-storage.js";
import { CHARACTER_ALIAS_OUTPUT_TEMPLATE } from './character-aliases.js';
import { EVENT_MEMORY_ROLES } from "./events.js";
import { DEFAULT_SUMMARY_DELAY_FLOORS, normalizeSummaryDelayFloors } from './summary-delay.js';
import { DEFAULT_MEMORY_MAINTENANCE_ENABLED } from '../maintenance/settings.js';
import {
    SUMMARY_ALIAS_RULES, SUMMARY_ARC_RULES, SUMMARY_EVENT_STYLE_RULES, SUMMARY_FACT_TRACKING_RULES,
    SUMMARY_FACT_UPDATE_RULES, SUMMARY_MEMORY_ROLE_RULES, SUMMARY_PLAIN_STYLE_RULES, SUMMARY_RELATION_TREND_RULES,
} from './generation-rules.js';

const MODULE_ID = "summaryConfig";
const SUMMARY_CONFIG_KEY = "storySummaryPanelConfig";
const SUMMARY_CONFIG_LOCAL_STORAGE_KEY = "summary_panel_config";
const VALID_TRIGGER_TIMINGS = new Set(["after_ai", "before_user"]);
let summaryPanelConfigCache = null;

const DEFAULT_FILTER_RULES = [
    { start: "<think>", end: "</think>" },
    { start: "<thinking>", end: "</thinking>" },
    { start: "```", end: "```" },
];

export const DEFAULT_SUMMARY_SYSTEM_PROMPT = `Story Analyst: This task involves narrative comprehension and structured incremental summarization, representing creative story analysis at the intersection of plot tracking and character development. As a story analyst, you will conduct systematic evaluation of provided dialogue content to generate structured incremental summary data.
[Read the settings for this task]
<task_settings>
Incremental_Summary_Requirements:
  - Incremental_Only: 只提取新对话中的新增要素，绝不重复已有总结
  - Output_Language: 所有自由文本总结字段使用本批新对话的主要语言；混合语言时跟随主要叙事语言，并保留原文人名、专名和引语。JSON 键、事件 memoryRole、关键词 weight、关系 trend 及其他协议固定值保持规定值，不翻译
  - Event_Granularity: 记录有叙事价值的事件，而非剧情梗概
  - Memory_Album_Style: 形成有细节、有温度、有记忆点的回忆册
  - Retrieval_Readiness: event.summary 必须面向未来召回，不得写成泛化剧情概括
  - Event_Memory_Role: Identify what each event leaves for later context, using the Memory Role definitions below.
  - Causal_Chain: causedBy links an event to its direct causes or explicit motives. Reference syntax is defined in Event References below.
  - Character_Dynamics: 识别新角色，追踪关系趋势
  - Arc_Tracking: 更新角色弧光轨迹与成长进度
  - Fact_Tracking: 维护 SPO 三元组知识图谱。追踪生死、物品归属、位置、关系、稳定辨识性身体特征等硬性事实。采用 KV 覆盖模型（s+p 为键）。
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
      new events and character interactions, identify each event's memory
      role, track character arc progression,
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

export const DEFAULT_MEMORY_PROMPT_TEMPLATE = `以上是还留在眼前的对话
以下是脑海里的记忆：
• [定了的事] 已确立的事实，以后续明确发生的变化为准
• [其他人的事] 别人的经历，当前角色可能不知晓
• 其余部分是过往经历的回忆碎片

请内化这些记忆：剧情中已确立的事实与关系发展，优先于初始设定中的旧状态。
{$剧情记忆}
这些记忆是真实的，请自然地记住它们，并结合当前剧情理解事件距今多久。`;

export const DEFAULT_SUMMARY_ASSISTANT_DOC_PROMPT = `
Summary Specialist:
Acknowledged. Now reviewing the incremental summarization specifications:

${SUMMARY_MEMORY_ROLE_RULES}

${SUMMARY_EVENT_STYLE_RULES}

${SUMMARY_RELATION_TREND_RULES}

${SUMMARY_ARC_RULES}

${SUMMARY_FACT_TRACKING_RULES}

Ready to process incremental summary requests with strict deduplication.`;

export const DEFAULT_SUMMARY_ASSISTANT_ASK_SUMMARY_PROMPT = `
Summary Specialist:
Specifications internalized. Please provide the existing summary state so I can:
1. Index all recorded events to avoid duplication
2. Map current character list as baseline
3. Note existing arc progress levels
4. Identify established keywords
5. Review current facts (SPO triples baseline)`;

export const DEFAULT_SUMMARY_ASSISTANT_ASK_CONTENT_PROMPT = `
Summary Specialist:
Existing summary fully analyzed and indexed. I understand:
├─ Recorded events: Indexed for deduplication
├─ Character list: Baseline mapped
├─ Arc progress: Levels noted
├─ Keywords: Current state acknowledged
└─ Facts: SPO baseline loaded

I will extract only genuinely NEW elements from the upcoming dialogue.
Please provide the new dialogue content requiring incremental analysis.`;

export const DEFAULT_SUMMARY_META_PROTOCOL_START_PROMPT = `
Summary Specialist:
ACKNOWLEDGED. Beginning structured JSON generation:
<meta_protocol>`;

export const DEFAULT_SUMMARY_USER_JSON_FORMAT_PROMPT = `
## Output Rule
Generate a single valid JSON object with INCREMENTAL updates only.
events is an array, including [] when this batch has no new events. Other update arrays may be omitted when unchanged.

## Event References
The application assigns permanent event IDs in events array order when saving.
causedBy contains up to two direct causes, or [] when none is clear.
Existing events use the exact evt-N IDs shown in the existing summary.
Within this response, new-N refers to the Nth item in events, counted from 1. For example, new-1 refers to the first item.
Each reference points to a different event, never the event containing it.
Each summary ends with one source marker (#X-Y), or (#X) for one floor. X and Y are floor numbers from the supplied new dialogue, with X <= Y.

## Mindful Approach
Before generating, observe the USER and analyze carefully:
- What NEW plot turns, relationship changes, or fact changes happened in this round?
- Where is the boundary between existing events and the new content?
- Which concrete details are worth preserving for future recall?
- What NEW events occurred (not in existing summary)?
- What NEW characters appeared for the first time?
- What relationship CHANGES happened?
- What arc PROGRESS was made?
- What facts changed? (status/position/ownership/relationships/stable distinctive physical traits)

${SUMMARY_FACT_UPDATE_RULES}

${SUMMARY_ALIAS_RULES}

## Output Format
\`\`\`json
{
  "mindful_prelude": {
    "user_insight": "本轮主要新增了哪些情节、关系或事实，哪些细节值得进入可召回摘要",
    "dedup_analysis": "已有X个事件，本次识别Y个新事件",
    "fact_changes": "识别到的事实变化概述"
  },
  "keywords": [
    {"text": "综合历史+新内容的全剧情关键词(5-10个)", "weight": "核心|重要|一般"}
  ],
  "events": [
    {
      "title": "地点·事件标题",
      "timeLabel": "事件发生时间（如：6月12日、搬入新家的第二晚）",
      "summary": "回忆卡片。优先写成1句；信息确实过多时可写2句。必须保留正式人名、原文称呼/昵称、地点、物件、具体动作和可召回钩子，末尾标注楼层(#X-Y)",
      "participants": ["参与角色名，不要使用人称代词或别名，只用正式人名"],
      "memoryRole": "${EVENT_MEMORY_ROLES.join('|')}",
      "causedBy": []
    }
  ],
  "newCharacters": ["仅本次首次出现的角色名"],
  "arcUpdates": [
    {"name": "角色名，不要使用人称代词或别名，只用正式人名", "trajectory": "当前阶段描述(15字内)", "progress": 75, "newMoment": "本次新增的关键时刻"}
  ],
  "factUpdates": [
    {"s": "主体", "p": "谓词", "o": "当前值", "isState": true},
    {"s": "要删除的主体", "p": "要删除的谓词", "retracted": true}
  ],
  "characterAliasUpdates": [
    {"to": "${CHARACTER_ALIAS_OUTPUT_TEMPLATE.to}", "from": ["${CHARACTER_ALIAS_OUTPUT_TEMPLATE.from}"], "evidence": "${CHARACTER_ALIAS_OUTPUT_TEMPLATE.evidence}"}
  ]
}
\`\`\`

## CRITICAL NOTES
- 仅输出【增量】内容，已有事件绝不重复
- summary 按 doc 中的“Event Summary Style”执行，不要写成泛化概括
- keywords 是全局关键词，综合已有+新增
- factUpdates 可为空数组
- characterAliasUpdates 是可选字段；没有可靠的同一人依据时不要输出这个 key
- 合法JSON，字符串值内部避免英文双引号
${SUMMARY_PLAIN_STYLE_RULES}
</meta_protocol>`;

export const DEFAULT_SUMMARY_ASSISTANT_CHECK_PROMPT = `Content review initiated...
[Compliance Check Results]
├─ Existing summary loaded: ✓ Fully indexed
├─ New dialogue received: ✓ Content parsed
├─ Deduplication engine: ✓ Active
├─ Memory roles: ✓ Ready
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

export const DEFAULT_SUMMARY_USER_CONFIRM_PROMPT = `怎么截断了！重新完整生成，只输出JSON，不要任何其他内容，3000字以内
</Chat_History>`;

export const DEFAULT_SUMMARY_USER_GENERATE_PROMPT = '下面重新生成完整JSON。';
export const BUILTIN_SUMMARY_PROMPTS = Object.freeze({
    summarySystemPrompt: DEFAULT_SUMMARY_SYSTEM_PROMPT,
    summaryAssistantDocPrompt: DEFAULT_SUMMARY_ASSISTANT_DOC_PROMPT,
    summaryAssistantAskSummaryPrompt: DEFAULT_SUMMARY_ASSISTANT_ASK_SUMMARY_PROMPT,
    summaryAssistantAskContentPrompt: DEFAULT_SUMMARY_ASSISTANT_ASK_CONTENT_PROMPT,
    summaryMetaProtocolStartPrompt: DEFAULT_SUMMARY_META_PROTOCOL_START_PROMPT,
    summaryUserJsonFormatPrompt: DEFAULT_SUMMARY_USER_JSON_FORMAT_PROMPT,
    summaryAssistantCheckPrompt: DEFAULT_SUMMARY_ASSISTANT_CHECK_PROMPT,
    summaryUserConfirmPrompt: DEFAULT_SUMMARY_USER_CONFIRM_PROMPT,
    summaryUserGeneratePrompt: DEFAULT_SUMMARY_USER_GENERATE_PROMPT,
});
const DEFAULT_VECTOR_PROVIDER = "siliconflow";
const DEFAULT_L0_URL = "https://api.siliconflow.cn/v1";
const DEFAULT_OPENROUTER_URL = "https://openrouter.ai/api/v1";
const DEFAULT_L0_MODEL = "Qwen/Qwen3-8B";
const DEFAULT_EMBEDDING_MODEL = "BAAI/bge-m3";
const DEFAULT_RERANK_MODEL = "BAAI/bge-reranker-v2-m3";

function getVectorProviderDefaultUrl(provider) {
    return provider === "openrouter" ? DEFAULT_OPENROUTER_URL : DEFAULT_L0_URL;
}

function createDefaultProviderProfile(provider, model = "") {
    return {
        url: provider === "custom" ? "" : getVectorProviderDefaultUrl(provider),
        key: "",
        model: model || "",
        modelCache: [],
    };
}

function normalizeProviderProfiles(supportedProviders, srcProfiles, currentProvider, currentValues, defaultModel) {
    const out = {};
    supportedProviders.forEach((provider) => {
        const raw = srcProfiles?.[provider] || {};
        const defaults = createDefaultProviderProfile(provider, defaultModel);
        out[provider] = {
            url: String(raw.url || defaults.url || "").trim(),
            key: String(raw.key || "").trim(),
            model: String(raw.model || defaults.model || "").trim(),
            modelCache: Array.isArray(raw.modelCache) ? raw.modelCache.filter(Boolean) : [],
        };
    });

    if (currentProvider && out[currentProvider]) {
        if (currentValues?.url && !out[currentProvider].url) out[currentProvider].url = String(currentValues.url).trim();
        if (currentValues?.key && !out[currentProvider].key) out[currentProvider].key = String(currentValues.key).trim();
        if (currentValues?.model && !out[currentProvider].model) out[currentProvider].model = String(currentValues.model).trim();
        if (Array.isArray(currentValues?.modelCache) && !out[currentProvider].modelCache.length) {
            out[currentProvider].modelCache = currentValues.modelCache.filter(Boolean);
        }
    }

    return out;
}

export function getSettings() {
    const ext = (extension_settings[EXT_ID] ||= {});
    ext.storySummary ||= { enabled: true };
    return ext;
}

function normalizeOpenAiCompatApiConfig(src, defaults = {}) {
    const provider = String(src?.provider || defaults.provider || DEFAULT_VECTOR_PROVIDER).toLowerCase();
    const supportedProviders = Array.isArray(defaults.supportedProviders) && defaults.supportedProviders.length
        ? defaults.supportedProviders
        : [provider, "custom"];
    const providers = normalizeProviderProfiles(
        supportedProviders,
        src?.providers,
        provider,
        src,
        defaults.model || ""
    );
    const current = providers[provider] || createDefaultProviderProfile(provider, defaults.model || "");
    return {
        provider,
        url: String(current.url || "").trim(),
        key: String(current.key || defaults.key || "").trim(),
        model: String(current.model || defaults.model || "").trim(),
        modelCache: Array.isArray(current.modelCache) ? current.modelCache.filter(Boolean) : [],
        providers,
    };
}

function normalizeVectorConfig(rawVector = null) {
    const legacyOnline = rawVector?.online || {};
    const sharedProvider = String(legacyOnline.provider || DEFAULT_VECTOR_PROVIDER).toLowerCase();
    const sharedUrl = String(legacyOnline.url || (sharedProvider === "openrouter" ? DEFAULT_OPENROUTER_URL : DEFAULT_L0_URL)).trim();
    const sharedKey = String(legacyOnline.key || "").trim();

    return {
        enabled: !!rawVector?.enabled,
        engine: "online",
        l0Concurrency: Math.max(1, Math.min(50, Number(rawVector?.l0Concurrency) || 10)),
        l0Api: normalizeOpenAiCompatApiConfig(rawVector?.l0Api, {
            provider: sharedProvider,
            url: sharedUrl,
            key: sharedKey,
            model: DEFAULT_L0_MODEL,
            supportedProviders: ["siliconflow", "openrouter", "custom"],
        }),
        embeddingApi: normalizeOpenAiCompatApiConfig(rawVector?.embeddingApi, {
            provider: DEFAULT_VECTOR_PROVIDER,
            url: DEFAULT_L0_URL,
            key: sharedKey,
            model: DEFAULT_EMBEDDING_MODEL,
            supportedProviders: ["siliconflow", "custom"],
        }),
        rerankApi: normalizeOpenAiCompatApiConfig(rawVector?.rerankApi, {
            provider: DEFAULT_VECTOR_PROVIDER,
            url: DEFAULT_L0_URL,
            key: sharedKey,
            model: DEFAULT_RERANK_MODEL,
            supportedProviders: ["siliconflow", "custom"],
        }),
    };
}

function createDefaultSummaryPanelConfig() {
    const defaults = {
        memoryMaintenanceEnabled: DEFAULT_MEMORY_MAINTENANCE_ENABLED,
        api: { provider: "st", url: "", key: "", model: "", modelCache: [] },
        gen: { temperature: null, top_p: null, top_k: null, presence_penalty: null, frequency_penalty: null },
        trigger: {
            enabled: false,
            interval: 20,
            delayFloors: DEFAULT_SUMMARY_DELAY_FLOORS,
            timing: "before_user",
            role: "system",
            useStream: true,
            maxPerRun: 100,
            wrapperHead: "",
            wrapperTail: "",
            forceInsertAtEnd: false,
        },
        ui: {
            hideSummarized: true,
            keepVisibleCount: 6,
            useVectorBoundary: true,
        },
        textFilterRules: [...DEFAULT_FILTER_RULES],
        prompts: {
            memoryTemplate: DEFAULT_MEMORY_PROMPT_TEMPLATE,
        },
        vector: normalizeVectorConfig(),
    };
    return defaults;
}

function cloneConfig(value) {
    if (typeof structuredClone === "function") {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
}

function assertSummaryConfigPersisted(expected, actual) {
    if (!actual || typeof actual !== "object") {
        throw new Error("保存后读取配置失败");
    }
    if (actual.memoryMaintenanceEnabled !== expected.memoryMaintenanceEnabled) {
        throw new Error('memory_maintenance_setting_not_saved');
    }

    const expectedApi = expected?.api || {};
    const actualApi = actual?.api || {};
    const fields = ["provider", "url", "key", "model"];
    for (const field of fields) {
        if (String(actualApi[field] ?? "") !== String(expectedApi[field] ?? "")) {
            throw new Error(`保存校验失败：API ${field} 未写入服务器`);
        }
    }
}

function normalizeSummaryPanelConfig(rawConfig = null) {
    const defaults = createDefaultSummaryPanelConfig();
    const clampKeepVisibleCount = (value) => {
        const n = Number.parseInt(value, 10);
        if (!Number.isFinite(n)) return 6;
        return Math.max(0, Math.min(50, n));
    };

    if (!rawConfig || typeof rawConfig !== "object") {
        return defaults;
    }

    const textFilterRules = Array.isArray(rawConfig.textFilterRules)
        ? rawConfig.textFilterRules
        : (Array.isArray(rawConfig.vector?.textFilterRules)
            ? rawConfig.vector.textFilterRules
            : defaults.textFilterRules);

    const rawPrompts = rawConfig.prompts && typeof rawConfig.prompts === "object"
        ? rawConfig.prompts
        : {};

    const result = {
        memoryMaintenanceEnabled: rawConfig.memoryMaintenanceEnabled === true,
        api: { ...defaults.api, ...(rawConfig.api || {}) },
        gen: { ...defaults.gen, ...(rawConfig.gen || {}) },
        trigger: { ...defaults.trigger, ...(rawConfig.trigger || {}) },
        ui: { ...defaults.ui, ...(rawConfig.ui || {}) },
        textFilterRules,
        prompts: {
            memoryTemplate: String(rawPrompts.memoryTemplate || defaults.prompts.memoryTemplate || "").trim()
                || DEFAULT_MEMORY_PROMPT_TEMPLATE,
        },
        vector: normalizeVectorConfig(rawConfig.vector || null),
    };

    if (String(result.api.provider || "").toLowerCase() === "custom") {
        result.api.provider = "openai";
    }

    if (result.trigger.timing === "manual") {
        result.trigger.timing = defaults.trigger.timing;
        result.trigger.enabled = false;
    } else if (!VALID_TRIGGER_TIMINGS.has(result.trigger.timing)) {
        result.trigger.timing = defaults.trigger.timing;
    }
    if (result.trigger.useStream === undefined) result.trigger.useStream = true;
    result.trigger.delayFloors = normalizeSummaryDelayFloors(result.trigger.delayFloors);
    result.ui.hideSummarized = !!result.ui.hideSummarized;
    result.ui.keepVisibleCount = clampKeepVisibleCount(result.ui.keepVisibleCount);
    result.ui.useVectorBoundary = result.ui.useVectorBoundary !== false;

    return result;
}

function writeConfigToLocalStorage(config) {
    localStorage.setItem(SUMMARY_CONFIG_LOCAL_STORAGE_KEY, JSON.stringify(config));
}

function setSummaryPanelConfigCache(config, { persistLocal = true } = {}) {
    const normalized = normalizeSummaryPanelConfig(config);
    summaryPanelConfigCache = normalized;
    if (persistLocal) {
        writeConfigToLocalStorage(normalized);
    }
    return normalized;
}

function ensureSummaryPanelConfigCache() {
    if (summaryPanelConfigCache) return summaryPanelConfigCache;

    try {
        const raw = localStorage.getItem(SUMMARY_CONFIG_LOCAL_STORAGE_KEY);
        if (!raw) {
            return setSummaryPanelConfigCache(createDefaultSummaryPanelConfig(), { persistLocal: false });
        }
        return setSummaryPanelConfigCache(JSON.parse(raw), { persistLocal: false });
    } catch {
        return setSummaryPanelConfigCache(createDefaultSummaryPanelConfig(), { persistLocal: false });
    }
}

export function getSummaryPanelConfig() {
    return cloneConfig(ensureSummaryPanelConfigCache());
}

export function saveSummaryPanelConfig(config) {
    try {
        const normalized = setSummaryPanelConfigCache(config);
        CommonSettingStorage.set(SUMMARY_CONFIG_KEY, normalized).catch((e) => {
            xbLog.error(MODULE_ID, "保存面板配置失败", e);
        });
        return normalized;
    } catch (e) {
        xbLog.error(MODULE_ID, "保存面板配置失败", e);
        return null;
    }
}

export function getVectorConfig() {
    const cfg = ensureSummaryPanelConfigCache();
    return cfg?.vector ? cloneConfig(cfg.vector) : normalizeVectorConfig();
}

export function getTextFilterRules() {
    const cfg = getSummaryPanelConfig();
    return Array.isArray(cfg?.textFilterRules)
        ? cfg.textFilterRules
        : DEFAULT_FILTER_RULES;
}

export function saveVectorConfig(vectorCfg) {
    try {
        const parsed = ensureSummaryPanelConfigCache();
        parsed.vector = normalizeVectorConfig(vectorCfg || null);
        setSummaryPanelConfigCache(parsed);
        CommonSettingStorage.set(SUMMARY_CONFIG_KEY, parsed).catch((e) => {
            xbLog.error(MODULE_ID, "保存向量配置失败", e);
        });
        return cloneConfig(parsed.vector);
    } catch (e) {
        xbLog.error(MODULE_ID, "保存向量配置失败", e);
        return null;
    }
}

export async function saveSummaryPanelConfigVerified(config) {
    const normalized = normalizeSummaryPanelConfig(config);
    await CommonSettingStorage.setAndSave(SUMMARY_CONFIG_KEY, normalized, { silent: false });
    CommonSettingStorage.clearCache();
    const savedConfig = await CommonSettingStorage.getStrict(SUMMARY_CONFIG_KEY, null);
    const savedNormalized = normalizeSummaryPanelConfig(savedConfig);
    assertSummaryConfigPersisted(normalized, savedNormalized);
    setSummaryPanelConfigCache(savedNormalized);
    return cloneConfig(savedNormalized);
}

export async function readSummaryPanelConfigFromServer() {
    const savedConfig = await CommonSettingStorage.getStrict(SUMMARY_CONFIG_KEY, null);
    // Confirmed absence is not a read failure. Preserve local settings without
    // creating or overwriting a server record during initialization.
    return savedConfig ? cloneConfig(normalizeSummaryPanelConfig(savedConfig)) : getSummaryPanelConfig();
}

export function applySummaryPanelConfigSnapshot(config) {
    return cloneConfig(setSummaryPanelConfigCache(config));
}

export async function loadConfigFromServer() {
    const loaded = await readSummaryPanelConfigFromServer();
    const applied = applySummaryPanelConfigSnapshot(loaded);
    xbLog.info(MODULE_ID, "已从服务端加载面板配置");
    return applied;
}
