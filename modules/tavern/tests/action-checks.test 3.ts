import test from 'node:test';
import assert from 'node:assert/strict';

import {
    DEFAULT_ACTION_CHECK_DIFFICULTY,
    MAX_ACTION_CHECK_DIFFICULTY,
    executeTavernActionCheck,
    getActionCheckToolDefinitions,
} from '../shared/action-checks';
import type { TavernStatusDocument } from '../shared/status-state';

function createActionCheckStatusDocument(value = 65, max = 100, min?: number): TavernStatusDocument {
    return {
        meta: { revision: 0, activeSubject: 'user' },
        subjects: [{
            id: 'user',
            name: '阿瑟',
            tabs: [{
                id: 'overview',
                label: '概览',
                blocks: [{
                    id: 'stats',
                    title: '属性',
                    form: 'gauge',
                    fields: [
                        { id: 'str', name: '力量', value, max, ...(min !== undefined ? { min } : {}) },
                    ],
                }],
            }],
        }],
    };
}

function createMultiSubjectStatusDocument(options: {
    activeSubject: string;
    userStrength?: number;
    enemyStrength?: number;
}): TavernStatusDocument {
    return {
        meta: { revision: 0, activeSubject: options.activeSubject },
        subjects: [{
            id: 'user',
            name: '阿瑟',
            tabs: [{
                id: 'overview',
                label: '概览',
                blocks: [{
                    id: 'stats',
                    title: '属性',
                    form: 'gauge',
                    fields: [
                        ...(options.userStrength !== undefined ? [{ id: 'user-str', name: '力量', value: options.userStrength, max: 100 }] : []),
                    ],
                }],
            }],
        }, {
            id: 'enemy',
            name: '守卫',
            tabs: [{
                id: 'overview',
                label: '概览',
                blocks: [{
                    id: 'stats',
                    title: '属性',
                    form: 'gauge',
                    fields: [
                        ...(options.enemyStrength !== undefined ? [{ id: 'enemy-str', name: '力量', value: options.enemyStrength, max: 100 }] : []),
                    ],
                }],
            }],
        }],
    };
}

function createSingleSubjectMultiTabStatusDocument(): TavernStatusDocument {
    return {
        meta: { revision: 0, activeSubject: 'party' },
        subjects: [{
            id: 'party',
            name: '队伍状态',
            tabs: [{
                id: 'player',
                label: '我',
                blocks: [{
                    id: 'player-stats',
                    title: '属性',
                    form: 'gauge',
                    fields: [{ id: 'player-str', name: '力量', value: 65, max: 100 }],
                }],
            }, {
                id: 'guard',
                label: '守卫',
                blocks: [{
                    id: 'guard-stats',
                    title: '属性',
                    form: 'gauge',
                    fields: [{ id: 'guard-str', name: '力量', value: 40, max: 100 }],
                }],
            }, {
                id: 'lia',
                label: '莉娅',
                blocks: [{
                    id: 'lia-stats',
                    title: '属性',
                    form: 'gauge',
                    fields: [{ id: 'lia-str', name: '力量', value: 80, max: 100 }],
                }],
            }],
        }],
    };
}

test('action check normalizes enum difficulty and defensive numeric input', () => {
    const missingDifficulty = executeTavernActionCheck({
        action: '撬开门锁',
        stat: '灵巧',
    }, { rollDie: () => 10 });
    assert.equal(missingDifficulty.ok, true);
    assert.equal(missingDifficulty.ok && missingDifficulty.difficulty, DEFAULT_ACTION_CHECK_DIFFICULTY);
    assert.equal(missingDifficulty.ok && missingDifficulty.difficultyLabel, 'ordinary');

    const tooLow = executeTavernActionCheck({
        action: '跨过矮栏',
        stat: '敏捷',
        difficulty: -999,
    }, { rollDie: () => 10 });
    assert.equal(tooLow.ok, true);
    assert.equal(tooLow.ok && tooLow.difficultyLabel, 'easy');
    assert.equal(tooLow.ok && tooLow.difficulty, 5);

    const tooHigh = executeTavernActionCheck({
        action: '强行跃过深渊',
        stat: '勇气',
        difficulty: 999,
    }, { rollDie: () => 20 });
    assert.equal(tooHigh.ok, true);
    assert.equal(tooHigh.ok && tooHigh.difficultyLabel, 'nearly_impossible');
    assert.equal(tooHigh.ok && tooHigh.difficulty, MAX_ACTION_CHECK_DIFFICULTY);

    const numericHard = executeTavernActionCheck({
        action: '顶住门板',
        stat: '力量',
        difficulty: 11,
    }, { rollDie: () => 15 });
    assert.equal(numericHard.ok, true);
    assert.equal(numericHard.ok && numericHard.difficultyLabel, 'hard');
    assert.equal(numericHard.ok && numericHard.difficulty, 15);
});

