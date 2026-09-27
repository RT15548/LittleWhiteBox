# Map APP 终态设计

## 1. 定位

Map 是普通小白 OS 的独立世界探索与空间领域。存储分为 Atlas 与 Scene；用户浏览层级见第 3 节：

- Atlas：依据作者设定并合理补全的世界地点、层级、地点坐标、路线和人物所在地点；
- Scene：一个具体地点内的俯视几何、出入口、物件和人物位置。

这里复用的是产品经验、语义和绘图规则。普通 OS 不 import`modules/tavern/**`，不使用 Tavern DB、Session、楼层、manager run、state document 或回滚协议。

世界与地区使用地点／路线示意图，具体场所使用独立 Scene。本文件描述当前实现；世界／地区没有独立地貌几何、跨图坐标框架或地貌生成工具。

## 2. 开工检查结论

| 项目 | 结论 |
| --- | --- |
| 功能所有者 | `domains/map`拥有地图格式、语义、校验和纯投影；`apps/map`拥有维护 Prompt、工具、Controller 和 UI |
| 唯一事实来源 | 当前聊天 sidecar 的`map`分区中的规范化 Atlas 与 Scene 集合 |
| 持久态 | 地点、路线、人物位置、场景几何和 domain revision |
| 临时态 | 浏览区域、地点选择、搜索筛选、缩放/拖拽/双指手势、弹层、loading/error、Agent 请求、Session staging、修参失败集合 |
| 外部依赖 | ScopedChatStore、Agent/Maintenance Capability、SillyTavern 当前接受轮、本地图标字体 |
| 注册入口 | Map Host/Shell catalog、module、`map`分区 parser、maintenance participant、main prompt runtime |
| 删除路径 | 删除`apps/map`、`domains/map`及两处 catalog/settings/maintenance/prompt 注册，清理`map`分区；共享字体保留给其他消费者 |
| 兼容对象 | SillyTavern/WebView、Provider 工具协议及现行 Map 文件格式；不读取 Tavern 地图记录，不保留未发布的地貌测试格式或转换层 |
| 最少测试 | Atlas/Scene 不变量、intent 编译、接受轮维护、迟到结果、Prompt 安全、关键 UI 浏览器路径 |

## 3. 产品形态

顶部固定为「世界地图 / 当前地区 / 当前场景」。打开时已有玩家的有效场景图则显示当前场景，否则显示世界地图。浏览状态只活在当前 APP 中，不写入分区、不移动人物、不调用 Agent。

- 世界地图只展示、统计和搜索 `scale: region` 的地区；`world` 是世界容器，不计为地区，具体场景地点不得混入。
- 地区图只展示、统计和搜索归属该地区的场景地点。归属取最近的 `region` 祖先，覆盖建筑、楼层、房间等嵌套地点，但不跨入另一个地区。是否已有 Scene 布局不影响地点被列出。
- 「当前地区」跟随玩家所属地区；从地区详情也能查看其他地区，包括尚无场景地点的空地区。地区名称始终显示在路径、横幅和搜索弹窗中。没有记录所属地区时显示明确空态，不借用其他地区的地点。
- 横幅数量和搜索共用 `apps/map/ui/map-browse` 的当前浏览范围。搜索栏进入当前范围的全部项；横幅存在未到访项时默认打开同范围的未到访筛选，否则打开全部项。筛选和搜索不得扩大范围。
- 地区归属与到访推导统一由 `domains/map/hierarchy` 提供，工具和 UI 共用：地点已到访或玩家正在其中，则其包含层级也已到访。只读派生，不回写存档；地区不会一边包含玩家、一边被计为未到访。
- 「世界地图」始终回到世界层，「当前场景」始终打开玩家场景。查看其他场景后返回其所属地区，地区返回世界；地点详情和弹窗先关闭自身。

