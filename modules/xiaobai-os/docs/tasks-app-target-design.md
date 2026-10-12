# Tasks APP 终态设计

## 0. 文档用途

本文定义 Tasks 的产品、领域、工具、资金与保存契约。底座见 [Kernel](./os-kernel-target-design.md)，资金范围见 [Economy 平台](./economy-platform-target-design.md)；任务模型不再使用旧 metadata 业务根。实现入口由 module、partition 与 Host/Shell catalog 注册，不另保留施工文档。

## 1. 定位与不可越界项

Tasks 是围绕钱包建立的正式委托终端，包含三条产品链：

1. 从世界任务大厅刷新、查看并接取委托；
2. 玩家锁定自己的小白币发布委托，再招募并选择世界角色承接；
3. 对已经进入`active`的任务，在用户接受一轮 RP 后由 Agent 判断进展、完成或失败。

Agent 只负责提出任务文本、候选人文本和活动任务的高层状态意图。任务状态机、ID、CAS、账户、金额、资金方向和最终保存全部由普通 OS 的确定性代码决定。

以下边界不可更改：

- 普通 OS Tasks 独立拥有`domains/tasks`、`apps/tasks`、Prompt、工具、Session、Controller 和 UI；
- 不 import、调用或读写`modules/tavern/**`运行时代码、Tavern DB、Session、Phone boundary、manager run 或任务版本表；
- 任务与资金一旦保存就是 OS 事实，编辑/删除旧消息、换 swipe 或切分支都不自动回滚任务和 Economy；
- 自动维护默认关闭，只在`MESSAGE_SENT`已保存 User 后处理上一接受轮；Assistant、swipe、regenerate、continue、打开 APP 和切页均不触发；
- 打开 APP、关闭开关、接取、发布、选人和撤回均不读取 Agent 配置、不调用 API；
- Tasks 不提供“从聊天重建任务”。已经托管或结算的合同不能从剧情重新推导；
- 测试线没有 Tasks 历史 schema，不保留旧字段、双读、兼容壳或 Tavern 数据迁移。

## 2. 宿主边界

小白酒馆只是体验参考，不是运行依赖。Tasks 使用普通 OS 的 accepted-turn 来源、分区事务与 Capability，不移植 Tavern 版本表、Phone boundary、manager、回滚或租约。

## 3. 所有权与生命周期

| 项目 | 唯一答案 |
| --- | --- |
| 功能所有者 | `domains/tasks`拥有任务格式、事件状态机和纯投影；`apps/tasks`拥有 generation、application、maintenance、host 和 UI |
| 唯一事实来源 | `TaskDomainV1.events`是任务状态来源；`TaskDomainV1.board`是当前未接取候选快照；Economy 流水是资金来源 |
| 持久态 | board、任务事件、创建时冻结事实、候选人、出资/执行方、最近观察到的 Assistant 回复数 |
| 临时态 | 表单草稿、页面路由、筛选/分页、API 请求、AbortController、maintenance staging、运行错误和状态提示 |
| 外部依赖 | ScopedChatStore、Economy/Agent/Maintenance Capability、SillyTavern 当前聊天/角色/世界书和主生成生命周期 |
| 注册入口 | Tasks module、`tasks`分区 parser、Capability 依赖、participant、prompt runtime、Host/Shell catalog |
| 删除路径 | 先结清所有非终态 escrow，再删`apps/tasks`、`domains/tasks`及两处 catalog/participant 注册并清理`tasks`分区；既有 Economy 流水按产品策略保留 |
| 真实兼容对象 | SillyTavern、浏览器/WebView、共享供应商协议；受支持文件和经济升级以存储入口为准，不为测试线旧根保留日常读取分支 |
| 最少必要测试 | 状态转移、响应编译、CAS/幂等、escrow 原子性、Session staging、零隐式 API、接受轮/取消/保存、关键 UI 浏览器路径 |

## 4. 产品流程

### 4.1 世界任务大厅

大厅第一次打开只显示本地空状态。只有用户点击「刷新任务」才加载共享 Agent 配置并请求一次任务列表。

一次完整结果按下列顺序各生成一项：

| 方向 | 生成语义 | reward 闭区间 |
| --- | --- | ---: |
| 禁忌 | 见不得光且高报酬，玩家会沾上具体代价 | 150–350 |
| 接触 | 看管、运送或陪同有吸引力/危险的目标，强调近距离相处 | 40–80 |
| 夹缝 | 两股势力暗中争夺，玩家可选边或利用双方 | 100–200 |
| 窥秘 | 光鲜事物背后有不对劲的事实，越查越深 | 60–120 |
| 掠夺 | 稀缺目标引来竞争者，成功独占、失败损失 | 80–150 |
| 怪癖 | 离谱要求被严肃对待，表面可笑而内里不安 | 15–40 |

这张表是当前 board 生成与替换入口的产品策略，不是读取历史时反复执行的判决器。Agent 新提交的 listing 必须满足当前方向、报酬区间、grade、posture/timing 和排序规则；结果保存后，其字段是已发布事实，后续加载只按 V1 canonical 合同验证，不因产品策略调整而失效。

任务字段语义：

- `objective`是唯一完成目标，只能有一个可判定动作；禁止“调查真相”“处理此事”等没有终点的表述；
- `requirements`只约束执行方式，不增加第二目标；
- `location`是目标行动真正发生的地点，不是宽泛世界区域；
- `timing`只能是`现在就行`、`任意时候`或`特定时机：具体条件`；
- `posture`描述玩家把任务带入 RP 所需的介入成本，完整 board 配额为易介入 3、中介入 2、深介入 1；易介入不能要求特定时机；
- `hook`负责吸引力和关系冲突，不能取代 objective；
- reward 必须落在方向区间；grade 只按最终 reward 派生：E 5–15、D 16–40、C 41–100、B 101–250、A 251–600、S 601–1500、EX 1501–5000；
- 生成内容不得宣称候选任务已经发生，也不得把没有设定依据的陌生角色写成玩家熟人。

刷新只替换当前 board，不创建任务、不产生资金。接取时从当前 board 复制完整 listing 创建`active`任务。世界出资方不是模型字段：代码固定创建`partyId = "board:" + taskId`、展示名“任务终端托管”、说明“匿名委托报酬的内部结算来源”，再由`counterparty:task:board:<taskId>`把 listing 的固定 reward 转入该任务 escrow。board 本身不删除，UI 根据任务来源标记已接取项。

同一`boardId + listingId`最多接取一次。刷新得到新 board 后，旧 board 的未接取项不再可操作；已经接取的任务不受影响。

### 4.2 玩家发布和招募

发布表单只有：title、objective、requirements（可空）、location、risk（可空）、reward。玩家发布任务不使用六方向、posture 或 timing，grade 固定展示为`CUSTOM`。

发布流程：

