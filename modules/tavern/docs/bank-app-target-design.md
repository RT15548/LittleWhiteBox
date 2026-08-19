# 小白银行 APP 目标设计

- 状态：已确认，供实现团队施工
- 适用范围：小白酒馆 Tavern 模块 / 小号测试线
- 确认日期：2026-07-26

## 1. 产品定义

小白银行是钱包之上的资金运作层。它让小白币除了赚取和消费，还能被锁定、承担风险并在纯规则游戏中博弈。

```text
任务（赚）→ 钱包（可用余额）→ 商店（消费）
                ↓
              银行（锁定或下注）
                ↓
          结算返还钱包 / 亏损归零
```

它不是新的主要收入来源，不生成剧情，不改变角色状态，也不调用模型。银行只消费 Tavern 已有的会话时间线、主 RP 回合和 Economy 账本能力。

### 已确认产品决策

- 金库提供三种定期存单与三种浮动理财。
- 赌坊提供骰局、翻倍或收手、风险阶梯三个多步策略游戏。
- 银行零 LLM 调用、零 Prompt 注入。
- 钱包可用余额仍由 Economy 账户唯一决定；锁定资产与进行中对局由 Bank 领域拥有。
- 每个会话同时最多存在一局进行中的游戏。
- 切换会话只暂停并释放当前 UI 临时态，不产生自动结算写入；返回原会话后恢复对局。
- 主 RP 回合只推进定期和理财的到期时间，不推进赌局步骤。
- 所有钱数都是安全整数；利率和收益率使用整数基点，不持久化浮点金额。
- 风险阶梯采用数学闭合后的返还规则，不使用原草案中玩家正期望的 `1.3 / 2 / 4` 倍率，也没有额外的通关 `×1.5`。

## 2. 核心不变量

1. Economy 玩家账户是可用余额的唯一事实来源；Bank 不保存余额副本。
2. 当前 Bank 状态版本是未结算存单、未结算理财与进行中对局的唯一事实来源。
3. `bankActivities`是已完成银行业务的唯一领域历史；它不是钱包流水副本。
4. Bank 状态、Bank Activity 与资金流水必须在同一个 IndexedDB 事务内提交或回滚。
5. 所有写入均校验最新 Phone 消息边界、`actionId`、`revision + versionId`，不信任 UI 快照。
6. 产品价格、期限、概率、赔率和上限只从静态代码目录读取，不能由 UI 或模型传入。
7. 随机结果只在 Bank 服务层产生；Vue 和 Controller 不生成或选择结果。
8. 完整牌堆、庄家骰子和未揭晓理财收益不得进入 Controller/Vue DTO。
9. 每个玩家动作都是一次独立持久化事务；刷新或切标签页后从持久状态恢复。
10. 到期检查是写事务内部的纯前置步骤；只读投影不得偷偷结算或修改状态。
11. 请求重放不会重复扣款、重复抽牌、重复掷骰或重复结算。
12. 剧情回滚必须在一个事务内共同恢复任务、商店、银行状态、银行活动与钱包。
13. 会话切换、APP 关闭、折叠、页面路由和表单都是临时 UI 状态，不写入 IndexedDB。
14. 不宣称本地浏览器数据具有服务器级防篡改能力；安全边界是防止正常应用层意外泄漏。

## 3. 功能所有权与依赖边界

### Bank 领域拥有

- 定期与理财产品目录及合同金额计算。
- 三个游戏的合法动作、概率、状态机、庄家决策和结算。
- 私有持久状态、对外脱敏投影、状态版本和活动历史。
- 到期结算、提前支取、下注、游戏步骤和赔付。
- Bank 时间线回滚 helper、完整性校验和领域错误。
- Bank Controller、UI、展示投影与用户文案。

### 通用层仅提供

- Economy 账户、整数余额和不可变流水。
- Tavern 会话、消息时间线与主 RP 回合。
- Phone OS APP 注册、路由、导航和全局 toast。
- 角色档案导入导出框架。

禁止反向依赖：Economy、通用消息组装器、任务和 Shop 不得 import Bank。`session-db.ts`只声明 Bank 表和记录类型，不承载 Bank 业务规则。

