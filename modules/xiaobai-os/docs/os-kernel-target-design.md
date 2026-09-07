# 小白 OS Kernel 终态设计

## 1. 文档地位

本文是普通酒馆小白 OS 的底座施工契约，固定存储、聊天身份、分区事务、Capability、APP 生命周期、Shell Bridge 和 SillyTavern 适配的终态。配套施工批次见 [OS Kernel 施工方案](./os-kernel-implementation-plan.md)。

各 APP 文档继续拥有自己的领域、Prompt、工具、Controller 和 UI；凡是其中关于聊天 metadata 根、根 mutation、根 store、APP 静态总装或跨领域直接写 Economy 的描述，均由本文取代。施工者不得保留两套运行路径，也不得为了兼容未进入 upstream 的测试线实现增加旧 schema、回退读取或永久清洗器。

本文描述普通 OS，不得 import modules/tavern 下的运行时代码、数据库、Phone Session 或楼层协议。

## 2. 目标和非目标

终态必须满足：

- APP 领域数据坏了，只使拥有该分区的 APP 及依赖该分区的能力失败；
- APP Host、后台任务或 UI 加载失败时，桌面、导航和无依赖 APP 继续工作；
- APP 图标始终由 Shell 静态目录提供，失败 APP 可进入独立错误页并重试；
- 聊天业务数据全部离开 chat_metadata.extensions.LittleWhiteBox.xiaobaiOs；
- 同一业务动作涉及多个分区时只上传一次 sidecar；
- Game、Bank、Shop、Tasks 不直接读写 Economy 分区；
- Map、Tasks、Fourth Wall 使用 agent-core 的现行共享 Agent 配置；
- 不安装 server plugin，不要求修改 config.yaml。

本阶段明确不做：

- 真正同时的多设备无冲突写入；
- 为测试线旧 OS 根、旧 Economy V1 或旧 APP schema 建迁移分支；
- 把进程内队列、pending Prompt、页面状态或重试锁持久化；
- 为尚无第二个真实消费者的能力预建共享抽象；
- 事件历史压缩、清板或长期归档策略。

Sidecar 是独立于聊天 JSONL 的业务文件，通常远小于完整聊天；“小文件”不是固定字节上限承诺。各领域仍负责自己的容量不变量。

## 3. 开工前边界

| 项目 | 终态结论 |
| --- | --- |
| 功能所有者 | kernel 只拥有业务无关的身份、事务、分区、能力和生命周期；APP 拥有自己的全部业务 |
| 唯一事实来源 | APP 事实位于 sidecar 对应分区；余额只来自 Economy 分区流水；共享 Agent 配置仍来自 agent-core |
| 持久态 | osId 引用、sidecar envelope、APP 分区、尽力维护的 sidecar 索引 |
| 临时态 | 缓存、写队列、APP 状态、AbortController、staging、未确认候选、UI 路由和错误对象 |
| 外部依赖 | SillyTavern 1.18 context/events、user files 接口、聊天 metadata 一次性引用、iframe、agent-core |
| 注册入口 | Kernel bootstrap、Capability catalog、Host APP catalog、Shell APP catalog |
| 删除路径 | 删除 APP 目录和两处 catalog 项，按产品策略清分区；不留旧类型或回退读取 |
| 真实兼容对象 | SillyTavern、浏览器/WebView、共享 Agent 配置、upstream 已上线 Fourth Wall 数据 |
| 最少测试 | 分区隔离、跨分区单提交、超时确认、聊天生命周期、模块故障、Game 保存时序 |

