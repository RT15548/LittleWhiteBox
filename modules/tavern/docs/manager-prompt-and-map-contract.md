# Tavern Manager：领域提示词与地图契约

## 目标与范围

本文定义 Tavern Manager 的领域提示词所有权、地图模型工具与保存契约。Tavern 和普通小白 OS 的地图领域、图标与渲染器各自独立。

Manager 只组合通用身份、模式、授权、证据边界和工作流程；Memory / Map / Status / Tasks 各自提供领域说明。地图对模型只有一套几何表达，存储与回放仍使用原有文档和事务。

## 所有权与入口

| 内容 | 所有者 | 入口 |
| --- | --- | --- |
| 通用 Manager Prompt | `shared/manager/` | `buildTavernManagerSystemPrompt`；一处领域注册表 |
| Memory Prompt、默认记忆设定 | `shared/memory/manager-domain.ts` | `memoryManagerDomain` |
| Map Prompt、模型工具契约与投影 | `shared/map/` | `mapManagerDomain`、`getTavernManagerStateToolDefinitions` |
| Status Prompt、默认面板设定 | `shared/status/manager-domain.ts` | `statusManagerDomain` |
| Tasks Prompt | `shared/tasks/manager-domain.ts` | `tasksManagerDomain` |
| 预设配置身份与规范化 | `shared/assistant-presets.ts` | 默认预设创建及用户预设规范化 |

`structured-state.ts` 负责地图文档、事务与回放，公开模型契约由 `shared/map/` 拥有。内部文档检查与事务调用不是模型工具。

删除领域 Prompt 时删其入口文件及注册；彻底删除功能仍须同时删除该领域现有工具授权、运行入口、UI 和会话数据，不能只删 Prompt。领域提示词和投影不另建持久化实体。

## 上下文与政策

- 自动维护：注入本轮已接受的用户/助手消息；按授权注入完整 `state.md`、人物文件名列表、Atlas、Status；Tasks 使用来源楼层上的正式任务快照。人物正文和场景内容不是默认注入。
- 手动聊天：注入用户问题、全局记忆及可用的只读任务上下文。地图和 Status 按需读取；任务工具不可写。
- `chat/` 与 `worldbooks/` 是可经 LS/Grep/Read 读取的只读证据。地图首次建立前，缺少相关作者地理时先读取世界书，不能把“上下文里没看到”当作“作者没有设定”。
- 地图允许落实作者地理及合理补全普通空间；这不授权创造访问、移动、发现、破坏、威胁或任务进度。保留未到访目的地，不要求玩家先去才画。
- Memory：玩家持续状态归 `state.md`，其他已确认具名人物归人物档案；保留原有带 `[推定]` 的日期连续性规则。
- Status：真实结构是 subject → tab → block → field。标签通过增删 field 显隐；`step` 限制一次 delta 的幅度，不是数值量化步进。
- Tasks：玩家执行任务依靠剧情证据；NPC 承接任务保留受限幕后推进政策。手动聊天、结算资金范围和既有 CAS 规则不变。

## 地图模型工具

| 工具 | 职责 |
| --- | --- |
| MapAtlasRead | 读取地点、层级、路线和记录中的人物位置；`hasScene` 表示已关联布局，SceneRead 验证文件是否存在 |
| MapAtlasEdit | 原子新增/修改地点、父子关系和路线，删除指定路线；不创建场景、不操作人物 |
| MapSceneRead | 显式指定场景读取；document/elements/element 使用可编辑几何表达 |
| MapSceneEdit | 显式指定场景增量编辑；需要时创建场景及地点；`playerHere:true` 记录玩家移动 |

没有把内部 `MapDocs/MapInspect/MapPatch` 或其 schema 发布给模型。现行回放只使用 `meta/add/modify/remove`。

AtlasEdit 的地点省略字段保留，`parent:null` 和 `brief:null` 清除；新地点必须有 name，默认 room/mentioned。同批支持先写子项再写父项；依赖/环/坏路线均整批拒绝。路线项是完整替换，不承诺部分字段合并。地点及场景删除、通用人物迁移不属于这些公开工具的能力，不能声称已提供完整地图 CRUD。

## 唯一几何表达

- 矩形：`shape:rect`，`geo.center` 是中心，`geo.size` 是占地。存储仍为左上角 `at` 与 `rect`。
- 圆：`shape:circle`，`geo.at` / `geo.radius`。
- 路径与曲线：绝对 `geo.points` / `geo.curve`；存储仍为锚点和相对点。
- 图标：`shape:icon`，`geo.at`，可选 Material Symbols 官方名称；不移入 OS 图标枚举。
- 独立文字：`shape:label`，`geo.at` / `label`。

读取时将派生标签并回所属物件，分页也按语义物件计数，不向模型暴露 `__label__` 实体。读取结果回写不得挪位或新增副本。已有 id 省略字段保留，geo 整体替换；`label:""` 清除附属标签。`closed:false` 清除路径闭合，`certainty:confirmed` 清除旧推定标记。

Prompt 负责空间组织与证据政策，schema 负责字段、枚举与渲染语义，工具结果负责应用/跳过/失败反馈。模型看到的普通 tool message 和有状态 provider continuation 共用一份结果投影；调试记录和 CAS 使用内部结果。

## 数据生命周期与失败

- 唯一长期事实来源仍是现有地图/Atlas 文档与历史事务。投影、推断说明和编译结果仅在当前调用内存在。
- 文档读取只投影当前字段，不批量重写用户库、不增加历史格式分叉。
- AtlasEdit 走既有事务、revision 检查、before/after write guard、Manager 快照和回滚链路。
- SceneEdit 保留按坏元素隔离的行为，调用级保存失败不报告成功；dryRun 明确说明未保存，unchanged 是成功。
- 内置预设更新只替换仍属内置的预设。用户保存过的预设（包括编辑默认预设）不被版本更新覆盖，也不再按旧文案正则删改用户内容。

## 验证与验收

回归覆盖公开 schema、六种形状读写往返、附属标签分页、材质/置信度/闭合局部更新、高精度坐标及现有显示属性保留、坏元素隔离、Atlas 父子和路线、坏事务不写、dryRun、前后守卫失败、回滚、普通/有状态 provider 投影一致性，以及用户预设保留。

既有 Tavern 测试继续覆盖地图并发、跨场景人物去重、回放、任务权限和结算、Status 边界、Memory 写入与回滚。类型、lint、imports、构建及受追踪产物须一起检查。

真实模型绘图质量仍待独立测试聊天验收：应使用自然语言世界设定，让真实 Manager 生成和更新不同场景，不手改坐标或补专用样式。自动化输入只能证明工具与数据链路，不证明真实模型画得好。
