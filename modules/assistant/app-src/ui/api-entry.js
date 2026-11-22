import { ACTIVITY_COPY as C } from './activity-copy.js';

export function renderApiSummary(root, { presetName, model }) {
    root.querySelector('#xb-assistant-api-summary-preset').textContent = presetName;
    root.querySelector('#xb-assistant-api-summary-model').textContent = model || C.modelMissing;
    const summary = root.querySelector('#xb-assistant-api-summary');
    const label = C.apiSummary(presetName, model || C.modelMissing);
    summary.title = label;
    summary.setAttribute('aria-label', label);
}

export function bindApiPopover(root, bindPopover) {
    return bindPopover({ entry: root.querySelector('.xb-assistant-api-entry'), trigger: root.querySelector('#xb-assistant-api-summary'),
        panel: root.querySelector('#xb-assistant-api-popover'), closeButton: root.querySelector('#xb-assistant-api-close') });
}
