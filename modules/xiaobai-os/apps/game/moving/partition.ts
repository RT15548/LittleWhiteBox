import type { PartitionRegistration } from '../../../kernel/contracts.js';
import { CHAPTER_LEVELS, CHALLENGE_SHAPE, materializePuzzle } from './levels.js';
import { classifyChallenge } from './difficulty.js';
import { analyzePuzzle } from './puzzle.js';
import { challengeProgress, completedStages, emptyMoving, movingFault, replayRun, runStatus, type MovingCommand, type MovingData } from './domain.js';
import { ITEM_KINDS, type ItemKind, type MovingLevel } from './types.js';

function matchesLevel(value: Record<string, unknown>, expected: MovingLevel): boolean {
    if (value.id !== expected.id || value.key !== expected.key || value.seed !== expected.seed
        || !Array.isArray(value.items) || value.items.length !== expected.items.length
        || !Array.isArray(value.stacks) || value.stacks.length !== expected.stacks.length) { return false; }
    return value.items.every((raw, index) => {
        const item = record(raw), target = expected.items[index];
        return item.id === target.id && item.kind === target.kind && item.above === target.above
            && Array.isArray(item.position) && item.position.length === target.position.length
            && item.position.every((coordinate, axis) => coordinate === target.position[axis]);
    }) && value.stacks.every((stack, index) => Array.isArray(stack) && stack.length === expected.stacks[index].length
        && stack.every((id, depth) => id === expected.stacks[index][depth]));
}

function record(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { movingFault('invalid'); }
    return value as Record<string, unknown>;
}
export function movingId(value: unknown): string {
    if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(value)) { movingFault('identity'); }
    return value;
}
export function parseMovingCommand(value: unknown): MovingCommand {
    const input = record(value);
    switch (input.type) {
        case 'start':
            if (!Number.isInteger(input.stage) || Number(input.stage) < 0 || Number(input.stage) >= CHAPTER_LEVELS.length) { movingFault('invalid'); }
            return { type: 'start', stage: input.stage as number };
        case 'pick': return { type: 'pick', id: movingId(input.id) };
        case 'challenge': case 'undo': case 'restart': case 'abandon': return { type: input.type };
        default: return movingFault('invalid');
    }
}

export function validateMovingData(value: unknown): asserts value is MovingData {
    const input = record(value);
    if (!Number.isSafeInteger(input.revision) || Number(input.revision) < 0 || !Array.isArray(input.receipts)) { movingFault('invalid'); }
    if (input.revision === 0 ? input.last !== null : !input.last) { movingFault('invalid'); }
    if (input.last !== null) { const last = record(input.last); movingId(last.id); parseMovingCommand(last.command); }
    const runIds = new Set<string>();
    for (const entry of input.receipts) {
        const r = record(entry); const id = movingId(r.runId);
        if (runIds.has(id)) { movingFault('invalid'); } runIds.add(id);
        if (r.stage !== null && (!Number.isInteger(r.stage) || Number(r.stage) < 0 || Number(r.stage) >= CHAPTER_LEVELS.length)) { movingFault('invalid'); }
        if (r.stage === null) { movingId(r.admissionAction); }
        else if (r.admissionAction !== null || !r.settlement) { movingFault('invalid'); }
        if (r.settlement !== null) {
            const settlement = record(r.settlement); movingId(settlement.actionId);
            if (!['won', 'lost', 'abandoned'].includes(String(settlement.outcome)) || r.stage !== null && settlement.outcome !== 'won') { movingFault('invalid'); }
        }
    }
    const data = value as MovingData;
    if (completedStages(data).some((stage, index) => stage !== index)) { movingFault('invalid'); }
    if (input.active !== null) {
        const active = record(input.active); movingId(active.id);
        if (typeof active.abandoned !== 'boolean' || !Array.isArray(active.moves)) { movingFault('invalid'); }
        active.moves.forEach(movingId);
        const level = record(active.level);
        if (active.stage !== null) {
            if (!Number.isInteger(active.stage) || Number(active.stage) < 0 || Number(active.stage) >= CHAPTER_LEVELS.length
                || Number(active.stage) > completedStages(data).length
                || !matchesLevel(level, CHAPTER_LEVELS[Number(active.stage)])) { movingFault('invalid'); }
        } else {
            if (completedStages(data).length !== CHAPTER_LEVELS.length || level.id !== 'witch'
                || !Number.isSafeInteger(level.seed) || Number(level.seed) < 0 || Number(level.seed) > 0xffffffff
                || typeof level.key !== 'string' || !Array.isArray(level.stacks) || level.stacks.length !== CHALLENGE_SHAPE.lanes || !Array.isArray(level.items)) { movingFault('invalid'); }
            const items = level.items.map(record);
            const stacks = level.stacks.map(stack => {
                if (!Array.isArray(stack) || stack.length !== CHALLENGE_SHAPE.depth) { movingFault('invalid'); }
                return stack.map(id => {
                    const item = items.find(entry => entry.id === id);
                    if (!item || !ITEM_KINDS.includes(item.kind as ItemKind)) { movingFault('invalid'); }
                    return item.kind as ItemKind;
                });
            });
            const canonical = materializePuzzle(stacks, 'witch', level.key, Number(level.seed));
            if (!matchesLevel(level, canonical) || classifyChallenge(analyzePuzzle(stacks)) !== challengeProgress(data).activeTier) { movingFault('invalid'); }
        }
        const run = data.active!;
        if (run.moves.length > run.level.items.length) { movingFault('invalid'); }
        replayRun(run);
        if (run.stage === null) {
            const receipt = data.receipts.find(entry => entry.runId === run.id);
            const status = runStatus(run);
            if (!receipt || receipt.stage !== null || (status === 'playing' ? receipt.settlement !== null : receipt.settlement?.outcome !== status)) { movingFault('invalid'); }
        }
    }
    if (data.receipts.some(r => r.settlement === null && (data.active?.id !== r.runId || runStatus(data.active) !== 'playing'))) { movingFault('invalid'); }
}

export const MOVING_PARTITION: PartitionRegistration<MovingData> = {
    key: 'moving', ownerId: 'game', storage: 'user', schemaVersion: 1,
    createInitial: emptyMoving,
    parse(value) {
        try { validateMovingData(value); return { ok: true, value: structuredClone(value) }; }
        catch (error) { return { ok: false, error: { code: 'partition_invalid', message: error instanceof Error ? error.message : 'moving_invalid' } }; }
    },
    serialize(value) { validateMovingData(value); return structuredClone(value); },
};
