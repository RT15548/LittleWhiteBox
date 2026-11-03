/** One gesture has one owner. A second contact cannot steal an already-held stick. */
export function createJoystick(change: (x: number, y: number) => void, engage: () => void) {
    let owner: { id: number; surface: HTMLElement } | null = null;
    function move(event: PointerEvent) {
        if (!owner || event.pointerId !== owner.id) { return; }
        const box = owner.surface.getBoundingClientRect(), radius = box.width * .36;
        const x = (event.clientX - box.left - box.width / 2) / radius, y = (event.clientY - box.top - box.height / 2) / radius;
        const length = Math.max(1, Math.hypot(x, y)); change(x / length, y / length);
    }
    function clear() {
        const previous = owner; owner = null; change(0, 0);
        if (previous?.surface.hasPointerCapture(previous.id)) { previous.surface.releasePointerCapture(previous.id); }
    }
    return {
        down(event: PointerEvent) {
            if (owner || event.button !== 0) { return; }
            engage();
            const surface = event.currentTarget as HTMLElement;
            surface.setPointerCapture(event.pointerId); owner = { id: event.pointerId, surface }; move(event);
        },
        move,
        release(event: PointerEvent) { if (owner?.id === event.pointerId) { clear(); } },
        clear,
    };
}
