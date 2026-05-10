import { xbLog } from "../../../core/debug-core.js";
import { callDrawScenePlannerLlm } from "./draw-llm.js";
import { getWorldInfoPrompt } from "../../../../../../../scripts/world-info.js";
import jsyaml from "../../../libs/js-yaml.mjs";

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

function buildSessionLimitsLine(maxImages, maxCharactersPerImage) {
    const clauses = [];
    if (maxImages > 0) {
        clauses.push(`生成 ${maxImages} 项 images 数组`);
    } else if (maxCharactersPerImage > 0) {
        clauses.push('生成 images 数组');
    }
    if (maxCharactersPerImage > 0) clauses.push(`每项的 characters 最多 ${maxCharactersPerImage} 人`);
    if (!clauses.length) return '';
    return `同时，为本次 <content> 内容${clauses.join('、')}。`;
}

function appendSessionLimitsToUserConfirm(userConfirm, limitLine) {
    const baseConfirm = String(userConfirm || '').trimEnd();
    const appendedLine = String(limitLine || '').trim();
    if (!appendedLine) return baseConfirm;
    if (!baseConfirm) return appendedLine;

    const closingTagMatch = baseConfirm.match(/(\n?\s*<\/[A-Za-z0-9_:-]+>\s*)$/);
    if (!closingTagMatch) {
        return `${baseConfirm}\n${appendedLine}`;
    }

    const closingTag = closingTagMatch[1].trim();
    const prefix = baseConfirm.slice(0, baseConfirm.length - closingTagMatch[1].length).trimEnd();
    return [prefix, appendedLine, closingTag].filter(Boolean).join('\n');
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

    bottomMessages.push({
        role: 'user',
        content: promptConfig.userJsonFormat
    });

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
        content: appendSessionLimitsToUserConfirm(
            promptConfig.userConfirm,
            buildSessionLimitsLine(maxImages, maxCharactersPerImage)
        )
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

    return rawOutput;
}

function cleanYamlInput(text) {
    let normalized = String(text || '')
        .replace(/\r\n/g, '\n')
        .replace(/\t/g, '  ')
        .trim();

    if (!normalized) return '';

    const fencedBlocks = [...normalized.matchAll(/```(?:ya?ml|json)?\s*([\s\S]*?)```/gi)];
    const fencedWithImages = fencedBlocks.find((match) => /(^|\n)images:\s*(?:#.*)?(?=\n|$|\[)/i.test(match[1] || ''));
    if (fencedWithImages) {
        normalized = String(fencedWithImages[1] || '').trim();
    } else if (fencedBlocks.length > 0) {
        normalized = String(fencedBlocks[0][1] || '').trim();
    }

    normalized = normalized
        .replace(/^```(?:ya?ml|json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    const imagesMatch = normalized.match(/(^|\n)images:\s*(?:#.*)?(?=\n|$|\[)/i);
    if (imagesMatch) {
        normalized = normalized.slice((imagesMatch.index || 0) + imagesMatch[1].length);
    }

    const keptLines = [];
    const lines = normalized.split('\n');
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const trimmed = line.trim();
        if (index === 0) {
            keptLines.push(line);
            continue;
        }
        if (!trimmed) {
            keptLines.push(line);
            continue;
        }
        if (/^```/.test(trimmed)) break;
        if (/^[ \t]/.test(line)) {
            keptLines.push(line);
            continue;
        }
        break;
    }

    return keptLines.join('\n').trim();
}

function normalizeYamlScalar(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
    return '';
}

function parseYamlCharacters(rawCharacters) {
    if (!Array.isArray(rawCharacters)) return [];

    return rawCharacters.map((rawChar) => {
        if (!rawChar || typeof rawChar !== 'object') return null;

        const name = normalizeYamlScalar(rawChar.name);
        if (!name) return null;

        const char = { name };
        const optionalFields = ['danbooru', 'type', 'appear', 'costume', 'action', 'interact', 'uc', 'center'];
        for (const field of optionalFields) {
            const value = normalizeYamlScalar(rawChar[field]);
            if (value) char[field] = value;
        }
        return char;
    }).filter(Boolean);
}

function parseYamlImagePlan(text) {
    let root = null;
    try {
        root = jsyaml.load(text);
    } catch (error) {
        const message = error?.message || 'YAML 格式无效';
        throw new LLMServiceError(`YAML 解析失败: ${message}`, 'PARSE_ERROR', {
            sample: text.slice(0, 300),
            yamlError: message,
        });
    }

    const rawImages = Array.isArray(root?.images)
        ? root.images
        : (Array.isArray(root) ? root : []);
    return rawImages.map((rawImage) => {
        const image = rawImage && typeof rawImage === 'object' ? rawImage : {};
        return {
            index: Number(image.index) || 0,
            anchor: normalizeYamlScalar(image.anchor),
            scene: normalizeYamlScalar(image.scene),
            negative: normalizeYamlScalar(image.negative),
            chars: parseYamlCharacters(image.characters),
            hasCharactersField: Object.prototype.hasOwnProperty.call(image, 'characters'),
        };
    });
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

    let yamlResult = [];
    try {
        yamlResult = parseYamlImagePlan(text);
    } catch (error) {
        if (error instanceof LLMServiceError) {
            xbLog.error('novelDrawLlm', `[LLM-Service] YAML 解析失败: ${error.message}`, error.details || null);
            throw error;
        }
        throw error;
    }

    if (yamlResult && yamlResult.length > 0) {
        console.log(`%c[LLM-Service] 解析成功: ${yamlResult.length} 个图片任务`, 'color: #3ecf8e');
        return normalizeImageTasks(yamlResult);
    }

    xbLog.error('novelDrawLlm', `[LLM-Service] 解析失败，原始输出: ${text.slice(0, 500)}`, null);
    throw new LLMServiceError('无法解析 LLM 输出', 'PARSE_ERROR', { sample: text.slice(0, 300) });
}
