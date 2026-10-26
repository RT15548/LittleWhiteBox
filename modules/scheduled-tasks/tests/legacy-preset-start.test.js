import assert from 'node:assert/strict';
import test from 'node:test';
import { getTaskTriggerTiming, setTaskTriggerTiming, PRESET_START_TIMING } from '../task-trigger.js';
import {
    readLegacyPresetTasks, importLegacyTaskFile, wouldLegacyTaskRun,
    saveInLegacyEditor, exportLegacyTask,
} from './fixtures/legacy-preset-start.js';

const events = ['before_user', 'after_ai', 'chat_changed', 'chat_created', 'plugin_initialized'];
const task = (interval, triggerTiming = 'chat_changed') => ({
    id: 'shared-panel', name: 'shared panel', commands: '<<taskjs>>/* resident script */<</taskjs>>',
    interval, floorType: 'all', triggerTiming,
    x: { presetStart: true, unrelatedAuthorData: { keep: true } },
});
const fullPreset = task => ({
    prompt_order: [{ character_id: 100000, order: [], xiaobai_ext: { scheduledTasks: [task] } }],
});
const legacyEventResults = task => Object.fromEntries(events.map(event => [event, wouldLegacyTaskRun(task, event)]));
const onlyChatChanged = { before_user: false, after_ai: false, chat_changed: true, chat_created: false, plugin_initialized: false };

for (const interval of [0, 1, 3]) {
    test(`released full-preset reader uses chat-change fallback without floor triggers (interval ${interval})`, () => {
        const source = task(interval);
        const [loaded] = readLegacyPresetTasks(fullPreset(source));
        assert.deepEqual(legacyEventResults(loaded), onlyChatChanged);
        assert.equal(loaded.triggerTiming, 'chat_changed');
        assert.deepEqual(loaded.x, source.x);
        assert.notEqual(loaded.x, source.x);
        assert.equal(loaded.commands, source.commands);
    });

    test(`released task importer preserves chat-change fallback and x marker (interval ${interval})`, () => {
        const source = task(interval);
        const imported = importLegacyTaskFile({ type: 'preset', tasks: [source] });
        assert.equal(imported.type, 'preset');
        assert.deepEqual(legacyEventResults(imported.tasks[0]), onlyChatChanged);
        assert.deepEqual(imported.tasks[0].x, source.x);
        assert.notEqual(imported.tasks[0].x, source.x);
        assert.equal(imported.tasks[0].commands, source.commands);
        // A shared task can also be extracted into the standalone-object format.
        assert.deepEqual(legacyEventResults(importLegacyTaskFile({ ...source, type: 'preset' }).tasks[0]), onlyChatChanged);
    });
}

test('the released reader and standalone importer disagree on a raw unknown preset_enter value', () => {
    for (const interval of [0, 3]) {
        const source = task(interval, 'preset_enter');
        const [full] = readLegacyPresetTasks(fullPreset(source));
        assert.equal(full.triggerTiming, 'preset_enter');
        assert.ok(Object.values(legacyEventResults(full)).every(value => value === false));
        const [single] = importLegacyTaskFile({ type: 'preset', tasks: [source] }).tasks;
        assert.equal(single.triggerTiming, 'after_ai');
        assert.equal(wouldLegacyTaskRun(single, 'after_ai'), interval > 0);
        assert.equal(wouldLegacyTaskRun(single, 'chat_changed'), false);
    }
});

test('released editor and re-export retain the compatibility marker and recognized fallback', () => {
    const source = task(1);
    const edited = saveInLegacyEditor(source, 'chat_changed', { name: 'renamed', commands: 'edited script' });
    assert.equal(edited.triggerTiming, 'chat_changed');
    assert.deepEqual(edited.x, source.x);
    const exported = exportLegacyTask(edited);
    const [roundTrip] = importLegacyTaskFile(exported).tasks;
    assert.deepEqual(legacyEventResults(roundTrip), onlyChatChanged);
    assert.deepEqual(roundTrip.x, source.x);
    assert.equal(roundTrip.name, 'renamed');
    assert.equal(roundTrip.commands, 'edited script');
    assert.equal(readLegacyPresetTasks(fullPreset(edited))[0].x.presetStart, true);
});

test('released editor changes an unknown raw preset_enter timing to after_ai even without a timing edit', () => {
    for (const interval of [0, 3]) {
        const edited = saveInLegacyEditor(task(interval, 'preset_enter'));
        assert.equal(edited.triggerTiming, 'after_ai');
        assert.equal(wouldLegacyTaskRun(edited, 'after_ai'), interval > 0);
    }
});

test('released edits away from chat_changed keep x, so newer readers must check both marker and base timing', () => {
    const edited = saveInLegacyEditor(task(1), 'after_ai');
    assert.equal(edited.triggerTiming, 'after_ai');
    assert.equal(edited.x.presetStart, true);
    assert.equal(wouldLegacyTaskRun(edited, 'after_ai'), true);
    assert.equal(wouldLegacyTaskRun(edited, 'chat_changed'), false);
});

