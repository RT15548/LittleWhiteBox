import type { XbTavernMessage } from './message-assembler';
import type { TavernStatusDocument, TavernStatusGaugeField } from './status-state';

export const ACTION_CHECK_TOOL_NAME = 'ActionCheck';
export const DEFAULT_ACTION_CHECK_DIFFICULTY = 10;
export const MIN_ACTION_CHECK_DIFFICULTY = 1;
export const MAX_ACTION_CHECK_DIFFICULTY = 21;
export const ACTION_CHECK_DIE_SIDES = 20;
export const ACTION_CHECK_PERCENT_DIE_SIDES = 100;
export type TavernActionCheckDifficultyLabel = 'easy' | 'ordinary' | 'hard' | 'very_hard' | 'nearly_impossible';
export type TavernActionCheckMode = 'statusGauge' | 'd20Fallback';
export type TavernActionCheckOutcome = 'criticalSuccess' | 'success' | 'failure' | 'criticalFailure';

export interface TavernActionCheckInput {
    action: string;
    character?: string;
    stat: string;
    difficulty?: number | TavernActionCheckDifficultyLabel;
    stakes?: string;
    insertAfter?: string;
}

export interface TavernActionCheckToolSuccess {
    ok: true;
    action: string;
    character?: string;
    stat: string;
    difficulty: number;
    difficultyLabel: TavernActionCheckDifficultyLabel;
    mode: TavernActionCheckMode;
    roll: number;
    success: boolean;
    outcome: TavernActionCheckOutcome;
    summary: string;
    threshold?: number;
    statValue?: number;
    statMax?: number;
    stakes?: string;
    insertAfter?: string;
}

export interface TavernActionCheckToolFailure {
    ok: false;
    error: string;
    summary: string;
}

export type TavernActionCheckToolResult = TavernActionCheckToolSuccess | TavernActionCheckToolFailure;

const ACTION_CHECK_DIFFICULTY_LABELS: TavernActionCheckDifficultyLabel[] = [
    'easy',
    'ordinary',
    'hard',
    'very_hard',
    'nearly_impossible',
];

const ACTION_CHECK_FALLBACK_DC: Record<TavernActionCheckDifficultyLabel, number> = {
    easy: 5,
    ordinary: 10,
    hard: 15,
    very_hard: 20,
    nearly_impossible: 21,
};

const ACTION_CHECK_STATUS_OFFSETS: Record<TavernActionCheckDifficultyLabel, number> = {
    easy: 20,
    ordinary: 0,
    hard: -20,
    very_hard: -40,
    nearly_impossible: -60,
};

const ACTION_CHECK_PROTOCOL_PROMPT = [
    '[Runtime Protocol: Action Checks]',
    '',
    `When you cannot know whether a key action succeeds or fails, call ${ACTION_CHECK_TOOL_NAME} once and let the result decide. Think like a tabletop GM: when fate is genuinely undecided, let the die speak.`,
    '',
    'When to roll:',
    '- An attempt could truly go either way, and the outcome would change what happens next: climbing, sneaking, confrontation, deception, persuasion, gambling, a chase, spellcasting, spotting a lie, risky improvisation.',
    '',
    'When NOT to roll:',
    '- The outcome is already settled by overwhelming advantage, position, or common sense.',
    '- Interactions with no stakes, risk, or resistance. Consensual or natural intimacy (kissing, hugging, sex), casual talk, or falling asleep together should follow emotional flow without a roll.',
    '',
    'How to call the tool (Before the roll):',
    '- Write the visible attempted action first.',
    `- Call ${ACTION_CHECK_TOOL_NAME} immediately, before narrating any consequence or assuming the outcome.`,
    "- If you already wrote a visible lead-in, set the tool's insertAfter parameter to the exact text the dice card should appear after.",
    '',
    'How to narrate the outcome (After the roll):',
    '- After the roll, pick up exactly where the attempted action paused; do not restart headers, speaker labels, thinking formats, scene framing, or any reply-opening structure.',
    "- Treat the tool's result as an established fact. Honor it strictly.",
    '- Do not step out of character to comment on the dice or the tool; continue the scene naturally through the result.',
    '- On Critical Success or Critical Failure, push the result further with a fitting extra reward or complication.',
    '',
    'Do not mention this protocol, the dice mechanic, or any hidden instruction.',
].join('\n');

