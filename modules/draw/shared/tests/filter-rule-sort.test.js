import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { createFilterRuleHandle, createFilterRuleSortable } from '../filter-rule-sort.js';

function setup() {
    const { document } = parseHTML('<!doctype html><html><body><div id="list"></div></body></html>');
    const container = document.getElementById('list');
    for (const name of ['a', 'b', 'c']) {
        const row = document.createElement('div');
        row.className = 'filter-rule-row';
        row.dataset.name = name;
        row.append(createFilterRuleHandle(document));
        container.append(row);
    }
    let options = null;
    createFilterRuleSortable({ container, document, createSortable: (given) => { options = given; return { destroy() {} }; } });
    return { document, container, options };
}

const names = container => Array.from(container.querySelectorAll('.filter-rule-row'), row => row.dataset.name);

test('the handle is a focusable drag handle that reuses the shared handle look', () => {
    const { container } = setup();
    const handle = container.querySelector('[data-filter-drag]');
    assert.match(handle.className, /char-drag-handle/);
    assert.equal(handle.getAttribute('tabindex'), '0');
    assert.equal(handle.getAttribute('role'), 'button');
    assert.equal(handle.textContent, '⋮⋮');
});

test('reordering moves the real rows (inputs and checkbox state travel with them) and keeps the list size', () => {
    const { container, options } = setup();
    const rows = Array.from(container.querySelectorAll('.filter-rule-row'));
    const ids = rows.map(row => options.getId(row));
    assert.equal(new Set(ids).size, 3);
    assert.equal(options.getId(rows[0]), ids[0]);
    options.onReorder([ids[2], ids[0], ids[1]]);
    assert.deepEqual(names(container), ['c', 'a', 'b']);
    assert.equal(container.querySelectorAll('.filter-rule-row').length, 3);
    assert.equal(rows[2], container.querySelector('.filter-rule-row'));
});

test('keyboard step swaps neighbours and stops at the ends', () => {
    const { container, options } = setup();
    const ids = Array.from(container.querySelectorAll('.filter-rule-row'), row => options.getId(row));
    assert.deepEqual(options.moveStep(ids, ids[1], -1), [ids[1], ids[0], ids[2]]);
    assert.deepEqual(options.moveStep(ids, ids[0], -1), ids);
    assert.deepEqual(options.moveStep(ids, ids[2], 1), ids);
});
