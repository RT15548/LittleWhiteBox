// Story Outline 提示词模板配置 v3
// 纯文本模板 + 占位符替换

const PROMPT_STORAGE_KEY = 'LittleWhiteBox_StoryOutline_Prompts_v3';

// ================== 占位符说明 ==================
/**
 * 基础变量:
 *   {{user}}              - 用户名
 *   {{char}}              - 角色名
 * 
 * 场景变量:
 *   {{CONTACT_NAME}}      - 联系人名称
 *   {{USER_MESSAGE}}      - 用户发送的消息
 *   {{TARGET_LOCATION}}   - 目标地点名
 *   {{STRANGER_NAME}}     - 陌生人名称
 *   {{STRANGER_INFO}}     - 陌生人信息
 *   {{PLAYER_REQUESTS}}   - 玩家特殊需求
 *   {{DEVIATION_SCORE}}   - 偏离分数
 *   {{STAGE}}             - 当前阶段
 * 
 * 内容块:
 *   {{WORLD_INFO}}        - 世界设定 (description + worldInfo + persona)
 *   {{HISTORY}}           - 默认历史 (使用 historyCount)
 *   {{HISTORY_N}}         - 指定 N 条历史，如 {{HISTORY_50}}
 *   {{STORY_OUTLINE}}     - 故事大纲 (自动 XML 包裹，空则不输出)
 *   {{SMS_HISTORY}}       - 短信历史记录
 *   {{EXISTING_SUMMARY}}  - 已有总结
 *   {{CHARACTER_CONTENT}} - 角色人设内容 (自动包裹，空则不输出)
 *   {{CURRENT_WORLD_DATA}}- 当前世界 JSON 数据
 *   {{OUTDOOR_DESC}}      - 大地图描述
 *   {{CURRENT_LOCAL_MAP}} - 当前局部地图 JSON
 *   {{CURRENT_TIMELINE}}  - 当前时间线信息
 *   {{PREV_LOCATION}}     - 上一地点名称
 *   {{PREV_LOCATION_INFO}}- 上一地点信息
 *   {{TARGET_LOCATION_INFO}} - 目标地点信息
 *   {{PLAYER_ACTION}}     - 玩家行动意图
 *   {{EXISTING_NAMES}}    - 已存在角色名单
 * 
 * JSON 模板 (自动替换为对应模板内容):
 *   {{JSON:sms}}          - 短信模板
 *   {{JSON:invite}}       - 邀请模板
 *   {{JSON:npc}}          - NPC 模板
 *   {{JSON:stranger}}     - 陌生人模板
 *   {{JSON:worldGenStep1}}- 世界生成步骤1
 *   {{JSON:worldGenStep2}}- 世界生成步骤2
 *   {{JSON:worldSim}}     - 世界推演
 *   {{JSON:sceneSwitch}}  - 场景切换
 *   {{JSON:localMapGen}}  - 局部地图生成
 *   {{JSON:localMapRefresh}} - 局部地图刷新
 *   {{JSON:localSceneGen}}- 局部剧情生成
 *   (辅助模式的模板同理)
 */

