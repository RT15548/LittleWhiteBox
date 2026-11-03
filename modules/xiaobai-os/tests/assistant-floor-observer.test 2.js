import assert from 'node:assert/strict';
import test from 'node:test';
import { createAssistantFloorObserver } from '../host/assistant-floor-observer.js';

const user = text => ({ is_user: true, is_system: false, mes: text });
const assistant = text => ({ is_user: false, is_system: false, mes: text });

test('counts new floors across chats but not hidden, regenerated, or continued floors', () => {
    const a = { identityKey: 'A', messages: [user('one'), assistant('old')] };
    const b = { identityKey: 'B', messages: [user('two')] };
    let surface = a;
    let count = 0;
    const observer = createAssistantFloorObserver(() => surface, () => { count += 1; });
    const received = index => {
        observer.started('normal', false, false);
        observer.received(index, 'normal');
    };
    a.messages[1].is_system = true;
    received(1);
    a.messages.push(user('next'), assistant('first new'));
    received(3);
    a.messages[3] = assistant('rerolled');
    observer.started('regenerate', false, false);
    observer.received(3, 'regenerate');
    observer.started('continue', false, false);
    a.messages[3].mes += ' finished';
    observer.received(3, 'continue');
    surface = b;
    observer.reset();
    b.messages.push(assistant('second new'));
    received(1);
    assert.equal(count, 2);
});

test('group reroll using normal generation, delete-middle, and streaming error', () => {
    const surface = { identityKey: 'group', messages: [user('start'), assistant('A'), assistant('B')] };
    let count = 0;
    const observer = createAssistantFloorObserver(() => surface, () => { count += 1; });
    surface.messages.splice(1, 2);
    surface.messages.push(assistant('rerolled A'), assistant('rerolled B'));
    observer.started('normal', false, false);
    observer.received(1, 'normal');
    observer.received(2, 'normal');
    surface.messages.splice(1, 1);
    surface.messages.push(assistant('new after surviving B'));
    observer.started('normal', false, false);
    observer.received(2, 'normal');
    assert.equal(count, 1);
    surface.messages.push(assistant('...'));
    observer.started('normal', false, true);
    observer.received(3, 'normal');
    assert.equal(count, 1);
    observer.token('actual stopped text');
    surface.messages[3].mes = 'actual stopped text';
    observer.received(3, 'normal');
    observer.received(3, 'normal');
    assert.equal(count, 2);
});

test('a quiet or dry-run request cannot erase the main reply being counted', () => {
    const surface = { identityKey: 'chat', messages: [user('start')] };
    let count = 0;
    const observer = createAssistantFloorObserver(() => surface, () => { count += 1; });
    observer.started('normal', false, true);
    observer.started('quiet', false, false);
    observer.started('normal', true, false);
    surface.messages.push(assistant('main response'));
    observer.token('main response');
    observer.received(1, 'normal');
    observer.received(1, 'normal');
    assert.equal(count, 1);
});
