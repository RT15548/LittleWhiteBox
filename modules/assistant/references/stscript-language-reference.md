# STscript 精简参考手册（第一部分：基础篇）

---

## 1. 简介

STscript 是 SillyTavern 的内置脚本语言，用于扩展角色卡功能：创建交互游戏、自动化流程、动态提示注入等。

**基本结构**：命令以 `/` 开头，用 `|` 分隔，按顺序执行并传递数据。

```stscript
/pass Hello | /echo
```

---

## 2. 核心语法

### 2.1 管道与命令分隔

| 符号 | 作用 |
|------|------|
| `\|` | 命令分隔符，前一命令输出传给后一命令 |
| `\|\|` | 管道断开器，阻止自动传递 |
| `{{pipe}}` | 显式引用管道值 |

```stscript
/input 输入名字 | /echo 你好，{{pipe}}
```

### 2.2 注释

```stscript
// 单行注释 |
/# 也是单行注释 |
/* 
   块注释
*/
```

### 2.3 转义

| 需转义字符 | 写法 |
|-----------|------|
| 管道 `\|` | `\|` |
| 宏 `{{}}` | `\{\{...\}\}` 或 `\{\{...}}` |
| 引号内引号 | `\"` |
| 空格（参数值中） | `\ ` 或用引号包裹 |
| 闭包分隔符 | `\{:` 或 `\:}` |

---

## 3. 输入/输出命令

| 命令 | 用途 | 示例 |
|------|------|------|
| `/echo (文本)` | 顶部提示通知 | `/echo severity=error 出错了` |
| `/popup (文本)` | 阻塞弹窗（支持HTML） | `/popup large=on 内容` |
| `/input (提示)` | 输入框，结果入管道 | `/input 请输入` |
| `/buttons labels=[] (文本)` | 按钮选择弹窗 | `/buttons labels=["是","否"] 确认？` |
| `/setinput (文本)` | 替换用户输入栏内容 | |
| `/speak voice="名称" (文本)` | TTS朗读 | |

**`/echo` severity 可选值**：`info`(默认) / `success` / `warning` / `error`

**`/popup` `/input` 通用参数**：
- `large=on/off` 增大垂直尺寸
- `wide=on/off` 增大水平尺寸
- `okButton=文本` 自定义确认按钮
- `rows=数字`（仅input）输入框行数

---

## 4. 变量系统

### 4.1 变量类型

| 类型 | 存储位置 | 生命周期 |
|------|---------|---------|
| 本地变量 | 当前聊天元数据 | 聊天内持久 |
| 全局变量 | settings.json | 跨聊天持久 |
| 作用域变量 | 闭包作用域 | 闭包执行期间 |

### 4.2 本地变量命令

| 命令 | 宏形式 | 作用 |
|------|--------|------|
| `/getvar name` | `{{getvar::name}}` | 获取值 |
| `/setvar key=name value` | `{{setvar::name::value}}` | 设置值 |
| `/addvar key=name increment` | | 加/连接 |
| `/incvar name` | `{{incvar::name}}` | +1 |
| `/decvar name` | `{{decvar::name}}` | -1 |
| `/flushvar name` | | 删除变量 |

### 4.3 全局变量命令

同上，命令名加 `global`：`/getglobalvar`、`/setglobalvar`、`/addglobalvar`、`/incglobalvar`、`/decglobalvar`、`/flushglobalvar`

### 4.4 作用域变量（闭包内使用）

```stscript
/let x 初始值 |        // 声明
/var x 新值 |           // 设置
/var x |                // 获取（入管道）
{{var::x}}              // 宏形式获取
```

### 4.5 数组与对象

```stscript
// 数组
/setvar key=arr ["a","b","c"] |
/getvar index=1 arr |           // 获取 "b"
/addvar key=arr "d" |           // 追加元素
/len arr |                      // 获取长度 → 4

// 对象
/setvar key=obj {"name":"test"} |
/getvar index=name obj |        // 获取 "test"
/setvar key=obj index=age 18 |  // 设置子字段
```

