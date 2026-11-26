import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from '../../shared/tests/helpers/draw-journey.js';
import { decodeFixtureImage } from '../../shared/tests/helpers/image-decoder.js';

const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const webp = 'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
const finalPrompt = raw => `An adapted illustration of ${raw}.`;
const registration = {
    'script.js': 'export const getRequestHeaders=()=>({});export const syncMesToSwipe=()=>true;export const messageFormatting=text=>text;export const saveChatDebounced=()=>globalThis.__drawJourneyReview.ctx.saveChat();',
    'server-storage.js': 'export const NovelDrawStorage={getStrict:async()=>null};',
    'draw-agent.js': 'export const resolveDrawAgentProviderConfig=async()=>{throw new Error("unexpected live planner resolution")};',
    'image-autosave.js': 'export const autoSaveDeliveredImage=async()=>false;export const imageFilePrefix=provider=>provider;',
    'planning.js': `export async function planDirectInput(provider,input,settings,{signal,sceneConfig}) {
        const host = globalThis.__drawJourneyReview;
        host.plannerInputs.push({provider,input,key:settings.apiKey});
        await host.beforePlan?.(input);
        signal?.throwIfAborted();
        return {...input,prompt:(${finalPrompt.toString()})(input.prompt) + (sceneConfig ? ' ' + sceneConfig.model : ''),positivePrefix:'',negativePrompt:'',characterPrompts:[]};
    }
    export const buildPlannerOptions=async()=>({plannerOptions:{}});
    export const runMultimodalScenePlan=async()=>globalThis.__drawJourneyReview.floorTasks;`,
    'scene-planner.js': 'export const generateAndParseScenePlan=async()=>globalThis.__drawJourneyReview.floorTasks;export const prepareScenePlannerInput=async()=>({});',
    'draw-run-browser.js': 'export const submitProviderDrawRun=async()=>({status:"accepted"});',
    'draw-run-controls.js': 'export const cancelFloorDrawWork=async(_id,{jobs})=>{ for(const job of jobs) job.controller.abort();return true; };export const captureDrawCancellationTarget=()=>({});',
    'backend-image-jobs.js': `export const createImageBackendJobsClient=()=>({
        async runJob(request,handlers) {
            const host = globalThis.__drawJourneyReview;
            host.imageRequests.push(request);
            await host.onSubmit?.(request);
            for (const index of request.items.keys()) {
                const {payload} = request.items[index].request;
                await handlers.onItemReady({index,response:new Response(Uint8Array.from(atob('${png}'),v=>v.charCodeAt(0)),{headers:{
                    'content-type':'image/png', 'x-test-image':host.imageFor?.(payload) ?? '${png}',
                }})});
            }
        },
    });
    export class ImageBackendJobsError extends Error {}
    export const createBackendItemError=item=>new Error(item.error?.message);
    export const fetchImageBackendJobsStatus=async()=>{await globalThis.__drawJourneyReview.beforeStatus?.();return {ready:true}};
    export const hasImageBackendJobsCapability=status=>status.ready;
    export const IMAGE_JOBS_UNAVAILABLE_MESSAGE='test unavailable';
    export const readImageBackendResultBase64=async response=>response.headers.get('x-test-image');
    export const readImageBlobBase64=async()=> '${png}';
    export const reportImageBackendJobState=()=>{};
    export const createImageBackendJobMonitorRegistry=()=>({activate(){},deactivate(){},captureGeneration:()=>0,
        createScope:()=>({signal:new AbortController().signal,dispose(){}})});`,
    'recoverable-image-jobs.js': `export const isPendingJobLeaseLost=()=>false;
    export async function submitRecoverableImageJob({client,request,plan,commitPlacements,onItemReady,cancelSignal,isCreateCurrent}) {
        globalThis.__drawJourneyReview.lastPlan = plan;
        await commitPlacements();
        await globalThis.__drawJourneyReview.beforeDelivery?.(cancelSignal);
        cancelSignal?.throwIfAborted();
        if (isCreateCurrent && !isCreateCurrent(plan)) return {notSubmitted:true};
        await client.runJob(request,{onItemReady:details=>onItemReady({...details,guard:async()=>{},commitDelivery:async()=>{}})});
    }`,
    'provider-floating-panel.js': `export const createProviderFloatingPanel=()=>({ensureDrawPanel(){},releaseDrawPanel(){},initFloatingPanel(){},
        destroyDrawPanels(){},setStateForMessage(){},refreshDrawRunUiState(){}});`,
    'settings-ui.js': 'export const openSettings=async()=>{};export const closeSettings=()=>{};',
};