## 4. 持久实体与生命周期

Bank 只新增两个持久实体。

### 4.1 `bankStateVersions`

**为何不能是临时态**：存单跨数十个主回合存在，多步游戏必须在刷新、崩溃和切标签页后恢复，且剧情回滚需要历史版本。

**所有者**：`shared/bank`。

**生命周期**：随会话创建为空；Bank 写入时追加版本；分支时复制并替换 `sessionId`；回滚时删除未来版本并恢复 current；删除会话时清除；角色档案导出和恢复。

### 4.2 `bankActivities`

**为何不能塞进状态版本**：把最近 50 条历史复制进每个游戏步骤会产生重复增长；钱包流水又无法表达零赔付失败局、最终骰面和阶梯路线。

**所有者**：`shared/bank`。

**生命周期**：存单、理财或游戏完成时同事务追加一条；UI 按索引读取最近 50 条但底层不为显示上限破坏历史；回滚删除目标楼层之后的记录；分支、删除和档案与会话同行。

Bank Activity 是用户可观察的业务事实，不是缓存。删除 Bank 功能时两个表一起删除。

## 5. 终态目录

```text
modules/tavern/
├─ docs/
│  ├─ bank-app-target-design.md
│  └─ bank-app-implementation-plan.md
├─ shared/bank/
│  ├─ README.md
│  ├─ bank-types.ts
│  ├─ bank-products.ts
│  ├─ bank-random.ts
│  ├─ bank-invariants.ts
│  ├─ bank-view.ts
│  ├─ bank-service.ts
│  ├─ bank-timeline.ts
│  └─ games/
│     ├─ dice-bluff.ts
│     ├─ push-your-luck.ts
│     └─ risk-ladder.ts
├─ app-src/features/phone-os/apps/bank/
│  ├─ useTavernBankController.ts
│  ├─ tavern-bank-presentation.ts
│  └─ tavern-bank-errors.ts
├─ app-src/components/phone-os/apps/bank/
│  ├─ TavernBankApp.vue
│  ├─ TavernBankIcon.vue
│  ├─ TavernBankVault.vue
│  ├─ TavernBankFloor.vue
│  ├─ TavernBankDiceGame.vue
│  ├─ TavernBankPushGame.vue
│  ├─ TavernBankLadderGame.vue
│  ├─ TavernBankRecords.vue
│  └─ TavernBankActionDialog.vue
├─ app-src/styles/phone-os/bank.css
└─ tests/
   ├─ bank.test.ts
   └─ bank-controller.test.ts
```

三个游戏已有独立规则、状态和测试，因此从第一版就属于三个纯逻辑文件；Vue 不得拥有游戏判断或概率计算。

## 6. 金额与随机数规则

### 6.1 整数金额

```ts
const BASIS_POINTS = 10_000;

function amountAtBps(principal: number, bps: number): number {
    return Math.floor(principal * (BASIS_POINTS + bps) / BASIS_POINTS);
}
```

- 所有输入金额必须是正安全整数并满足产品范围和下注步长。
- 所有乘法结果向下取整，不能使用四舍五入制造额外小白币。
- 每次计算后再次验证 `Number.isSafeInteger`和全局赔付上限。
- 产品使用 `interestBps`、`earlyPenaltyBps`、`returnRangeBps`，不使用 `0.06`一类浮点合同值。

### 6.2 合同冻结

存入时从静态目录计算并持久化确切合同事实：

- 定期：`maturityAmount`、`earlyWithdrawalAmount`。
- 理财：`resolvedReturnBps`、`settlementAmount`。

后续目录改价、改名或删除产品，不能改变已创建合同的金额。UI 未到期前不得取得理财的 `resolvedReturnBps`或 `settlementAmount`。

实现上分为两层：不可变合同注册表保留所有曾发布的 ID 与财务条款；在售货架只列允许新开户的合同 ID。改价必须发布新合同 ID，下架只移出货架，历史校验、持仓投影和 Activity 仍从合同注册表读取。

### 6.3 随机源

```ts
interface TavernBankRandomSource {
    nextInt(maxExclusive: number): number;
}
```

