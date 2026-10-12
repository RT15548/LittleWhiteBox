# 商店 APP 终态设计

## 1. 定位

Shop 是普通酒馆小白 OS 自己的消费与回复效果领域。玩家购买商品进入库存，再明确使用；购买本身不影响主聊天。

商品、库存、激活、效果次数和 Prompt 规则由 Shop 拥有，资金由 Economy 拥有。Shop 不共享小白酒馆的楼层、变量、回滚或数据实现。

## 2. 终态边界

| 内容 | 所有者 |
| --- | --- |
| 25 件首批不可变发布合同与可信规则 | `domains/shop/catalog.ts`的`SHOP_PUBLISHED_CONTRACTS` |
| 当前可购买商品 | `domains/shop/catalog.ts`的`SHOP_CURRENT_SHELF_IDS` |
| 购买、使用、关闭、成功投递事实 | `domains/shop/timeline.ts` |
| 库存、激活与剩余次数投影 | `domains/shop/timeline.ts` |
| 回复效果 Prompt | `domains/shop/prompt.ts` |
| Shop/Economy 原子购买 | `apps/shop/application` |
| 已发生但尚未落盘的效果交付 | `apps/shop/application/effect-delivery-queue.ts` |
| SillyTavern 生成时序与消息收据 | `apps/shop/host/prompt-runtime.ts`、`apps/shop/host/message-receipts.ts` |
| 商品、库存与操作界面 | `apps/shop/ui` |

Shop 不拥有余额、聊天正文、模型请求、全局剧情状态或消息历史。

### 2.1 发布合同与货架

商品合同是已经发布的业务事实，不是每次加载时可重算的临时目录：

- 历史 purchase、库存、activation、效果 Prompt 和 Shop/Economy 核账始终按发布合同 ID 读取合同库；
- 新购买只允许当前货架中的合同；下架不删除合同，也不使既有购买、库存或效果失效；
- 同一合同 ID 的价格、输入、期限、叠加方式和可信规则不得原地修改；未来改版发布新 ID，再把旧 ID 从货架移除；
- 合同库与货架都属于代码内可信事实，不把可篡改的 Prompt 或合同副本写进聊天数据。

首批 25 个合同就是本版本的起始发布库；测试线没有需要迁移的旧库存，因此不增加旧目录读取、退休商品样本或兼容分支。

## 3. 唯一事实来源

`ShopDomainV2`只持久化连续事件，事件中的 itemId 指向不可变发布合同，而不是当前货架：

- `purchase`：确认扣款并增加一件库存；
- `activate`：不可逆地消费一件库存并创建效果实例；
- `deactivate`：显式关闭仍生效的 manual 效果；
- `deliver`：记录哪些有限效果成功作用于一条新 Assistant 回复，以及哪些结束规则已经投递。

库存、购买次数、激活状态和`appliedCount`全部由事件重放得到，不另存余额、当前状态、楼层、倒计时、聊天 hash、快照或剧情锚点。

每条实际使用 Shop Prompt 的 Assistant 消息在`message.extra.xiaobaiOsShopEffects`保存不可变收据。收据只负责让该消息的 swipe、regenerate 和 continue 复用原效果；它不是 Shop 账本，也不能退回次数。

回复形成后、`deliver`保存成功前，交付 ticket 只存在当前运行的按聊天队列中。有效 Shop 状态是“持久事件链按序折叠尚在途的 ticket”；ticket 不持久化，不复制余额、库存或第二份账本，保存成功即删除。

## 4. 用户心智与不变量

- 游戏玩过就是玩过；商品买过、钱花过、道具用过就是既成事实。
- 编辑或删除聊天消息不退款、不返还库存、不减少`appliedCount`、不恢复已关闭效果。
- 聊天分支得到新 osId，不复制经济资产、库存或未结业务；共享钱包不重新开户。数据策略统一见 Economy 平台设计。
- 有限效果按“成功形成的新 Assistant 回复”消耗一次，不按数组下标、楼层号或当前 Assistant 总数计算。
- normal 生成使用当前有效效果，并在非空 Assistant 消息被宿主发布后提交一次`deliver`。
- swipe、continue 使用目标消息原收据，不增加`appliedCount`。
- 单条消息 regenerate 在宿主删除旧消息前暂存旧收据，新回复复用并重新挂载该收据，不增加`appliedCount`。
- 显式停止、dry-run、未形成非空 Assistant 回复时不提交`deliver`。
- SillyTavern 若在流式异常后仍保留并发布一条非空 Assistant 消息，该消息属于已经形成的回复，按一次投递处理。
- permanent 效果始终有效；manual 效果只由显式关闭；有限效果用完后只投递一次结束规则。

删除一条带收据的消息只会删掉那条消息的复用凭据；已经提交的 Shop 事件不变，下一条 normal 回复从当前剩余次数继续。

SillyTavern 的群聊整批 regenerate 会在任何 generation 事件之前删除整批旧回复，且新批次以 normal 逐条生成，宿主没有提供旧、新消息一一对应关系。因此它按“删除旧批次 + 生成新 normal 回复”处理：旧批次不返还次数，新批次各自按当前效果继续消耗；不伪造无法证明的收据映射。

## 5. 生成时序

Prompt runtime 只保存当前运行内的临时生成状态：

