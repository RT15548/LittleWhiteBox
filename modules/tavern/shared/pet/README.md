# Pet domain

不明物是一个全局唯一的 Companion domain：主 RP 只提供时间，当前会话只提供来源钱包、Phone boundary 和剧情落点。它不是 session archive、角色档案或回滚领域的一部分。

## 模块边界

- `pet-types.ts`：唯一 public state/action/record/error 形状。
- `pet-invariants.ts`：canonical records 和严格状态校验。
- `pet-rules.ts`：无 I/O 的阶段、食欲、traits、moment、事件、persona 规则。
- `pet-events.ts` / `pet-copy.ts`：事件、相处片段、静态文案、Prompt 文本。
- `pet-random.ts`：只给即时规则消费的随机源；不录制 replay draws。
- `pet-service.ts`：Companion CAS、玩家礼物、聊天、moment、snapshot、删除。
- `pet-story-turn.ts`：Assistant 提交后的全局时间推进和来源会话 Economy 效果。
- `pet-prompt.ts`：仅来源会话的 fail-open interference projection。
- `pet-chat.ts`：模型 Prompt、输入规范化、宽进严存解析和演化判词。
- `pet-view.ts`：不泄露 traits、私聊输入、pending 细节的 Public View。

## 设计不变量

- 三张表：`petCompanion`（一行 current）、`petActions`（一 action 一 revision）、`petJournal`（全局可观察历史）。
- `petTurn` 只在有效主回合递增；同一来源 key 重放不二次成长。
- 可恢复的长期事实才写 state：阶段、traits、食欲、窝、聊天记忆、moment、演化和真正统计。舞台触碰/动画/连点和 Home 亮点属于 UI 临时态；打开不明物页会清除亮点，不写入 Pet 表。
- `phase` 只有 `egg | juvenile | adult`。lure 立即 egg，下一回合 hatch，juvenile 可聊天。
- appetite 归零不造成 dormancy、人格惩罚或玩法锁定。
- traits 是 `closeness / sharing / tempo` 的相处偏好，不含善恶；只由 moment 写入。
- moment 不过期、最多一条、每次完成/跳过后至少六个 active turns、按三轴轮转，并写入第一人称 memory。`pendingMoment` 未处理时不产生第二条 moment，但不阻止同一回合的普通事件、藏币、Curio 与 interference。
- 事件和长期安静只能产生内容，不能把“不打开 APP”解释为冷落。
- 所有动态 Prompt 数据转义；interference 投影不可信时 fail-open，绝不影响主 RP。
- 旧 Pet schema 是 v29 hard cut。不要添加旧字段读取、转换或 alias。

## 写入与删除

玩家礼物在来源 Phone boundary、全局 Companion CAS 和来源 Economy 的一个 Dexie transaction 内完成。主回合 action ID 固定为 `pet:story:{sessionId}:{turn}`。跨会话冲突依赖 revision/version CAS，不添加持久锁。

rollback/branch/delete session/character archive 不触碰 Pet。`letTavernPetLeave` 是唯一删除入口，经过 UI 二次确认后清空 Companion、Actions、Journal，且不退款。