const settingsStub = `const settings=provider=>({ ...globalThis.__drawJourneyReview.defaultSettings(provider),apiKey:'offline-key',sendMode:globalThis.__drawJourneyReview.sendMode ?? 'backend' });
    export const getSettings=settings, loadSettings=async provider=>settings(provider), subscribeSettings=()=>()=>{},updateSettingsPersistent=async()=>{};`;

async function setup(lines, stubs = {}, sources = []) {
    const h = await fixture(lines, { sources: ['../providers/multimodal/runtime.js', '../providers/multimodal/settings-model.js', ...sources],
        stubs: { ...registration, 'settings.js': settingsStub, ...stubs } });
    const host = globalThis.__drawJourneyReview;
    host.plannerInputs = [];
    host.imageRequests = [];
    host.defaultSettings = h.api.createDefaultSettings;
    const previousBitmap = globalThis.createImageBitmap;
    globalThis.createImageBitmap = async blob => {
        await decodeFixtureImage(blob);
        return { width: 1, height: 1, close() {} };
    };
    return { ...h, host, stop() { globalThis.createImageBitmap = previousBitmap; h.stop(); } };
}

// A paid result keeps its bytes and actual extension, even when the service ignores the requested format.
for (const sendMode of ['frontend', 'backend']) {
    test(`GPT Image ${sendMode}: save the returned format and warn once without repurchasing a mismatched image`, async () => {
        const h = await setup(['A traveler walks through a quiet doorway.'],
            { 'image-save.js': 'export const getImageFolderName=()=>"fixture";export const saveImageToServer=async image=>{globalThis.__drawJourneyReview.saved.push(image);return "/fixture/"+image.fileName+"."+image.format};' });
        const { api, host } = h;
        const runtime = api.multimodalProviders.openai;
        const sent = [];
        let result = webp;
        host.saved = [];
        host.sendMode = sendMode;
        globalThis.fetch = async (_url, options) => {
            sent.push(JSON.parse(options.body).output_format);
            return Response.json({ data: [{ b64_json: result }] });
        };
        host.imageFor = payload => {
            sent.push(payload.output_format);
            return result;
        };
        try {
            await runtime.init();
            for (const [image, extension, warnings] of [[webp, 'webp', 0], [png, 'png', 1]]) {
                result = image;
                const drawn = await runtime.facade.generateImagesFromText({
                    source: 'ebook', text: 'A boat floats on a lake.', promptOverride: 'A boat on a lake',
                    params: { outputFormat: 'webp' },
                });
                assert.equal(drawn.success, 1);
                const [{ imgId }] = drawn.images;
                await api.savePreviewImage(imgId);
                assert.deepEqual([host.saved.at(-1).base64, host.saved.at(-1).format], [image, extension]);
                assert.equal(h.counters.warnings.length, warnings);
            }
            assert.deepEqual(sent, ['webp', 'webp']);
        } finally { runtime.cleanup(); h.stop(); }
    });
}

