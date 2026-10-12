# 小白酒馆 Phone OS 设计

Phone OS 是 Tavern 当前会话内的私人应用外壳，与普通小白 OS 的 Kernel、分区及 APP 互不替代。本文拥有系统壳、导航、通讯和生命周期规则；各 APP 拥有自己的领域与数据。

## 应用与结构

当前可用应用统一由 [App 注册表](../app-src/features/phone-os/phone-os-app-registry.ts)定义，不在文档维护第二份入口清单。银行、商店和不明物的业务分别见 [银行设计](./bank-app-target-design.md)、[商店设计](./shop-app-target-design.md)与 [不明物设计](./pet-app-target-design.md)。任务、钱包的边界见各自的 `shared/tasks/` 和 `shared/economy/`。

| 层 | 所有者 | 边界 |
| --- | --- | --- |
| 系统控制 | [OS Controller](../app-src/features/phone-os/useTavernPhoneOsController.ts) | 开关、路由栈、App 激活/释放、返回、Home、关闭 |
| 业务装配 | [Phone Controller](../app-src/features/phone-os/useTavernPhoneController.ts) | 注入各 App Controller 和定义，不把业务塞入 OS 导航 |
| 系统壳 | [phone-os 组件](../app-src/components/phone-os/TavernPhoneOsOverlay.vue) | 桌面、App 舞台、系统栏、导航、焦点和双端呈现 |
| App | `features/phone-os/apps/`、`components/phone-os/apps/` | 自己的交互、请求、显示与生命周期 |
| 领域 | `shared/` 下各功能目录 | 持久化、剧情锚定、事务、回滚及公开投影，不依赖 Vue 或 DOM |

注册类型唯一见 [phone-os-types.ts](../app-src/features/phone-os/phone-os-types.ts)。每个 App 提供 ID、根路由、图标、组件、排序和可选徽标/可用性/激活钩子。注册拒绝空 ID、非法根路由和重复 ID；系统桌面与舞台从同一组定义派生，不另设组件映射表。不可用 App 不显示，失效路由回到桌面。

## 导航与生命周期

- 首次打开从桌面开始；同一会话内收起再开可恢复仍有效的路由。
- 启动 App 建立“桌面 → App 根页”；App 内前进/替换由统一路由栈处理。
- Back 返回上一级，App 根页再返回到桌面；Home 直接回桌面；Close 收起手机。三者不是同一操作。
- Escape 按“App 内返回 → 桌面 → 收起”工作；系统关闭与 Home 有独立可发现、可聚焦的控件。
- 收起或换 App 触发所属 App 的释放钩子，不由 OS 统一取消领域工作；通讯生成继续，各 App 的临时请求按自己的契约处理。
- Tavern 会话切换收起手机并重置路由。已有通讯任务继续绑定提交时的会话，不迁到新会话；新会话不显示旧任务的等待状态。
- 系统不保存业务快照、模型配置副本或独立任务队列。

## 视觉与双端交互

设计方向是安静、私人、剧情内可信的随身设备，不仿现实手机品牌，不靠装饰性系统页面制造功能感。

- 桌面端为受 Tavern 可视区域约束的设备外壳；移动端为全屏系统，不出现“手机套手机”。
- 字体复用已有本地资产；系统样式由 `styles/phone-os/` 的 token、壳及 App 样式拥有。
- 不显示现实时间、假天气、假运营商或假通知。移动全屏尊重宿主设备状态栏与安全区，不重绘假电量与信号。
- 桌面遮罩、设备关闭及系统关闭均有真实行为；触摸目标至少 44px，关键发送操作宜为 48px。
- 软键盘使用 viewport helper 与 `visualViewport`；顶部/底部遵守安全区，输入框和发送按钮保持可见，消息区只滚动自身。
- 图标按钮有准确的中文无障碍名称；打开时焦点进入系统，关闭返回入口。键盘可完成搜索、输入、发送、重试与导航。
- 动效表达方向与状态，不阻塞操作；支持 reduced motion，优先使用 transform/opacity。
- 颜色不是未读、失败或禁用的唯一表达；浅深主题、200% 缩放与小屏均须可操作。

