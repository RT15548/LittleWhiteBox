# 小白银行 APP 施工方案

- 状态：阶段 A–C 已完成；阶段 D 待施工
- 依据：[小白银行 APP 目标设计](./bank-app-target-design.md)
- 原则：每个阶段都落在终态边界内；不提交可点击假入口、演示余额、客户端随机结果或永久兼容壳

## 1. 开工前边界检查

| 问题 | 结论 |
|---|---|
| 功能所有者 | `shared/bank`拥有产品、游戏、私有状态、公开投影、活动、结算和回滚；Phone Bank 只拥有交互态 |
| 唯一事实来源 | 可用余额来自 Economy；未结算头寸/游戏来自 current Bank version；已完成业务来自 Bank Activity |
| 临时态 vs 持久态 | 路由、表单、弹窗、展开、动画、busy 临时；头寸、隐藏随机结果、游戏步骤、活动和版本持久 |
| 外部依赖 | Tavern Session/Message、Economy、Phone OS、角色档案、accepted economic rollback |
| 注册入口 | Phone app registry；Phone domain sync；accepted economic rollback；archive/branch/delete 生命周期 |
| 删除路径 | 删 Bank 目录和注册、删两张表、移除档案与回滚、一次 schema 清理 |
| 兼容对象 | SillyTavern、当前浏览器/WebView、IndexedDB、现行角色档案；不存在旧 Bank 数据 |
| 最少必要测试 | 纯数学/状态机、脱敏 DTO、DB 原子性、幂等/CAS、回滚、档案、Controller 关键行为、构建 |

测试线 Bank 从未发布。DB 升级只创建空表；角色档案只认施工完成后的当前格式，不添加不存在的 Bank legacy 解析器。

## 2. 依赖方向

```text
Vue Components
      ↓
Phone Bank Controller ─────→ Wallet Controller（只读余额与刷新）
      ↓
shared/bank view/service ──→ shared/economy service
      ↓                              ↓
bankStateVersions / bankActivities  economyAccounts / economyTransactions

shared/accepted-economic-state
      ├─→ tasks timeline
      ├─→ shop timeline
      ├─→ bank timeline
      └─→ economy timeline
```

禁止依赖：

- Vue/Controller 不得 import 私有游戏状态或随机源。
- `games/*.ts`不得访问 IndexedDB、Vue、Phone OS 或 Economy。
- Economy 不得识别 Bank 产品、游戏或 Activity。
- Bank 不得修改 Prompt、Session State 或 Shop inventory。

## 3. 阶段 A：领域类型、产品、随机边界和纯游戏逻辑

新增：

```text
modules/tavern/shared/bank/bank-types.ts
modules/tavern/shared/bank/bank-products.ts
modules/tavern/shared/bank/bank-random.ts
modules/tavern/shared/bank/bank-invariants.ts
modules/tavern/shared/bank/bank-view.ts
modules/tavern/shared/bank/games/dice-bluff.ts
modules/tavern/shared/bank/games/push-your-luck.ts
modules/tavern/shared/bank/games/risk-ladder.ts
modules/tavern/tests/bank.test.ts
```

### A1. 类型边界

`bank-types.ts`定义：

- 产品、未结算头寸、三个私有游戏状态。
- Public View DTO。
- Activity discriminated union。
- State、StateVersion、精确 Action union。
- mutation 输入、结果、restore impact、错误码。

私有类型不得从 Phone Context 暴露。Controller 只拿：

```ts
interface TavernBankView {
    revision: number;
    versionId: string;
    currentTurn: number;
    deposits: TavernBankDepositView[];
    investments: TavernBankFundView[];
    activeGame?: TavernBankPublicGameView;
}
```

`TavernBankFundView`在到期结算前不含 `resolvedReturnBps`、`settlementAmount`。Dice active view 不含 `dealerDice`；Push active view 不含 `deck`。

### A2. 产品目录和整数数学

- 将六个已确认产品写为 `as const`静态目录。
- 静态目录拆成不可变合同注册表与在售货架；改价使用新合同 ID，下架不删除历史合同。
- 利率、罚金和收益区间全部为整数 bps。
- 产品目录初始化时验证 ID 唯一、范围闭合、金额安全、期限为正。
- `amountAtBps`、赔率分数和赔付 cap 都先检查乘法安全，再向下取整。
- 创建头寸时冻结确切结算金额，后续不从目录重新计算旧合同。

