import assert from 'node:assert/strict';
import test from 'node:test';

import { parseSubmittedScenePlan } from '../scene-plan-contract.js';
import { createSceneSource } from '../scene-source.js';

const parameters = {
    images: [{
        insert_after: 1,
        scene: 'portrait, sign "hello", literal { [ } ], slash \\, line\n二',
        characters: [{ name: '阿璃', action: 'holding "[{}]"', center: { x: 0.3, y: 0.7 } }],
    }, {
        insert_after: 1,
        scene: 'landscape, snow',
        characters: [],
    }],
};
const options = {
    sceneSource: createSceneSource('阿璃推开门。'),
    presentCharacters: [{ name: '阿璃' }],
    maxImages: 2,
    centerMode: 'normalized',
};
const validArguments = JSON.stringify(parameters);

function resultFor(args, extra = {}) {
    return { toolCalls: [{ name: 'submit_scene_plan', arguments: args }], ...extra };
}

test('valid scene arguments bypass repair and preserve the existing result and input', () => {
    const expected = parseSubmittedScenePlan(resultFor(validArguments), options);
    for (const args of [validArguments, ` \n${validArguments}\t`, structuredClone(parameters)]) {
        const result = resultFor(args);
        const before = structuredClone(result);
        assert.deepEqual(parseSubmittedScenePlan(result, options), expected);
        assert.deepEqual(result, before);
        assert.deepEqual(Object.keys(expected), ['tasks']);
    }
});

test('scene argument repair only edits the shell after a complete images array, preserving every image and string', () => {
    const expected = parseSubmittedScenePlan(resultFor(validArguments), options);
    const cases = [
        [validArguments.slice(0, -1), 'missing_root_closer'],
        [` \n${validArguments.slice(0, -1)}\r\n`, 'missing_root_closer'],
        [`${validArguments}}`, 'trailing_closers'],
        [`${validArguments}\r\n ] } ]\t`, 'trailing_closers'],
    ];
    for (const [args, kind] of cases) {
        const result = resultFor(args);
        const before = structuredClone(result);
        const parsed = parseSubmittedScenePlan(result, options);
        assert.deepEqual(parsed.tasks, expected.tasks);
        assert.deepEqual(result, before);
        const repair = parsed.argumentRepair;
        assert.equal(repair.kind, kind);
        assert.equal(args.slice(repair.offset), repair.removed);
        const repaired = args.slice(0, repair.offset) + repair.inserted;
        assert.deepEqual(JSON.parse(repaired), parameters);
    }
});

test('scene argument repair refuses incomplete, ambiguous, mixed-protocol, or non-shell damage', () => {
    const image = JSON.stringify(parameters.images[0]);
    const cases = [
        validArguments.slice(0, -2), // The images array itself is unfinished.
        `{"images":[${image},`, // Another image was started, not a missing root brace.
        `{"images":[${image.slice(0, -1)}`, // Unfinished image object.
        '{"images":[{"insert_after":1,"scene":"unfinished',
        '{"images":[{"insert_after":1,"scene":"bad "quote"","characters":[]}]} }',
        '{"images":[{"insert_after":1,"scene":"bad\\x escape","characters":[]}]} }',
        validArguments.replace('"insert_after":1', '"insert_after":1,') + '}',
        validArguments.replace('"characters":[]', '"characters":[') + '}',
        validArguments.replace('"images":[', '"images":{') + '}',
        validArguments.slice(0, -1) + ']', // Wrong closer, not an extra suffix.
        validArguments.slice(0, -1) + ',}', // Do not repair trailing commas.
        validArguments + '{"images":[]}', // Do not discard another document.
        validArguments + ' explanation',
        validArguments + '</tool_call>',
        validArguments + '</｜DSML｜invoke>',
        '\uFEFF' + validArguments + '}', // Only bracket changes, no other cleanup.
        `{"images":[${image}],"images":[]}}`, // Do not discard duplicate images fields.
        `{"images":[${image}],"extra":1}}`, // No legacy/extra root fields in repair.
        `{"arguments":{},"images":[${image}]}}`, // Do not relocate images across levels.
        `{"images":[${image.replace('"insert_after":1', '"insert_after":99,"insert_after":1')}]}}`,
        `{"images":[${image.replace('"insert_after":1', '"insert_after":99,"insert_\\u0061fter":1')}]}}`,
    ];
    for (const args of cases) {
        const result = resultFor(args);
        const before = structuredClone(result);
        assert.throws(() => parseSubmittedScenePlan(result, options), { code: 'TOOL_ARGUMENTS_INVALID_JSON' }, args);
        assert.deepEqual(result, before);
    }
    for (const extra of [
        ...['length', 'MAX_TOKENS', 'max_output_tokens', 'incomplete', 'content_filter', 'SAFETY', 'stop_sequence', 'unknown']
            .map(finishReason => ({ finishReason })),
        { refused: true },
    ]) {
        assert.throws(
            () => parseSubmittedScenePlan(resultFor(validArguments.slice(0, -1), extra), options),
            { code: 'TOOL_ARGUMENTS_INVALID_JSON' },
        );
    }
    for (const finishReason of ['STOP', 'completed', 'end_turn', 'tool_use', 'tool_calls', 'function_call']) {
        assert.deepEqual(
            parseSubmittedScenePlan(resultFor(validArguments.slice(0, -1), { finishReason }), options).tasks,
            parseSubmittedScenePlan(resultFor(validArguments), options).tasks,
        );
    }
});

test('repair never bypasses placement, image count, character, coordinate, or required-field validation', () => {
    const cases = [
        [value => { value.images[0].insert_after = 99; }, 'INSERT_POINT_INVALID'],
        [value => { value.images.pop(); }],
        [value => { value.images[0].characters[0].center.x = 2; }],
        [value => { value.images[0].characters[0].name = '未知角色'; }],
        [value => { delete value.images[0].scene; }],
        [value => { value.images[0].characters = null; }],
        [value => { value.images = []; }, 'NO_IMAGE_TASKS'],
    ];
    for (const [change, code = 'TOOL_ARGUMENTS_SCHEMA_INVALID'] of cases) {
        const value = structuredClone(parameters);
        change(value);
        const json = JSON.stringify(value);
        for (const args of [json.slice(0, -1), json + '}']) {
            assert.throws(() => parseSubmittedScenePlan(resultFor(args), options), { code });
        }
    }
});
