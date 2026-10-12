import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMessageSourceTracker } from '../data/message-sources.js';

function fixture() {
    const context = { chatId: 'chat', chat: [
        { mes: 'greeting', name: 'AI', is_user: false },
        { mes: 'question', name: 'User', is_user: true },
        { mes: 'answer', name: 'AI', is_user: false },
        { mes: 'another answer', name: 'AI', is_user: false },
    ] };
    const tracker = createMessageSourceTracker();
    tracker.reset(context);
    return { tracker, context };
}

test('saving unchanged text and render/quiet-only metadata are not source edits', () => {
    const { tracker, context } = fixture();
    context.chat[0].is_system = true;
    context.chat[0].extra = { viewed: true };
    assert.equal(tracker.inspect(context, 0), null);
    assert.equal(tracker.inspect(context, 3), null);
});

test('duplicate chat initialization does not confirm edits; a different owner gets a new baseline', () => {
    const { tracker, context } = fixture();
    context.chat.reverse();
    tracker.switchChat(context);
    assert.equal(tracker.inspect(context).fromFloor, 0);
    const other = { ...context, chatId: 'other' };
    tracker.switchChat(other);
    assert.equal(tracker.inspect(other), null);
});

test('same-chat deserialization rebinds unchanged sources without confirming a stale request', () => {
    const { tracker, context } = fixture();
    const before = tracker.capture(context);
    // Both supported hosts splice parsed objects into the existing chat array.
    context.chat.splice(0, context.chat.length, ...structuredClone(context.chat));
    tracker.switchChat(context);
    assert.equal(tracker.inspect(context), null);
    assert.equal(tracker.isCurrent(before, context), false);
    assert.equal(tracker.observeCompletion(context, 2), false);
});

test('reload preserves an unfinished local edit without invalidating the healthy prefix or suffix', async () => {
    const { tracker, context } = fixture();
    context.chat[2].mes += ' edited';
    await tracker.synchronize(context, async () => ({ status: 'failed' }));
    context.chat.splice(0, context.chat.length, ...structuredClone(context.chat));
    tracker.switchChat(context);
    const change = tracker.inspect(context);
    assert.equal(change.fromFloor, null);
    assert.deepEqual(change.editedFloors, [2]);
    assert.deepEqual(change.anchorFloors, [2]);
    assert.equal((await tracker.synchronize(context, async () => ({ status: 'not_needed' }))).status, 'synced');
    assert.equal(tracker.inspect(context), null);
});

test('pending structural retirement survives reload even when swapped messages have identical text', async () => {
    const { tracker, context } = fixture();
    context.chat[3].mes = context.chat[2].mes;
    tracker.reset(context);
    [context.chat[2], context.chat[3]] = [context.chat[3], context.chat[2]];
    await tracker.synchronize(context, async () => ({ status: 'failed' }));
    context.chat = structuredClone(context.chat);
    tracker.switchChat(context);
    assert.equal(tracker.inspect(context).fromFloor, 2);
    assert.equal(tracker.inspect(context).structural, true);
});

test('a reload containing a real reorder retires from the first changed source, not floor zero', () => {
    const { tracker, context } = fixture();
    [context.chat[2], context.chat[3]] = [context.chat[3], context.chat[2]];
    context.chat = structuredClone(context.chat);
    tracker.switchChat(context);
    assert.equal(tracker.inspect(context).fromFloor, 2);
});

test('an AI edit affects one L0 floor; a USER edit also affects only its immediate AI neighbour', async () => {
    const { tracker, context } = fixture();
    context.chat[1].mes = 'new question';
    const user = tracker.inspect(context, 1);
    assert.equal(user.fromFloor, null);
    assert.deepEqual(user.anchorFloors, [1, 2]);
    await tracker.synchronize(context, async () => ({ status: 'not_needed' }));
    assert.equal(tracker.inspect(context, 1), null);
    context.chat[2].mes = 'new answer';
    assert.deepEqual(tracker.inspect(context, 2).anchorFloors, [2]);
});

