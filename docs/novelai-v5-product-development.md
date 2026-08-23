# NovelAI Diffusion V5 产品与开发规格

> 状态：已按本文边界实施，协议根据 2026-08-21 的 NovelAI 生产客户端和用户抓包核实；本文同时保留实施前基线，供审计迁移来源。
>
> 本文是 NovelAI V5 接入的产品、架构与验收基准。实施时不得把参数预设、提示词预设和模型能力合并成同一个状态。

本文使用以下状态标记：

- **已确认**：用户已裁定或有生产协议证据，实施不得自行改变。
- **实现约束**：由现有代码、数据安全或架构边界推导出的必要条件。

## 1. 产品结论

### 1.1 已确认

NovelAI V5 作为新增能力接入，不替代 V4.5，也不改变现有默认选择。

- 默认参数预设仍为 `默认 (V4.5 Full)`。
- 不自动创建、追加或删除任何参数预设。用户在现有参数预设中把模型切到 V5，或自行新建预设。
- 模型下拉新增 V5 Full 和 V5 Curated；用户可在任意参数预设中修改模型。
- 参数预设仍由用户手动选择，不根据 Prompt、聊天或场景自动切换。
- 提示词预设仍由用户独立手动选择，可新增、修改、删除；切换参数预设不得自动切换提示词预设。
- 当前画图模型是模型能力的唯一事实来源。`{$tagGuide}` 根据当前参数预设的 `params.model` 自动解析，不由提示词预设决定。
- V5 使用独立的请求构造、stream 传输和 MessagePack 响应解析；V3/V4/V4.5 保持现有链路。
- 选择 V5 后应实际使用其自然语言、自由角色定位、更多角色、交互和文字描述能力，而不只是换一个模型 ID。
- V5 参数区新增 `Transparent BG` 勾选项；启用时自动追加 `transparent background`，并发送透明背景协议参数。该开关属于参数预设，不属于提示词预设。
- V5 的默认质量词由官方 Quality Standard 与 UC Heavy 提供。`positivePrefix` 与 `negativePrefix` 属于用户预设内容，代码不会因切换模型而改写；把 V4.5 预设切到 V5 的用户如果保留了原有 V4.5 质量词表，需要自行清空以免与官方预设重复。
- 本期同时在 V5 UI 开放 Quality `standard / light / none` 与 UC `heavy / light / humanFocus / furryFocus / none`。
- 提示词预设不再保存或编辑 `tagGuideContent`；V4.5 与 V5 分别使用 Provider 内明确命名的静态指南。旧持久化副本在一次性迁移中退出当前数据模型，不建立长期备份或兼容壳。

## 2. 名词与所有权

| 概念 | 当前存储 | 所有者 | 选择方式 | V5 规则 |
| --- | --- | --- | --- | --- |
| 参数预设 | `paramsPresets[]` | 用户 | 用户手动选择 | 不新增初始预设；用户在自己的预设中切换模型，内容仍可编辑、复制、导入、导出和删除 |
| 提示词预设 | `promptPresets[]` | 用户 | 用户独立手动选择 | 不与参数预设绑定，不因模型变化自动切换 |
| 当前画图模型 | 当前参数预设的 `params.model` | 用户选择，代码解释 | 随参数预设或模型下拉变化 | 决定请求协议、参数版本、模型指南和坐标契约 |
| 模型能力 | 代码中的静态定义 | NovelAI Provider | 不持久化选择副本 | 按精确模型 ID 查表，不能由可删除的用户预设承载 |
| 模型提示词指南 | `TAG编写指南-V4.5.md` / `提示词编写指南-V5.md` | NovelAI Provider | 自动 | `{$tagGuide}` 按当前模型解析为 V4.5 或 V5 指南 |
| 模型提交契约 | Provider 静态资源 + 共享 Tool Schema | NovelAI Provider / Scene Planner | 自动 | 位于用户规则之后，声明当前模型的 center 类型、角色上限等不可覆盖的协议 |
| 用户场景规则 | 提示词预设 | 用户 | 随提示词预设手动切换 | 原样保留并继续生效，但不能覆盖当前模型提交契约或 Tool Schema |
| Transparent BG | 当前参数预设的 `params.transparentBackground` | 用户 | 用户手动勾选 | 仅精确 V5 模型启用；决定透明后缀和请求参数 |

### 2.1 不允许的耦合

- 不在参数预设中保存 `promptPresetId`。
- 不在提示词预设中保存“当前模型”或 V5 transport 选择。
- 不因用户选择 V5 参数预设而替他切换提示词预设。
- 不通过预设名称判断模型；名称可由用户任意修改。
- 不通过 Prompt 内容猜测 V5；只识别精确模型 ID。
- 不把 `{$tagGuide}` 的模型选择结果持久化为第二份事实。
- 不从 Prompt 中是否已有 `transparent background` 反推勾选状态；开关值是唯一事实来源。

## 3. 实施前基线

### 3.1 参数预设

V5 接入前，`modules/draw/providers/novelai/novel-draw.js` 内置两个参数预设：

- `默认 (V4.5 Full)`
- `3D 风格 (V4.5 Full)`

两者的 `params.model` 都是 `nai-diffusion-4-5-full`。用户通过 `selectedParamsPresetId` 手动选择，预设中的模型、正负向固定词、尺寸、采样器和数值参数都可修改。

当时模型下拉只有 V4.5 Full、V4.5 Curated、V4 Full、V3、Furry V3 和自定义模型，没有 V5。

### 3.2 提示词预设

提示词预设通过 `selectedPromptPresetId` 独立选择，当前包含：

- System Prompt
- TAG 编写指南
- 场景计划规则

当时默认 TAG 指南来自 `modules/draw/providers/novelai/TAG编写指南.md`，内容明确面向 V4.5。