1. 校验用户输入、当前 Tasks CAS 和玩家余额；
2. 在一个 Tasks Scoped transaction 中调用 Economy Capability，执行`player → escrow:task:<taskId>`并创建`recruiting`任务；
3. 用户点击「招募候选人」时才调用 Agent；
4. 合法候选结果替换该任务当前候选列表；
5. 用户选择一人后写`assigned`事件，任务进入`active`并清空候选列表。

候选人可以来自已知/登场角色，也可以是符合世界设定的新角色。若复用已知角色，关系与能力必须服从已有证据；若生成陌生人，必须保持陌生关系。任何候选结果都只表示“任务终端收到应征资料”，不得续写见面、对话、交付或任务已经开始。

每个候选人包含 name、description、pitch、capability、risk。候选人没有可支取余额；只有最终被选择者才成为任务执行方。选择时沿用该候选人的`candidateId`作为 Task 内的`partyId`并冻结完整资料，完成时对应`counterparty:task:<partyId>`才收到 escrow；不能再生成一个无法追溯候选人的身份 ID。

低报酬、高风险或条件苛刻时，合法结果可以是零人。玩家发布的委托在 `recruiting` 或 `active` 期间都可取消，escrow 全额退回 player。玩家接取的 `active` 任务可放弃，escrow 退回原 world counterparty；玩家不领报酬，也不扣钱。取消保留终态记录，不再参与剧情注入或维护，不支持重开。

### 4.3 活动任务

`active`任务只有三种维护意图：

- progress：目标尚未完成/失败，但出现了直接相关、可保留的实质进展；
- complete：可信证据已经满足唯一 objective；
- fail：可信证据表明 objective 已不可逆失败或明确过期。

按原文 objective 判断是否达成，不评价执行方法；其他任务字段、旧进展中的条件展开、关系变化或后续冲突都不增加完成门槛。没有实质变化时不写事件；未完成本身不等于失败。

玩家与世界角色都使用本次提供的 RP 原文和累计进展中的已确认事实；原文与摘要冲突时以原文为准，旧摘要中的推断或待办不能作为证据。角色口头自称完成不等于事件已发生，但原文明确叙述的行动和结果可以判定；设定、能力、风险和经过回复数本身不能生成进展。

进展只记录与 objective 有关的累计已发生事实，不分析剩余条件、不规划下一步；目标已经达成则立即 complete。摘要字段的写入协议见第 8.3 节。

任务自身不提供全历史查阅：现有来源捕获及无工作守卫仍按第 8.4 节运行。跨历史核查与用户直接沟通属于已注册的[管理员 APP](./administrator-app-target-design.md)，不作为任务自动维护的能力。

## 5. 状态机与守卫

```text
当前 board listing --接取--> active --progress--> active
                                  |--complete--> completed
                                  |--fail-----> failed
                                  `--cancel---> cancelled

玩家发布 --> recruiting --替换候选--> recruiting --选择候选--> active
                    `--cancel--> cancelled                   `--cancel--> cancelled
```

| 当前状态 | 命令 | 守卫 | 下一状态 |
| --- | --- | --- | --- |
| board listing | accept | boardId/listingId 仍是当前 board；未接取；任务 ID 新；资金合法 | active |
| 无 | publish | 输入合法；余额充足；任务 ID 新 | recruiting |
| recruiting | replace-candidates | 玩家发布任务；task revision/eventId CAS 匹配 | recruiting |
| recruiting | assign | 玩家发布任务；candidateId 存在；CAS 匹配 | active |
| recruiting | cancel | 玩家发布任务；CAS 匹配 | cancelled |
| active | cancel | 玩家接取或发布的任务；CAS 匹配 | cancelled |
| active | progress | CAS 匹配；summary 不同则写事件，相同则 unchanged 且不消费 actionId/eventId | active |
| active | complete | CAS 匹配；存在执行者 | completed |
| active | fail | CAS 匹配；存在原出资方 | failed |
| completed/failed/cancelled | 任意状态命令 | 终态不可重开 | 拒绝 |

所有会产生`TaskEvent`的写动作由 Host Controller、candidate generation request 或 maintenance Session 创建并固定`actionId`；iframe 只提供请求相关 ID，不得提供领域 actionId。同一 actionId 只有完全相同的命令可以幂等重放；不同命令复用时是冲突。Board 替换没有 TaskEvent，使用请求 token、预期 boardId 和 Kernel FIFO 防迟到，不虚构 actionId。对既有任务的 UI 动作携带`expectedTaskRevision + expectedEventId`，避免服务端用户文件被重新读取后出现同 revision 不同任务版本的误写。

Agent 工具只提供`taskId + revision`。Session 已在创建时捕获每个任务的`expectedEventId`，提交时仍以完整 CAS 校验；模型不能选择 eventId、actionId 或账户。

## 6. 持久数据模型

```ts
interface TaskDomainV1 {
    schemaVersion: 1;
    revision: number;
    board: TaskBoard | null;
    events: TaskEvent[];
}

interface TaskBoard {
    boardId: string;
    listings: TaskListing[];
    generatedAt: number;
}

interface TaskListing {
    listingId: string;
    grade: 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'EX';
    tags: string[]; // 第一项固定为六方向之一
    posture: '易介入' | '中介入' | '深介入';
    title: string;
    hook: string;
    objective: string;
    requirements?: string;
    location: string;
    timing: '现在就行' | '任意时候' | `特定时机：${string}`;
    risk: string;
    reward: number;
}

interface TaskCandidate {
    candidateId: string;
    name: string;
    description: string;
    pitch: string;
    capability: string;
    risk: string;
}

type TaskListingDraft = Omit<TaskListing, 'listingId'>;
type TaskCandidateDraft = Omit<TaskCandidate, 'candidateId'>;

type TaskParty =
    | { kind: 'player'; displayName: string }
    | {
        kind: 'world';
        partyId: string;
        displayName: string;
        description?: string;
        pitch?: string;
        capability?: string;
        risk?: string;
    };

interface TaskEventBase {
    kind: string;
    eventId: string;
    actionId: string;
    taskId: string;
    taskRevision: number;
    observedAssistantCount: number;
    createdAt: number;
}

type TaskEvent =
    | (TaskEventBase & {
        kind: 'accepted';
        boardId: string;
        listingId: string;
        issuer: Extract<TaskParty, { kind: 'world' }>;
        assignee: Extract<TaskParty, { kind: 'player' }>;
        listing: TaskListing;
    })
    | (TaskEventBase & {
        kind: 'published';
        issuer: Extract<TaskParty, { kind: 'player' }>;
        title: string;
        objective: string;
        requirements?: string;
        location: string;
        risk: string;
        reward: number;
    })
    | (TaskEventBase & { kind: 'candidates-replaced'; candidates: TaskCandidate[] })
    | (TaskEventBase & { kind: 'assigned'; assignee: Extract<TaskParty, { kind: 'world' }> })
    | (TaskEventBase & { kind: 'cancelled'; resultSummary: string })
    | (TaskEventBase & { kind: 'progressed'; progressSummary: string })
    | (TaskEventBase & { kind: 'completed'; resultSummary: string })
    | (TaskEventBase & { kind: 'failed'; resultSummary: string });
