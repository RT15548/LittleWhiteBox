# Agent Core

`agent-core` 是小白 X 各 Agent App 共用的业务无关能力层；共享配置表单原语可以在这里，具体 App 的界面与宿主装配不属于这里。

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

## API Key 与免密反代

共享主配置与分身配置的 API Key 均可留空。空值、空白或未提供的 Key 表示不提供模型密码；填写 Key 时按所选 Provider 鉴权。设置和请求共用 CORE 的鉴权规则，各 App 不再以空 Key 判断模型未配置。

OpenAI 兼容、Responses、Anthropic 的免密请求不发送认证头；Google 受当前 SDK 约束发送空 `x-goog-api-key`。SDK 内部适配不保存占位密钥，也不把占位值或 Node 环境凭据发给反代。模型拉取和实际请求均保留供应商鉴权错误，不切换身份重试。

Claude 的模型列表鉴权与生成鉴权分开：直连 Anthropic 和酒馆 Claude 共用模型拉取入口，预设中的 `modelListAuth` 由 `model-list-auth.js` 定义。设置界面的「模型列表鉴权」默认 `x-api-key`；模型列表使用 OpenAI 兼容鉴权的中转可选 `Bearer`，只发送 `Authorization: Bearer`。两者沿用已有 Key，不同时发送、不按域名猜测、不在 401/403 后切换认证重试。空 Key 不发送认证头，也不改变 Messages 生成请求的鉴权。主助手和分身独立保存此选择，其他渠道不使用该字段。

直连反代必须允许浏览器跨域。酒馆托管渠道仍遵守宿主协议：SillyTavern 1.18.0 的 Claude 转发强制要求密码，免密 Claude 反代应选择直连 Anthropic，不会自动替用户切换渠道。官方 API、联网渠道和图片生成供应商自身的鉴权要求不变。

## 原生 Anthropic 提示缓存

直连 Anthropic Messages 适配器对共享模型识别规则确认的 Claude 家族，统一在最后一个工具定义、系统提示块、最后一个可缓存的对话内容块上发送 `cache_control: { type: 'ephemeral' }`，使用供应商默认的 5 分钟缓存。DeepSeek 等其他 Anthropic 兼容模型及无法识别的模型别名保持原请求，不根据接口形状猜测缓存能力。思考块和签名不改动，输入历史不携带新增的断点状态；断点每次按最终请求构造，不存本地缓存、不增加重试、不改提示内容。

缓存标记可在 `requestInspection.request.body` 中检查。流式与非流式结果都保留供应商原始 `usage`，各消费者的控制台统一输出 `[AgentCore][AnthropicUsage]`：`cache_creation_input_tokens` 是写入，`cache_read_input_tokens` 是命中读取，`input_tokens` 是不含缓存的输入。缺失字段保持缺失，不伪装成零或命中；日志不包含提示词、回复正文或密钥。

发送标记不等于命中或省钱：重复前缀、模型最低长度与缓存有效期均须满足，首次缓存写入可能比普通输入贵。以 [Anthropic 缓存文档](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) 和供应商返回的实际用量为准，不根据本地分词估算账单。

此策略由共用该适配器的 Agent App 复用，不代表所有 iframe 或所有协议都已支持缓存。酒馆托管 Claude 仍由宿主决定最终请求；OpenAI 自定义 → 中转 → Claude 仍取决于中转是否支持并保留 Claude 缓存协议。本插件不擅自改渠道、模型别名或中转计费，不把这两条路线标记为已启用。

## DeepSeek 思考与工具调用

