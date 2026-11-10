import { SCENE_TITLE_MAX_LENGTH, SUBMIT_SCENE_PLAN_TOOL_NAME } from './scene-plan-contract.js';
import { normalizeScenePlannerProfile } from './scene-planner-profile.js';

// Model-facing instructions are prepared in the browser, not bundled into the executor.
function normalizeLimit(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : 0;
}

function stringSchema(description, { minLength = 0, maxLength = 0 } = {}) {
    return {
        type: 'string',
        ...(minLength > 0 ? { minLength } : {}),
        ...(maxLength > 0 ? { maxLength } : {}),
        description,
    };
}

const CHARACTER_TYPES = Object.freeze(['girl', 'boy', 'woman', 'man', 'other', 'no_humans']);

const INTERACT_DESCRIPTIONS = Object.freeze({
    directional: '与其他角色的接触动作，带方向前缀：`source#动作` 发起方、`target#动作` 接受方、`mutual#动作` 互相。同一个互动分别写进每位参与角色自己的 interact；一个角色参与多个互动时逗号并列。没有互动时省略。',
    plain: '与其他角色的接触动作 tag，如 `hugging`、`holding hands`。没有互动时省略。',
});

const UC_DESCRIPTIONS = Object.freeze({
    character: '只针对该角色排除的 tag：与当前状态互斥的特征（无胸罩→`bra`、脱帽→`hat`）、因视角或遮挡不可见的部位、与另一角色相反的情绪。作为该角色专属的负向生效。通用画质负面由用户预设负责，不写在这里。没有时省略。',
    global: 'Tags to exclude from the entire image. All characters\' uc values are merged into one global negative prompt, so include a tag only when it is unwanted for every subject and the background. A feature or emotion needed by another character stays out of uc. General quality negatives come from the user\'s preset. Omit when there is nothing to exclude.',
});

const CENTER_SCHEMAS = Object.freeze({
    grid: () => ({
        type: 'string',
        pattern: '^[A-E][1-5]$',
        description: '角色在画面中的位置，5×5 网格：列 A–E 从左到右，行 1–5 从上到下。居中（C3）时省略。多个角色可以重叠（拥抱、亲吻）。',
    }),
    normalized: () => ({
        type: 'object',
        additionalProperties: false,
        required: ['x', 'y'],
        properties: {
            x: { type: 'number', minimum: 0, maximum: 1 },
            y: { type: 'number', minimum: 0, maximum: 1 },
        },
        description: '角色在画面中的位置，左上角 (0, 0)，右下角 (1, 1)。居中 (0.5, 0.5) 时省略。多个角色可以重叠（拥抱、亲吻）。',
    }),
});

/**
 * Field semantics live here and nowhere else: the prose prompts only decide *what* to draw.
 * Provider differences (center support, interact syntax, uc scope) come from the profile.
 */
