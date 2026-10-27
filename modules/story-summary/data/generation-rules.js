import { RELATION_TRENDS, FACTS_LIMIT_PER_SUBJECT } from './fact-predicates.js';
import { ARC_PROGRESS_MAX } from '../generate/arc-progress.js';

// Generation embeds these passages verbatim. Maintenance selects the content
// passages at the end; update protocol, output counts and field-schema notes stay out.

// 一、总结写作要求：生成与维护共用。调整时间、详略、文风时看这里。
export const SUMMARY_EVENT_STYLE_RULES = `### 卡片要求
- 每张卡片记一件有叙事价值的事。以后玩家随口提起它时，比如"上次在酒馆拍欠条那回"，系统靠卡片里的词把这张卡片找回来。所以卡片要留下玩家会用来指代这件事的东西：人名和原文称呼、地点、关键物件、具体动作、关系或态度的变化、约定或交换条件、被揭开的秘密；原文有关键原话时，再留一句 15 字以内的。
- "两人发生冲突""关系恶化"这类话放在哪件事上都成立，找不回具体那一次。要写清是谁、在哪、拿着什么、对谁做了什么、结果怎样。

### 时间写法
- 卡片以后会在别的时间被读到，timeLabel 和 summary 里的时间要让人知道说的是哪一天，而不是只写“今天、昨天、明晚”。
- 原文给了日期，就用原文日期；有年份就保留，原文和已有总结都没有交代年份时不补年份。
- 原文没有日期时，可以写“搬入新家的第二晚”这类能找到对应事件的说法。已有总结按“第3天”记时，就接着用同一套记法；日期和间隔都要有原文或已有总结的依据，不凭空推算。
- 时间标签示例：原文写“2026年6月12日”，就写“2026年6月12日”；原文只写“6月12日”且已有总结也未交代年份，就写“6月12日”。
- 原文明确当前为2026年6月12日，追问“昨晚”的去向并约定“明晚”见面时，分别写为2026年6月11日晚和2026年6月13日晚。

### 详略与篇幅
- 每张卡片写 1 句，事情确实多时写 2 句。两句都要有具体内容，第一句不用来铺垫。
- 写不下时，先舍弃气氛描写，其次是次要人物的反应，再次是心理描写；连续的动作可以压成结果。人名、地点、物件、关键动作和原话最后才删。
- 只写和这件事有关的名词。

### 文风和示例
- 用朴实、白描、有烟火气的笔触记录事实，避免比喻和意象
- 示例只示范写到多具体，不要求模仿题材、语气或句式
- 不合格：
  1. 二人在酒馆发生冲突，关系恶化。
  2. 两人有暧昧互动，并约定再次见面。
  3. 她揭示了一个秘密，对方受到打击。
- 合格：
  1. 苏晚在黑鹭酒馆当众把欠条拍到顾衡胸口，骂他拿她母亲的旧宅做赌注，顾衡想抓她手腕被她甩开，周围赌客起哄，两人彻底撕破脸。 (#120-123)
  2. 2026年6月12日，周柠在旅馆浴室门口盯着林雨锁骨上的咬痕，追问2026年6月11日晚和谁在一起，林雨一边整理湿透的白衬衫一边嘴硬否认，最后答应2026年6月13日晚还去旧码头见她。 (#88-91)`;

export function resolveSummaryStyle(summaryStyle) {
    return String(summaryStyle || '').trim() || SUMMARY_EVENT_STYLE_RULES;
}

const summaryStyleBlock = summaryStyle => `[Event Summary Style]\n${resolveSummaryStyle(summaryStyle)}`;

