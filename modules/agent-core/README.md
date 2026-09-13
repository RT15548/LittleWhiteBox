# Agent Core

`agent-core` 是小白X里所有 Agent App 共用的无 UI 能力层。

浏览器原生 ESM 消费者不得直接加载带 SDK 裸包 import 的 `provider-config.js`。纯配置解析从
`provider-resolution.js` 导入；真正需要发起模型请求时，懒加载构建产物
`dist/agent-core-browser.js`。浏览器入口只导出通用配置、Adapter factory、请求脱敏和
SillyTavern 请求头注入，不得反向依赖任何具体功能模块。

可以放这里：

- 模型配置、provider 预设、adapter factory
- Agent App 共用的配置表单逻辑与基础 markup，例如 API 配置面板
- provider adapters
- `Plan*` 账本算法和 `[Current plans]` 上下文构造
- `DelegateRun` 子任务执行器
- Agent 协议账本：provider history 映射、`tool_calls`/`tool` 结果落账、provider payload replay、Google session tool loop 辅助、思考块标准化与流式消息控制
- Agent App 通用工具原语，例如补丁解析/执行、文本文件类型判断
- 不绑定具体 App 的工具循环/压缩算法，只有在完全去掉 App 耦合后才能迁入

不要放这里：

- DOM、iframe、host overlay、设置页 UI
- 小白助手专属的 `local/` 工作区、Skills、Identity、Worklog、Slash、JS API
- 电纸书专属的 `book/...` 书库、阅读器、导入素材、创作台 UI
- 任何反向 import `modules/assistant/` 或 `modules/ebook/` 的逻辑

`tools/` 只放“无作用域”的工具原语。它可以解析 patch、验证文本扩展名、执行由调用方提供的内存态文件变更，但不能知道 `local/...`、`book/...`、IndexedDB 或宿主 UI。

具体 App 需要持久化表时，必须显式传入，例如：

```js
createPlanLedger({ plansTable });
```

不要让 `agent-core` 默认绑定某个 App 的数据库。

## DeepSeek 思考与工具调用

直连「OpenAI 兼容」仅在 DeepSeek 显式开启思考且携带原生工具时，将 `required` 或指定函数的 `tool_choice` 转为 `auto`，保留思考与工具定义。同一条件下，回放保留已有的 `reasoning_content`，包括较早轮次及未调用工具的文字回复；不生成或补写不存在的思考内容。DeepSeek 接口要求工具请求回传这些内容，且不支持思考模式下强制工具调用。关闭思考、跟随模型、`auto`、`none` 及其他模型的工具选择不受影响，不增加重试或改动功能自己的结果校验。

「酒馆 OpenAI 兼容」不套用上述放宽，保持调用方的工具要求。已核实的 SillyTavern 1.18.0 `openai` 转发路径不会透传 DeepSeek 的 `thinking` / `reasoning_effort`；托管诊断中的思考设置仅代表提交给酒馆的请求，不证明供应商实际启用。完整托管思考控制另行处理；只有确认宿主会转发参数后才能复用这项放宽。

## 上下文计数边界

`runtime/context-tokens.js` 分开提供本地预览估算与请求前的宿主分词计数。宿主/iframe bridge 提供实时请求头；计数不读取模型 API Key，也不直接依赖酒馆模块。

计量投影包括原生 OpenAI 兼容请求实际回传的 `reasoning_content`：当前工具续轮，以及直连 DeepSeek 显式开启思考并携带原生工具时的较早轮次。回放条件与请求适配器共用纯协议规则，不把仅供显示、未回传的思考计入。分词与降级估算共用同一输入；助手和 ebook 的圆环预估、缓存判定同步识别回传思考的变化，不改变压缩阈值或失败处理。

计数调用 `/encode` 并校验 `count` 与 token IDs。酒馆 `/count` 自身可能在失败时以 HTTP 200 返回估算，因此不能作为可靠成功凭据。请求头未注册、取头失败、网络或分词失败均回退到原有本地估算，不因辅助计数不可用而中止回复；用户取消仍正常停止。

结果中的 `source` 区分宿主分词与估算，只用于本轮计量和显示，不持久化；估算不缓存为成功分词，下次请求仍可重新计数。不新增误差补偿系数，也不声称估算保证严格 token 上限。计量的是文本与工具的统一投影，不等于供应商计费用量；未知模型映射、图片等仍有误差，视觉预留由功能自己负责。

信息 APP、四次元壁保持原有 128k/158k 预算规则，ebook 保持 158k/188k，小白助手保持 228k/258k。ebook 和助手沿用原有压缩后提示并继续的行为，不因这次计数修复增加硬性超限拦截。压缩与历史保留归各功能所有；工具续轮也计量，压缩后以新历史重建模型会话。圆环渲染无需请求分词器，使用本地估算或同输入的成功计数。

小白酒馆管理助手也是共用计数的下游，其已有 Host bridge 注册与 228k/258k 策略保持不变，随共享修复更新构建产物。