test('a role change invalidates the old USER dependency too', () => {
    const { tracker, context } = fixture();
    context.chat[1].is_user = false;
    assert.deepEqual(tracker.inspect(context, 1).anchorFloors, [1, 2]);
});

test('reordering messages is a suffix change even if the edited body is identical', async () => {
    const { tracker, context } = fixture();
    [context.chat[1], context.chat[2]] = [context.chat[2], context.chat[1]];
    const change = tracker.inspect(context, 2);
    assert.equal(change.fromFloor, 1);
    await tracker.synchronize(context, async () => ({ status: 'not_needed' }));
    assert.equal(tracker.inspect(context, 2), null);
});

test('an earlier edit cannot hide behind an appended message not yet observed by its delayed event', () => {
    const { tracker, context } = fixture();
    context.chat.push({ mes: 'new user', is_user: true });
    context.chat[1].mes = 'changed earlier input';
    assert.equal(tracker.inspect(context, 1).fromFloor, 1);
});

test('a new native reply and same-floor continuation are observed once, unlike duplicate completion', async () => {
    const { tracker, context } = fixture();
    context.chat.push({ mes: 'new reply', is_user: false });
    const appended = tracker.inspect(context, 4);
    assert.equal(appended.fromFloor, 4);
    assert.equal(tracker.observeCompletion(context, 4), true);
    assert.equal(tracker.observeCompletion(context, 4), false);
    assert.ok(tracker.inspect(context));
    await tracker.synchronize(context, async () => ({ status: 'not_needed' }));
    assert.equal(tracker.inspect(context, 4), null);
    context.chat[4].mes += ' continued';
    const continued = tracker.inspect(context, 4);
    assert.equal(continued.fromFloor, null);
    assert.equal(tracker.observeCompletion(context, 4), true);
    await tracker.synchronize(context, async () => ({ status: 'not_needed' }));
    assert.equal(tracker.inspect(context, 4), null);
});

test('acknowledging one edit cannot hide another floor edit or newer text during asynchronous work', async () => {
    const { tracker, context } = fixture();
    context.chat[0].mes = 'edited';
    context.chat[2].mes = 'also edited';
    const result = await tracker.synchronize(context, async () => {
        context.chat[0].mes = 'edited again';
        return { status: 'not_needed' };
    });
    assert.equal(result.status, 'stale');
    assert.ok(tracker.inspect(context, 0));
    assert.ok(tracker.inspect(context, 2));
});

test('failed synchronization stays unacknowledged and a late old-chat result cannot reset a new chat', async () => {
    const { tracker, context } = fixture();
    context.chat[0].mes = 'edited';
    for (const status of ['failed', 'stale', undefined]) {
        await tracker.synchronize(context, async () => status ? { status } : undefined);
        assert.ok(tracker.inspect(context));
    }
    assert.ok(tracker.inspect(context, 0));
    await tracker.synchronize(context, async () => {
        tracker.reset({ ...context, chatId: 'other' });
        return { status: 'not_needed' };
    });
    assert.equal(tracker.inspect({ ...context, chatId: 'other' }, 0), null);
});

test('finishing a deletion only acknowledges its captured chat, not edits made while it was waiting', async () => {
    const { tracker, context } = fixture();
    context.chat.pop();
    const result = await tracker.synchronize(context, async () => {
        context.chat[0].mes = 'edited during deletion sync';
        return { status: 'not_needed' };
    });
    assert.equal(result.status, 'stale');
    assert.equal(tracker.inspect(context).fromFloor, 0);
});

test('replacement of the active chat array during synchronization cannot confirm the detached array', async () => {
    const { tracker, context } = fixture();
    context.chat[0].mes += ' edited';
    let current = context;
    const result = await tracker.synchronize(context, async () => {
        current = { ...context, chat: [...context.chat].reverse() };
        return { status: 'not_needed' };
    }, () => current);
    assert.equal(result.status, 'stale');
    assert.ok(tracker.inspect(current));
});

