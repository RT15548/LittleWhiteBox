import test from 'node:test';
import assert from 'node:assert/strict';

import {
    DEFAULT_XB_TAVERN_WORLD_SETTINGS,
    buildXbTavernBrain,
    createXbTavernRuntimeState,
    createXbTavernWorldSettings,
} from '../shared/brain';
import { createDefaultXbTavernPreset } from '../shared/presets';
import { selectXbTavernMemoryContext } from '../shared/memory-retrieval';

test('xb tavern brain applies one shared runtime contract for preview and runs', () => {
    const preset = createDefaultXbTavernPreset();
    const brain = buildXbTavernBrain({
        context: {
            character: { characterKey: 'char-1', name: 'Aster' },
            user: { name: 'Player' },
            worldBooks: [{
                name: 'Lore',
                entries: [{
                    uid: 'station',
                    content: 'Station lore.',
                    key: 'station',
                    order: 1,
                }],
            }],
        },
        preset,
        currentUserMessage: 'The station opens.',
        historyMode: 'squash',
        turn: 3,
        entryStates: {},
        diagnostics: { ok: true },
    });

    assert.equal(brain.runtimeState.worldSettings?.recursion, DEFAULT_XB_TAVERN_WORLD_SETTINGS.recursion);
    assert.equal(brain.runtimeState.worldSettings?.recursionLimit, DEFAULT_XB_TAVERN_WORLD_SETTINGS.recursionLimit);
    assert.equal(brain.runtimeState.worldSettings?.budgetChars, DEFAULT_XB_TAVERN_WORLD_SETTINGS.budgetChars);
    assert.equal(brain.runtimeState.worldSettings?.turn, 3);
    assert.equal(brain.buildResult.activatedWorldEntries.length, 1);
    assert.equal(brain.rawMessagesJson, brain.buildSnapshot.rawMessagesJson);
    assert.deepEqual(JSON.parse(brain.rawMessagesJson), brain.buildResult.messages);
});

test('xb tavern brain world setting helper normalizes state defaults', () => {
    const worldSettings = createXbTavernWorldSettings({
        turn: -2,
        entryStates: {
            'World\u0000entry': { cooldownUntilTurn: 4 },
        },
    });
    const runtimeState = createXbTavernRuntimeState({
        context: {},
        preset: {},
        currentUserMessage: 'Hello.',
        turn: -2,
        entryStates: worldSettings.entryStates,
    });

    assert.equal(worldSettings.turn, 0);
    assert.equal(runtimeState.currentUserMessage, 'Hello.');
    assert.equal(runtimeState.historyMode, 'raw');
    assert.deepEqual(runtimeState.worldSettings?.entryStates, {
        'World\u0000entry': { cooldownUntilTurn: 4 },
    });
});

test('xb tavern brain uses world settings from SillyTavern context', () => {
    const brain = buildXbTavernBrain({
        context: {
            character: { name: 'Aster' },
            worldSettings: {
                recursion: false,
                recursionLimit: 1,
                budgetChars: 128,
                caseSensitive: true,
                matchWholeWords: true,
                insertionStrategy: 2,
            },
        },
        currentUserMessage: 'Hello.',
        turn: 2,
    });

    assert.equal(brain.runtimeState.worldSettings?.recursion, false);
    assert.equal(brain.runtimeState.worldSettings?.recursionLimit, 1);
    assert.equal(brain.runtimeState.worldSettings?.budgetChars, 128);
    assert.equal(brain.runtimeState.worldSettings?.caseSensitive, true);
    assert.equal(brain.runtimeState.worldSettings?.matchWholeWords, true);
    assert.equal(brain.runtimeState.worldSettings?.insertionStrategy, 2);
    assert.equal(brain.runtimeState.worldSettings?.turn, 2);
});

test('xb tavern brain injects memory as D1 system before current user message', () => {
    const preset = createDefaultXbTavernPreset();
    const brain = buildXbTavernBrain({
        context: {
            character: { characterKey: 'char-1', name: 'Aster' },
            history: [{ role: 'assistant', content: 'Old reply.' }],
        },
        preset,
        currentUserMessage: 'Continue.',
        memoryContext: {
            memoryFiles: [{
                path: 'memory/state.md',
                title: '会话记忆',
                content: '双方已经完成试探，信任正在增加。',
            }],
        },
    });

    const memoryLayer = brain.buildResult.messageLayers.find((layer) => layer.layer === 'world-depth' && layer.label === 'world info depth 1');
    const currentUserLayer = brain.buildResult.messageLayers.find((layer) => layer.label === 'current user message');
    const historyLayer = brain.buildResult.messageLayers.find((layer) => layer.label === 'history 1');
    assert.ok(memoryLayer);
    assert.ok(currentUserLayer);
    assert.ok(historyLayer);
    assert.ok(memoryLayer.index > historyLayer.index);
    assert.ok(memoryLayer.index < currentUserLayer.index);
    assert.equal(brain.buildResult.messages[memoryLayer.index]?.role, 'system');
    assert.match(brain.buildResult.messages[memoryLayer.index]?.content || '', /## 会话记忆[\s\S]*信任正在增加/);
    assert.doesNotMatch(brain.buildResult.messages[memoryLayer.index]?.content || '', /<session_memory|memory\/session\.md|剧情脉络/);
    assert.doesNotMatch(brain.rawMessagesJson, /<world_info_depth/);
    assert.match(brain.rawMessagesJson, /信任正在增加/);
});

test('xb tavern brain keeps full state memory content in D1 without preview truncation', () => {
    const tailMarker = 'STATE_TAIL_AFTER_2400_MUST_SURVIVE';
    const longState = `# 会话记忆\n\n${'稳定记忆。'.repeat(620)}\n${tailMarker}`;
    assert.ok(longState.length > 2400);
    const memoryContext = selectXbTavernMemoryContext({
        memoryFiles: [{
            path: 'memory/state.md',
            status: 'active',
            title: '会话记忆',
            preview: longState,
            contentLength: longState.length,
            createdAt: 1,
            updatedAt: 1,
            source: 'manager',
        }],
        queryText: '继续',
    });
    const brain = buildXbTavernBrain({
        context: {
            character: { characterKey: 'char-1', name: 'Aster' },
            history: [{ role: 'assistant', content: 'Old reply.' }],
        },
        preset: createDefaultXbTavernPreset(),
        currentUserMessage: 'Continue.',
        memoryContext,
    });
    const memoryLayer = brain.buildResult.messageLayers.find((layer) => layer.layer === 'world-depth' && layer.label === 'world info depth 1');

    assert.ok(memoryLayer);
    assert.match(brain.buildResult.messages[memoryLayer.index]?.content || '', new RegExp(tailMarker));
});
