# Agent API 设置与后台维护终态设计

## 1. 目标

普通小白 OS 只提供一个 Agent API 设置入口，并为确实需要模型自动维护的 APP 提供一次接受轮一次请求的后台编排。

这层解决的是配置、供应商调用和 SillyTavern 事件时序，不拥有地图、任务或四次元壁的业务语义。普通 OS 仍不依赖`modules/tavern/**`。

## 2. 开工检查结论

| 项目 | 结论 |
| --- | --- |
| 功能所有者 | `agent-core`拥有共享配置格式和供应商调用；`apps/agent-api`拥有 OS 设置界面；Agent Capability 拥有普通 OS 调用桥；Maintenance Capability 拥有接受轮捕获和运行编排 |
| 唯一事实来源 | Agent 配置继续是`AssistantStorage`中的`settings`；OS 总开关与 Map/Tasks 自动维护偏好在`xiaobaiOs`扩展设置；运行队列只在内存 |
| 持久态 | 共享 Agent 配置、OS 总开关、Map/Tasks 的自动维护偏好 |
| 临时态 | 配置草稿、连接测试、模型列表、接受轮快照、请求队列、AbortController、running/error/last-run UI 状态 |
| 外部依赖 | SillyTavern `MESSAGE_SENT`与聊天上下文、`agent-core`、`AssistantStorage`、各 participant 的 ScopedChatStore |
| 注册入口 | Capability catalog 注册 Agent/Maintenance；Agent API 与领域 APP 通过 Host/Shell catalog 和 module 注册 |
| 删除路径 | 删除系统 APP与 host 注册，四次元壁/Map/Tasks 改回各自显式依赖；不得留下 Fourth Wall 转发弹窗 |
| 兼容对象 | 保留当前共享 Agent 配置格式与上游真实 Fourth Wall 设置迁移；用户点名保留的 OS `enabled`及 APP 偏好在无版本归一化时原值保留，旧根版本标记和旧 Map/Tasks `enabled`不进入现行设置 |
| 最少测试 | 共享 Agent 配置即时同步、OS 偏好持久化、User 后单次触发、swipe/regenerate 不触发、关闭时零请求、切聊/关开关使迟到结果失效、领域提交隔离 |

## 3. 终态结构

```text
modules/xiaobai-os/
├─ agent/
│  └─ browser-entry.ts              OS Agent 浏览器 bundle 入口
├─ capabilities/
│  ├─ agent/
│  │  ├─ gateway.ts                 共享配置读取与供应商请求
│  │  └─ bridge-loader.ts           单例加载 OS Agent bundle
│  └─ maintenance/
│     ├─ accepted-turn-source.ts    读取刚被确认的上一轮
│     ├─ registry.ts                领域 participant 注册
│     ├─ fifo-coordinator.ts        当前运行内 FIFO
│     ├─ commit-guard.ts            来源、开关和 sidecar 提交栅栏
│     ├─ provider-tool-loop.ts      Provider-aware 多轮工具循环
│     ├─ outcome.ts                 运行与逐 participant 结果
│     └─ runner.ts                  薄编排 facade 与取消入口
└─ apps/
   ├─ agent-api/                    桌面设置 APP、Controller、UI
   ├─ fourth-wall/                  只保留四次元壁业务
   ├─ map/maintenance/              Map Prompt、工具和 staged mutation
   └─ tasks/maintenance/            Tasks Prompt、工具和 staged command
```

Maintenance Capability 不得出现 Map/Tasks 字段、Prompt 文本或状态分支。新增自动领域只能通过注册一个 participant 接入。

OS Agent bundle 取代当前由 Fourth Wall 命名和拥有的 Agent bundle。供应商适配、配置规范化和设置表单行为继续复用`agent-core`；四次元壁只向 gateway 提交自己的 prompt 和请求选项。

### 3.1 已落地业务能力与迁移边界

Agent/maintenance 的业务行为已经落地，但当前代码仍位于旧 host/composition。Kernel 施工时必须按上方目录迁入 Capability，并删除旧入口，不能在旧目录外包一层转发器形成双路径。

