# 不明物 APP 工程交接

## 1. 权威终态

先读：

1. [目标设计](./pet-app-target-design.md)
2. [内容规格](./pet-app-content-spec.md)
3. [施工方案](./pet-app-implementation-plan.md)
4. [`shared/pet/README.md`](../shared/pet/README.md)

这套设计已经冻结为：**一只借主 RP 时间自行生活、玩家随时能回来聊天的小东西**。它不是需要玩家按日续命的电子宠物。

## 2. 必守的结构

- `petCompanion` 是全局唯一 current；`petActions` 仅做幂等/CAS 凭证；`petJournal` 是全局历史。
- 会话只提供来源时间、Phone boundary、钱包与剧情落点；不拥有 Pet。
- `petTurn` 是唯一成长时钟。主回合 key 固定为 `pet:story:{sessionId}:{turn}`。
- DB v29 是用户 0 hard cut：删除三张既有 Pet 表（v30 重建），只认新 canonical state；不读、不转、不兼容旧字段。
- 只有 `pendingMoment`、traits、聊天记忆、阶段、食欲、窝、演化和真正长期统计可持久化。舞台点击等过程态只活在 Controller。
- 回滚、分支、删会话和角色档案不碰 Pet；Economy 正常回滚。
- "让它离开" 必须二次确认，原子清空三表，不退款。

## 3. 新循环的不可退化点

- 付 10 币立刻见 egg；下一有效主回合 hatch；juvenile 立即可 LLM 聊天。
- 没打开、空腹、没送礼物都不会让它休眠、退化、扣 trait 或阻断聊天成长。
- 持久 traits 是 `closeness/sharing/tempo`，无善恶含义；只能由温柔的 moment 选择推动。
- `pendingMoment` 不过期，不阻断聊天；解决/跳过后最少间隔六个活跃主回合，并按三轴轮转。
- 成年只增加 persona、判词和复杂内容，不扣押核心玩法。
- 食欲是自然状态，不显示百分比条，不制造红点债务。
- 舞台点击只给临时反应；不写数据库、不限次数、不改变人格。

## 4. 保持的安全/并发边界

- interference 只允许四个 eventId 携带 injectedText；投影重新渲染、验证来源 Assistant 楼层与 nibble 上下文，任一步失败 fail-open。
- 动态 Prompt 数据转义 `& < >` 并声明为叙事数据、不是指令。
- 模型输入 120 code points；外部回复宽进严存；失败保留玩家输入并显示“它没听清”。
- 聊天模型返回后重新捕获 Phone boundary；全局 Pet 由 revision/version CAS 防丢更新。
- 付费 lure 余额检查必须早于首次随机抽取；不足余额零随机、零写入、结构化 `insufficient-funds`。
- home/Phone 同步只按有内容的 Journal/moment/milestone 提示；跨会话不能泄漏 source Toast。Home 亮点是 Controller 临时态，进入不明物页即清除，不写库。

## 5. 施工顺序

1. 文档先行（本文件、设计、规格、方案、README）。
2. v29 类型/invariant/规则 hard cut。
3. moment 目录与 persona 新语义。
4. service/story-turn/CAS/Economy 接通。
5. Controller/Phone 暗室舞台重做，删除按钮墙。
6. 生命周期审计、测试、dist、助手索引和最终 review。

## 6. 交付门禁

至少验证：即时 egg、下一回合 hatch、无惩罚长期主线、A/B 同宠物、回滚不退 Pet、moment 轮转/不超时、egg 静态回复、juvenile LLM 聊天、来源插曲 fail-open、reset 三表清空、v29 不伤其它领域。

执行 `npm run test:tavern`、`vue-tsc`、`npm run lint:tavern`、`npm run build:tavern`、`npm run build:assistant`、`git diff --check`。不启浏览器，不 commit，不 push，除非主人明确改变指令。