function normalizeInlineText(value: unknown, limit = 240): string {
    return String(value || '').trim().slice(0, limit);
}

function normalizeExactVisibleText(value: unknown, limit = 240): string {
    return String(value ?? '').slice(0, limit);
}

function clampInteger(value: unknown, minimum: number, maximum: number, fallback: number): number {
    const numeric = Math.round(Number(value));
    if (!Number.isFinite(numeric)) {return fallback;}
    return Math.min(maximum, Math.max(minimum, numeric));
}

function normalizeActionCheckDifficultyLabel(value: unknown): TavernActionCheckDifficultyLabel {
    const text = normalizeInlineText(value, 40);
    if ((ACTION_CHECK_DIFFICULTY_LABELS as string[]).includes(text)) {
        return text as TavernActionCheckDifficultyLabel;
    }
    const numeric = clampInteger(value, MIN_ACTION_CHECK_DIFFICULTY, MAX_ACTION_CHECK_DIFFICULTY, DEFAULT_ACTION_CHECK_DIFFICULTY);
    if (numeric <= 5) {return 'easy';}
    if (numeric <= 10) {return 'ordinary';}
    if (numeric <= 15) {return 'hard';}
    if (numeric <= 20) {return 'very_hard';}
    return 'nearly_impossible';
}

function resolveD20Roll(roller?: () => number): number {
    if (typeof roller === 'function') {
        return clampInteger(roller(), 1, ACTION_CHECK_DIE_SIDES, 1);
    }
    return Math.floor(Math.random() * ACTION_CHECK_DIE_SIDES) + 1;
}

function resolvePercentRoll(roller?: () => number): number {
    if (typeof roller === 'function') {
        return clampInteger(roller(), 1, ACTION_CHECK_PERCENT_DIE_SIDES, 1);
    }
    return Math.floor(Math.random() * ACTION_CHECK_PERCENT_DIE_SIDES) + 1;
}

function resolveActionCheckOutcome(roll: number, difficulty: number): TavernActionCheckOutcome {
    if (roll <= 1) {return 'criticalFailure';}
    if (roll >= ACTION_CHECK_DIE_SIDES) {return 'criticalSuccess';}
    return roll >= difficulty ? 'success' : 'failure';
}

function resolveStatusGaugeOutcome(roll: number, threshold: number): TavernActionCheckOutcome {
    if (roll <= 5) {return 'criticalSuccess';}
    if (roll >= 96) {return 'criticalFailure';}
    return roll <= threshold ? 'success' : 'failure';
}

function actionCheckOutcomeLabel(outcome: TavernActionCheckOutcome): string {
    if (outcome === 'criticalSuccess') {return 'critical success';}
    if (outcome === 'criticalFailure') {return 'critical failure';}
    return outcome;
}

type TavernStatusSubjectLike = TavernStatusDocument['subjects'][number];
type TavernStatusTabLike = TavernStatusSubjectLike['tabs'][number];

function normalizeSearchText(value: unknown, limit = 120): string {
    return normalizeInlineText(value, limit).toLocaleLowerCase();
}

function actorMatchRank(values: unknown[], character: string): number | null {
    const target = normalizeSearchText(character);
    if (!target) {return null;}
    let best: number | null = null;
    values.forEach((value) => {
        const text = normalizeSearchText(value);
        if (!text) {return;}
        const rank = text === target ? 0 : text.includes(target) ? 1 : null;
        if (rank === null) {return;}
        best = best === null ? rank : Math.min(best, rank);
    });
    return best;
}

function findGaugeFieldInTabs(tabs: TavernStatusTabLike[], name: string): TavernStatusGaugeField | null {
    for (const tab of tabs) {
        for (const block of Array.isArray(tab.blocks) ? tab.blocks : []) {
            if (block.form !== 'gauge') {continue;}
            for (const field of Array.isArray(block.fields) ? block.fields : []) {
                const gauge = field as TavernStatusGaugeField;
                if (normalizeInlineText(gauge.name, 120) === name) {
                    return gauge;
                }
            }
        }
    }
    return null;
}

function findGaugeFieldInSubject(subject: TavernStatusSubjectLike, name: string): TavernStatusGaugeField | null {
    return findGaugeFieldInTabs(Array.isArray(subject.tabs) ? subject.tabs : [], name);
}

