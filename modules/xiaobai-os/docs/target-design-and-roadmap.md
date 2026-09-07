# 普通酒馆小白 OS：终态设计与开发路线

## 1. 产品定位

普通酒馆小白 OS 与小白酒馆 Phone OS 是两个独立产品。用户可以感知它们属于同一品牌，内部不能共享 Tavern DB、Session、Phone 消息、楼层语义、manager run、回滚协议或领域实现。

普通 OS 的宿主是 SillyTavern 当前聊天。APP 可以参考小白酒馆已经验证的产品行为，但必须按普通聊天、sidecar 存储和普通 OS Capability 重新实现。modules/tavern 下的运行时代码不在依赖图中。

底座终态以 [OS Kernel 终态设计](./os-kernel-target-design.md)为唯一事实来源；施工批次以 [OS Kernel 施工方案](./os-kernel-implementation-plan.md)为准。各 APP 文档只决定自己的领域和产品行为，不得另行定义根存储、跨域写入或生命周期。

## 2. 终态结构

    modules/xiaobai-os/
    ├─ index.ts                         唯一扩展入口
    ├─ kernel/                          分区事务、Capability、APP 生命周期
    ├─ storage/                         sidecar、聊天引用和宿主文件适配
    ├─ capabilities/
    │  ├─ economy/                      资金分区与事务能力
    │  ├─ agent/                        共享 Agent 配置与 Provider 会话
    │  └─ maintenance/                  User 接受轮和通用工具循环
    ├─ host/                            SillyTavern 生命周期、薄 bootstrap、frame
    ├─ shell/                           OS 外壳、静态图标目录、懒加载 APP route
    ├─ domains/<domain>/                纯领域规则与持久格式
    └─ apps/<app>/                      module、应用服务、Prompt、工具、Host、UI

核心层只提供业务无关能力。每个功能自带领域模型、分区 parser、应用服务、Prompt、工具和 UI；通过 Host APP catalog 与 Shell APP catalog 两个明确入口接入。

删除功能应接近：

    处理未结业务
    → 清对应 partition
    → 删 apps/<app> 和 domains/<domain>
    → 删 Host/Shell catalog 项
    → 删测试

不得留下兼容壳、空图标或通用核心中的业务分支。

## 3. 系统设置与 APP 入口

OS 有三类用户级设置：

1. SillyTavern 扩展设置页：OS 总开关与 Fourth Wall 用户偏好；
2. Map/Tasks APP：各自的「所有普通聊天自动维护」，默认关闭；
3. agent-core 共享配置：Provider、model、API key、temperature 等，供小白酒馆、Ebook、画图和普通 OS 共用。

OS 入口默认开启；仅在没有已保存的开关选择时使用此默认值，不覆盖用户关闭 OS 或正式线四次元壁的选择。地图／任务自动维护、世界新闻订阅和四次元壁自动旁白仍默认关闭，开启入口不等于开启这些功能。

共享 Agent 配置不进入 sidecar，也不复制到 OS settings。Agent API 是共享配置的系统 APP，不拥有另一份配置。

Map、Tasks 与银行一样是固定桌面 APP，不存在产品 enabled 字段或扩展页复选框。自动维护开关只决定接受轮是否产生 Agent 工作，不影响图标、前台功能或主 RP 的只读 Prompt。

Shell 静态保留所有已交付 APP 的图标和 descriptor。APP Host、依赖、分区或 UI chunk 失败时图标仍可进入本 APP 错误页；不能因失败从桌面消失。

## 4. 所有权与唯一事实来源

| 能力 | 所有者 | 唯一事实来源 |
| --- | --- | --- |
| 聊天引用与 sidecar 文件 | storage | xiaobaiOsRef、osId 与当前服务端 sidecar |
| 分区事务与 APP 状态 | kernel | 当前运行的 coordinator、registry 和 execution scope |
| 主生成是否进行中 | host/main-generation-runtime | SillyTavern generation 生命周期 |
| Agent 配置与供应商调用 | agent-core、Agent Capability | AssistantStorage/settings |
| 接受轮后台编排 | Maintenance Capability | 当前运行的 MESSAGE_SENT 捕获和 participant FIFO |
| 小白币 | Economy Capability、domains/economy | Economy 分区不可变流水 |
| 银行头寸 | Bank | Bank 分区事件链 |
| 赌局 | Game | Game 分区事件链和私有状态 |
| 商品库存与效果 | Shop | Shop 分区事件链 |
| 世界图册与场景地图 | Map | Map 分区规范 Atlas/Scene |
| 镜头外新闻与轻背景 | World | world 分区的订阅偏好、概况与当前新闻 |
| 正式任务 | Tasks | Tasks 分区事件链；资金仍以 Economy 为准 |
| 私人联系人和通讯历史 | Messages / 信息 APP | messages 分区；普通聊天只保存发生时点的楼层投影 |
| 四次元壁会话 | Fourth Wall | fourthWall 分区 sessions |

