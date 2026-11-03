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

## 第一个任务：先手动跑通

1. 打开小白X的“循环任务”设置，勾选“启用循环任务”。点击“添加全局任务”，任务名称填 `测试任务`，勾选“启用任务”。
2. 将下方的完整 `<<taskjs>>…<</taskjs>>` 示例粘进“脚本命令”。触发时机选“AI消息后”（文件/API 值是 `after_ai`），再把楼层间隔填 `0`，勾选“注册任务按钮到主界面”。这组设置只手动执行。
3. 保存后点击 `测试任务` 按钮，或在聊天输入框执行 `/xbqte 测试任务`。应该看到“任务已执行”的提示；没有按钮时，检查设置里的“显示/隐藏按钮栏”，或先用命令测试。
4. 手动执行成功后再设置自动运行。全局/角色任务从间隔 `0` 改自动时，先填正数解锁下拉框；具体时机和计数见下文。

保存成功编辑器才会关闭；失败会提示并保留输入。单独保存或导入任务文件不会运行脚本；完整预设导入、重新启用“随预设启用”任务的行为见对应小节。修改名称、脚本或类型后，旧实例在保存完成时停止；停用、删除立即停止。正常使用需打开小白X总开关、“启用循环任务”和相应任务的“启用任务”。

### 脚本命令怎么写

“脚本命令”可以直接写斜杠命令，也可以包含一个完整的 JavaScript 块：

```text
<<taskjs>>
await STscript('/echo 任务已执行');
<</taskjs>>
```

- 块内是异步函数体，可以直接用 `await`、`return` 和本页列出的任务接口。
- 它运行在酒馆页面里，能用 `window`、`document` 等浏览器能力。**它不是沙箱**：运行别人分享的任务，等于允许它访问当前页面。
- 块外的文本按斜杠命令执行，多个片段按书写顺序依次等待。
- 块内局部变量不跨块共享；同一任务后面的 JavaScript 块会替换前面的脚本实例。需要一起保留的监听和状态，写在同一个块里。

## 任务放在哪里

| `scope` / 类型 | 保存位置 | 什么时候可用 |
| --- | --- | --- |
| `global` / 全局任务 | 插件设置，脚本由插件的任务存储保存 | 始终可用，不随角色或预设切换停止 |
| `character` / 角色任务 | 当前角色的 `data.extensions['xiaobaix-tasks'].tasks` | 只在这个角色的单聊中运行；群聊期间不运行 |
| `preset` / 预设任务 | 当前聊天补全预设里，`prompt_order` 中 `character_id: 100000` 条目下的 `xiaobai_ext.scheduledTasks` | 只在聊天补全 API 下、选中这个预设时运行 |

任务 ID 由插件在创建、导入时生成，不用手填。

### 运行实例什么时候停止

脚本启动后成为这个任务的“运行实例”。实例离开它的归属范围就会停止并执行清理（清理方式见下文 `onCleanup`）：

- **全局任务**：不随角色或预设切换停止。
- **角色任务**：切到其他角色、关闭聊天回到角色列表、进入群聊时停止。切换同一角色的不同聊天不会停止；但 `chat_changed` 时机的任务仍会重新执行，并替换旧实例。
- **预设任务**：切到其他预设，或离开聊天补全 API 时停止。

切回来时，任务按自己的触发时机重新启动一个新实例，不会恢复旧实例，也不会额外触发“插件初始化”。停用、删除、改脚本等其他停止原因见下文“生命周期规则”。

## 什么时候执行

### 触发时机

| 界面上的“触发时机” | 文件/API 值 | 实际触发条件与间隔 |
| --- | --- | --- |
| AI消息后 | `after_ai` | AI 生成结束；宿主无生成结束事件时用角色消息渲染事件。正间隔，按所选楼层编号取模 |
| 用户消息前 | `before_user` | 实际在用户消息**已经渲染后**触发，不是发送前拦截。使用正间隔 |
| 任意对话 | `any_message` | 上述用户消息或 AI 消息时机，使用正间隔 |
| 仅在“间隔楼层”的那个楼层执行一次 | `only_this_floor` | 上述消息时机，且楼层编号等于间隔值；不是永久的一次性执行标记，重生成仍可能执行 |
| 角色卡初始化 | `initialization` 或 `character_init` | 新聊天创建事件，运行时统一为 `character_init`；不参与间隔判断。需要已有开场消息；不是每次打开角色卡都执行 |
| 插件初始化 | `plugin_init` | 循环任务模块初始化后调度一次；不参与间隔判断，不是保存任务或切换预设后的回调 |
| 切换聊天后 | `chat_changed` | 打开/切换聊天后的事件；不参与间隔判断 |
| 随预设启用 | API 为 `preset_enter`，文件格式见“分发任务文件” | 仅预设任务；启用完成后启动，不参与间隔判断 |