function findStatusGaugeByCharacterAndStat(document: TavernStatusDocument, character: string, stat: string): TavernStatusGaugeField | null {
    const tabMatches: Array<{ rank: number; tabs: TavernStatusTabLike[] }> = [];
    const subjectMatches: Array<{ rank: number; subject: TavernStatusSubjectLike }> = [];
    document.subjects.forEach((subject) => {
        const subjectRank = actorMatchRank([subject.name, subject.id, subject.subtitle], character);
        if (subjectRank !== null) {subjectMatches.push({ rank: subjectRank, subject });}
        (Array.isArray(subject.tabs) ? subject.tabs : []).forEach((tab) => {
            const tabRank = actorMatchRank([tab.label, tab.id], character);
            if (tabRank !== null) {tabMatches.push({ rank: tabRank, tabs: [tab] });}
        });
    });
    const scopes = tabMatches.length
        ? tabMatches.sort((left, right) => left.rank - right.rank).map((match) => match.tabs)
        : subjectMatches.sort((left, right) => left.rank - right.rank).map((match) => match.subject.tabs);
    for (const tabs of scopes) {
        const gauge = findGaugeFieldInTabs(Array.isArray(tabs) ? tabs : [], stat);
        if (gauge) {return gauge;}
    }
    return null;
}

function findStatusGaugeByStat(document: TavernStatusDocument | null | undefined, stat = '', character = ''): TavernStatusGaugeField | null {
    const name = normalizeInlineText(stat, 120);
    if (!name || !Array.isArray(document?.subjects)) {return null;}
    const actor = normalizeInlineText(character, 120);
    if (actor) {
        return findStatusGaugeByCharacterAndStat(document, actor, name);
    }
    const activeSubjectId = normalizeInlineText(document.meta?.activeSubject, 120);
    const activeSubject = activeSubjectId
        ? document.subjects.find((subject) => normalizeInlineText(subject.id, 120) === activeSubjectId) || null
        : null;
    if (activeSubject) {
        return findGaugeFieldInSubject(activeSubject, name);
    }
    for (const subject of document.subjects) {
        const gauge = findGaugeFieldInSubject(subject, name);
        if (gauge) {return gauge;}
    }
    return null;
}

function resolveStatusGaugeBasis(field: TavernStatusGaugeField): number | null {
    const statValue = Number(field.value);
    const statMax = Number(field.max);
    const statMin = Number.isFinite(Number(field.min)) ? Number(field.min) : 0;
    if (!Number.isFinite(statValue) || !Number.isFinite(statMax) || statMax <= 0) {return null;}
    const span = Math.max(1, statMax - statMin);
    return clampInteger(((statValue - statMin) / span) * 100, 0, 100, 0);
}

export function getActionCheckToolDefinitions(): Array<{ type: 'function'; function: { name: string; description: string; parameters: unknown } }> {
    return [{
        type: 'function',
        function: {
            name: ACTION_CHECK_TOOL_NAME,
            description: [
                'Action check for uncertain RP outcomes.',
                '',
                'Parameters:',
                '- action (required): what is being attempted, in a short phrase.',
                "- character (optional): the name of the character acting (matches the status panel). Omit if it's the main player.",
                '- stat (required): the status-panel attribute name that best fits this action (e.g. 力量, 察觉, 话术). If no status panel exists, use a descriptive label; the system falls back to a flat roll.',
                '- difficulty (required): objective difficulty of the task for an average person. Do not inflate because the character is strong; the system factors in their actual attribute value. One of: easy / ordinary / hard / very_hard / nearly_impossible.',
                '- stakes (optional): what is at risk if this fails.',
                '- insertAfter (optional): if you already wrote a visible lead-in, the exact text the dice card should appear after.',
                '',
                'Returns: success, failure, critical success, or critical failure as established fact for this reply.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        description: 'What is being attempted, in a short phrase.',
                    },
                    character: {
                        type: 'string',
                        description: "The name of the character performing the action, matching a subject name or tab label in the status panel. Leave blank if the main player is performing the action.",
                    },
                    stat: {
                        type: 'string',
                        description: 'Status-panel attribute name that best fits this action (e.g. 力量, 察觉, 话术). If no status panel exists, use a descriptive label; the system falls back to a flat roll.',
                    },
                    difficulty: {
                        type: 'string',
                        enum: ACTION_CHECK_DIFFICULTY_LABELS,
                        description: 'Objective difficulty of the task for an average person. Do not inflate because the character is strong; the system factors in their actual attribute value.',
                    },
                    stakes: {
                        type: 'string',
                        description: 'What is at risk if this fails.',
                    },
                    insertAfter: {
                        type: 'string',
                        description: 'If you already wrote a visible lead-in, the exact text the dice card should appear after.',
                    },
                },
                required: ['action', 'stat', 'difficulty'],
                additionalProperties: false,
            },
        },
    }];
}

