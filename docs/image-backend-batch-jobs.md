# 后端异步批量生图

## 目标

支持后端任务的 provider 在 Scene Planner 完成后一次提交整批请求。SillyTavern 后端进程独立完成上游请求、图片间隔与结果暂存；浏览器后台节流、JavaScript 暂停或短暂断网只影响进度同步，不影响已经创建的任务。

SD WebUI 与 ComfyUI 默认继续使用各自已有的酒馆代理或浏览器直连链路；只有用户显式启用小白X后台批量任务时，才改由本插件执行。

## 终态边界

### 前端所有

- Scene Planner、角色 Prompt、V4.5/V5 payload 与最终上游 URL。
- 楼层、slot、正文 hash、聊天归属和插入位置。
- 浏览器直连时的 V5 MessagePack `final/error` 解释；后台任务只接收最终 PNG。
- IndexedDB、画廊、DOM 与聊天正文写入。
- 结果落库成功后的 ACK。

### 后端所有

- 进程内 job/item 状态与所有权校验。
- 同一 SillyTavern 用户的单请求并发限制和任务轮转。
- 已经开始的请求之后必须执行的用户间隔。
- 单项 timeout、显式取消、结果字节暂存和 TTL 清理。
- V4.5 图片响应解包，以及 V5 MessagePack 流的有界逐帧解析与最终 PNG 提取。

Image Job 接口不接收 Scene Planner、角色、楼层、slot 或正文信息；后端规划由独立 [Draw Run](./backend-draw-runs.md)负责，两个接口不能混作一项能力。NovelAI adapter 只解释供应商传输事件，把 `final/error` 收敛成通用 Image Job 的最终图片或错误。

## 唯一事实来源与生命周期

`server-plugin/littlewhitebox-server/image-jobs/job-manager.js` 是后端执行事实源，只管理状态、排队、冷却、取消、TTL 和结果字节；NovelAI、SD WebUI、ComfyUI 协议由各自 adapter 所有。任务仅存在于当前 Node 进程内，不落数据库、不写临时文件；Node 重启后全部丢失。

`pending-image-jobs.js` 的 journal 是前端恢复与交付事实源。它记录一个后端 job 应交付到哪个聊天、消息和 slot，以及当前租约与结算意图；不复制后端执行状态，也不保存 API Key、URL、payload 或图片字节。刷新后的前端只能凭 journal 接回自己的任务，不能凭服务端列表猜测交付目标。

所有权只取 `req.user.profile.handle`，请求体和 URL 参数不能改变认证所属账号。查询、取图、ACK、单任务取消和删除都必须同时匹配 job ID 与 owner；不存在和不属于当前用户统一返回 404。整组取消的账号核对与未知 ID 语义见下节。

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

`ready` 表示 provider adapter 已验证并产出最终图片。NovelAI V5 必须已经收到合法 `samp_ix === 0` 的 `final` PNG；原始 MessagePack 不进入结果存储。

取消 queued job 不触发冷却。取消 running job 会中止当前 HTTP 传输并取消剩余 item，但已经开始的请求仍触发其所属 job 的安全冷却；ready 结果继续保留。SD WebUI 不调用会影响同实例其他请求的全局 `/interrupt`；ComfyUI 只通过 `/queue` 删除本任务的 prompt。单项普通失败记录错误并在冷却后继续后续项。

### 整组取消

`POST /v1/cancel` 接收 `{owner, jobIds, runIds}`，由 `cancellation.js` 注册，最多 128 个安全 ID。owner 必须与当前认证账号一致，不一致明确拒绝，不能用新账号确认旧账号的意图。认证、全量校验和容量检查先于任何取消效果；同一同步操作取消目标 Draw Run（含已派生的 child）及 Image Job，两个调度器均不能在集合处理完之前启动下一项。已完成图片和 handoff 保留，不增加并发或调用供应商的全局中止接口。空集合、非法 ID 和超限集合整体拒绝。