- Agent API APP、Agent gateway 和通用 Agent bundle 已完成，因为四次元壁是它们当下的真实消费者。
- Map 交付自己的领域、Prompt、工具、Session、UI 和 participant 时，同阶段引入了 accepted-turn source 与业务无关 runner；Map 固定注册桌面入口，自动维护开关只在 APP 内。
- Tasks 已交付自己的领域、Prompt、工具、Session、UI、资金事务和 participant，没有在通用 runner 中增加 Tasks 状态分支。
- Map 与 Tasks 是两个真实 participant；同一接受轮可共用一个 Provider Session，但各自拥有 staging、结果和提交事务。

“打开 APP 不检查 API”“关闭自动维护不调用 API”“只由已保存 User 确认上一轮”是现行运行契约。未来增加自动领域时，仍必须先有完整业务所有者和真实消费者，再通过 participant 注册接入，不能预建空基础设施。

## 4. 统一 Agent API 设置

### 4.1 配置所有权

Agent API 设置是小白扩展的用户级共享配置，不属于某个聊天，也不属于四次元壁：

```text
AssistantStorage / LittleWhiteBox_Assistant.json / settings
```

普通 OS 不在`chat_metadata`或`xiaobaiOs.apps`复制 provider、baseUrl、model、apiKey、temperature 等字段。OS 的 Agent API APP 是这份共享配置的一个正式编辑界面，因此在这里保存会与小白酒馆、Ebook、画图等其他共享 Agent 配置的消费者同步。

`agent-core/settings-repository.js`继续作为唯一配置读写入口，负责读取、规范化并原子保存同一份用户级配置。各功能在打开或实际执行时读取当前配置；设置页只是单点编辑入口，不建立跨页面同步、冲突检测或手动重新载入协议。`apps/agent-api`不另建 repository。

### 4.2 桌面 APP

- 「Agent API」、Map 和 Tasks 都随 OS 固定注册；只要 OS 本身启用就常驻桌面。
- 四次元壁删除「Agent API 配置」按钮、`open-agent-settings`frame action、专属 dialog 和对应测试，不保留代理入口。
- Map、Tasks、四次元壁不显示 provider/model/key 表单；它们只消费 gateway。
- 打开 APP 只读取共享配置，不联系模型供应商；拉取模型、连接测试必须由用户明确点击。
- 配置未启用或不完整时，页面显示本地判断结果；不能为了显示“是否可用”自动探测网络。
- APP 路由和表单壳必须立即显示，配置读取在页面内呈现明确 loading；不得让 shell 的打开握手等待 Agent bundle、AssistantStorage 或模型列表，不能以 host timeout 代替正常加载态。

### 4.3 视觉与表单契约

页面使用 OS 自己的黑色控制中心风格，但复用`agent-core`已经验证的 provider、预设、模型和保存逻辑，不复制一套字段状态机。

主题必须完整覆盖原生控件：

- 根容器声明正确的`color-scheme`；
- `select`、`option`、`optgroup`同时定义前景色与背景色；
- input、textarea、autofill、disabled、focus、错误和保存状态均使用 OS token；
- 不依赖`color: inherit`猜测 WebView 的原生下拉配色；
- 页面在 OS iframe 内渲染，不再创建宿主 DOM overlay。

OS 页面只展示 API 供应商相关能力。Assistant 权限、delegate、Tavily 等不属于普通 OS 当前需求的区块不显示，但共享配置中的既有值必须原样保留。

## 5. Agent gateway

gateway 是 APP 与`agent-core`之间的窄边界：

```ts
interface XiaobaiOsAgentGateway {
    loadConfig(): Promise<AgentConfig>;
    openSession(config: AgentConfig): Promise<AgentSession>;
    run(request: AgentRunRequest, signal: AbortSignal): Promise<AgentRunResult>;
    testConnection(request: ExplicitConnectionTest, signal: AbortSignal): Promise<TestResult>;
}
```

- `loadConfig`只读共享配置。
- maintenance 每个 job 只调用一次`openSession`并复用同一个 adapter；一次性`run`保留给四次元壁等真实消费者。
- `run`只在明确的前台动作或 maintenance job 已经获准时调用供应商。
- `testConnection`只能由 Agent API APP 的显式操作触发。
- gateway 不判断 participant 是否参与请求，不读 Map/Tasks 数据，不拥有 Prompt。
- API APP 是 gateway 的设置界面，不是其他 APP 的运行依赖；关闭设置页面不影响四次元壁或后台任务。