- 有作者地图设计：依据给定设定绘制，未到访不妨碍地点存在。
- 没有明确地理设计：按世界观补充少量多样、互联、有探索价值的去处，不能只有家和公司。
- 地区与场景地点都能查看详情，不要求先有 Scene；地区详情提供地区图入口，具体地点详情提供场景图入口。
- 场景图解释一个具体地点的内部布局；尊重作者设计和已确定位置，允许补齐普通功能区、陈设与通道，不必等待剧情逐件点名。不批量生成未到访地点的内部，不展示作者隐藏的秘密。
- 「回到我的位置」只调整视口和选择，人物位置仍来自 Atlas actor。
- Atlas 不是 GPS。同一直接父级下的地点坐标可共同绘制；缺少坐标或不属于当前坐标范围的地点使用稳定示意排列，不回写位置。视口身份包含世界／地区层级，避免与地区 key 撞名。

### 更新反馈

- 进入地图只读存档与后台状态，不发起更新，也不把上一次维护结果再次当作通知展示。
- 最近一次维护结果保留在后台内存，在「地图设置」中可查看；刷新页面后不要求恢复，不增加已读标记或持久化通知记录。
- 页面打开期间观察到一轮维护结束，才显示当次反馈。关闭提示后，同一状态的重推不再提醒；下一轮即使发生同样的失败，仍可提醒。打开时正在运行的一轮也遵循此规则。
- 手动更新未获准开始时，直接说明当次原因，不借用旧结果。设置内始终可看到操作反馈，无需关掉设置才能发现失败。
- 模型配置、请求失败、空响应、输出检查失败、处理上限和保存失败分别说明；只展示闭合的错误分类与处理建议，不传递原始接口错误、密钥或堆栈。
- 存档读取失败、保存未确认与冲突是持续状态，优先于临时反馈，不因关闭提示或重进地图而消失；存储安全栅栏保持不变。

## 4. 持久数据模型

### 现行格式

Atlas 的坐标属于地点的直接父级，内部 Scene 使用各自的局部坐标；两者不推导跨图映射。

```ts
interface MapDomainV1 {
    schemaVersion: 1;
    revision: number;
    atlas: MapAtlas;
    scenes: Record<string, MapScene>;
}

interface MapAtlas {
    locations: MapLocation[];
    links: MapLink[];
    actors: MapActorPosition[];
}

interface MapLocation {
    key: string;
    name: string;
    scale: 'world' | 'region' | 'city' | 'district' | 'building' | 'floor' | 'room' | 'outdoor';
    status: 'mentioned' | 'visited';
    parent?: string;
    sceneKey?: string;
    brief?: string;
    position?: [number, number]; // 所属父区域内的稳定坐标，北为较小 y
    terrain?: 'urban' | 'plain' | 'forest' | 'water' | 'mountain' | 'desert' | 'snow';
}

interface MapLink {
    id: string;
    from: string;
    to: string;
    kind: 'door' | 'stairs' | 'elevator' | 'path' | 'road' | 'portal' | 'passage';
    label?: string;
    bidirectional: boolean;
}

interface MapActorPosition {
    actorKey: string;
    displayName: string;
    locationKey: string;
}

interface MapScene {
    key: string;
    name: string;
    status: 'uninitialized' | 'active';
    viewBox: [number, number, number, number];
    mood?: 'neutral' | 'warm' | 'cold' | 'dark' | 'mystic' | 'danger' | 'calm';
    elements: MapElement[];
}
```

玩家当前位置只以`atlas.actors`中`actorKey: "player"`的记录为准，UI 的“当前地点”由它派生；不再额外持久化第二个`activeLocationKey`。

地点 position/terrain 是地点长期事实，不是视口缓存；省略保留已有值，null 清除。terrain 只决定地点的示意背景，不表示一块有真实轮廓的地形。

Scene element 使用闭合语义，不保存任意 SVG/CSS：