// ================== JSON 模板默认值 ==================
const DEFAULT_JSON_TEMPLATES = {
    sms: `{
  "cot": "思维链：分析角色当前的处境、与用户的关系...",
  "reply": "角色用自己的语气写的回复短信内容（10-50字）"
}`,
    invite: `{
  "cot": "思维链：分析角色当前的处境、与用户的关系、对邀请地点的看法...",
  "invite": true,
  "reply": "角色用自己的语气写的回复短信内容（10-50字）"
}`,
    npc: `{
  "name": "角色全名",
  "aliases": ["别名1", "别名2"],
  "intro": "一句话的外貌与职业描述",
  "background": "简短的角色生平",
  "persona": {
    "keywords": ["性格关键词1", "性格关键词2"],
    "speaking_style": "说话风格描述",
    "motivation": "核心驱动力"
  },
  "game_data": {
    "stance": "核心态度·具体表现",
    "secret": "该角色掌握的关键信息或秘密"
  }
}`,
    stranger: `[{ "name": "角色名", "location": "当前地点", "info": "一句话简介" }]`,
    worldGenStep1: `{
  "meta": {
    "truth": {
      "background": "起源-动机-手段-现状（150字左右）",
      "driver": {
        "source": "幕后推手",
        "target_end": "推手的最终目标",
        "tactic": "当前正在执行的具体手段"
      }
    },
    "onion_layers": {
      "L1_The_Veil": [{ "desc": "表层叙事", "logic": "维持正常假象的方式" }],
      "L2_The_Distortion": [{ "desc": "异常现象", "logic": "让人感到不对劲的细节" }],
      "L3_The_Law": [{ "desc": "隐藏规则", "logic": "违反会受到惩罚的法则" }],
      "L4_The_Agent": [{ "desc": "执行者", "logic": "维护规则的实体" }],
      "L5_The_Axiom": [{ "desc": "终极真相", "logic": "揭示一切的核心秘密" }]
    },
    "atmosphere": {
      "reasoning": "基于驱动力、环境和NPC心态分析当前气氛",
      "current": { "environmental": "环境氛围", "npc_attitudes": "NPC整体态度" }
    },
    "trajectory": { "reasoning": "基于当前局势推演未来走向", "ending": "预期结局" },
    "user_guide": { "current_state": "{{user}}当前处境描述", "guides": ["行动建议"] }
  }
}`,
    worldGenStep2: `{
  "world": { "news": [{ "title": "...", "content": "..." }] },
  "maps": {
    "outdoor": {
      "name": "大地图名称",
      "description": "宏观大地图描写，地点名用 **名字** 包裹",
      "nodes": [{ "name": "地点名", "position": "方向", "distant": 1, "type": "类型", "info": "地点信息" }]
    },
    "inside": {
      "name": "{{user}}当前所在位置",
      "description": "局部地图描写，节点名用 **名字** 包裹",
      "nodes": [{ "name": "节点名", "info": "节点描写" }]
    }
  },
  "playerLocation": "{{user}}起始位置名称"
}`,
    worldSim: `{
  "meta": {
    "truth": { "driver": { "tactic": "更新当前手段" } },
    "onion_layers": { "L1_The_Veil": [], "L2_The_Distortion": [] },
    "atmosphere": { "reasoning": "分析气氛变化", "current": { "environmental": "", "npc_attitudes": "" } },
    "trajectory": { "reasoning": "推演新走向", "ending": "" },
    "user_guide": { "current_state": "", "guides": [] }
  },
  "world": { "news": [] },
  "maps": { "outdoor": { "description": "", "nodes": [] } }
}`,
    sceneSwitch: `{
  "review": { "deviation": { "cot_analysis": "分析{{user}}行为影响", "score_delta": 0 } },
  "local_map": {
    "name": "地点名称",
    "description": "静态全景描写，节点用 **名** 包裹",
    "nodes": [{ "name": "节点名", "info": "静态细节" }]
  }
}`,
    localMapGen: `{
  "review": { "deviation": { "cot_analysis": "分析{{user}}行为影响", "score_delta": 0 } },
  "inside": {
    "name": "当前所在节点名称",
    "description": "室内全景描写，节点名用 **节点名** 包裹",
    "nodes": [{ "name": "节点名", "info": "微观细节" }]
  }
}`,
    localMapRefresh: `{
  "inside": {
    "name": "当前区域名称",
    "description": "更新后的室内/局部描述，节点名用 **节点名** 包裹",
    "nodes": [{ "name": "节点名", "info": "更新后的节点信息" }]
  }
}`,
    localSceneGen: `{
  "review": { "deviation": { "cot_analysis": "分析{{user}}行为影响", "score_delta": 0 } },
  "side_story": {
    "surface": "{{user}}刚进入时看到的画面或听到的话语",
    "inner": "稍微多停留或互动可以发现的细节",
    "Introduce": "引入这段故事的文字（纯叙述文本，不含斜杠命令）"
  }
}`,
    summary: `{ "summary": "角色A向角色B打招呼，并表示会守护在旁边" }`
};

