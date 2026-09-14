import type { CheckCard } from './check-card.js';

export const DICE_REVEAL_MS = 2000;

/** Only a fresh, confirmed check enters this finite, abortable presentation gate. */
export function revealCheckCard(card: CheckCard, signal: AbortSignal): Promise<void> {
    if (signal.aborted || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        card.settle(); delete card.element.dataset.revealed; return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const started = performance.now();
        let frame = 0;
        let finished = false;
        const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
        const finish = () => {
            if (finished) { return; }
            finished = true;
            clearTimeout(timer); cancelAnimationFrame(frame);
            signal.removeEventListener('abort', finish);
            document.removeEventListener('visibilitychange', hidden);
            reducedMotion.removeEventListener('change', motionChanged);
            try {
                card.settle();
                delete card.element.dataset.revealed;
                resolve();
            } catch (error) { reject(error); }
        };
        const hidden = () => { if (document.hidden) { finish(); } };
        const motionChanged = () => { if (reducedMotion.matches) { finish(); } };
        const tick = (now: number) => {
            if (finished) { return; }
            if (!card.element.isConnected) { finish(); return; }
            const progress = (now - started) / DICE_REVEAL_MS;
            if (progress >= 1) { finish(); return; }
            // The solid lands first; give the revealed card 300ms before releasing continuation.
            try {
                if (progress >= .85) { card.settle(); }
                else { card.draw(progress / .85); }
            } catch { finish(); return; }
            frame = requestAnimationFrame(tick);
        };
        // A throttled/absent animation frame must never strand the generation chain.
        const timer = setTimeout(finish, DICE_REVEAL_MS);
        signal.addEventListener('abort', finish, { once: true });
        document.addEventListener('visibilitychange', hidden);
        reducedMotion.addEventListener('change', motionChanged);
        frame = requestAnimationFrame(tick);
    });
}