Kernel 不拥有“全局剧情状态”。Economy、Wallet、Bank、Game、Shop 不订阅剧情变化、不哈希消息、不进行剧情核对，也不因编辑、swipe 或删除消息而回滚。

## 5. 持久数据

### 5.1 用户级设置

    interface XiaobaiOsSettings {
        enabled: boolean;
        apps: {
            fourthWall: FourthWallGlobalSettings;
            map: { autoMaintenance: boolean };
            tasks: { autoMaintenance: boolean };
        };
    }

它继续使用 SillyTavern 扩展设置。总开关和各 APP 设置由各自 normalizer 补当前默认值；不建立 OS settings schema 版本机，不因新增 APP 重置用户开关。

### 5.2 聊天引用

    chat_metadata.extensions.LittleWhiteBox.xiaobaiOsRef
    = { formatVersion: 1, osId: string }

Metadata 不再保存 APP 业务。旧测试线路径 chat_metadata.extensions.LittleWhiteBox.xiaobaiOs 不读取、不迁移。

### 5.3 Sidecar

    LittleWhiteBox_OS_<osId>.json

    {
        formatVersion,
        osId,
        binding,
        revision,
        commitId,
        partitions
    }

Kernel 只严格解析通用 Envelope，把 partitions 视为 opaque JSON。分区所有者严格解析自己的当前 schema。某分区无效不得阻断无依赖 APP；Envelope 本身无效则是当前聊天的 OS 存储故障。

Agent 配置、运行队列、请求状态、页面路由、表单草稿、模型原始响应、Shop 在途 ticket 和 Map/Tasks staging 均不持久化。

## 6. 分支、重命名和删除

- 分支：根据 SillyTavern 的 main_chat 读取父引用和已确认 sidecar，生成新 osId 并复制 partitions；父子不共享可写文件；
- 重命名：保留 osId，只更新 binding；
- 角色重命名：不批量改 sidecar 文件名；
- 复制/导入撞 osId：若旧 binding 对应聊天仍存在，则克隆为新 osId；
- 删除：只在 sidecar 索引能唯一解析时删除；事件歧义时宁可保留孤儿，不误删；
- 索引损坏不影响通过当前聊天 xiaobaiOsRef 读取数据。

SillyTavern 没有 user files 枚举接口，因此孤儿清理是尽力维护能力，不承诺完整扫描。

## 7. APP 领域边界

### 四次元壁

每次用户明确发送请求时读取当时的普通聊天上下文。皮下会话属于 fourthWall 分区，不等于主聊天消息。它通过 Agent Capability 调用共享 Provider。

upstream 已上线的旧 fw 数据是唯一需要保留的聊天业务兼容对象，由 Fourth Wall 自己使用真实 fixture 一次导入 sidecar；测试线 OS 根不参与。

### 地图

Map 提供可探索的世界 Atlas 和地点 Scene：优先实现作者设计，合理补齐世界地理与当前场所的普通布局；人物位置与已发生事件必须有剧情证据。世界地图／当前场景可直接切换，打开、查看、缩放均为本地操作。主 RP 只获得角色扮演友好的 current_map Atlas 连续性资料，不暴露 Scene 实现字段。

完整契约见 [Map APP 终态设计](./map-app-target-design.md)。

### 世界

World 是以“世界窗口”呈现的镜头外见闻：本地远景开篇、按需展开的概况、同级新闻列表与独立正文页。订阅后随有效接受轮维护，取消保留内容，手动刷新独立于订阅。当前概况与新闻归 `world` 分区，模型通过 WorldRead / WorldEdit 更新；只将已确认概况与短摘要以 System @D4 提供给主剧情，背景开关独立。阅读不请求模型，历史分支只继承偏好。

