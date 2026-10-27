// Floating draw controls own these transient measurements; nothing is persisted.
const MARGIN = 8;
const GAP = 8;
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

export function getFloatingViewport(win = window) {
    const view = win.visualViewport;
    const left = view?.offsetLeft ?? 0;
    const top = view?.offsetTop ?? 0;
    const width = view?.width ?? win.innerWidth;
    const height = view?.height ?? win.innerHeight;
    return { left, top, width, height, right: left + width, bottom: top + height };
}

export const FLOATING_POPOVER_STYLES = `
.nd-floating-global[data-menu-side].expanded,
.nd-floating-global[data-menu-side].show-detail { transition: none; }
.nd-floating-global[data-menu-side] .nd-menu,
.nd-floating-global[data-menu-side] .nd-detail {
    box-sizing: border-box;
    min-width: 0;
    right: auto;
    bottom: auto;
    overflow: auto;
    overscroll-behavior: contain;
    transform: none;
}
.nd-floating-global[data-menu-side] .nd-detail::after { display: none; }
.nd-floating-global[data-menu-side="down"] .nd-arrow { transform: rotate(0deg); }
.nd-floating-global[data-menu-side="down"].expanded .nd-arrow { transform: rotate(180deg); }
.nd-floating-global[data-menu-side="up"] .nd-arrow { transform: rotate(180deg); }
.nd-floating-global[data-menu-side="up"].expanded .nd-arrow { transform: rotate(0deg); }
`;

export function mountFloatingPopovers(root, onViewportChange) {
    const win = root.ownerDocument.defaultView;
    const capsule = root.querySelector('.nd-capsule');
    const popovers = [...root.querySelectorAll('.nd-menu, .nd-detail')];
    const jumpButtons = [...root.querySelectorAll('.nd-img-jump')];

    function update() {
        const view = getFloatingViewport(win);
        const origin = root.getBoundingClientRect();
        const anchor = capsule.getBoundingClientRect();
        let top = anchor.top;
        let bottom = anchor.bottom;
        for (const button of jumpButtons) {
            if (!button.offsetHeight) continue;
            const box = button.getBoundingClientRect();
            top = Math.min(top, box.top);
            bottom = Math.max(bottom, box.bottom);
        }
        const above = Math.max(0, top - view.top - MARGIN - GAP);
        const below = Math.max(0, view.bottom - bottom - MARGIN - GAP);
        const down = below >= above;
        root.dataset.menuSide = down ? 'down' : 'up';
        for (const popup of popovers) {
            popup.style.maxWidth = `${Math.max(0, view.width - MARGIN * 2)}px`;
            popup.style.maxHeight = `${Math.max(0, Math.min(view.height - MARGIN * 2, down ? below : above))}px`;
            const left = clamp(anchor.right - popup.offsetWidth, view.left + MARGIN, view.right - MARGIN - popup.offsetWidth);
            const y = clamp(down ? bottom + GAP : top - GAP - popup.offsetHeight,
                view.top + MARGIN, view.bottom - MARGIN - popup.offsetHeight);
            popup.style.left = `${left - origin.left}px`;
            popup.style.top = `${y - origin.top}px`;
        }
    }

    function onViewport() {
        onViewportChange();
        update();
    }

    // Opening, dragging and docking change only the root; popup writes cannot
    // retrigger this observer. ResizeObserver also follows content/width changes.
    const mutations = new win.MutationObserver(update);
    mutations.observe(root, { attributes: true, attributeFilter: ['class', 'style'] });
    const sizes = new win.ResizeObserver(update);
    for (const element of [capsule, ...popovers]) sizes.observe(element);
    root.addEventListener('transitionend', update);
    win.addEventListener('resize', onViewport);
    win.visualViewport?.addEventListener('resize', onViewport);
    win.visualViewport?.addEventListener('scroll', onViewport);
    update();

    return {
        destroy() {
            mutations.disconnect();
            sizes.disconnect();
            root.removeEventListener('transitionend', update);
            win.removeEventListener('resize', onViewport);
            win.visualViewport?.removeEventListener('resize', onViewport);
            win.visualViewport?.removeEventListener('scroll', onViewport);
        },
    };
}
