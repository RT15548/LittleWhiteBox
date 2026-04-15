# 小白助手 代码架构与执行文档

## 文档目标

定义“小白助手”的代码结构、依赖策略、消息流、工具桥、构建流程与实施步骤。

本文件只讨论代码与执行，不讨论产品定位。

## 当前状态

- 状态: 已实现 V1 原型
- 当前实现阶段: V1 前端版
- 当前实现补充:
  - iframe 会话已持久化到 `localStorage`
  - tool loop 已支持 `AbortController` 中止
  - 宿主侧文件内容缓存已改为 LRU 限制
  - 搜索工具已改为小批量并发读取

## 硬约束

### 1. 官方 SDK 优先

模型接入使用官方 SDK：

- `openai`
- `@anthropic-ai/sdk`
- `@google/genai`

禁止为这三家自行手搓协议层。

### 2. 不把整个插件改造成大工程

小白 X 主体仍保持当前前端扩展结构。

仅“小白助手子应用”引入独立、轻量的构建层。

### 3. 不新增隐蔽魔法

所有关键路径都必须有明确文件落点与清晰职责，避免未来无法追踪。

### 4. 写权限收紧

V1 只允许写工作区文档，不允许写代码。

## V1 架构总览

V1 分为三层：

### A. 宿主层

运行在 LittleWhiteBox 主页面上下文中。

职责:

- 打开/关闭助手面板
- 持久化助手设置
- 提供工具实现
- 负责与酒馆现有 API 交互
- 负责受控写入工作区文档

### B. 助手子应用层

运行在 iframe 内。

职责:

- 渲染聊天 UI
- 管理会话状态
- 通过官方 SDK 发起模型请求
- 执行 tool loop
- 调用宿主工具桥
- 将历史会话持久化到浏览器存储
- 显示当前轮数、工具状态与用户提示

### C. 构建层

仅服务于助手子应用。

职责:

- 打包 iframe 内代码
- 打包官方 SDK 依赖
- 生成助手文件索引清单

## 目录规划

### 宿主代码

- `modules/assistant/assistant.js`
- `modules/assistant/assistant-overlay.html`

### 子应用源码

- `modules/assistant/app-src/main.js`
- `modules/assistant/app-src/adapters/`

当前 V1 为了先把功能跑通，未额外拆 `core/` 与 `ui/` 子目录，后续若复杂度继续上涨再细分。

### 构建产物

- `modules/assistant/dist/assistant-app.js`

### 生成文件

- `modules/assistant/assistant-file-manifest.json`

### 构建脚本

- `scripts/build-assistant-file-manifest.mjs`
- `vite.assistant.config.mjs`

## 入口与初始化

在主扩展中新增模块:

- `assistant.enabled`
- `window.xiaobaixAssistant.openSettings()`

主设置页新增:

- 启用小白助手开关
- 打开助手按钮

当用户点击“打开助手”时：

1. 宿主创建 overlay
2. overlay 内加载 `assistant-overlay.html`
3. iframe 启动后向宿主发送 `xb-assistant:ready`
4. 宿主返回配置与运行时上下文

## 消息流

### 宿主 -> iframe

- `xb-assistant:config`
- `xb-assistant:config-saved`
- `xb-assistant:tool-result`
- `xb-assistant:tool-error`
- `xb-assistant:toast`

### iframe -> 宿主

- `xb-assistant:ready`
- `xb-assistant:close`
- `xb-assistant:save-config`
- `xb-assistant:tool-call`
- `xb-assistant:tool-abort`

## 模型适配层

助手子应用内提供统一接口：

- `chat(task): Promise<result>`

统一输入:

- `messages`
- `tools`
- `toolChoice`
- `temperature`
- `maxTokens`

统一输出:

- `text`
- `toolCalls`
- `finishReason`
- `model`
- `provider`

提供三个 adapter：

- OpenAI-compatible adapter
- Anthropic adapter
- Google AI adapter

优先复用 `Anima` 中已经验证过的适配思路，但按小白助手实际需要做裁剪，不把整个运行时照搬进来。

## Tool Loop

iframe 内负责 orchestrator。

流程:

1. 用户输入问题
2. 将问题与历史消息发给当前 provider adapter
3. 若模型返回 tool calls:
   - 将 tool call 通过 `postMessage` 发给宿主
   - 宿主执行工具
   - 将 tool result 回传
   - 追加 `assistant/tool` 消息后继续下一轮
4. 若模型返回最终文本:
   - 结束本轮
   - 渲染回复

保护:

