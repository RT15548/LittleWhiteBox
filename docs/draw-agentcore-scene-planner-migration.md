# 画图 Scene Planner 迁移到 AgentCore Tool Calling

> 状态：实施与本地验收已完成。
>
> 本文既是本次改造的实施基准，也是最终架构与验收记录；不保留第二套运行路径。

## 1. 结论

画图的 LLM Scene Planner 从“模型自由输出 YAML，前端清洗并解析”迁移为“共享 AgentCore 发起一次强制 Tool Calling，Tool 参数直接作为结构化场景计划”。

终态约束如下：

- 每次规划前读取 `LittleWhiteBox_Assistant.json/settings`。
- 只使用共享 Agent 的 `currentPresetName` 主预设，不使用 delegate。
- Provider、Base URL、模型、API Key、温度、最大 Token、Reasoning、Tool 模式全部跟随共享主预设。
- 不新增画图专属模型配置、模型缓存或 `drawPresetName`。
- Scene Planner 只提供一个 Tool：`submit_scene_plan`。
- `toolChoice` 固定为 `required`。
- 单次请求、单次 Tool Call、收到参数即终止；不运行 Agent 多轮工具循环，不回传 Tool result。
- 不流式生成，不使用 assistant prefill，不保存会话或规划状态。
- Tool 协议完全复用 AgentCore：共享预设选择原生或 Tagged JSON，托管 OpenAI 兼容路径保留 AgentCore 已有的协议回退；画图层不另写 Tool 能力判断、请求器或解析器。
- Tool 参数通过契约校验后直接转换为现有图片任务，后续 NovelAI、SD WebUI、ComfyUI 出图链路保持不变。
- YAML、Markdown fence、截断猜测、清洗解析和解析失败后整轮重试全部退出画图 Scene Planner。

## 2. 为什么现在会经常失败

问题不在于业务数据复杂，也不在于 YAML 本身难解析，而在于当前把结构化协议交给模型以自由文本形式完成，再由前端猜测模型到底输出了什么。

当前链路同时存在这些脆弱点：

1. 模型需要同时理解场景规则和 YAML 序列化规则。
2. 模型可能输出说明文字、Markdown fence、错误缩进、未闭合字符串或多余根节点。
3. 流式响应可能在数组或最后一个角色中途截断。
4. assistant prefill 在不同 Provider 上的语义不一致，部分模型会续写，部分模型会复述或改写。
5. 当前解析器需要从全文中寻找 `images:`、截取疑似 YAML、忽略尾部内容，再猜最后一项是否完整。
6. 解析失败后重新请求整轮，会增加费用、延迟和结果漂移，并不能消除协议本身的不确定性。
7. 画图维护了独立模型配置，与已经成熟的共享 Agent 配置形成两个事实来源。

Tool Calling 后，模型仍负责有难度的场景理解与标签编写；Provider/AgentCore 负责传输结构，画图只负责验证领域契约。复杂度回到正确边界。

## 3. 终态架构

```text
NovelAI / SD WebUI / ComfyUI
            │
            │ message、角色、世界书、Prompt 预设、数量限制
            ▼
modules/draw/shared/scene-planner.js
            │
            ├── 构造 Prompt：1 条 system + 1 条 user 任务
            ├── 构造 submit_scene_plan Tool Schema
            └── 请求一次规划
                    │
                    ▼
modules/draw/shared/draw-agent.js
            │
            ├── 每次读取 AssistantStorage/settings
            ├── 解析 currentPresetName 主预设
            ├── 懒加载 agent-core-browser.js
            └── adapter.chat({ toolChoice: "required" })
                    │
                    ▼
modules/agent-core（共享 Provider Adapter）
            │
            ▼
原生 Tool Call 或 Tagged JSON Tool Call
            │
            ▼
modules/draw/shared/scene-plan-contract.js
            │
            ├── 唯一 Tool / 参数结构 / 领域语义校验
            ├── 角色名与别名归一
            └── 转换为 { index, scene, chars, placement }
                    │
                    ▼
现有各出图 Provider 的 Prompt 拼装、队列、生成、画廊
```

### 3.1 边界检查

| 问题 | 决定 |
| --- | --- |
| 功能所有者 | `modules/draw/`；Scene Planner 的 Prompt、Tool Schema、角色语义和图片任务转换都属于画图领域。 |
| 唯一模型配置事实来源 | `LittleWhiteBox_Assistant.json/settings` 中 `currentPresetName` 指向的主预设。 |
| 持久态 | 现有角色库、世界书开关与上传内容、Prompt 预设、出图参数、画廊等画图数据；共享 Agent 配置仍由 Agent 模块持有。 |
| 临时态 | 本次消息、展开后的 Prompt、`mindful_prelude`、Tool Call、最近一次脱敏请求诊断、bundle 加载 Promise。页面刷新即消失。 |
| 外部依赖 | SillyTavern 请求头和宏系统、共享 Agent Provider API、浏览器/WebView、各图片生成 Provider。 |
| 注册入口 | Draw 只通过 `draw-agent.js` 调用 AgentCore；AgentCore 不注册或认识画图 Tool。 |
| 删除路径 | 删除画图 Scene Planner 目录中的调用入口与三套 Prompt 注册即可退出；共享 AgentCore 不残留画图 Schema、Prompt 或存储。 |
| 真正兼容对象 | 当前 SillyTavern、浏览器/WebView、Provider API、共享 Agent 当前配置格式、当前角色/世界书/出图数据。 |
| 不兼容对象 | 测试线旧 YAML 输出、旧画图 LLM 凭据、旧模型缓存、旧低模型 Prompt、旧 prefill/stream 开关。 |
| 最少必要测试 | Tool 契约、Prompt 请求边界、共享主预设解析、Adapter 协议缺口、三套 UI 状态、浏览器 bundle、四个既有 Agent 消费者回归。 |

## 4. 共享 Agent 配置

### 4.1 读取规则

每次开始 Scene Planner 请求时执行：

1. `AssistantStorage.get('settings', null)` 读取最新共享配置。
2. `normalizeAgentSettings` 规范化配置。
3. 读取 `currentPresetName`，只解析主预设。
4. 使用该预设当前 Provider 下的模型配置。
5. 构造对应 Adapter 并发起本次请求。

不得：

- 使用 `delegatePresetName` 或 `delegateConfig`。
- 在画图设置中保存共享预设副本。
- 页面加载时读一次后长期缓存模型配置。
- 因模型调用失败而修改共享配置。
- 把旧画图 API Key 自动写进共享配置。

每次读取而不是复制的原因是：小白助手、电纸书、小白酒馆、四次元壁与画图必须看到同一个当前预设，用户在任意共享 Agent 设置入口修改后，下一次画图立即生效。

### 4.2 共享字段

画图直接使用 `resolveActiveProviderConfig` 的下列结果：

- `currentPresetName`
- `provider`
- `baseUrl`
- `model`
- `apiKey`
- `temperature`
- `sendTemperature`
- `maxTokens`
- `toolMode`
- `reasoning.mode`：`inherit | on | off`
- `reasoning.output`：`show | hide`
- `reasoning.effort` 或 `reasoning.budgetTokens`：由 Provider、传输方式和具体模型的能力配置决定

画图自己的 `timeout` 可继续保留。它是“本次场景规划最多等待多久”的功能策略，不是模型身份或凭据；调用时作为 `timeoutMs` 传给共享 Provider 解析/Adapter。

### 4.3 调用前校验

按顺序给出明确错误：

1. 共享 Agent 设置读取失败。
2. 当前主预设不存在或无法解析。
3. 当前 Provider 没有模型。
4. 直连 Provider 缺少 API Key。
5. AgentCore 浏览器 bundle 加载失败。

