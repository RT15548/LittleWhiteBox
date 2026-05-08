# SillyTavern JavaScript API Reference
> 1.18 基线整理 · 从源代码抽取与人工对照补完 · 共 168 个 API

本文档用于回答一个更实用的问题：SillyTavern 1.18 前端公开给扩展与插件侧使用的 JavaScript API 有哪些，它们大致是什么、能不能作为新代码入口。

当前覆盖范围：
- `ctx.*`：`st.extensions.getContext()` 返回的上下文对象。
- `st.script.*`：`script.js` 等前端主模块导出，适合读运行时状态或调用主前端方法。
- `st.extensions.*`：扩展系统相关导出，例如模板渲染、扩展字段写入、扩展菜单、API URL 等。
- `st.slash.*`：Slash 命令执行与帮助入口，以及命令注册相关导出。

命名空间关系：
- `ctx` 不是独立全局，而是 `st.extensions.getContext()` 的返回值。
- 很多 `ctx.*` 条目本质上是对 `st.script.*` 或 `st.extensions.*` 的再封装；新代码优先选语义更直接、废弃说明更少的入口。
- 如果一个能力只在 `st.extensions.*` 或 `st.slash.*` 里存在，不要假设它一定也会出现在 `ctx.*`。

使用建议：
- 优先看有明确函数签名的条目，再看变量/对象条目。
- 遇到 `已废弃`、`兼容`、`别名`、`占位符` 时，默认不要把它当成新代码入口。
- 遇到 `变量/对象` 条目时，先把它理解成运行时状态或命名空间，不要自动假设它是独立模块。
- 如果一个条目同时存在新旧两种名字，优先使用命名更清晰、说明更完整、未标废弃的那一个。

## APIs
### `accountStorage`
**源文件**: `scripts\util\AccountStorage.js:145`
**文档**:
```javascript
/**
 * Account storage instance.
 */
```
**签名**:
```javascript
export const accountStorage = new AccountStorage();
```
---
### `chat`
**源文件**: `script.js:410`
**文档**:
```javascript
/** @type {ChatMessage[]} */
```
**签名**:
```javascript
export let chat = [];
```
---
### `characters`
**源文件**: `script.js:426`
**文档**:
```javascript
/** @type {Character[]} */
```
**签名**:
```javascript
export let characters = [];
```
---
### `groups`
**源文件**: `scripts\group-chats.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 group-chats.js 导入
```
**状态判断**: 这是当前已加载群组列表的数据数组，不是群组管理器类。

**使用建议**: 需要枚举、查找、判断群组状态时读取它；需要真正切换群组会话时看 `openGroupChat()`。
---
### `name1`
**源文件**: `script.js:407`
**签名**:
```javascript
export let name1 = default_user_name;
```
---
### `name2`
**源文件**: `script.js:408`
**签名**:
```javascript
export let name2 = systemUserName;
```
---
### `characterId`
**源文件**: `script.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 script.js 导入
```
**状态判断**: 这是当前选中角色 ID 的运行时别名，用来读状态，不是独立角色模块。

**使用建议**: 需要“当前角色是谁”时读取它；需要切换角色时看 `selectCharacterById()`，不要把它当可调用 API。
---
### `groupId`
**源文件**: `scripts\group-chats.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 group-chats.js 导入
```
**状态判断**: 这是当前选中群组 ID 的运行时别名，用来读状态，不是独立群组模块。

**使用建议**: 需要“当前群组是谁”时读取它；需要切换群组时看 `openGroupChat()`，不要把它当可调用 API。
---
### `chatId`
**源文件**: `scripts\group-chats.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 group-chats.js 导入
```
**状态判断**: 这是当前聊天会话 ID 的运行时别名，来源可能是角色聊天，也可能是群组聊天。

**使用建议**: 需要当前会话标识时读取它；不要把它当成主动加载聊天的函数。
---
### `getCurrentChatId`
**源文件**: `script.js:540`
**签名**:
```javascript
export function getCurrentChatId()
```
---
### `getRequestHeaders`
**源文件**: `script.js:645`
**签名**:
```javascript
export function getRequestHeaders({ omitContentType = false } = {})
```
---
### `getContext`
**源文件**: `scripts\st-context.js:114`
**签名**:
```javascript
export function getContext()
```
**状态判断**: 这是扩展侧最核心的上下文入口，会返回当前聊天、角色、事件、变量、生成、世界书、工具调用等一整套前端能力集合。

**使用建议**: 需要 `ctx.xxx` 时先从这里理解来源；如果只是要少量能力，优先直接使用更窄的 `st.script.*`、`st.extensions.*` 或 `st.slash.*` 命名空间。
---
### `getApiUrl`
**源文件**: `scripts\extensions.js:48`
**签名**:
```javascript
const getApiUrl = () => extension_settings.apiUrl;
```
**状态判断**: 这是 Extras API / 扩展 API URL 的读取入口，不是聊天后端 URL，也不是任意模型 API 地址。

**使用建议**: 只有在确实要对接 SillyTavern Extras 扩展服务时再读它；普通聊天生成、Slash 调用、上下文读取都不需要碰它。
---
### `reloadCurrentChat`
**源文件**: `script.js:1674`
**签名**:
```javascript
export const reloadCurrentChat = reloadChatMutex.update.bind(reloadChatMutex);
```
---
### `renameChat`
**源文件**: `script.js:10628`
**文档**:
```javascript
/**
 * Renames the currently selected chat.
 * @param {string} oldFileName Old name of the chat (no JSONL extension)
 * @param {string} newName New name for the chat (no JSONL extension)
 */
```
**签名**:
```javascript
export async function renameChat(oldFileName, newName)
```
---
### `saveSettingsDebounced`
**源文件**: `script.js:469`
**签名**:
```javascript
export const saveSettingsDebounced = debounce((loopCounter = 0) => saveSettings(loopCounter), DEFAULT_SAVE_EDIT_TIMEOUT);
```
---
### `onlineStatus`
**源文件**: `script.js:600`
**签名**:
```javascript
export let online_status = 'no_connection';
```
**状态判断**: 这是当前连接状态的运行时值，不是网络请求函数。

**使用建议**: 只在需要判断“当前是否连通某后端”时读取它。
---
### `chatMetadata`
**源文件**: `script.js:453`
**文档**:
```javascript
/** @type {ChatMetadata} */
```
**签名**:
```javascript
export let chat_metadata = {};
```
---
### `saveMetadataDebounced`
**源文件**: `scripts\extensions.js:76`
**签名**:
```javascript
export function saveMetadataDebounced()
```
---
### `cancelDebouncedMetadataSave`
**源文件**: `scripts\extensions.js:81`
**签名**:
```javascript
export function cancelDebouncedMetadataSave()
```
**状态判断**: 这是 `saveMetadataDebounced()` 的配套取消入口，用来撤销还没真正落盘的延迟保存计时器。

**使用建议**: 只有在你明确要中止一次尚未执行的 metadata 自动保存时才调用；普通保存流程不要先取消再手动补一套。
---
### `streamingProcessor`
**源文件**: `script.js:455`
**文档**:
```javascript
/** @type {StreamingProcessor} */
```
**签名**:
```javascript
export let streamingProcessor = null;
```
---
### `eventSource`
**源文件**: `script.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 script.js 导入
```
**状态判断**: 这是全局事件发射器实例，是很多前端状态变化的统一监听入口。

**使用建议**: 监听事件时配合 `eventTypes` 使用；不要把它当普通配置对象。
---
### `eventTypes`
**源文件**: `script.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 script.js 导入
```
**状态判断**: 这是推荐使用的事件常量集合，对应 `eventSource` 的事件名。

