import test from 'node:test';
import assert from 'node:assert/strict';

import {
    XBTavernAuthorNotePosition,
    XBTavernPromptRole,
    XBTavernSelectiveLogic,
    XBTavernWorldPosition,
    buildAuthorNoteInjectScanText,
    activateWorldEntries,
    buildXbTavernMessages,
    createXbTavernBuildSnapshot,
    normalizeXbTavernAuthorNote,
    resolveXbTavernAuthorNoteState,
    squashChatHistory,
} from '../shared/message-assembler';
import {
    DEFAULT_XB_TAVERN_PRESET_ID,
    createDefaultXbTavernPreset,
    listBuiltInXbTavernPresets,
} from '../shared/presets';

test('xb tavern assembler keeps top preset sections before character data', () => {
    const result = buildXbTavernMessages({
        character: {
            name: 'Aster',
            description: 'A careful pilot.',
        },
        user: {
            name: 'Player',
        },
    }, {
        sections: [{ placement: 'top', role: 'system', content: 'Preset tone' }],
    }, {
        currentUserMessage: 'Hello.',
    });

    assert.equal(result.messages[0].role, 'system');
    assert.equal(result.messages[0].content, 'Preset tone');
    assert.deepEqual(result.messageLayers.slice(0, 1).map((item) => item.layer), ['preset']);
    assert.deepEqual(JSON.parse(result.meta.rawMessagesJson), result.messages);
    assert.match(result.messages.map((message) => message.content).join('\n'), /<character_card>/);
    assert.equal(result.messages.filter((message) => message.content === 'Preset tone').length, 1);
});

test('xb tavern default preset uses editable sections without hidden top prompts', () => {
    const preset = createDefaultXbTavernPreset();
    const result = buildXbTavernMessages({
        character: { name: 'Aster', description: 'Pilot.' },
    }, preset, {
        currentUserMessage: '继续。',
    });

    assert.equal(preset.id, DEFAULT_XB_TAVERN_PRESET_ID);
    assert.equal(preset.name, '酒馆当前聊天预设');
    assert.equal(listBuiltInXbTavernPresets()[0]?.id, DEFAULT_XB_TAVERN_PRESET_ID);
    assert.equal(result.messageLayers[0]?.layer, 'character-card');
    assert.doesNotMatch(result.messages.map((message) => message.content).join('\n'), /小白酒馆默认角色扮演预设|你正在小白酒馆中进行角色扮演/);
});

test('xb tavern assembler honors SillyTavern prompt manager marker order', () => {
    const result = buildXbTavernMessages({
        character: {
            name: 'Aster',
            description: 'Pilot description.',
            personality: 'Dry humor.',
        },
        user: {
            name: 'Player',
            persona: 'Navigator persona.',
        },
        history: [
            { role: 'assistant', content: 'Old assistant line.' },
        ],
        worldEntries: [{
            uid: 1,
            key: ['gate'],
            content: 'Gate lore.',
            constant: true,
            position: XBTavernWorldPosition.before,
        }],
    }, {
        sections: [
            { id: 'prompt-manager:main', label: 'Main', source: 'promptManager', role: 'system', content: 'Main prompt.' },
            { id: 'prompt-manager:charDescription', label: 'Char Description', source: 'promptManager', role: 'system', marker: true },
            { id: 'prompt-manager:worldInfoBefore', label: 'World Info (before)', source: 'promptManager', role: 'system', marker: true },
            { id: 'prompt-manager:chatHistory', label: 'Chat History', source: 'promptManager', role: 'system', marker: true },
            { id: 'prompt-manager:jailbreak', label: 'Jailbreak', source: 'promptManager', role: 'system', content: 'After marker prompt.' },
        ],
    }, {
        currentUserMessage: 'Current user line.',
        runtimeProtocolMessages: [{
            role: 'system',
            content: 'Runtime protocol block.',
        }],
        memoryContext: {
            memoryFiles: [{
                path: 'memory/state.md',
                title: '会话记忆',
                content: 'Prompt manager memory note.',
            }],
        },
    });

    const contents = result.messages.map((message) => message.content);
    assert.deepEqual(contents.map((content) => {
        if (content.includes('Main prompt.')) {return 'main';}
        if (content.includes('Pilot description.')) {return 'description';}
        if (content.includes('Gate lore.')) {return 'world';}
        if (content.includes('Old assistant line.')) {return 'history';}
        if (content.includes('Prompt manager memory note.')) {return 'memory';}
        if (content.includes('Current user line.')) {return 'current';}
        if (content.includes('Runtime protocol block.')) {return 'runtime-protocol';}
        if (content.includes('After marker prompt.')) {return 'jailbreak';}
        return 'other';
    }), ['main', 'description', 'world', 'history', 'memory', 'current', 'runtime-protocol', 'jailbreak']);
    const memoryContent = contents.find((content) => content.includes('Prompt manager memory note.')) || '';
    assert.match(memoryContent, /## 会话记忆[\s\S]*Prompt manager memory note/);
    assert.doesNotMatch(memoryContent, /<session_memory|memory\/session\.md|Session/);
    assert.doesNotMatch(contents.join('\n'), /<world_info_depth/);
    assert.doesNotMatch(contents.join('\n'), /<character_card>/);
    assert.equal(result.messageLayers.find((layer) => layer.label === 'Char Description')?.sourceId, 'prompt-manager:charDescription');
});

test('xb tavern preset labels are debug metadata only', () => {
    const result = buildXbTavernMessages({}, {
        sections: [{
            id: 'debug-label-test',
            label: 'Debug Label',
            locked: true,
            placement: 'beforeHistory',
            role: 'system',
            content: 'Actual preset content.',
        }],
    }, {
        currentUserMessage: 'Hello.',
    });

    assert.equal(result.messageLayers.some((layer) => layer.label === 'Debug Label'), true);
    assert.equal(result.messageLayers.some((layer) => layer.sourceId === 'debug-label-test'), true);
    assert.equal(result.messages.some((message) => message.content.includes('Debug Label')), false);
    assert.deepEqual(JSON.parse(result.meta.rawMessagesJson), result.messages);
});

test('quest hooks are injected before session memory without a heading', () => {
    const result = buildXbTavernMessages({}, {
        sections: [{
            id: 'main',
            placement: 'top',
            role: 'system',
            content: 'Main prompt.',
        }],
    }, {
        currentUserMessage: '继续。',
        memoryContext: {
            questHooks: ['莉娜似乎在刻意避开某个码头名字。'],
            memoryFiles: [{
                path: 'memory/state.md',
                title: '会话记忆',
                content: '码头仍是当前压力点。',
            }],
        },
    });
    const memoryContent = result.messages.map((message) => message.content).find((content) => content.includes('码头仍是当前压力点。')) || '';
    assert.ok(memoryContent.startsWith('莉娜似乎在刻意避开某个码头名字。\n\n## 会话记忆'));
    assert.doesNotMatch(memoryContent, /任务|目标|完成/);
});

test('quest hooks survive memory depth injection before memory content', () => {
    const result = buildXbTavernMessages({}, {
        sections: [{
            id: 'main',
            label: 'Main',
            placement: 'top',
            role: 'system',
            content: 'Main prompt.',
        }],
    }, {
        currentUserMessage: '继续。',
        memoryContext: {
            questHooks: ['旧码头的名字让莉娜短暂停顿。'],
            memoryFiles: [{
                path: 'memory/state.md',
                title: '会话记忆',
                content: '玩家正在查旧码头。',
            }],
        },
    });
    const content = result.messages.map((message) => message.content).join('\n\n');
    assert.match(content, /旧码头的名字让莉娜短暂停顿。\n\n## 会话记忆[\s\S]*玩家正在查旧码头。/);
});

test('xb tavern assembler uses native worldbook prompt blocks as the rendered truth', () => {
    const result = buildXbTavernMessages({
        character: { name: 'Aster', description: 'Pilot.' },
        user: { name: 'Player' },
        nativeWorldInfo: {
            trigger: 'normal',
            worldInfoBefore: 'Native before lore.',
            worldInfoAfter: 'Native after lore.',
            worldInfoExamples: [
                { position: 'before', content: 'Example top lore.' },
                { position: 'after', content: 'Example bottom lore.' },
            ],
            anBefore: ['Author note top lore.'],
            anAfter: ['Author note bottom lore.'],
            worldInfoDepth: [
                { depth: 3, role: 0, entries: ['Depth lore.'] },
            ],
            activatedEntries: [{
                uid: 'activated-entry',
                sourceWorldBook: 'Lore',
                content: 'Metadata-only activated entry.',
                position: XBTavernWorldPosition.before,
            }],
        },
    }, {}, {
        currentUserMessage: '继续。',
    });

    const joined = result.messages.map((message) => message.content).join('\n');
    assert.match(joined, /Native before lore\./);
    assert.match(joined, /Native after lore\./);
    assert.match(joined, /Example top lore\./);
    assert.match(joined, /Example bottom lore\./);
    assert.match(joined, /Author note top lore\./);
    assert.match(joined, /Author note bottom lore\./);
    assert.match(joined, /Depth lore\./);
    assert.doesNotMatch(joined, /Metadata-only activated entry\./);
    assert.equal(result.worldEntryCandidates[0]?.sourceWorldBook, 'Lore');
});

test('xb tavern assembler lets native world info own all worldbook activation', () => {
    const result = buildXbTavernMessages({
        character: { name: 'Aster', description: 'Pilot.' },
        user: { name: 'Player' },
        nativeWorldInfo: {
            trigger: 'normal',
            worldInfoBefore: 'Native bound lore.',
        },
        worldBooks: [
            {
                name: 'Bound Character Book',
                worldSourceType: 'character',
                entries: [{
                    uid: 'bound-book',
                    content: 'Bound book lore should not be duplicated locally.',
                    constant: true,
                    worldSourceType: 'character',
                }],
            },
            {
                name: 'Raw Card Book',
                worldSourceType: 'card',
                entries: [{
                    uid: 'raw-card-book',
                    key: ['raw-card-key'],
                    content: 'Raw card lore.',
                    worldSourceType: 'card',
                }],
            },
        ],
    }, {}, {
        currentUserMessage: 'raw-card-key',
    });

    const joined = result.messages.map((message) => message.content).join('\n');
    assert.match(joined, /Native bound lore\./);
    assert.doesNotMatch(joined, /Raw card lore\./);
    assert.doesNotMatch(joined, /Bound book lore should not be duplicated locally\./);
    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.uid), ['native:0:0']);
    assert.equal(result.worldEntryCandidates.find((entry) => entry.uid === 'raw-card-book'), undefined);
    assert.equal(result.worldEntryCandidates.find((entry) => entry.uid === 'bound-book'), undefined);
});

