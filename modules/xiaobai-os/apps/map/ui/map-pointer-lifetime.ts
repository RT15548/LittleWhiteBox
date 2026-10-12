/** Capture can be lost to the document when a retained map is detached. */
export function trackMapPointerLifetime(target: HTMLElement | SVGSVGElement, cancelPointer: (pointerId: number) => void) {
    const active = new Set<number>();
    const document = target.ownerDocument;
    const endEvents = ['pointerup', 'pointercancel', 'lostpointercapture'] as const;
    function stopListening() {
        for (const name of endEvents) { document.removeEventListener(name, end, true); }
        document.removeEventListener('visibilitychange', visibilityChanged);
    }
    function end(event: PointerEvent) {
        if (!active.delete(event.pointerId)) { return; }
        if (!active.size) { stopListening(); }
        // Local up/cancel is handled by the viewport itself. Lost capture, or an
        // end elsewhere after detachment, must also finish its retained gesture.
        if (event.type === 'lostpointercapture' || !event.composedPath().includes(target)) { cancelPointer(event.pointerId); }
    }
    function cancel() {
        const pointers = [...active];
        active.clear(); stopListening();
        for (const pointerId of pointers) { cancelPointer(pointerId); }
    }
    function visibilityChanged() { if (document.hidden) { cancel(); } }
    function start(event: Event) {
        if (!active.size) {
            for (const name of endEvents) { document.addEventListener(name, end, true); }
            document.addEventListener('visibilitychange', visibilityChanged);
        }
        active.add((event as PointerEvent).pointerId);
    }
    target.addEventListener('pointerdown', start, true);
    return {
        cancel,
        dispose() { target.removeEventListener('pointerdown', start, true); cancel(); },
    };
}
