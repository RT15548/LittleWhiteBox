# SillyTavern JavaScript API 参考（第一部分：核心API与模块）

---

## 1. 全局上下文 getContext()

SillyTavern 通过 `SillyTavern.getContext()` 暴露核心功能接口。

```javascript
const context = SillyTavern.getContext();
```

### 1.1 聊天数据

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| `context.chat` | Array | 当前聊天消息数组（可修改） |
| `context.chatId` | String | 当前聊天ID |
| `context.chatMetadata` | Object | 聊天元数据 |
| `context.saveChat()` | Function | 保存当前聊天 |
| `context.clearChat()` | Function | 清空当前聊天 |

### 1.2 角色数据

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| `context.characters` | Array | 所有角色列表 |
| `context.characterId` | Number | 当前角色ID |
| `context.getCharacter(id)` | Function | 获取指定ID的角色 |
| `context.saveCharacter()` | Function | 保存当前角色 |

### 1.3 群组数据

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| `context.groups` | Array | 所有群组列表 |
| `context.selectedGroup` | String | 当前选中群组ID |
| `context.saveGroup()` | Function | 保存当前群组 |

### 1.4 设置与工具

| 属性/方法 | 说明 |
|----------|------|
| `context.extensionSettings` | 扩展设置对象 |
| `context.saveSettingsDebounced` | 防抖保存设置函数 |
| `context.saveMetadata()` | 保存元数据 |
| `context.addLocaleData(locale, data)` | 添加本地化数据 |
| `context.renderTemplate(path, data)` | 渲染模板 |
| `context.getTokenCount(text)` | 获取文本token数量 |
| `context.generateQuietPrompt(text)` | 静默生成（不显示在聊天中） |

---

## 2. 主模块导出 (script.js)

```javascript
import { ... } from "../../../../script.js";
```

### 2.1 事件系统

| 导出 | 说明 |
|------|------|
| `eventSource` | 事件发射器实例 |
| `event_types` | 事件类型枚举对象 |

### 2.2 聊天与角色

| 导出 | 类型 | 说明 |
|------|------|------|
| `characters` | Array | 角色列表 |
| `this_chid` | Number | 当前角色ID |
| `chat` | Array | 当前聊天消息数组 |
| `chat_metadata` | Object | 聊天元数据 |
| `name1` | String | 用户名 |
| `name2` | String | 角色名 |

### 2.3 系统状态

| 导出 | 说明 |
|------|------|
| `settings` | 全局设置对象 |
| `online_status` | 在线状态 |
| `main_api` | 当前主API类型 |
| `max_context` | 最大上下文长度 |
| `is_send_press` | 是否正在发送 |
| `generation_started` | 生成开始时间戳 |

### 2.4 函数

| 导出 | 说明 |
|------|------|
| `saveSettingsDebounced` | 防抖保存设置 |
| `saveCharacterDebounced` | 防抖保存角色 |
| `getRequestHeaders()` | 获取API请求头 |
| `getCurrentChatId()` | 获取当前聊天ID |
| `reloadMarkdownProcessor()` | 重载Markdown处理器 |

### 2.5 常量

| 导出 | 值 | 说明 |
|------|-----|------|
| `systemUserName` | `'SillyTavern System'` | 系统用户名 |
| `neutralCharacterName` | `'Assistant'` | 中性角色名 |
| `default_avatar` | `'img/ai4.png'` | 默认AI头像 |
| `system_avatar` | `'img/five.png'` | 系统头像 |
| `comment_avatar` | `'img/quill.png'` | 评论头像 |
| `default_user_avatar` | `'img/user-default.png'` | 默认用户头像 |
| `MAX_INJECTION_DEPTH` | `1000` | 最大注入深度 |
| `ANIMATION_DURATION_DEFAULT` | `125` | 默认动画时长(ms) |

---

## 3. 扩展模块导出 (extensions.js)

```javascript
import { ... } from "../../../extensions.js";
```

