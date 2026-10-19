import { extensionFolderPath } from '../../../core/constants.js';
import { SAMPLING_PARAMETERS, normalizeSampling, samplingParametersFor } from '../sampling.js';

const COPY = Object.freeze({ title: '采样参数', temperature: '温度', defaults: '使用接口默认', enable: '启用', enabled: '已启用', disabled: '未启用' });
const TEMPERATURE = { key: 'temperature', label: COPY.temperature, min: 0, max: 2, step: 0.05, value: 1 };
const PARAMETERS = [TEMPERATURE, ...SAMPLING_PARAMETERS];
const prefixFor = scope => scope === 'delegate' ? 'xb-assistant-delegate' : 'xb-assistant';

export function buildSamplingSettingsMarkup(scope = 'main') {
    const prefix = prefixFor(scope);
    return `${scope === 'main' ? `<link rel="stylesheet" href="/${encodeURI(extensionFolderPath)}/modules/agent-core/ui/sampling-settings.css">` : ''}
    <details class="xb-sampling" data-sampling-scope="${scope}">
        <summary><span class="xb-sampling-title">${COPY.title}</span><span class="xb-sampling-summary"></span><span class="xb-sampling-chevron" aria-hidden="true">⌄</span></summary>
        <div class="xb-sampling-fields">${PARAMETERS.map(parameter => {
            const id = `${prefix}-${parameter.key}`;
            const toggle = parameter.key === 'temperature' ? `${prefix}-send-temperature` : `${id}-enabled`;
            return `<div class="xb-sampling-row" data-sampling-key="${parameter.key}">
                <label class="xb-sampling-name" for="${id}">${parameter.label}</label>
                <input id="${id}" type="number" min="${parameter.min}" ${parameter.max === undefined ? '' : `max="${parameter.max}"`} step="${parameter.step === 1 ? 1 : 'any'}" inputmode="${parameter.step === 1 ? 'numeric' : 'decimal'}" required>
                <label class="xb-sampling-toggle" title="${COPY.enable}${parameter.label}"><input id="${toggle}" type="checkbox" role="switch" aria-label="${COPY.enable}${parameter.label}"><span aria-hidden="true"></span></label>
            </div>`;
        }).join('')}</div>
    </details>`;
}

export function readSamplingForm(root, provider, previous, scope = 'main') {
    const prefix = prefixFor(scope);
    const sampling = normalizeSampling(previous);
    for (const parameter of samplingParametersFor(provider)) {
        const input = root.querySelector(`#${prefix}-${parameter.key}`);
        const toggle = root.querySelector(`#${prefix}-${parameter.key}-enabled`);
        if (!input || !toggle) continue;
        // Keep the draft while a number is being edited; saving reports native input validity.
        const value = input.value !== '' && input.validity?.valid !== false
            ? Number(input.value) : sampling[parameter.key]?.value ?? parameter.value;
        sampling[parameter.key] = { enabled: toggle.checked, value };
    }
    return sampling;
}

function updateSamplingSummary(section) {
    const active = [];
    for (const row of section.querySelectorAll('[data-sampling-key]')) {
        if (row.hidden) continue;
        const toggle = row.querySelector('input[type="checkbox"]');
        const input = row.querySelector('input[type="number"]');
        input.disabled = !toggle.checked;
        row.dataset.enabled = String(toggle.checked);
        row.querySelector('.xb-sampling-toggle').title = toggle.checked ? COPY.enabled : COPY.disabled;
        if (toggle.checked) active.push(`${row.querySelector('.xb-sampling-name').textContent} ${input.value}`);
    }
    section.querySelector('.xb-sampling-summary').textContent = active.join(' · ') || COPY.defaults;
}

export function syncSamplingForm(root, { provider, temperature, sendTemperature, sampling }, scope = 'main') {
    const section = root.querySelector(`[data-sampling-scope="${scope}"]`);
    if (!section) return;
    const supported = new Set(['temperature', ...samplingParametersFor(provider).map(parameter => parameter.key)]);
    const values = normalizeSampling(sampling);
    for (const parameter of PARAMETERS) {
        const row = section.querySelector(`[data-sampling-key="${parameter.key}"]`);
        row.hidden = !supported.has(parameter.key);
        const isTemperature = parameter.key === 'temperature';
        const input = row.querySelector('input[type="number"]');
        input.value = String(isTemperature ? temperature ?? parameter.value : values[parameter.key]?.value ?? parameter.value);
        row.querySelector('input[type="checkbox"]').checked = isTemperature ? sendTemperature !== false : values[parameter.key]?.enabled === true;
        input.disabled = row.hidden || !row.querySelector('input[type="checkbox"]').checked;
    }
    updateSamplingSummary(section);
}

export function bindSamplingSettings(root, changed) {
    for (const section of root.querySelectorAll('[data-sampling-scope]')) {
        section.addEventListener('input', () => { updateSamplingSummary(section); changed(); });
        section.addEventListener('change', () => { updateSamplingSummary(section); changed(); });
    }
}

export function validateSamplingForm(root) {
    for (const input of root.querySelectorAll('.xb-sampling input[type="number"]')) {
        if (!input.disabled && input.validity?.valid === false) {
            input.closest('details').open = true;
            input.reportValidity();
            return false;
        }
    }
    return true;
}
