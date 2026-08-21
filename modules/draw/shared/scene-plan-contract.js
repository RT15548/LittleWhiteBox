export const SUBMIT_SCENE_PLAN_TOOL_NAME = 'submit_scene_plan';

const CHARACTER_FIELDS = Object.freeze([
    'name',
    'danbooru',
    'type',
    'appear',
    'costume',
    'action',
    'interact',
    'uc',
    'center',
]);
const IMAGE_FIELDS = Object.freeze(['index', 'scene', 'characters']);
const MOMENT_FIELDS = Object.freeze([
    'moment',
    'insert_after',
    'char_count',
    'known_chars',
    'unknown_chars',
    'composition',
]);
const PRELUDE_FIELDS = Object.freeze(['user_insight', 'therapeutic_commitment', 'visual_plan']);
const VISUAL_PLAN_FIELDS = Object.freeze(['reasoning', 'moments']);
const ROOT_FIELDS = Object.freeze(['mindful_prelude', 'images']);
export const SCENE_CHARACTER_TYPES = Object.freeze([
    'girl',
    'boy',
    'woman',
    'man',
    'other',
    'no_humans',
]);
const CHARACTER_TYPES = new Set(SCENE_CHARACTER_TYPES);

export function toSceneCharacterPromptTag(value) {
    const type = String(value || '').trim().toLowerCase();
    return type === 'no_humans' ? 'no humans' : type;
}

export const ScenePlannerErrorCategory = Object.freeze({
    INPUT: 'input',
    AGENT_CONFIG: 'agent-config',
    PROMPT: 'prompt',
    TOOL_PROTOCOL: 'tool-protocol',
    SCHEMA: 'schema',
    TIMEOUT: 'timeout',
    ABORTED: 'aborted',
    PROVIDER: 'provider',
    UNKNOWN: 'unknown',
});

const AGENT_CONFIG_ERROR_CODES = new Set([
    'AGENT_CORE_LOAD_FAILED',
    'AGENT_SETTINGS_LOAD_FAILED',
    'HOST_REQUEST_HEADERS_LOAD_FAILED',
    'AGENT_PRESET_INVALID',
    'MODEL_MISSING',
    'API_KEY_MISSING',
]);
const PROMPT_ERROR_CODES = new Set([
    'PROMPT_EXPANSION_FAILED',
]);
const INPUT_ERROR_CODES = new Set([
    'EMPTY_MESSAGE',
    'NO_INSERT_POINTS',
]);
const TOOL_PROTOCOL_ERROR_CODES = new Set([
    'TOOL_CONTRACT_INVALID',
    'TOOL_CALL_MISSING',
    'TOOL_CALL_MULTIPLE',
    'TOOL_CALL_NAME_INVALID',
]);
const SCHEMA_ERROR_CODES = new Set([
    'TOOL_ARGUMENTS_INVALID_JSON',
    'TOOL_ARGUMENTS_SCHEMA_INVALID',
    'NO_IMAGE_TASKS',
    'INSERT_POINT_INVALID',
]);
const CORRECTABLE_ERROR_CODES = new Set([
    'TOOL_CALL_MISSING',
    'TOOL_CALL_MULTIPLE',
    'TOOL_CALL_NAME_INVALID',
    'TOOL_ARGUMENTS_INVALID_JSON',
    'TOOL_ARGUMENTS_SCHEMA_INVALID',
    'NO_IMAGE_TASKS',
    'INSERT_POINT_INVALID',
]);

export class ScenePlannerError extends Error {
    constructor(message, code = 'SCENE_PLANNER_ERROR', details = null, options = {}) {
        super(message, options);
        this.name = 'ScenePlannerError';
        this.code = code;
        this.details = details;
    }
}

export function getScenePlannerErrorCategory(error) {
    if (!(error instanceof ScenePlannerError)) return null;
    const code = String(error.code || '').toUpperCase();
    if (INPUT_ERROR_CODES.has(code)) return ScenePlannerErrorCategory.INPUT;
    if (AGENT_CONFIG_ERROR_CODES.has(code)) return ScenePlannerErrorCategory.AGENT_CONFIG;
    if (PROMPT_ERROR_CODES.has(code)) return ScenePlannerErrorCategory.PROMPT;
    if (TOOL_PROTOCOL_ERROR_CODES.has(code)) return ScenePlannerErrorCategory.TOOL_PROTOCOL;
    if (SCHEMA_ERROR_CODES.has(code)) return ScenePlannerErrorCategory.SCHEMA;
    if (code === 'REQUEST_TIMEOUT') return ScenePlannerErrorCategory.TIMEOUT;
    if (code === 'REQUEST_ABORTED') return ScenePlannerErrorCategory.ABORTED;
    if (code === 'PROVIDER_REQUEST_FAILED') return ScenePlannerErrorCategory.PROVIDER;
    return ScenePlannerErrorCategory.UNKNOWN;
}