| 导出 | 说明 |
|------|------|
| `getContext` | 获取上下文函数 |
| `getApiUrl` | 获取API URL |
| `extension_settings` | 扩展设置存储对象 |
| `extensionNames` | 扩展名称列表 |
| `modules` | 活动模块列表 |
| `saveMetadataDebounced` | 防抖保存元数据 |
| `renderExtensionTemplateAsync` | 异步渲染扩展模板 |
| `doExtrasFetch` | 执行Extras API请求 |
| `runGenerationInterceptors` | 运行生成拦截器 |
| `writeExtensionField` | 写入扩展字段到角色数据 |

---

## 4. 弹窗模块 (popup.js)

```javascript
import { POPUP_TYPE, POPUP_RESULT, Popup, callGenericPopup } from '../../../popup.js';
```

### 4.1 弹窗类型

| 常量 | 说明 |
|------|------|
| `POPUP_TYPE.TEXT` | 纯文本显示 |
| `POPUP_TYPE.CONFIRM` | 确认对话框 |
| `POPUP_TYPE.INPUT` | 输入对话框 |
| `POPUP_TYPE.DISPLAY` | 信息展示 |

### 4.2 弹窗结果

| 常量 | 说明 |
|------|------|
| `POPUP_RESULT.AFFIRMATIVE` | 用户确认 |
| `POPUP_RESULT.NEGATIVE` | 用户否定 |
| `POPUP_RESULT.CANCELLED` | 用户取消 |
| `POPUP_RESULT.INTERRUPTED` | 被中断 |

### 4.3 调用方法

```javascript
// 确认框
const result = await callGenericPopup('确认操作？', POPUP_TYPE.CONFIRM);

// 输入框
const input = await callGenericPopup('请输入：', POPUP_TYPE.INPUT);

// 信息展示
await callGenericPopup('<h3>标题</h3><p>内容</p>', POPUP_TYPE.DISPLAY);
```

---

## 5. 斜杠命令模块

```javascript
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from '../../../slash-commands/SlashCommandArgument.js';
```

### 5.1 参数类型

| 常量 | 说明 |
|------|------|
| `ARGUMENT_TYPE.STRING` | 字符串 |
| `ARGUMENT_TYPE.NUMBER` | 数字 |
| `ARGUMENT_TYPE.BOOLEAN` | 布尔值 |
| `ARGUMENT_TYPE.LIST` | 列表/数组 |
| `ARGUMENT_TYPE.DICTIONARY` | 对象/字典 |
| `ARGUMENT_TYPE.VARIABLE_NAME` | 变量名 |
| `ARGUMENT_TYPE.CLOSURE` | 闭包 |
| `ARGUMENT_TYPE.SUBCOMMAND` | 子命令 |

### 5.2 注册命令

```javascript
SlashCommandParser.addCommandObject(SlashCommand.fromProps({
    name: 'commandname',
    aliases: ['alias1'],
    callback: (namedArgs, unnamedArgs) => {
        return '返回值';
    },
    returns: '返回值描述',
    namedArgumentList: [
        SlashCommandNamedArgument.fromProps({
            name: 'param',
            description: '参数描述',
            typeList: [ARGUMENT_TYPE.STRING],
            defaultValue: 'default',
            isRequired: false,
            enumList: ['option1', 'option2'],  // 可选枚举
        }),
    ],
    unnamedArgumentList: [
        SlashCommandArgument.fromProps({
            description: '未命名参数描述',
            typeList: [ARGUMENT_TYPE.STRING],
            isRequired: true,
        }),
    ],
    helpString: '命令帮助文本',
}));
```

---

## 6. 工具函数模块 (utils.js)

```javascript
import { ... } from './scripts/utils.js';
```

### 6.1 时间与异步

| 函数 | 说明 |
|------|------|
| `debounce(fn, delay)` | 创建防抖函数 |
| `delay(ms)` | 延迟指定毫秒 `await delay(1000)` |
| `waitUntilCondition(fn, timeout)` | 等待条件函数返回true |

