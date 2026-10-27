# 循环任务脚本开发指南

循环任务负责在指定时机运行斜杠命令或 JavaScript，并管理脚本注册的监听、定时器和退出清理。本文说明任务作者可以使用的能力、调用方式及适用场景。

## 能做什么，选哪个入口

| 要做的事 | 入口 | 为什么用它 |
| --- | --- | --- |
| 在消息、聊天切换或初始化时执行一次操作 | 任务的触发时机 + 脚本命令 | 由插件调度，不必自己重复注册宿主事件 |
| 在 JavaScript 中调用斜杠命令、取得结果 | `STscript` | 处理宏替换和命令结果，并把命令纳入任务取消与重入管理 |
| 注册后持续响应楼层变化 | `addFloorListener` | 复用任务的楼层计数、触发过滤和卸载机制 |
| 监听按钮、键盘等浏览器事件 | `addListener` / `removeListener` | 监听归属于当前任务，停止时自动移除 |
| 延迟执行或按毫秒周期执行 | `setTimeoutSafe` / `setIntervalSafe` | 定时器归属于当前任务，停止时自动清除 |
| 感知任务停止、取消自己的异步请求 | `abortSignal` | 将任务停止传递给支持 `AbortSignal` 的浏览器能力 |
| 移除自己创建的界面、取消宿主事件订阅、撤销其他副作用 | `onCleanup` | 插件不知道这些资源如何释放，由作者提供清理函数 |
| 查询、执行或修改已经存在的任务 | `window.XBTasks` | 由插件处理任务存储、保存和列表刷新 |
| 读写聊天、操作预设提示词、参与生成过程 | 酒馆原生 API | 这些数据和行为由酒馆拥有，查询入口见“什么时候查酒馆 API” |

这里的“楼层间隔”是消息计数，不是时间；定时执行使用毫秒定时器。

## 从创建任务到首次运行

1. 打开小白X的循环任务设置，创建任务，填写名称、任务类型和脚本命令。
2. 首次调试可选 `after_ai`、楼层间隔 `0`，并勾选“注册任务按钮到主界面”。这种组合只手动执行。
3. 保存后点击任务按钮，或在聊天输入框执行 `/xbqte 任务名称`。
4. 确认效果后，再按下面的触发规则设置自动运行。保存、导入、启用任务本身不会立即运行脚本。

三类任务点击“保存”后等待实际写入回执，成功才关闭；失败提示“保存失败。请重试。”并保留输入。保存期间可以取消、关闭或按 Escape 离开；这不会撤销已发出的请求，迟到结果不会关闭后来打开的编辑器。修改名称、脚本或类型在保存完成后停止旧实例；主动停用、删除仍立即停止。

全局任务保留原 ID、设置位置与脚本文件。编辑先写新的候选脚本，元数据的内部 `scriptId` 在宿主设置提交成功后才成为当前运行版本；没有 `scriptId` 的现有任务仍按任务 ID 读取，不批量转换。相同内容的失败重试复用候选引用，改写内容使用新引用，避免覆盖可能已提交的脚本。导出包含完整脚本，不包含内部引用。

设置由酒馆原生 `saveSettings()` 组装；任务模块短期只读观察匹配本次任务字段的请求，要求响应 `{ result: "ok" }`，不改写宿主请求或响应。角色和预设任务使用原位置的写入回执。正常成功不读回、不回滚；请求异常、结果未知时仅查询一次对应字段，不回填整份宿主设置。查询仍失败则保留原页面版本、候选脚本及本页重试信息；任何仍可能被引用的脚本都不删除。确认不再使用的脚本后台清理，清理失败只记日志，不影响保存结果。

角色的“记住允许”是独立普通设置保存，不加入任务提交队列。改变类型先保存目标，再移除原位置；未确认的目标不得触发源删除。编辑器记住本次尝试过的位置，重试沿用同一个任务 ID，不重复创建。

“脚本命令”可直接写斜杠命令，也可包含一个完整 JavaScript 块：

```text
<<taskjs>>
await STscript('/echo 任务已执行');
<</taskjs>>
```

