import assert from 'node:assert/strict';
import test from 'node:test';

import { ScenePlannerError } from '../scene-plan-contract.js';
import { classifyScenePlannerErrorForUi } from '../scene-planner-error-ui.js';

const errorTypes = {
    INPUT: { code: 'input', desc: 'input' },
    AGENT_CONFIG: { code: 'agent_config', desc: 'config' },
    PROMPT_EXPANSION: { code: 'prompt_expansion', desc: 'prompt' },
    TOOL_PROTOCOL: { code: 'tool_protocol', desc: 'tool' },
    SCENE_SCHEMA: { code: 'scene_schema', desc: 'schema' },
    TIMEOUT: { code: 'timeout', desc: 'timeout' },
    ABORTED: { code: 'aborted', desc: 'aborted' },
    PROVIDER: { code: 'provider', desc: 'provider' },
    LLM: { code: 'llm', desc: 'llm' },
};

test('scene planner UI classification keeps prompt expansion distinct from LLM failures', () => {
    const classified = classifyScenePlannerErrorForUi(
        new ScenePlannerError('宏展开失败', 'PROMPT_EXPANSION_FAILED'),
        errorTypes,
    );

    assert.equal(classified.code, 'prompt_expansion');
    assert.equal(classified.desc, '宏展开失败');
});

test('scene planner UI classification treats missing source content as an input failure', () => {
    for (const code of ['EMPTY_MESSAGE', 'NO_INSERT_POINTS', 'IMAGE_LIMIT_EXCEEDED']) {
        const classified = classifyScenePlannerErrorForUi(
            new ScenePlannerError('正文没有可用插图位置', code),
            errorTypes,
        );
        assert.equal(classified.code, 'input');
        assert.equal(classified.desc, '正文没有可用插图位置');
    }
});