export function isScenePlannerCorrectionError(error) {
    return error instanceof ScenePlannerError && CORRECTABLE_ERROR_CODES.has(error.code);
}

function getCorrectionInstruction(code) {
    switch (code) {
        case 'TOOL_CALL_MISSING':
            return '你没有调用 Tool。请只调用一次 submit_scene_plan，并提交完整计划。';
        case 'TOOL_CALL_MULTIPLE':
            return '你调用了多个 Tool。请合并为完整计划，并只调用一次 submit_scene_plan。';
        case 'TOOL_CALL_NAME_INVALID':
            return '你调用了错误的 Tool。请只调用 submit_scene_plan。';
        default:
            return 'submit_scene_plan 参数未通过校验。请按错误位置修正后重新提交完整计划。';
    }
}

function normalizeCorrectionDetails(details) {
    if (!details || typeof details !== 'object' || Array.isArray(details)) return null;
    const normalized = {};
    for (const key of ['path', 'rule', 'received', 'expected']) {
        if (Object.prototype.hasOwnProperty.call(details, key)) normalized[key] = details[key];
    }
    return Object.keys(normalized).length ? normalized : null;
}

export function createScenePlannerCorrectionResult(error) {
    const code = String(error?.code || 'TOOL_ARGUMENTS_SCHEMA_INVALID');
    const details = normalizeCorrectionDetails(error?.details);
    return {
        ok: false,
        error: {
            code,
            message: String(error?.message || '场景计划校验失败。'),
            ...(details ? { details } : {}),
        },
        instruction: getCorrectionInstruction(code),
    };
}

export function getScenePlannerCorrectionSignature(error) {
    const details = normalizeCorrectionDetails(error?.details) || {};
    return JSON.stringify({
        code: String(error?.code || ''),
        path: String(details.path || ''),
        rule: String(details.rule || ''),
    });
}

function normalizeLimit(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : 0;
}

function stringSchema({ minLength = 0 } = {}) {
    return {
        type: 'string',
        ...(minLength > 0 ? { minLength } : {}),
    };
}

export function createSubmitScenePlanTool(options = {}) {
    const maxImages = normalizeLimit(options.maxImages);
    const maxCharactersPerImage = normalizeLimit(options.maxCharactersPerImage);
    const insertPointCount = normalizeLimit(options.insertPointCount);
    const maxPlanItems = maxImages || insertPointCount;
    const momentsSchema = {
        type: 'array',
        minItems: maxImages || 1,
        ...(maxPlanItems ? { maxItems: maxPlanItems } : {}),
        items: {
            type: 'object',
            additionalProperties: false,
            required: [...MOMENT_FIELDS],
            properties: {
                moment: stringSchema({ minLength: 1 }),
                insert_after: {
                    type: 'integer',
                    minimum: 1,
                    ...(insertPointCount ? { maximum: insertPointCount } : {}),
                    description: 'The numbered illustration point after which this image belongs.',
                },
                char_count: stringSchema({ minLength: 1 }),
                known_chars: {
                    type: 'array',
                    items: stringSchema({ minLength: 1 }),
                },
                unknown_chars: {
                    type: 'array',
                    items: stringSchema({ minLength: 1 }),
                },
                composition: stringSchema({ minLength: 1 }),
            },
        },
    };
    const charactersSchema = {
        type: 'array',
        ...(maxCharactersPerImage ? { maxItems: maxCharactersPerImage } : {}),
        items: {
            type: 'object',
            additionalProperties: false,
            required: [...CHARACTER_FIELDS],
            properties: {
                name: stringSchema({ minLength: 1 }),
                danbooru: stringSchema(),
                type: { type: 'string', enum: ['', ...SCENE_CHARACTER_TYPES] },
                appear: stringSchema(),
                costume: stringSchema(),
                action: stringSchema({ minLength: 1 }),
                interact: stringSchema(),
                uc: stringSchema(),
                center: { type: 'string', pattern: '^[A-E][1-5]$' },
            },
        },
    };
    const imagesSchema = {
        type: 'array',
        minItems: maxImages || 1,
        ...(maxPlanItems ? { maxItems: maxPlanItems } : {}),
        items: {
            type: 'object',
            additionalProperties: false,
            required: [...IMAGE_FIELDS],
            properties: {
                index: { type: 'integer', minimum: 1 },
                scene: stringSchema({ minLength: 1 }),
                characters: charactersSchema,
            },
        },
    };

    return {
        type: 'function',
        function: {
            name: SUBMIT_SCENE_PLAN_TOOL_NAME,
            description: 'Submit the complete mindful scene analysis and final ordered image plans for this request. Call exactly once.',
            parameters: {
                type: 'object',
                additionalProperties: false,
                required: [...ROOT_FIELDS],
                properties: {
                    mindful_prelude: {
                        type: 'object',
                        additionalProperties: false,
                        required: [...PRELUDE_FIELDS],
                        properties: {
                            user_insight: stringSchema({ minLength: 1 }),
                            therapeutic_commitment: stringSchema({ minLength: 1 }),
                            visual_plan: {
                                type: 'object',
                                additionalProperties: false,
                                required: [...VISUAL_PLAN_FIELDS],
                                properties: {
                                    reasoning: stringSchema({ minLength: 1 }),
                                    moments: momentsSchema,
                                },
                            },
                        },
                    },
                    images: imagesSchema,
                },
            },
        },
    };
}

