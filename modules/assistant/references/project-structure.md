# SillyTavern 与 LittleWhiteBox 项目结构参考

本文档用于快速建立目录心智，减少为找入口而盲目搜索。

你当前所在的是 SillyTavern 前端里的一个第三方插件：

- SillyTavern 根目录下有整站代码与运行配置
- `public/` 是前端静态资源根目录
- `public/scripts/` 是酒馆前端脚本主区域
- `public/scripts/extensions/` 是扩展系统目录
- `public/scripts/extensions/third-party/` 是第三方插件目录
- LittleWhiteBox 位于：`public/scripts/extensions/third-party/LittleWhiteBox/`

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

- 你当前能直接查证的重点范围，是 LittleWhiteBox 自身和 SillyTavern 的 `public/scripts/*`
- 这意味着你对酒馆前端扩展系统、UI 入口、前端脚本调用链有一定可读能力
- 但如果问题落到服务端实现、数据库、容器、Node 进程、后端路由，就不能假装自己已查证

## LittleWhiteBox 所在位置

LittleWhiteBox 位于：`public/scripts/extensions/third-party/LittleWhiteBox/`

## 完整目录树

```
LittleWhiteBox/
├── .editorconfig                           # 编辑器格式规范（缩进/换行/编码）
├── .eslintignore                           # ESLint 忽略配置
├── .eslintrc.cjs                           # ESLint 规则配置
├── .gitattributes                          # Git 文本/二进制属性配置
├── .gitignore                              # Git 忽略规则
├── index.js                                # 插件入口：模块初始化、设置绑定、开关启停
├── jsconfig.json                           # JS 项目路径与编辑器提示配置
├── manifest.json                           # 插件清单（名称/版本/入口等）
├── package.json                            # NPM 脚本与依赖声明
├── package-lock.json                       # 依赖锁定
├── README.md                               # 项目说明文档
├── settings.html                           # 主设置页（模块开关/UI入口）
├── style.css                               # 全局样式
├── vite.assistant.config.mjs               # 助手模块 Vite 构建配置
│
├── scripts/                               # 构建与检查脚本
│   ├── build-assistant-file-manifest.mjs   # 助手文件清单构建脚本
│   ├── build-assistant-jsapi-manifest.mjs  # 助手 JS API 清单构建脚本
│   ├── build-assistant-jsapi-runtime.mjs   # 助手 JS API 运行时构建脚本
│   ├── check-garbled.js                    # 乱码检查脚本（lint 前置）
│   ├── story-summary-runtime-check.mjs     # summary runtime 验收脚本
│   ├── story-summary-replay-runner.mjs     # summary 回放 / 召回对比脚本
│   ├── story-summary-replay.config.example.json # 回放配置示例
│   └── story-summary-replay/               # summary 回放所需入口、shim 与样本辅助
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
│   ├── novel-draw/                        # 小说/楼层绘图能力主模块
│   │   ├── TAG编写指南.md                  # TAG 指南
│   │   ├── cloud-presets.js                # 云端预设
│   │   ├── danbooru-local-db.js            # Danbooru 本地数据库
│   │   ├── floating-panel.js               # 浮动面板
│   │   ├── gallery-cache.js                # 图库缓存
│   │   ├── image-live-effect.js            # 动效
│   │   ├── llm-service.js                  # LLM 服务
│   │   ├── novel-draw.html                 # 画图 UI
│   │   ├── novel-draw.js                   # 画图主逻辑
│   │   ├── worldbook-processor.js          # 世界书处理器
│   │   ├── data/                          # 画图功能本地数据资源
│   │   │   └── danbooru-chars.dat          # Danbooru 角色数据
│   │   └── prompts/                       # 画图相关提示词模板
│   │       ├── output-format-legacy.md     # 旧版输出格式
│   │       ├── output-format.md            # 输出格式
│   │       ├── top-system-pov.md           # 顶层系统 POV
│   │       └── top-system.md               # 顶层系统
│   │
│   ├── sd-draw/                           # SD WebUI 画图 Provider 模块
│   │   ├── floating-panel.js               # SD 楼层/悬浮画图面板
│   │   ├── sd-draw.html                    # SD 设置面板 UI
│   │   └── sd-draw.js                      # SD Provider 生命周期、设置和出图逻辑
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
│       │   ├── main.js                     # 助手前端装配入口：状态、渲染、runtime 组装
│       │   ├── runtime.js                  # runtime 对外装配入口与主循环
│       │   ├── slash-command-policy.js     # slash 命令规范化与审批策略
│       │   ├── styles.js                   # 全局 iframe 样式
│       │   ├── tooling.js                  # 工具定义、schema 与使用规则
│       │   ├── adapters/                  # 各模型 provider 适配层
│       │   │   ├── anthropic.js            # Anthropic 适配器
│       │   │   ├── google.js               # Google AI 适配器
│       │   │   ├── openai-compatible.js    # OpenAI-Compatible 适配器
│       │   │   ├── openai-responses.js     # OpenAI Responses 适配器
│       │   │   └── sillytavern-openai-compatible.js # 酒馆原生 OpenAI-Compatible 适配器
│       │   ├── context/                   # IDE/外部编辑器/上下文注入相关
│       │   │   └── ide-context.js          # IDE 背景文本与上下文构造
│       │   ├── memory/                    # 记忆区文件建模与显示语义
│       │   │   └── memory-files.js         # skill / identity / worklog 文件规范化
│       │   ├── prompts/                   # 助手提示词模板
│       │   │   └── system-prompt.js        # 系统提示词与权限模式提示拼装
│       │   ├── runtime/                   # runtime 内部子模块
│       │   │   ├── approvals.js            # 审批请求与审批面板 promise 链
│       │   │   ├── context-stats.js        # token 估算与上下文统计
│       │   │   ├── history-compaction.js   # 历史摘要与 context budget 压缩
│       │   │   ├── host-tool-requests.js   # host tool 请求、超时、中止、失败整形
│       │   │   └── streaming-messages.js   # 流式 assistant message 维护
│       │   ├── state/                     # 会话持久化与状态存储
│       │   │   ├── session-db.js           # IndexedDB schema
│       │   │   └── session-store.js        # 会话持久化与恢复
│       │   ├── ui/                        # 纯前端界面渲染层
│       │   │   ├── app-chrome.js           # 顶层 chrome、toolbar、上下文提示
│       │   │   ├── app-shell.js            # 顶层应用壳 markup
│       │   │   ├── chat-ui.js              # 聊天气泡、工具批次、审批块等 UI
│       │   │   └── settings-panel.js       # 设置面板 UI 与配置同步
│       │   └── workspace/                 # 本地工作区树、diff、编辑器与导入管理
│       │       ├── local-sources.js        # 工作区来源管理、导入与归档
│       │       ├── local-workspace-diff.js # 文本 diff 视图辅助
│       │       ├── local-workspace-tree.js # 工作区树构造与展开键
│       │       └── local-workspace-ui.js   # 工作区树 + viewer + 编辑器 UI
│       ├── dist/                          # 助手前端打包产物
│       │   └── assistant-app.js            # 构建产物（Vite 打包）
│       ├── runtime-src/                   # 助手 JS API 运行时代码生成源
│       │   └── jsapi-runtime.js            # JS API 分析 / 校验运行时源文件
│       ├── shared/                        # 助手模块内部共享配置与标准化逻辑
│       │   └── config.js                   # 助手配置标准化、预设与默认值
│       ├── tests/                         # 助手模块测试
│       │   └── *.test.js                   # workspace / tooling / adapter / jsapi 相关测试
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

### 参考资料
- 问 STscript 语法、参数系统、转义规则、具体命令：看 `modules/assistant/references/stscript-reference.md`
- 问 SillyTavern 前端 API：看 `modules/assistant/references/sillytavern-javascript-api-reference.md`
