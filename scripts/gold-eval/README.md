# Gold Eval 评测工具

这里拥有 Gold case、评分、Natural product-aligned capture、synthetic probe capture 与各自消费者。生产召回仍由
`story-summary-replay` 调用正式 `recallMemory()`；Gold Eval 只负责编排、观测、冻结和判分，
不另造一套召回或向量世界。

## 产品对齐不变量

评测不得向生产召回传递专用 query 参数。唯一允许的执行边界与 SillyTavern 普通发送一致：

```text
冻结 Summary / L0 / L1 / L2 到 q-1
→ 将 USER 消息对象 q push 到当前内存 chat
→ 调用正式 recallMemory()（它从 chat 读取最近三条）
→ 完成正式 Prompt 装配
→ 从评测内存 chat 移除 q，保持下一题隔离
```

`track=natural` 必须 push 原聊天在 query floor 的同一个真实 USER 对象，并校验其文本与 Gold
逐字一致。query 不进入 boundary snapshot、Summary、L0/L1 或向量库。经典末尾问答则只能创建
`synthetic-probe-chat-tail` USER 对象；它可以测长记忆压力和机制完整性，但不是自然用户主指标，
不得用于证明线上语义策略。

## 自检

```powershell
npm run test:gold-eval
```

自检包含评分纯函数与 run/cassette 生命周期契约；只使用临时目录和本地 stub fetch，不调用 API，
也不写入 `总结测试/runs`。

## 研究控制面

跨天研究使用外部工作区的 `STUDY.json` 作为唯一可执行当前状态。不可变 `runs/` 保存证据，
`STATUS.md` 只是由工具生成的人类视图；追加式决策、实验和 API 账本不能反向驱动下一步。

```powershell
npm run gold:study -- audit "C:\path\to\STUDY.json"
npm run gold:study -- status "C:\path\to\STUDY.json" "C:\path\to\STATUS.md"
npm run gold:study -- next "C:\path\to\STUDY.json"
```

phase 只能按 `architecture → dev-matrix → baseline → experiments → candidate → holdout →
browser-e2e → recommendation → complete` 推进；candidate 验证失败可退回 experiments。transition
需要当前 STUDY hash，避免另一个进程或接手者覆盖新状态。holdout 在进入对应 phase 前保持 sealed，
正式插件行为在研究完成前保持 frozen。

## 输入边界

`scoreCase()` 接收：

- `case`：由 `CASE_SCHEMA.md` 定义并经 `validateCase()` 规范化的金标准。
- `observation`：replay 适配层产生的 JSON 可序列化结果。

`observation.stages` 的每个阶段都是按排名排列的
`{ unitId?, floor, rank, score?, source? }[]`：

```text
r1Dense / r2Dense / lexical / fusion / rerank / graph / final / prompt
```

其中 `final` 是唯一主指标口径：graph/causal 与相关性过滤完成后，Prompt 装配器按预算竞争顺序
列出的跨层证据单元（constraints、arcs、events、L0），尚未执行预算裁剪。同一单元覆盖的楼层
共享 `unitId/rank`；Recall/MRR 按楼层所属单元 rank，Precision 分母按唯一 unit 计算。`prompt`
是裁剪后真正注入的单元。其他阶段只用于定位最早失真，不能回退冒充主排名。冻结证据文本仅
作为无法携带楼层来源时的补充检测。

## 所有权

- `lib/cases.mjs`：用例解析与校验。
- `lib/score-utils.mjs`：观测规范化与阶段状态。
- `lib/replay-adapter.mjs`：把真实 replay 的阶段观测转换成评分输入。
- `lib/metrics.mjs`：召回、答案与汇总指标。
- `lib/scorer.mjs`：单题装配和失败归因。
- `lib/report.mjs`：标准运行产物与 Markdown 报告。
- `lib/run-store.mjs`：版本化 run、逐题 checkpoint、完整性校验和 valid/invalid 生命周期。
- `lib/transport-cassette.mjs`：捕获并严格复放 Embedding/Rerank 请求与响应；cassette miss 禁止联网。
- `replay-session.mjs`：synthetic probe live capture 与 recall-cassette 编排。
- `prompt-session.mjs`：复用同一 normalized recall 的 Prompt 配对轨道。
- `reader-session.mjs`：只读取冻结完整 Prompt 的固定 reader 轨道。
- `tests/`：评分层公开输入输出契约。