SillyTavern 托管 Provider 不要求画图检查直连 API Key，但仍需校验模型和宿主请求能力。

## 5. AgentCore 的浏览器加载边界

### 5.1 不能直接从 Draw import `provider-config.js`

Draw 是由 SillyTavern 浏览器直接加载的原生 ESM。当前 `provider-config.js` 顶层 import：

- `openai`
- `@anthropic-ai/sdk`
- `@google/genai`

这些是裸包名，浏览器不能直接解析。因此不能让 Draw 源文件直接 import 当前 `provider-config.js`。

### 5.2 AgentCore 拆分

新增 `modules/agent-core/provider-resolution.js`，只放纯配置能力：

- Provider、Tool 模式、Reasoning 选项常量。
- `normalizeTemperature` 等纯规范化函数。
- `resolveActiveProviderConfig`。
- Provider/Tool 模式显示名称。
- 不 import SDK，不创建 Adapter，不访问 DOM 或 App 存储。

现有 `modules/agent-core/provider-config.js`：

- 从 `provider-resolution.js` 导入并继续 re-export 既有公共能力，避免现有消费者改 import。
- 只额外负责 import Adapter 与 `createAgentAdapter`。

这样，设置摘要等不需要 SDK 的浏览器代码可直接引用纯解析层；真正发请求的入口由 Vite 打包。

### 5.3 浏览器 bundle

新增：

- `modules/agent-core/browser-entry.js`
- `vite.agent-core.config.mjs`
- 构建产物 `modules/agent-core/dist/agent-core-browser.js`
- `package.json` 脚本 `build:agent-core`

`browser-entry.js` 只导出业务无关能力：

- Agent 配置规范化。
- 主预设解析。
- Adapter 创建。
- SillyTavern 托管请求头注入。

它不得 import `modules/draw/`，不得包含 `submit_scene_plan`、角色规则或画图 Prompt。

Vite 配置使用 ESM 单文件输出、`target: es2022`、不拆 chunk，并复用现有 Agent consumer 构建中针对 SDK 的必要 transform：

- 去除 `retry` 依赖的弃用日志。
- 规范 OpenAI partial JSON parser 的空白扫描代码，避免生成产物中的模板字面量问题。

产物需要提交到仓库，因为插件运行环境不会替用户执行 npm 构建。

### 5.4 Draw 懒加载

`draw-agent.js` 维护一个页面生命周期内的 Promise：

```js
let agentCoreModulePromise = null;

async function loadAgentCoreBrowser() {
    agentCoreModulePromise ||= import('../../agent-core/dist/agent-core-browser.js');
    try {
        return await agentCoreModulePromise;
    } catch (error) {
        agentCoreModulePromise = null;
        throw error;
    }
}
```

要求：

- 只有首次实际规划时加载 SDK bundle，打开画图页面不加载。
- 同一页面的并发调用共享加载 Promise。
- 加载失败后清空 Promise，允许用户修复部署问题后再次点击。
- Promise 不持久化。

加载完成后，把 SillyTavern 的 `getRequestHeaders` 以 provider function 注入 bundle，供 `sillytavern-*` Adapter 使用。

## 6. Tool 执行模型

### 6.1 固定调用形态

```js
const result = await adapter.chat({
    systemPrompt,
    messages,
    tools: [submitScenePlanTool],
    toolChoice: 'required',
    temperature: providerConfig.temperature,
    maxTokens: providerConfig.maxTokens,
    reasoning: providerConfig.reasoning,
    signal,
});
```

不得传 `onStreamProgress`，因此所有 Provider 都走非流式请求。

### 6.2 这是“终止型提交 Tool”，不是 Agent Tool Loop

`submit_scene_plan` 的含义是“提交本轮最终场景计划”。收到 Tool Call 后：

1. 不执行外部副作用。
2. 不生成 Tool result 消息。
3. 不把结果发回模型。
4. 不要求模型继续回复。
5. 直接校验参数并转换为图片任务。

因此本功能不使用 `delegate-runner`、通用工具执行器、会话账本或多轮协议状态。

### 6.3 Tool Call 数量规则

一次响应必须满足：

- 恰好一个 Tool Call。
- Tool 名严格等于 `submit_scene_plan`。
- 参数是完整 JSON object。

以下都视为失败，不做猜测性合并：

- 只返回正文或裸 JSON，没有 Tool Call。
- 调用了其他 Tool 名。
- 同时调用两次或多次 `submit_scene_plan`。
- Tool 参数损坏、截断或不是 object。

原生模式中，即使正文看起来像正确 JSON，也不能绕过 Tool 协议。Tagged JSON 模式由 AgentCore 将 `<tool_call>` 包装解析成同一种标准 Tool Call，画图层不维护第二套解析器。

## 7. `submit_scene_plan` 契约

### 7.1 根结构

Tool 定义使用 AgentCore 已有的 OpenAI 风格：

```js
{
    type: 'function',
    function: {
        name: 'submit_scene_plan',
        description: 'Submit the complete mindful scene analysis and final ordered image plans for this request. Call exactly once.',
        parameters: {
            type: 'object',
            additionalProperties: false,
            required: ['mindful_prelude', 'images'],
            properties: {
                mindful_prelude: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['user_insight', 'therapeutic_commitment', 'visual_plan'],
                    properties: {
                        user_insight: { type: 'string', minLength: 1 },
                        therapeutic_commitment: { type: 'string', minLength: 1 },
                        visual_plan: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['reasoning', 'moments'],
                            properties: {
                                reasoning: { type: 'string', minLength: 1 },
                                moments: {
                                    type: 'array',
                                    minItems: 1,
                                    items: {
                                        type: 'object',
                                        additionalProperties: false,
                                        required: [
                                            'moment',
                                            'insert_after',
                                            'char_count',
                                            'known_chars',
                                            'unknown_chars',
                                            'composition',
                                        ],
                                        properties: {
                                            moment: { type: 'string', minLength: 1 },
                                            insert_after: { type: 'integer', minimum: 1 },
                                            char_count: { type: 'string', minLength: 1 },
                                            known_chars: {
                                                type: 'array',
                                                items: { type: 'string', minLength: 1 },
                                            },
                                            unknown_chars: {
                                                type: 'array',
                                                items: { type: 'string', minLength: 1 },
                                            },
                                            composition: { type: 'string', minLength: 1 },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                images: {
                    type: 'array',
                    minItems: 1,
                    items: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['index', 'scene', 'characters'],
                        properties: {
                            index: { type: 'integer', minimum: 1 },
                            scene: { type: 'string', minLength: 1 },
                            characters: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    additionalProperties: false,
                                    required: [
                                        'name',
                                        'danbooru',
                                        'type',
                                        'appear',
                                        'costume',
                                        'action',
                                        'interact',
                                        'uc',
                                        'center',
                                    ],
                                    properties: {
                                        name: { type: 'string', minLength: 1 },
                                        danbooru: { type: 'string' },
                                        type: { type: 'string' },
                                        appear: { type: 'string' },
                                        costume: { type: 'string' },
                                        action: { type: 'string', minLength: 1 },
                                        interact: { type: 'string' },
                                        uc: { type: 'string' },
                                        center: {
                                            type: 'string',
                                            pattern: '^[A-E][1-5]$',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
}
```

实现时所有 object 层都保持 `additionalProperties: false`，防止模型发明字段后被静默忽略。

### 7.2 动态数量约束

Tool Schema 每次根据当前画图参数生成：

- `maxImages > 0`：`images.minItems` 与 `images.maxItems` 都设为 `maxImages`，表示本轮恰好生成该数量。
- `maxImages === 0`：只设 `images.minItems = 1`。
- `maxCharactersPerImage > 0`：每个 `characters.maxItems` 设为该值。
- `visual_plan.moments` 使用与 `images` 相同的数量约束。