`modules/draw/providers/novelai/novel-prompts.js` 的固定请求结构包含 `{$tagGuide}`。当时启动流程会读取 V4.5 指南，将实际文本填入提示词预设的 `tagGuideContent`；构造 Scene Planner 请求时再把该文本放入 `{$tagGuide}`。

因此当前行为不是模型感知的：即使用户把参数预设改成其他模型，Scene Planner 仍可能收到 V4.5 指南。

### 3.3 Scene Planner 契约

当前 `submit_scene_plan` Tool Schema 要求每个角色的 `center` 为 `A1` 至 `E5` 的字符串。默认 `scene-rules.md` 也写死了 5x5 网格规则。

这适合现有 V4.5 路径，但不能表达 V5 的任意归一化坐标。

此外，`sceneRules`、`topSystem` 和 `tagGuideContent` 当时持久化在每个提示词预设中。旧 `PROMPT_TEMPLATE_VERSION` 迁移会按默认预设名称覆盖这些字段；名称不能证明内容仍是系统默认，因此 V5 迁移不得沿用这种判定。旧默认 `topSystem` 明确写有 V4.5、严格 TAG 和已经淘汰的原文 anchor 约束，旧 `sceneRules` 还包含 5x5、配角合并和固定 Tag 配额等模型相关文本；两者都必须按冻结历史格式迁移，不能继续注入 V5 请求。

### 3.4 请求与响应

当前 NovelAI 请求链路：

```text
POST /ai/generate-image
Content-Type: application/json
响应：ZIP 或直接图片字节
```

当前所有非 V3 模型都按 `params_version: 3` 构造，不能直接通过新增模型下拉支持 V5。

## 4. 已确认的 V5 外部协议

### 4.1 模型 ID

| 展示名称 | 模型 ID | 本期范围 |
| --- | --- | --- |
| NAI Diffusion V5 Full | `nai-diffusion-5-full` | 支持 |
| NAI Diffusion V5 Curated | `nai-diffusion-5-curated` | 支持 |
| V5 Full Inpainting | `nai-diffusion-5-full-inpainting` | 不在本期范围 |
| V5 Curated Inpainting | `nai-diffusion-5-curated-inpainting` | 不在本期范围 |

### 4.2 请求端点与格式

官方生产客户端对 V5 使用：

```text
POST https://image.novelai.net/ai/generate-image-stream
Authorization: Bearer <token>
Body: multipart/form-data
```

multipart 中的 JSON 字段为：

```text
name="request"
Content-Type: application/json
```

浏览器必须让 `FormData` 自动生成 multipart boundary，不得手写 `Content-Type`。

请求根对象：

```json
{
  "input": "...",
  "model": "nai-diffusion-5-full",
  "action": "generate",
  "parameters": {},
  "use_new_shared_trial": true
}
```

V5 的 `parameters.stream` 固定为 `msgpack`，`params_version` 固定为 `4`。

### 4.3 官方默认参数

| 参数 | 默认值 |
| --- | --- |
| `params_version` | `4` |
| `width` | `832` |
| `height` | `1216` |
| `scale` | `7` |
| `sampler` | `k_euler_ancestral` |
| `steps` | `23` |
| `n_samples` | `1` |
| `noise_schedule` | `karras` |
| `ucPresetId` | `heavy` |
| `qualityPresetId` | `standard` |
| `use_coords` | `true` |
| `legacy` | `false` |
| `legacy_uc` | `false` |
| `autoSmea` | `false` |
| `cfg_rescale` | `0` |
| `normalize_reference_strength_multiple` | `true` |
| `straight_alpha` | `true` |
| `tag_hint_transparent_background` | 参数默认态为 `false`；关闭时出站请求删除该字段 |

`tag_hint_qt` 与 `tag_hint_uc_preset` 不是 V5 请求必填项。官方客户端在它们不是数字时会删除；本期没有对应产品设置，不应虚构或持久化这两个字段。

除预设可编辑值与 seed 外，V5 `generate` 的出站 payload 还应固定包含下列生产协议字段：

| 参数 | 值 |
| --- | --- |
| `dynamic_thresholding` | `false` |
| `controlnet_strength` | `1` |
| `legacy` / `legacy_v3_extend` / `legacy_uc` | `false` |
| `add_original_image` | `true` |
| `normalize_reference_strength_multiple` | `true` |
| `inpaintImg2ImgStrength` | `1` |
| `deliberate_euler_ancestral_bug` | `false` |
| `prefer_brownian` | `true` |
| `image_format` | `png` |
| `stream` | `msgpack` |

V5 还固定发送 `parameters.use_coords: true`、`parameters.v4_prompt.use_coords: true` 与 `parameters.v4_prompt.use_order: true`，包括零角色和全部角色位于中心的请求。`v4_negative_prompt.legacy_uc` 固定为 `false`；每个 `characterPrompts[]` 条目固定包含 `enabled: true`。这些字段不得复用旧构造器中“存在偏心角色才启用坐标”的条件逻辑。

组装后的整图正向 Prompt 必须同时写入根级 `input` 与 `parameters.v4_prompt.caption.base_caption`；组装后的整图负向 Prompt 必须同时写入 `parameters.negative_prompt` 与 `parameters.v4_negative_prompt.caption.base_caption`。两对值不得各走一套拼接逻辑。

### 4.4 Character Prompt 与坐标

V5 继续发送 `characterPrompts`、`v4_prompt` 和 `v4_negative_prompt`。字段名保留 `v4_` 不代表只适用于 V4。

每个启用角色的位置使用归一化浮点坐标：

```json
{
  "center": { "x": 0.308, "y": 0.254 }
}
```

同一坐标同时出现在：

- `characterPrompts[].center`
- `v4_prompt.caption.char_captions[].centers[]`
- `v4_negative_prompt.caption.char_captions[].centers[]`

坐标范围为 `0` 至 `1`，左上为 `(0, 0)`，右下为 `(1, 1)`。

### 4.5 Transparent BG