test('xb tavern disabled preset sections stay out of model messages', () => {
    const result = buildXbTavernMessages({}, {
        sections: [
            {
                id: 'enabled-section',
                label: 'Enabled',
                enabled: true,
                placement: 'beforeHistory',
                role: 'system',
                content: 'Enabled content.',
            },
            {
                id: 'disabled-section',
                label: 'Disabled',
                enabled: false,
                placement: 'beforeHistory',
                role: 'system',
                content: 'Disabled content.',
            },
        ],
    }, {
        currentUserMessage: 'Hello.',
    });

    assert.equal(result.messages.some((message) => message.content === 'Enabled content.'), true);
    assert.equal(result.messages.some((message) => message.content === 'Disabled content.'), false);
    assert.equal(result.messageLayers.some((layer) => layer.sourceId === 'enabled-section'), true);
    assert.equal(result.messageLayers.some((layer) => layer.sourceId === 'disabled-section'), false);
});

test('xb tavern world activation supports constant, keyword, and selective logic', () => {
    const entries = activateWorldEntries([
        {
            uid: 1,
            comment: 'constant lore',
            content: 'The city never sleeps.',
            constant: true,
            order: 10,
        },
        {
            uid: 2,
            comment: 'keyword lore',
            content: 'The station has old doors.',
            key: ['station'],
            order: 20,
        },
        {
            uid: 3,
            comment: 'selective lore',
            content: 'The vault opens only during rain.',
            key: ['vault'],
            keysecondary: ['rain'],
            selectiveLogic: XBTavernSelectiveLogic.AND_ALL,
            order: 30,
        },
        {
            uid: 4,
            comment: 'disabled lore',
            content: 'Disabled.',
            key: ['station'],
            disable: true,
            order: 40,
        },
    ], {
        scanText: 'The player reaches the station. The vault is quiet.',
    });

    assert.deepEqual(entries.map((entry) => entry.uid), [2, 1]);
});

test('xb tavern world activation honors decorator activation and suppression', () => {
    const entries = activateWorldEntries([
        {
            uid: 'forced',
            content: '@@activate\nForced lore.',
        },
        {
            uid: 'suppressed',
            content: '@@dont_activate\nSuppressed lore.',
            constant: true,
        },
    ], {
        scanText: '',
    });

    assert.deepEqual(entries.map((entry) => entry.uid), ['forced']);
    assert.equal(entries[0].content, 'Forced lore.');
});

test('xb tavern world activation supports recursion, budget, probability and sticky gates', () => {
    const entries = activateWorldEntries([
        {
            uid: 'first',
            content: 'Hidden relay keyword.',
            key: ['station'],
            order: 10,
        },
        {
            uid: 'recursive',
            content: 'Recursive lore.',
            key: ['relay'],
            order: 9,
        },
        {
            uid: 'sticky',
            content: 'Sticky lore.',
            key: ['missing'],
            order: 8,
        },
        {
            uid: 'blocked',
            content: 'Blocked lore.',
            key: ['station'],
            probability: 0,
            order: 7,
        },
    ], {
        scanText: 'station',
        recursion: true,
        recursionLimit: 3,
        turn: 5,
        budgetChars: 80,
        entryStates: {
            sticky: { stickyUntilTurn: 8 },
        },
    });

    assert.deepEqual(entries.map((entry) => entry.uid), ['first', 'recursive', 'sticky']);
});

test('xb tavern world budget-skipped entries do not feed recursion', () => {
    const result = buildXbTavernMessages({
        worldEntries: [
            {
                uid: 'too-large',
                content: 'relay-key but this entry is too large for the tiny budget.',
                key: ['start'],
                order: 30,
            },
            {
                uid: 'recursive',
                content: 'Recursive lore.',
                key: ['relay-key'],
                order: 20,
            },
            {
                uid: 'small',
                content: 'Small.',
                key: ['start'],
                order: 40,
            },
        ],
    }, {}, {
        currentUserMessage: 'start',
        worldSettings: {
            recursion: true,
            recursionLimit: 3,
            budgetChars: 20,
        },
    });

    assert.equal(result.worldEntryCandidates.find((entry) => entry.uid === 'too-large')?.status, 'budget_skipped');
    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.uid), ['small']);
});

