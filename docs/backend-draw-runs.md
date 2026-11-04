# 后端 Draw Run 设计

Draw Run 将场景规划、工具纠错与图片请求编译交给后端。正式 v1 API 保留；新任务通过宿主 ABI 和执行包内容摘要选择随扩展更新的绘图业务。安装、签名、版本绑定与后台工具边界统一见[服务端说明](../server-plugin/littlewhitebox-server/README.md)。NovelAI V5 子任务归一为最终 PNG。

执行与进程内存边界见 [Image Job](./image-backend-batch-jobs.md)。发布验证须覆盖真实宿主保存／重新加载、关闭浏览器接回和三家 Provider 实盘，自动契约测试不覆盖这些外部行为。

## 0. 目标与产品承诺

把 Scene Planner（LLM 场景规划 + Tool 纠错 + 图片请求编译）交给后端。用户看到“提交后台”完成后，切屏、冻结、刷新、关闭浏览器都不影响 LLM 规划和整批生图。

产品承诺：

- 点击后先显示“提交后台”。
- 收到 202 后确认后台已经接管，此后即可关闭页面。
- 提交完成后的画图胶囊不固定占用整句“提交后台完成”，而是持续显示排队、分析、准备、生成张数、等待、重连或接回等真实阶段；提交完成通知仍明确告知用户可以离开页面。
- 图片 Provider 仍是现有的单值设置；任一时刻只有当前 Provider 的一套面板与提交入口，不引入多 Provider 同时点击或并发执行。
- 同一 owner 的图片任务继续由Image Job严格串行执行；Draw Run只把 Planner 前移到后端，不放宽 NovelAI、SD WebUI 或 ComfyUI 的执行并发。

明确不承诺：

- 点击后同一瞬间杀浏览器、请求尚未发出的场景（不用 Service Worker / Beacon 弥补）。
- SillyTavern Node 进程重启后的任务存活（沿用Image Job内存边界）。
- 超过后端 TTL 的无限期离线。
- 跨设备同时打开同一账号的分布式强一致。

## 1. 终态结构

```text
浏览器快速预处理
  ├─ 冻结正文、Scene Source、角色、世界书、Prompt（宏展开在浏览器侧完成）
  ├─ 冻结 Agent 配置与图片 generationRecipe
  ├─ 在原有 journal 写入恢复凭据，目标 swipe extra 标记 runId
  └─ POST /v1/draw-runs
              ↓ 202：提交后台完成
后端 DrawRunManager
  ├─ 调用 Agent Core（Node entry，per-run Host Client）
  ├─ Tool 纠错与计划校验（与浏览器同一份 Planner）
  ├─ Provider 纯编译器生成最终图片请求
  └─ 创建Image Job（childJobId = 从 runId 确定性派生的 requestId）
              ↓
浏览器恢复协调器
  ├─ 按 runId marker 找回原 message/swipe
  ├─ 校验 sourceHash
  ├─ 插入图片 slots（或 gallery-only）
  ├─ adoptExistingJobFromDrawRun 接管 child Image Job
  └─ 复用Image Job的画廊、ACK、结算
```

Agent 渠道分两类传输：

- 非酒馆渠道（`openai-compatible` / `openai-responses` / `anthropic` / `google`）：Node Agent Core 直接请求供应商。浏览器提交当前预设快照（模型、Base URL、API Key、Reasoning、Tool 模式等），只存在 Draw Run 内存，Planner 结束立即清除。
- 酒馆渠道（`sillytavern-openai-compatible` / `sillytavern-claude` / `sillytavern-google`）：继续请求酒馆 `/api/backends/chat-completions/generate`，每个 run 使用独立 Cookie/CSRF Host Client，通过本机回环。Cookie、CSRF 与 SillyTavern Basic Auth 来自当前请求；用户预设中的 `apiKey` 是反代 `proxy_password`，必须随 run 临时传递，不能和回环凭证混为一类。

## 2. 所有权与生命周期