## 4. 终态目录与依赖方向

    modules/xiaobai-os/
    ├─ kernel/
    │  ├─ contracts.ts                 公共 JSON、状态和错误契约
    │  ├─ envelope.ts                  Envelope 严格解析和序列化
    │  ├─ partition-registry.ts        分区所有权、解析器和初始值
    │  ├─ transaction-coordinator.ts   会话内确认版本、单页 FIFO、候选提交和恢复
    │  ├─ capability-registry.ts       能力注册、依赖解析和事务绑定
    │  ├─ app-registry.ts              Host APP 安装、激活、失败和重试
    │  └─ execution-scope.ts           受监管异步任务和取消
    ├─ storage/
    │  ├─ storage-port.ts              Kernel 所见的文件存储端口
    │  ├─ sillytavern-file-storage.ts  user files 接口适配
    │  ├─ chat-reference.ts            metadata 中 osId 引用的安装和确认
    │  ├─ chat-binding.ts              当前聊天 locator、重命名和复制判定
    │  └─ sidecar-index.ts             尽力维护的删除/孤儿清理索引
    ├─ capabilities/
    │  ├─ economy/                     Economy 分区服务与事务能力
    │  ├─ agent/                       共享 Agent 配置与 Provider 会话
    │  └─ maintenance/                 接受轮 FIFO 和 participant 编排
    ├─ host/
    │  ├─ bootstrap.ts                 薄生产组合入口
    │  ├─ lifecycle.ts                 SillyTavern 入口和 OS 窗口
    │  └─ frame-bridge.ts              可信 Host/Frame 消息
    ├─ apps/<app>/
    │  ├─ module.ts                    分区、能力依赖和 Host runtime 注册
    │  ├─ application/                 业务命令和事务组合
    │  ├─ host/                        SillyTavern 适配与 Controller
    │  ├─ ui/entry.ts                  Shell 懒加载入口
    │  └─ ui/                          APP 组件
    ├─ domains/<domain>/               纯领域模型、事件、不变量和投影
    └─ shell/
       ├─ app-catalog.ts               静态图标、描述和 UI loader
       ├─ AppBoundary.vue              APP loading/failed/ready 边界
       └─ ...

依赖只能向内：

    SillyTavern adapter → Kernel ← APP module
                               ← Capability implementation
    Shell → Frame protocol
    APP application → 自有 domain + 获准 Capability
    Kernel -X→ Game / Shop / Map / Tasks 类型

bootstrap 仍然存在，但只注册 catalog 和宿主端口；不得继续逐项构造每个 Controller、Repository、Prompt runtime 和业务依赖。

Host module 与 UI loader 必须物理分开。Host bundle 不 import Vue APP，Shell catalog 不 import Host service。两者共享同一 descriptor 常量。

## 5. Sidecar Envelope

### 5.1 聊天引用

chat metadata 只允许保存：

    interface XiaobaiOsReferenceV1 {
        formatVersion: 1;
        osId: string;
    }

路径固定为：

    chat_metadata.extensions.LittleWhiteBox.xiaobaiOsRef

该引用只在首次产生持久 OS 数据、建立分支副本或处理复制冲突时写入。日常 APP 操作不得调用聊天保存。

旧路径 chat_metadata.extensions.LittleWhiteBox.xiaobaiOs 不读取、不迁移。切换完成后可在当前聊天引用安装成功时顺带删除；删除失败不能让运行时重新读取它。

### 5.2 文件名和格式

文件名固定为：

    LittleWhiteBox_OS_<osId>.json

osId 是与聊天名、角色名、avatar 和 groupId 无关的随机稳定 ID，只使用 SillyTavern 文件名允许的字母、数字、下划线和连字符。不得使用 identity hash 作为永久 ID。

    interface XiaobaiOsSidecarV1 {
        formatVersion: 1;
        osId: string;
        binding: XiaobaiOsChatBindingV1;
        revision: number;
        commitId: string;
        partitions: Record<string, unknown>;
    }

    interface XiaobaiOsChatBindingV1 {
        kind: 'character' | 'group';
        ownerLocator: string;
        chatId: string;
    }

Envelope 严格验证字段、类型、osId、非负 revision 和 commitId。partitions 只要求是普通 JSON object；Kernel 不解析其内部业务结构。

`ownerLocator`在单聊中取 SillyTavern 当前 character avatar 标识，在群聊中取 groupId；`chatId`取该 owner 下的聊天文件标识。它们只用于核对当前引用、处理重命名和清理，不参与 sidecar 文件名，也不是业务主键。聊天或角色重命名只更新 binding，不能更换 osId。

单个分区应自行携带 schemaVersion。Partition parser 只认当前格式，不得在日常读取中清洗旧字段。未来真实发布后的升级只能在明确升级入口一次性完成。

### 5.3 故障范围

- Envelope JSON、formatVersion、osId 或 partitions 容器无效：该聊天整个 OS 进入 storage failed；
- 某分区解析失败：只使分区所有者和硬依赖它的 APP 失败，原始 JSON 原样保留；
- 无关 APP 提交时不得解析、删除、规范化或重排坏分区；
- Capability 分区失败只影响依赖该 Capability 的 APP。例如 Economy 失败会影响 Wallet、Bank、Game、Shop、Tasks，不影响 Map、Fourth Wall 和 Agent API；
- 未确认写入和真实 sidecar 冲突属于文件级状态。因为所有分区共用一个原子文件，它会冻结该聊天的全部新写入，但不阻止已确认状态的只读投影和 APP 导航。

## 6. SillyTavern 文件存储端口

