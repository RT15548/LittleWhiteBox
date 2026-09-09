import { SUBMIT_SCENE_PLAN_TOOL_NAME } from './scene-plan-contract.js';

// Model-facing instructions are prepared in the browser, not bundled into the executor.
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

function normalizedCenterSchema() {
    return {
        type: 'object',
        additionalProperties: false,
        required: ['x', 'y'],
        properties: {
            x: { type: 'number', minimum: 0, maximum: 1 },
            y: { type: 'number', minimum: 0, maximum: 1 },
        },
    };
}

export function createSubmitScenePlanTool(options = {}) {
    const maxImages = normalizeLimit(options.maxImages);
    const maxPlanImages = normalizeLimit(options.maxPlanImages);
    const maxCharactersPerImage = normalizeLimit(options.maxCharactersPerImage);
    const insertPointCount = normalizeLimit(options.insertPointCount);
    const centerMode = options.centerMode === 'normalized' ? 'normalized' : 'grid';
    const maxPlanItems = maxImages || maxPlanImages || insertPointCount;
    const charactersSchema = {
        type: 'array',
        ...(maxCharactersPerImage ? { maxItems: maxCharactersPerImage } : {}),
        items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'action'],
            properties: {
                name: stringSchema({ minLength: 1 }),
                danbooru: stringSchema(),
                type: stringSchema(),
                appear: stringSchema(),
                costume: stringSchema(),
                action: stringSchema({ minLength: 1 }),
                interact: stringSchema(),
                uc: stringSchema(),
                center: centerMode === 'normalized'
                    ? normalizedCenterSchema()
                    : { type: 'string', pattern: '^[A-E][1-5]$' },
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
            required: ['index', 'insert_after', 'scene', 'characters'],
            properties: {
                index: { type: 'integer', minimum: 1 },
                insert_after: {
                    type: 'integer',
                    minimum: 1,
                    ...(insertPointCount ? { maximum: insertPointCount } : {}),
                    description: 'The numbered illustration point after which this image belongs.',
                },
                scene: stringSchema({ minLength: 1 }),
                characters: charactersSchema,
            },
        },
    };

    return {
        type: 'function',
        function: {
            name: SUBMIT_SCENE_PLAN_TOOL_NAME,
            description: 'Submit planning notes and the final ordered image tasks. mindful_prelude guides planning; only images[] defines execution and placement. Call exactly once.',
            parameters: {
                type: 'object',
                additionalProperties: false,
                required: ['mindful_prelude', 'images'],
                properties: {
                    mindful_prelude: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['user_insight', 'visual_plan'],
                        properties: {
                            user_insight: {
                                ...stringSchema({ minLength: 1 }),
                                description: 'In one prose paragraph, describe the narrative setting, writing style and emotional expression in the user\'s text. Offer cautious advice only when the text genuinely indicates serious psychological issues.',
                            },
                            visual_plan: {
                                ...stringSchema({ minLength: 1 }),
                                description: 'In one prose paragraph, describe each planned narrative moment, the numbered illustration point it follows, the number and types of characters, which characters are registered or unregistered, and the visual composition.',
                            },
                        },
                    },
                    images: imagesSchema,
                },
            },
        },
    };
}