1. `GENERATION_STARTED`：清掉旧 pending；单条消息 regenerate 在旧消息仍存在时暂存其收据。
2. generate interceptor：normal 生成新收据；swipe/continue 读当前消息收据；regenerate 使用刚暂存的旧收据。
3. `GENERATE_AFTER_DATA`：请求完成组装后立即清空 extension prompt。
4. `MESSAGE_RECEIVED`：同步校验聊天 identity、消息 ID、Assistant 角色和非空正文；先把收据绑定到准确消息/当前 swipe，再把 normal 交付加入对应聊天的在途队列，然后立即返回。regenerate 只重新挂收据。
5. `GENERATION_STOPPED`、切聊、停用：取消 pending 并清空 prompt。
6. 交付队列在后台按 actionId 顺序提交`deliver`；前一项未成功前不提交后一项。

`GENERATION_ENDED`在流式模式可能早于`MESSAGE_RECEIVED`，因此只能清 Prompt，不能独自判定回复失败。

监听器不把持久化 Promise 返回给 SillyTavern 的串行事件总线。收据绑定和在途投影在监听器返回前已经完成，因此下一轮生成立即看到扣次后的有效状态；Kernel 只负责通用文件事务、确认和通知，不感知 Shop 队列。

## 6. Prompt 安全

可信规则是发布合同内评审的静态指令。用户参数必须经过 NFKC 规范化、控制字符移除、空白折叠、Unicode code point 限长和 XML/宏编码，只能进入参数数据区。

Prompt 不输出价格、余额、revision、actionId 或 eventId。没有效果时不安装空块；历史收据只能引用当前 Shop 事件链中真实存在的 activation。

## 7. 资金与保存失败

`purchase`在 Shop Scoped transaction 中调用 Economy Capability，使 Shop 事件与 player→sink 扣款进入同一个用户文件 candidate，并以一个 commitId 上传。`activate`、`deactivate`和`deliver`不产生资金流水。Shop-Economy 交叉不变量只读取 Shop 分区和 caller-bound Economy 视图，拒绝缺少扣款、重复扣款和孤儿交易。

消息一旦形成，效果交付就是已发生事实，删除消息或一次保存失败都不返还次数。明确保存失败时，交付 ticket 保留在当前运行的有效投影中并暂停后继交付落账；上传结果不确定时，Kernel 保留同一 candidate 并冻结用户文件新写入。下一条新回复、读回确认或重新进入对应聊天时，队列用原 actionId 继续，不重新交付也不生成第二笔事件。

主生成期间禁止 activate/deactivate，避免请求已取出的效果集合在同一次生成中途改变；购买不改变有效效果集合，可以排队提交。

## 8. UI 契约

商店是 OS 内的奇物购物 APP，不引入商家、配送、购物车或评价系统。货架按分类与搜索陈列商品图形，详情读取合同投影，说明价格、期限、库存和使用要求。

视觉以清亮的商品陈列为主：浅色白底、深色中性底，珊瑚色用于价格与购买操作；不同分类有轻量底色，本地 SVG 保留各件奇物的对象形态。桌面购物袋图标与应用同色。首页直接展示搜索、分类、商品图 / 名称 / 期限 / 价格，不设宣传封面、口号或重复的分类说明。手机两列，宽内容区三列；字号沿用正常 OS 阅读尺度。

「逛店 / 背包 / 生效中」分离选购、库存与效果管理。背包和效果使用紧凑分隔列表，不把所有条目套成卡片；使用细则收在详情展开区，永久效果、支付与关闭后果仍在决定位置明确展示。详情返回保留分类、搜索、滚动位置与原商品焦点；这些都只属于当前 UI 运行。

购买确认只支付 1 件商品并放入背包；使用确认才消耗库存、填写合同要求的参数并启用效果。成功后分别进入背包或生效页，显示已确认操作结果。永久效果清楚提示不能在 APP 内关闭，manual 效果可显式关闭，有限效果直接显示 Host 提供的剩余次数，不推测倒计时或进度。

详情与确认按 ID 从当前投影取值，生成期间仅禁用使用 / 关闭，购买仍遵循现有规则。原生模态确认限制焦点，保存期间禁止关闭、修改参数和重复提交。货架、背包、已结束效果、空白、加载和错误状态均随 OS 深浅主题切换；不增加持久化 UI 状态。

## 9. 删除路径与验收

删除 Shop 时：删除`apps/shop`、`domains/shop`、Host/Shell catalog、分区 parser、Prompt runtime 和交付队列注册，并清理`shop`分区与消息收据；运行时 ticket 随 module dispose 销毁，Economy 既有流水按明确产品策略处理，不留下兼容壳。

最低必要验证覆盖：

- 目录与参数安全；
- 发布合同与货架分离：下架合同不能新购，但历史事件、库存、效果和核账仍可解释；
- 事件重放、库存、叠加、有限次数和结束规则；
- 购买与扣款原子提交、actionId 幂等和 CAS；
- normal 的一次投递、停止/dry-run/空回复不投递；
- 慢用户文件上传期间，下一轮使用持久事件链与在途 ticket 的顺序投影，不会重复使用同一次有限效果；
- 交付保存失败保留投影并暂停后继，下一条新回复、读回确认或重进聊天后按原 actionId 续交；
- regenerate 删除前取收据且只回挂，swipe/continue 不写 Shop；
- 编辑/删除聊天消息不改钱、库存和已用次数；
- 切聊、保存失败和未确认保存不产生跨聊天脏写。