稳定契约：

    interface XiaobaiOsStoragePort {
        read(osId: string, signal?: AbortSignal): Promise<XiaobaiOsSidecarV1 | null>;
        replace(input: StorageReplaceInput, signal?: AbortSignal): Promise<StorageReplaceResult>;
        delete(osId: string, signal?: AbortSignal): Promise<'deleted' | 'missing'>;
    }

    interface SidecarRevision {
        osId: string;
        revision: number;
        commitId: string;
    }

    interface StorageReplaceInput {
        expected: SidecarRevision | null;
        candidate: XiaobaiOsSidecarV1;
    }

    interface StorageFailure {
        code: string;
        message: string;
        retryable: boolean;
    }

    type StorageReplaceResult =
        | { status: 'confirmed' }
        | { status: 'failed'; error: StorageFailure }
        | { status: 'unconfirmed'; observed: XiaobaiOsSidecarV1 | null }
        | { status: 'conflict'; observed: XiaobaiOsSidecarV1 };

适配规则：

- read 使用 /user/files/<filename>，同时设置 cache: no-store 并追加不可复用的查询参数；
- 404 返回 null；其他 HTTP、JSON 和 Envelope 错误不得伪装成缺失；
- replace 将 UTF-8 JSON 转为 base64，调用 /api/files/upload；`expected`只用于结果分类，不冒充服务端条件写；首次创建时为`null`；
- SillyTavern 端使用 write-file-atomic，因此只承诺单文件原子替换；
- 成功响应表示 confirmed；
- 请求在发送前被明确拒绝，或服务端返回能证明未接纳写入的错误时为 failed；任何可能已到达服务端的网络/超时错误都不得归为 failed；
- 请求超时或网络结果未知时立即以 no-store 读回：commitId 与 candidate 相同为 confirmed；读回与 expected 不同且也不是 candidate 时为 conflict；读回仍是 expected、文件仍缺失或读回本身失败时均为 unconfirmed，因为原请求仍可能迟到落盘；
- unconfirmed 不自动重发，不重新执行业务命令，不重新生成随机数或 ID；
- delete 使用 /api/files/delete，404 视为 missing；
- 不存在 ETag、If-Match 或服务端 CAS。revision 是客户端冲突检测，不得在 UI 或文档中宣传成并发锁。

以当前页面的单个活跃写入会话为边界，不额外支持跨设备/标签页同时编辑。当前聊天首次解析后复用协调器持有的已确认 Envelope，日常 APP 读取和事务不再下载文件；切聊/改名/分支重新解析，重开同聊天 OS、focus/visibility 不发起对账。切走释放普通缓存，未确认候选及其旧事实仍按原聊天保留。显式刷新及异常恢复才重新读取服务器。

文件写入默认没有 15 秒客户端截止；发送前取消不写，发送后不因关闭 APP 中止或重发。首次安装聊天引用由 OS 宿主保存适配调用原生聊天 HTTP 协议，保留请求压缩和 integrity，明确成功响应即确认；异常才读回引用，不修改宿主或增加全局请求拦截。

## 7. 分区注册与事务

### 7.1 分区注册

    interface PartitionRegistration<T> {
        key: string;
        ownerId: string;
        schemaVersion: number;
        parse(value: unknown): PartitionParseResult<T>;
        serialize(value: T): unknown;
        createInitial(): T;
    }

    type PartitionParseResult<T> =
        | { ok: true; value: T }
        | { ok: false; error: { code: 'partition_invalid'; message: string } };

规则：

- key 全局唯一，ownerId 必须等于注册它的 APP 或 Capability；
- parse 不修改输入，失败返回结构化`partition_invalid`而不是抛出未归属异常；
- serialize 必须返回可独立 JSON 序列化的值；Kernel 在上传前拒绝循环引用、`undefined`、非有限数字和其他非 JSON 值；
- createInitial 只在所有者明确请求初始化时调用，打开 APP 不自动写文件；
- Kernel 保存未知分区和坏分区的原始 JSON；
- APP 卸载清理可按 key 删除原始分区，不要求旧 parser 仍存在。

### 7.2 Scoped Store

