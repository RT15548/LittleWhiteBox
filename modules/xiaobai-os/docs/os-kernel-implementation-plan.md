# 小白 OS Kernel 施工方案

## 1. 施工原则

本方案只实现 [OS Kernel 终态设计](./os-kernel-target-design.md) 已确定的边界。施工过程中允许按批提交代码，但生产运行时不得出现 metadata 根与 sidecar 双读、双写或按版本分叉。

新 Kernel 先在独立 composition 和公开行为测试中闭合；全部 APP 适配完成后一次切换生产入口。不能为了“先跑起来”把 Envelope、业务 parser、Capability 和 APP 路由重新塞进一个文件。

每批开工前回答：本批所有者、唯一事实来源、临时/持久态、外部依赖、注册入口、删除路径、真实兼容对象和最低测试。每批结束后通盘 review 上下游、取消、失败、切聊和数据流。

## 2. 批次 A：Kernel 与文件端口

### 新建

    kernel/contracts.ts
    kernel/envelope.ts
    kernel/partition-registry.ts
    kernel/transaction-coordinator.ts
    storage/storage-port.ts
    storage/sillytavern-file-storage.ts

### 必须完成

1. 定义 Envelope、StorageReplaceResult、PartitionRegistration、ScopedChatStore、文件级 write state 和结构化错误。
2. Envelope parser 严格拒绝未知根字段、错误 formatVersion、osId/revision/commitId；partitions 内部保持 opaque。
3. SillyTavern adapter 实现 no-store 读取、404、base64 上传、删除、结果未知时读回和`expected/candidate/observed`的 commitId 比对。生产写入不设固定 15 秒截止。
4. Coordinator 实现单页 FIFO、当前聊天已确认 Envelope、一次 command、一次 candidate、一次 replace；绑定解析直接安装读入结果，APP 不重复下载。
5. unconfirmed/conflict 只存在当前运行；状态冻结同聊天全部新写入，不写入 sidecar。
6. 无关分区从协调器最新已确认版本复制；各 APP 不持有独立可写文件缓存。
7. replace 重试接受已序列化 candidate；不得再次调用 command。

### 不得做

- 不注册任何生产 APP；
- 不 import Economy、Map、Tasks 类型；
- 不建立服务端 CAS 幻觉；
- 不迁移旧 metadata 根；
- 不做 user files 目录枚举。

### 最低测试

- 缺失、坏 JSON、坏 Envelope、合法未知分区；
- 一个坏分区不阻止另一个注册分区读写；
- 两个排队写按最新已确认 revision 递增；不同分区不覆盖彼此，热状态读取不发请求；
- 成功、明确失败、timeout-confirmed、读回仍为 expected 的 timeout-unconfirmed、第三方 commit conflict；
- candidate 重试不重复执行 command；
- 一次事务只有一个 upload。

## 3. 批次 B：聊天引用和生命周期

### 新建

    storage/chat-reference.ts
    storage/chat-binding.ts
    storage/sidecar-index.ts

### 必须完成

1. 只在 xiaobaiOsRef 写 formatVersion + osId。
2. 新 sidecar 与引用使用明确的两阶段流程；失败和未知结果按目标文档处理。
3. CHAT_CHANGED 刷新 binding 和 sidecar，并释放非待核实的旧聊天缓存；同聊天重开、focus/visibility 不再读文件。启动时先完成绑定解析，APP 初次读取等待该结果。
4. 分支识别读取 main_chat 和父聊天 header，不使用“消息数大于一”。复制 partitions 后、首次子 sidecar 写入前调用组合层同步准备回调；当前仅 Messages 自有策略裁剪通讯历史，不改变其他分区的默认完整复制。
5. CHAT_RENAMED/CHARACTER_RENAMED 保留 osId。
6. 复制冲突优先证明旧 binding 是否仍存在；不能证明时返回 identity_conflict。
7. 删除只处理唯一索引映射；索引 parse/保存失败只记录日志，不阻断 APP 数据读取。
8. 首次纯只读不创建 sidecar；首次持久操作才建立。

### 真实宿主 fixture

