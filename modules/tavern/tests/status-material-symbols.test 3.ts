import test from 'node:test';
import assert from 'node:assert/strict';

import {
    canonicalMaterialSymbolName,
    isMaterialSymbolName,
    normalizeMaterialSymbolName,
    resolveStatusIconName,
} from '../shared/status-material-symbols';

test('status material symbol resolver normalizes official names and falls back without guessing', () => {
    assert.equal(normalizeMaterialSymbolName('Key'), 'key');
    assert.equal(normalizeMaterialSymbolName('local fire department'), 'local_fire_department');
    assert.equal(canonicalMaterialSymbolName('Key'), 'key');
    assert.equal(canonicalMaterialSymbolName('local fire department'), 'local_fire_department');
    assert.equal(isMaterialSymbolName('key'), true);
    assert.equal(isMaterialSymbolName('local-fire-department'), true);
    assert.equal(canonicalMaterialSymbolName('science'), 'science');
    assert.equal(canonicalMaterialSymbolName('biotech'), 'biotech');
    assert.equal(canonicalMaterialSymbolName('swords'), 'swords');
    assert.equal(canonicalMaterialSymbolName('sword'), '');
    assert.equal(canonicalMaterialSymbolName('microscope'), '');
    assert.equal(canonicalMaterialSymbolName('sword_icon'), '');
    assert.equal(resolveStatusIconName('sword', 'item'), 'inventory_2');
    assert.equal(resolveStatusIconName('microscope', 'item'), 'inventory_2');
    assert.equal(resolveStatusIconName('sword_icon', 'item'), 'inventory_2');
    assert.equal(resolveStatusIconName('unknown subject', 'subject'), 'person');
});