---

## 5. 常用宏速查

| 宏 | 含义 |
|----|------|
| `{{pipe}}` | 当前管道值 |
| `{{user}}` | 用户名 |
| `{{char}}` | 当前角色名 |
| `{{lastMessage}}` | 最后一条消息内容 |
| `{{lastMessageId}}` | 最后一条消息索引 |
| `{{input}}` | 用户输入栏当前内容 |
| `{{roll:XdY}}` | 掷骰（如 `{{roll:2d6}}`） |
| `{{random::a::b::c}}` | 随机选择一项 |
| `{{newline}}` | 换行符 |
| `{{timesIndex}}` | `/times` 循环当前索引（从0开始） |

---

## 6. 解析器标志

```stscript
/parser-flag STRICT_ESCAPING on |  // 引号内管道无需转义
/parser-flag REPLACE_GETVAR on |   // 防止变量值中宏被二次解析
```

---

# STscript 精简参考手册（第二部分：流程控制与运算）

---

## 7. 条件判断 `/if`

### 7.1 基本语法

```stscript
/if left=值A right=值B rule=比较规则 else="false时命令" "true时命令"
```

### 7.2 比较规则

| rule | 含义 | 说明 |
|------|------|------|
| `eq` | A = B | 等于 |
| `neq` | A ≠ B | 不等于 |
| `lt` | A < B | 小于 |
| `gt` | A > B | 大于 |
| `lte` | A ≤ B | 小于等于 |
| `gte` | A ≥ B | 大于等于 |
| `not` | !A | 一元否定（只用left） |
| `in` | A 包含 B | 子字符串匹配，不区分大小写 |
| `nin` | A 不包含 B | 不包含子字符串 |

### 7.3 示例

```stscript
// 简单判断
/if left={{pipe}} right=5 rule=gt "/echo 大于5" |

// 带else分支
/if left={{getvar::score}} right=60 rule=gte 
    else="/echo 不及格" 
    "/echo 及格了" |

// 三元运算符用法
/if left=a right=b rule=eq else="/pass 不相等" "/pass 相等" | /echo {{pipe}}
```

### 7.4 子命令转义（不使用闭包时）

```stscript
/if left=1 right=1 rule=eq 
    else="/echo false \| /abort" 
    "/echo true \| /echo 继续执行"
```

---

## 8. 循环

### 8.1 `/times` — 固定次数循环

```stscript
/times 次数 "命令"
```

| 参数 | 说明 |
|------|------|
| `{{timesIndex}}` | 当前迭代索引（从0开始） |
| `guard=off` | 禁用100次迭代限制 |

```stscript
// 输出 0,1,2,3,4
/times 5 "/echo {{timesIndex}}" |

// 累加示例
/setvar key=sum 0 |
/times 10 "/addvar key=sum {{timesIndex}}" |
/echo 总和：{{getvar::sum}}
```

### 8.2 `/while` — 条件循环

```stscript
/while left=值A right=值B rule=比较规则 guard=on "命令"
```

```stscript
// 从1加到10
/setvar key=i 1 |
/setvar key=sum 0 |
/while left=i right=10 rule=lte "/addvar key=sum i \| /incvar i" |
/echo 结果：{{getvar::sum}}
```

### 8.3 `/break` — 跳出循环

```stscript
/times 100 {:
    /echo {{timesIndex}} |
    /if left={{timesIndex}} rule=gte right=5 {:
        /break 提前结束
    :}
:} |
/echo {{pipe}}   // 输出"提前结束"
```

---

## 9. 闭包（Lambda / 匿名函数）

### 9.1 基本语法

```stscript
{: 命令序列 :}
```

**优势**：闭包内无需转义管道和宏

### 9.2 作为子命令使用

```stscript
// 对比：不用闭包（需转义）
/if left=1 rule=eq right=1 else="/echo no \| /abort" "/echo yes" |

// 使用闭包（更清晰）
/if left=1 rule=eq right=1 
    else={: /echo no | /abort :} 
    {: /echo yes :}
```