```

事件按数组顺序重放。每个 taskId 的`taskRevision`从 1 连续增长；`eventId`和`actionId`在整个 Tasks domain 内唯一。`TaskDomainV1.revision`在每个成功的 board 替换或任务 mutation 后加一；一次 maintenance 批量提交多个任务事件时只加一。

### 持久事实与当前生成策略

V1 持久 validator 只验证 canonical 字段、V1 枚举、容量、身份唯一性、revision、事件关系和冻结 reward；它不调用当前 board 报酬区间、grade-range、3/2/1 posture 配额或方向排序策略重新审判已保存数据。

- `accepted`冻结当时 listing 的完整字段与 reward；`published`冻结玩家提交的 reward；
- accepted/published、执行者、候选人、progress 和终态都只由事件链投影；
- settlement/refund 始终使用事件中冻结的 reward，不读取当前生成范围；
- 当前策略只约束新的 board 生成/替换和新的用户命令；V1 reducer 是不可变历史合同，未来规则变化不得修改旧事件含义。

若未来需要改变 V1 字段或事件语义，必须引入明确的新版本升级边界；不能在日常加载中加当前规则兜底或兼容集合。

投影得到的唯一公开记录固定为：

```ts
interface TaskRecord {
    taskId: string;
    taskRevision: number;
    eventId: string;
    source: 'received' | 'published';
    status: 'recruiting' | 'active' | 'completed' | 'failed' | 'cancelled';
    issuer: TaskParty;
    assignee?: TaskParty;
    reward: number;
    grade: 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'EX' | 'CUSTOM';
    tags: string[];
    posture?: '易介入' | '中介入' | '深介入';
    title: string;
    hook?: string;
    objective: string;
    requirements?: string;
    location: string;
    timing?: TaskListing['timing'];
    risk: string;
    candidates: TaskCandidate[];
    progressSummary: string;
    resultSummary: string;
    sourceBoardId?: string;
    sourceListingId?: string;
    createdAt: number;
    updatedAt: number;
    lastObservedAssistantCount: number;
}
```

它只存在于内存，不作为第二份持久真相。`accepted`投影为 received 并复制 listing 字段；`published`投影为 published、grade=`CUSTOM`、tags=[]且没有 posture/hook/timing。assigned 后 candidates 清空；终态事件保留全部冻结事实。

投影默认文案由代码派生：accepted 为“已接取任务”，published 为“等待应征者”，assigned 为“<候选人>已接取任务”；`progressed`随后替换累计进展。`progressSummary`的语义见第 4.3 节，字段上限与写入协议见第 8.3 节。

`observedAssistantCount`使用普通 OS 现有定义：当前聊天中非 User、非 system 的 Assistant 消息数量。它不是消息 ID、楼层或回滚锚点。maintenance 使用接受来源捕获的`source.assistantCount`；本地任务动作在主生成空闲时从当前绑定聊天读取一次。离场经过量固定为：

```text
elapsedAssistantReplies = max(0, source.assistantCount - task.lastObservedAssistantCount)
```

删除旧消息导致计数下降时只把差值压到 0，不删事件、不撤销任务、不追回资金。下一次合法事件使用当时观察值建立新基线。

不持久化 loading、running、checking、error、API 原文、Prompt、聊天全文、消息 hash、请求、AbortController、余额快照或任务投影缓存。

### 6.1 规范化和容量

- 所有 ID 由代码创建或从现有领域投影读取；Agent 返回的 id/actionId/accountId 一律忽略；
- task/board/listing/candidate/event ID 最长 160，actionId 最长 200；派生 world partyId 最长 180，Economy account 仍服从 240 字符上限；
- ID factory 每次生成后必须同时对当前 domain 和本次尚未提交的 batch 做占用检查；碰撞就继续生成，不能把`randomUUID`或“毫秒 + 计数器”本身当成唯一性证明；
- 持久字符串做 NFKC、控制字符清理和换行规范化；用户表单超限明确拒绝，不静默截掉用户输入；
- board 文本上限沿用成熟协议：title 12、hook 120、tag 16（1–4 项）、objective 48、requirements 64、location 48、timing 40、risk 64 个 Unicode code point；
- 玩家发布字段上限为 title 120、objective 8,000、requirements 8,000、location 600、risk 2,000 个 Unicode code point；title 留出 Economy 流水标题前缀空间，不能直接照搬超出账本 160 字符上限的 Tavern 标题；
- candidate 的 name 最长 120，其余四个字段各最长 2,000；resultSummary 最长 2,000；
- 所有 TaskParty displayName 最长 120；由候选人形成的 world party 资料沿用对应 candidate 上限；`cancelled.resultSummary`由代码固定为本地撤回文案，不接收用户或 Agent 自由文本；
- 当前 board 包含 1–6 项，按固定六方向顺序保存且方向唯一；完整生成目标是六项和 3/2/1 posture 配额，但部分成功的 board 仍是合法持久数据。候选列表永远最多四人；
- Tasks 不人为限制历史事件条数；与现有 Economy/Shop/Bank 一样由字段不变量和分区容量约束，不能在任务仍有 escrow 时因任意历史上限阻止结算。

## 7. Board 与候选人生成协议

### 7.1 Tasks 自有上下文

显式生成请求由`apps/tasks/generation`构造下列唯一上下文。不得把整个`getContext()`、聊天 metadata、存储 Envelope 或 Tavern Tasks 投进模型：

```ts
interface TaskGenerationContext {
    player: {
        displayName: string;          // 最长 120 code point
        persona: string;              // 最长 4,000
    };
    characters: Array<{
        characterKey: string;         // 最长 160；当前角色 id，群聊成员使用稳定成员 id
        displayName: string;          // 最长 120
        description: string;          // 最长 4,000
        personality: string;          // 最长 2,000
        scenario: string;             // 最长 2,000
    }>;                               // 当前单聊角色，或群聊当前参与者；最多 16
    recentMessages: Array<{
        index: number;
        role: 'user' | 'assistant';
        speakerName: string;          // 最长 120
        text: string;                 // 最长 4,000
        swipeId: number | string | null; // 数字须为非负安全整数；字符串最长 160
    }>;                               // 最近 4 条非 system 消息，保持正序
    worldInfo: {
        before: string;               // 最长 8,000
        after: string;                // 最长 8,000
        depth: string[];              // 每项最长 2,000，总计最多 8,000
    };
    storyEvents: string;              // 可选 L2 事件投影，最多 20,000；不可用时为空
    mapContext: string;               // 普通 OS Map 的完整安全 Atlas 投影，最多 800
}