- 生产默认实现封装同步 `Math.random`；当前项目禁止依赖浏览器 Crypto API，且本地 IndexedDB 不是防篡改服务器。
- 测试注入确定性整数序列，精确验证每条状态转换。
- 洗牌使用服务层 Fisher–Yates；理财收益从闭区间整数基点中抽取；阶梯每次选择时抽一次。
- 服务先完成边界、幂等和 CAS 校验，再消耗随机数。
- 如果未来要求真正防作弊，必须新增服务器权威随机协议，不能以 Web Crypto 兼容分支冒充安全边界。

## 7. 金库领域模型

### 7.1 静态产品

```ts
interface TavernBankDepositProduct {
    id: string;
    name: string;
    lockRounds: number;
    interestBps: number;
    earlyPenaltyBps: number;
    minAmount: number;
    maxAmount: number;
}

interface TavernBankFundProduct {
    id: string;
    name: string;
    description: string;
    lockRounds: number;
    returnRangeBps: { min: number; max: number };
    riskLevel: 'low' | 'medium' | 'high';
    minAmount: number;
    maxAmount: number;
}
```

#### 定期产品

| ID | 名称 | 锁定主回合 | 到期收益 | 金额 | 提前损失 |
|---|---|---:|---:|---:|---:|
| `short-term` | 短期存单 | 10 | +600 bps | 100–2000 | 300 bps |
| `mid-term` | 中期存单 | 25 | +1800 bps | 200–5000 | 500 bps |
| `long-term` | 长期存单 | 50 | +4500 bps | 500–10000 | 1000 bps |

#### 理财产品

| ID | 名称 | 锁定主回合 | 结算收益区间 | 风险 | 金额 |
|---|---|---:|---:|---|---:|
| `steady-fund` | 稳健基金 | 20 | -500–+2000 bps | 低 | 200–3000 |
| `growth-fund` | 成长基金 | 30 | -2000–+5000 bps | 中 | 500–5000 |
| `venture-fund` | 风险基金 | 40 | -5000–+15000 bps | 高 | 1000–10000 |

整数基点在区间内均匀抽取，理论平均收益分别为 +750、+1500、+5000 bps；实际金额受向下取整影响。

### 7.2 未结算头寸

```ts
interface TavernBankDepositPosition {
    id: string;
    productId: string;
    principal: number;
    startTurn: number;
    maturityTurn: number;
    maturityAmount: number;
    earlyWithdrawalAmount: number;
    openedAtOrder: number;
    openedAt: number;
}

interface TavernBankFundPosition {
    id: string;
    productId: string;
    principal: number;
    startTurn: number;
    maturityTurn: number;
    resolvedReturnBps: number;
    settlementAmount: number;
    openedAtOrder: number;
    openedAt: number;
}
```

当前 State 只保存未结算头寸。到期或提前支取后，它从 State 移除并产生一条 Activity；不持久化 `matured`但尚未付款的中间状态。

## 8. 赌坊规则

### 8.1 共同规则

- 开局时从玩家账户扣除下注，创建 `activeGame`，同事务提交。
- 对局中每次玩家动作都创建一个 Bank 版本。
- 结束时从 `activeGame`移除，按结果赔付并追加一条 Activity。
- 失败局赔付为 0，不伪造零金额 Economy 流水；开局 wager 与 Bank Activity 共同表达完整结果。
- 一个会话有 activeGame 时不能开始第二局，但可以继续当前游戏。
- 切会话、关闭 APP 或刷新不会自动收手或改变结果。

### 8.2 骰局

#### 规则闭合

- 玩家和庄家各 5 颗骰子；开局一次性生成并持久化。
- 玩家只能看到自己的骰子，庄家骰子只在终局 Activity / 结算结果中公开。
- 一点是万能牌；合法叫面只允许 2–6，避免“一点既是叫面又是万能牌”的歧义。
- 叫数为 `(count, face)`；后叫必须 `count`更大，或 `count`相同且 `face`更大。
- `count`范围 1–10；不存在更高合法叫数时只能质疑。
- 质疑时，双方所有等于目标点或一点的骰子都计入。实际数量不少于叫数则叫方胜，否则质疑方胜。

