# 小白X制卡能力参考

本文从插件实现整理，说明角色卡作者能用小白X（LittleWhiteBox）做什么、代码运行在哪里、能调用哪些函数，以及各部分何时创建和销毁。

迁自 cf-card-xiaobaix 1.6.0，已适配当前角色卡工作区。完整接口以插件 `docs/user/tasks.md` 和对应源码为准；本文的插件路径相对于 ReadSkill 返回的插件目录。

## 0. 先选运行位置

聊天卡的前端通常是：卡约定输出格式，正则匹配文本块，替换成 HTML。替换结果是普通 HTML 时由酒馆净化后插入楼层；写成代码块时由小白X渲染为楼层 iframe。循环任务用于后台动作和跨楼层常驻界面。

| 位置 | 代码在哪里执行 | 寿命 | 适合做 |
| --- | --- | --- | --- |
| 酒馆正则替换 HTML（酒馆原生） | 不是 iframe；酒馆净化后插入楼层 | 随楼层 | 美化正文、状态栏等无脚本显示 |
| 楼层 iframe（代码块渲染，常由正则替换产生） | 每个楼层里的独立 iframe | 随楼层存在；swipe、编辑、切聊天都会重建 | 本楼的排版、面板、读变量显示、按钮 |
| 角色模板 `xiaobaix-template` | 楼层 iframe，由插件把 AI 输出的字段填进模板 | 同楼层 iframe | 每楼固定版式，只需要把 AI 输出的字段填进 HTML |
| 循环任务 `<<taskjs>>` | 酒馆页面本身（`window` 就是酒馆页面） | 直到任务被停止；**切换聊天不会停止** | 变量初始化、监听酒馆事件、全屏终端等跨楼层常驻界面 |

判断方法：

- 属于某一楼文本的界面，用正则匹配该楼的格式块；需要脚本就替换成代码块走 iframe。
- 要“一直在”的东西（全屏界面、跨楼层监听），才放循环任务。楼层 iframe 会随 swipe 和编辑销毁。
- 酒馆正则替换出的 HTML 会被净化：`<script>`、`onclick` 等被去掉，`class="x"` 变成 `class="custom-x"`。

## 1. 需要打开的开关

在小白X设置中：

| 功能 | 需要打开 |
| --- | --- |
| 全部功能 | 小白X总开关 |
| 循环任务 | “启用循环任务” |
| 楼层 iframe 渲染 | “渲染”开关（默认开）；可选“渲染楼层”数限制、Blob 渲染 |
| 角色模板 | 模板编辑器开关（默认开）；TauriTavern 托管界面下不可用 |
| 变量卡 | “变量管理”勾选（默认开），并把右侧变量模式切到卡所用的 3.0 或 2.0 |

卡内任务随卡加载，**没有“允许运行”确认**。用户控制它的方式是“启用循环任务”和单个任务的启停。

“启用循环任务”取消勾选时，会停止所有正在运行的任务实例并执行它们的 `onCleanup`。重新勾选后只触发 `plugin_init` 时机；`chat_changed` 挂载任务要等下一次切换聊天。调试时也可用 `/xbqte` 手动执行；提供了快捷按钮的任务可点按钮。

## 2. 循环任务

### 2.1 卡里怎么放

角色任务保存在 `data.extensions['xiaobaix-tasks'].tasks`（数组）。在助手工作区编辑 `tasks/<任务名称>.md`：文件头的 JSON 包含 `id`、`name` 和 `settings`，后面是完整命令；格式见 CardFiles 文件指南。一次写回同时保存设置和脚本。下面是卡内存储格式。CardFiles 新建任务时，省略的设置取 `interval: 1`、`floorType: "all"`、`triggerTiming: "chat_changed"`、`disabled: false`；要别的时机就在 `settings` 里写明。

```json
{
  "type": "character",
  "tasks": [
    {
      "id": "card_terminal_init",
      "name": "[卡名] 终端挂载",
      "commands": "<<taskjs>>\n/* 脚本 */\n<</taskjs>>",
      "triggerTiming": "chat_changed",
      "interval": 0,
      "floorType": "all",
      "disabled": false,
      "buttonActivated": false,
      "x": {}
    }
  ],
  "exportDate": "2026-10-31T00:00:00.000Z"
}
```

插件实际读取的任务字段：

