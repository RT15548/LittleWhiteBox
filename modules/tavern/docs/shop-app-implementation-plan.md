# 商店 APP 施工方案

- 状态：已实现并通过阶段 G 验证（2026-07-25）
- 依据：[商店 APP 目标设计](./shop-app-target-design.md)
- 原则：每个阶段都落在终态边界内，不提交不可用入口、假数据或永久兼容壳

## 1. 开工前边界检查

| 问题 | 结论 |
|---|---|
| 功能所有者 | `shared/shop`拥有目录、库存、激活、回滚和 Prompt 投影；Phone Shop 只拥有交互状态 |
| 唯一事实来源 | 商品事实来自静态 catalog；库存事实来自 current ShopStateVersion；余额来自 Economy 账户 |
| 临时态 vs 持久态 | 页签、折叠、表单、弹窗、loading 临时；库存、激活实例、手动结束和版本历史持久 |
| 外部依赖 | Tavern Session/Message、Economy、Phone OS、主 RP Prompt、私人消息 Prompt、角色档案 |
| 注册入口 | Phone app registry；主 RP runtime depth entry；私人消息 pre-user system constraint |
| 删除路径 | 删 Shop 目录和三个注册入口、删表、档案移除、一次 schema 清理 |
| 兼容对象 | SillyTavern、浏览器 IndexedDB、当前角色档案格式；不存在旧 Shop 数据 |
| 最少必要测试 | 生命周期纯逻辑、DB 原子事务、回滚、Prompt 可观察输出、控制器关键行为、构建 |

测试线没有已发布 Shop schema，不增加 legacy 字段、迁移读取器或旧 injection 兼容逻辑。

## 2. 依赖方向

```text
Vue Components
      ↓
Phone Shop Controller ─────→ Wallet Controller（只读余额与刷新）
      ↓
shared/shop service ───────→ shared/economy service
      ↓                            ↓
shopStateVersions          economyAccounts / economyTransactions

shared/shop prompt projection
      ├─→ 主 RP runtime depth 注册
      └─→ 私人消息 USER 前 system 注册
```

禁止反向依赖：Economy 不得 import Shop；session-db 只允许 type-only import Shop record 类型。

## 3. 实施阶段

### 阶段 A：领域类型、目录与只读投影

新增：

```text
modules/tavern/shared/shop/shop-types.ts
modules/tavern/shared/shop/shop-catalog.ts
modules/tavern/shared/shop/shop-prompt.ts
modules/tavern/tests/shop.test.ts
```

工作内容：

1. 定义 duration、catalog、inventory、activation、state version、输入和错误类型。
2. 写入 14 个固定商品；`absolute-obedience`使用永久 1200。
3. 为每个商品写完整人工 injection，不能从 description 自动扩写。
4. 实现纯函数：参数规范化、模板渲染、活跃判定、剩余回合、分区投影、Prompt block。
5. 明确 exact duplicate 激活键：`itemId + 规范化参数`；重复激活直接拒绝，不扣库存且不创建队列。

最低测试：

- 一次性等价于 1 回合，失败不涉及任何状态变化。
- 5 回合边界为 5 次而非 4/6 次。
- 最后一回合包含消退说明。
- manual / permanent 不生成虚假倒计时。
- 参数被限长和安全转义，不能闭合 Prompt 标签。
- 相同输入的稳定投影字节一致。
- Prompt 不包含 activationId、itemId、actionId、versionId 或 anchorOrder 等内部键。

阶段完成条件：没有 DB、UI 或运行时注册；纯领域测试通过。

### 阶段 B：持久化与领域写服务

新增：

```text
modules/tavern/shared/shop/shop-service.ts
modules/tavern/shared/shop/shop-timeline.ts
```

修改：

```text
modules/tavern/shared/session-db.ts
modules/tavern/shared/tasks/task-timeline.ts
modules/tavern/shared/economy/economy-timeline.ts（仅复用/导出当前事务 helper，非 Shop 反向依赖）
modules/tavern/shared/accepted-economic-state.ts（新增跨领域协调器）
modules/tavern/app-src/features/accepted-rollback/accepted-rollback.ts
```

#### B1. DB schema

- Tavern Dexie 提升至 version 25。
- 新表 `shopStateVersions`使用目标设计中的索引。
- `TavernDatabase`声明表并导出 `tavernShopStateVersionsTable`。
- 分支会话复制 Shop 版本并替换 sessionId。
- 删除会话同时删除 Shop 版本。
- 不写旧 Shop 数据迁移，因为旧表不存在。