## 6. APP 入口与自动维护

Map 和 Tasks 是与银行相同的固定桌面 APP，不存在各自的产品启用开关。两者各自只有一个用户级自动维护开关：

| 开关 | 关闭后的行为 |
| --- | --- |
| 自动维护 | APP 仍可打开和读取；不为该领域创建后台工作，不读取 Agent 配置，不调用供应商 |

- 「自动维护」只放在对应 APP 的设置页，不复制到扩展设置，也不放进 Agent API APP。它是用户级偏好，作用于所有普通聊天，因此 UI 必须明确标注「所有普通聊天自动维护」。Tasks 没有 active 任务时可本地返回 null；Map 是否出现新空间事实需由 Agent 判断，所以开启 Map 自动维护就表示每个有效接受轮都参加请求，即使最终无需更新地图。开关说明只解释触发时点，不另设 API/token 常识提醒。
- 自动维护默认关闭。切换它不改变桌面图标、APP runtime 或主聊天只读 Prompt，也不影响用户明确点击的维护/重建/刷新请求。

自动维护开关只保存用户级偏好，不读取 Agent 配置、不发请求，也不创建聊天数据。APP Controller 通过唯一 settings repository 的窄命令保存，shell 不自行解释或保存设置。

终态 settings repository 为`map|tasks`分别提供类型化的`setAutoMaintenance`和当前运行内变更订阅，但命令与字段随对应完整 APP 一起加入：Map 阶段只加入 Map，Tasks 阶段再加入 Tasks，不预建尚无所有者的配置。APP Controller 只能调用这些命令；repository 在确定保存成功后发布新快照，确定失败则恢复旧值。若宿主保存结果不确定，沿用现有 settings 候选语义：保留当前内存候选、按候选执行并明确提示“保存未确认”，不另造第二套 pending 开关。

完整 APP 在 production composition 和 shell 中静态注册 descriptor、runtime、主 Prompt runtime 与 participant；OS cleanup 统一清 Prompt、取消请求并停止后台。对应 APP 完成前，其配置字段和注册入口均不存在，不能先交付没有完整页面与领域行为的占位图标。

用户可在具体 APP 内通过「维护一次」「重建」或「刷新」按钮发起显式请求；无需再用弹窗或附加区块提醒这些 Agent 功能会使用已配置的模型。

若运行中关闭自动维护，该领域的自动 job token 立即失效并请求 abort；即使供应商仍返回，sidecar replace 发出前也必须再次检查 token 并丢弃迟到结果。显式「维护一次」和「重建」在点击时捕获来源并进入 Host 队列，不依赖自动维护开关，也不由 APP activation 拥有。返回桌面、切换 APP 或关闭 OS 窗口只解除 UI 订阅，不使任务失效。设置 mutation 的 installed 通知只负责自动 job 的即时执行栅栏，稳定发布不切换 Prompt 或页面生命周期。

## 7. 接受轮触发语义

### 7.1 唯一自动触发事件

SillyTavern 的普通发送流程先把 User 消息加入`chat`、执行`saveChatConditional()`，随后才发出`MESSAGE_SENT(messageIndex)`。后台维护只监听这个事件。

事件处理器只同步完成捕获和入队，然后立即返回；不能把 Agent Promise 返回给 SillyTavern 的串行事件总线，不能阻塞本轮主 RP 生成。

### 7.2 被处理的内容

```text
U1 → A1a → swipe A1b → 用户发送并保存 U2
                              ↓
                    维护 U1 + 当前选中的 A1b
```

U2 是“上一轮已经被用户接受”的边界，不是本次维护证据。群聊时，接受轮包含上一条 User 及其后、U2 之前连续出现的全部非系统 Assistant 消息；首条 User 之前若只有角色开场白，可把该开场白作为首个接受来源。

只接受尾部追加的普通 User 消息。向历史中间插入 User、系统消息、空消息或没有可接受 Assistant 内容的事件不创建 job。

捕获快照包含：

