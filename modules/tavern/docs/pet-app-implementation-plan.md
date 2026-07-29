# 不明物 APP 施工方案

- 状态：A–G 已实现；阶段 H 的代码、静态审查、测试与生产构建已收口（2026-07-29）。浏览器人工复验按用户要求停止，不虚报为完成。
- 依据：[不明物 APP 目标设计](./pet-app-target-design.md)与[内容规格](./pet-app-content-spec.md)
- 原则：每个阶段都落在终态边界内；入口最后注册；不提交假 Pet、演示余额、内存真状态或构思稿兼容壳

## 实施记录

- A–G 已按本文终态边界落地：领域规则与目录、两张持久表、玩家动作和
  Economy 原子事务、主 Assistant/Pet/Economy 同事务推进、历史/回滚/分支/
  删除/archive v8、聊天与判词、interference Prompt、Controller/Domain Sync、
  Phone OS UI 和生产 bundle。
- 自动验证已通过：`npm run test:tavern`（871/871）、
  `npx vue-tsc --noEmit -p tsconfig.tavern.json`、`npm run lint:tavern`、
  `npm run build:tavern`、`git diff --check`。
- 真实 ST 已验收诱饵扣款、自然成长至 adult、三个阶段里程碑、pending
  evolution 静态回落，以及完整事件目录中 26 个非 milestone 事件的
  Public View/UI 表现。
- 阶段 H 已完成 dirty diff 通盘审查、全量测试、类型检查、lint 和生产构建。
  桌面/移动、亮/暗、reduced-motion、键盘焦点和 Phone context/DOM 私密字段的
  后续浏览器复验按用户要求停止。下文十组场景仍是验收清单；未实际观察的项目不得
  以自动测试冒充完成。

## 1. 开工前确认

| 问题 | 施工答案 |
|---|---|
| 功能所有者 | `shared/pet` 拥有全部领域事实；Phone Pet 仅拥有交互和模型请求生命周期 |
| 唯一事实来源 | Economy 余额、current Pet version、Pet Activity 三者各守一份事实 |
| 临时态 | 路由、抽屉、输入、动画、busy、请求 controller、临时台词 |
| 持久态 | phase/dormant、轴、情绪、饱食、收藏、冷却、聊天记忆、待判词、版本和痕迹 |
| 外部依赖 | Session/Message、Economy、Assistant commit、Phone OS、runtime depth entry、archive/rollback、`runTavernOnce` |
| 注册入口 | story turn、Phone registry、Phone domain sync、main RP Prompt、会话/档案生命周期 |
| 删除路径 | 删功能目录与注册、删两表、档案/回滚移除、schema 清理、重建 bundle |
| 兼容对象 | 当前浏览器/WebView、SillyTavern、模型供应商、现行角色档案；无旧 Pet 数据 |
| 最少测试 | 规则/事件、历史、DB 原子性、主回合、模型协议、Prompt、回滚/档案、Controller、构建 |

开工时先重新读取 `session-db.ts` 最新 Dexie version 和角色档案 version。目标设计记录的是确认时的 26/7；若主线已前进，只使用连续的新版本号，不回填或伪造中间版本。

## 2. 依赖结构

```text
Vue Components
      ↓
Phone Pet Controller ─────→ runTavernOnce（事务外）
      ↓                              ↓
pet view/service/chat ←──── 严格解析后的有限结果
      ↓
petStateVersions / petActivities ──→ Economy service

主 RP runtime
      ↓
pet-story-turn（单一注册点）
      ├─→ 通用 Assistant 事务内提交原语
      └─→ Pet turn advance + Economy

accepted-history
      ├─→ tasks
      ├─→ shop
      ├─→ bank
      ├─→ pet
      └─→ economy
```

禁止：

- Vue/Controller import private `TavernPetState`、axes、事件随机源或 pending request snapshot。
- `pet-rules/personas/events/copy/chat` 访问 Dexie、Vue 或 Phone OS。
- Pet 修改 ShopStateVersion、BankStateVersion、Task 或结构化世界状态。
- Economy 识别 persona、事件或 curio。
- 在 Dexie transaction 中等待模型、网络、timer 或 Web Locks。
- 通用 runtime 根据 Pet 内部字段拼 Prompt；它只消费 `pet-prompt.ts` 产出的 depth entry。

