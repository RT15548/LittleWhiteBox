# 后端 Draw Run（第二刀）方案定稿

状态：第 1～11 步代码完成；`draw-runs-v1` capability 与三家 Provider 生产入口已经开放。自动化契约验证通过后，仍需在真实 SillyTavern 中完成人工写盘/读回、关闭浏览器接回与三家 Provider 实盘验收。
前置：第一刀已封板于 `95526dd feat(draw): add provider-neutral backend image jobs`。
权威文档关系：本文件是第二刀的开工单与终态契约；第一刀契约见 `docs/image-backend-batch-jobs.md`，第二刀不修改第一刀的进程内存边界。

## 0. 目标与产品承诺

把 Scene Planner（LLM 场景规划 + Tool 纠错 + 图片请求编译）交给后端。用户看到"后台已接管"后，切屏、冻结、刷新、关闭浏览器都不影响 LLM 规划和整批生图。

产品承诺：

- 点击后先显示"正在提交"。
- 收到 202 后确认后台已经接管，此后即可关闭页面。
- 接管后的画图胶囊不固定占用整句"后台已接管"，而是持续显示排队、分析、准备、生成张数、等待、重连或接回等真实阶段；接管确认通知仍明确告知用户可以离开页面。
- 图片 Provider 仍是现有的单值设置；任一时刻只有当前 Provider 的一套面板与提交入口，不引入多 Provider 同时点击或并发执行。
- 同一 owner 的图片任务继续由第一刀严格串行执行；第二刀只把 Planner 前移到后端，不放宽 NovelAI、SD WebUI 或 ComfyUI 的执行并发。

明确不承诺：

- 点击后同一瞬间杀浏览器、请求尚未发出的场景（不用 Service Worker / Beacon 弥补）。
- SillyTavern Node 进程重启后的任务存活（沿用第一刀内存边界）。
- 超过后端 TTL 的无限期离线。
- 跨设备同时打开同一账号的分布式强一致。

## 1. 终态结构

```text
浏览器快速预处理
  ├─ 冻结正文、Scene Source、角色、世界书、Prompt（宏展开在浏览器侧完成）
  ├─ 冻结 Agent 配置与图片 generationRecipe
  ├─ 在目标 swipe extra 保存 runId marker（唯一 accessor + confirmable save）
  └─ POST /v1/draw-runs
              ↓ 202：后台已接管
后端 DrawRunManager
  ├─ 调用 Agent Core（Node entry，per-run Host Client）
  ├─ Tool 纠错与计划校验（与浏览器同一份 Planner）
  ├─ Provider 纯编译器生成最终图片请求
  └─ 创建第一刀 Image Job（childJobId = 从 runId 确定性派生的 requestId）
              ↓
浏览器恢复协调器
  ├─ 按 runId marker 找回原 message/swipe
  ├─ 校验 sourceHash
  ├─ 插入图片 slots（或 gallery-only）
  ├─ adoptExistingJobFromDrawRun 接管 child Image Job
  └─ 复用第一刀的画廊、ACK、结算
```

Agent 渠道分两类传输：

- 非酒馆渠道（`openai-compatible` / `openai-responses` / `anthropic` / `google`）：Node Agent Core 直接请求供应商。浏览器提交当前预设快照（模型、Base URL、API Key、Reasoning、Tool 模式等），只存在 Draw Run 内存，Planner 结束立即清除。
- 酒馆渠道（`sillytavern-openai-compatible` / `sillytavern-claude` / `sillytavern-google`）：继续请求酒馆 `/api/backends/chat-completions/generate`，每个 run 使用独立 Cookie/CSRF Host Client，通过本机回环。Cookie、CSRF 与 SillyTavern Basic Auth 来自当前请求；用户预设中的 `apiKey` 是反代 `proxy_password`，必须随 run 临时传递，不能和回环凭证混为一类。

## 2. 开工前八项

| 项目 | 定义 |
|---|---|
| 功能所有者 | 后端 `DrawRunManager`；浏览器只有提交与恢复协调器 |
| 唯一事实来源 | Planner 状态归 Draw Run；图片执行归 Image Job；交付归现有 pending image journal |
| 临时态 | 请求正文、Agent 凭证、图片密钥、LLM transcript、编译 recipe 全在后端内存 |
| 持久态 | 只在目标 swipe extra 保存最小 run handle；Planner 后沿用第一刀 IndexedDB journal |
| 外部依赖 | Agent Core、酒馆三条 Chat Completion 渠道、直接模型 API、三家图片服务、聊天保存接口 |
| 注册入口 | 后端新增 `draw-runs-v1` capability；前端只注册一个共享恢复运行时 |
| 删除路径 | 删 draw-runs 后端目录、前端协调器、capability，清理 `extra.xbDrawRuns`；图片 compiler 继续供普通链路使用 |
| 兼容对象 | 当前 SillyTavern、浏览器/WebView、现行 Agent Provider 和三家图片协议；不兼容测试线旧 Draw Run 草稿与旧 journal schema |

## 3. Draw Run 领域模型

状态机：