// 二、总结数据规则：分类、字段含义与增量更新协议。
export const SUMMARY_MEMORY_ROLE_RULES = `[Memory Role]
memoryRole describes what an event leaves for later context. Choose one role based on its main evidenced result:
- 状态变化: A status is established, changed or ended: identity, relationship, residence, ownership or ongoing circumstances.
- 约定承诺: A plan, promise, rule or responsibility is agreed, fulfilled or cancelled. An intention alone is not a completed state change.
- 信息揭示: Someone learns an identity, secret, reason or truth. Preserve who learned it in the summary.
- 偏好习惯: An explicitly stated preference, aversion or taboo, or a recurring behavior supported by the available history. A single action alone does not establish a habit.
- 具体经历: A recognizable interaction or experience, including daily life, conflict, comfort or adventure, whose main contribution is the episode itself.
These roles are different uses of memory, not importance levels. Choose the main result; keep other relevant details in the summary. Continuous actions and reactions about the same occurrence stay together rather than being split to fill roles.`;

export const SUMMARY_ARC_RULES = `[Arc Progress Tracking]
角色弧光记录一个角色在经历中逐渐发生的变化。本次新对话让某个角色的变化有了推进时，才输出这个角色的 arcUpdates。
- name：角色的正式名。
- trajectory：这个角色当前所处的阶段，15 字以内。
- progress：0～${ARC_PROGRESS_MAX} 的整数，和已有总结里显示的进度是同一刻度。
- newMoment：本次推动变化的那段经历；没有可写的就省略。`;

const FACT_CONTENT_RULES = `### 事实记录什么
- 事实记录剧情已经确认、之后会持续成立的情况，比如身份、生死、住在哪里、东西归谁、两人是什么关系、稳定的身体特征。角色扮演时，这些事实让角色前后一致。某一次发生了什么，记在事件卡片里。
- s 是主体，p 是记录哪一方面，o 是这一方面现在的完整情况。同一 s+p 只保存一条，新内容替换旧内容；同一方面沿用已有谓词，不另起同义的名称。

### 核心事实与普通事实
- 核心事实（isState: true）不按当前相关人物筛选，也不受普通事实的数量上限影响。普通事实（isState: false）会结合当前相关人物选择；每个主体最多保留 ${FACTS_LIMIT_PER_SUBJECT} 条，超出时先清理最早记录的。
- 按遗漏的后果分类：缺了它会让剧情出错的，记为核心事实，比如身份、生死、居住地、归属、关系状态、稳定的身体特征和约束后续行动的规则。持续时间长短不决定分类，影响行动能力的伤势、有明确期限的债务，遗漏同样会出错。其他已确认的事实记为普通事实。

### 身体特征
- 外貌统一用谓词 p="身体特征"，只记录稳定、有辨识度的特征。衣着、姿势、表情和普通伤势随时会变，不记在这里。
- 新发现的特征与已有特征并存时，o 要把两者写全。
- 例：已有 {"s":"鹿椿若","p":"身体特征","o":"头顶白色分叉鹿角","isState":true}，后续发现鹿耳时，o 写作"头顶白色分叉鹿角，鹿耳"。

### 关系事实
- p 写作“对X的看法”，X 是对方的主名；o 写主体对这个人的具体看法和缘由。
- trend 用一个词概括这份看法，只代表主体一方的态度，对方可能看法不同。以“${RELATION_TRENDS[3]}”为中点，向左越来越疏远、敌对，向右越来越投契、亲近：
  ${RELATION_TRENDS.slice(0, 4).join(' ← ')} → ${RELATION_TRENDS.slice(4).join(' → ')}`;

export const SUMMARY_FACT_UPDATE_RULES = `## factUpdates 规则
${FACT_CONTENT_RULES}

### 本次输出什么
- factUpdates 只包含新对话中新出现或有变化的事实；没有变化时省略。
- 新建或更新写 {s, p, o, isState, trend?}，isState 填布尔值。核心与普通的分类在首次记录时决定，之后更新同一 s+p 时沿用原分类。
- 删除写 {s, p, retracted: true}。`;

const ALIAS_PURPOSE_RULE = '- 同一个角色在剧情里可能有多种写法：称号、昵称、缩写、其他语言的名字或译名。别名把这些写法指向同一个主名。';
const ALIAS_EVIDENCE_RULE = '可以作为依据的有：明确揭示的身份、稳定使用的称号或昵称、只可能指这个人的缩写、同一名字在其他语言里的写法或译名。';
const ALIAS_IDENTITY_RULE = '- 称号、昵称或缩写在当前剧情和已有资料里只指这一位角色时，才算别名。亲昵称呼、亲属称呼、泛称、普通职位和代词可以指很多人；读音或字形相近也说明不了是同一人。';