## 3. 阶段 A：纯领域骨架

新增：

```text
modules/tavern/shared/pet/pet-types.ts
modules/tavern/shared/pet/pet-rules.ts
modules/tavern/shared/pet/pet-personas.ts
modules/tavern/shared/pet/pet-events.ts
modules/tavern/shared/pet/pet-copy.ts
modules/tavern/shared/pet/pet-random.ts
modules/tavern/shared/pet/pet-invariants.ts
modules/tavern/shared/pet/pet-view.ts
modules/tavern/tests/pet.test.ts
```

阶段完成时没有 DB、Controller、Prompt 和入口。

### A1. 类型边界

`pet-types.ts` 一次定义当前模型：

- phase 与独立 dormant。
- 三轴、情绪、persona、curio、交互、事件和 motion 枚举。
- 已处理 Economy ledgerOrder 游标及其 lure/wake/turn 生命周期。
- 私有 State、pending evolution、聊天记忆和统计。
- Public View DTO。
- StateVersion、精确 Action union、Activity union。
- mutation 输入/结果、restore impact 和稳定错误码。

私有与公开类型不要放在可被 Phone context 随手展开的同一聚合对象中。Public View 不提供“调试用”私有逃生口。

### A2. 纯规则

`pet-rules.ts` 只做同步纯转换：

- 安全整数、clamp、中性带和成年半速。
- interaction availability 与 transition。
- incubation 上限结算。
- 饱食、休眠、唤醒、情绪和被动轴变化。
- 基于 Economy ledgerOrder 游标的 Shop/Bank 支出窗口。
- phase 活跃回合和 persona 推导。
- 当前回合交互窗、pat 烦躁、chat 首次计效、toy 冷却。

所有 transition 接受显式 state/currentTurn/input，返回新 state + 结构化 effect；不读时间、随机、DB 或余额。

### A3. 静态目录

- `pet-personas.ts`：九张完整 adult persona 卡和一张 juvenile 对话/表情 profile；ID/展示名/表情值唯一，blank 的表情重复若是设计，使用显式例外而非放松全局校验。
- `pet-events.ts`：目标设计 30 个 ID 恰好一次，类别数 8/8/6/4/4，条件与 effect 全部结构化。
- `pet-copy.ts`：每个事件/里程碑/状态至少一个冻结模板；只对少量强人格事件提供 persona override，不创建 `30 × 9 × 6` 笛卡尔文案状态。
- curio 与交互目录同样 `as const`，初始化时验证唯一性和范围。

目录本身不含内联 predicate。custom condition ID 在一个穷举 evaluator 中实现。

### A4. 随机边界

```ts
interface TavernPetRandomSource {
    nextInt(maxExclusive: number): number;
}
```

生产封装同步 `Math.random`；测试注入耗尽即报错的整数序列。提供 birth bias、闭区间金额、显式概率闸和整数权重抽取 helper。边界/CAS/重放验证通过前不消费随机数。

### A5. 事件选择

实现两步选择：

1. 纯收集候选；空集合零随机消费。
2. `nextInt(100)` 判断 30–45% 触发闸；通过后再按权重消费一次随机数。

milestone/status 不进入普通事件闸。interference 共享总闸、独立冷却和玩家开关在候选阶段统一过滤。

### A6. Public View

`pet-view.ts` 从 private state + 最近 Activity 生成全新对象：

- undiscovered 也返回稳定空视图，不伪造 state/version。
- action availability 已含 cost/enabled/reason，Controller 不重算规则。
- face 只能来自当前阶段 profile/persona whitelist；Public View 直接给出 currentFace，UI 不自行挑表情。
- 只公开 satiety percent、形态/情绪文案、窝、最新反应和 pending 布尔值。
- 深拷贝数组/对象，后续修改 private state 不影响旧 view。

### A7. 不变量与最低测试

`pet-invariants.ts` 拒绝损坏，不做运行时清洗：