取消回执由后端进程内的 owner 隔离 registry 所有。未知 ID 也记录取消，外部无法借此区分他人的任务；取消先于创建到达时，后续同 ID 创建返回 `request_cancelled`，不购买图片。回执独立于结果 ACK/任务删除保留一小时，重复确认续期；过期条目在下一次访问回收，进程关闭全部清空，不保存凭据或请求正文。默认每用户最多 256 个 ID、进程最多 4096 个 ID，容量包括任务的取消预留：Image Job 接受前预留自身，Draw Run 接受前原子预留自身和确定性 child；派生 child 接管已有预留。预留是 registry 所有的进程临时态，任务存活期间不因时间过期，任务删除/关闭时释放，未派生的 child 随父任务释放；已确认取消的回执仍保留到期限。容量不足拒绝新任务或未知 ID 的取消，不会让已接受任务失去自身的取消容量，不静默丢弃未过期回执。该保证与任务本身一样不跨后端重启，也不超出保留期。

浏览器由 `draw-run-controls.js` 同步捕获本次账号及目标集合，`draw-work-cancellation.js` 统一协调。精确集合在 `draw-cancellation-journal.js` 独立 IndexedDB `xb_draw_cancellations` 中只保存本地 ID、owner、jobIds、runIds；它不是第二套任务状态。无法用临时态替代，因为断网、响应丢失和刷新后必须重试同一组，而不能拆成相互竞速的单任务取消。

前台点击和恢复重放共用同一个完成顺序：后端整组确认 → 在单个交付 journal 事务中标记目标 job 及已接管的 run 子任务 → 删除取消意图。投影只更新已有记录，保留租约、单项交付确认和 adoption 阶段，不创建任务、不重写已进入结算的结果；后端任务消失后，取消事实仍决定清理策略。投影失败整笔回滚，意图继续保留并报错，不能因收到后端 ACK 就提前忘记。后端确认前不得投影，避免提前唤起其他标签页的单任务取消；恢复结算也识别后端 cancelled 终态。

恢复器先重放当前账号的整组意图，再安排图片/规划交付。单组重放失败只暂缓该组及关联父子任务，继续其他取消和无关结果交付；无法读取意图库时才暂停整轮，因为此时无法确定保护范围。其他账号的意图不发送、不删除，其关联交付记录也不处理，回到所属账号后继续。未确认时运行监控只能 detach，不得绕过该组独自取消。已有单任务 API 保留对已发布客户端的协议兼容；当前前端统一使用集合 API。

## 调度

每个 owner 有一个独立调度器，不同 owner 可以并行。同一 owner 每次只运行一个上游请求。

每完成一次已经开始的请求，把仍有 queued item 的 job 放回该 owner 队尾，再执行本次请求所属 job 的随机间隔。因此两个任务按以下顺序轮转：

```text
A1 -> cooldown(A) -> B1 -> cooldown(B) -> A2
```

`cooldownUntil` 使用 epoch milliseconds。浏览器恢复前台后按 `cooldownUntil - Date.now()` 重建倒计时，不依赖错过的前端 timer tick。

最后一项结束后的冷却同样保留，防止通过连续创建 batch 绕过供应商请求间隔。此时旧 job 已进入终态；若同 owner 已有下一批排队，状态快照会把队首任务报告为 `cooldown` 并携带调度器的 `cooldownUntil`，前端可显示真实等待原因。

## 后端 API

