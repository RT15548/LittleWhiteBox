import assert from 'node:assert/strict';
import test from 'node:test';

import {
    captureAutomaticAcceptedTurn,
    captureManualAcceptedTurn,
    captureRebuildSource,
    matchesAcceptedTurnSource,
} from '../capabilities/maintenance/accepted-turn-source.js';

const user = (mes, extra = {}) => ({ is_user: true, is_system: false, mes, ...extra });
const assistant = (mes, swipe_id = null) => ({ is_user: false, is_system: false, mes, swipe_id });
const system = mes => ({ is_user: false, is_system: true, mes });
const surface = messages => ({
    identityKey: 'character:1:chat',
    messages,
    playerName: 'Alice',
    assistantName: 'Narrator',
});
const snapshot = (index, role, text, swipeId = null) => ({
    index,
    role,
    text,
    swipeId,
    speakerName: role === 'user' ? 'Alice' : 'Narrator',
});

test('automatic capture uses U2 only as the accepted U1/A1 boundary', () => {
    const chat = surface([
        user('  U1  '),
        assistant(' A1 ', 2),
        user('U2'),
    ]);

    const source = captureAutomaticAcceptedTurn(chat, 2);

    assert.deepEqual(source, {
        chatIdentity: chat.identityKey,
        messages: [
            snapshot(0, 'user', '  U1  '),
            snapshot(1, 'assistant', ' A1 ', 2),
        ],
        messageCount: 3,
        assistantCount: 1,
        player: { actorKey: 'player', displayName: 'Alice' },
        trigger: snapshot(2, 'user', 'U2'),
    });
});

test('automatic capture keeps the selected swipe and all consecutive group assistants', () => {
    const chat = surface([
        user('U1'),
        assistant('A1a selected', 'swipe-a'),
        assistant('A1b', 3),
        user('U2'),
    ]);

    const source = captureAutomaticAcceptedTurn(chat, 3);

    assert.deepEqual(source?.messages, [
        snapshot(0, 'user', 'U1'),
        snapshot(1, 'assistant', 'A1a selected', 'swipe-a'),
        snapshot(2, 'assistant', 'A1b', 3),
    ]);
    assert.equal(source?.assistantCount, 2);
});

test('automatic capture accepts consecutive greetings before the first User', () => {
    const chat = surface([
        system('metadata'),
        assistant('Greeting one'),
        assistant('Greeting two'),
        user('U1'),
    ]);

    assert.deepEqual(captureAutomaticAcceptedTurn(chat, 3)?.messages, [
        snapshot(1, 'assistant', 'Greeting one'),
        snapshot(2, 'assistant', 'Greeting two'),
    ]);
});

test('assistantCount includes empty non-system Assistant messages outside the accepted evidence', () => {
    const chat = surface([
        assistant(''),
        user('U1'),
        assistant('A1'),
        user('U2'),
    ]);

    const source = captureAutomaticAcceptedTurn(chat, 3);
    assert.deepEqual(source?.messages, [snapshot(1, 'user', 'U1'), snapshot(2, 'assistant', 'A1')]);
    assert.equal(source?.assistantCount, 2);
});

test('adapter aliases are normalized without trimming or coercing captured text', () => {
    const chat = surface([
        { role: 'user', content: ' user alias ' },
        { role: 'assistant', text: ' assistant alias ' },
        { role: 'user', content: 'trigger' },
    ]);

    assert.deepEqual(captureAutomaticAcceptedTurn(chat, 2)?.messages, [
        snapshot(0, 'user', ' user alias '),
        snapshot(1, 'assistant', ' assistant alias '),
    ]);
});

test('participant names are normalized once at capture and remain valid Map display names', () => {
    const longName = `  ${'名'.repeat(130)}\u0000  `;
    const chat = {
        ...surface([user('U1'), assistant('A1'), user('U2')]),
        playerName: longName,
        assistantName: '  Narrator\nName  ',
    };
    chat.messages[0].name = longName;
    chat.messages[1].name = '  Narrator\nName  ';

    const source = captureAutomaticAcceptedTurn(chat, 2);

    assert.ok(source);
    assert.equal(Array.from(source.player.displayName).length, 120);
    assert.equal(source.messages[0].speakerName, '名'.repeat(120));
    assert.equal(source.messages[1].speakerName, 'Narrator Name');
    assert.equal(matchesAcceptedTurnSource(chat, source), true);
});

test('automatic capture rejects invalid indices, triggers, missing replies, and contamination', () => {
    const complete = surface([user('U1'), assistant('A1'), user('U2')]);
    assert.equal(captureAutomaticAcceptedTurn(complete, 1), null);
    assert.equal(captureAutomaticAcceptedTurn(complete, 1.5), null);
    assert.equal(captureAutomaticAcceptedTurn(complete, Number.NaN), null);
    assert.equal(captureAutomaticAcceptedTurn(surface([user('U1'), assistant('A1'), system('U2')]), 2), null);
    assert.equal(captureAutomaticAcceptedTurn(surface([user('U1'), assistant('A1'), user('  ')]), 2), null);
    assert.equal(captureAutomaticAcceptedTurn(surface([user('U1'), user('U2')]), 1), null);
    assert.equal(captureAutomaticAcceptedTurn(surface([user('U1'), assistant('A1'), system('gap'), assistant('A2'), user('U2')]), 4), null);
    assert.equal(captureAutomaticAcceptedTurn(surface([user('U1'), assistant(''), assistant('A2'), user('U2')]), 3), null);
});