function failSchema(path, message, value, expected = message) {
    throw new ScenePlannerError(
        `场景计划参数无效：${path} ${message}`,
        'TOOL_ARGUMENTS_SCHEMA_INVALID',
        { path, rule: message, received: value, expected },
    );
}

function assertObject(value, path) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        failSchema(path, '必须是 object', value);
    }
}

function assertExactFields(value, fields, path) {
    assertObject(value, path);
    const expected = new Set(fields);
    for (const key of Object.keys(value)) {
        if (!expected.has(key)) failSchema(`${path}.${key}`, '是不允许的字段', value[key]);
    }
    for (const key of fields) {
        if (!Object.prototype.hasOwnProperty.call(value, key)) {
            failSchema(`${path}.${key}`, '是必填字段', undefined);
        }
    }
}

function requireString(value, path, { allowEmpty = false } = {}) {
    if (typeof value !== 'string') failSchema(path, '必须是 string', value);
    const normalized = value.trim();
    if (!allowEmpty && !normalized) failSchema(path, '不能为空', value);
    return normalized;
}

function requireStringArray(value, path) {
    if (!Array.isArray(value)) failSchema(path, '必须是 array', value);
    return value.map((item, index) => requireString(item, `${path}[${index}]`));
}

function requirePositiveInteger(value, path) {
    if (!Number.isInteger(value) || value < 1) failSchema(path, '必须是大于 0 的整数', value);
    return value;
}

function validateMindfulPrelude(value, options = {}) {
    assertExactFields(value, PRELUDE_FIELDS, 'mindful_prelude');
    const visualPlan = value.visual_plan;
    assertExactFields(visualPlan, VISUAL_PLAN_FIELDS, 'mindful_prelude.visual_plan');
    if (!Array.isArray(visualPlan.moments) || !visualPlan.moments.length) {
        failSchema('mindful_prelude.visual_plan.moments', '必须是非空 array', visualPlan.moments);
    }
    const maxImages = normalizeLimit(options.maxImages);
    if (maxImages && visualPlan.moments.length !== maxImages) {
        failSchema(
            'mindful_prelude.visual_plan.moments',
            `本次必须恰好包含 ${maxImages} 项`,
            visualPlan.moments.length,
        );
    }
    const moments = visualPlan.moments.map((moment, index) => {
        const path = `mindful_prelude.visual_plan.moments[${index}]`;
        assertExactFields(moment, MOMENT_FIELDS, path);
        return {
            moment: requireString(moment.moment, `${path}.moment`),
            insert_after: requirePositiveInteger(moment.insert_after, `${path}.insert_after`),
            char_count: requireString(moment.char_count, `${path}.char_count`),
            known_chars: requireStringArray(moment.known_chars, `${path}.known_chars`),
            unknown_chars: requireStringArray(moment.unknown_chars, `${path}.unknown_chars`),
            composition: requireString(moment.composition, `${path}.composition`),
        };
    });
    return {
        user_insight: requireString(value.user_insight, 'mindful_prelude.user_insight'),
        therapeutic_commitment: requireString(value.therapeutic_commitment, 'mindful_prelude.therapeutic_commitment'),
        visual_plan: {
            reasoning: requireString(visualPlan.reasoning, 'mindful_prelude.visual_plan.reasoning'),
            moments,
        },
    };
}

