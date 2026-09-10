import test from 'node:test';
import assert from 'node:assert/strict';

import { createSceneSource } from '../scene-source.js';
import { insertScenePlacements } from '../scene-placement.js';
import {
    ScenePlannerError,
    ScenePlannerErrorCategory,
    createScenePlannerCorrectionResult,
    getScenePlannerCorrectionSignature,
    getScenePlannerErrorCategory,
    isScenePlannerCorrectionError,
    parseSubmittedScenePlan,
    toSceneCharacterPromptTag,
} from '../scene-plan-contract.js';
import { createSubmitScenePlanTool } from '../scene-plan-tool.js';
import { assembleCharacterPrompts } from '../character-prompts.js';

function buildParameters(overrides = {}) {
    return {
        mindful_prelude: {
            user_insight: '用户在描写雨夜重逢。',
            visual_plan: '画雨夜重逢，放在插图点 1 后；两名女性，已录入阿璃，未录入旅人，分别位于 C3/E5，使用雨夜逆光。',
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
    parameters.mindful_prelude.visual_plan += '随后画雨景，放在插图点 2 后，无人物，已录入和未录入角色均不出现。';
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
    assert.deepEqual(Object.keys(parsed), ['tasks']);

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

test('unordered and shared illustration points preserve each image and its intended placement', () => {
    const sceneSource = createSceneSource('First. Second.');
    const parameters = buildParameters({ images: [2, 1, 2].map((point, index) => ({
        insert_after: point,
        scene: `scene-${index}`,
        characters: [],
    })) });
    const { tasks } = parseSubmittedScenePlan(buildResult(parameters), { sceneSource, maxImages: 3 });
    assert.deepEqual(tasks.map(task => task.placement.insertAfter), [2, 1, 2]);
    assert.deepEqual(tasks.map(task => task.scene), ['scene-0', 'scene-1', 'scene-2']);
    const placed = insertScenePlacements(sceneSource.sourceText, tasks.map((task, index) => ({
        placement: task.placement,
        content: `[image:${index}]`,
    })));
    assert.equal(placed, 'First. [image:1]Second.[image:0][image:2]');
});

test('scene plan tool schema applies exact image count and character cap', () => {
    const tool = createSubmitScenePlanTool({ maxImages: 3, maxCharactersPerImage: 2 });
    const schema = tool.function.parameters.properties.images;
    assert.deepEqual(tool.function.parameters.required, ['mindful_prelude', 'images']);
    assert.equal(schema.minItems, 3);
    assert.equal(schema.maxItems, 3);
    assert.deepEqual(schema.items.required, ['index', 'insert_after', 'scene', 'characters']);
    assert.equal(schema.items.additionalProperties, false);
    assert.equal(schema.items.properties.characters.maxItems, 2);
    assert.deepEqual(schema.items.properties.characters.items.required, ['name', 'action']);
    assert.equal(schema.items.properties.characters.items.properties.action.minLength, 1);
    assert.equal(schema.items.properties.characters.items.additionalProperties, false);
    assert.equal(schema.items.properties.characters.items.properties.type.type, 'string');
    assert.equal(schema.items.properties.characters.items.properties.type.enum, undefined);
    const preludeSchema = tool.function.parameters.properties.mindful_prelude;
    assert.deepEqual(preludeSchema.required, ['user_insight', 'visual_plan']);
    assert.equal(preludeSchema.additionalProperties, false);
    assert.deepEqual(Object.keys(preludeSchema.properties), ['user_insight', 'visual_plan']);
    for (const field of Object.values(preludeSchema.properties)) {
        assert.equal(field.type, 'string');
        assert.equal(field.minLength, 1);
    }

    const boundedTool = createSubmitScenePlanTool({ insertPointCount: 2 });
    const boundedImages = boundedTool.function.parameters.properties.images;
    const backendBounded = createSubmitScenePlanTool({
        maxImages: 0,
        maxPlanImages: 20,
        insertPointCount: 30,
    }).function.parameters.properties;
    assert.equal(backendBounded.images.minItems, 1);
    assert.equal(backendBounded.images.maxItems, 20);
    assert.equal(boundedImages.minItems, 1);
    assert.equal(boundedImages.maxItems, undefined);
    assert.equal(boundedImages.items.properties.insert_after.maximum, 2);
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

    for (const missingField of ['appear']) {
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

});

test('missing, null or empty action does not invent character prompt content', () => {
    const knownCharacters = [{ name: '阿璃', type: 'girl', appearance: 'silver hair' }];
    for (const action of [undefined, null, '', '   ']) {
        const parameters = buildParameters();
        parameters.images[0].characters = [
            { name: '小璃' },
            { name: '旅人', type: 'woman', appear: 'black hair' },
        ].map(character => ({ ...character, ...(action === undefined ? {} : { action }) }));
        const { tasks } = parseSubmittedScenePlan(buildResult(parameters), parseOptions);
        assert.deepEqual(tasks[0].chars.map(character => character.action), ['', '']);
        assert.deepEqual(assembleCharacterPrompts(tasks[0].chars, knownCharacters).map(character => character.prompt),
            ['girl, silver hair', 'woman, black hair']);
    }
});

test('optional text null means omitted but unrelated JSON types still fail', () => {
    for (const name of ['小璃', '旅人']) {
        const baseline = buildParameters();
        baseline.images[0].characters = [{ name, ...(name === '旅人' ? { appear: 'black hair' } : {}) }];
        const expected = parseSubmittedScenePlan(buildResult(baseline), parseOptions);
        const fields = ['type', 'danbooru', 'costume', 'action', 'interact', 'uc',
            ...(name === '小璃' ? ['appear'] : [])];
        for (const field of fields) {
            for (const value of [null, true, 12, [], {}]) {
                const parameters = structuredClone(baseline);
                parameters.images[0].characters[0][field] = value;
                if (value === null) {
                    assert.deepEqual(parseSubmittedScenePlan(buildResult(parameters), parseOptions), expected);
                } else {
                    assert.throws(() => parseSubmittedScenePlan(buildResult(parameters), parseOptions),
                        error => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID'
                            && error.details.path === `images[0].characters[0].${field}`);
                }
            }
        }
    }
});

test('image indices come from array order without changing scenes or placement', () => {
    const baseline = buildParameters();
    baseline.images.push({ index: 2, insert_after: 2, scene: 'rainy street', characters: [] });
    const options = { ...parseOptions, maxImages: 2 };
    const expected = parseSubmittedScenePlan(buildResult(baseline), options);
    for (const indices of [[undefined, undefined], [1, 1], [3, 9], [2, 1], [0, -1], [null, 'second'], [{}, []]]) {
        const parameters = structuredClone(baseline);
        parameters.images.forEach((image, index) => {
            delete image.index;
            if (indices[index] !== undefined) image.index = indices[index];
        });
        const parsed = parseSubmittedScenePlan(buildResult(parameters), options);
        assert.deepEqual(parsed, expected);
        assert.deepEqual(parsed.tasks.map(task => task.index), [1, 2]);
    }
});

test('extra image and character fields are discarded rather than forwarded to compilation', () => {
    const baseline = buildParameters();
    const parameters = structuredClone(baseline);
    Object.assign(parameters.images[0], {
        anchor: 'other placement', negative: 'extra negative', comment: { note: true },
        characterPrompts: [{ name: 'override', prompt: 'extra prompt' }],
        chars: [{ name: 'override', appear: 'extra appearance' }],
        placement: { insertAfter: 2 },
    });
    for (const character of parameters.images[0].characters) {
        Object.assign(character, {
            nickname: 'other name', prompt: 'extra prompt', appearance: 'extra appearance',
            notes: { detail: ['ignored'] },
        });
    }
    assert.deepEqual(
        parseSubmittedScenePlan(buildResult(parameters), parseOptions),
        parseSubmittedScenePlan(buildResult(baseline), parseOptions),
    );
});

test('scene plan execution accepts absent or invalid planning notes and trusts images placement', () => {
    const withoutPrelude = buildParameters();
    delete withoutPrelude.mindful_prelude;
    assert.equal(
        parseSubmittedScenePlan(buildResult(withoutPrelude), parseOptions).tasks[0].placement.insertAfter,
        1,
    );

    for (const field of ['user_insight', 'visual_plan']) {
        for (const value of [null, {}, [], '', '   ']) {
            const invalidPrelude = buildParameters();
            invalidPrelude.mindful_prelude[field] = value;
            const parsed = parseSubmittedScenePlan(buildResult(invalidPrelude), parseOptions);
            assert.deepEqual(Object.keys(parsed), ['tasks']);
            assert.equal(parsed.tasks[0].placement.insertAfter, 1);
        }
    }

    const conflictingPrelude = buildParameters();
    conflictingPrelude.mindful_prelude.visual_plan = '计划把画面放在插图点 2 后。';
    assert.equal(
        parseSubmittedScenePlan(buildResult(conflictingPrelude), parseOptions).tasks[0].placement.insertAfter,
        1,
    );

    const differentNotes = {
        analysis: { shots: [2, 3], characters: 'not executable' },
        negative: 'not a drawing parameter at the root',
        images: withoutPrelude.images,
    };
    assert.deepEqual(
        parseSubmittedScenePlan(buildResult(differentNotes), parseOptions),
        parseSubmittedScenePlan(buildResult(withoutPrelude), parseOptions),
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
    assert.equal(parseSubmittedScenePlan(buildResult(parameters), parseOptions).tasks[0].chars[0].type, 'no humans');
});

test('character type is prompt text, including multilingual, custom, empty and omitted values', () => {
    for (const type of ['女孩', '少女', 'mature Female', 'elf', '', null, undefined]) {
        const parameters = buildParameters();
        parameters.images[0].characters = [{
            name: '旅人', appear: 'black hair', action: 'standing',
            ...(type === undefined ? {} : { type }),
        }];
        const { tasks } = parseSubmittedScenePlan(buildResult(parameters), parseOptions);
        assert.equal(tasks[0].chars[0].type, type || '');
        assert.equal(assembleCharacterPrompts(tasks[0].chars)[0].prompt,
            [type, 'black hair', 'standing'].filter(Boolean).join(', '));
    }
    for (const type of [true, 12, [], {}]) {
        const parameters = buildParameters();
        parameters.images[0].characters[1].type = type;
        assert.throws(() => parseSubmittedScenePlan(buildResult(parameters), parseOptions),
            error => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID'
                && error.details.path === 'images[0].characters[1].type');
    }
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

test('scene plan contract retains required content, placement, count, and coordinate checks', () => {
    const cases = [
        [() => ({ analysis: 'no images' }), 'parameters.images'],
        [() => {
            const value = buildParameters();
            delete value.images[0].scene;
            return value;
        }, 'images[0].scene'],
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
            delete value.images[0].characters;
            return value;
        }, 'images[0].characters'],
        [() => {
            const value = buildParameters();
            delete value.images[0].characters[0].name;
            return value;
        }, 'images[0].characters[0].name'],
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
    for (const invalidText of [null, '', '   ', 12, true, [], {}]) {
        cases.push(
            [() => {
                const value = buildParameters();
                value.images[0].scene = invalidText;
                return value;
            }, 'images[0].scene'],
            [() => {
                const value = buildParameters();
                value.images[0].characters[0].name = invalidText;
                return value;
            }, 'images[0].characters[0].name'],
            [() => {
                const value = buildParameters();
                value.images[0].characters[1].appear = invalidText;
                return value;
            }, 'images[0].characters[1].appear'],
        );
    }

    for (const [build, expectedPath, expectedCode = 'TOOL_ARGUMENTS_SCHEMA_INVALID'] of cases) {
        assert.throws(
            () => parseSubmittedScenePlan(buildResult(build()), parseOptions),
            (error) => error.code === expectedCode
                && error.message.includes(expectedPath),
        );
    }

    for (const limits of [{ maxImages: 2 }, { maxCharactersPerImage: 1 }]) {
        assert.throws(
            () => parseSubmittedScenePlan(buildResult(), { ...parseOptions, ...limits }),
            error => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID',
        );
    }
    for (const centerMode of ['grid', 'normalized']) {
        const parameters = buildParameters();
        parameters.images[0].characters[0].center = null;
        assert.throws(
            () => parseSubmittedScenePlan(buildResult(parameters), { ...parseOptions, centerMode }),
            error => error.code === 'TOOL_ARGUMENTS_SCHEMA_INVALID'
                && error.details.path === 'images[0].characters[0].center',
        );
    }
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