基础路径：`/api/plugins/littlewhitebox-server/v1/jobs`。绘图与联网共用统一后端，安装和旧目录迁移见 [后端 README](../server-plugin/littlewhitebox-server/README.md#升级)。前端不请求、不探测、不回退旧插件命名空间。

| 方法 | 路径 | 语义 |
|---|---|---|
| POST | `/v1/jobs` | 完整校验后按 owner + `requestId` 幂等创建整批任务，返回 202 |
| GET | `/v1/jobs` | 列出当前 owner 的任务，供刷新后发现与接回 |
| GET | `/v1/jobs/:jobId` | 返回 owner 可见的状态、计数、queueAhead 与 item 摘要 |
| GET | `/v1/jobs/:jobId/results/:index` | 返回 provider 已归一化的最终图片 Buffer |
| DELETE | `/v1/jobs/:jobId/results/:index` | 幂等 ACK，释放结果并进入 `consumed` |
| POST | `/v1/jobs/:jobId/cancel` | 取消 active/queued item，保留 ready 结果 |
| DELETE | `/v1/jobs/:jobId` | 仅删除 `completed`/`cancelled` job |

NovelAI 创建项的 `kind` 只允许：

- `legacy-image`：复用 `generateImage()`，将成功 base64 转回 Buffer，并保存检测后的真实图片 MIME。
- `msgpack-stream`：复用 `openImageStream()`，用与浏览器直连相同的帧解析器逐帧解码，忽略 intermediate，只保存经过 PNG 签名校验的 sample-zero final，结果 MIME 固定为 `image/png`。

NovelAI、SD WebUI 与 ComfyUI 都传入完整 HTTP(S) URL；不新增域名、私网或第三方代理限制。SD 保留地址 query 并使用根 `/sdapi` 路径（与酒馆原生 SD 代理一致）；Comfy 无论浏览器直连还是酒馆代理都保留反代基础路径与地址 query。各 provider adapter 仅解释自己的 opaque request 与 context。

现有 `/v1/generate-image`、`/v2/generate-image`、`/v1/generate-image-stream`、`/v1/test`、`/v2/test` 是兼容边界，不改变语义。

## 前端结构

`modules/draw/shared/backend-image-jobs.js` 只负责 capability 探测及 job create/list/status/result/ACK/cancel/delete、轮询和临时网络重试。连续网络错误采用有上限的指数退避；响应正文中断按可重试的连接故障处理，配额类 429 直接返回配置错误，不等待 TTL。它不构造 payload，不访问画廊、楼层或 Scene Planner。

客户端把 `cancelSignal` 与 `detachSignal` 分开：前者只来自用户取消，允许调用 cancel API；后者只停止本地监控，绝不取消或删除后端任务。三家 provider 通过 monitor registry 统一持有 detach scope；cleanup 会一次 detach 全部 scope 并递增代际，旧初始化或旧异步准备即使跨过 cleanup/reinit 也不能提交新任务。快速切换 provider 同样以切换代际淘汰旧初始化。

三家 provider 都使用独立持久化字段 `useImageBackendJobs`，默认 `false`：

- 关闭：不探测、不调用本插件，继续当前 provider 的原生连接方式。
- 开启且 capability 满足下文的能力契约：一次创建后端 job，逐个收取 ready 结果；NovelAI V5 还要求 `novelai-v5-final-image-v1`。
- 开启但插件不可用或 capability 缺失：明确报配置错误，不静默回退到其他连接链路。
- NovelAI 只在后端发送模式展示并启用任务开关；前端直连即使保留过勾选值也不会提交后台任务。后端发送关闭任务开关时继续使用原逐张代理。
- ComfyUI 即使选择浏览器直连也可以显式开启；此时聊天图片（包括已有槽位重绘）从酒馆服务器发起，因此该服务器必须能够访问所填地址。设置页测试生成及文本源/ebook 等无聊天交付 journal 的调用仍走原连接链路。

批量调用方在提交前为全部 task 建立稳定的 `{index, slotId, imgId, request}` 映射。结果可以晚到或一次补收，但必须按 index 找回原 slot；预分配的 imgId 让重复落库天然幂等。只有图片与 slot selection 都成功写入 IndexedDB 后才 ACK；任一步失败都保留后端结果和本地恢复记录。

## 刷新接回

`pending-image-jobs.js` 使用独立 IndexedDB `xb_image_backend_jobs` 保存交付日志，不保存 API Key、上游 URL、请求 payload 或正文 hash。记录在 POST 前创建，包含 job/provider/chat/message、待替换的旧 slotId、每项新 slotId/imgId 与展示元数据。状态为：

```text
preparing -> active -> settling -> 删除
                    -> cancelling -> settling -> 删除
```

每条记录由 `leaseId + leaseExpiresAt` 独占。接管、fence、状态迁移和删除都在单个 IndexedDB readwrite 事务中做 CAS；`fenceLease` 同时验证所有权并续租，是 POST、ACK 和交付持久化前的执行许可；整组用户取消独立于交付租约，仍按点击目标及后端认证身份隔离。旧页面冻结后恢复也无法覆盖新持有者。120 秒租约覆盖最坏轮询与请求间隔，租约未过期时其他页面只能等待。

正常刷新或关闭页面时，`pagehide`（BFCache 的 `persisted=true` 除外）会把当前页面实际持有的 `{jobId, leaseId}` 作为同步 localStorage 遗言写下。新页面只在遗言与 journal 当前 `jobId + leaseId` 精确匹配时，才允许在同一个 IndexedDB 事务里提前换发租约；错任务、旧 lease 或已经由其他标签页换发的新 lease 都不能被遗言抢占。遗言只负责证明旧页面已经离开，不改 journal，不复制业务状态，消费成功或超过 120 秒即删除；浏览器来不及触发 `pagehide`、存储被禁用或写入失败时，完整退回原 120 秒租约语义。

遗言接管到 `preparing` 且后端暂时返回 404 时，从遗言时间起保留 20 秒短宽限，以覆盖页面销毁时唯一可能仍在途的创建请求；宽限结束仍不存在才判定“任务未提交”。`active`、`cancelling`、`settling` 已经证明创建完成，不需要这段宽限，按原状态立即接回或结算。

`recoverable-image-jobs.js` 是提交顺序唯一所有者：先写 journal，再持久化本批全部占位符，重新 fence 后才允许 POST。严格 CAS 未通过时删除 journal；一旦已经发起正文保存却未获确认，只从当前内存正文移除本批新 slot，保留 `preparing` journal 且绝不 POST，等待租约到期后按“任务未提交”恢复，不能把一次不确定保存伪装成确定失败。结果完成时先持久化 `settlement.mode`（`complete` / `discard` / `fail`），再保存槽位结算，最后删除 journal；因此结算中途刷新仍能继续原动作。

`image-job-recovery-runtime.js` 在扩展启动、切换聊天、浏览器恢复前台和 `online` 时立即执行 reconcile，并保留低频周期唤醒以接回没有触发浏览器事件的任务：

发现/取消重放轮次只串行到任务安排完成，不等待图片终态。每个接回任务独立执行，运行期登记避免同页重复挂接，交付所有权仍只认 IndexedDB 租约；取消重试和新任务发现不能被其他长期任务阻塞。登记不持久化，随本次执行结束释放；扩展停止不等于用户取消，已有交付可收尾，后续恢复仍遵守原租约。

- `ATTACH`：原 job 仍存在，原子接管后逐项收图。
- `CANCEL`：用户取消意图未送达，补发取消。
- `SETTLE`：继续上次未完成的成功、取消或失败结算。
- `DISCARD`：只有用户显式取消且 job 已消失时删除未完成槽位。
- `FAIL`：未提交成功显示“任务未提交”；active job 被 TTL 清理显示“后台任务已失效”。槽位保留为可重试失败卡。
- `WAIT`：租约仍归其他流程且没有与当前 lease 精确匹配的页面遗言，绝不接管。

后端存在但本地无 journal 的 job 只上报，不自动取消或删除。slotId 是交付身份：定位时扫描当前 chat 的全部消息和全部 swipes，楼层下标变化或用户切换 swipe 都不会改变归属。交付目标分为三态：当前聊天未加载是 `unavailable`，必须保留后端结果和 journal；全 chat 确认找不到 slot 才是 `removed`，可以幂等丢弃该项；找到 slot 是 `alive`，只写拥有它的 message/swipe。恢复只处理当前打开聊天的记录；切回原聊天会立即重试，避免把未加载误判成已删除。每项落库都会强制刷新现有 pending/failed 节点；画廊缓存写入通过 `BroadcastChannel` 向其他标签页广播 slot 失效，避免接管页完成交付后旧页面继续显示陈旧缓存。

轮询网络失败进入重连状态，连续失败超过上限后本次前端监控 detach，但绝不取消后端任务。只有停止键、Escape 或面板取消产生的 `reason: user` 才向后端传播 cancel；扩展卸载、provider 切换和页面销毁强制以 detach 优先，只停止当前前端照看。取消未获后端确认时整组意图 journal 必须保留，不能伪装成已取消；既有单任务 `cancelling` 记录仍按原身份接回。取消后继续收取此前 ready 的结果，直到后端进入终态。

## 楼层一致性

楼层路径仍在提交前完成 Scene Planner、slot 分配和 pending 占位符规划。再次配图只追加新 slot，既有图片及其相对正文的位置保持不变；同一插图点的新图排在既有图片之后。本地链路结束时一次保存追加后的正文，后台链路在 POST 前保存本批占位符，Draw Run 则在接管 handoff 时保存。开始新一批的楼层重绘也会恢复既有图片的显示。

结构性配图只拥有自己的新 slot；原生标签和已有图位重绘按交付计划保留取消后的图位。成功或失败不删除既有图片，Draw Run 显式取消只移除本批未完成且仍归它所有的新增槽位；已确认交付的旧项不得改动新重绘，具体门禁见 [聊天交付设计](./chat-image-delivery.md#任务状态与取消)。

后台任务提交后正文变化时：

- 不取消已经付费的后端任务，也不拿旧 plannedMes 覆盖新正文。
- 每项交付前按 slotId 在全部消息和 swipes 中重新定位；用户删除的 slot 直接 ACK 丢弃，绝不重建。
- 存活 slot 的交付顺序固定为 fence、图片落库、fence、selection 落库、fence；任一阶段发现 slot 被删除，只回滚本项刚写入的事实。
- 后端结果只有在图片与 selection 成功持久化，或“该 slot 已被用户删除”这一事实确认后才能 ACK；持久化失败或聊天不可用都保留后端副本与 journal。
- 楼层处于编辑状态时跳过即时 DOM patch；取消或结算需要删除 slot 时，只要任一楼层仍在编辑就延后整次删除与保存，避免把编辑器草稿覆盖回正文。
- 聊天切换或扩展卸载只 detach；journal 与 slots 保留，但停止推进的页面立即让出租约，恢复 runtime 回到原聊天后即可接管，不再等待旧页面的 120 秒租约自然到期。
- 结算先保存必要的 slot 结构变更，再删除 journal，最后投影仍存在的卡片；单纯结果/进度通知不因 DOM 暂时缺少图位而重建整楼。挂载与节点保留规则由 [聊天交付设计](./chat-image-delivery.md#卡片投影与旧图保留) 所有。

文本源/ebook 路径不写聊天正文，只按 index 返回已落库图片。

## 能力与版本

server plugin 的分发版本以 `manifest.json` 为准，升级方式见 [后端 README](../server-plugin/littlewhitebox-server/README.md#升级)。`/status` 中与本链路相关的 capability 为：

```text
image-batch-jobs-v1
draw-work-cancellation-v1
novelai-v5-final-image-v1
```

启用任务开关的 provider 按 capability 决定是否可以使用 job API，不用版本号猜测。`novelai-v5-final-image-v1` 明确声明异步 V5 结果是 PNG；缺少时新前端拒绝提交。`v5-msgpack-stream` 继续只代表前台逐张后端代理能力，所有旧接口保持原语义。

## 删除路径

移除此功能时：

1. 删除 `image-jobs/`、provider adapters、相关 tests 和前端 `backend-image-jobs.js`。
2. 删除 `pending-image-jobs.js`、恢复 executor/runtime 和 `index.js` 注册入口。
3. 从各 provider 删除统一 batch 的后端 job 分支，保留原逐张接口。
4. 删除 capability 并回退 server plugin 版本发布。
5. 删除 `draw-work-cancellation.js`、`draw-cancellation-journal.js` 及后端 `cancellation.js` 注册；清理浏览器 IndexedDB `xb_image_backend_jobs`、`xb_draw_cancellations`。后端任务和取消回执随 Node 进程重启清空。



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
- V4.5 返回真实图片 MIME；V5 流在服务端提取 sample-zero final，并只返回 `image/png`。
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

## 外部验证

后台任务模式规划 4 张、间隔 20 秒；第一张开始后关闭或刷新页面。正常 `pagehide` 写下遗言时，重新进入原聊天应立即接管原 job；模拟系统强杀或禁用 localStorage 时仍等待旧 lease 到期。两种路径最终都应让四张图落入原 slot，journal 在全部落库和 ACK 后消失。随后分别验证临时断网恢复、显式 active cancel、删除单个 slot、多标签页竞争、多楼层轮转，以及关闭任务开关仍走原链路。
