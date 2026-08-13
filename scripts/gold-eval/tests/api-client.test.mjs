import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveGoogleThinkingConfig } from '../../story-summary-replay/api-client.mjs';

test('Google reader 将支持的 reasoning effort 映射为真实 thinkingConfig', () => {
    assert.equal(resolveGoogleThinkingConfig('none'), null);
    assert.deepEqual(resolveGoogleThinkingConfig('minimal'), { thinkingLevel: 'MINIMAL' });
    assert.deepEqual(resolveGoogleThinkingConfig('low'), { thinkingLevel: 'LOW' });
    assert.deepEqual(resolveGoogleThinkingConfig('medium'), { thinkingLevel: 'MEDIUM' });
    assert.deepEqual(resolveGoogleThinkingConfig('high'), { thinkingLevel: 'HIGH' });
    assert.equal(resolveGoogleThinkingConfig(''), null);
    assert.throws(() => resolveGoogleThinkingConfig('max'), /不支持/);
});
