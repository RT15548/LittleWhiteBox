# LittleWhiteBox Server

小白盒统一后端。`image-jobs/` 与 `draw-runs/` 只管理任务，绘图业务从扩展内的签名执行包加载；Exa 继续由 `web/` 所有。只需安装一次，不需要给每个 App 单独安装后端。

开启小白X后台任务后，Scene Planner 与整批图片任务都在 Node 进程中执行；前端显示“提交后台”完成后，切后台、断网、刷新、WebView 冻结或关闭浏览器都不会暂停已创建的任务，重新打开后会自动接回。Exa 联网则是随当前调用结束的一次性请求，不进入绘图队列。

## 安装

1. 确认 SillyTavern 使用 Node.js 18 或更新版本。
2. 将本目录完整复制为 `SillyTavern/plugins/littlewhitebox-server/`。
3. 在 `config.yaml` 开启 `enableServerPlugins: true`，然后重启 SillyTavern。
4. 装过旧后端的用户先按下节迁移，不要让新旧目录并存。

## 升级

从未提供 `runtimeHostAbi` 的旧后台升级时，先完成并接回现有任务，再停止酒馆，用本目录完整替换 `SillyTavern/plugins/littlewhitebox-server/`，然后重启。以后普通绘图更新只需更新 LittleWhiteBox 扩展，不再复制后台目录或重启。聊天、图片和设置不迁移、不清理。

从 `littlewhitebox-image-jobs` 升级时：先等待任务完成并接回，停止酒馆，移除 `plugins/littlewhitebox-image-jobs/`（以及更早的 `littlewhitebox-nai/`），放入本目录，同步更新前端后重启。旧后端没有需要迁移的持久化任务数据；已落库的图片与聊天记录不删除。新前端只调用新插件 ID，不探测或回退旧接口。不能只更改旧目录名，也不能只更新前端。

分发版本与插件身份由 [manifest.json](./manifest.json) 定义。前端通过 `draw-work-cancellation-v1` 检查整组取消能力；Exa 对应 `exa-web-v1`。升级必须包含整个目录及打包产物，不分别安装功能补丁。

固定宿主只负责验签加载、用户隔离、唯一队列、幂等、取消和结果生命周期。规划器、字段校验、模型 SDK、三家供应商协议与工具沙盒在扩展的 `dist/server/` 内一起更新。新任务绑定新包；排队、规划、出图和待接回任务保留原包，不重发请求。宿主安全修复与宿主 ABI 改变不属于普通绘图功能更新。

升级重启前，请先等待正在运行的任务完成并接回；后台任务及取消回执保存在进程内存中，重启不会续跑。