```text
queued → planning → compiling → dispatched
   └──────────────→ failed
child 创建前的任意非终态 → cancelling → cancelled（无 manifest）
dispatched + child 已消失且未接管 → child_expired（保留 RUN_ERROR_RETENTION_MS 后回收）
```

`dispatched` 表示 Planner 已结束、child Image Job 已创建。图片是否生成完由第一刀 Image Job 状态决定。

取消语义按 child 是否已创建分裂，不允许合并：

- child 创建前取消：终态 `cancelled`，无 manifest。
- child 创建后取消：Draw Run 保持 `dispatched`，记录 `cancelRequestedAt`，manifest 原样保留；取消转发给第一刀 Image Job。浏览器仍需 adoption，以收取已 ready 的结果并完成取消结算。禁止转成普通 `cancelled` 并清掉 manifest。

**生命周期跟随 child，不是独立计时**：

```text
child 仍存在 → Draw Run 不得回收
child 消失且尚未接管 → 标记 child_expired，保留 RUN_ERROR_RETENTION_MS
客户端完成 adoption → 主动 ACK 删除 Draw Run
```

（第一刀 child 终态后 retention 为 1 小时，`job-manager.js` `DEFAULT_RETENTION_MS`；Draw Run 通过订阅/查询 child 存活状态联动，禁止写死"两个数字相同"。）

Draw Run 保存：

```js
{
  id, owner, state, sourceHash, provider,
  progress: { stage, attempt, maxAttempts },
  childJobId,
  handoffManifest,
  createdAt, updatedAt, error
}
```

`handoffManifest` 只包含接回需要的事实：

```js
{
  childJobId, provider, sourceHash, placementContract: 1,
  items: [{ index, slotId, imgId, insertOffset, displayMetadata }]
}
```

`insertOffset` 是相对剥除既有图片槽位后的冻结正文字符串（即 `sourceHash` 所哈希的那份 UTF-16 串）的 UTF-16 code unit 偏移。`sourceHash` 负责恢复期正文事实；marker 里的 `targetHash` 另行哈希点击瞬间的完整 swipe，负责首次写入占位符前的严格 CAS。二者任一不匹配都转 gallery-only，不做任何模糊重定位。`placementContract` 版本固定，偏移语义变更必须升版本。

不返回、不记录到诊断接口：Cookie、CSRF token、Basic Auth、Agent API Key、图片 API Key、原始请求头、完整 LLM transcript、原始图片 payload。错误对象统一脱敏（供应商响应文本可能含密钥回显）。

凭证生命周期：

1. 创建 Draw Run 时从当前请求捕获 Cookie、CSRF、必要的 Authorization；酒馆渠道同时接收当前预设的反代 `proxy_password`。
2. 每个 run 创建独立 Host Client；服务端缺少实例 client 时直接拒绝，禁止回退全局单例。
3. Planner 结束立即销毁 Agent 凭证与 transcript。
4. child Image Job 创建后，清除 generationRecipe 和图片密钥副本。
5. 失败、取消同样立即清除。

第 4 条只清除 Draw Run 自己的副本；转交给 child Image Job 的图片凭证由 child 持有到任务终态后释放，不写入浏览器 journal 或聊天文件。

## 4. 后端 API

基础路径：`/api/plugins/littlewhitebox-image-jobs/v1/draw-runs`

| 方法 | 路径 | 用途 |
|---|---|---|
| POST | `/draw-runs` | 按 owner + runId 幂等创建 |
| GET | `/draw-runs` | 列出当前 owner 的任务 |
| GET | `/draw-runs/:runId` | 查询阶段、诊断、handoff manifest |
| POST | `/draw-runs/:runId/cancel` | 显式取消 |
| DELETE | `/draw-runs/:runId` | 浏览器完成接管后的 ACK |

约束：

- owner 只取 `req.user.profile.handle`，body 不允许指定 owner。
- 同一 owner + runId + 相同签名返回原任务；相同 runId、不同请求 409。
- 编译所有图片成功后，才能一次性创建 child Image Job。
- childJobId 从 runId 确定性派生。第一刀创建接口已满足幂等（`requestId` 即 jobId，同签名重放返回原任务、异签名 409，`job-manager.js:87-95`），重试不重复扣费。
- child 创建必须经过与第一刀 HTTP 路由同一个 normalize/validate service（从 `routes.js` 提取共享服务，路由与 DrawRunManager 都走它），禁止绕过校验直接调用 manager。
- 浏览器创建 Draw Run、提交响应丢失后的确定性查询，以及后续 list/get/cancel/ACK 请求均有 15 秒单请求上限；超时只进入不确定/重试语义，不得把未知结果当成任务不存在。
- Planner 前取消：中止 LLM，不创建图片任务。
- Planner 与 child 创建竞态必须串行化。
- child 已创建后取消：转发给第一刀 Image Job，保留已 ready 的结果（Draw Run 状态语义见第 3 节）。

资源常量（定死，禁止施工时临时猜）：