#### 事务节奏

持久中的骰局永远等待玩家动作：

1. 玩家提交加叫或质疑。
2. 玩家质疑时立即结算。
3. 玩家加叫时，服务在同一事务中运行庄家决策。
4. 庄家若质疑则立即结算；若加叫，则把庄家叫数一并写入同一新版本并重新等待玩家。

不持久化 `dealer-thinking`，不依赖 timer，不让 Controller 补做庄家回合。

#### 庄家计算

庄家评估玩家当前叫数时：

- 已知自己匹配数 `k`，所需玩家匹配数 `m = count - k`。
- 玩家每颗未知骰匹配目标的概率是 `2/6 = 1/3`。
- 使用二项分布精确计算 `P(X >= m), X ~ Binomial(5, 1/3)`。
- `P < 0.25`时质疑，`P > 0.55`时优先合法加叫，中间区间由固定平衡型性格和服务随机源决定。
- 加叫候选必须先经过同一合法性函数，不允许庄家绕过状态机。

#### 金额

- 下注 50–500，步长 10。
- 玩家获胜的总赔付为 `bet × 19 / 10`；由于步长为 10，结果始终为整数。
- `×1.9`只表示双方胜率各 50%时的基准返还率 95%，不是对任意玩家策略保证固定 5%庄家优势。

### 8.3 翻倍或收手

- 固定入场费 50。
- 牌堆 10 张：7 张金币、3 张炸弹，开局洗牌后只进入私有 State。
- 每张金币使当前可收手金额增加 50；炸弹立即以 0 赔付结束。
- 活跃期间公开：已翻金币数、剩余牌数、剩余炸弹数、下一张爆炸概率、当前可收手金额。
- 因为活跃状态下所有已翻牌都只能是金币，剩余炸弹数始终是 3；爆炸后对局已经结束。
- 下一张爆炸概率精确为 `remainingBombs / remainingCards`。
- 第 7 张金币成功后自动以 350 赔付结算。

该规则下风险中性最优策略是获得第二张金币后收手，50 入场费的精确最优期望赔付为 `140/3 ≈ 46.67`，基准庄家优势约 6.67%。产品文案不得写成 8%或“炸弹率到 50%才是最优收手”。

完整 `deck`永不进入 Bank public view；Controller 只能得到派生统计。

### 8.4 风险阶梯

#### 返还结构

- 下注 30–800，步长 10。
- 开局先形成不可直接收手的内部风险本金：`riskBase = floor(bet × 0.9)`。
- 每层从稳、中、险三档中选择；成功后得到新的可收手金额，失败以 0 赔付结束。
- 第一层以 `riskBase`为计算基数，后续层以当前可收手金额为基数。

| 选择 | 成功率 | 成功金额计算 | 条件期望（取整前） |
|---|---:|---:|---:|
| 稳 | 80% | `floor(current × 5 / 4)` | `current` |
| 中 | 55% | `floor(current × 20 / 11)` | `current` |
| 险 | 30% | `floor(current × 10 / 3)` | `current` |

三档取整前条件期望相同，只改变成功率和波动；初始 10%风险成本形成理论返还率 90%。向下取整和赔付封顶只会降低返还，不会把游戏变成玩家正期望。

- 最多成功 5 层；成功第 5 层后自动结算。
- 不再额外乘 `1.5`通关奖励。
- 单局总赔付封顶 50,000；任一步达到封顶立即以“封顶”结算。
- 每个按钮直接展示此次成功后的确切整数金额；不能只显示倍率。
- 至少成功一层后才出现收手按钮。

## 9. 私有状态、公开视图与活动历史

### 9.1 当前状态

```ts
interface TavernBankState {
    openDeposits: TavernBankDepositPosition[];
    openInvestments: TavernBankFundPosition[];
    activeGame?:
        | { kind: 'dice'; game: TavernBankPrivateDiceGame }
        | { kind: 'push'; game: TavernBankPrivatePushGame }
        | { kind: 'ladder'; game: TavernBankPrivateLadderGame };
}
```

私有游戏状态使用以下闭合结构：