**使用建议**: 新代码监听事件时优先使用 `eventTypes`；`event_types` 只在兼容旧代码时识别。
---
### `addOneMessage`
**源文件**: `script.js:2477`
**文档**:
```javascript
/**
 * Adds a single message to the chat.
 * @param {ChatMessage} mes Message object
 * @param {object} [options] Options
 * @param {string} [options.type=undefined|'swipe'] Deprecated. Use updateMessageElement instead.
 * @param {number} [options.insertAfter=null] Message ID to insert the new message after
 * @param {boolean} [options.scroll=true] Whether to scroll to the new message
 * @param {number} [options.insertBefore=null] Message ID to insert the new message before
 * @param {number} [options.forceId=null] Force the message ID
 * @param {boolean} [options.showSwipes=true] Whether to refresh the swipe buttons.
 * @returns {JQuery<HTMLElement>} The newly added message element
 */
```
**签名**:
```javascript
export function addOneMessage(mes, { type = undefined, insertAfter = null, scroll = true, insertBefore = null, forceId = null, showSwipes = true } = {})
```
---
### `deleteLastMessage`
**源文件**: `script.js:1603`
**签名**:
```javascript
export async function deleteLastMessage()
```
---
### `deleteMessage`
**源文件**: `script.js:1616`
**文档**:
```javascript
/**
 * Deletes a message from the chat by its ID, optionally asking for confirmation.
 * @param {number} id The ID of the message to delete.
 * @param {number} [swipeDeletionIndex] Deletes the swipe with that index.
 * @param {boolean} [askConfirmation=false] Whether to ask for confirmation before deleting.
 */
```
**签名**:
```javascript
export async function deleteMessage(id, swipeDeletionIndex = undefined, askConfirmation = false)
```
---
### `generate`
**源文件**: `script.js:4207`
**文档**:
```javascript
/**
 * MARK:Generate()
 * Runs a generation using the current chat context.
 * @param {string} type Generation type
 * @param {GenerateOptions} options Generation options
 * @param {boolean} dryRun Whether to actually generate a message or just assemble the prompt
 * @returns {Promise<any>} Returns a promise that resolves when the text is done generating.
 */
```
**签名**:
```javascript
export async function Generate(type, { automatic_trigger, force_name2, quiet_prompt, quietToLoud, skipWIAN, force_chid, signal, quietImage, quietName, jsonSchema = null, depth = 0 } = {}, dryRun = false)
```
**状态判断**: 这里的上下文名是 `generate`，源码实际导出名是 `Generate`。这说明它是 `getContext()` 包装后的主生成入口，而不是文档损坏。

**使用建议**: 需要走酒馆标准生成流程时用它；如果只是静默生成、原始生成或更底层请求，优先看 `generateQuietPrompt`、`generateRaw`、`sendGenerationRequest`。
---
### `sendStreamingRequest`
**源文件**: `script.js:6058`
**文档**:
```javascript
/**
 * Sends a streaming request to the API.
 * @param {string} type Generation type
 * @param {object} data Generation data
 * @param {AdditionalRequestOptions} [options] Additional options for the generation request
 * @returns {Promise<any>} Streaming generator
 */
```
**签名**:
```javascript
export async function sendStreamingRequest(type, data, options = {})
```
---
### `sendGenerationRequest`
**源文件**: `script.js:6027`
**文档**:
```javascript
/**
 * Sends a non-streaming request to the API.
 * @param {string} type Generation type
 * @param {object} data Generation data
 * @param {AdditionalRequestOptions} [options] Additional options for the generation request
 * @returns {Promise<object>} Response data from the API
 * @throws {Error|object}
 */
```
**签名**:
```javascript
export async function sendGenerationRequest(type, data, options = {})
```
---
### `stopGeneration`
**源文件**: `script.js:5518`
**文档**:
```javascript
/**
 * Stops the generation and any streaming if it is currently running.
 */
```
**签名**:
```javascript
export function stopGeneration()
```
---
### `tokenizers`
**源文件**: `scripts\tokenizers.js:16`
**签名**:
```javascript
export const tokenizers = {
```
---
### `getTextTokens`
**源文件**: `scripts\tokenizers.js:1130`
**文档**:
```javascript
/**
 * Encodes a string to tokens using the server API.
 * @param {number} tokenizerType Tokenizer type.
 * @param {string} str String to tokenize.
 * @returns {number[]} Array of token ids.
 */
```
**签名**:
```javascript
export function getTextTokens(tokenizerType, str)
```
---
### `getTokenCount`
**源文件**: `scripts\tokenizers.js:499`
**文档**:
```javascript
/**
 * Gets the token count for a string using the current model tokenizer.
 * @param {string} str String to tokenize
 * @param {number | undefined} padding Optional padding tokens. Defaults to 0.
 * @returns {number} Token count.
 * @deprecated Use getTokenCountAsync instead.
 */
```
**签名**:
```javascript
export function getTokenCount(str, padding = undefined)
```
---
### `getTokenCountAsync`
**源文件**: `scripts\tokenizers.js:443`
**文档**:
```javascript
/**
 * Gets the token count for a string using the current model tokenizer.
 * @param {string} str String to tokenize
 * @param {number | undefined} padding Optional padding tokens. Defaults to 0.
 * @returns {Promise<number>} Token count.
 */
```
**签名**:
```javascript
export async function getTokenCountAsync(str, padding = undefined)
```
---
### `extensionPrompts`
**源文件**: `script.js:625`
**签名**:
```javascript
export let extension_prompts = {};
```
**状态判断**: 这是当前所有扩展 prompt 注入内容的聚合对象。

**使用建议**: 需要查看当前有哪些扩展提示被挂进上下文时读取它；需要写入时看 `setExtensionPrompt()`。
---
### `setExtensionPrompt`
**源文件**: `script.js:8821`
**文档**:
```javascript
/**
 * Sets a prompt injection to insert custom text into any outgoing prompt. For use in UI extensions.
 * @param {string} key Prompt injection id.
 * @param {string} value Prompt injection value.
 * @param {number} position Insertion position. 0 is after story string, 1 is in-chat with custom depth.
 * @param {number} depth Insertion depth. 0 represets the last message in context. Expected values up to MAX_INJECTION_DEPTH.
 * @param {number} role Extension prompt role. Defaults to SYSTEM.
 * @param {boolean} scan Should the prompt be included in the world info scan.
 * @param {(function(): Promise<boolean>|boolean)} filter Filter function to determine if the prompt should be injected.
 */
```
**签名**:
```javascript
export function setExtensionPrompt(key, value, position, depth, scan = false, role = extension_prompt_roles.SYSTEM, filter = null)
```
---
### `updateChatMetadata`
**源文件**: `script.js:8873`
**文档**:
```javascript
/**
 * Adds or updates the metadata for the currently active chat.
 * @param {Object} newValues An object with collection of new values to be added into the metadata.
 * @param {boolean} reset Should a metadata be reset by this call.
 */
```
**签名**:
```javascript
export function updateChatMetadata(newValues, reset)
```
---
### `saveChat`
**源文件**: `script.js:9307`
**签名**:
```javascript
export async function saveChatConditional()
```
**状态判断**: 这里的上下文名是 `saveChat`，自动提取到的源码签名是 `saveChatConditional()`，属于上下文包装名和源码名不一致。

**使用建议**: 把它理解成“保存当前聊天”的上下文 API；看到签名名不一致时，不要误判为条目失效。
---
### `openCharacterChat`
**源文件**: `script.js:7649`
**签名**:
```javascript
export async function openCharacterChat(file_name)
```
---
### `openGroupChat`
**源文件**: `scripts\group-chats.js:2194`
**文档**:
```javascript
/**
 * Opens a specific group chat for the specified group by its ID.
 * @param {string} groupId Group ID
 * @param {string} chatId Chat ID
 * @returns {Promise<void>}
 */
```
**签名**:
```javascript
export async function openGroupChat(groupId, chatId)
```
---
### `saveMetadata`
**源文件**: `script.js:9303`
**签名**:
```javascript
export async function saveMetadata()
```
---
### `sendSystemMessage`
**源文件**: `script.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 script.js 导入
```
**状态判断**: 这是系统消息辅助入口，用于往聊天里写入酒馆系统消息，而不是普通用户/角色消息。

