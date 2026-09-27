import type { MovingAction, MovingItem, MovingLevel, MovingResult, MovingState } from './types.js';

export const TRAY_CAPACITY = 7;
export const MATCH_SIZE = 3;

export function startMoving(level: MovingLevel): MovingState {
    return { remaining: level.items.map(item => item.id), tray: [] };
}

export function movingStatus(state: MovingState): 'playing' | 'won' | 'lost' {
    if (!state.remaining.length && !state.tray.length) { return 'won'; }
    return state.tray.length >= TRAY_CAPACITY ? 'lost' : 'playing';
}

export function packedCount(level: MovingLevel, state: MovingState): number {
    return (level.items.length - state.remaining.length - state.tray.length) / MATCH_SIZE;
}

export function canPick(state: MovingState, item: MovingItem): boolean {
    return movingStatus(state) === 'playing' && state.remaining.includes(item.id) && (!item.above || !state.remaining.includes(item.above));
}

export function actMoving(level: MovingLevel, state: MovingState, action: MovingAction): MovingResult {
    if (movingStatus(state) !== 'playing') { return { ok: false, reason: 'finished' }; }
    const item = level.items.find(entry => entry.id === action.id);
    if (!item || !state.remaining.includes(item.id)) { return { ok: false, reason: 'missing' }; }
    if (!canPick(state, item)) { return { ok: false, reason: 'blocked' }; }
    const tray = [...state.tray];
    const same = (id: string) => level.items.find(entry => entry.id === id)!.kind === item.kind;
    const last = tray.reduce((found, id, index) => same(id) ? index : found, -1);
    tray.splice(last < 0 ? tray.length : last + 1, 0, item.id);
    const matched = tray.filter(same);
    const packed = matched.length === MATCH_SIZE ? matched : [];
    return { ok: true, packed, state: {
        remaining: state.remaining.filter(id => id !== item.id),
        tray: tray.filter(id => !packed.includes(id)),
    } };
}