test('xb tavern world probability failures are not rerolled during recursion', () => {
    let rolls = 0;
    const entries = activateWorldEntries([
        {
            uid: 'flaky',
            content: 'Flaky lore.',
            key: ['start'],
            probability: 50,
            useProbability: true,
            order: 30,
        },
        {
            uid: 'starter',
            content: 'start relay-key',
            key: ['start'],
            order: 20,
        },
        {
            uid: 'relay',
            content: 'Relay lore.',
            key: ['relay-key'],
            order: 10,
        },
    ], {
        scanText: 'start',
        recursion: true,
        recursionLimit: 3,
        random: () => {
            rolls += 1;
            return rolls === 1 ? 1 : 0;
        },
    });

    assert.equal(rolls, 1);
    assert.deepEqual(entries.map((entry) => entry.uid), ['starter', 'relay']);
});

test('xb tavern world activation follows SillyTavern source priority and insertion strategy', () => {
    const entries = activateWorldEntries([
        {
            uid: 'global',
            content: 'Global lore.',
            constant: true,
            order: 10,
            worldSourceType: 'global',
        },
        {
            uid: 'character',
            content: 'Character lore.',
            constant: true,
            order: 10,
            worldSourceType: 'character',
        },
        {
            uid: 'persona',
            content: 'Persona lore.',
            constant: true,
            order: 10,
            worldSourceType: 'persona',
        },
        {
            uid: 'chat',
            content: 'Chat lore.',
            constant: true,
            order: 10,
            worldSourceType: 'chat',
        },
    ], {
        insertionStrategy: 1,
        budgetChars: 1000,
    });

    assert.deepEqual(entries.map((entry) => entry.uid), ['chat', 'persona', 'character', 'global']);

    const globalFirst = activateWorldEntries(entries, {
        insertionStrategy: 2,
        budgetChars: 1000,
    });
    assert.deepEqual(globalFirst.map((entry) => entry.uid), ['chat', 'persona', 'global', 'character']);
});

test('xb tavern evenly sorted world activation keeps global before character on equal order', () => {
    const entries = activateWorldEntries([
        {
            uid: 'character',
            content: 'Character lore.',
            constant: true,
            order: 10,
            worldSourceType: 'character',
            worldSourceIndex: 0,
        },
        {
            uid: 'global',
            content: 'Global lore.',
            constant: true,
            order: 10,
            worldSourceType: 'global',
            worldSourceIndex: 1,
        },
    ], {
        insertionStrategy: 0,
        budgetChars: 1000,
    });

    assert.deepEqual(entries.map((entry) => entry.uid), ['global', 'character']);
});

test('xb tavern assembler exposes world candidate explanations', () => {
    const result = buildXbTavernMessages({
        worldBooks: [{
            name: 'DebugWorld',
            entries: [
                {
                    uid: 'hit',
                    comment: 'hit lore',
                    content: 'Hit lore.',
                    key: ['station'],
                    order: 20,
                },
                {
                    uid: 'miss',
                    comment: 'miss lore',
                    content: 'Miss lore.',
                    key: ['moon'],
                    order: 10,
                },
            ],
        }],
    }, {
    }, {
        currentUserMessage: 'The station door opens.',
    });

    const hit = result.worldEntryCandidates.find((entry) => entry.uid === 'hit');
    const miss = result.worldEntryCandidates.find((entry) => entry.uid === 'miss');
    assert.equal(hit?.sourceWorldBook, 'DebugWorld');
    assert.equal(hit?.status, 'activated');
    assert.equal(hit?.activationReason, 'keyword');
    assert.equal(hit?.positionLabel, 'after character');
    assert.equal(miss?.status, 'not_matched');
    assert.equal(result.activatedWorldEntries[0].sourceWorldBook, 'DebugWorld');
});

test('xb tavern assembler exposes world budget and insertion debug metadata', () => {
    const result = buildXbTavernMessages({
        worldBooks: [{
            name: 'BudgetWorld',
            entries: [
                {
                    uid: 'large',
                    comment: 'large lore',
                    content: 'Large lore costs many chars.',
                    constant: true,
                    order: 20,
                    position: XBTavernWorldPosition.before,
                },
                {
                    uid: 'small',
                    comment: 'small lore',
                    content: 'Small.',
                    constant: true,
                    order: 30,
                    position: XBTavernWorldPosition.atDepth,
                    depth: 1,
                },
            ],
        }],
    }, {
    }, {
        currentUserMessage: 'Hello.',
        worldSettings: {
            budgetChars: 12,
        },
    });

    const large = result.worldEntryCandidates.find((entry) => entry.uid === 'large');
    const small = result.worldEntryCandidates.find((entry) => entry.uid === 'small');
    assert.equal(large?.status, 'budget_skipped');
    assert.equal(large?.budgetShortfall, 'Small.'.length + 'Large lore costs many chars.'.length - 12);
    assert.equal(large?.insertionTarget, 'before character card');
    assert.equal(small?.status, 'activated');
    assert.equal(small?.insertionTarget, 'history depth 1');
    assert.equal(result.meta.worldBudget.enabled, true);
    assert.equal(result.meta.worldBudget.limit, 12);
    assert.equal(result.meta.worldBudget.used, 'Small.'.length);
    assert.equal(result.meta.worldPositionCounts['history depth 1'], 1);
    assert.equal(result.activatedWorldEntries.map((entry) => entry.uid).includes('large'), false);
});

test('xb tavern assembler distinguishes probability failures from budget skips', () => {
    const result = buildXbTavernMessages({
        worldBooks: [{
            name: 'ProbabilityWorld',
            entries: [
                {
                    uid: 'blocked',
                    comment: 'blocked probability',
                    content: 'Blocked by probability.',
                    constant: true,
                    probability: 0,
                    order: 10,
                },
            ],
        }],
    }, {
    }, {
        currentUserMessage: 'Hello.',
        worldSettings: {
            budgetChars: 100,
        },
    });

    assert.equal(result.activatedWorldEntries.length, 0);
    assert.equal(result.worldEntryCandidates[0]?.status, 'probability_failed');
    assert.equal(result.worldEntryCandidates[0]?.activationReason, 'constant');
});

