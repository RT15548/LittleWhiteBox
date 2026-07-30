# 不明物 APP 目标设计

- 状态：v28 global-companion hard cut 已确认，取代此前所有会话级 Pet 设计。
- 适用范围：小白酒馆 Tavern 模块 / 小号测试线。
- 兼容策略：未进入 upstream；不兼容、不迁移、不读取旧 Pet 数据。

## 1. 产品定义

不明物是整个 Tavern 数据库唯一的一只常驻生物，不属于任何角色或会话。任意
会话完成有效主 RP 回合，都可以推动同一只不明物；会话只提供本次输入、钱包和
剧情投影落点。

```text
来源会话的有效主回合 / Phone 动作
                 ↓
全局 companion state + 全局 petTurn
                 ↓
全局成长、饱食、人格、窝、聊天记忆、待判词
                 ↓
来源会话的钱包流水 / 来源会话的一次剧情插曲
```

它不是第二个信息 APP、任务源、Shop 库存或结构化世界状态。静态 persona、30 条
事件、curio、聊天和进化文案继续以[内容规格](./pet-app-content-spec.md)为准。

## 2. 所有权与唯一事实

| 全局不明物拥有 | 当前来源会话提供 |
|---|---|
| 身份、名字、成长、人格 | 本次主 RP 回合与 source turn |
| 饱食、情绪、冷却、全局 Pet 时钟 | 当前钱包余额与本次付款/收付款流水 |
| 聊天记忆、窝、curio、待判词 | 当前联系人与剧情插曲 anchor |
| 全局可观察 journal | Phone boundary 与来源会话 ID |

- `shared/pet` 是唯一领域所有者；Vue/Controller 只拥有临时 UI、AbortController
  和模型请求生命周期。
- Economy 仍是各会话玩家余额的唯一事实来源；Pet 不保存余额副本。
- `petCompanion` 的唯一 current 行是全局 Pet 状态唯一事实来源；没有该行即未发现。
- `petActions` 是幂等与来源凭证，`petJournal` 是全局可观察历史；来源 session ID
  只是标签，不是所有权或外键。
- Pet 不进入 accepted rollback、branch、session delete 或 character archive。

## 3. 终态数据结构

DB v28 删除 `petStateVersions` 与 `petActivities`，新建且只保留三张全局表。

```ts
interface TavernPetCompanionRecord {
    id: 'companion';
    revision: number;
    versionId: string;
    state: TavernPetState;
    createdAt: number;
    updatedAt: number;
}

interface TavernPetActionRecord {
    id: string; // 全局 actionId，唯一
    revision: number; // 提交后的 companion revision
    sourceSessionId: string;
    sourceTurn: number;
    sourceAnchorOrder: number;
    action: TavernPetStateAction;
    activityId?: string;
    createdAt: number;
}

interface TavernPetJournalRecord {
    id: string;
    sourceActionId: string;
    sourceSessionId: string;
    sourceTurn: number;
    sourceAnchorOrder: number;
    petTurn: number;
    detail: TavernPetJournalDetail;
    coinDelta: number;
    notificationText?: string;
    createdAt: number;
}
```

索引：

```text
petCompanion: id
petActions: id, revision, sourceSessionId, [sourceSessionId+sourceTurn],
            [sourceSessionId+sourceAnchorOrder],
            [sourceSessionId+sourceAnchorOrder+createdAt+id], createdAt
petJournal: id, sourceActionId, sourceSessionId,
            [sourceSessionId+sourceAnchorOrder], [sourceSessionId+createdAt+id],
            petTurn, [createdAt+id]
```

`petActions.action` 冻结 canonical 输入和 outcome，以支持幂等重放与因果检查；随机
只在首次动作中即时消费，不落库、不做 replay source。它不重复保存整份 state。不存在
会话级 Pet version 链、旧表读取器、旧类型别名或 archive converter。

## 4. 全局状态与时钟