APP 安装后只获得自己分区的 ScopedChatStore。它不能取得 Envelope、其他分区表或按字符串查询任意分区。

    interface ScopedChatStore<T> {
        read(): Promise<PartitionSnapshot<T>>;
        transact<R>(
            command: (context: ScopedTransaction<T>) => R | Promise<R>,
            options?: TransactionOptions,
        ): Promise<ScopedTransactionResult<T, R>>;
        subscribe(listener: (snapshot: PartitionSnapshot<T>) => void): () => void;
    }

    interface PartitionSnapshot<T> {
        osId: string | null;
        envelopeRevision: number | null;
        value: T | null;
    }

    interface ScopedTransaction<T> {
        readonly current: T | null;
        currentOrInitial(): T;
        replace(next: T): void;
        useCapability<C>(token: CapabilityToken<C>): C;
    }

    interface TransactionOptions {
        signal?: AbortSignal;
        commitGuard?: () => boolean | Promise<boolean>;
    }

    interface KernelWriteFailure {
        code: string;
        message: string;
        retryable: boolean;
    }

    type ScopedTransactionResult<T, R> =
        | { status: 'unchanged'; result: R }
        | { status: 'confirmed'; result: R; snapshot: PartitionSnapshot<T> }
        | { status: 'failed'; error: KernelWriteFailure }
        | { status: 'unconfirmed'; preparedResult: R; commitId: string }
        | { status: 'conflict'; preparedResult: R };

`currentOrInitial()`只构造所有者声明的初值，不自动标记写入；只有`replace(next)`产生 candidate。`useCapability()`只能解析 APP manifest 已声明的 token，事务型 Capability 获得绑定到本次 candidate 的私有实例。command 看不到 Envelope、原始 partitions 或其他 APP 的值。

事务固定时序：

1. 在单页面 FIFO 中取得写权；
2. 捕获当前聊天引用和 binding；
3. 使用当前聊天已确认 Envelope；未加载时先等待绑定解析并加载一次；
4. 确认 osId、当前聊天和文件级 write state；
5. 只解析所有者分区及本动作实际使用的 Capability 分区；
6. 执行领域命令、actionId 幂等和分区 CAS；
7. Capability 在同一个内存 candidate 中写其拥有的分区；
8. 运行各所有者声明的本地和跨分区检查；
9. 再次检查聊天、APP token、主生成 guard 或 participant guard；
10. revision 加一、生成一个 commitId，原样带上所有未参与分区；
11. 只调用一次 replace；
12. confirmed 后发布新 snapshot；明确失败恢复旧缓存；unconfirmed/conflict 冻结文件级写入。

业务 command 只执行一次。保存重试复用已序列化 candidate，不重新进入 command callback。

APP 自己的 revision/eventId 检查仍保留，防止本页过期动作覆盖新事实。Envelope revision/commitId 用于本地顺序和异常核实，不能替代领域检查，也不是服务端并发锁。

### 7.3 文件级状态与恢复

Kernel 向 Host/Shell 暴露只读文件状态`loading | ready | saving | unconfirmed | conflict | failed`和三项集中动作：重新强读、重试同一 candidate、采用已观察到的服务端 sidecar。APP 只能订阅状态，不能各自实现确认器。

- 重试先强读：读到 candidate 即确认；读到 expected 才允许重传同一序列化 candidate；读到第三个 commit 进入 conflict；
- “采用服务端数据”只在 observed Envelope 已严格验证后安装它并丢弃本地 candidate；读取或验证失败继续 conflict；
- unconfirmed/conflict 冻结当前聊天全部新写入，不把文件状态持久化；
- 普通领域错误不改变文件状态，Envelope 无效或引用/身份冲突才是 Kernel 级失败。

## 8. Capability

    interface CapabilityToken<T> {
        readonly id: string;
    }

    interface CapabilityRegistration<T> {
        token: CapabilityToken<T>;
        ownerId: string;
        dependencies: readonly CapabilityToken<unknown>[];
        install(context: CapabilityInstallContext): T | Promise<T>;
        dispose?(instance: T): void | Promise<void>;
    }

Capability Registry 在启动时解析真实注册图，拒绝重复 ID、缺失依赖和环。APP module 只能取得 manifest 中声明的 token；事务中的 capability instance 由 Kernel 绑定到当前 candidate。未获授权的 token 即使由代码 import，也必须在运行时拒绝。

这是一条代码所有权边界，不是针对恶意第三方脚本的安全沙箱。

### 8.1 Economy Capability

Economy 分区和流水规则由 capabilities/economy 与 domains/economy 共同拥有。消费者只见窄接口：

    interface EconomyReadCapability {
        getPlayerBalance(): number;
        listTransactions(query: EconomyQuery): EconomyPage;
    }

    interface EconomyTransactionCapability {
        getPlayerBalance(): number;
        postAction(input: EconomyActionInput): EconomyActionResult;
        listOwnedTransactions(): readonly EconomyTransaction[];
        getAccountBalance(accountId: string): number;
    }

