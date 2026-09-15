import type { EncounterLevel } from '../domain/encounter.js';

const TEXT: Record<EncounterLevel, string> = { low: '命运轻轻拨了一下…', medium: '命运悄然转动…', high: '命运骤然降临。' };
const LEVEL: Record<EncounterLevel, string> = { low: '低影响', medium: '中影响', high: '高影响' };

export function createEncounterLabel(level: EncounterLevel, fresh: boolean): HTMLElement {
    const label = document.createElement('div');
    label.className = 'xb-dice-encounter'; label.dataset.level = level;
    if (fresh) { label.dataset.fresh = 'true'; }
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'xb-dice-encounter-icon'); icon.setAttribute('aria-hidden', 'true'); icon.setAttribute('viewBox', '8 8 48 52');
    const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    outline.setAttribute('d', 'm32 11 20 14v20L32 56 12 45V25Zm0 0L21 34l11 22 11-22ZM12 25l9 9-9 11m40-20-9 9 9 11M21 34h22');
    outline.setAttribute('fill', 'none'); outline.setAttribute('stroke', 'currentColor'); outline.setAttribute('stroke-width', '2.8'); outline.setAttribute('stroke-linejoin', 'round');
    icon.append(outline);
    const text = document.createElement('span'); text.textContent = TEXT[level];
    const context = document.createElement('span'); context.className = 'xb-dice-encounter-sr'; context.textContent = `随机遭遇，${LEVEL[level]}。`;
    label.append(context, icon, text);
    return label;
}

export const ENCOUNTER_CSS = `
.xb-dice-encounter { display:flex; align-items:center; justify-content:center; gap:.65em; min-height:2.25em; margin:.65em 0 0; font-size:.85em; line-height:1.5; color:inherit; }
.xb-dice-encounter::before,.xb-dice-encounter::after { content:""; height:1px; flex:1 1 16px; max-width:5em; background:currentColor; opacity:.2; }
.xb-dice-encounter > span:not(.xb-dice-encounter-sr):last-child { min-width:0; overflow-wrap:anywhere; text-align:center; }
.xb-dice-encounter[data-level="medium"] { color:color-mix(in srgb,currentColor 78%,#9b83f0); }
.xb-dice-encounter[data-level="high"] { color:color-mix(in srgb,currentColor 65%,#9b83f0); font-weight:600; }
.xb-dice-encounter-icon { flex:none; width:1.1em; height:1.1em; }
.xb-dice-encounter[data-fresh="true"] { animation:xb-encounter-appear .16s ease-out; }
.xb-dice-encounter-sr { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
.xb-dice-encounter-error { margin:.7em 0 0; font-size:.85em; }
@keyframes xb-encounter-appear { from { opacity:0; } to { opacity:1; } }
@media(prefers-reduced-motion:reduce) { .xb-dice-encounter[data-fresh="true"] { animation:none; } }
`;