```ts
interface MapElement {
    id: string;
    category: 'wall' | 'road' | 'water' | 'terrain' | 'furniture'
        | 'decoration' | 'door' | 'danger' | 'marker' | 'actor'
        | 'label' | 'grid' | 'magic' | 'secret' | 'light';
    shape: 'rect' | 'circle' | 'path' | 'curve' | 'icon' | 'label';
    geometry: RectGeometry | CircleGeometry | PointGeometry | PointsGeometry;
    kind?: MapElementKind;
    label?: string;
    actorKey?: string;
    icon?: MapIconToken;
    material?: MapMaterial;
    certainty?: 'confirmed' | 'inferred' | 'unknown';
    closed?: boolean;
}
```

- renderer 根据 category/kind/material/mood决定颜色、纹理、图标和线宽；Agent 不能保存 HTML、URL、任意 fill、filter、class 或 style。
- location、link、actor、scene 和 element key 在各自作用域稳定且唯一；人物展示名与稳定 actorKey 分开保存。
- parent、link 端点、actor 位置、location→scene 引用必须存在；父级不能成环。
- Scene 中的 actor element 必须与 Atlas 中同 actorKey 的 location→scene 对应；不能在两个 Scene 重复出现。
- 每次合法修改使 domain revision 连续加一。UI 缩放和当前查看的非玩家地点不进入领域数据。
- Map 分区必须限制文本、坐标、集合数量和总序列化体积；`map`分区的硬上限为 512 KiB，单 Scene 最多 128 个 element，超限领域编辑整体拒绝而不是静默截断旧地图。
- 不保存领域编辑历史、截图、模型原文、Prompt、请求日志或渲染缓存；当前产品没有第二个消费者需要这些持久实体。

## 5. 地图事实与聊天语义

Map 区分「世界建立」与「发生过的故事」：前者允许按设定创造地理，后者必须有接受轮证据。

- 角色/世界书设定优先；当前 Host 注入的是触发的世界书片段，不是全书扫描。没读到不能当成作者没设计；新内容要克制，遇到后续作者设定时尊重并协调。
- 首建或稀疏地图建立有用的探索区域；完整区域不每轮继续扩建、重排或换 key。
- 新目的地用 mentioned（UI 显示未到访），不能因生成地点而标记 visited、移动人物、编造已发生事件或任务进度。
- 本地场景只画剧情涉及的具体地点，隐藏房间、秘密路线与剧透不因存在于作者背景就展示。
- 当前场所普通布局允许依据设定与常识合理补齐，新增推断结构使用已有 `certainty: inferred`，不凭空增加人物、事件、危险、贵重发现、门锁状态或已走过的路线。推断出口不得凭空绑定到某个目的地。完整布局保留已有 id 与位置，不每轮重画。
- 同一连续空间持续编辑同一 Scene；明显分离的地点才创建新 Scene。
- 人物离开一个场景时更新 Atlas 位置，并移除旧 Scene 中同 actorKey 的图标；同一 actorKey 不能同时出现在多个 Scene。
- Scene 名称不是世界层级。建筑、楼层、房间关系属于 Atlas，墙、门、桌椅属于 Scene。

Map 是“接受后提交的 OS 事实”，不是随消息数组实时重算的缓存。之后编辑、删除或切换旧消息不会自动回滚地图，也不会调用 API。聊天被大幅改写后，用户可明确执行「重新绘制世界」；重建生成完整候选 Map，整轮成功结束且所有工具错误已修正后一次替换。接口失败、处理上限、未修正坏项或取消均保留旧地图，不提交空白基线上的半成品。

创建 SillyTavern 分支时由 Kernel 复制父 sidecar 的已确认 partitions 并生成新 osId，两个分支之后各自维护。Map 不扫描共同消息前缀猜测应恢复到哪个版本。

## 6. Agent 工具与维护规则

