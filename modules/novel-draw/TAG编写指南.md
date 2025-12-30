# NOVEL 图像生成 Tag 编写指南（LLM 专用）

## 一、基础语法规则

### 1.1 格式规范
- Tag 之间使用 **英文逗号 + 空格** 分隔
- 示例：`1girl, flower field, sunset`
- 所有 Tag 使用英文

### 1.2 Tag 顺序原则
**越靠前的 Tag 影响力越大**，编写时应按以下优先级排列：
1. 核心主体（角色数量/性别）
2. 整体风格/艺术家
3. 品质 Tag
4. 外观特征（发型、眼睛、皮肤等）
5. 服装细节
6. 构图/视角
7. 场景/背景
8. 氛围/光照/色彩

---

## 二、核心 Tag 类别速查

### 2.1 主体定义

| 场景 | 推荐 Tag |
|------|----------|
| 单个女性 | `1girl, solo` |
| 单个男性 | `1boy, solo` |
| 多个女性 | `2girls` / `3girls` / `multiple girls` |
| 多个男性 | `2boys` / `multiple boys` |
| 无人物 | `no humans` |
| 混合 | `1boy, 1girl` |

> `solo` 可防止背景出现额外人物

### 2.2 头发描述

**长度：**
- `very short hair` / `short hair` / `medium hair` / `long hair` / `very long hair` / `absurdly long hair`

**发型：**
- `bob cut`（波波头）
- `ponytail` / `high ponytail` / `low ponytail`（马尾）
- `twintails`（双马尾）
- `bangs` / `blunt bangs` / `side bangs`（刘海）
- `braid` / `twin braids`（辫子）
- `curly hair`（卷发）
- `messy hair`（凌乱）
- `ahoge`（呆毛）

**颜色：**
- 基础：`black hair`, `blonde hair`, `brown hair`, `red hair`, `blue hair`, `pink hair`, `white hair`, `silver hair`, `purple hair`, `green hair`
- 特殊：`multicolored hair`, `gradient hair`, `streaked hair`

### 2.3 眼睛描述

**颜色：**
`blue eyes`, `red eyes`, `green eyes`, `brown eyes`, `purple eyes`, `yellow eyes`, `golden eyes`, `heterochromia`（异色瞳）

**特征：**
- `slit pupils`（竖瞳/猫眼）
- `glowing eyes`（发光）
- `closed eyes`（闭眼）
- `half-closed eyes`（半闭眼）

### 2.4 皮肤描述

**肤色：**
- `pale skin`（白皙）
- `fair skin`（浅肤色）
- `tan` / `tanned`（小麦色）
- `dark skin`（深色）
- `colored skin`（幻想色，需配合具体颜色如 `blue skin`）

**细节：**
`freckles`（雀斑）, `mole`（痣）, `mole under eye`（眼下痣）, `makeup`（化妆）

### 2.5 身体特征

**体型：**
`skinny`, `slim`, `curvy`, `muscular`, `muscular female`, `petite`, `tall`, `short`

**胸部（女性）：**
`flat chest`, `small breasts`, `medium breasts`, `large breasts`, `huge breasts`

### 2.6 服装

**原则：需要具体描述每个组成部分**

**头部：**
`hat`, `witch hat`, `beret`, `crown`, `hair ribbon`, `hairband`, `glasses`

**上身：**
`shirt`, `dress shirt`, `blouse`, `sweater`, `hoodie`, `jacket`, `coat`, `vest`, `dress`, `kimono`

**下身：**
`skirt`, `long skirt`, `miniskirt`, `pants`, `shorts`, `jeans`

**足部：**
`boots`, `high heels`, `sneakers`, `barefoot`, `thighhighs`, `pantyhose`, `socks`

**配饰：**
`scarf`, `necklace`, `earrings`, `gloves`, `bag`

**颜色/材质前缀：**
可在服装前加颜色或材质，如 `white dress`, `leather jacket`, `silk ribbon`

