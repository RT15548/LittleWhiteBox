import type { Performance } from './catalog.js';

const MOTIONS = {
    nod: { joint: 'head', frames: ['translateY(0) rotate(0)', 'translateY(2.5px) rotate(2deg)', 'translateY(0) rotate(0)'], duration: 1000 },
    tilt: { joint: 'head', frames: ['rotate(0)', 'rotate(-5deg)', 'rotate(-5deg)', 'rotate(0)'], duration: 1750 },
    shake: { joint: 'head', frames: ['rotate(0)', 'rotate(-2deg)', 'rotate(2deg)', 'rotate(-1deg)', 'rotate(0)'], duration: 1350 },
    gesture: { joint: 'arm', angles: [0, 8, 6, 0], duration: 1600 },
    withdraw: { joint: 'arm', angles: [0, -8, -8, 0], duration: 1800 },
} satisfies Record<Exclude<Performance['gesture'], 'none'>,
    { joint: 'head'; frames: string[]; duration: number } | { joint: 'arm'; angles: number[]; duration: number }>;

/** Only the named joint moves. The body is never animated. */
export function performGesture(gesture: Performance['gesture'], joints: { head: HTMLElement; arm: HTMLElement }, armDirection: 1 | -1): Animation | null {
    if (gesture === 'none') { return null; }
    const motion = MOTIONS[gesture];
    const frames = motion.joint === 'arm' ? motion.angles.map(angle => `rotate(${angle * armDirection}deg)`) : motion.frames;
    return joints[motion.joint].animate(frames.map(transform => ({ transform })), { duration: motion.duration, easing: 'ease-in-out', iterations: 1 });
}