**使用建议**: 只有在确实要生成系统提示、帮助、通知类消息时再考虑它；常规聊天消息不要走这里。
---
### `activateSendButtons`
**源文件**: `script.js:6976`
**文档**:
```javascript
/**
 * A function mainly used to switch 'generating' state - setting it to false and activating the buttons again
 */
```
**签名**:
```javascript
export function activateSendButtons()
```
---
### `deactivateSendButtons`
**源文件**: `script.js:6990`
**文档**:
```javascript
/**
 * A function mainly used to switch 'generating' state - setting it to true and deactivating the buttons
 */
```
**签名**:
```javascript
export function deactivateSendButtons()
```
---
### `saveReply`
**源文件**: `script.js:6543`
**文档**:
```javascript
/**
 * Saves a resulting message to the chat.
 * @param {SaveReplyParams} params
 * @returns {Promise<SaveReplyResult>} Promise when the message is saved
 *
 * @typedef {object} SaveReplyParams
 * @property {string} type Type of generation
 * @property {string} getMessage Generated message
 * @property {boolean} [fromStreaming] If the message is from streaming
 * @property {string} [title] Message tooltip
 * @property {string[]} [swipes] Extra swipes
 * @property {string} [reasoning] Message reasoning
 * @property {string[]} [imageUrls] Links to images
 * @property {string?} [reasoningSignature] Encrypted signature of the reasoning text
 *
 * @typedef {object} SaveReplyResult
 * @property {string} type Type of generation
 * @property {string} getMessage Generated message
 */
```
**签名**:
```javascript
export async function saveReply({ type, getMessage, fromStreaming = false, title = '', swipes = [], reasoning = '', imageUrls = [], reasoningSignature = null })
```
---
### `substituteParams`
**源文件**: `script.js:2907`
**文档**:
```javascript
/**
 * Substitutes {{macros}} in a string using the new macro engine.
 *
 * This will replace all registered macros and dynamic additional macros as environment context.
 *
 * @param {string} content - The string to substitute parameters in.
 * @param {Object} [options={}] - Options for the substitution.
 * @param {string} [options.name1Override] - The name of the user. Uses global name1 if not provided.
 * @param {string} [options.name2Override] - The name of the character. Uses global name2 if not provided.
 * @param {string} [options.original] - The original message for {{original}} substitution.
 * @param {string} [options.groupOverride] - The group members list for {{group}} substitution.
 * @param {boolean} [options.replaceCharacterCard=true] - Whether to replace character card macros.
 * @param {Record<string, import('./scripts/macros/engine/MacroEnv.types.js').DynamicMacroValue>} [options.dynamicMacros={}] - Additional environment variables as dynamic macros for substitution. Registered as macro functions.
 * @param {(x: string) => string} [options.postProcessFn=(x) => x] - Post-processing function for each substituted macro.
 * @returns {string} The string with substituted parameters.
 */
```
**签名**:
```javascript
export function substituteParams(content, options = {})
```
---
### `substituteParamsExtended`
**源文件**: `script.js:2741`
**文档**:
```javascript
/**
 * @deprecated Function is not needed anymore, as the new signature of substituteParams is more flexible.
 *
 * Substitutes {{macro}} parameters in a string.
 * @returns {string} The string with substituted parameters.
 */
```
**签名**:
```javascript
export function substituteParamsExtended(content, additionalMacro = {}, postProcessFn = (x) => x)
```
**状态判断**: 这是旧签名兼容入口。看到旧扩展代码时要能认出来，但新代码不应继续从这里开始。

**替代方案**: 直接使用 `substituteParams(content, options)`，把附加宏和后处理函数放进新参数对象里。
---
### `SlashCommandParser`
**源文件**: `scripts\slash-commands\SlashCommandParser.js:43`
**签名**:
```javascript
export class SlashCommandParser {
```
---
### `SlashCommand`
**源文件**: `scripts\slash-commands\SlashCommand.js:29`
**签名**:
```javascript
export class SlashCommand {
```
---
### `SlashCommandArgument`
**源文件**: `scripts\slash-commands\SlashCommandArgument.js:22`
**签名**:
```javascript
export class SlashCommandArgument {
```
---
### `SlashCommandNamedArgument`
**源文件**: `scripts\slash-commands\SlashCommandArgument.js:82`
**签名**:
```javascript
export class SlashCommandNamedArgument extends SlashCommandArgument {
```
---
### `SlashCommandEnumValue`
**源文件**: `scripts\slash-commands\SlashCommandEnumValue.js:42`
**签名**:
```javascript
export class SlashCommandEnumValue {
```
---
### `ARGUMENT_TYPE`
**源文件**: `scripts\slash-commands\SlashCommandArgument.js:10`
**文档**:
```javascript
/**@enum {string}*/
```
**签名**:
```javascript
export const ARGUMENT_TYPE = {
```
---
### `executeSlashCommandsWithOptions`
**源文件**: `scripts\slash-commands.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 slash-commands.js 导入
```
**状态判断**: 这是当前推荐的 STscript / slash 命令执行入口，只是自动提取没有抓到它的具体函数签名。

**使用建议**: 需要执行 STscript 或 slash 文本时优先使用它；它比 `executeSlashCommands` 更适合新代码。
---
### `registerSlashCommand`
**源文件**: `scripts\slash-commands.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 slash-commands.js 导入
```
**状态判断**: 这是旧式斜杠命令注册入口，保留主要是为了兼容旧代码，不适合作为新命令系统的主入口。

**使用建议**: 新扩展优先使用 `SlashCommandParser`、`SlashCommand`、`SlashCommandArgument`、`SlashCommandNamedArgument` 这一整套对象式注册方式。
---
### `executeSlashCommands`
**源文件**: `scripts\slash-commands.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 slash-commands.js 导入
```
**状态判断**: 这是旧式执行入口。它还能帮助理解历史代码，但新代码应优先看带选项的版本。

**替代方案**: 优先使用 `executeSlashCommandsWithOptions()`，这样更容易控制执行来源和行为。
---
### `getSlashCommandsHelp`
**源文件**: `scripts\slash-commands.js:111`
**签名**:
```javascript
const getSlashCommandsHelp = parser.getHelpString.bind(parser);
```
**状态判断**: 这是 Slash 命令帮助文本入口，返回当前已注册命令的帮助字符串，适合做能力探查，不适合直接拿来推断参数对象细节。

**使用建议**: 需要先确认命令是否存在、名称怎么写、帮助文案怎么显示时用它；需要精准参数语义时还是回到专门参考文档或对应源码。
---
### `timestampToMoment`
**源文件**: `scripts\utils.js:1079`
**文档**:
```javascript
/**
 * Cached version of moment() to avoid re-parsing the same date strings.
 * Important: Moment objects are mutable, so use clone() before modifying them!
 * @param {MessageTimestamp} timestamp String or number representing a date.
 * @returns {import('moment').Moment} Moment object
 */
```
**签名**:
```javascript
export function timestampToMoment(timestamp)
```
---
### `registerMacro`
**源文件**: `scripts\macros.js:42`
**文档**:
```javascript
/**
 * @deprecated Use macros.registry.registerMacro (from scripts/macros/macro-system.js)
 * or substituteParams({ dynamicMacros }) with the new macro engine.
 */
```
**签名**:
```javascript
export class MacrosParser {
```
**状态判断**: 这是旧宏系统痕迹，不是推荐的新入口。这里之所以出现类签名，是因为自动提取命中了旧宏解析器定义。

**使用建议**: 把它理解成“历史兼容区域”；新代码优先看 `macros` 命名空间，而不是继续围绕 `registerMacro` 设计。
---
### `unregisterMacro`
**源文件**: `scripts\macros.js:42`
**文档**:
```javascript
/**
 * @deprecated Use macros.registry.registerMacro (from scripts/macros/macro-system.js)
 * or substituteParams({ dynamicMacros }) with the new macro engine.
 */
```
**签名**:
```javascript
export class MacrosParser {
```
**状态判断**: 和 `registerMacro` 一样，这是旧宏系统痕迹，不应作为新代码主入口。

**使用建议**: 新代码优先沿 `macros` 命名空间查找注销能力，不要把这个类签名误判成真正的推荐调用方式。
---
### `registerFunctionTool`
**源文件**: `scripts\tool-calling.js:241`
**文档**:
```javascript
/**
 * A class that manages the registration and invocation of tools.
 */
```
**签名**:
```javascript
export class ToolManager {
```
---
### `unregisterFunctionTool`
**源文件**: `scripts\tool-calling.js:241`
**文档**:
```javascript
/**
 * A class that manages the registration and invocation of tools.
 */
```
**签名**:
```javascript
export class ToolManager {
```
---
### `isToolCallingSupported`
**源文件**: `scripts\tool-calling.js:241`
**文档**:
```javascript
/**
 * A class that manages the registration and invocation of tools.
 */
```
**签名**:
```javascript
export class ToolManager {
```
---
### `canPerformToolCalls`
**源文件**: `scripts\tool-calling.js:241`
**文档**:
```javascript
/**
 * A class that manages the registration and invocation of tools.
 */
```
**签名**:
```javascript
export class ToolManager {
```
---
### `ToolManager`
**源文件**: `scripts\tool-calling.js:241`
**文档**:
```javascript
/**
 * A class that manages the registration and invocation of tools.
 */
```
**签名**:
```javascript
export class ToolManager {
```
---
### `registerDebugFunction`
**源文件**: `scripts\power-user.js:1475`
**文档**:
```javascript
/**
 * Register a function to be executed when the debug menu is opened.
 * @param {string} functionId Unique ID for the function.
 * @param {string} name Name of the function.
 * @param {string} description Description of the function.
 * @param {function} func Function to be executed.
 */
```
**签名**:
```javascript
export function registerDebugFunction(functionId, name, description, func)
```
---
### `renderExtensionTemplate`
**源文件**: `scripts\extensions.js:112`
**文档**:
```javascript
/**
 * Provides an ability for extensions to render HTML templates synchronously.
 * Templates sanitation and localization is forced.
 * @param {string} extensionName Extension name
 * @param {string} templateId Template ID
 * @param {object} templateData Additional data to pass to the template
 * @returns {string} Rendered HTML
 *
 * @deprecated Use renderExtensionTemplateAsync instead.
 */
```
**签名**:
```javascript
export function renderExtensionTemplate(extensionName, templateId, templateData = {}, sanitize = true, localize = true)
```
**状态判断**: 这是同步模板渲染入口，主要用于兼容旧扩展；新代码默认应优先看异步版。

