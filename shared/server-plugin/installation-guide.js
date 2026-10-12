import { extensionFolderPath } from '../../core/constants.js';
import { SERVER_PLUGIN_INSTALLATION } from './installation.js';

function buildServerPluginGuideMarkup(prefix) {
    return `<link rel="stylesheet" href="/${encodeURI(extensionFolderPath)}/shared/server-plugin/installation-guide.css">
    <button id="${prefix}-install-guide" class="xb-web-guide-button" type="button" aria-haspopup="dialog">${SERVER_PLUGIN_INSTALLATION.open}</button>
    <dialog id="${prefix}-install-dialog" class="xb-web-install-dialog" aria-labelledby="${prefix}-install-title">
        <header><h3 id="${prefix}-install-title">${SERVER_PLUGIN_INSTALLATION.title}</h3>
            <button type="button" id="${prefix}-install-close" class="xb-web-guide-button" autofocus>${SERVER_PLUGIN_INSTALLATION.close}</button></header>
        <ol id="${prefix}-install-steps"></ol>
    </dialog>`;
}

function bindServerPluginGuide(root, prefix) {
    const dialog = root.querySelector(`#${prefix}-install-dialog`);
    const document = dialog.ownerDocument;
    root.querySelector(`#${prefix}-install-steps`).replaceChildren(...SERVER_PLUGIN_INSTALLATION.steps.map(step => {
        const item = document.createElement('li');
        item.textContent = step.text;
        if (step.code) {
            const code = document.createElement('code');
            code.textContent = step.code;
            item.append(code);
        }
        return item;
    }));
    root.querySelector(`#${prefix}-install-guide`).addEventListener('click', () => dialog.showModal());
    root.querySelector(`#${prefix}-install-close`).addEventListener('click', () => dialog.close());
}

export function mountServerPluginGuide(container, prefix) {
    // Markup and prefixes are owned by the settings UI, never supplied by user input.
    // eslint-disable-next-line no-unsanitized/property
    container.innerHTML = buildServerPluginGuideMarkup(prefix);
    bindServerPluginGuide(container, prefix);
}
