import test from 'node:test';
import assert from 'node:assert/strict';
import { equipmentExample } from '../definition/example.js';
import { compileDefinition } from '../definition/compile.js';
import { initialize } from '../engine/settle.js';
import { getAt } from '../engine/data.js';
import { buildUpdateView } from '../model/views.js';
import { accepted, fixture } from './fixture.js';
import type { JsonObject, Path } from '../types.js';

// A1: authored effects need no per-field registration; direct edits still need
// permission. Rejected actions publish nothing (blocked play / corrupted state).
test('A1: actions work through direct locks and absent access entries, with atomic validation', async () => {
    for (const access of ['locked', 'absent'] as const) {
        const bundle = equipmentExample();
        bundle.definition.access = access === 'locked'
            ? [{ path: ['hero'], direct: false, description: 'No direct edits.' }] : [];
        // Even an action named direct is an authored action, not a raw edit.
        bundle.definition.actions[0].id = 'direct';
        const host = fixture(); accepted(await host.service.enable(bundle));
        const initial = host.saved();
        const action = [{ action: 'direct', params: {} }];
        const result = accepted(await host.service.apply(action));
        assert.equal(getAt(result.state, ['hero', 'amulet']), false);
        const committed = host.saved();
        for (const input of [action, [{ action: 'equip', params: { extra: true } }], [{ op: 'set', path: ['hero', 'amulet'], value: true }]]) {
            assert.equal((await host.service.apply(input)).ok, false);
            assert.deepEqual(host.saved(), committed);
        }
        host.load(JSON.parse(JSON.stringify(committed)));
        accepted(await host.service.undo());
        assert.deepEqual(host.saved().state, initial.state);
    }
});

// A2: action effects cannot change derived or fixed outputs, including through
// a whole-parent replacement; invalid final states never publish (silent corruption).
test('A2: fixed and calculated fields, schema and constraints remain protected from actions', async () => {
    const base = equipmentExample(), start = accepted(await initialize(compileDefinition(base))).state;
    const hero = getAt(start, ['hero']) as JsonObject;
    for (const [path, value, code] of [
        [['hero', 'baseHealth'], 99, 'derived-write'],
        [['hero', 'maxHealth'], 99, 'derived-write'],
        [['hero'], { ...hero, baseHealth: 99 }, 'derived-write'],
        [['hero', 'health'], -1, 'state-schema'],
        [['hero', 'health'], 1, 'constraint'],
    ] as const) {
        const bundle = equipmentExample();
        bundle.definition.actions[0].effects = [{ path: [...path], value: { literal: value } }];
        if (code === 'constraint') {bundle.definition.constraints.push({ id: 'keep-health', description: 'No injury.', test: { op: 'gte', args: [{ get: ['hero', 'health'] }, { before: ['hero', 'health'] }] } });}
        const host = fixture(); accepted(await host.service.enable(bundle));
        const saved = host.saved();
        const result = await host.service.apply([{ action: 'unequip', params: {} }]);
        assert.equal(result.ok, false); assert.equal(result.diagnostics[0].code, code);
        assert.deepEqual(host.saved(), saved);
    }
});

// A3: the updater gets action associations from effect targets, not reads or
// parameter conversions, filtered to this stage (wrong/missing model submissions).
test('A3: field-to-action associations are derived from effect paths and stages', async () => {
    const bundle = equipmentExample(), definition = bundle.definition;
    definition.updates = ['before', 'after'];
    definition.access.forEach(entry => { if (entry.direct) {entry.stages = ['after'];} });
    definition.access.push({ path: ['hero'], direct: false, description: 'Hero.', update: 'Use the relevant action.' });
    definition.actions.forEach(action => {action.stages = ['before'];});
    definition.actions[0].requires = { op: 'gt', args: [{ get: ['hero', 'health'] }, { literal: 0 }] };
    definition.actions[0].conversions = [{ path: ['hero', 'health'], value: { literal: 1 } }];
    definition.actions.push({ ...structuredClone(definition.actions[0]), id: 'heal', stages: ['after'], conversions: [],
        effects: [{ path: ['hero', 'health'], value: { literal: 80 } }] });
    const compiled = compileDefinition(bundle), state = accepted(await initialize(compiled)).state;
    const before = buildUpdateView(compiled, state, 'before'), after = buildUpdateView(compiled, state, 'after');
    const field = (view: typeof before, path: Path) => view.fields.find(entry => entry.path.join('.') === path.join('.'))!;
    assert.deepEqual(field(before, ['hero', 'amulet']).write, ['unequip', 'equip']);
    assert.equal(field(before, ['hero', 'amulet']).update, definition.access[2].update);
    assert.deepEqual(field(before, ['hero', 'health']).write, []);
    assert.deepEqual(field(after, ['hero', 'health']).write, ['heal']);
    assert.deepEqual(field(before, ['hero']).write, ['unequip', 'equip']);
    assert.deepEqual(field(after, ['hero', 'amulet']).write, []);
    definition.actions[0].effects = [{ path: ['hero'], value: { literal: getAt(state, ['hero'])! } }];
    const parent = buildUpdateView(compileDefinition(bundle), state, 'before');
    assert.deepEqual(field(parent, ['hero', 'health']).write, ['unequip']);
});
