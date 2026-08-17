import test from 'node:test';
import assert from 'node:assert/strict';

import {
    SCENE_CHARACTER_TYPES,
    ScenePlannerError,
    ScenePlannerErrorCategory,
    createSubmitScenePlanTool,
    getScenePlannerErrorCategory,
    parseSubmittedScenePlan,
    toSceneCharacterPromptTag,
} from '../scene-plan-contract.js';

function buildParameters(overrides = {}) {
    return {
        mindful_prelude: {
            user_insight: '用户在描写雨夜重逢。',
            therapeutic_commitment: '以尊重创作表达的方式选择可见瞬间。',
            visual_plan: {
                reasoning: '选取情绪与光影最集中的一句。',
                moments: [{
                    moment: '1',
                    anchor_target: '她在雨中抱住了阿璃。',
                    char_count: '2 girls',
                    known_chars: ['阿璃'],
                    unknown_chars: ['旅人'],
                    composition: 'C3/E5，雨夜逆光。',
                }],
            },
        },
        images: [{
            index: 1,
            anchor: '她在雨中抱住了阿璃。',
            scene: 'sfw, yuri, duo, rain, backlighting',
            characters: [{
                name: '小璃',
                danbooru: 'ali_(original)',
                type: 'girl',
                appear: 'silver hair',
                costume: 'wet white dress',
                action: 'hugging, closed eyes',
                interact: 'mutual#hug',
                uc: 'dry clothes',
                center: 'C3',
            }, {
                name: '旅人',
                danbooru: '',
                type: 'woman',
                appear: 'long black hair, brown eyes',
                costume: 'wet coat',
                action: 'hugging, crying',
                interact: 'source#hug, target#comfort',
                uc: '',
                center: 'E5',
            }],
        }],
        ...overrides,
    };
}

function buildResult(parameters = buildParameters(), name = 'submit_scene_plan') {
    return {
        toolCalls: [{
            id: 'call-1',
            name,
            arguments: JSON.stringify(parameters),
        }],
    };
}

const parseOptions = {
    messageText: '门忽然打开，她在雨中抱住了阿璃。两人都没有说话。',
    presentCharacters: [{ name: '阿璃', aliases: ['小璃'] }],
    maxImages: 1,
    maxCharactersPerImage: 2,
};

test('scene plan contract normalizes aliases, known character fields, order, and directional interactions', () => {
    const parameters = buildParameters();
    parameters.images.push({
        index: 3,
        anchor: '两人都没有说话。',
        scene: 'sfw, scenery, rain',
        characters: [],
    });
    parameters.mindful_prelude.visual_plan.moments.push({
        ...parameters.mindful_prelude.visual_plan.moments[0],
        moment: '2',
        anchor_target: '两人都没有说话。',
    });
    parameters.images[0].index = 2;
    const parsed = parseSubmittedScenePlan(buildResult(parameters), {
        ...parseOptions,
        maxImages: 2,
    });

    assert.equal(parsed.tasks.length, 2);
    assert.deepEqual(parsed.tasks.map((task) => task.index), [2, 3]);
    assert.equal(parsed.tasks[0].chars[0].name, '阿璃');
    assert.equal(parsed.tasks[0].chars[0].type, '');
    assert.equal(parsed.tasks[0].chars[0].appear, '');
    assert.equal(parsed.tasks[0].chars[0].interact, 'mutual#hug');
    assert.equal(parsed.tasks[0].chars[1].interact, 'source#hug, target#comfort');
    assert.deepEqual(parsed.tasks[1].chars, []);
    assert.equal(parsed.mindfulPrelude.visual_plan.moments[0].composition.includes('E5'), true);
});

test('scene plan tool schema applies exact image count and character cap', () => {
    const schema = createSubmitScenePlanTool({ maxImages: 3, maxCharactersPerImage: 2 })
        .function.parameters.properties.images;
    assert.equal(schema.minItems, 3);
    assert.equal(schema.maxItems, 3);
    const momentsSchema = createSubmitScenePlanTool({ maxImages: 3 })
        .function.parameters.properties.mindful_prelude.properties.visual_plan.properties.moments;
    assert.equal(momentsSchema.minItems, 3);
    assert.equal(momentsSchema.maxItems, 3);
    assert.equal(schema.items.properties.characters.maxItems, 2);
    assert.deepEqual(schema.items.properties.characters.items.required, [
        'name', 'danbooru', 'type', 'appear', 'costume', 'action', 'interact', 'uc', 'center',
    ]);
    assert.deepEqual(
        schema.items.properties.characters.items.properties.type.enum,
        ['', ...SCENE_CHARACTER_TYPES],
    );
});

test('scene plan contract keeps no_humans canonical and maps it to the downstream image tag', () => {
    const parameters = buildParameters();
    parameters.images[0].characters = [{
        name: '机械犬',
        danbooru: '',
        type: 'no_humans',
        appear: 'robot dog, metal body',
        costume: '',
        action: 'standing in rain',
        interact: '',
        uc: '',
        center: 'C3',
    }];
    const parsed = parseSubmittedScenePlan(buildResult(parameters), parseOptions);
    assert.equal(parsed.tasks[0].chars[0].type, 'no_humans');
    assert.equal(toSceneCharacterPromptTag(parsed.tasks[0].chars[0].type), 'no humans');

    parameters.images[0].characters[0].type = 'no humans';
    assert.throws(
        () => parseSubmittedScenePlan(buildResult(parameters), parseOptions),
        (error) => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID'
            && error.message.includes('images[0].characters[0].type'),
    );
});

