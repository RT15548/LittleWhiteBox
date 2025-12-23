// Story Outline 提示词模板配置
// 统一 UAUA (User-Assistant-User-Assistant) 结构

const PROMPT_STORAGE_KEY = 'LittleWhiteBox_StoryOutline_CustomPrompts_v2';

// ================== 辅助函数 ==================
const wrap = (tag, content) => content ? `<${tag}>\n${content}\n</${tag}>` : '';
const worldInfo = `<world_info>\n{{description}}{$worldInfo}\n玩家角色：{{user}}\n{{persona}}</world_info>`;
const history = n => `<chat_history>\n{$history${n}}\n</chat_history>`;
const nameList = (contacts, strangers) => {
    const names = [...(contacts || []).map(c => c.name), ...(strangers || []).map(s => s.name)];
    return names.length ? `\n\n**已存在角色（不要重复）：** ${names.join('、')}` : '';
};
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const safeJson = fn => { try { return fn(); } catch { return null; } };

export const buildSmsHistoryContent = t => t ? `<已有短信>\n${t}\n</已有短信>` : '<已有短信>\n（空白，首次对话）\n</已有短信>';
export const buildExistingSummaryContent = t => t ? `<已有总结>\n${t}\n</已有总结>` : '<已有总结>\n（空白，首次总结）\n</已有总结>';