### A3. 随机源

`bank-random.ts`只暴露同步 `nextInt(maxExclusive)`及基于它的：

```text
rollDie
shuffle
drawInclusiveInteger
drawProbabilityBasisPoints
```

生产实现封装 `Math.random`，测试构造循环或耗尽即报错的确定性序列。禁止在 UI 调用随机函数，禁止引入 `getRandomValues`兼容分叉。

### A4. 骰局纯状态机

纯函数职责：

- 创建双方骰子。
- 规范化并验证 2–6 点叫数。
- 比较叫数严格递增。
- 计算万能一点与目标点总数。
- 精确二项分布概率。
- 生成合法庄家决策。
- 对质疑结果结算。

庄家候选生成必须先列出全部或一组确定的合法加叫，再由性格和 RandomSource 选择；不得先随机造数再靠 fallback 修补非法状态。

### A5. 翻倍收手纯状态机

- 创建 7 coin + 3 bomb 并洗牌。
- 每次 draw 只消费一张。
- coin 更新 `revealedCoins`和 `cashoutAmount`。
- bomb 产生 payout 0；第七枚 coin 自动 payout 350。
- Public View 只由剩余计数推导爆炸概率。
- cash-out 只能在至少一枚 coin 后执行。

### A6. 风险阶梯纯状态机

- 开局计算 `riskBase = floor(bet × 9 / 10)`。
- 三档使用整数概率与分数倍率。
- 每次 step 只消费一次 RandomSource。
- 成功金额向下取整并应用 50,000 cap。
- 第五次成功或达到 cap 自动终局。
- cash-out 只能在至少成功一层后执行。

### A7. 不变量

`bank-invariants.ts`检查当前模型，而不是“清洗”运行时脏数据：

- State arrays、ID 和安全整数 canonical。
- 头寸产品存在，turn/order 合法，冻结金额与静态合同规则一致。
- activeGame 唯一且 bet/step/history/deck/dice 结构合法。
- Dice bid 全部严格递增且轮次结构合法。
- Push deck 恰好包含 7 coin/3 bomb，revealed 与 cashout 一致。
- Ladder history 连续、金额与每一步结果一致。
- Activity 与 detail、amountIn/payout/net 一致。

归档和运行时提交复用同一共享不变量检查，但归档仍必须先做严格 canonical shape 校验。

### A8. 最低测试

- bps 金额、向下取整、溢出和产品边界。
- 骰局一点万能、合法加叫、极端概率、庄家不能非法出价、质疑双方。
- Push 牌堆排列、逐张消费、爆炸/全通、概率显示和最优期望 `140/3`。
- Ladder 三档成功/失败、五层、封顶、整数金额及理论条件期望。
- Private → Public projection 深拷贝且不存在四类隐藏字段。
- invariant 对每个真实损坏样本给出稳定错误。

不写“运行十万次必须落在某区间”的随机测试。阶段完成时仍没有 DB 和 UI。

## 4. 阶段 B：DB schema、服务层与 Economy 原子事务

新增：

```text
modules/tavern/shared/bank/bank-service.ts
```

修改：

```text
modules/tavern/shared/session-db.ts
modules/tavern/tests/session-db.test.ts
modules/tavern/tests/economy.test.ts 或 bank.test.ts
```

### B1. DB schema

Tavern Dexie 从 version 25 提升到 version 26，一次创建：

```ts
bankStateVersions:
    '[sessionId+revision], sessionId, versionId, &[sessionId+actionId], '
    + '&[sessionId+currentMarker], [sessionId+anchorOrder], updatedAt'

bankActivities:
    '[sessionId+id], sessionId, &[sessionId+sourceId], '
    + '[sessionId+anchorOrder], [sessionId+createdAt]'
```

旧会话自然得到空 Bank，不运行伪数据迁移。

### B2. 服务接口

建议公开：

```ts
getCurrentTavernBankView(sessionId)
listTavernBankActivities(sessionId, options)
settleDueTavernBankPositions(input)
openTavernBankDeposit(input)
withdrawTavernBankDepositEarly(input)
openTavernBankFund(input)
startTavernBankDiceGame(input)
bidTavernBankDiceGame(input)
challengeTavernBankDiceGame(input)
startTavernBankPushGame(input)
drawTavernBankPushCard(input)
cashOutTavernBankPushGame(input)
startTavernBankLadderGame(input)
stepTavernBankLadderGame(input)
cashOutTavernBankLadderGame(input)
```