真实召回的采集属于 `story-summary-replay` 适配层。它可以依赖正式运行环境；评分层不能反向依赖它。

## 真实聊天用例 authoring

`authoring/` 是 source-first 金标准的独立所有者，流程固定为：

```text
原文窗口发现 → 跨窗口候选合成 → 仅凭引用原文独立验证 → accepted/disputed/rejected 分流
```

离线准备不会调用 API，也不会复制原聊天正文到任务文件：

```powershell
npm run gold:author -- prepare `
  --sample="C:\path\to\chat.jsonl" `
  --workspace="C:\path\to\evaluation-workspace" `
  --dataset=real-800 `
  --split=dev `
  --run-name=real-800-dev-v1
```

需要为 authoring 使用不同模型时，只冻结非敏感覆盖，Key 由环境变量在执行时读取：

```powershell
npm run gold:author -- prepare `
  ... `
  --api-provider=custom `
  --api-url="https://provider.example/route" `
  --api-model="model-name" `
  --api-key-env=OPENAI_API_KEY
```

manifest 记录 provider、无查询参数的 endpoint base、model 和环境变量名，不读取或保存 Key 值。

后续 `discover`、`synthesize`、`verify` 才会使用现有 replay 配置的 `summaryApi`；每个成功响应
原子写入独立结果文件，可从中断处续跑。`finalize` 是纯离线步骤，只有通过验证的 accepted 用例
进入主 cases 文件。当前总结、召回、向量和 Prompt 均不参与真值生成。

## 真实 replay 接入

可以只在本地、不提交的 `scripts/story-summary-replay.local.json` 中增加：

```json
{
  "goldEval": {
    "enabled": true,
    "casesPath": "外部工作区/cases/dev.jsonl",
    "runsRoot": "外部工作区/runs",
    "split": "dev",
    "runName": "dev-baseline",
    "caseIntervalMinMs": 12000,
    "caseIntervalMaxMs": 15000
  }
}
```

然后使用正式 snapshot 运行：

```powershell
npm run test:story-summary:recall
```

也可以完全不改本地配置，用命令行覆盖私有路径：

```powershell
node scripts/story-summary-replay-runner.mjs recall-only `
  --sample="C:\path\to\chat.jsonl" `
  --snapshot="C:\path\to\snapshot.json" `
  --max-floors=855 `
  --gold-cases="C:\path\to\cases.jsonl" `
  --gold-runs-root="C:\path\to\runs" `
  --gold-split=dev `
  --gold-run-name=real-800-baseline `
  --gold-case-interval-min-ms=12000 `
  --gold-case-interval-max-ms=15000
```

Bootstrap 冒烟可用 `--output=<外部目录>` 覆盖报告与默认 snapshot 目录，避免派生产物写回源码树。
私有凭据不落盘时，可用 `--summary-api-provider/url/model/key-env/reasoning-effort/max-tokens`
覆盖 replay 的总结 API；Key 只从指定环境变量读取。

要同时运行固定 reader，可增加：

```powershell
--gold-reader=true `
--gold-reader-max-tokens=30000 `
--gold-reader-reasoning-effort=none `
--gold-reader-max-attempts=3 `
--gold-reader-retry-delay-ms=5000 `
--gold-reader-concurrency=4
```

reader 复用本次冻结的 summary API，但只接收实际记忆 Prompt 与 case query，不接收 expected answer
或 gold evidence。30000 是输出上限，不要求模型用满；Google 的 `reasoning-effort` 在
`minimal/low/medium/high` 时映射为真实 `thinkingConfig`，`none` 时省略该字段。原始回答与确定性
评分保存在私有 run 的 `stage-trace.jsonl`。单次空答、网络错误、408/409/425/429 和 5xx 会在同一
case 内按 5 秒、10 秒退避重试；400/401/403/404 等配置错误不重试。每次尝试都记录脱敏诊断，
不会跳到下一题，也不会用 fallback 把错误洗成答案。reader-only 默认 4 题并发；同一批出现错误时，
不会启动下一批，并记录批次内所有已发请求。