每轮 Map Session 将初始 staging 的 Atlas 投影注入 `<map_atlas_state>`；rebuild 从空 Atlas 开始。`mode: document` 包含全部已记录的地点、路线和人物位置；超过 20,000 码点预算时改为 `mode: summary`，仅含数量与已知玩家位置，模型按需分页读取。摘要未列出的集合不等于空集合，`<current_map>` 也只是有界的玩家侧概览，不能当完整清单。地点投影中的 `hasScene` 只表示场景是否存在，不表示布局完整。

需要修改当前已有场景或评估其普通布局是否稀疏时，允许 `MapSceneRead`；完整性评估不以新剧情空间事件为前提。同一轮复用已经读取的布局，不因新一轮到来就例行复查。不新增完整性标记或持久状态；是否写入仍遵循设定补全与事件证据边界。

Map participant 自己提供四个高层工具：

正常维护与管理员共用以下读回投影和编辑编译器，分别沿用各自的分页与保存边界。

- `MapAtlasRead`：默认返回地点/路线/Actor 数量、缺失地区归属数量与玩家位置；`locations/links/actors`按`offset/limit`分页并支持各自过滤，`document`仅供确需完整 Atlas 时显式读取；
- `MapAtlasEdit`：声明式提交`locations/links/actors/remove`，并写入 staging context；地点 key 是稳定身份，parent 可引用同次调用创建或修正的父级，具体地点必须有地区祖先，地区与世界可处于根级或用`parent:null`脱离父级；拒绝让已归属的后代脱离地区。路线默认双向且可省略派生 id；
- `MapSceneRead`：按明确地点 key、地点名或内部 Scene key 读取一个 Scene，返回 `data.scene:{scene,viewBox,mood?,elements}`；`scene` 使用唯一所属地点 key，元素使用与写入相同的 `cat/geo`（矩形 `center/size`，曲线 `curve`），不暴露内部存储字段与 Scene 生命周期状态。地点名称、scale/到访状态仍从 Atlas 读取；缺少场景返回 null；
- `MapSceneEdit`：接收`scene/playerHere/viewBox/mood/elements/remove`绘图意图；只为 Atlas 中已有且具有地区归属的具体地点建立 Location→Scene 关联，不创建地点或改写其名称、scale、到访状态。

当前格式中缺少地区归属的记录保持可读，不猜测归属、不删除 Scene、不清空地图。Atlas 投影提供只读 `needsRegion` 标志、摘要数量及同名分页过滤；正常维护按设定补全这些地点的 parent，保留 key、布局与到访事实。工具拒绝新增无归属地点时，将结构化原因反馈给同一工具循环；没有额外模型请求、用户弹窗或手工整理任务。无法修正的工具错误仍沿用现有维护结果规则，不隐瞒失败。此标志是派生信息，不是新 schema 字段或迁移状态。

模型看不到内部领域命令或任何原子 op。Location 的`sceneKey`由`MapSceneEdit`内部建立，既不会从 Atlas read 投影返回，也不能由 Agent 写入；普通 OS 不保存地点别名。`MapAtlasEdit`的声明由 Atlas compiler 展开为领域编辑，删除地点会同时删除其后代、关联路线、Actor 位置和 Scene，只能用于明确纠正、消失或毁坏，不能把“离开地点”当删除。玩家需要详细场景坐标时使用`MapSceneEdit.playerHere + player element`；Atlas actors 的世界位置写入不会凭空生成 Scene 图标。

`MapSceneEdit`逐 element 编译；合法 sibling 进入 staging，坏项进入`skipped`，不会拖死整批。对外 schema 只公布规范 category 和顶层`icon`；`rect`只认`center+size`，path/curve 至少两点。基于实际模型输出的 terrain 类别别名、`geo.icon`、无关空数组和零值污染只在 compiler 入口吸收，不作为第二套公开写法。工具 schema 与运行时入口同时使用领域容量上限；超限 collection 整次拒绝，不先遍历再依赖最终领域校验，修正后的下一次调用会清理该次调用级失败。