#### B2. 服务接口

建议公开接口：

```ts
getCurrentTavernShopState(sessionId)
getTavernShopStateAtAnchor(sessionId, anchorOrder)
purchaseTavernShopItem(input)
activateTavernShopItem(input)
deactivateTavernShopItem(input)
describeTavernShopRestoreImpact(sessionId, targetFloor)
restoreTavernShopToFloorInCurrentDbTransaction(input)
```

所有写入输入都带：

```ts
boundary
actionId
expectedRevision
expectedVersionId
```

Phone 边界复用任务域已经验证过的消息身份语义，但公共边界类型应移动到业务无关位置；不得让 Shop import `tasks/`。

#### B3. 购买事务

事务表必须同时包含：

```text
messages
sessions
shopStateVersions
economyAccounts
economyTransactions
```

`messages`只参与读取剧情边界 CAS，不被购买事务写入。确认弹窗打开时捕获最新消息的 `messageId + order + timelineRevision`；事务提交前再次从 messages 读取最新消息并逐字段比较。这样可以阻止编辑、删除、重 roll 或时间线推进期间挂起的旧购买落到错误楼层。`sessions`没有保存足以替代该校验的最新消息身份。

Economy 流水固定为：

```ts
fromAccountId: TAVERN_PLAYER_ACCOUNT_ID
toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID
kind: 'shop_purchase'
sourceDomain: 'shop'
sourceId: item.id
idempotencyKey: `shop:purchase:${actionId}`
```

不得把 price 作为服务输入。Economy 幂等重放与 Shop actionId 重放必须共同验证同一商品和同一结果。

#### B4. 时间线回滚重整

`task-timeline.ts`恢复为只拥有任务时间线，并导出当前事务 helper。新增 `accepted-economic-state.ts`负责在同一个 Dexie 事务中依次调用：

```text
restore tasks in current transaction
restore shop in current transaction
restore economy in current transaction
touch session once
```

`accepted-rollback.ts`改用新的协调器，并在影响预览中加入“背包与道具效果”。

最低集成测试：

- 购买成功时扣款和 quantity 同时出现。
- 余额不足时两边都不变。
- actionId 重试不会重复扣款或加库存。
- 双标签页旧 revision 不能购买、使用或关闭。
- 一次性使用在刷新后仍处于等待生效状态。
- 相同商品和相同参数已有活跃实例时，重复使用被拒绝且 quantity 不变，不产生排队记录。
- 永久效果不能关闭，manual 可以关闭一次且重试幂等。
- 回滚一次事务恢复任务、商店和钱包；故意触发中途错误时三者都不变化。

### 阶段 C：档案、会话生命周期与完整性

修改：

```text
modules/tavern/shared/character-archive-types.ts
modules/tavern/shared/character-archive-db.ts
modules/tavern/shared/character-archive-jsonl.ts（若当前泛型路径无需改动则不碰）
modules/tavern/shared/character-archive-server-storage.ts（同上）
modules/tavern/app-src/components/TavernCharacterWorkspacePanel.vue
modules/tavern/tests/character-archive.test.ts
modules/tavern/tests/session-db.test.ts
```

要求：

- 档案表列表加入 `shopStateVersions`，counts 增加 `shop`。
- 当前角色档案格式提升到 version 6。
- 校验 sessionId、revision、唯一 currentMarker、actionId、商品 ID 和状态结构。
- 还原到新 sessionId 时只改会话外键，不改稳定商品 ID、activation ID 和 action 事实。
- 根据测试线兼容边界，不为未发布的 Shop schema 添加兼容；是否保留旧 archive v5 只能由真实兼容需求决定，不能临时猜测。

最低测试：

- 分支完整复制背包历史且两个会话后续互不影响。
- 删除会话不残留 Shop 行。
- v6 档案导出、临时恢复、正式提升后保留库存和永久实例。
- 非法 currentMarker 或未知商品导致整次恢复失败，不留下半份档案。

### 阶段 D：Prompt 注册

修改/新增：

```text
modules/tavern/app-src/runtime/run-once.ts
modules/tavern/app-src/features/phone-os/apps/messages/tavern-messages-context.ts
modules/tavern/app-src/features/phone-os/apps/messages/tavern-messages-prompt.ts
modules/tavern/tests/message-assembler.test.ts 或现有主 Prompt 对应测试
modules/tavern/tests/communications.test.ts
```