**替代方案**: 优先使用 `renderExtensionTemplateAsync()`，避免把同步渲染当默认路径。
---
### `renderExtensionTemplateAsync`
**源文件**: `scripts\extensions.js:124`
**文档**:
```javascript
/**
 * Provides an ability for extensions to render HTML templates asynchronously.
 * Templates sanitation and localization is forced.
 * @param {string} extensionName Extension name
 * @param {string} templateId Template ID
 * @param {object} templateData Additional data to pass to the template
 * @returns {Promise<string>} Rendered HTML
 */
```
**签名**:
```javascript
export function renderExtensionTemplateAsync(extensionName, templateId, templateData = {}, sanitize = true, localize = true)
```
---
### `registerDataBankScraper`
**源文件**: `scripts\scrapers.js:30`
**签名**:
```javascript
export class ScraperManager {
```
---
### `callPopup`
**源文件**: `script.js:8962`
**文档**:
```javascript
/**
 * Displays a blocking popup with a given text and type.
 * @param {JQuery<HTMLElement>|string|Element} text - Text to display in the popup.
 * @param {string} type
 * @param {string} inputValue - Value to set the input to.
 * @param {PopupOptions} options - Options for the popup.
 * @typedef {{okButton?: string, rows?: number, wide?: boolean, wider?: boolean, large?: boolean, allowHorizontalScrolling?: boolean, allowVerticalScrolling?: boolean, cropAspect?: number }} PopupOptions - Options for the popup.
 * @returns {Promise<any>} A promise that resolves when the popup is closed.
 * @deprecated Use `callGenericPopup` instead.
 */
```
**签名**:
```javascript
export function callPopup(text, type, inputValue = '', { okButton, rows, wide, wider, large, allowHorizontalScrolling, allowVerticalScrolling, cropAspect } = {})
```
**状态判断**: 这是旧弹窗入口。还能识别旧代码，但新代码不该再把字符串类型参数当默认方案。

**替代方案**: 优先使用 `callGenericPopup()` 配合 `POPUP_TYPE`。
---
### `callGenericPopup`
**源文件**: `scripts\popup.js:859`
**文档**:
```javascript
/**
 * Displays a blocking popup with a given content and type
 *
 * @param {JQuery<HTMLElement>|string|Element} content - Content or text to display in the popup
 * @param {POPUP_TYPE} type
 * @param {string} inputValue - Value to set the input to
 * @param {PopupOptions} [popupOptions={}] - Options for the popup
 * @returns {Promise<POPUP_RESULT|string|boolean?>} The value for this popup, which can either be the popup retult or the input value if chosen
 */
```
**签名**:
```javascript
export function callGenericPopup(content, type, inputValue = '', popupOptions = {})
```
---
### `showLoader`
**源文件**: `scripts\loader.js:23`
**文档**:
```javascript
/**
 * Shows the loader overlay.
 *
 * @deprecated Use `showActionLoader()` from action-loader.js instead.
 * This function now creates a blocking action loader with no toast.
 * The new system supports stacking multiple loaders and provides better control.
 *
 * @example
 * // New recommended approach:
 * import { showActionLoader } from './action-loader.js';
 * const handle = showActionLoader({ message: 'Loading...' });
 * // ... do work ...
 * handle.hide();
 */
```
**签名**:
```javascript
export function showLoader()
```
**状态判断**: 这是旧加载器入口，保留主要用于兼容旧代码。它不能表达现代加载器那种 handle 语义。

**替代方案**: 优先使用 `loader` 或 `showActionLoader()` 这一类新加载器接口。
---
### `hideLoader`
**源文件**: `scripts\loader.js:51`
**文档**:
```javascript
/**
 * Hides the loader overlay.
 *
 * @deprecated Use `hideActionLoader()` or `handle.hide()` from action-loader.js instead.
 * This function now hides the legacy loader created by showLoader().
 *
 * @example
 * // New recommended approach:
 * import { showActionLoader } from './action-loader.js';
 * const handle = showActionLoader({ message: 'Loading...' });
 * // ... do work ...
 * await handle.hide();
 *
 * @returns {Promise<void>}
 */
```
**签名**:
```javascript
export async function hideLoader()
```
**状态判断**: 这是旧加载器关闭入口，通常只在历史代码里和 `showLoader()` 成对出现。

**替代方案**: 优先保存新加载器返回的 handle，并调用它自己的隐藏方法。
---
### `mainApi`
**源文件**: `script.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 script.js 导入
```
**状态判断**: 这是当前主模型后端类型的运行时别名，用来读状态，不是“后端控制器”。

**使用建议**: 只在需要根据当前后端分支处理逻辑时读取它；不要把它误认为一个可调用 API 模块。
---
### `extensionSettings`
**源文件**: `scripts\extensions.js:128`
**签名**:
```javascript
export const extension_settings = {
```
---
### `ModuleWorkerWrapper`
**源文件**: `scripts\extensions.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 extensions.js 导入
```
**状态判断**: 这是扩展侧 Worker 包装相关入口，偏底层执行环境，不是助手日常排查的高频入口。

**使用建议**: 只有在扩展需要放进 Worker 隔离运行时才继续沿它查；普通扩展逻辑可先忽略。
---
### `getTokenizerModel`
**源文件**: `scripts\tokenizers.js:569`
**签名**:
```javascript
export function getTokenizerModel()
```
---
### `generateQuietPrompt`
**源文件**: `script.js:3005`
**文档**:
```javascript
/**
 * Background generation based on the provided prompt.
 * @typedef {object} GenerateQuietPromptParams
 * @prop {string} [quietPrompt] Instruction prompt for the AI
 * @prop {boolean} [quietToLoud] Whether the message should be sent in a foreground (loud) or background (quiet) mode
 * @prop {boolean} [skipWIAN] Whether to skip addition of World Info and Author's Note into the prompt
 * @prop {string} [quietImage] Image to use for the quiet prompt
 * @prop {string} [quietName] Name to use for the quiet prompt (defaults to "System:")
 * @prop {number} [responseLength] Maximum response length. If unset, the global default value is used.
 * @prop {number} [forceChId] Character ID to use for this generation run. Works in groups only.
 * @prop {object} [jsonSchema] JSON schema to use for the structured generation. Usually requires a special instruction.
 * @prop {boolean} [removeReasoning] Parses and removes the reasoning block according to reasoning format preferences
 * @prop {boolean} [trimToSentence] Whether to trim the response to the last complete sentence
 * @param {GenerateQuietPromptParams} params Parameters for the quiet prompt generation
 * @returns {Promise<string>} Generated text. If using structured output, will contain a serialized JSON object.
 */
```
**签名**:
```javascript
export async function generateQuietPrompt({ quietPrompt = '', quietToLoud = false, skipWIAN = false, quietImage = null, quietName = null, responseLength = null, forceChId = null, jsonSchema = null, removeReasoning = true, trimToSentence = false } = {})
```
---
### `generateRaw`
**源文件**: `script.js:4040`
**文档**:
```javascript
/**
 * Generates a message using the provided prompt.
 * If the prompt is an array of chat-style messages and not using chat completion, it will be converted to a text prompt.
 * @param {GenerateRawParams} params Parameters for generating a message
 * @returns {Promise<string>} Generated output: a cleaned-up message string when `jsonSchema` is not provided, or an extracted JSON string conforming to `jsonSchema` when it is.
 */
```
**签名**:
```javascript
export async function generateRaw({ prompt = '', api = null, instructOverride = false, quietToLoud = false, systemPrompt = '', responseLength = null, trimNames = true, prefill = '', jsonSchema = null } = {})
```
---
### `generateRawData`
**源文件**: `script.js:3918`
**文档**:
```javascript
/**
 * Generates a raw data object using the provided prompt.
 * This used to be part of `generateRaw`, but separating it out allows extensions to access other data such as reasoning message.
 * @param {GenerateRawParams} params Parameters for generating a message
 * @returns {Promise<object | string>} Raw API response data, or a JSON string extracted from the response when `jsonSchema` is provided.
 */
```
**签名**:
```javascript
export async function generateRawData({ prompt = '', api = null, instructOverride = false, quietToLoud = false, systemPrompt = '', responseLength = null, prefill = '', jsonSchema = null } = {})
```
---
### `writeExtensionField`
**源文件**: `scripts\extensions.js:1768`
**文档**:
```javascript
/**
 * Writes a field to the character's data extensions object.
 * @param {number|string} characterId Index in the character array
 * @param {string} key Field name
 * @param {any} value Field value
 * @returns {Promise<void>} When the field is written
 */
```
**签名**:
```javascript
export async function writeExtensionField(characterId, key, value)
```
---
### `writeExtensionFieldBulk`
**源文件**: `scripts\extensions.js:2143`
**文档**:
```javascript
/**
 * Writes (or deletes) an extension field for multiple characters in a single
 * bulk request.
 */
```
**签名**:
```javascript
export async function writeExtensionFieldBulk(avatars, key, value, { filterPath } = {})
```
**状态判断**: 这是面向多角色卡批量写扩展字段的入口，支持用 `UNSET_VALUE` 触发字段删除，不只是“批量 set”。