test('xb tavern world candidate matrix explains every activation and skip gate', () => {
    const result = buildXbTavernMessages({
        worldBooks: [{
            name: 'MatrixWorld',
            entries: [
                {
                    uid: 'forced-budget',
                    comment: 'forced but too large',
                    content: '@@activate\nThis forced entry is intentionally too long for the tiny test budget.',
                    order: 100,
                    position: XBTavernWorldPosition.before,
                },
                {
                    uid: 'active',
                    comment: 'active keyword',
                    content: 'Active.',
                    key: ['station'],
                    order: 110,
                    position: XBTavernWorldPosition.after,
                },
                {
                    uid: 'disabled',
                    content: 'Disabled.',
                    constant: true,
                    disable: true,
                },
                {
                    uid: 'suppressed',
                    content: '@@dont_activate\nSuppressed.',
                    constant: true,
                },
                {
                    uid: 'cooldown',
                    content: 'Cooling.',
                    constant: true,
                },
                {
                    uid: 'delay',
                    content: 'Delayed.',
                    constant: true,
                },
                {
                    uid: 'miss',
                    content: 'Miss.',
                    key: ['moon'],
                },
                {
                    uid: 'secondary',
                    content: 'Secondary miss.',
                    key: ['station'],
                    keysecondary: ['rain'],
                    selective: true,
                    selectiveLogic: XBTavernSelectiveLogic.AND_ALL,
                },
                {
                    uid: 'probability',
                    content: 'Probability miss.',
                    constant: true,
                    probability: 50,
                    useProbability: true,
                },
            ],
        }],
    }, {
    }, {
        currentUserMessage: 'The station opens.',
        worldSettings: {
            turn: 5,
            budgetChars: 20,
            random: () => 1,
            entryStates: {
                'MatrixWorld\u0000cooldown': { cooldownUntilTurn: 9 },
                'MatrixWorld\u0000delay': { delayUntilTurn: 9 },
            },
        },
    });

    const byUid = Object.fromEntries(result.worldEntryCandidates.map((entry) => [entry.uid, entry]));
    assert.equal(byUid['forced-budget']?.status, 'budget_skipped');
    assert.equal(byUid['forced-budget']?.activationReason, 'decorator');
    assert.equal(byUid['forced-budget']?.budgetUsedBefore, 'Active.'.length);
    assert.equal(typeof byUid['forced-budget']?.budgetShortfall, 'number');
    assert.equal(byUid['forced-budget']?.insertionTarget, 'before character card');
    assert.equal(byUid.active?.status, 'activated');
    assert.equal(byUid.active?.activationReason, 'keyword');
    assert.equal(byUid.active?.sourceWorldBook, 'MatrixWorld');
    assert.equal(byUid.active?.positionLabel, 'after character');
    assert.equal(byUid.disabled?.status, 'disabled');
    assert.equal(byUid.suppressed?.status, 'suppressed_by_decorator');
    assert.equal(byUid.cooldown?.status, 'cooldown');
    assert.equal(byUid.delay?.status, 'delay');
    assert.equal(byUid.miss?.status, 'not_matched');
    assert.equal(byUid.secondary?.status, 'secondary_not_matched');
    assert.equal(byUid.probability?.status, 'probability_failed');
    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.uid), ['active']);
    assert.equal(result.meta.worldBudget.skippedChars, byUid['forced-budget']?.contentChars);
});

test('xb tavern world activation follows SillyTavern sticky, selective and decorator precedence', () => {
    const result = buildXbTavernMessages({
        worldBooks: [{
            name: 'SemanticsWorld',
            entries: [
                {
                    uid: 'selective-off',
                    content: 'Secondary keys ignored when selective is false.',
                    key: ['station'],
                    keysecondary: ['rain'],
                    selective: false,
                    order: 30,
                },
                {
                    uid: 'sticky-over-cooldown',
                    content: 'Sticky survives cooldown and probability.',
                    key: ['missing'],
                    probability: 0,
                    order: 20,
                },
                {
                    uid: 'decorator-duel',
                    content: '@@activate\n@@dont_activate\nActivate wins if both decorators exist.',
                    order: 10,
                },
            ],
        }],
    }, {
    }, {
        currentUserMessage: 'The station opens.',
        worldSettings: {
            turn: 4,
            entryStates: {
                'SemanticsWorld\u0000sticky-over-cooldown': {
                    stickyUntilTurn: 8,
                    cooldownUntilTurn: 8,
                },
            },
        },
    });

    const byUid = Object.fromEntries(result.worldEntryCandidates.map((entry) => [entry.uid, entry]));
    assert.equal(byUid['selective-off']?.status, 'activated');
    assert.equal(byUid['selective-off']?.activationReason, 'keyword');
    assert.equal(byUid['sticky-over-cooldown']?.status, 'activated');
    assert.equal(byUid['sticky-over-cooldown']?.activationReason, 'sticky');
    assert.equal(byUid['decorator-duel']?.status, 'activated');
    assert.equal(byUid['decorator-duel']?.activationReason, 'decorator');
    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.uid), [
        'selective-off',
        'sticky-over-cooldown',
        'decorator-duel',
    ]);
});

test('xb tavern world recursion respects the configured recursion limit', () => {
    const entries = activateWorldEntries([
        {
            uid: 'first',
            content: 'relay',
            key: ['station'],
            order: 30,
        },
        {
            uid: 'second',
            content: 'beacon',
            key: ['relay'],
            order: 20,
        },
        {
            uid: 'third',
            content: 'final',
            key: ['beacon'],
            order: 10,
        },
    ], {
        scanText: 'station',
        recursion: true,
        recursionLimit: 2,
    });

    assert.deepEqual(entries.map((entry) => entry.uid), ['first', 'second']);
});

test('xb tavern world recursion treats zero limit as unlimited until no new entries', () => {
    const entries = activateWorldEntries([
        { uid: 'first', content: 'relay-1', key: ['start'], order: 50 },
        { uid: 'second', content: 'relay-2', key: ['relay-1'], order: 40 },
        { uid: 'third', content: 'relay-3', key: ['relay-2'], order: 30 },
        { uid: 'fourth', content: 'relay-4', key: ['relay-3'], order: 20 },
        { uid: 'fifth', content: 'done', key: ['relay-4'], order: 10 },
    ], {
        scanText: 'start',
        recursion: true,
        recursionLimit: 0,
    });

    assert.deepEqual(entries.map((entry) => entry.uid), ['first', 'second', 'third', 'fourth', 'fifth']);
});

test('xb tavern world recursion honors prevent, exclude and delay-until-recursion fields', () => {
    const entries = activateWorldEntries([
        { uid: 'starter', content: 'relay-key exclude-key delayed-key', key: ['start'], order: 60 },
        { uid: 'preventer', content: 'blocked-key', key: ['start'], preventRecursion: true, order: 50 },
        { uid: 'recursive', content: 'Recursive lore.', key: ['relay-key'], order: 40 },
        { uid: 'blocked', content: 'Blocked lore.', key: ['blocked-key'], order: 30 },
        { uid: 'excluded', content: 'Excluded lore.', key: ['exclude-key'], excludeRecursion: true, order: 20 },
        { uid: 'delayed', content: 'Delayed lore.', key: ['delayed-key'], delayUntilRecursion: true, order: 10 },
    ], {
        scanText: 'start',
        recursion: true,
        recursionLimit: 3,
    });

    assert.deepEqual(entries.map((entry) => entry.uid), ['starter', 'preventer', 'recursive', 'delayed']);
});

test('xb tavern world activation keeps one winner per inclusion group', () => {
    const entries = activateWorldEntries([
        { uid: 'plain', content: 'Plain lore.', constant: true, order: 100 },
        { uid: 'group-loser', content: 'Group loser.', constant: true, group: 'scene-choice', order: 90 },
        { uid: 'group-winner', content: 'Group winner.', constant: true, group: 'scene-choice', groupOverride: true, order: 10 },
    ], {
        scanText: '',
    });

    assert.deepEqual(entries.map((entry) => entry.uid), ['plain', 'group-winner']);
});

test('xb tavern inclusion groups honor SillyTavern group scoring before weighted selection', () => {
    const entries = activateWorldEntries([
        {
            uid: 'low-score',
            content: 'Low score lore.',
            key: ['vault'],
            group: 'choice',
            order: 20,
        },
        {
            uid: 'high-score',
            content: 'High score lore.',
            key: ['vault'],
            keysecondary: ['alpha', 'beta'],
            selective: true,
            group: 'choice',
            order: 10,
        },
    ], {
        scanText: 'vault alpha beta',
        useGroupScoring: true,
        random: () => 0,
    });

    assert.deepEqual(entries.map((entry) => entry.uid), ['high-score']);
});

