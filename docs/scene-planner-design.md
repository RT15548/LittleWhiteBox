# 画图场景规划设计

Scene Planner 将正文、角色和用户选择编译为图片计划。Agent Core 拥有配置、供应商和工具运输，Draw 拥有场景校验、插入位置及图片请求；浏览器与后台复用同一领域边界。

## 配置与入口

读取共享主预设，Provider、模型、密钥、Reasoning、Tool 模式随该预设，不使用 delegate 或独立画图 LLM 配置。字段及供应商能力见 [Agent Core](../modules/agent-core/README.md)。

浏览器动态加载 Agent Core bundle，后台用 Node entry。Draw 不直接导入内部浏览器 SDK 文件，Core 不反向含 Draw schema／Prompt。

默认只注册 `submit_scene_plan`，toolChoice 为 required，运输复用共享原生或 Tagged JSON。最终必须且只能提交一个完整计划；不另写供应商适配或根据一次错误猜“不支持工具”。

## 快捷数量与角色导入保护

各绘图 Provider 的楼层菜单与全局菜单共用一个 `overrideMaxImages` 设置。空值跟随参数预设，零表示不指定数量，合法正整数覆盖本次规划的数量要求；输入范围与归一规则以 [max-images-override.js](../modules/draw/shared/max-images-override.js) 为准。覆盖持续生效直到清空或重置，不改写参数预设。输入草稿、防抖和保存队列仅存在于当前菜单生命周期；旧保存回执不得覆盖后续编辑，菜单销毁后不提交尚未发出的输入。

角色与分组的 `locked` 归共享角色库所有，只保护导入替换，不禁止用户主动编辑、删除、启停或移动。角色自身锁与所属分组锁任一生效即受保护，按 ID 或开启同名覆盖后的替换共用同一检查；只有明确选择替换已锁定角色才允许绕过。导入预览与最终确认都使用当前角色库重新规划。解锁移除自身锁标记，删除实体同时删除其锁；角色复制、角色库导出不携带自身锁，导入不接受文件中的锁标记。组锁是组的事实，不展开为成员上的额外状态。

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

### 模板附带工具

NovelAI 请求结构中的自定义消息可勾选“附带工具”，填写返回工具定义和 `action` 的 JavaScript。消息启用时，规划模型可先调用工具、读取结果，再提交 `submit_scene_plan`；与最终提交同批返回的自定义工具不执行。工具独立调用不消耗场景纠错次数，调用、代码与结果限制由 [custom-tools.js](../modules/draw/shared/custom-tools.js) 和布局契约定义。

代码随模板保存、导出；导入时由用户明确选择是否启用，未确认则关闭带工具的消息。“试运行”执行定义代码并校验返回的工具定义，不调用 `action`。执行环境是隔离页面来源的浏览器 iframe，无法直接读取酒馆 DOM、存储和 Cookie，但可以联网，也不保证隔离同步死循环，因此只运行可信代码。

沙盒与调用记录只活在当前页面或规划运行中；结束或取消后销毁沙盒。工具记录跨规划重试保留，并与请求历史使用同一编号；不留明细的调用仍计入总数。停用消息即停止注册工具，取消“附带工具”并保存或删除消息即移除模板中的代码。代码超限时保留完整草稿，导入、保存与执行拒绝超限代码，不截断原文。后台任务不执行工具代码，启用工具的模板需关闭后台任务后使用。

验收契约：未确认导入或已停用的工具不得执行（非预期代码执行）；工具调用与返回必须按原生及 Tagged 协议配对，包括混合调用的纠错回合，最终仍提交合法图片计划（协议错误、重复请求费用）；取消及超时不得继续调用后续工具（非预期执行）；失败记录保留脱敏请求及供应商拒绝原因（凭据泄露、无法排错）；工具记录跨重试保留并对应正确请求，总数包含不留明细的调用（不可见的执行历史）；切换预设不得串用工具草稿（错用代码）；超限代码不得被静默截断或执行，拒绝保存后仍可编辑原文（丢失代码、非预期执行）。

浏览器状态仅活在任务内。后台提交、202 接管、Node 生命周期与 marker 遵守 [Draw Run](./backend-draw-runs.md)，执行与 ACK 遵守 [Image Job](./image-backend-batch-jobs.md)，不另持久化前端纠错队列。

删除规划功能同时处理各消费者入口和模板注册，共享 Core 不随 Draw 删除；已生成图片按各自策略保留。

统一运行 `npm run check`，其中计划、位置、纠错、取消与输入保真由场景规划测试覆盖，协议由 Agent Core 测试覆盖，传输由 Provider 测试覆盖，浏览器／Node 分别验证导入。真实模型规划和图像质量、后台三家实盘及关闭浏览器接回需单独验收，不以模拟或构建冒充。
