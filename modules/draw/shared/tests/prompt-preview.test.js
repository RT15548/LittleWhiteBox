import assert from 'node:assert/strict';
import test from 'node:test';

import { getPromptChainPreview as getNovelPreview } from '../../providers/novelai/novel-prompts.js';
import { getPromptChainPreview as getSdPreview } from '../../providers/sd-webui/sd-prompts.js';
import { getPromptChainPreview as getComfyPreview } from '../../providers/comfyui/comfy-prompts.js';

const EXPECTED_SECTION_KEYS = [
    'assistantDoc',
    'assistantAskBackground',
    'userWorldInfo',
    'assistantAskContent',
    'userContent',
    'sceneRules',
    'assistantCheck',
    'userConfirm',
];

test('all provider previews expose the real system plus single-user request shape', () => {
    for (const [provider, getPreview] of [
        ['NovelAI', getNovelPreview],
        ['SD WebUI', getSdPreview],
        ['ComfyUI', getComfyPreview],
    ]) {
        const preview = getPreview({ tagGuideContent: 'loaded guide' });
        assert.deepEqual(preview.map(item => item.role), ['system', 'user'], `${provider} 顶层必须只有两个消息节点`);
        assert.equal(preview[1].key, 'userTask');
        assert.deepEqual(
            preview[1].sections.map(section => section.key),
            EXPECTED_SECTION_KEYS,
            `${provider} 必须在单条 user 节点内保留全部顺序段落`,
        );
    }
});
