import { xbLog } from "../../../core/debug-core.js";
import { callDrawScenePlannerLlm } from "./draw-llm.js";
import { getWorldInfoPrompt } from "../../../../../../../scripts/world-info.js";

const EMPTY_PROMPT_CONFIG = {
    topSystem: '',
    assistantDoc: '{$tagGuide}',
    tagGuideContent: '',
    assistantAskBackground: '',
    userWorldInfo: `Content Provider:
<worldInfo>
用户角色设定：
{{persona}}
---
世界/场景:
{{description}}
---
{$worldInfo}
</worldInfo>`,
    assistantAskContent: '',
    userContent: `
Content Provider:
<content>
{{characterInfo}}
---
{{lastMessage}}
</content>`,
    metaProtocolStart: '<meta_protocol>',
    userJsonFormat: '',
    metaProtocolEnd: `</meta_protocol>`,
    assistantCheck: '',
    userConfirm: '',
    assistantPrefill: '',
};

export const PROVIDER_MAP = {
    openai: "openai",
    google: "google",
    gemini: "google",
    claude: "claude",
    anthropic: "claude",
};

/**
 * 获取当前生效的提示词配置（合并自定义覆盖）
 * @param {Object|null} custom  customPrompts 对象，null 字段表示使用默认
 */
export function getEffectivePromptConfig(custom, defaults = EMPTY_PROMPT_CONFIG) {
    const base = (defaults && typeof defaults === 'object')
        ? { ...EMPTY_PROMPT_CONFIG, ...defaults }
        : { ...EMPTY_PROMPT_CONFIG };
    if (!custom) return base;
    const merged = { ...base };
    for (const key of Object.keys(base)) {
        if (typeof custom[key] === 'string' && custom[key].trim()) {
            merged[key] = custom[key];
        }
    }
    return merged;
}

/**
 * 获取当前生效的 TAG 编写指南内容
 * @param {string|null} customGuide  自定义指南内容，null 表示使用文件加载的默认值
 */
export function getEffectiveTagGuide(customGuide) {
    if (typeof customGuide === 'string' && customGuide.trim()) return customGuide;
    return '';
}

export class LLMServiceError extends Error {
    constructor(message, code = 'LLM_ERROR', details = null) {
        super(message);
        this.name = 'LLMServiceError';
        this.code = code;
        this.details = details;
    }
}

export function buildCharacterInfoForLLM(presentCharacters) {
    if (!presentCharacters?.length) {
        return `【已录入角色】: 无
所有角色都是未知角色，每个角色必须包含 type + appear + action`;
    }

    const lines = presentCharacters.map(c => {
        const aliases = c.aliases?.length ? ` (别名: ${c.aliases.join(', ')})` : '';
        const type = c.type || 'girl';
        const danbooru = c.danbooruTag ? ` | danbooru: ${c.danbooruTag}` : '';
        const appear = c.appearance ? `\n  外貌参考: ${c.appearance}` : '';
        const outfits = Array.isArray(c.outfits) && c.outfits.length
            ? `\n  可选服装（仅供参考；请结合剧情自行选择最合适的一套或其变体写入 costume，可在参考基础上体现破损/敞开/滑落/湿透等状态；不要把多套服装直接拼接或混合输出）: ${c.outfits
                .filter(o => o?.name || o?.tags)
                .map(o => `${o.name || '服装'}=${o.tags || '未填写tag'}`)
                .join('； ')}`
            : '';
        return `- ${c.name}${aliases} [${type}]${danbooru}: 外貌已预设，只需输出 name + danbooru + costume + action + interact + uc + center；costume 由你根据当前剧情决定，可参考服装列表自行选择并改写，只描述这一张图实际穿着的内容${appear}${outfits}`;
    });

    return `【已录入角色】(不要输出这些角色的 type/appear，但 costume 必须完整输出):
${lines.join('\n')}`;
}

function collectWorldInfoSections(result) {
    const sections = [];
    const pushText = (title, text) => {
        const content = String(text || '').trim();
        if (content) sections.push(`【${title}】\n${content}`);
    };

    pushText('酒馆世界书-前置', result?.worldInfoBefore);
    if (Array.isArray(result?.worldInfoDepth)) {
        const depthText = result.worldInfoDepth
            .flatMap(item => Array.isArray(item?.entries) ? item.entries : [])
            .map(entry => String(entry || '').trim())
            .filter(Boolean)
            .join('\n');
        pushText('酒馆世界书-深度', depthText);
    }
    pushText('酒馆世界书-后置', result?.worldInfoAfter);
    return sections;
}

