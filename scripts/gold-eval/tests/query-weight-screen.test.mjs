import assert from 'node:assert/strict';
import test from 'node:test';

// The integration screen is exercised on frozen private captures. This unit contract
// only protects that the module remains importable without starting the CLI or network.
import { runQueryWeightScreen } from '../experiments/query-weight-screen.mjs';

test('H-Q-DENSE screen 导出显式入口且导入不触发网络', () => {
    assert.equal(typeof runQueryWeightScreen, 'function');
});
