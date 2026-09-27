import { CHAPTER_LEVELS } from './levels.js';
import { actMoving, movingStatus, startMoving } from './rules.js';
import type { MovingLevel, MovingState } from './types.js';
import { challengeProgressForWins } from './difficulty.js';

export type MovingCommand = { type: 'start'; stage: number } | { type: 'challenge' } | { type: 'pick'; id: string }
    | { type: 'undo' } | { type: 'restart' } | { type: 'abandon' };
export interface MovingRun {
    id: string;
    stage: number | null;
    level: MovingLevel;
    moves: string[];
    abandoned: boolean;
}
export interface MovingReceipt {
    runId: string;
    stage: number | null;
    admissionAction: string | null;
    settlement: { actionId: string; outcome: 'won' | 'lost' | 'abandoned' } | null;
}
export interface MovingData {
    revision: number;
    last: { id: string; command: MovingCommand } | null;
    receipts: MovingReceipt[];
    active: MovingRun | null;
}
export type MovingFault = 'locked' | 'active' | 'finished' | 'blocked' | 'missing' | 'noUndo' | 'paidRule'
    | 'stale' | 'identity' | 'invalid' | 'generation' | 'funds' | 'unavailable';
export function movingFault(code: MovingFault): never {
    throw Object.assign(new Error(`moving_${code}`), { code: `moving_${code}` });
}
export function emptyMoving(): MovingData { return { revision: 0, last: null, receipts: [], active: null }; }
export function completedStages(data: MovingData): number[] {
    return data.receipts.flatMap(receipt => receipt.stage !== null ? [receipt.stage] : []).sort((a, b) => a - b);
}
export function challengeProgress(data: MovingData) {
    const wins = data.receipts.filter(receipt => receipt.stage === null && receipt.settlement?.outcome === 'won');
    // The winning board keeps its admission tier; its receipt advances only the next admission.
    const activeWon = wins.some(receipt => receipt.runId === data.active?.id);
    return { ...challengeProgressForWins(wins.length), activeTier: data.active?.stage === null
        ? challengeProgressForWins(wins.length - Number(activeWon)).tier : null };
}
export function replayRun(run: MovingRun): MovingState {
    let board = startMoving(run.level);
    for (const id of run.moves) {
        const result = actMoving(run.level, board, { type: 'pick', id });
        if (!result.ok) { movingFault('invalid'); }
        board = result.state;
    }
    return board;
}
export function runStatus(run: MovingRun) { return run.abandoned ? 'abandoned' : movingStatus(replayRun(run)); }

/** The same pure transition is used by Host and tests; no client-provided outcome or prize. */
export function advanceMoving(previous: MovingData, command: MovingCommand, actionId: string,
    prepared?: { id: string; level: MovingLevel }): MovingData {
    const data = structuredClone(previous);
    const active = data.active;
    if (command.type === 'start' || command.type === 'challenge') {
        if (active?.stage === null && runStatus(active) === 'playing') { movingFault('active'); }
        if (command.type === 'start') {
            if (!Number.isInteger(command.stage) || command.stage < 0 || command.stage >= CHAPTER_LEVELS.length) { movingFault('invalid'); }
            if (command.stage > completedStages(data).length) { movingFault('locked'); }
        } else if (completedStages(data).length !== CHAPTER_LEVELS.length) { movingFault('locked'); }
        if (!prepared) { movingFault('invalid'); }
        if (data.receipts.some(receipt => receipt.runId === prepared.id) || active?.id === prepared.id) { movingFault('identity'); }
        data.active = { id: prepared.id, stage: command.type === 'start' ? command.stage : null,
            level: prepared.level, moves: [], abandoned: false };
        if (command.type === 'challenge') {
            data.receipts.push({ runId: prepared.id, stage: null, admissionAction: actionId, settlement: null });
        }
    } else {
        if (!active) { movingFault('missing'); }
        const status = runStatus(active);
        if (command.type === 'restart' || command.type === 'undo') {
            if (active.stage === null) { movingFault('paidRule'); }
            if (command.type === 'undo' && !active.moves.length) { movingFault('noUndo'); }
            active.moves = command.type === 'restart' ? [] : active.moves.slice(0, -1);
            active.abandoned = false;
        } else {
            if (status !== 'playing') { movingFault('finished'); }
            if (command.type === 'abandon') { active.abandoned = true; }
            else {
                const result = actMoving(active.level, replayRun(active), command);
                if (!result.ok) { movingFault(result.reason); }
                active.moves.push(command.id);
            }
        }
        const nextStatus = runStatus(active);
        if (active.stage === null && nextStatus !== 'playing') {
            const receipt = data.receipts.find(entry => entry.runId === active.id)!;
            if (!receipt || receipt.settlement) { movingFault('invalid'); }
            receipt.settlement = { actionId, outcome: nextStatus };
        } else if (active.stage !== null && nextStatus === 'won' && !completedStages(data).includes(active.stage)) {
            data.receipts.push({ runId: active.id, stage: active.stage, admissionAction: null,
                settlement: { actionId, outcome: 'won' } });
        }
    }
    data.revision++;
    data.last = { id: actionId, command: structuredClone(command) };
    return data;
}