export const SUMMARY_ALIAS_RULES = `## characterAliasUpdates（可选）
${ALIAS_PURPOSE_RULE}
- 当前对话和已有总结能确认两种名称是同一角色时输出。${ALIAS_EVIDENCE_RULE}
${ALIAS_IDENTITY_RULE}
- to 是已有总结中稳定使用的主名，from 是其他写法，evidence 简短说明依据。
- 例: {"to":"五条悟","from":["悟","Gojo Satoru"],"evidence":"当前中文称呼“悟”与既有日文名五条悟均指同一角色"}
- 保存时，系统会把角色列表、事件参与者、事实的主体和关系对象、弧光的角色名统一改成主名；卡片正文和引语里的称呼保持原样。这里只给出映射。`;

export function buildSummaryAssistantDocPrompt(summaryStyle) {
    return `
Summary Specialist:
Acknowledged. Now reviewing the incremental summarization specifications:

${SUMMARY_MEMORY_ROLE_RULES}

${summaryStyleBlock(summaryStyle)}

${SUMMARY_ARC_RULES}

Ready to process incremental summary requests with strict deduplication.`;
}

// 三、逐楼场景提取：另一条提取流程，不属于上面的事件总结写作要求。
const ANCHOR_LANGUAGE_RULE = '- scene、where 和 edges.r 使用当前 <round> 正文的主要语言；混合语言时跟随主要叙事语言，并保留原文人名、专名和引语；JSON 键保持协议规定，不翻译';
const anchorSceneRules = field => `### 这张卡片用来做什么
${field} 记录本轮对话中的一个具体场景，用于找回对应原文，也会作为记忆提供给后续对话。
玩家可能通过人物、地点、物件、某个动作或一句话提起这段经历，因此卡片需要保留能够辨认这一幕的具体事实。

### 事实如何保持准确
- 每项叙述都以本轮正文为依据。正文没有交代的身份、动机、因果和结果保持未知，不按常识或剧情合理性补全。
- 人名、称呼和代词对应同一位角色后再归并；无法确认时保留原文称呼，不猜测姓名。
- 准确区分谁做了什么、对谁做、谁说了什么、谁知道什么，不把不同人物的行动或信息混在一起。
- 保留原文的否定、条件和不确定性。打算做不等于已经做，怀疑不等于证实，人物的说法和猜测仍归属于该人物。
- 时间、数量、身份、物品归属、行动顺序和结果与原文一致。压缩表达不能改变这些事实。

### 场景里记录什么
- 写清人物、地点、具体行动、行动对象和已发生的结果；同一场景内连续发生的行动按原文顺序串起来。
- 正文明确给出的姓名、具体地点、日期、数量、物件名称和约定条件，属于本场景的就保留具体内容，不改成笼统泛称。
- 保留本场景有辨识度的称呼、衣着或身体特征、动作细节和关键原话，使“那次穿什么”“拿着什么”“做了哪个动作”也能对应到这一幕。
- 言语可以缩写，但保留说话人、对象和实际内容，尤其是透露的信息、承诺、拒绝与交换条件，不概括成“交谈”或“发生互动”。
- 正文明示的情绪、态度和关系变化可以记录；仅有动作描写时记录动作，不自行解释人物内心。

### 篇幅与组织
- 用朴实、自然的完整句叙述，不列关键词清单，不加文学化修饰。
- 每张通常写60–180字；原文信息少时可以更短，不为达到字数补写内容。
- 缩短时先合并重复表达、压缩修辞和气氛描写，保留具体事实及其相互关系。
- 每张围绕一个场景展开，不把不同场景堆成一段。`;
const ANCHOR_EDGE_RULES = `- edges 用于寻找行为相近或人物组合相关的其他卡片。
- s 是做这件事的角色，t 是承受的角色。结合正文和消息的 name 确认角色身份，能确认时写名字；只能确认称呼时写称呼，仍认不出是谁时不写这一条。user、assistant 是消息标签，不是角色名。
- r 写“动作 + 对象或结果”，建议 6～12 字，最多 20 字。人物已经在 s、t 里，r 只写做了什么，不写人名、心理和评价，不同场景里相似的行为才能对上。
- 合格：提出交易条件、拒绝对方请求、当众揭露秘密、安抚对方情绪、强行打断发言、转移谈话焦点
- 不合格：我觉得她现在很害怕、他突然非常生气地大喊起来、user开始说话、assistant解释了很多细节
- 每张卡片最多 3 条。`;
const ANCHOR_WHERE_RULE = '- 场景地点，无明确地点时空字符串';
const ANCHOR_COUNT_RULES = '- 一轮通常是一个场景，写一张。地点、时间或在场人物明显切换时分成两张，最多两张。';

