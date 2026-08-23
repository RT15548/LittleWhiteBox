# LittleWhiteBox Image Jobs

LittleWhiteBox 的可选 SillyTavern server plugin。它在 Node 进程中执行整批图片任务，因此浏览器切后台、短暂断网或 WebView 冻结只会影响前端进度和结果收取，不会暂停已创建的任务。

## 安装

1. 将本目录完整复制为 `SillyTavern/plugins/littlewhitebox-image-jobs/`。
2. 在 `config.yaml` 开启 `enableServerPlugins: true`，然后重启 SillyTavern。
3. 如果装过旧的 `SillyTavern/plugins/littlewhitebox-nai/`，建议一并删除。它是独立插件 ID，不会和本插件冲突，但小白盒已完全不再请求它。

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
