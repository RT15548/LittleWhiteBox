关于小白X插件核心功能:
1. 代码块渲染功能:
   - SillyTavern原生只支持显示静态代码块，无法执行JavaScript或渲染HTML
   - 小白X将聊天中包含HTML标签(完整的<html>, <!DOCTYPE>或单独的<script>)的代码块自动转换为交互式iframe，iframe高度为自适应
   - 小白X提供了特殊的桥接API: STscript()函数
     • 这是一个异步函数，接受斜杠命令字符串作为参数
     • 函数会将命令发送给SillyTavern执行，并返回执行结果
     • 使用await关键字等待命令执行完成并获取结果
     • 这使iframe内的JavaScript代码能与SillyTavern通信并执行各种SillyTavern的斜杠命令，不要尝试通过window.parent直接访问SillyTavern的函数，这样不会工作
     • 自动解析STscript命令的管道输出（pipe值），无需JSON.parse
     • 使用方式一般有两类：
       • 一类是通过酒馆原生正则功能，将AI楼层的格式输出的文本消息替换为html代码，小白X自动渲染
       • 二类是沉浸式模板功能

2.  沉浸式模板功能 (Template Editor):

    核心概念：沉浸式界面
    -   工作原理：和直接渲染消息楼层的代码块不同。模板功能是先在设置页面放置好html代码，当AI开始回复时，插件会立即创建你的HTML模板作为该回合的聊天消息。AI流式输出的原始文本对用户不可见；插件会拦截这些文本，提取占位符数据，并用这些数据动态渲染你的HTML界面。

    生命周期：跨回合的状态管理
    -   iframe的重建：每次AI回复新的楼层，都会用你的模板创建一个全新的、独立的iframe。iframe本身是无状态的，不继承上一层楼的任何JavaScript数据或DOM状态。
    -   状态持久化：所有需要跨楼层保存的状态（如金币、等级、物品）必须存储在SillyTavern的变量系统中。
    -   关键原则：“仅在首次运行时初始化，在每次加载时从SillyTavern同步状态”。

    占位符提取机制
    -   插件会自动从AI的回复中提取结构化数据。支持以下三种格式：
    -   1. JSON格式: 可以是独立的JSON对象 `{...}` 或被代码块包裹 ` ```json {...} ``` `。推荐用于复杂数据。
    -   2. YAML格式: AI可以直接输出 `key: value` 格式的文本。
    -   3. 自定义正则标签 (默认): 默认的正则表达式是 `\[([^\]]+)\]([\s\S]*?)\[\/\1\]`，也可在设置页面修改。这意味着AI可以输出 `[键]值[/键]` 的格式来传递数据。例如：`[money]100[/money]`。

    数据流：双向通信
    -   从AI到UI（数据更新）:
        1.AI输出结构化数据（JSON/YAML/自定义标签）
        2.插件解析并保持数据的原始对象结构
        3.解析后的数据对象传递给 `window.updateTemplateVariables` 函数
        4.支持标准JavaScript对象访问：点号访问、数组索引等
        5.技术细节：传递的是原生JavaScript对象，保留所有嵌套关系。
    -   从UI到SillyTavern（用户操作）: 1. 用户点击界面按钮。 2. 你的JS代码调用`async STscript()`函数。 3. 使用`/setvar`或`/addvar`命令更新SillyTavern中的变量，持久化操作结果。

    实施步骤

    步骤 1：HTML模板结构
    -   你有两种方式显示数据：
    -   A. 简单占位符 `[[placeholder]]`: 插件在渲染前会进行一次性文本替换。适用于纯静态、当回合内不变的文本（如故事剧情、内容总结）。
    -   B. JavaScript动态渲染 (推荐用于交互式UI): 在HTML中为元素设置`id`，然后在`<script>`中通过JS更新。适用于所有交互式、需要计算或在流式输出中实时更新的数据。
    -   对于复杂的游戏界面，必须使用方法B。

    步骤 2：AI的输出格式
    -   AI应根据你选择的占位符提取机制输出对应格式的数据（JSON、YAML或正则标签）。
    -   JSON示例: `{"money": 150, "level": 2}`
    -   正则标签示例: `[money]150[/money][level]2[/level]`
    -   应给出根据你的模板html，在角色卡中指导AI输出格式的prompt，首条消息示例等

    步骤 3：JavaScript核心逻辑
    -   a) 首次初始化与状态加载:
        ```javascript
        async function initializeOrSync() {
            const isInitialized = await STscript('/getvar game_initialized');
            if (!isInitialized) {
                await STscript('/setvar key=money 100');
                await STscript('/setvar key=game_initialized true');
            }
            await syncGameStateFromST(); // 每次加载都同步
        }
        ```
    -   b) 响应用户操作:
        ```javascript
        async function buyItem() {
            let currentMoney = parseInt(document.getElementById('money-display').textContent);
            const newMoney = currentMoney - 50;
            // 立即更新UI
            document.getElementById('money-display').textContent = newMoney;
            // 再保存到SillyTavern
            await STscript(`/setvar key=money ${newMoney}`);
        }
        ```

    关键函数参考

    -   `window.updateTemplateVariables(vars)`
        -   作用: 这是UI与插件通信的核心。插件在AI流式输出期间，会大约每两秒调用一次此函数，将最新解析到的占位符(`vars`对象)传递给你的iframe。
        -   技术细节: 因为它会被重复调用，所以此函数内的代码需要被设计成可以安全地多次执行。
    -   `async STscript(command)`
        -   作用: 在UI中执行任何SillyTavern的斜杠命令，用于持久化状态。
        -   用法: `const playerName = await STscript('/getvar user');`

    常见陷阱与最佳实践
    -   陷阱：重复初始化。使用标志变量（如`game_initialized`）检测避免每层楼重复初始化。
    -   实践：UI即时反馈。用户操作后，立即在JS中更新UI，然后再调用`STscript`保存。
    -   陷阱：JSON转义问题。
    -   实践：对复杂的JSON数据使用Base64编码存储，可以完美避免转义问题。
        ```javascript
        // 保存
        const dataStr = JSON.stringify(inventory);
        const encodedData = btoa(unescape(encodeURIComponent(dataStr)));
        await STscript(`/setvar key=inventory_encoded "${encodedData}"`);
        // 读取
        const encodedData = await STscript('/getvar inventory_encoded');
        const dataStr = decodeURIComponent(escape(atob(encodedData)));
        const inventory = JSON.parse(dataStr);
        ```
    -   实践：逻辑分离。让UI JS负责状态显示和即时更新；SillyTavern变量负责持久化存储；AI负责故事叙述和高级逻辑响应。