- phase/dormant 合法组合；luring/egg/juvenile/adult 专属字段正确。
- 整数轴/饱食/冷却/计数/ledger 游标范围；sparse cooldown 不含 0。
- persona 与阶段、三轴和 evolution cooldown 一致。
- curio 不重复且来自目录；pending snapshot 自洽。
- chat recent 最多 6，文本有上限。
- StateVersion/Action/Activity canonical。

测试保护用户行为和领域不变量：阶段、休眠、交互、情绪、九形态、30 条目录、概率闸、权重和脱敏。随机使用确定序列，不写统计显著性测试。

## 4. 阶段 B：持久化、玩家动作和 Economy 原子事务

新增：

```text
modules/tavern/shared/pet/pet-service.ts
modules/tavern/tests/pet-service.test.ts
```

修改：

```text
modules/tavern/shared/session-db.ts
modules/tavern/tests/session-db.test.ts
```

### B1. DB schema

确认时由 Dexie 26 升至 27：

```ts
petStateVersions:
    '[sessionId+revision], sessionId, versionId, &[sessionId+actionId], '
    + '&[sessionId+currentMarker], [sessionId+anchorOrder], updatedAt'

petActivities:
    '[sessionId+id], sessionId, &[sessionId+sourceActionId], '
    + '[sessionId+turn], [sessionId+anchorOrder], [sessionId+createdAt]'
```

只创建空表；不扫描旧会话生成 Pet，不迁移构思稿数据。导出表常量供事务编排使用。

### B2. 读接口

公开：

```ts
getCurrentTavernPetView(sessionId)
getTavernPetPrivateSnapshotForChat(sessionId)
getTavernPetStateAtAnchor(sessionId, targetFloor)
listTavernPetActivities(sessionId, options)
```

私有聊天快照只给 Controller 的闭合调用路径使用，不加入 Phone context/registry DTO。快照的记忆痕迹固定为最近 5 条非 chat Activity，查询在取满 5 条后停止，连续聊天不能挤掉更早的事件。普通 UI 只能拿 Public View。

### B3. 玩家 mutation runner

Pet 内部建立一个玩家动作 runner：

1. 规范化 session/action/expected version。
2. transaction 内先查 actionId 重放并核对动作语义。
3. 非重放再校验 Phone boundary。
4. 校验 current Pet CAS；undiscovered 只允许 lure。
5. 读取 Economy 当前余额；付费动作先判余额，余额不足统一返回结构化 reason。
6. 克隆并校验 state。
7. 执行调用方同步领域动作；只有前述边界/CAS/余额通过后才允许消费随机。
8. 用 Economy 当前事务 helper 写钱。
9. 写 Activity（若有）和下一 Pet version。
10. touch session 一次。

调用方动作不直接访问 Dexie。重放返回 current head + historical actionRecord + 原 Activity/Economy 结果。`resolveTavernPetEvolution` 是系统异步结果，不走这条 Phone boundary/CAS runner；它使用独立的 requestId runner，见 B4。

### B4. 玩家命令

```ts
lureTavernPet
interactWithTavernPet
wakeTavernPet
renameTavernPet
setTavernPetInterferenceEnabled
commitTavernPetChatResponse
resolveTavernPetEvolution
```

- lure 先检查无 current Pet 与余额至少 10，再创建 recording random source、抽五次 origin，并与 10 币扣款原子提交；余额不足零随机、零 Pet version、零 Pet 流水。
- feed/toy/wake 从静态交互目录取价格；UI 不传价格/delta。
- free action 仍写 version，但不写零金额流水。
- rename 只接受 NFKC、去控制字符、1–12 个可见字符；空值表示恢复 specimen label。
- chat/evolution 接口先接收**已解析**的有限结果，不接收任意模型 JSON。
- evolution resolution 从最新 head 校验 pending requestId，并以 `pet:evolution:{requestId}` 先到先得；它不要求模型启动时的旧 revision，且同 request 的后到文案按重放丢弃。

### B5. Economy

使用稳定键：

```text
pet:lure:{actionId}
pet:upkeep:{actionId}
pet:wake:{actionId}
pet:event:{turn}:{eventId}
pet:return:{turn}:{eventId}
```