绑定时注入 caller domain，消费者不能伪造 sourceDomain，也不能取得可写 Ledger。Game、Bank、Shop、Tasks 在自己的 Scoped transaction 中调用它；Kernel 将业务分区和 Economy 分区作为一个 candidate、一个 commitId、一次上传。

Wallet 只获得只读能力，不拥有余额或第二份流水。

### 8.2 Agent Capability

Agent Capability 继续读写 agent-core 的用户级共享配置，不创建 sidecar 分区，不保留 enabled 分叉。Agent API APP 是设置界面；Map、Tasks、Fourth Wall 是调用者。

“尚未配置模型/API key”是一次操作的可见结果，不是 Capability 安装失败。打开 Map、Tasks 或 Agent API 不得自动连接供应商。

### 8.3 Maintenance Capability

Maintenance 只拥有接受轮捕获、FIFO、Provider tool loop、取消和提交 guard。Map、Tasks 各自注册 Prompt、工具、Session、staging 和 commit。核心不得 import Map/Tasks 领域类型，也不得拥有通用写任意分区工具。

## 9. APP module 与故障隔离

Host 契约：

    interface XiaobaiOsAppModule {
        descriptor: XiaobaiOsAppDescriptor;
        partition?: PartitionRegistration<unknown>;
        capabilities: readonly CapabilityToken<unknown>[];
        install(context: AppInstallContext): Promise<XiaobaiOsAppRuntime>;
        dispose?(runtime: XiaobaiOsAppRuntime): Promise<void>;
        clearData?(context: AppDataCleanupContext): Promise<void>;
    }

Shell 契约：

    interface XiaobaiOsShellAppEntry {
        descriptor: XiaobaiOsAppDescriptor;
        loadUi(): Promise<Component>;
    }

Shell catalog 静态包含图标和描述，loadUi 使用动态 import。Host APP catalog 和 Shell catalog 必须引用同一个 descriptor；构建检查验证两边 ID 完全一致。

APP 状态：

    type AppStatus =
        | { state: 'loading'; phase: AppFailurePhase }
        | { state: 'ready' }
        | { state: 'failed'; failure: AppFailure };

    type AppFailurePhase =
        | 'install'
        | 'dependency'
        | 'partition'
        | 'activate'
        | 'background'
        | 'ui-load'
        | 'ui-render';

    interface AppFailure {
        code: string;
        message: string;
        phase: AppFailurePhase;
        retryable: boolean;
    }

边界规则：

- 图标不因 Host 安装失败或 UI chunk 失败消失；
- 点击后立即进入 APP route，先显示本 APP loading；
- Host 或 UI 任一失败只替换当前 APP 内容为错误页，Home/Back/Close 始终可用；
- 重试只重新安装/激活/加载该 APP，不重启其他 APP；
- 缺失 Capability 只使硬依赖它的 APP failed；
- 领域输入错误、余额不足、CAS 冲突和 Agent 未配置是普通操作结果，不把 APP 标为 failed；
- 分区解析失败、未捕获的 Host 异常、受监管后台 rejection 和 UI render 异常才进入 failed；
- Vue AppBoundary 捕获组件错误；全局 frame error handler 必须能归属当前 APP；
- XiaobaiOsAppRuntime 的异步生命周期返回 Promise，由 registry await 或 Promise.resolve 捕获；
- APP 内 fire-and-forget 必须通过 execution scope 启动，绑定 AbortSignal 和 failure sink，不允许裸 void promise 逃出故障边界。

## 10. Frame Bridge

初始化快照只包含：

- theme；
- 当前聊天展示信息；
- 静态 APP descriptor；
- 每个 Host APP 的 loading/ready/failed 状态。
- 可选的一次性 APP 入口 `initialAppId`，用于快捷面板直达；不保存导航历史。
- 用户级 `appOrder` 展示偏好；不属于任何聊天分区。

Frame 不接收 sidecar、Agent API key、其他 APP 分区或 Kernel 内部错误对象。Host 返回稳定 code 和本地化 message；完整 cause/stack 只写内部日志。

每条 APP 消息必须带 appId、activation token 和 requestId。Host 只把消息路由给当前激活实例；切 APP、切聊和关闭窗口会使旧 token 失效。迟到响应不得更新新页面。

### 10.1 快捷启动与桌面

