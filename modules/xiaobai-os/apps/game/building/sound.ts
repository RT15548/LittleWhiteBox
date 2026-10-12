export type SceneCue = 'release' | 'land' | 'reward';

/** A small physical palette: cable, wooden contact, glass chimes and a soft falling whoosh. */
export function createBuildingSound() {
    let context: AudioContext | null = null, noise: AudioBuffer | null = null;
    const sources = new Set<AudioScheduledSourceNode>();
    function track(node: AudioScheduledSourceNode, gain: GainNode, extra?: AudioNode) {
        sources.add(node);
        node.onended = () => { sources.delete(node); node.disconnect(); gain.disconnect(); extra?.disconnect(); };
    }
    function tone(frequency: number, end: number, duration: number, volume: number, delay = 0, type: OscillatorType = 'sine') {
        const ctx = context!, oscillator = ctx.createOscillator(), gain = ctx.createGain(), start = ctx.currentTime + delay;
        oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start);
        oscillator.frequency.exponentialRampToValueAtTime(end, start + duration);
        gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(volume, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        oscillator.connect(gain); gain.connect(ctx.destination); track(oscillator, gain);
        oscillator.start(start); oscillator.stop(start + duration + 0.015);
    }
    function texture(frequency: number, duration: number, volume: number, delay = 0) {
        const ctx = context!, source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
        const start = ctx.currentTime + delay;
        source.buffer = noise; filter.type = 'bandpass'; filter.frequency.value = frequency; filter.Q.value = 0.75;
        gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(volume, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        source.connect(filter); filter.connect(gain); gain.connect(ctx.destination); track(source, gain, filter);
        source.start(start); source.stop(start + duration + 0.015);
    }
    function stop() { for (const source of sources) { source.stop(); } }
    return {
        async unlock() {
            if (!context) {
                context = new AudioContext();
                noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
                const channel = noise.getChannelData(0);
                for (let i = 0; i < channel.length; i++) { channel[i] = Math.random() * 2 - 1; }
            }
            if (context.state === 'suspended') { await context.resume(); }
        },
        play(kind: SceneCue) {
            if (!context || context.state !== 'running') { return; }
            if (kind === 'release') { texture(1700, 0.12, 0.045); tone(340, 250, 0.1, 0.022); }
            if (kind === 'land') {
                tone(150, 62, 0.19, 0.11); texture(750, 0.105, 0.08);
                tone(880, 860, 0.24, 0.018, 0.025); tone(1320, 1290, 0.19, 0.009, 0.04);
            }
            if (kind === 'reward') {
                [523, 659, 784, 1047].forEach((frequency, index) => {
                    tone(frequency, frequency, 0.5, 0.038, index * 0.11);
                    tone(frequency * 2, frequency * 2, 0.25, 0.009, index * 0.11);
                });
            }
        },
        async pause() { if (context?.state === 'running') { stop(); await context.suspend(); } },
        async dispose() {
            stop(); const previous = context; context = null; noise = null;
            if (previous && previous.state !== 'closed') { await previous.close(); }
        },
    };
}