async function buildNativeWorldInfoForDraw(messageText, presentCharacters) {
    try {
        const charNames = (presentCharacters || []).map(c => c?.name).filter(Boolean).join(' ');
        const scanChat = [messageText, charNames].map(v => String(v || '').trim()).filter(Boolean);
        if (!scanChat.length) return '';

        const result = await getWorldInfoPrompt(scanChat, 8192, true, { trigger: 'normal' });
        return collectWorldInfoSections(result).join('\n\n').trim();
    } catch (error) {
        console.warn('[Draw Scene Planner] 酒馆世界书扫描失败:', error);
        return '';
    }
}

function combineWorldInfoEntries({ uploadedEntries = '', nativeEntries = '' } = {}) {
    const sections = [];
    const uploaded = String(uploadedEntries || '').trim();
    const native = String(nativeEntries || '').trim();
    if (native) sections.push(`### 酒馆当前世界书\n${native}`);
    if (uploaded) sections.push(`### 画图上传世界书\n${uploaded}`);
    return sections.join('\n\n').trim();
}

export async function generateScenePlan(options) {
    const {
        messageText,
        presentCharacters = [],
        llmApi = {},
        useStream = false,
        useWorldInfo = false,
        customPrompts = null,
        promptDefaults = EMPTY_PROMPT_CONFIG,
        worldbookEntries = null,
        timeout = 120000,
        maxImages = 0,
        maxCharactersPerImage = 0,
        disablePrefill = false,
        signal = null,
    } = options;
    if (!messageText?.trim()) {
        throw new LLMServiceError('消息内容为空', 'EMPTY_MESSAGE');
    }
    const promptConfig = getEffectivePromptConfig(customPrompts, promptDefaults);
    const effectiveTagGuide = getEffectiveTagGuide(promptConfig.tagGuideContent);
    const charInfo = buildCharacterInfoForLLM(presentCharacters);

    const topMessages = [];

    topMessages.push({
        role: 'system',
        content: promptConfig.topSystem
    });

    let docContent = promptConfig.assistantDoc;
    if (effectiveTagGuide) {
        docContent = docContent.replace('{$tagGuide}', effectiveTagGuide);
    } else {
        docContent = '好的，我将按照当前图像生成规范生成图像描述。';
    }
    topMessages.push({
        role: 'assistant',
        content: docContent
    });

    topMessages.push({
        role: 'assistant',
        content: promptConfig.assistantAskBackground
    });

    const nativeWorldInfo = useWorldInfo ? await buildNativeWorldInfoForDraw(messageText, presentCharacters) : '';
    const combinedWorldInfo = combineWorldInfoEntries({
        uploadedEntries: worldbookEntries,
        nativeEntries: nativeWorldInfo,
    });

    let worldInfoContent = promptConfig.userWorldInfo;
    if (combinedWorldInfo) {
        worldInfoContent = worldInfoContent.replace(/\{\$worldInfo\}/gi, () => combinedWorldInfo);
    } else if (!useWorldInfo) {
        // 未启用世界书：清除占位符，避免残留在 prompt 中
        worldInfoContent = worldInfoContent.replace(/\{\$worldInfo\}/gi, '');
    } else {
        // 启用酒馆世界书但未命中条目：清除占位符，避免裸文本残留
        worldInfoContent = worldInfoContent.replace(/\{\$worldInfo\}/gi, '');
    }
    topMessages.push({
        role: 'user',
        content: worldInfoContent
    });

    topMessages.push({
        role: 'assistant',
        content: promptConfig.assistantAskContent
    });

    const mainPrompt = promptConfig.userContent
        .replace('{{lastMessage}}', messageText)
        .replace('{{characterInfo}}', charInfo);

    const bottomMessages = [];

    bottomMessages.push({
        role: 'user',
        content: promptConfig.metaProtocolStart
    });

    // 变量替换（供自定义 prompt 使用；默认 prompt 通过下方 LIMITS 注入，此处为 no-op）
    let userJsonFormatContent = promptConfig.userJsonFormat;
    if (maxImages > 0) userJsonFormatContent = userJsonFormatContent.replace(/\{\{maxImages\}\}/g, String(maxImages));
    if (maxCharactersPerImage > 0) userJsonFormatContent = userJsonFormatContent.replace(/\{\{maxCharactersPerImage\}\}/g, String(maxCharactersPerImage));

    bottomMessages.push({
        role: 'user',
        content: userJsonFormatContent
    });

    // 动态注入数量限制
    const limitLines = [];
    if (maxImages > 0) limitLines.push(`- images 数组最多 ${maxImages} 项，只选取最重要的视觉核心场景`);
    if (maxCharactersPerImage > 0) limitLines.push(`- 每张图的 characters 最多 ${maxCharactersPerImage} 人，优先保留主要角色`);
    if (limitLines.length) {
        bottomMessages.push({
            role: 'user',
            content: `## LIMITS (严格遵守)：\n${limitLines.join('\n')}`,
        });
    }

    bottomMessages.push({
        role: 'user',
        content: promptConfig.metaProtocolEnd
    });

    // #10 合规检查 + #11 截断重生：始终保留（prompt engineering 核心技巧）
    bottomMessages.push({
        role: 'assistant',
        content: promptConfig.assistantCheck
    });

    bottomMessages.push({
        role: 'user',
        content: promptConfig.userConfirm
    });

    const messages = []
        .concat(topMessages)
        .concat(mainPrompt.trim() ? [{ role: 'user', content: mainPrompt.trim() }] : [])
        .concat(bottomMessages);
    if (!disablePrefill && String(promptConfig.assistantPrefill || '').trim()) {
        messages.push({ role: 'assistant', content: promptConfig.assistantPrefill });
    }

    let rawOutput;
    try {
        rawOutput = await callDrawScenePlannerLlm({
            messages,
            llmApi,
            useStream,
            timeout,
            signal,
        });
    } catch (e) {
        console.error('[ScenePlanner] LLM 调用原始错误:', e);
        console.error('[ScenePlanner] 错误详情:', { message: e?.message, code: e?.code, name: e?.name, stack: e?.stack });
        xbLog.error('novelDrawLlm', `LLM 调用失败: ${e?.message}`, { code: e?.code, name: e?.name });
        throw new LLMServiceError(`LLM 调用失败: ${e.message}`, 'CALL_FAILED');
    }

    if (!rawOutput || !String(rawOutput).trim()) {
        console.warn('[ScenePlanner] LLM 返回为空');
        xbLog.error('novelDrawLlm', 'LLM 输出为空', null);
        throw new LLMServiceError('LLM 输出为空', 'EMPTY_OUTPUT');
    }

    if (xbLog.isEnabled()) {
        xbLog.info("novelDrawLlm", `rawOutput(len=${rawOutput?.length || 0}): ${String(rawOutput || "").slice(0, 1200)}`);
    }

    console.log('[ScenePlanner] LLM 原始输出 (完整):', rawOutput);

    return rawOutput;
}