test('scene planner errors expose stable failure categories', () => {
    const cases = [
        ['MODEL_MISSING', ScenePlannerErrorCategory.AGENT_CONFIG],
        ['HOST_REQUEST_HEADERS_LOAD_FAILED', ScenePlannerErrorCategory.AGENT_CONFIG],
        ['TOOL_CALL_MISSING', ScenePlannerErrorCategory.TOOL_PROTOCOL],
        ['TOOL_ARGUMENTS_SCHEMA_INVALID', ScenePlannerErrorCategory.SCHEMA],
        ['REQUEST_TIMEOUT', ScenePlannerErrorCategory.TIMEOUT],
        ['REQUEST_ABORTED', ScenePlannerErrorCategory.ABORTED],
        ['PROVIDER_REQUEST_FAILED', ScenePlannerErrorCategory.PROVIDER],
    ];
    for (const [code, expected] of cases) {
        assert.equal(getScenePlannerErrorCategory(new ScenePlannerError('test', code)), expected);
    }
    assert.equal(getScenePlannerErrorCategory(new Error('test')), null);
});

test('scene plan contract distinguishes tool protocol failures', () => {
    assert.throws(
        () => parseSubmittedScenePlan({ toolCalls: [] }, { provider: 'openai-compatible', model: 'test-model' }),
        (error) => error instanceof ScenePlannerError
            && error.code === 'TOOL_CALL_MISSING'
            && error.message.includes('Tagged JSON 兼容模式'),
    );
    assert.throws(
        () => parseSubmittedScenePlan({ toolCalls: [{ name: 'wrong', arguments: '{}' }] }),
        (error) => error.code === 'TOOL_CALL_NAME_INVALID',
    );
    assert.throws(
        () => parseSubmittedScenePlan({ toolCalls: [
            { name: 'submit_scene_plan', arguments: '{}' },
            { name: 'submit_scene_plan', arguments: '{}' },
        ] }),
        (error) => error.code === 'TOOL_CALL_MULTIPLE',
    );
    assert.throws(
        () => parseSubmittedScenePlan({ toolCalls: [{ name: 'submit_scene_plan', arguments: '{"images":' }] }),
        (error) => error.code === 'TOOL_ARGUMENTS_INVALID_JSON',
    );
});

test('scene plan contract rejects schema, index, anchor, count, and unknown-character violations', () => {
    const cases = [
        [() => {
            const value = buildParameters();
            value.negative = 'bad anatomy';
            return value;
        }, 'parameters.negative'],
        [() => {
            const value = buildParameters();
            value.images[0].index = 0;
            return value;
        }, 'images[0].index'],
        [() => {
            const value = buildParameters();
            value.images[0].anchor = '原文里不存在';
            return value;
        }, 'images[0].anchor'],
        [() => {
            const value = buildParameters();
            value.images[0].characters[1].appear = '';
            return value;
        }, 'images[0].characters[1].appear'],
        [() => {
            const value = buildParameters();
            value.images[0].characters[1].center = 'F6';
            return value;
        }, 'images[0].characters[1].center'],
    ];

    for (const [build, expectedPath] of cases) {
        assert.throws(
            () => parseSubmittedScenePlan(buildResult(build()), parseOptions),
            (error) => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID'
                && error.message.includes(expectedPath),
        );
    }

    const duplicate = buildParameters();
    duplicate.images.push({ ...duplicate.images[0] });
    duplicate.mindful_prelude.visual_plan.moments.push({
        ...duplicate.mindful_prelude.visual_plan.moments[0],
        moment: '2',
    });
    assert.throws(
        () => parseSubmittedScenePlan(buildResult(duplicate), { ...parseOptions, maxImages: 2 }),
        (error) => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID'
            && error.message.includes('不得重复'),
    );
    assert.throws(
        () => parseSubmittedScenePlan(buildResult(buildParameters({ images: [] })), {
            ...parseOptions,
            maxImages: 0,
        }),
        (error) => error.code === 'NO_IMAGE_TASKS',
    );

    const wrongMomentCount = buildParameters();
    wrongMomentCount.mindful_prelude.visual_plan.moments.push({
        ...wrongMomentCount.mindful_prelude.visual_plan.moments[0],
    });
    assert.throws(
        () => parseSubmittedScenePlan(buildResult(wrongMomentCount), parseOptions),
        (error) => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID'
            && error.message.includes('visual_plan.moments'),
    );

    // Without an explicit image limit, moments and images must still describe the same shots.
    assert.throws(
        () => parseSubmittedScenePlan(buildResult(wrongMomentCount), { ...parseOptions, maxImages: 0 }),
        (error) => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID'
            && error.message.includes('数量必须与 images 一致'),
    );
});

test('scene planner reports prompt expansion failures as their own category', () => {
    assert.equal(
        getScenePlannerErrorCategory(new ScenePlannerError('test', 'PROMPT_EXPANSION_FAILED')),
        ScenePlannerErrorCategory.PROMPT,
    );
});