- 聊天栏 OS 按钮展开非模态快捷面板，显示当前可用 APP 中桌面顺序的前六个，三列两行；右上展开按钮打开桌面。无聊天时沿用进入聊天的提示。
- 默认顺序为信息、四次元壁、语伴、地图、世界、任务、商店、钱包、银行、游戏、API。桌面与面板共用 `shell/app-launchers.ts` 的名称、图标和顺序；该模块不引入组件或运行时。
- `host/quick-launcher.ts` 只拥有面板 DOM、定位、键盘与展开状态；复用 Host 生命周期打开窗口。展开只用静态入口，不创建 iframe、不激活 APP、不读业务存档。点击 APP 后通过初始化入口直接进入既有激活流程；窗口已就绪时使用 `os/navigate`。
- 面板使用局部清透表面、短时 opacity/transform 过渡，不加全屏遮罩；动效过程中可以点选和反向收起。点击外部、Esc、切聊天和卸载关闭面板，关闭时移除定位与交互监听。
- 展开状态和初始目标均是临时态。删除快捷面板只需删除面板文件、样式引用和生命周期接线；没有面板专用存档。APP 内返回见 §10.3。

### 10.2 用户整理桌面

- 功能归 Shell：`shell/app-order.ts` 负责顺序，桌面组件负责整理界面和拖动；Host 只通过现有设置仓库保存并通知面板／Frame。没有新增依赖或 APP 注册。
- 唯一持久态为 `xiaobaiOs.appOrder`：用户的完整 APP ID 顺序，跨聊天、关闭和重启保留，因此不能仅作为临时态。空数组表示默认排序；新增 APP 排在保存顺序后，暂不可用 APP 保留其位置。恢复默认清除此偏好，不影响其他设置。
- 长按图标约 420ms 进入整理；鼠标也可直接拖动。图标浮起，邻居让位，松手一次保存。顶部仅显示「恢复默认」「完成」，不另开配置页面；键盘 F2／空格进入、方向键移动、空格／Esc 完成。普通点击仍打开 APP。
- 触屏长按前保留原生滚动，拖动靠近上下边缘自动滚动。取消、失焦、隐藏页面、卸载和切聊天清除手势；拖动中间位置不保存。动效遵守 reduced motion，标签支持文字放大和换行。
- 编辑状态、拖动草稿、浮动图标和失败重试参数只属于当前页面。沿用宿主普通偏好保存语义：先在内存生效，再交给现有保存接口；失败保留本次顺序并就地重试，仍可完成整理和打开 APP，不读回聊天、不调用模型、不弹循环通知。未保存的拖动取消后恢复上次顺序。
- 已保存顺序同时用于桌面与可用 APP 前六个快捷入口，不保存第二份快捷列表。切聊天不重排；晚到保存结果不得回写新 Frame。
- 删除排序功能时移除 Shell 排序／手势文件及 Host 协议接线，并在设置准备入口移除 `appOrder`；不需要聊天数据迁移或兼容旧排序协议。

### 10.3 单步返回与 Home

- 返回／Escape 先交给当前 APP：最上层弹层、二级页面、APP 首页，依次退出；APP 首页再回桌面。Home 直接卸载 APP 回桌面，不逐层触发业务动作。桌面整理中，返回／Home 完成整理；普通桌面的返回禁用。
- Shell 只持有当前挂载 APP 的返回作用域，不认识 APP 页名。各 APP 在 UI 内通过 `useAppBack` 注册消费规则；子层优先，卸载自动注销。激活序号隔离离场动画中的旧组件；加载／错误页可以直接返回桌面。
- `AppDialog` / `useAppLayer` 只处理 APP 内的遮罩、焦点与背景 inert，保留系统导航可点击、可键盘到达。不开原生全窗口 modal，不使用全局 document 键盘监听；忙碌确认框消费返回但不关闭，Home 仍可离开，保存语义不变。
- 弹层依次尝试可用的 `autofocus`、普通控件、容器。返回后若旧控件消失导致焦点丢失，在 DOM 更新后恢复到原入口或当前 APP／弹层；已有的新焦点不覆盖。入口引用只随本次 UI 注册存续，已卸载组件不恢复焦点。
- 页入口、列表滚动、弹层与输入均为当前 UI 临时态；没有新增导航存档、浏览器 history、Host 请求或跨 APP 缓存。删除 APP 同时删除其返回注册即可；不需要数据清理／迁移。

