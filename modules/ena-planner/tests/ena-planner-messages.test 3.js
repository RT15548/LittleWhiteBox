import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildPlannerTurnMessages } from '../ena-planner-messages.js';
import { migratePlannerPromptConfig } from '../ena-planner-prompt-migration.js';
import { BUILTIN_TEMPLATES, DEFAULT_PROMPT_BLOCKS } from '../ena-planner-presets.js';

const render = async content => content;
// Frozen block from upstream/main at 66cb1001, not reconstructed from current defaults.
const upstreamSeed = JSON.parse(await readFile(new URL('./fixtures/upstream-assistant-seed.json', import.meta.url), 'utf8'));

test('default and built-in planner requests end in user messages without assistant prefill', async () => {
    for (const blocks of [DEFAULT_PROMPT_BLOCKS, ...Object.values(BUILTIN_TEMPLATES)]) {
        assert.equal(blocks.at(-1).role, 'user');
        const messages = await buildPlannerTurnMessages('player-input', blocks, render);
        assert.deepEqual(messages, [{
            role: 'user',
            content: ['player-input', ...blocks.filter(block => block.role === 'user').map(block => block.content)].join('\n\n'),
        }]);
    }
});

test('bottom user blocks merge into the request in order without duplicating system context', async () => {
    const blocks = [
        { role: 'user', content: 'instruction-a' },
        { role: 'system', content: 'context' },
        { role: 'user', content: 'instruction-b' },
        { role: 'user', content: '  ' },
    ];
    const original = structuredClone(blocks);
    const messages = await buildPlannerTurnMessages('player-input', blocks, async content => `${content}-rendered`);
    assert.deepEqual(messages, [
        { role: 'user', content: 'player-input\n\ninstruction-a-rendered\n\ninstruction-b-rendered' },
    ]);
    assert.deepEqual(blocks, original);
});

test('requests without user blocks still end in user input', async () => {
    for (const blocks of [[], [{ role: 'system', content: 'context' }]]) {
        const messages = await buildPlannerTurnMessages('player-input', blocks, render);
        assert.deepEqual(messages.at(-1), { role: 'user', content: 'player-input' });
    }
});

test('upstream saved seed upgrades in active prompts and templates without losing custom data', async () => {
    const customAssistant = { id: 'custom-bottom', role: 'assistant', name: 'custom', content: 'custom-request' };
    const config = {
        enabled: false,
        promptBlocks: [structuredClone(upstreamSeed), structuredClone(customAssistant)],
        promptTemplates: {
            saved: [structuredClone(upstreamSeed)],
            edited: [{ ...upstreamSeed, content: 'custom-content', name: 'custom-name' }],
        },
    };
    const original = structuredClone(config);
    const upgraded = migratePlannerPromptConfig(config);
    assert.deepEqual(upgraded, {
        ...original,
        promptBlocks: [{ ...upstreamSeed, role: 'user' }, { ...customAssistant, role: 'user' }],
        promptTemplates: {
            saved: [{ ...upstreamSeed, role: 'user' }],
            edited: [{ ...original.promptTemplates.edited[0], role: 'user' }],
        },
    });
    const messages = await buildPlannerTurnMessages('player-input', upgraded.promptBlocks, render);
    assert.deepEqual(messages, [{
        role: 'user',
        content: ['player-input', upstreamSeed.content, customAssistant.content].join('\n\n'),
    }]);
    const once = structuredClone(upgraded);
    assert.deepEqual(migratePlannerPromptConfig(upgraded), once);
});

test('prompt rendering errors propagate instead of sending an incomplete request', async () => {
    const error = new Error('render failed');
    await assert.rejects(buildPlannerTurnMessages('player-input', DEFAULT_PROMPT_BLOCKS, async () => {
        throw error;
    }), caught => caught === error);
});
