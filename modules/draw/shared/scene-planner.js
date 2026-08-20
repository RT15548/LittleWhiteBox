import { xbLog } from '../../../core/debug-core.js';
import {
    beginDrawScenePlannerDiagnostic,
    callDrawScenePlannerAgent,
} from './draw-agent.js';
import {
    ScenePlannerError,
    createSubmitScenePlanTool,
    parseSubmittedScenePlan,
} from './scene-plan-contract.js';
import { createSceneSource, stripScenePointMarkers } from './scene-source.js';
import {
    applyPromptSlots,
    createPromptSlots,
    emitScenePromptReady,
    expandScenePromptText,
    loadScenePromptRuntime,
    spliceLiteral,
    wrapPromptExpansionError,
} from './scene-prompt-expansion.js';

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
    userContent: `Content Provider:
<content>
{{characterInfo}}
---
{{lastMessage}}
</content>`,
    sceneRules: '',
    assistantCheck: '',
    userConfirm: '',
};

export { ScenePlannerError };

export function getEffectivePromptConfig(custom, defaults = EMPTY_PROMPT_CONFIG) {
    const base = defaults && typeof defaults === 'object'
        ? { ...EMPTY_PROMPT_CONFIG, ...defaults }
        : { ...EMPTY_PROMPT_CONFIG };
    if (!custom) return base;
    const merged = { ...base };
    for (const key of Object.keys(base)) {
        if (typeof custom[key] === 'string' && custom[key].trim()) merged[key] = custom[key];
    }
    return merged;
}

export function getEffectiveTagGuide(customGuide) {
    return typeof customGuide === 'string' && customGuide.trim() ? customGuide : '';
}

