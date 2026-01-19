# LittleWhiteBox

## 📁 目录结构

```
LittleWhiteBox/
├── index.js                          # 入口：初始化/注册所有模块
├── manifest.json                     # 插件清单：版本/依赖/入口
├── settings.html                     # 主设置页：模块开关/UI
├── style.css                         # 全局样式
├── README.md                         # 说明文档
├── .eslintrc.cjs                     # ESLint 规则
├── .eslintignore                     # ESLint 忽略
├── .gitignore                        # Git 忽略
├── package.json                      # 开发依赖/脚本
├── package-lock.json                 # 依赖锁定
├── jsconfig.json                     # 编辑器提示
│
├── core/                             # 核心基础设施（不直接做功能UI）
│   ├── constants.js                  # 常量/路径
│   ├── event-manager.js              # 统一事件管理
│   ├── debug-core.js                 # 日志/缓存注册
│   ├── slash-command.js              # 斜杠命令封装
│   ├── variable-path.js              # 变量路径解析
│   ├── server-storage.js             # 服务器存储（防抖/重试）
│   ├── wrapper-inline.js             # iframe 内联脚本
│   └── iframe-messaging.js           # postMessage 封装与 origin 校验
│
├── widgets/                          # 通用UI组件（跨功能复用）
│   ├── message-toolbar.js            # 消息区工具条注册/管理
│   └── button-collapse.js            # 消息区按钮收纳
│
├── modules/                          # 功能模块（每个功能自带UI）
│   ├── control-audio.js              # 音频权限控制
│   ├── iframe-renderer.js            # iframe 渲染
│   ├── immersive-mode.js             # 沉浸模式
│   ├── message-preview.js            # 消息预览/拦截
│   ├── streaming-generation.js       # 生成相关功能（xbgenraw）
│   │
│   ├── debug-panel/                  # 调试面板
│   │   ├── debug-panel.js            # 悬浮窗控制
│   │   └── debug-panel.html          # UI
│   │
│   ├── fourth-wall/                  # 四次元壁
│   │   ├── fourth-wall.js            # 逻辑
│   │   ├── fourth-wall.html          # UI
│   │   ├── fw-image.js               # 图像交互
│   │   ├── fw-message-enhancer.js    # 消息增强
│   │   ├── fw-prompt.js              # 提示词编辑
│   │   └── fw-voice.js               # 语音展示
│   │
│   ├── novel-draw/                   # 画图
│   │   ├── novel-draw.js             # 主逻辑
│   │   ├── novel-draw.html           # UI
│   │   ├── llm-service.js            # LLM 分析
│   │   ├── floating-panel.js         # 悬浮面板
│   │   ├── gallery-cache.js          # 缓存
│   │   ├── image-live-effect.js      # Live 动效
│   │   ├── cloud-presets.js          # 云预设
│   │   └── TAG编写指南.md            # 文档
│   │
│   ├── tts/                          # TTS
│   │   ├── tts.js                    # 主逻辑
│   │   ├── tts-auth-provider.js      # 鉴权
│   │   ├── tts-free-provider.js      # 试用
│   │   ├── tts-api.js                # API
│   │   ├── tts-text.js               # 文本处理
│   │   ├── tts-player.js             # 播放器
│   │   ├── tts-panel.js              # 气泡UI
│   │   ├── tts-cache.js              # 缓存
│   │   ├── tts-overlay.html          # 设置UI
│   │   ├── tts-voices.js             # 音色数据
│   │   ├── 开通管理.png              # 说明图
│   │   ├── 获取ID和KEY.png           # 说明图
│   │   └── 声音复刻.png              # 说明图
│   │
│   ├── scheduled-tasks/              # 定时任务
│   │   ├── scheduled-tasks.js        # 调度
│   │   ├── scheduled-tasks.html      # UI
│   │   └── embedded-tasks.html       # 嵌入UI
│   │
│   ├── template-editor/              # 模板编辑器
│   │   ├── template-editor.js        # 逻辑
│   │   └── template-editor.html      # UI
│   │
│   ├── story-outline/                # 故事大纲
│   │   ├── story-outline.js          # 逻辑
│   │   ├── story-outline.html        # UI
│   │   └── story-outline-prompt.js   # 提示词
│   │
│   ├── story-summary/                # 剧情总结
│   │   ├── story-summary.js          # 逻辑
│   │   ├── story-summary.html        # UI
│   │   └── llm-service.js            # LLM 服务
│   │
│   └── variables/                    # 变量系统
│       ├── var-commands.js           # 命令
│       ├── varevent-editor.js        # 编辑器
│       ├── variables-core.js         # 核心
│       └── variables-panel.js        # 面板
│
├── bridges/                          # 外部服务桥接
│   ├── call-generate-service.js      # ST 生成服务
│   ├── worldbook-bridge.js           # 世界书桥接
│   └── wrapper-iframe.js             # iframe 客户端脚本
│
├── libs/                             # 第三方库
│   └── pixi.min.js                   # PixiJS
│
└── docs/                             # 许可/声明
    ├── COPYRIGHT
    ├── LICENSE.md
    └── NOTICE

node_modules/                         # 本地依赖（不提交）
```

## 📄 许可证

详见 `docs/LICENSE.md`