#### D1. 主 RP

`shop-prompt.ts`提供一个 depth-1 system entry 投影。`run-once.ts`在实际生成和 simulate 两条路径中都读取：

```ts
buildTavernShopRuntimeDepthEntries({
    sessionId,
    currentTurn: sessionState.turn,
})
```

并将它追加到现有 `runtimeDepthEntries`。传给 native prompt 的 `runtimeDepthPrompts`必须使用同一数组，禁止为 native/local 写两份 injection 生成器。

Shop entry 的 order 必须高于其他 Tavern depth-1 状态条目，使它成为合并后 system message 的最后一块。native 构建当前不能仅依赖 extension prompt 对象键的字典序；施工时必须让最终 native messages 保留同一顺序，并针对最终消息数组验证邻接关系。

不要修改通用 `message-assembler`来认识 Shop；现有业务无关的 runtime depth 注册点足够。

#### D2. 私人消息

`tavern-messages-context.ts`按当前 session turn 读取同一 Shop Prompt block，并作为显式参数传给 `buildTavernPhonePromptMessages`。后者必须先输出 `<current_state_and_memory>`和私信线程上下文，再将非空 Shop block 作为独立 system message 插在当前 USER 私人消息之前。

私人消息构建全程只读，不创建版本、不消耗次数。

#### D3. 行为测试

- 主 RP actual 和 simulate 的最终请求都包含完全相同的 Shop effect block。
- local 与 native 的最终消息中，当前 USER 前一条必须是 system，且 Shop block 是其最后一块；不能只断言 contains。
- 私人消息最终消息中，Shop system 必须紧邻当前 USER 之前；发送多条私人消息后 remaining 不变。
- 任务生成、Manager 和小白助手请求不包含 Shop block。
- 无活跃效果时不出现空标题。
- 最后一回合出现消退说明，下一主回合不再出现。
- 重 roll 使用原回合 Shop 投影；原回复之后激活的效果不倒灌。

### 阶段 E：Phone OS 控制层与跨标签页同步

新增：

```text
modules/tavern/app-src/features/phone-os/apps/shop/useTavernShopController.ts
modules/tavern/app-src/features/phone-os/apps/shop/tavern-shop-presentation.ts
modules/tavern/app-src/features/phone-os/apps/shop/tavern-shop-errors.ts
```

修改：

```text
modules/tavern/app-src/features/phone-os/useTavernPhoneController.ts
modules/tavern/app-src/features/phone-os/useTavernPhoneDomainSync.ts
modules/tavern/app-src/components/tavern-app-context.ts
modules/tavern/app-src/App.vue
```

控制器职责：

- 加载 catalog 和当前 Shop state。
- 从当前 session turn 派生生效中、持有、已耗尽。
- 管理购买/使用/关闭中的单一 busy action。
- 在提交前和事务内都核对 sessionId；切会话丢弃旧结果。
- 成功购买同时请求 Shop 和 Wallet 刷新，并调用现有全局 toast。
- 版本冲突自动刷新一次，但不自动重放付费或使用动作。
- chat running/cancelling、档案维护、会话缺失时给出明确 blocked reason。

Domain Sync 新增 Shop fingerprint，至少覆盖：

```text
current versionId + revision + session.state.turn
```

订阅随会话切换和 scope dispose 释放。

最低控制器测试：

- 会话切换后旧购买结果不污染新页面。
- 快速双击只发起一个 action。
- 钱包读取失败时购买不可用而非显示余额 0。
- 事务成功但刷新失败时提示可恢复状态，不谎报购买失败。

### 阶段 F：UI、注册与样式

新增：

```text
modules/tavern/app-src/components/phone-os/apps/shop/*.vue
modules/tavern/app-src/styles/phone-os/shop.css
```

修改：

```text
modules/tavern/app-src/features/phone-os/phone-os-types.ts
modules/tavern/app-src/features/phone-os/phone-os-app-registry.ts
modules/tavern/app-src/styles.css
```

注册定义：

```text
id: shop
name/shortName: 商店
rootPath: /shelf
order: 40
accent: 朱红偏暗色，不与钱包金和任务橄榄混淆
```

APP 内路由：

```text
/shelf
/inventory
```

实现要求：