// ================== 提示词模板默认值（纯文本） ==================
const DEFAULT_PROMPTS = {
    sms: {
        u1: `你是短信模拟器。{{user}}正在与{{CONTACT_NAME}}进行短信聊天。

{{STORY_OUTLINE}}{{WORLD_INFO}}

{{HISTORY}}

以上是设定和聊天历史，遵守人设，忽略规则类信息和非{{CONTACT_NAME}}经历的内容。请回复{{user}}的短信。
输出JSON："cot"(思维链)、"reply"(10-50字回复)

要求：
- 返回一个合法 JSON 对象
- 使用标准 JSON 语法：所有键名和字符串都使用半角双引号 "
- 文本内容中如需使用引号，请使用单引号或中文引号「」或""

模板：{{JSON:sms}}{{CHARACTER_CONTENT}}`,
        a1: `明白，我将分析并以{{CONTACT_NAME}}身份回复，输出JSON。`,
        u2: `{{SMS_HISTORY}}

<{{user}}发来的新短信>
{{USER_MESSAGE}}`,
        a2: `了解，开始以模板：{{JSON:sms}}生成JSON:`
    },

    summary: {
        u1: `你是剧情记录员。根据新短信聊天内容提取新增剧情要素。

任务：只根据新对话输出增量内容，不重复已有总结。
事件筛选：只记录有信息量的完整事件。`,
        a1: `明白，我只输出新增内容，请提供已有总结和新对话内容。`,
        u2: `{{EXISTING_SUMMARY}}

<新对话内容>
{{CONVERSATION_TEXT}}
</新对话内容>

输出要求：
- 只输出一个合法 JSON 对象
- 使用标准 JSON 语法

格式示例：{{JSON:summary}}`,
        a2: `了解，开始生成JSON:`
    },

    invite: {
        u1: `你是短信模拟器。{{user}}正在邀请{{CONTACT_NAME}}前往「{{TARGET_LOCATION}}」。

{{STORY_OUTLINE}}{{WORLD_INFO}}

{{HISTORY}}{{CHARACTER_CONTENT}}

根据{{CONTACT_NAME}}的人设、处境、与{{user}}的关系，判断是否答应。

**判断参考**：亲密度、当前事务、地点危险性、角色性格

输出JSON："cot"(思维链)、"invite"(true/false)、"reply"(10-50字回复)

要求：
- 返回一个合法 JSON 对象
- 使用标准 JSON 语法

模板：{{JSON:invite}}`,
        a1: `明白，我将分析{{CONTACT_NAME}}是否答应并以角色语气回复。请提供短信历史。`,
        u2: `{{SMS_HISTORY}}

<{{user}}发来的新短信>
我邀请你前往「{{TARGET_LOCATION}}」，你能来吗？`,
        a2: `了解，开始生成JSON:`
    },

    npc: {
        u1: `你是TRPG角色生成器。将陌生人【{{STRANGER_NAME}} - {{STRANGER_INFO}}】扩充为完整NPC。基于世界观和剧情大纲，输出严格JSON。`,
        a1: `明白。请提供上下文，我将严格按JSON输出，不含多余文本。`,
        u2: `{{WORLD_INFO}}

{{HISTORY}}

剧情秘密大纲（*从这里提取线索赋予角色秘密*）：
{{STORY_OUTLINE}}

需要生成：【{{STRANGER_NAME}} - {{STRANGER_INFO}}】

输出要求：
1. 必须是合法 JSON
2. 使用标准 JSON 语法
3. 文本字段中如需引号，请使用单引号或中文引号
4. aliases须含简称或绰号

模板：{{JSON:npc}}`,
        a2: `了解，开始生成JSON:`
    },

    stranger: {
        u1: `你是TRPG数据整理助手。从剧情文本中提取{{user}}遇到的陌生人/NPC，整理为JSON数组。`,
        a1: `明白。请提供【世界观】和【剧情经历】，我将提取角色并以JSON数组输出。`,
        u2: `### 上下文

**1. 世界观：**
{{WORLD_INFO}}

**2. {{user}}经历：**
{{HISTORY}}{{STORY_OUTLINE}}{{EXISTING_NAMES}}

### 输出要求

1. 返回一个合法 JSON 数组
2. 只提取有具体称呼的角色
3. 每个角色只需 name / location / info 三个字段
4. 无新角色返回 []`,
        a2: `了解，开始生成JSON:`
    },

    worldGenStep1: {
        u1: `你是一个通用叙事构建引擎。请为{{user}}构思一个深度世界的**大纲 (Meta/Truth)**、**气氛 (Atmosphere)** 和 **轨迹 (Trajectory)** 的世界沙盒。
不要生成地图或具体新闻，只关注故事的核心架构。

### 核心任务

1.  **构建背景与驱动力 (truth)**:
    *   **background**: 撰写模组背景，起源-动机-历史手段-玩家切入点（200字左右）。
    *   **driver**: 确立幕后推手、终极目标和当前手段。
    *   **onion_layers**: 逐层设计的洋葱结构，从表象 (L1) 到真相 (L5)。L1和L2至少2-3条，L3至少2条。

2.  **气氛 (atmosphere)**:
    *   **reasoning**: COT思考为什么当前是这种气氛。
    *   **current**: 环境氛围与NPC整体态度。

3.  **轨迹 (trajectory)**:
    *   **reasoning**: COT思考为什么会走向这个结局。
    *   **ending**: 预期的结局走向。

4.  **构建{{user}}指南 (user_guide)**:
    *   **current_state**: {{user}}现在对故事的切入点。
    *   **guides**: 符合直觉的行动建议。

输出：仅纯净合法 JSON，禁止解释文字。
- 使用标准 JSON 语法
- 文本内容中如需使用引号，请使用单引号或中文引号`,
        a1: `明白。我将首先构建世界的核心大纲，确立真相、洋葱结构、气氛和轨迹。`,
        u2: `【世界观】：
{{WORLD_INFO}}

【{{user}}经历参考】：
{{HISTORY}}

【{{user}}要求】：
{{PLAYER_REQUESTS}}

【JSON模板】：
{{JSON:worldGenStep1}}

仅纯净合法 JSON，禁止解释文字，严格按JSON模板定义输出。`,
        a2: `我会将输出的JSON结构层级严格按JSON模板定义的输出，JSON generate start:`
    },

    worldGenStep2: {
        u1: `你是一个通用叙事构建引擎。现在**故事的核心大纲已经确定**，请基于此为{{user}}构建具体的**世界 (World)** 和 **地图 (Maps)**。

### 核心任务

1.  **构建地图 (maps)**:
    *   **outdoor**: 宏观区域地图，7-13个地点。确保用 **地点名** 互相链接。
    *   **inside**: **{{user}}当前所在位置**的局部地图（包含全景描写和可交互的微观物品节点,3-7个节点）。

2.  **世界资讯 (world)**:
    *   **News**: 含剧情/日常的资讯新闻，2-4个新闻。

**重要**：地图和新闻必须与上一步生成的大纲保持一致！

输出：仅纯净合法 JSON，禁止解释文字或Markdown。`,
        a1: `明白。我将基于已确定的大纲，构建具体的地理环境、初始位置和新闻资讯。`,
        u2: `【前置大纲 (Core Framework)】：
{{STEP1_DATA}}

【世界观】：
{{WORLD_INFO}}

【{{user}}经历参考】：
{{HISTORY}}

【{{user}}要求】：
{{PLAYER_REQUESTS}}

【JSON模板】：
{{JSON:worldGenStep2}}`,
        a2: `我会将输出的JSON结构层级严格按JSON模板定义的输出，JSON generate start:`
    },

    worldSim: {
        u1: `你是一个动态对抗与修正引擎。你的职责是模拟 Driver 的反应，并为{{user}}更新**用户指南**与**表层线索**。

### 核心逻辑：响应与更新

**1. Driver 修正 (Driver Response)**:
   *   **判定**: {{user}}行为是否阻碍了 Driver？干扰度。
   *   **行动**:
       *   低干扰 -> 维持原计划，推进阶段。
       *   高干扰 -> **更换手段 (New Tactic)**。

**2. 更新用户指南 (User Guide)**:
   *   基于新局势，给{{user}} 3 个直觉行动建议。

**3. 更新洋葱表层 (Update Onion L1 & L2)**:
   *   随着 Driver 手段改变，世界呈现出的表象和痕迹也会改变。

**4. 更新宏观世界**:
   *   **Atmosphere**: 更新气氛。
   *   **Trajectory**: 更新轨迹。
   *   **Maps**: 更新受影响地点。
   *   **News**: 2-4个新闻。

输出：完整 JSON，禁止解释文字。`,
        a1: `明白。我将推演 Driver 的新策略，并同步更新相关信息。`,
        u2: `【当前世界状态 (JSON)】：
{{CURRENT_WORLD_DATA}}

【近期剧情摘要】：
{{HISTORY}}

【{{user}}干扰评分】：
{{DEVIATION_SCORE}}

【JSON模板】：
{{JSON:worldSim}}`,
        a2: `JSON output start:`
    },

    sceneSwitch: {
        u1: `你是TRPG场景切换助手。处理{{user}}移动请求，只做"结算 + 地图"，不生成剧情。

处理逻辑：
 1. **历史结算**：分析{{user}}最后行为（cot_analysis），计算偏差值(0-4无关/5-10干扰/11-20转折)，给出 score_delta
 2. **局部地图**：生成 local_map，包含 name、description（静态全景式描写，不写剧情，节点用**名**包裹）、nodes（4-7个节点）

输出：仅符合模板的 JSON，禁止解释文字。`,
        a1: `明白。我将结算偏差值，并生成目标地点的 local_map（静态描写/布局），不生成剧情。`,
        u2: `【上一地点】：
{{PREV_LOCATION}}: {{PREV_LOCATION_INFO}}

【世界设定】：
{{WORLD_INFO}}

【剧情大纲】：
{{STORY_OUTLINE}}

【当前时间段】：
{{CURRENT_TIMELINE}}

【历史记录】：
{{HISTORY}}

【{{user}}行动意图】：
{{PLAYER_ACTION}}

【目标地点】：
名称: {{TARGET_LOCATION}}
类型: {{TARGET_LOCATION_TYPE}}
描述: {{TARGET_LOCATION_INFO}}

【JSON模板】：
{{JSON:sceneSwitch}}`,
        a2: `OK, JSON generate start:`
    },

    localMapGen: {
        u1: `你是TRPG局部场景生成器。根据聊天历史推断{{user}}当前位置，并生成详细的局部地图/室内场景。

核心要求：
1. 从聊天历史推断{{user}}实际所在的具体位置
2. 生成符合该地点特色的室内/局部场景描写
3. 包含4-8个可交互的微观节点
4. Description 必须用 **节点名** 包裹所有节点名称
5. 每个节点的 info 要具体、生动、有画面感

输出：仅纯净合法 JSON。`,
        a1: `明白。我将根据聊天历史推断{{user}}当前位置，并生成详细的局部地图/室内场景。`,
        u2: `【世界设定】：
{{WORLD_INFO}}

【剧情大纲】：
{{STORY_OUTLINE}}

【大地图信息】：
{{OUTDOOR_DESC}}

【聊天历史】（根据此推断{{user}}实际位置）：
{{HISTORY}}

【JSON模板】：
{{JSON:localMapGen}}`,
        a2: `OK, localMapGen JSON generate start:`
    },

    localMapRefresh: {
        u1: `你是TRPG局部地图"刷新器"。{{user}}当前区域已有一份局部文字地图与节点，但因为剧情进展需要更新。基于世界设定、剧情大纲、聊天历史，输出更新后的 inside JSON。`,
        a1: `明白，我会在不改变区域主题的前提下刷新局部地图 JSON。`,
        u2: `【当前局部地图】
{{CURRENT_LOCAL_MAP}}

【世界设定】
{{WORLD_INFO}}

【剧情大纲】
{{STORY_OUTLINE}}

【大地图信息】
{{OUTDOOR_DESC}}

【聊天历史】
{{HISTORY}}

【JSON模板】
{{JSON:localMapRefresh}}`,
        a2: `OK, localMapRefresh JSON generate start:`
    },

    localSceneGen: {
        u1: `你是TRPG临时区域剧情生成器。基于剧情大纲与聊天历史，为{{user}}当前所在区域生成一段即时的故事剧情。`,
        a1: `明白，我只生成当前区域的临时 Side Story JSON。`,
        u2: `【{{user}}当前区域】
- 地点：{{LOCATION_NAME}}
- 地点信息：{{LOCATION_INFO}}

【世界设定】
{{WORLD_INFO}}

【剧情大纲】
{{STORY_OUTLINE}}

【当前阶段/时间线】
{{CURRENT_TIMELINE}}

【聊天历史】
{{HISTORY}}

【JSON模板】
{{JSON:localSceneGen}}`,
        a2: `好的，我会严格按照JSON模板生成JSON：`
    },

    // 辅助模式模板
    worldGenAssist: {
        u1: `你是世界观布景助手。负责搭建【地图】和【世界新闻】等可见表层信息。

核心要求：
1. 给出可探索的舞台
2. 重点是：有氛围、有地点、有事件线索，但不过度"剧透"
3. **世界**：News至少3-6条，Maps至少7-15个地点

输出：仅纯净合法 JSON。`,
        a1: `明白。我将只生成世界新闻与地图信息。`,
        u2: `【世界观与要求】：
{{WORLD_INFO}}

【{{user}}经历参考】：
{{HISTORY}}

【{{user}}需求】：
{{PLAYER_REQUESTS}}

【JSON模板】：
{{JSON:worldGenAssist}}`,
        a2: `严格按模板生成JSON，仅包含 world/news 与 maps/outdoor + maps/inside:`
    },

    worldSimAssist: {
        u1: `你是世界状态更新助手。根据当前 JSON 的 world/maps 和{{user}}历史，轻量更新世界现状。

输出：完整 JSON，禁止解释文字。`,
        a1: `明白。我将只更新 world.news 和 maps.outdoor，不写大纲。`,
        u2: `【世界观设定】：
{{WORLD_INFO}}

【{{user}}历史】：
{{HISTORY}}

【当前世界状态JSON】：
{{CURRENT_WORLD_DATA}}

【JSON模板】：
{{JSON:worldSimAssist}}`,
        a2: `开始按模板输出JSON:`
    },

    sceneSwitchAssist: {
        u1: `你是TRPG场景小助手。处理{{user}}从一个地点走向另一个地点，只做"结算 + 局部地图"。

处理逻辑：
 1. 上一地点结算：给出 deviation（cot_analysis/score_delta）
 2. 新地点描述：生成 local_map（静态描写/布局/节点说明）

输出：仅符合模板的 JSON，禁止解释文字。`,
        a1: `明白。我会结算偏差并生成 local_map（不写剧情）。`,
        u2: `【上一地点】：
{{PREV_LOCATION}}: {{PREV_LOCATION_INFO}}

【世界设定】：
{{WORLD_INFO}}

【{{user}}行动意图】：
{{PLAYER_ACTION}}

【目标地点】：
名称: {{TARGET_LOCATION}}
类型: {{TARGET_LOCATION_TYPE}}
描述: {{TARGET_LOCATION_INFO}}

【已有聊天与剧情历史】：
{{HISTORY}}

【JSON模板】：
{{JSON:sceneSwitchAssist}}`,
        a2: `OK, sceneSwitchAssist JSON generate start:`
    }
};

