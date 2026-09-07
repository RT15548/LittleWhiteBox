import assert from 'node:assert/strict';
import test from 'node:test';
import { createBackStack } from '../shell/app-src/navigation/back-stack.js';

test('Back consumes only the top active page; leaving it exposes its parent', () => {
    const scope = createBackStack();
    const visited = [];
    scope.add(() => { visited.push('page'); return true; });
    const dismiss = scope.add(() => { visited.push('dialog'); dismiss(); return true; });
    assert.equal(scope.back(), true);
    assert.deepEqual(visited, ['dialog']);
    scope.back();
    assert.deepEqual(visited, ['dialog', 'page']);
});

test('inactive pages fall through, a busy confirmation consumes Back without closing, scopes stay separate', () => {
    const first = createBackStack();
    const second = createBackStack();
    let busy = true;
    let closed = false;
    const remove = first.add(() => { if (!busy) { closed = true; remove(); } return true; });
    first.add(() => false);
    assert.equal(first.back(), true);
    assert.equal(closed, false);
    assert.equal(second.back(), false);
    busy = false;
    assert.equal(first.back(), true);
    assert.equal(closed, true);
    remove();
    assert.equal(first.back(), false);
});
