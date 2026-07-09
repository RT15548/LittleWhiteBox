import type { XbTavernMessage } from './message-assembler';
import type { TavernActionCheckDifficultyLabel, TavernActionCheckMode } from './action-checks';

export type TavernRuntimeEventType = 'chanceEncounter' | 'actionCheck';

export interface TavernChanceEncounterRuntimeEvent {
    type: 'chanceEncounter';
    label: string;
    createdAt: string;
}

export interface TavernActionCheckRuntimeEvent {
    type: 'actionCheck';
    createdAt: string;
    action: string;
    character?: string;
    stat: string;
    difficulty: number;
    difficultyLabel?: TavernActionCheckDifficultyLabel;
    mode?: TavernActionCheckMode;
    roll: number;
    threshold?: number;
    statValue?: number;
    statMax?: number;
    success: boolean;
    outcome: 'criticalSuccess' | 'success' | 'failure' | 'criticalFailure';
    insertAfterChars: number;
    toolCallId?: string;
    summary?: string;
    stakes?: string;
}

export type TavernRuntimeEvent = TavernChanceEncounterRuntimeEvent | TavernActionCheckRuntimeEvent;

export interface TavernActionCheckRenderGroup {
    marker: string;
    events: TavernActionCheckRuntimeEvent[];
}

export const CHANCE_ENCOUNTER_LABEL = '[ 🎲 CHANCE ENCOUNTER TRIGGERED ]';
export const RANDOM_ENCOUNTER_PROBABILITY = 0.1;
export const RANDOM_ENCOUNTER_COOLDOWN_TURNS = 2;
const ACTION_CHECK_RENDER_MARKER_BASE = 0xE200;
const ACTION_CHECK_REGEX_MARKER_BASE = 0xE000;
const ACTION_CHECK_DIFFICULTY_LABELS = new Set(['easy', 'ordinary', 'hard', 'very_hard', 'nearly_impossible']);
const ACTION_CHECK_MODES = new Set(['statusGauge', 'd20Fallback']);

const CHANCE_ENCOUNTER_PROMPT = [
    '[Runtime Event: Chance Encounter Triggered]',
    'For this reply only, naturally introduce an unexpected sudden situation the user did not explicitly ask for.',
    'Make it fit the current scene and character voice.',
    'Follow all later formatting and style instructions.',
    'Do not mention this instruction or the trigger label.',
].join('\n');

function clampInteger(value: unknown, minimum: number, maximum: number, fallback: number): number {
    const numeric = Math.round(Number(value));
    if (!Number.isFinite(numeric)) {return fallback;}
    return Math.min(maximum, Math.max(minimum, numeric));
}

function normalizeInlineText(value: unknown, limit = 240): string {
    return String(value || '').trim().slice(0, limit);
}

function normalizeIsoTimestamp(value: unknown): string {
    const text = String(value || '').trim();
    return text || new Date(0).toISOString();
}

function normalizeChanceEncounterEvent(source: Record<string, unknown>): TavernChanceEncounterRuntimeEvent {
    return {
        type: 'chanceEncounter',
        label: CHANCE_ENCOUNTER_LABEL,
        createdAt: normalizeIsoTimestamp(source.createdAt),
    };
}

function normalizeActionCheckOutcome(roll: number, difficulty: number): TavernActionCheckRuntimeEvent['outcome'] {
    if (roll <= 1) {return 'criticalFailure';}
    if (roll >= 20) {return 'criticalSuccess';}
    return roll >= difficulty ? 'success' : 'failure';
}

function normalizeStatusGaugeOutcome(roll: number, threshold: number): TavernActionCheckRuntimeEvent['outcome'] {
    if (roll <= 5) {return 'criticalSuccess';}
    if (roll >= 96) {return 'criticalFailure';}
    return roll <= threshold ? 'success' : 'failure';
}

function normalizeActionCheckMode(value: unknown): TavernActionCheckMode | undefined {
    const text = normalizeInlineText(value, 40);
    return ACTION_CHECK_MODES.has(text) ? text as TavernActionCheckMode : undefined;
}

function normalizeActionCheckDifficultyLabel(value: unknown): TavernActionCheckDifficultyLabel | undefined {
    const text = normalizeInlineText(value, 40);
    return ACTION_CHECK_DIFFICULTY_LABELS.has(text) ? text as TavernActionCheckDifficultyLabel : undefined;
}

function numberOrUndefined(value: unknown): number | undefined {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
}