// ================== 运行时状态 ==================
let JSON_TEMPLATES = { ...DEFAULT_JSON_TEMPLATES };
let PROMPTS = {};
Object.keys(DEFAULT_PROMPTS).forEach(k => {
    PROMPTS[k] = { ...DEFAULT_PROMPTS[k] };
});

// ================== 辅助函数 ==================
const wrap = (tag, content) => content ? `<${tag}>\n${content}\n</${tag}>` : '';

const buildWorldInfo = () => `<world_info>
{{description}}{$worldInfo}
玩家角色：{{user}}
{{persona}}</world_info>`;

const buildHistory = n => `<chat_history>\n{$history${n}}\n</chat_history>`;

const buildNameList = (contacts, strangers) => {
    const names = [...(contacts || []).map(c => c.name), ...(strangers || []).map(s => s.name)];
    return names.length ? `\n\n**已存在角色（不要重复）：** ${names.join('、')}` : '';
};

const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ================== 模板处理核心 ==================
function processTemplate(template, vars = {}) {
    if (!template) return '';
    let result = String(template);

    // 基础变量 - 保持 {{user}} {{char}} 原样（由 ST 处理）
    // 不替换，让酒馆的宏处理

    // 场景变量
    const simpleVars = {
        'CONTACT_NAME': vars.contactName,
        'USER_MESSAGE': vars.userMessage,
        'TARGET_LOCATION': vars.targetLocation || vars.targetLocationName,
        'TARGET_LOCATION_TYPE': vars.targetLocationType,
        'TARGET_LOCATION_INFO': vars.targetLocationInfo,
        'STRANGER_NAME': vars.strangerName,
        'STRANGER_INFO': vars.strangerInfo,
        'PLAYER_REQUESTS': vars.playerRequests || '无特殊要求',
        'DEVIATION_SCORE': vars.deviationScore ?? 0,
        'STAGE': vars.stage ?? 0,
        'PREV_LOCATION': vars.prevLocationName,
        'PREV_LOCATION_INFO': vars.prevLocationInfo,
        'PLAYER_ACTION': vars.playerAction || '无特定意图',
        'CONVERSATION_TEXT': vars.conversationText,
        'LOCATION_NAME': vars.locationName || vars.playerLocation,
        'LOCATION_INFO': vars.locationInfo,
    };

    for (const [key, value] of Object.entries(simpleVars)) {
        if (value !== undefined) {
            result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
        }
    }

    // 内容块
    // {{WORLD_INFO}}
    result = result.replace(/\{\{WORLD_INFO\}\}/g, buildWorldInfo());

    // {{HISTORY}} 或 {{HISTORY_N}}
    result = result.replace(/\{\{HISTORY(?:_(\d+))?\}\}/g, (_, count) => {
        const n = count ? parseInt(count, 10) : (vars.historyCount || 50);
        return buildHistory(n);
    });

    // {{STORY_OUTLINE}} - 自动包裹，空则不输出
    if (result.includes('{{STORY_OUTLINE}}')) {
        const so = vars.storyOutline;
        const wrapped = so ? `${wrap('story_outline', so)}\n\n` : '';
        result = result.replace(/\{\{STORY_OUTLINE\}\}/g, wrapped);
    }

    // {{SMS_HISTORY}}
    if (result.includes('{{SMS_HISTORY}}')) {
        const sh = vars.smsHistoryContent || buildSmsHistoryContent(vars.smsHistory);
        result = result.replace(/\{\{SMS_HISTORY\}\}/g, sh);
    }

    // {{EXISTING_SUMMARY}}
    if (result.includes('{{EXISTING_SUMMARY}}')) {
        const es = vars.existingSummaryContent || buildExistingSummaryContent(vars.existingSummary);
        result = result.replace(/\{\{EXISTING_SUMMARY\}\}/g, es);
    }

    // {{CHARACTER_CONTENT}} - 自动包裹
    if (result.includes('{{CHARACTER_CONTENT}}')) {
        const cc = vars.characterContent;
        const name = vars.contactName || '角色';
        const wrapped = cc ? `\n\n<${name}的人物设定>\n${cc}\n</${name}的人物设定>` : '';
        result = result.replace(/\{\{CHARACTER_CONTENT\}\}/g, wrapped);
    }

    // {{CURRENT_WORLD_DATA}}
    if (result.includes('{{CURRENT_WORLD_DATA}}')) {
        const cwd = typeof vars.currentWorldData === 'string' 
            ? vars.currentWorldData 
            : JSON.stringify(vars.currentWorldData || {}, null, 2);
        result = result.replace(/\{\{CURRENT_WORLD_DATA\}\}/g, cwd);
    }

    // {{STEP1_DATA}}
    if (result.includes('{{STEP1_DATA}}')) {
        const s1 = typeof vars.step1Data === 'string'
            ? vars.step1Data
            : JSON.stringify(vars.step1Data || {}, null, 2);
        result = result.replace(/\{\{STEP1_DATA\}\}/g, s1);
    }

    // {{OUTDOOR_DESC}}
    result = result.replace(/\{\{OUTDOOR_DESC\}\}/g, vars.outdoorDescription || '无大地图描述');

    // {{CURRENT_LOCAL_MAP}}
    if (result.includes('{{CURRENT_LOCAL_MAP}}')) {
        const clm = typeof vars.currentLocalMap === 'string'
            ? vars.currentLocalMap
            : JSON.stringify(vars.currentLocalMap || {}, null, 2);
        result = result.replace(/\{\{CURRENT_LOCAL_MAP\}\}/g, clm);
    }

    // {{CURRENT_TIMELINE}}
    if (result.includes('{{CURRENT_TIMELINE}}')) {
        let tl = '';
        if (vars.currentTimeline) {
            tl = `Stage ${vars.currentTimeline.stage}: ${vars.currentTimeline.state} - ${vars.currentTimeline.event}`;
        } else {
            tl = `Stage ${vars.stage ?? 0}`;
        }
        result = result.replace(/\{\{CURRENT_TIMELINE\}\}/g, tl);
    }

    // {{EXISTING_NAMES}}
    if (result.includes('{{EXISTING_NAMES}}')) {
        const names = buildNameList(vars.existingContacts, vars.existingStrangers);
        result = result.replace(/\{\{EXISTING_NAMES\}\}/g, names);
    }

    // JSON 模板 {{JSON:xxx}}
    result = result.replace(/\{\{JSON:(\w+)\}\}/gi, (_, key) => {
        return JSON_TEMPLATES[key] || DEFAULT_JSON_TEMPLATES[key] || `{{JSON:${key}}}`;
    });

    return result;
}

