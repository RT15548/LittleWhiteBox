import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { indexedDB } from 'fake-indexeddb';

import { deriveDrawRunChildJobId, deriveDrawRunItemIds } from '../draw-run-identifiers.js';
import { hashSceneSource, normalizeMessageSceneSourceText } from '../scene-source.js';
import { isSceneSlotAlive, removeSceneSlotPlaceholders, setActiveMessageText } from '../scene-placement.js';

// 测真正的 adoption → IndexedDB → 页面接回 → 结算；仅替换宿主/画廊 IO 和 DOM 投影。
// 不发起付费生成，也不以源码字符串断言代替旧图是否仍在正文中的行为验证。
const host = { ctx: null, previews: new Map(), selections: new Map() };
globalThis.__drawRecoveryTest = host;
globalThis.indexedDB = indexedDB;
globalThis.window = new EventTarget();
globalThis.document = new EventTarget();

const stubs = {
    'extensions.js': 'export const getContext = () => globalThis.__drawRecoveryTest.ctx;',
    'script.js': 'export const getRequestHeaders = () => ({});',
    'event-manager.js': `
        export const event_types = { CHAT_CHANGED: 'chat_changed' };
        export const createModuleEvents = () => ({ on() {}, cleanup() {} });
    `,
    'draw-run-recovery-runtime.js': 'export const runDrawRunRecoveryPass = async () => {};',
    'draw-common.js': `
        export const isMessageBeingEdited = () => false;
        export const isAnyMessageBeingEdited = () => false;
        export const renderPreviewsForMessage = async () => {};
        export const ErrorType = { JOB_EXPIRED: { code: 'expired', label: 'expired', desc: 'expired' } };
        export const classifyError = () => ErrorType.JOB_EXPIRED;
    `,
    'gallery-cache.js': `
        const host = globalThis.__drawRecoveryTest;
        export const getPreview = async id => host.previews.get(id);
        export const storePreview = async value => host.previews.set(value.imgId, value);
        export const storeFailedPlaceholder = storePreview;
        export const deletePreview = async id => host.previews.delete(id);
        export const setSlotSelection = async (slot, id) => host.selections.set(slot, id);
        export const clearSlotSelection = async slot => host.selections.delete(slot);
    `,
};
const bundle = await build({
    stdin: {
        contents: `
            export * from './image-job-recovery-runtime.js';
            export * from './draw-run-adoption.js';
            export * from './pending-image-jobs.js';
        `,
        resolveDir: fileURLToPath(new URL('..', import.meta.url)),
    },
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
    plugins: [{
        name: 'recovery-host-boundaries',
        setup(builder) {
            builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
                const name = path.split('/').at(-1);
                return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
            });
            builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
        },
    }],
});
// 只执行本测试现场构建的本地模块，没有外部输入。
// eslint-disable-next-line no-unsanitized/method
const api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);

for (const mode of ['complete', 'fail', 'discard']) {
    for (const userDeletedSlot of [false, true]) {
        test(`recovered ${mode} keeps three old images${userDeletedSlot ? ' and respects a deleted new slot' : ''}`, async t => {
            const original = 'Alpha.[image:old-1] Beta.[image:old-2][image:old-3]';
            const message = { name: 'Alice', mes: original, swipe_id: 1, swipes: ['other swipe', original] };
            let persistedChat = structuredClone([message]);
            const saves = [];
            host.ctx = {
                chatId: 'chat-1', groupId: 'group-1', chat: [message], getRequestHeaders: () => ({}),
                async saveChat() {
                    persistedChat = structuredClone(this.chat);
                    saves.push(message.mes);
                },
            };
            t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => structuredClone(persistedChat) }));
            host.previews.clear();
            host.selections.clear();
            const oldPreviews = [1, 2, 3].map(n => ({ slotId: `old-${n}`, imgId: `old-img-${n}`, base64: `old-${n}` }));
            for (const image of oldPreviews) {
                host.previews.set(image.imgId, image);
                host.selections.set(image.slotId, image.imgId);
            }

            const runId = `run-test-${mode}-${userDeletedSlot ? 2 : 1}`;
            const sourceText = normalizeMessageSceneSourceText(original);
            const sourceHash = hashSceneSource(sourceText);
            const marker = { version: 1, provider: 'sd-webui', sourceHash, targetHash: hashSceneSource(original), createdAt: 100 };
            const items = [0, 1].map(index => ({
                index, ...deriveDrawRunItemIds(runId, index), insertOffset: sourceText.length,
            }));
            const run = {
                id: runId, provider: marker.provider, state: 'dispatched', sourceHash,
                handoffManifest: {
                    childJobId: deriveDrawRunChildJobId(runId), provider: marker.provider,
                    sourceHash, placementContract: 1, items,
                },
            };
            const adopted = await api.adoptExistingJobFromDrawRun({
                run, marker,
                chatTarget: { kind: 'group', chatId: 'chat-1', endpoint: '/api/chats/group/get', body: { id: 'chat-1' } },
                resolveTarget: () => ({ runId, marker, message, messageId: 0, swipeIndex: 1, chatId: 'chat-1' }),
                confirmSlots: () => host.ctx.saveChat(),
            });
            assert.equal(adopted.status, 'ready');
            const { jobId, leaseId } = adopted.record;
            await api.markPendingImageJobOriginRunAckReady(jobId, leaseId, runId);
            await api.activateAdoptingPendingImageJob(jobId, leaseId);
            await api.markPendingImageJobSettling(jobId, leaseId, { mode });
            await api.renewPendingImageJobLease(jobId, leaseId, { now: 0 });

            // 成功结果已落画廊，另一张可能尚未完成；页面此时退出，下一页面负责结算。
            if (mode !== 'fail') host.previews.set(items[0].imgId, { ...items[0], base64: 'new-1' });
            if (mode === 'complete') host.previews.set(items[1].imgId, { ...items[1], base64: 'new-2' });
            if (userDeletedSlot) {
                setActiveMessageText(message, removeSceneSlotPlaceholders(message.mes, [items[1].slotId]));
                await host.ctx.saveChat();
            }
            const beforeRecovery = message.mes;
            let acknowledged = 0;
            t.after(() => api.stopImageJobRecovery());
            api.startImageJobRecovery({
                client: { listJobs: async () => [] },
                drawRunsClient: { acknowledgeRun: async () => { acknowledged += 1; } },
            });
            await api.reconcilePendingImageJobs();

            const expected = mode === 'discard'
                ? removeSceneSlotPlaceholders(beforeRecovery, [items[1].slotId])
                : beforeRecovery;
            assert.equal(message.mes, expected);
            assert.deepEqual(message.swipes, ['other swipe', expected]);
            assert.equal(persistedChat[0].mes, expected);
            for (const text of saves) {
                for (const old of oldPreviews) assert.equal(isSceneSlotAlive(text, old.slotId), true);
            }
            for (const old of oldPreviews) {
                assert.equal(host.previews.get(old.imgId), old);
                assert.equal(host.selections.get(old.slotId), old.imgId);
            }
            if (mode === 'fail') {
                assert.equal(host.previews.has(`failed-${items[0].imgId}`), true);
                assert.equal(host.previews.has(`failed-${items[1].imgId}`), !userDeletedSlot);
            }
            assert.equal(await api.getPendingImageJob(jobId), null);
            assert.equal(acknowledged, 1);
        });
    }
}