启用经典 Gold Eval 后，普通 `recallCases` 不再额外执行，避免重复 API 调用。经典 case 的
`atFloor` 表示冻结历史的最后楼层；合成 USER 会作为下一楼临时入列。需要产品质量结论时必须使用
Natural 轨：在真实 query floor 建立 q-1 boundary，并把原始 USER 对象 q 临时入列。
Gold Eval 默认用冻结 cases hash 与 case id 生成可复现的 12–15 秒用户回合间隔；题内 Embedding、
Rerank 并发保持正式插件行为不变。同一 cases 文件重跑得到相同节奏，避免不可审计的随机运行。
运行产物写入配置的 `runsRoot/<run-id>/`，不把私有样本路径或 API Key 写入仓库配置。

## Synthetic probe capture 与三个消费者

一次合格的新版 synthetic probe capture 会逐题 checkpoint，并在完整成功后原子生成：

```text
manifest / cases / prompts / prompt-inputs / transport-trace /
stage-trace / metrics / failures / report / code archive
```

所有产物和归档代码都有 SHA-256；读取时会重新校验。`transport-trace` 保存 Embedding/Rerank
请求身份与完整 JSON 响应，用于严格离线复放，因此整个 run 属于私有敏感数据。所有者是评测工作区
的用户，生命周期只跟随该次 run；删除对应 run 目录即可完整清理，不存在数据库、缓存或兼容副本。

这些离线消费者只处理 `status=valid`、schema/hash 完整的 synthetic probe source；它们用于机制、
压力和受控反例，不会升级为 Natural 产品证据：

- `reader-only`：只把冻结 `Prompt + query` 发给 reader；production network 永远为 0。
- `prompt-only`：复用同一 normalized recall 重建 Prompt；所有外部调用必须为 0，并校验当前 sample/snapshot hash。
- `recall-cassette`：重新执行正式召回代码；每个 Embedding/Rerank 请求必须按
  `host + path + requestHash` 命中冻结响应。命中时 production network 为 0；miss、少请求、多请求、
  响应缺失或篡改都会立即 invalid，绝不回退 live API。

`recall-cassette` 只适合请求身份不变的召回后处理改动。Query、Embedding 输入、Rerank 文档/参数
发生变化时，miss 正是在说明实验变量已经越过冻结边界，必须建立新的同轨 source capture。

离线复放命令：

```powershell
node scripts/story-summary-replay-runner.mjs recall-cassette `
  --sample="C:\path\to\chat.jsonl" `
  --snapshot="C:\path\to\snapshot.json" `
  --gold-cases="C:\path\to\cases.jsonl" `
  --gold-runs-root="C:\path\to\runs" `
  --gold-run-name=recall-cassette-v1 `
  --gold-capture-run="C:\path\to\runs\synthetic-probe-capture"

node scripts/story-summary-replay-runner.mjs prompt-only `
  --sample="C:\path\to\chat.jsonl" `
  --snapshot="C:\path\to\snapshot.json" `
  --gold-runs-root="C:\path\to\runs" `
  --gold-run-name=prompt-only-v1 `
  --gold-capture-run="C:\path\to\runs\synthetic-probe-capture"
```

固定 reader 是独立 API 轨道，运行前仍须经过 API 闸门：

```powershell
node scripts/story-summary-replay-runner.mjs reader-only `
  --gold-runs-root="C:\path\to\runs" `
  --gold-run-name=reader-only-v1 `
  --gold-capture-run="C:\path\to\runs\synthetic-probe-capture" `
  --gold-reader=true `
  --gold-reader-max-tokens=30000
```

新 provider/model 必须先用 `--gold-case-id=<case-id>` 定点验证已知困难题。完整 run 失败后，保持
模型、参数、Prompt、代码 bundle 与 cases 不变时，可用 `--gold-reader-resume-run=<invalid-run>`
创建新 run 并复用成功 checkpoint；配置 fingerprint 或 bundle 不一致会在 API 前拒绝。

旧 `real-800-tpm-safe-baseline-v1` 与旧名 `production capture` 产物只保留为历史观察，不能作为新工具 source。
后续若 Query、
Embedding 输入、Rerank 文档/参数或 Prompt 装配变量越过当前冻结边界，必须按 `RUNBOOK.md` 重新申请
对应 product-aligned Natural capture；reader 仍需单独披露评测 API。
