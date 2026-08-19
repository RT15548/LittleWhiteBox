# 不明物 APP 施工方案

## 1. 冻结终态

本轮是产品循环 hard cut，不在旧“电子宠物续命”规则上调数值。全局三表和全局 CAS 保留；当前 schema、纯规则、UI、文档、测试和产物必须同时抵达“借主 RP 时间自行生活”的终态。

删除任何旧循环残留：`luring`、休眠/唤醒、动作按钮墙、互动窗口、长期 tap/BGM/pat/hit、道德三轴、冷落扣分、饥饿阻断、旧 schema 读取或转换。

## 2. 阶段 A：先冻结文档与契约

更新目标设计、内容规格、施工方案、工程交接和 Pet README。文档必须先定义：即时蛋、下一主回合孵化、幼体 24 活跃回合、无惩罚食欲、三条中性 traits、moment 轮转、聊天边界、v29 hard cut、删除路径和验收。

稳定测试先锁以下公开行为：

1. 10 币 lure 当场出现 egg；下一有效主回合变 juvenile。
2. juvenile 立刻可聊天，egg 只给静态回应。
3. 空腹、长期不打开、来源 Economy 回滚都不破坏 Companion。
4. A/B 共享一只；同一来源重放不推进；双会话竞争无丢更新。
5. moment 不过期、六活跃回合间隔、三轴轮转、选择写第一人称 memory。

## 3. 阶段 B：v29 domain hard cut

在 `session-db.ts` 加 v29：直接删除 v28 三张全局 Pet 表（丢弃旧数据与旧索引，避免在仍有旧数据的同一次 upgrade 中收紧唯一索引），v30 再按新索引重建。升级只触碰 Pet 表，绝不影响 sessions/messages/Economy/Task/Shop/Bank。运行时仅认新 `TavernPetState`。

同步重写：

- `pet-types.ts`：新 phase、traits、appetite、moment、精简 interaction/lifetime stats。
- `pet-invariants.ts`：不接受未知/旧字段；`pendingMoment`、moment memory、演化与 canonical Journal 继续严格。
- `pet-rules.ts`：蛋/幼体/成人、每回合 appetite、无惩罚事件、moment 排程、persona 投影。
- `pet-events.ts` / `pet-copy.ts`：删除休眠、冷落、道德轴和旧动作语义。
- `pet-random.ts`：只留下当前真实消费者的随机源；不保存 replay draws。

## 4. 阶段 C：服务、主回合和 moment

保留 `petCompanion / petActions / petJournal`：

- `lure` 先检查 Companion 不存在、来源余额至少 10，再按固定顺序消费四次 origin 随机（编号与三条出生偏向）、扣款、写 egg。
- `feed` / `toy` 是有 CAS 的礼物；没有 pat/hit/tap/BGM/wake 持久动作。
- 主回合仍用 `pet:story:{sessionId}:{turn}` 判重，任意会话推进全局 clock。
- 生成/解决/跳过 moment 是 Companion CAS 写入；选择同时写一条 source Journal 和一条第一人称 memory。
- `getTavernPetSnapshot()` 一次事务返回 Public View 与限定 Journal；热路径仅走现有索引。

插曲安全边界保持：动态联系人只在来源可证明的情况下进入 frozen text，projection fail-open，不影响 Assistant/Pet/Economy 主事务。

## 5. 阶段 D：Phone 与 Controller

页面改为暗室舞台中心：名字形态、可点击舞台、自然状态、条件显示 moment、聊天、礼物入口、窝。删除四列动作墙、饱食条、醒来页和“回去走回合”的提示。

Controller 新增纯临时舞台触碰/蛋静态回应；聊天模型仍捕获最新 Phone boundary、以 Companion revision CAS 落库；请求失败保留输入并显示“它没听清”。`mutationEpoch`、owner 和跨会话 Toast 过滤继续保留。

Home 提示只由有内容的 Journal/moment/milestone 驱动，不由饥饿驱动；它是 Controller 临时态，激活不明物页即清除，绝不新增持久未读字段。

## 6. 阶段 E：生命周期、档案和删除

维持此前全局边界：rollback/branch/delete session/character archive 都不触碰 Pet；来源 ID 只是 Journal 历史标签。"让它离开" 经过二次确认后清空三张表且不退款。

`pet-history.ts`、`pet-timeline.ts`、旧 archive 接线、旧 types/test fixtures 一并删除；不能留下无消费者审计或兼容壳。

## 7. 阶段 F：回归与交付

按风险测试纯规则、Dexie/事务、Controller 并发与 Phone projection，不用源码字符串清单伪造覆盖率。必须覆盖 v29 隔离、即时蛋/下一回合 hatch、无惩罚空腹、moment、宽进严存聊天、interference fail-open、删除和跨会话 CAS。

完成后执行：

```text
npm run test:tavern
npx vue-tsc --noEmit -p tsconfig.tavern.json
npm run lint:tavern
npm run build:tavern
npm run build:assistant
git diff --check
```