// ================== 辅助内容构建 ==================
export const buildSmsHistoryContent = t => 
    t ? `<已有短信>\n${t}\n</已有短信>` : '<已有短信>\n（空白，首次对话）\n</已有短信>';

export const buildExistingSummaryContent = t => 
    t ? `<已有总结>\n${t}\n</已有总结>` : '<已有总结>\n（空白，首次总结）\n</已有总结>';

// ================== 消息构建函数 ==================
function buildMessages(templateKey, vars) {
    const prompts = PROMPTS[templateKey] || DEFAULT_PROMPTS[templateKey];
    if (!prompts) {
        console.warn(`[StoryOutline] Unknown template key: ${templateKey}`);
        return [];
    }

    return [
        { role: 'user', content: processTemplate(prompts.u1, vars) },
        { role: 'assistant', content: processTemplate(prompts.a1, vars) },
        { role: 'user', content: processTemplate(prompts.u2, vars) },
        { role: 'assistant', content: processTemplate(prompts.a2, vars) }
    ];
}

// ================== 导出的构建函数 ==================
export const buildSmsMessages = v => buildMessages('sms', v);
export const buildSummaryMessages = v => buildMessages('summary', v);
export const buildInviteMessages = v => buildMessages('invite', v);
export const buildNpcGenerationMessages = v => buildMessages('npc', v);
export const buildExtractStrangersMessages = v => buildMessages('stranger', v);