| 常量 | 值 | 说明 |
|---|---|---|
| `MAX_DRAW_RUNS_GLOBAL` | 50 | 全局未回收 run 上限 |
| `MAX_DRAW_RUNS_PER_OWNER` | 8 | 单 owner 上限（含排队与 dispatched 未 ACK） |
| `MAX_CONCURRENT_PLANNERS_PER_OWNER` | 1 | 单 owner 同时运行的 Planner |
| `MAX_CONCURRENT_PLANNERS_GLOBAL` | 4 | 全局同时运行的 Planner |
| `MAX_ENVELOPE_BYTES` | 2 MiB | 单个 envelope 序列化字节上限 |
| `MAX_TOTAL_ENVELOPE_BYTES` | 32 MiB | 全部未完成 run 的 envelope 常驻内存上限 |
| `SUBMISSION_UNCERTAINTY_WINDOW_MS` | 120 000 | marker 落盘后至可判定"未提交"的等待窗口（与第一刀 `PENDING_JOB_LEASE_MS` 对齐） |
| `RUN_ERROR_RETENTION_MS` | 3 600 000 | `failed` / `cancelled` / `child_expired` 的展示保留期（与第一刀 child retention 对齐） |
| `CHILD_SWEEP_INTERVAL_MS` | 30 000 | Draw Run 主动查询 child 是否仍存在；timer 使用 `unref`，插件退出时清理 |

（与第一刀 `MAX_JOBS_PER_OWNER=20` 相互独立。）

并发边界（Planner 与生图分属两层，不许混淆）：

- 上表并发常量只作用于 Planner——LLM 调用，不碰 NovelAI / SD / Comfy。
- 生图并发归第一刀调度器所有，**单 owner 严格串行**：per-owner scheduler 单活动槽 + 批间随机 cooldown（`job-manager.js` `scheduler.active`，已核实为既有行为）。封号风险与显卡负载都在这一层。
- 第二刀不得新增任何生图并发路径；Draw Run `dispatched` 后的全部流量语义由第一刀决定。
- 既有事实：`MAX_CONCURRENT_ITEMS = 4` 是跨 owner 的全局上限，单 owner 仍串行；第二刀不改变它。

Envelope 限额与脱敏：

- 校验 `Content-Length`（存在时）并对序列化后的 envelope 再计字节，超限 413。事实边界：该检查发生在酒馆全局 JSON parser 之后，只能限制业务接收，不能宣称防止超大请求进入内存（入口内存上限由酒馆 body parser 的全局 limit 决定）。
- 禁止日志打印 request body。
- 错误对象统一脱敏。
- Planner 结束立即释放正文、世界书和 Agent 密钥。

## 5. 回环传输与探针

**回环协议不取 `req.protocol`**（反代 HTTPS 下 `req.protocol` 可能是 `https`，实际本地 socket 是 HTTP）。依据创建请求的真实监听 socket 构造本地传输：

```js
req.socket.encrypted        // 决定 http/https
req.socket.server.address() // 唯一可信的监听地址与端口
```

监听地址为 `0.0.0.0` / `::` 时分别收窄到 `127.0.0.1` / `::1`；明确绑定地址必须原样使用。禁止仅按地址族强制改写为回环地址，否则同端口的其他本机进程可能收到 Cookie、CSRF 与 Basic Auth。监听地址不可用时在组装或发送凭证前失败。

事实边界：

- 回环会绕过 Authelia 等外部反代鉴权（预期行为）；SillyTavern 内置 Basic Auth 仍会经过，必须转发。
- Session cookie 在 Planner 运行中过期必须干净失败为 `failed: 身份过期`。
- `127.0.0.1`、IPv6、原生 HTTPS、自签证书都必须由探针实测，不做假定。

**探针是产品诊断能力，不是临时代码**。独立诊断端点，验证：

- 外层用户 owner。
- 内层回环 owner 与外层一致。
- Cookie session、CSRF、内置 Basic Auth。
- HTTP / 原生 HTTPS（含自签）。
- 多用户并发不串身份。

诊断端点为 `POST /api/plugins/littlewhitebox-image-jobs/v1/draw-runs/probe`。它只返回回环协议、地址族与各凭证是否通过验证，不回显 Cookie、CSRF token 或 Basic Auth 内容。内层校验路由要求当前进程生成的一次性 challenge，不能作为公开身份查询接口使用。

探针不调用 LLM、不产生费用。探针通过部署矩阵之前，不开写 DrawRunManager。后续设置页的"后台 Agent 连接测试"直接复用它。

部署矩阵由 `server-plugin/littlewhitebox-image-jobs/tests/loopback-deployment-matrix.js` 从源码建立隔离运行副本并启动真实 SillyTavern 1.18.0 进程，不以 Express mock 代替，也不加载现用 server plugin 或数据。已验证 HTTP/IPv4 双用户会话并发探针与 Cookie/CSRF、原生自签 HTTPS/IPv4 + Basic Auth、HTTP/IPv6、HTTPS 终止反代到 HTTP SillyTavern + Basic Auth，以及明确绑定 `127.0.0.2` 时同端口 `127.0.0.1` 诱饵服务收到零请求。`req.protocol` 与 socket 元数据冲突时仍以后者为准，由探针单测独立覆盖。

## 6. Agent 渠道

调研事实（已核实）：

