# Assistant Frontend Architecture

## Goal

本文定义小白助手的宿主、iframe、会话、工作区与共享 Agent 能力边界，供开发和故障排查使用。

当前真正需要守住的，不只是 `host shell / iframe shell / feature UI` 三层，还包括：

- 会话与持久化边界
- `[Current context]` / `[Current plans]` 这类提示词前缀注入
- `Plan*` 与 `DelegateRun` 这两类编排能力
- provider 适配器与工具主循环的分工

目标是避免这些职责重新混回 `assistant.js` 或 `main.js` 里。

## Current Structure

### 1. Agent Core

共享配置、模型适配、工具原语、计划账本与子任务执行的所有权见 [Agent Core](../agent-core/README.md)。助手不复制共享协议，不把自己的 UI、工作区、数据库或 JS API 放进 Core。

助手显式提供 `LittleWhiteBox_Assistant.plans` 等持久化端口；其他 App 使用自己的存储。新增通用能力直接依赖 Core 入口，不经其他 App 的内部文件复用。

### 2. Host Shell

Files:

- `assistant.js`
- `assistant-host-window.js`

Responsibilities:

- `assistant-host-window.js` 负责宿主浮层窗口、拖拽、最小化、全屏、移动端布局和 iframe 外壳行为
- `assistant.js` 负责 host 侧消息桥接、工具派发、配置/清单加载、宿主缓存、Slash 和 JS API 接线
- host 层可以感知工具调用和工作区同步，但不应该渲染 iframe 内部功能 UI

### 3. Iframe App Composition

Files:

- `assistant-overlay.html`
- `app-src/main.js`
- `app-src/ui/app-shell.js`
- `app-src/ui/app-chrome.js`
- `app-src/styles.js`

Responsibilities:

- `assistant-overlay.html` 保持极薄，只负责挂载 `dist/assistant-app.js`
- `main.js` 负责装配 state、session store、runtime、workspace、settings 和 render 调度
- `app-shell.js` 负责根级 markup
- `app-chrome.js` 负责 toolbar、sidebar、compose 区、workspace chrome 等壳层 UI
- `styles.js` 负责 iframe 全局样式

`main.js` 应保持“装配器”角色，而不是重新长成一个全能大文件。

### 主助手内置插件：答复交付

`plugins/delivery/` 拥有工具协议、设置、侧栏面板与回执的正文投影。入口与 API 配置并列，不向 `agent-core`、分身或其他模块注册。开关和工作要求是当前浏览器的助手偏好，不属于 API 预设或单次会话。新一轮读取已保存的设置，进行中的一轮不受修改影响。

主助手使用 `tool_choice: auto`；原生和 Tagged JSON 均通过 `deliver_response` 发送最终正文，包括酒馆自动改用 Tagged JSON 的单次重试。手动选择 Tagged JSON 时只增加最终交付工具，可携带自定义工作要求，不生成原生模式的两条准备记录。同批工具照常完成，不为普通文本额外发起纠正请求。仪表与压缩使用相同的本轮消息选项和工具定义；运行中更改交付设置从下一轮生效。Gemini 签名和 DeepSeek 思考内容的历史回放由各自适配器处理。

原生模式每轮开始时，从两组各十句的准备文案中独立抽取一句，正文随工具调用写入现有聊天记录。同轮续跑、重试、历史回放与会话重开使用已保存的正文；仪表估算与请求组装不重新抽取，不增加会话字段。

运行与阅读分开：开关控制主助手新一轮是否使用交付工具。正文取自调用参数，成功回执只记 `ok: true`。聊天视图按同批调用 ID 配对后显示 Markdown；失败回执和未执行的调用不作为回复。已交付的正文支持复制，当前轮还可重答；不直接编辑或单独删除工具回执，以保持工具调用与结果配对。

### 聊天过程展示

- 助手面向酒馆用户：运行时展示操作名称、有限目标及真实状态，不展示 Grep 命中内容、文件源码、工具参数或原始返回值。整轮结束后，将经过收成一条按需展开的入口，最终答复保持独立。
- `ui/tool-activity.js` 从原始 call/result 配对派生轻量展示；成功与失败以工具回执为准。当前工具的排队、审批与派发状态由 runtime 的内存记录提供，取消后区分未执行和结果未确认；重载后没有证据的结果不猜成成功。
- Grep 的已知超时显示搜索超时，当前运行内已派发的 Grep 取消显示已停止；写入工具的结果未确认语义不变。Grep 与管理员共用 `agent-core/runtime/ordered-concurrent-read.js`，固定三文件预读窗口、按输入顺序消费，退出时取消未用请求；不保存正文缓存，不改变范围、匹配及分页规则。读取失败保留路径和原因，不报告完整搜索或完整总数。
- `ui/tool-process.js` 按项更新已挂载记录，折叠后卸载经过正文；原始工具证据仍属于会话与模型上下文，不因 UI 简化而删除。运行结束才自动收起，用户再次展开后普通刷新不改变其选择。
- 模型流式内容和工具活动只刷新对话、审批与运行状态，不触发工作区、附件或设置的整页刷新。输入区保持横向同排，单行控件共用高度，多行输入有界增长。
- 展示缓存、展开状态与工具执行阶段只活在当前页面内存，不新增持久化实体或会话格式。删除该展示时同时移除 UI 模块与 chat/runtime 接线即可，无额外数据清理。