块内是异步函数体，可以直接使用 `await`、`return` 和本页列出的任务接口；它运行在酒馆页面，可使用 `window`、`document` 等浏览器能力。它不是隔离沙箱，运行导入脚本意味着允许其访问当前页面。

块外的文本按斜杠命令执行，多个片段按书写顺序等待执行。块内局部变量不跨块共享；同一任务后续 JavaScript 块会替换该任务之前的脚本实例。需要共同保留的监听和状态放在同一个块中。

## 任务放在哪里，什么时候执行

### 任务类型与存储

| `scope` / 类型 | 保存位置与可用范围 |
| --- | --- |
| `global` / 全局任务 | 插件设置保存任务信息，脚本由插件的任务存储保存；不依赖当前角色或预设 |
| `character` / 角色任务 | 当前角色的 `data.extensions['xiaobaix-tasks'].tasks`；调度时读取当前角色的任务 |
| `preset` / 预设任务 | 当前聊天补全预设中，`prompt_order` 的 `character_id: 100000` 条目下的 `xiaobai_ext.scheduledTasks`；只有聊天补全 API 下选中的预设提供任务 |

预设任务的运行实例属于本次预设使用：切到其他预设，或离开聊天补全 API，会停止该实例。切回来不会复活旧实例，也不会额外触发“插件初始化”。

需要随预设加载、并且支持停止后重新初始化的脚本，任务类型选“预设任务”，触发时机选“随预设启用”。页面加载、切入该预设、从其他 API 返回，以及导入并选中预设后，都会启动一个新实例。同名覆盖导入也属于一次新的启用：先停止旧实例，再启动新定义。宿主的重复通知不会重复运行；留在同一预设内切换聊天也不会重启。

**不要因为脚本“长期监听”就更换时机。** “启动代码只执行一次”与“监听持续有效”是两件事：顶层函数返回后，已注册的原生回调、异步初始化和任务接口仍保持有效，直到明确停止。既有手动、插件初始化和聊天切换任务保持原来的时机，不自动迁移。

| 脚本用途 | 是否选择“随预设启用” |
| --- | --- |
| 本预设专用面板、按钮、监听器，退出时能清理，回来时可重新创建 | 适合 |
| 全局常驻、需要跨预设保留的功能 | 不适合；保留全局任务及原启动时机 |
| 只允许初始化一次、缺少退出清理的老脚本 | 不适合；先由作者确认可重启，不能直接改时机 |
| 每条消息后执行操作，或只在点击按钮时执行 | 使用消息时机，或手动任务，不选此项 |

**分享给旧插件时有明确降级，不是完全相同的时机。** 新版保存为旧版认识的 `triggerTiming: 'chat_changed'`，并在 `x.presetStart: true` 标记新版行为；只有预设任务且基础时机仍为 `chat_changed` 时，新版才按“随预设启用”执行。旧版会在每次切换聊天后执行，不会仅因切换预设就启动，也不会弹“不支持”错误。完整预设与单独任务 JSON 都使用这份格式，避免旧版把未知时机静默变成“AI 消息后”。新增此模式保存时固定 `interval: 1`，仅为避免旧界面误标“手动”，两版的事件触发均不使用楼层间隔；普通旧任务的间隔不改。

兼容行为对照正式线 `1aaf3fbf`（2026-10-24 紧急修复后）验证，不等于所有历史插件版本都具备相同的清理能力。旧版每次聊天切换会重新运行脚本：插件负责已托管的监听和定时器，原生事件订阅、自建 DOM、函数替换和其他副作用仍需作者提供 `abortSignal` / `onCleanup` 清理。发布前请在旧版连续切两次聊天，确认没有重复监听、重复界面或重复副作用；不能安全重启的脚本不要选择此模式。

这一时机等待酒馆完成预设应用、原有插件初始化调度以及正在执行的任务/清理结束；等待中切走、停用、删除或重置，不会补跑已失效的启动。它不依赖聊天切换或楼层间隔，不改变原有任务的触发时机。修改任务设置本身不算重新启用预设；首次配置后可手动执行，或切走再切回来。

