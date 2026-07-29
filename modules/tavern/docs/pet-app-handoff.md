# 不明物 APP 工程交接与实施记录

- 状态：A–G 已实现；阶段 H 的代码、静态审查、测试与生产构建已收口（2026-07-29）。浏览器人工验收按用户要求停止，不虚报为完成。
- 交付目标：按已确认规格完整实现 Phone OS「不明物」APP，不停在脚手架或演示 UI
- 当前仓库状态：领域、两张 Pet 表、主回合事务、生命周期、模型协议、Phone OS UI 与生产 bundle 均已落地；最终 dirty diff 审查、静态门禁与构建产物已完成。

已通过的自动门禁：`npm run test:tavern`（871/871）、`vue-tsc`、
`npm run lint:tavern`、`npm run build:tavern`、`git diff --check`。已完成的
真实 ST 验收包括诱饵扣款、自然成长至 adult、arrival/hatch/adulthood 痕迹、
pending evolution 静态回落，以及完整 30 事件目录中非 milestone 事件的 Public
View/UI 观察。其余桌面/移动、主题、reduced-motion、键盘焦点与私密字段的
浏览器复验按用户要求停止；本记录不把自动测试覆盖虚写成人工十组场景全部完成。

2026-07-29 最终 hardening 已把实现与四份文档统一到同一终态：interference
只扫描静态模板，只有四个 eventId 可且必须带 `injectedText`，投影按 action context
重算冻结正文、动态文本转义且 Prompt fail-open；模型边界枚举 JSON 候选并采用最后
一个可用回复后才回落普通正文；再塑形按成年后的活跃
`phaseTurnCount` 冷却；archive canonical 严格验证三句判词；模型边界宽进而
canonical 严存；juvenile 与 adult 共用 120 code points 的 canonical 上限，幼生
短句仅由 persona 风格约束；Controller
用临时 `mutationEpoch` 管理失效写入；余额错误使用结构化 reason，lure 在余额
校验后才消费随机；ChatBar 使用 code-point/IME 输入边界，窝抽屉所有关闭入口
一致服从 busy。未增加 legacy 字段、持久锁或兼容分支。

## 1. 团队必须先读

按顺序完整阅读：

1. 随任务提供的 `AGENTS.md` / 工作规则；若由平台注入，无需在仓库寻找同名文件。
2. [目标设计](./pet-app-target-design.md)：产品边界、状态模型、事务与删除路径。
3. [内容规格](./pet-app-content-spec.md)：不可自行改写的 persona、事件、文案和 Prompt。
4. [施工方案](./pet-app-implementation-plan.md)：阶段 A–H、测试与 review 顺序。
5. [领域 README](../shared/pet/README.md)：文件所有权和依赖方向。
6. 当前 Bank、Shop、Economy、accepted rollback、archive、Phone OS 和 `run-once.ts` 实现；代码是外部接口与当前版本号的事实来源。

## 2. 冲突时的权威顺序

```text
当前代码：现有 API、事务原语、DB/archive 当前版本、Phone/Prompt 接法
    ↓
目标设计：产品边界、领域模型、不变量和非目标
    ↓
内容规格：静态目录、文案、Prompt 与精确谓词
    ↓
施工方案：实施顺序和推荐文件切片
```

施工方案里的文件名可因现有代码的真实边界做等价调整，但不能改变所有权、数据模型或行为契约。发现上面几层真正冲突时停止相关切片，给出具体文件/行号和一个最小修正方案；不要用兼容字段、双路径或 UI 补丁掩盖。

## 3. 开工要求

- 先检查 `git status`，保留用户已有改动；不要重置、覆盖或顺手整理无关代码。
- 重新确认 Dexie 和角色档案当前版本，使用连续新版本号；文档中的 26→27、v7→v8 只是确认时基线。
- 按 A→H 施工。阶段 A 先完成纯规则与目录；Phone 入口只能在阶段 G、真实服务接通后注册。
- 每个阶段完成后运行该阶段最低测试并 review 上下游、边界、错误路径、回滚和删除路径；不要等 UI 做完才补事务。
- 不需要重新询问已经在目标设计/内容规格确认的产品决定。
- 不为未发布 Pet 构思增加 legacy schema、旧字段 fallback、双 UI 或迁移读取器。
- 不修改 Shop inventory 来服务 Pet；curio 永远属于 Pet。
- 不在 Dexie transaction 中调用模型；不在 Assistant 保存后另开 transaction 补推进 Pet。
- 不把 axes、chatMemory、cooldown、event weight、pending snapshot 或 Economy 游标交给 Controller/DOM。
- 不提交或推送 Git，除非主人另行要求。

## 4. 必须交付的结果

- `shared/pet` 终态领域文件全部实现，不留 TODO、假数据或不可达分支。
- 两张 Pet 表、严格 canonical/history 校验、原子 Economy 写入和幂等/CAS。
- 主 Assistant/Pet/Economy 同事务推进，reroll/partial/error 行为符合规格。
- accepted rollback、branch、delete、archive temp restore/promote 全链路覆盖。
- Pet chat、pending evolution、静态 fallback 和 floor-aware interference Prompt。
- Phone Controller、Domain Sync、动态阶段图标、单页暗室 UI、窝抽屉和命名。
- 目标设计列出的稳定契约测试，以及施工方案要求的生产 bundle。
- 将施工方案状态改为“已实现并通过阶段 H 验证（日期）”；若任何人工验收未做，逐项写明，不得笼统声称完成。

## 5. 完成门禁

必须全部通过：

```powershell
npm run test:tavern
npx vue-tsc --noEmit -p tsconfig.tavern.json
npm run lint:tavern
npm run build:tavern
git diff --check
```

并完成施工方案阶段 H 的 10 组人工场景。最终汇报只需要：实现结果、关键边界选择、验证结果、未完成项、实际变更文件；不要用“测试全绿”代替架构自查。

## 6. 可直接转发给实施团队的话

```text
请在当前 LittleWhiteBox 仓库中完整实现 Phone OS「不明物」APP。

开工前完整阅读并遵守：
1. 随任务提供或由平台注入的 AGENTS.md / 工作规则；
2. modules/tavern/docs/pet-app-target-design.md；
3. modules/tavern/docs/pet-app-content-spec.md；
4. modules/tavern/docs/pet-app-implementation-plan.md；
5. modules/tavern/docs/pet-app-handoff.md；
6. modules/tavern/shared/pet/README.md。

当前代码是现有 API、DB/archive 版本与集成方式的事实来源；目标设计和内容规格是已确认产品契约。按施工方案 A→H 连续完成，不停在文档、空目录、假入口或演示 UI。入口最后注册；不为未发布构思做兼容；不改 Shop inventory；模型调用不得进入 Dexie transaction；主 Assistant、Pet 和 Economy 必须同事务推进。

先检查并保护现有 worktree。每阶段做最低测试和通盘 review；遇到真实规格冲突时报告具体证据和最小修正方案，不自行加双路径。完成后执行全部测试、类型检查、lint、build、diff check 和阶段 H 人工场景，更新施工方案状态并汇报未完成项。除非另有指示，不 commit、不 push。
```
