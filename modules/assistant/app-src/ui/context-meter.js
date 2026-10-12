import { ACTIVITY_COPY as C } from './activity-copy.js';
import { chromeIcon } from './chrome-icons.js';

export function contextMeterMarkup() {
    return `<details class="xb-assistant-context" id="xb-assistant-context">
        <summary id="xb-assistant-context-meter" aria-label="${C.context}" title="${C.context}" aria-expanded="false">
            <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                <circle class="xb-assistant-context-track" cx="16" cy="16" r="13"/>
                <circle class="xb-assistant-context-fill" cx="16" cy="16" r="13" pathLength="100"/>
            </svg>
            <span class="xb-assistant-context-busy" aria-hidden="true" hidden>···</span>
        </summary>
        <section class="xb-assistant-context-popover" aria-labelledby="xb-assistant-context-title">
            <header><strong id="xb-assistant-context-title">${C.context}</strong>
                <button id="xb-assistant-context-close" type="button" class="xb-assistant-chrome-button" aria-label="${C.closeContext}" title="${C.closeContext}">${chromeIcon('close')}</button>
            </header>
            <p class="xb-assistant-context-total" id="xb-assistant-context-total"></p>
            <p id="xb-assistant-context-policy"></p>
            <p id="xb-assistant-context-summary" hidden>${C.contextSummarized}</p>
            <p id="xb-assistant-context-phase" role="status" hidden></p>
        </section>
    </details>`;
}

export function renderContextMeter(root, state, { summaryTriggerTokens, buildContextMeterLabel }) {
    const meter = root.querySelector('#xb-assistant-context-meter');
    const { usedTokens, budgetTokens, summaryActive } = state.contextStats;
    const percent = Math.min(100, Math.max(0, usedTokens / budgetTokens * 100));
    meter.style.setProperty('--context-fill', `${percent}`);
    meter.classList.toggle('is-warning', usedTokens >= summaryTriggerTokens);
    meter.querySelector('.xb-assistant-context-busy').hidden = !state.isBusy;
    const usage = C.contextUsage(buildContextMeterLabel());
    meter.setAttribute('aria-label', `${C.context}：${usage}`);
    root.querySelector('#xb-assistant-context-total').textContent = usage;
    root.querySelector('#xb-assistant-context-policy').textContent = C.contextPolicy(Math.round(summaryTriggerTokens / 1000));
    root.querySelector('#xb-assistant-context-summary').hidden = !summaryActive;
    const phase = root.querySelector('#xb-assistant-context-phase');
    phase.textContent = state.isBusy ? state.progressLabel : '';
    phase.hidden = !state.isBusy;
}

export function bindContextMeter(root) {
    const details = root.querySelector('#xb-assistant-context');
    const meter = root.querySelector('#xb-assistant-context-meter');
    const close = (focus = false) => {
        details.open = false;
        meter.setAttribute('aria-expanded', 'false');
        if (focus) meter.focus();
    };
    details.addEventListener('toggle', () => meter.setAttribute('aria-expanded', String(details.open)));
    root.querySelector('#xb-assistant-context-close').addEventListener('click', () => close(true));
    root.addEventListener('pointerdown', event => {
        if (details.open && !details.contains(event.target)) close();
    });
    root.addEventListener('keydown', event => {
        if (event.key === 'Escape' && details.open) {
            event.preventDefault();
            event.stopPropagation();
            close(true);
        }
    });
}