| 项目 | 定义 |
|---|---|
| 功能所有者 | 后端 `DrawRunManager`；浏览器只有提交与恢复协调器 |
| 唯一事实来源 | Planner 状态归 Draw Run；图片执行归 Image Job；交付归现有 pending image journal |
| 临时态 | 请求正文、Agent 凭证、图片密钥、LLM transcript、编译 recipe 全在后端内存 |
| 持久态 | 提交前沿用 Image Job IndexedDB journal 保存最小恢复凭据；聊天 marker 由宿主自动保存 |
| 外部依赖 | Agent Core、酒馆三条 Chat Completion 渠道、直接模型 API、三家图片服务、聊天保存接口 |
| 注册入口 | 稳定宿主声明 `runtimeHostAbi`；前端准备签名执行包后提交，恢复流程仍只有一个共享运行时 |
| 删除路径 | 删执行包内 Draw Run 业务、宿主 draw-runs 注册与前端协调器，一次清理 `extra.xbDrawRuns`；图片 compiler 继续供普通链路使用 |
| 兼容对象 | 当前 SillyTavern、浏览器/WebView、现行 Agent Provider 和三家图片协议；不兼容测试线旧 Draw Run 草稿与旧 journal schema |

## 3. Draw Run 领域模型

状态机：

```text
queued → planning → compiling → dispatched
   └──────────────→ failed
child 创建前的任意非终态 → cancelling → cancelled（无 manifest）
dispatched + child 已消失且未接管 → child_expired（保留 RUN_ERROR_RETENTION_MS 后回收）
```

`dispatched` 表示 Planner 已结束、child Image Job 已创建。图片是否生成完由Image Job 状态决定。

取消语义按 child 是否已创建分裂，不允许合并：

- child 创建前取消：终态 `cancelled`，无 manifest。
- child 创建后取消：Draw Run 保持 `dispatched`，记录 `cancelRequestedAt`，manifest 原样保留；取消转发给Image Job。浏览器仍需 adoption，以收取已 ready 的结果并完成取消结算。禁止转成普通 `cancelled` 并清掉 manifest。

**生命周期跟随 child，不是独立计时**：

```text
child 仍存在 → Draw Run 不得回收
child 消失且尚未接管 → 标记 child_expired，保留 RUN_ERROR_RETENTION_MS
客户端完成 adoption → 主动 ACK 删除 Draw Run
```

（Image Job child 终态后 retention 为 1 小时，`job-manager.js` `DEFAULT_RETENTION_MS`；Draw Run 通过订阅/查询 child 存活状态联动，禁止写死"两个数字相同"。）

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

基础路径：`/api/plugins/littlewhitebox-server/v1/draw-runs`

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
- childJobId 从 runId 确定性派生。Image Job创建接口已满足幂等（`requestId` 即 jobId，同签名重放返回原任务、异签名 409，`job-manager.js:87-95`），重试不重复扣费。
- child 创建必须经过与Image Job HTTP 路由同一个 normalize/validate service（从 `routes.js` 提取共享服务，路由与 DrawRunManager 都走它），禁止绕过校验直接调用 manager。
- 浏览器创建 Draw Run、提交响应丢失后的确定性查询，以及后续 list/get/cancel/ACK 请求均有 15 秒单请求上限；超时只进入不确定/重试语义，不得把未知结果当成任务不存在。
- Planner 前取消：中止 LLM，不创建图片任务。
- Planner 与 child 创建竞态必须串行化。
- child 已创建后取消：转发给Image Job，保留已 ready 的结果（Draw Run 状态语义见第 3 节）。

资源上限与保留时限：

| 常量 | 值 | 说明 |
|---|---|---|
| `MAX_DRAW_RUNS_GLOBAL` | 50 | 全局未回收 run 上限 |
| `MAX_DRAW_RUNS_PER_OWNER` | 8 | 单 owner 上限（含排队与 dispatched 未 ACK） |
| `MAX_CONCURRENT_PLANNERS_PER_OWNER` | 1 | 单 owner 同时运行的 Planner |
| `MAX_CONCURRENT_PLANNERS_GLOBAL` | 4 | 全局同时运行的 Planner |
| `MAX_ENVELOPE_BYTES` | 2 MiB | 单个 envelope 序列化字节上限 |
| `MAX_TOTAL_ENVELOPE_BYTES` | 32 MiB | 全部未完成 run 的 envelope 常驻内存上限 |
| `SUBMISSION_UNCERTAINTY_WINDOW_MS` | 120 000 | marker 落盘后至可判定"未提交"的等待窗口（与Image Job `PENDING_JOB_LEASE_MS` 对齐） |
| `RUN_ERROR_RETENTION_MS` | 3 600 000 | `failed` / `cancelled` / `child_expired` 的展示保留期（与Image Job child retention 对齐） |
| `CHILD_SWEEP_INTERVAL_MS` | 30 000 | Draw Run 主动查询 child 是否仍存在；timer 使用 `unref`，插件退出时清理 |

