export const DICE_CARD_CSS = `
.xb-dice-card {
    --xb-dice-tone: #718494;
    display: block; position: relative; box-sizing: border-box; max-width: 34em;
    margin: .9em 0; padding: .85em 1em; border-radius: 14px;
    border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
    background: color-mix(in srgb, currentColor 3%, transparent);
    color: inherit; font: inherit; line-height: 1.45; overflow-wrap: anywhere; text-shadow: none;
    isolation: isolate;
}
.xb-dice-card[data-outcome="success"] { --xb-dice-tone: #1c9b91; }
.xb-dice-card[data-outcome="failure"] { --xb-dice-tone: #d47757; }
.xb-dice-card[data-outcome="critical_success"] { --xb-dice-tone: #c59730; }
.xb-dice-card[data-outcome="critical_failure"] { --xb-dice-tone: #c85070; }
.xb-dice-card [hidden] { display: none !important; }
.xb-dice-card .xb-dice-hero { display: grid; grid-template-columns: 6.4em minmax(0, 1fr); align-items: center; gap: .9em; min-height: 6.8em; }
.xb-dice-card .xb-dice-die { display: flex; flex-direction: column; align-items: center; width: 6.4em; grid-area: 1 / 1; }
.xb-dice-card .xb-dice-solid { display: block; width: 6.4em; height: 6.4em; overflow: visible; }
.xb-dice-card .xb-dice-system { font: 650 .62em/1 ui-sans-serif, system-ui, sans-serif; letter-spacing: .14em; opacity: .6; }
.xb-dice-card .xb-dice-verdict { display: grid; gap: .35em; min-width: 0; }
.xb-dice-card .xb-dice-outcome { font-size: 1.6em; font-weight: 750; letter-spacing: .06em; color: color-mix(in srgb, var(--xb-dice-tone) 72%, currentColor); }
.xb-dice-card .xb-dice-comparison { display: flex; flex-wrap: wrap; align-items: baseline; gap: .15em .85em; font-size: .8em; }
.xb-dice-card .xb-dice-score { display: inline-flex; align-items: baseline; gap: .35em; white-space: nowrap; }
.xb-dice-card .xb-dice-score-label { opacity: .7; }
.xb-dice-card .xb-dice-score-value { font-size: 1.25em; font-weight: 650; font-variant-numeric: tabular-nums; }
.xb-dice-card .xb-dice-identity { display: block; margin-bottom: .45em; font-size: .85em; font-weight: 650; }
.xb-dice-card .xb-dice-copy { display: block; margin-top: .65em; padding-top: .7em; border-top: 1px solid color-mix(in srgb, currentColor 11%, transparent); }
.xb-dice-card .xb-dice-action { display: block; font-size: .92em; }
.xb-dice-card .xb-dice-stakes { display: block; margin: .45em 0 0; font-size: .8em; opacity: .7; }
.xb-dice-card .xb-dice-stakes-label { margin-right: .6em; font-weight: 650; }
.xb-dice-card details.xb-dice-stakes { padding: 0; border: 0; background: none; }
.xb-dice-card .xb-dice-stakes summary { cursor: pointer; min-height: 36px; display: list-item; align-content: center; width: fit-content; }
.xb-dice-card .xb-dice-stakes-text { white-space: pre-wrap; }
.xb-dice-card .xb-dice-status { display: flex; align-items: center; flex-wrap: wrap; gap: .6em; margin-top: .8em; padding-top: .7em; border-top: 1px dashed color-mix(in srgb, currentColor 24%, transparent); font-size: .8em; }
.xb-dice-card .xb-dice-note { display: block; flex-basis: 100%; }
.xb-dice-card button { color: inherit; background: transparent; border: 1px solid color-mix(in srgb, currentColor 22%, transparent); border-radius: 8px; padding: .45em .8em; min-height: 40px; font: inherit; cursor: pointer; box-shadow: none; }
.xb-dice-card button:hover { background: color-mix(in srgb, currentColor 7%, transparent); }
.xb-dice-card button:disabled { opacity: .5; cursor: wait; }
.xb-dice-card :is(button, summary):focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.xb-dice-card .xb-dice-rolling-label { grid-area: 1 / 2; font-size: .9em; }
.xb-dice-notice { display: flex; flex-wrap: wrap; gap: .7em; font-size: .9em; }
.xb-dice-pending { display: flex; align-items: center; gap: .7em; font-size: .9em; }
.xb-dice-pending::before { content: ''; flex: none; width: 1em; height: 1em; border: 2px solid color-mix(in srgb, currentColor 20%, transparent); border-top-color: currentColor; border-radius: 50%; }
@media (prefers-reduced-motion: no-preference) {
    .xb-dice-pending::before { animation: xb-dice-pending-spin .9s linear infinite; }
    .xb-dice-card .xb-dice-die { transition: transform .28s ease-out; }
    .xb-dice-card[data-state="rolling"] .xb-dice-die { transform: scale(1.12); }
    .xb-dice-card[data-revealed="true"] :is(.xb-dice-verdict, .xb-dice-copy) { animation: xb-dice-unveil .28s ease-out both; }
}
@keyframes xb-dice-pending-spin { to { transform: rotate(360deg); } }
@keyframes xb-dice-unveil { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 400px) {
    .xb-dice-card { padding: .7em .75em; }
    .xb-dice-card .xb-dice-hero { grid-template-columns: 80px minmax(0, 1fr); gap: .6em; }
    .xb-dice-card .xb-dice-die, .xb-dice-card .xb-dice-solid { width: 80px; }
    .xb-dice-card .xb-dice-solid { height: 80px; }
    .xb-dice-card .xb-dice-outcome { font-size: 1.45em; }
}
@media (max-width: 350px) {
    .xb-dice-card .xb-dice-hero { grid-template-columns: 64px minmax(0, 1fr); }
    .xb-dice-card .xb-dice-die, .xb-dice-card .xb-dice-solid { width: 64px; }
    .xb-dice-card .xb-dice-solid { height: 64px; }
}
`;
