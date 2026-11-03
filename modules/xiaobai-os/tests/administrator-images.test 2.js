import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { createAdministratorImages } from '../apps/administrator/storage/images.js';
import { createAdministratorData } from '../apps/administrator/domain/data.js';
import { createChatBindingManager } from '../storage/chat-binding.js';
import { createAdministratorConversation } from '../apps/administrator/application/conversation.js';

test('confirmed attachment cleanup retains its original owner even when the selected chat changes during saving', async () => {
    let owner = 'original'; const removed = [];
    const repository = { osId: () => owner, identity: () => owner, async refresh() { return createAdministratorData(); },
        async save(candidate) { owner = 'next-chat'; return { ...candidate, revision: 1 }; } };
    const conversation = createAdministratorConversation(repository, { async clear(osId) { removed.push(osId); } });
    await conversation.refresh(); await conversation.clear(() => true);
    assert.deepEqual(removed, ['original']);
});

function imagesFixture() {
    const files = new Map(); let counter = 0;
    const images = createAdministratorImages({ id: () => `image-${++counter}`, headers: () => ({}),
        async upload(data, folder, name, format) { const path = `/user/images/${folder}/${name}.${format}`; files.set(path, Buffer.from(data, 'base64')); return path; },
        async read(url, init) {
            if (url === '/api/images/list') { const { folder } = JSON.parse(init.body); return Response.json([...files.keys()].filter(p => p.startsWith(`/user/images/${folder}/`)).map(p => p.split('/').at(-1))); }
            if (url === '/api/images/delete') { const { path } = JSON.parse(init.body); return new Response('', { status: files.delete(`/${path}`) ? 200 : 404 }); }
            return new Response(files.get(url) ?? '', { status: files.has(url) ? 200 : 404 });
        },
    });
    return { images, files };
}
test('administrator branch copies have independently owned images; deleting either chat cannot remove the other attachment', async () => {
    const { images, files } = imagesFixture();
    const attachment = await images.save('parent', { name: 'screen.png', dataUrl: 'data:image/png;base64,YWJj' });
    const original = { ...createAdministratorData(), turns: [{ id: 'one', createdAt: 1, user: { text: '', image: attachment }, assistant: null, toolMessages: [], operations: [], status: 'interrupted', error: '' }] };
    const copied = await images.clonePartition('parent', 'child', original);
    assert.notEqual(copied.turns[0].user.image.path, attachment.path);
    assert.equal(await images.load('child', copied.turns[0].user.image), 'data:image/png;base64,YWJj');
    await assert.rejects(images.remove('child', attachment));
    await images.clear('parent'); assert.equal(files.size, 1); assert.ok(files.has(copied.turns[0].user.image.path));
    await images.clear('child'); assert.equal(files.size, 0);
});
test('asynchronous clone preparation finishes before sidecar save; unknown save keeps attachment until confirmed deletion', async () => {
    const order = [], parent = { kind: 'character', ownerLocator: 'test.png', chatId: 'parent' }, child = { ...parent, chatId: 'child' };
    const source = { formatVersion: 1, osId: 'parent-os', binding: parent, revision: 2, commitId: 'parent-commit', partitions: { administrator: createAdministratorData() } };
    let persisted = null, counter = 0;
    const manager = createChatBindingManager({ createId: () => `child-${++counter}`,
        metadata: { capture: () => ({ identityKey: 'child', binding: child, metadata: {}, mainChatId: 'parent' }), read: async () => ({ extensions: { LittleWhiteBox: { xiaobaiOsRef: { formatVersion: 1, osId: 'parent-os' } } } }), save: async () => {} },
        references: { capture: () => null, isCurrent: () => true, install: async () => ({ status: 'confirmed' }) },
        storage: { read: async id => id === 'parent-os' ? source : persisted, replace: async ({ candidate }) => { order.push('save'); persisted = candidate; return { status: 'unconfirmed', observed: null }; }, delete: async () => { order.push('delete'); persisted = null; return 'deleted'; } },
        index: { remember: async () => {}, findByChatId: async () => ['child-1'], forget: async () => {}, updateOwner: async () => {} },
        async prepareClonedPartitions(_, __, partitions, ids) { assert.deepEqual(ids, { source: 'parent-os', target: 'child-1' }); await new Promise(resolve => setTimeout(resolve, 0)); partitions.administrator = createAdministratorData(); order.push('copied'); },
        cleanupAttachments: async () => { order.push('cleanup'); },
    });
    assert.equal((await manager.resolveCurrent()).status, 'unconfirmed'); assert.deepEqual(order, ['copied', 'save']);
    assert.equal((await manager.retryPendingCurrent()).status, 'ready'); assert.deepEqual(order, ['copied', 'save']);
    assert.equal(await manager.handleChatDeleted('child'), 'deleted'); assert.deepEqual(order, ['copied', 'save', 'delete', 'cleanup']);
});
