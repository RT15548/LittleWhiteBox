import { ref, type Ref } from 'vue';
import type { TavernApplyRegexItem } from '../../../shared/regex';
import type { TavernActionCheckRuntimeEvent } from '../../../shared/runtime-events';

export interface TavernRuntimeDisplayRegexRequest {
    key: string;
    text: string;
    placement: TavernApplyRegexItem['placement'];
    options: TavernApplyRegexItem['options'];
    actionCheckEvents?: TavernActionCheckRuntimeEvent[];
    actionCheckBoundaries?: Array<{ originalOffset: number; marker: string }>;
}

export interface TavernRuntimeDisplayProjection {
    text: string;
    actionCheckEvents: TavernActionCheckRuntimeEvent[];
}

export interface TavernRuntimeThoughtProjectionInput {
    slot: string;
    label?: string;
    fallbackText?: string;
    request: TavernRuntimeDisplayRegexRequest | null;
}

interface TavernRuntimeDisplayProjectionOptions {
    throttleMs: number;
    resolveText: (request: TavernRuntimeDisplayRegexRequest) => Promise<string>;
    projectText: (text: string, request: TavernRuntimeDisplayRegexRequest) => TavernRuntimeDisplayProjection;
    onError?: (error: unknown) => void;
    setTimer?: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
    clearTimer?: (timer: ReturnType<typeof setTimeout>) => void;
}

interface PendingProjectionSlot {
    latest: TavernRuntimeDisplayRegexRequest;
    timer: ReturnType<typeof setTimeout> | null;
    inFlight: boolean;
}

interface PublishedProjectionSlot {
    key: string;
    projection: TavernRuntimeDisplayProjection;
}

const EMPTY_MESSAGE_PROJECTION: TavernRuntimeDisplayProjection = Object.freeze({
    text: '',
    actionCheckEvents: [],
});

function sameProjection(left: TavernRuntimeDisplayProjection, right: TavernRuntimeDisplayProjection) {
    if (left.text !== right.text || left.actionCheckEvents.length !== right.actionCheckEvents.length) {return false;}
    return left.actionCheckEvents.every((event, index) => event === right.actionCheckEvents[index]);
}

function sameThoughtBlocks(
    left: Array<{ label?: string; text?: string }>,
    right: Array<{ label?: string; text?: string }>,
) {
    if (left.length !== right.length) {return false;}
    return left.every((thought, index) => (
        thought.label === right[index]?.label
        && thought.text === right[index]?.text
    ));
}

/**
 * Owns the transient display-regex state for one live assistant turn.
 *
 * Raw provider snapshots may arrive every frame. Only the latest request per
 * slot is retained, requests stay serial, and resolved projections are kept
 * outside the settled-message cache so a long stream cannot retain every
 * cumulative full-text result.
 */
