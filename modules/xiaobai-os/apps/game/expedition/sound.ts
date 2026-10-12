import type { Battle } from './types.js';

/** Quiet, layered combat Foley; no downloads, model calls or sounds before a user gesture. */
export function createExpeditionSound(onError: () => void) {
    let context: AudioContext | null = null, master: GainNode | null = null, noise: AudioBuffer | null = null;
    let enabled = false, disposed = false, battle: Battle | null = null, lastTick = -1, lastHp = 0, lastKills = 0, lastSkill = 0, lastEffect = 0;
    let lastCombo = 0;
    function tone(frequency: number, duration: number, gain: number, type: OscillatorType = 'sine', end = frequency * .8, delay = 0) {
        if (!enabled || !context || !master || context.state !== 'running') { return; }
        const oscillator = context.createOscillator(), volume = context.createGain(), now = context.currentTime + delay;
        oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, now); oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, end), now + duration);
        volume.gain.setValueAtTime(.0001, now); volume.gain.exponentialRampToValueAtTime(gain, now + .009); volume.gain.exponentialRampToValueAtTime(.0001, now + duration);
        oscillator.connect(volume).connect(master); oscillator.start(now); oscillator.stop(now + duration);
        oscillator.onended = () => { oscillator.disconnect(); volume.disconnect(); };
    }
    function air(duration: number, gain: number, frequency: number, end: number) {
        if (!enabled || !context || !master || !noise || context.state !== 'running') { return; }
        const source = context.createBufferSource(), filter = context.createBiquadFilter(), volume = context.createGain(), now = context.currentTime;
        source.buffer = noise; filter.type = 'bandpass'; filter.Q.value = .65;
        filter.frequency.setValueAtTime(frequency, now); filter.frequency.exponentialRampToValueAtTime(end, now + duration);
        volume.gain.setValueAtTime(.0001, now); volume.gain.exponentialRampToValueAtTime(gain, now + .008); volume.gain.exponentialRampToValueAtTime(.0001, now + duration);
        source.connect(filter).connect(volume).connect(master); source.start(now); source.stop(now + duration);
        source.onended = () => { source.disconnect(); filter.disconnect(); volume.disconnect(); };
    }
    return {
        async enable(next: boolean) {
            if (disposed) { return; } enabled = next;
            try {
                if (!next) { if (context) { await context.suspend(); } return; }
                if (!context) {
                    context = new AudioContext(); master = context.createGain(); master.gain.value = .55; master.connect(context.destination);
                    noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
                    const channel = noise.getChannelData(0);
                    for (let i = 0; i < channel.length; i++) { channel[i] = Math.random() * 2 - 1; }
                }
                await context.resume();
            } catch { enabled = false; if (!disposed) { onError(); } }
        },
        tick(b: Battle) {
            if (!battle || b.tick < lastTick) { lastTick = -1; lastHp = b.player.hp; lastKills = b.kills; lastSkill = b.player.skill; lastEffect = b.serial; lastCombo = b.player.combo; }
            battle = b;
            if (lastTick === b.tick) { return; } lastTick = b.tick;
            if (b.player.hp < lastHp) { air(.16, .17, 800, 120); tone(95, .2, .12, 'triangle', 42); }
            if (b.kills > lastKills) { tone(659, .22, .045); tone(988, .3, .025, 'sine', 980, .035); }
            if (b.player.combo > lastCombo) { air(.095, .08, 2700, 500); }
            if (b.player.dashTime === 7) { air(.2, .09, 500, 2600); }
            if (b.player.skill > lastSkill) {
                air(.24, .12, 2200, 250); tone(165, .35, .075, 'triangle', 82);
                tone(660, .36, .035, 'sine', 440, .02);
            }
            if (b.effects.some(e => e.id > lastEffect && e.kind === 'lightning')) { air(.12, .1, 4400, 1000); tone(1200, .08, .018, 'sine', 210); }
            if (b.effects.some(e => e.id > lastEffect && (e.kind === 'block' || e.kind === 'parry'))) { tone(1350, .18, .07, 'triangle', 740); tone(2200, .11, .025, 'sine', 1600); }
            if (b.effects.some(e => e.id > lastEffect && e.kind === 'ward-hit')) { tone(510, .16, .06, 'sine', 250); }
            if (b.effects.some(e => e.id > lastEffect && e.kind === 'ward-break')) { air(.25, .1, 3600, 650); tone(720, .3, .05, 'sine', 120); }
            if (b.status === 'won') { [392, 494, 587, 784].forEach((n, i) => tone(n, .65, .04, 'sine', n, i * .075)); }
            if (b.status === 'lost') { tone(147, .7, .06, 'triangle', 73); }
            lastHp = b.player.hp; lastKills = b.kills; lastSkill = b.player.skill; lastEffect = b.serial; lastCombo = b.player.combo;
        },
        dispose() { disposed = true; enabled = false; if (context) { void context.close().catch(onError); context = null; } master = null; noise = null; },
    };
}