**使用建议**: 只有在确实要对一批角色卡统一写扩展字段时再用它；单角色更新优先 `writeExtensionField()`，这样影响范围更可控。
---
### `getThumbnailUrl`
**源文件**: `script.js:7453`
**文档**:
```javascript
/**
 * Gets the URL for a thumbnail of a specific type and file.
 * @param {import('../src/endpoints/thumbnails.js').ThumbnailType} type The type of the thumbnail to get
 * @param {string} file The file name or path for which to get the thumbnail URL
 * @param {boolean} [t=false] Whether to add a cache-busting timestamp to the URL
 * @returns {string} The URL for the thumbnail
 */
```
**签名**:
```javascript
export function getThumbnailUrl(type, file, t = false)
```
---
### `selectCharacterById`
**源文件**: `script.js:871`
**文档**:
```javascript
/**
 * Switches the currently selected character to the one with the given ID. (character index, not the character key!)
 *
 * If the character ID doesn't exist, if the chat is being saved, or if a group is being generated, this function does nothing.
 * If the character is different from the currently selected one, it will clear the chat and reset any selected character or group.
 * @param {number} id The ID of the character to switch to.
 * @param {object} [options] Options for the switch.
 * @param {boolean} [options.switchMenu=true] Whether to switch the right menu to the character edit menu if the character is already selected.
 * @returns {Promise<void>} A promise that resolves when the character is switched.
 */
```
**签名**:
```javascript
export async function selectCharacterById(id, { switchMenu = true } = {})
```
---
### `messageFormatting`
**源文件**: `script.js:1751`
**文档**:
```javascript
/**
 * Formats the message text into an HTML string using Markdown and other formatting.
 * @param {string} mes Message text
 * @param {string} ch_name Character name
 * @param {boolean} isSystem If the message was sent by the system
 * @param {boolean} isUser If the message was sent by the user
 * @param {number} messageId Message index in chat array
 * @param {Partial<DOMPurify.Config>} [sanitizerOverrides] DOMPurify sanitizer option overrides
 * @param {boolean} [isReasoning] If the message is reasoning output
 * @returns {string} HTML string
 */
```
**签名**:
```javascript
export function messageFormatting(mes, ch_name, isSystem, isUser, messageId, sanitizerOverrides = {}, isReasoning = false)
```
---
### `shouldSendOnEnter`
**源文件**: `scripts\RossAscends-mods.js:149`
**签名**:
```javascript
export function shouldSendOnEnter()
```
---
### `isMobile`
**源文件**: `scripts\RossAscends-mods.js:143`
**文档**:
```javascript
/**
 * Checks if the device is a mobile device.
 * @returns {boolean} - True if the device is a mobile device, false otherwise.
 */
```
**签名**:
```javascript
export function isMobile()
```
---
### `t`
**源文件**: `scripts\i18n.js:81`
**文档**:
```javascript
/**
 * Translates a template string with named arguments
 *
 * Uses the template literal with all values replaced by index placeholder for translation key.
 *
 * @example
 * ```js
 * toastr.warning(t`Tag ${tagName} not found.`);
 * ```
 * Should be translated in the translation files as:
 * ```
 * Tag ${0} not found. -> Tag ${0} nicht gefunden.
 * ```
 *
 * @param {TemplateStringsArray} strings - Template strings array
 * @param  {...any} values - Values for placeholders in the template string
 * @returns {string} Translated and formatted string
 */
```
**签名**:
```javascript
export function t(strings, ...values)
```
---
### `translate`
**源文件**: `scripts\i18n.js:101`
**文档**:
```javascript
/**
 * Translates a given key or text
 *
 * If the translation is based on a key, that one is used to find a possible translation in the translation file.
 * The original text still has to be provided, as that is the default value being returned if no translation is found.
 *
 * For in-code text translation on a format string, using the template literal `t` is preferred.
 *
 * @param {string} text - The text to translate
 * @param {string?} key - The key to use for translation. If not provided, text is used as the key.
 * @returns {string} - The translated text
 */
```
**签名**:
```javascript
export function translate(text, key = null)
```
---
### `getCurrentLocale`
**源文件**: `scripts\i18n.js:15`
**签名**:
```javascript
export const getCurrentLocale = () => localeFile;
```
---
### `addLocaleData`
**源文件**: `scripts\i18n.js:22`
**文档**:
```javascript
/**
 * Adds additional localization data to the current locale file.
 * @param {string} localeId Locale ID (e.g. 'fr-fr' or 'zh-cn')
 * @param {Record<string, string>} data Localization data to add
 */
```
**签名**:
```javascript
export function addLocaleData(localeId, data)
```
---
### `tags`
**源文件**: `scripts\tags.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 tags.js 导入
```
**状态判断**: 这是当前标签列表数据，不是标签服务类。

**使用建议**: 需要读取已有标签时看它；需要通过标签定位关系时结合 `tagMap`。
---
### `tagMap`
**源文件**: `scripts\tags.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 tags.js 导入
```
**状态判断**: 这是标签映射结构，用于描述标签和对象之间的关联关系。

**使用建议**: 需要查“某个对象挂了哪些标签”或“某个标签关联了哪些对象”时优先看它。
---
### `menuType`
**源文件**: `script.js:564`
**文档**:
```javascript
/**
 * The type of the right menu that is currently open
 * @type {MenuType}
 */
```
**签名**:
```javascript
export let menu_type = '';
```
**状态判断**: 这是当前右侧菜单/面板类型的运行时状态值。

**使用建议**: 需要判断当前 UI 处于哪个菜单上下文时读取它；不要把它当切换菜单的方法。
---
### `createCharacterData`
**源文件**: `script.js:569`
**签名**:
```javascript
export let create_save = {
```
**状态判断**: 这里的上下文名是 `createCharacterData`，但自动提取命中的是 `create_save` 数据结构，属于上下文包装名和源码名错位。

**使用建议**: 把它理解成“角色创建相关数据结构/入口”，不要把当前签名字面量当成最终调用方式。
---
### `event_types`
**源文件**: `script.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 script.js 导入
```
**状态判断**: 这是旧命名风格的事件常量入口，语义上对应 `eventTypes`。

**使用建议**: 新代码优先使用 `eventTypes`；阅读旧扩展时再识别 `event_types`。
---
### `Popup`
**源文件**: `scripts\popup.js:144`
**签名**:
```javascript
export class Popup {
```
---
### `POPUP_TYPE`
**源文件**: `scripts\popup.js:9`
**文档**:
```javascript
/** @enum {Number} */
```
**签名**:
```javascript
export const POPUP_TYPE = {
```
---
### `POPUP_RESULT`
**源文件**: `scripts\popup.js:24`
**文档**:
```javascript
/** @enum {number?} */
```
**签名**:
```javascript
export const POPUP_RESULT = {
```
---
### `chatCompletionSettings`
**源文件**: `scripts\openai.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 openai.js 导入
```
**状态判断**: 这是聊天补全通道的当前设置对象，反映当前模型后端、参数和前端配置。

