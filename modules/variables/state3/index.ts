import { createModuleEvents, event_types } from '../../../core/event-manager.js';
import { observeBackgroundTask } from '../../../shared/common/async-errors.js';
import { mergeAbortSignals } from '../../../shared/common/abort-utils.js';
import { isGenerating } from '../../../shared/common/sillytavern-generation-state.js';
import { waitForAfterAiReady } from '../../../core/after-ai-gate.js';
import { createSettlementService } from './runtime/service.js';
import { createHostAdapter, state3Context as getContext, inGroup, latestUserIndex, type ChatMessage } from './runtime/host.js';
import { compileDefinition } from './definition/compile.js';
import { initialize, settle } from './engine/settle.js';
import { diagnostic, reject } from './engine/diagnostics.js';
import { recordResult, isOpeningReceipt } from './runtime/history.js';
import { openDraft, saveDraft, checkDraft, saveCardDraft, exportRules, prepareRuleImport, importRules } from './definition/authoring.js';
import { onRulesSaved } from './definition/card-host.js';
import { createRuleRefresh } from './definition/refresh.js';
import { currentCard, readCharacter } from '../../card-workspace/host.js';
import { createState3Page } from './ui/settings.js';
import { notifyError } from './ui/notifications.js';
import { CHAT_KEY, CARD_EXTENSION } from './definition/format.js';
import { createState3Macros } from './model/macros.js';
import { createState3Updater } from './model/updater.js';
import { createBeforeGeneration } from './runtime/before-generation.js';
import { digest } from './definition/digest.js';
import { readSettings, saveSettings, state3Selected, selectState3 } from './runtime/settings.js';
export { state3Selected } from './runtime/settings.js';
import type { Result, RunOptions, Success } from './types.js';
import type { State3Api } from './runtime/api.js';
import { authorizeExtensions, assertExtensionTrust, revokeExtensionTrust, extensionTrust } from './extensions/trust.js';
import { testDraftExtension } from './extensions/testing.js';
import { EXTENSION_COPY } from './extensions/copy.js';

let runtime: { page: ReturnType<typeof createState3Page>; modeChanged(): void; dispose(): void } | undefined;

