# Bank domain

Bank 只拥有金融产品、头寸、结算活动和事件重放。它不拥有余额、宿主生命周期、聊天内容或 UI。

- `products.ts`：六款已发布的不可变产品合同，以及当前存单/基金货架 ID。
- `money.ts`：整数金额、利息、罚金和收益计算。
- `random.ts`：浮动理财的受控随机边界。
- `timeline.ts`：线性事件追加、CAS、幂等重放和状态投影。
- `view.ts`：隐藏未到期浮动收益的公开 DTO。
- `invariants.ts`：事件、合同、头寸和活动不变量。

当前用户级计期、事件模型与历史升级统一见 [银行设计](../../docs/bank-app-target-design.md)，不从当前聊天消息总数重建期限。

历史头寸和活动始终按发布合同 ID 读取合同库；当前货架只决定还能新开哪些产品。已发布 ID 的锁定期、利息、罚金、收益区间和金额范围不可原地修改；改版必须发布新 ID，旧合同下架后仍保留以解释和结算既有头寸。

资金意图和 Bank 事件的原子组合位于`apps/bank/application/`，由 Bank Scoped transaction 调用 Economy Capability。删除 Bank 需要先处理仍被 Bank escrow 占用的数据，再删除领域、Host/Shell catalog 注册和`bank`分区。