同键存在时逐字段核对 source/kind/amount/accounts/anchor；不一致抛 action conflict。系统事件 actionId 由 turn 派生，不能由 Controller 创建。

### B6. 最低集成测试

- lure/付费交互/唤醒的余额和 Pet version 同时出现，中途抛错两边不变。
- free action 不写假流水。
- 快速双击/replay 不二次扣款或推轴。
- 旧 revision、旧 boundary、旧 session owner 零写入。
- 聊天 CAS stale 不更新记忆/情绪/Activity。
- 当前 head 已前进后重放旧 action 仍返回 current head。
- lure 余额不足时随机序列保持未消费，错误 reason 为 `insufficient-funds`。

## 5. 阶段 C：主回合原子参与者

新增：

```text
modules/tavern/shared/pet/pet-story-turn.ts
```

修改：

```text
modules/tavern/shared/session-db.ts
modules/tavern/app-src/runtime/run-once.ts
modules/tavern/tests/session-db.test.ts
modules/tavern/tests/pet-service.test.ts
```

### C1. 通用 Assistant 事务内原语

从 `commitTavernAssistantResponseForLatestUser` 提取不自行开 transaction 的内部原语，保持原校验与可观察结果。现有公共 wrapper 继续开原来的基础事务，避免 Pet 规则反向进入 `session-db.ts`。

不要设计动态插件总线。Pet 是当前唯一需要与故事 turn 原子写入的领域；一个明确 wrapper 比可配置 transaction participant 框架更小、更可删。

### C2. `pet-story-turn.ts`

公开一个供 main runtime 使用的 wrapper：

- transaction 列出 Assistant 基础表、只读 communicationContacts、两张 Pet 表和两张 Economy 表。
- 先完成通用 Assistant 边界校验，再在同事务计算 Pet next turn。
- 新 session turn 不是 `old + 1` 时不推进 Pet；大于 1 为错误，同 turn 是 error/reroll 路径。
- Pet 不存在、dormant、或 luring 尚未到期时零额外写入；不为证明“检查过”制造 no-op version。
- `actionId = pet:turn:{nextTurn}`，重放不抽随机。
- 事件观察窗口截止 `expectedUser.order`，包含锚定在当前用户消息上的已成立 Phone/Economy 事实，但不读取新 Assistant 内容。
- 所有写入成功后才返回 Assistant message。

`run-once.ts` 的普通成功与持久 partial 路径使用 wrapper；latest-assistant reroll 继续使用原 reroll 提交，因为 session turn 未新增。无 turn 的 error reply 不推进 Pet。

### C3. 回合 effect

每个 turn action 冻结：

- 递减/被动/阶段变化的规范化结果。
- 触发闸结果和选中事件。
- 随机金额、curio、目标、face、motion、rendered/injected/notification text。
- Activity ID 和 Economy source facts。

历史校验依靠这些结果重放，不重新调用随机源或当前文案目录。

### C4. 关键测试

- Assistant/message/session/Pet/Economy 中任一处抛错，全部不变。
- 同一 turn 双提交只有一个 Pet advance。
- reroll 不重复衰减、事件或资金，也不读取被替换 Assistant 作为事件条件。
- persisted partial 推进一次；无 turn error 不推进。
- milestone 优先，普通事件每回合至多一条。
- 余额保护与 event payout 在 Assistant 事务中成立。

## 6. 阶段 D：历史、回滚、会话生命周期和档案 v8

新增：

```text
modules/tavern/shared/pet/pet-history.ts
modules/tavern/shared/pet/pet-timeline.ts
```

修改：

```text
modules/tavern/shared/accepted-economic-state.ts
modules/tavern/app-src/features/accepted-rollback/accepted-rollback.ts
modules/tavern/shared/session-db.ts
modules/tavern/shared/character-archive-types.ts
modules/tavern/shared/character-archive-db.ts
modules/tavern/app-src/components/TavernCharacterWorkspacePanel.vue
modules/tavern/tests/session-db.test.ts
modules/tavern/tests/character-archive.test.ts
```

### D1. 历史重放

`pet-history.ts` 验证完整 version chain，而非只验证每行形状：

