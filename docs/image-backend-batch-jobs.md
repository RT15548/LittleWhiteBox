# 后端异步批量生图

## 目标

支持后端任务的 provider 在 Scene Planner 完成后一次提交整批请求。SillyTavern 后端进程独立完成上游请求、图片间隔与结果暂存；浏览器后台节流、JavaScript 暂停或短暂断网只影响进度同步，不影响已经创建的任务。

本方案不合并或移植 #84 的前端 Worker 计时器。SD WebUI 与 ComfyUI 默认继续使用各自已有的酒馆代理或浏览器直连链路；只有用户显式启用小白X后台批量任务时，才改由本插件执行。

## 终态边界

### 前端所有

- Scene Planner、角色 Prompt、V4.5/V5 payload 与最终上游 URL。
- 楼层、slot、正文 hash、聊天归属和插入位置。
- V5 MessagePack `final/error` 解释。
- IndexedDB、画廊、DOM 与聊天正文写入。
- 结果落库成功后的 ACK。

### 后端所有

- 进程内 job/item 状态与所有权校验。
- 同一 SillyTavern 用户的单请求并发限制和任务轮转。
- 已经开始的请求之后必须执行的用户间隔。
- 单项 timeout、显式取消、结果字节暂存和 TTL 清理。
- V4.5 图片响应解包，以及 V5 原始 MessagePack 流的有界完整读取。

后端不接收 Scene Planner、角色、楼层、slot 或正文信息，不解释 V5 MessagePack 事件。

## 唯一事实来源与生命周期

`server-plugin/littlewhitebox-image-jobs/image-jobs/job-manager.js` 是后端执行事实源，只管理状态、排队、冷却、取消、TTL 和结果字节；NovelAI、SD WebUI、ComfyUI 协议由各自 adapter 所有。任务仅存在于当前 Node 进程内，不落数据库、不写临时文件；Node 重启后全部丢失。

`pending-image-jobs.js` 的 journal 是前端恢复与交付事实源。它记录一个后端 job 应交付到哪个聊天、消息和 slot，以及当前租约与结算意图；不复制后端执行状态，也不保存 API Key、URL、payload 或图片字节。刷新后的前端只能凭 journal 接回自己的任务，不能凭服务端列表猜测交付目标。

所有权只取 `req.user.profile.handle`，请求体和 URL 参数不能指定 owner。查询、取图、ACK、取消和删除都必须同时匹配 job ID 与 owner；不存在和不属于当前用户统一返回 404。

任务创建前完整校验全部字段，最多 20 项、8 MiB 输入。前端为创建请求提供幂等 `requestId`，响应丢失后以同一 owner + ID 重试不会重复创建任务。每个用户最多保留 20 个 job，进程最多保留 200 个 job、64 MiB 排队输入和 512 MiB 结果字节。失败错误摘要最多保留 2048 字符。每个已执行 item 在结束后立即丢弃 payload。job 进入 `completed` 或 `cancelled` 时清除 API Key、所有 URL、未使用 payload 和输入预算。终态 job 保留一小时，ACK 立即释放对应结果 Buffer；TTL 到期删除整个 job。

## 状态模型

Job（最后一项完成后，owner 调度器仍执行该请求的安全冷却）：

```text
queued -> running -> cooldown -> queued
                    |             |
                    +----------> completed
                    +----------> cancelled

completed -> owner cooldown -> next queued job
```

Item：

```text
queued -> running -> ready -> consumed
                    failed
         cancelled <-+
```

`ready` 只表示后端完整收到供应商响应。V5 是否含有效 `final/error` 仍由前端 `readNovelV5FinalImage()` 判定。

取消 queued job 不触发冷却。取消 running job 会中止当前 HTTP 传输并取消剩余 item，但已经开始的请求仍触发其所属 job 的安全冷却；ready 结果继续保留。SD WebUI 不调用会影响同实例其他请求的全局 `/interrupt`；ComfyUI 只通过 `/queue` 删除本任务的 prompt。单项普通失败记录错误并在冷却后继续后续项。

