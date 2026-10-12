import { type Camera, Vector3 } from 'three';
import { RULES } from './content.js';
import { COPY } from './copy.js';
import type { Battle } from './types.js';
import { DEFENSE_COLORS } from './visuals.js';

/** World-anchored readouts. All feedback timers die with the scene, never enter a save. */
export function createWorldStatus(host: HTMLElement) {
    const ward = document.createElement('div'), fill = document.createElement('i'); ward.className = 'exp-world-ward';
    ward.style.setProperty('--ward-color', DEFENSE_COLORS.ward);
    ward.setAttribute('role', 'meter'); ward.setAttribute('aria-label', COPY.ward); ward.setAttribute('aria-valuemin', '0'); ward.setAttribute('aria-valuemax', String(RULES.maxHp));
    ward.append(fill);
    const defense = document.createElement('div'); defense.className = 'exp-world-defense';
    host.append(ward, defense); ward.hidden = true; defense.hidden = true;
    const position = new Vector3();
    let battle: Battle | null = null, lastEffect = 0, feedbackUntil = 0;
    let feedback: keyof typeof COPY.defenseFeedback | null = null;
    function place(element: HTMLElement, x: number, y: number, z: number, camera: Camera, width: number, height: number) {
        position.set(x, y, z).project(camera);
        element.style.left = `${(position.x * .5 + .5) * width}px`;
        element.style.top = `${(-position.y * .5 + .5) * height}px`;
    }
    return { update(b: Battle | null, camera: Camera, width: number, height: number) {
        if (b !== battle) { battle = b; lastEffect = 0; feedback = null; feedbackUntil = 0; }
        ward.hidden = !b || b.player.ward <= 0;
        defense.hidden = !b;
        if (!b) { return; }
        const p = b.player;
        if (!ward.hidden) {
            // Ward absorbs health damage: use the health scale, not a scene-local remembered peak.
            fill.style.width = `${p.ward / RULES.maxHp * 100}%`;
            ward.setAttribute('aria-valuenow', String(p.ward));
            place(ward, p.x, 0, p.y, camera, width, height);
        }
        const notices = b.effects.filter(e => e.id > lastEffect && e.kind in COPY.defenseFeedback);
        const notice = notices.find(e => e.kind === 'parry' || e.kind === 'ward-break') ?? notices.at(-1);
        if (notice) { feedback = notice.kind as keyof typeof COPY.defenseFeedback; feedbackUntil = b.tick + 27; }
        lastEffect = b.serial;
        if (b.tick >= feedbackUntil) { feedback = null; }
        defense.hidden = !feedback && !p.shield;
        defense.dataset.state = feedback ?? 'blocking';
        defense.textContent = feedback ? COPY.defenseFeedback[feedback] : p.shield ? COPY.guardActive : '';
        place(defense, p.x, p.shield ? 3.65 : 3.05, p.y, camera, width, height);
    }, dispose() { ward.remove(); defense.remove(); } };
}