| APP | 返回关系 |
| --- | --- |
| 信息 | 图片预览／确认框 → 对话 → 联系人；删除确认先回联系人详情，补记确认先回同步说明 |
| 四次元壁 | 提示词编辑 → 设置 → 对话；消息编辑先取消编辑 |
| 语伴 | 确认／课件 → 打开入口；选老师 → 选语言 → 原页面；记录详情 → 列表；辅助页 → 老师 |
| 地图 | 设置／搜索 → 图例 → 场景 → 世界地点详情 → 当前区域 → 上级区域 |
| 世界 | 菜单 → 文章 → 新闻列表，恢复原阅读入口与滚动 |
| 任务 | 确认 → 当前表单／详情；详情回真实入口，招募／发布回我发布；主栏目回发现 |
| 商店／银行 | 确认 → 商品详情／当前栏目 → 逛店／总览 |
| 钱包／游戏 | 账单 → 钱包；游戏房间／记录 → 大厅，不触发投注或结算 |
| Agent API | 现有单页配置，直接回桌面；不把表单折叠项伪装成页面 |

返回不请求模型、不隐式保存；学习记录详情沿现有本地读取回到列表，收起课件沿现有停止播放动作。老师输入、联系人筛选／草稿、文章及商品的列表位置保留；已离开题目／游戏房间时，迟到结果不强行切回旧页面。

## 11. 聊天身份与生命周期

### 11.1 首次建立

- 只读空 APP 不创建引用或 sidecar；
- 首次持久写先生成 osId 和初始 Envelope；
- 初始 sidecar 成功写入后，再把 xiaobaiOsRef 写进当前聊天 metadata；
- metadata 明确失败时删除刚建立的孤儿 sidecar；删除失败记入索引待清理；
- metadata 保存结果未知时读回聊天头确认引用，不能生成第二个 osId；
- 引用已存在但文件缺失时进入可重试 storage_missing，不静默创建空数据覆盖可能的服务端故障。

### 11.2 分支

SillyTavern 内建分支的新 metadata 通常只带 main_chat，不能依赖 CHAT_CREATED 或“消息数量大于一”判断。

打开无 xiaobaiOsRef、但存在 main_chat 的新聊天时：

1. 用当前 owner locator 和 main_chat 读取父聊天 header；
2. 读取父 xiaobaiOsRef 和已确认 sidecar；
3. 复制 partitions，调用组合层提供的同步 `prepareClonedPartitions` 窄回调，再生成新 osId、binding、revision 0 和新 commitId；回调在第一次子文件写入前执行，不重新处理已冻结的重试 candidate；
4. 先保存子 sidecar，再安装子聊天引用；
5. 任一步失败不修改父 sidecar，也不让父子共享 osId。

默认领域 revision、事件和余额原样复制；Envelope revision 重新开始。经济时点不按消息前缀猜测回滚。只有具有真实历史证据和业务需要的功能解释自己的复制规则：当前 Messages 根据子聊天私人信息标记裁剪私聊前缀，见其终态设计；Kernel 不识别消息标记，不解析业务分区。此后两个 sidecar 独立推进。

### 11.3 重命名、复制和导入

- CHAT_RENAMED：引用和 osId 不变，只更新 sidecar binding 与索引；
- CHARACTER_RENAMED：不批量改文件名；已知索引 binding 尽力更新，具体聊天下次访问时再校正；
- 若当前 metadata 引用的 osId 已绑定另一个仍存在的聊天，视为复制/导入，克隆为新 osId；
- 若旧 binding 对应聊天已不存在，且引用仍是当前聊天持有，视为错过事件的重命名，保留 osId 并更新 binding；
- 无法判定时不得让两个聊天继续共享可写 sidecar，进入 identity_conflict 并要求重试/选择，不凭猜测覆盖。

### 11.4 删除

CHAT_DELETED/GROUP_CHAT_DELETED 事件可能只给聊天文件名。Kernel 只在索引能唯一解析 owner + chatId + osId 时删除 sidecar。多个 owner 同名、宿主读取失败或索引缺失时保留孤儿，不冒险删除。

索引文件固定为 LittleWhiteBox_OS_index.json，只保存`formatVersion: 1`和`entries: Record<osId, XiaobaiOsChatBindingV1>`。它只用于重命名、删除和孤儿清理，不保存分区、revision 或业务快照，也不是读取数据的唯一事实来源。索引更新使用独立的尽力写队列；冲突、损坏或保存失败只记录日志并从以后访问的聊天逐步重建，不得阻断 sidecar 读取或业务提交。SillyTavern 没有 user files 枚举接口，因此不能承诺扫描找回或清理全部孤儿。

## 12. Game 动画与提交

Game 点击确认后的时序固定为：

    关闭确认框
    → 立即开始不暴露最终骰面的中性动画
    → 事务使用协调器最新已确认 sidecar
    → 校验 Game/Economy/CAS
    → 只生成一次随机结果、ID 和 candidate
    → 上传并确认 commitId
    → 同时满足“已确认保存”和“最短动画结束”
    → 展示最终骰面、胜负、叫牌和余额变化