### 9.3 命名闭包（存入作用域变量）

```stscript
/let myFunc {:
    /echo 这是我的函数
:} |
/:myFunc    // 调用
```

### 9.4 带参数的闭包

```stscript
/let greet {: name="匿名"
    /echo 你好，{{var::name}}！
:} |
/:greet name=张三
```

### 9.5 立即执行闭包

```stscript
// 用 () 立即执行，结果替换闭包位置
/if left={:/len foo:}() rule=eq right={:/len bar:}() "/echo 长度相等"
```

### 9.6 作用域规则

- 闭包可访问自身及祖先作用域的变量
- 内层同名变量会遮蔽外层变量
- 父级管道不会自动注入子闭包，需用 `{{pipe}}` 显式引用

---

## 10. 数学运算

**通用规则**：
- 接受数字或变量名
- 结果输出到管道
- 无效运算返回0

### 10.1 多参数运算

| 命令 | 作用 | 示例 |
|------|------|------|
| `/add a b c...` | 求和 | `/add 1 2 3` → 6 |
| `/mul a b c...` | 求积 | `/mul 2 3 4` → 24 |
| `/max a b c...` | 最大值 | `/max 1 5 3` → 5 |
| `/min a b c...` | 最小值 | `/min 1 5 3` → 1 |

### 10.2 双参数运算

| 命令 | 作用 | 示例 |
|------|------|------|
| `/sub a b` | a - b | `/sub 10 3` → 7 |
| `/div a b` | a ÷ b | `/div 10 3` → 3.33... |
| `/mod a b` | a % b | `/mod 10 3` → 1 |
| `/pow a b` | a^b | `/pow 2 3` → 8 |

### 10.3 单参数运算

| 命令 | 作用 |
|------|------|
| `/sin a` | 正弦 |
| `/cos a` | 余弦 |
| `/log a` | 自然对数 |
| `/sqrt a` | 平方根 |
| `/abs a` | 绝对值 |
| `/round a` | 四舍五入 |

### 10.4 随机数

```stscript
/rand                           // 0-1之间小数
/rand 10                        // 0-10之间
/rand from=5 to=10              // 5-10之间
/rand from=1 to=100 round=round // 1-100整数
```

`round` 可选值：`round`（四舍五入）、`ceil`（向上）、`floor`（向下）

---

## 11. 文本操作

| 命令 | 作用 | 示例 |
|------|------|------|
| `/len 文本或变量` | 获取长度（字符/数组元素） | `/len myArray` |
| `/trimstart` | 裁剪到第一个完整句开始 | |
| `/trimend` | 裁剪到最后一个完整句结束 | |
| `/trimtokens limit=N direction=start/end 文本` | 按token数裁剪 | `/trimtokens limit=100 direction=end {{pipe}}` |
| `/fuzzy list=["a","b"] 输入` | 模糊匹配，返回最接近项 | `/fuzzy list={{getvar::options}} 用户输入` |
| `/regex name=脚本名 文本` | 执行正则表达式扩展脚本 | |

```stscript
// 裁剪示例：保留前500个token
/messages 0-{{lastMessageId}} | /trimtokens limit=500 direction=start
```

---

## 12. `/abort` — 中止脚本

```stscript
/abort                  // 静默中止
/abort 错误信息         // 显示错误后中止
```

配合条件使用：
```stscript
/if left={{getvar::hp}} right=0 rule=lte {: /abort 你已死亡！ :}
```

---

# STscript 精简参考手册（第三部分：LLM交互与高级功能）

---

## 13. LLM 交互

### 13.1 生成命令

| 命令 | 作用 |
|------|------|
| `/gen (提示)` | 带角色设定和聊天上下文生成 |
| `/genraw (提示)` | 纯提示生成，忽略角色和聊天 |
| `/trigger` | 触发正常生成（等同点击发送） |

### 13.2 参数说明