test('xb tavern world scan depth uses recent chat instead of the whole history', () => {
    const result = buildXbTavernMessages({
        history: [
            { role: 'user', content: 'ancient-keyword' },
            { role: 'assistant', content: 'Recent answer.' },
        ],
        worldEntries: [
            { uid: 'old', content: 'Old lore.', key: ['ancient-keyword'] },
            { uid: 'now', content: 'Current lore.', key: ['current-keyword'] },
        ],
    }, {}, {
        currentUserMessage: 'current-keyword',
        worldSettings: {
            scanDepth: 1,
        },
    });

    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.uid), ['now']);
});

test('xb tavern world scan can include chat speaker names like SillyTavern', () => {
    const withNames = buildXbTavernMessages({
        character: { name: 'Aster' },
        user: { name: 'Mira' },
        history: [
            { role: 'assistant', content: 'Checks the panel.' },
        ],
        worldEntries: [
            { uid: 'speaker', content: 'Speaker lore.', key: ['Aster'] },
        ],
    }, {}, {
        currentUserMessage: 'Hello.',
        worldSettings: {
            includeNames: true,
            scanDepth: 2,
        },
    });
    const withoutNames = buildXbTavernMessages({
        character: { name: 'Aster' },
        user: { name: 'Mira' },
        history: [
            { role: 'assistant', content: 'Checks the panel.' },
        ],
        worldEntries: [
            { uid: 'speaker', content: 'Speaker lore.', key: ['Aster'] },
        ],
    }, {}, {
        currentUserMessage: 'Hello.',
        worldSettings: {
            includeNames: false,
            scanDepth: 2,
        },
    });

    assert.deepEqual(withNames.activatedWorldEntries.map((entry) => entry.uid), ['speaker']);
    assert.deepEqual(withoutNames.activatedWorldEntries.map((entry) => entry.uid), []);
});

test('xb tavern author note normalizes defaults and follows insertion interval', () => {
    assert.deepEqual(normalizeXbTavernAuthorNote({}), {
        prompt: '',
        interval: 1,
        position: XBTavernAuthorNotePosition.IN_CHAT,
        depth: 4,
        role: XBTavernPromptRole.SYSTEM,
        scan: false,
        characterName: '',
        characterPrompt: '',
        characterUse: false,
        characterPosition: 0,
    });
    assert.deepEqual(normalizeXbTavernAuthorNote({
        prompt: 'main',
        characterName: 'Aster',
        characterPrompt: 'character note',
        characterUse: true,
        characterPosition: 2,
    }), {
        prompt: 'main',
        interval: 1,
        position: XBTavernAuthorNotePosition.IN_CHAT,
        depth: 4,
        role: XBTavernPromptRole.SYSTEM,
        scan: false,
        characterName: 'Aster',
        characterPrompt: 'character note',
        characterUse: true,
        characterPosition: 2,
    });

    const disabled = resolveXbTavernAuthorNoteState({
        history: [{ role: 'user', content: 'first' }],
        authorNote: { prompt: 'NOTE_KEYWORD', interval: 0, position: XBTavernAuthorNotePosition.IN_CHAT, depth: 7, role: XBTavernPromptRole.ASSISTANT },
    }, 'second');
    assert.equal(disabled.shouldAddPrompt, false);
    assert.equal(disabled.prompt, '');
    assert.equal(disabled.position, XBTavernAuthorNotePosition.IN_CHAT);
    assert.equal(disabled.depth, 7);
    assert.equal(disabled.role, XBTavernPromptRole.ASSISTANT);

    const everyTurn = resolveXbTavernAuthorNoteState({
        authorNote: { prompt: 'NOTE_KEYWORD', interval: 1 },
    }, 'first');
    assert.equal(everyTurn.shouldAddPrompt, true);
    assert.equal(everyTurn.prompt, 'NOTE_KEYWORD');

    const everySecond = resolveXbTavernAuthorNoteState({
        history: [{ role: 'user', content: 'first' }],
        authorNote: { prompt: 'SECOND_KEYWORD', interval: 2 },
    }, 'second');
    assert.equal(everySecond.shouldAddPrompt, true);
    assert.equal(everySecond.prompt, 'SECOND_KEYWORD');
});

test('xb tavern author note participates in world scan only when enabled for this turn', () => {
    assert.equal(buildAuthorNoteInjectScanText({
        authorNote: { prompt: 'NOTE_KEYWORD', interval: 1, scan: false },
    }, 'hello'), '');
    assert.equal(buildAuthorNoteInjectScanText({
        authorNote: { prompt: 'NOTE_KEYWORD', interval: 0, scan: true },
    }, 'hello'), '');
    assert.equal(buildAuthorNoteInjectScanText({
        authorNote: { prompt: 'NOTE_KEYWORD', interval: 1, scan: true },
    }, 'hello'), 'NOTE_KEYWORD');
});

test('xb tavern author note world scan does not consume chat scan depth', () => {
    const result = buildXbTavernMessages({
        authorNote: { prompt: 'NOTE_SCAN_KEY', interval: 1, scan: true },
        history: [
            { role: 'assistant', content: 'old-chat-key' },
        ],
        worldEntries: [
            { uid: 'author-note', content: 'Author note lore.', key: ['NOTE_SCAN_KEY'], order: 10 },
            { uid: 'current-chat', content: 'Current chat lore.', key: ['current-chat-key'], order: 20 },
            { uid: 'old-chat', content: 'Old chat lore.', key: ['old-chat-key'], order: 30 },
        ],
    }, {}, {
        currentUserMessage: 'current-chat-key',
        worldSettings: {
            scanDepth: 1,
        },
    });

    assert.equal(result.meta.scanText, 'current-chat-key');
    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.uid).sort(), ['author-note', 'current-chat']);
});

test('xb tavern world scan depth zero scans no chat text', () => {
    const result = buildXbTavernMessages({
        history: [
            { role: 'assistant', content: 'history-keyword' },
        ],
        worldEntries: [
            { uid: 'history', content: 'History lore.', key: ['history-keyword'] },
            { uid: 'current', content: 'Current lore.', key: ['current-keyword'] },
            { uid: 'constant', content: 'Constant lore.', constant: true },
        ],
    }, {}, {
        currentUserMessage: 'current-keyword',
        worldSettings: {
            scanDepth: 0,
        },
    });

    assert.equal(result.meta.scanText, '');
    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.uid), ['constant']);
});

test('xb tavern world entry scan depth overrides the global scan depth', () => {
    const result = buildXbTavernMessages({
        history: [
            { role: 'assistant', content: 'previous-keyword' },
        ],
        worldEntries: [
            { uid: 'global-depth', content: 'Global depth lore.', key: ['previous-keyword'], order: 30 },
            { uid: 'entry-depth', content: 'Entry depth lore.', key: ['previous-keyword'], scanDepth: 2, order: 20 },
            { uid: 'current', content: 'Current lore.', key: ['current-keyword'], order: 10 },
        ],
    }, {}, {
        currentUserMessage: 'current-keyword',
        worldSettings: {
            scanDepth: 1,
        },
    });

    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.uid), ['entry-depth', 'current']);
});