- 7 个 adapter 注册于 `modules/agent-core/provider-config.js:13-35`；agent-core 核心与全部 adapter 零浏览器依赖（仅同构 SDK openai / @anthropic-ai/sdk / @google/genai + 内部纯模块），唯一浏览器耦合在 `agent-core/ui/`，核心路径不经过。Node entry 可直接 import 源码，不走 `dist/agent-core-browser.js`。
- 全局单例 header provider 在 `shared/host-llm/chat-completions/client.js:14`，浏览器侧有 5 个模块设置它（draw、assistant、ebook、fourth-wall、ena-planner）。

Host Client 收窄方案（不碰 assistant / ebook / fourth-wall / ENA）：

- 保留浏览器默认 Host Client 和现有 setter。
- `createAgentAdapter()` 增加可选 `hostClient` 注入。
- 三个酒馆 adapter 默认使用浏览器 client。
- Node Draw Run 强制传入 per-run client；服务端缺实例 client 直接拒绝，不回退全局单例。

Node 发布边界：

- `modules/agent-core/node-entry.js` 是后端唯一入口；酒馆三渠道在入口层强制要求实例 Host Client，不导出浏览器全局 setter。
- `npm run build:agent-core:node` 用 esbuild 生成 `server-plugin/littlewhitebox-image-jobs/draw-runs/vendor/agent-core-node.cjs`，把 Agent Core、三个 SDK 及其实际依赖打成 CommonJS 单文件；产物只允许引用 Node 内置模块。
- 同一构建根据 esbuild metafile 生成 `draw-runs/vendor/THIRD_PARTY_LICENSES.txt`，逐项记录实际入包依赖的精确版本、许可证声明及上游随包附带的 LICENSE/NOTICE/COPYING 正文；未附带这些文件时回退提取 README 的 License 段，仍无正文则构建失败。
- `npm run check:agent-core:node` 先核对实际入包依赖与 `package-lock.json` 的锁定版本，再无写入重建并逐字节比对 bundle 与许可证清单，防止提交陈旧产物；正式构建在同目录 staging，并以整个 `vendor` 目录为发布单元切换，失败时恢复上一份完整产物。
- 运行时不安装 npm 依赖；bundle 编译目标与 server plugin 最低版本均为 Node.js 18。`npm run check:agent-core:node18` 固定在 Node.js 18.20.8 隔离加载 bundle、创建七类 Adapter，并通过本机模拟端点验证 Google SDK 的实际 `generateContent` 请求路径；虽然当前 `@google/genai` 声明 Node.js 20，锁定并打包的现用路径已验证支持 Node.js 18，后续 SDK 升级由该检查拦截。

不能改写：Tool 格式、Reasoning 处理、Claude/Google 原生回放结构、tagged JSON 兼容、Scene Planner 纠错循环、模型家族判断。

非酒馆渠道的后台语义必须在 UI 明示：Base URL 由 SillyTavern 服务器发起访问，必须对服务器可达；`127.0.0.1` 的含义从"用户机器"变为"服务器本机"。连不上就是 run `failed`，不得静默回退浏览器执行。

## 7. Scene Planner prepare/execute 拆分

调研事实（已核实）：`scene-planner.js` 输入已是数据入参；4 处浏览器 fallback（宏展开 runtime、`worldInfoResolver`、`dependencies.getAgentSettings`、`dependencies.requestHeadersProvider` / `loadAgentCore`）注入口全部已存在。宏展开（`substituteParams`、chat 历史）是唯一必须在浏览器侧先算好的数据。

浏览器预处理 `prepareScenePlannerInput()`：Scene Source、插图点、宏展开、世界书、角色资料、Prompt 模板、当前 Agent providerConfig、Tool 校验上下文、sourceHash。输出可序列化的 Planner 部分；第 8 步的协调器只负责在外层补齐 run 与图片生成字段，不能再次解释 Prompt。

后台执行 `executePreparedScenePlanner()`：创建唯一 `submit_scene_plan` Tool、调用 Agent、Tool 回放、最多三次纠错、重复错误提前终止、契约校验、输出规范 Scene Plan。

`ScenePlannerEnvelopeV1` 正式结构（可序列化，无函数、无 DOM 引用）：

```js
{
  version: 1,
  runId,                       // 幂等键；slotId/imgId 由 runId + index 确定性派生，两端同一派生函数
  sourceHash,                  // 冻结正文字符串的哈希（placement contract 见第 3 节）
  imageProvider,               // 'novelai' | 'sd-webui' | 'comfyui'
  planner: {
    prompt: { systemPrompt, messages }, // 宏、世界书与模板已在浏览器展开完毕
    validationContext: {
      sceneSource, effectiveMaxImages, maxPlanImages,
      effectiveMaxCharactersPerImage, centerMode
    },
    presentCharacters
  },
  agent: {
    channel,                   // 7 渠道之一
    providerConfig             // 直接渠道含供应商密钥；酒馆渠道可含反代 proxy_password
  },
  generationRecipe             // provider recipe 快照（含自定义 Comfy workflow）
}
```

`planner` 中不携带 Tool schema。`executePreparedScenePlanner()` 必须根据冻结的 `validationContext` 在执行端重建唯一的 `submit_scene_plan` Tool，服务端不信任浏览器提交的 Tool 契约。

