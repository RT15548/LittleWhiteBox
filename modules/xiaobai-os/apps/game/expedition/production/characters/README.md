# 余火场景人物

本目录拥有余火的离线人物网格与骨骼制作；不导入荒岛的领域代码或资产。当前样板为三娘，其身份、气质以[人物卡](../../../../../docs/expedition-cards/sanniang.md)为准，造型以 `assets/performance/sanniang-body.webp`、`sanniang-neutral.webp` 为参照。没有使用外部人体或第三方模型。

## 制作与输出

- `sanniang.py`：连续曲面、脸、侧分低盘发、立领短外衣与长衣摆、药袋及细节。场景模型保留固定服装轮廓，不声称把 AI 自由描述的穿着自动建模。
- `surface.py`：离线曲面与蒙皮、顶点色与材质合并。最终仅两种材质，不为每个颜色增加一次绘制；无运行时几何拼装。
- `rig.py`：骨架、连续衣摆权重、原地站立与行走片段。步幅随资产导出，游戏按移动距离推进动画，并限制追赶时的最高步频；世界位置不由动画改写。
- `build.py`：输出可编辑 `.blend`、独立 `.glb`，可选工作渲染。只接受新的输出目录，避免覆盖已经审过的版本。

从仓库根目录运行，Blender 是作者侧工具，玩家不需要安装：

```powershell
& 'D:/Blender/blender.exe' -b --factory-startup -t 4 --python-exit-code 1 `
  --python modules/xiaobai-os/apps/game/expedition/production/characters/build.py -- `
  --output output/ember-characters/new-sanniang --render
```

检查近景、背面、两侧迈步极限、真实营地及房间后，将输出 GLB 放入 `assets/characters/sanniang.glb`。制作场景、统计及截图留在本地 `output`，发布只使用 GLB，不打包制作依赖。

## 运行边界与验收契约

`presentation/sanniang-asset.ts` 拥有一个余火渲染器的资产加载、共享网格和材质；场景访问只持有克隆骨骼和混合器。`sanniang-person.ts` 只读实际人物位置、朝向和行走距离，不持久化状态。脚底按已蒙皮鞋面接地点贴地，不额外施加周期性上下抖动。可见近处人物动画上限 30 Hz，背景居民仍使用原节奏；离屏和暂停不更新人物动画。

- 人物尚未载入时，显示现有轻转场提示且不推进盲走；加载失败使用游戏的重新加载入口，不冒充成功或退回旧几何人。（代价：不可见移动、误导交互）
- 离场、重试或加载途中关闭时，只释放本次拥有的请求、实例、骨骼和资源，不能让迟到结果重新挂进已经离开的场景。（代价：资源泄漏、错误场景）
- 跟随、到房间等活动的位置和可交谈范围沿用世界状态；切图重新创建视觉实例不改剧情、好感、穿着文字或聊天记录。（代价：状态分叉、存档污染）

这些边界用真实资产的本地浏览器加载、取消、重试、反复切图检查；造型和步态用实际画面验收，不写源码字符串或文案断言。手机尺寸预览不代替真机性能测量。

删除时移除该目录、`assets/characters`、两个呈现文件及 `world-people.ts` / `scene.ts` 的注册；没有新增存档字段，不需要数据迁移。
