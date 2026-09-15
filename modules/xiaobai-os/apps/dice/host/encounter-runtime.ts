import { is_group_generating } from '../../../../../../../../group-chats.js';
import { createModuleEvents, event_types } from '../../../../../core/event-manager.js';
import { registerGenerateInterceptor, unregisterGenerateInterceptor, GENERATE_INTERCEPTOR_ORDER } from '../../../../../shared/common/generate-interceptor.js';
import { setSillyTavernPrompt } from '../../../host/sillytavern-runtime-adapters.js';
import { DICE_MESSAGE_KEY } from '../domain/check-records.js';
import { decideEncounter, encounterLevel, parseEncounterRecords } from '../domain/encounter.js';
import { buildEncounterPrompt, type EncounterReferences } from '../protocol/encounter-prompt.js';
import { captureEncounterTarget, encounterReplyTarget, isEncounterTargetCurrent, recentEncounterOutcomes, type EncounterTarget } from './encounter-records.js';
import { captureDiceChat } from './sillytavern-port.js';
import type { DiceChat, DiceHostMessage } from './message-records.js';

const KEY = 'xiaobai_os_dice_encounter';
const MAIN_TYPES = ['', 'normal', 'regenerate', 'swipe', 'continue'];
interface Observation {
    source: DiceChat; type: string; initialLength: number;
    automatic: boolean; user: DiceHostMessage | null; preparing: boolean; signal?: AbortSignal;
}

export function createEncounterRuntime(dependencies: {
    enabled(): boolean;
    references(identityKey: string): EncounterReferences | Promise<EncounterReferences>;
    isAuxiliaryMessage(message: DiceHostMessage): boolean;
    changed(fresh?: DiceHostMessage): void;
    random?: () => number;
}) {
    let observation: Observation | null = null;
    let unsubscribe: (() => void) | null = null;
    let issue: { target: EncounterTarget; error: string } | null = null;
    const clearPrompt = () => setSillyTavernPrompt(KEY, '');
    function invalidateRequest(): void { observation = null; clearPrompt(); }
    function cancel(): void {
        invalidateRequest(); issue = null; dependencies.changed();
    }

    function start(): void {
        if (unsubscribe) { return; }
        const events = createModuleEvents('xiaobaiOsDiceEncounter');
        events.on(event_types.GENERATION_STARTED, (_type: unknown, _options: unknown, dryRun: unknown) => {
            if (!dryRun) { cancel(); }
        });
        events.on(event_types.GENERATION_AFTER_COMMANDS, (value: unknown, options: { signal?: AbortSignal; automatic_trigger?: boolean }, dryRun: unknown) => {
            if (dryRun) { return; }
            const type = String(value || '');
            const source = captureDiceChat();
            // The outer group wrapper does not own a user turn. There is no save wait here;
            // the first inner member observes the native user-message event instead.
            if (source && (!source.groupId || is_group_generating) && MAIN_TYPES.includes(type) && dependencies.enabled()) {
                observation = { source, type, initialLength: source.chat.length,
                    automatic: !!options.automatic_trigger, user: null, preparing: true, signal: options.signal };
            }
        });
        events.on(event_types.MESSAGE_SENT, (index: number) => {
            const own = observation;
            if (!own || own.automatic || !['', 'normal'].includes(own.type) || index < own.initialLength) { return; }
            const target = captureEncounterTarget(own.source, index);
            if (!target || !isEncounterTargetCurrent(captureDiceChat(), target) || target.message !== own.source.chat.at(-1)) { return; }
            own.user = target.message;
        });
        registerGenerateInterceptor(KEY, async (_chat: unknown, _size: unknown, abort: (immediate: boolean) => void, type: string) => {
            clearPrompt();
            const own = observation;
            if (!own || !MAIN_TYPES.includes(String(type || '')) || !dependencies.enabled()) { return; }
            own.preparing = false;
            const current = () => observation === own && !own.signal?.aborted && dependencies.enabled()
                && captureDiceChat()?.chat === own.source.chat && captureDiceChat()?.key === own.source.key;
            if (!current()) { abort(true); return; }
            const target = encounterReplyTarget(own.source, own.type, dependencies.isAuxiliaryMessage);
            if (!target) { return; }
            const valid = () => current() && isEncounterTargetCurrent(captureDiceChat(), target);
            try {
                issue = null;
                let records = target.records === undefined ? null : parseEncounterRecords(target.records);
                if (!records && own.user === target.message) {
                    records = decideEncounter(recentEncounterOutcomes(target), dependencies.random ?? Math.random);
                    // A local per-turn fact, carried by the host's normal chat saves. Encounter
                    // injection must never dispatch a separate whole-chat write or await its ACK.
                    target.message.extra ??= {};
                    target.message.extra[DICE_MESSAGE_KEY] = records;
                    if (encounterLevel(records.encounter.outcome)) { dependencies.changed(target.message); }
                }
                const level = records && encounterLevel(records.encounter.outcome);
                if (!level) { return; }
                const references = await dependencies.references(target.source.key);
                if (!valid()) { abort(true); return; }
                setSillyTavernPrompt(KEY, buildEncounterPrompt(level, references));
            } catch (error) {
                clearPrompt();
                if (!valid()) { abort(true); return; }
                console.error('[LittleWhiteBox] Dice encounter preparation failed', error);
                issue = { target, error: '本次未加入随机遭遇。' }; dependencies.changed();
            }
        }, GENERATE_INTERCEPTOR_ORDER.XIAOBAI_OS_DICE);
        events.on(event_types.GENERATE_AFTER_DATA, (_data: unknown, dryRun: unknown) => { if (!dryRun) { clearPrompt(); } });
        events.on(event_types.GENERATION_STOPPED, invalidateRequest);
        events.on(event_types.GENERATION_ENDED, invalidateRequest);
        events.on(event_types.MESSAGE_DELETED, () => {
            if (observation?.type === 'regenerate' && observation.preparing) { observation.preparing = false; return; }
            cancel();
        });
        for (const name of [event_types.CHAT_CHANGED, event_types.MESSAGE_EDITED, event_types.MESSAGE_SWIPED]) { events.on(name, cancel); }
        unsubscribe = () => { events.cleanup(); unregisterGenerateInterceptor(KEY); };
    }
    return {
        start, cancel, view: () => issue,
        stop() { cancel(); unsubscribe?.(); unsubscribe = null; },
    };
}
