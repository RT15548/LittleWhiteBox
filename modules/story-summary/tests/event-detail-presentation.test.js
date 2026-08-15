import assert from 'node:assert/strict';
import test from 'node:test';

import { formatEventDetailPromptLine } from '../generate/event-detail-presentation.js';

test('detail presentation binds temporal marker and original speaker', () => {
    const line = formatEventDetailPromptLine({
        floor: 303,
        isUser: true,
        speaker: '玛雅',
        text: '原话内容',
        _detailTemporalCarrier: true,
        _detailTemporalMarker: '113年11月20日03:38',
    }, { userName: 'unused', characterName: '魈' });

    assert.equal(
        line,
        '  › 【113年11月20日03:38·同一回合】 #304 [玛雅] 原话内容',
    );
});