用户在 V5 Full、Quality None、UC None 下启用官方 `Transparent BG` 后，生产请求确认出现以下变化：

- 最终 `input` 与 `v4_prompt.caption.base_caption` 的自动后缀包含 `transparent background`；在本次无 Quality 后缀、无 `Text:` 块的抓包中，它位于 Prompt 最末尾。
- `parameters.tag_hint_transparent_background` 为 `true`。
- 同一请求包含 V5 固定参数 `parameters.straight_alpha: true`，输出格式为 PNG；该字段并非 Transparent BG 开关产生。

官方生产 bundle 同时确认：V5 参数默认包含 `tag_hint_transparent_background: false`，但出站清理会删除关闭状态的该字段；透明背景 UI 的提示是向 Prompt 添加 `transparent background`；透明后缀会排在 Quality 后缀之前。由此，本项目的组装规则固定为：

```text
普通 base prompt
  + transparent background（仅开关开启）
  + Quality suffix（非 none）
  + Text: 块（如有；前述自动后缀整体放在第一个 Text: 之前）
```

示例：

```text
Transparent BG + Quality None:
<base>, transparent background

Transparent BG + Quality Standard:
<base>, transparent background, very aesthetic, masterpiece, no text
```

请求参数契约：

| 开关 | `tag_hint_transparent_background` | `straight_alpha` | 自动 Prompt 后缀 |
| --- | --- | --- | --- |
| 关闭 | 不发送 | `true` | 无 |
| 开启 | `true` | `true` | `transparent background` |

该能力本期只对两个精确 V5 模型 ID 开放。切换回非 V5 模型时不得发送 `tag_hint_transparent_background`、不得追加透明后缀，也不得改写用户保存的固定正向词；`straight_alpha` 是 V5 固定字段，同样不得进入旧请求。

### 4.6 MessagePack 流

HTTP response body 是连续二进制帧。每帧结构为：

```text
4 字节无符号大端长度 N
N 字节 MessagePack 对象
```

官方客户端逐帧调用 MessagePack decoder，并按 Map 读取字段。

最终事件：

```js
{
    event_type: 'final',
    image: Uint8Array,
    samp_ix: Number,
}
```

中间事件：

```js
{
    event_type: 'intermediate',
    image: Uint8Array,
    samp_ix: Number,
    step_ix: Number,
}
```

错误事件：

```js
{
    event_type: 'error',
    message: String,
    samp_ix: Number,
}
```

本期只消费 `final` 和 `error`。不展示 intermediate 预览，不为它新增 UI 或持久状态。

## 5. V5 官方 Quality 与 UC

### 5.1 Quality Preset

V5 Full 与 Curated 使用相同定义：

| ID | 追加到 base prompt 的文本 |
| --- | --- |
| `standard` | `very aesthetic, masterpiece, no text` |
| `light` | `very aesthetic, amazing quality, no text` |
| `none` | 不追加 |

默认是 `standard`。质量文本只追加到 base prompt，不追加到角色 Prompt；如果 base prompt 包含 `Text:` 块，质量文本必须放在第一个 `Text:` 之前。Transparent BG 同时启用时，透明后缀位于 Quality 文本之前，顺序以 §4.5 为准。

现有 UI 只有“质量增强：开启/关闭”。V5 模型下改成三项选择：

```text
Standard -> qualityPresetId = standard
Light    -> qualityPresetId = light
None     -> qualityPresetId = none
```

非 V5 模型仍显示并使用原有开关，不改变旧请求协议。

### 5.2 UC Preset

V5 Full 与 Curated 都提供以下 ID：

| V5 UI | V5 `ucPresetId` |
| --- | --- |
| Heavy | `heavy` |
| Light | `light` |
| Human Focus | `humanFocus` |
| Furry Focus | `furryFocus` |
| None | `none` |

`furryFocus` 仅在 V5 模型下显示；非 V5 模型继续使用原有四项 UC 下拉。

V5 官方 UC 文本：

```text
heavy:
lowres, artistic error, film grain, scan artifacts, worst quality, bad quality, jpeg artifacts, very displeasing, chromatic aberration, dithering, halftone, screentone, multiple views, logo, too many watermarks, negative space, blank page

light:
lowres, bad hands, bad anatomy, artistic error, sepia, white haze, worst quality, very displeasing, jpeg artifacts, 0::ai-generated::

furryFocus:
{worst quality}, distracting watermark, unfinished, bad quality, {widescreen}, upscale, {sequence}, {{grandfathered content}}, blurred foreground, chromatic aberration, sketch, everyone, [sketch background], simple, [flat colors], ych (character), outline, multiple scenes, [[horror (theme)]], comic

humanFocus:
lowres, artistic error, film grain, scan artifacts, worst quality, bad quality, jpeg artifacts, very displeasing, chromatic aberration, dithering, halftone, screentone, multiple views, logo, too many watermarks, negative space, blank page, @_@, mismatched pupils, glowing eyes, bad anatomy

none:
不追加 UC preset 文本。
```

对于 V5 Full，启用非 `none` UC 且正向 Prompt 不含 `nsfw` 时，官方客户端会在整图负向 Prompt 前添加 `nsfw, `。V5 Curated 不添加。

用户的“负向固定”继续保留，并与官方 UC 文本组合；角色自己的 `uc` 只进入对应角色的负向 Prompt。

整图负向的确定顺序是：V5 Full 条件性 `nsfw` 前缀、所选 UC preset 的 `prefix`、用户负向固定词。空项不产生多余逗号；最终结果一次写入 §4.3 的两个整图负向字段。

### 5.3 参数预设中的存储形状

当前参数预设持久化的是旧模型使用的 `qualityToggle: boolean` 和 `ucPreset: 0 | 1 | 2 | 3`。V5 的选项集合不同，新增两个模型族专属字段：

- `v5QualityPresetId: 'standard' | 'light' | 'none'`
- `v5UcPresetId: 'heavy' | 'light' | 'humanFocus' | 'furryFocus' | 'none'`

