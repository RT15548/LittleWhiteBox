import { getTextApiRepository } from '../../text-api/repository.js';
import { extension_settings } from "../../../../../../extensions.js";
import { EXT_ID } from "../../../core/constants.js";
import { xbLog } from "../../../core/debug-core.js";
import { CommonSettingStorage } from "../../../core/server-storage.js";
import { SUMMARY_CONFIG_LOCAL_STORAGE_KEY, writeSummaryConfigLocalCache } from './config-local-cache.js';
import { CHARACTER_ALIAS_OUTPUT_TEMPLATE } from './character-aliases.js';
import { EVENT_MEMORY_ROLES } from "./events.js";
import { DEFAULT_SUMMARY_DELAY_FLOORS, normalizeSummaryDelayFloors } from './summary-delay.js';
import { normalizeRecallTimeoutSec } from './recall-settings.js';
import { DEFAULT_MEMORY_MAINTENANCE_ENABLED } from '../maintenance/settings.js';
import {
    SUMMARY_ALIAS_RULES, SUMMARY_FACT_UPDATE_RULES, buildSummaryAssistantDocPrompt,
} from './generation-rules.js';

const MODULE_ID = "summaryConfig";
const SUMMARY_CONFIG_KEY = "storySummaryPanelConfig";
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
  - Incremental_Only: 对照已有总结处理新对话，各字段的更新方式见输出要求
  - Output_Language: 所有自由文本总结字段使用本批新对话的主要语言；混合语言时跟随主要叙事语言，并保留原文人名、专名和引语。JSON 键、事件 memoryRole、关键词 weight、关系 trend 及其他协议固定值保持规定值，不翻译
  - Event_Memory_Role: Identify what each event leaves for later context, using the Memory Role definitions below.
  - Causal_Chain: causedBy links an event to its direct causes or explicit motives. Reference syntax is defined in Event References below.
  - Character_Dynamics: 识别新角色，追踪关系趋势
  - Arc_Tracking: 更新角色弧光轨迹与成长进度
  - Fact_Tracking: 记录已确认的事实及其变化，写法见输出要求中的 factUpdates 规则。
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

export function getSummaryAssistantDocPrompt(config = getSummaryPanelConfig()) {
    return buildSummaryAssistantDocPrompt(config.prompts?.summaryStyle);
}

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
Generate a single valid JSON object. Add new events and update changed records as described below.
events is an array, including [] when this batch has no new events. Other update arrays may be omitted when unchanged.
整份输出3000字以内。