Prompt 中仍保留自然语言数量要求，Schema 再做协议约束。两者来源必须是同一组本次调用参数，不能各自计算。

### 7.3 Character 统一结构

所有角色使用同一个 Character Schema，不再让“已知角色”和“未知角色”产生两种对象形状。

已知角色：

- `name` 输出角色库中的规范名；模型若使用别名，转换层归一为规范名。
- `danbooru` 可输出角色专属 Danbooru 名；为空时由现有角色库处理。
- `type` 必须为空字符串。
- `appear` 必须为空字符串。
- `costume`、`action`、`interact`、`uc`、`center` 按本图完整输出。
- 真实 `type`、外貌、角色负向标签和已存 Danbooru 信息继续由现有角色库与 `assembleCharacterPrompts` 注入。

未知角色：

- `name`、`type`、`appear`、`action`、`center` 必须有实际内容。
- `danbooru` 没有可靠标签时可为空。
- `costume`、`interact`、`uc` 按场景填写；无对应内容使用空字符串，字段本身不能缺失。

纯风景、建筑、物品图：

- 使用 `characters: []`。
- 不创建“背景”“风景”等伪角色。

这同时解决旧 Prompt 中“无角色时字段是否可以省略”的冲突：`characters` 永远存在，无角色时就是空数组。

### 7.4 字段语义

| 字段 | 语义 |
| --- | --- |
| `mindful_prelude.user_insight` | 对用户创作表达、时空和场景的克制人文观察；不擅自诊断。 |
| `mindful_prelude.therapeutic_commitment` | 对完整、尊重地完成视觉规划的承诺。 |
| `visual_plan.reasoning` | 选取哪些瞬间以及整体视觉安排的理由。 |
| `moments[].moment` | 候选/选定瞬间的简述。 |
| `moments[].insert_after` | 本图插入位置对应的【插图点 N】编号；编号由宿主在原文映射视图上生成并随带编号原文发给模型。 |
| `moments[].char_count` | 本图人物数量与性别/类型概览。 |
| `moments[].known_chars` | 命中的角色库角色规范名。 |
| `moments[].unknown_chars` | 本图需要自行描述的未知角色。 |
| `moments[].composition` | 镜头、主体位置、遮挡、空间关系与构图安排。 |
| `images[].index` | 图片顺序，正整数；转换前排序。 |
| `images[].scene` | 不含角色专属外貌的整体场景、环境、镜头、光影和画质标签。 |
| `characters[].costume` | 本图实际穿着；可基于角色服装参考选择并表现破损、敞开、滑落、湿透等剧情状态，不混合多套服装。 |
| `characters[].action` | 该角色在一个静态瞬间中的姿势、表情和动作。 |
| `characters[].interact` | 互动方向；需要时使用 `source#`、`target#`、`mutual#`。 |
| `characters[].uc` | 角色专属负向标签。 |
| `characters[].center` | A1～E5 的 5×5 构图中心坐标。 |

### 7.5 不进入 Tool 的旧字段

`negative` 不进入 `submit_scene_plan`：

- 当前下游没有消费 Scene Planner 任务上的全局 `negative`。
- 各 Provider 的全局负向提示词继续来自出图参数。
- 角色负向内容继续使用 Character 的 `uc`，并与角色库 `negativeTags` 合并。

`mindful_prelude` 是单次临时态。它用于约束模型在规划时进行完整、有人文意识的判断，但校验完成后不写入设置、数据库、画廊或聊天记录；转换为图片任务时丢弃。

### 7.6 转换规则

契约层输出保持现有下游需要的最小形状：

```js
{
    index,
    scene,
    placement: {
        mode: 'source',
        insertAfter,
        offset,
        sourceHash,
    },
    chars: [
        {
            name,
            danbooru,
            type,
            appear,
            costume,
            action,
            interact,
            uc,
            center,
        },
    ],
}
```

转换时：

1. 拒绝非正整数、重复 `index`。
2. 按 `index` 升序排序，不依赖模型返回顺序。
3. 不再通过“最后一个 action 长度”猜测是否截断。
4. 不静默丢弃无效图片或角色；契约失败就返回明确错误。
5. 已知角色按规范名和别名做大小写不敏感匹配，并归一为规范名。
6. 纯风景任务保留空 `chars`。
7. 不把 `mindful_prelude` 或未声明字段带入下游。
8. `moments[].insert_after` 必须引用本次 `SceneSource` 中存在的插图点编号；契约层据此解出原始正文 offset 并与 `sourceHash` 一起写入 `placement`，下游不再做任何文字锚点搜索。

## 8. Prompt 迁移原则

本次只删除“YAML 运输协议”，不删场景规划能力。所有重要语义必须逐条迁移，不允许因为 Tool Schema 已经规定字段，就把描述字段质量的规则一并删掉。

### 8.1 必须完整保留的语义

三套 Provider Prompt 都必须保留下列内容：

- `FICTIONAL_CREATIVE_WORK` 分类与现有合规检查语义。
- 人文观察、`mindful_prelude`、`user_insight`、`therapeutic_commitment`、`visual_plan` 的含义。
- 普通视角与第一人称 POV 的全部规则。
- 插图位置只能通过 `insert_after` 引用宿主生成的【插图点 N】编号；模型不复制、不概括、不创造锚点文本。
- 已知角色、未知角色、角色规范名与别名识别。
- Danbooru 角色标签规则。
- 已知角色不重复输出预设外貌，但必须完整决定本图服装、动作、互动、负向和位置。
- 服装参考只能选择合适的一套或其剧情变体；保留破损、敞开、滑落、湿透等状态词，禁止把多套服装拼接。
- `scene`、`costume`、`action`、`interact`、`uc`、`center` 的职责边界。
- `source#`、`target#`、`mutual#` 互动方向协议。
- A1～E5 的 5×5 坐标定义。
- Tag 顺序、每类配额、碎片化表达、强调权重规则。
- 单一静态瞬间、身体遮挡、构图、视线、接触点、重力和其他物理约束。
- 世界书使用规则。
- NSFW、媚宅取向、光影、镜头和画质词表。
- NovelAI 的 `n::tag::` 与 SD/Comfy 的 `(tag:1.2)` 权重差异。
- `<worldInfo>` 与 `<content>` 容器。
- 本次 `images` 数量和每图最大角色数的动态要求。

### 8.2 只删除的运输内容

下列内容必须从最终请求 Prompt 中消失：

- 要求输出 YAML。
- YAML 根节点、缩进、引号、冒号、数组和 Markdown fence 规则。
- `<meta_protocol>` / `</meta_protocol>`。
- `Beginning the YAML`、`只要YAML`、`重新完整生成YAML` 等文字。
- YAML 示例块本身；有价值的场景语义改写成普通规则或 Tool 字段说明。
- 截断后继续生成的角色扮演话术。
- assistant prefill。

代码中同时删除：

- YAML 清洗与 fence 截取。
- `js-yaml` 在 Scene Planner 中的 import 与解析。
- 尾部截断启发式。
- 解析失败后的整轮重试。

注意：仓库其他模块仍使用 `libs/js-yaml.mjs`，不得删除全局 YAML 库，只移除 Draw Scene Planner 的依赖。

### 8.3 Prompt 字段迁移

