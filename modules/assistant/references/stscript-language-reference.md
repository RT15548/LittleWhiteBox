# STscript 精简参考手册（第一部分：基础篇）

> 版本基线：本文件按 SillyTavern `1.17.0` 前端实现整理。
> 如果用户实际使用的是 `1.14.0`、更早版本，或未来高于 `1.17.0` 的版本，命令名、参数、返回值、可用范围可能不一致；答疑时应优先把“版本差异”作为排查因素之一。

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

**`/echo` 常用补充参数**：
- `timeout=毫秒` 自定义提示消失时间
- `extendedTimeout=毫秒` 鼠标悬停后的额外停留时间
- `preventDuplicates=true/false` 避免同文案重复提示
- `awaitDismissal=true/false` 等提示关闭后再继续脚本
- `cssClass=类名` 额外样式类
- `color=颜色值` 自定义提示颜色
- `escapeHtml=true/false` 是否转义 HTML
- `onClick={: 闭包 :}` 点击 toast 时执行闭包
- `raw=true/false` 是否直接输出原始文本

**`/popup` `/input` 通用参数**：
- `large=on/off` 增大垂直尺寸
- `wide=on/off` 增大水平尺寸
- `okButton=文本` 自定义确认按钮
- `default=文本`（仅input）默认值
- `rows=数字`（仅input）输入框行数
- `placeholder=文本`（仅input）输入提示
- `tooltip=文本` 提示说明
- `onSuccess={: 闭包 :}`（仅input）确认后执行
- `onCancel={: 闭包 :}`（仅input）取消后执行
- `scroll=on/off`（仅popup）允许滚动
- `wider=on/off`（仅popup）更宽弹窗
- `transparent=on/off`（仅popup）透明背景
- `cancelButton=文本`（仅popup）自定义取消按钮
- `result=popup/pipe`（仅popup）返回方式
- `multiple=on/off`（仅buttons）允许多选

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
| `/listvar` | | 列出当前作用域变量 |
| `/getvar name` | `{{getvar::name}}` | 获取值 |
| `/setvar key=name value` | `{{setvar::name::value}}` | 设置值 |
| `/addvar key=name increment` | | 加/连接 |
| `/incvar name` | `{{incvar::name}}` | +1 |
| `/decvar name` | `{{decvar::name}}` | -1 |
| `/flushvar name` | | 删除变量 |

### 4.3 全局变量命令

同上，命令名加 `global`：`/getglobalvar`、`/setglobalvar`、`/addglobalvar`、`/incglobalvar`、`/decglobalvar`、`/flushglobalvar`

补充：
- `/listvar scope=global` 可列出全局变量
- `/setvar` / `/setglobalvar` 支持 `as=string/number/boolean/list/dictionary/null` 指定写入类型
- `/getvar` / `/getglobalvar` 支持 `index=...` 读取数组元素或对象字段

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

### 9.7 闭包序列化

闭包可序列化为字符串保存，再反序列化回来继续执行：

```stscript
{: /echo hello :} | /closure-serialize | /setvar key=savedClosure
/getvar savedClosure | /closure-deserialize | /run
```

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
| `/sort` | 排序数组/对象键值 | `/sort ["c","a","b"]` |
| `/trimstart` | 裁剪到第一个完整句开始 | |
| `/trimend` | 裁剪到最后一个完整句结束 | |
| `/trimtokens limit=N direction=start/end 文本` | 按token数裁剪 | `/trimtokens limit=100 direction=end {{pipe}}` |
| `/fuzzy list=["a","b"] 输入` | 模糊匹配，返回最接近项 | `/fuzzy list={{getvar::options}} 用户输入` |
| `/upper 文本` | 转大写 | `/upper hello` |
| `/lower 文本` | 转小写 | `/lower HELLO` |
| `/substr start=0 length=5 文本` | 截取子串 | `/substr start=1 length=3 abcde` |
| `/replace old=旧 new=新 文本` | 文本替换 | `/replace old=foo new=bar foo123` |
| `/test pattern=正则 文本` | 测试正则是否命中，返回布尔 | |
| `/match pattern=正则 文本` | 提取正则命中结果 | |
| `/array-wrap` | 把输入包装成数组 | |
| `/array-unwrap` | 把数组展开回文本 | |
| `/beep` | 播放提示音 | |
| `/regex name=脚本名 文本` | 执行正则表达式扩展脚本 | |

