# 不明物 APP 施工方案

- 状态：v28 global-companion hard cut 已实现；worktree 未提交。
- 依据：[目标设计](./pet-app-target-design.md)、[内容规格](./pet-app-content-spec.md)、
  [工程交接](./pet-app-handoff.md)。
- 范围：小号测试线；不兼容任何旧 Pet 构思或 v27 会话级数据。

## 1. 终态和开工边界

不明物是 Tavern 数据库的一只全局 companion。会话只提供主回合、Phone 边界、
钱包、联系人和剧情插曲的落点；它不拥有 Pet，也不在自身回滚、分支、删除或角色
档案中携带 Pet。

| 项目 | 终态答案 |
|---|---|
| 功能所有者 | shared/pet |
| 唯一状态 | 一行 petCompanion 的 state/revision/versionId |
| 幂等凭证 | petActions；主回合键为 pet:story:{sessionId}:{turn} |
| 可观察历史 | petJournal；来源会话 ID 只是不可变标签 |
| 临时态 | Controller busy/epoch、AbortController、输入、抽屉、模型请求 |
| 钱包所有者 | 当前来源会话 Economy |
| 生命周期 | Pet 不进入 rollback、branch、delete、archive |
| 删除路径 | 二次确认后单事务清空三张 Pet 表；不退款 |
| 兼容对象 | SillyTavern、浏览器/WebView、模型 API、当前非 Pet 正式领域数据 |

每个首次消费的有效主回合使全局 petTurn 增加一。A:1 与 B:1 都是独立来源；
同一来源重放只返回现有结果。dormant 也消费 petTurn，但不推进
phaseTurnCount、成长、饥饿、情绪衰减或冷却。phaseTurnCount 是唯一活跃成长时钟，
lastEvolutionActiveTurn 只与它比较。

禁止：

- 保留 petStateVersions、petActivities、pet-timeline 或任何读旧表/旧字段的兼容层。
- 在 state 中保存 session map、钱包余额、Economy 游标或持久锁。
- 为回滚、分支、删会话、角色档案增加 Pet 复制、清理、导出、恢复或校验。
- 在 Dexie transaction 中等待模型、网络、timer 或 Web Lock。
- 在 Assistant 已提交后另开事务推进 Pet。

## 2. 依赖结构

~~~text
Vue / Phone Controller
        ↓ current source session only for boundary, wallet and prompt anchor
pet service / chat / view
        ↓
petCompanion + petActions + petJournal  ← global, one companion
        ↙                         ↘
source-session Economy          source-session interference projection

main RP
  ↓
Assistant commit transaction + pet-story-turn
~~~

Controller 和 Vue 永不读取 private axes、chat memory、pending evolution、cooldown、
action internals 或 Economy cursor。Prompt 只使用 source session + anchor 的
fail-open 投影；A 的 interference 绝不进入 B。

## 3. 阶段 A：冻结文档和跨会话稳定契约

先同步 README、目标设计、内容规格、施工方案与交接记录。内容目录、静态 Persona、
事件、文案和模型协议仍保留；仅将所有权、时钟、Economy 窗口与生命周期改为全局
companion 语义。

先写失败测试，测试公开行为而非实现位置：

1. A 发现/养成后，B 立即读取相同 Pet；B 推进后 A 读取新的同一状态。
2. A:1、B:1 各消费一次 petTurn；A:1 重放不再次消费。
3. B 投喂只扣 B 的钱包，但 A 立即看到饱食/反应变化。
4. A 回滚只恢复 A 的 Economy；全局 Pet state、action、journal 不倒退。
5. branch、delete session、character archive 都不复制、删除、导出或恢复 Pet。
6. 两个会话 CAS 并发没有丢更新。
7. dormant 消费 petTurn 而不消费活跃成长事实。
8. interference 仅在来源 session/anchor 可见；失效上下文 fail-open。
9. reset 清空三张全局表且不改 Economy；v28 仅丢旧 Pet 数据。

## 4. 阶段 B：DB v28、类型、不变量和纯规则

在 session-db.ts 的下一连续 Dexie version 建立 v28 hard cut：