（与Image Job `MAX_JOBS_PER_OWNER=20` 相互独立。）

并发边界（Planner 与生图分属两层，不许混淆）：

- 上表并发常量只作用于 Planner——LLM 调用，不碰 NovelAI / SD / Comfy。
- 生图并发归Image Job调度器所有，**单 owner 严格串行**：per-owner scheduler 单活动槽 + 批间随机 cooldown（`job-manager.js` `scheduler.active`，已核实为既有行为）。封号风险与显卡负载都在这一层。
- Draw Run不得新增任何生图并发路径；Draw Run `dispatched` 后的全部流量语义由Image Job决定。
- 既有事实：`MAX_CONCURRENT_ITEMS = 4` 是跨 owner 的全局上限，单 owner 仍串行；Draw Run不改变它。

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

监听地址为 `0.0.0.0` / `::` 时分别收窄到 `127.0.0.1` / `::1`；明确绑定地址必须原样使用。禁止仅按地址族强制改写为回环地址，否则同端口的其他本机进程可能收到 Cookie、CSRF 与 Basic Auth。监听地址不可用时在组装或发送凭证前失败。Host Client 与探针都显式直连该监听 socket，不继承 Node 全局 agent 的环境代理；开发者无需为回环测试修改 `NO_PROXY`。

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

诊断端点为 `POST /api/plugins/littlewhitebox-server/v1/draw-runs/probe`。它只返回回环协议、地址族与各凭证是否通过验证，不回显 Cookie、CSRF token 或 Basic Auth 内容。传输失败保留安全格式的底层错误码 `details.transportCode`，不回传可能含凭证的原始错误消息。内层校验路由要求当前进程生成的一次性 challenge，不能作为公开身份查询接口使用。

探针不调用 LLM、不产生费用；设置页的“后台 Agent 连接测试”复用同一诊断端点。

部署矩阵由 `server-plugin/littlewhitebox-server/tests/loopback-deployment-matrix.js` 从源码建立隔离运行副本并启动真实 SillyTavern 1.18.0 进程，不以 Express mock 代替，也不加载现用 server plugin 或数据。已验证 HTTP/IPv4 双用户会话并发探针与 Cookie/CSRF、原生自签 HTTPS/IPv4 + Basic Auth、HTTP/IPv6、HTTPS 终止反代到 HTTP SillyTavern + Basic Auth，以及明确绑定 `127.0.0.2` 时同端口 `127.0.0.1` 诱饵服务收到零请求。`req.protocol` 与 socket 元数据冲突时仍以后者为准，由探针单测独立覆盖。

## 6. Agent 渠道

Agent Core 的配置与 Adapter 注册见 [共享核心](../modules/agent-core/README.md)，后端通过 Node entry 使用，不走浏览器 bundle 或 UI。

Host Client 边界：

- 保留浏览器默认 Host Client 和现有 setter。
- `createAgentAdapter()` 接受实例 `hostClient` 注入。
- 三个酒馆 adapter 默认使用浏览器 client。
- Node Draw Run 强制传入 per-run client；服务端缺实例 client 直接拒绝，不回退全局单例。

Node 发布边界：