// 复杂嵌套数据示例
{
  "character": {
    "name": "Alice",
    "stats": {"hp": 100, "mp": 50}
  },
  "inventory": ["sword", "potion"],
  "game_time": "下午"
}
// 在模板中的使用
vars.character.name        // "Alice"
vars.character.stats.hp    // 100
vars.inventory[0]          // "sword"
vars.game_time            // "下午"
## 当你收到要生成一个沉浸式模板的写卡任务时，你必须严格遵循并使用下面的‘黄金模板’作为起点，然后根据用户的具体需求修改其中的HTML布局和JavaScript逻辑：
```html
<!DOCTYPE html>
<html>
<head>
    <title>沉浸式模板</title>
    <style> /* CSS样式 */ </style>
</head>
<body>
    <!-- HTML布局 -->
</body>
<script>
    // 关键：所有代码都必须在这个事件监听器里！
    document.addEventListener('DOMContentLoaded', function() {
        
        // 1. 缓存所有会用到的UI元素
        const UIElements = {
            // 示例：element1: document.getElementById('element1'),
        };

        // 2. 本地状态缓存（仅用于单次iframe生命周期内的临时状态）
        let localState = {
            // 用于存储：加载状态、防重复计算标志、临时计算结果等
            // 注意：这里的数据在iframe重建时会丢失，这是正常的
            isLoading: false,
            turnUpdateApplied: false, // 防止流式输出时重复计算的标志
        };

        // 3. 核心函数：处理AI的动态数据
        window.updateTemplateVariables = function(vars) {
            if (!vars) return;
            
            // ==================== 处理回合性数据 ====================
            // 回合性数据：AI每回合都会提供的数据，如场景描述、故事日志等
            // 这些数据直接从vars中读取并渲染到UI，无需持久化到ST变量
            
            // 示例：处理场景描述
            // if (vars.scene?.description) {
            //     UIElements.sceneText.innerHTML = vars.scene.description.replace(/\n/g, '<br>');
            // }
            
            // ==================== 处理持久性数据 ====================
            // 持久性数据：只在特定时候提供，需要跨回合保持的数据
            // 这些数据需要存储到ST变量中，供initializeOrSync使用
            
            // 示例：处理任务目标（只在开始新任务时提供）
            // if (vars.game?.objective) {
            //     localState.objective = vars.game.objective;
            //     STscript(`/setvar key=game_objective "${vars.game.objective}"`);
            //     updateUI(); // 立即更新UI
            // }
            
            // ==================== 处理增量数据 ====================
            // 对于需要累加/累减的数据，使用turnUpdateApplied标志防止重复计算
            
            // 示例：处理金币变化
            // if (vars.player?.gold_change !== undefined && !localState.turnUpdateApplied) {
            //     const change = parseInt(vars.player.gold_change);
            //     localState.currentGold += change;
            //     STscript(`/setvar key=player_gold ${localState.currentGold}`);
            //     updateUI();
            //     localState.turnUpdateApplied = true; // 防止重复计算
            // }
            
            // ==================== 处理绝对值数据 ====================
            // 如果AI直接提供绝对值，直接使用（推荐用于简单场景）
            
            // 示例：处理生命值
            // if (vars.player?.hp !== undefined) {
            //     localState.currentHP = parseInt(vars.player.hp);
            //     STscript(`/setvar key=player_hp ${localState.currentHP}`);
            //     updateUI();
            // }
        };

        // 4. UI更新辅助函数
        function updateUI() {
            // 将localState中的数据渲染到UI元素上
            // 这个函数应该是幂等的，多次调用结果相同
            
            // 示例：
            // UIElements.goldDisplay.textContent = localState.currentGold;
            // UIElements.hpBar.style.width = (localState.currentHP / localState.maxHP * 100) + '%';
        }

        // 5. 用户操作处理函数
        async function onUserClick() {
            // 在用户操作开始时，重置回合更新标志
            localState.turnUpdateApplied = false;
            
            // 调用STscript与SillyTavern通信
            // 示例：
            // await STscript('/send 我要购买这个物品');
            // await STscript('/trigger');
        }

        // 6. 初始化和状态同步函数
        async function initializeOrSync() {
            // 检查游戏是否已初始化
            const isInitialized = await STscript('/getvar game_initialized');
            if (!isInitialized) {
                // 首次运行：初始化默认值
                await STscript('/setvar key=game_initialized true');
                // await STscript('/setvar key=player_gold 100');
                // await STscript('/setvar key=player_hp 100');
                // await STscript('/setvar key=game_objective "暂无任务"');
            }

            // 每次iframe加载时：从ST变量同步持久化状态
            // const gold = parseInt(await STscript('/getvar player_gold')) || 0;
            // const hp = parseInt(await STscript('/getvar player_hp')) || 100;
            // const objective = await STscript('/getvar game_objective') || '暂无任务';
            
            // 更新localState
            // localState.currentGold = gold;
            // localState.currentHP = hp;
            // localState.objective = objective;

            // 立即更新UI显示
            updateUI();
        }

        // 7. 绑定事件监听器
        // UIElements.buyButton.addEventListener('click', onUserClick);

        // 8. 可选：监听SillyTavern的输入事件，自动重置回合标志
        // 这确保任何触发AI回复的操作都会重置turnUpdateApplied
        try {
            if (window.parent) {
                const inputElement = window.parent.document.getElementById('send_textarea');
                const sendButton = window.parent.document.getElementById('send_button');
                
                if (inputElement) {
                    inputElement.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            localState.turnUpdateApplied = false;
                        }
                    });
                }
                
                if (sendButton) {
                    sendButton.addEventListener('click', function() {
                        localState.turnUpdateApplied = false;
                    });
                }
            }
        } catch (error) {
            // 如果无法访问父窗口，忽略错误
        }

        // 9. 启动初始化
        initializeOrSync();
    });
</script>
</html>

```
3. 定时任务模块:
   - 拓展菜单中允许设置"在对话中自动执行"的斜杠命令
   - 可以设置触发频率(每几楼层)、触发条件(AI消息后/用户消息前/每轮对话)
   - 每个任务包含:名称、要执行的命令、触发间隔、触发类型
   - 注册了/xbqte命令手动触发任务: \`/xbqte 任务名称\`
   - 注册了/xbset命令调整任务间隔: \`/xbset 任务名称 间隔数字\`
   - 任务命令可以使用所有标准STscript斜杠命令

### 4. 流式静默生成

这是 /gen 和 /genraw 命令的流式版本，支持流式并发。SillyTavern原生不支持流式并发，插件通过会话槽位(1-10)实现通道隔离，可同时进行多个独立的流式生成任务。

斜杠命令

命令格式:
/xbgen [参数] 提示文本     // 流式版 /gen (带上下文)
/xbgenraw [参数] 提示文本  // 流式版 /genraw (纯提示)

可用参数:
as=system|user|assistant - 消息角色，xbgen默认system，xbgenraw默认user
id=1-10 或 id=xb1-xb10 - 会话槽位，默认1号
api=openai|claude|gemini|cohere|deepseek - 后端类型，默认跟随主API
model=模型名 - 指定模型，默认使用后端默认模型
apiurl=URL - 自定义API地址(部分后端支持)
apipassword=密钥 - 配合apiurl使用的密码

返回值: 会话ID字符串

UI侧可用函数

// 获取插件对象
const streaming = window.parent.xiaobaixStreamingGeneration;

// 1. 获取生成文本
streaming.getLastGeneration(sessionId)
// 参数: sessionId可选，不传则获取最后一个会话
// 返回: 当前生成的文本字符串

// 2. 获取会话状态
streaming.getStatus(sessionId) 
// 参数: sessionId可选
// 返回: {isStreaming: boolean, text: string, sessionId: string}

// 3. 取消生成
streaming.cancel(sessionId)
// 参数: sessionId - 要取消的会话ID

// 4. 执行斜杠命令
await STscript(命令字符串)
// 参数: 完整的斜杠命令
// 返回: 会话ID

事件监听

// 监听生成完成事件
window.addEventListener('message', (e) => {
    if (e.data?.type === 'xiaobaix_streaming_completed') {
        const { finalText, originalPrompt, sessionId } = e.data.payload;
        // finalText: 最终生成文本
        // originalPrompt: 原始提示词
        // sessionId: 会话ID
    }
});

完整使用示例

单任务流程:
// 1. 开始生成
const sessionId = await STscript('/xbgen 写一个故事');

// 2. 轮询显示
const timer = setInterval(() => {
    const status = streaming.getStatus(sessionId);
    if (status.text) {
        document.getElementById('output').textContent = status.text;
    }
}, 100);

// 3. 监听完成
window.addEventListener('message', (e) => {
    if (e.data?.type === 'xiaobaix_streaming_completed' && 
        e.data.payload.sessionId === sessionId) {
        clearInterval(timer);
        document.getElementById('output').textContent = e.data.payload.finalText;
    }
});

// 4. 可选: 取消生成
// streaming.cancel(sessionId);

并发任务示例:
// 同时启动3个任务
const task1 = await STscript('/xbgen id=1 继续剧情');
const task2 = await STscript('/xbgenraw id=2 api=claude 总结全文'); 
const task3 = await STscript('/xbgen id=3 as=user 查看其他NPC生活状态');

// 分别轮询显示
const timer = setInterval(() => {
    document.getElementById('story').textContent = streaming.getLastGeneration(1);
    document.getElementById('trans').textContent = streaming.getLastGeneration(2); 
    document.getElementById('chat').textContent = streaming.getLastGeneration(3);
}, 100);

// 监听完成 (会收到3次事件)
window.addEventListener('message', (e) => {
    if (e.data?.type === 'xiaobaix_streaming_completed') {
        const sessionId = e.data.payload.sessionId;
        console.log(`任务${sessionId}完成:`, e.data.payload.finalText);
    }
});

使用注意事项

1. 会话槽位: 不指定id默认使用1号，并发时必须指定不同id
2. 轮询频率: 建议80-200ms间隔，避免过于频繁
3. 资源清理: 完成后记得clearInterval，长期运行可定期取消不用的会话

5.  以下是SillyTavern的官方STscript脚本文档，可结合小白X功能创作深度定制的SillyTavern角色卡。
----------------------
# STscript 语言参考

## 什么是STscript？

这是一种简单但功能强大的脚本语言，可用于在不需要严肃编程的情况下扩展SillyTavern(酒馆)的功能，让您能够：

创建迷你游戏或速通挑战  
构建AI驱动的聊天洞察  
释放您的创造力并与他人分享  
STscript基于斜杠命令引擎构建，利用命令批处理、数据管道、宏和变量。这些概念将在以下文档中详细描述。
---
## Hello, World!

要运行您的第一个脚本，请打开任何SillyTavern聊天窗口，并在聊天输入栏中输入以下内容：

```
/pass Hello, World! | /echo
```

您应该会在屏幕顶部的提示框中看到消息。现在让我们逐步分析。

脚本是一批命令，每个命令以斜杠开头，可以带有或不带有命名和未命名参数，并以命令分隔符结束：`|`​。

命令按顺序依次执行，并在彼此之间传输数据。

​`/pass`​命令接受"Hello, World!"作为未命名参数的常量值，并将其写入管道。  
​`/echo`​命令通过管道从前一个命令接收值，并将其显示为提示通知。

> 提示：要查看所有可用命令的列表，请在聊天中输入`/help slash`​。

由于常量未命名参数和管道是可互换的，我们可以简单地将此脚本重写为：

```
/echo Hello, World!
```

‍

## 用户输入

现在让我们为脚本添加一些交互性。我们将接受用户的输入值并在通知中显示它。

```
/input Enter your name |
/echo Hello, my name is {{pipe}}
```

​`/input`​命令用于显示一个带有指定提示的输入框，然后将输出写入管道。  
由于`/echo`​已经有一个设置输出模板的未命名参数，我们使用`{{pipe}}`​宏来指定管道值将被渲染的位置。

### 其他输入/输出命令

​`/popup (文本)`​ — 显示一个阻塞弹窗，支持简单HTML格式，例如：`/popup <font color=red>我是红色的！</font>`​。  
​`/setinput (文本)`​ — 用提供的文本替换用户输入栏的内容。  
​`/speak voice="名称" (文本)`​ — 使用选定的TTS引擎和语音映射中的角色名称朗读文本，例如 `/speak name="唐老鸭" 嘎嘎！`​。  
​`/buttons labels=["a","b"] (文本)`​ — 显示一个带有指定文本和按钮标签的阻塞弹窗。`labels`​必须是JSON序列化的字符串数组或包含此类数组的变量名。将点击的按钮标签返回到管道，如果取消则返回空字符串。文本支持简单HTML格式。

‍

#### `/popup`​和`/input`​的参数

​`/popup`​和`/input`​支持以下附加命名参数：

* ​`large=on/off`​ - 增加弹窗的垂直尺寸。默认：`off`​。
* ​`wide=on/off`​ - 增加弹窗的水平尺寸。默认：`off`​。
* ​`okButton=字符串`​ - 添加自定义"确定"按钮文本的功能。默认：`Ok`​。
* ​`rows=数字`​ - (仅适用于`/input`​) 增加输入控件的大小。默认：`1`​。

示例：

```
/popup large=on wide=on okButton="接受" 请接受我们的条款和条件....
```

‍

#### /echo的参数

​`/echo`​支持以下附加`severity`​参数值，用于设置显示消息的样式。

* ​`warning`​
* ​`error`​
* ​`info`​ (默认)
* ​`success`​

示例：

```
/echo severity=error 发生了非常糟糕的事情。
```

‍

## 变量

变量用于在脚本中存储和操作数据，可以使用命令或宏。变量可以是以下类型之一：

* 本地变量 — 保存到当前聊天的元数据中，并且对其唯一。
* 全局变量 — 保存到settings.json中，并在整个应用程序中存在。

‍

1. ​`/getvar name`​或`{{getvar::name}}`​ — 获取本地变量的值。
2. ​`/setvar key=name value`​或`{{setvar::name::value}}`​ — 设置本地变量的值。
3. ​`/addvar key=name increment`​或`{{addvar::name::increment}}`​ — 将增量添加到本地变量的值。
4. ​`/incvar name`​或`{{incvar::name}}`​ — 将本地变量的值增加1。
5. ​`/decvar name`​或`{{decvar::name}}`​ — 将本地变量的值减少1。
6. ​`/getglobalvar name`​或`{{getglobalvar::name}}`​ — 获取全局变量的值。
7. ​`/setglobalvar key=name`​或`{{setglobalvar::name::value}}`​ — 设置全局变量的值。
8. ​`/addglobalvar key=name`​或`{{addglobalvar::name:increment}}`​ — 将增量添加到全局变量的值。
9. ​`/incglobalvar name`​或`{{incglobalvar::name}}`​ — 将全局变量的值增加1。
10. ​`/decglobalvar name`​或`{{decglobalvar::name}}`​ — 将全局变量的值减少1。
11. ​`/flushvar name`​ — 删除本地变量的值。
12. ​`/flushglobalvar name`​ — 删除全局变量的值。

‍

* 先前未定义变量的默认值是空字符串，或者如果首次在`/addvar`​、`/incvar`​、`/decvar`​命令中使用，则为零。
* ​`/addvar`​命令中的增量执行加法或减法（如果增量和变量值都可以转换为数字），否则执行字符串连接。
* 如果命令参数接受变量名，并且同名的本地和全局变量都存在，则本地变量优先。
* 所有用于变量操作的斜杠命令都将结果值写入管道，供下一个命令使用。
* 对于宏，只有"get"、"inc"和"dec"类型的宏返回值，而"add"和"set"则替换为空字符串。

‍

现在，让我们考虑以下示例：

```
/input What do you want to generate? |
/setvar key=SDinput |
/echo Requesting an image of {{getvar::SDinput}} |
/getvar SDinput |
/imagine
```

‍

1. 用户输入的值保存在名为SDinput的本地变量中。
2. ​`getvar`​宏用于在`/echo`​命令中显示该值。
3. ​`getvar`​命令用于检索变量的值并通过管道传递。
4. 该值传递给`/imagine`​命令（由Image Generation插件提供）作为其输入提示。

‍

由于变量在脚本执行之间保存且不会刷新，您可以在其他脚本和通过宏中引用该变量，它将解析为与示例脚本执行期间相同的值。为确保值被丢弃，请在脚本中添加`/flushvar`​命令。

‍

### 数组和对象

变量值可以包含JSON序列化的数组或键值对（对象）。

‍

示例：

* 数组：["apple","banana","orange"]
* 对象：{"fruits":["apple","banana","orange"]}

‍

以下修改可应用于命令以处理这些变量：

* ​`/len`​命令获取数组中的项目数量。
* ​`index=数字/字符串`​命名参数可以添加到`/getvar`​或`/setvar`​及其全局对应项，以通过数组的零基索引或对象的字符串键获取或设置子值。

  * 如果在不存在的变量上使用数字索引，该变量将被创建为空数组`[]`​。
  * 如果在不存在的变量上使用字符串索引，该变量将被创建为空对象`{}`​。
* `/addvar`​和`/addglobalvar`​命令支持将新值推送到数组类型的变量。

‍

## 流程控制 - 条件

您可以使用`/if`​命令创建条件表达式，根据定义的规则分支执行。

​`/if left=valueA right=valueB rule=comparison else="(false时执行的命令)" "(true时执行的命令)"`​

让我们看一下以下示例：

```
/input What's your favorite drink? |
/if left={{pipe}} right="black tea" rule=eq else="/echo You shall not pass \| /abort" "/echo Welcome to the club, \{\{user\}\}"
```

此脚本根据用户输入与所需值进行评估，并根据输入值显示不同的消息。

‍

### ​`/if`​的参数

1. `left`​是第一个操作数。我们称之为A。
2. ​`right`​是第二个操作数。我们称之为B。
3. ​`rule`​是要应用于操作数的操作。
4. ​`else`​是可选的子命令字符串，如果布尔比较结果为false，则执行这些子命令。
5. 未命名参数是如果布尔比较结果为true，则执行的子命令。

‍

操作数值按以下顺序评估：

1. 数字字面量
2. 本地变量名
3. 全局变量名
4. 字符串字面量

‍

命名参数的字符串值可以用引号转义，以允许多词字符串。然后丢弃引号。

‍

### 布尔操作

支持的布尔比较规则如下。应用于操作数的操作结果为true或false值。

1. ​`eq`​ (等于) => A = B
2. ​`neq`​ (不等于) => A != B
3. ​`lt`​ (小于) => A < B
4. ​`gt`​ (大于) => A > B
5. ​`lte`​ (小于或等于) => A <= B
6. ​`gte`​ (大于或等于) => A >= B
7. ​`not`​ (一元否定) => !A
8. ​`in`​ (包含子字符串) => A包含B，不区分大小写
9. `nin`​ (不包含子字符串) => A不包含B，不区分大小写

‍

### 子命令

子命令是包含要执行的斜杠命令列表的字符串。

1. 要在子命令中使用命令批处理，命令分隔符应该被转义（见下文）。
2. 由于宏值在进入条件时执行，而不是在执行子命令时执行，因此可以额外转义宏，以延迟其评估到子命令执行时间。
3. 子命令执行的结果通过管道传递给`/if`​之后的命令。
4. 遇到`/abort`​命令时，脚本执行中断。

‍

​`/if`​命令可以用作三元运算符。以下示例将在变量`a`​等于5时将"true"字符串传递给下一个命令，否则传递"false"字符串。

```
/if left=a right=5 rule=eq else="/pass false" "/pass true" |
/echo
```

‍

## 转义序列

### 宏

宏的转义方式与之前相同。但是，使用闭包时，您需要比以前少得多地转义宏。可以转义两个开始的大括号，或者同时转义开始和结束的大括号对。

```
/echo \{\{char}} |
/echo \{\{char\}\}
```

### 管道

闭包中的管道不需要转义（当用作命令分隔符时）。在任何您想使用字面管道字符而不是命令分隔符的地方，您都需要转义它。

```
/echo title="a\|b" c\|d |
/echo title=a\|b c\|d |
```

使用解析器标志STRICT_ESCAPING，您不需要在引用值中转义管道。

```
/parser-flag STRICT_ESCAPING |
/echo title="a|b" c\|d |
/echo title=a\|b c\|d |
```

### 引号

要在引用值内使用字面引号字符，必须转义该字符。

```
/echo title="a \"b\" c" d "e" f
```

### 空格

要在命名参数的值中使用空格，您必须将值用引号括起来，或者转义空格字符。

```
/echo title="a b" c d |
/echo title=a\ b c d
```

### 闭包分隔符

如果您想使用用于标记闭包开始或结束的字符组合，您必须使用单个反斜杠转义序列。

```
/echo \{: |
/echo \:}
```

## 管道断开器

```
||
```

为了防止前一个命令的输出自动注入为下一个命令的未命名参数，在两个命令之间放置双管道。

```
/echo we don't want to pass this on ||
/world
```

‍

## 闭包

```
{: ... :}
```

闭包（块语句、lambda、匿名函数，无论您想叫它什么）是一系列包装在`{:`​和`:}`​之间的命令，只有在代码的那部分被执行时才会被评估。

### 子命令

闭包使使用子命令变得更加容易，并且不需要转义管道和宏。

```
// 不使用闭包的if |
/if left=1 rule=eq right=1
    else="
        /echo not equal \|
        /return 0
    "
    /echo equal \|
    /return \{\{pipe}}