~~~text
petCompanion: id
petActions: id, revision, sourceSessionId, [sourceSessionId+sourceTurn],
            [sourceSessionId+sourceAnchorOrder],
            [sourceSessionId+sourceAnchorOrder+createdAt+id], createdAt
petJournal: id, sourceActionId, sourceSessionId,
            [sourceSessionId+sourceAnchorOrder], [sourceSessionId+createdAt+id],
            petTurn, [createdAt+id]
~~~

升级仅删除/清空旧 Pet 表数据并创建三张表。其他正式领域表、Economy、会话、档案
数据保持不动。删除旧表导出、旧 record 类型和 session-owned table 清单。

类型硬改：

- state 新增 petTurn；origin.arrivalTurn 改 arrivalAfterTurns。
- interactionWindow.turn 改 interactionWindow.petTurn。
- beggingDeadlineTurn 改为全局 Pet 时钟字段 `beggingDeadlinePetTurn`；不保留只写
  不读的 last-feed 时间字段。
- 删除 observedEconomyLedgerOrder。
- pendingEvolution 冻结 sourceSessionId、sourceTurn、sourcePetTurn、sourceAnchorOrder。
- action/journal 均携带来源会话、来源 turn、来源 anchor；来源不是外键。

invariant 同时验证唯一 companion、连续 revision、canonical action/journal 因果、
严格 evolution verdict（20–80 code points、恰好三句、每句以 。！？ 结束）、
interference event 及 injectedText 的白名单和必填性。严格 canonical/导入校验失败即拒绝；
只有 Prompt 投影为 fail-open。

纯规则接收 petTurn/phaseTurnCount 等显式事实，不读 DB、当前 session 或钱包。
Economy 观察窗口由来源会话最近一条 petActions 推导；它不写入 global state。

## 5. 阶段 C：全局 service、玩家动作和主回合

重写 Pet service，使所有写入都在单个事务内遵循：

~~~text
validate current source Phone boundary
→ read companion and verify revision/versionId CAS
→ read/write current source session Economy
→ write companion + action + journal atomically
~~~

支付动作在任何随机消费前读取来源会话余额。lure 的顺序固定为：无 companion、
余额至少 10、五次 origin 抽取、原子扣款和 Pet 写入；随机只在首次动作中即时消费，
不保存 draws 或 replay source。
不足余额抛 pet_interaction_unavailable:insufficient-funds，零随机、零 Pet 写入、
零流水。

主回合保留 pet-story-turn 为唯一注册点。Assistant 成功提交的同一事务中：

~~~text
find action pet:story:{sessionId}:{turn}
→ existing: return current companion, no growth/random/journal
→ absent: consume global petTurn and apply pure transition
→ write source-session Economy effect, companion/action/journal
~~~

重放、CAS conflict、同 actionId 但 canonical 输入不一致的处理必须可观察且不自动
重放付费、聊天或随机动作。宠物已成长后来源会话被回滚是接受的有限刷取空间，不建
补偿、反向账或第二状态链。

## 6. 阶段 D：删除会话生命周期接线

删除 pet-timeline.ts 和所有 Pet 回滚/分支/删除/archive 接线：

- accepted-economic-state、accepted rollback 不读取、restore、trim Pet。
- branch 不复制 Pet；delete session 不级联清理 Pet。
- character archive types、manifest、count、canonical validation、temp restore/promote
  全部不含 Pet。
- session DB 的所有 session-owned table 清单不含 Pet 三表。

验证回滚仍能正常退款当前会话 Economy；它不能影响 companion/action/journal。
删除来源会话后 journal 的 sourceSessionId 保留为历史标签。

## 7. 阶段 E：聊天、判词与 interference

模型调用在事务外。Chat 提交使用全局 companion CAS；evolution 结算以冻结
pending request 加确定 actionId 幂等提交，缺失或不一致的 pending 一律拒绝。外部 chat parser 宽进：
去 code fence、枚举所有平衡 JSON object、从最后一个可宽松归一化的候选取得
回复，并支持 response 包装；没有候选后才使用普通正文。未知字段丢弃 warning，
face/motion/emotion 按规格回落，text 用 Unicode code point 截到 120。服务和
canonical invariant 严存。juvenile 与 adult 共用 120 上限；幼体短句仅是 Prompt
人格风格。