export function useTavernRuntimeDisplayProjection(options: TavernRuntimeDisplayProjectionOptions): {
    messageProjection: Ref<TavernRuntimeDisplayProjection>;
    thoughtBlocks: Ref<Array<{ label?: string; text?: string }>>;
    setMessageInput: (
        request: TavernRuntimeDisplayRegexRequest | null,
        fallback?: TavernRuntimeDisplayProjection,
    ) => void;
    setThoughtInputs: (inputs: TavernRuntimeThoughtProjectionInput[]) => void;
    clear: () => void;
} {
    const messageProjection = ref<TavernRuntimeDisplayProjection>({ ...EMPTY_MESSAGE_PROJECTION });
    const projectedThoughtBlocks = ref<Array<{ label?: string; text?: string }>>([]);
    const pendingSlots = new Map<string, PendingProjectionSlot>();
    const publishedSlots = new Map<string, PublishedProjectionSlot>();
    const setTimer = options.setTimer || ((callback, delay) => setTimeout(callback, delay));
    const clearTimer = options.clearTimer || ((timer) => clearTimeout(timer));
    let thoughtInputs: TavernRuntimeThoughtProjectionInput[] = [];

    function publishMessage(projection: TavernRuntimeDisplayProjection) {
        if (sameProjection(messageProjection.value, projection)) {return;}
        messageProjection.value = projection;
    }

    function rebuildThoughtBlocks() {
        const next = thoughtInputs.map((input) => {
            const projection = publishedSlots.get(input.slot)?.projection;
            return {
                ...(input.label ? { label: input.label } : {}),
                text: projection?.text ?? input.fallbackText ?? '',
            };
        }).filter((thought) => String(thought.text || '').trim());
        if (!sameThoughtBlocks(projectedThoughtBlocks.value, next)) {
            projectedThoughtBlocks.value = next;
        }
    }

    function publishSlot(slot: string, request: TavernRuntimeDisplayRegexRequest, text: string) {
        const projection = options.projectText(text, request);
        publishedSlots.set(slot, { key: request.key, projection });
        if (slot === 'runtime:message') {
            publishMessage(projection);
            return;
        }
        rebuildThoughtBlocks();
    }

    function cancelSlot(slot: string, removeProjection = false) {
        const pending = pendingSlots.get(slot);
        if (pending?.timer !== null && pending?.timer !== undefined) {
            clearTimer(pending.timer);
        }
        pendingSlots.delete(slot);
        if (removeProjection) {
            publishedSlots.delete(slot);
        }
    }

    function runSlot(slot: string) {
        const pending = pendingSlots.get(slot);
        if (!pending || pending.inFlight) {return;}
        const request = pending.latest;
        pending.timer = null;
        pending.inFlight = true;
        void options.resolveText(request)
            .catch((error) => {
                options.onError?.(error);
                return request.text;
            })
            .then((text) => {
                const current = pendingSlots.get(slot);
                if (current !== pending || current.latest.key !== request.key) {return;}
                publishSlot(slot, request, text);
            })
            .finally(() => {
                const current = pendingSlots.get(slot);
                if (current !== pending) {return;}
                current.inFlight = false;
                if (current.latest.key !== request.key) {
                    runSlot(slot);
                    return;
                }
                pendingSlots.delete(slot);
            });
    }

    function scheduleSlot(slot: string, request: TavernRuntimeDisplayRegexRequest) {
        const pending = pendingSlots.get(slot);
        if (pending) {
            pending.latest = request;
            return;
        }
        if (publishedSlots.get(slot)?.key === request.key) {return;}
        const next: PendingProjectionSlot = {
            latest: request,
            timer: null,
            inFlight: false,
        };
        next.timer = setTimer(() => runSlot(slot), Math.max(0, options.throttleMs));
        pendingSlots.set(slot, next);
    }

    function setMessageInput(
        request: TavernRuntimeDisplayRegexRequest | null,
        fallback: TavernRuntimeDisplayProjection = EMPTY_MESSAGE_PROJECTION,
    ) {
        if (request) {
            scheduleSlot('runtime:message', request);
            return;
        }
        cancelSlot('runtime:message', true);
        publishMessage(fallback);
    }

    function setThoughtInputs(inputs: TavernRuntimeThoughtProjectionInput[]) {
        thoughtInputs = inputs;
        const activeSlots = new Set(inputs.map((input) => input.slot));
        Array.from(pendingSlots.keys()).forEach((slot) => {
            if (slot !== 'runtime:message' && !activeSlots.has(slot)) {
                cancelSlot(slot, true);
            }
        });
        Array.from(publishedSlots.keys()).forEach((slot) => {
            if (slot !== 'runtime:message' && !activeSlots.has(slot)) {
                publishedSlots.delete(slot);
            }
        });
        inputs.forEach((input) => {
            if (input.request) {
                scheduleSlot(input.slot, input.request);
            } else {
                cancelSlot(input.slot, true);
            }
        });
        rebuildThoughtBlocks();
    }

    function clear() {
        Array.from(pendingSlots.keys()).forEach((slot) => cancelSlot(slot));
        pendingSlots.clear();
        publishedSlots.clear();
        thoughtInputs = [];
        publishMessage({ ...EMPTY_MESSAGE_PROJECTION });
        if (projectedThoughtBlocks.value.length) {
            projectedThoughtBlocks.value = [];
        }
    }

    return {
        messageProjection,
        thoughtBlocks: projectedThoughtBlocks,
        setMessageInput,
        setThoughtInputs,
        clear,
    };
}