这里的文件/API 值用于任务定义；`addFloorListener` 的 `timing` 另见它自己的参数表。

`interval: 0` 只对按消息计数的时机表示不自动执行。事件型时机仍由事件触发，因此纯手动任务使用 `after_ai` + `0`。预设任务即使间隔为 `0` 也能直接选择“随预设启用”；全局和角色任务调整时机时先把间隔设为正数。

### 楼层怎么数

`floorType` 决定计数：`all` 包含聊天数组中的全部消息；`user` 只计非系统的用户消息；`llm` 只计非系统的 AI 消息。当前楼层编号是对应消息数减一，最小为 `0`。酒馆隐藏消息也使用系统消息标记，所以手动隐藏或自动隐藏会影响 `user` / `llm` 计数，不影响 `all`。

按楼层调度跳过第 `0` 层；正间隔 `N` 在编号为 `N`、`2N` 等时匹配。例如选择“LLM楼层”、间隔 `3`，第一次匹配的是第 4 条计入的 AI 消息（编号 `3`，开场白也计入）。AI 后触发配合全部楼层时，需要同时满足 AI 时机和该编号，不能理解成“每 N 次 AI 回复”。

普通回复、reroll（重新生成）和 swipe 生成新候选都按同一套规则判定，不因 `swipe_id` 大于 `0` 跳过。只切换查看已有候选不算新生成，同一次完成通知重复到达也不重复执行。脚本若要求每层只执行一次、替换旧结果或撤销旧副作用，要自己处理。

### 为什么有时没触发

自动调度还受模块开关、任务启用状态、聊天切换期间的过滤、消息去重、任务冷却及执行锁约束。执行锁存在时，新的自动触发会**跳过，不排队**；任务发起的命令尚未结束时也是如此，避免命令产生的消息再触发任务。

所以常驻脚本应该注册好回调就结束顶层函数。顶层无限循环或长期等待会一直占住本次执行，挡住之后的自动调度。

### 随预设启用

需要跟着预设加载、并且能在停止后重新初始化的脚本，任务类型选“预设任务”，触发时机选“随预设启用”。

以下情况各启动一个新实例：页面加载、切入该预设、从其他 API 回到聊天补全、导入并选中预设、同名覆盖导入（先停旧实例，再启动新定义）。宿主的重复通知不会重复运行；留在同一预设内切换聊天不会重启。在列表里把已有的这类任务从停用改为启用并保存成功后，会立即启动一次。

启动会等酒馆应用完预设、插件初始化调度完成、正在执行的任务或清理结束；等待期间切走、停用、删除或重置，不会补跑。只编辑任务设置不算重新启用预设；首次配置后可手动执行，或切走再切回来。

**不要因为脚本“长期监听”就改用这个时机。** “启动代码只执行一次”和“监听持续有效”是两件事：顶层函数返回后，已注册的回调、异步初始化和任务接口仍然有效，直到任务停止。

| 脚本用途 | 是否选择“随预设启用” |
| --- | --- |
| 本预设专用面板、按钮、监听器，退出时能清理，回来时可重新创建 | 适合 |
| 全局常驻、需要跨预设保留的功能 | 不适合；保留全局任务及原启动时机 |
| 只允许初始化一次、缺少退出清理的老脚本 | 不适合；先确认能安全重启 |
| 每条消息后执行操作，或只在点击按钮时执行 | 用消息时机或手动任务 |

**分享给旧版插件时的表现不同。** 旧版不认识这个时机，会改成**每次切换聊天后执行**，不会因切换预设而启动，也不会报错。旧版每次切聊天都会重跑脚本：托管的监听和定时器会被自动释放，但你自己订阅的酒馆事件、创建的界面、替换的函数等，必须用 `abortSignal` / `onCleanup` 清理。发布前请在旧版里连续切两次聊天，确认没有重复监听、重复界面或重复副作用；不能安全重启的脚本不要选这个时机。

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
| `timing` | `'after_ai'` | 支持 `after_ai`、`before_user`、`any_message`、`only_this_floor`、`character_init`、`plugin_init`、`chat_changed`。这里不转换界面值 `initialization`，也不支持 `preset_enter`；预设专用常驻脚本在任务自身的“随预设启用”正文里注册监听 |
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

这些接口登记资源归属，任务停止时自动清除。异步回调返回的 Promise 若拒绝，会将异常记到控制台；这不等于停止任务时会等待所有回调完成，异步步骤之后仍要检查 `abortSignal.aborted`。重复定时器按浏览器周期触发，不会等待前一次异步回调结束，需要串行工作时自行安排下一次执行。