### 6.2 字符串处理

| 函数 | 说明 |
|------|------|
| `trimToEndSentence(text)` | 裁剪到句尾 |
| `escapeRegex(string)` | 转义正则特殊字符 |
| `getCharaFilename(name)` | 获取角色文件名 |

### 6.3 文件与数据

| 函数 | 说明 |
|------|------|
| `download(data, filename, type)` | 下载文件 |
| `getBase64Async(file)` | 异步获取文件Base64 |
| `humanFileSize(bytes)` | 人性化文件大小显示 |
| `isDataURL(str)` | 检查是否为Data URL |

### 6.4 验证与判断

| 函数 | 说明 |
|------|------|
| `isValidUrl(string)` | 验证URL格式 |
| `isTrueBoolean(value)` | 检查真值布尔 |
| `isElementInViewport(el)` | 检查元素是否在视口内 |

### 6.5 UI操作

| 函数 | 说明 |
|------|------|
| `flashHighlight(element)` | 闪烁高亮元素 |
| `copyText(text)` | 复制文本到剪贴板 |
| `resetScrollHeight(element)` | 重置滚动高度 |

---

## 7. 其他模块速查

### 7.1 世界信息 (world-info.js)

| 导出 | 说明 |
|------|------|
| `world_info` | 世界信息数组 |
| `world_names` | 世界名称列表 |
| `getWorldInfoPrompt()` | 获取世界信息提示 |
| `getWorldInfoSettings()` | 获取世界信息设置 |
| `setWorldInfoSettings()` | 设置世界信息设置 |
| `importWorldInfo()` | 导入世界信息 |

### 7.2 标签 (tags.js)

| 导出 | 说明 |
|------|------|
| `tags` | 标签数组 |
| `tag_map` | 标签映射 |
| `filterByTagState()` | 按标签状态过滤 |
| `getTagKeyForEntity()` | 获取实体标签键 |
| `printTagList()` | 打印标签列表 |

### 7.3 国际化 (i18n.js)

| 导出 | 说明 |
|------|------|
| `t` | 翻译模板标签函数 |
| `initLocales()` | 初始化语言环境 |

```javascript
import { t } from '../../../i18n.js';
const text = t`Settings`;  // 自动翻译
```

### 7.4 模板 (templates.js)

| 导出 | 说明 |
|------|------|
| `renderTemplate(path, data)` | 同步渲染模板 |
| `renderTemplateAsync(path, data)` | 异步渲染模板 |

### 7.5 用户 (user.js)

| 导出 | 说明 |
|------|------|
| `currentUser` | 当前用户对象 |
| `isAdmin()` | 是否为管理员 |
| `setUserControls()` | 设置用户控制 |

### 7.6 Token计算 (tokenizers.js)

| 导出 | 说明 |
|------|------|
| `getTokenCount(text)` | 获取token数量 |
| `getTokenCountAsync(text)` | 异步获取token数量 |
| `getFriendlyTokenizerName()` | 获取tokenizer名称 |

### 7.7 宏处理 (macros.js)

| 导出 | 说明 |
|------|------|
| `evaluateMacros(text)` | 解析文本中的宏 |
| `getLastMessageId()` | 获取最后消息ID |

### 7.8 人格 (personas.js)

| 导出 | 说明 |
|------|------|
| `user_avatar` | 用户头像 |
| `getUserAvatars()` | 获取用户头像列表 |
| `setUserAvatar()` | 设置用户头像 |
| `setPersonaDescription()` | 设置人格描述 |

### 7.9 背景 (backgrounds.js)

| 导出 | 说明 |
|------|------|
| `getBackgrounds()` | 获取背景列表 |
| `background_settings` | 背景设置 |
| `loadBackgroundSettings()` | 加载背景设置 |

### 7.10 高级用户设置 (power-user.js)