最终结果文案首先明确：

- 你赢了或你输了；
- 你叫了几个几、最终挑战者；
- 双方骰面；
- 本局余额变化和最新余额。

保存明确失败：

- 不把候选冒充成已完成赌局；
- 页面显示“本局结果尚未保存”及重试；
- 冻结本局后继动作和新开局；
- 当前运行内保留同一个已序列化 candidate、actionId、commitId 和随机结果；
- 重试只提交该 candidate，不重新执行游戏命令；

保存结果 unconfirmed 时显示“落账待核实”，按 commitId 强读确认；不能把未知结果称为明确失败。关闭 OS 窗口不会销毁 Host 内的 pending candidate，切回同一聊天仍可继续恢复。只有整个页面运行结束才会丢失纯内存候选。再次加载时只能沿聊天中已确认的引用强读服务端：已有引用的聊天会读到新事实或旧事实；首次 sidecar 若连引用都未确认，则只能在引用实际落盘时找回，否则该无引用文件是待索引清理的孤儿。任何情况都不得凭空重建随机结果。

存储慢只延迟最终揭示，不得阻止动画起步，也不得显示虚假的最终骰面。

## 13. 兼容、升级和删除

测试线旧 OS 业务根没有真实用户，不进入新 sidecar：

- 不读取 xiaobaiOs；
- 不迁移 Economy V1；
- 不保留 schemaVersion 2 根类型；
- 不双写 metadata 与 sidecar。

upstream 已上线的旧 Fourth Wall 是单独的真实兼容对象。对“没有 xiaobaiOsRef 且存在合法旧 fw”的聊天，Kernel 在任何新 sidecar 写入前把控制权交给 Fourth Wall 导入器；不能先由其他 APP 建立空 sidecar 而漏掉 fw。导入器使用真实 fixture 构造 fourthWall 分区，先确认 sidecar，再在同一次聊天 metadata 保存中安装引用并删除旧 fw；任一步未确认都保留旧数据且不生成第二个 osId。成功后该聊天运行时只读 fourthWall 分区，不再探测旧 fw。

若旧 fw 本身无法按冻结 upstream 格式解析，导入器原样保留它且不写入 fourthWall 分区；该错误只在打开 Fourth Wall 时进入其 APP 错误页，不能阻断 Wallet、Game、Map 等其他 APP 建立和使用 sidecar。Kernel 不猜测或清洗损坏的 Fourth Wall 业务数据。

这段兼容代码归 Fourth Wall 所有，只在“无引用 + 有 upstream fw”升级入口运行，不进入 Kernel 的日常读写路径。退出条件是产品明确不再支持从含旧 fw 的 upstream 版本直接升级；达到该发布边界后连同真实 fixture 和导入分支一起删除，不能永久保留。

删除 APP：

1. 先由产品确定未结资金、激活效果和任务 escrow 的处理；
2. 用 privileged cleanup 按分区 key 删除原始 JSON，不依赖 APP parser；
3. 删除 Host catalog 和 Shell catalog 项；
4. 删除 APP、domain、Prompt、工具和测试目录；
5. 若无任何分区且无保留数据，删除 sidecar、引用和索引项；
6. 不留旧 API、空图标、兼容类型或永久迁移壳。

## 14. 验收基准

底座完成必须同时证明：

- 坏 Game 分区不影响 Map/Fourth Wall，坏 Economy 只影响其真实依赖者；
- 无关分区在其他 APP 提交后保持 JSON value 深相等，不要求对象键顺序或文件字节完全一致；
- Game + Economy、Shop + Economy、Bank + Economy、Tasks + Economy 各自只产生一次 replace；
- 当前激活期读写共用已确认版本；首次加载、明确刷新、异常恢复才读服务器，不承诺多端同时编辑；
- timeout 以 commitId 确认，重试不重新执行业务命令；
- 分支得到独立 osId 和创建时分区副本；重命名保留 osId；删除歧义不误删；
- index 损坏不影响通过 metadata 引用加载聊天数据；
- Host install、后台 rejection、UI chunk 和 UI render 失败均保留图标及导航；
- 缺 Agent 配置不阻止 Map/Tasks 打开，不触发隐式连接；
- Game 在人为延迟 replace 时立即开始中性动画，最终结果只在确认后出现；
- 不存在生产双存储、旧 OS 根回退或 modules/tavern 运行时依赖。