for (const provider of ['gemini', 'openai']) {
    test(`${provider}: browser text drawing saves both delivered pictures and real HTTP failures`, async () => {
        const { host, api, stop } = await setup(['text']);
        const runtime = api.multimodalProviders[provider];
        host.sendMode = 'frontend';
        host.floorTasks = [{ scene: 'A doorway', placement: { mode: 'tail' } }];
        host.beforeStatus = () => assert.fail('frontend must not check the plugin');
        const body = provider === 'gemini'
            ? { candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/png', data: png } }] } }] }
            : { data: [{ b64_json: png }] };
        let requests = 0;
        globalThis.fetch = async () => ++requests === 1 ? Response.json(body) : new Response(null, { status: 400 });
        try {
            await runtime.init();
            const drawn = await runtime.facade.generateImagesFromText({ source: 'ebook', text: 'She opens the door.' });
            assert.equal(drawn.success, 1);
            assert.equal((await api.getDisplayPreviewForSlot(drawn.images[0].slotId)).preview.base64, png);
            const failed = await runtime.facade.generateImagesFromText({ source: 'tavern', text: 'She enters the hall.' });
            assert.equal(failed.success, 0);
            const [entry] = await api.getPreviewsBySlot(failed.images[0].slotId);
            assert.equal(entry.status, 'failed');
            assert.match(entry.errorMessage, /400/);
            assert.equal(requests, 2);
        } finally { runtime.cleanup(); stop(); }
    });

    test(`${provider}: browser floor and redraw deliver to the same chat without the plugin`, async () => {
        const source = 'Two friends wait outside. The door opens. Lamps light the hall.';
        const h = await setup([source]);
        const { host, api } = h;
        const runtime = api.multimodalProviders[provider];
        const entered = Promise.withResolvers();
        const sent = [];
        host.sendMode = 'frontend';
        host.floorTasks = ['A doorway', 'A lamp', 'A hallway'].map(scene => ({ scene, placement: { mode: 'tail' } }));
        host.beforeStatus = () => { throw new Error('frontend must not check the plugin'); };
        globalThis.fetch = async (url, options) => {
            assert.equal(new URL(url).hostname, new URL(api.createDefaultSettings(provider).apiBaseUrl).hostname);
            sent.push(JSON.parse(options.body));
            if (sent.length === 2) {
                entered.resolve();
                await new Promise((_, reject) => options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true }));
            }
            const body = provider === 'gemini'
                ? { candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/png', data: png } }] } }] }
                : { data: [{ b64_json: png }] };
            return Response.json(body);
        };
        try {
            await runtime.init();
            const draw = runtime.facade.generateAndInsertImages({ messageId: 0 });
            await Promise.race([entered.promise, draw.then(() => assert.fail('second image never started'))]);
            await runtime.facade.abortGeneration(0);
            const result = await draw;
            assert.equal(result.success, 1);
            assert.equal(result.aborted, true);
            assert.equal(sent.length, 2);
            assert.equal(host.imageRequests.length, 0);
            const first = result.results.find(item => item.success);
            assert.ok(h.persisted()[0].mes.includes(`[image:${first.slotId}]`));
            assert.equal((await api.getDisplayPreviewForSlot(first.slotId)).preview.base64, png);
            const retry = await api.generatePreparedChatImages(provider, { ctx: h.ctx, message: h.messages[0],
                messageId: 0, sourceText: h.messages[0].mes, tasks: [{ scene: 'A new lamp', placement: { mode: 'existing', slotId: first.slotId } }] });
            assert.equal(retry.results[0].slotId, first.slotId);
            assert.equal(retry.success, 1);
            assert.equal((await api.getPreviewsBySlot(first.slotId)).length, 2);
        } finally { runtime.cleanup(); h.stop(); }
    });
}

