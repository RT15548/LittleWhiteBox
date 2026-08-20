const STYLE_DATA_ATTRIBUTE = 'data-xb-assistant-styles';

export function injectAssistantStyles(rootId) {
    if (document.head.querySelector(`style[${STYLE_DATA_ATTRIBUTE}="true"]`)) {
        return;
    }
    const style = document.createElement('style');
    style.setAttribute(STYLE_DATA_ATTRIBUTE, 'true');
    style.textContent = `
        :root {
            color-scheme: light;
            font-family: "Noto Sans SC", "Microsoft YaHei", sans-serif;
            --xb-assistant-bg: #f5f0e8;
            --xb-assistant-surface: #fffdf8;
            --xb-assistant-surface-soft: #faf7f1;
            --xb-assistant-surface-muted: #efe8dd;
            --xb-assistant-text: #2f2b26;
            --xb-assistant-text-soft: #6f675d;
            --xb-assistant-text-muted: #8a8175;
            --xb-assistant-border: rgba(91, 73, 55, 0.12);
            --xb-assistant-accent: #a75f43;
            --xb-assistant-accent-strong: #814733;
            --xb-assistant-accent-soft: rgba(167, 95, 67, 0.1);
            --xb-assistant-shadow: rgba(67, 55, 43, 0.12);
        }
        html, body { height: 100%; width: 100%; overflow: hidden; }
        body {
            margin: 0;
            background:
                radial-gradient(circle at top left, rgba(255, 252, 245, 0.82), transparent 34%),
                linear-gradient(180deg, var(--xb-assistant-bg) 0%, #f1ebe2 100%);
            color: var(--xb-assistant-text);
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
            padding: 22px 18px;
            background: #f1ebe2;
            border-right: none;
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
            border-radius: 999px;
            background: var(--xb-assistant-surface);
            color: var(--xb-assistant-accent-strong);
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(67, 55, 43, 0.06);
            transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;
        }
        .xb-assistant-sidebar-toggle:hover {
            background: var(--xb-assistant-accent-soft);
            transform: translateY(-1px);
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
        .xb-assistant-brand p { margin: 0 0 18px; color: #766d62; line-height: 1.55; }
        .xb-assistant-badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 999px;
            background: var(--xb-assistant-accent-soft);
            color: var(--xb-assistant-accent-strong);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.04em;
        }
        .xb-assistant-config { display: grid; gap: 12px; }
        .xb-assistant-config-fields {
            min-inline-size: 0;
            display: grid;
            gap: 12px;
            margin: 0;
            padding: 0;
            border: 0;
        }
        .xb-assistant-config-fields:disabled { opacity: 0.58; }
        .xb-assistant-config-alert {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 10px 11px;
            border: 1px solid rgba(169, 108, 34, 0.28);
            border-radius: 11px;
            background: rgba(169, 108, 34, 0.08);
            color: #76501f;
            font-size: 12px;
            line-height: 1.45;
        }
        .xb-assistant-config-alert.is-error {
            border-color: rgba(154, 61, 42, 0.3);
            background: rgba(154, 61, 42, 0.08);
            color: #8a3525;
        }
        .xb-assistant-config-alert[hidden] { display: none; }
        .xb-assistant-config-alert button {
            flex: 0 0 auto;
            min-height: 32px;
            padding: 0 10px;
            border: 1px solid currentColor;
            border-radius: 9px;
            background: rgba(255, 255, 255, 0.72);
            color: inherit;
            font: inherit;
            font-weight: 800;
            cursor: pointer;
        }
        .xb-assistant-config-tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px;
            padding: 4px;
            border-radius: 999px;
            background: var(--xb-assistant-surface-muted);
        }
        .xb-assistant-config-tab {
            min-height: 34px;
            border: 0;
            border-radius: 999px;
            background: transparent;
            color: var(--xb-assistant-text-soft);
            font-weight: 700;
            cursor: pointer;
        }
        .xb-assistant-config-tab.is-active {
            background: var(--xb-assistant-surface);
            color: var(--xb-assistant-text);
            box-shadow: 0 1px 3px rgba(67, 55, 43, 0.08);
        }
        .xb-assistant-config-page {
            display: grid;
            gap: 12px;
        }
        .xb-assistant-config-page[hidden] {
            display: none;
        }
        .xb-assistant-config-note {
            margin: 0;
            color: #7d7468;
            font-size: 12px;
            line-height: 1.55;
        }
        .xb-assistant-inline-status {
            min-height: 18px;
            margin-top: -6px;
            color: #7d7468;
            font-size: 12px;
            line-height: 1.5;
        }
        .xb-assistant-inline-status.is-success {
            color: #2e6a39;
        }
        .xb-assistant-inline-status.is-error {
            color: #9a3d2a;
        }
        .xb-assistant-inline-status.is-loading {
            color: #6d6459;
        }
        .xb-assistant-config label { display: grid; gap: 6px; font-size: 13px; color: #6d6459; }
        .xb-assistant-preset-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
            gap: 8px;
        }
        .xb-assistant-preset-field,
        .xb-assistant-config select.xb-assistant-preset-field {
            box-sizing: border-box;
            grid-column: 1;
            min-width: 0;
            width: 100%;
            min-height: 40px;
            height: 40px;
            padding: 0 14px;
            font-size: 14px;
            line-height: 40px;
        }
        .xb-assistant-preset-tools {
            display: grid;
            grid-column: 2;
            grid-template-columns: repeat(4, 40px);
            align-self: stretch;
            gap: 6px;
        }
        .xb-assistant-preset-tools.is-single {
            grid-template-columns: 40px;
        }
        .xb-assistant-icon-button {
            display: grid;
            place-items: center;
            width: 40px;
            min-width: 40px;
            height: 40px;
            min-height: 40px;
            border: 1px solid transparent;
            border-radius: 12px;
            background: var(--xb-assistant-surface);
            color: var(--xb-assistant-text-soft);
            padding: 0;
            line-height: 1;
            box-shadow: none;
        }
        .xb-assistant-icon-button svg {
            width: 16px;
            height: 16px;
            stroke: currentColor;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
            fill: none;
            vector-effect: non-scaling-stroke;
        }
        .xb-assistant-icon-button:hover:not(:disabled),
        .xb-assistant-icon-button:focus-visible {
            outline: none;
            border-color: rgba(122, 76, 54, 0.26);
            background: rgba(122, 76, 54, 0.06);
            color: #2f2b26;
        }
        .xb-assistant-icon-button.xb-assistant-save-button.is-success,
        .xb-assistant-icon-button.xb-assistant-save-button.is-error {
            background: rgba(255, 255, 255, 0.9);
            color: #6d6459;
            border-color: rgba(122, 76, 54, 0.14);
        }
        .xb-assistant-icon-button.xb-assistant-save-button.is-success {
            background: rgba(63, 143, 90, 0.10);
            border-color: rgba(63, 143, 90, 0.24);
            color: #2f7b4a;
        }
        .xb-assistant-icon-button.xb-assistant-save-button.is-error {
            background: rgba(182, 90, 85, 0.10);
            border-color: rgba(182, 90, 85, 0.24);
            color: #a24d4a;
        }
        .xb-assistant-config input,
        .xb-assistant-config select,
        .xb-assistant-compose textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid var(--xb-assistant-border);
            border-radius: 14px;
            padding: 12px 14px;
            font: inherit;
            background: var(--xb-assistant-surface-soft);
            color: var(--xb-assistant-text);
            transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
        }
        .xb-assistant-config input:focus,
        .xb-assistant-config select:focus,
        .xb-assistant-compose textarea:focus {
            outline: none;
            border-color: rgba(167, 95, 67, 0.42);
            background: var(--xb-assistant-surface);
            box-shadow: 0 0 0 3px rgba(167, 95, 67, 0.1);
        }
        .xb-assistant-inline-input {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 8px;
            align-items: center;
        }
        .xb-assistant-grow { min-width: 0; }
        .xb-assistant-model-row { align-items: end; }
        .xb-assistant-temperature-row {
            display: grid;
            grid-template-columns: 96px auto;
            gap: 10px;
            align-items: end;
        }
        .xb-assistant-temperature-row .xb-assistant-checkbox-row {
            display: flex;
            align-items: center;
            gap: 8px;
            min-height: 42px;
        }
        .xb-assistant-temperature-row input[type="number"] {
            width: 96px;
        }
        .xb-assistant-checkbox-row {
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
        }
        .xb-assistant-checkbox-control {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #814733;
            font-size: 14px;
        }
        .xb-assistant-checkbox-control input {
            width: auto;
            height: 16px;
        }
        .xb-assistant-help {
            margin-top: -2px;
            padding: 10px 12px;
            border-radius: 14px;
            background: rgba(122, 76, 54, 0.05);
            color: #776d61;
            font-size: 12px;
            line-height: 1.65;
        }
        .xb-assistant-help code {
            padding: 0.08em 0.34em;
            border-radius: 8px;
            background: rgba(67, 55, 43, 0.08);
            font-family: "Cascadia Code", "Consolas", monospace;
        }
        .xb-assistant-checkbox-control input {
            width: 16px;
            height: 16px;
            accent-color: #814733;
        }
        .xb-assistant-toolbar {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            align-items: center;
            justify-content: flex-start;
            min-width: 0;
            padding: 6px;
            border-radius: 18px;
            background: rgba(255, 253, 248, 0.72);
            box-shadow: 0 8px 28px rgba(67, 55, 43, 0.06);
        }
        .xb-assistant-toolbar-cluster {
            display: inline-flex;
            flex-wrap: wrap;
            gap: 4px;
            align-items: center;
            flex: 1 1 auto;
            min-width: 0;
        }
        .xb-assistant-toolbar button,
        .xb-assistant-compose button {
            border: none;
            border-radius: 999px;
            min-height: 40px;
            padding: 0 14px;
            background: var(--xb-assistant-accent-strong);
            color: #fffaf3;
            cursor: pointer;
            font: inherit;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.01em;
            box-shadow: none;
            transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;
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
            background: rgba(63, 143, 90, 0.10);
            border-color: rgba(63, 143, 90, 0.24);
            color: #2f7b4a;
            box-shadow: none;
        }
        .xb-assistant-save-button.is-error {
            background: rgba(182, 90, 85, 0.10);
            border-color: rgba(182, 90, 85, 0.24);
            color: #a24d4a;
            box-shadow: none;
        }
        .xb-assistant-save-button.is-saving svg {
            animation: xb-assistant-spin 0.85s linear infinite;
        }
        .xb-assistant-toolbar button:hover,
        .xb-assistant-compose button:hover {
            background: var(--xb-assistant-accent);
            transform: translateY(-1px);
        }
        .xb-assistant-toolbar button.is-active {
            background: var(--xb-assistant-accent-soft);
            color: var(--xb-assistant-accent-strong);
        }
        .xb-assistant-toolbar button.secondary,
        .xb-assistant-compose button.secondary {
            background: var(--xb-assistant-surface-muted);
            color: var(--xb-assistant-accent-strong);
            box-shadow: none;
        }
        .xb-assistant-toolbar button.ghost,
        .xb-assistant-compose button.ghost,
        .xb-assistant-inline-input button.ghost {
            padding-inline: 12px;
            background: transparent;
            color: var(--xb-assistant-text-soft);
            box-shadow: none;
        }
        .xb-assistant-toolbar button.secondary:hover,
        .xb-assistant-compose button.secondary:hover {
            background: var(--xb-assistant-accent-soft);
            color: var(--xb-assistant-accent-strong);
        }
        .xb-assistant-toolbar button.ghost:hover,
        .xb-assistant-compose button.ghost:hover,
        .xb-assistant-inline-input button.ghost:hover {
            background: var(--xb-assistant-accent-soft);
            color: var(--xb-assistant-accent-strong);
        }
        .xb-assistant-toolbar button:disabled,
        .xb-assistant-compose button:disabled {
            opacity: 0.52;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        .xb-assistant-runtime {
            font-size: 12px;
            color: #7d7468;
            min-height: 18px;
            line-height: 1.6;
        }
        .xb-assistant-main {
            display: grid;
            grid-template-rows: auto minmax(0, 1fr);
            padding: 18px 20px 20px;
            gap: 12px;
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
            gap: 0;
            min-width: 0;
            min-height: 0;
            overflow: hidden;
            border-radius: 26px;
            background: var(--xb-assistant-surface);
            box-shadow: 0 18px 48px rgba(67, 55, 43, 0.08);
        }
        .xb-assistant-status {
            display: inline-flex;
            align-items: center;
            min-height: 26px;
            padding: 0 10px;
            border-radius: 999px;
            background: transparent;
            color: var(--xb-assistant-text-soft);
            font-size: 12px;
            font-weight: 600;
            box-shadow: none;
        }
        .xb-assistant-context-meter {
            display: inline-flex;
            align-items: center;
            min-height: 26px;
            padding: 0 10px;
            border-radius: 999px;
            background: var(--xb-assistant-accent-soft);
            color: var(--xb-assistant-accent-strong);
            font-size: 12px;
            font-weight: 600;
            box-shadow: none;
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
            border-radius: 26px;
            background: var(--xb-assistant-surface);
            border: none;
            box-shadow: 0 18px 48px rgba(67, 55, 43, 0.08);
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
            padding: 15px 18px 11px;
            border-bottom: none;
        }
        .xb-assistant-workspace-header-info {
            display: grid;
            gap: 4px;
            min-width: 0;
        }
        .xb-assistant-workspace-header-info strong {
            font-size: 14px;
            color: #814733;
        }
        .xb-assistant-workspace-header-info span {
            color: #7d7468;
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
            color: #6f675d;
            cursor: pointer;
            font: inherit;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.15s ease;
        }
        .xb-assistant-workspace-header-button:hover,
        .xb-assistant-workspace-viewer-button:hover,
        .xb-assistant-workspace-mode-button:hover {
            background: rgba(122, 76, 54, 0.06);
            color: #3a352f;
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
            background: rgba(122, 76, 54, 0.1);
            color: #3a352f;
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
            border-right: none;
            background: var(--xb-assistant-surface-soft);
        }
        .xb-assistant-workspace-filters {
            display: grid;
            gap: 10px;
            padding: 12px 14px 14px;
            border-bottom: none;
        }
        .xb-assistant-workspace-nav-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        .xb-assistant-workspace-nav-title {
            min-width: 0;
            color: #814733;
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
            border: 1px solid transparent;
            border-radius: 12px;
            padding: 10px 12px;
            font: inherit;
            background: var(--xb-assistant-surface);
            color: var(--xb-assistant-text);
        }
        .xb-assistant-workspace-select:focus,
        .xb-assistant-workspace-search:focus {
            outline: none;
            border-color: rgba(167, 95, 67, 0.36);
            box-shadow: 0 0 0 3px rgba(167, 95, 67, 0.1);
        }
        .xb-assistant-workspace-modified-toggle {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #6d6459;
            font-size: 12px;
            font-weight: 600;
        }
        .xb-assistant-workspace-tree-actions {
            display: grid;
            gap: 10px;
            padding: 12px 14px;
            border-bottom: none;
            background: var(--xb-assistant-surface-soft);
        }
        .xb-assistant-workspace-tree-actions-context {
            display: grid;
            gap: 4px;
            min-width: 0;
        }
        .xb-assistant-workspace-tree-actions-title {
            color: #814733;
            font-size: 12px;
        }
        .xb-assistant-workspace-tree-actions-path {
            min-width: 0;
            color: #81776b;
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
            color: #453f37;
            cursor: pointer;
            font: inherit;
            font-size: 12px;
            text-align: left;
        }
        .xb-assistant-workspace-tree-row.is-selected .xb-assistant-workspace-tree-button {
            background: rgba(122, 76, 54, 0.12);
            color: #814733;
            font-weight: 700;
        }
        .xb-assistant-workspace-tree-button:hover {
            background: rgba(122, 76, 54, 0.08);
        }
        .xb-assistant-workspace-tree-caret {
            width: 12px;
            color: #8a8175;
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
            color: #7d7468;
            text-align: center;
            line-height: 1.6;
        }
        .xb-assistant-workspace-empty strong {
            color: #814733;
        }
        .xb-assistant-workspace-viewer {
            display: grid;
            grid-template-rows: auto minmax(0, 1fr);
            min-width: 0;
            min-height: 0;
            background: var(--xb-assistant-surface);
        }
        .xb-assistant-workspace-viewer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 14px;
            border-bottom: none;
            background: var(--xb-assistant-surface);
            backdrop-filter: blur(10px);
            z-index: 10;
        }
        .xb-assistant-workspace-mobile-back {
            display: none;
            background: transparent;
            border: none;
            color: #814733;
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
            color: #3a352f;
            font-size: 13px;
        }
        .xb-assistant-workspace-viewer-info-text span {
            color: #81776b;
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
            color: #9a9084;
            user-select: none;
            text-align: right;
        }
        .xb-assistant-workspace-code-marker {
            text-align: center;
        }
        .xb-assistant-workspace-code-text {
            padding: 0 14px 0 0;
            white-space: pre;
            color: #3a352f;
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
            padding: 18px 18px 8px;
            display: grid;
            gap: 14px;
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
            border: none;
            border-radius: 999px;
            background: var(--xb-assistant-surface-soft);
            color: var(--xb-assistant-accent-strong);
            cursor: pointer;
            pointer-events: none;
            opacity: 0;
            transform: scale(0.8) translateX(8px);
            transition: all 0.2s ease;
            box-shadow: 0 8px 20px rgba(67, 55, 43, 0.08);
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
            position: fixed;
            inset: 0;
            z-index: 80;
            display: grid;
            align-items: center;
            justify-items: center;
            padding: max(18px, env(safe-area-inset-top)) max(18px, env(safe-area-inset-right)) max(18px, env(safe-area-inset-bottom)) max(18px, env(safe-area-inset-left));
            box-sizing: border-box;
            background: rgba(15, 23, 35, 0.36);
            backdrop-filter: blur(8px);
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
            background: var(--xb-assistant-surface-soft);
            box-shadow: none;
        }
        .xb-assistant-empty h2 { margin: 0 0 10px; font-size: 24px; }
        .xb-assistant-empty p { margin: 0; color: #766d62; line-height: 1.7; }
        .xb-assistant-empty p + p { margin-top: 8px; }
        .xb-assistant-history-gate {
            align-self: center;
            color: rgba(111, 103, 93, 0.72);
            font-size: 12px;
            line-height: 1;
            padding: 4px 0;
        }
        .xb-assistant-bubble {
            width: min(100%, calc(100% - 20px));
            max-width: calc(100% - 20px);
            min-width: 0;
            box-sizing: border-box;
            border-radius: 18px;
            padding: 10px 12px;
            box-shadow: none;
            align-self: start;
            overflow-wrap: anywhere;
        }
        .xb-assistant-bubble.role-user {
            justify-self: end;
            width: fit-content;
            max-width: min(78%, 720px);
            padding: 12px 15px;
            border-radius: 18px 18px 6px 18px;
            background: #eadfd1;
            color: var(--xb-assistant-text);
        }
        .xb-assistant-bubble.role-assistant {
            width: 100%;
            background: transparent;
            padding-inline: 4px;
        }
        .xb-assistant-bubble.role-assistant.is-tool-call {
            background: transparent;
            border: none;
            box-shadow: none;
        }
        .xb-assistant-bubble.role-tool {
            background: var(--xb-assistant-surface-soft);
            border: none;
            border-radius: 14px;
        }
        @supports (content-visibility: auto) {
            .xb-assistant-bubble,
            .xb-assistant-tool-run {
                content-visibility: auto;
                contain-intrinsic-size: auto 180px;
            }
            .xb-assistant-bubble:last-child,
            .xb-assistant-tool-run:last-child {
                content-visibility: visible;
            }
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
            color: var(--xb-assistant-text-muted);
            font-size: 12px;
        }
        .xb-assistant-bubble.role-user .xb-assistant-meta {
            color: var(--xb-assistant-text);
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
            border: none;
            border-radius: 999px;
            background: var(--xb-assistant-surface-muted);
            color: var(--xb-assistant-text-soft);
            font-size: 12px;
            line-height: 1.1;
            cursor: pointer;
            transition: background 0.16s ease, color 0.16s ease;
        }
        .xb-assistant-message-action:hover:not(:disabled) {
            background: var(--xb-assistant-accent-soft);
            color: var(--xb-assistant-accent-strong);
        }
        .xb-assistant-chat.is-busy .xb-assistant-message-action:not([data-message-action="cancel-edit"]) {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
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
            border: 1px solid var(--xb-assistant-border);
            border-radius: 14px;
            background: var(--xb-assistant-surface-soft);
            color: var(--xb-assistant-text);
            font: inherit;
            line-height: 1.7;
        }
        .xb-assistant-message-editor:focus {
            outline: none;
            border-color: rgba(167, 95, 67, 0.48);
            box-shadow: 0 0 0 3px rgba(167, 95, 67, 0.12);
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
        .xb-assistant-markdown h4,
        .xb-assistant-markdown h5,
        .xb-assistant-markdown h6 {
            margin: 0 0 0.8em;
        }
        .xb-assistant-markdown p {
            margin: 0;
        }
        .xb-assistant-markdown p + p {
            margin-top: 0.25em;
        }
        .xb-assistant-markdown h1,
        .xb-assistant-markdown h2,
        .xb-assistant-markdown h3,
        .xb-assistant-markdown h4,
        .xb-assistant-markdown h5,
        .xb-assistant-markdown h6 {
            color: #332f29;
            font: inherit;
            font-weight: 700;
            line-height: inherit;
        }
        .xb-assistant-markdown code {
            padding: 0.12em 0.38em;
            border-radius: 8px;
            background: rgba(67, 55, 43, 0.08);
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
            background: rgba(67, 55, 43, 0.06);
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
            background: rgba(67, 55, 43, 0.14);
            color: #8a5a41;
            cursor: pointer;
            font: 600 12px/1 "Segoe UI Emoji", "Apple Color Emoji", sans-serif;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            opacity: 0.8;
        }
        .xb-assistant-codeblock .xb-assistant-code-copy:hover {
            background: rgba(67, 55, 43, 0.22);
            opacity: 1;
        }
        .xb-assistant-codeblock .xb-assistant-code-copy.is-copied {
            background: rgba(61, 132, 93, 0.16);
            color: #2c6d49;
            opacity: 1;
        }
        .xb-assistant-codeblock .xb-assistant-code-copy.is-failed {
            background: rgba(176, 59, 71, 0.14);
            color: #9b2d3a;
            opacity: 1;
        }
        .xb-assistant-codeblock pre {
            padding-top: 34px;
        }
        .xb-markdown-html-block {
            display: grid;
            gap: 10px;
            margin: 0 0 0.8em;
            padding: 12px;
            border: none;
            border-radius: 14px;
            background: var(--xb-assistant-surface-soft);
        }
        .xb-markdown-html-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        .xb-markdown-html-title {
            display: grid;
            gap: 2px;
            color: #332f29;
            font-size: 12px;
            font-weight: 700;
        }
        .xb-markdown-html-title span {
            color: #8a8175;
            font-size: 11px;
            font-weight: 500;
        }
        .xb-markdown-html-actions {
            display: inline-flex;
            flex-wrap: wrap;
            gap: 6px;
            justify-content: flex-end;
        }
        .xb-markdown-html-actions button {
            padding: 5px 9px;
            border: 1px solid rgba(122, 76, 54, 0.14);
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.9);
            color: #675d52;
            font: 600 12px/1.1 "Microsoft YaHei", sans-serif;
            cursor: pointer;
        }
        .xb-markdown-html-actions button.is-active {
            background: rgba(122, 76, 54, 0.10);
            color: #332f29;
        }
        .xb-markdown-html-body {
            min-width: 0;
        }
        .xb-markdown-html-code {
            max-height: 320px;
            overflow: auto;
            margin: 0;
            padding: 12px 14px;
            border-radius: 10px;
            background: rgba(67, 55, 43, 0.06);
            white-space: pre-wrap;
            word-break: break-all;
            font: 12px/1.55 "Cascadia Code", "Consolas", monospace;
        }
        .xb-markdown-html-preview {
            width: 100%;
            height: 320px;
            box-sizing: border-box;
            border: 1px solid rgba(122, 76, 54, 0.14);
            border-radius: 10px;
            background: #fff;
        }
        .xb-assistant-markdown pre code {
            padding: 0;
            background: transparent;
        }
        .xb-assistant-markdown blockquote {
            padding-left: 12px;
            border-left: 3px solid rgba(122, 76, 54, 0.24);
            color: #766d62;
        }
        .xb-assistant-markdown table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95em;
        }
        .xb-assistant-markdown th,
        .xb-assistant-markdown td {
            border: 1px solid rgba(122, 76, 54, 0.18);
            padding: 6px 10px;
            text-align: left;
            vertical-align: top;
        }
        .xb-assistant-markdown th {
            background: rgba(67, 55, 43, 0.06);
            font-weight: 600;
        }
        .xb-assistant-markdown a {
            color: #9a5a40;
            text-decoration: underline;
        }
        .xb-assistant-bubble.role-user .xb-assistant-markdown a,
        .xb-assistant-bubble.role-user .xb-assistant-local-path-link {
            color: var(--xb-assistant-accent-strong);
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
            color: #9a5a40;
            font: inherit;
            text-decoration: underline;
            cursor: pointer;
        }
        .xb-assistant-attachment-card {
            position: relative;
            width: 132px;
            padding: 8px;
            border-radius: 14px;
            background: var(--xb-assistant-surface-soft);
            box-shadow: none;
        }
        .xb-assistant-attachment-card.compact {
            background: rgba(255, 253, 248, 0.58);
            box-shadow: none;
        }
        .xb-assistant-attachment-image,
        .xb-assistant-attachment-placeholder {
            width: 100%;
            height: 90px;
            border-radius: 10px;
            object-fit: cover;
            display: block;
            background: rgba(67, 55, 43, 0.08);
        }
        .xb-assistant-attachment-placeholder {
            display: grid;
            place-items: center;
            color: #6d6459;
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
            background: rgba(67, 55, 43, 0.72);
            color: #fff;
            cursor: pointer;
            font: inherit;
        }
        .xb-assistant-tool-details {
            margin-top: 10px;
            border-top: none;
            padding-top: 0;
        }
        .xb-assistant-tool-run {
            width: min(100%, calc(100% - 20px));
            display: grid;
            gap: 6px;
            align-self: start;
            justify-self: start;
        }
        .xb-assistant-tool-turn {
            display: grid;
            gap: 6px;
            min-width: 0;
        }
        .xb-assistant-tool-preface {
            width: 100%;
            max-width: 100%;
            padding: 12px 14px;
            background: var(--xb-assistant-surface-soft);
            border-radius: 16px;
            box-shadow: none;
        }
        .xb-assistant-tool-batch {
            width: 100%;
            margin-left: 0;
            margin-right: auto;
            border-radius: 16px;
            background: var(--xb-assistant-surface-soft);
            border: none;
            box-shadow: none;
            padding: 8px 12px;
            box-sizing: border-box;
        }
        .xb-assistant-tool-batch + .xb-assistant-tool-batch {
            margin-top: 0;
        }
        .xb-assistant-tool-batch-summary {
            cursor: pointer;
            color: #766d62;
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
            color: #8a5a41;
            font-size: 14px;
            transition: transform 0.16s ease;
            transform-origin: center;
        }
        .xb-assistant-tool-batch[open] .xb-assistant-tool-batch-summary::after {
            transform: rotate(90deg);
        }
        .xb-assistant-tool-batch-body {
            display: grid;
            gap: 7px;
            margin-top: 8px;
            padding-top: 0;
            border-top: none;
        }
        .xb-assistant-tool-batch-note {
            padding: 12px 14px;
            border-radius: 14px;
            background: var(--xb-assistant-surface);
            border: none;
            line-height: 1.65;
            color: #3a352f;
        }
        .xb-assistant-approval {
            display: grid;
            grid-template-rows: auto minmax(0, 1fr) auto auto;
            gap: 10px;
            width: min(860px, 100%);
            max-height: calc(100vh - 36px);
            max-height: min(760px, calc(100dvh - 36px));
            min-height: 0;
            padding: 16px;
            border-radius: 20px;
            background: var(--xb-assistant-surface);
            border: none;
            box-shadow: 0 28px 80px rgba(67, 55, 43, 0.24);
            box-sizing: border-box;
            overflow: hidden;
        }
        .xb-assistant-approval-title {
            margin: 0;
            color: #814733;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.02em;
        }
        .xb-assistant-approval-command {
            min-height: 96px;
            max-height: none;
            margin: 0;
            padding: 12px;
            border-radius: 12px;
            background: var(--xb-assistant-surface-soft);
            border: none;
            overflow: auto;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
        }
        .xb-assistant-approval-note {
            color: #766d62;
            font-size: 13px;
            line-height: 1.6;
        }
        .xb-assistant-approval-actions {
            display: flex;
            gap: 8px;
            margin: 2px -16px -16px;
            padding: 12px 16px 16px;
            flex-wrap: wrap;
            background: linear-gradient(180deg, rgba(255, 253, 248, 0.72), var(--xb-assistant-surface) 36%);
            border-top: none;
        }
        .xb-assistant-approval-button {
            border: none;
            border-radius: 999px;
            min-height: 36px;
            padding: 0 14px;
            background: #814733;
            color: #fff;
            cursor: pointer;
            font: inherit;
            font-size: 13px;
            font-weight: 600;
        }
        .xb-assistant-approval-button.secondary {
            background: rgba(255, 255, 255, 0.92);
            color: #814733;
            box-shadow: inset 0 0 0 1px rgba(122, 76, 54, 0.12);
        }
        .xb-assistant-thought-details {
            margin-top: 10px;
            border-top: none;
            padding-top: 0;
        }
        .xb-assistant-tool-details summary {
            cursor: pointer;
            color: #8a5a41;
            font-size: 13px;
            list-style: none;
        }
        .xb-assistant-thought-details summary {
            cursor: pointer;
            color: #8a5a41;
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
            color: #7d7468;
            font-size: 12px;
        }
        .xb-assistant-thought-details summary::after {
            content: '（默认折叠）';
            margin-left: 6px;
            color: #7d7468;
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
            color: #7d7468;
            font-size: 12px;
        }
        .xb-assistant-thought-content {
            margin-top: 0;
            padding: 12px;
            border-radius: 12px;
            background: var(--xb-assistant-surface-soft);
            border: none;
            line-height: 1.65;
        }
        .xb-assistant-compose {
            display: grid;
            gap: 10px;
            background: var(--xb-assistant-surface);
            border-radius: 0;
            padding: 8px 18px 16px;
            box-shadow: none;
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
            border: 1px solid rgba(67, 55, 43, 0.10);
            box-shadow: 0 18px 36px rgba(67, 55, 43, 0.16);
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
            color: #3a352f;
            cursor: pointer;
            font: inherit;
            font-size: 13px;
            font-weight: 600;
            text-align: left;
        }
        .xb-assistant-compose-menu-item:hover:not(:disabled) {
            background: rgba(167, 95, 67, 0.10);
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
            min-height: 42px;
            resize: vertical;
            max-width: 100%;
            overflow-x: hidden;
            border-radius: 16px;
            background: var(--xb-assistant-surface-soft);
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
            border: none;
            border-radius: 999px;
            background: var(--xb-assistant-accent-soft);
            color: var(--xb-assistant-accent-strong);
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
            border: none;
            border-radius: 14px;
            background: var(--xb-assistant-surface-soft);
            box-shadow: none;
        }
        .xb-assistant-import-progress[hidden] {
            display: none;
        }
        .xb-assistant-import-progress-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            color: #3a352f;
        }
        .xb-assistant-import-progress-title {
            font-size: 13px;
            font-weight: 700;
        }
        .xb-assistant-import-progress-percent {
            font-size: 12px;
            font-weight: 700;
            color: #8a5a41;
        }
        .xb-assistant-import-progress-detail {
            min-width: 0;
            color: #766d62;
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
            background: rgba(167, 95, 67, 0.12);
        }
        .xb-assistant-import-progress-fill {
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, #c47a58, #9a5a40);
            transition: width 0.12s ease;
        }
        .xb-assistant-compose button.is-busy { background: #8d442b; }
        .xb-assistant-toast {
            min-height: 22px;
            color: #8a5a41;
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
                border: 1px solid rgba(67, 55, 43, 0.08);
                border-radius: 24px;
                box-shadow: 0 24px 60px rgba(67, 55, 43, 0.16);
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
                background: linear-gradient(135deg, rgba(122, 76, 54, 0.92), rgba(167, 95, 67, 0.92));
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
            .xb-assistant-approval-slot {
                align-items: stretch;
                padding: max(10px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left));
            }
            .xb-assistant-approval {
                width: 100%;
                max-height: calc(100vh - 20px);
                max-height: calc(100dvh - 20px);
                border-radius: 18px;
                padding: 14px;
            }
            .xb-assistant-approval-command {
                min-height: 0;
                font-size: 12px;
                line-height: 1.55;
            }
            .xb-assistant-approval-actions {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                margin: 2px -14px -14px;
                padding: 12px 14px 14px;
            }
            .xb-assistant-approval-button {
                width: 100%;
                min-height: 42px;
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
                color: #814733;
                font-size: 12px;
                font-weight: 600;
                box-shadow: inset 0 0 0 1px rgba(122, 76, 54, 0.1);
                white-space: nowrap;
            }
            .xb-assistant-compose {
                padding: 8px 12px;
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
            .xb-assistant-chat { padding: 14px 12px 6px; min-height: 0; }
            .xb-assistant-bubble { width: 100%; max-width: 100%; }
            .xb-assistant-bubble.role-user { width: fit-content; max-width: 92%; }
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
            .xb-assistant-compose textarea {
                min-height: 42px;
                max-height: min(200px, 32vh);
                resize: none;
                overflow-y: auto;
            }
        }
    `;
    document.head.appendChild(style);
}