全局任务不因预设切换停止。角色任务的“从当前角色读取”是调度范围，不代表已启动的常驻脚本会在切换聊天时自动卸载；需要这种行为时，订阅酒馆的聊天切换事件并释放自己的资源。

任务 ID 在创建、导入时由插件生成，作者无需手填。读取缺少 ID 的预设任务时，只在内存中补齐；读取、执行和切换预设都不自动保存预设。运行归属使用带预设范围的任务名称，不依赖补出的 ID 是否已保存；任务属性仍在用户保存或修改时写入。

### 触发时机

| `triggerTiming` | 实际触发条件 | 如何使用间隔 |
| --- | --- | --- |
| `after_ai` | AI 生成结束；宿主无生成结束事件时使用角色消息渲染事件 | 正间隔，按所选楼层编号取模 |
| `before_user` | 用户消息已渲染到聊天后 | 正间隔；这个名字不是“发送前拦截” |
| `any_message` | 上述用户消息或 AI 消息时机 | 正间隔，按所选楼层编号取模 |
| `only_this_floor` | 上述消息时机，且当前楼层编号等于间隔值 | 间隔作为目标编号；不是永久的一次性执行标记 |
| `character_init` | 新聊天创建事件 | 不参与间隔判断；编辑器的“角色卡初始化”值为 `initialization`，执行时映射到此值 |
| `plugin_init` | 循环任务模块初始化后的一次调度 | 不参与间隔判断；不是切换预设或保存任务后的回调 |
| `chat_changed` | 聊天切换事件 | 不参与间隔判断 |
| `preset_enter`（界面/API 时机） | 当前预设启用完成；仅预设任务 | 不参与间隔判断；实际文件使用上面的 `chat_changed` + `x.presetStart` 兼容格式 |

`interval: 0` 只对按消息计数的时机表示不自动执行。事件型时机仍由事件触发，因此纯手动任务使用 `after_ai` + `0`。预设任务即使间隔为 `0` 也能直接选择“随预设启用”；全局和角色任务保留原编辑方式，调整时先把间隔设为正数。

`floorType` 决定计数：`all` 包含聊天数组中的全部消息；`user` 只计非系统的用户消息；`llm` 只计非系统的 AI 消息。当前楼层编号是对应消息数减一，最小为 `0`。按楼层调度跳过第 `0` 层；正间隔 `N` 在编号为 `N`、`2N` 等时匹配。AI 后触发配合全部楼层时，需要同时满足 AI 时机和该编号，不能理解成“每 N 次 AI 回复”。

自动调度还受模块开关、任务启用状态、聊天切换期间的过滤、消息去重、任务冷却及执行锁约束。执行锁存在时，新自动触发会跳过而非排队；任务发起的命令尚未结束时也保留此限制，避免命令产生的消息再触发任务。

常驻脚本应注册回调后结束顶层函数。顶层无限循环或长期等待会占住本次执行，阻止正常自动调度。

### 预设任务保存

任务定义随预设 JSON 保存在酒馆服务端，不另存浏览器持久化副本。当前页面对同一个预设的任务保存按顺序发送；每次发送前读取最新预设并仅合入 `scheduledTasks`，保存完成只同步任务字段，不回灌整份旧提示词设置。普通提示词、开关和参数编辑不取消任务保存。保存期间，删除和停用立即生效；名称和脚本继续使用已提交版本，失败不会让候选脚本参与执行。仅切换到另一预设不会取消原预设的正常保存。

完整预设导入在写入服务端前，会等待本页面已有的同名任务保存及其队列结束，避免旧队列随后覆盖导入文件；其他预设的保存不阻塞这次导入。导入失败不撤销之前的编辑，也不停止现有实例；导入成功后才替换任务定义和运行实例。宿主替换了预设后，过期保存结果不再回填内存。

## JavaScript 块内提供的接口

这些接口由小白X注入到每次任务执行中，无需导入；不是独立的浏览器全局变量。

### `taskContext` 与 `ctx`：任务信息和日志

两者是同一个对象，不是酒馆的聊天上下文。