```stscript
/genraw lock=on stop=["。","！"] instruct=on as=char (提示)
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `lock=on/off` | 生成时锁定用户输入 | off |
| `stop=[]` | 自定义停止字符串（JSON数组） | 无 |
| `instruct=on/off` | 是否应用指令格式（仅genraw） | on |
| `as=system/char` | 提示格式化身份（文本补全API） | system |

### 13.3 示例

```stscript
// 生成并显示
/genraw 用一句话描述今天的天气 | /popup {{pipe}}

// 生成并作为角色发送
/genraw 用{{char}}的口吻说一句问候语 |
/sendas name={{char}} {{pipe}}

// 触发群聊中指定角色回复
/trigger 角色名
```

---

## 14. 提示注入

### 14.1 核心命令

| 命令 | 作用 |
|------|------|
| `/inject id=标识 position=位置 depth=深度 文本` | 注入自定义提示 |
| `/listinjects` | 列出当前聊天所有注入 |
| `/flushinjects` | 清除所有注入 |

### 14.2 `/inject` 参数

| 参数 | 说明 | 可选值 |
|------|------|--------|
| `id` | 唯一标识（必需） | 任意字符串 |
| `position` | 注入位置 | `before`（主提示前）、`after`（主提示后，默认）、`chat`（聊天中） |
| `depth` | 聊天深度（position=chat时） | 0=最后消息后，1=最后消息前... 默认4 |

```stscript
// 注入角色状态提示
/inject id=charState position=after [{{char}}当前状态：生命值{{getvar::hp}}/100]

// 清除特定注入（传空文本）
/inject id=charState
```

### 14.3 作者注释命令

| 命令 | 作用 |
|------|------|
| `/note 文本` | 设置作者注释内容 |
| `/interval 数字` | 设置插入间隔 |
| `/depth 数字` | 设置插入深度 |
| `/position 值` | 设置插入位置 |

---

## 15. 消息操作

### 15.1 读取消息

```stscript
/messages names=on/off 范围
```

| 参数 | 说明 |
|------|------|
| `names=on/off` | 是否包含角色名，默认on |
| 范围 | 单个索引`5`或范围`0-10`（包含两端） |

```stscript
// 获取最后3条消息
/sub {{lastMessageId}} 2 | /setvar key=start |
/messages names=off {{getvar::start}}-{{lastMessageId}}
```

### 15.2 发送消息

| 命令 | 作用 | 参数 |
|------|------|------|
| `/send 文本` | 以当前用户身份发送 | `at=索引` 插入位置 |
| `/sendas name=角色名 文本` | 以指定角色发送 | `at=索引` |
| `/sys 文本` | 中立叙述者消息 | `at=索引` |
| `/comment 文本` | 隐藏评论（不入提示） | `at=索引` |
| `/addswipe 文本` | 为最后角色消息添加滑动 | |

```stscript
// 在开头插入消息
/send at=0 故事开始了... |

