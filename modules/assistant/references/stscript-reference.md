# STscript 完整参考手册

> **版本基线**: SillyTavern 1.18.0
> **文档类型**: 统一 STscript 主参考文档  
> **最后更新**: 2026-04-23

本文档是 STscript 的统一参考文档，供助手和排查场景直接查阅。

本文档包含：
- STscript 基础语法与参数规则
- 转义、引号、数据类型与常见写法
- 完整命令索引
- 主要命令的参数、返回值与示例

## 1.18 基线提醒

本参考现在按 SillyTavern 1.18.0 使用。涉及 persona 管理、Prompt Manager 刷新、正则状态读取、备用表情设置、带连接配置文件的流式生成等场景时，优先按 1.18 命令面理解，不再按 1.17 的命令习惯猜测。

---

## 目录

1. [如何使用本文档](#如何使用本文档)
2. [语法基础](#语法基础)
3. [参数系统](#参数系统)
4. [转义与引号规则](#转义与引号规则)
5. [数据类型详解](#数据类型详解)
6. [常见模式](#常见模式)
7. [命令索引](#命令索引)
8. [命令详细定义](#命令详细定义)

---

## 如何使用本文档

- 查 STscript 是什么、命令怎么组成、管道怎么传值：先看“语法基础”
- 查参数怎么写、值类型是什么：先看“参数系统”
- 查引号、空格、JSON、闭包怎么写不报错：先看“转义与引号规则”
- 查某个命令叫什么、参数有哪些、返回什么：先看“命令索引”，再跳到“命令详细定义”

这份文档的主体是命令字典；前面的基础章节用于帮助你正确理解和使用后面的命令定义。

---

## 语法基础

### 命令结构

```stscript
/command-name namedArg=value namedArg2="quoted value" unnamed argument text
```

组成部分：
- `/command-name`：命令名，必须以 `/` 开头
- `namedArg=value`：命名参数
- `unnamed argument text`：未命名参数或剩余文本

### 管道系统

| 符号 | 作用 | 示例 |
|------|------|------|
| `\|` | 将前一命令输出传给后一命令 | `/echo Hello \| /upper` |
| `\|\|` | 断开自动管道传递 | `/echo A \|\| /echo B` |
| `{{pipe}}` | 显式引用当前管道值 | `/echo Value: {{pipe}}` |

### 注释

```stscript
// 单行注释
/# 也是单行注释
/* 
   多行注释
*/
```

---

## 参数系统

### 参数类型

STscript 支持两种主要参数形式：

#### 1. 命名参数

格式：`key=value`

- 顺序通常无关
- 适合可选配置项
- 支持引号：`key="value with spaces"`

#### 2. 未命名参数

- 与位置相关
- 常用作命令的主要输入
- 某些命令会捕获剩余全部文本

### 参数值类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `STRING` | 字符串 | `text="Hello"` |
| `NUMBER` | 数字 | `count=5` |
| `BOOLEAN` | 布尔值 | `enabled=true` |
| `LIST` | 数组 | `items=["a","b"]` |
| `DICTIONARY` | 对象 | `data={"key":"value"}` |
| `CLOSURE` | 闭包 | `callback={: /echo done :}` |
| `RANGE` | 范围 | `5-10` |
| `VARIABLE_NAME` | 变量名 | `myVar` |

---

## 转义与引号规则

### 基本规则

- 含空格的值应使用引号包裹：`name="Hello World"`
- JSON 数组和对象应保持合法 JSON 格式
- 命名参数里的字符串若包含引号，需要做转义
- 闭包内部仍按 STscript 继续解析，不是普通原样字符串

示例：

```stscript
/echo text="Hello World"
/setvar key=config {"enabled":true,"count":10}
/let callback {: /echo done :}
```

### 闭包内的规则

- 闭包使用 `{: ... :}` 包裹
- 闭包内可以继续写多条命令
- 若命令本身也需要引号或 JSON，要同时满足闭包与命令自身语法

```stscript
/if left=1 right=1 rule=eq {: /echo "条件成立" :}
```

---

## 数据类型详解

### STRING（字符串）

```stscript
/echo Hello
/echo text="Hello World"
```

### NUMBER（数字）

```stscript
/add 1 2
/setvar key=count 5
```

### BOOLEAN（布尔值）

```stscript
/setvar key=flag true
/setvar key=enabled on
```

### LIST（数组）

```stscript
/setvar key=items ["apple","banana","cherry"]
/setvar key=numbers [1,2,3,4,5]
```

### DICTIONARY（对象）

```stscript
/setvar key=person {"name":"张三","age":25}
/setvar key=config {"enabled":true,"count":10}
```

### CLOSURE（闭包）

```stscript
/let myFunc {: /echo Hello :}
/:myFunc
```

### RANGE（范围）

```stscript
/messages 0-10
/messages 5-{{lastMessageId}}
```

---

## 常见模式

### 条件执行

```stscript
/if left={{getvar::hp}} right=0 rule=lte 
    {: /echo 你死了！ :}
    {: /echo 你还活着 :}
```

### 循环

```stscript
/times 5 {: /echo 第 {{timesIndex}} 次 :}
```

### 变量操作

```stscript
/setvar key=score 0 |
/times 10 {: /addvar key=score 10 :} |
/echo 总分: {{getvar::score}}
```

### 用户交互

```stscript
/input 请输入你的名字 |
/setvar key=userName |
/echo 你好, {{getvar::userName}}！
```

---

## 命令索引

### 输入/输出命令
- [/echo](#echo) - 显示提示通知
- [/popup](#popup) - 显示弹窗
- [/input](#input) - 获取用户输入
- [/buttons](#buttons) - 显示按钮选择
- [/setinput](#setinput) - 设置输入栏内容
- [/pass](#pass) - 传递值到管道

### 变量命令
- [/setvar](#setvar) - 设置本地变量
- [/getvar](#getvar) - 获取本地变量
- [/addvar](#addvar) - 向变量添加值
- [/incvar](#incvar) - 变量加1
- [/decvar](#decvar) - 变量减1
- [/flushvar](#flushvar) - 删除变量
- [/listvar](#listvar) - 列出变量
- [/setglobalvar](#setglobalvar) - 设置全局变量
- [/getglobalvar](#getglobalvar) - 获取全局变量
- [/addglobalvar](#addglobalvar) - 向全局变量添加值
- [/incglobalvar](#incglobalvar) - 全局变量加1
- [/decglobalvar](#decglobalvar) - 全局变量减1
- [/flushglobalvar](#flushglobalvar) - 删除全局变量
- [/let](#let) - 声明作用域变量
- [/var](#var) - 获取/设置作用域变量

### 流程控制命令
- [/if](#if) - 条件判断
- [/while](#while) - 条件循环
- [/times](#times) - 固定次数循环
- [/break](#break) - 跳出循环
- [/abort](#abort) - 中止脚本
- [/run](#run) - 运行闭包或QR

### 数学运算命令
- [/add](#add) - 求和
- [/sub](#sub) - 减法
- [/mul](#mul) - 乘法
- [/div](#div) - 除法
- [/mod](#mod) - 取模
- [/pow](#pow) - 幂运算
- [/max](#max) - 最大值
- [/min](#min) - 最小值
- [/abs](#abs) - 绝对值
- [/round](#round) - 四舍五入
- [/sqrt](#sqrt) - 平方根
- [/sin](#sin) - 正弦
- [/cos](#cos) - 余弦
- [/log](#log) - 对数
- [/rand](#rand) - 随机数

### 文本处理命令
- [/len](#len) - 获取长度
- [/upper](#upper) - 转大写
- [/lower](#lower) - 转小写
- [/substr](#substr) - 截取子串
- [/replace](#replace) - 文本替换
- [/test](#test) - 正则测试
- [/match](#match) - 正则匹配
- [/fuzzy](#fuzzy) - 模糊匹配
- [/trimstart](#trimstart) - 裁剪到句首
- [/trimend](#trimend) - 裁剪到句尾
- [/trimtokens](#trimtokens) - 按token裁剪
- [/sort](#sort) - 排序
- [/array-wrap](#array-wrap) - 包装为数组
- [/array-unwrap](#array-unwrap) - 从数组解包

### LLM交互命令
- [/gen](#gen) - 生成文本
- [/genraw](#genraw) - 原始生成
- [/continue](#continue) - 续写
- [/regenerate](#regenerate) - 重新生成
- [/impersonate](#impersonate) - 用户模拟
- [/sysgen](#sysgen) - 系统消息生成
- [/ask](#ask) - 向角色提问
- [/swipe](#swipe) - 切换回复变体
- [/trigger](#trigger) - 触发生成
- [/stop](#stop) - 停止生成
- [/tokens](#tokens) - 统计token数

### 消息操作命令
- [/messages](#messages) - 获取消息
- [/send](#send) - 发送消息
- [/sendas](#sendas) - 以指定角色发送
- [/sys](#sys) - 发送系统消息
- [/sysname](#sysname) - 设置系统消息名称
- [/comment](#comment) - 添加隐藏评论
- [/addswipe](#addswipe) - 添加滑动变体
- [/message-role](#message-role) - 获取/设置消息角色
- [/message-name](#message-name) - 获取/设置消息名称
- [/hide](#hide) - 隐藏消息
- [/unhide](#unhide) - 取消隐藏消息
- [/delswipe](#delswipe) - 删除滑动变体
- [/delname](#delname) - 删除指定角色消息
- [/delchat](#delchat) - 删除聊天
- [/renamechat](#renamechat) - 重命名聊天
- [/getchatname](#getchatname) - 获取聊天名称
- [/closechat](#closechat) - 关闭聊天
- [/tempchat](#tempchat) - 打开临时聊天
- [/forcesave](#forcesave) - 强制保存

### 提示注入命令
- [/inject](#inject) - 注入提示
- [/listinjects](#listinjects) - 列出注入
- [/flushinject](#flushinject) - 清除注入

### 角色管理命令
- [/char-find](#char-find) - 查找角色
- [/char-create](#char-create) - 创建角色
- [/char-update](#char-update) - 更新角色
- [/char-get](#char-get) - 获取角色数据
- [/char-duplicate](#char-duplicate) - 复制角色
- [/char-delete](#char-delete) - 删除角色
- [/rename-char](#rename-char) - 重命名角色
- [/go](#go) - 打开角色聊天

### 群组命令
- [/member-get](#member-get) - 获取成员信息
- [/member-add](#member-add) - 添加成员
- [/member-remove](#member-remove) - 移除成员
- [/member-enable](#member-enable) - 启用成员
- [/member-disable](#member-disable) - 禁用成员
- [/member-up](#member-up) - 成员上移
- [/member-down](#member-down) - 成员下移
- [/member-peek](#member-peek) - 预览成员
- [/member-count](#member-count) - 获取成员数量

### 世界信息命令
（在 world-info.js 中定义）
- [/world](#world) - 管理世界书
- [/getchatbook](#getchatbook) - 获取聊天世界书
- [/getglobalbooks](#getglobalbooks) - 获取全局世界书
- [/getpersonabook](#getpersonabook) - 获取人格世界书
- [/getcharbook](#getcharbook) - 获取角色世界书
- [/findentry](#findentry) - 查找条目
- [/getentryfield](#getentryfield) - 获取条目字段
- [/setentryfield](#setentryfield) - 设置条目字段
- [/createentry](#createentry) - 创建条目

### API与连接命令
- [/api](#api) - 切换API
- [/api-url](#api-url) - 设置API URL
- [/context](#context) - 切换context preset
- [/instruct](#instruct) - 切换instruct preset
- [/instruct-on](#instruct-on) - 启用instruct模式
- [/instruct-off](#instruct-off) - 禁用instruct模式
- [/instruct-state](#instruct-state) - 获取instruct状态
- [/model](#model) - 切换模型
- [/tokenizer](#tokenizer) - 切换tokenizer

### UI命令
- [/bg](#bg) - 设置背景
- [/bubble](#bubble) - 气泡样式
- [/flat](#flat) - 平面样式
- [/single](#single) - 单一文档样式
- [/panels](#panels) - 切换面板
- [/chat-manager](#chat-manager) - 打开聊天管理
- [/chat-render](#chat-render) - 重新渲染聊天
- [/chat-reload](#chat-reload) - 重载聊天
- [/chat-jump](#chat-jump) - 跳转到消息
- [/pick-icon](#pick-icon) - 选择图标
- [/is-mobile](#is-mobile) - 检测移动端

### 工具命令
- [/delay](#delay) - 延迟执行
- [/beep](#beep) - 播放提示音
- [/clipboard-get](#clipboard-get) - 读取剪贴板
- [/clipboard-set](#clipboard-set) - 写入剪贴板
- [/getpromptentry](#getpromptentry) - 获取提示条目
- [/setpromptentry](#setpromptentry) - 设置提示条目
- [/prompt-post-processing](#prompt-post-processing) - 设置提示后处理
- [/reroll-pick](#reroll-pick) - 重新随机选择

---

## 命令详细定义

### /echo

显示顶部提示通知（toast）。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `severity` | STRING | 否 | `info` | `info`, `success`, `warning`, `error` | 提示级别 |
| `timeout` | NUMBER | 否 | - | - | 提示显示时间（毫秒） |
| `extendedTimeout` | NUMBER | 否 | - | - | 鼠标悬停后的额外停留时间（毫秒） |
| `preventDuplicates` | BOOLEAN | 否 | `false` | `true`, `false` | 避免同文案重复提示 |
| `awaitDismissal` | BOOLEAN | 否 | `false` | `true`, `false` | 等待提示关闭后再继续脚本 |
| `cssClass` | STRING | 否 | - | - | 额外的 CSS 类名 |
| `color` | STRING | 否 | - | - | 自定义提示颜色（CSS 颜色值） |
| `escapeHtml` | BOOLEAN | 否 | `true` | `true`, `false` | 是否转义 HTML |
| `onClick` | CLOSURE | 否 | - | - | 点击 toast 时执行的闭包 |
| `raw` | BOOLEAN | 否 | `false` | `true`, `false` | 是否直接输出原始文本 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 要显示的文本内容 |

**返回值**: 空字符串（不输出到管道）

**示例**:

```stscript
/echo Hello World
/echo severity=error 出错了！
/echo timeout=5000 preventDuplicates=true 这条消息会显示5秒
/echo onClick={: /popup 你点击了提示 :} 点击我
```

---

### /popup

显示阻塞式弹窗（模态对话框）。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `scroll` | BOOLEAN | 否 | `true` | `true`, `false` | 允许垂直滚动内容 |
| `large` | BOOLEAN | 否 | `false` | `true`, `false` | 显示大尺寸弹窗（高度） |
| `wide` | BOOLEAN | 否 | `false` | `true`, `false` | 显示宽弹窗 |
| `wider` | BOOLEAN | 否 | `false` | `true`, `false` | 显示更宽弹窗 |
| `transparent` | BOOLEAN | 否 | `false` | `true`, `false` | 透明背景 |
| `okButton` | STRING | 否 | `OK` | - | 确认按钮文本 |
| `cancelButton` | STRING | 否 | - | - | 取消按钮文本（不设置则不显示） |
| `result` | BOOLEAN | 否 | `false` | `true`, `false` | 返回按钮结果而非弹窗文本 |
| `tooltip` | STRING | 否 | - | - | 悬停提示文本 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 弹窗显示的内容（支持 HTML） |

**返回值**: 
- 默认：弹窗文本内容
- `result=true` 时：`1`（OK）、`0`（Cancel）、空字符串（关闭）

**示例**:

```stscript
/popup 这是一个简单弹窗
/popup large=true wide=true <h3>标题</h3><p>内容</p>
/popup okButton="确认" cancelButton="取消" 请确认操作
/popup result=true okButton="左" cancelButton="右" 选择方向 | /echo 结果: {{pipe}}
```

---

### /input

显示输入框弹窗，获取用户输入。

**别名**: `/prompt`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `default` | STRING | 否 | - | - | 输入框默认值 |
| `large` | BOOLEAN | 否 | `off` | `on`, `off` | 显示大尺寸弹窗 |
| `wide` | BOOLEAN | 否 | `off` | `on`, `off` | 显示宽弹窗 |
| `okButton` | STRING | 否 | `Ok` | - | 确认按钮文本 |
| `rows` | NUMBER | 否 | - | - | 输入框行数（多行文本） |
| `placeholder` | STRING | 否 | - | - | 输入框占位符文本 |
| `tooltip` | STRING | 否 | - | - | 悬停提示文本 |
| `onSuccess` | CLOSURE | 否 | - | - | 确认后执行的闭包 |
| `onCancel` | CLOSURE | 否 | - | - | 取消后执行的闭包 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 弹窗提示文本 |

**返回值**: 用户输入的文本（取消则返回空字符串）

**示例**:

```stscript
/input 请输入你的名字
/input default="张三" placeholder="输入姓名" 你叫什么名字？
/input rows=5 large=on 请输入多行文本
/input onSuccess={: /echo 你输入了: {{pipe}} :} 输入内容
```

---

### /buttons

显示按钮选择弹窗。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `labels` | LIST | 是 | - | - | 按钮标签数组 |
| `multiple` | BOOLEAN | 否 | `false` | `true`, `false` | 允许多选 |

**labels 格式**:
- 简单字符串数组: `["按钮1", "按钮2"]`
- 对象数组: `[{"text":"保存","icon":"fa-save","tooltip":"保存更改"}]`

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 弹窗提示文本 |

**返回值**: 
- 单选：点击的按钮标签（字符串）
- 多选：点击的所有按钮标签（数组）
- 取消：空字符串

**示例**:

```stscript
/buttons labels=["是","否"] 你确定吗？
/buttons multiple=true labels=["A","B","C"] 选择多个
```

---

### /char-create

创建新角色。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `name` | STRING | **是** | - | 角色名称 |
| `description` | STRING | 否 | - | 角色描述/人格定义 |
| `firstMessage` | STRING | 否 | - | 首条消息/问候语 |
| `personality` | STRING | 否 | - | 简短人格描述 |
| `scenario` | STRING | 否 | - | 场景设定 |
| `messageExamples` | STRING | 否 | - | 示例消息 |
| `creatorNotes` | STRING | 否 | - | 创作者笔记 |
| `systemPrompt` | STRING | 否 | - | 系统提示 |
| `postHistoryInstructions` | STRING | 否 | - | 历史后指令（越狱） |
| `creator` | STRING | 否 | - | 创作者 |
| `characterVersion` | STRING | 否 | - | 版本 |
| `tags` | STRING | 否 | - | 标签（逗号分隔） |
| `favorite` | BOOLEAN | 否 | - | 是否收藏 |
| `avatar` | STRING | 否 | - | 头像（`prompt` 或文件路径） |
| `avatarPromptResize` | BOOLEAN | 否 | `true` | 是否显示裁剪对话框 |
| `talkativeness` | NUMBER | 否 | - | 话痨度 |
| `world` | STRING | 否 | - | 绑定的世界书 |
| `depthPrompt` | STRING | 否 | - | 深度提示 |
| `depthPromptDepth` | NUMBER | 否 | - | 深度提示深度 |
| `depthPromptRole` | STRING | 否 | - | 深度提示角色 |
| `select` | BOOLEAN | 否 | `true` | 是否选中新角色 |

**未命名参数**: 无

**返回值**: 新角色的 avatar key（唯一标识符）

**示例**:

```stscript
/char-create name="Alice" description="友好的AI助手" firstMessage="你好！"
/char-create name="Bob" personality="智慧" scenario="图书馆" favorite=true
```

---

### /char-update

更新现有角色的属性。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `char` | STRING | 否 | 当前角色 | 角色名或 avatar key |
| *(其他所有 char-create 的字段)* | - | 否 | - | 同 /char-create |

**未命名参数**: 无

**返回值**: 更新的角色的 avatar key

**示例**:

```stscript
/char-update description="更新的描述"
/char-update char="Alice" personality="开朗活泼" favorite=true
/char-update world="MyLorebook"
```

---

### /setentryfield

设置世界信息条目的字段值。

**别名**: `/setlorefield`, `/setwifield`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `file` | STRING | **是** | - | 世界书名称 |
| `uid` | STRING | **是** | - | 条目 UID |
| `field` | STRING | 否 | `content` | 字段名 |

**可用字段列表**:

| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `key` | array | `[]` | 主关键词数组 |
| `keysecondary` | array | `[]` | 次要关键词数组 |
| `comment` | string | `''` | 标题/备注 |
| `content` | string | `''` | 内容 |
| `constant` | boolean | `false` | 常量状态 |
| `vectorized` | boolean | `false` | 向量化状态 |
| `selective` | boolean | `true` | 选择性触发 |
| `selectiveLogic` | enum | `0` | 逻辑（0=AND_ANY, 1=NOT_ALL, 2=NOT_ANY, 3=AND_ALL） |
| `addMemo` | boolean | `false` | 添加备忘录 |
| `order` | number | `100` | 顺序 |
| `position` | number | `0` | 位置（0-6） |
| `disable` | boolean | `false` | 禁用状态 |
| `ignoreBudget` | boolean | `false` | 忽略预算 |
| `excludeRecursion` | boolean | `false` | 排除递归 |
| `preventRecursion` | boolean | `false` | 防止递归 |
| `matchPersonaDescription` | boolean | `false` | 匹配人格描述 |
| `matchCharacterDescription` | boolean | `false` | 匹配角色描述 |
| `matchCharacterPersonality` | boolean | `false` | 匹配角色性格 |
| `matchCharacterDepthPrompt` | boolean | `false` | 匹配深度提示 |
| `matchScenario` | boolean | `false` | 匹配场景 |
| `matchCreatorNotes` | boolean | `false` | 匹配创作者笔记 |
| `delayUntilRecursion` | number | `0` | 延迟递归 |
| `probability` | number | `100` | 触发概率（0-100） |
| `useProbability` | boolean | `true` | 使用概率 |
| `depth` | number | `4` | 深度 |
| `outletName` | string | `''` | 出口名称 |
| `group` | string | `''` | 组 |
| `groupOverride` | boolean | `false` | 组覆盖 |
| `groupWeight` | number | `100` | 组权重 |
| `scanDepth` | number? | `null` | 扫描深度 |
| `caseSensitive` | boolean? | `null` | 区分大小写 |
| `matchWholeWords` | boolean? | `null` | 匹配整词 |
| `useGroupScoring` | boolean? | `null` | 使用组评分 |
| `automationId` | string | `''` | 自动化ID |
| `role` | enum | `0` | 角色 |
| `sticky` | number? | `null` | 粘性（限时效果） |
| `cooldown` | number? | `null` | 冷却（限时效果） |
| `delay` | number? | `null` | 延迟 |
| `characterFilterNames` | array | `[]` | 角色过滤器名称 |
| `characterFilterTags` | array | `[]` | 角色过滤器标签 |
| `characterFilterExclude` | boolean | `false` | 角色过滤器排除 |
| `triggers` | array | `[]` | 触发器 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 字段值 |

**返回值**: 空字符串

**示例**:

```stscript
/setentryfield file=chatLore uid=123 field=content 这是新内容
/setentryfield file=chatLore uid=123 field=key 关键词1,关键词2
/setentryfield file=chatLore uid=123 field=constant true
/setentryfield file=chatLore uid=123 field=probability 50
```

---

---

### /gen

生成文本（带角色设定和聊天上下文）。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `trim` | BOOLEAN | 否 | `false` | `true`, `false` | 按最后完整句裁剪输出 |
| `lock` | BOOLEAN | 否 | - | `on`, `off` | 生成时锁定用户输入 |
| `name` | STRING | 否 | `System` | - | instruct模式中的提示内名字或角色标识符 |
| `length` | NUMBER | 否 | - | - | API响应长度（token数） |
| `as` | STRING | 否 | `system` | `system`, `char` | 输出提示的角色 |
| `stop` | LIST | 否 | - | - | 自定义停止字符串（JSON数组） |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 生成提示 |

**返回值**: 生成的文本

**示例**:

```stscript
/gen 用一句话描述今天的天气
/gen lock=on name=Assistant 写一首诗
/gen as=char length=100 继续故事
```

---

### /genraw

原始文本生成（忽略角色和聊天上下文）。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `lock` | BOOLEAN | 否 | `off` | `on`, `off` | 生成时锁定用户输入 |
| `stop` | LIST | 否 | - | - | 自定义停止字符串（JSON数组） |
| `instruct` | BOOLEAN | 否 | `on` | `on`, `off` | 是否应用指令格式 |
| `as` | STRING | 否 | `system` | `system`, `char` | 提示格式化身份 |
| `system` | STRING | 否 | - | - | 附加系统提示 |
| `prefill` | STRING | 否 | - | - | 追加到提示结尾的预填文本 |
| `length` | NUMBER | 否 | - | - | API响应长度（token数） |
| `trim` | BOOLEAN | 否 | `on` | `on`, `off` | 去掉开头的用户/角色前缀 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 生成提示 |

**返回值**: 生成的文本

**示例**:

```stscript
/genraw 用一句话描述今天的天气
/genraw lock=on stop=["。","！"] instruct=on 写一首诗
/genraw system="你是一个助手" prefill="好的，" 帮我写代码
```

---

### /continue

续写最后一条回复。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `await` | BOOLEAN | 否 | `false` | 是否等待生成完成 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 补充提示 |

**返回值**: 空字符串

**示例**:

```stscript
/continue
/continue await=true
/continue 继续讲故事
```

---

### /regenerate

重新生成最后一条回复。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `await` | BOOLEAN | 否 | `false` | 是否等待生成完成 |

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/regenerate
/regenerate await=true
```

---

### /impersonate

触发用户模拟回复。

**别名**: `/imp`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `await` | BOOLEAN | 否 | `false` | 是否等待生成完成 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 补充提示 |

**返回值**: 空字符串

**示例**:

```stscript
/impersonate
/impersonate await=true
/impersonate 用幽默的方式回答
```

---

### /swipe

切换回复变体。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `direction` | STRING | 否 | `right` | `right`, `left` | 切换方向 |
| `await` | BOOLEAN | 否 | `false` | `true`, `false` | 是否等待切换完成 |

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/swipe
/swipe direction=left
/swipe direction=right await=true
```

---

### /trigger

触发正常生成（等同点击发送）。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 角色名（群聊中指定发言角色） |

**返回值**: 空字符串

**示例**:

```stscript
/trigger
/trigger Alice
```

---

### /stop

停止当前生成。

**别名**: 无

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/stop
```

---

### /tokens

统计文本token数量。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 要统计的文本 |

**返回值**: token数量（字符串格式的数字）

**示例**:

```stscript
/tokens Hello World
/tokens {{getvar::longText}} | /echo Token数: {{pipe}}
```

---

### /messages

获取指定范围的消息。

**别名**: `/message`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `names` | BOOLEAN | 否 | `off` | `on`, `off` | 是否包含角色名 |
| `hidden` | BOOLEAN | 否 | `on` | `on`, `off` | 是否包含隐藏消息 |
| `role` | STRING | 否 | - | `system`, `assistant`, `user` | 按角色过滤消息 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/RANGE | 是 | 消息索引或范围（如 `5` 或 `0-10`） |

**返回值**: 消息文本（多条消息用双换行分隔）

**示例**:

```stscript
/messages 10
/messages names=on 5-10
/messages role=user 0-{{lastMessageId}}
/messages hidden=off 0-5
```

---

### /send

以当前用户身份发送消息。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `at` | NUMBER | 否 | - | 插入位置索引 |
| `compact` | BOOLEAN | 否 | `false` | 紧凑模式 |
| `return` | STRING | 否 | - | 返回方式 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 消息内容 |

**返回值**: 根据`return`参数决定

**示例**:

```stscript
/send Hello World
/send at=0 这是第一条消息
```

---

### /sendas

以指定角色身份发送消息。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `name` | STRING | 是 | - | 角色名 |
| `at` | NUMBER | 否 | - | 插入位置索引 |
| `avatar` | STRING | 否 | - | 头像路径 |
| `compact` | BOOLEAN | 否 | `false` | 紧凑模式 |
| `return` | STRING | 否 | - | 返回方式 |
| `raw` | BOOLEAN | 否 | `false` | 原始模式 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 消息内容 |

**返回值**: 根据`return`参数决定

**示例**:

```stscript
/sendas name={{char}} 你好，{{user}}！
/sendas name=Alice at=0 这是Alice的第一条消息
```

---

### /sys

发送系统/旁白消息。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `at` | NUMBER | 否 | - | 插入位置索引 |
| `compact` | BOOLEAN | 否 | `false` | 紧凑模式 |
| `name` | STRING | 否 | - | 显示名称 |
| `return` | STRING | 否 | - | 返回方式 |
| `raw` | BOOLEAN | 否 | `false` | 原始模式 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 消息内容 |

**返回值**: 根据`return`参数决定

**示例**:

```stscript
/sys 故事开始了...
/sys at=0 name=旁白 很久很久以前...
```

---

### /comment

添加隐藏评论（不进入提示）。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `at` | NUMBER | 否 | - | 插入位置索引 |
| `compact` | BOOLEAN | 否 | `false` | 紧凑模式 |
| `return` | STRING | 否 | - | 返回方式 |
| `raw` | BOOLEAN | 否 | `false` | 原始模式 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 评论内容 |

**返回值**: 根据`return`参数决定

**示例**:

```stscript
/comment 这是一条备注
/comment at=5 在第5条消息后添加备注
```

---

### /hide

隐藏消息（从提示中移除）。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/RANGE | 是 | 消息索引或范围 |

**返回值**: 空字符串

**示例**:

```stscript
/hide 5
/hide 0-10
```

---

### /unhide

取消隐藏消息。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/RANGE | 是 | 消息索引或范围 |

**返回值**: 空字符串

**示例**:

```stscript
/unhide 5
/unhide 0-10
```

---

### /inject

注入自定义提示到LLM。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `id` | STRING | 否 | 自动生成 | - | 注入ID（唯一标识） |
| `position` | STRING | 否 | `after` | `before`, `after`, `chat`, `none` | 注入位置 |
| `depth` | NUMBER | 否 | `4` | - | 注入深度 |
| `scan` | BOOLEAN | 否 | `false` | `true`, `false` | 是否包含在WI扫描中 |
| `role` | STRING | 否 | `system` | `system`, `assistant`, `user` | in-chat注入的角色 |
| `ephemeral` | BOOLEAN | 否 | `false` | `true`, `false` | 生成后移除注入 |
| `filter` | CLOSURE | 否 | - | - | 过滤闭包（返回true才注入） |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 注入文本 |

**返回值**: 注入ID

**示例**:

```stscript
/inject id=charState position=after [{{char}}当前状态：HP {{getvar::hp}}/100]
/inject position=chat depth=0 role=system 重要提示：保持角色
/inject ephemeral=true 这条注入只用一次
/inject id=temp
```

---

### /listinjects

列出当前聊天的所有注入。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `return` | STRING | 否 | `popup-html` | `popup-html`, `pipe`, `object`, `chat-html`, `chat-text` | 返回方式 |

**未命名参数**: 无

**返回值**: 根据`return`参数决定

**示例**:

```stscript
/listinjects
/listinjects return=pipe
```

---

### /flushinject

清除注入。

**别名**: `/flushinjects`

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 注入ID（不提供则清除所有） |

**返回值**: 空字符串

**示例**:

```stscript
/flushinject charState
/flushinject
```

---

### /run

运行闭包或快速回复。

**别名**: `/call`, `/exec`, `/:命令名`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `args` | ANY | 否 | - | 命名参数（可多个） |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | VARIABLE_NAME/STRING/CLOSURE | 是 | 作用域变量名或QR标签 |

**返回值**: 执行结果

**示例**:

```stscript
/run myFunction
/:myFunction
/run QRLabel
/run PresetName.QRLabel
/run myFunc args={"key":"value"}
```

---

### /delay

延迟执行指定毫秒数。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER | 是 | 延迟时间（毫秒） |

**返回值**: 空字符串

**示例**:

```stscript
/delay 1000
/delay 500 | /echo 延迟500ms后显示
```

---

### /fuzzy

模糊匹配列表中的项。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `list` | LIST | 是 | - | - | 候选项列表（JSON数组） |
| `threshold` | NUMBER | 否 | `0.4` | `0.0-1.0` | 匹配阈值（越低越严格） |
| `mode` | STRING | 否 | `first` | `first`, `best` | 匹配模式 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 搜索文本 |

**返回值**: 匹配的项（未匹配则返回空字符串）

**示例**:

```stscript
/fuzzy list=["攻击","防御","逃跑"] 他发起了攻击
/fuzzy list=["up","down","left","right"] threshold=0.3 he looks up
/fuzzy list=["a","b","c"] mode=best abc
```

---

### /pass

传递值到管道（无操作命令）。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 要传递的值 |

**返回值**: 传入的值

**示例**:

```stscript
/pass Hello | /echo
/pass {{getvar::value}} | /upper
```

---

### /api

切换或获取当前API。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `quiet` | BOOLEAN | 否 | `false` | `true`, `false` | 抑制连接提示 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | API名称（不提供则返回当前API） |

**可用API**: `kobold`, `horde`, `novel`, `koboldcpp`, `kcpp`, `openai`, `oai`, `google`, `openrouter`, `claude`, `mistralai`, `groq`, 等

**返回值**: 当前或设置的API名称

**示例**:

```stscript
/api
/api openai
/api quiet=true claude
```

---

### /context

切换或获取context preset。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `quiet` | BOOLEAN | 否 | `false` | `true`, `false` | 抑制切换提示 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | preset名称（不提供则返回当前preset） |

**返回值**: preset名称

**示例**:

```stscript
/context
/context Default
/context quiet=true MyPreset
```

---

### /instruct

切换或获取instruct preset。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `quiet` | BOOLEAN | 否 | `false` | `true`, `false` | 抑制切换提示 |
| `forceGet` | BOOLEAN | 否 | `false` | `true`, `false` | 即使instruct模式禁用也获取名称 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | preset名称（不提供则返回当前preset） |

**返回值**: preset名称

**示例**:

```stscript
/instruct
/instruct creative
/instruct quiet=true forceGet=true
```

---

### /instruct-on

启用instruct模式。

**别名**: 无

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/instruct-on
```

---

### /instruct-off

禁用instruct模式。

**别名**: 无

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/instruct-off
```

---

### /instruct-state

获取或设置instruct模式状态。

**别名**: `/instruct-toggle`

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | BOOLEAN | 否 | 新状态（不提供则返回当前状态） |

**返回值**: instruct模式状态（`true`或`false`）

**示例**:

```stscript
/instruct-state
/instruct-state true
/instruct-state false
```

---

### /model

切换或获取当前模型。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `quiet` | BOOLEAN | 否 | `false` | 抑制切换提示 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 模型名称（不提供则返回当前模型） |

**返回值**: 模型名称

**示例**:

```stscript
/model
/model gpt-4
/model quiet=true claude-3-opus
```

---

### /tokenizer

切换或获取当前tokenizer。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | tokenizer名称（不提供则返回当前tokenizer） |

**返回值**: tokenizer名称

**示例**:

```stscript
/tokenizer
/tokenizer gpt-4
```

---

### /api-url

设置或获取API URL。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `api` | STRING | 否 | 当前API | API名称 |
| `connect` | BOOLEAN | 否 | `true` | 是否自动连接 |
| `quiet` | BOOLEAN | 否 | `false` | 抑制提示 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | API URL（不提供则返回当前URL） |

**返回值**: API URL

**示例**:

```stscript
/api-url
/api-url http://localhost:5000
/api-url api=custom connect=false http://example.com/api
```

---

### /getpromptentry

获取prompt manager条目状态。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `identifier` | STRING/LIST | 否 | - | - | 条目标识符（UUID） |
| `name` | STRING/LIST | 否 | - | - | 条目名称 |
| `return` | STRING | 否 | `simple` | `simple`, `list`, `dict` | 返回格式 |

**未命名参数**: 无

**返回值**: 根据`return`参数决定（布尔值、数组或对象）

**示例**:

```stscript
/getpromptentry identifier=uuid-123
/getpromptentry name="Main Prompt"
/getpromptentry name=["Prompt1","Prompt2"] return=list
```

---

### /setpromptentry

设置prompt manager条目状态。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `identifier` | STRING/LIST | 否 | - | 条目标识符（UUID） |
| `name` | STRING/LIST | 否 | - | 条目名称 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING/BOOLEAN | 否 | 目标状态（`on`/`off`/`toggle`/`true`/`false`） |

**返回值**: 空字符串

**示例**:

```stscript
/setpromptentry identifier=uuid-123 on
/setpromptentry name="Main Prompt" off
/setpromptentry name=["Prompt1","Prompt2"] toggle
```

---

### /prompt-post-processing

设置或获取提示后处理模式。

**别名**: `/ppp`

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 后处理模式（不提供则返回当前模式） |

**返回值**: 后处理模式名称

**示例**:

```stscript
/prompt-post-processing
/prompt-post-processing single
/ppp none
```

---

### /clipboard-set

写入文本到剪贴板。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 要复制的文本 |

**返回值**: 空字符串

**示例**:

```stscript
/clipboard-set Hello World
/clipboard-set {{getvar::result}}
```

---

### /reroll-pick

重新随机化{{pick}}宏的选择。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER | 否 | 种子值（不提供则递增当前种子） |

**返回值**: 新的种子值

**示例**:

```stscript
/reroll-pick
/reroll-pick 42
```

---

### /beep

播放消息提示音。

**别名**: `/ding`

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/beep
```

---

### /upper

转换文本为大写。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 要转换的文本 |

**返回值**: 大写文本

**示例**:

```stscript
/upper hello world
/upper {{pipe}}
```

---

### /lower

转换文本为小写。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 要转换的文本 |

**返回值**: 小写文本

**示例**:

```stscript
/lower HELLO WORLD
/lower {{pipe}}
```

---

### /len

获取文本长度或数组元素数量。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING/LIST | 是 | 文本或数组 |

**返回值**: 长度（数字字符串）

**示例**:

```stscript
/len Hello
/len ["a","b","c"]
/len {{getvar::myArray}}
```

---

### /trimstart

裁剪到第一个完整句开始。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 要裁剪的文本 |

**返回值**: 裁剪后的文本

**示例**:

```stscript
/trimstart ...incomplete sentence. This is complete.
```

---

### /trimend

裁剪到最后一个完整句结束。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 要裁剪的文本 |

**返回值**: 裁剪后的文本

**示例**:

```stscript
/trimend This is complete. This is incomp...
```

---

### /substr

截取子字符串。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `start` | NUMBER | 是 | - | 起始位置（从0开始） |
| `length` | NUMBER | 否 | - | 截取长度 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 源文本 |

**返回值**: 子字符串

**示例**:

```stscript
/substr start=0 length=5 Hello World
/substr start=6 Hello World
```

---

### /replace

文本替换。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `old` | STRING | 是 | - | 要替换的文本 |
| `new` | STRING | 是 | - | 替换为的文本 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 源文本 |

**返回值**: 替换后的文本

**示例**:

```stscript
/replace old=cat new=dog I have a cat
/replace old=foo new=bar {{pipe}}
```

---

### /test

测试正则表达式是否匹配。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `pattern` | STRING | 是 | - | 正则表达式 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 要测试的文本 |

**返回值**: `true`或`false`

**示例**:

```stscript
/test pattern=\d+ Hello123
/test pattern=^[A-Z] hello
```

---

### /match

提取正则表达式匹配结果。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `pattern` | STRING | 是 | - | 正则表达式 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 要匹配的文本 |

**返回值**: 匹配结果（JSON数组）

**示例**:

```stscript
/match pattern=\d+ Hello123World456
/match pattern=(\w+)@(\w+) user@example.com
```

---

### /sort

排序数组或对象键。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | LIST/DICTIONARY | 是 | 要排序的数组或对象 |

**返回值**: 排序后的结果（JSON格式）

**示例**:

```stscript
/sort ["c","a","b"]
/sort {{getvar::myArray}}
```

---

### /go

打开指定角色的聊天。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 角色名（支持模糊匹配） |

**返回值**: 空字符串

**示例**:

```stscript
/go Alice
/go Bob
```

---

### /char-find

查找角色。

**别名**: `/findchar`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `tag` | STRING | 否 | - | 按标签过滤 |
| `preferCurrent` | BOOLEAN | 否 | `false` | 优先当前角色 |
| `quiet` | BOOLEAN | 否 | `false` | 静默模式 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 角色名或关键词 |

**返回值**: 角色avatar key

**示例**:

```stscript
/char-find Alice
/char-find tag=fantasy knight
```

---

### /char-delete

删除角色。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `char` | STRING | 否 | 当前角色 | 角色名或avatar key |
| `deleteChats` | BOOLEAN | 否 | `false` | 是否删除聊天记录 |
| `silent` | BOOLEAN | 否 | `false` | 静默模式 |

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/char-delete char=Alice deleteChats=true
/char-delete
```

---

### /rename-char

重命名当前角色。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 新名称 |

**返回值**: 空字符串

**示例**:

```stscript
/rename-char NewName
```

---

### /delname

删除指定角色的所有消息。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 角色名 |

**返回值**: 空字符串

**示例**:

```stscript
/delname Alice
```

---

### /addswipe

为最后一条角色消息添加滑动变体。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `switch` | BOOLEAN | 否 | `false` | 是否立即切换到新swipe |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | swipe内容 |

**返回值**: 空字符串

**示例**:

```stscript
/addswipe 这是另一个回复
/addswipe switch=true 立即切换到这个回复
```

---

### /delswipe

删除指定的滑动变体。

**别名**: `/swipedel`

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER | 是 | swipe ID（从1开始） |

**返回值**: 新的当前swipe ID

**示例**:

```stscript
/delswipe 2
```

---

### /message-role

获取或设置消息的角色。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `at` | NUMBER | 否 | `-1` | 消息索引（负数表示从末尾倒数） |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 新角色（`system`/`assistant`/`user`） |

**返回值**: 消息角色

**示例**:

```stscript
/message-role at=-1
/message-role at=-2 assistant
```

---

### /message-name

获取或设置消息的发送者名称。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `at` | NUMBER | 否 | `-1` | 消息索引 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 新名称 |

**返回值**: 发送者名称

**示例**:

```stscript
/message-name at=-1
/message-name at=-1 旁白
```

---

### /sysname

设置系统消息的默认显示名称。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 显示名称 |

**返回值**: 空字符串

**示例**:

```stscript
/sysname 旁白
/sysname System
```

---

### /member-get

获取群组成员信息。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `field` | STRING | 否 | `name` | `name`, `index`, `id`, `avatar` | 要获取的字段 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/STRING | 是 | 成员索引或名称 |

**返回值**: 字段值

**示例**:

```stscript
/member-get 0
/member-get field=avatar Alice
```

---

### /member-add

添加群组成员。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 成员名称 |

**返回值**: 空字符串

**示例**:

```stscript
/member-add Alice
```

---

### /member-remove

移除群组成员。

**别名**: `/removemember`, `/memberremove`

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/STRING | 是 | 成员索引或名称 |

**返回值**: 空字符串

**示例**:

```stscript
/member-remove 2
/member-remove Alice
```

---

### /member-enable

启用群组成员发言。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/STRING | 是 | 成员索引或名称 |

**返回值**: 空字符串

**示例**:

```stscript
/member-enable Alice
```

---

### /member-disable

禁用群组成员发言。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/STRING | 是 | 成员索引或名称 |

**返回值**: 空字符串

**示例**:

```stscript
/member-disable Alice
```

---

### /member-up

群组成员上移。

**别名**: `/upmember`, `/memberup`

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/STRING | 是 | 成员索引或名称 |

**返回值**: 空字符串

**示例**:

```stscript
/member-up 2
```

---

### /member-down

群组成员下移。

**别名**: `/downmember`, `/memberdown`

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/STRING | 是 | 成员索引或名称 |

**返回值**: 空字符串

**示例**:

```stscript
/member-down 2
```

---

### /member-peek

预览群组成员角色卡。

**别名**: `/peek`, `/memberpeek`, `/peekmember`

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/STRING | 是 | 成员索引或名称 |

**返回值**: 空字符串

**示例**:

```stscript
/member-peek Alice
```

---

### /member-count

获取群组成员数量。

**别名**: `/countmember`, `/membercount`

**未命名参数**: 无

**返回值**: 成员数量（数字字符串）

**示例**:

```stscript
/member-count
```

---

### /bg

设置背景。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 背景名称（支持模糊匹配） |

**返回值**: 空字符串

**示例**:

```stscript
/bg forest
/bg city_night
```

---

### /bubble

切换到气泡聊天样式。

**别名**: 无

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/bubble
```

---

### /flat

切换到平面聊天样式。

**别名**: 无

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/flat
```

---

### /single

切换到单一文档样式。

**别名**: 无

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/single
```

---

### /panels

切换UI面板显示。

**别名**: `/togglepanels`

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/panels
```

---

### /chat-manager

打开聊天管理界面。

**别名**: 无

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/chat-manager
```

---

### /chat-render

重新渲染聊天区。

**别名**: 无

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/chat-render
```

---

### /chat-reload

重载当前聊天显示。

**别名**: 无

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/chat-reload
```

---

### /chat-jump

跳转到指定消息位置。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER | 是 | 消息索引 |

**返回值**: 空字符串

**示例**:

```stscript
/chat-jump 10
/chat-jump 0
```

---

### /pick-icon

打开图标选择器。

**别名**: 无

**未命名参数**: 无

**返回值**: 选中的图标类名

**示例**:

```stscript
/pick-icon | /setvar key=selectedIcon
```

---

### /is-mobile

检测是否为移动端。

**别名**: 无

**未命名参数**: 无

**返回值**: `true`或`false`

**示例**:

```stscript
/is-mobile | /echo 移动端: {{pipe}}
```

---

### /abort

中止脚本执行。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `quiet` | BOOLEAN | 否 | `false` | 静默模式（不显示错误） |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 错误消息 |

**返回值**: 无（中止执行）

**示例**:

```stscript
/abort 发生错误
/abort quiet=true
/if left={{getvar::hp}} right=0 rule=lte {: /abort 你已死亡！ :}
```

---

### /listvar

列出已注册的本地/全局变量。

**别名**: `/listchatvar`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `scope` | STRING | 否 | `all` | `all`, `local`, `global` | 按作用域过滤 |
| `return` | STRING | 否 | `popup-html` | 取决于运行时支持 | 返回方式 |

**未命名参数**: 无

**返回值**: 本地变量 JSON 列表，或按 `return` 指定的格式返回

**示例**:

```stscript
/listvar
/listvar scope=local
```

---

### /setvar

设置本地变量，并将设置后的值传入管道。

**别名**: `/setchatvar`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `key` | VARIABLE_NAME | 是 | - | 变量名 |
| `index` | NUMBER/STRING | 否 | - | 列表索引或对象键 |
| `as` | STRING | 否 | `string` | 当使用 `index` 时指定转换类型 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING/NUMBER/BOOLEAN/LIST/DICTIONARY | 是 | 变量值 |

**返回值**: 设置后的变量值

**示例**:

```stscript
/setvar key=color green
/setvar key=ages index=John as=number 21
```

---

### /getvar

读取本地变量，并将值传入管道。

**别名**: `/getchatvar`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `key` | VARIABLE_NAME | 否 | - | 变量名 |
| `index` | NUMBER/STRING | 否 | - | 列表索引或对象键 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | VARIABLE_NAME | 否 | 变量名 |

**返回值**: 变量值

**示例**:

```stscript
/getvar height
/getvar key=height
/getvar index=3 costumes
```

---

### /addvar

向本地变量追加/累加值，并将新值传入管道。

**别名**: `/addchatvar`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `key` | VARIABLE_NAME | 是 | - | 变量名 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/STRING | 是 | 要添加的值 |

**返回值**: 新变量值

**示例**:

```stscript
/addvar key=score 10
```

---

### /setglobalvar

设置全局变量，并将设置后的值传入管道。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `key` | VARIABLE_NAME | 是 | - | 变量名 |
| `index` | NUMBER/STRING | 否 | - | 列表索引或对象键 |
| `as` | STRING | 否 | `string` | 当使用 `index` 时指定转换类型 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING/NUMBER/BOOLEAN/LIST/DICTIONARY | 是 | 变量值 |

**返回值**: 设置后的全局变量值

**示例**:

```stscript
/setglobalvar key=color green
/setglobalvar key=ages index=John as=number 21
```

---

### /getglobalvar

读取全局变量，并将值传入管道。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `key` | VARIABLE_NAME | 否 | - | 变量名 |
| `index` | NUMBER/STRING | 否 | - | 列表索引或对象键 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | VARIABLE_NAME | 否 | 变量名 |

**返回值**: 全局变量值

**示例**:

```stscript
/getglobalvar height
/getglobalvar key=height
/getglobalvar index=3 costumes
```

---

### /addglobalvar

向全局变量追加/累加值，并将新值传入管道。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `key` | VARIABLE_NAME | 是 | - | 变量名 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/STRING | 是 | 要添加的值 |

**返回值**: 新变量值

**示例**:

```stscript
/addglobalvar key=score 10
```

---

### /incvar

将本地变量加 1。

**别名**: `/incchatvar`

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | VARIABLE_NAME | 是 | 变量名 |

**返回值**: 新变量值

**示例**:

```stscript
/incvar score
```

---

### /decvar

将本地变量减 1。

**别名**: `/decchatvar`

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | VARIABLE_NAME | 是 | 变量名 |

**返回值**: 新变量值

**示例**:

```stscript
/decvar score
```

---

### /incglobalvar

将全局变量加 1。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | VARIABLE_NAME | 是 | 变量名 |

**返回值**: 新变量值

**示例**:

```stscript
/incglobalvar score
```

---

### /decglobalvar

将全局变量减 1。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | VARIABLE_NAME | 是 | 变量名 |

**返回值**: 新变量值

**示例**:

```stscript
/decglobalvar score
```

---

### /flushvar

删除本地变量。

**别名**: `/flushchatvar`

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | VARIABLE_NAME/CLOSURE | 是 | 变量名，或返回变量名的闭包 |

**返回值**: 空字符串

**示例**:

```stscript
/flushvar score
```

---

### /flushglobalvar

删除全局变量。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | VARIABLE_NAME/CLOSURE | 是 | 变量名，或返回变量名的闭包 |

**返回值**: 空字符串

**示例**:

```stscript
/flushglobalvar score
```

---

### /let

在当前作用域声明变量。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `key` | VARIABLE_NAME | 否 | - | 变量名 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | VARIABLE_NAME | 否 | 变量名 |
| 2 | STRING/NUMBER/BOOLEAN/LIST/DICTIONARY/CLOSURE | 否 | 变量值 |

**返回值**: 变量值

**示例**:

```stscript
/let x foo bar
/let key=x foo bar
/let y
```

---

### /var

读取或设置当前作用域变量。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `key` | VARIABLE_NAME | 否 | - | 变量名；提供时即使无值也按设置流程处理 |
| `index` | NUMBER | 否 | - | 列表索引或对象键 |
| `as` | STRING | 否 | `string` | 当使用 `index` 时指定转换类型 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | VARIABLE_NAME | 否 | 变量名 |
| 2 | STRING/NUMBER/BOOLEAN/LIST/DICTIONARY/CLOSURE | 否 | 新值；省略时为读取 |

**返回值**: 变量值

**示例**:

```stscript
/let x foo | /var x foo bar | /var x | /echo
/let x {} | /var index=cool as=number x 1337
```

---

### /if

按条件执行命令或闭包。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `left` | VARIABLE_NAME/STRING/NUMBER | 是 | - | - | 左操作数 |
| `right` | VARIABLE_NAME/STRING/NUMBER | 否 | - | - | 右操作数 |
| `rule` | STRING | 否 | `eq` | `eq`, `neq`, `in`, `nin`, `gt`, `gte`, `lt`, `lte`, `not` | 比较规则 |
| `else` | CLOSURE/SUBCOMMAND | 否 | - | - | 条件不成立时执行 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | CLOSURE/SUBCOMMAND | 是 | 条件成立时执行的命令 |

**返回值**: 执行分支的结果

**示例**:

```stscript
/if left=score right=10 rule=gte {: /echo 你赢了 :}
/if left=myContent {: /echo 有内容 :}
```

---

### /while

在条件成立时循环执行命令或闭包。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `left` | VARIABLE_NAME/STRING/NUMBER | 是 | - | - | 左操作数 |
| `right` | VARIABLE_NAME/STRING/NUMBER | 否 | - | - | 右操作数 |
| `rule` | STRING | 否 | `eq` | `eq`, `neq`, `in`, `nin`, `gt`, `gte`, `lt`, `lte`, `not` | 比较规则 |
| `guard` | STRING | 否 | `off` | `on`, `off` | 是否关闭默认循环保护 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | CLOSURE/SUBCOMMAND | 是 | 循环体 |

**返回值**: 最后一次执行结果

**示例**:

```stscript
/setvar key=i 0 | /while left=i right=10 rule=lte {: /addvar key=i 1 :}
```

---

### /times

固定次数执行命令或闭包。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `guard` | STRING | 否 | `off` | `on`, `off` | 是否关闭默认循环保护 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER | 是 | 重复次数 |
| 2 | CLOSURE/SUBCOMMAND | 是 | 要执行的命令 |

**返回值**: 最后一次执行结果

**示例**:

```stscript
/times 5 {: /echo 第 {{timesIndex}} 次 :}
```

---

### /break

跳出循环，或从 `/run`、`/:` 执行的闭包中提前返回。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | 任意类型 | 否 | 作为新的 pipe 值返回 |

**返回值**: 可选的 pipe 值

**示例**:

```stscript
/break
/break done
```

---

### /add

对一组值求和。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1..n | NUMBER/VARIABLE_NAME/LIST | 是 | 要相加的值；也可传 JSON 数组 |

**返回值**: 求和结果

**示例**:

```stscript
/add 10 i 30 j
/add ["count", 15, 2, "i"]
```

---

### /mul

对一组值求积。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1..n | NUMBER/VARIABLE_NAME/LIST | 是 | 要相乘的值；也可传 JSON 数组 |

**返回值**: 乘积结果

**示例**:

```stscript
/mul 10 i 30 j
/mul ["count", 15, 2, "i"]
```

---

### /max

返回一组值中的最大值。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1..n | NUMBER/VARIABLE_NAME/LIST | 是 | 待比较的值；也可传 JSON 数组 |

**返回值**: 最大值

**示例**:

```stscript
/max 10 i 30 j
/max ["count", 15, 2, "i"]
```

---

### /min

返回一组值中的最小值。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1..n | NUMBER/VARIABLE_NAME/LIST | 是 | 待比较的值；也可传 JSON 数组 |

**返回值**: 最小值

**示例**:

```stscript
/min 10 i 30 j
/min ["count", 15, 2, "i"]
```

---

### /sub

从第一项开始依次减去后续值。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1..n | NUMBER/VARIABLE_NAME/LIST | 是 | 被减数与减数；也可传 JSON 数组 |

**返回值**: 差值结果

**示例**:

```stscript
/sub i 5
/sub ["count", 4, "i"]
```

---

### /div

执行除法运算。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/VARIABLE_NAME | 是 | 被除数 |
| 2 | NUMBER/VARIABLE_NAME | 是 | 除数 |

**返回值**: 除法结果

**示例**:

```stscript
/div 10 i
```

---

### /mod

执行取模运算。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/VARIABLE_NAME | 是 | 被除数 |
| 2 | NUMBER/VARIABLE_NAME | 是 | 除数 |

**返回值**: 取模结果

**示例**:

```stscript
/mod i 2
```

---

### /pow

执行幂运算。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/VARIABLE_NAME | 是 | 底数 |
| 2 | NUMBER/VARIABLE_NAME | 是 | 指数 |

**返回值**: 幂运算结果

**示例**:

```stscript
/pow i 2
```

---

### /sin

计算正弦值。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/VARIABLE_NAME | 是 | 输入值 |

**返回值**: 正弦结果

**示例**:

```stscript
/sin i
```

---

### /cos

计算余弦值。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/VARIABLE_NAME | 是 | 输入值 |

**返回值**: 余弦结果

**示例**:

```stscript
/cos i
```

---

### /log

计算对数值。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/VARIABLE_NAME | 是 | 输入值 |

**返回值**: 对数结果

**示例**:

```stscript
/log i
```

---

### /abs

计算绝对值。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/VARIABLE_NAME | 是 | 输入值 |

**返回值**: 绝对值结果

**示例**:

```stscript
/abs i
```

---

### /sqrt

计算平方根。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/VARIABLE_NAME | 是 | 输入值 |

**返回值**: 平方根结果

**示例**:

```stscript
/sqrt i
```

---

### /round

执行四舍五入。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/VARIABLE_NAME | 是 | 输入值 |

**返回值**: 四舍五入后的结果

**示例**:

```stscript
/round i
```

---

### /rand

生成随机数。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `from` | NUMBER | 否 | `0` | - | 起始值（包含） |
| `to` | NUMBER | 否 | `1` | - | 结束值（包含） |
| `round` | STRING | 否 | - | `round`, `ceil`, `floor` | 结果取整方式 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER | 否 | 当未提供 `to` 时，可作为上限使用 |

**返回值**: 随机数

**示例**:

```stscript
/rand
/rand 10
/rand from=5 to=10
```

---

### /setinput

设置用户输入框内容，并将该文本传入下一条命令。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 要写入输入框的文本 |

**返回值**: 输入框文本

**示例**:

```stscript
/setinput Hello world
```

---

### /clipboard-get

读取操作系统剪贴板文本。

**别名**: 无

**未命名参数**: 无

**返回值**: 剪贴板文本；在不支持或未授权时通常返回空字符串

**示例**:

```stscript
/clipboard-get
```

---

### /delchat

删除当前聊天。

**别名**: 无

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/delchat
```

---

### /renamechat

重命名当前聊天。

**别名**: 无

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 新聊天名称 |

**返回值**: 空字符串

**示例**:

```stscript
/renamechat 我的新聊天
```

---

### /getchatname

返回当前聊天文件名。

**别名**: 无

**未命名参数**: 无

**返回值**: 当前聊天文件名

**示例**:

```stscript
/getchatname
```

---

### /closechat

关闭当前聊天。

**别名**: 无

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/closechat
```

---

### /tempchat

打开一个临时 Assistant 聊天。

**别名**: 无

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/tempchat
```

---

### /forcesave

强制保存当前聊天和设置。

**别名**: 无

**未命名参数**: 无

**返回值**: 空字符串

**示例**:

```stscript
/forcesave
```

---

### /world

激活、停用或切换世界书。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `state` | STRING | 否 | - | `on`, `off`, `toggle` | 世界书状态控制 |
| `silent` | BOOLEAN | 否 | `false` | - | 是否静默，不弹 toast |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 世界书名称 |

**返回值**: 通常为空字符串

**示例**:

```stscript
/world MyLorebook
/world state=off MyLorebook
```

---

### /getchatbook

获取聊天绑定的世界书名称；需要时可自动创建。

**别名**: `/getchatlore`, `/getchatwi`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `name` | STRING | 否 | - | 创建时使用的世界书名称 |
| `create` | BOOLEAN | 否 | `true` | 不存在时是否创建 |

**未命名参数**: 无

**返回值**: 世界书名称

**示例**:

```stscript
/getchatbook
/getchatbook name=chatLore create=true
```

---

### /getglobalbooks

获取当前选中的全局世界书列表。

**别名**: `/getgloballore`, `/getglobalwi`

**未命名参数**: 无

**返回值**: 已选全局世界书名称列表

**示例**:

```stscript
/getglobalbooks
```

---

### /getpersonabook

获取当前 persona 绑定的世界书名称。

**别名**: `/getpersonalore`, `/getpersonawi`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `name` | STRING | 否 | - | 创建时使用的世界书名称 |
| `create` | BOOLEAN | 否 | `false` | 不存在时是否创建 |

**未命名参数**: 无

**返回值**: 世界书名称；未绑定时可能为空字符串

**示例**:

```stscript
/getpersonabook
```

---

### /getcharbook

获取角色绑定的世界书名称。

**别名**: `/getcharlore`, `/getcharwi`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `type` | STRING | 否 | `primary` | `primary`, `additional`, `all` | 获取哪类角色世界书 |
| `name` | STRING | 否 | - | 创建时使用的世界书名称 |
| `create` | BOOLEAN | 否 | `false` | 不存在时是否创建 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | NUMBER/STRING | 否 | 角色名或 avatar key；省略时使用当前角色 |

**返回值**: 世界书名称，或在 `all/additional` 模式下返回列表

**示例**:

```stscript
/getcharbook
/getcharbook type=all Alice
```

---

### /findentry

在指定世界书中按字段做模糊匹配，返回条目 UID。

**别名**: `/findlore`, `/findwi`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `file` | STRING | 是 | - | 世界书名称 |
| `field` | STRING | 否 | `key` | 用于模糊匹配的字段 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1..n | STRING | 是 | 匹配文本 |

**返回值**: 条目 UID

**示例**:

```stscript
/findentry file=chatLore field=key Shadowfang
```

---

### /getentryfield

读取指定世界书条目的字段值。

**别名**: `/getlorefield`, `/getwifield`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `file` | STRING | 是 | - | 世界书名称 |
| `field` | STRING | 否 | `content` | 要读取的字段 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 条目 UID |

**返回值**: 字段值

**示例**:

```stscript
/getentryfield file=chatLore field=content 123
```

---

### /createentry

在指定世界书中创建条目。

**别名**: `/createlore`, `/createwi`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `file` | STRING | 是 | - | 世界书名称 |
| `key` | STRING | 否 | - | 条目 key |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 条目 content |

**返回值**: 新条目的 UID

**示例**:

```stscript
/createentry file=chatLore key=Shadowfang The sword of the king
```

---

### /char-duplicate

复制角色卡。

**别名**: `/dupe`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `char` | STRING | 否 | 当前角色 | 要复制的角色名或 avatar key |
| `select` | BOOLEAN | 否 | `false` | 复制后是否自动选中新角色 |

**未命名参数**: 无

**返回值**: 新角色的 avatar key

**示例**:

```stscript
/char-duplicate
/char-duplicate char="Alice" select=true
```

---

### /char-get

读取角色数据，或读取角色的某个指定字段。

**别名**: `/char-data`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `char` | STRING | 否 | 当前角色 | 角色名或 avatar key |
| `field` | STRING | 否 | - | 指定字段；省略时返回整份角色数据 |
| `return` | STRING | 否 | 取决于运行时 | 返回方式 |

**未命名参数**: 无

**返回值**: 角色 JSON，或指定字段值

**示例**:

```stscript
/char-get
/char-get char="Alice" field=name
```

---

### /sysgen

根据给定 prompt 生成一条系统消息。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `trim` | BOOLEAN | 否 | `false` | 是否按最后句子边界裁剪输出 |
| `compact` | BOOLEAN | 否 | `false` | 是否使用紧凑布局 |
| `at` | NUMBER | 否 | - | 插入位置（消息索引） |
| `name` | STRING | 否 | - | 自定义显示名称 |
| `return` | STRING | 否 | `none` | 返回方式 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 是 | 生成用 prompt |

**返回值**: 取决于 `return` 参数

**示例**:

```stscript
/sysgen 生成一段简短旁白
/sysgen compact=true name=旁白 描述当前场景
```

---

### /ask

向指定角色卡发起提问。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `name` | STRING | 是 | - | 角色名或 avatar key |
| `return` | STRING | 否 | `pipe` | 返回方式 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 要提问的 prompt |

**返回值**: 取决于 `return` 参数，默认走 pipe

**示例**:

```stscript
/ask name="Alice" 你怎么看这件事？
```

---

### /trimtokens

将文本裁剪到指定 token 数量。

**别名**: 无

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 可选值 | 说明 |
|--------|------|------|--------|--------|------|
| `limit` | NUMBER | 是 | - | - | 保留的 token 数量 |
| `direction` | STRING | 是 | - | `start`, `end` | 从开头或结尾裁剪 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING | 否 | 要裁剪的文本 |

**返回值**: 裁剪后的文本

**示例**:

```stscript
/trimtokens limit=200 direction=end {{pipe}}
```

---

### /array-wrap

将单个值包装成数组。

**别名**: `/list-wrap`

**命名参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `stringify` | BOOLEAN | 否 | `true` | JSON 基元是否按字符串处理 |

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING/DICTIONARY/BOOLEAN/NUMBER/LIST | 是 | 待包装的值 |

**返回值**: 包装后的 JSON 数组

**示例**:

```stscript
/array-wrap hello
/array-wrap stringify=false 42
```

---

### /array-unwrap

从数组中取出第一个元素；若不是数组则原样返回。

**别名**: `/list-unwrap`

**未命名参数**:

| 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|
| 1 | STRING/DICTIONARY/BOOLEAN/NUMBER/LIST | 是 | 待解包的值 |

**返回值**: 解包后的第一个元素；空数组时返回空字符串

**示例**:

```stscript
/array-unwrap ["a","b","c"]
```

---

## 1.18 新增命令补充

以下命令是 1.18 基线里对助手特别值得知道的新增或更应优先使用的入口：

### `/persona-create`

创建一个 persona。

**常见用途**: 新建 persona 档案并写入基础字段。

### `/persona-update`

更新现有 persona。

**常见用途**: 改名字、描述、头像、绑定信息等 persona 元数据。

### `/persona-get`

读取 persona 信息。

**常见用途**: 先查当前 persona 配置，再决定是否更新。

### `/persona-delete`

删除 persona。

**常见用途**: 清理不再使用的 persona。

### `/persona-duplicate`

复制 persona。

**常见用途**: 基于现有 persona 快速派生新版本。

### `/pm-render`

强制刷新 Prompt Manager 的渲染结果。

**常见用途**: 改完 prompt 配置后，希望立刻看到或拿到最新渲染内容。

### `/regex-state`

读取正则系统当前状态。

**常见用途**: 排查某条 regex 是否启用、命中链路是否符合预期。

### `/expression-fallback`

设置或查看备用表情。

**常见用途**: 表情扩展未命中时，指定兜底表达式。

### `/profile-genstream`

使用指定连接配置文件发起流式生成。

**常见用途**: 在多配置文件环境中，不切全局连接也能按目标 profile 做一次流式请求。