export function getScenePlanCharacterProperties(profile) {
    const effective = normalizeScenePlannerProfile(profile);
    return {
        name: stringSchema(
            '角色名。已录入角色用【已录入角色】中的名称，原文用别名也归一到该名称。未知角色用原文名字，无名时用简短称呼。',
            { minLength: 1 },
        ),
        form: stringSchema(
            '多形态角色必填：本图出现的形态名，取自该角色的“形态”列表；单形态角色省略。',
        ),
        // type 在 danbooru 之前：与 assembleCharacterPrompts 的拼接顺序一致
        // （type → danbooru → appear → costume → action），也让模型按"先说清是谁、在哪，再给身份 tag"的顺序写。
        type: stringSchema(
            `Character category: ${CHARACTER_TYPES.join(' / ')}. Use \`no_humans\` for non-humanoid subjects such as animals or monsters. Fill this for every unregistered character; omit for registered characters, whose category comes from the character library.`,
        ),
        danbooru: stringSchema(
            '该角色的 Danbooru 身份 tag，下划线格式：同人角色 `character_name_(series)`，原创角色 `中文名_(original)`。仅在确定时提交；已录入角色省略。',
        ),
        appear: stringSchema(
            'Stable appearance visible in this composition, such as hair, eyes or build. Every unregistered character needs a non-empty appearance description. Omit for registered characters, whose appearance comes from the character library.',
        ),
        costume: stringSchema(
            '持续状态：换一张图仍会保持的、固定外貌以外的一切——衣着及其穿戴状态（敞开、湿透、破损）、身体部件、非人特征、配饰等。写画面里有的东西。脱掉的衣物不再写，露出的部位写明（topless、bare chest），其它身体部件、非人特征和配饰照旧保留；全部都没有才写 "costume": ""。'
            + '这个字段必须提交：没有衣服（全裸、半裸、只剩配饰）是合法且常见的取值，这时只写其余状态，不要为了让这个字段有内容而去补一套衣服。'
            + '取值优先级：正文写的穿搭 > 前文画面里这个角色的 costume > 服装参考、世界书、数据表里的穿搭描述（没有前文画面时，最后一条不存在）。沿用记忆时直接照抄记忆里的 costume，不要再用服装参考补一遍。'
            + '要选衣服时（新角色、换了形态、或正文写了新的衣物），已录入角色有服装参考的，选一套或其变体，衣物以参考为准，只按画面调整状态，不要额外补充与参考里已有衣物重复或同义的内容，也不把多套参考拼在一起；正文写到而参考里没有的衣物可以补上，正文穿的整套衣服参考里都没有可以直接整套写。',
        ),
        action: stringSchema(
            '只写瞬时内容：这一瞬间的姿态、动作、视线、面向、表情；撩衣、握物这类一瞬间的动作也写这里。身上一直有的东西（身体部件、非人特征、配饰、穿着本身）不写在这里，写进 costume。',
            { minLength: 1 },
        ),
        interact: stringSchema(INTERACT_DESCRIPTIONS[effective.interactSyntax]),
        uc: stringSchema(UC_DESCRIPTIONS[effective.ucScope]),
        ...(effective.centerMode === 'none' ? {} : { center: CENTER_SCHEMAS[effective.centerMode]() }),
    };
}

/**
 * Apply user-configured description overrides onto a freshly built parameters tree.
 * Paths use the same naming as listScenePlanFieldDescriptions' flattening
 * (`images`, `images[].scene`, `images[].characters[].name`, ...); `tool` targets the
 * function-level description. Empty/whitespace overrides are ignored.
 */
function applyFieldDescriptionOverrides(tool, descriptions) {
    const walk = (schema, path) => {
        if (!schema || typeof schema !== 'object') return;
        const override = descriptions[path];
        if (typeof schema.description === 'string' && typeof override === 'string' && override.trim()) {
            schema.description = override;
        }
        if (schema.type === 'object' && schema.properties) {
            for (const [key, child] of Object.entries(schema.properties)) {
                walk(child, path ? `${path}.${key}` : key);
            }
        } else if (schema.type === 'array' && schema.items) {
            walk(schema.items, `${path}[]`);
        }
    };
    walk(tool.function?.parameters, '');
    const toolDescription = descriptions.tool;
    if (typeof toolDescription === 'string' && toolDescription.trim()) {
        tool.function.description = toolDescription;
    }
}