浏览器原生 `setTimeout`、`setInterval`、DOM 注册以及酒馆 `eventSource.on` 不在这份自动登记中。`addListener` 面向 DOM `EventTarget`，酒馆事件源使用自己的 `on` / `removeListener`。

### `abortSignal` 与 `onCleanup(callback)`：停止与释放资源

`abortSignal` 是当前脚本实例的 `AbortSignal`，用于检查 `aborted`、订阅 `abort`，或作为 `fetch` 等接口的取消信号。插件不能强行终止普通 JavaScript Promise；异步步骤结束后，操作页面或写入数据前仍需确认任务没有停止。

`onCleanup(callback)` 注册停止时的清理动作，返回撤销这次注册的函数。回调收到 `{ STscript }`，可返回 Promise。这里的 `STscript` 专门用于退出清理，不受已经取消的普通任务信号阻断。

角色任务的清理命令只在原角色访问仍有效时可用：同一访问内停用、重启或重置单个任务仍能调用；离开角色或关闭循环任务模块后，普通资源清理照常执行，但清理中的 `STscript` 会拒绝执行并将错误记到旧实例，其他已注册清理不受影响。切回同一角色或重新启用模块也不会恢复旧清理的命令权限。同步 `abort` 回调遵守相同规则。宿主命令默认操作当前聊天，插件不会临时切回旧聊天执行命令；需要跨角色收尾的脚本应释放自己持有的资源，而不是用当前聊天命令撤销旧聊天数据。

它用于插件无法自行识别的副作用：创建的 DOM、样式节点、宿主事件订阅、观察器、函数替换、命令注入等。只使用托管监听和定时器时，插件能自行释放它们，无需逐个补清理回调。

生命周期规则：

- 顶层函数正常返回只结束本次启动执行，不触发 `abortSignal`；原生监听器、未被顶层等待的异步过程仍属于当前实例。实例本身不占执行锁，实际执行中的命令仍受重入管理。
- 每个任务保留一个当前实例，直到停用、删除、改名、替换脚本、重新执行、重置任务、退出所属预设、离开所属角色或关闭循环任务模块；启动正文抛出异常也会停止该实例。实例身份只在本页内存中，不写入预设或设置，也不要求脚本为了保持有效而注册空监听器或空清理函数。
- 停止先移除动态楼层订阅，再触发 `abort`、清除托管定时器和 DOM 监听，最后调用清理回调。多个清理回调不保证等待彼此；有先后依赖的操作放进同一个异步回调。
- 同一任务的替换执行等待旧实例的异步清理完成。清理失败会记录错误，等待旧清理的调用也可能失败；清理函数需完成自己的工作，不应永久等待。
- 多个 JavaScript 重启请求相遇时，较新的请求取消尚在等待的旧请求。停用、删除或重置会立即作废待启动请求；修改名称、脚本或类型则在保存完成后作废，失败保留原实例与待启动请求。已作废的旧等待完成后不会自行启动。纯斜杠任务仍允许并发调用。
- 任务停止不会自动撤回已经发出的聊天、删除已保存的数据或移除任意 DOM，这些效果由作者决定是否及如何撤销。

同步清理也可以在 `abortSignal.addEventListener('abort', handler, { once: true })` 中完成。处理函数直接发起的 `STscript` 会作为清理等待；如果先 `await` 再调用命令，应改用 `onCleanup` 回调参数里的 `STscript`。

取消勾选“启用循环任务”会停止全部运行实例，按上述顺序执行清理，并移除任务按钮栏；任务定义保留。重新勾选等同一次模块初始化：“插件初始化”任务和当前预设的“随预设启用”任务会启动，其他时机等待各自的事件。只停止一个任务时在列表禁用它；不关模块而释放全部运行实例时使用 `/xbtaskreset`。

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
| `XBTasks.list(scope = 'all')` | 同步返回 `{ id, name, interval, floorType, timing, disabled }` 数组；`all` 返回 `{ global, character, preset }`。只有“随预设启用”被转成 `preset_enter`，其他 `timing` 保留原任务值，所以可能读到 `initialization` |
| `await XBTasks.dump(scope = 'all')` | 返回含 `commands`、`triggerTiming` 等原字段的完整任务副本，用于读取与备份；指定范围返回数组，`all` 返回三组数组 |
| `XBTasks.find(name, scope = 'all')` | 返回 `{ scope, list, index, task }` 或 `null`；其中是当前对象引用，不是副本。保存修改使用下面的方法 |
| `await XBTasks.setCommands(name, commands, options?)` | 保存命令文本，停止原脚本实例并刷新列表；`options.scope` 默认 `all`，`options.mode` 为 `replace`（默认）、`append`、`prepend` |
| `await XBTasks.setJS(name, jsCode, options?)` | 自动包上 `<<taskjs>>` 标签，再按 `setCommands` 保存；传入的 `jsCode` 是块内 JavaScript |
| `await XBTasks.setProps(name, props, scope = 'all')` | 合并并保存任务属性；改名、替换 `commands` 或从启用改为禁用时停止原实例 |
| `await XBTasks.exec(name)` | 直接执行第一个匹配任务，返回最后执行片段的结果；此入口不检查任务的禁用状态 |