- revision 连续、version/action/current 唯一、turn/anchor 不回退。
- 第一版只能是 lure；每个 next state 可由 previous state + frozen action 重现。
- 有状态变化的 turn-advance 精确递增并重放 phase/mood/cooldown/idle；turn 间隙只允许由 luring 未到期或 dormant 的 canonical no-op 解释。
- observed Economy ledgerOrder 单调前移；只有 lure/wake 可重置到当时事务 head，普通交互不能吞掉未观察流水。
- Activity 与 action 的 sourceActionId、coinDelta 和冻结结果一致；异步判词 Activity 的顶层 turn/anchor 属于解析提交，detail 的 milestoneTurn/milestoneAnchor 对应原 pending milestone。
- Economy 交易与付费动作/事件金额一致；free action 无交易。
- pending evolution 只能由 milestone 建立、由匹配 requestId 解析一次。

运行时提交与 archive restore 复用历史不变量；archive 在此之前还必须做 strict canonical shape 校验。

### D2. Pet timeline

```ts
describeTavernPetRestoreImpact(sessionId, targetFloor)
restoreTavernPetToFloorInCurrentDbTransaction(input)
```

删除目标楼层后的 versions/activities，清掉保留版本旧 currentMarker，将最高 revision 设为唯一 current；无保留行即 undiscovered。impact 至少报告版本数、痕迹数、是否改变阶段/persona/pending 和受影响 coinDelta。

### D3. accepted rollback

同一事务表加入 Pet 两表，顺序固定：

```text
tasks → shop → bank → pet → economy → session
```

确认文案加入“住户状态与痕迹”。Pet 或 Economy 中途失败时所有领域不变化。

### D4. branch/delete

- 分支复制全部 Pet versions/activities，只 remap sessionId。
- version/activity/action/request/specimen 等稳定 ID 不重建。
- 删除会话的所有 session-owned table 清单加入两表。
- 检查临时恢复库、promote、失败清理和测试清理，不只改主删除函数。

### D5. archive v8

- 当前确认时 v7 升 v8；tables 加两张表，counts 加 `pet`。
- `remap → strict canonical parse → Pet history + cross-domain Economy validation → temp DB → promote`。
- 不能校验 canonical 副本后写原始脏对象。
- private axes/chat/pending 是合法档案事实，不得按 Public View 规则删除。
- 不读取 v7 Pet：v7 本身没有 Pet 表，不新增 legacy converter。

最低测试覆盖 undiscovered/egg/adult/pending evolution/聊天记忆/事件流水的导出恢复，以及非 canonical、断链、Activity/Economy 不匹配导致整次恢复失败。

## 7. 阶段 E：聊天、判词与剧情插曲 Prompt

新增：

```text
modules/tavern/shared/pet/pet-chat.ts
modules/tavern/shared/pet/pet-prompt.ts
```

修改：

```text
modules/tavern/app-src/runtime/run-once.ts
modules/tavern/tests/pet.test.ts
modules/tavern/tests/prompt.test.ts（若现有 Prompt 行为测试归于此）
```

### E1. Pet 聊天协议

`pet-chat.ts` 纯实现：

- 由 persona、私有轴、情绪、饱食、最近 6 轮、摘要、最近痕迹和玩家文本构造独立 messages。
- 明确“不是主线角色、不知道世界书、不执行工具、不输出经济/阶段/事件”。
- juvenile 与 adult 的 canonical text 都最多 120 Unicode code points；juvenile 的词汇少、短、像刚学会说话只属于 Prompt/persona 风格。
- 外部模型边界剥离 code fence，枚举所有完整 JSON object 并采用最后一个可宽松归一化的回复；同一 object 先用直接回复，再接受 `response` 等嵌套包装；全部不可用时才把去除 JSON object 后的普通正文作为 text。
- 未知字段丢弃并 warning；非法/缺失 face/motion/emotionShift 与可空文本按目标设计回落或截断；内部 canonical normalization 和 service 写入继续严格。

不要把模型原文或 request snapshot 存入 Pet state。Activity 只存经解析、截断后的用户可观察回复。

### E2. evolution 协议

pending snapshot 构造固定三段请求：经历、形态、看待玩家。解析只接受 20–80 Unicode code points、恰好三句且每句以 `。！？` 结束的判词，去 code fence/控制字符；失败由 persona 静态 verdict 回落。