test('returning to a chat cannot reset the baseline of unfinished source retirement', async () => {
    const { tracker, context } = fixture();
    context.chat[0].mes += ' edited';
    const other = { chatId: 'other', chat: [] };
    const result = await tracker.synchronize(context, async () => {
        tracker.switchChat(other);
        tracker.switchChat(context);
        return { status: 'not_needed' };
    });
    assert.equal(result.status, 'stale');
    assert.ok(tracker.inspect(context));
    assert.equal((await tracker.synchronize(context, async () => ({ status: 'not_needed' }))).status, 'synced');
    assert.equal(tracker.inspect(context), null);
});

test('explicit L2 replacement releases only its captured rollback, never cache retirement or newer edits', () => {
    const { tracker, context } = fixture();
    context.chat[1].mes += ' changed';
    tracker.retain(context, { kind: 'swipe', floor: 1 });
    const replaced = tracker.capture(context);
    context.chat[2].mes += ' changed during replacement';
    tracker.resolveRollback(replaced, context);
    assert.equal(tracker.inspect(context).rollbackFromFloor, 1);
    tracker.resolveRollback(tracker.capture(context), context);
    assert.equal(Number.isFinite(tracker.inspect(context).rollbackFromFloor), false);
    assert.deepEqual(tracker.inspect(context).editedFloors, [1, 2]);
});

test('deleting an unselected swipe only renumbers the selected branch, including its next ordinary edit', async () => {
    const { tracker, context } = fixture();
    const message = context.chat[2];
    message.swipes = ['unused', message.mes]; message.swipe_id = 1;
    tracker.reset(context);
    message.swipes.splice(0, 1); message.swipe_id = 0;
    tracker.observeSwipeDeleted(context, { messageId: 2, swipeId: 0, newSwipeId: 0 });
    message.mes += ' ordinary edit'; message.swipes[0] = message.mes;
    assert.equal(tracker.inspect(context).rollbackFromFloor, null);
});

test('consecutive unselected deletions preserve completion deduplication and pending ordinary edits', () => {
    const { tracker, context } = fixture();
    const message = context.chat[2];
    message.swipes = ['unused A', 'unused B', message.mes]; message.swipe_id = 2;
    tracker.reset(context);
    for (let i = 0; i < 2; i++) {
        message.swipes.splice(0, 1); message.swipe_id--;
        tracker.observeSwipeDeleted(context, { messageId: 2, swipeId: 0 });
        assert.equal(tracker.inspect(context), null);
        assert.equal(tracker.observeCompletion(context, 2), false);
    }
    message.mes += ' ordinary edit'; message.swipes[0] = message.mes;
    tracker.retain(context, { kind: 'edit', floor: 2 });
    message.swipes.push('unused C');
    message.swipes.splice(1, 1);
    tracker.observeSwipeDeleted(context, { messageId: 2, swipeId: 1 });
    assert.deepEqual(tracker.inspect(context).editedFloors, [2]);
    assert.equal(tracker.inspect(context).rollbackFromFloor, null);
});

test('adding then deleting the selected same-text candidate cannot hide behind an unchanged count', () => {
    const { tracker, context } = fixture();
    const message = context.chat[2];
    message.swipes = [message.mes]; message.swipe_id = 0;
    tracker.reset(context);
    message.swipes.push(message.mes);
    message.swipes.splice(0, 1);
    const before = tracker.capture(context);
    tracker.observeSwipeDeleted(context, { messageId: 2, swipeId: 0 });
    assert.equal(tracker.inspect(context).rollbackFromFloor, 2);
    assert.equal(tracker.isCurrent(before, context), false);
});

test('an unselected deletion during a consistency write cannot reinstall obsolete branch indices', async () => {
    const { tracker, context } = fixture();
    const message = context.chat[2];
    message.swipes = ['unused', message.mes]; message.swipe_id = 1;
    tracker.reset(context);
    context.chat[0].mes += ' ordinary edit';
    const result = await tracker.synchronize(context, async () => {
        message.swipes.splice(0, 1); message.swipe_id = 0;
        tracker.observeSwipeDeleted(context, { messageId: 2, swipeId: 0 });
        return { status: 'not_needed' };
    });
    assert.equal(result.status, 'synced');
    message.mes += ' ordinary edit'; message.swipes[0] = message.mes;
    assert.deepEqual(tracker.inspect(context).editedFloors, [2]);
    assert.equal(tracker.inspect(context).rollbackFromFloor, null);
});