`TavernPetState` 保留 phase、dormant、三轴、饱食、情绪、persona、名字、窝、
curio、聊天记忆、统计、event cooldown 与 pending evolution；同步完成以下 hard cut：

```ts
interface TavernPetState {
    petTurn: number;                     // 所有已消费来源主回合的全局时钟
    origin: { specimenNumber: number; arrivalAfterTurns: number; birthBias: TavernPetAxes };
    interactionWindow: { petTurn: number; /* 其余窗口计数 */ };
    beggingDeadlinePetTurn?: number;
    // 不存在 observedEconomyLedgerOrder
}

interface TavernPetEvolutionRequest {
    requestId: string;
    sourceSessionId: string;
    sourceTurn: number;
    sourcePetTurn: number;
    sourceAnchorOrder: number;
    // 其余冻结 persona、轴、统计与里程碑事实
}
```

- 主 RP 来源键固定为 `pet:story:{sessionId}:{turn}`。相同来源键重放只返回当前
  companion，不重复推进、抽随机、写 journal 或结算 Pet 流水。
- 不同会话的原始 `turn` 从不比较；`A:1` 与 `B:1` 是两个独立来源，都会各消费
  一次全局 `petTurn`。
- 每个首次消费的主回合都将 `petTurn + 1`，包括 dormant。dormant 时只消费幂等
  来源：`phaseTurnCount`、成长、饥饿、情绪衰减和 cooldown 均不推进。
- `phaseTurnCount` 仍是活跃成长/成年再塑形事实；`lastEvolutionActiveTurn` 继续只
  与它比较。
- `arrivalTurn` 改为 `arrivalAfterTurns`；`beggingDeadlineTurn` 改为全局
  `beggingDeadlinePetTurn`。没有只写不读的 last-feed 时间字段。
- 当前会话的 Economy 观察窗口从该 session 最近一条 `petActions` 来源事实推导，
  不在全局 Pet state 保存 session map 或 Economy 游标。

## 5. 写入、CAS 与 Economy

玩家动作使用当前会话的 Phone boundary 和钱包，但总是修改同一个 companion：

```text
校验来源会话 Phone boundary
→ 校验 companion revision + versionId CAS
→ 校验/写来源会话 Economy
→ 同一 Dexie transaction 写 petCompanion + petActions + petJournal
```

- 付费动作在任何随机消费前读取来源会话余额；lure 保持“无 companion → 余额至少
  10 → 五次 origin 抽取 → 原子扣款和写入”的顺序。
- `pet_interaction_unavailable:insufficient-funds` 是结构化余额错误；展示层才决定中文。
- B 会话投喂只扣 B 钱包，提交后 A/B 的全局 Pet View 都立即看到同一状态变化。
- Pet 自主偷钱、返还、赠币只影响触发该来源 action 的会话钱包。全局 journal 记录
  coinDelta，但不依赖可被回滚的 Economy 历史重放 Pet。
- 同 actionId 不同 canonical 输入抛 `pet_action_conflict`；CAS 冲突刷新全局 view，
  不自动重放付费、聊天或随机动作。

## 6. 主回合事务

主 RP 仍由 `pet-story-turn.ts` 在 Assistant 提交 transaction 内接入：

```text
提交来源 session Assistant
→ 读取全局 companion 与 pet:story:{sessionId}:{turn} action
→ 已存在：不推进；首次：消费 petTurn 并应用纯规则
→ 同一 transaction 写来源会话 Economy（如有）及三张全局 Pet 表
```

Assistant 写入失败时本次 Pet/Economy 写入一同失败；会话回退后的相同 source turn
重写命中原 action，故不再成长。接受少量“剧情已回退而 Pet 已成长”的可刷空间，
不建设补偿账本或逆向状态系统。

## 7. 生命周期

- accepted rollback 仅恢复 Session/Economy 等会话领域；不 restore、trim 或删除 Pet。
- branch 不复制任何 companion/action/journal；新分支打开同一只不明物。
- delete session 不级联删除全局 Pet 数据；journal 的 `sourceSessionId` 保持历史标签。
- character archive 不导出、计数、校验或恢复任何 Pet 表。未来全局 Pet 导入导出是
  独立功能，不能借角色档案通道实现。