服务端验证边界：

- JSON 形状与类型校验，未知字段拒绝。
- `imageProvider` / `agent.channel` 白名单。
- `effectiveMaxImages = 0` 保留用户“不指定精确张数”的语义；`maxPlanImages` 是本次执行容量且 ≤ 第一刀单 job items 上限（20）。显式设置超过容量时在写 marker、调用 Planner 前拒绝。
- `planner.prompt` 只接受预处理后的 system prompt 与单条 user message；原始世界书、Prompt 模板或宏运行时对象不得进入 envelope。
- `generationRecipe` 交给对应 provider 的 recipe validator。
- 酒馆渠道只允许携带用户预设中的反代 `proxy_password`（沿用 `providerConfig.apiKey` 字段）；Cookie、CSRF 与 Basic Auth 不进入 envelope，由当前请求捕获。

浏览器普通模式改为组合这两个函数——前后端运行同一份 Planner，不产生两套协议。

## 8. 图片 Provider 编译器

提取纯编译器，浏览器与 Node 共用同一份模块：

```text
providers/novelai/compiler
providers/sd-webui/compiler
providers/comfyui/compiler
```

统一签名 `compile(scenePlan, generationRecipe)` → `{ provider, context, delay, items, artifacts }`。`items` 严格就是可原样交给 Image Job 的 `{ request, timeout }[]`；`artifacts` 保存按同一索引对齐的场景计划与画廊展示元数据，不进入 Image Job 协议。

- NovelAI compiler：V4.5/V5 请求体、角色坐标、负向和模型参数。
- SD compiler：prompt、override settings 和请求参数。
- Comfy compiler：workflow 注入、节点替换和结果节点选择；自定义 workflow 作为 recipe 快照传入，后端不重读 UI。
- 角色 Prompt 拼装提成纯模块，两端共用。
- 三家现有浏览器链路必须改用这些 compiler，以实际运行证明它们不是后端副本。

Provider registry 只做 `provider → recipe validator → compiler → Image Job adapter`，不写巨大 switch。

## 9. marker 与提交顺序

### Swipe extra 唯一 accessor

事实（已核实）：活动 swipe 的工作副本是 `message.extra`；`syncMesToSwipe()`（`script.js:6837`）将其 `structuredClone` 到 `swipe_info[swipe_id].extra`（`:6880`），且在无 swipe 结构时直接 `return false`。

契约：

- 封装唯一 accessor，禁止业务代码分别手写两份 marker。
- 活动 swipe：修改 `message.extra`，再调用 `syncMesToSwipe()`。
- 非活动 swipe：修改对应 `swipe_info[i].extra`。
- 从未 swipe 过的消息（无 swipe 结构）：只有 `message.extra` 一份。
- 扫描时按 swipe 读取并按 runId 去重。

### Confirmable save（读回验证，前置验证项）

事实（已核实）：`ctx.saveChat` 即 `saveChatConditional`（`st-context.js:154`），它吞异常且等锁超时时静默返回不保存（`script.js:9352-9358`）；`isChatSaving` 锁不对插件暴露，直接调用 `saveChat()` 无法与宿主保存队列正确协调。

契约：确认边界不建立在调用返回上，而建立在读回验证上。首次提交以当前页面的活聊天为事实：

```text
严格确认点击时的聊天 / 楼层 / swipe / 正文仍未变化
→ 在内存中写入 marker，并按 chatId 获取同源 Web Lock
→ saveChatConditional() 等待宿主锁并尝试保存
→ 从点击时冻结的聊天身份重新读取服务端文件
→ 验证目标 marker 确实存在，才 POST Draw Run
```

- 首次提交不再要求“内存整份聊天 === 持久化整份聊天”。ST 的防抖保存、本页未落盘字段、其他扩展的合法内存修改都不应阻塞一次正常点击。
- SillyTavern 的 `integrity` 是文件身份标识，不是每次保存递增的版本号；同一聊天双标签同时编辑仍属于 ST 原生的整聊覆盖边界。首次 marker 保存不自建另一套聊天版本系统；但无论宿主保存返回何种结果，读回没有 marker 都绝不 POST Draw Run。
- adoption、取消与 marker 清理的写前条件只核对目标 run 的 marker 和冻结 swipe 正文；同一目标被编辑时不保存，无关楼层或运行时字段的合法差异不再阻断任务交接。SillyTavern 仍以整份聊天保存，因此不同标签页同时编辑不同楼层沿用宿主自身的最后写入覆盖边界，不在画图状态机内伪造聊天版本系统。
- 同一页面内另有一层非持久化 mutation queue，把“修改共享 `ctx.chat` → 保存并确认”整体串行，防止首次 marker 与取消/恢复互相覆盖。
- 读回失败或内容不符都属于"不确定"：不 POST、不回滚可能已成功的远端写入，保留 marker 等恢复清理。
- 封装冻结调用时的聊天身份：单人聊天读 `/api/chats/get`，群聊读 `/api/chats/group/get`；保存期间切换聊天不能改变读回目标。
- 保存等待和读回各有 15 秒上限。保存超时或抛错后仍继续读回：读回验证通过即确认，未通过才判定"不确定"；不取消仍可能完成的宿主保存。
- 该封装在施工顺序中作为独立前置验证证明（见第 12 节），通过后 marker 与 adoption 才能开工。
- Draw Run adoption 激活后的第一刀恢复结算仍按目标槽位做写前校验与读回验证；同一目标冲突时恢复内存槽位并让位。

