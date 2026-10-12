// One policy for scheduling and diagnostic counts; no storage or model calls.
export const L0_FLOOR_MAX_ATTEMPTS = 3;

export function summarizeL0Floors(chat, byFloor) {
    let total = 0, ok = 0, empty = 0, terminalFail = 0;
    const failedFloors = [];
    for (const [floor, message] of (chat || []).entries()) {
        if (message?.is_user) continue;
        total++;
        const status = byFloor?.[floor];
        if (status?.status === 'ok') ok++;
        else if (status?.status === 'empty') empty++;
        else if (status?.status === 'fail') {
            const attempts = status.attempts || 0;
            const terminal = attempts >= L0_FLOOR_MAX_ATTEMPTS;
            if (terminal) terminalFail++;
            failedFloors.push({ floor, attempts, terminal });
        }
    }
    return {
        extracted: ok + empty, total,
        pending: Math.max(0, total - ok - empty - terminalFail),
        incomplete: Math.max(0, total - ok - empty),
        empty, fail: failedFloors.length, terminalFail, failedFloors,
    };
}
