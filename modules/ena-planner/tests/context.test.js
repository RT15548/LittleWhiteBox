import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPlannerContext, replacePlannerSlot } from '../ena-planner-context.js';
import { renderPlannerEjs } from '../ena-planner-ejs.js';
import { migratePlannerPromptConfig } from '../ena-planner-prompt-migration.js';

// Contracts: no credentials/media/tool capabilities cross the projection;
// rendered text is never evaluated twice; filling a slot preserves the native
// protocol; obsolete settings are removed without losing user prompts.
test('only text, roles and names enter the planner', () => {
    const messages = [{ role: 'user', name: 'User', content: [
        { type: 'text', text: 'current memory' },
        { type: 'image_url', image_url: { url: 'private-image' } },
        { type: 'input_audio', input_audio: { data: 'private-audio' } },
    ], api_key: 'secret', tool_calls: [{ function: { arguments: 'private' } }] },
    { role: 'assistant', content: null, tool_calls: [{ id: 'tool' }] }];
    assert.deepEqual(projectPlannerContext(messages), [
        { role: 'user', name: 'User', content: 'current memory' },
    ]);
});

test('slot replacement preserves media, roles, tool metadata and text completion prefix', () => {
    const media = { type: 'image_url', image_url: { url: 'image' } };
    const original = [{ role: 'user', content: [{ type: 'text', text: 'input SLOT' }, media] },
        { role: 'assistant', content: 'prefix', tool_calls: [] }];
    const filled = replacePlannerSlot(original, 'SLOT', '<plot>$&</plot>');
    assert.equal(filled.count, 1);
    assert.equal(original[0].content[0].text, 'input SLOT');
    assert.equal(filled.prompt[0].content[0].text, 'input <plot>$&</plot>');
    assert.equal(filled.prompt[0].content[1], media);
    assert.deepEqual(filled.prompt[1], original[1]);
    assert.deepEqual(replacePlannerSlot('User: SLOT\nAssistant:', 'SLOT', 'plan'),
        { count: 1, prompt: 'User: plan\nAssistant:' });
    assert.equal(replacePlannerSlot('SLOT SLOT', 'SLOT', '').count, 2);
});

test('planner-owned EJS uses the extension once, preserving literal output', async () => {
    const calls = [];
    const template = { async evalTemplate(...args) { calls.push(args); return 'literal <%= preserved %>'; } };
    const input = '<%- await getwi(null, "stage") %>';
    assert.equal(await renderPlannerEjs(input, template), 'literal <%= preserved %>');
    assert.deepEqual(calls, [[input]]);
    assert.equal(await renderPlannerEjs('ordinary lore', null), 'ordinary lore');
});

test('unavailable and failed planner-owned EJS reject instead of returning source', async () => {
    for (const template of [null, { evalTemplate() {}, getFeatures: () => ({ enabled: false }) }]) {
        await assert.rejects(renderPlannerEjs('<%= value %>', template), { code: 'PLANNER_EJS_UNAVAILABLE' });
    }
    const cause = new ReferenceError('fixture');
    await assert.rejects(renderPlannerEjs('<%= value %>', { evalTemplate() { throw cause; } }),
        error => error.code === 'PLANNER_EJS_FAILED' && error.cause === cause);
});

test('native-context migration preserves user prompt contents and output selection', () => {
    const config = { enabled: true, includeGlobalWorldbooks: false, excludeWorldbookPosition4: true,
        worldbookExcludeNames: ['mvu_update'], chatExcludeTags: ['state'], plotCount: 3,
        promptBlocks: [{ role: 'system', content: 'kept' }], responseKeepTags: ['plot'] };
    assert.deepEqual(migratePlannerPromptConfig(config), {
        enabled: true, promptBlocks: [{ role: 'system', content: 'kept' }], responseKeepTags: ['plot'],
    });
});