function normalizeCharacterLookup(presentCharacters = []) {
    const lookup = new Map();
    for (const character of Array.isArray(presentCharacters) ? presentCharacters : []) {
        const canonicalName = String(character?.name || '').trim();
        if (!canonicalName) continue;
        const names = [canonicalName, ...(Array.isArray(character.aliases) ? character.aliases : [])];
        names.forEach((name) => {
            const key = String(name || '').trim().toLocaleLowerCase();
            if (key && !lookup.has(key)) lookup.set(key, canonicalName);
        });
    }
    return lookup;
}

function normalizeCharacter(value, path, knownNameLookup) {
    assertExactFields(value, CHARACTER_FIELDS, path);
    const returnedName = requireString(value.name, `${path}.name`);
    const canonicalName = knownNameLookup.get(returnedName.toLocaleLowerCase()) || '';
    const type = requireString(value.type, `${path}.type`, { allowEmpty: true }).toLowerCase();
    const appear = requireString(value.appear, `${path}.appear`, { allowEmpty: true });
    if (!canonicalName) {
        if (!CHARACTER_TYPES.has(type)) {
            failSchema(`${path}.type`, `未知角色必须是 ${SCENE_CHARACTER_TYPES.join('、')}`, value.type);
        }
        if (!appear) failSchema(`${path}.appear`, '未知角色必须填写外貌', value.appear);
    }
    const center = requireString(value.center, `${path}.center`).toUpperCase();
    if (!/^[A-E][1-5]$/.test(center)) failSchema(`${path}.center`, '必须是 A1~E5 坐标', value.center);

    return {
        name: canonicalName || returnedName,
        danbooru: requireString(value.danbooru, `${path}.danbooru`, { allowEmpty: true }),
        type: canonicalName ? '' : type,
        appear: canonicalName ? '' : appear,
        costume: requireString(value.costume, `${path}.costume`, { allowEmpty: true }),
        action: requireString(value.action, `${path}.action`),
        interact: requireString(value.interact, `${path}.interact`, { allowEmpty: true }),
        uc: requireString(value.uc, `${path}.uc`, { allowEmpty: true }),
        center,
    };
}

function normalizeImages(images, options = {}) {
    if (!Array.isArray(images)) failSchema('images', '必须是 array', images);
    if (!images.length) {
        throw new ScenePlannerError(
            '场景计划没有图片任务。',
            'NO_IMAGE_TASKS',
            {
                path: 'images',
                rule: '必须至少提交一个图片任务',
                received: 0,
                expected: '非空 images 数组',
            },
        );
    }
    const maxImages = normalizeLimit(options.maxImages);
    const maxCharactersPerImage = normalizeLimit(options.maxCharactersPerImage);
    if (maxImages && images.length !== maxImages) {
        failSchema('images', `本次必须恰好包含 ${maxImages} 项`, images.length);
    }
    const knownNameLookup = normalizeCharacterLookup(options.presentCharacters);
    const sceneSource = options.sceneSource;
    const sourcePoints = new Map((Array.isArray(sceneSource?.points) ? sceneSource.points : [])
        .map((point) => [point.number, point]));
    const moments = Array.isArray(options.moments) ? options.moments : [];

    let previousInsertAfter = 0;
    const tasks = images.map((image, imageIndex) => {
        const path = `images[${imageIndex}]`;
        assertExactFields(image, IMAGE_FIELDS, path);
        requirePositiveInteger(image.index, `${path}.index`);
        if (image.index !== imageIndex + 1) {
            failSchema(`${path}.index`, `必须从 1 开始连续递增，当前应为 ${imageIndex + 1}`, image.index);
        }
        const moment = moments[imageIndex];
        const sourcePoint = sourcePoints.get(moment?.insert_after);
        if (!sourcePoint) {
            const path = `mindful_prelude.visual_plan.moments[${imageIndex}].insert_after`;
            throw new ScenePlannerError(
                `场景计划参数无效：${path} 必须引用本次 <content> 中存在的插图点编号`,
                'INSERT_POINT_INVALID',
                {
                    path,
                    rule: '必须引用本次正文中存在的插图点编号',
                    received: moment?.insert_after,
                    expected: sourcePoints.size ? `1～${sourcePoints.size}` : '本次正文没有可用插图点',
                },
            );
        }
        if (moment.insert_after <= previousInsertAfter) {
            failSchema(
                `mindful_prelude.visual_plan.moments[${imageIndex}].insert_after`,
                '必须按图片顺序严格递增且不得重复',
                moment.insert_after,
                `大于 ${previousInsertAfter} 的有效插图点编号`,
            );
        }
        previousInsertAfter = moment.insert_after;
        if (!Array.isArray(image.characters)) failSchema(`${path}.characters`, '必须是 array', image.characters);
        if (maxCharactersPerImage && image.characters.length > maxCharactersPerImage) {
            failSchema(`${path}.characters`, `最多包含 ${maxCharactersPerImage} 人`, image.characters.length);
        }
        const chars = image.characters.map((character, characterIndex) => (
            normalizeCharacter(character, `${path}.characters[${characterIndex}]`, knownNameLookup)
        ));
        return {
            index: image.index,
            scene: requireString(image.scene, `${path}.scene`),
            chars,
            placement: {
                mode: 'source',
                insertAfter: moment.insert_after,
                offset: sourcePoint.offset,
                sourceHash: String(sceneSource?.sourceHash || ''),
            },
        };
    });

    return tasks;
}

