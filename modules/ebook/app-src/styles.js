export function injectEbookStyles(rootId = 'xb-ebook-root') {
    if (document.getElementById('xb-ebook-styles')) return;
    const style = document.createElement('style');
    style.id = 'xb-ebook-styles';
    style.textContent = `
        :root {
            color-scheme: dark;
            --xb-bg-deep: #171922;
            --xb-bg-editor: #1c1f2a;
            --xb-bg-agent: #20232d;
            --xb-bg-card: #242834;
            --xb-bg-glass: rgba(255, 255, 255, 0.045);
            --xb-text-main: #b8b2a6;
            --xb-text-body: #a19b90;
            --xb-text-muted: #8f8a80;
            --xb-text-dim: #706d68;
            --xb-line: rgba(184, 178, 166, 0.12);
            --xb-line-strong: rgba(184, 178, 166, 0.20);
            --xb-cyan: #8fb4bd;
            --xb-indigo: #b3adca;
            --xb-gold: #b8b2a6;
            --xb-danger: #d88490;
            --xb-ok: #96b8b2;
            --xb-shadow: 0 16px 34px rgba(0, 0, 0, 0.26);
            --xb-font-ui: "Inter", "Segoe UI", "Microsoft YaHei", sans-serif;
            --xb-font-serif: "Lora", "LXGW WenKai", "Noto Serif SC", "Microsoft YaHei", serif;
            --xb-font-mono: "JetBrains Mono", "Cascadia Code", "Consolas", monospace;
            --xb-fluid: cubic-bezier(0.16, 1, 0.3, 1);
        }

        *, *::before, *::after { box-sizing: border-box; }
        html, body, #${rootId} { width: 100%; height: 100%; margin: 0; overflow: hidden; }
        body {
            background: var(--xb-bg-deep);
            color: var(--xb-text-main);
            font-family: var(--xb-font-ui);
            -webkit-font-smoothing: subpixel-antialiased;
            text-rendering: auto;
        }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.42); border-radius: 999px; }

        button, input, select, textarea { font: inherit; }
        button {
            border: 1px solid var(--xb-line);
            border-radius: 12px;
            background: var(--xb-bg-glass);
            color: var(--xb-text-main);
            cursor: pointer;
            transition: transform 0.22s ease, background 0.22s ease, border-color 0.22s ease, color 0.22s ease, box-shadow 0.22s ease, opacity 0.22s ease;
        }
        button:hover:not(:disabled) {
            transform: translateY(-1px);
            border-color: var(--xb-line-strong);
            background: rgba(255, 255, 255, 0.07);
            box-shadow: none;
        }
        button:disabled { opacity: 0.56; cursor: not-allowed; }
        h1, h2, h3, p { margin: 0; }

        .xb-ebook-screen {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: hidden;
            background: var(--xb-bg-deep);
            color: var(--xb-text-main);
        }
        .xb-library-screen {
            display: grid;
            grid-template-rows: 176px minmax(0, 1fr);
        }
        .xb-ebook-screen.theme-light,
        .xb-ebook-shell.theme-light {
            color-scheme: light;
            --xb-bg-deep: #fffaf0;
            --xb-bg-editor: #fffdf8;
            --xb-bg-agent: #fff8ec;
            --xb-bg-card: rgba(255, 253, 248, 0.96);
            --xb-bg-glass: rgba(87, 70, 48, 0.045);
            --xb-text-main: #24201b;
            --xb-text-body: #2e2922;
            --xb-text-muted: #665f54;
            --xb-text-dim: #867d70;
            --xb-line: rgba(87, 70, 48, 0.15);
            --xb-line-strong: rgba(87, 70, 48, 0.25);
            --xb-cyan: #3d7c83;
            --xb-indigo: #686283;
            --xb-gold: #3a3329;
            --xb-danger: #b64d5d;
            --xb-ok: #32766d;
            --xb-shadow: 0 18px 44px rgba(87, 70, 48, 0.12);
            background: var(--xb-bg-deep);
            color: var(--xb-text-main);
        }
        .theme-light button:hover:not(:disabled) {
            border-color: var(--xb-line-strong);
            background: rgba(87, 70, 48, 0.07);
            box-shadow: 0 12px 28px rgba(87, 70, 48, 0.12);
        }
        .xb-ambient-aurora {
            position: absolute;
            top: -24vh;
            left: 24vw;
            width: 68vw;
            height: 64vh;
            pointer-events: none;
            z-index: 0;
            background: radial-gradient(ellipse, rgba(166, 171, 200, 0.045), rgba(143, 183, 202, 0.018), transparent 62%);
            filter: blur(86px);
            animation: xb-aurora-drift 15s infinite alternate ease-in-out;
        }
        .theme-light .xb-ambient-aurora,
        .theme-light .xb-agent-aurora,
        .theme-light .xb-reader-backlight {
            display: none;
        }
        @keyframes xb-aurora-drift {
            100% { transform: translateY(48px) scale(1.08); }
        }
        .xb-toast {
            position: fixed;
            left: 50%;
            bottom: 32px;
            z-index: 200;
            transform: translateX(-50%);
            max-width: min(520px, calc(100vw - 32px));
            padding: 12px 20px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 999px;
            background: rgba(241, 245, 249, 0.92);
            color: #111216;
            box-shadow: var(--xb-shadow);
            font-size: 13px;
            font-weight: 600;
        }
        .xb-empty {
            color: var(--xb-text-muted);
            line-height: 1.7;
        }
        .xb-kicker {
            color: var(--xb-gold);
            font-family: var(--xb-font-mono);
            font-size: 11px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
        }

        /* Archive */
        .xb-archive-header {
            position: relative;
            z-index: 20;
            grid-row: 1;
            height: 176px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 28px;
            padding: 42px 60px 34px;
        }
        .xb-archive-header::after {
            content: "";
            position: absolute;
            left: 60px;
            right: 60px;
            bottom: 0;
            height: 1px;
            background: linear-gradient(90deg, rgba(235, 231, 221, 0.32), rgba(235, 231, 221, 0.11) 38%, transparent);
        }
        .xb-archive-title-block {
            min-width: 0;
        }
        .xb-archive-header h1 {
            font-family: var(--xb-font-serif);
            font-size: clamp(34px, 4vw, 52px);
            font-weight: 400;
            letter-spacing: 0;
        }
        .xb-archive-subtitle {
            margin-top: 10px;
            max-width: 520px;
            color: var(--xb-text-body);
            font-family: var(--xb-font-ui);
            font-size: 14px;
            letter-spacing: 0.08em;
            line-height: 1.5;
        }
        .xb-archive-meta {
            margin-top: 12px;
            color: var(--xb-text-muted);
            font-family: var(--xb-font-mono);
            font-size: 12px;
            letter-spacing: 0.22em;
            text-transform: uppercase;
        }
        .xb-global-actions,
        .xb-home-actions {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: flex-end;
            gap: 12px;
        }
        .xb-glass-button,
        .xb-home-actions button {
            min-height: 40px;
            padding: 0 18px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.045);
            color: var(--xb-text-main);
            font-size: 13px;
            font-weight: 600;
        }
        .xb-global-actions {
            flex-wrap: nowrap;
            gap: 8px;
            padding-top: 2px;
        }
        .xb-global-actions .xb-glass-button {
            width: 30px;
            min-width: 30px;
            height: 30px;
            min-height: 30px;
            padding: 0;
            border-color: transparent;
            background: transparent;
            color: var(--xb-text-muted);
            box-shadow: none;
            backdrop-filter: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .xb-global-actions .xb-glass-button:hover:not(:disabled),
        .xb-global-actions .xb-glass-button:focus-visible {
            outline: none;
            transform: none;
            border-color: var(--xb-line);
            background: rgba(255, 255, 255, 0.055);
            color: var(--xb-text-main);
        }
        .xb-exit-button {
            width: 40px;
            min-width: 40px;
            height: 40px;
            min-height: 40px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 0;
        }
        #xb-close.xb-exit-button {
            width: 40px;
            min-width: 40px;
            height: 40px;
            min-height: 40px;
            padding: 0;
        }
        .xb-exit-icon {
            width: 18px;
            height: 18px;
            display: block;
        }
        .xb-theme-icon {
            width: 17px;
            height: 17px;
            display: block;
            color: currentColor;
        }
        .xb-transfer-tray-icon {
            width: 18px;
            height: 18px;
        }
        .xb-transfer-button {
            width: 40px;
            min-width: 40px;
            height: 40px;
            min-height: 40px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 0;
        }
        .xb-global-actions #xb-close.xb-exit-button,
        .xb-global-actions .xb-transfer-button {
            width: 30px;
            min-width: 30px;
            height: 30px;
            min-height: 30px;
            padding: 0;
        }
        .xb-theme-glyph {
            display: block;
            color: currentColor;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 18px;
            font-weight: 400;
            line-height: 1;
            transform: translateY(-0.5px);
        }
        .xb-danger-button { color: var(--xb-danger); }
        .xb-danger-button:hover:not(:disabled) {
            border-color: rgba(244, 63, 94, 0.34);
            background: rgba(244, 63, 94, 0.12);
        }
        .xb-shelf-container {
            position: relative;
            z-index: 1;
            grid-row: 2;
            min-height: 0;
            overflow: auto;
            padding: 30px 60px 96px;
        }
        .xb-library-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 34px;
        }
        .xb-library-grid.is-empty {
            min-height: 100%;
            align-content: start;
        }
        .xb-library-empty {
            grid-column: 1 / -1;
            min-height: 220px;
            display: grid;
            place-items: center;
            border: 1px dashed rgba(255, 255, 255, 0.12);
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.035);
            text-align: center;
        }
        .xb-shelf-actions {
            display: contents;
        }
        .xb-shelf-action {
            position: relative;
            min-height: 330px;
            aspect-ratio: 3 / 4;
            padding: 28px 22px;
            display: grid;
            align-content: center;
            place-items: center;
            gap: 16px;
            border-radius: 12px;
            border: 1px dashed rgba(255, 255, 255, 0.16);
            background: rgba(255, 255, 255, 0.026);
            color: var(--xb-text-main);
            text-align: center;
            transition: transform 0.28s var(--xb-fluid), border-color 0.22s ease, background 0.22s ease, color 0.22s ease, opacity 0.22s ease;
        }
        .xb-shelf-action-ring {
            width: 74px;
            height: 74px;
            display: grid;
            place-items: center;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            background: rgba(255, 255, 255, 0.055);
            font-size: 34px;
            font-weight: 300;
            line-height: 1;
        }
        .xb-shelf-action strong {
            color: var(--xb-text-muted);
            font-size: 13px;
            font-weight: 600;
        }
        .xb-shelf-action:hover:not(:disabled) {
            transform: translateY(-6px);
            border-color: rgba(255, 255, 255, 0.34);
            background: rgba(255, 255, 255, 0.045);
        }
        .xb-shelf-action-danger {
            color: var(--xb-danger);
        }
        .xb-shelf-action-danger:hover:not(:disabled),
        .xb-shelf-action-danger.is-active {
            border-color: rgba(244, 63, 94, 0.42);
            background: rgba(244, 63, 94, 0.12);
        }
        .xb-shelf-action:disabled {
            opacity: 0.34;
        }
        .xb-delete-mode-note {
            margin: 0 0 18px;
            color: var(--xb-danger);
            font-size: 13px;
            letter-spacing: 0.06em;
        }
        .xb-library-book {
            position: relative;
            min-height: 330px;
            aspect-ratio: 3 / 4;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            padding: 30px 24px 24px;
            border: 1px solid rgba(255, 255, 255, 0.045);
            border-radius: 12px;
            background: var(--xb-bg-card);
            text-align: left;
            box-shadow: 0 18px 46px rgba(0, 0, 0, 0.24);
            transition: transform 0.42s var(--xb-fluid), border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
        }
        .xb-library-book::before {
            content: "";
            position: absolute;
            inset: 0 auto 0 -80%;
            width: 48%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.035), transparent);
            transform: skewX(-18deg);
            transition: left 0.7s ease;
        }
        .xb-library-book:hover:not(:disabled) {
            transform: translateY(-8px);
            border-color: rgba(255, 255, 255, 0.16);
            box-shadow: 0 24px 58px rgba(0, 0, 0, 0.34);
        }
        .xb-library-book:hover::before { left: 140%; }
        .xb-library-book.is-active {
            border-color: rgba(143, 183, 202, 0.34);
            box-shadow: 0 20px 54px rgba(0, 0, 0, 0.30);
        }
        .xb-library-book.is-delete-target {
            border-color: rgba(244, 63, 94, 0.34);
            animation: xb-delete-vibrate 0.34s infinite alternate ease-in-out;
        }
        .xb-library-book.is-delete-target:hover:not(:disabled) {
            background: rgba(244, 63, 94, 0.10);
            border-color: rgba(244, 63, 94, 0.72);
            box-shadow: 0 20px 48px rgba(0, 0, 0, 0.30);
        }
        @keyframes xb-delete-vibrate {
            0% { transform: rotate(-0.42deg); }
            100% { transform: rotate(0.42deg); }
        }
        .xb-book-spine {
            position: absolute;
            left: 0;
            top: 24px;
            bottom: 24px;
            width: 3px;
            border-radius: 999px;
            background: linear-gradient(var(--xb-indigo), var(--xb-cyan));
            opacity: 0.76;
        }
        .xb-library-book-main {
            display: grid;
            gap: 12px;
            min-width: 0;
        }
        .xb-library-book strong {
            color: var(--xb-text-main);
            font-family: var(--xb-font-serif);
            font-size: 25px;
            font-weight: 400;
            line-height: 1.25;
        }
        .xb-library-book small {
            color: var(--xb-text-muted);
            font-size: 13px;
            line-height: 1.6;
        }
        .xb-library-book-foot {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding-top: 22px;
            border-top: 1px solid rgba(255, 255, 255, 0.045);
        }
        .xb-library-book-foot em {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 9px;
            border-radius: 5px;
            background: rgba(143, 183, 202, 0.14);
            color: var(--xb-cyan);
            font-family: var(--xb-font-mono);
            font-size: 10px;
            font-style: normal;
            letter-spacing: 0.08em;
        }
        .xb-library-book-foot em::before {
            content: "";
            width: 6px;
            height: 6px;
            border-radius: 999px;
            background: currentColor;
        }
        .is-delete-target .xb-library-book-foot em {
            background: rgba(244, 63, 94, 0.12);
            color: var(--xb-danger);
        }

        /* Entry portal */
        .xb-entry-screen {
            display: grid;
            place-items: center;
        }
        .xb-portal-close {
            position: absolute;
            z-index: 5;
            width: 42px;
            height: 42px;
            padding: 0;
            border-radius: 999px;
            background: transparent;
            color: rgba(241, 245, 249, 0.58);
            font-size: 26px;
        }
        .xb-portal-close { top: 34px; left: 50%; transform: translateX(-50%); }
        .xb-portal-close:hover:not(:disabled) { transform: translateX(-50%) translateY(-1px); }
        .xb-portal-theme {
            position: absolute;
            top: 36px;
            right: 42px;
            z-index: 5;
            min-width: 62px;
            height: 36px;
            padding: 0 14px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.06);
            color: var(--xb-text-main);
            font-size: 13px;
            font-weight: 700;
        }
        .xb-entry-portal {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
        }
        .xb-entry-actions {
            display: flex;
            width: 100%;
            height: 100%;
        }
        .xb-entry-action {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 18px;
            border: 0;
            border-right: 1px solid rgba(255, 255, 255, 0.03);
            border-radius: 0;
            background: transparent;
            cursor: pointer;
            text-align: center;
            transition: flex 0.62s var(--xb-fluid), background 0.3s ease;
        }
        .xb-entry-action strong {
            color: rgba(241, 245, 249, 0.70);
            font-family: var(--xb-font-serif);
            font-size: clamp(42px, 6vw, 78px);
            font-weight: 400;
            letter-spacing: 0;
            transition: transform 0.36s ease, color 0.36s ease;
        }
        .xb-entry-action span {
            max-width: 360px;
            color: var(--xb-text-muted);
            font-family: var(--xb-font-mono);
            font-size: 12px;
            letter-spacing: 0.18em;
            line-height: 1.8;
        }
        .xb-entry-action:hover:not(:disabled) {
            flex: 1.25;
            transform: none;
            box-shadow: none;
        }
        .xb-entry-action:hover strong {
            color: var(--xb-text-main);
            transform: scale(1.08);
        }
        .xb-entry-action.is-studio:hover {
            background: radial-gradient(circle at center, rgba(166, 171, 200, 0.07), transparent 54%);
        }
        .xb-entry-action.is-studio:hover strong {
            color: var(--xb-text-main);
        }
        .xb-entry-action.is-reader:hover {
            background: radial-gradient(circle at center, rgba(233, 231, 227, 0.055), transparent 54%);
        }
        .xb-entry-action.is-reader:hover strong {
            color: var(--xb-text-main);
        }

        /* Studio */
        .xb-ebook-shell {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 0;
            display: flex;
            overflow: hidden;
            background: var(--xb-bg-deep);
            color: var(--xb-text-main);
        }
        .xb-mobile-studio-topbar,
        .xb-mobile-file-picker,
        .xb-mobile-file-drawer-scrim,
        .xb-mobile-drawer-handle {
            display: none;
        }
        .xb-sidebar {
            position: relative;
            z-index: 3;
            width: 250px;
            flex: 0 0 250px;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 24px 16px;
            border-right: 1px solid rgba(255, 255, 255, 0.04);
            background: var(--xb-bg-deep);
        }
        .xb-brand {
            min-width: 0;
            display: grid;
            gap: 12px;
        }
        .xb-title-row {
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .xb-title-row h1,
        .xb-title-row h2 {
            flex: 1 1 auto;
            min-width: 0;
            overflow: hidden;
            color: var(--xb-text-main);
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: var(--xb-font-serif);
            font-size: 22px;
            font-weight: 400;
        }
        .xb-icon-button {
            width: 34px;
            height: 34px;
            min-width: 34px;
            padding: 0;
            display: inline-grid;
            place-items: center;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.04);
            color: var(--xb-text-muted);
            font-size: 16px;
            line-height: 1;
        }
        .xb-panel,
        .xb-files-panel {
            min-height: 0;
            display: flex;
            flex-direction: column;
        }
        .xb-files {
            min-height: 0;
            overflow: auto;
            display: grid;
            align-content: start;
            gap: 20px;
            padding-right: 2px;
        }
        .xb-file-group {
            display: grid;
            gap: 8px;
        }
        .xb-file-group-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            color: var(--xb-text-main);
            font-family: var(--xb-font-ui);
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.02em;
        }
        .xb-file-group-title span {
            color: inherit;
            font-size: inherit;
            font-weight: inherit;
        }
        .xb-file-group-title em,
        .xb-file-sort-toggle {
            padding: 3px 8px;
            border: 0;
            border-radius: 999px;
            background: rgba(143, 183, 202, 0.12);
            color: var(--xb-cyan);
            font-family: var(--xb-font-ui);
            font-size: 13px;
            font-weight: 700;
            font-style: normal;
            letter-spacing: 0.02em;
        }
        .xb-file-sort-toggle {
            min-height: 24px;
            cursor: pointer;
        }
        .xb-file-sort-toggle:hover {
            background: rgba(143, 183, 202, 0.2);
            color: #d8f6ff;
        }
        .xb-file-group-desc {
            color: var(--xb-text-muted);
            font-size: 12px;
            line-height: 1.55;
        }
        .xb-section-subtitle {
            color: var(--xb-text-main);
            font-family: var(--xb-font-ui);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.04em;
        }
        .xb-file-tree {
            display: grid;
            gap: 6px;
        }
        .xb-file-directory {
            margin-top: 4px;
            padding: 2px 2px 0 8px;
            border-left: 1px solid rgba(143, 183, 202, 0.18);
            color: var(--xb-text-muted);
            font-family: var(--xb-font-ui);
            font-size: 11px;
            font-weight: 700;
            line-height: 1.4;
        }
        .xb-file-directory + .xb-file {
            margin-top: -1px;
        }
        .xb-file,
        .xb-imports button,
        .xb-actions button {
            width: 100%;
            min-width: 0;
            min-height: 36px;
            padding: 9px 10px;
            border-radius: 8px;
            background: transparent;
            color: var(--xb-text-muted);
            text-align: left;
            font-size: 13px;
        }
        .xb-file {
            display: grid;
            gap: 2px;
        }
        .xb-file.is-active {
            border-color: rgba(255, 255, 255, 0.07);
            background: rgba(255, 255, 255, 0.045);
            color: var(--xb-text-main);
            box-shadow: inset 2px 0 0 var(--xb-cyan);
        }
        .xb-file-main {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-section-empty {
            padding: 10px;
            border: 1px dashed rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            color: var(--xb-text-muted);
            font-size: 12px;
            line-height: 1.55;
        }
        .xb-imports {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 7px;
        }
        .xb-imports button {
            text-align: center;
            color: var(--xb-cyan);
            background: rgba(143, 183, 202, 0.10);
        }
        .xb-studio-workbench {
            position: relative;
            flex: 1;
            min-width: 0;
            min-height: 0;
            display: flex;
            overflow: hidden;
            background: var(--xb-bg-editor);
        }
        .xb-workspace-controller {
            display: flex;
            gap: 4px;
            padding: 4px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 999px;
            background: rgba(0, 0, 0, 0.58);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
            backdrop-filter: blur(14px);
        }
        .xb-layout-button {
            flex: 1;
            min-height: 28px;
            padding: 0 14px;
            border: 0;
            border-radius: 999px;
            background: transparent;
            color: var(--xb-text-muted);
            font-size: 12px;
        }
        .xb-layout-button.is-active {
            background: rgba(255, 255, 255, 0.12);
            color: var(--xb-text-main);
        }
        .xb-editor,
        .xb-agent {
            min-width: 280px;
            min-height: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: flex-grow 0.72s var(--xb-fluid), opacity 0.4s ease, filter 0.4s ease, box-shadow 0.4s ease;
        }
        .xb-editor {
            flex: 1 1 0;
            background: var(--xb-bg-editor);
            border-right: 1px solid rgba(255, 255, 255, 0.025);
        }
        .xb-agent {
            position: relative;
            flex: 1.08 1 0;
            background: var(--xb-bg-agent);
            border-left: 1px solid rgba(0, 0, 0, 0.48);
            box-shadow: -14px 0 36px rgba(0, 0, 0, 0.22);
            gap: 8px;
        }
        .xb-studio-shell.focus-editor .xb-editor { flex-grow: 2.35; }
        .xb-studio-shell.focus-editor .xb-agent { flex-grow: 0.72; opacity: 0.72; }
        .xb-studio-shell.focus-editor .xb-agent:hover { opacity: 1; }
        .xb-studio-shell.focus-agent .xb-editor { flex-grow: 0.55; filter: brightness(0.74); }
        .xb-studio-shell.focus-agent .xb-agent { flex-grow: 2.05; box-shadow: -22px 0 58px rgba(0, 0, 0, 0.48); }
        .xb-editor-head {
            min-height: 70px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding: 20px 34px;
            background: linear-gradient(180deg, rgba(9, 11, 15, 1), rgba(9, 11, 15, 0.70), transparent);
            color: var(--xb-text-muted);
            font-family: var(--xb-font-mono);
            font-size: 12px;
        }
        .xb-path {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-editor-actions {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 8px;
        }
        .xb-editor-actions button,
        .xb-agent-toolbar button,
        .xb-agent-global-actions button,
        #xb-agent-settings-close {
            min-height: 32px;
            padding: 0 12px;
            border-radius: 999px;
            color: var(--xb-text-muted);
            font-size: 12px;
        }
        #xb-theme-toggle {
            min-width: 34px;
            padding: 0 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 0;
        }
        #xb-save:not(:disabled) {
            color: var(--xb-cyan);
            border-color: rgba(143, 183, 202, 0.32);
            background: rgba(143, 183, 202, 0.12);
        }
        #xb-draw-chapter:not(:disabled) {
            color: var(--xb-text-main);
            border-color: rgba(233, 231, 227, 0.26);
            background: rgba(233, 231, 227, 0.10);
        }
        .xb-editor-body {
            min-height: 0;
            flex: 1;
            overflow: hidden;
            padding: 12px 58px 28px;
        }
        #xb-editor-text {
            width: 100%;
            height: 100%;
            min-height: 0;
            resize: none;
            outline: none;
            border: 0;
            background: transparent;
            color: var(--xb-text-body);
            font: 17px/1.85 var(--xb-font-serif);
        }
        #xb-editor-text:disabled { opacity: 0.62; }
        .xb-editor-foot {
            min-height: 36px;
            padding: 8px 34px 14px;
            color: var(--xb-text-dim);
            font-family: var(--xb-font-mono);
            font-size: 11px;
        }
        .xb-agent-aurora {
            position: absolute;
            top: -170px;
            left: -120px;
            width: 520px;
            height: 520px;
            pointer-events: none;
            background: radial-gradient(circle, rgba(166, 171, 200, 0.18), rgba(143, 183, 202, 0.08), transparent 62%);
            filter: blur(86px);
            opacity: 0.052;
            animation: xb-agent-flow 10s infinite alternate ease-in-out;
        }
        @keyframes xb-agent-flow {
            100% { transform: scale(1.18) translate(52px, -18px); opacity: 0.09; }
        }
        .xb-agent-head {
            position: relative;
            z-index: 2;
            display: grid;
            gap: 10px;
            padding: 22px 30px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.035);
        }
        .xb-agent-head-main {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 14px;
            min-width: 0;
        }
        .xb-agent-toolbar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
        }
        .xb-agent-global-actions {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
        }
        .xb-agent-context-meter {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 86px;
            min-height: 32px;
            padding: 0 12px;
            border: 1px solid rgba(143, 183, 202, 0.26);
            border-radius: 999px;
            background: rgba(143, 183, 202, 0.12);
            color: var(--xb-cyan);
            font-family: var(--xb-font-mono);
            font-size: 11px;
        }
        .xb-agent-global-actions #xb-theme-toggle {
            min-width: 48px;
            color: var(--xb-text-main);
            border-color: rgba(143, 183, 202, 0.24);
            background: rgba(143, 183, 202, 0.12);
        }
        .xb-agent-global-actions #xb-agent-close {
            margin-left: 0;
        }
        .xb-agent-chat-wrap {
            position: relative;
            z-index: 2;
            min-height: 0;
            flex: 1;
            overflow: hidden;
        }
        .xb-agent-main {
            height: 100%;
            min-height: 0;
            overflow: auto;
            overflow-anchor: none;
            display: flex;
            flex-direction: column;
            gap: 18px;
            padding: 26px 30px;
        }
        .xb-agent-log {
            min-height: 0;
            display: flex;
            flex-direction: column;
            gap: 18px;
        }
        .xb-agent-empty,
        .xb-agent-memory {
            color: var(--xb-text-muted);
            font-size: 13px;
            line-height: 1.7;
        }
        .xb-agent-memory {
            padding: 0 0 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.045);
        }
        .xb-agent-history-gate {
            align-self: center;
            color: var(--xb-text-muted);
            font-size: 12px;
            line-height: 1;
            opacity: 0.75;
            padding: 2px 0;
        }
        .xb-actions-panel {
            border: 1px solid rgba(255, 255, 255, 0.055);
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.22);
            color: var(--xb-text-muted);
            font-size: 12px;
        }
        .xb-actions-panel summary {
            padding: 10px 12px;
            cursor: pointer;
            color: var(--xb-cyan);
            font-weight: 700;
            list-style: none;
        }
        .xb-actions-panel summary::-webkit-details-marker { display: none; }
        .xb-actions-panel[open] { padding-bottom: 12px; }
        .xb-actions {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 8px;
            padding: 0 12px;
        }
        .xb-actions button {
            text-align: center;
            color: var(--xb-text-main);
            background: rgba(255, 255, 255, 0.05);
        }
        .xb-msg {
            position: relative;
            max-width: 92%;
            padding: 14px 16px;
            border: 1px solid rgba(255, 255, 255, 0.055);
            border-radius: 14px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.045), transparent);
            color: var(--xb-text-main);
            line-height: 1.65;
        }
        .xb-msg.is-editing {
            width: min(100%, calc(100% - 34px));
            max-width: none;
        }
        .xb-msg-user {
            align-self: flex-end;
            border-bottom-right-radius: 4px;
            background: rgba(255, 255, 255, 0.075);
        }
        .xb-msg-assistant {
            align-self: flex-start;
            border-top-left-radius: 4px;
            border-left: 2px solid var(--xb-indigo);
        }
        .xb-msg.is-error {
            border-color: rgba(244, 63, 94, 0.34);
            color: #fecdd3;
        }
        .xb-msg.is-streaming {
            border-color: rgba(143, 183, 202, 0.34);
        }
        .xb-msg-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 8px;
        }
        .xb-msg-role {
            color: var(--xb-cyan);
            font-family: var(--xb-font-mono);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.10em;
        }
        .xb-msg-user .xb-msg-role { color: var(--xb-gold); }
        .xb-msg-actions {
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        .xb-msg-action {
            width: 24px;
            height: 24px;
            min-width: 24px;
            padding: 0;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.05);
            color: var(--xb-text-muted);
            font-size: 12px;
        }
        .xb-agent-main.is-busy .xb-msg-action:not([data-message-action="cancel-edit"]) {
            opacity: 0.5;
            pointer-events: none;
        }
        .xb-msg-content,
        .xb-assistant-markdown {
            min-width: 0;
            max-width: 100%;
            overflow-wrap: anywhere;
        }
        .xb-assistant-markdown { line-height: 1.72; white-space: normal; }
        .xb-assistant-markdown,
        .xb-assistant-markdown * {
            text-shadow: none !important;
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
            margin: 0 0 0.85em;
        }
        .xb-assistant-markdown p {
            margin: 0;
        }
        .xb-assistant-markdown p + p {
            margin-top: 0.25em;
        }
        .xb-assistant-markdown strong,
        .xb-assistant-markdown b,
        .xb-assistant-markdown h1,
        .xb-assistant-markdown h2,
        .xb-assistant-markdown h3,
        .xb-assistant-markdown h4 {
            color: var(--xb-text-main);
            font-weight: 700;
            text-shadow: none !important;
            filter: none !important;
            -webkit-text-stroke: 0 transparent;
        }
        .xb-assistant-markdown code {
            padding: 0.12em 0.36em;
            border-radius: 7px;
            background: rgba(148, 163, 184, 0.12);
            color: var(--xb-text-main);
            font-family: var(--xb-font-mono);
            font-size: 0.94em;
        }
        .xb-assistant-markdown pre {
            overflow-x: hidden;
            padding: 12px 14px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.30);
            white-space: pre-wrap;
            word-break: break-word;
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
            border: 0;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.10);
            color: var(--xb-text-main);
            cursor: pointer;
            font-size: 12px;
            opacity: 0.82;
        }
        .xb-assistant-codeblock pre { padding-top: 34px; }
        .xb-markdown-html-block {
            display: grid;
            gap: 10px;
            margin: 0 0 0.8em;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.20);
        }
        .xb-markdown-html-head,
        .xb-markdown-html-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        .xb-markdown-html-actions { flex-wrap: wrap; justify-content: flex-end; }
        .xb-markdown-html-title {
            display: grid;
            gap: 2px;
            color: var(--xb-cyan);
            font-size: 12px;
            font-weight: 700;
        }
        .xb-markdown-html-title span {
            color: var(--xb-text-muted);
            font-size: 11px;
            font-weight: 500;
        }
        .xb-markdown-html-actions button {
            padding: 5px 9px;
            border-radius: 999px;
            font-size: 12px;
        }
        .xb-markdown-html-actions button.is-active { background: rgba(143, 183, 202, 0.16); }
        .xb-markdown-html-code {
            max-height: 320px;
            overflow: auto;
            margin: 0;
            padding: 12px 14px;
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.30);
            white-space: pre-wrap;
            word-break: break-all;
            font: 12px/1.55 var(--xb-font-mono);
        }
        .xb-markdown-html-preview {
            width: 100%;
            height: 320px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            border-radius: 10px;
            background: #fff;
        }
        .xb-assistant-markdown pre code {
            padding: 0;
            background: transparent;
        }
        .xb-assistant-markdown blockquote {
            padding-left: 14px;
            border-left: 2px solid rgba(233, 231, 227, 0.22);
            color: var(--xb-text-muted);
        }
        .xb-assistant-markdown table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95em;
        }
        .xb-assistant-markdown th,
        .xb-assistant-markdown td {
            border: 1px solid rgba(255, 255, 255, 0.10);
            padding: 6px 10px;
            text-align: left;
            vertical-align: top;
        }
        .xb-assistant-markdown th {
            background: rgba(255, 255, 255, 0.055);
            font-weight: 600;
        }
        .xb-assistant-markdown a { color: var(--xb-cyan); }
        .xb-assistant-markdown ul,
        .xb-assistant-markdown ol { padding-left: 1.4em; }
        .xb-msg-editor-wrap {
            width: 100%;
            min-width: 0;
        }
        .xb-msg-editor {
            display: block;
            width: 100%;
            min-height: 112px;
            resize: vertical;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 11px 12px;
            outline: none;
            background: rgba(0, 0, 0, 0.28);
            color: var(--xb-text-main);
            font: 13px/1.65 var(--xb-font-ui);
        }
        .xb-thought-details,
        .xb-tool-trace {
            color: var(--xb-text-muted);
            font-size: 12px;
        }
        .xb-thought-details { margin: 4px 0 8px; }
        .xb-thought-details summary,
        .xb-tool-trace summary {
            cursor: pointer;
            list-style: none;
            color: var(--xb-cyan);
            font-weight: 700;
        }
        .xb-thought-details summary::-webkit-details-marker,
        .xb-tool-trace summary::-webkit-details-marker { display: none; }
        .xb-thought-details[open],
        .xb-tool-trace[open] {
            display: grid;
            gap: 7px;
        }
        .xb-thought-block,
        .xb-tool-preface,
        .xb-tool {
            border: 1px solid rgba(255, 255, 255, 0.055);
            border-left: 2px solid var(--xb-cyan);
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.25);
            padding: 9px 11px;
        }
        .xb-thought-label,
        .xb-tool-round-title {
            color: var(--xb-cyan);
            font-family: var(--xb-font-mono);
            font-size: 11px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        .xb-thought-block pre {
            margin: 0;
            white-space: pre-wrap;
            color: var(--xb-text-muted);
            font: 12px/1.55 var(--xb-font-ui);
        }
        .xb-tool-trace {
            border: 0;
            border-radius: 0;
            padding: 0;
            background: transparent;
        }
        .xb-tool-trace summary {
            display: grid;
            grid-template-columns: auto auto 1fr;
            align-items: center;
            gap: 8px;
            padding: 2px 0;
        }
        .xb-tool-trace summary::after {
            content: "";
            height: 1px;
            background: rgba(143, 183, 202, 0.28);
        }
        .xb-tool-fold-indicator::before { content: ">"; }
        .xb-tool-trace[open] .xb-tool-fold-indicator::before { content: "v"; }
        .xb-tool-trace-body {
            display: grid;
            gap: 8px;
        }
        .xb-tool-lazy-note {
            color: var(--xb-text-dim);
            font-family: var(--xb-font-mono);
            font-size: 11px;
        }
        .xb-tool-preface-preview {
            color: var(--xb-text-muted);
            font-size: 12px;
            line-height: 1.6;
            white-space: pre-wrap;
        }
        .xb-tool-round {
            display: grid;
            gap: 8px;
        }
        .xb-tool-round + .xb-tool-round {
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.055);
        }
        .xb-tool {
            border-left-color: var(--xb-text-dim);
            font-family: var(--xb-font-mono);
            font-size: 12px;
        }
        .xb-tool.is-running {
            border-left-color: var(--xb-cyan);
        }
        .xb-tool > .xb-tool-plain-title,
        .xb-tool > .xb-tool-head {
            color: var(--xb-cyan);
            margin-bottom: 5px;
        }
        .xb-tool-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        .xb-tool-head span {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-tool-head em {
            flex: 0 0 auto;
            color: var(--xb-text-muted);
            font-size: 11px;
            font-style: normal;
            font-weight: 600;
        }
        .xb-tool.is-running .xb-tool-head em {
            color: var(--xb-cyan);
        }
        .xb-tool-result {
            display: grid;
            gap: 5px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.055);
        }
        .xb-tool-result .xb-tool-head {
            margin-bottom: 0;
            color: var(--xb-cyan);
        }
        .xb-tool-payload {
            display: grid;
            gap: 6px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.055);
            color: var(--xb-text-muted);
        }
        .xb-tool.has-payload .xb-tool-payload {
            margin-top: 0;
            padding-top: 0;
            border-top: 0;
        }
        .xb-tool-payload-row {
            display: grid;
            gap: 3px;
        }
        .xb-tool-payload-row span {
            color: var(--xb-text-dim);
            font-size: 11px;
            font-weight: 700;
        }
        .xb-tool-payload-row p {
            margin: 0;
            color: var(--xb-text-muted);
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            line-height: 1.55;
        }
        .xb-tool-progress {
            display: grid;
            gap: 6px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.055);
            color: var(--xb-text-muted);
        }
        .xb-tool-progress-row {
            display: grid;
            grid-template-columns: 46px minmax(0, 1fr);
            gap: 8px;
            align-items: start;
            font-size: 11px;
            line-height: 1.45;
        }
        .xb-tool-progress-row span {
            color: var(--xb-cyan);
            font-family: var(--xb-font-mono);
            font-size: 10px;
        }
        .xb-tool-progress-row p {
            margin: 0;
            min-width: 0;
            overflow-wrap: anywhere;
        }
        .xb-tool small,
        .xb-meta {
            color: var(--xb-text-muted);
            font-size: 12px;
            line-height: 1.55;
        }
        .xb-tool-plan {
            display: grid;
            gap: 8px;
        }
        .xb-tool-plan-list {
            display: grid;
            gap: 7px;
        }
        .xb-tool-plan-item {
            display: grid;
            grid-template-columns: 18px minmax(0, 1fr);
            gap: 8px;
            align-items: start;
        }
        .xb-tool-plan-box {
            width: 14px;
            height: 14px;
            margin-top: 2px;
            border: 1px solid rgba(143, 183, 202, 0.55);
            border-radius: 4px;
            color: var(--xb-cyan);
            font: 700 11px/13px var(--xb-font-ui);
            text-align: center;
        }
        .xb-tool-plan-item p {
            min-width: 0;
            margin: 0;
            display: grid;
            gap: 2px;
        }
        .xb-tool-plan-item strong {
            color: var(--xb-text-main);
            font: 600 12px/1.45 var(--xb-font-ui);
            overflow-wrap: anywhere;
        }
        .xb-tool-plan-item em {
            color: var(--xb-text-dim);
            font-style: normal;
            font-weight: 500;
        }
        .xb-tool-plan-item small {
            white-space: pre-wrap;
        }
        .xb-tool-plan-blockers {
            display: grid;
            gap: 6px;
            padding-top: 7px;
            border-top: 1px solid rgba(255, 255, 255, 0.055);
        }
        .xb-tool-plan-blockers > span {
            color: var(--xb-text-dim);
            font-size: 11px;
            font-weight: 700;
        }
        .xb-tool.is-error { border-left-color: var(--xb-danger); }
        .xb-agent-scroll-helpers {
            position: absolute;
            top: 12%;
            right: 10px;
            bottom: 12%;
            z-index: 5;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.25s ease;
        }
        .xb-agent-scroll-helpers.active { opacity: 1; }
        .xb-agent-scroll-btn {
            width: 30px;
            height: 30px;
            padding: 0;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.10);
            color: var(--xb-text-main);
            pointer-events: none;
            opacity: 0;
            transform: scale(0.82) translateX(8px);
            font-size: 11px;
        }
        .xb-agent-scroll-btn.visible {
            opacity: 1;
            pointer-events: auto;
            transform: scale(1) translateX(0);
        }
        .xb-agent-form {
            position: relative;
            z-index: 2;
            height: 144px;
            min-height: 144px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: stretch;
            overflow: hidden;
            padding: 18px 30px 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.025);
            background: linear-gradient(0deg, var(--xb-bg-agent) 74%, transparent);
        }
        .xb-agent-compose-row {
            display: flex;
            align-items: center;
            width: 100%;
            gap: 12px;
            padding: 8px 14px;
            border: 1px solid rgba(255, 255, 255, 0.09);
            border-radius: 14px;
            background: rgba(0, 0, 0, 0.42);
            transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .xb-agent-compose-row:focus-within {
            border-color: rgba(143, 183, 202, 0.46);
            background: rgba(0, 0, 0, 0.58);
        }
        .xb-agent-compose-main {
            flex: 1;
            min-width: 0;
            display: grid;
            gap: 4px;
        }
        #xb-agent-input {
            width: 100%;
            height: 46px;
            min-height: 46px;
            max-height: 68px;
            resize: none;
            overflow-y: hidden;
            border: 0;
            outline: none;
            background: transparent;
            color: var(--xb-text-main);
            font: 14px/1.5 var(--xb-font-ui);
        }
        .xb-compose-hint {
            color: var(--xb-text-dim);
            font-size: 11px;
        }
        .xb-agent-compose-actions {
            width: 40px;
            display: grid;
            place-items: center;
        }
        .xb-agent-form button[type="submit"] {
            width: 38px;
            height: 38px;
            padding: 0;
            border: 0;
            border-radius: 12px;
            background: transparent;
            color: var(--xb-cyan);
            font-size: 20px;
        }
        .xb-agent-form button[type="submit"].is-busy {
            color: var(--xb-danger);
        }

        .xb-distillation-layer {
            position: absolute;
            inset: 0;
            z-index: 70;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 28px;
            color: var(--xb-text-main);
            animation: xb-distillation-enter 0.56s var(--xb-fluid) both;
        }
        .xb-protocol-notice {
            position: absolute;
            left: 50%;
            top: 48%;
            z-index: 68;
            width: min(420px, calc(100% - 42px));
            transform: translate(-50%, -50%);
            display: flex;
            justify-content: center;
            pointer-events: none;
            animation: xb-protocol-notice-float 1.28s var(--xb-fluid) both;
        }
        .xb-protocol-notice span {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            max-width: 100%;
            padding: 10px 16px;
            border: 1px solid rgba(184, 178, 166, 0.16);
            border-radius: 999px;
            background: rgba(28, 31, 40, 0.78);
            box-shadow: 0 18px 38px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(18px) saturate(116%);
            color: var(--xb-text-main);
            font-size: 12px;
            line-height: 1.45;
            text-align: center;
        }
        @keyframes xb-protocol-notice-float {
            0% { opacity: 0; transform: translate(-50%, calc(-50% + 10px)) scale(0.98); }
            18% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            72% { opacity: 1; transform: translate(-50%, calc(-50% - 4px)) scale(1); }
            100% { opacity: 0; transform: translate(-50%, calc(-50% - 12px)) scale(0.98); }
        }
        .xb-distillation-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(10, 12, 18, 0.52);
            backdrop-filter: blur(22px) saturate(112%);
        }
        .xb-distillation-aura {
            position: absolute;
            width: min(260px, 52vw);
            aspect-ratio: 1;
            border-radius: 999px;
            background: radial-gradient(circle, rgba(184, 178, 166, 0.14), transparent 70%);
            filter: blur(42px);
            animation: xb-distillation-breathe 3.8s infinite alternate ease-in-out;
        }
        .xb-distillation-plaque {
            position: relative;
            z-index: 1;
            width: min(520px, 88vw);
            padding: 38px 34px;
            border-top: 1px solid rgba(184, 178, 166, 0.13);
            border-bottom: 1px solid rgba(184, 178, 166, 0.045);
            border-radius: 22px;
            background: rgba(32, 35, 45, 0.58);
            box-shadow: 0 20px 42px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(184, 178, 166, 0.06);
            text-align: center;
            transform: translateY(16px);
            animation: xb-distillation-plaque-enter 0.7s var(--xb-fluid) both;
        }
        .xb-distillation-title {
            margin-bottom: 8px;
            color: var(--xb-text-main);
            font-family: var(--xb-font-serif);
            font-size: 20px;
            font-weight: 400;
            letter-spacing: 0.18em;
        }
        .xb-distillation-status {
            margin-bottom: 28px;
            color: var(--xb-text-muted);
            font-size: 13px;
            letter-spacing: 0.06em;
        }
        .xb-distillation-metrics {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 28px;
            font-family: var(--xb-font-mono);
        }
        .xb-distillation-metric {
            display: grid;
            gap: 8px;
            min-width: 104px;
        }
        .xb-distillation-metric strong {
            color: var(--xb-text-body);
            font-size: 26px;
            font-weight: 300;
            line-height: 1;
            font-variant-numeric: tabular-nums;
        }
        .xb-distillation-metric span {
            color: var(--xb-text-dim);
            font-size: 10px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
        }
        .xb-distillation-divider {
            position: relative;
            width: 42px;
            height: 1px;
            background: rgba(184, 178, 166, 0.13);
            overflow: hidden;
        }
        .xb-distillation-divider::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 12px;
            height: 1px;
            background: rgba(184, 178, 166, 0.55);
            box-shadow: 0 0 10px rgba(184, 178, 166, 0.30);
            animation: xb-distillation-flow 1.45s infinite ease-out;
        }
        .xb-distillation-ripple {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            border: 1px solid var(--xb-gold);
            border-radius: 999px;
            opacity: 0;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }
        .xb-distillation-layer.resolved .xb-distillation-aura {
            background: radial-gradient(circle, rgba(206, 179, 122, 0.18), transparent 70%);
            animation: xb-distillation-resolve-aura 1.1s ease-out both;
        }
        .xb-distillation-layer.resolved .xb-distillation-plaque {
            border-top-color: rgba(206, 179, 122, 0.28);
            box-shadow: 0 20px 42px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(206, 179, 122, 0.14);
        }
        .xb-distillation-layer.resolved .xb-distillation-title,
        .xb-distillation-layer.resolved .xb-distillation-yield {
            color: var(--xb-gold);
            text-shadow: 0 0 18px rgba(206, 179, 122, 0.22);
        }
        .xb-distillation-layer.resolved .xb-distillation-divider::after {
            opacity: 0;
            animation: none;
        }
        .xb-distillation-layer.resolved .xb-distillation-ripple {
            animation: xb-distillation-ripple 1.15s var(--xb-fluid) both;
        }
        @keyframes xb-distillation-enter {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes xb-distillation-plaque-enter {
            from { opacity: 0; transform: translateY(18px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes xb-distillation-breathe {
            0% { opacity: 0.55; transform: scale(0.9); }
            100% { opacity: 0.95; transform: scale(1.18); }
        }
        @keyframes xb-distillation-flow {
            0% { left: -12px; opacity: 0; }
            22% { opacity: 1; }
            100% { left: 42px; opacity: 0; }
        }
        @keyframes xb-distillation-resolve-aura {
            from { opacity: 0.9; transform: scale(1); }
            to { opacity: 0; transform: scale(2); }
        }
        @keyframes xb-distillation-ripple {
            0% { width: 0; height: 0; opacity: 0.72; border-width: 2px; }
            100% { width: min(320px, 72vw); height: min(320px, 72vw); opacity: 0; border-width: 1px; }
        }

        /* Settings and delete dialogs */
        .xb-ebook-settings-overlay,
        .xb-ebook-delete-overlay {
            position: absolute;
            inset: 0;
            z-index: 80;
            display: grid;
            place-items: center;
            padding: 28px;
            background: rgba(0, 0, 0, 0.62);
            backdrop-filter: blur(16px);
        }
        .xb-ebook-settings-dialog,
        .xb-ebook-delete-dialog {
            width: min(820px, 100%);
            max-height: min(88vh, 920px);
            display: grid;
            grid-template-rows: auto minmax(0, 1fr);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.10);
            border-radius: 18px;
            background: rgba(14, 17, 23, 0.96);
            box-shadow: var(--xb-shadow);
        }
        .xb-ebook-delete-dialog {
            width: min(480px, 100%);
            grid-template-rows: auto auto minmax(0, 1fr);
        }
        .xb-ebook-settings-head,
        .xb-ebook-delete-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 18px;
            padding: 22px 24px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .xb-ebook-settings-head h2,
        .xb-ebook-delete-head h2 {
            color: var(--xb-text-main);
            font-size: 22px;
            font-weight: 600;
        }
        .xb-ebook-settings-head p,
        .xb-ebook-delete-note {
            color: var(--xb-text-muted);
            font-size: 13px;
            line-height: 1.65;
        }
        .xb-ebook-settings-head p { margin-top: 6px; }
        .xb-ebook-delete-note {
            margin: 0;
            padding: 13px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .xb-ebook-settings-body {
            min-height: 0;
            overflow: auto;
            padding: 22px 24px 26px;
        }
        .xb-ebook-delete-list {
            min-height: 0;
            overflow: auto;
            display: grid;
            align-content: start;
            gap: 8px;
            padding: 14px;
        }
        .xb-delete-book-item {
            display: grid;
            gap: 4px;
            padding: 13px 14px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.045);
            text-align: left;
        }
        .xb-delete-book-item strong { color: var(--xb-text-main); font-size: 14px; }
        .xb-delete-book-item small { color: var(--xb-text-muted); font-size: 11px; }
        .xb-ebook-export-dialog {
            width: min(540px, 100%);
            grid-template-rows: auto minmax(0, 1fr);
        }
        .xb-ebook-export-list {
            gap: 10px;
            padding: 16px;
        }
        .xb-ebook-export-note {
            margin-top: 6px;
            color: var(--xb-text-muted);
            font-size: 13px;
            line-height: 1.65;
        }
        .xb-ebook-export-book {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
            gap: 14px;
            min-height: 62px;
            padding: 13px 14px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.045);
            text-align: left;
        }
        .xb-ebook-export-book span {
            min-width: 0;
            display: grid;
            gap: 5px;
        }
        .xb-ebook-export-book strong {
            overflow: hidden;
            color: var(--xb-text-main);
            font-size: 14px;
            font-weight: 700;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-ebook-export-book small {
            color: var(--xb-text-muted);
            font-family: var(--xb-font-mono);
            font-size: 11px;
        }
        .xb-ebook-export-book em {
            padding: 5px 10px;
            border: 1px solid var(--xb-line);
            border-radius: 999px;
            color: var(--xb-text-muted);
            font-size: 12px;
            font-style: normal;
        }
        .xb-ebook-export-book:hover:not(:disabled) em {
            border-color: var(--xb-line-strong);
            color: var(--xb-text-main);
        }
        .xb-ebook-transfer-menu-dialog {
            width: min(360px, 100%);
            grid-template-rows: auto auto;
        }
        .xb-book-transfer-menu-list {
            display: grid;
            gap: 10px;
            padding: 16px;
        }
        .xb-book-transfer-menu-choice {
            min-height: 58px;
            display: grid;
            grid-template-columns: 34px minmax(0, 1fr);
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.045);
            color: var(--xb-text-main);
            text-align: left;
            transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
        }
        .xb-book-transfer-menu-choice span {
            width: 34px;
            height: 34px;
            display: grid;
            place-items: center;
            border: 1px solid var(--xb-line);
            border-radius: 50%;
            color: var(--xb-text-muted);
        }
        .xb-book-transfer-menu-choice strong {
            min-width: 0;
            overflow: hidden;
            color: var(--xb-text-main);
            font-size: 14px;
            font-weight: 700;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-book-transfer-menu-choice:hover:not(:disabled),
        .xb-book-transfer-menu-choice:focus-visible:not(:disabled) {
            border-color: var(--xb-line-strong);
            background: rgba(255, 255, 255, 0.075);
            transform: translateY(-1px);
        }
        .xb-book-transfer-menu-choice:hover:not(:disabled) span,
        .xb-book-transfer-menu-choice:focus-visible:not(:disabled) span {
            border-color: var(--xb-line-strong);
            color: var(--xb-text-main);
        }
        .xb-ebook-transfer-overlay {
            position: absolute;
            inset: 0;
            z-index: 120;
            display: grid;
            place-items: center;
            padding: 28px;
            background: rgba(0, 0, 0, 0.44);
            backdrop-filter: blur(12px);
        }
        .xb-ebook-transfer-panel {
            width: min(360px, 100%);
            display: grid;
            justify-items: center;
            gap: 14px;
            padding: 24px 24px 22px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            border-radius: 18px;
            background: rgba(14, 17, 23, 0.94);
            box-shadow: var(--xb-shadow);
            text-align: center;
        }
        .xb-ebook-transfer-orbit {
            position: relative;
            width: 42px;
            height: 42px;
            border: 1px solid var(--xb-line);
            border-radius: 999px;
        }
        .xb-ebook-transfer-orbit::before {
            content: '';
            position: absolute;
            inset: 8px;
            border-radius: inherit;
            border: 1px solid rgba(184, 178, 166, 0.18);
        }
        .xb-ebook-transfer-orbit span {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 7px;
            height: 7px;
            margin: -3.5px 0 0 -3.5px;
            border-radius: 999px;
            background: var(--xb-text-main);
            animation: xb-transfer-orbit 1.35s linear infinite;
        }
        .xb-ebook-transfer-orbit span + span {
            width: 5px;
            height: 5px;
            margin: -2.5px 0 0 -2.5px;
            opacity: 0.58;
            animation-duration: 1.75s;
            animation-direction: reverse;
        }
        .xb-ebook-transfer-copy {
            display: grid;
            gap: 5px;
        }
        .xb-ebook-transfer-copy strong {
            color: var(--xb-text-main);
            font-size: 16px;
            font-weight: 700;
        }
        .xb-ebook-transfer-copy small {
            max-width: 280px;
            overflow: hidden;
            color: var(--xb-text-muted);
            font-size: 12px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .xb-ebook-transfer-copy p {
            color: var(--xb-text-body);
            font-size: 13px;
            line-height: 1.6;
        }
        .xb-ebook-transfer-bar {
            position: relative;
            width: 100%;
            height: 3px;
            overflow: hidden;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.075);
        }
        .xb-ebook-transfer-bar span {
            position: absolute;
            inset: 0 auto 0 0;
            width: 42%;
            border-radius: inherit;
            background: linear-gradient(90deg, transparent, var(--xb-text-main), transparent);
            animation: xb-transfer-bar 1.15s ease-in-out infinite;
        }
        @keyframes xb-transfer-orbit {
            from { transform: rotate(0deg) translateX(17px) rotate(0deg); }
            to { transform: rotate(360deg) translateX(17px) rotate(-360deg); }
        }
        @keyframes xb-transfer-bar {
            from { transform: translateX(-120%); }
            to { transform: translateX(250%); }
        }
        .xb-ebook-settings-body .xb-assistant-config {
            display: grid;
            gap: 12px;
        }
        .xb-ebook-settings-body .xb-assistant-config-tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            padding: 4px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.055);
        }
        .xb-ebook-settings-body .xb-assistant-config-tab {
            min-height: 34px;
            border: 0;
            border-radius: 10px;
            background: transparent;
            color: var(--xb-text-muted);
            font-weight: 700;
        }
        .xb-ebook-settings-body .xb-assistant-config-tab.is-active {
            background: rgba(255, 255, 255, 0.13);
            color: var(--xb-text-main);
        }
        .xb-ebook-settings-body .xb-assistant-config-page {
            display: grid;
            gap: 12px;
        }
        .xb-ebook-settings-body .xb-assistant-config-page[hidden] { display: none; }
        .xb-ebook-settings-body .xb-assistant-config-note,
        .xb-ebook-settings-body .xb-assistant-runtime,
        .xb-ebook-settings-body .xb-assistant-inline-status {
            color: var(--xb-text-muted);
            font-size: 12px;
            line-height: 1.55;
        }
        .xb-ebook-settings-body .xb-assistant-inline-status.is-success { color: #86efac; }
        .xb-ebook-settings-body .xb-assistant-inline-status.is-error { color: #fda4af; }
        .xb-ebook-settings-body .xb-assistant-inline-status.is-loading { color: var(--xb-cyan); }
        .xb-ebook-settings-body .xb-assistant-config label {
            display: grid;
            gap: 6px;
            color: var(--xb-text-main);
            font-size: 13px;
        }
        .xb-ebook-settings-body .xb-assistant-preset-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
            gap: 8px;
        }
        .xb-ebook-settings-body .xb-assistant-preset-field,
        .xb-ebook-settings-body .xb-assistant-config select.xb-assistant-preset-field {
            box-sizing: border-box;
            grid-column: 1;
            min-width: 0;
            width: 100%;
            min-height: 40px;
            height: 40px;
            padding: 0 12px;
            font-size: 14px;
            line-height: 40px;
        }
        .xb-ebook-settings-body .xb-assistant-preset-tools {
            display: grid;
            grid-column: 2;
            grid-template-columns: repeat(4, 40px);
            align-self: stretch;
            gap: 6px;
        }
        .xb-ebook-settings-body .xb-assistant-preset-tools.is-single {
            grid-template-columns: 40px;
        }
        .xb-ebook-settings-body .xb-assistant-icon-button {
            display: grid;
            place-items: center;
            width: 40px;
            min-width: 40px;
            height: 40px;
            min-height: 40px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.26);
            color: var(--xb-text-muted);
            padding: 0;
            line-height: 1;
        }
        .xb-ebook-settings-body .xb-assistant-icon-button svg {
            width: 16px;
            height: 16px;
            stroke: currentColor;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
            fill: none;
            vector-effect: non-scaling-stroke;
        }
        .xb-ebook-settings-body .xb-assistant-icon-button:hover:not(:disabled),
        .xb-ebook-settings-body .xb-assistant-icon-button:focus-visible {
            outline: none;
            border-color: rgba(125, 211, 252, 0.32);
            background: rgba(125, 211, 252, 0.10);
            color: var(--xb-text-main);
        }
        .xb-ebook-settings-body .xb-assistant-icon-button.xb-assistant-save-button.is-success,
        .xb-ebook-settings-body .xb-assistant-icon-button.xb-assistant-save-button.is-error {
            background: rgba(0, 0, 0, 0.26);
            color: var(--xb-text-muted);
            border-color: rgba(255, 255, 255, 0.10);
        }
        .xb-ebook-settings-body .xb-assistant-icon-button.xb-assistant-save-button.is-success {
            background: rgba(34, 197, 94, 0.12);
            color: #bbf7d0;
            border-color: rgba(34, 197, 94, 0.28);
        }
        .xb-ebook-settings-body .xb-assistant-icon-button.xb-assistant-save-button.is-error {
            background: rgba(244, 63, 94, 0.10);
            color: #fecdd3;
            border-color: rgba(244, 63, 94, 0.28);
        }
        .xb-ebook-settings-body .xb-assistant-config input,
        .xb-ebook-settings-body .xb-assistant-config select {
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.10);
            border-radius: 12px;
            padding: 11px 12px;
            outline: none;
            background: rgba(0, 0, 0, 0.26);
            color: var(--xb-text-main);
        }
        .xb-ebook-settings-body .xb-assistant-config select {
            color-scheme: dark;
            background: rgba(15, 18, 24, 0.94);
            color: rgba(244, 247, 255, 0.96);
        }
        .xb-ebook-settings-body .xb-assistant-config select option,
        .xb-ebook-settings-body .xb-assistant-config select optgroup {
            background: #151922;
            color: rgba(244, 247, 255, 0.96);
        }
        .xb-ebook-settings-body .xb-assistant-inline-input,
        .xb-ebook-settings-body .xb-assistant-checkbox-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 8px;
            align-items: center;
        }
        .xb-ebook-settings-body .xb-assistant-grow { min-width: 0; }
        .xb-ebook-settings-body .xb-assistant-model-row { align-items: end; }
        .xb-ebook-settings-body .xb-assistant-temperature-row {
            display: grid;
            grid-template-columns: 96px auto;
            gap: 10px;
            align-items: end;
        }
        .xb-ebook-settings-body .xb-assistant-temperature-row .xb-assistant-checkbox-row {
            display: flex;
            align-items: center;
            gap: 8px;
            min-height: 40px;
        }
        .xb-ebook-settings-body .xb-assistant-temperature-row input[type="number"] {
            width: 96px;
        }
        .xb-ebook-settings-body .xb-assistant-checkbox-control {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--xb-text-main);
        }
        .xb-ebook-settings-body .xb-assistant-checkbox-control input {
            width: 16px;
            height: 16px;
            accent-color: var(--xb-cyan);
        }
        .xb-assistant-save-button.is-success {
            background: rgba(34, 197, 94, 0.12);
            color: #bbf7d0;
            border-color: rgba(34, 197, 94, 0.28);
        }
        .xb-assistant-save-button.is-error {
            background: rgba(244, 63, 94, 0.10);
            color: #fecdd3;
            border-color: rgba(244, 63, 94, 0.28);
        }
        .xb-assistant-save-button.is-saving svg {
            animation: xb-spin 0.8s linear infinite;
        }
        @keyframes xb-spin { to { transform: rotate(360deg); } }

        /* Reader */
        .xb-reader-screen {
            background: #151311;
            color: var(--xb-text-body);
        }
        .xb-reader-backlight {
            position: fixed;
            top: -20vh;
            left: 8vw;
            width: 84vw;
            height: 62vh;
            pointer-events: none;
            background: radial-gradient(ellipse, rgba(233, 231, 227, 0.022), transparent 62%);
            filter: blur(84px);
            animation: xb-reader-pulse 10s infinite alternate ease-in-out;
        }
        @keyframes xb-reader-pulse {
            0% { opacity: 0.55; transform: scale(0.92); }
            100% { opacity: 1; transform: scale(1.08); }
        }
        .xb-reader-edge {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 20;
            width: 62px;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 38px 0;
            border-right: 1px solid rgba(255, 255, 255, 0.025);
            background: rgba(9, 8, 7, 0.55);
            backdrop-filter: blur(8px);
        }
        .xb-reader-edge-actions {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        .xb-reader-edge-button {
            width: 44px;
            height: 44px;
            padding: 0;
            border: 0;
            background: transparent;
            color: var(--xb-text-muted);
            font-size: 20px;
        }
        .xb-reader-tts-toggle.is-active {
            color: var(--xb-text-main);
            background: rgba(143, 180, 189, 0.14);
        }
        .xb-reader-theme-toggle {
            width: auto;
            min-width: 44px;
            height: 32px;
            padding: 0 10px;
            border: 1px solid var(--xb-line);
            border-radius: 999px;
            background: var(--xb-bg-glass);
            color: var(--xb-text-main);
            font-size: 12px;
            font-weight: 700;
        }
        .xb-reader-edge-button:hover:not(:disabled) {
            color: var(--xb-text-main);
            box-shadow: none;
            background: transparent;
        }
        .xb-reader-theme-toggle:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.07);
        }
        .xb-reader-progress {
            position: relative;
            width: 2px;
            height: 112px;
            overflow: hidden;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.07);
        }
        .xb-reader-progress span {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: var(--xb-reader-progress, 0%);
            border-radius: inherit;
            background: var(--xb-text-main);
        }
        .xb-reader-main {
            position: relative;
            z-index: 2;
            height: 100vh;
            margin-left: 62px;
            display: grid;
            grid-template-columns: 320px minmax(0, 1fr);
            overflow: hidden;
        }
        .xb-reader-nav {
            min-width: 0;
            min-height: 0;
            overflow: auto;
            padding: 56px 34px;
            border-right: 1px solid rgba(233, 231, 227, 0.10);
            background: rgba(15, 14, 12, 0.62);
            backdrop-filter: blur(18px);
            box-shadow: 20px 0 48px rgba(0, 0, 0, 0.26);
        }
        .xb-reader-index-toggle,
        .xb-reader-toc-scrim,
        .xb-reader-toc-sheet {
            display: none;
        }
        .xb-reader-toc-scrim {
            position: fixed;
            inset: 0;
            z-index: 55;
            width: 100%;
            height: 100%;
            padding: 0;
            border: 0;
            border-radius: 0;
            background: rgba(0, 0, 0, 0.32);
            backdrop-filter: blur(2px);
        }
        .xb-reader-toc-handle {
            width: 40px;
            height: 4px;
            min-height: 0;
            margin: 16px auto;
            padding: 0;
            border: 0;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.22);
        }
        .xb-reader-index-title {
            margin-bottom: 34px;
            padding-bottom: 18px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.055);
            color: var(--xb-text-muted);
            font-family: var(--xb-font-mono);
            font-size: 12px;
            letter-spacing: 0.22em;
            text-transform: uppercase;
        }
        .xb-reader-chapters {
            display: grid;
            gap: 14px;
        }
        .xb-reader-chapter {
            position: relative;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
            gap: 12px;
            padding: 4px 0 4px 16px;
            border: 0;
            border-radius: 0;
            background: transparent;
            color: var(--xb-text-muted);
            text-align: left;
            font-family: var(--xb-font-serif);
            font-size: 15px;
        }
        .xb-reader-chapter::before {
            content: "";
            position: absolute;
            left: 0;
            top: 50%;
            width: 5px;
            height: 5px;
            border-radius: 999px;
            background: var(--xb-text-main);
            opacity: 0;
            transform: translateY(-50%);
        }
        .xb-reader-chapter:hover:not(:disabled) {
            color: var(--xb-text-body);
            transform: translateX(4px);
            background: transparent;
            box-shadow: none;
        }
        .xb-reader-chapter.is-active {
            color: var(--xb-text-main);
            transform: translateX(8px);
        }
        .xb-reader-chapter.is-active::before { opacity: 1; }
        .xb-reader-chapter small {
            color: inherit;
            font-family: var(--xb-font-mono);
            font-size: 11px;
            opacity: 0.65;
        }
        .xb-reader-paper {
            min-width: 0;
            min-height: 0;
            overflow: auto;
            padding: 11vh max(40px, calc((100% - 760px) / 2)) 18vh;
            background: transparent;
        }
        .xb-reader-head {
            margin-bottom: 72px;
            text-align: center;
        }
        .xb-reader-head h2 {
            margin: 14px 0 12px;
            color: var(--xb-text-main);
            font-family: var(--xb-font-serif);
            font-size: clamp(34px, 5vw, 54px);
            font-weight: 400;
            line-height: 1.15;
        }
        .xb-reader-head p {
            color: var(--xb-text-muted);
            font-family: var(--xb-font-mono);
            font-size: 12px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
        }
        .xb-reader-content {
            position: relative;
            isolation: isolate;
            max-width: 720px;
            margin: 0 auto;
            background: transparent;
        }
        .xb-reader-md {
            margin: 0 0 2rem;
            background: transparent;
            box-shadow: none;
            color: var(--xb-text-body);
            font: 20px/2.05 var(--xb-font-serif);
            font-weight: 400;
            text-shadow: none;
            mix-blend-mode: normal;
        }
        .xb-reader-md > :first-child {
            margin-top: 0;
        }
        .xb-reader-md > :last-child {
            margin-bottom: 0;
        }
        .xb-reader-md p,
        .xb-reader-md li,
        .xb-reader-md blockquote {
            margin: 0 0 2rem;
            background: transparent;
            box-shadow: none;
            filter: none;
            color: var(--xb-text-body);
            font: inherit;
            font-weight: 400;
            text-shadow: none;
            text-align: justify;
            mix-blend-mode: normal;
            white-space: pre-wrap;
        }
        .xb-reader-md h1,
        .xb-reader-md h2,
        .xb-reader-md h3 {
            margin: 0 0 1.35rem;
            color: var(--xb-text-main);
            font-family: var(--xb-font-serif);
            font-weight: 700;
            letter-spacing: 0;
            line-height: 1.45;
            text-shadow: none;
        }
        .xb-reader-md h1 { font-size: 2rem; }
        .xb-reader-md h2 { font-size: 1.65rem; }
        .xb-reader-md h3 { font-size: 1.32rem; }
        .xb-reader-md em {
            color: var(--xb-text-main);
            font-style: italic;
            text-shadow: none;
        }
        .xb-reader-md strong {
            color: var(--xb-text-main);
            font-weight: 700;
            text-shadow: none;
        }
        .xb-reader-md blockquote {
            padding: 0 0 0 1.1rem;
            border-left: 2px solid rgba(143, 183, 202, 0.35);
            color: var(--xb-text-muted);
        }
        .xb-reader-md ul,
        .xb-reader-md ol {
            margin: 0 0 2rem;
            padding-left: 1.6rem;
        }
        .xb-reader-md code {
            color: var(--xb-text-main);
            background: rgba(143, 183, 202, 0.10);
            border-radius: 4px;
            padding: 0.05rem 0.28rem;
            font-family: var(--xb-font-mono);
            font-size: 0.85em;
        }
        .xb-reader-md.xb-reader-drop p:first-of-type::first-letter {
            float: left;
            padding-top: 5px;
            padding-right: 12px;
            color: var(--xb-text-main);
            font-size: 4.3rem;
            line-height: 0.82;
        }
        .xb-reader-image {
            max-width: 780px;
            margin: 2.4rem auto 3rem;
            text-align: center;
        }
        .xb-reader-image img {
            display: block;
            width: auto;
            max-width: 100%;
            max-height: min(72vh, 860px);
            margin: 0 auto;
            border-radius: 8px;
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
        }
        .xb-reader-image-placeholder {
            min-height: 180px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(233, 231, 227, 0.16);
            border-radius: 8px;
            color: var(--xb-text-muted);
            font-family: var(--xb-font-mono);
            font-size: 12px;
        }
        .xb-reader-image.is-failed .xb-reader-image-placeholder {
            border-color: rgba(248, 113, 113, 0.36);
            color: rgba(248, 113, 113, 0.88);
        }
        .xb-reader-foot {
            max-width: 720px;
            margin: 60px auto 0;
            padding-top: 24px;
            border-top: 1px solid rgba(233, 231, 227, 0.14);
            display: flex;
            justify-content: space-between;
            gap: 12px;
        }
        .xb-reader-foot button,
        .xb-reader-empty button {
            min-height: 40px;
            padding: 0 18px;
            border-radius: 999px;
            color: var(--xb-text-main);
        }
        .xb-reader-empty {
            min-height: 100%;
            display: grid;
            place-content: center;
            justify-items: center;
            gap: 14px;
            color: var(--xb-text-muted);
            text-align: center;
        }
        .xb-reader-empty h2 {
            color: var(--xb-text-main);
            font-family: var(--xb-font-serif);
            font-size: 42px;
            font-weight: 400;
        }

        /* Light theme */
        /* Dark clarity pass */
        .theme-dark .xb-ambient-aurora,
        .theme-dark .xb-agent-aurora,
        .theme-dark .xb-reader-backlight {
            display: none;
        }
        .theme-dark .xb-library-book,
        .theme-dark .xb-agent,
        .theme-dark .xb-reader-nav {
            box-shadow: none;
        }
        .theme-dark .xb-workspace-controller,
        .theme-dark .xb-reader-edge,
        .theme-dark .xb-reader-nav {
            backdrop-filter: none;
        }
        .theme-dark .xb-sidebar {
            background: #171922;
            border-right-color: rgba(184, 178, 166, 0.08);
        }
        .theme-dark .xb-studio-workbench,
        .theme-dark .xb-editor {
            background: #1c1f2a;
        }
        .theme-dark .xb-agent {
            background: #20232d;
            border-left-color: rgba(184, 178, 166, 0.09);
        }
        .theme-dark.xb-studio-shell.focus-editor .xb-agent {
            opacity: 1;
        }
        .theme-dark.xb-studio-shell.focus-agent .xb-editor {
            filter: none;
        }
        .theme-dark.xb-studio-shell.focus-agent .xb-agent {
            box-shadow: none;
        }
        .theme-dark .xb-workspace-controller {
            background: #222631;
            border-color: rgba(184, 178, 166, 0.12);
            box-shadow: none;
        }
        .theme-dark .xb-editor-head {
            background: #1c1f2a;
            border-bottom: 1px solid rgba(184, 178, 166, 0.08);
        }
        .theme-dark .xb-agent-head,
        .theme-dark .xb-agent-form,
        .theme-dark .xb-agent-memory,
        .theme-dark .xb-reader-nav,
        .theme-dark .xb-reader-foot {
            border-color: rgba(184, 178, 166, 0.09);
        }
        .theme-dark .xb-agent-form {
            background: #20232d;
        }
        .theme-dark .xb-agent-compose-row,
        .theme-dark .xb-actions-panel,
        .theme-dark .xb-msg,
        .theme-dark .xb-msg-user,
        .theme-dark .xb-actions button,
        .theme-dark .xb-markdown-html-block,
        .theme-dark .xb-msg-editor,
        .theme-dark .xb-thought-block,
        .theme-dark .xb-tool-preface,
        .theme-dark .xb-tool {
            border-color: rgba(184, 178, 166, 0.11);
            background: #282c38;
            color: var(--xb-text-main);
        }
        .theme-dark .xb-tool-payload {
            border-top-color: rgba(184, 178, 166, 0.10);
        }
        .theme-dark .xb-agent-compose-row:focus-within {
            border-color: rgba(143, 180, 189, 0.40);
            background: #2b3040;
            box-shadow: none;
        }
        .theme-dark .xb-msg-assistant {
            border-left-color: var(--xb-indigo);
            background: #272b38;
        }
        .theme-dark .xb-msg-user {
            background: #303342;
        }
        .theme-dark .xb-assistant-markdown pre,
        .theme-dark .xb-markdown-html-code {
            border-color: rgba(184, 178, 166, 0.10);
            background: #191c25;
            color: var(--xb-text-body);
        }
        .theme-dark .xb-assistant-markdown strong,
        .theme-dark .xb-assistant-markdown b,
        .theme-dark .xb-assistant-markdown h1,
        .theme-dark .xb-assistant-markdown h2,
        .theme-dark .xb-assistant-markdown h3,
        .theme-dark .xb-assistant-markdown h4 {
            color: var(--xb-text-main);
            font-weight: 700;
            text-shadow: none !important;
            filter: none !important;
        }
        .theme-dark .xb-assistant-markdown code {
            background: rgba(255, 255, 255, 0.075);
            color: var(--xb-text-main);
        }
        .theme-dark .xb-file.is-active {
            border-color: rgba(184, 178, 166, 0.12);
            background: #242834;
        }
        .theme-dark .xb-library-book {
            border-color: rgba(184, 178, 166, 0.08);
            background: #242834;
        }
        .theme-dark .xb-entry-action {
            border-color: rgba(184, 178, 166, 0.08);
            background: transparent;
        }
        .theme-dark .xb-library-book:hover:not(:disabled) {
            border-color: rgba(184, 178, 166, 0.16);
            box-shadow: none;
        }
        .theme-dark .xb-portal-theme {
            color: var(--xb-text-main);
        }
        .theme-dark .xb-entry-action.is-studio:hover {
            background: radial-gradient(circle at center, rgba(166, 171, 200, 0.08), transparent 58%);
        }
        .theme-dark .xb-entry-action.is-reader:hover {
            background: radial-gradient(circle at center, rgba(233, 231, 227, 0.065), transparent 58%);
        }
        .theme-dark .xb-portal-close,
        .theme-dark .xb-portal-theme {
            color: var(--xb-text-muted);
        }
        .theme-dark .xb-reader-screen,
        .theme-dark.xb-reader-screen {
            background: #171922;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
        }
        .theme-dark .xb-reader-edge,
        .theme-dark .xb-reader-nav {
            background: #1c1f2a;
        }
        .theme-dark .xb-reader-paper {
            background: transparent;
        }
        .theme-dark .xb-reader-md,
        .theme-dark .xb-reader-md p,
        .theme-dark .xb-reader-md li {
            color: #a19b90;
        }
        .theme-dark .xb-reader-head h2,
        .theme-dark .xb-reader-md h1,
        .theme-dark .xb-reader-md h2,
        .theme-dark .xb-reader-md h3,
        .theme-dark .xb-reader-md em,
        .theme-dark .xb-reader-md strong,
        .theme-dark .xb-reader-md code,
        .theme-dark .xb-reader-md.xb-reader-drop p:first-of-type::first-letter {
            color: #b8b2a6;
        }
        .theme-dark .xb-reader-md blockquote {
            color: #928f89;
            border-left-color: rgba(184, 178, 166, 0.26);
        }
        .theme-dark .xb-reader-content,
        .theme-dark .xb-reader-content p,
        .theme-dark .xb-reader-md,
        .theme-dark .xb-reader-md * {
            background: transparent !important;
            box-shadow: none !important;
            filter: none !important;
            mix-blend-mode: normal !important;
            text-shadow: none !important;
        }

        .theme-light .xb-archive-header,
        .theme-light .xb-shelf-container,
        .theme-light .xb-entry-portal,
        .theme-light .xb-studio-workbench,
        .theme-light .xb-editor,
        .theme-light .xb-agent,
        .theme-light .xb-reader-screen,
        .xb-reader-screen.theme-light {
            background: var(--xb-bg-deep);
            color: var(--xb-text-main);
            -webkit-font-smoothing: subpixel-antialiased;
            text-rendering: auto;
        }
        .theme-light .xb-archive-header::after {
            background: linear-gradient(90deg, rgba(87, 70, 48, 0.24), rgba(87, 70, 48, 0.08) 42%, transparent);
        }
        .theme-light .xb-archive-subtitle {
            color: rgba(69, 55, 38, 0.72);
        }
        .theme-light .xb-sidebar {
            border-right-color: rgba(87, 70, 48, 0.12);
            background: #fff3df;
        }
        .theme-light .xb-icon-button,
        .theme-light .xb-glass-button,
        .theme-light .xb-home-actions button {
            border-color: var(--xb-line);
            background: rgba(255, 253, 248, 0.82);
            color: var(--xb-text-main);
        }
        .theme-light .xb-global-actions .xb-glass-button {
            border-color: transparent;
            background: transparent;
            color: var(--xb-text-muted);
        }
        .theme-light .xb-global-actions .xb-glass-button:hover:not(:disabled),
        .theme-light .xb-global-actions .xb-glass-button:focus-visible {
            border-color: var(--xb-line);
            background: rgba(87, 70, 48, 0.055);
            color: var(--xb-text-main);
            box-shadow: none;
        }
        .theme-light .xb-workspace-controller {
            border-color: var(--xb-line);
            background: rgba(255, 253, 248, 0.86);
            box-shadow: 0 8px 22px rgba(87, 70, 48, 0.08);
        }
        .theme-light .xb-layout-button.is-active {
            background: rgba(87, 70, 48, 0.10);
        }
        .theme-light .xb-file.is-active,
        .theme-light .xb-library-empty,
        .theme-light .xb-section-empty,
        .theme-light .xb-actions-panel,
        .theme-light .xb-delete-book-item,
        .theme-light .xb-book-transfer-menu-choice,
        .theme-light .xb-ebook-export-book {
            border-color: var(--xb-line);
            background: rgba(255, 253, 248, 0.78);
        }
        .theme-light .xb-book-transfer-menu-choice span {
            border-color: rgba(87, 70, 48, 0.14);
            background: rgba(87, 70, 48, 0.045);
        }
        .theme-light .xb-ebook-export-book em {
            border-color: rgba(87, 70, 48, 0.14);
            background: rgba(87, 70, 48, 0.045);
        }
        .theme-light .xb-ebook-transfer-overlay {
            background: rgba(87, 70, 48, 0.20);
        }
        .theme-light .xb-ebook-transfer-panel {
            border-color: rgba(87, 70, 48, 0.13);
            background: rgba(255, 253, 248, 0.94);
            box-shadow: 0 18px 44px rgba(87, 70, 48, 0.14);
        }
        .theme-light .xb-ebook-transfer-bar {
            background: rgba(87, 70, 48, 0.08);
        }
        .theme-light .xb-library-book {
            border-color: rgba(87, 70, 48, 0.12);
            background: #fffdf8;
            box-shadow: 0 18px 38px rgba(87, 70, 48, 0.10);
        }
        .theme-light .xb-library-book:hover:not(:disabled) {
            border-color: rgba(87, 70, 48, 0.20);
            box-shadow: 0 24px 46px rgba(87, 70, 48, 0.13);
        }
        .theme-light .xb-shelf-action {
            border-color: rgba(87, 70, 48, 0.18);
            background: rgba(255, 253, 248, 0.62);
            color: var(--xb-text-main);
        }
        .theme-light .xb-shelf-action-ring {
            border-color: rgba(87, 70, 48, 0.18);
            background: rgba(87, 70, 48, 0.055);
        }
        .theme-light .xb-entry-action {
            border-color: rgba(87, 70, 48, 0.12);
            background: transparent;
        }
        .theme-light .xb-entry-action.is-studio:hover:not(:disabled) {
            background: radial-gradient(circle at center, rgba(166, 171, 200, 0.12), transparent 58%);
        }
        .theme-light .xb-entry-action.is-reader:hover:not(:disabled) {
            background: radial-gradient(circle at center, rgba(87, 70, 48, 0.06), transparent 58%);
        }
        .theme-light .xb-portal-close,
        .theme-light .xb-portal-theme {
            border-color: var(--xb-line);
            background: rgba(255, 253, 248, 0.84);
            color: var(--xb-text-main);
        }
        .theme-light .xb-editor {
            background: #fffdf8;
            border-right-color: rgba(87, 70, 48, 0.10);
        }
        .theme-light .xb-agent {
            background: #fff8ec;
            border-left-color: rgba(87, 70, 48, 0.11);
            box-shadow: -12px 0 30px rgba(87, 70, 48, 0.08);
        }
        .theme-light.xb-studio-shell.focus-agent .xb-agent {
            box-shadow: -18px 0 42px rgba(87, 70, 48, 0.12);
        }
        .theme-light .xb-editor-head {
            background: linear-gradient(180deg, rgba(255, 253, 248, 0.96), rgba(255, 253, 248, 0.78), transparent);
        }
        .theme-light .xb-agent-head,
        .theme-light .xb-agent-memory,
        .theme-light .xb-agent-form,
        .theme-light .xb-reader-nav,
        .theme-light .xb-reader-foot,
        .theme-light .xb-ebook-settings-head,
        .theme-light .xb-ebook-delete-head,
        .theme-light .xb-ebook-delete-note {
            border-color: var(--xb-line);
        }
        .theme-light .xb-agent-form {
            background: linear-gradient(0deg, var(--xb-bg-agent) 74%, transparent);
        }
        .theme-light .xb-distillation-backdrop {
            background: rgba(255, 250, 240, 0.58);
        }
        .theme-light .xb-distillation-plaque {
            border-top-color: rgba(87, 70, 48, 0.12);
            border-bottom-color: rgba(87, 70, 48, 0.05);
            background: rgba(255, 253, 248, 0.72);
            box-shadow: 0 20px 42px rgba(87, 70, 48, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.64);
        }
        .theme-light .xb-agent-compose-row,
        .theme-light .xb-msg,
        .theme-light .xb-msg-user,
        .theme-light .xb-actions button,
        .theme-light .xb-markdown-html-block,
        .theme-light .xb-msg-editor,
        .theme-light .xb-thought-block,
        .theme-light .xb-tool-preface,
        .theme-light .xb-tool {
            border-color: var(--xb-line);
            background: #fffdf8;
            color: var(--xb-text-main);
        }
        .theme-light .xb-tool-payload {
            border-top-color: rgba(87, 70, 48, 0.12);
        }
        .theme-light .xb-agent-compose-row:focus-within {
            border-color: rgba(61, 124, 131, 0.42);
            background: #fffdf8;
            box-shadow: 0 0 0 3px rgba(61, 124, 131, 0.10);
        }
        .theme-light .xb-msg-assistant {
            border-left-color: var(--xb-indigo);
        }
        .theme-light .xb-msg.is-error {
            border-color: rgba(182, 77, 93, 0.35);
            color: #8d2338;
            background: #fff5f6;
        }
        .theme-light .xb-assistant-markdown code {
            background: rgba(87, 70, 48, 0.08);
            color: #352d24;
        }
        .theme-light .xb-assistant-markdown pre,
        .theme-light .xb-markdown-html-code {
            border-color: var(--xb-line);
            background: #f8f2e8;
            color: var(--xb-text-main);
        }
        .theme-light .xb-assistant-markdown blockquote {
            border-left-color: rgba(61, 124, 131, 0.28);
            color: var(--xb-text-muted);
        }
        .theme-light .xb-assistant-markdown th,
        .theme-light .xb-assistant-markdown td,
        .theme-light .xb-markdown-html-preview {
            border-color: var(--xb-line);
        }
        .theme-light .xb-assistant-markdown th {
            background: rgba(87, 70, 48, 0.06);
        }
        .theme-light .xb-ebook-settings-overlay,
        .theme-light .xb-ebook-delete-overlay {
            background: rgba(255, 250, 240, 0.78);
        }
        .theme-light .xb-ebook-settings-dialog,
        .theme-light .xb-ebook-delete-dialog {
            border-color: var(--xb-line);
            background: rgba(255, 253, 248, 0.98);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-config-tabs {
            background: rgba(87, 70, 48, 0.06);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-config-tab.is-active {
            background: #fffdf8;
            box-shadow: 0 1px 6px rgba(87, 70, 48, 0.08);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-config input,
        .theme-light .xb-ebook-settings-body .xb-assistant-config select {
            border-color: var(--xb-line);
            background: #fffdf8;
            color: var(--xb-text-main);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-config select {
            color-scheme: light;
            background: #fffdf8;
            color: var(--xb-text-main);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-icon-button {
            border-color: rgba(87, 70, 48, 0.16);
            background: #fffdf8;
            color: rgba(87, 70, 48, 0.62);
            box-shadow: 0 1px 3px rgba(87, 70, 48, 0.06);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-icon-button:hover:not(:disabled),
        .theme-light .xb-ebook-settings-body .xb-assistant-icon-button:focus-visible {
            border-color: rgba(87, 70, 48, 0.24);
            background: rgba(255, 249, 236, 0.98);
            color: var(--xb-text-main);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-icon-button.xb-assistant-save-button.is-success {
            border-color: rgba(34, 139, 72, 0.25);
            background: rgba(34, 139, 72, 0.08);
            color: #176b35;
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-icon-button.xb-assistant-save-button.is-error {
            border-color: rgba(159, 35, 61, 0.22);
            background: rgba(159, 35, 61, 0.07);
            color: #9f233d;
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-config select option,
        .theme-light .xb-ebook-settings-body .xb-assistant-config select optgroup {
            background: #fffdf8;
            color: var(--xb-text-main);
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-inline-status.is-success,
        .theme-light .xb-assistant-save-button.is-success {
            color: #176b35;
        }
        .theme-light .xb-ebook-settings-body .xb-assistant-inline-status.is-error,
        .theme-light .xb-assistant-save-button.is-error {
            color: #9f233d;
        }
        .theme-light .xb-reader-edge {
            border-right-color: rgba(87, 70, 48, 0.12);
            background: rgba(255, 253, 248, 0.84);
        }
        .theme-light .xb-mobile-studio-topbar,
        .theme-light .xb-reader-toc-sheet,
        .theme-light.xb-studio-shell .xb-sidebar {
            border-color: var(--xb-line);
            background: rgba(255, 248, 236, 0.96);
            box-shadow: 0 -18px 46px rgba(87, 70, 48, 0.12);
        }
        .theme-light .xb-mobile-segment,
        .theme-light .xb-mobile-file-picker {
            border-color: var(--xb-line);
            background: rgba(87, 70, 48, 0.055);
            color: var(--xb-text-main);
        }
        .theme-light .xb-mobile-segment-slider {
            background: rgba(87, 70, 48, 0.12);
        }
        .theme-light .xb-reader-nav {
            background: rgba(255, 248, 236, 0.76);
            box-shadow: 20px 0 42px rgba(87, 70, 48, 0.08);
        }
        .theme-light .xb-reader-progress {
            background: rgba(87, 70, 48, 0.14);
        }
        .theme-light .xb-reader-chapter:hover:not(:disabled) {
            color: var(--xb-text-main);
        }
        .theme-light .xb-reader-paper {
            background: transparent;
        }
        .theme-light .xb-reader-content,
        .theme-light .xb-reader-content p,
        .theme-light .xb-reader-md,
        .theme-light .xb-reader-md * {
            background: transparent !important;
            box-shadow: none !important;
            filter: none !important;
            mix-blend-mode: normal !important;
            text-shadow: none !important;
        }

        @media (max-width: 980px) {
            .xb-library-screen {
                grid-template-rows: auto minmax(0, 1fr);
            }
            .xb-archive-header {
                z-index: 30;
                height: auto;
                min-height: 0;
                align-items: flex-start;
                justify-content: space-between;
                flex-direction: row;
                padding: calc(20px + env(safe-area-inset-top, 0px)) 24px 18px;
            }
            .xb-archive-header::after {
                left: 24px;
                right: 24px;
            }
            .xb-archive-header > div:first-child {
                min-width: 0;
            }
            .xb-global-actions {
                flex: 0 0 auto;
                flex-wrap: nowrap;
                justify-content: flex-end;
            }
            .xb-shelf-container {
                height: auto;
                padding: 18px 24px calc(84px + env(safe-area-inset-bottom, 0px));
            }
            .xb-library-grid {
                grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
                gap: 14px;
                align-items: start;
            }
            .xb-library-grid.is-empty {
                padding-top: 14px;
            }
            .xb-library-book {
                min-height: 0;
                aspect-ratio: 3 / 4;
                border-radius: 12px;
                padding: 18px 14px 14px;
                box-shadow: 0 12px 28px rgba(0, 0, 0, 0.20);
            }
            .xb-library-book:hover:not(:disabled) {
                transform: translateY(-3px);
            }
            .xb-library-book strong {
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                font-size: 18px;
                line-height: 1.2;
            }
            .xb-library-book small {
                font-size: 11px;
                line-height: 1.4;
            }
            .xb-library-book-foot {
                gap: 8px;
                padding-top: 10px;
            }
            .xb-library-book-foot small {
                display: none;
            }
            .xb-library-empty {
                min-height: 180px;
                padding: 22px;
                pointer-events: none;
            }
            .xb-shelf-actions {
                display: contents;
            }
            .xb-shelf-action {
                min-height: 0;
                aspect-ratio: 3 / 4;
                padding: 14px 10px;
                border-radius: 12px;
            }
            .xb-shelf-action-ring {
                width: 48px;
                height: 48px;
                font-size: 29px;
            }
            .xb-shelf-action strong {
                font-size: 11px;
            }
            .xb-entry-actions {
                flex-direction: column;
            }
            .xb-entry-action {
                min-height: 50vh;
                border-right: 0;
                border-top: 1px solid rgba(255, 255, 255, 0.045);
            }
            .xb-entry-action strong { font-size: 48px; }
            .xb-entry-action {
                flex: 1;
            }
            .xb-portal-theme {
                top: 22px;
                right: 24px;
            }
            .xb-ebook-shell {
                display: grid;
                grid-template-rows: minmax(178px, 28vh) minmax(0, 1fr);
                overflow: hidden;
            }
            .xb-sidebar {
                position: relative;
                left: auto;
                top: auto;
                bottom: auto;
                width: 100%;
                min-height: 0;
                transform: none;
                flex: none;
                padding: 16px 18px;
                border-right: 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                overflow: hidden;
            }
            .xb-sidebar .xb-title-row h1 {
                font-size: 20px;
            }
            .xb-files {
                grid-auto-flow: column;
                grid-auto-columns: minmax(190px, 240px);
                grid-template-rows: 1fr;
                overflow-x: auto;
                overflow-y: hidden;
            }
            .xb-file-group {
                min-width: 0;
            }
            .xb-studio-workbench {
                width: 200vw;
                height: 100%;
                display: flex;
                transition: transform 0.5s var(--xb-fluid);
            }
            .xb-studio-shell.focus-agent .xb-studio-workbench {
                transform: translateX(-50%);
            }
            .xb-editor,
            .xb-agent,
            .xb-studio-shell.focus-editor .xb-editor,
            .xb-studio-shell.focus-editor .xb-agent,
            .xb-studio-shell.focus-agent .xb-editor,
            .xb-studio-shell.focus-agent .xb-agent {
                width: 100vw;
                min-width: 100vw;
                flex: 0 0 100vw;
                opacity: 1;
                filter: none;
            }
            .xb-studio-shell.balanced .xb-studio-workbench,
            .xb-studio-shell.focus-editor .xb-studio-workbench {
                transform: translateX(0);
            }
            .xb-editor-head {
                padding: 18px 20px 12px;
                align-items: flex-start;
                flex-direction: column;
            }
            .xb-editor-body {
                padding: 10px 22px 22px;
            }
            #xb-editor-text {
                font-size: 16px;
            }
            .xb-agent-head {
                display: block;
                padding: 0;
                border-bottom: none;
                gap: 0;
            }
            .xb-agent-head-main {
                display: none;
            }
            .xb-agent-head .xb-agent-global-actions {
                display: none;
            }
            .xb-agent-toolbar {
                padding: 6px 16px;
            }
            .xb-agent-main {
                padding: 20px 20px;
            }
            .xb-actions {
                grid-template-columns: 1fr 1fr;
            }
            .xb-agent-form {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                height: 122px;
                min-height: 122px;
                padding: 14px 20px 22px;
            }
            .xb-compose-hint {
                display: none;
            }
            .xb-agent {
                padding-bottom: 124px;
            }
            .xb-studio-shell {
                position: relative;
                display: block;
                height: 100%;
                overflow: hidden;
            }
            .xb-mobile-studio-topbar {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                z-index: 70;
                height: calc(64px + env(safe-area-inset-top, 0px));
                padding: calc(10px + env(safe-area-inset-top, 0px)) 12px 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(23, 25, 34, 0.90);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(18px);
            }
            .xb-mobile-agent-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .xb-mobile-agent-action {
                width: 34px;
                height: 34px;
                min-height: 0;
                padding: 0;
                border: 1px solid var(--xb-line);
                border-radius: 999px;
                background: var(--xb-bg-glass);
                color: var(--xb-text-muted);
                font-size: 17px;
                line-height: 1;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                flex-shrink: 0;
            }
            .xb-mobile-topbar-button {
                display: none;
            }
            .xb-mobile-segment {
                position: relative;
                width: min(162px, calc(100vw - 216px));
                display: grid;
                grid-template-columns: 1fr 1fr;
                padding: 4px;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.055);
                box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.28);
                flex-shrink: 0;
            }
            .xb-mobile-segment-slider {
                position: absolute;
                top: 4px;
                bottom: 4px;
                left: 4px;
                width: calc(50% - 4px);
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.14);
                transition: transform 0.42s var(--xb-fluid);
            }
            .xb-studio-shell.focus-agent .xb-mobile-segment-slider {
                transform: translateX(100%);
            }
            .xb-mobile-segment-button {
                position: relative;
                z-index: 1;
                min-height: 30px;
                padding: 0 10px;
                border: 0;
                background: transparent;
                color: var(--xb-text-muted);
                font-size: 13px;
                font-weight: 700;
            }
            .xb-mobile-segment-button.is-active {
                color: var(--xb-text-main);
            }
            .xb-mobile-file-drawer-scrim {
                position: absolute;
                inset: 0;
                z-index: 80;
                width: 100%;
                height: 100%;
                padding: 0;
                border: 0;
                border-radius: 0;
                background: rgba(0, 0, 0, 0.28);
                backdrop-filter: blur(2px);
            }
            .xb-studio-shell.is-file-drawer-open .xb-mobile-file-drawer-scrim {
                display: block;
            }
            .xb-studio-shell .xb-sidebar {
                position: absolute;
                left: 0;
                right: 0;
                top: auto;
                bottom: 0;
                z-index: 90;
                width: 100%;
                height: min(68vh, 620px);
                padding: 0 18px calc(22px + env(safe-area-inset-bottom, 0px));
                border: 0;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 24px 24px 0 0;
                background: rgba(23, 25, 34, 0.96);
                box-shadow: 0 -18px 48px rgba(0, 0, 0, 0.42);
                backdrop-filter: blur(20px);
                transform: translateY(102%);
                transition: transform 0.48s var(--xb-fluid);
            }
            .xb-studio-shell.is-file-drawer-open .xb-sidebar {
                transform: translateY(0);
            }
            .xb-studio-shell.is-file-drawer-open .xb-studio-workbench {
                opacity: 0.54;
                filter: blur(3px);
                pointer-events: none;
            }
            .xb-mobile-drawer-handle {
                width: 40px;
                height: 4px;
                min-height: 0;
                margin: 16px auto 18px;
                padding: 0;
                border: 0;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.22);
            }
            .xb-studio-shell .xb-sidebar .xb-brand {
                display: none;
            }
            .xb-studio-shell .xb-files {
                height: calc(100% - 38px);
                display: flex;
                flex-direction: column;
                gap: 18px;
                overflow-x: hidden;
                overflow-y: auto;
                padding: 0 2px 10px;
            }
            .xb-studio-shell .xb-file-group {
                display: grid;
                gap: 8px;
            }
            .xb-studio-shell .xb-studio-workbench {
                position: absolute;
                left: 0;
                top: calc(64px + env(safe-area-inset-top, 0px));
                width: 200vw;
                height: calc(100% - 64px - env(safe-area-inset-top, 0px));
                display: flex;
                transition: transform 0.5s var(--xb-fluid), opacity 0.32s ease, filter 0.32s ease;
            }
            .xb-studio-shell.focus-agent .xb-studio-workbench {
                transform: translateX(-50%);
            }
            .xb-studio-shell.balanced .xb-studio-workbench,
            .xb-studio-shell.focus-editor .xb-studio-workbench {
                transform: translateX(0);
            }
            .xb-studio-shell .xb-editor,
            .xb-studio-shell .xb-agent,
            .xb-studio-shell.focus-editor .xb-editor,
            .xb-studio-shell.focus-editor .xb-agent,
            .xb-studio-shell.focus-agent .xb-editor,
            .xb-studio-shell.focus-agent .xb-agent {
                width: 100vw;
                min-width: 100vw;
                flex: 0 0 100vw;
                opacity: 1;
                filter: none;
            }
            .xb-editor {
                position: relative;
            }
            .xb-editor-head {
                position: static;
                min-height: 0;
                padding: 0;
                display: block;
                background: transparent;
                border: 0;
            }
            .xb-mobile-file-picker {
                position: absolute;
                top: 10px;
                left: 50%;
                z-index: 15;
                transform: translateX(-50%);
                max-width: calc(100vw - 48px);
                min-height: 34px;
                padding: 0 14px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.05);
                color: var(--xb-text-main);
                font-family: var(--xb-font-mono);
                font-size: 12px;
            }
            .xb-mobile-file-picker strong {
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-weight: 600;
            }
            .xb-mobile-file-picker em {
                color: var(--xb-text-muted);
                font-style: normal;
            }
            .xb-editor-head .xb-path {
                display: none;
            }
            .xb-editor-actions {
                position: absolute;
                left: 10px;
                right: 10px;
                bottom: calc(8px + env(safe-area-inset-bottom, 0px));
                z-index: 16;
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 6px;
            }
            .xb-editor-actions button {
                min-width: 0;
                min-height: 38px;
                width: 100%;
                padding: 0 4px;
                overflow: hidden;
                font-size: clamp(10px, 3vw, 12px);
                line-height: 1;
                text-align: center;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .xb-editor-body {
                padding: 56px 24px calc(64px + env(safe-area-inset-bottom, 0px));
            }
            #xb-editor-text {
                font-size: 16px;
                line-height: 1.82;
            }
            .xb-editor-foot {
                position: absolute;
                left: 18px;
                right: 18px;
                bottom: calc(52px + env(safe-area-inset-bottom, 0px));
                min-height: 0;
                padding: 0;
                pointer-events: none;
            }
            .xb-agent-head {
                min-height: 0;
                display: block;
                gap: 0;
                padding: 0;
            }
            .xb-agent-head-main {
                display: none;
            }
            .xb-agent-toolbar {
                padding: 6px 16px;
            }
            .xb-agent-head .xb-agent-global-actions {
                display: none;
            }
            .xb-agent-head-main {
                display: none;
            }
            .xb-agent-global-actions {
                flex: 0 0 auto;
                gap: 8px;
            }
            .xb-agent-global-actions button {
                min-width: 38px;
                min-height: 32px;
                padding: 0 10px;
            }
            .xb-agent-toolbar {
                width: 100%;
                flex-wrap: nowrap;
                overflow-x: auto;
                justify-content: flex-start;
                padding-bottom: 2px;
            }
            .xb-agent-toolbar button,
            .xb-agent-context-meter {
                flex: 0 0 auto;
            }
            .xb-agent-main {
                padding: 18px 18px;
            }
            .xb-agent-form {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                height: calc(122px + env(safe-area-inset-bottom, 0px));
                min-height: calc(122px + env(safe-area-inset-bottom, 0px));
                padding: 14px 18px calc(20px + env(safe-area-inset-bottom, 0px));
            }
            .xb-agent {
                padding-bottom: calc(122px + env(safe-area-inset-bottom, 0px));
            }
            .xb-reader-edge {
                top: auto;
                bottom: 0;
                width: 100%;
                height: calc(70px + env(safe-area-inset-bottom, 0px));
                flex-direction: row;
                padding: 8px 18px calc(10px + env(safe-area-inset-bottom, 0px));
                border-right: 0;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
            }
            .xb-reader-edge-actions {
                width: 100%;
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                align-items: center;
                justify-items: center;
                gap: 0;
            }
            .xb-reader-index-toggle {
                display: grid;
            }
            .xb-reader-edge-button,
            .xb-reader-theme-toggle {
                width: 44px;
                min-width: 44px;
                height: 44px;
                min-height: 44px;
                display: grid;
                place-items: center;
                padding: 0;
                line-height: 1;
            }
            .xb-reader-progress {
                position: absolute;
                top: -1px;
                left: 0;
                width: 100%;
                height: 2px;
            }
            .xb-reader-progress span {
                width: var(--xb-reader-progress, 0%);
                height: 100% !important;
                right: auto;
            }
            .xb-reader-main {
                margin-left: 0;
                grid-template-columns: 1fr;
            }
            .xb-reader-nav {
                display: none;
            }
            .xb-reader-paper {
                transition: opacity 0.42s var(--xb-fluid), filter 0.42s var(--xb-fluid), transform 0.42s var(--xb-fluid);
            }
            .xb-reader-screen.is-reader-index-open .xb-reader-paper {
                opacity: 0.44;
                filter: blur(3px);
                transform: scale(0.94) translateY(-16px);
                pointer-events: none;
            }
            .xb-reader-screen.is-reader-index-open .xb-reader-toc-scrim {
                display: block;
            }
            .xb-reader-toc-sheet {
                position: fixed;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 60;
                height: min(78vh, 720px);
                display: flex;
                flex-direction: column;
                padding: 0 26px calc(24px + env(safe-area-inset-bottom, 0px));
                border-top: 1px solid rgba(233, 231, 227, 0.14);
                border-radius: 24px 24px 0 0;
                background: rgba(21, 19, 17, 0.96);
                box-shadow: 0 -18px 58px rgba(0, 0, 0, 0.48);
                backdrop-filter: blur(20px);
                transform: translateY(104%);
                transition: transform 0.48s var(--xb-fluid);
            }
            .xb-reader-screen.is-reader-index-open .xb-reader-toc-sheet {
                transform: translateY(0);
            }
            .xb-reader-toc-sheet .xb-reader-index-title {
                margin-bottom: 16px;
                text-align: center;
            }
            .xb-reader-toc-sheet .xb-reader-chapters {
                overflow: auto;
                gap: 18px;
                padding: 4px 4px 12px;
            }
            .xb-reader-paper {
                padding: 72px 24px 120px;
            }
            .xb-reader-head {
                margin-bottom: 42px;
            }
            .xb-reader-content p {
                font-size: 18px;
                line-height: 1.95;
            }
        }

        @media (max-width: 900px) {
            .xb-entry-action strong {
                color: var(--xb-text-main);
                transform: none;
            }
            .xb-entry-action span {
                color: var(--xb-text-main);
                opacity: 0.72;
            }
            .theme-dark .xb-entry-action.is-studio {
                border-color: rgba(166, 171, 200, 0.16);
                background: radial-gradient(circle at center, rgba(166, 171, 200, 0.11), transparent 60%), #2b3040;
            }
            .theme-dark .xb-entry-action.is-reader {
                border-color: rgba(233, 231, 227, 0.12);
                background: radial-gradient(circle at center, rgba(233, 231, 227, 0.08), transparent 60%), #2c2f36;
            }
            .theme-light .xb-entry-action.is-studio {
                border-color: rgba(87, 70, 48, 0.14);
                background: radial-gradient(circle at center, rgba(166, 171, 200, 0.10), transparent 60%), #f7f7fc;
            }
            .theme-light .xb-entry-action.is-reader {
                border-color: rgba(87, 70, 48, 0.14);
                background: radial-gradient(circle at center, rgba(206, 179, 122, 0.10), transparent 60%), #fffaf2;
            }
        }

        @media (max-width: 560px) {
            .xb-archive-header {
                gap: 12px;
                padding-left: 18px;
                padding-right: 18px;
            }
            .xb-archive-header::after {
                left: 18px;
                right: 18px;
            }
            .xb-archive-header h1 {
                overflow: hidden;
                font-size: 28px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .xb-archive-subtitle {
                margin-top: 6px;
                overflow: hidden;
                font-size: 12px;
                letter-spacing: 0.04em;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .xb-archive-meta {
                overflow: hidden;
                margin-top: 8px;
                font-size: 10px;
                text-overflow: ellipsis;
                white-space: nowrap;
                letter-spacing: 0.12em;
            }
            .xb-glass-button,
            .xb-home-actions button {
                min-height: 36px;
                padding: 0 12px;
            }
            .xb-global-actions {
                width: auto;
                display: flex;
                grid-template-columns: none;
                gap: 6px;
            }
            .xb-global-actions button {
                width: 34px;
                min-width: 34px;
                height: 34px;
                min-height: 34px;
                padding: 0;
            }
            .xb-global-actions #xb-close.xb-exit-button {
                width: 34px;
                min-width: 34px;
                height: 34px;
                min-height: 34px;
                padding: 0;
            }
            .xb-global-actions .xb-transfer-button {
                width: 34px;
                min-width: 34px;
                height: 34px;
                min-height: 34px;
                padding: 0;
            }
            .xb-library-grid {
                grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
                gap: 10px;
            }
            .xb-library-book {
                padding: 14px 10px 10px;
                border-radius: 10px;
            }
            .xb-library-book strong { font-size: 15px; }
            .xb-library-book-main {
                gap: 7px;
            }
            .xb-book-spine {
                top: 14px;
                bottom: 14px;
                width: 2px;
            }
            .xb-library-book-foot {
                padding-top: 8px;
            }
            .xb-library-book-foot em {
                padding: 4px 6px;
                font-size: 8px;
                letter-spacing: 0.05em;
            }
            .xb-library-empty {
                min-height: 150px;
                border-radius: 12px;
                padding: 18px;
                font-size: 13px;
            }
            .xb-shelf-actions {
                display: contents;
            }
            .xb-shelf-action {
                min-height: 0;
                padding: 12px 8px;
            }
            .xb-shelf-action-ring {
                width: 42px;
                height: 42px;
                font-size: 26px;
            }
            .xb-shelf-action strong {
                font-size: 10px;
            }
            .xb-entry-action span {
                max-width: 280px;
                font-size: 11px;
            }
            .xb-mobile-studio-topbar {
                padding-left: 12px;
                padding-right: 12px;
            }
            .xb-mobile-segment {
                width: min(140px, calc(100vw - 200px));
            }
            .xb-editor-actions {
                left: 10px;
                right: 10px;
                gap: 6px;
            }
            .xb-editor-actions button {
                padding: 0 6px;
                font-size: 11px;
            }
            .xb-editor-actions {
                width: auto;
            }
            .xb-agent-toolbar {
                width: 100%;
                justify-content: flex-start;
            }
            #xb-agent-close { margin-left: 0; }
            .xb-msg {
                max-width: 100%;
            }
            .xb-msg.is-editing {
                width: 100%;
                max-width: 100%;
            }
            .xb-ebook-settings-overlay {
                padding: 12px;
            }
            .xb-ebook-settings-dialog {
                max-height: calc(100vh - 24px);
                border-radius: 16px;
            }
        }
    `;
    document.head.appendChild(style);
}
