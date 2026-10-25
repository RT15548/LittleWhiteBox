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
import { parseFieldDescriptions } from './scene-plan-descriptions.js';
import {
    buildScenePlannerContentBlock,
    buildScenePlannerFrameText,
    buildScenePlannerGuideSection,
    buildScenePlannerRulesSection,
    buildScenePlannerWorldInfoBlock,
} from './scene-planner-frame.js';
import { planScenePlannerMessages } from './scene-planner-assembly.js';
import { normalizeLayout } from './scene-planner-layout.js';
import { TOOL_PROTOCOL_MARKER, markToolProtocolMessages, stripToolProtocolMarker } from '../../agent-core/adapters/tool-protocol-marker.js';
import { resolveCustomToolDefinitions } from './custom-tools.js';
import { normalizeScenePlannerProfile } from './scene-planner-profile.js';
import { normalizePlannerRetry } from './planner-retry.js';
import { isNamedTagEnabled } from './named-tag-items.js';
import { FORM_EXCLUSIVE_NOTE } from './character-forms.js';
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
    // submit_scene_plan 字段描述覆写（JSON 字符串：{ 字段路径: 文案 }），空串 = 全部用内置文案
    fieldDescriptions: '',
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
        // 停用的条目不给 AI 看（detectPresentCharacters 已剔除；这里兜底，直接传库里条目进来的路径同样不会泄漏）。
        .filter((item) => isNamedTagEnabled(item) && (item?.name || item?.tags))
        .map((item) => `${item.name || fallbackLabel}=${item.tags || '未填写tag'}`)
        .join('； ');
}

/** 动态标签的使用规则只在角色清单开头写一次，各角色行里只列条目。 */
const DYNAMIC_TAG_LEGEND = '（动态标签参考：可叠加的额外外观，按画面选用若干条，写进 action）';