type TaskGenerationBoundary =
    | {
        kind: 'board';
        chatScopeToken: string;       // Kernel 为当前 osId/binding activation 签发，不进入模型
        contextSnapshot: TaskGenerationContext;
        expectedBoardId: string | null;
    }
    | {
        kind: 'candidates';
        chatScopeToken: string;
        contextSnapshot: TaskGenerationContext;
        taskId: string;
        expectedTaskRevision: number;
        expectedEventId: string;
    };
```

所有名字复用`AcceptedTurnSource`的 NFKC、控制字符清理、空白折叠和 120 code point 上限。字符正文做 NFKC、控制字符清理和换行规范化后按上限截取，因为它是只读模型上下文；用户表单仍按第 6.1 节超限拒绝。消息 index 只接受非负安全整数，字符串 swipeId 按 160 code point 截取；无合法稳定 characterKey 的角色不进入 characters，不能由数组位置伪造持久身份。

`worldInfo`只调用 SillyTavern 1.18 的`getWorldInfoPrompt(boundaryMessages.reverse(), hostMaxContext, true, globalScanData)`。`boundaryMessages`是截至捕获边界的全部非 system 聊天正文，并按宿主`world_info_include_names`决定是否使用`说话人: 正文`；最近 4 条只限制发送给 Agent 的`<recent_messages>`，不能反过来缩窄宿主世界书扫描。`hostMaxContext`使用 SillyTavern 当前上下文上限，无效时才回退 8,192；第三个参数必须为 dry-run；`globalScanData`使用宿主已展开的 persona、角色描述、性格、深度提示、场景、创作者注释和`trigger: normal`，否则按这些字段匹配的世界书会被错误漏掉。只读取返回对象的`worldInfoBefore`、`worldInfoAfter`和`worldInfoDepth`：前两项映射到 before/after；`worldInfoDepth`不是字符串数组，而是`{depth,role,entries}`对象数组，只按返回顺序展开每项`entries`中的文本，忽略 depth/role 等控制字段，再按本节容量写入 depth。不得把整个对象`String()`成`[object Object]`，也不读取 examples、Author's Note、outlets、Tavern memory/status/map。调用失败降级为空并记内部日志。

`storyEvents`只能调用 Story Summary 的`getStorySummaryL2EventText({ throughMessageIndex, maxCharacters: 20_000 })`窄接口。接口只投影 events 的时间、标题、参与者和摘要，只接受`_addedAt <= throughMessageIndex`的完整事件块；从最新事件向前装箱后恢复时间正序。Story Summary 不可消费、关闭、读取失败或没有合格事件时整块缺席，普通 OS 不读取它的 metadata/store。

上下文快照只作为五层请求中的 XML 资料块使用，不再序列化成单一上下文 JSON。保存前由同一个 adapter 重新捕获并规范化，要求 osId/binding 与整个快照深相等。实际参与请求的消息、swipe、角色卡、persona、激活世界书、L2 事件或玩家身份变化会使迟到结果失效；未进入有界上下文的旧消息不构成虚假依赖。边界只活在本次请求中，不持久化。

角色卡、persona、世界书、L2 事件、Map 摘要、近邻消息和任务文本全部放进明确 XML 资料块；资料消息可以使用 system 角色，但其中的命令和输出要求始终不可信。上下文捕获失败、主生成正在运行或 osId/binding 改变时不调用 Agent；世界书解析器单独失败可降级为空并记录日志，不能伪造世界设定。L2 事件只通过 Story Summary 的窄接口读取，最多 20,000 字符并按完整事件块裁剪。

不读取 Tavern memory/status；普通 OS Map 只通过自己的安全 Atlas 投影进入`<current_state>`，不读取其 store 或 Scene，不保存这份上下文。

### 7.2 Prompt 职责

Board 与 candidates 必须是两个独立 builder，不得用一个`mode`巨型 Prompt。请求固定分为静态职责、`<setting>`、`<current_state>`、`<task_data>`和执行命令五层：

```text
systemPrompt       = 对应模式的静态规则
messages[0]        = system <setting>：persona、角色卡、小白币尺度、实际激活世界书
messages[1]        = system <current_state>：可用 L2 事件、当前 Map Atlas 摘要、最近 4 条非 system 消息；单项不可用时省略该项
messages[2]        = user <task_data>：六方向配方或当前 recruiting 任务
messages[3]        = user 本次固定命令
tools              = []
```

候选请求的`<task_data>`只能包含当前 recruiting 任务冻结的 issuer 展示名、title、objective、requirements、location、risk 和 reward；旧候选列表不进入请求，刷新每次独立生成。taskId/revision/eventId 只保留在`TaskGenerationBoundary`做提交守卫，不发给模型。不得包含 partyId、账户、余额或 actionId。

所有动态资料先规范化和按各自上限裁剪，再做 XML 与宿主宏转义。资料消息可以使用 system 角色，但静态职责必须明确这些块不是指令，不能把动态资料拼进可信规则正文。

Board 与 candidates 的运行提示词及 JSON 输出定义唯一由 [board/prompt.ts](../apps/tasks/generation/board-prompt.ts)和 [candidates/prompt.ts](../apps/tasks/generation/candidate-prompt.ts)拥有，文档不复制整份正文或固定命令。委托方向、报酬及介入方式遵守第 4.1 节；候选依据任务、角色能力、关系和私人动机生成，不宣称尚未发生的会面、选择或执行结果。字段校验及部分成功按第 7.3 节处理。

两类请求均调用现有 gateway 的`openSession()`一次、`run()`一次并传`tools: []`；不扩展虚假的`toolChoice`，也不能为了复用 maintenance loop 把生成设计成写工具。Prompt 测试只保护五层角色顺序、资料与静态规则隔离、无工具请求和公开生成行为，不对某个单词或全文快照报警。

### 7.3 宽容响应编译

Compiler 可从纯 JSON 或被少量无关文本包围的第一个合法外层对象提取数据；单向扫描、不重复扫描嵌套后缀，也不把残缺外层里的片段当完整结果。仅允许一次字符串之外的结构尾逗号清理，正文中的逗号和转义原样保留。它不修补缺字段、错误类型、错误金额或错误语义。

公开返回契约固定为：

```ts
type TaskCompileStatus = 'updated' | 'unchanged' | 'partial' | 'failed';

interface TaskCompileItemReport {
    collection: 'tasks' | 'candidates';
    index: number;
    id: string;            // 仅 unchanged candidate 可填既有 canonical id；新 draft 和失败项为空
    changed?: boolean;
    reason?: TaskCompileReason;
    hint?: string;
}

interface TaskCompileResult<T> {
    ok: boolean;           // failed 时才为 false
    status: TaskCompileStatus;
    changed: boolean;
    applied: TaskCompileItemReport[];
    skipped: TaskCompileItemReport[];
    warnings: string[];
    hint?: string;
    data?: T;
}

type BoardCompileResult = TaskCompileResult<{
    listings: readonly TaskListingDraft[];
}>;