- 最大 tool loop 轮数限制
- 单轮工具调用数量限制
- 工具异常显示为普通错误消息，不让整个界面挂死
- 当前轮可通过 `AbortController` 主动中止
- 工具调用超时或中止后，会回收到普通聊天提示

## V1 工具集

### `list_files`

输入:

- `query`
- `limit`

用途:

- 根据路径名/文件名筛出候选文件

数据来源:

- `assistant-file-manifest.json`

### `read_file`

输入:

- `path`

用途:

- 读取公开可访问文本文件内容

实现:

- 对 `public` / 扩展目录内的可读文件走前端 `fetch`

### `search_files`

输入:

- `query`
- `limit`

用途:

- 在可读文件内容中做关键词搜索

实现:

- 基于 manifest 列出的文件按需抓取并缓存
- 仅搜索文本型源码文件
- 排除大体积文件和 `.min.js`

### `write_workspace_note`

输入:

- `name`
- `content`

用途:

- 写入助手工作记录

实现:

- 走 `/api/files/upload`
- 文件名限定为助手工作区前缀

## 文件读取边界

V1 可读:

- 扩展目录中的源码与文本文件
- `public` 下的公开前端源码与文本文件

V1 不可读:

- `src/` 服务端源码
- 任意磁盘路径

原因:

- 当前第三方前端扩展的分发链路不适合强绑定 server plugin
- 服务端深读桥在产品上保留为 V2/V3，可单独推进

## 文件索引策略

V1 不引入复杂数据库与离线全文索引。

采用更容易维护的方案：

1. 构建时生成 `assistant-file-manifest.json`
2. manifest 只记录可读文本文件路径、类型和来源
3. 运行时按需读取文件内容
4. 在内存中做 LRU 缓存

排除项:

- `node_modules`
- `.git`
- 二进制资源
- 大型第三方库
- `.min.js`
- 过大文件

## 工作区策略

V1 工作区不做目录树系统。

统一写入 `user/files`，采用前缀化文件名：

- `LittleWhiteBox_Assistant_Worklog.md`
- `LittleWhiteBox_Assistant_Report_*.md`

这样可以避免当前 `upload` 接口不支持子目录的问题。

## 构建策略

新增单独构建命令：

- `build:assistant`

流程:

1. 生成文件 manifest
2. 使用 Vite 打包助手子应用

不改变小白 X 主体入口，不把整个插件迁移到 Vite。

## 执行步骤

### 第 1 步

补齐文档并固化 V1 边界。

### 第 2 步

在主扩展中接入助手模块与设置入口。

### 第 3 步

搭建 iframe overlay 与宿主消息桥。

### 第 4 步

引入官方 SDK 与子应用构建链。

### 第 5 步

落地三类 provider adapter。

### 第 6 步

落地工具桥：

- list_files
- read_file
- search_files
- write_workspace_note

### 第 7 步

联调 tool loop 与 UI。

### 第 8 步

补充构建产物、验证可运行。

## 风险与处理

### 风险 1: SDK 体积

处理:

- 子应用单独打包
- 不污染主扩展入口

### 风险 2: 搜索速度

处理:

- manifest 过滤掉噪声文件
- 运行时缓存文件内容
- 限制单次搜索范围与结果数

### 风险 3: 权限误解

处理:

- UI 明确标注“只读代码 / 仅可写工作记录”

### 风险 4: 后续难维护

处理:

- 目录职责单一
- host/app/build 三层明确
- 所有消息类型显式命名

## 完成定义

满足以下条件即视为 V1 完成:

- 设置页可打开助手
- 助手 iframe 子应用可加载
- 三类 provider 至少各完成一条成功请求链路
- tool loop 可正常执行
- 可列文件、读文件、搜文件、写工作记录
- 文档与实际实现一致

## 当前验证状态

- 已完成: `npm run lint`
- 已完成: `npm run build:assistant`
- 未完成: 酒馆内人工点开助手并走一轮真实提问
- 已完成: 会话持久化/终止/tool 状态 的前端链路联通

## 实施进度

- [x] 架构方向确定
- [x] 依赖策略确定
- [x] 目录规划确定
- [x] 宿主模块接入
- [x] 助手 iframe 接入
- [x] 官方 SDK 接入
- [x] Provider adapters 接入
- [x] 工具桥接入
- [x] manifest 生成接入
- [x] 构建链接入
- [x] 会话持久化
- [x] tool loop 终止控制
- [x] 工具状态可见化
- [x] LRU 缓存与搜索并发优化
- [ ] 运行时手工联调与剩余体验调优