/** Registered characters as plain facts; what to do with them is defined by the Tool schema. */
export function buildCharacterInfoForLLM(presentCharacters) {
    if (!presentCharacters?.length) {
        return '【已录入角色】: 无';
    }

    let hasDynamicTags = false;
    const lines = [];
    for (const character of presentCharacters) {
        // 多形态角色（展开后相邻排列）合成一条：角色名只写一次，各形态嵌套在下面；单形态角色保持平铺。
        const multi = character.formCount > 1;
        const type = `[${character.type || 'girl'}]`;
        const danbooru = character.danbooruTag ? ` | danbooru: ${character.danbooruTag}` : '';
        const dynamicStates = formatReferenceList(character.dynamicStates, '动态标签');
        hasDynamicTags ||= Boolean(dynamicStates);
        if (!multi || character.formIndex === 0) {
            const aliases = character.aliases?.length ? `（别名: ${character.aliases.join(', ')}）` : '';
            lines.push(`- ${character.baseName ?? character.name}${aliases}${multi ? FORM_EXCLUSIVE_NOTE : ` ${type}${danbooru}`}`);
        }
        if (multi) lines.push(`  形态 ${character.formName} ${type}${danbooru}`);
        const pad = multi ? '    ' : '  ';
        const outfits = formatReferenceList(character.outfits, '服装');
        if (character.appearance) lines.push(`${pad}固定外貌: ${character.appearance}`);
        if (outfits) lines.push(`${pad}服装参考: ${outfits}`);
        if (dynamicStates) lines.push(`${pad}动态标签: ${dynamicStates}`);
    }

    return `【已录入角色】\n${hasDynamicTags ? `${DYNAMIC_TAG_LEGEND}\n` : ''}${lines.join('\n')}`;
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
    const fieldDescriptions = parseFieldDescriptions(promptConfig.fieldDescriptions);
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

        // 布局来自整份预设（customPrompts.layout）；缺省/默认布局走 legacy，请求与改造前逐字节一致。
        const { layout } = normalizeLayout(customPrompts?.layout);
        // 附带工具：代码在沙盒里读出定义；没有宿主（后台 / Node）时直接拒绝，不会运行用户代码。
        const customTools = await resolveCustomToolDefinitions(layout, options.customToolHost, { signal: options.signal });
        const plan = planScenePlannerMessages({
            layout,
            builtinTexts: {
                opening: promptConfig.topSystem,
                frame: buildScenePlannerFrameText(profile),
                guide: buildScenePlannerGuideSection(tagGuide, profile),
                rules: buildScenePlannerRulesSection(promptConfig.sceneRules),
                worldInfo: buildScenePlannerWorldInfoBlock(slots.worldInfo),
                content: buildScenePlannerContentBlock(slots.characterInfo, slots.lastMessage),
                limits: buildSessionLimitsLine(
                    effectiveMaxImages,
                    effectiveMaxCharactersPerImage,
                    insertPointCount,
                    effectiveMaxPlanImages,
                ),
            },
        });

        // 槽位值是叙事文本，不能带工具说明标记，否则适配器会把协议文本塞进用户消息。
        const withoutMarker = (text) => String(text ?? '').split(TOOL_PROTOCOL_MARKER).join('');
        const slotValues = {
            [slots.worldInfo]: withoutMarker(expandedWorldInfo),
            [slots.characterInfo]: withoutMarker(expandedCharacterInfo),
            [slots.lastMessage]: withoutMarker(expandedMessageText),
        };
        // 模板按顺序各展开一次、再替换槽位：自定义块只在模板里，永远用不到动态槽位。
        // legacy 的两条模板即使展开为空也照常保留，与改造前完全一致；其余布局丢弃展开后为空的消息。
        const rendered = [];
        for (const item of plan.templates) {
            if (!plan.legacy && !item.template) continue;
            rendered.push({
                role: item.role,
                content: applyPromptSlots(
                    await expandScenePromptText(item.template, runtime),
                    slotValues,
                ).trim(),
            });
        }

        let prompt;
        let readyMessages;
        if (plan.legacy) {
            const [system, user] = rendered;
            prompt = {
                systemPrompt: system.content,
                messages: [{ role: 'user', content: user.content }],
            };
            readyMessages = [
                ...(system.content ? [{ role: 'system', content: system.content }] : []),
                ...prompt.messages,
            ];
        } else {
            // 多消息：system 角色消息留在 messages 里按位置发送，工具说明标记就在持有 tools 块的那条 system 里。
            const messages = rendered.filter((message) => message.content);
            prompt = { systemPrompt: '', messages };
            readyMessages = stripToolProtocolMarker(markToolProtocolMessages(messages));
        }
        await emitScenePromptReady(runtime, readyMessages);
        return {
            prompt,
            tool: createSubmitScenePlanTool({
                maxImages: effectiveMaxImages,
                maxPlanImages: effectiveMaxPlanImages,
                maxCharactersPerImage: effectiveMaxCharactersPerImage,
                insertPointCount: sceneSource.points.length,
                profile,
                descriptions: fieldDescriptions,
            }),
            validationContext: {
                sceneSource,
                effectiveMaxImages,
                maxPlanImages: effectiveMaxPlanImages,
                effectiveMaxCharactersPerImage,
                centerMode,
            },
            customTools,
        };
    } catch (error) {
        if (error instanceof ScenePlannerError) throw error;
        if (error?.name === 'AbortError') throw error;
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
            ...(request.customTools.length ? { customTools: request.customTools } : {}),
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
        options.customToolHost?.dispose?.();
        diagnostic?.fail(error, { stage: 'prompt' });
        throw error;
    }
    // 只生成快照（后台任务路径）时，沙盒读完定义就关；要继续执行的调用方（generateAndParseScenePlan）自己保留宿主。
    if (options.keepCustomToolHost !== true) options.customToolHost?.dispose?.();

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
            ...(request.customTools.length ? { customTools: request.customTools } : {}),
            // 重试设置随快照冻结：后台 Draw Run 只能读到这里，与浏览器流程行为一致。
            ...(options.plannerRetry ? { retry: normalizePlannerRetry(options.plannerRetry) } : {}),
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
    try {
        const prepared = await prepareScenePlannerInput({ ...options, diagnostic, keepCustomToolHost: true });
        return await executePreparedScenePlanner(prepared, {
            customToolHost: options.customToolHost,
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
    } finally {
        options.customToolHost?.dispose?.();
    }
}
