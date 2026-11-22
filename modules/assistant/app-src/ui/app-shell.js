import { deliveryPanelMarkup } from '../../plugins/delivery/panel.js';
import { buildAgentSettingsPanelMarkup } from '../../../agent-core/ui/settings-markup.js';
import { ACTIVITY_COPY as C } from './activity-copy.js';
import { chromeIcon } from './chrome-icons.js';
import { contextMeterMarkup } from './context-meter.js';

// Sidebar: API summary row (opens the full settings popover) above the
// workspace tree. The right column only ever shows the selected file.
export function buildAppMarkup(state) {
    const markup = `
        <div class="xb-assistant-shell ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''}">
            <header class="xb-assistant-topbar">
                <button id="xb-assistant-sidebar-toggle" type="button" class="xb-assistant-chrome-button xb-assistant-sidebar-toggle" aria-expanded="${!state.sidebarCollapsed}" aria-label="${C.sidebarToggle(state.sidebarCollapsed)}" title="${C.sidebarToggle(state.sidebarCollapsed)}">
                    ${chromeIcon('folder')}
                </button>
                <section class="xb-assistant-toolbar">
                    <div class="xb-assistant-toolbar-cluster">
                        ${contextMeterMarkup()}
                        <button id="xb-assistant-clear" type="button" class="xb-assistant-chrome-button" aria-label="${C.clearConversation}" title="${C.clearConversation}">${chromeIcon('clear')}</button>
                    </div>
                </section>
                <div class="xb-assistant-mobile-actions">
                    <button id="xb-assistant-mobile-minimize" type="button" class="xb-assistant-chrome-button" aria-label="${C.minimizeAssistant}" title="${C.minimizeAssistant}">${chromeIcon('minimize')}</button>
                    <button id="xb-assistant-mobile-close" type="button" class="xb-assistant-chrome-button" aria-label="${C.closeAssistant}" title="${C.closeAssistant}">${chromeIcon('close')}</button>
                </div>
            </header>
            <aside class="xb-assistant-sidebar ${state.sidebarCollapsed ? 'is-collapsed' : ''}" id="xb-assistant-sidebar">
                <div class="xb-assistant-sidebar-entries"><div class="xb-assistant-api-entry">
                    <button id="xb-assistant-api-summary" type="button" class="xb-assistant-api-summary" aria-haspopup="dialog" aria-expanded="false" aria-controls="xb-assistant-api-popover">
                        <span class="xb-assistant-api-summary-icon" aria-hidden="true">${chromeIcon('settings')}</span>
                        <span class="xb-assistant-api-summary-text">
                            <strong id="xb-assistant-api-summary-preset"></strong>
                            <small id="xb-assistant-api-summary-model"></small>
                        </span>
                    </button>
                    <section class="xb-assistant-api-popover" id="xb-assistant-api-popover" role="dialog" aria-label="${C.apiSettings}" hidden>
                        <header class="xb-assistant-api-popover-header">
                            <strong>${C.apiSettings}</strong>
                            <button id="xb-assistant-api-close" type="button" class="xb-assistant-chrome-button" aria-label="${C.closeApiSettings}" title="${C.closeApiSettings}">${chromeIcon('close')}</button>
                        </header>
                        <div class="xb-assistant-api-popover-body">
                            ${buildAgentSettingsPanelMarkup({
                                configSave: state.configSave,
                                inlineToastText: state.toast,
                                showInlineToast: false,
                                isBusy: state.isBusy,
                                canDeletePreset: (state.config?.presetNames || []).length > 1,
                                activePage: state.configPage,
                                runtimeText: '',
                                configLoadError: state.configLoadError,
                            })}
                        </div>
                    </section>
                </div>
                ${deliveryPanelMarkup()}
                </div>
                <div class="xb-assistant-sidebar-tree" id="xb-assistant-workspace-nav"></div>
            </aside>
            <div class="xb-assistant-mobile-backdrop" id="xb-assistant-mobile-backdrop" hidden></div>
            <main class="xb-assistant-main">
                <div class="xb-assistant-main-body">
                    <section class="xb-assistant-conversation">
                        <section class="xb-assistant-chat-wrap">
                            <section class="xb-assistant-chat" id="xb-assistant-chat"></section>
                            <div class="xb-assistant-scroll-helpers" id="xb-assistant-scroll-helpers">
                                <button id="xb-assistant-scroll-top" type="button" class="xb-assistant-scroll-btn" title="回到顶部" aria-label="回到顶部">▲</button>
                                <button id="xb-assistant-scroll-bottom" type="button" class="xb-assistant-scroll-btn" title="回到底部" aria-label="回到底部">▼</button>
                            </div>
                        </section>
                        <section class="xb-assistant-approval-slot" id="xb-assistant-approval-slot"></section>
                        <form class="xb-assistant-compose" id="xb-assistant-form">
                            <div class="xb-assistant-toast xb-assistant-chat-toast" id="xb-assistant-toast" aria-live="polite"></div>
                            <div class="xb-assistant-compose-row">
                                <div class="xb-assistant-compose-more" id="xb-assistant-compose-more">
                                    <button id="xb-assistant-compose-menu-toggle" type="button" class="secondary ghost xb-assistant-compose-menu-toggle" aria-expanded="false" aria-haspopup="true" title="更多操作">+</button>
                                    <div class="xb-assistant-compose-menu" id="xb-assistant-compose-menu" hidden>
                                        <button id="xb-assistant-add-image" type="button" class="xb-assistant-compose-menu-item">
                                            <span class="xb-assistant-compose-menu-icon" aria-hidden="true">📷</span>
                                            <span class="xb-assistant-compose-menu-label">发送图片</span>
                                        </button>
                                        <button id="xb-assistant-add-local-files" type="button" class="xb-assistant-compose-menu-item">
                                            <span class="xb-assistant-compose-menu-icon" aria-hidden="true">📄</span>
                                            <span class="xb-assistant-compose-menu-label">选择文件</span>
                                        </button>
                                        <button id="xb-assistant-add-local-directory" type="button" class="xb-assistant-compose-menu-item">
                                            <span class="xb-assistant-compose-menu-icon" aria-hidden="true">📁</span>
                                            <span class="xb-assistant-compose-menu-label">选择文件夹</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="xb-assistant-compose-main">
                                    <textarea id="xb-assistant-input" rows="1" aria-label="${C.input}" placeholder=""></textarea>
                                </div>
                                <button id="xb-assistant-send" type="submit">发送</button>
                            </div>
                            <div class="xb-assistant-compose-extras">
                                <div class="xb-assistant-context-hint" id="xb-assistant-context-hint" hidden></div>
                                <div class="xb-assistant-import-progress" id="xb-assistant-import-progress" hidden></div>
                                <div class="xb-assistant-attachment-gallery xb-assistant-draft-gallery" id="xb-assistant-draft-gallery" style="display:none;"></div>
                                <input id="xb-assistant-image-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden />
                                <input id="xb-assistant-local-file-input" type="file" multiple hidden />
                                <input id="xb-assistant-local-directory-input" type="file" multiple webkitdirectory hidden />
                            </div>
                        </form>
                    </section>
                    <div class="xb-assistant-workspace-backdrop" id="xb-assistant-workspace-backdrop" hidden></div>
                    <aside class="xb-assistant-workspace" id="xb-assistant-workspace">
                        <div class="xb-assistant-workspace-resizer" id="xb-assistant-workspace-resizer" aria-hidden="true"></div>
                        <div class="xb-assistant-workspace-panel" id="xb-assistant-workspace-panel"></div>
                    </aside>
                </div>
            </main>
        </div>
    `;
    return markup;
}