test('new helper output survives both released sharing paths and decodes back to preset startup', () => {
    for (const interval of [0, 3]) {
        const original = { ...task(interval, 'after_ai'), x: { unrelatedAuthorData: { keep: true } } };
        const wire = setTaskTriggerTiming(original, PRESET_START_TIMING, 'preset');
        assert.equal(wire.triggerTiming, 'chat_changed');
        assert.equal(wire.interval, 1);
        assert.equal(wire.x.presetStart, true);
        assert.equal(wire.commands, original.commands);
        assert.deepEqual(wire.x.unrelatedAuthorData, original.x.unrelatedAuthorData);
        assert.equal(original.triggerTiming, 'after_ai');
        assert.equal(original.interval, interval);
        assert.equal(original.x.presetStart, undefined);
        const received = [
            readLegacyPresetTasks(fullPreset(wire))[0],
            importLegacyTaskFile({ type: 'preset', tasks: [wire] }).tasks[0],
        ];
        for (const oldTask of received) {
            assert.deepEqual(legacyEventResults(oldTask), onlyChatChanged);
            assert.equal(getTaskTriggerTiming(oldTask, 'preset'), PRESET_START_TIMING);
            assert.equal(getTaskTriggerTiming(oldTask, 'global'), 'chat_changed');
            assert.equal(getTaskTriggerTiming(oldTask, 'character'), 'chat_changed');
            const edited = saveInLegacyEditor(oldTask, 'chat_changed', { commands: 'edited script' });
            const [roundTrip] = importLegacyTaskFile(exportLegacyTask(edited)).tasks;
            assert.equal(getTaskTriggerTiming(roundTrip, 'preset'), PRESET_START_TIMING);
            assert.equal(roundTrip.commands, 'edited script');
            assert.deepEqual(roundTrip.x.unrelatedAuthorData, original.x.unrelatedAuthorData);
        }
    }
});

test('new helper respects a released editor changing startup fallback to after_ai', () => {
    const wire = setTaskTriggerTiming(task(3), PRESET_START_TIMING, 'preset');
    const edited = saveInLegacyEditor(wire, 'after_ai');
    assert.equal(edited.x.presetStart, true);
    assert.equal(getTaskTriggerTiming(edited, 'preset'), 'after_ai');
    const [roundTrip] = importLegacyTaskFile(exportLegacyTask(edited)).tasks;
    assert.equal(getTaskTriggerTiming(roundTrip, 'preset'), 'after_ai');
});

test('explicit ordinary timing or moving scope removes only the startup marker', () => {
    const wire = setTaskTriggerTiming(task(0), PRESET_START_TIMING, 'preset');
    for (const [timing, scope] of [['chat_changed', 'preset'], [PRESET_START_TIMING, 'global'], ['chat_changed', 'global']]) {
        const converted = setTaskTriggerTiming(wire, timing, scope);
        assert.equal(converted.triggerTiming, 'chat_changed');
        assert.equal(Object.hasOwn(converted.x, 'presetStart'), false);
        assert.deepEqual(converted.x.unrelatedAuthorData, wire.x.unrelatedAuthorData);
        assert.equal(getTaskTriggerTiming(converted, scope), 'chat_changed');
        assert.equal(getTaskTriggerTiming(converted, 'preset'), 'chat_changed');
        assert.equal(converted.commands, wire.commands);
        assert.equal(wire.x.presetStart, true);
    }
});

test('ordinary task edits preserve even unusual author extension data', () => {
    for (const x of [null, 'author data', 0, false, ['author data'], { custom: 1 }]) {
        const original = { ...task(3, 'plugin_init'), x };
        const edited = setTaskTriggerTiming(original, 'plugin_init', 'preset');
        assert.equal(edited.x, x);
        assert.equal(edited.interval, 3);
        assert.equal(edited.commands, original.commands);
        assert.equal(getTaskTriggerTiming(edited, 'preset'), 'plugin_init');
        if (x !== null && (typeof x !== 'object' || Array.isArray(x))) {
            assert.throws(() => setTaskTriggerTiming(original, PRESET_START_TIMING, 'preset'), /扩展字段 x 不是对象/);
            assert.equal(original.x, x);
            assert.equal(original.triggerTiming, 'plugin_init');
        }
    }
});

test('fallback does not weaken the old disabled gate or start on preset switching alone', () => {
    assert.equal(wouldLegacyTaskRun({ ...task(1), disabled: true }, 'chat_changed'), false);
    // The old preset-change handler only refreshes/cache-invalidates. It does not
    // dispatch a chat_changed event or know a preset_enter scheduler context.
    assert.equal(wouldLegacyTaskRun(task(1), 'preset_enter'), false);
});