场景读回只在 `tools/scene-reader.ts` 做临时工具投影，后台维护与管理员共用；Map 分区仍是唯一事实来源，不迁移、不新增持久状态，也不保留旧工具输出分支。修正错误只重发相关字段：旋转失败通常只需 `id/rotation`，不要求重发几何。

模型契约同时覆盖 Prompt 和工具字段描述：曲线点是实际经过的位置，不是贝塞尔控制柄；面积点按周界依次排列；零度时椅子/沙发靠背与床枕位于上方，椅子/沙发朝南，桥面通行方向南北；森林面积不带 `tree` 图形标识，单树才带。`closed` 工具描述列出类别默认闭合规则；`viewBox` 是进入场景/全图时的范围，普通更新不自动跟随人物。合理布局补全与剧情事件证据分开，补全不能冒充已发生事件。

Prompt 使用 `tools/scene-examples.ts` 中的三组「背景→空间组织→首绘→下一轮最小更新」样例（酒馆/溪谷/科幻舱室），通过正式工具与存储测试验证样例可执行；不以样例替代真实模型质量验收。Google 原生参数使用受支持的 Schema 子集：尺寸的严格正数约束留在运行时，可空枚举使用标准 anyOf，经 SDK 转成 nullable 与纯字符串 enum；没有额外供应商分支或依赖。

Actor 缺少 actorKey 时使用稳定 element id；非 Actor 的 actorKey 被忽略并返回 warning；玩家永远规范化为`actorKey:"player"`，展示名来自本轮捕获并在接受轮入口规范化到 120 字符领域上限的 SillyTavern 用户身份。同一 Actor 移动时同步 Atlas，并删除旧 Scene 图标。工具统一返回`ok/status/changed/applied/skipped/warnings/hint`，applied/skipped 项携带所属 collection，修参只清除同一 collection 下相同 id 的失败：全坏为 failed、混合结果为 partial、幂等结果为 unchanged。

没有通用 state write、任意 JSON path、完整根对象或直接 SVG 工具。模型输出先经过：

```text
宽容 intent
→ 字段白名单与限长
→ 形状/geometry 编译
→ 引用、重复、容量和空间语义校验
→ 内存 staged Map
→ 接受来源与 revision 再确认
→ Scoped Store 以当前 revision 将 Map 写入一个 sidecar candidate
→ Kernel 以一个 commitId 上传并确认
```

维护 Prompt 沿用成熟规则：

1. 先依据作者设定建立/补全有用的世界区域，保留既有 key、位置和连接。人物位置只依据真实剧情。
2. 确认当前地点后，再读取/编辑明确命名的 Scene。
3. 新 Scene 先确定 viewBox 和主要连续地面或外边界。
4. 再放门、路线、家具、危险、物件、标签和人物。
5. 室内通常同时有 terrain 与 wall；开放场景可以使用地面、道路、岸线或地标网络。
6. 默认北上南下；文字只标注真实可见区域，不生成第二个标题。
7. 地点 key 保持稳定；Location→Scene 关联由 Scene 工具维护；路线省略 id 时对端点、方向性和 kind 的无歧义元组取 SHA-256，生成长度有界的稳定 id。双向路线反向声明幂等，单向/双向不同；key 中的冒号不混淆端点。
8. 首次或稀疏场景绘制一个小而完整的场所：主要表面/边界、普通功能区、行走空间、已知物件，以及有实际在场证据的玩家。取消一至三个锚点限制，也不靠装饰堆满画面。

打开 APP、切换 Atlas/Scene、选择地点、拖拽和缩放都只读本地数据。只有自动接受轮或用户明确点击「更新地图」「绘制世界地图 / 重新绘制」才可调用 Agent。

## 7. 自动维护开关