### 2.7 艺术风格与媒介

**数字媒介：**
- `anime screencap`（动画截图风格）
- `game cg`（游戏CG）
- `pixel art`（像素艺术）
- `3d`（3D渲染）
- `official art`（官方设定风格）

**传统艺术：**
- `realistic` / `photorealistic`（写实/照片级写实）
- `impressionism`（印象派）
- `art nouveau`（新艺术运动）
- `ukiyo-e`（浮世绘）
- `sketch`（素描）
- `lineart`（线稿）
- `watercolor`（水彩）

**年代风格：**
- `retro artstyle`（复古）
- `year 2014`（特定年份风格）

### 2.8 品质 Tag

**常用组合：**
```
masterpiece, best quality, very aesthetic, absurdres, ultra detailed
```

| Tag | 作用 |
|-----|------|
| `masterpiece` | 杰作级质量 |
| `best quality` | 最佳质量 |
| `high quality` | 高质量 |
| `very aesthetic` | 高美感 |
| `absurdres` | 超高分辨率 |
| `ultra detailed` | 极致细节 |

### 2.9 构图与取景

**取景范围：**
- `close-up`（特写）
- `portrait`（肖像/头肩）
- `upper body`（上半身）
- `cowboy shot`（到大腿）
- `full body`（全身）
- `wide shot`（远景）

**视角：**
- `from front`（正面）
- `from side`（侧面）
- `from behind`（背面）
- `from above`（俯视）
- `from below`（仰视）
- `dutch angle`（倾斜视角）
- `profile`（正侧面轮廓）

**特殊：**
- `multiple views`（多视图）
- `reference sheet`（角色设定图）

### 2.10 氛围、光照与色彩

**光照：**
- `cinematic lighting`（电影感光照）
- `volumetric lighting`（体积光）
- `backlighting`（逆光）
- `soft lighting`（柔光）
- `dramatic lighting`（戏剧性光照）
- `golden hour`（黄金时段光线）
- `bloom`（光晕）
- `bokeh`（焦外虚化）
- `lens flare`（镜头光晕）

**色彩风格：**
- `monochrome`（单色）
- `greyscale`（灰度）
- `sepia`（棕褐色调）
- `limited palette`（有限调色板）
- `high contrast`（高对比度）
- `flat color`（平涂）
- `vibrant colors`（鲜艳色彩）

**主题色：**
`blue theme`, `red theme`, `dark theme`, `warm colors`, `cool colors`

**氛围：**
`mysterious`, `serene`, `melancholic`, `joyful`, `dark`, `ethereal`

---

## 三、权重控制语法

### 3.1 增强权重

**花括号方式：**
```
{tag}      → 约 1.05 倍
{{tag}}    → 约 1.10 倍
{{{tag}}}  → 约 1.16 倍
```

**数值化方式（推荐）：**
```
1.2::tag::        → 1.2 倍权重
1.5::tag1, tag2:: → 对多个 tag 同时增强
```

### 3.2 削弱权重

**方括号方式：**
```
[tag]      → 削弱
[[tag]]    → 更强削弱
```

**数值化方式（推荐）：**
```
0.8::tag::  → 0.8 倍权重
0.5::tag::  → 0.5 倍权重
```

### 3.3 语法技巧
- `::` 可结束强调区域
- `::` 可自动闭合未配对的括号，如 `{{{{{tag ::`

---

## 四、从文本生成 Tag 的工作流程

### 步骤 1：识别核心要素
从描述中提取：
- 人物数量和性别
- 整体风格/氛围

### 步骤 2：提取外观特征
按顺序识别：
- 发型、发色
- 眼睛颜色/特征
- 肤色
- 体型

### 步骤 3：识别服装
分层描述：
- 头饰
- 上装
- 下装
- 鞋袜
- 配饰

### 步骤 4：确定构图
- 取景范围
- 视角
- 特殊构图需求