| 导出 | 说明 |
|------|------|
| `power_user` | 高级用户设置对象 |
| `loadPowerUserSettings()` | 加载高级设置 |
| `getCustomStoppingStrings()` | 获取自定义停止字符串 |
| `MAX_CONTEXT_DEFAULT` | 默认最大上下文 |
| `MAX_RESPONSE_DEFAULT` | 默认最大响应 |

### 7.11 OpenAI (openai.js)

| 导出 | 说明 |
|------|------|
| `oai_settings` | OpenAI设置对象 |
| `chat_completion_sources` | 聊天完成源枚举 |
| `sendOpenAIRequest()` | 发送OpenAI请求 |
| `getChatCompletionModel()` | 获取当前模型 |
| `prepareOpenAIMessages()` | 准备消息数组 |

---

# SillyTavern JavaScript API 参考（第二部分：事件系统）

---

## 8. 事件系统

### 8.1 基本用法

```javascript
import { eventSource, event_types } from "../../../../script.js";

// 监听事件
eventSource.on(event_types.MESSAGE_RECEIVED, handler);

// 单次监听
eventSource.once(event_types.APP_READY, handler);

// 移除监听
eventSource.off(event_types.MESSAGE_RECEIVED, handler);

// 发送事件
await eventSource.emit('event_name', data);
```

### 8.2 应用程序事件

| 事件常量 | 实际值 | 触发时机 |
|---------|--------|---------|
| `APP_READY` | `'app_ready'` | 应用完全加载初始化后 |
| `SETTINGS_LOADED` | `'settings_loaded'` | 用户设置加载完成 |
| `SETTINGS_UPDATED` | `'settings_updated'` | 设置被修改保存 |
| `SETTINGS_LOADED_BEFORE` | `'settings_loaded_before'` | 设置加载前 |
| `SETTINGS_LOADED_AFTER` | `'settings_loaded_after'` | 设置加载后 |

### 8.3 消息事件

| 事件常量 | 实际值 | 触发时机 |
|---------|--------|---------|
| `MESSAGE_SENT` | `'message_sent'` | 用户发送消息后 |
| `MESSAGE_RECEIVED` | `'message_received'` | 收到AI回复后 |
| `MESSAGE_EDITED` | `'message_edited'` | 消息被编辑后 |
| `MESSAGE_DELETED` | `'message_deleted'` | 消息被删除 |
| `MESSAGE_UPDATED` | `'message_updated'` | 消息内容或元数据更新 |
| `MESSAGE_SWIPED` | `'message_swiped'` | 用户滑动消息变体 |
| `MESSAGE_FILE_EMBEDDED` | `'message_file_embedded'` | 文件嵌入消息 |

### 8.4 聊天事件

| 事件常量 | 实际值 | 触发时机 |
|---------|--------|---------|
| `CHAT_CHANGED` | `'chat_id_changed'` | 切换聊天会话 |
| `CHAT_CREATED` | `'chat_created'` | 新聊天被创建 |
| `CHAT_DELETED` | `'chat_deleted'` | 聊天被删除 |

### 8.5 角色事件

| 事件常量 | 实际值 | 触发时机 |
|---------|--------|---------|
| `CHARACTER_EDITED` | `'character_edited'` | 角色信息被修改保存 |
| `CHARACTER_DELETED` | `'characterDeleted'` | 角色被删除 |
| `CHARACTER_DUPLICATED` | `'character_duplicated'` | 角色被复制 |
| `CHARACTER_PAGE_LOADED` | `'character_page_loaded'` | 角色管理页面加载完成 |
| `CHARACTER_MESSAGE_RENDERED` | `'character_message_rendered'` | 角色消息UI渲染完成 |
| `CHARACTER_FIRST_MESSAGE_SELECTED` | `'character_first_message_selected'` | 首条消息被选中 |

### 8.6 生成事件

