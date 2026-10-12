import type { InputFrame } from './types.js';
import { CAMERA_EIGHTH_TURNS } from './visuals.js';

/** Owns only live input. Losing focus releases every key and pointer. */
export function createControls(host: HTMLElement, pause: () => void, wakeAudio: () => void) {
    const keys = new Set<string>(); let stick = { x: 0, y: 0 }, dash = false, skill = false;
    const controlled = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyE', 'Escape'];
    function keydown(e: KeyboardEvent) {
        if (!controlled.includes(e.code) || (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))) { return; }
        if (e.code === 'Space' && e.target instanceof HTMLElement && e.target.closest('button')) { return; }
        e.preventDefault(); e.stopPropagation(); wakeAudio();
        if (e.code === 'Escape') { if (!e.repeat) { pause(); } return; }
        keys.add(e.code);
        if (!e.repeat && e.code === 'Space') { dash = true; }
        if (!e.repeat && e.code === 'KeyE') { skill = true; }
    }
    function keyup(e: KeyboardEvent) { keys.delete(e.code); }
    function clear() { keys.clear(); stick = { x: 0, y: 0 }; dash = false; skill = false; }
    function blur() { clear(); pause(); }
    host.addEventListener('keydown', keydown); window.addEventListener('keyup', keyup); window.addEventListener('blur', blur);
    return {
        frame(): InputFrame {
            const x = stick.x || Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'));
            const y = stick.y || Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp'));
            const move = Math.hypot(x, y) < .15 ? 0 : ((Math.round((Math.atan2(y, x) + Math.PI / 2) / (Math.PI / 4)) + 8 - CAMERA_EIGHTH_TURNS) % 8) + 1;
            const result = { move, dash, skill }; dash = false; skill = false; return result;
        },
        stick(x: number, y: number) { stick = { x, y }; },
        dash() { dash = true; wakeAudio(); }, skill() { skill = true; wakeAudio(); }, clear,
        dispose() { clear(); host.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup); window.removeEventListener('blur', blur); },
    };
}