## 信息 App

### 联系人与会话

联系人由 [人物档案投影](../app-src/features/phone-os/apps/messages/tavern-messages-contacts.ts)派生：只读取有效人物文件，排除 USER、当前角色主体与保留名称，并去重。没有可联系人物时说明来源，不保留测试线旧手动添加分支。

会话列表提供真实搜索输入，即时过滤联系人与已有消息；每行展示联系人、最后消息、发送/失败/未回复状态及真实未读。空态、清空、无结果和输入法组合状态应明确。

对话页拥有返回、消息列表、输入与发送。Enter 发送、Shift+Enter 换行，不在输入法组合时误发送；发送禁用原因可识别。阅读旧消息不因普通刷新强制跳到底部，发送和重试后保持可解释的阅读位置。

### 请求与失败

[Messages Controller](../app-src/features/phone-os/apps/messages/useTavernMessagesController.ts)捕获 session、联系人、线程、剧情和模型配置后提交。用户消息先落入通讯记录，再请求回复；收起不取消。旧失败消息重试移动到线程末尾，并重新锚定当前剧情，不覆盖后续消息。

silent、unavailable、failed 分开：前两者不伪造联系人回复气泡，失败提供明确重试入口。重复提交、并发请求、过期回复和身份变化通过通讯领域边界处理，不依赖按钮禁用作为最终保护。

### 多形态与剧情时间

- 渠道与形态分离：不保存或猜测微信、短信等渠道；消息形态为 text、voice、image。
- 文字、语音转写、图片描述是剧情事实；TTS 音频、生成图片与排队进度是可失败/重试的表现层。
- TTS 复用统一能力与全局互斥播放；停止、失败或停用不改已保存消息。
- 图片保存描述与等价生成提示，不向通讯数据库塞 base64。生成提示不得创造描述中没有的事实；RP 只注入描述。
- 列表、搜索、归档、分支、回滚和主 RP 时间线理解全部形态，不靠显示文本正则猜类型。
- 不把 createdAt/updatedAt 格式化成剧情时间；这些字段只负责排序与事务。没有可靠剧情时间时不显示，不注入现实时区或发送时间。
- 主剧情投影只表达实际信息互动和带形态标注的正文。私密知识、承诺不等于行动完成等规则归运行时协议，玩家名来自当前 Tavern USER。

## 状态、持久化与删除

通讯联系人、线程、消息与快照归 [communications.ts](../shared/communications.ts)和现有 [session-db.ts](../shared/session-db.ts)。通讯参与会话回滚、分支、角色档案备份恢复与会话删除；异常恢复后的未完成请求按领域恢复规则处理，不能永久悬挂。

开关、路由、搜索、焦点、滚动与消息草稿仅活在 Controller 生命周期。草稿按线程在内存隔离，切会话清空，不新增 IndexedDB 草稿表。未读由真实通讯状态派生：查看可见线程可标已读，收起/桌面/其他线程时新回复计未读；silent/unavailable 不产生回复型未读。

业务事务和所有权由各领域决定，不能把“Phone 按当前会话显示”等同于“所有 APP 都按会话保存”。尤其不明物是全局 Companion，数据边界遵守其独立设计。

删除单个 App：先按该领域策略处理长期数据，再删目录与注册定义，注销监听和生命周期钩子；系统壳不留下假图标或旧路由。删除整个 Phone OS 还须移除入口、系统组件与样式；不能仅卸 UI 就声称业务数据已清理。

## 性能与检查

系统关闭时不挂载完整 App DOM；App 舞台按当前定义按需挂载。viewport、resize 和滚动监听随释放清理；列表不得在每次渲染无界扫描全部线程。领域不依赖 UI，平台不直接读写各 App 表。

运行 `npm run test:tavern`、`npm run lint:tavern`和 `npm run build:tavern`。稳定契约重点为导航/焦点、软键盘、同会话重开、切会话隔离、重复发送、失败重试、未读、多形态、回滚与恢复、停用及 reduced motion。

浏览器、实体 WebView、模型回复和媒体供应商各自需要相应证据；自动测试与构建通过不证明这些环境的体验或质量。