## 调度

每个 owner 有一个独立调度器，不同 owner 可以并行。同一 owner 每次只运行一个上游请求。

每完成一次已经开始的请求，把仍有 queued item 的 job 放回该 owner 队尾，再执行本次请求所属 job 的随机间隔。因此两个任务按以下顺序轮转：

```text
A1 -> cooldown(A) -> B1 -> cooldown(B) -> A2
```

`cooldownUntil` 使用 epoch milliseconds。浏览器恢复前台后按 `cooldownUntil - Date.now()` 重建倒计时，不依赖错过的前端 timer tick。

最后一项结束后的冷却同样保留，防止通过连续创建 batch 绕过供应商请求间隔。此时旧 job 已进入终态；若同 owner 已有下一批排队，状态快照会把队首任务报告为 `cooldown` 并携带调度器的 `cooldownUntil`，前端可显示真实等待原因。

## 后端 API

基础路径：`/api/plugins/littlewhitebox-image-jobs/v1/jobs`。插件 ID 与目录名一致，都是 `littlewhitebox-image-jobs`。历史插件 `littlewhitebox-nai` 是另一个独立 ID，可以并存；小白X前端不请求、不探测、不回退到它。

| 方法 | 路径 | 语义 |
|---|---|---|
| POST | `/v1/jobs` | 完整校验后按 owner + `requestId` 幂等创建整批任务，返回 202 |
| GET | `/v1/jobs` | 列出当前 owner 的任务，供刷新后发现与接回 |
| GET | `/v1/jobs/:jobId` | 返回 owner 可见的状态、计数、queueAhead 与 item 摘要 |
| GET | `/v1/jobs/:jobId/results/:index` | 返回 V4.5 图片或 V5 原始 MessagePack Buffer |
| DELETE | `/v1/jobs/:jobId/results/:index` | 幂等 ACK，释放结果并进入 `consumed` |
| POST | `/v1/jobs/:jobId/cancel` | 取消 active/queued item，保留 ready 结果 |
| DELETE | `/v1/jobs/:jobId` | 仅删除 `completed`/`cancelled` job |

NovelAI 创建项的 `kind` 只允许：

- `legacy-image`：复用 `generateImage()`，将成功 base64 转回 Buffer，并保存检测后的真实图片 MIME。
- `msgpack-stream`：复用 `openImageStream()`，有界读取完整原始响应并保存专用 MIME `application/vnd.littlewhitebox.novelai-msgpack`。

NovelAI、SD WebUI 与 ComfyUI 都传入完整 HTTP(S) URL；不新增域名、私网或第三方代理限制。SD 保留地址 query 并使用根 `/sdapi` 路径（与酒馆原生 SD 代理一致）；Comfy 无论浏览器直连还是酒馆代理都保留反代基础路径与地址 query。各 provider adapter 仅解释自己的 opaque request 与 context。

现有 `/v1/generate-image`、`/v2/generate-image`、`/v1/generate-image-stream`、`/v1/test`、`/v2/test` 是兼容边界，不改变语义。

## 前端结构

`modules/draw/shared/backend-image-jobs.js` 只负责 capability 探测及 job create/list/status/result/ACK/cancel/delete、轮询和临时网络重试。连续网络错误采用有上限的指数退避；响应正文中断按可重试的连接故障处理，配额类 429 直接返回配置错误，不等待 TTL。它不构造 payload，不访问画廊、楼层或 Scene Planner。

客户端把 `cancelSignal` 与 `detachSignal` 分开：前者只来自用户取消，允许调用 cancel API；后者只停止本地监控，绝不取消或删除后端任务。三家 provider 通过 monitor registry 统一持有 detach scope；cleanup 会一次 detach 全部 scope 并递增代际，旧初始化或旧异步准备即使跨过 cleanup/reinit 也不能提交新任务。快速切换 provider 同样以切换代际淘汰旧初始化。

