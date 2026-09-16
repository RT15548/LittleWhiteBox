# 行动检定：请求标记过滤验收

日期：2026-09-16。

## 当前边界

- 所有者为 Dice，过滤实现放在 `apps/dice/host/request-filter.ts`，由现有 generation adapter 的 `GENERATE_AFTER_DATA` 监听调用。
- 只在发出的原生上下文字段中移除符合现有 `CHECK_MARKER_PATTERN` 的 `[dice:记录ID]`：`prompt` 字符串/聊天补全消息 `content`/多模态文本块、NovelAI `input`、文本补全 CFG `negative_prompt`。不清理任意方括号，不遍历工具参数、图片 URL 或其他协议字段。
- 聊天原文、活动 swipe、骰点记录和宿主续写前缀不变；组装后的消息及文本块使用副本，不回写输入对象。Dice 的结果注入仍保留。
- 关闭新检定不关闭历史标记过滤。dry-run 预览同样过滤，但不清理正在使用的扩展提示词；正式请求仍沿用既有提示词清理时机。
- 生命周期沿用现有 adapter：启动注册，停止卸载。无新增设置、持久化实体、数据库迁移或全局正则。删除 Dice 目录和原有注册即可移除实现，无额外数据清理。
- 未改画图、检定协议提示词、卡片显示、投骰、保存或失败恢复逻辑。

## 为什么用最终请求事件

ST 的早期 `generate_interceptor` 修改 `coreChat` 后，宿主会用修改后的正文建立续写前缀，并在续写结束时写回聊天。此前隔离对照已复现：早期剥离定位标记会导致内存和磁盘中的标记消失，而骰点记录仍在。

`GENERATE_AFTER_DATA` 在续写前缀确定之后、流式与非流式请求发送之前触发。仅替换 `generate_data` 内已组装的上下文值可隔离模型输入与续写保存正文。

完整核对 ST 1.18.0 `Generate` 的请求构造 switch、流式/非流式发送器及服务端转发后，原生字段如下：

| 主 API | 发出的上下文字段 |
| --- | --- |
| Kobold / Kobold Horde | `prompt` 字符串；Horde 将它搬到排队请求的顶层 `prompt` |
| Text Completion | `prompt` 字符串；启用 CFG 时 `negative_prompt` 也包含历史和续写上下文 |
| NovelAI | `input` 字符串，无 `prompt` 字段 |
| Chat Completion | `prompt` 消息数组；后续转换为请求 `messages` |

前一轮只覆盖 `prompt`，漏掉了 NovelAI 和 CFG；原先的 31/1055 项测试及八组浏览器场景不能证明这两条分支。本次先增加两项行为回归，确认旧实现恰好在 `input` 和 `negative_prompt` 断言失败，再补齐字段过滤。没有新增监听、按供应商猜测的兼容分支或递归对象清洗器。

官方 ST 1.14.0 的 `public/scripts/events.js:54` 定义了事件，`public/script.js:4929` 以相同的 `generate_data, dryRun` 参数触发；续写前缀在 4387/4420 行取得，发送在 5005/5056 行发生。此处没有版本分支。1.14.0 只做源码契约核对，不声称整个 Dice 已在该版本运行验证。

## 自动化

在现有原生事件/API 边界测试中共增加五项，不另建宿主替身：

1. 最终请求移除标记，保留确认结果；输入消息、宿主正文/骰点、非文本块和其他请求字段不变。
2. 文本请求、dry-run、关闭检定时仍过滤历史标记，不影响普通方括号和其他领域标记。
3. 停止后不处理请求，重启后恢复处理。
4. NovelAI 仅有 `input` 的真实请求形状能过滤，关闭检定和 dry-run 同样生效，不凭空增加 `prompt`。
5. CFG 的正负上下文同时过滤，不改保存正文、guidance scale 或停止序列。

结果：Dice 生成边界 33 项通过；小白 OS 全套 1057 项通过。完整 OS TypeScript 检查、OS ESLint、变更测试 ESLint、宿主构建及 `git diff --check` 通过。宿主 dist 已同步，不重建无关 UI 产物。

## 原生酒馆复验

ST 1.18.0，隔离 `RollProbe` 聊天 `dice-send-boundary-1789573578222`。使用当前源码构建的真实 Dice adapter/display、原生 Generate 和聊天保存；无临时过滤器。聊天补全使用只支持本地响应的模型替身，其余 API 由浏览器拦截本地生成端点；无付费请求、无真实用户聊天修改。

脚本位于 `output/playwright/dice-send-production.cli.js`、`dice-send-text-production.cli.js` 和 `dice-send-novel-cfg-production.cli.js`，按此顺序在同一隔离浏览器会话执行。Playwright CLI 负责真实浏览器和出站请求观察，供应商响应为确定性本地替身，不据此评价模型遵循协议的能力。

| 场景 | 结果 |
| --- | --- |
| 聊天补全非流式 / 流式 | 两次请求均无标记；确认结果仍在；正文、磁盘、骰点和卡片正确 |
| 流式预填充续写 | 同上，续写原文未丢失标记 |
| 同楼连续两次检定 | 三次请求、两条记录、两张卡片，原文及磁盘精确一致 |
| 关闭检定后手动续写 | 请求无标记，原文标记和原骰点保留，仅一次请求 |
| 关闭检定后的新一轮聊天 | 历史输入无标记，已保存历史原文不变 |
| Kobold 非流式 / SSE 流式 | 两次请求均无标记；确认结果、原文、磁盘、骰点、卡片正确 |
| NovelAI 非流式 / SSE 流式 | 两次请求的 `input` 无标记、无 `prompt` 字段；确认结果、原文、磁盘、骰点、卡片正确 |
| Text Completion（OOBA，CFG 1.5）非流式 / SSE 流式 | 两次请求的正负上下文均无标记；负向文本确实含历史、当前续写和独立负向指令；确认结果、原文、磁盘、骰点、卡片正确 |

共十二组通过。Horde 完成字段构造/排队发送的源码审计，没有做浏览器运行验证；也未覆盖所有供应商、第三方扩展、WebView 或绕过主 `Generate` 的后台 Agent 请求路径，不能据此声称它们都经过本监听。