旧字段继续只构造 V3/V4/V4.5 请求，新字段只构造 V5 请求。模型切换时 UI 切换显示对应字段，但不覆盖另一模型族的保存值，因此来回切换不会丢选择。导入、导出、复制参数预设必须原样往返四个字段。

旧预设首次升级时若缺少 V5 字段，执行一次确定映射：

```text
qualityToggle true / false -> v5QualityPresetId standard / none
ucPreset 0 / 1 / 2 / 3     -> v5UcPresetId heavy / light / humanFocus / none
```

无法识别的导入值回退到 V5 官方默认 `standard` / `heavy`，并在导入结果中明确提示，不能静默映射成其他有效选项。

## 6. V5 模型能力

### 6.1 自然语言与标签

V5 支持自然语言和标签，标签能力没有退出。

V5 模型指南应要求 Scene Planner：

- 静态身份和稳定外貌可以继续使用简洁标签。
- 动作、空间关系、多人互动、画面布局和文字样式优先使用清晰自然语言。
- 不把现有用户固定正向词改写或删除。
- 不强制把所有 Prompt 转成自然语言。
- 不自动插入与场景无关的新标签。

### 6.2 自由角色定位

V5 Tool Schema 中的 `center` 使用对象：

```json
{
  "x": 0.5,
  "y": 0.5
}
```

V5 模型指南负责解释坐标语义；Tool Schema 负责限制 `x`、`y` 均为 `0..1`。不能继续要求模型输出 `A1-E5` 后再伪装成自由定位。

V3/V4/V4.5 继续使用现有 `A1-E5` Schema，避免行为回归。

### 6.3 更多角色

NovelAI 官方 V5 页面明确标注每个场景最多 22 个角色。

- V5 Tool Schema 的绝对 `maxItems` 为 22。
- 参数预设中的“每张图最大角色数”仍是用户限制，`0` 表示不额外指定。
- 用户限制大于 22 时，V5 实际上限仍为 22。
- 参数编辑区的角色数输入在 V5 下允许到 22；非 V5 保持现有限制，不用 HTML 中写死的 `max=10` 截断 V5 保存值。
- 不要求 Scene Planner 为了利用能力而主动增加角色数量。
- 非 V5 模型保持当前数量行为，本期不顺带修改。

### 6.4 文字与新标签

V5 模型指南应覆盖：

- 文字内容、样式和位置可使用自然语言描述。
- 官方支持最长约 750 个文字字符，但 Scene Planner 不应无理由生成大段文字。
- `depthness`
- `attractive male`
- `low complexity`
- `medium complexity`
- `high complexity`
- `ultra complexity`
- `has alpha`
- `transparent background`
- `alpha transparency`
- `meta:novel era`
- `meta:golden era`
- `visual novel art`
- `visual novel bg`
- `visual novel cg`
- `visual novel chibi`
- `visual novel sprite`

这些是可选表达能力，不是每张图的默认追加词。

## 7. 产品交互

### 7.1 参数预设

首次安装时的参数预设顺序：

1. `默认 (V4.5 Full)`，继续默认选中。
2. `3D 风格 (V4.5 Full)`。

V5 不引入任何初始参数预设：

- 首次安装与升级都不追加 V5 预设，也不改写现有预设的字段。
- 用户要用 V5，就在现有参数预设中把模型切到 V5 Full 或 V5 Curated，或者自己新建一个预设。
- 因此不存在“用户删掉 V5 预设后被重新创建”的问题，也不需要“是否已有 V5 预设”的一次性检测。

切到 V5 模型后，该预设需要用户自行确认的字段：

| 字段 | 说明 |
| --- | --- |
| `positivePrefix` / `negativePrefix` | 沿用预设中已有的值；若原为 V4.5 质量词表，建议清空 |
| `params.model` | `nai-diffusion-5-full` 或 `nai-diffusion-5-curated` |
| `params.v5QualityPresetId` | 未设置时由 `qualityToggle` 推导：`false` → `none`，否则 `standard` |
| `params.v5UcPresetId` | 未设置时由 `ucPreset` 推导：`0/1/2/3` → `heavy/light/humanFocus/none`，无法识别则 `heavy` |
| `params.transparentBackground` | 未显式为 `true` 时一律 `false` |
| `params.qualityToggle` / `params.ucPreset` | 保留原值，供该预设切换回旧模型时使用 |
| 尺寸 / Steps / CFG / Sampler / Scheduler | 832×1216 / 23 / 7 / Euler Ancestral / Karras |

### 7.2 模型下拉

新增：

```text
NAI V5 Full    -> nai-diffusion-5-full
NAI V5 Curated -> nai-diffusion-5-curated
```

选择模型只修改当前参数预设的 `params.model`，不得切换提示词预设。

### 7.3 Transparent BG

- 参数编辑区新增 `Transparent BG` 勾选项，保存到当前参数预设的 `params.transparentBackground`。
- 默认关闭；复制、导入、导出参数预设时与其他参数一起处理。
- 只有当前模型为 V5 Full 或 V5 Curated 时可用；其他模型隐藏或禁用，但不得删除预设中保存的值，以便用户切回 V5。
- 开关只影响最终请求组装，不修改 Scene Planner 输出、不写回固定正向词，也不触发提示词预设切换。
- 预览最终 Prompt 时必须展示系统追加后的真实顺序，避免 UI 显示与请求不一致。

V5 模型下，同一区域同时显示三态 Quality 和五态 UC。切换到非 V5 模型时恢复旧 Quality 开关与四态 UC；两组字段各自保留值。

### 7.4 提示词预设

- 提示词预设下拉继续完全手动。
- 参数预设和提示词预设不建立联动关系。
- 用户可以为同一个 V5 参数预设选择任意 System Prompt/场景规则预设。
- 用户可以删除任何提示词预设，只保留现有“至少一个”的约束。
- `{$tagGuide}` 的实际模型指南由当前 `params.model` 决定，不随提示词预设切换。

