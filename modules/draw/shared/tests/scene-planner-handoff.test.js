import test from 'node:test';
import assert from 'node:assert/strict';
import Ajv from 'ajv';
import {
    SCENE_PLANNER_HANDOFF_NAMES, SCENE_PLANNER_WORK_REQUIREMENTS,
    assertScenePlannerHandoffTools, assertScenePlannerHandoffContext, createScenePlannerHandoffTools,
    buildScenePlannerExchange, renderScenePlannerMessage, scenePlannerHandoffReceipt,
} from '../scene-planner-handoff.js';

const history = () => ['materials', 'guide', 'requirements', 'approval']
    .flatMap(kind => buildScenePlannerExchange(kind).map(item => renderScenePlannerMessage(item, item.template)));

test('long references live only in optional property descriptions; prefills call with an empty object', () => {
    const materials = 'fixture narrative "quote" \\ $&\nnext'.repeat(100);
    const guide = 'fixture guide'.repeat(200);
    const tools = createScenePlannerHandoffTools({ documents: { worldInfo: 'fixture world', content: materials, guide, rules: '  ', limits: 'fixture limits' } });
    assertScenePlannerHandoffContext(history(), tools);
    assert.deepEqual(tools.map(tool => tool.function.name), SCENE_PLANNER_HANDOFF_NAMES);
    const [materialFields, guideFields, requirementFields] = tools.map(tool => tool.function.parameters.properties);
    assert.deepEqual(Object.keys(materialFields), ['world_info', 'manuscript']);
    assert.deepEqual(Object.keys(guideFields), ['guidance', 'limits']);
    assert.ok(materialFields.manuscript.description.endsWith(materials));
    assert.ok(guideFields.guidance.description.endsWith(guide));
    assert.ok(requirementFields.requirements.description.endsWith(SCENE_PLANNER_WORK_REQUIREMENTS));
    assert.equal(Object.hasOwn(materialFields.manuscript, 'default'), false);
    for (const [index, kind] of ['materials', 'guide', 'requirements', 'approval'].entries()) {
        const tool = tools[index].function;
        // Azure's external tool-description limit must not truncate any reference text.
        assert.ok(tool.description.length <= 1024);
        assert.deepEqual(tool.parameters.required, []);
        assert.equal(new Ajv().compile(tool.parameters)({}), true);
        const pair = buildScenePlannerExchange(kind).map(item => renderScenePlannerMessage(item, item.template));
        assert.deepEqual(JSON.parse(pair[0].tool_calls[0].function.arguments), {});
        assert.equal(pair[0].tool_calls[0].function.name, tool.name);
        assert.equal(pair[0].tool_calls[0].id, pair[1].tool_call_id);
        assert.deepEqual(JSON.parse(pair[1].content), scenePlannerHandoffReceipt(tool.name));
        for (const content of [materials, guide, SCENE_PLANNER_WORK_REQUIREMENTS]) {
            assert.equal(JSON.stringify(pair).includes(content), false);
            assert.equal(tool.description.includes(content), false);
        }
    }
    assert.equal(scenePlannerHandoffReceipt('unknown'), undefined);
});

test('handoff admission rejects invalid references, required inputs, executable metadata and incomplete tools', () => {
    assert.throws(() => assertScenePlannerHandoffTools(new Array(4)), TypeError);
    for (const mutate of [
        tools => { delete tools[1]; },
        tools => tools.pop(),
        tools => tools.push(tools[0]),
        tools => { tools[1].function.name = tools[0].function.name; },
        tools => { tools[0].function.name = 'execute'; },
        tools => { tools[0].action = 'code'; },
        tools => { tools[0].function.parameters.properties.payload = { type: 'string', description: 'fixture' }; },
        tools => { tools[0].function.parameters.properties.manuscript.type = 'object'; },
        tools => { tools[0].function.parameters.properties.manuscript.description = ''; },
        tools => { tools[0].function.parameters.required = ['manuscript']; },
        tools => { delete tools[2].function.parameters.properties.requirements; },
        tools => { tools[0].function.parameters.additionalProperties = true; },
        tools => { tools[0].function.description = ''; },
        tools => { tools[0].function.description = 'x'.repeat(1025); },
    ]) {
        const tools = createScenePlannerHandoffTools({ documents: { content: 'fixture' } });
        mutate(tools);
        assert.throws(() => assertScenePlannerHandoffTools(tools), TypeError);
    }
    const original = createScenePlannerHandoffTools();
    const changed = createScenePlannerHandoffTools();
    changed[0].function.parameters.properties.extra = {};
    assertScenePlannerHandoffTools(original);
});

test('completed reference reads require their definitions and manuscript; genuine submit-only histories remain valid', () => {
    const messages = history();
    assert.throws(() => assertScenePlannerHandoffContext(messages), TypeError);
    assert.throws(() => assertScenePlannerHandoffContext(messages, createScenePlannerHandoffTools()), TypeError);
    assertScenePlannerHandoffContext(messages, createScenePlannerHandoffTools({ documents: { content: 'fixture' } }));
    assertScenePlannerHandoffContext([{ role: 'user', content: 'fixture request' }]);
});
