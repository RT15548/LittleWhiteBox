# ComfyUI Tag 编写指南

## 核心原则

ComfyUI 的 prompt 更适合使用 Danbooru 风格 tag 和短英文视觉短语。请只描述画面里能看见的内容，把叙事文本转换成一个清晰的静态瞬间。

- 所有特征优先写成英文 tag：外貌、服装、动作、表情、场景、光影。
- 复杂互动可以用短英文短语补充，但不要写成长句。
- 不输出模型、采样器、VAE、LoRA、ControlNet、脚本、seed 等运行参数。
- 不输出通用质量词，例如 `masterpiece`, `best quality`, `highres`。这些由用户在「正向固定」里配置。
- 不输出整图 negative。负向由用户在「负向固定」和角色 `uc` 里配置。

## Tag 顺序

ComfyUI 对靠前 tag 更敏感。请按视觉重要性排序：

```text
主体数量 -> 身份/外貌 -> 服装状态 -> 动作/表情 -> 互动 -> 背景 -> 光影 -> 镜头
```

示例：

```text
1girl, solo, long hair, black hair, red eyes, white dress, sitting, looking down, bedroom, bed, moonlight, soft lighting, upper body
```

## 权重语法

使用 ComfyUI 常见权重语法：

- `(tag)`：轻微强调。
- `(tag:1.2)`：明确强调。
- `(tag:0.8)`：降低权重。
- `[tag]`：轻微降低。

权重只用于核心主体、关键动作、关键表情或关键服装状态。不要给每个 tag 都加权。

## 场景字段

`scene` 负责整张图的基础构图，而不是重复角色细节。

应包含：

- 分级与人数：`sfw`, `suggestive`, `nsfw`, `solo`, `duo`, `1girl`, `1boy`。
- 构图：`portrait`, `upper body`, `cowboy shot`, `full body`, `close-up`, `wide shot`。
- 视角：`from front`, `from side`, `from behind`, `from above`, `from below`, `pov`。
- 环境：不要只写 `indoors` 或 `outdoors`，要补具体地点和物件，如 `bedroom, bed, window`。
- 光影：`sunlight`, `moonlight`, `warm lighting`, `dim lighting`, `backlighting`, `rim light`。

## 角色字段

已录入角色不要重复输出 `type` 和 `appear`，但必须根据剧情输出当前图里的 `costume`, `action`, `interact`, `uc`, `center`。

未知角色必须包含：

- `type`：`girl`, `boy`, `woman`, `man`, `other`。
- `appear`：发长、发色、瞳色、身体特征等可见外貌。
- `costume`：当前服装与状态。
- `action`：一个静态瞬间的姿态、动作、表情、视线。

## 动作与互动

图片是静态瞬间，不要描述连续动作或因果过程。

常用姿态：

- `standing`, `sitting`, `kneeling`, `lying`, `leaning`, `squatting`

常用表情：

- `smile`, `blush`, `crying`, `surprised`, `angry`, `embarrassed`, `shy`, `half-closed eyes`

常用互动：

- `holding hands`, `hug`, `face to face`, `looking at another`, `hand on shoulder`
- 多角色方向不清时，用 `source#`, `target#`, `mutual#` 标明。

## 角色 uc 字段

`uc` 只写角色专属排除项，不写通用质量负面。

适合写入：

- 当前角色摘掉了眼镜：`glasses`
- 当前视角看不到眼睛：`visible eyes`
- 当前角色应悲伤：`smile, happy`
- 当前衣服已脱下或破损：排除仍完整穿着的互斥服饰

不适合写入：

- `bad anatomy`, `bad hands`, `worst quality`, `lowres`
- 大段负面模板
- 和角色无关的泛化排除

## 物理与构图检查

- 一只手不要同时做多个动作。
- 背面视角不要强调正面表情，除非是回头。
- `upper body` 不要强调脚、膝盖等通常看不到的部位。
- 每张图只选一个最强视觉瞬间，不要把一整段连续剧情塞进同一张图。

## 输出纪律

- 输出 YAML，不要 Markdown 代码块。
- anchor 必须尽量复制原文 5-15 个字，最好到标点结束。
- tag 使用英文逗号分隔。
- tag 用空格，不用下划线，除非是明确的角色 canonical tag。
- 总量保持紧凑：整张图组装后约 50-80 个 tag。
