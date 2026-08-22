import { eventSource, event_types, getRequestHeaders } from '../../../../../../script.js';
import { extensionTypes } from '../../../../../extensions.js';
import { EXT_FOLDER_ID, extensionFolderPath } from '../../core/constants.js';
import { createPluginUpdateService, PLUGIN_UPDATE_STATUS } from './update-service.js';

const UPDATE_BUTTON_ID = 'littlewhitebox-update-extension';
const UPDATE_NOTICE_CLASS = 'littlewhitebox-update-text';
const UPDATE_STYLESHEET_ID = 'littlewhitebox-plugin-update-style';
const RELOAD_DELAY_MS = 1000;

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
    document.querySelectorAll(`.${UPDATE_NOTICE_CLASS}, #${UPDATE_BUTTON_ID}`).forEach(element => element.remove());
}

async function handleUpdateClick(button) {
    button.disabled = true;
    button.classList.add('updating');
    try {
        const result = await updateService.install();
        if (result.status === PLUGIN_UPDATE_STATUS.UPDATED) {
            hideUpdateNotice();
            toastr.success('即将重新加载页面以使插件生效', '小白X更新成功');
            setTimeout(() => window.location.reload(), RELOAD_DELAY_MS);
            return;
        }
        if (result.status === PLUGIN_UPDATE_STATUS.CURRENT) {
            hideUpdateNotice();
            toastr.success('小白X已是最新版本');
            return;
        }
        toastr.error(result.errorText || '请稍后重试', '小白X更新失败', { timeOut: 5000 });
    } finally {
        if (button.isConnected) {
            button.disabled = false;
            button.classList.remove('updating');
        }
    }
}

function createUpdateButton() {
    const button = document.createElement('button');
    button.id = UPDATE_BUTTON_ID;
    button.type = 'button';
    button.className = 'menu_button interactable has-update';
    button.title = '下载并安装小白X的更新';
    button.setAttribute('aria-label', button.title);

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-cloud-arrow-down fa-fw';
    button.appendChild(icon);
    button.addEventListener('click', () => void handleUpdateClick(button));
    return button;
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
        divider.appendChild(createUpdateButton());
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
