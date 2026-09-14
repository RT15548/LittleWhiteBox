export const DICE_CARD_CSS = `
.xb-dice-card { display:flex; flex-wrap:wrap; align-items:center; gap:.35em .8em; margin:.7em 0; padding:.65em .8em; border:1px solid currentColor; border-color:color-mix(in srgb,currentColor 22%,transparent); border-radius:10px; background:color-mix(in srgb,currentColor 4%,transparent); font:inherit; line-height:1.45; overflow-wrap:anywhere; }
.xb-dice-card .xb-dice-heading { flex:1 1 9em; font-weight:600; }
.xb-dice-card .xb-dice-score { font-variant-numeric:tabular-nums; font-weight:650; white-space:nowrap; }
.xb-dice-card .xb-dice-detail,.xb-dice-card .xb-dice-note { flex-basis:100%; font-size:.9em; }
.xb-dice-card .xb-dice-note { opacity:.85; }
.xb-dice-card button { color:inherit; background:transparent; border:1px solid currentColor; border-radius:6px; padding:.45em .7em; min-height:40px; font:inherit; cursor:pointer; }
.xb-dice-card button:focus-visible { outline:2px solid currentColor; outline-offset:3px; }
.xb-dice-card button:disabled { opacity:.5; cursor:wait; }
`;
