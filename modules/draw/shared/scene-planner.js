import { xbLog } from '../../../core/debug-core.js';
import {
    beginDrawScenePlannerDiagnostic,
    callDrawScenePlannerAgent,
    resolveDrawAgentProviderConfig,
} from './draw-agent.js';
import {
    ScenePlannerError,
} from './scene-plan-contract.js';
import {
    createPreparedScenePlannerTask,
    executePreparedScenePlanner,
} from './scene-planner-executor.js';
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

function createSerializableSnapshot(value) {
    try {
        const serialized = JSON.stringify(value);
        if (serialized === undefined) throw new TypeError('结果为空');
        return JSON.parse(serialized);
    } catch (error) {
        throw new ScenePlannerError(
            `Scene Planner 预处理结果无法序列化：${error?.message || '未知错误'}`,
            'PREPARED_INPUT_INVALID',
            null,
            { cause: error },
        );
    }
}

export { ScenePlannerError };
export { executePreparedScenePlanner };

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
所有角色都是未知角色；每个角色必须提交 name + type + appear + action。danbooru/costume/interact/uc/center 仅在有对应事实时提交。`;
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
        const dynamicStates = Array.isArray(character.dynamicStates) && character.dynamicStates.length
            ? `\n  动态外貌参考（会随剧情变化的外观状态，仅供参考；请结合当前场景选用最贴切的一条或其变体融入 action 等本图状态描述；不要同时堆叠多条互斥状态）: ${character.dynamicStates
                .filter((state) => state?.name || state?.tags)
                .map((state) => `${state.name || '状态'}=${state.tags || '未填写tag'}`)
                .join('； ')}`
            : '';
        return `- ${character.name}${aliases} [${type}]${danbooru}: 外貌已预设；提交该角色时必须使用规范 name 与 action，不要提交 type/appear；danbooru/costume/interact/uc/center 仅在有对应事实时提交，costume 只描述本图实际穿着${appear}${outfits}${dynamicStates}`;
    });

    return `【已录入角色】（别名只用于识别，提交时改回规范名；不要提交 type/appear）:
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

function buildSessionLimitsLine(maxImages, maxCharactersPerImage, insertPointCount, maxPlanImages) {
    const imageLimit = Number(maxImages) > 0 ? Math.floor(Number(maxImages)) : 0;
    const characterLimit = Number(maxCharactersPerImage) > 0
        ? Math.floor(Number(maxCharactersPerImage))
        : 0;
    const clauses = [];
    if (insertPointCount > 0) clauses.push(`本次正文共有 ${insertPointCount} 个可用插图点，编号范围为 1～${insertPointCount}`);
    if (imageLimit) clauses.push(`images 必须恰好包含 ${imageLimit} 项`);
    else if (maxPlanImages > 0 && maxPlanImages < insertPointCount) clauses.push(`images 最多包含 ${maxPlanImages} 项`);
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

function resolveEffectiveMaxCharacters(requestedLimit, absoluteLimit) {
    const requested = Number(requestedLimit) > 0 ? Math.floor(Number(requestedLimit)) : 0;
    const absolute = Number(absoluteLimit) > 0 ? Math.floor(Number(absoluteLimit)) : 0;
    if (!absolute) return requested;
    return requested ? Math.min(requested, absolute) : absolute;
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
        maxPlanImages = 0,
        maxCharactersPerImage = 0,
        absoluteMaxCharactersPerImage = 0,
        modelGuide = null,
        modelContract = '',
        centerMode = 'grid',
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
    const requestedPlanCapacity = resolveRequestedMaxImages(maxPlanImages);
    const effectiveMaxImages = resolveEffectiveMaxImages(requestedMaxImages, insertPointCount);
    if (requestedPlanCapacity && effectiveMaxImages > requestedPlanCapacity) {
        throw new ScenePlannerError(
            `后台画图单批最多支持 ${requestedPlanCapacity} 张；请把本次图片数调低后重试。`,
            'IMAGE_LIMIT_EXCEEDED',
        );
    }
    const effectiveMaxPlanImages = effectiveMaxImages || Math.min(
        insertPointCount,
        requestedPlanCapacity || insertPointCount,
    );
    const effectiveMaxCharactersPerImage = resolveEffectiveMaxCharacters(
        maxCharactersPerImage,
        absoluteMaxCharactersPerImage,
    );
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
            typeof modelGuide === 'string'
                ? modelGuide
                : getEffectiveTagGuide(promptConfig.tagGuideContent),
            runtime,
        );
        const expandedModelContract = modelContract
            ? await expandScenePromptText(modelContract, runtime)
            : '';

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
            buildSessionLimitsLine(
                effectiveMaxImages,
                effectiveMaxCharactersPerImage,
                insertPointCount,
                effectiveMaxPlanImages,
            ),
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
            expandedModelContract,
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

        const prompt = {
            systemPrompt,
            messages: [{ role: 'user', content: userTask }],
        };
        await emitScenePromptReady(runtime, [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...prompt.messages,
        ]);
        return {
            prompt,
            imageLimitAdjustment,
            validationContext: {
                sceneSource,
                effectiveMaxImages,
                maxPlanImages: effectiveMaxPlanImages,
                effectiveMaxCharactersPerImage,
                centerMode,
            },
        };
    } catch (error) {
        if (error instanceof ScenePlannerError) throw error;
        throw wrapPromptExpansionError(error);
    }
}

