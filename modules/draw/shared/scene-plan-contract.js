export const SUBMIT_SCENE_PLAN_TOOL_NAME = 'submit_scene_plan';

const REQUIRED_IMAGE_FIELDS = Object.freeze(['insert_after', 'scene', 'characters']);

export function toSceneCharacterPromptTag(value) {
    const type = String(value || '').trim();
    return type.toLowerCase() === 'no_humans' ? 'no humans' : type;
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
    'IMAGE_LIMIT_EXCEEDED',
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

/** Validate the execution surface, not the browser-owned planning vocabulary. */
export function assertSubmitScenePlanTool(tool) {
    const definition = tool?.function;
    const parameters = definition?.parameters;
    if (tool?.type !== 'function'
        || definition?.name !== SUBMIT_SCENE_PLAN_TOOL_NAME
        || typeof definition?.description !== 'string'
        || parameters?.type !== 'object'
        || !Array.isArray(parameters.required)
        || !parameters.required.includes('images')
        || parameters.properties?.images?.type !== 'array') {
        throw new ScenePlannerError(
            'planner.tool 必须是包含必填 images 数组的 submit_scene_plan Tool。',
            'TOOL_CONTRACT_INVALID',
        );
    }
    return tool;
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
    assertRequiredFields(value, fields, path);
    const expected = new Set(fields);
    for (const key of Object.keys(value)) {
        if (!expected.has(key)) failSchema(`${path}.${key}`, '是不允许的字段', value[key]);
    }
}

function assertRequiredFields(value, fields, path) {
    assertObject(value, path);
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

function optionalString(value, key, path) {
    if (!Object.prototype.hasOwnProperty.call(value, key) || value[key] === null) return '';
    return requireString(value[key], `${path}.${key}`, { allowEmpty: true });
}

function requirePositiveInteger(value, path) {
    if (!Number.isInteger(value) || value < 1) failSchema(path, '必须是大于 0 的整数', value);
    return value;
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

const GRID_COL = Object.freeze({ A: 0.1, B: 0.3, C: 0.5, D: 0.7, E: 0.9 });
const GRID_ROW = Object.freeze({ 1: 0.1, 2: 0.3, 3: 0.5, 4: 0.7, 5: 0.9 });

function normalizeCenter(value, path, centerMode) {
    if (value === undefined) return { x: 0.5, y: 0.5 };
    if (centerMode === 'normalized') {
        assertExactFields(value, ['x', 'y'], path);
        const parseCoordinate = (coordinate, coordinatePath) => {
            const isNumber = typeof coordinate === 'number';
            const isNumericString = typeof coordinate === 'string' && coordinate.trim() !== '';
            const number = isNumber || isNumericString ? Number(coordinate) : Number.NaN;
            if (!Number.isFinite(number) || number < 0 || number > 1) {
                failSchema(coordinatePath, '必须是 0～1 的数字', coordinate);
            }
            return number;
        };
        const x = parseCoordinate(value.x, `${path}.x`);
        const y = parseCoordinate(value.y, `${path}.y`);
        return { x, y };
    }
    const grid = requireString(value, path).toUpperCase();
    const match = grid.match(/^([A-E])([1-5])$/);
    if (!match) failSchema(path, '必须是 A1～E5 坐标', value);
    return { x: GRID_COL[match[1]], y: GRID_ROW[match[2]] };
}

function normalizeCharacter(value, path, knownNameLookup, centerMode) {
    assertRequiredFields(value, ['name'], path);
    const returnedName = requireString(value.name, `${path}.name`);
    const canonicalName = knownNameLookup.get(returnedName.toLocaleLowerCase()) || '';
    const type = optionalString(value, 'type', path);
    const appear = optionalString(value, 'appear', path);
    if (!canonicalName && !appear) failSchema(`${path}.appear`, '未知角色必须填写外貌', value.appear);
    const center = normalizeCenter(value.center, `${path}.center`, centerMode);

    return {
        name: canonicalName || returnedName,
        danbooru: optionalString(value, 'danbooru', path),
        type: canonicalName ? '' : type,
        appear: canonicalName ? '' : appear,
        costume: optionalString(value, 'costume', path),
        action: optionalString(value, 'action', path),
        interact: optionalString(value, 'interact', path),
        uc: optionalString(value, 'uc', path),
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
    const maxPlanImages = normalizeLimit(options.maxPlanImages);
    const maxCharactersPerImage = normalizeLimit(options.maxCharactersPerImage);
    const centerMode = options.centerMode === 'normalized' ? 'normalized' : 'grid';
    if (maxImages && images.length !== maxImages) {
        failSchema('images', `本次必须恰好包含 ${maxImages} 项`, images.length);
    }
    if (!maxImages && maxPlanImages && images.length > maxPlanImages) {
        failSchema('images', `本次最多包含 ${maxPlanImages} 项`, images.length);
    }
    const knownNameLookup = normalizeCharacterLookup(options.presentCharacters);
    const sceneSource = options.sceneSource;
    const sourcePoints = new Map((Array.isArray(sceneSource?.points) ? sceneSource.points : [])
        .map((point) => [point.number, point]));
    const tasks = images.map((image, imageIndex) => {
        const path = `images[${imageIndex}]`;
        assertRequiredFields(image, REQUIRED_IMAGE_FIELDS, path);
        const insertAfter = requirePositiveInteger(image.insert_after, `${path}.insert_after`);
        const sourcePoint = sourcePoints.get(insertAfter);
        if (!sourcePoint) {
            const insertPath = `${path}.insert_after`;
            throw new ScenePlannerError(
                `场景计划参数无效：${insertPath} 必须引用本次 <content> 中存在的插图点编号`,
                'INSERT_POINT_INVALID',
                {
                    path: insertPath,
                    rule: '必须引用本次正文中存在的插图点编号',
                    received: insertAfter,
                    expected: sourcePoints.size ? `1～${sourcePoints.size}` : '本次正文没有可用插图点',
                },
            );
        }
        if (!Array.isArray(image.characters)) failSchema(`${path}.characters`, '必须是 array', image.characters);
        if (maxCharactersPerImage && image.characters.length > maxCharactersPerImage) {
            failSchema(`${path}.characters`, `最多包含 ${maxCharactersPerImage} 人`, image.characters.length);
        }
        const chars = image.characters.map((character, characterIndex) => (
            normalizeCharacter(character, `${path}.characters[${characterIndex}]`, knownNameLookup, centerMode)
        ));
        return {
            index: imageIndex + 1,
            scene: requireString(image.scene, `${path}.scene`),
            chars,
            placement: {
                mode: 'source',
                insertAfter,
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
    // Planning notes are model-facing data, not part of the image execution contract.
    if (!Object.hasOwn(parameters, 'images')) failSchema('parameters.images', '是必填字段', undefined);
    const tasks = normalizeImages(parameters.images, options);
    return { tasks };
}
