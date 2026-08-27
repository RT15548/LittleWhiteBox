import test from 'node:test';
import assert from 'node:assert/strict';

import { createSceneSource } from '../scene-source.js';
import {
    SCENE_CHARACTER_TYPES,
    ScenePlannerError,
    ScenePlannerErrorCategory,
    createScenePlannerCorrectionResult,
    createSubmitScenePlanTool,
    getScenePlannerCorrectionSignature,
    getScenePlannerErrorCategory,
    isScenePlannerCorrectionError,
    parseSubmittedScenePlan,
    toSceneCharacterPromptTag,
} from '../scene-plan-contract.js';

function buildParameters(overrides = {}) {
    return {
        mindful_prelude: {
            user_insight: '用户在描写雨夜重逢。',
            visual_plan: {
                moments: [{
                    moment: '1',
                    insert_after: 1,
                    char_count: '2 girls',
                    known_chars: ['阿璃'],
                    unknown_chars: ['旅人'],
                    composition: 'C3/E5，雨夜逆光。',
                }],
            },
        },
        images: [{
            index: 1,
            insert_after: 1,
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
    sceneSource: createSceneSource('门忽然打开，她在雨中抱住了阿璃。两人都没有说话。'),
    presentCharacters: [{ name: '阿璃', aliases: ['小璃'] }],
    maxImages: 1,
    maxCharactersPerImage: 2,
};

test('scene plan contract normalizes aliases, known character fields, placement, and directional interactions', () => {
    const parameters = buildParameters();
    parameters.images.push({
        index: 2,
        insert_after: 2,
        scene: 'sfw, scenery, rain',
        characters: [],
    });
    parameters.mindful_prelude.visual_plan.moments.push({
        ...parameters.mindful_prelude.visual_plan.moments[0],
        moment: '2',
        insert_after: 2,
    });
    const parsed = parseSubmittedScenePlan(buildResult(parameters), {
        ...parseOptions,
        maxImages: 2,
    });

    assert.equal(parsed.tasks.length, 2);
    assert.deepEqual(parsed.tasks.map((task) => task.index), [1, 2]);
    assert.equal(parsed.tasks[0].chars[0].name, '阿璃');
    assert.equal(parsed.tasks[0].chars[0].type, '');
    assert.equal(parsed.tasks[0].chars[0].appear, '');
    assert.equal(parsed.tasks[0].chars[0].interact, 'mutual#hug');
    assert.equal(parsed.tasks[0].chars[1].interact, 'source#hug, target#comfort');
    assert.deepEqual(parsed.tasks[1].chars, []);
    assert.equal(parsed.mindfulPrelude.visual_plan.moments[0].composition.includes('E5'), true);

    const source = parseOptions.sceneSource;
    assert.deepEqual(parsed.tasks[0].placement, {
        mode: 'source',
        insertAfter: 1,
        offset: source.points[0].offset,
        sourceHash: source.sourceHash,
    });
    assert.deepEqual(parsed.tasks[1].placement, {
        mode: 'source',
        insertAfter: 2,
        offset: source.points[1].offset,
        sourceHash: source.sourceHash,
    });
    assert.equal(source.sourceText.slice(0, source.points[0].offset).endsWith('她在雨中抱住了阿璃。'), true);
});

test('scene plan tool schema applies exact image count and character cap', () => {
    const tool = createSubmitScenePlanTool({ maxImages: 3, maxCharactersPerImage: 2 });
    const schema = tool.function.parameters.properties.images;
    assert.deepEqual(tool.function.parameters.required, ['mindful_prelude', 'images']);
    assert.equal(schema.minItems, 3);
    assert.equal(schema.maxItems, 3);
    const momentsSchema = createSubmitScenePlanTool({ maxImages: 3 })
        .function.parameters.properties.mindful_prelude.properties.visual_plan.properties.moments;
    assert.equal(momentsSchema.minItems, 3);
    assert.equal(momentsSchema.maxItems, 3);
    assert.equal(schema.items.properties.characters.maxItems, 2);
    assert.deepEqual(schema.items.properties.characters.items.required, ['name', 'action']);
    assert.deepEqual(
        schema.items.properties.characters.items.properties.type.enum,
        ['', ...SCENE_CHARACTER_TYPES],
    );
    const preludeProperties = createSubmitScenePlanTool().function.parameters
        .properties.mindful_prelude.properties;
    assert.equal(Object.hasOwn(preludeProperties, 'therapeutic_commitment'), false);
    assert.equal(Object.hasOwn(preludeProperties.visual_plan.properties, 'reasoning'), false);

    const boundedTool = createSubmitScenePlanTool({ insertPointCount: 2 });
    const boundedImages = boundedTool.function.parameters.properties.images;
    const boundedMoments = boundedTool.function.parameters.properties.mindful_prelude
        .properties.visual_plan.properties.moments;
    const backendBounded = createSubmitScenePlanTool({
        maxImages: 0,
        maxPlanImages: 20,
        insertPointCount: 30,
    }).function.parameters.properties;
    assert.equal(backendBounded.images.minItems, 1);
    assert.equal(backendBounded.images.maxItems, 20);
    assert.equal(backendBounded.mindful_prelude.properties.visual_plan.properties.moments.maxItems, 20);
    assert.equal(boundedImages.minItems, 1);
    assert.equal(boundedImages.maxItems, 2);
    assert.equal(boundedImages.items.properties.insert_after.maximum, 2);
    assert.equal(boundedMoments.items.properties.insert_after.maximum, 2);
});

test('scene plan contract defaults optional character facts while keeping unknown identity requirements', () => {
    const knownParameters = buildParameters();
    knownParameters.images[0].characters = [{ name: '小璃', action: 'standing, looking at viewer' }];
    const known = parseSubmittedScenePlan(buildResult(knownParameters), parseOptions).tasks[0].chars[0];
    assert.deepEqual(known, {
        name: '阿璃',
        danbooru: '',
        type: '',
        appear: '',
        costume: '',
        action: 'standing, looking at viewer',
        interact: '',
        uc: '',
        center: { x: 0.5, y: 0.5 },
    });

    const unknownParameters = buildParameters();
    unknownParameters.images[0].characters = [{
        name: '旅人',
        type: 'woman',
        appear: 'long black hair, brown eyes',
        action: 'standing in rain',
    }];
    const unknown = parseSubmittedScenePlan(buildResult(unknownParameters), parseOptions).tasks[0].chars[0];
    assert.equal(unknown.danbooru, '');
    assert.equal(unknown.costume, '');
    assert.equal(unknown.interact, '');
    assert.equal(unknown.uc, '');
    assert.deepEqual(unknown.center, { x: 0.5, y: 0.5 });

    for (const missingField of ['type', 'appear']) {
        const parameters = buildParameters();
        const character = {
            name: '旅人',
            type: 'woman',
            appear: 'long black hair',
            action: 'standing in rain',
        };
        delete character[missingField];
        parameters.images[0].characters = [character];
        assert.throws(
            () => parseSubmittedScenePlan(buildResult(parameters), parseOptions),
            (error) => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID'
                && error.message.includes(`images[0].characters[0].${missingField}`),
        );
    }

    const invalidOptional = buildParameters();
    invalidOptional.images[0].characters = [{ name: '小璃', action: 'standing', uc: null }];
    assert.throws(
        () => parseSubmittedScenePlan(buildResult(invalidOptional), parseOptions),
        (error) => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID'
            && error.message.includes('images[0].characters[0].uc'),
    );
});

test('scene plan execution accepts absent or invalid planning notes and trusts images placement', () => {
    const withoutPrelude = buildParameters();
    delete withoutPrelude.mindful_prelude;
    assert.equal(
        parseSubmittedScenePlan(buildResult(withoutPrelude), parseOptions).tasks[0].placement.insertAfter,
        1,
    );

    const invalidPrelude = buildParameters();
    invalidPrelude.mindful_prelude = { obsolete: true };
    const parsed = parseSubmittedScenePlan(buildResult(invalidPrelude), parseOptions);
    assert.equal(parsed.mindfulPrelude, null);
    assert.equal(parsed.tasks[0].placement.insertAfter, 1);

    const conflictingPrelude = buildParameters();
    conflictingPrelude.mindful_prelude.visual_plan.moments[0].insert_after = 2;
    assert.equal(
        parseSubmittedScenePlan(buildResult(conflictingPrelude), parseOptions).tasks[0].placement.insertAfter,
        1,
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

test('normalized centers accept numeric strings without coercing unrelated JSON types', () => {
    const numericStringParameters = buildParameters();
    numericStringParameters.images[0].characters[0].center = { x: '0.25', y: '1' };
    numericStringParameters.images[0].characters[1].center = { x: 0, y: 0.75 };
    const parsed = parseSubmittedScenePlan(buildResult(numericStringParameters), {
        ...parseOptions,
        centerMode: 'normalized',
    });
    assert.deepEqual(parsed.tasks[0].chars[0].center, { x: 0.25, y: 1 });

    for (const invalidCoordinate of [null, true, false, '', 'Infinity', -0.1, 1.1]) {
        const parameters = buildParameters();
        parameters.images[0].characters[0].center = { x: invalidCoordinate, y: 0.5 };
        parameters.images[0].characters[1].center = { x: 0.5, y: 0.5 };
        assert.throws(
            () => parseSubmittedScenePlan(buildResult(parameters), {
                ...parseOptions,
                centerMode: 'normalized',
            }),
            (error) => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID'
                && error.message.includes('images[0].characters[0].center.x'),
        );
    }
});

test('scene planner errors expose stable failure categories', () => {
    const cases = [
        ['EMPTY_MESSAGE', ScenePlannerErrorCategory.INPUT],
        ['NO_INSERT_POINTS', ScenePlannerErrorCategory.INPUT],
        ['IMAGE_LIMIT_EXCEEDED', ScenePlannerErrorCategory.INPUT],
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
            && error.message.includes('不代表模型不支持 Tool Calling'),
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

test('scene planner correction feedback distinguishes missing, wrong, multiple, and schema failures', () => {
    const cases = [
        [new ScenePlannerError('没有调用', 'TOOL_CALL_MISSING'), /没有调用 Tool/],
        [new ScenePlannerError('调用错误', 'TOOL_CALL_NAME_INVALID', { name: 'wrong' }), /错误的 Tool/],
        [new ScenePlannerError('调用过多', 'TOOL_CALL_MULTIPLE', { count: 2 }), /多个 Tool/],
        [new ScenePlannerError('字段错误', 'TOOL_ARGUMENTS_SCHEMA_INVALID', {
            path: 'images[0].scene',
            rule: '不能为空',
            received: '不会影响失败签名',
        }), /错误位置/],
    ];

    for (const [error, instructionPattern] of cases) {
        assert.equal(isScenePlannerCorrectionError(error), true);
        const feedback = createScenePlannerCorrectionResult(error);
        assert.equal(feedback.ok, false);
        assert.equal(feedback.error.code, error.code);
        assert.match(feedback.instruction, instructionPattern);
        assert.equal(Object.hasOwn(feedback.error.details || {}, 'value'), false);
    }
    assert.equal(isScenePlannerCorrectionError(new ScenePlannerError('超时', 'REQUEST_TIMEOUT')), false);
    assert.equal(
        getScenePlannerCorrectionSignature(cases[3][0]),
        getScenePlannerCorrectionSignature(new ScenePlannerError(
            '另一个值仍在相同位置错误',
            'TOOL_ARGUMENTS_SCHEMA_INVALID',
            { path: 'images[0].scene', rule: '不能为空', received: 'different' },
        )),
    );
    assert.notEqual(
        getScenePlannerCorrectionSignature(cases[3][0]),
        getScenePlannerCorrectionSignature(new ScenePlannerError(
            '相同位置但违反另一条规则',
            'TOOL_ARGUMENTS_SCHEMA_INVALID',
            { path: 'images[0].scene', rule: '必须是 string' },
        )),
    );
});

test('scene plan contract rejects schema, index, placement, count, and unknown-character violations', () => {
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
            value.images[0].insert_after = 99;
            return value;
        }, 'images[0].insert_after', 'INSERT_POINT_INVALID'],
        [() => {
            const value = buildParameters();
            delete value.images[0].insert_after;
            return value;
        }, 'images[0].insert_after'],
        [() => {
            const value = buildParameters();
            value.images[0].anchor = '旧契约字段';
            return value;
        }, 'images[0].anchor'],
        [() => {
            const value = buildParameters();
            value.images[0].characters[0].nickname = '额外字段';
            return value;
        }, 'images[0].characters[0].nickname'],
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

    for (const [build, expectedPath, expectedCode = 'TOOL_ARGUMENTS_SCHEMA_INVALID'] of cases) {
        assert.throws(
            () => parseSubmittedScenePlan(buildResult(build()), parseOptions),
            (error) => error.code === expectedCode
                && error.message.includes(expectedPath),
        );
    }

    for (const insertAfter of [[2, 1], [1, 1]]) {
        const value = buildParameters();
        value.images = insertAfter.map((point, index) => ({
            ...value.images[0],
            index: index + 1,
            insert_after: point,
        }));
        assert.throws(
            () => parseSubmittedScenePlan(buildResult(value), { ...parseOptions, maxImages: 2 }),
            (error) => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID'
                && error.details?.rule === '必须按图片顺序严格递增且不得重复',
        );
    }

    const duplicate = buildParameters();
    duplicate.images.push({ ...duplicate.images[0], insert_after: 2 });
    duplicate.mindful_prelude.visual_plan.moments.push({
        ...duplicate.mindful_prelude.visual_plan.moments[0],
        moment: '2',
    });
    assert.throws(
        () => parseSubmittedScenePlan(buildResult(duplicate), { ...parseOptions, maxImages: 2 }),
        (error) => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID'
            && error.message.includes('必须从 1 开始连续递增'),
    );
    assert.throws(
        () => parseSubmittedScenePlan(buildResult(buildParameters({ images: [] })), {
            ...parseOptions,
            maxImages: 0,
        }),
        (error) => error.code === 'NO_IMAGE_TASKS',
    );

});

test('scene planner reports prompt expansion failures as their own category', () => {
    assert.equal(
        getScenePlannerErrorCategory(new ScenePlannerError('test', 'PROMPT_EXPANSION_FAILED')),
        ScenePlannerErrorCategory.PROMPT,
    );
});
