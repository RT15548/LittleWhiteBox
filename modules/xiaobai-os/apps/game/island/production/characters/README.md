# 荒岛人物制作

本目录只负责离线造型与资产导出，不属于游戏运行模块。[人物目录](../../character-catalog.json)是 NPC 姓名、性别、年龄、身高，以及玩家可选外观档的唯一来源。叶芮保留主人参与定型的正式模型；另外五名 NPC 和玩家男女各四档成年外观使用独立人体、衣发与游戏资产，运行时不再使用程序化占位人。

## 造型与制作顺序

1. 无遮盖的成年人体灰模：同尺度正、侧、背，分别处理头身比、颈肩、胸廓、腰胯、四肢、手脚；不靠衣服遮住问题。
2. 独立脸型、自然站姿与关节变形：抬臂、屈肘、弯腰、屈膝。身高归一化会受头顶形态影响，局部修脸也不能假定身体绝对不变。
3. 头发与独立衣物：先造型，再拟合身体和自然站姿中的肩臂接缝。共用拓扑不等于共用人物形态。
4. 动作、游戏导出与实渲：站立、行走、休息、劳动、建造、饮用、清洁、递出、拖行、死亡。根位移留给世界状态，动作不驱动游戏时间。
5. 精简曲面、整理发型与模型实渲：保存可编辑场景，再输出 GLB 与同一模型的正面肖像。正式头像的选用与造型依据见[美术来源](../../assets/SOURCES.md)，不以制作脚本的实渲自动覆盖已确认的插画头像。

`ye_design.py` 保留叶芮独立的身体、脸型与站姿，体重和罩杯要求是美术约束，不是网格的医学测量。她已认可的 GLB 和原样模不由阵容批处理覆盖。`lin_design.py` 拥有林遥的独立人体；`roster_designs.py` 拥有许宁、周岑、罗越、陈屿和玩家形态，以及新人物的皮肤、唇色、发型设计。林遥与许宁均为清瘦长发形象，身材保留已完成的细化；胸部按胸廓收拢而非向腋下扩张，衣物随底模拟合。当前插画与发型方向见美术来源，原有正式脸型、身体不随头像重做；三人的头发不能都做成同一侧披到胸前的轮廓。玩家外观年龄不被推断为实际年龄或生存能力。

## 文件边界

- `design.py`：读取唯一人物目录，提供显式离线身份与设计入口。
- `makehuman_data.py`：读取 CC0 人体、形态、骨架与权重；不导入 MakeHuman 应用代码。
- `mesh_tools.py`：网格、骨骼、四权重、曲面与网格合并工具。
- `face.py`：皮肤顶点色、眼睛、眉毛和睫毛。唇色跟随上下唇各自的形态支持域，不裁成固定椭圆。
- `hair.py`：叶芮已认可的长发造型，以及共用发丝材质、垂发避让和引导线工具；新人物通过显式长度和波浪参数制作，不改叶芮默认形态。
- `roster_hair.py`：短发、侧分、碎发、齐颈发、束发与长直发、长波浪的设计入口。短发跟随头部，垂发按头颈到躯干渐变绑定，不是头顶的固定几何帽。
- `loose_hair.py`：从现有人体拟合自然散落的披肩后发，区分中分直发与薄刘海柔顺披发；不扎马尾，不改变脸或身体。
- `roster_wardrobe.py`：从本地已认可衣样只读取得独立衣物，按对应人体顶点位移重新拟合；保留裁剪、细节、独立网格与材质角色，再处理分层间隙和站姿接缝。
- `motion.py`：自然站姿、站走片段与人体关节制作姿态。
- `gameplay_motion.py`：生活动作与两节骨链求解，接触距离按各人身高适配，坐姿接触使用实际膝部位置。
- `import-mixamo.py`：将本地许可 FBX 转为 Y-up 的骨骼旋转差和归一化髋部起伏；剔除水平根位移，不复制来源人物网格。
- `fit-motion-weights.py`：对正式 GLB 的衣物按各自人体表面重新插值蒙皮权重、整理分层间隙和法线，供大幅关节动作使用；不改人体、脸、头发、骨架、贴图和动作。输入只读，原文件逐字节保留在输出的 `source` 目录。
- `authoring.py`：核对固定来源与本地输入，只创建新输出目录；缺失输入明确失败，不触发 Git 懒下载。
- `clay_review.py`：单人灰模、面部与关节近景；`clay_compare.py` 只读附加已认可模型作同尺度对照。
- `roster_build.py`：阵容灰模、衣发、动作与初次游戏导出。
- `roster_finish.py`：读取已制作场景，整理发型、曲面预算和衣物贴合，保留既有动作，生成正式资产与头像。
- `restyle_hair.py`：从正式可编辑场景只替换头发，保留其他网格、材质、骨架和动作；输出新场景、GLB 与发型多角度实渲，不覆盖插画头像。

