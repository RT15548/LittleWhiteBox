// One transient disclosure at a time. Closing a panel never discards its form.
export function createSettingsPopoverGroup(root) {
    let active;
    const dismissOutside = event => { if (active && !active.entry.contains(event.target)) active.close(); };
    root.addEventListener('pointerdown', dismissOutside);
    root.addEventListener('focusin', dismissOutside);
    root.addEventListener('keydown', event => {
        if (event.isComposing || event.key !== 'Escape' || !active) return;
        event.preventDefault();
        event.stopPropagation();
        active.close(true);
    });
    return ({ entry, trigger, panel, closeButton, beforeOpen, focusOnOpen = () => closeButton }) => {
        const close = (returnFocus = false) => {
            panel.hidden = true;
            trigger.setAttribute('aria-expanded', 'false');
            active = undefined;
            if (returnFocus) trigger.focus();
        };
        const open = () => {
            if (panel.hidden) {
                active?.close();
                beforeOpen?.();
                panel.hidden = false;
                trigger.setAttribute('aria-expanded', 'true');
                active = { entry, close };
            }
            focusOnOpen().focus();
        };
        trigger.addEventListener('click', () => panel.hidden ? open() : close(true));
        closeButton.addEventListener('click', () => close(true));
        return open;
    };
}