```stscript
// 裁剪示例：保留前500个token
/messages 0-{{lastMessageId}} | /trimtokens limit=500 direction=start
```

```stscript
// 排序 + 文本处理
/setvar key=names ["c","a","b"] |
/getvar names | /sort | /echo

/replace old=猫 new=狗 我家有猫 |
/upper {{pipe}} | /echo
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
| `/continue` | 续写最后一条回复 |
| `/regenerate` | 重生最后一条回复 |
| `/impersonate` | 触发一次用户模拟回复 |
| `/sysgen` | 生成旁白/系统消息 |
| `/ask` | 向指定角色卡提问并取回答 |
| `/swipe` | 切换上一条/下一条回复变体 |
| `/trigger` | 触发正常生成（等同点击发送） |
| `/stop` | 停止当前生成 |
| `/tokens` | 统计文本 token 数 |

### 13.2 参数说明

```stscript
/genraw lock=on stop=["。","！"] instruct=on as=char (提示)
```

**`/gen` 常用参数**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `trim=true/false` | 按最后完整句裁剪输出 | false |
| `lock=on/off` | 生成时锁定输入框 | 继承当前行为 |
| `name=名称` | instruct 模式里使用的提示内名字 | `System` |
| `length=数字` | 临时覆盖本次响应长度 | 无 |
| `as=system/char` | 输出提示所属角色 | system |

**`/genraw` 常用参数**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `lock=on/off` | 生成时锁定用户输入 | off |
| `stop=[]` | 自定义停止字符串（JSON数组） | 无 |
| `instruct=on/off` | 是否应用指令格式（仅genraw） | on |
| `as=system/char` | 提示格式化身份（文本补全API） | system |
| `system=文本` | 附加系统提示 | 无 |
| `prefill=文本` | 追加到提示结尾的预填文本 | 无 |
| `length=数字` | 临时覆盖本次响应长度 | 无 |
| `trim=on/off` | 去掉开头的 `{{user}}` / `{{char}}` 前缀 | on |

**生成控制命令补充**
- `/continue await=true [补充提示]`
- `/regenerate await=true`
- `/impersonate await=true [补充提示]`
- `/sysgen trim=true compact=false at=位置 name=显示名 return=pipe/none/object`
- `/ask name=角色名 return=pipe/none/object [问题]`
- `/swipe direction=right/left await=true`
- `/stop` 可用于 QR / 自动化里中断正在进行的生成

### 13.3 示例

```stscript
// 生成并显示
/genraw 用一句话描述今天的天气 | /popup {{pipe}}

// 生成并作为角色发送
/genraw 用{{char}}的口吻说一句问候语 |
/sendas name={{char}} {{pipe}}

// 触发群聊中指定角色回复
/trigger 角色名

