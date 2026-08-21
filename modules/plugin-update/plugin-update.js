import { eventSource, event_types, getRequestHeaders } from '../../../../../../script.js';
import { extensionTypes } from '../../../../../extensions.js';
import { EXT_FOLDER_ID, extensionFolderPath } from '../../core/constants.js';
import { createPluginUpdateService, PLUGIN_UPDATE_STATUS } from './update-service.js';

const UPDATE_BUTTON_ID = 'littlewhitebox-update-extension';
const UPDATE_NOTICE_CLASS = 'littlewhitebox-update-text';
const UPDATE_STYLESHEET_ID = 'littlewhitebox-plugin-update-style';
const NATIVE_UPDATE_BRIDGE_CLASS = 'littlewhitebox-native-update-bridge';

const updateService = createPluginUpdateService({
    extensionFolderId: EXT_FOLDER_ID,
    fetchImpl: (...args) => fetch(...args),
    getCachedExtensionType: extensionKey => extensionTypes?.[extensionKey],
    getRequestHeaders,
});

let initialized = false;
let renderObserver = null;
let shouldShowUpdate = false;

function ensureStylesheet() {
    if (document.getElementById(UPDATE_STYLESHEET_ID)) return;
    const link = document.createElement('link');
    link.id = UPDATE_STYLESHEET_ID;
    link.rel = 'stylesheet';
    link.href = `${extensionFolderPath}/modules/plugin-update/plugin-update.css`;
    document.head.appendChild(link);
}

function stopRenderObserver() {
    renderObserver?.disconnect();
    renderObserver = null;
}

function hideUpdateNotice() {
    shouldShowUpdate = false;
    stopRenderObserver();
    document.querySelectorAll(`.${UPDATE_NOTICE_CLASS}, .${NATIVE_UPDATE_BRIDGE_CLASS}`)
        .forEach(element => element.remove());
}

/**
 * SillyTavern owns extension installation and binds its updater through this DOM contract.
 * Keep the LittleWhiteBox surface as a presentation-only bridge so scope detection,
 * permissions, Git pulling, hooks, and result messages remain entirely host-owned.
 */
function createNativeUpdateBridge() {
    const bridge = document.createElement('span');
    bridge.className = `extensions_info ${NATIVE_UPDATE_BRIDGE_CLASS}`;

    const extensionBlock = document.createElement('span');
    extensionBlock.className = 'extension_block';
    extensionBlock.dataset.name = `/${EXT_FOLDER_ID}`;

    const button = document.createElement('button');
    button.id = UPDATE_BUTTON_ID;
    button.type = 'button';
    button.className = 'btn_update menu_button interactable has-update';
    button.dataset.name = `/${EXT_FOLDER_ID}`;
    button.title = '下载并安装小白X的更新';
    button.setAttribute('aria-label', button.title);

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-cloud-arrow-down fa-fw';
    button.appendChild(icon);
    extensionBlock.appendChild(button);
    bridge.appendChild(extensionBlock);
    return bridge;
}

function renderUpdateNotice() {
    if (!shouldShowUpdate) return;

    const settingsRoot = document.querySelector('.littlewhitebox');
    const drawer = settingsRoot?.closest('.inline-drawer');
    const header = drawer?.querySelector('.inline-drawer-header b');
    const divider = settingsRoot?.querySelector('.littlewhitebox-section-divider-top');
    if (header && !header.querySelector(`.${UPDATE_NOTICE_CLASS}`)) {
        const notice = document.createElement('small');
        notice.className = UPDATE_NOTICE_CLASS;
        notice.textContent = '(有可用更新)';
        header.appendChild(notice);
    }
    if (divider && !document.getElementById(UPDATE_BUTTON_ID)) {
        divider.appendChild(createNativeUpdateBridge());
    }

    if (header && divider) {
        stopRenderObserver();
    } else if (!renderObserver && document.body) {
        renderObserver = new MutationObserver(renderUpdateNotice);
        renderObserver.observe(document.body, { childList: true, subtree: true });
    }
}

async function checkForUpdate() {
    const result = await updateService.check();
    if (result.status === PLUGIN_UPDATE_STATUS.AVAILABLE) {
        shouldShowUpdate = true;
        renderUpdateNotice();
    } else if (result.status === PLUGIN_UPDATE_STATUS.CURRENT) {
        hideUpdateNotice();
    }
}

export function initPluginUpdate() {
    if (initialized) return;
    initialized = true;
    ensureStylesheet();
    eventSource.on(event_types.APP_READY, () => {
        setTimeout(() => void checkForUpdate(), 2000);
    });
}
