/** Atlas and scene share one pending-frame policy; their owners supply visibility/lifetime. */
export function demandFrame(draw: () => void, enabled: () => boolean) {
    let frame = 0;
    return {
        request() {
            if (frame || document.hidden || !enabled()) { return; }
            frame = requestAnimationFrame(() => {
                frame = 0;
                if (!document.hidden && enabled()) { draw(); }
            });
        },
        cancel() { if (frame) { cancelAnimationFrame(frame); frame = 0; } },
    };
}