- 单聊 header、群聊 header；
- SillyTavern 1.18 内建 branch 的 main_chat 结构；
- CHAT_RENAMED payload；
- CHAT_DELETED/GROUP_CHAT_DELETED 只有文件名的 payload；
- 角色 rename 的 old/new avatar。

### 最低测试

- 首次建立、引用保存明确失败、引用保存结果未知；
- 分支复制分区但重置 Envelope revision/osId；业务准备回调在第一次子文件写入前完成，历史 Messages 不带入分支点后私聊；
- 重命名不换 osId；
- 同一引用出现在仍存在的第二聊天时克隆；
- 删除同名歧义不删；
- 索引损坏后当前聊天仍由 ref + sidecar 打开。

## 4. 批次 C：Capability 与 APP module

### 新建

    kernel/capability-registry.ts
    kernel/app-registry.ts
    kernel/execution-scope.ts
    capabilities/economy/
    capabilities/agent/
    capabilities/maintenance/

### 必须完成

1. Capability Registry 检查唯一 ID、依赖存在和无环。
2. APP manifest 声明 partition 与 capability token；Kernel 只注入已声明依赖。
3. Scoped transaction 中再次检查 token 授权，不能靠 TypeScript 假装隔离。
4. Economy Capability 拥有 economy partition，分别提供 Wallet 只读口和业务事务口。
5. 事务口绑定 caller sourceDomain，消费者只提交领域资金意图。
6. Agent Capability 包装现行共享 Agent gateway；删除 enabled 分叉，不创建 sidecar 配置。
7. Maintenance Capability 搬迁现有业务无关 runner，不改变 Map/Tasks Prompt、工具或触发规则。
8. execution scope 统一监管 timer、listener、AbortController 和 Promise rejection。
9. expected domain/user errors不改变 APP 状态；未捕获基础故障才进入 failed。

### 最低测试

- 重复、缺失和循环 capability 注册失败；
- 未声明 token 在安装期和事务期均被拒绝；
- Economy caller 不能伪造其他 sourceDomain；
- Wallet 不能取得写能力；
- Agent 未配置返回操作错误但 APP 保持 ready；
- 后台 rejection 被归属到正确 module，其他 module 仍运行。

## 5. 批次 D：APP 适配

这一批在非生产的新 composition 内完成。每适配一个 APP 就删除它对 XiaobaiOsChatData、chat-data-store 和完整 partitions 的依赖；不得先包一层旧根 adapter 冒充新 Store。

### D1. 无资金 APP

按以下顺序：

1. Map：partition key 为 map；repository 改用 ScopedChatStore；maintenance staging 仍在内存。
2. Fourth Wall：partition key 为 fourthWall；设置仍为用户级；皮下会话进入 sidecar。
3. Agent API：无分区，只消费 Agent Capability。

每个 APP 新建 module.ts，明确 parser、Host runtime、capabilities、dispose 和 clearData。

### D2. Economy 与 Wallet

1. Economy partition 只由 Economy Capability 注册。
2. Wallet Controller 改读 EconomyReadCapability。
3. 首次开户由明确的 ensure/open command 触发；打开空 Wallet 可显示本地 loading/empty，但不能绕过事务协调器。
4. 删除 Economy Repository 对旧根和 Economy V1 migration 的依赖。

### D3. 资金消费者

依次迁移 Game、Bank、Shop、Tasks：

1. 自有 event/domain 只写自有 partition。
2. 原 root-protocol 拆成领域资金意图和只读一致性检查；不得继续接收完整 OS 根。
3. 在 Scoped transaction 中调用 EconomyTransactionCapability。
4. 一致性检查只能看自有领域与 caller-bound Economy 视图。
5. 保存状态统一来自当前 sidecar，不建立 APP 私有锁。
6. Shop 在途 ticket、Tasks maintenance staging 等仍是临时态，不进入 Envelope。

每个迁移必须证明：

- 自有分区单独损坏时 Economy/其他 APP 仍可读；
- 自有动作与 Economy 只上传一次；
- 明确失败两分区都不发布；
- timeout 不重复扣款、抽随机、生成候选或结算。