// Actual browser runtime/registered chat or API entry, with no responses or
// requests from a provider or planner service (only fixed fixtures).
test('multimodal browser test edit, native tag and existing-card reroll share the adaptation boundary', async () => {
    const before = 'First paragraph. [img:native scene] Last paragraph.';
    const h = await setup([before]);
    const { host } = h;
    const previousFileReader = globalThis.FileReader;
    globalThis.FileReader = class {
        readAsDataURL(blob) {
            void blob.arrayBuffer().then(bytes => {
                this.result = `data:${blob.type};base64,${btoa(String.fromCharCode(...new Uint8Array(bytes)))}`;
                this.onload?.();
            }, error => { this.error = error; this.onerror?.(); });
        }
    };
    const gemini = h.api.multimodalProviders.gemini;
    try {
        assert.equal(await gemini.init(), true);
        const { images } = await h.api.generateTestImage('gemini', { prompt: 'edit uploaded landscape',
            referenceImages: [{ mimeType: 'image/png', data: png }] });
        assert.equal(images.length, 1);
        const [firstRequest] = host.imageRequests;
        assert.equal(firstRequest.items[0].request.payload.contents[0].parts[0].text, finalPrompt('edit uploaded landscape'));
        assert.deepEqual(firstRequest.items[0].request.referenceImages, [{ mimeType: 'image/png', data: png }]);
        const records = (await h.api.getGalleryMetadata({ charName: 'review' })).filter(record => record.displayable);
        assert.equal(records.length, 1);
        assert.equal((await h.api.getPreview(records[0].imgId)).tags, 'edit uploaded landscape');

        const marker = '[img:native scene]';
        const start = before.indexOf(marker);
        const common = { ctx: h.ctx, message: h.messages[0], messageId: 0, swipeIndex: 0 };
        const native = h.api.prepareNativeChatImages('gemini', { ...common, sourceText: before,
            tasks: [{ scene: 'native scene', placement: { mode: 'replace', start, end: start + marker.length, marker } }],
        });
        await native.prepared;
        assert.match(h.messages[0].mes, /^First paragraph\. \[image:slot-.+?\] Last paragraph\.$/);
        const nativeResult = await native.completed;
        assert.equal(nativeResult.success, 1);
        const slotId = nativeResult.results[0].slotId;
        const reroll = await h.api.generatePreparedChatImages('gemini', { ...common, sourceText: h.messages[0].mes,
            tasks: [{ scene: 'edited card text', placement: { mode: 'existing', slotId },
                characterPrompts: [{ prompt: 'saved portrait', uc: 'wrong uniform' }] }],
        });
        assert.equal(reroll.results[0].slotId, slotId);
        assert.equal(reroll.success, 1);
        assert.deepEqual(host.plannerInputs.map(({ input }) => input.prompt), ['edit uploaded landscape', 'native scene', 'edited card text']);
        assert.deepEqual(host.plannerInputs[2].input.characterPrompts.map(({ prompt, uc }) => ({ prompt, uc })), [{ prompt: 'saved portrait', uc: 'wrong uniform' }]);
        assert.deepEqual(host.imageRequests.slice(1).map(job => job.items[0].request.payload.contents[0].parts[0].text),
            [finalPrompt('native scene'), finalPrompt('edited card text')]);
    } finally {
        gemini.cleanup();
        h.stop();
        globalThis.FileReader = previousFileReader;
    }
});