export async function buildScenePlannerTask(options = {}) {
    const request = await buildScenePlannerRequest(options);
    return createPreparedScenePlannerTask({
        version: 1,
        planner: {
            prompt: request.prompt,
            validationContext: request.validationContext,
            presentCharacters: Array.isArray(options.presentCharacters) ? options.presentCharacters : [],
        },
        agent: { channel: '', providerConfig: null },
    });
}

export async function prepareScenePlannerInput(options = {}) {
    const diagnostic = options.diagnostic;
    let request;
    try {
        request = await buildScenePlannerRequest(options);
    } catch (error) {
        diagnostic?.fail(error, { stage: 'prompt' });
        throw error;
    }

    if (request.imageLimitAdjustment) {
        xbLog.info(
            'novelDrawLlm',
            request.imageLimitAdjustment.message,
            request.imageLimitAdjustment,
        );
        try {
            options.onImageLimitAdjusted?.(request.imageLimitAdjustment);
        } catch (error) {
            console.warn('[Draw Scene Planner] 图片数量调整提示失败:', error);
        }
    }

    let providerConfig = options.agentOptions?.providerConfig || null;
    if (!providerConfig && !options.agentCaller) {
        try {
            ({ providerConfig } = await resolveDrawAgentProviderConfig({
                timeout: options.timeout,
                ...(options.agentOptions || {}),
            }));
        } catch (error) {
            diagnostic?.fail(error, { stage: 'config' });
            throw error;
        }
    }

    return createSerializableSnapshot({
        version: 1,
        planner: {
            prompt: request.prompt,
            validationContext: request.validationContext,
            presentCharacters: Array.isArray(options.presentCharacters) ? options.presentCharacters : [],
        },
        agent: {
            channel: String(providerConfig?.provider || ''),
            providerConfig,
        },
    });
}

export async function generateAndParseScenePlan(options = {}) {
    const diagnostic = options.diagnostic
        || beginDrawScenePlannerDiagnostic({}, options.onDiagnosticUpdate);
    const prepared = await prepareScenePlannerInput({ ...options, diagnostic });
    return executePreparedScenePlanner(prepared, {
        timeout: options.timeout,
        signal: options.signal,
        diagnostic,
        onDiagnosticUpdate: options.onDiagnosticUpdate,
        agentCaller: options.agentCaller || callDrawScenePlannerAgent,
        agentOptions: options.agentOptions,
        agentCore: options.agentCore,
        logger: options.logger || xbLog,
        ...(Object.hasOwn(options, 'hostClient') ? { hostClient: options.hostClient } : {}),
    });
}
