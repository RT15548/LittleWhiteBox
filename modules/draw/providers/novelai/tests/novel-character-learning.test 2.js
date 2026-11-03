import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveAutoLearnCharacter } from '../novel-character-learning.js';
import { parseSubmittedScenePlan } from '../../../shared/scene-plan-contract.js';
import { createSceneSource } from '../../../shared/scene-source.js';
import { assembleCharacterPrompts } from '../../../shared/character-prompts.js';

test('auto-learning updates an enabled same-name or alias record before disabled matches', () => {
    const disabled = { id: 'disabled', name: '阿璃', enabled: false };
    const enabledByAlias = { id: 'enabled', name: '璃璃', aliases: ['阿璃'], enabled: true };

    assert.deepEqual(resolveAutoLearnCharacter({ name: '阿璃', type: '' }, [disabled, enabledByAlias]), {
        action: 'update',
        character: enabledByAlias,
    });
});

test('auto-learning skips creation when only disabled same-name or alias records exist', () => {
    const disabledByAlias = { id: 'disabled', name: '璃璃', aliases: ['阿璃'], enabled: false };

    assert.deepEqual(resolveAutoLearnCharacter({ name: '阿璃', type: 'woman' }, [disabledByAlias]), {
        action: 'skip',
        character: null,
    });
    assert.deepEqual(resolveAutoLearnCharacter({ name: '新角色', type: 'woman' }, [disabledByAlias]), {
        action: 'create',
        character: null,
    });
});

test('missing character type remains drawable without creating an invented library identity', () => {
    for (const type of [undefined, null, '', '   ', 'man', '成年男性']) {
        const { tasks } = parseSubmittedScenePlan({
            toolCalls: [{ name: 'submit_scene_plan', arguments: JSON.stringify({
                images: [{ insert_after: 1, scene: 'rain', characters: [{
                    name: '亚瑟', appear: 'old man, grey beard',
                    ...(type === undefined ? {} : { type }),
                }] }],
            }) }],
        }, { sceneSource: createSceneSource('亚瑟站在雨中。') });
        const candidate = tasks[0].chars[0];
        const hasType = typeof type === 'string' && type.trim().length > 0;
        assert.equal(resolveAutoLearnCharacter(candidate).action, hasType ? 'create' : 'skip');
        assert.equal(assembleCharacterPrompts(tasks[0].chars)[0].prompt,
            hasType ? `${type}, old man, grey beard` : 'old man, grey beard');
    }
});
