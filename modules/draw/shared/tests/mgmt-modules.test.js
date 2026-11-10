import assert from 'node:assert/strict';
import test from 'node:test';
import { MGMT_MODULE_IDS, normalizeMgmtLayout, toggleMgmtCollapsed } from '../mgmt-modules.js';

// Acceptance contracts (cost: a bad or stale saved layout hides or locks a management module):
// - Whatever was saved (nothing, unknown ids, duplicates, corrupt text, an old layout that still carries an order), the result is a clean collapsed set.
// - Unknown ids never reach the collapsed set; the default is everything expanded.
// - Toggling changes only the collapsed set; the module order is fixed and never stored.

test('no saved layout gives everything expanded', () => {
    for (const raw of [undefined, null, '', 'not json', '[]', 42, []]) {
        assert.deepEqual(normalizeMgmtLayout(raw), { collapsed: [] }, String(raw));
    }
    assert.deepEqual([...MGMT_MODULE_IDS], ['filters', 'assist', 'presets']);
});

test('saved collapsed ids keep known ones once; an old stored order is ignored', () => {
    assert.deepEqual(
        normalizeMgmtLayout({ order: ['presets', 'filters', 'assist'], collapsed: ['assist', 'ghost', 'assist', 3] }),
        { collapsed: ['assist'] },
    );
    assert.deepEqual(normalizeMgmtLayout('{"collapsed":["presets"],"order":["presets"]}'), { collapsed: ['presets'] }, 'JSON text works too');
    assert.deepEqual(normalizeMgmtLayout({ collapsed: { 0: 'assist' } }), { collapsed: [] }, 'wrong shapes fall back');
});

test('toggling adds and removes a module, unknown ids are ignored', () => {
    const start = { collapsed: ['presets'] };
    assert.deepEqual(toggleMgmtCollapsed(start, 'assist'), { collapsed: ['presets', 'assist'] });
    assert.deepEqual(toggleMgmtCollapsed(start, 'presets'), { collapsed: [] });
    assert.deepEqual(toggleMgmtCollapsed(start, 'ghost'), start);
});
