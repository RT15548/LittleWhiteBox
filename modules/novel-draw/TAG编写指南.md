---

# NovelAI V4.5 图像生成 Tag 编写指南

> **核心原则**：V4.5 采用 **混合式写法 (Hybrid Prompting)**。
> - **静态特征**（外貌、固有属性）使用 **Danbooru Tags** 以确保精准。
> - **动态行为**（动作、互动、空间关系）使用 **自然语言短语 (Phrases)** 以增强连贯性。
> - **禁止输出质量词**（如 `best quality`, `masterpiece`），这些由系统自动添加。

---

## 一、 基础语法规则

### 1.1 格式规范
- **分隔符**：所有元素之间使用英文逗号 `,` 分隔。
- **语言**：必须使用英文。
- **权重控制**：
  - 增强：`{{tag}}` 或 `1.1::tag::`
  - 减弱：`[[tag]]` 或 `0.9::tag::`

### 1.2 Tag 顺序原则
**越靠前的 Tag 影响力越大**，编写时应按以下优先级排列：
1. **核心主体**（角色数量/性别）—— *必须在最前*
2. **核心外貌**（发型、眼睛、皮肤等）
3. **动态行为/互动**（短语描述）
4. **服装细节**
5. **构图/视角**
6. **场景/背景**
7. **氛围/光照/色彩**

---

## 二、 V4.5 特性：短语化描述 (Phrasing)

V4.5 的重大升级在于能理解简短的**主谓宾 (SVO)** 结构和**介词关系**。

### ✅ 推荐使用短语的场景
1. **复杂动作 (Action)**
   - *旧写法*: `holding, cup, drinking` (割裂)
   - *新写法*: `drinking from a white cup`, `holding a sword tightly`
2. **空间关系 (Position)**
   - *旧写法*: `sitting, chair`
   - *新写法*: `sitting on a wooden chair`, `leaning against the wall`
3. **属性绑定 (Attribute Binding)**
   - *旧写法*: `red scarf, blue gloves` (容易混色)
   - *新写法*: `wearing a red scarf and blue gloves`
4. **细腻互动 (Interaction)**
   - *推荐*: `hugging him from behind`, `wiping tears from face`, `reaching out to viewer`

### ❌ 禁止使用的语法 (能力边界)
1. **否定句**: 禁止写 `not holding`, `no shoes`。模型听不懂“不”。
   - *修正*: 使用反义词，如 `barefoot`，或忽略该描述。
2. **时间/因果**: 禁止写 `after bath`, `because she is sad`。
   - *修正*: 直接描述视觉状态 `wet hair, wrapped in towel`。
3. **长难句**: 禁止超过 10 个单词的复杂从句。
   - *修正*: 拆分为多个短语，用逗号分隔。

---

## 三、 核心 Tag 类别速查

### 3.1 主体定义 (必须准确)

| 场景 | 推荐 Tag |
|------|----------|
| 单个女性 | `1girl, solo` |
| 单个男性 | `1boy, solo` |
| 多个女性 | `2girls` / `3girls` / `multiple girls` |
| 多个男性 | `2boys` / `multiple boys` |
| 无人物 | `no humans` |
| 混合 | `1boy, 1girl` |

> `solo` 可防止背景出现额外人物

### 3.2 外貌特征 (必须用 Tag)

**头发：**
- 长度：`short hair`, `medium hair`, `long hair`, `very long hair`
- 发型：`ponytail`, `twintails`, `braid`, `messy hair`, `ahoge` (呆毛)
- 颜色：`blonde hair`, `black hair`, `silver hair`, `gradient hair` (渐变)

**眼睛：**
- 颜色：`blue eyes`, `red eyes`, `heterochromia` (异色瞳)
- 特征：`slit pupils` (竖瞳), `glowing eyes`, `closed eyes`, `half-closed eyes`

**皮肤：**
- `pale skin` (白皙), `tan` (小麦色), `dark skin` (深色)
- 细节：`freckles` (雀斑), `mole` (痣), `blush` (脸红)

### 3.3 服装 (分层描述)

**原则：需要具体描述每个组成部分**

- **头部**：`hat`, `hair ribbon`, `glasses`, `animal ears`
- **上身**：`white shirt`, `black jacket`, `sweater`, `dress`, `armor`
- **下身**：`pleated skirt`, `jeans`, `pantyhose`, `thighhighs`
- **状态**：`clothes lift`, `shirt unbuttoned`, `messy clothes`

### 3.4 构图与视角

- **范围**：`close-up` (特写), `upper body`, `full body`, `wide shot` (远景)
- **角度**：`from side`, `from behind`, `from above` (俯视), `from below` (仰视)
- **特殊**：`dutch angle` (倾斜), `looking at viewer`, `looking away`, `profile` (侧颜)