// Executable Chinese scene examples shared by the prompt and extraction contract test.
export const ANCHOR_GENERATION_EXAMPLES = [
    {
        weakScene: '车站归还雨伞',
        anchor: {
            scene: '雨停后，许宁在车站门口把黄色雨伞还给赵岚，指着伞柄的裂纹说明借来时就有。赵岚摸了摸裂口，确认借出时已经开裂，把雨伞收进布袋，没有要求许宁赔偿。',
            edges: [
                { s: '许宁', t: '赵岚', r: '归还雨伞并说明原有裂纹' },
                { s: '赵岚', t: '许宁', r: '确认原有裂纹未要求赔偿' },
            ],
            where: '车站门口',
        },
    },
    {
        weakScene: '两人发生争执，最后达成约定。',
        anchor: {
            scene: '程遥在修车铺把漏气的后轮推到柜台前，拿出三天前的维修收据，要求孟川免费返修。孟川拆下内胎后指出气嘴旁有一道新划口，程遥否认自己划伤轮胎，两人约定先保留旧内胎，再一起查看当天的监控。',
            edges: [
                { s: '程遥', t: '孟川', r: '出示维修收据要求免费返修' },
                { s: '孟川', t: '程遥', r: '指出气嘴旁有新划口' },
                { s: '程遥', t: '孟川', r: '约定保留内胎并查看监控' },
            ],
            where: '修车铺',
        },
    },
];

export const ANCHOR_GENERATION_RULES = `${ANCHOR_LANGUAGE_RULE}

## 一轮写几张
${ANCHOR_COUNT_RULES}
- 无角色互动时返回 {"anchors":[]}

## scene 写法
${anchorSceneRules('scene')}

### Scene examples (not exhaustive)
These examples contrast titles or vague recaps with concrete narratives. They show the level of detail, not a topic, tone or sentence pattern to copy. Facts for the actual response come only from the current <round>.
${ANCHOR_GENERATION_EXAMPLES.map(({ weakScene, anchor }) => `Insufficient scene: ${weakScene}
Complete response, when these facts are present in the source:
${JSON.stringify({ anchors: [anchor] })}`).join('\n\n')}

## edges：谁对谁做了什么
${ANCHOR_EDGE_RULES}

## where
${ANCHOR_WHERE_RULE}`;

// 四、维护入口：引用上面的内容规则，不另写一份。
export const getSummaryContentRules = summaryStyle => [
    SUMMARY_MEMORY_ROLE_RULES, summaryStyleBlock(summaryStyle),
    `[Facts]
${FACT_CONTENT_RULES}`,
    `[Character Aliases]
${ALIAS_PURPOSE_RULE}
- 对话与既有记忆能确认两种名称是同一角色时，别名才成立。${ALIAS_EVIDENCE_RULE}
${ALIAS_IDENTITY_RULE}`,
];

export const ANCHOR_CONTENT_RULES = [
    `[Anchor semantic]
${anchorSceneRules('semantic')}`,
    `[Anchor edges]
${ANCHOR_EDGE_RULES}`,
    `[Anchor where]
${ANCHOR_WHERE_RULE}`,
];