export function buildCharacterInfoForLLM(presentCharacters) {
    if (!presentCharacters?.length) {
        return `【已录入角色】: 无
所有角色都是未知角色，每个角色必须包含 type + appear + costume + action + interact + uc + center`;
    }

    const lines = presentCharacters.map((character) => {
        const aliases = character.aliases?.length ? ` (别名: ${character.aliases.join(', ')})` : '';
        const type = character.type || 'girl';
        const danbooru = character.danbooruTag ? ` | danbooru: ${character.danbooruTag}` : '';
        const appear = character.appearance ? `\n  外貌参考: ${character.appearance}` : '';
        const outfits = Array.isArray(character.outfits) && character.outfits.length
            ? `\n  可选服装（仅供参考；请结合剧情自行选择最合适的一套或其变体写入 costume，可在参考基础上体现破损/敞开/滑落/湿透等状态；不要把多套服装直接拼接或混合输出）: ${character.outfits
                .filter((outfit) => outfit?.name || outfit?.tags)
                .map((outfit) => `${outfit.name || '服装'}=${outfit.tags || '未填写tag'}`)
                .join('； ')}`
            : '';
        return `- ${character.name}${aliases} [${type}]${danbooru}: 外貌已预设；提交该角色时必须使用规范 name，并将 type/appear 设为空字符串；danbooru/costume/action/interact/uc/center 仍须提交，costume 只描述本图实际穿着${appear}${outfits}`;
    });

    return `【已录入角色】（别名只用于识别，提交时改回规范名；type/appear 必须为空字符串）:
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
            .flatMap((item) => (Array.isArray(item?.entries) ? item.entries : []))
            .map((entry) => String(entry || '').trim())
            .filter(Boolean)
            .join('\n');
        pushText('酒馆世界书-深度', depthText);
    }
    pushText('酒馆世界书-后置', result?.worldInfoAfter);
    return sections;
}

async function buildNativeWorldInfoForDraw(messageText, presentCharacters, resolver) {
    try {
        let getWorldInfoPrompt = resolver;
        if (typeof getWorldInfoPrompt !== 'function') {
            ({ getWorldInfoPrompt } = await import('../../../../../../../scripts/world-info.js'));
        }
        const charNames = (presentCharacters || []).map((character) => character?.name).filter(Boolean).join(' ');
        const scanChat = [messageText, charNames].map((value) => String(value || '').trim()).filter(Boolean);
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

function buildSessionLimitsLine(maxImages, maxCharactersPerImage, insertPointCount) {
    const imageLimit = Number(maxImages) > 0 ? Math.floor(Number(maxImages)) : 0;
    const characterLimit = Number(maxCharactersPerImage) > 0
        ? Math.floor(Number(maxCharactersPerImage))
        : 0;
    const clauses = [];
    if (insertPointCount > 0) clauses.push(`本次正文共有 ${insertPointCount} 个可用插图点，编号范围为 1～${insertPointCount}`);
    if (imageLimit) clauses.push(`images 必须恰好包含 ${imageLimit} 项`);
    if (characterLimit) clauses.push(`每项 characters 最多 ${characterLimit} 人`);
    return clauses.length ? `本次提交数量约束：${clauses.join('；')}。` : '';
}

function resolveRequestedMaxImages(maxImages) {
    const requested = Number(maxImages) > 0 ? Math.floor(Number(maxImages)) : 0;
    return Math.max(0, requested);
}

function resolveEffectiveMaxImages(requested, insertPointCount) {
    if (!requested) return 0;
    return Math.min(requested, Math.max(0, Number(insertPointCount) || 0));
}

const TRAILING_CLOSING_TAG = /\n?(<\/[A-Za-z][\w-]*>)\s*$/;

/**
 * Dynamic instructions stay inside the container the top system prompt opened, so a preset
 * ending with `</Chat_History>` keeps that tag last.
 */
function appendInstruction(base, additions = []) {
    const text = String(base || '').trim();
    const extra = additions.map((item) => String(item || '').trim()).filter(Boolean);
    if (!extra.length) return text;
    if (!text) return extra.join('\n');
    const match = text.match(TRAILING_CLOSING_TAG);
    if (!match) return [text, ...extra].join('\n');
    return [text.slice(0, match.index).trimEnd(), ...extra, match[1]].filter(Boolean).join('\n');
}

function joinTaskSections(sections) {
    return sections.map((section) => String(section || '').trim()).filter(Boolean).join('\n\n');
}

async function resolveExpansionRuntime(expansionOptions = {}) {
    try {
        return expansionOptions.runtime || await loadScenePromptRuntime();
    } catch (error) {
        throw wrapPromptExpansionError(error);
    }
}

async function buildScenePlannerRequest(options = {}) {
    const {
        messageText,
        sceneSource: providedSceneSource,
        presentCharacters = [],
        useWorldInfo = false,
        customPrompts = null,
        promptDefaults = EMPTY_PROMPT_CONFIG,
        worldbookEntries = null,
        maxImages = 0,
        maxCharactersPerImage = 0,
    } = options;
    const sceneSource = providedSceneSource || createSceneSource(messageText);
    if (!String(sceneSource.content || '').trim()) {
        throw new ScenePlannerError('消息内容为空。', 'EMPTY_MESSAGE');
    }
    const insertPointCount = Array.isArray(sceneSource.points) ? sceneSource.points.length : 0;
    if (!insertPointCount) {
        throw new ScenePlannerError('正文中没有可用的插图位置。', 'NO_INSERT_POINTS');
    }
    const requestedMaxImages = resolveRequestedMaxImages(maxImages);
    const effectiveMaxImages = resolveEffectiveMaxImages(requestedMaxImages, insertPointCount);
    const imageLimitAdjustment = requestedMaxImages > effectiveMaxImages
        ? {
            requested: requestedMaxImages,
            effective: effectiveMaxImages,
            insertPointCount,
            message: `本次正文只有 ${insertPointCount} 个可用插图点，图片数量已从 ${requestedMaxImages} 张调整为 ${effectiveMaxImages} 张。`,
        }
        : null;

    const promptConfig = getEffectivePromptConfig(customPrompts, promptDefaults);
    const runtime = await resolveExpansionRuntime(options.expansionOptions);
    const slots = createPromptSlots(['tagGuide', 'worldInfo', 'characterInfo', 'lastMessage']);

    try {
        // Every dynamic value is expanded exactly once, then spliced literally into the
        // already-expanded template. Narrative text never passes through a macro pass twice
        // and never acts as a `String.replace` replacement string. The numbered content is
        // expanded as a whole so every model-visible macro resolves before placement numbering
        // is locked, while the placement map stays anchored to the unexpanded source snapshot.
        const expandedMessageText = await expandScenePromptText(sceneSource.numberedContent, runtime);
        const expandedContent = stripScenePointMarkers(expandedMessageText);
        const nativeWorldInfo = useWorldInfo
            ? await buildNativeWorldInfoForDraw(expandedContent, presentCharacters, options.worldInfoResolver)
            : '';
        const expandedWorldInfo = await expandScenePromptText(
            combineWorldInfoEntries({
                uploadedEntries: worldbookEntries,
                nativeEntries: nativeWorldInfo,
            }),
            runtime,
        );
        const expandedCharacterInfo = await expandScenePromptText(
            buildCharacterInfoForLLM(presentCharacters),
            runtime,
        );
        const expandedTagGuide = await expandScenePromptText(
            getEffectiveTagGuide(promptConfig.tagGuideContent),
            runtime,
        );

        const guideTemplate = expandedTagGuide
            ? spliceLiteral(promptConfig.assistantDoc, '{$tagGuide}', slots.tagGuide)
            : '好的，我将按照当前图像生成规范生成图像描述。';
        const worldInfoTemplate = String(promptConfig.userWorldInfo || '')
            .split('{$worldInfo}').join(slots.worldInfo)
            .split('{$WORLDINFO}').join(slots.worldInfo);
        const contentTemplate = spliceLiteral(
            spliceLiteral(promptConfig.userContent, '{{characterInfo}}', slots.characterInfo),
            '{{lastMessage}}',
            slots.lastMessage,
        );
        const finalInstruction = appendInstruction(promptConfig.userConfirm, [
            buildSessionLimitsLine(effectiveMaxImages, maxCharactersPerImage, insertPointCount),
            '完成 mindful_prelude 与全部 images 后，必须且只能调用一次 submit_scene_plan；不要只返回正文。',
        ]);

        // Terminal-submit tool calling takes a single system prompt plus one user task; no
        // synthetic multi-turn chain and no consecutive same-role messages.
        const userTaskTemplate = joinTaskSections([
            guideTemplate,
            promptConfig.assistantAskBackground,
            worldInfoTemplate,
            promptConfig.assistantAskContent,
            contentTemplate,
            promptConfig.sceneRules,
            promptConfig.assistantCheck,
            finalInstruction,
        ]);

        const slotValues = {
            [slots.tagGuide]: expandedTagGuide,
            [slots.worldInfo]: expandedWorldInfo,
            [slots.characterInfo]: expandedCharacterInfo,
            [slots.lastMessage]: expandedMessageText,
        };
        const systemPrompt = applyPromptSlots(
            await expandScenePromptText(promptConfig.topSystem || '', runtime),
            slotValues,
        ).trim();
        const userTask = applyPromptSlots(
            await expandScenePromptText(userTaskTemplate, runtime),
            slotValues,
        ).trim();

        const task = {
            systemPrompt,
            messages: [{ role: 'user', content: userTask }],
            tools: [createSubmitScenePlanTool({
                maxImages: effectiveMaxImages,
                maxCharactersPerImage,
                insertPointCount,
            })],
            toolChoice: 'required',
        };
        await emitScenePromptReady(runtime, [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...task.messages,
        ]);
        return {
            task,
            validationContext: {
                sceneSource,
                effectiveMaxImages,
                imageLimitAdjustment,
            },
        };
    } catch (error) {
        if (error instanceof ScenePlannerError) throw error;
        throw wrapPromptExpansionError(error);
    }
}

export async function buildScenePlannerTask(options = {}) {
    const request = await buildScenePlannerRequest(options);
    return request.task;
}

export async function generateAndParseScenePlan(options = {}) {
    const diagnostic = options.diagnostic || beginDrawScenePlannerDiagnostic();
    let request;
    try {
        request = await buildScenePlannerRequest(options);
    } catch (error) {
        diagnostic.fail(error, { stage: 'prompt' });
        throw error;
    }

    const task = request.task;
    const limitAdjustment = request.validationContext.imageLimitAdjustment;
    if (limitAdjustment) {
        xbLog.info('novelDrawLlm', limitAdjustment.message, limitAdjustment);
        try {
            options.onImageLimitAdjusted?.(limitAdjustment);
        } catch (error) {
            console.warn('[Draw Scene Planner] 图片数量调整提示失败:', error);
        }
    }
    const agentCaller = options.agentCaller || callDrawScenePlannerAgent;
    const parseResult = (result, providerConfig = {}) => {
        try {
            return parseSubmittedScenePlan(result, {
                sceneSource: request.validationContext.sceneSource,
                presentCharacters: options.presentCharacters,
                maxImages: request.validationContext.effectiveMaxImages,
                maxCharactersPerImage: options.maxCharactersPerImage,
                presetName: providerConfig.currentPresetName,
                provider: providerConfig.provider,
                model: providerConfig.model,
            });
        } catch (error) {
            throw error instanceof ScenePlannerError
                ? error
                : new ScenePlannerError(
                    `场景计划校验失败：${error?.message || '未知错误'}`,
                    'TOOL_ARGUMENTS_SCHEMA_INVALID',
                    null,
                    { cause: error },
                );
        }
    };
    let response;
    try {
        response = await agentCaller({
            task,
            timeout: options.timeout,
            signal: options.signal,
            diagnostic,
            ...(options.agentOptions || {}),
            validateResult: (result, context = {}) => parseResult(result, context.providerConfig),
        });
    } catch (error) {
        xbLog.error('novelDrawLlm', `Scene Planner 请求失败: ${error?.message || error}`, {
            code: error?.code,
        });
        if (error instanceof ScenePlannerError) throw error;
        const wrapped = new ScenePlannerError(
            `Scene Planner 请求失败：${error?.message || '未知错误'}`,
            'PROVIDER_REQUEST_FAILED',
            null,
            { cause: error },
        );
        diagnostic.fail(wrapped, { stage: 'request' });
        throw wrapped;
    }

    let parsed;
    try {
        parsed = response.parsed || parseResult(response.result, response.providerConfig);
    } catch (error) {
        diagnostic.fail(error, { stage: 'parse' });
        throw error;
    }

    diagnostic.succeed({ stage: 'parse', imageTaskCount: parsed.tasks.length });
    xbLog.info('novelDrawLlm', `submit_scene_plan 已接收 ${parsed.tasks.length} 个图片任务`, {
        provider: response.providerConfig?.provider,
        model: response.providerConfig?.model,
    });
    return parsed.tasks;
}