### 4. Session And Persistence

Files:

- `app-src/state/session-store.js`
- `app-src/state/session-db.js`
- `shared/session-db.js`
- `app-src/workspace/workspace-store.js`
- `shared/workspace-state.js`
- `shared/workspace-repository.js`
- `shared/workspace-preconditions.js`
- `shared/migrations/workspace-v3.js`

Responsibilities:

- 维护真实的 `assistantSessionId`
- session store 只恢复和保存消息、历史摘要及已归档的技能读取标识；workspace store 只调度工作区 UI 状态保存，不能提交文件快照
- 清空对话前完成待提交的编辑，随后在一个事务内删除旧消息、摘要及计划并切换 session；失败时不清掉页面内容、不报告成功
- 自动压缩历史只压上下文，不切 session

Current storage model:

- 使用同一个 Dexie 数据库：`LittleWhiteBox_Assistant`
- 表为：`sessions`、`messages`、`meta`、`plans`、`workspace`

消息、摘要和计划始终归当前助手 session，不使用固定共享会话。

工作区属于助手而非对话，`workspace` 只保存一份存档（文件正文、原始内容、目录及面板状态），刷新和清空聊天均保留。临时编辑队列仍只在当前页面内存中。既有工作区的文件/目录删除及清空入口负责删除内容；删除此功能时移除 workspace store 接线及 `workspace` 表即可。无新依赖。

`workspace-repository` 是数据库读写唯一入口：读取工作区、保存白名单界面字段、提交文件操作。界面保存只在事务内合并 UI 字段；宿主文件操作在同一读写事务内读取最新正文、检查路径基线、调用既有 mutation 规则并提交。提交完成后才通知 iframe 和返回成功，iframe 收到通知只更新显示。批量写入和补丁整体提交或整体失败。

跨窗口冲突以规范化后的真实文件内容、目标存在状态、必要父目录及目录操作的完整子树判断，不依赖页内版本号或短哈希。无关文件修改保留。手动编辑从第一次输入固定基线；模型从本轮观察到的工作区固定基线，仅自己的实际读取和成功修改推进对应路径，不随 UI 刷新推进。

本轮基线包含发起时已经输入、正在自动保存的草稿，使用同一文件规则投影，不等待无关保存，也不吸收本轮开始后的编辑。失败后的显式重试先确认同一次未确认写入，收到回执后才继续保存最新草稿，连续失败不能替换该写入依据。提交事务只接受与上次尝试的完整规范化写入结果一致的目标文件；已落盘的同一次写入只重建回执，不重复改正文或原始内容。父目录条件仍检查，真正的新内容或删除仍报冲突。冲突快照通过宿主内部回执提供给编辑器，不进入模型工具结果或聊天记录。

冲突、排队和保存失败只存在于页面内存：保留最新草稿并暂停该文件自动保存。用户可以明确放弃草稿，或基于刚展示的保存版本再次提交覆盖；文件已删除时必须明确重新创建。切换文件不丢稿，关闭助手和清空对话先排空待保存操作，未解决冲突或失败会阻止完成。此机制不提供实时协同、自动合并、版本历史或持久化草稿。

工作区下载统一读取当前显示内容：单文件、单个工作区根和下载全部均包含最新草稿，包括仅留在页面中的已删除文件草稿。下载不提交数据库、不清除草稿，也不将失败保存标记为成功。

普通聊天和只读工具不等待编辑保存；写入操作只等待涉及路径的草稿，单个文件的失败不阻塞其他文件。模型等待相关保存时仍可取消，取消不打断用户自己的保存。工作区正文存于本地 IndexedDB，项目源码及其他非工作区工具不依赖工作区数据库读取；不增加跨窗口锁、轮询或网络确认。

关闭期间停止模型（包括尚在准备的运行），保存编辑器草稿，并通过既有宿主请求通道等待已接收的文件操作退出队列，收到确认才移除 iframe。失败时留在原页面；界面状态上次保存失败时，显式清空/关闭会用最新界面状态重试一次，不自动循环重试。关闭等待只属于退出流程。