- `modules/agent-core/node-entry.js` 是后端唯一入口；酒馆三渠道在入口层强制要求实例 Host Client，不导出浏览器全局 setter。
- `npm run build` 将 Agent Core、三个 SDK、绘图执行及供应商传输、工具沙盒一起生成扩展的签名 CommonJS 执行包；只允许引用 Node 内置模块，不在后台安装目录保留业务副本。
- 同一构建根据实际输入生成执行包许可证清单，记录精确依赖版本与上游许可证正文；没有许可证正文的依赖不能进入产物。
- 构建与验收统一遵循[插件构建规则](plugin-build.md)，本功能不保留独立流水线。依赖锁定、产物与许可证一致性、暂存发布和失败恢复都由总流程负责。
- 运行时不安装 npm 依赖；bundle 编译目标与 server plugin 最低版本均为 Node.js 18。总验收中的 Node 18 兼容检查及其覆盖范围见[服务端说明](../server-plugin/littlewhitebox-server/README.md)。

不能改写：Tool 格式、Reasoning 处理、Claude/Google 原生回放结构、tagged JSON 兼容、Scene Planner 纠错循环、模型家族判断。

非酒馆渠道的后台语义必须在 UI 明示：Base URL 由 SillyTavern 服务器发起访问，必须对服务器可达；`127.0.0.1` 的含义从"用户机器"变为"服务器本机"。连不上就是 run `failed`，不得静默回退浏览器执行。

## 7. Scene Planner prepare/execute 拆分

`scene-planner.js` 接收准备好的数据；宏展开、世界书解析、Agent 设置和请求鉴权由调用方提供。依赖宿主的宏展开与聊天历史必须在浏览器侧捕获，不在 Node 重新解释。

浏览器预处理 `prepareScenePlannerInput()`：Scene Source、插图点、宏展开、世界书、角色资料、Prompt 模板、当前 Agent providerConfig、Tool 校验上下文、sourceHash。输出可序列化的 Planner 部分；提交协调器只负责在外层补齐 run 与图片生成字段，不能再次解释 Prompt。

后台执行 `executePreparedScenePlanner()`：转发前端提供的唯一 `submit_scene_plan` Tool、调用 Agent、Tool 回放、最多三次纠错、重复错误提前终止、独立校验 `images`、输出规范 Scene Plan。

`ScenePlannerEnvelopeV1` 正式结构（可序列化，无函数、无 DOM 引用）：