test('xb tavern world min activations expands scan depth like SillyTavern', () => {
    const result = buildXbTavernMessages({
        history: [
            { role: 'assistant', content: 'previous-keyword' },
        ],
        worldEntries: [
            { uid: 'previous', content: 'Previous lore.', key: ['previous-keyword'], order: 20 },
            { uid: 'current', content: 'Current lore.', key: ['current-keyword'], order: 10 },
        ],
    }, {}, {
        currentUserMessage: 'current-keyword',
        worldSettings: {
            scanDepth: 1,
            minActivations: 2,
            minActivationsDepthMax: 2,
        },
    });

    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.uid), ['previous', 'current']);
});

test('xb tavern world keys support SillyTavern regex syntax', () => {
    const result = buildXbTavernMessages({
        worldEntries: [
            { uid: 'regex', content: 'Regex lore.', key: ['/vault\\s+7/i'] },
            { uid: 'plain', content: 'Plain lore.', key: ['/broken/pattern/'] },
        ],
    }, {}, {
        currentUserMessage: 'The VAULT 7 door opens.',
    });

    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.uid), ['regex']);
});

test('xb tavern world scan checks character data only when entry opts in', () => {
    const result = buildXbTavernMessages({
        character: {
            description: 'A careful pilot.',
        },
        worldEntries: [
            { uid: 'plain', content: 'Plain lore.', key: ['pilot'] },
            { uid: 'character-scan', content: 'Character lore.', key: ['pilot'], matchCharacterDescription: true },
        ],
    }, {}, {
        currentUserMessage: 'No keyword here.',
    });

    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.uid), ['character-scan']);
});

test('xb tavern world scan reads SillyTavern character depth prompt sources', () => {
    const nested = buildXbTavernMessages({
        character: {
            data: {
                extensions: {
                    depth_prompt: {
                        prompt: 'depth-beacon',
                    },
                },
            },
        },
        worldEntries: [
            { uid: 'nested-depth', content: 'Nested depth lore.', key: ['depth-beacon'], matchCharacterDepthPrompt: true },
        ],
    }, {}, {
        currentUserMessage: 'No keyword here.',
    });
    const flat = buildXbTavernMessages({
        character: {
            characterDepthPrompt: 'flat-depth-beacon',
        },
        worldEntries: [
            { uid: 'flat-depth', content: 'Flat depth lore.', key: ['flat-depth-beacon'], matchCharacterDepthPrompt: true },
        ],
    }, {}, {
        currentUserMessage: 'No keyword here.',
    });

    assert.deepEqual(nested.activatedWorldEntries.map((entry) => entry.uid), ['nested-depth']);
    assert.deepEqual(flat.activatedWorldEntries.map((entry) => entry.uid), ['flat-depth']);
});

test('xb tavern world activation honors generation type triggers', () => {
    const result = buildXbTavernMessages({
        worldEntries: [
            { uid: 'normal', content: 'Normal lore.', constant: true, triggers: ['normal'] },
            { uid: 'continue', content: 'Continue lore.', constant: true, triggers: ['continue'] },
            { uid: 'always', content: 'Always lore.', constant: true },
        ],
    }, {}, {
        currentUserMessage: 'Hello.',
        worldSettings: {
            trigger: 'normal',
        },
    });

    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.uid), ['normal', 'always']);
    assert.equal(result.worldEntryCandidates.find((entry) => entry.uid === 'continue')?.status, 'trigger_filtered');
});

test('xb tavern world activation treats SillyTavern enabled false as disabled', () => {
    const result = buildXbTavernMessages({
        worldEntries: [
            { uid: 'disabled-by-enabled', content: 'Hidden lore.', constant: true, enabled: false },
            { uid: 'enabled-entry', content: 'Visible lore.', constant: true, enabled: true },
        ],
    }, {}, {
        currentUserMessage: 'Hello.',
    });

    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.uid), ['enabled-entry']);
    assert.equal(result.worldEntryCandidates.find((entry) => entry.uid === 'disabled-by-enabled')?.status, 'disabled');
    assert.doesNotMatch(result.messages.map((message) => message.content).join('\n'), /Hidden lore/);
});

test('xb tavern world character filters use the locked character identity', () => {
    const result = buildXbTavernMessages({
        character: {
            name: 'Aster',
            avatar: 'Aster.png',
            tags: ['pilot-tag'],
        },
        worldEntries: [
            {
                uid: 'for-aster',
                content: 'Aster lore.',
                constant: true,
                characterFilter: { names: ['Aster.png'] },
                order: 30,
            },
            {
                uid: 'for-nia',
                content: 'Nia lore.',
                constant: true,
                characterFilter: { names: ['Nia.png'] },
                order: 20,
            },
            {
                uid: 'exclude-aster',
                content: 'Excluded lore.',
                constant: true,
                characterFilter: { names: ['Aster.png'], isExclude: true },
                order: 10,
            },
            {
                uid: 'for-tag',
                content: 'Pilot lore.',
                constant: true,
                extensions: { character_filter: { tags: ['pilot-tag'] } },
                order: 40,
            },
            {
                uid: 'exclude-tag',
                content: 'Excluded tag lore.',
                constant: true,
                characterFilter: { tags: ['pilot-tag'], isExclude: true },
                order: 50,
            },
        ],
    }, {}, {
        currentUserMessage: 'Hello.',
    });

    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.uid), ['for-tag', 'for-aster']);
    assert.equal(result.worldEntryCandidates.find((entry) => entry.uid === 'for-nia')?.status, 'character_filtered');
    assert.equal(result.worldEntryCandidates.find((entry) => entry.uid === 'exclude-tag')?.status, 'character_filtered');
});

test('xb tavern world activation honors case, whole-word, cooldown, delay, and state updates', () => {
    const entries = activateWorldEntries([
        {
            uid: 'case',
            content: 'Case-sensitive lore.',
            key: ['Vault'],
            caseSensitive: true,
        },
        {
            uid: 'whole',
            content: 'Whole-word lore.',
            key: ['cat'],
            matchWholeWords: true,
        },
        {
            uid: 'cooling',
            content: 'Cooling lore.',
            constant: true,
        },
        {
            uid: 'delayed',
            content: 'Delayed lore.',
            constant: true,
            delay: 5,
        },
    ], {
        scanText: 'Vault cat catalog',
        turn: 3,
        entryStates: {
            cooling: { cooldownUntilTurn: 9 },
        },
    });

    assert.deepEqual(entries.map((entry) => entry.uid), ['case', 'whole']);

    const budgetResult = buildXbTavernMessages({
        worldEntries: [
            { uid: 'ignored-budget', content: 'This entry is much longer than the budget.', constant: true, ignoreBudget: true, order: 30 },
            { uid: 'small', content: 'Small.', constant: true, order: 20 },
            { uid: 'skipped', content: 'This normal entry is too long for the remaining budget.', constant: true, order: 10 },
        ],
    }, {}, {
        currentUserMessage: 'Hello.',
        worldSettings: {
            budgetChars: 10,
        },
    });

    assert.deepEqual(budgetResult.activatedWorldEntries.map((entry) => entry.uid), ['ignored-budget', 'small']);
    assert.equal(budgetResult.worldEntryCandidates.find((entry) => entry.uid === 'skipped')?.status, 'budget_skipped');
    assert.equal(budgetResult.meta.worldBudget.used, 'Small.'.length);

    const result = buildXbTavernMessages({
        worldEntries: [
            { uid: 'sticky', content: 'Sticky next.', constant: true, sticky: 2 },
            { uid: 'cooldown', content: 'Cooldown next.', constant: true, cooldown: 3 },
        ],
    }, {
    }, {
        currentUserMessage: 'Hello.',
        worldSettings: { turn: 4 },
    });

    assert.deepEqual(result.meta.worldEntryStateUpdates['direct\u0000sticky'], { stickyUntilTurn: 6 });
    assert.deepEqual(result.meta.worldEntryStateUpdates['direct\u0000cooldown'], { cooldownUntilTurn: 7 });
});