| 事件常量 | 实际值 | 触发时机 |
|---------|--------|---------|
| `GENERATION_STARTED` | `'generation_started'` | AI开始生成 |
| `GENERATION_STOPPED` | `'generation_stopped'` | 用户手动停止生成 |
| `GENERATION_ENDED` | `'generation_ended'` | AI完成生成 |
| `GENERATION_AFTER_COMMANDS` | `'GENERATION_AFTER_COMMANDS'` | 斜杠命令执行后开始生成 |
| `STREAM_TOKEN_RECEIVED` | `'stream_token_received'` | 流式生成收到token |
| `GENERATE_BEFORE_COMBINE_PROMPTS` | `'generate_before_combine_prompts'` | 合并提示组件前 |
| `GENERATE_AFTER_COMBINE_PROMPTS` | `'generate_after_combine_prompts'` | 合并提示组件后 |
| `GENERATE_AFTER_DATA` | `'generate_after_data'` | 生成数据处理完成 |

### 8.7 群组事件

| 事件常量 | 实际值 | 触发时机 |
|---------|--------|---------|
| `GROUP_UPDATED` | `'group_updated'` | 群组信息被修改 |
| `GROUP_CHAT_CREATED` | `'group_chat_created'` | 群组聊天被创建 |
| `GROUP_CHAT_DELETED` | `'group_chat_deleted'` | 群组聊天被删除 |
| `GROUP_MEMBER_DRAFTED` | `'group_member_drafted'` | 群组成员被选中发言 |

### 8.8 扩展事件

| 事件常量 | 实际值 | 触发时机 |
|---------|--------|---------|
| `EXTENSIONS_FIRST_LOAD` | `'extensions_first_load'` | 所有扩展首次加载完成 |
| `EXTENSION_SETTINGS_LOADED` | `'extension_settings_loaded'` | 扩展设置加载完成 |
| `EXTRAS_CONNECTED` | `'extras_connected'` | Extras服务连接成功 |

### 8.9 世界信息事件

| 事件常量 | 实际值 | 触发时机 |
|---------|--------|---------|
| `WORLDINFO_SETTINGS_UPDATED` | `'worldinfo_settings_updated'` | 世界信息设置被修改 |
| `WORLDINFO_UPDATED` | `'worldinfo_updated'` | 世界信息条目变更 |
| `WORLDINFO_FORCE_ACTIVATE` | `'worldinfo_force_activate'` | 世界信息被强制激活 |
| `WORLD_INFO_ACTIVATED` | `'world_info_activated'` | 世界信息在生成中被激活 |

### 8.10 UI事件

| 事件常量 | 实际值 | 触发时机 |
|---------|--------|---------|
| `USER_MESSAGE_RENDERED` | `'user_message_rendered'` | 用户消息渲染完成 |
| `MOVABLE_PANELS_RESET` | `'movable_panels_reset'` | 可移动面板位置重置 |
| `FORCE_SET_BACKGROUND` | `'force_set_background'` | 背景被设置 |
| `IMAGE_SWIPED` | `'image_swiped'` | 用户滑动查看图片 |

### 8.11 API事件

| 事件常量 | 实际值 | 触发时机 |
|---------|--------|---------|
| `CHATCOMPLETION_SOURCE_CHANGED` | `'chatcompletion_source_changed'` | 切换API源 |
| `CHATCOMPLETION_MODEL_CHANGED` | `'chatcompletion_model_changed'` | 切换模型 |
| `OAI_PRESET_CHANGED_BEFORE` | `'oai_preset_changed_before'` | OpenAI预设即将更改 |
| `OAI_PRESET_CHANGED_AFTER` | `'oai_preset_changed_after'` | OpenAI预设更改完成 |
| `OAI_PRESET_EXPORT_READY` | `'oai_preset_export_ready'` | OpenAI预设准备导出 |
| `OAI_PRESET_IMPORT_READY` | `'oai_preset_import_ready'` | OpenAI预设导入完成 |
| `TEXT_COMPLETION_SETTINGS_READY` | `'text_completion_settings_ready'` | 文本完成设置就绪 |
| `CHAT_COMPLETION_SETTINGS_READY` | `'chat_completion_settings_ready'` | 聊天完成设置就绪 |
| `CHAT_COMPLETION_PROMPT_READY` | `'chat_completion_prompt_ready'` | 聊天提示构建完成 |

