import test from 'node:test';
import assert from 'node:assert/strict';

import {
    hasRenderableLiveAssistantContent,
    hasRenderableLiveAssistantMarkdown,
} from '../app-src/components/chat/live-assistant-state';
import { createActionCheckEvent } from '../shared/runtime-events';

test('live assistant visibility treats action-check events as renderable content', () => {
    const event = createActionCheckEvent({
        action: 'Pick the lock',
        stat: 'Finesse',
        difficulty: 12,
        roll: 17,
        success: true,
        insertAfterChars: 0,
    });

    assert.equal(hasRenderableLiveAssistantContent({
        text: '',
        thoughts: [],
        actionCheckEvents: [event],
    }), true);
    assert.equal(hasRenderableLiveAssistantMarkdown({
        text: '',
        actionCheckEvents: [event],
    }), true);
});

test('live assistant visibility stays false for empty streaming state', () => {
    assert.equal(hasRenderableLiveAssistantContent({
        text: '',
        thoughts: [],
        actionCheckEvents: [],
    }), false);
    assert.equal(hasRenderableLiveAssistantMarkdown({
        text: '',
        actionCheckEvents: [],
    }), false);
});
