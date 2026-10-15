// CSS env() keeps safe-area changes live; visualViewport supplies the visible
// rectangle when the keyboard, browser chrome, zoom or orientation changes.
export function getSafeViewportStyles(topOffset = 0) {
    const viewport = window.visualViewport;
    const top = (viewport?.offsetTop ?? 0) + topOffset;
    const left = viewport?.offsetLeft ?? 0;
    const width = viewport?.width ?? window.innerWidth;
    const height = (viewport?.height ?? window.innerHeight) - topOffset;
    return {
        top: `calc(${top}px + env(safe-area-inset-top, 0px))`,
        left: `calc(${left}px + env(safe-area-inset-left, 0px))`,
        width: `max(0px, calc(${width}px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)))`,
        height: `max(0px, calc(${height}px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)))`,
    };
}

export function observeViewport(update, targetWindow = window) {
    const viewport = targetWindow.visualViewport;
    targetWindow.addEventListener('resize', update);
    targetWindow.addEventListener('orientationchange', update);
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    update();
    return () => {
        targetWindow.removeEventListener('resize', update);
        targetWindow.removeEventListener('orientationchange', update);
        viewport?.removeEventListener('resize', update);
        viewport?.removeEventListener('scroll', update);
    };
}