```ts
type TavernBankDieFace = 1 | 2 | 3 | 4 | 5 | 6;
type TavernBankBidFace = 2 | 3 | 4 | 5 | 6;

interface TavernBankDiceBid {
    by: 'player' | 'dealer';
    count: number;
    face: TavernBankBidFace;
}

interface TavernBankPrivateDiceGame {
    id: string;
    bet: number;
    playerDice: [TavernBankDieFace, TavernBankDieFace, TavernBankDieFace, TavernBankDieFace, TavernBankDieFace];
    dealerDice: [TavernBankDieFace, TavernBankDieFace, TavernBankDieFace, TavernBankDieFace, TavernBankDieFace];
    bids: TavernBankDiceBid[];
    startedAtTurn: number;
    startedAtOrder: number;
    createdAt: number;
}

interface TavernBankPrivatePushGame {
    id: string;
    bet: 50;
    deck: ('coin' | 'bomb')[];
    drawIndex: number;
    revealedCoins: number;
    cashoutAmount: number;
    startedAtTurn: number;
    startedAtOrder: number;
    createdAt: number;
}

interface TavernBankLadderSuccessStep {
    floor: number;
    choice: 'safe' | 'medium' | 'risky';
    amountAfterSuccess: number;
}

interface TavernBankPrivateLadderGame {
    id: string;
    bet: number;
    riskBase: number;
    completedFloors: number;
    cashoutAmount: number;
    history: TavernBankLadderSuccessStep[];
    startedAtTurn: number;
    startedAtOrder: number;
    createdAt: number;
}
```

活跃 Dice 的 bids 只能为空或以 dealer bid 结尾，因此持久状态始终等待玩家。活跃 Push 尚未翻到 bomb，故 `drawIndex === revealedCoins`。活跃 Ladder 的 history 只含成功步骤；失败选择只进入终局 Activity。

私有游戏状态包含恢复所需的完整骰子、牌堆和步骤历史。`bank-view.ts`必须生成新的脱敏对象，禁止把私有对象引用直接交给 Controller。

### 9.2 活动记录

```ts
interface TavernBankActivityRecord {
    sessionId: string;
    id: string;
    sourceId: string;              // position id 或 game id
    detail: TavernBankActivityDetail;
    amountIn: number;              // principal 或 bet
    payout: number;
    net: number;                   // payout - amountIn
    anchorOrder: number;
    createdAt: number;
}
```

`detail`是严格 discriminated union，而不是自由对象：

```ts
type TavernBankActivityDetail =
    | {
        kind: 'deposit';
        productId: string;
        outcome: 'matured' | 'withdrawn-early';
      }
    | {
        kind: 'fund';
        productId: string;
        resolvedReturnBps: number;
      }
    | {
        kind: 'dice';
        result: 'player-win' | 'dealer-win';
        challenger: 'player' | 'dealer';
        finalBid: TavernBankDiceBid;
        bids: TavernBankDiceBid[];
        playerDice: TavernBankPrivateDiceGame['playerDice'];
        dealerDice: TavernBankPrivateDiceGame['dealerDice'];
      }
    | {
        kind: 'push';
        outcome: 'cashed-out' | 'busted' | 'cleared';
        revealedCoins: number;
      }
    | {
        kind: 'ladder';
        outcome: 'cashed-out' | 'failed' | 'cleared' | 'capped';
        steps: Array<{
            floor: number;
            choice: 'safe' | 'medium' | 'risky';
            success: boolean;
            amountAfterStep: number;
        }>;
      };
```

终局 Dice 的双方骰子可以进入 Activity 和结果页；活跃状态下仍不可进入 Public View。Push Activity 不保存或公开整副 deck。

索引建议：

```text
[sessionId+id],
sessionId,
&[sessionId+sourceId],
[sessionId+anchorOrder],
[sessionId+createdAt]
```

### 9.3 状态版本

```ts
interface TavernBankStateVersionRecord {
    sessionId: string;
    revision: number;
    versionId: string;
    currentMarker?: 'current';
    actionId: string;
    action: TavernBankStateAction;
    anchorOrder: number;
    turn: number;
    state: TavernBankState;
    createdAt: number;
    updatedAt: number;
}
```