test('a native reply shows all slots while planning waits; removed and failed slots do not enter the paid request', async () => {
    const h = await setup(['First paragraph.']);
    const gemini = h.api.multimodalProviders.gemini;
    const planGate = Promise.withResolvers();
    try {
        await gemini.init();
        window.xiaobaixDraw.getProvider = () => 'gemini';
        h.start();
        h.host.beforePlan = async ({ prompt }) => {
            if (prompt === 'first') await planGate.promise;
            if (prompt === 'last') throw new Error('planner unavailable');
        };
        await h.emit('GENERATION_AFTER_COMMANDS', 'continue');
        await h.emit('GENERATE_AFTER_DATA', {}, false);
        h.messages[0].mes += ' [img:first] Between [img:remove] and [img:last] end.';
        let displayed = false;
        const received = h.emit('MESSAGE_RECEIVED', 0, 'continue').then(() => { displayed = true; });
        await h.settle();
        assert.equal(displayed, true);
        await received;
        await h.pump(6);
        const slots = [...h.messages[0].mes.matchAll(/\[image:(slot-[^\]]+)\]/g)].map(match => match[1]);
        assert.equal(slots.length, 3);
        assert.equal(h.body(0).querySelectorAll('.xb-nd-img').length, 3);
        assert.equal(h.host.imageRequests.length, 0);
        await h.api.removeChatImageSlot(h.body(0).querySelector(`[data-slot-id="${slots[1]}"]`));
        await h.emit('MESSAGE_RECEIVED', 0, 'continue');
        await h.ctx.saveChat();
        // The host may reload the same conversation and replace its message objects.
        h.host.ctx = { ...h.ctx, chat: structuredClone(h.persisted()) };
        await h.emit('CHAT_CHANGED');
        planGate.resolve();
        await h.settle(50);
        assert.deepEqual(h.host.plannerInputs.map(({ input }) => input.prompt), ['first', 'last']);
        assert.equal(h.host.imageRequests.length, 1);
        assert.equal(h.host.imageRequests[0].items.length, 1);
        assert.deepEqual(h.host.lastPlan.items.map(item => item.slotId), [slots[0]]);
        assert.equal(h.host.lastPlan.gallery.chatId, h.ctx.chatId);
        assert.equal((await h.api.getDisplayPreviewForSlot(slots[0])).preview.tags, 'first');
        assert.equal((await h.api.getPreviewsBySlot(slots[1])).length, 0);
        const failed = await h.api.getDisplayPreviewForSlot(slots[2]);
        assert.equal(failed.isFailed, true);
        assert.equal(failed.preview.tags, 'last');
        const reopened = structuredClone(h.persisted());
        assert.equal(reopened[0].mes.includes(slots[1]), false);
        assert.ok(reopened[0].mes.includes(slots[0]) && reopened[0].mes.includes(slots[2]));
        h.host.ctx = { ...h.ctx, chat: reopened };
        await h.emit('CHAT_CHANGED');
        await h.pump(4);
        assert.equal(h.host.imageRequests.length, 1);
    } finally { planGate.resolve(); gemini.cleanup(); h.stop(); }
});

// Cost: a cancelled reply must not buy another image, or cancel work just
// because the user inspected settings in the same conversation.
test('native tags stop on leaving their chat, including queued and submitted work; returning never resubmits', async () => {
    for (const [provider, stage] of [['gemini', 'plan'], ['openai', 'status'], ['gemini', 'submitted']]) {
        const h = await setup(['Starting message.']);
        const runtime = h.api.multimodalProviders[provider];
        const entered = Promise.withResolvers(), release = Promise.withResolvers();
        const hold = () => { entered.resolve(); return release.promise; };
        let submittedSignal;
        try {
            await runtime.init();
            window.xiaobaixDraw.getProvider = () => provider;
            h.start();
            if (stage === 'plan') h.host.beforePlan = hold;
            if (stage === 'status') h.host.beforeStatus = hold;
            if (stage === 'submitted') h.host.beforeDelivery = signal => { submittedSignal = signal; return hold(); };
            await h.emit('GENERATION_AFTER_COMMANDS', 'continue');
            await h.emit('GENERATE_AFTER_DATA', {}, false);
            h.messages[0].mes += ' [img:waterfall]';
            await h.emit('MESSAGE_RECEIVED', 0, 'continue');
            await entered.promise;
            const destination = stage === 'plan' ? { chatId: 'other-file' }
                : stage === 'status' ? { groupId: 'another-group' } : { groupId: null, chatId: undefined };
            h.host.ctx = { ...h.ctx, ...destination, chat: [] };
            await h.emit('CHAT_CHANGED');
            h.host.ctx = h.ctx;
            await h.emit('CHAT_CHANGED');
            release.resolve();
            await h.settle(70);
            if (submittedSignal) assert.equal(submittedSignal.aborted, true);
            assert.equal(h.host.imageRequests.length, 0, stage);
            assert.equal(h.host.plannerInputs.length, 1, stage);
            assert.deepEqual(h.counters.errors, [], stage);
            assert.equal((await h.api.getPreviewsForMessage(h.ctx.chatId, 0))[0].status, 'failed', stage);
        } finally { release.resolve(); await h.settle(); runtime.cleanup(); h.stop(); }
    }
});

