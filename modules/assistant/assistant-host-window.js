const DESKTOP_CHROME_HEIGHT = 36;

export function createAssistantHostWindow(options) {
    const {
        overlayId,
        minimizedStyleId,
        htmlPath,
        onCloseRequest,
    } = options;

    let overlay = null;

    function ensureMinimizedAssistantStyles() {
        if (document.getElementById(minimizedStyleId)) return;

        const style = document.createElement('style');
        style.id = minimizedStyleId;
        style.textContent = `
            @keyframes xbAssistantGlowPulse {
                0%, 100% { box-shadow: 0 4px 12px rgba(56, 189, 248, 0.30), inset 0 0 10px rgba(255, 255, 255, 0.10); }
                50% { box-shadow: 0 4px 20px rgba(56, 189, 248, 0.58), 0 0 0 3px rgba(56, 189, 248, 0.18), inset 0 0 15px rgba(255, 255, 255, 0.18); }
            }
            @keyframes xbAssistantHoverFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
            }
            @keyframes xbAssistantFlamePulse {
                0%, 100% { transform: scaleY(1); opacity: 0.6; }
                50% { transform: scaleY(1.5); opacity: 1; }
            }
            @keyframes xbAssistantBlink {
                0%, 94%, 100% { transform: scaleY(1); }
                97% { transform: scaleY(0.1); }
            }
            @keyframes xbAssistantWaveFast {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-30deg); }
                75% { transform: rotate(30deg); }
            }
            @keyframes xbAssistantZzzFloat {
                0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
                40% { opacity: 1; transform: translate(2px, -3px) scale(1); }
                80% { opacity: 0; transform: translate(4px, -6px) scale(1.2); }
                100% { opacity: 0; transform: translate(4px, -6px) scale(1.2); }
            }
            .xb-assistant-minimized-icon {
                width: 36px;
                height: 36px;
                border: 2px solid rgba(255, 255, 255, 0.86);
                border-radius: 50%;
                padding: 0;
                display: none;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #1e293b, #0f172a);
                cursor: pointer;
                overflow: visible;
                box-sizing: border-box;
                transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.24s ease, background 0.24s ease, box-shadow 0.24s ease;
                animation: xbAssistantGlowPulse 3s ease-in-out infinite;
                pointer-events: auto;
            }
            .xb-assistant-minimized-icon svg {
                display: block;
                overflow: visible;
            }
            .xb-assistant-minimized-icon.is-visible {
                display: inline-flex;
            }
            .xb-assistant-minimized-icon .xb-bot-group { transform-origin: center; }
            .xb-assistant-minimized-icon .xb-flame {
                transform-origin: center top;
                opacity: 0;
            }
            .xb-assistant-minimized-icon .xb-eyes-normal {
                transform-origin: center;
                animation: xbAssistantBlink 4s infinite;
            }
            .xb-assistant-minimized-icon .xb-eyes-happy {
                opacity: 0;
                transition: opacity 0.2s;
            }
            .xb-assistant-minimized-icon .xb-arm-left {
                transform-origin: 7px 11px;
                transition: transform 0.2s;
            }
            .xb-assistant-minimized-icon .xb-zz1 {
                animation: xbAssistantZzzFloat 2.5s linear infinite;
            }
            .xb-assistant-minimized-icon .xb-zz2 {
                animation: xbAssistantZzzFloat 2.5s linear infinite 1.25s;
            }
            .xb-assistant-minimized-icon .xb-antenna-bulb {
                transition: fill 0.3s ease, filter 0.3s ease;
            }
            .xb-assistant-minimized-icon:hover {
                transform: scale(1.12) rotate(-5deg);
                border-color: #38bdf8;
                background: linear-gradient(135deg, #1b3758, #1e40af);
                box-shadow: 0 8px 25px rgba(56, 189, 248, 0.48);
            }
            .xb-assistant-minimized-icon:hover .xb-zz1,
            .xb-assistant-minimized-icon:hover .xb-zz2 {
                display: none;
            }
            .xb-assistant-minimized-icon:hover .xb-eyes-normal {
                opacity: 0;
                animation: none;
            }
            .xb-assistant-minimized-icon:hover .xb-eyes-happy {
                opacity: 1;
            }
            .xb-assistant-minimized-icon:hover .xb-arm-left {
                animation: xbAssistantWaveFast 0.5s ease-in-out infinite;
            }
            .xb-assistant-minimized-icon:hover .xb-antenna-bulb {
                fill: #38bdf8;
                filter: drop-shadow(0 0 2px #38bdf8);
            }
            .xb-assistant-minimized-icon:hover .xb-flame {
                animation-duration: 0.3s;
                transform: scaleY(2);
                fill: #60a5fa;
            }
        `;
        document.head.appendChild(style);
    }

    function isAssistantMobileDevice() {
        const mobileTypes = ['mobile', 'tablet'];
        try {
            const platformType = globalThis.Bowser?.parse?.(navigator.userAgent)?.platform?.type;
            if (mobileTypes.includes(platformType)) {
                return true;
            }
        } catch {
            // Fall back to pointer/screen heuristics below.
        }
        return window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(max-width: 900px)').matches;
    }

    function getAssistantMobileTopOffset() {
        const rawValue = getComputedStyle(document.documentElement).getPropertyValue('--topBarBlockSize').trim();
        const parsedValue = Number.parseFloat(rawValue);
        return Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : 0;
    }

    function getAssistantMobileViewportHeight() {
        return Math.max(240, window.innerHeight - getAssistantMobileTopOffset());
    }

    function getIframe() {
        return overlay?.querySelector('iframe') || null;
    }

    function isOpen() {
        return Boolean(overlay && document.getElementById(overlayId));
    }

    function close() {
        const overlayEl = document.getElementById(overlayId);
        if (overlayEl) {
            overlayEl._cleanup?.();
            overlayEl.remove();
        }
        overlay = null;
    }

    function open() {
        if (document.getElementById(overlayId)) return false;
        ensureMinimizedAssistantStyles();

        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: ${window.innerHeight}px;
            padding: 0;
            box-sizing: border-box;
            z-index: 99999;
            overflow: hidden;
            pointer-events: none;
        `;

        const shell = document.createElement('div');
        shell.style.cssText = `
            position: absolute;
            width: min(1200px, calc(100vw - 200px));
            height: min(800px, calc(100vh - 200px));
            max-width: calc(100vw - 96px);
            max-height: calc(100vh - 96px);
            min-width: 320px;
            min-height: 400px;
            overflow: hidden;
            border-radius: 22px;
            box-shadow: 0 28px 80px rgba(6, 17, 32, 0.22);
            border: 1px solid rgba(255, 255, 255, 0.55);
            background: rgba(238, 243, 248, 0.96);
            pointer-events: auto;
        `;

        const titleBar = document.createElement('div');
        titleBar.setAttribute('aria-label', '拖动小白助手窗口');
        titleBar.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: ${DESKTOP_CHROME_HEIGHT}px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            background: transparent;
            cursor: move;
            user-select: none;
            touch-action: none;
            z-index: 9999;
        `;

        // Subtle drag indicator pill
        const dragPill = document.createElement('div');
        dragPill.style.cssText = `
            width: 48px;
            height: 4px;
            border-radius: 999px;
            background: rgba(20, 32, 51, 0.15);
            margin-top: 4px;
            transition: background 0.2s ease;
        `;
        titleBar.addEventListener('mouseenter', () => dragPill.style.background = 'rgba(20, 32, 51, 0.25)');
        titleBar.addEventListener('mouseleave', () => dragPill.style.background = 'rgba(20, 32, 51, 0.15)');
        titleBar.appendChild(dragPill);

        const minimizedIcon = document.createElement('button');
        minimizedIcon.type = 'button';
        minimizedIcon.className = 'xb-assistant-minimized-icon';
        minimizedIcon.setAttribute('aria-label', '恢复小白助手');
        minimizedIcon.title = '唤醒小白助手';
        minimizedIcon.style.cssText = 'position: absolute; inset: 0; margin: auto; z-index: 10001;';
        minimizedIcon.innerHTML = `
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <g class="xb-bot-group">
                    <path class="xb-flame" d="M10 18 L12 23 L14 18 Z" fill="#38bdf8" />
                    <path d="M6.5 13 C6.5 17 8 19 12 19 C16 19 17.5 17 17.5 13 Z" fill="#94a3b8"/>
                    <path d="M6 12 C6 17 7.5 18 12 18 C16.5 18 18 17 18 12 Z" fill="#f8fafc"/>
                    <rect class="xb-arm-left" x="3" y="10" width="3.5" height="7" rx="1.75" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.5"/>
                    <rect x="17.5" y="10" width="3.5" height="7" rx="1.75" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.5"/>
                    <rect x="4" y="4" width="16" height="11" rx="3.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.5"/>
                    <rect x="5.5" y="5.5" width="13" height="7" rx="2" fill="#0f172a"/>
                    <g class="xb-eyes-normal">
                        <circle cx="9" cy="9" r="1.5" fill="#38bdf8"/>
                        <circle cx="15" cy="9" r="1.5" fill="#38bdf8"/>
                    </g>
                    <g class="xb-eyes-happy">
                        <path d="M7.5 9.5 Q9 7 10.5 9.5" stroke="#38bdf8" stroke-width="1.2" stroke-linecap="round" fill="none"/>
                        <path d="M13.5 9.5 Q15 7 16.5 9.5" stroke="#38bdf8" stroke-width="1.2" stroke-linecap="round" fill="none"/>
                    </g>
                    <line x1="12" y1="4" x2="12" y2="1.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round"/>
                    <circle class="xb-antenna-bulb" cx="12" cy="1" r="1.5" fill="#facc15"/>
                </g>
                <g class="xb-zzz-group">
                    <text x="17" y="5" font-family="Arial" font-size="4" font-weight="bold" fill="#94a3b8" class="xb-zz1">z</text>
                    <text x="19" y="3" font-family="Arial" font-size="5" font-weight="bold" fill="#cbd5e1" class="xb-zz2">Z</text>
                </g>
            </svg>
        `;

        const titleActions = document.createElement('div');
        titleActions.style.cssText = `
            position: absolute;
            top: 4px;
            right: 14px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 6px;
        `;

        const createTitleActionButton = (label, title, isClose = false) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = label;
            button.setAttribute('aria-label', title);
            button.title = title;
            button.style.cssText = `
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                padding: 0;
                border: none;
                border-radius: 999px;
                background: ${isClose ? 'rgba(20, 32, 51, 0.75)' : 'rgba(20, 32, 51, 0.08)'};
                color: ${isClose ? '#fff' : '#203249'};
                cursor: pointer;
                font: 700 12px/1 "Segoe UI Symbol", "Noto Sans Symbols 2", "Microsoft YaHei", sans-serif;
                backdrop-filter: blur(8px);
                transition: all 0.16s ease;
            `;
            button.addEventListener('mouseenter', () => {
                button.style.background = isClose ? 'rgba(20, 32, 51, 0.95)' : 'rgba(20, 32, 51, 0.15)';
                button.style.transform = 'scale(1.05)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.background = isClose ? 'rgba(20, 32, 51, 0.75)' : 'rgba(20, 32, 51, 0.08)';
                button.style.transform = 'scale(1)';
            });
            return button;
        };

        const minimizeButton = createTitleActionButton('─', '最小化');
        const sidebarLayoutButton = createTitleActionButton('⊟', '侧边栏布局');
        const fullscreenButton = createTitleActionButton('⛶', '全屏布局');
        const closeButton = createTitleActionButton('✕', '关闭小白助手', true);
        closeButton.style.font = '600 14px/1 "Microsoft YaHei", sans-serif';
        closeButton.addEventListener('click', () => {
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'xb-assistant:prepare-close',
                    payload: {},
                }, window.location.origin);
                return;
            }
            onCloseRequest?.();
        });
        titleActions.append(minimizeButton, sidebarLayoutButton, fullscreenButton, closeButton);

        const resizeHint = document.createElement('div');
        resizeHint.setAttribute('aria-hidden', 'true');
        resizeHint.title = '可拖动右下角调整大小';
        resizeHint.style.cssText = `
            position: absolute;
            right: 0;
            bottom: 0;
            width: 32px;
            height: 32px;
            z-index: 2;
            border-radius: 0 0 22px 0;
            cursor: nwse-resize;
            touch-action: none;
            background:
                linear-gradient(135deg, transparent 46%, rgba(27, 55, 88, 0.18) 46%, rgba(27, 55, 88, 0.18) 56%, transparent 56%),
                linear-gradient(135deg, transparent 62%, rgba(27, 55, 88, 0.28) 62%, rgba(27, 55, 88, 0.28) 72%, transparent 72%),
                linear-gradient(135deg, transparent 78%, rgba(27, 55, 88, 0.42) 78%);
        `;

        const iframe = document.createElement('iframe');
        iframe.src = htmlPath;
        iframe.style.cssText = `
            position: absolute;
            top: ${DESKTOP_CHROME_HEIGHT}px;
            left: 0;
            display: block;
            width: 100%;
            height: calc(100% - ${DESKTOP_CHROME_HEIGHT}px);
            border: none;
            border-radius: 0 0 22px 22px;
            background: transparent;
        `;

        const resizeMask = document.createElement('div');
        resizeMask.setAttribute('aria-hidden', 'true');
        resizeMask.style.cssText = `
            position: absolute;
            top: ${DESKTOP_CHROME_HEIGHT}px;
            left: 0;
            width: 100%;
            height: calc(100% - ${DESKTOP_CHROME_HEIGHT}px);
            display: none;
            pointer-events: none;
            border-radius: 0 0 22px 22px;
            background:
                linear-gradient(180deg, rgba(248, 250, 253, 0.9), rgba(238, 243, 248, 0.9)),
                repeating-linear-gradient(
                    -45deg,
                    rgba(27, 55, 88, 0.04) 0 12px,
                    rgba(27, 55, 88, 0.08) 12px 24px
                );
        `;

        shell.append(titleBar, titleActions, minimizedIcon, resizeHint, iframe, resizeMask);
        overlay.appendChild(shell);
        document.body.appendChild(overlay);

        const controller = createWindowInteractionController({
            overlay,
            shell,
            titleBar,
            dragPill,
            titleActions,
            minimizedIcon,
            minimizeButton,
            sidebarLayoutButton,
            fullscreenButton,
            closeButton,
            resizeHint,
            iframe,
            resizeMask,
            isAssistantMobileDevice,
            getAssistantMobileTopOffset,
            getAssistantMobileViewportHeight,
            onCloseRequest,
        });
        overlay._cleanup = controller.cleanup;
        controller.initialize();
        return true;
    }

    return {
        open,
        close,
        isOpen,
        getIframe,
    };
}