| 旧字段 | 终态 |
| --- | --- |
| `topSystem` | 保留并去除 YAML 输出措辞。 |
| `topSystemPov` | 保留全部 POV 语义并去除 YAML 输出措辞。 |
| `assistantDoc` | 保留 TAG 指南确认。 |
| `tagGuideContent` | 保留。 |
| `assistantAskBackground` | 保留。 |
| `userWorldInfo` | 保留。 |
| `assistantAskContent` | 保留。 |
| `userContent` | 保留。 |
| `metaProtocolStart` | 删除。 |
| `userJsonFormat` | 代码职责改名为 `sceneRules`；内置内容人工迁移语义，不携带 YAML 运输说明。 |
| `metaProtocolEnd` | 删除。 |
| `assistantCheck` | 保留合规检查、`FICTIONAL_CREATIVE_WORK` 和人文观察；移除 `<meta_protocol>` 与 YAML 半截前缀。 |
| `userConfirm` | 改为“完整调用唯一 Tool 并填写所有字段”，继续附加本次数量限制；删除“截断了/重生 YAML”话术。 |
| `assistantPrefill` | 删除。 |

三套 `output-format.md` 改名为 `scene-rules.md`。三套 `output-format-legacy.md` 删除。

默认 Prompt 预设只保留：

- `默认-完整规则`。
- `默认-第一人称完整规则`。

删除 `默认-模型要求低`。结构可靠性由 Tool Schema 负责，不再为低能力模型维护缩水规则。

测试线旧的自定义 `userJsonFormat` 不作为受支持数据格式，不能原样塞进 `sceneRules` 重新引入 YAML。当前 schema 只认 `sceneRules`；内置规则按本文迁移，旧 transport-oriented 自定义字段在规范化时退出。如果以后明确要求保留某个真实用户的自定义 Prompt，必须拿真实样本单独设计一次性转换，不能在日常读取路径里长期清洗。

### 8.4 宏展开不可回归

删除 `draw-llm.js` 前，必须把 Prompt 展开能力迁到职责单一的 `modules/draw/shared/scene-prompt-expansion.js`。对 `systemPrompt` 和 user 任务模板使用相同顺序：

1. `replaceXbGetVarInString`：`{{xbgetvar::...}}`。
2. `replaceXbGetVarYamlInString`：`{{xbgetvar_yaml::...}}`；函数名虽含 YAML，但这是现存用户宏，仍需兼容。
3. `substituteParams`：包含 `{{getvar::...}}`、`{{getglobalvar::...}}` 等全部官方宏。画图不再依赖主窗口中没有正式来源的 `window.STscript`。
4. `{$historyN}`。
5. 向 `CHAT_COMPLETION_PROMPT_READY` 发送展开后的快照。

保持当前事件语义：事件用于预览和兼容通知，不允许第三方监听器改写本次实际发送的角色或消息。

`chat`、`name1`、`name2` 只能在展开时从宿主模块实时读取，不得在页面生命周期内快照，否则切换角色或人设后会用到旧数据。

### 8.5 动态内容只展开一次且不得作为 replacement string

小说原文、世界书、角色列表、TAG 指南各自只展开一次，然后以字面拼接方式注入已展开的模板：

- 模板中的 `{{lastMessage}}`、`{{characterInfo}}`、`{$worldInfo}`、`{$tagGuide}` 先替换成本次请求唯一的哨兵串，再整体展开模板，最后用 `split/join` 把哨兵串换成已展开的值。
- 绝不把动态原文交给 `String.replace` 作为 replacement string，否则原文中的 `$&`、`` $` ``、`$'`、`$1`、`$$` 会被 JavaScript 当作替换指令。
- `SceneSource` 快照（映射过滤、插图点编号、hash、offset）基于宏展开前的同一份原文；带编号内容只展开一次后发送，模型看到的原文与 placement 映射同源，不允许各自再展开一次。
- 展开边界的异常统一包装为 `PROMPT_EXPANSION_FAILED`，并写入本次请求诊断。

### 8.6 请求形态：system + 单条 user 任务

最终请求只有 1 条 system 与 1 条 user：

- `topSystem` 作为 system。
- TAG 指南确认、背景说明、世界信息、原文说明、原文、场景规则、合规检查、确认指令按原顺序拼成同一条 user 任务。
- 不再构造伪多轮对话，也不再出现连续同角色消息（直连 Anthropic / Google 会因首条 assistant 或连续同角色而拒绝请求）。
- 动态数量约束与 Tool 强制指令插在 `userConfirm` 的尾部闭合标签之前，保持 `<Chat_History>` 容器完整。
- 三套 Provider 的 Prompt 结构预览必须同步展示该结构，不能继续展示旧多轮链。


## 9. AgentCore 必补协议缺口

### 9.1 Anthropic `toolChoice`

`modules/agent-core/adapters/anthropic.js` 当前发送 tools，但没有把 `task.toolChoice` 映射到 Anthropic `tool_choice`。

映射必须为：

| AgentCore | Anthropic |
| --- | --- |
| `auto` | `{ type: 'auto' }` |
| `required` | `{ type: 'any' }` |
| `none` | `{ type: 'none' }` |
| 指定 Tool 名 | `{ type: 'tool', name: toolChoice }` |

只有存在 tools 时才发送 `tool_choice`。指定名称还需验证名称确实存在于本次 tools 中；无效名称应在本地抛错，不把无效请求发给 Provider。

### 9.2 OpenAI Compatible Tagged JSON 的 `required`

`modules/agent-core/adapters/openai-compatible.js` 的 Tagged JSON system protocol 当前允许模型自行判断“是否需要调用工具”，这与 `toolChoice: 'required'` 冲突。

当 `task.toolChoice === 'required'` 时，协议必须明确加入：

> 本轮必须调用工具，不得只返回正文。

当 `toolChoice` 是具体名称时，必须要求调用该名称；当为 `none` 时不得生成 Tool 标签。既有 Tool Schema 和 `<tool_call>{"name":"...","arguments":{...}}</tool_call>` 包装保持不变。

相同修正必须覆盖共享实现实际服务的 `sillytavern-openai-compatible` 路径，避免直连和酒馆托管模式语义不同。

### 9.3 SillyTavern Claude / Google 的 system Prompt

`modules/agent-core/adapters/sillytavern-claude.js` 与 `sillytavern-google.js` 必须统一保证 `task.systemPrompt` 进入宿主请求。

规则：

1. `task.systemPrompt` 非空时必须发送。
2. 如果 `task.messages` 第一条已经是内容完全相同的 system message，只保留一次。
3. 不因消息首项是 assistant/user 就丢掉 system Prompt。
4. 请求检查结果与真实发送 payload 使用同一构造函数，不能显示一套、发送另一套。

这个修正属于 AgentCore 通用协议正确性，不写在 Draw 私有适配层。

### 9.4 SillyTavern Claude 的 `tool_choice` 与 thinking

酒馆后端把 `tool_choice` 原样包成 `{ type: <string> }` 转发给 Anthropic，因此通用值 `required` 会生成非法的 `{ type: 'required' }`。

翻译必须只发生在 `sillytavern-claude` Adapter 边界，不修改共享 Host/OpenAI helper，`sillytavern-google` 继续接收 `required`：

| AgentCore | 托管 Claude |
| --- | --- |
| `auto` / 空 | `auto` |
| `required` | `any` |
| `none` | `none` |
| 指定 Tool 名 | 宿主传输无法表达，本地报错 |

Claude 全族按当前最新 adaptive thinking 契约处理，不再按具体版本拆成 manual/adaptive 分支。强制 Tool 仍使用合法的 `any`，Reasoning 不因型号字符串被静默关闭。

### 9.5 Reasoning 能力与展示边界

持久化层只保存统一形状，不猜协议：

```js
reasoning: {
    mode: 'inherit' | 'on' | 'off',
    output: 'show' | 'hide',
    effort?: string,
    budgetTokens?: number,
}
```