function parseArguments(rawArguments) {
    if (rawArguments && typeof rawArguments === 'object' && !Array.isArray(rawArguments)) {
        return rawArguments;
    }
    if (typeof rawArguments !== 'string') {
        throw new ScenePlannerError(
            'submit_scene_plan 参数不是 JSON object。',
            'TOOL_ARGUMENTS_INVALID_JSON',
            {
                path: 'toolCalls[0].arguments',
                rule: '必须是合法 JSON object',
                received: typeof rawArguments,
                expected: 'JSON object 字符串',
            },
        );
    }
    try {
        const parsed = JSON.parse(rawArguments);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new TypeError('root must be an object');
        }
        return parsed;
    } catch (error) {
        throw new ScenePlannerError(
            `submit_scene_plan 参数 JSON 损坏或截断：${error?.message || '无法解析'}`,
            'TOOL_ARGUMENTS_INVALID_JSON',
            {
                path: 'toolCalls[0].arguments',
                rule: '必须是合法且完整的 JSON object',
                received: String(rawArguments).slice(0, 160),
                expected: '完整 JSON object',
            },
            { cause: error },
        );
    }
}

export function parseSubmittedScenePlan(result = {}, options = {}) {
    const toolCalls = Array.isArray(result?.toolCalls) ? result.toolCalls : [];
    if (!toolCalls.length) {
        const presetName = String(options.presetName || '').trim();
        const provider = String(options.provider || '').trim();
        const model = String(options.model || '').trim();
        const context = [presetName, provider, model].filter(Boolean).join(' / ');
        throw new ScenePlannerError(
            `本次响应没有解析到 submit_scene_plan Tool Call${context ? `（${context}）` : ''}。这不代表模型不支持 Tool Calling，请根据最近一次实际请求核对返回协议。`,
            'TOOL_CALL_MISSING',
            {
                path: 'toolCalls',
                rule: '必须且只能调用一次 submit_scene_plan',
                received: 0,
                expected: '1 个 submit_scene_plan Tool Call',
            },
        );
    }
    if (toolCalls.length > 1) {
        throw new ScenePlannerError(
            `场景规划必须只提交一次，但模型返回了 ${toolCalls.length} 个 Tool Call。`,
            'TOOL_CALL_MULTIPLE',
            {
                path: 'toolCalls',
                rule: '必须且只能调用一次 submit_scene_plan',
                received: toolCalls.length,
                expected: '1 个 submit_scene_plan Tool Call',
            },
        );
    }
    const toolCall = toolCalls[0] || {};
    if (toolCall.name !== SUBMIT_SCENE_PLAN_TOOL_NAME) {
        throw new ScenePlannerError(
            `模型调用了错误的 Tool：${toolCall.name || '未命名'}。`,
            'TOOL_CALL_NAME_INVALID',
            {
                path: 'toolCalls[0].name',
                rule: '必须调用 submit_scene_plan',
                received: toolCall.name || '',
                expected: SUBMIT_SCENE_PLAN_TOOL_NAME,
            },
        );
    }
    const parameters = parseArguments(toolCall.arguments);
    assertExactFields(parameters, ROOT_FIELDS, 'parameters');
    const mindfulPrelude = validateMindfulPrelude(parameters.mindful_prelude, options);
    const tasks = normalizeImages(parameters.images, {
        ...options,
        moments: mindfulPrelude.visual_plan.moments,
    });
    // The planned moments and the submitted images describe the same shots, so their counts
    // must agree even when no explicit image limit is configured.
    if (mindfulPrelude.visual_plan.moments.length !== tasks.length) {
        failSchema(
            'mindful_prelude.visual_plan.moments',
            `数量必须与 images 一致（moments ${mindfulPrelude.visual_plan.moments.length} / images ${tasks.length}）`,
            mindfulPrelude.visual_plan.moments.length,
        );
    }
    return { mindfulPrelude, tasks };
}