三家 provider 都使用独立持久化字段 `useImageBackendJobs`，默认 `false`：

- 关闭：不探测、不调用本插件，继续当前 provider 的原生连接方式。
- 开启且 capability 包含 `image-batch-jobs-v1`：一次创建后端 job，逐个收取 ready 结果。
- 开启但插件不可用或 capability 缺失：明确报配置错误，不静默回退到其他连接链路。
- NovelAI 只在后端发送模式展示并启用任务开关；前端直连即使保留过勾选值也不会提交后台任务。后端发送关闭任务开关时继续使用原逐张代理。
- ComfyUI 即使选择浏览器直连也可以显式开启；此时楼层批量任务实际从酒馆服务器发起，因此该服务器必须能够访问所填地址。单张重绘、失败重试、设置页测试生成以及文本源/ebook 没有可恢复的楼层 journal，继续走原连接链路，不创建无法接回的裸后端任务。

批量调用方在提交前为全部 task 建立稳定的 `{index, slotId, imgId, request}` 映射。结果可以晚到或一次补收，但必须按 index 找回原 slot；预分配的 imgId 让重复落库天然幂等。只有图片与 slot selection 都成功写入 IndexedDB 后才 ACK；任一步失败都保留后端结果和本地恢复记录。

## 刷新接回

`pending-image-jobs.js` 使用独立 IndexedDB `xb_image_backend_jobs` 保存交付日志，不保存 API Key、上游 URL、请求 payload 或正文 hash。记录在 POST 前创建，包含 job/provider/chat/message、待替换的旧 slotId、每项新 slotId/imgId 与展示元数据。状态为：

```text
preparing -> active -> settling -> 删除
                    -> cancelling -> settling -> 删除
```

每条记录由 `leaseId + leaseExpiresAt` 独占。接管、fence、状态迁移和删除都在单个 IndexedDB readwrite 事务中做 CAS；`fenceLease` 同时验证所有权并续租，是 POST、ACK、cancel 和交付持久化前的唯一执行许可。旧页面冻结后恢复也无法覆盖新持有者。120 秒租约覆盖最坏轮询与请求间隔，租约未过期时其他页面只能等待。

正常刷新或关闭页面时，`pagehide`（BFCache 的 `persisted=true` 除外）会把当前页面实际持有的 `{jobId, leaseId}` 作为同步 localStorage 遗言写下。新页面只在遗言与 journal 当前 `jobId + leaseId` 精确匹配时，才允许在同一个 IndexedDB 事务里提前换发租约；错任务、旧 lease 或已经由其他标签页换发的新 lease 都不能被遗言抢占。遗言只负责证明旧页面已经离开，不改 journal，不复制业务状态，消费成功或超过 120 秒即删除；浏览器来不及触发 `pagehide`、存储被禁用或写入失败时，完整退回原 120 秒租约语义。

遗言接管到 `preparing` 且后端暂时返回 404 时，从遗言时间起保留 20 秒短宽限，以覆盖页面销毁时唯一可能仍在途的创建请求；宽限结束仍不存在才判定“任务未提交”。`active`、`cancelling`、`settling` 已经证明创建完成，不需要这段宽限，按原状态立即接回或结算。

`recoverable-image-jobs.js` 是提交顺序唯一所有者：先写 journal，再持久化本批全部占位符，重新 fence 后才允许 POST。严格 CAS 未通过时删除 journal；一旦已经发起正文保存却未获确认，只从当前内存正文移除本批新 slot，保留 `preparing` journal 且绝不 POST，等待租约到期后按“任务未提交”恢复，不能把一次不确定保存伪装成确定失败。结果完成时先持久化 `settlement.mode`（`complete` / `discard` / `fail`），再保存槽位结算，最后删除 journal；因此结算中途刷新仍能继续原动作。

`image-job-recovery-runtime.js` 在扩展启动、切换聊天、浏览器恢复前台和 `online` 时立即执行 reconcile，并保留低频周期唤醒以接回没有触发浏览器事件的任务：