test('manual capture returns the latest complete tail turn and guards active generation locally', () => {
    const chat = surface([
        user('old'),
        assistant('old reply'),
        user('latest'),
        assistant('member one', 1),
        assistant('member two', 2),
    ]);

    const result = captureManualAcceptedTurn(chat, { generationActive: false });

    assert.equal(result.ok, true);
    assert.deepEqual(result.source.messages, [
        snapshot(2, 'user', 'latest'),
        snapshot(3, 'assistant', 'member one', 1),
        snapshot(4, 'assistant', 'member two', 2),
    ]);
    assert.equal('trigger' in result.source, false);
    assert.deepEqual(captureManualAcceptedTurn(chat, { generationActive: true }), {
        ok: false,
        reason: 'generation-active',
    });
    assert.deepEqual(captureManualAcceptedTurn(null, { generationActive: false }), {
        ok: false,
        reason: 'chat-unavailable',
    });
    assert.deepEqual(captureManualAcceptedTurn(surface([user('incomplete')]), { generationActive: false }), {
        ok: false,
        reason: 'no-complete-assistant',
    });
    assert.deepEqual(captureManualAcceptedTurn(surface([assistant('greeting')]), { generationActive: false }), {
        ok: false,
        reason: 'no-complete-assistant',
    });
});

test('rebuild captures only the latest 80 usable non-system messages by default', () => {
    const messages = [system('header')];
    for (let index = 0; index < 85; index += 1) {
        messages.push(index % 2 === 0 ? user(`U${index}`) : assistant(`A${index}`, index));
    }
    messages.splice(12, 0, assistant('   '));
    const chat = surface(messages);

    const result = captureRebuildSource(chat, { generationActive: false });

    assert.equal(result.ok, true);
    assert.equal(result.source.messages.length, 80);
    assert.equal(result.source.messages[0].text, 'A5');
    assert.equal(result.source.messages.at(-1).text, 'U84');
    assert.equal(result.source.messageCount, 87);
    assert.deepEqual(captureRebuildSource(chat, { generationActive: false, maxMessages: 0 }), {
        ok: false,
        reason: 'invalid-message-limit',
    });
    assert.deepEqual(captureRebuildSource(surface([system('only'), user(' ')]), { generationActive: false }), {
        ok: false,
        reason: 'no-usable-messages',
    });
});

test('matching rejects identity, evidence edits, deletion, and selected swipe changes', () => {
    const chat = surface([user('U1'), assistant('A1', 1), user('U2')]);
    const source = captureAutomaticAcceptedTurn(chat, 2);
    assert.ok(source);
    assert.equal(matchesAcceptedTurnSource(chat, source), true);
    assert.equal(matchesAcceptedTurnSource({ ...chat, identityKey: 'other' }, source), false);
    assert.equal(matchesAcceptedTurnSource({ ...chat, playerName: 'Someone else' }, source), false);

    chat.messages[1].mes = 'edited';
    assert.equal(matchesAcceptedTurnSource(chat, source), false);
    chat.messages[1].mes = 'A1';
    chat.messages[1].swipe_id = 2;
    assert.equal(matchesAcceptedTurnSource(chat, source), false);
    chat.messages[1].swipe_id = 1;
    chat.messages.splice(1, 1);
    assert.equal(matchesAcceptedTurnSource(chat, source), false);
});

test('all maintenance modes allow appended turns but still reject changes to their captured evidence', () => {
    const automaticChat = surface([user('U1'), assistant('A1'), user('U2')]);
    const automatic = captureAutomaticAcceptedTurn(automaticChat, 2);
    assert.ok(automatic);

    automaticChat.messages.push(assistant('A2'));
    assert.equal(matchesAcceptedTurnSource(automaticChat, automatic), true);
    automaticChat.messages.push(user('U3'));
    assert.equal(matchesAcceptedTurnSource(automaticChat, automatic), true);

    for (const capture of [captureManualAcceptedTurn, captureRebuildSource]) {
        const chat = surface([user('U1'), assistant('A1')]);
        const result = capture(chat, { generationActive: false });
        assert.equal(result.ok, true);
        chat.messages.push(user('U2'), assistant('A2'));
        assert.equal(matchesAcceptedTurnSource(chat, result.source), true);
        chat.messages[1].mes = 'edited';
        assert.equal(matchesAcceptedTurnSource(chat, result.source), false);
        chat.messages[1].mes = 'A1';
        chat.messages[1].swipe_id = 9;
        assert.equal(matchesAcceptedTurnSource(chat, result.source), false);
        chat.messages.splice(1, 1);
        assert.equal(matchesAcceptedTurnSource(chat, result.source), false);
        assert.equal(matchesAcceptedTurnSource({ ...chat, identityKey: 'other' }, result.source), false);
    }
});
