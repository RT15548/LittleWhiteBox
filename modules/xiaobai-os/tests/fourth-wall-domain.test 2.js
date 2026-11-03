import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createDefaultFourthWallChatState,
    createDefaultFourthWallGlobalSettings,
} from '../apps/fourth-wall/domain/defaults.js';
import { buildFourthWallPrompt } from '../apps/fourth-wall/domain/prompt.js';
import { projectGenerationProgress, projectGenerationResult } from '../apps/fourth-wall/domain/response-projection.js';
import {
    addSession,
    appendMessage,
    deleteSession,
    prepareRegeneration,
    renameSession,
    switchSession,
    updateChatSettings,
} from '../apps/fourth-wall/domain/state.js';

test('session actions return new state and protect the final session', () => {
    const original = createDefaultFourthWallChatState(1000);
    const added = addSession(original, { id: 'second', name: ' Second ', createdAt: 2000 });
    const renamed = renameSession(added, 'second', 'Renamed');
    const switched = switchSession(renamed, 'default');
    const deleted = deleteSession(switched, 'default');

    assert.equal(original.sessions.length, 1);
    assert.equal(added.activeSessionId, 'second');
    assert.equal(added.sessions[1].name, 'Second');
    assert.equal(renamed.sessions[1].name, 'Renamed');
    assert.equal(switched.activeSessionId, 'default');
    assert.deepEqual(deleted.sessions.map(session => session.id), ['second']);
    assert.equal(deleted.activeSessionId, 'second');
    assert.throws(
        () => deleteSession(createDefaultFourthWallChatState(1000), 'default'),
        error => error.code === 'LAST_SESSION',
    );
});

test('regeneration keeps history through the latest user message only', () => {
    let state = createDefaultFourthWallChatState(1000);
    state = appendMessage(state, 'default', { role: 'user', content: 'first', ts: 1001 });
    state = appendMessage(state, 'default', { role: 'ai', content: 'first answer', ts: 1002 });
    state = appendMessage(state, 'default', { role: 'user', content: 'retry this', ts: 1003 });
    state = appendMessage(state, 'default', { role: 'ai', content: 'old answer', ts: 1004 });

    const prepared = prepareRegeneration(state, 'default');

    assert.equal(prepared.userInput, 'retry this');
    assert.deepEqual(prepared.state.sessions[0].history.map(message => message.content), [
        'first',
        'first answer',
        'retry this',
    ]);
    assert.equal(state.sessions[0].history.length, 4);
});

test('chat limits accept their documented boundaries and reject values outside them', () => {
    const state = createDefaultFourthWallChatState(1000);

    assert.equal(updateChatSettings(state, { maxChatLayers: 1 }).settings.maxChatLayers, 1);
    assert.equal(state.settings.maxChatLayers, 20);
    assert.equal(updateChatSettings(state, { maxChatLayers: 9999 }).settings.maxChatLayers, 9999);
    assert.throws(
        () => updateChatSettings(state, { maxChatLayers: 0 }),
        error => error.code === 'INVALID_SETTINGS',
    );
    assert.throws(
        () => updateChatSettings(state, { maxChatLayers: 10000 }),
        error => error.code === 'INVALID_SETTINGS',
    );
});

test('prompt limits main chat layers without silently discarding supplied private history', () => {
    const built = buildFourthWallPrompt({
        userInput: 'new input',
        history: [
            { role: 'user', content: 'meta one', ts: 1000 },
            { role: 'ai', content: 'meta two', ts: 2000 },
            { role: 'user', content: 'meta three', ts: 3000 },
            { role: 'ai', content: 'meta four', ts: 4000 },
        ],
        chatSnapshot: {
            userName: 'User',
            characterName: 'Character',
            messages: [
                { isUser: true, text: 'main one' },
                { isUser: false, text: 'main two' },
                { isUser: true, text: 'main three' },
            ],
        },
        settings: { maxChatLayers: 2 },
        globalSettings: createDefaultFourthWallGlobalSettings(),
    });

    assert.equal(built.msg3.includes('main one'), false);
    assert.equal(built.msg3.includes('main two'), true);
    assert.equal(built.msg3.includes('main three'), true);
    assert.equal(built.msg3.includes('meta one'), true);
    assert.equal(built.msg3.includes('meta two'), true);
    assert.equal(built.msg3.includes('meta three'), true);
    assert.equal(built.msg3.includes('meta four'), true);
});

test('generation projection removes protocol tags and tolerates sparse provider thoughts', () => {
    assert.deepEqual(
        projectGenerationProgress({ text: '<thinking>draft</thinking><msg>partial</msg>' }),
        { text: 'partial', thinking: 'draft' },
    );
    assert.deepEqual(
        projectGenerationResult({
            text: '<thinking>done</thinking><msg>answer</msg>',
            thoughts: [null, { label: 'fallback', text: 'unused' }],
        }),
        { text: 'answer', thinking: 'done' },
    );
    assert.deepEqual(
        projectGenerationProgress({ text: '<thinking>still reasoning' }),
        { text: '', thinking: 'still reasoning' },
    );
    assert.deepEqual(
        projectGenerationResult({ text: '<thinking>reasoning only</thinking>' }),
        { text: '(no response)', thinking: 'reasoning only' },
    );
    assert.deepEqual(
        projectGenerationProgress({ text: 'plain provider text' }),
        { text: 'plain provider text', thinking: '' },
    );
});