### 7.5 模型指南显示

当前“TAG 编写指南”编辑区混合了模型内置规则和用户预设数据，实施时删除这个编辑入口并拆清来源。

终态实现约束：

- 页面只读显示当前模型自动选中的指南，明确标注文件名与 `V4.5` 或 `V5`。
- 内置模型指南只读，避免用户误以为它属于可删除预设。
- 用户可编辑的创作要求继续放在提示词预设的 System Prompt 与场景规则中；内置模型指南不再提供自定义覆盖入口。
- 切换参数预设或修改模型下拉后，指南预览立即更新；提示词预设选择保持不变。
- 模型提交契约与 Tool Schema 不作为可编辑预设展示；它们属于运行时协议。

## 8. Prompt 组装终态

```text
用户手动选择的提示词预设
        │
        ├── System Prompt
        └── 用户场景规则

当前参数预设 params.model
        │
        ▼
代码持有的模型能力表
        │
        ├── {$tagGuide} 的内置模型指南（两份明确命名的 Provider 静态文件）
        ├── 用户规则之后的内置模型提交契约
        └── submit_scene_plan center Schema / 角色硬上限

最终顺序
        │
        ├── 内置模型指南
        ├── 用户场景规则
        ├── 内置模型提交契约（后出现，冲突时优先）
        └── Tool Schema（最终校验）
```

请求时的解析顺序：

1. 读取当前参数预设，取得精确 `params.model`。
2. 读取用户当前手动选择的提示词预设。
3. 根据模型能力表选择内置 TAG 指南、模型提交契约、center Schema 和角色绝对上限。
4. 将模型指南注入固定的 `{$tagGuide}` 槽位。
5. 注入用户的 System Prompt、场景规则、世界书、角色和正文。
6. 在用户场景规则之后追加不可编辑的当前模型提交契约，明确它覆盖用户规则中的旧坐标或角色合并指令。
7. 构造对应模型的 `submit_scene_plan` Tool Schema。
8. 校验 Tool 参数并在契约边界转换为统一图片任务。

默认 `topSystem` 与 `topSystemPov` 必须是模型无关的场景规划身份，只描述 Scene Planner、Tool 提交和第一人称视角等跨模型职责；不得出现 V4.5、V5、严格 TAG、旧 anchor 或具体坐标格式。模型差异只能来自当前模型指南、模型提交契约与 Tool Schema。`assistantDoc` 等固定串同样使用“当前模型提示词指南”而非“TAG 指南”措辞。

模型提交契约必须足够短，只承载协议事实：`center` 形状、坐标语义、角色绝对上限，以及“每名角色独立提交，不按旧 5x5 规则合并”。自然语言写法、标签建议等留在模型指南；用户创作偏好留在提示词预设。这样即使某个旧自定义 `sceneRules` 仍提到 A1-E5，最终契约和 Tool Schema 也不会被它改变。

未知或自定义模型保持现有 V4.5 指南与 5x5 Schema，避免改变已有自定义模型行为。只有两个精确 V5 ID 启用 V5 能力。

## 9. 内部数据边界

新增模型能力定义建议位于 NovelAI Provider 内，例如：

```js
{
    id: 'nai-diffusion-5-full',
    family: 'v5',
    paramsVersion: 4,
    transport: 'msgpack-stream',
    tagGuide: 'v5',
    positioning: 'normalized-coordinate',
    maxCharacters: 22,
    transparency: true,
}
```

该定义是静态代码，不持久化到用户设置。

`promptPresets[] + selectedPromptPresetId` 是用户提示词配置的唯一持久化事实。现有 `customPrompts` 只是活动预设的重复副本，V5 配置迁移时从 Provider 持久化白名单删除；设置页尚未保存的编辑草稿只活在 iframe 当前运行内，Prompt 预览和实际请求都从选中预设加本次草稿显式构造，不再双写或双读 `customPrompts`。

图片任务内部应把角色位置规范为单一坐标对象：

```js
{ x: Number, y: Number }
```

`scene-plan-contract.js` 不认识 NovelAI 模型 ID，只接受 Provider 传入的契约选项，例如 `centerMode: 'grid' | 'normalized'` 和最终 `maxCharactersPerImage`：

- `grid`：Tool Schema 仍要求 `A1-E5`，校验通过后立即转换为 `{x,y}`。
- `normalized`：Tool Schema 要求 `{x,y}`，两个值都是有限数且在 `0..1`，校验后原样规范化。
- 未传选项时保持 `grid`，SD WebUI、ComfyUI 和非 V5 NovelAI 的外部契约不变。

V5 的最终角色上限先在 Provider 计算：用户值为 `0` 时取 22，用户值大于 0 时取 `min(用户值, 22)`；共享 Scene Planner 只接收这个已解析的数值。

旧网格转换必须保持现有映射：A-E / 1-5 分别对应 `0.1 / 0.3 / 0.5 / 0.7 / 0.9`。转换完成后，`task.chars[].center` 只有坐标对象这一种内部类型；请求构造层不得同时处理字符串和对象。

这项共享契约变化必须同步更新所有消费者：

- `modules/draw/shared/draw-common.js`：不再对已经规范化的 `center` 调用 `gridToCoord`。
- `modules/draw/providers/novelai/novel-draw.js`：删除本地重复的 `gridToCoord`，直接透传规范化坐标。
- SD WebUI 与 ComfyUI 的 `assembleCharacterPrompts` 调用链：确认继续接受坐标对象，且 Prompt 文本行为不变。
- `scene-plan-contract`、SD、ComfyUI 和 NovelAI 的行为测试：共同锁定旧网格映射与 V5 自由坐标。

## 10. 传输层终态

### 10.1 端点解析

`apiBaseUrl` 是用户数据，可能保存根地址、旧完整端点或新完整端点。迁移不得改写其持久值；每次请求按目标 transport 解析：

