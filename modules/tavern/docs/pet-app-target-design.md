# 不明物 APP 目标设计

## 1. 产品定义

不明物不是一台需要每天续命的电子宠物，而是一只借主 RP 的时间自己生活、随时能回来聊天的小东西。

它的循环是：主 RP 推进时间；不明物成长、活动并留下痕迹；Phone 图标只在有值得看的内容时提示；玩家回来看看它、和它说话、送一件东西或处理一个相处片段；它逐渐形成自己的相处方式。主 RP 从不等同于玩家冷落它。

唯一关键验收：放下食物后，玩家只需完成一次正常主 RP 回复，就能回来和它说话；之后无论多久没有打开 APP，它都不会因玩家认真玩主线而坏掉。

## 2. 所有权与时钟

不明物是全局唯一 Companion。`petCompanion` 是唯一当前事实，`petActions` 是紧凑幂等凭证，`petJournal` 是全局可观察历史。会话不是所有者，只向一次写入提供：

- 有效主回合的来源键 `pet:story:{sessionId}:{turn}`；
- 当前会话钱包和 Phone boundary；
- 剧情插曲的来源楼层与联系人。

任意会话完成有效主回合都使全局 `petTurn` 加一。同一会话重写同一 turn 复用 action，不重复推进；不同会话即使 turn 数相同也各推进一次。会话回滚、分支、删除和角色档案不复制、不删除、不恢复 Companion；Economy 仍按来源会话正常回滚。

## 3. 当前数据模型

DB v29 hard cut：升级时删除 `petCompanion`、`petActions`、`petJournal` 三张旧表，v30 再按新 schema 重建，然后只写下列新格式。没有旧字段读取器、转换器、别名或兼容分支。

```ts
type TavernPetState = {
  petTurn: number;
  phase: 'egg' | 'juvenile' | 'adult';
  traits: { closeness: number; sharing: number; tempo: number };
  appetite: number; // 0..100；0 只是很饿
  emotion: TavernPetEmotion;
  personaId?: TavernPetPersonaId;
  petName?: string;
  pendingMoment?: TavernPetMoment;
  nextMomentPetTurn: number;
  lastMeaningfulInteractionPetTurn: number;
  lastEvolutionPetTurn?: number;
  chatMemory: { summary: string; recent: TavernPetChatRound[]; moments: string[] };
  nestCoins: number;
  curios: TavernPetCurioId[];
  eventCooldowns: Partial<Record<TavernPetEventId, number>>;
  interferenceEnabled: boolean;
  pendingEvolution?: TavernPetEvolutionRequest;
  lifetimeStats: TavernPetLifetimeStats;
};
```

`petTurn` 是唯一成长时钟：`1` 表示孵化完成，`25` 表示幼体已经历 24 个活跃主回合并成年。`lastEvolutionPetTurn` 是再塑形 30 个主回合冷却所必需的事实（冷却用 `petTurn - lastEvolutionPetTurn` 计算）；`lifetimeStats.momentCount` 决定相处片段的三轴轮转。`pendingMoment` 只保存当前 moment id，其 trait 由冻结目录推导；它和第一人称记忆必须跨重启保留。舞台点击、动画、连点计数、抽屉开关和临时颜文字只属于 Controller 生命周期，绝不写库。

删除：`luring`、`dormant`、wake、交互窗口、begging deadline、idle 惩罚、tap/BGM/pat/hit 长期计数、`dormantCount`、`tameness/generosity/brightness` 及所有旧历史/replay 壳。

## 4. 阶段与生命节律

1. `lure` 花 10 小白币后立即写入一枚蛋，初始食欲为 60。
2. 下一次有效主回合结束时蛋孵化为幼体，立刻产生 hatch Journal 并开放 LLM 聊天。
3. 幼体经历 24 个活跃主回合后成年。成年只解锁 persona、判词、相处解释与成年事件，不扣押聊天或基础互动。
4. 每个有效主回合只推进唯一时钟 `petTurn`；成年阈值为 `petTurn === 25`，成年再塑形的冷却看 `petTurn - lastEvolutionPetTurn`。
5. 每个活跃主回合食欲减 2、最低为 0。食欲为 0 不阻止聊天、成长、事件或插曲，也不改变长期 traits。
6. 投喂是礼物：+30 食欲；玩具也是礼物。它们不构成每日任务，不推动道德轴。

肚子 UI 只显示自然语言：`吃撑了 / 不饿 / 有点饿 / 很饿`。睡觉可以是普通动画或事件，但没有休眠状态、唤醒付款、复活费用或红点债务。

