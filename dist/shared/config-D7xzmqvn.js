import{n as z}from"./chunk-b3L32Ng1.js";import{n as B}from"./constants-RJ4jNr01.js";import{r as m}from"./debug-core-CagYs3TN.js";import{r as l}from"./server-storage-B_9LzzQR.js";import{B as G,F as K,I as J,L as W,M as $,N as j,R as V,Y as H,d as X,et as A,f as q,m as Q,p as Z,z as ee}from"./presentation-DL4zD_ui.js";import{extension_settings as te}from"../../../../../extensions.js";var Ee=z({BUILTIN_SUMMARY_PROMPTS:()=>ne,DEFAULT_MEMORY_PROMPT_TEMPLATE:()=>M,DEFAULT_SUMMARY_ASSISTANT_ASK_CONTENT_PROMPT:()=>L,DEFAULT_SUMMARY_ASSISTANT_ASK_SUMMARY_PROMPT:()=>O,DEFAULT_SUMMARY_ASSISTANT_CHECK_PROMPT:()=>w,DEFAULT_SUMMARY_ASSISTANT_DOC_PROMPT:()=>C,DEFAULT_SUMMARY_META_PROTOCOL_START_PROMPT:()=>N,DEFAULT_SUMMARY_SYSTEM_PROMPT:()=>U,DEFAULT_SUMMARY_USER_CONFIRM_PROMPT:()=>D,DEFAULT_SUMMARY_USER_GENERATE_PROMPT:()=>b,DEFAULT_SUMMARY_USER_JSON_FORMAT_PROMPT:()=>F,applySummaryPanelConfigSnapshot:()=>Y,getSettings:()=>me,getSummaryPanelConfig:()=>T,getTextFilterRules:()=>pe,getVectorConfig:()=>de,loadConfigFromServer:()=>_e,readSummaryPanelConfigFromServer:()=>x,saveSummaryPanelConfig:()=>ue,saveSummaryPanelConfigVerified:()=>Se,saveVectorConfig:()=>ye}),c="summaryConfig",p="storySummaryPanelConfig",re=new Set(["after_ai","before_user"]),h=null,P=[{start:"<think>",end:"</think>"},{start:"<thinking>",end:"</thinking>"},{start:"```",end:"```"}],U=`Story Analyst: This task involves narrative comprehension and structured incremental summarization, representing creative story analysis at the intersection of plot tracking and character development. As a story analyst, you will conduct systematic evaluation of provided dialogue content to generate structured incremental summary data.
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
<Chat_History>`,M=`以上是还留在眼前的对话
以下是脑海里的记忆：
• [定了的事] 已确立的事实，以后续明确发生的变化为准
• [其他人的事] 别人的经历，当前角色可能不知晓
• 其余部分是过往经历的回忆碎片

请内化这些记忆：剧情中已确立的事实与关系发展，优先于初始设定中的旧状态。
{$剧情记忆}
这些记忆是真实的，请自然地记住它们，并结合当前剧情理解事件距今多久。`,C=`
Summary Specialist:
Acknowledged. Now reviewing the incremental summarization specifications:

${V}

${K}

${G}

${j}

${J}

Ready to process incremental summary requests with strict deduplication.`,O=`
Summary Specialist:
Specifications internalized. Please provide the existing summary state so I can:
1. Index all recorded events to avoid duplication
2. Map current character list as baseline
3. Note existing arc progress levels
4. Identify established keywords
5. Review current facts (SPO triples baseline)`,L=`
Summary Specialist:
Existing summary fully analyzed and indexed. I understand:
├─ Recorded events: Indexed for deduplication
├─ Character list: Baseline mapped
├─ Arc progress: Levels noted
├─ Keywords: Current state acknowledged
└─ Facts: SPO baseline loaded

I will extract only genuinely NEW elements from the upcoming dialogue.
Please provide the new dialogue content requiring incremental analysis.`,N=`
Summary Specialist:
ACKNOWLEDGED. Beginning structured JSON generation:
<meta_protocol>`,F=`
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

${W}

${$}

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
      "memoryRole": "${H.join("|")}",
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
    {"to": "${A.to}", "from": ["${A.from}"], "evidence": "${A.evidence}"}
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
${ee}
</meta_protocol>`,w=`Content review initiated...
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
  "mindful_prelude":`,D=`怎么截断了！重新完整生成，只输出JSON，不要任何其他内容，3000字以内
</Chat_History>`,b="下面重新生成完整JSON。",ne=Object.freeze({summarySystemPrompt:U,summaryAssistantDocPrompt:C,summaryAssistantAskSummaryPrompt:O,summaryAssistantAskContentPrompt:L,summaryMetaProtocolStartPrompt:N,summaryUserJsonFormatPrompt:F,summaryAssistantCheckPrompt:w,summaryUserConfirmPrompt:D,summaryUserGeneratePrompt:b}),y="siliconflow",S="https://api.siliconflow.cn/v1",I="https://openrouter.ai/api/v1",ae="Qwen/Qwen3-8B",ie="BAAI/bge-m3",oe="BAAI/bge-reranker-v2-m3";function se(e){return e==="openrouter"?I:S}function k(e,t=""){return{url:e==="custom"?"":se(e),key:"",model:t||"",modelCache:[]}}function le(e,t,r,a,i){const n={};return e.forEach(d=>{const o=t?.[d]||{},v=k(d,i);n[d]={url:String(o.url||v.url||"").trim(),key:String(o.key||"").trim(),model:String(o.model||v.model||"").trim(),modelCache:Array.isArray(o.modelCache)?o.modelCache.filter(Boolean):[]}}),r&&n[r]&&(a?.url&&!n[r].url&&(n[r].url=String(a.url).trim()),a?.key&&!n[r].key&&(n[r].key=String(a.key).trim()),a?.model&&!n[r].model&&(n[r].model=String(a.model).trim()),Array.isArray(a?.modelCache)&&!n[r].modelCache.length&&(n[r].modelCache=a.modelCache.filter(Boolean))),n}function me(){const e=te[B]||={};return e.storySummary||={enabled:!0},e}function f(e,t={}){const r=String(e?.provider||t.provider||y).toLowerCase(),a=le(Array.isArray(t.supportedProviders)&&t.supportedProviders.length?t.supportedProviders:[r,"custom"],e?.providers,r,e,t.model||""),i=a[r]||k(r,t.model||"");return{provider:r,url:String(i.url||"").trim(),key:String(i.key||t.key||"").trim(),model:String(i.model||t.model||"").trim(),modelCache:Array.isArray(i.modelCache)?i.modelCache.filter(Boolean):[],providers:a}}function g(e=null){const t=e?.online||{},r=String(t.provider||y).toLowerCase(),a=String(t.url||(r==="openrouter"?I:S)).trim(),i=String(t.key||"").trim();return{enabled:!!e?.enabled,engine:"online",l0Concurrency:Math.max(1,Math.min(50,Number(e?.l0Concurrency)||10)),recallTimeoutSec:X(e?.recallTimeoutSec),l0Api:f(e?.l0Api,{provider:r,url:a,key:i,model:ae,supportedProviders:["siliconflow","openrouter","custom"]}),embeddingApi:f(e?.embeddingApi,{provider:y,url:S,key:i,model:ie,supportedProviders:["siliconflow","custom"]}),rerankApi:f(e?.rerankApi,{provider:y,url:S,key:i,model:oe,supportedProviders:["siliconflow","custom"]})}}function R(){return{memoryMaintenanceEnabled:!1,api:{provider:"st",url:"",key:"",model:"",modelCache:[]},gen:{temperature:null,top_p:null,top_k:null,presence_penalty:null,frequency_penalty:null},trigger:{enabled:!1,notifyOnComplete:!1,interval:20,delayFloors:2,timing:"before_user",role:"system",useStream:!0,maxPerRun:100,wrapperHead:"",wrapperTail:"",forceInsertAtEnd:!1},ui:{hideSummarized:!0,keepVisibleCount:6,useVectorBoundary:!0},textFilterRules:[...P],prompts:{memoryTemplate:M},vector:g()}}function u(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function ce(e,t){if(!t||typeof t!="object")throw new Error("保存后读取配置失败");if(t.memoryMaintenanceEnabled!==e.memoryMaintenanceEnabled)throw new Error("memory_maintenance_setting_not_saved");const r=e?.api||{},a=t?.api||{};for(const i of["provider","url","key","model"])if(String(a[i]??"")!==String(r[i]??""))throw new Error(`保存校验失败：API ${i} 未写入服务器`)}function _(e=null){const t=R(),r=d=>{const o=Number.parseInt(d,10);return Number.isFinite(o)?Math.max(0,Math.min(50,o)):6};if(!e||typeof e!="object")return t;const a=Array.isArray(e.textFilterRules)?e.textFilterRules:Array.isArray(e.vector?.textFilterRules)?e.vector.textFilterRules:t.textFilterRules,i=e.prompts&&typeof e.prompts=="object"?e.prompts:{},n={memoryMaintenanceEnabled:e.memoryMaintenanceEnabled===!0,api:{...t.api,...e.api||{}},gen:{...t.gen,...e.gen||{}},trigger:{...t.trigger,...e.trigger||{}},ui:{...t.ui,...e.ui||{}},textFilterRules:a,prompts:{memoryTemplate:String(i.memoryTemplate||t.prompts.memoryTemplate||"").trim()||M},vector:g(e.vector||null)};return String(n.api.provider||"").toLowerCase()==="custom"&&(n.api.provider="openai"),n.trigger.timing==="manual"?(n.trigger.timing=t.trigger.timing,n.trigger.enabled=!1):re.has(n.trigger.timing)||(n.trigger.timing=t.trigger.timing),n.trigger.useStream===void 0&&(n.trigger.useStream=!0),n.trigger.notifyOnComplete=e?.trigger?.notifyOnComplete===!0,n.trigger.delayFloors=q(n.trigger.delayFloors),n.ui.hideSummarized=!!n.ui.hideSummarized,n.ui.keepVisibleCount=r(n.ui.keepVisibleCount),n.ui.useVectorBoundary=n.ui.useVectorBoundary!==!1,n}function s(e,{persistLocal:t=!0}={}){const r=_(e);return h=r,t&&Q(r,(a,i)=>m.warn(c,a,i)),r}function E(){if(h)return h;try{const e=localStorage.getItem(Z);return e?s(JSON.parse(e),{persistLocal:!1}):s(R(),{persistLocal:!1})}catch{return s(R(),{persistLocal:!1})}}function T(){return u(E())}function ue(e){try{const t=s(e);return l.set(p,t).catch(r=>{m.error(c,"保存面板配置失败",r)}),t}catch(t){return m.error(c,"保存面板配置失败",t),null}}function de(){const e=E();return e?.vector?u(e.vector):g()}function pe(){const e=T();return Array.isArray(e?.textFilterRules)?e.textFilterRules:P}function ye(e){try{const t=E();return t.vector=g(e||null),s(t),l.set(p,t).catch(r=>{m.error(c,"保存向量配置失败",r)}),u(t.vector)}catch(t){return m.error(c,"保存向量配置失败",t),null}}async function Se(e){const t=_(e);await l.setAndSave(p,t,{silent:!1}),l.clearCache();const r=_(await l.getStrict(p,null));return ce(t,r),s(r),u(r)}async function x(){const e=await l.getStrict(p,null);return e?u(_(e)):T()}function Y(e){return u(s(e))}async function _e(){const e=Y(await x());return m.info(c,"已从服务端加载面板配置"),e}export{ye as S,de as _,w as a,ue as b,U as c,F as d,Y as f,pe as g,T as h,O as i,D as l,me as m,M as n,C as o,Ee as p,L as r,N as s,ne as t,b as u,_e as v,Se as x,x as y};