- `ATTACH`：原 job 仍存在，原子接管后逐项收图。
- `CANCEL`：用户取消意图未送达，补发取消。
- `SETTLE`：继续上次未完成的成功、取消或失败结算。
- `DISCARD`：只有用户显式取消且 job 已消失时删除未完成槽位。
- `FAIL`：未提交成功显示“任务未提交”；active job 被 TTL 清理显示“后台任务已失效”。槽位保留为可重试失败卡。
- `WAIT`：租约仍归其他流程且没有与当前 lease 精确匹配的页面遗言，绝不接管。

后端存在但本地无 journal 的 job 只上报，不自动取消或删除。slotId 是交付身份：定位时扫描当前 chat 的全部消息和全部 swipes，楼层下标变化或用户切换 swipe 都不会改变归属。交付目标分为三态：当前聊天未加载是 `unavailable`，必须保留后端结果和 journal；全 chat 确认找不到 slot 才是 `removed`，可以幂等丢弃该项；找到 slot 是 `alive`，只写拥有它的 message/swipe。恢复只处理当前打开聊天的记录；切回原聊天会立即重试，避免把未加载误判成已删除。每项落库都会强制刷新现有 pending/failed 节点；画廊缓存写入通过 `BroadcastChannel` 向其他标签页广播 slot 失效，避免接管页完成交付后旧页面继续显示陈旧缓存。

轮询网络失败进入重连状态，连续失败超过上限后本次前端监控 detach，但绝不取消后端任务。只有停止键、Escape 或面板取消产生的 `reason: user` 才向后端传播 cancel；扩展卸载、provider 切换和页面销毁强制以 detach 优先，只停止当前前端照看。取消未获后端确认时 journal 保持 `cancelling`，不能伪装成已取消。取消后继续收取此前 ready 的结果，直到后端进入终态。

## 楼层一致性

楼层路径仍在提交前完成 Scene Planner、slot 分配和 pending 占位符规划。新一批 slot 与正文中的旧图片 slot 先组成安全超集：本地链路结束时先保存该超集，确认成功后才删除旧 slot 并再次保存；后台链路在 POST 前保存超集，整批进入结算并保存成功后才删除 journal。这样生成中断或任一次保存响应丢失都不会先抹掉旧图。

后台任务提交后正文变化时：

- 不取消已经付费的后端任务，也不拿旧 plannedMes 覆盖新正文。
- 每项交付前按 slotId 在全部消息和 swipes 中重新定位；用户删除的 slot 直接 ACK 丢弃，绝不重建。
- 存活 slot 的交付顺序固定为 fence、图片落库、fence、selection 落库、fence；任一阶段发现 slot 被删除，只回滚本项刚写入的事实。
- 后端结果只有在图片与 selection 成功持久化，或“该 slot 已被用户删除”这一事实确认后才能 ACK；持久化失败或聊天不可用都保留后端副本与 journal。
- 楼层处于编辑状态时跳过即时 DOM patch；取消或结算需要删除 slot 时，只要任一楼层仍在编辑就延后整次删除与保存，避免把编辑器草稿覆盖回正文。
- 聊天切换或扩展卸载只 detach；journal 与 slots 保留，但停止推进的页面立即让出租约，恢复 runtime 回到原聊天后即可接管，不再等待旧页面的 120 秒租约自然到期。
- 结算先保存当前正文中的 slot 变更，再删除 journal，最后以 `afterForget` 强制刷新本批新旧节点；若当前 DOM 没有对应 slot 锚点，则从 `message.mes` 重建楼层后再次渲染，不能把已经落库的图片留到 F5 后才显示。DOM 暂时不可用只影响当前视图，不复活已经完成的 journal；楼层重新挂载时继续自愈。

文本源/ebook 路径不写聊天正文，只按 index 返回已落库图片。

## 能力与版本

server plugin 版本为 `2.0.0`，`/status` 增加 capability：