- `inherit` 不发送控制字段；`off` 必须发送该模型已验证的关闭协议，不能退化成 `inherit`。
- 能力以 Provider/传输的通用协议为默认值，不设模型支持白名单：OpenAI-compatible 的本地模型、自定义名和未识别别名均可正常使用 Tool，并以通用 `reasoning_effort` 契约处理 Reasoning。模型名只做不区分大小写的族名包含匹配，命中 Kimi、DeepSeek、Gemini、Claude、GPT 等特殊族时才覆盖控制字段；绝不根据 Base URL 推断能力。限制只来自所选 Provider 协议本身，例如当前 Google 最新协议不提供显式 `off`，不能由模型名称猜测。
- 同一模型族统一采用该族的最新控制协议：Kimi 全族按 K3，GPT/O 系列按 GPT 5.6，DeepSeek、Claude 与 Gemini 也不再按具体版本号拆分。GPT 只按独立族名 token 识别，不能把本地量化格式 `GPTQ` 误判成 GPT 模型。
- 控制字段只在对应 Adapter 边界编码。直连与 SillyTavern 托管的 OpenAI-compatible 路径共用同一份族协议翻译，避免 Kimi、DeepSeek 等模型在两条路径发出不同字段。
- Claude 全族按 adaptive thinking 处理，强制 Tool 不再触发旧 manual thinking 降级分支。
- `output` 只控制界面展示。`hide` 在流式与非流式结果中都不暴露思考文本，但原始 Provider payload、thinking block、签名和 Responses output 仍保留给本轮 Tool loop 续传。
- Provider 拒绝 Reasoning 参数时原错误直接返回，不删除参数静默重试。

### 9.6 OpenAI Compatible Tool 返回解析

原生 Tool 请求始终发送 `tools + tool_choice`，Tool 能力不由模型白名单判定。响应解析、流式累积、Tool Call ID、参数修复、签名保留和回放完全沿用 AgentCore 现有实现；Draw 不扩展返回协议形状，也不维护自己的解析器。

`TOOL_CALL_MISSING` 只表示本次响应没有解析出 Tool Call，不能据此宣称模型不支持 Tool，也不能直接要求用户切换 Tagged JSON。画图不覆盖 AgentCore 的协议处理，也不自行增加第二套 Tool 兼容逻辑。


## 10. 设置与数据清理

### 10.1 从画图设置删除的字段

从 `LittleWhiteBox_NovelDraw.json/settings` 当前模型中删除：

- `llmApi`
- `llmApi.provider`
- `llmApi.url`
- `llmApi.key`
- `llmApi.model`
- `llmApi.modelCache`
- `useStream`
- `disablePrefill`

旧画图凭据直接丢弃，不复制到共享 Agent 设置。原因：

- 共享 Agent 是唯一事实来源。
- 自动复制可能覆盖用户已经配置好的共享主预设。
- 无法可靠判断多个旧 Provider 配置中哪个才是用户现在想用的。
- 凭据迁移是安全敏感行为，不能静默执行。

当前设置规范化应显式构造白名单字段对象，不再通过 `{ ...saved }` 把已删除字段永久带回保存结果。

### 10.2 保留的画图数据

以下数据不属于模型配置，不得因本次迁移丢失：

- 角色库、别名、类型、外貌、Danbooru、负向标签、服装参考。
- 世界书启用状态、上传书目和过滤规则。
- `useWorldInfo`。
- `advancedMode`。
- Scene Planner `timeout`。
- 图片数量和每图角色数参数预设。
- NovelAI、SD WebUI、ComfyUI 各自出图 API、工作流和生成参数。
- 画廊、缓存天数、生成指纹和队列状态。
- 消息过滤规则。
- 当前两套新 Prompt 预设与用户在新结构下创建的 Prompt 预设。

本次不新增表、字段快照、迁移锁或持久缓存。

### 10.3 三套 LLM 设置页面

NovelAI、SD WebUI、ComfyUI 原有 Scene Planner LLM 页面删除：

- Provider 选择。
- Base URL。
- API Key。
- 模型输入/下拉。
- 拉取模型按钮与模型缓存。
- 流式开关。
- 禁用 prefill 开关。

改为只读“共享 Agent”摘要页，显示：

- 当前主预设名。
- Provider。
- 模型。
- Tool 模式。
- Reasoning 状态。
- “打开共享 Agent 配置”按钮。
- 最近一次请求诊断与最近一次错误。

三套页面共享同一个纯 view model 构造函数，避免各自重新解析 Agent 配置；具体 DOM 可按各页面现有结构渲染。

原生 Tool Calling 模式显示固定说明：

> 原生模式会直接发送 Tool Schema；是否成功以本次 Provider 返回为准，不使用本地模型白名单预判。

页面每次打开及每次规划前刷新摘要，不保存摘要副本。

### 10.4 请求诊断

最近一次诊断只存在内存中，页面刷新后消失。诊断句柄必须在 Scene Planner 入口、Prompt 构建之前创建，覆盖 Prompt、配置、Adapter、发送、解析与契约校验全部阶段；每个句柄带请求 ID，较早的慢请求不得覆盖较新请求的诊断。复用 AgentCore request inspection 的 secret redaction，至少隐藏：

- `Authorization`
- API Key / token
- password / proxy password
- 自定义敏感 header/body 字段

诊断可显示：

- 时间、耗时、主预设名、Provider、模型、Tool 模式。
- 请求 URL、method、脱敏 headers/body。
- tools 数量、`toolChoice`、是否启用 Reasoning。
- 返回的 Tool Call 数量、Tool 名、finish reason。
- 领域错误码与错误信息。

诊断不得写进 `LittleWhiteBox_NovelDraw.json` 或 `LittleWhiteBox_Assistant.json`。

## 11. 错误模型与用户提示

建议将现有 `LLMServiceError` 收敛为 Scene Planner 领域错误，至少区分：

| 错误码 | 场景 |
| --- | --- |
| `AGENT_SETTINGS_LOAD_FAILED` | 无法读取共享 Agent 设置。 |
| `AGENT_PRESET_INVALID` | 当前主预设不存在或结构无效。 |
| `MODEL_MISSING` | 当前 Provider 没有模型。 |
| `API_KEY_MISSING` | 直连 Provider 缺少 API Key。 |
| `AGENT_CORE_LOAD_FAILED` | 浏览器 bundle 缺失或加载失败。 |
| `PROMPT_EXPANSION_FAILED` | Prompt 宏加载或展开抛错。 |
| `PROVIDER_REQUEST_FAILED` | Provider 返回 HTTP/SDK 错误。 |
| `REQUEST_TIMEOUT` | 超过画图 Scene Planner timeout。 |
| `REQUEST_ABORTED` | 用户取消或上游 AbortSignal 取消。 |
| `TOOL_CALL_MISSING` | 响应没有 Tool Call。 |
| `TOOL_CALL_NAME_INVALID` | Tool 名不是 `submit_scene_plan`。 |
| `TOOL_CALL_MULTIPLE` | 返回多个 Tool Call。 |
| `TOOL_ARGUMENTS_INVALID_JSON` | 参数 JSON 损坏或截断。 |
| `TOOL_ARGUMENTS_SCHEMA_INVALID` | 参数不满足 Schema/领域语义。 |
| `NO_IMAGE_TASKS` | `images` 为空。 |

原生 OpenAI 兼容模式没有解析到 Tool Call 时，固定提示：

> 本次响应没有解析到 `submit_scene_plan` Tool Call。这不代表模型不支持 Tool Calling，请根据最近一次实际请求核对返回协议。

其他 Provider 的 `TOOL_CALL_MISSING` 也要说明当前共享主预设与模型，不能笼统显示“解析失败”。

错误分类顺序固定为：已有 `ScenePlannerError` → 用户取消 → 画图内部超时标记 → Provider 明确超时 → 普通 Provider 错误。真实错误不得因为文本里出现 `timeout` 就被覆盖成超时。

### 11.1 重试策略