| 用户保存值 | 旧 ZIP 请求目标 | V5 stream 请求目标 |
| --- | --- | --- |
| 空 | `https://image.novelai.net/ai/generate-image` | `https://image.novelai.net/ai/generate-image-stream` |
| `https://host/base` | `https://host/base/ai/generate-image` | `https://host/base/ai/generate-image-stream` |
| `https://host/ai/generate-image` | 原样 | 将末尾精确替换为 `/ai/generate-image-stream` |
| `https://host/ai/generate-image-stream` | 将末尾精确替换为 `/ai/generate-image` | 原样 |

只替换 URL pathname 末尾的精确端点，不对域名、查询参数或中间路径做字符串猜测。前端是当前端点与请求协议的唯一所有者：直连使用解析结果，后端发送则先把相对地址解析为完整 HTTP(S) URL。`/v2/generate-image`、`/v2/test` 与 V5 stream 入口只接收最终 URL 和前端构造的 payload，后端不再追加路径或识别模型协议。正式线已发布的 `/v1/generate-image` 与 `/v1/test` 冻结为 v1.0.1 兼容入口；新前端只在 v2 返回 404 时为旧模型回退一次，停止支持 v1.0.1 后整组删除。

### 10.2 前端直连

V5：

1. 构造 `FormData`。
2. 将请求 JSON 作为 `application/json` Blob 添加到 `request`。
3. POST 到 `/ai/generate-image-stream`。
4. 先检查 HTTP status；非 2xx 按受限大小读取 JSON/文本错误，并沿用 401/402/429 等现有错误分类，不进入 MessagePack parser。
5. 对 2xx body 按长度前缀切分流。
6. MessagePack 解码每个完整帧。
7. 收到 `error` 立即使用事件中的 `message` 失败。
8. 收到目标 `samp_ix` 的 `final` 后提取图片字节。

目标样本固定为 `samp_ix === 0`。`final.image` 必须是非空 `Uint8Array`、不超过图片大小上限，并通过 PNG 文件签名校验；缺失字段、错误样本或非 PNG 字节都明确失败。首个合法 `final` 即为终态，成功取得后立即取消并释放 reader，不继续读取后续事件。

MessagePack 解码使用锁定版本的成熟浏览器 ESM 依赖（`@msgpack/msgpack`），以本地 decode-only 模块随扩展分发并保留许可证，不从 CDN 运行时加载，也不为本协议手写不完整 decoder。该模块只在 V5 上游接受请求并开始返回流后动态加载，V4.5 不下载它；包装层只暴露本功能需要的 `decode(frame)`，将 MessagePack map 统一成普通字段读取，并要求 `bin` 解码为 `Uint8Array`；测试直接使用真实编码帧而非伪造已解码对象。

### 10.3 后端转发与版本门槛

`1.1.0` 首次加入 V5 stream；`1.2.0` 新增 `/v2/generate-image` 与 `/v2/test`，将当前端点解析和连接探针构造收回前端，移除后端的第二份 V5 报文与 URL 规则。V3/V4/V4.5 后端发送仍可通过冻结的 v1 入口兼容 `1.0.1`；V5 要求插件至少为 `1.2.0`，且 `/status` 的 `capabilities` 明确包含 `v5-msgpack-stream`。版本或能力不足时在请求前明确提示升级，前端直连不受此限制。

后端插件负责：

- 接收本地 JSON 包装中的 key、已解析的完整 `url` 和前端构造的 payload。
- 在服务端构造官方 multipart 请求。
- 将上游二进制流原样转发给浏览器。
- 上游非 2xx 时保留 HTTP status，并在响应大小上限内转发 JSON/文本错误；不得包装成伪 MessagePack 200 响应。
- 传播取消、超时和连接错误。

前端和后端模式共用同一个 MessagePack 帧解析器，不能各自实现一套事件语义。

### 10.4 安全与限制

- 不记录 Bearer Token、multipart 原文或完整响应二进制。
- 后端插件沿用现有最多 5 次重定向限制；只有同源重定向可以继续携带 Bearer Token，跨源跳转必须移除 Authorization。浏览器直连继续使用 Fetch 原生重定向和敏感请求头策略，不手写 multipart 重放，也不声称能实施后端的 5 次限制。
- 流缓存必须有总大小和单帧大小上限。
- 不完整长度头、不完整帧、非法 MessagePack、未知事件和无 final 结束都必须返回明确错误。
- 用户取消时立即取消 reader 和上游请求。
- 本期 `n_samples` 固定为 1；解析器仍按 `samp_ix` 校验，不猜测样本顺序。

## 11. 预计代码范围

| 文件/区域 | 改动 |
| --- | --- |
| `novel-draw.js` | V5 参数预设、Quality/UC 与旧指南迁移、模型能力解析、V5 payload、Transparent BG、transport 分流、端点解析、后端能力检查 |
| `novel-draw.html` | V5 模型选项、V5 Quality/UC、Transparent BG、旧指南只读备份、角色数上限提示、模型指南预览 |
| `novel-prompts.js` | 按模型解析 `{$tagGuide}`，追加不可编辑模型提交契约，不改变提示词预设选择 |
| `TAG编写指南-V4.5.md` | 由现有指南明确改名，保留 V4.5 TAG 规则 |
| `提示词编写指南-V5.md` | V5 自然语言、坐标、多人、文字和新标签规范 |
| `top-system.md` / `top-system-pov.md` | 改为模型无关默认 System Prompt，删除版本、严格 TAG 和旧 anchor 表述 |
| `scene-plan-contract.js` | 接受通用 center mode；在校验边界把 grid / normalized 输入统一成坐标对象 |
| `draw-common.js`、NovelAI 本地组装器 | 接受已规范化坐标，移除重复 `gridToCoord` |
| `scene-planner.js` | 透传通用契约选项和绝对角色上限，不识别 NovelAI 模型 ID |
| `scene-rules.md` | 新默认内容移除模型绑定的固定 5x5、角色合并和 Tag 配额协议 |
| `novel-image-response.js` 或相邻模块 | 长度帧读取、MessagePack 解码、final/error 处理 |
| `package.json` / `package-lock.json` / 本地 `libs` | 锁定并分发 `@msgpack/msgpack` 浏览器 ESM 与许可证，不使用 CDN |
| `server-plugin/littlewhitebox-image-jobs/providers/novelai` | NovelAI transport 由通用图片任务插件所有；v2 仅传输完整 URL 与请求报文，v1 冻结为正式线兼容入口 |
| `cloud-presets.js` | 参数预设格式升级为 V2，完整往返数量限制与 V5 字段；V1 只在导入边界转换 |
| Assistant file manifest | 源码完成后最后重建 |