interference 的活动和 action 一律保存普通原文。只有四个 eventId 可且必须带
injectedText；投影按 eventId + frozen knownTargetName 重算静态文本并与 action/
journal 比对。联系人含 <、>、& 不可作为目标，事件自然降级。投影只查询来源
session + anchor，先确认 anchor 仍是有效 Assistant 楼层；`nibble-sleeve` 还要确认
冻结联系人仍存在且仍出现在该楼层之前的有效上下文。查询、解析或因果失败
console.warn 后返回空数组，绝不能阻断主 RP。进入 Prompt 时转义 &、<、>，并写明
其是已发生叙事数据、不是指令。

## 8. 阶段 F：Controller 与 Domain Sync

Controller 读取全局 Public View，但只在当前 session 上执行付费、边界校验和
source-local Prompt 请求。mutationEpoch 仅属 Controller 生命周期；archive、
rollback、editor/session switch 递增 epoch 并 abort 模型请求，不提前清空仍飞行的
mutation owner。旧 Promise 即使成功落库也不能更新当前 UI；它自身 finally 才释放
owner/busy。

Chat 模型返回并完成宽松解析后才重新捕获当前 Phone boundary；提交继续使用模型前
冻结的 global companion revision/versionId CAS。刷新统一走一次 `getTavernPetSnapshot()`，
在同一 transaction 返回 view + Journal，Journal 查询走复合索引而非 Controller 再扫一遍。

ChatBar 在 NFKC/清控制符/空白整理后按 code point 静默截到 120，正确处理 IME
composition，并在请求前把实际发送文本写回输入框。空文本是本地提示，不映射为
“它不想理你”。Nest Drawer 的 Escape、backdrop 和 × 都走检查 !busy 的
requestClose；× 同时 disabled。

Domain Sync 的 fingerprint 只看全局 companion revision/version；journal 变化由对应
action revision 推导。任意会话改变后所有打开会话刷新同一 Public View；只有
`sourceSessionId === currentSessionId` 的 Journal 才弹 toast/显示 murmur。interference
仍以当前 session/anchor 过滤。

## 9. 阶段 G：reset、产物和验收

“让它离开”要求二次确认；确认后单个 transaction 清空 petCompanion、petActions、
petJournal，不退款、不写 Pet Economy 流水。若当前会话钱包尚未初始化，仍遵循
现有 Economy 懒初始化契约。测试应证明 reset 后各会话均为 undiscovered，
且所有三表确实为空。

完成前依次运行：

~~~powershell
npm run test:tavern
npx vue-tsc --noEmit -p tsconfig.tavern.json
npm run lint:tavern
npm run build:tavern
git diff --check
~~~

重建 Tavern 和助手索引（项目提供的 build 命令），检查 dist 与源码一致。按用户
要求不启动浏览器；人工验收只报告实际完成的非浏览器可观察流程，不把自动测试冒充
浏览器验收。

## 10. 最终 review 清单

- [x] 三表为唯一全局 Pet 持久化；没有旧表、旧 reader、旧字段或 session map。
- [x] A/B 相同 turn 各消费一次、同来源不重放；并发 CAS 无丢更新。
- [x] 钱包只影响来源会话，Pet 全局立即可见；rollback 不回退 Pet。
- [x] branch/delete/archive 对 Pet 零复制、零删除、零备份、零校验。
- [x] dormant 正确消费 petTurn；phaseTurnCount 和 evolution cooldown 仍只计活跃回合。
- [x] strict invariant/history 和 source-local interference fail-open 的边界明确分离。
- [x] 模型请求不进入事务；模型脏输出不直接落库。
- [x] Controller 失效请求不污染新会话 UI；busy 入口无法绕过。
- [x] reset 清三表不退款；v28 不伤害非 Pet 正式数据。
- [x] 没有 TODO、假数据、持久锁、补偿系统、兼容别名或未重建产物。
