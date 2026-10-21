import{n as me}from"../shared/async-errors-C4kfchr9.js";import{r as Bo,t as Lo}from"../shared/scene-placement-BVMp_X_o.js";import{J as Je,k as Ro,x as Io}from"../shared/client-DxBm_3Yj.js";import{i as Cr,l as _o,r as Mo,s as Do,t as No}from"../shared/dexie-CLpqrnFC.js";import{p as Oo}from"../shared/reasoning-capabilities-uLAQtI7I.js";import{a as zo,c as pt,l as qo,n as Fo,o as jo,s as yt,u as Ho}from"../shared/protocol-CUaQaFly.js";import{i as Wo,r as Uo,t as Ko}from"../shared/context-tokens-DqS6K7Y8.js";import{a as Go,i as Yo,t as Xo}from"../shared/plan-ledger-BD8OkECf.js";import{r as Jo,t as Vo}from"../shared/settings-panel-Blu_-gpi.js";import{a as Pr,i as kt}from"../shared/message-markdown-DCm4ilJ0.js";import{i as Zo,n as Qo,r as en,t as tn}from"../shared/light-brake-91c-JgsZ.js";import{t as rn}from"../shared/provider-config-BgIgQSRp.js";import{a as on,i as gt,n as nn,r as an,t as sn}from"../shared/current-plans-C1dHmMq7.js";var ln="xb-ebook-root";var Vt=300*1e3,Zt=1e4,dn="book/",cn=["local/","scripts/","modules/","core/","shared/","libs/","user/","characters/","worlds/"];function Br(t=""){return String(t||"").trim().replace(/\\/g,"/")}function ht(t=""){const e=Br(t).replace(/^\/+/,"");return!e||e==="book"?dn:!e.startsWith("book/")||e.includes("\0")||e.includes("://")||/^[a-z]:/i.test(e)||e.split("/").some(r=>r==="..")?"":e.replace(/\/{2,}/g,"/")}function Ze(t=""){const e=ht(t);return e?e.endsWith("/")?e:`${e}/`:""}function he(t=""){const e=ht(t).replace(/\/+$/,"");return!e||e==="book"||cn.some(r=>e.startsWith(r)&&!e.startsWith("book/"))||!e.startsWith("book/")||!Yo(e)?"":e}function Ft(t="",{directory:e=!1}={}){const r=Br(t);return!r||!r.replace(/^\/+/,"").startsWith("book/")&&r.replace(/^\/+/,"")!=="book"?"book_path_required":r.includes("://")||/^[a-z]:/i.test(r)||r.split("/").some(o=>o==="..")?"book_path_forbidden":e?Ze(r)?"":"book_path_required":r.endsWith("/")?"book_file_required":he(r)?"":"unsupported_text_file"}function _e(t=""){const e=he(t);if(!e)throw new Error(Ft(t)||"book_path_required");return e}function De(t=""){const e=Ze(t);if(!e)throw new Error(Ft(t,{directory:!0})||"book_path_required");return e}function bn(t={}){if(!/^book\/chapters\/.+\.md$/.test(String(t.path||"")))return!1;const e=String(t.content||"").trim();return e?e!=="从这里开始写正文。":!1}function Lr(t=[]){return(Array.isArray(t)?t:[]).filter(e=>bn(e)).length}var Rr=Object.freeze([{path:"book/outline.md",content:`# 《书名》大纲

## 新书建档引导（建好后可删除）

> 欢迎开新书！不要一上来填完整大纲，也不要急着拆章节。先定这本书从哪里进入，再把故事立起来，再确认“我准备怎样写好这本书”，最后才进入全书卷结构和当前卷。

### 开书顺序

1. 第一轮：开书定位（读者承诺）
2. 第二轮：故事脊柱
3. 第三轮：欲望链 / 目标层级
4. 第四步：怎么写好这本书（执行方案确认）
5. 第五步：全书大纲与卷结构

### 第一轮：开书定位（读者承诺）

开书定位不是标签装饰，会直接影响：题材边界、读者预期、文风、节奏、尺度、冲突密度、日常比例、性场景功能、人物复杂度和审稿优先级。

1. 这本书给读者的类型/题材承诺是什么？
（提示：玄幻、末世、都市、女尊、种田、悬疑、恋爱、群像、异世界、社会实验……也可以是混合。）
（目的：确定读者预期和素材边界，用于决定主线压力类型、世界观写法和章节推进密度。）

2. 这本书给读者的主要阅读体验是什么？
（提示：爽、治愈、压抑、暧昧、慢热、黄暴、荒诞、孤独、温暖、心疼、危险、被珍视……）
（目的：确定基调、文风、节奏和尺度；后续写作不能一会儿生活流、一会儿任务闯关、一会儿纯福利。）

3. 最想看的核心看点/张力源是什么？
（提示：唯一男人、禁忌亲密、互相利用、救赎、养成、权力反转、陌生文明接纳、多人关系、身份误认……）
（目的：确定真正产戏的关系结构，决定性场景是否服务关系推进、女性角色是否必须有独立动机、世界观质感如何贯穿。）

4. 这本书的尺度与边界是什么？
（提示：性、暴力、黑暗、喜剧、虐、道德边界、绝对不写什么、哪些内容只能点到为止。）
（目的：提前确定创作底线，写入 style.md 与 review-rules.md，避免后续模型越界或忽然转调。）

5. 有没有参照/反参照？（可选）
（提示：像什么作品的味道；明确不像什么；喜欢哪种节奏，不喜欢哪种写法。）
（目的：给模型具体风格坐标。没有也可以跳过。）

### 第二轮：故事脊柱（定位成形后再问）

这一轮要压实的是：

- 主角/视角中心：读者主要跟着谁体验世界
- 起点状态：故事开始前，主角卡在什么旧日常、缺口和困境里
- 触发事件 / 为什么是现在：什么把老日子打破了
- 表面目标：主角会主动去做什么
- 深层欲望 / 内在缺口：主角真正想得到、证明、夺回、摆脱或成为什么
- 核心阻力 / 压力场：什么东西、人、制度、关系或性格在死死挡着他
- 赌注与代价：失败会失去什么，不行动会恶化什么，成功又必须牺牲什么
- 主线位移 / 结局方向：这本书最后大概要从什么变成什么

必要时再补问：

- 主角平时戴着什么面具
- 什么事或什么人会把这层面具撕碎
- 最重要的配角是谁，和主角形成什么关系结构
- 世界观和底线里，哪些是绝对不能踩的死规矩

### 第三轮：欲望链 / 目标层级

这一轮只做一件事：把结构来源压实。

- 终极欲望牵引全书
- 长期欲望牵引卷
- 中期欲望牵引事件集团
- 短期欲望分布在章节和场景

卷和事件集团不能凭空冒出来。先把主角想要什么拆成层级，再让全书结构从欲望链自然长出来。

### 第四步：怎么写好这本书（执行方案确认）

到这里先停，不要急着拆卷结构或逐章安排。你必须先向用户说明“我准备怎样写好这本书”，等待用户修正或确认，再写入 style.md。这个写法方案会决定全书卷结构、当前卷事件集团、场景密度、慢写位置、日常比例和切章呼吸点。这一步是卷结构和事件集团的前置条件。

至少说明：
- 叙事视角和距离：贴身、冷静、旁观、意识流、强感官、弱解释等
- 场景推进方式：事件推进、日常余波、关系试探、信息释放如何配比
- 慢写规则：哪些时刻必须拆阶段、跨场景或跨章节
- 情绪节拍：怎么避免平推，怎么安排得到/落空/确认/打断
- 冰山原则：哪些信息不能直接解释，要通过动作、误解、沉默和细节露出
- 禁止写法：哪些写法会让这本书跑偏

### 第五步：全书大纲与卷结构

前四步成立后，再进入“这本书整体怎么走”。这里只定全书骨架，不直接替当前卷拆每章。

- 先回答：这本书大概有几卷，每卷主题是什么
- 再回答：每卷对应哪一段长期欲望、承担哪次核心位移、主要压力场是什么
- 当前卷细部不要写在这里；当前卷事件集团骨架、当前可写方向和写后复盘，写到 \`book/volumes/001.md\`

---

## 大纲推进原则

- 全书先定骨架：开书定位、故事脊柱、欲望链、主线变化、关键阶段、结局方向、主要压力场和大致卷结构。
- 开书定位不是标签装饰，它会约束文风、节奏、尺度、冲突密度、日常比例、性场景功能和审稿优先级；故事脊柱必须在开书定位约束下生成。
- 全书大纲与当前卷规划分开保存：大纲里只保留全书骨架，当前卷细部见 \`book/volumes/001.md\`。
- 开书定位、故事脊柱、角色、世界和底线基本成形后，你必须先向用户说明“我准备怎样写好这本书”，等待用户修正或确认；这一步是卷结构和事件集团的前置条件，不要跳过它直接拆当前卷。
- 卷和事件集团不能凭空冒出来：先拆欲望链。终极欲望牵引全书；长期欲望牵引卷；中期欲望牵引事件集团；短期欲望分布在章节和场景里。
- 开书时要判断全书大概有几卷、每卷主题是什么、每卷承担哪一段长期欲望和核心位移；不要只盯着“下一章写什么”。
- 不推荐开书时一次性写完整细纲，尤其不要把全书每章都定死；当前卷也不要提前展开整卷章纲，只拆本卷中期欲望、事件集团和当前可写方向。
- 动笔阶段由用户逐章指挥：用户说这一章/这一段写什么、从哪开始、到哪停、核心发生什么，AI 才负责把它写成正文。
- 灵感、人物反应和结构修正会来自实际写作，也会来自每卷完成后的经验教训。
- 除非用户明确要求，优先细化当前卷事件集团和当前可写方向，不展开全书细章。
- 不做章纲，不自行拆分章节，不预排后续章节内容。每章写什么、从哪里开始、到哪里停，由用户当轮指挥决定。

---

## 开书定位

> 这本书从哪里进入。它不是分类标签，而是后续文风、节奏、尺度、冲突密度、日常比例、性场景功能和审稿标准的源头。

**类型/题材承诺**：
**读者体验承诺**：
**核心看点/张力源**：
**尺度与边界**：
**参照/反参照**：（可选）

**由开书定位决定的写法约束**：
- 文风：
- 节奏：
- 尺度：
- 冲突密度：
- 日常比例：
- 性场景功能：
- 审稿优先级：

---

## 故事脊柱

> 这本书到底怎么立起来。故事脊柱不是开书第一步，而是在开书定位成立后，对主角、欲望、阻力、代价和变化方向做结构压实。

**主角/视角中心**：
**起点状态**：
**触发事件 / 为什么是现在**：
**表面目标**：
**深层欲望 / 内在缺口**：
**核心阻力 / 压力场**：
**赌注与代价**：（失败会失去什么；不行动会恶化什么；成功又必须牺牲什么）
**主线位移 / 结局方向**：
**一句话总结**：（以上内容压成一句话）

---

## 欲望链 / 目标层级

> 卷和事件集团不能凭空规划。先把主角想要什么拆成层级：短期欲望推动场景，中期欲望形成事件集团，长期欲望形成卷，多个长期欲望共同逼近终极欲望。

**终极欲望**：（全书最后真正想得到、证明、夺回、摆脱或成为的东西）
**终极阻力**：
**终极代价**：

| 层级 | 欲望 / 目标 | 阻力 | 行动方向 | 结果 / 位移 | 对应结构 |
|------|-------------|------|----------|-------------|----------|
| 长期欲望 1 |  |  |  |  | 第一卷 / 阶段 |
| 中期欲望 1 |  |  |  |  | 事件集团 |
| 短期欲望 1 |  |  |  |  | 章节 / 场景 |

---

## 主线

> 全书最核心的长期变化，不是事件清单。

**起点**：
**终点**：
**核心变化**：（从___变成___）

**阶段**：
1.
2.
3.

---

## 支线

> 删掉会让主线少压力或对照的线。

| 支线 | 功能 | 起点 | 终点 | 服务主线的方式 |
|------|------|------|------|----------------|
|  |  |  |  |  |

---

## 卷结构

> 卷是长篇的推进单位，不只是章节容器。每一卷都由一个长期欲望牵引，并承担一次明确位移：局面、关系、认知或目标发生不可逆变化。

**卷数预估**：

### 第一卷：（卷名）

**本卷主题**：
**本卷牵引的长期欲望**：
**卷目标**：
**入卷状态**：
**出卷状态**：
**本卷核心位移**：（从___变成___）
**本卷主要压力场**：
**本卷结尾钩子/承接点**：

### 卷列表

| 卷 | 主题 | 长期欲望 | 入卷状态 | 出卷状态 | 核心位移 | 主要压力场 | 承接点 |
|----|------|----------|----------|----------|----------|------------|--------|
| 第一卷 |  |  |  |  |  |  |  |

---

## 卷规划索引

> 当前卷细部见 \`book/volumes/\`。

- 第一卷：\`book/volumes/001.md\`

---

## 待定

-`},{path:"book/volumes/001.md",content:`# 第一卷规划

> 当前卷要能直接进入写作，但这不是整卷章节工单。事件集团是叙事单位，章节只是用户指挥下的正文承载和呼吸点。

## 卷目标

**本卷主题**：
**本卷牵引的长期欲望**：
**入卷状态**：
**出卷状态**：
**本卷核心位移**：（从___变成___）
**本卷主要压力场**：
**本卷结尾钩子/承接点**：

---

## 卷内事件集团骨架

> 事件集团不是剧情块拼贴，而是中期欲望形成的压力场。只写欲望、入口、压力、关键阈值和出口；不要在这里展开每章章纲。

| 事件集团 | 中期欲望 | 入口状态 | 主压力 | 关键阈值 | 出口状态 |
|----------|----------|----------|--------|----------|----------|
| 1. |  |  |  |  |  |

---

## 当前可写方向

> 这里只记录本卷当前可以写向哪些压力场和人物处境，给用户逐章指挥时做参照；不要在这里替用户拆章纲。

| 方向 | 所属事件集团 | 当前欲望/压力 | 人物障碍 | 可写场景入口 | 用户确认状态 |
|------|--------------|----------------|----------|--------------|--------------|
| 1. |  |  |  |  | 待用户指挥 |

---

## 当前用户指挥记录

**对应方向**：
**所属事件集团**：
**用户本章/本段指挥**：
**起点**：
**停止点**：
**核心事件**：
**禁止偏离**：
**写后实际变化**：

---

## 写后复盘

> 写完后再记录实际发生了什么，不要在动笔前把它变成章节任务表。

### 最近章节

- 章节：
- 实际发生：
- 关系/状态变化：
- 新增伏笔：
- 时间线推进：
- 下一次需要承接：

`},{path:"book/style.md",content:`# 文风

## 本书基调

**一句话**：（这本书读起来是什么感觉）

**氛围关键词**：

**禁止出现的东西**：（不符合本书气质的写法、用词、情节类型）

---

## 怎么写好这本书

> 这一节不是让用户机械填表。开书定位、故事脊柱、角色、世界和底线基本成形后，你必须先基于已有资料提出一版执行方案，等待用户修正或确认，再沉淀到这里。全书卷结构和当前卷事件集团要在这一步之后形成；动笔阶段不做章纲，具体章节由用户逐章指挥。

### 执行方案确认

**我要交付的阅读体验**：

**我会用什么叙事视角和距离写**：

**我会怎样安排场景推进**：

**我会怎样处理日常、余波和生活质感**：

**我会怎样处理关系推进和重要时刻**：

**我会怎样释放信息，而不是直接解释**：

**我会怎样控制节奏密度与切章**：

**我会避免哪些跑偏写法**：

### 慢写硬规则

慢写不是把一场戏写长，也不是多加几百字描写。慢写是把一个不可逆时刻拆成连续阶段，必要时跨场景、跨章节推进。

重大关系位移不能在同一章内完成“靠近 -> 越界 -> 接受 -> 稳定”。至少要写出：
1. **发生前**：为什么靠近，为什么犹豫，环境如何施压
2. **临界前**：还有没有退路，谁先意识到越线
3. **动作中**：具体动作、身体反应、停顿、误解、试探
4. **动作后**：沉默、回避、补偿、重新定位
5. **余波**：下一章或后续日常里，这件事如何改变相处

### 章节观念

- 章节是连续流里的呼吸点。
- 章节不是任务。
- 一章里不需要“完成”任何事。
- 写作时先跟着人物、场景和压力走，写到自然呼吸点再切章；切完后再回头记录这一章实际走到了哪里。

### 场景推进纪律

- 每一场都要知道：这一场主要推进什么，余波留给什么，下一场靠什么接上。
- 主线推进之后，要主动留出人物生活、关系摩擦、身体体验和世界观体感。
- 当前章节里允许慢，允许停，允许绕，但不能空心平移。

---

## 通用叙事规则

### 经验复现，不是事件记录

不要只回答"发生了什么"，要回答：
- 人物当时看见、听见、摸到什么
- 这个瞬间如何被身体感知
- 人物如何理解这一刻
- 这一刻之后，人物、关系或认知哪里变了

### 不可逆动作必须慢写

做了就回不去的动作，不能一笔带过，必须拆成连续阶段、连续小动作和后续余波：
- 第一次靠近
- 第一次触碰禁区
- 第一次说出不能撤回的话
- 第一次看见不该看的东西

### 关键动作三层法

每个关键动作必须同时写：
1. **物理事实**：哪只手、什么距离、什么质感、轻重急慢
2. **主观感受**：呼吸、温度、肌肉、视线、身体先于理智的反应
3. **关系后果**：更近还是更远、谁失去体面、之后还能不能装原样

### 情绪变成行为

少写抽象情绪，多写情绪如何泄露：
- 把擦干净的桌子又擦一遍
- 回消息删了三次，最后只发一个"嗯"
- 笑了一下，但没接话

### 高潮是认知确认

高潮不是大事发生，是人物终于确认了一件事：
- 我回不去了
- 他不是我以为的那个人
- 我必须承认我想要

### 章节不是任务

章节不是“完成剧情点”的工单。写作时先跟着人物、场景和压力走，写到自然呼吸点再切章。
- 认识、靠近、牵手、亲密、背叛、杀人、掌权、告别都不能为了赶进度塞进一章
- 一个重要时刻可以写很多章，只要每一章都让体验、关系或认知自然推进
- 章末位移是写完后回头记录：这一章实际走到了哪里，不是开写前必须达成的目标

### 事件推进前先还生活债

连续推进主线后，要主动补人物在世界里的生活、日常摩擦、身体经验、独处思考和关系余波。人物不是任务执行器，必须有自己的误解、判断、习惯、犹豫和小创造。

### 回看关系位移

切章后回头看，人物关系应当至少出现一个微小变化：更近、更远、多一个秘密、少一层信任、某个谎言更难维持。不要为了制造“位移”压缩事件。

---

## 情绪起伏转折

**积极 \`[+]\`**：得到、满足、确认、爽、安心
**消极 \`[-]\`**：失去、落空、风险、恐惧、打断

每一句话都应该有情绪，不以道德观判断句子情绪，禁止连续三段以上同极性平推，即使在极端场景里也可以通过 POV 的转换将相同内容转换句子情绪。

---

## 本书专用规则

（这里写只属于这本书的特殊规定，例如：）

- 某角色绝对不会主动做某事
- 某种场景必须怎么处理
- 某个词/称呼有特殊含义
- 性场景/暴力场景的尺度边界`},{path:"book/characters.md",content:`# 角色

## 主角

### （名字）

**基本信息**：
- 年龄：
- 身份：
- 外貌：（几句话，抓特征）

**她是什么样的人**：
（一段话，表面特征）

**她为什么是这样**：
（一段话，成因。不是贴标签，是解释这个人怎么长成这样的）

**她想要什么 / 害怕什么**：

**她的习惯模式**：
（她遇到压力时怎么反应、她怎么保护自己、她说什么话其实意味着什么）

**什么能打动/击穿她**：
（她的破防点，什么情况下她的壳会裂开）

**说话方式**：
（口头禅、语气、举例）

**写她时记住**：
（一两句话的提醒，例：她的脚永远在动）

---

## 主要角色

### （名字）

**基本信息**：
**与主角的关系**：
**在故事中的功能**：
**她是什么样的人**：
**她为什么是这样**：
**习惯模式**：
**写她时记住**：

---

## 次要角色

| 名字 | 身份 | 与主角关系 | 功能 | 一句话特征 |
|------|------|------------|------|------------|
|  |  |  |  |  |`},{path:"book/world.md",content:`# 世界设定

## 基本背景

**时代**：
**地点**：
**社会环境**：（一两句话）

---

## 重要场景

| 场景 | 描述 | 谁的地盘 | 会发生什么 |
|------|------|----------|------------|
|  |  |  |  |

---

## 日常规则

（这个世界里什么是正常的、什么是禁忌的、什么会被注意到）

---

## 特殊设定（如有）

（魔法体系、科技水平、种族、势力、历史事件……现实题材可删）`},{path:"book/state.md",content:`# 状态追踪

## 当前进度

**已写到**：
**当前正在处理**：
**下一步应写**：

---

## 故事进度

**主线进度**：
**支线进度**：
**当前时间点**：
**当前地点**：

---

## 人物关系变化

| 关系 | 当前状态 | 最近变化 | 对后续的影响 |
|------|----------|----------|--------------|
|  |  |  |  |

---

## 伏笔与回收

| 项目 | 埋设位置 | 当前状态 | 预计回收位置 |
|------|----------|----------|--------------|
|  |  |  |  |

---

## 最近更新

### 第 1 章 / 第一卷后

- 本次推进了什么
- 哪些关系发生了变化
- 新确认了什么信息
- 给下一章/下一卷留下了什么承接点`},{path:"book/review-rules.md",content:`# 审稿规则

## 三档判定

| 档位 | 含义 | 后续动作 |
|------|------|----------|
| **通过** | 章节作为自然呼吸点成立，没有硬伤 | 直接固化 |
| **修改** | 有问题但骨架没坏 | 局部改，改完复审 |
| **打回** | 骨架坏了，改不救 | 写 rework brief，整章重写 |

---

## 通过标准

- 本章切在自然呼吸点，不像任务清单被硬截断
- 人物动机成立
- 人物有自己的感受、判断和生活反应，不只是执行剧情
- 写完后回看，体验、关系或认知有自然推进
- 没有底线越界
- 能自然承接下一章或下一处场景压力

---

## 修改（局部问题）

- 情绪标记错
- 某句 tell 不 show
- 视角标签问题
- 物件/时间/称谓矛盾
- 字数略薄
- 缺日常/生活细节
- 缺人物独处思考、关系余波或世界观体感
- 某处反应不够具体
- 伏笔/钩子轻重失当
- 单处用词不当
- 局部推进太赶，可以通过补感官、动作、日常摩擦或心理理解修复

---

## 章节审稿

审稿先看单章是否忠实展开了用户本轮指挥，再看它是否稳稳落在卷规划、写法方案和故事状态里。

- 欲望链是否在引领结构：终极欲望牵引全书，长期欲望牵引卷，中期欲望牵引事件集团，短期欲望牵引章节和场景
- 卷和事件集团是否能从欲望链自然生长出来，而不是凭空安排剧情块
- 本章是否服从用户给出的起点、场景、核心事件、禁止偏离和停止点
- 用户没说的事件是否被擅自加入；用户没暗示的转折是否被提前写出
- 人物是否在具体时空中观察、误读、犹豫、反应、选择，而不是执行剧情任务
- 本章写完后，人物关系、认知、局面或目标是否有真实变化，且变化来自正文现场而不是作者解释

---

## 打回（骨架问题）

### 1. 人物动机整体不成立
- 主角性格突变
- 重要角色行为与人设矛盾

### 2. 核心事件写错
- 本章该发生A，写成了B

### 3. 底线越界
- 触碰本书明确禁止的内容

### 4. 章节像任务清单
- 为了完成“本章功能”强行压缩认识、靠近、亲密、背叛、杀人、掌权或告别
- 人物只是在完成剧情，没有自己的观察、误解、犹豫、生活和反应
- 章末位移被当成开写前必须达成的目标，导致节奏虚假

### 5. 下游断裂
- 无法自然承接下一章或下一处场景压力
- 提前消耗后续核心事件

### 6. Brief 边界跑偏
- 说不写X，整章围绕X写
- 说只到Y，结果写过了

### 7. 结构性空心
- 整章只剩单一功能
- 重要角色沦为道具
- 连续几章只推进事件，没有日常、余波、人物思考或世界体验

---

## 本书专用底线

（列出这本书绝对不能碰的东西）

-
-`},{path:"book/chapters/001.md",content:`从这里开始写正文。
`},{path:"book/notes/revision-plan.md",content:`# 修订计划

这里放待办，不是正文。

- [ ] 梳理大纲
- [ ] 写第一章
- [ ] 审稿并修订
`}]),be=new No("LittleWhiteBox_Ebook");be.version(1).stores({books:"id, updatedAt, title",files:"[bookId+path], bookId, path, updatedAt",meta:"key",plans:"[sessionId+id], sessionId, status, owner, priority, updatedAt, completedAt"});be.version(2).stores({books:"id, updatedAt, title",files:"[bookId+path], bookId, path, updatedAt",meta:"key",plans:"[sessionId+id], sessionId, status, owner, priority, updatedAt, completedAt",sessions:"bookId, updatedAt",messages:"[bookId+order], bookId, order"});var le=be.books,oe=be.files,Xe=be.meta,Bt=be.plans,Be=be.sessions,Ce=be.messages;function Ir(t="book"){return`${t}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}function Ee(){return Date.now()}function jt(t="",e="未命名书稿"){return String(t||"").trim().slice(0,120)||e}function Qe(t={}){return{id:String(t.id||""),title:String(t.title||""),createdAt:Number(t.createdAt)||0,updatedAt:Number(t.updatedAt)||0,chapterCount:Math.max(0,Number(t.chapterCount)||0)}}function Le(t={}){return{bookId:String(t.bookId||""),path:String(t.path||""),content:typeof t.content=="string"?t.content:"",createdAt:Number(t.createdAt)||0,updatedAt:Number(t.updatedAt)||0}}async function un(){const t=(await le.orderBy("updatedAt").reverse().toArray()).map(Qe).filter(r=>r.id),e=await Promise.all(t.map(async r=>Lr(await oe.where("bookId").equals(r.id).toArray())));return t.map((r,o)=>({...r,chapterCount:e[o]||0}))}async function pn(){const t=await Xe.get("selectedBookId");return String(t?.value||"").trim()}async function Lt(t=""){const e=String(t||"").trim();return await Xe.put({key:"selectedBookId",value:e,updatedAt:Ee()}),e}async function gn(t=""){const e=Ee(),r={id:Ir("book"),title:jt(t,"新书稿"),createdAt:e,updatedAt:e};return await le.put(r),await Promise.all(Rr.map(o=>Re(r.id,o.path,o.content,{createdAt:e,updatedAt:e,touchBook:!1}))),await Lt(r.id),Qe(r)}async function hn(t="",e=[]){const r=Ee(),o={id:Ir("book"),title:jt(t,"导入书稿"),createdAt:r,updatedAt:r},n=(Array.isArray(e)?e:[]).map(a=>({path:he(a?.path),content:typeof a?.content=="string"?a.content:"",createdAt:Number(a?.createdAt)||r,updatedAt:Number(a?.updatedAt)||r})).filter(a=>a.path);if(!n.length)throw new Error("ebook_package_has_no_files");return await be.transaction("rw",le,oe,async()=>{await le.put(o),await Promise.all(n.map(a=>oe.put({bookId:o.id,path:a.path,content:a.content,createdAt:a.createdAt,updatedAt:a.updatedAt})))}),Qe(o)}async function vt(t=""){const e=await le.get(String(t||"").trim());return e?Qe(e):null}async function _r(t="",e=""){const r=String(t||"").trim();if(!r)throw new Error("book_required");const o=jt(e,"未命名书稿"),n=Ee();if(!await le.update(r,{title:o,updatedAt:n}))throw new Error("book_not_found");return Qe(await le.get(r))}async function xn(t=""){const e=String(t||"").trim();e&&await le.update(e,{updatedAt:Ee()})}async function at(t=""){const e=String(t||"").trim();return e?(await oe.where("bookId").equals(e).toArray()).map(Le).filter(r=>r.path).sort((r,o)=>r.path.localeCompare(o.path,"zh-CN")):[]}async function Mr(t=""){const e=String(t||"").trim();return e?(await oe.where("bookId").equals(e).primaryKeys()).map(r=>Array.isArray(r)?String(r[1]||""):"").filter(Boolean).sort((r,o)=>r.localeCompare(o,"zh-CN")):[]}async function*fn(t="",e={}){const r=String(t||"").trim();if(!r)return;const o=Math.max(1,Math.min(500,Math.floor(Number(e.pageSize)||1))),n=await Mr(r);for(let a=0;a<n.length;a+=o){const i=await oe.bulkGet(n.slice(a,a+o).map(s=>[r,s]));for(const s of i){if(!s)continue;const l=Le(s);l.path&&(yield l)}}}async function it(t="",e=""){const r=String(t||"").trim(),o=he(e);if(!r||!o)return null;const n=await oe.get([r,o]);return n?Le(n):null}async function Re(t="",e="",r="",o={}){const n=String(t||"").trim(),a=he(e);if(!n||!a)throw new Error("book_path_required");const i=await oe.get([n,a]),s=Number(o.updatedAt)||Ee(),l={bookId:n,path:a,content:typeof r=="string"?r:String(r??""),createdAt:Number(i?.createdAt||o.createdAt)||s,updatedAt:s};return await oe.put(l),o.touchBook!==!1&&await xn(n),Le(l)}async function Qt(t="",e="",r="",o=""){const n=String(t||"").trim(),a=he(e);if(!n||!a)throw new Error("book_path_required");const i=typeof r=="string"?r:String(r??""),s=typeof o=="string"?o:String(o??"");return await be.transaction("rw",oe,le,async()=>{const[l,b]=await Promise.all([oe.get([n,a]),le.get(n)]);if(!l||!b)return{ok:!1,reason:"missing",current:l?Le(l):null};if(String(l.content||"")!==i)return{ok:!1,reason:"conflict",current:Le(l)};const y=Ee(),f={...l,content:s,updatedAt:y};return await oe.put(f),await le.update(n,{updatedAt:y}),{ok:!0,reason:"",file:Le(f)}})}async function mn(t="",e=""){const r=String(t||"").trim();if(!r)throw new Error("bookId_required");const o=String(e||"").trim(),n=o.endsWith("/"),a=n?Ze(o):he(o);if(!a)throw new Error("invalid_path");if(a==="book/")throw new Error("book_root_delete_forbidden");let i=0;return await be.transaction("rw",oe,le,async()=>{if(n){const s=await oe.where("bookId").equals(r).filter(l=>String(l?.path||"").startsWith(a)).primaryKeys();if(!s.length)throw new Error("book_path_not_found");await oe.bulkDelete(s),i=s.length}else{if(!await oe.get([r,a]))throw new Error("book_path_not_found");await oe.delete([r,a]),i=1}await le.update(r,{updatedAt:Ee()})}),{path:a,deletedCount:i,directory:n}}async function yn(t=""){const e=String(t||"").trim();if(!e)throw new Error("bookId_required");await be.transaction("rw",le,oe,Xe,Bt,Be,Ce,async()=>{await oe.where("bookId").equals(e).delete(),await Bt.where("sessionId").equals(e).delete(),await Be.where("bookId").equals(e).delete(),await Ce.where("bookId").equals(e).delete(),await le.delete(e),String((await Xe.get("selectedBookId"))?.value||"").trim()===e&&await Xe.delete("selectedBookId")})}async function kn(t="",e=[]){const r=String(t||"").trim();if(!r)throw new Error("book_required");const o=Ee();await be.transaction("rw",oe,le,async()=>{await oe.where("bookId").equals(r).delete(),await Promise.all((Array.isArray(e)?e:[]).map(async n=>{const a=he(n?.path);a&&await oe.put({bookId:r,path:a,content:typeof n.content=="string"?n.content:"",createdAt:Number(n.createdAt)||o,updatedAt:o})})),await le.update(r,{updatedAt:o})})}var vn=1200,wn=2e3,er=100,Sn=["book/sources/","book/chapters/","book/volumes/","book/reviews/","book/notes/"];function Tn(t="",e=4e3){const r=String(t||"").trim();return r.length>e?r.slice(0,e):r}function En(t,e=1){const r=Math.floor(Number(t));return Number.isFinite(r)&&r>0?r:e}function An(t=[],e="book/"){const r=Ze(e)||"book/",o=new Map;return Sn.forEach(n=>{if(!n.startsWith(r)||n===r)return;const[a]=n.slice(r.length).split("/");if(!a)return;const i=`${r}${a}/`;o.set(i,{name:a,path:i,type:"directory"})}),t.forEach(n=>{const a=typeof n=="string"?n:String(n?.path||"");if(!a.startsWith(r)||a===r)return;const i=a.slice(r.length);if(!i)return;const[s]=i.split("/");if(!s)return;const l=i.includes("/"),b=`${r}${s}${l?"/":""}`;o.set(b,{name:s,path:b,type:l?"directory":"file"})}),Array.from(o.values()).sort((n,a)=>n.type!==a.type?n.type==="directory"?-1:1:n.path.localeCompare(a.path,"zh-CN"))}function Dr(t=""){const e=ht(t||"book/**");if(!e)throw new Error("book_path_required");let r="^";for(let o=0;o<e.length;o+=1){const n=e[o],a=e[o+1],i=e[o+2];n==="*"&&a==="*"&&i==="/"?(r+="(?:.*/)?",o+=2):n==="*"&&a==="*"?(r+=".*",o+=1):n==="*"?r+="[^/]*":n==="?"?r+="[^/]":r+=n.replace(/[|\\{}()[\]^$+?.]/g,"\\$&")}return r+="$",new RegExp(r)}function $n(t=""){const e=String(t||"").trim();if(!e)return()=>!0;if(!/[/*?[\]{}]/.test(e)){const o=he(e);return n=>n===o||n.endsWith(`/${e.replace(/^\/+/,"")}`)}const r=Dr(e.startsWith("book/")?e:`book/${e.replace(/^\/+/,"")}`);return o=>r.test(o)}function Cn(t=""){const e=String(t||"").trim();if(!e)return{directory:"",filePath:""};const r=he(e);return r?{directory:"",filePath:r}:{directory:De(e),filePath:""}}function Pn(t={}){const e=typeof t.currentBookId=="function"?t.currentBookId:async()=>t.bookId,r=typeof t.getFiles=="function"?t.getFiles:async()=>[],o=typeof t.listPaths=="function"?t.listPaths:async()=>(await r()).map(g=>String(g?.path||"")).filter(Boolean),n=typeof t.iterateFiles=="function"?t.iterateFiles:async function*(){for(const g of await r())yield g},a=typeof t.onFilesChanged=="function"?t.onFilesChanged:null,i=!!t.readOnly,s=t.signal;function l(){if(i)throw new Error("book_tool_read_only")}async function b(g={}){if(!a)return g;try{return await a(),g}catch(k){return{...g,warning:"files_refresh_failed",refreshError:String(k?.message||k||"files_refresh_failed"),summary:`${g.summary||"文件已变更。"}（文件变更已保存，但界面刷新失败；请刷新电纸书界面。）`}}}async function y(g={}){const k=De(g.path||"book/"),S=An(await o(),k),m=En(g.offset,1),T=Math.min(300,Math.max(1,Math.floor(Number(g.limit)||100))),P=S.slice(m-1,m-1+T);return{ok:!0,path:k,count:S.length,entries:P,truncated:m-1+T<S.length,nextOffset:m-1+T<S.length?m+T:0,summary:`${k} 下有 ${S.length} 项，返回 ${P.length} 项。`}}async function f(g={}){const k=Tn(g.pattern||"book/**",1e3),S=g.path?De(g.path):"",m=Dr(k);let T=(await o()).filter(P=>m.test(P));return S&&(T=T.filter(P=>P.startsWith(S))),T.sort((P,w)=>P.localeCompare(w,"zh-CN")),{ok:!0,pattern:k,path:S,count:T.length,files:T.slice(0,300),truncated:T.length>300,summary:`匹配到 ${T.length} 个文件。`}}async function C(g={}){const k=g.pattern??g.query??"",S=Cn(g.path||g.scope||""),m=$n(g.include||"");async function*T(){for await(const w of n())S.filePath&&w.path!==S.filePath||!S.filePath&&S.directory&&!w.path.startsWith(S.directory)||m(w.path)&&(yield w)}const P=await en({pattern:k,useRegex:g.useRegex===!0,regexFlags:"i",outputMode:g.outputMode,limit:Math.min(er,Math.max(1,Math.floor(Number(g.limit)||er))),offset:g.offset,contextLines:Math.min(5,Math.max(0,Math.floor(Number(g.contextLines)||0))),signal:s,sources:T()});return{ok:!0,pattern:P.pattern,path:S.filePath||S.directory,outputMode:P.outputMode,searchedFileCount:P.searchedFileCount,count:P.count,results:P.results,truncated:P.truncated,nextOffset:P.nextOffset,summary:`搜索到 ${P.count} 项，返回 ${P.results.length} 项。`}}async function $(g={}){const k=String(g.filePath||"").trim();if(!k)throw new Error("book_path_required");const S=ht(k);if(!S)throw new Error(Ft(k,{directory:!0})||"book_path_required");if(S.endsWith("/"))return await y({path:S,offset:g.offset,limit:g.limit});const m=_e(S),T=await it(await e(),m);if(!T)throw new Error("book_file_not_found");const P=Qo(T.content,{offset:g.offset,limit:g.limit,tail:g.tail,defaultLimit:vn,maxLimit:wn});return{ok:!0,path:m,...P,summary:`读取 ${m} 第 ${P.lineStart}-${P.lineEnd} 行，共 ${P.totalLines} 行。`}}async function B(g={}){l();const k=_e(g.path||g.filePath),S=await Re(await e(),k,typeof g.content=="string"?g.content:String(g.content??""));return await b({ok:!0,path:S.path,bytes:new TextEncoder().encode(S.content).length,summary:`已写入 ${S.path}。`})}async function R(g={}){l();const k=_e(g.filePath),S=g.edits,m=await e(),T=await it(m,k);if(!T)return{ok:!1,path:k,error:"file_not_found",message:"File does not exist",results:[{ok:!1,error:"file_not_found",message:"File does not exist"}],summary:`未找到 ${k}。`};const P=T?.content||"",w=Zo(P,S),W=w.results.filter(Q=>Q.ok&&!Q.satisfied).length,K=w.results.filter(Q=>Q.ok&&Q.satisfied).length,ne=W+K,ee=w.results.filter(Q=>!Q.ok&&Q.uncertain).length,ae=w.results.length-ne,te=ae-ee,U=w.content!==P;if(U){await Re(m,k,w.content||"");const Q=await it(m,k);if(!Q||Q.content!==w.content)return{ok:!1,partial:!0,path:k,error:"edit_persistence_verification_failed",message:"Edit result was produced, but the saved file did not match the expected content after write verification.",editCount:w.results.length,appliedCount:W,satisfiedCount:K||void 0,successCount:ne,failedCount:ae,definiteFailedCount:te,uncertainCount:ee||void 0,changed:!1,expectedBytes:new TextEncoder().encode(w.content||"").length,savedBytes:new TextEncoder().encode(Q?.content||"").length,results:w.results,warning:w.warning,summary:`已生成 ${k} 的修改结果，但落盘校验未通过；请重新读取文件确认当前内容。`}}const ue={ok:w.ok,partial:w.partial,path:k,error:w.ok?void 0:w.results.find(Q=>!Q.ok)?.error,message:w.ok?void 0:w.results.find(Q=>!Q.ok)?.message,editCount:w.results.length,appliedCount:W,satisfiedCount:K||void 0,successCount:ne,failedCount:ae,definiteFailedCount:te,uncertainCount:ee||void 0,changed:U,results:w.results,warning:w.warning,summary:w.ok?U?K>0?`已修改 ${k}，应用 ${W} 项，另有 ${K} 项已是目标状态。`:`已修改 ${k}，应用 ${W} 项。`:`已确认 ${k} 的 ${K||W} 项修改已是目标状态，无需重复写入。`:w.partial?K>0?ee>0?`已部分修改 ${k}：成功 ${ne} 项（应用 ${W} 项，另有 ${K} 项已是目标状态），需确认 ${ee} 项，明确失败 ${te} 项。`:`已部分修改 ${k}：成功 ${ne} 项（应用 ${W} 项，另有 ${K} 项已是目标状态），明确失败 ${te} 项。`:ee>0?`已部分修改 ${k}：成功 ${W} 项，需确认 ${ee} 项，明确失败 ${te} 项；需确认项的目标文本已存在但无法证明目标位置，请重新 Read 确认。`:`已部分修改 ${k}：成功 ${W} 项，明确失败 ${te} 项。`:ee>0?`未应用新的修改到 ${k}：${ee} 项的目标文本已存在但 oldString 未找到，无法证明目标位置已正确；请重新 Read 确认。`:`未修改 ${k}：${w.results[0]?.message||w.results[0]?.error||"Edit failed"}。`};return U?await b(ue):ue}async function M(g={}){l();const k=String(g.path||"").trim(),S=k.endsWith("/")?De(k):_e(k),m=await mn(await e(),S);return await b({ok:!0,path:m.path,deletedCount:m.deletedCount,summary:`已删除 ${m.deletedCount} 个文件。`})}async function _(g={}){l();const k=String(g.fromPath||"").trim(),S=String(g.toPath||"").trim(),m=await r(),T=k.endsWith("/")||m.some(U=>U.path.startsWith(Ze(k))),P=T?De(k):_e(k),w=T?De(S):_e(S);if(P==="book/")throw new Error("book_root_move_forbidden");if(T&&w!==P&&w.startsWith(P))throw new Error("book_move_into_self_forbidden");const W=!!g.overwrite,K=T?m.filter(U=>U.path.startsWith(P)):m.filter(U=>U.path===P);if(!K.length)throw new Error("book_path_not_found");const ne=K.map(U=>T?`${w}${U.path.slice(P.length)}`:w);if(!W&&m.find(U=>ne.includes(U.path)&&!K.some(ue=>ue.path===U.path)))throw new Error("book_destination_exists");const ee=new Set(K.map(U=>U.path)),ae=new Set(ne),te=m.filter(U=>!ee.has(U.path)&&(W||!ae.has(U.path))).concat(K.map((U,ue)=>({...U,path:ne[ue]})));return await kn(await e(),te),await b({ok:!0,fromPath:P,toPath:w,movedCount:K.length,summary:`已移动 ${K.length} 个文件。`})}return{executeLs:y,executeGlob:f,executeGrep:C,executeRead:$,executeWrite:B,executeEdit:R,executeDelete:M,executeMove:_}}var I=Object.freeze({LS:"LS",GLOB:"Glob",GREP:"Grep",READ:"Read",WEB_SEARCH:Mo,WRITE:"Write",EDIT:"Edit",DELETE:"Delete",MOVE:"Move",PLAN_CREATE:"PlanCreate",PLAN_UPDATE:"PlanUpdate",PLAN_LIST:"PlanList",PLAN_GET:"PlanGet",RENAME_BOOK:"RenameBook",DELEGATE_RUN:"DelegateRun"});function Ve(t={}){const e=!!t.readOnly,r=!!t.webSearchEnabled,o=[{type:"function",function:{name:I.LS,description:["List first-level files and directories under a current-book directory.","Returns directory entries only. Does not recurse and does not read file contents.","Use before reading or editing when you need to locate chapters, sources, settings, or review files.","Directory paths must be `book/.../`, for example `book/` or `book/chapters/`. This is a directory tool, not a file reader."].join(`
`),parameters:{type:"object",properties:{path:{type:"string",description:"Directory path. Must be `book/.../`, for example `book/`, `book/sources/`, or `book/chapters/`. Do not pass filePath."},offset:{type:"number",description:"1-based directory entry offset. Default 1."},limit:{type:"number",description:"Maximum number of entries to return. Default 100, max 300."}},required:["path"],additionalProperties:!1}}},{type:"function",function:{name:I.GREP,description:["Search text inside current-book files.","Uses literal text search by default and returns matching files plus line-level snippets.","Use before reading many files to locate character names, dialogue, settings, foreshadowing, plot points, or review notes.","`path` can be a search directory or one exact file; `include` limits the file glob/name. For regex search, explicitly pass `useRegex: true`."].join(`
`),parameters:{type:"object",properties:{pattern:{type:"string",description:"Search pattern. Treated as literal text by default; use `useRegex: true` only when you intentionally need regex."},path:{type:"string",description:"Optional search scope. Can be a directory like `book/chapters/` or one file like `book/chapters/101.md`."},include:{type:"string",description:"Optional file glob/name filter, for example `book/chapters/*.md` or `101.md`."},outputMode:{type:"string",enum:["content","files_with_matches","count"],description:"`content` returns matched lines, `files_with_matches` returns files only, and `count` returns match counts. Default `content`."},limit:{type:"number",description:"Maximum number of results to return. Default 100, max 100."},offset:{type:"number",description:"Skip this many results before returning matches. Default 0."},contextLines:{type:"number",description:"How many context lines to show before and after each match. Default 0, max 5."},useRegex:{type:"boolean",description:"Whether to treat pattern as a regex. Default false; omit it for literal text search."}},required:["pattern"],additionalProperties:!1}}},{type:"function",function:{name:I.READ,description:["Read a text file in the current book, or list a directory.","For files, returns line-numbered content. For directories, returns directory entries. Large files include continuation hints.","Use `tail` by itself when you need the end of a file.","The argument name is `filePath`, not `path`. File paths look like `book/outline.md`; directory paths look like `book/chapters/`."].join(`
`),parameters:{type:"object",properties:{filePath:{type:"string",description:"File or directory path, for example `book/outline.md`, `book/chapters/001.md`, or `book/chapters/`. Do not pass path."},offset:{type:"number",description:"1-based line or directory-entry offset. Default 1."},limit:{type:"number",description:"Maximum number of lines or entries to return. Default 1200, max 2000."},tail:{type:"number",description:"Return the final N lines of a file. Use by itself; do not combine with offset/limit."}},required:["filePath"],additionalProperties:!1}}}];return r&&o.push(Do()),e||o.push({type:"function",function:{name:I.WRITE,description:["Write a complete text file in the current book.","Use for creating files, complete file rewrites, whole sections, whole chapters, or rewrites where most content is new.","Read the target file first. Write overwrites the entire file, so include all original content you want to keep.","The argument names are `filePath` and `content`. Write replaces the complete target file content."].join(`
`),parameters:{type:"object",properties:{filePath:{type:"string",description:"Target file path, for example `book/chapters/001.md` or `book/notes/idea.md`."},content:{type:"string",description:"Full file content to write."}},required:["filePath","content"],additionalProperties:!1}}},{type:"function",function:{name:I.EDIT,description:["Edit one existing current-book file by replacing original text fragments, replacing inclusive line ranges, inserting text at line positions, or removing text with empty replacements.","One call edits one file.","Use oldString/newString for local text replacement. Use startLine/endLine/newString for contiguous passage replacement where copying oldString would be fragile. Use insertAtLine/newString to add new text before a line or at the end without replacing existing text. Use Write instead for creating files, complete rewrites, or rewrites where most content is new.","Read the target file first unless the exact current text is already available in the conversation or a recent tool result. Line-range and insertion edits must use line numbers from the latest Read result.","Put multiple edits in the edits array. Line-range and insertion items may share one call when they use line numbers from the same Read result. Keep oldString edits separate from line-number edits unless the whole change can be expressed with line numbers.",'The `edits` argument must be a non-empty array value, not a JSON-stringified string. Correct: `"edits":[{"startLine":10,"endLine":50,"newString":"..."}]`. Wrong: `"edits":"[{\\"startLine\\":10,\\"endLine\\":50,\\"newString\\":\\"...\\"}]"`.',"Each edit item should choose exactly one mode. Omit unused mode fields when possible. If the provider/tool channel adds stray optional fields, Edit normalizes by priority: complete startLine/endLine wins, then insertAtLine, then oldString.",'Correct line-range item: `{"startLine":10,"endLine":50,"newString":"..."}`. If a polluted item also contains oldString or insertAtLine, the complete startLine/endLine range is used and stray fields are ignored.',"Do not issue multiple Edit tool calls for the same file in one assistant turn. Combine same-file changes into one Edit call, or wait for the first result before editing that file again.","","## Matching Rules","oldString must be an exact fragment present in the file, including spaces and newlines. To remove the matched word, sentence, or fragment, set newString to an empty string.","Common punctuation equivalence is supported, such as straight/curly quotes and ASCII/full-width comma or period. Replacements preserve the file punctuation style when possible.","For long oldString fragments, Edit can also tolerate whitespace-only differences such as indentation, line wrapping, or extra/missing blank lines.","Each oldString must be unique by default. Multiple matches return line numbers and context.","Line-range edits use 1-based inclusive startLine/endLine from Read output. A line range replaces the entire inclusive range with any length of newString; use an empty newString to remove the range. Replacement line count does not need to match the original range.","Insertion edits use 1-based insertAtLine from Read output. insertAtLine inserts before that line; use totalLines + 1 to append to the end of the file.","Line-range and insertion items in one call are applied by original Read line numbers from bottom to top automatically to avoid line-number shifts; do not adjust later line numbers yourself. If an insertion falls inside a line range being replaced, merge it into that line-range replacement.","Do not intentionally mix oldString edits with line-number edits in one Edit call. If one item is polluted by stray optional fields, the tool will still choose one mode by priority instead of failing.","","## Failure Handling","Not found: check whether oldString exactly matches the file content.","Multiple matches: expand oldString with more context to make it unique, or set `replaceAll: true`.","","## Notes","oldString edits execute in order. Line-range and insertion edits execute bottom-to-top by original line numbers. Do not let a later oldString match text just inserted by an earlier newString.","If two changes overlap, merge them into one replacement for the larger fragment instead of splitting them into separate edits.","Use Write for complete rewrites, complete new files, or when most of the file should be replaced."].join(`
`),parameters:{type:"object",properties:{filePath:{type:"string",description:"Target file path, for example `book/chapters/001.md` or `book/characters.md`."},edits:{type:"array",description:"List of edits as a real, non-empty JSON array, not a quoted JSON string. Each item should use exactly one mode: oldString/newString, startLine/endLine/newString, or insertAtLine/newString. Stray optional fields are ignored by mode priority when possible.",items:{type:"object",properties:{oldString:{type:"string",description:"Original text fragment to replace. Must match exactly, with common punctuation/long-whitespace tolerance. Do not use an empty oldString; use Write to create files."},startLine:{type:"number",description:"1-based inclusive start line from the latest Read result. Use with endLine instead of oldString."},endLine:{type:"number",description:"1-based inclusive end line from the latest Read result. Use with startLine instead of oldString."},insertAtLine:{type:"number",description:"1-based insertion point from the latest Read result. Inserts before this line. Use totalLines + 1 to append to the end of the file."},newString:{type:"string",description:"Replacement, inserted text, or an empty string to delete the matched fragment or line range."},replaceAll:{type:"boolean",description:"Whether to replace all matches. Default false."}},required:["newString"],additionalProperties:!1}}},required:["filePath","edits"],additionalProperties:!1}}},{type:"function",function:{name:I.DELETE,description:["Delete a file or directory in the current book.","Can delete one file, or a directory and its files.","Do not delete chapters, sources, settings, or review notes unless necessary. Be careful even when cleaning drafts.","Directory paths should end with `/`, for example `book/notes/`. File deletion uses the full file path."].join(`
`),parameters:{type:"object",properties:{path:{type:"string",description:"Target file or directory path, for example `book/reviews/old.md` or `book/notes/`. Keep the trailing `/` for directory deletion."}},required:["path"],additionalProperties:!1}}},{type:"function",function:{name:I.MOVE,description:["Move or rename a file or directory in the current book.","Use to organize chapter, source, setting, or review-note paths and names.","If the destination already exists, overwriting must be explicit. Do not move a directory into itself.","The argument names are `fromPath` and `toPath`. For directories, both paths should be `book/.../`."].join(`
`),parameters:{type:"object",properties:{fromPath:{type:"string",description:"Source path, for example `book/notes/draft.md` or `book/notes/`."},toPath:{type:"string",description:"Destination path, for example `book/notes/revision-plan.md` or `book/archive/notes/`."},overwrite:{type:"boolean",description:"Whether overwrite is allowed when the destination already exists. Default false."}},required:["fromPath","toPath"],additionalProperties:!1}}},{type:"function",function:{name:I.PLAN_CREATE,description:["Create a writing plan item for the current book.","Use for multi-step writing, long revisions, blockers, or tasks that need later continuation.","Plans only record state. They do not automatically review, draft prose, or call other tools.","Use only when the task needs multi-step tracking. Short direct writing or one-off answers do not need a plan.","PlanCreate always creates a new item. The returned id is only an internal handle for later PlanUpdate/PlanGet, not evidence that a plan already existed.","Do not expose plan ids to the user unless they explicitly ask for debugging details."].join(`
`),parameters:{type:"object",properties:{title:{type:"string",description:"Short concrete outcome, not a vague category."},detail:{type:"string",description:"Necessary background, done criteria, target files, or checks needed."},priority:{type:"string",enum:["low","normal","high","urgent"],description:"Priority. Default normal; raise only for real urgency."},owner:{type:"string",description:"Who should move it forward. Default assistant; use user when user input or confirmation is needed."},blockedBy:{type:"array",items:{type:"string"},description:"Plan ids that must be completed before this item can start."},note:{type:"string",description:"Optional first progress note or reason this item exists."}},required:["title"],additionalProperties:!1}}},{type:"function",function:{name:I.PLAN_UPDATE,description:["Update a writing plan item for the current book after real progress.","Use status for progress, note for short progress notes, and result/error for final outcome or failure reason.","Mark completed only after the corresponding writing, review, or revision is actually done.","If dependencies are not complete, the item cannot move to in_progress.","The `id` must come from PlanCreate or PlanList. Do not invent an id-like value.","The id is an internal handle for tools. Do not present it to the user as meaningful content."].join(`
`),parameters:{type:"object",properties:{id:{type:"string",description:"Plan id returned by PlanCreate or PlanList."},title:{type:"string",description:"Optional clearer replacement title."},detail:{type:"string",description:"Optional replacement background or done criteria."},status:{type:"string",enum:["pending","in_progress","blocked","completed","failed","cancelled"],description:"New progress state."},priority:{type:"string",enum:["low","normal","high","urgent"],description:"New priority."},owner:{type:"string",description:"New owner."},blockedBy:{type:"array",items:{type:"string"},description:"Replacement blocker id list; pass an empty array to clear blockers."},note:{type:"string",description:"Append one short progress note."},result:{type:"string",description:"Concrete result, usually for completed items."},error:{type:"string",description:"Failure reason or blocking error, usually for failed items."}},required:["id"],additionalProperties:!1}}},{type:"function",function:{name:I.PLAN_LIST,description:["List writing plans for the current book.","Use when continuing writing, continuing revisions, avoiding duplicate plans, choosing next steps, or checking blockers.","Without filters, returns current plans. Use status, priority, or owner only when narrowing the result.","If you are unsure whether a related plan already exists, use PlanList before creating or updating.","Plan ids in the result are internal handles for future tool calls. Summarize plans by title/status for the user."].join(`
`),parameters:{type:"object",properties:{status:{type:"string",enum:["pending","in_progress","blocked","completed","failed","cancelled"],description:"Optional status filter."},priority:{type:"string",enum:["low","normal","high","urgent"],description:"Optional priority filter."},owner:{type:"string",description:"Optional owner filter."},limit:{type:"number",description:"Maximum items to return. Default 50, max 100."}},additionalProperties:!1}}},{type:"function",function:{name:I.PLAN_GET,description:["Read the full record of one writing plan item for the current book.","Use when the plan summary is not enough and you need details, blockers, notes, result, or error.","The `id` must come from PlanCreate or PlanList.","The id is an internal handle for tools. Do not present it to the user as meaningful content."].join(`
`),parameters:{type:"object",properties:{id:{type:"string",description:"Plan id returned by PlanCreate or PlanList."}},required:["id"],additionalProperties:!1}}},{type:"function",function:{name:I.RENAME_BOOK,description:["Rename the current book.","Changes only the book title. Does not move chapters, sources, or setting files.","Use when the user asks to change the book name, change the title, or rename the current work.","The only argument is `title`. Do not use Write on a file to rename the book."].join(`
`),parameters:{type:"object",properties:{title:{type:"string",description:"New book title. Leading/trailing whitespace is trimmed; max 120 characters are kept."}},required:["title"],additionalProperties:!1}}},{type:"function",function:{name:I.DELEGATE_RUN,description:["Ask a read-only reviewer delegate to independently inspect the current book and return findings to you.","Use for clear, independent, verifiable review tasks, continuity checks, source verification, or issue localization.","The delegate knows only the task, context, deliverable, automatically injected review context, and any book content it reads.","The delegate cannot write files, manage plans, or delegate further.","`task` is required. Put paths, factual background, and scope in `context`; put expected result shape in `deliverable`. Do not use this as a writing or editing tool."].join(`
`),parameters:{type:"object",properties:{task:{type:"string",description:"Concrete review or verification task."},context:{type:"string",description:"Necessary background, paths to inspect, known facts, or scope."},deliverable:{type:"string",description:"Expected result format or evidence requirements."}},required:["task"],additionalProperties:!1}}}),o}function Nr(t="",e={}){switch(t){case I.LS:return`查看作品目录 ${e.path||""}`.trim();case I.GLOB:return`匹配作品文件 ${e.pattern||""}`.trim();case I.GREP:return`搜索作品 ${e.pattern||""}`.trim();case I.READ:return`读取 ${e.filePath||""}`.trim();case I.WEB_SEARCH:return`联网查资料 ${e.query||""}`.trim();case I.WRITE:return`写入 ${e.filePath||e.path||""}`.trim();case I.EDIT:return`修订 ${e.filePath||""}`.trim();case I.DELETE:return`删除 ${e.path||""}`.trim();case I.MOVE:return`移动 ${e.fromPath||""}${e.toPath?` -> ${e.toPath}`:""}`.trim();case I.PLAN_CREATE:return`创建计划 ${e.title||""}`.trim();case I.PLAN_UPDATE:return`更新计划 ${e.id||""}`.trim();case I.PLAN_LIST:return"查看书籍计划";case I.PLAN_GET:return`查看计划 ${e.id||""}`.trim();case I.RENAME_BOOK:return`修改书名 ${e.title||""}`.trim();case I.DELEGATE_RUN:return`审稿分身 ${e.task||""}`.trim();default:return`调用工具 ${t}`}}var Or=Xo({plansTable:Bt});function Bn(t){try{return JSON.stringify(t,null,2)}catch{return String(t||"")}}function Ln(t={}){return typeof t?.path=="string"?t.path:typeof t?.filePath=="string"?t.filePath:typeof t?.fromPath=="string"?t.fromPath:""}function tr(t="",e={},r){const o=String(r?.message||r||"ebook_tool_failed"),[n]=o.split(":");return{ok:!1,toolName:String(t||""),path:Ln(e),error:n||"ebook_tool_failed",raw:o,message:o}}function rr(t={}){const e=typeof t.getBookId=="function"?t.getBookId:()=>t.bookId,r=typeof t.onFilesChanged=="function"?t.onFilesChanged:null,o=typeof t.runDelegate=="function"?t.runDelegate:null,n=typeof t.getSearchConfig=="function"?t.getSearchConfig:()=>t.searchConfig||{},a=!!t.readOnly;async function i(){const B=String(await e()||"").trim();if(!B)throw new Error("book_required");return B}async function s(){return await at(await i())}async function l(){return await Mr(await i())}async function*b(){yield*fn(await i())}function y(){if(a)throw new Error("book_tool_read_only")}async function f(B={}){if(!r)return B;try{return await r(),B}catch(R){return{...B,warning:"files_refresh_failed",refreshError:String(R?.message||R||"files_refresh_failed"),summary:`${B.summary||"文件已变更。"}（文件变更已保存，但界面刷新失败；请刷新电纸书界面。）`}}}const C=Pn({currentBookId:i,getFiles:s,listPaths:l,iterateFiles:b,onFilesChanged:r,readOnly:a,signal:t.signal});async function $(B="",R={}){const M=await i();switch(B){case I.LS:return await C.executeLs(R);case I.GLOB:return await C.executeGlob(R);case I.GREP:return await C.executeGrep(R);case I.READ:return await C.executeRead(R);case I.WEB_SEARCH:return await _o(n(),R,{signal:t.signal,isAbortError:t.isAbortError});case I.WRITE:return await C.executeWrite(R);case I.EDIT:return await C.executeEdit(R);case I.DELETE:return await C.executeDelete(R);case I.MOVE:return await C.executeMove(R);case I.PLAN_CREATE:case I.PLAN_UPDATE:case I.PLAN_LIST:case I.PLAN_GET:return y(),await Or.execute(B,M,R);case I.RENAME_BOOK:{y();const _=await _r(M,R.title);return await f({ok:!0,book:_,title:_.title,summary:`书名已改为《${_.title}》。`})}case I.DELEGATE_RUN:if(y(),!o)throw new Error("delegate_unavailable");return await o(R);default:return{ok:!1,error:"ebook_tool_not_available",toolName:B,message:`电纸书没有开放 ${B}。`}}}return{execute:$,getFiles:s,getToolDefinitions:()=>Ve({readOnly:a,webSearchEnabled:Je(n())})}}function Rn(t={}){return!t||typeof t!="object"?String(t||""):t.summary||t.message||t.error||Bn(t).slice(0,600)}var zr=188e3,In=158e3;function Pe(t){if(t?.aborted){const e=new Error("Context compaction aborted.");throw e.name="AbortError",e}}function st(t=[]){const e=[];let r=[];return(t||[]).forEach(o=>{if(!(!o||!["user","assistant","tool"].includes(o.role))){if(o.role==="user"&&r.length){e.push(r),r=[o];return}r.push(o)}}),r.length&&e.push(r),e.filter(o=>o.length)}function _n(t={}){const{state:e,render:r=()=>{},persistConversation:o=()=>{},showToast:n=()=>{},getActiveProviderConfig:a=()=>({}),buildProviderMessages:i=()=>[],getToolDefinitions:s=()=>[],countTokens:l=Wo,onCompactionStart:b=()=>{},onCompactionProgress:y=()=>{},onCompactionComplete:f=()=>{},onCompactionUnable:C=()=>{},summaryTriggerTokens:$=In,defaultPreservedTurns:B=2,minPreservedTurns:R=1}=t;async function M(m,T=i){Pe(m);const P=a(),w=s(),W=await T(),K=await l({messages:W,tools:Array.isArray(w)?w:[],providerConfig:P,signal:m});return Pe(m),{messages:W,...K}}function _(){const m=st(e.messages),T=Math.min(e.archivedTurnCount,m.length);return m.slice(T).flat()}function g(){const m=st(e.messages),T=Math.min(e.archivedTurnCount,m.length);return T<=0?!1:(e.messages=m.slice(T).flat(),e.archivedTurnCount=0,e.historySummary="",gt(e),!0)}function k(){e.archivedTurnCount=0,e.historySummary=""}async function S(m,T,P=i){let w=await M(T,P);const W=w.tokens;if(W<=$)return w;Pe(T),b({currentTokens:W,triggerTokens:$,status:"正在释放较早对话，只保留最近创作上下文..."});for(const K of[B,R]){const ne=st(e.messages),ee=Math.max(e.archivedTurnCount,ne.length-Math.min(K,ne.length));if(ee>e.archivedTurnCount){Pe(T);const te=e.status;e.status="正在释放较早对话...",y({currentTokens:W,triggerTokens:$,status:`正在只保留最近 ${K} 轮创作上下文...`}),r();try{Pe(T),e.archivedTurnCount=ee,g(),await o()}catch(U){throw e.status=te||"就绪",r(),U}e.status=te||"就绪",r(),Pe(T),w=await M(T,P)}const ae=w.tokens;if(Pe(T),y({currentTokens:W,yieldTokens:ae,triggerTokens:$,status:ae<=$?`已只保留最近 ${K} 轮创作上下文。`:"最近创作上下文仍然过长，继续收缩..."}),ae<=$)return n(`已释放较早对话，只保留最近 ${K} 轮。`),f({currentTokens:W,yieldTokens:ae,triggerTokens:$,status:`已只保留最近 ${K} 轮创作上下文。`}),r(),w}return n("当前这一轮上下文本身已经过长，请结束、拆分任务或重新开始。"),C({currentTokens:W,triggerTokens:$,status:"当前这一轮过长，无法继续自动收缩。"}),r(),w}return{ensureContextBudget:S,countContext:M,getActiveContextMessages:_,pruneArchivedTurnsFromState:g,resetCompactionState:k}}var Mn=[{path:"book/outline.md",label:"大纲"},{path:"book/style.md",label:"文风规则"},{path:"book/characters.md",label:"角色设定"},{path:"book/world.md",label:"世界设定"}],tt={path:"book/state.md",label:"状态追踪"},lt={path:"book/review-rules.md",label:"审稿规则"},qr=new Map(Rr.map(t=>[t.path,String(t.content||"")])),Rt=["你是“小白电纸书”的写作伙伴，运行在用户的 SillyTavern 实例中，通过 LittleWhiteBox 的电纸书创作台与用户协作。","你热爱写书，也尊重用户的审美、野心和犹豫。你不是冷冰冰的任务机器，而是有阅读经验、想象力、观察力和判断力的共同创作者：能进入人物，理解欲望、羞耻、恐惧、骄傲、误解和沉默，也能在结构上保持清醒。","你的工作对象只有当前打开的这本书。工具里的书稿路径统一写成 `book/...`，例如 `book/outline.md`、`book/chapters/001.md`、`book/reviews/001.md`。","","# Role"," - Help the user develop the current book as a creative writing partner: organize sources, outline, draft chapters, review, revise, and maintain story files."," - When a task depends on exact chapters, settings, sources, review notes, or file paths, verify with tools before answering."," - If the user is only discussing direction, comparing options, or asking for explanation, answer directly. Write files only when the user asks you to produce or modify book content."," - In interactive-fiction drafting, the current user message is the highest instruction for this turn. If the user specifies what this chapter should cover, what it must not cover, whose perspective it follows, what emotional beat it should hold, or where it should stop, obey exactly."," - Do not autonomously decide the next chapter goal, next major beat, stopping point, hidden foreshadowing explanation, or future reveal. Expand only what the user has explicitly confirmed for this turn."," - Outline, volume plans, and story state are background constraints, not permission to predict ahead, leak future knowledge, or narrate from an author-above-the-story viewpoint."," - If the user has not given enough chapter-level direction to draft safely, stop and ask only for the missing chapter instruction instead of freewriting past the user."," - When drafting prose, prioritize living characters over task completion: characters should notice, hesitate, misread, desire, resist, remember, and change in specific moments rather than merely execute plot functions."," - Use rich but precise language, concrete sensory details, and emotionally intelligent narration. Imagination is welcome, but it must grow from this book’s characters, world, desire chain, and current scene pressure.","","# Current Book"," - The current book is the only work scope. You do not know other books and must not operate on anything outside this book."," - `book/chapters/` contains the official chapter text. The reader only reads chapters from this directory."," - Chapter text may contain `[ebook-image:slotId]`. This is an image placeholder inserted by the app after the user uses the ebook drawing feature. Unless the user explicitly asks to adjust image placement, do not delete, rename, or rewrite it as normal text."," - `book/outline.md` is the book-level skeleton and volume index. `book/volumes/` stores per-volume plans: event groups, pressure fields, user-confirmed current direction, and retrospective notes."," - `book/style.md`, `book/characters.md`, `book/world.md`, `book/state.md`, `book/notes/`, and `book/reviews/` are reference and process files, not chapter text."," - `book/sources/` contains materials imported by the user for this book. Do not pretend to have seen anything that has not been imported there or provided in the conversation."," - Files are the source of truth. Judge chapters, settings, style, and sources based on the files you have read.","","# Injected Context"," - Stable injection automatically provides `[作品核心设定]`, containing these 4 fixed files: `book/outline.md` for the book skeleton and volume index, `book/style.md` for prose and narrative rules, `book/characters.md` for characters and relationships, and `book/world.md` for world, scenes, and rules."," - `book/volumes/` is not stably injected. When you need the current volume plan, event groups, pressure fields, user-confirmed current direction, or chapter breath records, use LS / Read to inspect the relevant volume file."," - Stable injection automatically provides `[审稿规则]` from `book/review-rules.md`; it defines review tiers, rejection standards, revision standards, and book-specific bottom lines."," - Before the current user message, `[本轮作品上下文]` may be attached: current book title, created chapter count, `book/state.md`, and writing plan."," - Earlier chat turns may be released when the context grows too large. Important decisions must be written into the appropriate `book/...` files instead of relying on chat memory."," - Other UI statistics such as source word count and filled-field count are not automatically injected. Use LS / Grep / Read when you need chapter lists or source details.","","# File Discipline"," - Do not create parallel files for fixed responsibilities. Update the canonical files directly: book skeleton in `book/outline.md`, style in `book/style.md`, characters in `book/characters.md`, world in `book/world.md`, state in `book/state.md`, review standards in `book/review-rules.md`, and volume plans in `book/volumes/NNN.md`. Do not create substitutes such as `book/plot.md`, `book/project-state.md`, or `book/review-standard.md`.","","# Tool Use Guide",""," - You may call multiple tools in one assistant turn. Run independent tool calls in parallel when possible."," - If a tool returns an error, adjust the arguments or strategy based on the error. Do not repeat the same failing call without a change.","","## Tool Layers"," - Discover book structure: LS inspects directory entries only; it does not read file bodies."," - Inspect book content: Grep / Read search and read chapters, settings, sources, and review notes."," - Modify the current book: Edit / Write / Move / Delete save, revise, and organize files. Edit changes text inside existing files; Write creates files or rewrites complete files/sections/chapters, or rewrites where most content is new; Move and Delete organize files or directories."," - Rename the current book: RenameBook changes only the book title. It does not move chapters, sources, or setting files."," - Manage writing plans: PlanCreate / PlanUpdate / PlanList / PlanGet only track plans for the current book. They do not draft prose automatically. Plan ids are internal handles for later tool calls; do not explain or show them to the user unless the user asks for debugging details."," - Independent review: DelegateRun asks the read-only reviewer delegate to inspect the book and return findings. The delegate reviews and reports only; you perform any actual writes."," - The ebook currently has only one delegate type: read-only reviewer. Do not treat DelegateRun as a drafting delegate, setting-organizing delegate, or file-editing delegate.","","## Selection Strategy"," - For drafting, continuing, reviewing, and revising, first follow the injected core settings, story state, and review rules. Use tools only when you need exact chapter text, imported-source details, or precise edit locations."," - If you need a chapter or source list, use LS first. If you know a keyword, use Grep first. If you know the exact path, use Read."," - Read may return only part of a large file. Continue with nextOffset when needed, or use tail to read the end."," - For multi-step writing, long revisions, blockers, or work that must be resumed later, use Plan tools and update the plan after real progress."," - After PlanCreate, treat the returned id as the newly created plan handle. Do not say the plan already existed unless you first used PlanList/PlanGet and actually found an older matching plan."," - Use DelegateRun when you need a second review perspective, continuity check, or independent verification."," - DelegateRun task must contain only the target file path or paths, one per line. The reviewer already receives the book core context and can inspect book files by itself."," - If both core settings and imported sources lack concrete material, state the gap and next step instead of writing a polished but unsupported result.","","# 创作流程","","## 写作伙伴人格"," - 你和用户一起写一本书，让故事更有生命。"," - 你要有自己的文学判断：能指出哪里太快、太空、太像剧情说明；也能主动提出更有呼吸感、更有现场感、更能让人物成立的写法。"," - 你的心思细腻，写人物时代入 ta 的时空，用人类的五感演绎场景，不要让人物只为完成任务而说话或行动。"," - 不要把作者知道的后续剧情提前解释给读者。少写“他没有说这句话”“他没有碰她的脚”这类作者视角提示；除非它是人物当下可感的克制、误读或危险，否则让潜台词从动作、停顿、视线和后果里长出来。"," - 你有天马行空的想象力，但想象力必须服务人物、世界规则和情绪真实；不要把奇观、设定或漂亮句子堆在人物体验之外。","","## 阶段与顺序"," - 创作流程分为“规划阶段”和“动笔阶段”。规划阶段是线性的，每个产物约束下一步；动笔阶段没有章纲，完全由用户逐章指挥。","","### 规划阶段（线性，不可跳步）","","| 阶段 | 做什么 | 产物写入 | 约束了什么 |","|------|--------|----------|------------|","| 1. 开书定位 | 确定读者承诺、类型边界、核心卖点 | `book/outline.md` | 故事能往哪走、不能往哪走 |","| 2. 故事脊柱 / 欲望链 | 确定主线结构来源、角色核心驱动力 | `book/outline.md` | 全书走向和转折锚点 |","| 3. 写法方案 | 确定节奏、场景密度、慢写位置、审稿重点 | `book/style.md` | 怎么写、写多细、哪里该慢哪里该快 |","| 4. 全书大纲与卷结构 | 拆卷、定每卷核心事件 | `book/outline.md` | 每一卷要完成什么 |","| 5. 当前卷规划 | 当前卷的事件集团、情节走向 | `book/volumes/NNN.md` | 本卷要推进哪些事件 |","","### 动笔阶段（用户驱动，无章纲）","","| 步骤 | 做什么 | 产物写入 |","|------|--------|----------|","| 6. 用户指挥 | 用户说这一章/这一段写什么、从哪开始、到哪停、核心发生什么 | - |","| 7. 动笔 | AI 按用户指挥写正文 | `book/chapters/NNN.md` |","| 8. 审稿修订 | 对照写法方案和审核规范修订 | `book/chapters/NNN.md` |","| 9. 复盘 | 记录实际变化、伏笔、关系、进度 | `book/state.md` + `book/volumes/NNN.md` |","| 10. 下一章 | 用户给出下一章指挥，回到步骤 6 | - |","","## 铁律"," - 不跳阶段。当前阶段缺关键产物时，先补当前阶段。"," - 没有开书定位 -> 不做故事脊柱。"," - 没有故事脊柱和欲望链 -> 不做写法方案。"," - 没有写法方案 -> 不拆卷。"," - 没有当前卷规划 -> 不动笔。","","### 动笔铁律"," - **不做章纲。** 不提前规划章的安排，不自行拆分章节，不预排后续章节内容。"," - **用户是导演，你是写手。** 每一章写什么、从哪个场景开始、到哪里停、核心发生什么事——全部由用户决定。你不擅自扩展、不自行追加、不偷跑到用户没要求的方向或结果上。"," - **AI 的职责是润色和血肉。** 拿到用户给的骨架（方向、事件、起止点），用场景感、五感、人物内心、节奏和文字质量把它变成活的正文。"," - **不编剧情。** 用户没说的事件，不发生。用户没暗示的转折，不出现。用户没提到的角色反应，可以合理演绎细节（表情、动作、内心），但不能改变事件走向。"," - **可以建议，不可以擅动。** 如果你觉得用户的指挥有逻辑漏洞、节奏问题或与前文矛盾，应该先说出来，等用户确认后再写。不要一边写一边自己修正用户的意图。"," - **动笔前的快速校准。** 每章动笔前，确认四件事：","   1. 衔接：跟上一章怎么接。","   2. 场景：本章在哪、什么时间、谁在场。","   3. 写法：`book/style.md` 对这类场景的要求。","   4. 规避：审核规范里需要避开的点。","   这个校准必须围绕用户这次的指挥，不能变成你自己追加的剧情计划，也不能变成长问卷。用户指挥已经足够清楚时，直接动笔。"," - **写完一章就停。** 等用户给出下一章的指挥。不要预告，但可以建议下一章方向。","","## 关于提问"," - 问用户只问影响当前判断的问题，不是为了填满模板。材料足够时，主动整理、写入对应文件、进入下一阶段。","","## 关于复盘"," - 每章写完后，简短记录：本章实际发生了什么、人物关系变化、新增伏笔、时间线推进。写入 `book/state.md`。"," - 系统会自动压缩上下文；接收了新的信息、教训、故事事实或审稿结论，要及时落到对应文件里永久保存。","","## 审稿与修订纪律"," - 审稿：优先 DelegateRun，保持分身独立性，task 里只写目标文件路径；多个文件就一行一个路径。除了文件路径，其他都不允许写进 task 影响分身判断：不要写事实背景、刚修了什么、想让它重点看什么、希望它得出什么结论，审稿分身已自动拿到核心资料，也能自行 Read/Grep。"," - 审稿沉淀：主助手收到分身结果后，再按固定审稿规则整理可执行意见，必要时写入 `book/reviews/`。"," - 修订：读章节与对应审稿意见；句内和小段修改用 Edit oldString，连续中段替换用 Edit startLine/endLine，新增插入用 Edit insertAtLine，整节、整章、全文件或大部分新写才用 Write。不要无理由整章覆盖。"," - 审稿循环：通过档不用修；修改档直接按意见修，不要修完又反复送审；只有打回、整章重写、重写后结构可能大变，或用户明确要求复审时，才再次 DelegateRun。","","# 回答方式"," - 展现你对创作的热情和天赋。"," - 完成文件操作、审稿、查证或修订后，交代改了哪里、写到哪个文件、还缺什么。"].join(`
`),Dn=["# Reviewer Delegate","","## Role And Boundary","",`You are the read-only reviewer delegate for "小白电纸书". You run inside the user's SillyTavern instance through the LittleWhiteBox ebook writing workspace.`,"","- Return findings to the main assistant; the main assistant decides how to organize notes, write review files, or revise prose.","- You are an independent reviewer, not the main assistant's echo and not someone looking for excuses to pass a chapter.","- Protect this book's vitality, character truth, structural clarity, and the aesthetic boundaries confirmed by the author.","- The currently opened book is your only work scope. You do not know other books and must not handle plugin source code, SillyTavern settings, or external files.","","## Information Sources","","### Automatically Injected Context","","The ebook injects `[Reviewer Delegate Auto Context]` inside `[Context]`, including:","","| Source file | What it contains |","|-------------|------------------|","| `book/outline.md` | book premise, story spine, desire chain, whole-book skeleton, volume index |","| `book/style.md` | writing approach, pacing, prose density, revision focus |","| `book/characters.md` | characters, relationships, motivations |","| `book/world.md` | world, places, rules, atmosphere |","| `book/state.md` | story progress, relationship changes, foreshadowing state |","| `book/review-rules.md` | fixed review rules for this book |","","These files are already injected. Use them directly as judgment context; do not Read them again just to repeat the same context. If the task repeats the same kind of material, prefer the injected context.","","### Read On Demand","","- `book/volumes/`: volume plans, event groups, pressure fields, user-confirmed current direction, and retrospectives. These are not stably injected; Read them when volume continuity or pacing matters.","- `book/chapters/`: official chapter prose. When reviewing a specific chapter, you must Read that chapter body. If the chapter is missing, unreadable, or not locatable, state that the review cannot be completed.","- `book/sources/`: user-imported materials. Read them only when needed. Do not pretend to know material that has not been imported or provided.","- Adjacent chapters: Read them when continuity needs verification.","","### Special Marker","","`[ebook-image:slotId]` is an ebook image placeholder, not prose corruption. Only suggest moving it when its placement clearly harms reading or the user asks about image placement.","","## Tool Use Guide","","- You are a read-only reviewer delegate. You may only use LS / Grep / Read to inspect current book files. You cannot write files, manage plans, or delegate to another agent.","- Discover book structure: LS inspects directory entries only; it does not read file bodies.","- Inspect book content: Grep / Read search and read chapters, settings, sources, and review notes.","- When reviewing a specific chapter, you must Read that chapter body. If the chapter does not exist, cannot be read, or the task gives no locatable chapter, state that chapter review cannot be completed.","- To verify characters, settings, foreshadowing, timeline, or earlier facts, Grep keywords first, then Read the matching chapters or sources.","- To check continuity, Read adjacent chapters or imported sources as needed. Prefer injected core settings, story state, and review rules for those fixed files.","- Read may return only part of a large file. Continue with nextOffset when needed, or use tail to read the end.","- If a tool returns an error, adjust the path, arguments, or strategy based on the error. Do not repeat the same failing call without a change.","","## Review Authority","","Use this priority order:","","1. `book/review-rules.md`: fixed review rules for this book. Highest priority.","2. Textual evidence: what the chapter actually says on the page.","3. Core review principles: use these when review-rules do not cover the issue.","4. Basic continuity: consistency with injected setting, state, character, world, and style files.","","Do not use:","","- Personal preference disguised as a rule.","- The main assistant's task text as a verdict, review standard, or conclusion direction. The task should only locate the target file path or paths.","- Any factual background, revision direction, temporary checklist, or desired pass/fail framing included by the main assistant. Ignore that guidance and begin from the locatable file paths. Final judgment must return to `book/review-rules.md` and Core Review Principles.","","## Core Review Principles","","### Highest Priority Checks","","- First priority: catch task-list writing. If the prose rushes to complete a plan or event checklist while characters lack observation, misreading, bodily reaction, hesitation, choice, and aftermath, it is a serious issue. If the user direction is overloaded, say so; do not pass the chapter merely because it hit planned targets.","- First priority: catch fake iceberg exposition. If the narrator leaks future planning, unsaid lines, or actions that have not happened, it is usually author-view tell rather than subtext. Unless it is grounded in the character's present restraint, misreading, or danger, call it out. The narrator must not speak from the future.","","### Structure","","- Desire chain leads structure: ultimate desire drives the whole book; long-term desire drives a volume; mid-term desire drives an event group; short-term desire drives chapters and scenes. If structure feels arranged from nowhere, point out the missing source.","- An event group is the narrative unit: it moves from entrance state to exit state as one continuous pressure field. Chapters are natural pauses and breaths inside that flow.","- Volume plans are maps, not work orders. They are for continuity, pressure, comparison, and retrospective notes; they must not force the prose to compress life into task completion.","","### Pacing","","- User direction is the drafting unit. Judge whether this chapter or segment faithfully develops the confirmed current instruction, while preserving continuity, pressure, and character truth.","- Each chapter should have a lived scene center: a place, time, people present, pressure, reaction, and consequence. It does not need to complete a preset task list.","- Major moments must be written slowly: before it happens, near the threshold, during the action, after the action, and in the aftermath. If recognition, approach, touch, intimacy, betrayal, killing, power, or farewell is compressed into one quick completion beat, flag it first.","- Chapter-end displacement is a result, not a target. Judge where the prose actually arrives after writing, not what the plan demanded before writing.","","### Characters","","- Characters should feel alive: observing, misunderstanding, hesitating, reacting, choosing, and living through consequences instead of executing plot tasks.","- After sustained plot movement, check whether the book lacks daily life, friction, bodily experience, private thought, relationship aftermath, or lived world texture.","","### Priority","","Pacing, narrative unit, and lived character truth outrank sentence polish, punctuation, and local wording. A chapter that reads like a task checklist is a serious failure even if its sentences are smooth.","","## Workflow","","- Handle only the subtask in `[Task]`. Do not expand into the whole book or chapters the user did not ask to review.","- When reviewing a specific chapter, you must Read that chapter body.","- To verify character facts, settings, foreshadowing, timeline, or earlier events, Grep keywords first, then Read the matching chapters or sources.","- Separate issues into three types: hard faults that must be fixed, improvement suggestions that would make the chapter stronger, and author choices that may be kept.","- If information is missing, state the gap and which file would be needed. Do not invent.",'- You may directly judge "Needs revision" or "Needs rewrite", but you must explain the evidence and priority.',"","## Output","","Your result goes to the main assistant. Do not chat with the user. Include:","","1. Overall verdict: Pass / Needs revision / Needs rewrite.","2. Main issues: cite file path, chapter name, keywords, or line numbers when available. If evidence comes from injected context, say so.","3. Basis: cite `book/review-rules.md` or Core Review Principles.","4. Risk: what will break if this is not fixed.","5. Actionable revision advice: concrete and executable."].join(`
`);function Fr(t=""){return String(t||"").replace(/\r\n/g,`
`).trim()}function It(t=""){return Fr(t).replace(/\n{3,}/g,`

`)}function Ht(t=[]){const e=new Map;return(Array.isArray(t)?t:[]).forEach(r=>{const o=String(r?.path||"").trim();o&&e.set(o,r)}),e}function Wt(t={},e={}){const{fallbackContent:r=""}=e,o=t?Fr(t.content):"";return o?It(o,e.limit):r?It(r):"尚未填写。"}function Nn(t={}){return Wt(t)}function On(t={}){const e=qr.get(lt.path)||"";return t?Wt(t,{fallbackContent:e}):It(e)||"尚未填写。"}function jr(t=[],e={}){const r=Ht(t),o=["[作品核心设定]","以下固定书稿会持续作为注入上下文 prompt，不用重复调用工具阅读；需要修改对应文件时再处理。尚未填写的部分不要编造。"];return Mn.forEach(n=>{o.push("",`## ${n.label} (${n.path})`),o.push(Nn(r.get(n.path),e.limit))}),o}function Hr(t=[],e={}){const r=Ht(t);return["[审稿规则]","以下规则会持续作为审稿依据；需要调整审稿标准时再修改 `book/review-rules.md`。","",`## ${lt.label} (${lt.path})`,On(r.get(lt.path),e.limit)]}function Wr(t=[],e={}){const r=Ht(t);return["[状态追踪]","以下文件持续记录当前故事进度、关系变化、伏笔状态和待承接点；只有发生实质变化时才更新，不要为了例行记录而改动。","",`## ${tt.label} (${tt.path})`,Wt(r.get(tt.path),{fallbackContent:qr.get(tt.path)||"",limit:e.limit})]}function zn(t=[]){return["[创作进度]",`已实际创作章节：${Lr(t)} 章`]}function Ur(t={}){const e=Array.isArray(t.files)?t.files:[];return[...jr(e),"",...Hr(e)].join(`
`).trim()}function Kr(t={}){const e=t.book||{},r=String(t.currentPlansText||"").trim(),o=Array.isArray(t.files)?t.files:[],n=["[本轮作品上下文]","以下内容只描述当前这一轮的工作状态；不要把它当成正文，也不要为了复述这些信息而读取文件。","这一段只用于辅助你理解连续性。真正优先级更高的是后面的 `[用户本轮请求]`；先服从用户这一轮对章节的明确指挥，再决定是否需要参考这里。","","[当前作品]",`bookId: ${e.id||""}`,`title: ${e.title||"未命名书稿"}`];return n.push("",...zn(o)),n.push("",...Wr(o)),r&&n.push("",r),n.join(`
`).trim()}function qn(t={}){const e=t.book||{},r=Array.isArray(t.files)?t.files:[],o=String(t.currentPlansText||"").trim(),n=["[Reviewer Delegate Auto Context]","The ebook injects this context automatically. The main assistant does not need to paste it into DelegateRun; the reviewer only needs to review the target file paths from the current task.","","[Current Book]",`title: ${e.title||"未命名书稿"}`];return n.push("",...jr(r)),n.push("",...Wr(r)),n.push("",...Hr(r)),o&&n.push("",o),n.join(`
`).trim()}function or(t="",e={}){const r=String(e.selectedPath||"").trim(),o=r&&r.startsWith("book/chapters/")?r.replace("book/chapters/","book/reviews/"):"book/reviews/001.md";switch(t){case"start-book":return["我想试试写一本书。","请不要立刻写正文，也不要直接修改文件。","先用轻松的方式欢迎用户开新书，然后只问最核心的 3 到 5 个问题，帮助用户把模糊想法说出来。","问题优先围绕开书定位：类型/题材承诺、读者体验承诺、核心看点/张力源、尺度与边界。","问问题时要简短说明用途：这些答案会用于决定文风、节奏、尺度、冲突密度、日常比例、性场景功能和后续审稿标准。","这一动作只处理开书定位，不要顺手进入故事脊柱、欲望链、写法方案、卷规划或逐章安排。","用户回答后，只把结果提炼成可以写入 `book/outline.md` 里“开书定位”部分的材料；下一步再进入建书脊。"].join(`
`);case"spine":return["请帮我建立这本书的“故事脊柱”。","不要直接写完整大纲，也不要一次性生成全书细纲。","先根据当前注入的 `[作品核心设定]` 和已导入资料判断信息是否足够；不足时用问题引导用户补齐。","先确认 `book/outline.md` 的开书定位是否成立：类型/题材承诺、读者体验承诺、核心看点/张力源、尺度与边界。定位不足时先补定位，不要直接填故事脊柱。","目标是在开书定位约束下提炼主角/视角中心、起点状态、触发事件、表面目标、深层欲望、核心阻力、赌注与代价、主线位移/结局方向，并压出欲望链：终极欲望、长期欲望、中期欲望和短期欲望。","信息足够时，把结果整理进 `book/outline.md` 的故事脊柱和欲望链部分；不确定的地方明确标为待定，不要编造。","这一动作只负责把故事立起来：只做故事脊柱和欲望链，不要顺手进入写法方案、全书大纲、当前卷规划或逐章安排。","故事脊柱和欲望链成形后就停，下一步再单独处理“我准备怎样写好这本书”。"].join(`
`);case"style-plan":return["请说明“我准备怎样写好这本书”。","这一动作只处理执行方案，不处理开书定位、故事脊柱、全书大纲、当前卷规划或逐章安排。","先依据当前注入的 `[作品核心设定]` 判断材料是否足够；如果开书定位或故事脊柱还没成形，先指出缺口，并要求先完成它们。","请围绕这几件事提出一版清楚的写法方案：阅读体验落地、叙事视角、场景推进、日常余波、慢写规则、关系推进、信息释放和禁止写法。","说明这套写法为什么适合当前这本书：它会如何影响欲望链落点、场景密度、慢写位置、日常比例、切章呼吸点和审稿重点。","用户确认后，把结果整理进 `book/style.md`；不要顺手扩写 `book/outline.md` 或 `book/volumes/NNN.md`。"].join(`
`);case"outline":return["请为当前作品草拟或更新大纲。","先依据当前注入的 `[作品核心设定]` 和已导入资料判断材料是否足够。","如果核心设定和资料区都缺少具体内容，不要硬写完整大纲；优先按 `book/outline.md` 顶部“新书建档引导”分轮处理：先收集开书定位，再压实故事脊柱和欲望链。","如果 `book/style.md` 还没有“我准备怎样写好这本书”的执行方案，不要继续；先完成写法确认。","全书大纲先定骨架：开书定位、故事脊柱、欲望链、主线变化、关键阶段、结局方向、主要压力场和大致卷结构。不要只写“下一章”。","先用欲望链引领结构：终极欲望牵引全书，长期欲望牵引卷，中期欲望牵引事件集团，短期欲望分布到章节和场景；不要让卷和事件集团凭空冒出来。","卷结构要说明大概几卷、每卷主题、对应长期欲望、入卷/出卷状态、核心位移和主要压力场。","这一动作只负责“全书怎么走”：更新 `book/outline.md` 里的全书骨架和卷结构，不要顺手写 `book/volumes/NNN.md`、当前卷事件集团或逐章安排。","如无必要，不一次性生成全书每章细纲，也不要提前展开整卷每章章纲。","材料足够时主动更新 `book/outline.md` 的全书骨架；如果只需要资料区某一处细节，再按需读取对应资料。","大纲先作为草稿，不要假装已经定稿；必要时同步更新 `book/characters.md`、`book/world.md`、`book/style.md`、`book/review-rules.md` 和 `book/state.md`。"].join(`
`);case"volume-plan":return["请制定当前卷规划。","这一动作只处理当前卷，不处理开书定位、故事脊柱、全书卷结构，也不直接起草正文。","先依据当前注入的 `[作品核心设定]` 判断条件是否成立；如果 `book/outline.md` 还没有全书骨架和卷结构，先指出缺口，并要求先完成大纲。","如果 `book/style.md` 还没有“我准备怎样写好这本书”的执行方案，不要继续；先完成写法确认。","当前卷规划写入 `book/volumes/NNN.md`：先明确本卷对应的长期欲望，再拆本卷中期欲望和事件集团，最后记录当前可写方向。","事件集团是中期欲望形成的压力场。不要让它凭空冒出来，也不要把它写成章节任务清单。","这一阶段只需要本卷可执行骨架：卷目标、入卷/出卷状态、本卷长期欲望、事件集团骨架、当前可写方向。不要提前展开逐章章纲。","卷规划是地图，不是工单；当前卷能进入写作即可，不要顺手定死整卷每章安排。"].join(`
`);case"next-chapter":return["请按用户本轮指挥推进当前章节或段落。","默认依据当前注入的 `[作品核心设定]` 和当前书稿状态校准连续性。","如果大纲或关键设定明显不足，不要直接硬写长正文；先说明现在缺什么，并建议用户先补大纲、设定或导入资料。","如果当前卷还没有可执行的卷规划，先要求完成 `volume-plan`：本卷长期欲望、中期欲望/事件集团、当前可写方向；不要在这里回头补全书结构。","不要补章纲，不要自行拆分后续章节，不要替用户预排这一章之后的安排。","进入正文前，先从 `[用户本轮请求]` 里提炼本次明确指挥：写哪一章、聚焦谁、发生什么、不要发生什么、停在哪里。没有明确写出的部分不要擅自补成你自己的章节计划。","如果用户没有明确本章范围、核心内容或停止点，不要自己决定“那就继续写下一章到自然呼吸点”。先问清缺的那一项，再动笔。","即使你看得到大纲和卷规划，它们也只是背景约束，不是授权你抢跑后续剧情。不要提前写出用户本轮没有明确要求的后续发展、解释性伏笔、答案揭示或作者上帝视角。","一旦开始写，只写用户这次明确要求的这一章或这一段，写到用户指定的停止点就停；如果用户没有给停止点，只能停在当前明确指挥所覆盖的最近完成点，不得顺手多写后续章节。","不要把章节当任务清单，也不要把大纲当工单执行。正文只能展开用户已经确认的部分，其余保持克制。","需要承接具体情节时，只读取目标章节或相邻章节。","只有当用户明确要求你写第一章或指定下一章时，才选择对应 `book/chapters/NNN.md`；不要因为系统里存在空章节或下一编号就自动开写。","写完这次用户明确要求的部分就停，不要顺手继续本轮其余章节，也不要替用户预先规划下一步。","如果本轮造成故事进度、关系、伏笔或承接点的实质变化，再同步更新 `book/state.md` 和卷规划里的本轮复盘。"].join(`
`);case"opening-options":return["请帮我试写这本书的开场方向。","不要直接写入文件，也不要一上来长篇续写。","先依据当前注入的 `[作品核心设定]`、状态追踪和已导入资料判断材料是否足够。","如果信息不足，先问 2 到 4 个会影响开场的关键问题。","如果信息足够，给 2 到 3 个不同开场方案，每个方案说明开场画面、人物压力、第一处关系/认知位移，以及适合的写法。","最后建议用户选一个方向后，再开始写入 `book/chapters/001.md`。"].join(`
`);case"review":return[`请审稿当前章节：${r||"book/chapters/001.md"}。`,"先确认当前章节和必要的上下文文件是否存在；如果关键文件缺失，就先明确指出缺口。","先调用 DelegateRun 让只读审稿分身独立检查章节、大纲、风格、状态追踪和设定连续性。",`把审稿意见整理写入 ${o}，重点给可执行修改建议，不要做出版级承诺。`].join(`
`);case"revise":return[`请按审稿意见修订当前章节：${r||"book/chapters/001.md"}。`,"先确认章节文件和对应审稿文件是否存在；如果缺少其中任一项，就先告诉用户当前还不能修订，并说明下一步该补什么。",`读取章节和对应审稿文件（优先 ${o}）；小修用 Edit oldString，连续中段替换用 Edit startLine/endLine，新增插入用 Edit insertAtLine，整节或整章重写用 Write。`,"修订后如果故事事实、关系或伏笔状态发生变化，同步更新 `book/state.md`，再说明改动点和仍需人工确认的地方。"].join(`
`);case"organize":return["请整理当前作品设定。","先依据当前注入的 `[作品核心设定]` 和已导入资料判断现有材料是否足够。","如果资料区为空，而且核心设定缺少具体内容，不要装作已经掌握设定；先说明当前材料太少，并建议用户先导入资料或补充关键事实。","材料足够时，把角色、世界观、风格规则分别补到 `book/characters.md`、`book/world.md`、`book/style.md`；需要资料区细节时再按需读取。","只整理已经有材料支撑的内容，不要编造未导入设定。"].join(`
`);default:return String(e.text||"").trim()}}function p(t=""){return String(t??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function Fn(t,e={}){try{return JSON.parse(t||"{}")}catch{return e}}function Gr(t,e=2){try{return JSON.stringify(t,null,e)}catch{return String(t||"")}}function Ne(t="",e=800){const r=String(t||"").replace(/\s+/g," ").trim();return r.length>e?`${r.slice(0,e)}...`:r}function jn(t=""){const e=String(t||"").trim();if(!e)return 0;const r=e.match(/[\u3400-\u9fff\uf900-\ufaff]/g)?.length||0,o=e.match(/[A-Za-z0-9_]+(?:[-'][A-Za-z0-9_]+)*/g)?.length||0,n=e.replace(/[\u3400-\u9fff\uf900-\ufaff]/g,"").replace(/[A-Za-z0-9_]+(?:[-'][A-Za-z0-9_]+)*/g,"").replace(/\s+/g,"").length;return Math.max(1,Math.ceil(r+o*1.3+n/3))}function Yr(t=""){const e=String(t||""),r=e.trim();return{chars:r.length,lines:r?e.replace(/\r\n?/g,`
`).split(`
`).length:0,tokens:jn(e)}}function Hn(t=""){const e=Yr(t);return`${e.chars} 字 · ${e.lines} 行`}function Ut(t=""){const e=Yr(t),r=e.chars?Math.max(1,Math.ceil(e.chars/800)):0;return`${e.chars} 字 · ${e.lines} 行 · 约 ${r} 页`}var _t=[{key:"chapters",title:"正文",description:"阅读器只读取这里的章节。",badge:"阅读器",empty:"还没有正文。",basePath:"book/chapters/",matches:t=>t.startsWith("book/chapters/")},{key:"settings",title:"设定草稿",description:"它们是写作依据，不进阅读器。",badge:"草稿",empty:"还没有设定草稿。",basePath:"book/",matches:t=>["book/outline.md","book/style.md","book/characters.md","book/world.md","book/state.md","book/review-rules.md"].includes(t)||t.startsWith("book/reviews/")||t.startsWith("book/notes/")||t.startsWith("book/volumes/")},{key:"sources",title:"导入资料",description:"从酒馆导入当前聊天全部楼层、角色信息、小白X剧情总结和世界书。",badge:"素材",empty:"还没有导入资料。",basePath:"book/sources/",matches:t=>t.startsWith("book/sources/")}],nr=["book/chapters/","book/outline.md","book/style.md","book/characters.md","book/world.md","book/state.md","book/review-rules.md","book/reviews/","book/notes/","book/volumes/","book/sources/"],Wn=24e3,wt=new WeakMap,ar=new WeakMap,ir=1;function Xr(t){return!t||typeof t!="object"?"0":(wt.has(t)||(wt.set(t,ir),ir+=1),wt.get(t))}function sr(t=""){const e=String(t||"");let r=2166136261;for(let o=0;o<e.length;o+=1)r^=e.charCodeAt(o),r=Math.imul(r,16777619);return(r>>>0).toString(36)}function ct(t,e="",r=""){const o=String(r||"");if(!t||typeof t!="object")return`${o.length}:${sr(o)}`;const n=ar.get(t)||{};if(n[e]?.text===o)return n[e].signature;const a=`${o.length}:${sr(o)}`;return n[e]={text:o,signature:a},ar.set(t,n),a}function lr(t=""){const e=nr.findIndex(r=>t===r||t.startsWith(r));return e>=0?e:nr.length}function Jr(t=[]){return[...t].sort((e,r)=>{const o=lr(e.path),n=lr(r.path);return o!==n?o-n:e.path.localeCompare(r.path,"zh-CN")})}function Vr(t=[]){return Jr(t).filter(e=>/^book\/chapters\/.+\.md$/.test(e.path))}function Un(t={}){const e=Vr(t.files),r=e.some(o=>o.path===t.readerPath)?t.readerPath:e[0]?.path||"";return{chapters:e,activePath:r,active:e.find(o=>o.path===r)||null,index:Math.max(0,e.findIndex(o=>o.path===r))}}function Kn(t=""){const e=t.match(/^book\/chapters\/(.+)\.md$/);if(!e)return"";const r=e[1];return/^\d+$/.test(r)?`第 ${Number(r)} 章`:r}function Gn(t=""){const e=String(t||"").match(/^book\/volumes\/(.+)\.md$/);if(!e)return"";const r=e[1].split("/").pop()||e[1];return/^\d+$/.test(r)?`第 ${Number(r)} 卷规划`:`${r} 规划`}function Te(t=""){const e={"book/outline.md":"大纲","book/style.md":"文风规则","book/characters.md":"角色设定","book/world.md":"世界设定","book/state.md":"状态追踪","book/review-rules.md":"审稿规则","book/notes/revision-plan.md":"修订计划","book/sources/chat.md":"当前聊天资料","book/sources/character.md":"角色资料","book/sources/story-summary.md":"剧情总结资料","book/sources/worldbook.md":"世界书资料"};if(e[t])return e[t];const r=Kn(t);if(r)return r;const o=Gn(t);return o||(t.startsWith("book/sources/")?t.replace(/^book\/sources\//,"").replace(/\.md$/,"").split("/").pop()||t:t.startsWith("book/reviews/")?`审稿 ${t.replace(/^book\/reviews\//,"").replace(/\.md$/,"").split("/").pop()||""}`:t.startsWith("book/notes/")?t.replace(/^book\/notes\//,"").replace(/\.md$/,"").split("/").pop()||t:t.replace(/^book\//,""))}function Yn(t=""){return/^book\/chapters\/.+\.md$/.test(String(t||""))}function dr(t=""){return String(t||"").replace(/\[ebook-image:[a-z0-9\-_]+\]/gi,"").trim()}function Zr(t=0){const e=Number(t)?new Date(Number(t)):null;return!e||Number.isNaN(e.getTime())?"暂无更新时间":e.toLocaleDateString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}function Qr(t={}){const e=String(t.provider||""),r=[];return String(t.model||"").trim()||r.push("模型"),e==="openai-compatible"&&!String(t.baseUrl||"").trim()&&r.push("URL"),r.length?{canRun:!1,level:"error",text:`还不能发送：请先补好 ${r.join(" / ")}。`}:(e==="openai-compatible"||e==="sillytavern-openai-compatible")&&t.toolMode!=="tagged-json"?{canRun:!0,level:"warn",text:"这套模型有时不太稳定，写作过程中可能会中断。"}:{canRun:!0,level:"ok",text:"写作助手只会读写这本书。"}}function bt(t=0){return`${Math.max(0,Math.round((Number(t)||0)/1e3))}k`}function Xn(){let t=2166136261,e=522970236,r=0,o=0;function n(s=""){const l=String(s??"");o+=1,r+=l.length;for(let b=0;b<l.length;b+=1){const y=l.charCodeAt(b);t^=y,t=Math.imul(t,16777619),e^=y+2654435769+(e<<6)+(e>>>2),e=Math.imul(e,1597334677)}}function a(s,l=""){n(""),n(s),n(""),n(l)}function i(){return[r,o,(t>>>0).toString(36),(e>>>0).toString(36)].join(":")}return{addField:a,digest:i}}function eo(t,e){const r=Ve({webSearchEnabled:Je(e)});return Ko(t.messages||[],r,e).map(o=>o.reasoning_content||"").filter(Boolean).join(`
`)}function to(t={},e={}){const r=Xn();r.addField("book-id",t.book?.id||""),r.addField("provider",e?.provider||""),r.addField("model",e?.model||""),r.addField("tool-mode",e?.toolMode||""),r.addField("replayed-reasoning",eo(t,e));const o=Array.isArray(t.files)?t.files:[];r.addField("file-count",o.length),o.forEach((a,i)=>{r.addField(`file:${i}:path`,a?.path||""),r.addField(`file:${i}:content`,a?.content||"")});const n=Array.isArray(t.messages)?t.messages:[];return r.addField("message-count",n.length),n.forEach((a,i)=>{r.addField(`message:${i}:role`,a?.role||""),r.addField(`message:${i}:content`,a?.content||""),r.addField(`message:${i}:error`,a?.error?"1":"0"),r.addField(`message:${i}:tool-call-id`,a?.toolCallId||""),r.addField(`message:${i}:tool-name`,a?.toolName||"");const s=Array.isArray(a?.toolCalls)?a.toolCalls:[];r.addField(`message:${i}:tool-call-count`,s.length),s.forEach((l,b)=>{r.addField(`message:${i}:tool-call:${b}:id`,l?.id||""),r.addField(`message:${i}:tool-call:${b}:name`,l?.name||""),r.addField(`message:${i}:tool-call:${b}:arguments`,l?.arguments||"")})}),r.digest()}function ro(t={},e={}){const r=t.contextStats&&typeof t.contextStats=="object"?t.contextStats:null;if(!r)return null;const o=to(t,e);if(r.stateKey!==o&&!(t.isBusy&&r.source==="resolved"))return null;const n=Number(r.usedTokens);return Number.isFinite(n)?{...r,usedTokens:n}:null}function Jn(t={},e={}){const r=Ur({book:t.book,files:t.files}),o=Kr({book:t.book,files:t.files}),n=[];n.push(`[System]
${Rt}`),n.push(`[Stable context]
${r}`),n.push(`[Turn context]
${o}`),n.push(`[Tools]
${JSON.stringify(Ve({webSearchEnabled:Je(e)}))}`),(t.messages||[]).forEach(i=>{if(!i||!["user","assistant","tool"].includes(i.role))return;const s=i.role==="user"?"用户":i.role==="tool"?`工具:${i.toolName||i.toolCallId||""}`:"电纸书",l=i.role==="assistant"&&Array.isArray(i.toolCalls)&&i.toolCalls.length?i.toolCalls.map(b=>`${b.name} ${b.arguments||"{}"}`).join(`
`):"";n.push(`${s}: ${[i.content||"",l].filter(Boolean).join(`
`)}`)});const a=eo(t,e);return a&&n.push(a),Uo(n.join(`

`))}function oo(t={},e={}){const r=ro(t,e);return`${bt(r?r.usedTokens:Jn(t,e))}/${bt(zr)}`}function no(t={},e={}){const r=ro(t,e);return String(r?.source||"").trim()==="resolved"?"最近一次发模上下文 / 188k":"当前估算送模上下文 / 188k"}function Vn(t={}){const e=t.compactionOverlay||{};if(!e.active)return"";const r=bt(e.currentTokens),o=Number(e.yieldTokens)>0?bt(e.yieldTokens):"....",n=String(e.status||"").trim()||"正在释放较早对话...";return`
        <div class="xb-distillation-layer${e.resolved?" resolved":""}" role="status" aria-live="polite">
            <div class="xb-distillation-backdrop"></div>
            <div class="xb-distillation-aura"></div>
            <section class="xb-distillation-plaque" aria-label="上下文释放">
                <div class="xb-distillation-title">CONTEXT DISTILLATION</div>
                <div class="xb-distillation-status">${p(n)}</div>
                <div class="xb-distillation-metrics">
                    <div class="xb-distillation-metric">
                        <strong>${p(r)}</strong>
                        <span>Current Load</span>
                    </div>
                    <div class="xb-distillation-divider" aria-hidden="true"></div>
                    <div class="xb-distillation-metric">
                        <strong class="xb-distillation-yield">${p(o)}</strong>
                        <span>Yield</span>
                    </div>
                </div>
            </section>
            <div class="xb-distillation-ripple" aria-hidden="true"></div>
        </div>
    `}function Zn(t={}){const e=t.protocolNotice||{},r=String(e.message||"").trim();return r?`
        <div class="xb-protocol-notice" role="status" aria-live="polite">
            <span>${p(r)}</span>
        </div>
    `:""}function ao(t={},e={}){const r=pt(t.thoughts);if(!r.length)return"";const o=String(e.key||"").trim(),n=!!t.streaming,a=n||o&&Array.isArray(e.openThoughtKeys)&&e.openThoughtKeys.includes(o),i=r.length>1?`${t.streaming?"正在思考":"展开思考块"}（${r.length} 段）`:t.streaming?"正在思考":"展开思考块";return`
        <details class="xb-thought-details"${o?` data-thought-key="${p(o)}"`:""}${n?' data-auto-open-thought="true"':""}${a?" open":""}>
            <summary>${p(i)}</summary>
            ${r.map(s=>`
                <div class="xb-thought-block">
                    <div class="xb-thought-label">${p(s.label)}</div>
                    <pre>${p(s.text)}</pre>
                </div>
            `).join("")}
        </details>
    `}function dt(t){return t.uiProcessId??=Xr(t),`tool-turn:${t.uiProcessId}`}function Qn(t={},e=-1){const r=t.messages||[];let o=r.length-1;for(;o>=0&&r[o]?.role!=="user";)o-=1;return!!t.isBusy&&e>o}function Kt(t=""){try{const e=JSON.parse(String(t||"{}"));return e&&typeof e=="object"?e:{}}catch{return{}}}function rt(t="",e=""){const r=String(t||""),o=`"${e}"`,n=r.indexOf(o);if(n<0)return"";const a=r.indexOf(":",n+o.length);if(a<0)return"";let i=a+1;for(;i<r.length&&/\s/.test(r[i]);)i+=1;if(r[i]!=='"')return"";let s=i+1,l=!1;for(;s<r.length;){const b=r[s];if(l)l=!1;else if(b==="\\")l=!0;else if(b==='"')try{return JSON.parse(r.slice(i,s+1))}catch{return""}s+=1}return""}function ea(t="",e={}){const r=String(t||"");if(e.forceParse||r.length<=Wn)return Kt(r);const o=rt(r,"summary")||rt(r,"message")||rt(r,"error");return{__previewOnly:!0,ok:/"ok"\s*:\s*false/.test(r)?!1:void 0,summary:o,message:o,error:rt(r,"error")}}function io(t=""){return["PlanCreate","PlanUpdate","PlanList","PlanGet"].includes(String(t||""))}function ta(t=""){switch(String(t||"").trim()){case"pending":return"待办";case"in_progress":return"进行中";case"blocked":return"阻塞";case"completed":return"已完成";case"failed":return"失败";case"cancelled":return"已取消";default:return t||"未知"}}function ra(t=""){const e=String(t||"").trim();return e==="completed"?"✓":e==="failed"||e==="cancelled"?"×":""}function oa(t={},e=""){const r=t.plan&&typeof t.plan=="object"?t.plan:null,o=Array.isArray(t.plans)?t.plans:[];return t.ok===!1?t.error?`计划工具失败：${t.error}`:"计划工具失败":e==="PlanList"?`计划列表：${Number(t.count)||o.length||0} 项`:e==="PlanGet"?r?`计划：${r.title||"未命名计划"}`.trim():"计划不存在":e==="PlanCreate"?`计划已创建：${r?.title||"未命名计划"}`.trim():e==="PlanUpdate"?`计划已更新：${r?.title||"未命名计划"}`.trim():t.summary||"计划已返回"}function cr(t={}){const e=String(t.title||"未命名计划").trim(),r=String(t.status||"").trim(),o=Array.isArray(t.blockedBy)?t.blockedBy.length:0,n=[[r?`状态：${ta(r)}`:"",t.priority?`优先级：${t.priority}`:"",o?`依赖：${o} 项`:""].filter(Boolean).join("，"),t.result?`结果：${Ne(t.result,180)}`:"",t.error?`错误：${Ne(t.error,180)}`:""].filter(Boolean).join(`
`);return`
        <div class="xb-tool-plan-item">
            <span class="xb-tool-plan-box">${p(ra(r))}</span>
            <p>
                <strong>${p(e)}</strong>
                ${n?`<small>${p(n)}</small>`:""}
            </p>
        </div>
    `}function na(t={},e=Kt(t.content)){if(!io(t.toolName))return"";const r=e.plan&&typeof e.plan=="object"?e.plan:null,o=Array.isArray(e.plans)?e.plans:[],n=Array.isArray(e.blockers)?e.blockers.filter(s=>s&&typeof s=="object"):[],a=o.length?o:r?[r]:[];if(!(r||o.length||n.length||e.ok===!1||e.summary||e.message||e.error))return"";const i=n.map(s=>({id:s.id,title:s.title||s.id,status:s.status||"blocked"}));return`
        <div class="xb-tool-plan">
            <small>${p(oa(e,t.toolName)||"计划已返回")}</small>
            ${a.length?`<div class="xb-tool-plan-list">${a.map(cr).join("")}</div>`:""}
            ${i.length?`
                <div class="xb-tool-plan-blockers">
                    <span>阻塞项</span>
                    <div class="xb-tool-plan-list">${i.map(cr).join("")}</div>
                </div>
            `:""}
            ${e.ok===!1&&e.message?`<small>${p(e.message)}</small>`:""}
        </div>
    `}function br(t={},e=null){const r=e&&typeof e=="object"?e:Kt(t.content),o=r.__previewOnly?`${t.toolName||"工具"} 已返回结果。`:String(t.content||"");return Ne(r.summary||r.message||r.error||o,220)||"工具已返回结果。"}function aa(t=0){const e=Number(t)||0;return e?`${(e/1e3).toFixed(1)}s`:""}function ia(t={}){const e=Array.isArray(t.payload)?t.payload:[];return e.length?`
        <div class="xb-tool-payload">
            ${e.map(r=>`
                <div class="xb-tool-payload-row">
                    <span>${p(r.label||"")}</span>
                    <p>${p(Ne(r.text||"",260))}</p>
                </div>
            `).join("")}
        </div>
    `:""}function sa(t={}){const e=Array.isArray(t.progress)?t.progress:[];return e.length?`
        <div class="xb-tool-progress">
            ${e.map(r=>`
                <div class="xb-tool-progress-row">
                    <span>${p(r.label||"")}</span>
                    <p>${p(Ne(r.text||"",260))}</p>
                </div>
            `).join("")}
        </div>
    `:""}function so(t={}){const e=t.status==="running"||t.status==="resolved",r=t.status==="running",o=ia(t),n=sa(t),a=!!o,i=e?r?"运行中":t.ok===!1?"失败":"已返回":"",s=e&&!r?aa(t.elapsedMs):"",l=s?` · ${s}`:"",b=Ne(t.summary,220)||(r?"工具已发起，等待返回。":"工具已返回结果。"),y=["xb-tool",a?"has-payload":"",e?r?"is-running":"is-resolved":"",t.ok===!1?"is-error":""].filter(Boolean).join(" "),f=`
        ${`
        <div class="xb-tool-head">
            <span>${p(t.title||t.name||"工具调用")}</span>
            ${i?`<em>${p(`${i}${l}`)}</em>`:""}
        </div>
    `}
        <small>${p(b)}</small>
    `;return`
        <div class="${p(y)}">
            ${a?`
                ${o}
                ${n}
                <div class="xb-tool-result">${f}</div>
            `:`${n}${f}`}
        </div>
    `}function la(t={}){const e=ea(t.content,{forceParse:io(t.toolName)}),r=na(t,e),o=t.toolDisplay&&typeof t.toolDisplay=="object"?t.toolDisplay:null;return o?r?`
            <div class="xb-tool ${e.ok===!1?"is-error":"is-resolved"}">
                <div class="xb-tool-head">
                    <span>${p(o.title||t.toolName||"工具结果")}</span>
                    <em>${p(o.status==="running"?"运行中":"已返回")}</em>
                </div>
                ${r}
            </div>
        `:so({name:t.toolName||"工具结果",title:o.title||t.toolName||"工具结果",ok:e.ok!==!1,status:o.status||"resolved",summary:br(t,e),payload:Array.isArray(o.payload)?o.payload:[],elapsedMs:Number(o.elapsedMs)||0}):`
            <div class="xb-tool ${e.ok===!1?"is-error":""}">
                <div class="xb-tool-plain-title">${p(t.toolName||"工具结果")}</div>
                ${r||`<small>${p(br(t,e))}</small>`}
            </div>
        `}function lo(t=""){return Pr(String(t||"").trim())}function St(t=""){return p(t).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/(^|[^*])\*([^*\n]+)\*/g,"$1<em>$2</em>")}function da(t=""){const e=String(t||"").trim();if(!e)return"";const r=e.match(/^(#{1,6})\s+(.+)$/);if(r){const o=Math.min(3,r[1].length);return`<h${o}>${St(r[2])}</h${o}>`}return/^>\s?/.test(e)?`<blockquote>${St(e.split(`
`).map(o=>o.replace(/^>\s?/,"")).join(`
`)).replace(/\n/g,"<br>")}</blockquote>`:`<p>${St(e).replace(/\n/g,"<br>")}</p>`}function ca(t="",e=0){const r=String(t||"").trim();let o=Pr(r);return o===p(r).replace(/\n/g,"<br>")&&(o=da(r)),o?`<div class="xb-reader-md${e===0?" xb-reader-drop":""}" data-reader-block-key="reader-block:${e}">${o}</div>`:""}function ba(t={}){if(t.isShelfLoading)return`<div class="xb-empty xb-library-empty">${p(t.status||"正在打开书架...")}</div>`;if(t.shelfLoadError)return`
            <div class="xb-empty xb-library-empty">
                <p>${p(t.status||"书架加载失败")}</p>
                <button id="xb-library-retry-shelf" class="xb-shelf-action" type="button">重试打开书架</button>
            </div>
        `;if(!t.books.length)return'<div class="xb-empty xb-library-empty">书架上还没有书。</div>';const e=!!t.isDeleteBookOpen;return t.books.map(r=>{const o=r.id===t.book?.id?" is-active":"",n=e?" is-delete-target":"",a=e?`data-delete-book-id="${p(r.id)}"`:`data-book-id="${p(r.id)}"`,i=ua(r,t);return`
            <button class="xb-library-book${o}${n}" ${a} ${t.isBusy||t.isShelfLoading||t.shelfLoadError?"disabled":""}>
                <span class="xb-book-spine"></span>
                <span class="xb-library-book-main">
                    <strong>${p(r.title||"未命名书稿")}</strong>
                    <small>${e?"点击删除这本书":`已创作 ${i} 章`}</small>
                </span>
                <span class="xb-library-book-foot">
                    <em>${e?"DELETE":`${i}章`}</em>
                    <small>${p(Zr(r.updatedAt))}</small>
                </span>
            </button>
        `}).join("")}function ua(t={},e={}){const r=Number(t.chapterCount);return Number.isFinite(r)&&r>=0?Math.floor(r):t.id&&t.id===e.book?.id?Vr(e.files).filter(o=>{const n=String(o.content||"").trim();return n&&n!=="从这里开始写正文。"}).length:0}function pa(t={},e=0){const r=!!t.isDeleteBookOpen,o=!!t.isShelfLoading||!!t.shelfLoadError,n=e>0&&!t.isBusy&&!o;return`
        <div class="xb-shelf-actions" aria-label="书架操作">
            <button id="xb-library-new-book" class="xb-shelf-action" type="button" title="新建书稿" aria-label="新建书稿" ${t.isBusy||o?"disabled":""}>
                <span class="xb-shelf-action-ring" aria-hidden="true">+</span>
                <strong>新建书稿</strong>
            </button>
            ${r?`
                <button id="xb-delete-book-close" class="xb-shelf-action xb-shelf-action-danger is-active" type="button" title="退出删除模式" aria-label="退出删除模式">
                    <span class="xb-shelf-action-ring" aria-hidden="true">-</span>
                    <strong>退出删除</strong>
                </button>
            `:`
                <button id="xb-library-delete-book" class="xb-shelf-action xb-shelf-action-danger" type="button" title="删除书稿" aria-label="删除书稿" ${n?"":"disabled"}>
                    <span class="xb-shelf-action-ring" aria-hidden="true">-</span>
                    <strong>删除书稿</strong>
                </button>
            `}
        </div>
    `}function Mt(){return`
        <svg class="xb-exit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <path d="M16 17l5-5-5-5"></path>
            <path d="M21 12H9"></path>
        </svg>
    `}function ga(){return`
        <svg class="xb-theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3v12"></path>
            <path d="m7 10 5 5 5-5"></path>
            <path d="M5 21h14"></path>
            <path d="M5 17v4"></path>
            <path d="M19 17v4"></path>
        </svg>
    `}function ha(){return`
        <svg class="xb-theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 21V9"></path>
            <path d="m7 14 5-5 5 5"></path>
            <path d="M5 3h14"></path>
            <path d="M5 3v4"></path>
            <path d="M19 3v4"></path>
        </svg>
    `}function xa(){return`
        <svg class="xb-theme-icon xb-transfer-tray-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3v10"></path>
            <path d="m8 9 4 4 4-4"></path>
            <path d="M5 14.5v3.2c0 1 .8 1.8 1.8 1.8h10.4c1 0 1.8-.8 1.8-1.8v-3.2"></path>
            <path d="M8 16.5h8"></path>
        </svg>
    `}function xt(t="dark"){return t==="light"?'<span class="xb-theme-glyph" aria-hidden="true">☾</span>':`
        <svg class="xb-theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>
    `}function fa(t={}){if(!t.isBookTransferMenuOpen)return"";const e=Array.isArray(t.books)?t.books.length:0,r=!!t.bookTransferProgress,o=t.isBusy||r||t.isShelfLoading||t.shelfLoadError;return`
        <div class="xb-ebook-delete-overlay xb-ebook-transfer-menu-overlay" id="xb-book-transfer-menu-overlay">
            <div class="xb-ebook-delete-dialog xb-ebook-transfer-menu-dialog" role="dialog" aria-modal="true" aria-labelledby="xb-book-transfer-menu-title">
                <div class="xb-ebook-delete-head">
                    <div>
                        <h2 id="xb-book-transfer-menu-title">书籍传输</h2>
                    </div>
                    <button id="xb-book-transfer-menu-close" class="xb-icon-button" type="button" title="关闭" aria-label="关闭">×</button>
                </div>
                <div class="xb-book-transfer-menu-list">
                    <button class="xb-book-transfer-menu-choice" type="button" id="xb-book-transfer-download" ${o||!e?"disabled":""}>
                        <span>${ha()}</span>
                        <strong>下载书籍</strong>
                    </button>
                    <button class="xb-book-transfer-menu-choice" type="button" id="xb-book-transfer-upload" ${o?"disabled":""}>
                        <span>${ga()}</span>
                        <strong>上传书籍</strong>
                    </button>
                </div>
            </div>
        </div>
    `}function ma(t={}){if(!t.isBookExportOpen)return"";const e=Array.isArray(t.books)?t.books:[],r=!!t.bookTransferProgress;return`
        <div class="xb-ebook-delete-overlay xb-ebook-export-overlay" id="xb-book-export-overlay">
            <div class="xb-ebook-delete-dialog xb-ebook-export-dialog" role="dialog" aria-modal="true" aria-labelledby="xb-book-export-title">
                <div class="xb-ebook-delete-head">
                    <div>
                        <h2 id="xb-book-export-title">导出作品包</h2>
                        <p class="xb-ebook-export-note">选择一本书，导出书稿文件和已引用的阅读器配图。</p>
                    </div>
                    <button id="xb-book-export-close" class="xb-icon-button" type="button" title="关闭" aria-label="关闭">×</button>
                </div>
                <div class="xb-ebook-delete-list xb-ebook-export-list">
                    ${e.length?e.map(o=>`
            <button class="xb-ebook-export-book" type="button" data-export-book-id="${p(o.id)}" ${t.isBusy||r?"disabled":""}>
                <span>
                    <strong>${p(o.title||"未命名书稿")}</strong>
                    <small>${p(Zr(o.updatedAt))}</small>
                </span>
                <em>导出</em>
            </button>
        `).join(""):'<div class="xb-ebook-delete-note">书架上还没有可导出的书。</div>'}
                </div>
            </div>
        </div>
    `}function ya(t={}){const e=t.bookTransferProgress;if(!e)return"";const r=e.mode==="import"?"导入作品包":"导出作品包",o=String(e.title||"").trim(),n=String(e.detail||"").trim()||"正在处理作品包...";return`
        <div class="xb-ebook-transfer-overlay" role="status" aria-live="polite">
            <div class="xb-ebook-transfer-panel">
                <div class="xb-ebook-transfer-orbit" aria-hidden="true">
                    <span></span>
                    <span></span>
                </div>
                <div class="xb-ebook-transfer-copy">
                    <strong>${p(r)}</strong>
                    ${o?`<small>${p(o)}</small>`:""}
                    <p>${p(n)}</p>
                </div>
                <div class="xb-ebook-transfer-bar" aria-hidden="true"><span></span></div>
            </div>
        </div>
    `}function ka(t={}){const e=t.state||{},r=Array.isArray(e.books)?e.books.length:0,o=e.colorTheme==="light"?"theme-light":"theme-dark",n=xt(e.colorTheme),a=e.colorTheme==="light"?"切换为深色视觉":"切换为白底黑字",i=!!e.bookTransferProgress,s=!!e.isShelfLoading||!!e.shelfLoadError,l=String(e.status||"").trim(),b=e.isShelfLoading||e.shelfLoadError?l||"正在打开书架...":r?`${r} 本书稿 · 本地书架`:"本地书架 · 等待第一本书稿";return`
        <div class="xb-ebook-screen xb-library-screen ${p(o)}${e.isDeleteBookOpen?" is-delete-mode":""}">
            <div class="xb-ambient-aurora"></div>
            <header class="xb-archive-header">
                <div class="xb-archive-title-block">
                    <h1>小白电纸书</h1>
                    <p class="xb-archive-subtitle">Agent 沉浸式创作与阅读平台</p>
                    <div class="xb-archive-meta">${p(b)}</div>
                </div>
                <div class="xb-global-actions">
                    <button id="xb-library-transfer-book" class="xb-glass-button xb-transfer-button" type="button" title="书籍传输" aria-label="书籍传输" ${e.isBusy||i||s?"disabled":""}>${xa()}</button>
                    <button id="xb-theme-toggle" class="xb-glass-button xb-theme-button" type="button" title="${p(a)}" aria-label="${p(a)}">${n}</button>
                    <button id="xb-close" class="xb-glass-button xb-exit-button" type="button" title="退出电纸书" aria-label="退出电纸书">${Mt()}</button>
                </div>
            </header>
            <main class="xb-shelf-container">
                ${e.isDeleteBookOpen?'<div class="xb-delete-mode-note">删除模式：点击一本书会清除书稿内容和写作记录。</div>':""}
                <section class="xb-library-grid${r?"":" is-empty"}" aria-label="书籍列表">
                    ${ba(e)}
                    ${pa(e,r)}
                </section>
            </main>
            ${fa(e)}
            ${ma(e)}
            ${ya(e)}
            ${e.toast?`<div class="xb-toast">${p(e.toast)}</div>`:""}
        </div>
    `}function va(t={}){const e=t.state||{},r=e.colorTheme==="light"?"theme-light":"theme-dark",o=xt(e.colorTheme),n=e.colorTheme==="light"?"切换为深色视觉":"切换为白底黑字";return`
        <div class="xb-ebook-screen xb-entry-screen ${p(r)}">
            <div class="xb-ambient-aurora"></div>
            <button class="xb-portal-close" id="xb-library-link" title="返回书架" aria-label="返回书架">×</button>
            <button class="xb-portal-theme" id="xb-theme-toggle" type="button" title="${p(n)}" aria-label="${p(n)}">${o}</button>
            <main class="xb-entry-portal" aria-label="书本入口">
                <section class="xb-entry-actions">
                    <button class="xb-entry-action is-studio" data-entry-action="studio">
                        <strong>创作台</strong>
                        <span>agent写作平台</span>
                    </button>
                    <button class="xb-entry-action is-reader" data-entry-action="reader">
                        <strong>阅读</strong>
                        <span>沉浸式阅读器</span>
                    </button>
                </section>
            </main>
            ${e.toast?`<div class="xb-toast">${p(e.toast)}</div>`:""}
        </div>
    `}function wa(t=""){return _t.find(e=>e.matches(t))||{key:"other",title:"其他",description:"当前书里的其他文件",badge:"文件",empty:"没有其他文件。",matches:()=>!1}}function Dt(t={}){const e=Te(t.path);return[t.path,e].join(":")}function Sa(t={},e=[],r={}){if(!e.length)return`<div class="xb-file-tree" data-file-tree-signature="empty"><div class="xb-section-empty" data-file-group-empty="true">${p(t.empty||"这里还没有文件。")}</div></div>`;const o=t.basePath||"",n=[];let a="";return e.forEach(i=>{const s=o&&i.path.startsWith(o)?i.path.slice(o.length):i.path.replace(/^book\//,""),l=s.includes("/")?s.split("/").slice(0,-1).join("/"):"";l&&l!==a&&(n.push(`<div class="xb-file-directory">${p(l)}</div>`),a=l);const b=i.path===r.selectedPath?" is-active":"",y=Dt(i);n.push(`
            <button class="xb-file${b}" data-path="${p(i.path)}" data-file-signature="${p(y)}">
                <span class="xb-file-main">${p(Te(i.path))}</span>
            </button>
        `)}),`<div class="xb-file-tree" data-file-tree-signature="${p(e.map(i=>Dt(i)).join("|"))}">${n.join("")}</div>`}function Ta(t={},e={}){if(t.key==="chapters"){const r=!!e.chapterSortDescending,o=r?"正序":"倒序",n=r?"按章节正序显示":"按章节倒序显示";return`<button class="xb-file-sort-toggle${r?" is-descending":""}" type="button" data-chapter-sort-toggle title="${p(n)}" aria-label="${p(n)}">${p(o)}</button>`}return`<em>${p(t.badge)}</em>`}function ur(t=""){return`
        <div class="xb-section-subtitle">可导入</div>
        <div class="xb-imports">
            <button data-import="chat" title="导入当前聊天的全部楼层" ${t}>聊天记录</button>
            <button data-import="character" ${t}>角色信息</button>
            <button data-import="summary" title="导入小白X剧情总结模块里的当前总结" ${t}>剧情总结</button>
            <button data-import="worldbook" title="导入当前角色/聊天关联世界书的启用条目" ${t}>世界书</button>
        </div>
    `}function co(t={},e={}){const r=Jr(t.files);if(!r.length)return{emptyHtml:'<div class="xb-empty">还没有书稿文件</div>',groups:[]};const o=new Map;r.forEach(l=>{const b=wa(l.path);o.has(b.key)||o.set(b.key,{key:b.key,title:b.title,description:b.description,badge:b.badge,basePath:b.basePath,files:[]}),o.get(b.key).files.push(l)});const n=_t.map(l=>({...l,files:o.get(l.key)?.files||[]})),a=new Set(_t.map(l=>l.key)),i=[...o.values()].filter(l=>!a.has(l.key)),s=e.writeActionAttr||"";return{emptyHtml:"",groups:[...n,...i].map(l=>{const b=l.key==="chapters"&&t.chapterSortDescending?[...l.files].reverse():l.files,y=[l.key,l.title,l.description,l.badge,l.key==="chapters"&&t.chapterSortDescending?"desc":"asc",l.key==="sources"?s:""].join(":"),f=Ta(l,t),C=Sa(l,b,t),$=b.map(B=>{const R=B.path===t.selectedPath,M=Te(B.path),_=Dt(B);return{path:B.path,title:M,active:R,signature:_,html:`
                        <button class="xb-file${R?" is-active":""}" data-path="${p(B.path)}" data-file-signature="${p(_)}">
                            <span class="xb-file-main">${p(M)}</span>
                        </button>
                    `}});return{key:l.key,title:l.title,description:l.description,badge:l.badge,staticSignature:y,scaffoldHtml:`
                    <div class="xb-file-group" data-file-group-key="${p(l.key)}" data-file-static-signature="${p(y)}">
                        <div class="xb-file-group-title">
                            <span>${p(l.title)}</span>
                            ${f}
                        </div>
                        <div class="xb-file-group-desc">${p(l.description)}</div>
                        ${l.key==="sources"?ur(s):""}
                        ${l.key==="sources"?'<div class="xb-section-subtitle">已导入</div>':""}
                    </div>
                `,emptyHtml:`<div class="xb-section-empty" data-file-group-empty="true">${p(l.empty||"这里还没有文件。")}</div>`,treeHtml:C,files:$,html:`
                    <div class="xb-file-group" data-file-group-key="${p(l.key)}" data-file-static-signature="${p(y)}">
                        <div class="xb-file-group-title">
                            <span>${p(l.title)}</span>
                            ${f}
                        </div>
                        <div class="xb-file-group-desc">${p(l.description)}</div>
                        ${l.key==="sources"?ur(s):""}
                        ${l.key==="sources"?'<div class="xb-section-subtitle">已导入</div>':""}
                        ${C}
                    </div>
                `}})}}function Ea(t={},e={}){const r=co(t,e);return r.emptyHtml?r.emptyHtml:r.groups.map(o=>o.html).join("")}function Se(t="",e="",r=void 0){const o=String(r===void 0?e:r||""),n=typeof r=="function"?r:()=>o;return{key:String(t||""),signature:`${String(t||"")}:${String(e||"")}`,buildHtml:n,get html(){return n()}}}function bo(t="",e=""){const r=p(e),o=String(t||"");return!r||/^\s*<[a-zA-Z][^>]*\sdata-agent-unit-key=/.test(o)?o:o.replace(/^(\s*<[a-zA-Z][^>]*?)(\s*\/?>)/,`$1 data-agent-unit-key="${r}"$2`)}function uo(t={}){const e=Array.isArray(t.thoughts)?t.thoughts:[];if(!e.length)return"thoughts:0";const r=e.map(o=>[o?.kind||"",o?.summary||"",o?.text||"",o?.content||""].join("|")).join(`
`);return`thoughts:${e.length}:${ct(t,"thoughts",r)}`}function Aa(t={},e=0,r={}){const o=String(t.content||""),n=["user","assistant"].includes(t.role)&&r.editingMessageIndex===e,a=r.messageActionFeedback||{},i=[a[`copy:${e}`]||"",a[`edit:${e}`]||"",a[`reroll:${e}`]||"",a[`delete:${e}`]||""].join(",");return[Xr(t),t.role||"",t.streaming?"streaming":"done",t.error?"error":"",n?"editing":"",ct(t,"content",o),uo(t),Array.isArray(r.openThoughtKeys)?r.openThoughtKeys.join("|"):"",i].join(":")}function Tt(t,e,r,o){return{key:t,shellSignature:e,signature:[e,...r.map(n=>n.signature)].join("|"),children:r,get scaffoldHtml(){return o("")},get html(){return o(r.map(n=>bo(n.html,n.key)).join(""))}}}function po(t=[]){const e=[];for(let r=0;r<t.length;r+=1){const o=t[r];if(!o||!["user","assistant"].includes(o.role))continue;if(!(o.role==="assistant"&&o.toolCalls?.length)){e.push({message:o,startIndex:r});continue}const n={batches:[],startIndex:r};do{const a=t[r],i=[];for(r+=1;t[r]?.role==="tool";)i.push(t[r++]);n.batches.push({assistantMessage:a,toolMessages:i})}while(t[r]?.role==="assistant"&&t[r]?.toolCalls?.length);r-=1,e.push(n)}return e}function $a({batches:t,startIndex:e},r){const o=dt(t[0].assistantMessage),n=Qn(r,e),a=n||(r.openToolTurnKeys||[]).includes(o),i=a?t.map((b,y)=>{const{assistantMessage:f,toolMessages:C}=b,$=dt(f),B=`${o}:thought:${y+1}`,R=[Se(`${$}:heading`,`
            <div class="xb-tool-round-title">第 ${y+1} 轮 · ${f.toolCalls.length} 个工具</div>
        `)];f.thoughts?.length&&R.push(Se(`${$}:thoughts`,`${uo(f)}:${(r.openThoughtKeys||[]).includes(B)}`,()=>ao(f,{key:B,openThoughtKeys:r.openThoughtKeys}))),String(f.content||"").trim()&&R.push(Se(`${$}:preface`,ct(f,"content",f.content),()=>`<div class="xb-tool-preface xb-tool-preface-markdown xb-assistant-markdown">${lo(f.content)}</div>`));const M=r.liveToolTurn&&$===dt(r.liveToolTurn)?r.toolTrace||[]:[];for(const _ of f.toolCalls){const g=C.find(S=>S.toolCallId===_.id),k=M.find(S=>S.id===_.id);g?R.push(Se(`${$}:tool:${_.id}`,[g.toolName,ct(g,"content",g.content||""),JSON.stringify(g.toolDisplay||null)].join(":"),()=>la(g))):k&&R.push(Se(`${$}:tool:${_.id}`,JSON.stringify(k),()=>so(k)))}return Tt($,"round",R,_=>`<div class="xb-tool-round" data-agent-unit-children>${_}</div>`)}):[],s=`${n?"正在创作":"已创作"} ${t.length} 轮`,l=[Se(`${o}:label`,`${n}:${s}`,()=>n?`<div class="xb-tool-run-label">${p(s)}</div>`:`<summary><span>${p(s)}</span><span class="xb-tool-fold-indicator" aria-hidden="true"></span></summary>`)];return a&&l.push(Tt(`${o}:body`,"body",i,b=>`<div class="xb-tool-trace-body" data-tool-detail-mode="full" data-agent-unit-children>${b}</div>`)),Tt(`tool:${o}`,`${n}:${a}`,l,b=>{const y=`data-tool-turn-key="${p(o)}"`;return n?`<section class="xb-tool-trace xb-tool-turn xb-tool-turn-live" ${y} data-agent-unit-children>
                ${b}
            </section>`:`<details class="xb-tool-trace xb-tool-turn" ${y}${a?" open":' data-lazy-tool-turn="true"'} data-agent-unit-children>
                ${b}
            </details>`})}function Nt(t={}){const e=[...t.messages||[]],r=t.isBusy&&t.liveToolTurn;r&&(dt(r),e.some(s=>s.uiProcessId===r.uiProcessId)||e.push(r));const o=[],n=(s={},l=0)=>{if(!(["user","assistant"].includes(s.role)&&!s.streaming&&String(s.content||"").trim()&&!(Array.isArray(s.toolCalls)&&s.toolCalls.length)))return"";const b=t.editingMessageIndex===l,y=t.messageActionFeedback||{};return`
            <div class="xb-msg-actions">
                ${(b?[{action:"save-edit",label:"✓",title:"保存这条消息的修改"},{action:"cancel-edit",label:"✕",title:"取消本次修改"}]:[{action:"copy",label:y[`copy:${l}`]==="success"?"✓":y[`copy:${l}`]==="error"?"!":"⧉",title:"复制整条消息"},{action:"edit",label:"✎",title:"编辑这条消息"},{action:"reroll",label:"↻",title:"从这里重新生成后续回复"},{action:"delete",label:"🗑",title:"删除这条消息"}]).map(f=>`
                    <button type="button" class="xb-msg-action" data-message-action="${p(f.action)}" data-message-index="${l}" title="${p(f.title)}" aria-label="${p(f.title)}">${p(f.label)}</button>
                `).join("")}
            </div>
        `},a=(s={},l=0)=>{const b=["user","assistant"].includes(s.role)&&t.editingMessageIndex===l,y=String(s.content||"").trim();return`
            <div class="xb-msg xb-msg-${p(s.role)}${s.error?" is-error":""}${s.streaming?" is-streaming":""}${b?" is-editing":""}" data-message-index="${l}">
                <div class="xb-msg-head">
                    <div class="xb-msg-role">${s.role==="user"?"你":"电纸书"}</div>
                    ${n(s,l)}
                </div>
                ${b?"":ao(s,{key:`thought-message:${l}`,openThoughtKeys:t.openThoughtKeys})}
                ${b?`
                    <div class="xb-msg-editor-wrap">
                        <textarea class="xb-msg-editor" data-message-editor="${l}" rows="${Math.min(Math.max(y.split(`
`).length,4),14)}">${p(y)}</textarea>
                    </div>
                `:y?`<div class="xb-msg-content xb-msg-markdown xb-assistant-markdown">${lo(y)}</div>`:""}
            </div>
        `};for(const s of po(e))s.batches?o.push($a(s,t)):o.push(Se(`message:${s.startIndex}`,Aa(s.message,s.startIndex,t),()=>a(s.message,s.startIndex)));if(!o.length)return[Se("empty",'<div class="xb-agent-empty">这里是写作助手记录。可以先导入资料，也可以直接说“我想试试写一本书”。</div>')];const i=an(t,o.length,{preserveStartOnGrow:t.agentAutoScroll===!1});return[i.hiddenBefore?Se(`history-gate:${i.hiddenBefore}`,`<div class="xb-agent-history-gate">较早记录 ${i.hiddenBefore} 条</div>`):null,...o.slice(i.startIndex)].filter(Boolean)}function Ca(t={}){return Nt(t).map(e=>bo(e.html,e.key)).join("")}function Pa(t=[]){return po(t).length}function Ba(t={}){return Ut(t.editorContent||"")}function go(t={}){return t.isSettingsOpen?`
        <div class="xb-ebook-settings-overlay" id="xb-agent-settings-overlay">
            <div class="xb-ebook-settings-dialog" role="dialog" aria-modal="true" aria-labelledby="xb-agent-settings-title">
                <div class="xb-ebook-settings-head">
                    <div>
                        <h2 id="xb-agent-settings-title">API配置</h2>
                        <p>在这里填写 API 和模型。</p>
                    </div>
                    <button id="xb-agent-settings-close" type="button" title="关闭配置" aria-label="关闭配置">关闭</button>
                </div>
                <div class="xb-ebook-settings-body">
                    ${Jo({configSave:t.configSave,runtimeText:"",showInlineToast:!1,showAssistantPermissions:!1,activePage:t.configPage,delegatePresetHint:"电纸书审稿分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。",isBusy:t.isBusy,canDeletePreset:(t.config?.presetNames||[]).length>1,configLoadError:t.configLoadError})}
                </div>
            </div>
        </div>
    `:""}function La(t={}){const e=t.state||{},r=t.providerConfig||{},o=!!t.dirty,n=Qr(r),a=e.isBusy?"disabled":"",i=e.isBusy||!n.canRun?"disabled":"",s=!e.isBusy&&!n.canRun?"disabled":"",l=e.isCancellingRun||!e.isBusy&&!n.canRun?"disabled":"",b=String(e.agentInputDraft||""),y=!!e.messages?.length,f=["focus-editor","focus-agent"].includes(e.studioLayout)?e.studioLayout:"balanced",C=e.colorTheme==="light"?"theme-light":"theme-dark",$=xt(e.colorTheme),B=e.colorTheme==="light"?"切换为深色视觉":"切换为白底黑字",R=e.drawStatus||{},M=Yn(e.selectedPath),_=!!R.enabled&&!!R.ready,g=e.isDrawingChapter||!e.isBusy&&M&&_&&dr(e.editorContent)?"":"disabled",k=e.isDrawingChapter?"停止当前章节配图":M?_?dr(e.editorContent)?"为当前章节生成配图":"当前章节没有正文":"画图后端未启用":"只有正文章节可以配图",S=e.isDrawingChapter?"停止":"配图",m=e.drawProgressText?` · ${e.drawProgressText}`:"";return`
        <div class="xb-ebook-shell xb-studio-shell ${p(f)} ${p(C)}">
            <header class="xb-mobile-studio-topbar">
                <div class="xb-mobile-segment" aria-label="工作台视图">
                    <span class="xb-mobile-segment-slider"></span>
                    <button type="button" class="xb-mobile-segment-button${f!=="focus-agent"?" is-active":""}" data-studio-layout="focus-editor">编辑</button>
                    <button type="button" class="xb-mobile-segment-button${f==="focus-agent"?" is-active":""}" data-studio-layout="focus-agent">助手</button>
                </div>
                <div class="xb-mobile-agent-actions">
                    <button type="button" class="xb-mobile-agent-action" data-entry-link title="返回书本入口" aria-label="返回书本入口">↩</button>
                    <button type="button" class="xb-mobile-agent-action" data-theme-toggle title="${p(B)}" aria-label="${p(B)}">${$}</button>
                    <button type="button" class="xb-mobile-agent-action" id="xb-agent-close-mobile" title="退出电纸书" aria-label="退出电纸书">${Mt()}</button>
                </div>
            </header>
            <button class="xb-mobile-file-drawer-scrim" type="button" data-mobile-file-drawer-close title="收起目录" aria-label="收起目录"></button>
            <aside class="xb-sidebar">
                <button class="xb-mobile-drawer-handle" type="button" data-mobile-file-drawer-close title="收起目录" aria-label="收起目录"></button>
                <div class="xb-brand">
                    <div class="xb-title-row">
                        <h1>${p(e.book?.title||"未命名书稿")}</h1>
                        <button class="xb-icon-button" data-book-rename title="修改书名" aria-label="修改书名" ${e.isBusy?"disabled":""}>✎</button>
                    </div>
                    <div class="xb-workspace-controller">
                        <button type="button" class="xb-layout-button${f==="focus-editor"?" is-active":""}" data-studio-layout="focus-editor">编辑</button>
                        <button type="button" class="xb-layout-button${f==="balanced"?" is-active":""}" data-studio-layout="balanced">平衡</button>
                        <button type="button" class="xb-layout-button${f==="focus-agent"?" is-active":""}" data-studio-layout="focus-agent">助手</button>
                    </div>
                </div>
                <section class="xb-panel xb-files-panel">
                    <div class="xb-files">${Ea(e,{writeActionAttr:a})}</div>
                </section>
            </aside>
            <section class="xb-studio-workbench">
                <main class="xb-editor">
                    <header class="xb-editor-head">
                        <button id="xb-mobile-file-picker" class="xb-mobile-file-picker" type="button" title="打开文件目录" aria-label="打开文件目录">
                            <span aria-hidden="true">☰</span>
                            <strong>${p(Te(e.selectedPath||"book/chapters/001.md"))}</strong>
                            <em aria-hidden="true">⌄</em>
                        </button>
                        <div class="xb-path">${p(Te(e.selectedPath||"book/chapters/001.md"))}</div>
                        <div class="xb-editor-actions">
                            <button id="xb-reader-link">阅读器</button>
                            <button id="xb-library-link">书架</button>
                            <button id="xb-draw-chapter" title="${p(k)}" ${g}>${p(S)}</button>
                            <button id="xb-save" ${o&&!e.isBusy?"":"disabled"}>保存</button>
                        </div>
                    </header>
                    <div class="xb-editor-body">
                        <textarea id="xb-editor-text" spellcheck="false" ${e.isBusy?"disabled":""}>${p(e.editorContent)}</textarea>
                    </div>
                    <footer class="xb-editor-foot">
                        <div class="xb-meta" id="xb-editor-meta">${o?"有未保存修改":"已保存到书库"} · ${Ba(e)}${p(m)}</div>
                    </footer>
                </main>
                <aside class="xb-agent">
                    <div class="xb-agent-aurora"></div>
                    <header class="xb-agent-head">
                        <div class="xb-agent-head-main">
                            <div class="xb-agent-global-actions">
                                <button id="xb-theme-toggle" type="button" title="${p(B)}" aria-label="${p(B)}">${$}</button>
                                <button id="xb-entry-link" type="button" data-entry-link title="返回书本入口" aria-label="返回书本入口">↩</button>
                                <button id="xb-agent-close" class="xb-exit-button" type="button" title="退出电纸书" aria-label="退出电纸书">${Mt()}</button>
                            </div>
                        </div>
                        <div class="xb-agent-toolbar">
                            <div class="xb-agent-context-meter" title="${p(no(e,r))}">${p(oo(e,r))}</div>
                            <button id="xb-agent-clear" type="button" ${e.isBusy||!y?"disabled":""}>清空对话</button>
                            <button id="xb-agent-open-settings" type="button">API配置</button>
                        </div>
                    </header>
                    <div class="xb-agent-chat-wrap">
                        <div class="xb-agent-main${e.isBusy?" is-busy":""}">
                            <details class="xb-actions-panel">
                                <summary>创作入口</summary>
                                <div class="xb-actions">
                                    <button data-action="start-book" ${i}>聊新书</button>
                                    <button data-action="spine" ${i}>建书脊</button>
                                    <button data-action="style-plan" ${i}>定写法</button>
                                    <button data-action="organize" ${i}>整理资料</button>
                                    <button data-action="outline" ${i}>搭大纲</button>
                                    <button data-action="volume-plan" ${i}>定当前卷</button>
                                    <button data-action="next-chapter" ${i}>按指挥写</button>
                                    <button data-action="opening-options" ${i}>试写开场</button>
                                </div>
                            </details>
                            <div class="xb-agent-log">${Ca(e)}</div>
                        </div>
                        <div class="xb-agent-scroll-helpers" id="xb-agent-scroll-helpers">
                            <button id="xb-agent-scroll-top" type="button" class="xb-agent-scroll-btn" title="回到顶部" aria-label="回到顶部">▲</button>
                            <button id="xb-agent-scroll-bottom" type="button" class="xb-agent-scroll-btn" title="回到底部" aria-label="回到底部">▼</button>
                        </div>
                        ${Zn(e)}
                        ${Vn(e)}
                    </div>
                    <form id="xb-agent-form" class="xb-agent-form">
                        <div class="xb-agent-compose-row">
                            <div class="xb-agent-compose-main">
                                <textarea id="xb-agent-input" placeholder="${n.canRun?"写作指令，例如：把当前段落改得更克制一点，或者先列三种开场方案":"先补好 API 和模型信息"}" ${s}>${p(b)}</textarea>
                                <div class="xb-compose-hint" id="xb-compose-hint">Enter 发送 · Shift+Enter 换行</div>
                            </div>
                            <div class="xb-agent-compose-actions">
                                <button type="submit" class="${e.isBusy?"is-busy":""}" title="${e.isCancellingRun?"正在停止":e.isBusy?"停止":"发送"}" aria-label="${e.isCancellingRun?"正在停止":e.isBusy?"停止":"发送"}" ${l}>${e.isCancellingRun?"…":e.isBusy?"■":"➤"}</button>
                            </div>
                        </div>
                    </form>
                </aside>
            </section>
            ${go(e)}
            ${e.toast?`<div class="xb-toast">${p(e.toast)}</div>`:""}
        </div>
    `}function pr(t=[],e=""){return t.length?t.map((r,o)=>`
        <button class="xb-reader-chapter${r.path===e?" is-active":""}" data-reader-path="${p(r.path)}">
            <span>${p(Te(r.path))}</span>
            <small>${o+1}</small>
        </button>
    `).join(""):'<div class="xb-empty">还没有正文</div>'}function gr(t=""){return String(t||"").replace(/[*_`~]/g,"").replace(/[《》「」『』“”"'\s]/g,"").replace(/[。.!！?？：:；;、，,]+$/g,"").replace(/^第0*(\d+)章$/i,"第$1章").trim()}function Ra(t="",e=""){const r=String(t||"").match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/);if(!r)return!1;const o=gr(r[1]),n=gr(e);return!!o&&!!n&&o===n}function Ia(t="",e={}){const r=String(t||"").trim();if(!r)return"";const o=/\[ebook-image:([a-z0-9\-_]+)\]/gi,n=[];let a=0,i=0;const s=(b="")=>{String(b||"").split(/\n{2,}/).map(y=>y.trim()).filter(Boolean).forEach(y=>{i===0&&Ra(y,e.chapterTitle)||(n.push(ca(y,i)),i+=1)})};let l;for(;(l=o.exec(r))!==null;){s(r.slice(a,l.index));const b=l[1]||"";n.push(`
            <figure class="xb-reader-image" data-ebook-image-slot="${p(b)}">
                <div class="xb-reader-image-placeholder">配图加载中</div>
            </figure>
        `),a=o.lastIndex}return s(r.slice(a)),n.join("")}function _a(t={}){const e=t.state||{},{chapters:r,active:o,activePath:n,index:a}=Un(e),i=r.length>0,s=a>0?r[a-1]:null,l=a<r.length-1?r[a+1]:null,b=i?`第 ${a+1} / ${r.length} 章`:"暂无章节",y=o?.content||"",f=i?Math.round((a+1)/r.length*100):0,C=e.colorTheme==="light"?"theme-light":"theme-dark",$=xt(e.colorTheme),B=e.colorTheme==="light"?"切换为深色视觉":"切换为白底黑字",R=e.readerTtsStatus||{},M=e.readerTtsPlayback||{},_=["loading","playing"].includes(String(M.status||"")),g=!!R.enabled&&!!R.ready,k=_||i&&g?"":"disabled",S=_?"停止朗读":i?g?"播放当前章节":"TTS 语音模块未启用":"还没有可朗读章节",m=_?"■":"▶";return`
        <div class="xb-ebook-screen xb-reader-screen ${p(C)}">
            <div class="xb-reader-backlight"></div>
            <nav class="xb-reader-edge" aria-label="阅读器操作">
                <div class="xb-reader-edge-actions">
                    <button class="xb-reader-edge-button" id="xb-entry-link" title="返回入口" aria-label="返回入口">←</button>
                    <button class="xb-reader-edge-button xb-reader-index-toggle" id="xb-reader-index-toggle" type="button" title="目录" aria-label="目录">☰</button>
                    <button class="xb-reader-edge-button xb-reader-tts-toggle${_?" is-active":""}" id="xb-reader-tts-toggle" type="button" title="${p(S)}" aria-label="${p(S)}" ${k}>${p(m)}</button>
                    <button class="xb-reader-edge-button xb-reader-theme-toggle" id="xb-theme-toggle" type="button" title="${p(B)}" aria-label="${p(B)}">${$}</button>
                </div>
                <div class="xb-reader-progress" title="${p(b)}" style="--xb-reader-progress:${f}%"><span></span></div>
            </nav>
            <main class="xb-reader-main">
                <aside class="xb-reader-nav">
                    <div class="xb-reader-index-title">目录</div>
                    <div class="xb-reader-chapters">
                        ${pr(r,n)}
                    </div>
                </aside>
                <article class="xb-reader-paper">
                    ${i?`
                        <header class="xb-reader-head">
                            <div>
                                <div class="xb-kicker">${p(e.book?.title||"未命名书稿")} · ${p(b)}</div>
                                <h2>${p(Te(n))}</h2>
                                <p>${p(Hn(y))}</p>
                            </div>
                        </header>
                        <div class="xb-reader-content">${Ia(y,{chapterTitle:Te(n)})}</div>
                        <footer class="xb-reader-foot">
                            <button data-reader-path="${p(s?.path||"")}" ${s?"":"disabled"}>上一章</button>
                            <button data-reader-path="${p(l?.path||"")}" ${l?"":"disabled"}>下一章</button>
                        </footer>
                    `:`
                        <div class="xb-reader-empty">
                            <h2>还没有正文</h2>
                            <p>去创作台写下第一章，再回来阅读。</p>
                            <button id="xb-studio-empty-link">去创作台</button>
                        </div>
                    `}
                </article>
            </main>
            <button class="xb-reader-toc-scrim" id="xb-reader-index-scrim" type="button" title="收起目录" aria-label="收起目录"></button>
            <aside class="xb-reader-toc-sheet" aria-label="章节目录">
                <button class="xb-reader-toc-handle" id="xb-reader-index-close" type="button" title="收起目录" aria-label="收起目录"></button>
                <div class="xb-reader-index-title">目录</div>
                <div class="xb-reader-chapters">
                    ${pr(r,n)}
                </div>
            </aside>
            ${e.toast?`<div class="xb-toast">${p(e.toast)}</div>`:""}
        </div>
    `}function Ma(t={}){switch((t.state||{}).viewMode){case"book-entry":return va(t);case"studio":return La(t);case"reader":return _a(t);default:return ka(t)}}var hr=48,Da=80;function Na(t=[]){for(let e=t.length-1;e>=0;e-=1)if(t[e]?.role==="user")return e;return-1}function Oa(t={},e=[]){return{role:"assistant",content:String(t.text||""),toolCalls:qo(e),thoughts:pt(t.thoughts),providerPayload:t.providerPayload}}function za({toolCallId:t="",toolName:e="",toolResult:r,toolDisplay:o=null}={}){const n={role:"tool",toolCallId:String(t||""),toolName:String(e||""),content:Gr(r,0)};return o&&typeof o=="object"&&(n.toolDisplay=o),n}function qa(t=[],e=""){const r=String(e||"").trim();if(!r)return Array.isArray(t)?t:[];const o=Array.isArray(t)?t:[],n=Na(o);return n<0?o:o.map((a,i)=>i!==n||a?.role!=="user"?a:{...a,content:["[用户本轮请求]",String(a.content||""),r].filter(Boolean).join(`

`)})}function Fa(t=[],e={}){return Fo(qa(t,e.latestUserContextText))}function ja(t={},e={},r={}){const o=t.name===I.DELEGATE_RUN,n=t.name===I.WEB_SEARCH;return{id:String(t.id||""),name:t.name,round:Number(t.round)||0,title:Nr(t.name,e),ok:!(r&&typeof r=="object"&&r.ok===!1),summary:Rn(r),payload:o?ho(e):n?Cr(r):[]}}function ho(t={}){return[["任务",t.task],["背景",t.context],["交付",t.deliverable]].map(([e,r])=>({label:e,text:String(r||"").trim()})).filter(e=>e.text)}function Ha(t={},e={},r=0){const o=t.name===I.DELEGATE_RUN,n=t.name===I.WEB_SEARCH;return{id:String(t.id||""),name:t.name,round:Number(r)||Number(t.round)||0,title:Nr(t.name,e),ok:!0,status:"running",startedAt:Date.now(),summary:o?"审稿分身工作中，等待返回。":n?"联网搜索中，等待返回。":"工具运行中，等待返回。",payload:o?ho(e):n?Cr({query:e.query}):[]}}function Wa(t={},e={},r={},o={}){return Object.assign(t,ja(e,r,o),{status:"resolved",finishedAt:Date.now()}),Number(t.startedAt)&&(t.elapsedMs=Math.max(0,Number(t.finishedAt)-Number(t.startedAt))),t}function Ua(t={}){return!t||typeof t!="object"?null:{title:String(t.title||t.name||""),status:t.status==="running"?"running":"resolved",payload:Array.isArray(t.payload)?t.payload:[],elapsedMs:Number(t.elapsedMs)||0}}function Ka(t={}){return t.type==="started"?"启动":t.type==="round_start"?`第 ${Number(t.round)||1} 轮`:t.type==="model_result"?"模型":t.type==="tool_start"?"工具":t.type==="tool_result"?t.ok===!1?"失败":"返回":t.type==="completed"?"完成":"进度"}function xr(t={}){const e=String(t.summary||"").trim();if(t.type==="tool_start"){const r=String(t.toolName||"工具");return e||`${r} 已发起。`}if(t.type==="tool_result"){const r=String(t.toolName||"工具"),o=String(t.argsSummary||"").trim(),n=e||(t.ok===!1?String(t.error||"工具失败"):"已返回");return o?`${r} ${o}：${n}`:`${r}：${n}`}return e||"审稿分身工作中。"}function Ga(t={},e={}){!t||typeof t!="object"||(t.progress=[{label:Ka(e),text:xr(e)}],t.summary=xr(e))}function Ya(t=""){return t===I.EDIT?'Expected Edit arguments: {"filePath":"book/...","edits":[{"oldString":"...","newString":"..."}]} or {"filePath":"book/...","edits":[{"startLine":1,"endLine":3,"newString":"..."}]} or {"filePath":"book/...","edits":[{"insertAtLine":4,"newString":"..."}]}':t===I.WRITE?'Expected Write arguments: {"filePath":"book/...","content":"..."}':"Expected tool arguments must be a valid JSON object matching the tool schema."}function Xa(t=""){const e=String(t||"").match(/"(?:filePath|path|fromPath)"\s*:\s*"([^"]*)"/);return e?e[1]:""}function Ja(t={},e){const r=String(t?.arguments||"");return{ok:!1,toolName:String(t?.name||""),path:Xa(r),error:"invalid_tool_arguments",message:"Tool arguments are not valid JSON. The tool was not executed. Rebuild the call with valid JSON arguments.",raw:e instanceof Error?e.message:String(e||"invalid_tool_arguments"),argumentLength:r.length,argumentPreview:r.slice(0,500),schemaHint:Ya(t?.name)}}function Va(t={}){try{const e=typeof t.arguments=="string"?t.arguments:"",r=JSON.parse(e.trim()||"{}");if(!r||typeof r!="object"||Array.isArray(r))throw new Error("tool_arguments_must_be_json_object");return{ok:!0,args:r}}catch(e){return{ok:!1,args:{},result:Ja(t,e)}}}function Za(t=""){return[I.WRITE,I.EDIT,I.DELETE,I.MOVE,I.RENAME_BOOK].includes(t)}function Me(t){return t?.name==="AbortError"||/aborted|assistant_aborted/i.test(String(t?.message||t||""))}function Qa(t=[],e=0){for(let r=Math.min(e,t.length-1);r>=0;r-=1)if(t[r]?.role==="user")return r;return-1}function ei(t={}){const{state:e,refreshBooksAndFiles:r,render:o,renderAgentSurface:n,renderPassiveSurface:a,renderToolTraceSurface:i,renderFilesSurface:s,renderEditorFileSurface:l,showToast:b,persistConversation:y,isEditorDirty:f,getActiveProviderConfig:C,createAdapter:$,renderProtocolNoticeSurface:B}=t,R=typeof n=="function"?()=>{n()||typeof a=="function"&&a()||o()}:o,M=typeof i=="function"?()=>{i()||R()}:R,_=()=>{let D=!1;typeof s=="function"&&(D=s()||D),typeof l=="function"&&(D=l()||D),D||o()};async function g(D=e.book?.id){return D?await sn({sessionId:D,ledger:Or}):""}function k(D="",z={}){const V=z.book||e.book,ie=Ur({files:e.files}),u=Kr({book:V,files:e.files,currentPlansText:D}),x=[String(z.lightBrakeText||"").trim(),String(z.finalAnswerReminderText||"").trim()].filter(Boolean).map(q=>({role:"system",content:q})),j=Fa(e.messages,{latestUserContextText:u});return[{role:"system",content:Rt},{role:"system",content:ie},...j,...x]}const S=3e3;let m=null,T=null;function P(){m&&(globalThis.clearTimeout(m),m=null)}function w(D={}){const z=e.compactionOverlay||{},V=D.id||z.id||`compaction-${Date.now()}`,ie=Number(D.visibleSince)||(z.id===V?Number(z.visibleSince):0)||Date.now();e.compactionOverlay={active:!0,resolved:!1,currentTokens:0,yieldTokens:0,triggerTokens:0,status:"正在释放较早对话...",...z,...D,id:V,visibleSince:ie}}function W(D=S){const z=e.compactionOverlay?.id||"",V=Number(e.compactionOverlay?.visibleSince)||Date.now(),ie=Math.max(0,Date.now()-V),u=Math.max(0,D-ie);P(),m=globalThis.setTimeout(()=>{m=null,!(!z||e.compactionOverlay?.id!==z)&&(e.compactionOverlay=null,o())},u)}function K(){T&&(globalThis.clearTimeout(T),T=null)}function ne(D="工具协议异常，正在切换兼容模式重试…"){K(),e.protocolNotice={id:`protocol-notice-${Date.now()}`,message:D},(typeof B!="function"||!B())&&R();const z=e.protocolNotice.id;T=globalThis.setTimeout(()=>{T=null,e.protocolNotice?.id===z&&(e.protocolNotice=null,(typeof B!="function"||!B())&&R())},1300)}const ee=_n({state:e,countTokens:t.countTokens,render:o,showToast:b,persistConversation:y,getActiveProviderConfig:C,buildProviderMessages:()=>k(""),getToolDefinitions:()=>Ve({webSearchEnabled:Je(C())}),onCompactionStart:(D={})=>{P(),w({id:`compaction-${Date.now()}`,...D})},onCompactionProgress:(D={})=>{w(D)},onCompactionComplete:(D={})=>{w({...D,resolved:!0}),W()},onCompactionUnable:(D={})=>{w(D),W()}}),ae=on({createAdapter:$,executeToolCall:async(D,z,V={})=>{const ie=rr({getBookId:()=>V.bookId||e.book?.id,getSearchConfig:()=>C({role:"delegate"}),signal:V?.controller?.signal,readOnly:!0,isAbortError:Me});try{return await ie.execute(D.name,z)}catch(u){if(Me(u))throw u;return tr(D.name,z,u)}},getActiveProviderConfig:C,getDelegateProviderConfig:()=>C({role:"delegate"}),getSystemPrompt:()=>Dn,resolveToolDefinitions:()=>Ve({readOnly:!0,webSearchEnabled:Je(C({role:"delegate"}))}),safeJsonParse:Fn,isAbortError:Me,TOOL_NAMES:I,maxRounds:16});async function te(D={},z={}){let V="";try{V=await g(z.bookId||e.book?.id)}catch{V=""}const ie=qn({book:z.book||e.book,files:e.files,currentPlansText:V}),u=String(D.context||"").trim(),x=[ie,u?`[主助手本次补充]
${u}`:""].filter(Boolean).join(`

`);return await ae.runDelegate({...D,context:x},z)}async function U(D="",z={}){const V=String(D||"").trim();if(!V||e.isBusy||!e.book)return;const ie=z.appendUserMessage!==!1,u=e.book.id,x=new AbortController;e.isBusy=!0,e.isCancellingRun=!1,e.activeController=x,e.status="AI 正在阅读作品...",e.agentAutoScroll=!0,e.agentForceScrollBottomOnce=!0,gt(e),ee.resetCompactionState(),P(),e.compactionOverlay=null,e.toolTrace=[],e.liveToolTurn=null,e.editingMessageIndex=-1,ie&&e.messages.push({role:"user",content:V}),o();try{f()&&e.selectedPath&&await Re(u,e.selectedPath,e.editorContent),await r()}catch(N){e.isBusy=!1,e.isCancellingRun=!1,e.activeController=null,e.status="就绪",e.messages.push({role:"assistant",content:`AI 操作失败：${N?.message||N}`,error:!0}),await y?.(u),o();return}if(x.signal.aborted){e.isBusy=!1,e.isCancellingRun=!1,e.activeController=null,e.status="就绪",e.messages.push({role:"assistant",content:"已取消本次操作。",error:!0}),await y?.(u),o();return}if(!e.book){e.isBusy=!1,e.isCancellingRun=!1,e.activeController=null,e.status="就绪",o();return}const j={...e.book},q=j.id;await y?.(q);const G=C();let Y=null;function xe(N=Y){if(!N)return;const Z=e.messages.indexOf(N);Z>=0&&e.messages.splice(Z,1),N===Y&&(Y=null)}function Ae(N=[],Z=null){const h=st(e.messages);return zo(N,h.length?h[h.length-1]:[],{currentMessage:Z})}const{createStreamingAssistantMessage:d,finalizeStreamingAssistantMessage:E,scheduleStreamRender:L,updateStreamingAssistantMessage:H}=Go({state:e,render:R,persistSession:()=>{y?.(q)},filterThoughtsForCurrentTurn:Ae,minRenderIntervalMs:Da});try{let ce=function(J={},F={}){if(F&&typeof F=="object"&&F.ok===!1){fe.record(J.name,F.error||F.message||"tool_failed");return}fe.reset()},Ie=function({tokens:J,source:F}){e.contextStats={usedTokens:J,budgetTokens:zr,summaryActive:!1,source:F==="tokenizer"?"resolved":"estimated",stateKey:to(e,G),updatedAt:Date.now()},R()},ke=function(){xe(Y)},ge=function(J={}){const F=typeof J.text=="string",pe=Array.isArray(J.thoughts);!F&&!pe||(Y||(Y=d()),H(Y,{...F?{content:J.text}:{},...pe?{thoughts:yt(J.thoughts)}:{}}),L())};const N=$(G),Z=rr({getBookId:()=>q,onFilesChanged:r,getSearchConfig:()=>G,signal:x.signal,isAbortError:Me,runDelegate:async J=>await te(J,{controller:x,bookId:q,book:j})}),h=Z.getToolDefinitions(),c=new Set(h.map(J=>J.function.name));let A=!1,v=!1,O=null,se="";const de={finalAnswerReminderText:""},fe=tn();async function ft(){let J="";try{J=await g(q)}catch{J=""}return k(J,{book:j,lightBrakeText:fe.getMessage(),finalAnswerReminderText:de.finalAnswerReminderText})}for(let J=1;J<=hr;J+=1){e.status=J===1?"AI 正在思考...":`AI 正在处理工具结果（${J}/${hr}）...`,R();let F;try{const X={systemPrompt:Rt,tools:h,toolChoice:"auto",temperature:G.temperature,maxTokens:G.maxTokens,reasoning:G.reasoning,signal:x.signal,onStreamProgress:ge,onToolProtocolFallback:()=>{ne()}},qe=e.messages;de.finalAnswerReminderText=se||de.finalAnswerReminderText;const ve=await ee.ensureContextBudget(N,x.signal,ft);Ie(ve);const et=N?.supportsSessionToolLoop&&qe===e.messages;Array.isArray(O)&&O.length&&et?X.toolResponses=O:se&&et?(X.finalAnswerReminderText=se,se=""):(X.messages=ve.messages,se=""),de.finalAnswerReminderText="",console.info("[Ebook][ModelRequest] round:start",{round:J,provider:String(G?.provider||""),model:String(G?.model||""),toolMode:String(G?.toolMode||""),usesSessionToolLoop:!!N?.supportsSessionToolLoop,usesToolResponses:Array.isArray(X.toolResponses)&&X.toolResponses.length>0,toolResponseCount:Array.isArray(X.toolResponses)?X.toolResponses.length:0,usesFinalAnswerReminder:!!X.finalAnswerReminderText,messageCount:Array.isArray(X.messages)?X.messages.length:0}),F=await N.chat(X),console.info("[Ebook][ModelRequest] round:result",{round:J,provider:String(G?.provider||""),finishReason:String(F?.finishReason||""),textLength:typeof F?.text=="string"?F.text.length:0,toolCallCount:Array.isArray(F?.toolCalls)?F.toolCalls.length:0,hasProviderPayload:!!(F?.providerPayload&&typeof F.providerPayload=="object")})}catch(X){throw console.error("[Ebook][ModelRequest] round:error",{round:J,provider:String(G?.provider||""),model:String(G?.model||""),message:X instanceof Error?X.message:String(X||"")}),Y&&(E(Y),Y=null),X}const pe=Ho(F,G,{fallbackPrefix:"ebook-tool"});if(pe.length){O=null,A=!0;const X=pe.map(re=>({toolCall:re,parsedArguments:Va(re)})),qe=X.map(({toolCall:re,parsedArguments:Fe})=>{if(Fe.ok)return re;const $e=String(re.arguments||"");return{...re,arguments:Gr({invalidToolArguments:!0,argumentLength:$e.length,argumentPreview:$e.slice(0,500)})}}),ve=String(F.text||Y?.content||""),et=Ae(yt(Y?.thoughts,F.thoughts),Y);ke();const Gt=Oa({...F,text:ve,thoughts:et},qe);e.liveToolTurn=Gt,M();const Yt=[],Xt=[];for(const{toolCall:re,parsedArguments:Fe}of X){if(x.signal.aborted)throw new Error("assistant_aborted");const $e=Fe.args,Jt=re.name===I.DELEGATE_RUN,mt=Ha(re,$e,J);e.toolTrace.push(mt),M();let we;if(!c.has(re.name))we={ok:!1,error:"ebook_tool_not_available",message:`${re.name} 不在电纸书工具表中。`};else if(!Fe.ok)we=Fe.result;else try{Jt?we=await te($e,{controller:x,bookId:q,book:j,onDelegateProgress:je=>{Ga(mt,je),M()}}):we=await Z.execute(re.name,$e)}catch(je){if(Me(je))throw je;we=tr(re.name,$e,je)}const Co=Wa(mt,{...re,round:J},$e,we),Po=za({toolCallId:re.id,toolName:re.name,toolResult:we,toolDisplay:Jt?Ua(Co):null});Yt.push(Po),Xt.push({id:re.id,name:re.name,response:we,...Object.prototype.hasOwnProperty.call(re,"providerId")?{providerId:re.providerId}:{}}),ce(re,we),Za(re.name)&&_(),M()}e.messages.push(Gt,...Yt),await y?.(q),e.toolTrace=[],e.liveToolTurn=null,N?.supportsSessionToolLoop&&(O=Xt);continue}if(O=null,!jo(F?.text)&&A&&!v){v=!0;const X="你已经拿到了本轮全部工具结果。现在不要再调用任何工具，直接给出电纸书操作结论。";ke(),N?.supportsSessionToolLoop?se=X:de.finalAnswerReminderText=X;continue}const Oe=String(F?.text||Y?.content||"").trim();if(!Oe)throw ke(),new Error("模型没有返回有效结论。");const ze={role:"assistant",content:Oe,thoughts:Ae(yt(Y?.thoughts,F.thoughts),Y),providerPayload:F.providerPayload};Y?(E(Y,ze),Y=null):e.messages.push(ze),e.status="就绪",await r(),await y?.(q);return}throw new Error("工具轮次达到上限，已停止。")}catch(N){if(Y)E(Y),Y=null;else{const h=e.messages.find(c=>c?.streaming);h&&E(h)}const Z=Me(N)?"已取消本次操作。":`AI 操作失败：${N?.message||N}`;e.messages.push({role:"assistant",content:Z,error:!0}),e.status="就绪",await y?.(q)}finally{e.isBusy=!1,e.isCancellingRun=!1,e.activeController=null,e.toolTrace=[],e.liveToolTurn=null,await r().catch(N=>{console.warn({source:import.meta.url,operation:"runAgent"},N)}),o()}}function ue(){return!e.isBusy||!e.activeController?!1:(e.isCancellingRun||(e.isCancellingRun=!0,e.status="正在停止...",R()),e.activeController.signal?.aborted||e.activeController.abort(),!0)}async function Q(D=-1){if(e.isBusy||!e.book)return{ok:!1,error:"ebook_busy"};const z=Number(D);if(!Number.isInteger(z)||z<0)return{ok:!1,error:"message_index_invalid"};const V=e.messages[z]?.role==="user"?z:Qa(e.messages,z-1),ie=V>=0?e.messages[V]:null,u=String(ie?.content||"").trim();return u?(e.messages=e.messages.slice(0,V+1),e.toolTrace=[],e.liveToolTurn=null,e.editingMessageIndex=-1,await y?.(e.book.id),o(),await U(u,{appendUserMessage:!1}),{ok:!0}):{ok:!1,error:"rerun_user_message_missing"}}return{cancelActiveRun:ue,rerunFromMessageIndex:Q,runAgent:U,runDelegate:te}}function ti(t,e){const r=t.ownerDocument.createElement("template");return r.innerHTML=e.trim(),r.content.firstElementChild}function xo(t){return t.matches("[data-agent-unit-children]")?t:t.querySelector("[data-agent-unit-children]")}function fo(t,e){return e.map((r,o)=>{const n=t.children[o];return{key:r.key,signature:r.shellSignature??r.signature,node:n,children:r.children?.length?fo(xo(n),r.children):[]}})}function mo(t,e=[],r=[],o=()=>{}){const n=new Map(e.map(l=>[l.key,l])),a=new Set(r.map(l=>l.key));e.forEach(l=>{a.has(l.key)||l.node.remove()});const i=r.map((l,b)=>{const y=n.get(l.key),f=l.shellSignature??l.signature,C=y?.signature===f,$=C?y.node:ti(t,l.scaffoldHtml??l.html),B=l.children?.length?mo(xo($),y?.children,l.children,o):[],R=t.children[b]||null;return R!==$&&t.insertBefore($,R),C||y?.node.remove(),$.dataset.agentUnitKey=l.key,!C&&!l.children&&o($),{key:l.key,signature:f,node:$,children:B}}),s=new Set(i.map(l=>l.node));return Array.from(t.childNodes).forEach(l=>{s.has(l)||l.remove()}),i}var ri="littlewhitebox-ebook-package";var oi=/\[ebook-image:([a-z0-9\-_]+)\]/gi;function yo(t=[]){const e=new Set;return(Array.isArray(t)?t:[]).forEach(r=>{const o=String(r?.content||"");for(const n of o.matchAll(oi)){const a=String(n?.[1]||"").trim();a&&e.add(a)}}),[...e]}function ni({book:t={},files:e=[],images:r=null}={}){const o=(Array.isArray(e)?e:[]).map(n=>({path:he(n?.path),content:typeof n?.content=="string"?n.content:"",createdAt:Number(n?.createdAt)||0,updatedAt:Number(n?.updatedAt)||0})).filter(n=>n.path).sort((n,a)=>n.path.localeCompare(a.path,"zh-CN"));return{type:ri,version:1,exportedAt:Date.now(),book:{title:String(t?.title||"未命名书稿"),createdAt:Number(t?.createdAt)||0,updatedAt:Number(t?.updatedAt)||0},files:o,images:r&&typeof r=="object"?{slots:Array.isArray(r.slots)?r.slots:[],previews:Array.isArray(r.previews)?r.previews:[],selections:Array.isArray(r.selections)?r.selections:[],skipped:Array.isArray(r.skipped)?r.skipped:[]}:{slots:yo(o),previews:[],selections:[],skipped:[]}}}function ai(t){const e=t&&typeof t=="object"?t:{};if(e.type!=="littlewhitebox-ebook-package")throw new Error("不是小白电纸书作品包");if(Number(e.version)!==1)throw new Error("作品包版本不支持");const r=(Array.isArray(e.files)?e.files:[]).map(n=>({path:he(n?.path),content:typeof n?.content=="string"?n.content:"",createdAt:Number(n?.createdAt)||0,updatedAt:Number(n?.updatedAt)||0})).filter(n=>n.path);if(!r.length)throw new Error("作品包没有书稿文件");const o=e.images&&typeof e.images=="object"?{slots:Array.isArray(e.images.slots)?e.images.slots:[],previews:Array.isArray(e.images.previews)?e.images.previews:[],selections:Array.isArray(e.images.selections)?e.images.selections:[]}:{slots:[],previews:[],selections:[]};return{title:String(e.book?.title||"导入书稿").trim()||"导入书稿",book:e.book&&typeof e.book=="object"?e.book:{},files:r,images:o}}function ii(t=""){const e=String(t||"ebook").trim().replace(/[\\/:*?"<>|]+/g,"_").replace(/\s+/g,"_").slice(0,80)||"ebook",r=new Date;return`${e}-${[r.getFullYear(),String(r.getMonth()+1).padStart(2,"0"),String(r.getDate()).padStart(2,"0")].join("")}.xbebook.json`}var Et="book/chapters/001.md",ko=/^book\/chapters\/.+\.md$/,vo=/\[ebook-image:([a-z0-9\-_]+)\]/gi,si=/!?\[([^\]]*)\]\([^)]+\)/g,li=500,di=5e3,fr="占位符已插入，请去阅读器查看";function ci(t=""){return ko.test(String(t||""))}function bi(t=""){return String(t||"").replace(vo,"").trim()}function ui(t){return new Promise((e,r)=>{const o=new FileReader;o.onload=()=>e(String(o.result||"")),o.onerror=()=>r(o.error||new Error("file_read_failed")),o.readAsText(t)})}function pi(t="ebook.json",e=""){const r=new Blob([e],{type:"application/json;charset=utf-8"}),o=URL.createObjectURL(r),n=document.createElement("a");n.href=o,n.download=t,n.style.display="none",document.body.appendChild(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(o),1e3)}function gi(){return new Promise(t=>{if(typeof requestAnimationFrame=="function"){requestAnimationFrame(()=>setTimeout(t,0));return}setTimeout(t,0)})}function hi(t=""){return String(t||"").replace(vo,`
`).replace(/```[\s\S]*?```/g,`
`).replace(/<[^>]+>/g,"").replace(si,"$1").replace(/^\s{0,3}#{1,6}\s+/gm,"").replace(/^\s{0,3}>\s?/gm,"").replace(/[*_`~]+/g,"").replace(/\n{3,}/g,`

`).trim()}function mr(t=""){return String(t||"").replace(/[*_`~]/g,"").replace(/[《》「」『』“”"'\s]/g,"").trim()}function xi(t="",e=""){const r=mr(e),o=String(t||"");return r?o.replace(/^\s{0,3}(?:\r?\n\s{0,3})*#{1,6}\s+(.+?)\s*#*\s*(?:\r?\n|$)/,(n,a)=>mr(a)!==r?n:""):o}function yr(t=""){const e=String(t||"").match(/^book\/chapters\/(.+)\.md$/);if(!e)return String(t||"章节");const r=e[1];return/^\d+$/.test(r)?`第 ${Number(r)} 章`:r||"章节"}function wo(t="",e=[]){const r=String(t||""),o=(Array.isArray(e)?e:[]).filter(n=>n?.slotId&&n.success!==!1).map(n=>({placement:n.placement,content:`[ebook-image:${String(n.slotId).trim()}]`})).filter(n=>!r.includes(n.content));return o.length?{content:Bo(r,o,{block:!0}),inserted:o.length}:{content:r,inserted:0}}function At(t="",e=[]){return wo(t,(Array.isArray(e)?e:[]).map(r=>({...r,placement:{mode:"tail"}})))}function kr(t="",e={}){const r=Number(e.current)||0,o=Number(e.total)||0,n=o?` ${r}/${o}`:"";switch(t){case"llm":return"正在分析章节画面...";case"gen":return o?`准备生成配图，共 ${o} 张`:"准备生成配图...";case"queued":return e.ahead>0?`画图排队中，前方 ${e.ahead} 个任务`:`画图排队中${n}`;case"progress":return`正在生成配图${n}`;case"cooldown":{const a=Number.isFinite(Number(e.remainingMs))?Number(e.remainingMs):Number(e.duration),i=a>0?`，剩余 ${(a/1e3).toFixed(1)}s`:"";return`等待下一张配图${o?` ${e.nextIndex||r}/${o}`:""}${i}`}case"success":return`配图完成 ${Number(e.success)||0}/${o||Number(e.success)||0}`;default:return"正在配图..."}}function fi(t=[]){const e=new Set((Array.isArray(t)?t:[]).map(o=>String(o?.path||"").match(/^book\/chapters\/(\d+)\.md$/)).filter(Boolean).map(o=>Number(o[1])).filter(o=>Number.isFinite(o)&&o>0));let r=1;for(;e.has(r);)r+=1;return`book/chapters/${String(r).padStart(3,"0")}.md`}function mi(t={}){const{state:e,render:r,renderStudioSurface:o,renderFilesSurface:n,requestHost:a,showToast:i,conversationStore:s}=t,l=typeof o=="function"?()=>{o()||r()}:r;let b=null,y=null,f=null;function C(){b&&(clearInterval(b),b=null)}function $(){y&&(clearTimeout(y),y=null)}function B(h=fr){$(),e.drawProgressText=h,y=setTimeout(()=>{y=null,!e.isDrawingChapter&&e.drawProgressText===h&&(e.drawProgressText="",l())},di),y?.unref?.(),l()}function R(h={}){C();const c=Math.max(0,Number(h.duration)||0),A=Date.now()+c,v=()=>{const O=Math.max(0,A-Date.now());e.drawProgressText=kr("cooldown",{...h,remainingMs:O}),l(),O<=0&&C()};v(),c>0&&(b=setInterval(v,li),b?.unref?.())}async function M(){if(e.books=await un(),!e.books.length){e.book=null,e.files=[],e.selectedPath="",e.readerPath="",e.editorContent="",e.savedContent="",e.isDeleteBookOpen=!1,e.viewMode="library";return}const h=await pn();e.book?.id&&(e.book=e.books.find(c=>c.id===e.book.id)||null),e.book||(e.book=e.books.find(c=>c.id===h)||e.books[0]),e.book?.id&&e.book.id!==h&&await Lt(e.book.id),e.files=await at(e.book.id),(!e.selectedPath||!e.files.some(c=>c.path===e.selectedPath))&&(e.selectedPath=e.files.find(c=>c.path===Et)?.path||e.files.find(c=>c.path==="book/outline.md")?.path||e.files[0]?.path||""),(!e.readerPath||!e.files.some(c=>c.path===e.readerPath))&&(e.readerPath=e.files.find(c=>/^book\/chapters\/.+\.md$/.test(c.path))?.path||""),e.editorContent=e.files.find(c=>c.path===e.selectedPath)?.content||"",e.savedContent=e.editorContent}function _(){return e.editorContent!==e.savedContent}function g(){const h=e.files.filter(c=>ko.test(String(c?.path||"")));return h.length&&(h.find(c=>c.path===e.readerPath)||h[0])||null}function k(){return["loading","playing"].includes(String(e.readerTtsPlayback?.status||""))}function S(){e.chapterSortDescending=!e.chapterSortDescending,!(typeof n=="function"&&n())&&r()}function m(h="idle"){e.readerTtsPlayback={status:h,playbackId:"",chapterPath:"",error:""}}function T(){return`ebook-tts-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}async function P(h={}){try{const c=await a("xb-ebook:tts-status",{});e.readerTtsStatus={enabled:!!c?.enabled,ready:!!c?.ready}}catch{e.readerTtsStatus={enabled:!1,ready:!1}}return h.renderAfter&&r(),e.readerTtsStatus}async function w(h={}){const{renderAfter:c=!0,silent:A=!0}=h,v=e.readerTtsPlayback?.playbackId||"";return!v&&!k()?!1:(m("idle"),c&&r(),await a("xb-ebook:tts-stop",{playbackId:v},{timeoutMs:Zt}).catch(O=>{A||i?.(`停止朗读失败：${O?.message||O}`)}),!0)}function W(h={}){const c=String(h.playbackId||"");if(c&&e.readerTtsPlayback?.playbackId&&c!==e.readerTtsPlayback.playbackId)return;const A=String(h.state||"");if(A==="loading"||A==="playing"){e.readerTtsPlayback={...e.readerTtsPlayback,status:A,error:""},r();return}if(A==="error"){const v=h.message||h.info?.message||"朗读失败";m("idle"),i?.(`朗读失败：${v}`),r();return}["ended","stopped","blocked"].includes(A)&&(m("idle"),A==="blocked"&&i?.("朗读被浏览器阻止，请再点一次播放"),r())}async function K(h=""){if(e.isShelfLoading||e.shelfLoadError||e.isBusy)return;const c=await vt(h);c&&(_()&&!confirm("当前文件还没保存，确定切换书籍吗？")||(me(w({renderAfter:!1}),{source:import.meta.url,operation:"selectBook"}),await Lt(c.id),e.book=c,e.selectedPath="",e.readerPath="",e.viewMode="book-entry",await M(),await s?.restoreConversation?.(c.id),r()))}async function ne(h=""){if(_()&&!confirm("当前文件还没保存，确定切换文件吗？"))return;const c=e.files.find(v=>v.path===h);if(!c)return;me(w({renderAfter:!1}),{source:import.meta.url,operation:"selectFile"});const A=e.viewMode==="studio";if(e.selectedPath=c.path,e.viewMode="studio",e.editorContent=c.content,e.savedContent=c.content,A){const v=typeof n=="function"&&n(),O=typeof o=="function"&&o();if(v&&O)return}r()}async function ee(){e.book&&(_()&&!confirm("当前文件还没保存，确定回到书本入口吗？")||(me(w({renderAfter:!1}),{source:import.meta.url,operation:"showBookEntry"}),e.viewMode="book-entry",r()))}async function ae(){e.book&&(_()&&e.viewMode!=="studio"&&!confirm("当前文件还没保存，确定进入创作台吗？")||(me(w({renderAfter:!1}),{source:import.meta.url,operation:"showStudio"}),e.viewMode="studio",r()))}async function te(){if(!e.book||_()&&!confirm("当前文件还没保存，确定进入阅读器吗？"))return;const h=e.files.find(c=>/^book\/chapters\/.+\.md$/.test(c.path));!e.readerPath&&h&&(e.readerPath=h.path),e.viewMode="reader",r(),me(P({renderAfter:!0}),{source:import.meta.url,operation:"showReader"})}async function U(h=""){const c=e.files.find(A=>A.path===h&&/^book\/chapters\/.+\.md$/.test(A.path));c&&(me(w({renderAfter:!1}),{source:import.meta.url,operation:"selectReaderChapter"}),e.readerPath=c.path,e.viewMode="reader",r())}async function ue(){_()&&!confirm("当前文件还没保存，确定回到书架吗？")||(me(w({renderAfter:!1}),{source:import.meta.url,operation:"showLibrary"}),e.viewMode="library",r())}async function Q(){!e.book||!e.selectedPath||e.isBusy||(await Re(e.book.id,e.selectedPath,e.editorContent),await M(),i("已保存"))}async function D(h={}){try{const c=await a("xb-ebook:draw-status",{});e.drawStatus={provider:c?.provider||"disabled",enabled:!!c?.enabled,ready:!!c?.ready}}catch{e.drawStatus={provider:"disabled",enabled:!1,ready:!1}}return h.renderAfter&&r(),e.drawStatus}async function z(){if(k()){await w({renderAfter:!0,silent:!1});return}if(!e.book)return;const h=g();if(!h){i?.("还没有可朗读章节");return}const c=await P();if(!c.enabled||!c.ready){i?.("TTS 语音模块未启用"),r();return}const A=yr(h.path),v=hi(xi(h.content,A));if(!v){i?.("当前章节没有可朗读正文");return}const O=T();e.readerTtsPlayback={status:"loading",playbackId:O,chapterPath:h.path,error:""},r();try{const se=await a("xb-ebook:tts-play",{playbackId:O,text:v,bookId:e.book.id,bookTitle:e.book.title||"未命名书稿",chapterPath:h.path,chapterTitle:A},{timeoutMs:Zt});if(se?.ok===!1)throw new Error(se?.error||"tts_failed")}catch(se){e.readerTtsPlayback?.playbackId===O&&(m("idle"),i?.(`朗读失败：${se?.message||se}`),r())}}function V(h={}){if(e.isDrawingChapter){if($(),h.state==="cooldown"){R(h.data||{});return}C(),e.drawProgressText=kr(h.state,h.data||{}),l()}}function ie(){return!e.isDrawingChapter||!f?!1:(f.abort(),C(),$(),e.drawProgressText="正在停止配图...",l(),!0)}async function u(){if(e.isDrawingChapter){ie();return}if(!e.book||e.isBusy)return;if(!ci(e.selectedPath)){i?.("只有正文章节可以配图");return}if(!bi(e.editorContent)){i?.("当前章节没有正文");return}const h=await D();if(!h.enabled||!h.ready){i?.("画图后端未启用"),r();return}const c=e.book.id,A=e.book.title||"未命名书稿",v=e.selectedPath,O=yr(v),se=e.editorContent;let de="";C(),$(),f=new AbortController;const fe=f;e.isDrawingChapter=!0,e.drawProgressText="正在准备章节配图...",l();try{const ce=await a("xb-ebook:draw-generate",{source:"ebook",text:se,title:O,bookId:c,bookTitle:A,chapterPath:v,chapterTitle:O},{timeoutMs:null,signal:fe.signal});if(fe.signal.aborted||ce?.aborted){i?.("配图已取消");return}const ft=await vt(c),Ie=await it(c,v);if(!ft){i?.("配图完成，但原书已删除，图片仍保留在画廊中");return}if(!Ie){i?.("配图完成，但原章节已删除，图片仍保留在画廊中");return}const ke=()=>e.book?.id===c&&e.selectedPath===v;let ge=ke()?e.editorContent:Ie.content,J=Ie.content,F,pe=!1;const Oe=()=>!ke()||e.editorContent!==ge||ge===J?!1:(e.editorContent=F.content,e.drawProgressText="",de="图片占位符已插入，请保存章节",i?.(de),!0);try{F=wo(ge,ce?.images||[])}catch(ve){if(ve instanceof Lo){if(pe=confirm(`章节正文在配图期间发生了变化。本次图片已经生成，是否改为插到当前章节末尾？

不会重新生成，也不会再次消耗额度。`),!pe){i?.("本次图片已保留在画廊中，未写入正文");return}ge=ke()?e.editorContent:Ie.content,F=At(ge,ce?.images||[])}else throw ve}if(!F.inserted){i?.(Number(ce?.success)>0?"本次图片已经在章节中，无需重复插入":`配图完成，但没有成功图片可插入（${ce?.success||0}/${ce?.total||0}）`);return}if(ke()&&e.editorContent!==ge){if(!pe&&(pe=confirm(`章节正文刚刚又发生了变化。本次图片已经生成，是否改为插到当前章节末尾？

不会重新生成，也不会再次消耗额度。`),!pe)){i?.("本次图片已保留在画廊中，未写入正文");return}ge=e.editorContent,F=At(ge,ce?.images||[])}if(Oe())return;let ze=!1,X=await Qt(c,v,J,F.content);if(!X.ok&&X.reason==="conflict"&&X.current){if(!pe&&(pe=confirm(`章节正文刚刚在另一处被更新。本次图片已经生成，是否改为插到最新正文末尾？

不会重新生成，也不会再次消耗额度。`),!pe)){i?.("本次图片已保留在画廊中，未写入正文");return}if(J=X.current.content,ge=ke()?e.editorContent:X.current.content,F=At(ge,ce?.images||[]),ze=F.inserted===0,Oe())return;X=F.inserted?await Qt(c,v,J,F.content):{ok:!0,reason:"",file:X.current}}if(!X.ok){const ve=X.reason==="missing"?"原章节已删除，图片仍保留在画廊中":"章节正文仍在变化，本次图片已保留在画廊中，未写入正文";i?.(ve);return}const qe=await at(c);e.book?.id===c&&(e.files=qe,e.selectedPath===v&&e.editorContent===ge?(e.editorContent=F.content,e.savedContent=F.content):e.selectedPath===v&&(e.savedContent=F.content)),e.drawProgressText="",de=ze?"本次图片已经在章节中，无需重复插入":fr,i?.(de)}catch(ce){fe.signal.aborted||/已取消|abort/i.test(String(ce?.message||ce||""))?i?.("配图已取消"):i?.(`配图失败：${ce?.message||ce}`)}finally{f===fe&&(f=null),C(),e.isDrawingChapter=!1,de?B(de):(e.drawProgressText="",l())}}async function x(h=""){return a("xb-ebook:draw-image",{slotId:h})}async function j(){if(e.isShelfLoading||e.shelfLoadError||e.isBusy)return;const h=prompt("新书名","新书稿");h!==null&&(_()&&!confirm("当前文件还没保存，确定新建书籍吗？")||(me(w({renderAfter:!1}),{source:import.meta.url,operation:"createNewBook"}),e.book=await gn(h),e.selectedPath=Et,e.readerPath=Et,e.viewMode="book-entry",await M(),await s?.restoreConversation?.(e.book.id),r()))}async function q(){if(!e.book||e.isBusy)return;const h=prompt("书名",e.book.title||"未命名书稿");if(h!==null)try{e.book=await _r(e.book.id,h),await M(),i("书名已更新"),r()}catch(c){i(`改名失败：${c?.message||c}`)}}function G(){e.isShelfLoading||e.shelfLoadError||e.isBusy||e.bookTransferProgress||(e.isBookTransferMenuOpen=!1,e.isBookExportOpen=!0,r())}function Y(){e.bookTransferProgress||(e.isBookExportOpen=!1,r())}async function xe(h="export",c="",A=""){e.bookTransferProgress={mode:h,title:String(c||"").trim(),detail:String(A||"").trim(),startedAt:Date.now()},e.status=A||(h==="import"?"正在导入作品包...":"正在导出作品包..."),r(),await gi()}function Ae(){e.bookTransferProgress=null,e.status="就绪"}async function d(h=""){if(e.isShelfLoading||e.shelfLoadError||e.isBusy||e.bookTransferProgress)return;const c=String(h||"").trim();if(!c)return;const A=e.books.find(v=>v.id===c)||await vt(c);if(!A){i?.("没有找到这本书");return}if(confirm(`导出《${A.title||"未命名书稿"}》？`)){await xe("export",A.title||"未命名书稿","正在读取书稿文件...");try{const v=await at(c),O=yo(v);await xe("export",A.title||"未命名书稿",O.length?`正在打包 ${O.length} 个阅读器配图...`:"正在生成作品包...");const se=O.length?await a("xb-ebook:export-images",{slotIds:O},{timeoutMs:Vt}):{images:{slots:[],previews:[],selections:[],skipped:[]}};await xe("export",A.title||"未命名书稿","正在生成下载文件...");const de=ni({book:A,files:v,images:se?.images||null});pi(ii(A.title||"ebook"),JSON.stringify(de,null,2));const fe=de.images?.skipped?.length||0;e.isBookExportOpen=!1,i?.(fe?`已导出，${fe} 张图片未找到数据`:"作品包已导出")}catch(v){i?.(`导出失败：${v?.message||v}`)}finally{Ae(),r()}}}async function E(h){if(!(e.isShelfLoading||e.shelfLoadError||e.isBusy||e.bookTransferProgress||!h)){await xe("import",h.name||"作品包","正在读取作品包...");try{const c=await ui(h);await xe("import",h.name||"作品包","正在解析作品包...");const A=ai(JSON.parse(c));await xe("import",A.title||h.name||"作品包","正在写入书稿文件...");const v=await hn(A.title,A.files);let O="";if(A.images?.previews?.length||A.images?.selections?.length)try{await xe("import",v.title||A.title,`正在导入 ${A.images.previews?.length||0} 张阅读器配图...`),await a("xb-ebook:import-images",{images:A.images,bookId:v.id,bookTitle:v.title},{timeoutMs:Vt})}catch(se){O=se?.message||String(se||"image_import_failed")}await M(),e.isBookExportOpen=!1,i?.(O?`已导入：${v.title||A.title}，但图片导入失败：${O}`:`已导入：${v.title||A.title}`)}catch(c){i?.(`导入失败：${c?.message||c}`)}finally{Ae(),r()}}}async function L(){if(!e.book||e.isBusy||_()&&!confirm("当前文件还没保存，确定新建章节吗？"))return;const h=prompt("新章节路径（必须放在 book/chapters/ 下）",fi(e.files));if(h!==null)try{const c=he(h);if(!c||!c.startsWith("book/chapters/"))throw new Error("chapter_path_required");if(e.files.some(A=>A.path===c))throw new Error("chapter_already_exists");await Re(e.book.id,c,""),await M(),e.selectedPath=c,e.viewMode="studio",await M(),r()}catch(c){i(`新建失败：${c?.message||c}`)}}async function H(h=""){if(!(!e.book||e.isBusy)&&!(_()&&!confirm("当前文件还没保存，导入资料会切换到资料文件并放弃未保存修改，确定继续吗？"))){e.status="正在导入资料...",r();try{const c=await a("xb-ebook:import-material",{kind:h,bookId:e.book.id});if(!c?.ok)throw new Error(c?.error||"import_failed");await Re(e.book.id,c.path,c.content||""),await M(),e.selectedPath=c.path,e.viewMode="studio",await M(),i(`已导入：${c.label||c.path}`)}catch(c){i(`导入失败：${c?.message||c}`)}finally{e.status="就绪",r()}}}async function N(){await M(),await s?.restoreConversation?.(e.book?.id)}async function Z(h=""){if(e.isBusy)return;const c=String(h||"").trim();if(!c||!confirm("确定要删除这本书吗？所有书稿内容和写作记录都将被清除，无法恢复。"))return;const A=e.book?.id||"",v=A===c;try{v&&me(w({renderAfter:!1}),{source:import.meta.url,operation:"removeBook"}),await yn(c),v&&(e.book=null,e.selectedPath="",e.readerPath=""),await M(),e.isDeleteBookOpen=!1,e.viewMode="library";const O=e.book?.id||"";(v||!A||O!==A)&&await s?.restoreConversation?.(O),i("书籍已删除"),r()}catch(O){i(`删除失败：${O?.message||O}`)}}return{cancelCurrentChapterDraw:ie,createNewBook:j,createNewFile:L,drawCurrentChapter:u,closeExportDialog:Y,exportBookPackage:d,getDrawImage:x,handleDrawProgress:V,handleTtsState:W,importBookPackageFile:E,importMaterial:H,initializeBook:N,isEditorDirty:_,refreshBooksAndFiles:M,refreshDrawStatus:D,refreshTtsStatus:P,removeBook:Z,renameCurrentBook:q,openExportDialog:G,saveCurrentFile:Q,selectBook:K,selectFile:ne,selectReaderChapter:U,showBookEntry:ee,showLibrary:ue,showReader:te,showStudio:ae,stopReaderTts:w,toggleChapterSortOrder:S,toggleReaderTts:z}}var $t=Promise.resolve();function Ct(t=""){return String(t||"").trim()}function So(t={}){return t&&["user","assistant","tool"].includes(t.role)&&!t.streaming&&typeof t.content=="string"}function ut(t){if(t!==void 0)try{return JSON.parse(JSON.stringify(t))}catch{return}}function yi(t,e={},r=0){return{bookId:t,order:r,role:e.role,content:String(e.content||""),error:!!e.error,toolCallId:e.toolCallId?String(e.toolCallId):"",toolName:e.toolName?String(e.toolName):"",toolCalls:Array.isArray(e.toolCalls)?e.toolCalls.map(o=>({id:String(o?.id||""),name:String(o?.name||""),arguments:String(o?.arguments||"{}"),...Object.prototype.hasOwnProperty.call(o||{},"providerId")?{providerId:String(o.providerId||"")}:{}})).filter(o=>o.name):[],providerPayload:ut(e.providerPayload),toolDisplay:ut(e.toolDisplay),thoughts:pt(e.thoughts),createdAt:Number(e.createdAt)||Date.now()}}function ki(t={}){return So(t)?{role:t.role,content:String(t.content||""),error:!!t.error,toolCallId:t.toolCallId?String(t.toolCallId):void 0,toolName:t.toolName?String(t.toolName):void 0,toolCalls:Array.isArray(t.toolCalls)?t.toolCalls.map(e=>({id:String(e?.id||""),name:String(e?.name||""),arguments:String(e?.arguments||"{}"),...Object.prototype.hasOwnProperty.call(e||{},"providerId")?{providerId:String(e.providerId||"")}:{}})).filter(e=>e.name):void 0,providerPayload:ut(t.providerPayload),toolDisplay:ut(t.toolDisplay),thoughts:pt(t.thoughts),createdAt:Number(t.createdAt)||0}:null}function To(t){t.toolTrace=[],t.liveToolTurn=null,t.openToolTurnKeys=[],t.openThoughtKeys=[],t.editingMessageIndex=-1,t.messageActionFeedback={},gt(t)}function ot(t){t.messages=[],To(t),t.historySummary="",t.archivedTurnCount=0}function vi(t={}){const{state:e}=t;function r(s=e.book?.id){const l=Ct(s);return{bookId:l,messages:(e.messages||[]).filter(So).map((b,y)=>yi(l,b,y)),updatedAt:Date.now()}}async function o(s){s.bookId&&await be.transaction("rw",Be,Ce,async()=>{await Be.put({bookId:s.bookId,historySummary:"",updatedAt:s.updatedAt}),await Ce.where("bookId").equals(s.bookId).delete(),s.messages.length&&await Ce.bulkPut(s.messages)})}function n(s=e.book?.id){const l=r(s);return $t=$t.catch(b=>{console.warn({source:import.meta.url,operation:"persistConversation"},b)}).then(async()=>{try{return await o(l),{ok:!0}}catch(b){return console.error("[Ebook] 保存创作对话失败:",b),{ok:!1,error:b?.message||String(b||"save_failed")}}}),$t}async function a(s=e.book?.id){const l=Ct(s);if(!l){ot(e);return}try{if(!await Be.get(l)){ot(e);return}const b=await Ce.where("bookId").equals(l).toArray();b.sort((y,f)=>Number(y.order||0)-Number(f.order||0)),e.messages=b.map(ki).filter(Boolean),To(e),e.historySummary="",e.archivedTurnCount=0}catch(b){console.error("[Ebook] 恢复创作对话失败:",b),ot(e)}}async function i(s=e.book?.id){const l=Ct(s);l&&(await be.transaction("rw",Be,Ce,async()=>{await Ce.where("bookId").equals(l).delete(),await Be.delete(l)}),e.book?.id===l&&ot(e))}return{clearConversation:i,persistConversation:n,restoreConversation:a}}function Ot(t={}){return Ro(t||{})}function wi(t={},e={}){return Io(t,e)}function Si(t={}){return rn(t)}var Ti="LittleWhiteBox_Ebook_ColorTheme";function Ei(){try{return globalThis.localStorage?.getItem("LittleWhiteBox_Ebook_ColorTheme")==="light"?"light":"dark"}catch{return"dark"}}function Ai(){return{config:Ot({}),configLoadError:"",configDraft:null,configDirty:!1,books:[],book:null,files:[],selectedPath:"",readerPath:"",chapterSortDescending:!1,viewMode:"library",editorContent:"",savedContent:"",messages:[],toolTrace:[],liveToolTurn:null,openToolTurnKeys:[],openThoughtKeys:[],editingMessageIndex:-1,messageActionFeedback:{},uiMessageWindowLimit:5,historySummary:"",archivedTurnCount:0,contextStats:null,compactionOverlay:null,protocolNotice:null,isShelfLoading:!0,shelfLoadError:"",isBusy:!1,isCancellingRun:!1,activeController:null,agentAutoScroll:!0,agentForceScrollBottomOnce:!1,agentInputDraft:"",drawStatus:{provider:"disabled",enabled:!1,ready:!1},isDrawingChapter:!1,drawProgressText:"",readerTtsStatus:{enabled:!1,ready:!1},readerTtsPlayback:{status:"idle",playbackId:"",chapterPath:"",error:""},studioLayout:"balanced",colorTheme:Ei(),isSettingsOpen:!1,isDeleteBookOpen:!1,isBookTransferMenuOpen:!1,isBookExportOpen:!1,bookTransferProgress:null,configPage:"main",configFormSyncPending:!0,modelOptionsByProvider:{},pullStateByProvider:{},configSave:{status:"idle",requestId:"",error:""},status:"正在打开书架...",toast:""}}function $i(t="xb-ebook-root"){if(document.getElementById("xb-ebook-styles"))return;const e=document.createElement("style");e.id="xb-ebook-styles",e.textContent=`
        :root {
            color-scheme: dark;
            --xb-bg-deep: #171922;
            --xb-bg-editor: #1c1f2a;
            --xb-bg-agent: #20232d;
            --xb-bg-card: #242834;
            --xb-bg-glass: rgba(255, 255, 255, 0.045);
            --xb-text-main: #b8b2a6;
            --xb-text-body: #a19b90;
            --xb-text-muted: #8f8a80;
            --xb-text-dim: #706d68;
            --xb-line: rgba(184, 178, 166, 0.12);
            --xb-line-strong: rgba(184, 178, 166, 0.20);
            --xb-cyan: #8fb4bd;
            --xb-indigo: #b3adca;
            --xb-gold: #b8b2a6;
            --xb-danger: #d88490;
            --xb-ok: #96b8b2;
            --xb-shadow: 0 16px 34px rgba(0, 0, 0, 0.26);
            --xb-font-ui: "Inter", "Segoe UI", "Microsoft YaHei", sans-serif;
            --xb-font-serif: "Lora", "LXGW WenKai", "Noto Serif SC", "Microsoft YaHei", serif;
            --xb-font-mono: "JetBrains Mono", "Cascadia Code", "Consolas", monospace;
            --xb-fluid: cubic-bezier(0.16, 1, 0.3, 1);
        }

        *, *::before, *::after { box-sizing: border-box; }
        html, body, #${t} { width: 100%; height: 100%; margin: 0; overflow: hidden; }
        body {
            background: var(--xb-bg-deep);
            color: var(--xb-text-main);
            font-family: var(--xb-font-ui);
            -webkit-font-smoothing: subpixel-antialiased;
            text-rendering: auto;
        }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.42); border-radius: 999px; }

        button, input, select, textarea { font: inherit; }
        button {
            border: 1px solid var(--xb-line);
            border-radius: 12px;
            background: var(--xb-bg-glass);
            color: var(--xb-text-main);
            cursor: pointer;
            transition: transform 0.22s ease, background 0.22s ease, border-color 0.22s ease, color 0.22s ease, box-shadow 0.22s ease, opacity 0.22s ease;
        }
        button:hover:not(:disabled) {
            transform: translateY(-1px);
            border-color: var(--xb-line-strong);
            background: rgba(255, 255, 255, 0.07);
            box-shadow: none;
        }
        button:disabled { opacity: 0.56; cursor: not-allowed; }
        h1, h2, h3, p { margin: 0; }

        .xb-ebook-screen {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: hidden;
            background: var(--xb-bg-deep);
            color: var(--xb-text-main);
        }
        .xb-library-screen {
            display: grid;
            grid-template-rows: 176px minmax(0, 1fr);
        }
        .xb-ebook-screen.theme-light,
        .xb-ebook-shell.theme-light {
            color-scheme: light;
            --xb-bg-deep: #fffaf0;
            --xb-bg-editor: #fffdf8;
            --xb-bg-agent: #fff8ec;
            --xb-bg-card: rgba(255, 253, 248, 0.96);
            --xb-bg-glass: rgba(87, 70, 48, 0.045);
            --xb-text-main: #24201b;
            --xb-text-body: #2e2922;
            --xb-text-muted: #665f54;
            --xb-text-dim: #867d70;
            --xb-line: rgba(87, 70, 48, 0.15);
            --xb-line-strong: rgba(87, 70, 48, 0.25);
            --xb-cyan: #3d7c83;
            --xb-indigo: #686283;
            --xb-gold: #3a3329;
            --xb-danger: #b64d5d;
            --xb-ok: #32766d;
            --xb-shadow: 0 18px 44px rgba(87, 70, 48, 0.12);
            background: var(--xb-bg-deep);
            color: var(--xb-text-main);
        }
        .theme-light button:hover:not(:disabled) {
            border-color: var(--xb-line-strong);
            background: rgba(87, 70, 48, 0.07);
            box-shadow: 0 12px 28px rgba(87, 70, 48, 0.12);
        }
        .xb-ambient-aurora {
            position: absolute;
            top: -24vh;
            left: 24vw;
            width: 68vw;
            height: 64vh;
            pointer-events: none;
            z-index: 0;
            background: radial-gradient(ellipse, rgba(166, 171, 200, 0.045), rgba(143, 183, 202, 0.018), transparent 62%);
            filter: blur(86px);
            animation: xb-aurora-drift 15s infinite alternate ease-in-out;
        }
        .theme-light .xb-ambient-aurora,
        .theme-light .xb-agent-aurora,
        .theme-light .xb-reader-backlight {
            display: none;
        }
        @keyframes xb-aurora-drift {
            100% { transform: translateY(48px) scale(1.08); }
        }
        .xb-toast {
            position: fixed;
            left: 50%;
            bottom: 32px;
            z-index: 200;
            transform: translateX(-50%);
            max-width: min(520px, calc(100vw - 32px));
            padding: 12px 20px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 999px;
            background: rgba(241, 245, 249, 0.92);
            color: #111216;
            box-shadow: var(--xb-shadow);
            font-size: 13px;
            font-weight: 600;
        }
        .xb-empty {
            color: var(--xb-text-muted);
            line-height: 1.7;
        }
        .xb-kicker {
            color: var(--xb-gold);
            font-family: var(--xb-font-mono);
            font-size: 11px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
        }

        /* Archive */
        .xb-archive-header {
            position: relative;
            z-index: 20;
            grid-row: 1;
            height: 176px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 28px;
            padding: 42px 60px 34px;
        }
        .xb-archive-header::after {
            content: "";
            position: absolute;
            left: 60px;
            right: 60px;
            bottom: 0;
            height: 1px;
            background: linear-gradient(90deg, rgba(235, 231, 221, 0.32), rgba(235, 231, 221, 0.11) 38%, transparent);
        }
        .xb-archive-title-block {
            min-width: 0;
        }
        .xb-archive-header h1 {
            font-family: var(--xb-font-serif);
            font-size: clamp(34px, 4vw, 52px);
            font-weight: 400;
            letter-spacing: 0;
        }
        .xb-archive-subtitle {
            margin-top: 10px;
            max-width: 520px;
            color: var(--xb-text-body);
            font-family: var(--xb-font-ui);
            font-size: 14px;
            letter-spacing: 0.08em;
            line-height: 1.5;
        }
        .xb-archive-meta {
            margin-top: 12px;
            color: var(--xb-text-muted);
            font-family: var(--xb-font-mono);
            font-size: 12px;
            letter-spacing: 0.22em;
            text-transform: uppercase;
        }
        .xb-global-actions,
        .xb-home-actions {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: flex-end;
            gap: 12px;
        }
        .xb-glass-button,
        .xb-home-actions button {
            min-height: 40px;
            padding: 0 18px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.045);
            color: var(--xb-text-main);
            font-size: 13px;
            font-weight: 600;
        }
        .xb-global-actions {
            flex-wrap: nowrap;
            gap: 8px;
            padding-top: 2px;
        }
        .xb-global-actions .xb-glass-button {
            width: 30px;
            min-width: 30px;
            height: 30px;
            min-height: 30px;
            padding: 0;
            border-color: transparent;
            background: transparent;
            color: var(--xb-text-muted);
            box-shadow: none;
            backdrop-filter: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .xb-global-actions .xb-glass-button:hover:not(:disabled),
        .xb-global-actions .xb-glass-button:focus-visible {
            outline: none;
            transform: none;
            border-color: var(--xb-line);
            background: rgba(255, 255, 255, 0.055);
            color: var(--xb-text-main);
        }
        .xb-exit-button {
            width: 40px;
            min-width: 40px;
            height: 40px;
            min-height: 40px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 0;
        }
        #xb-close.xb-exit-button {
            width: 40px;
            min-width: 40px;
            height: 40px;
            min-height: 40px;
            padding: 0;
        }
        .xb-exit-icon {
            width: 18px;
            height: 18px;
            display: block;
        }
        .xb-theme-icon {
            width: 17px;
            height: 17px;
            display: block;
            color: currentColor;
        }
        .xb-transfer-tray-icon {
            width: 18px;
            height: 18px;
        }
        .xb-transfer-button {
            width: 40px;
            min-width: 40px;
            height: 40px;
            min-height: 40px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 0;
        }
        .xb-global-actions #xb-close.xb-exit-button,
        .xb-global-actions .xb-transfer-button {
            width: 30px;
            min-width: 30px;
            height: 30px;
            min-height: 30px;
            padding: 0;
        }
        .xb-theme-glyph {
            display: block;
            color: currentColor;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 18px;
            font-weight: 400;
            line-height: 1;
            transform: translateY(-0.5px);
        }
        .xb-danger-button { color: var(--xb-danger); }
        .xb-danger-button:hover:not(:disabled) {
            border-color: rgba(244, 63, 94, 0.34);
            background: rgba(244, 63, 94, 0.12);
        }
        .xb-shelf-container {
            position: relative;
            z-index: 1;
            grid-row: 2;
            min-height: 0;
            overflow: auto;
            padding: 30px 60px 96px;
        }
        .xb-library-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 34px;
        }
        .xb-library-grid.is-empty {
            min-height: 100%;
            align-content: start;
        }
        .xb-library-empty {
            grid-column: 1 / -1;
            min-height: 220px;
            display: grid;
            place-items: center;
            border: 1px dashed rgba(255, 255, 255, 0.12);
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.035);
            text-align: center;
        }
        .xb-shelf-actions {
            display: contents;
        }
        .xb-shelf-action {
            position: relative;
            min-height: 330px;
            aspect-ratio: 3 / 4;
            padding: 28px 22px;
            display: grid;
            align-content: center;
            place-items: center;
            gap: 16px;
            border-radius: 12px;
            border: 1px dashed rgba(255, 255, 255, 0.16);
            background: rgba(255, 255, 255, 0.026);
            color: var(--xb-text-main);
            text-align: center;
            transition: transform 0.28s var(--xb-fluid), border-color 0.22s ease, background 0.22s ease, color 0.22s ease, opacity 0.22s ease;
        }
        .xb-shelf-action-ring {
            width: 74px;
            height: 74px;
            display: grid;
            place-items: center;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            background: rgba(255, 255, 255, 0.055);
            font-size: 34px;
            font-weight: 300;
            line-height: 1;
        }
        .xb-shelf-action strong {
            color: var(--xb-text-muted);
            font-size: 13px;
            font-weight: 600;
        }
        .xb-shelf-action:hover:not(:disabled) {
            transform: translateY(-6px);
            border-color: rgba(255, 255, 255, 0.34);
            background: rgba(255, 255, 255, 0.045);
        }
        .xb-shelf-action-danger {
            color: var(--xb-danger);
        }
        .xb-shelf-action-danger:hover:not(:disabled),
        .xb-shelf-action-danger.is-active {
            border-color: rgba(244, 63, 94, 0.42);
            background: rgba(244, 63, 94, 0.12);
        }
        .xb-shelf-action:disabled {
            opacity: 0.34;
        }
        .xb-delete-mode-note {
            margin: 0 0 18px;
            color: var(--xb-danger);
            font-size: 13px;
            letter-spacing: 0.06em;
        }
        .xb-library-book {
            position: relative;
            min-height: 330px;
            aspect-ratio: 3 / 4;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            padding: 30px 24px 24px;
            border: 1px solid rgba(255, 255, 255, 0.045);
            border-radius: 12px;
            background: var(--xb-bg-card);
            text-align: left;
            box-shadow: 0 18px 46px rgba(0, 0, 0, 0.24);
            transition: transform 0.42s var(--xb-fluid), border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
        }
        .xb-library-book::before {
            content: "";
            position: absolute;
            inset: 0 auto 0 -80%;
            width: 48%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.035), transparent);
            transform: skewX(-18deg);
            transition: left 0.7s ease;
        }
        .xb-library-book:hover:not(:disabled) {
            transform: translateY(-8px);
            border-color: rgba(255, 255, 255, 0.16);
            box-shadow: 0 24px 58px rgba(0, 0, 0, 0.34);
        }
        .xb-library-book:hover::before { left: 140%; }
        .xb-library-book.is-active {
            border-color: rgba(143, 183, 202, 0.34);
            box-shadow: 0 20px 54px rgba(0, 0, 0, 0.30);
        }
        .xb-library-book.is-delete-target {
            border-color: rgba(244, 63, 94, 0.34);
            animation: xb-delete-vibrate 0.34s infinite alternate ease-in-out;
        }
        .xb-library-book.is-delete-target:hover:not(:disabled) {
            background: rgba(244, 63, 94, 0.10);
            border-color: rgba(244, 63, 94, 0.72);
            box-shadow: 0 20px 48px rgba(0, 0, 0, 0.30);
        }
        @keyframes xb-delete-vibrate {
            0% { transform: rotate(-0.42deg); }
            100% { transform: rotate(0.42deg); }
        }
        .xb-book-spine {
            position: absolute;
            left: 0;
            top: 24px;
            bottom: 24px;
            width: 3px;
            border-radius: 999px;
            background: linear-gradient(var(--xb-indigo), var(--xb-cyan));
            opacity: 0.76;
        }
        .xb-library-book-main {
            display: grid;
            gap: 12px;
            min-width: 0;
        }
        .xb-library-book strong {
            color: var(--xb-text-main);
            font-family: var(--xb-font-serif);
            font-size: 25px;
            font-weight: 400;
            line-height: 1.25;
        }
        .xb-library-book small {
            color: var(--xb-text-muted);
            font-size: 13px;
            line-height: 1.6;
        }
        .xb-library-book-foot {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding-top: 22px;
            border-top: 1px solid rgba(255, 255, 255, 0.045);
        }
        .xb-library-book-foot em {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 9px;
            border-radius: 5px;
            background: rgba(143, 183, 202, 0.14);
            color: var(--xb-cyan);
            font-family: var(--xb-font-mono);
            font-size: 10px;
            font-style: normal;
            letter-spacing: 0.08em;
        }
        .xb-library-book-foot em::before {
            content: "";
            width: 6px;
            height: 6px;
            border-radius: 999px;
            background: currentColor;
        }
        .is-delete-target .xb-library-book-foot em {
            background: rgba(244, 63, 94, 0.12);
            color: var(--xb-danger);
        }

        /* Entry portal */
        .xb-entry-screen {
            display: grid;
            place-items: center;
        }
        .xb-portal-close {
            position: absolute;
            z-index: 5;
            width: 42px;
            height: 42px;
            padding: 0;
            border-radius: 999px;
            background: transparent;
            color: rgba(241, 245, 249, 0.58);
            font-size: 26px;
        }
        .xb-portal-close { top: 34px; left: 50%; transform: translateX(-50%); }
        .xb-portal-close:hover:not(:disabled) { transform: translateX(-50%) translateY(-1px); }
        .xb-portal-theme {
            position: absolute;
            top: 36px;
            right: 42px;
            z-index: 5;
            min-width: 62px;
            height: 36px;
            padding: 0 14px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.06);
            color: var(--xb-text-main);
            font-size: 13px;
            font-weight: 700;
        }
        .xb-entry-portal {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
        }
        .xb-entry-actions {
            display: flex;
            width: 100%;
            height: 100%;
        }
        .xb-entry-action {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 18px;
            border: 0;
            border-right: 1px solid rgba(255, 255, 255, 0.03);
            border-radius: 0;
            background: transparent;
            cursor: pointer;
            text-align: center;
            transition: flex 0.62s var(--xb-fluid), background 0.3s ease;
        }
        .xb-entry-action strong {
            color: rgba(241, 245, 249, 0.70);
            font-family: var(--xb-font-serif);
            font-size: clamp(42px, 6vw, 78px);
            font-weight: 400;
            letter-spacing: 0;
            transition: transform 0.36s ease, color 0.36s ease;
        }
        .xb-entry-action span {
            max-width: 360px;
            color: var(--xb-text-muted);
            font-family: var(--xb-font-mono);
            font-size: 12px;
            letter-spacing: 0.18em;
            line-height: 1.8;
        }
        .xb-entry-action:hover:not(:disabled) {
            flex: 1.25;
            transform: none;
            box-shadow: none;
        }
        .xb-entry-action:hover strong {
            color: var(--xb-text-main);
            transform: scale(1.08);
        }
        .xb-entry-action.is-studio:hover {
            background: radial-gradient(circle at center, rgba(166, 171, 200, 0.07), transparent 54%);
        }
        .xb-entry-action.is-studio:hover strong {
            color: var(--xb-text-main);
        }
        .xb-entry-action.is-reader:hover {
            background: radial-gradient(circle at center, rgba(233, 231, 227, 0.055), transparent 54%);
        }
        .xb-entry-action.is-reader:hover strong {
            color: var(--xb-text-main);
        }

        /* Studio */
        .xb-ebook-shell {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 0;
            display: flex;
            overflow: hidden;
            background: var(--xb-bg-deep);
            color: var(--xb-text-main);
        }
        .xb-mobile-studio-topbar,
        .xb-mobile-file-picker,
        .xb-mobile-file-drawer-scrim,
        .xb-mobile-drawer-handle {
            display: none;
        }
        .xb-sidebar {
            position: relative;
            z-index: 3;
            width: 250px;
            flex: 0 0 250px;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 24px 16px;
            border-right: 1px solid rgba(255, 255, 255, 0.04);
            background: var(--xb-bg-deep);
        }
        .xb-brand {
            min-width: 0;
            display: grid;
            gap: 12px;
        }
        .xb-title-row {
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .xb-title-row h1,
        .xb-title-row h2 {
            flex: 1 1 auto;
            min-width: 0;
            overflow: hidden;
            color: var(--xb-text-main);
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: var(--xb-font-serif);
            font-size: 22px;
            font-weight: 400;
        }
        .xb-icon-button {
            width: 34px;
            height: 34px;
            min-width: 34px;
            padding: 0;
            display: inline-grid;
            place-items: center;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.04);
            color: var(--xb-text-muted);
            font-size: 16px;
            line-height: 1;
        }
        .xb-panel,
        .xb-files-panel {
            min-height: 0;
            display: flex;
            flex-direction: column;
        }
        .xb-files {
            min-height: 0;
            overflow: auto;
            display: grid;
            align-content: start;
            gap: 20px;
            padding-right: 2px;
        }
        .xb-file-group {
            display: grid;
            gap: 8px;
        }
        .xb-file-group-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            color: var(--xb-text-main);
            font-family: var(--xb-font-ui);
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.02em;
        }
        .xb-file-group-title span {
            color: inherit;
            font-size: inherit;
            font-weight: inherit;
        }
        .xb-file-group-title em,
        .xb-file-sort-toggle {
            padding: 3px 8px;
            border: 0;
            border-radius: 999px;
            background: rgba(143, 183, 202, 0.12);
            color: var(--xb-cyan);
            font-family: var(--xb-font-ui);
            font-size: 13px;
            font-weight: 700;
            font-style: normal;
            letter-spacing: 0.02em;
        }
        .xb-file-sort-toggle {
            min-height: 24px;
            cursor: pointer;
        }
        .xb-file-sort-toggle:hover {
            background: rgba(143, 183, 202, 0.2);
            color: #d8f6ff;
        }
        .xb-file-group-desc {
            color: var(--xb-text-muted);
            font-size: 12px;
            line-height: 1.55;
        }
        .xb-section-subtitle {
            color: var(--xb-text-main);
            font-family: var(--xb-font-ui);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.04em;
        }
        .xb-file-tree {
            display: grid;
            gap: 6px;
        }
        .xb-file-directory {
            margin-top: 4px;
            padding: 2px 2px 0 8px;
            border-left: 1px solid rgba(143, 183, 202, 0.18);
            color: var(--xb-text-muted);
            font-family: var(--xb-font-ui);
            font-size: 11px;
            font-weight: 700;
            line-height: 1.4;
        }
        .xb-file-directory + .xb-file {
            margin-top: -1px;
        }
        .xb-file,
        .xb-imports button,
        .xb-actions button {
            width: 100%;
            min-width: 0;
            min-height: 36px;
            padding: 9px 10px;
            border-radius: 8px;
            background: transparent;
            color: var(--xb-text-muted);
            text-align: left;
            font-size: 13px;
        }
        .xb-file {
            display: grid;
            gap: 2px;
        }
        .xb-file.is-active {
            border-color: rgba(255, 255, 255, 0.07);
            background: rgba(255, 255, 255, 0.045);
            color: var(--xb-text-main);
            box-shadow: inset 2px 0 0 var(--xb-cyan);
        }
        .xb-file-main {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-section-empty {
            padding: 10px;
            border: 1px dashed rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            color: var(--xb-text-muted);
            font-size: 12px;
            line-height: 1.55;
        }
        .xb-imports {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 7px;
        }
        .xb-imports button {
            text-align: center;
            color: var(--xb-cyan);
            background: rgba(143, 183, 202, 0.10);
        }
        .xb-studio-workbench {
            position: relative;
            flex: 1;
            min-width: 0;
            min-height: 0;
            display: flex;
            overflow: hidden;
            background: var(--xb-bg-editor);
        }
        .xb-workspace-controller {
            display: flex;
            gap: 4px;
            padding: 4px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 999px;
            background: rgba(0, 0, 0, 0.58);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
            backdrop-filter: blur(14px);
        }
        .xb-layout-button {
            flex: 1;
            min-height: 28px;
            padding: 0 14px;
            border: 0;
            border-radius: 999px;
            background: transparent;
            color: var(--xb-text-muted);
            font-size: 12px;
        }
        .xb-layout-button.is-active {
            background: rgba(255, 255, 255, 0.12);
            color: var(--xb-text-main);
        }
        .xb-editor,
        .xb-agent {
            min-width: 280px;
            min-height: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: flex-grow 0.72s var(--xb-fluid), opacity 0.4s ease, filter 0.4s ease, box-shadow 0.4s ease;
        }
        .xb-editor {
            flex: 1 1 0;
            background: var(--xb-bg-editor);
            border-right: 1px solid rgba(255, 255, 255, 0.025);
        }
        .xb-agent {
            position: relative;
            flex: 1.08 1 0;
            background: var(--xb-bg-agent);
            border-left: 1px solid rgba(0, 0, 0, 0.48);
            box-shadow: -14px 0 36px rgba(0, 0, 0, 0.22);
            gap: 8px;
        }
        .xb-studio-shell.focus-editor .xb-editor { flex-grow: 2.35; }
        .xb-studio-shell.focus-editor .xb-agent { flex-grow: 0.72; opacity: 0.72; }
        .xb-studio-shell.focus-editor .xb-agent:hover { opacity: 1; }
        .xb-studio-shell.focus-agent .xb-editor { flex-grow: 0.55; filter: brightness(0.74); }
        .xb-studio-shell.focus-agent .xb-agent { flex-grow: 2.05; box-shadow: -22px 0 58px rgba(0, 0, 0, 0.48); }
        .xb-editor-head {
            min-height: 70px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding: 20px 34px;
            background: linear-gradient(180deg, rgba(9, 11, 15, 1), rgba(9, 11, 15, 0.70), transparent);
            color: var(--xb-text-muted);
            font-family: var(--xb-font-mono);
            font-size: 12px;
        }
        .xb-path {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-editor-actions {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 8px;
        }
        .xb-editor-actions button,
        .xb-agent-toolbar button,
        .xb-agent-global-actions button,
        #xb-agent-settings-close {
            min-height: 32px;
            padding: 0 12px;
            border-radius: 999px;
            color: var(--xb-text-muted);
            font-size: 12px;
        }
        #xb-theme-toggle {
            min-width: 34px;
            padding: 0 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 0;
        }
        #xb-save:not(:disabled) {
            color: var(--xb-cyan);
            border-color: rgba(143, 183, 202, 0.32);
            background: rgba(143, 183, 202, 0.12);
        }
        #xb-draw-chapter:not(:disabled) {
            color: var(--xb-text-main);
            border-color: rgba(233, 231, 227, 0.26);
            background: rgba(233, 231, 227, 0.10);
        }
        .xb-editor-body {
            min-height: 0;
            flex: 1;
            overflow: hidden;
            padding: 12px 58px 28px;
        }
        #xb-editor-text {
            width: 100%;
            height: 100%;
            min-height: 0;
            resize: none;
            outline: none;
            border: 0;
            background: transparent;
            color: var(--xb-text-body);
            font: 17px/1.85 var(--xb-font-serif);
        }
        #xb-editor-text:disabled { opacity: 0.62; }
        .xb-editor-foot {
            min-height: 36px;
            padding: 8px 34px 14px;
            color: var(--xb-text-dim);
            font-family: var(--xb-font-mono);
            font-size: 11px;
        }
        .xb-agent-aurora {
            position: absolute;
            top: -170px;
            left: -120px;
            width: 520px;
            height: 520px;
            pointer-events: none;
            background: radial-gradient(circle, rgba(166, 171, 200, 0.18), rgba(143, 183, 202, 0.08), transparent 62%);
            filter: blur(86px);
            opacity: 0.052;
            animation: xb-agent-flow 10s infinite alternate ease-in-out;
        }
        @keyframes xb-agent-flow {
            100% { transform: scale(1.18) translate(52px, -18px); opacity: 0.09; }
        }
        .xb-agent-head {
            position: relative;
            z-index: 2;
            display: grid;
            gap: 10px;
            padding: 22px 30px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.035);
        }
        .xb-agent-head-main {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 14px;
            min-width: 0;
        }
        .xb-agent-toolbar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
        }
        .xb-agent-global-actions {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
        }
        .xb-agent-context-meter {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 86px;
            min-height: 32px;
            padding: 0 12px;
            border: 1px solid rgba(143, 183, 202, 0.26);
            border-radius: 999px;
            background: rgba(143, 183, 202, 0.12);
            color: var(--xb-cyan);
            font-family: var(--xb-font-mono);
            font-size: 11px;
        }
        .xb-agent-global-actions #xb-theme-toggle {
            min-width: 48px;
            color: var(--xb-text-main);
            border-color: rgba(143, 183, 202, 0.24);
            background: rgba(143, 183, 202, 0.12);
        }
        .xb-agent-global-actions #xb-agent-close {
            margin-left: 0;
        }
        .xb-agent-chat-wrap {
            position: relative;
            z-index: 2;
            min-height: 0;
            flex: 1;
            overflow: hidden;
        }
        .xb-agent-main {
            height: 100%;
            min-height: 0;
            overflow: auto;
            overflow-anchor: none;
            display: flex;
            flex-direction: column;
            gap: 18px;
            padding: 26px 30px;
        }
        .xb-agent-log {
            min-height: 0;
            display: flex;
            flex-direction: column;
            gap: 18px;
        }
        .xb-agent-empty,
        .xb-agent-memory {
            color: var(--xb-text-muted);
            font-size: 13px;
            line-height: 1.7;
        }
        .xb-agent-memory {
            padding: 0 0 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.045);
        }
        .xb-agent-history-gate {
            align-self: center;
            color: var(--xb-text-muted);
            font-size: 12px;
            line-height: 1;
            opacity: 0.75;
            padding: 2px 0;
        }
        .xb-actions-panel {
            border: 1px solid rgba(255, 255, 255, 0.055);
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.22);
            color: var(--xb-text-muted);
            font-size: 12px;
        }
        .xb-actions-panel summary {
            padding: 10px 12px;
            cursor: pointer;
            color: var(--xb-cyan);
            font-weight: 700;
            list-style: none;
        }
        .xb-actions-panel summary::-webkit-details-marker { display: none; }
        .xb-actions-panel[open] { padding-bottom: 12px; }
        .xb-actions {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 8px;
            padding: 0 12px;
        }
        .xb-actions button {
            text-align: center;
            color: var(--xb-text-main);
            background: rgba(255, 255, 255, 0.05);
        }
        .xb-msg {
            position: relative;
            max-width: 92%;
            padding: 14px 16px;
            border: 1px solid rgba(255, 255, 255, 0.055);
            border-radius: 14px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.045), transparent);
            color: var(--xb-text-main);
            line-height: 1.65;
        }
        .xb-msg.is-editing {
            width: min(100%, calc(100% - 34px));
            max-width: none;
        }
        .xb-msg-user {
            align-self: flex-end;
            border-bottom-right-radius: 4px;
            background: rgba(255, 255, 255, 0.075);
        }
        .xb-msg-assistant {
            align-self: flex-start;
            border-top-left-radius: 4px;
            border-left: 2px solid var(--xb-indigo);
        }
        .xb-msg.is-error {
            border-color: rgba(244, 63, 94, 0.34);
            color: #fecdd3;
        }
        .xb-msg.is-streaming {
            border-color: rgba(143, 183, 202, 0.34);
        }
        .xb-msg-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 8px;
        }
        .xb-msg-role {
            color: var(--xb-cyan);
            font-family: var(--xb-font-mono);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.10em;
        }
        .xb-msg-user .xb-msg-role { color: var(--xb-gold); }
        .xb-msg-actions {
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        .xb-msg-action {
            width: 24px;
            height: 24px;
            min-width: 24px;
            padding: 0;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.05);
            color: var(--xb-text-muted);
            font-size: 12px;
        }
        .xb-agent-main.is-busy .xb-msg-action:not([data-message-action="cancel-edit"]) {
            opacity: 0.5;
            pointer-events: none;
        }
        .xb-msg-content,
        .xb-assistant-markdown {
            min-width: 0;
            max-width: 100%;
            overflow-wrap: anywhere;
        }
        .xb-assistant-markdown { line-height: 1.72; white-space: normal; }
        .xb-assistant-markdown,
        .xb-assistant-markdown * {
            text-shadow: none !important;
        }
        .xb-assistant-markdown > *:first-child { margin-top: 0; }
        .xb-assistant-markdown > *:last-child { margin-bottom: 0; }
        .xb-assistant-markdown p,
        .xb-assistant-markdown ul,
        .xb-assistant-markdown ol,
        .xb-assistant-markdown pre,
        .xb-assistant-markdown blockquote,
        .xb-assistant-markdown table,
        .xb-assistant-markdown h1,
        .xb-assistant-markdown h2,
        .xb-assistant-markdown h3,
        .xb-assistant-markdown h4 {
            margin: 0 0 0.85em;
        }
        .xb-assistant-markdown p {
            margin: 0;
        }
        .xb-assistant-markdown p + p {
            margin-top: 0.25em;
        }
        .xb-assistant-markdown strong,
        .xb-assistant-markdown b,
        .xb-assistant-markdown h1,
        .xb-assistant-markdown h2,
        .xb-assistant-markdown h3,
        .xb-assistant-markdown h4 {
            color: var(--xb-text-main);
            font-weight: 700;
            text-shadow: none !important;
            filter: none !important;
            -webkit-text-stroke: 0 transparent;
        }
        .xb-assistant-markdown code {
            padding: 0.12em 0.36em;
            border-radius: 7px;
            background: rgba(148, 163, 184, 0.12);
            color: var(--xb-text-main);
            font-family: var(--xb-font-mono);
            font-size: 0.94em;
        }
        .xb-assistant-markdown pre {
            overflow-x: hidden;
            padding: 12px 14px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.30);
            white-space: pre-wrap;
            word-break: break-word;
        }
        .xb-assistant-codeblock {
            position: relative;
            min-width: 0;
            max-width: 100%;
        }
        .xb-assistant-codeblock .xb-assistant-code-copy {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            border: 0;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.10);
            color: var(--xb-text-main);
            cursor: pointer;
            font-size: 12px;
            opacity: 0.82;
        }
        .xb-assistant-codeblock pre { padding-top: 34px; }
        .xb-markdown-html-block {
            display: grid;
            gap: 10px;
            margin: 0 0 0.8em;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.20);
        }
        .xb-markdown-html-head,
        .xb-markdown-html-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        .xb-markdown-html-actions { flex-wrap: wrap; justify-content: flex-end; }
        .xb-markdown-html-title {
            display: grid;
            gap: 2px;
            color: var(--xb-cyan);
            font-size: 12px;
            font-weight: 700;
        }
        .xb-markdown-html-title span {
            color: var(--xb-text-muted);
            font-size: 11px;
            font-weight: 500;
        }
        .xb-markdown-html-actions button {
            padding: 5px 9px;
            border-radius: 999px;
            font-size: 12px;
        }
        .xb-markdown-html-actions button.is-active { background: rgba(143, 183, 202, 0.16); }
        .xb-markdown-html-code {
            max-height: 320px;
            overflow: auto;
            margin: 0;
            padding: 12px 14px;
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.30);
            white-space: pre-wrap;
            word-break: break-all;
            font: 12px/1.55 var(--xb-font-mono);
        }
        .xb-markdown-html-preview {
            width: 100%;
            height: 320px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            border-radius: 10px;
            background: #fff;
        }
        .xb-assistant-markdown pre code {
            padding: 0;
            background: transparent;
        }
        .xb-assistant-markdown blockquote {
            padding-left: 14px;
            border-left: 2px solid rgba(233, 231, 227, 0.22);
            color: var(--xb-text-muted);
        }
        .xb-assistant-markdown table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95em;
        }
        .xb-assistant-markdown th,
        .xb-assistant-markdown td {
            border: 1px solid rgba(255, 255, 255, 0.10);
            padding: 6px 10px;
            text-align: left;
            vertical-align: top;
        }
        .xb-assistant-markdown th {
            background: rgba(255, 255, 255, 0.055);
            font-weight: 600;
        }
        .xb-assistant-markdown a { color: var(--xb-cyan); }
        .xb-assistant-markdown ul,
        .xb-assistant-markdown ol { padding-left: 1.4em; }
        .xb-msg-editor-wrap {
            width: 100%;
            min-width: 0;
        }
        .xb-msg-editor {
            display: block;
            width: 100%;
            min-height: 112px;
            resize: vertical;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 11px 12px;
            outline: none;
            background: rgba(0, 0, 0, 0.28);
            color: var(--xb-text-main);
            font: 13px/1.65 var(--xb-font-ui);
        }
        .xb-thought-details,
        .xb-tool-trace {
            color: var(--xb-text-muted);
            font-size: 12px;
        }
        .xb-thought-details { margin: 4px 0 8px; }
        .xb-thought-details summary,
        .xb-tool-trace summary {
            cursor: pointer;
            list-style: none;
            color: var(--xb-cyan);
            font-weight: 700;
        }
        .xb-thought-details summary::-webkit-details-marker,
        .xb-tool-trace summary::-webkit-details-marker { display: none; }
        .xb-thought-details[open],
        .xb-tool-trace[open] {
            display: grid;
            gap: 7px;
        }
        .xb-thought-block,
        .xb-tool-preface,
        .xb-tool {
            border: 1px solid rgba(255, 255, 255, 0.055);
            border-left: 2px solid var(--xb-cyan);
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.25);
            padding: 9px 11px;
        }
        .xb-thought-label,
        .xb-tool-round-title {
            color: var(--xb-cyan);
            font-family: var(--xb-font-mono);
            font-size: 11px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        .xb-thought-block pre {
            margin: 0;
            white-space: pre-wrap;
            color: var(--xb-text-muted);
            font: 12px/1.55 var(--xb-font-ui);
        }
        .xb-tool-trace {
            border: 0;
            border-radius: 0;
            padding: 0;
            background: transparent;
        }
        .xb-tool-trace summary {
            display: grid;
            grid-template-columns: auto auto 1fr;
            align-items: center;
            gap: 8px;
            padding: 2px 0;
        }
        .xb-tool-trace summary::after {
            content: "";
            height: 1px;
            background: rgba(143, 183, 202, 0.28);
        }
        .xb-tool-fold-indicator::before { content: ">"; }
        .xb-tool-trace[open] .xb-tool-fold-indicator::before { content: "v"; }
        .xb-tool-trace-body {
            display: grid;
            gap: 8px;
        }
        .xb-tool-run-label {
            color: var(--xb-cyan);
            font-family: var(--xb-font-mono);
            font-size: 11px;
            margin-bottom: 7px;
        }
        .xb-tool-round {
            display: grid;
            gap: 8px;
        }
        .xb-tool-round + .xb-tool-round {
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.055);
        }
        .xb-tool {
            border-left-color: var(--xb-text-dim);
            font-family: var(--xb-font-mono);
            font-size: 12px;
        }
        .xb-tool.is-running {
            border-left-color: var(--xb-cyan);
        }
        .xb-tool > .xb-tool-plain-title,
        .xb-tool > .xb-tool-head {
            color: var(--xb-cyan);
            margin-bottom: 5px;
        }
        .xb-tool-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        .xb-tool-head span {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-tool-head em {
            flex: 0 0 auto;
            color: var(--xb-text-muted);
            font-size: 11px;
            font-style: normal;
            font-weight: 600;
        }
        .xb-tool.is-running .xb-tool-head em {
            color: var(--xb-cyan);
        }
        .xb-tool-result {
            display: grid;
            gap: 5px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.055);
        }
        .xb-tool-result .xb-tool-head {
            margin-bottom: 0;
            color: var(--xb-cyan);
        }
        .xb-tool-payload {
            display: grid;
            gap: 6px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.055);
            color: var(--xb-text-muted);
        }
        .xb-tool.has-payload .xb-tool-payload {
            margin-top: 0;
            padding-top: 0;
            border-top: 0;
        }
        .xb-tool-payload-row {
            display: grid;
            gap: 3px;
        }
        .xb-tool-payload-row span {
            color: var(--xb-text-dim);
            font-size: 11px;
            font-weight: 700;
        }
        .xb-tool-payload-row p {
            margin: 0;
            color: var(--xb-text-muted);
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            line-height: 1.55;
        }
        .xb-tool-progress {
            display: grid;
            gap: 6px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.055);
            color: var(--xb-text-muted);
        }
        .xb-tool-progress-row {
            display: grid;
            grid-template-columns: 46px minmax(0, 1fr);
            gap: 8px;
            align-items: start;
            font-size: 11px;
            line-height: 1.45;
        }
        .xb-tool-progress-row span {
            color: var(--xb-cyan);
            font-family: var(--xb-font-mono);
            font-size: 10px;
        }
        .xb-tool-progress-row p {
            margin: 0;
            min-width: 0;
            overflow-wrap: anywhere;
        }
        .xb-tool small,
        .xb-meta {
            color: var(--xb-text-muted);
            font-size: 12px;
            line-height: 1.55;
        }
        .xb-tool-plan {
            display: grid;
            gap: 8px;
        }
        .xb-tool-plan-list {
            display: grid;
            gap: 7px;
        }
        .xb-tool-plan-item {
            display: grid;
            grid-template-columns: 18px minmax(0, 1fr);
            gap: 8px;
            align-items: start;
        }
        .xb-tool-plan-box {
            width: 14px;
            height: 14px;
            margin-top: 2px;
            border: 1px solid rgba(143, 183, 202, 0.55);
            border-radius: 4px;
            color: var(--xb-cyan);
            font: 700 11px/13px var(--xb-font-ui);
            text-align: center;
        }
        .xb-tool-plan-item p {
            min-width: 0;
            margin: 0;
            display: grid;
            gap: 2px;
        }
        .xb-tool-plan-item strong {
            color: var(--xb-text-main);
            font: 600 12px/1.45 var(--xb-font-ui);
            overflow-wrap: anywhere;
        }
        .xb-tool-plan-item em {
            color: var(--xb-text-dim);
            font-style: normal;
            font-weight: 500;
        }
        .xb-tool-plan-item small {
            white-space: pre-wrap;
        }
        .xb-tool-plan-blockers {
            display: grid;
            gap: 6px;
            padding-top: 7px;
            border-top: 1px solid rgba(255, 255, 255, 0.055);
        }
        .xb-tool-plan-blockers > span {
            color: var(--xb-text-dim);
            font-size: 11px;
            font-weight: 700;
        }
        .xb-tool.is-error { border-left-color: var(--xb-danger); }
        .xb-agent-scroll-helpers {
            position: absolute;
            top: 12%;
            right: 10px;
            bottom: 12%;
            z-index: 5;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.25s ease;
        }
        .xb-agent-scroll-helpers.active { opacity: 1; }
        .xb-agent-scroll-btn {
            width: 30px;
            height: 30px;
            padding: 0;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.10);
            color: var(--xb-text-main);
            pointer-events: none;
            opacity: 0;
            transform: scale(0.82) translateX(8px);
            font-size: 11px;
        }
        .xb-agent-scroll-btn.visible {
            opacity: 1;
            pointer-events: auto;
            transform: scale(1) translateX(0);
        }
        .xb-agent-form {
            position: relative;
            z-index: 2;
            height: 144px;
            min-height: 144px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: stretch;
            overflow: hidden;
            padding: 18px 30px 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.025);
            background: linear-gradient(0deg, var(--xb-bg-agent) 74%, transparent);
        }
        .xb-agent-compose-row {
            display: flex;
            align-items: center;
            width: 100%;
            gap: 12px;
            padding: 8px 14px;
            border: 1px solid rgba(255, 255, 255, 0.09);
            border-radius: 14px;
            background: rgba(0, 0, 0, 0.42);
            transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .xb-agent-compose-row:focus-within {
            border-color: rgba(143, 183, 202, 0.46);
            background: rgba(0, 0, 0, 0.58);
        }
        .xb-agent-compose-main {
            flex: 1;
            min-width: 0;
            display: grid;
            gap: 4px;
        }
        #xb-agent-input {
            width: 100%;
            height: 46px;
            min-height: 46px;
            max-height: 68px;
            resize: none;
            overflow-y: hidden;
            border: 0;
            outline: none;
            background: transparent;
            color: var(--xb-text-main);
            font: 14px/1.5 var(--xb-font-ui);
        }
        .xb-compose-hint {
            color: var(--xb-text-dim);
            font-size: 11px;
        }
        .xb-agent-compose-actions {
            width: 40px;
            display: grid;
            place-items: center;
        }
        .xb-agent-form button[type="submit"] {
            width: 38px;
            height: 38px;
            padding: 0;
            border: 0;
            border-radius: 12px;
            background: transparent;
            color: var(--xb-cyan);
            font-size: 20px;
        }
        .xb-agent-form button[type="submit"].is-busy {
            color: var(--xb-danger);
        }

        .xb-distillation-layer {
            position: absolute;
            inset: 0;
            z-index: 70;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 28px;
            color: var(--xb-text-main);
            animation: xb-distillation-enter 0.56s var(--xb-fluid) both;
        }
        .xb-protocol-notice {
            position: absolute;
            left: 50%;
            top: 48%;
            z-index: 68;
            width: min(420px, calc(100% - 42px));
            transform: translate(-50%, -50%);
            display: flex;
            justify-content: center;
            pointer-events: none;
            animation: xb-protocol-notice-float 1.28s var(--xb-fluid) both;
        }
        .xb-protocol-notice span {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            max-width: 100%;
            padding: 10px 16px;
            border: 1px solid rgba(184, 178, 166, 0.16);
            border-radius: 999px;
            background: rgba(28, 31, 40, 0.78);
            box-shadow: 0 18px 38px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(18px) saturate(116%);
            color: var(--xb-text-main);
            font-size: 12px;
            line-height: 1.45;
            text-align: center;
        }
        @keyframes xb-protocol-notice-float {
            0% { opacity: 0; transform: translate(-50%, calc(-50% + 10px)) scale(0.98); }
            18% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            72% { opacity: 1; transform: translate(-50%, calc(-50% - 4px)) scale(1); }
            100% { opacity: 0; transform: translate(-50%, calc(-50% - 12px)) scale(0.98); }
        }
        .xb-distillation-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(10, 12, 18, 0.52);
            backdrop-filter: blur(22px) saturate(112%);
        }
        .xb-distillation-aura {
            position: absolute;
            width: min(260px, 52vw);
            aspect-ratio: 1;
            border-radius: 999px;
            background: radial-gradient(circle, rgba(184, 178, 166, 0.14), transparent 70%);
            filter: blur(42px);
            animation: xb-distillation-breathe 3.8s infinite alternate ease-in-out;
        }
        .xb-distillation-plaque {
            position: relative;
            z-index: 1;
            width: min(520px, 88vw);
            padding: 38px 34px;
            border-top: 1px solid rgba(184, 178, 166, 0.13);
            border-bottom: 1px solid rgba(184, 178, 166, 0.045);
            border-radius: 22px;
            background: rgba(32, 35, 45, 0.58);
            box-shadow: 0 20px 42px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(184, 178, 166, 0.06);
            text-align: center;
            transform: translateY(16px);
            animation: xb-distillation-plaque-enter 0.7s var(--xb-fluid) both;
        }
        .xb-distillation-title {
            margin-bottom: 8px;
            color: var(--xb-text-main);
            font-family: var(--xb-font-serif);
            font-size: 20px;
            font-weight: 400;
            letter-spacing: 0.18em;
        }
        .xb-distillation-status {
            margin-bottom: 28px;
            color: var(--xb-text-muted);
            font-size: 13px;
            letter-spacing: 0.06em;
        }
        .xb-distillation-metrics {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 28px;
            font-family: var(--xb-font-mono);
        }
        .xb-distillation-metric {
            display: grid;
            gap: 8px;
            min-width: 104px;
        }
        .xb-distillation-metric strong {
            color: var(--xb-text-body);
            font-size: 26px;
            font-weight: 300;
            line-height: 1;
            font-variant-numeric: tabular-nums;
        }
        .xb-distillation-metric span {
            color: var(--xb-text-dim);
            font-size: 10px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
        }
        .xb-distillation-divider {
            position: relative;
            width: 42px;
            height: 1px;
            background: rgba(184, 178, 166, 0.13);
            overflow: hidden;
        }
        .xb-distillation-divider::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 12px;
            height: 1px;
            background: rgba(184, 178, 166, 0.55);
            box-shadow: 0 0 10px rgba(184, 178, 166, 0.30);
            animation: xb-distillation-flow 1.45s infinite ease-out;
        }
        .xb-distillation-ripple {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            border: 1px solid var(--xb-gold);
            border-radius: 999px;
            opacity: 0;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }
        .xb-distillation-layer.resolved .xb-distillation-aura {
            background: radial-gradient(circle, rgba(206, 179, 122, 0.18), transparent 70%);
            animation: xb-distillation-resolve-aura 1.1s ease-out both;
        }
        .xb-distillation-layer.resolved .xb-distillation-plaque {
            border-top-color: rgba(206, 179, 122, 0.28);
            box-shadow: 0 20px 42px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(206, 179, 122, 0.14);
        }
        .xb-distillation-layer.resolved .xb-distillation-title,
        .xb-distillation-layer.resolved .xb-distillation-yield {
            color: var(--xb-gold);
            text-shadow: 0 0 18px rgba(206, 179, 122, 0.22);
        }
        .xb-distillation-layer.resolved .xb-distillation-divider::after {
            opacity: 0;
            animation: none;
        }
        .xb-distillation-layer.resolved .xb-distillation-ripple {
            animation: xb-distillation-ripple 1.15s var(--xb-fluid) both;
        }
        @keyframes xb-distillation-enter {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes xb-distillation-plaque-enter {
            from { opacity: 0; transform: translateY(18px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes xb-distillation-breathe {
            0% { opacity: 0.55; transform: scale(0.9); }
            100% { opacity: 0.95; transform: scale(1.18); }
        }
        @keyframes xb-distillation-flow {
            0% { left: -12px; opacity: 0; }
            22% { opacity: 1; }
            100% { left: 42px; opacity: 0; }
        }
        @keyframes xb-distillation-resolve-aura {
            from { opacity: 0.9; transform: scale(1); }
            to { opacity: 0; transform: scale(2); }
        }
        @keyframes xb-distillation-ripple {
            0% { width: 0; height: 0; opacity: 0.72; border-width: 2px; }
            100% { width: min(320px, 72vw); height: min(320px, 72vw); opacity: 0; border-width: 1px; }
        }

        /* Settings and delete dialogs */
        .xb-ebook-settings-overlay,
        .xb-ebook-delete-overlay {
            position: absolute;
            inset: 0;
            z-index: 80;
            display: grid;
            place-items: center;
            padding: 28px;
            background: rgba(0, 0, 0, 0.62);
            backdrop-filter: blur(16px);
        }
        .xb-ebook-settings-dialog,
        .xb-ebook-delete-dialog {
            width: min(820px, 100%);
            max-height: min(88vh, 920px);
            display: grid;
            grid-template-rows: auto minmax(0, 1fr);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.10);
            border-radius: 18px;
            background: rgba(14, 17, 23, 0.96);
            box-shadow: var(--xb-shadow);
        }
        .xb-ebook-delete-dialog {
            width: min(480px, 100%);
            grid-template-rows: auto auto minmax(0, 1fr);
        }
        .xb-ebook-settings-head,
        .xb-ebook-delete-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 18px;
            padding: 22px 24px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .xb-ebook-settings-head h2,
        .xb-ebook-delete-head h2 {
            color: var(--xb-text-main);
            font-size: 22px;
            font-weight: 600;
        }
        .xb-ebook-settings-head p,
        .xb-ebook-delete-note {
            color: var(--xb-text-muted);
            font-size: 13px;
            line-height: 1.65;
        }
        .xb-ebook-settings-head p { margin-top: 6px; }
        .xb-ebook-delete-note {
            margin: 0;
            padding: 13px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .xb-ebook-settings-body {
            min-height: 0;
            overflow: auto;
            padding: 22px 24px 26px;
        }
        .xb-ebook-delete-list {
            min-height: 0;
            overflow: auto;
            display: grid;
            align-content: start;
            gap: 8px;
            padding: 14px;
        }
        .xb-delete-book-item {
            display: grid;
            gap: 4px;
            padding: 13px 14px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.045);
            text-align: left;
        }
        .xb-delete-book-item strong { color: var(--xb-text-main); font-size: 14px; }
        .xb-delete-book-item small { color: var(--xb-text-muted); font-size: 11px; }
        .xb-ebook-export-dialog {
            width: min(540px, 100%);
            grid-template-rows: auto minmax(0, 1fr);
        }
        .xb-ebook-export-list {
            gap: 10px;
            padding: 16px;
        }
        .xb-ebook-export-note {
            margin-top: 6px;
            color: var(--xb-text-muted);
            font-size: 13px;
            line-height: 1.65;
        }
        .xb-ebook-export-book {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
            gap: 14px;
            min-height: 62px;
            padding: 13px 14px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.045);
            text-align: left;
        }
        .xb-ebook-export-book span {
            min-width: 0;
            display: grid;
            gap: 5px;
        }
        .xb-ebook-export-book strong {
            overflow: hidden;
            color: var(--xb-text-main);
            font-size: 14px;
            font-weight: 700;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-ebook-export-book small {
            color: var(--xb-text-muted);
            font-family: var(--xb-font-mono);
            font-size: 11px;
        }
        .xb-ebook-export-book em {
            padding: 5px 10px;
            border: 1px solid var(--xb-line);
            border-radius: 999px;
            color: var(--xb-text-muted);
            font-size: 12px;
            font-style: normal;
        }
        .xb-ebook-export-book:hover:not(:disabled) em {
            border-color: var(--xb-line-strong);
            color: var(--xb-text-main);
        }
        .xb-ebook-transfer-menu-dialog {
            width: min(360px, 100%);
            grid-template-rows: auto auto;
        }
        .xb-book-transfer-menu-list {
            display: grid;
            gap: 10px;
            padding: 16px;
        }
        .xb-book-transfer-menu-choice {
            min-height: 58px;
            display: grid;
            grid-template-columns: 34px minmax(0, 1fr);
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.045);
            color: var(--xb-text-main);
            text-align: left;
            transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
        }
        .xb-book-transfer-menu-choice span {
            width: 34px;
            height: 34px;
            display: grid;
            place-items: center;
            border: 1px solid var(--xb-line);
            border-radius: 50%;
            color: var(--xb-text-muted);
        }
        .xb-book-transfer-menu-choice strong {
            min-width: 0;
            overflow: hidden;
            color: var(--xb-text-main);
            font-size: 14px;
            font-weight: 700;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-book-transfer-menu-choice:hover:not(:disabled),
        .xb-book-transfer-menu-choice:focus-visible:not(:disabled) {
            border-color: var(--xb-line-strong);
            background: rgba(255, 255, 255, 0.075);
            transform: translateY(-1px);
        }
        .xb-book-transfer-menu-choice:hover:not(:disabled) span,
        .xb-book-transfer-menu-choice:focus-visible:not(:disabled) span {
            border-color: var(--xb-line-strong);
            color: var(--xb-text-main);
        }
        .xb-ebook-transfer-overlay {
            position: absolute;
            inset: 0;
            z-index: 120;
            display: grid;
            place-items: center;
            padding: 28px;
            background: rgba(0, 0, 0, 0.44);
            backdrop-filter: blur(12px);
        }
        .xb-ebook-transfer-panel {
            width: min(360px, 100%);
            display: grid;
            justify-items: center;
            gap: 14px;
            padding: 24px 24px 22px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            border-radius: 18px;
            background: rgba(14, 17, 23, 0.94);
            box-shadow: var(--xb-shadow);
            text-align: center;
        }
        .xb-ebook-transfer-orbit {
            position: relative;
            width: 42px;
            height: 42px;
            border: 1px solid var(--xb-line);
            border-radius: 999px;
        }
        .xb-ebook-transfer-orbit::before {
            content: '';
            position: absolute;
            inset: 8px;
            border-radius: inherit;
            border: 1px solid rgba(184, 178, 166, 0.18);
        }
        .xb-ebook-transfer-orbit span {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 7px;
            height: 7px;
            margin: -3.5px 0 0 -3.5px;
            border-radius: 999px;
            background: var(--xb-text-main);
            animation: xb-transfer-orbit 1.35s linear infinite;
        }
        .xb-ebook-transfer-orbit span + span {
            width: 5px;
            height: 5px;
            margin: -2.5px 0 0 -2.5px;
            opacity: 0.58;
            animation-duration: 1.75s;
            animation-direction: reverse;
        }
        .xb-ebook-transfer-copy {
            display: grid;
            gap: 5px;
        }
        .xb-ebook-transfer-copy strong {
            color: var(--xb-text-main);
            font-size: 16px;
            font-weight: 700;
        }
        .xb-ebook-transfer-copy small {
            max-width: 280px;
            overflow: hidden;
            color: var(--xb-text-muted);
            font-size: 12px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-ebook-transfer-copy p {
            color: var(--xb-text-body);
            font-size: 13px;
            line-height: 1.6;
        }
        .xb-ebook-transfer-bar {
            position: relative;
            width: 100%;
            height: 3px;
            overflow: hidden;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.075);
        }
        .xb-ebook-transfer-bar span {
            position: absolute;
            inset: 0 auto 0 0;
            width: 42%;
            border-radius: inherit;
            background: linear-gradient(90deg, transparent, var(--xb-text-main), transparent);
            animation: xb-transfer-bar 1.15s ease-in-out infinite;
        }
        @keyframes xb-transfer-orbit {
            from { transform: rotate(0deg) translateX(17px) rotate(0deg); }
            to { transform: rotate(360deg) translateX(17px) rotate(-360deg); }
        }
        @keyframes xb-transfer-bar {
            from { transform: translateX(-120%); }
            to { transform: translateX(250%); }
        }
        .xb-ebook-settings-body .xb-assistant-config {
            display: grid;
            gap: 12px;
        }
        .xb-ebook-settings-body .xb-assistant-config-fields {
            min-inline-size: 0;
            display: grid;
            gap: 12px;
            margin: 0;
            padding: 0;
            border: 0;
        }
        .xb-ebook-settings-body .xb-assistant-config-fields:disabled { opacity: 0.56; }
        .xb-ebook-settings-body .xb-assistant-config-tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            padding: 4px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.055);
        }
        .xb-ebook-settings-body .xb-assistant-config-tab {
            min-height: 34px;
            border: 0;
            border-radius: 10px;
            background: transparent;
            color: var(--xb-text-muted);
            font-weight: 700;
        }
        .xb-ebook-settings-body .xb-assistant-config-tab.is-active {
            background: rgba(255, 255, 255, 0.13);
            color: var(--xb-text-main);
        }
        .xb-ebook-settings-body .xb-assistant-config-page {
            display: grid;
            gap: 12px;
        }
        .xb-ebook-settings-body .xb-assistant-config-page[hidden] { display: none; }
        .xb-ebook-settings-body .xb-assistant-config-note,
        .xb-ebook-settings-body .xb-assistant-runtime,
        .xb-ebook-settings-body .xb-assistant-inline-status {
            color: var(--xb-text-muted);
            font-size: 12px;
            line-height: 1.55;
        }
        .xb-ebook-settings-body .xb-assistant-inline-status.is-success { color: #86efac; }
        .xb-ebook-settings-body .xb-assistant-inline-status.is-error { color: #fda4af; }
        .xb-ebook-settings-body .xb-assistant-inline-status.is-loading { color: var(--xb-cyan); }
        .xb-ebook-settings-body .xb-assistant-config label {
            display: grid;
            gap: 6px;
            color: var(--xb-text-main);
            font-size: 13px;
        }
        .xb-ebook-settings-body .xb-assistant-preset-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
            gap: 8px;
        }
        .xb-ebook-settings-body .xb-assistant-preset-field,
        .xb-ebook-settings-body .xb-assistant-config select.xb-assistant-preset-field {
            box-sizing: border-box;
            grid-column: 1;
            min-width: 0;
            width: 100%;
            min-height: 40px;
            height: 40px;
            padding: 0 12px;
            font-size: 14px;
            line-height: 40px;
        }
        .xb-ebook-settings-body .xb-assistant-preset-tools {
            display: grid;
            grid-column: 2;
            grid-template-columns: repeat(4, 40px);
            align-self: stretch;
            gap: 6px;
        }
        .xb-ebook-settings-body .xb-assistant-preset-tools.is-single {
            grid-template-columns: 40px;
        }
        .xb-ebook-settings-body .xb-assistant-icon-button {
            display: grid;
            place-items: center;
            width: 40px;
            min-width: 40px;
            height: 40px;
            min-height: 40px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.26);
            color: var(--xb-text-muted);
            padding: 0;
            line-height: 1;
        }
        .xb-ebook-settings-body .xb-assistant-icon-button svg {
            width: 16px;
            height: 16px;
            stroke: currentColor;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
            fill: none;
            vector-effect: non-scaling-stroke;
        }
        .xb-ebook-settings-body .xb-assistant-icon-button:hover:not(:disabled),
        .xb-ebook-settings-body .xb-assistant-icon-button:focus-visible {
            outline: none;
            border-color: rgba(125, 211, 252, 0.32);
            background: rgba(125, 211, 252, 0.10);
            color: var(--xb-text-main);
        }
        .xb-ebook-settings-body .xb-assistant-icon-button.xb-assistant-save-button.is-success,
        .xb-ebook-settings-body .xb-assistant-icon-button.xb-assistant-save-button.is-error {
            background: rgba(0, 0, 0, 0.26);
            color: var(--xb-text-muted);
            border-color: rgba(255, 255, 255, 0.10);
        }
        .xb-ebook-settings-body .xb-assistant-icon-button.xb-assistant-save-button.is-success {
            background: rgba(34, 197, 94, 0.12);
            color: #bbf7d0;
            border-color: rgba(34, 197, 94, 0.28);
        }
        .xb-ebook-settings-body .xb-assistant-icon-button.xb-assistant-save-button.is-error {
            background: rgba(244, 63, 94, 0.10);
            color: #fecdd3;
            border-color: rgba(244, 63, 94, 0.28);
        }
        .xb-ebook-settings-body .xb-assistant-config input,
        .xb-ebook-settings-body .xb-assistant-config select {
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.10);
            border-radius: 12px;
            padding: 11px 12px;
            outline: none;
            background: rgba(0, 0, 0, 0.26);
            color: var(--xb-text-main);
        }
        .xb-ebook-settings-body .xb-assistant-config select {
            color-scheme: dark;
            background: rgba(15, 18, 24, 0.94);
            color: rgba(244, 247, 255, 0.96);
        }
        .xb-ebook-settings-body .xb-assistant-config select option,
        .xb-ebook-settings-body .xb-assistant-config select optgroup {
            background: #151922;
            color: rgba(244, 247, 255, 0.96);
        }
        .xb-ebook-settings-body .xb-assistant-inline-input,
        .xb-ebook-settings-body .xb-assistant-checkbox-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 8px;
            align-items: center;
        }
        .xb-ebook-settings-body .xb-assistant-grow { min-width: 0; }
        .xb-ebook-settings-body .xb-assistant-model-row { align-items: end; }
        .xb-ebook-settings-body .xb-assistant-temperature-row {
            display: grid;
            grid-template-columns: 96px auto;
            gap: 10px;
            align-items: end;
        }
        .xb-ebook-settings-body .xb-assistant-temperature-row .xb-assistant-checkbox-row {
            display: flex;
            align-items: center;
            gap: 8px;
            min-height: 40px;
        }
        .xb-ebook-settings-body .xb-assistant-temperature-row input[type="number"] {
            width: 96px;
        }
        .xb-ebook-settings-body .xb-assistant-checkbox-control {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--xb-text-main);
        }
        .xb-ebook-settings-body .xb-assistant-checkbox-control input {
            width: 16px;
            height: 16px;
            accent-color: var(--xb-cyan);
        }
        .xb-assistant-save-button.is-success {
            background: rgba(34, 197, 94, 0.12);
            color: #bbf7d0;
            border-color: rgba(34, 197, 94, 0.28);
        }
        .xb-assistant-save-button.is-error {
            background: rgba(244, 63, 94, 0.10);
            color: #fecdd3;
            border-color: rgba(244, 63, 94, 0.28);
        }
        .xb-assistant-save-button.is-saving svg {
            animation: xb-spin 0.8s linear infinite;
        }
        @keyframes xb-spin { to { transform: rotate(360deg); } }

        /* Reader */
        .xb-reader-screen {
            background: #151311;
            color: var(--xb-text-body);
        }
        .xb-reader-backlight {
            position: fixed;
            top: -20vh;
            left: 8vw;
            width: 84vw;
            height: 62vh;
            pointer-events: none;
            background: radial-gradient(ellipse, rgba(233, 231, 227, 0.022), transparent 62%);
            filter: blur(84px);
            animation: xb-reader-pulse 10s infinite alternate ease-in-out;
        }
        @keyframes xb-reader-pulse {
            0% { opacity: 0.55; transform: scale(0.92); }
            100% { opacity: 1; transform: scale(1.08); }
        }
        .xb-reader-edge {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 20;
            width: 62px;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 38px 0;
            border-right: 1px solid rgba(255, 255, 255, 0.025);
            background: rgba(9, 8, 7, 0.55);
            backdrop-filter: blur(8px);
        }
        .xb-reader-edge-actions {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        .xb-reader-edge-button {
            width: 44px;
            height: 44px;
            padding: 0;
            border: 0;
            background: transparent;
            color: var(--xb-text-muted);
            font-size: 20px;
        }
        .xb-reader-tts-toggle.is-active {
            color: var(--xb-text-main);
            background: rgba(143, 180, 189, 0.14);
        }
        .xb-reader-theme-toggle {
            width: auto;
            min-width: 44px;
            height: 32px;
            padding: 0 10px;
            border: 1px solid var(--xb-line);
            border-radius: 999px;
            background: var(--xb-bg-glass);
            color: var(--xb-text-main);
            font-size: 12px;
            font-weight: 700;
        }
        .xb-reader-edge-button:hover:not(:disabled) {
            color: var(--xb-text-main);
            box-shadow: none;
            background: transparent;
        }
        .xb-reader-theme-toggle:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.07);
        }
        .xb-reader-progress {
            position: relative;
            width: 2px;
            height: 112px;
            overflow: hidden;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.07);
        }
        .xb-reader-progress span {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: var(--xb-reader-progress, 0%);
            border-radius: inherit;
            background: var(--xb-text-main);
        }
        .xb-reader-main {
            position: relative;
            z-index: 2;
            height: 100vh;
            margin-left: 62px;
            display: grid;
            grid-template-columns: 320px minmax(0, 1fr);
            overflow: hidden;
        }
        .xb-reader-nav {
            min-width: 0;
            min-height: 0;
            overflow: auto;
            padding: 56px 34px;
            border-right: 1px solid rgba(233, 231, 227, 0.10);
            background: rgba(15, 14, 12, 0.62);
            backdrop-filter: blur(18px);
            box-shadow: 20px 0 48px rgba(0, 0, 0, 0.26);
        }
        .xb-reader-index-toggle,
        .xb-reader-toc-scrim,
        .xb-reader-toc-sheet {
            display: none;
        }
        .xb-reader-toc-scrim {
            position: fixed;
            inset: 0;
            z-index: 55;
            width: 100%;
            height: 100%;
            padding: 0;
            border: 0;
            border-radius: 0;
            background: rgba(0, 0, 0, 0.32);
            backdrop-filter: blur(2px);
        }
        .xb-reader-toc-handle {
            width: 40px;
            height: 4px;
            min-height: 0;
            margin: 16px auto;
            padding: 0;
            border: 0;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.22);
        }
        .xb-reader-index-title {
            margin-bottom: 34px;
            padding-bottom: 18px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.055);
            color: var(--xb-text-muted);
            font-family: var(--xb-font-mono);
            font-size: 12px;
            letter-spacing: 0.22em;
            text-transform: uppercase;
        }
        .xb-reader-chapters {
            display: grid;
            gap: 14px;
        }
        .xb-reader-chapter {
            position: relative;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
            gap: 12px;
            padding: 4px 0 4px 16px;
            border: 0;
            border-radius: 0;
            background: transparent;
            color: var(--xb-text-muted);
            text-align: left;
            font-family: var(--xb-font-serif);
            font-size: 15px;
        }
        .xb-reader-chapter::before {
            content: "";
            position: absolute;
            left: 0;
            top: 50%;
            width: 5px;
            height: 5px;
            border-radius: 999px;
            background: var(--xb-text-main);
            opacity: 0;
            transform: translateY(-50%);
        }
        .xb-reader-chapter:hover:not(:disabled) {
            color: var(--xb-text-body);
            transform: translateX(4px);
            background: transparent;
            box-shadow: none;
        }
        .xb-reader-chapter.is-active {
            color: var(--xb-text-main);
            transform: translateX(8px);
        }
        .xb-reader-chapter.is-active::before { opacity: 1; }
        .xb-reader-chapter small {
            color: inherit;
            font-family: var(--xb-font-mono);
            font-size: 11px;
            opacity: 0.65;
        }
        .xb-reader-paper {
            min-width: 0;
            min-height: 0;
            overflow: auto;
            padding: 11vh max(40px, calc((100% - 760px) / 2)) 18vh;
            background: transparent;
        }
        .xb-reader-head {
            margin-bottom: 72px;
            text-align: center;
        }
        .xb-reader-head h2 {
            margin: 14px 0 12px;
            color: var(--xb-text-main);
            font-family: var(--xb-font-serif);
            font-size: clamp(34px, 5vw, 54px);
            font-weight: 400;
            line-height: 1.15;
        }
        .xb-reader-head p {
            color: var(--xb-text-muted);
            font-family: var(--xb-font-mono);
            font-size: 12px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
        }
        .xb-reader-content {
            position: relative;
            isolation: isolate;
            max-width: 720px;
            margin: 0 auto;
            background: transparent;
        }
        .xb-reader-md {
            margin: 0 0 2rem;
            background: transparent;
            box-shadow: none;
            color: var(--xb-text-body);
            font: 20px/2.05 var(--xb-font-serif);
            font-weight: 400;
            text-shadow: none;
            mix-blend-mode: normal;
        }
        .xb-reader-md > :first-child {
            margin-top: 0;
        }
        .xb-reader-md > :last-child {
            margin-bottom: 0;
        }
        .xb-reader-md p,
        .xb-reader-md li,
        .xb-reader-md blockquote {
            margin: 0 0 2rem;
            background: transparent;
            box-shadow: none;
            filter: none;
            color: var(--xb-text-body);
            font: inherit;
            font-weight: 400;
            text-shadow: none;
            text-align: justify;
            mix-blend-mode: normal;
            white-space: pre-wrap;
        }
        .xb-reader-md h1,
        .xb-reader-md h2,
        .xb-reader-md h3 {
            margin: 0 0 1.35rem;
            color: var(--xb-text-main);
            font-family: var(--xb-font-serif);
            font-weight: 700;
            letter-spacing: 0;
            line-height: 1.45;
            text-shadow: none;
        }
        .xb-reader-md h1 { font-size: 2rem; }
        .xb-reader-md h2 { font-size: 1.65rem; }
        .xb-reader-md h3 { font-size: 1.32rem; }
        .xb-reader-md em {
            color: var(--xb-text-main);
            font-style: italic;
            text-shadow: none;
        }
        .xb-reader-md strong {
            color: var(--xb-text-main);
            font-weight: 700;
            text-shadow: none;
        }
        .xb-reader-md blockquote {
            padding: 0 0 0 1.1rem;
            border-left: 2px solid rgba(143, 183, 202, 0.35);
            color: var(--xb-text-muted);
        }
        .xb-reader-md ul,
        .xb-reader-md ol {
            margin: 0 0 2rem;
            padding-left: 1.6rem;
        }
        .xb-reader-md code {
            color: var(--xb-text-main);
            background: rgba(143, 183, 202, 0.10);
            border-radius: 4px;
            padding: 0.05rem 0.28rem;
            font-family: var(--xb-font-mono);
            font-size: 0.85em;
        }
        .xb-reader-md.xb-reader-drop p:first-of-type::first-letter {
            float: left;
            padding-top: 5px;
            padding-right: 12px;
            color: var(--xb-text-main);
            font-size: 4.3rem;
            line-height: 0.82;
        }
        .xb-reader-image {
            max-width: 780px;
            margin: 2.4rem auto 3rem;
            text-align: center;
        }
        .xb-reader-image img {
            display: block;
            width: auto;
            max-width: 100%;
            max-height: min(72vh, 860px);
            margin: 0 auto;
            border-radius: 8px;
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
        }
        .xb-reader-image-placeholder {
            min-height: 180px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(233, 231, 227, 0.16);
            border-radius: 8px;
            color: var(--xb-text-muted);
            font-family: var(--xb-font-mono);
            font-size: 12px;
        }
        .xb-reader-image.is-failed .xb-reader-image-placeholder {
            border-color: rgba(248, 113, 113, 0.36);
            color: rgba(248, 113, 113, 0.88);
        }
        .xb-reader-foot {
            max-width: 720px;
            margin: 60px auto 0;
            padding-top: 24px;
            border-top: 1px solid rgba(233, 231, 227, 0.14);
            display: flex;
            justify-content: space-between;
            gap: 12px;
        }
        .xb-reader-foot button,
        .xb-reader-empty button {
            min-height: 40px;
            padding: 0 18px;
            border-radius: 999px;
            color: var(--xb-text-main);
        }
        .xb-reader-empty {
            min-height: 100%;
            display: grid;
            place-content: center;
            justify-items: center;
            gap: 14px;
            color: var(--xb-text-muted);
            text-align: center;
        }
        .xb-reader-empty h2 {
            color: var(--xb-text-main);
            font-family: var(--xb-font-serif);
            font-size: 42px;
            font-weight: 400;
        }

        /* Light theme */
        /* Dark clarity pass */
        .theme-dark .xb-ambient-aurora,
        .theme-dark .xb-agent-aurora,
        .theme-dark .xb-reader-backlight {
            display: none;
        }
        .theme-dark .xb-library-book,
        .theme-dark .xb-agent,
        .theme-dark .xb-reader-nav {
            box-shadow: none;
        }
        .theme-dark .xb-workspace-controller,
        .theme-dark .xb-reader-edge,
        .theme-dark .xb-reader-nav {
            backdrop-filter: none;
        }
        .theme-dark .xb-sidebar {
            background: #171922;
            border-right-color: rgba(184, 178, 166, 0.08);
        }
        .theme-dark .xb-studio-workbench,
        .theme-dark .xb-editor {
            background: #1c1f2a;
        }
        .theme-dark .xb-agent {
            background: #20232d;
            border-left-color: rgba(184, 178, 166, 0.09);
        }
        .theme-dark.xb-studio-shell.focus-editor .xb-agent {
            opacity: 1;
        }
        .theme-dark.xb-studio-shell.focus-agent .xb-editor {
            filter: none;
        }
        .theme-dark.xb-studio-shell.focus-agent .xb-agent {
            box-shadow: none;
        }
        .theme-dark .xb-workspace-controller {
            background: #222631;
            border-color: rgba(184, 178, 166, 0.12);
            box-shadow: none;
        }
        .theme-dark .xb-editor-head {
            background: #1c1f2a;
            border-bottom: 1px solid rgba(184, 178, 166, 0.08);
        }
        .theme-dark .xb-agent-head,
        .theme-dark .xb-agent-form,
        .theme-dark .xb-agent-memory,
        .theme-dark .xb-reader-nav,
        .theme-dark .xb-reader-foot {
            border-color: rgba(184, 178, 166, 0.09);
        }
        .theme-dark .xb-agent-form {
            background: #20232d;
        }
        .theme-dark .xb-agent-compose-row,
        .theme-dark .xb-actions-panel,
        .theme-dark .xb-msg,
        .theme-dark .xb-msg-user,
        .theme-dark .xb-actions button,
        .theme-dark .xb-markdown-html-block,
        .theme-dark .xb-msg-editor,
        .theme-dark .xb-thought-block,
        .theme-dark .xb-tool-preface,
        .theme-dark .xb-tool {
            border-color: rgba(184, 178, 166, 0.11);
            background: #282c38;
            color: var(--xb-text-main);
        }
        .theme-dark .xb-tool-payload {
            border-top-color: rgba(184, 178, 166, 0.10);
        }
        .theme-dark .xb-agent-compose-row:focus-within {
            border-color: rgba(143, 180, 189, 0.40);
            background: #2b3040;
            box-shadow: none;
        }
        .theme-dark .xb-msg-assistant {
            border-left-color: var(--xb-indigo);
            background: #272b38;
        }
        .theme-dark .xb-msg-user {
            background: #303342;
        }
        .theme-dark .xb-assistant-markdown pre,
        .theme-dark .xb-markdown-html-code {
            border-color: rgba(184, 178, 166, 0.10);
            background: #191c25;
            color: var(--xb-text-body);
        }
        .theme-dark .xb-assistant-markdown strong,
        .theme-dark .xb-assistant-markdown b,
        .theme-dark .xb-assistant-markdown h1,
        .theme-dark .xb-assistant-markdown h2,
        .theme-dark .xb-assistant-markdown h3,
        .theme-dark .xb-assistant-markdown h4 {
            color: var(--xb-text-main);
            font-weight: 700;
            text-shadow: none !important;
            filter: none !important;
        }
        .theme-dark .xb-assistant-markdown code {
            background: rgba(255, 255, 255, 0.075);
            color: var(--xb-text-main);
        }
        .theme-dark .xb-file.is-active {
            border-color: rgba(184, 178, 166, 0.12);
            background: #242834;
        }
        .theme-dark .xb-library-book {
            border-color: rgba(184, 178, 166, 0.08);
            background: #242834;
        }
        .theme-dark .xb-entry-action {
            border-color: rgba(184, 178, 166, 0.08);
            background: transparent;
        }
        .theme-dark .xb-library-book:hover:not(:disabled) {
            border-color: rgba(184, 178, 166, 0.16);
            box-shadow: none;
        }
        .theme-dark .xb-portal-theme {
            color: var(--xb-text-main);
        }
        .theme-dark .xb-entry-action.is-studio:hover {
            background: radial-gradient(circle at center, rgba(166, 171, 200, 0.08), transparent 58%);
        }
        .theme-dark .xb-entry-action.is-reader:hover {
            background: radial-gradient(circle at center, rgba(233, 231, 227, 0.065), transparent 58%);
        }
        .theme-dark .xb-portal-close,
        .theme-dark .xb-portal-theme {
            color: var(--xb-text-muted);
        }
        .theme-dark .xb-reader-screen,
        .theme-dark.xb-reader-screen {
            background: #171922;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
        }
        .theme-dark .xb-reader-edge,
        .theme-dark .xb-reader-nav {
            background: #1c1f2a;
        }
        .theme-dark .xb-reader-paper {
            background: transparent;
        }
        .theme-dark .xb-reader-md,
        .theme-dark .xb-reader-md p,
        .theme-dark .xb-reader-md li {
            color: #a19b90;
        }
        .theme-dark .xb-reader-head h2,
        .theme-dark .xb-reader-md h1,
        .theme-dark .xb-reader-md h2,
        .theme-dark .xb-reader-md h3,
        .theme-dark .xb-reader-md em,
        .theme-dark .xb-reader-md strong,
        .theme-dark .xb-reader-md code,
        .theme-dark .xb-reader-md.xb-reader-drop p:first-of-type::first-letter {
            color: #b8b2a6;
        }
        .theme-dark .xb-reader-md blockquote {
            color: #928f89;
            border-left-color: rgba(184, 178, 166, 0.26);
        }
        .theme-dark .xb-reader-content,
        .theme-dark .xb-reader-content p,
        .theme-dark .xb-reader-md,
        .theme-dark .xb-reader-md * {
            background: transparent !important;
            box-shadow: none !important;
            filter: none !important;
            mix-blend-mode: normal !important;
            text-shadow: none !important;
        }

        .theme-light .xb-archive-header,
        .theme-light .xb-shelf-container,
        .theme-light .xb-entry-portal,
        .theme-light .xb-studio-workbench,
        .theme-light .xb-editor,
        .theme-light .xb-agent,
        .theme-light .xb-reader-screen,
        .xb-reader-screen.theme-light {
            background: var(--xb-bg-deep);
            color: var(--xb-text-main);
            -webkit-font-smoothing: subpixel-antialiased;
            text-rendering: auto;
        }
        .theme-light .xb-archive-header::after {
            background: linear-gradient(90deg, rgba(87, 70, 48, 0.24), rgba(87, 70, 48, 0.08) 42%, transparent);
        }
        .theme-light .xb-archive-subtitle {
            color: rgba(69, 55, 38, 0.72);
        }
        .theme-light .xb-sidebar {
            border-right-color: rgba(87, 70, 48, 0.12);
            background: #fff3df;
        }
        .theme-light .xb-icon-button,
        .theme-light .xb-glass-button,
        .theme-light .xb-home-actions button {
            border-color: var(--xb-line);
            background: rgba(255, 253, 248, 0.82);
            color: var(--xb-text-main);
        }
        .theme-light .xb-global-actions .xb-glass-button {
            border-color: transparent;
            background: transparent;
            color: var(--xb-text-muted);
        }
        .theme-light .xb-global-actions .xb-glass-button:hover:not(:disabled),
        .theme-light .xb-global-actions .xb-glass-button:focus-visible {
            border-color: var(--xb-line);
            background: rgba(87, 70, 48, 0.055);
            color: var(--xb-text-main);
            box-shadow: none;
        }
        .theme-light .xb-workspace-controller {
            border-color: var(--xb-line);
            background: rgba(255, 253, 248, 0.86);
            box-shadow: 0 8px 22px rgba(87, 70, 48, 0.08);
        }
        .theme-light .xb-layout-button.is-active {
            background: rgba(87, 70, 48, 0.10);
        }
        .theme-light .xb-file.is-active,
        .theme-light .xb-library-empty,
        .theme-light .xb-section-empty,
        .theme-light .xb-actions-panel,
        .theme-light .xb-delete-book-item,
        .theme-light .xb-book-transfer-menu-choice,
        .theme-light .xb-ebook-export-book {
            border-color: var(--xb-line);
            background: rgba(255, 253, 248, 0.78);
        }
        .theme-light .xb-book-transfer-menu-choice span {
            border-color: rgba(87, 70, 48, 0.14);
            background: rgba(87, 70, 48, 0.045);
        }
        .theme-light .xb-ebook-export-book em {
            border-color: rgba(87, 70, 48, 0.14);
            background: rgba(87, 70, 48, 0.045);
        }
        .theme-light .xb-ebook-transfer-overlay {
            background: rgba(87, 70, 48, 0.20);
        }
        .theme-light .xb-ebook-transfer-panel {
            border-color: rgba(87, 70, 48, 0.13);
            background: rgba(255, 253, 248, 0.94);
            box-shadow: 0 18px 44px rgba(87, 70, 48, 0.14);
        }
        .theme-light .xb-ebook-transfer-bar {
            background: rgba(87, 70, 48, 0.08);
        }
        .theme-light .xb-library-book {
            border-color: rgba(87, 70, 48, 0.12);
            background: #fffdf8;
            box-shadow: 0 18px 38px rgba(87, 70, 48, 0.10);
        }
        .theme-light .xb-library-book:hover:not(:disabled) {
            border-color: rgba(87, 70, 48, 0.20);
            box-shadow: 0 24px 46px rgba(87, 70, 48, 0.13);
        }
        .theme-light .xb-shelf-action {
            border-color: rgba(87, 70, 48, 0.18);
            background: rgba(255, 253, 248, 0.62);
            color: var(--xb-text-main);
        }
        .theme-light .xb-shelf-action-ring {
            border-color: rgba(87, 70, 48, 0.18);
            background: rgba(87, 70, 48, 0.055);
        }
        .theme-light .xb-entry-action {
            border-color: rgba(87, 70, 48, 0.12);
            background: transparent;
        }
        .theme-light .xb-entry-action.is-studio:hover:not(:disabled) {
            background: radial-gradient(circle at center, rgba(166, 171, 200, 0.12), transparent 58%);
        }
        .theme-light .xb-entry-action.is-reader:hover:not(:disabled) {
            background: radial-gradient(circle at center, rgba(87, 70, 48, 0.06), transparent 58%);
        }
        .theme-light .xb-portal-close,
        .theme-light .xb-portal-theme {
            border-color: var(--xb-line);
            background: rgba(255, 253, 248, 0.84);
            color: var(--xb-text-main);
        }
        .theme-light .xb-editor {
            background: #fffdf8;
            border-right-color: rgba(87, 70, 48, 0.10);
        }
        .theme-light .xb-agent {
            background: #fff8ec;
            border-left-color: rgba(87, 70, 48, 0.11);
            box-shadow: -12px 0 30px rgba(87, 70, 48, 0.08);
        }
        .theme-light.xb-studio-shell.focus-agent .xb-agent {
            box-shadow: -18px 0 42px rgba(87, 70, 48, 0.12);
        }
        .theme-light .xb-editor-head {
            background: linear-gradient(180deg, rgba(255, 253, 248, 0.96), rgba(255, 253, 248, 0.78), transparent);
        }
        .theme-light .xb-agent-head,
        .theme-light .xb-agent-memory,
        .theme-light .xb-agent-form,
        .theme-light .xb-reader-nav,
        .theme-light .xb-reader-foot,
        .theme-light .xb-ebook-settings-head,
        .theme-light .xb-ebook-delete-head,
        .theme-light .xb-ebook-delete-note {
            border-color: var(--xb-line);
        }
        .theme-light .xb-agent-form {
            background: linear-gradient(0deg, var(--xb-bg-agent) 74%, transparent);
        }
        .theme-light .xb-distillation-backdrop {
            background: rgba(255, 250, 240, 0.58);
        }
        .theme-light .xb-distillation-plaque {
            border-top-color: rgba(87, 70, 48, 0.12);
            border-bottom-color: rgba(87, 70, 48, 0.05);
            background: rgba(255, 253, 248, 0.72);
            box-shadow: 0 20px 42px rgba(87, 70, 48, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.64);
        }
        .theme-light .xb-agent-compose-row,
        .theme-light .xb-msg,
        .theme-light .xb-msg-user,
        .theme-light .xb-actions button,
        .theme-light .xb-markdown-html-block,
        .theme-light .xb-msg-editor,
        .theme-light .xb-thought-block,
        .theme-light .xb-tool-preface,
        .theme-light .xb-tool {
            border-color: var(--xb-line);
            background: #fffdf8;
            color: var(--xb-text-main);
        }
        .theme-light .xb-tool-payload {
            border-top-color: rgba(87, 70, 48, 0.12);
        }
        .theme-light .xb-agent-compose-row:focus-within {
            border-color: rgba(61, 124, 131, 0.42);
            background: #fffdf8;
            box-shadow: 0 0 0 3px rgba(61, 124, 131, 0.10);
        }
        .theme-light .xb-msg-assistant {
            border-left-color: var(--xb-indigo);
        }
        .theme-light .xb-msg.is-error {
            border-color: rgba(182, 77, 93, 0.35);
            color: #8d2338;
            background: #fff5f6;
        }
        .theme-light .xb-assistant-markdown code {
            background: rgba(87, 70, 48, 0.08);
            color: #352d24;
        }
        .theme-light .xb-assistant-markdown pre,
        .theme-light .xb-markdown-html-code {
            border-color: var(--xb-line);
            background: #f8f2e8;
            color: var(--xb-text-main);
        }
        .theme-light .xb-assistant-markdown blockquote {
            border-left-color: rgba(61, 124, 131, 0.28);
            color: var(--xb-text-muted);
        }
        .theme-light .xb-assistant-markdown th,
        .theme-light .xb-assistant-markdown td,
        .theme-light .xb-markdown-html-preview {
            border-color: var(--xb-line);
        }
        .theme-light .xb-assistant-markdown th {
            background: rgba(87, 70, 48, 0.06);
        }
        .theme-light .xb-ebook-settings-overlay,
        .theme-light .xb-ebook-delete-overlay {
            background: rgba(255, 250, 240, 0.78);
        }
        .theme-light .xb-ebook-settings-dialog,
        .theme-light .xb-ebook-delete-dialog {
            border-color: var(--xb-line);
            background: rgba(255, 253, 248, 0.98);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-config-tabs {
            background: rgba(87, 70, 48, 0.06);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-config-tab.is-active {
            background: #fffdf8;
            box-shadow: 0 1px 6px rgba(87, 70, 48, 0.08);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-config input,
        .theme-light .xb-ebook-settings-body .xb-assistant-config select {
            border-color: var(--xb-line);
            background: #fffdf8;
            color: var(--xb-text-main);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-config select {
            color-scheme: light;
            background: #fffdf8;
            color: var(--xb-text-main);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-icon-button {
            border-color: rgba(87, 70, 48, 0.16);
            background: #fffdf8;
            color: rgba(87, 70, 48, 0.62);
            box-shadow: 0 1px 3px rgba(87, 70, 48, 0.06);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-icon-button:hover:not(:disabled),
        .theme-light .xb-ebook-settings-body .xb-assistant-icon-button:focus-visible {
            border-color: rgba(87, 70, 48, 0.24);
            background: rgba(255, 249, 236, 0.98);
            color: var(--xb-text-main);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-icon-button.xb-assistant-save-button.is-success {
            border-color: rgba(34, 139, 72, 0.25);
            background: rgba(34, 139, 72, 0.08);
            color: #176b35;
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-icon-button.xb-assistant-save-button.is-error {
            border-color: rgba(159, 35, 61, 0.22);
            background: rgba(159, 35, 61, 0.07);
            color: #9f233d;
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-config select option,
        .theme-light .xb-ebook-settings-body .xb-assistant-config select optgroup {
            background: #fffdf8;
            color: var(--xb-text-main);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-inline-status.is-success,
        .theme-light .xb-assistant-save-button.is-success {
            color: #176b35;
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-inline-status.is-error,
        .theme-light .xb-assistant-save-button.is-error {
            color: #9f233d;
        }
        .theme-light .xb-reader-edge {
            border-right-color: rgba(87, 70, 48, 0.12);
            background: rgba(255, 253, 248, 0.84);
        }
        .theme-light .xb-mobile-studio-topbar,
        .theme-light .xb-reader-toc-sheet,
        .theme-light.xb-studio-shell .xb-sidebar {
            border-color: var(--xb-line);
            background: rgba(255, 248, 236, 0.96);
            box-shadow: 0 -18px 46px rgba(87, 70, 48, 0.12);
        }
        .theme-light .xb-mobile-segment,
        .theme-light .xb-mobile-file-picker {
            border-color: var(--xb-line);
            background: rgba(87, 70, 48, 0.055);
            color: var(--xb-text-main);
        }
        .theme-light .xb-mobile-segment-slider {
            background: rgba(87, 70, 48, 0.12);
        }
        .theme-light .xb-reader-nav {
            background: rgba(255, 248, 236, 0.76);
            box-shadow: 20px 0 42px rgba(87, 70, 48, 0.08);
        }
        .theme-light .xb-reader-progress {
            background: rgba(87, 70, 48, 0.14);
        }
        .theme-light .xb-reader-chapter:hover:not(:disabled) {
            color: var(--xb-text-main);
        }
        .theme-light .xb-reader-paper {
            background: transparent;
        }
        .theme-light .xb-reader-content,
        .theme-light .xb-reader-content p,
        .theme-light .xb-reader-md,
        .theme-light .xb-reader-md * {
            background: transparent !important;
            box-shadow: none !important;
            filter: none !important;
            mix-blend-mode: normal !important;
            text-shadow: none !important;
        }

        @media (max-width: 980px) {
            .xb-library-screen {
                grid-template-rows: auto minmax(0, 1fr);
            }
            .xb-archive-header {
                z-index: 30;
                height: auto;
                min-height: 0;
                align-items: flex-start;
                justify-content: space-between;
                flex-direction: row;
                padding: calc(20px + env(safe-area-inset-top, 0px)) 24px 18px;
            }
            .xb-archive-header::after {
                left: 24px;
                right: 24px;
            }
            .xb-archive-header > div:first-child {
                min-width: 0;
            }
            .xb-global-actions {
                flex: 0 0 auto;
                flex-wrap: nowrap;
                justify-content: flex-end;
            }
            .xb-shelf-container {
                height: auto;
                padding: 18px 24px calc(84px + env(safe-area-inset-bottom, 0px));
            }
            .xb-library-grid {
                grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
                gap: 14px;
                align-items: start;
            }
            .xb-library-grid.is-empty {
                padding-top: 14px;
            }
            .xb-library-book {
                min-height: 0;
                aspect-ratio: 3 / 4;
                border-radius: 12px;
                padding: 18px 14px 14px;
                box-shadow: 0 12px 28px rgba(0, 0, 0, 0.20);
            }
            .xb-library-book:hover:not(:disabled) {
                transform: translateY(-3px);
            }
            .xb-library-book strong {
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                font-size: 18px;
                line-height: 1.2;
            }
            .xb-library-book small {
                font-size: 11px;
                line-height: 1.4;
            }
            .xb-library-book-foot {
                gap: 8px;
                padding-top: 10px;
            }
            .xb-library-book-foot small {
                display: none;
            }
            .xb-library-empty {
                min-height: 180px;
                padding: 22px;
                pointer-events: none;
            }
            .xb-shelf-actions {
                display: contents;
            }
            .xb-shelf-action {
                min-height: 0;
                aspect-ratio: 3 / 4;
                padding: 14px 10px;
                border-radius: 12px;
            }
            .xb-shelf-action-ring {
                width: 48px;
                height: 48px;
                font-size: 29px;
            }
            .xb-shelf-action strong {
                font-size: 11px;
            }
            .xb-entry-actions {
                flex-direction: column;
            }
            .xb-entry-action {
                min-height: 50vh;
                border-right: 0;
                border-top: 1px solid rgba(255, 255, 255, 0.045);
            }
            .xb-entry-action strong { font-size: 48px; }
            .xb-entry-action {
                flex: 1;
            }
            .xb-portal-theme {
                top: 22px;
                right: 24px;
            }
            .xb-ebook-shell {
                display: grid;
                grid-template-rows: minmax(178px, 28vh) minmax(0, 1fr);
                overflow: hidden;
            }
            .xb-sidebar {
                position: relative;
                left: auto;
                top: auto;
                bottom: auto;
                width: 100%;
                min-height: 0;
                transform: none;
                flex: none;
                padding: 16px 18px;
                border-right: 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                overflow: hidden;
            }
            .xb-sidebar .xb-title-row h1 {
                font-size: 20px;
            }
            .xb-files {
                grid-auto-flow: column;
                grid-auto-columns: minmax(190px, 240px);
                grid-template-rows: 1fr;
                overflow-x: auto;
                overflow-y: hidden;
            }
            .xb-file-group {
                min-width: 0;
            }
            .xb-studio-workbench {
                width: 200vw;
                height: 100%;
                display: flex;
                transition: transform 0.5s var(--xb-fluid);
            }
            .xb-studio-shell.focus-agent .xb-studio-workbench {
                transform: translateX(-50%);
            }
            .xb-editor,
            .xb-agent,
            .xb-studio-shell.focus-editor .xb-editor,
            .xb-studio-shell.focus-editor .xb-agent,
            .xb-studio-shell.focus-agent .xb-editor,
            .xb-studio-shell.focus-agent .xb-agent {
                width: 100vw;
                min-width: 100vw;
                flex: 0 0 100vw;
                opacity: 1;
                filter: none;
            }
            .xb-studio-shell.balanced .xb-studio-workbench,
            .xb-studio-shell.focus-editor .xb-studio-workbench {
                transform: translateX(0);
            }
            .xb-editor-head {
                padding: 18px 20px 12px;
                align-items: flex-start;
                flex-direction: column;
            }
            .xb-editor-body {
                padding: 10px 22px 22px;
            }
            #xb-editor-text {
                font-size: 16px;
            }
            .xb-agent-head {
                display: block;
                padding: 0;
                border-bottom: none;
                gap: 0;
            }
            .xb-agent-head-main {
                display: none;
            }
            .xb-agent-head .xb-agent-global-actions {
                display: none;
            }
            .xb-agent-toolbar {
                padding: 6px 16px;
            }
            .xb-agent-main {
                padding: 20px 20px;
            }
            .xb-actions {
                grid-template-columns: 1fr 1fr;
            }
            .xb-agent-form {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                height: 122px;
                min-height: 122px;
                padding: 14px 20px 22px;
            }
            .xb-compose-hint {
                display: none;
            }
            .xb-agent {
                padding-bottom: 124px;
            }
            .xb-studio-shell {
                position: relative;
                display: block;
                height: 100%;
                overflow: hidden;
            }
            .xb-mobile-studio-topbar {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                z-index: 70;
                height: calc(64px + env(safe-area-inset-top, 0px));
                padding: calc(10px + env(safe-area-inset-top, 0px)) 12px 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(23, 25, 34, 0.90);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(18px);
            }
            .xb-mobile-agent-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .xb-mobile-agent-action {
                width: 34px;
                height: 34px;
                min-height: 0;
                padding: 0;
                border: 1px solid var(--xb-line);
                border-radius: 999px;
                background: var(--xb-bg-glass);
                color: var(--xb-text-muted);
                font-size: 17px;
                line-height: 1;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                flex-shrink: 0;
            }
            .xb-mobile-topbar-button {
                display: none;
            }
            .xb-mobile-segment {
                position: relative;
                width: min(162px, calc(100vw - 216px));
                display: grid;
                grid-template-columns: 1fr 1fr;
                padding: 4px;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.055);
                box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.28);
                flex-shrink: 0;
            }
            .xb-mobile-segment-slider {
                position: absolute;
                top: 4px;
                bottom: 4px;
                left: 4px;
                width: calc(50% - 4px);
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.14);
                transition: transform 0.42s var(--xb-fluid);
            }
            .xb-studio-shell.focus-agent .xb-mobile-segment-slider {
                transform: translateX(100%);
            }
            .xb-mobile-segment-button {
                position: relative;
                z-index: 1;
                min-height: 30px;
                padding: 0 10px;
                border: 0;
                background: transparent;
                color: var(--xb-text-muted);
                font-size: 13px;
                font-weight: 700;
            }
            .xb-mobile-segment-button.is-active {
                color: var(--xb-text-main);
            }
            .xb-mobile-file-drawer-scrim {
                position: absolute;
                inset: 0;
                z-index: 80;
                width: 100%;
                height: 100%;
                padding: 0;
                border: 0;
                border-radius: 0;
                background: rgba(0, 0, 0, 0.28);
                backdrop-filter: blur(2px);
            }
            .xb-studio-shell.is-file-drawer-open .xb-mobile-file-drawer-scrim {
                display: block;
            }
            .xb-studio-shell .xb-sidebar {
                position: absolute;
                left: 0;
                right: 0;
                top: auto;
                bottom: 0;
                z-index: 90;
                width: 100%;
                height: min(68vh, 620px);
                padding: 0 18px calc(22px + env(safe-area-inset-bottom, 0px));
                border: 0;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 24px 24px 0 0;
                background: rgba(23, 25, 34, 0.96);
                box-shadow: 0 -18px 48px rgba(0, 0, 0, 0.42);
                backdrop-filter: blur(20px);
                transform: translateY(102%);
                transition: transform 0.48s var(--xb-fluid);
            }
            .xb-studio-shell.is-file-drawer-open .xb-sidebar {
                transform: translateY(0);
            }
            .xb-studio-shell.is-file-drawer-open .xb-studio-workbench {
                opacity: 0.54;
                filter: blur(3px);
                pointer-events: none;
            }
            .xb-mobile-drawer-handle {
                width: 40px;
                height: 4px;
                min-height: 0;
                margin: 16px auto 18px;
                padding: 0;
                border: 0;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.22);
            }
            .xb-studio-shell .xb-sidebar .xb-brand {
                display: none;
            }
            .xb-studio-shell .xb-files {
                height: calc(100% - 38px);
                display: flex;
                flex-direction: column;
                gap: 18px;
                overflow-x: hidden;
                overflow-y: auto;
                padding: 0 2px 10px;
            }
            .xb-studio-shell .xb-file-group {
                display: grid;
                gap: 8px;
            }
            .xb-studio-shell .xb-studio-workbench {
                position: absolute;
                left: 0;
                top: calc(64px + env(safe-area-inset-top, 0px));
                width: 200vw;
                height: calc(100% - 64px - env(safe-area-inset-top, 0px));
                display: flex;
                transition: transform 0.5s var(--xb-fluid), opacity 0.32s ease, filter 0.32s ease;
            }
            .xb-studio-shell.focus-agent .xb-studio-workbench {
                transform: translateX(-50%);
            }
            .xb-studio-shell.balanced .xb-studio-workbench,
            .xb-studio-shell.focus-editor .xb-studio-workbench {
                transform: translateX(0);
            }
            .xb-studio-shell .xb-editor,
            .xb-studio-shell .xb-agent,
            .xb-studio-shell.focus-editor .xb-editor,
            .xb-studio-shell.focus-editor .xb-agent,
            .xb-studio-shell.focus-agent .xb-editor,
            .xb-studio-shell.focus-agent .xb-agent {
                width: 100vw;
                min-width: 100vw;
                flex: 0 0 100vw;
                opacity: 1;
                filter: none;
            }
            .xb-editor {
                position: relative;
            }
            .xb-editor-head {
                position: static;
                min-height: 0;
                padding: 0;
                display: block;
                background: transparent;
                border: 0;
            }
            .xb-mobile-file-picker {
                position: absolute;
                top: 10px;
                left: 50%;
                z-index: 15;
                transform: translateX(-50%);
                max-width: calc(100vw - 48px);
                min-height: 34px;
                padding: 0 14px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.05);
                color: var(--xb-text-main);
                font-family: var(--xb-font-mono);
                font-size: 12px;
            }
            .xb-mobile-file-picker strong {
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-weight: 600;
            }
            .xb-mobile-file-picker em {
                color: var(--xb-text-muted);
                font-style: normal;
            }
            .xb-editor-head .xb-path {
                display: none;
            }
            .xb-editor-actions {
                position: absolute;
                left: 10px;
                right: 10px;
                bottom: calc(8px + env(safe-area-inset-bottom, 0px));
                z-index: 16;
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 6px;
            }
            .xb-editor-actions button {
                min-width: 0;
                min-height: 38px;
                width: 100%;
                padding: 0 4px;
                overflow: hidden;
                font-size: clamp(10px, 3vw, 12px);
                line-height: 1;
                text-align: center;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .xb-editor-body {
                padding: 56px 24px calc(64px + env(safe-area-inset-bottom, 0px));
            }
            #xb-editor-text {
                font-size: 16px;
                line-height: 1.82;
            }
            .xb-editor-foot {
                position: absolute;
                left: 18px;
                right: 18px;
                bottom: calc(52px + env(safe-area-inset-bottom, 0px));
                min-height: 0;
                padding: 0;
                pointer-events: none;
            }
            .xb-agent-head {
                min-height: 0;
                display: block;
                gap: 0;
                padding: 0;
            }
            .xb-agent-head-main {
                display: none;
            }
            .xb-agent-toolbar {
                padding: 6px 16px;
            }
            .xb-agent-head .xb-agent-global-actions {
                display: none;
            }
            .xb-agent-head-main {
                display: none;
            }
            .xb-agent-global-actions {
                flex: 0 0 auto;
                gap: 8px;
            }
            .xb-agent-global-actions button {
                min-width: 38px;
                min-height: 32px;
                padding: 0 10px;
            }
            .xb-agent-toolbar {
                width: 100%;
                flex-wrap: nowrap;
                overflow-x: auto;
                justify-content: flex-start;
                padding-bottom: 2px;
            }
            .xb-agent-toolbar button,
            .xb-agent-context-meter {
                flex: 0 0 auto;
            }
            .xb-agent-main {
                padding: 18px 18px;
            }
            .xb-agent-form {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                height: calc(122px + env(safe-area-inset-bottom, 0px));
                min-height: calc(122px + env(safe-area-inset-bottom, 0px));
                padding: 14px 18px calc(20px + env(safe-area-inset-bottom, 0px));
            }
            .xb-agent {
                padding-bottom: calc(122px + env(safe-area-inset-bottom, 0px));
            }
            .xb-reader-edge {
                top: auto;
                bottom: 0;
                width: 100%;
                height: calc(70px + env(safe-area-inset-bottom, 0px));
                flex-direction: row;
                padding: 8px 18px calc(10px + env(safe-area-inset-bottom, 0px));
                border-right: 0;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
            }
            .xb-reader-edge-actions {
                width: 100%;
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                align-items: center;
                justify-items: center;
                gap: 0;
            }
            .xb-reader-index-toggle {
                display: grid;
            }
            .xb-reader-edge-button,
            .xb-reader-theme-toggle {
                width: 44px;
                min-width: 44px;
                height: 44px;
                min-height: 44px;
                display: grid;
                place-items: center;
                padding: 0;
                line-height: 1;
            }
            .xb-reader-progress {
                position: absolute;
                top: -1px;
                left: 0;
                width: 100%;
                height: 2px;
            }
            .xb-reader-progress span {
                width: var(--xb-reader-progress, 0%);
                height: 100% !important;
                right: auto;
            }
            .xb-reader-main {
                margin-left: 0;
                grid-template-columns: 1fr;
            }
            .xb-reader-nav {
                display: none;
            }
            .xb-reader-paper {
                transition: opacity 0.42s var(--xb-fluid), filter 0.42s var(--xb-fluid), transform 0.42s var(--xb-fluid);
            }
            .xb-reader-screen.is-reader-index-open .xb-reader-paper {
                opacity: 0.44;
                filter: blur(3px);
                transform: scale(0.94) translateY(-16px);
                pointer-events: none;
            }
            .xb-reader-screen.is-reader-index-open .xb-reader-toc-scrim {
                display: block;
            }
            .xb-reader-toc-sheet {
                position: fixed;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 60;
                height: min(78vh, 720px);
                display: flex;
                flex-direction: column;
                padding: 0 26px calc(24px + env(safe-area-inset-bottom, 0px));
                border-top: 1px solid rgba(233, 231, 227, 0.14);
                border-radius: 24px 24px 0 0;
                background: rgba(21, 19, 17, 0.96);
                box-shadow: 0 -18px 58px rgba(0, 0, 0, 0.48);
                backdrop-filter: blur(20px);
                transform: translateY(104%);
                transition: transform 0.48s var(--xb-fluid);
            }
            .xb-reader-screen.is-reader-index-open .xb-reader-toc-sheet {
                transform: translateY(0);
            }
            .xb-reader-toc-sheet .xb-reader-index-title {
                margin-bottom: 16px;
                text-align: center;
            }
            .xb-reader-toc-sheet .xb-reader-chapters {
                overflow: auto;
                gap: 18px;
                padding: 4px 4px 12px;
            }
            .xb-reader-paper {
                padding: 72px 24px 120px;
            }
            .xb-reader-head {
                margin-bottom: 42px;
            }
            .xb-reader-content p {
                font-size: 18px;
                line-height: 1.95;
            }
        }

        @media (max-width: 900px) {
            .xb-entry-action strong {
                color: var(--xb-text-main);
                transform: none;
            }
            .xb-entry-action span {
                color: var(--xb-text-main);
                opacity: 0.72;
            }
            .theme-dark .xb-entry-action.is-studio {
                border-color: rgba(166, 171, 200, 0.16);
                background: radial-gradient(circle at center, rgba(166, 171, 200, 0.11), transparent 60%), #2b3040;
            }
            .theme-dark .xb-entry-action.is-reader {
                border-color: rgba(233, 231, 227, 0.12);
                background: radial-gradient(circle at center, rgba(233, 231, 227, 0.08), transparent 60%), #2c2f36;
            }
            .theme-light .xb-entry-action.is-studio {
                border-color: rgba(87, 70, 48, 0.14);
                background: radial-gradient(circle at center, rgba(166, 171, 200, 0.10), transparent 60%), #f7f7fc;
            }
            .theme-light .xb-entry-action.is-reader {
                border-color: rgba(87, 70, 48, 0.14);
                background: radial-gradient(circle at center, rgba(206, 179, 122, 0.10), transparent 60%), #fffaf2;
            }
        }

        @media (max-width: 560px) {
            .xb-archive-header {
                gap: 12px;
                padding-left: 18px;
                padding-right: 18px;
            }
            .xb-archive-header::after {
                left: 18px;
                right: 18px;
            }
            .xb-archive-header h1 {
                overflow: hidden;
                font-size: 28px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .xb-archive-subtitle {
                margin-top: 6px;
                overflow: hidden;
                font-size: 12px;
                letter-spacing: 0.04em;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .xb-archive-meta {
                overflow: hidden;
                margin-top: 8px;
                font-size: 10px;
                text-overflow: ellipsis;
                white-space: nowrap;
                letter-spacing: 0.12em;
            }
            .xb-glass-button,
            .xb-home-actions button {
                min-height: 36px;
                padding: 0 12px;
            }
            .xb-global-actions {
                width: auto;
                display: flex;
                grid-template-columns: none;
                gap: 6px;
            }
            .xb-global-actions button {
                width: 34px;
                min-width: 34px;
                height: 34px;
                min-height: 34px;
                padding: 0;
            }
            .xb-global-actions #xb-close.xb-exit-button {
                width: 34px;
                min-width: 34px;
                height: 34px;
                min-height: 34px;
                padding: 0;
            }
            .xb-global-actions .xb-transfer-button {
                width: 34px;
                min-width: 34px;
                height: 34px;
                min-height: 34px;
                padding: 0;
            }
            .xb-library-grid {
                grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
                gap: 10px;
            }
            .xb-library-book {
                padding: 14px 10px 10px;
                border-radius: 10px;
            }
            .xb-library-book strong { font-size: 15px; }
            .xb-library-book-main {
                gap: 7px;
            }
            .xb-book-spine {
                top: 14px;
                bottom: 14px;
                width: 2px;
            }
            .xb-library-book-foot {
                padding-top: 8px;
            }
            .xb-library-book-foot em {
                padding: 4px 6px;
                font-size: 8px;
                letter-spacing: 0.05em;
            }
            .xb-library-empty {
                min-height: 150px;
                border-radius: 12px;
                padding: 18px;
                font-size: 13px;
            }
            .xb-shelf-actions {
                display: contents;
            }
            .xb-shelf-action {
                min-height: 0;
                padding: 12px 8px;
            }
            .xb-shelf-action-ring {
                width: 42px;
                height: 42px;
                font-size: 26px;
            }
            .xb-shelf-action strong {
                font-size: 10px;
            }
            .xb-entry-action span {
                max-width: 280px;
                font-size: 11px;
            }
            .xb-mobile-studio-topbar {
                padding-left: 12px;
                padding-right: 12px;
            }
            .xb-mobile-segment {
                width: min(140px, calc(100vw - 200px));
            }
            .xb-editor-actions {
                left: 10px;
                right: 10px;
                gap: 6px;
            }
            .xb-editor-actions button {
                padding: 0 6px;
                font-size: 11px;
            }
            .xb-editor-actions {
                width: auto;
            }
            .xb-agent-toolbar {
                width: 100%;
                justify-content: flex-start;
            }
            #xb-agent-close { margin-left: 0; }
            .xb-msg {
                max-width: 100%;
            }
            .xb-msg.is-editing {
                width: 100%;
                max-width: 100%;
            }
            .xb-ebook-settings-overlay {
                padding: 12px;
            }
            .xb-ebook-settings-dialog {
                max-height: calc(100vh - 24px);
                border-radius: 16px;
            }
        }
    `,document.head.appendChild(e)}var He=new Map;function Ke(t){if(typeof requestAnimationFrame=="function"){requestAnimationFrame(t);return}setTimeout(t,16)?.unref?.()}function Eo(){try{const t=["mobile","tablet"],e=globalThis.Bowser?.parse?.(globalThis.navigator?.userAgent||"")?.platform?.type;if(t.includes(e))return!0}catch(t){console.warn({source:import.meta.url,operation:"isEbookMobile"},t)}try{return!!(globalThis.matchMedia?.("(pointer: coarse)")?.matches&&globalThis.matchMedia?.("(max-width: 900px)")?.matches)}catch{return!1}}function Ci(t){return t.key==="Enter"&&!Eo()&&!t.isComposing&&!t.shiftKey&&!t.ctrlKey&&!t.altKey&&!t.metaKey}function Pi(t){return String(t.key||"").toLowerCase()==="s"&&(t.ctrlKey||t.metaKey)}function Bi(t,e,r){const o=t.querySelector("#xb-editor-meta");o&&(o.textContent=`${r.isEditorDirty()?"有未保存修改":"已保存到书库"} · ${Ut(e.editorContent||"")}`)}function vr(t){const e=t.querySelector("#xb-compose-hint");e&&(e.textContent=Eo()?"Enter 换行 · 点击发送":"Enter 发送 · Shift+Enter 换行")}function wr(t,e=0){const r=Number.parseFloat(t);return Number.isFinite(r)?r:e}function Pt(t){const e=t?.querySelector?.("#xb-agent-input");if(!e?.style)return;const r=globalThis.getComputedStyle?.(e),o=wr(r?.minHeight,46),n=Math.max(o,wr(r?.maxHeight,68)),a=Number.isFinite(Number(e.scrollHeight))?Number(e.scrollHeight):o;e.style.height="0px";const i=Math.min(n,Math.max(o,a));e.style.height=`${i}px`,e.style.overflowY=a>n?"auto":"hidden"}function Li(t){const e=t?.querySelector?.(".xb-files .xb-file.is-active");e&&Ke(()=>{try{e.scrollIntoView({block:"center",inline:"nearest"})}catch{e.scrollIntoView?.()}})}function Ri(t,e){const r=t.createElementNS("http://www.w3.org/2000/svg","path");return r.setAttribute("d",e),r}function Ii(t,e="dark"){if(e==="light"){const n=t.createElement("span");return n.className="xb-theme-glyph",n.setAttribute("aria-hidden","true"),n.textContent="☾",n}const r=t.createElementNS("http://www.w3.org/2000/svg","svg");r.setAttribute("class","xb-theme-icon"),r.setAttribute("viewBox","0 0 24 24"),r.setAttribute("fill","none"),r.setAttribute("stroke","currentColor"),r.setAttribute("stroke-linecap","round"),r.setAttribute("stroke-linejoin","round"),r.setAttribute("aria-hidden","true"),r.setAttribute("stroke-width","1.75");const o=t.createElementNS("http://www.w3.org/2000/svg","circle");return o.setAttribute("cx","12"),o.setAttribute("cy","12"),o.setAttribute("r","4"),r.appendChild(o),["M12 2v2","M12 20v2","m4.93 4.93 1.41 1.41","m17.66 17.66 1.41 1.41","M2 12h2","M20 12h2","m6.34 17.66-1.41 1.41","m19.07 4.93-1.41 1.41"].forEach(n=>r.appendChild(Ri(t,n))),r}function _i(t,e){const r=e.colorTheme==="light"?"light":"dark";t.querySelectorAll(".xb-ebook-shell, .xb-ebook-screen").forEach(n=>{n.classList.toggle("theme-light",r==="light"),n.classList.toggle("theme-dark",r!=="light")});const o=r==="light"?"切换为深色视觉":"切换为白底黑字";t.querySelectorAll("#xb-theme-toggle, [data-theme-toggle]").forEach(n=>{n.replaceChildren(Ii(n.ownerDocument||document,r)),n.setAttribute("title",o),n.setAttribute("aria-label",o)})}function Mi(t){const e=document,r=e.createElement("input");r.type="file",r.accept=".xbebook.json,.json,application/json",r.style.position="fixed",r.style.left="-9999px",r.style.opacity="0",r.addEventListener("change",()=>{const o=r.files?.[0]||null;r.remove(),o&&t.importBookPackageFile(o)},{once:!0}),r.addEventListener("cancel",()=>r.remove(),{once:!0}),e.body.appendChild(r),r.click()}function Sr(t=[],e="",r=!1){const o=String(e||"").trim(),n=new Set(Array.isArray(t)?t:[]);return o?(r?n.add(o):n.delete(o),[...n]):[...n]}function nt(t,e){return t?.closest?.(e)||null}var zt="__xiaobaixEbookDelegatedBindings";function Di(t){const e=t?.[zt];if(e){try{e.abortController?.abort?.()}catch(r){console.warn({source:import.meta.url,operation:"clearDelegatedRootBindings"},r)}t.removeEventListener?.("toggle",e.handleToggle,!0),t.removeEventListener?.("click",e.handleClick),t[zt]=null}}function Ni(t,e={}){if(!t?.addEventListener)return;Di(t);const r=typeof AbortController=="function"?new AbortController:null,o=r?{capture:!0,signal:r.signal}:!0,n=r?{signal:r.signal}:void 0;t.addEventListener("toggle",e.handleToggle,o),t.addEventListener("click",e.handleClick,n),t[zt]={abortController:r,handleToggle:e.handleToggle,handleClick:e.handleClick}}async function Oi(t=""){const e=String(t||"");if(!e)return!1;try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),!0}catch(r){console.debug({source:import.meta.url,operation:"copyText"},r)}try{const r=document.createElement("textarea");r.value=e,r.setAttribute("readonly","readonly"),r.style.position="fixed",r.style.opacity="0",r.style.pointerEvents="none",document.body.appendChild(r),r.select(),r.setSelectionRange(0,r.value.length);const o=document.execCommand("copy");return r.remove(),o}catch{return!1}}function zi(t={}){return t&&["user","assistant"].includes(t.role)&&!t.streaming&&String(t.content||"").trim()&&!(Array.isArray(t.toolCalls)&&t.toolCalls.length)}function qi(t=[],e=-1){if(!Array.isArray(t)||e<0||t[e]?.role!=="user")return e+1;let r=e+1;for(;r<t.length&&t[r]?.role!=="user";)r+=1;return r}function Fi(t={}){return!!(t.isDrawingChapter||!t.isBusy&&/^book\/chapters\/.+\.md$/.test(String(t.selectedPath||""))&&t.drawStatus?.enabled&&t.drawStatus?.ready&&String(t.editorContent||"").replace(/\[ebook-image:[a-z0-9\-_]+\]/gi,"").trim())}function Tr(t,e=""){return!!(t&&t.isConnected!==!1&&String(t.dataset?.ebookImageSlot||"").trim()===e)}function ji(t,e){t.querySelectorAll("[data-ebook-image-slot]").forEach(r=>{const o=String(r.dataset.ebookImageSlot||"").trim();o&&e.getDrawImage(o).then(n=>{if(!Tr(r,o))return;if(!n?.hasData||!n.url){r.classList.add("is-failed");const i=document.createElement("div");i.className="xb-reader-image-placeholder",i.textContent=n?.isFailed?n.errorMessage||"配图生成失败":"配图未找到",r.replaceChildren(i);return}r.classList.add("is-loaded");const a=document.createElement("img");a.src=n.url,a.alt=n.tags?`章节配图：${n.tags}`:"章节配图",a.loading="lazy",r.replaceChildren(a)}).catch(()=>{if(!Tr(r,o))return;r.classList.add("is-failed");const n=document.createElement("div");n.className="xb-reader-image-placeholder",n.textContent="配图加载失败",r.replaceChildren(n)})})}function Hi(t={}){const{root:e,state:r,render:o,renderAgentSurface:n,renderSettingsSurface:a,postToHost:i,bookController:s,agentRunner:l,persistConversation:b,clearConversation:y,showToast:f,hydrateStartup:C}=t;if(!e)return;e.querySelector("#xb-close")?.addEventListener("click",()=>i("xb-ebook:close")),e.querySelector("#xb-library-link")?.addEventListener("click",()=>{s.showLibrary()}),e.querySelector("#xb-library-retry-shelf")?.addEventListener("click",()=>{C?.()}),e.querySelector("#xb-library-new-book")?.addEventListener("click",()=>{r.isShelfLoading||r.shelfLoadError||s.createNewBook()}),e.querySelector("#xb-library-transfer-book")?.addEventListener("click",()=>{r.isShelfLoading||r.shelfLoadError||r.isBusy||r.bookTransferProgress||(r.isBookTransferMenuOpen=!0,o())}),e.querySelector("#xb-book-transfer-menu-close")?.addEventListener("click",()=>{r.isBookTransferMenuOpen=!1,o()}),e.querySelector("#xb-book-transfer-menu-overlay")?.addEventListener("click",u=>{u.target===u.currentTarget&&(r.isBookTransferMenuOpen=!1,o())}),e.querySelector("#xb-book-transfer-upload")?.addEventListener("click",()=>{r.isShelfLoading||r.shelfLoadError||r.isBusy||r.bookTransferProgress||(r.isBookTransferMenuOpen=!1,o(),Mi(s))}),e.querySelector("#xb-book-transfer-download")?.addEventListener("click",()=>{r.isShelfLoading||r.shelfLoadError||r.isBusy||r.bookTransferProgress||(r.isBookTransferMenuOpen=!1,s.openExportDialog())}),e.querySelector("#xb-library-delete-book")?.addEventListener("click",()=>{r.isDeleteBookOpen=!0,o()}),e.querySelector("#xb-delete-book-close")?.addEventListener("click",()=>{r.isDeleteBookOpen=!1,o()}),e.querySelector("#xb-delete-book-overlay")?.addEventListener("click",u=>{u.target===u.currentTarget&&(r.isDeleteBookOpen=!1,o())}),e.querySelector("#xb-book-export-close")?.addEventListener("click",()=>{s.closeExportDialog()}),e.querySelector("#xb-book-export-overlay")?.addEventListener("click",u=>{u.target===u.currentTarget&&s.closeExportDialog()}),e.querySelectorAll("[data-export-book-id]").forEach(u=>{u.addEventListener("click",()=>{s.exportBookPackage(u.dataset.exportBookId||"")})}),e.querySelectorAll("[data-delete-book-id]").forEach(u=>{u.addEventListener("click",()=>{s.removeBook(u.dataset.deleteBookId||"")})}),e.querySelectorAll("#xb-entry-link, [data-entry-link]").forEach(u=>{u.addEventListener("click",()=>{s.showBookEntry()})}),e.querySelector("#xb-studio-link")?.addEventListener("click",()=>{s.showStudio()}),e.querySelector("#xb-studio-empty-link")?.addEventListener("click",()=>{s.showStudio()}),e.querySelector("#xb-reader-link")?.addEventListener("click",()=>{s.showReader()}),e.querySelector("#xb-reader-tts-toggle")?.addEventListener("click",()=>{s.toggleReaderTts()}),e.querySelector("#xb-draw-chapter")?.addEventListener("click",()=>{s.drawCurrentChapter()}),e.querySelector("#xb-new-book")?.addEventListener("click",()=>{s.createNewBook()}),e.querySelector("#xb-new-file")?.addEventListener("click",()=>{s.createNewFile()}),e.querySelectorAll("[data-book-rename]").forEach(u=>{u.addEventListener("click",()=>{s.renameCurrentBook()})}),e.querySelector("#xb-save")?.addEventListener("click",()=>{s.saveCurrentFile()}),e.querySelectorAll("#xb-agent-close, #xb-agent-close-mobile").forEach(u=>{u.addEventListener("click",()=>i("xb-ebook:close"))}),e.querySelectorAll("#xb-theme-toggle, [data-theme-toggle]").forEach(u=>{u.addEventListener("click",()=>{r.colorTheme=r.colorTheme==="light"?"dark":"light";try{globalThis.localStorage?.setItem(Ti,r.colorTheme)}catch(x){console.warn({source:import.meta.url,operation:"bindEbookEvents"},x)}_i(e,r),o()})}),e.querySelector("#xb-agent-open-settings")?.addEventListener("click",()=>{r.isSettingsOpen=!0,r.configFormSyncPending=!0,a?.()||o()}),e.querySelector("#xb-agent-settings-close")?.addEventListener("click",()=>{r.isSettingsOpen=!1,a?.()||o()}),e.querySelector("#xb-agent-clear")?.addEventListener("click",async()=>{r.isBusy||(await y?.(r.book?.id),f?.("创作对话已清空"),o())}),e.querySelectorAll(".xb-book").forEach(u=>{u.addEventListener("click",()=>{s.selectBook(u.dataset.bookId||"")})}),e.querySelectorAll(".xb-library-book").forEach(u=>{u.addEventListener("click",()=>{if(r.isShelfLoading||r.shelfLoadError)return;const x=u.dataset.bookId||"";x&&s.selectBook(x)})}),e.querySelectorAll("[data-studio-layout]").forEach(u=>{u.addEventListener("click",()=>{const x=String(u.dataset.studioLayout||"balanced");r.studioLayout=["focus-editor","focus-agent"].includes(x)?x:"balanced";const j=e.querySelector(".xb-studio-shell");j?.classList.remove("balanced","focus-editor","focus-agent"),j?.classList.add(r.studioLayout),e.querySelectorAll("[data-studio-layout]").forEach(q=>{q.classList.toggle("is-active",q.dataset.studioLayout===r.studioLayout)})})}),e.querySelectorAll("[data-entry-action]").forEach(u=>{u.addEventListener("click",()=>{if(u.dataset.entryAction==="reader"){s.showReader();return}s.showStudio()})}),e.querySelectorAll("[data-reader-path]").forEach(u=>{u.addEventListener("click",()=>{e.querySelector(".xb-reader-screen")?.classList.remove("is-reader-index-open"),s.selectReaderChapter(u.dataset.readerPath||"")})}),e.querySelector("#xb-mobile-file-picker")?.addEventListener("click",()=>{e.querySelector(".xb-studio-shell")?.classList.add("is-file-drawer-open"),Li(e)}),e.querySelectorAll("[data-mobile-file-drawer-close]").forEach(u=>{u.addEventListener("click",()=>{e.querySelector(".xb-studio-shell")?.classList.remove("is-file-drawer-open")})}),e.querySelector("#xb-reader-index-toggle")?.addEventListener("click",()=>{e.querySelector(".xb-reader-screen")?.classList.add("is-reader-index-open")}),e.querySelector("#xb-reader-index-close")?.addEventListener("click",()=>{e.querySelector(".xb-reader-screen")?.classList.remove("is-reader-index-open")}),e.querySelector("#xb-reader-index-scrim")?.addEventListener("click",()=>{e.querySelector(".xb-reader-screen")?.classList.remove("is-reader-index-open")}),e.querySelectorAll("[data-home-action]").forEach(u=>{u.addEventListener("click",()=>{switch(u.dataset.homeAction){case"start-writing":s.selectFile("book/chapters/001.md");break;case"open-outline":s.selectFile("book/outline.md");break;case"import-chat":s.importMaterial("chat");break;case"back-library":s.showLibrary();break;default:break}})}),e.querySelectorAll("[data-action]").forEach(u=>{u.addEventListener("click",()=>{const x=or(u.dataset.action||"",{selectedPath:r.selectedPath});l.runAgent(x)})});function $(u,x,j){if(!Number.isInteger(u)||u<0||!x)return;const q=`${x}:${u}`;He.has(q)&&(clearTimeout(He.get(q)),He.delete(q)),r.messageActionFeedback={...r.messageActionFeedback||{},[q]:j?"success":"error"},o();const G=window.setTimeout(()=>{He.delete(q);const Y={...r.messageActionFeedback||{}};delete Y[q],r.messageActionFeedback=Y,o()},1200);He.set(q,G)}async function B(u){const x=Number.parseInt(u.dataset.messageIndex||"",10),j=String(u.dataset.messageAction||"").trim();if(!Number.isInteger(x)||x<0||!j||r.isBusy&&j!=="cancel-edit")return;const q=r.messages[x];if(zi(q)){if(j==="copy"){const G=await Oi(q.content);$(x,j,G),f?.(G?"已复制整条消息":"复制失败");return}if(j==="edit"){if(r.isBusy)return;r.editingMessageIndex=x,o();const G=e.querySelector(`.xb-msg[data-message-index="${x}"] .xb-msg-editor`);G?.focus(),G?.setSelectionRange(G.value.length,G.value.length);return}if(j==="cancel-edit"){r.editingMessageIndex=-1,o();return}if(j==="save-edit"){if(r.isBusy)return;const G=e.querySelector(`.xb-msg[data-message-index="${x}"] .xb-msg-editor`),Y=String(G?.value||"").trim();if(!Y){f?.("消息内容不能为空");return}r.messages[x]={...q,content:Y},r.editingMessageIndex=-1,await b?.(r.book?.id),f?.("消息已更新"),o();return}if(j==="delete"){if(r.isBusy)return;q.role==="user"?r.messages.splice(x,qi(r.messages,x)-x):r.messages.splice(x,1),r.editingMessageIndex=-1,await b?.(r.book?.id),f?.("消息已删除"),o();return}if(j==="reroll"){if(r.isBusy)return;(await l.rerunFromMessageIndex(x))?.ok===!1&&f?.("这条消息前没有可重跑的用户输入")}}}Ni(e,{handleToggle:u=>{const x=u.target;if(x?.matches?.("details.xb-tool-turn[data-tool-turn-key], .xb-thought-details[data-thought-key]")){if(x.matches("details.xb-tool-turn[data-tool-turn-key]")){const j=x.dataset.lazyToolTurn==="true";r.openToolTurnKeys=Sr(r.openToolTurnKeys,x.dataset.toolTurnKey||"",x.open),(j||!x.open)&&(U(),n());return}r.isBusy&&x.dataset.autoOpenThought==="true"||(r.openThoughtKeys=Sr(r.openThoughtKeys,x.dataset.thoughtKey||"",x.open))}},handleClick:u=>{const x=nt(u.target,"[data-message-action][data-message-index]");if(x){u.preventDefault?.(),me(B(x),{source:import.meta.url,operation:"handleDelegatedClick"});return}const j=nt(u.target,"[data-chapter-sort-toggle]");if(j&&e.contains(j)){u.preventDefault?.(),s.toggleChapterSortOrder();return}const q=nt(u.target,".xb-file[data-path]");if(q&&e.contains(q)){u.preventDefault?.(),e.querySelector(".xb-studio-shell")?.classList.remove("is-file-drawer-open"),s.selectFile(q.dataset.path||"");return}const G=nt(u.target,"[data-import]");G&&e.contains(G)&&!G.disabled&&(u.preventDefault?.(),s.importMaterial(G.dataset.import||""))}});const _=e.querySelector("#xb-editor-text");_?.addEventListener("keydown",u=>{Pi(u)&&(u.preventDefault(),s.saveCurrentFile())}),_?.addEventListener("input",()=>{r.editorContent=_.value;const u=e.querySelector("#xb-save");u&&(u.disabled=r.isBusy||!s.isEditorDirty());const x=e.querySelector("#xb-draw-chapter");x&&(x.disabled=!Fi(r)),Bi(e,r,s)});const g=e.querySelector("#xb-agent-input");g?.addEventListener("input",()=>{r.agentInputDraft=g.value,vr(e),Pt(e)}),g?.addEventListener("keydown",u=>{Ci(u)&&(u.preventDefault(),e.querySelector("#xb-agent-form")?.requestSubmit())}),vr(e),Pt(e),e.querySelector("#xb-agent-form")?.addEventListener("submit",u=>{if(u.preventDefault(),r.isBusy){l.cancelActiveRun();return}const x=e.querySelector("#xb-agent-input"),j=String(x?.value||r.agentInputDraft||"").trim();j&&(r.agentInputDraft="",x&&(x.value=""),Pt(e),l.runAgent(or("custom",{text:j,selectedPath:r.selectedPath})))});let k=null,S=!1;const m=e.querySelector(".xb-agent-main"),T=e.querySelector("#xb-agent-scroll-top"),P=e.querySelector("#xb-agent-scroll-bottom"),w=e.querySelector("#xb-agent-scroll-helpers");let W=null,K=Number(m?.scrollTop||0);function ne(u){if(!u)return;const x=()=>{u.scrollTop=u.scrollHeight};x(),Ke(()=>{x(),Ke(x)})}function ee(){return Number(r.uiMessageWindowLimit||0)<=5?!1:(gt(r),o(),ne(e.querySelector(".xb-agent-main")),!0)}function ae(u=48){return m?m.scrollHeight-m.scrollTop-m.clientHeight<=u:!0}function te(u=4){return m?m.scrollHeight-m.scrollTop-m.clientHeight<=u:!0}function U(){r.agentAutoScroll=!1}function ue(){if(!m||m.scrollTop>64||!nn(r,Pa(r.messages||[])))return!1;const u=m.scrollHeight,x=m.scrollTop;o();const j=()=>{const q=e.querySelector(".xb-agent-main");q&&(q.scrollTop=Math.max(0,q.scrollHeight-u+x))};return j(),Ke(j),!0}function Q(){if(!m||!T||!P)return;const u=80,x=m.scrollTop,j=m.scrollHeight,q=m.clientHeight;T.classList.toggle("visible",x>u),P.classList.toggle("visible",j-x-q>u)}function D(){w?.classList.add("active")}function z(){w?.classList.remove("active")}function V(){k&&clearTimeout(k),k=setTimeout(()=>{z(),k=null},1500),k?.unref?.()}function ie(){if(!m)return;if(ue()){r.agentAutoScroll=!1;return}const u=Number(m.scrollTop||0),x=u>K;K=u;const j=ae();if(te()){if((r.agentAutoScroll!==!1||x)&&(r.agentAutoScroll=!0,ee()))return}else j&&r.agentAutoScroll!==!1?r.agentAutoScroll=!0:r.agentAutoScroll=!1;S||(S=!0,Ke(()=>{Q(),D(),V(),S=!1}))}m?.addEventListener("scroll",()=>{ie()}),m?.addEventListener("wheel",u=>{Number(u?.deltaY||0)<0&&U()},{passive:!0}),m?.addEventListener("touchstart",u=>{W=Number(u?.touches?.[0]?.clientY)},{passive:!0}),m?.addEventListener("touchmove",u=>{const x=Number(u?.touches?.[0]?.clientY);if(!Number.isFinite(W)||!Number.isFinite(x)){U();return}(x>W+4||!ae())&&U()},{passive:!0}),T?.addEventListener("click",()=>{r.agentAutoScroll=!1,m?.scrollTo({top:0,behavior:"smooth"}),D(),Q(),V()}),P?.addEventListener("click",()=>{r.agentAutoScroll=!0,ee()||ne(m),D(),Q(),V()}),Q(),ji(e,s)}var Wi=5e3,Ui=1800,Ki=/^book\/chapters\/.+\.md$/,Gi=/\[ebook-image:[a-z0-9\-_]+\]/gi;function qt(t=""){return Ki.test(String(t||""))}function Er(t=""){return String(t||"").replace(Gi,"").trim()}function Ao(t=""){return t===".xb-agent-main"?{attr:"data-agent-unit-key",datasetKey:"agentUnitKey"}:t===".xb-reader-paper"?{attr:"data-reader-block-key",datasetKey:"readerBlockKey"}:null}function Ar(t="",e=""){return t===".xb-agent-main"&&String(e||"").startsWith("history-gate:")}function $r(t={},e=null){return t.agentForceScrollBottomOnce?!0:t.agentAutoScroll===!1?!1:!e||e.nearBottom!==!1}function We(t,e){const r=t?.querySelector?.(e);if(!r)return null;const o=r.scrollHeight-r.scrollTop-r.clientHeight,n=typeof r.getBoundingClientRect=="function"?r.getBoundingClientRect():null,a=Ao(e),i=n&&a?Array.from(r.querySelectorAll?.(`[${a.attr}]`)||[]).map(b=>({key:b?.dataset?.[a.datasetKey]||"",rect:typeof b?.getBoundingClientRect=="function"?b.getBoundingClientRect():null})).filter(b=>b.key&&b.rect&&b.rect.bottom>=n.top+1&&b.rect.top<=n.bottom-1):[],s=[...i.filter(b=>!Ar(e,b.key)),...i.filter(b=>Ar(e,b.key))].map(b=>({key:b.key,topOffset:b.rect?b.rect.top-n.top:0})),l=s[0]||null;return{selector:e,scrollTop:r.scrollTop,nearBottom:o<80,distanceToBottom:o,scrollHeight:r.scrollHeight,clientHeight:r.clientHeight,anchorKey:l?.key||"",anchorTopOffset:l?.topOffset||0,anchors:s}}function Ue(t,e,r=null,o={}){const n=e?.selector||r;if(!n)return;const a=t?.querySelector?.(n);if(a){if(o.forceBottom){a.scrollTop=a.scrollHeight;return}if(!e){o.defaultToBottom!==!1&&(a.scrollTop=a.scrollHeight);return}if(o.preserveScrollTop){a.scrollTop=Math.min(Math.max(0,e.scrollTop),a.scrollHeight);const i=e.anchors?.length?e.anchors:e.anchorKey?[{key:e.anchorKey,topOffset:e.anchorTopOffset}]:[];if(i.length&&o.preserveAnchor!==!1){const s=Ao(n),l=typeof a.getBoundingClientRect=="function"?a.getBoundingClientRect():null,b=s?Array.from(a.querySelectorAll?.(`[${s.attr}]`)||[]):[],y=i.map(f=>{const C=b.find(B=>B?.dataset?.[s.datasetKey]===f.key),$=typeof C?.getBoundingClientRect=="function"?C.getBoundingClientRect():null;return $?{rect:$,topOffset:f.topOffset}:null}).find(Boolean);if(l&&y){const f=y.rect.top-l.top;a.scrollTop=Math.min(Math.max(0,a.scrollTop+f-Number(y.topOffset||0)),a.scrollHeight)}}return}a.scrollTop=e.nearBottom?a.scrollHeight:Math.min(e.scrollTop,a.scrollHeight)}}function Yi(t="",e="",r=""){return e==="reader"&&String(t||"")!==String(r||"")&&qt(r)}function Xi(t){const e=t?.querySelector?.(".xb-agent-main"),r=t?.querySelector?.("#xb-agent-scroll-top"),o=t?.querySelector?.("#xb-agent-scroll-bottom");if(!e||!r||!o)return;const n=80,a=Number(e.scrollTop||0),i=e.scrollHeight-a-e.clientHeight;r.classList.toggle("visible",a>n),o.classList.toggle("visible",i>n)}function ye(t=""){const e=document.createElement("template");return e.innerHTML=String(t||"").trim(),e.content.firstElementChild||document.createTextNode("")}function Ge(t){return Array.from(t?.children||[]).filter(e=>e?.classList?.contains?.("xb-file")&&e?.dataset?.path)}function Ji(t,e=""){return Array.from(t?.children||[]).find(r=>r?.classList?.contains?.("xb-file-group")&&r?.dataset?.fileGroupKey===e)||null}function Vi(t,e={}){const r=ye(e.scaffoldHtml);Ge(t).forEach(n=>r.appendChild(n));const o=Array.from(t.children||[]).find(n=>n?.dataset?.fileGroupEmpty==="true");return o&&r.appendChild(o),t.replaceWith(r),r}function Zi(t,e={}){if(!t)return;if(e.treeHtml){const n=ye(e.treeHtml),a=Array.from(t.children||[]).find(i=>i?.classList?.contains?.("xb-file-tree"));if(!a)t.appendChild(n);else if(a.dataset.fileTreeSignature!==n.dataset.fileTreeSignature)a.replaceWith(n);else{const i=new Set((e.files||[]).filter(s=>s.active).map(s=>s.path));a.querySelectorAll(".xb-file[data-path]").forEach(s=>{s.classList.toggle("is-active",i.has(s.dataset.path||""))})}return}const r=new Set((e.files||[]).map(n=>n.path));Ge(t).forEach(n=>{r.has(n.dataset.path||"")||n.remove()});const o=Array.from(t.children||[]).find(n=>n?.dataset?.fileGroupEmpty==="true");if(!e.files?.length){Ge(t).forEach(n=>n.remove()),o||t.appendChild(ye(e.emptyHtml));return}o?.remove(),e.files.forEach((n,a)=>{let i=Ge(t).find(l=>l.dataset.path===n.path);if(!i)i=ye(n.html);else if(i.dataset.fileSignature!==n.signature){const l=ye(n.html);i.replaceWith(l),i=l}i.dataset.fileSignature=n.signature,i.classList.toggle("is-active",!!n.active);const s=Ge(t)[a]||null;s&&s!==i?t.insertBefore(i,s):s||t.appendChild(i)})}function Qi(t="req"){return`${t}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}function es(t={}){const{rootId:e,hostBridge:r}=t,o=Ai();let n=null,a=null,i=[],s="";const l={fullRender:0,agentSurface:0,toolTraceSurface:0,filesSurface:0,editorSurface:0};try{globalThis.__xiaobaixEbookPerfCounters=l}catch(d){console.warn({source:import.meta.url,operation:"createEbookApp"},d)}function b(d=""){Object.prototype.hasOwnProperty.call(l,d)&&(l[d]+=1)}function y(d={}){return wi(o.config,d)}function f(d=y()){return Si(d)}function C(d=""){o.toast=String(d||""),V()||x(),o.toast&&setTimeout(()=>{o.toast===d&&(o.toast="",V()||x())},2200)}function $(d){return d instanceof Error?d.message:String(d||"unknown_error")}function B(){n&&(clearTimeout(n),n=null),a&&(clearTimeout(a),a=null)}function R(d=Ui){a&&clearTimeout(a),a=setTimeout(()=>{a=null,o.configSave={status:"idle",requestId:"",error:""},z()||x()},d)}function M(d){B(),o.configSave={status:"saving",requestId:d,error:""},n=setTimeout(()=>{n=null,!(o.configSave.requestId!==d||o.configSave.status!=="saving")&&(o.configSave={status:"error",requestId:d,error:"保存超时，请重试"},T.completePresetSave(d,{ok:!1}),z()||x(),R())},Wi),z()||x()}function _(d,{ok:E,error:L=""}={}){d&&o.configSave.requestId&&o.configSave.requestId!==d||(n&&(clearTimeout(n),n=null),o.configSave={status:E?"success":"error",requestId:d||o.configSave.requestId||"",error:E?"":String(L||"保存失败")},z()||x(),R())}let g,k,S=null;const m=vi({state:o}),T=Vo({state:o,render:()=>{z()||x()},showToast:C,createRequestId:Qi,describeError:$,saveConfig:async({requestId:d,config:E,payload:L})=>{M(d);try{const H=await r.requestHost("xb-ebook:save-config",L);if(o.configSave.requestId!==d||o.configSave.status!=="saving")return;const N=Ot(H?.config||E||{});o.configLoadError="",T.completePresetSave(d,{ok:!0,config:N})||(o.config=N,o.configDraft=null,o.configDirty=!1,o.configFormSyncPending=!0),_(d,{ok:!0}),C("配置已保存"),z()||x(),ne()||W()}catch(H){T.completePresetSave(d,{ok:!1}),_(d,{ok:!1,error:$(H)}),C($(H))}},getRuntimeSummaryText:({providerLabel:d})=>d});function P(d){const E=document.activeElement;if(!E||!d?.contains?.(E))return null;const L=String(E.id||"").trim();return L?{id:L,selectionStart:Number.isFinite(E.selectionStart)?E.selectionStart:null,selectionEnd:Number.isFinite(E.selectionEnd)?E.selectionEnd:null}:null}function w(d,E){if(!E?.id)return;const L=document.getElementById(E.id);if(!(!L||!d?.contains?.(L))){try{L.focus({preventScroll:!0})}catch{L.focus?.()}if(Number.isFinite(E.selectionStart)&&Number.isFinite(E.selectionEnd)&&typeof L.setSelectionRange=="function")try{L.setSelectionRange(E.selectionStart,E.selectionEnd)}catch(H){console.warn({source:import.meta.url,operation:"restoreFocusState"},H)}}}function W(){const d=document.getElementById(e);if(!d||o.viewMode!=="studio")return!1;const E=d.querySelector(".xb-studio-shell"),L=d.querySelector(".xb-agent-main"),H=d.querySelector(".xb-agent-log");if(!E||!L||!H)return!1;const N=d.querySelector(".xb-agent-context-meter");if(N){const v=y();N.textContent=oo(o,v),N.title=no(o,v)}const Z=We(d,".xb-agent-main"),h=$r(o,Z);L.classList.toggle("is-busy",!!o.isBusy),i=mo(H,i,Nt(o),v=>v.querySelectorAll?.(".xb-msg-markdown, .xb-tool-preface-markdown").forEach(O=>{kt(O,{codeBlockClassName:"xb-assistant-codeblock",codeCopyClassName:"xb-assistant-code-copy"}),O.dataset.markdownEnhanced="true"})),H.querySelectorAll(".xb-msg-markdown, .xb-tool-preface-markdown").forEach(v=>{v.dataset.markdownEnhanced!=="true"&&(kt(v,{codeBlockClassName:"xb-assistant-codeblock",codeCopyClassName:"xb-assistant-code-copy"}),v.dataset.markdownEnhanced="true")});const c=d.querySelector('#xb-agent-form button[type="submit"]');c&&(c.classList.toggle("is-busy",!!o.isBusy),c.textContent=o.isCancellingRun?"…":o.isBusy?"■":"➤",c.title=o.isCancellingRun?"正在停止":o.isBusy?"停止":"发送",c.setAttribute("aria-label",c.title),o.isBusy&&(c.disabled=!!o.isCancellingRun));const A=d.querySelector("#xb-agent-clear");if(A){const v=!!o.messages?.length;A.disabled=o.isBusy||!v}return Ue(d,Z,".xb-agent-main",{forceBottom:h,defaultToBottom:h,preserveScrollTop:!h}),o.agentForceScrollBottomOnce=!1,Xi(d),b("agentSurface"),!0}function K(){const d=W();return d&&b("toolTraceSurface"),d}function ne(){const d=document.getElementById(e);if(!d||o.viewMode!=="studio")return!1;const E=d.querySelector(".xb-studio-shell"),L=d.querySelector("#xb-agent-input"),H=d.querySelector('#xb-agent-form button[type="submit"]');if(!E||!L||!H)return!1;const N=Qr(y()),Z=!o.isBusy&&N.canRun;return L.disabled=!Z,L.placeholder=N.canRun?"写作指令，例如：把当前段落改得更克制一点，或者先列三种开场方案":"先补好 API 和模型信息",H.disabled=!Z,d.querySelectorAll("[data-action]").forEach(h=>{h.disabled=!Z}),!0}function ee(d){const E=Te(o.selectedPath||"book/chapters/001.md"),L=d.querySelector("#xb-mobile-file-picker strong"),H=d.querySelector(".xb-path");L&&(L.textContent=E),H&&(H.textContent=E)}function ae(d){const E=d.querySelector("#xb-editor-text");if(!E)return;const L=document.activeElement;E.disabled=!!o.isBusy,L!==E&&E.value!==o.editorContent&&(E.value=o.editorContent||"")}function te(d){const E=g.isEditorDirty(),L=d.querySelector("#xb-save"),H=d.querySelector("#xb-draw-chapter");if(L&&(L.disabled=!(E&&!o.isBusy)),!H)return;const N=o.drawStatus||{},Z=qt(o.selectedPath),h=!!N.enabled&&!!N.ready,c=!!(o.isDrawingChapter||!o.isBusy&&Z&&h&&Er(o.editorContent)),A=o.isDrawingChapter?"停止当前章节配图":Z?h?Er(o.editorContent)?"为当前章节生成配图":"当前章节没有正文":"画图后端未启用":"只有正文章节可以配图";H.disabled=!c,H.textContent=o.isDrawingChapter?"停止":"配图",H.title=A,H.setAttribute("aria-label",A)}function U(d){const E=d.querySelector("#xb-editor-meta");if(!E)return;const L=g.isEditorDirty(),H=o.drawProgressText?` · ${o.drawProgressText}`:"";E.textContent=`${L?"有未保存修改":"已保存到书库"} · ${Ut(o.editorContent||"")}${H}`}function ue(){const d=document.getElementById(e);return!d||o.viewMode!=="studio"||!d.querySelector(".xb-studio-shell")?!1:(ee(d),ae(d),te(d),U(d),b("editorSurface"),!0)}function Q(){const d=document.getElementById(e);if(!d||o.viewMode!=="studio")return!1;const E=d.querySelector(".xb-studio-shell"),L=d.querySelector(".xb-files");if(!E||!L)return!1;const H=co(o,{writeActionAttr:o.isBusy?"disabled":""});if(H.emptyHtml)(L.dataset.fileRenderMode!=="empty"||L.textContent.trim()!=="还没有书稿文件")&&(L.replaceChildren(ye(H.emptyHtml)),L.dataset.fileRenderMode="empty");else{L.dataset.fileRenderMode="sections";const h=new Set(H.groups.map(c=>c.key));Array.from(L.children).forEach(c=>{c?.classList?.contains?.("xb-file-group")||c.remove()}),H.groups.forEach((c,A)=>{let v=Ji(L,c.key);v?v.dataset.fileStaticSignature!==c.staticSignature&&(v=Vi(v,c)):v=ye(c.scaffoldHtml),v.dataset.fileStaticSignature=c.staticSignature;const O=L.children[A]||null;O&&O!==v?L.insertBefore(v,O):O||L.appendChild(v),Zi(v,c)}),Array.from(L.children).forEach(c=>{c?.classList?.contains?.("xb-file-group")&&!h.has(c.dataset.fileGroupKey||"")&&c.remove()})}const N=o.book?.title||"未命名书稿",Z=d.querySelector(".xb-title-row h1");return Z&&(Z.textContent=N),b("filesSurface"),!0}function D(){const d=document.getElementById(e);return!d||o.viewMode!=="studio"||!d.querySelector(".xb-studio-shell")?!1:(ee(d),ae(d),te(d),U(d),b("editorSurface"),!0)}function z(){const d=document.getElementById(e);if(!d)return!1;const E=d.querySelector("#xb-agent-settings-overlay");if(!o.isSettingsOpen)return E?.remove(),!0;const L=We(d,".xb-ebook-settings-body"),H=P(d),N=!!E,Z=ye(go(o));return E?E.replaceWith(Z):(d.querySelector(".xb-ebook-shell, .xb-ebook-screen")||d).appendChild(Z),T.syncConfigToForm(d),o.configFormSyncPending=!1,T.bindSettingsPanelEvents(d),d.querySelector("#xb-agent-settings-close")?.addEventListener("click",()=>{o.isSettingsOpen=!1,z()}),N&&L&&(Ue(d,L,".xb-ebook-settings-body",{defaultToBottom:!1}),w(d,H)),!0}function V(){const d=document.getElementById(e);if(!d)return!1;if(d.querySelectorAll(".xb-toast").forEach(L=>L.remove()),!o.toast)return!0;const E=ye(`<div class="xb-toast">${p(o.toast)}</div>`);return(d.querySelector(".xb-ebook-shell, .xb-ebook-screen")||d).appendChild(E),!0}function ie(){return!document.getElementById(e)||o.viewMode!=="reader"?!1:(V(),z(),!0)}function u(){const d=document.getElementById(e);if(!d||o.viewMode!=="studio")return!1;const E=d.querySelector(".xb-agent-chat-wrap");if(!E)return!1;E.querySelectorAll(".xb-protocol-notice").forEach(N=>N.remove());const L=String(o.protocolNotice?.message||"").trim();if(!L)return!0;const H=ye(`
            <div class="xb-protocol-notice" role="status" aria-live="polite">
                <span>${p(L)}</span>
            </div>
        `);return E.appendChild(H),!0}function x(){const d=document.getElementById(e);if(!d)return;b("fullRender");const E=We(d,".xb-agent-main"),L=We(d,".xb-reader-paper"),H=We(d,".xb-ebook-settings-body"),N=P(d),Z=!!d.querySelector(".xb-ebook-settings-body"),h=Yi(s,o.viewMode,o.readerPath);d.innerHTML=Ma({state:o,providerConfig:y(),dirty:g.isEditorDirty()});const c=d.querySelector(".xb-agent-log");i=c?fo(c,Nt(o)):[],d.querySelectorAll(".xb-msg-markdown, .xb-tool-preface-markdown").forEach(v=>{kt(v,{codeBlockClassName:"xb-assistant-codeblock",codeCopyClassName:"xb-assistant-code-copy"})}),o.isSettingsOpen&&(T.syncConfigToForm(d),o.configFormSyncPending=!1,T.bindSettingsPanelEvents(d)),Hi({root:d,state:o,render:x,renderAgentSurface:W,renderSettingsSurface:z,postToHost:r.postToHost,bookController:g,agentRunner:k,persistConversation:m.persistConversation,clearConversation:m.clearConversation,showToast:C,hydrateStartup:xe});const A=$r(o,E);if(Ue(d,E,".xb-agent-main",{forceBottom:A,defaultToBottom:A,preserveScrollTop:!A}),o.agentForceScrollBottomOnce=!1,Ue(d,L,".xb-reader-paper",{defaultToBottom:!1,preserveScrollTop:!0}),h){const v=d.querySelector(".xb-reader-paper");v&&(v.scrollTop=0)}if(o.isSettingsOpen){const v=d.querySelector(".xb-ebook-settings-body");v&&(Z&&H?Ue(d,H,".xb-ebook-settings-body",{defaultToBottom:!1}):v.scrollTop=0)}Z===o.isSettingsOpen&&w(d,N),s=o.viewMode==="reader"&&qt(o.readerPath)?o.readerPath:""}g=mi({state:o,render:x,renderStudioSurface:ue,renderFilesSurface:Q,requestHost:r.requestHost,showToast:C,conversationStore:m}),k=ei({state:o,refreshBooksAndFiles:g.refreshBooksAndFiles,render:x,renderAgentSurface:W,renderPassiveSurface:ie,renderToolTraceSurface:K,renderFilesSurface:Q,renderEditorFileSurface:D,showToast:C,persistConversation:m.persistConversation,isEditorDirty:g.isEditorDirty,getActiveProviderConfig:y,createAdapter:f,renderProtocolNoticeSurface:u});function j(d={}){if(o.configLoadError=String(d?.configLoadError||""),!d?.config||typeof d.config!="object"){x();return}o.config=Ot(d?.config||{}),o.configDraft=null,o.configDirty=!1,o.configFormSyncPending=!0,x()}function q(){o.isSettingsOpen=!0,o.configFormSyncPending=!0,z()||x()}function G(d={}){g.handleDrawProgress(d)}function Y(d={}){g.handleTtsState(d)}async function xe(d={}){return S||(o.isShelfLoading=!0,o.shelfLoadError="",o.status="正在打开书架...",d.renderInitial!==!1&&x(),S=(async()=>{try{await g.initializeBook(),o.isShelfLoading=!1,o.status="就绪",x(),g.refreshDrawStatus({renderAfter:!0}),g.refreshTtsStatus({renderAfter:!0})}catch(E){o.isShelfLoading=!1,o.shelfLoadError=E?.message||String(E||"shelf_load_failed"),o.status=`书架加载失败：${o.shelfLoadError}`,x()}finally{S=null}})(),S)}function Ae(){$i(e),o.isShelfLoading=!0,o.shelfLoadError="",o.status="正在打开书架...",x(),r.postToHost("xb-ebook:frame-ready"),me(xe({renderInitial:!1}),{source:import.meta.url,operation:"start"})}return{handleDrawProgress:G,handleHostConfig:j,handleOpenSettings:q,handleTtsState:Y,start:Ae,state:o}}function ts(t="req"){return`${t}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}function rs(t={}){const e=t.appSource||"xb-ebook-app",r=t.hostSource||"xb-ebook-host",o=Number(t.timeoutMs)||3e4,n=new Map;let a=null;function i(f,C={}){parent.postMessage({source:e,type:f,payload:C},window.location.origin)}function s(f,C={},$={}){const B=ts("host");return i(f,{...C,requestId:B}),new Promise((R,M)=>{const _=$.timeoutMs===null?null:Number($.timeoutMs)||o,g=$.signal;let k=!1;const S=_===null?null:setTimeout(()=>{k=!0,n.delete(B),g?.removeEventListener?.("abort",T),M(new Error("host_request_timeout"))},_),m=(P,w)=>{k||(k=!0,S!==null&&clearTimeout(S),g?.removeEventListener?.("abort",T),n.delete(B),P(w))},T=()=>{i("xb-ebook:cancel-request",{requestId:B}),m(M,new Error("已取消"))};n.set(B,{resolve:P=>m(R,P),reject:P=>m(M,P),timer:S}),g?.aborted?T():g?.addEventListener?.("abort",T,{once:!0})})}function l(f={}){const C=String(f?.requestId||""),$=n.get(C);if($)if(f?.ok===!1){const B=new Error(f?.error||"host_request_failed");B.payload=f,$.reject(B)}else $.resolve(f)}function b(f={}){if(a)return a;const C=typeof f.onConfig=="function"?f.onConfig:null,$=typeof f.onOpenSettings=="function"?f.onOpenSettings:null,B=typeof f.onDrawProgress=="function"?f.onDrawProgress:null,R=typeof f.onTtsState=="function"?f.onTtsState:null,M=_=>{if(_.origin!==window.location.origin||_.source!==parent)return;const g=_.data||{};if(g.source===r){if(g.type==="xb-ebook:config"){const k=g.payload?.hostRequestHeaders&&typeof g.payload.hostRequestHeaders=="object"?g.payload.hostRequestHeaders:{};Oo(async()=>{try{const S=await s("xb-ebook:get-host-request-headers",{},{timeoutMs:5e3});return S?.hostRequestHeaders&&typeof S.hostRequestHeaders=="object"?S.hostRequestHeaders:k}catch{return k}}),C?.(g.payload||{});return}if(g.type==="xb-ebook:open-settings"){$?.();return}if(g.type==="xb-ebook:host-result"){l(g.payload||{});return}if(g.type==="xb-ebook:draw-progress"){B?.(g.payload||{});return}g.type==="xb-ebook:tts-state"&&R?.(g.payload||{})}};return window.addEventListener("message",M),a=()=>{window.removeEventListener("message",M),a=null},a}function y(){a?.(),n.forEach(f=>{clearTimeout(f.timer),f.reject(new Error("ebook_host_bridge_disposed"))}),n.clear()}return{postToHost:i,requestHost:s,start:b,dispose:y}}var $o=rs(),Ye=es({rootId:ln,hostBridge:$o});$o.start({onConfig:Ye.handleHostConfig,onOpenSettings:Ye.handleOpenSettings,onDrawProgress:Ye.handleDrawProgress,onTtsState:Ye.handleTtsState});Ye.start();