// 让指定角色卡直接回答
/ask name={{char}} 用一句话总结你的设定 | /echo
```

---

## 14. 提示注入

### 14.1 核心命令

| 命令 | 作用 |
|------|------|
| `/inject id=标识 position=位置 depth=深度 文本` | 注入自定义提示 |
| `/listinjects` | 列出当前聊天所有注入 |
| `/flushinject` | 清除注入 |

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
| `/note-frequency 数字` | 设置插入频率，别名：`/freq` `/note-freq` |
| `/note-depth 数字` | 设置插入深度，别名：`/depth` |
| `/note-position 值` | 设置插入位置，别名：`/pos` `/note-pos` |
| `/note-role 值` | 设置 chat 位置下注入的消息角色 |

---

## 15. 消息操作

### 15.1 读取消息

```stscript
/messages names=on/off hidden=on/off role=system/assistant/user 范围
```

| 参数 | 说明 |
|------|------|
| `names=on/off` | 是否包含角色名，默认off |
| `hidden=on/off` | 是否包含隐藏消息，默认on |
| `role=system/assistant/user` | 按角色过滤消息 |
| 范围 | 单个索引`5`或范围`0-10`（包含两端） |

```stscript
// 获取最后3条消息
/sub {{lastMessageId}} 2 | /setvar key=start |
/messages names=off {{getvar::start}}-{{lastMessageId}}
```

### 15.2 发送消息

| 命令 | 作用 | 参数 |
|------|------|------|
| `/send 文本` | 以当前用户身份发送 | `at=索引`、`compact`、`return` |
| `/sendas name=角色名 文本` | 以指定角色发送 | `at=索引`、`avatar`、`compact`、`return`、`raw` |
| `/sys 文本` | 中立叙述者消息 | `at=索引`、`compact`、`name`、`return`、`raw` |
| `/sysname 名称` | 设置系统旁白默认显示名 | |
| `/comment 文本` | 隐藏评论（不入提示） | `at=索引`、`compact`、`return`、`raw` |
| `/addswipe 文本` | 为最后角色消息添加滑动 | `switch=true` 立即切到新 swipe |

```stscript
// 在开头插入消息
/send at=0 故事开始了... |

// 以角色身份发送
/sendas name={{char}} 你好，{{user}}！
```

### 15.3 消息发送者信息

| 命令 | 作用 |
|------|------|
| `/message-role` | 读取或修改某条消息发送者角色 |
| `/message-name` | 读取或修改某条消息发送者名字 |

常见写法：

```stscript
/message-role at=-1 | /echo
/message-role at=-2 assistant
/message-name at=-1 "旁白"
```

### 15.4 消息可见性

| 命令 | 作用 |
|------|------|
| `/hide 索引或范围` | 从提示中隐藏消息 |
| `/unhide 索引或范围` | 恢复隐藏的消息 |

### 15.5 删除消息

| 命令 | 作用 |
|------|------|
| `/cut 索引或范围` | 剪切消息 |
| `/del 数字N` | 删除最后N条消息 |
| `/delswipe 滑动ID` | 删除指定滑动（从1开始） |
| `/delname 角色名` | 删除该角色所有消息 |
| `/delchat` | 删除整个聊天 |

⚠️ 删除操作不可撤销，重要数据请查看 `/backups/` 文件夹

### 15.6 聊天会话管理

| 命令 | 作用 |
|------|------|
| `/renamechat 新名称` | 重命名当前聊天 |
| `/getchatname` | 获取当前聊天文件名 |
| `/closechat` | 关闭当前聊天 |
| `/tempchat` | 打开临时 Assistant 聊天 |
| `/forcesave` | 强制保存当前聊天和设置 |

### 15.7 群组成员管理

仅群聊内可用：

| 命令 | 作用 |
|------|------|
| `/member-get field=name/index/id/avatar 成员` | 读取群成员信息 |
| `/member-disable 成员` | 禁用成员发言 |
| `/member-enable 成员` | 启用成员发言 |
| `/member-add 成员` | 添加成员 |
| `/member-remove 成员` | 移除成员 |
| `/member-up 成员` | 成员上移 |
| `/member-down 成员` | 成员下移 |
| `/member-peek 成员` | 预览成员下一句倾向 |
| `/member-count` | 获取当前群成员数量 |

---

## 16. 世界信息（Lorebook）命令

### 16.1 基础命令

| 命令 | 作用 |
|------|------|
| `/world` | 获取世界书列表或切换激活状态 |
| `/getchatbook` | 获取/创建聊天绑定的世界信息文件名 |
| `/getglobalbooks` | 获取全局世界书列表 |
| `/getpersonabook` | 获取/创建当前人格绑定世界书 |
| `/getcharbook` | 获取/创建角色绑定世界书 |
| `/findentry file=文件名 field=字段 关键词` | 模糊查找条目，返回UID |
| `/getentryfield file=文件名 field=字段 UID` | 获取条目字段值 |
| `/setentryfield file=文件名 uid=UID field=字段 值` | 设置条目字段 |
| `/createentry file=文件名 key=关键词 内容` | 创建新条目，返回UID |
| `/wi-set-timed-effect` | 给条目设置限时效果 |
| `/wi-get-timed-effect` | 读取限时效果 |

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

// 定时效果
/wi-set-timed-effect file={{getvar::book}} uid=12 effect=sticky 5
/wi-get-timed-effect file={{getvar::book}} effect=sticky | /echo
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
| 新聊天 | 创建新聊天时 |
| 群组成员回复 | 群聊中成员回复时 |
| 生成前 | 发送生成请求前 |
| 世界信息激活 | 匹配自动化ID时 |

### 17.2 运行其他 QR

```stscript
/run QR标签名                    // 运行同预设内的QR
/run 预设名.QR标签名             // 运行其他预设的QR
/:QR标签名                       // 简写形式
/:预设名.QR标签名
/qr 3                            // 运行当前可见列表中的第3个QR
```

### 17.3 QR 管理命令

**启用 / 禁用预设**
```stscript
/qr-set 预设名
/qr-set-on visible=true 预设名
/qr-set-off 预设名
/qr-chat-set 预设名
/qr-chat-set-on visible=true 预设名
/qr-chat-set-off 预设名
```

`/qrset` 已弃用，只保留兼容提示；新写法用 `/qr-set`、`/qr-set-on`、`/qr-set-off`

**列出**
```stscript
/qr-set-list all
/qr-set-list global
/qr-set-list chat
/qr-list 预设名
```

**创建**
```stscript
/qr-create set=预设名 label=按钮文本 icon=fa-pencil showlabel=true hidden=false startup=false user=false bot=false load=false new=false group=false generation=false title="提示文本" 命令内容
```

**更新**
```stscript
/qr-update set=预设名 label=原标签 newlabel=新标签 icon=fa-wand 其他参数...
```

**删除**
```stscript
/qr-delete set=预设名 按钮标签
/qr-delete set=预设名 id=42
```

**预设管理**
```stscript
/qr-set-create nosend=true before=false inject=true 预设名
/qr-set-update nosend=false before=true inject=true 预设名
/qr-set-delete 预设名
```

**获取QR信息**
```stscript
/qr-get set=预设名 id=42        // 获取QR所有属性
```

**上下文菜单**
```stscript
/qr-contextadd set=主预设 label=按钮名 chain=true 子预设
/qr-contextdel set=主预设 label=按钮名 子预设
/qr-contextclear set=主预设 按钮名
```

**参数默认值 / 导入**
```stscript
/qr-arg difficulty hard
/import from=CommonLib HealButton
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
| `/chat-manager` | 打开当前角色/群组的聊天管理界面 |