// Cost: charging for a withdrawn slot, rejecting the whole reply, or delivering
// the second batch's first image to the first batch's first slot.
for (const [provider, count, removed, boundary] of [
    ['gemini', 1, [0], 'beforeStatus'], ['openai', 22, [1], 'beforeStatus'],
    ['gemini', 21, [], 'beforeDelivery'], ['openai', 3, [1], 'beforeDelivery'],
    ['gemini', 22, [20], 'onSubmit'],
]) test(`native ${provider}: ${count} slots, withdraw ${removed.length} at ${boundary}, submit only surviving slots`, async () => {
    const prompts = Array.from({ length: count }, (_, i) => 'scene-' + i);
    const text = prompts.map(scene => '[img:' + scene + ']').join(' ');
    const h = await setup([text]);
    const runtime = h.api.multimodalProviders[provider];
    const entered = Promise.withResolvers(), release = Promise.withResolvers();
    try {
        await runtime.init();
        h.host[boundary] = () => { entered.resolve(); return release.promise; };
        h.host.imageFor = payload => btoa(payload.prompt ?? payload.contents[0].parts[0].text);
        const operation = h.api.prepareNativeChatImages(provider, { ctx: h.ctx, message: h.messages[0],
            messageId: 0, sourceText: text, tasks: h.api.parseChatImageTags(text).map(tag => ({
                scene: tag.tags, placement: { ...tag, mode: 'replace' },
            })) });
        await operation.prepared;
        await entered.promise;
        const slots = [...h.messages[0].mes.matchAll(/\[image:(slot-[^\]]+)\]/g)].map(match => match[1]);
        assert.equal(slots.length, count);
        for (const index of removed) {
            await h.api.removeChatImageSlot({ dataset: { mesid: '0', slotId: slots[index] }, remove() {} });
        }
        release.resolve();
        const result = await operation.completed;
        const expected = prompts.filter((_, index) => !removed.includes(index));
        const batches = h.host.imageRequests.map(job => job.items.map(({ request: { payload } }) =>
            payload.prompt ?? payload.contents[0].parts[0].text));
        assert.deepEqual(batches, expected.length > 20
            ? [expected.slice(0, 20).map(finalPrompt), expected.slice(20).map(finalPrompt)]
            : expected.length ? [expected.map(finalPrompt)] : []);
        assert.equal(result.success, expected.length);
        assert.deepEqual(h.host.plannerInputs.map(({ input }) => input.prompt), prompts);
        for (const [index, slot] of slots.entries()) {
            const records = await h.api.getPreviewsBySlot(slot);
            assert.deepEqual(records.map(r => [r.tags, r.status, r.base64]), removed.includes(index)
                ? [] : [[prompts[index], 'success', btoa(finalPrompt(prompts[index]))]]);
        }
    } finally { release.resolve(); runtime.cleanup(); h.stop(); }
});

test('a rejected second batch leaves the first twenty delivered images intact', async () => {
    const text = Array.from({ length: 21 }, (_, index) => '[img:scene ' + index + ']').join(' ');
    const h = await setup([text]);
    const runtime = h.api.multimodalProviders.openai;
    try {
        await runtime.init();
        h.host.onSubmit = () => { if (h.host.imageRequests.length === 2) throw new Error('second batch rejected'); };
        const operation = h.api.prepareNativeChatImages('openai', { ctx: h.ctx, message: h.messages[0], messageId: 0,
            sourceText: text, tasks: h.api.parseChatImageTags(text).map(tag => ({ scene: tag.tags, placement: { ...tag, mode: 'replace' } })) });
        await operation.prepared;
        await assert.rejects(operation.completed);
        assert.deepEqual(h.host.imageRequests.map(job => job.items.length), [20, 1]);
        const slots = [...h.messages[0].mes.matchAll(/\[image:(slot-[^\]]+)\]/g)].map(match => match[1]);
        for (const [index, slot] of slots.entries()) {
            const [stored] = await h.api.getPreviewsBySlot(slot);
            assert.equal(stored.status, index < 20 ? 'success' : 'failed');
            if (index < 20) assert.equal(stored.base64, png);
        }
    } finally { runtime.cleanup(); h.stop(); }
});