function createWindowInteractionController(options) {
    const {
        overlay,
        shell,
        titleBar,
        dragPill,
        titleActions,
        minimizedIcon,
        minimizeButton,
        sidebarLayoutButton,
        fullscreenButton,
        closeButton,
        resizeHint,
        iframe,
        resizeMask,
        isAssistantMobileDevice,
        getAssistantMobileTopOffset,
        getAssistantMobileViewportHeight,
    } = options;

    let shellMetrics = {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
    };
    const QUICK_LAYOUT_MODE = Object.freeze({
        FREE: 'free',
        MINIMIZED: 'minimized',
        FULLSCREEN: 'fullscreen',
        SIDEBAR: 'sidebar',
    });
    let quickLayoutMode = QUICK_LAYOUT_MODE.FREE;
    let minimizedRestoreSnapshot = null;
    let layoutFrame = 0;
    let pendingLayout = null;
    let dragState = null;
    let resizeState = null;

    const clampShellPosition = (left, top, width = shellMetrics.width, height = shellMetrics.height) => {
        const maxLeft = Math.max(0, window.innerWidth - width);
        const maxTop = Math.max(0, window.innerHeight - height);
        return {
            left: Math.max(0, Math.min(left, maxLeft)),
            top: Math.max(0, Math.min(top, maxTop)),
        };
    };

    const flushShellLayout = () => {
        layoutFrame = 0;
        if (!pendingLayout) return;
        const next = {
            width: pendingLayout.width ?? shellMetrics.width,
            height: pendingLayout.height ?? shellMetrics.height,
            left: pendingLayout.left ?? shellMetrics.left,
            top: pendingLayout.top ?? shellMetrics.top,
        };
        shellMetrics = next;
        shell.style.width = `${next.width}px`;
        shell.style.height = `${next.height}px`;
        shell.style.left = `${next.left}px`;
        shell.style.top = `${next.top}px`;
        pendingLayout = null;
    };

    const scheduleShellLayout = (patch) => {
        pendingLayout = {
            ...(pendingLayout || {}),
            ...patch,
        };
        if (!layoutFrame) {
            layoutFrame = requestAnimationFrame(flushShellLayout);
        }
    };

    const centerShell = () => {
        const width = shell.getBoundingClientRect().width;
        const height = shell.getBoundingClientRect().height;
        const nextLeft = Math.max(0, Math.round((window.innerWidth - width) / 2));
        const nextTop = Math.max(0, Math.round((window.innerHeight - height) / 2));
        shellMetrics = {
            width,
            height,
            left: nextLeft,
            top: nextTop,
        };
        shell.style.left = `${nextLeft}px`;
        shell.style.top = `${nextTop}px`;
    };

    const applyShellChrome = () => {
        shell.style.background = 'rgba(238, 243, 248, 0.96)';
        shell.style.overflow = 'hidden';
        titleBar.style.height = `${DESKTOP_CHROME_HEIGHT}px`;
        titleBar.style.padding = '0';
        titleBar.style.justifyContent = 'center';
        titleBar.style.background = 'transparent';
        titleBar.style.borderBottom = 'none';
        titleBar.style.cursor = 'move';
        titleBar.style.pointerEvents = 'auto';
        dragPill.style.display = '';
        iframe.style.display = 'block';
        iframe.style.top = `${DESKTOP_CHROME_HEIGHT}px`;
        iframe.style.height = `calc(100% - ${DESKTOP_CHROME_HEIGHT}px)`;
        titleActions.style.display = 'flex';
        titleActions.style.top = '4px';
        minimizedIcon.classList.remove('is-visible');
        resizeHint.style.display = '';
        resizeMask.style.top = `${DESKTOP_CHROME_HEIGHT}px`;
        resizeMask.style.height = `calc(100% - ${DESKTOP_CHROME_HEIGHT}px)`;
        if (quickLayoutMode === QUICK_LAYOUT_MODE.FULLSCREEN) {
            shell.style.borderRadius = '0';
            shell.style.border = 'none';
            shell.style.boxShadow = 'none';
            iframe.style.borderRadius = '0';
            resizeMask.style.borderRadius = '0';
            resizeHint.style.borderRadius = '0';
            return;
        }
        if (quickLayoutMode === QUICK_LAYOUT_MODE.MINIMIZED) {
            shell.style.borderRadius = '0';
            shell.style.border = 'none';
            shell.style.boxShadow = 'none';
            shell.style.background = 'transparent';
            shell.style.overflow = 'visible';
            titleBar.style.height = '100%';
            titleBar.style.padding = '0';
            titleBar.style.justifyContent = 'center';
            titleBar.style.background = 'transparent';
            titleBar.style.borderBottom = 'none';
            titleBar.style.cursor = 'default';
            titleBar.style.pointerEvents = 'none';
            dragPill.style.display = 'none';
            iframe.style.display = 'none';
            titleActions.style.display = 'none';
            minimizedIcon.classList.add('is-visible');
            resizeHint.style.display = 'none';
            resizeMask.style.display = 'none';
            return;
        }
        if (quickLayoutMode === QUICK_LAYOUT_MODE.SIDEBAR) {
            shell.style.borderRadius = '0 22px 22px 0';
            shell.style.border = '1px solid rgba(255, 255, 255, 0.55)';
            shell.style.boxShadow = '0 28px 80px rgba(6, 17, 32, 0.22)';
            iframe.style.borderRadius = '0 0 22px 0';
            resizeMask.style.borderRadius = '0 0 22px 0';
            resizeHint.style.borderRadius = '0 0 22px 0';
            return;
        }
        shell.style.borderRadius = '22px';
        shell.style.border = '1px solid rgba(255, 255, 255, 0.55)';
        shell.style.boxShadow = '0 28px 80px rgba(6, 17, 32, 0.22)';
        iframe.style.borderRadius = '0 0 22px 22px';
        resizeMask.style.borderRadius = '0 0 22px 22px';
        resizeHint.style.borderRadius = '0 0 22px 0';
    };

    const updateQuickLayoutButtons = () => {
        const setButtonState = (button, active) => {
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
            button.setAttribute('data-active', active ? 'true' : 'false');
            button.style.background = active ? 'rgba(20, 32, 51, 0.88)' : 'rgba(255, 255, 255, 0.76)';
            button.style.color = active ? '#fff' : '#203249';
            button.style.boxShadow = active
                ? '0 10px 24px rgba(6, 17, 32, 0.22)'
                : '0 8px 18px rgba(17, 31, 51, 0.10)';
            button.style.transform = '';
        };
        setButtonState(minimizeButton, quickLayoutMode === QUICK_LAYOUT_MODE.MINIMIZED);
        setButtonState(fullscreenButton, quickLayoutMode === QUICK_LAYOUT_MODE.FULLSCREEN);
        setButtonState(sidebarLayoutButton, quickLayoutMode === QUICK_LAYOUT_MODE.SIDEBAR);
    };

    const getShellSnapshot = (mode = quickLayoutMode) => {
        const rect = shell.getBoundingClientRect();
        return {
            mode,
            width: pendingLayout?.width ?? shellMetrics.width ?? rect.width,
            height: pendingLayout?.height ?? shellMetrics.height ?? rect.height,
            left: pendingLayout?.left ?? shellMetrics.left ?? rect.left,
            top: pendingLayout?.top ?? shellMetrics.top ?? rect.top,
        };
    };

    const getMinimizedLayout = () => {
        const width = 36;
        const height = 36;
        const anchor = document.querySelector('.fa-solid.fa-bars.interactable');
        const anchorRect = anchor?.getBoundingClientRect?.();
        if (anchorRect) {
            const left = Math.max(
                8,
                Math.min(
                    Math.round(anchorRect.left + ((anchorRect.width - width) / 2)),
                    window.innerWidth - width - 8,
                ),
            );
            const top = Math.max(8, Math.round(anchorRect.top - height));
            return { width, height, left, top };
        }
        return {
            width,
            height,
            left: 12,
            top: Math.max(8, window.innerHeight - height - 72),
        };
    };

    const getSidebarLayoutWidth = () => {
        const viewportWidth = window.innerWidth;
        const chatRect = document.querySelector('#chat')?.getBoundingClientRect?.();
        const chatLeft = Number.isFinite(chatRect?.left) ? chatRect.left : 0;
        if (chatLeft > 320) {
            return Math.min(viewportWidth, Math.round(chatLeft));
        }
        return Math.max(360, Math.round(viewportWidth * 0.42));
    };

    const applyShellBounds = (width, height, position = null) => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxWidth = Math.max(320, viewportWidth);
        const maxHeight = Math.max(240, viewportHeight);
        const minWidth = quickLayoutMode === QUICK_LAYOUT_MODE.MINIMIZED ? 36 : 220;
        const minHeight = quickLayoutMode === QUICK_LAYOUT_MODE.MINIMIZED ? 36 : 140;
        const nextWidth = Math.max(minWidth, Math.min(width, maxWidth));
        const nextHeight = Math.max(minHeight, Math.min(height, maxHeight));
        shell.style.maxWidth = 'none';
        shell.style.maxHeight = 'none';
        shell.style.minWidth = '0';
        shell.style.minHeight = '0';
        const currentLeft = position?.left ?? pendingLayout?.left ?? shellMetrics.left;
        const currentTop = position?.top ?? pendingLayout?.top ?? shellMetrics.top;
        const clamped = clampShellPosition(currentLeft, currentTop, nextWidth, nextHeight);
        scheduleShellLayout({
            width: nextWidth,
            height: nextHeight,
            left: clamped.left,
            top: clamped.top,
        });
    };

    const applyQuickLayout = (mode) => {
        quickLayoutMode = mode;
        applyShellChrome();
        updateQuickLayoutButtons();
        if (mode === QUICK_LAYOUT_MODE.FULLSCREEN) {
            applyShellBounds(window.innerWidth, window.innerHeight, { left: 0, top: 0 });
            return;
        }
        if (mode === QUICK_LAYOUT_MODE.SIDEBAR) {
            applyShellBounds(getSidebarLayoutWidth(), window.innerHeight, { left: 0, top: 0 });
            return;
        }
        if (mode === QUICK_LAYOUT_MODE.MINIMIZED) {
            const minimizedLayout = getMinimizedLayout();
            applyShellBounds(minimizedLayout.width, minimizedLayout.height, minimizedLayout);
        }
    };

    const exitQuickLayout = () => {
        if (quickLayoutMode === QUICK_LAYOUT_MODE.FREE) return;
        quickLayoutMode = QUICK_LAYOUT_MODE.FREE;
        applyShellChrome();
        updateQuickLayoutButtons();
    };

    const setResizePreviewActive = (active) => {
        iframe.style.visibility = active ? 'hidden' : '';
        iframe.style.pointerEvents = active ? 'none' : '';
        resizeMask.style.display = active ? 'block' : 'none';
    };

    const onDragPointerMove = (event) => {
        if (!dragState) return;
        event.preventDefault();
        const nextLeft = dragState.startLeft + (event.clientX - dragState.startX);
        const nextTop = dragState.startTop + (event.clientY - dragState.startY);
        const clamped = clampShellPosition(nextLeft, nextTop, shellMetrics.width, shellMetrics.height);
        scheduleShellLayout({ left: clamped.left, top: clamped.top });
    };

    const stopDrag = () => {
        dragState = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        shell.style.willChange = '';
        window.removeEventListener('pointermove', onDragPointerMove);
        window.removeEventListener('pointerup', stopDrag);
        window.removeEventListener('pointercancel', stopDrag);
    };

    const onResizePointerMove = (event) => {
        if (!resizeState) return;
        event.preventDefault();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const deltaX = event.clientX - resizeState.startX;
        const deltaY = event.clientY - resizeState.startY;
        let nextWidth = resizeState.startWidth + deltaX;
        let nextHeight = resizeState.startHeight + deltaY;
        let nextLeft = resizeState.startLeft;
        let nextTop = resizeState.startTop;

        if (deltaX > 0 && event.clientX >= (viewportWidth - 2)) {
            const extraWidth = Math.min(
                resizeState.startLeft,
                Math.max(0, viewportWidth - nextWidth),
            );
            nextWidth += extraWidth;
            nextLeft -= extraWidth;
        }
        if (deltaY > 0 && event.clientY >= (viewportHeight - 2)) {
            const extraHeight = Math.min(
                resizeState.startTop,
                Math.max(0, viewportHeight - nextHeight),
            );
            nextHeight += extraHeight;
            nextTop -= extraHeight;
        }

        applyShellBounds(nextWidth, nextHeight, {
            left: nextLeft,
            top: nextTop,
        });
    };

    const stopResize = () => {
        if (layoutFrame) {
            cancelAnimationFrame(layoutFrame);
            flushShellLayout();
        }
        resizeState = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        shell.style.willChange = '';
        setResizePreviewActive(false);
        window.removeEventListener('pointermove', onResizePointerMove);
        window.removeEventListener('pointerup', stopResize);
        window.removeEventListener('pointercancel', stopResize);
    };

    const updateOverlayHeight = () => {
        if (!overlay || overlay.style.display === 'none') return;
        if (isAssistantMobileDevice()) {
            const topOffset = getAssistantMobileTopOffset();
            const viewportHeight = getAssistantMobileViewportHeight();
            overlay.style.top = `${topOffset}px`;
            overlay.style.height = `${viewportHeight}px`;
            shell.style.height = `${viewportHeight}px`;
            shell.style.maxHeight = `${viewportHeight}px`;
            shell.style.minHeight = `${viewportHeight}px`;
            return;
        }
        overlay.style.top = '0';
        overlay.style.height = `${window.innerHeight}px`;
        if (quickLayoutMode !== QUICK_LAYOUT_MODE.FREE) {
            applyQuickLayout(quickLayoutMode);
        } else {
            applyShellBounds(
                shellMetrics.width || shell.getBoundingClientRect().width,
                shellMetrics.height || shell.getBoundingClientRect().height,
            );
        }
    };

    const initializeDesktopMode = () => {
        centerShell();
        applyShellChrome();
        updateQuickLayoutButtons();

        titleBar.addEventListener('pointerdown', (event) => {
            if (isAssistantMobileDevice()) return;
            if (event.target.closest('button')) return;
            if (quickLayoutMode === QUICK_LAYOUT_MODE.MINIMIZED) return;
            event.preventDefault();
            exitQuickLayout();
            const rect = shell.getBoundingClientRect();
            dragState = {
                startX: event.clientX,
                startY: event.clientY,
                startLeft: shellMetrics.left || rect.left,
                startTop: shellMetrics.top || rect.top,
            };
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'move';
            shell.style.willChange = 'left, top';
            window.addEventListener('pointermove', onDragPointerMove);
            window.addEventListener('pointerup', stopDrag);
            window.addEventListener('pointercancel', stopDrag);
        });

        resizeHint.addEventListener('pointerdown', (event) => {
            if (isAssistantMobileDevice()) return;
            event.preventDefault();
            event.stopPropagation();
            exitQuickLayout();
            resizeState = {
                startX: event.clientX,
                startY: event.clientY,
                startWidth: shellMetrics.width || shell.getBoundingClientRect().width,
                startHeight: shellMetrics.height || shell.getBoundingClientRect().height,
                startLeft: shellMetrics.left || shell.getBoundingClientRect().left,
                startTop: shellMetrics.top || shell.getBoundingClientRect().top,
            };
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'nwse-resize';
            shell.style.willChange = 'width, height, left, top';
            setResizePreviewActive(true);
            window.addEventListener('pointermove', onResizePointerMove);
            window.addEventListener('pointerup', stopResize);
            window.addEventListener('pointercancel', stopResize);
        });

        minimizedIcon.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (quickLayoutMode !== QUICK_LAYOUT_MODE.MINIMIZED) return;
            if (minimizedRestoreSnapshot?.mode && minimizedRestoreSnapshot.mode !== QUICK_LAYOUT_MODE.FREE) {
                applyQuickLayout(minimizedRestoreSnapshot.mode);
                return;
            }
            quickLayoutMode = QUICK_LAYOUT_MODE.FREE;
            applyShellChrome();
            updateQuickLayoutButtons();
            applyShellBounds(
                minimizedRestoreSnapshot?.width || 980,
                minimizedRestoreSnapshot?.height || 720,
                {
                    left: minimizedRestoreSnapshot?.left ?? Math.max(0, Math.round((window.innerWidth - 980) / 2)),
                    top: minimizedRestoreSnapshot?.top ?? Math.max(0, Math.round((window.innerHeight - 720) / 2)),
                },
            );
        });

        minimizeButton.addEventListener('click', () => {
            if (isAssistantMobileDevice()) return;
            minimizedRestoreSnapshot = getShellSnapshot(quickLayoutMode);
            applyQuickLayout(QUICK_LAYOUT_MODE.MINIMIZED);
        });
        fullscreenButton.addEventListener('click', () => {
            if (isAssistantMobileDevice()) return;
            applyQuickLayout(QUICK_LAYOUT_MODE.FULLSCREEN);
        });
        sidebarLayoutButton.addEventListener('click', () => {
            if (isAssistantMobileDevice()) return;
            applyQuickLayout(QUICK_LAYOUT_MODE.SIDEBAR);
        });
    };

    const initializeMobileMode = () => {
        const topOffset = getAssistantMobileTopOffset();
        const viewportHeight = getAssistantMobileViewportHeight();
        overlay.style.padding = '0';
        overlay.style.top = `${topOffset}px`;
        overlay.style.height = `${viewportHeight}px`;
        titleBar.style.height = '56px';
        titleBar.style.padding = '0 16px';
        titleBar.style.cursor = 'default';
        titleBar.style.display = 'none';
        titleActions.style.display = 'none';
        shell.style.width = '100%';
        shell.style.height = `${viewportHeight}px`;
        shell.style.maxWidth = '100%';
        shell.style.maxHeight = `${viewportHeight}px`;
        shell.style.minWidth = '100%';
        shell.style.minHeight = `${viewportHeight}px`;
        shell.style.left = '0';
        shell.style.top = '0';
        shell.style.borderRadius = '0';
        shell.style.border = 'none';
        shell.style.boxShadow = 'none';
        shell.style.background = 'rgba(238, 243, 248, 0.98)';
        closeButton.style.display = 'none';
        resizeHint.style.display = 'none';
        iframe.style.top = '0';
        iframe.style.height = '100%';
        iframe.style.borderRadius = '0';
        resizeMask.style.top = '0';
        resizeMask.style.height = '100%';
        resizeMask.style.borderRadius = '0';
    };

    const initialize = () => {
        initializeDesktopMode();
        window.addEventListener('resize', updateOverlayHeight);
        window.visualViewport?.addEventListener('resize', updateOverlayHeight);
        if (isAssistantMobileDevice()) {
            initializeMobileMode();
        }
    };

    const cleanup = () => {
        stopDrag();
        stopResize();
        if (layoutFrame) {
            cancelAnimationFrame(layoutFrame);
            layoutFrame = 0;
            pendingLayout = null;
        }
        window.removeEventListener('resize', updateOverlayHeight);
        window.visualViewport?.removeEventListener('resize', updateOverlayHeight);
    };

    return {
        initialize,
        cleanup,
    };
}
