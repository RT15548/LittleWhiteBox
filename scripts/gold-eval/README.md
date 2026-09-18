# Gold Eval 评测工具

这里拥有 Gold case、评分、Natural product-aligned capture、synthetic probe capture 与各自消费者。生产召回仍由
`story-summary-replay` 调用正式 `buildVectorPromptText()`；Gold Eval 只负责编排、观测、冻结和判分，
不另造一套召回或向量世界。

## 产品对齐不变量

评测不得向生产召回传递专用 query 参数。唯一允许的执行边界与 SillyTavern 普通发送一致：

```text
持久历史只包含 0..q-1（Summary 的覆盖终点服从正式延迟楼层与触发间隔）
→ 将 USER 消息对象 q push 到当前内存 chat
→ 调用正式 buildVectorPromptText()：入口判断 → recallMemory() → Prompt 装配与包装
→ 从评测内存 chat 移除 q，保持下一题隔离
```

`track=natural` 必须 push 原聊天在 query floor 的同一个真实 USER 对象，并校验其文本与 Gold
逐字一致。query 不进入 boundary snapshot、Summary、L0/L1 或向量库。经典末尾问答则只能创建
`synthetic-probe-chat-tail` USER 对象；它可以测长记忆压力和机制完整性，但不是自然用户主指标，
不得用于证明线上语义策略。

## 自检

```powershell
npm run test:gold-eval
npm run test:story-summary:alignment
```

自检包含评分纯函数与 run/cassette 生命周期契约；只使用临时目录和本地 stub fetch，不调用 API，
也不写入 `总结测试/runs`。

`tests/prepared-lifecycle.test.mjs`从真实CLI启动独立进程，覆盖空库L1/L0/StateVector、Summary/L2、
两种总结时机、多个查询和捕获；在完整收据落盘、请求飞行中及模拟磁盘满时中断，再启动新进程检查复用/拒绝。
四种API的429及永久/格式错误也走这条完整路径。预加载替身拒绝所有非fixture URL和真实凭据；
不能把这些模拟响应的楼层覆盖率当算法质量。单独执行：`node --test scripts/gold-eval/tests/prepared-lifecycle.test.mjs`。

可选的只读dev数据整链验收：设置`LWB_OFFLINE_REAL_PROFILE`为无凭据prepared配置的绝对路径，然后执行
`node --test --test-name-pattern="read-only dev datasets" scripts/gold-eval/tests/prepared-lifecycle.test.mjs`。
`LWB_OFFLINE_REAL_JOB`可限定为`real-300`、`real-240`或`real-800`；只在临时副本里替换API/凭据/输出路径和回合等待，
原配置与原聊天不变。这仍然是本地fixture，不得当作真实质量capture。

`alignment` 用当前正式模块、内存 IndexedDB 和本地模拟供应商响应比较正式入口与回放入口的
完整注入文本和请求内容，并覆盖配置规范化、延迟总结、空召回、失败、取消和运行时释放。
不读取本地 API 配置、不使用私有聊天、不访问网络。它证明执行一致，不证明算法质量；
真实供应商质量实验和浏览器发送/重生成交互验证仍是独立步骤。

## 当前运行配置与产物

`story-summary-replay.local.json` 的可选 `panelConfig` 接收当前插件面板配置。缺省字段由插件
`applySummaryPanelConfigSnapshot()` 补齐；现有 `summaryApi`、`vectorConfig` 与命令行 API 覆盖
用于指定本次供应商。`summaryTriggerInterval`、wrapper、`textFilterRules` 的显式覆盖也会进入
同一次规范化。不要把 Key 写入仓库示例或报告。

Natural capture/resume 默认启用自动总结，触发时机、间隔和延迟使用插件默认值或 `panelConfig.trigger`
的显式设置；支持 `before_user` 和 `after_ai`。消息导入保留空楼层、原文换行、系统标记与 swipe 信息。
正式计算与回放共用总结触发判断和 L2 向量输入；不会用回放专属过滤规则覆盖插件默认值。

新运行记录 `execution.contract=story-summary-computation-v1`、源码指纹、实际生效的非敏感面板配置、
完整 Prompt、供应商 trace、当前 L2 排序和 L1 选择结果。`prompts.jsonl` 的
`evidenceTrace.eventEvidence` 记录逐条证据的 owner、通道、局部分数、token 成本及是否被预算接纳；
`prompt-inputs.jsonl` 保存实际 L1 选择及 L2 召回结果。`final/prompt` 楼层集合仅作路径诊断。

旧执行契约的 capture 不能作为当前 Natural/Prompt/cassette source，需另行授权生成新 capture。
原始历史文件保持不变，不迁移、不补字段伪装新证据。Natural 配对结果的
`coverageGatePassed` 只表示楼层覆盖门槛，`qualityMeasured=false`；不能据此宣称语义质量提高。

经授权后，新 baseline 使用 `natural-capture`，例如：

```powershell
node scripts/story-summary-replay-runner.mjs natural-capture `
  --sample="C:\path\to\chat.jsonl" `
  --gold-cases="C:\path\to\natural-cases.jsonl" `
  --gold-runs-root="C:\path\to\private-runs" `
  --gold-run-name=current-product-baseline
```