### D4. upstream Fourth Wall 一次性导入

该兼容批必须在生产切换前闭合，不能等生产入口已经停止读取旧 fw 后再补。

1. 使用 upstream 真实 fw fixture，不使用当前类型补齐后的伪 fixture。
2. 转换器归`apps/fourth-wall`所有，只在“无 xiaobaiOsRef + 有旧 fw”升级入口运行。
3. 任一其他 APP 首次写入前先完成该判定；存在旧 fw 时，初始 sidecar candidate 必须同时包含 fourthWall 分区。
4. 先确认新 sidecar，再以一次聊天 metadata 保存安装 xiaobaiOsRef 并删除旧 fw。
5. metadata 保存明确失败时旧 fw 保持可用，并清理或登记孤儿 sidecar。
6. 保存结果未知时读回聊天 header：只有新引用存在且旧 fw 已删除才算完成；不能重复迁移为两个 osId。
7. 成功后该聊天只读 sidecar；兼容分支的退出条件按目标文档记录，不进入 Kernel。

当前测试线 xiaobaiOs、Economy、Map、Tasks、Game、Bank、Shop 数据全部不迁移。

## 6. 批次 E：Shell、Frame 和模块故障

### 改造

    host/bootstrap.ts
    host/lifecycle.ts
    host/frame-bridge.ts
    shell/app-catalog.ts
    shell/AppBoundary.vue
    vite.xiaobai-os.config.mjs

### 必须完成

1. production composition 缩为端口、Capability catalog、Host APP catalog 的组合。
2. Shell catalog 保留静态 descriptor/icon，但 component 改为动态 import loader。
3. Vite 输出稳定 entry 与 chunk 文件，不能把动态 import 重新内联进单文件。
4. Host 和 Shell catalog ID 构建期比对。
5. Frame init 同步 APP 状态；APP 状态变化单独广播。
6. 点击图标先进入 route 和 loading，再并行等待 Host activation 与 UI loader。
7. Host/UI 失败进入当前 APP 的错误页；Home/Back/Close 不依赖 APP component。
8. Retry 按 phase 重做该 APP。UI chunk 重试不复用已 reject 的 Promise；若浏览器模块缓存使其不可恢复，重载 OS iframe而非整页。
9. Vue error boundary 和 frame error handler把异常归属当前 APP。
10. cleanup await/settle 所有 module dispose，单个失败不阻断其他清理。

### 最低测试

- Host install、dependency、activation、message、background failure；
- UI chunk reject、render error、重试；
- 坏 APP 图标仍在且可进错误页；
- 其他 APP 可打开，导航始终工作；
- lazy chunk 确实由构建产物提供，不用读取源码字符串证明。

## 7. 批次 F：一次性生产切换

只有 A–E 和 D4 在新 composition 全部闭合后才能执行。

### 切换

1. index.ts 只启动新 bootstrap。
2. 所有 APP catalog 一次注册。
3. 主 RP Prompt、Shop generation、Map/Tasks maintenance 连接新分区 Store。
4. 旧 xiaobaiOs metadata 完全不读；新业务只写 sidecar。
5. 共享 Agent 配置和用户级 OS 设置保持原位置。

### 必删

- host/chat-data-store.ts；
- 旧 XiaobaiOsChatData 根类型和 schemaVersion 2 validator；
- chat-data-upgrade、Economy V1 OS 根迁移；
- production-composition 中逐 APP 手工 wiring；
- APP 接收完整 root 的 root-protocol；
- 根级业务 validator 注册；
- 所有旧 store、metadata 根和迁移测试；
- 旧静态 Vue component import。

legacy-migration.ts 中若仍有 upstream Fourth Wall 真实转换，必须移入 Fourth Wall 自己的 upgrade/import 文件；Kernel 不保留旧 OS 根知识。

### 禁止

- 按“sidecar 不存在就读 metadata”回退；
- 同一次动作同时保存 metadata 和 sidecar；
- 保留旧 Store 只为测试；
- 用 schemaVersion 猜测“可能有用户”。