test('a host selecting another surviving branch on deletion still requires rollback, even with identical prose', () => {
    const { tracker, context } = fixture();
    const message = context.chat[2];
    message.swipes = ['unused', message.mes, message.mes]; message.swipe_id = 2;
    tracker.reset(context);
    // ST 1.14 selects the candidate at the deleted position, not necessarily the old selection.
    message.swipes.splice(0, 1); message.swipe_id = 0;
    tracker.observeSwipeDeleted(context, { messageId: 2, swipeId: 0 });
    assert.equal(tracker.inspect(context).rollbackFromFloor, 2);
    context.chat = structuredClone(context.chat); tracker.switchChat(context);
    assert.equal(tracker.inspect(context).rollbackFromFloor, 2);
});

for (const removed of [0, 1]) test(`deletion rebases imported L2 separately from unfinished cache retirement (removed: ${removed})`, () => {
    const { tracker, context } = fixture();
    const message = context.chat[2];
    message.swipes = [message.mes, message.mes, message.mes]; message.swipe_id = 0;
    tracker.reset(context);
    message.swipe_id = 1;
    tracker.resolveRollback(tracker.capture(context), context);
    const before = tracker.capture(context);
    message.swipes.splice(removed, 1); message.swipe_id = removed === 0 ? 0 : 1;
    tracker.observeSwipeDeleted(context, { messageId: 2, swipeId: removed });
    const change = tracker.inspect(context);
    assert.deepEqual(change.editedFloors, [2]);
    assert.equal(change.rollbackFromFloor, removed === 1 ? 2 : null);
    if (removed === 1) {
        assert.equal(tracker.isCurrent(before, context), false);
        tracker.resolveRollback(before, context);
        assert.equal(tracker.inspect(context).rollbackFromFloor, 2);
    }
});

test('deleting the selected swipe is a branch change even when its replacement keeps the same index', () => {
    const { tracker, context } = fixture();
    const message = context.chat[2];
    message.swipes = [message.mes, 'replacement']; message.swipe_id = 0;
    tracker.reset(context);
    message.swipes.splice(0, 1); message.mes = message.swipes[0];
    assert.equal(tracker.inspect(context).rollbackFromFloor, 2);
});

test('swiping a moved message cannot hide behind a simultaneous reorder', () => {
    const { tracker, context } = fixture();
    [context.chat[2], context.chat[3]] = [context.chat[3], context.chat[2]];
    context.chat[3].swipe_id = 1; context.chat[3].mes = 'other branch';
    assert.equal(tracker.inspect(context).rollbackFromFloor, 2);
});

test('import recovery survives reload but never excuses a subsequent deletion before cache cleanup', () => {
    const { tracker, context } = fixture();
    context.chat.splice(2, 1); tracker.retain(context, { kind: 'delete' });
    tracker.resolveRollback(tracker.capture(context), context);
    context.chat = structuredClone(context.chat); tracker.switchChat(context);
    assert.equal(tracker.inspect(context).rollbackFromFloor, null);
    context.chat.splice(1, 1);
    assert.equal(tracker.inspect(context).rollbackFromFloor, 1);
});

test('a deletion notification uses its L2 basis even if an appended reply has restored the old length', () => {
    const { tracker, context } = fixture();
    context.chat.splice(2, 1); context.chat.push({ mes: 'new reply', is_user: false });
    tracker.retain(context, { kind: 'delete' });
    assert.equal(tracker.inspect(context).rollbackFromFloor, 2);
    tracker.resolveRollback(tracker.capture(context), context);
    tracker.retain(context, { kind: 'delete' });
    assert.equal(tracker.inspect(context).rollbackFromFloor, null);
});