type CandidateCompileResult = TaskCompileResult<
    | { mode: 'replace'; candidates: readonly TaskCandidateDraft[] }
    | { mode: 'unchanged'; candidates: readonly TaskCandidate[] }
>;
```

`TaskCompileReason`是本地闭合集合：`response_too_large`、`response_truncated`、`json_not_found`、`root_must_be_object`、`tasks_must_be_array`、`candidates_must_be_array`、`collection_exceeds_limit`、`item_must_be_object`、`required_field_missing`、`field_type_invalid`、`field_too_long`、`tags_invalid`、`direction_invalid`、`direction_duplicate`、`posture_invalid`、`timing_invalid`、`reward_invalid`、`grade_invalid`、`grade_reward_mismatch`、`candidate_name_duplicate`。Provider 原文与 JSON parser message 只能进日志，不能变成 reason 或 UI 文案。

为使“有界提取”可执行，扫描前先按 JavaScript string code unit 拒绝过大的原始文本：board 上限 64,000，candidates 上限 256,000。前者远大于六项协议的最大正文；后者覆盖四名候选所有字段即使大量使用 JSON Unicode 转义后的体积。该限制只保护解析成本，不改变持久字段上限。

Board 编译规则：

1. 原始`tasks`必须是数组；超过 12 项时整次拒绝，12 是预期六项的两倍输入保险线，防止超大 Provider 输出先被完整遍历；
2. 根对象只消费`tasks`；其他根字段忽略并记 warning。每项独立白名单化、规范化和校验，未知字段丢弃并记 warning；
3. tags 第一项必须是六方向；每个方向最多保留一项；reward 同时满足方向区间和 grade 区间；
4. 坏项、重复方向和超限项进入`skipped`，合法 sibling 保留；
5. 至少一项合法时返回`TaskListingDraft[]`；不足六项或 posture 配额不符时结果为 partial。Compiler 不创建 boardId/listingId；
6. 全部非法、JSON 截断或结构错误时结果为 failed，旧 board 原样保留。

Candidates 编译规则：

1. 原始`candidates`必须是数组；超过 8 项时整次拒绝，8 是预期最多四人的两倍输入保险线；
2. 根对象只消费`candidates`；其他根字段忽略并记 warning。明确空数组是合法的“无人应征”，会把旧候选列表替换为空；
3. 非空时逐项校验，按 NFKC/折叠空白/不区分大小写的 name 去重，返回`TaskCandidateDraft[]`；Compiler 不创建 candidateId；
4. 最多保留四个合法项；坏项和多余项进入`skipped`；一至四个合法项都可替换，但非空结果少于三人或混有 skipped 时为 partial；
5. 非空数组却没有任何合法项时 failed，旧候选列表原样保留。

Board 只要至少一项合法即为 changed，因此完整六项为 updated、保留部分合法项为 partial；它没有 unchanged 结果。Candidates 先按五个规范字段和顺序与当前列表比较，不把 candidateId 参与比较：空数组或三至四个合法项、无 skipped 且内容完全相同时返回既有列表及 IDs/unchanged；有 skipped 或非空合法结果少于三人时状态优先为 partial，即使合法 survivors 与当前列表相同，此时`changed:false`且 data mode 为 unchanged；内容确实不同时返回无 ID drafts。完整合法为 updated，协议不完整但有可用 sibling 为 partial。`failed`始终表示没有可提交候选。

Request 只有在 compiler 给出 changed 的 updated/partial 后才调用应用服务。世界书和世界新闻固定使用本次请求取得的参考素材，提交检查不重扫概率世界书。Application 在授权 token、可变上下文（玩家、角色、近期剧情、总结和地图）、board/task CAS、主生成和 Kernel 文件写状态第一次检查全部通过后，使用 Tasks 私有 ID factory 为本次 board/listing 或 candidate batch 分配并查重 ID，再进入唯一 Scoped transaction；上传前 guard 失败时整批候选不安装。unchanged 不分配 ID、不产生事件或保存。Provider 明确以 length/max_tokens 截断时优先使用`response_truncated`，不伪装成普通 JSON 错误。

## 8. 活动任务 Prompt、工具与 Session

### 8.1 Agent 可见投影

Tasks Session 只把当前符合第 8.4 节接受来源边界的`active`任务投影给 Agent：

```ts
interface TaskMaintenanceView {
    taskId: string;
    revision: number;
    source: 'received' | 'published';
    issuer: { kind: 'player' | 'world'; displayName: string };
    assignee: {
        kind: 'player' | 'world';
        displayName: string;
        capability?: string;
        risk?: string;
    };
    title: string;
    objective: string;
    requirements: string;
    location: string;
    timing: string;
    risk: string;
    reward: number;
    progressSummary: string;
    elapsedAssistantReplies: number;
}
```

不投影 board、候选人、escrowAccountId、Economy 余额/流水、eventId、actionId 或任意账户字符串。该数组必须作为 Session 的`dataMessages`中一个 user message 发送，并包在明确的 XML 资料块内：

```text
<active_task_state>
<TaskMaintenanceView[] 的 JSON>
</active_task_state>
```

活动任务数据仍使用安全 JSON 投影；接受来源由 runner 单独构造为经过 XML/宿主宏转义的`<accepted_turn>`。共享`<setting>/<current_state>`是 system data message，participant 数据和接受来源是 user data message，均不得混进静态规则。非 session Provider 的工具后续回合重放完整消息历史；session Provider 只在首轮发送，后续使用原生 toolResponses/final reminder。

### 8.2 Maintenance systemPrompt 职责

维护判据以第 4.3 节为准。模型正文的唯一实现是 [maintenance/prompt.ts](../apps/tasks/maintenance/prompt.ts)，此处不复制提示词。

分层固定为：共享维护层负责身份、资料信任边界和多领域收尾；Tasks 领域块负责已有资料、证据与目标判定；工具说明负责动作和返回结果；字段说明负责摘要语义。各层不重复写同一规则。

Prompt 验证保护 system/data 隔离与工具协议，不对单词、段落位置或全文快照报警。第 14.5 节使用真实 Provider 验收语义，普通单测不能证明模型遵守判据。

### 8.3 工具契约

工具名、参数 schema、摘要字段说明及其上限由 [tools/tool-contract.ts](../apps/tasks/tools/tool-contract.ts) 唯一定义；参数编译以 [command-compiler.ts](../apps/tasks/tools/command-compiler.ts) 为准，后台维护与管理员共用，不在文档复制可漂移的 schema 或工具文案。

工具只提交进展、完成、失败三类意图。说明区分工具暂存成功与应用保存成功，字段说明定义累计事实摘要及终结证据；目标与证据判据引用第 8.2 节，不在每个工具再写一遍。

运行时不接受`expectedRevision`、`summary`或 Tavern 旧工具别名；测试线不存在兼容对象。对象原型、未知字段、缺字段、空白文本、超限文本、非安全整数 revision、非 Session taskId 都返回结构化失败，不做截断、字段猜测或 fallback。

工具失败 reason 只允许：`arguments_must_be_object`、`unsupported_fields`、`task_id_required`、`task_not_in_session`、`revision_invalid`、`revision_conflict`、`summary_required`、`summary_too_long`、`task_not_active`、`task_command_already_staged`。ID 碰撞、底层异常、账户和保存错误不作为可修参 tool reason；commit 失败由 runner outcome 处理。

工具执行规则：

- 每项参数先经 exact-key 白名单、domain 文本规范、状态机和 Session 快照 CAS 校验，再写内存 staging；
- 一个 Session 对同一 taskId 最多接受一个有变化的命令；完全相同的重复调用返回 unchanged，不同的第二个命令返回可修复错误；
- 无变化的 progress 不占用该任务的命令名额；不同 active 任务可各 stage 一个命令；
- Agent 不能提供 actionId。Session 为每个 staged command 生成并固定 actionId，重试提交仍使用同一值；
- 返回统一`ok/status/changed/applied/skipped/warnings/hint`。每个 applied/skipped 的`collection`固定为`tasks`，有合法 taskId 时以它作为失败身份；无 taskId 的参数错误归为本 participant 的调用级失败；
- 某 taskId 的成功或 unchanged 调用清除该 task 的既有失败，即使修正时换用了另一个 Task 工具；调用级失败由下一次有效 Tasks 工具调用清除。另一个 taskId 的成功不能误清实体失败；
- Session 最终状态：有 changed staging 且仍有失败为 partial；有 changed staging 且无失败为 updated；无 staging 且有失败为 failed；无 staging 且无失败为 unchanged；
- 参数/解析/可恢复领域错误由通用 Provider tool loop 结构化回喂；同签名连续三次失败刹车、第四次结束，最多 12 个 Provider 回合。

请求正常结束时，Session 以一次 Tasks Scoped transaction 提交全部 staged commands。Provider 后续失败或达到轮次上限时，有合法 staging 则按 common runner 规则 partial 提交；没有合法 staging 则 failed。单个坏任务不能拖死其他任务的合法 staged command。

### 8.4 无工作短路

Tasks participant 的`isEnabled(mode)`对`rebuild`固定返回 false，对`automatic`只判断`autoMaintenance`，对`manual`固定可用。`createSession(source, mode)`读取当前 Tasks 投影，只纳入满足`source.assistantCount > task.lastObservedAssistantCount`的 active 任务。这个守卫保证任务至少看到一条发生在自己上次状态事件之后的已接受 Assistant 回复，也阻止刚在接受来源之后接取/指派的任务倒吃旧剧情。

没有符合条件的 active 任务时返回`null`表示 no work。删除旧消息导致 Assistant 计数暂时不再大于任务基线时采取保守跳过；不回滚任务，也不把旧接受轮重复送给 Agent。

通用 runner 在 Tasks 阶段只做三项由真实第二消费者触发的通用扩展：

```ts
interface MaintenanceDataMessage {
    readonly role: 'system' | 'user';
    readonly content: string;
}

