import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveAutoLearnCharacter } from '../novel-character-learning.js';

test('auto-learning updates an enabled same-name or alias record before disabled matches', () => {
    const disabled = { id: 'disabled', name: '阿璃', enabled: false };
    const enabledByAlias = { id: 'enabled', name: '璃璃', aliases: ['阿璃'], enabled: true };

    assert.deepEqual(resolveAutoLearnCharacter('阿璃', [disabled, enabledByAlias]), {
        action: 'update',
        character: enabledByAlias,
    });
});

test('auto-learning skips creation when only disabled same-name or alias records exist', () => {
    const disabledByAlias = { id: 'disabled', name: '璃璃', aliases: ['阿璃'], enabled: false };

    assert.deepEqual(resolveAutoLearnCharacter('阿璃', [disabledByAlias]), {
        action: 'skip',
        character: null,
    });
    assert.deepEqual(resolveAutoLearnCharacter('新角色', [disabledByAlias]), {
        action: 'create',
        character: null,
    });
});