不暴露通用 `applyGameStep(kind, payload)`；每个入口的合法输入由类型和服务同时收紧。

### B3. 共同事务 helper

建立 Bank 内部唯一 mutation runner，负责：

1. 规范化 session/action/expected version。
2. 在事务内先查 actionId 重放并核对动作输入；命中后直接返回当前 head 与原 actionRecord。
3. 非重放请求再校验 Phone boundary。
4. current version CAS。
5. 克隆并校验当前 State。
6. 结算所有 due positions。
7. 执行调用方提供的纯同步领域动作。
8. 写 Economy、Activity 和下一 Bank version。
9. touch session 一次。

调用方纯动作不得直接访问 Dexie 表。Mutation runner 必须处在已列出全部表的单一 Dexie transaction 内，不能使用会让事务失活的外部异步调用。

### B4. 建仓

定期和理财都必须：

- 从目录读取产品，不接受 UI 传来的期限/率/结算值。
- 校验金额范围和钱包余额。
- 理财在事务内通过 RandomSource 生成 `resolvedReturnBps`并冻结 settlementAmount。
- 写 `player → system:sink`流水。
- 创建 position 并追加版本。

定期提前支取：

- position 必须仍存在且尚未到期；若已经 due，由共同 runner 正常到期结算，提前支取动作以冲突失败或返回已结算事实，不能套用罚金。
- 使用冻结的 `earlyWithdrawalAmount`，不读当前目录。

### B5. 开局和每一步

- start 输入只包含 game kind 和合法 bet；Push 不接受 bet。
- activeGame 存在时任何 start 都拒绝，并返回现有 game 标识供 UI 跳转。
- wager、私有随机状态和 Bank version 同事务出现。
- 每个 step 先核对 active game kind、game ID 和合法状态，再调用对应纯函数。
- 终局时同事务写 payout（若大于 0）、Activity、移除 activeGame 和新版本。

### B6. 幂等

- 用户每次点击持有独立 actionId。
- 重放先于随机数消费。
- actionId 相同但业务参数不同，抛 `bank_action_conflict`。
- replay 返回当前 head 和原 actionRecord；不能把后续游戏步骤覆盖为旧步骤。
- Economy idempotency key 使用稳定 position/game ID，结算只允许一次。

### B7. 最低集成测试

- 建仓扣款和 position 同时出现；中途抛错两边都不变。
- 理财随机结果落库但 public result 不泄漏。
- wager 与 activeGame 原子；每一步刷新读回同一状态。
- 终局 payout、Activity、activeGame 清除原子。
- 余额不足、金额越界、已有游戏不产生任何写入。
- 快速双击/action replay 不二次扣款或抽取随机数。
- 双标签页旧版本不能操作。
- 后续 step 后重放旧 action 返回当前 head。
- 同一用户动作顺带结算 due positions 时只创建一个新版本。

## 5. 阶段 C：Bank 时间线、经济回滚与会话生命周期

新增：

```text
modules/tavern/shared/bank/bank-timeline.ts
```

修改：

```text
modules/tavern/shared/accepted-economic-state.ts
modules/tavern/app-src/features/accepted-rollback/accepted-rollback.ts
modules/tavern/shared/session-db.ts
modules/tavern/tests/session-db.test.ts
modules/tavern/tests/economy.test.ts 或 bank.test.ts
```

### C1. Bank timeline helper

公开：

```ts
describeTavernBankRestoreImpact(sessionId, targetFloor)
restoreTavernBankToFloorInCurrentDbTransaction(input)
```

restore helper：

- 删除 `anchorOrder > targetFloor`的 Bank versions 和 activities。
- 清除 retained versions 上所有旧 currentMarker。
- 将最高 revision retained version 设为唯一 current。
- 无 retained version 时回到空 Bank。
- 调用方控制是否 touch session。

影响预览至少报告：版本数、活动数、受影响头寸数、是否涉及 activeGame。

### C2. accepted economic restore

单一事务表加入两个 Bank 表，调用顺序固定：

```text
tasks → shop → bank → economy → session
```

