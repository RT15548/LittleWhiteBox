import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMessageMutation } from '../domains/messages/mutation.js';
import { createHash } from 'node:crypto';
import { emptyMessages } from '../domains/messages/types.js';
import { addContact, appendMessages } from '../domains/messages/commands.js';
import { projectionText } from '../domains/messages/transcript.js';
import { messageReceipt } from '../domains/messages/receipt.js';
import { branchMessages } from '../apps/messages/application/branch.js';
import { PRIVATE_MESSAGE_MARKER, unsyncedIds } from '../apps/messages/application/projection.js';
import { createMessagesBranchCopy } from '../apps/messages/host/branch-copy.js';
import { createChatBindingManager } from '../storage/chat-binding.js';
import { MESSAGES_PARTITION } from '../apps/messages/partition.js';
import { buildReplyPrompt } from '../apps/messages/prompt/reply-prompt.js';
import { normalizePromptContext } from '../host/prompt-context/normalize.js';

const clone = structuredClone;
const hash = text => createHash('sha256').update(text).digest('hex');
function fixture() {
    const source = emptyMessages();
    for (const id of ['甲', '乙', '仅在通讯录']) {addContact(source, { id, name: id, note: '', createdAt: 0, summary: null });}
    const add = (id, contactId = '甲', segmentId = 'shared') => appendMessages(source, {
        segmentId, contactId, playerName: '玩家', replyTo: null, createdAt: 1,
        entries: [{ id, payload: { type: 'text', text: id } }],
    });
    const floor = (segment = source.segments.at(-1)) => {
        const throughSeq = source.messages.filter(message => segment.messageIds.includes(message.id)).at(-1).seq;
        const mes = projectionText(source, segment, throughSeq);
        segment.receipt = messageReceipt(source, segment, throughSeq);
        return { name: '私人信息', is_user: false, is_system: false, mes,
            extra: { [PRIVATE_MESSAGE_MARKER]: { version: 1, segmentId: segment.id, throughSeq, digest: hash(mes) } } };
    };
    return { source, add, floor };
}

test('historical branch trims later additions to the same floor, future contacts, notes and summaries', () => {
    const h = fixture(); h.add('过去约定'); const childChat = [h.floor()];
    h.add('未来暗号'); h.add('乙的未来来信', '乙'); h.floor();
    h.source.contacts[0].note = '未来才知道的身份';
    h.source.contacts[0].summary = { throughSeq: 2, text: '未来暗号摘要' };
    const before = clone(h.source);
    const result = branchMessages(h.source, childChat);
    assert.deepEqual(result.messages.map(message => message.id), ['过去约定']);
    assert.deepEqual(result.contacts.map(contact => contact.name), ['甲']);
    assert.equal(result.contacts[0].note, ''); assert.equal(result.contacts[0].summary, null);
    assert.equal(MESSAGES_PARTITION.parse(result).ok, true);
    assert.deepEqual(unsyncedIds(result), []);
    assert.deepEqual(h.source, before);
    const prompt = buildReplyPrompt({ contact: result.contacts[0], context: { ...normalizePromptContext({}), people: [] },
        history: result.messages, incoming: { ...result.messages[0], payload: { type: 'text', text: '现在呢？' } }, settings: { imagePrompt: false, voicePrompt: false } });
    assert.match(JSON.stringify(prompt), /过去约定/); assert.doesNotMatch(JSON.stringify(prompt), /未来/);
});

test('a branch before any private floor starts without contacts or private history', () => {
    const h = fixture(); h.add('未来消息'); h.floor();
    const result = branchMessages(h.source, [{ name: '旁白', mes: '开场。' }]);
    assert.deepEqual(result.messages, []); assert.deepEqual(result.contacts, []); assert.deepEqual(result.segments, []);
});

test('modified native markers do not establish a later private-message boundary', () => {
    const h = fixture(); h.add('保留'); const first = h.floor();
    h.add('未来', '甲', 'later'); const edited = h.floor(); edited.mes = '人工替换内容';
    const result = branchMessages(h.source, [first, edited]);
    assert.deepEqual(result.messages.map(message => message.id), ['保留']);
});

test('branching after contact deletion retains other messages and supports branching again', () => {
    const h = fixture(); h.add('甲的消息'); h.add('乙的消息', '乙'); const chat = [h.floor()];
    applyMessageMutation(h.source, { kind: 'delete-contact', contactId: '乙', segmentId: 'shared', removeIds: ['乙的消息'], replacements: [], summary: null }); chat[0] = h.floor();
    const once = branchMessages(h.source, chat);
    const twice = branchMessages(once, chat);
    assert.deepEqual(twice.messages.map(message => message.id), ['甲的消息']);
    assert.deepEqual(unsyncedIds(twice), []);
    assert.equal(MESSAGES_PARTITION.parse(twice).ok, true);
});

test('branch copy applies before the first sidecar write on both native and copied-reference routes', async () => {
    for (const copiedReference of [false, true]) {
        const h = fixture(); h.add('过去'); const childChat = [h.floor()]; h.add('未来'); h.floor();
        const ref = { extensions: { LittleWhiteBox: { xiaobaiOsRef: { formatVersion: 1, osId: 'parent-os' } } } };
        const source = { formatVersion: 1, osId: 'parent-os', binding: { kind: 'character', ownerLocator: 'card.png', chatId: 'parent' },
            revision: 2, commitId: 'parent-commit', partitions: { messages: MESSAGES_PARTITION.serialize(h.source), untouched: { sample: true } } };
        const capture = { identityKey: 'child', binding: { ...source.binding, chatId: 'child' },
            metadata: copiedReference ? clone(ref) : {}, mainChatId: 'parent' };
        const writes = []; let serial = 0;
        const manager = createChatBindingManager({ metadata: { capture: () => capture, read: async () => clone(ref) },
            references: { install: async () => ({ status: 'confirmed' }) }, index: { remember: async () => {} },
            storage: { read: async () => clone(source), replace: async input => {writes.push(clone(input.candidate)); return { status: 'confirmed' };} },
            createId: () => `copy-${++serial}`,
            prepareClonedPartitions: createMessagesBranchCopy(() => ({ identityKey: 'child', messages: childChat })),
        });
        const result = await manager.resolveCurrent();
        assert.equal(result.status, 'ready'); assert.equal(writes.length, 1);
        assert.deepEqual(writes[0].partitions.messages.messages.map(message => message.id), ['过去']);
        assert.deepEqual(writes[0].partitions.untouched, source.partitions.untouched);
        assert.equal(source.partitions.messages.messages.length, 2);
    }
});

test('full copy preserves messages, while a chat switch refuses historical copying', () => {
    const h = fixture(); h.add('完整副本'); h.floor();
    const binding = { kind: 'character', ownerLocator: 'card.png', chatId: 'parent' };
    const partitions = { messages: MESSAGES_PARTITION.serialize(h.source) };
    const original = clone(partitions);
    const prepare = createMessagesBranchCopy(() => ({ identityKey: 'child', messages: [h.floor()] }));
    prepare({ identityKey: 'child', binding: { ...binding, chatId: 'child' }, metadata: {} }, binding, partitions);
    assert.deepEqual(partitions, original);
    assert.throws(() => prepare({ identityKey: 'other', binding, metadata: {}, mainChatId: 'parent' }, binding, partitions), /branch_chat_changed/);
    assert.deepEqual(partitions, original);
});
