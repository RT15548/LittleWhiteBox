import { ref } from 'vue';

export function useMobileSheetDrag(onClose: () => void, threshold = 36) {
    const dragging = ref(false);
    let startY: number | null = null;
    let lastDeltaY = 0;

    function resetDrag() {
        dragging.value = false;
        startY = null;
        lastDeltaY = 0;
    }

    function handleSheetHandlePointerDown(event: PointerEvent) {
        if (event.button && event.button !== 0) {return;}
        startY = event.clientY;
        lastDeltaY = 0;
        dragging.value = true;
        (event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
    }

    function handleSheetHandlePointerMove(event: PointerEvent) {
        if (startY === null) {return;}
        lastDeltaY = event.clientY - startY;
        if (lastDeltaY > 0 && event.cancelable) {
            event.preventDefault();
        }
    }

    function handleSheetHandlePointerUp(event: PointerEvent) {
        if (startY === null) {return;}
        (event.currentTarget as HTMLElement | null)?.releasePointerCapture?.(event.pointerId);
        const shouldClose = lastDeltaY >= threshold;
        resetDrag();
        if (shouldClose) {
            onClose();
        }
    }

    function handleSheetHandlePointerCancel(event: PointerEvent) {
        (event.currentTarget as HTMLElement | null)?.releasePointerCapture?.(event.pointerId);
        resetDrag();
    }

    return {
        dragging,
        handleSheetHandlePointerCancel,
        handleSheetHandlePointerDown,
        handleSheetHandlePointerMove,
        handleSheetHandlePointerUp,
    };
}