- 使用真实 button、label、dialog 语义和可见 focus。
- 触控目标不小于现有 Phone OS 操作标准。
- 暗色主题不是简单反色，保持墨纸和封印层级。
- 永久效果二次确认；manual 才显示关闭。
- 已耗尽折叠只存在组件内存。
- 不为 14 项货架引入虚拟列表或新状态库。
- 关闭 dialog 后清空目标输入和待操作对象，避免跨商品串值。

组件测试只覆盖用户可观察行为；不做源码字符串、类名或组件层级快照测试。

### 阶段 G：完整验证和生产产物

必须执行：

```powershell
npm run test:tavern
npx vue-tsc --noEmit -p tsconfig.tavern.json
npm run lint:tavern
npm run build:tavern
git diff --check
```

还需人工检查：

1. 亮色/暗色、桌面手机壳和移动端全屏。
2. 余额不足、版本冲突、会话切换、生成中禁用。
3. 购买 → 使用 → 主 RP → 私人消息 → 到期。
4. 永久效果确认与不可关闭文案。
5. 删除旧楼层时回滚提示包含背包，确认后钱包与背包一致。
6. Prompt Inspector 最终请求中确实存在效果块。

生产 bundle 必须随源码同一提交重建，不能只提交 `app-src`。

## 4. 推荐提交切片

每个切片都应独立通过相关测试，不暴露不可用 APP：

1. `feat(tavern): add shop domain model and catalog`
2. `feat(tavern): persist shop inventory with atomic purchases`
3. `feat(tavern): include shop state in archive and rollback`
4. `feat(tavern): inject active shop effects into narrative prompts`
5. `feat(tavern): add phone shop and inventory app`
6. `build(tavern): rebuild shop app bundle`

如果团队选择一次提交，也必须按同一顺序施工和审查。

## 5. Review 清单

### 数据与事务

- [ ] price 只从 catalog 读取。
- [ ] 扣币和入库同事务。
- [ ] actionId 重放不会再次变更任何状态。
- [ ] revision + versionId CAS 覆盖购买、使用、关闭。
- [ ] currentMarker 唯一。
- [ ] 回滚任务、商店、钱包同事务。
- [ ] branch/delete/archive 覆盖 Shop 表。

### 生命周期

- [ ] Prompt 构建零写入。
- [ ] 请求失败不消耗。
- [ ] 一次性刷新后不丢失。
- [ ] final round 同时遵守效果并提示结束。
- [ ] manual 可关闭，permanent 不可关闭。
- [ ] 私人消息不消耗主回合。
- [ ] 重 roll 不双重消耗或倒灌未来激活。

### Prompt

- [ ] actual / simulate / native 使用同一投影。
- [ ] 主 RP 和私人消息生效。
- [ ] 两种叙事请求中 Shop 都是当前 USER 之前最近的 system 约束。
- [ ] Tasks / Manager / Assistant 不泄漏。
- [ ] 用户参数已转义并被标记为数据。
- [ ] 最终 Prompt 不泄漏 Shop 内部索引、版本或时间线键。
- [ ] 无效果时无空块。

### UI

- [ ] 钱包未 ready 时不允许购买。
- [ ] 余额不足禁用且原因清楚。
- [ ] 永久效果二次确认。
- [ ] 会话切换清理临时状态。
- [ ] 跨标签页冲突刷新但不自动重放。
- [ ] 亮暗主题、键盘焦点和移动触控可用。

### 性能与清理

- [ ] 不扫描 Shop 全历史构建 Prompt。
- [ ] 不创建每回合倒计时记录或 timer。
- [ ] liveQuery 和弹窗资源可释放。
- [ ] 不引入旧 Shop schema 兼容壳。
- [ ] 删除路径无残留注册、类型和测试。

## 6. 明确禁止的捷径

- 在 Vue 中直接修改余额或 inventory ref。
- 在 Prompt 构建阶段 decrement / put / update。
- 用 localStorage 保存 pending once。
- 将背包塞入 `TavernSessionState`以躲避领域表。
- 购买先扣款、再用第二事务入库。
- 回滚时先退钱、再单独恢复背包。
- 仅修改本地 Brain 而漏掉 SillyTavern native 最终请求。
- 将 Shop injection 放进任务或 Manager Prompt。
- 用 description 代替人工审核 injection。
- 因为测试线“可能有人用过”而保留不存在的旧 Shop 格式。