| 成员 | 含义 |
| --- | --- |
| `taskName` | 本次执行使用的任务名称 |
| `stableKey` | 插件识别运行实例的键；预设任务包含预设归属，供日志关联使用，按不透明字符串处理 |
| `codeSig` | 当前 JavaScript 文本的签名，供诊断使用 |
| `log(message, extra?)` | 向插件调试日志的 `scheduledTasks` 分类记录信息 |
| `warn(message, extra?)` | 同上，警告级别 |
| `error(message, error?, extra?)` | 同上，错误级别，可附异常对象 |

脚本自行读取酒馆上下文时使用不同变量名，如 `const tavern = SillyTavern.getContext()`，避免和任务的 `ctx` 混淆。

### `STscript(command)`：调用斜杠命令

传入非空命令字符串，返回 `Promise`。执行前替换酒馆宏；宿主结果包含 `pipe` 时取其管道值，否则使用宿主返回值。JSON 字符串会解析成对应的对象、数组、数字等值，其他字符串保留原样；宿主未返回值时得到空字符串。它不固定返回 `{ pipe: ... }` 或字符串。

顶层函数正常返回不会使 `STscript` 失效；异步初始化、原生按钮监听器和定时器仍可调用它。任务被明确停止后，会向已启动的命令链发送取消请求；停止后再从普通任务代码调用它，不执行命令，返回兑现为 `undefined` 的 Promise。取消不能撤销命令已经完成的操作。

命令的语法、参数和副作用属于酒馆，见 [STscript 参考](../assistant/references/stscript-reference.md)。需要撤销已产生的效果时，使用下面的清理接口。

### `addFloorListener(callback, options?)`：跟随楼层触发

返回 `off()` 函数。`options` 为：

| 字段 | 默认值 | 含义 |
| --- | --- | --- |
| `interval` | `0` | 楼层间隔；默认不会在消息时机触发，周期监听需要明确给正数 |
| `timing` | `'after_ai'` | 使用上面触发时机表的执行值，例如 `after_ai`、`chat_changed`、`character_init` |
| `floorType` | `'all'` | 使用上面的楼层计数规则 |

回调收到 `{ timing, floors, currentFloor, interval, floorType }`：

- `timing` 是实际调度事件：`before_user`、`after_ai`、`chat_created`、`plugin_initialized` 或 `chat_changed`。
- `floors` 为 `{ all, user, llm }` 消息数量，`currentFloor` 为按 `floorType` 换算后的编号。
- `interval`、`floorType` 是本订阅的配置。

回调可返回 Promise，调度器等待它完成。`off()` 取消后续订阅，不中断已经开始的回调；在回调开头调用 `off()`，然后继续 `await`，可实现一次性监听。任务自身停止时，正在运行的回调仍受到任务取消约束。

订阅不会补发已经发生的事件，例如在 `plugin_init` 任务里注册同一初始化事件，不会收到正在结束的这一轮通知。

### 浏览器事件与定时器：为什么使用托管版本

| 接口 | 用法和返回值 |
| --- | --- |
| `addListener(target, type, handler, options?)` | `target` 必须支持 `addEventListener`；参数含义同 DOM 事件，返回移除监听的函数；相同目标、事件、函数和 capture 的重复注册复用原监听 |
| `removeListener(target, type, handler, options?)` | 移除对应监听，无返回值 |
| `setTimeoutSafe(callback, delayMs, ...args)` | 注册一次性定时器，返回计时器 ID；停止后调用返回 `null` |
| `clearTimeoutSafe(id)` | 清除一次性定时器并解除任务登记，无返回值 |
| `setIntervalSafe(callback, delayMs, ...args)` | 注册重复定时器，返回计时器 ID；停止后调用返回 `null` |
| `clearIntervalSafe(id)` | 清除重复定时器并解除任务登记，无返回值 |

这些接口登记资源归属。任务停止时自动清除；异步回调返回的 Promise 也会被跟踪，异常记录到浏览器控制台。重复定时器仍按浏览器周期触发，不会自动等待前一次异步回调结束，需要串行工作时自行安排下一次执行。