export function createSubmitScenePlanTool(options = {}) {
    const maxImages = normalizeLimit(options.maxImages);
    const maxPlanImages = normalizeLimit(options.maxPlanImages);
    const maxCharactersPerImage = normalizeLimit(options.maxCharactersPerImage);
    const insertPointCount = normalizeLimit(options.insertPointCount);
    const profile = normalizeScenePlannerProfile(options.profile);
    const descriptions = options.descriptions && typeof options.descriptions === 'object' ? options.descriptions : {};
    const maxPlanItems = maxImages || maxPlanImages;
    const charactersSchema = {
        type: 'array',
        ...(maxCharactersPerImage ? { maxItems: maxCharactersPerImage } : {}),
        description: '画面中出现的角色，按重要度排序。纯风景、物件、建筑主体时为空数组。每项的字段按 type → danbooru → appear → costume → action → interact 的顺序拼成该角色的提示词。同一个角色的外貌（已录入角色是角色清单里的固定外貌，未录入角色是你写的 appear）、costume、action 合起来就是这个角色的提示词：相同或同义的词只写一处，按 外貌 > costume > action 的优先级留在靠前的字段；属于某个角色的词不写进整图 scene；不同角色之间不受此限。',
        items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'costume', 'action'],
            properties: getScenePlanCharacterProperties(profile),
        },
    };
    const imagesSchema = {
        type: 'array',
        minItems: maxImages || 1,
        ...(maxPlanItems ? { maxItems: maxPlanItems } : {}),
        description: '图片任务，按阅读顺序排列。数量约束见绘图要求。',
        items: {
            type: 'object',
            additionalProperties: false,
            required: ['index', 'insert_after', 'title', 'orientation', 'scene', 'characters'],
            properties: {
                index: { type: 'integer', minimum: 1, description: '本图序号，从 1 起。' },
                insert_after: {
                    type: 'integer',
                    minimum: 1,
                    ...(insertPointCount ? { maximum: insertPointCount } : {}),
                    description: 'The number N of an existing `【插图点 N】` marker in <content>. Choose the nearest marker after the moment depicted. Images at the same marker appear in array order.',
                },
                // 先命名和确定画幅，再展开绘图 tag；title 仅用于展示，不参与提示词拼接。
                title: stringSchema(
                    `本次绘画的标题：简体中文，${SCENE_TITLE_MAX_LENGTH} 字内，只输出标题本身，不加标点。\n`
                    + '把它当成这一格画面的小标题，只写画里最具体的那个动作、物件或瞬间，不要概括主题。\n'
                    + '同一批的几张图，句式和开头都要各不相同，少用「XX的XX」。可参考：\n'
                    + '那只手终于探了出来 / 听到她说晚上好 / 距离正在缩到三米 / 凌晨两点的便利店 / 路灯吞掉了影子',
                    { minLength: 1, maxLength: SCENE_TITLE_MAX_LENGTH },
                ),
                orientation: {
                    type: 'string',
                    enum: ['portrait', 'landscape'],
                    description: '本图画幅方向，先定景别与主体排布再决定，人数只作参考。'
                        + 'portrait（竖幅）：单人、直立站姿、close-up / upper body 等近景、双人贴近构图；'
                        + 'landscape（横幅）：三人及以上群像、wide shot / 全景远景、开阔环境、左右展开的互动与站位。'
                        + '两人同框不必然横幅；方向须与景别一致。拿不准时填 portrait。',
                },
                scene: stringSchema(
                    '画面整体：人数与关系、构图与视角、背景、光影、氛围，逗号分隔的英文 tag。角色个体的外貌与动作不写在这里。拼在正向提示词最前。',
                    { minLength: 1 },
                ),
                characters: charactersSchema,
                // 追加位（可选）：拼在所有角色之后、整条正向提示词的最末尾。
                // 只有 profile.postPrompt === 'append' 的 provider 才暴露，避免教会模型一个编译器会丢的字段。
                ...(profile.postPrompt === 'append' ? {
                    post_prompt: stringSchema(
                        '本字段留空不写',
                    ),
                } : {}),
            },
        },
    };

    const tool = {
        type: 'function',
        function: {
            name: SUBMIT_SCENE_PLAN_TOOL_NAME,
            description: '提交本次全部图片任务。一个回合只调用一次。',
            parameters: {
                type: 'object',
                additionalProperties: false,
                required: ['images'],
                properties: {
                    images: imagesSchema,
                },
            },
        },
    };
    applyFieldDescriptionOverrides(tool, descriptions);
    return tool;
}
