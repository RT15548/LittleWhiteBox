import { RULES } from './content.js';
import type { Point } from './types.js';

/** Render-only gait: a repeated 30 Hz position sample is not a stop command. */
export function createTravelerGait() {
    let previous: Point | null = null, lastTime = 0, lastMove = -Infinity, phase = 0, amount = 0;
    function reset() { previous = null; lastMove = -Infinity; phase = 0; amount = 0; }
    return {
        reset,
        get active() { return amount > 0; },
        update(position: Point | null, seconds: number, reduced: boolean) {
            if (seconds < lastTime || !position || reduced) { reset(); }
            const elapsed = previous ? Math.min(.1, seconds - lastTime) : 0;
            if (position && previous && Math.hypot(position.x - previous.x, position.y - previous.y) > .001) { lastMove = seconds; }
            const walking = !reduced && seconds - lastMove <= 2 / RULES.hz;
            const wasActive = amount > 0;
            amount += ((walking ? 1 : 0) - amount) * (1 - Math.exp(-elapsed * (walking ? 14 : 18)));
            if (!walking && amount < .001) { amount = 0; phase = 0; }
            else if (wasActive) { phase = (phase + elapsed * Math.PI * 2 * 1.25) % (Math.PI * 2); }
            previous = position ? { x: position.x, y: position.y } : null; lastTime = seconds;
            const wave = Math.sin(phase);
            return { stride: wave * .45 * amount, lift: wave * wave * .035 * amount, amount };
        },
    };
}
