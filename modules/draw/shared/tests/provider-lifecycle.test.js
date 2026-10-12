import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { parseHTML } from 'linkedom';
import { indexedDB, IDBObjectStore } from 'fake-indexeddb';
import { buildProviderFixture, fixtureProviderSettings, providerFixtures, supplierResponse } from './fixtures/provider-runtime-fixture.mjs';

for (const provider of Object.keys(providerFixtures)) test(`${provider} production native lifecycle and cancellation certainty`, async t => {
    const { document, window } = parseHTML('<html><head></head><body><div id="chat"></div></body></html>');
    Object.assign(globalThis, { document, window, indexedDB, BroadcastChannel: undefined,
        MutationObserver: window.MutationObserver, IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} } });
    globalThis.FileReader = class {
        async readAsDataURL(blob) {
            this.result = 'data:image/png;base64,' + Buffer.from(await blob.arrayBuffer()).toString('base64');
            this.onload();
        }
    };
    const h = globalThis.__review = { events: new Map(), states: [], ctx: { chatId: `provider-${provider}`, chat: [] } };
    globalThis.toastr = { error() {}, info() {} };
    const source = await buildProviderFixture(provider);
    // eslint-disable-next-line no-unsanitized/method -- Fixed local production bundle and host fixture.
    const api = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
    const { title } = providerFixtures[provider];
    api.configureFixtureSettings(fixtureProviderSettings(provider));
    globalThis.fetch = async () => { throw new Error('Unexpected startup network'); };
    assert.equal(await api[`init${title}Draw`](), true);
    t.after(() => { api.cleanupChatMessageImages(); api[`cleanup${title}Draw`](); });
    const beforeSubmit = { mes: '[img: cancelled]', swipe_id: 0, extra: {} };
    h.ctx.chat = [beforeSubmit];
    const cancelled = api.prepareNativeChatImages(provider, { ctx: h.ctx, message: beforeSubmit, messageId: 0,
        sourceText: beforeSubmit.mes, tasks: api.parseChatImageTags(beforeSubmit.mes).map(tag => ({ scene: tag.tags,
            placement: { ...tag, mode: 'replace' } })) });
    const cancelledPrepared = assert.rejects(cancelled.prepared);
    const cancelledComplete = assert.rejects(cancelled.completed);
    await Promise.resolve();
    assert.equal(await api.abortGeneration(0), true);
    await Promise.all([cancelledPrepared, cancelledComplete]);
    assert.equal(beforeSubmit.mes, '[img: cancelled]');
    for (const boundary of ['cancel', 'chat-switch']) await t.test(`manual save wait retains unsubmitted ownership across ${boundary}`, async () => {
        const message = { mes: '[img: manual]', name: 'Fixture', swipe_id: 0, extra: {} };
        const saving = Promise.withResolvers(), releaseSave = Promise.withResolvers();
        let persisted, submissions = 0;
        const ctx = h.ctx = { chatId: `provider-${provider}-manual-${boundary}`, chat: [message],
            characterId: 0, characters: [{ name: 'Fixture', avatar: 'fixture.png' }], getRequestHeaders: () => ({}),
            saveChat: async () => { saving.resolve(); await releaseSave.promise; persisted = structuredClone(ctx.chat); } };
        globalThis.fetch = async url => {
            if (url === '/api/chats/get') return Response.json(persisted);
            submissions++;
            throw new Error('Unexpected supplier request');
        };
        const completed = api.generatePreparedChatImages(provider, { ctx, message, messageId: 0, sourceText: message.mes,
            tasks: api.parseChatImageTags(message.mes).map(tag => ({ scene: tag.tags, placement: { ...tag, mode: 'replace' } }))
        }).then(value => ({ value }), error => ({ error }));
        const other = { mes: 'other chat', extra: {} };
        try {
            await saving.promise;
            assert.equal(submissions, 0);
            if (boundary === 'cancel') assert.equal(await api.abortGeneration(0), true);
            else h.ctx = { ...ctx, chatId: 'other-chat', chat: [other] };
            releaseSave.resolve();
            const outcome = await completed;
            if (boundary === 'cancel') {
                // Novel's adapter rejects an already-aborted batch; the other
                // two adapters return its cancelled outcome. Both are unsubmitted.
                if (provider === 'novelai') assert.equal(outcome.error?.errorType?.code, 'aborted');
                else assert.equal(outcome.value?.aborted, true);
            }
            else assert.equal(outcome.error?.placementsCommitted, true);
            assert.equal(submissions, 0);
            assert.deepEqual(other, { mes: 'other chat', extra: {} });
            const slotId = [...api.extractSlotIds(message.mes)][0];
            assert.ok(slotId);
            assert.equal((await api.getDisplayPreviewForSlot(slotId)).preview.status, 'failed');
            assert.equal(api.isGenerating(), false);
        } finally {
            releaseSave.resolve();
            await completed;
        }
    });
    for (const connectionMode of provider === 'comfyui' ? ['direct', 'proxy'] : ['default']) {
        await t.test(`cancellation during input storage remains unsubmitted (${connectionMode})`, async () => {
            const message = { mes: '[img: starting] [img: queued]', swipe_id: 0, extra: {} };
            h.ctx = { chatId: `provider-${provider}-cancel-storage-${connectionMode}`, chat: [message] };
            const settings = fixtureProviderSettings(provider);
            api.configureFixtureSettings({ ...settings,
                ...(provider === 'comfyui' ? { connectionMode } : {}) });
            let cancelledAtStorage = false, submissions = 0;
            const put = IDBObjectStore.prototype.put;
            // The queue has started, but durable input storage still precedes
            // transport. A cancelled fetch cannot submit a supplier request.
            IDBObjectStore.prototype.put = function(value, ...args) {
                const request = put.call(this, value, ...args);
                if (!cancelledAtStorage && value.status === 'unknown') {
                    cancelledAtStorage = api.abortGeneration(0);
                }
                return request;
            };
            globalThis.fetch = async (url, options = {}) => {
                options.signal?.throwIfAborted();
                submissions++;
                return supplierResponse(provider, String(url), JSON.parse(options.body || '{}'));
            };
            try {
                const operation = api.prepareNativeChatImages(provider, { ctx: h.ctx, message, messageId: 0,
                    sourceText: message.mes, tasks: api.parseChatImageTags(message.mes).map(tag => ({
                        scene: tag.tags, placement: { ...tag, mode: 'replace' } })) });
                await operation.prepared;
                const result = await operation.completed;
                assert.equal(await cancelledAtStorage, true);
                assert.equal(submissions, 0);
                assert.equal(result.unknown, 0);
                assert.equal(result.aborted, true);
                assert.equal(result.total, 2);
                const previews = await Promise.all(result.results.map(item => api.getPreview(item.imgId)));
                assert.deepEqual(previews.map(preview => preview.status), ['failed', 'failed']);
                assert.equal(api.isGenerating(), false);
            } finally {
                IDBObjectStore.prototype.put = put;
                api.configureFixtureSettings(settings);
            }
        });
    }
    for (const kind of ['success', 'rejected', 'unknown', 'cancel-after-submit', 'cancel-after-decode', 'other-chat-stop']) {
        const message = { mes: '[img: same] [img: same]', name: 'Fixture', swipe_id: 0, swipes: [], extra: {} };
        h.ctx.chat = [message]; h.ctx.chatId = `provider-${provider}-${kind}`;
        let submissions = 0;
        const put = IDBObjectStore.prototype.put;
        // Cancel at the storage boundary, after the real adapter has decoded a
        // successful response. An unread response body is not known success.
        IDBObjectStore.prototype.put = function(value, ...args) {
            const request = put.call(this, value, ...args);
            if (kind === 'cancel-after-decode' && value.status === 'success' && value.base64) api.abortGeneration(0);
            return request;
        };
        globalThis.fetch = async (url, options = {}) => {
            const body = JSON.parse(options.body || '{}');
            if (provider === 'sdwebui') {
                assert.equal(String(url), '/api/sd/generate');
                assert.equal(body.url, 'https://supplier.invalid');
            } else assert.ok(String(url).startsWith('https://supplier.invalid'));
            if (options.method === 'POST') {
                submissions++;
                if (kind === 'cancel-after-submit') api.abortGeneration(0);
                if (kind === 'rejected') return Response.json({ error: 'rejected' }, { status: 400 });
                if (kind === 'other-chat-stop') {
                    h.ctx = { ...h.ctx, chatId: 'other', chat: [{ mes: 'other' }] };
                    for (const listener of h.events.get('GENERATION_STOPPED') || []) await listener();
                    assert.equal(options.signal.aborted, false);
                }
                if (kind === 'unknown' || kind === 'cancel-after-submit') throw new TypeError('Failed to fetch');
            }
            return supplierResponse(provider, String(url), body);
        };
        const operation = api.prepareNativeChatImages(provider, { ctx: h.ctx, message, messageId: 0, sourceText: message.mes,
            tasks: api.parseChatImageTags(message.mes).map(tag => ({ scene: tag.tags, placement: { ...tag, mode: 'replace' } })) });
        await operation.prepared;
        const result = await operation.completed.finally(() => { IDBObjectStore.prototype.put = put; });
        assert.equal(submissions, kind.startsWith('cancel-') ? 1 : 2,
            JSON.stringify(await Promise.all(result.results.map(item => api.getPreview(item.imgId)))));
        assert.equal(result.total, 2);
        assert.equal(result.success, ['success', 'other-chat-stop'].includes(kind) ? 2 : kind === 'cancel-after-decode' ? 1 : 0,
            JSON.stringify(await Promise.all(result.results.map(item => api.getPreview(item.imgId)))));
        const preview = await api.getPreview(result.results[0].imgId);
        assert.equal(preview.status, ['unknown', 'cancel-after-submit'].includes(kind) ? 'unknown' : kind === 'rejected' ? 'failed' : 'success');
        assert.equal(api.isGenerating(), false);
    }
    for (const swipeId of [0, 1]) await t.test(`deleting swipe ${swipeId} keeps cancellation on the visible branch`, async () => {
        const swipes = ['original', '[img: branch A]', '[img: branch B first] [img: branch B second]'];
        const message = { mes: swipes[1], swipes, swipe_id: 1, extra: {} };
        h.ctx = { chatId: `provider-${provider}-delete-${swipeId}`, chat: [message] };
        const started = Promise.withResolvers(), response = Promise.withResolvers();
        let requestSignal, submissions = 0;
        globalThis.fetch = async (url, options = {}) => {
            if (options.method === 'POST') {
                submissions++;
                requestSignal = options.signal;
                started.resolve();
                await response.promise;
                options.signal.throwIfAborted();
            }
            return supplierResponse(provider, String(url), JSON.parse(options.body || '{}'));
        };
        const prepare = () => api.prepareNativeChatImages(provider, { ctx: h.ctx, message, messageId: 0,
            sourceText: message.mes, tasks: api.parseChatImageTags(message.mes).map(tag => ({ scene: tag.tags,
                placement: { ...tag, mode: 'replace' } })) });
        const first = prepare();
        let second;
        try {
            await first.prepared; await started.promise;
            message.swipe_id = 2; message.mes = swipes[2];
            second = prepare(); await second.prepared;
            swipes.splice(swipeId, 1); message.swipe_id = 1;
            for (const listener of h.events.get('MESSAGE_SWIPE_DELETED') || []) {
                await listener({ messageId: 0, swipeId, newSwipeId: 1 });
            }
            assert.equal(api.getGenerationState(0).data.total, 2);
            assert.equal(await api.abortGeneration(0), true);
            assert.equal(requestSignal.aborted, false);
            response.resolve();
            const [a, b] = await Promise.all([first.completed, second.completed]);
            assert.equal(a.success, 1);
            assert.equal(await api.getSlotSelection(a.results[0].slotId), swipeId === 0 ? a.results[0].imgId : null);
            assert.equal(b.success, 0);
            assert.equal(b.aborted, true);
            assert.equal(submissions, 1);
            assert.equal(api.isGenerating(), false);
        } finally {
            api.abortGeneration(); response.resolve();
            await Promise.allSettled([first.completed, second?.completed]);
        }
    });
    if (provider === 'novelai') for (const source of ['ebook', 'tavern', 'plain']) {
        globalThis.fetch = async url => supplierResponse(provider, String(url));
        const result = await api.generateImagesFromText({ text: 'A traveler walks through a forest.', source,
            characterName: 'Fixture', bookId: 'book', chapterPath: 'chapter', sessionId: 'session', messageOrder: 1 });
        assert.equal(result.images.length, 1);
    }
});