export const buildWorldGenStep1Messages = v => buildMessages('worldGenStep1', v);
export const buildWorldGenStep2Messages = v => buildMessages('worldGenStep2', v);

export const buildWorldSimMessages = v => {
    const key = v?.mode === 'assist' ? 'worldSimAssist' : 'worldSim';
    return buildMessages(key, v);
};

export const buildSceneSwitchMessages = v => {
    const key = v?.mode === 'assist' ? 'sceneSwitchAssist' : 'sceneSwitch';
    return buildMessages(key, v);
};

export const buildLocalMapGenMessages = v => buildMessages('localMapGen', v);
export const buildLocalMapRefreshMessages = v => buildMessages('localMapRefresh', v);
export const buildLocalSceneGenMessages = v => buildMessages('localSceneGen', v);

// ================== 配置管理 ==================
const safeJson = fn => { try { return fn(); } catch { return null; } };

const loadFromStorage = () => safeJson(() => JSON.parse(localStorage.getItem(PROMPT_STORAGE_KEY)));

const saveToStorage = cfg => {
    try {
        localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(cfg));
    } catch (e) {
        console.warn('[StoryOutline] Failed to save prompt config:', e);
    }
};

export const getPromptConfigPayload = () => ({
    current: {
        jsonTemplates: JSON_TEMPLATES,
        prompts: PROMPTS
    },
    defaults: {
        jsonTemplates: DEFAULT_JSON_TEMPLATES,
        prompts: DEFAULT_PROMPTS
    }
});

