import {
    eventSource, event_types, stopGeneration, main_api, updateMessageBlock,
} from '../../../../../../script.js';
import { countTokensOpenAIAsync, getTokenCountAsync } from '../../../../../tokenizers.js';
import { registerGenerateInterceptor, unregisterGenerateInterceptor,
    GENERATE_INTERCEPTOR_ORDER } from '../../shared/common/generate-interceptor.js';
import { createPlannerGeneration } from './ena-planner-generation.js';
import { createPlannerMarker, reservePlannerSlot } from './ena-planner-slot.js';
import { PLANNER_COPY } from './ena-planner-copy.js';
import { checkPlannerBudget } from './ena-planner-budget.js';
import { savePlannerResult } from './ena-planner-save.js';

const ID = 'ena-planner';

async function countMedia(part) {
    const { Message } = await import('../../../../../openai.js');
    const message = await Message.createAsync('user', '', 'ena-planner-budget');
    if (part.type === 'image_url') {
        return message.getImageTokenCost(part.image_url.url, part.image_url.detail || 'auto');
    }
    const method = { audio_url: 'addAudio', video_url: 'addVideo' }[part.type];
    if (!method || typeof message[method] !== 'function') throw new Error(PLANNER_COPY.budgetUnknown);
    await message[method](part[part.type].url);
    if (!(message.getTokens() > 0)) throw new Error(PLANNER_COPY.budgetUnknown);
    return message.getTokens();
}

export function createPlannerHost(options) {
    let installed = false;
    const inputAliases = new Map();
    const runtime = createPlannerGeneration({
        ...options,
        chat: () => options.getContext()?.chat || [],
        createMarker: createPlannerMarker,
        reserveSlot: reservePlannerSlot,
        orderHooks() {
            eventSource.makeFirst(event_types.GENERATE_AFTER_DATA, beforeData);
            eventSource.makeFirst(event_types.CHAT_COMPLETION_SETTINGS_READY, beforeSettings);
            eventSource.makeLast(event_types.GENERATE_AFTER_DATA, afterData);
            eventSource.makeLast(event_types.CHAT_COMPLETION_SETTINGS_READY, settingsReady);
        },
        stop: stopGeneration,
        checkBudget: (data, run) => checkPlannerBudget(data, run, {
            text: text => getTokenCountAsync(text, 0),
            messages: messages => countTokensOpenAIAsync(messages, true),
            media: countMedia,
        }),
        commit: (run, plan) => savePlannerResult(run, plan, { ...options, update: updateMessageBlock }),
    });

    function beforeData(data, dryRun) {
        const field = Object.hasOwn(data, 'input') ? 'input' : 'prompt';
        if (dryRun || data.type === 'quiet' || data.type === 'impersonate') {
            runtime.stripSlot(data, field);
            runtime.stripSlot(data, 'negative_prompt');
            return;
        }
        if (main_api !== 'openai') {
            const bound = runtime.bindRequest(data, field, field === 'prompt' ? ['negative_prompt'] : []);
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
        if (data.type === 'quiet' || data.type === 'impersonate') {
            runtime.stripSlot(data, 'messages');
            return;
        }
        runtime.bindRequest(data, 'messages');
    }
    async function afterData(data, dryRun) {
        restoreInputAlias(data);
        if (!dryRun) await runtime.consume(data);
    }
    async function settingsReady(data) {
        await runtime.consume(data);
    }
    const restoreAliases = () => { for (const data of inputAliases.keys()) restoreInputAlias(data); };
    const stopped = () => { restoreAliases(); runtime.cancel(false); };
    const changed = () => { restoreAliases(); runtime.cancel(true, true); };
    const edited = index => runtime.sourceEdited(index);
    function restoreInputAlias(data) {
        if (!inputAliases.has(data)) return;
        const descriptor = inputAliases.get(data);
        if (descriptor) Object.defineProperty(data, 'prompt', descriptor);
        else delete data.prompt;
        inputAliases.delete(data);
    }

    return {
        cancel: changed,
        context: runtime.context,
        install() {
            if (installed) return;
            installed = true;
            registerGenerateInterceptor(ID, runtime.prepare, GENERATE_INTERCEPTOR_ORDER.ENA_PLANNER);
            eventSource.on(event_types.GENERATE_AFTER_DATA, beforeData);
            eventSource.on(event_types.CHAT_COMPLETION_SETTINGS_READY, beforeSettings);
            eventSource.on(event_types.GENERATE_AFTER_DATA, afterData);
            eventSource.on(event_types.CHAT_COMPLETION_SETTINGS_READY, settingsReady);
            eventSource.on(event_types.GENERATION_STOPPED, stopped);
            eventSource.on(event_types.CHAT_CHANGED, changed);
            eventSource.on(event_types.MESSAGE_EDITED, edited);
        },
        cleanup() {
            changed();
            unregisterGenerateInterceptor(ID);
            eventSource.removeListener(event_types.GENERATE_AFTER_DATA, beforeData);
            eventSource.removeListener(event_types.CHAT_COMPLETION_SETTINGS_READY, beforeSettings);
            eventSource.removeListener(event_types.GENERATE_AFTER_DATA, afterData);
            eventSource.removeListener(event_types.CHAT_COMPLETION_SETTINGS_READY, settingsReady);
            eventSource.removeListener(event_types.GENERATION_STOPPED, stopped);
            eventSource.removeListener(event_types.CHAT_CHANGED, changed);
            eventSource.removeListener(event_types.MESSAGE_EDITED, edited);
            installed = false;
        },
    };
}