`AcceptedStateRollbackImpact`加入 Bank；确认文案明确“银行头寸与对局”。Bank 或 Economy 中途失败时，任务、商店、银行和钱包全部保持原样。

### C3. branch/delete

- 分支复制 Bank 全版本和 Activity；只 remap `sessionId`。
- position/game/activity/source IDs 和 action facts 保持不变。
- 删除会话事务加入两个 Bank 表。
- 检查所有 session-owned table 清单，避免只修改主删除入口。

### C4. 最低测试

- 回滚到建仓前同时恢复钱包和 Bank。
- 回滚到到期结算前恢复未结算头寸并删除 payout/activity。
- 游戏跨两个剧情楼层操作后可回到中间步骤。
- 人为在 Bank restore 后抛错，全部领域不变化。
- 分支得到完整但互相独立的 Bank 历史。
- 删除会话不残留 Bank 行。

## 6. 阶段 D：角色档案 v7 与严格完整性

修改：

```text
modules/tavern/shared/character-archive-types.ts
modules/tavern/shared/character-archive-db.ts
modules/tavern/shared/character-archive-jsonl.ts（泛型已覆盖则不碰）
modules/tavern/shared/character-archive-server-storage.ts（泛型已覆盖则不碰）
modules/tavern/app-src/components/TavernCharacterWorkspacePanel.vue
modules/tavern/tests/character-archive.test.ts
```

要求：

- 当前角色档案格式从 v6 升至 v7。
- tables 加入 `bankStateVersions`和 `bankActivities`；counts 加 `bank`。
- 导入统一执行 `remap → strict canonical normalize/compare → shared invariant → temp DB write`。
- 不能只校验规范化副本后把原始脏 record 写入临时库。
- StateVersion 校验 revision 连续、actionId/currentMarker 唯一、anchor 与 turn 非回退、State canonical。
- 开仓 `startTurn`、开局 `startedAtTurn` 必须等于所属 StateVersion 的 `turn`。
- 每个版本必须且只能结算上一版本中 `maturityTurn <= turn` 的全部到期头寸。
- Activity 校验 sourceId 唯一、detail union、金额关系和 anchor。
- Bank private deck/dice/收益在档案里属于合法持久事实，不能因 public DTO 规则被导出器删除。
- 不支持 v6 Bank 数据：v6 本身没有 Bank 表；当前 importer 继续遵循项目现行 archive 版本策略，不额外添加 Bank 兼容转换。

最低测试：

- v7 导出/临时恢复/promote 后未到期理财保持同一隐藏结果。
- 进行中三个游戏分别恢复到当前步骤。
- 非 canonical 金额、牌堆、bid、history、currentMarker 或 Activity 导致整次恢复失败。
- remap 后 Bank 外键全部指向新 session，稳定 domain IDs 不变。

## 7. 阶段 E：Controller、惰性结算与跨标签页同步

新增：

```text
modules/tavern/app-src/features/phone-os/apps/bank/useTavernBankController.ts
modules/tavern/app-src/features/phone-os/apps/bank/tavern-bank-presentation.ts
modules/tavern/app-src/features/phone-os/apps/bank/tavern-bank-errors.ts
modules/tavern/tests/bank-controller.test.ts
```

修改：

```text
modules/tavern/app-src/features/phone-os/useTavernPhoneController.ts
modules/tavern/app-src/features/phone-os/useTavernPhoneDomainSync.ts
modules/tavern/app-src/components/tavern-app-context.ts
modules/tavern/app-src/App.vue
```

### E1. Controller 所有权

Controller 管理：

- 当前 TavernBankView、最近 50 Activity、loading/error。
- 当前金额输入、确认弹窗、展开结果和 route-local 临时态。
- 单一 mutation owner：`sessionId + actionId + actionKey`。
- 调用服务、丢弃旧异步结果、刷新 Bank/Wallet。

Controller 不管理：

- 私有 deck/dealerDice/hidden return。
- 余额副本或乐观金额。
- 游戏规则、庄家决策、概率、到期计算。
- 跨会话自动收手。

### E2. 惰性结算

`prepareBank`流程：

1. 读取当前 Bank View 与 Activity。
2. 捕获当前 Phone boundary。
3. 调用 settlement-only command。
4. 若有写入则刷新 Bank/Wallet；无 due 时零写入。