`turn`归该 StateVersion 所有，表示动作原子提交时的主回合。它随版本分支复制，随楼层回滚、会话删除一起删除；事务失败不产生版本。该字段必须持久化，因为归档恢复需要在重启后证明开仓/开局回合和到期结算时点，不能从当前 session turn 反推历史。

索引与 Shop 一致：

```text
[sessionId+revision],
sessionId,
versionId,
&[sessionId+actionId],
&[sessionId+currentMarker],
[sessionId+anchorOrder],
updatedAt
```

`TavernBankStateAction`必须是明确动作的联合类型，不使用模糊的 `game-step`：

```text
deposit-open / deposit-withdraw-early / fund-open / settle-due
dice-start / dice-bid / dice-challenge
push-start / push-draw / push-cash-out
ladder-start / ladder-step / ladder-cash-out
```

动作记录保存验证幂等重放所需的规范化业务输入和本次顺带结算的 position IDs，但不重复保存整个 State。

## 10. 写入、幂等与原子性

### 10.1 所有写入的共同输入

```ts
interface TavernBankMutationBoundary {
    sessionId: string;
    boundary: TavernExpectedPhoneBoundary;
    actionId: string;
    expectedRevision: number;
    expectedVersionId: string;
}
```

事务至少包含：

```text
messages + sessions + bankStateVersions + bankActivities
+ economyAccounts + economyTransactions
```

`messages`只读，用于保证操作仍锚定在确认时看到的剧情位置；它不是多余的写表。

### 10.2 统一事务顺序

```text
校验 session，并按 actionId 查找重放、核对动作语义
→ 非重放请求再校验 Phone 消息边界
→ 校验 revision + versionId CAS
→ 克隆 current Bank state
→ 结算 maturityTurn <= currentTurn 的全部头寸
→ 应用本次用户或系统动作
→ 写 Economy 流水与 Bank Activity
→ 追加一个 Bank current 版本
→ touch session 一次
```

如果只有到期结算而没有其他动作，使用 `settle-due`。如果用户动作同时遇到已到期头寸，结算和用户动作合并在同一个新版本中，避免先结算再让用户因 revision 改变重做确认。

### 10.3 重放结果

与 Shop 一致，幂等重放返回：

- `record`：当前最新 head。
- `actionRecord`：最初提交该 actionId 的历史版本。
- 本次动作的 Activity / Economy 结果。
- `replay: true`。

后续动作已经推进 head 时，重放不能把 UI 拉回历史版本。

### 10.4 Economy 流水

```text
定期锁定：bank_deposit_lock   / bank:lock:{positionId}
理财锁定：bank_fund_lock      / bank:lock:{positionId}
下注：    bank_wager          / bank:wager:{gameId}
头寸结算：bank_settlement     / bank:settle:{positionId}
游戏赔付：bank_payout         / bank:payout:{gameId}
```

锁定和下注：`player → system:sink`。结算和赔付：`system:sink → player`。系统账户允许透支，但所有玩家金额仍必须保持安全整数。

失败游戏不写金额为 0 的假流水；Activity 记录失败，wager 流水已经表达损失。

## 11. 到期与回合

`currentTurn`只取成功保存的主 RP Assistant 回合计数：

```ts
maturityTurn = startTurn + lockRounds;
due = currentTurn >= maturityTurn;
remainingRounds = Math.max(0, maturityTurn - currentTurn);
```

- 私人消息、任务生成、Manager、助手聊天和赌局步骤不推进到期时间。
- 不运行 timer，不持久化 `remainingRounds`。
- 打开 Bank、Bank 任意写操作和主 RP turn fingerprint 变化时尝试惰性结算。
- 无到期项目时结算检查必须是零写入。
- 多标签页同时发现到期时，由 actionId/版本 CAS 和结算幂等键保证只付款一次；失败方静默刷新。

## 12. 回滚、分支、删除与档案

### 12.1 剧情回滚

`accepted-economic-state.ts`扩展为：

```text
restore tasks
restore shop
restore bankStateVersions + bankActivities
restore economy
touch session once
```