### 3.5 氛围、光照与色彩

- **光照**：`cinematic lighting`, `backlighting` (逆光), `soft lighting`, `volumetric lighting` (丁达尔光)
- **色彩**：`warm theme`, `cool theme`, `monochrome`, `high contrast`
- **风格**：`anime screencap`, `illustration`, `thick painting` (厚涂)

### 3.6 场景深化 (Scene Details)

**不要只写 "indoors" 或 "room"，必须描述具体的环境物体：**
- **室内**：`messy room`, `bookshelf`, `curtains`, `window`, `bed`, `carpet`, `clutter`, `plant`
- **室外**：`tree`, `bush`, `flower`, `cloud`, `sky`, `road`, `building`, `rubble`
- **幻想**：`magic circle`, `floating objects`, `glowing particles`, `ruins`
- **质感**：`detailed background`, `intricate details`
---

## 四、 多角色互动前缀 (Interaction Prefixes)

多人场景里，动作有方向。谁主动、谁被动、还是互相的？**必须使用以下前缀区分**：

**三种前缀：**
- `source#` — 发起动作的人 (主动方)
- `target#` — 承受动作的人 (被动方)
- `mutual#` — 双方同时参与 (无主被动之分)

**举例说明：**

1. **A 抱着 B (单向)**：
   - A: `source#hugging her tightly` (使用短语描述细节)
   - B: `target#being hugged`

2. **两人牵手 (双向)**：
   - A: `mutual#holding hands`
   - B: `mutual#holding hands`

3. **A 盯着 B 看 (视线)**：
   - A: `source#staring at him`
   - B: `target#looking away` (B 没有回看)

**常见动作词参考：**

| 类型 | 动作 (可配合短语扩展) |
|------|------|
| 肢体 | `hug`, `carry`, `push`, `pull`, `hold`, `lean on` |
| 亲密 | `kiss`, `embrace`, `lap pillow`, `piggyback` |
| 视线 | `eye contact`, `staring`, `looking at each other` |

> **注意**：即使使用 V4.5 的短语能力（如 `hugging her tightly`），也**必须**保留 `source#` 前缀，以便系统正确解析角色关系。

---

## 五、 NSFW 场景特别说明

V4.5 对解剖学结构的理解更强，必须使用精确的解剖学术语，**切勿模糊描述**。

1. **必须添加**: `nsfw` 标签。
2. **身体部位**:
   - `penis`, `vagina`, `anus`, `nipples`, `erection`
   - `clitoris`, `testicles`
3. **性行为方式**:
   - `oral`, `fellatio` (口交), `cunnilingus`
   - `anal sex`, `vaginal sex`, `paizuri` (乳交)
4. **体位描述**:
   - `missionary`, `doggystyle`, `mating press`
   - `straddling`, `deepthroat`, `spooning`
5. **液体与细节**:
   - `cum`, `cum inside`, `cum on face`, `creampie`
   - `sweat`, `saliva`, `heavy breathing`, `ahegao`
6. **断面图**:
   - 如需展示体内，必须加 `cross section`, `internal view`, `x-ray`。

---

## 六、 权重控制语法

### 6.1 增强权重
- **数值化方式（推荐）**：
  ```
  1.2::tag::        → 1.2 倍权重
  1.5::tag1, tag2:: → 对多个 tag 同时增强
  ```
- **花括号方式**：`{{tag}}` (约 1.1 倍)

### 6.2 削弱权重
- **数值化方式（推荐）**：
  ```
  0.8::tag::  → 0.8 倍权重
  ```
- **方括号方式**：`[[tag]]`

### 6.3 负值权重 (特殊用法)
- **移除特定元素**：`-1::glasses::` (角色自带眼镜但这张图不想要)
- **反转概念**：`-1::flat color::` (平涂的反面 → 层次丰富)

---

## 七、 示例 (Example)

**输入文本**:
> "雨夜，受伤的骑士靠在巷子的墙上，少女正焦急地为他包扎手臂。"

**输出 JSON 参考**:
```json
{
"scene": "1girl, 1boy, night, rain, raining, alley, brick wall, dark atmosphere, cinematic lighting",
"characters": [
  {
    "name": "骑士",
    "costume": "damaged armor, torn cape, leather boots",
    "action": "sitting on ground, leaning against wall, injured, bleeding, painful expression, holding arm",
    "interact": "target#being bandaged"
  },
  {
    "name": "少女",
    "costume": "white blouse, long skirt, apron, hair ribbon",
    "action": "kneeling, worried expression, holding bandage, wrapping bandage around his arm",
    "interact": "source#bandaging arm"
  }
]
}
```