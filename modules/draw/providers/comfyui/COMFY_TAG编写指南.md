# ComfyUI Tag 编写指南

## 核心原则

ComfyUI 使用与 SD WebUI 相同的 **Danbooru 风格 tags** 和短英文视觉短语。只描述画面里能看见的内容。

- 所有特征优先写成英文 Danbooru tags：外貌、服装、动作、表情、场景、光影
- Tag 之间用英文逗号 `,` 分隔，tag 内部用空格（如 `long hair` 而非 `long_hair`）
- 不输出模型、采样器、VAE、LoRA、ControlNet、节点配置、seed 等参数
- 不输出通用质量词：`masterpiece`, `best quality`, `highres` 等由用户在「正向固定」配置
- 不输出整图 negative 字段；只允许在角色 `uc` 中写当前角色专属排除项，通用负向由用户在「负向固定」配置

---

## 权重语法

ComfyUI 支持多种权重语法，取决于所用节点：

**CLIP Text Encode 常用语法：**
```text
(tag)        → 轻微强调 (~1.1x)
(tag:1.2)    → 明确强调
(tag:0.8)    → 降低权重
```

**部分自定义节点支持：**
```text
tag++        → 强调
tag--        → 降低
```

权重只用于核心主体、关键动作、关键表情或关键服装状态。

---

## Tag 顺序

靠前的 tag 权重更高。按视觉重要性排序：

```text
主体数量 → 身份/外貌 → 服装状态 → 动作/表情 → 互动 → 背景 → 光影 → 镜头
```

示例：
```text
1girl, solo, long hair, black hair, red eyes, white dress, sitting, looking down, bedroom, bed, moonlight, soft lighting, upper body
```

---

## 外貌特征 (静态 Tags)

**头发：**
- 长度: `short hair`, `medium hair`, `long hair`, `very long hair`
- 发型: `ponytail`, `twintails`, `braid`, `messy hair`, `ahoge`, `side ponytail`
- 颜色: `blonde hair`, `black hair`, `silver hair`, `gradient hair`, `multicolored hair`

**眼睛：**
- 颜色: `blue eyes`, `red eyes`, `heterochromia`, `purple eyes`
- 特征: `slit pupils`, `glowing eyes`, `closed eyes`, `half-closed eyes`, `crying`

**皮肤：**
- `pale skin`, `tan`, `dark skin`, `dark-skinned female`
- 细节: `freckles`, `mole`, `blush`, `sweat`

**身材：**
- `petite`, `slim`, `curvy`, `muscular`
- `large breasts`, `medium breasts`, `small breasts`, `flat chest`

---

## 场景字段规则

`scene` 负责整张图的基础构图，不要重复角色细节。

**必须包含：**
- 分级与人数: `sfw`, `nsfw`, `solo`, `duo`, `1girl`, `1boy`, `1girl 1boy`, `2girls`
- 构图: `portrait`, `upper body`, `cowboy shot`, `full body`, `close-up`, `wide shot`
- 视角: `from front`, `from side`, `from behind`, `from above`, `from below`, `pov`
- 环境: 不要只写 `indoors`，要补具体地点和物件，如 `bedroom, bed, window, curtains`
- 光影: `sunlight`, `moonlight`, `warm lighting`, `dim lighting`, `backlighting`, `rim light`

---

## 角色字段规则

**已录入角色（已知角色）：**
- 不要输出 `type` 和 `appear`（系统自动注入）
- 必须输出: `costume`, `action`, `interact`, `uc`, `center`

**未知角色：**
- 必须输出所有字段: `type`, `appear`, `costume`, `action`, `interact`, `uc`, `center`

---

## 动作与表情

图片是静态瞬间，不要描述连续动作。

**姿态：**
- `standing`, `sitting`, `kneeling`, `lying`, `leaning`, `squatting`, `crouching`

**表情：**
- `smile`, `blush`, `crying`, `surprised`, `angry`, `embarrassed`, `shy`, `half-closed eyes`
- `open mouth`, `closed mouth`, `tongue out`, `drooling`

**视线：**
- `looking at viewer`, `looking away`, `looking down`, `looking up`, `looking at another`

**互动（多角色时）：**
- `holding hands`, `hug`, `kiss`, `face to face`, `hand on shoulder`
- 方向不清时用前缀: `source#动作`, `target#动作`, `mutual#动作`
- 在 ComfyUI 中，`interact` 仍然会作为角色 prompt 的普通 tags 并入最终正向提示词，不是 NovelAI 专属能力

---

## NSFW 精确术语

使用精确的解剖学术语，不要模糊描述。

**标签：** 必须添加 `nsfw` 标签

**身体部位：** `penis`, `vagina`, `anus`, `nipples`, `erection`, `clitoris`, `testicles`, `pussy`

**横截面/断面图：** `cross section`, `internal view`, `x-ray`

**性行为：** `sex`, `vaginal`, `anal`, `oral`, `fellatio`, `cunnilingus`, `paizuri`, `handjob`

**体位：** `missionary`, `doggystyle`, `mating press`, `cowgirl position`, `deepthroat`, `spooning`

**液体/细节：** `cum`, `cum in pussy`, `cum on face`, `cum on body`, `creampie`, `sweat`, `saliva`, `drooling`

---

## 角色 uc 字段

`uc` 是角色级排除项，会并入最终负向提示词；只写当前角色专属排除，不写整图 negative 或通用质量负面。

**适合写入：**
- 当前角色摘掉了眼镜: `glasses`
- 当前视角看不到眼睛: `visible eyes`
- 当前角色应悲伤: `smile, happy`
- 衣服已脱下或破损: 排除仍完整穿着的互斥服饰

**不适合写入：**
- `bad anatomy`, `bad hands`, `worst quality`, `lowres`（这些由用户负向固定配置）

---

## 物理与构图检查

- 一只手不要同时做多个动作
- 背面视角不要强调正面表情（除非回头）
- `upper body` 不要描述脚、膝盖等看不到的部位
- 每张图只选一个最强视觉瞬间

---

## 输出纪律

- anchor 必须复制原文 5-15 个字，最好到标点结束
- tags 用空格不用下划线（除非是角色 canonical tag 如 `hatsune_miku`）
- 总量保持紧凑：整张图组装后约 50-80 个 tag
