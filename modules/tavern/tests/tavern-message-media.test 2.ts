import assert from 'node:assert/strict';
import test from 'node:test';
import {
    releasedTavernMessageImageState,
    shouldEnsureTavernMessageImage,
} from '../app-src/features/phone-os/apps/messages/tavern-message-media';

test('released message images preserve terminal failures and turn active work into explicit retry state', () => {
    const failed = { status: 'error' as const, error: '供应商失败' };
    assert.equal(releasedTavernMessageImageState(failed), failed);
    assert.deepEqual(releasedTavernMessageImageState({ status: 'generating' }), {
        status: 'error',
        error: '图片生成已停止，点击重试可继续',
    });
    assert.equal(releasedTavernMessageImageState({ status: 'ready', url: 'data:image/png;base64,x' }), null);
});

test('message image failures never auto-regenerate without an explicit retry', () => {
    assert.equal(shouldEnsureTavernMessageImage({ status: 'error', error: '已取消图片生成' }), false);
    assert.equal(shouldEnsureTavernMessageImage({ status: 'error', error: '供应商失败' }, true), true);
    assert.equal(shouldEnsureTavernMessageImage({ status: 'idle' }), true);
});