| 字段 | 取值 | 说明 |
| --- | --- | --- |
| `name` | 字符串 | 同时用作运行身份、冷却键、按钮文字和 `/xbqte` 查找名。不要与常见全局任务同名：`/xbqte` 和按钮按“全局 → 角色 → 预设”顺序找第一个同名任务 |
| `commands` | 斜杠命令文本和/或 `<<taskjs>>…<</taskjs>>` 块 | 见 2.3 |
| `triggerTiming` | 见 2.2 | 卡内存储缺少此字段时调度按 `after_ai` |
| `interval` | **数字**，0–99999 | 卡内存储缺少 `interval` 的任务永远不会被消息时机触发；写成字符串 `"3"` 时 `only_this_floor` 永不匹配 |
| `floorType` | `all` / `user` / `llm` | 缺省 `all` |
| `disabled` | 布尔 | `true` 时不调度 |
| `buttonActivated` | 布尔 | `true` 时在输入框上方的快速回复栏显示按钮，点击等于 `/xbqte 名称`；`false` 隐藏快捷按钮，不影响自动调度 |
| `id` | 字符串 | 工作区文件头保留已有任务的 ID，改名也写回同一个任务 |
| `x` | 对象 | 保留已有扩展设置；新建角色任务可用 `{}`，`x.presetStart` 只对预设任务有意义 |
| `createdAt` | ISO 时间 | 仅记录 |

表外字段插件不读，只会增大卡体积。

素材装载、页面样式、开局变量初始化等后台任务用 `buttonActivated: false`。只有玩家主动点击后有明确用途与反馈的动作才开启按钮。`chat_changed` 配 `interval: 0` 仍会自动运行；任务编辑器显示的“手动触发”不能代替实际调度契约。核验位置：插件 `modules/scheduled-tasks/scheduled-tasks.js` 的 `tasksToExecute` 过滤与 `getActivatedTasks`。

单独导入任务文件时，`type` 决定导入位置（`global` / `character` / `preset`），导入是追加，不替换同名任务。导入角色任务前要先打开该角色。

### 2.2 触发时机

各时机的触发条件、`interval` 的作用、楼层计数（`floorType`）、swipe 与重新生成的判定、切聊天后约 2 秒的静默期、执行锁“跳过不排队”，统一见插件 `docs/user/tasks.md` 的“什么时候执行”。制卡时记住三点：

- `all` 配合 `after_ai` 时要同时满足“AI 刚生成”和“编号能整除”，不是“每 N 次 AI 回复”；按 AI 回复计数用 `floorType: "llm"`。
- swipe 和重新生成都会再次触发；“每层只结算一次”由脚本自己记录已处理的楼层和候选（例如用 `swipe_id` 或 `send_date` 作键）。
- `plugin_init` 时角色和聊天可能尚未就绪，角色卡的挂载入口不要只靠它。

### 2.3 `commands` 与 `<<taskjs>>`

写法、块内注入的全部名字（`taskContext`/`ctx`、`STscript`、`addFloorListener`、托管监听与定时器、`abortSignal`、`onCleanup`）及其返回值，见插件 `docs/user/tasks.md` 的“脚本命令怎么写”和“JavaScript 块内提供的接口”。制卡要点：

- **块内代码在酒馆页面本身执行，不是 iframe，也不是沙箱。** `window`、`document`、`SillyTavern.getContext()`、`$`、`toastr` 都可直接用；不需要、也不应该“穿透到 `window.parent`”。
- 执行前整段做一次宏替换，所以 `/setvar key=a 1 | /echo {{getvar::a}}` 里的宏拿到的是执行前的旧值；块内代码本身不做宏替换。
- 同一任务里后一个 JS 块会替换前一个块的实例，长期保留的监听和状态写在同一个块里。

插件只会自动清理“托管”的东西：`addListener` 的监听、`*Safe` 定时器、`addFloorListener` 回调。以下都要作者在 `onCleanup` 里自己撤销：

- 自己插入页面的 DOM 和样式表；
- 直接用 `addEventListener`、`setInterval` 注册的监听和定时器；
- `eventSource.on(...)` 订阅的酒馆事件；
- 挂到 `window` 上的函数。

### 2.4 实例何时停止、何时不停止

完整规则见插件 `docs/user/tasks.md` 的“运行实例什么时候停止”和“生命周期规则”。制卡要点：角色任务在切到别的角色、进入群聊或关闭聊天时停止（不论由什么方式启动）；同一角色内切换聊天不停止，但 `chat_changed` 任务会重新执行并替换旧实例。

常驻脚本的顶层代码应注册完回调就结束，不要写无限循环或长期 `await`，否则会一直占着执行锁，阻止其他任务的自动触发。

### 2.5 管理与排错

`/xbqte`、`/xbtaskreset`、`/xbset` 和 `window.XBTasks` 见插件 `docs/user/tasks.md` 的“管理已有任务”。

