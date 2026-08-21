import { eventSource, event_types, getRequestHeaders } from '../../../../../../script.js';
import { extensionTypes } from '../../../../../extensions.js';
import { EXT_FOLDER_ID, extensionFolderPath } from '../../core/constants.js';
import { createPluginUpdateService, PLUGIN_UPDATE_STATUS } from './update-service.js';

const UPDATE_BUTTON_ID = 'littlewhitebox-update-extension';
const UPDATE_NOTICE_CLASS = 'littlewhitebox-update-text';
const UPDATE_STYLESHEET_ID = 'littlewhitebox-plugin-update-style';

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

function scheduleReload(delay) {
    setTimeout(() => window.location.reload(), delay);
}

async function handleUpdateClick(button) {
    button.disabled = true;
    button.classList.add('updating');
    try {
        const result = await updateService.install();
        if (result.status === PLUGIN_UPDATE_STATUS.UPDATED) {
            hideUpdateNotice();
            toastr.success('LittleWhiteBox 更新完成，页面即将刷新', '正在应用更新');
            scheduleReload(1000);
            return;
        }
        if (result.status === PLUGIN_UPDATE_STATUS.CURRENT) {
            hideUpdateNotice();
            if (result.reloadRequired) {
                toastr.success('LittleWhiteBox 当前已是最新，页面即将刷新应用');
                scheduleReload(1000);
            } else {
                toastr.success('LittleWhiteBox 已是最新版本');
            }
            return;
        }
        if (result.status === PLUGIN_UPDATE_STATUS.UNCONFIRMED) {
            hideUpdateNotice();
            toastr.warning('服务器未能确认更新结果，页面即将刷新核对', 'LittleWhiteBox 更新结果待确认');
            scheduleReload(1500);
            return;
        }
        toastr.error(result.errorText || '更新失败，请稍后重试', 'LittleWhiteBox 更新失败', { timeOut: 5000 });
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
    button.className = 'menu_button fa-solid fa-cloud-arrow-down interactable has-update';
    button.title = '下载并安装小白X的更新';
    button.setAttribute('aria-label', button.title);
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