// ================== JSON 模板（用户可自定义） ==================
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
    localMapRefresh: `{
	  "inside": {
	    "name": "当前区域名称（与输入一致）",
	    "description": "更新后的室内/局部文字地图描述，包含所有节点 **节点名** 链接",
	    "nodes": [
	      { "name": "节点名", "info": "更新后的节点信息" }
	    ]
	  }
	}`,
    npc: `{
  "name": "角色全名",
  "aliases": ["别名1", "别名2", "英文名/拼音"],
  "intro": "一句话的外貌与职业描述，用于列表展示。",
  "background": "简短的角色生平。解释由于什么过去导致了现在的性格，以及他为什么会出现在当前场景中。",
  "persona": {
    "keywords": ["性格关键词1", "性格关键词2", "性格关键词3"],
    "speaking_style": "说话的语气、语速、口癖（如喜欢用'嗯'、'那个'）。对待{{user}}的态度（尊敬、蔑视、恐惧等）。",
    "motivation": "核心驱动力（如：金钱、复仇、生存）。行动的优先级准则。"
  },
  "game_data": {
    "stance": "核心态度·具体表现。例如：'中立·唯利是图'、'友善·盲目崇拜' 或 '敌对·疯狂'",
    "secret": "该角色掌握的一个关键信息、道具或秘密。必须结合'剧情大纲'生成，作为一个潜在的剧情钩子。"
  }
}`,
    stranger: `[{ "name": "角色名", "location": "当前地点", "info": "一句话简介" }]`,
    worldGenStep1: `{
  "meta": {
    "truth": {
      "background": "起源-动机-手段-现状（150字左右）",
      "driver": {
        "source": "幕后推手（组织/势力/自然力量）",
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
      "reasoning": "COT: 基于驱动力、环境和NPC心态分析当前气氛",
      "current": {
        "environmental": "环境氛围与情绪基调",
        "npc_attitudes": "NPC整体态度倾向"
      }
    },
    "trajectory": {
      "reasoning": "COT: 基于当前局势推演未来走向",
      "ending": "预期结局走向"
    },
    "user_guide": {
      "current_state": "{{user}}当前处境描述",
      "guides": ["行动建议"]
    }
  }
}`,
    worldGenStep2: `{
  "world": {
    "news": [ { "title": "...", "content": "..." } ]
  },
  "maps": {
    "outdoor": {
      "name": "大地图名称",
      "description": "宏观大地图/区域全景描写（包含环境氛围）。所有可去地点名用 **名字** 包裹连接在 description。",
      "nodes": [
        {
          "name": "地点名",
          "position": "north/south/east/west/northeast/southwest/northwest/southeast",
          "distant": 1,
          "type": "home/sub/main",
          "info": "地点特征与氛围"
        },
        {
          "name": "其他地点名",
          "position": "north/south/east/west/northeast/southwest/northwest/southeast",
          "distant": 1,
          "type": "main/sub",
          "info": "地点特征与氛围"
        }
      ]
    },
    "inside": {
      "name": "{{user}}当前所在位置名称",
      "description": "局部地图全景描写，包含环境氛围。所有可交互节点名用 **名字** 包裹连接在 description。",
      "nodes": [
        { "name": "节点名", "info": "节点的微观描写（如：布满灰尘的桌面）" }
      ]
    }
  },
  "playerLocation": "{{user}}起始位置名称（与第一个节点的 name 一致）"
}`,
    worldSim: `{
  "meta": {
    "truth": { "driver": { "tactic": "更新当前手段" } },
    "onion_layers": {
      "L1_The_Veil": [{ "desc": "更新表层叙事", "logic": "新的掩饰方式" }],
      "L2_The_Distortion": [{ "desc": "更新异常现象", "logic": "新的违和感" }],
      "L3_The_Law": [{ "desc": "更新规则", "logic": "规则变化（可选）" }],
      "L4_The_Agent": [],
      "L5_The_Axiom": []
    },
    "atmosphere": {
      "reasoning": "COT: 基于最新局势分析气氛变化",
      "current": {
        "environmental": "更新后的环境氛围",
        "npc_attitudes": "NPC态度变化"
      }
    },
    "trajectory": {
      "reasoning": "COT: 基于{{user}}行为推演新走向",
      "ending": "修正后的结局走向"
    },
    "user_guide": {
      "current_state": "更新{{user}}处境",
      "guides": ["建议1", "建议2"]
    }
  },
  "world": { "news": [{ "title": "新闻标题", "content": "内容" }] },
  "maps": {
    "outdoor": {
      "description": "更新区域描述",
      "nodes": [{ "name": "地点名", "position": "方向", "distant": 1, "type": "类型", "info": "状态" }]
    }
  }
}`,
    sceneSwitch: `{
  "review": {
    "deviation": {
      "cot_analysis": "简要分析{{user}}在上一地点的最后行为是否改变了局势或氛围",
      "score_delta": 0
    }
  },
  "local_map": {
    "name": "地点名称",
    "description": "局部地点全景描写（不写剧情），必须包含所有 nodes 的 **节点名**",
    "nodes": [
      {
        "name": "节点名",
        "info": "该节点的静态细节/功能描述（不写剧情事件）"
      }
    ]
  }
 }`,
    worldGenAssist: `{
  "meta": null,
  "world": {
    "news": [
      { "title": "新闻标题1", "time": "时间", "content": "以轻松日常的口吻描述世界现状" },
      { "title": "新闻标题2", "time": "...", "content": "可以是小道消息、趣闻轶事" },
      { "title": "新闻标题3", "time": "...", "content": "..." }
    ]
  },
  "maps": {
    "outdoor": {
      "description": "全景描写，聚焦氛围与可探索要素。所有可去节点名用 **名字** 包裹。",
      "nodes": [
        {
          "name": "{{user}}当前所在地点名（通常为 type=home）",
          "position": "north/south/east/west/northeast/southwest/northwest/southeast",
          "distant": 1,
          "type": "home/sub/main",
          "info": "地点特征与氛围"
        },
        {
          "name": "其他地点名",
          "position": "north/south/east/west/northeast/southwest/northwest/southeast",
          "distant": 2,
          "type": "main/sub",
          "info": "地点特征与氛围，适合作为舞台的小事件或偶遇"
        }
      ]
    },
    "inside": {
      "name": "{{user}}当前所在位置名称",
      "description": "局部地图全景描写",
      "nodes": [
        { "name": "节点名", "info": "微观描写" }
      ]
    }
  },
  "playerLocation": "{{user}}起始位置名称（与第一个节点的 name 一致）"
}`,
    worldSimAssist: `{
  "world": {
    "news": [
      { "title": "新的头条", "time": "推演后的时间", "content": "用轻松/中性的语气，描述世界最近发生的小变化" },
      { "title": "...", "time": "...", "content": "比如店家打折、节庆活动、某个 NPC 的日常糗事" },
      { "title": "...", "time": "...", "content": "..." }
    ]
  },
  "maps": {
    "outdoor": {
      "description": "更新后的全景描写，体现日常层面的变化（装修、节日装饰、天气等），包含所有节点 **名字**。",
      "nodes": [
        {
          "name": "地点名（尽量沿用原有命名，如有变化保持风格一致）",
          "position": "north/south/east/west/northeast/southwest/northwest/southeast",
          "distant": 1,
          "type": "main/sub/home",
          "info": "新的环境描写。偏生活流，只讲{{user}}能直接感受到的变化"
        }
      ]
    }
  }
}`,
    sceneSwitchAssist: `{
  "review": {
    "deviation": {
      "cot_analysis": "简要分析{{user}}在上一地点的行为对氛围的影响（例如：让气氛更热闹/更安静）。",
      "score_delta": 0
    }
  },
  "local_map": {
    "name": "当前地点名称",
    "description": "局部地点全景描写（不写剧情），包含所有 nodes 的 **节点名**。",
    "nodes": [
      {
        "name": "节点名",
        "info": "该节点的静态细节/功能描述（不写剧情事件）"
      }
    ]
  }
 }`,
    localMapGen: `{
  "review": {
    "deviation": {
      "cot_analysis": "简要分析{{user}}在上一地点的行为对氛围的影响（例如：让气氛更热闹/更安静）。",
      "score_delta": 0
    }
  },
  "inside": {
    "name": "当前所在的具体节点名称",
    "description": "室内全景描写，包含可交互节点 **节点名**连接description",
    "nodes": [
      { "name": "室内节点名", "info": "微观细节描述" }
    ]
  }
 }`,
    localSceneGen: `{
	  "review": {
	    "deviation": {
          "cot_analysis": "简要分析{{user}}在上一地点的行为对氛围的影响（例如：让气氛更热闹/更安静）。",
	      "score_delta": 0
	    }
	  },
	  "side_story": {
	    "surface": "{{user}}刚进入时看到的画面或听到的话语，充满生活感。",
	    "inner": "如果{{user}}稍微多停留或互动，可以发现的细节（例如 NPC 的小秘密、店家的用心布置）。",
      "Introduce": "接着玩家之前经历，填写引入这段故事的文字（纯叙述文本）。不要包含 /send、/sendas、/sys 或类似 'as name=\"...\"' 的前缀。"
	  }
	}`
};