- JS 块抛出的异常只进浏览器控制台和小白X调试日志，没有弹窗，后续片段仍会执行。斜杠命令片段执行出错会中断本次触发里排在后面的任务。
- 先手动执行确认效果，再测试自动触发；常驻任务要验证：重复执行后没有重复界面或监听，停用任务后界面消失，切到别的角色后界面消失。

## 3. 楼层 iframe 前端

### 3.1 什么会被渲染成 iframe

识别规则见插件 `docs/user/render.md` 的“哪些代码块会被渲染”。小白X只处理楼层显示结果中的**代码块**（`<pre><code>`），所以：

- AI 输出、开场白或世界书引导 AI 输出的 HTML 要放在代码块里（三个反引号）。直接写在正文里的 HTML 不会被渲染成 iframe。
- 酒馆正则的替换结果，只有写成代码块时才会被渲染成 iframe；否则按酒馆正则美化处理（净化、无脚本）。
- 渲染开启时，未被识别为 HTML 的代码块照常显示，识别出的代码块被隐藏，换成 iframe。

<a id="codeblock-text"></a>
**正则替换成代码块时，源码会先过酒馆的文本处理。** 小白X读的是 `<code>` 的文字，下列字符在到达 iframe 前已被改写：

| 写法 | 酒馆的处理 | 后果与写法 |
| --- | --- | --- |
| `$1`、`$<名>` | 正则替换把它当捕获组引用（`extensions/regex/engine.js` 422） | 脚本里不写 `$` 加数字或 `<`；需要时用 `String.fromCharCode(36)` |
| `{{…}}` | 替换结果最后整体做一次宏替换（`engine.js` 444） | 不写 `{{` |
| `&amp;` 等字面实体 | 代码块里还原一层 | 脚本里写 `'\u0026amp;'` |
| 成对的 `*`、`_` | “自动修复 Markdown”（默认开）删掉紧贴它们的空格，可跨行配对；一行里 `*` 为奇数时在行尾补一个（`power-user.js` 429–468，`script.js` 1816） | `a / b * 100, c * 100` 变成 `b *100, c* 100`；CSS 注释 `/* … */` 同样被改。乘法改写成除法或拆行，CSS 不写注释 |

发现脚本在编辑器里正确、进楼层后却异常时，读取酒馆真实渲染后的 `<code>` 文字与原文逐字比较，定位第一个差异。代码块里的文本转换也是运行链路的一部分，不能只检查原始 JS 的语法。

### 3.2 iframe 里可以直接用的函数

`STscript`、`callGenerate`、头像样式，以及 `request-context` / `iframe-ready` 拿 `st-context`、`st-event` 事件推送，统一见插件 `docs/user/render.md` 的“网页里可以用的函数”。

受管玩法状态的读取、按钮写入和失败反馈由所用变量版本的技能说明（ReadSkill builtin-state3 或 builtin-state2）。

### 3.3 iframe 需要酒馆的数据或函数时

iframe 拿得到，有四种办法，按推荐顺序：

