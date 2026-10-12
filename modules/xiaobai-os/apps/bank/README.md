# Bank app

`apps/bank`负责把纯 Bank 领域接入 PartitionStore、Economy Transaction Capability、iframe 协议和 Vue UI。账户归属、存储及事务边界见 [Economy 平台终态设计](../../docs/economy-platform-target-design.md)。

- `application/economy-protocol.ts`：由 Bank event 生成资金意图，并核对 caller-bound Economy 结果。
- `application/commands.ts`：存入、提前支取、开立理财和到期结算命令。
- `application/service.ts`：业务版本校验、actionId 幂等、全局计期与确认和跨分区单次用户文件提交。
- `host/controller.ts`：app activation、存储准备、操作状态和 frame 消息。
- `host/presentation.ts`：隐藏锁定理财收益，生成客户端 DTO。
- `ui/`：金库、产品、头寸、记录和操作弹窗。

Bank 的用户级计期、回复识别及保存恢复见 [银行设计](../../docs/bank-app-target-design.md)。Host 只观察新增主剧情回复，不解析剧情或通过重数聊天历史倒退计期。