### 18.2 界面样式

| 命令 | 作用 |
|------|------|
| `/bubble` | 气泡聊天样式 |
| `/flat` | 平面聊天样式 |
| `/single` | 单一文档样式 |
| `/panels` | 切换面板可见性 |
| `/movingui 预设名` | 激活MovingUI预设 |
| `/resetui` | 重置面板位置 |
| `/pick-icon` | 打开图标选择器 |
| `/is-mobile` | 判断当前是否为移动端 |
| `/chat-render` | 重新渲染聊天区 |
| `/chat-reload` | 重载当前聊天显示 |
| `/chat-jump` | 跳转到指定楼层/消息位置 |

### 18.3 背景

| 命令 | 作用 |
|------|------|
| `/bg 名称` | 设置背景（模糊匹配） |
| `/lockbg` | 锁定当前聊天背景 |
| `/unlockbg` | 解锁背景 |
| `/autobg` | 恢复自动背景切换 |

---

## 19. 角色与连接管理（1.17.x 常用新增）

### 19.1 角色命令

| 命令 | 作用 |
|------|------|
| `/char-find 关键词` | 查找角色，别名：`/findchar`；支持 `tag`、`preferCurrent`、`quiet` |
| `/char-create ...` | 创建角色，返回 avatar key |
| `/char-update ...` | 更新角色字段 |
| `/rename-char 新名称` | 重命名当前角色 |
| `/char-duplicate` | 复制角色，别名：`/dupe` |
| `/char-get` | 获取角色全部数据或指定字段，别名：`/char-data` |
| `/char-delete` | 删除角色 |