- Kernel 当前聊天 scope token 与 osId/binding；
- 触发 User 的消息位置、角色和原始文本；
- 捕获时已完成的普通 Assistant 回复总数；
- 接受来源中每条消息的位置、角色、当前`swipe_id`和当前文本；
- 本轮玩家契约`actorKey:"player"`、SillyTavern 用户展示名，以及每条消息的 speakerName；展示名在捕获入口统一清理控制字符、折叠空白并截到 120 个 Unicode 字符。

participant 的运行 token 属于 job 临时态；领域 revision 在`createSession`读取并由提交事务做 CAS，不伪装成聊天消息来源字段。

提交前重新读取当前聊天并逐项比较这些原始值。这里不需要消息 hash、Web Crypto、剧情指纹或持久“核对中”状态；任一值变化、聊天切换或来源消失都直接丢弃该迟到结果。

### 7.3 永不触发的事件

- `MESSAGE_RECEIVED`、`GENERATION_ENDED`；
- Assistant 流式片段；
- swipe、regenerate、continue；
- 打开 Map/Tasks APP；
- OS 启动、聊天切换或页面恢复；
- provider/model/API key 的编辑与保存。

因此用户可以无限 swipe，而不会产生任何自动维护 API 消耗。

### 7.4 手动「维护一次」

「维护一次」不是对整段聊天做隐式扫描。用户在 Map 或 Tasks 内点击后，只为当前 APP 捕获聊天尾部最新一组完整的 User + 当前所选 Assistant 内容；群聊仍包含该 User 后连续出现的全部非系统 Assistant 消息。尾部没有完整 Assistant 内容、正在生成、聊天已经切换时不发请求，并给出本地提示。

这个点击本身表示用户明确接受当前所选回复，所以不要求再发送下一条 User。它复用同一套消息位置、文本、`swipe_id`和领域 revision 提交守卫，并进入当前聊天同一条 Host FIFO 队列，但只运行被点击 APP 的 participant；`autoMaintenance=false`不阻止这次显式请求。入队后 Host 立即发布 running，Controller 立即响应，按钮原位禁用并显示“正在维护”；同一 participant 运行期间不接受第二次点击。

「从当前聊天重建」可以读取更长的当前聊天来生成完整候选领域，校验成功后一次替换。按钮必须与「维护一次」分开命名并说明处理范围，但点击后直接入队，不弹二次确认或 API 成本提示。

## 8. 一次请求、领域自有

同一接受轮中，只要至少一个 participant 已开启自动维护且有工作，runner 组装一次 Agent 请求。Map 与 Tasks 各自提供：

```ts
interface MaintenanceParticipant {
    id: string;
    isEnabled(mode: MaintenanceMode): boolean;
    createSession(
        source: AcceptedTurnSource,
        mode: MaintenanceMode,
    ): MaintenanceSession | null | Promise<MaintenanceSession | null>;
}

interface MaintenanceDataMessage {
    readonly role: 'system' | 'user';
    readonly content: string;
}

interface MaintenanceSession {
    readonly participantId: string;
    readonly prompt: string; // 只含可信静态规则和可信运行模式
    readonly dataMessages: readonly MaintenanceDataMessage[]; // 不可信领域数据
    readonly tools: readonly MaintenanceFunctionDeclaration[];
    // executeTool / getResult / canCommit / commit / invalidate 保持既有协议
}
```

- participant 自己读取领域状态、构造静态 Prompt、声明工具、校验参数并维护 staged state；当前没有领域工作时返回`null`，不能创建一个空 Session 迫使 runner 读取配置。
- runner 先为当前 mode 可参与的 participant 创建 Session。全部返回`null`时，在`gateway.loadConfig()`和`openSession()`之前以`skipped/no-work`结束；部分为`null`时只运行其余 Session。
- runner 的静态 system rules 只由通用规则和各 Session 的`prompt`组成。共享背景以 system data message 发送`<setting>/<current_state>`，每个 Session 的动态领域投影放在自己的 user`dataMessages`，玩家身份与接受消息放在 runner 单独构造的 user`<accepted_turn>`；动态资料不得拼进静态 rules。
- Agent 工具先写 participant 的内存 staging context，不在模型循环中直接保存聊天数据。
- 请求完成后，各 participant 分别通过自己的 Scoped Store 提交；Map 失败不抹掉一个已经合法提交的 Task，反之亦然。
- Tasks 的状态与 Economy 资金腿仍必须在它自己的单次 Scoped transaction 中形成一个 sidecar candidate 并原子提交。
- Agent 没有通用“写 OS 根”“改余额”或“任意执行 JS”工具。