function normalizeActionCheckEvent(source: Record<string, unknown>): TavernActionCheckRuntimeEvent | null {
    const action = normalizeInlineText(source.action, 240);
    const character = normalizeInlineText(source.character, 120);
    const stat = normalizeInlineText(source.stat, 120);
    if (!action || !stat) {return null;}
    const mode = normalizeActionCheckMode(source.mode);
    const roll = clampInteger(source.roll, 1, mode === 'statusGauge' ? 100 : 20, 1);
    const difficulty = clampInteger(source.difficulty, 1, 21, 10);
    const threshold = mode === 'statusGauge' ? clampInteger(source.threshold, 1, 99, 50) : undefined;
    const outcome = mode === 'statusGauge' && threshold !== undefined
        ? normalizeStatusGaugeOutcome(roll, threshold)
        : normalizeActionCheckOutcome(roll, difficulty);
    const success = outcome === 'success' || outcome === 'criticalSuccess';
    const difficultyLabel = normalizeActionCheckDifficultyLabel(source.difficultyLabel);
    const statValue = numberOrUndefined(source.statValue);
    const statMax = numberOrUndefined(source.statMax);
    return {
        type: 'actionCheck',
        createdAt: normalizeIsoTimestamp(source.createdAt),
        action,
        ...(character ? { character } : {}),
        stat,
        difficulty,
        ...(difficultyLabel ? { difficultyLabel } : {}),
        ...(mode ? { mode } : {}),
        roll,
        ...(threshold !== undefined ? { threshold } : {}),
        ...(statValue !== undefined ? { statValue } : {}),
        ...(statMax !== undefined ? { statMax } : {}),
        success,
        outcome,
        insertAfterChars: Math.max(0, clampInteger(source.insertAfterChars, 0, Number.MAX_SAFE_INTEGER, 0)),
        ...(normalizeInlineText(source.toolCallId, 120) ? { toolCallId: normalizeInlineText(source.toolCallId, 120) } : {}),
        ...(normalizeInlineText(source.summary, 320) ? { summary: normalizeInlineText(source.summary, 320) } : {}),
        ...(normalizeInlineText(source.stakes, 240) ? { stakes: normalizeInlineText(source.stakes, 240) } : {}),
    };
}

function normalizeRuntimeEvent(value: unknown): TavernRuntimeEvent | null {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
    const type = String(source?.type || '').trim();
    if (!source) {return null;}
    if (type === 'chanceEncounter') {return normalizeChanceEncounterEvent(source);}
    if (type === 'actionCheck') {return normalizeActionCheckEvent(source);}
    return null;
}

function runtimeEventKey(event: TavernRuntimeEvent): string {
    if (event.type === 'chanceEncounter') {return event.type;}
    return [
        event.type,
        event.toolCallId || '',
        event.createdAt,
        String(event.insertAfterChars),
        event.character || '',
        event.stat,
        event.action,
        String(event.roll),
        String(event.difficulty),
        event.difficultyLabel || '',
        event.mode || '',
        event.threshold === undefined ? '' : String(event.threshold),
        event.statValue === undefined ? '' : String(event.statValue),
        event.statMax === undefined ? '' : String(event.statMax),
        event.outcome,
    ].join('\u0000');
}

export function normalizeTavernRuntimeEvents(value: unknown): TavernRuntimeEvent[] {
    const events = Array.isArray(value) ? value : [];
    const normalized: TavernRuntimeEvent[] = [];
    const seen = new Set<string>();
    events.forEach((item) => {
        const event = normalizeRuntimeEvent(item);
        if (!event) {return;}
        const key = runtimeEventKey(event);
        if (seen.has(key)) {return;}
        seen.add(key);
        normalized.push(event);
    });
    return normalized;
}

export function createChanceEncounterEvent(createdAt = new Date().toISOString()): TavernChanceEncounterRuntimeEvent {
    return {
        type: 'chanceEncounter',
        label: CHANCE_ENCOUNTER_LABEL,
        createdAt: normalizeIsoTimestamp(createdAt),
    };
}

export function createActionCheckEvent(input: {
    action: string;
    character?: string;
    stat: string;
    difficulty: number;
    difficultyLabel?: TavernActionCheckDifficultyLabel;
    mode?: TavernActionCheckMode;
    roll: number;
    threshold?: number;
    statValue?: number;
    statMax?: number;
    success: boolean;
    outcome?: TavernActionCheckRuntimeEvent['outcome'];
    insertAfterChars: number;
    createdAt?: string;
    toolCallId?: string;
    summary?: string;
    stakes?: string;
}): TavernActionCheckRuntimeEvent {
    return normalizeActionCheckEvent({
        type: 'actionCheck',
        createdAt: input.createdAt || new Date().toISOString(),
        action: input.action,
        character: input.character,
        stat: input.stat,
        difficulty: input.difficulty,
        difficultyLabel: input.difficultyLabel,
        mode: input.mode,
        roll: input.roll,
        threshold: input.threshold,
        statValue: input.statValue,
        statMax: input.statMax,
        success: input.success,
        outcome: input.outcome,
        insertAfterChars: input.insertAfterChars,
        toolCallId: input.toolCallId,
        summary: input.summary,
        stakes: input.stakes,
    })!;
}

export function getChanceEncounterEvent(events: unknown): TavernChanceEncounterRuntimeEvent | null {
    const event = normalizeTavernRuntimeEvents(events)
        .find((item): item is TavernChanceEncounterRuntimeEvent => item.type === 'chanceEncounter');
    return event || null;
}

