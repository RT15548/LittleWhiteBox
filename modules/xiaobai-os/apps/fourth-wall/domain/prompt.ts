import { DEFAULT_BOTTOM, DEFAULT_CONFIRM, DEFAULT_META_PROTOCOL, DEFAULT_TOPUSER } from './defaults.js';
import { MAIN_CHAT_DEFAULT } from './context-policy.js';
import type {
    FourthWallBuiltPrompt,
    FourthWallChatSnapshot,
    FourthWallCommentaryPromptInput,
    FourthWallMessageData,
    FourthWallPromptInput,
} from '../types.js';

export const IMG_GUIDELINE = `## 模拟图片
如果需要发图、照片给对方时，可以在聊天文本中穿插以下格式行，进行图片模拟：
[img: Subject, Appearance, Background, Atmosphere, Extra descriptors]
- tag必须为英文，用逗号分隔，使用Danbooru风格的tag，5-15个tag
- 第一个tag须固定为人物数量标签，如: 1girl, 1boy, 2girls, solo, etc.
- 可以多张照片: 每行一张 [img: ...]
- 当需要发送的内容尺度较大时加上nsfw相关tag
- image部分也需要在<msg>内`;

export const VOICE_GUIDELINE = `## 模拟语音
如需发送语音消息，使用以下格式：
[voice:情绪:语音内容]
- 情绪可选 happy、sad、angry、surprise、scare、hate，留空表示平静
- voice部分需要在<msg>内`;

const COMMENTARY_PROTOCOL = `
阅读以上内容后，看本次任务具体要求:
<meta_protocol>
# 输出规范：
- 你是现实人类，是对方熟悉的语C搭档
- 这是一句剧情进行中的即兴皮下吐槽
- 像社交软件聊天一样自然，只写一句简短内容
- 不重复之前说过的话，不使用文学创作腔
# 输出格式：
<msg>
内容
</msg>
只输出一个<msg>...</msg>块。
</meta_protocol>`;

function cleanContent(value: unknown): string {
    return String(value || '')
        .replace(/<think>[\s\S]*?<\/think>\s*/gi, '')
        .replace(/<thinking>[\s\S]*?<\/thinking>\s*/gi, '')
        .replace(/<system>[\s\S]*?<\/system>\s*/gi, '')
        .replace(/<meta[\s\S]*?<\/meta>\s*/gi, '')
        .replace(/<instructions>[\s\S]*?<\/instructions>\s*/gi, '')
        .replace(/\|/g, '｜')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function formatTimestamp(timestamp: number): string {
    if (!timestamp) {
        return '';
    }
    const date = new Date(timestamp);
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatInterval(milliseconds: number): string {
    if (!milliseconds || milliseconds <= 0) {
        return '0分钟';
    }
    const minutes = Math.floor(milliseconds / 60000);
    if (minutes < 60) {
        return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours < 24) {
        return remainingMinutes ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours ? `${days}天${remainingHours}小时` : `${days}天`;
}

function replaceNames(value: unknown, userName: string, characterName: string): string {
    return String(value || '')
        .replace(/{{USER_NAME}}/g, userName)
        .replace(/{{CHAR_NAME}}/g, characterName);
}

export function formatMainChat(snapshot: FourthWallChatSnapshot | null, maximumLayers: number): string {
    return (snapshot?.messages || [])
        .slice(-maximumLayers)
        .map((message) => `${message.isUser ? '对方(你)' : '自己(我)'}:\n${cleanContent(message.text)}`)
        .filter((line) => !line.endsWith('\n'))
        .join('\n');
}

export function formatMetaHistory(history: FourthWallMessageData[]): string {
    let lastAiTimestamp: number | null = null;
    return (history || [])
        .filter((message) => String(message?.content || '').trim())
        .map((message) => {
            const timestamp = formatTimestamp(message.ts);
            let prefix = timestamp ? `[${timestamp}] ` : '';
            if (message.role === 'user' && lastAiTimestamp && message.ts) {
                prefix = timestamp ? `[${timestamp}|间隔${formatInterval(message.ts - lastAiTimestamp)}] ` : '';
            }
            if (message.role === 'ai') {
                lastAiTimestamp = message.ts;
            }
            return `${prefix}${message.role === 'user' ? '对方(你)' : '自己(我)'}:\n${cleanContent(message.content)}`;
        })
        .join('\n');
}

export function buildFourthWallPrompt({
    userInput,
    history,
    memory = '',
    chatSnapshot,
    settings,
    globalSettings,
    commentary = false,
}: FourthWallPromptInput): FourthWallBuiltPrompt {
    const userName = String(chatSnapshot?.userName || 'User');
    const characterName = String(chatSnapshot?.characterName || 'Assistant');
    const templates: Partial<typeof globalSettings.promptTemplates> = globalSettings?.promptTemplates || {};
    const maximumLayers = Number.isInteger(settings?.maxChatLayers) ? settings.maxChatLayers : MAIN_CHAT_DEFAULT;
    let protocol = commentary ? COMMENTARY_PROTOCOL : String(templates.metaProtocol || DEFAULT_META_PROTOCOL);
    protocol = replaceNames(protocol, userName, characterName);
    if (globalSettings?.image?.enablePrompt) {
        protocol += `\n\n${IMG_GUIDELINE}`;
    }
    if (globalSettings?.voice?.enabled) {
        protocol += `\n\n${VOICE_GUIDELINE}`;
    }

    return {
        msg1: replaceNames(templates.topuser || DEFAULT_TOPUSER, userName, characterName),
        msg2: String(templates.confirm || DEFAULT_CONFIRM),
        msg3: `首先查看你们的历史过往:
<chat_history>
${formatMainChat(chatSnapshot, maximumLayers)}
</chat_history>
Developer:以下是你们的皮下过往：
${memory.trim() ? `<meta_memory>\n${memory.trim()}\n</meta_memory>\n` : ''}<meta_history>
${formatMetaHistory(history)}
</meta_history>
${protocol}`
            .replace(/\|/g, '｜')
            .trim(),
        msg4: String(templates.bottom || DEFAULT_BOTTOM).replace(/{{USER_INPUT}}/g, String(userInput || '')),
    };
}

export function buildFourthWallCommentaryPrompt(input: FourthWallCommentaryPromptInput): FourthWallBuiltPrompt | null {
    const built = buildFourthWallPrompt({ ...input, userInput: '', commentary: true });
    const targetText = String(input.targetText || '');
    const prompts: Record<FourthWallCommentaryPromptInput['type'], string> = {
        ai_message: '剧本还在继续中，我刚说完最后一轮RP，忍不住想皮下吐槽一句自己的RP。直接输出<msg>内容</msg>：',
        edit_own: `我发现你悄悄编辑了自己的台词：「${targetText}」。必须皮下吐槽一句，直接输出<msg>内容</msg>：`,
        edit_ai: `我发现你居然偷偷改了我的台词：「${targetText}」。必须皮下吐槽一句，直接输出<msg>内容</msg>：`,
    };
    const msg4 = prompts[input.type];
    return msg4 ? { ...built, msg4 } : null;
}
