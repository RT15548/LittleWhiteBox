import test from 'node:test';
import assert from 'node:assert/strict';

import { expandScenePlannerTask } from '../scene-prompt-expansion.js';

test('scene prompt expansion preserves macro order, reads live host state, and isolates prompt-ready listeners', async () => {
    const calls = [];
    const host = { name1: 'USER', name2: 'ASSISTANT' };
    const runtime = {
        chat: [{ is_user: true, mes: '历史消息' }],
        get name1() {
            return host.name1;
        },
        get name2() {
            return host.name2;
        },
        replaceXbGetVarInString: (text) => {
            calls.push('xbgetvar');
            return text.replace('{{xbgetvar::local}}', 'LOCAL');
        },
        replaceXbGetVarYamlInString: (text) => {
            calls.push('xbgetvar_yaml');
            return text.replace('{{xbgetvar_yaml::global}}', 'GLOBAL');
        },
        substituteParams: (text) => {
            calls.push('substituteParams');
            return text.replace('{{persona}}', 'PERSONA').replace('{{getvar::root}}', 'HOSTVAR');
        },
        promptReadyEvent: 'prompt-ready',
        eventSource: {
            emit: async (_event, payload) => {
                calls.push('prompt-ready');
                payload.chat[0].content = 'MUTATED';
            },
        },
    };

    host.name1 = '新主人';
    const task = await expandScenePlannerTask({
        systemPrompt: '{{xbgetvar::local}} {{xbgetvar_yaml::global}} {{persona}} {{getvar::root}} {$history1}',
        messages: [{ role: 'user', content: '{{xbgetvar::local}}' }],
        tools: [],
    }, { runtime });

    assert.match(task.systemPrompt, /LOCAL GLOBAL PERSONA HOSTVAR/);
    // `name1` changed after the runtime was created; the live getter must be used.
    assert.match(task.systemPrompt, /新主人：\n历史消息/);
    assert.equal(task.systemPrompt.startsWith('MUTATED'), false);
    assert.deepEqual(calls.slice(0, 3), ['xbgetvar', 'xbgetvar_yaml', 'substituteParams']);
    assert.equal(calls.includes('getvar'), false);
    assert.equal(calls.at(-1), 'prompt-ready');
});