浏览器原生 `setTimeout`、`setInterval`、DOM 注册以及酒馆 `eventSource.on` 不在这份自动登记中。`addListener` 面向 DOM `EventTarget`，酒馆事件源使用自己的 `on` / `removeListener`。

### `abortSignal` 与 `onCleanup(callback)`：停止与释放资源

`abortSignal` 是当前脚本实例的 `AbortSignal`，用于检查 `aborted`、订阅 `abort`，或作为 `fetch` 等接口的取消信号。插件不能强行终止普通 JavaScript Promise；异步步骤结束后，操作页面或写入数据前仍需确认任务没有停止。

`onCleanup(callback)` 注册停止时的清理动作，返回撤销这次注册的函数。回调收到 `{ STscript }`，可返回 Promise。这里的 `STscript` 专门用于退出清理，不受已经取消的普通任务信号阻断。

它用于插件无法自行识别的副作用：创建的 DOM、样式节点、宿主事件订阅、观察器、函数替换、命令注入等。只使用托管监听和定时器时，插件能自行释放它们，无需逐个补清理回调。

生命周期规则：

- 顶层函数正常返回只结束本次启动执行，不触发 `abortSignal`；原生监听器、未被顶层等待的异步过程仍属于当前实例。实例本身不占执行锁，实际执行中的命令仍受重入管理。
- 每个任务保留一个当前实例，直到停用、删除、改名、替换脚本、重新执行、重置任务或退出所属预设；启动正文抛出异常也会停止该实例。实例身份只在本页内存中，不写入预设或设置，也不要求脚本为了保持有效而注册空监听器或空清理函数。
- 停止先触发 `abort` 并清除托管资源，再调用清理回调。多个清理回调不保证等待彼此；有先后依赖的操作放进同一个异步回调。
- 同一任务的替换执行等待旧实例的异步清理完成。清理失败会记录错误，等待旧清理的调用也可能失败；清理函数需完成自己的工作，不应永久等待。
- 多个 JavaScript 重启请求相遇时，较新的请求取消尚在等待的旧请求。停用、删除或重置会立即作废待启动请求；修改名称、脚本或类型则在保存完成后作废，失败保留原实例与待启动请求。已作废的旧等待完成后不会自行启动。纯斜杠任务仍允许并发调用。
- 任务停止不会自动撤回已经发出的聊天、删除已保存的数据或移除任意 DOM，这些效果由作者决定是否及如何撤销。

同步清理也可以在 `abortSignal.addEventListener('abort', handler, { once: true })` 中完成。处理函数直接发起的 `STscript` 会作为清理等待；如果先 `await` 再调用命令，应改用 `onCleanup` 回调参数里的 `STscript`。

循环任务总开关控制自动调度，不等同于立即卸载已经运行的脚本。停止一个任务可在列表禁用它；释放所有运行实例使用 `/xbtaskreset`，它保留任务定义。

## 什么时候查酒馆 API

调度、任务日志、托管资源、任务管理用本文接口。涉及下表中的酒馆业务时，先查原生 API 的签名、事件参数和保存方式，再在任务中调用。

| 要实现的能力 | 查什么 |
| --- | --- |
| 读取聊天、当前角色、当前聊天标识 | `SillyTavern.getContext()` 及聊天对象字段 |
| 修改聊天、聊天元数据或角色数据 | 对应写入、保存和界面刷新方法；仅改内存对象不等于保存 |
| 读取或修改当前预设、提示词条目及开关 | 预设管理器和当前 API 的提示词管理实现 |
| 修改生成提示词、请求参数、处理生成事件或流式结果 | 对应生成阶段的事件、参数可变性、返回值及生成调用路径 |
| 订阅聊天切换等宿主事件 | `eventSource`、`eventTypes` 和该事件的发出位置 |
| 打开酒馆弹窗、执行宿主操作 | 对应上下文方法或斜杠命令 |

阅读入口：

