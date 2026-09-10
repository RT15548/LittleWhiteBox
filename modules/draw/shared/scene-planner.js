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
import { createSubmitScenePlanTool } from './scene-plan-tool.js';
import { buildScenePlannerSystemPrompt, buildScenePlannerUserTask } from './scene-planner-frame.js';
import { normalizeScenePlannerProfile } from './scene-planner-profile.js';
import {
    applyPromptSlots,
    createPromptSlots,
    emitScenePromptReady,
    expandScenePromptText,
    loadScenePromptRuntime,
    wrapPromptExpansionError,
} from './scene-prompt-expansion.js';

/** User-editable prompt preset. Everything else in the request is rendered by code. */
const EMPTY_PROMPT_CONFIG = {
    topSystem: '',
    tagGuideContent: '',
    sceneRules: '',
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

/** Missing fields use defaults; explicit empty strings disable that editable section. */
export function getEffectivePromptConfig(custom, defaults = EMPTY_PROMPT_CONFIG) {
    const base = defaults && typeof defaults === 'object'
        ? { ...EMPTY_PROMPT_CONFIG, ...defaults }
        : { ...EMPTY_PROMPT_CONFIG };
    if (!custom) return base;
    const merged = { ...base };
    for (const key of Object.keys(base)) {
        if (typeof custom[key] === 'string') merged[key] = custom[key];
    }
    return merged;
}

export function getEffectiveTagGuide(customGuide) {
    return typeof customGuide === 'string' && customGuide.trim() ? customGuide : '';
}

function formatReferenceList(items, fallbackLabel) {
    return (Array.isArray(items) ? items : [])
        .filter((item) => item?.name || item?.tags)
        .map((item) => `${item.name || fallbackLabel}=${item.tags || '未填写tag'}`)
        .join('； ');
}

/** Registered characters as plain facts; what to do with them is defined by the Tool schema. */
export function buildCharacterInfoForLLM(presentCharacters) {
    if (!presentCharacters?.length) {
        return '【已录入角色】: 无';
    }

    const lines = presentCharacters.map((character) => {
        const aliases = character.aliases?.length ? `（别名: ${character.aliases.join(', ')}）` : '';
        const type = character.type || 'girl';
        const danbooru = character.danbooruTag ? ` | danbooru: ${character.danbooruTag}` : '';
        const appear = character.appearance ? `\n  外貌参考: ${character.appearance}` : '';
        const outfits = formatReferenceList(character.outfits, '服装');
        const dynamicStates = formatReferenceList(character.dynamicStates, '状态');
        return `- ${character.name}${aliases} [${type}]${danbooru}${appear}`
            + (outfits ? `\n  服装参考: ${outfits}` : '')
            + (dynamicStates ? `\n  状态参考（随剧情变化的外观，选贴合当前画面的一条融入 action）: ${dynamicStates}` : '');
    });

    return `【已录入角色】\n${lines.join('\n')}`;
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
    else if (maxPlanImages > 0) clauses.push(`images 最多包含 ${maxPlanImages} 项`);
    if (characterLimit) clauses.push(`每项 characters 最多 ${characterLimit} 人`);
    return clauses.length ? `本次提交数量约束：${clauses.join('；')}。` : '';
}

function resolveRequestedMaxImages(maxImages) {
    const requested = Number(maxImages) > 0 ? Math.floor(Number(maxImages)) : 0;
    return Math.max(0, requested);
}

function resolveEffectiveMaxCharacters(requestedLimit, absoluteLimit) {
    const requested = Number(requestedLimit) > 0 ? Math.floor(Number(requestedLimit)) : 0;
    const absolute = Number(absoluteLimit) > 0 ? Math.floor(Number(absoluteLimit)) : 0;
    if (!absolute) return requested;
    return requested ? Math.min(requested, absolute) : absolute;
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
        plannerProfile = null,
    } = options;
    const profile = normalizeScenePlannerProfile(plannerProfile);
    const centerMode = profile.centerMode === 'normalized' ? 'normalized' : 'grid';
    const sceneSource = providedSceneSource || createSceneSource(messageText);
    if (!String(sceneSource.content || '').trim()) {
        throw new ScenePlannerError('消息内容为空。', 'EMPTY_MESSAGE');
    }
    const insertPointCount = Array.isArray(sceneSource.points) ? sceneSource.points.length : 0;
    if (!insertPointCount) {
        throw new ScenePlannerError('正文中没有可用的插图位置。', 'NO_INSERT_POINTS');
    }
    const effectiveMaxImages = resolveRequestedMaxImages(maxImages);
    const requestedPlanCapacity = resolveRequestedMaxImages(maxPlanImages);
    if (requestedPlanCapacity && effectiveMaxImages > requestedPlanCapacity) {
        throw new ScenePlannerError(
            `后台画图单批最多支持 ${requestedPlanCapacity} 张；请把本次图片数调低后重试。`,
            'IMAGE_LIMIT_EXCEEDED',
        );
    }
    const effectiveMaxPlanImages = effectiveMaxImages || requestedPlanCapacity;
    const effectiveMaxCharactersPerImage = resolveEffectiveMaxCharacters(
        maxCharactersPerImage,
        absoluteMaxCharactersPerImage,
    );
    const promptConfig = getEffectivePromptConfig(customPrompts, promptDefaults);
    const runtime = await resolveExpansionRuntime(options.expansionOptions);
    const slots = createPromptSlots(['worldInfo', 'characterInfo', 'lastMessage']);

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
        const tagGuide = typeof modelGuide === 'string'
            ? modelGuide
            : getEffectiveTagGuide(promptConfig.tagGuideContent);

        const systemTemplate = buildScenePlannerSystemPrompt({
            opening: promptConfig.topSystem,
            guide: tagGuide,
            sceneRules: promptConfig.sceneRules,
            profile,
        });
        const userTaskTemplate = buildScenePlannerUserTask({
            worldInfoSlot: slots.worldInfo,
            characterInfoSlot: slots.characterInfo,
            lastMessageSlot: slots.lastMessage,
            limitsLine: buildSessionLimitsLine(
                effectiveMaxImages,
                effectiveMaxCharactersPerImage,
                insertPointCount,
                effectiveMaxPlanImages,
            ),
        });

        const slotValues = {
            [slots.worldInfo]: expandedWorldInfo,
            [slots.characterInfo]: expandedCharacterInfo,
            [slots.lastMessage]: expandedMessageText,
        };
        const systemPrompt = (await expandScenePromptText(systemTemplate, runtime)).trim();
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
            tool: createSubmitScenePlanTool({
                maxImages: effectiveMaxImages,
                maxPlanImages: effectiveMaxPlanImages,
                maxCharactersPerImage: effectiveMaxCharactersPerImage,
                insertPointCount: sceneSource.points.length,
                profile,
            }),
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
            tool: request.tool,
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
            tool: request.tool,
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