test('xb tavern world entry states are keyed by activation key across world books', () => {
    const result = buildXbTavernMessages({
        worldBooks: [
            {
                name: 'Alpha',
                entries: [{ uid: 'shared', content: 'Alpha lore.', constant: true, cooldown: 2 }],
            },
            {
                name: 'Beta',
                entries: [{ uid: 'shared', content: 'Beta lore.', constant: true, cooldown: 4 }],
            },
        ],
    }, {
    }, {
        currentUserMessage: 'Hello.',
        worldSettings: { turn: 10 },
    });

    assert.deepEqual(result.meta.worldEntryStateUpdates['Alpha\u0000shared'], { cooldownUntilTurn: 12 });
    assert.deepEqual(result.meta.worldEntryStateUpdates['Beta\u0000shared'], { cooldownUntilTurn: 14 });
});

test('xb tavern assembler does not double count flattened world entries when world books exist', () => {
    const entry = {
        uid: 'same',
        content: 'Same lore.',
        constant: true,
    };
    const result = buildXbTavernMessages({
        worldBooks: [{ name: 'BookA', entries: [entry] }],
        worldEntries: [entry],
    }, {
    }, {
        currentUserMessage: 'Hello.',
    });

    assert.equal(result.worldEntryCandidates.length, 1);
    assert.equal(result.activatedWorldEntries.length, 1);
});

test('xb tavern assembler deduplicates repeated entries from the same world book', () => {
    const result = buildXbTavernMessages({
        worldBooks: [
            {
                name: 'BookA',
                entries: [
                    { uid: 'same', content: 'Same lore.', constant: true },
                    { uid: 'same', content: 'Same lore.', constant: true },
                    { content: 'No uid lore.', key: ['station'] },
                    { content: 'No uid lore.', key: ['station'] },
                ],
            },
            {
                name: 'BookA',
                entries: [
                    { uid: 'same', content: 'Same lore.', constant: true },
                ],
            },
        ],
    }, {
    }, {
        currentUserMessage: 'station',
    });

    assert.equal(result.worldEntryCandidates.length, 2);
    assert.equal(result.activatedWorldEntries.length, 2);
    assert.deepEqual(result.worldEntryCandidates.map((entry) => entry.content).sort(), ['No uid lore.', 'Same lore.']);
});

test('xb tavern assembler keeps same uid entries separate across world books', () => {
    const result = buildXbTavernMessages({
        worldBooks: [
            {
                name: 'BookA',
                entries: [{ uid: 1, content: 'Book A lore.', constant: true, order: 2 }],
            },
            {
                name: 'BookB',
                entries: [{ uid: 1, content: 'Book B lore.', constant: true, order: 1 }],
            },
        ],
    }, {
    }, {
        currentUserMessage: 'Hello.',
    });

    assert.equal(result.activatedWorldEntries.length, 2);
    assert.deepEqual(result.activatedWorldEntries.map((entry) => entry.sourceWorldBook), ['BookA', 'BookB']);
    assert.equal(new Set(result.worldEntryCandidates.map((entry) => entry.activationKey)).size, 2);
    assert.deepEqual(result.worldEntryCandidates.map((entry) => entry.status), ['activated', 'activated']);
});

test('xb tavern assembler maps world positions into stable message locations', () => {
    const result = buildXbTavernMessages({
        character: {
            name: 'Aster',
            description: 'Pilot.',
        },
        user: {
            name: 'Player',
        },
        history: [
            { role: 'user', content: 'We enter the station.' },
            { role: 'assistant', content: 'Aster checks the lights.' },
        ],
        worldEntries: [
            {
                uid: 'before',
                content: 'Before character lore.',
                constant: true,
                position: XBTavernWorldPosition.before,
            },
            {
                uid: 'after',
                content: 'After character lore.',
                constant: true,
                position: XBTavernWorldPosition.after,
            },
            {
                uid: 'depth',
                content: 'Depth lore.',
                constant: true,
                position: XBTavernWorldPosition.atDepth,
                depth: 0,
                role: 'system',
            },
            {
                uid: 'outlet',
                content: 'Outlet lore.',
                constant: true,
                position: XBTavernWorldPosition.outlet,
                outletName: 'status',
            },
            {
                uid: 'author-note',
                content: 'Author note lore.',
                constant: true,
                position: XBTavernWorldPosition.ANTop,
            },
            {
                uid: 'example-message',
                content: 'Example message lore.',
                constant: true,
                position: XBTavernWorldPosition.EMBottom,
            },
        ],
    }, {
    }, {
        currentUserMessage: 'Look at the vault.',
        historyMode: 'raw',
    });

    const contents = result.messages.map((message) => message.content);
    assert.equal(contents.indexOf('<world_info_before_character>\nBefore character lore.\n</world_info_before_character>') < contents.findIndex((content) => content.includes('<character_card>')), true);
    assert.equal(contents.indexOf('<world_info_after_character>\nAfter character lore.\n</world_info_after_character>') > contents.findIndex((content) => content.includes('<character_card>')), true);
    assert.deepEqual(result.outlets, { status: 'Outlet lore.' });
    assert.equal(contents.includes('<world_info_author_note_top>\nAuthor note lore.\n</world_info_author_note_top>'), true);
    assert.equal(contents.includes('<world_info_examples_bottom>\nExample message lore.\n</world_info_examples_bottom>'), true);
    assert.equal(contents.includes('Look at the vault.'), true);
    assert.equal(contents.includes('Depth lore.'), true);
    assert.doesNotMatch(contents.join('\n'), /<world_info_depth/);
});