**使用建议**: 需要读当前聊天补全配置时再看它；不要把它误认为请求发送器。
---
### `textCompletionSettings`
**源文件**: `scripts\textgen-settings.js:143`
**签名**:
```javascript
export const textgenerationwebui_settings = {
```
**状态判断**: 这里的上下文名是 `textCompletionSettings`，源码实际对象名是 `textgenerationwebui_settings`。它代表文本补全通道的当前设置对象。

**使用建议**: 需要读文本补全后端和参数配置时再看它；不要把它误认为请求函数。
---
### `powerUserSettings`
**源文件**: `scripts\power-user.js:125`
**签名**:
```javascript
export const power_user = {
```
**状态判断**: 这里的上下文名是 `powerUserSettings`，源码实际对象名是 `power_user`。它代表高级用户设置集合。

**使用建议**: 只有在处理 Power User 相关行为或格式化偏好时再读取它。
---
### `getCharacters`
**源文件**: `script.js:1290`
**签名**:
```javascript
export async function getCharacters()
```
---
### `getOneCharacter`
**源文件**: `script.js:1219`
**签名**:
```javascript
export async function getOneCharacter(avatarUrl)
```
---
### `getCharacterCardFields`
**源文件**: `script.js:3397`
**文档**:
```javascript
/**
 * Returns the character card fields for the current character.
 * @param {Object} [options={}]
 * @param {number} [options.chid] Optional character index
 * @returns {CharacterCardFields} Character card fields
 */
```
**签名**:
```javascript
export function getCharacterCardFields({ chid = undefined } = {})
```
---
### `getCharacterSource`
**源文件**: `script.js:1243`
**签名**:
```javascript
export function getCharacterSource(chId = this_chid)
```
---
### `importFromExternalUrl`
**源文件**: `scripts\utils.js:2861`
**文档**:
```javascript
/**
 * Imports content from an external URL.
 * @param {string} url URL or UUID of the content to import.
 * @param {Object} [options={}] Options object.
 * @param {string|null} [options.preserveFileName=null] Optional file name to use for the imported content.
 * @returns {Promise<void>} A promise that resolves when the import is complete.
 */
```
**签名**:
```javascript
export async function importFromExternalUrl(url, { preserveFileName = null } = {})
```
---
### `importTags`
**源文件**: `scripts\tags.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 tags.js 导入
```
**状态判断**: 这是标签导入相关入口，属于标签系统的辅助能力，不是标签数据本身。

**使用建议**: 如果问题是“标签有哪些”，优先看 `tags` 和 `tagMap`；如果问题是“怎么导入标签”，再关注它。
---
### `uuidv4`
**源文件**: `scripts\utils.js:1862`
**文档**:
```javascript
/**
 * Returns a UUID v4 string.
 * @returns {string} A UUID v4 string.
 * @example
 * uuidv4(); // '3e2fd9e1-0a7a-4f6d-9aaf-8a7a4babe7eb'
 */
```
**签名**:
```javascript
export function uuidv4()
```
---
### `humanizedDateTime`
**源文件**: `scripts\RossAscends-mods.js:169`
**文档**:
```javascript
/**
 * Gets a humanized date time string from a given timestamp.
 * @param {number} timestamp Timestamp in milliseconds
 * @returns {string} Humanized date time string in the format `YYYY-MM-DD@HHhMMmSSsMSms`
 */
```
**签名**:
```javascript
export function humanizedDateTime(timestamp = Date.now())
```
---
### `updateMessageBlock`
**源文件**: `script.js:1959`
**文档**:
```javascript
/**
 * Re-renders a message block with updated content.
 * @param {number} messageId Message ID
 * @param {object} message Message object
 * @param {object} [options={}] Optional arguments
 * @param {boolean} [options.rerenderMessage=true] Whether to re-render the message content (inside <c>.mes_text</c>)
 */
```
**签名**:
```javascript
export function updateMessageBlock(messageId, message, { rerenderMessage = true } = {})
```
---
### `appendMediaToMessage`
**源文件**: `script.js:2142`
**文档**:
```javascript
/**
 * Appends image or file to the message element.
 * @param {ChatMessage} mes Message object
 * @param {JQuery<HTMLElement>} messageElement Message element
 * @param {string} [scrollBehavior] Scroll behavior when adjusting scroll position
 */
```
**签名**:
```javascript
export function appendMediaToMessage(mes, messageElement, scrollBehavior = SCROLL_BEHAVIOR.ADJUST)
```
---
### `ensureMessageMediaIsArray`
**源文件**: `script.js:1976`
**文档**:
```javascript
/**
 * Ensures that the message media properties are arrays, adding getters/setters for single media items.
 * @param {ChatMessage} mes Message object
 */
```
**签名**:
```javascript
export function ensureMessageMediaIsArray(mes)
```
---
### `getMediaDisplay`
**源文件**: `script.js:2115`
**文档**:
```javascript
/**
 * Gets the media display setting for a message.
 * @param {ChatMessage} mes Message object
 * @returns {MEDIA_DISPLAY} Media display setting
 */
```
**签名**:
```javascript
export function getMediaDisplay(mes)
```
---
### `getMediaIndex`
**源文件**: `script.js:2125`
**文档**:
```javascript
/**
 * Gets the media index for a message.
 * @param {ChatMessage} mes Message object
 * @returns {number} Media index
 */
```
**签名**:
```javascript
export function getMediaIndex(mes)
```
---
### `scrollChatToBottom`
**源文件**: `script.js:2699`
**文档**:
```javascript
/**
 * Scrolls the chat to the bottom if configured to do so.
 * @param {object} [options] Options
 * @param {boolean} [options.waitForFrame] If true, waits for the animation frame before scrolling
 */
```
**签名**:
```javascript
export function scrollChatToBottom({ waitForFrame } = {})
```
---
### `scrollOnMediaLoad`
**源文件**: `script.js:1530`
**签名**:
```javascript
export function scrollOnMediaLoad()
```
---
### `macros`
**源文件**: `scripts\macros\macro-system.js:44`
**签名**:
```javascript
export const macros = {
```
---
### `loader`
**源文件**: `scripts\action-loader.js:283`
**文档**:
```javascript
/**
 * Action loader utility API.
 * Provides a convenient interface for showing and managing loading indicators.
 *
 * Read the functions documentation for more details.
 *
 * @example
 * // Basic usage
 * const handle = loader.show({ message: 'Loading...' });
 * await someOperation();
 * handle.hide();
 *
 * @example
 * // Non-blocking background task
 * const handle = loader.show({ blocking: false, message: 'Processing...' });
 *
 * @example
 * // Hide all active loaders
 * loader.hide();
 */
```
**签名**:
```javascript
export const loader = {
```
---
### `loadWorldInfo`
**源文件**: `scripts\world-info.js:2036`
**文档**:
```javascript
/**
 * Loads world info from the backend.
 *
 * This function will return from `worldInfoCache` if it has already been loaded before.
 *
 * @param {string} name - The name of the world to load
 * @return {Promise<Object|null>} A promise that resolves to the loaded world information, or null if the request fails.
 */
```
**签名**:
```javascript
export async function loadWorldInfo(name)
```
---
### `saveWorldInfo`
**源文件**: `scripts\world-info.js:4079`
**文档**:
```javascript
/**
 * Saves the world info
 *
 * This will also refresh the `worldInfoCache`.
 * Note, for performance reasons the saved cache will not make a deep clone of the data.
 * It is your responsibility to not modify the saved data object after calling this function, or there will be data inconsistencies.
 * Call `loadWorldInfoData` or query directly from cache if you need the object again.
 *
 * @param {string} name - The name of the world info
 * @param {any} data - The data to be saved
 * @param {boolean} [immediately=false] - Whether to save immediately or use debouncing
 * @return {Promise<void>} A promise that resolves when the world info is saved
 */
```
**签名**:
```javascript
export async function saveWorldInfo(name, data, immediately = false)
```
---
### `reloadWorldInfoEditor`
**源文件**: `scripts\world-info.js:1040`
**文档**:
```javascript
/**
 * Reloads the editor with the specified world info file
 * @param {string} file - The file to load in the editor
 * @param {boolean} [loadIfNotSelected=false] - Indicates whether to load the file even if it's not currently selected
 */
```
**签名**:
```javascript
export function reloadEditor(file, loadIfNotSelected = false)
```
---
### `updateWorldInfoList`
**源文件**: `scripts\world-info.js:2061`
**签名**:
```javascript
export async function updateWorldInfoList()
```
---
### `convertCharacterBook`
**源文件**: `scripts\world-info.js:5480`
**签名**:
```javascript
export function convertCharacterBook(characterBook)
```
---
### `getWorldInfoPrompt`
**源文件**: `scripts\world-info.js:892`
**文档**:
```javascript
/**
 * Gets the world info based on chat messages.
 * @param {string[]} chat - The chat messages to scan, in reverse order.
 * @param {number} maxContext - The maximum context size of the generation.
 * @param {boolean} isDryRun - If true, the function will not emit any events.
 * @param {WIGlobalScanData} globalScanData Chat independent context to be scanned
 * @returns {Promise<WIPromptResult>} The world info string and depth.
 */
```
**签名**:
```javascript
export async function getWorldInfoPrompt(chat, maxContext, isDryRun, globalScanData)
```
---
### `getWorldInfoNames`
**源文件**: `scripts\st-context.js:282`
**类型**: 函数
**说明**:
```javascript
getWorldInfoNames: () => Array.isArray(world_names) ? [...world_names] : []
```
**状态判断**: 这是世界书名称列表的轻量读取入口，返回的是当前前端已知世界书名数组副本，不负责加载完整世界书内容。