- [酒馆 JavaScript API 参考](../assistant/references/sillytavern-javascript-api-reference.md)：查询上下文、数据、事件和功能入口。
- [STscript 参考](../assistant/references/stscript-reference.md)：查询斜杠命令语法、参数和输出。

两份参考以酒馆 1.18 为基线。用于其他版本时核对目标版本的能力；涉及参考未收录的事件参数或模块导出时，沿参考列出的源文件查证。参考里的 `st.script`、`st.extensions` 等是文档分类，不是任务自动提供的 `st` 变量。

宿主上下文可通过 `SillyTavern.getContext()` 获取。上下文没有暴露的能力，才从已确认的宿主文件动态 `import()`；任务代码是函数体，不能直接放静态 `import` 声明。导入地址按酒馆页面的实际部署路径解析，而非按此 README 所在目录解析。

调用酒馆 API 产生的订阅和副作用仍由脚本负责清理。任务的停止信号不会自动传播到任意原生 API；调用前要确认对方是否支持取消。

## 管理已有任务：`window.XBTasks`

这些是页面级接口，可从任务外调用。`scope` 为 `global`、`character`、`preset` 或 `all`，默认 `all`；角色和预设都指当前选中的对象。

按名称查找时，会规范化 Unicode、移除零宽字符、去除首尾空白并忽略大小写；`all` 按全局、角色、预设的顺序取第一个匹配。需要明确修改范围时传入 `scope`。

| 接口 | 返回结果与用途 |
| --- | --- |
| `XBTasks.list(scope = 'all')` | 同步返回 `{ id, name, interval, floorType, timing, disabled }` 数组；`all` 返回 `{ global, character, preset }` 三组数组。`timing` 是实际时机，“随预设启用”显示 `preset_enter`，而非文件中的旧版回退值 |
| `await XBTasks.dump(scope = 'all')` | 返回含 `commands`、`triggerTiming` 等原字段的完整任务副本，用于读取与备份；指定范围返回数组，`all` 返回三组数组 |
| `XBTasks.find(name, scope = 'all')` | 返回 `{ scope, list, index, task }` 或 `null`；其中是当前对象引用，不是副本。保存修改使用下面的方法 |
| `await XBTasks.setCommands(name, commands, options?)` | 保存命令文本，停止原脚本实例并刷新列表；`options.scope` 默认 `all`，`options.mode` 为 `replace`（默认）、`append`、`prepend` |
| `await XBTasks.setJS(name, jsCode, options?)` | 自动包上 `<<taskjs>>` 标签，再按 `setCommands` 保存；传入的 `jsCode` 是块内 JavaScript |
| `await XBTasks.setProps(name, props, scope = 'all')` | 合并并保存任务属性；改名、替换 `commands` 或从启用改为禁用时停止原实例 |
| `await XBTasks.exec(name)` | 直接执行第一个匹配任务，返回最后执行片段的结果；此入口不检查任务的禁用状态 |

三个写入方法返回 `{ ok: true, scope, name }`，找不到任务会抛错。它们修改已有任务，不负责新建任务，也不会在保存后立即启动新代码。

`XBTasks.global`、`.character`、`.preset` 暴露当前原始任务列表引用；全局列表不保证内含脚本文本。读取完整内容用 `dump`，修改用保存方法，直接赋值不能替代持久化。

面向用户的执行与设置入口：

- `await window.xbqte(name)` 或 `/xbqte 任务名称`：检查禁用状态和冷却，重新运行已有任务；名称忽略大小写，同名时仍按全局、角色、预设顺序选择。返回执行结果或执行提示。
- `await window.xbtaskreset()` 或 `/xbtaskreset`：停止全部运行实例、移除动态订阅、清空冷却，并等待已登记的异步清理；保留任务定义。实际尚未结束的宿主命令继续保留防重入记录。
- `await window.setScheduledTaskInterval(name, interval)`：修改全局或角色任务间隔，接受 `0` 到 `99999`，返回设置提示。
- `/xbset status=on interval=3 timing=after_ai floorType=llm 任务名称`：修改全局或角色任务，可只传需要修改的参数；预设任务使用 `XBTasks.setProps`。

