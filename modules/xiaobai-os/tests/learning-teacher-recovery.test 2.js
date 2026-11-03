import assert from 'node:assert/strict';
import test from 'node:test';
import { createClassroomFixture } from './fixtures/learning-classroom.js';

for (const applied of [true, false]) {
    test(`teacher settings recover their own uncertain write without a model or another write (applied: ${applied})`, async t => {
        const h = await createClassroomFixture(); t.after(h.dispose);
        const original = { name: '林老师', note: 'First choice' };
        const changed = { name: '林老师', note: 'Updated preference' };
        await h.command('teacher', { teacher: original });
        h.flags.teacherReceiptLost = true; h.flags.teacherWriteApplied = applied;
        await h.command('teacher', { teacher: changed });
        assert.equal(h.state().storage, 'ready');
        assert.equal(h.state().chatStorage, 'unconfirmed');
        const writes = h.counts.teacherWrites;
        await h.command('verify-teacher');
        if (!applied) {
            assert.equal(h.state().chatStorage, 'unconfirmed');
            await h.command('adopt-teacher');
        }
        assert.equal(h.state().chatStorage, 'ready');
        assert.deepEqual(h.state().teacher, applied ? changed : original);
        assert.equal(h.coordinator.hasPendingCommit(), false);
        assert.equal(h.counts.teacherWrites, writes);
        assert.equal(h.counts.provider, 0);
    });
}