function cleanYamlInput(text) {
    return String(text || '')
        .replace(/^[\s\S]*?```(?:ya?ml|json)?\s*\n?/i, '')
        .replace(/\n?```[\s\S]*$/i, '')
        .replace(/\r\n/g, '\n')
        .replace(/\t/g, '  ')
        .trim();
}

function splitByPattern(text, pattern) {
    const blocks = [];
    const regex = new RegExp(pattern.source, 'gm');
    const matches = [...text.matchAll(regex)];
    if (matches.length === 0) return [];
    for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index;
        const end = i < matches.length - 1 ? matches[i + 1].index : text.length;
        blocks.push(text.slice(start, end));
    }
    return blocks;
}

function extractNumField(text, fieldName) {
    const regex = new RegExp(`${fieldName}\\s*:\\s*(\\d+)`);
    const match = text.match(regex);
    return match ? parseInt(match[1]) : 0;
}

function extractStrField(text, fieldName) {
    const regex = new RegExp(`^[ ]*-?[ ]*${fieldName}[ ]*:[ ]*(.*)$`, 'mi');
    const match = text.match(regex);
    if (!match) return '';

    let value = match[1].trim();
    const afterMatch = text.slice(match.index + match[0].length);

    if (/^[|>][-+]?$/.test(value)) {
        const foldStyle = value.startsWith('>');
        const lines = [];
        let baseIndent = -1;
        for (const line of afterMatch.split('\n')) {
            if (!line.trim()) {
                if (baseIndent >= 0) lines.push('');
                continue;
            }
            const indent = line.search(/\S/);
            if (indent < 0) continue;
            if (baseIndent < 0) {
                baseIndent = indent;
            } else if (indent < baseIndent) {
                break;
            }
            lines.push(line.slice(baseIndent));
        }
        while (lines.length > 0 && !lines[lines.length - 1].trim()) {
            lines.pop();
        }
        return foldStyle ? lines.join(' ').trim() : lines.join('\n').trim();
    }

    if (!value) {
        const nextLineMatch = afterMatch.match(/^\n([ ]+)(\S.*)$/m);
        if (nextLineMatch) {
            value = nextLineMatch[2].trim();
        }
    }

    if (value) {
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        value = value
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\n/g, '\n')
            .replace(/\\\\/g, '\\');
    }

    return value;
}

function parseCharacterBlock(block) {
    const name = extractStrField(block, 'name');
    if (!name) return null;

    const char = { name };
    const optionalFields = ['danbooru', 'type', 'appear', 'costume', 'action', 'interact', 'uc', 'center'];
    for (const field of optionalFields) {
        const value = extractStrField(block, field);
        if (value) char[field] = value;
    }
    return char;
}