Provider-aware tool loop 只拥有传输和编排错误，不复制领域失败状态：

- 已成功进入`session.executeTool()`并返回结构化`ok:false`的调用由所属 Session 按实体/调用身份追踪；loop 只把结果回喂模型并参与相同失败签名刹车，不能再按工具名保存一份“未解决失败”；
- JSON 参数无法解析、未知工具或`executeTool()`抛异常等未形成结构化领域结果的情况，才由 loop 记录调用级失败；已知工具的调用级失败归属其 participant，未知工具暂为未归属；
- 后续成功进入同一 participant Session 的工具调用清除该 participant 的调用级失败；后续任一合法已声明工具调用表示未知工具名已被纠正，可清除更早的未归属失败；
- 最终领域`updated/unchanged/partial/failed`以`session.getResult()`为准，loop 只在仍有调用级失败、Provider 失败或轮次耗尽时按已有 staging 覆盖为 partial/failed。

四次元壁的用户发送、任务大厅刷新和候选人生成是独立的显式请求，不与接受轮 maintenance 合并；它们只共用配置和 gateway。

## 9. 队列、取消与失败

- 当前聊天只有一条 FIFO maintenance 队列，不并行维护两个接受轮。
- 新 User 到来时前一 job 可继续；自动、手动维护和重建均允许原捕获边界之后追加消息，不因继续聊天整次作废。原依据的文本、角色、swipe、位置或聊天身份发生变化仍失效；后一个等待前一个完成，避免旧结果覆盖新状态。
- 关闭 OS 窗口不影响已经获准的自动 job、手动维护或重建；三者都属于 Host 后台，不由页面寿命拥有。重新打开 APP 时从 runner 状态恢复按钮和最近结果，不新增持久任务字段。
- board 刷新和候选招募仍是所属页面拥有的前台请求，离开对应页面、再次发起同类请求或 OS cleanup 时请求 abort。手动维护/重建只在切聊、来源变化、OS 总开关关闭、Host cleanup 或明确取消时失效；保存 commit point 之后按真实结果落定。
- 切聊、OS cleanup 或 OS 总开关关闭时，中止 active job 并清空当前运行队列。若某 participant 的 sidecar replace 已经发出，该次保存无法物理撤回；等待它落定、保留真实 committed outcome，再取消其余 participant 和后续 job。
- API 配置缺失、未启用或读取失败时，本次 job 以本地错误结束，不发供应商请求。
- 工具解析、参数和可恢复执行错误以结构化结果回喂模型，不销毁 Session；同一工具名、原始参数与结构化结果组成相同失败签名，连续三次时注入刹车，第四次结束，Provider 回合上限为 12。
- Provider 后续失败或轮次耗尽时，已有合法 staging 的 participant 以 partial 提交；没有合法变化的 participant 为 failed。单个 participant 的领域错误不能跨领域冒充成功。
- outcome 明确区分`updated/unchanged/partial/failed/cancelled/skipped`并携带逐 participant 结果；UI只翻译稳定状态，内部错误只写日志。
- 运行状态和最近一次结果按聊天身份与 participant 隔离，只活在当前 Host 进程，由 APP 随时读取；不依赖某个 iframe 页面存活，也不得在切聊后投影到另一聊天。
- 自动失败后不在重载时偷偷补请求。用户可等待下一次接受轮，或在 APP 内明确点击「维护一次」。

后台队列不是用户长期事实，也没有跨重启恢复要求，因此不进入 sidecar 或聊天 metadata。Map/Tasks 的已提交领域状态可以在后续维护中继续被修正；不保存完整聊天副本、pending prompt 或 Agent 原始输出。

## 10. 主聊天 Prompt 与后台维护分离

Map/Tasks 是否向主 RP 投影当前状态，由各 APP 自己的 prompt runtime 决定。该投影：

- 不经过 maintenance runner；
- 不调用 Agent API；
- 使用已提交领域状态的只读、安全摘要；
- 在 OS cleanup 时立即移除；
- 遵守现有主生成生命周期，不能遗留 extension prompt。

