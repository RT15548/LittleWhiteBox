# 画图场景规划设计

Scene Planner 将正文、角色和用户选择编译为图片计划。Agent Core 拥有配置、供应商和工具运输，Draw 拥有场景校验、插入位置及图片请求；浏览器与后台复用同一领域边界。

## 配置与入口

读取共享主预设，Provider、模型、密钥、Reasoning、Tool 模式随该预设，不使用 delegate 或独立画图 LLM 配置。字段及供应商能力见 [Agent Core](../modules/agent-core/README.md)。

浏览器动态加载 Agent Core bundle，后台用 Node entry。Draw 不直接导入内部浏览器 SDK 文件，Core 不反向含 Draw schema／Prompt。

只注册 `submit_scene_plan`，toolChoice 为 required，运输复用共享原生或 Tagged JSON。一次响应必须且只能提交一个完整计划；不另写供应商适配或根据一次错误猜“不支持工具”。

## 计划与纠错

当前字段、参数归一和校验唯一见 [scene-plan-contract.js](../modules/draw/shared/scene-plan-contract.js)及本次 Tool Schema，不复制完整 JSON schema。

- images 是唯一执行结果，数量、角色容量与插图点来自实际请求。
- 每图须有合法 scene、characters 与 insert_after；位置缺失、越界、重复或倒序拒绝。
- mindful_prelude 的 user_insight 和 visual_plan.moments 是规划过程，不覆盖合法图片任务。
- 角色需 name 与 action，未知角色还需 type 与 appear；其余省略由契约归一，显式 null 或错类型仍拒绝。
- 没有 YAML 清洗、猜截断或模糊字段兜底。

[运行器](../modules/draw/shared/draw-agent-runtime.js)在同一规划内把可纠正工具／领域错误作为真实 tool result 回给模型，保留协议历史；最大次数归运行器常量，连续相同错误提前停止。不是单次调用后永不纠错，也不是失败后重新购买整轮请求。

Adapter 与总超时 scope 各创建一次。网络、配置、Provider 与取消直接上抛，不进入语义纠错。原生 session 与回放按共享协议保留调用／结果和 Provider payload。

## 正文位置与写入

[scene-source.js](../modules/draw/shared/scene-source.js)冻结正文，过滤映射视图中的图片标记与排除区段，保留原始 UTF-16 offset，sourceHash 对完整快照计算。

images.insert_after 唯一决定位置，规划草稿不参与放置。[scene-placement.js](../modules/draw/shared/scene-placement.js)逆序批量插入，写前精确比较 hash，原文变化即拒写；不模糊找 anchor 或找不到便追加末尾。

规划后分配 slot、校验、插占位，再逐张替换。取消保留成功图、移除未开始占位；零成功恢复原文。各宿主核验自己的写入目标，手动 Prompt 用明确尾部 placement。

NovelAI、SD WebUI、ComfyUI 继续拥有参数与图片编译器。规划成功不代表出图或聊天写入成功；主聊天图位、原生保存与取消边界见 [聊天绘图交付](./chat-image-delivery.md)。

## Prompt 与模板

人物理解、动作、场景选择和已知／未知角色规则归 Draw，工具字段和运输归契约。Prompt、标签指南与默认模板是运行资源，不作为过期说明删除。

正文、人物、世界书及用户 Prompt 各展开一次；动态值作为数据插入，不用 replacement string 二次解释特殊字符，不重扫宏或把展开失败静默当空值。

模板版本与已发布默认指纹归各 Provider 管理，只替换精确命中的旧默认，用户编辑保留。文档不再维护过期版本数字或整份模板副本。

## 后台、删除与验证

浏览器状态仅活在任务内。后台提交、202 接管、Node 生命周期与 marker 遵守 [Draw Run](./backend-draw-runs.md)，执行与 ACK 遵守 [Image Job](./image-backend-batch-jobs.md)，不另持久化前端纠错队列。

删除规划功能同时处理各消费者入口和模板注册，共享 Core 不随 Draw 删除；已生成图片按各自策略保留。

运行 `npm run test:draw-agent`保护计划、位置、纠错、取消与输入保真，协议跑 Agent Core 测试，传输跑对应 Provider 测试，浏览器／Node 分别验证导入。真实模型规划和图像质量、后台三家实盘及关闭浏览器接回需单独验收，不以模拟或构建冒充。