- Map 随小白 OS 固定注册并显示在桌面，不存在 Map 专属`enabled`字段或扩展设置复选框。
- `autoMaintenance=false`：仍可查看地图、使用显式维护按钮和主 RP 空间 Prompt；User 发送不产生 Map API 工作。
- `autoMaintenance=true`：User 消息保存后，处理刚被确认的上一接受轮。

Map 无法在本地可靠判断一轮 RP 是否包含新地点或移动，因此最后一种模式会让每个有效接受轮都参加 maintenance 请求，即使 Agent 最终判断无需写地图。开关说明准确写触发时点，不谎称“仅地图变化时调用”，也不另放 API/token 常识提示。

首次启用自动维护不会立即扫描聊天。下一次 User 发送后从刚接受的来源开始；希望立即建立地图时，用户明确点击「绘制世界地图」。

「更新地图」只处理聊天尾部最新的完整 User + 当前所选 Assistant 内容；这次明确点击不要求自动维护已开启。没有完整轮或正在生成时只显示本地提示，不调用 API。「绘制世界地图 / 重新绘制」才允许扫描更长历史并以完整候选 Map 一次替换旧 Map，两者不能共用含糊按钮。点击后直接交给 Host 后台队列，不弹确认框；按钮立即禁用并显示对应运行状态。

sidecar replace 发出前，运行中切聊、关闭自动维护、Map revision 改变、接受消息被编辑/删除/换 swipe 都会使自动 job 的迟到 staging 作废。replace 发出后无法物理回滚；此时等待真实结果，confirmed 才发布 Map snapshot，并停止后续 participant/job，不能向用户伪报“已取消”。API/解析失败不改变旧 Map。

## 8. 主 RP 空间摘要

小白 OS 运行且 Map 已有有效世界地点时，自己的 prompt runtime 在主生成的`IN_CHAT`、depth 3、system role 安装`<current_map>`只读空间摘要。它使用独立 extension prompt key，不与 Tasks 或 Shop 拼成共享业务 Prompt，只输出：

- 当前地点、上级区域与当前地点概况；尚无玩家位置时明确标注尚未确定，不阻止世界注入；
- 从当前位置可直接到达的地点、路径名称与单向约束；
- 800 字范围内尽可能完整的世界地点层级与路线方向关系。

主剧情不投影人物位置或任何 Scene：不输出当前场景、场景人物、出入口、可互动、主表面/地形，也不暴露 key、坐标、shape、category、revision、材质或模型原始文本。所有动态文字经过规范化、限长和 XML/宿主宏编码；最终 800 字符安全栅栏按完整行或完整关系裁减，始终保留完整`<current_map>`边界。

地图整块使用 System @D3，世界新闻保持 System @D4；深度只决定插入位置，不代表精确的重要性等级。每次主生成仍读取当前已确认地图，不因 D3 使用旧版本，不拆分场景／世界注入或引入动态深度。

该投影不调用 API，自动维护关闭时仍可使用；无有效地图、dry-run 结束、生成停止、切聊或 OS cleanup 时必须清空。安装/移除沿用现有 generation interceptor 生命周期，代码和字段选择仍归 Map 自己所有。

## 9. UI 与美术

界面延续掌上 OS 的操作尺度和字体，深浅主题由 Map 局部 token 控制。不改 API 与四次元壁内部。

Atlas 使用 SVG 绘制地点、路线及按地点生成的示意底纹；没有逐像素地貌纹理、Worker、瓦片或独立 GPU Atlas。世界图导航与地点使用本地线图标，场景使用共享 Material Symbols 字体与闭合材质 token。

