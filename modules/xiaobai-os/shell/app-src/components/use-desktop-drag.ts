import { onBeforeUnmount, onMounted, shallowRef, type Ref } from 'vue';

interface DesktopDragOptions {
    root: Ref<HTMLElement | null>;
    editing: Ref<boolean>;
    disabled: () => boolean;
    start: (id: string) => void;
    move: (id: string, index: number) => void;
    finish: (cancelled: boolean) => void;
}

interface Gesture {
    id: string;
    pointerId: number | null;
    touchId: number | null;
    x: number;
    y: number;
    startX: number;
    startY: number;
    width: number;
    offsetX: number;
    offsetY: number;
}

/** Desktop-local gesture lifetime. Native scrolling remains available before a touch hold. */
export function useDesktopDrag(options: DesktopDragOptions) {
    const floating = shallowRef<{ id: string; x: number; y: number; width: number } | null>(null);
    let gesture: Gesture | null = null;
    let hold: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;

    function project(): void {
        const root = options.root.value;
        if (!gesture || !floating.value || !root) { return; }
        const g = gesture;
        floating.value = { id: g.id, x: g.x - g.offsetX, y: g.y - g.offsetY, width: g.width };
        const bounds = root.getBoundingClientRect();
        const edge = 42;
        const scroll = g.y < bounds.top + edge ? -8 : g.y > bounds.bottom - edge ? 8 : 0;
        if (scroll) { root.scrollTop += scroll; }
        const grid = root.querySelector<HTMLElement>('.xiaobai-os-app-grid');
        if (grid) {
            const origin = grid.getBoundingClientRect();
            let nearest = 0;
            let distance = Infinity;
            // Layout offsets ignore FLIP transforms, so animating neighbours do not chase the pointer.
            [...grid.querySelectorAll<HTMLElement>('[data-app-id]')].forEach((tile, index) => {
                const dx = origin.left + tile.offsetLeft + tile.offsetWidth / 2 - g.x;
                const dy = origin.top + tile.offsetTop + tile.offsetHeight / 2 - g.y;
                const nextDistance = dx * dx + dy * dy;
                if (nextDistance < distance) { distance = nextDistance; nearest = index; }
            });
            options.move(g.id, nearest);
        }
    }

    function draw(): void {
        project();
        frame = requestAnimationFrame(draw);
    }

    function lift(): void {
        if (!gesture) { return; }
        clearTimeout(hold);
        options.start(gesture.id);
        if (gesture.pointerId !== null) { options.root.value?.setPointerCapture(gesture.pointerId); }
        floating.value = { id: gesture.id, x: gesture.x - gesture.offsetX, y: gesture.y - gesture.offsetY, width: gesture.width };
        frame = requestAnimationFrame(draw);
    }

    function begin(target: EventTarget | null, x: number, y: number, pointerId: number | null, touchId: number | null): void {
        if (gesture || options.disabled()) { return; }
        const tile = target instanceof Element ? target.closest<HTMLElement>('[data-app-id]') : null;
        if (!tile?.dataset.appId) { return; }
        const rect = tile.getBoundingClientRect();
        gesture = { id: tile.dataset.appId, pointerId, touchId, x, y, startX: x, startY: y,
            width: rect.width, offsetX: x - rect.left, offsetY: y - rect.top };
        window.addEventListener('pointermove', pointerMove);
        window.addEventListener('pointerup', pointerEnd);
        window.addEventListener('pointercancel', cancelPointer);
        window.addEventListener('blur', cancel);
        if (options.editing.value) { lift(); }
        else { hold = setTimeout(lift, 420); }
    }

    function move(x: number, y: number): void {
        if (!gesture) { return; }
        gesture.x = x;
        gesture.y = y;
        if (!floating.value && Math.hypot(x - gesture.startX, y - gesture.startY) > 8) {
            if (gesture.touchId !== null) { end(true); }
            else { lift(); }
        }
    }

    function end(cancelled: boolean): void {
        clearTimeout(hold);
        cancelAnimationFrame(frame);
        // A quick drop can arrive before the next animation frame.
        if (!cancelled && floating.value) { project(); }
        window.removeEventListener('pointermove', pointerMove);
        window.removeEventListener('pointerup', pointerEnd);
        window.removeEventListener('pointercancel', cancelPointer);
        window.removeEventListener('blur', cancel);
        if (gesture?.pointerId !== null && gesture?.pointerId !== undefined
            && options.root.value?.hasPointerCapture(gesture.pointerId)) {
            options.root.value.releasePointerCapture(gesture.pointerId);
        }
        const dragged = !!floating.value;
        gesture = null;
        floating.value = null;
        if (dragged) { options.finish(cancelled); }
    }

    function pointerDown(event: PointerEvent): void {
        if (event.pointerType === 'touch' || event.button !== 0 || !event.isPrimary) { return; }
        begin(event.target, event.clientX, event.clientY, event.pointerId, null);
    }

    function pointerMove(event: PointerEvent): void {
        if (gesture?.pointerId === event.pointerId) { move(event.clientX, event.clientY); }
    }

    function pointerEnd(event: PointerEvent): void {
        if (gesture?.pointerId === event.pointerId) { end(false); }
    }

    function cancelPointer(event: PointerEvent): void {
        if (gesture?.pointerId === event.pointerId) { end(true); }
    }

    function touchStart(event: TouchEvent): void {
        if (event.touches.length !== 1) { end(true); return; }
        const touch = event.changedTouches[0];
        begin(event.target, touch.clientX, touch.clientY, null, touch.identifier);
        if (floating.value && event.cancelable) { event.preventDefault(); }
    }

    function touchMove(event: TouchEvent): void {
        const touch = [...event.touches].find(item => item.identifier === gesture?.touchId);
        if (!touch) { return; }
        if (floating.value && event.cancelable) { event.preventDefault(); }
        move(touch.clientX, touch.clientY);
    }

    function touchEnd(event: TouchEvent): void {
        if ([...event.changedTouches].some(item => item.identifier === gesture?.touchId)) {
            if (floating.value && event.cancelable) { event.preventDefault(); }
            end(false);
        }
    }

    function cancel(): void { end(true); }
    function visibility(): void { if (document.hidden) { cancel(); } }

    let root: HTMLElement | null = null;
    onMounted(() => {
        root = options.root.value;
        root?.addEventListener('touchstart', touchStart, { passive: false });
        root?.addEventListener('touchmove', touchMove, { passive: false });
        root?.addEventListener('touchend', touchEnd, { passive: false });
        root?.addEventListener('touchcancel', cancel);
        document.addEventListener('visibilitychange', visibility);
    });
    onBeforeUnmount(() => {
        cancel();
        root?.removeEventListener('touchstart', touchStart);
        root?.removeEventListener('touchmove', touchMove);
        root?.removeEventListener('touchend', touchEnd);
        root?.removeEventListener('touchcancel', cancel);
        document.removeEventListener('visibilitychange', visibility);
    });
    return { floating, pointerDown, cancel };
}