function parseCharactersSection(charsText) {
    const chars = [];
    const charBlocks = splitByPattern(charsText, /^[ ]*-[ ]*name[ ]*:/m);
    for (const block of charBlocks) {
        const char = parseCharacterBlock(block);
        if (char) chars.push(char);
    }
    return chars;
}

function parseImageBlockYaml(block) {
    const index = extractNumField(block, 'index');
    if (!index) return null;

    const image = {
        index,
        anchor: extractStrField(block, 'anchor'),
        scene: extractStrField(block, 'scene'),
        negative: extractStrField(block, 'negative'),
        chars: [],
        hasCharactersField: false
    };

    const charsFieldMatch = block.match(/^[ ]*characters[ ]*:/m);
    if (charsFieldMatch) {
        image.hasCharactersField = true;
        const inlineEmpty = block.match(/^[ ]*characters[ ]*:[ ]*\[\s*\]/m);
        if (!inlineEmpty) {
            const charsMatch = block.match(/^[ ]*characters[ ]*:[ ]*$/m);
            if (charsMatch) {
                const charsStart = charsMatch.index + charsMatch[0].length;
                let charsEnd = block.length;
                const afterChars = block.slice(charsStart);
                const nextFieldMatch = afterChars.match(/\n([ ]{0,6})([a-z_]+)[ ]*:/m);
                if (nextFieldMatch && nextFieldMatch[1].length <= 2) {
                    charsEnd = charsStart + nextFieldMatch.index;
                }
                const charsContent = block.slice(charsStart, charsEnd);
                image.chars = parseCharactersSection(charsContent);
            }
        }
    }

    return image;
}


function parseYamlImagePlan(text) {
    const images = [];
    let content = text;

    const imagesMatch = text.match(/^[ ]*images[ ]*:[ ]*$/m);
    if (imagesMatch) {
        content = text.slice(imagesMatch.index + imagesMatch[0].length);
    }

    const imageBlocks = splitByPattern(content, /^[ ]*-[ ]*index[ ]*:/m);
    for (const block of imageBlocks) {
        const parsed = parseImageBlockYaml(block);
        if (parsed) images.push(parsed);
    }

    return images;
}

function normalizeImageTasks(images) {
    const tasks = images.map(img => {
        const task = {
            index: Number(img.index) || 0,
            anchor: String(img.anchor || '').trim(),
            scene: String(img.scene || '').trim(),
            negative: String(img.negative || '').trim(),
            chars: [],
            hasCharactersField: img.hasCharactersField === true
        };

        const chars = img.characters || img.chars || [];
        for (const c of chars) {
            if (!c?.name) continue;
            const char = { name: String(c.name).trim() };
            if (c.danbooru) char.danbooru = String(c.danbooru).trim();
            if (c.type) char.type = String(c.type).trim().toLowerCase();
            if (c.appear) char.appear = String(c.appear).trim();
            if (c.costume) char.costume = String(c.costume).trim();
            if (c.action) char.action = String(c.action).trim();
            if (c.interact) char.interact = String(c.interact).trim();
            if (c.uc) char.uc = String(c.uc).trim();
            if (c.center) char.center = String(c.center).trim();
            task.chars.push(char);
        }

        return task;
    });

    tasks.sort((a, b) => a.index - b.index);

    let validTasks = tasks.filter(t => t.index > 0 && t.scene);

    if (validTasks.length > 0) {
        const last = validTasks[validTasks.length - 1];
        let isComplete;

        if (!last.hasCharactersField) {
            isComplete = false;
        } else if (last.chars.length === 0) {
            isComplete = true;
        } else {
            const lastChar = last.chars[last.chars.length - 1];
            isComplete = (lastChar.action?.length || 0) >= 5;
        }

        if (!isComplete) {
            console.warn(`[LLM-Service] 丢弃截断的任务 index=${last.index}`);
            validTasks.pop();
        }
    }

    validTasks.forEach(t => delete t.hasCharactersField);

    return validTasks;
}

export function parseImagePlan(aiOutput) {
    const text = cleanYamlInput(aiOutput);

    if (!text) {
        throw new LLMServiceError('LLM 输出为空', 'EMPTY_OUTPUT');
    }

    console.log('[ScenePlanner] cleanYamlInput 后:', text);

    const yamlResult = parseYamlImagePlan(text);
    console.log('[ScenePlanner] parseYamlImagePlan 结果:', JSON.stringify(yamlResult, null, 2));

    if (yamlResult && yamlResult.length > 0) {
        console.log(`%c[LLM-Service] 解析成功: ${yamlResult.length} 个图片任务`, 'color: #3ecf8e');
        return normalizeImageTasks(yamlResult);
    }

    xbLog.error('novelDrawLlm', `[LLM-Service] 解析失败，原始输出: ${text.slice(0, 500)}`, null);
    throw new LLMServiceError('无法解析 LLM 输出', 'PARSE_ERROR', { sample: text.slice(0, 300) });
}