// 使用闭包的if |
/if left=1 rule=eq right=1
    else={:
        /echo not equal |
        /return 0
    :}
    {:
        /echo equal |
        /return {{pipe}}
    :}
```

### 作用域

闭包有自己的作用域并支持作用域变量。作用域变量用`/let`​声明，它们的值用`/var`​设置和获取。获取作用域变量的另一种方法是`{{var::}}`​宏。

```
/let x |
/let y 2 |
/var x 1 |
/var y |
/echo x is {{var::x}} and y is {{pipe}}.
```

在闭包内，您可以访问在同一闭包或其祖先之一中声明的所有变量。您无法访问在闭包的后代中声明的变量。  
如果声明的变量与闭包祖先之一中声明的变量同名，则在此闭包及其后代中无法访问祖先变量。

```
/let x this is root x |
/let y this is root y |
/return {:
    /echo called from level-1: x is "{{var::x}}" and y is "{{var::y}}" |
    /delay 500 |
    /let x this is level-1 x |
    /echo called from level-1: x is "{{var::x}}" and y is "{{var::y}}" |
    /delay 500 |
    /return {:
        /echo called from level-2: x is "{{var::x}}" and y is "{{var::y}}" |
        /let x this is level-2 x |
        /echo called from level-2: x is "{{var::x}}" and y is "{{var::y}}" |
        /delay 500
    :}()
:}() |
/echo called from root: x is "{{var::x}}" and y is "{{var::y}}"
```

### 命名闭包

```
/let x {: ... :} | /:x
```

闭包可以分配给变量（仅限作用域变量），以便稍后调用或用作子命令。

```
/let myClosure {:
    /echo this is my closure
:} |
/:myClosure
```

```
/let myClosure {:
    /echo this is my closure |
    /delay 500
:} |
/times 3 {{var::myClosure}}
```

​`/:`​也可以用于执行快速回复，因为它只是`/run`​的简写。

```
/:QrSetName.QrButtonLabel |
/run QrSetName.QrButtonLabel
```

### 闭包参数

命名闭包可以接受命名参数，就像斜杠命令一样。参数可以有默认值。

```
/let myClosure {: a=1 b=
    /echo a is {{var::a}} and b is {{var::b}}
:} |
/:myClosure b=10
```

### 闭包和管道参数

父闭包的管道值不会自动注入到子闭包的第一个命令中。  
您仍然可以使用`{{pipe}}`​显式引用父级的管道值，但如果您将闭包内第一个命令的未命名参数留空，则该值不会自动注入。

```
/* 这曾经尝试将模型更改为"foo"
   因为来自循环外部/echo的值"foo"
   被注入到循环内部的/model命令中。
   现在它将简单地回显当前模型，而不
   尝试更改它。
*/
/echo foo |
/times 2 {:
	/model |
	/echo |
:} |
```

```
/* 您仍然可以通过显式使用{{pipe}}宏
   来重现旧行为。
*/
/echo foo |
/times 2 {:
	/model {{pipe}} |
	/echo |
:} |
```

### 立即执行闭包

```
{: ... :}()
```

闭包可以立即执行，这意味着它们将被替换为其返回值。这在不存在对闭包的显式支持的地方很有用，并且可以缩短一些原本需要大量中间变量的命令。

```
// 不使用闭包的两个字符串长度比较 |
/len foo |
/var lenOfFoo {{pipe}} |
/len bar |
/var lenOfBar {{pipe}} |
/if left={{var::lenOfFoo}} rule=eq right={{var:lenOfBar}} /echo yay!
```

```
// 使用立即执行闭包的相同比较 |
/if left={:/len foo:}() rule=eq right={:/len bar:}() /echo yay!
```

除了运行保存在作用域变量中的命名闭包外，`/run`​命令还可用于立即执行闭包。

```
/run {:
	/add 1 2 3 4 |
:} |
/echo |
```

‍

## 注释

```
// ... | /# ...
```

注释是脚本代码中的人类可读解释或注解。注释不会中断管道。

```
// 这是一条注释 |
/echo foo |
/# 这也是一条注释
```

### 块注释

块注释可用于快速注释掉多个命令。它们不会在管道上终止。

```
/echo foo |
/*
/echo bar |
/echo foobar |
*/
/echo foo again |
```

‍

## 流程控制

### 循环：`/while`​和`/times`​

如果您需要在循环中运行某个命令，直到满足特定条件，请使用`/while`​命令。

```
/while left=valueA right=valueB rule=operation guard=on "commands"
```

在循环的每一步，它比较变量A的值与变量B的值，如果条件产生true，则执行引号中包含的任何有效斜杠命令，否则退出循环。此命令不向输出管道写入任何内容。

#### 

​`/while`​的参数

可用的布尔比较集合、变量处理、字面值和子命令与`/if`​命令相同。

可选的`guard`​命名参数（默认为`on`​）用于防止无限循环，将迭代次数限制为100。要禁用并允许无限循环，设置`guard=off`​。

此示例将1添加到`i`​的值，直到达到10，然后输出结果值（在本例中为10）。

```
/setvar key=i 0 |
/while left=i right=10 rule=lt "/addvar key=i 1" |
/echo {{getvar::i}} |
/flushvar i
```

‍

#### `/times`​的参数

运行指定次数的子命令。

​`/times (重复次数) "(命令)"`​ – 引号中包含的任何有效斜杠命令重复指定次数，例如 `/setvar key=i 1 | /times 5 "/addvar key=i 1"`​ 将1添加到"i"的值5次。

* ​`{{timesIndex}}`​被替换为迭代次数（从零开始），例如 `/times 4 "/echo {{timesIndex}}"`​ 回显数字0到4。
* 循环默认限制为100次迭代，传递`guard=off`​可禁用此限制。

‍

### 跳出循环和闭包

```
/break |
```

​`/break`​命令可用于提前跳出循环（`/while`​或`/times`​）或闭包。`/break`​的未命名参数可用于传递与当前管道不同的值。  
​`/break`​目前在以下命令中实现：

* ​`/while`​ - 提前退出循环
* ​`/times`​ - 提前退出循环
* ​`/run`​（使用闭包或通过变量的闭包）- 提前退出闭包
* ​`/:`​（使用闭包）- 提前退出闭包

```
/times 10 {:
	/echo {{timesIndex}}
	/delay 500 |
	/if left={{timesIndex}} rule=gt right=3 {:
		/break
	:} |
:} |
```

```
/let x {: iterations=2
	/if left={{var::iterations}} rule=gt right=10 {:
		/break too many iterations! |
	:} |
	/times {{var::iterations}} {:
		/delay 500 |
		/echo {{timesIndex}} |
	:} |
:} |
/:x iterations=30 |
/echo the final result is: {{pipe}}
```

```
/run {:
	/break 1 |
	/pass 2 |
:} |
/echo pipe will be one: {{pipe}} |
```

```
/let x {:
	/break 1 |
	/pass 2 |
:} |
/:x |
/echo pipe will be one: {{pipe}} |
```

# 

## 数学运算

* 以下所有操作都接受一系列数字或变量名，并将结果输出到管道。
* 无效操作（如除以零）以及导致NaN值或无穷大的操作返回零。
* 乘法、加法、最小值和最大值接受无限数量的由空格分隔的参数。
* 减法、除法、幂运算和模运算接受由空格分隔的两个参数。
* 正弦、余弦、自然对数、平方根、绝对值和舍入接受一个参数。

操作列表：

1. ​`/add (a b c d)`​ – 执行一组值的加法，例如 `/add 10 i 30 j`​
2. ​`/mul (a b c d)`​ – 执行一组值的乘法，例如 `/mul 10 i 30 j`​
3. ​`/max (a b c d)`​ – 返回一组值中的最大值，例如 `/max 1 0 4 k`​
4. ​`/min (a b c d)`​ – 返回一组值中的最小值，例如 `/min 5 4 i 2`​
5. ​`/sub (a b)`​ – 执行两个值的减法，例如 `/sub i 5`​
6. ​`/div (a b)`​ – 执行两个值的除法，例如 `/div 10 i`​
7. ​`/mod (a b)`​ – 执行两个值的模运算，例如 `/mod i 2`​
8. ​`/pow (a b)`​ – 执行两个值的幂运算，例如 `/pow i 2`​
9. ​`/sin (a)`​ – 执行一个值的正弦运算，例如 `/sin i`​
10. ​`/cos (a)`​ – 执行一个值的余弦运算，例如 `/cos i`​
11. ​`/log (a)`​ – 执行一个值的自然对数运算，例如 `/log i`​
12. ​`/abs (a)`​ – 执行一个值的绝对值运算，例如 `/abs -10`​
13. ​`/sqrt (a)`​– 执行一个值的平方根运算，例如 `/sqrt 9`​
14. ​`/round (a)`​ – 执行一个值的四舍五入到最接近整数的运算，例如 `/round 3.14`​
15. `/rand (round=round|ceil|floor from=number=0 to=number=1)`​ – 返回一个介于from和to之间的随机数，例如 `/rand`​ 或 `/rand 10`​ 或 `/rand from=5 to=10`​。范围是包含的。返回的值将包含小数部分。使用`round`​命名参数获取整数值，例如 `/rand round=ceil`​ 向上舍入，`round=floor`​ 向下舍入，`round=round`​ 舍入到最接近的值。

‍

### 示例1：获取半径为50的圆的面积。

```
/setglobalvar key=PI 3.1415 |
/setvar key=r 50 |
/mul r r PI |
/round |
/echo Circle area: {{pipe}}
```

### 示例2：计算5的阶乘。

```
/setvar key=input 5 |
/setvar key=i 1 |
/setvar key=product 1 |
/while left=i right=input rule=lte "/mul product i \| /setvar key=product \| /addvar key=i 1" |
/getvar product |
/echo Factorial of {{getvar::input}}: {{pipe}} |
/flushvar input |
/flushvar i |
/flushvar product
```

‍

## 使用LLM

脚本可以使用以下命令向您当前连接的LLM API发出请求：

* ​`/gen (提示)`​ — 使用为所选角色提供的提示生成文本，并包含聊天消息。
* ​`/genraw (提示)`​ — 仅使用提供的提示生成文本，忽略当前角色和聊天。
* `/trigger`​ — 触发正常生成（相当于点击"发送"按钮）。如果在群聊中，您可以选择提供基于1的群组成员索引或角色名称让他们回复，否则根据群组设置触发群组回合。

### `/gen`​和`/genraw`​的参数

```
/genraw lock=on/off stop=[] instruct=on/off (Prompt)
```

‍

* ​`lock`​ — 可以是`on`​或`off`​。指定生成过程中是否应阻止用户输入。默认：`off`​。
* ​`stop`​ — JSON序列化的字符串数组。仅为此生成添加自定义停止字符串（如果API支持）。默认：无。
* ​`instruct`​（仅`/genraw`​）— 可以是`on`​或`off`​。允许在输入提示上使用指令格式（如果启用了指令模式且API支持）。设置为`off`​强制使用纯提示。默认：`on`​。
* ​`as`​（用于文本完成API）— 可以是`system`​（默认）或`char`​。定义最后一行提示将如何格式化。`char`​将使用角色名称，`system`​将使用无名称或中性名称。

‍

生成的文本然后通过管道传递给下一个命令，可以保存到变量或使用I/O功能显示：

```
/genraw Write a funny message from Cthulhu about taking over the world. Use emojis. |
/popup <h3>Cthulhu says:</h3><div>{{pipe}}</div>
```

或者将生成的消息作为角色的回复插入：

```
/genraw You have been memory wiped, your name is now Lisa and you're tearing me apart. You're tearing me apart Lisa! |
/sendas name={{char}} {{pipe}}
```

‍

## 提示注入

脚本可以添加自定义LLM提示注入，本质上相当于无限的作者注释。

* ​`/inject (文本)`​ — 将任何文本插入到当前聊天的正常LLM提示中，并需要一个唯一标识符。保存到聊天元数据。
* ​`/listinjects`​ — 在系统消息中显示脚本为当前聊天添加的所有提示注入列表。
* ​`/flushinjects`​ — 删除脚本为当前聊天添加的所有提示注入。
* ​`/note (文本)`​ — 设置当前聊天的作者注释值。保存到聊天元数据。
* ​`/interval`​ — 设置当前聊天的作者注释插入间隔。
* ​`/depth`​ — 设置聊天内位置的作者注释插入深度。
* `/position`​ — 设置当前聊天的作者注释位置。

‍

### `/inject`​的参数

```
/inject id=IdGoesHere position=chat depth=4 My prompt injection
```

​`id`​ — 标识符字符串或对变量的引用。使用相同ID的连续`/inject`​调用将覆盖先前的文本注入。必需参数。  
​`position`​ — 设置注入的位置。默认：`after`​。可能的值：  
​`after`​：在主提示之后。  
​`before`​：在主提示之前。  
​`chat`​：在聊天中。  
​`depth`​ — 设置聊天内位置的注入深度。0表示在最后一条消息之后插入，1表示在最后一条消息之前，依此类推。默认：4。  
未命名参数是要注入的文本。空字符串将取消设置提供的标识符的先前值。

‍

## 访问聊天消息

### 读取消息

您可以使用`/messages`​命令访问当前选定聊天中的消息。

```
/messages names=on/off start-finish
```

* `names`​参数用于指定是否要包含角色名称，默认：`on`​。

* 在未命名参数中，它接受消息索引或start-finish格式的范围。范围是包含的！
* 如果范围不可满足，即无效索引或请求的消息数量超过存在的消息数量，则返回空字符串。
* 从提示中隐藏的消息（由幽灵图标表示）从输出中排除。
* 如果您想知道最新消息的索引，请使用`{{lastMessageId}}`​宏，而`{{lastMessage}}`​将获取消息本身。

要计算范围的起始索引，例如，当您需要获取最后N条消息时，请使用变量减法。此示例将获取聊天中的最后3条消息：

```
/setvar key=start {{lastMessageId}} |
/addvar key=start -2 |
/messages names=off {{getvar::start}}-{{lastMessageId}} |
/setinput
```

‍

### 发送消息

脚本可以作为用户、角色、人物、中立叙述者发送消息，或添加评论。

1. ​`/send (文本)`​ — 作为当前选定的人物添加消息。
2. ​`/sendas name=charname (文本)`​ — 作为任何角色添加消息，通过其名称匹配。`name`​参数是必需的。使用`{{char}}`​宏作为当前角色发送。
3. ​`/sys (文本)`​ — 添加来自中立叙述者的消息，不属于用户或角色。显示的名称纯粹是装饰性的，可以使用`/sysname`​命令自定义。
4. ​`/comment (文本)`​ — 添加在聊天中显示但在提示中不可见的隐藏评论。
5. ​`/addswipe (文本)`​ — 为最后一条角色消息添加滑动。不能为用户或隐藏消息添加滑动。
6. ​`/hide (消息ID或范围)`​ — 根据提供的消息索引或start-finish格式的包含范围，从提示中隐藏一条或多条消息。
7. ​`/unhide (消息ID或范围)`​ — 根据提供的消息索引或start-finish格式的包含范围，将一条或多条消息返回到提示中。

`/send`​、`/sendas`​、`/sys`​和`/comment`​命令可选地接受一个名为`at`​的命名参数，其值为基于零的数字（或包含此类值的变量名），指定消息插入的确切位置。默认情况下，新消息插入在聊天日志的末尾。

这将在对话历史的开头插入一条用户消息：

```
/send at=0 Hi, I use Linux.
```

‍

### 删除消息

这些命令具有潜在的破坏性，没有"撤销"功能。如果您不小心删除了重要内容，请检查/backups/文件夹。

1. ​`/cut (消息ID或范围)`​ — 根据提供的消息索引或start-finish格式的包含范围，从聊天中剪切一条或多条消息。
2. ​`/del (数字)`​ — 从聊天中删除最后N条消息。
3. ​`/delswipe (基于1的滑动ID)`​ — 根据提供的基于1的滑动ID，从最后一条角色消息中删除滑动。
4. ​`/delname (角色名称)`​ — 删除当前聊天中属于指定名称角色的所有消息。
5. `/delchat`​ — 删除当前聊天。

‍

## 世界信息命令

世界信息（也称为Lorebook）是一种高度实用的工具，用于动态将数据插入提示。有关更详细的解释，请参阅专门的页面：==世界信息==。

1. ​`/getchatbook`​ – 获取聊天绑定的世界信息文件名称，如果未绑定则创建一个新的，并通过管道传递。
2. ​`/findentry file=bookName field=fieldName [text]`​ – 使用字段值与提供的文本的模糊匹配，从指定文件（或指向文件名的变量）中查找记录的UID（默认字段：key），并通过管道传递UID，例如 `/findentry file=chatLore field=key Shadowfang`​。
3. ​`/getentryfield file=bookName field=field [UID]`​ – 获取指定世界信息文件（或指向文件名的变量）中UID记录的字段值（默认字段：content），并通过管道传递值，例如 `/getentryfield file=chatLore field=content 123`​。
4. ​`/setentryfield file=bookName uid=UID field=field [text]`​ – 设置指定世界信息文件（或指向文件名的变量）中UID（或指向UID的变量）记录的字段值（默认字段：content）。要为key字段设置多个值，请使用逗号分隔的列表作为文本值，例如 `/setentryfield file=chatLore uid=123 field=key Shadowfang,sword,weapon`​。
5. `/createentry file=bookName key=keyValue [content text]`​ – 在指定文件（或指向文件名的变量）中创建一个新记录，带有key和content（这两个参数都是可选的），并通过管道传递UID，例如 `/createentry file=chatLore key=Shadowfang The sword of the king`​。

### 有效条目字段

|字段|UI元素|值类型|
| ------| ---------------| :-----------: |
|​`content`​|内容|字符串|
|​`comment`​|标题/备忘录|字符串|
|​`key`​|主关键词|字符串列表|
|​`keysecondary`​|可选过滤器|字符串列表|
|​`constant`​|常量状态|布尔值(1/0)|
|​`disable`​|禁用状态|布尔值(1/0)|
|​`order`​|顺序|数字|
|​`selectiveLogic`​|逻辑|(见下文)|
|​`excludeRecursion`​|不可递归|布尔值(1/0)|
|​`probability`​|触发%|数字(0-100)|
|​`depth`​|深度|数字(0-999)|
|​`position`​|位置|(见下文)|
|​`role`​|深度角色|(见下文)|
|​`scanDepth`​|扫描深度|数字(0-100)|
|​`caseSensitive`​|caseSensitive|布尔值(1/0)|
|​`matchWholeWords`​|匹配整词|布尔值(1/0)|

‍

#### 逻辑值

* 0 = AND ANY
* 1 = NOT ALL
* 2 = NOT ANY
* 3 = AND ALL

#### 位置值

* 0 = 主提示之前
* 1 = 主提示之后
* 2 = 作者注释顶部
* 3 = 作者注释底部
* 4 = 聊天中的深度
* 5 = 示例消息顶部
* 6 = 示例消息底部

#### 角色值（仅限位置 = 4）

* 0 = 系统
* 1 = 用户
* 2 = 助手

‍

### 示例1：通过关键字从聊天知识库中读取内容

```
/getchatbook | /setvar key=chatLore |
/findentry file={{getvar::chatLore}} field=key Shadowfang |
/getentryfield file={{getvar::chatLore}} field=key |
/echo
```

### 示例2：创建带有关键字和内容的聊天知识库条目

```
/getchatbook | /setvar key=chatLore |
/createentry file={{getvar::chatLore}} key="Milla" Milla Basset is a friend of Lilac and Carol. She is a hush basset puppy who possesses the power of alchemy. |
/echo
```

### 示例3：用聊天中的新信息扩展现有知识库条目

```
/getchatbook | /setvar key=chatLore |
/findentry file={{getvar::chatLore}} field=key Milla |
/setvar key=millaUid |
/getentryfield file={{getvar::chatLore}} field=content |
/setvar key=millaContent |
/gen lock=on Tell me more about Milla Basset based on the provided conversation history. Incorporate existing information into your reply: {{getvar::millaContent}} |
/setvar key=millaContent |
/echo New content: {{pipe}} |
/setentryfield file={{getvar::chatLore}} uid=millaUid field=content {{getvar::millaContent}}
```

‍

## 文本操作

有各种有用的文本操作实用命令，可用于各种脚本场景。

1. ​`/trimtokens`​ — 将输入修剪为从开始或从结尾指定数量的文本标记，并将结果输出到管道。
2. ​`/trimstart`​ — 将输入修剪到第一个完整句子的开始，并将结果输出到管道。
3. ​`/trimend`​ — 将输入修剪到最后一个完整句子的结尾，并将结果输出到管道。
4. ​`/fuzzy`​ — 对输入文本执行与字符串列表的模糊匹配，将最佳字符串匹配输出到管道。
5. `/regex name=scriptName [text]`​ — 为指定文本执行正则表达式扩展中的正则表达式脚本。脚本必须启用。

### `/trimtokens`​的参数

```
/trimtokens limit=number direction=start/end (input)
```

1. ​`direction`​设置修剪的方向，可以是`start`​或`end`​。默认：`end`​。
2. ​`limit`​设置输出中保留的标记数量。也可以指定包含数字的变量名。必需参数。
3. 未命名参数是要修剪的输入文本。

### `/fuzzy`​的参数

```
/fuzzy list=["candidate1","candidate2"] (input)
```

1. ​`list`​是包含候选项的JSON序列化字符串数组。也可以指定包含列表的变量名。必需参数。
2. 未命名参数是要匹配的输入文本。输出是与输入最接近匹配的候选项之一。

‍

## 自动完成

* 自动完成在聊天输入和大型快速回复编辑器中都已启用。
* 自动完成在您的输入中的任何位置都有效。即使有多个管道命令和嵌套闭包。
* 自动完成支持三种查找匹配命令的方式（用户设置 -> STscript匹配）。

‍

1. **以...开头** "旧"方式。只有以输入的值精确开头的命令才会显示。
2. **包含** 所有包含输入值的命令都会显示。例如：当输入`/delete`​时，命令`/qr-delete`​和`/qr-set-delete`​将显示在自动完成列表中（`/qr-delete`​，`/qr-set-delete`​）。
3. 模糊 所有可以与输入值模糊匹配的命令都会显示。例如：当输入`/seas`​时，命令`/sendas`​将显示在自动完成列表中（`/sendas`​）。

‍

* 命令参数也受自动完成支持。列表将自动显示必需参数。对于可选参数，按Ctrl+Space打开可用选项列表。
* 当输入`/:`​执行闭包或QR时，自动完成将显示作用域变量和QR的列表。  
  自动完成对宏（在斜杠命令中）有有限支持。输入`{{`​获取可用宏的列表。
* 使用上下箭头键从自动完成选项列表中选择一个选项。
* 按Enter或Tab或点击一个选项将该选项放置在光标处。
* 按Escape关闭自动完成列表。
* 按Ctrl+Space打开自动完成列表或切换所选选项的详细信息。

‍

## 解析器标志

```
/parser-flag
```

解析器接受标志来修改其行为。这些标志可以在脚本中的任何点切换开关，所有后续输入将相应地进行评估。  
您可以在用户设置中设置默认标志。

‍

### 严格转义

```
/parser-flag STRICT_ESCAPING on |
```

启用`STRICT_ESCAPING`​后的变化如下。

#### 管道

引用值中的管道不需要转义。

```
/echo title="a|b" c\|d
```

#### 反斜杠

符号前的反斜杠可以被转义，以提供后面跟着功能符号的字面反斜杠。

```
// 这将回显"foo \"，然后回显"bar" |
/echo foo \\|
/echo bar

/echo \\|
/echo \\\|
```

### 替换变量宏

```
/parser-flag REPLACE_GETVAR on |
```

此标志有助于避免当变量值包含可能被解释为宏的文本时发生双重替换。`{{var::}}`​宏最后被替换，并且在结果文本/变量值上不会发生进一步的替换。

将所有`{{getvar::}}`​和`{{getglobalvar::}}`​宏替换为`{{var::}}`​。在幕后，解析器将在带有替换宏的命令之前插入一系列命令执行器：

* 调用`/let`​保存当前`{{pipe}}`​到作用域变量
* 调用`/getvar`​或`/getglobalvar`​获取宏中使用的变量
* 调用`/let`​将检索到的变量保存到作用域变量
* 调用`/return`​并带有保存的`{{pipe}}`​值，以恢复下一个命令的正确管道值

```
// 以下将回显最后一条消息的id/编号 |
/setvar key=x \{\{lastMessageId}} |
/echo {{getvar::x}}
```

```
// 这将回显字面文本{{lastMessageId}} |
/parser-flag REPLACE_GETVAR |
/setvar key=x \{\{lastMessageId}} |
/echo {{getvar::x}}
```

‍

## 快速回复：脚本库和自动执行

快速回复是一个内置的SillyTavern扩展，提供了一种简单的方式来存储和执行您的脚本。

### 配置快速回复

要开始使用，请打开扩展面板（堆叠块图标），并展开快速回复菜单。

**快速回复默认是禁用的，您需要先启用它们。** 然后您将看到一个栏出现在聊天输入栏上方。

您可以设置显示的按钮文本标签（我们建议使用表情符号以简洁）和点击按钮时将执行的脚本。

插槽数量由 **"插槽数量"** 设置控制（最大=100），根据您的需要调整它，完成后点击"应用"。

 **"自动注入用户输入"** 建议在使用STscript时禁用，否则可能会干扰您的输入，请在脚本中使用`{{input}}`​宏获取输入栏的当前值。

快速回复预设允许有多组预定义的快速回复，可以手动切换或使用`/qrset（预设名称）`​命令切换。切换到不同的预设前，不要忘记点击"更新"以将您的更改写入当前使用的预设！

‍

### 手动执行

现在您可以将第一个脚本添加到库中。选择任何空闲插槽（或创建一个），在左框中输入"点击我"设置标签，然后将以下内容粘贴到右框中：

```
/addvar key=clicks 1 |
/if left=clicks right=5 rule=eq else="/echo Keep going..." "/echo You did it!  \| /flushvar clicks"
```

然后点击出现在聊天栏上方的按钮5次。每次点击将变量`clicks`​的值增加1，当值等于5时显示不同的消息并重置变量。

‍

### 自动执行

通过点击创建命令的`⋮`​按钮打开模态菜单。

在此菜单中，您可以执行以下操作：

* 在方便的全屏编辑器中编辑脚本
* 从聊天栏隐藏按钮，使其只能通过自动执行访问。
* 在以下一个或多个条件下启用自动执行：

  * 应用启动
  * 向聊天发送用户消息
  * 在聊天中接收AI消息
  * 打开角色或群组聊天
  * 触发群组成员回复
  * 使用相同的自动化ID激活世界信息条目

* 为快速回复提供自定义工具提示（悬停在UI中的快速回复上显示的文本）
* 执行脚本进行测试

‍

只有在启用快速回复扩展时，命令才会自动执行。

例如，您可以通过添加以下脚本并设置为在用户消息上自动执行，在发送五条用户消息后显示一条消息。

```
/addvar key=usercounter 1 |
/echo You've sent {{pipe}} messages. |
/if left=usercounter right=5 rule=gte "/echo Game over! \| /flushvar usercounter"
```

### 调试器

在扩展的快速回复编辑器中存在一个基本调试器。在脚本中的任何地方设置断点，使用`/breakpoint |`​。从QR编辑器执行脚本时，执行将在该点中断，允许您检查当前可用的变量、管道、命令参数等，并逐步执行剩余代码。

```
/let x {: n=1
	/echo n is {{var::n}} |
	/mul n n |
:} |
/breakpoint |
/:x n=3 |
/echo result is {{pipe}} |
```

### 调用过程

​`/run`​命令可以通过其标签调用在快速回复中定义的脚本，基本上提供了定义过程并从中返回结果的能力。这允许有可重用的脚本块，其他脚本可以引用。过程管道中的最后一个结果将传递给其后的下一个命令。

```
/run ScriptLabel
```

让我们创建两个快速回复：

---

标签：

​`GetRandom`​

命令：

```
/pass {{roll:d100}}
```

---

标签：

​`GetMessage`​

命令：

```
/run GetRandom | /echo Your lucky number is: {{pipe}}
```

点击GetMessage按钮将调用GetRandom过程，该过程将解析{{roll}}宏并将数字传递给调用者，显示给用户。

* 过程不接受命名或未命名参数，但可以引用与调用者相同的变量。
* 调用过程时避免递归，因为如果处理不当，可能会产生"调用栈超出"错误。

#### 从不同快速回复预设调用过程

您可以使用`a.b`​语法从不同的快速回复预设调用过程，其中`a`​ = QR预设名称，`b`​ = QR标签名称

```
/run QRpreset1.QRlabel1
```

默认情况下，系统将首先查找标签为a.b的快速回复，因此如果您的标签之一字面上是"QRpreset1.QRlabel1"，它将尝试运行该标签。如果找不到这样的标签，它将搜索名为"QRpreset1"的QR预设，其中有一个标记为"QRlabel1"的QR。

‍

### 快速回复管理命令

#### 创建快速回复

​`/qr-create (参数, [消息])`​ – 创建一个新的快速回复，例如：`/qr-create set=MyPreset label=MyButton /echo 123`​

参数：

* ​`label`​ - 字符串 - 按钮上的文本，例如，`label=MyButton`​
* ​`set`​ - 字符串 - QR集的名称，例如，`set=PresetName1`​
* ​`hidden`​ - 布尔值 - 按钮是否应该隐藏，例如，`hidden=true`​
* ​`startup`​ - 布尔值 - 应用启动时自动执行，例如，`startup=true`​
* ​`user`​ - 布尔值 - 用户消息时自动执行，例如，`user=true`​
* ​`bot`​ - 布尔值 - AI消息时自动执行，例如，`bot=true`​
* ​`load`​ - 布尔值 - 聊天加载时自动执行，例如，`load=true`​
* ​`title`​ - 布尔值 - 在按钮上显示的标题/工具提示，例如，`title="My Fancy Button"`​

‍

#### 删除快速回复

* ​`/qr-delete (set=string [label])`​ – 删除快速回复

#### 更新快速回复

* ​`/qr-update (参数, [消息])`​ – 更新快速回复，例如：`/qr-update set=MyPreset label=MyButton newlabel=MyRenamedButton /echo 123`​

‍

参数：

* ​`newlabel `​- 字符串 - 按钮的新文本，例如 `newlabel=MyRenamedButton`​
* ​`label`​ - 字符串 - 按钮上的文本，例如，`label=MyButton`​
* ​`set`​ - 字符串 - QR集的名称，例如，`set=PresetName1`​
* ​`hidden`​ - 布尔值 - 按钮是否应该隐藏，例如，`hidden=true`​
* ​`startup`​ - 布尔值 - 应用启动时自动执行，例如，`startup=true`​
* ​`user`​ - 布尔值 - 用户消息时自动执行，例如，`user=true`​
* ​`bot`​ - 布尔值 - AI消息时自动执行，例如，`bot=true`​
* ​`load`​ - 布尔值 - 聊天加载时自动执行，例如，`load=true`​
* ​`title`​ - 布尔值 - 在按钮上显示的标题/工具提示，例如，`title="My Fancy Button"`​

* `qr-get`​ - 检索快速回复的所有属性，例如：`/qr-get set=myQrSet id=42`​

‍

#### 创建或更新QR预设

* ​`/qr-presetupdate (参数 [标签])`​ 或 `/qr-presetadd (参数 [标签])`​

参数：

* ​`enabled`​ - 布尔值 - 启用或禁用预设
* ​`nosend`​ - 布尔值 - 禁用发送/插入用户输入（对斜杠命令无效）
* ​`before`​ - 布尔值 - 在用户输入前放置QR
* ​`slots`​ - 整数 - 插槽数量
* ​`inject`​ - 布尔值 - 自动注入用户输入（如果禁用，使用`{{input}}`​）

创建一个新预设（覆盖现有预设），例如：`/qr-presetadd slots=3 MyNewPreset`​

#### 添加QR上下文菜单

* `/qr-contextadd (set=string label=string chain=bool [preset name])`​ – 向QR添加上下文菜单预设，例如：`/qr-contextadd set=MyPreset label=MyButton chain=true MyOtherPreset`​

#### 删除所有上下文菜单

* `/qr-contextclear (set=string [label])`​ – 从QR中删除所有上下文菜单预设，例如：`/qr-contextclear set=MyPreset MyButton`​

#### 删除一个上下文菜单

* ​`/qr-contextdel (set=string label=string [preset name])`​ – 从QR中删除上下文菜单预设，例如：`/qr-contextdel set=MyPreset label=MyButton MyOtherPreset`​

‍

### 快速回复值转义

​`|{}`​可以在QR消息/命令中用反斜杠转义。

例如，使用`/qr-create label=MyButton /getvar myvar | /echo {{pipe}}`​创建一个调用`/getvar myvar | /echo {{pipe}}`​的QR。

‍

## 扩展命令

SillyTavern扩展（内置、可下载和第三方）可以添加自己的斜杠命令。以下只是官方扩展中功能的示例。列表可能不完整，请务必查看/help slash获取最完整的可用命令列表。

1. ​`/websearch`​ (查询) — 在线搜索网页片段，查找指定查询并将结果返回到管道。由Web Search扩展提供。
2. ​`/imagine`​ (提示) — 使用提供的提示生成图像。由Image Generation扩展提供。
3. ​`/emote`​ (精灵) — 通过模糊匹配其名称为活动角色设置精灵。由Character Expressions扩展提供。
4. ​`/costume`​ (子文件夹) — 为活动角色设置精灵集覆盖。由Character Expressions扩展提供。
5. ​`/music`​ (名称) — 强制更改播放的背景音乐文件，通过其名称。由Dynamic Audio扩展提供。
6. ​`/ambient`​ (名称) — 强制更改播放的环境声音文件，通过其名称。由Dynamic Audio扩展提供。
7. ​`/roll`​ (骰子公式) — 向聊天添加带有骰子掷出结果的隐藏消息。由D&D Dice扩展提供。

‍

## UI交互

脚本还可以与SillyTavern的UI交互：浏览聊天或更改样式参数。

### 角色导航

* ​`/random`​ — 打开与随机角色的聊天。
* `/go (名称)`​ — 打开与指定名称角色的聊天。首先搜索精确名称匹配，然后按前缀，然后按子字符串。

### UI样式

1. ​`/bubble`​ — 将消息样式设置为"气泡聊天"样式。
2. `/flat`​ — 将消息样式设置为"平面聊天"样式。
3. `/single`​ — 将消息样式设置为"单一文档"样式。
4. `/movingui (名称)`​ — 通过名称激活MovingUI预设。
5. `/resetui`​ — 将MovingUI面板状态重置为其原始位置。
6. `/panels`​ — 切换UI面板可见性：顶部栏、左侧和右侧抽屉。
7. `/bg (名称)`​ — 使用模糊名称匹配查找并设置背景。尊重聊天背景锁定状态。
8. `/lockbg`​ — 锁定当前聊天的背景图像。
9. `/unlockbg`​ — 解锁当前聊天的背景图像。

‍

## 更多示例

### 生成聊天摘要（由@IkariDevGIT提供）

```
/setglobalvar key=summaryPrompt Summarize the most important facts and events that have happened in the chat given to you in the Input header. Limit the summary to 100 words or less. Your response should include nothing but the summary. |
/setvar key=tmp |
/messages 0-{{lastMessageId}} |
/trimtokens limit=3000 direction=end |
/setvar key=s1 |
/echo Generating, please wait... |
/genraw lock=on instruct=off {{instructInput}}{{newline}}{{getglobalvar::summaryPrompt}}{{newline}}{{newline}}{{instructInput}}{{newline}}{{getvar::s1}}{{newline}}{{newline}}{{instructOutput}}{{newline}}The chat summary:{{newline}} |
/setvar key=tmp |
/echo Done! |
/setinput {{getvar::tmp}} |
/flushvar tmp |
/flushvar s1
```

### 按钮弹窗使用

```
/setglobalvar key=genders ["boy", "girl", "other"] |
/buttons labels=genders Who are you? |
/echo You picked: {{pipe}}
```

### 获取第N个斐波那契数（使用比内公式）

> 提示：将fib_no的值设置为所需的数字

```
/setvar key=fib_no 5 |
/pow 5 0.5 | /setglobalvar key=SQRT5 |
/setglobalvar key=PHI 1.618033 |
/pow PHI fib_no | /div {{pipe}} SQRT5 |
/round |
/echo {{getvar::fib_no}}th Fibonacci's number is: {{pipe}}
```

### 递归阶乘（使用闭包）

```
/let fact {: n=
    /if left={{var::n}} rule=gt right=1
        else={:
            /return 1
        :}
        {:
            /sub {{var::n}} 1 |
            /:fact n={{pipe}} |
            /mul {{var::n}} {{pipe}}
        :}
:} |

/input Calculate factorial of: |
/let n {{pipe}} |
/:fact n={{var::n}} |
/echo factorial of {{var::n}} is {{pipe}}
```