Phone Domain Sync 为 Bank 建立 fingerprint：

```text
session exists + session.state.turn + current revision/versionId
+ latest Activity id/createdAt
```

turn 变化时调度一次可合并的 settle/refresh。多标签页冲突不显示成用户操作失败，只刷新到赢家结果。Bank version 更新触发的第二轮检查必须识别无 due 并停止，不能自激循环。

### E3. 交互门禁

- 会话不存在、归档同步、记忆编辑、accepted rollback 或已有 mutation 时禁写。
- 主 RP generating 不禁写；提交仍捕获并事务内重查 Phone boundary。
- 弹窗打开后门禁、余额、current Bank version 都可能变化；confirm 前必须重新检查。
- 切会话立即增加 controller generation、清空弹窗/form/result，并让旧 owner 失效。

### E4. Domain Sync

- Bank 是独立订阅，不能借 Shop fingerprint。
- Bank 写入通常同时触发 Economy；两个 scheduler 各自只刷新所属 view。
- 所有 subscription 随 session 变化和 scope dispose 取消。

### E5. 最低 Controller 测试

- 快速双击只提交一次。
- 弹窗打开后余额/门禁变化阻止提交。
- 旧会话结果不能替换新会话 Bank View，也不能清空新 busy owner。
- 切会话不调用 cash-out/settle game；返回后 activeGame 仍在。
- 事务已成功但 Wallet refresh 失败时提示“已完成，余额显示待刷新”，不谎报失败。
- 跨标签页 due settlement 只展示一次结果。

## 8. 阶段 F：Phone OS UI、注册和资源释放

新增：

```text
modules/tavern/app-src/components/phone-os/apps/bank/*.vue
modules/tavern/app-src/styles/phone-os/bank.css
```

修改：

```text
modules/tavern/app-src/features/phone-os/phone-os-types.ts
modules/tavern/app-src/features/phone-os/phone-os-app-registry.ts
modules/tavern/app-src/styles.css
```

### F1. APP 注册

```text
id: bank
name/shortName: 银行
rootPath: /vault
order: 50（Shop 之后）
accent: 深墨绿金，不与 Wallet 金、Shop 朱红混淆
```

`onActivate`并行 prepare Bank 和 Wallet。不得注册尚未可用的空 APP；阶段 F 必须把根路由、错误态和真实服务一起接通后再提交入口。

### F2. 统一壳与视觉断层

- 根标题无副标题；不显示英文眉题或“XX 钱庄”等装饰小字。
- 金库采用墨绿票据；赌坊采用暗红桌毡；根导航和布局骨架不变。
- 所有主要图形完整显示，不放进小圆圈。
- 继承 Phone OS 本地字体和 Material Symbols，不增加外部字体请求。
- 触控目标、focus-visible、暗色/亮色和 reduced-motion 与现有 APP 同标准。

### F3. 页面行为

- `/vault`：头寸、产品、金额确认、提前支取确切到账。
- `/floor`：三游戏大厅、activeGame 唯一继续入口。
- 三个对局页只根据 Public View 渲染，点击只发出领域动作。
- `/records`：最近 50 Activity、净盈亏、盈利局比例和可展开终局详情。
- 余额按钮进入 Wallet；不另写 Bank balance。
- 路由离开卸载游戏 DOM；dialog/result 关闭释放引用。

### F4. 用户可观察验证

- 金库/赌坊/账目无多余副标题。
- 三种金额边界、余额不足和 activeGame 冲突文案明确。
- Dice 控件无法提交非法叫数。
- Push 概率与 State 派生值一致。
- Ladder 按钮展示 exact success amount，cap/自动结算可见。
- 刷新浏览器后恢复当前步骤。
- 切会话不结算旧游戏，返回可继续。

不为 CSS 类名、组件文件数量或源码字符串写测试。

## 9. 阶段 G：完整验证与生产产物

必须执行：

```powershell
npm run test:tavern
npx vue-tsc --noEmit -p tsconfig.tavern.json
npm run lint:tavern
npm run build:tavern
git diff --check
```

人工场景：