自动处理器属于 Controller，不属于 `pet-chat.ts`。纯模块只生成 messages 和解析结果。

### E3. interference depth entry

`pet-prompt.ts`：

- 按截至当前 user 的 floor 读取当时 Pet state/Activity。
- 只选择与 runtime turn 对应的冻结 interference。
- 生成 depth=1、order `1_000_000_050`、layer `runtime-pet-interference`。
- 没有事件返回空数组，绝不写 DB。
- 文本固定边界声明与 `<pet_interference>` 标签；禁用词只扫描静态原模板，Activity 原文进入 Prompt 时转义 `& < >`。
- 含标签边界字符的联系人不作为目标，nibble 自然降级；只有四个 interference eventId 可以且必须携带 `injectedText`。投影以 eventId 与 action context 的 `knownTargetName` 重算静态正文，action/Activity 任一不等即 fail-open；查询、canonical、重复条目或因果失败也全部返回空数组。

主 RP `runtimeDepthEntries` 注册在 chance encounter 后、Shop 前。不要修改私人消息 context。

### E4. Prompt 测试

Prompt 是外部协议，允许精确格式断言：

- header/tag/顺序/单条 entry。
- 只在紧随的 turn 可见，生成失败与 reroll 可重现，下一 turn 消失。
- 开关、总闸和无目标降级已经在事件结算生效，投影不二次决策。
- current head 晚于 prompt floor 时不泄漏未来 Pet 事件。
- 私人消息、任务、Manager 和 Pet chat 中不存在该块。

## 8. 阶段 F：Controller 与跨标签页刷新

新增：

```text
modules/tavern/app-src/features/phone-os/apps/pet/useTavernPetController.ts
modules/tavern/app-src/features/phone-os/apps/pet/tavern-pet-presentation.ts
modules/tavern/app-src/features/phone-os/apps/pet/tavern-pet-errors.ts
modules/tavern/tests/pet-controller.test.ts
```

修改：

```text
modules/tavern/app-src/features/phone-os/useTavernPhoneController.ts
modules/tavern/app-src/features/phone-os/useTavernPhoneDomainSync.ts
modules/tavern/app-src/components/tavern-app-context.ts
modules/tavern/app-src/App.vue
```

### F1. Controller 所有权

管理：

- Public View、最近 30 Activity、loading/error。
- 输入、窝抽屉、命名 dialog、临时台词/murmur timer。
- 单一 Pet mutation owner 和单一模型 request owner。
- mutation owner 捕获 Controller 生命周期内的 epoch；archive/rollback/editor 只使 epoch 失效并取消模型请求，不提前释放仍在飞行的 mutation owner/busy。
- 聊天/evolution 的 AbortController、generation 和 stale 丢弃。
- 调服务后刷新 Pet/Wallet，按 Activity ID 派生 toast。

不管理：

- private state、axis、chat summary、事件选择、钱数计算。
- 乐观余额/饱食/形态。
- 持久 pending 锁或后台 timer。

### F2. 聊天流程

- 发送前重新检查阶段、main chat、archive/rollback/editor gate 和当前 Pet CAS；玩家文本 NFKC/去控制字符/整理空白后按 code point 截到 120，并先同步回输入框。
- 设置 request owner 后取得私有 chat snapshot，调用 delegate `runTavernOnce`。
- 解析成功才交给 service；事务成功后才展示回复。
- 普通正文、无用 JSON 前缀、多个候选和轻微 JSON 形状错误由宽松模型边界归一化；只有完全无可用文字、网络/abort 或 stale 才零提交。规范化后为空显示本地输入提示，不显示 Pet 拒绝态。
- 等待时禁用 Pet 动作；会话切换/scope dispose abort。

### F3. pending evolution

watch current view 的 pending 布尔值，并通过专用私有读取取得 request：

- main chat 运行时等待；结束后调度一次。
- request owner 相同不重复启动。
- provider unavailable/请求失败立即走静态 fallback commit。
- 提交时只校验 latest head 仍持有同 requestId；另一个标签页已解析则按 deterministic action replay 丢弃本地后到文案。
- App 是否打开不影响处理，因为 Controller 属于 Phone 根作用域。