任务、地图的既有素材包会附带已确认的世界新闻；通常完整，初始资料超预算时省略正文并说明，没有则省略，同轮已有则不重复。这里只共享资料，不自动转任务或强制扩图，无新增请求或设置。完整边界见 [世界 APP 设计](./world-app-target-design.md)，实现、验证及未验收项见 [施工记录](./world-app-implementation-plan.md)。信息联动、小白板迁移与 ENA 接入仍留后。

### 任务

Tasks 大厅刷新和候选人招募由用户明确触发；接取、发布、选人、撤回及 active 任务维护由确定性状态机收口。任务 Prompt 只投影最近更新的 active/recruiting，不注入终态历史。

任务分区与 Economy 分区由 Tasks Scoped transaction + Economy Capability 原子提交，Agent 不能直接改钱。完整契约见 [Tasks APP 终态设计](./tasks-app-target-design.md)。

### 信息

信息 APP 在独立 `messages`分区保存联系人、线程和完整通讯事实，通过共享 Agent 取得角色回复。同一连续时点跨联系人共用一个不可 swipe 的「私人信息」Assistant 楼层；普通剧情继续后封存旧投影，下一次通讯在新时点另建楼层。新增楼层沿用 `/sendas` 原生回合语义，同楼追加不增加回合。文字、图片和语音本期全部支持，成功生成必须有可见回应，不建立静默分支。它不使用 D1 隐藏注入，也不依赖世界书条目名定位人物。

完整边界见 [信息 APP 终态设计](./information-app-target-design.md)，实际接口、预算与验收见 [信息 APP 施工方案](./information-app-implementation-plan.md)。2026-09-05 已通过 module/partition 接入桌面和真实私人信息楼层。图片输入为描述，语音输入为原文，共享画图/TTS 负责呈现；不含附件上传、录音转写。信息建设服务于小白板后续拆分下线的方向，当前不删除旧功能或擅自迁移旧数据。

### 语伴（首版入口已接，真实教学待验收）

由当前故事中的角色担任私人老师，使用真实外部材料与原生练习教现实用户；角色和共同记忆服务于辅导，不以剧情替代教材。各语言学习资产属于用户，不随切卡、换老师或故事分支清零；小白币奖励仍归所属聊天。学习不写主剧情，也不加入接受轮自动维护。

定位、教学循环、书桌/课堂交互及用户级资产与聊天级奖励的边界见 [语伴产品设计](./language-learning-app-target-design.md)，运行参数、工具职责和验收证据见 [语伴施工方案](./language-learning-app-implementation-plan.md)。首版已注册桌面入口：书桌/课堂/记录/收获、六类作答、同一老师自主联网选材、听力依据和学习奖励均已接入。聊天分区只保留老师选择；用户文件持有学习资产，奖励经 Economy 记账，不能宣称跨两份文件原子提交。固定响应完整链路、宿主文件探针与隔离浏览器已检查，真实教师模型、Tavily 和声音质量仍待第五步验收。录音、转写和发音评价不在首版开放。

### 银行

只读取已完成 Assistant 回复数量。期限变化只影响即时投影，不删除事件、不恢复已结算头寸、不重抽收益。

### 商店

购买、使用和效果消耗是不可逆事实。有限效果按成功形成的新 Assistant 回复消耗；消息收据只防止 swipe/regenerate/continue 重复消耗。删除消息不退款、不返还道具。

### 钱包与赌场

完全不读普通聊天内容。Wallet 只读 Economy Capability；Game 只通过 Economy Transaction Capability 结算。

## 8. User 后自动维护

自动维护只监听普通 User 消息保存成功后的 MESSAGE_SENT，把新 User 当作上一轮已接受边界：

    U1 → A1a → swipe A1b → 保存 U2
                              └─ 维护 U1 + A1b