三个写入方法成功返回 `{ ok: true, scope, name }`，找不到任务或保存失败会抛错。它们修改已有任务，不负责新建任务，也不因修改脚本立即启动新代码。例外是 `setProps(name, { disabled: false }, 'preset')`：把已有的“随预设启用”任务从停用改为启用并保存成功后，会按该时机启动一次。

`setProps` 用任务字段名，例如 `triggerTiming`（不是 `list()` 的 `timing`）、`commands`、`interval`、`floorType`、`disabled`、`buttonActivated`。`setProps` 的第三个参数直接是范围字符串；`setCommands` / `setJS` 的第三个参数才是含 `scope` 的选项对象。修改预设时机可传 `triggerTiming: 'preset_enter'`，API 会写成正确的文件格式。

`XBTasks.global`、`.character`、`.preset` 暴露当前原始任务列表引用；全局列表不保证内含脚本文本。读取完整内容用 `dump`，修改用保存方法，直接赋值不能替代持久化。

面向用户的执行与设置入口：

- `await window.xbqte(name)` 或 `/xbqte 任务名称`：检查禁用状态和冷却，重新运行已有任务；名称忽略大小写，同名时仍按全局、角色、预设顺序选择。返回执行结果或执行提示。
- `await window.xbtaskreset()` 或 `/xbtaskreset`：停止全部运行实例、移除动态订阅、清空冷却，并等待已登记的异步清理；保留任务定义。实际尚未结束的宿主命令继续保留防重入记录。
- `await window.setScheduledTaskInterval(name, interval)`：修改全局或角色任务间隔，接受 `0` 到 `99999`，返回设置提示。
- `/xbset status=on interval=3 timing=after_ai floorType=llm 任务名称`：修改全局或角色任务，可只传需要修改的参数；预设任务使用 `XBTasks.setProps`。

JavaScript 接口便于处理返回值和异常；`/xbqte`、`/xbtaskreset` 会把异常转成管道中的错误文字，不能仅凭命令 Promise 兑现判断成功。

## 分发任务文件

### 一份可以直接导入的文件

把以下内容保存为 UTF-8 的 `.json` 文件，从循环任务设置的导入入口选择它。导入后执行 `/xbqte 导入测试`，应看到“导入成功”：

```json
{
  "type": "global",
  "tasks": [{
    "name": "导入测试",
    "commands": "/echo 导入成功",
    "interval": 0,
    "floorType": "all",
    "triggerTiming": "after_ai",
    "disabled": false,
    "buttonActivated": true
  }]
}
```

推荐按这个对象格式分发：根字段 `type` 取 `global`、`character` 或 `preset`，`tasks` 是任务数组。角色任务先打开目标角色的单聊，预设任务先选中目标聊天补全预设。导入会**追加**任务，不覆盖同名项；重复导入前先检查列表。同一范围的任务使用不同名称，避免按名称执行/修改时选到前一个，以及同名运行实例互相替换。

`commands` 是完整脚本命令文本，JavaScript 也必须包 `<<taskjs>>…<</taskjs>>`；JSON 字符串里的换行和双引号要转义，程序生成文件时使用 `JSON.stringify`。`disabled: false` 表示启用，`buttonActivated: true` 表示提供按钮。ID 由导入时生成，不用手填。

### “随预设启用”的文件写法

编辑器和 `XBTasks.setProps` 接受 `preset_enter`，但导入文件使用以下三个字段（外层 `type` 必须是 `preset`）：

```json
{
  "triggerTiming": "chat_changed",
  "interval": 1,
  "x": { "presetStart": true }
}
```

这是合入任务对象的字段片段，不是完整导入文件。手写文件不能直接把 `triggerTiming` 写成 `preset_enter`，导入器会把它当未知值改为 `after_ai`。完整预设导出和单任务导出都采用上述格式；最稳妥的方法是在界面配置好再导出。

未知 `floorType` 回落为 `all`，未知时机回落为 `after_ai`；因此导入成功不等于时机填对。导入后核对任务列表的时机、启用状态和手动测试结果，再分发给别人。

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

本页接口的实现入口为 [scheduled-tasks.js](./scheduled-tasks.js)；命令结果和宿主取消桥接见 [core/slash-command.js](../../core/slash-command.js)；保存与生命周期的实现规则见 [design.md](./design.md)。
