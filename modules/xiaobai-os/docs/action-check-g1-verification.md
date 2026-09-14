# Dice 行动检定：G1 规则、协议与记录

日期：2026-09-14。以下保留 G1 当时的阶段记录；G1 基础实现与完整开标签显示验证通过。当时未实现的运行链、卡片与注册现已在 [G2–G5 施工验收](./action-check-g2-g5-verification.md) 完成，本文不把早期测试扩大解释为完整闭环验收。

## 已落地

所有生产代码位于 `apps/dice/`，未改 Kernel、现有 APP、宿主源码或生成拦截顺序。

| 层 | 当前职责 |
| --- | --- |
| `domain/action-check.ts` | 请求事实校验、五档 DC、D20 临界规则与可注入随机源 |
| `domain/check-records.ts` | 当前消息记录格式、八次上限常量、UTF-16 offset／SHA-256 锚点 |
| `protocol/markup.ts`、`request.ts` | 专用标签、Markdown 来源排除、末尾单请求解析；模型字段说明复用领域上限 |
| `protocol/prompt.ts` | 检定领域说明、请求契约、结果资料投影；不创建新的角色身份 |
| `application/prepare-action-check.ts` | 合法性／已有记录／次数／锚点检查后，才产生一次骰点候选 |
| `host/display-rule.ts` | 自管全局仅显示规则定义及纯维护决策；有效时返回无需更改，不调用保存或重绘 |
| `partition.ts` | 当前聊天的 `schemaVersion: 1` 与 `actionChecksEnabled`，默认关闭；无遭遇占位 |

没有自动注册或启用半成品 APP；这些文件尚未接入生产启动组合。自管规则在真实用户设置里的安装与生命周期，仍由后续宿主适配负责。

## 用户确认的显示边界

继续使用 `<xb_action_check>`，它只是专用 Tagged JSON 的包装，不是供应商原生 tool calling。完整开标签出现后隐藏标签及其 JSON；`<`、`<xb_` 等较短前缀保持普通文本显示。没有第二套 `<tool_call>` 兼容入口，也没有逐字维护或截留单独 `<` 的状态。

此前首字符零闪现的实验只保留历史记录，不再作为阻塞、性能负担或必须解决的边界。

## 可观察契约测试

`tests/dice-contracts.test.js` 的 10 项测试通过：

- 五档难度的全部 20 个骰面，尤其 1／20 临界判定。
- 正式 Prompt 示例通过实际解析器；JSON 字符串中的同名标签不误切分。
- 未知字段、空值、null、类型错误、UTF-16 超长、多请求和截断不执行。
- 代码、Markdown 引用、历史区域及其他工具标签不作为本次请求。
- 完整开标签之前原样显示，之后隐藏；普通末尾 `<` 保留。
- 无效输入、八次上限、坏记录、前缀被编辑时不调用随机源。
- 已记录骰点经过当前格式读回保持事实；正文追加保留锚点，编辑使锚点失效。
- 默认偏好不启用；不支持旧探针格式或未知 schema 分支。
- 模型结果资料只投影业务字段；宏样式文本可在 JSON 中无损往返，不成为酒馆指令。
- 正则有效时不产生替换候选，缺失／禁用才修复，其他规则对象保留。

这些测试不证明“保存已确认”“重试不重投”或“同楼卡片已完成”；相应运行与宿主层尚未实现。

## 真实宿主显示验证

使用现有隔离 SillyTavern 1.18.0（8098）与本地模拟供应商（8099），由 `g1-build.mjs` 编译正式模块后在浏览器加载；没有用另一份手写解析器代替生产代码，也没有真实付费模型调用。

普通设置、重建 converter 并开启标签转义／自动 Markdown 修正／流式淡入，两种场景分别逐字符输出正式请求。实际帧出现 `<` 至 `<xb_action_check` 的半截文本，随后恢复为 `Visible attempt.`；没有 JSON 内容进入显示。两场景各 1 个模型请求，原始输出完整，被正式解析器识别为合法请求。

普通 `The symbol is:\n<` 的宿主格式化结果在启用规则前后相同。结果资料中的 `{{setvar::diceG1::changed}}` 经过真实 `getExtensionPromptByName` 宏处理后仍作为原始字符串数据存在；没有转成宏执行结果。

证据位于忽略目录 `output/playwright/roll-native-gate/`：

- `g1-entry.ts`、`g1-build.mjs`、`g1-display.cli.js`。
- `g1-display-results.json`、`verify-g1-display.mjs`。
- `g1-display-plain.png`、`g1-display-rebuilt.png`；已查看重建场景的实际画面。

结果核对为 `completeOpeningTagDisplayPassed: true`，同时明确 `completeOsMigration: false`。

## Prompt 事实依据

| 说明 | 实现依据 |
| --- | --- |
| D20、无属性加成、临界与 DC | `domain/action-check.ts:49`、`:59` |
| 字段、必填、类型与长度 | `domain/action-check.ts:21`、`:26`；字段说明 `protocol/request.ts:4` |
| 末尾单个 JSON 请求 | `protocol/request.ts:15` |
| 八次后只收尾，不再执行新检定 | `application/prepare-action-check.ts:9`、`domain/check-records.ts:4` |
| 有序业务结果、不外露 ID／摘要／版本 | `protocol/prompt.ts:6` |
| 宏样式内容是数据 | `protocol/prompt.ts:10`；宿主 `public/script.js:3198` 的宏展开及本轮浏览器验证 |

提示词技能影响：领域／契约／结果各自表达一次，限制引用代码，示例经解析器执行，Prompt 不进入记录或分区。

## 检查与剩余施工

- Dice 针对性测试 10 项通过，新增文件 ESLint 通过。
- 本轮 OS 全量测试 946 项通过；其后补充坏记录测试并重跑 Dice 全部 10 项通过。
- `npm run lint:xiaobai-os`、`npm run build:xiaobai-os`（含 TypeScript）、差异空白检查通过。
- 未提交／推送，未改真实用户聊天或配置。隔离测试规则和注入已清理，浏览器及服务收尾关闭。

下一阶段按原施工方案进入消息候选及保存确认，再连接续写链与卡片；不是等待标签方案批准。不把上述纯规则与显示验收冒充完整 OS 功能验收。
