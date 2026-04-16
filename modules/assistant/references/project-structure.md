# LittleWhiteBox 项目结构参考

本文档用于快速建立目录心智，减少为找入口而盲目搜索。

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
├── scripts/
│   ├── build-assistant-file-manifest.mjs   # 助手文件清单构建脚本
│   └── check-garbled.js                    # 乱码检查脚本（lint 前置）
│
├── bridges/
│   ├── call-generate-service.js            # 生成服务调用桥接
│   ├── context-bridge.js                   # 上下文桥接
│   ├── worldbook-bridge.js                 # 世界书桥接
│   └── wrapper-iframe.js                   # iframe 包装桥接
│
├── core/
│   ├── constants.js                        # 常量与路径定义
│   ├── debug-core.js                       # 调试日志与注册器
│   ├── event-manager.js                    # 事件管理封装
│   ├── iframe-messaging.js                 # postMessage 安全通信封装
│   ├── server-storage.js                   # 服务端存储封装
│   ├── slash-command.js                    # 斜杠命令封装
│   ├── variable-path.js                    # 变量路径解析
│   └── wrapper-inline.js                   # iframe 内联注入工具
│
├── docs/
│   ├── COPYRIGHT                            # 版权声明
│   ├── LICENSE.md                           # 许可证
│   └── NOTICE                               # 第三方说明
│
├── libs/
│   ├── dexie.mjs                           # IndexedDB 工具库
│   ├── fflate.mjs                          # 压缩/解压工具
│   ├── js-yaml.mjs                         # YAML 解析库
│   ├── minisearch.mjs                      # 轻量检索库
│   ├── pixi.min.js                         # Pixi 渲染库
│   ├── tiny-segmenter.js                   # 轻量分词器
│   └── jieba-wasm/
│       ├── jieba_rs_wasm.js                # jieba wasm JS 包装
│       ├── jieba_rs_wasm.d.ts              # 类型声明
│       ├── jieba_rs_wasm_bg.wasm           # wasm 二进制
│       ├── jieba_rs_wasm_bg.wasm.d.ts      # wasm 类型声明
│       ├── LICENSE                          # 上游许可证
│       ├── README.md                        # 上游说明
│       └── package.json                     # 上游包信息
│
├── modules/
│   ├── control-audio.js                    # 音频控制模块
│   ├── iframe-renderer.js                  # iframe 渲染与挂载
│   ├── immersive-mode.js                   # 沉浸模式
│   ├── message-preview.js                  # 消息预览
│   ├── openai-url-utils.js                 # OpenAI URL 工具
│   ├── streaming-generation.js             # 流式生成能力
│   │
│   ├── debug-panel/
│   │   ├── debug-panel.html                # 调试面板 UI
│   │   └── debug-panel.js                  # 调试面板逻辑
│   │
│   ├── ena-planner/
│   │   ├── ena-planner-presets.js          # 剧情规划预设
│   │   ├── ena-planner.css                 # 剧情规划样式
│   │   ├── ena-planner.html                # 剧情规划 UI
│   │   └── ena-planner.js                  # 剧情规划主逻辑（发送前拦截，用户输入增强）
│   │
│   ├── fourth-wall/
│   │   ├── fourth-wall.html                # 四次元壁 UI
│   │   ├── fourth-wall.js                  # 四次元壁主逻辑
│   │   ├── fw-image.js                     # 图像逻辑
│   │   ├── fw-message-enhancer.js          # 消息增强逻辑
│   │   ├── fw-prompt.js                    # 提示词构造
│   │   ├── fw-voice.js                     # 语音常量/指南
│   │   └── fw-voice-runtime.js             # 语音运行时（合成/播放互斥）
│   │
│   ├── novel-draw/
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
│   │   ├── data/
│   │   │   └── danbooru-chars.dat          # Danbooru 角色数据
│   │   └── prompts/
│   │       ├── output-format-legacy.md     # 旧版输出格式
│   │       ├── output-format.md            # 输出格式
│   │       ├── top-system-pov.md           # 顶层系统 POV
│   │       └── top-system.md               # 顶层系统
│   │
│   ├── scheduled-tasks/
│   │   ├── embedded-tasks.html             # 内嵌任务 UI
│   │   ├── scheduled-tasks.html            # 定时任务 UI
│   │   └── scheduled-tasks.js              # 定时任务逻辑
│   │
│   ├── story-outline/
│   │   ├── story-outline-prompt.js         # 大纲 Prompt
│   │   ├── story-outline.html              # 大纲 UI
│   │   └── story-outline.js                # 大纲逻辑
│   │
│   ├── story-summary/
│   │   ├── story-summary.css               # 样式
│   │   ├── story-summary-a.css             # 额外样式（A版）
│   │   ├── story-summary.html              # iframe UI
│   │   ├── story-summary-ui.js             # UI 交互逻辑
│   │   ├── story-summary.js                # 主逻辑（入口/注入/通信）
│   │   ├── data/
│   │   │   ├── config.js                   # 配置存取
│   │   │   ├── db.js                       # DB schema
│   │   │   └── store.js                    # 总结数据存储
│   │   ├── generate/
│   │   │   ├── generator.js                # 生成调度
│   │   │   ├── llm.js                      # LLM 调用
│   │   │   └── prompt.js                   # Prompt 注入/预算装配
│   │   └── vector/
│   │       ├── llm/
│   │       │   ├── atom-extraction.js      # L0 原子抽取
│   │       │   ├── llm-service.js          # LLM 服务封装
│   │       │   ├── reranker.js             # 重排器
│   │       │   └── siliconflow.js          # embedding API 封装
│   │       ├── pipeline/
│   │       │   ├── chunk-builder.js        # chunk 构建
│   │       │   └── state-integration.js    # state 集成
│   │       ├── retrieval/
│   │       │   ├── diffusion.js            # 扩散召回
│   │       │   ├── entity-lexicon.js       # 实体词典
│   │       │   ├── lexical-index.js        # 词法索引
│   │       │   ├── metrics.js              # 召回指标
│   │       │   ├── query-builder.js        # 查询构造
│   │       │   └── recall.js               # 召回引擎
│   │       ├── storage/
│   │       │   ├── chunk-store.js          # chunk 向量存储
│   │       │   ├── state-store.js          # state 向量存储
│   │       │   └── vector-io.js            # 向量导入导出
│   │       └── utils/
│   │           ├── embedder.js             # embedding 入口
│   │           ├── embedder.worker.js      # embedding worker
│   │           ├── stopwords-base.js       # 停用词基类
│   │           ├── stopwords-patch.js      # 停用词补丁
│   │           ├── text-filter.js          # 文本过滤
│   │           ├── tokenizer.js            # 分词器
│   │           └── stopwords-data/
│   │               ├── LICENSE.stopwords-iso.txt # 停用词数据许可
│   │               ├── SOURCES.md          # 停用词数据来源
│   │               ├── stopwords-iso.en.txt# 英文停用词
│   │               ├── stopwords-iso.ja.txt# 日文停用词
│   │               └── stopwords-iso.zh.txt# 中文停用词
│   │
│   ├── template-editor/
│   │   ├── template-editor.html            # 模板编辑器 UI
│   │   └── template-editor.js              # 模板编辑器逻辑
│   │
│   ├── tts/
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
│   ├── variables/
│   │   ├── var-commands.js                 # 变量命令
│   │   ├── varevent-editor.js              # 变量事件编辑器
│   │   ├── variables-core.js               # 变量核心
│   │   ├── variables-panel.js              # 变量面板
│   │   └── state2/
│   │       ├── executor.js                 # 执行器
│   │       ├── guard.js                    # 守卫
│   │       ├── index.js                    # 导出入口
│   │       ├── parser.js                   # 解析器
│   │       └── semantic.js                 # 语义处理
│   │
│   └── assistant/
│       ├── assistant.js                    # 宿主桥接与工具侧逻辑
│       ├── assistant-overlay.html          # 助手页面壳
│       ├── assistant-file-manifest.json    # 文件清单（构建产物）
│       ├── app-src/
│       │   ├── main.js                     # 助手前端主逻辑
│       │   └── adapters/
│       │       ├── anthropic.js            # Anthropic 适配器
│       │       ├── google.js               # Google AI 适配器
│       │       ├── openai-compatible.js    # OpenAI-Compatible 适配器
│       │       └── openai-responses.js     # OpenAI Responses 适配器
│       ├── dist/
│       │   └── assistant-app.js            # 构建产物（Vite 打包）
│       └── references/
│           ├── project-structure.md        # 项目结构参考（本文档）
│           ├── sillytavern-javascript-api-reference.md  # SillyTavern JS API 参考
│           └── stscript-language-reference.md           # STscript 语言参考
│
└── widgets/
    ├── button-collapse.js                  # 按钮折叠
    └── message-toolbar.js                  # 消息工具栏
