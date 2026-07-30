# 不明物 APP 工程交接

- 状态：v28 global-companion hard cut 已实现；worktree 未提交。
- 交付目标：完整实现 Phone OS「不明物」APP；不保留会话级 Pet、演示 UI 或旧架构兼容层。
- 约束：不 commit、不 push；不启动浏览器测试。保留 worktree 中与本任务无关的用户改动。

## 1. 先读的权威资料

按顺序完整阅读：

1. 任务提供的 AGENTS.md / 工作规则。
2. [目标设计](./pet-app-target-design.md)：全局所有权、数据模型、时钟、事务和删除路径。
3. [内容规格](./pet-app-content-spec.md)：冻结的 persona、事件、文案、Prompt 与精确谓词。
4. [施工方案](./pet-app-implementation-plan.md)：硬切顺序与最低稳定契约。
5. [领域 README](../shared/pet/README.md)：目录职责和依赖方向。
6. 当前 Bank、Shop、Economy、session DB、run-once、Phone OS、rollback 和 archive 实现：
   代码是现有事务 API、Dexie version 和 archive version 的事实来源。

冲突时的权威顺序：

~~~text
当前代码（接口和版本号）
  ↓
目标设计（所有权和产品边界）
  ↓
内容规格（静态内容和外部协议）
  ↓
施工方案（切片和验证顺序）
~~~

## 2. 已冻结终态

全局只有一只 companion。它拥有身份、成长、人格、饱食、情绪、冷却、聊天记忆、
窝、收藏、待判词与全局 journal；来源会话只提供本次主回合、Phone boundary、
当前钱包、付款/偷还钱流水、联系人和剧情插曲 anchor。

DB v28 hard cut：

~~~text
petCompanion  # 一行 id=companion，state/revision/versionId
petActions    # 紧凑全局幂等凭证和来源 provenance
petJournal    # 全局可观察历史和来源 provenance
~~~

删除 petStateVersions、petActivities、pet-timeline 和所有旧 reader/type alias/
migration 分支。v28 只丢弃旧 Pet 数据，不影响其他正式领域表。来源 session ID
是历史标签，不是 Pet 所有者、外键或删除级联对象。

全局 state.petTurn 是唯一成长来源时钟：每个首次消费的有效主回合都加一，包括
dormant；不同 session 的同号 turn 分别消费，重写同一 session/turn 不重复消费。
dormant 不推进 phaseTurnCount、成长、饥饿或冷却。phaseTurnCount 是活跃成长时钟，
lastEvolutionActiveTurn 仅与它比较。

accepted rollback、branch、delete session 和 character archive 对 Pet 必须为零接线。
Economy 仍按会话正常回滚；Pet 已经得到的成长、饱食、action 与 journal 不退。
这是接受的少量刷取空间，不加补偿账、持久锁或 session map。

## 3. 实施顺序

1. 文档和 README 已冻结 global-companion 边界；继续改动前核对它们彼此一致。
2. 先写跨会话失败测试：A 养/B 看、A:1+B:1、同来源重放、B 付款/A 可见、回滚
   不退 Pet、branch/delete/archive 脱钩、并发 CAS、dormant、source-local
   interference、reset、v28 非 Pet 保全。
3. 在当前连续 Dexie version 建立 v28：删除旧两表，建立三表，重写类型、
   invariant 和纯规则时钟。
4. 重写 Pet service 与 pet-story-turn：所有动作使用 global CAS，但只触碰来源会话
   Economy；主 Assistant、Pet、来源 Economy 保持同一 transaction。
5. 删除 lifecycle/character archive 的 Pet 接线和 pet-timeline.ts。
6. 重写 prompt、Controller、Domain Sync：全局 view，来源本地插曲，epoch 只作
   临时 UI 失效控制。
7. 补回归、全量 review，重建 Tavern 和助手索引，再运行所有门禁。

## 4. 不可放松的边界

- 主回合 actionId 固定为 pet:story:{sessionId}:{turn}；同键永远不重抽随机、不重复
  成长、不重复 journal/流水。
- 玩家动作顺序为来源 Phone boundary → global CAS → 来源会话钱包 → 三张 Pet 表。
  lure 必须在余额检查后才消费五次 origin 随机；不保存 random draws 或 replay source。
- B 喂食只扣 B 钱包；提交后 A/B 都立即看到同一 companion。
- 当前会话的 Economy 观察窗口从该会话上一条 petActions 推导，不能塞进全局 state。
- strict canonical/invariant 失败即拒绝；只有 interference Prompt 投影是
  console.warn + return [] 的 fail-open。
- 插曲仅按 sourceSessionId + sourceAnchorOrder 进入来源会话；来源 Assistant 楼层、
  `nibble-sleeve` 的联系人或楼层前上下文失效，或 action/journal 因果不一致时都不注入。
- 只有四个 interference eventId 可且必须带 injectedText；投影按 eventId +
  knownTargetName 重算，再转义 &、<、>。
- 模型调用永远在 transaction 外；外部 chat parser 宽进，canonical 写入严存。
  juvenile/adult 同为 120 Unicode code points，幼体短句只是 Prompt 风格。
- Controller mutationEpoch、busy、request owner 和 AbortController 只存在当前
  生命周期，不新增持久锁或数据库字段。
- “让它离开”二次确认后只清三张 Pet 表，不退款。

## 5. 完成门禁

必须执行：

~~~powershell
npm run test:tavern
npm run test:tavern
npx vue-tsc --noEmit -p tsconfig.tavern.json
npm run lint:tavern
npm run build:tavern
npm run build:assistant
git diff --check
~~~

交付前还要人工审查：三表无旧 reader、跨会话状态和来源钱包分离、rollback/
branch/delete/archive 零 Pet 接线、interference source-local fail-open、Controller
旧请求不污染 UI、reset 真清三表、dist 与源码一致。用户已明确不要浏览器测试；
不得虚报为已完成浏览器验收。