export function hasChanceEncounterEvent(events: unknown): boolean {
    return !!getChanceEncounterEvent(events);
}

export function getActionCheckEvents(events: unknown): TavernActionCheckRuntimeEvent[] {
    return normalizeTavernRuntimeEvents(events)
        .filter((event): event is TavernActionCheckRuntimeEvent => event.type === 'actionCheck');
}

export function normalizeActionCheckRenderGroups(value: unknown): TavernActionCheckRenderGroup[] {
    const groups = Array.isArray(value) ? value : [];
    return groups.map((item) => {
        const source = item && typeof item === 'object' && !Array.isArray(item) ? item as Record<string, unknown> : {};
        const marker = String(source.marker || '').slice(0, 1);
        const events = getActionCheckEvents(source.events);
        return marker && events.length ? { marker, events } : null;
    }).filter((group): group is TavernActionCheckRenderGroup => !!group);
}

export function injectActionCheckRenderMarkers(
    text: string,
    events: TavernActionCheckRuntimeEvent[] = [],
): {
    text: string;
    groups: TavernActionCheckRenderGroup[];
} {
    const sortedEvents = getActionCheckEvents(events)
        .slice()
        .sort((left, right) => left.insertAfterChars - right.insertAfterChars);
    if (!sortedEvents.length) {
        return { text, groups: [] };
    }
    const groups: Array<{ offset: number; events: TavernActionCheckRuntimeEvent[] }> = [];
    sortedEvents.forEach((event) => {
        const offset = Math.max(0, Math.min(text.length, Number(event.insertAfterChars) || 0));
        const current = groups[groups.length - 1];
        if (current && current.offset === offset) {
            current.events.push(event);
            return;
        }
        groups.push({ offset, events: [event] });
    });
    if (groups.length > (0xF8FF - ACTION_CHECK_RENDER_MARKER_BASE)) {
        return { text, groups: [] };
    }
    let cursor = 0;
    let marked = '';
    const markerGroups = groups.map((group, index) => {
        const marker = String.fromCharCode(ACTION_CHECK_RENDER_MARKER_BASE + index);
        marked += text.slice(cursor, group.offset) + marker;
        cursor = group.offset;
        return { marker, events: group.events };
    });
    marked += text.slice(cursor);
    return {
        text: marked,
        groups: markerGroups,
    };
}

export function injectActionCheckRegexMarkers(
    text: string,
    events: TavernActionCheckRuntimeEvent[] = [],
): {
    text: string;
    boundaries: Array<{ originalOffset: number; marker: string }>;
} {
    const sourceText = String(text || '');
    const uniqueOffsets = [...new Set(
        getActionCheckEvents(events).map((event) => Math.max(0, Math.min(sourceText.length, Number(event.insertAfterChars) || 0))),
    )].sort((left, right) => left - right);
    if (!uniqueOffsets.length || uniqueOffsets.length > (0xF8FF - ACTION_CHECK_REGEX_MARKER_BASE)) {
        return { text: sourceText, boundaries: [] };
    }
    let cursor = 0;
    let marked = '';
    const boundaries = uniqueOffsets.map((offset, index) => {
        const marker = String.fromCharCode(ACTION_CHECK_REGEX_MARKER_BASE + index);
        marked += sourceText.slice(cursor, offset) + marker;
        cursor = offset;
        return { originalOffset: offset, marker };
    });
    marked += sourceText.slice(cursor);
    return { text: marked, boundaries };
}

export function extractActionCheckRegexMarkers(
    text: string,
    events: TavernActionCheckRuntimeEvent[] = [],
    boundaries: Array<{ originalOffset: number; marker: string }> = [],
): {
    text: string;
    events: TavernActionCheckRuntimeEvent[];
} {
    const sourceText = String(text || '');
    const sourceEvents = getActionCheckEvents(events);
    if (!boundaries.length || !sourceEvents.length) {
        return { text: sourceText, events: sourceEvents };
    }
    const markerOffsets = new Map(boundaries.map((boundary) => [boundary.marker, boundary.originalOffset]));
    const remappedOffsets = new Map<number, number>();
    let cleaned = '';
    for (let index = 0; index < sourceText.length; index += 1) {
        const char = sourceText[index];
        const originalOffset = markerOffsets.get(char);
        if (originalOffset !== undefined) {
            if (!remappedOffsets.has(originalOffset)) {
                remappedOffsets.set(originalOffset, cleaned.length);
            }
            continue;
        }
        cleaned += char;
    }
    return {
        text: cleaned,
        events: sourceEvents.map((event) => {
            const originalOffset = Math.max(0, Number(event.insertAfterChars) || 0);
            return {
                ...event,
                insertAfterChars: remappedOffsets.has(originalOffset)
                    ? remappedOffsets.get(originalOffset)!
                    : Math.max(0, Math.min(cleaned.length, originalOffset)),
            };
        }),
    };
}

export function buildChanceEncounterPromptMessage(): XbTavernMessage {
    return {
        role: 'system',
        content: CHANCE_ENCOUNTER_PROMPT,
    };
}