```text
image-batch-jobs-v1
```

启用任务开关的 provider 只按 capability 决定是否可以使用 job API，不用版本号猜测。`v5-msgpack-stream` 和所有旧接口继续保留。

## 删除路径

移除此功能时：

1. 删除 `image-jobs/`、provider adapters、相关 tests 和前端 `backend-image-jobs.js`。
2. 删除 `pending-image-jobs.js`、恢复 executor/runtime 和 `index.js` 注册入口。
3. 从各 provider 删除统一 batch 的后端 job 分支，保留原逐张接口。
4. 删除 capability 并回退 server plugin 版本发布。
5. 删除浏览器 IndexedDB `xb_image_backend_jobs`；后端任务仍随 Node 进程重启清空。

## 施工顺序

1. 后端 manager：状态机、per-owner 轮转、timeout/cancel/cooldown、敏感数据清理、TTL。
2. 后端 REST：输入校验、owner 授权、结果 MIME/ACK、旧 NovelAI 接口回归、`image-batch-jobs-v1` capability。
3. 前端 job client：协议封装、轮询重试、前台补查、取消和幂等收取。
4. provider request preparation 与统一 batch 执行；任务开关关闭时保留原链路。
5. journal、租约、提交 CAS、刷新接回与显式取消结算。
6. 接入文本源/ebook 与楼层占位符路径，再统一单张刷新/重试入口。
7. 刷新 `assistant-file-manifest.json`；仅在依赖检查证明需要时重建 bundle。

## 最低必要测试

### 后端 manager

- 提交响应生命周期与任务执行生命周期分离。
- 同一 owner 严格单请求；不同 job 按项轮转。
- 成功、失败和 active cancel 后都执行安全冷却。
- 单项失败继续；取消保留 ready 并取消 active/queued。
- owner 隔离；终态清 Key/payload；ACK 幂等；TTL 释放结果。

### REST 与 transport

- create/status/result/ACK/cancel/delete 闭环。
- 全字段先校验，最多 20 项，自定义 URL 原样传递。
- V4.5 返回真实图片 MIME；V5 返回原始 MessagePack 字节。
- SD/Comfy adapter 的 URL、认证、interrupt、SaveImage 选图、`/view` 参数和错误诊断。
- 旧生成和连接测试接口不回归。

### 前端

- 支持 capability 时多张图只创建一个 job。
- 漏过多个状态后一次补收全部 ready item，重复轮询不重复交付。
- 临时查询失败继续恢复；回到前台立即查询。
- AbortSignal 发出 cancel 后仍交付 ready 结果。
- 任务开关关闭走原链路；开启但 capability 缺失直接失败。
- journal → 正文 CAS/保存 → lease 复核 → POST 顺序不可改变；保存结果不确定时 journal 必须保留，过期旧页面不得再 POST。
- 销毁提交实例后由新实例接回同一 job；图片和 selection 落库都早于 ACK。
- 多标签页只能有一个 lease 持有者；晚到 created/cancel 通知不能倒退状态。
- index 与 slot 不倒挂；楼层重排和 swipe 切换后仍按 slotId 找到真实目标，用户删除单个 slot 后恢复不得重建。
- 聊天未加载时保留结果，全 chat 找不到 slot 时才丢弃；slot 删除必须避开编辑状态，最终 DOM 提交必须晚于 journal 删除。
- teardown detach 不发送 cancel/delete；cleanup/reinit 后的旧 provider 操作不得创建任务。

## 验收

后台任务模式规划 4 张、间隔 20 秒；第一张开始后关闭或刷新页面。正常 `pagehide` 写下遗言时，重新进入原聊天应立即接管原 job；模拟系统强杀或禁用 localStorage 时仍等待旧 lease 到期。两种路径最终都应让四张图落入原 slot，journal 在全部落库和 ACK 后消失。随后分别验证临时断网恢复、显式 active cancel、删除单个 slot、多标签页竞争、多楼层轮转，以及关闭任务开关仍走原链路。
