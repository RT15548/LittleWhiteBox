/** Gesture-started synthesis. The game settings own the preference; this instance owns only live audio. */
export function createMovingSound() {
    let context: AudioContext | undefined;
    let enabled = false;
    let closed = false;
    let revision = 0;
    return {
        available: typeof AudioContext !== 'undefined',
        async setEnabled(value: boolean) {
            const request = ++revision;
            if (closed) { return false; }
            enabled = value;
            if (value) {
                context ??= new AudioContext();
                await context.resume();
            } else if (context?.state === 'running') { await context.suspend(); }
            return request === revision && !closed;
        },
        play(packed: boolean) {
            if (!enabled || context?.state !== 'running') { return; }
            const notes = packed ? [523.25, 659.25, 783.99] : [392];
            notes.forEach((frequency, index) => {
                const oscillator = context!.createOscillator();
                const gain = context!.createGain();
                const start = context!.currentTime + index * .09;
                oscillator.type = 'sine'; oscillator.frequency.value = frequency;
                gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.065, start + .015);
                gain.gain.exponentialRampToValueAtTime(.001, start + .25);
                oscillator.connect(gain); gain.connect(context!.destination);
                oscillator.start(start); oscillator.stop(start + .27);
                oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
            });
        },
        async dispose() { closed = true; revision++; enabled = false; if (context && context.state !== 'closed') { await context.close(); } },
    };
}