此命令会调用配置的 Summary/L0/Embedding/Rerank API；不是零 API 自检。

### 已准备数据的零网络预检

支持用不含 Key 的可执行 JSON 配置声明共用参数和多个 `jobs`；每个 job 绑定原聊天、Gold、
当前生产源码 SHA256 和 `prepared.maxRequests`。凭据文件只在获准执行后读取，不继承其中的旧参数。

```powershell
node scripts/story-summary-replay-runner.mjs --preflight --config="C:\path\to\current-natural-baseline.json"
# 仅在主人批准这一份聊天的 API 范围后执行；不会自动启动其余 jobs
node scripts/story-summary-replay-runner.mjs --config="C:\path\to\current-natural-baseline.json" --job=real-300 --allow-api
```

预检使用真实解析、配置规范化、分块和总结切片，但不生成假总结/向量、不读凭据、不联网、不创建 run。
它报告已绑定的真实提问、名义总结/L0/L1工作量及尚不能确定的生成物向量、召回和重试请求。
预检通过不是质量通过，也不能离线证明凭据与供应商可用。

预备运行禁止命令行覆盖模型、数据和模式；输入/源码漂移必须重新核对配置并预检。
job硬上限包含失败请求和重试，跨进程累计，禁止跨源请求与HTTP重定向；本地拦截保留trace，
但不计入已发出的API数。达到上限停止，不自动换源、提额或重跑。还会核对插件规范化后的实际模型/URL，避免配置写了却未生效。

预备配置的 `requestRecovery` 在传输层只补失败请求，不重跑成功的同批项：有完整HTTP响应的408/429/5xx
最多3次，遵守 `Retry-After` 和同源冷却；`baseDelayMs`/`maxDelayMs`约束等待。永久错误不自动重发，
Summary不叠加整段重试。每次尝试及等待仍完整记录；耗尽只表示捕获未完成，不把已完成题目判为质量失败。
新prepared运行在输出目录保存`request-journal.jsonl`：请求意图先预留预算，四类API完整响应校验并fsync后才交给插件。
这是该job的私有执行事实，不是跨job缓存；不存请求正文/Authorization，响应仍是敏感数据，不可提交。
引用capture退役后，删除prepared输出目录即可删除收据。运行锁是OS释放的管道/socket，不创建持久锁文件。

已有job禁止新开批；只有这套机制生成且收据完整的job，可在重新获准后显式恢复：

```powershell
node scripts/story-summary-replay-runner.mjs --config="C:\path\to\prepared.json" --job=approved-job --resume-prepared --allow-api
```

恢复绑定相同数据、配置、代码和平台，从空状态本地复放已保存响应，只对尚未执行的后缀外发。
完整阶段必须严格消费相同请求集合，允许并发但不将重复出现的同文请求当缓存；变更、损坏、未消费收据或并发所有者均停止。
`network`是本进程实际调用；`journal`是复用，并保留收据引用和已用预算。恢复捕获的运行耗时不能用来评价线上延迟。

不同新job可显式设置`responseArchive: [{ path: "绝对路径/manifest.json", sha256: "64位哈希" }]`，
只读复用已完成的`story-summary-computation-v1` capture。预检校验manifest、transport及成功响应正文；
执行时完整URL（含协议）、方法和完整请求body哈希必须相同，模型/参数/输入变化均不命中。
命中记作`archive`并保留来源位置，不占新job的网络预算；未命中仍走现有journal与有界重试。
相同请求有多个成功响应时按配置来源顺序和trace顺序取第一个，规则固定、不挑选结果。
索引只活在当前进程，不新建持久缓存；来源run须保留至引用它的job退役。带归档的运行不提供首次在线延迟结论。

连接中断、响应体未读全、收据写入失败或飞行中进程退出，均可能已计费而结果未知，恢复入口会在读取凭据前停止；
不能用自动重发声称exactly-once。格式错误200保留原始响应，重复执行不会再次购买它。
旧run若没有journal或缺失L0/Summary正文，不能追溯伪造或静默重新购买。旧300中断run仍禁止重开。

只有主人明确接受某一个未知请求可能重复计费时，才使用四个精确批准参数：
`--retry-unknown=<id> --retry-journal-sha256=<hash> --retry-source-manifest=<path> --retry-source-sha256=<hash>`，
同时必须指定`--resume-prepared --allow-api`。哈希冻结批准时的原journal和invalid manifest；
它们不是“忽略漂移”开关。输入/配置/产品源码/依赖/Node平台均不许变化；经审查的测评工具变动作为
旧binding→新binding的追加记录留存。旧intent不删除、不补伪response；替代请求有新id与retryOf，预算两次都扣。
成功响应照常复用，只允许该未知请求再外发一次；若它再次未知、429或格式失败，禁止再次购买。
追加授权后意外退出可凭同一代码继续，授权不会刷新次数；原批准参数在journal变动后会被判stale。
授权属于原job的持久恢复事实，所有者/生命周期/删除路径沿用原journal，不另建缓存、配置或锁。
失败scope现在保留实际调用trace与有限安全原因类别，不能把包装层的local-guard误当原请求未发出。

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

其中 `final` 是楼层覆盖诊断的主排名口径，不是语义质量分数：graph/causal 与相关性过滤完成后，Prompt 装配器按预算竞争顺序
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