**使用建议**: 只想知道当前有哪些世界书时优先用它；需要具体条目、提示拼接结果或完整内容时再看 `loadWorldInfo()` / `getWorldInfoPrompt()`。
---
### `CONNECT_API_MAP`
**源文件**: `script.js`
**类型**: 变量/对象
**说明**:
```javascript
// 变量或对象，从 script.js 导入
```
**状态判断**: 这是 API 类型到连接配置的映射表，用于把当前主 API 类型对应到具体连接行为。

**使用建议**: 只有在做按后端类型分支的兼容逻辑时再看它；一般问题先看 `mainApi` 就够了。
---
### `getTextGenServer`
**源文件**: `scripts\textgen-settings.js:350`
**文档**:
```javascript
/**
 * Gets the API URL for the selected text generation type.
 * @param {string} type If it's set, ignores active type
 * @returns {string} API URL
 */
```
**签名**:
```javascript
export function getTextGenServer(type = null)
```
---
### `extractMessageFromData`
**源文件**: `script.js:6187`
**文档**:
```javascript
/**
 * Extracts the message from the response data.
 * @param {object} data Response data
 * @param {string} activeApi If it's set, ignores active API
 * @returns {string} Extracted message
 */
```
**签名**:
```javascript
export function extractMessageFromData(data, activeApi = null)
```
---
### `getPresetManager`
**源文件**: `scripts\preset-manager.js:83`
**文档**:
```javascript
/**
 * Gets a preset manager by API id.
 * @param {string} apiId API id
 * @returns {PresetManager} Preset manager
 */
```
**签名**:
```javascript
export function getPresetManager(apiId = '')
```
---
### `getChatCompletionModel`
**源文件**: `scripts\openai.js:1678`
**文档**:
```javascript
/**
 * Gets the API model for the selected chat completion source.
 * @param {ChatCompletionSettings} settings Chat completion settings
 * @returns {string} API model
 */
```
**签名**:
```javascript
export function getChatCompletionModel(settings = null)
```
---
### `printMessages`
**源文件**: `script.js:1473`
**签名**:
```javascript
export async function printMessages()
```
---
### `clearChat`
**源文件**: `script.js:1582`
**文档**:
```javascript
/**
 * Visually removes all chat message elements.
 * @param {object} [options] Options
 * @param {boolean} [options.clearData=false] Optionally clear the chat array's contents.
 */
```
**签名**:
```javascript
export async function clearChat({ clearData = false } = {})
```
---
### `ChatCompletionService`
**源文件**: `scripts\custom-request.js:420`
**文档**:
```javascript
/**
 * Creates & sends a chat completion request.
 */
```
**签名**:
```javascript
export class ChatCompletionService {
```
---
### `TextCompletionService`
**源文件**: `scripts\custom-request.js:78`
**文档**:
```javascript
/**
 * Creates & sends a text completion request.
 */
```
**签名**:
```javascript
export class TextCompletionService {
```
---
### `ConnectionManagerRequestService`
**源文件**: `scripts\extensions\shared.js:380`
**文档**:
```javascript
/**
 * It uses the profiles to send a generate request to the API.
 */
```
**签名**:
```javascript
export class ConnectionManagerRequestService {
```
---
### `updateReasoningUI`
**源文件**: `scripts\reasoning.js:233`
**文档**:
```javascript
/**
 * Updates the Reasoning UI for a specific message
 * @param {number|JQuery<HTMLElement>|HTMLElement} messageIdOrElement The message ID or the message element
 * @param {Object} [options={}] - Optional arguments
 * @param {boolean} [options.reset=false] - Whether to reset state, and not take the current mess properties (for example when swiping)
 */
```
**签名**:
```javascript
export function updateReasoningUI(messageIdOrElement, { reset = false } = {})
```
---
### `parseReasoningFromString`
**源文件**: `scripts\reasoning.js:1382`
**文档**:
```javascript
/**
 * Parses reasoning from a string using the power user reasoning settings or optional template.
 * @typedef {Object} ParsedReasoning
 * @property {string} reasoning Reasoning block
 * @property {string} content Message content
 * @param {string} str Content of the message
 * @param {Object} options Optional arguments
 * @param {boolean} [options.strict=true] Whether the reasoning block **has** to be at the beginning of the provided string (excluding whitespaces), or can be anywhere in it
 * @param {ReasoningTemplate} template Optional reasoning template to use instead of power_user.reasoning
 * @returns {ParsedReasoning|null} Parsed reasoning block and message content
 */
```
**签名**:
```javascript
export function parseReasoningFromString(str, { strict = true } = {}, template = null)
```
---
### `getReasoningTemplateByName`
**源文件**: `scripts\reasoning.js:1365`
**文档**:
```javascript
/**
 * Returns the reasoning template object from its name
 * @param {string} name of the template
 * @returns {ReasoningTemplate} the reasoning template object
 * @throws {Error}
 */
```
**签名**:
```javascript
export function getReasoningTemplateByName(name)
```
---
### `unshallowCharacter`
**源文件**: `script.js:7512`
**文档**:
```javascript
/**
 * Loads all the data of a shallow character.
 * @param {string|undefined} characterId Array index
 * @returns {Promise<void>} Promise that resolves when the character is unshallowed
 */
```
**签名**:
```javascript
export async function unshallowCharacter(characterId)
```
---
### `unshallowGroupMembers`
**源文件**: `scripts\group-chats.js:1378`
**文档**:
```javascript
/**
 * Unshallows all definitions of group members.
 * @param {string} groupId Id of the group
 * @returns {Promise<void>} Promise that resolves when all group members are unshallowed
 */
```
**签名**:
```javascript
export async function unshallowGroupMembers(groupId)
```
---
### `getExtensionManifest`
**源文件**: `scripts\extensions.js:524`
**文档**:
```javascript
/**
 * Returns a deep clone of the manifest for the given extension name.
 * Accepts either the short name or the full internal key.
 */
```
**签名**:
```javascript
export function getExtensionManifest(name)
```
**状态判断**: 这是扩展清单读取入口，返回的是 manifest 深拷贝，适合读扩展元信息，不适合作为“扩展是否已激活”的唯一判断。

