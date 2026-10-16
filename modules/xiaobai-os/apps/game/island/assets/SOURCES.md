# 荒岛美术

封面、叶片与地表位图由主人授权的第三方 GPT 绘图服务生成，叶片与地表使用 `gpt-image-2.5-flare`。原始请求、响应、收据和处理记录保留在本地生成目录，不随仓库分发；私人照片与参考原图不打包、不作为人物贴图，外部绘图参考只使用主人明确授权的素材。

入口插画由主人授权的香蕉 `gemini-nano-banana-2.1` 绘制：`coast-title.webp` 为横版海岸主视觉，`coast-title-portrait.webp` 以横版为参考绘制竖版构图，`coast-cover.webp` 从横版裁切供游戏库使用。标题与按钮由界面绘制，不烘焙到插画中。原图与调用收据保留在本地。

游戏内地形、植物、人物及营地采用本功能自己的 Three.js 场景；封面不代表游戏中已存在的物资。

`foliage-atlas.png`：绿色椰叶、海岸圆叶枝、红树林叶枝和附着枯椰叶四格透明图集，1024 × 1024。原图经抠除白底、去除白边污染和孤立杂点处理。用于弯曲叶片几何与实际搭建的叶面，不新增地面可拾物品；植物分布仍由地形和真实遮挡区派生。

`ground-sand.jpg`、`ground-scrub.jpg`、`ground-reef.jpg`、`ground-mangrove.jpg`：四种地表，分别为珊瑚沙、碎珊瑚落叶地、多孔死珊瑚和红树林泥地。来自同一张四格图集，各格裁边后缩至 512 × 512，并对边缘作周期混合以减少铺贴接缝。图像只提供材质，地区权重由实际 `terrainAt` 派生，不包含地图、物资或隐藏地点。

[叶芮游戏资产](characters/ye.glb)：人物制作工具从已认可样模导出的虚构成年女性，非真人扫描；保留人体、脸、头发与四件衣物，加入游戏动作及救生衣、鞋、足部包裹。人体、形态目标、骨骼、权重与眼睛使用 MakeHuman 的 CC0 图形数据，头发、衣物与动作由项目制作；固定来源版本与许可说明见[人物制作说明](../production/characters/README.md#输入与许可)。

[叶芮头像](characters/ye-portrait.png)：主人选定的 B 款二次元游戏立绘，由香蕉 `gemini-nano-banana-2.1` 参考主人提供、明确授权外发并确认为 GPT 生成的人像绘制。正式头像只做面部居中的方形裁切与缩放，供对话和人物资料共同使用；完整插画、参考原图与调用收据留在本地。按主人确认的范围，保留原有正式 3D 脸型与身体，不把插画转换成替换脸模。头像不代表实时穿着或身体状态。

`characters/lin.glb`、`xu.glb`、`zhou.glb`、`luo.glb`、`chen.glb`：其余五名正式成年 NPC；`player-<gender>-<appearanceAge>.glb`：玩家自选外观。各自包含独立人体形态、脸、头发、七类可独立显示的衣物与十种基础生活动作。人体图形数据使用与叶芮相同固定版本的 CC0 来源，造型、皮肤贴色、发型与动作由本项目离线制作，衣物沿用已认可款式并按各人体拟合。没有调用第三方绘图模型，没有使用私人照片贴图。

其余五名 NPC 的 `<key>-portrait.png` 由同一香蕉模型以 B 为画风参考分别绘制，不是模型实渲。林遥与许宁另以各自插画作编辑底图，仅修改发型：林遥为中分披肩直发，许宁为薄刘海与柔顺披发；两人的后发自然散落到肩背，不扎马尾。许宁的外在观感偏乖巧温软，不用高束发塑造外放利落的气质。两人的 3D 也只替换头发，保留原脸、人体、衣物和动作。叶芮已定稿的原侧分长卷发、头像与模型不动，三位男性保留原短发模型。原始插画与调用收据不打包。

玩家的 `player-<gender>-<appearanceAge>-portrait.png` 仍渲染自各自正式模型；用于自选外观辨识，不是实时衣着。实际阵容与外观档枚举以[人物目录](../character-catalog.json)为准，工序和许可详见人物制作说明。

## 动作库

GLB 内原有生活动作由项目制作。运行时的步行、待机、出拳与格挡改用 [Adobe Mixamo](https://www.mixamo.com/) 下载的动作，在本地转换为 `characters/motion-library.json`，通过游戏专用骨架适配嵌入角色表现，不改变已确认的模型。

| 游戏用途 | Mixamo 动作页面名称 | 本地源文件 |
| --- | --- | --- |
| 女性步行 | Feminine Walk Forward | `female-walk.fbx` |
| 男性步行 | Walking With A Swagger | `male-walk.fbx` |
| 呼吸待机 | Breathing Idle | `idle.fbx` |
| 出拳 | Jab Punch | `punch.fbx` |
| 格挡 | Blocking Body With Arms | `guard.fbx` |

以上均下载为不含人物皮肤的 FBX Binary、30 fps、无关键帧精简；转换移除水平根位移，只保留旋转差及归一化竖向起伏。原始 FBX 位于忽略的本地 `output/island-characters/mixamo-source`，不随仓库或游戏作为源素材分发。没有向 Mixamo 上传项目人物、参考照片或私有数据。

Mixamo 不是 CC0；使用范围以 [Adobe Mixamo FAQ](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html) 及其现行许可为准。这里的转换数据仅作为《荒岛》游戏组成部分，不作为可复用动作素材包出售或分发；项目自身许可不重新许可这些第三方动作。

拥抱姿态数据、牵手、亲吻、依偎及推搡/受击叠加由项目制作。双人接触使用各人原有模型和实际骨长求解，不使用网站上的陌生人物替代既有阵容。