**`/char-create` 常见字段**

```stscript
/char-create name="Alice" description="A friendly AI assistant" firstMessage="Hello!"
```

常见命名参数包括：

- `name`
- `description`
- `firstMessage`
- `personality`
- `scenario`
- `messageExamples`
- `creatorNotes`
- `systemPrompt`
- `postHistoryInstructions`
- `creator`
- `characterVersion`
- `tags`
- `favorite`
- `avatar`
- `avatarPromptResize`
- `talkativeness`
- `world`
- `depthPrompt`
- `depthPromptDepth`
- `depthPromptRole`
- `select`

**`/char-update`**

```stscript
/char-update char="Alice" personality="Cheerful and energetic" favorite=true
```

**`/char-get` 常见字段**

- `name`
- `description`
- `personality`
- `scenario`
- `first_mes`
- `mes_example`
- `creator_notes`
- `system_prompt`
- `post_history_instructions`
- `creator`
- `character_version`
- `tags`
- `talkativeness`
- `avatar`
- `fav`

**`/char-delete` 常用参数**

- `char=角色名或avatar key`
- `deleteChats=true/false`
- `silent=true/false`

### 19.2 连接 / 模型命令

| 命令 | 作用 |
|------|------|
| `/api` | 切换或读取当前 API；支持 `quiet=true` |
| `/context` | 切换或读取 context preset；支持 `quiet=true` |
| `/instruct` | 切换或读取 instruct preset；支持 `quiet=true`、`forceGet=true` |
| `/instruct-on` | 打开 instruct mode |
| `/instruct-off` | 关闭 instruct mode |
| `/instruct-state` | 读取 instruct mode 状态 |
| `/model` | 切换或读取当前模型；支持 `quiet=true` |
| `/api-url` | 读取或设置 API URL；支持 `api=`、`connect=`、`quiet=` |
| `/tokenizer` | 切换或读取 tokenizer |

### 19.3 Prompt / 剪贴板 / 其他常用命令

| 命令 | 作用 |
|------|------|
| `/getpromptentry` | 读取 prompt manager 条目；支持 `identifier=`、`name=`、`return=simple/list/dict` |
| `/setpromptentry` | 更新 prompt manager 条目；未命名参数用 `on/off/toggle` |
| `/prompt-post-processing` | 设置提示后处理模式，别名：`/ppp` |
| `/clipboard-get` | 读取剪贴板 |
| `/clipboard-set` | 写入剪贴板 |

---

## 20. 扩展命令速查

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
| `/extension-enable 扩展名` | 核心扩展控制 | 启用扩展 |
| `/extension-disable 扩展名` | 核心扩展控制 | 禁用扩展 |
| `/extension-toggle 扩展名` | 核心扩展控制 | 切换扩展开关；支持 `state=true/false` |
| `/extension-state 扩展名` | 核心扩展控制 | 查询扩展状态 |
| `/extension-exists 扩展名` | 核心扩展控制 | 查询扩展是否存在，别名：`/extension-installed` |
| `/reload-page` | 核心扩展控制 | 重载页面 |
| `/loader-wrap {: 闭包 :}` | Action Loader | 用加载器包裹执行；支持 `blocking`、`toast`、`message`、`title`、`stopTooltip`、`onStop` |
| `/loader-show` | Action Loader | 显示加载器并返回 handle；支持 `blocking`、`toast`、`message`、`title`、`stopTooltip`、`onStop`、`onHide` |
| `/loader-hide` | Action Loader | 隐藏指定 handle 或最近的加载器 |
| `/loader-stop` | Action Loader | 触发指定 handle 的 stop 行为 |

---

## 21. 实用示例

### 21.1 简单血量系统

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

### 21.2 按钮选择菜单