### 8.12 其他事件

| 事件常量 | 实际值 | 触发时机 |
|---------|--------|---------|
| `IMPERSONATE_READY` | `'impersonate_ready'` | 用户模拟模式就绪 |
| `FILE_ATTACHMENT_DELETED` | `'file_attachment_deleted'` | 文件附件被删除 |
| `ONLINE_STATUS_CHANGED` | `'online_status_changed'` | 在线状态变化 |
| `CONNECTION_PROFILE_LOADED` | `'connection_profile_loaded'` | 连接配置加载完成 |
| `TOOL_CALLS_PERFORMED` | `'tool_calls_performed'` | 工具调用执行完成 |
| `TOOL_CALLS_RENDERED` | `'tool_calls_rendered'` | 工具调用结果渲染完成 |
| `OPEN_CHARACTER_LIBRARY` | `'open_character_library'` | 角色库界面被打开 |

---

## 9. 生成拦截器

### 9.1 注册方式

在 manifest.json 中声明：

```json
{
    "generate_interceptor": "interceptorFunctionName"
}
```

### 9.2 函数签名

```javascript
globalThis.interceptorFunctionName = async function(chat, contextSize, abort, type) {
    // chat: Array - 聊天消息数组，可直接修改
    // contextSize: Number - 当前上下文大小（token数）
    // abort: Function - 调用 abort(stopOthers) 中止生成
    // type: String - 生成类型
};
```

### 9.3 生成类型 (type)

| 值 | 说明 |
|-----|------|
| `'normal'` | 正常生成 |
| `'quiet'` | 静默生成 |
| `'regenerate'` | 重新生成 |
| `'impersonate'` | 用户模拟 |
| `'swipe'` | 滑动生成 |
| `'continue'` | 继续生成 |

### 9.4 消息对象结构

```javascript
{
    is_user: Boolean,      // 是否为用户消息
    is_system: Boolean,    // 是否为系统消息
    name: String,          // 发送者名称
    mes: String,           // 消息内容
    send_date: Number,     // 发送时间戳
    extra: Object          // 额外数据
}
```

---

## 10. 工具调用 (Tool Calling)

```javascript
import { ToolManager } from '../../../tool-calling.js';
```

### 10.1 注册工具

```javascript
ToolManager.registerTool({
    name: 'tool_name',
    description: '工具描述',
    parameters: {
        type: 'object',
        properties: {
            param1: { type: 'string', description: '参数1' },
            param2: { type: 'number', description: '参数2' }
        },
        required: ['param1']
    },
    handler: async (parameters) => {
        return { result: '处理结果' };
    }
});
```

### 10.2 工具管理方法

| 方法 | 说明 |
|------|------|
| `ToolManager.registerTool(config)` | 注册工具 |
| `ToolManager.getAvailableTools()` | 获取可用工具列表 |
| `ToolManager.invokeTool(name, params)` | 调用指定工具 |
| `ToolManager.initToolSlashCommands()` | 初始化工具斜杠命令 |

---

# SillyTavern JavaScript API 参考（第三部分：枚举常量与数据结构）

---

## 11. 系统消息类型

```javascript
import { system_message_types } from "../../../../script.js";
```

| 常量 | 值 | 说明 |
|------|-----|------|
| `HELP` | `'help'` | 帮助消息 |
| `WELCOME` | `'welcome'` | 欢迎消息 |
| `GROUP` | `'group'` | 群组消息 |
| `EMPTY` | `'empty'` | 空消息 |
| `GENERIC` | `'generic'` | 通用消息 |
| `NARRATOR` | `'narrator'` | 旁白消息 |
| `COMMENT` | `'comment'` | 评论消息 |
| `SLASH_COMMANDS` | `'slash_commands'` | 斜杠命令消息 |
| `FORMATTING` | `'formatting'` | 格式化消息 |
| `HOTKEYS` | `'hotkeys'` | 热键消息 |
| `MACROS` | `'macros'` | 宏消息 |
| `WELCOME_PROMPT` | `'welcome_prompt'` | 欢迎提示 |
| `ASSISTANT_NOTE` | `'assistant_note'` | 助手注释 |