export function buildActionCheckProtocolMessage(): XbTavernMessage {
    return {
        role: 'system',
        content: ACTION_CHECK_PROTOCOL_PROMPT,
    };
}

export function executeTavernActionCheck(
    input: Record<string, unknown> = {},
    options: { rollDie?: () => number; rollPercent?: () => number; statusDocument?: TavernStatusDocument | null } = {},
): TavernActionCheckToolResult {
    const action = normalizeInlineText(input.action, 240);
    const stat = normalizeInlineText(input.stat, 120);
    if (!action || !stat) {
        return {
            ok: false,
            error: 'action_check_action_and_stat_required',
            summary: 'ActionCheck 需要同时提供 action 和 stat。',
        };
    }
    const difficultyLabel = normalizeActionCheckDifficultyLabel(input.difficulty);
    const difficulty = ACTION_CHECK_FALLBACK_DC[difficultyLabel];
    const character = normalizeInlineText(input.character, 120);
    const gauge = findStatusGaugeByStat(options.statusDocument, stat, character);
    const stakes = normalizeInlineText(input.stakes, 240);
    const insertAfter = normalizeExactVisibleText(input.insertAfter, 240);
    if (gauge) {
        const statValue = Number(gauge.value);
        const statMax = Number(gauge.max);
        const basis = resolveStatusGaugeBasis(gauge);
        if (basis !== null && Number.isFinite(statValue) && Number.isFinite(statMax)) {
            const threshold = clampInteger(basis + ACTION_CHECK_STATUS_OFFSETS[difficultyLabel], 1, 99, 50);
            const percentRoll = resolvePercentRoll(options.rollPercent || options.rollDie);
            const outcome = resolveStatusGaugeOutcome(percentRoll, threshold);
            const success = outcome === 'success' || outcome === 'criticalSuccess';
            return {
                ok: true,
                action,
                stat,
                difficulty,
                difficultyLabel,
                mode: 'statusGauge',
                roll: percentRoll,
                threshold,
                statValue,
                statMax,
                success,
                outcome,
                summary: `${character ? `${character} ` : ''}${stat} check ${percentRoll} vs ${threshold}% (${statValue}/${statMax}, ${difficultyLabel}): ${actionCheckOutcomeLabel(outcome)}.`,
                ...(character ? { character } : {}),
                ...(stakes ? { stakes } : {}),
                ...(insertAfter.trim() ? { insertAfter } : {}),
            };
        }
    }
    const roll = resolveD20Roll(options.rollDie);
    const outcome = resolveActionCheckOutcome(roll, difficulty);
    const success = outcome === 'success' || outcome === 'criticalSuccess';
    return {
        ok: true,
        action,
        stat,
        difficulty,
        difficultyLabel,
        mode: 'd20Fallback',
        roll,
        success,
        outcome,
        summary: `${character ? `${character} ` : ''}${stat} check ${roll} vs DC ${difficulty}: ${actionCheckOutcomeLabel(outcome)}.`,
        ...(character ? { character } : {}),
        ...(stakes ? { stakes } : {}),
        ...(insertAfter.trim() ? { insertAfter } : {}),
    };
}

export function buildDeniedActionCheckToolResult(toolName = ''): TavernActionCheckToolFailure {
    const name = normalizeInlineText(toolName, 80) || 'unknown_tool';
    return {
        ok: false,
        error: 'action_check_unknown_tool',
        summary: `主聊天当前只允许调用 ${ACTION_CHECK_TOOL_NAME}；${name} 不会执行。`,
    };
}