JavaScript 接口便于处理返回值和异常；`/xbqte`、`/xbtaskreset` 会把异常转成管道中的错误文字，不能仅凭命令 Promise 兑现判断成功。

## 分发任务文件

任务导入使用 JSON 对象，根字段 `type` 取 `global`、`character` 或 `preset`，根字段 `tasks` 为任务数组。`type` 决定导入位置；角色任务需要先选择角色，预设任务需要先选择聊天补全预设。导入是追加任务，不替换同名任务。

每个任务的主要字段为 `name`、`commands`、`interval`、`floorType`、`triggerTiming`、`disabled`、`buttonActivated`。`commands` 是完整脚本命令文本，`disabled: false` 表示启用，`buttonActivated: true` 表示在任务栏提供按钮。导入会重新生成 ID；任务的生命周期和触发规则与手动创建相同。

## 可直接运行的基础示例

下面的例子分别演示组合方式；接口全集及参数见上文。除首次运行示例外，每段各自保存成一个任务，再手动执行。

### 一次性等待下一个匹配的 AI 楼层

```text
<<taskjs>>
const off = addFloorListener(async ({ currentFloor }) => {
    off();
    await STscript(`/echo 已处理 AI 楼层 ${currentFloor}`);
}, { timing: 'after_ai', floorType: 'llm', interval: 1 });
<</taskjs>>
```

### 创建一个随任务卸载的按钮

```text
<<taskjs>>
const button = document.createElement('button');
button.type = 'button';
button.textContent = '查看聊天楼层数';
onCleanup(() => button.remove());
addListener(button, 'click', async () => {
    const tavern = SillyTavern.getContext();
    await STscript(`/echo 当前共有 ${tavern.chat.length} 条消息`);
});
document.body.append(button);
<</taskjs>>
```

按钮事件由插件托管；按钮节点由清理回调移除。这里没有定时器，也不需要顶层等待来维持运行。

### 订阅酒馆事件并撤销订阅

```text
<<taskjs>>
const tavern = SillyTavern.getContext();
const onChatChanged = () => {
    taskContext.log('当前聊天', { chatId: SillyTavern.getContext().chatId });
};
onCleanup(() => tavern.eventSource.removeListener(tavern.eventTypes.CHAT_CHANGED, onChatChanged));
tavern.eventSource.on(tavern.eventTypes.CHAT_CHANGED, onChatChanged);
<</taskjs>>
```

### 在退出时依次执行异步清理命令

```text
<<taskjs>>
onCleanup(async ({ STscript: cleanupCommand }) => {
    await cleanupCommand('/echo 正在清理任务');
    await cleanupCommand('/echo 任务清理完成');
});
<</taskjs>>
```

这个例子仅显示清理执行顺序。实际撤销操作放在相同位置；清理用的命令接口取自回调参数，和任务正文里的 `STscript` 区分开。

## 如何确认运行与排错

- 先手动执行，再测试自动触发；手动正常但自动不运行时，按触发时机、楼层编号、启用状态和执行锁逐项检查。
- 在关键步骤用 `taskContext.log/warn/error` 记录实际输入和结果，查看插件调试日志的 `scheduledTasks` 分类；回调异常同时查看浏览器控制台。
- JavaScript 块异常会被任务运行器记录，不保证向外抛出，后续命令片段仍可能执行。因此“执行接口已返回”不等于所有脚本步骤成功，需要检查预期效果或日志。
- 验证常驻任务时检查：重复运行后没有重复监听或重复界面；禁用任务后自己的资源已释放；预设任务切走后停止，切回来按原触发方式启动。
- `window.getTaskCooldownStatus()` 返回按运行键索引的冷却状态；`window.getTasksMemoryUsage()` 返回任务缓存及计数信息。`window.clearTaskCooldown()`、`window.clearTasksProcessedMessages()` 分别清理冷却和消息去重记录，用于重复调试，不会撤销脚本副作用。

本页接口的实现入口为 [scheduled-tasks.js](./scheduled-tasks.js)；命令结果和宿主取消桥接见 [core/slash-command.js](../../core/slash-command.js)。