1. 亮色/暗色、桌面手机壳、移动全屏和 reduced-motion。
2. 每个产品建仓、到期、提前支取及隐藏收益。
3. 三个游戏从开局到每一种终局，期间刷新和切标签页。
4. 生成中进行 Bank 操作恰逢 RP 保存时的 timeline conflict。
5. 双标签页同时操作/结算，旧页面只刷新不重放。
6. 回滚到建仓前、结算前、游戏中间和开局前。
7. 角色档案备份/恢复一局进行中游戏和一笔隐藏理财。
8. DevTools 检查 Controller/Phone context/DOM 不含活跃 dealerDice、deck、resolved return。

生产 bundle 与源码同一提交更新：

```text
modules/tavern/dist/tavern-app.js
modules/tavern/dist/tavern-app.css
modules/tavern/dist/tavern-build.json
```

Bank 不修改 host prompt 产物，因为它没有 Prompt 或 host 注册。

## 10. 推荐提交切片

1. `feat(tavern): add bank products and game state machines`
2. `feat(tavern): persist bank state with atomic economy writes`
3. `feat(tavern): include bank state in rollback and archives`
4. `feat(tavern): add bank controller and domain synchronization`
5. `feat(tavern): add phone bank vault and strategy games`
6. `build(tavern): rebuild bank app bundle`

若团队一次提交，也必须按同一顺序实现、验证和 review；不能先写 UI 假数据再反推领域模型。

## 11. Review 清单

### 数学与状态机

- [ ] 所有钱数和 bps 是安全整数，乘法后向下取整。
- [ ] 定期/理财在建仓时冻结确切结算金额。
- [ ] Dice face 只允许 2–6，bids 严格递增。
- [ ] Dealer response 与玩家 bid 在同一事务步骤完成。
- [ ] Push deck 为 7/3 且不进入 Public View。
- [ ] Ladder 使用 90% riskBase、公平条件倍率、五层和 50,000 cap。
- [ ] 没有 `×1.5`通关奖励或旧 `1.3/2/4`倍率残留。

### 数据与事务

- [ ] 两个 Bank 表的所有者、生命周期、分支/删除/档案完整。
- [ ] 每个非重放写入校验 Phone boundary、actionId、revision/versionId。
- [ ] 随机数只在校验通过后由服务消费。
- [ ] Economy、Activity、StateVersion 同事务。
- [ ] 失败局不写零金额流水。
- [ ] replay 返回 current head + historical actionRecord。
- [ ] due settlement 与同次用户动作合并为一个 Bank version。

### 安全与视图

- [ ] Controller 类型和运行时对象都不含活跃 dealerDice/deck。
- [ ] 未到期理财 view 不含 resolvedReturn/settlementAmount。
- [ ] Public View 是新对象，不引用 private state。
- [ ] UI 不生成随机数、不决定庄家动作、不计算最终赔付。
- [ ] 文档和 UI 不宣称本地数据防篡改。

### 回滚与生命周期

- [ ] tasks/shop/bank/economy 同事务回滚。
- [ ] Bank Activity 与 State 使用同一 targetFloor。
- [ ] branch/delete/archive 覆盖两个表。
- [ ] v7 restore 严格 canonical，不能校验副本后写原始脏数据。
- [ ] 切会话只暂停，不自动结算 activeGame。

### UI 与资源

- [ ] 无副标题、小圆圈图标和第二份余额。
- [ ] 金库与赌坊视觉分区但共享 Phone OS 骨架。
- [ ] 所有按钮展示确切金额、概率或禁用原因。
- [ ] route/dialog/result 卸载后释放 DOM 和引用。
- [ ] liveQuery 在 session/scope 生命周期结束时 unsubscribe。

## 12. 明确禁止的捷径

- 在 Vue、Controller 或 localStorage 保存真实游戏状态。
- 把 active game 整局留在内存，终局才写 DB。
- 将 dealerDice、deck、resolved return 交给 Controller 后仅靠“不显示”隐藏。
- 使用浮点余额、四舍五入或从 UI 接受赔率/利率。
- 在 Dexie transaction 中等待网络、模型或其他外部异步随机源。
- action retry 重新抽随机数或重复扣款。
- 会话切换时发起后台 cash-out。
- 用 `gambleHistory`数组复制进每个 StateVersion。
- 回滚只退钱，不恢复游戏步骤和 Activity。
- 为测试线不存在的 Bank v0/v1 添加兼容读取器。
- 用蒙特卡洛全绿代替状态机和精确期望证明。