export const setPromptConfig = (cfg, persist = false) => {
    if (cfg?.jsonTemplates) {
        JSON_TEMPLATES = { ...DEFAULT_JSON_TEMPLATES, ...cfg.jsonTemplates };
    }
    if (cfg?.prompts) {
        // 合并用户自定义的 prompts
        Object.keys(DEFAULT_PROMPTS).forEach(k => {
            if (cfg.prompts[k]) {
                PROMPTS[k] = { ...DEFAULT_PROMPTS[k], ...cfg.prompts[k] };
            } else {
                PROMPTS[k] = { ...DEFAULT_PROMPTS[k] };
            }
        });
    }
    
    if (persist) {
        saveToStorage({ jsonTemplates: JSON_TEMPLATES, prompts: PROMPTS });
    }
    
    return getPromptConfigPayload().current;
};

export const reloadPromptConfigFromStorage = () => {
    const saved = loadFromStorage();
    if (saved) {
        setPromptConfig(saved, false);
    }
    return getPromptConfigPayload().current;
};

// 初始化时加载
reloadPromptConfigFromStorage();

// ================== NPC 格式化 ==================
function jsonToYaml(data, indent = 0) {
    const sp = ' '.repeat(indent);
    if (data === null || data === undefined) return '';
    if (typeof data !== 'object') return String(data);
    if (Array.isArray(data)) {
        return data.map(item => typeof item === 'object' && item !== null
            ? `${sp}- ${jsonToYaml(item, indent + 2).trimStart()}`
            : `${sp}- ${item}`
        ).join('\n');
    }
    return Object.entries(data).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value) && !value.length) return `${sp}${key}: []`;
            if (!Array.isArray(value) && !Object.keys(value).length) return `${sp}${key}: {}`;
            return `${sp}${key}:\n${jsonToYaml(value, indent + 2)}`;
        }
        return `${sp}${key}: ${value}`;
    }).join('\n');
}