test('xb tavern assembler treats memory as D1 system depth injection inside chat history', () => {
    const result = buildXbTavernMessages({
        character: { name: 'Aster', description: 'Pilot.' },
        history: [{ role: 'assistant', content: 'Old reply.' }],
        worldEntries: [{
            uid: 'd1',
            content: 'World D1 lore.',
            constant: true,
            position: XBTavernWorldPosition.atDepth,
            depth: 1,
            role: 'system',
            order: 10,
        }],
    }, {
        sections: [
            { placement: 'afterHistory', role: 'system', content: 'After history rule.' },
        ],
    }, {
        currentUserMessage: 'Current turn.',
        runtimeProtocolMessages: [{
            role: 'system',
            content: 'Runtime protocol block.',
        }],
        memoryContext: {
            memoryFiles: [{
                path: 'memory/state.md',
                title: '会话记忆',
                content: 'Memory D1 note.',
            }, {
                path: 'memory/characters/Aster.md',
                title: 'Aster',
                content: 'Aster character note.',
            }],
        },
    });

    const contents = result.messages.map((message) => message.content);
    const oldIndex = contents.indexOf('Old reply.');
    const depthIndex = contents.findIndex((content) => content.includes('Memory D1 note.') && content.includes('Aster character note.') && content.includes('World D1 lore.'));
    const currentIndex = contents.indexOf('Current turn.');
    const protocolIndex = contents.indexOf('Runtime protocol block.');
    const afterIndex = contents.indexOf('After history rule.');
    assert.ok(oldIndex >= 0);
    assert.ok(depthIndex > oldIndex);
    assert.ok(currentIndex > depthIndex);
    assert.ok(protocolIndex > currentIndex);
    assert.ok(afterIndex > protocolIndex);
    assert.equal(result.messages[depthIndex]?.role, 'system');
    assert.match(contents[depthIndex] || '', /## 会话记忆[\s\S]*Memory D1 note\.[\s\S]*World D1 lore\./);
    assert.match(contents[depthIndex] || '', /## 相关人物记忆[\s\S]*### Aster[\s\S]*Aster character note\./);
    assert.doesNotMatch(contents[depthIndex] || '', /<session_memory|memory\/session\.md|Session/);
    assert.doesNotMatch(contents[depthIndex] || '', /<world_info_depth/);
    assert.equal(result.messageLayers.find((layer) => layer.index === depthIndex)?.layer, 'world-depth');
    assert.equal(result.messageLayers.find((layer) => layer.index === depthIndex)?.label, 'world info depth 1');
    assert.equal(result.messageLayers.find((layer) => layer.index === protocolIndex)?.layer, 'runtime-protocol');
});

test('xb tavern world prompt blocks follow SillyTavern insertion order', () => {
    const result = buildXbTavernMessages({
        worldEntries: [
            { uid: 'high', content: 'High order lore.', constant: true, order: 100, position: XBTavernWorldPosition.before },
            { uid: 'low', content: 'Low order lore.', constant: true, order: 10, position: XBTavernWorldPosition.before },
        ],
    }, {}, {
        currentUserMessage: 'Hello.',
    });

    assert.equal(
        result.messages.some((message) => message.content === '<world_info_before_character>\nLow order lore.\n\nHigh order lore.\n</world_info_before_character>'),
        true,
    );
});

test('xb tavern build snapshot summarizes context, preset, world activation, and raw messages', () => {
    const context = {
        character: { characterKey: 'char-1', name: 'Aster' },
        user: { name: 'Player' },
        history: [{ role: 'user' as const, content: 'Earlier.' }],
        worldBooks: [{
            name: 'Lore',
            entries: [{ uid: 'lore', content: 'Lore text.', constant: true }],
        }],
    };
    const preset = {
        id: 'preset-1',
        name: 'Preset One',
    };
    const result = buildXbTavernMessages(context, preset, {
        currentUserMessage: 'Now.',
    });
    const snapshot = createXbTavernBuildSnapshot(context, preset, result, { ok: true });

    assert.equal(snapshot.presetId, 'preset-1');
    assert.equal(snapshot.characterName, 'Aster');
    assert.equal(snapshot.historyCount, 1);
    assert.deepEqual(snapshot.worldBooks, [{ name: 'Lore', entries: 1 }]);
    assert.equal(snapshot.messageCount, result.messages.length);
    assert.equal(snapshot.rawMessagesJson, result.meta.rawMessagesJson);
    assert.equal(snapshot.activatedWorldEntries[0]?.sourceWorldBook, 'Lore');
    assert.deepEqual(snapshot.diagnostics, { ok: true });
});

test('xb tavern assembler can squash chat history like a controlled preset layer', () => {
    const squashed = squashChatHistory([
        { role: 'user', content: 'Open the door.' },
        { role: 'assistant', content: 'The door opens.' },
    ], {
        userName: 'Mira',
        characterName: 'Aster',
    });

    assert.deepEqual(squashed, [{
        role: 'system',
        content: '<conversation_history>\n<message role="user">\nOpen the door.\n</message>\n\n<message role="assistant">\nThe door opens.\n</message>\n</conversation_history>',
    }]);
    assert.equal(squashed[0]?.content.includes('Mira:'), false);
    assert.equal(squashed[0]?.content.includes('Aster:'), false);
});

test('xb tavern assembler keeps history roles raw by default', () => {
    const result = buildXbTavernMessages({
        history: [
            { role: 'assistant', content: '*You wake with a start.*' },
            { role: 'user', content: 'o ~' },
        ],
    }, {}, {
        currentUserMessage: '继续。',
    });

    const historyAssistant = result.messages.find((message) => message.content === '*You wake with a start.*');
    assert.equal(historyAssistant?.role, 'assistant');
    assert.equal(result.messages.some((message) => message.content.includes('<conversation_history>')), false);
});

test('xb tavern assembler supports preset placements around history', () => {
    const result = buildXbTavernMessages({
        history: [{ role: 'user', content: 'Previous turn.' }],
    }, {
        sections: [
            { placement: 'beforeHistory', role: 'system', content: 'Before history rule.' },
            { placement: 'afterHistory', role: 'system', content: 'After history rule.' },
            { placement: 'assistantPrefill', role: 'assistant', content: 'Aster whispers:' },
        ],
    }, {
        currentUserMessage: 'Current turn.',
    });

    const contents = result.messages.map((message) => message.content);
    assert.equal(contents.includes('Before history rule.'), true);
    assert.equal(contents.includes('After history rule.'), true);
    assert.equal(result.messages[result.messages.length - 1].role, 'assistant');
    assert.equal(result.messages[result.messages.length - 1].content, 'Aster whispers:');
});

test('xb tavern preset sections preserve placement order without leaking debug metadata', () => {
    const result = buildXbTavernMessages({
        character: { name: 'Aster', description: 'Pilot.' },
        history: [{ role: 'assistant', content: 'Earlier.' }],
    }, {
        sections: [
            { id: 'top-a', label: 'Top A', placement: 'top', role: 'system', content: 'Top A content.' },
            { id: 'top-b', label: 'Top B', placement: 'top', role: 'system', content: 'Top B content.' },
            { id: 'before-char', label: 'Before Character', placement: 'beforeCharacter', role: 'system', content: 'Before character content.' },
            { id: 'after-char', label: 'After Character', placement: 'afterCharacter', role: 'system', content: 'After character content.' },
            { id: 'before-history', label: 'Before History', placement: 'beforeHistory', role: 'system', content: 'Before history content.' },
            { id: 'after-history', label: 'After History', placement: 'afterHistory', role: 'system', content: 'After history content.' },
            { id: 'prefill', label: 'Prefill', placement: 'assistantPrefill', role: 'assistant', content: 'Aster:' },
        ],
    }, {
        currentUserMessage: 'Now.',
    });

    const contents = result.messages.map((message) => message.content);
    assert.deepEqual(contents.slice(0, 2), ['Top A content.', 'Top B content.']);
    assert.equal(contents.indexOf('Before character content.') < contents.findIndex((content) => content.includes('<character_card>')), true);
    assert.equal(contents.indexOf('After character content.') > contents.findIndex((content) => content.includes('<character_card>')), true);
    assert.equal(contents.indexOf('Before history content.') < contents.indexOf('Now.'), true);
    assert.equal(contents.indexOf('After history content.') > contents.indexOf('Now.'), true);
    assert.equal(contents[contents.length - 1], 'Aster:');
    assert.deepEqual(JSON.parse(result.meta.rawMessagesJson), result.messages);
    assert.equal(result.messages.some((message) => message.content.includes('Before Character')), false);
    assert.equal(result.messageLayers.some((layer) => layer.label === 'Before Character'), true);
});