## 8. 批次 G：Game 体验

在 sidecar 事务稳定后再接 UI，避免用动画掩盖错误提交模型。

1. 将确认、neutral rolling、prepared commit、confirmed reveal、failed retry 建成明确 UI 状态机。
2. Host Game action 返回 prepared/confirmed/unconfirmed 的稳定结果，不泄漏内部错误。
3. 随机与 ID 在 command 首次执行时冻结。
4. replace 延迟时 neutral rolling 立即开始。
5. 只有 confirmed state 提供最终骰面和余额。
6. retry 复用 candidate；切聊/离开销毁当前内存 candidate。
7. 结算卡首屏按产品文案列出胜负、最终叫牌、双方骰面和余额变化。
8. reduced-motion 跳过动画，但不跳过保存确认。

最低测试保护状态转移和可观察顺序，不快照 CSS、组件文件名或整段文案。

## 9. 最终验证矩阵

| 风险 | 最低层级 | 必须证明 |
| --- | --- | --- |
| Envelope/分区隔离 | 单元 + 集成 | 坏分区不拖无关 APP，原值被保留 |
| 文件提交 | 适配集成 | no-store、base64、一次 upload、commitId 确认 |
| 跨分区资金 | 应用集成 | 业务事件与流水同一 candidate、一次 replace |
| 身份生命周期 | 宿主 fixture 集成 | 分支、重命名、复制、删除歧义 |
| Capability 权限 | 单元 | 未授权 token 和 sourceDomain 伪造被拒绝 |
| APP 故障 | Host/Frame 集成 | 图标、错误页、重试、其他 APP 可用 |
| UI lazy load | 构建 + 浏览器 | chunk 可加载/失败可回家，不做源码 includes |
| Game 时序 | 状态机 + 组件集成 | 动画先起、确认后揭示、失败冻结并同候选重试 |
| Agent | 应用集成 | 共用配置、无 enabled、打开/关开关零连接 |
| 正式兼容 | 真实 fixture | upstream fw 一次导入，测试线 OS 根完全忽略 |

最终统一运行：

    npm run test:xiaobai-os
    npm run build:xiaobai-os
    npm run lint:xiaobai-os
    npm run lint:imports
    npm run build:assistant:manifest
    npm run test:tauritavern-chat-surface
    git diff --check

若仓库脚本名称变化，以 package.json 的现行等价脚本为准，不得为满足文档虚构命令。

## 10. 每批交付说明

每批提交说明必须列出：

- 完成的稳定契约；
- 删除的旧入口；
- 尚未接生产的原因；
- 测试证明了什么、没有证明什么；
- 浏览器手验项；
- 下一批唯一接缝。

任何一批若出现“临时让 APP 取得完整 Envelope”“先双写以后再删”“先把所有东西放 bootstrap”“先静态 import 以后拆 chunk”，视为边界失败，应回到本方案修正后再施工。

## 11. 存储减负验证记录（2026-09-07）

- 自动回归：773 项 OS 测试通过。单聊、群聊各 10,000 楼的宿主适配测试证明：每次正常私信同步一次聊天保存、零额外聊天下载；首次引用安装成功也不读回聊天。
- 学习文件及公共存储：热状态读取不下载，明确保存成功不读回；覆盖本页并发、切聊迟到响应、引用变化、重进课堂、同候选恢复及奖励幂等。绑定解析结果直接安装，初次 APP 读取不会再下载一次。
- 故障回归：模拟超过 15 秒的成功响应、明确拒绝、响应丢失与核实失败，验证不自动重发、不把未知结果当成功，已确认内容仍可读。
- 本机真实文件接口探针通过：隔离临时用户目录验证上传、重开、用户隔离、坏文件保护及故障注入后的迟到写入；未操作用户聊天数据。
- 类型、lint、imports、三路构建及 diff 检查通过，受追踪构建产物已更新。画图、向量处理未改动。
- 待实测：真实浏览器中的单聊／群聊全流程与用户 VPS 长聊天耗时。本轮没有真实模型或语音服务验收，自动请求计数不代表实际 VPS 延迟。