这样“自动维护关闭”只代表不花费后台 Agent 调用，不会意外禁用静态任务/地图连续性提示。

维护 Agent 的共享宿主背景由`host/prompt-context`捕获，核心层只认识有界背景消息，不导入 Map、Tasks 或 Story Summary 领域类型。消息顺序固定为：system`<setting>`、system`<current_state>`、各 participant 自有 user data、最后 user`<accepted_turn>`。`<accepted_turn>`提供本次接受轮的剧情证据；剧情变化认定与设定补全权限分别由各领域声明，共享包装不再一刀切禁止基于设定的写入。Map 可依据设定建立地理和普通可见布局，但这不构成人物行动、已到访或事件发生的证据，也不授权其他领域推断任务进展或奖励。自动维护的背景只取接受轮之前最近 4 条消息；触发维护的下一条 User 不进入请求；Map rebuild 不注入旧 Map 摘要。participant 全部返回 no-work 后不得捕获背景、读取 Agent 配置或创建 adapter。

## 11. 数据、迁移与删除

OS 扩展设置当前包含总开关、Fourth Wall 设置与`map.autoMaintenance`、`tasks.autoMaintenance`，不包含 Map/Tasks enabled 或 Agent 凭据。它是普通 SillyTavern 用户偏好：内存修改后调用宿主`saveSettingsDebounced()`，不做额外`/api/settings/get`读回确认，也不建立 OS 根 settings schema。`prepare()`只把入口数据投影成当前形状并保留现有`enabled`和有效 APP 偏好；Fourth Wall、Map、Tasks 各自补默认值，旧根版本标记和旧 Map/Tasks `enabled`不再写回。未来增加 APP 设置时由该 APP 的 normalizer 负责，不能提升整个 OS 版本或让无关 APP 阻断总开关。

移除这套能力时：

1. 删除 Agent API APP 的 host/shell 注册；
2. 删除 maintenance runner 和 participant 注册；
3. 将仍需模型的 APP 改为明确的新所有者，或一并下线；
4. 不删除共享 Agent 配置文件，除非整个小白 Agent 产品明确下线；
5. 删除 Fourth Wall 旧弹窗协议与测试，不留兼容壳。

## 12. 最少必要验证

| 稳定契约 | 最低成本检查 |
| --- | --- |
| 共享配置不被 OS 私有化或覆盖无关字段 | repository 集成测试 |
| 原生下拉在 OS 暗色界面及目标 WebView 中可读 | 浏览器 computed style + 实际视觉检查 |
| Agent API 路由立即显示，慢配置读取有可见 loading 且不触发 host timeout | 浏览器集成测试 |
| User 保存后只入队一次 | accepted source/runner 集成测试 |
| swipe、regenerate、Assistant 回复零请求 | 宿主事件集成测试 |
| 所有自动维护均关闭时连配置都不读取 | runner 单测 |
| 参与自动维护的 participant 全部返回 no-work 时连配置都不读取 | runner 单测 |
| 共享背景/领域资料/接受证据按 system data、user data、user evidence 固定分层 | Provider 请求结构集成测试 |
| 领域工具换名修正同一实体失败后不残留假 partial | Session + runner 集成测试 |
| Map/Tasks 随 OS 固定出现，自动维护开关不影响 runtime/Prompt | lifecycle + Prompt 集成测试 |
| 关闭自动维护立即使自动 job 失效且不影响显式请求 | 设置 repository + runner 集成测试 |
| 切聊、关自动维护、改 swipe 使迟到提交失效 | runner + Scoped Store 集成测试 |
| 手动维护只读取最新完整接受轮，并且只运行被点击领域 | accepted source/runner 集成测试 |
| 手动维护入队后立即响应；离开/重开 APP 不取消且按钮仍反映 Host 状态 | runner + Controller 公开行为测试 |
| Map/Tasks 一次请求但领域提交互不冒充 | participant 集成测试 |
| Fourth Wall 原有生成行为不因设置入口迁移改变 | Fourth Wall Controller 公开行为回归 |

不增加读取源码做`includes`的结构清单测试；目录边界由 TypeScript import、lint、build 和真实运行契约证明。