---

## 12. 扩展提示类型

```javascript
import { extension_prompt_types, extension_prompt_roles } from "../../../../script.js";
```

### 12.1 提示类型

| 常量 | 值 | 说明 |
|------|-----|------|
| `NONE` | `-1` | 无 |
| `IN_PROMPT` | `0` | 在提示中 |
| `IN_CHAT` | `1` | 在聊天中 |
| `BEFORE_PROMPT` | `2` | 在提示前 |

### 12.2 提示角色

| 常量 | 值 | 说明 |
|------|-----|------|
| `SYSTEM` | `0` | 系统角色 |
| `USER` | `1` | 用户角色 |
| `ASSISTANT` | `2` | 助手角色 |

---

## 13. 聊天完成源

```javascript
import { chat_completion_sources } from '../../../openai.js';
```

| 常量 | 说明 |
|------|------|
| `OPENAI` | OpenAI API |
| `WINDOWAI` | WindowAI |
| `CLAUDE` | Anthropic Claude |
| `SCALE` | Scale AI |
| `OPENROUTER` | OpenRouter |
| `AI21` | AI21 Labs |
| `MAKERSUITE` | Google MakerSuite |
| `MISTRALAI` | Mistral AI |
| `CUSTOM` | 自定义API |

---

## 14. 过滤器状态与类型

```javascript
import { FILTER_STATES, FILTER_TYPES } from '../../../filters.js';
```

### 14.1 过滤器状态

| 常量 | 说明 |
|------|------|
| `SELECTED` | 选中状态 |
| `EXCLUDED` | 排除状态 |
| `UNDEFINED` | 未定义状态 |

### 14.2 过滤器类型

| 常量 | 说明 |
|------|------|
| `CHARACTER` | 角色过滤器 |
| `GROUP` | 群组过滤器 |
| `TAG` | 标签过滤器 |
| `FOLDER` | 文件夹过滤器 |

---

## 15. 防抖超时预设

```javascript
import { debounce_timeout } from "../../../../script.js";
```

| 常量 | 值 | 说明 |
|------|-----|------|
| `quick` | `100` | 快速 100ms |
| `short` | `300` | 短 300ms |
| `relaxed` | `1000` | 放松 1000ms |
| `extended` | `3000` | 扩展 3000ms |

---

## 16. 数据结构

### 16.1 聊天消息对象

```javascript
{
    name: String,           // 发送者名称
    is_user: Boolean,       // 是否为用户
    is_system: Boolean,     // 是否为系统消息
    send_date: Number,      // 发送时间戳
    mes: String,            // 消息内容
    swipe_id: Number,       // 当前滑动索引
    swipes: Array,          // 滑动消息数组
    swipe_info: Array,      // 滑动信息数组
    extra: {
        api: String,        // 使用的API
        model: String,      // 使用的模型
        token_count: Number // token数量
    }
}
```

### 16.2 角色对象

```javascript
{
    name: String,              // 角色名称
    avatar: String,            // 头像文件名
    description: String,       // 角色描述
    personality: String,       // 性格特征
    first_mes: String,         // 首条消息
    mes_example: String,       // 消息示例
    scenario: String,          // 场景设定
    creator_notes: String,     // 创作者笔记
    system_prompt: String,     // 系统提示
    post_history_instructions: String,  // 历史后指令
    tags: Array,               // 标签
    creator: String,           // 创作者
    character_version: String, // 版本
    extensions: Object,        // 扩展数据
    data: {                    // V2卡片格式数据
        // 与上述字段对应的 spec v2 格式
    }
}
```

### 16.3 群组对象