UI 位于 `apps/map/ui`：
- `MapApp` 拥有临时浏览状态，`use-map-state` 只拥有 Host 连接、状态与请求。
- 浏览入口与范围遵循第 3 节。`MapApp` 持有世界／地区／场景浏览目标；切聊清除临时浏览状态，普通数据更新保留有效目标。
- `MapAtlas` 绘制世界与地区，`world-map` 计算示意布局，`MapSceneView` 编排 Scene 二维／三维出口。
- `MapViewport` 负责拖拽、滚轮、双指缩放、全图与指定地点居中，不因普通数据更新重置用户视口。
- 搜索、地点详情、设置独立组件；移除旧树形布局和旧模板，不保留双 UI。
- 地图与详情自适应分配高度；当前范围无地点时显示对应空态，打开不自动生成。
- 浏览异地的空场景只提供返回其地区地图的入口，不提供“更新这里”；现有更新只根据最新接受轮，不携带浏览目标。当前场景空态仍可显式更新。

更新/重新绘制沿用既有后台队列。显示运行、失败、未确认保存、冲突与恢复状态；恢复动作说明影响当前聊天整个 OS 已保存数据，不声称只恢复地图。

场景以同一份二维空间事实供二维／三维绘制，不为酒馆、自然或科幻题材分叉；三维表现边界见 [Scene 三维设计](map-3d-upgrade-design.md)。连续地面承载局部纹理，墙体表达边界，常见物件按实际占地组织细节。图形标识选择物件结构，材质独立决定表面；不按名称猜家具，不生成杯子、书籍等额外实体。只有位置的图标仍是示意标记。陌生物件保留输入轮廓、材质与名称，不添加缺少数据支撑的详情面板。

模型仍使用四个地图工具和同一 elements 集合，只提供空间事实；不输出 CSS、SVG、颜色或纹理控制点。新增 forest/glass 材质和 sofa/bridge 图形标识。可选 rotation 只用于矩形/圆形，绕中心顺时针旋转，范围 [0,360)；省略保留、null 清除，错误角度或不支持的最终形状逐元素拒绝。现有无该字段的数据直接有效，无清空、迁移或自动请求。

绘制职责留在地图 UI：`MapScene` 编排图层，`scene-geometry` 投影几何及有界林地装饰，`scene-materials` / `SceneMaterials` 定义材质，`SceneObject` 绘制占地内的归一化细节。小于12屏幕像素的物件简化。墙厚仅为视觉描边，不能证明是否可通行；closed:false 的路径/曲线不会闭合，未指定则沿用类别默认值。不吸附、不补门、不自动绕障，去掉默认工程网格但保留显式网格元素。

林地只对 terrain + forest 面积派生裁剪树冠，稳定种子、复用符号、全场景上限256；它们不是逐棵树的位置事实。明确的树物件不再叠加区域装饰。树冠和纹理不持久化。标签独立于物件旋转，局部主题和 OS 字体继续有效，普通数据更新保留视口。

具体验证与待验收项目见 [场景地图施工记录](scene-map-implementation-plan.md)。室内酒馆、自然溪谷、科幻舱室的手写输入均经正式工具、领域、保存及读取链路进入同一生产渲染器；不能以此声称真实模型已达到同样质量。场景仍不注入主 RP，沿用当前 Atlas 投影边界。

## 10. 失败、删除与数据策略

- malformed tool call 拒绝对应 staged edit；相关地点的层级修正共同验证，独立合法项可成功，若没有合法变化则不保存。
- 工具解析、参数和可恢复执行错误会作为结构化结果回喂模型；同签名连续失败三次会收到刹车提示，第四次终止，单次 Session 最多 12 个 Provider 回合。
- 普通增量维护在 Provider 后续失败或达到轮次上限时，可以 partial 提交已有合法增量；没有合法变化则 failed。重绘使用共享执行器的 `complete-run` 提交策略，禁止这一部分提交行为。切聊、关闭自动维护、来源变化或取消会使自动 job 中尚未发出 sidecar replace 的 staging 整体失效。
- 对外声明与持久化地图受领域容量限制；合法级联删除展开的内部操作没有另设 256 条限制。地点删除清理后代、路线、人物位置及 Scene，最终候选整体通过领域校验后才应用。
- sidecar 保存明确失败时保留旧 Map；保存结果不确定时由 Kernel 保留同一 candidate 并按 commitId 确认，不重复调用模型。
- 关闭窗口、返回桌面或切换 APP 只销毁 UI activation，不停止已获准的自动维护、显式维护或重建；重新进入 Map 从 Host runner 读取当前聊天的运行状态与最近结果。runner 状态按聊天隔离，旧聊天的运行或取消结果不得投影到新聊天。关闭自动维护只使自动 job 失效；切聊、OS 总开关关闭和 Host cleanup 才使手动与自动任务失效。若 sidecar replace 已经发出，则等待该次保存落定并如实报告真实结果，不声称能够撤回。
- 删除 Map 功能时直接清理`map`分区，不迁入 Tavern、不保留旧类型或读取壳。
- 共享 Material Symbols 字体是扩展级通用资产，不随 Map 删除。