```

## 快速定位建议

### 设置与入口
- 问设置项/按钮/开关/UI入口：先看 `settings.html` 和 `index.js`
- 问全局样式/通用外观/整体布局：先看 `style.css`

### 桥接与通信
- 问桥接/iframe 通信/宿主注入/存储同步：先看 `bridges/` 和 `core/`
- 问 postMessage 通信：看 `core/iframe-messaging.js`
- 问服务端存储：看 `core/server-storage.js`

### 剧情总结与向量
- 问剧情总结/向量化/召回/L0-L3/embedding/rerank：重点看 `modules/story-summary/`
- 问向量构建流程：看 `modules/story-summary/vector/pipeline/`
- 问召回与检索：看 `modules/story-summary/vector/retrieval/`
- 问 L0 原子抽取：看 `modules/story-summary/vector/llm/atom-extraction.js`
- 问分词/停用词/文本过滤：看 `modules/story-summary/vector/utils/`

### 其他功能模块
- 问语音/TTS：看 `modules/tts/`
- 问画图/图像生成：看 `modules/novel-draw/`
- 问变量系统：看 `modules/variables/`
- 问次元壁/四次元壁：看 `modules/fourth-wall/`
- 问剧情规划：看 `modules/ena-planner/`
- 问剧情大纲：看 `modules/story-outline/`
- 问定时任务：看 `modules/scheduled-tasks/`
- 问小白助手自身：看 `modules/assistant/`

### 面板与渲染
- 问某个面板渲染不了：先找对应模块目录，看该模块的 `html/css/js`，再看 `modules/iframe-renderer.js`、桥接层和样式

### 参考资料
- 问 STscript 语法：看 `modules/assistant/references/stscript-language-reference.md`
- 问 SillyTavern 前端 API：看 `modules/assistant/references/sillytavern-javascript-api-reference.md`