// 以角色身份发送
/sendas name={{char}} 你好，{{user}}！
```

### 15.3 消息可见性

| 命令 | 作用 |
|------|------|
| `/hide 索引或范围` | 从提示中隐藏消息 |
| `/unhide 索引或范围` | 恢复隐藏的消息 |

### 15.4 删除消息

| 命令 | 作用 |
|------|------|
| `/cut 索引或范围` | 剪切消息 |
| `/del 数字N` | 删除最后N条消息 |
| `/delswipe 滑动ID` | 删除指定滑动（从1开始） |
| `/delname 角色名` | 删除该角色所有消息 |
| `/delchat` | 删除整个聊天 |

⚠️ 删除操作不可撤销，重要数据请查看 `/backups/` 文件夹

---

## 16. 世界信息（Lorebook）命令

### 16.1 基础命令

| 命令 | 作用 |
|------|------|
| `/getchatbook` | 获取/创建聊天绑定的世界信息文件名 |
| `/findentry file=文件名 field=字段 关键词` | 模糊查找条目，返回UID |
| `/getentryfield file=文件名 field=字段 UID` | 获取条目字段值 |
| `/setentryfield file=文件名 uid=UID field=字段 值` | 设置条目字段 |
| `/createentry file=文件名 key=关键词 内容` | 创建新条目，返回UID |

### 16.2 可用字段

| 字段名 | 对应UI | 值类型 |
|--------|--------|--------|
| `content` | 内容 | 字符串 |
| `comment` | 标题/备忘录 | 字符串 |
| `key` | 主关键词 | 逗号分隔字符串 |
| `keysecondary` | 可选过滤器 | 逗号分隔字符串 |
| `constant` | 常量状态 | 1/0 |
| `disable` | 禁用状态 | 1/0 |
| `order` | 顺序 | 数字 |
| `depth` | 深度 | 数字 |
| `position` | 位置 | 0-6（见下表） |
| `selectiveLogic` | 逻辑 | 0-3 |
| `probability` | 触发% | 0-100 |

**position 值**：0=主提示前, 1=主提示后, 2=作者注释顶部, 3=作者注释底部, 4=聊天深度, 5=示例消息顶部, 6=示例消息底部

**selectiveLogic 值**：0=AND ANY, 1=NOT ALL, 2=NOT ANY, 3=AND ALL

### 16.3 示例

```stscript
// 读取条目
/getchatbook | /setvar key=book |
/findentry file={{getvar::book}} field=key 魔法剑 |
/getentryfield file={{getvar::book}} field=content | /echo

// 创建条目
/getchatbook | /setvar key=book |
/createentry file={{getvar::book}} key="龙,恶龙" 这是一条远古巨龙。
```

---

## 17. 快速回复（QR）

### 17.1 自动执行触发条件

| 条件 | 说明 |
|------|------|
| 应用启动 | SillyTavern 启动时 |
| 用户消息 | 用户发送消息后 |
| AI消息 | AI 回复后 |
| 聊天加载 | 打开角色/群组聊天时 |
| 群组成员回复 | 群聊中成员回复时 |
| 世界信息激活 | 匹配自动化ID时 |

### 17.2 运行其他 QR

```stscript
/run QR标签名                    // 运行同预设内的QR
/run 预设名.QR标签名             // 运行其他预设的QR
/:QR标签名                       // 简写形式
/:预设名.QR标签名
```

### 17.3 QR 管理命令

**创建**
```stscript
/qr-create set=预设名 label=按钮文本 hidden=false startup=false user=false bot=false load=false title="提示文本" 命令内容
```

**更新**
```stscript
/qr-update set=预设名 label=原标签 newlabel=新标签 其他参数...
```

**删除**
```stscript
/qr-delete set=预设名 按钮标签
```

**预设管理**
```stscript
/qr-presetadd enabled=true nosend=true slots=10 预设名
/qr-presetupdate 参数... 预设名
/qrset 预设名                    // 切换预设
```

**获取QR信息**
```stscript
/qr-get set=预设名 id=42        // 获取QR所有属性
```

### 17.4 调试器

在 QR 编辑器中使用断点调试：

```stscript
/setvar key=x 10 |
/breakpoint |                    // 执行到此暂停
/echo {{getvar::x}}
```

---

## 18. UI 交互

### 18.1 角色导航

| 命令 | 作用 |
|------|------|
| `/random` | 打开随机角色聊天 |
| `/go 角色名` | 打开指定角色聊天（支持模糊匹配） |

### 18.2 界面样式

| 命令 | 作用 |
|------|------|
| `/bubble` | 气泡聊天样式 |
| `/flat` | 平面聊天样式 |
| `/single` | 单一文档样式 |
| `/panels` | 切换面板可见性 |
| `/movingui 预设名` | 激活MovingUI预设 |
| `/resetui` | 重置面板位置 |

### 18.3 背景

| 命令 | 作用 |
|------|------|
| `/bg 名称` | 设置背景（模糊匹配） |
| `/lockbg` | 锁定当前聊天背景 |
| `/unlockbg` | 解锁背景 |

---

## 19. 扩展命令速查

需安装对应扩展：

| 命令 | 扩展 | 作用 |
|------|------|------|
| `/websearch 查询` | Web Search | 网页搜索 |
| `/imagine 提示` | Image Generation | 生成图像 |
| `/emote 精灵名` | Character Expressions | 设置角色精灵 |
| `/costume 子文件夹` | Character Expressions | 设置精灵集 |
| `/music 名称` | Dynamic Audio | 切换背景音乐 |
| `/ambient 名称` | Dynamic Audio | 切换环境音 |
| `/roll 骰子公式` | D&D Dice | 掷骰子 |

---

## 20. 实用示例

### 20.1 简单血量系统

```stscript
// 初始化（聊天加载时执行）
/getvar hp || /setvar key=hp 100 |
/getvar maxHp || /setvar key=maxHp 100

