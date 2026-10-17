# 余火资源打包

本目录只在作者侧运行，玩家不需要额外安装工具。人物模型流程见 [characters](characters/README.md)。

## 聊天气泡分层图

`crop-performers.py` 用 Pillow 读取原始 420×495 分层图，按非透明内容裁切并保留一像素滤波边界，以最高质量 WebP 输出，不缩放人物像素。它同时生成 `performance/sprites.ts`，将文件 URL、裁切前坐标和实际尺寸作为同一份资源定义；`artwork.ts` 引用它并把原动画支点换算到裁切后的图片坐标。

```powershell
python modules/xiaobai-os/apps/game/expedition/production/crop-performers.py `
  output/ember-original-layers `
  modules/xiaobai-os/apps/game/expedition/assets/performance `
  modules/xiaobai-os/apps/game/expedition/performance/sprites.ts
```

原始分层图保留在本地制作目录，不上传。不要把已裁切图再次当原图处理。更新美术时一并重建图片和坐标表；检查所有表情、动作在手机横竖屏与桌面上的位置和边缘，再发布。这里优化的是解码面积，不以降低人物分辨率换取体积。

删除这项资源流程时，删除脚本和对应的图片、坐标表及 `DialogueActor.vue` 中的引用；没有持久化缓存或存档字段。