`.blend` 是可编辑生成物。需要手工雕刻时另存工作文件，不把需要保留的手工修改放进下一次制作输出。制作、缓存、参考照片和实渲工作图全部留在本地 `output`；运行包只包含 `assets/characters` 的 GLB 和头像。

## 衣物与运行边界

[衣物目录](../../clothing.ts)拥有款式、穿戴层、线性色和物理调校值。不同人体使用同一款式的拟合网格，不能由穿衣者悄悄更换款式。上衣、长裤、内搭、内裤、救生衣、鞋与足部包裹各自有 `garment_id`；材质以布尔 `garment_tint` 标记哪些部分随物件变色，扣件和反光条不随之染色。

人体没有强制遮挡层。穿脱、掉落、递出、湿度与遮盖只取实际物件。新局为人物配备实际内层衣物；旧局不自动添衣。当前未模拟服装尺码不合、布料动力学、逐指握持或每种劳动的精细工序。

[角色加载器](../../presentation/character-loader.ts)由一次场景生命周期持有，限并发加载六名 NPC 和玩家选中的一种外观，不加载其余玩家模型。失败取消同批未完成请求并释放已加载资源，显示原有重试入口，不静默退回占位人。

[资产适配器](../../presentation/character-asset.ts)给每个实例独立骨架、动画混合器和衣物材质；几何与贴图由场景资产持有。人物撤下时释放实例，场景结束时释放共享资产。离身衣物从统一衣样烘焙，取用者不影响款式。模型只回放可观察的已确认活动，不接管库存、世界时钟、阵营或记忆。

[共用动作适配](../../presentation/motion-library.ts)用 Mixamo 动作替换运行时的男女步行与呼吸待机，并提供出拳、格挡。每个人加载时按自己的骨架重定向一次，不改人体形态、骨长、绑定矩阵或已确认的脸发。共享数据只保存来源旋转差，游戏位置仍由世界时间决定；脚底贴地只修正视觉组。GLB 中的其他生活动作继续使用项目制作的片段。

拥抱、牵手、亲吻和依偎继续使用各人的正式模型。[拥抱姿态数据](../../assets/characters/embrace-pose.json)由 `export-embrace.mjs` 从本地认可样片提取上身旋转差，不含网格、根位移或人体比例；叠加基准保留原制作站姿，不把旋转差直接加到不同的 Mixamo 待机上。[接触适配](../../presentation/contact-pose.ts)按实际骨长和当前衣物背部表面调整手臂、手腕，亲吻按嘴唇表面调整头颈，牵手与依偎采用并肩接触；[人物层](../../presentation/people-layer.ts)负责靠近、保持和松开的过渡。姿态进度、接触点缓存只属于当前画面，卸载即丢弃；人物活动和可见经历由[接触规则](../../contact.ts)管理。头发和布料仍是骨骼变形，不是碰撞动力学。双人动作由项目制作，不冒充 Mixamo 的成对动捕。

冲突画面只回放已观察的准备姿态和确认结果：出拳、推搡、格挡或中招反应不代替[领域结算](../../conflict.ts)。单次回放时间及目标只活在人物层，不新增动画存档，也不因一段动画结束判定命中。

[人物头像](../../presentation/Portrait.vue)和开局外观预览使用独立角色图片；各图的插画或实渲来源统一记录在[美术来源](../../assets/SOURCES.md)，只用于辨识，不是假装实时身体、衣着或伤病画面。正式模型制作完成不等于真实宿主试玩、手机性能或第一章整体交付验收已经通过；任何测试与试玩另取主人批准。

## 输入与许可

