import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import Dexie from '../../libs/dexie.mjs';
import { createLifecycleJournal } from './lifecycle-journal.js';
import { createIdentifier } from '../../shared/common/identifier.js';

// Two tabs must retain each other's pending operations when appending or
// completing work, including completion of the last entry (lost recovery).
test('two connections retain concurrent journal appends and remove only completed entries', async () => {
    const name = `card-journal-${createIdentifier()}`;
    const first = new Dexie(name), second = new Dexie(name);
    for (const database of [first, second]) database.version(1).stores({ meta: 'key' });
    await first.open(); await second.open();
    const left = createLifecycleJournal(first), right = createLifecycleJournal(second);
    const a = { id: 'a', from: 'A.png', to: 'B.png' }, b = { id: 'b', from: 'X.png', to: 'Y.png' };
    try {
        await Promise.all([left.update(items => [...items, a]), right.update(items => [...items, b])]);
        assert.deepEqual(new Set((await left.read()).map(item => item.id)), new Set(['a', 'b']));
        for (const seed of [[a], [a, b]]) {
            for (const removeFirst of [true, false]) {
                await left.update(() => seed);
                const append = () => right.update(items => [...items, { id: 'c', from: 'C.png' }]);
                const remove = () => left.update(items => items.filter(item => item.id !== 'a'));
                await Promise.all(removeFirst ? [remove(), append()] : [append(), remove()]);
                assert.deepEqual(new Set((await right.read()).map(item => item.id)), new Set([...seed.filter(item => item.id !== 'a').map(item => item.id), 'c']));
            }
        }
        await Promise.all([left.update(items => items.filter(item => item.id !== 'b')), right.update(items => items.filter(item => item.id !== 'c'))]);
        assert.deepEqual(await left.read(), []);
        assert.equal(await first.table('meta').count(), 0);
    } finally { second.close(); await first.delete(); }
});