- Scene Planner 对 Tool 缺失、Tool 名错误、重复调用和契约校验失败返回结构化纠错结果，要求模型重新提交完整计划。
- 连续两次相同错误立即停止；错误持续变化时最多三次模型请求。
- Provider、网络、配置、超时和用户取消不交给模型重试；整个循环共用同一个请求超时。
- 不因未调用 Tool 自动宣称模型不支持，也不把“切换 Tagged JSON”当作错误结论。
- Provider Adapter 自身的宿主协议兼容回退保持 AgentCore 现状，Draw 不复制第二套协议判断。

## 12. 文件级改造清单

### 12.1 新增

| 文件 | 单一职责 |
| --- | --- |
| `docs/draw-agentcore-scene-planner-migration.md` | 本方案。 |
| `modules/agent-core/provider-resolution.js` | 无 SDK 的共享 Provider 配置解析。 |
| `modules/agent-core/browser-entry.js` | AgentCore 浏览器 bundle 公共入口。 |
| `vite.agent-core.config.mjs` | 构建单文件 ESM bundle。 |
| `modules/agent-core/dist/agent-core-browser.js` | 提交的浏览器运行产物。 |
| `modules/draw/shared/draw-agent.js` | 读取共享配置、懒加载 AgentCore、发起单次请求、记录临时诊断。 |
| `modules/draw/shared/scene-plan-contract.js` | Tool Schema、参数校验、角色归一、图片任务转换。 |
| `modules/draw/shared/scene-prompt-expansion.js` | 宏展开与 `CHAT_COMPLETION_PROMPT_READY` 通知。 |
| `modules/draw/shared/tests/scene-plan-contract.test.js` | Tool 契约行为测试。 |
| `modules/draw/shared/tests/scene-planner.test.js` | Prompt/task 构造与调用策略测试。 |
| `modules/agent-core/tests/...` | Adapter `toolChoice`、system Prompt、Tagged JSON required 测试。 |

### 12.2 重写或修改

- `modules/draw/shared/scene-planner.js`
  - 保留世界书、角色上下文、Prompt 链构造与领域编排。
  - 改为构造 AgentCore task 和唯一 Tool。
  - 删除 YAML 解析、截断判断与重试。
- `modules/draw/shared/draw-settings.js`
  - 删除独立 LLM 字段。
  - 用当前字段白名单规范化，防止旧字段回流。
- `modules/agent-core/provider-config.js`
  - 使用并 re-export `provider-resolution.js`。
- `modules/agent-core/adapters/anthropic.js`
  - 补齐 `toolChoice`。
- `modules/agent-core/adapters/openai-compatible.js`
  - Tagged JSON 尊重 `required`/指定 Tool/`none`。
- `modules/agent-core/adapters/sillytavern-openai-compatible.js`
  - 确保共享 Tagged JSON 语义一致。
- `modules/agent-core/adapters/sillytavern-claude.js`
  - 发送并去重 `systemPrompt`。
- `modules/agent-core/adapters/sillytavern-google.js`
  - 发送并去重 `systemPrompt`。
- `modules/agent-core/README.md`
  - 记录纯解析层和 browser entry 边界。
- `package.json`
  - 增加 `build:agent-core` 和对应测试入口；合并时保留工作区现有无关改动。
- 三套 Provider 的 `*-prompts.js`
  - `userJsonFormat` 改为 `sceneRules`。
  - 更新 Prompt 预设与预览链。
- 三套 `top-system.md`、`top-system-pov.md`
  - 去除 YAML 运输词，保留全部语义规则。
- 三套 `output-format.md`
  - 改名/重写为 `scene-rules.md`。
- `novel-draw.js/html`、`sd-draw.js/html`、`comfy-draw.js/html`
  - 调用新 Scene Planner 参数。
  - 删除独立 LLM 设置、模型拉取和旧 Prompt 字段。
  - 接入共享 Agent 摘要与诊断。

### 12.3 删除

- `modules/draw/shared/draw-llm.js`
- `modules/draw/providers/novelai/prompts/output-format-legacy.md`
- `modules/draw/providers/sd-webui/prompts/output-format-legacy.md`
- `modules/draw/providers/comfyui/prompts/output-format-legacy.md`

删除前必须确认 `draw-llm.js` 中的宏展开、历史展开、Prompt ready 事件和诊断能力已经分别迁入明确所有者，不能随旧 transport 一起误删。

### 12.4 需要重建的产物

AgentCore Adapter 是四个现有 Agent 消费者的共享源码，修改后必须重建：

- `npm run build:agent-core`
- `npm run build:assistant`
- `npm run build:ebook`
- `npm run build:fourth-wall`
- `npm run build:tavern`

不能只生成新的 AgentCore browser bundle；否则源码和四个已提交 dist 会处于不同协议版本。

## 13. 最少必要测试

### 13.1 Scene Plan 契约

保护的稳定契约是“一个合法 Tool Call 必须稳定变成现有图片任务；非法 Tool Call 必须明确失败”。覆盖：

- 合法 `mindful_prelude + images` 转换。
- `index` 排序。
- 重复/非法 `index`。
- 已知角色规范名。
- 使用别名返回时归一为规范名。
- 已知角色 `type/appear` 为空并由下游角色库注入。
- 未知角色必须有 `type/appear`。
- 纯风景 `characters: []`。
- A1、C3、E5 等坐标；非法坐标失败。
- `source#` / `target#` / `mutual#` 字段原样保留。
- 精确图片数量与每图角色上限。
- `moments` 与 `images` 数量必须一致，`maxImages = 0` 时也不例外。
- `images` 为空。
- 无 Tool、错 Tool、重复 Tool。
- 参数 JSON 损坏或截断。
- 缺字段、额外字段、错误类型。

### 13.2 Prompt 构造边界

测试公开的 `buildScenePlannerTask` 输出，而不是读取源码做字符串清单。至少验证：

- 三家 Provider 的最终任务都是 `system + 单条 user`，且结构容器与关键指令只出现一次。
- 原文中的 `$&`、`` $` ``、`$'`、`$1`、`$$` 原样保留；有副作用的宏对每个值只执行一次。
- 宏展开抛错时得到 `PROMPT_EXPANSION_FAILED`。
- 最终 `systemPrompt/messages/tool schema` 包含必须保留的协议词：`FICTIONAL_CREATIVE_WORK`、`mindful_prelude`、`source#`、`target#`、`mutual#`、A1/E5、`<worldInfo>`、`<content>`。
- NovelAI 请求包含 `n::tag::` 规则。
- SD/Comfy 请求包含 `(tag:1.2)` 规则。
- 普通与 POV Prompt 都保留各自完整规则。
- 已知角色、别名、服装参考和破损/敞开/滑落/湿透变体进入最终消息。
- 动态图片/角色数量同时进入 Prompt 与 Tool Schema。
- 所有宏按既定顺序展开。
- `CHAT_COMPLETION_PROMPT_READY` 收到展开后的快照，但监听器不能改写实际 task。
- 最终请求不包含 `<meta_protocol>`、YAML 输出要求或 assistant prefill。

### 13.3 AgentCore 协议

- Anthropic `auto/required/none/指定名称` 映射。
- Anthropic 指定不存在的 Tool 名本地失败。
- 托管 Claude `required → any`、`none`、`auto`；指定 Tool 名本地失败；无 tools 时不发送 `tool_choice`。
- 托管 Claude manual thinking 在强制 Tool 下关闭 reasoning 并给出诊断标记；确认 adaptive 的模型保留 reasoning；`sillytavern-google` 仍收到 `required`。
- Reasoning 三态按 Provider、传输方式与模型解析；`inherit` 无控制字段，显式 `off` 不得静默变回默认。
- `output=hide` 的流式和非流式输出均不展示思考，同时保留可回放的 Provider payload 与签名。
- OpenAI Compatible Tagged JSON 在 `required` 时明确强制 Tool。
- Tagged JSON 指定 Tool 名和 `none`。
- SillyTavern OpenAI Compatible 使用相同规则。
- SillyTavern Claude 的 `systemPrompt` 发送与相同首条 system 去重。
- SillyTavern Google 的 `systemPrompt` 发送与相同首条 system 去重。
- OpenAI Responses、Google 既有 `required` 行为不回归。