test('action check treats natural 1 and natural 20 as critical outcomes', () => {
    const naturalOne = executeTavernActionCheck({
        action: '推开半掩的门',
        stat: '力量',
        difficulty: 'easy',
    }, { rollDie: () => 1 });
    assert.equal(naturalOne.ok, true);
    assert.equal(naturalOne.ok && naturalOne.success, false);
    assert.equal(naturalOne.ok && naturalOne.outcome, 'criticalFailure');
    assert.match(naturalOne.ok ? naturalOne.summary : '', /critical failure/);

    const naturalTwenty = executeTavernActionCheck({
        action: '强行说服守卫放行',
        stat: '魅力',
        difficulty: 'nearly_impossible',
    }, { rollDie: () => 20 });
    assert.equal(naturalTwenty.ok, true);
    assert.equal(naturalTwenty.ok && naturalTwenty.success, true);
    assert.equal(naturalTwenty.ok && naturalTwenty.outcome, 'criticalSuccess');
    assert.match(naturalTwenty.ok ? naturalTwenty.summary : '', /critical success/);
});

test('action check uses status gauge D100 threshold when stat matches', () => {
    const result = executeTavernActionCheck({
        action: '撞开铁门',
        stat: '力量',
        difficulty: 'hard',
    }, {
        rollPercent: () => 45,
        statusDocument: createActionCheckStatusDocument(65, 100),
    });

    assert.equal(result.ok, true);
    assert.equal(result.ok && result.mode, 'statusGauge');
    assert.equal(result.ok && result.difficultyLabel, 'hard');
    assert.equal(result.ok && result.difficulty, 15);
    assert.equal(result.ok && result.roll, 45);
    assert.equal(result.ok && result.threshold, 45);
    assert.equal(result.ok && result.statValue, 65);
    assert.equal(result.ok && result.statMax, 100);
    assert.equal(result.ok && result.success, true);
    assert.equal(result.ok && result.outcome, 'success');
    assert.match(result.ok ? result.summary : '', /45 vs 45% \(65\/100, hard\): success/);
});

test('action check status gauge threshold honors min and active subject', () => {
    const minResult = executeTavernActionCheck({
        action: '顶住上升的闸门',
        stat: '力量',
        difficulty: 'ordinary',
    }, {
        rollPercent: () => 51,
        statusDocument: createActionCheckStatusDocument(75, 100, 50),
    });
    assert.equal(minResult.ok, true);
    assert.equal(minResult.ok && minResult.mode, 'statusGauge');
    assert.equal(minResult.ok && minResult.threshold, 50);
    assert.equal(minResult.ok && minResult.success, false);

    const activeSubject = executeTavernActionCheck({
        action: '守卫撞开木门',
        stat: '力量',
        difficulty: 'ordinary',
    }, {
        rollPercent: () => 80,
        statusDocument: createMultiSubjectStatusDocument({
            activeSubject: 'enemy',
            userStrength: 20,
            enemyStrength: 90,
        }),
    });
    assert.equal(activeSubject.ok, true);
    assert.equal(activeSubject.ok && activeSubject.mode, 'statusGauge');
    assert.equal(activeSubject.ok && activeSubject.threshold, 90);
    assert.equal(activeSubject.ok && activeSubject.success, true);

    const missingFromActiveSubject = executeTavernActionCheck({
        action: '守卫撞开木门',
        stat: '力量',
        difficulty: 'ordinary',
    }, {
        rollDie: () => 20,
        rollPercent: () => 80,
        statusDocument: createMultiSubjectStatusDocument({
            activeSubject: 'enemy',
            userStrength: 20,
        }),
    });
    assert.equal(missingFromActiveSubject.ok, true);
    assert.equal(missingFromActiveSubject.ok && missingFromActiveSubject.mode, 'd20Fallback');
    assert.equal(missingFromActiveSubject.ok && missingFromActiveSubject.roll, 20);
});

test('action check character narrows same-name gauges across tabs', () => {
    const npc = executeTavernActionCheck({
        action: '守卫撞开木门',
        character: '守卫',
        stat: '力量',
        difficulty: 'ordinary',
    }, {
        rollPercent: () => 40,
        statusDocument: createSingleSubjectMultiTabStatusDocument(),
    });
    assert.equal(npc.ok, true);
    assert.equal(npc.ok && npc.mode, 'statusGauge');
    assert.equal(npc.ok && npc.character, '守卫');
    assert.equal(npc.ok && npc.statValue, 40);
    assert.equal(npc.ok && npc.threshold, 40);
    assert.equal(npc.ok && npc.success, true);
    assert.match(npc.ok ? npc.summary : '', /守卫 力量 check 40 vs 40%/);

    const omittedCharacter = executeTavernActionCheck({
        action: '我撞开木门',
        stat: '力量',
        difficulty: 'ordinary',
    }, {
        rollPercent: () => 66,
        statusDocument: createSingleSubjectMultiTabStatusDocument(),
    });
    assert.equal(omittedCharacter.ok, true);
    assert.equal(omittedCharacter.ok && omittedCharacter.mode, 'statusGauge');
    assert.equal(omittedCharacter.ok && omittedCharacter.statValue, 65);
    assert.equal(omittedCharacter.ok && omittedCharacter.success, false);

    const unknownCharacter = executeTavernActionCheck({
        action: '陌生人撞开木门',
        character: '陌生人',
        stat: '力量',
        difficulty: 'ordinary',
    }, {
        rollDie: () => 12,
        rollPercent: () => 1,
        statusDocument: createSingleSubjectMultiTabStatusDocument(),
    });
    assert.equal(unknownCharacter.ok, true);
    assert.equal(unknownCharacter.ok && unknownCharacter.mode, 'd20Fallback');
    assert.equal(unknownCharacter.ok && unknownCharacter.roll, 12);
});