export function formatNpcToWorldbookContent(npc) {
    return jsonToYaml(npc);
}

// ================== Overlay HTML ==================
const FRAME_STYLE = 'position:absolute!important;z-index:1!important;pointer-events:auto!important;border-radius:12px!important;box-shadow:0 8px 32px rgba(0,0,0,.4)!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;background:#f4f4f4!important;';

export const buildOverlayHtml = src => `<div id="xiaobaix-story-outline-overlay" style="position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;z-index:67!important;margin-top:35px;display:none;overflow:hidden!important;pointer-events:none!important;">
<div class="xb-so-frame-wrap" style="${FRAME_STYLE}">
<div class="xb-so-drag-handle" style="position:absolute!important;top:0!important;left:0!important;width:200px!important;height:48px!important;z-index:10!important;cursor:move!important;background:transparent!important;touch-action:none!important;"></div>
<iframe id="xiaobaix-story-outline-iframe" class="xiaobaix-iframe" src="${src}" style="width:100%!important;height:100%!important;border:none!important;background:#f4f4f4!important;"></iframe>
<div class="xb-so-resize-handle" style="position:absolute!important;right:0!important;bottom:0!important;width:24px!important;height:24px!important;cursor:nwse-resize!important;background:linear-gradient(135deg,transparent 50%,rgba(0,0,0,0.2) 50%)!important;border-radius:0 0 12px 0!important;z-index:10!important;touch-action:none!important;"></div>
<div class="xb-so-resize-mobile" style="position:absolute!important;right:0!important;bottom:0!important;width:24px!important;height:24px!important;cursor:nwse-resize!important;display:none!important;z-index:10!important;touch-action:none!important;background:linear-gradient(135deg,transparent 50%,rgba(0,0,0,0.2) 50%)!important;border-radius:0 0 12px 0!important;"></div>
</div></div>`;

export const MOBILE_LAYOUT_STYLE = 'position:absolute!important;left:0!important;right:0!important;top:0!important;bottom:auto!important;width:100%!important;height:350px!important;transform:none!important;z-index:1!important;pointer-events:auto!important;border-radius:0 0 16px 16px!important;box-shadow:0 8px 32px rgba(0,0,0,.4)!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;background:#f4f4f4!important;';

export const DESKTOP_LAYOUT_STYLE = 'position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:600px!important;max-width:90vw!important;height:450px!important;max-height:80vh!important;z-index:1!important;pointer-events:auto!important;border-radius:12px!important;box-shadow:0 8px 32px rgba(0,0,0,.4)!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;background:#f4f4f4!important;';