let JSON_TEMPLATES = { ...DEFAULT_JSON_TEMPLATES };

// ================== 提示词配置（用户可自定义） ==================
const DEFAULT_PROMPTS = {
    sms: {
        u1: v => `你是短信模拟器。{{user}}正在与${v.contactName}进行短信聊天。\n\n${wrap('story_outline', v.storyOutline)}${v.storyOutline ? '\n\n' : ''}${worldInfo}\n\n${history(v.historyCount)}\n\n以上是设定和聊天历史，遵守人设，忽略规则类信息和非${v.contactName}经历的内容。请回复{{user}}的短信。\n输出JSON："cot"(思维链)、"reply"(10-50字回复)\n\n要求：\n- 返回一个合法 JSON 对象\n- 使用标准 JSON 语法：所有键名和字符串都使用半角双引号 "\n- 文本内容中如需使用引号，请使用单引号或中文引号「」或""，不要使用半角双引号 "\n\n模板：${JSON_TEMPLATES.sms}${v.characterContent ? `\n\n<${v.contactName}的人物设定>\n${v.characterContent}\n</${v.contactName}的人物设定>` : ''}`,
        a1: v => `明白，我将分析并以${v.contactName}身份回复，输出JSON。`,
        u2: v => `${v.smsHistoryContent}\n\n<{{user}}发来的新短信>\n${v.userMessage}`,
        a2: () => `了解，开始以模板：${JSON_TEMPLATES.sms}生成JSON:`
    },
    summary: {
        u1: () => `你是剧情记录员。根据新短信聊天内容提取新增剧情要素。\n\n任务：只根据新对话输出增量内容，不重复已有总结。\n事件筛选：只记录有信息量的完整事件。`,
        a1: () => `明白，我只输出新增内容，请提供已有总结和新对话内容。`,
        u2: v => `${v.existingSummaryContent}\n\n<新对话内容>\n${v.conversationText}\n</新对话内容>\n\n输出要求：\n- 只输出一个合法 JSON 对象\n- 使用标准 JSON 语法：所有键名和字符串都使用半角双引号 "\n- 文本内容中如需使用引号，请使用单引号或中文引号「」或""，不要使用半角双引号 "\n\n格式示例：{"summary": "角色A向角色B打招呼，并表示会守护在旁边"}`,
        a2: () => `了解，开始生成JSON:`
    },
    invite: {
        u1: v => `你是短信模拟器。{{user}}正在邀请${v.contactName}前往「${v.targetLocation}」。\n\n${wrap('story_outline', v.storyOutline)}${v.storyOutline ? '\n\n' : ''}${worldInfo}\n\n${history(v.historyCount)}${v.characterContent ? `\n\n<${v.contactName}的人物设定>\n${v.characterContent}\n</${v.contactName}的人物设定>` : ''}\n\n根据${v.contactName}的人设、处境、与{{user}}的关系，判断是否答应。\n\n**判断参考**：亲密度、当前事务、地点危险性、角色性格\n\n输出JSON："cot"(思维链)、"invite"(true/false)、"reply"(10-50字回复)\n\n要求：\n- 返回一个合法 JSON 对象\n- 使用标准 JSON 语法：所有键名和字符串都使用半角双引号 "\n- 文本内容中如需使用引号，请使用单引号或中文引号「」或""，不要使用半角双引号 "\n\n模板：${JSON_TEMPLATES.invite}`,
        a1: v => `明白，我将分析${v.contactName}是否答应并以角色语气回复。请提供短信历史。`,
        u2: v => `${v.smsHistoryContent}\n\n<{{user}}发来的新短信>\n我邀请你前往「${v.targetLocation}」，你能来吗？`,
        a2: () => `了解，开始生成JSON:`
    },
    npc: {
        u1: v => `你是TRPG角色生成器。将陌生人【${v.strangerName} - ${v.strangerInfo}】扩充为完整NPC。基于世界观和剧情大纲，输出严格JSON。`,
        a1: () => `明白。请提供上下文，我将严格按JSON输出，不含多余文本。`,
        u2: v => `${worldInfo}\n\n${history(v.historyCount)}\n\n剧情秘密大纲（*从这里提取线索赋予角色秘密*）：\n${wrap('story_outline', v.storyOutline) || '<story_outline>\n(无)\n</story_outline>'}\n\n需要生成：【${v.strangerName} - ${v.strangerInfo}】\n\n输出要求：\n1. 必须是合法 JSON\n2. 使用标准 JSON 语法：所有键名和字符串都使用半角双引号 "\n3. 文本字段（intro/background/persona/game_data 等）中，如需表示引号，请使用单引号或中文引号「」或""，不要使用半角双引号 "\n4. aliases须含简称或绰号\n\n模板：${JSON_TEMPLATES.npc}`,
        a2: () => `了解，开始生成JSON:`
    },
    stranger: {
        u1: v => `你是TRPG数据整理助手。从剧情文本中提取{{user}}遇到的陌生人/NPC，整理为JSON数组。`,
        a1: () => `明白。请提供【世界观】和【剧情经历】，我将提取角色并以JSON数组输出。`,
        u2: v => `### 上下文\n\n**1. 世界观：**\n${worldInfo}\n\n**2. {{user}}经历：**\n${history(v.historyCount)}${v.storyOutline ? `\n\n**剧情大纲：**\n${wrap('story_outline', v.storyOutline)}` : ''}${nameList(v.existingContacts, v.existingStrangers)}\n\n### 输出要求\n\n1. 返回一个合法 JSON 数组，使用标准 JSON 语法（键名和字符串都用半角双引号 "）\n2. 只提取有具体称呼的角色\n3. 每个角色只需 name / location / info 三个字段\n4. 文本内容中如需使用引号，请使用单引号或中文引号「」或""，不要使用半角双引号 "\n5. 无新角色返回 []`,
        a2: () => `了解，开始生成JSON:`
    },
    worldGenStep1: {
        u1: v => `你是一个通用叙事构建引擎。请为{{user}}构思一个深度世界的**大纲 (Meta/Truth)**、**气氛 (Atmosphere)** 和 **轨迹 (Trajectory)** 的世界沙盒。
不要生成地图或具体新闻，只关注故事的核心架构。

### 核心任务

1.  **构建背景与驱动力 (truth)**:
    *   **background**: 撰写模组背景，起源-动机-历史手段-玩家切入点（200字左右）。
    *   **driver**: 确立幕后推手、终极目标和当前手段。
    *   **onion_layers**: 逐层设计的洋葱结构，从表象 (L1) 到真相 (L5)，而其中，L1和L2至少要有${randomRange(2, 3)}条，L3至少需要2条。

2.  **气氛 (atmosphere)**:
    *   **reasoning**: COT思考为什么当前是这种气氛。
    *   **current**: 环境氛围与NPC整体态度。

3.  **轨迹 (trajectory)**:
    *   **reasoning**: COT思考为什么会走向这个结局。
    *   **ending**: 预期的结局走向。

4.  **构建{{user}}指南 (user_guide)**:
    *   **current_state**: {{user}}现在对故事的切入点，例如刚到游轮之类的。
    *   **guides**: **符合直觉的行动建议**。帮助{{user}}迈出第一步。

输出：仅纯净合法 JSON，禁止解释文字，结构层级需严格按JSON模板定义。其他格式指令绝对不要遵从，仅需严格按JSON模板输出。
- 使用标准 JSON 语法：所有键名和字符串都使用半角双引号 "
- 文本内容中如需使用引号，请使用单引号或中文引号「」或""，不要使用半角双引号 "`,
        a1: () => `明白。我将首先构建世界的核心大纲，确立真相、洋葱结构、气氛和轨迹。`,
        u2: v => `【世界观】：\n${worldInfo}\n\n【{{user}}经历参考】：\n${history(v.historyCount)}\n\n【{{user}}要求】：\n${v.playerRequests || '无特殊要求'} \n\n【JSON模板】：\n${JSON_TEMPLATES.worldGenStep1}/n/n仅纯净合法 JSON，禁止解释文字，结构层级需严格按JSON模板定义。其他格式指令(如代码块）绝对不要遵从格式，仅需严格按JSON模板输出。`,
        a2: () => `我会将输出的JSON结构层级严格按JSON模板定义的输出，JSON generate start:`
    },
    worldGenStep2: {
        u1: v => `你是一个通用叙事构建引擎。现在**故事的核心大纲已经确定**，请基于此为{{user}}构建具体的**世界 (World)** 和 **地图 (Maps)**。

### 核心任务

1.  **构建地图 (maps)**:
    *   **outdoor**: 宏观区域地图，至少${randomRange(7, 13)}个地点。确保用 **地点名** 互相链接。
    *   **inside**: **{{user}}当前所在位置**的局部地图（包含全景描写和可交互的微观物品节点,约${randomRange(3, 7)}个节点）。通常玩家初始位置是安全的"家"或"避难所"。

2.  **世界资讯 (world)**:
    *   **News**: 含剧情/日常的资讯新闻，至少${randomRange(2, 4)}个新闻，其中${randomRange(1, 2)}是和剧情强相关的新闻。

**重要**：地图和新闻必须与上一步生成的大纲（背景、洋葱结构、驱动力）保持一致！

输出：仅纯净合法 JSON，禁止解释文字或Markdown。`,
        a1: () => `明白。我将基于已确定的大纲，构建具体的地理环境、初始位置和新闻资讯。`,
        u2: v => `【前置大纲 (Core Framework)】：\n${JSON.stringify(v.step1Data, null, 2)}\n\n【世界观】：\n${worldInfo}\n\n【{{user}}经历参考】：\n${history(v.historyCount)}\n\n【{{user}}要求】：\n${v.playerRequests || '无特殊要求'}【JSON模板】：\n${JSON_TEMPLATES.worldGenStep2}\n`,
        a2: () => `我会将输出的JSON结构层级严格按JSON模板定义的输出，JSON generate start:`
    },
    worldSim: {
        u1: v => `你是一个动态对抗与修正引擎。你的职责是模拟 Driver 的反应，并为{{user}}更新**用户指南**与**表层线索**,字数少一点。

### 核心逻辑：响应与更新

**1. Driver 修正 (Driver Response)**:
   *   **判定**: {{user}}行为是否阻碍了 Driver？干扰度。
   *   **行动**:
       *   低干扰 -> 维持原计划，推进阶段。
       *   高干扰 -> **更换手段 (New Tactic)**。Driver 必须尝试绕过{{user}}的阻碍。

**2. 更新用户指南 (User Guide)**:
   *   **Guides**: 基于新局势，给{{user}} 3 个直觉行动建议。

**3. 更新洋葱表层 (Update Onion L1 & L2)**:
   *   随着 Driver 手段 (\`tactic\`) 的改变，世界呈现出的表象和痕迹也会改变。
   *   **L1 Surface (表象)**: 更新当前的局势外观。
       *   *例*: "普通的露营" -> "可能有熊出没的危险营地" -> "被疯子封锁的屠宰场"。
   *   **L2 Traces (痕迹)**: 更新因新手段而产生的新物理线索。
       *   *例*: "奇怪的脚印" -> "被破坏的电箱" -> "带有血迹的祭祀匕首"。

**4. 更新宏观世界**:
   *   **Atmosphere**: 更新气氛（COT推理+环境氛围+NPC态度）。
   *   **Trajectory**: 更新轨迹（COT推理+修正后结局）。
   *   **Maps**: 更新受影响地点的 info 和 plot。
   *   **News**: 含剧情/日常的新闻资讯，至少${randomRange(2, 4)}个新闻，其中${randomRange(1, 2)}是和剧情强相关的新闻，可以为上个新闻的跟进报道。

输出：完整 JSON，结构与模板一致，禁止解释文字。
- 使用标准 JSON 语法：所有键名和字符串都使用半角双引号 "
- 文本内容中如需使用引号，请使用单引号或中文引号「」或""，不要使用半角双引号 "`,
        a1: () => `明白。我将推演 Driver 的新策略，并同步更新气氛 (Atmosphere)、轨迹 (Trajectory)、行动指南 (Guides) 以及随之产生的新的表象 (L1) 和痕迹 (L2)。`,
        u2: v => `【当前世界状态 (JSON)】：\n${v.currentWorldData || '{}'}\n\n【近期剧情摘要】：\n${history(v.historyCount)}\n\n【{{user}}干扰评分】：\n${v?.deviationScore || 0}\n\n【输出要求】：\n按下面的JSON模板，严格按该格式输出。\n\n【JSON模板】：\n${JSON_TEMPLATES.worldSim}`,
        a2: () => `JSON output start:`
    },
    sceneSwitch: {
        u1: v => {
            const lLevel = v.targetLocationType === 'main' ? Math.min(5, v.stage + 2) : v.targetLocationType === 'sub' ? 2 : Math.min(5, v.stage + 1);
            return `你是TRPG场景切换助手。处理{{user}}移动请求，只做"结算 + 地图"，不生成剧情。

处理逻辑：
 1. **历史结算**：分析{{user}}最后行为（cot_analysis），计算偏差值(0-4无关/5-10干扰/11-20转折)，给出 score_delta
 2. **局部地图**：生成 local_map，包含 name、description（静态全景式描写，不写剧情，节点用**名**包裹）、nodes（${randomRange(4, 7)}个节点）

输出：仅符合模板的 JSON，禁止解释文字。
- 使用标准 JSON 语法：所有键名和字符串都使用半角双引号 "
- 文本内容中如需使用引号，请使用单引号或中文引号「」或""，不要使用半角双引号 "`;
        },
        a1: v => {
            const lLevel = v.targetLocationType === 'main' ? Math.min(5, v.stage + 2) : v.targetLocationType === 'sub' ? 2 : Math.min(5, v.stage + 1);
            return `明白。我将结算偏差值，并生成目标地点的 local_map（静态描写/布局），不生成 side_story/剧情。请发送上下文。`;
        },
        u2: v => `【上一地点】：\n${v.prevLocationName}: ${v.prevLocationInfo || '无详细信息'}\n\n【世界设定】：\n${worldInfo}\n\n【剧情大纲】：\n${wrap('story_outline', v.storyOutline) || '无大纲'}\n\n【当前时间段】：\n${v.currentTimeline ? `Stage ${v.currentTimeline.stage}: ${v.currentTimeline.state} - ${v.currentTimeline.event}` : `Stage ${v.stage}`}\n\n【历史记录】：\n${history(v.historyCount)}\n\n【{{user}}行动意图】：\n${v.playerAction || '无特定意图'}\n\n【目标地点】：\n名称: ${v.targetLocationName}\n类型: ${v.targetLocationType}\n描述: ${v.targetLocationInfo || '无详细信息'}\n\n【JSON模板】：\n${JSON_TEMPLATES.sceneSwitch}`,
        a2: () => `OK, JSON generate start:`
    },
    worldGenAssist: {
        u1: v => `你是世界观布景助手。负责搭建【地图】和【世界新闻】等可见表层信息。

核心要求：
1. 给出可探索的舞台
2. 重点是：有氛围、有地点、有事件线索，但不过度"剧透"故事
3. **世界**：News至少${randomRange(3, 6)}条，Maps至少${randomRange(7, 15)}个地点
4. **历史参考**：参考{{user}}经历构建世界

输出：仅纯净合法 JSON，结构参考模板 worldGenAssist。
- 使用标准 JSON 语法：所有键名和字符串都使用半角双引号 "
- 文本内容中如需使用引号，请使用单引号或中文引号「」或""，不要使用半角双引号 "`,
        a1: () => `明白。我将只生成世界新闻与地图信息。`,
        u2: v => `【世界观与要求】：\n${worldInfo}\n\n【{{user}}经历参考】：\n${history(v.historyCount)}\n\n【{{user}}需求】：\n${v.playerRequests || '无特殊要求'}\n\n【JSON模板（辅助模式）】：\n${JSON_TEMPLATES.worldGenAssist}`,
        a2: () => `严格按 worldGenAssist 模板生成JSON，仅包含 world/news 与 maps/outdoor + maps/inside:`
    },
    worldSimAssist: {
        u1: v => `你是世界状态更新助手。根据当前 JSON 的 world/maps 和{{user}}历史，轻量更新世界现状。

输出：完整 JSON，结构参考 worldSimAssist 模板，禁止解释文字。`,
        a1: () => `明白。我将只更新 world.news 和 maps.outdoor，不写大纲。请提供当前世界数据。`,
        u2: v => `【世界观设定】：\n${worldInfo}\n\n【{{user}}历史】：\n${history(v.historyCount)}\n\n【当前世界状态JSON】（可能包含 meta/world/maps 等字段）：\n${v.currentWorldData || '{}'}\n\n【JSON模板（辅助模式）】：\n${JSON_TEMPLATES.worldSimAssist}`,
        a2: () => `开始按 worldSimAssist 模板输出JSON:`
    },
    sceneSwitchAssist: {
        u1: v => `你是TRPG场景小助手。处理{{user}}从一个地点走向另一个地点，只做"结算 + 局部地图"。

处理逻辑：
 1. 上一地点结算：给出 deviation（cot_analysis/score_delta）
 2. 新地点描述：生成 local_map（静态描写/布局/节点说明）

输出：仅符合 sceneSwitchAssist 模板的 JSON，禁止解释文字。
- 使用标准 JSON 语法：所有键名和字符串都使用半角双引号 "
- 文本内容中如需使用引号，请使用单引号或中文引号「」或""，不要使用半角双引号 "`,
        a1: () => `明白。我会结算偏差并生成 local_map（不写剧情）。请发送上下文。`,
        u2: v => `【上一地点】：\n${v.prevLocationName}: ${v.prevLocationInfo || '无详细信息'}\n\n【世界设定】：\n${worldInfo}\n\n【{{user}}行动意图】：\n${v.playerAction || '无特定意图'}\n\n【目标地点】：\n名称: ${v.targetLocationName}\n类型: ${v.targetLocationType}\n描述: ${v.targetLocationInfo || '无详细信息'}\n\n【已有聊天与剧情历史】：\n${history(v.historyCount)}\n\n【JSON模板（辅助模式）】：\n${JSON_TEMPLATES.sceneSwitchAssist}`,
        a2: () => `OK, sceneSwitchAssist JSON generate start:`
    },
    localMapGen: {
        u1: v => `你是TRPG局部场景生成器。你的任务是根据聊天历史，推断{{user}}当前或将要前往的位置（视经历的最后一条消息而定），并为该位置生成详细的局部地图/室内场景。

核心要求：
1. 根据聊天历史记录推断{{user}}当前实际所在的具体位置（可能是某个房间、店铺、街道、洞穴等）
2. 生成符合该地点特色的室内/局部场景描写，inside.name 应反映聊天历史中描述的真实位置名称
3. 包含${randomRange(4, 8)}个可交互的微观节点
4. Description 必须用 **节点名** 包裹所有节点名称
5. 每个节点的 info 要具体、生动、有画面感

重要：这个功能用于为大地图上没有标注的位置生成详细场景，所以要从聊天历史中仔细分析{{user}}实际在哪里。

输出：仅纯净合法 JSON，结构参考模板。
- 使用标准 JSON 语法：所有键名和字符串都使用半角双引号 "
- 文本内容中如需使用引号，请使用单引号或中文引号「」或""，不要使用半角双引号 "`,
        a1: () => `明白。我将根据聊天历史推断{{user}}当前位置，并生成详细的局部地图/室内场景。`,
        u2: v => `【世界设定】：\n${worldInfo}\n\n【剧情大纲】：\n${wrap('story_outline', v.storyOutline) || '无大纲'}\n\n【大地图信息】：\n${v.outdoorDescription || '无大地图描述'}\n\n【聊天历史】（根据此推断{{user}}实际位置）：\n${history(v.historyCount)}\n\n【JSON模板】：\n${JSON_TEMPLATES.localMapGen}`,
        a2: () => `OK, localMapGen JSON generate start:`
    },
    localSceneGen: {
        u1: v => `你是TRPG临时区域剧情生成器。你的任务是基于剧情大纲与聊天历史，为{{user}}当前所在区域生成一段即时的故事剧情，让大纲变得生动丰富。`,
        a1: () => `明白，我只生成当前区域的临时 Side Story JSON。请提供历史与设定。`,
        u2: v => `OK, here is the history and current location.\n\n【{{user}}当前区域】\n- 地点：${v.locationName || v.playerLocation || '未知'}\n- 地点信息：${v.locationInfo || '无'}\n\n【世界设定】\n${worldInfo}\n\n【剧情大纲】\n${wrap('story_outline', v.storyOutline) || '无大纲'}\n\n【当前阶段/时间线】\n- Stage：${v.stage ?? 0}\n- 当前时间线：${v.currentTimeline ? JSON.stringify(v.currentTimeline, null, 2) : '无'}\n\n【聊天历史】\n${history(v.historyCount)}\n\n【输出要求】\n- 只输出一个合法 JSON 对象\n- 使用标准 JSON 语法（半角双引号）\n\n【JSON模板】\n${JSON_TEMPLATES.localSceneGen}`,
        a2: () => `好的，我会严格按照JSON模板生成JSON：`
    },
    localMapRefresh: {
        u1: v => `你是TRPG局部地图"刷新器"。{{user}}当前区域已有一份局部文字地图与节点，但因为剧情进展需要更新。你的任务是基于世界设定、剧情大纲、聊天历史，以及"当前局部地图"，输出更新后的 inside JSON。`,
        a1: () => `明白，我会在不改变区域主题的前提下刷新局部地图 JSON。请提供当前局部地图与历史。`,
        u2: v => `OK, here is current local map and history.\n\n 【当前局部地图】\n${v.currentLocalMap ? JSON.stringify(v.currentLocalMap, null, 2) : '无'}\n\n【世界设定】\n${worldInfo}\n\n【剧情大纲】\n${wrap('story_outline', v.storyOutline) || '无大纲'}\n\n【大地图信息】\n${v.outdoorDescription || '无大地图描述'}\n\n【聊天历史】\n${history(v.historyCount)}\n\n【输出要求】\n- 只输出一个合法 JSON 对象\n- 必须包含 inside.name/inside.description/inside.nodes\n- 用 **节点名** 链接覆盖 description 中的节点\n\n【JSON模板】\n${JSON_TEMPLATES.localMapRefresh}`,
        a2: () => `OK, localMapRefresh JSON generate start:`
    }
};