### marker 内容与严格顺序

目标 swipe 只保存身份，不保存进度、正文、Prompt、密钥或计划：

```js
extra.xbDrawRuns[runId] = {
  version: 1,
  provider,
  sourceHash,
  targetHash,
  createdAt,
  // 自动模式才有
  automatic: true,
  // 用户请求取消后才有
  cancelRequestedAt,
}
```

```text
点击时冻结活动 swipe index 与完整正文
→ 查询第一刀 journal；当前 swipe 仍有活跃图片槽位时在进入 Planner 前拒绝第二批，gallery-only 或用户已删除的槽位不锁正文
→ 查询 capability 并完成全部 Planner 预处理
→ 生成 runId（slotId/imgId 由 runId + index 确定性派生）
→ 保存 marker 前再次核对仍是点击时的同一 swipe；重算剥槽正文的 sourceHash，并以冻结的完整 swipe targetHash 做严格 CAS（且楼层不在编辑中）
→ 写 swipe extra marker（唯一 accessor）
→ confirmable save：保存并读回验证 marker 在场
→ POST Draw Run
→ 收到 202 后确认后台接管；胶囊开始显示后端真实阶段
```

故障语义：

- marker 保存失败或读回不确定：绝不 POST。
- marker 存在、GET run 404：受 `SUBMISSION_UNCERTAINTY_WINDOW_MS` 约束——窗口内只能 WAIT（另一页面的 POST 可能尚未到达服务端，立即清 marker 会制造孤儿任务）；超窗仍 404 才判定"未提交 / Node 已重启"，清 marker 并提示。发起提交的活页面收到明确 4xx 时可立即清理。
- POST 已到、响应丢失：相同 runId 查询或重发，接回既有任务。
- Planner 失败：删除 marker，不往正文写失败卡。
- 自动模式不在预处理或 202 时提前写完成标记。只有 child handoff 已建立、marker 可以确认删除时，才在同一次 chat save 中把 `automatic: true` 原子转成该 Provider 现有的 `xb_*_auto_done`；明确拒绝、Planner 失败或 handoff 前取消均不写完成标记，可以再次触发。多标签页恢复以服务端读回的 `auto_done` 为准同步本页内存，不能由陈旧页面后续保存擦除。
- 切聊天：不取消，只停止当前页面监控。
- swipe 重排、消息前移：runId 随 swipe extra 移动，不依赖楼层下标。
- adoption journal 中的 `messageId` 只是写入时定位提示；恢复以确定性 `slotId` 扫描全部正文与非活动 swipe。删除更早楼层导致消息下标变化时，不得把仍存在的已付费图片槽位误判为丢失。

## 10. adoption 与 gallery-only journal 重整

### journal delivery 判别模型

不给旧 schema 加永久兼容默认值。测试线无历史包袱，直接重整为判别结构：

```js
originRunId,        // adoption journal 必带：marker 已删、ACK 响应丢失时凭它补 ACK
originRunAckReady,  // marker 已确认持久化删除后才为 true；图片结算不得越过此闸门 ACK
delivery: { mode: 'slots', chatId, messageId }
// 或
delivery: { mode: 'gallery' }
```

运行时只认当前结构；不留"字段缺失就当 slots"的旧语义。第一刀既有测试 fixture 同步迁移。

### `adopting` 状态与第一刀恢复器隔离

改造前事实（已核实）：第一刀 reattach 决策在租约过期后只要后端 job 存在就返回 `ATTACH`，不区分 journal 状态；journal 创建使用 `store.put()` 盲写。这两点在第一刀是安全的（slots 先于提交落盘、创建者唯一），但 adoption 场景下 child 由服务端创建、slots 尚未落盘、多标签页竞争创建，两点都不再成立——若刷新发生在 slots 落盘前，第一刀恢复器会开始收图并把不存在的 slot 当已删除目标幂等丢弃。

契约：

- journal 新增真实状态：`adopting/pending → adopting/placing → adopting/ready → active`。
- `adopting` 只能由 Draw Run 恢复器处理；第一刀 Image Job 恢复器必须忽略它（`planImageJobReattach` 对 `adopting` 不产生任何动作）。
- 写 slots 或判定 gallery-only 并经读回确认后只转 `adopting/ready`；marker 已确认从服务端聊天删除、`originRunAckReady` 已打开后，才转 `active`。
- `active/cancelling` 且带 `originRunId` 的记录本身即证明 marker 已从服务端删除。其他标签页若仍有本地陈旧 marker，只清内存，不得保存陈旧聊天快照。
- adoption journal 创建必须用 IndexedDB 原子 `add` / 单事务 CAS，禁止 `put` 盲写，两标签页只允许一个成功。
- `adopting/pending` 尚未写过正文；若后端 run 消失，默认受从 marker/journal `createdAt` 起算的 120 秒窗口保护。只有 Draw Run 提交请求仍不确定时留下的 run 遗言，才把这一窗口缩短为从遗言时间起 20 秒；adoption 页面留下的 `{jobId, leaseId}` 遗言只证明当前 adoption 租约持有者已经离开，允许新页面立即换租，不改变 missing-run 的判定窗口。超窗仍不存在时持 adoption 租约清除 marker、删除 journal，并明确提示用户重新画图。禁止把它留在无 manifest 可执行的永久恢复循环里。`placing/ready` 已有独立恢复事实，不依赖 run 仍然存在。