test('shared cache and active requests are separated by the scene snapshot; fingerprints contain no credentials', async () => {
    const h = await setup(['text']);
    const provider = 'gemini', { facade } = h.api.multimodalProviders[provider];
    const imageSettings = { ...h.api.createDefaultSettings(provider), apiKey: 'image-private', sendMode: 'backend' };
    const planGate = Promise.withResolvers();
    let model = 'model-A';
    const snapshot = execution => h.api.captureMultimodalGeneration(execution,
        async () => ({ providerConfig: { provider: 'google', model, apiKey: 'scene-private' } }));
    window.xiaobaixDraw.prepareGeneration = async ({ prompt }) => {
        const { execution, sceneConfig, fingerprint } = await snapshot(imageSettings);
        return { fingerprint: { provider, prompt, fingerprint },
            execute: options => facade.generateImage({ prompt, generationConfig: execution, sceneConfig, ...options }) };
    };
    try {
        const fp = (await snapshot(imageSettings)).fingerprint;
        assert.equal(JSON.stringify(fp).includes('image-private'), false);
        assert.equal(JSON.stringify(fp).includes('scene-private'), false);
        assert.notEqual((await snapshot({ ...imageSettings, apiKey: 'rotated' })).fingerprint.imageConnection, fp.imageConnection);
        h.host.beforePlan = () => planGate.promise;
        const request = { prompt: 'stone bridge' };
        const first = h.api.generateSharedImage(request);
        await h.settle();
        assert.equal(h.host.plannerInputs.length, 1);
        model = 'model-B';
        const next = h.api.generateSharedImage(request);
        await h.settle();
        assert.equal(h.host.plannerInputs.length, 2);
        planGate.resolve();
        await Promise.all([first, next]);
        await h.api.generateSharedImage(request);
        model = 'model-A';
        await h.api.generateSharedImage(request);
        assert.deepEqual(h.host.imageRequests.map(job => job.items[0].request.payload.contents[0].parts[0].text),
            ['An adapted illustration of stone bridge. model-A', 'An adapted illustration of stone bridge. model-B']);
        assert.ok(h.host.imageRequests.every(job => job.context.key === imageSettings.apiKey));
    } finally { planGate.resolve(); h.stop(); }
});

