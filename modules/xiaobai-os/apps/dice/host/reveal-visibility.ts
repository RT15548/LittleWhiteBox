/** Fresh checks reveal in the chat viewport. History repaint never calls this. */
export function showCheckReveal(card: HTMLElement): boolean {
    if (document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) { return true; }
    const chat = card.closest<HTMLElement>('#chat');
    if (!chat) { return false; }
    for (let parent = card.parentElement; parent && parent !== chat; parent = parent.parentElement) {
        if (parent instanceof HTMLDetailsElement) { parent.open = true; }
    }
    const viewport = chat.getBoundingClientRect();
    const bounds = card.getBoundingClientRect();
    if (!bounds.width || !bounds.height || !viewport.height) { return false; }
    const padding = 12;
    if (bounds.top < viewport.top + padding || bounds.height > viewport.height - 2 * padding) {
        chat.scrollTop += bounds.top - viewport.top - padding;
    } else if (bounds.bottom > viewport.bottom - padding) {
        chat.scrollTop += bounds.bottom - viewport.bottom + padding;
    }
    return true;
}
