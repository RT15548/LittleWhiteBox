import { WEB_PROVIDERS, WEB_SETTINGS_COPY, normalizeWebSettings } from '../web/settings.js';
import { extensionFolderPath } from '../../../core/constants.js';
import { SERVER_PLUGIN_INSTALLATION } from '../../../shared/server-plugin/installation.js';

export function buildWebSettingsMarkup() {
    return `<link rel="stylesheet" href="/${encodeURI(extensionFolderPath)}/modules/agent-core/ui/web-settings.css">
    <div class="xb-assistant-web-settings"><label><span>${WEB_SETTINGS_COPY.provider}</span>
        <select id="xb-assistant-web-provider">${WEB_PROVIDERS.map(({ id, label }) => `<option value="${id}">${label}</option>`).join('')}</select>
    </label>${WEB_PROVIDERS.map(({ id, label }) => `<label id="xb-assistant-${id}-key-wrap">
        <span>${label} ${WEB_SETTINGS_COPY.key}</span>
        <div class="xb-assistant-inline-input">
            <input id="xb-assistant-${id}-api-key" type="password" autocomplete="off" />
            <button id="xb-assistant-toggle-${id}-key" type="button" class="secondary ghost">${WEB_SETTINGS_COPY.show}</button>
        </div>
    </label>`).join('')}<div id="xb-assistant-exa-backend-note" class="xb-web-backend-note" hidden>
        <small>${WEB_SETTINGS_COPY.exaBackend}</small>
        <button id="xb-assistant-exa-install-guide" class="xb-web-guide-button" type="button" aria-haspopup="dialog">${SERVER_PLUGIN_INSTALLATION.open}</button>
    </div>
    <dialog id="xb-assistant-exa-install-dialog" class="xb-web-install-dialog" aria-labelledby="xb-assistant-exa-install-title">
        <header><h3 id="xb-assistant-exa-install-title">${SERVER_PLUGIN_INSTALLATION.title}</h3>
            <button type="button" id="xb-assistant-exa-install-close" class="xb-web-guide-button" autofocus>${SERVER_PLUGIN_INSTALLATION.close}</button></header>
        <ol id="xb-assistant-exa-install-steps"></ol>
    </dialog></div>`;
}

export function bindWebSettingsGuide(root) {
    const dialog = root.querySelector('#xb-assistant-exa-install-dialog');
    if (!dialog) return;
    const document = dialog.ownerDocument;
    root.querySelector('#xb-assistant-exa-install-steps').replaceChildren(...SERVER_PLUGIN_INSTALLATION.steps.map(step => {
        const item = document.createElement('li');
        item.textContent = step.text;
        if (step.code) {
            const code = document.createElement('code');
            code.textContent = step.code;
            item.append(code);
        }
        return item;
    }));
    root.querySelector('#xb-assistant-exa-install-guide').addEventListener('click', () => dialog.showModal());
    root.querySelector('#xb-assistant-exa-install-close').addEventListener('click', () => dialog.close());
}

export function readWebSettingsForm(root, draft) {
    return normalizeWebSettings({
        webProvider: root.querySelector('#xb-assistant-web-provider')?.value,
        ...Object.fromEntries(WEB_PROVIDERS.map(({ id }) => [
            `${id}ApiKey`, root.querySelector(`#xb-assistant-${id}-api-key`)?.value,
        ])),
    }, draft);
}

export function syncWebSettingsForm(root, draft) {
    const settings = normalizeWebSettings(draft);
    const select = root.querySelector('#xb-assistant-web-provider');
    if (select) select.value = settings.webProvider;
    const note = root.querySelector('#xb-assistant-exa-backend-note');
    if (note) note.hidden = settings.webProvider !== 'exa';
    const dialog = root.querySelector('#xb-assistant-exa-install-dialog');
    if (settings.webProvider !== 'exa' && dialog?.open) dialog.close();
    for (const { id } of WEB_PROVIDERS) {
        const wrap = root.querySelector(`#xb-assistant-${id}-key-wrap`);
        const input = root.querySelector(`#xb-assistant-${id}-api-key`);
        if (wrap) wrap.style.display = settings.webProvider === id ? '' : 'none';
        if (input) input.value = settings[`${id}ApiKey`];
    }
}