export function initState3() {
    if (runtime) {return;}
    const events = createModuleEvents('variables3'), macros = createState3Macros();
    let lastResult: Result | undefined, page: ReturnType<typeof createState3Page> | undefined;
    let resultMessage: ChatMessage | undefined;
    let beforeResult: Success | undefined;
    let swipeRecovery: MutationObserver | undefined;
    let pendingGeneration: { chat: ChatMessage[]; message?: ChatMessage; waiting: boolean; replacement?: ChatMessage; length: number } | undefined;
    let lifecycle = new AbortController(), selectedMode = state3Selected();
    let newChat: { chat: ChatMessage[]; metadata: object } | undefined;
    let openingWork: { epoch: AbortController; promise: Promise<Result | undefined> } | undefined;
    let resultSequence = 0;
    const adapter = createHostAdapter();
    const topology = new MutationObserver(() => { if (adapter.rememberOrder()) {refresh();} });
    const chatElement = document.getElementById('chat');
    if (chatElement) {topology.observe(chatElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['mesid'] });}
    const extensionHost = { authorize: assertExtensionTrust, requestAuthorization: authorizeExtensions, context: getContext, passage: (index: number) => getContext().chat[index]?.mes || '' };
    const service = createSettlementService(adapter, extensionHost);
    const report = (promise: Promise<unknown>) => {
        const handled = promise.catch(notifyError);
        observeBackgroundTask(handled, { source: import.meta.url, operation: 'state3' });
        return handled;
    };
    function available() { lifecycle.signal.throwIfAborted(); if (!state3Selected()) {reject('not-enabled');} if (isGenerating() || openingWork?.epoch === lifecycle || !openingReady()) {reject('commit-busy');} }
    const owned = <T extends RunOptions>(options?: T) => ({ ...options, signal: mergeAbortSignals(lifecycle.signal, options?.signal)! });
    async function syncProjection() {
        if (lifecycle.signal.aborted) {return;}
        if (!state3Selected() || inGroup(getContext())) { macros.clear(); return; }
        try {
            const epoch = lifecycle;
            macros.clear();
            const result = await service.inspect();
            if (epoch !== lifecycle || epoch.signal.aborted) {return;}
            if (!result.ok) { macros.clear(); return; }
            macros.set(compileDefinition(result.bundle));
        } catch (error) {
            if (['chat-missing', 'character-missing'].includes(diagnostic(error).code)) { macros.clear(); return; }
            throw error;
        }
    }
    const retain = async (promise: Promise<Result>, index?: number): Promise<Result> => {
        const epoch = lifecycle, sequence = ++resultSequence;
        const current = () => epoch === lifecycle && !epoch.signal.aborted && sequence === resultSequence;
        const ctx = getContext(), target = index === undefined ? [...ctx.chat].reverse().find(message => !message.is_user && !message.is_system) : ctx.chat[index];
        let result: Result;
        try { result = await promise; }
        catch (error) { result = { ok: false, diagnostics: [diagnostic(error)] }; }
        if (current()) {
            lastResult = result; resultMessage = target; await syncProjection();
            if (!current()) {return result;}
            if (result.ok && result.receipt?.beforeUpdate) {beforeResult = result;}
            refresh();
            if (result.ok && result.committed) {document.dispatchEvent(new CustomEvent('lwb:state3:committed', { detail: structuredClone(result) }));}
        }
        return result;
    };
    // Every rule writeback, through CardFiles or this API, refreshes the description macros before it resolves.
    const rulesChanged = async () => {
        before.changed();
        try {await syncProjection();} finally {refresh();}
    };
    const stopRulesSaved = onRulesSaved(rulesChanged);
    const reloadRules = createRuleRefresh({ current: currentCard, read: readCharacter, changed: rulesChanged });
    const updater = createState3Updater({ service, adapter, available, changed: () => { refresh(); afterGeneration(); }, rewound: async () => {
        lastResult = undefined; resultMessage = undefined; beforeResult = undefined;
        await syncProjection(); refresh();
    } });
    const before = createBeforeGeneration({ adapter, service, updater, retain, refresh, report, ready: openingReady });
    const writable = () => { available(); if (before.status().busy) {reject('commit-busy');} };
    const api: State3Api = {
        stage(options) { writable(); return service.stage(owned(options)); },
        apply(input, options) { writable(); return retain(service.apply(input, owned(options)), options?.index); },
        // Previews never replace the live result or its pending save.
        async preview(input, options) {
            available();
            try { return await service.preview(input, owned(options)); }
            catch (error) { return { ok: false, diagnostics: [diagnostic(error)] }; }
        },
        undo(options) { writable(); return retain(service.undo(owned(options)), options?.index); },
        inspect: () => service.inspect(),
        async enable(options) {
            lifecycle.signal.throwIfAborted();
            if (isGenerating()) {reject('commit-busy');}
            const epoch = lifecycle;
            return retain((async () => {
                const result = await service.enable(owned(options));
                if (result.ok && result.committed && epoch === lifecycle && !epoch.signal.aborted) {
                    selectState3(); selectedMode = true;
                }
                return result;
            })());
        },
        async tryDefinition(bundle, input = [], { state, signal, stage, prepared, opening } = {}) {
            try {
                const compiled = compileDefinition(bundle);
                if (state !== undefined) {return settle(compiled, state, input, { signal, stage, prepared });}
                const initial = await initialize(compiled, { signal, opening });
                return initial.ok ? settle(compiled, initial.state, input, { signal, stage, prepared }) : initial;
            } catch (error) { return { ok: false, diagnostics: [diagnostic(error)] }; }
        },
        openDraft, saveDraft, checkDraft, exportRules, prepareRuleImport,
        saveCardDraft, importRules,
        refreshRules: options => reloadRules({ ...options, signal: mergeAbortSignals(lifecycle.signal, options.signal)! }),
        lastResult: () => lastResult,
        async retrySave() {
            const epoch = lifecycle, result = lastResult;
            const saved = await adapter.retrySave();
            if (epoch !== lifecycle || epoch.signal.aborted || lastResult !== result) {return saved;}
            if (result?.ok) {
                lastResult = { ...result, saved: true }; delete lastResult.persistence;
                if (beforeResult === result) {beforeResult = lastResult;}
            }
            refresh();
            if (result?.ok && result.receipt?.beforeUpdate && resultMessage) {await before.resume(getContext().chat.indexOf(resultMessage));}
            return saved;
        }, settings: readSettings, saveSettings,
        update: () => retain(updater.update(owned({ stage: 'after' as const }))),
        recomputeBefore: index => before.run(index), skipBefore: index => before.skip(index), undoBefore: index => before.undo(index),
        previewRequest: options => updater.previewRequest(owned(options)),
        cancel: () => { pendingGeneration = undefined; before.cancel(); }, updateStatus: () => before.status(),
        revokeExtensionTrust,
        extensionTrust: () => extensionTrust(adapter.bundle()),
        authorizeExtensions: options => authorizeExtensions(adapter.bundle(), owned(options).signal),
        async testExtension(draft, test, options = {}) {
            const ctx = getContext(), avatar = ctx.characters[ctx.characterId]?.avatar, chat = ctx.chat;
            const assertCurrent = () => {
                const next = getContext();
                if (next.characters[next.characterId]?.avatar !== draft.avatar || avatar !== draft.avatar || next.chat !== chat) {reject('stale-target');}
            };
            assertCurrent();
            if (test.kind !== 'calculate' && !globalThis.confirm(EXTENSION_COPY.liveConfirm)) {return { ok: false, diagnostics: [{ code: 'cancelled' }] };}
            return testDraftExtension(draft, test, owned(options), { ...extensionHost, authorize: async () => {} }, assertCurrent);
        },
        async openAssistant(options) {
            const { openCardWorkspace } = await import('../../assistant/assistant.js');
            await openCardWorkspace({ variables: true, version: '3.0', ...options });
        },
    };
    page = createState3Page(api);
    function refresh() {
        if (lifecycle.signal.aborted) {return;}
        if (!state3Selected() || inGroup(getContext())) { document.querySelectorAll('.lwb-state3-controls').forEach(node => node.remove()); return; }
        try {
            const snapshot = adapter.capture();
            if (!snapshot.history) { document.querySelectorAll('.lwb-state3-controls').forEach(node => node.remove()); return; }
            const ctx = getContext(), definition = adapter.bundle().definition, updates = definition.updates;
            const userIndex = latestUserIndex(ctx.chat);
            const beforeIndex = snapshot.history && updates.includes('before') && ctx.chat[userIndex]?.mes?.trim() ? userIndex : -1;
            const results = snapshot.records.flatMap((record, index) => {
                if (index !== beforeIndex && index !== snapshot.index) {return [];}
                const projected = recordResult(snapshot.state, snapshot.records, index), receipt = projected?.receipt;
                return receipt && snapshot.history ? [{ index, result: (receipt.id === beforeResult?.receipt?.id && receipt.revision === beforeResult.receipt.revision ? beforeResult : projected) as Result,
                    stage: ctx.chat[index]?.is_user ? 'before' as const : 'after' as const,
                    edited: Boolean(receipt.beforeUpdate && receipt.beforeUpdate.inputDigest !== digest(ctx.chat[index]?.mes)) }] : [];
            });
            const resultIndex = resultMessage ? getContext().chat.indexOf(resultMessage) : snapshot.index;
            if (lastResult && resultIndex >= 0) {
                const existing = results.find(item => item.index === resultIndex);
                // Public staged commits can outlive the last retained feedback.
                // A newer receipt on this floor owns its display, not the cache.
                if (lastResult.ok && lastResult.receipt && existing?.result.ok && existing.result.receipt
                    && existing.result.receipt.revision > lastResult.receipt.revision) {
                    lastResult = undefined; resultMessage = undefined;
                } else if (existing) {existing.result = lastResult;} else {results.push({ index: resultIndex, result: lastResult,
                    stage: ctx.chat[resultIndex]?.is_user ? 'before' : 'after', edited: false });}
            }
            page?.mountControl(snapshot.index, results, { updates, beforeIndex, lastReceiptIndex: snapshot.lastReceiptIndex, definition });
        }
        catch (error) { if (!['chat-missing', 'character-missing'].includes(diagnostic(error).code)) {throw error;} }
    }
    function greetingNeedsInitialization() {
        const ctx = getContext(), message = ctx.chat[0];
        if (!state3Selected() || inGroup(ctx) || ctx.chat.length !== 1 || message?.is_user || message?.is_system) {return false;}
        const snapshot = adapter.capture(0);
        if (!snapshot.opening) {return false;}
        if (!ctx.chatMetadata[CHAT_KEY]) {return newChat?.chat === ctx.chat && newChat.metadata === ctx.chatMetadata;}
        return snapshot.history?.openingMode === 'per-swipe' && !snapshot.records[0]?.entries.some(isOpeningReceipt);
    }
    function openingReady() {
        const ctx = getContext();
        if (inGroup(ctx) || !ctx.characters?.[ctx.characterId]?.data?.extensions?.[CARD_EXTENSION]) {return true;}
        const snapshot = adapter.capture(0);
        if (!snapshot.history) {return !adapter.bundle().definition.openings;}
        return snapshot.history.openingMode === 'common' || Boolean(snapshot.records[0]?.entries.some(isOpeningReceipt));
    }
    function initializeGreeting() {
        if (openingWork?.epoch === lifecycle) {return openingWork.promise;}
        if (!greetingNeedsInitialization()) {return;}
        const epoch = lifecycle, ctx = getContext();
        const own = { epoch, promise: undefined as unknown as Promise<Result | undefined> };
        own.promise = (async () => {
            try {
                const result = ctx.chatMetadata[CHAT_KEY]
                    ? await service.initializeOpening({ signal: epoch.signal })
                    : await service.enable({ signal: epoch.signal });
                return result;
            } finally { if (openingWork === own) {openingWork = undefined;} }
        })();
        openingWork = own;
        return own.promise;
    }
    function changed() {
        const ctx = getContext();
        if (newChat?.chat !== ctx.chat || newChat.metadata !== ctx.chatMetadata) {newChat = undefined;}
        clearSwipeRecovery(); pendingGeneration = undefined; lifecycle.abort(); lifecycle = new AbortController();
        before.changed(); macros.clear(); lastResult = undefined; resultMessage = undefined; beforeResult = undefined; adapter.remember();
        page?.targetChanged(); refresh(); observeBackgroundTask(report(syncProjection()), { source: import.meta.url, operation: 'projection' });
    }
    function modeChanged() { if (state3Selected() !== selectedMode) { selectedMode = state3Selected(); changed(); } else {refresh();} }
    function invalidateResult(keepBefore = false) {
        lifecycle.abort(); lifecycle = new AbortController();
        if (!keepBefore || !lastResult?.ok || lastResult.saved !== false) {lastResult = undefined; resultMessage = undefined;}
        // The before-generation owner handles generation cancellation/reuse.
        if (!keepBefore) {updater.cancel(); beforeResult = undefined;}
        page?.targetChanged();
    }
    function clearSwipeRecovery() { swipeRecovery?.disconnect(); swipeRecovery = undefined; }
    function watchSwipeRecovery(index: number) {
        clearSwipeRecovery();
        if (!state3Selected()) {return;}
        const ctx = getContext(), message = ctx.chat[index];
        if (!message?.swipes || message.swipe_id !== message.swipes.length) {return;}
        const pendingSwipe = message.swipe_id;
        swipeRecovery = new MutationObserver(() => {
            if (getContext().chat !== ctx.chat) {clearSwipeRecovery(); return;}
            if (message.swipe_id === message.swipes!.length) {return;}
            clearSwipeRecovery();
            if (message.swipe_id === pendingSwipe) {refresh(); return;}
            pendingGeneration = undefined;
            observeBackgroundTask(report(restoreSelection('swipe', ctx.chat.indexOf(message))), { source: import.meta.url, operation: 'swipe-recovery' });
        });
        const chat = document.getElementById('chat'), floor = chat?.querySelector(`.mes[mesid="${index}"]`);
        if (chat) {swipeRecovery.observe(chat, { childList: true });}
        if (floor) {swipeRecovery.observe(floor, { attributes: true, attributeFilter: ['swipeid'] });}
    }
    async function restoreSelection(kind: 'delete' | 'swipe', index?: number) {
        const change = adapter.selectionChange(kind, index);
        if (!state3Selected()) {return;}
        invalidateResult();
        // Receipt restoration publishes synchronously. Initialization must start
        // from that common baseline, without waiting for an older disk save.
        const restoration = change.previous.length || change.next.length
            ? service.restoreSelection(change.previous, change.next, { check: change.historical, signal: lifecycle.signal }) : undefined;
        const initialization = initializeGreeting();
        if (restoration || initialization) {
            // The host may move messages while persistence is pending. Capture
            // this selection's receipt now, never from its old position later.
            const snapshot = adapter.capture(index);
            const restoredReceipt = snapshot.records[snapshot.index]?.entries.at(-1);
            observeBackgroundTask(report(retain((async () => {
                const [restored, initialized] = await Promise.all([restoration, initialization]);
                const result = initialized ?? restored;
                if (!result) {return service.inspect();}
                if (!result.ok) {return result;}
                const receipt = result.receipt ?? restoredReceipt;
                return { ...result, ...(receipt ? { receipt } : {}) };
            })(), index)), { source: import.meta.url, operation: 'selection-save' });
            await syncProjection();
        }
        refresh();
    }
    events.on(event_types.CHAT_CHANGED, changed);
    if (event_types.CHARACTER_DELETED) {events.on(event_types.CHARACTER_DELETED, ({ character }: { character: { avatar: string } }) => revokeExtensionTrust(character.avatar));}
    events.on(event_types.MESSAGE_DELETED, () => {
        clearSwipeRecovery();
        const ctx = getContext(), generation = pendingGeneration;
        // Regenerate deletes its old reply before receiving the replacement.
        if (generation?.chat === ctx.chat && generation.replacement && ctx.chat.length === generation.length - 1 && !ctx.chat.includes(generation.replacement)) {
            generation.replacement = undefined;
        } else {pendingGeneration = undefined;}
        return report(restoreSelection('delete'));
    });
    events.on(event_types.MESSAGE_SWIPED, (index: number) => {
        pendingGeneration = undefined;
        const restoring = report(restoreSelection('swipe', Number(index)));
        watchSwipeRecovery(Number(index));
        return restoring;
    });
    events.on(event_types.MESSAGE_EDITED, () => { pendingGeneration = undefined; clearSwipeRecovery(); invalidateResult(); refresh(); });
    // The host emits MESSAGE_SWIPED after deleting the selected swipe; that event owns restoration.
    events.on(event_types.SETTINGS_UPDATED, modeChanged);
    events.on(event_types.CHARACTER_MESSAGE_RENDERED, (index: number) => { refresh(); afterGeneration(Number(index)); });
    events.on(event_types.GENERATION_STARTED, async (type: string, _options: unknown, dryRun: boolean) => {
        if (dryRun) {return syncProjection();}
        if (!state3Selected() || !['normal', 'regenerate', 'swipe', 'continue', undefined, ''].includes(type)) {return;}
        const epoch = lifecycle, initialization = initializeGreeting();
        if (initialization) {
            let initialized: Result | undefined;
            try { initialized = await initialization; }
            catch (error) {
                if (epoch !== lifecycle || epoch.signal.aborted) {throw error;}
                initialized = { ok: false, diagnostics: [diagnostic(error)] };
            }
            if (epoch !== lifecycle || epoch.signal.aborted) {reject('stale-target');}
            if (initialized && !initialized.ok) {
                await retain(Promise.resolve(initialized), 0);
                const { code, ...details } = initialized.diagnostics[0]; reject(code, details);
            }
        }
        invalidateResult(true); adapter.remember();
        const chat = getContext().chat;
        pendingGeneration = { chat, waiting: false, length: chat.length,
            replacement: type === 'regenerate' && !chat.at(-1)?.is_user ? chat.at(-1) : undefined };
        return syncProjection();
    });
    events.on(event_types.MESSAGE_RECEIVED, (index: number) => afterGeneration(Number(index)));
    events.on(event_types.GENERATION_ENDED, () => afterGeneration());
    function afterGeneration(index?: number) {
        const generation = pendingGeneration, ctx = getContext();
        if (!state3Selected() || !generation || ctx.chat !== generation.chat) {return;}
        if (index !== undefined) {
            const message = ctx.chat[index];
            if (!message || message.is_user || message.is_system || !message.mes?.trim()) {return;}
            generation.message = message;
        }
        // Completion can arrive before the reply notification. Keep the turn
        // eligible; the later received/rendered event starts its single waiter.
        if (!generation.message || generation.waiting) {return;}
        generation.waiting = true;
        const signal = lifecycle.signal, chatId = String(ctx.chatId);
        observeBackgroundTask(report((async () => {
            try {
                if (!await waitForAfterAiReady(chatId, signal) || signal.aborted || pendingGeneration !== generation) {return;}
                const current = getContext(), message = generation.message;
                if (current.chat !== generation.chat || !message || !state3Selected()) {return;}
                const messageId = current.chat.indexOf(message);
                if (messageId < 0) {return;}
                // Cancellation does not release an updater still awaiting persistence.
                // Its changed callback resumes this turn once ownership is released.
                if (updater.status().busy) {return;}
                // Consume before awaiting the model, including failed requests.
                pendingGeneration = undefined;
                if (current.chatMetadata[CHAT_KEY] && readSettings().auto && adapter.bundle().definition.updates.includes('after')) {
                    await retain(updater.update(owned({ stage: 'after' as const, index: messageId })), messageId);
                }
                if (!signal.aborted) {adapter.remember(); refresh();}
            } finally {generation.waiting = false;}
        })()), { source: import.meta.url, operation: 'afterGeneration' });
    }
    events.on(event_types.CHAT_CREATED, async () => {
        const ctx = getContext();
        if (inGroup(ctx) || !state3Selected() || ctx.chatMetadata?.[CHAT_KEY]) {return;}
        if (ctx.characters?.[ctx.characterId]?.data?.extensions?.[CARD_EXTENSION]) {
            newChat = { chat: ctx.chat, metadata: ctx.chatMetadata };
            const signal = lifecycle.signal, initialization = initializeGreeting();
            if (!initialization) {return;}
            const result = await retain(initialization.then(async (result): Promise<Result> => result ?? await service.inspect()), 0);
            if (!signal.aborted && !result.ok) {result.diagnostics.forEach(notifyError);}
        }
    });
    window.LWB_StateV3 = api;
    runtime = { page, modeChanged, dispose() { stopRulesSaved(); lifecycle.abort(); clearSwipeRecovery(); topology.disconnect(); before.dispose(); macros.dispose(); events.cleanup(); page?.dispose(); delete window.LWB_StateV3; } };
    refresh();
    if (state3Selected()) {observeBackgroundTask(report(syncProjection()), { source: import.meta.url, operation: 'projection' });}
}
export async function openState3(page?: 'play' | 'author', tab?: 'rules' | 'extensions', path?: string) {
    try { if (!runtime) {reject('not-enabled');} await runtime.page.open(page, tab, path); }
    catch (error) { notifyError(error); }
}
export function syncState3Mode() { runtime?.modeChanged(); }
export function cleanupState3() { runtime?.dispose(); runtime = undefined; }
