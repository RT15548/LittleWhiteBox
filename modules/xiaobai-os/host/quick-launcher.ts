import type { XiaobaiOsAppLauncher } from '../shell/app-launchers.js';

interface QuickLauncherOptions {
    anchor: HTMLElement;
    documentTarget: Document;
    windowTarget: Window;
    getApps: () => readonly XiaobaiOsAppLauncher[];
    getTheme: () => 'light' | 'dark';
    canOpen: () => boolean;
    launch: (appId?: string) => void;
    onVisibilityChange: (visible: boolean) => void;
}

/** Host-only shortcuts. Opening the panel does not create an OS frame or activate an APP. */
export function createQuickLauncher(options: QuickLauncherOptions) {
    const { anchor, documentTarget: doc, windowTarget: win } = options;
    const panel = doc.createElement('div');
    panel.id = 'xiaobaix-os-shortcuts';
    panel.className = 'xiaobaix-os-shortcuts';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '小白 OS 应用');
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('inert', '');
    anchor.setAttribute('aria-haspopup', 'dialog');
    anchor.setAttribute('aria-controls', panel.id);
    anchor.setAttribute('aria-expanded', 'false');

    const toolbar = doc.createElement('div');
    toolbar.className = 'xiaobaix-os-shortcut-toolbar';
    const desktop = doc.createElement('button');
    desktop.type = 'button';
    desktop.className = 'xiaobaix-os-shortcut-desktop';
    desktop.title = '打开桌面';
    desktop.setAttribute('aria-label', '打开桌面');
    const icon = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M14 5h5v5M19 5l-6 6M10 19H5v-5M5 19l6-6');
    icon.append(path);
    desktop.append(icon);
    desktop.addEventListener('click', () => { hide(); options.launch(); });
    toolbar.append(desktop);
    const grid = doc.createElement('div');
    grid.className = 'xiaobaix-os-shortcut-grid';
    panel.append(toolbar, grid);
    doc.body.append(panel);

    let visible = false;
    let positioning = 0;
    const Resize = (win as Window & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
    const observer = Resize ? new Resize(schedulePosition) : null;

    function buttons(): HTMLButtonElement[] {
        return [...grid.querySelectorAll('button'), desktop];
    }

    function refresh(): void {
        const activeId = (doc.activeElement as HTMLElement | null)?.dataset.appId;
        const tiles = options.getApps().slice(0, 6).map(app => {
            const tile = doc.createElement('button');
            tile.type = 'button';
            tile.className = 'xiaobaix-os-shortcut';
            tile.dataset.appId = app.id;
            const image = doc.createElement('img');
            image.src = app.icon;
            image.alt = '';
            image.width = 44;
            image.height = 44;
            image.draggable = false;
            const label = doc.createElement('span');
            label.textContent = app.name;
            tile.append(image, label);
            tile.addEventListener('click', () => { hide(); options.launch(app.id); });
            return tile;
        });
        grid.replaceChildren(...tiles);
        if (visible) {
            position();
            if (activeId) { (tiles.find(tile => tile.dataset.appId === activeId) ?? tiles[0] ?? desktop).focus(); }
        }
    }

    function updateTheme(): void { panel.dataset.theme = options.getTheme(); }

    function position(): void {
        const viewport = win.visualViewport;
        const leftEdge = (viewport?.offsetLeft ?? 0) + 10;
        const topEdge = (viewport?.offsetTop ?? 0) + 10;
        const width = (viewport?.width ?? win.innerWidth) - 20;
        const height = (viewport?.height ?? win.innerHeight) - 20;
        panel.style.maxWidth = `${Math.max(0, width)}px`;
        panel.style.maxHeight = `${Math.max(0, height)}px`;
        const anchorRect = anchor.getBoundingClientRect();
        const panelWidth = panel.offsetWidth;
        const panelHeight = panel.offsetHeight;
        const left = Math.max(leftEdge, Math.min(anchorRect.right - panelWidth, leftEdge + width - panelWidth));
        const above = anchorRect.top - 10 - panelHeight >= topEdge;
        const top = Math.max(topEdge, Math.min(above ? anchorRect.top - 10 - panelHeight : anchorRect.bottom + 10,
            topEdge + height - panelHeight));
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
        panel.dataset.side = above ? 'above' : 'below';
        panel.style.transformOrigin = `${Math.max(0, Math.min(panelWidth, anchorRect.left + anchorRect.width / 2 - left))}px ${above ? 'bottom' : 'top'}`;
    }

    function schedulePosition(): void {
        if (!visible || positioning) { return; }
        positioning = win.requestAnimationFrame(() => { positioning = 0; if (visible) { position(); } });
    }

    function listen(attach: boolean): void {
        const method = attach ? 'addEventListener' : 'removeEventListener';
        doc[method]('pointerdown', outside);
        doc[method]('focusin', outside);
        doc[method]('keydown', keydown as EventListener);
        win[method]('resize', schedulePosition);
        win[method]('scroll', schedulePosition, true);
        win.visualViewport?.[method]('resize', schedulePosition);
        win.visualViewport?.[method]('scroll', schedulePosition);
        if (attach) { observer?.observe(anchor); observer?.observe(panel); }
        else { observer?.disconnect(); }
    }

    function show(focusFirst: boolean): void {
        if (visible || !options.canOpen()) { return; }
        updateTheme();
        position();
        visible = true;
        panel.classList.add('is-open');
        panel.removeAttribute('inert');
        panel.setAttribute('aria-hidden', 'false');
        anchor.setAttribute('aria-expanded', 'true');
        listen(true);
        options.onVisibilityChange(true);
        if (focusFirst) { (buttons()[0] ?? desktop).focus({ preventScroll: true }); }
    }

    function hide(restoreFocus = true): void {
        if (!visible) { return; }
        visible = false;
        listen(false);
        if (positioning) { win.cancelAnimationFrame(positioning); positioning = 0; }
        if (restoreFocus) { anchor.focus({ preventScroll: true }); }
        panel.classList.remove('is-open');
        panel.setAttribute('inert', '');
        panel.setAttribute('aria-hidden', 'true');
        anchor.setAttribute('aria-expanded', 'false');
        options.onVisibilityChange(false);
    }

    function outside(event: Event): void {
        const target = event.target as Node | null;
        if (target && !panel.contains(target) && !anchor.contains(target)) { hide(false); }
    }

    function keydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.preventDefault(); event.stopPropagation(); hide(); return;
        }
        const targets = buttons();
        const index = targets.indexOf(doc.activeElement as HTMLButtonElement);
        if (event.key === 'Tab') {
            // Keep the short panel's tab order predictable even though it is portalled to body.
            event.preventDefault();
            const next = index + (event.shiftKey ? -1 : 1);
            if (next < 0 || next >= targets.length) { hide(); }
            else { targets[next].focus(); }
            return;
        }
        const delta = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 3, ArrowUp: -3 }[event.key];
        if (delta !== undefined) {
            event.preventDefault();
            const next = index < 0 ? (delta > 0 ? 0 : targets.length - 1) : index + delta;
            targets[Math.max(0, Math.min(targets.length - 1, next))].focus();
        }
    }

    function toggle(event: MouseEvent): void { if (visible) { hide(); } else { show(event.detail === 0); } }
    anchor.addEventListener('click', toggle);
    refresh();

    return Object.freeze({
        hide, refresh, updateTheme,
        isOpen: () => visible,
        destroy() {
            hide(false);
            observer?.disconnect();
            anchor.removeEventListener('click', toggle);
            panel.remove();
        },
    });
}