直连「OpenAI 兼容」在 DeepSeek 开启思考或跟随模型默认、且携带原生工具时，将 `required` 或指定函数的 `tool_choice` 转为 `auto`，诊断显示实际发送的选择，保留工具定义。同一条件下，回放保留已有的 `reasoning_content`，包括较早轮次及未调用工具的文字回复；不生成不存在的思考内容。跟随默认仍不发送 `thinking` / `reasoning_effort`，但不能当作关闭思考：[DeepSeek 当前协议](https://api-docs.deepseek.com/guides/thinking_mode)默认开启思考，要求工具请求回传推理内容，且不支持思考模式下强制工具调用。显式关闭思考、`auto`、`none`、其他模型及 Tagged JSON 的工具选择不受影响，不增加重试或改动功能自己的结果校验。

「酒馆 OpenAI 兼容」不套用上述放宽，保持调用方的工具要求。已核实的 SillyTavern 1.18.0 `openai` 转发路径不会透传 DeepSeek 的 `thinking` / `reasoning_effort`；托管诊断中的思考设置仅代表提交给酒馆的请求，不证明供应商实际启用。完整托管思考控制另行处理；只有确认宿主会转发参数后才能复用这项放宽。

## 流式活动

Responses 的 `onStreamProgress` 快照用 `activity` 报告当前观察到的活动，独立于思考摘要是否可见；推理项开始、结束、正文和工具参数事件驱动更新，不按耗时猜测。该字段只服务当前运行的进度显示，不写入会话历史或 provider replay。未提供活动信号的渠道仍可从新增的正文、思考块和工具草稿判断进度；重复累计快照不是新活动，没有信号时保持等待而不宣称正在思考。

## OpenAI 兼容流式错误

原生工具流收到供应商的 `error` 数据时，按现有 SDK 的错误契约向上抛出，保留原始错误消息、`code`、`type`、`param` 与请求诊断，不让它落成通用的响应未完成错误。即使此前已收到工具完成标记，这次请求仍以失败结束，不返回可执行工具结果。中止读取并释放流，不自动重试；HTTP 200 内的错误不虚构 HTTP 失败状态。此规则按传输协议处理，不根据 Claude 或其他模型名称猜测中转参数。

## 上下文计数边界

`runtime/context-tokens.js` 分开提供本地预览估算与请求前的宿主分词计数。宿主/iframe bridge 提供实时请求头；计数不读取模型 API Key，也不直接依赖酒馆模块。

计量投影包括原生 OpenAI 兼容请求实际回传的 `reasoning_content`，包括当前工具续轮及[上述 DeepSeek 回放规则](#deepseek-思考与工具调用)保留的较早轮次。回放条件与请求适配器共用纯协议规则，不把仅供显示、未回传的思考计入。分词与降级估算共用同一输入；助手和 ebook 的圆环预估、缓存判定同步识别回传思考的变化，不改变压缩阈值或失败处理。

计数调用 `/encode` 并校验 `count` 与 token IDs。酒馆 `/count` 自身可能在失败时以 HTTP 200 返回估算，因此不能作为可靠成功凭据。请求头未注册、取头失败、网络或分词失败均回退到原有本地估算，不因辅助计数不可用而中止回复；用户取消仍正常停止。

结果中的 `source` 区分宿主分词与估算，只用于本轮计量和显示，不持久化；估算不缓存为成功分词，下次请求仍可重新计数。不新增误差补偿系数，也不声称估算保证严格 token 上限。计量的是文本与工具的统一投影，不等于供应商计费用量；未知模型映射、图片等仍有误差，视觉预留由功能自己负责。

预算阈值、压缩、近期历史保留与超限处理归各消费者，不在 Core 统一改写：[信息 APP](../xiaobai-os/docs/information-app-context-design.md)、[四次元壁](../xiaobai-os/apps/fourth-wall/README.md)、小白助手、ebook 和 Tavern Manager 各使用自己的策略与 Host bridge。工具续轮也计量，压缩后以新历史重建模型会话；圆环无需请求分词器，使用本地估算或同输入的成功计数。

## 共享联网

Agent API 的全局联网渠道可选 Tavily 或 Exa；主 Agent 和分身共用选择。每家独立保存 Key 和 Base URL，切换渠道保留另一家的配置，清空 Key 会停用该渠道的工具。缺少所选渠道的 Key 或请求失败不会切换到另一家。

`web/` 拥有渠道元数据、请求适配、结构化错误与公共搜索/网页读取工具契约；`ui/web-settings.js` 提供设置控件，持久化沿用共享 Agent 设置仓库。只有用户配置需要持久化，请求与提取缓存由当次运行或课堂持有。保存失败沿用共享设置的错误反馈；移除功能时删除 `web/`、设置控件与消费者注册，并一次性清除共享设置中的联网字段。

小白助手、ebook、Tavern Manager 复用 `web_search`。语伴复用检索与正文提取，但自行管理候选来源、段落、分页和材料引用。小白 OS 管理员提供 `web_search` 和 `web_fetch`，工具结果进入现有操作记录与资料分页，不改变业务记录写入规则。

Exa 搜索使用 `POST /search` 的 `contents.highlights: true`，结果数量沿用工具默认 5、最多 8 的预算；全文提取使用 `POST /contents` 的 `text: true`，按请求网址关联 `statuses.id` 与 `results.url`，不将临时文档 ID 当作网址。鉴权使用 `x-api-key`。不调用 Exa 回答模型、异步研究 Agent 或自动重试。Tavily 保持原来的搜索和提取请求。网络与 HTTP 错误保留渠道、状态及脱敏诊断，取消向上传播。

正文提取返回成功正文及逐网址 `failures`（网址、错误码、供应商提供的状态码或消息），`failedUrls` 由失败项派生；供应商请求 ID 一并保留。部分失败不丢弃成功正文，也不把供应商错误当作材料正文。管理员向模型及操作记录传递诊断；语伴保持教学材料的领域投影，不把代理诊断写进教学来源。长结果的管理员缓存与分页规则见 [管理员设计](../xiaobai-os/docs/administrator-app-target-design.md#73-模型上下文管理)。

浏览器访问 Exa 官方接口时使用[小白盒后端](../../server-plugin/littlewhitebox-server/README.md#exa-联网)，与绘图共用安装包；后端缺失时返回 `web_backend_unavailable`，不会改走直连或换渠道。Node 消费者直接请求供应商；Tavily 和显式配置的 Exa 自定义 Base URL 保持浏览器直连，所用服务或代理须允许 CORS。`http.js` 统一管理限时、响应大小和错误，`browser-backend.js` 只处理酒馆身份及后端协议，`server-entry.js` 限定后端可调用的 Exa 操作。

App 中的 Exa Key 在 Agent API 设置填写；后端仅在当前请求内使用，不落盘。开发验证可从 `EXA_API_KEY` 环境变量读取，不能把 Key 写入源码、测试 fixture、日志或任务快照。
