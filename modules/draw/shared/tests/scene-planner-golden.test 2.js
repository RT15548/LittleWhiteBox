/**
 * 场景规划器请求的黄金（特征）测试。
 *
 * 目的：把“当前默认布局下发给模型的请求”逐字节钉死，供重构（块列表化、自定义块等）作安全网。
 * 基线 fixtures/scene-planner-golden.json 由重构前的未改动代码生成；本测试用同一组输入重跑并逐项比对：
 *   (a) 返回的 prompt（systemPrompt + messages）
 *   (b) 传给宏运行时 substituteParams 的字符串序列（个数与顺序都是契约；占位符盐值已归一化）
 *   (c) 发给 eventSource 的 CHAT_COMPLETION_PROMPT_READY 载荷
 *   (d) 经 OpenAICompatibleAdapter 转成的 provider 消息（tagged-json / native × gpt-4o / claude-3-5-sonnet）
 *       tagged-json 由冻结的绘图输入与当前 core 协议派生，不在绘图层冻结共享协议文案。
 *   以及 tool、validationContext、世界书解析器的入参、console.warn 记录、错误码。
 * 内置提示词 md 文件另存 sha256，防止默认文案被无意改动。
 *
 * 本测试失败 = 默认请求发生了变化。重构必须保持一致；确属有意的改动，请在评审中说明原因后再重新生成基线。
 *
 * 重新生成基线（默认关闭，仅在确认变化是有意的之后使用）：
 *   GOLDEN_UPDATE=1 node --test modules/draw/shared/tests/scene-planner-golden.test.js
 *   然后检查 git diff modules/draw/shared/tests/fixtures/scene-planner-golden.json
 *
 * 矩阵（全部输入为短的合成文本，确定性，无网络）：
 *   S 系统提示：画像(5) x 指南(3) x 规则(2) x 开场(2) = 60，其余取基准值；含适配器
 *   U 用户任务：世界书(4) x 角色(2) x 数量限制(8) = 64，画像取 nai45；含适配器
 *   X 交叉抽样：上述全部维度的完整笛卡尔积（3840 个）按混合进制序号取 idx % 29 === 7，共 133 个；不含适配器
 *   R 真实默认：真实 opening/opening-pov/scene-rules md + 各 provider 指南文件，4 画像 x 2 开场 = 8；含适配器
 *   E 边界：手写的边界/错误场景；含适配器
 * 未覆盖：SillyTavern 宿主适配器（sillytavern-openai-compatible 只是复用同一组消息构造函数）、
 *         Anthropic/Google 适配器、真实宿主宏（substituteParams 用确定性桩代替）、网络与流式。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import process from 'node:process';
import { readFile, writeFile } from 'node:fs/promises';

import { getNovelPlannerProfile } from '../../providers/novelai/novel-prompts.js';
import { SD_PLANNER_PROFILE } from '../../providers/sd-webui/sd-prompts.js';
import { COMFY_PLANNER_PROFILE } from '../../providers/comfyui/comfy-prompts.js';
import {
    OpenAICompatibleAdapter,
    buildNativeMessages,
    buildTaggedMessages,
} from '../../../agent-core/adapters/openai-compatible.js';
import { prepareScenePlannerInput } from '../scene-planner.js';
import { createPreparedScenePlannerTask } from '../scene-planner-executor.js';
import { createSceneSource } from '../scene-source.js';
import { markToolProtocolMessages } from '../../../agent-core/adapters/tool-protocol-marker.js';

const FIXTURE_URL = new URL('./fixtures/scene-planner-golden.json', import.meta.url);
const UPDATE_MODE = process.env.GOLDEN_UPDATE === '1';

const FAILURE_HEADER = [
    '【黄金测试失败】默认场景规划请求与基线不一致。',
    '这意味着“默认布局下发给模型的请求”发生了变化（重构应保持逐字节一致）。',
    '若变化确属有意：先在评审中说明原因，再用 GOLDEN_UPDATE=1 重新生成 fixtures/scene-planner-golden.json。',
].join('\n');

// 内置提示词文件：路径相对仓库根，值相对本文件
const PROMPT_FILES = {
    'modules/draw/shared/prompts/opening.md': '../prompts/opening.md',
    'modules/draw/shared/prompts/opening-pov.md': '../prompts/opening-pov.md',
    'modules/draw/shared/prompts/scene-rules.md': '../prompts/scene-rules.md',
    'modules/draw/providers/novelai/TAG编写指南-V4.5.md': '../../providers/novelai/TAG编写指南-V4.5.md',
    'modules/draw/providers/novelai/提示词编写指南-V5.md': '../../providers/novelai/提示词编写指南-V5.md',
    'modules/draw/providers/sd-webui/SD_TAG编写指南.md': '../../providers/sd-webui/SD_TAG编写指南.md',
    'modules/draw/providers/comfyui/COMFY_TAG编写指南.md': '../../providers/comfyui/COMFY_TAG编写指南.md',
};

// ───────────────────────── 合成输入 ─────────────────────────

const PROFILES = {
    nai45: getNovelPlannerProfile('nai-diffusion-4-5-full'),
    nai5: getNovelPlannerProfile('nai-diffusion-5-full'),
    sd: SD_PLANNER_PROFILE,
    comfy: COMFY_PLANNER_PROFILE,
    bare: null,
};
const SYN_OPENING = '你是画面规划助手，服务于{{user}}。';
const SYN_GUIDE = '# 测试指南\n- 用 {{char}} 的外貌写 tag。\n- 示例 1.3::tag::';
const SYN_RULES = '- 每图只描述一个瞬间。\n- 字面量 $& 与 $1 保持原样。';
const GUIDES = { absent: '', present: SYN_GUIDE, whitespace: '  \n\t  ' };
const RULES = { off: '', on: SYN_RULES };
const OPENINGS = { normal: SYN_OPENING, empty: '' };
const SCENE_TEXT = '雨声停了。{{user}}推开门，抱住了{{char}}。夜还很长。';
const UPLOADED_WORLDBOOK = '旅馆门廊使用暖色灯。\n{{user}} 的房间在二楼。 ';
const CHAR_A = {
    name: '阿璃',
    aliases: ['小璃', 'Ali'],
    type: 'girl',
    danbooruTag: 'ali_(original)',
    appearance: 'silver hair, blue eyes',
    outfits: [{ name: '白裙', tags: 'white dress' }, { name: '睡衣', tags: 'pajamas' }],
    dynamicStates: [{ name: '害羞', tags: 'blush, embarrassed' }],
};
const LIMITS = [[0, 0, 0], [0, 0, 5], [0, 3, 0], [0, 3, 5], [2, 0, 0], [2, 0, 5], [2, 3, 0], [2, 3, 5]];
const BASE_LIMITS = [2, 3, 0];
const WI_AXIS = ['none', 'uploaded', 'native', 'both'];
const MODEL_MODES = [
    ['gpt-4o', 'tagged-json'],
    ['gpt-4o', 'native'],
    ['claude-3-5-sonnet', 'tagged-json'],
    ['claude-3-5-sonnet', 'native'],
];
const PROVIDER_CONFIG = { provider: 'openai-compatible', model: 'golden-model' };

// 宏桩：确定性地展开几个常见宏，让“哪段文本被展开过几次”能从结果里看出来
const MACRO_TABLE = {
    '{{user}}': '〈用户〉',
    '{{char}}': '〈角色〉',
    '{{persona}}': '〈人设〉',
    '{{description}}': '〈场景描述〉',
};

function expandMacros(text) {
    let out = String(text);
    for (const [macro, value] of Object.entries(MACRO_TABLE)) out = out.split(macro).join(value);
    return out;
}

// 占位符盐值含时间戳，记录前归一化，否则基线不可复现
function normalizeSlotSalt(text) {
    return String(text).replace(/(\u2063XBDRAWSLOT_[A-Za-z]+_)[0-9a-z]+(?=\u2063)/g, '$1<SALT>');
}

function sha256(text) {
    return createHash('sha256').update(text, 'utf8').digest('hex');
}

// ───────────────────────── 矩阵定义 ─────────────────────────

function limitsId(limits) {
    return limits.join('-');
}

function baseSpec(patch = {}) {
    return {
        profile: 'nai45', guide: 'present', rules: 'on', opening: 'normal',
        wi: 'both', chars: 'one', limits: BASE_LIMITS, adapter: false, ...patch,
    };
}

function* fullProduct() {
    const profiles = Object.keys(PROFILES);
    for (const profile of profiles) {
        for (const guide of Object.keys(GUIDES)) {
            for (const rules of Object.keys(RULES)) {
                for (const opening of Object.keys(OPENINGS)) {
                    for (const wi of WI_AXIS) {
                        for (const chars of ['none', 'one']) {
                            for (const limits of LIMITS) {
                                yield { profile, guide, rules, opening, wi, chars, limits };
                            }
                        }
                    }
                }
            }
        }
    }
}

function edgeSpecs() {
    const E = (name, patch) => baseSpec({ id: `E|${name}`, group: 'E', adapter: true, ...patch });
    const history = [
        { is_user: true, name: '玩家', mes: '你好呀' },
        { is_user: false, name: '', mes: '世界回应你。' },
    ];
    return [
        E('narrative-replacement-tokens', {
            message: '她低声说：$& 与 $` 与 $\' 与 $1 与 $$，然后离开。',
            options: { worldbookEntries: '暗巷里有 $& 记号。\n$` $\' $$' },
            characters: [{ ...CHAR_A, appearance: '$& hair $1' }],
        }),
        E('crlf-input', {
            message: '第一句。\r\n第二句！\r\n\r\n第三句？',
            options: { worldbookEntries: 'A行\r\nB行' },
        }),
        E('history-placeholder', {
            message: '{$history2}\n接着发生了什么。',
            runtime: { chat: history, name1: '玩家', name2: '角色卡' },
        }),
        E('getvar-passes', {
            message: '数值[[V1]]。YAML[[V2]]。',
            runtime: { getvar: true },
            options: { promptDefaults: { topSystem: '开场[[V1]]', tagGuideContent: '', sceneRules: '' } },
        }),
        E('literal-slot-like-text', {
            message: '她写下“{{lastMessage}}”与“{{characterInfo}}”与“{$worldInfo}”。',
        }),
        E('provided-scene-source', {
            options: { messageText: undefined, sceneSource: createSceneSource('预设来源。第二句。') },
        }),
        E('message-with-image-markers', { message: '她笑了。[image: slot_1] 然后走了。' }),
        E('model-guide-string', { options: { modelGuide: '模型专属指南' } }),
        E('model-guide-empty', { options: { modelGuide: '' } }),
        E('model-guide-whitespace', { options: { modelGuide: '  \n ' } }),
        E('model-guide-null-fallback', { options: { modelGuide: null } }),
        E('custom-prompts-override', {
            options: {
                customPrompts: {
                    topSystem: '自定义开场',
                    tagGuideContent: '自定义指南',
                    sceneRules: '自定义规则',
                    fieldDescriptions: '{"images[].scene":"自定义 scene 说明"}',
                },
            },
        }),
        E('custom-prompts-cleared', {
            options: { customPrompts: { topSystem: '', tagGuideContent: '', sceneRules: '' } },
        }),
        E('custom-prompts-nonstring-ignored', {
            options: { customPrompts: { topSystem: null, tagGuideContent: 5, sceneRules: undefined } },
        }),
        E('no-prompt-defaults', { options: { promptDefaults: undefined } }),
        E('opening-and-rules-whitespace-only', {
            options: { promptDefaults: { topSystem: '  \n ', tagGuideContent: '', sceneRules: ' \t\n' } },
        }),
        E('sections-padded-with-whitespace', {
            options: {
                promptDefaults: {
                    topSystem: '\n\n  开场（前后有空白）  \n\n',
                    tagGuideContent: '\n  指南正文  \n',
                    sceneRules: '\n  规则正文  \n\n',
                },
            },
        }),
        E('native-wi-empty-result', { wi: 'native', resolver: 'empty' }),
        E('native-wi-throws', { wi: 'native', resolver: 'throws' }),
        E('uploaded-wi-whitespace-only', { wi: 'none', options: { worldbookEntries: '  \n ' } }),
        E('two-characters-sparse', {
            characters: [
                CHAR_A,
                {
                    name: '路人',
                    type: 'boy',
                    outfits: [{ tags: 'only-tags' }, { name: '仅名称' }, {}],
                    dynamicStates: [{ tags: 'state-tags' }],
                },
            ],
        }),
        E('character-without-name', { characters: [{ type: 'girl', appearance: 'no name' }] }),
        E('no-prompt-ready-event', { runtime: { noEvent: true } }),
        E('prompt-ready-emit-throws', { runtime: { emitThrows: true } }),
        E('runtime-without-substitute-params', { runtime: { noSubstitute: true } }),
        E('limits-absolute-cap', { limits: [2, 30, 0], options: { absoluteMaxCharactersPerImage: 22 } }),
        E('limits-absolute-only', { limits: [2, 0, 0], options: { absoluteMaxCharactersPerImage: 5 } }),
        E('limits-requested-below-cap', { limits: [2, 3, 0], options: { absoluteMaxCharactersPerImage: 22 } }),
        E('limits-fractional', { limits: [2.7, 3.9, 0] }),
        E('limits-negative', { limits: [-1, -2, -3] }),
        E('limits-numeric-strings', { limits: ['2', '3', '5'] }),
        E('error-empty-message', { message: '  \n ' }),
        E('error-no-insert-points', {
            options: { messageText: undefined, sceneSource: { content: '没有插图点', numberedContent: '没有插图点', points: [] } },
        }),
        E('error-image-limit-exceeded', { limits: [3, 0, 2] }),
        E('error-macro-throws', { runtime: { substituteThrows: true } }),
    ];
}

function buildMatrix() {
    const specs = [];
    // S：系统提示相关轴的笛卡尔积
    for (const profile of Object.keys(PROFILES)) {
        for (const guide of Object.keys(GUIDES)) {
            for (const rules of Object.keys(RULES)) {
                for (const opening of Object.keys(OPENINGS)) {
                    specs.push(baseSpec({
                        id: `S|${profile}|g=${guide}|r=${rules}|o=${opening}`,
                        group: 'S', profile, guide, rules, opening, wi: 'none', chars: 'none', adapter: true,
                    }));
                }
            }
        }
    }
    // U：用户任务相关轴的笛卡尔积
    for (const wi of WI_AXIS) {
        for (const chars of ['none', 'one']) {
            for (const limits of LIMITS) {
                specs.push(baseSpec({
                    id: `U|wi=${wi}|ch=${chars}|L=${limitsId(limits)}`,
                    group: 'U', wi, chars, limits, adapter: true,
                }));
            }
        }
    }
    // X：完整笛卡尔积的系统抽样（固定步长 29、偏移 7，确定性）
    let index = 0;
    for (const combo of fullProduct()) {
        if (index % 29 === 7) {
            specs.push(baseSpec({
                ...combo,
                id: `X|${combo.profile}|g=${combo.guide}|r=${combo.rules}|o=${combo.opening}`
                    + `|wi=${combo.wi}|ch=${combo.chars}|L=${limitsId(combo.limits)}`,
                group: 'X',
            }));
        }
        index += 1;
    }
    // R：真实默认提示词文件
    for (const profile of ['nai45', 'nai5', 'sd', 'comfy']) {
        for (const opening of ['normal', 'pov']) {
            specs.push(baseSpec({
                id: `R|${profile}|opening=${opening}`,
                group: 'R', profile, real: opening, adapter: true,
            }));
        }
    }
    specs.push(...edgeSpecs());
    return specs;
}

// ───────────────────────── 运行单个用例 ─────────────────────────

let realPromptsPromise = null;
function loadRealPrompts() {
    realPromptsPromise ||= (async () => {
        const read = (relative) => readFile(new URL(relative, import.meta.url), 'utf8');
        const [opening, openingPov, sceneRules, nai45, nai5, sd, comfy] = await Promise.all([
            read('../prompts/opening.md'),
            read('../prompts/opening-pov.md'),
            read('../prompts/scene-rules.md'),
            read('../../providers/novelai/TAG编写指南-V4.5.md'),
            read('../../providers/novelai/提示词编写指南-V5.md'),
            read('../../providers/sd-webui/SD_TAG编写指南.md'),
            read('../../providers/comfyui/COMFY_TAG编写指南.md'),
        ]);
        return { opening, openingPov, sceneRules, guides: { nai45, nai5, sd, comfy } };
    })();
    return realPromptsPromise;
}

function createRecorder(spec) {
    const log = { substitute: [], emits: [], resolverCalls: [], warnings: [] };
    const flags = spec.runtime || {};
    const runtime = {};
    if (flags.chat) {
        runtime.chat = flags.chat;
        runtime.name1 = flags.name1;
        runtime.name2 = flags.name2;
    }
    if (flags.getvar) {
        runtime.replaceXbGetVarInString = (text) => text.split('[[V1]]').join('变量一');
        runtime.replaceXbGetVarYamlInString = (text) => text.split('[[V2]]').join('变量二');
    }
    if (!flags.noSubstitute) {
        runtime.substituteParams = (text) => {
            log.substitute.push(normalizeSlotSalt(text));
            if (flags.substituteThrows) throw new Error('宏解析炸了');
            return expandMacros(text);
        };
    }
    if (!flags.noEvent) {
        runtime.promptReadyEvent = 'CHAT_COMPLETION_PROMPT_READY';
        runtime.eventSource = {
            emit: async (event, payload) => {
                log.emits.push({ event, payload: JSON.parse(JSON.stringify(payload)) });
                if (flags.emitThrows) throw new Error('emit 炸了');
            },
        };
    }
    return { runtime, log };
}

const DEFAULT_RESOLVER_RESULT = {
    worldInfoBefore: '雨城终年潮湿。',
    worldInfoDepth: [{ entries: ['深度条目A', ' 深度条目B ', ''] }, { entries: ['深度条目C'] }, {}],
    worldInfoAfter: '后置：{{char}}',
};

async function buildOptions(spec, log, runtime) {
    let promptDefaults;
    let modelGuide;
    if (spec.real) {
        const real = await loadRealPrompts();
        promptDefaults = {
            topSystem: spec.real === 'pov' ? real.openingPov : real.opening,
            topSystemPov: real.openingPov,
            sceneRules: real.sceneRules,
        };
        // 与生产一致：NovelAI 经 modelGuide 注入指南，SD/Comfy 经 promptDefaults.tagGuideContent
        if (spec.profile.startsWith('nai')) modelGuide = real.guides[spec.profile];
        else promptDefaults.tagGuideContent = real.guides[spec.profile];
    } else {
        promptDefaults = {
            topSystem: OPENINGS[spec.opening],
            tagGuideContent: GUIDES[spec.guide],
            sceneRules: RULES[spec.rules],
        };
    }
    const [maxImages, maxCharactersPerImage, maxPlanImages] = spec.limits;
    const useNative = spec.wi === 'native' || spec.wi === 'both';
    const useUploaded = spec.wi === 'uploaded' || spec.wi === 'both';
    const resolver = async (...args) => {
        log.resolverCalls.push(JSON.parse(JSON.stringify(args)));
        if (spec.resolver === 'throws') throw new Error('世界书炸了');
        if (spec.resolver === 'empty') return {};
        return DEFAULT_RESOLVER_RESULT;
    };
    return {
        messageText: spec.message ?? SCENE_TEXT,
        presentCharacters: spec.characters ?? (spec.chars === 'one' ? [CHAR_A] : []),
        useWorldInfo: useNative,
        worldInfoResolver: resolver,
        worldbookEntries: useUploaded ? UPLOADED_WORLDBOOK : null,
        promptDefaults,
        ...(modelGuide === undefined ? {} : { modelGuide }),
        maxImages,
        maxCharactersPerImage,
        maxPlanImages,
        plannerProfile: PROFILES[spec.profile],
        expansionOptions: { runtime },
        agentOptions: { providerConfig: PROVIDER_CONFIG },
        ...spec.options,
    };
}

function captureAdapterOutputs(task, snapshotTool) {
    const outputs = {};
    for (const [model, toolMode] of MODEL_MODES) {
        const adapter = new OpenAICompatibleAdapter({
            provider: 'openai-compatible',
            model,
            toolMode,
            apiKey: 'golden-key',
            baseUrl: 'http://127.0.0.1:1/v1',
        });
        const body = adapter.buildRequestBody(task);
        const direct = toolMode === 'tagged-json'
            ? buildTaggedMessages(task, model)
            : buildNativeMessages(task, model);
        outputs[`${model}/${toolMode}`] = {
            bodyKeys: Object.keys(body),
            messages: body.messages,
            toolChoice: body.tool_choice ?? null,
            nativeToolsMatchSnapshot: toolMode === 'native'
                ? JSON.stringify(body.tools) === JSON.stringify([snapshotTool])
                : null,
            exportedBuilderMatchesBody: JSON.stringify(direct) === JSON.stringify(body.messages),
        };
    }
    return outputs;
}

async function runCase(spec) {
    const { runtime, log } = createRecorder(spec);
    const options = await buildOptions(spec, log, runtime);
    const originalWarn = console.warn;
    console.warn = (...args) => {
        log.warnings.push(args.map((arg) => (arg instanceof Error ? arg.message : String(arg))).join(' '));
    };
    const record = {};
    try {
        const snapshot = await prepareScenePlannerInput(options);
        const task = createPreparedScenePlannerTask(snapshot);
        record.ok = true;
        record.prompt = snapshot.planner.prompt;
        record.taskMatchesPrompt = task.systemPrompt === snapshot.planner.prompt.systemPrompt
            && JSON.stringify(task.messages.map(({ role, content }) => ({ role, content }))) === JSON.stringify(snapshot.planner.prompt.messages);
        record.toolChoice = task.toolChoice;
        record.tool = snapshot.planner.tool;
        record.validationContext = snapshot.planner.validationContext;
        if (spec.adapter) record.adapter = captureAdapterOutputs(task, snapshot.planner.tool);
    } catch (error) {
        record.ok = false;
        record.errorCode = error?.code ?? null;
        record.errorMessage = String(error?.message ?? error);
    } finally {
        console.warn = originalWarn;
    }
    record.substituteCalls = log.substitute;
    record.promptReady = log.emits;
    record.resolverCalls = log.resolverCalls;
    record.warnings = log.warnings;
    // 去掉 undefined，使其与读回的 JSON 同构
    return JSON.parse(JSON.stringify(record));
}

// ───────────────────────── 基线的压缩/还原 ─────────────────────────
// 长字符串按内容哈希去重存入 texts；tool 与 validationContext 存入 objects。哈希是内容的函数，生成顺序不影响 diff。

const MIN_REF_LENGTH = 60;

function shortKey(content) {
    return sha256(content).slice(0, 12);
}

function deflate(value, tables) {
    if (typeof value === 'string') {
        if (value.length < MIN_REF_LENGTH) return value;
        const key = shortKey(value);
        tables.texts[key] = value;
        return { $t: key };
    }
    if (Array.isArray(value)) return value.map((item) => deflate(item, tables));
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, deflate(item, tables)]));
    }
    return value;
}

function deflateRecord(record, tables) {
    const { tool, validationContext, ...rest } = record;
    const out = deflate(rest, tables);
    for (const [name, object] of [['tool', tool], ['validationContext', validationContext]]) {
        if (object === undefined) continue;
        const key = shortKey(JSON.stringify(object));
        tables.objects[key] = object;
        out[name] = { $o: key };
    }
    return out;
}

function inflate(value, tables) {
    if (Array.isArray(value)) return value.map((item) => inflate(item, tables));
    if (value && typeof value === 'object') {
        if (typeof value.$t === 'string') {
            assert.ok(Object.hasOwn(tables.texts, value.$t), `基线损坏：缺少文本 ${value.$t}`);
            return tables.texts[value.$t];
        }
        if (typeof value.$o === 'string') {
            assert.ok(Object.hasOwn(tables.objects, value.$o), `基线损坏：缺少对象 ${value.$o}`);
            return tables.objects[value.$o];
        }
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, inflate(item, tables)]));
    }
    return value;
}

// ───────────────────────── 逐项比对 ─────────────────────────

function snippet(text, index) {
    return JSON.stringify(text.slice(Math.max(0, index - 30), index + 50));
}

function diffValues(expected, actual, path, out) {
    if (out.length >= 12) return;
    if (typeof expected === 'string' && typeof actual === 'string') {
        if (expected === actual) return;
        let index = 0;
        while (index < expected.length && index < actual.length && expected[index] === actual[index]) index += 1;
        out.push(`${path}: 字符串不同（期望长度 ${expected.length}，实际 ${actual.length}，首个差异在 ${index}）\n`
            + `    期望 …${snippet(expected, index)}\n    实际 …${snippet(actual, index)}`);
        return;
    }
    if (Array.isArray(expected) && Array.isArray(actual)) {
        if (expected.length !== actual.length) {
            out.push(`${path}: 数组长度不同（期望 ${expected.length}，实际 ${actual.length}）`);
        }
        const shared = Math.min(expected.length, actual.length);
        for (let index = 0; index < shared; index += 1) diffValues(expected[index], actual[index], `${path}[${index}]`, out);
        return;
    }
    if (expected && actual && typeof expected === 'object' && typeof actual === 'object'
        && !Array.isArray(expected) && !Array.isArray(actual)) {
        for (const key of new Set([...Object.keys(expected), ...Object.keys(actual)])) {
            if (!Object.hasOwn(actual, key)) out.push(`${path}.${key}: 实际结果缺少该字段`);
            else if (!Object.hasOwn(expected, key)) out.push(`${path}.${key}: 实际结果多出该字段`);
            else diffValues(expected[key], actual[key], `${path}.${key}`, out);
        }
        return;
    }
    if (expected !== actual) {
        out.push(`${path}: 期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`);
    }
}

// ───────────────────────── 基线读写 ─────────────────────────

async function hashPromptFiles() {
    const files = {};
    for (const [repoPath, relative] of Object.entries(PROMPT_FILES)) {
        // 统一换行再哈希，避免 autocrlf 检出造成假阳性
        const text = (await readFile(new URL(relative, import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
        files[repoPath] = { sha256: sha256(text), chars: text.length };
    }
    return files;
}

let resultsPromise = null;
function getResults() {
    resultsPromise ||= (async () => {
        const specs = buildMatrix();
        const ids = new Set(specs.map((spec) => spec.id));
        assert.equal(ids.size, specs.length, '矩阵用例 id 必须唯一');
        const records = new Map();
        for (const spec of specs) records.set(spec.id, await runCase(spec));
        return { specs, records };
    })();
    return resultsPromise;
}

async function writeFixture() {
    const { specs, records } = await getResults();
    const tables = { texts: {}, objects: {} };
    const cases = {};
    for (const spec of specs) cases[spec.id] = deflateRecord(records.get(spec.id), tables);
    const sortKeys = (object) => Object.fromEntries(Object.entries(object).sort(([a], [b]) => (a < b ? -1 : 1)));
    // 每个条目单独一行：体积小，git diff 能直接定位到变化的用例/文本
    const section = (object) => `{\n${Object.entries(object)
        .map(([key, value]) => ` ${JSON.stringify(key)}: ${JSON.stringify(value)}`)
        .join(',\n')}\n}`;
    const counts = Object.fromEntries(['S', 'U', 'X', 'R', 'E'].map((group) => [
        group, specs.filter((spec) => spec.group === group).length,
    ]));
    const json = [
        '{',
        ` "_readme": ${JSON.stringify('由 scene-planner-golden.test.js 在 GOLDEN_UPDATE=1 下生成，请勿手改。diff 即“默认请求变化”。')},`,
        ` "counts": ${JSON.stringify(counts)},`,
        ` "promptFiles": ${section(await hashPromptFiles()).replace(/\n/g, '\n ')},`,
        ` "texts": ${section(sortKeys(tables.texts)).replace(/\n/g, '\n ')},`,
        ` "objects": ${section(sortKeys(tables.objects)).replace(/\n/g, '\n ')},`,
        ` "cases": ${section(cases).replace(/\n/g, '\n ')}`,
        '}',
        '',
    ].join('\n')
        // U+2063 不可见，写成转义以便 diff 可读
        .replace(/⁣/g, '\\u2063');
    await writeFile(FIXTURE_URL, json, 'utf8');
}

let fixturePromise = null;
function getFixture() {
    fixturePromise ||= readFile(FIXTURE_URL, 'utf8').then((text) => JSON.parse(text));
    return fixturePromise;
}

async function compareGroup(group) {
    const [{ specs, records }, fixture] = await Promise.all([getResults(), getFixture()]);
    const failures = [];
    let compared = 0;
    for (const spec of specs.filter((item) => item.group === group)) {
        const stored = fixture.cases[spec.id];
        if (!stored) {
            failures.push(`${spec.id}: 基线中没有该用例`);
            continue;
        }
        compared += 1;
        const out = [];
        const expected = inflate(stored, fixture);
        const actual = structuredClone(records.get(spec.id));
        // Draw owns the frozen domain inputs, not the shared protocol's wording.
        // Derive tagged messages from those inputs so domain/placement changes still fail.
        if (expected.adapter) {
            const task = {
                ...expected.prompt,
                messages: markToolProtocolMessages(expected.prompt.messages),
                tools: [expected.tool],
                toolChoice: expected.toolChoice,
            };
            for (const [model, mode] of MODEL_MODES) {
                if (mode === 'tagged-json') {
                    expected.adapter[`${model}/${mode}`].messages = buildTaggedMessages(task, model);
                }
            }
        }
        // Logs are expression, not a request contract. Current runtime reports listener failures.
        if (spec.runtime?.emitThrows) assert.ok(actual.warnings.length > 0);
        delete expected.warnings;
        delete actual.warnings;
        diffValues(expected, actual, spec.id, out);
        if (out.length) failures.push(out.join('\n  '));
    }
    assert.ok(compared > 0, `${group} 组没有可比对的用例`);
    assert.equal(
        failures.length,
        0,
        `${FAILURE_HEADER}\n\n${group} 组 ${failures.length} 个用例不一致（最多显示前 5 个）：\n${failures.slice(0, 5).join('\n\n')}`,
    );
}

// ───────────────────────── 测试 ─────────────────────────

if (UPDATE_MODE) {
    test('GOLDEN_UPDATE=1：重新生成场景规划黄金基线', async () => {
        await writeFixture();
        fixturePromise = null;
        console.log('[golden] 已写入 fixtures/scene-planner-golden.json，请检查 git diff 后再提交');
    });
}


test('黄金基线：矩阵用例与基线一一对应', async () => {
    const [{ specs }, fixture] = await Promise.all([getResults(), getFixture()]);
    const expectedIds = specs.map((spec) => spec.id).sort();
    const storedIds = Object.keys(fixture.cases).sort();
    assert.deepEqual(storedIds, expectedIds, `${FAILURE_HEADER}\n\n矩阵与基线的用例集合不一致。`);
    for (const group of Object.keys(fixture.counts)) {
        assert.equal(specs.filter((spec) => spec.group === group).length, fixture.counts[group], `${group} 组用例数`);
    }
});

test('黄金基线 S：系统提示（画像 x 指南 x 规则 x 开场）及适配器消息', async () => {
    await compareGroup('S');
});

test('黄金基线 U：用户任务（世界书 x 角色 x 数量限制）及适配器消息', async () => {
    await compareGroup('U');
});

test('黄金基线 X：全维度交叉抽样', async () => {
    await compareGroup('X');
});

test('黄金基线 R：真实默认提示词文件', async () => {
    await compareGroup('R');
});

test('黄金基线 E：边界与错误场景', async () => {
    await compareGroup('E');
});

test('黄金基线：任务内部自洽（与 tool、适配器导出构造函数一致）', async () => {
    const { records } = await getResults();
    let withAdapter = 0;
    for (const [id, record] of records) {
        if (!record.ok) continue;
        assert.equal(record.taskMatchesPrompt, true, `${id}: task 与 prompt 不一致`);
        assert.equal(record.toolChoice, 'required', `${id}: toolChoice`);
        for (const [mode, output] of Object.entries(record.adapter || {})) {
            withAdapter += 1;
            assert.equal(output.exportedBuilderMatchesBody, true, `${id} ${mode}: 导出的消息构造函数与 buildRequestBody 不一致`);
        }
    }
    assert.ok(withAdapter > 0);
});