### adoptExistingJobFromDrawRun

第二刀唯一特许入口，不破坏第一刀普通任务的 `journal → slots → POST`。只接受：当前 owner 可见的 Draw Run、runId marker、后端返回的 childJobId 与 manifest、sourceHash 与 marker targetHash 双重校验。

接管顺序：

```text
原子创建 child job 本地 journal（adopting/pending，含 originRunId）
→ 校验目标 swipe 的 sourceHash 与完整文本 targetHash
→ 写正文前转 adopting/placing（刷新后若槽位不在持久化正文中，绝不复活，改走 gallery-only）
→ 写入真实图片 slots（或判定 gallery-only）
→ confirmable save：保存并读回验证
→ journal 转 adopting/ready
→ 持同一 adoption lease，读回确认目标正文未被其他标签页改写
→ 删除 draw-run marker 并保存；自动任务在同一次保存中写入现有 Provider auto_done
→ journal.originRunAckReady = true
→ 单事务转 active/cancelling 且释放 adoption lease
→ 交给第一刀 attachJob()；图片落库与正文结算成功后 ACK Draw Run
→ 删除 journal（ACK 响应丢失时凭 originRunId 重试，404 视为已完成）
```

marker 清理后，面板控制权改读同一条第一刀 journal，不另建 UI 状态：child 仍在排队/生成时继续显示实际阶段与张数并可取消；取消意图先原子写入 journal，再同时请求 Draw Run 与 child 取消，恢复器最终以 journal 的 `cancelling` 事实做 discard 结算。journal 删除后面板重新读取事实并回到空闲。

酒馆停止键 / Escape 只中止仍在浏览器调用栈里的前台生成，不取消已经由后端接管的 Draw Run。后台任务只能从对应楼层或悬浮画图胶囊显式取消，避免用户停止文本生成时误伤早前楼层已经付费的后台批。

刷新卡在任何一步都能继续；不允许出现"child job 已存在但本地无任何恢复依据"的窗口（marker 删除与 ACK 之间崩溃时，journal 即恢复依据）。

正文变了：不覆盖正文、不强插 slots，journal 转 `delivery.mode = 'gallery'`，图片继续收进画廊，提示"正文已变化，图片已保留在画廊"。gallery 模式的结算边界：全部图片落画廊（IndexedDB 写入成功）后才 ACK；不写 selection、不写失败卡、不改正文。

恢复调度：租约仍有效且没有精确页面遗言时等待租约到期；正在运行的 Draw Run 每 3 秒刷新一次阶段，marker 冲突、保存不确定等稳定阻塞固定 15 秒退避。阶段刷新复用恢复循环，因此不追求动画级频率，避免 Planner 运行期间持续高频扫描 IndexedDB 和后端任务列表。无论 slots 还是 gallery，adoption 的目标聊天一律取冻结的 `chatTarget.chatId`；目标聊天未激活时不设周期轮询 timer，只由 `CHAT_CHANGED`、网络恢复或页面重新可见事件唤醒。pending adoption 找不到后端 run 时，无 run 遗言仍从原 marker/journal 的 `createdAt` 起算 120 秒，不会在每次恢复时重新获得宽限；正常刷新/关闭在 Draw Run POST 仍不确定时留下 run 遗言，恢复器才精确调度到遗言后的 20 秒边界。adoption 的 job 遗言只提前换租，不缩短 missing-run 窗口。遗言由同步 localStorage 承载，只证明旧页面已经死亡；BFCache 不写，系统强杀或写入失败完整退回原租约与不确定窗口。

楼层正在编辑：延迟接管，不覆盖编辑器草稿。

## 11. 多标签页与 unclaimed run

- 同源多标签页沿用 IndexedDB lease；创建 child journal 时只允许一个标签页 CAS 成功接管。
- Draw Run 的首次 marker、取消、adoption 槽位和恢复结算写入都按聊天持有同源 Web Lock，同页共享内存修改另由 mutation queue 串行；两类锁都只活在运行期，不新增持久状态。首次 marker 以当前活聊天为事实并在保存后读回确认；取消、adoption 与 marker 清理在保存前精确比较目标 run 的 marker + swipe 正文，不能被同一目标的并发修改越过，也不因无关楼层差异永久卡住。第一刀槽位结算继续按其目标槽位快照执行；其他标签页已经推进同一目标正文时，陈旧恢复页只能让位。
- 后端存在且没有 marker/journal：不自动取消、不自动删除、不猜楼层，保持 `unclaimed`。已有 adoption journal 可按冻结的 chat target 跨聊天只读确认；无论 delivery 是 slots 还是 gallery，目标聊天未激活时都只等待，不能把“当前看不到 marker”误判成目标消失。回到目标聊天后再完成对应的占位符或 gallery 接回与 marker 清理。

