import test from 'node:test';
import assert from 'node:assert/strict';

import { comparePromptPair } from '../experiments/prompt-candidate-audit.mjs';

function capture({ promptHit, surface, eventId, promptHash }) {
    return {
        cases: [{ id: 'case-1', category: 'fact' }],
        prompts: [{
            caseId: 'case-1',
            promptHash,
            sourcePromptHash: promptHash === 'arm' ? 'base' : undefined,
            promptChars: promptHash.length,
            evidenceTrace: { prompt: [{ source: 'direct-event', unitId: `event:${eventId}`, floor: 1 }] },
        }],
        stageTraces: [{
            id: 'case-1',
            stages: { prompt: promptHit ? 'hit' : 'miss' },
            answerSurfaceInPrompt: { applicable: true, matched: surface },
        }],
    };
}

test('candidate audit 按 case 配对 Prompt、surface 与 screen 事件序列', () => {
    const result = comparePromptPair({
        id: 'fixture',
        source: capture({ promptHit: false, surface: false, eventId: 'old', promptHash: 'base' }),
        candidate: capture({ promptHit: true, surface: true, eventId: 'new', promptHash: 'arm' }),
        expectedArmByCase: new Map([['case-1', ['new']]]),
    });
    assert.deepEqual(result.summary.prompt, { eligible: 1, wins: 1, losses: 0, ties: 0, net: 1 });
    assert.deepEqual(result.summary.answerSurface, { eligible: 1, wins: 1, losses: 0, ties: 0, net: 1 });
    assert.equal(result.summary.screenAlignmentMismatches, 0);
});