interface MaintenanceSession {
    // 既有字段不变
    readonly prompt: string; // 可信静态规则
    readonly dataMessages: readonly MaintenanceDataMessage[]; // 不可信领域数据
}

MaintenanceParticipant.createSession(
    source: AcceptedTurnSource,
    mode: MaintenanceMode,
): MaintenanceSession | null | Promise<MaintenanceSession | null>;
```

`null`记录为 skipped/no-work；若所有 participant 都无工作，在捕获共享背景、读取 Agent 配置和创建 adapter 之前结束。Provider loop 的首轮消息固定为共享 system`<setting>`、system`<current_state>`、各 Session 的 user`dataMessages`、runner 的 user`<accepted_turn>`。Map 有工作、Tasks 无工作时只运行 Map；两者都有工作时共用一个 Agent adapter 和 Provider tool loop，loop 内仍可能因工具结果产生多个 Provider 回合。

为满足同一 static-rule/data 边界，Map 的`buildMapMaintenancePrompt`不接收或内嵌玩家展示名，可信 mode 仍可留在静态 prompt；玩家`actorKey/displayName`统一来自 runner 的`<accepted_turn>`。不得借此修改 Map 领域、工具或 UI。

Provider loop 不再把“领域工具返回`ok:false`”按工具名保存第二份未解决状态；这种失败由所属 Session 按实体/调用级身份负责。Loop 只追踪 JSON 解析失败、未知工具和 executeTool 抛错等未进入领域 Session 的传输失败，并继续负责同签名刹车。某 participant 后续任一成功执行的工具可清除其调用级传输失败；未知工具只可由后续合法拥有者调用清除。这样`TaskProgress`失败后改用合法`TaskComplete`不会被粗糙的工具名状态误报为 partial，Map 的实体失败仍由 Map Session 保留。

## 9. Economy 与钱包边界

账户固定为：

```text
player
counterparty:task:<partyId>
escrow:task:<taskId>
```

世界任务的 issuer partyId、所有 taskId 和 candidateId 都由代码创建。展示名不能参与账户寻址。

| 任务来源 | 动作 | 资金腿 |
| --- | --- | --- |
| 世界 board | 接取 | world counterparty → task escrow |
| 世界 board | 完成 | task escrow → player |
| 世界 board | 失败 / 放弃 | task escrow →原 world counterparty |
| 玩家发布 | 发布 | player → task escrow |
| 玩家发布 | 取消（招募中 / 执行中） | task escrow → player |
| 玩家发布 | NPC 完成 | task escrow →该 NPC counterparty |
| 玩家发布 | NPC 失败 | task escrow → player |

Task/Economy 交叉不变量：

- accepted/published 事件各对应且只对应一笔 funding 流水；
- completed 事件对应且只对应一笔 settlement 流水，failed/cancelled 对应且只对应一笔 refund；
- 资金事件与流水共用 actionId、taskId/sourceId 和确定性 idempotency key；
- recruiting/active 任务的 escrow 净余额精确等于 reward；completed/failed/cancelled 的 escrow 为 0；
- 一个任务不能同时出现 settlement 与 refund；
- candidates-replaced、assigned、progressed 不能产生 Economy 流水；
- 玩家余额不能透支；世界 counterparty 可作为外部任务出资/收款边界，不在 UI 中显示余额；
- Agent 永远不能改 reward、选择账户、追加罚款/补偿或创建第二份奖励。

所有资金事件和任务事件在同一个 Scoped transaction 中生成、交叉校验，形成一个用户文件 candidate 并以一个 commitId 上传。明确保存失败时两分区都不发布；结果不确定时由 Kernel 保留同一 candidate 并冻结该用户文件的后续写入，确认前不重复结算，也不调用新的 Tasks Agent 请求。

Wallet 只展示 Economy 流水，不提供任务操作入口。

## 10. 自动维护、显式请求与取消

### 10.1 自动维护开关

- Tasks 随小白 OS 固定注册并显示在桌面，不存在 Tasks 专属`enabled`字段或扩展设置复选框；
- 「所有普通聊天自动维护」只出现在 Tasks 内，默认 false；
- 开关操作只保存`tasks.autoMaintenance`，不读取 Agent 配置、不调用 API、不创建 Tasks chat data。

`autoMaintenance=false`只让 User 发送不产生 Tasks 自动请求，并使尚未进入保存 commit point 的自动 job 失效；Tasks 页面、显式功能、「维护一次」和主 RP 只读 Prompt 仍可用。切聊、OS cleanup 或关闭 OS 总开关才停止整个 Tasks runtime。

### 10.2 调用表

| 操作 | Agent | 条件 |
| --- | --- | --- |
| 打开/离开 APP、切页、查看 board/详情/历史 | 否 | 只读本地投影 |
| 接取、发布、选人、撤回 | 否 | 确定性 Scoped transaction |
| 刷新世界 board | 是 | 用户明确点击；Kernel 文件状态 ready；主生成空闲 |
| 招募/刷新候选人 | 是 | 用户明确点击；目标仍 recruiting；Kernel 文件状态 ready；主生成空闲 |
| 自动维护 | 是 | User 保存后上一接受轮；开关开启；至少一项 active 的基线早于该来源 |
| 维护一次 | 是 | 用户明确点击；最新完整接受轮；至少一项 active 的基线早于该来源 |
| 从聊天重建 Tasks | 不存在 | 不提供入口 |

Board/candidate 每次显式请求只加载一次配置、创建一个 Agent session、执行一次无工具调用。任务模块持有后台请求与运行状态，Host 接收后立即返回；离开页面、退出 APP 或关闭 OS 窗口不取消，重开从 Host 投影恢复进度与结果。切聊、主聊天开始生成、模块停用或 OS cleanup 时 abort；迟到结果必须通过 osId/binding、上下文快照、board/task CAS 和 Kernel 文件写状态检查，不依赖 app activation token。运行状态只在当前插件运行内保存，不持久化。

Maintenance 使用现有 Host FIFO、来源校验和 participant token。Tasks 与 Map 都有工作时共用一个 Agent adapter 和 Provider tool loop，但各有 Prompt、工具、领域 Session、staging、结果和 Scoped transaction；一方失败不能撤销或冒充另一方。手动维护点击后立即入队并返回，按钮从按聊天隔离的 Host 状态显示“正在更新”且不可再次点击；返回桌面、切换 APP或关闭 OS 窗口不取消任务，切聊后不得显示旧聊天的运行或完成结果。

### 10.3 保存 commit point

用户文件 replace 发出之前，切聊、OS cleanup、关闭对应自动开关、接受消息变化、task revision/eventId 改变或主动取消都会丢弃尚未提交的自动 staging。手动 maintenance 和 board/candidate 显式生成均不由页面拥有，离开页面不取消；页面只持有展示订阅和本地表单。

用户文件 replace 已经发出后无法物理回滚。此时必须等待真实保存结果：confirmed 才发布任务/资金快照，明确失败则不发布，结果未知则进入文件级 unconfirmed。UI 和文档都不能声称“任何时刻都能取消”。

## 11. 主 RP 任务投影

小白 OS 运行时，Tasks 自己的 prompt runtime 通过 OS 统一注入能力在主生成中安装只读数据块；位置与角色以[任务注入注册](../apps/tasks/prompt-registration.ts)为准：

- 按`updatedAt`倒序选择最多 5 个可见任务：玩家接收的任务只投影`active`，发布者显示产品入口“任务终端”；玩家发布的任务投影`recruiting/active`，发布者显示玩家角色名，仍在招募时执行者显示“未接”。其余输出为标题、等级、标签、缘由与线索、目标、要求、地点、时机、风险、报酬和此前进展。
- completed、failed、cancelled 完全不注入。

不注入 board、候选人列表、posture、内部 partyId、escrowAccountId、revision/eventId/actionId、维护规则或 Economy 账户。

自然语言模板由[任务提示词运行时](../apps/tasks/host/prompt-runtime.ts)定义，文档不另存副本。

动态字段逐项限长并做 XML/宿主宏转义，不暴露 ID、revision、内部状态机或候选人数据。Prompt 投影不调用 API，自动维护关闭时仍存在；无可见任务、dry-run 结束、生成停止、切聊或 OS cleanup 时清空。

## 12. UI 与本地文案

Tasks 使用清晰的委托列表与进展详情：浅色白底、深色中性底，紫色强调操作和报酬，桌面清单图标同色。正常 OS 阅读尺度、细分隔线与留白建立层次，不使用纸票装饰、大宣传卡或副标题口号。主导航分为「发现 / 我接的 / 我发布 / 记录」，设置位于标题栏：

- 发现：当前 board、标题、简短线索、报酬、地点、等级与已接取标记；完整条件进入委托详情，详情中接取；
- 我接的：仅 received + active；发布者为任务终端，执行者为玩家；
- 我发布：recruiting 与 published + active 均可见；招募中的委托进入候选人页面，执行中的委托进入进展详情；
- 招募：候选人能力与风险、选人确认、取消退款确认；选人后委托仍保留在「我发布」；
- 记录：completed、failed、cancelled，按 updatedAt 倒序本地分页；可筛选接取 / 发布来源，当前已加载页没有匹配项时仍能继续加载；「我发布 / 已结束」进入发布记录；
- 详情：先展示累计进展 / 最终结果和完成目标；冻结原文、报酬、发布者与执行者、约束及风险放在「委托内容与报酬」展开区，取消入口独立可见，下方保留事件时间线。收到该任务新事件后更新当前详情，离开页面的迟到读取不覆盖新页面；返回恢复原列表位置与条目焦点；
- 发布：目标与地点、选填约束与风险、报酬输入、余额/托管说明和确认弹窗；草稿只在当前页面存活；
- 设置：自动维护开关、「立即更新」按钮、Host 运行状态和最近结果；不另设 API/token 提醒。

进行中的详情提供「放弃任务」或「取消委托并退回报酬」，确认框分别说明不领报酬、不扣钱 / 全额退款，以及退出后续剧情提醒、保留记录且不可撤销。结束记录不再提供取消入口。

两条线路的 completed 与资金结算确认保存后，通过酒馆 `/echo` 同源全局通知显示任务名和结算结果：接取任务提示报酬到账，发布委托提示执行者完成且托管报酬已支付。无需打开 OS；失败、待核实和其他状态变化不弹完成通知，待核实恢复确认后才通知。按当前聊天 / osId / 完成事件在内存去重；首次读取、重启及切聊载入仅建立基线，不补弹历史，不持久化通知状态。通知显示失败不影响结算。动态文本按纯文本展示，不执行 slash command 或宏。

打开 APP 先同步返回已有本地投影；只有首次没有 Economy 时沿用钱包的异步开户 loading，不得让整个页面等待 host timeout。

用户可见文案只翻译稳定结果：

- board：已刷新 N 项 / 已刷新 N 项，部分结果不可用 / 刷新失败 / 已取消；
- candidates：找到 N 名候选人 / 暂无人应征 / 候选名单无变化 / 部分候选资料不可用 / 招募失败 / 已取消；
- maintenance：任务已更新 / 无需更新 / 部分任务状态已保存 / 维护失败 / 已取消 / 当前没有可维护的新任务状态；
- 保存：正在保存 / 保存未确认 / 保存冲突 / 采用服务端数据。

Provider 原文、错误堆栈、内部 code 和工具 hint 只进日志。原生 input/autofill/disabled/focus 与确认弹窗跟随当前主题；窄屏表单、长标题、长候选资料和底部导航不得溢出。确认弹窗管理键盘焦点，保存期间禁止重复确认或关闭。

## 13. 失败、分支与删除

- board/candidate API 或解析失败保留旧数据；部分合法结果按第 7.3 节保存并明确显示 partial；
- 新 board 输入受当前方向/等级/reward/posture/timing 策略约束；既有 board 与任务只按 V1 持久合同读取，旧冻结 reward 不被当前区间否定；
- maintenance 工具失败只影响所属任务；Map 可独立提交；
- 创建聊天分支得到新 osId，不复制经济资产或未结任务；共享钱包不另开户，具体范围见 Economy 平台设计；
- 编辑、删除、换 swipe 不回滚已提交任务，不退托管、不追回报酬；
- conflict 的「采用服务端数据」属于 Kernel 文件级动作：服务端 Envelope 读取并验证成功后才替换本地候选并恢复 ready；失败继续 conflict；
- 删除 Tasks 功能时使用当时当前 schema 的一次性退场流程，不在本阶段预埋永久 migration：先在 Tasks module 与 Economy Capability 仍注册时，为所有 active 世界任务写 failed + 原 world counterparty refund；玩家发布的 recruiting 写 cancelled + player refund，active 写 failed + player refund；整批以一次 Scoped transaction 保存成合法的终态 Tasks/Economy 分区，confirmed 前不得进入下一步；
- 随后的移除版本在升级边界删除`tasks`分区和 Tasks 设置，同时停止注册 Tasks/Economy 交叉检查。既有与清理产生的 Tasks Economy 流水按明确产品策略处理；若保留，则继续由 Economy 通用不变量校验，但不再要求一个已删除的 Tasks 分区反向证明；
- 退场中断时保留完整`tasks`分区并可重试，不能留下仍有余额的`escrow:task:*`。过渡版本完成后删除一次性退场代码，不留下旧类型、旧设置字段或永久兼容读取器。

## 14. 公开验收样例

以下样例固定可观察结果，不固定 Prompt 文案或内部函数名。

### 14.1 Board 部分成功

输入：六项 JSON 中，禁忌、接触、窥秘、掠夺、怪癖合法，夹缝 reward 超出方向区间。

预期：保存含五项的新 board，顺序仍按六方向，状态 partial；旧 board 被整体替换；不创建任务、不产生 Economy 流水。

### 14.2 Board 全坏

输入：`tasks`存在，但所有项都缺 objective 或 reward 类型错误。

预期：failed，旧 board、Tasks revision 和 Economy 完全不变。

### 14.3 无人应征

输入：`{"candidates":[]}`，目标任务仍是同一 recruiting revision/eventId。

预期：合法替换为零候选；若原列表非空则新增 candidates-replaced 事件，若本来为空则 unchanged；无资金流水。

### 14.4 玩家任务结算

输入：玩家发布 60 币任务并选择 NPC；maintenance 对正确 revision 调用 Complete。

预期：published 时 player -60、escrow +60；assigned/progress 不动钱；completed 时 escrow -60、NPC counterparty +60；任务与两笔资金各自在同一次用户文件 commit 中出现。

### 14.5 目标唯一性

任务 objective 为“把封蜡信交给伊莱”，requirements 为“不要拆封”。

- 接受来源明确描述伊莱接过未拆封的信：Complete；
- 玩家只说“任务做完了”：不调用工具；
- 玩家找到伊莱但尚未交信：Progress，摘要只写已找到伊莱，不写下一步或差距分析；
- 信已烧毁且无替代物：Fail；
- 信已交付但出现新冲突：仍 Complete，不能把新冲突当额外目标；
- 旧进展写着“信已交给伊莱，仍需回去向委托人汇报”：Complete，汇报不是原目标，不延续旧摘要增加的条件；
- 信已交付，但走的路线与 requirements 建议不同：仍按 objective 判定，不以执行方式追加门槛；
- 只有角色能力描述或经过数条回复，没有行动事实：不调用工具。

### 14.6 取消真实边界

输入：工具已经 stage Complete，但保存尚未开始时切聊。

预期：staging 和结算均丢弃。若用户文件 replace 已发出后才切聊，则等待实际结果，confirmed 时任务和资金保留，不能报告取消成功。

### 14.7 任务不得倒吃旧轮

输入：A1 完成时 Assistant 计数为 8；玩家在 A1 之后接取或为玩家发布任务选择 NPC，该任务首个 active 事件的`observedAssistantCount`也是 8；随后发送 U2 触发对 U1 + A1 的自动维护。

预期：该任务不进入本次 Session，不读取其为可维护工作；直到接受来源的 Assistant 计数大于 8 才首次具备维护资格。其他更早已 active 且基线小于 8 的任务不受影响。

## 15. 发布验收边界

自动检查和真实浏览器检查是两层证据，任一未执行都不能写“Tasks 已完整收尾”。

发布前必须验证：

1. OS 启用时 Tasks 图标固定出现在桌面；自动维护默认关闭，切换它不隐藏图标、不清 Prompt；
2. 打开、切页、查看、接取、发布、选人、撤回和开关均为零 Agent 请求；
3. board/candidate 只有明确按钮调用，切聊/换页/再次请求能取消保存前的迟到结果；
4. 自动维护只在下一条 User 保存后处理上一接受轮；Assistant、swipe、regenerate、continue 零触发；
5. 无符合接受边界的 active 任务且 Map 也无工作时，连 Agent 配置都不读取；Map/Tasks 同时有工作时只有一个 adapter/Provider tool loop；
6. 三个工具、部分 staging、Provider 失败、12 轮上限和同签名刹车符合通用 outcome；
7. Task/Economy 每条托管、结算、退款路径原子，明确失败无半写，unconfirmed 不重复请求/结算；
8. 主 RP Prompt 只含安全字段，生成结束、停止、切聊和 OS cleanup 后无残留；
9. 真实 SillyTavern 中完成 board、候选、自动 progress/complete/fail、手动维护和保存确认各一条路径；
10. OS 全量测试、TypeScript/Vue build、lint、Tauri ChatSurface、manifest、import 检查和`git diff --check`通过，产物不引用`modules/tavern/**`。
