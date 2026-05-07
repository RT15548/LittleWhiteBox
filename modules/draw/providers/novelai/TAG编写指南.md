---

# NovelAI V4.5 图像生成 Tag 编写指南

> **核心原则**：V4.5 采用 **混合式写法 (Hybrid Prompting)**。
> - **静态特征**（外貌、固有属性）使用 **Danbooru Tags** 以确保精准。
> - **动态行为**（动作、互动、空间关系）使用 **自然语言短语 (Phrases)** 以增强连贯性。
> - **禁止输出质量词**（如 `best quality`, `masterpiece`, `highres`），这些由系统自动添加。
> - **格式**：所有 Tag 使用**英文**，元素之间用英文逗号 `,` 分隔。

---

## 一、 V4.5 短语化描述 (Phrasing)

V4.5 能理解简短的**主谓宾 (SVO)** 结构和**介词关系**，用于描述动态行为。

### 推荐使用短语的场景
1. **复杂动作**: `drinking from a white cup`, `holding a sword tightly`
2. **空间关系**: `sitting on a wooden chair`, `leaning against the wall`
3. **属性绑定**: `wearing a red scarf and blue gloves` （避免 Tag 间混色）
4. **细腻互动**: `hugging him from behind`, `wiping tears from face`

### 禁止使用的语法
1. **否定句**: 禁止 `not holding`, `no shoes` — 模型无法理解否定。用反义词替代（如 `barefoot`）或忽略。
2. **时间/因果**: 禁止 `after bath`, `because she is sad` — 直接描述视觉状态 `wet hair, wrapped in towel`。
3. **长难句**: 禁止超过 10 个单词的从句 — 拆分为多个短语，逗号分隔。

---

## 二、 外貌特征速查 (静态 Tag)

外貌必须使用 Danbooru Tag，不可短语化。

**头发：**
- 长度: `short hair`, `medium hair`, `long hair`, `very long hair`
- 发型: `ponytail`, `twintails`, `braid`, `messy hair`, `ahoge`
- 颜色: `blonde hair`, `black hair`, `silver hair`, `gradient hair`

**眼睛：**
- 颜色: `blue eyes`, `red eyes`, `heterochromia`
- 特征: `slit pupils`, `glowing eyes`, `closed eyes`, `half-closed eyes`

**皮肤：**
- `pale skin`, `tan`, `dark skin`
- 细节: `freckles`, `mole`, `blush`

---

## 三、 场景深化

不要只写 `indoors` 或 `room`，必须补充具体环境物体：
- 室内: `bookshelf`, `curtains`, `window`, `bed`, `carpet`, `clutter`
- 室外: `tree`, `flower`, `cloud`, `road`, `building`, `rubble`
- 幻想: `magic circle`, `floating objects`, `glowing particles`, `ruins`
- 风格/色调: `anime screencap`, `illustration`, `thick painting`, `monochrome`, `high contrast`, `warm theme`, `cool theme`

---

## 四、 NSFW 精确术语

V4.5 对解剖学结构理解更强，必须使用精确术语，切勿模糊描述。

- **推荐添加**: `nsfw` 标签
- **身体部位**: `penis`, `vagina`, `anus`, `nipples`, `erection`, `clitoris`, `testicles`
- **性行为**: `oral`, `fellatio`, `cunnilingus`, `anal sex`, `vaginal sex`, `paizuri`
- **体位**: `missionary`, `doggystyle`, `mating press`, `straddling`, `deepthroat`, `spooning`
- **液体/细节**: `cum`, `cum inside`, `cum on face`, `creampie`, `sweat`, `saliva`, `heavy breathing`, `ahegao`
- **断面图**: `cross section`, `internal view`, `x-ray`

---

## 五、 负值权重 (特殊用法)

当需要**移除角色自带特征**或**反转概念**时，使用负值权重：

```
-1::glasses::    → 角色自带眼镜但本图不需要
-1::flat color:: → 平涂的反面 → 层次丰富的着色
1.5::tag1, tag2:: → 对多个 tag 同时调节权重
```

> 正值权重语法与应用规则将在后续输出格式指令中详述。

---

## 后续指令预告

具体的输出格式、Tag 语法规则和完整示例将在后续指令中给出，届时严格遵守。