### 步骤 5：设定氛围
- 光照条件
- 色彩倾向
- 情感基调

### 步骤 6：添加品质和风格 Tag
- 品质 Tag
- 艺术风格（如需要）

### 步骤 7：组装并调整权重
- 按优先级排列
- 对重要元素增强权重
- 编写负面提示词

---

## 五、输出格式模板

```
主体, 品质Tag, 艺术风格, 发型, 发色, 眼睛, 皮肤, 体型, 服装细节, 构图, 场景, 光照, 色彩氛围

```

---

## 六、实例演示

### 输入描述：
> "一个有着长长银色头发和红色眼睛的神秘女巫，穿着黑色斗篷和尖顶帽，站在月光下的森林中，整体氛围阴郁而神秘"

### 输出 Tag：

```
1girl, solo, masterpiece, best quality, very aesthetic, witch, long hair, silver hair, red eyes, pale skin, witch hat, black cloak, black robe, full body, standing, forest, night, moonlight, dark atmosphere, mysterious, cinematic lighting, volumetric lighting, {{{dark theme}}}, high contrast
```

---

### 七、多角色互动前缀

多人场景里，动作有方向。谁主动、谁被动、还是互相的？用前缀区分：

**三种前缀：**
- `source#` — 发起动作的人
- `target#` — 承受动作的人
- `mutual#` — 双方同时参与

**举例：**

A 抱着 B：
```
A: source#hug
B: target#hug
```

两人牵手（没有谁主动谁被动）：
```
A: mutual#holding hands
B: mutual#holding hands
```

A 盯着 B 看：
```
A: source#staring
B: target#staring
```

**常见动作词：**

| 类型 | 动作 |
|------|------|
| 肢体 | hug, carry, push, pull, hold |
| 亲密 | kiss, embrace, lap pillow, piggyback |
| 视线 | eye contact, staring, looking away |

如果需要加权重，正常用 `::` 语法包裹整个标签即可。

---

### 八、负值权重

权重可以是负数。两个用途：

**1. 移除特定元素**

角色设定里自带眼镜，这张图不想要：
```
-1::glasses::
```

帽子挡脸了：
```
-1::hat::
```

**2. 反转概念**

画面太平太素，想要反效果：
```
-1::flat color::        // 平涂的反面 → 层次丰富
-1::simple background:: // 简单背景的反面 → 场景丰富
-1::monochrome::        // 单色的反面 → 色彩丰富
```

**和 Undesired Content 的区别：**

| 方式 | 特点 | 适合场景 |
|------|------|----------|
| 负值权重 | 精准、针对单个元素 | 移除某个具体东西、反转某个概念 |
| Undesired Content | 批量、一次列很多 | 整体风格控制、排除一类东西 |

---
## 九、注意事项

1. **具体优于抽象**：`blue pleated skirt` 优于 `skirt`
2. **避免冲突 Tag**：如同时使用 `short hair` 和 `long hair`
3. **肤色需明确指定**：不指定时默认倾向白皙
4. **服装描述要分层**：每个部件单独描述效果更好
5. **NSFW 场景必须明确**：如果场景涉及性内容，必须使用精确的标签，首先给上NSFW标签，然后：
   - 身体部位：`penis`, `anus`, `vagina`, `pubic_hair` 等
   - 性行为方式：`oral`, `fellatio`, `gokkun`, `anal sex`, `vaginal sex` 等
   - 体位：`missionary`, `doggystyle`, `mating_press`, `deepthroat` 等
   - 插入场景中：须添加 `cross section`, `X-ray` 展示体内透视效果
   - 进程阶段：`gently thrusting`, `hard thrusting`, `squirting`, `orgasm` 等
   - 射精相关：`cum inside`, `cum in uterus`, `stomach bulge`, `female_ejaculation` 等
   
   **切勿模糊描述**，NovelAI 需要具体的解剖学标签才能正确渲染。