- U2 不属于本次维护证据；
- Assistant、流式、swipe、regenerate、continue 不触发；
- 监听器同步捕获和入队后立即返回，不阻塞主 RP；
- Map/Tasks 同时有工作时共用一个 Agent session 和共享背景；
- 两个 participant 各自拥有 Prompt、工具、staging、结果和分区事务；
- 切聊、关开关、消息/swipe 改变、领域 CAS 改变时，提交发出前的 staging 作废；
- sidecar replace 已发出后不能伪造取消，必须按真实保存结果处理；
- 全部 no-work 时不得读取 Agent 配置或创建 adapter；
- 打开 APP、关闭开关、查看本地状态均不调用 API。

后台队列、AbortController、staging 和运行错误只活在当前运行内。

完整契约见 [Agent API 设置与后台维护终态设计](./agent-api-and-maintenance-target-design.md)。

## 9. 写入与错误

所有 APP 业务写经过 Scoped partition transaction：

1. 进入当前页面 FIFO；
2. 捕获聊天引用和 activation/participant guard；
3. no-store 强读服务端 sidecar；
4. 只解析自有分区和本动作所需 Capability 分区；
5. 执行领域命令、actionId、CAS 和业务校验；
6. Capability 在同一 candidate 中修改自己拥有的分区；
7. 再检查聊天和提交 guard；
8. Envelope revision 加一并生成 commitId；
9. 原样保留所有未参与分区，只上传一次 sidecar；
10. confirmed 后发布；明确失败不发布；结果未知时按 commitId 确认并冻结新写入。

没有服务端 CAS。每次写前强读支持手机和 PC 顺序使用，但不保证真正同时写入不覆盖。

APP 故障分三层：

- 普通操作失败：余额不足、输入错误、CAS、Agent 未配置；APP 保持 ready；
- APP 失败：分区、Host、受监管后台、UI chunk 或 UI render；只进入该 APP 错误页；
- Kernel 存储失败：Envelope 无效、引用冲突、sidecar conflict；当前聊天只读可用范围内继续，全部新写入冻结。

## 10. Game 保存体验

点击确认后立即开始不暴露最终骰面的中性动画；Host 同时强读、执行 Game + Economy 事务并保存。最终骰面、胜负和余额只在 commitId 已确认且最短动画结束后出现。

保存失败显示“本局结果尚未保存”，保留同一个内存 candidate 并冻结后继动作；重试不得重新随机、重新生成 ID 或重复扣款。详细时序以 Kernel 终态设计第 12 节为准。

## 11. 当前交付状态

### 已实现的产品功能

- OS 外壳和发送键左侧入口；
- Fourth Wall、Wallet、Bank、Game、Shop、Agent API、Map、Tasks；
- 共享 Agent 配置和 Map/Tasks 维护编排；
- 各 APP 当前领域、Prompt、工具和 UI。

Map、Tasks 的真实 SillyTavern/Provider 与移动端验收仍以各自文档为准；自动化全绿不能代替真实宿主验收。

### 当前底座状态

生产已经一次性切换到 Kernel/sidecar：APP 分区、Capability、聊天引用与生命周期、Shell 懒加载、APP 故障隔离、upstream Fourth Wall 单次导入以及 Game 确认后揭示均已接入。测试线旧 OS metadata 根不读取、不迁移，也不存在双存储运行路径。

底座后续只接受真实宿主验收发现的修正，不再作为新 APP 的临时施工区。信息 APP 已按独立施工方案通过 module 注册接入，业务没有塞进 Kernel 或现有 APP；后续小白板拆分需另定旧数据策略。

## 12. 后续开工边界

- 新 APP 只拥有自己的 partition、Host runtime、Prompt/工具与 UI；
- Economy、Agent、Maintenance 只通过 Capability 使用；
- 不新增集中业务根、metadata 业务数据或测试线兼容壳；
- 不以“以后再拆”为由把新业务塞进 production composition 或 Kernel。

## 13. 每阶段验收

- 需求达成且用户操作含义明确；
- APP 打开不启动隐式 API 检查；
- 自动维护严格位于 User 接受边界；
- 功能所有者、唯一事实来源、持久/临时态和删除路径符合文档；
- 坏分区、坏 Host、坏 UI 的故障范围准确；
- 跨分区动作只有一次 sidecar replace；
- 无测试线旧 schema、旧入口、旧协议和 metadata 回退壳；
- 运行产物不 import modules/tavern；
- 最低风险测试、typecheck、lint、build 和关键真实浏览器路径通过；
- diff 经上下游、边界、数据流、取消、保存和错误路径通盘 review。