test('action check status gauge D100 enforces critical bands', () => {
    const criticalSuccess = executeTavernActionCheck({
        action: '强行掀开石门',
        stat: '力量',
        difficulty: 'nearly_impossible',
    }, {
        rollPercent: () => 5,
        statusDocument: createActionCheckStatusDocument(20, 100),
    });
    assert.equal(criticalSuccess.ok, true);
    assert.equal(criticalSuccess.ok && criticalSuccess.mode, 'statusGauge');
    assert.equal(criticalSuccess.ok && criticalSuccess.success, true);
    assert.equal(criticalSuccess.ok && criticalSuccess.outcome, 'criticalSuccess');

    const criticalFailure = executeTavernActionCheck({
        action: '强行掀开石门',
        stat: '力量',
        difficulty: 'easy',
    }, {
        rollPercent: () => 96,
        statusDocument: createActionCheckStatusDocument(95, 100),
    });
    assert.equal(criticalFailure.ok, true);
    assert.equal(criticalFailure.ok && criticalFailure.mode, 'statusGauge');
    assert.equal(criticalFailure.ok && criticalFailure.success, false);
    assert.equal(criticalFailure.ok && criticalFailure.outcome, 'criticalFailure');
});

test('action check falls back to D20 when status gauge is missing or invalid', () => {
    const missing = executeTavernActionCheck({
        action: '从窗台跃下',
        stat: '敏捷',
        difficulty: 'very_hard',
    }, {
        rollDie: () => 20,
        statusDocument: createActionCheckStatusDocument(65, 100),
    });
    assert.equal(missing.ok, true);
    assert.equal(missing.ok && missing.mode, 'd20Fallback');
    assert.equal(missing.ok && missing.difficulty, 20);
    assert.equal(missing.ok && missing.outcome, 'criticalSuccess');

    const invalidMax = executeTavernActionCheck({
        action: '撞开铁门',
        stat: '力量',
        difficulty: 'easy',
    }, {
        rollDie: () => 4,
        statusDocument: createActionCheckStatusDocument(65, 0),
    });
    assert.equal(invalidMax.ok, true);
    assert.equal(invalidMax.ok && invalidMax.mode, 'd20Fallback');
    assert.equal(invalidMax.ok && invalidMax.difficulty, 5);
});

test('action check preserves exact insertAfter visible text whitespace', () => {
    const result = executeTavernActionCheck({
        action: '向前踏步',
        stat: '敏捷',
        insertAfter: '我向前踏步 \n',
    }, { rollDie: () => 12 });

    assert.equal(result.ok, true);
    assert.equal(result.ok && result.insertAfter, '我向前踏步 \n');

    const blank = executeTavernActionCheck({
        action: '向前踏步',
        stat: '敏捷',
        insertAfter: ' \n\t',
    }, { rollDie: () => 12 });
    assert.equal(blank.ok, true);
    assert.equal(blank.ok && 'insertAfter' in blank, false);
});

test('action check tool description is a parameter manual', () => {
    const description = String(getActionCheckToolDefinitions()[0]?.function.description || '');
    const parameters = getActionCheckToolDefinitions()[0]?.function.parameters as {
        properties?: Record<string, { enum?: string[]; description?: string }>;
        required?: string[];
    };
    assert.match(description, /Action check for uncertain RP outcomes/);
    assert.match(description, /Parameters:/);
    assert.match(description, /character \(optional\): the name of the character acting/);
    assert.match(description, /status-panel attribute name/);
    assert.match(description, /easy \/ ordinary \/ hard \/ very_hard \/ nearly_impossible/);
    assert.match(description, /Returns: success, failure, critical success, or critical failure/);
    assert.doesNotMatch(description, /When to roll/);
    assert.doesNotMatch(description, /When NOT to roll/);
    assert.doesNotMatch(description, /Critical failure adds a real penalty or complication/);
    assert.deepEqual(parameters.properties?.difficulty?.enum, ['easy', 'ordinary', 'hard', 'very_hard', 'nearly_impossible']);
    assert.deepEqual(parameters.required, ['action', 'stat', 'difficulty']);
    assert.match(String(parameters.properties?.character?.description || ''), /subject name or tab label/);
    assert.match(String(parameters.properties?.stat?.description || ''), /status panel/);
    assert.match(String(parameters.properties?.difficulty?.description || ''), /Do not inflate/);
});
