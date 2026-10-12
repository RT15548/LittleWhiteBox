/** A reading opportunity, not a requirement to speak. No elapsed-time backlog is retained. */
export function learningCompanionDelay(random: () => number = Math.random): number {
    return Math.round(3 * 60_000 + Math.min(Math.max(random(), 0), 1) * 9 * 60_000);
}

export function createLearningCompanionScheduler<T>(options: {
    setTimer(callback: () => void, delay: number): T;
    clearTimer(timer: T): void;
    opportunity(): void;
    random?: () => number;
}) {
    let eligible = false;
    let timer: T | undefined;
    let generation = 0;
    function stop() { if (timer !== undefined) { options.clearTimer(timer); timer = undefined; } }
    function schedule() {
        if (!eligible) { return; }
        const owned = generation;
        timer = options.setTimer(() => {
            if (owned !== generation) { return; }
            timer = undefined;
            if (!eligible) { return; }
            options.opportunity();
            schedule();
        }, learningCompanionDelay(options.random));
    }
    return {
        update(next: boolean) {
            if (eligible === next) { return; }
            eligible = next; generation++; stop(); schedule();
        },
        dispose() { eligible = false; generation++; stop(); },
    };
}