### 13.4 共享配置

- 每次调用读取最新 `AssistantStorage/settings`。
- 只使用 `currentPresetName`。
- 即使 delegate 已配置，也不得读取 delegate Provider/模型。
- Provider、温度、Token、Reasoning、Tool 模式与共享主预设一致。
- 直连缺 API Key 与托管 Provider 的校验差异。
- 不把旧画图凭据写入共享设置。

### 13.5 构建与 UI

- `agent-core-browser.js` 可由真实浏览器 ESM import。
- bundle 不包含 Draw 业务 Schema/Prompt 的反向依赖。
- NovelAI、SD WebUI、ComfyUI 三页都显示相同共享预设摘要。
- 原生模式显示兼容提醒，Tagged JSON 模式显示实际模式。
- 打开共享 Agent 配置按钮可达。
- 诊断内容隐藏凭据且不持久化。
- 配置预检、宏异常、取消、超时、Provider 和契约错误分别归入本次请求诊断，并带阶段标记；并发时旧请求不覆盖新请求。
- manifest 生成器仍收录画图源码，且不收录生成的 `dist/`。
- 删除的旧 LLM 控件不再影响保存结果。

UI 测试验证可观察 DOM/交互结果，不写读取源码 `includes` 的“控件存在清单”。

### 13.6 既有消费者回归

运行并通过与共享 Adapter 相关的现有测试，以及：

- 小白助手构建和核心 Adapter 测试。
- 电纸书测试与构建。
- 小白酒馆 typecheck、测试与构建。
- 四次元壁构建。
- NovelAI/SD/Comfy 至少各一次 Scene Planner 到图片任务的集成验证。

## 14. 手工 Provider 验证矩阵

| Provider | 模式 | 预期 |
| --- | --- | --- |
| OpenAI Responses | 原生 | 恰好一个 `submit_scene_plan`。 |
| OpenAI Compatible | 原生 | 发送 `tool_choice: required`，恰好一个 Tool Call。 |
| OpenAI Compatible | Tagged JSON | 输出一个 `<tool_call>`，AgentCore 解析为标准 Tool Call。 |
| SillyTavern OpenAI Compatible | 原生 | 宿主请求保留 tools/tool choice。 |
| SillyTavern OpenAI Compatible | Tagged JSON | 与直连 Tagged JSON 同语义。 |
| Anthropic | 原生 | `tool_choice: { type: 'any' }`。 |
| Google AI | 原生 | function calling mode 为 `ANY`。 |
| SillyTavern Claude | 原生 | 后端收到 `tool_choice: 'any'`；manual thinking 模型本次不带 reasoning；system Prompt 不丢失，Tool 参数可解析。 |
| SillyTavern Google | 原生 | system Prompt 不丢失，Tool 参数可解析。 |

每种模式至少验证：已知角色、未知角色、纯风景、多个图片任务和取消请求。

## 15. 实施顺序

### 第一步：补全 AgentCore 通用协议

1. 抽出 `provider-resolution.js`。
2. 修 Anthropic `toolChoice`。
3. 修 Tagged JSON `required`。
4. 修 SillyTavern Claude/Google system Prompt。
5. 添加 AgentCore 协议测试。
6. 重建四个既有 Agent consumer，确认通用层没有回归。

这一步不碰 Draw 调用路径，先把终态依赖建在正确边界内。

### 第二步：建立浏览器入口与领域契约

1. 新增 AgentCore browser entry、Vite 配置和构建脚本。
2. 新增 `draw-agent.js`。
3. 新增 `scene-plan-contract.js` 与测试。
4. 新增 `scene-prompt-expansion.js` 并迁移现有宏能力。

### 第三步：迁移 Prompt

1. 逐 Provider 对现有 Prompt 做语义/运输逐行分类。
2. 重写普通与 POV top system。
3. 把 `output-format.md` 改为 `scene-rules.md`。
4. 对照第 8.1 节完成关键词与规则审计。
5. 用 `buildScenePlannerTask` 行为测试证明最终请求既保留语义又没有 YAML transport。

### 第四步：切换 Scene Planner

1. 重写 `scene-planner.js` 使用单次 Tool 调用。
2. 三个 Provider 接到新返回任务。
3. 验证角色注入、数量限制和现有出图链路。
4. 不保留 YAML fallback 或 feature flag 双路径。

### 第五步：清理设置与 UI

1. 删除画图 LLM 字段与模型拉取逻辑。
2. 清理 Prompt 预设，只保留两套完整规则。
3. 三页改为共享 Agent 摘要。
4. 接入临时诊断和明确错误提示。

### 第六步：删除旧实现并总验收

1. 删除 `draw-llm.js`、legacy Prompt 和 YAML 解析。
2. 用 `rg` 做一次人工残留审计。
3. 跑最少必要测试。
4. 重建所有 dist。
5. 按 Provider 矩阵手工验证。

回滚方式是整体 revert 对应迁移提交，不在正式代码中保留两套运行时。

## 16. 完成定义

只有同时满足以下条件，改造才算完成：

- Draw Scene Planner 不再 import 或解析 YAML。
- 最终模型请求中不存在 YAML 输出协议、`<meta_protocol>` 或 assistant prefill。
- 每次请求只使用共享 Agent `currentPresetName` 主预设。
- 画图设置中不再存在独立 Provider、API Key、模型和模型缓存。
- 原生和 Tagged JSON 都统一产出标准 `submit_scene_plan` Tool Call。
- 无 Tool、错 Tool、多 Tool、坏参数和空 images 都有不同错误。
- Prompt 第 8.1 节所有关键语义均进入最终请求。
- 已知角色、未知角色、别名、服装变体、纯风景、坐标和互动方向行为正确。
- Scene Planner 不自动切换 Tool 模式；契约失败进入有界自纠循环（同一次规划最多 3 次尝试、连续相同错误第二次即停），网络/配置/Provider/取消错误不重试，纠错记录只存活于本次请求。
- `mindful_prelude` 与请求诊断均为临时态，没有新增持久化实体。
- NovelAI、SD WebUI、ComfyUI 后续出图行为无回归。
- 小白助手、电纸书、小白酒馆、四次元壁的测试与构建通过。
- AgentCore browser bundle 和所有受影响 dist 已重建并提交。

## 17. 实施与验收记录

实施日期：2026-08-17。

### 17.1 已落地终态

- Draw 每次规划都读取 `LittleWhiteBox_Assistant.json/settings`，只解析 `currentPresetName` 主预设。
- Draw 固定发送一个 `submit_scene_plan`，固定 `toolChoice: 'required'`、非流式、无 prefill、无 Tool loop；Tool 协议交给 AgentCore，不覆盖其兼容行为。
- OpenAI Compatible 的原生/Tagged JSON 选择及托管协议回退由 AgentCore 统一负责，Draw 不维护分叉实现。
- `draw-llm.js`、三套 `output-format.md`、三套 `output-format-legacy.md`、YAML 清洗/解析/截断恢复与独立画图 LLM 设置已经退出运行时。
- 三套 Provider 只保留 `默认-完整规则` 与 `默认-第一人称完整规则`，并统一使用 `sceneRules`。
- Prompt 中的 mindful prelude、anchor、已知/未知角色、服装状态、方向互动、A1~E5、Tag 配额、物理限制、世界书、NSFW 与 Provider 权重语法均保留。
- AgentCore 已补齐 Anthropic `toolChoice`、Tagged JSON required/named/none 与 SillyTavern Claude/Google system Prompt；Draw 直接复用这些边界。
- AgentCore 浏览器入口是无 Draw 反向依赖的单文件 ESM；Draw 仅在实际规划时懒加载。
- 三套设置页已删除独立场景 LLM Provider、URL、Key、模型、模型缓存、流式与 prefill 控件，改为共享主预设摘要、兼容模式提示和内存诊断。