// 受伤函数
/let damage {: amount=10
    /sub {{getvar::hp}} {{var::amount}} | /setvar key=hp |
    /if left={{getvar::hp}} rule=lte right=0 
        {: /setvar key=hp 0 | /echo severity=error 你死了！ :}
        {: /echo 受到{{var::amount}}点伤害，剩余HP：{{getvar::hp}} :}
:}

// 使用
/:damage amount=25
```

### 20.2 按钮选择菜单

```stscript
/buttons labels=["攻击","防御","逃跑"] 选择你的行动：|
/if left={{pipe}} right=攻击 rule=eq {: /echo 你发起了攻击！ :} |
/if left={{pipe}} right=防御 rule=eq {: /echo 你举起了盾牌！ :} |
/if left={{pipe}} right=逃跑 rule=eq {: /echo 你转身逃跑了！ :}
```

### 20.3 动态提示注入

```stscript
// 根据变量状态注入不同提示
/if left={{getvar::mood}} right=angry rule=eq
    {: /inject id=moodPrompt [{{char}}现在非常愤怒，说话带有攻击性] :}
    {: /inject id=moodPrompt [{{char}}现在心情平静] :}
```

### 20.4 生成摘要

```stscript
/messages 0-{{lastMessageId}} |
/trimtokens limit=2000 direction=end |
/setvar key=context |
/genraw lock=on 请用100字概括以下对话的主要内容：
{{getvar::context}} |
/popup <h3>聊天摘要</h3>{{pipe}}
```

---

## 附录：命令速查表

### 变量
`/getvar` `/setvar` `/addvar` `/incvar` `/decvar` `/flushvar`
`/getglobalvar` `/setglobalvar` `/addglobalvar` `/incglobalvar` `/decglobalvar` `/flushglobalvar`
`/let` `/var`

### 流程控制
`/if` `/while` `/times` `/break` `/abort` `/return` `/run` `/:`

### 输入输出
`/echo` `/popup` `/input` `/buttons` `/setinput` `/speak` `/pass`

### 数学
`/add` `/sub` `/mul` `/div` `/mod` `/pow` `/max` `/min` `/abs` `/round` `/sqrt` `/sin` `/cos` `/log` `/rand` `/len`

### 文本
`/trimstart` `/trimend` `/trimtokens` `/fuzzy` `/regex`

### LLM
`/gen` `/genraw` `/trigger`

### 提示注入
`/inject` `/listinjects` `/flushinjects` `/note` `/interval` `/depth` `/position`

### 消息
`/messages` `/send` `/sendas` `/sys` `/comment` `/addswipe` `/hide` `/unhide` `/cut` `/del` `/delswipe` `/delname` `/delchat`

### 世界信息
`/getchatbook` `/findentry` `/getentryfield` `/setentryfield` `/createentry`

### UI
`/go` `/random` `/bg` `/lockbg` `/unlockbg` `/bubble` `/flat` `/single` `/panels` `/movingui` `/resetui`

---

如需查看完整命令列表，在聊天中输入 `/help slash`