V5 领域代码留在 `modules/draw/providers/novelai/`。共享 Scene Planner 只接受必要的坐标契约参数，不认识 NovelAI 模型 ID。

## 12. 数据迁移

### 12.1 参数预设

提升 NovelAI `CONFIG_VERSION`，执行一次性迁移：

- 保留所有现有参数预设及其顺序、ID、名称和修改内容。
- 保留 `selectedParamsPresetId`，不能把升级用户切到 V5。
- 不追加、不删除任何参数预设。
- 所有旧预设缺少 V5 专属字段时，按 §5.3 从旧 Quality/UC 值一次性派生 `v5QualityPresetId` / `v5UcPresetId`，并将 `transparentBackground` 规范化为 `false`；不得根据 Prompt 文本反推。
- 迁移完成后写入新版本。

参数预设导入导出格式升级为 `novel-draw-preset` V2，必须完整保存 `positivePrefix`、`negativePrefix`、`maxImages`、`maxCharactersPerImage` 与全部当前 `params`。冻结的 V1 格式只在导入边界转换；缺少的数量限制取 `0`，V5 专属字段按 §5.3 确定迁移，未知版本明确拒绝。云端预设和本地文件共用同一解析器，不得各自维护一套默认值。

### 12.2 提示词预设

终态不再把内置模型指南或模型提交契约当作提示词预设的数据。提示词预设只持久化 ID、名称、`topSystem`、`sceneRules`；现有 ID、名称、选中项和删除能力保持不变。重复的根级 `customPrompts` 同期退出持久模型。

`topSystem` 与 `sceneRules` 迁移采用冻结旧格式的精确比较，不看预设名称、不做自然语言清洗：

- 为所有仍支持直接升级的已发布 Prompt 模板版本保存完整真实 settings fixture，其中冻结对应 `topSystem`、`topSystemPov` 与 `sceneRules`；不能只保存 V5 发布前最后一版孤立文本。
- 只统一 CRLF/LF 后与任一受支持 fixture 完全相等的 `topSystem` / `sceneRules`，一次性替换为新的模型无关默认内容。
- 任一处不同都视为用户内容，原样保留；不得通过正则删除 A1-E5、角色合并或 Tag 配额段落。
- 不再用 `PROMPT_TEMPLATE_VERSION` 按“默认-完整规则”等名称批量覆盖现有用户预设。精确命中已发布默认内容的字段由版本迁移采用当前模板；用户编辑过的字段只有显式点击“恢复默认”才会被替换。
- 运行时总在用户 `sceneRules` 之后注入 §8 的模型提交契约，因此保留下来的旧指令不能改变 Tool Schema 或 V5 center 类型。

现有 `tagGuideContent` 无论内容为何都不再属于提示词预设：迁移保存成功后删除该字段，运行时只认两份 Provider 静态指南，不保留 fallback、备份或双读。迁移保存失败时继续使用完整旧设置并禁止进入半迁移运行态，不能先改内存缓存再报告成功。

`{$tagGuide}` 从此只来自当前模型能力表：V4.5 和未知模型使用内置 V4.5 指南，两个精确 V5 模型使用内置 V5 指南。

提示词模板导入/导出在边界升级为当前格式 `_version: 2`：

```json
{
  "_type": "novel-draw-prompt-template",
  "_version": 2,
  "topSystem": "...",
  "sceneRules": "..."
}
```

冻结的 `_version: 1` 格式包含 `tagGuideContent`。导入 V1 时忽略该字段并明确提示“模型指南现由插件按模型提供，旧 TAG 指南未导入”；不得重新填入当前模型指南。V2 只接受上述当前字段，未知版本明确拒绝。

## 13. 最少必要测试

### 13.1 稳定契约

- 默认选中仍为 V4.5 Full。
- 首次安装与升级都不产生 V5 参数预设，预设数量与当前选中项不变。
- 旧预设切到 V5 模型时，V5 Quality/UC 由旧 `qualityToggle` / `ucPreset` 派生，`transparentBackground` 为 `false`。
- 参数预设与提示词预设继续独立手动选择。
- 相同提示词预设下，V4.5 模型注入 V4.5 指南，V5 模型注入 V5 指南。
- 删除或改名任意用户预设不影响模型能力解析。
- 只有与受支持真实 fixture 完全相同的旧 `topSystem` / `sceneRules` 会升级；任意用户修改都原样保留，且模型提交契约位于其后。
- 旧 `tagGuideContent` 与重复 `customPrompts` 在迁移成功后退出数据模型；迁移保存失败时完整旧设置仍可重试，不出现半迁移缓存。
- 提示词模板 V1 的 `tagGuideContent` 被忽略并产生明确提示，V2 无损往返当前字段，未知版本拒绝。
- 参数预设 V1 通过冻结转换器进入 V2；V2 完整往返图片数、角色数和全部 V5 字段，未知版本拒绝。
- V5 与旧模型的 Quality/UC 字段独立往返；切换模型、复制和导入导出不会覆盖隐藏字段，非法导入值产生明确提示。
- 旧网格坐标仍映射为 `0.1 / 0.3 / 0.5 / 0.7 / 0.9`，SD WebUI 与 ComfyUI 的可观察 Prompt 行为不变。
- V4.5 请求 body、端点和 ZIP 解析保持原行为。