### 17.2 Review 中补齐的问题

- NovelAI 原先同时缓存共享角色库、世界书、过滤规则、Danbooru、图库天数与规划超时，SD/Comfy 保存后 NovelAI 可能继续读取旧副本。运行时现统一从 `draw-settings` 读取，共享字段写入也统一经过共享持久化入口；NovelAI 参数预设不再伪装成共享设置。
- Scene Planner 与 NovelAI 图片队列的用户取消不再降级为 `UNKNOWN`，统一进入 `ABORTED` / `REQUEST_ABORTED` 错误边界。
- Assistant 项目结构与文件 manifest 改为当前 `scene-rules.md` 和新共享源码模块，不再列出已删除文件；运行用 AgentCore bundle 位于按设计排除的 `dist/`，单独由构建与 ESM import 验证覆盖。
- 新 AgentCore dist 已加入生成产物 lint 排除；源码仍由完整 ESLint 覆盖。
- 酒馆旧架构清单中锁死 `snapshotNovelRequestConfig(getSettings())` 的源码正则已删除；提交时冻结请求配置由 NovelAI 行为测试保护，不再把内部函数名当契约。

### 17.3 第二轮 Review 修复

- 请求形态改为 `system + 单条 user 任务`。旧链以连续 `assistant` 开头且存在连续同角色消息，直连 Anthropic / Google 会直接拒绝；现在所有段落按原顺序拼进同一条 user 任务，三套 Prompt 结构预览同步更新。
- 托管 Claude 在 Adapter 边界把 `required` 译为 Anthropic `any`（`none`/`auto` 直通，指定 Tool 名本地报错）。共享 Host/OpenAI helper 未改动，`sillytavern-google` 仍收到 `required`。
- 托管 Claude 的 manual thinking 与强制 `any` 冲突时按 Tool 契约优先关闭本次 reasoning，并在 requestInspection、诊断与设置页摘要上标记；`claude-opus-4-7` 等确认 adaptive 的路径保留 reasoning，4.6 因宿主配置不可知按 manual 保守处理。
- 原文、世界书、角色列表、TAG 指南各只展开一次，通过一次性哨兵串字面拼接进已展开模板；模型看到的原文与 anchor 校验文本是同一份结果，原文中的 `$&`、`` $` ``、`$'`、`$1`、`$$` 原样保留。
- 宏加载与展开异常统一包装为 `PROMPT_EXPANSION_FAILED`，拥有独立错误分类与 UI 文案，并写入本次请求诊断。
- Prompt runtime 只缓存模块引用，`chat`/`name1`/`name2` 每次实时读取；删除没有正式来源的 `window.STscript` 分支，官方变量宏交给 `substituteParams`。
- 错误分类顺序固定为「已有 `ScenePlannerError` → 用户取消 → 内部超时标记 → Provider 明确超时 → 普通 Provider 错误」。
- 诊断句柄在 Scene Planner 入口、Prompt 构建前创建，覆盖 prompt/config/request/parse 四个阶段并带请求 ID，慢的旧请求不再覆盖新请求。
- 删除 SD/Comfy 中不存在的 `*-shared-status` 兜底 ID；角色保存改用现有 toast，世界书只更新真实的 `*-worldbook-status`。
- 契约层始终校验 `moments.length === images.length`，`maxImages = 0` 时也不放行。
- Assistant manifest 生成器排除生成的 `dist/`，同时完整收录 Scene Planner 源码。

### 17.4 本地验收证据

- Draw Scene Planner：22/22，覆盖 user-first 请求形态、关键标记唯一性、replacement token 保真、单次宏执行、`PROMPT_EXPANSION_FAILED`、六类失败阶段诊断与并发诊断归属。
- AgentCore 定向 Adapter：小白助手 workspace 269/269，含托管 Claude `required → any`、manual/adaptive thinking 分支与 manifest 排除测试。
- NovelAI transport：16/16。电纸书：189/189。小白酒馆：859/859（含 Vue TypeScript 构建检查）。
- `npm run lint` 通过：乱码检查、421 个相对 import、全部 JS 与 Tavern TS/Vue ESLint。
- `build:agent-core`、`build:assistant`、`build:ebook`、`build:fourth-wall`、`build:tavern` 全部重建通过；bundle 不含 Draw Schema、Prompt 或模块依赖。

### 17.5 外部环境冒烟

真实 Provider 的网络调用需要本机共享 Agent 中已配置的模型与凭据，不在仓库自动化中伪造。发布前按第 14 节矩阵分别切换共享主预设，至少验证一次原生 Tool Calling 与一次 Tagged JSON；这项只验证外部模型/供应商兼容性，不再改变运行时架构或增加 fallback。

### 17.6 Reasoning 契约收口

- 共享配置从布尔开关改为 `inherit | on | off` 三态，并把思考强度、Token 预算和输出展示拆成独立字段；测试线旧布尔字段不再进入当前 schema。
- 能力矩阵下沉到 AgentCore，按 Provider、直连/托管传输与模型解析；不支持的显式开启或关闭在发送前给出能力错误。
- 七个 Adapter 只编码各自已经确认的协议字段；通用 Host helper 不再注入 Reasoning 参数，也不在 4xx 后删参重试。
- `output=hide` 同时约束流式进度和最终结果，但保留 Provider 原文、thinking/signature 与 OpenAI Responses output，确保多轮 Tool 回放不损坏。

### 17.7 插图点编号与 placement 迁移（2026-08-20）

- Tool 自纠循环：契约校验失败时把真实 tool_result 反馈给模型重试，同一次规划最多 3 次尝试；连续相同错误签名第二次即停；网络/配置/Provider/取消错误不重试。Google 走 `toolResponses` session，其余 Adapter 走带 `providerPayload` 的规范历史回放；Adapter 与 10 分钟总超时各创建一次。
- 文字 anchor 契约删除：`moments[].anchor_target` 改为 `insert_after` 插图点编号，`images[].anchor` 退出契约。宿主通过 `scene-source.js` 在保留原始 UTF-16 offset 的映射视图上剔除 `[image:]`/`[ebook-image:]`/`[tavern-image:]` 标记与过滤区段，于句末/段落/末尾生成【插图点 N】，hash 对完整原始快照。
- placement 落地：`scene-placement.js` 的 `insertScenePlacements` 逆序批量插入（`block` 选项补换行）；写入前精确比较 `sourceHash`，正文变化即抛 `ScenePlacementError`/`SCENE_SOURCE_CHANGED` 并拒写。模糊 anchor 搜索、句末探测与“找不到就追加末尾”兜底全部删除。
- 楼层流程：规划后一次分配 slot、hash 校验、批量插占位、逐张替换；中止保留成功图并移除未开始的 pending 占位（保留段落空行），零成功恢复原文。
- 电纸书/小白酒馆写入端：hash 变化即拒写并提示重试；酒馆发送完整原文，重绘不再丢失既有 `[tavern-image:]` 标记；手动 Prompt 使用 `placement: { mode: 'tail' }`。
- 画廊与 saved-entry 不再持久化 anchor 字段。
- Draw 诊断记录 requested mode、effective mode、能力 profile 与实际控制字段，托管 Claude 因强制 Tool 关闭本次 Reasoning 时仍给出明确 notice。