- v28 upgrade 只 clear/drop 两张旧 Pet 表并创建三张新表；其他正式领域表不受影响。

## 8. 剧情插曲

interference 仍是来源会话局部的一次 runtime depth entry：

```text
petJournal.sourceSessionId + petJournal.sourceAnchorOrder
```

- journal 事件不会因来源会话回滚而删除；同一来源回合重写复用原 action/journal，
  不重新抽取。
- 投影仅查询当前请求来源会话、当前 anchor 的 journal；不会把 A 的插曲注入 B。
- 投影先确认来源 anchor 仍是一条有效 Assistant 楼层。`nibble-sleeve` 还必须确认
  冻结联系人仍存在，且名称仍出现在该 Assistant 楼层之前的有效 story 上下文。任一
  条件不成立、source anchor 无效、canonical/action/journal 因果不一致或模板重算
  失败时，`console.warn + return []`，绝不影响主 RP。
- `injectedText` 仍只属于四个 interference event，存普通原文，进入 Prompt 时转义
  `& < >` 并校验 canonical 模板正文。

## 9. Phone、模型与公开投影

- 所有会话展示同一 global Public View；view 永不暴露 axes、cooldown、chat memory、
  pending snapshot、action internals 或 Economy cursor。
- Controller 的 mutation epoch/busy 仍是作用域临时态。切换会话使旧模型结果失效，
  但不会抹掉已成功提交的全局 Pet 变化。
- Chat 与 evolution 模型请求都在 transaction 外。Chat 提交时校验 global companion
  CAS；evolution 以冻结 pending request 与确定 actionId 结算，缺失或不一致的 pending
  直接拒绝。pending evolution 由全局 state 持有，来源会话删除后仍可由全局静态 fallback
  或重新打开任意会话继续结算。
- Chat 模型返回、解析完成后才重新捕获当前来源会话的 Phone boundary；global companion
  仍由 revision/versionId CAS 保护。`getTavernPetSnapshot()` 在一次 transaction 内返回
  Public View 与 Journal，Controller 不做第二次全表 Journal 扫描。
- Domain Sync 刷新每个会话的同一 Public View，但 Journal toast 与 murmur 仅对其
  `sourceSessionId` 等于当前会话的记录生效。
- 外部 chat parser 宽进、canonical 落库严存；juvenile/adult 均为 120 Unicode code
  points，上述内容细则见内容规格。

## 10. 让它离开与删除路径

“让它离开”必须二次确认。确认后在单个 transaction 内清空 `petCompanion`、
`petActions`、`petJournal`，不退款、不改 Economy。

删除整个功能时：删除 Pet 领域和 Phone UI、story/Prompt/Phone 注册、三张 global
Pet 表和 reset UI；不触碰 Economy、Shop、Bank、Session、archive 或 rollback 的通用
语义，也不遗留 Pet 专用兼容壳。

## 11. 最少必要测试

- A 养成后 B 立即看到同一只；B 推进后 A 同步。
- `A:1` 与 `B:1` 各推进一次；同一 session 同一 source turn 重放不推进。
- B 付款只扣 B 钱包，A 立即看到全局状态变化；双会话 CAS 无丢更新。
- rollback 退款但 Pet 不退；branch/delete/archive 都不复制、删除或备份 Pet。
- dormant 消费 `petTurn` 但不消费 active-phase progression。
- interference 仅来源会话/anchor 可见；来源 Assistant 楼层或 `nibble-sleeve` 的前置
  联系人上下文失效时 fail-open。
- reset 清空三张 global 表；v28 只丢弃旧 Pet 数据。
- 30 事件、严格 invariant、chat/evolution、Prompt 边界、Public View 脱敏与生产
  bundle 维持现有稳定契约。
