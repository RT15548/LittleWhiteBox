const STYLE_DATA_ATTRIBUTE = 'data-xb-assistant-styles';

export function injectAssistantStyles(rootId) {
    if (document.head.querySelector(`style[${STYLE_DATA_ATTRIBUTE}="true"]`)) {
        return;
    }
    const style = document.createElement('style');
    style.setAttribute(STYLE_DATA_ATTRIBUTE, 'true');
    style.textContent = `
        :root { color-scheme: light; font-family: "Noto Sans SC", "Microsoft YaHei", sans-serif; }
        html, body { height: 100%; width: 100%; overflow: hidden; }
        body {
            margin: 0;
            background:
                radial-gradient(circle at top left, rgba(255, 223, 178, 0.72), transparent 34%),
                radial-gradient(circle at top right, rgba(154, 210, 255, 0.58), transparent 28%),
                linear-gradient(180deg, #f6f8fb 0%, #eef3f8 100%);
            color: #142033;
            overflow-x: hidden;
        }
        #${rootId} { width: 100%; height: 100%; overflow: hidden; box-sizing: border-box; }
        .xb-assistant-shell {
            position: relative;
            display: grid;
            grid-template-columns: 340px minmax(0, 1fr);
            height: 100%;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            box-sizing: border-box;
            transition: grid-template-columns 0.22s ease;
        }
        .xb-assistant-shell.sidebar-collapsed { grid-template-columns: 56px minmax(0, 1fr); }
        .xb-assistant-sidebar {
            position: relative;
            display: grid;
            grid-template-rows: auto minmax(0, 1fr);
            padding: 24px 20px;
            background: rgba(255, 255, 255, 0.82);
            border-right: 1px solid rgba(20, 32, 51, 0.08);
            backdrop-filter: blur(14px);
            overflow: hidden;
            box-sizing: border-box;
            transition: padding 0.22s ease;
        }
        .xb-assistant-mobile-settings,
        .xb-assistant-mobile-close,
        .xb-assistant-mobile-backdrop {
            display: none;
        }
        .xb-assistant-sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }
        .xb-assistant-sidebar.is-collapsed {
            padding: 14px 10px;
            overflow: hidden;
        }
        .xb-assistant-sidebar-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 36px;
            padding: 0 10px;
            border: none;
            border-radius: 12px;
            background: rgba(20, 32, 51, 0.88);
            color: #fff6e9;
            cursor: pointer;
            box-shadow: 0 10px 24px rgba(17, 31, 51, 0.12);
            transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
        }
        .xb-assistant-sidebar-toggle:hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 28px rgba(17, 31, 51, 0.16);
        }
        .xb-assistant-sidebar-toggle-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            line-height: 1;
        }
        .xb-assistant-sidebar-toggle-text {
            display: none;
            font-size: 13px;
            font-weight: 600;
            line-height: 1;
        }
        .xb-assistant-sidebar-content {
            display: grid;
            gap: 16px;
            margin-top: 16px;
            min-width: 0;
            min-height: 0;
            overflow: auto;
            opacity: 1;
            transition: opacity 0.18s ease;
        }
        .xb-assistant-sidebar-content[hidden] {
            display: none !important;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-sidebar-content {
            opacity: 0;
            pointer-events: none;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-brand,
        .xb-assistant-sidebar.is-collapsed .xb-assistant-config {
            display: none;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-badge {
            display: none;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-sidebar-header {
            justify-content: center;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-sidebar-toggle {
            width: 36px;
            min-width: 36px;
            height: 36px;
            padding: 0;
        }
        .xb-assistant-brand h1 { margin: 12px 0 8px; font-size: 30px; }
        .xb-assistant-brand p { margin: 0 0 18px; color: #4b5a70; line-height: 1.55; }
        .xb-assistant-badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 999px;
            background: #142033;
            color: #fff6e9;
            font-size: 13px;
            letter-spacing: 0.08em;
        }
        .xb-assistant-config { display: grid; gap: 12px; }
        .xb-assistant-config label { display: grid; gap: 6px; font-size: 13px; color: #41526a; }
        .xb-assistant-config input,
        .xb-assistant-config select,
        .xb-assistant-compose textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid rgba(27, 55, 88, 0.14);
            border-radius: 14px;
            padding: 12px 14px;
            font: inherit;
            background: rgba(255, 255, 255, 0.9);
        }
        .xb-assistant-inline-input {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 8px;
            align-items: center;
        }
        .xb-assistant-grow { min-width: 0; }
        .xb-assistant-model-row { align-items: end; }
        .xb-assistant-checkbox-row {
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
        }
        .xb-assistant-checkbox-control {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #1b3758;
            font-size: 14px;
        }
        .xb-assistant-help {
            margin-top: -2px;
            padding: 10px 12px;
            border-radius: 14px;
            background: rgba(27, 55, 88, 0.05);
            color: #52637a;
            font-size: 12px;
            line-height: 1.65;
        }
        .xb-assistant-help code {
            padding: 0.08em 0.34em;
            border-radius: 8px;
            background: rgba(20, 32, 51, 0.08);
            font-family: "Cascadia Code", "Consolas", monospace;
        }
        .xb-assistant-checkbox-control input {
            width: 16px;
            height: 16px;
            accent-color: #1b3758;
        }
        .xb-assistant-actions,
        .xb-assistant-toolbar {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
            justify-content: flex-start;
            min-width: 0;
        }
        .xb-assistant-actions {
            gap: 8px;
            flex-wrap: wrap;
        }
        .xb-assistant-toolbar-cluster {
            display: inline-flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            flex: 1 1 auto;
            min-width: 0;
        }
        .xb-assistant-actions button,
        .xb-assistant-toolbar button,
        .xb-assistant-compose button {
            border: none;
            border-radius: 999px;
            min-height: 40px;
            padding: 0 16px;
            background: #1b3758;
            color: #fff;
            cursor: pointer;
            font: inherit;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.01em;
            box-shadow: 0 10px 24px rgba(27, 55, 88, 0.12);
            transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease, color 0.16s ease;
        }
        .xb-assistant-save-button.is-saving,
        .xb-assistant-save-button.is-success,
        .xb-assistant-save-button.is-error {
            pointer-events: none;
        }
        .xb-assistant-save-button.is-saving {
            opacity: 0.86;
        }
        .xb-assistant-save-button.is-success {
            background: #3fb950;
            color: #fff;
            box-shadow: 0 14px 28px rgba(63, 185, 80, 0.22);
        }
        .xb-assistant-save-button.is-error {
            background: #f85149;
            color: #fff;
            box-shadow: 0 14px 28px rgba(248, 81, 73, 0.22);
        }
        .xb-assistant-save-button .xb-assistant-save-spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            margin-right: 8px;
            border-radius: 999px;
            border: 2px solid currentColor;
            border-right-color: transparent;
            vertical-align: -2px;
            animation: xb-assistant-spin 0.85s linear infinite;
        }
        .xb-assistant-actions button:hover,
        .xb-assistant-toolbar button:hover,
        .xb-assistant-compose button:hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 28px rgba(27, 55, 88, 0.16);
        }
        .xb-assistant-toolbar button.is-active {
            background: #1b3758;
            color: #fff;
        }
        .xb-assistant-actions button.secondary,
        .xb-assistant-toolbar button.secondary,
        .xb-assistant-compose button.secondary {
            background: rgba(255, 255, 255, 0.9);
            color: #1b3758;
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.12);
        }
        .xb-assistant-actions button.ghost,
        .xb-assistant-toolbar button.ghost,
        .xb-assistant-compose button.ghost,
        .xb-assistant-inline-input button.ghost {
            padding-inline: 14px;
            background: rgba(255, 255, 255, 0.74);
            color: #1b3758;
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.1);
        }
        .xb-assistant-actions button:disabled,
        .xb-assistant-toolbar button:disabled,
        .xb-assistant-compose button:disabled {
            opacity: 0.52;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        .xb-assistant-runtime {
            font-size: 12px;
            color: #5a6a81;
            min-height: 18px;
            line-height: 1.6;
        }
        .xb-assistant-main {
            display: grid;
            grid-template-rows: auto minmax(0, 1fr);
            padding: 20px;
            gap: 16px;
            min-height: 0;
            height: 100%;
            min-width: 0;
            max-width: 100%;
            overflow: hidden;
            box-sizing: border-box;
        }
        .xb-assistant-main-body {
            position: relative;
            display: grid;
            grid-template-columns: minmax(0, 1fr) 0;
            gap: 16px;
            min-height: 0;
            min-width: 0;
            transition: grid-template-columns 0.2s ease;
        }
        .xb-assistant-main-body.workspace-open {
            grid-template-columns: minmax(0, 1fr) var(--xb-assistant-workspace-width, 520px);
        }
        .xb-assistant-conversation {
            display: grid;
            grid-template-rows: minmax(0, 1fr) auto auto;
            gap: 16px;
            min-width: 0;
            min-height: 0;
            overflow: hidden;
        }
        .xb-assistant-status {
            display: inline-flex;
            align-items: center;
            min-height: 20px;
            padding: 9px 14px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.84);
            color: #41526a;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 10px 24px rgba(17, 31, 51, 0.06);
        }
        .xb-assistant-context-meter {
            display: inline-flex;
            align-items: center;
            min-height: 20px;
            padding: 9px 14px;
            border-radius: 999px;
            background: rgba(27, 55, 88, 0.09);
            color: #1b3758;
            font-size: 12px;
            font-weight: 600;
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.08);
        }
        .xb-assistant-context-meter.summary-active {
            background: rgba(201, 107, 51, 0.12);
            color: #8d442b;
            box-shadow: inset 0 0 0 1px rgba(201, 107, 51, 0.18);
        }
        .xb-assistant-chat-wrap {
            position: relative;
            display: flex;
            min-height: 0;
            min-width: 0;
            height: 100%;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            box-sizing: border-box;
        }
        .xb-assistant-workspace {
            position: relative;
            display: none;
            min-width: 0;
            min-height: 0;
        }
        .xb-assistant-workspace.is-open {
            display: block;
        }
        .xb-assistant-workspace-resizer {
            position: absolute;
            left: -10px;
            top: 0;
            bottom: 0;
            width: 20px;
            cursor: col-resize;
            z-index: 2;
        }
        .xb-assistant-workspace-panel {
            position: relative;
            height: 100%;
            min-height: 0;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.84);
            border: 1px solid rgba(27, 55, 88, 0.1);
            box-shadow: 0 20px 40px rgba(17, 31, 51, 0.08);
            backdrop-filter: blur(14px);
            overflow: hidden;
            user-select: none;
        }
        .xb-assistant-workspace-backdrop {
            display: none;
        }
        .xb-assistant-workspace-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 14px 16px;
            border-bottom: 1px solid rgba(27, 55, 88, 0.08);
        }
        .xb-assistant-workspace-header-info {
            display: grid;
            gap: 4px;
            min-width: 0;
        }
        .xb-assistant-workspace-header-info strong {
            font-size: 14px;
            color: #1b3758;
        }
        .xb-assistant-workspace-header-info span {
            color: #586a82;
            font-size: 12px;
        }
        .xb-assistant-workspace-header-actions,
        .xb-assistant-workspace-viewer-actions {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
            justify-content: flex-end;
        }
        .xb-assistant-workspace-header-button,
        .xb-assistant-workspace-viewer-button,
        .xb-assistant-workspace-mode-button {
            border: none;
            border-radius: 6px;
            min-height: 24px;
            padding: 0 10px;
            background: transparent;
            color: #4a5c75;
            cursor: pointer;
            font: inherit;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.15s ease;
        }
        .xb-assistant-workspace-header-button:hover,
        .xb-assistant-workspace-viewer-button:hover,
        .xb-assistant-workspace-mode-button:hover {
            background: rgba(27, 55, 88, 0.06);
            color: #17304d;
        }
        .xb-assistant-workspace-header-button.is-icon {
            min-width: 28px;
            min-height: 28px;
            padding: 0;
            font-size: 18px;
            line-height: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .xb-assistant-workspace-mode-button.is-active {
            background: rgba(27, 55, 88, 0.1);
            color: #17304d;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .xb-assistant-workspace-body {
            display: grid;
            grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
            height: 100%;
            min-height: 0;
        }
        .xb-assistant-workspace-nav {
            display: grid;
            grid-template-rows: auto auto minmax(0, 1fr);
            min-width: 0;
            min-height: 0;
            border-right: 1px solid rgba(27, 55, 88, 0.08);
            background: rgba(247, 249, 252, 0.82);
        }
        .xb-assistant-workspace-filters {
            display: grid;
            gap: 10px;
            padding: 14px;
            border-bottom: 1px solid rgba(27, 55, 88, 0.08);
        }
        .xb-assistant-workspace-nav-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        .xb-assistant-workspace-nav-title {
            min-width: 0;
            color: #1b3758;
            font-size: 14px;
        }
        .xb-assistant-workspace-nav-header-actions {
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        .xb-assistant-workspace-select,
        .xb-assistant-workspace-search {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid rgba(27, 55, 88, 0.14);
            border-radius: 12px;
            padding: 10px 12px;
            font: inherit;
            background: rgba(255, 255, 255, 0.92);
        }
        .xb-assistant-workspace-modified-toggle {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #41526a;
            font-size: 12px;
            font-weight: 600;
        }
        .xb-assistant-workspace-tree-actions {
            display: grid;
            gap: 10px;
            padding: 12px 14px;
            border-bottom: 1px solid rgba(27, 55, 88, 0.08);
            background: rgba(242, 246, 250, 0.9);
        }
        .xb-assistant-workspace-tree-actions-context {
            display: grid;
            gap: 4px;
            min-width: 0;
        }
        .xb-assistant-workspace-tree-actions-title {
            color: #1b3758;
            font-size: 12px;
        }
        .xb-assistant-workspace-tree-actions-path {
            min-width: 0;
            color: #5a6b82;
            font-size: 11px;
            line-height: 1.5;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-assistant-workspace-tree-actions-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
        .xb-assistant-workspace-tree {
            min-height: 0;
            overflow: auto;
            padding: 8px 8px 14px;
        }
        .xb-assistant-workspace-tree-row {
            margin-top: 2px;
        }
        .xb-assistant-workspace-tree-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            min-height: 32px;
            padding: 0 10px;
            border: none;
            border-radius: 10px;
            background: transparent;
            color: #2a425f;
            cursor: pointer;
            font: inherit;
            font-size: 12px;
            text-align: left;
        }
        .xb-assistant-workspace-tree-row.is-selected .xb-assistant-workspace-tree-button {
            background: rgba(27, 55, 88, 0.12);
            color: #1b3758;
            font-weight: 700;
        }
        .xb-assistant-workspace-tree-button:hover {
            background: rgba(27, 55, 88, 0.08);
        }
        .xb-assistant-workspace-tree-caret {
            width: 12px;
            color: #667990;
            flex: 0 0 12px;
        }
        .xb-assistant-workspace-tree-label {
            min-width: 0;
            flex: 1 1 auto;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-assistant-workspace-tree-badge {
            color: #c96b33;
            font-size: 12px;
            flex: 0 0 auto;
        }
        .xb-assistant-workspace-tree-empty,
        .xb-assistant-workspace-empty {
            display: grid;
            gap: 8px;
            place-items: center;
            padding: 28px;
            color: #5d6f87;
            text-align: center;
            line-height: 1.6;
        }
        .xb-assistant-workspace-empty strong {
            color: #1b3758;
        }
        .xb-assistant-workspace-viewer {
            display: grid;
            grid-template-rows: auto minmax(0, 1fr);
            min-width: 0;
            min-height: 0;
            background: rgba(255, 255, 255, 0.78);
        }
        .xb-assistant-workspace-viewer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 8px 12px;
            border-bottom: 1px solid rgba(27, 55, 88, 0.08);
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            z-index: 10;
        }
        .xb-assistant-workspace-mobile-back {
            display: none;
            background: transparent;
            border: none;
            color: #1b3758;
            cursor: pointer;
            padding: 0;
            margin-right: 8px;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
        }
        .xb-assistant-workspace-viewer-info {
            display: flex;
            align-items: center;
            min-width: 0;
        }
        .xb-assistant-workspace-viewer-info-text {
            display: grid;
            gap: 4px;
            min-width: 0;
        }
        .xb-assistant-workspace-viewer-info-text strong,
        .xb-assistant-workspace-viewer-info-text span {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-assistant-workspace-viewer-info-text strong {
            color: #17304d;
            font-size: 13px;
        }
        .xb-assistant-workspace-viewer-info-text span {
            color: #5e6f84;
            font-size: 12px;
        }
        .xb-assistant-workspace-code-wrap {
            min-width: 0;
            min-height: 0;
            overflow: auto;
            padding: 0 0 16px;
        }
        .xb-assistant-workspace-code {
            min-width: max-content;
            padding: 8px 0 0;
            font-family: "Cascadia Code", "Consolas", monospace;
            font-size: 12px;
            line-height: 1.6;
        }
        .xb-assistant-workspace-editor {
            width: 100%;
            min-width: max-content;
            min-height: 100%;
            background: transparent;
        }
        .xb-assistant-workspace-editor .cm-editor {
            min-height: 100%;
        }
        .xb-assistant-workspace-editor .cm-scroller {
            min-height: 100%;
        }
        .xb-assistant-workspace-code-row {
            display: grid;
            grid-template-columns: 56px 20px minmax(0, 1fr);
            align-items: start;
            gap: 0;
        }
        .xb-assistant-workspace-code.mode-diff .xb-assistant-workspace-code-row,
        .xb-assistant-workspace-code-row.mode-diff {
            grid-template-columns: 56px 56px 20px minmax(0, 1fr);
        }
        .xb-assistant-workspace-code-num,
        .xb-assistant-workspace-code-marker {
            padding: 0 10px;
            color: #8a97aa;
            user-select: none;
            text-align: right;
        }
        .xb-assistant-workspace-code-marker {
            text-align: center;
        }
        .xb-assistant-workspace-code-text {
            padding: 0 14px 0 0;
            white-space: pre;
            color: #1c314d;
            user-select: text;
        }
        .xb-assistant-workspace-code-marker.add,
        .xb-assistant-workspace-code-row .xb-assistant-workspace-code-marker.add {
            color: #1f7a4b;
        }
        .xb-assistant-workspace-code-marker.remove {
            color: #b54a3d;
        }
        .xb-assistant-workspace-code-row.kind-add {
            background: rgba(63, 185, 80, 0.08);
        }
        .xb-assistant-workspace-code-row.kind-remove {
            background: rgba(248, 81, 73, 0.08);
        }
        .xb-assistant-status.busy::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            margin-right: 8px;
            border-radius: 999px;
            background: #c96b33;
            box-shadow: 0 0 0 rgba(201, 107, 51, 0.35);
            animation: xb-assistant-pulse 1.2s ease infinite;
            vertical-align: middle;
        }
        .xb-assistant-chat {
            flex: 1 1 auto;
            height: 100%;
            min-height: 0;
            overflow: auto;
            overflow-x: hidden;
            padding: 4px;
            display: grid;
            gap: 12px;
            align-content: start;
            justify-items: start;
            grid-auto-rows: max-content;
            width: 100%;
            min-width: 0;
            max-width: 100%;
            overscroll-behavior: contain;
        }
        .xb-assistant-scroll-helpers {
            position: absolute;
            top: 12%;
            right: 10px;
            bottom: 12%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.25s ease;
        }
        .xb-assistant-scroll-helpers.active {
            opacity: 1;
        }
        .xb-assistant-scroll-btn {
            width: 32px;
            height: 32px;
            border: 1px solid rgba(27, 55, 88, 0.14);
            border-radius: 999px;
            background: rgba(244, 248, 252, 0.92);
            color: #1b3758;
            cursor: pointer;
            pointer-events: none;
            opacity: 0;
            transform: scale(0.8) translateX(8px);
            transition: all 0.2s ease;
            box-shadow: 0 10px 24px rgba(17, 31, 51, 0.08);
            font: inherit;
            font-size: 12px;
            font-weight: 700;
        }
        .xb-assistant-scroll-btn.visible {
            opacity: 1;
            pointer-events: auto;
            transform: scale(1) translateX(0);
        }
        .xb-assistant-scroll-btn:hover {
            background: rgba(255, 255, 255, 0.98);
            transform: scale(1.08) translateX(0);
        }
        .xb-assistant-scroll-btn:active {
            transform: scale(0.96) translateX(0);
        }
        .xb-assistant-approval-slot {
            display: grid;
            gap: 12px;
            margin-top: 10px;
        }
        .xb-assistant-approval-slot:empty {
            display: none;
        }
        .xb-assistant-empty {
            align-self: center;
            justify-self: center;
            max-width: 720px;
            padding: 24px 28px;
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.82);
            box-shadow: 0 18px 48px rgba(17, 31, 51, 0.08);
        }
        .xb-assistant-empty h2 { margin: 0 0 10px; font-size: 24px; }
        .xb-assistant-empty p { margin: 0; color: #4b5a70; line-height: 1.7; }
        .xb-assistant-empty p + p { margin-top: 8px; }
        .xb-assistant-bubble {
            width: calc(100% - 20px);
            max-width: calc(100% - 20px);
            min-width: 0;
            box-sizing: border-box;
            border-radius: 18px;
            padding: 14px 16px;
            box-shadow: 0 12px 30px rgba(17, 31, 51, 0.07);
            align-self: start;
            overflow-wrap: anywhere;
        }
        .xb-assistant-bubble.role-user {
            justify-self: end;
            background: linear-gradient(135deg, #1b3758 0%, #285786 100%);
            color: white;
        }
        .xb-assistant-bubble.role-assistant { background: rgba(255, 255, 255, 0.9); }
        .xb-assistant-bubble.role-assistant.is-tool-call {
            background: transparent;
            border: none;
            box-shadow: none;
        }
        .xb-assistant-bubble.role-tool {
            background: transparent;
            border: 1px dashed rgba(27, 55, 88, 0.18);
        }
        .xb-assistant-meta-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 6px;
        }
        .xb-assistant-meta {
            flex: 1 1 auto;
            min-width: 0;
            font-size: 12px;
            opacity: 0.78;
        }
        .xb-assistant-bubble.is-tool-call .xb-assistant-meta { margin-bottom: 0; }
        .xb-assistant-message-actions {
            display: inline-flex;
            flex: 0 0 auto;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 6px;
        }
        .xb-assistant-message-action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 0;
            padding: 4px 9px;
            border: 1px solid rgba(27, 55, 88, 0.12);
            border-radius: 999px;
            background: rgba(247, 250, 253, 0.96);
            color: #304862;
            font-size: 12px;
            line-height: 1.1;
            cursor: pointer;
            transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
        }
        .xb-assistant-message-action:hover:not(:disabled) {
            background: rgba(230, 238, 247, 0.98);
            border-color: rgba(27, 55, 88, 0.22);
            color: #203249;
        }
        .xb-assistant-message-action:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .xb-assistant-message-editor-wrap {
            min-width: 0;
        }
        .xb-assistant-message-editor {
            width: 100%;
            min-height: 108px;
            box-sizing: border-box;
            resize: vertical;
            padding: 12px 14px;
            border: 1px solid rgba(27, 55, 88, 0.14);
            border-radius: 14px;
            background: rgba(252, 253, 255, 0.96);
            color: #203249;
            font: inherit;
            line-height: 1.7;
        }
        .xb-assistant-message-editor:focus {
            outline: none;
            border-color: rgba(40, 87, 134, 0.48);
            box-shadow: 0 0 0 3px rgba(40, 87, 134, 0.12);
        }
        .xb-assistant-content {
            margin: 0;
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
            white-space: pre-wrap;
            word-break: break-word;
            font: inherit;
        }
        .xb-assistant-markdown {
            min-width: 0;
            max-width: 100%;
            white-space: normal;
            line-height: 1.7;
            overflow-wrap: anywhere;
        }
        .xb-assistant-markdown > *:first-child { margin-top: 0; }
        .xb-assistant-markdown > *:last-child { margin-bottom: 0; }
        .xb-assistant-markdown p,
        .xb-assistant-markdown ul,
        .xb-assistant-markdown ol,
        .xb-assistant-markdown pre,
        .xb-assistant-markdown blockquote,
        .xb-assistant-markdown table,
        .xb-assistant-markdown h1,
        .xb-assistant-markdown h2,
        .xb-assistant-markdown h3,
        .xb-assistant-markdown h4 {
            margin: 0 0 0.8em;
        }
        .xb-assistant-markdown code {
            padding: 0.12em 0.38em;
            border-radius: 8px;
            background: rgba(20, 32, 51, 0.08);
            font-family: "Cascadia Code", "Consolas", monospace;
            font-size: 0.95em;
        }
        .xb-assistant-markdown pre {
            overflow-x: hidden;
            overflow-y: visible;
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
            padding: 12px 14px;
            border-radius: 12px;
            background: rgba(20, 32, 51, 0.06);
            white-space: pre-wrap;
            word-wrap: break-word;
            word-break: break-all;
        }
        .xb-assistant-codeblock {
            position: relative;
            min-width: 0;
            max-width: 100%;
        }
        .xb-assistant-codeblock .xb-assistant-code-copy {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            border: none;
            border-radius: 8px;
            background: rgba(20, 32, 51, 0.14);
            color: #36567b;
            cursor: pointer;
            font: 600 12px/1 "Segoe UI Emoji", "Apple Color Emoji", sans-serif;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            opacity: 0.8;
        }
        .xb-assistant-codeblock .xb-assistant-code-copy:hover {
            background: rgba(20, 32, 51, 0.22);
            opacity: 1;
        }
        .xb-assistant-codeblock pre {
            padding-top: 34px;
        }
        .xb-assistant-markdown pre code {
            padding: 0;
            background: transparent;
        }
        .xb-assistant-markdown blockquote {
            padding-left: 12px;
            border-left: 3px solid rgba(27, 55, 88, 0.24);
            color: #4b5a70;
        }
        .xb-assistant-markdown a {
            color: #285786;
            text-decoration: underline;
        }
        .xb-assistant-markdown ul,
        .xb-assistant-markdown ol {
            padding-left: 1.4em;
        }
        .xb-assistant-attachment-gallery {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 12px;
        }
        .xb-assistant-local-path-link {
            display: inline;
            border: none;
            padding: 0;
            background: none;
            color: #285786;
            font: inherit;
            text-decoration: underline;
            cursor: pointer;
        }
        .xb-assistant-attachment-card {
            position: relative;
            width: 132px;
            padding: 8px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.9);
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.12);
        }
        .xb-assistant-attachment-card.compact {
            background: rgba(255, 255, 255, 0.18);
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
        }
        .xb-assistant-attachment-image,
        .xb-assistant-attachment-placeholder {
            width: 100%;
            height: 90px;
            border-radius: 10px;
            object-fit: cover;
            display: block;
            background: rgba(20, 32, 51, 0.08);
        }
        .xb-assistant-attachment-placeholder {
            display: grid;
            place-items: center;
            color: #41526a;
            font-size: 13px;
        }
        .xb-assistant-attachment-name {
            margin-top: 8px;
            font-size: 12px;
            line-height: 1.4;
            word-break: break-word;
        }
        .xb-assistant-attachment-remove {
            position: absolute;
            top: 6px;
            right: 6px;
            width: 24px;
            height: 24px;
            border: none;
            border-radius: 999px;
            background: rgba(20, 32, 51, 0.72);
            color: #fff;
            cursor: pointer;
            font: inherit;
        }
        .xb-assistant-tool-details {
            margin-top: 10px;
            border-top: 1px dashed rgba(27, 55, 88, 0.12);
            padding-top: 10px;
        }
        .xb-assistant-tool-batch {
            width: min(100%, calc(100% - 20px));
            margin-left: 0;
            margin-right: auto;
            border-radius: 18px;
            background: rgba(244, 248, 252, 0.96);
            border: 1px solid rgba(27, 55, 88, 0.08);
            box-shadow: 0 12px 28px rgba(17, 31, 51, 0.06);
            padding: 10px 14px;
            box-sizing: border-box;
        }
        .xb-assistant-tool-batch + .xb-assistant-tool-batch {
            margin-top: 12px;
        }
        .xb-assistant-tool-batch-summary {
            cursor: pointer;
            color: #56677e;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.02em;
            list-style: none;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            user-select: none;
        }
        .xb-assistant-tool-batch-summary::marker,
        .xb-assistant-tool-batch-summary::-webkit-details-marker {
            display: none;
        }
        .xb-assistant-tool-batch-summary::after {
            content: '>';
            color: #36567b;
            font-size: 14px;
            transition: transform 0.16s ease;
            transform-origin: center;
        }
        .xb-assistant-tool-batch[open] .xb-assistant-tool-batch-summary::after {
            transform: rotate(90deg);
        }
        .xb-assistant-tool-batch-body {
            display: grid;
            gap: 10px;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px dashed rgba(27, 55, 88, 0.12);
        }
        .xb-assistant-tool-batch-note {
            padding: 12px 14px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.84);
            border: 1px solid rgba(27, 55, 88, 0.08);
            line-height: 1.65;
            color: #1e2f44;
        }
        .xb-assistant-approval {
            margin-top: 12px;
            padding: 14px;
            border-radius: 14px;
            background: rgba(244, 248, 252, 0.96);
            border: 1px solid rgba(27, 55, 88, 0.12);
        }
        .xb-assistant-approval-title {
            margin-bottom: 8px;
            color: #1b3758;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.02em;
        }
        .xb-assistant-approval-command {
            margin-top: 0;
            margin-bottom: 8px;
            padding: 12px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.92);
            border: 1px solid rgba(27, 55, 88, 0.1);
        }
        .xb-assistant-approval-note {
            color: #4b5a70;
            font-size: 13px;
            line-height: 1.6;
        }
        .xb-assistant-approval-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            flex-wrap: wrap;
        }
        .xb-assistant-approval-button {
            border: none;
            border-radius: 999px;
            min-height: 36px;
            padding: 0 14px;
            background: #1b3758;
            color: #fff;
            cursor: pointer;
            font: inherit;
            font-size: 13px;
            font-weight: 600;
        }
        .xb-assistant-approval-button.secondary {
            background: rgba(255, 255, 255, 0.92);
            color: #1b3758;
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.12);
        }
        .xb-assistant-thought-details {
            margin-top: 10px;
            border-top: 1px dashed rgba(27, 55, 88, 0.12);
            padding-top: 10px;
        }
        .xb-assistant-tool-details summary {
            cursor: pointer;
            color: #36567b;
            font-size: 13px;
            list-style: none;
        }
        .xb-assistant-thought-details summary {
            cursor: pointer;
            color: #36567b;
            font-size: 13px;
            list-style: none;
        }
        .xb-assistant-tool-details summary::marker,
        .xb-assistant-tool-details summary::-webkit-details-marker {
            display: none;
        }
        .xb-assistant-thought-details summary::marker,
        .xb-assistant-thought-details summary::-webkit-details-marker {
            display: none;
        }
        .xb-assistant-tool-details summary::after {
            content: '（默认折叠）';
            margin-left: 6px;
            color: #5a6a81;
            font-size: 12px;
        }
        .xb-assistant-thought-details summary::after {
            content: '（默认折叠）';
            margin-left: 6px;
            color: #5a6a81;
            font-size: 12px;
        }
        .xb-assistant-tool-details[open] summary::after {
            content: '（点击收起）';
        }
        .xb-assistant-thought-details[open] summary::after {
            content: '（点击收起）';
        }
        .xb-assistant-content.tool-detail {
            margin-top: 10px;
            line-height: 1.6;
            max-height: calc(1.6em * 3 + 24px);
            overflow: hidden;
            background: rgba(255, 255, 255, 0.72);
            border-radius: 12px;
            padding: 12px;
        }
        .xb-assistant-content.tool-summary {
            max-height: calc(1.6em + 2px);
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .xb-assistant-tool-details[open] .xb-assistant-content.tool-detail {
            max-height: none;
            overflow: auto;
        }
        .xb-assistant-thought-block + .xb-assistant-thought-block {
            margin-top: 12px;
        }
        .xb-assistant-thought-label {
            margin-top: 10px;
            margin-bottom: 8px;
            color: #5a6a81;
            font-size: 12px;
        }
        .xb-assistant-thought-content {
            margin-top: 0;
            padding: 12px;
            border-radius: 12px;
            background: rgba(245, 247, 250, 0.96);
            border: 1px solid rgba(27, 55, 88, 0.1);
            line-height: 1.65;
        }
        .xb-assistant-compose {
            display: grid;
            gap: 12px;
            background: rgba(255, 255, 255, 0.78);
            border-radius: 22px;
            padding: 14px;
            box-shadow: 0 16px 40px rgba(17, 31, 51, 0.08);
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            min-height: 0;
            overflow: visible;
        }
        .xb-assistant-compose-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 12px;
            align-items: stretch;
        }
        .xb-assistant-compose-main {
            min-width: 0;
            max-width: 100%;
            overflow: visible;
        }
        .xb-assistant-compose-extras {
            display: grid;
            gap: 0;
            min-width: 0;
        }
        .xb-assistant-compose-actions {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            width: 36px;
            overflow: visible;
        }
        .xb-assistant-compose-more {
            position: relative;
            flex: 0 0 auto;
        }
        .xb-assistant-compose-actions > button,
        .xb-assistant-compose .xb-assistant-compose-menu-toggle {
            width: 36px;
            min-width: 36px;
            height: 30px;
            min-height: 30px;
            padding: 0;
            border-radius: 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            line-height: 1;
            font-weight: 600;
        }
        .xb-assistant-compose-actions > button {
            min-width: 36px;
        }
        #xb-assistant-send {
            font-size: 16px;
        }
        .xb-assistant-compose-menu {
            position: absolute;
            right: 0;
            bottom: calc(100% + 10px);
            min-width: 168px;
            max-width: min(240px, calc(100vw - 32px));
            padding: 8px;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid rgba(20, 32, 51, 0.10);
            box-shadow: 0 18px 36px rgba(17, 31, 51, 0.16);
            backdrop-filter: blur(12px);
            display: grid;
            gap: 4px;
            z-index: 15;
        }
        .xb-assistant-compose-menu[hidden] {
            display: none;
        }
        .xb-assistant-compose-menu-item {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            min-height: 40px;
            padding: 0 12px;
            border: none;
            border-radius: 12px;
            background: transparent;
            color: #1f334d;
            cursor: pointer;
            font: inherit;
            font-size: 13px;
            font-weight: 600;
            text-align: left;
        }
        .xb-assistant-compose-menu-item:hover:not(:disabled) {
            background: rgba(40, 87, 134, 0.10);
        }
        .xb-assistant-compose-menu-item:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .xb-assistant-compose-menu-icon {
            flex: 0 0 auto;
            font-size: 16px;
            line-height: 1;
        }
        .xb-assistant-compose-menu-label {
            min-width: 0;
            white-space: nowrap;
        }
        .xb-assistant-compose textarea {
            min-height: 66px;
            resize: vertical;
            max-width: 100%;
            overflow-x: hidden;
        }
        .xb-assistant-context-hint {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 10px;
        }
        .xb-assistant-context-hint[hidden] {
            display: none;
        }
        .xb-assistant-context-hint-item {
            max-width: 100%;
            padding: 6px 10px;
            border: 1px solid rgba(40, 87, 134, 0.14);
            border-radius: 999px;
            background: rgba(237, 244, 251, 0.9);
            color: #36567b;
            font-size: 12px;
            font-weight: 600;
            line-height: 1.4;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .xb-assistant-import-progress {
            display: grid;
            gap: 6px;
            margin-bottom: 10px;
            padding: 10px 12px;
            border: 1px solid rgba(40, 87, 134, 0.18);
            border-radius: 14px;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(237, 244, 251, 0.96));
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
        }
        .xb-assistant-import-progress[hidden] {
            display: none;
        }
        .xb-assistant-import-progress-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            color: #203956;
        }
        .xb-assistant-import-progress-title {
            font-size: 13px;
            font-weight: 700;
        }
        .xb-assistant-import-progress-percent {
            font-size: 12px;
            font-weight: 700;
            color: #36567b;
        }
        .xb-assistant-import-progress-detail {
            min-width: 0;
            color: #4b6888;
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .xb-assistant-import-progress-bar {
            position: relative;
            overflow: hidden;
            height: 8px;
            border-radius: 999px;
            background: rgba(40, 87, 134, 0.12);
        }
        .xb-assistant-import-progress-fill {
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, #4f8cc9, #2f6eaf);
            transition: width 0.12s ease;
        }
        .xb-assistant-compose button.is-busy { background: #8d442b; }
        .xb-assistant-toast {
            min-height: 22px;
            color: #36567b;
            font-size: 12px;
            font-weight: 600;
            opacity: 0;
            transform: translateY(4px);
            transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .xb-assistant-toast.visible {
            opacity: 1;
            transform: translateY(0);
        }
        .xb-assistant-toast-inline {
            padding: 4px 2px 0;
        }
        @keyframes xb-assistant-pulse {
            0% { box-shadow: 0 0 0 0 rgba(201, 107, 51, 0.35); }
            70% { box-shadow: 0 0 0 8px rgba(201, 107, 51, 0); }
            100% { box-shadow: 0 0 0 0 rgba(201, 107, 51, 0); }
        }
        @keyframes xb-assistant-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
            .xb-assistant-shell {
                grid-template-columns: minmax(0, 1fr);
                grid-template-rows: minmax(0, 1fr);
                height: 100%;
            }
            .xb-assistant-shell.sidebar-collapsed { grid-template-columns: 1fr; }
            .xb-assistant-sidebar {
                position: absolute;
                inset: 12px;
                z-index: 30;
                padding: 16px;
                grid-template-rows: auto minmax(0, 1fr);
                border: 1px solid rgba(20, 32, 51, 0.08);
                border-radius: 24px;
                box-shadow: 0 24px 60px rgba(17, 31, 51, 0.16);
                max-height: none;
                overflow: hidden;
                transition: opacity 0.2s ease, transform 0.2s ease;
            }
            .xb-assistant-sidebar.is-collapsed {
                padding: 16px;
                opacity: 0;
                transform: translateY(10px);
                pointer-events: none;
            }
            .xb-assistant-sidebar.is-collapsed .xb-assistant-sidebar-content {
                opacity: 0;
                pointer-events: none;
            }
            .xb-assistant-sidebar.is-collapsed .xb-assistant-brand,
            .xb-assistant-sidebar.is-collapsed .xb-assistant-config {
                display: none;
            }
            .xb-assistant-sidebar-toggle {
                min-width: 116px;
                padding: 8px 14px;
                justify-content: space-between;
                background: linear-gradient(135deg, rgba(27, 55, 88, 0.92), rgba(40, 87, 134, 0.92));
                font-size: 14px;
            }
            .xb-assistant-mobile-backdrop {
                display: block;
                position: absolute;
                inset: 0;
                z-index: 20;
                background: rgba(15, 23, 35, 0.24);
                backdrop-filter: blur(4px);
            }
            .xb-assistant-mobile-backdrop[hidden] {
                display: none;
            }
            .xb-assistant-mobile-settings {
                display: inline-flex;
                flex: 0 0 auto;
            }
            .xb-assistant-sidebar-content {
                padding-right: 2px;
            }
            .xb-assistant-sidebar-toggle-text {
                display: inline-flex;
                align-items: center;
            }
            .xb-assistant-mobile-topbar {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                align-items: stretch;
                gap: 8px;
            }
            .xb-assistant-main {
                padding: 12px;
                min-height: 0;
                height: 100%;
                gap: 12px;
            }
            .xb-assistant-main-body {
                grid-template-columns: minmax(0, 1fr);
            }
            .xb-assistant-main-body.workspace-open {
                grid-template-columns: minmax(0, 1fr);
            }
            .xb-assistant-mobile-close {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 0;
                min-height: 40px;
                padding: 0 8px;
                border: none;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.74);
                color: #1b3758;
                font-size: 12px;
                font-weight: 600;
                box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.1);
                white-space: nowrap;
            }
            .xb-assistant-compose {
                padding: 12px;
                padding-bottom: calc(12px + env(safe-area-inset-bottom));
            }
            .xb-assistant-compose-row {
                grid-template-columns: minmax(0, 1fr) auto;
                align-items: stretch;
            }
            .xb-assistant-compose-actions {
                justify-content: center;
            }
            .xb-assistant-compose-menu {
                right: 0;
                min-width: 180px;
                max-width: min(240px, calc(100vw - 40px));
            }
            .xb-assistant-toolbar {
                display: flex;
                overflow-x: auto;
                scrollbar-width: none;
                -ms-overflow-style: none;
                flex-wrap: nowrap;
                align-items: center;
                gap: 8px;
                padding-bottom: 2px;
            }
            .xb-assistant-toolbar::-webkit-scrollbar {
                display: none;
            }
            .xb-assistant-toolbar-cluster {
                display: flex;
                gap: 8px;
                flex-wrap: nowrap;
            }
            .xb-assistant-inline-input { grid-template-columns: 1fr; }
            .xb-assistant-status,
            .xb-assistant-context-meter,
            .xb-assistant-toolbar button {
                display: flex;
                align-items: center;
                min-width: 0;
                justify-content: center;
                padding-inline: 8px;
                font-size: 12px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .xb-assistant-chat { padding-inline: 0; min-height: 0; }
            .xb-assistant-bubble { width: 100%; }
            .xb-assistant-empty {
                width: 100%;
                padding: 18px;
                box-sizing: border-box;
            }
            .xb-assistant-scroll-helpers {
                right: 6px;
                top: 14%;
                bottom: calc(14% + env(safe-area-inset-bottom));
            }
            .xb-assistant-scroll-btn {
                width: 28px;
                height: 28px;
                font-size: 11px;
            }
            .xb-assistant-workspace-backdrop {
                display: block;
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 35, 0.24);
                backdrop-filter: blur(3px);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.18s ease;
                z-index: 40;
            }
            .xb-assistant-workspace-backdrop.is-open {
                opacity: 1;
                pointer-events: auto;
            }
            .xb-assistant-workspace {
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                z-index: 41;
                transform: translateX(100%);
                transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .xb-assistant-workspace.is-open {
                display: block;
                transform: translateX(0);
            }
            .xb-assistant-workspace-panel {
                border-radius: 0;
                box-shadow: none;
            }
            .xb-assistant-workspace-header-button.is-icon {
                min-width: 44px;
                min-height: 44px;
                font-size: 20px;
            }
            .xb-assistant-workspace-resizer {
                display: none;
            }
            .xb-assistant-workspace-body {
                grid-template-columns: minmax(0, 1fr);
                grid-template-rows: minmax(0, 1fr);
                height: 100%;
                overflow: hidden;
            }
            .xb-assistant-workspace-nav,
            .xb-assistant-workspace-viewer {
                grid-column: 1 / 2;
                grid-row: 1 / 2;
                background: rgba(255, 255, 255, 0.98);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
                max-height: none;
                height: 100%;
            }
            .xb-assistant-workspace-nav {
                z-index: 2;
                opacity: 1;
                transform: translateX(0);
                pointer-events: auto;
                border-right: none;
                border-bottom: none;
            }
            .xb-assistant-workspace-viewer {
                z-index: 3;
                opacity: 0;
                transform: translateX(50px);
                pointer-events: none;
            }
            .xb-assistant-workspace-body.is-viewing .xb-assistant-workspace-nav {
                opacity: 0;
                transform: translateX(-50px);
                pointer-events: none;
            }
            .xb-assistant-workspace-body.is-viewing .xb-assistant-workspace-viewer {
                opacity: 1;
                transform: translateX(0);
                pointer-events: auto;
            }
            .xb-assistant-workspace-mobile-back {
                display: inline-flex;
            }
            .xb-assistant-actions {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .xb-assistant-compose textarea {
                min-height: 60px;
                max-height: min(200px, 32vh);
                resize: none;
                overflow-y: auto;
            }
        }
    `;
    document.head.appendChild(style);
}