1. **有对应斜杠命令的，用 `STscript`。** 普通变量读写（`/getvar` `/setvar` `/xbgetvar` `/xbsetvar`）、生成（`/gen` `/xbgen`）、执行快速回复和任务（`/run` `/xbqte`）都走这条。发送普通玩家文本按[消息按钮](<#message-buttons>)处理；有意执行发送命令（`/send` `/trigger`）时按命令文档处理参数与转义。受管玩法状态的写入使用所用变量版本的入口（见第 5 节），不能以普通变量命令代替记账。
2. **只需要只读快照的，用 `iframe-ready` / `request-context` 拿 `st-context`。**
3. **复杂逻辑交给循环任务。** 任务在酒馆页面里挂一个卡专用的接口（例如 `window.MyCardApi`），iframe 用 `parent.MyCardApi.xxx()` 调用，或用 `STscript('/xbqte 任务名')` 触发任务。这样酒馆事件订阅和长期状态都由任务管理和清理，iframe 只负责显示和按钮。
4. **直接访问父页面。** 楼层 iframe 没有 `sandbox` 属性，且与酒馆页面同源，所以 `parent.SillyTavern.getContext()`、`parent.document` 都能用。适合一次性读取或调用；**不要从 iframe 往父页面注册长期监听、定时器或 DOM**：iframe 在 swipe、编辑、切聊天时被销毁，这些注册不会自动撤销，会重复叠加并持有已销毁页面的引用。

这四种办法都等于让卡代码以用户身份操作酒馆。发布前把卡会执行的命令和接口写清楚。

### 3.4 iframe 的寿命与显示限制

- 所在楼层 swipe、编辑、删除，或切换聊天时，iframe 被销毁重建，页面内的 JS 变量全部丢失。需要保留的状态按第 5 节区分界面偏好与玩法记录，或交给循环任务管理。
- 生成过程中代码块保持隐藏，生成结束后才渲染。
- 高度随内容自动调整，iframe 自身不滚动；`100vh` 等视口高度会被改写为自动高度。要做全屏界面，放循环任务。
- 打开“渲染楼层”数限制时，较早楼层的 iframe 会被拆掉，恢复成代码块显示。
- 只想让最新一楼带 iframe（台口、状态页这类“当前情形”），给替换成代码块的那条正则设 `maxDepth: 0`，再加一条同匹配、`minDepth: 1` 的正则把旧楼换成纯文字版。深度按非系统消息从最新一楼往前数（酒馆 `script.js` 1804–1812，`extensions/regex/engine.js` 361–371）。旧楼不再各开一个 iframe，也不会各自轮询变量。
- TauriTavern：楼层代码块渲染和注入函数相同；角色模板不可用。

<a id="frontend-validation"></a>
### 3.5 样式、脚本作用域与交互验收

**宿主里的正文样式。** 酒馆 1.18.0 的全局 `*` 规则给每个元素设置 `text-shadow`，默认宽度为 2px。浅色纸面上的深色字会因此发糊。给本卡根容器及其后代显式设置 `text-shadow: none`，限定在卡自己的选择器内；只改根容器不够，因为子元素也被宿主的 `*` 直接选中。普通 iframe 不继承父文档 CSS，这项检查针对插入宿主楼层的正文，以及任务注入宿主的界面。实际效果以当前宿主计算样式为准。

**iframe 内的脚本作用域。** 普通 `<script>` 顶层的 `var` 和函数声明会落在该 iframe 的全局作用域。iframe 自己也有浏览器原生 `Window` 属性：例如 `window.closed` 只读，顶层 `var closed` 不能当作可写的面板开关，非严格模式的赋值还可能没有报错。把界面状态和事件处理放进 IIFE 等局部函数作用域；仅有意公开的接口才挂到 `window`。换一个变量名只避开一次撞名，局部作用域才隔离整个脚本。

**按玩家动作验收。**
- 用目标酒馆样式和真实渲染管线打开页面，读取正文、对白、题字等元素的计算样式，并看桌面与手机截图；颜色对比度合格不代表没有模糊阴影。
- 点击每个实际可见控件，检查内容是否显隐、状态是否改变；再触发一次变量刷新，确认收起状态等界面选择不会被重绘覆盖。
- 展开/收起使用原生按钮，核对 `aria-expanded` 与实际显隐一致；用 Enter、Space 连续操作，重绘替换按钮时保留焦点。
- 核对自动任务按事件启动且未暴露无用途按钮；需要玩家操作的按钮则检查成功反馈和失败提示。
- 编译通过、截图存在、控制台无错误都不能证明点击逻辑有效。修复前用同一操作稳定复现，修复后断言可见结果，而不是搜索源码里有没有某个变量名。

<a id="state-panel-refresh"></a>
### 3.6 面板怎样跟随当前变量

显示当前状态的面板由卡自己的脚本重读变量，2.0、3.0 都适用。楼层渲染、正文生成结束与独立变量结算是不同的时机；第 3.2 节的普通聊天消息不表示变量已结算，收到后延迟一次读取也可能早于实际写入。

- iframe 打开时立即读一次，随后用自身的 `window.setInterval` 每 500ms 读取本面板用到的根。每次从 `window.parent.SillyTavern.getContext().variables.local.get(root)` 取当前值，不缓存上一个聊天的变量对象。
- 字符串直接比较，返回对象时用 `JSON.stringify` 比较；值变了才解析、更新显示。根尚未初始化或已被清空时显示空状态；读取失败显示原因，不把上一次成功值当成当前值。
- 定时读取只负责显示；按钮按所选变量版本提交，完成后重读实际值。展开状态、当前标签和输入内容留在界面里，更新数值时保留。
- 定时器在 iframe 自己的 `window` 上创建，随 iframe 销毁；`pagehide` 时清理。常驻任务界面用第 2.3 节的托管定时器和清理机制。

验收时保持当前面板打开，从面板以外修改变量，并分别检查独立更新、撤销、swipe、清空或重置，以及切聊天后新面板的显示。面板应跟随实际当前值，不需要玩家手动刷新页面。单次动画、音效等需要区分事件来源的效果，另读 [2.0 变化通知](<../../../variables/state2/skill/references/xiaobaix-game-state.md#state-atoms>)或 [3.0 单次反馈](<../../../variables/state3/skill/references/card-side.md#effects>)；数值增加也可能是撤销或恢复，不直接等同于新奖励。

<a id="message-buttons"></a>
### 3.7 Sending player text from a button

A button that sends ordinary player text uses the host's `#send_textarea` and `#send_but`, the same route as manual input. Set the textarea value, dispatch its `input` event and activate the send button. Preserve an existing player draft: offer to insert/append or leave the composed text for confirmation instead of silently replacing it. This follows the host's normal text handling; it does not promise to disable native macros or a leading slash command.

Concatenating player prose into `STscript('/send ' + text)` also makes it command source: `|` and `{{…}}` can be parsed as pipeline/macro syntax. Use command execution only when a command is intended and its arguments are escaped according to the STscript reference. This distinction is independent of the variable version.

While story generation is running, keep the sending control unavailable and restore it when generation ends or stops. Read the host's generation state/events through its documented API; a fixed delay is not a completion signal. Await a panel's own asynchronous operation before accepting another activation of that operation. An update to the numeric display must not release a pending button.

Sending text is not itself a state commit. Decide whether the button submits a state action or asks the model to describe a new action; an already-settled summary must not cause the updater to settle that event again. Keep gameplay writes on the chosen variable API.

Acceptance: send text containing a pipe and macro-shaped text through the normal composer route, preserve an existing draft, try activation while generating and while a button operation is pending, and verify one intended message/action. Check the final chat message and state, not merely that a click handler ran.

## 4. 任务与 iframe 协作

任务负责常驻和酒馆事件，iframe 负责单楼显示。复杂逻辑可以由任务挂一个卡专用接口到 `window`，iframe 从 `parent` 调用；接口由任务创建，并在 `onCleanup` 和主动卸载时按实例身份移除，防止旧实例清理新实例。返回执行结果给 iframe，不以“触发成功”冒充“业务已完成”。

**跨楼层共享固定图片。** [随卡图片](<../frontend/portable-images.md>)由专用任务提供给宿主页和各楼 iframe 共用；画面只引用当前要显示的图片，加载任务尚未运行时其余内容仍能看。

只需直接读写受管状态时，用所用变量版本的宿主公开接口即可（见第 5 节），不需要另建一套桥。

任务主动推送给 iframe 时，向 `document.querySelectorAll('.mes iframe.xiaobaix-iframe')` 的 `contentWindow.postMessage(...)` 发送，并带上卡自己的 `source` 字段，iframe 端按 `source` 过滤。

<a id="variables"></a>
## 5. 变量

小白X的变量都存在**当前聊天的本地变量**（`chat_metadata.variables`）里，不跨聊天。按用途先分清两类：

| 类型 | 存什么 | 怎么写 | 删楼、切 swipe 时 |
| --- | --- | --- | --- |
| **普通界面变量** | 面板展开、当前标签页、CG 槽开关、立绘档位等**纯展示状态** | `variables.local.set(key, JSON.stringify(val))` 保存，`variables.local.get(key)` 读取后解码 或 `/getvar` `/setvar`，键名带卡专属前缀 | 原样保留，不参与楼层回滚 |
| **受管玩法状态** | 生命值、金钱、时间、好感、外出剩余次数、抽卡保底、已解锁里程碑等**影响玩法或剧情事实的状态** | 变量 3.0 见 ReadSkill builtin-state3；变量 2.0 见 ReadSkill builtin-state2 | 由所选变量版本恢复 |

酒馆读取本地变量时会把数字样式的字符串和 `true`/`false` 转成数字，未定义返回空字符串。用 `variables.local` 存普通界面变量时，存 `JSON.stringify(值)`，读出后再 `JSON.parse`。

<a id="varevent"></a>
### 5.1 条件规则与动作：`<varevent>`

`<varevent>` 是条件规则编辑器读写的文本格式，用条件选择模型资料和要执行的动作。制卡时写在世界书条目的正文里，通过 CardFiles 保存该条目的 `.md` 文件；作者也能在条件规则编辑器里继续修改。制作时怎样从玩法选用它，见[主技能的变量流程](<../SKILL.md#变量>)。

| 规则需要什么结果 | 使用方式 |
| --- | --- |
| 改变模型此时看到的描写、信息或规则 | `condition` + `display`，例如同一人物不同好感阶段的行为 |
| 条件成立后执行确定的操作 | `condition` + `js_execute`，`display` 可以留空；JS 可调用已核实的接口或通过 `STscript(...)` 调用酒馆命令 |
| 本轮叙事与回合后操作配套 | 同一事件同时写 `display` 和 `js_execute`，例如提供解锁事件的叙述依据，并在本轮成功后记录已触发 |

动作可以组合变量结算、世界书条目启停或内容修改、调用已有快捷回复等能力。先查[命令与 API 文档](<#internal-docs>)确定实际调用与目标；编辑器的常用动作生成器提供常见写法，自定义 JS 可表达卡自己的逻辑。以下是纯文字分档示例，不是条件规则的能力上限：

```text
<varevent>
[event.礼防]
display: "她对你尚在礼数之内。"
[event.倾心]
condition: var(`西厢.人物.莺莺.好感`) >= val(`40`)
display: "她已对你动了心。"
[event.寒霜]
condition: var(`西厢.人物.莺莺.好感`) < val(`0`)
display: "她把你当作轻薄之人。"
</varevent>
```

**选择规则。** 从最后一个事件往前找，第一个条件成立的事件胜出，整块换成它的 `display`；没有 `condition` 的事件视为成立，`display` 和 `js_execute` 都为空的事件直接跳过。所以兜底档写在最上面，越具体的档越靠下；互斥的特殊档（如负好感）放最下面优先判断。都不成立时整块替换为空。

**写法。**
- 事件头 `[event.名字]`，下面是 `condition:`、`display:`、`js_execute:` 三种行，各占一行开头。
- `display` 用双引号包住时可以跨行，内容里的 `"` 写成 `\"`；不加引号时一直读到下一个事件头或键行。
- `var(\`路径\`)` 读本地变量，支持点号路径，变量 2.0 和 3.0 的受管值都能这样读；`val(\`文字\`)` 是常量。`>` `>=` `<` `<=` 比较中，变量不存在或为 null 时不成立；数字字符串按数值比较，否则按字符串比较。相等、组合用 JavaScript 的 `==`、`&&`、`||`、`!`。
- 一个条目里可以放多个 `<varevent>`，各自独立选择，例如“心意”看好感、“身体”看情动加好感。
- `display` 里的 `{{user}}` 等酒馆宏照常展开。

**时机。** 正式生成在最终请求组装时选一次：选中的 `display` 进入提示词，本轮成功后执行同一事件的 `js_execute`，不在回复后重新按变化后的值选档。失败、取消、切聊天不执行。预览、2.0 与 3.0 独立更新使用的 `dryRun` 组装也会选择 `display` 并展开取值宏，条件与宏读取同一份本次状态；不收集待执行事件，也不执行脚本。后台辅助请求同样只展开内容。这是随请求组装判定的规则，不是变量一变就立即运行的监听器；回合后改值或修改世界书不会改写已经发出的请求。

**组织动作。** 同一块只选一个事件；可同时发生的独立规则各用一块。同一事件有多个动作时，在它的 `js_execute` 中按实际顺序编排。脚本可用 `ctx`、`getVar`、`setVar`、`STscript`；`setVar` 是普通本地变量写入；受管玩法状态的改变走所用变量版本的入口并检查回执，变量 3.0 的状态后果写在定义的规则与触发里。调用存在并不保证成功，也不表示外部副作用能随删楼或 swipe 撤销。

**持续与一次性。** 条件持续成立，就可能每次正式生成都选中；单轮脚本只执行一次不等于整个故事只触发一次。一次性解锁或奖励在受管状态中保存完成标记，条件同时检查尚未完成，动作成功后记录完成；失败不标成已完成。内容选择、发奖、解锁各自的重复策略应按玩法明确，而不是只写一个阈值条件。

**验收。** 在隔离数据上逐档核对实际请求中胜出的 `display`。插件维护者的解析、条件与回合验证在 `modules/variables/tests/prompt-variables.test.js`，不能把读过测试源码当成已运行。

核验：插件 `modules/variables/varevent/document.js`（解析）、`varevent/condition.js`（条件）、`varevent/run.js`（回合）与 `varevent-editor.js`（组装）。

<a id="media"></a>
## 6. 画图与语音接口（可选）

图片可自备、运行时生成或混合使用，与界面形态独立。自备素材使用可访问 URL 或 Data URL，见[素材安排](<xiaobaix-heavy-ui.md#assets>)。

公开入口位于宿主页：循环任务用 `window.xiaobaixDraw` / `window.xiaobaixTts`，同源楼层 iframe 用 `window.parent.xiaobaixDraw` / `window.parent.xiaobaixTts`。它们不是 iframe 的直接注入全局。

- `await xiaobaixDraw.generate(request)` 返回 `{ images: Blob[] }`；必填 `prompt`，其他字段按选定供应商从内部文档查阅。拿到的图小白X会自动收进它的图库，归调用开始时的角色或群聊，失败时已取得的部分图也收；这类记录不随图库缓存过期。用户开了“自动保存新生成的图片”，开关打开之后画的图还会存到酒馆服务器（`public-api.js` 124–135，`public-gallery.js`，`image-autosave.js`）。卡自己另存的图只是多一份，写说明时别说“图只在本机、不上传”。
- `await xiaobaixDraw.getPresets({ provider })` 返回 `{ provider, api, params, workflows }`，各预设项为 `{ id, name, selected }`，不暴露密钥。
- `await xiaobaixTts.synthesize(text, options)` 返回音频 `Blob`。

参数与可复制示例统一读取目标插件的 `docs/user/media-api.md`：绘图代码在 info string 为 `html draw-example` 的代码块，语音代码在 `html tts-example` 的代码块。按这两段示例处理请求、取消、结果展示及页面退出/返回，再按卡的需求调整提示词、参数与布局。尤其注意供应商字段层级不同：NovelAI / SD 的种子在 `params.seed`，ComfyUI 的种子在请求顶层。

图片 Blob 通过 `URL.createObjectURL` 展示，替换或卸载时释放 URL。传 `signal` 支持取消，任务可传 `abortSignal`；`onProgress` 提供阶段/排队反馈，不是百分比。错误中的 `partialResult.images` 可保留显示，不自动重新请求。

运行时生成需要用户已配置并启用的服务，会产生真实请求及可能的费用。未配置或失败只影响该生成动作；卡的文字、静态素材和其他操作应继续可用。测试优先模拟服务。

<a id="draw-contract"></a>
### 6.1 绘图请求的实际契约

先读插件 `docs/user/media-api.md`（字段表、三家 `params` 表、错误码、保存结果）和类型声明 `modules/draw/shared/public-api.d.ts`。以下是这两份之外、在插件源码里核实的补充。

- `xiaobaixDraw.getStatus()` 同步返回 `{ provider, enabled, ready }`。`ready` 只表示总开关开着、选了服务、该服务的画图模块已加载（插件 `plugin-entry.js`），不检查 API 地址、密钥、模型有没有填，这些缺了要到 `generate` 才报 `not_configured`。用它决定显不显示画图按钮；一次点击要先花一次聊天请求构图时，`ready` 只能挡住没开、没选的情况，画图这步仍要处理 `not_configured`，并把已花掉的构图结果留住（例如显示出来、允许重画时复用），不要直接丢弃。
- 请求顶层或 `params` 里多出任何键都抛 `unsupported_field`；`params` 的值类型须与该供应商默认值一致（`public-api.js` 的 `validateDrawParams`）。
- `characterPrompts` 每项只含 `{ prompt, uc, center }`，`center` 两轴在 0–1。NovelAI V4/V4.5 有任一角色不在 0.5/0.5 时按坐标分区；V5、SD、ComfyUI 把各角色 `prompt` 接到总提示词后面。各角色 `uc` 在所有供应商都并进总负面（`compiler.js` 80，`sd-draw.js` 902），排除词写一次就够。
- 返回的 `Blob` 带真实图片 MIME（`shared/image-collection.js` 的 `imageBlob`）。
- 错误的 `message` 已是中文说明，可原样放进提示。

<a id="draw-planning"></a>
### 6.2 用当前聊天 API 先构图

`SillyTavern.getContext().generateRaw({ prompt, systemPrompt, responseLength, prefill, jsonSchema })` 用玩家当前选定的聊天 API 发一次独立请求，不进聊天记录（签名见插件 `modules/assistant/references/sillytavern-javascript-api-reference.md` 的 `generateRaw`）。返回空文本时抛 `No message generated`。传数组 `prompt` 时酒馆会改写其中的消息对象，每次调用新建数组。构图提示词由卡固定画风与人物长相，模型只给场面、衣着、神情动作与站位，再由卡拼成绘图请求。

<a id="draw-storage"></a>
### 6.3 把生成的图留在楼层上

已有聊天插图在自定义阅读器里显示时，读插件 `docs/user/media-api.md` 的“在自己的聊天 UI 中显示图片卡”，复用图片卡与操作，无需卡再保存一套图片记录。下面只针对卡自行生成和保存的图片：编号、单设备（IndexedDB）与跨设备（酒馆服务器 + 聊天元数据）两种存法，按同文“保存生成结果”一节处理。卡侧补充：

- 单设备存法的库归卡所有，删除路径也归卡：订阅 `CHAT_DELETED`、`GROUP_CHAT_DELETED`（参数为聊天文件名，不带 `.jsonl`）删掉该聊天的记录；`CHAT_RENAMED` 的参数是 `{ oldFileName, newFileName }`，带 `.jsonl`，按新名改键。编号里的聊天名用 `getCurrentChatId()`。
- 显示时把当前聊天的记录读进内存，楼层重绘后同步插回；`URL.createObjectURL` 的地址在换图、撤去、切换聊天和 `onCleanup` 时释放。
- 卡自行保存的图片需要出现在原生正文内部时，由循环任务插进 `.mes_text`；正文里的普通 `<img>` 受酒馆 `.mes_text img:not(.mes_img)` 尺寸上限约束（`style.css` 604–609），卡的图片规则要用更高优先级的选择器。
## 7. 角色模板 `xiaobaix-template`

这是已有卡可能使用的另一套显示能力，不在 CardFiles 当前可写回的字段内。需要制作楼层前端时使用本文已说明的正则与 HTML 代码块；不要在 card.json 里自造模板字段。

保存在 `data.extensions['xiaobaix-template']`。`[[变量]]` 占位、提取方式、完整网页模板及其额外函数见插件 `docs/user/template.md`。只能把每楼输出套进固定版式，不提供跨楼层界面；TauriTavern 托管界面下不可用。

## 8. 其他可用命令

- `/xbgen`、`/xbgenraw`：额外生成一段文本；参数、返回值与报错见插件 `docs/user/streaming.md`。
- `/xbaudio`：播放网络音频；参数见插件 `docs/user/render.md` 的“`/xbaudio` 播放网络音频”一节。

<a id="internal-docs"></a>
## 9. 查内部文档（画图、斜杠命令、酒馆 API）

写循环任务或 HTML 时，以小白X内部文档为主要查阅依据。本节只列导航，不重复抄命令表或参数表。

以下路径相对于目标酒馆的 LittleWhiteBox 插件目录，不是角色卡工程目录：

```text
docs/user/media-api.md
docs/user/render.md
docs/user/template.md
docs/user/streaming.md
docs/user/tasks.md
modules/assistant/references/stscript-reference.md
modules/assistant/references/sillytavern-javascript-api-reference.md
```

- **画图与语音接口**：读 `docs/user/media-api.md`。含直接可用的楼层 HTML 画图/语音组件、取消与 `Blob` URL 释放、错误码及三家画图服务的参数表。
- **楼层网页、模板、`/xbgen`、循环任务**：读 `docs/user/render.md`、`template.md`、`streaming.md`、`tasks.md`，均为用户文档，是这些功能的唯一说明。
- **斜杠命令**：读 `stscript-reference.md`。按命令名查“命令索引”和“命令详细定义”，拼接命令前查“转义与引号规则”，通过 `STscript()` 调用。
- **酒馆 JavaScript API**：读 `sillytavern-javascript-api-reference.md`。按函数名或数据查签名、用途及源码位置；任务里用 `SillyTavern.getContext()` 取得 `ctx`，HTML 里的调用位置按第 3 节选择。文档中的 `st.*` 是模块命名空间，不是任务或 HTML 默认注入的全局对象。
- **查阅顺序**：先查上面的文档和对应的 `.d.ts` 类型声明；文档没写、或实际表现与文档不符时，才读插件或酒馆源码。已核实的结论可记到助手工作记录，本内置资料随插件维护。

## 10. 作者自查

- [ ] 常驻界面放在循环任务里，用 `chat_changed` 挂载；只有玩家确实需要主动操作时提供按钮。
- [ ] 任务的 `interval` 是数字；没有插件不读的多余字段；任务名不与常见全局任务重名。
- [ ] 挂载脚本重复执行后只有一套界面和监听；`onCleanup` 撤销了自建的 DOM、样式、原生监听、酒馆事件订阅、创建的 `Blob` URL 和挂到 `window` 的函数。
- [ ] 切到别的角色、进入群聊或关闭聊天后，界面随任务停止而消失（`onCleanup` 撤销了全部自建内容）。
- [ ] 需要每楼只结算一次的逻辑，自己处理了 swipe 与重新生成。
- [ ] 楼层 iframe 只做本楼显示和按需调用，没有往父页面注册长期监听。
- [ ] 纯展示状态存在带卡前缀的当前聊天本地变量；影响玩法或剧情的数值走变量 3.0 或 2.0。卡自己存档时，存档的分开、恢复和清除按前端技能的约定实现。
