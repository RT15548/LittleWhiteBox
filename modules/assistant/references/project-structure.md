# SillyTavern 与 LittleWhiteBox 项目结构参考

本文档用于快速建立目录心智，减少为找入口而盲目搜索。

你当前所在的是 SillyTavern 前端里的一个第三方插件：

- SillyTavern 根目录下有整站代码与运行配置
- `public/` 是前端静态资源根目录
- `public/scripts/` 是酒馆前端脚本主区域
- `public/scripts/extensions/` 是扩展系统目录
- `public/scripts/extensions/third-party/` 是第三方插件目录
- LittleWhiteBox 的磁盘物理位置是：`public/scripts/extensions/third-party/LittleWhiteBox/`
- **工具读取路径不带 `public/`**：LS / Glob / Grep / Read 里应写 `scripts/extensions/third-party/LittleWhiteBox/...`

## SillyTavern 结构心智

这不是完整文件清单，只是给你建立“酒馆本体 -> 前端 -> 扩展系统 -> 第三方插件 -> LittleWhiteBox”的结构树。

```text
SillyTavern/
├── config.yaml                         # 酒馆主配置；很多服务端开关在这里
├── data/                               # 酒馆运行数据、用户数据、配置存档等
├── plugins/                            # 其他插件/服务端插件生态（不是前端 third-party 扩展本身）
├── public/                             # 前端静态资源根目录
│   ├── index.html                      # 前端入口页面
│   ├── img/                            # 图片资源
│   ├── css/                            # 全局样式资源
│   └── scripts/                        # 前端脚本主区域
│       ├── script.js                   # 酒馆前端主入口之一；很多全局导出与运行时从这里来
│       ├── extensions/                 # 扩展系统
│       │   ├── assets/                 # 扩展资源
│       │   ├── shared/                 # 扩展共用逻辑
│       │   ├── built-in/               # 内建扩展
│       │   └── third-party/            # 第三方扩展；LittleWhiteBox 就在这里
│       ├── slash-commands/             # 斜杠命令前端相关逻辑
│       ├── openai.js / anthropic.js    # 各类模型渠道前端接线
│       ├── group-chats.js              # 群聊相关前端逻辑
│       ├── power-user.js               # 高级设置 / Power User 前端逻辑
│       └── ...                         # 其他前端模块
├── src/                                # 酒馆后端源码主目录
├── server.js                           # 服务端入口之一（不同版本可能有差异）
└── package.json                        # 依赖与脚本
```

## 怎么理解“插件”

- 在你当前语境里，LittleWhiteBox 是一个 SillyTavern 第三方前端插件
- 它不是独立网站，也不是外部 SaaS；它挂在酒馆扩展系统里运行

## 前端可读范围怎么理解

- 你当前能直接查证的重点范围，是 LittleWhiteBox 自身和 SillyTavern 前端脚本
- 工具索引使用站点根路径：`scripts/*`
- `public/scripts/*` 只是在解释磁盘物理目录；调用 LS / Glob / Grep / Read 时不要加 `public/`
- 这意味着你对酒馆前端扩展系统、UI 入口、前端脚本调用链有一定可读能力
- 但如果问题落到服务端实现、数据库、容器、Node 进程、后端路由，就不能假装自己已查证

## LittleWhiteBox 所在位置

- 磁盘物理位置：`public/scripts/extensions/third-party/LittleWhiteBox/`
- 工具读取路径：`scripts/extensions/third-party/LittleWhiteBox/`

## 完整目录树