## Event References
The application assigns permanent event IDs in events array order when saving.
causedBy contains up to two direct causes, or [] when none is clear.
Existing events use the exact evt-N IDs shown in the existing summary.
Within this response, new-N refers to the Nth item in events, counted from 1. For example, new-1 refers to the first item.
Each reference points to a different event, never the event containing it.
Each summary ends with one source marker (#X-Y), or (#X) for one floor. X and Y are floor numbers from the supplied new dialogue, with X <= Y.

## Mindful Approach
生成前，对照新对话和已有总结，确认：
- 哪些事件已经记过，哪些是本次新发生的？
- 新事件中，哪些人物、地点、物件、动作和原话值得留下？
- 哪些角色首次出现，哪些已有角色发生了变化？
- 哪些事实或人物关系有了新的情况？

## keywords：全局剧情标签
keywords 用于面板展示，也会作为已有总结提供给下一次生成总结的模型。
综合已有总结和新对话，给出 3～8 个标签，每个 2～5 字，表达贯穿剧情的主题、冲突、关系或核心设定。
有调整时输出完整一组标签，它会替换旧的一组，所以不是只补新词。没有调整时省略 keywords。
weight 表示标签在整个剧情中的分量，填“核心”“重要”或“一般”。

## events.title：事件标题
标题会和时间一起显示在卡片正文前，并随记忆提供给后续角色扮演。
可以用地点加事件名做标题，例如“黑鹭酒馆·拍欠条”；没有明确地点时只写事件名。

${SUMMARY_ALIAS_RULES}

${SUMMARY_FACT_UPDATE_RULES}

## Output Format
\`\`\`json
{
  "mindful_prelude": {
    "user_insight": "本轮主要新增了哪些情节、关系或事实，哪些细节值得进入可召回摘要",
    "dedup_analysis": "已有X个事件，本次识别Y个新事件",
    "fact_changes": "识别到的事实变化概述"
  },
  "keywords": [
    {"text": "剧情标签", "weight": "核心|重要|一般"}
  ],
  "events": [
    {
      "title": "事件标题",
      "timeLabel": "事件发生时间，写法见 Event Summary Style",
      "summary": "事件回忆卡片，写法见 Event Summary Style；来源楼层标记见 Event References",
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
字符串值内部的引号用中文引号“”。
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

export const DEFAULT_SUMMARY_USER_CONFIRM_PROMPT = `怎么截断了！重新完整生成，只输出JSON，不要任何其他内容
</Chat_History>`;

export const DEFAULT_SUMMARY_USER_GENERATE_PROMPT = '下面重新生成完整JSON。';
export const getSummaryPrompts = (config = getSummaryPanelConfig()) => ({
    summarySystemPrompt: DEFAULT_SUMMARY_SYSTEM_PROMPT,
    summaryAssistantDocPrompt: getSummaryAssistantDocPrompt(config),
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
        recallTimeoutSec: normalizeRecallTimeoutSec(rawVector?.recallTimeoutSec),
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
        trigger: {
            enabled: false,
            notifyOnComplete: false,
            interval: 20,
            delayFloors: DEFAULT_SUMMARY_DELAY_FLOORS,
            timing: "before_user",
            role: "system",
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
            summaryStyle: '',
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
    if (actual.prompts.summaryStyle !== expected.prompts.summaryStyle) {
        throw new Error('写作要求未保存，请重试');
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
        trigger: { ...defaults.trigger, ...(rawConfig.trigger || {}) },
        ui: { ...defaults.ui, ...(rawConfig.ui || {}) },
        textFilterRules,
        prompts: {
            memoryTemplate: String(rawPrompts.memoryTemplate || defaults.prompts.memoryTemplate || "").trim()
                || DEFAULT_MEMORY_PROMPT_TEMPLATE,
            summaryStyle: String(rawPrompts.summaryStyle || '').trim(),
        },
        vector: normalizeVectorConfig(rawConfig.vector || null),
    };


    if (result.trigger.timing === "manual") {
        result.trigger.timing = defaults.trigger.timing;
        result.trigger.enabled = false;
    } else if (!VALID_TRIGGER_TIMINGS.has(result.trigger.timing)) {
        result.trigger.timing = defaults.trigger.timing;
    }
    delete result.trigger.useStream;
    result.trigger.notifyOnComplete = rawConfig?.trigger?.notifyOnComplete === true;
    result.trigger.delayFloors = normalizeSummaryDelayFloors(result.trigger.delayFloors);
    result.ui.hideSummarized = !!result.ui.hideSummarized;
    result.ui.keepVisibleCount = clampKeepVisibleCount(result.ui.keepVisibleCount);
    result.ui.useVectorBoundary = result.ui.useVectorBoundary !== false;

    return result;
}

function setSummaryPanelConfigCache(config, { persistLocal = false } = {}) {
    const normalized = normalizeSummaryPanelConfig(config);
    summaryPanelConfigCache = normalized;
    if (persistLocal) {
        writeSummaryConfigLocalCache(normalized, (message, errorName) => xbLog.warn(MODULE_ID, message, errorName));
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
        getTextApiRepository().then(repository => repository.load()).then(async () => {
            await CommonSettingStorage.set(SUMMARY_CONFIG_KEY, normalized);
            writeSummaryConfigLocalCache(normalized, (message, errorName) => xbLog.warn(MODULE_ID, message, errorName));
        }).catch((e) => {
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
        getTextApiRepository().then(repository => repository.load()).then(async () => {
            await CommonSettingStorage.set(SUMMARY_CONFIG_KEY, parsed);
            writeSummaryConfigLocalCache(parsed, (message, errorName) => xbLog.warn(MODULE_ID, message, errorName));
        }).catch((e) => {
            xbLog.error(MODULE_ID, "保存向量配置失败", e);
        });
        return cloneConfig(parsed.vector);
    } catch (e) {
        xbLog.error(MODULE_ID, "保存向量配置失败", e);
        return null;
    }
}

export async function saveSummaryPanelConfigVerified(config) {
    await (await getTextApiRepository()).load();
    const normalized = normalizeSummaryPanelConfig(config);
    await CommonSettingStorage.setAndSave(SUMMARY_CONFIG_KEY, normalized, { silent: false });
    CommonSettingStorage.clearCache();
    const savedConfig = await CommonSettingStorage.getStrict(SUMMARY_CONFIG_KEY, null);
    const savedNormalized = normalizeSummaryPanelConfig(savedConfig);
    assertSummaryConfigPersisted(normalized, savedNormalized);
    setSummaryPanelConfigCache(savedNormalized, { persistLocal: true });
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