```javascript
{
    id: String,                // 群组ID
    name: String,              // 群组名称
    members: Array,            // 成员角色名数组
    avatar_url: String,        // 头像URL
    allow_self_responses: Boolean,  // 允许自我回复
    activation_strategy: Number,    // 激活策略
    generation_mode: Number,        // 生成模式
    disabled_members: Array,        // 禁用成员
    chat_metadata: Object,          // 聊天元数据
    past_metadata: Object,          // 历史元数据
    fav: Boolean,                   // 是否收藏
    chat_id: String,                // 当前聊天ID
    chats: Array                    // 聊天列表
}
```

### 16.4 世界信息条目

```javascript
{
    uid: Number,               // 唯一ID
    key: Array,                // 主关键词数组
    keysecondary: Array,       // 次要关键词数组
    content: String,           // 内容
    comment: String,           // 备注/标题
    constant: Boolean,         // 是否常量
    disable: Boolean,          // 是否禁用
    order: Number,             // 顺序
    position: Number,          // 位置 (0-6)
    depth: Number,             // 深度
    selectiveLogic: Number,    // 选择逻辑 (0-3)
    excludeRecursion: Boolean, // 排除递归
    probability: Number,       // 触发概率 (0-100)
    scanDepth: Number,         // 扫描深度
    caseSensitive: Boolean,    // 区分大小写
    matchWholeWords: Boolean,  // 匹配整词
    role: Number               // 角色 (0-2，仅position=4时)
}
```

---

## 17. Toast 通知

```javascript
// 全局可用，无需导入
toastr.info('信息内容', '标题');
toastr.success('成功消息', '标题');
toastr.warning('警告消息', '标题');
toastr.error('错误消息', '标题');

// 配置选项
toastr.info('消息', '标题', {
    timeOut: 3000,           // 显示时间(ms)
    extendedTimeOut: 1000,   // 悬停延长时间
    closeButton: true,       // 显示关闭按钮
    progressBar: true        // 显示进度条
});
```

---

## 18. jQuery 扩展

SillyTavern 环境中 jQuery 全局可用：

```javascript
// 选择器
$('#element-id')
$('.class-name')

// 获取/设置值
$('#input').val()
$('#input').val('新值')

// 属性操作
$('#checkbox').prop('checked')
$('#checkbox').prop('checked', true)

// 事件绑定
$('#button').on('click', handler)
$('#input').on('input', handler)
$('#select').on('change', handler)

// DOM操作
$('#container').append(html)
$('#container').prepend(html)
$('#element').remove()
$('#element').empty()

// 显示/隐藏
$('#element').show()
$('#element').hide()
$('#element').toggle()

// AJAX
$.get(url).then(data => { ... })
$.post(url, data).then(response => { ... })
```

---

## 附录：模块路径速查

| 模块 | 相对路径（从扩展目录） |
|------|----------------------|
| script.js | `../../../../script.js` |
| extensions.js | `../../../extensions.js` |
| popup.js | `../../../popup.js` |
| utils.js | `./scripts/utils.js` 或绝对路径 |
| SlashCommandParser.js | `../../../slash-commands/SlashCommandParser.js` |
| SlashCommand.js | `../../../slash-commands/SlashCommand.js` |
| SlashCommandArgument.js | `../../../slash-commands/SlashCommandArgument.js` |
| world-info.js | `../../../world-info.js` |
| tags.js | `../../../tags.js` |
| openai.js | `../../../openai.js` |
| power-user.js | `../../../power-user.js` |
| i18n.js | `../../../i18n.js` |
| templates.js | `../../../templates.js` |
| tool-calling.js | `../../../tool-calling.js` |
| filters.js | `../../../filters.js` |
| personas.js | `../../../personas.js` |
| backgrounds.js | `../../../backgrounds.js` |
| tokenizers.js | `../../../tokenizers.js` |
| macros.js | `../../../macros.js` |
| chats.js | `../../../chats.js` |
| user.js | `../../../user.js` |
| secrets.js | `../../../secrets.js` |

---