### F4. Domain Sync

Pet fingerprint 至少包含：session exists、current revision/version、latest Activity ID/createdAt。变化时合并刷新 Pet；从连续新 versions 的 `activityId` 提取 toast 候选，类似 Bank settlement sync，但不触发 turn advance。

Phone 打开时同时 prepare Wallet 与 Pet，确保 home icon 有状态；进入 Pet 时再次并行 prepare Pet/Wallet。所有 liveQuery 随 session/scope 取消。

### F5. 最低 Controller 测试

- 快速双击只有一个 mutation。
- chat 等待时其他动作禁用，stale 结果不展示/不提交。
- 会话切换 abort，旧 finally 不清新 owner。
- archive/rollback/editor 在 DB Promise 飞行时失效 epoch，但 owner/busy 只由原 Promise finally 释放，旧结果不得更新 UI。
- NFKC 膨胀、IME/code-point 输入限制、请求失败保留实际发送文本。
- pending 成功、fallback、崩溃后恢复、跨 turn 等待和双标签页先到先得。
- 事务成功但 Wallet refresh 失败时提示“操作已完成，余额待刷新”，不谎报回滚。
- Activity toast 不因同 tab fingerprint 自激重复。
- Phone home 首次打开能看到真实 Pet icon。

## 9. 阶段 G：Phone OS UI 与最后注册

新增：

```text
modules/tavern/app-src/components/phone-os/apps/pet/*.vue
modules/tavern/app-src/styles/phone-os/pet.css
```

修改：

```text
modules/tavern/app-src/features/phone-os/phone-os-types.ts
modules/tavern/app-src/features/phone-os/phone-os-app-registry.ts
modules/tavern/app-src/styles.css
```

### G1. 注册

```text
id: pet
name/shortName: 不明物
rootPath: /room
order: 60（Bank 之后）
accent: 低亮灰绿/旧纸金，与 Wallet/Shop/Bank 区分
```

只有真实服务、Controller、根页面、错误态和图标全部接通后才注册。`onActivate` 并行 prepare Pet/Wallet。

### G2. 页面结构

- `TavernPetApp` 只编排 undiscovered/luring/present/dormant 和 drawer/dialog。
- `TavernPetStage` 负责 face、台词、motion 和可读状态，不决定 persona。
- `TavernPetActions` 只渲染 Public View availability 并发命令。
- `TavernPetChatBar` 只持有输入与提交事件。
- `TavernPetNestDrawer` 展示 nest/trace/toggle/rename，不读取 private state。
- `TavernPetIcon` 从 Pet context 读 Public View，不能自行 liveQuery。

### G3. 视觉与可访问性

- 近黑暗室、大字符脸、衬线台词、冷系统标签；不用卡片海和渐变紫。
- 不引入外部字体/图片/动画库。
- 手机窄屏不横溢；动作区在最窄宽度仍保持 44px 触控目标。
- focus-visible、aria live（模型回复/错误）、屏幕阅读状态文本齐全。
- reduced-motion 禁止位移/抖动，只保留短透明度变化。
- 亮色主题仍保留暗室作为产品空间，但边界/文字对比符合 Phone OS；不是简单 CSS invert。

不为 CSS 类名、文件数或源码字符串写测试。视觉用人工场景和浏览器检查。

## 10. 阶段 H：完整验证与生产产物

必须执行：

```powershell
npm run test:tavern
npx vue-tsc --noEmit -p tsconfig.tavern.json
npm run lint:tavern
npm run build:tavern
git diff --check
```

人工场景：

1. undiscovered → luring → egg → juvenile → adult → repattern。
2. egg/juvenile/adult 分别饿到 dormant，再唤醒。
3. 九种 persona、动作 overuse、toy cooldown、聊天成功/失败/stale。
4. 30 个事件用确定性开发入口逐条观察，但生产 UI 不暴露调试按钮。
5. interference 的正常生成、action/Activity 同时篡改时 fail-open、失败重试、reroll、下一 turn 消失和关闭开关。
6. 双标签页同时付费、聊天提交、主回合保存和 pending verdict。
7. 回滚到 lure/事件/聊天/进化前，钱包与 Pet 同步恢复。
8. archive v8 备份/恢复 egg、adult、pending verdict 和聊天记忆。
9. 桌面 phone、移动全屏、亮/暗主题、键盘导航、reduced-motion。
10. DevTools 确认 Phone context/DOM 不含 axes、chatMemory、cooldowns、pending snapshot。

