# Game domain

Game 是与主聊天内容完全独立的纯规则领域，玩法和产品边界见 [Game 设计](../../docs/game-app-target-design.md)。

- `games/`：三个不读 DOM、聊天、Economy 或时钟的纯状态机。
- `types.ts`：当前事件、私有状态、活动和公开 DTO。
- `timeline.ts`：线性事件追加、CAS、actionId 幂等和活动重放。
- `history.ts`：只按 V1 生命周期和已保存结果验证历史，不调用当前产品策略。
- `view.ts`：深拷贝公开状态并移除庄家骰子、牌堆等私有材料。
- `money.ts`与`random.ts`：整数资金和随机边界。
- `invariants.ts`：持久格式、金额安全和冻结事实校验。

`games/`中的赔率、庄家出价、牌堆参数和阶梯策略只决定新动作。事件一旦保存，骰面与叫价、下注、牌堆与抽取进度、阶梯步骤、结算类别和 payout 就是历史事实；读取历史只验证这些事实彼此连续且与 Economy 流水一致，不用今天的策略重新计算昨天的结果。

Game 事件不记录消息楼层、Assistant 回合、剧情哈希或锚点。聊天编辑、swipe、删除和分支事件不会改变赌局。

下注托管和派彩由`apps/game/application/`在 Game Scoped transaction 中调用 Economy Capability，以一次用户文件 commit 提交。账户归属与存储边界见 [Economy 平台](../../docs/economy-platform-target-design.md)。删除 Game 需要先处理未结赌局的 escrow 数据策略，再删除领域、Host/Shell catalog 注册和`game`分区。
