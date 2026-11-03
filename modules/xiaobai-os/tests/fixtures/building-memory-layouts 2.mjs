// Small player-authored houses, including the retained middle-row entrance.
// These are test witnesses, not runtime hints or a level solver.
export function memoryLayout(brief) {
    const x = brief.entrance, z = brief.entryZ;
    const at = (kind, dx, row) => ({ kind, x: x + dx, y: 0, z: row });
    if (z === 1) {
        return [at('hall', 0, 1), at('room', -1, 1), at('path', 1, 1), at('garden', 1, 2),
            at('garden', 0, 0), at('study', -1, 0), at('wide', -1, 2), at('room', 1, 0)];
    }
    return [at('hall', 0, 2), at('room', -1, 2), at('path', 1, 2), at('path', 1, 1),
        at('garden', 0, 1), at('study', -1, 1), at('wide', -1, 0), at('room', 1, 0)];
}