## 12. 施工顺序

```text
95526dd 第一刀封板（已完成）
→ 1. Host Client 实例注入（已完成；收窄范围，见第 6 节）
→ 2. 本地回环探针通过真实 SillyTavern 部署矩阵（已完成；可复现脚本及覆盖项见第 5 节）
→ 3. confirmable save 读回验证封装并独立证明（实现与 mock 行为测试完成；真实 SillyTavern 写盘后读盘由人工验收，尚未标独立证明完成；见第 9 节；marker 与 adoption 的前置）
→ 4. Node bundle 管线（已完成；esbuild：Node entry + 三个 SDK + Agent Core → 提交进 server-plugin 的可复制产物；零运行时安装依赖；生成第三方许可证清单）
→ 5. Planner prepare/execute 拆分（已完成；浏览器行为不变）
→ 6. 三家纯 compiler 提取，浏览器链路切换（已完成；行为不变）
→ 7. DrawRunManager / 状态机 / API / per-run Host Client / Agent executor / compiler registry / child 创建（经共享 normalize/validate service）/ 敏感数据清理 / 生命周期与取消（已完成；该阶段未单独发布 capability）
→ 8. 前端提交与 marker（已完成共享 draw-run-coordinator：preflight、marker CAS、幂等提交、提交不确定窗口、"正在提交/后台已接管"状态事件；该阶段未单独注册三家生产入口）
→ 9. journal 重整：delivery 判别模型 + adopting 状态 + 原子创建 + originRunId（已完成；旧测试线 schema 在升级入口一次性删除）
→ 10. child adoption（已完成：marker 扫描、reconcile、adoptExistingJobFromDrawRun、source_changed → gallery、marker 清理与补 ACK、多标签页竞争、取消与 child_expired 收口）
→ 11. 注册三家 Provider 生产入口与对应 UI 状态，并开放 draw-runs-v1 capability（已完成；缺 capability 时明确要求更新后端，不悄悄退化）
```

施工期间阶段 1–8 用户行为保持不变：第 7～8 步只建立后端 API 与共享提交边界，当时未发布 capability、未注册 Provider 入口，避免前端进入一个能提交却不能 adoption 的半成品路径。现在第 9～10 步接回闭环与第 11 步生产入口已经一并完成并开放。

## 13. 最低必要测试

**不使用源码正则/import 字符串扫描类架构测试**。运行时可移植性由以下真实执行保护：

- 在无 DOM、无 `window`/`localStorage` 的 Node 进程中真实 import 并调用 compiler。
- server bundle 构建必须成功（构建即测试）。
- compiler 用公开输入输出单测保护协议。
- Node entry 集成测试实际执行七个 Adapter 的创建路径。

契约清单：

- marker 保存确认（含读回验证）发生在 POST 之前；读回不符判定不确定，不 POST、不回滚。
- marker 在提交不确定窗口内遇 404 只 WAIT，超窗才清理；活页面明确 4xx 立即清理。
- POST 响应丢失不会重复执行 Planner 或生图。
- Alice/Bob 并发时 Cookie、CSRF、Agent 配置不串线（探针矩阵 + 集成）。
- 酒馆 OpenAI/Claude/Google 的 Tool 与纠错回放和浏览器模式一致。
- Planner 失败不产生正文 slot。
- child 创建恰好一次，且经过与 HTTP 路由同一个 normalize/validate service。
- child 已创建后刷新，可经 adoption 进入第一刀 journal。
- `adopting` journal 被第一刀恢复器忽略，只有 Draw Run 恢复器能推进它。
- adoption journal 并发创建只有一个标签页成功（原子 add/CAS）。
- child 创建后取消：Draw Run 保持 `dispatched` + manifest，adoption 仍能收取已 ready 结果。
- marker 已删、ACK 响应丢失后，凭 `originRunId` 补 ACK。
- sourceHash 或首次写占位符前的完整 swipe targetHash 变化时只进画廊；gallery 模式落库成功后才 ACK。
- adoption 已落盘后，用户只删除部分槽位时不复活被删槽位，其余仍存槽位继续接图；当前 swipe 的第一刀 journal 清理前不得启动会替换它的第二批。
- 消息移动、swipe 切换后仍能按 marker 找回（含活动/非活动/无 swipe 结构三形态）。
- 两标签页只能有一个接管者。
- 显式取消传播；关闭页面不传播取消。
- Node 重启按已知边界显示失效，而不是重新扣费。
- 三家 Provider 全部覆盖，不能只证明 NovelAI。

## 14. 关键跨边界风险

1. 酒馆 Agent 渠道的身份回环（第 5 节探针先行）。
2. Agent Core 浏览器/Node 双入口（调研已证实源码零改动可进 Node，风险收敛为打包与注入）。
3. 三家图片 payload 单一事实源（第 8 节 compiler + 浏览器链路实际运行验证）。
