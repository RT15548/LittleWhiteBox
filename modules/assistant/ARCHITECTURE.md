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

### 4. Session And Persistence

Files:

- `app-src/state/session-store.js`
- `app-src/state/session-db.js`
- `shared/session-db.js`

Responsibilities:

- 维护真实的 `assistantSessionId`
- 恢复和保存消息、历史摘要、workspace UI 状态
- 清空对话时切换到新 session，并清掉旧 session 的计划账本
- 自动压缩历史只压上下文，不切 session

Current storage model:

- 使用同一个 Dexie 数据库：`LittleWhiteBox_Assistant`
- 表为：`sessions`、`messages`、`meta`、`plans`

消息、摘要和计划始终归当前助手 session，不使用固定共享会话。

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

- `Plan*` 只管理状态，不执行实际工作
- `DelegateRun` 是 runtime 内部能力，不是 host 侧普通工具
- 子任务默认复用当前模型配置、权限模式和工具能力
- 子任务不继承整段主对话历史；需要的背景由主助手显式写进 `task/context/deliverable`
- 子任务不能再次 `DelegateRun`，也不能管理 `Plan*`

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
5. 如果改动了 tool loop 语义，要一起补 `tooling.test.js`、`delegate-runner.test.js` 和相关 provider tests。