## 11. 最少必要验证

验证以当前地图能力为边界，不以已删除的地貌链路测试或历史性能记录作为当前结果。

- Atlas 父级无环、引用完整、玩家位置唯一；
- Scene key/element key 唯一，geometry 与 shape 匹配，禁止任意样式/URL；
- intent 编译对合法宽容输入稳定，对超限/悬空引用整体拒绝；
- 自动维护开关切换与打开 APP 均为零 Agent 请求；
- User 接受轮只产生一次 staged maintenance，swipe/regenerate 不产生；
- revision、聊天 identity、消息文本或 swipe 改变会拒绝尚未进入保存 commit point 的迟到提交；保存已开始后的取消会保留真实提交结果；
- 主 RP 摘要只含安全的世界地点、连接和真实当前位置，生命周期结束后无残留；
- 世界探索、搜索/未到访筛选、区域/场景切换、定位不移动人物、缩放拖拽/双指手势、空地图与深浅原生控件通过真实浏览器检查；
- typecheck、lint、test、build 通过，产物不引用`modules/tavern/**`。

## 12. 发布验收边界

领域、UI、Prompt、高层工具、宽容 compiler、Session、Provider 工具循环、FIFO 和保存栅栏属于同一次 Map 交付，不能把“代码接通”写成发布完成。自动检查结果以当前提交的 CI/命令输出为准，不在长期文档固化易失真的数量或“完整收尾”结论。

发布前仍需在真实 SillyTavern 浏览器完成以下手工验收，未执行前不得写成已通过：

1. 固定入口：OS 启用时 Map 图标固定出现在桌面；自动维护默认关闭，切换它不隐藏图标、不清空间 Prompt。
2. 只读 UI：打开空地图、切换场景/世界、选择地点、拖拽、滚轮/按钮缩放、复位和开关自动维护均不产生 Agent 请求；桌面与窄屏布局无溢出或不可读原生控件。
3. 显式维护：无完整 Assistant 尾轮和主生成进行中均只给本地提示；「维护一次」只处理最新完整尾轮，「建立/重建」读取限定历史；点击无弹窗并立即变为禁用运行态，离开/重开 Map 不中断且仍显示真实状态，成功后 Atlas/Scene 即时刷新。
4. 自动边界：仅发送下一条 User 后为上一接受轮触发一次；Assistant、swipe、regenerate、continue、打开 APP 和切页均为零触发；关闭自动维护后，尚未进入保存 commit point 的迟到结果不提交。
5. 聊天与保存：维护中切聊、编辑证据或换 swipe 会丢弃尚未开始保存的迟到结果；保存已经发出时不伪报取消或回滚。保存未确认时显示冻结状态，维护/重建不调用模型，确认后恢复。
6. 主 RP Prompt：OS 运行且存在世界地点时注入安全摘要；生成预检失败、正常结束、停止、切聊及 OS cleanup 后 prompt key 无残留。
7. 真实供应商：使用已配置 provider 各完成一次维护和重建，确认工具轮次可结束、失败不覆盖旧地图、聊天元数据读回后 Map revision 与 UI 一致。