**使用建议**: 需要查看某个扩展的显示名、版本、 hook、设置面板能力时读取它；判断启用态、安装态时最好结合扩展系统其它状态一起看。
---
### `openThirdPartyExtensionMenu`
**源文件**: `scripts\extensions.js:1819`
**文档**:
```javascript
/**
 * Prompts the user to enter the Git URL of the extension to import.
 * After obtaining the Git URL, makes a POST request to '/api/extensions/install' to import the extension.
 * If the extension is imported successfully, a success message is displayed.
 * If the extension import fails, an error message is displayed and the error is logged to the console.
 * After successfully importing the extension, the extension settings are reloaded and a 'EXTENSION_SETTINGS_LOADED' event is emitted.
 * @param {string} [suggestUrl] Suggested URL to install
 * @returns {Promise<void>}
 */
```
**签名**:
```javascript
export async function openThirdPartyExtensionMenu(suggestUrl = '')
```
---
### `swipe.left`
**源文件**: `script.js:10338`
**文档**:
```javascript
/**
 * @deprecated Use `swipe` instead.
 * Handles the swipe to the left event.
 * @param {SwipeEvent} [event] Event.
 * @param {object} params Additional parameters.
 * @param {import('./scripts/constants.js').SWIPE_SOURCE} [params.source]  The source of the swipe event.
 * @param {boolean} [params.repeated] Is the swipe event repeated.
 * @param {object} [params.message] The chat message to swipe.
 */
```
**签名**:
```javascript
export async function swipe_left(event, { source, repeated, message } = {})
```
**状态判断**: 这是旧式方向型入口。它能用，但表达能力弱于更通用的 `swipe.to(...)`。

**替代方案**: 新代码优先使用 `swipe.to(...)`；只有在明确就是“向左一步”语义时再考虑旧入口。
---
### `swipe.right`
**源文件**: `script.js:10352`
**签名**:
```javascript
export async function swipe_right(event = null, { source, repeated, message } = {})
```
---
### `swipe.to`
**源文件**: `script.js:9849`
**文档**:
```javascript
/**
 * Handles the swipe event.
 * @param {SwipeEvent} event Event.
 * @param {SWIPE_DIRECTION} direction The direction to swipe.
 * @param {object} params Additional parameters.
 * @param {import('./scripts/constants.js').SWIPE_SOURCE} [params.source]  The source of the swipe event.
 * @param {boolean} [params.repeated] Is the swipe event repeated.
 * @param {ChatMessage} [params.message=chat[chat.length - 1]] The chat message to swipe.
 * @param {number} [params.forceMesId] The message id to swipe.
 * @param {number} [params.forceSwipeId] The target swipe_id. When out of range, it will be looped or clamped.
 * @param {number} [params.forceDuration] Overwrites the default swipe duration.
 */
```
**签名**:
```javascript
export async function swipe(event, direction, { source, repeated, message = chat[chat.length - 1], forceMesId, forceSwipeId, forceDuration } = {})
```
---
### `swipe.show`
**源文件**: `script.js:9208`
**文档**:
```javascript
/**
 * This function is misleadingly named. It allows generation then refreshes the swipe buttons and counters.
 */
```
**签名**:
```javascript
export function showSwipeButtons()
```
---
### `swipe.hide`
**源文件**: `script.js:9218`
**文档**:
```javascript
/**
 * This function is misleadingly named. It blocks generation then refreshes the swipe buttons and counters.
 * @param {object} [options] Options
 * @param {boolean} [options.hideCounters=false] Also hide the swipes counter.
 */
```
**签名**:
```javascript
export function hideSwipeButtons({ hideCounters = false } = {})
```
---
### `swipe.refresh`
**源文件**: `script.js:9145`
**文档**:
```javascript
/**
 * Refreshes all swipe buttons and updates their swipe counters.
 * This has been optimized for bulk updates by minimizing DOM queries.
 * @param {boolean} updateCounters When true, the swipe counters will also be updated. Typically redundant because addOneMessage updates the counters.
 * @param {boolean} fade By default, the chevrons fade in and out.
 * @returns
 */
```
**签名**:
```javascript
export function refreshSwipeButtons(updateCounters = false, fade = true)
```
---
### `swipe.isAllowed`
**源文件**: `script.js:9057`
**文档**:
```javascript
/**
 * Returns true if messages are generally swipeable.
 * @returns {boolean}
 */
```
**签名**:
```javascript
export function isSwipingAllowed()
```
---
### `variables.get`
**源文件**: `scripts\variables.js:22`
**签名**:
```javascript
export function getLocalVariable(name, args = {})
```
---
### `variables.set`
**源文件**: `scripts\variables.js:48`
**签名**:
```javascript
export function setLocalVariable(name, value, args = {})
```
---
### `variables.del`
**源文件**: `scripts\variables.js:592`
**文档**:
```javascript
/**
 * Deletes a local variable.
 * @param {string} name Variable name to delete
 * @returns {string} Empty string
 */
```
**签名**:
```javascript
export function deleteLocalVariable(name)
```
---
### `variables.add`
**源文件**: `scripts\variables.js:136`
**签名**:
```javascript
export function addLocalVariable(name, value)
```
---
### `variables.inc`
**源文件**: `scripts\variables.js:196`
**签名**:
```javascript
export function incrementLocalVariable(name)
```
---
### `variables.dec`
**源文件**: `scripts\variables.js:204`
**签名**:
```javascript
export function decrementLocalVariable(name)
```
---
### `variables.has`
**源文件**: `scripts\variables.js:422`
**文档**:
```javascript
/**
 * Checks if a local variable exists.
 * @param {string} name Local variable name
 * @returns {boolean} True if the local variable exists, false otherwise
 */
```
**签名**:
```javascript
export function existsLocalVariable(name)
```
---
### `global.get`
**源文件**: `scripts\variables.js:83`
**签名**:
```javascript
export function getGlobalVariable(name, args = {})
```
---
### `global.set`
**源文件**: `scripts\variables.js:105`
**签名**:
```javascript
export function setGlobalVariable(name, value, args = {})
```
---
### `global.del`
**源文件**: `scripts\variables.js:608`
**文档**:
```javascript
/**
 * Deletes a global variable.
 * @param {string} name Variable name to delete
 * @returns {string} Empty string
 */
```
**签名**:
```javascript
export function deleteGlobalVariable(name)
```
---
### `global.add`
**源文件**: `scripts\variables.js:166`
**签名**:
```javascript
export function addGlobalVariable(name, value)
```
---
### `global.inc`
**源文件**: `scripts\variables.js:200`
**签名**:
```javascript
export function incrementGlobalVariable(name)
```
---
### `global.dec`
**源文件**: `scripts\variables.js:208`
**签名**:
```javascript
export function decrementGlobalVariable(name)
```
---
### `global.has`
**源文件**: `scripts\variables.js:431`
**文档**:
```javascript
/**
 * Checks if a global variable exists.
 * @param {string} name Global variable name
 * @returns {boolean} True if the global variable exists, false otherwise
 */
```
**签名**:
```javascript
export function existsGlobalVariable(name)
```
---
### `symbols.ignore`
**源文件**: `scripts\constants.js:25`
**文档**:
```javascript
/**
 * Used as an ephemeral key in message extra metadata.
 * When set, the message will be excluded from generation
 * prompts without affecting the number of chat messages,
 * which is needed to preserve world info timed effects.
 */
```
**签名**:
```javascript
export const IGNORE_SYMBOL = Symbol.for('ignore');
```
---
### `constants.unset`
**源文件**: `scripts\extensions.js:2052`
**文档**:
```javascript
/**
 * Sentinel value used by extension field bulk writers to mean:
 * delete the extension key entirely instead of storing a normal value.
 */
```
**签名**:
```javascript
export const UNSET_VALUE = '__@@UNSET@@__';
```
**状态判断**: 这是一个带特殊语义的哨兵值，不是普通字符串常量。把它传给扩展字段写入接口时，含义是“删掉字段”，不是“把字段值设置成这串文本”。

**使用建议**: 只在 `writeExtensionFieldBulk()` 这类明确支持删除语义的接口里使用它；不要把它混进普通业务数据或用户可见配置。
---
### `maxContext`
**源文件**: `scripts\st-context.js:130`
**类型**: 变量
**说明**:
```javascript
// 当前上下文窗口大小（从 max_context 转换为数字）
maxContext: Number(max_context)
```
**状态判断**: 这是当前上下文窗口大小的数值化结果，用来读预算，不是配置入口。

**使用建议**: 需要按当前上下文上限估算 token 或裁剪内容时读取它；不要把它当可写配置。
---
### `registerHelper`
**源文件**: `scripts\st-context.js:174`
**类型**: 函数（已废弃）
**说明**:
```javascript
// 空函数占位符，用于向后兼容
// Handlebars for extensions are no longer supported.
registerHelper: () => { }
```
**状态判断**: 这是兼容旧代码保留的空入口，调用不会带来有效能力。

**使用建议**: 默认忽略，不要在新代码、助手方案或故障排查时把它当成可用模板扩展机制。
---