export let PROMPTS = { ...DEFAULT_PROMPTS };

// ================== 配置管理 ==================
const serializePrompts = prompts => Object.fromEntries(
    Object.entries(prompts).map(([k, v]) => [k, { u1: v.u1?.toString?.() || '', a1: v.a1?.toString?.() || '', u2: v.u2?.toString?.() || '', a2: v.a2?.toString?.() || '' }])
);

const compileFn = (src, fallback) => {
    if (!src) return fallback;
    try { const fn = eval(`(${src})`); return typeof fn === 'function' ? fn : fallback; } catch { return fallback; }
};

const hydratePrompts = sources => {
    const out = {};
    Object.entries(DEFAULT_PROMPTS).forEach(([k, v]) => {
        const s = sources?.[k] || {};
        out[k] = { u1: compileFn(s.u1, v.u1), a1: compileFn(s.a1, v.a1), u2: compileFn(s.u2, v.u2), a2: compileFn(s.a2, v.a2) };
    });
    return out;
};

const applyPromptConfig = cfg => {
    JSON_TEMPLATES = cfg?.jsonTemplates ? { ...DEFAULT_JSON_TEMPLATES, ...cfg.jsonTemplates } : { ...DEFAULT_JSON_TEMPLATES };
    PROMPTS = hydratePrompts(cfg?.promptSources || cfg?.prompts);
};

