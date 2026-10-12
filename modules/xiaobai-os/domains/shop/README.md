# Shop domain

Shop 拥有发布合同库、当前货架、购买/激活/关闭/投递事件、库存与效果投影，以及主 RP Prompt 规则。

`SHOP_PUBLISHED_CONTRACTS`保存所有已发布商品合同，历史事件、库存、效果、Prompt 与账本核对都按合同 ID 读取它；`SHOP_CURRENT_SHELF_IDS`只决定哪些合同还能新购。已发布 ID 的价格、输入、期限、叠加和可信规则不可原地修改；产品改版必须发布新 ID，旧 ID 只从货架下架并继续解释既有事实。

`ShopDomainV2`只持久化连续事件。库存和效果由`projectShopState`重放得出，不另存 current state、楼层、倒计时、锁、快照或缓存。

## 回复投递语义

有限效果的期限是`applications`：一条成功形成的 normal Assistant 回复提交一次 deliver，相关 activation 的`appliedCount`增加 1。回复自身保存本次效果收据，以便 swipe、regenerate 和 continue 复用原效果而不重复消耗。

删除或编辑消息不会改变事件链；钱不退、库存不返还、已用次数不恢复。permanent 始终有效，manual 只由显式 deactivate 关闭，有限效果和 manual 的结束规则各只投递一次。

## 安全边界

`catalog.ts`发布合同中的可信规则是评审过的静态指令。用户参数经过 Unicode 规范化、控制字符移除、空白折叠、长度限制和 XML/宏编码，仅进入参数数据区。

购买扣款由`apps/shop/application`在 Shop Scoped transaction 中调用 Economy Capability，以一次用户文件 commit 原子提交。`prompt.ts`只把一张已校验收据渲染成 Prompt；SillyTavern 消息事件、收据挂载与生成临时态归`apps/shop/host/prompt-runtime.ts`和`host/sillytavern-context.ts`。
