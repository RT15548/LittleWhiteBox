export function buildAppMarkup(state) {
    const markup = `
        <div class="xb-assistant-shell ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''}">
            <aside class="xb-assistant-sidebar ${state.sidebarCollapsed ? 'is-collapsed' : ''}">
                <div class="xb-assistant-sidebar-header">
                    <div class="xb-assistant-badge">API配置</div>
                    <button id="xb-assistant-sidebar-toggle" type="button" class="xb-assistant-sidebar-toggle" aria-expanded="${state.sidebarCollapsed ? 'false' : 'true'}" aria-label="${state.sidebarCollapsed ? '展开 API 配置' : '收起 API 配置'}" title="${state.sidebarCollapsed ? '展开 API 配置' : '收起 API 配置'}">
                        <span class="xb-assistant-sidebar-toggle-text"></span>
                        <span class="xb-assistant-sidebar-toggle-icon"></span>
                    </button>
                </div>
                <div class="xb-assistant-sidebar-content" ${state.sidebarCollapsed ? 'hidden' : ''}>
                    <div class="xb-assistant-brand">
                    </div>
                    <section class="xb-assistant-config">
                    <label>
                        <span>已存预设</span>
                        <select id="xb-assistant-preset-select"></select>
                    </label>
                    <label>
                        <span>预设名称</span>
                        <input id="xb-assistant-preset-name" type="text" placeholder="例如：OpenAI 测试号" />
                    </label>
                    <label>
                        <span>Provider</span>
                        <select id="xb-assistant-provider">
                            <option value="openai-responses">OpenAI Responses</option>
                            <option value="openai-compatible">OpenAI-compatible</option>
                            <option value="anthropic">Anthropic</option>
                            <option value="google">Google AI</option>
                        </select>
                    </label>
                    <label>
                        <span>Base URL</span>
                        <input id="xb-assistant-base-url" type="text" />
                    </label>
                    <label>
                        <span>API Key</span>
                        <div class="xb-assistant-inline-input">
                            <input id="xb-assistant-api-key" type="password" />
                            <button id="xb-assistant-toggle-key" type="button" class="secondary ghost">显示</button>
                        </div>
                    </label>
                    <label>
                        <span>Model</span>
                        <input id="xb-assistant-model" type="text" />
                    </label>
                    <div class="xb-assistant-inline-input xb-assistant-model-row">
                        <label class="xb-assistant-grow">
                            <span>已拉取模型</span>
                            <select id="xb-assistant-model-pulled">
                                <option value="">手动填写</option>
                            </select>
                        </label>
                        <button id="xb-assistant-pull-models" type="button" class="secondary">拉取模型</button>
                    </div>
                    <label id="xb-assistant-tool-mode-wrap">
                        <span>Tool 调用格式</span>
                        <select id="xb-assistant-tool-mode"></select>
                    </label>
                    <label>
                        <span>斜杠命令权限</span>
                        <select id="xb-assistant-permission-mode"></select>
                    </label>
                    <label>
                        <span>JavaScript API 权限</span>
                        <select id="xb-assistant-jsapi-permission"></select>
                    </label>
                    <label class="xb-assistant-checkbox-row">
                        <span>思考模式</span>
                        <span class="xb-assistant-checkbox-control">
                            <input id="xb-assistant-reasoning-enabled" type="checkbox" />
                            <span>开启</span>
                        </span>
                    </label>
                    <label id="xb-assistant-reasoning-effort-wrap">
                        <span>思考强度</span>
                        <select id="xb-assistant-reasoning-effort"></select>
                    </label>
                    <div class="xb-assistant-actions">
                        <button id="xb-assistant-save" type="button">保存配置</button>
                        <button id="xb-assistant-delete-preset" type="button" class="secondary">删除配置</button>
                    </div>
                    <div class="xb-assistant-runtime" id="xb-assistant-runtime"></div>
                    <div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite"></div>
                    </section>
                </div>
            </aside>
            <div class="xb-assistant-mobile-backdrop" id="xb-assistant-mobile-backdrop" ${state.sidebarCollapsed ? 'hidden' : ''}></div>
            <main class="xb-assistant-main">
                <div class="xb-assistant-mobile-topbar">
                    <section class="xb-assistant-toolbar">
                            <div class="xb-assistant-toolbar-cluster">
                                <div class="xb-assistant-status" id="xb-assistant-status"></div>
                                <div class="xb-assistant-context-meter" id="xb-assistant-context-meter" title="当前实际送模上下文 / 最大上下文"></div>
                                <button id="xb-assistant-clear" type="button" class="secondary ghost">清空对话</button>
                                <button id="xb-assistant-open-workspace" type="button" class="secondary ghost">工作区</button>
                            </div>
                        <button id="xb-assistant-mobile-settings" type="button" class="secondary ghost xb-assistant-mobile-settings">设置</button>
                    </section>
                    <button id="xb-assistant-mobile-close" type="button" class="xb-assistant-mobile-close" hidden>关闭</button>
                </div>
                <div class="xb-assistant-main-body ${state.isWorkspaceOpen ? 'workspace-open' : ''}">
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
                            <div class="xb-assistant-compose-row">
                                <div class="xb-assistant-compose-main">
                                    <textarea id="xb-assistant-input" placeholder=""></textarea>
                                </div>
                                <div class="xb-assistant-compose-actions">
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
                                    <button id="xb-assistant-send" type="submit">发送</button>
                                </div>
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
                    <aside class="xb-assistant-workspace ${state.isWorkspaceOpen ? 'is-open' : ''}" id="xb-assistant-workspace" aria-hidden="${state.isWorkspaceOpen ? 'false' : 'true'}">
                        <div class="xb-assistant-workspace-resizer" id="xb-assistant-workspace-resizer" aria-hidden="true"></div>
                        <div class="xb-assistant-workspace-panel" id="xb-assistant-workspace-panel"></div>
                    </aside>
                </div>
            </main>
        </div>
    `;
    return markup;
}