```stscript
/buttons labels=["攻击","防御","逃跑"] 选择你的行动：|
/if left={{pipe}} right=攻击 rule=eq {: /echo 你发起了攻击！ :} |
/if left={{pipe}} right=防御 rule=eq {: /echo 你举起了盾牌！ :} |
/if left={{pipe}} right=逃跑 rule=eq {: /echo 你转身逃跑了！ :}
```

### 21.3 动态提示注入

```stscript
// 根据变量状态注入不同提示
/if left={{getvar::mood}} right=angry rule=eq
    {: /inject id=moodPrompt [{{char}}现在非常愤怒，说话带有攻击性] :}
    {: /inject id=moodPrompt [{{char}}现在心情平静] :}
```

### 21.4 生成摘要

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
`/listvar` `/getvar` `/setvar` `/addvar` `/incvar` `/decvar` `/flushvar`
`/getglobalvar` `/setglobalvar` `/addglobalvar` `/incglobalvar` `/decglobalvar` `/flushglobalvar`
`/let` `/var` `/closure-serialize` `/closure-deserialize`

### 流程控制
`/if` `/while` `/times` `/break` `/abort` `/return` `/run` `/:`

### 输入输出
`/echo` `/popup` `/input` `/buttons` `/setinput` `/speak` `/pass`

### 数学
`/add` `/sub` `/mul` `/div` `/mod` `/pow` `/max` `/min` `/abs` `/round` `/sqrt` `/sin` `/cos` `/log` `/rand` `/len`

### 文本
`/sort` `/trimstart` `/trimend` `/trimtokens` `/fuzzy` `/regex`
`/upper` `/lower` `/substr` `/replace` `/test` `/match` `/array-wrap` `/array-unwrap` `/beep`

### LLM
`/gen` `/genraw` `/continue` `/regenerate` `/impersonate` `/sysgen` `/ask` `/swipe` `/trigger` `/stop` `/tokens`

### 提示注入
`/inject` `/listinjects` `/flushinject` `/note` `/note-frequency` `/note-depth` `/note-position` `/note-role`

### 角色与连接
`/char-find` `/char-create` `/char-update` `/rename-char` `/char-duplicate` `/char-get` `/char-delete`
`/api` `/context` `/instruct` `/instruct-on` `/instruct-off` `/instruct-state` `/model` `/api-url` `/tokenizer`
`/getpromptentry` `/setpromptentry` `/prompt-post-processing` `/clipboard-get` `/clipboard-set`

### 消息
`/messages` `/send` `/sendas` `/sys` `/sysname` `/comment` `/addswipe`
`/message-role` `/message-name` `/hide` `/unhide` `/cut` `/del` `/delswipe` `/delname` `/delchat`
`/renamechat` `/getchatname` `/closechat` `/tempchat` `/forcesave`
`/member-get` `/member-disable` `/member-enable` `/member-add` `/member-remove` `/member-up` `/member-down` `/member-peek` `/member-count`

### 世界信息
`/world` `/getchatbook` `/getglobalbooks` `/getpersonabook` `/getcharbook`
`/findentry` `/getentryfield` `/setentryfield` `/createentry` `/wi-set-timed-effect` `/wi-get-timed-effect`

### UI
`/go` `/random` `/chat-manager` `/bg` `/lockbg` `/unlockbg` `/autobg`
`/bubble` `/flat` `/single` `/panels` `/movingui` `/resetui` `/pick-icon` `/is-mobile` `/chat-render` `/chat-reload` `/chat-jump`

### QR
`/qr` `/qr-set` `/qr-set-on` `/qr-set-off` `/qr-chat-set` `/qr-chat-set-on` `/qr-chat-set-off`
`/qr-set-list` `/qr-list` `/qr-create` `/qr-get` `/qr-update` `/qr-delete`
`/qr-contextadd` `/qr-contextdel` `/qr-contextclear` `/qr-set-create` `/qr-set-update` `/qr-set-delete`
`/qr-arg` `/import`

### 扩展控制
`/extension-enable` `/extension-disable` `/extension-toggle` `/extension-state` `/extension-exists` `/reload-page`
`/loader-wrap` `/loader-show` `/loader-hide` `/loader-stop`

---

如需查看完整命令列表，在聊天中输入 `/help slash`
