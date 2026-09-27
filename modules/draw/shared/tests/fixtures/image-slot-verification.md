# [img:] 前端接管与任务边界：验证记录

日期：2026-09-27。范围：单聊前端；后台插件只运行既有回归，不修改文件。

结论：下列行为回归及隔离真实 SillyTavern 浏览器验收通过。真实付费供应商、移动 WebView、系统冻结后台页未覆盖，不承诺所有环境“100%可用”。

## 改了什么、为什么

- 接管归 `chat-image-session.js`，展示归 `chat-message-images.js`，正文替换／删除／位置映射归 `chat-image-placement.js`。任务身份依赖消息对象、分支、生成范围及标签位置，不依赖 DOM、可见性或被冻结的楼层下标。
- 完成边界先恢复已接管图位，再由 DICE 处理同楼，最后解析剩余标签。三轮续写准备交错也只恢复已提交的图位；删除其他图位、前楼层移动会重定位，真正编辑或准备期间离开目标会终止接管。
- 原生回复保持“输入落图库 → 同步替换正文和当前 swipe → 交还宿主保存”；不增加聊天保存／读回，不等待供应商响应。历史标签、编辑保存、重挂载只展示或提供手动入口。
- 既有 provider 任务登记表统一拥有胶囊、自动配图、原生标签及重绘批次。每批独立取消，按聊天／消息／当前分支汇总；已结算兄弟批次留到聚合结束，后台接回不伪装成完成。
- 胶囊挂载时直接读取上述登记表的汇总，不再漏掉挂载前的通知。正文 DOM 被宿主替换后，已有图位通过原展示队列恢复，不再露出原始 slot，也不重买。
- 图片取消先捕获目标，再逐项持久化既有取消意图并发送既有取消请求。某项已经结算不阻断其他项；活动执行者读取到取消意图后通过自己的信号推进。三家均不再绑定宿主停止文字生成事件。
- 提交前取消、明确拒绝、已知成功、提交后未知分开。错误转换保留请求结果标识；已解码成功不被后续取消抹掉，未知结果不自动重发，并保留再计费风险提示。未知直连请求的胶囊不再永久旋转确认；排队兄弟卡不再冒充正在生成。
- NovelAI 的电子书、小白酒馆、普通文本入口独立于聊天楼层，保留调用方取消信号和图库归属。
- 迟到原生结果可保留图库，但不能写到其他消息或重建删除的图位。显式删除标记归既有任务记录所有，优先于保留策略，随原结算／清理路径释放。没有新增数据库、独立缓存或锁；任务汇总和接管观察不持久化。

未改对外绘图 facade、TauriTavern 内容挂载入口、DICE 检定业务或 Prompt、用户配置及真实聊天。没有重建无关脏产物，没有提交／推送。

## 实际验证

| 检查 | 最后成功结果 | 证据 |
| --- | --- | --- |
| 绘图共享、三家 provider、后台恢复、TauriTavern、后端插件既有回归 | 964 通过，0 失败 | [完整日志](../../../../../output/playwright/img-clean-regression.log) |
| DICE 全部匹配回归 | 245 通过，0 失败 | [日志](../../../../../output/playwright/img-clean-dice.log) |
| 涉及文件 ESLint | 0 错误、0 警告 | [日志](../../../../../output/playwright/img-clean-lint.log) |
| 绘图目录相对导入检查 | 通过 | [日志](../../../../../output/playwright/img-clean-draw-imports.log) |
| 全仓相对导入检查 | 早先通过；最后重跑发现现有工作区缺少 OS Host 构建产物，不擅自重建 | [最后日志](../../../../../output/playwright/img-clean-imports.log) |
| OS 类型检查 | 通过 | [日志](../../../../../output/playwright/img-clean-types.log) |
| OS Host 隔离构建 | 通过；仅输出到独立验收目录 | [日志](../../../../../output/playwright/img-clean-host-build.log) |
| git diff --check | 通过；无关已有文件有 CRLF 提示 | [日志](../../../../../output/playwright/img-clean-diff-check.log) |
| 后端插件无改动核对 | git status / diff --numstat -- server-plugin 均为空 | 本次终端检查 |

定点测试是上述完整回归的子集，不另行相加：
- 两种准备完成顺序、三轮续写交错、胶囊两图＋标签一图聚合、乱序 swipe 均重复 100 轮。
- 原生消息矩阵默认 100 轮，共 1,600 批次／4,800 张模拟图，其中单聊部分 800 批次／2,400 张；零漏接管、零重复提交。没有因本次单聊修正新增群聊业务。
- 无 DOM、重复事件、重复标签、DICE 与图位交错、保存失败、输入落库失败、切聊／切分支后再返回、准备期间删其他图位／前楼层均有行为覆盖。
- 刷新前后、响应未知、结果落库失败、图位丢失、显式逐项删除、后台接回沿既有任务身份执行，未知请求不重买。
- 三家实际前端适配器覆盖提交前取消、明确拒绝、提交后断线／取消、成功已解码但落库时取消，以及另一聊天停止文字。NovelAI 三种外部文本入口通过。
- 胶囊迟挂载／DOM-only 恢复、后台 handoff、取消期间切目标、逐图排队状态分别有回归。逐图状态测试先红后绿：[失败复现](../../../../../output/playwright/img-clean-card-state-red.log)、[通过结果](../../../../../output/playwright/img-clean-card-state.log)。