Scene Planner 支持免密反代，Agent API Key 可以留空；图片生成供应商的凭据要求不变。取消执行与恢复的准确边界见 [整组取消契约](../../docs/image-backend-batch-jobs.md#整组取消)。

角色 `type` 是提示词文本，不限定语言或固定枚举；空字符串、`null` 或省略也不因此拒绝出图。除表示未提供的 `null` 外，非文本值仍属于结构错误。角色库匹配与外貌注入不变；浏览器接回时，自动学习跳过没有提供类型的新角色，不把未知类型补成 `girl`。

执行层允许 `action` 省略或留空，可选文本的 `null` 按未提供处理；图片编号由数组顺序生成，忽略模型填写的 `index`。图片和角色的额外字段直接丢弃，不带入绘图参数。模型仍按前端提示词和 Tool Schema 填写；非空 `scene`、角色名、未知角色外貌、数量限制、插图点及坐标校验不变。

插件挂载在自己的命名空间：

```text
/api/plugins/littlewhitebox-server/
```

## Exa 联网

浏览器对 Exa 官方接口的搜索、正文提取经过当前酒馆的 `/v1/web/exa/search`、`/v1/web/exa/contents`；外部 CORS 不影响这条链路。Key 仍在前端 Agent API 设置填写，随请求发给用户自己的酒馆后端；后端不保存 Key、不记录请求正文、不自动重试、不切换供应商。超时、HTTP 状态和脱敏诊断返回原调用方，浏览器取消会中止上游请求。Tavily 保持直连；显式配置的 Exa 自定义 Base URL 也保持直连，由所用反代负责 CORS。

联网接口受酒馆登录与 CSRF 保护，仅能调用固定 Exa 官方地址的两个操作，不接收任意目标地址、方法或转发头，不跟随重定向。请求体上限 32 KiB，供应商响应上限 2 MiB，上游请求限时 30 秒。每次请求独立，不新增数据库、缓存或恢复记录。

联网协议与 HTTP 处理的源码在 `modules/agent-core/web/`，本包 `web/web-runtime.cjs` 由同一源码生成，随插件统一构建与验收，见[构建规则](../../docs/plugin-build.md)。删除联网功能时删除 `web/`、入口注册、对应前端路由与生成任务即可，不影响绘图任务。

## 图片保存与打开文件夹

绘图的“图片按日期分文件夹保存”与“打开文件夹”需要本插件：酒馆自带的 `/api/images/upload` 会去掉文件夹名里的 `/`，只能保存一级目录，浏览器本身也无法打开资源管理器。没有安装时，前端不调用这两个接口：开了“按日期分文件夹保存”的图片照常保存到默认的角色名文件夹并提示“按日期分文件夹保存未生效”，“打开文件夹”提示需要安装插件；其余功能不受影响。

| 方法 | 路径 | capability | 说明 |
|---|---|---|---|
| POST | `/v1/images/save` | `image-save-v1` | 请求体 `{ image(base64), format, filename, folder: [一级, 二级?] }`；写入当前用户的 `user/images/<folder>/`，返回 `{ ok, path }`，`path` 与上传接口同形（如 `/user/images/角色/2026_10_31/a.png`） |
| POST | `/v1/images/open-folder` | `open-folder-v1` | 在酒馆所在机器的文件管理器中打开用户图片根目录（`user/images`，不存在则先创建）；前端只用这种方式。请求体可选带 `folder: [一级, 二级?]` 打开其中的子文件夹（不存在则打开最近的上级），规则同上；返回 `{ ok, path, exact }` |

- 文件夹名逐级按酒馆 `sanitize-filename` 的规则清理（删除 `/  ? < > : * | "`、控制字符、结尾的点和空格，拒绝 Windows 保留名）；空、`.`、`..` 或超过两级一律 400，解析结果必须仍在用户图片目录内。文件名同样逐段清理，格式只接受 png / jpg / jpeg / webp / gif。
- 两条路由都要求登录的用户身份（`req.user`），受酒馆 CSRF 保护，不接收任意路径。打开文件夹只在请求来自本机（环回地址或本机网卡地址，且没有 `X-Forwarded-For` 等代理头）时执行，否则返回 403 `not_local`；页面提示无法直接打开。
- 打开文件夹用 `child_process.spawn` 传参数数组、不经 shell：Windows `explorer.exe`、macOS `open`、Linux `xdg-open`；系统找不到对应程序时返回 500 `open_failed`。
- 这两项随本目录的新版后台一起提供，前端按 capability 检查是否可用。安装或升级方法见前文，覆盖整个后台目录后重启酒馆；只更新扩展不会给已安装的后台增加文件系统能力。

## Provider 边界

- NovelAI：保留 `/v1/generate-image`、`/v2/generate-image`、`/v1/generate-image-stream`、`/v1/test`、`/v2/test` 的现有行为；异步任务在服务器读取 V5 MessagePack 流，只保留并交付最终 PNG。前台逐张后端发送仍由 `/v1/generate-image-stream` 原样转发流。
  Vibe 的手动编码随发送模式走浏览器或现有 `/v2/generate-image` 传输入口；请求外层的 `operation: "encode-vibe"` 由扩展执行包处理，返回编码而不是图片，不自动重试。省略 `operation` 保持原有出图行为，未知操作在请求供应商前拒绝。已安装支持签名执行包的后台后，Vibe 只需更新扩展，无需替换后台目录或重启酒馆；不在固定宿主新增供应商业务入口。
- SD WebUI：后端直接请求 `/sdapi/v1/txt2img`。取消会中止当前 HTTP 传输，但不会调用会误伤同一实例其他用户的全局 `/interrupt`。
- ComfyUI：开启后台批量任务后，由酒馆服务器完成 `/prompt`、`/history/:promptId`、`/view`；取消时只通过 `/queue` 删除本任务的 prompt，不调用全局 `/interrupt`。即使原连接模式选择浏览器直连，酒馆服务器也必须能够访问所填地址。关闭后台任务时仍保持原酒馆代理或浏览器直连链路。

## 异步任务 API

`GET /status` 声明 capability：

```text
v5-msgpack-stream
image-batch-jobs-v1
draw-work-cancellation-v1
novelai-v5-final-image-v1
draw-runs-v1
draw-run-runtime-v4
draw-run-planner-retry-v1
draw-run-planner-layout-v1
exa-web-v1
image-save-v1
open-folder-v1
```

这些 capability 保留给正式发布过的客户端。新客户端读取 `runtimeHostAbi`，在保存提交标记前调用 `POST /v1/runtime/prepare`，传入 `{ extensionId, runtimeId }`。新任务使用 `X-LWB-Extension` 与 `X-LWB-Runtime` 指定执行包，查询、取消和结果接回不依赖当前安装版本。包不完整、摘要或签名错误只拒绝新任务，不影响存量任务。

通用任务接口位于 `/v1/jobs`：

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/v1/jobs` | 创建 provider 批量任务 |
| GET | `/v1/jobs` | 列出当前登录用户的任务，供浏览器刷新后接回 |
| GET | `/v1/jobs/:jobId` | 查询任务和每项状态 |
| GET | `/v1/jobs/:jobId/results/:index` | 获取已归一化的完成图片 |
| DELETE | `/v1/jobs/:jobId/results/:index` | ACK 已落库结果并释放字节 |
| POST | `/v1/jobs/:jobId/cancel` | 取消当前和未执行项目，保留完成结果 |
| POST | `/v1/cancel` | 按明确的 jobIds/runIds 集合整体取消，并阻止保留期内迟到的同 ID 创建 |
| DELETE | `/v1/jobs/:jobId` | 删除终态任务 |

任务以当前登录用户 `req.user.profile.handle` 隔离。`requestId` 必填且按用户幂等；每批最多 20 项。任务只存在于内存，终态立即丢弃请求输入；前端在图片与 slot selection 都落库后才 ACK，全部交付后删除终态任务，异常退出时由一小时 TTL 兜底。浏览器会在独立 IndexedDB 中保存不含密钥和请求正文的 jobId/slotId 交付日志，用于刷新、断网或关闭页面后接回。默认上限为 200 个任务、每用户 20 个任务、64 MiB 排队输入和 512 MiB 结果字节。

## 后台 Agent 回环诊断

`POST /v1/draw-runs/probe` 验证服务器能否用当前请求的登录身份回环访问 SillyTavern。它覆盖 Cookie session、CSRF、内置 Basic Auth、IPv4/IPv6 与原生 HTTPS，不调用模型，也不会产生费用。响应只报告凭证是否通过验证，不回显凭证内容。

可从小白X目录运行真实部署矩阵（默认自动定位同一 SillyTavern 安装，也可把安装根目录作为参数传入）：

```sh
node server-plugin/littlewhitebox-server/tests/loopback-deployment-matrix.js
```

该脚本从 SillyTavern 1.18.0 源码建立隔离运行副本并启动真实进程，验证 HTTP/IPv4 双用户会话并发探针、Cookie/CSRF、原生自签 HTTPS、IPv6、内置 Basic Auth、HTTPS 反向代理到 HTTP SillyTavern，以及明确绑定地址旁路的同端口凭证诱饵。临时配置、数据和目录联接会在正常完成或可处理错误后清理，不加载现用 server plugin，也不读取或修改现用数据。

## Draw Run API

Scene Planner 后台运行接口位于 `/v1/draw-runs`，包含创建、当前用户列表、单项查询、取消与接管 ACK。它与 `/v1/jobs` 经过同一个图片任务校验/创建 service，图片执行仍完全服从现有单用户串行队列。

NovelAI、SD WebUI 与 ComfyUI 开启“小白X后台任务”后，将场景分析与批量出图一起提交。执行包加载失败会明确报错，不自动退回浏览器，也不删除模型采样参数来迁就旧校验器。

直接连接 OpenAI compatible、OpenAI Responses、Anthropic 或 Google 的 Agent 配置会由 Node 访问所填 Base URL；其中 `127.0.0.1` 指 SillyTavern 服务器本机。任务内凭证只保存在进程内存且不写入恢复 journal：Agent 凭证在 Planner 结束后释放；图片凭证会转交 child job，保留到该图片任务终态后释放。

## Agent Core Node 产物

扩展的 `dist/server/runtime-<摘要>.cjs` 包含 Agent Core、模型 SDK、规划器、图片编译及传输、QuickJS/WASM 工具沙盒；`runtime.json` 包含宿主 ABI、SHA-256 摘要和 Ed25519 签名，许可证位于同目录。宿主只读取当前用户个人／全局扩展目录中的包，不接收上传代码、任意路径或下载地址。验签后执行已读取的同一份字节，运行环境无需 `npm install`。

仓库开发者在 Agent Core 或相关 SDK 升级后运行：

```sh
npm run build
```

总构建核对实际入包依赖与 `package-lock.json` 的锁定版本；总验收重建并比对已提交产物，阻止源码、依赖锁文件与 bundle/许可证清单脱节。若依赖未附带 LICENSE/NOTICE/COPYING 文件，构建会提取 README 的 License 段；两处都没有许可证正文时直接失败。暂存、发布与失败恢复统一遵循[构建规则](../../docs/plugin-build.md)，本目标不独立发布。

总验收使用固定 Node.js 18.20.8 隔离加载执行包，创建七类 Adapter、调用 Draw Run compiler，并让打包后的 SDK 访问本机模拟端点。模拟端点用于验证协议，不替代真实供应商出图验收。

签名接入统一 `npm run build`；维护者私钥默认位于用户目录的 `.config/littlewhitebox/runtime-release-key.pem`，或由 `LWB_RUNTIME_SIGNING_KEY` 指定。私钥需由维护者备份，不能提交、分发或打印。`npm run check` 与 CI 只比对产物和验签，不读取私钥；没有匹配签名时不得发布改动的执行包。

## 后台自定义工具

浏览器只快照工具源码，后台沙盒初始化一次后执行。QuickJS/WASM 隔离脚本，Worker 负责取消和超时终止；工具可使用纯 JS 和公网 `fetch`，不能访问 Node、文件、DOM、酒馆 Cookie 或服务器内网。DNS 和每次重定向都检查地址，并固定连接到验证过的地址。这个限制不影响 SD、ComfyUI 等正常供应商的本机地址。

工具数量、调用次数、代码及结果长度沿用共享契约。单次定义限时 3 秒、调用限时 10 秒，整个工具运行时内存上限 32 MiB；公网请求和响应分别最多 4 MiB。工具错误返回规划流程，不会改由浏览器执行。工具执行包与其他绘图业务一起更新。
