# LittleWhiteBox Image Jobs

LittleWhiteBox 的可选 SillyTavern server plugin。开启小白盒后台任务后，Scene Planner 与整批图片任务都在 Node 进程中执行；前端收到“后台已接管”后，切后台、断网、刷新、WebView 冻结或关闭浏览器都不会暂停已创建的任务，重新打开后会自动接回。

## 安装

1. 确认 SillyTavern 使用 Node.js 18 或更新版本。
2. 将本目录完整复制为 `SillyTavern/plugins/littlewhitebox-image-jobs/`。
3. 在 `config.yaml` 开启 `enableServerPlugins: true`，然后重启 SillyTavern。
4. 如果装过旧的 `SillyTavern/plugins/littlewhitebox-nai/`，建议一并删除。它是独立插件 ID，不会和本插件冲突，但小白盒已完全不再请求它。

插件挂载在自己的命名空间：

```text
/api/plugins/littlewhitebox-image-jobs/
```

## Provider 边界

- NovelAI：保留 `/v1/generate-image`、`/v2/generate-image`、`/v1/generate-image-stream`、`/v1/test`、`/v2/test` 的现有行为；异步任务保留 V5 原始 MessagePack，仍由前端解码。
- SD WebUI：后端直接请求 `/sdapi/v1/txt2img`。取消会中止当前 HTTP 传输，但不会调用会误伤同一实例其他用户的全局 `/interrupt`。
- ComfyUI：开启后台批量任务后，由酒馆服务器完成 `/prompt`、`/history/:promptId`、`/view`；取消时只通过 `/queue` 删除本任务的 prompt，不调用全局 `/interrupt`。即使原连接模式选择浏览器直连，酒馆服务器也必须能够访问所填地址。关闭后台任务时仍保持原酒馆代理或浏览器直连链路。

## 异步任务 API

`GET /status` 声明 capability：

```text
image-batch-jobs-v1
draw-runs-v1
```

通用任务接口位于 `/v1/jobs`：

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/v1/jobs` | 创建 provider 批量任务 |
| GET | `/v1/jobs` | 列出当前登录用户的任务，供浏览器刷新后接回 |
| GET | `/v1/jobs/:jobId` | 查询任务和每项状态 |
| GET | `/v1/jobs/:jobId/results/:index` | 获取完成图片或 NovelAI V5 原始流 |
| DELETE | `/v1/jobs/:jobId/results/:index` | ACK 已落库结果并释放字节 |
| POST | `/v1/jobs/:jobId/cancel` | 取消当前和未执行项目，保留完成结果 |
| DELETE | `/v1/jobs/:jobId` | 删除终态任务 |

任务以当前登录用户 `req.user.profile.handle` 隔离。`requestId` 必填且按用户幂等；每批最多 20 项。任务只存在于内存，终态立即丢弃请求输入；前端在图片与 slot selection 都落库后才 ACK，全部交付后删除终态任务，异常退出时由一小时 TTL 兜底。浏览器会在独立 IndexedDB 中保存不含密钥和请求正文的 jobId/slotId 交付日志，用于刷新、断网或关闭页面后接回。默认上限为 200 个任务、每用户 20 个任务、64 MiB 排队输入和 512 MiB 结果字节。

## 后台 Agent 回环诊断

`POST /v1/draw-runs/probe` 验证服务器能否用当前请求的登录身份回环访问 SillyTavern。它覆盖 Cookie session、CSRF、内置 Basic Auth、IPv4/IPv6 与原生 HTTPS，不调用模型，也不会产生费用。响应只报告凭证是否通过验证，不回显凭证内容。

可从小白盒目录运行真实部署矩阵（默认自动定位同一 SillyTavern 安装，也可把安装根目录作为参数传入）：

```sh
node server-plugin/littlewhitebox-image-jobs/tests/loopback-deployment-matrix.js
```

该脚本从 SillyTavern 1.18.0 源码建立隔离运行副本并启动真实进程，验证 HTTP/IPv4 双用户会话并发探针、Cookie/CSRF、原生自签 HTTPS、IPv6、内置 Basic Auth、HTTPS 反向代理到 HTTP SillyTavern，以及明确绑定地址旁路的同端口凭证诱饵。临时配置、数据和目录联接会在正常完成或可处理错误后清理，不加载现用 server plugin，也不读取或修改现用数据。

## Draw Run API

Scene Planner 后台运行接口位于 `/v1/draw-runs`，包含创建、当前用户列表、单项查询、取消与接管 ACK。它与 `/v1/jobs` 经过同一个图片任务校验/创建 service，图片执行仍完全服从现有单用户串行队列。

`/status` 已发布 `draw-runs-v1` capability。NovelAI、SD WebUI 与 ComfyUI 的楼层配图在各自开启“小白盒后台任务”后，会把场景分析与批量出图一并提交到这些接口；缺少 capability 时明确要求更新后端，不会退回浏览器执行 Planner。

直接连接 OpenAI compatible、OpenAI Responses、Anthropic 或 Google 的 Agent 配置会由 Node 访问所填 Base URL；其中 `127.0.0.1` 指 SillyTavern 服务器本机。任务内凭证只保存在进程内存且不写入恢复 journal：Agent 凭证在 Planner 结束后释放；图片凭证会转交 child job，保留到该图片任务终态后释放。

## Agent Core Node 产物

后台 Draw Run 使用已提交的 `draw-runs/vendor/agent-core-node.cjs` 与 `draw-runs/vendor/draw-run-runtime.cjs`。前者包含 Agent Core 及 OpenAI、Anthropic、Google SDK，后者包含环境无关的 Scene Planner executor、三家图片 compiler 与确定性标识符。复制插件后无需也不允许在运行环境执行 `npm install`。实际进入两个 bundle 的所有第三方包及其许可证位于 `draw-runs/vendor/THIRD_PARTY_LICENSES.txt`。

仓库开发者在 Agent Core 或相关 SDK 升级后运行：

```sh
npm run build:agent-core:node
```

`npm run check:agent-core:node` 会先核对实际入包依赖与 `package-lock.json` 的锁定版本，再在不改文件的情况下重建并比对两个已提交产物，用于阻止源码、依赖锁文件与 bundle/许可证清单脱节。若依赖未附带 LICENSE/NOTICE/COPYING 文件，构建会提取 README 的 License 段；两处都没有许可证正文时直接失败。正式构建在同目录完成 staging，并以整个 `vendor` 目录为发布单元切换；失败时恢复上一份完整产物。

`npm run check:agent-core:node18` 使用固定 Node.js 18.20.8 隔离加载两个 bundle，创建七类 Adapter、调用一次 Draw Run compiler，并让打包后的 Google SDK 向本机模拟端点发出一次真实 `generateContent` 请求。当前 `@google/genai` 虽声明 Node.js 20，但本插件锁定并打包的调用路径支持 Node.js 18；升级 SDK 后必须通过此检查。