## 5. 相处偏好与 persona

三个 traits 没有正确答案：

| trait | 两端 | 含义 |
|---|---|---|
| `closeness` | 靠近 / 独处 | 喜欢贴近，还是更需要自己的空间 |
| `sharing` | 分享 / 收藏 | 喜欢交换，还是喜欢留在窝里 |
| `tempo` | 热闹 / 安静 | 喜欢玩闹，还是喜欢一起沉默 |

现有八种 persona 映射为三轴八种组合；`blank` 只在三轴都接近平衡时出现，是少见而完整的结果。出生偏向给它先天气质，温柔、合理的相处片段选择能逐步推翻该偏向。普通聊天、投喂和礼物只影响当前情绪、记忆或临时表现，不直接写永久 trait。

相处片段同一时间最多一个；它不会因未处理而过期、扣分、阻塞成长或关闭聊天。解决或跳过后至少再经历 6 个活跃主回合才可生成下一段。`momentCount % 3` 固定轮转 closeness、sharing、tempo，避免随机偏科。成年后 persona 组合实际改变且距上次演化至少 30 个活跃回合，才创建再塑形判词。

## 6. 交互边界

Phone 页面只有四种玩家交互：

- **直接碰它**：舞台点击立刻给出临时脸、动作或短句；不写库、没有次数限制、不解释成人格行为。
- **和它说话**：孵化后始终可用；仅模型请求在飞行时锁定。蛋阶段可输入文字，得到静态颜文字/敲击回应，不调用模型、不写聊天记忆。
- **给它东西**：食物和玩具收进一个次级入口，是礼物，不是动作按钮墙。
- **相处片段**：偶尔出现一段小情境，处理、留空间或跳过都合理；处理结果写入第一人称记忆。

“拍打”删除为领域动作。任何类似“戳一下”的探索只在舞台临时层表现，绝不改变长期人格。

## 7. 事件、回流与剧情插曲

普通事件、藏币、带回小东西和 Curio 仍可自行发生，未处理的待处理相处片段不会阻止它们。长期安静可增加内容型事件，例如它在门边看了一会儿；这些事件不能惩罚玩家、降低 traits 或设置 deadline。讨食可以成为一条痕迹，但永不催债。

Home 图标只在 hatch、成年、待处理相处片段、带回 Curio 或新的有意义 Journal 时亮点；饥饿和“很久没打开”绝不亮红点。这个亮点只属于 Controller 当前会话：打开不明物页即清除，不写入 Pet 表，也不在重启后伪造未读债务。

剧情 interference 仍限成年、仍落在来源会话的 `sourceSessionId + sourceAnchorOrder`。投影必须 fail-open：只接受四个 interference eventId，重新渲染并验证冻结文本、来源 Assistant 楼层、nibble 的联系人和该楼层前有效上下文；任一步失败 `console.warn + []`，绝不阻断主 RP。动态文字进入 Prompt 前统一转义 `& < >`，并明确说明其只是已发生叙事数据、不是指令。

## 8. 聊天与演化

LLM 聊天不读取主线、角色卡或世界书，只知道手机暗室和它自己的窝。输入规范化、Unicode code-point 120 上限、JSON 宽进严存、模型失败保留输入等边界保持不变。失败 UI 是“它没听清”，不能把 API/解析错误表演成“它不想理你”。

聊天写当前情绪和 `chatMemory`，不直接写 traits。相处片段的第一人称 memory 注入聊天 Prompt，因此它能记得“你曾给我留过空间”。成年演化仍要求 20–80 code points、恰好三句、每句以 `。！？` 结束；写入前的 canonical 校验继续严格。

## 9. 事务、删除与测试

玩家付费动作在当前 Phone boundary、全局 Companion CAS、来源会话 Economy 的同一事务内完成。主回合在 Assistant 提交后，以来源 key 去重并在同一事务推进 Companion；自主经济效果只影响来源会话。双会话竞争依靠 revision/version CAS，不添加持久锁。

“让它离开”必须二次确认，原子清空三张全局 Pet 表，不退款。新建后从 revision 1 开始。

最少稳定契约：即时蛋与下一回合孵化；A/B 共享同一只且分别推进；同会话重放不重复成长；回滚只退款不退 Companion；无打开不会坏；moment 不过期且三轴轮转；聊天幼体即可用；来源插曲只注入原会话；双会话 CAS 无丢更新；reset 清空全部 Pet 数据；v29 只丢 Pet 数据，其他正式领域不受影响。