```
LittleWhiteBox/
├── .editorconfig                           # 编辑器格式规范（缩进/换行/编码）
├── .eslintignore                           # ESLint 忽略配置
├── .eslintrc.cjs                           # ESLint 规则配置
├── .gitattributes                          # Git 文本/二进制属性配置
├── .gitignore                              # Git 忽略规则
├── index.js                                # 插件入口：模块初始化、设置绑定、开关启停、画图统一 facade
├── jsconfig.json                           # JS 项目路径与编辑器提示配置
├── manifest.json                           # 插件清单（名称/版本/入口等）
├── package.json                            # NPM 脚本与依赖声明
├── package-lock.json                       # 依赖锁定
├── README.md                               # 项目说明文档
├── settings.html                           # 主设置页（模块开关/UI入口）
├── style.css                               # 全局样式
├── vite.assistant.config.mjs               # 助手模块 Vite 构建配置
├── vite.ebook.config.mjs                   # 电纸书 App Vite 构建配置
│
├── scripts/                               # 构建与检查脚本
│   ├── build-assistant-file-manifest.mjs   # 助手文件清单构建脚本
│   ├── build-assistant-jsapi-manifest.mjs  # 助手 JS API 清单构建脚本
│   ├── build-assistant-jsapi-runtime.mjs   # 助手 JS API 运行时构建脚本
│   ├── check-garbled.js                    # 乱码检查脚本（lint 前置）
│   ├── check-relative-imports.mjs          # 相对路径导入检查
│   ├── story-summary-runtime-check.mjs     # summary runtime 验收脚本
│   ├── story-summary-replay-runner.mjs     # summary 回放 / 召回对比脚本
│   ├── story-summary-replay.config.example.json # 回放配置示例
│   └── story-summary-replay/               # summary 回放入口、shim 与样本
│       ├── entry.mjs
│       └── shims/
│
├── bridges/                               # 与酒馆运行时、上下文、世界书、iframe 的桥接层
│   ├── call-generate-service.js            # 生成服务调用桥接
│   ├── context-bridge.js                   # 上下文桥接
│   ├── worldbook-bridge.js                 # 世界书桥接
│   └── wrapper-iframe.js                   # iframe 包装桥接
│
├── core/                                  # 底层公共能力：常量、事件、存储、命令、路径、消息通信
│   ├── after-ai-gate.js                    # AI 回复收尾 gate：等宿主 UI 真正结束后再放行业务后处理
│   ├── constants.js                        # 常量与路径定义
│   ├── debug-core.js                       # 调试日志与注册器
│   ├── event-manager.js                    # 事件管理封装
│   ├── iframe-messaging.js                 # postMessage 安全通信封装
│   ├── server-storage.js                   # 服务端存储封装
│   ├── slash-command.js                    # 斜杠命令封装
│   ├── variable-path.js                    # 变量路径解析
│   └── wrapper-inline.js                   # iframe 内联注入工具
│
├── docs/                                  # 许可证与第三方声明
│   ├── COPYRIGHT                            # 版权声明
│   ├── LICENSE.md                           # 许可证
│   └── NOTICE                               # 第三方说明
│
├── libs/                                  # 项目直接带的第三方库与 wasm 依赖
│   ├── dexie.mjs                           # IndexedDB 工具库
│   ├── fflate.mjs                          # 压缩/解压工具
│   ├── js-yaml.mjs                         # YAML 解析库
│   ├── minisearch.mjs                      # 轻量检索库
│   ├── pixi.min.js                         # Pixi 渲染库
│   ├── tiny-segmenter.js                   # 轻量分词器
│   └── jieba-wasm/                        # 中文分词 wasm 依赖包
│       ├── jieba_rs_wasm.js                # jieba wasm JS 包装
│       ├── jieba_rs_wasm.d.ts              # 类型声明
│       ├── jieba_rs_wasm_bg.wasm           # wasm 二进制
│       ├── jieba_rs_wasm_bg.wasm.d.ts      # wasm 类型声明
│       ├── LICENSE                          # 上游许可证
│       ├── README.md                        # 上游说明
│       └── package.json                     # 上游包信息
│
├── shared/                                # 项目内跨模块共享逻辑
│   ├── common/                            # 通用共享工具
│   │   └── openai-url-utils.js            # OpenAI-compatible URL 规范化与拼接
│   └── host-llm/                          # 酒馆后端兼容层共享客户端
│       └── chat-completions/              # `/api/backends/chat-completions/*` 封装
│           ├── client.js                  # 请求封装与模型列表/生成接口
│           └── sse.js                     # 流式 SSE 解析
│
├── modules/                               # LittleWhiteBox 各业务功能模块主目录
│   ├── control-audio.js                    # 音频控制模块
│   ├── iframe-renderer.js                  # iframe 渲染与挂载
│   ├── immersive-mode.js                   # 沉浸模式
│   ├── message-preview.js                  # 消息预览
│   ├── streaming-generation.js             # 流式生成能力
│   │
│   ├── agent-core/                         # 多 Agent App 共用的无 UI 核心能力
│   │   ├── README.md                       # agent-core 边界：什么能共享、什么不能进 core
│   │   ├── config.js                       # 终端 Agent 模型配置、预设与默认值标准化
│   │   ├── provider-config.js              # provider 列表、label、reasoning、adapter factory
│   │   ├── ui/
│   │   │   ├── message-markdown.js         # 消息 Markdown 渲染
│   │   │   ├── settings-markup.js          # 多 Agent App 共用的 API 配置表单 markup
│   │   │   └── settings-panel.js           # 多 Agent App 共用的 API 配置表单逻辑
│   │   ├── current-plans.js                # `[Current plans]` 提示词前缀构造
│   │   ├── plan-ledger.js                  # `PlanCreate/Update/List/Get` 账本规则；具体 App 显式传 plansTable
│   │   ├── tavily-search.js                # Tavily 网页搜索工具
│   │   ├── runtime/
│   │   │   ├── delegate-runner.js          # `DelegateRun` 同步子任务执行器
│   │   │   ├── protocol.js                 # agent 协议层
│   │   │   └── streaming-messages.js       # 流式消息维护
│   │   ├── tools/                          # 无 App 作用域的通用工具原语
│   │   │   ├── apply-patch.js              # patch 语法解析与文本级应用
│   │   │   ├── apply-patch-execution.js    # patch 验证/执行骨架；具体文件作用域由调用方提供
│   │   │   └── text-file-types.js          # 可读文本扩展名判断
│   │   └── adapters/                       # OpenAI / Anthropic / Google / ST 后端 provider 适配器
│   │
│   ├── debug-panel/                       # 调试面板功能
│   │   ├── debug-panel.html                # 调试面板 UI
│   │   └── debug-panel.js                  # 调试面板逻辑
│   │
│   ├── ena-planner/                       # ENA 剧情规划器；发送前增强与规划 UI 都在这里
│   │   ├── ena-planner-presets.js          # 剧情规划预设
│   │   ├── ena-planner.css                 # 剧情规划样式
│   │   ├── ena-planner.html                # 剧情规划 UI
│   │   └── ena-planner.js                  # 剧情规划主逻辑（发送前拦截，用户输入增强）
│   │
│   ├── fourth-wall/                       # 四次元壁功能：消息增强、图像、语音、提示词
│   │   ├── fourth-wall.html                # 四次元壁 UI
│   │   ├── fourth-wall.js                  # 四次元壁主逻辑
│   │   ├── fw-image.js                     # 图像逻辑
│   │   ├── fw-message-enhancer.js          # 消息增强逻辑
│   │   ├── fw-prompt.js                    # 提示词构造
│   │   ├── fw-voice.js                     # 语音常量/指南
│   │   └── fw-voice-runtime.js             # 语音运行时（合成/播放互斥）
│   │
│   ├── ebook/                             # 小白电纸书 App：书架、书本入口、创作台、章节阅读器
│   │   ├── ebook.html                      # 电纸书 iframe 入口，加载 dist/ebook-app.js
│   │   ├── ebook.js                        # 宿主 overlay、iframe 消息分发、素材导入与画图桥接
│   │   ├── host/                           # 电纸书 host 侧辅助：Agent 配置转发、聊天/角色/总结/世界书素材导入
│   │   │   ├── assistant-config.js          # Agent 配置转发
│   │   │   └── import-materials.js          # 素材导入
│   │   ├── app-src/                        # 电纸书 iframe App 源码；main.js 只做装配入口
│   │   │   ├── main.js                     # 创建 hostBridge + ebookApp 并启动，不承载业务逻辑
│   │   │   ├── ebook-app.js                # App 生命周期装配：state、controller、runner、renderer
│   │   │   ├── book-controller.js          # 书籍/文件选择、保存、新建、素材导入、当前章节配图落盘
│   │   │   ├── conversation-store.js        # 会话存储
│   │   │   ├── history-compaction.js        # 历史压缩
│   │   │   ├── host-bridge.js              # iframe 与宿主消息桥、配置接收、host request/配图进度管理
│   │   │   ├── agent-runner.js             # 电纸书主 Agent 与只读 Delegate 工具循环
│   │   │   ├── renderer.js                 # 三栏 UI HTML 渲染、阅读器 `[ebook-image:slot]` 占位渲染
│   │   │   ├── ui-bindings.js              # DOM 事件绑定到 controller / agentRunner，并在阅读器中水合配图
│   │   │   ├── provider-config.js          # 复用小白助手模型配置并创建适配器
│   │   │   ├── prompts.js                  # 电纸书主 Agent / Delegate 提示词与快捷动作提示
│   │   │   ├── state.js                    # 电纸书 iframe 本地状态初始结构
│   │   │   ├── constants.js                # 电纸书 iframe/host source、rootId、host request 超时常量
│   │   │   ├── styles.js                   # 电纸书 iframe 样式注入
│   │   │   ├── text-metrics.js             # 写作字数、行数与估算 token 统计
│   │   │   └── text-utils.js               # iframe 文本转义与 JSON 安全工具
│   │   ├── shared/                         # 书籍 IndexedDB、book/... 路径校验、作品工具运行时
│   │   │   ├── book-templates.js           # 新书默认文件：章节、大纲、文风、角色、世界、状态追踪、审稿规则
│   │   │   ├── book-tools.js               # 作品工具 facade：文件工具、Plan、Delegate 路由
│   │   │   ├── book-file-tools.js          # LS/Glob/Grep/Read/Write/apply_patch/Move/Delete 实现
│   │   │   ├── tool-definitions.js         # 电纸书工具 schema 与工具调用摘要
│   │   │   ├── book-paths.js               # book/... 路径规范化与越界拒绝
│   │   │   └── ebook-db.js                 # LittleWhiteBox_Ebook IndexedDB 书籍、文件、Plan、会话消息表
│   │   ├── tests/                          # 电纸书作品工具与隔离测试
│   │   └── dist/                           # Vite 构建产物；提交时保留，lint 忽略
│   │
│   ├── draw/                              # AI 画图大模块：共享层 + Provider；统一图库也服务电纸书配图
│   │   ├── shared/                        # 跨 Provider 共享能力
│   │   │   ├── danbooru-local-db.js        # Danbooru 本地角色库加载与搜索
│   │   │   ├── data/                       # 跨 Provider 共用画图数据资源
│   │   │   │   └── danbooru-chars.dat      # Danbooru 角色数据
│   │   │   ├── draw-common.js              # 占位符、锚点、角色 Prompt、图片 DOM 渲染与错误分类
│   │   │   ├── draw-llm.js                 # 共享 LLM 调用封装
│   │   │   ├── draw-settings.js            # 共享 LLM/角色/世界书设置读写，不初始化 Provider 专属 Prompt
│   │   │   ├── gallery-cache.js            # 共用图库缓存；聊天 `[image:slot]` 与电纸书 `[ebook-image:slot]` 共用 previews
│   │   │   ├── scene-planner.js            # Provider 无关的 LLM 场景规划调用与解析
│   │   │   └── worldbook-processor.js      # 世界书上下文处理
│   │   └── providers/                     # 具体画图后端 Provider
│   │       ├── novelai/                   # NovelAI Provider
│   │       │   ├── TAG编写指南.md          # NovelAI 专属 TAG 指南
│   │       │   ├── cloud-presets.js        # NovelAI 云端预设
│   │       │   ├── floating-panel.js       # NovelAI 楼层/悬浮画图面板
│   │       │   ├── novel-draw.html         # NovelAI 设置 UI
│   │       │   ├── novel-draw.js           # NovelAI 生命周期、设置、楼层出图与文本源出图 `generateImagesFromText`
│   │       │   ├── novel-prompts.js        # NovelAI 提示词模板加载与默认配置
│   │       │   └── prompts/               # NovelAI 提示词模板
│   │       │       ├── output-format-legacy.md
│   │       │       ├── output-format.md
│   │       │       ├── top-system-pov.md
│   │       │       └── top-system.md
│   │       ├── sd-webui/                  # SD WebUI Provider
│   │       │   ├── SD_TAG编写指南.md       # SD 专属 TAG 指南
│   │       │   ├── floating-panel.js       # SD 楼层/悬浮画图面板
│   │       │   ├── prompts/               # SD 提示词模板
│   │       │   │   ├── output-format-legacy.md
│   │       │   │   ├── output-format.md
│   │       │   │   ├── top-system-pov.md
│   │       │   │   └── top-system.md
│   │       │   ├── sd-draw.html            # SD 设置面板 UI
│   │       │   ├── sd-draw.js              # SD 生命周期、设置、楼层出图与文本源出图 `generateImagesFromText`
│   │       │   └── sd-prompts.js           # SD 提示词模板加载与默认配置
│   │       └── comfyui/                   # ComfyUI Provider
│   │           ├── COMFY_TAG编写指南.md    # ComfyUI 专属 TAG 指南
│   │           ├── comfy-draw.html         # ComfyUI 设置面板 UI
│   │           ├── comfy-draw.js           # ComfyUI 生命周期、设置、楼层出图与文本源出图 `generateImagesFromText`
│   │           ├── comfy-prompts.js        # ComfyUI 提示词模板加载与默认配置
│   │           ├── floating-panel.js       # ComfyUI 楼层/悬浮画图面板
│   │           ├── prompts/               # ComfyUI 提示词模板
│   │           │   ├── output-format-legacy.md
│   │           │   ├── output-format.md
│   │           │   ├── top-system-pov.md
│   │           │   └── top-system.md
│   │           └── workflows/             # ComfyUI 默认工作流 JSON
│   │
│   ├── scheduled-tasks/                   # 定时任务与嵌入式任务功能
│   │   ├── embedded-tasks.html             # 内嵌任务 UI
│   │   ├── scheduled-tasks.html            # 定时任务 UI
│   │   └── scheduled-tasks.js              # 定时任务逻辑
│   │
│   ├── story-outline/                     # 故事大纲生成功能
│   │   ├── story-outline-prompt.js         # 大纲 Prompt
│   │   ├── story-outline.html              # 大纲 UI
│   │   └── story-outline.js                # 大纲逻辑
│   │
│   ├── story-summary/                     # 故事总结与向量记忆主模块
│   │   ├── story-summary.css               # 样式
│   │   ├── story-summary-a.css             # 额外样式（A版）
│   │   ├── story-summary.html              # iframe UI
│   │   ├── story-summary-ui.js             # UI 交互逻辑
│   │   ├── story-summary.js                # 主逻辑（入口/注入/通信）
│   │   ├── data/                          # summary 本地配置、DB 与存储层
│   │   │   ├── config.js                   # 配置存取
│   │   │   ├── db.js                       # DB schema
│   │   │   └── store.js                    # 总结数据存储
│   │   ├── generate/                      # summary 生成链：调度、LLM、Prompt
│   │   │   ├── generator.js                # 生成调度
│   │   │   ├── llm.js                      # LLM 调用
│   │   │   └── prompt.js                   # Prompt 注入/预算装配
│   │   └── vector/                        # 向量记忆系统：召回、存储、embedding、流水线
│   │       ├── llm/                       # 向量链里的 LLM / embedding / 重排服务
│   │       │   ├── atom-extraction.js      # L0 原子抽取
│   │       │   ├── llm-service.js          # LLM 服务封装
│   │       │   ├── reranker.js             # 重排器
│   │       │   └── siliconflow.js          # embedding API 封装
│   │       ├── pipeline/                  # 向量处理流水线与状态集成
│   │       │   ├── chunk-builder.js        # chunk 构建
│   │       │   └── state-integration.js    # state 集成
│   │       ├── retrieval/                 # 检索与召回逻辑
│   │       │   ├── diffusion.js            # 扩散召回
│   │       │   ├── entity-lexicon.js       # 实体词典
│   │       │   ├── lexical-index.js        # 词法索引
│   │       │   ├── metrics.js              # 召回指标
│   │       │   ├── query-builder.js        # 查询构造
│   │       │   └── recall.js               # 召回引擎
│   │       ├── storage/                   # 向量与状态存储
│   │       │   ├── chunk-store.js          # chunk 向量存储
│   │       │   ├── state-store.js          # state 向量存储
│   │       │   └── vector-io.js            # 向量导入导出
│   │       ├── runtime/                   # 召回运行时数据平面：worker / 主线程兜底 / RPC / 打分
│   │       │   ├── rpc.js                  # worker RPC 封装
│   │       │   ├── runtime.js              # Recall runtime 主入口与主线程兜底
│   │       │   ├── runtime.worker.js       # Recall runtime worker 数据平面
│   │       │   └── scoring.js              # L0/L1/L2 统一打分工具
│   │       └── utils/                     # 向量链公共工具：分词、过滤、worker、停用词
│   │           ├── embedder.js             # embedding 入口
│   │           ├── embedder.worker.js      # embedding worker
│   │           ├── stopwords-base.js       # 停用词基类
│   │           ├── stopwords-patch.js      # 停用词补丁
│   │           ├── text-filter.js          # 文本过滤
│   │           ├── tokenizer.js            # 分词器
│   │           └── stopwords-data/        # 多语言停用词数据
│   │               ├── LICENSE.stopwords-iso.txt # 停用词数据许可
│   │               ├── SOURCES.md          # 停用词数据来源
│   │               ├── stopwords-iso.en.txt# 英文停用词
│   │               ├── stopwords-iso.ja.txt# 日文停用词
│   │               └── stopwords-iso.zh.txt# 中文停用词
│   │
│   ├── tavern/                            # Tavern 面板模块：Vue + TypeScript + Vite 的酒馆运行/调试界面
│   │   ├── tavern.ts                       # Tavern 模块 TypeScript 入口
│   │   ├── tavern.js                       # Tavern 宿主入口 / 兼容入口
│   │   ├── tavern.html                     # Tavern iframe 页面壳
│   │   ├── env.d.ts                        # Tavern 前端环境类型声明
│   │   ├── app-src/                       # Tavern Vue 应用源码
│   │   │   ├── App.vue                     # Tavern 主 Vue 单文件组件
│   │   │   ├── manager-tool-display.ts     # manager 工具调用展示、流式工具草稿与轮次聚合
│   │   │   ├── map-display.ts              # 地图/空间状态展示辅助
│   │   │   ├── runtime/                   # Tavern manager / run-once / provider 等运行时接线
│   │   │   ├── components/                # Tavern Vue 子组件
│   │   │   │   ├── TavernMapPanel.vue      # 地图面板
│   │   │   │   └── chat/                  # 聊天页相关组件
│   │   │   └── styles/                    # Tavern app 样式分片
│   │   ├── host/                          # 与 SillyTavern 宿主环境桥接
│   │   │   ├── agent-config.js             # agent 配置解析与默认值
│   │   │   └── sillytavern-context.js      # SillyTavern 当前上下文读取/规整
│   │   ├── shared/                        # Tavern 前后端/运行时共享类型与数据逻辑
│   │   │   ├── session-db.ts               # Tavern 会话、manager 消息记录、工具调用持久化
│   │   │   ├── assistant-presets.ts        # assistant preset 定义与规整
│   │   │   ├── structured-state.ts         # 结构化状态模型
│   │   │   ├── map-state-*.ts              # 地图状态内容、操作与种子数据
│   │   │   └── message-assembler.ts        # Tavern 消息组装与协议消息转换
│   │   └── tests/                         # Tavern 模块测试（session-db、run-turn、map 等）
│   │
│   ├── template-editor/                   # 模板编辑器
│   │   ├── template-editor.html            # 模板编辑器 UI
│   │   └── template-editor.js              # 模板编辑器逻辑
│   │
│   ├── tts/                               # 语音合成与播放相关功能
│   │   ├── tts-api.js                      # TTS API 适配
│   │   ├── tts-auth-provider.js            # 鉴权通道
│   │   ├── tts-cache.js                    # 缓存
│   │   ├── tts-free-provider.js            # 免费通道
│   │   ├── tts-overlay.html                # TTS iframe 设置页
│   │   ├── tts-panel.js                    # 浮动面板逻辑
│   │   ├── tts-player.js                   # 播放器
│   │   ├── tts-text.js                     # 文本处理
│   │   ├── tts-voices.js                   # 音色数据
│   │   ├── tts.js                          # TTS 主逻辑
│   │   ├── 声音复刻.png                     # 说明图
│   │   ├── 开通管理.png                     # 说明图
│   │   └── 获取ID和KEY.png                  # 说明图
│   │
│   ├── variables/                         # 变量系统 2.0 主入口；命令、面板、事件与状态引擎都在这里
│   │   ├── var-commands.js                 # 变量命令
│   │   ├── varevent-editor.js              # 变量事件编辑器
│   │   ├── variables-core.js               # 变量核心
│   │   ├── variables-panel.js              # 变量面板
│   │   └── state2/                        # 变量 2.0 状态执行引擎：解析、语义、守卫、执行
│   │       ├── executor.js                 # 执行器
│   │       ├── guard.js                    # 守卫
│   │       ├── index.js                    # 导出入口
│   │       ├── parser.js                   # 解析器
│   │       └── semantic.js                 # 语义处理
│   │
│   └── assistant/                         # 小白助手模块：宿主壳 + iframe app + 运行时 + 工具系统
│       ├── ARCHITECTURE.md                 # 助手架构约束与分层说明
│       ├── assistant.js                    # 宿主桥接、工具侧逻辑、模型通道与设置入口
│       ├── assistant-host-window.js        # 宿主窗口壳：拖拽、最小化、全屏、移动端行为
│       ├── assistant-overlay.html          # 助手页面壳
│       ├── assistant-file-manifest.json    # 文件清单（构建产物）
│       ├── st-jsapi-manifest.json          # 助手 JS API 清单（构建产物）
│       ├── app-src/                       # 助手前端源码
│       │   ├── attachments.js              # 附件规范化与消息附件辅助
│       │   ├── main.js                     # 助手前端装配入口：状态、session、context prefix、runtime 组装
│       │   ├── runtime.js                  # runtime 主循环：tool calling、审批、压缩、DelegateRun 接线
│       │   ├── slash-command-policy.js     # slash 命令规范化与审批策略
│       │   ├── styles.js                   # 全局 iframe 样式
│       │   ├── tooling.js                  # 工具定义、schema 与使用规则
│       │   ├── adapters/                  # 各模型 provider 适配层
│       │   │   ├── anthropic.js            # Anthropic 适配器
│       │   │   ├── google.js               # Google AI 适配器
│       │   │   ├── openai-compatible.js    # OpenAI-Compatible 适配器
│       │   │   ├── openai-responses.js     # OpenAI Responses 适配器
│       │   │   └── sillytavern-openai-compatible.js # 酒馆原生 OpenAI-Compatible 适配器
│       │   ├── context/                   # 当前上下文与临时注入相关
│       │   │   ├── current-context.js      # `[Current context]` 构造：工作区/外部编辑器焦点
│       │   │   └── current-plans.js        # `[Current plans]` 构造：当前会话未完成计划
│       │   ├── memory/                    # 记忆区文件建模与显示语义
│       │   │   └── memory-files.js         # skill / identity / worklog 文件规范化
│       │   ├── prompts/                   # 助手提示词模板
│       │   │   └── system-prompt.js        # 系统提示词与权限模式提示拼装
│       │   ├── runtime/                   # runtime 内部子模块
│       │   │   ├── approvals.js            # 审批请求与审批面板 promise 链
│       │   │   ├── context-stats.js        # token 估算与上下文统计
│       │   │   ├── delegate-runner.js      # `DelegateRun` 子任务执行器
│       │   │   ├── history-compaction.js   # 历史摘要与 context budget 压缩
│       │   │   ├── host-tool-requests.js   # host tool 请求、超时、中止、失败整形
│       │   │   └── streaming-messages.js   # 流式 assistant message 维护
│       │   ├── state/                     # 会话持久化与状态存储
│       │   │   ├── session-db.js           # shared/session-db.js 的前端 re-export
│       │   │   └── session-store.js        # 助手 session 持久化、恢复与清空后切 session
│       │   ├── ui/                        # 纯前端界面渲染层
│       │   │   ├── app-chrome.js           # 顶层 chrome、toolbar、上下文提示
│       │   │   ├── app-shell.js            # 顶层应用壳 markup
│       │   │   ├── chat-ui.js              # 聊天气泡、工具批次、审批块等 UI
│       │   │   └── settings-panel.js       # 迁移壳：re-export `modules/agent-core/ui/settings-panel.js`
│       │   └── workspace/                 # 本地工作区树、diff、编辑器与导入管理
│       │       ├── local-sources.js        # 工作区来源管理、导入与归档
│       │       ├── local-workspace-diff.js # 文本 diff 视图辅助
│       │       ├── local-workspace-tree.js # 工作区树构造与展开键
│       │       └── local-workspace-ui.js   # 工作区树 + viewer + 编辑器 UI
│       ├── dist/                          # 助手前端打包产物
│       │   └── assistant-app.js            # 构建产物（Vite 打包）
│       ├── runtime-src/                   # 助手 JS API 运行时代码生成源
│       │   └── jsapi-runtime.js            # JS API 分析 / 校验运行时源文件
│       ├── shared/                        # 助手模块内部共享：持久化 schema、workspace kernel、迁移壳
│       │   ├── apply-patch.js              # 迁移壳：re-export `modules/agent-core/tools/apply-patch.js`
│       │   ├── apply-patch-execution.js    # 迁移壳：re-export `modules/agent-core/tools/apply-patch-execution.js`
│       │   ├── config.js                   # 迁移壳：re-export `modules/agent-core/config.js`
│       │   ├── local-sources-tool-runtime.js # `local/` 工具运行时与 workspace 同步
│       │   ├── local-workspace-kernel.js   # workspace 文件树/移动/删除等核心逻辑
│       │   ├── lookup-scope.js             # project vs local 检索范围规则
│       │   ├── plan-ledger.js              # 迁移壳：re-export `modules/agent-core/plan-ledger.js`
│       │   ├── public-text-file-types.js   # 迁移壳：re-export `modules/agent-core/tools/text-file-types.js`
│       │   ├── session-db.js               # Dexie schema：sessions/messages/meta/plans
│       │   ├── workspace-mutation-policy.js # workspace 变更策略
│       │   └── workspace-protocol.js       # host/iframe workspace 消息协议
│       ├── tests/                         # 助手模块测试
│       │   └── *.test.js                   # workspace / tooling / adapter / jsapi / plan / delegate 相关测试
│       └── references/                    # 助手排查时优先读取的参考资料
│           ├── project-structure.md        # 项目结构参考（本文档）
│           ├── sillytavern-javascript-api-reference.md  # SillyTavern JS API 参考
│           └── stscript-reference.md                   # STscript 统一参考（语法 + 命令）
│
└── widgets/                               # 通用消息区小挂件
    ├── button-collapse.js                  # 按钮折叠
    └── message-toolbar.js                  # 消息工具栏
```

## 快速定位建议

### 小白助手架构速记

- `assistant.js` + `assistant-host-window.js`
  宿主壳。负责窗口、iframe、宿主消息桥接、工具派发和设置加载。
- `app-src/main.js` + `ui/*`
  iframe 应用装配层。负责 state、render、workspace 面板和上下文提示拼装。
- `app-src/state/session-store.js` + `shared/session-db.js`
  真实助手 session 持久化。清空对话时会切到新 `assistantSessionId`，计划账本也跟着切。
- `app-src/context/current-context.js` + `current-plans.js`
  提示词前缀构造层；`[Current context]` 属于助手工作区，`[Current plans]` 来自 `modules/agent-core/current-plans.js`。
- `modules/agent-core/plan-ledger.js`
  `PlanCreate / PlanUpdate / PlanList / PlanGet` 的统一账本规则；只管状态，不管执行。
- `app-src/runtime.js` + `modules/agent-core/runtime/delegate-runner.js`
  工具主循环与子任务执行层。`DelegateRun` 在 agent-core 中同步跑子会话，不是 host 普通工具。
- `modules/agent-core/adapters/*`
  provider 适配层。把统一 runtime 请求翻译成 OpenAI / Anthropic / Google / ST 后端等不同通道。

### 参考资料
- 问 STscript 语法、参数系统、转义规则、具体命令：看 `modules/assistant/references/stscript-reference.md`
- 问 SillyTavern 前端 API：看 `modules/assistant/references/sillytavern-javascript-api-reference.md`
- 问小白助手当前分层、session、`[Current context]` / `[Current plans]`、`Plan*` / `DelegateRun`：看 `modules/assistant/ARCHITECTURE.md`