IndexedDB v3 升级时，将当前 v1/v2 会话中已存的工作区一次性搬入独立表，并移除该会话的旧字段；事务失败则完整回滚。不读取、不合并非当前会话。日常读写不再回退到旧会话，避免用户主动删除的文件被恢复。启动读取失败时停止加载，不发送空工作区给宿主。

### 5. Context Prefix Injection

Files:

- `app-src/context/current-context.js`
- `../agent-core/current-plans.js`
- `app-src/main.js`

Responsibilities:

- `current-context.js` 负责把工作区焦点、记忆区文件焦点、外部编辑器选区转成 `[Current context]`
- `agent-core/current-plans.js` 负责把当前 session 未完成计划转成 `[Current plans]`
- `main.js` 在真正发起模型请求前组装这些前缀

这些内容是临时注入的 prompt context，不是聊天消息本身。

### 6. Tool And Execution Plane

Files:

- `app-src/runtime.js`
- `app-src/tooling.js`
- `app-src/runtime/approvals.js`
- `app-src/runtime/context-stats.js`
- `app-src/runtime/history-compaction.js`
- `app-src/runtime/host-tool-requests.js`
- `app-src/runtime/streaming-messages.js`
- `../agent-core/runtime/delegate-runner.js`

Responsibilities:

- `runtime.js` 负责主模型循环、tool calling、审批、context budget、历史压缩、streaming 消息维护
- `tooling.js` 负责工具 schema、调用摘要、结果展示摘要
- `agent-core/runtime/delegate-runner.js` 负责 `DelegateRun` 的子任务执行，不走 host 普通工具通道

Important runtime rules:

- 上下文仪表和每轮请求前的压缩判断共用 Agent Core 本地估算器，计入送模消息、工具定义和会回放的 provider payload；不请求宿主 tokenizer。先计入必留的系统提示、工具和最新用户输入（含本轮附加上下文），必留部分超限时不发摘要请求。最新用户消息之前全部归入摘要；只在这条消息之后，从末尾按完整调用批次向前保留原文，最多占可用输入预算的 15%，空间紧张时优先给摘要留位。只有压后整包更小且未超限才替换历史。无收益时保留原文，原包可发则同一运行继续；同一运行不为同一段原文重复购买无收益摘要。
- 压缩记录属于会话，最新成功记录是送模摘要的唯一来源。一次压缩横跨最新用户发言时先合并前史，再合入本轮；记录中保留边界处的前史摘要和已归档技能 ID，不复制工具原文。删除用户整轮或重答可在刷新后回到这个边界，丢弃本轮记录；单删最终回复则保留该轮工具和记忆。边界随记录一起保存、写入失败一起回滚、清空会话一起删除。消息携带其发生时的记录序号以恢复时间顺序；运行中状态只在内存。
- `Plan*` 只管理状态，不执行实际工作
- `DelegateRun` 是 runtime 内部能力，不是 host 侧普通工具
- 子任务默认复用当前模型配置、权限模式；工具按自己的技能读取记录启用，不继承主对话的已加载选择
- 子任务不继承整段主对话历史；需要的背景由主助手显式写进 `task/context/deliverable`
- 子任务不能再次 `DelegateRun`，也不能管理 `Plan*`

### Skill-activated tools

技能由所属功能声明 `tools`；助手的 `shared/skill-tools.js` 汇总内置目录、读取回执和工具筛选。工具定义只保留一份，多个技能引用同一个工具时取并集。

- 角色卡制作启用 CardFiles；前端卡排查启用 InspectPage、CardFiles；计划与分派启用四个 Plan 工具和 DelegateRun；技能管理启用 GenerateSkill、UpdateSkill、DeleteSkill。变量 3.0 技能也引用已有 CardFiles 依赖。
- ReadSkill 常驻；读取成功后，所列工具从后续请求开始可用。ReadLogs 常驻，独立服务主页面与插件日志排查。
- 活跃历史中，只有配对的 ReadSkill 成功内置技能回执参与选择；用户文本、自定义技能正文及摘要文字不能启用工具。失败读取不改变选择。
- 历史压缩删除原回执前，把这些回执对应的技能 ID 合入 session 的 `archivedSkillIds`。该检查点必须随 session 保存，否则重开后无法恢复已删除回执的选择；它不存工具定义或提示词。保存失败沿用会话保存错误反馈；清空对话时随 session 一起删除。删除此功能时移除注册、筛选和该会话字段，无独立表或后台状态。
- 当前工具由归档检查点与保留历史派生；重试删掉某轮时，该轮独有的读取不再生效。子任务从自己的短历史派生，不修改主对话选择。
- 工具集变化时重新发送完整历史及新工具表；工具集不变时保留供应商已有的连续工具轮机制。工具加载不替代执行权限和审批。

### 7. Plan Ledger

Files:

- `../agent-core/plan-ledger.js`
- `assistant.js`
- `../agent-core/current-plans.js`
- `app-src/state/session-store.js`

Responsibilities:

- 维护当前 session 的 `PlanCreate / PlanUpdate / PlanList / PlanGet`
- 统一处理 `status / priority / blockedBy / completedAt`
- 为 `[Current plans]` 注入提供稳定来源
- 跟随 session 生命周期：清空对话时一起切走

Current behavior rules:

- `blockedBy` 必须引用当前 session 中真实存在的计划
- 更新依赖时会拒绝环依赖
- `Plan*` 与 `DelegateRun` 是两套不同能力：前者做账本，后者做执行

### 8. Adapters

Files:

- `../agent-core/adapters/anthropic.js`
- `../agent-core/adapters/google.js`
- `../agent-core/adapters/openai-compatible.js`
- `../agent-core/adapters/openai-responses.js`
- `../agent-core/adapters/sillytavern-openai-compatible.js`
- `../agent-core/adapters/sillytavern-claude.js`
- `../agent-core/adapters/sillytavern-google.js`

Responsibilities:

- 把统一 runtime 请求翻译成直连 provider，或 SillyTavern 已配置的 OpenAI-compatible、Claude、Google 后端调用
- 保留 provider 原生 payload，供后续工具轮继续回放
- 在支持的 provider 上复用 session tool loop 语义

适配器是执行后端，不拥有 UI、session 或 plan 状态。

### 9. Workspace And Memory Surfaces

Files:

- `app-src/workspace/*`
- `app-src/memory/memory-files.js`
- `shared/local-workspace-kernel.js`
- `shared/local-sources-tool-runtime.js`
- `shared/workspace-protocol.js`

Responsibilities:

- 工作区树、viewer、diff、导入来源管理
- 记忆区文件标准化
- `local/` 工作区工具运行时与共享 mutation 规则

`shared/` 中的 workspace、local sources 与 session 实现由助手拥有；通用 Agent 原语由 Core 拥有，不能仅凭 shared 目录名认定可跨功能复用。

这些模块应该保持“工作区能力”定位，不反向依赖 host window 或模型适配器。

### 10. JS API Boundary

Files:

- `runtime-src/jsapi-runtime.js`
- `st-jsapi-manifest.json`
- `dist/jsapi-runtime.js`
- `assistant.js`

Responsibilities:

- `runtime-src/jsapi-runtime.js` owns the source for the browser-side JS API analysis and validation runtime.
- `st-jsapi-manifest.json` is the generated manifest consumed by the host bridge; `dist/jsapi-runtime.js` is its generated runtime artifact.
- `assistant.js` is the host-side owner that loads the manifest/runtime and routes JS API requests. The iframe only renders their observable results.

JS API remains assistant-specific. It must not move into `agent-core`, and it must not become a generic host-tool backdoor.

## Dependency Direction

Preferred direction:

- `agent-core/*` -> 无具体 App UI、无具体工具域的通用 Agent 能力；assistant/ebook 都可以依赖它
- `agent-core/tools/*` -> 无 `local/...` / `book/...` 认知的工具原语，例如 patch 和文本文件类型判断
- `assistant.js` -> 宿主桥接、窗口控制、host tool / storage / runtime 接线
- `main.js` -> iframe app 装配、状态 wiring、前缀注入与渲染调度
- `runtime.js` -> tool loop 编排；细节下沉到 `runtime/*`
- `ui/*` / `workspace/*` -> 界面渲染和本地交互
- `shared/*` -> assistant 自己的规则、schema、持久化标准化、workspace kernel

Avoid:

- 其他 Agent App 直接 import `assistant/app-src/*`
- `agent-core` 反向依赖 `assistant`、`ebook`、DOM 或宿主窗口
- host 层直接拥有 iframe feature UI
- `main.js` 回退成“所有逻辑都在这里”
- 工具编排规则散落在 UI 层
- session / persistence 逻辑依赖 host DOM
- plan / delegate 语义各处各写一套
- 其他 Agent App 直接 import `assistant/shared/*` 来复用底层工具原语

## Safe Extension Rules

1. 新的持久化能力先定义 session 生命周期，再决定存储位置。
2. 新的通用 Agent 能力先判断是否属于 `agent-core`；如果两个 Agent App 都要用，不能挂在 `assistant/app-src` 下面。
3. 新的 prompt 前缀上下文，优先做成 `current-context.js` / `agent-core/current-plans.js` 这种独立 builder，不要在 runtime 里到处拼字符串。
4. 新的编排能力先判断它属于：
   - 状态账本：类似 `Plan*`
   - 同步执行：类似 `DelegateRun`
   - host 普通工具
5. 如果改动了 tool loop 语义，要一起补 相关 provider tests。