全部发生在一个 Dexie 事务。Bank restore helper 删除 `anchorOrder > targetFloor`的状态版本和 Activity，重新设置唯一 currentMarker；Economy 随后删除同一楼层后的资金事实并重算账户。

可观察结果：

- 回滚到存入之前，头寸和扣款一起消失。
- 回滚到结算之前，头寸恢复为未结算且付款消失。
- 回滚到游戏中间，恢复当时骰局叫数、牌堆位置或阶梯层数。
- 回滚到开局之前，游戏、下注和结果记录一起消失。

### 12.2 会话生命周期

- 分支：复制 Bank 版本与 Activity，替换 `sessionId`，保留稳定 position/game/activity IDs。
- 删除：与会话同事务清除两个 Bank 表。
- 角色档案：当前格式升至 v7，包含两个 Bank 表及 `counts.bank`。
- 恢复：统一执行 `remap sessionId → strict canonical validation → 写入临时库 → promote`。
- 测试线没有旧 Bank schema，不创建旧字段、旧概率表或 Bank archive 兼容分支。

## 13. UI 目标

### 13.1 视觉方向：同一扇门后的两间房

Bank 不是通用金融 SaaS，也不是霓虹赌场模板。它是一座手机里的旧式钱庄，推开内门才进入后巷赌桌：

- 金库：冷墨绿、暗金细线、票据纸纹、算盘刻度，稳定而克制。
- 赌坊：深木红、低亮暖金、磨损桌毡、明确的大数字，紧张但不炫技。
- 两个区域共用 Phone OS 字体、标题高度、导航、触控尺寸和返回行为；色彩切换形成空间感，不另造第二套 APP 壳。
- 页面主标题只显示“银行 / 金库 / 赌坊 / 账目”等必要标题，禁止 eyebrow、副标题或英文装饰词。
- 产品和游戏图标作为完整的大图形展示，不塞进小圆圈或尺寸不足的徽章。
- 动效只用于开牌、骰盅揭晓、阶梯成功与金额结算；`prefers-reduced-motion`下关闭位移和翻转。

### 13.2 路由

```text
/vault          金库
/floor          赌坊大厅
/floor/dice     骰局
/floor/push     翻倍或收手
/floor/ladder   风险阶梯
/records        账目
```

`/records`是 Bank Activity 视图，不是第二份 Wallet ledger。真实余额和完整资金流水仍属于钱包。

### 13.3 顶部与导航

- APP 注册名“银行”，根路径 `/vault`，建议顺序在 Shop 之后。
- 顶部显示当前页面标题和“可用余额”，余额按钮进入 Wallet。
- 根导航固定为“金库 / 赌坊 / 账目”；对局详情使用 Phone OS route stack 返回。
- 不显示产品总资产伪余额；锁定本金在具体头寸卡中呈现。

### 13.4 金库

- “我的头寸”在前，按最近到期排序；没有头寸时保留克制的空态。
- 卡片显示本金、到期返还或“收益待揭晓”、剩余主回合和进度。
- 定期提供提前支取，按钮旁直接显示确切到账金额和损失，不只写百分比。
- 理财不可提前退出，不泄漏隐藏收益。
- 产品目录显示期限、金额范围和静态收益规则；提交前在确认弹窗输入金额。

### 13.5 赌坊大厅与恢复

- 三张游戏席位卡使用大图形、核心规则、下注范围和基准返还说明。
- 已有 activeGame 时，其他席位禁用，顶部只显示一个“继续对局”入口。
- 切换会话后关闭旧对局组件和表单引用；返回时从 Bank public view 恢复。

### 13.6 三个游戏

- 骰局：大骰面完整显示；UI 自动计算玩家已知匹配数和庄家至少需要数；叫数控件只能组成合法加叫。
- 翻倍收手：公开已翻金币、当前可收手金额、剩余牌和下一张精确爆炸率；完整牌堆不进入 DOM。
- 风险阶梯：五层轨迹始终可见；三个选择直接显示成功率和成功后的确切金额；当前金额、50,000 封顶和收手按钮具有最高视觉权重。
- 终局结果先展示一次明确结算，再回到大厅；刷新后可从最近 Activity 查看结果，不依赖只活在内存里的弹层。