## 浏览器验收

通过 Playwright CLI，在独立数据目录的真实 SillyTavern 1.18.0 页面运行。使用实际 `Generate`、SSE 流解析、事件、聊天保存、绘图卡片、胶囊、三家前端适配器／编译器／请求队列／图库；只隔离设置、LLM 规划输出和供应商 HTTP 响应。没有手动调用可见性回调。

- 三家 × 流式／非流式，两图均接管并加载；正文隐藏、滚动、宿主重绘和 DOM 重挂载不重复提交。
- 三家 × 普通回复／续写／真实 swipe 按钮／重生成，每轮新增两次请求；续写保留前两张，最终四张。
- 三家实际胶囊取消按钮：第一张已提交后取消为 UNKNOWN，第二张尚未提交为 FAILED；每批只有一次供应商请求。未知胶囊显示终态，不再假装仍确认中。
- 实际编辑按钮保存新增标签，没有自动请求；故意返回聊天保存 500 后，两张仍成图。
- 合计 24 条场景记录、43 次模拟供应商提交，结束时活动任务为 0。供应商输出为可解码的 1×1 PNG，仅证明交付／加载链路，不是视觉大图质量验收。

[逐场景结果](../../../../../output/playwright/img-clean-browser-results.json)、
[流式流程](../../../../../output/playwright/img-clean-browser-flow.log)、
[三家矩阵](../../../../../output/playwright/img-clean-browser-matrix.log)、
[取消／编辑／保存失败](../../../../../output/playwright/img-clean-browser-actions.log)、
[续写／swipe／重生成](../../../../../output/playwright/img-clean-browser-branches.log)。

截图：[流式标签](../../../../../output/playwright/img-clean-real-streaming.png)、[第一张生成／第二张排队](../../../../../output/playwright/img-clean-real-pending.png)、[成图](../../../../../output/playwright/img-clean-real-success.png)、[保存失败仍成图](../../../../../output/playwright/img-clean-save-failed.png)。

验收过程中另观察到原生聊天保存间歇返回 500。隔离 ST 的服务日志明确报 `write-file-atomic → renameSync → EPERM`，目标仅为独立验收聊天文件；没有据此推断占用者，也没有改宿主或后端绕过。该情况下绘图照常完成，保存错误由原生提示。早期浏览器检查暴露的胶囊初始状态不可点击、DOM-only 图位恢复遗漏均已修正并完整复跑；不是忽略超时或强制点击来算通过。

## 复现入口

在仓库根目录使用现有依赖：

```powershell
node --test modules/draw/shared/tests/*.test.js modules/draw/providers/*/tests/*.test.js integrations/tauritavern/tests/*.test.js server-plugin/littlewhitebox-image-jobs/tests/*.test.js
node --import tsx --test modules/xiaobai-os/tests/dice*.test.js
node scripts/check-relative-imports.mjs
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit -p tsconfig.xiaobai-os.json
git diff --check
git status --short -- server-plugin
```

浏览器用 `provider-browser-host.mjs`（51962）提供内存中的实际 provider bundle 和模拟供应商；51961 是使用 `output/playwright/img-clean-st/config.yaml` 与独立 dataRoot 启动的真实 ST。配置禁止后台插件和自动更新，不接真实用户实例。

依次通过 `playwright-cli --session img-clean run-code --filename=...` 运行同目录：
`provider-browser-setup.mjs` → `provider-browser-flow.mjs` → `provider-browser-matrix.mjs` → `provider-browser-actions.mjs` → `provider-browser-branches.mjs`。

必须先结束未完成请求再清理路由／关闭页面；源码修改后重启 fixture 并重新加载，以免验收旧 bundle。旧的 `image-slot-browser-*` 仿宿主夹具不作为本轮真实宿主验收证据。

## 未覆盖环境

- 未调用真实付费供应商；后端插件只跑既有回归，未部署或验收真实后台服务。
- 未验收原生 Tauri／移动 WebView、系统冻结或节流后台页；相关适配回归通过不等于这些平台的端到端通过。
- DICE 与绘图的位置映射做了真实适配器的集成测试、类型检查与隔离 Host 构建，没有在浏览器中启动完整 DICE APP 联动。
- DICE 修改需要随正常 OS Host 发布构建生效。本次没有覆盖已有其他修改的 `modules/xiaobai-os/dist`。
- 最后全仓导入检查时 `index.js` 引用的 `modules/xiaobai-os/dist/xiaobai-os-host.js` 缺失；这是交付时的工作区缺口，不能宣称当前整个扩展已可部署。本次只验证绘图源码导入及隔离 Host 构建，未恢复或重建无关产物。
- 未重放最初故障现场，不能断言当时具体原因或归咎网络。真实用户数据、配置、既有图片和无关脏工作区未清理。