生产产物与源码同一提交更新：

```text
modules/tavern/dist/tavern-app.js
modules/tavern/dist/tavern-app.css
modules/tavern/dist/tavern-build.json
```

## 11. 推荐提交切片

1. `feat(tavern): define pet rules personas and event catalog`
2. `feat(tavern): persist pet actions with atomic economy writes`
3. `feat(tavern): advance pet state with story turns`
4. `feat(tavern): include pet history in rollback and archives`
5. `feat(tavern): add pet chat and interference prompt contracts`
6. `feat(tavern): add pet controller and domain synchronization`
7. `feat(tavern): add unknown-resident phone app`
8. `build(tavern): rebuild pet app bundle`

若合并为一个提交，施工与 review 仍按同一顺序。禁止先注册入口、用假数据做 UI，再反推领域模型。

## 12. Review 清单

### 规则与目录

- [ ] phase 与 dormant 正交，唤醒不猜原阶段。
- [ ] 三轴字段名与正负语义一致；所有 intended adult delta 不被 trunc 成 0。
- [ ] blank 是三轴中性，不依赖随机全零。
- [ ] 30 条事件计数正确，普通事件有显式触发闸。
- [ ] milestone/status 优先且每 turn 至多一个自主事件。
- [ ] curio 不进入 Shop，无道具降级/过期变体残留。

### 数据与事务

- [ ] 只有两个 Pet 持久实体，pending 判词在 State 内有明确生命周期。
- [ ] 玩家动作校验 boundary/action/CAS；随机在校验后消费。
- [ ] Assistant/session/Pet/Activity/Economy 主回合原子。
- [ ] replay 返回 current head，不重复随机/扣款/Activity。
- [ ] history 可逐动作重放并交叉验证 Economy。

### 模型与 Prompt

- [ ] 模型请求全部在 transaction 外。
- [ ] chat unknown/越权字段无效，stale 结果零写入。
- [ ] pending evolution 崩溃可恢复，失败有静态 verdict。
- [ ] 常态零主 RP Prompt；interference 只一 turn、floor-aware、位于 Shop 前。
- [ ] interference 仅四个 eventId 可携带 `injectedText`，并在投影时按 action context 重算验证。
- [ ] 私人消息/任务/Manager 不含 Pet 插曲。

### 生命周期与 UI

- [ ] rollback/branch/delete/archive 覆盖两表与 Economy。
- [ ] 不存在 Pet legacy converter 或旧字段 fallback。
- [ ] Phone open 预加载 icon，入口最后注册。
- [ ] UI/Context/DOM 不含 axes/chatMemory/cooldowns/pending snapshot。
- [ ] session/scope 结束释放 liveQuery、AbortController、timer 和旧 owner。

## 13. 明确禁止的捷径

- 把 Pet 真状态放 Vue、localStorage 或单个可变 session 字段。
- 用 `dormant` 覆盖生命阶段，再加 `previousStage` 修补。
- 候选池非空就必触发事件，或用随机跑十万次代替规则证明。
- 为 Pet 修改 Shop inventory schema、商品目录或 Prompt。
- 在 Controller 计算 axis、persona、金额、事件或冷却。
- 在 Assistant 保存后另开 transaction “补推进” Pet。
- 在 Dexie transaction 内调用模型，或为模型请求新增永久 pending 表/心跳锁。
- 把 private state 交给 Controller 后靠“不显示”保密。
- reroll 重新抽 Pet 事件或重复资金结算。
- 回滚只退钱，不恢复 Pet state/Activity/chat memory。
- 为未发布构思稿增加 `wildness/greed/gloom`、`stage=dormant` 或 Shop item 兼容读取。
- 用源码 includes、文件清单或 CSS snapshot 冒充行为测试。