### 13.7 账目

- 只读取最近 50 条 Activity，按时间倒序。
- 顶部统计赌坊已实现净盈亏和 `net > 0`的盈利局比例；平局不计胜场。
- 存款本金锁定和返还不计作利润；定期/理财只统计 `payout - principal`。
- 每条记录显示业务类型、简短结果、投入、返还和净额，可展开结构化终局详情。

## 14. 错误、并发与交互门禁

- 余额不足、金额越界、步长错误：服务拒绝且资金不变；UI 同步禁用提交。
- 已有对局：拒绝新开局并返回现有 game ID；不自动覆盖。
- 版本或时间线冲突：刷新 Bank/Wallet，不自动重放付费或随机动作。
- 会话切换：关闭弹窗、清空输入和 busy owner；旧结果不得污染新会话。
- RP 正在生成时允许查看和提交 Bank 操作，因为 Bank 不进入 Prompt；若消息边界恰好推进，事务以 timeline conflict 失败并刷新。
- 记忆编辑、角色档案同步、接受回滚期间禁止 Bank 写入，避免跨生命周期提交。
- 同一 Controller 使用 `sessionId + actionId`作为 busy owner，旧会话 finally 不得清除新会话状态。
- 跨标签页只刷新，不自动替用户继续游戏或重复点击。

## 15. 性能与资源释放

- 产品目录静态，不使用虚拟列表。
- 当前视图只读 current Bank version，不扫描版本历史。
- Activity 使用 `[sessionId+createdAt]`索引读取 50 条，不复制进 State。
- 三个私有游戏对象很小；版本只复制未结算头寸和一局 activeGame。
- 无 timer、无 Prompt、无模型调用、无后台动画循环。
- liveQuery 在会话切换和 Controller scope dispose 时取消。
- 对局路由离开后卸载骰面、牌面和阶梯 DOM；终局弹层关闭即释放完整结果引用。

## 16. 最少必要测试

- 纯逻辑：整数金额、到期边界、合法叫数、万能牌、二项概率、抽牌统计、阶梯赔付。
- 数学契约：翻倍收手精确最优期望；阶梯任意选择取整前条件期望相同且整体返还不超过 90%。
- 随机边界：确定性随机源驱动每条结果；洗牌只验证排列和消费边界，不写随机显著性 flaky test。
- 存储集成：扣款/建仓、下注/开局、每一步、赔付/Activity 原子提交。
- 数据安全：Public View 不包含 dealerDice、deck、resolvedReturnBps 或 settlementAmount。
- 并发：action replay、旧 revision、旧 session owner、双标签页到期结算。
- 时间线：跨楼层游戏步骤和头寸结算能与 Economy 一起精确回滚。
- 生命周期：branch、delete、archive v7 strict restore。
- Controller：刷新恢复、切会话暂停、按 Bank 打开/主回合变化惰性结算到期头寸，不自动推进牌局且不泄漏旧结果。

蒙特卡洛只作为可选的离线平衡审计脚本，不进入稳定测试门禁；概率与期望优先使用枚举、动态规划和有理数公式证明。

## 17. 删除路径

1. 删除 `shared/bank/`、Bank Controller、组件和样式。
2. 删除 Phone OS Bank 注册与 Domain Sync 消费入口。
3. 从经济回滚协调器和 accepted rollback 文案移除 Bank。
4. 从角色档案格式、分支与删除生命周期移除两个 Bank 表。
5. 提升 DB schema 并删除 `bankStateVersions`、`bankActivities`。
6. 删除 Bank 测试和构建产物更新。

Economy、Session、Phone OS 和 Prompt 层不保留 Bank 专用兼容壳。

## 18. 非目标

- 不做贷款、负债、透支或玩家间转账。
- 不做实时股票、外部行情或持续后台任务。
- 不做 NPC 对赌、剧情竞猜或模型裁判。
- 不把 Bank 状态注入叙事 Prompt。
- 不新增 LLM 调用。
- 不承诺浏览器本地数据抵抗开发者工具篡改。
- 不为尚未发布的 Bank 旧结构增加迁移器、旧 UI 或兼容分支。