test('try and redraw use the stored scene retry limit; retrying or cancelling never repeats an image submission', async t => {
    t.mock.method(console, 'log', () => {});
    const provider = 'openai';
    for (const retries of [0, 2]) {
        const h = await setup(['text'], {
            'planning.js': null, 'scene-planner.js': null,
            'world-info.js': 'export const getWorldInfoPrompt=async()=>({});',
            'var-commands.js': 'export const replaceXbGetVarInString=text=>text;export const replaceXbGetVarYamlInString=text=>text;',
            'server-storage.js': `export const NovelDrawStorage={getStrict:async()=>({plannerMaxRetries:${retries}})};`,
            'draw-agent.js': 'export const resolveDrawAgentProviderConfig=()=>{throw new Error("unexpected live planner resolution")};export const beginDrawScenePlannerDiagnostic=()=>{};export const callDrawScenePlannerAgent=()=>{};',
            'custom-tool-sandbox.js': `export function createSandboxToolHost() {
                const host = globalThis.__drawJourneyReview;
                return { define() { ++host.toolDefinitions; return { name: 'note', parameters: { type: 'object', properties: {} } }; },
                    invoke() {}, dispose() { ++host.toolDisposals; } };
            }`,
        }, ['../providers/multimodal/planning.js', '../providers/multimodal/direct-generation.js', 'scene-planner.js', 'scene-planner-layout.js']);
        const { api, host } = h;
        const settings = { ...api.createDefaultSettings(provider), apiKey: 'offline-key', sendMode: 'backend' };
        settings.paramsPresets[0].positivePrefix = 'ink wash';
        settings.promptPresets[0].layout = api.addBlock(api.createDefaultLayout(), api.createCustomBlock({ tool: { code: 'return {};' } }));
        const request = { prompt: 'a bridge over a river {{fixture_macro}}', negativePrompt: 'no vehicles',
            characterPrompts: [{ name: 'Dawn', prompt: 'silver coat' }] };
        const scene = 'A stone bridge over a quiet river.';
        let attempts = 0, expanded = 0, onRetry;
        host.toolDefinitions = host.toolDisposals = 0;
        const expansionOptions = { runtime: { substituteParams: text => text.replace('{{fixture_macro}}', () => `macro-${++expanded}`) } };
        const preview = await api.previewDirectInput(provider, request, settings, { expansionOptions });
        assert.equal(expanded, 0);
        assert.equal(host.toolDefinitions, 0);
        assert.match(JSON.stringify(preview), /\{\{fixture_macro\}\}/);
        let received, published;
        const plan = (id, input, config, options) => api.planDirectInput(id, input, config, { ...options,
            async plan(planner) {
                const { customToolHost } = planner;
                const prepared = await api.prepareScenePlannerInput({ ...planner, agentCaller: true, expansionOptions, keepCustomToolHost: true });
                try {
                    return await api.executePreparedScenePlanner(prepared, { signal: planner.signal, customToolHost, onAgentRequest: planner.onAgentRequest,
                        async sleep(_delay, signal) { onRetry?.(); signal?.throwIfAborted(); },
                        async agentCaller({ task, validateResult }) {
                            received ??= structuredClone(task);
                            if (++attempts <= 2) throw new Error('temporary planner failure');
                            const result = { toolCalls: [{ name: 'submit_scene_plan', arguments: JSON.stringify({
                                images: [{ index: 1, insert_after: 1, scene, characters: [] }],
                            }) }] };
                            return { result, parsed: validateResult(result) };
                        },
                    });
                } finally { customToolHost?.dispose(); }
            },
        });
        const adapter = api.createMultimodalPublicGeneration(provider, { async runJob(job, handlers) {
            host.imageRequests.push(job);
            await handlers.onItemReady({ response: new Response(Uint8Array.from(atob(png), v => v.charCodeAt(0)),
                { headers: { 'content-type': 'image/png' } }) });
        } }, plan);
        try {
            const capture = task => { assert.equal(published, undefined); published = task; };
            const testImage = adapter.generate(request, settings, { onAgentRequest: capture });
            if (retries === 0) {
                await assert.rejects(testImage, { code: 'PROVIDER_REQUEST_FAILED' });
                assert.deepEqual(published, received);
                assert.equal(attempts, 1);
                assert.equal(host.imageRequests.length, 0);
                continue;
            }
            assert.equal((await testImage).length, 1);
            assert.deepEqual(published, received);
            assert.match(JSON.stringify(published), /macro-1/);
            assert.ok(published.tools.some(tool => tool.function.name === 'note'));
            assert.equal(expanded, 1);
            assert.equal(host.toolDefinitions, 1);
            assert.equal(host.toolDisposals, 1);
            assert.equal(attempts, 3);
            assert.equal(host.imageRequests.length, 1);
            attempts = 0;
            const placement = { mode: 'existing', slotId: 'original-slot' };
            const redraw = options => api.adaptUnplannedTask(provider, { scene: request.prompt, placement }, settings, { plan, ...options });
            assert.deepEqual(await redraw(), { scene, placement, title: undefined, orientation: undefined, referenceImages: undefined });
            assert.equal(attempts, 3);
            attempts = 0;
            const controller = new AbortController();
            onRetry = () => controller.abort();
            await assert.rejects(redraw({ signal: controller.signal }), { code: 'REQUEST_ABORTED' });
            assert.equal(attempts, 1);
            assert.equal(host.imageRequests.length, 1);
        } finally { h.stop(); }
    }
});
