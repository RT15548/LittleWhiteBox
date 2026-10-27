import {
    eventSource, event_types, stopGeneration, main_api, updateMessageBlock, is_send_press,
} from '../../../../../../script.js';
import { registerGenerateInterceptor, unregisterGenerateInterceptor,
    GENERATE_INTERCEPTOR_ORDER } from '../../shared/common/generate-interceptor.js';
import { createPlannerGeneration } from './ena-planner-generation.js';
import { createPlannerMarker, reservePlannerSlot } from './ena-planner-slot.js';
import { createPlannerBypassRequests } from './ena-planner-requests.js';
import { createPlannerPreview } from './ena-planner-preview.js';
import { throwIfSignalAborted } from '../../shared/common/abort-utils.js';

const ID = 'ena-planner';

export function createPlannerHost(options) {
    let installed = false;
    let attached = false;
    const bypass = createPlannerBypassRequests();
    const inputAliases = new Map();
    let preview = null;
    const runtime = createPlannerGeneration({
        ...options,
        preview: (run, actions) => preview?.render(run, actions),
        clearPreview: () => preview?.clear(),
        chat: () => options.getContext()?.chat || [],
        createMarker: createPlannerMarker,
        reserveSlot: reservePlannerSlot,
        orderHooks,
        stop: stopGeneration,
        update: updateMessageBlock,
        async waitForIdle(signal) {
            // The cancelled payload must unwind before ST starts a new Generate;
            // otherwise its cleanup could stop the replacement request.
            while (is_send_press) {
                throwIfSignalAborted(signal);
                await new Promise(resolve => setTimeout(resolve, 25));
            }
            throwIfSignalAborted(signal);
        },
        generate: (...args) => options.getContext().generate(...args),
    });

    function orderHooks() {
        eventSource.makeFirst(event_types.GENERATE_AFTER_DATA, beforeData);
        eventSource.makeFirst(event_types.CHAT_COMPLETION_SETTINGS_READY, beforeSettings);
        eventSource.makeLast(event_types.GENERATE_AFTER_DATA, afterData);
        eventSource.makeLast(event_types.CHAT_COMPLETION_SETTINGS_READY, settingsReady);
    }
    async function prepare(chat, contextSize, abort, type, dispatch) {
        let aborted = false;
        const abortRequest = immediately => { aborted = true; abort(immediately); };
        const planned = installed && await runtime.prepare(chat, contextSize, abortRequest, type, dispatch);
        if (aborted) return;
        // Native swipe/regeneration of the opening message can have no chat
        // items. Do not invent a message merely to carry a bypass identity.
        // If another unbound planner request exists, bind() still rejects an
        // unidentified payload locally, without stopping that other request.
        if (!planned && chat.length > 0) {
            try {
                // Text transports do not carry the native generation type. Give
                // every bypass its own identity instead of guessing from the
                // absence of the foreground's slot (quiet may arrive first).
                bypass.reserve(chat, options.getContext()?.chat || []);
            } catch (error) {
                abortRequest(true);
                options.onError(error);
                return;
            }
        }
        orderHooks();
    }
    function bind(data, field, companionFields = []) {
        try {
            const bypassMatch = bypass.matches(data, field, companionFields);
            if (bypassMatch && runtime.matchesRequest(data, field, companionFields)) {
                return runtime.rejectRequest(data);
            }
            if (bypass.take(data, field, companionFields)) return false;
            if (bypassMatch) return runtime.rejectRequest(data);
            if (data.type === 'quiet' || data.type === 'impersonate') {
                runtime.stripSlot(data, field);
                for (const companion of companionFields) runtime.stripSlot(data, companion);
                return false;
            }
            return runtime.bindRequest(data, field, companionFields);
        } catch (error) {
            return runtime.rejectRequest(data, error);
        }
    }
    function beforeData(data, dryRun) {
        const field = Object.hasOwn(data, 'input') ? 'input' : 'prompt';
        if (dryRun) {
            runtime.stripSlot(data, field);
            runtime.stripSlot(data, 'negative_prompt');
            return;
        }
        // Chat completion creates another payload (and another messages array)
        // after this event. Carry its identity through to SETTINGS_READY.
        if (main_api !== 'openai') {
            const bound = bind(data, field, field === 'prompt' ? ['negative_prompt'] : []);
            // ST-Prompt-Template's text handler consumes `prompt`; NovelAI's
            // transport consumes `input`. Alias only during this event, allowing
            // that same handler to evaluate the native text exactly once.
            if (bound && field === 'input') {
                inputAliases.set(data, Object.getOwnPropertyDescriptor(data, 'prompt'));
                Object.defineProperty(data, 'prompt', { configurable: true, enumerable: false,
                    get: () => data.input, set: value => { data.input = value; } });
            }
        }
    }
    function beforeSettings(data) {
        bind(data, 'messages');
    }
    async function afterData(data, dryRun) {
        restoreInputAlias(data);
        if (!dryRun) await runtime.consume(data);
        detachIfIdle();
    }
    async function settingsReady(data) {
        await runtime.consume(data);
        detachIfIdle();
    }
    const restoreAliases = () => { for (const data of inputAliases.keys()) restoreInputAlias(data); };
    const stopped = () => { restoreAliases(); runtime.hostStopped(); };
    const changed = () => { restoreAliases(); runtime.cancel(true, true); };
    const edited = index => runtime.sourceEdited(index);
    const deleted = () => runtime.sourceDeleted();
    function restoreInputAlias(data) {
        if (!inputAliases.has(data)) return;
        const descriptor = inputAliases.get(data);
        if (descriptor) Object.defineProperty(data, 'prompt', descriptor);
        else delete data.prompt;
        inputAliases.delete(data);
    }

    function detachIfIdle() {
        if (installed || !attached || runtime.hasOutstandingRequest() || bypass.pending()) return;
        unregisterGenerateInterceptor(ID);
        eventSource.removeListener(event_types.GENERATE_AFTER_DATA, beforeData);
        eventSource.removeListener(event_types.CHAT_COMPLETION_SETTINGS_READY, beforeSettings);
        eventSource.removeListener(event_types.GENERATE_AFTER_DATA, afterData);
        eventSource.removeListener(event_types.CHAT_COMPLETION_SETTINGS_READY, settingsReady);
        eventSource.removeListener(event_types.GENERATION_STOPPED, stopped);
        eventSource.removeListener(event_types.CHAT_CHANGED, changed);
        eventSource.removeListener(event_types.MESSAGE_EDITED, edited);
        eventSource.removeListener(event_types.MESSAGE_DELETED, deleted);
        attached = false;
    }
    return {
        cancel: changed,
        context: runtime.context,
        install() {
            if (installed) return;
            installed = true;
            preview = createPlannerPreview(options);
            if (attached) return;
            attached = true;
            registerGenerateInterceptor(ID, prepare, GENERATE_INTERCEPTOR_ORDER.ENA_PLANNER);
            eventSource.on(event_types.GENERATE_AFTER_DATA, beforeData);
            eventSource.on(event_types.CHAT_COMPLETION_SETTINGS_READY, beforeSettings);
            eventSource.on(event_types.GENERATE_AFTER_DATA, afterData);
            eventSource.on(event_types.CHAT_COMPLETION_SETTINGS_READY, settingsReady);
            eventSource.on(event_types.GENERATION_STOPPED, stopped);
            eventSource.on(event_types.CHAT_CHANGED, changed);
            eventSource.on(event_types.MESSAGE_EDITED, edited);
            eventSource.on(event_types.MESSAGE_DELETED, deleted);
        },
        cleanup() {
            installed = false;
            changed();
            preview?.cleanup();
            preview = null;
            // An unbound cancelled request can still reach transport after the
            // module is disabled. Retain only correlation/denial until it arrives;
            // new interceptions bypass planning. No timeout may authorize it.
            detachIfIdle();
        },
    };
}