### 13.2 V5 请求

- Full/Curated 使用精确模型 ID。
- 使用 `/ai/generate-image-stream`、multipart `request` Blob、`params_version: 4`、`stream: "msgpack"` 和根级常量 `use_new_shared_trial: true`。
- V5 出站常量字段与 §4.3 完全一致；零角色与全居中角色请求的两层 `use_coords` 仍为 `true`、`use_order` 为 `true`，整图正向两处值相同，整图负向两处值相同。
- V5 inpainting ID、名称近似但不相等的 ID 和 `custom` 都不得启用 V5 transport、指南、自由坐标或透明参数。
- Quality 三项正确映射 `standard/light/none`，质量后缀只进入 base prompt 且位于 `Text:` 前。
- 所有 V5 请求固定发送 `straight_alpha: true`；Transparent BG 关闭时只是不发送 hint 和透明后缀，开启时发送 hint `true`，并分别断言根级 `input` 与 `v4_prompt.caption.base_caption` 只被自动追加一次透明后缀。
- Transparent BG 与 Quality 同时开启时，后缀顺序为 `transparent background` 后接 Quality；整个自动后缀位于首个 `Text:` 前。
- 参数预设保存值为 true 时切换到非 V5 模型，不发送透明字段、不追加透明后缀，也不改写固定正向词；切回 V5 后恢复开关值。
- UC 正确映射 `heavy/light/humanFocus/furryFocus/none`。
- Full 的负向顺序是条件性 `nsfw`、UC prefix、用户负向固定词；Curated 无条件性 `nsfw`，两者都跳过空项。
- 自由坐标同时进入三处 Character Prompt 结构。
- 角色数量最多 22，用户更小的限制优先。

### 13.3 V5 响应

- 一个网络 chunk 包含半个帧。
- 一个网络 chunk 包含多个帧。
- 长度头跨 chunk。
- intermediate 后收到 final。
- error 使用 `message` 文本失败。
- 流结束但没有 final。
- 帧超限、总响应超限、非法 MessagePack、错误 `samp_ix`、非二进制/空图片与非 PNG final。
- AbortSignal 在等待 reader 时取消。
- 使用 `@msgpack/msgpack` 编码 map/bin 的真实帧可解析为事件字段与 `Uint8Array` 图片，不把 mock 解码结果当作协议证明。

### 13.4 端点与后端插件

- 根 URL、旧完整端点、新完整端点分别解析到当前模型需要的唯一端点，且不改写存储值。
- 前端直连与后端发送使用相同的已解析 URL 结果。
- 插件 `1.0.1` 仍可通过一次明确的 v2→v1 fallback 承载 V3/V4/V4.5 后端发送；V5 不走该兼容入口，并在低于 `1.2.0` 时明确报版本过低。
- 插件 `1.2.0` 还必须声明 `v5-msgpack-stream` capability 才能走 V5 后端。
- V5 后端透传的 chunk 边界不影响前端公共帧解析器，取消会终止上游请求。
- 上游非 2xx 响应不进入 MessagePack parser，并保留可用于 401/402/429 分类的 status 与错误文本。
- 后端同源重定向保留 Authorization，跨源重定向移除 Authorization，超过 5 次失败；前端直连不实现自定义重定向重放。

不通过读取源码字符串或 bundle 文本断言功能存在；测试公开输入输出和可观察行为。

## 14. 人工验收

实现和自动测试完成后，使用已经重新签发的 NovelAI Token 做最少两次真实生成：

1. V5 Full：两个角色、两个不同自由坐标、Quality Standard、UC Heavy、Transparent BG 开启。
2. V5 Curated：自然语言场景、角色互动或带样式的短文字、Quality Light、UC Furry Focus。

验收内容：

- 两张图都能完成并进入现有画廊。
- 取消生成能停止请求。
- 失败时显示 NovelAI `error.message`，不显示二进制或泛化 ZIP 错误。
- 切回 V4.5 Full 后仍可生成。
- 切换参数预设不会改变提示词预设选中项。
- 同一提示词预设下，模型指南预览会随 V4.5/V5 模型自动变化。
- Full 请求预览中的自动后缀顺序正确，返回 PNG 确实含透明通道和透明像素；关闭 Transparent BG 后不再发送 hint 或透明后缀，但仍发送 V5 固定的 `straight_alpha: true`。

## 15. 非目标

- 不接入 V5 Inpainting。
- 不接入 Vibe Transfer 或 Precise Reference；NovelAI 官方说明它们尚未随 V5 首发提供。
- 不展示 intermediate 流式预览。
- 不新增自动模型选择。
- 不自动切换提示词预设。
- 不强制用户使用自然语言。
- 不修改 V4.5 默认模型、默认参数预设或既有请求协议。
- 不把 `use_new_shared_trial` 建成用户设置或额度业务。

## 16. 事实来源

- 用户在 NovelAI 官方网页完成 V5 Full 双角色自由定位生成时的脱敏请求结构。
- 用户在 NovelAI 官方网页启用 `Transparent BG` 后的 V5 Full 请求：确认 Prompt 末尾的 `transparent background`、`tag_hint_transparent_background: true` 与 `straight_alpha: true`。
- NovelAI 当前生产客户端 bundle：`https://novelai.net/_next/static/chunks/pages/_app-117396a69775d334.js`。
- NovelAI V5 官方页面：`https://novelai.net/v5`。
- NovelAI 公开 Swagger 仍只描述旧 `/ai/generate-image`，没有 V5、stream 或 MessagePack，视为滞后文档，不作为 V5 实现依据。

任何生产客户端 hash 变化都不自动推翻本规格；若实际协议变化，须以新的官方客户端证据更新本文和协议测试后再修改代码。