人体、形态目标、默认骨骼/权重和眼睛来自 [MakeHuman](https://github.com/makehumancommunity/makehuman)，固定版本由 `makehuman_data.py` 的 `SOURCE_COMMIT` 唯一定义。构建消费 CC0 图形数据，不复制或导入 AGPL 应用代码；许可原文是来源的 `LICENSE.ASSETS.md`，各目标文件也有 CC0 声明。权利声明包括 Manuel Bastioni、Data Collection AB、Joel Palmius、Jonas Hauquier，具体以输入文件为准。核心图形的 CC0 不能延伸为所有社区资产的许可。

输入包括：

- `makehuman/data/3dobjs/base.obj`，只取人体和明确使用的拟合、眼部辅助网格。
- `makehuman/data/targets/` 下各设计显式引用的形态。
- `makehuman/data/rigs/default.mhskel`、`default_weights.mhw`。
- `makehuman/data/eyes/low-poly/` 和 `eyes/materials/brown_eye.png`。
- 主人已认可、本地保留的叶芮游戏制作场景，作为共用物件的衣样来源，不改她的人体。

来源缓存是 partial clone，缺失目标应先从固定版本补齐；制作脚本本身不下载。工具只使用 Blender 内置 Python、NumPy、mathutils、bmesh 和 glTF 导出器，不新增游戏运行依赖或服务。私人照片不由脚本读取、不上传、不做贴图，不宣称模型是真人扫描。

动作库的逐项来源及授权与 CC0 人体分开记录在[美术来源](../../assets/SOURCES.md#动作库)。下载的原始 FBX 只留在本地制作目录，不上传、不作为独立素材包分发；运行包仅嵌入游戏所用的重定向数据。

## 制作命令

从工作区根目录运行；输出目录必须不存在。例：

```powershell
& 'D:/Blender/blender.exe' -b --factory-startup -t 4 --python-exit-code 1 `
  --python modules/xiaobai-os/apps/game/island/production/characters/roster_build.py -- `
  --stage clay --characters xu zhou luo chen `
  --source output/island-makehuman-source --output output/island-characters/new-clay

& 'D:/Blender/blender.exe' -b --factory-startup -t 4 --python-exit-code 1 `
  --python modules/xiaobai-os/apps/game/island/production/characters/roster_build.py -- `
  --stage game --characters lin xu zhou luo chen `
  --source output/island-makehuman-source `
  --patterns output/island-characters/ye-game/ye-game.blend `
  --output output/island-characters/new-game

& 'D:/Blender/blender.exe' -b --factory-startup -t 4 --python-exit-code 1 `
  --python modules/xiaobai-os/apps/game/island/production/characters/roster_finish.py -- `
  --characters lin xu zhou luo chen --source output/island-makehuman-source `
  --input output/island-characters/new-game --output output/island-characters/new-final
```

玩家制作键为 `player-<gender>-<appearanceAge>`，枚举来源见人物目录。最终复制经实渲查看的 `<key>.glb` 到游戏资产目录；头像依美术来源中已确认的选稿单独更新，不批量覆盖。

只换林遥或许宁发型时，不运行会重新拟合身体和衣物的整理流程：

```powershell
& 'D:/Blender/blender.exe' -b --factory-startup -t 4 --python-exit-code 1 `
  --python modules/xiaobai-os/apps/game/island/production/characters/restyle_hair.py -- `
  --character lin --input output/island-characters/female-refine-delivery/lin/character.blend `
  --output output/island-characters/new-hair/lin
```

在正式模型上接入大幅动作后，单独整理衣物跟随；输出实渲确认后再复制 GLB，不重新运行人体制作流程：

```powershell
& 'D:/Blender/blender.exe' -b --factory-startup -t 4 --python-exit-code 1 `
  --python modules/xiaobai-os/apps/game/island/production/characters/fit-motion-weights.py -- `
  --input modules/xiaobai-os/apps/game/island/assets/characters `
  --output output/island-characters/new-motion-wardrobe
```

删除制作工具时删本目录及指定本地输出即可，不影响游戏存档。撤下角色运行接入则删除角色资源、加载注册与引用，不保留旧占位模型作为永久兼容分叉。

共用动作从本地来源重新烘焙：

```powershell
& 'D:/Blender/blender.exe' -b --factory-startup -t 4 --python-exit-code 1 `
  --python modules/xiaobai-os/apps/game/island/production/characters/import-mixamo.py -- `
  --clip femaleWalk=output/island-characters/mixamo-source/female-walk.fbx `
  --clip maleWalk=output/island-characters/mixamo-source/male-walk.fbx `
  --clip idle=output/island-characters/mixamo-source/idle.fbx `
  --clip punch=output/island-characters/mixamo-source/punch.fbx `
  --clip guard=output/island-characters/mixamo-source/guard.fbx `
  --output modules/xiaobai-os/apps/game/island/assets/characters/motion-library.json
```