```js
{
  version: 1,
  runId,                       // 幂等键；slotId/imgId 由 runId + index 确定性派生，两端同一派生函数
  sourceHash,                  // 冻结正文字符串的哈希（placement contract 见第 3 节）
  imageProvider,               // 'novelai' | 'sd-webui' | 'comfyui'
  planner: {
    prompt: { systemPrompt, messages }, // 宏、世界书与模板已在浏览器展开完毕
    tool,                      // 前端准备的 submit_scene_plan 定义，包含当前完整 JSON Schema
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

`scene-plan-tool.js` 是模型填写说明和 Tool Schema 的唯一来源，仅由浏览器预处理入口导入，不进入 Node 运行包。`planner.tool` 是当前任务的临时输入，沿用 Planner 输入释放路径，不新增持久化状态。

服务端只检查工具名固定为 `submit_scene_plan`，且参数声明必填的 `images` 数组；其余 Schema 内容作为纯 JSON 传给模型，不执行代码、不加载外部引用。返回结果必须仍是唯一一次该工具调用的合法 JSON object。`scene-plan-contract.js` 独立校验其中的 `images` 与冻结的执行限制，不根据前端 Schema 放宽图片执行。其他顶层字段全部忽略，不解释、不合并进图片任务；失败诊断仍保留原始模型输出（沿用长度上限和脱敏）。

`type` 是用于正向提示词的可选文本，不按枚举或语言校验；保留 `no_humans` 到 `no humans` 的绘图标签转换。执行层允许 `action` 省略或留空，可选文本的 `null` 按未提供处理；`index` 不读取模型值，按 `images` 数组顺序生成连续编号。图片和角色只提取认识的字段，额外字段不进入任务或提示词。模型的填写要求仍由前端 Prompt / Tool Schema 指定，不因执行层容错而放宽。

`name`、非空 `scene`、未知角色的非空 `appear`、图片数量、角色数量、插图点有效性与严格递增顺序、坐标校验保持不变。未知角色的 `appear: null` 仍不满足外貌要求；坐标不是可选文本，`center: null` 仍是结构错误。

NovelAI 自动学习在浏览器侧复用同一入口：未提供 `type` 的新角色可以出图，但不自动入库，避免角色库把缺失类型补成 `girl`；已有角色的匹配、停用保护与补空字段行为不变。

前端同时校验当前 Planner 运行契约和 [整组取消能力](./image-backend-batch-jobs.md#整组取消)，部署版本与升级方式由 [后端 README](../server-plugin/littlewhitebox-server/README.md#升级) 维护。不保留后端重建旧 Schema 的分支；既有聊天标记和图片交付记录继续按现有身份接回。规划说明及其 Schema 不变更图片执行语义时，不要求升级后台。

服务端验证边界：

- 请求 envelope 的 JSON 形状与类型校验，未知字段拒绝；`planner.tool` 中的 Schema 内容按上述边界透传。
- `imageProvider` / `agent.channel` 白名单。
- `effectiveMaxImages = 0` 保留用户“不指定精确张数”的语义；`maxPlanImages` 是本次执行容量且 ≤ Image Job单 job items 上限（20）。显式设置超过容量时在写 marker、调用 Planner 前拒绝。
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

## 9. 提交、聊天保存与恢复凭据

绘图不负责确认整份聊天文件。正文、swipe extra 修改后请求宿主 `saveChatDebounced`，不等待保存、不读回聊天、不为画图建立聊天版本或保存锁。图片显示与任务执行不依赖磁盘聊天是否已保存。

唯一持久交付事实仍是 pending image journal，没有新增表、缓存或后台队列。它从提交前开始，沿用确定性的 childJobId：

1. 冻结原正文长度、targetHash、Scene Source、模型与供应商配置，准备执行包。
2. 原子创建 `adopting/pending` journal，初始 items 为空；`submission` 仅含用户＋聊天身份、原始 marker、消息时间。不得存凭据、Prompt 或整份正文。
3. 写入目标 swipe marker、请求宿主防抖保存，POST Draw Run。当前聊天、swipe 或原正文已经变化时不提交；原文后追加续写不算修改原文。
4. 收到 202 即可离开。POST 回执丢失只查询同一 runId，绝不自动重发生成。
5. 明确拒绝删除本地凭据；不确定时保留 journal 和 marker，按原有不确定窗口查询。

这条最小凭据必须跨刷新保留：否则宿主尚未保存 marker 就关闭页面，已接收的付费任务会失去定位。所有者是绘图交付流程；失败沿用现有恢复重试；交付和 ACK 后随同一条 journal 删除。图片落画廊时，原文指纹、长度和插入位置一并交给现有 preview placement，覆盖 journal 已删但聊天尚未保存的窗口。用户明确删除槽位时撤销 placement／标记 discarded。

marker 的唯一 accessor 保留：活动 swipe 修改 message.extra 并同步 swipe_info；非活动 swipe 只改其 extra；没有 swipe 结构则只有 message.extra。marker 包含 version、provider、sourceHash、targetHash、sourceLength、createdAt，以及自动模式标志。正式线旧 marker 没有 sourceLength 时仍按完整原文匹配。

## 10. child 接管与图片交付

`adopting` 只由 Draw Run 恢复器处理，Image Job 恢复器忽略它。后端 handoff 到达后，按同一租约向已有 journal 填入 items，不另建记录或购买任务。

接管顺序：

```text
查询原 run → 将 handoff items 绑定到同一 journal
→ 按 marker 找原 message/swipe；已有槽位只认 slotId
→ 首次放图按原文前缀校验位置，保留其后的续写
→ 写 slots 并渲染（或 target_missing/source_changed 时保留到画廊）
→ journal ready，originRunAckReady 表示 child 已交接
→ 本地清 marker，请求宿主防抖保存，激活原 journal
→ Image Job 接图，图片与 selection 落库，再 ACK
→ ACK 完成后删除 journal
```

- marker 未保存即关页：在同一用户与聊天内，按消息时间、swipe 和原文前缀找唯一目标；无唯一目标不猜位置，已付费结果留画廊。
- 原文后续写不使任务失效；原有前缀被改动不能盲插。已有 slotId 不受全文变化影响。
- 用户已明确删除的槽位不恢复；其他槽位继续接图。图片从未成功保存进正文的情况由 placement 恢复，不重画。
- `placing/ready` 刷新后沿用同一 journal；旧正式记录无 submission 时保留其原有缺槽转画廊语义。
- 自动完成标志在 child 交接时写入现有 Provider auto_done，不在预处理或 202 时提前写。失败或 handoff 前取消不标完成。
- 整组取消沿用精确 run/job 集合与后端 ACK。取消确认不再要求读回原聊天证明 marker 消失，也不能删除 child 的交付记录。
- 活跃规划按现有周期查询；网络失败和租约占用按原恢复机制重试。不同 run 的接管独立推进，不等待聊天保存。
- 目标聊天未激活时不轮询其 adoption；切回聊天、网络恢复或页面可见时唤醒。关闭页面不传播取消；Node 重启仍不恢复进程内任务。

## 11. 多标签页与用户隔离

- 提交前 admission 与 journal 插入在同一 IndexedDB 事务中，防止两个页面为同一消息/swipe 购买不同任务。
- child 仍沿用原有租约，同一时刻只由一个页面交付；释放与页面遗言遵守现有生命周期。
- submission 的用户＋聊天身份只在相同账号、相同聊天使用；切账号不能恢复别人的 marker、凭据或图片。
- 已有 marker/slot 的稳定身份优先于楼层下标；删除更早楼层后仍接回原消息。
- 后端存在但没有当前浏览器 marker/journal 的任务仍是 unclaimed：不自动取消、不删除、不猜楼层。
- 聊天持久化和多标签同时编辑的覆盖边界归 SillyTavern；绘图不再围绕整份聊天构造第二套保存协议。

## 12. 最低必要测试

**不使用源码正则/import 字符串扫描类架构测试**。运行时可移植性由以下真实执行保护：

- 在无 DOM、无 `window`/`localStorage` 的 Node 进程中真实 import 并调用 compiler。
- server bundle 构建必须成功（构建即测试）。
- compiler 用公开输入输出单测保护协议。
- Node entry 集成测试实际执行七个 Adapter 的创建路径。

契约清单：

- journal admission 必须在 POST 之前；聊天保存不返回、读回不可用也不阻断提交与接图。
- marker 在提交不确定窗口内遇 404 只 WAIT，超窗才清理；活页面明确 4xx 立即清理。
- POST 响应丢失不会重复执行 Planner 或生图。
- Alice/Bob 并发时 Cookie、CSRF、Agent 配置不串线（探针矩阵 + 集成）。
- 酒馆 OpenAI/Claude/Google 的 Tool 与纠错回放和浏览器模式一致。
- Planner 失败不产生正文 slot。
- child 创建恰好一次，且经过与 HTTP 路由同一个 normalize/validate service。
- child 已创建后刷新，可经 adoption 进入Image Job journal。
- `adopting` journal 被Image Job恢复器忽略，只有 Draw Run 恢复器能推进它。
- adoption journal 并发创建只有一个标签页成功（原子 add/CAS）。
- child 创建后取消：Draw Run 保持 `dispatched` + manifest，adoption 仍能收取已 ready 结果。
- marker 已删、ACK 响应丢失后，凭 `originRunId` 补 ACK。
- 首次插图的原文前缀变化时只进画廊；追加续写不阻断插图，gallery 模式落库成功后才 ACK。
- adoption 已落盘后，用户只删除部分槽位时不复活被删槽位，其余仍存槽位继续接图；当前 swipe 的Image Job journal 清理前不得启动会替换它的第二批。
- 消息移动、swipe 切换后仍能按 marker 找回（含活动/非活动/无 swipe 结构三形态）。
- 两标签页只能有一个接管者。
- 显式取消传播；关闭页面不传播取消。
- Node 重启按已知边界显示失效，而不是重新扣费。
- 三家 Provider 全部覆盖，不能只证明 NovelAI。

## 13. 关键跨边界风险

1. 酒馆 Agent 渠道的身份回环（第 5 节部署矩阵与探针）。
2. Agent Core 浏览器/Node 双入口（验证打包、Host Client 注入与运行环境）。
3. 三家图片 payload 单一事实源（第 8 节 compiler + 浏览器链路实际运行验证）。
