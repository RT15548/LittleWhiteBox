# LittleWhiteBox

SillyTavern 扩展插件 - 小白X

## 📁 目录结构

```
LittleWhiteBox/
├── manifest.json          # 插件配置清单
├── index.js               # 主入口文件
├── settings.html          # 设置页面模板
├── style.css              # 全局样式
│
├── modules/               # 功能模块目录
│   ├── streaming-generation.js     # 流式生成
│   ├── dynamic-prompt.js           # 动态提示词
│   ├── immersive-mode.js           # 沉浸模式
│   ├── message-preview.js          # 消息预览
│   ├── wallhaven-background.js     # 壁纸背景
│   ├── button-collapse.js          # 按钮折叠
│   ├── control-audio.js            # 音频控制
│   ├── script-assistant.js         # 脚本助手
│   │
│   ├── variables/                  # 变量系统
│   │   ├── variables-core.js
│   │   └── variables-panel.js
│   │
│   ├── template-editor/            # 模板编辑器
│   │   ├── template-editor.js
│   │   └── template-editor.html
│   │
│   ├── scheduled-tasks/            # 定时任务
│   │   ├── scheduled-tasks.js
│   │   ├── scheduled-tasks.html
│   │   └── embedded-tasks.html
│   │
│   ├── story-summary/              # 故事摘要
│   │   ├── story-summary.js
│   │   └── story-summary.html
│   │
│   └── story-outline/              # 故事大纲
│       ├── story-outline.js
│       ├── story-outline-prompt.js
│       └── story-outline.html
│
├── bridges/                        # 外部桥接模块
│   ├── worldbook-bridge.js         # 世界书桥接
│   ├── call-generate-service.js    # 生成服务调用
│   └── wrapper-iframe.js           # iframe 包装器
│
├── ui/                             # UI 模板
│   └── character-updater-menus.html
│
└── docs/                           # 文档
    ├── script-docs.md              # 脚本文档
    ├── LICENSE.md                  # 许可证
    ├── COPYRIGHT                   # 版权信息
    └── NOTICE                      # 声明
```


## 📄 许可证

详见 `docs/LICENSE.md`
