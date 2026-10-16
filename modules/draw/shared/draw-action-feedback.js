import { DRAW_SLOT_COPY } from './image-record.js';

const GENERATE_BUTTONS = '[data-xb-draw-tag-action], [data-action="retry-image"], '
    + '[data-action="refresh-image"], [data-action="retry-floor-failed"], [data-action="save-tags-retry"]';

// Acknowledgement belongs to the clicked view, not to the image/job record.
// Keep the existing controls and their listeners; the real task owns all later
// progress. A replacement projection must never be overwritten on settlement.
export async function withDrawActionFeedback(target, operation) {
    const buttons = target.matches('button') ? [target] : [...target.querySelectorAll(GENERATE_BUTTONS)];
    if (!target.matches('button') && Number(target.dataset.currentIndex || 0) === 0) {
        const next = target.querySelector('[data-action="nav-next"]');
        if (next) buttons.push(next);
    }
    const restore = buttons.filter(button => !button.disabled).map(button => {
        const children = [...button.childNodes];
        const disabled = button.disabled;
        const attributes = ['aria-busy', 'aria-label', 'title'].map(name => [name, button.getAttribute(name)]);
        const progress = button.ownerDocument.createElement('span');
        progress.className = 'xb-nd-action-progress';
        const spinner = button.ownerDocument.createElement('span');
        spinner.className = 'xb-nd-action-spinner';
        spinner.setAttribute('aria-hidden', 'true');
        progress.append(spinner);
        if (!button.matches('[data-action="refresh-image"], [data-action="nav-next"]')) {
            progress.append(button.ownerDocument.createTextNode(DRAW_SLOT_COPY.preparing));
        }
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        button.setAttribute('aria-label', DRAW_SLOT_COPY.preparing);
        button.title = DRAW_SLOT_COPY.preparing;
        button.replaceChildren(progress);
        return () => {
            if (progress.parentNode !== button) return;
            button.replaceChildren(...children);
            button.disabled = disabled;
            for (const [name, value] of attributes) {
                if (value === null) button.removeAttribute(name);
                else button.setAttribute(name, value);
            }
        };
    });
    try { return await operation(); }
    finally { for (const release of restore) release(); }
}