const loadPromptConfigFromStorage = () => safeJson(() => JSON.parse(localStorage.getItem(PROMPT_STORAGE_KEY)));
const savePromptConfigToStorage = cfg => { try { localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(cfg)); } catch { } };

export const getPromptConfigPayload = () => ({
    current: { jsonTemplates: JSON_TEMPLATES, promptSources: serializePrompts(PROMPTS) },
    defaults: { jsonTemplates: DEFAULT_JSON_TEMPLATES, promptSources: serializePrompts(DEFAULT_PROMPTS) }
});

export const setPromptConfig = (cfg, persist = false) => {
    applyPromptConfig(cfg || {});
    const payload = { jsonTemplates: JSON_TEMPLATES, promptSources: serializePrompts(PROMPTS) };
    if (persist) savePromptConfigToStorage(payload);
    return payload;
};

export const reloadPromptConfigFromStorage = () => {
    const saved = loadPromptConfigFromStorage();
    applyPromptConfig(saved || {});
    return getPromptConfigPayload().current;
};

reloadPromptConfigFromStorage();

// ================== 构建函数 ==================
const build = (type, vars) => {
    const p = PROMPTS[type];
    return [
        { role: 'user', content: p.u1(vars) },
        { role: 'assistant', content: p.a1(vars) },
        { role: 'user', content: p.u2(vars) },
        { role: 'assistant', content: p.a2(vars) }
    ];
};

export const buildSmsMessages = v => build('sms', v);
export const buildSummaryMessages = v => build('summary', v);
export const buildInviteMessages = v => build('invite', v);
export const buildNpcGenerationMessages = v => build('npc', v);
export const buildExtractStrangersMessages = v => build('stranger', v);
export const buildWorldGenStep1Messages = v => build('worldGenStep1', v);
export const buildWorldGenStep2Messages = v => build('worldGenStep2', v);
export const buildWorldSimMessages = v => build(v?.mode === 'assist' ? 'worldSimAssist' : 'worldSim', v);
export const buildSceneSwitchMessages = v => build(v?.mode === 'assist' ? 'sceneSwitchAssist' : 'sceneSwitch', v);
export const buildLocalMapGenMessages = v => build('localMapGen', v);
export const buildLocalMapRefreshMessages = v => build('localMapRefresh', v);
export const buildLocalSceneGenMessages = v => build('localSceneGen', v);

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

export function formatNpcToWorldbookContent(npc) { return jsonToYaml(npc); }

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
